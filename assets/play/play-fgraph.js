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
    var ay = (y0 <= 0 && 0 <= y1) ? Y(0) : 1, ax = (x0 <= 0 && 0 <= x1) ? X(0) : 1, k, ylabs = [], xlabs = [];
    /* 淡淡的格線幫忙讀值；刻度數字放在畫板邊緣（下緣、左緣），不會被把手或曲線旁的文字壓到 */
    for (k = Math.ceil(x0 / tx - 1e-9); k * tx <= x1 + 1e-9; k++) {
      b.line([X(k * tx), Y(y0)], [X(k * tx), Y(y1)], 'pg-minor', gA);
      if (o.xlab !== 0 && !(o.skipX && o.skipX.indexOf(k * tx) >= 0)) xlabs.push({ v: k * tx, el: b.text([X(k * tx), 0.32], PF.fmt(k * tx), 'pl-text pl-text--sm', gA) });
    }
    for (k = Math.ceil(y0 / ty - 1e-9); k * ty <= y1 + 1e-9; k++) {
      b.line([X(x0), Y(k * ty)], [X(x1), Y(k * ty)], 'pg-minor', gA);
      if (o.ylab !== 0 && Math.abs(k * ty - y0) > 1e-9 && !(o.skipY && o.skipY.indexOf(k * ty) >= 0)) ylabs.push({ v: k * ty, el: b.text([0.75, Y(k * ty) - 0.17], PF.fmt(k * ty), 'pl-text pl-text--sm pl-text--r', gA) });
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
    /* 讀值虛線：從曲線上的點拉到座標軸，在畫板邊緣標出精確的數值（左緣＝y 值、下緣＝x 值），不用靠刻度猜。
       set(items)：items 是 [{x, y, cls（pink／green／blue／amber）, ax: 'y'（預設）／'x'／'both'}]；同一個值只標一次（取離軸最遠的點）；
       標籤彼此太近會錯開，和刻度數字衝突的刻度會暫時隱藏。hide() 全部收起。 */
    function guides(o2) {
      o2 = o2 || {}; var max = o2.max || 4;
      function G(isY) {
        var gap = isY ? (o.sm ? 0.78 : 0.62) : (o.sm ? 1.7 : 1.35), pool = [], i, ticks = isY ? ylabs : xlabs;
        for (i = 0; i < max; i++) pool.push({ ln: b.line([0, 0], [0, 0], 'pl-line pl-line--pink pl-line--dash', gA), tx: b.text([0, 0], '', 'pl-text pl-text--sm' + (isY ? ' pl-text--r' : ''), gA) });
        function show(p, on) { p.ln.style.display = on ? '' : 'none'; p.tx.style.display = on ? '' : 'none'; }
        function set(list) {
          var u = [], j;
          list.forEach(function (it) {
            var v = Math.round((isY ? it.y : it.x) * 1000) / 1000;
            for (j = 0; j < u.length; j++) if (Math.abs(u[j].v - v) < 1e-6) { if (isY ? it.x > u[j].o : it.y > u[j].o) u[j].o = isY ? it.x : it.y; return; }
            if (u.length < max) u.push({ v: v, o: isY ? it.x : it.y, cls: it.cls || 'pink' });
          });
          u.sort(function (a2, c) { return a2.v - c.v; });
          var P2 = function (v) { return isY ? Y(v) : X(v); }, pos = u.map(function (e) { return P2(e.v); });
          for (j = 1; j < pos.length; j++) if (pos[j] - pos[j - 1] < gap) pos[j] = pos[j - 1] + gap;
          var over = pos.length ? pos[pos.length - 1] - P2(u[u.length - 1].v) : 0;
          if (over > 0) for (j = 0; j < pos.length; j++) pos[j] -= over / 2;
          pool.forEach(function (p, idx) {
            var e = u[idx]; if (!e) { show(p, false); return; }
            show(p, true);
            if (isY) { b.setLine(p.ln, [X(x0), Y(e.v)], [X(e.o), Y(e.v)]); b.setText(p.tx, [0.75, pos[idx] - 0.17], PF.fmt(e.v)); }
            else { b.setLine(p.ln, [X(e.v), Y(y0)], [X(e.v), Y(e.o)]); b.setText(p.tx, [pos[idx], 0.32], PF.fmt(e.v)); }
            p.ln.setAttribute('class', 'pl-line pl-line--' + e.cls + ' pl-line--dash'); p.tx.setAttribute('class', 'pl-text pl-text--sm' + (isY ? ' pl-text--r' : '') + ' pl-text--' + e.cls);
          });
          ticks.forEach(function (t) { t.el.style.display = u.some(function (e) { return Math.abs(P2(t.v) - P2(e.v)) < gap + (isY ? 0.2 : 0.1); }) ? 'none' : ''; });
        }
        function hide() { pool.forEach(function (p) { show(p, false); }); ticks.forEach(function (t) { t.el.style.display = ''; }); }
        return { set: set, hide: hide };
      }
      var gy = G(true), gx = G(false);
      return {
        set: function (items) {
          gy.set(items.filter(function (it) { return it.ax !== 'x'; }));
          gx.set(items.filter(function (it) { return it.ax === 'x' || it.ax === 'both'; }));
        },
        hide: function () { gy.hide(); gx.hide(); }
      };
    }
    return { b: b, X: X, Y: Y, Xi: Xi, Yi: Yi, hh: hh, gA: gA, gC: gC, curve: curve, guides: guides, x0: x0, x1: x1, y0: y0, y1: y1 };
  };

  window.PF = PF;
})();
