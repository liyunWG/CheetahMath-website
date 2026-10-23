/* 獵豹玩中學｜函數圖小工具（二次函數、二次不等式、區間、分段函數等單元共用）
   在 PA.board 的畫板上畫座標軸與函數曲線：數學座標 (x, y) ↔ 畫板座標 X(x)、Y(y)。需要先載入 play-app.js。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, PA = window.PA, PF = {};

  PF.fmt = function (v) { return (v < 0 ? '−' : '') + Math.abs(Math.round(v * 1000) / 1000); };

  /* 建立畫板＋座標軸。o: x0, x1, y0, y1（顯示範圍）, hh（板高，預設 8）, sm, tx／ty（刻度間隔，預設 1）, skipX／skipY（不標數字的刻度，例如把手或標籤會經過的位置）, ylab（y 軸刻度間隔，預設 ty；0 表示不標）。
     回傳 {b, X, Y, Xi, Yi, hh, gA（座標軸層）, gC（曲線層）, curve(cls)}。 */
  PF.plane = function (host, o) {
    var hh = o.hh || 8, b = PA.board(host, 12, hh, o.sm ? 'pl-svg--sm' : ''), x0 = o.x0, x1 = o.x1, y0 = o.y0, y1 = o.y1, tx = o.tx || 1, ty = o.ty || 1;
    function X(x) { return 1 + (x - x0) * 10 / (x1 - x0); }
    function Y(y) { return 1 + (y - y0) * (hh - 2) / (y1 - y0); }
    function Xi(bx) { return x0 + (bx - 1) * (x1 - x0) / 10; }
    function Yi(by) { return y0 + (by - 1) * (y1 - y0) / (hh - 2); }
    var gA = h('g'), gC = h('g'); b.gMid.append(gA, gC);
    var ay = (y0 <= 0 && 0 <= y1) ? Y(0) : 1, ax = (x0 <= 0 && 0 <= x1) ? X(0) : 1, k;
    /* 淡淡的格線幫忙讀值；刻度數字放在畫板邊緣（下緣、左緣），不會被把手或曲線旁的文字壓到 */
    for (k = Math.ceil(x0 / tx - 1e-9); k * tx <= x1 + 1e-9; k++) {
      b.line([X(k * tx), Y(y0)], [X(k * tx), Y(y1)], 'pg-minor', gA);
      if (o.xlab !== 0 && !(o.skipX && o.skipX.indexOf(k * tx) >= 0)) b.text([X(k * tx), 0.32], PF.fmt(k * tx), 'pl-text pl-text--sm', gA);
    }
    for (k = Math.ceil(y0 / ty - 1e-9); k * ty <= y1 + 1e-9; k++) {
      b.line([X(x0), Y(k * ty)], [X(x1), Y(k * ty)], 'pg-minor', gA);
      if (o.ylab !== 0 && Math.abs(k * ty - y0) > 1e-9 && !(o.skipY && o.skipY.indexOf(k * ty) >= 0)) b.text([0.75, Y(k * ty) - 0.17], PF.fmt(k * ty), 'pl-text pl-text--sm pl-text--r', gA);
    }
    b.line([X(x0) - 0.4, ay], [X(x1) + 0.4, ay], 'pg-axis', gA); b.line([ax, Y(y0) - 0.4], [ax, Y(y1) + 0.4], 'pg-axis', gA);
    var pad = (y1 - y0) * 0.04;
    /* 曲線：每次 set 都重畫；超出 y 範圍的點不連線（拆成好幾段） */
    function curve(cls, layer) {
      var g = h('g'); (layer || gC).append(g);
      return {
        g: g, clear: function () { g.innerHTML = ''; },
        set: function (fn, dom) {
          g.innerHTML = ''; var a = dom ? dom[0] : x0, z = dom ? dom[1] : x1, n = 240, run = [], runs = [], i;
          if (z < a) return;
          for (i = 0; i <= n; i++) {
            var x = a + (z - a) * i / n, y = fn(x);
            if (y >= y0 - pad && y <= y1 + pad) run.push([X(x), Y(y)]); else { if (run.length > 1) runs.push(run); run = []; }
          }
          if (run.length > 1) runs.push(run);
          runs.forEach(function (r) { g.append(h('polyline', { points: b.pts(r), class: cls || 'pl-line pl-line--blue', fill: 'none' })); });
        }
      };
    }
    return { b: b, X: X, Y: Y, Xi: Xi, Yi: Yi, hh: hh, gA: gA, gC: gC, curve: curve, x0: x0, x1: x1, y0: y0, y1: y1 };
  };

  window.PF = PF;
})();
