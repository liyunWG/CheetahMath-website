/**
 * prerender-seo.js
 * -------------------------------------------------------------
 * 目的：把原本只會「轉址到 article.html?slug=…」的 265 個空殼檔，
 *      改寫成「內文已經寫死在 HTML 裡」的靜態頁，讓 Google 與
 *      不執行 JavaScript 的 AI 爬蟲（GPTBot / ClaudeBot 等）能直接讀到內文。
 *
 * 作法：用 jsdom 在 Node 裡執行「和使用者瀏覽器完全相同的前端 JS」
 *      （site.js + 各 page script），渲染 article.html?slug=X 的結果，
 *      再把渲染完成的 DOM 存回該 slug 對應的靜態檔。
 *      → 產出與使用者今天看到的內容逐字元一致，不重寫任何模板。
 *
 * 重要：使用者的瀏覽操作與畫面完全不受影響。
 *      靜態檔的檔名（例如 article-education-talk-267.html）與現在相同，
 *      且各 page script 只在頁名剛好等於 article.html / elite-story.html…
 *      時才會重繪，pretty 檔名不符 → 瀏覽器端不會覆蓋烘焙好的內文。
 */

const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
const ORIGIN = String(CONFIG.origin || "").replace(/\/+$/, "");

// site.js 會用到的所有資料檔（全部預先注入，讓 ensureData() 直接跳過動態載入）
const DATA_SCRIPTS = [
  "assets/data/site-shell-data.js",
  "assets/data/site-page-data.js",
  "assets/data/needs-data.js",
  "assets/data/elite-data.js",
  "assets/data/courses-data.js",
  "assets/data/moms-data.js",
  "assets/data/news-data.js",
  "assets/data/students-data.js",
  "assets/data/columns-data.js",
];
// 前端輔助 + 外框 + 各頁渲染腳本（page script 會依頁名自行決定要不要動作）
const CODE_SCRIPTS = [
  "assets/js/article-format.js",
  "assets/js/site.js",
  "assets/js/columns-pages.js",
  "assets/js/elite-pages.js",
  "assets/js/moms-pages.js",
  "assets/js/courses-pages.js",
  "assets/js/news-pages.js",
];

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// jsdom 未實作的瀏覽器 API，補上 no-op（只影響動畫/RWD，不影響內容）
function polyfill(w) {
  w.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
  w.matchMedia =
    w.matchMedia ||
    function () {
      return {
        matches: false,
        media: "",
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      };
    };
  w.scrollTo = w.scrollTo || function () {};
}

/**
 * 用 jsdom 載入 templateFile，並以 urlPath 當作 location，執行全部前端 JS。
 * 回傳完成渲染的 JSDOM。
 */
async function renderInJsdom(templateFile, urlPath, opts) {
  const options = opts || {};
  const html = readFile(templateFile);
  const virtualConsole = new VirtualConsole(); // 靜音頁面 console
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: ORIGIN + urlPath,
    virtualConsole,
    pretendToBeVisual: true,
  });
  const w = dom.window;
  polyfill(w);

  // 列表頁會「讀自己的前次輸出」重繪，先清空 main 確保每次從乾淨狀態開始（冪等）
  if (options.clearMain) {
    const m = w.document.querySelector("main.page");
    if (m) m.innerHTML = "";
  }

  for (const rel of DATA_SCRIPTS.concat(CODE_SCRIPTS)) {
    const s = w.document.createElement("script");
    s.textContent = readFile(rel);
    s.setAttribute("data-prerender-injected", "1"); // 存檔前會移除，避免把 JS 內容寫進 HTML
    w.document.body.appendChild(s);
  }

  // 等待渲染完成：外框（footer-grid）重建 + main 有內容
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    await sleep(40);
    const doc = w.document;
    const main = doc.querySelector("main.page");
    const footerReady = !!doc.querySelector(".footer-grid");
    if (footerReady && main && main.children.length > 0) break;
  }
  return dom;
}

