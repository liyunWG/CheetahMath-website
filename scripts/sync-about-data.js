// 「關於獵豹」與「獵豹特色」內容同步腳本。
//
// 編輯方式：
//   1. 到 content/about/ 修改對應檔案（一頁一檔）：
//        about-intro.json     獵豹簡介（intro：lead 品牌介紹 / pillars 課程卡片 / vision 願景）
//        about-founders.json  創辦與經營團隊（profiles 陣列，一人一個區塊）
//        about-advisors.json  師資顧問團隊（profiles 陣列，一人一個區塊）
//        feature-*.json       獵豹特色各頁（draftBody 純文字，僅供全站搜尋索引）
//        sections.json        分頁的標題、導言與顯示順序
//   2. 執行「更新資料.bat」（或 node scripts/sync-about-data.js）
//      會組裝成網頁實際讀取的 assets/data/about-data.js。
//
// 老師 profile 格式：
//   { "role": "教師/教研顧問", "name": "大維老師",
//     "paragraphs": ["一段一個字串"], "bullets": ["條列項目"],
//     "image": "pic/about/about-advisors-03.jpg" }
//   新增老師＝複製一個區塊；順序＝網頁顯示順序；照片放 pic/about/（建議方形、600px 內）。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content', 'about');
const jsPath = path.join(root, 'assets', 'data', 'about-data.js');

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('JSON 格式錯誤：' + path.relative(root, file));
    console.error('  ' + error.message + '（常見原因：多逗號、少引號、少括號）');
    process.exit(1);
  }
}

// 從結構化欄位組出全站搜尋用的純文字
function searchText(item) {
  const parts = [];
  if (item.intro) {
    const intro = item.intro;
    if (intro.lead) parts.push(intro.lead.title, ...(intro.lead.paragraphs || []));
    for (const pillar of intro.pillars || []) {
      parts.push(pillar.title, pillar.desc, ...(pillar.bullets || []));
    }
    if (intro.vision) parts.push(intro.vision.title, ...(intro.vision.paragraphs || []));
  }
  for (const profile of item.profiles || []) {
    parts.push(profile.role, profile.name, ...(profile.paragraphs || []), ...(profile.bullets || []));
  }
  if (item.draftBody) parts.push(item.draftBody);
  return parts.filter(Boolean).join('\n');
}

const sectionsFile = path.join(contentDir, 'sections.json');
if (!fs.existsSync(sectionsFile)) {
  console.error('找不到 ' + path.relative(root, sectionsFile));
  process.exit(1);
}
const sections = readJson(sectionsFile).sections || [];

let missingPhotos = 0;
const items = [];
for (const section of sections) {
  for (const slug of section.slugs || []) {
    const file = path.join(contentDir, slug + '.json');
    if (!fs.existsSync(file)) {
      console.error('sections.json 列了 "' + slug + '"，但找不到 content/about/' + slug + '.json');
      process.exit(1);
    }
    const item = readJson(file);
    item.slug = item.slug || slug;
    const text = searchText(item);
    item.draftBody = item.draftBody || text;
    item.bodyText = text;
    for (const profile of item.profiles || []) {
      if (profile.image && !fs.existsSync(path.join(root, profile.image))) {
        console.warn('找不到照片檔案：' + profile.image + '（' + profile.name + '）');
        missingPhotos += 1;
      }
    }
    items.push(item);
  }
}

// feature-* 等頁面沒有結構化欄位（intro/profiles），前端只能靠 bodyHtml 顯示，
// 而 bodyHtml 只存在於既有的 about-data.js（content/about/*.json 沒有這個欄位），
// 所以重新產生時要把舊檔的 bodyHtml 帶回來，否則那幾頁會變成空白。
const previousHtml = {};
if (fs.existsSync(jsPath)) {
  const previousRaw = fs.readFileSync(jsPath, 'utf8');
  const start = previousRaw.indexOf('window.__ABOUT_DATA__ = ');
  if (start !== -1) {
    const json = previousRaw.slice(start + 'window.__ABOUT_DATA__ = '.length).replace(/;\s*$/, '');
    try {
      for (const item of (JSON.parse(json).items || [])) {
        if (item.slug && item.bodyHtml) previousHtml[item.slug] = item.bodyHtml;
      }
    } catch (error) {
      console.warn('舊的 about-data.js 無法解析，bodyHtml 不會沿用：' + error.message);
    }
  }
}
for (const item of items) {
  if (!item.intro && !(item.profiles || []).length && previousHtml[item.slug]) {
    item.bodyHtml = previousHtml[item.slug];
  }
}

const payload = { sections, items };
fs.writeFileSync(
  jsPath,
  '// 此檔由 scripts/sync-about-data.js 自動產生，請勿直接編輯。\n' +
  '// 要修改內容請編輯 content/about/*.json，再執行「更新資料.bat」。\n' +
  'window.__ABOUT_DATA__ = ' + JSON.stringify(payload, null, 2) + ';\n',
  'utf8'
);
console.log('已同步 content/about/*.json -> assets/data/about-data.js（' + items.length + ' 頁）' +
  (missingPhotos ? '，注意：有 ' + missingPhotos + ' 張照片找不到檔案' : ''));
