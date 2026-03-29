const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const officeDir = path.join(root, "site-data", "office-files");
const columnsWorkbookPath = path.join(officeDir, "01-文章專欄-請修改這份.xlsx");
const eliteWorkbookPath = path.join(officeDir, "02-獵豹菁英-請修改這份.xlsx");
const columnsJsonPath = path.join(root, "assets", "data", "columns-data.json");
const columnsJsPath = path.join(root, "assets", "data", "columns-data.js");
const eliteJsonPath = path.join(root, "assets", "data", "elite-data.json");
const eliteJsPath = path.join(root, "assets", "data", "elite-data.js");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function findEndOfCentralDirectory(buffer) {
  for (let index = buffer.length - 22; index >= 0; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) return index;
  }
  throw new Error("Could not locate ZIP end of central directory");
}

function unzipEntries(filePath) {
  const buffer = fs.readFileSync(filePath);
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const records = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < records; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`Invalid central directory header in ${path.basename(filePath)}`);
    }
    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const fileName = buffer.slice(cursor + 46, cursor + 46 + fileNameLength).toString("utf8");

    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      throw new Error(`Invalid local file header for ${fileName}`);
    }

    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedData = buffer.slice(dataStart, dataStart + compressedSize);

    let data;
    if (compressionMethod === 0) data = compressedData;
    else if (compressionMethod === 8) data = zlib.inflateRawSync(compressedData);
    else throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${fileName}`);

    entries.set(fileName, data.toString("utf8"));
    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function colToIndex(ref) {
  const letters = String(ref || "").replace(/\d+/g, "");
  let value = 0;
  for (let index = 0; index < letters.length; index += 1) {
    value = value * 26 + (letters.charCodeAt(index) - 64);
  }
  return Math.max(0, value - 1);
}

function parseSharedStrings(xml) {
  const values = [];
  const matches = xml.match(/<si\b[\s\S]*?<\/si>/g) || [];
  matches.forEach((match) => {
    const textParts = [];
    const partMatches = match.match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || [];
    partMatches.forEach((part) => {
      const textMatch = part.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
      if (textMatch) textParts.push(decodeXml(textMatch[1]));
    });
    values.push(textParts.join(""));
  });
  return values;
}

function parseWorkbook(entries) {
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml") || "");
  const workbookXml = entries.get("xl/workbook.xml") || "";
  const relsXml = entries.get("xl/_rels/workbook.xml.rels") || "";
  const relationshipMap = new Map();

  (relsXml.match(/<Relationship\b[^>]*\/>/g) || []).forEach((match) => {
    const idMatch = match.match(/\bId="([^"]+)"/);
    const targetMatch = match.match(/\bTarget="([^"]+)"/);
    if (idMatch && targetMatch) relationshipMap.set(idMatch[1], `xl/${targetMatch[1].replace(/^\/+/, "")}`);
  });

  const sheets = [];
  (workbookXml.match(/<sheet\b[^>]*\/>/g) || []).forEach((match) => {
    const nameMatch = match.match(/\bname="([^"]+)"/);
    const idMatch = match.match(/\br:id="([^"]+)"/);
    if (!nameMatch || !idMatch) return;
    const sheetPath = relationshipMap.get(idMatch[1]);
    if (!sheetPath || !entries.has(sheetPath)) return;
    sheets.push({ name: decodeXml(nameMatch[1]), xml: entries.get(sheetPath) });
  });

  const parsedSheets = new Map();
  sheets.forEach((sheet) => {
    const rows = [];
    (sheet.xml.match(/<row\b[\s\S]*?<\/row>/g) || []).forEach((rowXml) => {
      const cells = [];
      (rowXml.match(/<c\b[\s\S]*?<\/c>/g) || []).forEach((cellXml) => {
        const refMatch = cellXml.match(/\br="([^"]+)"/);
        const typeMatch = cellXml.match(/\bt="([^"]+)"/);
        const colIndex = colToIndex(refMatch ? refMatch[1] : "");
        let value = "";

        if ((typeMatch && typeMatch[1] === "inlineStr") || /<is>/.test(cellXml)) {
          const textParts = cellXml.match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || [];
          value = textParts
            .map((part) => {
              const textMatch = part.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
              return textMatch ? decodeXml(textMatch[1]) : "";
            })
            .join("");
        } else {
          const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
          const rawValue = valueMatch ? decodeXml(valueMatch[1]) : "";
          value = typeMatch && typeMatch[1] === "s" ? sharedStrings[Number(rawValue)] || "" : rawValue;
        }

        cells[colIndex] = value;
      });
      rows.push(cells.map((value) => String(value || "")));
    });

    const headers = rows.shift() || [];
    const objects = rows
      .filter((row) => row.some((cell) => String(cell || "").trim()))
      .map((row) => {
        const item = {};
        headers.forEach((header, index) => {
          item[String(header || "").trim()] = String(row[index] || "");
        });
        return item;
      });
    parsedSheets.set(sheet.name, objects);
  });

  return parsedSheets;
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const mdY = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdY) return `${mdY[3]}-${mdY[1].padStart(2, "0")}-${mdY[2].padStart(2, "0")}`;
  const ymd = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  return raw;
}

function splitTags(value) {
  return Array.from(new Set(String(value || "").split(/[,\n，]/).map((tag) => tag.trim()).filter(Boolean)));
}

function blockTypeTag(value) {
  return String(value || "").trim().toLowerCase();
}

function extractYoutubeId(url) {
  const value = String(url || "").trim();
  const patterns = [
    /youtu\.be\/([^?&/]+)/i,
    /youtube\.com\/watch\?v=([^?&/]+)/i,
    /youtube\.com\/embed\/([^?&/]+)/i
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return "";
}

function blockTextToHtml(text) {
  return escapeHtml(text).replace(/\r?\n/g, "<br>");
}

function buildBody(blocks) {
  const htmlParts = [];
  const textParts = [];

  blocks
    .sort((a, b) => Number(a["順序"] || 0) - Number(b["順序"] || 0))
    .forEach((block) => {
      const kind = blockTypeTag(block["區塊類型"]);
      const text = String(block["文字內容"] || "").trim();
      const extra = String(block["附加資料"] || "").trim();
      const style = String(block["樣式"] || "").trim().toLowerCase();
      const color = String(block["顏色"] || "").trim();
      const styleAttr = `${color ? `color:${color};` : ""}${style.includes("bold") ? "font-weight:700;" : ""}`;
      const inlineStyle = styleAttr ? ` style="${escapeHtml(styleAttr)}"` : "";

      if (text) textParts.push(text);
      if (extra && kind !== "image" && kind !== "youtube") textParts.push(extra);

      if (kind === "heading") {
        htmlParts.push(`<h2${inlineStyle}>${blockTextToHtml(text)}</h2>`);
        return;
      }
      if (kind === "subheading") {
        htmlParts.push(`<h3${inlineStyle}>${blockTextToHtml(text)}</h3>`);
        return;
      }
      if (kind === "image" && extra) {
        htmlParts.push(`<p><img src="${escapeHtml(extra)}" alt="${escapeHtml(text || "")}"></p>`);
        return;
      }
      if (kind === "youtube" && extra) {
        const youtubeId = extractYoutubeId(extra);
        if (youtubeId) {
          htmlParts.push(`<div class="embed-responsive embed-responsive-16by9"><iframe allowfullscreen frameborder="0" src="https://www.youtube.com/embed/${escapeHtml(youtubeId)}?rel=0" width="100%" height="315"></iframe></div>`);
        }
        if (text) htmlParts.push(`<p>${blockTextToHtml(text)}</p>`);
        return;
      }
      if (!text && extra) {
        htmlParts.push(`<p>${blockTextToHtml(extra)}</p>`);
        return;
      }
      if (text) htmlParts.push(`<p${inlineStyle}>${blockTextToHtml(text)}</p>`);
    });

  return {
    bodyHtml: htmlParts.join("\n"),
    bodyText: textParts.join("\n\n").trim()
  };
}

function normalizeCategorySlug(slug) {
  return String(slug || "").replace(/-\d+$/, "");
}

function localImagePath(folder, fileName) {
  const value = String(fileName || "").trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("pic/")) return value;
  return `pic/${folder}/${value}`;
}

function buildColumnsData() {
  const workbook = parseWorkbook(unzipEntries(columnsWorkbookPath));
  const articles = workbook.get("articles") || [];
  const blocks = workbook.get("article_blocks") || [];
  const blocksById = new Map();

  blocks.forEach((block) => {
    const articleId = String(block["文章ID"] || "").trim();
    if (!articleId) return;
    if (!blocksById.has(articleId)) blocksById.set(articleId, []);
    blocksById.get(articleId).push(block);
  });

  const items = articles.map((article) => {
    const articleId = String(article["文章ID"] || "").trim();
    const slug = String(article["slug"] || "").trim();
    const body = buildBody(blocksById.get(articleId) || []);
    const coverImage = localImagePath("columns", article["封面圖片"]);
    return {
      slug,
      legacyId: Number(String(article["來源網址"] || "").match(/(\d+)\s*$/)?.[1] || 0),
      title: String(article["標題"] || "").trim(),
      date: normalizeDate(article["日期"]),
      category: String(article["主分類"] || article["子分類"] || "文章專欄").trim(),
      categorySlug: normalizeCategorySlug(slug),
      bucket: String(article["文章類型"] || article["區塊"] || "文章專欄").trim(),
      summary: String(article["摘要"] || "").trim(),
      excerpt: String(article["摘要"] || "").trim(),
      sourceUrl: String(article["來源網址"] || article["舊網址"] || "").trim(),
      coverImage,
      cover: coverImage,
      imageName: path.basename(String(article["封面圖片"] || "").trim()),
      tags: splitTags(article["標籤"]),
      keep: String(article["是否保留"] || "保留").trim(),
      targetPage: String(article["對應新頁面"] || "columns.html").trim(),
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
      imageUrl: coverImage,
      notes: String(article["備註"] || "").trim(),
      contentFormat: String(article["內容格式"] || "").trim()
    };
  }).sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0));

  const categories = Array.from(items.reduce((map, item) => {
    const key = item.categorySlug || item.category;
    if (!map.has(key)) {
      map.set(key, { slug: key, name: item.category, legacyId: 0, legacyCount: 0, legacyUrl: "", description: "" });
    }
    map.get(key).legacyCount += 1;
    return map;
  }, new Map()).values());

  return { categories, items };
}

function buildEliteData() {
  const workbook = parseWorkbook(unzipEntries(eliteWorkbookPath));
  const articles = workbook.get("articles") || [];
  const blocks = workbook.get("article_blocks") || [];
  const blocksById = new Map();

  blocks.forEach((block) => {
    const articleId = String(block["文章ID"] || "").trim();
    if (!articleId) return;
    if (!blocksById.has(articleId)) blocksById.set(articleId, []);
    blocksById.get(articleId).push(block);
  });

  return articles.map((article) => {
    const articleId = String(article["文章ID"] || "").trim();
    const body = buildBody(blocksById.get(articleId) || []);
    const cover = localImagePath("elite", article["封面圖片"]);
    return {
      slug: String(article["slug"] || "").trim(),
      title: String(article["標題"] || "").trim(),
      date: normalizeDate(article["日期"]),
      category: String(article["主分類"] || article["子分類"] || "獵豹菁英").trim(),
      bucket: String(article["文章類型"] || article["區塊"] || "獵豹菁英").trim(),
      summary: String(article["摘要"] || "").trim(),
      excerpt: String(article["摘要"] || "").trim(),
      sourceUrl: String(article["來源網址"] || article["舊網址"] || "").trim(),
      cover,
      imageName: path.basename(String(article["封面圖片"] || "").trim()),
      tags: splitTags(article["標籤"]),
      keep: String(article["是否保留"] || "保留").trim(),
      targetPage: String(article["對應新頁面"] || "students.html").trim(),
      notes: String(article["備註"] || "").trim(),
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText
    };
  }).sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0));
}

function writeOutputs() {
  const columnsData = buildColumnsData();
  const eliteData = buildEliteData();
  fs.writeFileSync(columnsJsonPath, JSON.stringify(columnsData, null, 2), "utf8");
  fs.writeFileSync(columnsJsPath, `window.__COLUMNS_DATA__ = ${JSON.stringify(columnsData, null, 2)};\n`, "utf8");
  fs.writeFileSync(eliteJsonPath, JSON.stringify(eliteData, null, 2), "utf8");
  fs.writeFileSync(eliteJsPath, `window.__ELITE_DATA__ = ${JSON.stringify(eliteData, null, 2)};\n`, "utf8");
  console.log(`rebuilt ${columnsData.items.length} columns items and ${eliteData.length} elite items from site-data office files`);
}

writeOutputs();
