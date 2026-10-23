/* 區域塗色單元（PG）驗證腳本：頁面要用 PG.view（它會把最新的畫面放在 window.__PGV）。
   用法：貼上後  await __rg.taps(80)  → 對目前畫面隨機點選顏色與區域（真實 pointerdown），每次比對「已塗幾區、同色相鄰幾處」的小膠囊和獨立重算的結果。
   整頁走訪（看詳解＋下一題）請搭配 qa-harness.js 的 __walk（沒有把手也能跑），這裡只負責塗色畫面的隨機測試。回傳 problems 為空才算通過。 */
window.__rg = (function () {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function taps(n, seed) {
    let s = seed || 7; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }, problems = []; let done = 0;
    for (let i = 0; i < n; i++) {
      const V = window.__PGV; if (!V) return { problems: ['沒有 __PGV'] };
      const svg = document.querySelector('.pl-stage svg'), pal = [...document.querySelectorAll('.pg-pal button')].filter(b => b.getAttribute('aria-label')), polys = [...svg.querySelectorAll('polygon')].filter(p => p.getAttribute('fill'));
      if (pal.length) pal[Math.floor(rnd() * pal.length)].click(); const el = polys[Math.floor(rnd() * polys.length)], r = el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 3, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, isPrimary: true })); await sleep(15);
      const M = V.model, col = V.col, bad = M.adj.filter(p => col[p[0]] >= 0 && col[p[0]] === col[p[1]]).length, got = col.filter(c => c >= 0).length, txt = V.status ? V.status.textContent : '';
      if (V.status && !(txt.includes('已塗 ' + got + ' / ' + M.n) && (bad ? txt.includes('同色相鄰 ' + bad + ' 處') : txt.includes('沒有同色相鄰')))) problems.push('小膠囊對不上：' + txt + '（獨立算：已塗 ' + got + '、衝突 ' + bad + '）');
      const red = [...svg.querySelectorAll('line')].filter(l => l.style.stroke === 'rgb(224, 49, 49)' && l.style.display !== 'none' && l.style.strokeWidth === '7px').length; if (V.view === 'map' && (bad === 0) !== (red === 0)) problems.push('紅線數量與衝突不一致（衝突 ' + bad + '、紅線 ' + red + '）'); done++;
    }
    return { done, problems };
  }
  /* 真實操作：照 sol（每區的顏色編號）一區一區點選顏色再點區域；先「全部擦掉」 */
  async function real(sol) {
    const V = window.__PGV, svg = () => document.querySelector('.pl-stage svg'); const er = [...document.querySelectorAll('.pg-pal button')].find(b => b.textContent === '全部擦掉'); if (er) er.click(); await sleep(30);
    for (let i = 0; i < sol.length; i++) {
      const pal = [...document.querySelectorAll('.pg-pal button')].filter(b => b.getAttribute('aria-label')); pal[sol[i]].click();
      const el = [...svg().querySelectorAll('polygon')].filter(p => p.getAttribute('fill'))[V.model.regions[i].shapes.length === 1 ? V.model.regions.slice(0, i).reduce((a, r) => a + r.shapes.length, 0) : V.model.regions.slice(0, i).reduce((a, r) => a + r.shapes.length, 0)], r = el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 3, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, isPrimary: true })); await sleep(20);
    }
  }
  /* 按步進器（顏色數、個數）到指定值 */
  async function stepTo(v, idx) { const sn = [...document.querySelectorAll('.pl-stepper')][idx || 0], bs = sn.querySelectorAll('.pl-stepper__b'), cur = () => +sn.querySelector('.pl-stepper__v').textContent; let g = 0; while (cur() !== v && g++ < 12) { (cur() < v ? bs[1] : bs[0]).click(); await sleep(60); } }
  /* 整頁走訪：每個狀態（步驟／關卡）先隨機點選 nTaps 次並掃描文字重疊，再按看詳解、下一題。結果在 window.__RW。需要先載入 qa-harness.js（用它的 __sweep、__cur）。 */
  window.__RW = { states: [], bad: [], done: false };
  async function walk(lastStep, nTaps) {
    let lastKey = ''; await sleep(800);
    for (let g = 0; g < 120 && __cur() < lastStep; g++) {
      const key = __cur() + ((document.body.innerText.match(/第 \d \/ \d 關/) || [''])[0]);
      if (key !== lastKey) {
        lastKey = key; await sleep(700); const po = document.querySelector('.pl-choice:not(.is-done) .pl-opt'); if (po) { po.click(); await sleep(500); }
        __RW.states.push(key); if (window.__PGV && document.querySelector('.pg-pal button')) { const r = await taps(nTaps, g + 3); r.problems.slice(0, 3).forEach(m => __RW.bad.push(key + ' ' + m)); }
        __sweep().forEach(m => __RW.bad.push(key + ' ' + m));
      }
      const sb = document.querySelector('.pl-solbtn'); if (sb && !sb.hidden) sb.click(); await sleep(1000);
      const nq = document.querySelector('.pl-nextq'); if (nq) { nq.click(); await sleep(500); continue; }
      const nx = document.querySelector('.pl-next'); if (nx && !nx.disabled) { nx.click(); await sleep(500); }
    }
    __RW.done = true;
  }
  return { taps, real, stepTo, walk };
})();
