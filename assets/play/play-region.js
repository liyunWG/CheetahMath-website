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
    def.regions.forEach(function (rg, i) { rg.shapes.concat(rg.holes || []).forEach(function (poly) { for (var k = 0; k < poly.length; k++) { var a = poly[k], b = poly[(k + 1) % poly.length], kk = key(a, b); (ed[kk] = ed[kk] || { a: a, b: b, regs: [] }).regs.push(i); } }); });
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
  /* 橢圓上的點（角度由 0° 逆時針，每 360/n 度一個點）；魚鰭、耳朵會「共用」身體橢圓上連續的幾個點當作邊界，所以相鄰是真的共用一段邊，沒有重疊 */
  function ellPts(cx, cy, rx, ry, n) { var out = [], i; for (i = 0; i < n; i++) { var t = 2 * Math.PI * i / n; out.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } return out; }
  function arcOf(pts, i0, cnt) { var out = [], n = pts.length, i; for (i = 0; i < cnt; i++) out.push(pts[(i0 + i) % n]); return out; }
  /* 說例 6 的魚：身體（裡面挖掉兩隻眼睛和嘴巴）、背鰭、左鰭、右鰭、左眼、右眼、嘴。每一部分都只碰到身體。 */
  PG.fish = function () {
    var cx = 6, cy = 3.6, rx = 3.0, ry = 3.0, N = 48, B = ellPts(cx, cy, rx, ry, N), eyeL = ellPts(4.95, 4.5, 0.5, 0.5, 20), eyeR = ellPts(7.05, 4.5, 0.5, 0.5, 20), mouth = [[5.1, 2.5], [6.9, 2.5], [6.0, 1.4]];
    var top = arcOf(B, 9, 7).concat([[6.0, 7.8]]), left = arcOf(B, 21, 7).concat([[cx - rx - 1.3, cy - 1.2], [cx - rx - 1.6, cy + 1.1]]), right = arcOf(B, 45, 7).concat([[cx + rx + 1.6, cy + 1.1], [cx + rx + 1.3, cy - 1.2]]);
    return { regions: [
      { id: 'B', name: '身體', lab: '身體', labAt: [6, 5.7], shapes: [B], holes: [eyeL, eyeR, mouth] },
      { id: 'T', name: '背鰭', lab: '背', labAt: [6, 7.15], shapes: [top] }, { id: 'L', name: '左鰭', lab: '鰭', shapes: [left] }, { id: 'R', name: '右鰭', lab: '鰭', shapes: [right] },
      { id: 'A', name: '左眼', lab: '眼', shapes: [eyeL] }, { id: 'E', name: '右眼', lab: '眼', shapes: [eyeR] }, { id: 'M', name: '嘴', lab: '嘴', labAt: [6, 2.25], shapes: [mouth] }] };
  };
  /* 戴眼鏡的人臉（沒有任何重疊）：臉（挖掉「鏡架加鼻子」與嘴巴）、左耳、右耳、鏡架（挖掉兩隻眼睛）、左眼、右眼、鼻、嘴。
     相鄰：臉碰到耳、鏡架、鼻、嘴；鏡架碰到兩隻眼睛和鼻（鼻的上緣就是鏡架下緣的中間一段）。 */
  PG.face = function () {
    var cx = 6, cy = 3.9, rx = 3.0, ry = 3.3, N = 48, F = ellPts(cx, cy, rx, ry, N), eyeL = ellPts(4.95, 4.95, 0.5, 0.5, 20), eyeR = ellPts(7.05, 4.95, 0.5, 0.5, 20), mouth = ellPts(6, 2.0, 1.0, 0.38, 20);
    var G = [[3.9, 4.35], [5.5, 4.35], [6.5, 4.35], [8.1, 4.35], [8.1, 5.55], [3.9, 5.55]], Nose = [[5.5, 4.35], [5.8, 3.45], [6.2, 3.45], [6.5, 4.35]], GN = [[3.9, 4.35], [5.5, 4.35], [5.8, 3.45], [6.2, 3.45], [6.5, 4.35], [8.1, 4.35], [8.1, 5.55], [3.9, 5.55]];
    var earL = arcOf(F, 22, 5).concat([[cx - rx - 0.85, cy - 0.8], [cx - rx - 1.05, cy], [cx - rx - 0.85, cy + 0.8]]), earR = arcOf(F, 46, 5).concat([[cx + rx + 0.85, cy + 0.8], [cx + rx + 1.05, cy], [cx + rx + 0.85, cy - 0.8]]);
    return { regions: [
      { id: 'F', name: '臉', lab: '臉', labAt: [6, 6.3], shapes: [F], holes: [GN, mouth] },
      { id: 'L', name: '左耳', lab: '耳', shapes: [earL] }, { id: 'R', name: '右耳', lab: '耳', shapes: [earR] },
      { id: 'G', name: '鏡架', lab: '鏡', labAt: [6, 4.8], shapes: [G], holes: [eyeL, eyeR] },
      { id: 'A', name: '左眼', lab: '眼', shapes: [eyeL] }, { id: 'B', name: '右眼', lab: '眼', shapes: [eyeR] },
      { id: 'N', name: '鼻', lab: '鼻', labAt: [6, 3.75], shapes: [Nose] }, { id: 'M', name: '嘴', lab: '嘴', shapes: [mouth] }] };
  };

  /* ───────── 畫面 ───────── */
  /* o: k（顏色數）、labels（預設 true）、graphToggle（顯示「地圖／點線圖」按鈕）、status（顯示已塗／衝突的小膠囊）、gate（回傳 true 就不能塗）、onChange(V)
     V: {model, col[], k, sel, paint(i,c), clear(), setK(k), conflicts(), complete(), used(), setView('map'|'graph'), el:{board, palette}} */
  PG.view = function (host, M, o) {
    o = o || {}; var b = PA.board(host, 12, 8), V = { model: M, col: [], k: o.k || 3, sel: 0, view: 'map' }, gF = h('g'), gB = h('g'), gC = h('g'), gG = h('g'), gL = h('g'), polys = [], i;
    b.gMid.append(gF, gB, gC, gG, gL);
    for (i = 0; i < M.n; i++) V.col.push(-1);
    function pathD(polys) { return polys.map(function (poly) { return 'M ' + poly.map(function (q) { return q[0].toFixed(3) + ' ' + (b.hh - q[1]).toFixed(3); }).join(' L ') + ' Z'; }).join(' '); }
    M.regions.forEach(function (rg, idx) { rg._els = rg.shapes.map(function (poly, si) { var el = (rg.holes && rg.holes.length && si === 0) ? h('path', { d: pathD([poly].concat(rg.holes)), 'fill-rule': 'evenodd', fill: EMPTY, stroke: 'none' }) : h('polygon', { points: b.pts(poly), fill: EMPTY, stroke: 'none' }); el.style.cursor = 'pointer'; el.addEventListener('pointerdown', function (e) { e.preventDefault(); V.tap(idx); }); gF.append(el); return el; }); });
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
      if (V.infoEl) { var fi = V.focusI; if (fi === undefined || fi < 0) { V.infoEl.textContent = '點一個區域塗色，這裡會告訴你它還能選幾種顏色'; V.infoEl.className = 'pl-pill is-amber'; } else { var av = V.availOf(fi); V.infoEl.textContent = '「' + M.regions[fi].name + '」：已塗好的鄰居（' + (av.nbrs.length ? av.nbrs.join('、') : '還沒有') + '）用了 ' + av.used + ' 種不同的顏色 → 還能選 ' + V.k + ' − ' + av.used + ' ＝ ' + av.n + ' 種'; V.infoEl.className = 'pl-pill is-amber'; } }
      if (V.status) { var cn = V.conflicts().length, got = V.col.filter(function (c) { return c >= 0; }).length; V.status.textContent = '已塗 ' + got + ' / ' + M.n + ' 區　' + (cn ? '同色相鄰 ' + cn + ' 處（紅色）' : '沒有同色相鄰'); V.status.className = 'pl-pill ' + (cn ? 'is-pink' : V.complete() ? 'is-ok' : 'is-green'); }
      if (o.onChange) o.onChange(V);
    };
    V.tap = function (i) { if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; } if (o.onTap) { o.onTap(i, V); return; } V.focusI = i; V.paint(i, V.col[i] === V.sel ? -1 : V.sel); };
    /* 這一區現在「還能選幾種顏色」：總色數 − 已塗好的鄰居用了幾種不同的顏色（不算自己） */
    V.availOf = function (i) { var used = {}, nm = []; M.nbrs[i].forEach(function (q) { if (V.col[q] >= 0) { used[V.col[q]] = 1; nm.push(M.regions[q].name); } }); var nu = Object.keys(used).length; return { n: V.k - nu, used: nu, nbrs: nm }; };
    V.log = []; V.order = [];
    V.paint = function (i, c) {
      if (c >= V.k) return; V.focusI = i;
      if (c >= 0) { var av = V.availOf(i); V.log.push({ i: i, avail: av.n, c: c }); V.order = V.order.filter(function (q) { return q !== i; }); V.order.push(i); } else V.order = V.order.filter(function (q) { return q !== i; });
      V.col[i] = c; V.draw();
    };
    V.clear = function () { for (var q = 0; q < M.n; q++) V.col[q] = -1; V.log = []; V.order = []; V.focusI = -1; V.draw(); };
    V.setK = function (k) { V.k = k; for (var q = 0; q < M.n; q++) if (V.col[q] >= k) V.col[q] = -1; V.order = V.order.filter(function (z) { return V.col[z] >= 0; }); if (V.sel >= k) V.sel = 0; V.pal(); V.draw(); };
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
    if (o.info) { V.infoEl = P.pill('', 'is-amber'); V.infoEl.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, V.infoEl)); }
    if (o.watch) { V.watchEl = P.pill('', 'is-amber'); V.watchEl.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, V.watchEl)); }
    V.pal(); V.draw(); V.board = b; V.tx = tx; window.__PGV = V; return V;
  };

  window.PG = PG;
})();