function itemImage(item) {
  const raw = (item && (item.coverImage || item.cover || item.imageUrl)) || "";
  // 只接受像圖片路徑的值（有副檔名 / 有斜線 / http）；排除像「靜心粉霧」這種配色標籤
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/[\/\\]/.test(raw) || /\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) return raw;
  return "";
}

function absUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return ORIGIN + "/" + String(src).replace(/^\/+/, "");
}

function ensureMeta(doc, selector, attrs) {
  let node = doc.querySelector(selector);
  if (!node) {
    node = doc.createElement("meta");
    Object.entries(attrs.create || {}).forEach(([k, v]) => node.setAttribute(k, v));
    doc.head.appendChild(node);
  }
  node.setAttribute("content", attrs.content);
  return node;
}

function setCanonical(doc, href) {
  let link = doc.querySelector('link[rel="canonical"]');
  if (!link) {
    link = doc.createElement("link");
    link.setAttribute("rel", "canonical");
    doc.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * 後處理 <head>：canonical / og / twitter / JSON-LD，並在 <body> 標記
 * data-page-title 讓瀏覽器端 site.js 不會用首頁標題覆蓋掉本頁標題。
 */
function finalizeHead(dom, opts) {
  const { outFile, item, sectionSuffix } = opts;
  const doc = dom.window.document;
  const canonical = ORIGIN + "/" + outFile;

  // 標題/描述一律優先採用資料檔的真實內容（避免被前端路由的通用標題覆蓋）
  const title =
    item && item.title ? item.title + sectionSuffix : doc.title;
  let description = "";
  if (item && (item.summary || item.excerpt)) {
    description = String(item.summary || item.excerpt).trim();
  } else {
    description = String(
      (doc.querySelector('meta[name="description"]') || {}).content || ""
    ).trim();
  }
  const image = absUrl(itemImage(item));
  const headline = item ? item.title : title;

  doc.title = title;
  ensureMeta(doc, 'meta[name="description"]', {
    content: description,
    create: { name: "description" },
  });
  ensureMeta(doc, 'meta[property="og:type"]', {
    content: "article",
    create: { property: "og:type" },
  });
  ensureMeta(doc, 'meta[property="og:title"]', {
    content: title,
    create: { property: "og:title" },
  });
  ensureMeta(doc, 'meta[property="og:description"]', {
    content: description,
    create: { property: "og:description" },
  });
  ensureMeta(doc, 'meta[property="og:url"]', {
    content: canonical,
    create: { property: "og:url" },
  });
  if (image) {
    ensureMeta(doc, 'meta[property="og:image"]', {
      content: image,
      create: { property: "og:image" },
    });
  } else {
    // 沒有有效圖片時，移除可能殘留的無效 og:image
    doc.querySelectorAll('meta[property="og:image"]').forEach((n) => n.remove());
  }
  ensureMeta(doc, 'meta[name="twitter:title"]', {
    content: title,
    create: { name: "twitter:title" },
  });
  ensureMeta(doc, 'meta[name="twitter:description"]', {
    content: description,
    create: { name: "twitter:description" },
  });
  setCanonical(doc, canonical);

  // JSON-LD（Article 結構化資料）
  if (item) {
    const ld = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: headline,
      inLanguage: "zh-Hant",
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      author: { "@type": "Organization", name: "獵豹科教" },
      publisher: {
        "@type": "Organization",
        name: "獵豹科教",
        logo: { "@type": "ImageObject", url: ORIGIN + "/pic/logo.png" },
      },
    };
    if (item.date) {
      ld.datePublished = item.date;
      ld.dateModified = item.date;
    }
    if (description) ld.description = description;
    if (image) ld.image = [image];

    doc.querySelectorAll('script[type="application/ld+json"]').forEach((n) => n.remove());
    const s = doc.createElement("script");
    s.setAttribute("type", "application/ld+json");
    s.textContent = JSON.stringify(ld, null, 2);
    doc.head.appendChild(s);
  }

  // 讓瀏覽器端 site.js 保留本頁標題（搭配 site.js 的 data-page-title patch）
  doc.body.setAttribute("data-page-title", title);
  // 標記來源，讓下次重跑仍能認得這是哪個模板/哪個 slug（可重複執行）
  if (opts.templatePage) doc.body.setAttribute("data-prerender-template", opts.templatePage);
  if (opts.slug) doc.body.setAttribute("data-prerender-slug", opts.slug);
}

function serialize(dom) {
  const doc = dom.window.document;
  // 移除 prerender 過程注入的腳本（否則會把 2MB 資料檔內嵌進每一頁）
  doc.querySelectorAll("script[data-prerender-injected]").forEach((n) => n.remove());
  // 移除 <body> 尾端的純空白節點：HTML 規範會把 </html> 之後的換行 reparent 回 body，
  // 若不清除，列表頁（讀自己前次輸出重繪）會每次多一個空行。清掉即可穩定冪等。
  const body = doc.body;
  while (
    body &&
    body.lastChild &&
    body.lastChild.nodeType === 3 &&
    !body.lastChild.textContent.trim()
  ) {
    body.removeChild(body.lastChild);
  }
  return "<!doctype html>\n" + doc.documentElement.outerHTML + "\n";
}

// ---- 掃描所有目標頁，取得 (outFile, templatePage, slug) ----
// 兩種來源：(1) 尚未處理的 redirect stub；(2) 之前已 prerender、body 帶標記的頁。
// → 這讓本腳本可重複執行（資料更新後重跑會刷新既有頁）。
function discoverStubs() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  const map = new Map(); // outFile -> {outFile, templatePage, slug}
  const reMeta = /<meta[^>]+http-equiv=["']refresh["'][^>]*url=([^"'\s>]+)/i;
  const reJs = /location\.replace\(['"]([^'"]+)['"]\)/i;
  const reTpl = /data-prerender-template="([^"]+)"/i;
  const reSlug = /data-prerender-slug="([^"]+)"/i;
  for (const f of files) {
    const html = fs.readFileSync(path.join(ROOT, f), "utf8");
    // 來源 2：已 prerender 的頁（body 標記）
    const mt = html.match(reTpl);
    const ms = html.match(reSlug);
    if (mt && ms) {
      map.set(f, { outFile: f, templatePage: mt[1], slug: ms[1] });
      continue;
    }
    // 來源 1：redirect stub
    const m = html.match(reMeta) || html.match(reJs);
    if (!m) continue;
    const target = m[1].replace(/&amp;/g, "&");
    const tm = target.match(/^([a-z0-9-]+\.html)\?slug=(.+)$/i);
    if (!tm) continue;
    map.set(f, {
      outFile: f,
      templatePage: tm[1],
      slug: decodeURIComponent(tm[2]),
    });
  }
  return Array.from(map.values());
}

