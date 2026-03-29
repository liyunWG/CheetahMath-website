const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const officeDir = path.join(root, 'migration-data', 'latest', 'office-files');
const workbooksDir = path.join(root, 'migration-data', 'latest', 'workbooks');
fs.mkdirSync(officeDir, { recursive: true });
function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const rows = []; let row = []; let cell = ''; let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]; const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { cell += '"'; i += 1; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(cell); cell = ''; continue; }
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    if (ch !== '\r') cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(r => r.some(v => String(v || '').trim())).map(values => {
    const obj = {}; headers.forEach((h, i) => { obj[h] = values[i] || ''; }); return obj;
  });
}
function esc(v) { return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function colName(index) { let n = index + 1; let out = ''; while (n > 0) { const m = (n - 1) % 26; out = String.fromCharCode(65 + m) + out; n = Math.floor((n - 1) / 26); } return out; }
function buildSharedStrings(sheets) {
  const values = []; const index = new Map();
  const push = (value) => { const key = String(value || ''); if (!key || index.has(key)) return; index.set(key, values.length); values.push(key); };
  sheets.forEach(sheet => { sheet.headers.forEach(push); sheet.rows.forEach(row => sheet.headers.forEach(h => push(row[h]))); });
  return { values, index };
}
function sheetXml(headers, rows, shared) {
  const allRows = [headers, ...rows.map(row => headers.map(h => String(row[h] || '')))];
  const rowXml = allRows.map((values, r) => {
    const cells = values.map((value, c) => {
      if (!value) return '';
      return `<c r="${colName(c)}${r + 1}" t="s"><v>${shared.index.get(value)}</v></c>`;
    }).join('');
    return `<row r="${r + 1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`;
}
function crcTable() { const table = new Array(256); for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); table[n] = c >>> 0; } return table; }
const CRC_TABLE = crcTable();
function crc32(buf) { let crc = 0xffffffff; for (let i = 0; i < buf.length; i += 1) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
function writeZip(outPath, entries) {
  const files = []; let offset = 0; const parts = []; const central = [];
  const now = new Date(); const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2); const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  entries.forEach(({ name, data }) => {
    const nameBuf = Buffer.from(name.replace(/\\/g, '/')); const dataBuf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'); const crc = crc32(dataBuf);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6); local.writeUInt16LE(0, 8); local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(dataBuf.length, 18); local.writeUInt32LE(dataBuf.length, 22); local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    parts.push(local, nameBuf, dataBuf);
    const cd = Buffer.alloc(46); cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0, 8); cd.writeUInt16LE(0, 10); cd.writeUInt16LE(dosTime, 12); cd.writeUInt16LE(dosDate, 14); cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(dataBuf.length, 20); cd.writeUInt32LE(dataBuf.length, 24); cd.writeUInt16LE(nameBuf.length, 28); cd.writeUInt32LE(offset, 42); central.push(cd, nameBuf);
    offset += local.length + nameBuf.length + dataBuf.length;
  });
  const centralBuf = Buffer.concat(central); const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(centralBuf.length, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(outPath, Buffer.concat([...parts, centralBuf, end]));
}
function writeXlsx(filePath, sheets) {
  const shared = buildSharedStrings(sheets);
  const sheetOverrides = sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  const wbSheets = sheets.map((sheet, i) => `<sheet name="${esc(sheet.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('');
  const wbRels = sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('');
  const titles = sheets.map(sheet => `<vt:lpstr>${esc(sheet.name)}</vt:lpstr>`).join('');
  const now = new Date().toISOString();
  const entries = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${sheetOverrides}</Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
    { name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>` },
    { name: 'docProps/app.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Codex</Application><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="${sheets.length}" baseType="lpstr">${titles}</vt:vector></TitlesOfParts></Properties>` },
    { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${wbSheets}</sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${wbRels}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${sheets.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>` },
    { name: 'xl/styles.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` },
    { name: 'xl/sharedStrings.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${shared.values.length}" uniqueCount="${shared.values.length}">${shared.values.map(v => `<si><t xml:space="preserve">${esc(v)}</t></si>`).join('')}</sst>` }
  ];
  sheets.forEach((sheet, i) => entries.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(sheet.headers, sheet.rows, shared) }));
  writeZip(filePath, entries);
}
const columnsArticles = readCsv(path.join(workbooksDir, 'columns-database-latest.articles.csv'));
const columnsBlocks = readCsv(path.join(workbooksDir, 'columns-database-latest.article-blocks.csv'));
const eliteArticles = readCsv(path.join(workbooksDir, 'elite-database-latest.articles.csv'));
const eliteBlocks = readCsv(path.join(workbooksDir, 'elite-database-latest.article-blocks.csv'));
const foundersProfiles = readCsv(path.join(workbooksDir, 'founders-team-latest.profiles.csv'));
const foundersBlocks = readCsv(path.join(workbooksDir, 'founders-team-latest.profile-blocks.csv'));
const advisorsProfiles = readCsv(path.join(workbooksDir, 'advisors-team-latest.profiles.csv'));
const advisorsBlocks = readCsv(path.join(workbooksDir, 'advisors-team-latest.profile-blocks.csv'));
const articleGuide = [
  { 項目: '你之後要改哪裡', 寫法: '只改 articles 和 article_blocks 這兩張工作表', 說明: '不要改 source-snapshots 與 legacy' },
  { 項目: '粗體', 寫法: '在 article_blocks 的 樣式 寫 bold', 說明: '文字放在 文字內容' },
  { 項目: '字體顏色', 寫法: '在 article_blocks 的 顏色 寫 #191970', 說明: '十六進位色碼' },
  { 項目: '換行', 寫法: '同一格直接換行', 說明: '段內換行可直接在 Excel 儲存格內 Enter' },
  { 項目: 'YouTube', 寫法: '區塊類型寫 youtube，附加資料填 YouTube 網址', 說明: '文字內容填影片說明' }
];
const articleExample = [
  { 文章ID: 'sample-001', 順序: '1', 區塊類型: 'heading', 文字內容: '這是標題', 樣式: 'bold', 顏色: '#191970', 附加資料: '', 備註: '深藍粗體標題' },
  { 文章ID: 'sample-001', 順序: '2', 區塊類型: 'paragraph', 文字內容: '第一段第一行\n第一段第二行', 樣式: '', 顏色: '', 附加資料: '', 備註: '同格換行' },
  { 文章ID: 'sample-001', 順序: '3', 區塊類型: 'youtube', 文字內容: '2025 AMC 講座回放', 樣式: '', 顏色: '', 附加資料: 'https://www.youtube.com/watch?v=example', 備註: '嵌入影片' }
];
const profileGuide = [
  { 項目: '你之後要改哪裡', 寫法: '只改 profiles 和 profile_blocks', 說明: '人物一列，介紹多列' },
  { 項目: '粗體', 寫法: '在 profile_blocks 的 樣式 寫 bold', 說明: '常用於職稱段標' },
  { 項目: '換行', 寫法: '同一格直接換行', 說明: '可用於完整介紹' }
];
const indexRows = [
  { 區塊: '文章專欄', 請修改這個檔案: '01-文章專欄-請修改這份.xlsx', 工作表: 'articles, article_blocks', 備註: '新增文章時兩張表都要補' },
  { 區塊: '獵豹菁英', 請修改這個檔案: '02-獵豹菁英-請修改這份.xlsx', 工作表: 'articles, article_blocks', 備註: '新增文章時兩張表都要補' },
  { 區塊: '創辦與經營團隊', 請修改這個檔案: '03-創辦與經營團隊-請修改這份.xlsx', 工作表: 'profiles, profile_blocks', 備註: '新增人物時兩張表都要補' },
  { 區塊: '師資顧問團隊', 請修改這個檔案: '04-師資顧問團隊-請修改這份.xlsx', 工作表: 'profiles, profile_blocks', 備註: '新增人物時兩張表都要補' }
];
writeXlsx(path.join(officeDir, '00-請從這裡開始-維護索引.xlsx'), [
  { name: '維護索引', headers: Object.keys(indexRows[0]), rows: indexRows },
  { name: '規則', headers: ['規則', '內容'], rows: [
    { 規則: '只維護這個資料夾', 內容: 'migration-data\\latest\\office-files' },
    { 規則: '不要改的資料夾', 內容: 'current, archive, legacy, source-snapshots' },
    { 規則: '若要改文章內容', 內容: '改 article_blocks' },
    { 規則: '若要改文章標題、日期、摘要、封面', 內容: '改 articles' }
  ] }
]);
writeXlsx(path.join(officeDir, '01-文章專欄-請修改這份.xlsx'), [
  { name: 'articles', headers: Object.keys(columnsArticles[0]), rows: columnsArticles },
  { name: 'article_blocks', headers: Object.keys(columnsBlocks[0]), rows: columnsBlocks },
  { name: '使用說明', headers: Object.keys(articleGuide[0]), rows: articleGuide },
  { name: '寫法示例', headers: Object.keys(articleExample[0]), rows: articleExample }
]);
writeXlsx(path.join(officeDir, '02-獵豹菁英-請修改這份.xlsx'), [
  { name: 'articles', headers: Object.keys(eliteArticles[0]), rows: eliteArticles },
  { name: 'article_blocks', headers: Object.keys(eliteBlocks[0]), rows: eliteBlocks },
  { name: '使用說明', headers: Object.keys(articleGuide[0]), rows: articleGuide },
  { name: '寫法示例', headers: Object.keys(articleExample[0]), rows: articleExample }
]);
writeXlsx(path.join(officeDir, '03-創辦與經營團隊-請修改這份.xlsx'), [
  { name: 'profiles', headers: Object.keys(foundersProfiles[0]), rows: foundersProfiles },
  { name: 'profile_blocks', headers: Object.keys(foundersBlocks[0]), rows: foundersBlocks },
  { name: '使用說明', headers: Object.keys(profileGuide[0]), rows: profileGuide }
]);
writeXlsx(path.join(officeDir, '04-師資顧問團隊-請修改這份.xlsx'), [
  { name: 'profiles', headers: Object.keys(advisorsProfiles[0]), rows: advisorsProfiles },
  { name: 'profile_blocks', headers: Object.keys(advisorsBlocks[0]), rows: advisorsBlocks },
  { name: '使用說明', headers: Object.keys(profileGuide[0]), rows: profileGuide }
]);
fs.writeFileSync(path.join(officeDir, '00-請先看這裡.txt'), [
  '請之後只修改這個資料夾：',
  officeDir,
  '',
  '依區塊修改：',
  '- 文章專欄：01-文章專欄-請修改這份.xlsx',
  '- 獵豹菁英：02-獵豹菁英-請修改這份.xlsx',
  '- 創辦與經營團隊：03-創辦與經營團隊-請修改這份.xlsx',
  '- 師資顧問團隊：04-師資顧問團隊-請修改這份.xlsx',
  '',
  '先看：00-請從這裡開始-維護索引.xlsx'
].join('\n'), 'utf8');
console.log('office maintenance files built');
  sheets.forEach((sheet, i) => entries.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(sheet.headers, sheet.rows, shared) }));
  writeZip(filePath, entries);
}
const articleGuide = [
  { 項目: '你之後要改哪裡', 寫法: '只改 articles 和 article_blocks 這兩張工作表', 說明: '不要改 source-snapshots 與 legacy' },
  { 項目: '粗體', 寫法: '在 article_blocks 的 樣式 寫 bold', 說明: '文字放在 文字內容' },
  { 項目: '字體顏色', 寫法: '在 article_blocks 的 顏色 寫 #191970', 說明: '十六進位色碼' },
  { 項目: '換行', 寫法: '同一格直接換行', 說明: '段內換行可直接在 Excel 儲存格內 Enter' },
  { 項目: 'YouTube', 寫法: '區塊類型寫 youtube，附加資料填 YouTube 網址', 說明: '文字內容填影片說明' }
];
const articleExample = [
  { 文章ID: 'sample-001', 順序: '1', 區塊類型: 'heading', 文字內容: '這是標題', 樣式: 'bold', 顏色: '#191970', 附加資料: '', 備註: '深藍粗體標題' },
  { 文章ID: 'sample-001', 順序: '2', 區塊類型: 'paragraph', 文字內容: '第一段第一行\n第一段第二行', 樣式: '', 顏色: '', 附加資料: '', 備註: '同格換行' },
  { 文章ID: 'sample-001', 順序: '3', 區塊類型: 'youtube', 文字內容: '2025 AMC 講座回放', 樣式: '', 顏色: '', 附加資料: 'https://www.youtube.com/watch?v=example', 備註: '嵌入影片' }
];
const profileGuide = [
  { 項目: '你之後要改哪裡', 寫法: '只改 profiles 和 profile_blocks', 說明: '人物一列，介紹多列' },
  { 項目: '粗體', 寫法: '在 profile_blocks 的 樣式 寫 bold', 說明: '常用於職稱段標' },
  { 項目: '換行', 寫法: '同一格直接換行', 說明: '可用於完整介紹' }
];
const indexRows = [
  { 區塊: '文章專欄', 請修改這個檔案: '01-文章專欄-請修改這份.xlsx', 工作表: 'articles, article_blocks', 備註: '新增文章時兩張表都要補' },
  { 區塊: '獵豹菁英', 請修改這個檔案: '02-獵豹菁英-請修改這份.xlsx', 工作表: 'articles, article_blocks', 備註: '新增文章時兩張表都要補' },
  { 區塊: '創辦與經營團隊', 請修改這個檔案: '03-創辦與經營團隊-請修改這份.xlsx', 工作表: 'profiles, profile_blocks', 備註: '新增人物時兩張表都要補' },
  { 區塊: '師資顧問團隊', 請修改這個檔案: '04-師資顧問團隊-請修改這份.xlsx', 工作表: 'profiles, profile_blocks', 備註: '新增人物時兩張表都要補' }
];
writeXlsx(path.join(officeDir, '00-請從這裡開始-維護索引.xlsx'), [
  { name: '維護索引', headers: Object.keys(indexRows[0]), rows: indexRows },
  { name: '規則', headers: ['規則', '內容'], rows: [
    { 規則: '只維護這個資料夾', 內容: 'migration-data\\latest\\office-files' },
    { 規則: '不要改的資料夾', 內容: 'current, archive, legacy, source-snapshots' },
    { 規則: '若要改文章內容', 內容: '改 article_blocks' },
    { 規則: '若要改文章標題、日期、摘要、封面', 內容: '改 articles' }
  ] }
]);
const columnsArticles = readCsv(path.join(workbooksDir, 'columns-database-latest.articles.csv'));
const columnsBlocks = readCsv(path.join(workbooksDir, 'columns-database-latest.article-blocks.csv'));
const eliteArticles = readCsv(path.join(workbooksDir, 'elite-database-latest.articles.csv'));
const eliteBlocks = readCsv(path.join(workbooksDir, 'elite-database-latest.article-blocks.csv'));
const foundersProfiles = readCsv(path.join(workbooksDir, 'founders-team-latest.profiles.csv'));
const foundersBlocks = readCsv(path.join(workbooksDir, 'founders-team-latest.profile-blocks.csv'));
const advisorsProfiles = readCsv(path.join(workbooksDir, 'advisors-team-latest.profiles.csv'));
const advisorsBlocks = readCsv(path.join(workbooksDir, 'advisors-team-latest.profile-blocks.csv'));
writeXlsx(path.join(officeDir, '01-文章專欄-請修改這份.xlsx'), [
  { name: 'articles', headers: Object.keys(columnsArticles[0]), rows: columnsArticles },
  { name: 'article_blocks', headers: Object.keys(columnsBlocks[0]), rows: columnsBlocks },
  { name: '使用說明', headers: Object.keys(articleGuide[0]), rows: articleGuide },
  { name: '寫法示例', headers: Object.keys(articleExample[0]), rows: articleExample }
]);
writeXlsx(path.join(officeDir, '02-獵豹菁英-請修改這份.xlsx'), [
  { name: 'articles', headers: Object.keys(eliteArticles[0]), rows: eliteArticles },
  { name: 'article_blocks', headers: Object.keys(eliteBlocks[0]), rows: eliteBlocks },
  { name: '使用說明', headers: Object.keys(articleGuide[0]), rows: articleGuide },
  { name: '寫法示例', headers: Object.keys(articleExample[0]), rows: articleExample }
]);
writeXlsx(path.join(officeDir, '03-創辦與經營團隊-請修改這份.xlsx'), [
  { name: 'profiles', headers: Object.keys(foundersProfiles[0]), rows: foundersProfiles },
  { name: 'profile_blocks', headers: Object.keys(foundersBlocks[0]), rows: foundersBlocks },
  { name: '使用說明', headers: Object.keys(profileGuide[0]), rows: profileGuide }
]);
writeXlsx(path.join(officeDir, '04-師資顧問團隊-請修改這份.xlsx'), [
  { name: 'profiles', headers: Object.keys(advisorsProfiles[0]), rows: advisorsProfiles },
  { name: 'profile_blocks', headers: Object.keys(advisorsBlocks[0]), rows: advisorsBlocks },
  { name: '使用說明', headers: Object.keys(profileGuide[0]), rows: profileGuide }
]);
fs.writeFileSync(path.join(officeDir, '00-請先看這裡.txt'), ['請之後只修改這個資料夾：', officeDir, '', '依區塊修改：', '- 文章專欄：01-文章專欄-請修改這份.xlsx', '- 獵豹菁英：02-獵豹菁英-請修改這份.xlsx', '- 創辦與經營團隊：03-創辦與經營團隊-請修改這份.xlsx', '- 師資顧問團隊：04-師資顧問團隊-請修改這份.xlsx', '', '先看：00-請從這裡開始-維護索引.xlsx'].join('\n'), 'utf8');
console.log('office maintenance files built');
