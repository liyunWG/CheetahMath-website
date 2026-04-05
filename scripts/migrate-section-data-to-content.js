const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const contentRoot = path.join(root, "content");
const assetsDataRoot = path.join(root, "assets", "data");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function loadAssignedGlobal(filePath, globalName) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(readText(filePath), context, { filename: filePath });
  return context.window[globalName];
}

function fileNameFromCover(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return path.basename(raw.split("?")[0]);
}

function momsParagraphsToHtml(paragraphs) {
  return (paragraphs || [])
    .map(
      (paragraph) =>
        `<p class="normal-txt"><span style="font-size:24px;">${String(paragraph || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</span></p>`
    )
    .join("\n");
}

function writeArticleFiles(sectionName, items) {
  const dirPath = path.join(contentRoot, sectionName);
  ensureDir(dirPath);
  items.forEach((item) => {
    writeJson(path.join(dirPath, `${item.slug}.json`), item);
  });
}

function buildEliteSources() {
  const items = readJson(path.join(assetsDataRoot, "elite-data.json"));
  return items.map((item) => ({
    slug: item.slug,
    title: item.title || "",
    date: item.date || "",
    category: item.category || "",
    categorySlug: "",
    bucket: item.bucket || "獵豹菁英",
    summary: item.summary || "",
    excerpt: item.excerpt || "",
    sourceUrl: item.sourceUrl || "",
    coverImage: item.cover || item.imageUrl || "",
    imageUrl: item.imageUrl || item.cover || "",
    imageName: item.imageName || fileNameFromCover(item.cover || item.imageUrl || ""),
    tags: item.tags || [],
    keywords: [],
    keep: item.keep || "保留",
    targetPage: item.targetPage || "students.html",
    bodyHtml: item.bodyHtml || "",
    notes: item.notes || "",
    migrationPage: item.migrationPage || "",
    listDescription: "",
    legacyId: item.legacyId || 0,
    legacyCategoryId: item.legacyCategoryId || 0,
    legacyCategoryUrl: item.legacyCategoryUrl || "",
    coverLabel: "",
    popularity: 0,
    freshness: 0
  }));
}

function buildColumnsSources() {
  const model = readJson(path.join(assetsDataRoot, "columns-data.json"));
  const dirPath = path.join(contentRoot, "columns");
  ensureDir(dirPath);
  writeJson(path.join(dirPath, "categories.json"), model.categories || []);

  return (model.items || []).map((item) => ({
    slug: item.slug,
    title: item.title || "",
    date: item.date || "",
    category: item.category || "",
    categorySlug: item.categorySlug || "",
    bucket: item.bucket || "文章專欄",
    summary: item.summary || "",
    excerpt: item.excerpt || "",
    sourceUrl: item.sourceUrl || "",
    coverImage: item.coverImage || item.cover || item.imageUrl || "",
    imageUrl: item.imageUrl || item.coverImage || item.cover || "",
    imageName: item.imageName || fileNameFromCover(item.coverImage || item.cover || ""),
    tags: item.tags || [],
    keywords: [],
    keep: item.keep || "保留",
    targetPage: item.targetPage || "columns.html",
    bodyHtml: item.bodyHtml || "",
    notes: item.notes || "",
    migrationPage: item.migrationPage || "",
    listDescription: item.listDescription || "",
    legacyId: item.legacyId || 0,
    legacyCategoryId: item.legacyCategoryId || 0,
    legacyCategoryUrl: item.legacyCategoryUrl || "",
    coverLabel: "",
    popularity: item.popularity || 0,
    freshness: item.freshness || 0
  }));
}

function buildMomSources() {
  const items = loadAssignedGlobal(path.join(assetsDataRoot, "moms-data.js"), "__MOMS_DATA__") || [];
  return items.map((item) => ({
    slug: item.slug,
    title: item.title || "",
    date: item.date || "",
    category: item.category || "",
    categorySlug: "",
    bucket: "星媽正能量",
    summary: item.summary || "",
    excerpt: "",
    sourceUrl: "",
    coverImage: "",
    imageUrl: "",
    imageName: "",
    tags: item.tags || [],
    keywords: item.keywords || [],
    keep: item.keep || "保留",
    targetPage: "mom-power.html",
    bodyHtml: momsParagraphsToHtml(item.body || []),
    notes: "",
    migrationPage: "",
    listDescription: "",
    legacyId: 0,
    legacyCategoryId: 0,
    legacyCategoryUrl: "",
    coverLabel: item.cover || "",
    popularity: item.popularity || 80,
    freshness: item.freshness || 80
  }));
}

function writeTemplates() {
  const templateDir = path.join(contentRoot, "templates");
  ensureDir(templateDir);

  const baseTemplate = {
    slug: "replace-with-slug",
    title: "請填寫文章標題",
    date: "2026-04-04",
    category: "請填寫分類名稱",
    categorySlug: "",
    bucket: "獵豹菁英",
    summary: "請填寫列表摘要。",
    excerpt: "",
    sourceUrl: "",
    coverImage: "pic/your-cover-image.jpg",
    imageUrl: "pic/your-cover-image.jpg",
    imageName: "your-cover-image.jpg",
    tags: ["請填標籤 1", "請填標籤 2"],
    keywords: [],
    keep: "保留",
    targetPage: "students.html",
    bodyHtml: "<div class=\"is-container-in\"><div class=\"remote-row clearfix\"><div class=\"column full\"><h1 class=\"size-38 is-title1-48 is-title-bold\">請填寫文章標題</h1></div></div><div class=\"remote-row clearfix\"><div class=\"column full\"><p class=\"normal-txt\"><span style=\"font-size:24px;\">請把正文 HTML 放在這裡。</span></p></div></div></div>",
    notes: "",
    migrationPage: "",
    listDescription: "",
    legacyId: 0,
    legacyCategoryId: 0,
    legacyCategoryUrl: "",
    coverLabel: "",
    popularity: 84,
    freshness: 80
  };

  writeJson(path.join(templateDir, "elite-template.json"), baseTemplate);
  writeJson(path.join(templateDir, "columns-template.json"), {
    ...baseTemplate,
    bucket: "文章專欄",
    targetPage: "columns.html",
    categorySlug: "replace-category-slug",
    coverImage: "pic/columns/your-cover-image.jpg",
    imageUrl: "pic/columns/your-cover-image.jpg"
  });
  writeJson(path.join(templateDir, "moms-template.json"), {
    ...baseTemplate,
    bucket: "星媽正能量",
    targetPage: "mom-power.html",
    coverImage: "",
    imageUrl: "",
    imageName: "",
    coverLabel: "封面標籤文字",
    keywords: ["請填關鍵字 1", "請填關鍵字 2"],
    popularity: 90,
    freshness: 90
  });
}

function main() {
  ensureDir(contentRoot);
  writeArticleFiles("elite", buildEliteSources());
  writeArticleFiles("columns", buildColumnsSources());
  writeArticleFiles("moms", buildMomSources());
  writeTemplates();
  console.log("Migrated elite / columns / moms into single-article JSON files.");
}

main();
