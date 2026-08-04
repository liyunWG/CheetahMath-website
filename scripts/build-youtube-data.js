#!/usr/bin/env node
/**
 * build-youtube-data.js
 *
 * 由「獵豹錦囊」影片主檔 Excel 產生前端資料檔。
 *   來源：assets/data/youtube-videos.xlsx
 *   產物：assets/data/youtube-data.js  (window.__YOUTUBE_DATA__)
 *
 * 用法：npm run youtube
 *
 * Excel 欄位（第一列為標題，中英皆可）：
 *   type / 類型        影片 或 Shorts
 *   videoId / 影片ID   YouTube 影片 ID（網址 watch?v= 後那串）
 *   title / 標題
 *   length / 時長      例：4:41（Shorts 可留空）
 *   views / 觀看次數    例：434次
 *   date / 發布日期     例：2025-12-25
 *   featured / 精選     是 / TRUE / 1 代表首頁精選
 *
 * 本腳本為建置工具，不影響前端網站本身；缺少 xlsx 套件時，
 * 網站仍可使用已提交的 youtube-data.js。
 */
const fs = require("fs");
const path = require("path");

let XLSX;
try {
  XLSX = require("xlsx");
} catch (e) {
  console.error("[build-youtube-data] 找不到 xlsx 套件，請先安裝：npm install");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "assets", "data", "youtube-videos.xlsx");
const OUT = path.join(ROOT, "assets", "data", "youtube-data.js");
const CHANNEL_URL = "https://www.youtube.com/@liyuncheetah";

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
      return String(row[k]).trim();
    }
  }
  return "";
}

function truthy(value) {
  const v = String(value || "").trim().toLowerCase();
  return v === "是" || v === "true" || v === "1" || v === "y" || v === "yes" || v === "v";
}

function normalizeType(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "shorts" || v === "short" || v === "短影音") return "shorts";
  return "video";
}

function toRecord(row) {
  return {
    type: normalizeType(pick(row, ["type", "類型", "分類"])),
    id: pick(row, ["videoId", "id", "影片ID", "影片 ID", "ID"]),
    title: pick(row, ["title", "標題"]),
    length: pick(row, ["length", "時長", "長度"]),
    views: pick(row, ["views", "觀看次數", "觀看"]),
    date: pick(row, ["date", "發布日期", "日期"]),
    featured: truthy(pick(row, ["featured", "精選"]))
  };
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("[build-youtube-data] 找不到主檔：" + SRC);
    process.exit(1);
  }
  const wb = XLSX.readFile(SRC);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const videos = [];
  const shorts = [];
  rows.forEach((row) => {
    const rec = toRecord(row);
    if (!rec.id) return;
    const bucket = rec.type === "shorts" ? shorts : videos;
    const entry = { id: rec.id, title: rec.title, views: rec.views, date: rec.date, featured: rec.featured };
    if (rec.type !== "shorts") entry.length = rec.length;
    bucket.push(entry);
  });

  // 依發布日期由新到舊排序
  const byDateDesc = (a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0);
  videos.sort(byDateDesc);
  shorts.sort(byDateDesc);

  const payload = { channelUrl: CHANNEL_URL, videos, shorts };
  const body =
    "/**\n" +
    " * 獵豹錦囊 YouTube 影片資料（前端載入用）\n" +
    " *\n" +
    " * ⚠️ 這是「產物檔」，由 scripts/build-youtube-data.js 依\n" +
    " * assets/data/youtube-videos.xlsx 自動產生，請勿手改。\n" +
    " * 更新方式：改 Excel 後執行 `npm run youtube`。\n" +
    " */\n" +
    "window.__YOUTUBE_DATA__ = " +
    JSON.stringify(payload, null, 2) +
    ";\n\n" +
    "// 補上衍生欄位（url / thumb），供前端直接使用。\n" +
    "(function () {\n" +
    "  var d = window.__YOUTUBE_DATA__;\n" +
    "  function decorate(list) {\n" +
    "    (list || []).forEach(function (v) {\n" +
    '      v.url = "https://www.youtube.com/watch?v=" + v.id;\n' +
    '      v.thumb = "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg";\n' +
    "    });\n" +
    "  }\n" +
    "  decorate(d.videos);\n" +
    "  decorate(d.shorts);\n" +
    "})();\n";

  fs.writeFileSync(OUT, body, "utf8");
  console.log(
    "[build-youtube-data] 已產生 " +
      path.relative(ROOT, OUT) +
      "（影片 " +
      videos.length +
      " 支、Shorts " +
      shorts.length +
      " 支）"
  );
}

main();
