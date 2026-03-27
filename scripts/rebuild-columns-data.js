const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "assets", "data", "columns-data.json");
const jsPath = path.join(root, "assets", "data", "columns-data.js");
const exportDir = path.join(root, "migration-data", "current", "columns-batch-01-migrated");
const csvPath = path.join(exportDir, "content-migration-columns-batch-01-migrated.csv");
const reportPath = path.join(exportDir, "migration-report.json");
const siteOrigin = "https://www.cheetahstem.com";

function decodeHtml(value) {
  const map = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => map[name.toLowerCase()] || "&" + name + ";");
}

function stripTags(html) {
  return decodeHtml(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace("https://www.cheetahstem.com//", "https://www.cheetahstem.com/");
  }
  if (value.startsWith("//")) return "https:" + value;
  if (value.startsWith("/")) return siteOrigin + value;
  return siteOrigin + "/" + value.replace(/^\.?\//, "");
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36"
    }
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}`);
  return response.text();
}

function extractAll(regex, text) {
  const matches = [];
  let match;
  while ((match = regex.exec(text))) matches.push(match);
  return matches;
}

function metaContent(html, property) {
  const patterns = [
    new RegExp(`<meta\\s+property=\"${property}\"\\s+content=\"([^\"]*)\"`, "i"),
    new RegExp(`<meta\\s+name=\"${property}\"\\s+content=\"([^\"]*)\"`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1].trim());
  }
  return "";
}

