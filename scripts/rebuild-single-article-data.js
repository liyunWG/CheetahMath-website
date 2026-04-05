const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentRoot = path.join(root, "content");
const assetsDataRoot = path.join(root, "assets", "data");

const LEGACY_COURSE_ITEMS = [
  {
    file: "course-p.html",
    slug: "legacy-course-p",
    title: "\u5c0f\u5b78\u6578\u5b78 P",
    category: "P",
    level: "\u570b\u5c0f",
    summary: "\u6578\u611f\u3001\u61c9\u7528\u984c\u8207\u7af6\u8cfd\u5165\u9580\u3002",
    bullets: ["\u6578\u611f\u8207\u61c9\u7528\u984c", "\u79c1\u4e2d\u8207\u62d4\u5c16\u57fa\u790e", "\u7af6\u8cfd\u555f\u8499"],
    tags: ["\u570b\u5c0f", "P", "\u79c1\u4e2d"],
    keywords: ["\u570b\u5c0f", "P", "\u79c1\u4e2d", "\u7af6\u8cfd"],
    popularity: 80,
    freshness: 72
  },
  {
    file: "course-j.html",
    slug: "legacy-course-j",
    title: "\u570b\u4e2d\u6578\u5b78 J",
    category: "J",
    level: "\u570b\u4e2d",
    summary: "\u6821\u5167\u3001\u8cc7\u512a\u8207\u5f8c\u7e8c\u92dc\u63a5\u4e00\u8d77\u9867\u3002",
    bullets: ["\u4ee3\u6578\u8207\u5e7e\u4f55\u6df1\u5316", "\u7a69\u5b9a\u8d85\u524d", "\u8cc7\u512a\u984c\u578b\u8a13\u7df4"],
    tags: ["\u570b\u4e2d", "J", "\u8cc7\u512a"],
    keywords: ["\u570b\u4e2d", "J", "\u8cc7\u512a", "\u8d85\u524d"],
    popularity: 82,
    freshness: 72
  },
  {
    file: "course-fa00.html",
    slug: "legacy-course-fa00",
    title: "FA00 \u79d1\u5b78\u73ed / \u6578\u8cc7\u73ed\u5099\u8003",
    category: "FA00",
    level: "\u570b\u4e2d",
    summary: "\u79d1\u5b78\u73ed\u8207\u6578\u8cc7\u73ed\u7529\u9078\u984c\u578b\u5f37\u5316\u3002",
    bullets: ["\u9ad8\u9451\u5225\u984c\u578b", "\u8907\u8a66\u7b56\u7565", "\u77ed\u885d\u898f\u5283"],
    tags: ["FA00", "\u79d1\u5b78\u73ed", "\u6578\u8cc7\u73ed"],
    keywords: ["FA00", "\u79d1\u5b78\u73ed", "\u6578\u8cc7\u73ed", "\u8907\u8a66"],
    popularity: 86,
    freshness: 74
  },
  {
    file: "course-s.html",
    slug: "legacy-course-s",
    title: "\u9ad8\u4e2d\u6578\u5b78 S",
    category: "S",
    level: "\u9ad8\u4e2d",
    summary: "\u62bd\u8c61\u63a8\u7406\u8207\u89e3\u984c\u7d50\u69cb\u9032\u4e00\u6b65\u63d0\u5347\u3002",
    bullets: ["\u9ad8\u968e\u4ee3\u6578", "\u51fd\u6578\u8207\u8ad6\u8b49", "\u5b78\u6e2c\u96e3\u984c"],
    tags: ["\u9ad8\u4e2d", "S", "\u5b78\u6e2c"],
    keywords: ["\u9ad8\u4e2d", "S", "\u5b78\u6e2c", "\u4ee3\u6578"],
    popularity: 78,
    freshness: 70
  },
  {
    file: "course-ggb.html",
    slug: "legacy-course-ggb",
    title: "GGB \u5e7e\u4f55\u63a2\u7a76",
    category: "GGB",
    level: "\u570b\u4e2d / \u9ad8\u4e2d",
    summary: "\u7528\u52d5\u614b\u5e7e\u4f55\u5efa\u7acb\u89c0\u5bdf\u8207\u8b49\u660e\u80fd\u529b\u3002",
    bullets: ["\u52d5\u614b\u89c0\u5bdf", "\u731c\u60f3\u9a57\u8b49", "\u8b49\u660e\u524d\u8a13\u7df4"],
    tags: ["GGB", "\u5e7e\u4f55", "\u63a2\u7a76"],
    keywords: ["GGB", "\u5e7e\u4f55", "\u63a2\u7a76", "\u8b49\u660e"],
    popularity: 76,
    freshness: 68
  },
  {
    file: "course-science-camp.html",
    slug: "legacy-course-science-camp",
    title: "\u79d1\u5b78\u73ed\u524d\u77bb\u71df",
    category: "\u79d1\u5b78\u73ed\u524d\u77bb\u71df",
    level: "\u570b\u4e2d",
    summary: "\u4e3b\u984c\u5f0f\u63a2\u7a76\u8207\u8de8\u79d1\u6574\u5408\u6696\u8eab\u3002",
    bullets: ["\u4e3b\u984c\u63a2\u7a76", "\u8de8\u79d1\u6574\u5408", "\u524d\u77bb\u71df"],
    tags: ["\u71df\u968a", "\u79d1\u5b78\u73ed", "\u63a2\u7a76"],
    keywords: ["\u71df\u968a", "\u79d1\u5b78\u73ed", "\u63a2\u7a76", "\u524d\u77bb\u71df"],
    popularity: 79,
    freshness: 71
  },
  {
    file: "course-amc-aime.html",
    slug: "legacy-course-amc-aime",
    title: "FA \u9ad8\u968e\u7af6\u8cfd",
    category: "FA",
    level: "\u570b\u4e2d / \u9ad8\u4e2d",
    summary: "\u92dc\u63a5 AMC / AIME \u8207\u66f4\u9ad8\u968e\u7af6\u8cfd\u9700\u6c42\u3002",
    bullets: ["AMC / AIME", "\u9ad8\u968e\u6578\u8ad6", "\u9577\u7dda\u7af6\u8cfd\u5e03\u5c40"],
    tags: ["FA", "AMC", "AIME"],
    keywords: ["FA", "AMC", "AIME", "\u7af6\u8cfd"],
    popularity: 84,
    freshness: 73
  }
];
function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeAssignedGlobal(filePath, globalName, value) {
  fs.writeFileSync(filePath, `window.${globalName} = ${JSON.stringify(value, null, 2)};\n`, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugFromFileName(filePath) {
  return path.basename(filePath, ".json");
}

function listArticleFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .filter((name) => !name.startsWith("_") && name.toLowerCase() !== "categories.json")
    .sort()
    .map((name) => path.join(dirPath, name));
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function sortByDateDesc(items) {
  return items.sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0));
}

