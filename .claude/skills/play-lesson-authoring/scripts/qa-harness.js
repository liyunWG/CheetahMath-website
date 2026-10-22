/* 獵豹玩中學：單元驗證腳本（在瀏覽器頁面裡執行，例如用 javascript_tool 貼上）
   用法：
     1. 啟動本機伺服器（python -m http.server 8765），開啟 http://localhost:8765/play-<slug>.html
     2. 先刷新快取：for (const f of ['assets/play/play-core.js','assets/play/lessons/<slug>.js']) await fetch(f,{cache:'reload'});
     3. 貼上這整份腳本（它會定義 window.__walk、__sweep、__randDrag、__sum）
     4. 跑：  __walk(最後一步的索引, 每個狀態隨機拖曳次數);   （不要 await；結果寫在 window.__S）
     5. 輪詢：__sum()   → {done, states, drags, problems, uniq, errs}
   重要：單次腳本超過約 45 秒會逾時，所以 __walk 是「不 await 的背景迴圈」，用輪詢取結果。
   手機驗證：先把瀏覽器視窗縮到 375×812 再重新載入頁面，同一份腳本再跑一次。
   預測題：每個新狀態會先自動點第一個選項，讓被預測擋住的操作元件解鎖。 */
window.__errs = []; window.addEventListener('error', e => __errs.push(e.message));
window.__sleep = ms => new Promise(r => setTimeout(r, ms));
window.__cur = () => [...document.querySelectorAll('.pl-dots i')].findIndex(i => i.className === 'cur');

const inter = (a, b, m) => !(a.right < b.left + m || a.left > b.right - m || a.bottom < b.top + m || a.top > b.bottom - m);

/* 掃描：任何文字壓到把手（.pl-hd）、壓到別的文字、或跑出畫布，都記為問題 */
window.__sweep = function () {
  const probs = [];
  document.querySelectorAll('.pl-stage svg').forEach((svg, si) => {
    const sb = svg.getBoundingClientRect();
    const T = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim() && getComputedStyle(t).display !== 'none' && parseFloat(getComputedStyle(t).opacity || 1) > 0.05);
    const R = T.map(t => t.getBoundingClientRect());
    const H = [...svg.querySelectorAll('.pl-hd')].map(e => e.getBoundingClientRect());
    R.forEach((r, i) => {
      if (r.width === 0) return;
      H.forEach(h => { if (inter(r, h, 3)) probs.push('svg' + si + ' text「' + T[i].textContent + '」hit handle'); });
      for (let k = i + 1; k < R.length; k++) if (R[k].width && inter(r, R[k], 3)) probs.push('svg' + si + ' text「' + T[i].textContent + '」hit「' + T[k].textContent + '」');
      if (r.left < sb.left - 1 || r.right > sb.right + 1 || r.top < sb.top - 1 || r.bottom > sb.bottom + 1) probs.push('svg' + si + ' text「' + T[i].textContent + '」outside');
    });
  });
  return probs;
};

/* 隨機拖曳：用真實 pointer 事件把隨機一個把手拖到畫布內隨機位置（svg 座標，與單元無關） */
window.__randDrag = async function (rnd) {
  const svg = document.querySelector('.pl-stage svg'); if (!svg) return;
  const hs = [...svg.querySelectorAll('.pl-handle')]; if (!hs.length) return;
  const hd = hs[Math.floor(rnd() * hs.length)], bb = hd.getBoundingClientRect(), cx = bb.left + bb.width / 2, cy = bb.top + bb.height / 2, vb = svg.viewBox.baseVal;
  const pt = svg.createSVGPoint(); pt.x = vb.x + rnd() * vb.width; pt.y = vb.y + rnd() * vb.height;
  const t = pt.matrixTransform(svg.getScreenCTM());
  const ev = (ty, x, y) => hd.dispatchEvent(new PointerEvent(ty, { bubbles: true, cancelable: true, pointerId: 11, clientX: x, clientY: y, isPrimary: true }));
  ev('pointerdown', cx, cy);
  for (let k = 1; k <= 3; k++) { ev('pointermove', cx + (t.x - cx) * k / 3, cy + (t.y - cy) * k / 3); await __sleep(6); }
  ev('pointerup', t.x, t.y); await __sleep(25);
};