// 每種內容類型：資料全域、模板頁、檔名前綴、標題後綴
const CONTENT_TYPES = [
  { key: "columns", template: "article.html", prefix: "article-", suffix: "｜文章專欄" },
  { key: "elite", template: "elite-story.html", prefix: "elite-story-", suffix: "｜獵豹菁英" },
  { key: "moms", template: "mom-power.html", prefix: "mom-power-", suffix: "｜星媽的正能量" },
  { key: "courses", template: "course-article.html", prefix: "course-article-", suffix: "｜課程" },
  { key: "news", template: "news-story.html", prefix: "news-story-", suffix: "｜最新消息" },
];

// 一次載入全部內容資料，回傳 [{type, items:[保留的 item]}]
function loadTypedItems() {
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
  const raw = {
    columns: (w.__COLUMNS_DATA__ && w.__COLUMNS_DATA__.items) || [],
    elite: w.__ELITE_DATA__ || [],
    moms: w.__MOMS_DATA__ || [],
    courses: w.__COURSES_DATA__ || [],
    news: w.__NEWS_DATA__ || [],
  };
  w.close();
  const kept = (arr) =>
    (Array.isArray(arr) ? arr : []).filter(
      (it) => it && it.slug && String(it.keep || "保留").trim() !== "不保留"
    );
  return CONTENT_TYPES.map((t) => ({ type: t, items: kept(raw[t.key]) }));
}

