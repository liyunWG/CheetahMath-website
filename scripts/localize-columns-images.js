const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "assets", "data", "columns-data.json");
const jsPath = path.join(root, "assets", "data", "columns-data.js");
const imageDir = path.join(root, "pic", "columns");

function sanitizeUrl(url) {
  return String(url || "").replace("https://www.cheetahstem.com//", "https://www.cheetahstem.com/");
}

function toRelative(absPath) {
  return absPath.replace(root + path.sep, "").split(path.sep).join("/");
}

function fileNameForUrl(url, usedNames) {
  const parsed = new URL(url);
  const rawName = path.basename(parsed.pathname) || "image.jpg";
  const cleanName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!usedNames.has(cleanName)) {
    usedNames.add(cleanName);
    return cleanName;
  }
  const ext = path.extname(cleanName);
  const base = path.basename(cleanName, ext);
  const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
  const nextName = `${base}-${hash}${ext || ".jpg"}`;
  usedNames.add(nextName);
  return nextName;
}

async function download(url, dest) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36"
    }
  });
  if (!response.ok) throw new Error(`Download failed ${response.status} for ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const items = Array.isArray(data.items) ? data.items : [];
  fs.mkdirSync(imageDir, { recursive: true });

  const usedNames = new Set(fs.readdirSync(imageDir, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name));
  const urlMap = new Map();

  items.forEach((item) => {
    const bodyHtml = String(item.bodyHtml || "");
    const urls = bodyHtml.match(/https:\/\/[^\"'\s>]+/g) || [];
    urls.concat([item.coverImage, item.cover, item.imageUrl]).forEach((url) => {
      const normalized = sanitizeUrl(url);
      if (/^https:\/\/www\.cheetahstem\.com\//i.test(normalized) && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(normalized)) {
        if (!urlMap.has(normalized)) urlMap.set(normalized, null);
      }
    });
  });

  let index = 0;
  for (const url of urlMap.keys()) {
    index += 1;
    const fileName = fileNameForUrl(url, usedNames);
    const dest = path.join(imageDir, fileName);
    if (!fs.existsSync(dest)) {
      await download(url, dest);
    }
    urlMap.set(url, toRelative(dest));
    if (index % 50 === 0 || index === urlMap.size) {
      console.log(`Downloaded ${index}/${urlMap.size}`);
    }
  }

  items.forEach((item) => {
    ["coverImage", "cover", "imageUrl"].forEach((key) => {
      const normalized = sanitizeUrl(item[key]);
      if (urlMap.has(normalized)) item[key] = urlMap.get(normalized);
    });
    let bodyHtml = String(item.bodyHtml || "").replaceAll("https://www.cheetahstem.com//", "https://www.cheetahstem.com/");
    for (const [remote, local] of urlMap.entries()) {
      bodyHtml = bodyHtml.split(remote).join(local);
      bodyHtml = bodyHtml.split(remote.replace("https://www.cheetahstem.com/", "https://www.cheetahstem.com//")).join(local);
    }
    item.bodyHtml = bodyHtml;
    item.imageName = item.coverImage ? path.basename(String(item.coverImage)) : item.imageName || "";
  });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  fs.writeFileSync(jsPath, `window.__COLUMNS_DATA__ = ${JSON.stringify(data, null, 2)};\n`, "utf8");
  console.log(`Localized ${urlMap.size} images into ${imageDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