window.__S = { states: 0, drags: 0, bad: [], done: false, lastKey: '' };

/* 走訪：每個新步驟／關卡 → 先掃描、隨機拖曳 dragsPer 次（每次掃描）→ 按「看詳解」過關（再掃描）→ 按「下一題」或「繼續」 */
window.__walk = async function (lastStep, dragsPer) {
  let seed = 2026; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let g = 0; g < 400 && __cur() < lastStep; g++) {
    const key = __cur() + (document.body.innerText.match(/第 \d \/ \d (關|題)/) || [''])[0];
    if (key !== __S.lastKey) {
      __S.lastKey = key; await __sleep(700);
      const po = document.querySelector('.pl-opt'); if (po && document.querySelector('.pl-choice:not(.is-done)')) { po.click(); await __sleep(500); }
      const pr = __sweep(); __S.states++; if (pr.length) __S.bad.push(key + ' (initial): ' + pr.join('; '));
      for (let d = 0; d < dragsPer; d++) {
        if (document.querySelector('.pl-nextq')) break;
        await __randDrag(rnd); await __sleep(450);                       /* 把手有彈簧動畫，要等它停穩 */
        const p2 = __sweep(); __S.drags++; if (p2.length) __S.bad.push(key + ' drag' + d + ': ' + p2.join('; '));
      }
    }
    const s = document.querySelector('.pl-solbtn'); if (s && !s.hidden) s.click();
    await __sleep(900);
    const p3 = __sweep(); if (p3.length) __S.bad.push(key + ' (after solve): ' + p3.join('; '));
    const nq = document.querySelector('.pl-nextq'); if (nq) { nq.click(); await __sleep(450); continue; }
    const nx = document.querySelector('.pl-next'); if (nx && !nx.disabled) { nx.click(); await __sleep(450); }
  }
  __S.done = true;
};

window.__sum = function () {
  const uniq = {};
  __S.bad.forEach(b => { const key = b.split(':')[0].replace(/ drag\d+/, '').replace(/ \(.*\)/, ''); b.split(': ').slice(1).join(': ').split('; ').forEach(p => { const k = key + ' → ' + p; uniq[k] = (uniq[k] || 0) + 1; }); });
  return JSON.stringify({ done: __S.done, states: __S.states, drags: __S.drags, problems: __S.bad.length, uniq, errs: __errs });
};

/* ───────────── 範例：獨立重算驗證（以「拖動五邊形頂點」為例，請依單元改寫） ─────────────
   原則：不要相信單元自己算的數字；由畫面上把手的實際座標，用別的公式重算，再和畫面標籤逐一比對。
   把手座標：每個 .pl-handle 的 transform="translate(x,y)"，y 是 svg 座標（板高 10 時，數學 y ＝ 10 − y）。
window.__verts = () => [...document.querySelector('.pl-svg').querySelectorAll('.pl-handle')].map(g => { const m = g.getAttribute('transform').match(/translate\(([-\d.e]+),([-\d.e]+)\)/); return [+m[1], 10 - (+m[2])]; });
window.__trueExt = V => V.map((p, i) => { const a = V[(i + V.length - 1) % V.length], b = V[(i + 1) % V.length]; const e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]]; return Math.atan2(e1[0] * e2[1] - e1[1] * e2[0], e1[0] * e2[0] + e1[1] * e2[1]) * 180 / Math.PI; });
   // 檢查：加總 ≈ 360、每個 > 0、和畫面標籤相差 ≤ 1°、頂點不重疊。
   // 檢查時機：拖曳後等 ~450ms（等彈簧動畫停）。
*/