function decodeHtml(value) {
  const map = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => map[name.toLowerCase()] || `&${name};`);
}

function stripTags(html) {
  return decodeHtml(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function htmlToParagraphs(html) {
  const matches = String(html || "").match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi) || [];
  if (matches.length) {
    const paragraphs = matches
      .map((block) => stripTags(block))
      .map((value) => value.trim())
      .filter(Boolean);
    if (paragraphs.length) return paragraphs;
  }

  return stripTags(html)
    .split(/\n{2,}/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function fileNameFromCover(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return path.basename(raw.split("?")[0]);
}

function deriveCourseFile(item) {
  const slug = String(item.slug || "").toLowerCase();
  const code = String(item.code || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  const category = String(item.category || "").toLowerCase();

  if (slug.includes("fa00") || code.includes("fa00") || category.includes("fa00") || title.includes("fa00")) return "course-fa00.html";
  if (slug.includes("amc") || title.includes("aime")) return "course-amc-aime.html";
  if (slug.includes("science-camp") || title.includes("???")) return "course-science-camp.html";
  if (slug.includes("ggb") || title.includes("ggb")) return "course-ggb.html";
  if (/\b(?:course-)?j\b/.test(slug) || title.includes("???? j")) return "course-j.html";
  if (/\b(?:course-)?p\b/.test(slug) || title.includes("???? p")) return "course-p.html";
  if (/\b(?:course-)?s\b/.test(slug) || title.includes("???? s")) return "course-s.html";
  return "";
}

function loadArticleSources(sectionName) {
  return listArticleFiles(path.join(contentRoot, sectionName)).map((filePath) => {
    const value = readJson(filePath);
    if (!value.slug) value.slug = slugFromFileName(filePath);
    return value;
  });
}

function buildEliteItems() {
  const items = loadArticleSources("elite").map((item) => {
    const coverImage = item.coverImage || item.cover || item.imageUrl || "";
    const excerpt = item.excerpt || item.summary || "";
    return {
      slug: item.slug,
      title: item.title || "",
      date: item.date || "",
      category: item.category || "",
      bucket: item.bucket || "獵豹菁英",
      summary: item.summary || excerpt,
      excerpt,
      sourceUrl: item.sourceUrl || "",
      cover: coverImage,
      imageName: item.imageName || fileNameFromCover(coverImage),
      tags: unique(item.tags || []),
      keep: item.keep || "保留",
      targetPage: item.targetPage || "students.html",
      bodyHtml: item.bodyHtml || "",
      bodyText: stripTags(item.bodyHtml || ""),
      imageUrl: item.imageUrl || coverImage || item.sourceUrl || "",
      notes: item.notes || "",
      migrationPage: item.migrationPage || ""
    };
  });

  return sortByDateDesc(items);
}

function buildColumnsModel() {
  const categoriesPath = path.join(contentRoot, "columns", "categories.json");
  const categories = fs.existsSync(categoriesPath) ? readJson(categoriesPath) : [];
  const items = loadArticleSources("columns").map((item) => {
    const coverImage = item.coverImage || item.cover || item.imageUrl || "";
    const excerpt = item.excerpt || item.summary || "";
    return {
      slug: item.slug,
      legacyId: item.legacyId || 0,
      title: item.title || "",
      date: item.date || "",
      category: item.category || "",
      categorySlug: item.categorySlug || "",
      bucket: item.bucket || "文章專欄",
      summary: item.summary || excerpt,
      excerpt,
      sourceUrl: item.sourceUrl || "",
      coverImage,
      cover: coverImage,
      imageName: item.imageName || fileNameFromCover(coverImage),
      tags: unique(item.tags || []),
      keep: item.keep || "保留",
      targetPage: item.targetPage || "columns.html",
      bodyHtml: item.bodyHtml || "",
      bodyText: stripTags(item.bodyHtml || ""),
      imageUrl: item.imageUrl || coverImage || item.sourceUrl || "",
      notes: item.notes || "",
      migrationPage: item.migrationPage || "",
      listDescription: item.listDescription || item.summary || excerpt,
      legacyCategoryUrl: item.legacyCategoryUrl || "",
      legacyCategoryId: item.legacyCategoryId || 0
    };
  });

  return {
    categories,
    items: sortByDateDesc(items)
  };
}

function buildMomsItems() {
  const items = loadArticleSources("moms").map((item) => {
    const bodyHtml = item.bodyHtml || "";
    const bodyParagraphs = Array.isArray(item.body) && item.body.length ? item.body : htmlToParagraphs(bodyHtml);
    return {
      slug: item.slug,
      title: item.title || "",
      date: item.date || "",
      category: item.category || "",
      tags: unique(item.tags || []),
      keywords: unique(item.keywords || []),
      summary: item.summary || "",
      cover: item.coverLabel || item.cover || "",
      popularity: Number.isFinite(item.popularity) ? item.popularity : 80,
      freshness: Number.isFinite(item.freshness) ? item.freshness : 80,
      body: bodyParagraphs,
      bodyHtml,
      bodyText: stripTags(bodyHtml),
      keep: item.keep || "保留"
    };
  });

  return sortByDateDesc(items);
}

function buildNewsItems() {
  const items = loadArticleSources("news").map((item) => {
    const coverImage = item.coverImage || item.cover || item.imageUrl || "";
    const excerpt = item.excerpt || item.summary || "";
    return {
      slug: item.slug,
      title: item.title || "",
      date: item.date || "",
      category: item.category || "????",
      summary: item.summary || excerpt,
      excerpt,
      sourceUrl: item.sourceUrl || "",
      coverImage,
      cover: item.coverLabel || item.cover || item.category || "????",
      imageName: item.imageName || fileNameFromCover(coverImage),
      tags: unique(item.tags || []),
      keywords: unique(item.keywords || []),
      keep: item.keep || "??",
      targetPage: item.targetPage || "news.html",
      bodyHtml: item.bodyHtml || "",
      bodyText: stripTags(item.bodyHtml || ""),
      imageUrl: item.imageUrl || coverImage || item.sourceUrl || "",
      notes: item.notes || "",
      migrationPage: item.migrationPage || "",
      listDescription: item.listDescription || item.summary || excerpt,
      popularity: Number.isFinite(item.popularity) ? item.popularity : 82,
      freshness: Number.isFinite(item.freshness) ? item.freshness : 92
    };
  });

  return sortByDateDesc(items);
}

function buildCoursesItems() {
  const legacyItems = LEGACY_COURSE_ITEMS.map((item) => ({
    slug: item.slug,
    file: item.file,
    title: item.title,
    date: "",
    category: item.category,
    code: "",
    level: item.level,
    bucket: "\u8ab2\u7a0b\u7e3d\u89bd",
    summary: item.summary,
    excerpt: item.summary,
    sourceUrl: "",
    coverImage: "",
    cover: "",
    imageName: "",
    tags: unique(item.tags || []),
    keywords: unique(item.keywords || item.tags || []),
    bullets: Array.isArray(item.bullets) ? item.bullets : [],
    keep: "\u4fdd\u7559",
    targetPage: "courses.html",
    bodyHtml: "",
    bodyText: Array.isArray(item.bullets) ? item.bullets.join(" ") : "",
    imageUrl: "",
    notes: "\u5167\u5efa\u8ab2\u7a0b\u7d22\u5f15",
    migrationPage: "",
    popularity: Number.isFinite(item.popularity) ? item.popularity : 80,
    freshness: Number.isFinite(item.freshness) ? item.freshness : 72
  }));

  const items = loadArticleSources("courses").map((item) => {
    const coverImage = item.coverImage || item.cover || item.imageUrl || "";
    const excerpt = item.excerpt || item.summary || "";
    const file = item.file || deriveCourseFile(item);
    const fallbackBullets = unique([item.code, item.level].concat((item.tags || []).slice(0, 3))).filter(Boolean).slice(0, 3);
    const normalized = {
      slug: item.slug,
      file,
      title: item.title || "",
      date: item.date || "",
      category: item.category || "",
      code: item.code || "",
      level: item.level || "",
      bucket: item.bucket || "\u8ab2\u7a0b\u7e3d\u89bd",
      summary: item.summary || excerpt,
      excerpt,
      sourceUrl: item.sourceUrl || "",
      coverImage,
      cover: coverImage,
      imageName: item.imageName || fileNameFromCover(coverImage),
      tags: unique(item.tags || []),
      keywords: unique(item.keywords || []),
      bullets: Array.isArray(item.bullets) && item.bullets.length ? item.bullets : fallbackBullets,
      keep: item.keep || "\u4fdd\u7559",
      targetPage: item.targetPage || "courses.html",
      bodyHtml: item.bodyHtml || "",
      bodyText: stripTags(item.bodyHtml || ""),
      imageUrl: item.imageUrl || coverImage || item.sourceUrl || "",
      notes: item.notes || "",
      migrationPage: item.migrationPage || "",
      popularity: Number.isFinite(item.popularity) ? item.popularity : 80,
      freshness: Number.isFinite(item.freshness) ? item.freshness : 80
    };

    if (file === "course-fa00.html") {
      return {
        ...normalized,
        title: "\u3010\u7375\u8c792026\u65b0\u7248 FA00\u3011AI\u5e74\u4ee3\uff0c\u6539\u8b8a\u5b69\u5b50\u4e00\u751f\u7684\u6578\u5b78\u8ab2\u7a0b",
        category: "\u79d1\u5b78\u73edFA00",
        level: "\u570b\u4e2d",
        bucket: "\u8ab2\u7a0b\u7e3d\u89bd",
        summary: "\u7375\u8c79FA00\u516b\u5927\u9802\u5c16\u540d\u5e2b\u806f\u624b\uff0c51\u5802\u9304\u64ad\uff0b2\u6b21\u7dda\u4e0a\u6a21\u8003\uff0c\u8d85\u904e145\u5c0f\u6642\u83c1\u82f1\u6578\u5b78\u57f9\u8a13\u30022026\u65b0\u7248\u65b0\u589e\u79d1\u5b78\u73ed\u8907\u8a66\u984c\u578b\u8207AMC/AIME\u6df1\u6c34\u5340\u89e3\u6790\u3002",
        excerpt: "\u7375\u8c79FA00\u662f\u5168\u53f0\u6700\u5f37\u79d1\u5b78\u73ed\u5099\u8003\u8ab2\u7a0b\uff0c\u516b\u5927\u9802\u5c16\u540d\u5e2b\u7cbe\u5fc3\u8a2d\u8a08\uff0c\u8a13\u7df4\u4f60\u6210\u70ba\u771f\u6b63\u7684\u6578\u5b78\u9ad8\u624b\u3002",
        tags: ["\u79d1\u5b78\u73edFA00", "\u79d1\u5b78\u73ed", "\u6578\u8cc7\u73ed", "AMC", "AIME", "FA00", "2026", "\u7af6\u8cfd\u6578\u5b78"],
        keywords: ["\u79d1\u5b78\u73ed\u5099\u8003", "\u6578\u8cc7\u73ed", "FA00", "AMC", "AIME", "\u7af6\u8cfd\u6578\u5b78", "2026"],
        bullets: ["\u79d1\u5b78\u73ed\u8907\u8a66\u984c\u578b", "AMC / AIME \u6df1\u6c34\u5340", "145 \u5c0f\u6642\u83c1\u82f1\u57f9\u8a13"],
        keep: "\u4fdd\u7559",
        notes: "2026-04-05 \u6574\u7406\u81ea\u516c\u958b Facebook \u8cbc\u6587 https://www.facebook.com/share/p/1Fpjqx9842/"
      };
    }

    return normalized;
  });

  const merged = new Map(legacyItems.map((item) => [item.file || item.slug, item]));
  items.forEach((item) => merged.set(item.file || item.slug, item));
  return sortByDateDesc(Array.from(merged.values()));
}
function main() {
  ensureDir(assetsDataRoot);

  const eliteItems = buildEliteItems();
  writeJson(path.join(assetsDataRoot, "elite-data.json"), eliteItems);
  writeAssignedGlobal(path.join(assetsDataRoot, "elite-data.js"), "__ELITE_DATA__", eliteItems);

  const columnsModel = buildColumnsModel();
  writeJson(path.join(assetsDataRoot, "columns-data.json"), columnsModel);
  writeAssignedGlobal(path.join(assetsDataRoot, "columns-data.js"), "__COLUMNS_DATA__", columnsModel);

  const momsItems = buildMomsItems();
  writeJson(path.join(assetsDataRoot, "moms-data.json"), momsItems);
  writeAssignedGlobal(path.join(assetsDataRoot, "moms-data.js"), "__MOMS_DATA__", momsItems);

  const newsItems = buildNewsItems();
  writeJson(path.join(assetsDataRoot, "news-data.json"), newsItems);
  writeAssignedGlobal(path.join(assetsDataRoot, "news-data.js"), "__NEWS_DATA__", newsItems);

  const coursesItems = buildCoursesItems();
  writeJson(path.join(assetsDataRoot, "courses-data.json"), coursesItems);
  writeAssignedGlobal(path.join(assetsDataRoot, "courses-data.js"), "__COURSES_DATA__", coursesItems);

  console.log(`Rebuilt elite=${eliteItems.length}, columns=${columnsModel.items.length}, moms=${momsItems.length}, news=${newsItems.length}, courses=${coursesItems.length}`);
}

main();

