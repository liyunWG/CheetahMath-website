/* 獵豹玩中學｜立體幾何共用工具（多面體資料、凸包面、展開圖摺疊模型、積木視圖）
   依賴 play-core.js（Play）與 play-3d.js（Play3D）。全域名稱：PS */
(function () {
  'use strict';
  var P = window.Play, h = P.h, D = window.Play3D;
  var PS = window.PS = {};
  PS.COL = { blue: '#2f6fdc', pink: '#d6336c', green: '#1f9d55', amber: '#d29b1f', violet: '#7a4fd6', orange: '#e8590c', navy: '#122548', gray: '#9aa3b5', teal: '#0ca5a0' };
  PS.FACECOL = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f', '#7a4fd6', '#e8590c'];

  /* ---------------------------------------------------------------- 向量 */
  var V3 = PS.v = {
    add: function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }, sub: D.sub, cross: D.cross,
    dot: function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }, mul: function (a, k) { return [a[0] * k, a[1] * k, a[2] * k]; },
    len: function (a) { return Math.hypot(a[0], a[1], a[2]); }, norm: function (a) { var L = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / L, a[1] / L, a[2] / L]; },
    mid: function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; }, lerp: function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  };

  /* ---------------------------------------------------------------- 場景 */
  PS.scene = function (host, o) {
    o = o || {};
    /* 自動合適大小：fitR＝物件以 center 為中心的外接半徑（世界座標）。畫布高度由引擎依螢幕決定（電腦 340–420、手機 250–320），twoCol＝與別的畫布並排（較矮） */
    var sc, cfg = { aspect: o.twoCol ? 1 : 0.7, maxH: 0, autoH: true, autoFit: true, hFrac: o.hFrac || 1, fitR: o.fitR || 1.2, yaw: o.yaw === undefined ? -0.6 : o.yaw, pitch: o.pitch === undefined ? 0.45 : o.pitch, cull: !!o.cull, center: o.center || [0, 0, 0], persp: o.persp || 0, drag: o.drag, lockPitch: o.lockPitch, scroll: o.scroll, label: o.label };
    ['onTap', 'onDrag', 'onHover', 'onDragEnd'].forEach(function (k) { if (o[k]) cfg[k] = o[k]; });
    cfg.onDragStart = function (pos, e) { sc._camTok = (sc._camTok || 0) + 1; return o.onDragStart ? o.onDragStart(pos, e) : undefined; };
    sc = new D.Scene(host, cfg); sc.onDragEnd = o.onDragEnd; (PS.scenes = PS.scenes || []).push(sc); if (PS.scenes.length > 10) PS.scenes.shift(); return sc;
  };
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 鏡頭平順轉到指定視角（連續可見）。期間若使用者拖動或又按別的視角，會接手；done 只在轉完時呼叫 */
  PS.camTo = function (sc, yaw, pitch, done, ms) {
    var tok = sc._camTok = (sc._camTok || 0) + 1; sc.vx = sc.vy = 0;
    if (REDUCE && !PS.forceMotion) { sc.yaw = yaw; sc.pitch = pitch; sc.invalidate(); if (done) done(); return; }
    var TWO = Math.PI * 2, dy = (((yaw - sc.yaw) % TWO) + TWO + Math.PI) % TWO - Math.PI, y0 = sc.yaw, p0 = sc.pitch, t = 0, dur = ms || 1200;
    P.run(function (dt) {
      if (sc._camTok !== tok) return false; t += dt * 1000; var u = Math.min(1, t / dur), e = P.ease.inOut(u);
      sc.yaw = y0 + dy * e; sc.pitch = p0 + (pitch - p0) * e; sc.invalidate();
      if (u >= 1) { if (done) done(); return false; }
    });
  };
  /* 彈簧：減少動態（prefers-reduced-motion）時 Play.Spring 會直接跳到終點、不會呼叫 onRest，這裡補上 */
  PS.spring = function (x0, o) {
    var done = o.onRest, sp = new P.Spring(x0, { k: o.k, zeta: o.zeta, onUpdate: o.onUpdate, onRest: function () { if (done) done(); } }), orig = sp.to;
    sp.to = function (t) { orig.call(sp, t); if (sp.x === t && sp.v === 0 && x0 !== t) { if (done) done(); } return sp; };
    return sp;
  };
  PS.stage = function (st) { var w = h('div', { class: 'ps-row' }); st.append(w); return w; };
  /* 分段按鈕：items [{k,t}]，回傳 {el, set(k)}；opt.cols 欄數 */
  PS.seg = function (host, items, onPick, opt) {
    opt = opt || {}; var el = h('div', { class: 'pl-seg ps-seg' }), btns = {}; el.style.gridTemplateColumns = 'repeat(' + (opt.cols || items.length) + ',1fr)';
    items.forEach(function (it) { var b = h('button', { type: 'button', class: 'pl-opt', html: it.t }); b.addEventListener('click', function () { api.set(it.k, true); }); btns[it.k] = b; el.append(b); });
    var api = { el: el, cur: null, btns: btns, set: function (k, fire) { api.cur = k; items.forEach(function (it) { btns[it.k].classList.toggle('is-sel', it.k === k); }); if (fire !== false) onPick(k); } };
    host.append(el); return api;
  };
  /* 把一組動作按鈕排成一列 */
  PS.btnRow = function (host, items, cls) {
    var row = h('div', { class: 'ps-btnrow ' + (cls || '') }), out = {};
    items.forEach(function (it) { var b = h('button', { type: 'button', class: 'ps-btn' + (it.cls ? ' ' + it.cls : ''), html: it.t }); b.addEventListener('click', function () { it.fn(b); }); out[it.k || it.t] = b; row.append(b); });
    host.append(row); return { el: row, b: out };
  };

  /* ---------------------------------------------------------------- 凸包與多面體 */
  PS.hull = function (V) {
    var n = V.length, seen = {}, out = [], eps = 1e-6, cen = [0, 0, 0], i, j, k, m;
    V.forEach(function (p) { cen = V3.add(cen, p); }); cen = V3.mul(cen, 1 / n);
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) for (k = j + 1; k < n; k++) {
      var nr = V3.cross(V3.sub(V[j], V[i]), V3.sub(V[k], V[i])), L = V3.len(nr); if (L < eps) continue; nr = V3.mul(nr, 1 / L);
      var d = V3.dot(nr, V[i]), pos = 0, neg = 0, on = [];
      for (m = 0; m < n; m++) { var s = V3.dot(nr, V[m]) - d; if (s > eps) pos++; else if (s < -eps) neg++; else on.push(m); }
      if (pos && neg) continue; var key = on.join(','); if (seen[key]) continue; seen[key] = 1;
      if (V3.dot(nr, cen) - d > 0) nr = V3.mul(nr, -1);
      var fc = [0, 0, 0]; on.forEach(function (q) { fc = V3.add(fc, V[q]); }); fc = V3.mul(fc, 1 / on.length);
      var u = V3.norm(V3.sub(V[on[0]], fc)), v = V3.cross(nr, u);
      on.sort(function (a, b) { var pa = V3.sub(V[a], fc), pb = V3.sub(V[b], fc); return Math.atan2(V3.dot(pa, v), V3.dot(pa, u)) - Math.atan2(V3.dot(pb, v), V3.dot(pb, u)); });
      out.push(on);
    }
    return out;
  };
  function edgesOf(F) { var seen = {}, E = []; F.forEach(function (f) { for (var i = 0; i < f.length; i++) { var a = f[i], b = f[(i + 1) % f.length], k = Math.min(a, b) + '-' + Math.max(a, b); if (!seen[k]) { seen[k] = 1; E.push([Math.min(a, b), Math.max(a, b)]); } } }); return E; }
  function normalize(V) { var r = 0; V.forEach(function (p) { r = Math.max(r, V3.len(p)); }); return V.map(function (p) { return V3.mul(p, 1 / r); }); }
  var PHI = (1 + Math.sqrt(5)) / 2;
  var DEF = {
    tetra: ['正四面體', function () { return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]; }],
    cube: ['正六面體（正方體）', function () { var v = []; [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) { v.push([x, y, z]); }); }); }); return v; }],
    octa: ['正八面體', function () { return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]; }],
    icosa: ['正二十面體', function () { var v = []; [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { v.push([0, a, b * PHI], [a, b * PHI, 0], [b * PHI, 0, a]); }); }); return v; }],
    dodeca: ['正十二面體', function () { var v = [], q = 1 / PHI; [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { [-1, 1].forEach(function (c) { v.push([a, b, c]); }); v.push([0, a * q, b * PHI], [a * q, b * PHI, 0], [b * PHI, 0, a * q]); }); }); return v; }],
    tprism: ['正三角柱', function () { var v = []; for (var k = 0; k < 3; k++) { var a = Math.PI / 2 + k * 2 * Math.PI / 3; v.push([0.8 * Math.cos(a), -0.6, 0.8 * Math.sin(a)], [0.8 * Math.cos(a), 0.6, 0.8 * Math.sin(a)]); } return v; }],
    spyramid: ['正四角錐', function () { return [[0.75, -0.55, 0.75], [-0.75, -0.55, 0.75], [-0.75, -0.55, -0.75], [0.75, -0.55, -0.75], [0, 0.85, 0]]; }],
    pprism: ['正五角柱', function () { var v = []; for (var k = 0; k < 5; k++) { var a = Math.PI / 2 + k * 2 * Math.PI / 5; v.push([0.75 * Math.cos(a), -0.5, 0.75 * Math.sin(a)], [0.75 * Math.cos(a), 0.5, 0.75 * Math.sin(a)]); } return v; }],
    tpyramid: ['三角錐', function () { return [[0.8, -0.45, 0.46], [-0.8, -0.45, 0.46], [0, -0.45, -0.92], [0, 0.9, 0]]; }]
  };
  var cache = {};
  PS.solid = function (key) {
    if (cache[key]) return cache[key];
    var d = DEF[key], V = normalize(d[1]()), F = PS.hull(V);
    return (cache[key] = { key: key, name: d[0], V: V, F: F, E: edgesOf(F) });
  };
  PS.addSolid = function (sc, S, o) {
    o = o || {}; var cols = o.colors || ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'];
    sc.faces = S.F.map(function (f, i) { return { pts: f.map(function (j) { return S.V[j]; }), fill: o.fill || cols[i % cols.length], alpha: o.alpha === undefined ? 0.42 : o.alpha, stroke: o.stroke === undefined ? 'rgba(18,37,72,.55)' : o.stroke, lw: 1.2, flat: o.flat, label: o.labels ? String(i + 1) : '', id: 'f' + i }; });
    sc.lines = S.E.map(function (e, i) { return { a: S.V[e[0]], b: S.V[e[1]], color: o.edgeColor || '#122548', w: o.edgeW || 2.2, id: 'e' + i }; });
    sc.dots = S.V.map(function (p, i) { return { p: p, r: o.dotR || 5, color: o.dotColor || '#122548', id: 'v' + i }; });
    sc.invalidate();
  };
  /* 螢幕座標最近的點／線段 */
  function segDist(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
  PS.nearestPoint = function (sc, pos, pts, maxd) { var best = -1, bd = maxd || 24; pts.forEach(function (p, i) { var q = sc.project(p), d = Math.hypot(q[0] - pos[0], q[1] - pos[1]); if (d < bd) { bd = d; best = i; } }); return best; };
  PS.nearestSeg = function (sc, pos, segs, maxd) { var best = -1, bd = maxd || 18; segs.forEach(function (s, i) { var d = segDist(pos, sc.project(s[0]), sc.project(s[1])); if (d < bd) { bd = d; best = i; } }); return best; };

  /* ---------------------------------------------------------------- 積木 */
  /* cells: [[x,y,z],…]（單位方塊左下後角座標）。省略被鄰塊遮住的內部面。 */
  PS.cubeFaces = function (cells, color, opt) {
    var set = {}; cells.forEach(function (c) { set[c.join(',')] = 1; });
    var out = [], dirs = [[0, 0, 1, 0], [0, 0, -1, 1], [-1, 0, 0, 2], [1, 0, 0, 3], [0, 1, 0, 4], [0, -1, 0, 5]];
    cells.forEach(function (c) {
      var fs = D.cubeFaces(c[0], c[1], c[2], 1, typeof color === 'function' ? color(c) : color, opt);
      dirs.forEach(function (d, i) { if (!set[[c[0] + d[0], c[1] + d[1], c[2] + d[2]].join(',')]) { fs[d[3]].id = 'c' + c.join(','); out.push(fs[d[3]]); } });
    });
    return out;
  };
  /* 高度表 H[i][j]（i＝由左到右，j＝由前到後）→ 方塊座標：x＝i，z＝−j−1（前面朝 +z） */
  PS.heightCells = function (H) { var c = []; for (var i = 0; i < H.length; i++) for (var j = 0; j < H[i].length; j++) for (var k = 0; k < H[i][j]; k++) c.push([i, k, -j - 1]); return c; };
  /* 三個視圖（二維 0/1 陣列，列由上到下） */
  PS.views = function (H, maxH) {
    var n = H.length, m = H[0].length, top = [], front = [], right = [], i, j, k; maxH = maxH || 3;
    for (j = m - 1; j >= 0; j--) { var row = []; for (i = 0; i < n; i++) row.push(H[i][j] > 0 ? 1 : 0); top.push(row); }           // 上視：下列＝前面
    for (k = maxH - 1; k >= 0; k--) { var rf = [], rr = []; for (i = 0; i < n; i++) { var any = 0; for (j = 0; j < m; j++) if (H[i][j] > k) any = 1; rf.push(any); } for (j = 0; j < m; j++) { var an2 = 0; for (i = 0; i < n; i++) if (H[i][j] > k) an2 = 1; rr.push(an2); } front.push(rf); right.push(rr); }
    return { top: top, front: front, right: right };
  };
  PS.sameGrid = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
  PS.viewSvg = function (g, o) {
    o = o || {}; var rows = g.length, cols = g[0].length, u = 24, w = cols * u + 4, hh = rows * u + 4, svg = h('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'ps-viewsvg' + (o.opt ? ' ps-viewsvg--opt' : '') }), r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) svg.append(h('rect', { x: c * u + 2, y: r * u + 2, width: u, height: u, class: g[r][c] ? 'ps-vfill' : 'ps-vempty' }));
    return svg;
  };
  PS.viewSvgHtml = function (g) { var d = h('div'); d.append(PS.viewSvg(g, { opt: true })); return d.innerHTML; };

  /* ---------------------------------------------------------------- 展開圖模型 */
  /* faces: [{p:[[x,y],…] 2D 展開座標, parent:-1 或索引, a:[x,y], b:[x,y]（與父面共用的邊）, phi:摺角（弧度）, label, color}] */
  function rotLine(q, A, B, ang) {
    var d = [B[0] - A[0], B[1] - A[1], 0], o = [q[0] - A[0], q[1] - A[1], q[2]], r = D.rotAxis(o, d, ang);
    return [r[0] + A[0], r[1] + A[1], r[2]];
  }
  PS.Net = function (faces) {
    var self = this; this.faces = faces; this.n = faces.length;
    faces.forEach(function (f) {
      if (f.parent >= 0) { var d = [f.b[0] - f.a[0], f.b[1] - f.a[1]], c = [0, 0]; f.p.forEach(function (p) { c[0] += p[0] / f.p.length; c[1] += p[1] / f.p.length; }); var m = [c[0] - f.a[0], c[1] - f.a[1]]; f.s = (d[0] * m[1] - d[1] * m[0]) > 0 ? 1 : -1; }
    });
  };
  PS.Net.prototype = {
    /* 摺到進度 t（0＝攤平，1＝摺好）時，第 i 面的 3D 頂點 */
    pts: function (i, t) {
      var f = this.faces[i], q = f.p.map(function (p) { return [p[0], p[1], 0]; }), cur = f;
      while (cur && cur.parent >= 0) { var c2 = cur; q = q.map(function (v) { return rotLine(v, c2.a, c2.b, c2.s * c2.phi * t); }); cur = this.faces[cur.parent]; }
      return q;
    },
    /* 第 i 面與父面共用的摺線（摺到進度 t 時的兩個 3D 端點）；根面回傳 null */
    hinge: function (i, t) {
      var f = this.faces[i]; if (f.parent < 0) return null;
      var q = [[f.a[0], f.a[1], 0], [f.b[0], f.b[1], 0]], cur = this.faces[f.parent];
      while (cur && cur.parent >= 0) { var c2 = cur; q = q.map(function (v) { return rotLine(v, c2.a, c2.b, c2.s * c2.phi * t); }); cur = this.faces[cur.parent]; }
      return q;
    },
    all: function (t) { var self = this; return this.faces.map(function (f, i) { return self.pts(i, t); }); },
    center: function () { var s = [0, 0, 0], k = 0; this.all(1).forEach(function (F) { F.forEach(function (p) { s = V3.add(s, p); k++; }); }); return V3.mul(s, 1 / k); },
    /* 立方體展開圖是否合法：摺好後 6 個面的法向兩兩不同 */
    cubeValid: function () {
      var seen = {}, ok = true; this.all(1).forEach(function (F) { var nr = V3.norm(V3.cross(V3.sub(F[1], F[0]), V3.sub(F[3], F[0]))), k = nr.map(function (x) { return Math.round(x * 10) / 10 + 0; }).join(','); if (seen[k]) ok = false; seen[k] = 1; });
      return ok;
    },
    /* 摺好後，每面法向（四捨五入）→ 方向代號 */
    dirs: function () { return this.all(1).map(function (F) { return V3.norm(V3.cross(V3.sub(F[1], F[0]), V3.sub(F[3], F[0]))).map(function (x) { return Math.round(x); }); }); }
  };
  /* 由格子（[[c,r],…]，r 向下）建立立方體展開圖。根＝第一格（或指定索引）；以廣度優先建立摺疊樹 */
  PS.cubeNet = function (cells, root) {
    var idx = {}; cells.forEach(function (c, i) { idx[c.join(',')] = i; });
    var r0 = root || 0, order = [r0], parent = {}, seen = {}; seen[r0] = 1; parent[r0] = -1;
    for (var qi = 0; qi < order.length; qi++) {
      var ci = order[qi], c = cells[ci];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var k = (c[0] + d[0]) + ',' + (c[1] + d[1]); if (idx[k] !== undefined && !seen[idx[k]]) { seen[idx[k]] = 1; parent[idx[k]] = ci; order.push(idx[k]); } });
    }
    var faces = [], map = {};
    order.forEach(function (ci, k) {
      var c = cells[ci], x = c[0], y = -c[1] - 1, f = { p: [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]], parent: -1, phi: Math.PI / 2, label: String(k + 1), cell: ci };
      if (parent[ci] >= 0) {
        var pc = cells[parent[ci]], dx = c[0] - pc[0], dy = c[1] - pc[1], px = pc[0], py = -pc[1] - 1;
        f.parent = map[parent[ci]];
        if (dx === 1) { f.a = [px + 1, py]; f.b = [px + 1, py + 1]; } else if (dx === -1) { f.a = [px, py]; f.b = [px, py + 1]; } else if (dy === 1) { f.a = [px, py]; f.b = [px + 1, py]; } else { f.a = [px, py + 1]; f.b = [px + 1, py + 1]; }
      }
      map[ci] = k; faces.push(f);
    });
    return new PS.Net(faces);
  };
  /* 所有 6 連方塊（35 種，旋轉鏡射視為相同） */
  PS.hexominoes = function () {
    if (PS._hex) return PS._hex;
    function canon(cells) {
      var best = null;
      for (var t = 0; t < 8; t++) {
        var q = cells.map(function (c) { var x = c[0], y = c[1]; if (t & 1) x = -x; if (t & 2) y = -y; if (t & 4) { var tmp = x; x = y; y = tmp; } return [x, y]; });
        var mx = Math.min.apply(null, q.map(function (c) { return c[0]; })), my = Math.min.apply(null, q.map(function (c) { return c[1]; }));
        q = q.map(function (c) { return [c[0] - mx, c[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
        var s = JSON.stringify(q); if (best === null || s < best.s) best = { s: s, q: q };
      }
      return best;
    }
    var cur = { '[[0,0]]': [[0, 0]] }, size;
    for (size = 1; size < 6; size++) {
      var next = {};
      Object.keys(cur).forEach(function (k) {
        var cells = cur[k], set = {}; cells.forEach(function (c) { set[c.join(',')] = 1; });
        cells.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nc = [c[0] + d[0], c[1] + d[1]]; if (!set[nc.join(',')]) { var cn = canon(cells.concat([nc])); next[cn.s] = cn.q; } }); });
      });
      cur = next;
    }
    PS._hex = Object.keys(cur).sort().map(function (k) { return cur[k]; });
    return PS._hex;
  };
  PS.cubeNets11 = function () { if (!PS._n11) PS._n11 = PS.hexominoes().filter(function (c) { return PS.cubeNet(c).cubeValid(); }); return PS._n11; };
  /* 立方體展開圖的小縮圖（SVG） */
  PS.netSvg = function (cells, o) {
    o = o || {}; var u = o.u || 14, mx = Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1, my = Math.max.apply(null, cells.map(function (c) { return c[1]; })) + 1;
    var svg = h('svg', { viewBox: '0 0 ' + (mx * u + 4) + ' ' + (my * u + 4), width: mx * u + 4, height: my * u + 4, class: 'ps-netsvg' });
    cells.forEach(function (c, i) { svg.append(h('rect', { x: c[0] * u + 2, y: c[1] * u + 2, width: u, height: u, class: 'ps-netcell' })); });
    if (o.numbers) { var nt = PS.cubeNet(cells); nt.faces.forEach(function (f) { var c = cells[f.cell], tx = h('text', { x: c[0] * u + 2 + u / 2, y: c[1] * u + 2 + u / 2 + 5, 'text-anchor': 'middle', 'font-size': Math.round(u * 0.6), 'font-weight': 800, fill: '#122548' }); tx.textContent = f.label; svg.append(tx); }); }
    return svg;
  };

  /* ---------------------------------------------------------------- 方向標示（前／後／左／右、視角小標、軸） */
  PS.DIRCOL = { front: '#c2255c', back: '#5a5140', left: '#1c6bd8', right: '#17803f' };
  /* 方向標籤的動態處理（每次繪製前）：
     1) 近的標籤（靠近觀看者）放在地板高度、遠的標籤抬高到外框上緣——積木最高只到上緣，所以遠的標籤不會被積木擋住；介於中間的平順過渡。
     2) 兩個標籤在畫面上疊在一起（正對著看時前／後、左／右會重合）→ 只畫比較靠近觀看者的那一個。
     這些都不影響 autoFit（fit 把標籤的上下兩端都算進去） */
  PS.dirDedupe = function (sc) {
    var prev = sc.onPreRender;
    sc.onPreRender = function (c, s) {
      if (prev) prev(c, s); var T = (s.extraTexts || []).filter(function (t) { return t.dir; }), i, j;
      T.forEach(function (t) {
        if (t.yLo === undefined) return;
        var d = D.rotY([t.p[0] - t.c[0], 0, t.p[2] - t.c[1]], s.yaw)[2], k = Math.max(0, Math.min(1, (d + 0.4) / 0.8)); t.p[1] = t.yHi + (t.yLo - t.yHi) * k;
      });
      var q = T.map(function (t) { return { t: t, p: s.project(t.p), d: s.view(t.p)[2] }; });
      q.forEach(function (a) { a.t.skip = false; });
      for (i = 0; i < q.length; i++) for (j = i + 1; j < q.length; j++) { if (Math.abs(q[i].p[0] - q[j].p[0]) < 18 && Math.abs(q[i].p[1] - q[j].p[1]) < 18) { if (q[i].d < q[j].d) q[i].t.skip = true; else q[j].t.skip = true; } }
    };
  };
  /* 四邊外框的「前／後／左／右」。box＝{x0,x1,z0,z1,y（地板高度）,lo（近處標籤高度，放在地板下方一點，側面看時才不會壓在積木上）,ly（遠處標籤高度＝外框上緣）}（x 向右、z 朝向觀看者＝前面，z1 是前邊）。
     標籤是跟著積木轉的 3D 文字，永遠正面朝向螢幕、畫在最上層。 */
  PS.dirLabels = function (sc, box, o) {
    o = o || {}; var m = o.margin === undefined ? 0.6 : o.margin, yLo = box.lo !== undefined ? box.lo : (box.y || 0), yHi = box.ly !== undefined ? box.ly : yLo, cx = (box.x0 + box.x1) / 2, cz = (box.z0 + box.z1) / 2, sz = o.size || 16, C = PS.DIRCOL;
    function T(x, z, t, col) { return { p: [x, yLo, z], p2: [x, yHi, z], c: [cx, cz], yLo: yLo, yHi: yHi, t: t, color: col, size: sz, halo: true, top: true, dir: true }; }
    sc.extraTexts = (o.up ? [{ p: [cx, o.up, cz], t: '上', color: '#6b4a00', size: sz, halo: true, top: true }] : []).concat([
      T(cx, box.z1 + m, '前', C.front), T(cx, box.z0 - m, '後', C.back), T(box.x0 - m, cz, '左', C.left), T(box.x1 + m, cz, '右', C.right)]);
    PS.dirDedupe(sc); sc.invalidate();
  };
  /* 地板：畫在所有東西後面（不參與遮擋排序）。前邊用粉紅粗線標出 */
  PS.floor = function (sc, box) {
    var y = box.y || 0, P4 = [[box.x0, y, box.z1], [box.x1, y, box.z1], [box.x1, y, box.z0], [box.x0, y, box.z0]];
    sc.onPreRender = function (c, s) {
      var q = P4.map(function (p) { return s.project(p); }); c.save(); c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (var i = 1; i < 4; i++) c.lineTo(q[i][0], q[i][1]); c.closePath(); c.fillStyle = 'rgba(236,225,196,.55)'; c.fill(); c.strokeStyle = 'rgba(160,130,70,.55)'; c.lineWidth = 1.4; c.stroke();
      c.beginPath(); c.moveTo(q[0][0], q[0][1]); c.lineTo(q[1][0], q[1][1]); c.strokeStyle = PS.DIRCOL.front; c.lineWidth = 3.2; c.lineCap = 'round'; c.stroke(); c.restore();
    };
  };
  /* 視角小標：轉到前視／上視／右視…時，在畫布左上角寫「從哪個方向看」。轉動中途不顯示 */
  PS.viewTag = function (sc) {
    sc.tagFn = function (s) {
      var TWO = Math.PI * 2, y = ((s.yaw % TWO) + TWO) % TWO, p = s.pitch, e = 0.07;
      if (p > Math.PI / 2 - e) return '從上面看（上視圖）';
      if (Math.abs(p) > e) return '';
      function near(a) { return Math.abs(((y - a + Math.PI) % TWO + TWO) % TWO - Math.PI) < e; }
      if (near(0)) return '從前面看（前視圖）'; if (near(TWO - Math.PI / 2)) return '從右邊看（右視圖）'; if (near(Math.PI / 2)) return '從左邊看（左視圖）'; if (near(Math.PI)) return '從後面看（後視圖）';
      return '';
    };
    sc.invalidate();
  };
  /* 座標軸（含箭頭與正負標示）：回傳 {lines, texts}。len＝軸半長 */
  PS.axisSet = function (len, o) {
    o = o || {}; var cols = ['#e03131', '#2b8a3e', '#1971c2'], nm = ['x', 'y', 'z'], lines = [], texts = [], sz = o.size || 15;
    (o.only || [0, 1, 2]).forEach(function (a) {
      var u = [0, 0, 0], v = [0, 0, 0], w = [0, 0, 0], T = V3.mul(u, len), hs = 0.3, hw = 0.11; u[a] = 1; v[(a + 1) % 3] = 1; w[(a + 2) % 3] = 1; T = V3.mul(u, len);
      lines.push({ a: V3.mul(u, -len), b: T, color: cols[a], w: o.w || 2.5, bias: -2 });
      [v, w].forEach(function (q) { [1, -1].forEach(function (sg) { lines.push({ a: T, b: V3.add(V3.sub(T, V3.mul(u, hs)), V3.mul(q, hw * sg)), color: cols[a], w: o.w || 2.5, bias: -2 }); }); });
      texts.push({ p: V3.mul(u, len + 0.32), t: '+' + nm[a], color: cols[a], size: sz, halo: true, top: true, dir: true }, { p: V3.mul(u, -len - 0.32), t: '−' + nm[a], color: cols[a], size: sz - 2, halo: true, top: true, dir: true });
    });
    return { lines: lines, texts: texts };
  };

  /* ---------------------------------------------------------------- 視圖小圖（全單元共用大小：手機 92px、電腦 132px；由 CSS 變數 --vw 決定） */
  PS.VIEWSUB = { front: '前視圖', top: '上視圖', right: '右視圖' };
  PS.VIEWHINT = { front: '從前面看', top: '下方＝前', right: '左邊＝前' };
  PS.viewFig = function (g, key, o) {
    o = o || {}; var d = h('figure', { class: 'ps-vfig' + (o.cls ? ' ' + o.cls : '') });
    d.append(PS.viewSvg(g, { u: 24 }), h('figcaption', {}, h('b', {}, o.name || PS.VIEWSUB[key] || key), o.hint === false ? null : h('small', {}, o.hint || PS.VIEWHINT[key] || '')));
    return d;
  };
  PS.viewFigRow = function (host, items) { var row = h('div', { class: 'ps-viewrow ps-viewrow--figs' }); items.forEach(function (it) { row.append(PS.viewFig(it.g, it.k, it)); }); host.append(row); return row; };
  /* 俯視格（每格的方塊數）的小圖：plan[r][c]，上＝後面 */
  PS.planHtml = function (plan) { var d = h('div', { class: 'ps-plan' }); d.style.gridTemplateColumns = 'repeat(' + plan[0].length + ',1fr)'; plan.forEach(function (r) { r.forEach(function (v) { d.append(h('span', { 'data-n': v }, v ? String(v) : '')); }); }); var w = h('div'); w.append(d); return w.innerHTML; };
  PS.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  PS.rand = function (n) { return Math.floor(Math.random() * n); };
})();
