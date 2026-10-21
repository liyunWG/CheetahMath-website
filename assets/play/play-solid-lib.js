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
    var mh = o.maxH || Math.max(170, Math.min(300, window.innerHeight - 450));
    var cfg = { aspect: o.aspect || 1.3, maxH: mh, scale: o.scale || 80, yaw: o.yaw === undefined ? -0.6 : o.yaw, pitch: o.pitch === undefined ? 0.45 : o.pitch, cull: !!o.cull, center: o.center || [0, 0, 0], persp: o.persp || 0, drag: o.drag, lockPitch: o.lockPitch, scroll: o.scroll, label: o.label };
    ['onTap', 'onDrag', 'onDragStart', 'onDragEnd'].forEach(function (k) { if (o[k]) cfg[k] = o[k]; });
    var sc = new D.Scene(host, cfg); sc.onDragEnd = o.onDragEnd; (PS.scenes = PS.scenes || []).push(sc); if (PS.scenes.length > 8) PS.scenes.shift(); return sc;
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
    o = o || {}; var rows = g.length, cols = g[0].length, u = o.u || 24, w = cols * u + 4, hh = rows * u + 4, svg = h('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'ps-viewsvg', width: w, height: hh }), r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) svg.append(h('rect', { x: c * u + 2, y: r * u + 2, width: u, height: u, class: g[r][c] ? 'ps-vfill' : 'ps-vempty' }));
    return svg;
  };
  PS.viewSvgHtml = function (g, u) { var d = h('div'); d.append(PS.viewSvg(g, { u: u || 14 })); return d.innerHTML; };

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
    return svg;
  };
  PS.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  PS.rand = function (n) { return Math.floor(Math.random() * n); };
})();