function extractListItems(html, category) {
  const blocks = extractAll(/<li class=\"item\">([\s\S]*?)<\/li>/gi, html);
  return blocks
    .map((blockMatch) => {
      const block = blockMatch[1];
      const hrefMatch = block.match(/<a itemprop=\"url\" href=\"([^\"]+)\"/i);
      if (!hrefMatch) return null;
      const titleMatch = block.match(/<h3 class=\"name\"[^>]*>([\s\S]*?)<\/h3>/i);
      const descMatch = block.match(/<div class=\"description\"[^>]*>([\s\S]*?)<\/div>/i);
      const timeMatch = block.match(/<time class=\"date\"[^>]*datetime=\"([^\"]+)\"/i);
      const imgMatch = block.match(/<img[^>]+(?:data-src|src)=\"([^\"]+)\"/i);
      return {
        detailUrl: resolveUrl(hrefMatch[1]),
        title: decodeHtml(stripTags(titleMatch ? titleMatch[1] : "")),
        description: decodeHtml(stripTags(descMatch ? descMatch[1] : "")),
        date: timeMatch ? timeMatch[1] : "",
        listImage: resolveUrl(imgMatch ? imgMatch[1] : ""),
        categorySlug: category.slug,
        categoryName: category.name,
        legacyId: category.legacyId
      };
    })
    .filter(Boolean);
}

function normalizeBodyHtml(html) {
  return String(html || "")
    .replace(/src=\"\/\//gi, 'src="https://')
    .replace(/href=\"\/\//gi, 'href="https://')
    .replace(/src=\"(\/[^\"]+)\"/gi, (_, value) => `src="${resolveUrl(value)}"`)
    .replace(/href=\"(\/[^\"]+)\"/gi, (_, value) => `href="${resolveUrl(value)}"`)
    .replace(/\sdata-ms-editor=\"[^\"]*\"/gi, "")
    .replace(/\sspellcheck=\"[^\"]*\"/gi, "")
    .trim();
}

function buildSummary(listDescription, ogDescription, bodyText) {
  const seed = [listDescription, ogDescription, bodyText].map((value) => String(value || "").trim()).find(Boolean) || "";
  return seed.length > 120 ? seed.slice(0, 120).trim() + "…" : seed;
}

function inferTags(categoryName, title, bodyText, date) {
  const tags = new Set(["文章專欄", categoryName]);
  const haystack = `${title} ${bodyText}`.toLowerCase();
  [
    ["amc", "AMC"],
    ["aime", "AIME"],
    ["ggb", "GGB"],
    ["幾何", "幾何"],
    ["私中", "私中"],
    ["科學班", "科學班"],
    ["資優", "資優"],
    ["教育", "教育"],
    ["科普", "科普"],
    ["家長", "家長"]
  ].forEach(([needle, tag]) => {
    if (haystack.includes(needle.toLowerCase())) tags.add(tag);
  });
  if (date) tags.add(String(date).slice(0, 4));
  return Array.from(tags);
}

function csvEscape(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

async function collectArticles(categories) {
  const byUrl = new Map();
  for (const category of categories) {
    for (let page = 1; page <= 30; page += 1) {
      const url = `${siteOrigin}/news/${category.legacyId}/${page}`;
      let html = "";
      try {
        html = await fetchText(url);
      } catch (error) {
        if (String(error.message || "").includes("404")) break;
        throw error;
      }
      const items = extractListItems(html, category);
      if (!items.length) break;
      items.forEach((item) => {
        if (!byUrl.has(item.detailUrl)) byUrl.set(item.detailUrl, item);
      });
    }
  }
  return Array.from(byUrl.values());
}

async function enrichArticle(seed) {
  const html = await fetchText(seed.detailUrl);
  const bodyMatch = html.match(/<article class=\"editor clearfix\">\s*([\s\S]*?)\s*<\/article>/i);
  const categoryMatch = html.match(/<h2 class=\"content-title\">([\s\S]*?)<\/h2>/i);
  const titleMatch = html.match(/<h1 class=\"news-title\"[^>]*>([\s\S]*?)<\/h1>/i);
  const dateMatch = html.match(/<time class=\"news-date\"[^>]*datetime=\"([^\"]+)\"/i);
  const legacyIdMatch = seed.detailUrl.match(/news_detail\/(\d+)/i);
  const bodyHtml = normalizeBodyHtml(bodyMatch ? bodyMatch[1] : "");
  const bodyText = stripTags(bodyHtml);
  const ogTitle = metaContent(html, "og:title");
  const ogDescription = metaContent(html, "og:description");
  const ogImage = resolveUrl(metaContent(html, "og:image"));
  const firstImageMatch = bodyHtml.match(/<img[^>]+src=\"([^\"]+)\"/i);
  const coverImage = resolveUrl(firstImageMatch ? firstImageMatch[1] : ogImage || seed.listImage);
  const date = dateMatch ? dateMatch[1] : seed.date;
  const title = decodeHtml(stripTags(titleMatch ? titleMatch[1] : ogTitle || seed.title));
  const categoryName = decodeHtml(stripTags(categoryMatch ? categoryMatch[1] : seed.categoryName));
  const summary = buildSummary(seed.description, ogDescription, bodyText);
  const legacyId = legacyIdMatch ? Number(legacyIdMatch[1]) : 0;
  const year = date ? String(date).slice(0, 4) : "";
  return {
    slug: `${seed.categorySlug}-${legacyId || slugify(title)}`,
    legacyId,
    title,
    date,
    category: categoryName,
    categorySlug: seed.categorySlug,
    bucket: "文章專欄",
    summary,
    excerpt: summary,
    sourceUrl: seed.detailUrl,
    coverImage,
    cover: coverImage,
    imageName: coverImage ? path.basename(coverImage.split("?")[0]) : "",
    tags: inferTags(categoryName, title, bodyText, year),
    keep: "保留",
    targetPage: "columns.html",
    bodyHtml,
    bodyText,
    imageUrl: coverImage,
    notes: `舊站自動搬移於 ${new Date().toISOString().slice(0, 10)}`,
    migrationPage: `news/${seed.categorySlug}`,
    listDescription: seed.description,
    legacyCategoryUrl: `${siteOrigin}/news/${seed.legacyId}/1`,
    legacyCategoryId: seed.legacyId
  };
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function runner() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runner()));
  return results;
}

async function main() {
  const current = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const categories = current.categories || [];
  console.log(`Collecting list pages for ${categories.length} categories...`);
  const seeds = await collectArticles(categories);
  console.log(`Collected ${seeds.length} unique article links.`);
  const items = await runPool(seeds, 6, async (seed, index) => {
    const item = await enrichArticle(seed);
    if ((index + 1) % 20 === 0 || index === seeds.length - 1) console.log(`Processed ${index + 1}/${seeds.length}`);
    return item;
  });
  items.sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0) || (b.legacyId || 0) - (a.legacyId || 0));
  const output = { categories, items };
  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2) + "\n", "utf8");
  fs.writeFileSync(jsPath, `window.__COLUMNS_DATA__ = ${JSON.stringify(output, null, 2)};\n`, "utf8");
  fs.mkdirSync(exportDir, { recursive: true });
  const csvRows = [["舊網址","來源分類ID","子項目","標題","日期","類型","分類","標籤","摘要","來源網址","封面圖檔名","是否保留","備註","內文原稿"].map(csvEscape).join(",")];
  items.forEach((item) => {
    csvRows.push([
      item.sourceUrl,
      item.legacyCategoryId,
      item.category,
      item.title,
      item.date,
      "舊站搬移",
      item.bucket,
      item.tags.join(", "),
      item.summary,
      item.sourceUrl,
      item.imageName,
      item.keep,
      item.notes,
      item.bodyText
    ].map(csvEscape).join(","));
  });
  fs.writeFileSync(csvPath, "\uFEFF" + csvRows.join("\n"), "utf8");
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    categoryCount: categories.length,
    articleCount: items.length,
    categories: categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      legacyCount: category.legacyCount,
      migratedCount: items.filter((item) => item.categorySlug === category.slug).length
    }))
  }, null, 2) + "\n", "utf8");
  console.log(`Wrote ${items.length} articles to columns-data.json/js`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
