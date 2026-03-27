const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'assets', 'data', 'about-data.json');
const jsPath = path.join(root, 'assets', 'data', 'about-data.js');
const exportDir = path.join(root, 'migration-data', 'current', 'about-cheetah-batch-01-template');
const csvPath = path.join(exportDir, 'content-migration-about-cheetah-batch-01-template.csv');
const picDir = path.join(root, 'pic', 'about');

const pages = [
  { slug: 'about-intro', section: '關於我們', title: '獵豹簡介', sourceUrl: 'https://www.cheetahstem.com/about/10', targetPage: 'about.html' },
  { slug: 'about-founders', section: '關於我們', title: '創辦與經營團隊', sourceUrl: 'https://www.cheetahstem.com/about/4', targetPage: 'about.html' },
  { slug: 'about-advisors', section: '關於我們', title: '師資顧問團隊', sourceUrl: 'https://www.cheetahstem.com/about/11', targetPage: 'about.html' },
  { slug: 'feature-curriculum', section: '獵豹特色', title: '課程體系', sourceUrl: 'https://www.cheetahstem.com/service/12', targetPage: 'features.html' },
  { slug: 'feature-course-strengths', section: '獵豹特色', title: '課程特色', sourceUrl: 'https://www.cheetahstem.com/service/11', targetPage: 'features.html' },
  { slug: 'feature-learning-method', section: '獵豹特色', title: '學習方法', sourceUrl: 'https://www.cheetahstem.com/service/14', targetPage: 'features.html' },
  { slug: 'feature-core-edge', section: '獵豹特色', title: '競爭核心', sourceUrl: 'https://www.cheetahstem.com/service/7', targetPage: 'features.html' },
  { slug: 'feature-global-vision', section: '獵豹特色', title: '全球視野', sourceUrl: 'https://www.cheetahstem.com/service/3', targetPage: 'features.html' }
];

function decodeHtml(value) {
  const map = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => map[name.toLowerCase()] || '&' + name + ';');
}

