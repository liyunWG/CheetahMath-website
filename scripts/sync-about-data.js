// 日常編輯「關於獵豹」內容的同步腳本：
// 1. 直接編輯 assets/data/about-data.json（profiles / intro / summary 等欄位）
// 2. 執行 node scripts/sync-about-data.js
// 它會把 JSON 內容同步到網頁實際讀取的 assets/data/about-data.js。
// （scripts/curate-about-profiles.js 是「從舊站原始文字重建」用，會覆蓋手動修改，平常不要跑）
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'assets', 'data', 'about-data.json');
const jsPath = path.join(root, 'assets', 'data', 'about-data.js');

let data;
try {
  data = JSON.parse(fs.readFileSync(jsonPath, 'utf8').replace(/^﻿/, ''));
} catch (error) {
  console.error('about-data.json 格式錯誤，請檢查 JSON 語法（常見：多逗號、少引號）：');
  console.error(error.message);
  process.exit(1);
}

// 基本檢查：照片路徑是否存在
let missing = 0;
for (const item of data.items || []) {
  for (const profile of item.profiles || []) {
    if (profile.image && !fs.existsSync(path.join(root, profile.image))) {
      console.warn('找不到照片檔案：' + profile.image + '（' + profile.name + '）');
      missing += 1;
    }
  }
}

fs.writeFileSync(jsPath, 'window.__ABOUT_DATA__ = ' + JSON.stringify(data, null, 2) + ';\n', 'utf8');
console.log('已同步 about-data.json -> about-data.js' + (missing ? '（含 ' + missing + ' 張缺少的照片，請補檔案）' : ''));
