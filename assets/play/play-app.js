/* 獵豹玩中學｜應用問題單元共用小工具（植樹、分數、骰子、一筆畫、時間軸…）
   這些單元都用 P.Board 當畫布，但不需要格線：hideGrid 把格線藏起來，座標單位仍是「一格」、y 向上。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, PA = {};

  PA.stage = function (st, cls) { var w = h('div', { class: 'pl-stage' + (cls ? ' ' + cls : '') }); st.append(w); return w; };
  /* 沒有格線的畫板：w×hh 格，cls 可加 pl-svg--sm */
  PA.board = function (st, w, hh, cls) {
    var host = PA.stage(st, cls && cls.indexOf('sm') >= 0 ? 'pl-stage--sm' : ''), b = new P.Board(host, { w: w, h: hh, cls: cls || '', pad: 0.5 });
    b.gGrid.style.display = 'none'; b.host = host; return b;
  };
  PA.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  PA.gcd = function (a, b) { return b ? PA.gcd(b, a % b) : a; };

  /* 樹的圖示：底部中心在 (x, y)（數學座標），s 是大小倍率 */
  PA.tree = function (board, x, y, s, layer, cls) {
    s = s || 1; var X = x, Y = board.Y(y);
    var g = h('g', { class: 'pa-tree' + (cls ? ' ' + cls : ''), transform: 'translate(' + X + ',' + Y + ') scale(' + s + ')' },
      h('rect', { x: -0.11, y: -0.42, width: 0.22, height: 0.46, class: 'pa-tree__trunk' }), h('circle', { cx: 0, cy: -0.78, r: 0.46, class: 'pa-tree__crown' }));
    (layer || board.gMid).append(g); return g;
  };

  /* 拖放：一個把手平時待在 tray，拖到某個「插槽」放開就算放下（onDrop(i)），然後自己回到 tray。
     o: {tray:[x,y], sockets:[[x,y]…], can(i), onDrop(i), disabled()} ；也可以用 tapSocket(i) 直接點選放下 */
  PA.dropper = function (board, o) {
    var all = [o.tray].concat(o.sockets), hd;
    function idx(p) { for (var i = 0; i < o.sockets.length; i++) if (Math.abs(o.sockets[i][0] - p[0]) < 1e-6 && Math.abs(o.sockets[i][1] - p[1]) < 1e-6) return i; return -1; }
    hd = board.handle({ pos: o.tray, candidates: function () { return all; }, cls: o.cls, disabled: o.disabled,
      onEnd: function (p) { var i = idx(p); if (i >= 0 && (!o.can || o.can(i))) o.onDrop(i); setTimeout(function () { hd.set(o.tray); }, 30); } });
    return hd;
  };

  /* 圓形按鈕（SVG）：點一下呼叫 fn；回傳 g */
  PA.button = function (board, x, y, r, label, fn, cls, layer) {
    var g = h('g', { class: 'pa-btn' + (cls ? ' ' + cls : ''), transform: 'translate(' + x + ',' + board.Y(y) + ')' }, h('circle', { r: Math.max(r, 0.9), fill: 'transparent' }), h('circle', { r: r, class: 'pa-btn__c' }));
    if (label) { var t = h('text', { x: 0, y: 0.18, class: 'pa-btn__t' }); t.textContent = label; g.append(t); }
    g.addEventListener('click', fn); (layer || board.gTop).append(g); return g;
  };
  /* 重來／清除這種文字按鈕 */
  PA.resetBtn = function (host, text, fn) {
    var b = h('button', { type: 'button', class: 'button button--secondary pl-small' }, text || '重來'); b.addEventListener('click', fn);
    var row = h('div', { class: 'pl-row pl-row--center' }, b); host.append(row); return b;
  };
  window.PA = PA;
})();
