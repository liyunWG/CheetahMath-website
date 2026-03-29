const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");
const util = require("util");
const { execFile } = require("child_process");

const execFileAsync = util.promisify(execFile);

const ROOT = path.resolve(__dirname, "..");
const PROD_BASE = "https://cheetah-math-website.vercel.app";
const HOST = "127.0.0.1";
const PORT = 4173;
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const EDGE_PROFILE = path.join(ROOT, ".edge-headless");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const ROOT_PAGE_EXCLUDES = new Set([
  ".tmp-dump.html",
  "article.html",
  "elite-story.html",
  "mom-power.html",
]);

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (match) => {
    return /src="assets\/js\/site\.js"/i.test(match) ? match : "";
  });
}

function replaceLocalUrls(html, outputPath) {
  const localBase = `http://${HOST}:${PORT}`;
  const finalUrl = `${PROD_BASE}/${outputPath}`;
  return html.split(localBase).join(PROD_BASE).split(`content=\"${PROD_BASE}\"`).join(`content=\"${finalUrl}\"`);
}

function upsertMeta(html, selector, attribute, value) {
  const patterns = {
    "meta[name='description']": /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    "meta[property='og:title']": /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    "meta[property='og:description']": /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    "meta[property='og:url']": /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    "meta[property='og:type']": /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    "meta[name='twitter:title']": /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    "meta[name='twitter:description']": /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
  };
  const pattern = patterns[selector];
  const key = selector.match(/'([^']+)'/)[1];
  const tag = selector.startsWith("meta[property")
    ? `<meta property="${key}" ${attribute}="${escapeAttr(value)}">`
    : `<meta name="${key}" ${attribute}="${escapeAttr(value)}">`;
  if (pattern && pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
}

function upsertCanonical(html, finalUrl) {
  const tag = `<link rel="canonical" href="${escapeAttr(finalUrl)}">`;
  const pattern = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
}

function applySeo(html, seo) {
  let next = html;
  if (seo.title) {
    next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
    next = upsertMeta(next, "meta[property='og:title']", "content", seo.title);
    next = upsertMeta(next, "meta[name='twitter:title']", "content", seo.title);
  }
  if (seo.description) {
    next = upsertMeta(next, "meta[name='description']", "content", seo.description);
    next = upsertMeta(next, "meta[property='og:description']", "content", seo.description);
    next = upsertMeta(next, "meta[name='twitter:description']", "content", seo.description);
  }
  if (seo.url) {
    next = upsertMeta(next, "meta[property='og:url']", "content", seo.url);
    next = upsertCanonical(next, seo.url);
  }
  if (seo.type) {
    next = upsertMeta(next, "meta[property='og:type']", "content", seo.type);
  }
  return next;
}