// 渲染單篇內文頁（article/elite/mom/course/news），寫到 outFile
async function renderDetailPage(spec, OUTDIR, stats) {
  const { templatePage, slug, outFile, item, suffix } = spec;
  try {
    const urlPath = "/" + templatePage + "?slug=" + encodeURIComponent(slug);
    const dom = await renderInJsdom(templatePage, urlPath);
    const main = dom.window.document.querySelector("main.page");
    if (!main || !main.children.length) throw new Error("main empty after render");
    if (/找不到/.test(main.textContent) && main.children.length <= 1) {
      throw new Error("item not found for slug");
    }
    finalizeHead(dom, { outFile, item, sectionSuffix: suffix, templatePage, slug });
    fs.writeFileSync(path.join(OUTDIR, outFile), serialize(dom), "utf8");
    dom.window.close();
    stats.ok += 1;
    if (stats.ok % 25 === 0) console.log("  ...prerendered", stats.ok);
  } catch (err) {
    stats.fail.push({ file: outFile, slug, error: err.message });
  }
}

// 就地重建 main 為空的列表頁（不改 head、不加 data-page-title）
async function renderListingPage(page, OUTDIR, stats) {
  try {
    const dom = await renderInJsdom(page, "/" + page, { clearMain: true });
    const main = dom.window.document.querySelector("main.page");
    if (!main || !main.children.length) throw new Error("listing main empty");
    fs.writeFileSync(path.join(OUTDIR, page), serialize(dom), "utf8");
    dom.window.close();
    stats.ok += 1;
    console.log("  ...listing rebuilt:", page);
  } catch (err) {
    stats.fail.push({ file: page, slug: "(listing)", error: err.message });
  }
}

async function main() {
  console.log("Origin:", ORIGIN);
  const OUTDIR = process.env.SEO_OUTDIR
    ? path.join(ROOT, process.env.SEO_OUTDIR)
    : ROOT;
  if (OUTDIR !== ROOT) fs.mkdirSync(OUTDIR, { recursive: true });

  // 既有 redirect stub 的 slug -> 檔名對照：有舊 stub 者沿用其檔名，保留既有網址
  const stubBySlug = new Map();
  discoverStubs().forEach((s) => {
    if (!stubBySlug.has(s.slug)) stubBySlug.set(s.slug, s.outFile);
  });

  const typed = loadTypedItems();
  const stats = { ok: 0, fail: [] };

  // ---- Pass 1：為「每一篇保留的內容」產生內文靜態頁（資料驅動，涵蓋新舊文章）----
  console.log("\n[Pass 1] 依資料產生所有內文靜態頁 ...");
  for (const { type, items } of typed) {
    let filtered = items;
    if (process.env.SEO_FILTER) {
      filtered = filtered.filter((it) => it.slug.includes(process.env.SEO_FILTER));
    }
    if (process.env.SEO_LIMIT) {
      filtered = filtered.slice(0, Number(process.env.SEO_LIMIT));
    }
    if (!filtered.length) continue;
    console.log("  [" + type.key + "] " + filtered.length + " 篇");
    for (const item of filtered) {
      const outFile = stubBySlug.get(item.slug) || type.prefix + item.slug + ".html";
      await renderDetailPage(
        {
          templatePage: type.template,
          slug: item.slug,
          outFile,
          item,
          suffix: type.suffix,
        },
        OUTDIR,
        stats
      );
    }
  }

  // ---- Pass 2：main 為空的列表頁（就地重建靜態內容，不改 head）----
  console.log("[Pass 2] 重建空白列表頁（courses / news）...");
  for (const page of ["courses.html", "news.html"]) {
    await renderListingPage(page, OUTDIR, stats);
  }

  console.log("\nPrerendered OK:", stats.ok);
  if (stats.fail.length) {
    console.log("FAILED:", stats.fail.length);
    stats.fail.forEach((f) => console.log("  -", f.file, "(" + f.slug + "):", f.error));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
