/* 3D 單元（P3）驗證腳本：在頁面裡執行（需要頁面把場景放在 window.__E0 = {sc, pts, drag, rebuild}）。
   用法（和 qa-harness.js 一樣，先用本機伺服器開頁面並刷新快取）：
     1. 貼上這整份；它定義 window.__3d
     2. 手勢：   await __3d.gestures('mouse'|'touch')   → 拖點視角不能動、拖空白處視角要動、兩種移動方式都測
     2b. 整頁走訪：__3d.walk(最後一步索引, 每個狀態的隨機掃描次數, 'touch')（不要 await），輪詢 __W = {states, bad, done}
     3. 標籤：   await __3d.sweep(60)                    → 隨機旋轉＋隨機拖點，檢查標籤互相壓住、壓到點、跑出畫布、點跑出畫布
   回傳的 problems 陣列為空才算通過。手機：先 resize_window 375×812 再重新載入。 */
window.__3d = (function () {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const E = () => window.__E0, cv = () => document.querySelector('canvas.pl-3d');
  function client(p) { const sc = E().sc, q = sc.project(p), r = cv().getBoundingClientRect(); return [r.left + q[0], r.top + q[1]]; }
  function ev(type, x, y, kind, id) { cv().dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id || 7, pointerType: kind || 'mouse', clientX: x, clientY: y, isPrimary: true, buttons: type === 'pointerup' ? 0 : 1 })); }
  async function drag(from, to, kind, steps) {
    steps = steps || 6; ev('pointerdown', from[0], from[1], kind);
    for (let k = 1; k <= steps; k++) { ev('pointermove', from[0] + (to[0] - from[0]) * k / steps, from[1] + (to[1] - from[1]) * k / steps, kind); await sleep(12); }
    ev('pointerup', to[0], to[1], kind); await sleep(60);
  }
  async function gestures(kind) {
    const e = E(), sc = e.sc, out = { kind, problems: [] }, setMode = k => { e.pts.forEach(p => p.mode = k); };
    // 1. 拖點（水平）：點移動、視角不變
    setMode('floor'); let y0 = sc.yaw, p0 = sc.pitch, i = 3, before = e.pts[i].p.slice();
    const target = [before[0] + 1, before[1], before[2] - 1];
    await drag(client(before), client(target), kind);
    out.floorMoved = JSON.stringify(e.pts[i].p); if (JSON.stringify(e.pts[i].p) !== JSON.stringify(target)) out.problems.push('floor drag: 點沒有到 ' + target + '，實際 ' + e.pts[i].p);
    if (Math.abs(sc.yaw - y0) > 1e-9 || Math.abs(sc.pitch - p0) > 1e-9) out.problems.push('拖點時視角轉動了');
    // 2. 拖點（上下）
    setMode('vertical'); before = e.pts[i].p.slice(); const t2 = [before[0], Math.min(4, before[1] + 1) === before[1] ? before[1] - 1 : before[1] + 1, before[2]];
    y0 = sc.yaw; p0 = sc.pitch; await drag(client(before), client(t2), kind);
    out.vertMoved = JSON.stringify(e.pts[i].p); if (JSON.stringify(e.pts[i].p) !== JSON.stringify(t2)) out.problems.push('vertical drag: 點沒有到 ' + t2 + '，實際 ' + e.pts[i].p);
    if (Math.abs(sc.yaw - y0) > 1e-9 || Math.abs(sc.pitch - p0) > 1e-9) out.problems.push('上下拖點時視角轉動了');
    // 3. 拖空白處：視角要轉、點不動
    setMode('floor'); const snap = JSON.stringify(e.pts.map(p => p.p)), r = cv().getBoundingClientRect(); y0 = sc.yaw;
    await drag([r.left + 12, r.top + 12], [r.left + 82, r.top + 30], kind); sc.vx = sc.vy = 0;
    out.yawDelta = +(sc.yaw - y0).toFixed(3); if (Math.abs(sc.yaw - y0) < 0.2) out.problems.push('拖空白處視角沒有轉'); if (JSON.stringify(e.pts.map(p => p.p)) !== snap) out.problems.push('拖空白處卻移動了點');
    sc.setView(sc.home.yaw, sc.home.pitch, true); await sleep(60);
    // 4. 觸控半徑：離點中心 ≤ 24px 要抓得到點
    const q = client(e.pts[0].p); const d0 = JSON.stringify(e.pts[0].p); y0 = sc.yaw; await drag([q[0] + 20, q[1]], [q[0] + 20 + 30, q[1]], kind, 3);
    out.nearGrab = JSON.stringify(e.pts[0].p) !== d0 || Math.abs(sc.yaw - y0) < 1e-9; if (!out.nearGrab) out.problems.push('離點 20px 的位置沒有抓到點（視角被轉動）');
    return out;
  }
  /* 標籤：畫布座標下，每個標籤的矩形 */
  function rects() {
    const sc = E().sc, c = sc.ctx, res = [];
    const add = (o, kind) => { if (o.hidden || (!o.label && !o.t)) return; const t = o.label || o.t, size = o.size || 15; c.font = '800 ' + size + 'px sans-serif'; const w = c.measureText(t).width, q = sc.project(o.p), r = kind === 'dot' ? (o.r || 6) : 0, dx = o.dx || 0, dy = o.dy === undefined ? -r - 9 : o.dy, cx = q[0] + dx, cy = q[1] + dy; res.push({ t, kind, box: [cx - w / 2, cy - size / 2, cx + w / 2, cy + size / 2] }); };
    sc.dots.forEach(d => add(d, 'dot')); sc.texts.forEach(t => add(t, 'text')); return res;
  }
  function problems() {
    const sc = E().sc, pr = [], R = rects(), W = sc.cw, H = sc.ch, ov = (a, b, m) => !(a[2] < b[0] + m || a[0] > b[2] - m || a[3] < b[1] + m || a[1] > b[3] - m);
    R.forEach((a, i) => {
      if (a.box[0] < -1 || a.box[2] > W + 1 || a.box[1] < -1 || a.box[3] > H + 1) pr.push('標籤「' + a.t + '」跑出畫布');
      for (let k = i + 1; k < R.length; k++) if (ov(a.box, R[k].box, 2)) pr.push('標籤「' + a.t + '」壓到「' + R[k].t + '」');
      sc.dots.forEach(d => { if (d.hidden) return; const q = sc.project(d.p), r = (d.r || 6), b = [q[0] - r, q[1] - r, q[0] + r, q[1] + r]; if (d.label === a.t && a.kind === 'dot') return; if (ov(a.box, b, 3)) pr.push('標籤「' + a.t + '」壓到點'); });
    });
    sc.dots.forEach(d => { if (d.hidden) return; const q = sc.project(d.p); if (q[0] < 8 || q[0] > W - 8 || q[1] < 8 || q[1] > H - 8) pr.push('點跑出畫布 ' + JSON.stringify(d.p)); });
    return pr;
  }
  async function sweep(n) {
    const e = E(), sc = e.sc, all = {}; let seed = 99; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let i = 0; i < n; i++) {
      const k = Math.floor(rnd() * e.pts.length); if (!e.pts[k].fixed) { const m = e.drag.moveTo(k, [Math.round(rnd() * 6 - 3), Math.round(rnd() * 4), Math.round(rnd() * 6 - 3)]); }
      sc.setView(rnd() * 6.28, -1.2 + rnd() * 1.9, true); sc.vx = sc.vy = 0; sc.render(); await sleep(15);
      problems().forEach(p => { all[p] = (all[p] || 0) + 1; });
    }
    return { n, problems: Object.entries(all).map(([k, v]) => k + ' ×' + v) };
  }
  /* 通用手勢檢查（任何 P3.stage 頁面）：第一個可拖的點水平移動一格、視角不能動；拖空白處視角要動 */
  async function gen(kind) {
    const e = E(), sc = e.sc, out = [], i = e.pts.findIndex(p => !p.fixed && !p.hidden); if (i < 0) return out;
    e.pts.forEach(p => { p.mode = 'floor'; }); const before = e.pts[i].p.slice(), bx = sc.box, t = [before[0] + (before[0] < bx.x[1] ? 1 : -1), before[1], before[2]], y0 = sc.yaw, p0 = sc.pitch;
    if (e.pts[i].valid === false) return out;
    await drag(client(before), client(t), kind); const moved = JSON.stringify(e.pts[i].p) !== JSON.stringify(before);
    if (Math.abs(sc.yaw - y0) > 1e-9 || Math.abs(sc.pitch - p0) > 1e-9) out.push('拖點時視角轉動');
    if (!moved) out.push('點沒有被拖動（可能被 valid／gate 擋住，請人工確認）'); e.drag.moveTo(i, before);
    const r = cv().getBoundingClientRect(); const yy = sc.yaw; await drag([r.left + 10, r.top + 10], [r.left + 80, r.top + 25], kind); sc.vx = sc.vy = 0; if (Math.abs(sc.yaw - yy) < 0.2) out.push('拖空白處視角沒轉'); sc.setView(sc.home.yaw, sc.home.pitch, true);
    return out;
  }
  /* 走訪：每個步驟／關卡 → 預測題自動點第一個選項 → 通用手勢檢查＋隨機視角隨機拖點掃描 → 看詳解 → 下一題／繼續。結果在 window.__W */
  window.__W = { states: 0, bad: [], done: false };
  async function walk(lastStep, nSweep, kind) {
    const cur = () => [...document.querySelectorAll('.pl-dots i')].findIndex(i => i.className === 'cur'); let lastKey = '';
    for (let g = 0; g < 300 && cur() < lastStep; g++) {
      const key = cur() + ((document.body.innerText.match(/第 \d \/ \d (關|題)/) || [''])[0]);
      if (key !== lastKey) {
        lastKey = key; await sleep(800); const po = document.querySelector('.pl-opt:not(.ps-seg .pl-opt)'); if (po && document.querySelector('.pl-choice:not(.is-done)')) { document.querySelector('.pl-choice:not(.is-done) .pl-opt').click(); await sleep(500); }
        __W.states++; if (E() && cv()) { (await gen(kind || 'touch')).forEach(m => __W.bad.push(key + ' ' + m)); const sw = await sweep(nSweep); sw.problems.forEach(m => __W.bad.push(key + ' ' + m)); }
      }
      const sb = document.querySelector('.pl-solbtn'); if (sb && !sb.hidden) sb.click(); await sleep(1000);
      const nq = document.querySelector('.pl-nextq'); if (nq) { nq.click(); await sleep(500); continue; }
      const nx = document.querySelector('.pl-next'); if (nx && !nx.disabled) { nx.click(); await sleep(500); }
    }
    __W.done = true;
  }
  /* 真實操作：把第 i 個點拖到格點 to（先用「上下移動」到目標高度，再用「在地面上移動」到目標位置；按下頁面上的兩個移動方式按鈕） */
  async function go(i, to, kind) {
    const e = E(), btn = m => { const b = [...document.querySelectorAll('.ps-seg .pl-opt')]; if (b.length) b[m === 'floor' ? 0 : 1].click(); e.pts.forEach(p => p.mode = m); };
    let c = e.pts[i].p.slice(); if (c[1] !== to[1]) { btn('vertical'); await sleep(100); await drag(client(c), client([c[0], to[1], c[2]]), kind || 'touch'); }
    c = e.pts[i].p.slice(); if (c[0] !== to[0] || c[2] !== to[2]) { btn('floor'); await sleep(100); await drag(client(c), client(to), kind || 'touch'); }
    return e.pts[i].p.slice();
  }
  return { gestures, sweep, problems, rects, client, drag, gen, walk, go };
})();
