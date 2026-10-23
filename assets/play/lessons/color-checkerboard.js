/* 獵豹玩中學｜塗色（六）：棋盤染色，證明「不可能」
   預測＋每塊骨牌蓋一黑一白 → 預測＋8×8 缺對角兩格蓋不滿（黑白不一樣多）→ 3 個操作關卡（4×4 拿兩格再蓋滿、8×8 改拿哪兩格、3×3 拿一格）。
   要擊中的迷思：不知道為什麼要把棋盤塗黑白；以為「試很多次都蓋不滿」就是證明。 */
(function () {
  var P = Play, h = P.h;
  var DOM_COLS = ['#ffd8a8', '#a5d8ff', '#b2f2bb', '#fcc2d7', '#ffec99', '#d0bfff', '#99e9f2', '#ffc9c9'];
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function btn(host, t, fn, c) { var b = h('button', { type: 'button' }, t); b.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;font-weight:800;cursor:pointer;border:2px solid ' + (c || '#b9ad92') + ';background:#fff;color:#122548'; b.addEventListener('click', function () { fn(b); }); host.append(b); return b; }
  function row(host) { var r = h('div'); r.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:8px 0'; host.append(r); return r; }

  /* 二分圖配對：把還沒蓋的格子（沒被拿掉）全部用骨牌蓋滿的一種方法；蓋不滿回傳 null */
  function tiling(n, cells) {   /* cells: 要蓋的格子 id 陣列（id＝r*n+c） */
    var set = {}; cells.forEach(function (c) { set[c] = 1; }); var black = cells.filter(function (c) { return (Math.floor(c / n) + c % n) % 2 === 0; }), white = cells.filter(function (c) { return (Math.floor(c / n) + c % n) % 2 === 1; });
    if (black.length !== white.length) return null; var matchW = {};
    function nb(c) { var r = Math.floor(c / n), q = c % n, out = []; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var rr = r + d[0], cc = q + d[1]; if (rr >= 0 && rr < n && cc >= 0 && cc < n && set[rr * n + cc]) out.push(rr * n + cc); }); return out; }
    function aug(b, seen) { var ns = nb(b); for (var i = 0; i < ns.length; i++) { var w = ns[i]; if (seen[w]) continue; seen[w] = 1; if (matchW[w] === undefined || aug(matchW[w], seen)) { matchW[w] = b; return true; } } return false; }
    for (var i = 0; i < black.length; i++) if (!aug(black[i], {})) return null;
    return white.map(function (w) { return [matchW[w], w]; });
  }
  function cellColor(n, id) { return (Math.floor(id / n) + id % n) % 2; }   /* 0＝黑格、1＝白格（左上是黑） */

  /* 棋盤。o: n、removed（初始拿掉的格子）、mode（'tile' 放骨牌／'remove' 拿掉格子）、checker（顯示黑白）、onChange(B)。 */
  function board(host, o) {
    var n = o.n, B = { n: n, removed: {}, doms: [], pend: -1, mode: o.mode || 'tile', checker: o.checker !== false, cells: [] }, gr = h('div'), px = Math.floor(Math.min(300 / n, 54));
    (o.removed || []).forEach(function (c) { B.removed[c] = 1; }); gr.style.cssText = 'display:grid;grid-template-columns:repeat(' + n + ',' + px + 'px);gap:2px;justify-content:center;margin:8px auto;touch-action:manipulation'; host.append(gr);
    function domAt(c) { for (var i = 0; i < B.doms.length; i++) if (B.doms[i][0] === c || B.doms[i][1] === c) return i; return -1; }
    function adj(a, b) { var ra = Math.floor(a / n), ca = a % n, rb = Math.floor(b / n), cb = b % n; return Math.abs(ra - rb) + Math.abs(ca - cb) === 1; }
    for (var i = 0; i < n * n; i++) (function (id) { var c = h('button', { type: 'button' }); c.style.cssText = 'width:' + px + 'px;height:' + px + 'px;border-radius:6px;border:2px solid #122548;cursor:pointer;font-weight:800;color:#122548;padding:0'; c.addEventListener('click', function () { B.tap(id); }); B.cells[id] = c; gr.append(c); })(i);
    B.free = function () { var out = []; for (var i = 0; i < n * n; i++) if (!B.removed[i] && domAt(i) < 0) out.push(i); return out; };
    B.draw = function () {
      for (var i = 0; i < n * n; i++) { var c = B.cells[i], d = domAt(i), col = cellColor(n, i); c.style.visibility = B.removed[i] ? 'hidden' : 'visible'; c.style.background = d >= 0 ? DOM_COLS[d % DOM_COLS.length] : (B.checker ? (col ? '#fff' : '#9aa3b5') : '#efe7d2'); c.style.boxShadow = B.pend === i ? '0 0 0 4px #d29b1f inset' : 'none'; c.textContent = d >= 0 && B.checker ? (col ? '白' : '黑') : ''; c.style.fontSize = Math.floor(px * 0.38) + 'px'; }
      if (o.onChange) o.onChange(B);
    };
    B.tap = function (id) {
      if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; }
      if (B.mode === 'remove') { if (domAt(id) >= 0) { P.toast('這格已經蓋了骨牌，先把骨牌拿起來'); return; } B.removed[id] = B.removed[id] ? 0 : 1; if (!B.removed[id]) delete B.removed[id]; B.pend = -1; B.draw(); return; }
      if (B.removed[id]) return; var d = domAt(id); if (d >= 0) { B.doms.splice(d, 1); B.pend = -1; B.draw(); return; }
      if (B.pend < 0) { B.pend = id; B.draw(); return; } if (B.pend === id) { B.pend = -1; B.draw(); return; }
      if (adj(B.pend, id)) { B.doms.push([B.pend, id]); B.pend = -1; B.draw(); } else { B.pend = id; B.draw(); P.toast('骨牌要蓋在「相鄰」的兩格'); }
    };
    B.setMode = function (m) { B.mode = m; B.pend = -1; B.draw(); };
    B.setChecker = function (v) { B.checker = v; B.draw(); }; B.clearDoms = function () { B.doms = []; B.pend = -1; B.draw(); };
    B.counts = function () { var f = B.free(), k = 0, w = 0; f.forEach(function (c) { if (cellColor(n, c)) w++; else k++; }); return { black: k, white: w, free: f.length }; };
    B.placeAll = function (pairs) { B.doms = pairs.map(function (p) { return [p[0], p[1]]; }); B.pend = -1; B.draw(); }; B.draw(); return B;
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, done = false, B, pC;
      P.choice(st, api, { id: 'cb-p1', predict: true, label: '先猜猜看', prompt: '棋盤是黑白相間的。一塊骨牌蓋住<b>相鄰的兩格</b>，它蓋住的是？', row: true, options: [{ ok: true, t: '一個黑格、一個白格' }, { t: '兩個黑格' }, { t: '要看放在哪裡' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('放骨牌'); } });
      st.append(P.instr('先點一格，再點<b>相鄰</b>的一格，放一塊骨牌（點骨牌可以拿起來）。放<b>至少 6 塊</b>，看每一塊蓋住的黑格、白格。'));
      B = board(st, { n: 6, gate: function () { return gate.on; }, onChange: function (b) { if (!pC) return; var all = b.doms.length, kk = 0, ww = 0; b.doms.forEach(function (d) { d.forEach(function (c) { if (cellColor(6, c)) ww++; else kk++; }); }); pC.textContent = '已放 ' + all + ' 塊骨牌，蓋住 ' + kk + ' 個黑格、' + ww + ' 個白格'; pC.className = 'pl-pill ' + (kk === ww ? 'is-ok' : 'is-pink');
        if (gate.on || done) return; if (all >= 6) { done = true; P.track('aha', { id: 'color-checkerboard', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：一黑一白'); st.append(P.ruleBox('相鄰的兩格<b>顏色一定不同</b>，所以每一塊骨牌<b>一定蓋一個黑格、一個白格</b>。<br>放 d 塊骨牌，就蓋住 d 個黑格、d 個白格：<b>黑白一樣多</b>。', '一黑一白')); api.unlock('每塊骨牌蓋一黑一白'); } } });
      pC = pill(st, 'is-ok'); pC.textContent = '已放 0 塊骨牌'; var r = row(st); btn(r, '全部拿起來', function () { B.clearDoms(); });
      api.solve(function () { gate.on = false; var cells = []; for (var i = 0; i < 36; i++) cells.push(i); B.placeAll(tiling(6, cells).slice(0, 8)); }, false, '一個黑格、一個白格（相鄰兩格顏色一定不同）');
      st.append(P.hint('放幾塊，看「蓋住幾個黑格、幾個白格」。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, done = false, B, pC, pT;
      P.choice(st, api, { id: 'cb-p2', predict: true, label: '先猜猜看', prompt: '8×8 的棋盤，<b>拿掉對角的兩個角</b>（剩 62 格），能用 31 塊骨牌蓋滿嗎？', row: true, options: [{ ok: true, t: '不能' }, { t: '能' }, { t: '不一定' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('試著蓋蓋看'); } });
      st.append(P.instr('左上和右下的角被拿掉了。先<b>放骨牌試試看</b>（放<b>至少 10 塊</b>），再看下面「<b>還沒蓋的格子</b>」的黑白數量，還有「全部格子」的黑白數量。'));
      B = board(st, { n: 8, removed: [0, 63], gate: function () { return gate.on; }, onChange: function (b) { if (!pC) return; var c = b.counts(); pC.textContent = '還沒蓋的格子：黑 ' + c.black + ' 個、白 ' + c.white + ' 個' + (c.black === c.white ? '（一樣多）' : '（不一樣多！每塊骨牌蓋一黑一白，永遠蓋不完）'); pC.className = 'pl-pill ' + (c.black === c.white ? 'is-green' : 'is-pink'); if (gate.on || done) return; if (b.doms.length >= 10) { done = true; P.track('aha', { id: 'color-checkerboard', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：不能'); st.append(P.ruleBox('拿掉的兩個角<b>顏色一樣</b>（都是黑格），剩下<b>黑格 30 個、白格 32 個</b>。每塊骨牌蓋一黑一白，31 塊骨牌要蓋 31 個黑、31 個白，黑格只有 30 個，<b>不可能蓋滿</b>。<br>這就是用<b>染色</b>證明「不可能」：不用一個一個試，只要看黑白數量不一樣多。', '染色證明')); api.unlock('黑白不一樣多，就不可能蓋滿'); } } });
      pC = pill(st, 'is-pink'); pT = pill(st, 'is-blue'); pT.textContent = '全部 62 格：黑 30 個、白 32 個'; var r = row(st); btn(r, '全部拿起來', function () { B.clearDoms(); });
      api.solve(function () { gate.on = false; var pairs = []; for (var r = 1; r <= 4; r++) for (var q = 1; q <= 5; q += 2) pairs.push([r * 8 + q, r * 8 + q + 1]); B.placeAll(pairs); }, false, '不能：拿掉的兩個角同色，剩下黑格 30、白格 32，每塊骨牌蓋一黑一白，黑格不夠');
      st.append(P.hint('不用蓋滿，先看黑白各剩幾個。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function t4(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '4×4 的棋盤。先按「拿掉格子」<b>拿掉任意兩格</b>，再用骨牌把<b>剩下的 14 格全部蓋滿</b>。（拿哪兩格才蓋得滿？）' })); var fin = false, B, pC, mode = { m: 'remove' };
        pC = pill(b0, 'is-blue'); var r = row(b0); var bm = btn(r, '現在：拿掉格子（按一下切換）', function (b) { B.setMode(B.mode === 'remove' ? 'tile' : 'remove'); b.textContent = B.mode === 'remove' ? '現在：拿掉格子（按一下切換）' : '現在：放骨牌（按一下切換）'; }, '#2f6fdc'); btn(r, '全部骨牌拿起來', function () { B.clearDoms(); });
        B = board(b0, { n: 4, mode: 'remove', onChange: function (b) { var c = b.counts(), rem = Object.keys(b.removed).length; pC.textContent = '拿掉 ' + rem + ' 格；還沒蓋的格子：黑 ' + c.black + '、白 ' + c.white + '；骨牌 ' + b.doms.length + ' 塊' + (rem === 2 && c.black !== c.white && b.mode === 'tile' ? '　（黑白不一樣多，蓋不滿）' : ''); if (rem === 2 && c.free === 0 && b.doms.length === 7 && !fin) { fin = true; P.toast('蓋滿了'); b0.append(P.ruleBox('要蓋滿，剩下的格子<b>黑白要一樣多</b>：拿掉的兩格要<b>一黑一白</b>。同色的兩格拿掉，黑白不一樣多，一定蓋不滿。', '蓋滿了')); done(); } } });
        setSolve(function () { B.removed = { 0: 1, 1: 1 }; B.doms = []; var cells = []; for (var i = 0; i < 16; i++) if (!B.removed[i]) cells.push(i); B.placeAll(tiling(4, cells)); }, '拿掉一個黑格和一個白格（例如左上角和它右邊的格子），剩下的 14 格黑白各 7 個，可以蓋滿'); b0.append(P.hint('黑白要一樣多，拿掉的兩格要怎麼選？'));
      }
      function t8(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '8×8 拿掉了對角的兩個角（蓋不滿）。用「拿掉格子」模式：<b>把其中一個角補回來，再拿掉另一個顏色的格子</b>，讓剩下的黑白<b>一樣多</b>。' })); var fin = false, B, pC;
        pC = pill(b0, 'is-pink'); var r = row(b0);
        B = board(b0, { n: 8, removed: [0, 63], mode: 'remove', onChange: function (b) { var c = b.counts(), rem = Object.keys(b.removed).length; pC.textContent = '拿掉 ' + rem + ' 格；剩下的格子：黑 ' + c.black + ' 個、白 ' + c.white + ' 個' + (c.black === c.white ? '：一樣多 ✓' : '：不一樣多'); pC.className = 'pl-pill ' + (c.black === c.white ? 'is-ok' : 'is-pink'); if (c.black === c.white && rem === 2 && !fin) { var cells = b.free(), t = tiling(8, cells); if (t) { fin = true; P.toast('黑白一樣多，真的蓋得滿'); b0.append(P.ruleBox('拿掉的兩格<b>一黑一白</b>，剩下黑白各 31 個。電腦替你找到了一種蓋法（8×8 棋盤拿掉一黑一白，一定蓋得滿）。要蓋滿，黑白一樣多是<b>必要條件</b>。', '找到了')); done(); } } } });
        setSolve(function () { B.removed = { 63: 1, 1: 1 }; B.draw(); }, '把一個角補回來，再拿掉一個「另一種顏色」的格子（例如拿掉 (0, 0) 這個黑格，再拿掉右上旁邊的白格）：黑白各 31 個，可以蓋滿'); b0.append(P.hint('原來拿掉的兩個角同色。換成不同色的兩格。'));
      }
      function t3(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '3×3 的棋盤共 9 格。<b>拿掉一格</b>，再用 4 塊骨牌把<b>剩下 8 格蓋滿</b>。（拿哪一格才行？）' })); var fin = false, B, pC;
        pC = pill(b0, 'is-blue'); var r = row(b0); btn(r, '現在：拿掉格子（按一下切換）', function (b) { B.setMode(B.mode === 'remove' ? 'tile' : 'remove'); b.textContent = B.mode === 'remove' ? '現在：拿掉格子（按一下切換）' : '現在：放骨牌（按一下切換）'; }, '#2f6fdc'); btn(r, '全部骨牌拿起來', function () { B.clearDoms(); });
        B = board(b0, { n: 3, mode: 'remove', onChange: function (b) { var c = b.counts(), rem = Object.keys(b.removed).length; pC.textContent = '拿掉 ' + rem + ' 格；還沒蓋：黑 ' + c.black + '、白 ' + c.white + '；骨牌 ' + b.doms.length + ' 塊'; if (rem === 1 && c.free === 0 && b.doms.length === 4 && !fin) { fin = true; P.toast('蓋滿了'); b0.append(P.ruleBox('3×3 有 5 個黑格、4 個白格（四個角和中間是黑格）。要黑白一樣多，必須拿掉<b>黑格</b>（角或中間）；拿掉白格就是 5 黑 3 白，蓋不滿。', '蓋滿了')); done(); } } });
        setSolve(function () { B.removed = { 4: 1 }; B.doms = []; var cells = []; for (var i = 0; i < 9; i++) if (!B.removed[i]) cells.push(i); B.placeAll(tiling(3, cells)); }, '拿掉一個黑格（四個角或正中間），剩下黑白各 4 個，4 塊骨牌蓋得滿；拿白格（邊的中間）就蓋不滿'); b0.append(P.hint('3×3 的四個角是黑格。黑格和白格各有幾個？'));
      }
      P.taskSeq(box, api, [t4, t8, t3], { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-checkerboard' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-checkerboard', moduleName: '塗色（六）：棋盤染色，證明「不可能」', askAbout: '棋盤染色與骨牌覆蓋',
        aha: '每塊骨牌<b>一定蓋一黑一白</b>，所以黑白<b>不一樣多</b>就<b>不可能</b>蓋滿；黑白一樣多，只是蓋滿的<b>必要條件</b>。',
        cards: [{ text: '染色證明法：把圖形塗成黑白（或更多色），數每種顏色的格數，不符合就不可能', src: '國中競賽：染色問題' }, { text: '8×8 棋盤拿掉一黑一白，一定可以用骨牌蓋滿（Gomory 定理）；拿掉同色兩格就不行', src: '骨牌覆蓋' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '多色染色<br>L 形骨牌' }, { at: 0.85, label: '抽屜原理與不變量' }] },
        teasers: [{ title: '染色問題', q: '為什麼先把圖形染色，就能證明「不可能」？染成黑白以外的顏色還可以做什麼？', where: 'PK2B 2512 第 14 堂（2026 年 4 月）：染色問題', lv: 'L2' }],
        parent: { pitfall: '孩子常以為「試很多次都蓋不滿」就是證明；也不知道為什麼要把棋盤塗黑白。', place: '國中競賽的染色法入門。', ask: ['為什麼每塊骨牌一定蓋一黑一白？', '8×8 缺對角兩格，為什麼蓋不滿？', '黑白一樣多，就一定蓋得滿嗎？'] },
        classes: ['PK2B（2026 年 4 月，第 14 堂）：染色問題'], next: { href: 'play.html', text: '回獵豹玩中學，看其他單元' } });
    }];
  new P.Lesson({ id: 'color-checkerboard', title: '塗色（六）：棋盤染色，證明「不可能」', steps: steps });
})();
