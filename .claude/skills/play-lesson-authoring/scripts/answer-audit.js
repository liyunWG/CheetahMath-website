/* 「看詳解」稽核：逐步逐關按「看詳解」，確認每一次之後，綠框（或選擇題的綠色回饋）開頭都有「正確答案是：…」。
   用法（在任何 play 頁面，例如 http://localhost:8765/play.html，用 javascript_tool 貼上執行）：
     1. 啟動本機伺服器：python -m http.server 8765（在專案根目錄）
     2. 貼上這整份；它會定義 window.__auditAll(slugs, 同時幾個)，結果寫在 window.__AUD
     3. 跑：__auditAll(['plant-gap','quad-open'], 5);   （不要 await；單次腳本逾時約 45 秒）
     4. 輪詢：window.__AUD_DONE；再列出沒有答案的步驟：
        Object.entries(__AUD).flatMap(([k,v]) => Array.isArray(v) ? v.filter(r => !r.ans.length).map(r => k+' #'+r.step+' '+r.lab+' ▶ '+r.rule) : [k+' '+v])
   判讀：每一列是按一次「看詳解」；ans 是這一次新出現的「正確答案是：…」；空的就要補：
     - 預測題／選擇題：在正確選項加 ok: true
     - 操作關卡：setSolve(fn, '答案文字')
     - 探索步驟：api.solve(fn, false, '答案文字')，或在 new P.Lesson({ …, answers: { 步驟編號: '答案文字' } }) 一次登記
   也要看 ans 的內容是不是真的「答案」（不是「找到了」「答對了」這種訊息）。 */
window.__auditFn = async function () {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), rows = [];
  const label = () => (document.body.innerText.match(/第 \d \/ \d (關|題)|同一關的第 \d 題/) || [''])[0];
  const total = document.querySelectorAll('.pl-dots i').length;
  const getAns = () => [...document.querySelectorAll('.pl-ans')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 110));
  for (let g = 0; g < 80; g++) {
    const step = [...document.querySelectorAll('.pl-dots i')].findIndex(i => i.className === 'cur'), lab = label();
    if (step >= total - 1) break;
    const sol = document.querySelector('.pl-solbtn');
    if (sol && !sol.hidden) {
      const before = getAns();
      sol.click(); await sleep(650);
      const after = getAns(), fresh = after.length >= before.length ? after.slice(before.length) : after;
      const rules = document.querySelectorAll('.pl-rule'), last = rules[rules.length - 1];
      rows.push({ step, lab, ans: fresh, rule: last ? last.innerText.replace(/\s+/g, ' ').slice(0, 60) : '' });
    }
    const nq = document.querySelector('.pl-nextq'); if (nq) { nq.click(); await sleep(350); continue; }
    const nx = document.querySelector('.pl-next');
    if (nx && !nx.disabled) { nx.click(); await sleep(450); continue; }
    if (!sol || sol.hidden) break;
  }
  return rows;
};
window.__AUD = {};
window.__auditOne = async function (slug) {
  const ifr = document.createElement('iframe'); ifr.style.cssText = 'position:fixed;left:0;top:0;width:375px;height:800px;border:0;opacity:.01;pointer-events:none'; ifr.src = 'play-' + slug + '.html'; document.body.append(ifr);
  await new Promise(r => { ifr.onload = r; }); await new Promise(r => setTimeout(r, 1200));
  try { window.__AUD[slug] = await Promise.race([ifr.contentWindow.eval('(' + window.__auditFn.toString() + ')()'), new Promise((_, rej) => setTimeout(() => rej('timeout'), 120000))]); } catch (e) { window.__AUD[slug] = 'ERR ' + e; }
  ifr.remove();
};
window.__auditAll = async function (slugs, conc) {
  window.__AUD_DONE = false; const q = slugs.slice();
  await Promise.all(Array.from({ length: conc || 4 }, async () => { while (q.length) await window.__auditOne(q.shift()); }));
  window.__AUD_DONE = true;
};