function extractLiteral(source, constName) {
  const marker = `const ${constName}=`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Could not find ${constName} in site.js`);
  const literalStart = start + marker.length;
  const opener = source[literalStart];
  const closer = opener === "[" ? "]" : opener === "{" ? "}" : null;
  if (!closer) throw new Error(`Unsupported literal type for ${constName}`);

  let depth = 0;
  let inString = null;
  let escaped = false;

  for (let i = literalStart; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === opener) depth += 1;
    if (ch === closer) {
      depth -= 1;
      if (depth === 0) return source.slice(literalStart, i + 1);
    }
  }

  throw new Error(`Could not parse ${constName}`);
}

function evaluateLiteral(source, constName) {
  const literal = extractLiteral(source, constName);
  const context = {};
  vm.runInNewContext(`result = ${literal};`, context, { timeout: 1000 });
  return context.result;
}

function loadAssignedGlobal(filePath, globalName) {
  const context = { window: {} };
  vm.runInNewContext(readUtf8(filePath), context, { timeout: 5000, filename: filePath });
  return context.window[globalName];
}

function buildRootPageList() {
  return fs
    .readdirSync(ROOT)
    .filter((name) => name.endsWith(".html"))
    .filter((name) => !ROOT_PAGE_EXCLUDES.has(name))
    .filter((name) => !/^article-.*\.html$/i.test(name))
    .filter((name) => !/^elite-story-.*\.html$/i.test(name))
    .filter((name) => !/^mom-power-.*\.html$/i.test(name))
    .sort();
}

function buildServer() {
  return http.createServer((req, res) => {
    let pathname = decodeURIComponent(req.url.split("?")[0]);
    if (pathname === "/") pathname = "/index.html";
    const filePath = path.join(ROOT, pathname.replace(/^\/+/, ""));
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      res.setHeader("Content-Type", MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream");
      res.end(data);
    });
  });
}

async function renderUrl(url, budgetMs) {
  const args = [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    `--virtual-time-budget=${budgetMs}`,
    `--user-data-dir=${EDGE_PROFILE}`,
    "--dump-dom",
    url,
  ];
  const { stdout } = await execFileAsync(EDGE_PATH, args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout;
}

function buildShell(site, nav, title, description, url, activeHref, mainHtml, extraMeta) {
  const navHtml = nav
    .map(([href, label]) => `<a${href === activeHref ? ' class="is-active"' : ""} href="${escapeAttr(href)}">${escapeHtml(label)}</a>`)
    .join("");
  const extra = extraMeta || "";
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="${escapeAttr(site.brand)}">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(url)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${escapeAttr(url)}">
  <link rel="stylesheet" href="assets/css/styles.css">
  <script src="assets/js/site.js" defer></script>
${extra}</head>
<body>
  <div class="site-shell">
    <header class="topbar">
      <div class="topbar__inner">
        <a class="brand" href="index.html">
          <span class="brand__title"><img src="pic/logo.png" alt="${escapeAttr(site.brand)} logo"></span>
          <span class="brand__subtitle">${escapeHtml(site.subtitle)}</span>
        </a>
        <button type="button" class="topbar__nav-toggle" aria-expanded="false" aria-label="Open menu"><span class="topbar__nav-toggle-bar"></span></button>
        <nav class="nav">${navHtml}</nav>
      </div>
    </header>
    <main class="page">${mainHtml}</main>
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer-grid">
          <div>
            <h3>${escapeHtml(site.brand)}</h3>
            <p>${escapeHtml(site.footer)}</p>
          </div>
          <div>
            <h3>快速入口</h3>
            <div class="footer-links">
              <a href="one-page.html">一頁認識獵豹</a>
              <a href="needs.html">家長導航</a>
              <a href="search.html">全站搜尋</a>
            </div>
          </div>
          <div>
            <h3>追蹤獵豹</h3>
            <div class="footer-social">
              <a class="footer-social__link footer-social__link--line" href="${escapeAttr(site.lineUrl)}" target="_blank" rel="noreferrer">
                <img src="pic/line_icon.png" alt="Line">
                <span>官方 Line 諮詢</span>
              </a>
              <a class="footer-social__link" href="${escapeAttr(site.fbUrl)}" target="_blank" rel="noreferrer">
                <img src="pic/FB_icon.png" alt="Facebook">
                <span>Facebook 社團</span>
              </a>
              <a class="footer-social__link" href="${escapeAttr(site.ytUrl)}" target="_blank" rel="noreferrer">
                <img src="pic/YT_icon.png" alt="YouTube">
                <span>YouTube 頻道</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <div class="social-float">
      <a class="social-float__link social-float__link--line" href="${escapeAttr(site.lineUrl)}" target="_blank" rel="noreferrer">
        <span class="social-float__badge">官方 Line 諮詢</span>
        <img src="pic/line_icon.png" alt="Line">
      </a>
      <a class="social-float__link" href="${escapeAttr(site.fbUrl)}" target="_blank" rel="noreferrer">
        <img src="pic/FB_icon.png" alt="Facebook">
      </a>
      <a class="social-float__link" href="${escapeAttr(site.ytUrl)}" target="_blank" rel="noreferrer">
        <img src="pic/YT_icon.png" alt="YouTube">
      </a>
    </div>
  </div>
</body>
</html>`;
}