function stripTags(html) {
  return decodeHtml(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function buildSummary(bodyText) {
  const cleaned = String(bodyText || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned.length > 120 ? cleaned.slice(0, 120).trim() + '…' : cleaned;
}

function csvEscape(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36'
    }
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}`);
  return response.text();
}

async function downloadBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36'
    }
  });
  if (!response.ok) throw new Error(`Image fetch failed ${response.status} for ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function sanitizeBodyHtml(html) {
  return String(html || '')
    .replace(/\sdata-ms-editor="[^"]*"/gi, '')
    .replace(/\sspellcheck="[^"]*"/gi, '')
    .replace(/src="\/\//gi, 'src="https://')
    .replace(/href="\/\//gi, 'href="https://')
    .replace(/src="(\/[^"]+)"/gi, (_, value) => `src="https://www.cheetahstem.com${value}"`)
    .replace(/href="(\/[^"]+)"/gi, (_, value) => `href="https://www.cheetahstem.com${value}"`)
    .replace(/<a[^>]*>\s*<img[^>]*按鈕TOP_2020[^>]*>\s*<\/a>/gi, '')
    .replace(/<a[^>]*>\s*gotop\s*<\/a>/gi, '')
    .replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/gi, '')
    .trim();
}

function curateCurriculum(item) {
  if (item.slug !== 'feature-curriculum') return item;

  const naturalMarkers = ['\u3010\u81ea\u7136\u79d1\u5b78\u7cfb\u5217\u3011', '\u3016\u81ea\u7136\u79d1\u5b78\u7cfb\u5217\u3017'];
  const softwareMarkers = ['\u3010\u7a0b\u5f0f\u8207\u8edf\u9ad4\u76f8\u95dc\u8ab2\u7a0b\u7cfb\u5217\u3011', '\u3016\u7a0b\u5f0f\u8207\u8edf\u9ad4\u76f8\u95dc\u8ab2\u7a0b\u7cfb\u5217\u3017'];
  const softwareMarker = softwareMarkers[1];
  const ggbHeading = 'GGB\u7cfb\u5217\uff1a\u6578\u5b78\u8207\u8a08\u7b97\u6a5f\u6574\u5408\u7684\u7279\u8272\u8ab2\u7a0b';
  const ggbDescription = '\u5c07Geogebra\u8edf\u9ad4\u7d50\u5408\u570b\u4e2d\u5c0f\u6578\u5b78\u77e5\u8b58\u80cc\u666f\u7684\u60c5\u5883\u5316\u3001\u8108\u7d61\u5316\u3001\u5f37\u8abf\u61c9\u7528\u5be6\u8e10\u7684\u7d20\u990a\u6559\u80b2\u3002';
  const ggbText = [softwareMarker, '', ggbHeading, ggbDescription].join('\n');

  let draftBody = item.draftBody;
  for (const marker of naturalMarkers) {
    const index = draftBody.indexOf(marker);
    if (index >= 0) { draftBody = draftBody.slice(0, index); break; }
  }
  for (const marker of softwareMarkers) {
    const index = draftBody.indexOf(marker);
    if (index >= 0) { draftBody = draftBody.slice(0, index); break; }
  }
  draftBody = [draftBody.trim(), '', ggbText].join('\n').replace(/\n{3,}/g, '\n\n').trim();

  let bodyHtml = item.bodyHtml;
  for (const marker of naturalMarkers) {
    const index = bodyHtml.indexOf(marker);
    if (index >= 0) { bodyHtml = bodyHtml.slice(0, index); break; }
  }
  for (const marker of softwareMarkers) {
    const index = bodyHtml.indexOf(marker);
    if (index >= 0) { bodyHtml = bodyHtml.slice(0, index); break; }
  }
  bodyHtml = bodyHtml.trim() + '\n<div class="about-curated-block"><hr /><h4><span style="color:#2980b9;"><strong>' + softwareMarker + '</strong></span></h4><p><strong>' + ggbHeading + '</strong><br />' + ggbDescription + '</p></div>';

  return {
    ...item,
    summary: buildSummary(draftBody),
    draftBody,
    bodyText: stripTags(bodyHtml),
    bodyHtml
  };
}

async function localizeImages(item) {
  let index = 0;
  let coverImage = '';
  let bodyHtml = item.bodyHtml.replace(/src="([^"]+)"/gi, (match, src) => {
    if (!/^https?:\/\//i.test(src)) return match;
    if (/site_info\//i.test(src)) return match;
    const extMatch = src.match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const filename = `${item.slug}-${String(index + 1).padStart(2, '0')}.${ext}`;
    const targetPath = path.join(picDir, filename);
    imageJobs.push({ src, targetPath });
    index += 1;
    const local = `pic/about/${filename}`;
    if (!coverImage) coverImage = local;
    return `src="${local}"`;
  });
  bodyHtml = bodyHtml.replace(/https:\/\/www\.cheetahstem\.com\/\/upload\//g, 'https://www.cheetahstem.com/upload/');
  return { ...item, bodyHtml, coverImage };
}

const imageJobs = [];

async function main() {
  fs.mkdirSync(picDir, { recursive: true });
  const items = [];
  for (const page of pages) {
    const html = await fetchText(page.sourceUrl);
    const bodyMatch = html.match(/<article class="editor clearfix"[^>]*>\s*([\s\S]*?)\s*<\/article>/i);
    const rawBody = bodyMatch ? bodyMatch[1] : '';
    const normalizedBody = sanitizeBodyHtml(rawBody);
    const bodyText = stripTags(normalizedBody);
    let item = {
      slug: page.slug,
      section: page.section,
      title: page.title,
      sourceUrl: page.sourceUrl,
      targetPage: page.targetPage,
      summary: buildSummary(bodyText),
      draftBody: bodyText,
      bodyHtml: normalizedBody,
      bodyText,
      tags: [page.section, page.title],
      keep: '保留'
    };
    item = curateCurriculum(item);
    item = await localizeImages(item);
    items.push(item);
    console.log(`Fetched ${page.title}`);
  }

  for (const job of imageJobs) {
    if (!fs.existsSync(job.targetPath)) {
      const buffer = await downloadBuffer(job.src);
      fs.writeFileSync(job.targetPath, buffer);
    }
  }

  const payload = {
    sections: [
      {
        page: 'about.html',
        title: '關於獵豹',
        intro: '集中整理品牌介紹、創辦與經營團隊、師資顧問團隊，讓家長先看懂獵豹是誰、由誰帶領、核心教學團隊有什麼背景。',
        slugs: ['about-intro', 'about-founders', 'about-advisors']
      },
      {
        page: 'features.html',
        title: '獵豹特色',
        intro: '整理課程體系、課程特色、學習方法、競爭核心與全球視野，保留品牌主張，同時依你的要求裁掉不需要的舊課程段落。',
        slugs: ['feature-curriculum', 'feature-course-strengths', 'feature-learning-method', 'feature-core-edge', 'feature-global-vision']
      }
    ],
    items
  };

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  fs.writeFileSync(jsPath, `window.__ABOUT_DATA__ = ${JSON.stringify(payload, null, 2)};\n`, 'utf8');

  fs.mkdirSync(exportDir, { recursive: true });
  const rows = [[
    '所屬區塊','頁面名稱','slug','摘要AI生成','來源網址','對應新頁面','是否保留','內文原稿','備註'
  ].map(csvEscape).join(',')];
  items.forEach((item) => {
    rows.push([
      item.section,
      item.title,
      item.slug,
      item.summary,
      item.sourceUrl,
      item.targetPage,
      item.keep,
      item.draftBody,
      ''
    ].map(csvEscape).join(','));
  });
  fs.writeFileSync(csvPath, '\uFEFF' + rows.join('\n'), 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
