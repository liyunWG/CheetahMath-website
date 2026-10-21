/* 獵豹玩中學｜排列組合共用元件（樹形圖、選項盒子、已找到清單、測驗序列） */
(function () {
  'use strict';
  var P = window.Play, h = P.h, NS = 'http://www.w3.org/2000/svg';
  var PC = {};

  PC.fact = function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; };
  PC.perm = function (n, k) { var r = 1; for (var i = 0; i < k; i++) r *= (n - i); return r; };
  PC.comb = function (n, k) { return PC.perm(n, k) / PC.fact(k); };
  PC.stage = function (st, cls) { var w = h('div', { class: 'pl-stage' + (cls ? ' ' + cls : '') }); st.append(w); return w; };
  PC.chip = function (t, cls) { return h('span', { class: 'pc-chip ' + (cls || '') }, t); };
  PC.svg = function (host, w, hh, cls) { var s = h('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'pl-svg ' + (cls || ''), preserveAspectRatio: 'xMidYMid meet' }); host.append(s); return s; };
  PC.sv = function (tag, attrs, txt) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (txt !== undefined) e.textContent = txt; return e; };
  PC.text = function (x, y, t, size, cls) { return PC.sv('text', { x: x, y: y, class: 'pm-t ' + (cls || ''), 'font-size': size || 14 }, t); };
  PC.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /* 選項盒子：[{n,label}] → 「3 × 2 × 1 ＝ 6」 */
  PC.boxes = function (host, items, o) {
    o = o || {}; var wrap = h('div', { class: 'pc-boxes' }); host.append(wrap);
    function draw(its, res) {
      wrap.innerHTML = '';
      its.forEach(function (it, i) { if (i) wrap.append(h('span', { class: 'pc-op' }, o.op || '×')); wrap.append(h('span', { class: 'pc-box' + (it.cls ? ' ' + it.cls : '') }, h('b', {}, String(it.n)), it.label ? h('i', {}, it.label) : null)); });
      if (res !== false) { var v = res === undefined ? its.reduce(function (a, b) { return a * b.n; }, 1) : res; wrap.append(h('span', { class: 'pc-op' }, '＝'), h('span', { class: 'pc-res' }, String(v))); }
    }
    draw(items, o.result); return { el: wrap, set: draw };
  };

  /* 已找到清單：add(key, 文字) 回傳是否為新 */
  PC.found = function (host, o) {
    o = o || {}; var seen = {}, n = 0, pill = P.pill('', 'is-green'), list = h('div', { class: 'pc-found' }), wrap = h('div', { class: 'pc-foundwrap' }, pill, list); host.append(wrap);
    function upd() { pill.textContent = (o.label || '已找到') + ' ' + n + (o.total ? ' / ' + o.total : '') + ' 種'; pill.className = 'pl-pill is-green' + (o.total && n >= o.total ? ' is-ok' : ''); }
    upd();
    return { el: wrap, get count() { return n; }, has: function (k) { return !!seen[k]; },
      add: function (k, t) { if (seen[k]) return false; seen[k] = 1; n++; var c = PC.chip(t === undefined ? k : t); list.append(c); P.pop(c); list.scrollTop = list.scrollHeight; upd(); return true; },
      reset: function () { seen = {}; n = 0; list.innerHTML = ''; upd(); } };
  };

  /* 可點開的樹（SVG）。cfg: {host,width,rowH,names,colors,end(seq)->bool,start(seq 字串),maxDepth,rootLabel,onChange} */
  PC.tree = function (host, cfg) {
    var W = cfg.width || 320, names = cfg.names, colors = cfg.colors || ['blue', 'pink'], start = cfg.start || '', rowH = cfg.rowH || 25, nodes = {}, order = [];
    function build(seq, depth) {
      var nd = { seq: seq, depth: depth, kids: [], ended: seq.length > 0 && cfg.end(seq) }; nodes[seq] = nd; order.push(nd);
      if (!nd.ended) names.forEach(function (c) { nd.kids.push(build(seq + c, depth + 1)); });
      return nd;
    }
    var root = build(start, 0), leaf = 0, maxD = 0;
    (function lay(nd) { if (!nd.kids.length) { nd.row = leaf++; } else { nd.kids.forEach(lay); nd.row = (nd.kids[0].row + nd.kids[nd.kids.length - 1].row) / 2; } maxD = Math.max(maxD, nd.depth); })(root);
    var H = 24 + (leaf - 1) * rowH + 24, svg = PC.svg(host, W, H, cfg.cls || ''), g = PC.sv('g', {}); svg.append(g);
    var dx = (W - 70) / Math.max(1, maxD), open = {}, shown = {}; shown[root.seq] = 1;
    function X(nd) { return 30 + nd.depth * dx; } function Y(nd) { return 24 + nd.row * rowH; }
    function visible(nd) { return nd === root || (shown[nd.seq]); }
    function draw(fresh) {
      g.innerHTML = ''; var ended = 0, pending = 0, vis = order.filter(visible);
      vis.forEach(function (nd) { nd.kids.forEach(function (k) { if (visible(k)) g.append(PC.sv('line', { x1: X(nd), y1: Y(nd), x2: X(k), y2: Y(k), class: 'pl-line pl-line--soft' })); }); });
      vis.forEach(function (nd) {
        var isRoot = nd === root, last = nd.seq.charAt(nd.seq.length - 1), ci = names.indexOf(last), col = isRoot && !start ? 'navy' : colors[Math.max(0, ci)];
        var can = !nd.ended && !open[nd.seq] && nd.kids.length;
        if (nd.ended) ended++; else if (can) pending++;
        var gr = PC.sv('g', { class: 'pc-node' + (can ? ' is-pending' : '') + (nd.ended ? ' is-end' : ''), transform: 'translate(' + X(nd) + ',' + Y(nd) + ')' });
        if (can) gr.append(PC.sv('circle', { r: 16, fill: 'transparent' }));
        gr.append(PC.sv('circle', { r: 10, class: 'pc-c pc-c--' + col }), PC.text(0, 1, isRoot && !start ? (cfg.rootLabel || '開始') : last, isRoot && !start ? 9 : 11.5, 'pc-tw'));
        if (nd.ended) gr.append(PC.sv('circle', { r: 12.5, class: 'pc-endring' }));
        if (can) gr.addEventListener('click', function () { if (cfg.locked && cfg.locked()) { P.toast('先做上面的預測'); return; } expand(nd.seq); });
        g.append(gr);
        if (fresh && fresh[nd.seq]) { gr.firstChild.style && 0; gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'center'; P.pop(gr, 0.2); }
      });
      if (cfg.onChange) cfg.onChange({ ended: ended, pending: pending, leaves: leaf });
    }
    function expand(seq) {
      var nd = nodes[seq]; if (!nd || open[seq] || nd.ended) return; open[seq] = 1; var fresh = {};
      nd.kids.forEach(function (k) { shown[k.seq] = 1; fresh[k.seq] = 1; }); draw(fresh);
    }
    function expandAll() { order.forEach(function (nd) { if (visible(nd) && !nd.ended) { open[nd.seq] = 1; nd.kids.forEach(function (k) { shown[k.seq] = 1; }); } }); order.forEach(function (nd) { if (visible(nd) && !nd.ended && !open[nd.seq]) expandAll(); }); draw(); }
    draw();
    return { svg: svg, expand: expand, expandAll: function () { for (var i = 0; i < 8; i++) order.forEach(function (nd) { if (visible(nd) && !nd.ended && !open[nd.seq]) { open[nd.seq] = 1; nd.kids.forEach(function (k) { shown[k.seq] = 1; }); } }); draw(); }, leaves: leaf, root: root };
  };

  /* 測驗序列：qs = [function(box, done){…}]，每題答對呼叫 done()；全部完成才解鎖 */
  PC.quiz = function (st, api, id, qs) {
    var box = h('div', {}), k = 0; st.append(box);
    function show() { box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + (k + 1) + ' / ' + qs.length + ' 題')); qs[k](box, done); }
    function done() { if (k >= qs.length - 1) { api.unlock('全部完成！'); P.track('transfer_ok', { id: id }); return; } setTimeout(function () { k++; show(); }, 900); }
    api.lock('完成 ' + qs.length + ' 題'); show();
  };
  PC.num = function (box, html, answer, done, okMsg, wrong) {
    box.append(h('div', { class: 'pl-q', html: html }));
    P.numBox(box, { answer: answer, okMsg: okMsg, onOk: done, wrong: wrong });
  };
  /* 點擊切換的按鈕列：items=[{t,id}] */
  PC.tabs = function (host, items, onPick, first) {
    var row = h('div', { class: 'pc-tabs' }), btns = items.map(function (it, i) { var b = h('button', { type: 'button', class: 'pc-tab' }, it.t); b.addEventListener('click', function () { pick(i); }); row.append(b); return b; });
    function pick(i) { btns.forEach(function (b, k) { b.classList.toggle('is-on', k === i); }); onPick(i, items[i]); }
    host.append(row); if (first !== null) pick(first || 0); return { el: row, pick: pick };
  };
  window.PC = PC;
})();
