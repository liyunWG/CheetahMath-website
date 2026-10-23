/* 獵豹玩中學｜區域塗色小工具（塗色問題各單元共用）
   把「地圖」寫成資料（每個區域由幾塊多邊形組成），畫面、相鄰關係、衝突、塗法計數全部由這份資料算出來，不會畫面和計數對不上。
   相鄰＝兩個區域共用一段邊界線；只碰到一個角（對角）不算相鄰。需要先載入 play-core.js、play-app.js。全域名稱：PG。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, PA = window.PA, PG = {};
  PG.COLS = ['#e8590c', '#2f6fdc', '#1f9d55', '#d6336c', '#d29b1f', '#7a4fd6'];
  PG.CNAME = ['橘', '藍', '綠', '粉紅', '黃', '紫'];
  var EMPTY = '#efe7d2';

  /* ───────── 地圖資料 ───────── */
  /* 格子地圖：rows 是字串陣列，同一個字母是同一個區域（空白＝沒有）。回傳 {regions}，座標放在 12×8 的畫板中央。 */
  PG.grid = function (rows, names) {
    var R = rows.length, C = Math.max.apply(null, rows.map(function (r) { return r.length; })), s = Math.min(10.4 / C, 6.6 / R), ox = (12 - C * s) / 2, oy = (8 - R * s) / 2, by = {}, order = [];
    rows.forEach(function (row, r) { for (var c = 0; c < row.length; c++) { var ch = row[c]; if (ch === ' ') continue; if (!by[ch]) { by[ch] = []; order.push(ch); } by[ch].push([[ox + c * s, oy + (R - r) * s], [ox + (c + 1) * s, oy + (R - r) * s], [ox + (c + 1) * s, oy + (R - r - 1) * s], [ox + c * s, oy + (R - r - 1) * s]]); } });
    return { regions: order.map(function (ch) { return { id: ch, name: (names && names[ch]) || ch, shapes: by[ch] }; }) };
  };
  /* 輪形：中心一格、外圈 n 格（第 0 格在正上方，順時針）。withCenter＝false 就只有外圈（環形）。 */
  PG.wheel = function (n, withCenter) {
    var cx = 6, cy = 4, r0 = 1.25, r1 = 3.4, inn = [], out = [], i, regs = [];
    for (i = 0; i < n; i++) { var t = -Math.PI / 2 + 2 * Math.PI * i / n; inn.push([cx + r0 * Math.cos(t), cy - r0 * Math.sin(t)]); out.push([cx + r1 * Math.cos(t), cy - r1 * Math.sin(t)]); }
    for (i = 0; i < n; i++) regs.push({ id: String.fromCharCode(97 + i), name: String.fromCharCode(97 + i), shapes: [[inn[i], inn[(i + 1) % n], out[(i + 1) % n], out[i]]] });
    if (withCenter !== false) regs.unshift({ id: 'O', name: 'O', shapes: [inn.slice()] });
    return { regions: regs };
  };

  /* ───────── 由資料算出相鄰關係 ───────── */
  function key(a, b) { var A = a[0].toFixed(3) + ',' + a[1].toFixed(3), B = b[0].toFixed(3) + ',' + b[1].toFixed(3); return A < B ? A + '|' + B : B + '|' + A; }
  PG.model = function (def) {
    var M = { regions: def.regions, n: def.regions.length, adj: [], nbrs: def.regions.map(function () { return []; }), seg: {}, edges: {} }, ed = {};
    def.regions.forEach(function (rg, i) { rg.shapes.forEach(function (poly) { for (var k = 0; k < poly.length; k++) { var a = poly[k], b = poly[(k + 1) % poly.length], kk = key(a, b); (ed[kk] = ed[kk] || { a: a, b: b, regs: [] }).regs.push(i); } }); });
    Object.keys(ed).forEach(function (kk) {
      var e = ed[kk], rs = e.regs.filter(function (v, i, arr) { return arr.indexOf(v) === i; }); e.same = rs.length === 1 && e.regs.length === 2;
      if (rs.length === 2) { var i = Math.min(rs[0], rs[1]), j = Math.max(rs[0], rs[1]), pk = i + '-' + j; (M.seg[pk] = M.seg[pk] || []).push(e); }
    });
    M.edges = ed;
    if (def.adj) {   /* 明確指定相鄰（例如人臉：眼睛畫在臉的裡面，沒有共用的邊）。沒有共用邊時，紅色標在比較小的那個區域的輪廓上 */
      var idx = {}; def.regions.forEach(function (rg, i) { idx[rg.id] = i; }); M.seg = {};
      var area = function (i) { var t = 0; def.regions[i].shapes.forEach(function (poly) { var xs = poly.map(function (q) { return q[0]; }), ys = poly.map(function (q) { return q[1]; }); t += (Math.max.apply(null, xs) - Math.min.apply(null, xs)) * (Math.max.apply(null, ys) - Math.min.apply(null, ys)); }); return t; };
      def.adj.forEach(function (pr) { var i = Math.min(idx[pr[0]], idx[pr[1]]), j = Math.max(idx[pr[0]], idx[pr[1]]), pk = i + '-' + j, small = area(i) <= area(j) ? i : j, es = [];
        def.regions[small].shapes.forEach(function (poly) { for (var k = 0; k < poly.length; k++) es.push({ a: poly[k], b: poly[(k + 1) % poly.length] }); }); M.seg[pk] = es; });
    }
    Object.keys(M.seg).forEach(function (pk) { var p = pk.split('-'), i = +p[0], j = +p[1]; M.adj.push([i, j]); M.nbrs[i].push(j); M.nbrs[j].push(i); });
    M.center = def.regions.map(function (rg) { var sx = 0, sy = 0, c = 0; rg.shapes.forEach(function (poly) { poly.forEach(function (p) { sx += p[0]; sy += p[1]; c++; }); }); return [sx / c, sy / c]; });
    return M;
  };
  /* 塗法數：用 k 種顏色、相鄰不同色（不要求每種顏色都用到），回傳數目。order 可指定塗的順序。 */
  PG.count = function (M, k, fixed) {
    var col = []; for (var i = 0; i < M.n; i++) col.push(-1); if (fixed) Object.keys(fixed).forEach(function (v) { col[+v] = fixed[v]; });
    var ord = []; for (i = 0; i < M.n; i++) if (col[i] < 0) ord.push(i);
    function rec(t) { if (t === ord.length) return 1; var v = ord[t], tot = 0; for (var c = 0; c < k; c++) { var ok = true; for (var q = 0; q < M.nbrs[v].length; q++) if (col[M.nbrs[v][q]] === c) { ok = false; break; } if (ok) { col[v] = c; tot += rec(t + 1); col[v] = -1; } } return tot; }
    return rec(0);
  };
  /* 剛好用到 k 種顏色（每種都用到）的塗法數：容斥 Σ(−1)^(k−j) C(k,j) count(j) */
  PG.countExact = function (M, k) { var tot = 0, ch = 1; for (var j = 0; j <= k; j++) { if (j > 0) ch = ch * (k - j + 1) / j; tot += ((k - j) % 2 ? -1 : 1) * ch * PG.count(M, j); } return Math.round(tot); };
  /* 把全部合法塗法一個一個列出來（每個塗法是每區顏色編號的陣列），對每個塗法呼叫 cb(col) */
  PG.enumerate = function (M, k, cb) {
    var col = []; for (var i = 0; i < M.n; i++) col.push(-1);
    function rec(v) { if (v === M.n) { cb(col); return; } for (var c = 0; c < k; c++) { var ok = true; for (var q = 0; q < M.nbrs[v].length; q++) if (col[M.nbrs[v][q]] === c) { ok = false; break; } if (ok) { col[v] = c; rec(v + 1); col[v] = -1; } } }
    rec(0);
  };
  PG.chi = function (M) { for (var k = 1; k <= M.n; k++) if (PG.count(M, k) > 0) return k; return M.n; };
  /* 找一組塗法（回傳每區的顏色編號陣列），沒有就回傳 null */
  PG.solve = function (M, k) {
    var col = []; for (var i = 0; i < M.n; i++) col.push(-1);
    function rec(v) { if (v === M.n) return true; for (var c = 0; c < k; c++) { var ok = true; for (var q = 0; q < M.nbrs[v].length; q++) if (col[M.nbrs[v][q]] === c) { ok = false; break; } if (ok) { col[v] = c; if (rec(v + 1)) return true; col[v] = -1; } } return false; }
    return rec(0) ? col : null;
  };

  /* 照這個順序一區一區塗：每一步「還剩幾種顏色可選」有哪些可能的數字（把前面所有合法塗法都列出來看）。
     回傳 [[2], [3, 2], …]：每一步的可能數字（由小到大）。每步都只有一個數字，就表示可以直接連乘。 */
  PG.orderSets = function (M, k, order) {
    var col = []; for (var i = 0; i < M.n; i++) col.push(-1); var sets = order.map(function () { return {}; });
    function avail(v) { var used = {}; M.nbrs[v].forEach(function (q) { if (col[q] >= 0) used[col[q]] = 1; }); return k - Object.keys(used).length; }
    function rec(t) { if (t === order.length) return; var v = order[t], a = avail(v); sets[t][a] = 1; for (var c = 0; c < k; c++) { var ok = true; for (var q = 0; q < M.nbrs[v].length; q++) if (col[M.nbrs[v][q]] === c) { ok = false; break; } if (ok) { col[v] = c; rec(t + 1); col[v] = -1; } } }
    rec(0); return sets.map(function (s) { return Object.keys(s).map(Number).sort(function (a, b) { return a - b; }); });
  };
  PG.ellipse = function (cx, cy, rx, ry, n) { var out = []; n = n || 28; for (var i = 0; i < n; i++) { var t = 2 * Math.PI * i / n; out.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } return out; };
  /* 人臉：variant 'glasses'（戴眼鏡：鏡架連著兩眼和鼻）或 'brows'（有眉毛：眉毛碰到眼睛）。相鄰關係寫在資料裡。 */
  PG.face = function (variant) {
    var R = [], A = [];
    R.push({ id: 'F', name: '臉', lab: '臉', labAt: [6, 6.35], shapes: [PG.ellipse(6, 3.95, 3.0, 3.3, 36)] });
    R.push({ id: 'L', name: '左耳', lab: '耳', shapes: [PG.ellipse(2.5, 4, 0.8, 0.95, 18)] }, { id: 'R', name: '右耳', lab: '耳', shapes: [PG.ellipse(9.5, 4, 0.8, 0.95, 18)] });
    if (variant === 'glasses') R.push({ id: 'G', name: '鏡架', lab: '鏡', labAt: [6, 4.65], shapes: [[[4.9, 4.65], [7.1, 4.65], [7.1, 4.95], [4.9, 4.95]]] });
    R.push({ id: 'A', name: '左眼', lab: '眼', shapes: [PG.ellipse(4.85, 4.8, 0.55, 0.55, 18)] }, { id: 'B', name: '右眼', lab: '眼', shapes: [PG.ellipse(7.15, 4.8, 0.55, 0.55, 18)] });
    if (variant === 'brows') R.push({ id: 'P', name: '左眉', lab: '眉', shapes: [[[4.2, 5.35], [5.5, 5.35], [5.5, 5.75], [4.2, 5.75]]] }, { id: 'Q', name: '右眉', lab: '眉', shapes: [[[6.5, 5.35], [7.8, 5.35], [7.8, 5.75], [6.5, 5.75]]] });
    R.push({ id: 'N', name: '鼻', lab: '鼻', labAt: [6, 3.55], shapes: [[[5.65, 3.2], [6.35, 3.2], [6, 4.4]]] }, { id: 'M', name: '嘴', lab: '嘴', shapes: [PG.ellipse(6, 2.0, 1.05, 0.4, 20)] });
    ['L', 'R', 'A', 'B', 'N', 'M'].forEach(function (x) { A.push(['F', x]); });
    if (variant === 'glasses') { A.push(['F', 'G'], ['G', 'A'], ['G', 'B'], ['G', 'N']); } else { A.push(['F', 'P'], ['F', 'Q'], ['A', 'P'], ['B', 'Q']); }
    return { regions: R, adj: A };
  };

  /* ───────── 畫面 ───────── */
  /* o: k（顏色數）、labels（預設 true）、graphToggle（顯示「地圖／點線圖」按鈕）、status（顯示已塗／衝突的小膠囊）、gate（回傳 true 就不能塗）、onChange(V)
     V: {model, col[], k, sel, paint(i,c), clear(), setK(k), conflicts(), complete(), used(), setView('map'|'graph'), el:{board, palette}} */
  PG.view = function (host, M, o) {
    o = o || {}; var b = PA.board(host, 12, 8), V = { model: M, col: [], k: o.k || 3, sel: 0, view: 'map' }, gF = h('g'), gB = h('g'), gC = h('g'), gG = h('g'), gL = h('g'), polys = [], i;
    b.gMid.append(gF, gB, gC, gG, gL);
    for (i = 0; i < M.n; i++) V.col.push(-1);
    M.regions.forEach(function (rg, idx) { rg._els = rg.shapes.map(function (poly) { var el = h('polygon', { points: b.pts(poly), fill: EMPTY, stroke: 'none' }); el.style.cursor = 'pointer'; el.addEventListener('pointerdown', function (e) { e.preventDefault(); V.tap(idx); }); gF.append(el); return el; }); });
    /* 邊界線：不同區域之間、以及外框畫粗線；同一個區域內部的線不畫 */
    Object.keys(M.edges).forEach(function (kk) { var e = M.edges[kk]; if (e.same) return; var ln = b.line(e.a, e.b, 'pl-line', gB); ln.style.stroke = '#122548'; ln.style.strokeWidth = '3px'; ln.style.pointerEvents = 'none'; });
    var cl = []; M.adj.forEach(function (pr, pi) { var pk = pr[0] + '-' + pr[1]; cl[pi] = M.seg[pk].map(function (e) { var ln = b.line(e.a, e.b, 'pl-line', gC); ln.style.stroke = '#e03131'; ln.style.strokeWidth = '7px'; ln.style.pointerEvents = 'none'; ln.style.display = 'none'; return ln; }); });
    var gl = M.adj.map(function (pr) { var ln = b.line(M.center[pr[0]], M.center[pr[1]], 'pl-line', gG); ln.style.stroke = '#122548'; ln.style.strokeWidth = '3px'; ln.style.pointerEvents = 'none'; ln.style.display = 'none'; return ln; });
    var nodes = M.regions.map(function (rg, idx) { var c = b.circle(M.center[idx], 0.5, 'pg-node', gG); c.style.fill = EMPTY; c.style.stroke = '#122548'; c.style.strokeWidth = '3px'; c.style.display = 'none'; c.style.cursor = 'pointer'; c.addEventListener('pointerdown', function (e) { e.preventDefault(); V.tap(idx); }); return c; });
    var tx = M.regions.map(function (rg, idx) { var at = rg.labAt || [M.center[idx][0], M.center[idx][1] - 0.18], t = b.text(at, o.labels === false ? '' : (rg.lab || rg.name), o.small ? 'pl-text pl-text--sm' : 'pl-text', gL); t.style.pointerEvents = 'none'; t.style.textAnchor = 'middle'; return t; });
    V.conflicts = function () { return M.adj.filter(function (pr) { return V.col[pr[0]] >= 0 && V.col[pr[0]] === V.col[pr[1]]; }); };
    V.complete = function () { return V.col.every(function (c) { return c >= 0; }); };
    V.used = function () { var s = {}; V.col.forEach(function (c) { if (c >= 0) s[c] = 1; }); return Object.keys(s).length; };
    V.draw = function () {
      M.regions.forEach(function (rg, idx) { var f = V.col[idx] >= 0 ? PG.COLS[V.col[idx]] : EMPTY; rg._els.forEach(function (el) { el.setAttribute('fill', f); el.style.opacity = V.view === 'graph' ? 0.3 : 1; }); nodes[idx].style.fill = f; });
      var cf = {}; V.conflicts().forEach(function (pr) { cf[pr[0] + '-' + pr[1]] = 1; });
      M.adj.forEach(function (pr, pi) { var on = !!cf[pr[0] + '-' + pr[1]]; cl[pi].forEach(function (ln) { ln.style.display = V.view === 'map' && on ? '' : 'none'; }); gl[pi].style.display = V.view === 'graph' ? '' : 'none'; gl[pi].style.stroke = on ? '#e03131' : '#122548'; gl[pi].style.strokeWidth = on ? '6px' : '3px'; });
      nodes.forEach(function (c) { c.style.display = V.view === 'graph' ? '' : 'none'; });
      if (V.watchEl) { var w = o.watch, wi = M.regions.findIndex(function (r) { return r.id === w; }), used = {}, nm = []; M.nbrs[wi].forEach(function (q) { if (V.col[q] >= 0) { used[V.col[q]] = 1; nm.push(M.regions[q].name); } }); var nu = Object.keys(used).length; V.watchN = V.k - nu;
        V.watchEl.textContent = M.regions[wi].name + '：已塗的鄰居（' + (nm.length ? nm.join('、') : '還沒有') + '）用了 ' + nu + ' 種不同的顏色 → 還剩 ' + V.k + ' − ' + nu + ' ＝ ' + (V.k - nu) + ' 種可以選'; V.watchEl.className = 'pl-pill ' + (V.col[wi] >= 0 ? 'is-green' : 'is-amber'); }
      if (V.status) { var cn = V.conflicts().length, got = V.col.filter(function (c) { return c >= 0; }).length; V.status.textContent = '已塗 ' + got + ' / ' + M.n + ' 區　' + (cn ? '同色相鄰 ' + cn + ' 處（紅色）' : '沒有同色相鄰'); V.status.className = 'pl-pill ' + (cn ? 'is-pink' : V.complete() ? 'is-ok' : 'is-green'); }
      if (o.onChange) o.onChange(V);
    };
    V.tap = function (i) { if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; } if (o.onTap) { o.onTap(i, V); return; } V.paint(i, V.col[i] === V.sel ? -1 : V.sel); };
    V.paint = function (i, c) { if (c >= V.k) return; V.col[i] = c; V.draw(); };
    V.clear = function () { for (var q = 0; q < M.n; q++) V.col[q] = -1; V.draw(); };
    V.setK = function (k) { V.k = k; for (var q = 0; q < M.n; q++) if (V.col[q] >= k) V.col[q] = -1; if (V.sel >= k) V.sel = 0; V.pal(); V.draw(); };
    V.setView = function (v) { V.view = v; V.draw(); if (V.tog) V.tog.textContent = v === 'map' ? '切換成「點線圖」' : '切換成「地圖」'; };
    /* 調色盤 */
    var pal = h('div', { class: 'pg-pal' }); pal.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0'; host.append(pal); V.palEl = pal;
    V.pal = function () {
      pal.innerHTML = ''; if (o.nopal) return;
      for (var c = 0; c < V.k; c++) (function (c) { var bt = h('button', { type: 'button', 'aria-label': '顏色 ' + PG.CNAME[c] }); bt.style.cssText = 'width:46px;height:46px;border-radius:14px;cursor:pointer;background:' + PG.COLS[c] + ';border:' + (V.sel === c ? '4px solid #122548' : '3px solid #fff') + ';box-shadow:0 2px 6px rgba(0,0,0,.25)'; bt.addEventListener('click', function () { V.sel = c; V.pal(); }); pal.append(bt); })(c);
      var er = h('button', { type: 'button' }, '全部擦掉'); er.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;border:2px solid #b9ad92;background:#fff;font-weight:800;color:#122548;cursor:pointer'; er.addEventListener('click', function () { if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; } V.clear(); }); pal.append(er);
      if (o.graphToggle) { var tg = h('button', { type: 'button' }, V.view === 'map' ? '切換成「點線圖」' : '切換成「地圖」'); tg.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;border:2px solid #2f6fdc;background:#eef4ff;font-weight:800;color:#1f4fa8;cursor:pointer'; tg.addEventListener('click', function () { V.setView(V.view === 'map' ? 'graph' : 'map'); }); V.tog = tg; pal.append(tg); }
    };
    if (o.status) { V.status = P.pill('', 'is-green'); host.append(h('div', { class: 'pl-readout' }, V.status)); }
    if (o.watch) { V.watchEl = P.pill('', 'is-amber'); V.watchEl.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, V.watchEl)); }
    V.pal(); V.draw(); V.board = b; V.tx = tx; window.__PGV = V; return V;
  };

  window.PG = PG;
})();
