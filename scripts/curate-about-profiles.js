// 將 about-data 中「創辦與經營團隊」「師資顧問團隊」的原始文字
// 解析成結構化 profiles（role / name / paragraphs / bullets / image），
// 並為「獵豹簡介」建立結構化 intro 區塊，寫回 about-data.json 與 about-data.js。
// 可重複執行（從 draftBody / bodyHtml 原始欄位重新產生）。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'assets', 'data', 'about-data.json');
const jsPath = path.join(root, 'assets', 'data', 'about-data.js');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function normalizeLines(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line && line !== '}');
}

function imagesInOrder(item) {
  const seen = new Set();
  const out = [];
  for (const match of String(item.bodyHtml || '').match(/pic\/about\/[^"')\s>]+/g) || []) {
    if (!seen.has(match)) {
      seen.add(match);
      out.push(match);
    }
  }
  return out;
}

// role 行：以「共同創辦人」或「教師」開頭，且不是人名行（人名行以老師結尾）
function isRoleLine(line) {
  return /^(共同創辦人|教師)(\/|$)/.test(line);
}

function isNameLine(line) {
  return /老師$/.test(line) || /^(Kevin|Tim|Jackie|Leon|Wayne)/i.test(line);
}

function parseProfiles(item) {
  const lines = normalizeLines(item.draftBody);
  const images = imagesInOrder(item);
  const profiles = [];
  let i = 0;
  while (i < lines.length) {
    if (!(isRoleLine(lines[i]) && isNameLine(lines[i + 1] || ''))) {
      i += 1;
      continue;
    }
    const role = lines[i];
    const name = lines[i + 1];
    i += 2;
    const paragraphs = [];
    const bullets = [];
    while (i < lines.length && !(isRoleLine(lines[i]) && isNameLine(lines[i + 1] || ''))) {
      const line = lines[i];
      if (/^[●•■]/.test(line)) {
        bullets.push(line.replace(/^[●•■]\s*/, ''));
      } else if (/^[ⅰⅱⅲⅳⅴ]\s*\)/.test(line) && bullets.length) {
        bullets[bullets.length - 1] += ' ' + line;
      } else if (bullets.length) {
        // 條列開始後的散句（獎項數據續行）併入前一個條列
        bullets[bullets.length - 1] += ' ' + line;
      } else {
        paragraphs.push(line);
      }
      i += 1;
    }
    profiles.push({
      role,
      name,
      paragraphs,
      bullets,
      image: images[profiles.length] || ''
    });
  }
  return profiles;
}

function curateIntro(item) {
  const lines = normalizeLines(item.draftBody);
  const sectionTitles = ['國內升學', '國際升學', '資優與競賽', 'STEM教育'];
  // 跳過開頭的選單殘留（關於獵豹/師資團隊/國內升學…/獵豹師資團隊）
  const leadIndex = lines.findIndex((line) => /CheetahSTEM是/.test(line));
  const lead = leadIndex >= 0 ? lines[leadIndex] : '';
  const sections = {};
  let current = null;
  for (const line of lines.slice(leadIndex + 1)) {
    if (sectionTitles.includes(line)) {
      current = line;
      sections[current] = [];
      continue;
    }
    if (current) sections[current].push(line);
  }
  function pillar(title, icon) {
    const body = sections[title] || [];
    return {
      title,
      icon,
      desc: body[0] || '',
      bullets: body.slice(1)
    };
  }
  return {
    heroImage: 'pic/about/about-intro-01.png',
    lead: {
      title: '獵豹科教 CheetahSTEM',
      paragraphs: [lead]
    },
    pillars: [
      pillar('國內升學', '🏫'),
      pillar('國際升學', '🌍'),
      pillar('資優與競賽', '🏆')
    ],
    vision: {
      title: 'STEM 教育與願景',
      paragraphs: (sections['STEM教育'] || []).filter((line) => line !== '獵豹科教CheetahSTEM')
    }
  };
}

const CURATED_SUMMARIES = {
  'about-intro': '獵豹科教CheetahSTEM集合華人區頂尖的K12資深升學、數理資優教育與競賽專家，課程版圖涵蓋國內升學、國際升學、資優與競賽、STEM教育四大領域。',
  'about-founders': '獵豹由宗翰老師（教研總召與架構總設計師）與Kevin老師（執行長）共同創辦，結合資優競賽教育與數位學習產業的深厚經驗。',
  'about-advisors': '18位教師與教研顧問，專業橫跨資優教育、數學競賽（AMC/AIME/IMO）、國際課程（AP/IB/A-Level）與數學程式設計整合教學。'
};

for (const item of data.items) {
  if (item.slug === 'about-founders' || item.slug === 'about-advisors') {
    item.profiles = parseProfiles(item);
  }
  if (item.slug === 'about-intro') {
    item.intro = curateIntro(item);
  }
  if (CURATED_SUMMARIES[item.slug]) {
    item.summary = CURATED_SUMMARIES[item.slug];
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
fs.writeFileSync(jsPath, `window.__ABOUT_DATA__ = ${JSON.stringify(data, null, 2)};\n`, 'utf8');

for (const slug of ['about-founders', 'about-advisors']) {
  const item = data.items.find((entry) => entry.slug === slug);
  console.log(slug + ': ' + item.profiles.length + ' profiles');
  for (const profile of item.profiles) {
    console.log('  - ' + profile.name + ' | ' + profile.role + ' | ' + (profile.image || 'NO IMAGE') + ' | p=' + profile.paragraphs.length + ' b=' + profile.bullets.length);
  }
}
console.log('intro pillars:', data.items.find((entry) => entry.slug === 'about-intro').intro.pillars.map((p) => p.title + '(' + p.bullets.length + ')').join(', '));
