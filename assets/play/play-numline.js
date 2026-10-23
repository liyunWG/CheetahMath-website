/* 獵豹玩中學｜數線小工具（絕對值、不等式、區間等單元共用）
   在 PA.board 的畫板上畫一條數線：數值 v ↔ 畫板座標 X(v)。需要先載入 play-app.js。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, PN = {};

  /* 數字轉字串（負號用 −，半格用 .5） */
  PN.fmt = function (v) { return (v < 0 ? '−' : '') + Math.abs(Math.round(v * 1000) / 1000); };

  /* 畫數線：o = {vmin, vmax, y, x0, x1, step, labelGap, labelEvery}。回傳 {X(v), V(x), g}；刻度數字在數線下方。 */
  PN.axis = function (board, o) {
    var y = o.y, vmin = o.vmin, vmax = o.vmax, x0 = o.x0 === undefined ? 1 : o.x0, x1 = o.x1 === undefined ? 11 : o.x1, step = o.step || 1;
    var g = h('g'); board.gMid.append(g);
    function X(v) { return x0 + (v - vmin) * (x1 - x0) / (vmax - vmin); }
    function V(x) { return vmin + (x - x0) * (vmax - vmin) / (x1 - x0); }
    board.line([x0 - 0.5, y], [x1 + 0.5, y], 'pl-line', g);
    for (var v = vmin; v <= vmax + 1e-9; v += step) {
      board.line([X(v), y - 0.14], [X(v), y + 0.14], 'pl-line pl-line--thin', g);
      if (Math.abs(v - Math.round(v)) < 1e-9 && Math.round(v) % (o.labelEvery || 1) === 0) board.text([X(v), y - (o.labelGap || 0.95)], PN.fmt(v), 'pl-text pl-text--sm', g);
    }
    return { X: X, V: V, g: g };
  };

  window.PN = PN;
})();
