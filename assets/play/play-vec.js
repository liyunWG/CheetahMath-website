/* 獵豹玩中學｜向量小工具（向量的加減、內積、平行垂直與面積等單元共用）
   等比例的座標系（x 方向與 y 方向每格一樣長，垂直看起來才是垂直）、帶箭頭的向量、可拖動的終點。需要先載入 play-app.js 與 play-fgraph.js。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, PF = window.PF, PV = {};

  PV.XR = [-6, 6]; PV.YR = [-4, 4];
  PV.f = PF.fmt;
  PV.vs = function (x, y) { return '(' + PF.fmt(x) + ', ' + PF.fmt(y) + ')'; };

  /* 12 × 8 格、x 與 y 每格一樣長 */
  PV.plane = function (host, sm) { return PF.plane(host, { x0: PV.XR[0], x1: PV.XR[1], y0: PV.YR[0], y1: PV.YR[1], hh: 2 + 80 / 12, tx: 1, ty: 1, sm: sm }); };

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
    var dx = Math.abs(a[0] - b2[0]) - (a[2] === undefined ? 0.4 : a[2]) - (b2[2] === undefined ? 0.4 : b2[2]), dy = Math.abs(a[1] - b2[1]) - (a[3] === undefined ? 0.4 : a[3]) - (b2[3] === undefined ? 0.4 : b2[3]);
    return Math.hypot(Math.max(0, dx), Math.max(0, dy));
  };
  /* 在箭頭 p→q 旁邊的幾個候選位置裡，挑離「要避開的東西」（[x, y, 半寬, 半高]）最遠的一個。size 是這個名字的 [半寬, 半高]。
     回傳 {b: 畫板座標, m: 數學座標}。 */
  PV.place = function (pl, p, q, avoid, off, size) {
    var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, best = null, bd = -1e9, sz = size || [0.4, 0.4];
    [0.5, 0.35, 0.65, 0.2, 0.8].forEach(function (t) { [1, -1].forEach(function (sd) { [1, 1.6, 2.2, 2.8].forEach(function (mul) {
      var m = [p[0] + dx * t + nx * sd * (off || 0.7) * mul, p[1] + dy * t + ny * sd * (off || 0.7) * mul], d = 1e9, me = [m[0], m[1], sz[0], sz[1]];
      avoid.forEach(function (a) { d = Math.min(d, PV.gap(me, a)); });
      d = Math.min(d, 0.6) - (mul - 1) * 0.05;   /* 空隙到 0.6 就算乾淨；乾淨時選離箭頭近的 */
      if (m[0] < -5.4 + sz[0] || m[0] > 5.4 - sz[0] || m[1] < -3.4 || m[1] > 3.4) d -= 5;
      if (d > bd + 1e-9) { bd = d; best = m; } }); }); });
    return { b: [pl.X(best[0]), pl.Y(best[1]) - 0.12], m: [best[0], best[1], sz[0], sz[1]] };
  };

  /* 格點候選位置（不含原點） */
  PV.lattice = function (pl, xr, yr, withOrigin) {
    var c = []; for (var x = xr[0]; x <= xr[1]; x++) for (var y = yr[0]; y <= yr[1]; y++) if (withOrigin || x !== 0 || y !== 0) c.push([pl.X(x), pl.Y(y)]);
    return c;
  };

  window.PV = PV;
})();
