// 把「關於獵豹」頁（about.html）預先渲染成靜態 HTML，讓 Google 與不執行 JavaScript 的
// AI 爬蟲（GPTBot / ClaudeBot / PerplexityBot 等）直接讀到內文與常見問答。
//
// 做兩件事：
//   1. 用 jsdom 執行與瀏覽器相同的 about-pages.js，把「獵豹簡介」渲染結果寫進 #about-detail。
//   2. 依 content/about/about-intro.json 的 faq，在 <head> 寫入 FAQPage 結構化資料（JSON-LD），
//      讓搜尋引擎與 AI 能辨識問答並引用本頁。
//
// 執行：先跑 scripts/sync-about-data.js，再跑本檔（「更新資料.bat」會依序執行）。
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'about.html');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/+$/, '');
const pageUrl = origin + '/about.html';

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const html = read('about.html');
const dom = new JSDOM(html, { url: pageUrl, runScripts: 'outside-only' });
const w = dom.window;
w.scrollTo = function () {};
w.Element.prototype.scrollIntoView = function () {};
w.eval(read('assets/data/about-data.js'));
w.eval(read('assets/js/about-pages.js'));
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

const detail = w.document.querySelector('#about-detail');
if (!detail || !detail.innerHTML.trim()) {
  console.error('about.html 渲染失敗：找不到 #about-detail 內容');
  process.exit(1);
}

const startTag = '<div id="about-detail">';
const start = html.indexOf(startTag);
const end = html.indexOf('</div></div></section></main>', start);
if (start === -1 || end === -1) {
  console.error('about.html 結構與預期不同，找不到 #about-detail 的位置');
  process.exit(1);
}
let out = html.slice(0, start + startTag.length) + detail.innerHTML + html.slice(end);

const intro = JSON.parse(read('content/about/about-intro.json').replace(/^﻿/, '')).intro || {};
const faqItems = [];
for (const group of (intro.faq && intro.faq.groups) || []) {
  for (const entry of group.items || []) faqItems.push(entry);
}
const ldPattern = /\n?\s*<script type="application\/ld\+json" id="about-faq-ld">[\s\S]*?<\/script>/;
out = out.replace(ldPattern, '');
if (faqItems.length) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': pageUrl + '#about-faq',
    url: pageUrl,
    name: (intro.faq.title || '常見問答') + '｜獵豹科教CheetahSTEM',
    inLanguage: 'zh-Hant',
    about: {
      '@type': 'EducationalOrganization',
      name: '獵豹科教 CheetahSTEM',
      alternateName: ['獵豹科教', '獵豹數學', 'CheetahSTEM', 'CheetahMath'],
      url: origin + '/',
      description: intro.positioning || ''
    },
    mainEntity: faqItems.map(function (entry) {
      return {
        '@type': 'Question',
        name: entry.q,
        acceptedAnswer: { '@type': 'Answer', text: entry.a }
      };
    })
  };
  const json = JSON.stringify(ld, null, 2).replace(/</g, '\\u003c');
  out = out.replace('</head>', '  <script type="application/ld+json" id="about-faq-ld">\n' + json + '\n  </script>\n</head>');
}

fs.writeFileSync(pagePath, out, 'utf8');
console.log('已預先渲染 about.html（常見問答 ' + faqItems.length + ' 題，含 FAQPage 結構化資料）');
