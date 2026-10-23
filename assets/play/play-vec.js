/* 獵豹玩中學｜向量小工具（向量的加減、內積、平行垂直與面積等單元共用）
   等比例的座標系（x 方向與 y 方向每格一樣長，垂直看起來才是垂直）、帶箭頭的向量、可拖動的終點。需要先載入 play-app.js 與 play-fgraph.js。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, PF = window.PF, PV = {};

  PV.XR = [-6, 6]; PV.YR = [-4, 4];
  PV.f = PF.fmt;
  PV.vs = function (x, y) { return '(' + PF.fmt(x) + ', ' + PF.fmt(y) + ')'; };

  /* 12 × 8 格、x 與 y 每格一樣長 */
  PV.plane = function (host, sm, ex) { return PF.plane(host, Object.assign({ x0: PV.XR[0], x1: PV.XR[1], y0: PV.YR[0], y1: PV.YR[1], hh: 2 + 10 * (PV.YR[1] - PV.YR[0]) / (PV.XR[1] - PV.XR[0]), tx: 1, ty: 1, sm: false }, ex || {})); };

  /* 箭頭（數學座標）：set(p, q) 從 p 畫到 q；p、q 重合就藏起來 */
  PV.arrow = function (pl, color, layer, o) {
    o = o || {}; var b = pl.b, g = layer || pl.gC;
    var ln = b.line([0, 0], [0, 0], 'pl-line', g), hd = h('polygon', { fill: color, stroke: color, 'stroke-width': 1 }); g.append(hd);
    ln.style.stroke = color; ln.style.strokeWidth = (o.w || 4) + 'px'; if (o.dash) ln.style.strokeDasharray = '7 6';   /* 用 style 才蓋得過 .pl-line 的 CSS 顏色 */
    var S = {};
    S.set = function (p, q) {
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
      if (L < 1e-9) { ln.style.display = 'none'; hd.style.display = 'none'; return S; }
      ln.style.display = hd.style.display = ''; var ux = dx / L, uy = dy / L, hl = Math.min(0.45, L * 0.6), base = [q[0] - ux * hl, q[1] - uy * hl], w = 0.2;
      b.setLine(ln, [pl.X(p[0]), pl.Y(p[1])], [pl.X(base[0]), pl.Y(base[1])]);
      b.setPoly(hd, [[pl.X(q[0]), pl.Y(q[1])], [pl.X(base[0] - uy * w), pl.Y(base[1] + ux * w)], [pl.X(base[0] + uy * w), pl.Y(base[1] - ux * w)]]);
      return S;
    };
    S.hide = function (v) { ln.style.display = hd.style.display = v ? 'none' : ''; return S; };
    return S;
  };

  /* 向量的名字放在箭頭「中間偏旁邊」（不放在終點：終點有把手）。side ＝ 1 放左邊、−1 放右邊。回傳畫板座標。 */
  PV.mid = function (pl, p, q, side, off) {
    var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * side, ny = dx / L * side;
    return [pl.X((p[0] + q[0]) / 2 + nx * (off || 0.6)), pl.Y((p[1] + q[1]) / 2 + ny * (off || 0.6)) - 0.12];
  };

  /* 兩個「有大小的東西」之間的空隙（數學座標）。每個東西是 [x, y, 半寬, 半高]，半寬半高預設 0.4（一個字母或一個把手）。重疊時回傳 0。 */
  PV.gap = function (a, b2) {
    var dx = Math.abs(a[0] - b2[0]) - (a[2] === undefined ? 0.62 : a[2]) - (b2[2] === undefined ? 0.62 : b2[2]), dy = Math.abs(a[1] - b2[1]) - (a[3] === undefined ? 0.62 : a[3]) - (b2[3] === undefined ? 0.62 : b2[3]);
    if (dx < 0 && dy < 0) return Math.max(dx, dy);   /* 重疊時回傳負數（越負、壓得越深），才分得出哪個位置比較不糟 */
    return Math.hypot(Math.max(0, dx), Math.max(0, dy));
  };
  /* 在箭頭 p→q 旁邊的幾個候選位置裡，挑離「要避開的東西」（[x, y, 半寬, 半高]）最遠的一個。size 是這個名字的 [半寬, 半高]。
     回傳 {b: 畫板座標, m: 數學座標}。 */
  PV.place = function (pl, p, q, avoid, off, size) {
    var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, best = null, bd = -1e9, sz = size ? [size[0], Math.max(size[1], 0.45)] : [0.4, 0.45];
    [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9].forEach(function (t) { [1, -1].forEach(function (sd) { [1, 1.5, 2, 2.5, 3, 3.5, 4.2, 5].forEach(function (mul) {
      var m = [p[0] + dx * t + nx * sd * (off || 0.7) * mul, p[1] + dy * t + ny * sd * (off || 0.7) * mul], d = 1e9, me = [m[0], m[1], sz[0], sz[1]];
      avoid.forEach(function (a) { d = Math.min(d, PV.gap(me, a)); });
      d = Math.min(d, 0.6) - (mul - 1) * 0.05;   /* 空隙到 0.6 就算乾淨；乾淨時選離箭頭近的 */
      if (m[0] < -5.4 + sz[0] || m[0] > 5.4 - sz[0] || m[1] < -3.4 || m[1] > 3.4) d -= 5;
      if (d > bd + 1e-9) { bd = d; best = m; } }); }); });
    return { b: [pl.X(best[0]), pl.Y(best[1]) - 0.27], m: [best[0], best[1], sz[0], sz[1]] };
  };

  /* 格點候選位置（不含原點） */
  PV.lattice = function (pl, xr, yr, withOrigin) {
    var c = []; for (var x = xr[0]; x <= xr[1]; x++) for (var y = yr[0]; y <= yr[1]; y++) if (withOrigin || x !== 0 || y !== 0) c.push([pl.X(x), pl.Y(y)]);
    return c;
  };

  /* ───────── 直線與圓用的小工具（D 組：直線方程、圓的方程、圓與直線、兩圓） ───────── */
  PV.S = 10 / 12;   /* 數學座標 1 格 ＝ 畫板座標 S（x、y 一樣長，圓才是圓） */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  PV.gcd = gcd;
  /* 分數：fr(n, d) 化到最簡（整數就不帶分母）。負號用「−」。 */
  PV.fr = function (n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? PF.fmt(n) : (n < 0 ? '−' : '') + Math.abs(n) + '/' + d; };
  /* 一般式 Ax＋By＋C＝0 過 (x1,y1)、(x2,y2)（整數、最簡、A＞0 或 A＝0 且 B＞0） */
  PV.gen = function (x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, A = dy, B = -dx, C = dx * y1 - dy * x1, g = gcd(gcd(A, B), C) || 1;
    A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return [A, B, C];
  };
  /* 直線 Ax＋By＋C＝0 在畫面範圍內的兩個端點（數學座標）；沒有就回傳 null */
  PV.clip = function (A, B, C) {
    var pts = [], x0 = PV.XR[0], x1 = PV.XR[1], y0 = PV.YR[0], y1 = PV.YR[1], e = 1e-9;
    if (Math.abs(B) > e) { [x0, x1].forEach(function (x) { var y = -(A * x + C) / B; if (y >= y0 - e && y <= y1 + e) pts.push([x, y]); }); }
    if (Math.abs(A) > e) { [y0, y1].forEach(function (y) { var x = -(B * y + C) / A; if (x >= x0 - e && x <= x1 + e) pts.push([x, y]); }); }
    if (pts.length < 2) return null;
    var p = pts[0], q = pts[0], best = -1; pts.forEach(function (u) { pts.forEach(function (v) { var d = Math.hypot(u[0] - v[0], u[1] - v[1]); if (d > best) { best = d; p = u; q = v; } }); });
    return [p, q];
  };
  /* 整條直線 Ax＋By＋C＝0，切在畫面的範圍內。set(A, B, C)；沒有交點就藏起來 */
  PV.fline = function (pl, color, o) {
    o = o || {}; var b = pl.b, ln = b.line([0, 0], [0, 0], 'pl-line', o.layer || pl.gC); ln.style.stroke = color; ln.style.strokeWidth = (o.w || 4) + 'px'; if (o.dash) ln.style.strokeDasharray = '7 6';
    var S = { el: ln };
    S.set = function (A, B, C) {
      var c = PV.clip(A, B, C); if (!c) { ln.style.display = 'none'; return S; }
      ln.style.display = ''; b.setLine(ln, [pl.X(c[0][0]), pl.Y(c[0][1])], [pl.X(c[1][0]), pl.Y(c[1][1])]); return S;
    };
    S.hide = function (v) { ln.style.display = v ? 'none' : ''; return S; };
    return S;
  };
  /* 圓（折線畫，超出畫面的部分自動斷開）。set(圓心, 半徑) */
  PV.circ = function (pl, color, o) {
    o = o || {}; var g = h('g'); (o.layer || pl.gC).append(g); var S = {};
    S.set = function (c, r) {
      g.innerHTML = ''; if (r <= 1e-9) return S; var n = 200, run = [], runs = [], i, ex = 0.04;
      for (i = 0; i <= n; i++) {
        var t = 2 * Math.PI * i / n, x = c[0] + r * Math.cos(t), y = c[1] + r * Math.sin(t);
        if (x >= PV.XR[0] - ex && x <= PV.XR[1] + ex && y >= PV.YR[0] - ex && y <= PV.YR[1] + ex) run.push([pl.X(x), pl.Y(y)]); else { if (run.length > 1) runs.push(run); run = []; }
      }
      if (run.length > 1) { if (runs.length && Math.hypot(run[run.length - 1][0] - runs[0][0][0], run[run.length - 1][1] - runs[0][0][1]) < 0.2 && run !== runs[0]) { runs[0] = run.concat(runs[0]); } else runs.push(run); }
      runs.forEach(function (rn) { var pe = h('polyline', { points: pl.b.pts(rn), fill: 'none', class: 'pl-line' }); pe.style.stroke = color; pe.style.strokeWidth = (o.w || 4) + 'px'; if (o.dash) pe.style.strokeDasharray = '7 6'; g.append(pe); });
      return S;
    };
    S.hide = function (v) { g.style.display = v ? 'none' : ''; return S; };
    return S;
  };
  /* 弧（角度記號）：set(圓心, 半徑, 起始角, 終止角)（弧度、逆時針），折線畫 */
  PV.arc = function (pl, color, o) {
    o = o || {}; var pe = h('polyline', { points: '0,0 0,0', fill: 'none', class: 'pl-line' }), S = {}; pe.style.stroke = color; pe.style.strokeWidth = (o.w || 3) + 'px'; (o.layer || pl.gC).append(pe);
    S.set = function (c, r, a0, a1) {
      var n = 24, pts = [], i; if (Math.abs(a1 - a0) < 1e-6) { pe.style.display = 'none'; return S; }
      for (i = 0; i <= n; i++) { var t = a0 + (a1 - a0) * i / n; pts.push([pl.X(c[0]) + r * (pl.X(1) - pl.X(0)) * Math.cos(t), pl.Y(c[1]) + r * (pl.X(1) - pl.X(0)) * Math.sin(t)]); }
      pe.setAttribute('points', pl.b.pts(pts)); pe.style.display = ''; return S;
    };
    S.hide = function (v) { pe.style.display = v ? 'none' : ''; return S; };
    return S;
  };
  /* 直角符號（小方框）：set(角的頂點（數學座標）, 單位向量 u, 單位向量 v)；u、v 是兩條邊的方向 */
  PV.right = function (pl, o) {
    o = o || {}; var pe = h('polyline', { points: '0,0 0,0', class: 'pl-right' }), S = {}; (o.layer || pl.gC).append(pe);
    S.set = function (c, u, v, s) {
      s = (s || 0.36); var cx = pl.X(c[0]), cy = pl.Y(c[1]), a = [cx + u[0] * s, cy + u[1] * s], b2 = [a[0] + v[0] * s, a[1] + v[1] * s], c2 = [cx + v[0] * s, cy + v[1] * s];
      pe.setAttribute('points', pl.b.pts([a, b2, c2])); pe.style.display = ''; return S;
    };
    S.hide = function (v) { pe.style.display = v ? 'none' : ''; return S; };
    return S;
  };
  /* 在一圈候選位置裡挑離「要避開的東西」最遠的一個（名字標籤用）。cands: 數學座標 [x, y] 的陣列；size: 名字的 [半寬, 半高]。回傳 {b, m}。 */
  PV.pick = function (pl, cands, avoid, size) {
    var sz = size || [0.3, 0.45], best = null, bd = -1e9;
    cands.forEach(function (m, i) {
      var me = [m[0], m[1], sz[0], sz[1]], d = 1e9; avoid.forEach(function (a) { d = Math.min(d, PV.gap(me, a)); });
      d = Math.min(d, 0.6) - i * 0.01;
      if (m[0] < PV.XR[0] + 0.5 + sz[0] || m[0] > PV.XR[1] - 0.2 - sz[0] || m[1] < PV.YR[0] + 0.5 || m[1] > PV.YR[1] - 0.3) d -= 5;
      if (d > bd + 1e-9) { bd = d; best = m; }
    });
    return { b: [pl.X(best[0]), pl.Y(best[1]) - 0.27], m: [best[0], best[1], sz[0], sz[1]] };
  };
  /* 沿著線段 p→q 每隔 step 放一個小方塊（半寬半高 hw），給名字標籤避讓用 */
  PV.segBoxes = function (p, q, step, hw) {
    var L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.ceil(L / (step || 0.5))), out = [], i; for (i = 0; i <= n; i++) out.push([p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n, hw || 0.1, hw || 0.1]); return out;
  };
  /* 繞著點 c 的候選位置：半徑由小到大，每圈從 a0 這個方向開始 */
  PV.ring = function (c, a0, radii) {
    var out = []; (radii || [1.5, 2, 2.5, 3]).forEach(function (r) { var k; for (k = 0; k < 12; k++) { var t = a0 + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * Math.PI / 6; out.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); } }); return out;
  };
  /* 點 p 旁邊的候選位置（沿著直線方向 u 的兩側與四個角落） */
  PV.around = function (p, u, off) {
    var n = [-u[1], u[0]], o = off || 1.05, out = [];
    [1, -1].forEach(function (s) { [0, 0.5, -0.5].forEach(function (t) { out.push([p[0] + n[0] * s * o + u[0] * t, p[1] + n[1] * s * o + u[1] * t]); }); });
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (d) { out.push([p[0] + d[0] * o, p[1] + d[1] * o]); });
    return out;
  };

  window.PV = PV;
})();