function buildGenericArticleMain(article) {
  const tagHtml = (article.tags || []).length
    ? `<div class="tag-row">${article.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";
  const keywordHtml = (article.keywords || []).length
    ? article.keywords.map(escapeHtml).join("、")
    : "";
  return `<section class="page-hero">
  <div class="container article-layout">
    <div class="article-main">
      <div class="cover-art cover-art--navy"><span>${escapeHtml(article.cover || article.category || "文章")}</span></div>
      <div class="article-head">
        <span class="eyebrow">${escapeHtml(article.category || "文章")}</span>
        <h1>${escapeHtml(article.title)}</h1>
        <div class="card__meta-row">
          ${article.date ? `<span class="chip">${escapeHtml(article.date)}</span>` : ""}
          ${article.category ? `<span class="chip chip--muted">${escapeHtml(article.category)}</span>` : ""}
        </div>
        ${tagHtml}
        <p class="article-summary">${escapeHtml(article.summary || "")}</p>
      </div>
      <div class="article-body">${(article.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      <div class="page-nav">
        <a class="back-link" href="columns.html">回文章專欄</a>
        <a class="back-link" href="index.html">回首頁</a>
      </div>
    </div>
    <aside class="article-side">
      <div class="card">
        <h3>文章資訊</h3>
        <p><strong>slug：</strong>${escapeHtml(article.slug)}</p>
        <p><strong>關鍵詞：</strong>${keywordHtml}</p>
      </div>
    </aside>
  </div>
</section>`;
}

async function main() {
  ensureDir(EDGE_PROFILE);

  const siteJsPath = path.join(ROOT, "assets", "js", "site.js");
  const siteJs = readUtf8(siteJsPath);
  const site = evaluateLiteral(siteJs, "SITE");
  const nav = evaluateLiteral(siteJs, "NAV");
  const articles = evaluateLiteral(siteJs, "ARTICLES");
  const moms = evaluateLiteral(siteJs, "MOMS");
  const columnsData = loadAssignedGlobal(path.join(ROOT, "assets", "data", "columns-data.js"), "__COLUMNS_DATA__");
  const eliteData = loadAssignedGlobal(path.join(ROOT, "assets", "data", "elite-data.js"), "__ELITE_DATA__");

  const rootPages = buildRootPageList();
  const tasks = [];

  for (const page of rootPages) {
    tasks.push({
      outputPath: page,
      sourceUrl: `http://${HOST}:${PORT}/${page}`,
      stripScripts: false,
      budgetMs: 2500,
      seo: { url: `${PROD_BASE}/${page}` },
    });
  }

  for (const item of (columnsData.items || []).filter((entry) => String(entry.keep || "保留").trim() !== "不保留")) {
    tasks.push({
      outputPath: `article-${item.slug}.html`,
      sourceUrl: `http://${HOST}:${PORT}/article.html?slug=${encodeURIComponent(item.slug)}`,
      stripScripts: true,
      budgetMs: 2500,
      seo: {
        title: `${item.title}｜文章專欄`,
        description: item.summary || item.excerpt || item.category || "文章專欄",
        url: `${PROD_BASE}/article-${item.slug}.html`,
        type: "article",
      },
    });
  }

  for (const item of (eliteData || []).filter((entry) => String(entry.keep || "保留").trim() !== "不保留")) {
    tasks.push({
      outputPath: `elite-story-${item.slug}.html`,
      sourceUrl: `http://${HOST}:${PORT}/elite-story.html?slug=${encodeURIComponent(item.slug)}`,
      stripScripts: true,
      budgetMs: 2500,
      seo: {
        title: `${item.title}｜獵豹菁英`,
        description: item.summary || item.excerpt || item.category || "獵豹菁英",
        url: `${PROD_BASE}/elite-story-${item.slug}.html`,
        type: "article",
      },
    });
  }

  for (const item of moms) {
    tasks.push({
      outputPath: `mom-power-${item.slug}.html`,
      sourceUrl: `http://${HOST}:${PORT}/mom-power.html?slug=${encodeURIComponent(item.slug)}`,
      stripScripts: true,
      budgetMs: 2500,
      seo: {
        title: `${item.title}｜星媽的正能量`,
        description: item.summary || item.category || "星媽的正能量",
        url: `${PROD_BASE}/mom-power-${item.slug}.html`,
        type: "article",
      },
    });
  }

  for (const item of articles) {
    tasks.push({
      outputPath: `article-${item.slug}.html`,
      generatedHtml: buildShell(
        site,
        nav,
        `${item.title}｜文章專欄`,
        item.summary || item.category || "文章專欄",
        `${PROD_BASE}/article-${item.slug}.html`,
        "columns.html",
        buildGenericArticleMain(item)
      ),
      stripScripts: true,
      seo: {
        title: `${item.title}｜文章專欄`,
        description: item.summary || item.category || "文章專欄",
        url: `${PROD_BASE}/article-${item.slug}.html`,
        type: "article",
      },
    });
  }

  const server = buildServer();
  await new Promise((resolve) => server.listen(PORT, HOST, resolve));

  try {
    let count = 0;
    for (const task of tasks) {
      let html = task.generatedHtml || (await renderUrl(task.sourceUrl, task.budgetMs));
      html = replaceLocalUrls(html, task.outputPath);
      html = applySeo(html, task.seo || {});
      if (task.stripScripts) html = stripScripts(html);
      fs.writeFileSync(path.join(ROOT, task.outputPath), html.trim() + "\n", "utf8");
      count += 1;
      process.stdout.write(`Rendered ${count}/${tasks.length}: ${task.outputPath}\n`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
