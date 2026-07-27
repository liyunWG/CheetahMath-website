/**
 * build-sitemap.js
 * -------------------------------------------------------------
 * 產生 sitemap.xml 與 robots.txt。
 *  - sitemap.xml：列出所有「內容實體頁」（含 prerender 後的內文頁、hub/列表頁），
 *    供 Google 與 AI 檢索引擎快速發現全站內容。
 *  - robots.txt：明確允許主流搜尋與 AI 爬蟲，並指向 sitemap。
 *
 * 網址一律取自 site.config.json 的 origin，換網域只改該檔再重跑即可。
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
const ORIGIN = String(CONFIG.origin || "").replace(/\/+$/, "");

// 不收錄：SPA 模板殼頁（本身無內容，內容已在各 prerender 靜態頁）
const TEMPLATE_SHELLS = new Set([
  "article.html",
  "elite-story.html",
  "mom-power.html",
  "course-article.html",
  "news-story.html",
]);
// 不收錄：內部/暫存/測試檔前綴
const EXCLUDE_PREFIX = ["tmp", "one-page-old"];
const EXCLUDE_EXACT = new Set([".tmp-dump.html"]);

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// slug -> 日期（用於 sitemap lastmod）
function buildDateIndex() {
  const w = new JSDOM("<!doctype html><body></body>", {
    runScripts: "dangerously",
  }).window;
  for (const rel of [
    "assets/data/columns-data.js",
    "assets/data/elite-data.js",
    "assets/data/moms-data.js",
    "assets/data/courses-data.js",
    "assets/data/news-data.js",
  ]) {
    const s = w.document.createElement("script");
    s.textContent = readFile(rel);
    w.document.body.appendChild(s);
  }
  const map = new Map();
  const add = (arr) =>
    (arr || []).forEach((it) => {
      if (it && it.slug && it.date && !map.has(String(it.slug))) {
        map.set(String(it.slug), String(it.date));
      }
    });
  const cols = w.__COLUMNS_DATA__ || {};
  add(Array.isArray(cols.items) ? cols.items : []);
  add(w.__ELITE_DATA__);
  add(w.__MOMS_DATA__);
  add(w.__COURSES_DATA__);
  add(w.__NEWS_DATA__);
  w.close();
  return map;
}

function isoDate(value, fallbackFile) {
  const d = value ? new Date(value) : null;
  if (d && !isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // 退回檔案修改時間
  try {
    return fs
      .statSync(path.join(ROOT, fallbackFile))
      .mtime.toISOString()
      .slice(0, 10);
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

function collectPages(dateIndex) {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  const reRefresh = /<meta[^>]+http-equiv=["']refresh["']/i;
  const reSlug = /data-prerender-slug="([^"]+)"/i;
  const pages = [];
  for (const f of files) {
    if (TEMPLATE_SHELLS.has(f)) continue;
    if (EXCLUDE_EXACT.has(f)) continue;
    if (EXCLUDE_PREFIX.some((p) => f.startsWith(p))) continue;
    const html = readFile(f);
    // 仍是 redirect stub（例如 slug 已失效未 prerender 者）→ 不收錄
    if (reRefresh.test(html)) continue;
    let date = "";
    const ms = html.match(reSlug);
    if (ms && dateIndex.has(ms[1])) date = dateIndex.get(ms[1]);
    pages.push({ file: f, lastmod: isoDate(date, f) });
  }
  // 首頁優先
  pages.sort((a, b) => (a.file === "index.html" ? -1 : b.file === "index.html" ? 1 : a.file.localeCompare(b.file)));
  return pages;
}

function buildSitemap(pages) {
  const urls = pages
    .map((p) => {
      const loc = ORIGIN + "/" + (p.file === "index.html" ? "" : p.file);
      return (
        "  <url>\n" +
        "    <loc>" + loc + "</loc>\n" +
        "    <lastmod>" + p.lastmod + "</lastmod>\n" +
        "  </url>"
      );
    })
    .join("\n");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    "\n</urlset>\n"
  );
}

function buildRobots() {
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "Bytespider",
    "Amazonbot",
    "meta-externalagent",
  ];
  const lines = [
    "# 允許所有一般搜尋引擎索引全站",
    "User-agent: *",
    "Allow: /",
    "",
    "# 明確歡迎 AI 檢索／回答引擎（讓 AI 更容易找到並推薦本站內容）",
  ];
  aiBots.forEach((b) => {
    lines.push("User-agent: " + b);
    lines.push("Allow: /");
    lines.push("");
  });
  lines.push("Sitemap: " + ORIGIN + "/sitemap.xml");
  lines.push("");
  return lines.join("\n");
}

function main() {
  console.log("Origin:", ORIGIN);
  const dateIndex = buildDateIndex();
  const pages = collectPages(dateIndex);
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap(pages), "utf8");
  fs.writeFileSync(path.join(ROOT, "robots.txt"), buildRobots(), "utf8");
  console.log("sitemap.xml 產生完成，共", pages.length, "個網址");
  console.log("robots.txt 產生完成");
}

main();
