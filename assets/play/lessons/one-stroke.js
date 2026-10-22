/* 獵豹玩中學｜一筆畫與奇點
   預測＋用筆一筆畫 → 換起點試試看 → 拿掉一條線修好圖 → 3 個操作關卡（梯形圖、七橋拆一座、星形加一條線）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA;
  var TRAY = [10.4, 0.6];

  /* 圖：V={id:[x,y]}（數學座標）、E=[[a,b]…]。筆（把手）一次走一條「還沒走過」的線；
     cfg: {showDeg, remove(能不能點線拿掉), maxRemove, add(點兩個點加一條線), maxAdd, disabled(), onChange(g), onFinish(g), onStuck(g)} */
  function makeGraph(board, cfg) {
    var gE = h('g'), gV = h('g'), V = cfg.V, E = [], path = [], cur = null, finished = false, sel = null, seen = {}, hd, self = {};
    board.gMid.append(gE, gV);
    cfg.E.forEach(function (e) { E.push({ a: e[0], b: e[1], removed: false, used: false, added: false }); });
    function idxAll() { E.forEach(function (e, i) { e.i = i; }); var grp = {}; E.forEach(function (e) { var k = [e.a, e.b].sort().join('-'); (grp[k] = grp[k] || []).push(e); }); Object.keys(grp).forEach(function (k) { grp[k].forEach(function (e, j) { e.off = grp[k].length > 1 ? (j - (grp[k].length - 1) / 2) * 1.5 : 0; }); }); }
    function active() { return E.filter(function (e) { return !e.removed; }); }
    function deg(v) { var n = 0; active().forEach(function (e) { if (e.a === v) n++; if (e.b === v) n++; }); return n; }
    function odd() { return Object.keys(V).filter(function (v) { return deg(v) % 2 === 1; }); }
    function note() { if (cfg.onChange) cfg.onChange(self); }
    function dpath(e) {
      var a = V[e.a], b = V[e.b], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      return 'M ' + a[0] + ' ' + board.Y(a[1]) + ' Q ' + (mx + nx * e.off) + ' ' + board.Y(my + ny * e.off) + ' ' + b[0] + ' ' + board.Y(b[1]);
    }
    function render() {
      idxAll(); gE.innerHTML = ''; gV.innerHTML = '';
      E.forEach(function (e) {
        /* 顏色與粗細直接寫在屬性上（不依賴樣式表）：還沒走＝深褐色、走過＝粗綠色、拆掉＝淡色虛線 */
        gE.append(h('path', { d: dpath(e), fill: 'none', 'stroke-linecap': 'round', stroke: e.removed ? '#cbbf9f' : e.used ? '#1f9d55' : '#5a4f3c', 'stroke-width': e.removed ? 2 : e.used ? 6.5 : 4, 'stroke-dasharray': e.removed ? '5 5' : null, class: 'pa-edge' + (e.removed ? ' is-off' : e.used ? ' is-used' : '') }));
        if (cfg.remove && !e.added) { var ht = h('path', { d: dpath(e), class: 'pa-hit' }); ht.addEventListener('click', function () { toggleRemove(e); }); gE.append(ht); }
      });
      /* 拆橋按鈕：每條可以拆的線中間有一顆粉紅色 ✕（拆掉後變成綠色 ＋，可以還原）；開始走之後就不能改了 */
      if (cfg.remove && !path.length) E.forEach(function (e) {
        if (e.added) return; var a = V[e.a], b = V[e.b], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, mx = (a[0] + b[0]) / 2 - dy / L * e.off * 0.5, my = (a[1] + b[1]) / 2 + dx / L * e.off * 0.5, cy = board.Y(my), col = e.removed ? '#1f9d55' : '#d6336c', r = 0.42, k = 0.17;
        var bt = h('g', { style: 'cursor:pointer' }, h('circle', { cx: mx, cy: cy, r: 0.75, fill: 'transparent' }), h('circle', { cx: mx, cy: cy, r: r, fill: '#fff', stroke: col, 'stroke-width': 2.5 }),
          e.removed ? [h('line', { x1: mx - k, y1: cy, x2: mx + k, y2: cy, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' }), h('line', { x1: mx, y1: cy - k, x2: mx, y2: cy + k, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' })]
            : [h('line', { x1: mx - k, y1: cy - k, x2: mx + k, y2: cy + k, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' }), h('line', { x1: mx - k, y1: cy + k, x2: mx + k, y2: cy - k, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' })]);
        bt.addEventListener('click', function () { toggleRemove(e); }); gE.append(bt);
      });
      Object.keys(V).forEach(function (v) {
        var p = V[v], g = h('g', { style: 'cursor:pointer' }, h('circle', { cx: p[0], cy: board.Y(p[1]), r: 0.5, fill: 'transparent' }), h('circle', { cx: p[0], cy: board.Y(p[1]), r: 0.4, fill: sel === v ? '#5fe3b4' : seen[v] ? '#c9efd7' : (cfg.showDeg && deg(v) % 2 === 1 ? '#ffe8f0' : '#fff'), stroke: seen[v] || sel === v ? '#1f9d55' : (cfg.showDeg && deg(v) % 2 === 1 ? '#d6336c' : '#122548'), 'stroke-width': seen[v] ? 3.5 : 2.5, class: 'pa-node' }));
        g.addEventListener('click', function () { tapVertex(v); }); gV.append(g);
        board.text([p[0], p[1] - 1.5], v, 'pl-text pl-text--sm pl-text--blue', gV);
        if (cfg.showDeg) { var d = deg(v), bx = p[0] + 0.62, by = p[1] + 0.55; gV.append(h('circle', { cx: bx, cy: board.Y(by), r: 0.3, fill: d % 2 ? '#ffe8f0' : '#e6f6ec', stroke: d % 2 ? '#d6336c' : '#1f9d55', 'stroke-width': 1.5 })); board.text([bx, by - 0.17], '' + d, 'pl-text pl-text--sm' + (d % 2 ? ' pl-text--pink' : ' pl-text--green'), gV); }
      });
    }
    function toggleRemove(e) {
      if (path.length) { P.toast('先按「重來」，再修改圖形'); return; }
      if (!e.removed && cfg.maxRemove !== undefined && E.filter(function (x) { return x.removed; }).length >= cfg.maxRemove) { P.toast('這一關只能拿掉 ' + cfg.maxRemove + ' 條線'); return; }
      e.removed = !e.removed; render(); note();
    }
    function tapVertex(v) {
      if (cfg.add) {
        if (path.length) { P.toast('先按「重來」，再修改圖形'); return; }
        if (sel === null) { sel = v; render(); note(); return; }
        if (sel === v) { sel = null; render(); note(); return; }
        var ex = E.filter(function (e) { return e.added && ((e.a === sel && e.b === v) || (e.a === v && e.b === sel)); })[0];
        if (ex) E.splice(E.indexOf(ex), 1);
        else { if (cfg.maxAdd !== undefined && E.filter(function (e) { return e.added; }).length >= cfg.maxAdd) { P.toast('這一關只能加 ' + cfg.maxAdd + ' 條線；再點一次已加的線兩端可以拿掉'); sel = null; render(); return; } E.push({ a: sel, b: v, removed: false, used: false, added: true }); }
        sel = null; render(); note(); return;
      }
      if (cfg.disabled && cfg.disabled()) { P.toast('先做上面的預測'); return; }
      hd.moveTo(V[v]);
    }
    function vertexAt(t) { var ks = Object.keys(V); for (var i = 0; i < ks.length; i++) if (Math.abs(V[ks[i]][0] - t[0]) < 1e-6 && Math.abs(V[ks[i]][1] - t[1]) < 1e-6) return ks[i]; return null; }
    function check() {
      if (!active().every(function (e) { return e.used; })) { var left = active().filter(function (e) { return !e.used && (e.a === cur || e.b === cur); }); if (!left.length && cfg.onStuck) cfg.onStuck(self); return; }
      finished = true; if (cfg.onFinish) cfg.onFinish(self);
    }
    function go(t) {
      var v = vertexAt(t); if (v === null || finished) return;
      if (cur === null) { if (!active().length) return; cur = v; path = [v]; seen[v] = 1; render(); note(); check(); return; }
      if (v === cur) return;
      var e = active().filter(function (x) { return !x.used && ((x.a === cur && x.b === v) || (x.a === v && x.b === cur)); })[0];
      if (!e) { P.toast('要沿著還沒走過的線走'); hd.set(V[cur]); return; }
      e.used = true; path.push(v); cur = v; seen[v] = 1; render(); note(); check();
    }
    var cands = Object.keys(V).map(function (k) { return V[k]; }).concat([TRAY]);
    hd = board.handle({ pos: TRAY, candidates: cands, disabled: function () { if (cfg.disabled && cfg.disabled()) { P.toast('先做上面的預測'); return true; } return false; }, onMove: function (t) { if (cur !== null) go(t); }, onEnd: function (p) { if (cur === null) { if (vertexAt(p) !== null) go(p); else hd.set(TRAY); } else if (!finished) hd.set(V[cur]); } });
    self.sel = function () { return sel; }; self.pen = hd; self.V = V; self.E = E; self.deg = deg; self.odd = odd; self.path = function () { return path; }; self.finished = function () { return finished; }; self.removedCount = function () { return E.filter(function (e) { return e.removed; }).length; };
    self.addedCount = function () { return E.filter(function (e) { return e.added; }).length; }; self.used = function () { return E.filter(function (e) { return e.used; }).length; }; self.total = function () { return active().length; };
    self.reset = function () { E.forEach(function (e) { e.used = false; }); path = []; cur = null; finished = false; sel = null; seen = {}; hd.set(TRAY, true); render(); note(); };
    /* 歐拉路徑（Hierholzer）：圖能一筆畫就回傳頂點順序，否則 null；from 指定起點（要是奇點才行） */
    self.euler = function (from) {
      var act = active(); if (!act.length) return null; var od = odd(); if (od.length !== 0 && od.length !== 2) return null;
      var start = from && (od.length === 0 || od.indexOf(from) >= 0) ? from : (od.length ? od[0] : act[0].a), adj = {}, used = {}, stack = [start], res = [];
      act.forEach(function (e) { (adj[e.a] = adj[e.a] || []).push(e); (adj[e.b] = adj[e.b] || []).push(e); });
      while (stack.length) { var v = stack[stack.length - 1], l = adj[v] || []; while (l.length && used[l[l.length - 1].i]) l.pop(); if (!l.length) res.push(stack.pop()); else { var e = l.pop(); used[e.i] = 1; stack.push(e.a === v ? e.b : e.a); } }
      return res.length === act.length + 1 ? res.reverse() : null;
    };
    self.walk = function (seq) { seq.forEach(function (v) { hd.moveTo(V[v]); }); };
    render(); note(); return self;
  }

  var ENV = { V: { A: [2, 1.8], B: [8.5, 1.8], C: [8.5, 6], D: [2, 6], E: [5.25, 8.8] }, E: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['D', 'E'], ['E', 'C'], ['A', 'C'], ['B', 'D']] };

  var steps = [
    /* 1. 預測＋一筆畫 */
    function (st, api) {
      var gate = { on: true }, done = false, g;
      P.choice(st, api, { id: 'os-p1', predict: true, label: '先猜猜看', prompt: '筆<b>不離開紙</b>、每條線<b>只走一次</b>（點可以重複經過），這個圖能一筆畫完嗎？', row: true, options: [{ t: '能' }, { t: '不能' }, { t: '不確定' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把綠色的筆拖到一個點出發'); } });
      var b = PA.board(st, 11, 10), pU = P.pill('', 'is-blue'), pS = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pU, pS));
      g = makeGraph(b, Object.assign({ disabled: function () { return gate.on; }, showDeg: false, onChange: function (gg) { pU.textContent = '走過 ' + gg.used() + ' / ' + gg.total() + ' 條線'; if (!gg.finished()) { pS.className = 'pl-pill'; pS.textContent = gg.path().length ? '從 ' + gg.path()[0] + ' 出發，繼續走…' : '把筆拖到任一個點出發'; } },
        onFinish: function (gg) { var p = gg.path(); pS.className = 'pl-pill is-ok'; pS.textContent = '✓ 一筆畫完：' + p[0] + ' 出發，' + p[p.length - 1] + ' 結束'; if (!done) { done = true; P.track('aha', { id: 'one-stroke', step: 1 }); P.toast(api.ctx.p1 === 0 ? '你猜對了！能一筆畫' : '一筆畫成功！'); st.append(P.hint('你是從哪一個點出發、在哪一個點結束的？下一步來找原因。')); api.unlock('一筆畫成功！'); } },
        onStuck: function (gg) { pS.className = 'pl-pill is-pink'; pS.textContent = '卡住了：這個點的線都走過了。按「重來」再試試'; } }, ENV));
      PA.resetBtn(st, '重來', function () { if (!done || true) g.reset(); });
      api.solve(function () { gate.on = false; g.reset(); g.walk(g.euler()); });
      st.append(P.hint('<b>綠色圓點是「筆」</b>：先把它拖到一個點出發，再沿著線拖到下一個點（也可以直接點圖上的點）。走過的線會變成粗綠線、走過的點會變淺綠色。<b>每條線只能走一次，點可以重複經過。</b>')); api.lock('先做上面的預測');
    },
    /* 2. 換不同的起點 */
    function (st, api) {
      st.append(P.instr('同一個圖，<b>換不同的點出發</b>試試看（先拖綠色的筆到一個點，再沿著線走；每條線只能走一次）。哪些點出發能一筆畫完？哪些會卡住？旁邊的小圓圈是這個點連著幾條線。'));
      var tries = {}, done = false, b = PA.board(st, 11, 10), chips = h('div', { class: 'pl-readout' }), pS = P.pill('', ''), g;
      st.append(chips, h('div', { class: 'pl-readout' }, pS));
      function ruleCheck() { var ok = tries.A === 'ok' && tries.B === 'ok' && ['C', 'D', 'E'].some(function (v) { return tries[v] === 'x'; }); if (ok && !done) { done = true; P.track('aha', { id: 'one-stroke', step: 2 }); st.append(P.ruleBox('能一筆畫完的圖，起點和終點只能是「連著<b>奇數條</b>線的點」（<b>奇點</b>，粉紅色的點）。<br>從「偶點」出發，不管怎麼走都會卡住。', '奇點')); api.unlock('起點要是奇點！'); } }
      function chipDraw() { chips.innerHTML = ''; Object.keys(ENV.V).forEach(function (v) { var s = tries[v]; chips.append(P.pill(v + '：' + (s === 'ok' ? '✓ 畫完了' : s === 'x' ? '✗ 卡住' : '？'), s === 'ok' ? 'is-ok' : s === 'x' ? 'is-pink' : '')); }); }
      g = makeGraph(b, Object.assign({ showDeg: true, onChange: function (gg) { if (!gg.finished() && !gg.path().length) { pS.className = 'pl-pill'; pS.textContent = '選一個點出發'; } },
        onFinish: function (gg) { tries[gg.path()[0]] = 'ok'; pS.className = 'pl-pill is-ok'; pS.textContent = '✓ 從 ' + gg.path()[0] + ' 出發，一筆畫完'; chipDraw(); ruleCheck(); },
        onStuck: function (gg) { var s = gg.path()[0]; if (tries[s] !== 'ok') tries[s] = 'x'; pS.className = 'pl-pill is-pink'; pS.textContent = '卡住了！從 ' + s + ' 出發這次沒畫完'; chipDraw(); ruleCheck(); } }, ENV));
      PA.resetBtn(st, '重來', function () { g.reset(); });
      api.solve(function () { g.reset(); g.walk(g.euler('A')); g.reset(); g.walk(g.euler('B')); g.reset(); g.pen.moveTo(ENV.V.C); g.pen.moveTo(ENV.V.B); g.pen.moveTo(ENV.V.A); g.pen.moveTo(ENV.V.D); g.pen.moveTo(ENV.V.C); g.pen.moveTo(ENV.V.E); g.pen.moveTo(ENV.V.D); if (!g.finished()) { tries.C = 'x'; chipDraw(); ruleCheck(); } });
      chipDraw(); st.append(P.hint('A、B 兩個點要各成功一次，還要找到至少一個「出發就會卡住」的點。')); api.lock('A、B 都畫成功，再找一個卡住的起點');
    },
    /* 3. 拿掉一條線，修好圖 */
    function (st, api) {
      st.append(P.instr('這個圖<b>四個點都連著 3 條線</b>，沒辦法一筆畫。<b>① 點線中間的粉紅色 ✕ 把一條線拿掉　② 再把綠色的筆拖到粉紅色的點出發</b>，沿著線一筆畫完（每條線只能走一次）。'));
      var done = false, b = PA.board(st, 11, 10), pO = P.pill('', 'is-pink'), pS = P.pill('', ''), g;
      var K4 = { V: { P: [3, 2.5], Q: [8, 2.5], R: [8, 8], S: [3, 8] }, E: [['P', 'Q'], ['Q', 'R'], ['R', 'S'], ['S', 'P'], ['P', 'R'], ['Q', 'S']] };
      g = makeGraph(b, Object.assign({ showDeg: true, remove: true, onChange: function (gg) { var o = gg.odd().length; pO.textContent = '奇點 ' + o + ' 個'; pO.className = 'pl-pill ' + (o === 0 || o === 2 ? 'is-ok' : 'is-pink'); if (!gg.finished()) { pS.className = 'pl-pill'; pS.textContent = (o === 0 || o === 2) ? '奇點只有 ' + o + ' 個，可以一筆畫了！' : '奇點太多（4 個）：先點粉紅色 ✕ 拿掉一條線'; } },
        onFinish: function (gg) { pS.className = 'pl-pill is-ok'; pS.textContent = '✓ 一筆畫完！'; if (!done && gg.removedCount() >= 1) { done = true; P.track('aha', { id: 'one-stroke', step: 3 }); st.append(P.ruleBox('拿掉一條線，那條線兩端的點各少一條，<b>從奇點變成偶點</b>，奇點就只剩 2 個。<br>只要奇點是 <b>0 個或 2 個</b>，而且圖連在一起，就能一筆畫。', '奇點個數')); api.unlock('奇點 0 或 2 個，就能一筆畫！'); } },
        onStuck: function () { pS.className = 'pl-pill is-pink'; pS.textContent = '卡住了，按「重來」再試試（起點要選奇點）'; } }, K4));
      st.insertBefore(h('div', { class: 'pl-readout' }, pO, pS), b.host.nextSibling); PA.resetBtn(st, '重來', function () { g.reset(); });
      api.solve(function () { g.reset(); var e = g.E[0]; if (!e.removed) { e.removed = true; } g.reset(); g.walk(g.euler()); });
      st.append(P.hint('拿掉的線會變成淡色虛線，可以點綠色 ＋ 還原。')); api.lock('拿掉一條線，再一筆畫完');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function graphTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }), h('div', { class: 'pl-caption', html: '綠色圓點是「筆」：拖到一個點出發，再沿著線走。<b>每條線（橋）只能走一次，點可以重複經過。</b>' }));
          var b = PA.board(b0, 11, 10), pO = P.pill('', 'is-pink'), pS = P.pill('', ''), fin = false, g;
          b0.append(h('div', { class: 'pl-readout' }, pO, pS));
          g = makeGraph(b, Object.assign({ showDeg: true, onChange: function (gg) { var o = gg.odd().length; pO.textContent = '奇點 ' + o + ' 個'; pO.className = 'pl-pill ' + (o === 0 || o === 2 ? 'is-ok' : 'is-pink'); if (!gg.finished()) { pS.className = 'pl-pill'; pS.textContent = cfg.say ? cfg.say(gg) : (gg.path().length ? '走過 ' + gg.used() + ' / ' + gg.total() + ' 條線' : '把綠色的筆拖到一個點出發'); } },
            onFinish: function (gg) { pS.className = 'pl-pill is-ok'; pS.textContent = '✓ 一筆畫完！'; if (!fin && (!cfg.need || cfg.need(gg))) { fin = true; P.toast(cfg.msg); done(); } else if (!fin) { pS.className = 'pl-pill is-pink'; pS.textContent = cfg.needMsg; } },
            onStuck: function () { pS.className = 'pl-pill is-pink'; pS.textContent = '卡住了，按「重來」再試試'; } }, cfg.graph));
          PA.resetBtn(b0, '重來', function () { if (!fin) g.reset(); });
          setSolve(function () { if (cfg.prep) cfg.prep(g); g.reset(); g.walk(g.euler()); }); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        graphTask({ prompt: '這個梯形圖能一筆畫嗎？找出該從哪裡出發，一筆畫完。', graph: { V: { a: [2, 7], b: [5.5, 7], c: [9, 7], d: [2, 3.5], e: [5.5, 3.5], f: [9, 3.5] }, E: [['a', 'b'], ['b', 'c'], ['d', 'e'], ['e', 'f'], ['a', 'd'], ['b', 'e'], ['c', 'f']] }, msg: '從奇點出發，一筆畫完', hint: '先看哪些點是奇點（粉紅色）。' }),
        graphTask({ prompt: '哥尼斯堡有 <b>7 座橋</b>（4 塊陸地 A～D）。沒有人能每座橋只走一次。<b>只拆掉 1 座橋</b>，就能走完了。<br><b>① 先點橋中間的粉紅色 ✕ 拆掉 1 座橋　② 再把筆拖到一塊陸地出發，沿著橋走，每座橋只走一次。</b>', graph: { V: { A: [3.5, 5], B: [5.5, 8.5], C: [5.5, 1.8], D: [9, 5] }, E: [['A', 'B'], ['A', 'B'], ['A', 'C'], ['A', 'C'], ['A', 'D'], ['B', 'D'], ['C', 'D']], remove: true, maxRemove: 1 }, need: function (gg) { return gg.removedCount() === 1; }, needMsg: '要先拆掉 1 座橋', msg: '拆掉 1 座橋，奇點剩 2 個', hint: '要讓奇點只剩 2 個，要拆哪一座橋？拆掉的橋會變成淡色虛線，可以點綠色 ＋ 還原。', say: function (gg) { return gg.removedCount() === 0 ? '① 先點粉紅色 ✕ 拆掉 1 座橋' : gg.path().length ? '拆了 1 座橋，走過 ' + gg.used() + ' / ' + gg.total() + ' 座橋' : '② 把綠色的筆拖到一塊陸地出發'; }, prep: function (g) { var e = g.E[0]; e.removed = true; } }),
        graphTask({ prompt: '星形圖有 <b>4 個奇點</b>。只加 <b>1 條線</b>，就能一筆畫完。<br><b>① 先點一個點、再點另一個點，在它們之間加 1 條線　② 再把綠色的筆拖到一個點出發，一筆畫完。</b>', graph: { V: { O: [5.5, 5], P: [2.2, 8.5], Q: [8.8, 8.5], R: [5.5, 1.8] }, E: [['O', 'P'], ['O', 'Q'], ['O', 'R']], add: true, maxAdd: 1 }, need: function (gg) { return gg.addedCount() === 1; }, needMsg: '要先加上 1 條線', msg: '加 1 條線，4 個奇點變成 2 個', hint: '加一條線，會讓哪兩個點的條數同時加 1？加好後，把筆拖到粉紅色的點出發。', say: function (gg) { return gg.addedCount() ? (gg.path().length ? '已加 1 條線，走過 ' + gg.used() + ' / ' + gg.total() + ' 條線' : '② 把綠色的筆拖到一個點出發') : (gg.sel() ? '已選 ' + gg.sel() + '，再點另一個點，加上一條線' : '① 先點一個點，再點另一個點，加一條線'); }, prep: function (g) { g.E.push({ a: 'P', b: 'Q', removed: false, used: false, added: true }); } })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'one-stroke' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'one-stroke', moduleName: '一筆畫與奇點', askAbout: '一筆畫與圖論的入門', aha: '進去和出來一定成對，<br>所以一筆畫的圖，奇點只能有 0 個或 2 個。',
        cards: [{ text: '連著奇數條線的點叫奇點；能一筆畫的圖，奇點有 0 個（起點＝終點）或 2 個（從一個奇點出發、到另一個奇點結束）', src: '小學「一筆畫問題」' }, { text: '拿掉或加上一條線，會讓兩個點的條數同時加減 1', src: '歐拉七橋問題' }],
        depth: { here: 0.15, cheetah: [{ at: 0.45, label: '七橋問題<br>圖形的性質' }, { at: 0.85, label: '歐拉公式<br>圖論與組合' }] },
        teasers: [
          { title: '七橋問題的故事', q: '哥尼斯堡的七座橋為什麼不可能一次走完？歐拉怎麼把地圖變成「點與線」？', where: 'PK3D 2512 第 19 堂：七橋問題', lv: 'L2' },
          { title: '歐拉公式', q: '一個多面體（或平面圖）的頂點、邊、面的個數之間，居然有固定的關係，是什麼？', where: 'PI2A 2507 習題課第 4 堂：小數乘法與歐拉公式', lv: 'L3' },
          { title: '一筆畫與路線設計', q: '一個街區的每條路都要走一次又回到原點，路線要怎麼設計才最省？', where: 'PI1A 2507 第 1 堂：一筆畫問題', lv: 'L2' }],
        parent: { pitfall: '孩子常靠亂試，試不出來就放棄，不知道可以「先數點再決定」。也容易以為「只要線多就畫不完」，其實關鍵是奇點的個數。', place: '小學到國中的圖論入門，也是「先觀察規律、再證明」的好例子。', ask: ['一個點連著 4 條線，筆走進來、再走出去，會剩下幾條？', '為什麼奇點一定是成對出現的？', '這個圖如果有 4 個奇點，要拿掉幾條線才能一筆畫？'] },
        classes: ['PI1A（2507 第 1 堂）：一筆畫問題', 'PK3D（2512 第 19 堂）：七橋問題', 'PI2A（2507 習題課第 4 堂）：歐拉公式'], next: { href: 'play-perp-bisector.html', text: '下一個：垂直平分線與外心' } });
    }];
  new P.Lesson({ id: 'one-stroke', title: '一筆畫與奇點', steps: steps });
})();
