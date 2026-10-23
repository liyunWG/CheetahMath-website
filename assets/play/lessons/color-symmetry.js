/* 獵豹玩中學｜塗色（五）：對稱與等價，旋轉翻轉算一種
   預測＋2×2 方格塗黑白、旋轉後重疊的算同一種，共幾種（不是 16÷4）→ 預測＋項鍊旋轉與翻轉 → 3 個操作關卡（轉一圈還是自己、轉半圈才回來、翻轉才相同）。
   要擊中的迷思：一律「除以 4」；旋轉後重疊的圖重複計算；以為翻轉一定會讓種類變少。 */
(function () {
  var P = Play, h = P.h, NS = 'http://www.w3.org/2000/svg';
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function steppr(host, label, min, max, val, fn) { var sn = P.stepper(label, min, max, val, fn, function (v) { return v; }); host.append(h('div', { class: 'pl-steprow' }, sn.el)); return sn; }
  function btn(host, t, fn, c) { var b = h('button', { type: 'button' }, t); b.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;font-weight:800;cursor:pointer;border:2px solid ' + (c || '#b9ad92') + ';background:#fff;color:#122548'; b.addEventListener('click', function () { fn(b); }); host.append(b); return b; }
  var CB = '#122548', CW = '#fff', COLS = ['#e8590c', '#2f6fdc', '#1f9d55', '#d6336c', '#d29b1f', '#7a4fd6', '#0ca5a0'];

  /* ───────── 圖樣與對稱 ───────── */
  /* 圖樣＝0/1 陣列（沿著圈順時針）。旋轉＝循環位移；翻轉＝反過來。回傳這個圖樣的「同一種」集合（字串 key 的陣列）。 */
  function key(b) { return b.join(''); }
  function rots(b) { var out = [], n = b.length, i; for (i = 0; i < n; i++) out.push(b.slice(i).concat(b.slice(0, i))); return out; }
  function orbit(b, flip) { var s = {}; rots(b).forEach(function (r) { s[key(r)] = r; }); if (flip) rots(b.slice().reverse()).forEach(function (r) { s[key(r)] = r; }); return Object.keys(s); }
  function all(n) { var out = [], i, j; for (i = 0; i < (1 << n); i++) { var b = []; for (j = n - 1; j >= 0; j--) b.push((i >> j) & 1); out.push(b); } return out; }
  function groups(n, flip) { var seen = {}, g = 0; all(n).forEach(function (b) { if (seen[key(b)]) return; g++; orbit(b, flip).forEach(function (k) { seen[k] = 1; }); }); return g; }

  /* 圖樣的小圖：mode 'grid'（2×2 方格，順時針 左上、右上、右下、左下）或 'ring'（一圈珠子） */
  function svgEl(tag, a) { var e = document.createElementNS(NS, tag); Object.keys(a || {}).forEach(function (k) { e.setAttribute(k, a[k]); }); return e; }
  function cardSvg(b, mode, size) {
    var s = svgEl('svg', { viewBox: '0 0 40 40', width: size, height: size }), n = b.length;
    if (mode === 'grid') { var pos = [[2, 2], [21, 2], [21, 21], [2, 21]]; b.forEach(function (v, i) { s.append(svgEl('rect', { x: pos[i][0], y: pos[i][1], width: 17, height: 17, fill: v ? CB : CW, stroke: CB, 'stroke-width': 2 })); }); }
    else { s.append(svgEl('circle', { cx: 20, cy: 20, r: 15, fill: 'none', stroke: '#d9cfb4', 'stroke-width': 1.5 })); var r = n <= 5 ? 5 : 4.3; b.forEach(function (v, i) { var t = -Math.PI / 2 + 2 * Math.PI * i / n; s.append(svgEl('circle', { cx: 20 + 15 * Math.cos(t), cy: 20 + 15 * Math.sin(t), r: r, fill: v ? CB : CW, stroke: CB, 'stroke-width': 1.6 })); }); }
    return s;
  }
  /* 圖樣牆。o: n、mode、flip、select（'orbit'：點一個，圈出「同一種」；'pick'：點選多個）、onPick(key, B)、onOrbit(b, B)
     B: {cards, setFlip, covered, groupsMade, sel, el} */
  function board(host, o) {
    var B = { n: o.n, mode: o.mode, flip: !!o.flip, cards: {}, covered: {}, made: 0, sel: {}, tapped: [] }, wrap = h('div'), strip = h('div'), grid = h('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0'; strip.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;min-height:56px;margin:6px 0;padding:6px;border-radius:12px;background:#fff7e0'; wrap.append(strip, grid); host.append(wrap);
    all(o.n).forEach(function (b) { var c = h('button', { type: 'button' }); c.style.cssText = 'padding:3px;border-radius:10px;border:3px solid #e6dcc0;background:#fff;cursor:pointer;line-height:0'; c.append(cardSvg(b, o.mode, o.mode === 'grid' ? 56 : 44)); c.addEventListener('click', function () { B.tap(b); }); B.cards[key(b)] = { b: b, el: c }; grid.append(c); });
    B.paint = function (hot) { Object.keys(B.cards).forEach(function (k) { var c = B.cards[k].el; c.style.borderColor = hot && hot[k] ? '#d29b1f' : B.sel[k] ? '#d6336c' : B.covered[k] ? '#9fd4b2' : '#e6dcc0'; c.style.background = hot && hot[k] ? '#fff3cd' : B.sel[k] ? '#ffe3ec' : B.covered[k] ? '#eaf7ee' : '#fff'; c.style.opacity = B.covered[k] && !(hot && hot[k]) && !B.sel[k] ? '.65' : '1'; }); };
    B.tap = function (b) {
      if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; } var k = key(b), orb = orbit(b, B.flip), hot = {}; orb.forEach(function (x) { hot[x] = 1; });
      if (o.select === 'pick') { if (B.sel[k]) delete B.sel[k]; else B.sel[k] = 1; B.paint(null); if (o.onPick) o.onPick(k, B); return; }
      if (!B.covered[k]) { B.made++; orb.forEach(function (x) { B.covered[x] = 1; }); }
      B.paint(hot); strip.innerHTML = ''; var lab = h('span', {}, '轉一轉會變成：'); lab.style.cssText = 'font-weight:800;color:#8a6410;font-size:14px'; strip.append(lab); orb.forEach(function (x) { var d = h('span'); d.style.cssText = 'line-height:0;padding:2px;border-radius:8px;background:#fff;border:2px solid #d29b1f'; d.append(cardSvg(B.cards[x].b, o.mode, 40)); strip.append(d); });
      var t = h('span', {}, '共 ' + orb.length + ' 種樣子'); t.style.cssText = 'font-weight:800;color:#122548;font-size:14px;margin-left:6px'; strip.append(t); if (o.onOrbit) o.onOrbit(b, orb, B);
    };
    B.reset = function () { B.covered = {}; B.made = 0; B.sel = {}; strip.innerHTML = ''; B.paint(null); };
    B.setFlip = function (f) { B.flip = !!f; B.reset(); };
    B.total = function () { return Object.keys(B.cards).length; }; B.coveredCount = function () { return Object.keys(B.covered).length; };
    B.paint(null); B.el = wrap; return B;
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, done = false, B, pG, pS;
      P.choice(st, api, { id: 'cs-p1', predict: true, label: '先猜猜看', prompt: '2×2 的方格，每格塗<b>黑或白</b>，共 16 種塗法。<b>轉一轉會重疊</b>的算同一種，一共有幾種？', row: true, options: [{ t: '4 種（16 ÷ 4）' }, { ok: true, t: '6 種' }, { t: '8 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('分堆'); } });
      st.append(P.instr('下面是 16 種圖樣。<b>點一個圖樣</b>：上面會顯示它<b>轉一轉</b>會變成哪幾種樣子，這些圖樣會被圈起來，算<b>同一堆</b>。一直點<b>還沒被圈到</b>的圖樣，直到全部都分好堆。'));
      B = board(st, { n: 4, mode: 'grid', gate: function () { return gate.on; }, onOrbit: function (b, orb, BB) { pG.textContent = '已分成 ' + BB.made + ' 堆；已分好 ' + BB.coveredCount() + ' / ' + BB.total() + ' 個圖樣'; if (BB.coveredCount() === BB.total() && !done) { done = true; P.track('aha', { id: 'color-symmetry', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：6 種'); st.append(P.ruleBox('一共分成 <b>6</b> 堆，不是 16 ÷ 4 ＝ 4。<br>因為有的圖樣<b>轉一轉</b>還是自己或只有 2 種樣子：全黑、全白（<b>1</b> 種樣子，各自一堆）；對角塗黑（<b>2</b> 種樣子）；其餘每堆 <b>4</b> 種樣子。<b>1 ＋ 1 ＋ 2 ＋ 4 ＋ 4 ＋ 4 ＝ 16</b>。不能直接除以 4。', '同一種')); api.unlock('分成 6 堆：不能直接除以 4'); } } });
      pG = pill(st, 'is-green'); pG.textContent = '已分成 0 堆'; btn(st, '重來', function () { B.reset(); pG.textContent = '已分成 0 堆'; });
      api.solve(function () { gate.on = false; B.reset(); var seq = [[0, 0, 0, 0], [1, 1, 1, 1], [1, 0, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0], [1, 1, 1, 0]]; seq.forEach(function (b) { B.tap(b); }); }, false, '6 種（全白、全黑、1 塊黑、2 塊黑相鄰、2 塊黑在對角、3 塊黑）；不是 16 ÷ 4');
      st.append(P.hint('全黑和全白轉一轉有幾種樣子？對角塗黑呢？')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, n = 6, flip = false, B, holder = h('div'), pA, pB, sn, tg;
      P.choice(st, api, { id: 'cs-p2', predict: true, label: '先猜猜看', prompt: '6 顆珠子串成項鍊（黑或白）。除了旋轉，<b>翻過來</b>看也算同一種，種類會比只算旋轉<b>少</b>嗎？', row: true, options: [{ ok: true, t: '少 1 種' }, { t: '一樣多' }, { t: '少很多' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('調整珠子數、切換翻轉'); } });
      st.append(P.instr('每個圖樣是一條項鍊。調整<b>珠子數 n</b>；按「<b>翻轉也算同一種</b>」，看「同一堆」會不會變大。下面直接算出兩種算法各有幾種。'));
      sn = steppr(st, '珠子數 n', 4, 6, 6, function (v) { n = v; build(); });
      tg = btn(st, '翻轉也算同一種：關', function (b) { if (gate.on) { P.toast('先做上面的預測'); return; } flip = !flip; b.textContent = '翻轉也算同一種：' + (flip ? '開' : '關'); B.setFlip(flip); upd(); }, '#2f6fdc'); st.append(holder); pA = pill(st, 'is-blue'); pB = pill(st, 'is-green');
      function upd() { var r = groups(n, false), f = groups(n, true); pA.textContent = n + ' 顆珠子：只算旋轉 ' + r + ' 種；旋轉加翻轉 ' + f + ' 種' + (r === f ? '（一樣多）' : '（少 ' + (r - f) + ' 種）'); pB.textContent = flip ? '現在是「旋轉加翻轉」：點一個圖樣，看它變成幾種樣子' : '現在是「只算旋轉」：點一個圖樣，看它變成幾種樣子'; if (gate.on) return; seen[n + (flip ? 'f' : 'r')] = 1; if (seen['6f'] && seen['6r'] && !done) { done = true; P.track('aha', { id: 'color-symmetry', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：少 1 種'); st.append(P.ruleBox('n ＝ 6：只算旋轉 14 種，旋轉加翻轉 13 種。<b>少 1 種</b>：有一對項鍊<b>互為鏡像</b>，轉怎麼轉都轉不成對方，翻過來才一樣。<br>n ＝ 4、5 時，翻轉<b>沒有</b>讓種類變少（每一條都已經和自己的鏡像是同一堆）。所以「翻轉算同一種」不一定會變少。', '翻轉')); api.unlock('翻轉不一定讓種類變少'); } }
      function build() { holder.innerHTML = ''; B = board(holder, { n: n, mode: 'ring', flip: flip, gate: function () { return gate.on; } }); upd(); }
      build();
      api.solve(function () { gate.on = false; sn.set(6, true); n = 6; flip = false; build(); flip = true; B.setFlip(true); tg.textContent = '翻轉也算同一種：開'; upd(); flip = false; B.setFlip(false); tg.textContent = '翻轉也算同一種：關'; upd(); }, false, '少 1 種：6 顆珠子只算旋轉 14 種，旋轉加翻轉 13 種（有一對鏡像項鍊轉不成對方）');
      st.append(P.hint('n 調到 6，開關「翻轉」兩種都看一次。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function pickTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var fin = false, p = pill(b0, 'is-blue'), B;
          B = board(b0, { n: cfg.n, mode: cfg.mode, flip: false, select: 'pick', onPick: function () { upd(); } });
          function upd() { var ks = Object.keys(B.sel), res = cfg.ok(ks.map(function (k) { return k.split('').map(Number); })); p.textContent = cfg.info(ks.length); p.className = 'pl-pill ' + (res ? 'is-ok' : 'is-blue'); if (res && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } }
          upd(); setSolve(function () { B.sel = {}; cfg.ans.forEach(function (b) { B.sel[key(b)] = 1; }); B.paint(null); upd(); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var sameSet = function (list, want) { var a = list.map(key).sort().join('|'), b = want.map(key).sort().join('|'); return a === b; };
      var ONE = [[0, 0, 0, 0], [1, 1, 1, 1]], TWO = [[1, 0, 1, 0], [0, 1, 0, 1]];
      var tasks = [
        pickTask({ prompt: '2×2 方格。<b>點選所有「轉一轉還是自己」的圖樣</b>（轉 90°、180°、270° 都和原來一模一樣）。', n: 4, mode: 'grid', ok: function (l) { return sameSet(l, ONE); }, info: function (c) { return '已選 ' + c + ' 個（這種圖樣有 2 個）'; }, ans: ONE, answer: '全白和全黑（轉一轉只有 1 種樣子，所以各自是一堆）', msg: '全白、全黑', rule: '轉一轉樣子都不變的圖樣，只有每格同色的兩個：全白、全黑。它們各自就是一堆（1 種樣子）。', hint: '轉了還是一模一樣，圖樣要有什麼特別？' }),
        pickTask({ prompt: '2×2 方格。<b>點選所有「轉 180° 才回到自己、轉 90° 不行」的圖樣</b>（轉一轉只有 2 種樣子）。', n: 4, mode: 'grid', ok: function (l) { return sameSet(l, TWO); }, info: function (c) { return '已選 ' + c + ' 個（這種圖樣有 2 個）'; }, ans: TWO, answer: '對角塗黑的兩個圖樣（轉一轉只有 2 種樣子，這兩個是同一堆）', msg: '對角塗黑', rule: '對角塗黑的圖樣，轉 90° 變成另一個對角，轉 180° 才回到自己：只有 2 種樣子，所以 2 個圖樣是同一堆。', hint: '轉 90° 之後會變成另一個，轉 180° 才回來的是誰？' }),
        pickTask({ prompt: '6 顆珠子的項鍊。<b>點選兩條項鍊</b>：它們<b>翻過來才一樣</b>，但<b>怎麼轉都轉不成對方</b>。', n: 6, mode: 'ring', ok: function (l) { if (l.length !== 2) return false; var a = l[0], b = l[1], rotSame = orbit(a, false).indexOf(key(b)) >= 0, flipSame = orbit(a, true).indexOf(key(b)) >= 0; return flipSame && !rotSame; }, info: function (c) { return '已選 ' + c + ' 條（要剛好選 2 條）'; }, ans: [[0, 0, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1]], answer: '例如 001011 和 001101（黑珠子 = 1）：它們互為鏡像，轉不成對方，翻過來才一樣', msg: '互為鏡像、轉不成對方', rule: '6 顆珠子裡，只有一對項鍊（001011 和 001101 這兩堆）互為鏡像又轉不成對方，所以「旋轉加翻轉」比「只算旋轉」少 1 種（14 → 13）。', hint: '先找一條不對稱的項鍊，再把它反過來排，看看轉不轉得成。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-symmetry' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-symmetry', moduleName: '塗色（五）：對稱與等價，旋轉翻轉算一種', askAbout: '旋轉與翻轉算同一種的塗色計數',
        aha: '「轉一轉算同一種」不能一律除以 4：有的圖樣<b>轉一轉只有 1 或 2 種樣子</b>；「翻轉也算同一種」<b>不一定</b>會讓種類變少（6 顆珠子 14 → 13）。',
        cards: [{ text: '同一堆的圖樣：轉一轉（或翻轉）會變成彼此；每堆的圖樣數是 1、2 或 4（轉 90° 的情形）', src: '國中資優：等價類' }, { text: '2×2 黑白：旋轉 6 種；6 顆珠子 2 色：旋轉 14 種、旋轉加翻轉 13 種', src: '項鍊與對稱' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: 'Burnside 引理<br>群的作用' }, { at: 0.85, label: 'Pólya 計數定理' }] },
        teasers: [{ title: 'Burnside 引理', q: '不用一個一個分堆，怎麼用「每種轉法讓幾個圖樣不變」直接算出堆數？', where: '進階（尚未對照班級堂次）', lv: 'L3' }],
        parent: { pitfall: '孩子常一律把總數除以 4；旋轉後重疊的圖重複計算；以為翻轉一定會讓種類變少。', place: '國中資優與競賽的對稱計數，用「分堆」建立等價類的概念。', ask: ['轉一轉算同一種，為什麼不能直接除以 4？', '2×2 黑白塗色，旋轉後有幾種不一樣的？', '什麼情形翻轉才會讓種類變少？'] },
        classes: [], next: { href: 'play-color-checkerboard.html', text: '下一個：塗色（六），棋盤染色' } });
    }];
  new P.Lesson({ id: 'color-symmetry', title: '塗色（五）：對稱與等價，旋轉翻轉算一種', steps: steps });
})();
