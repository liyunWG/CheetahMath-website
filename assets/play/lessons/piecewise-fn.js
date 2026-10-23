/* 獵豹玩中學｜函數與區間（二）：分段函數
   預測＋拖 x 看「先看 x 在哪一段，再用那一段的公式」→ 調 c 讓兩段接起來（空心點與實心點的差別）→ 3 個操作關卡
   （f(x)＝1 的 x、f(x)＝4 的 x、把 |x−2| 寫成分段函數找 f(x)＝1）。
   要擊中的迷思：代值前沒先判斷 x 在哪一段、交界點的空心點與實心點、「跳」與「接得起來」。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  /* f(x) ＝ x＋1（x＜0）；x²（0≤x≤2）；4（x＞2） */
  function F(x) { return x < 0 ? x + 1 : x <= 2 ? x * x : 4; }
  function pieceOf(x) { return x < 0 ? 0 : x <= 2 ? 1 : 2; }
  var ROWS = ['x ＜ 0：f(x) ＝ x ＋ 1', '0 ≤ x ≤ 2：f(x) ＝ x²', 'x ＞ 2：f(x) ＝ 4'];
  function plane(host, o, sm) { return PF.plane(host, Object.assign({ hh: 8, tx: 1, ty: 1, sm: sm }, o)); }
  function circ(pl, x, y, closed, layer) { var c = h('circle', { cx: pl.X(x), cy: pl.b.Y(pl.Y(y)), r: 0.24, fill: closed ? '#2f6fdc' : '#fff', stroke: '#2f6fdc', 'stroke-width': 0.13 }); (layer || pl.gC).append(c); return c; }
  function wrap(p) { p.style.whiteSpace = 'normal'; return p; }

  /* 畫面：分段函數圖＋拖動的 x（在下緣一排，往上連到曲線上的點）。
     o: pieces（每段 {fn, dom, label}）、fnAll(x)、plane、xs（x 能停的位置）、rows（顯示哪幾個公式）、start、gate、sm、onChange(x, y)、onSettle(x, y)。 */
  function scene(host, o) {
    var pl = plane(host, o.plane, o.sm), b = pl.b, xv = o.start, RYH = o.plane.y0 + 1.1, cs = o.pieces.map(function (p) { var c = pl.curve('pl-line pl-line--blue'); c.set(p.fn, p.dom); return c; });
    (o.marks || []).forEach(function (m) { circ(pl, m[0], m[1], m[2]); });
    var drop = b.line([pl.X(xv), pl.Y(RYH)], [pl.X(xv), pl.Y(o.fnAll(xv))], 'pl-line pl-line--soft', pl.gA), dot = b.dot([pl.X(xv), pl.Y(o.fnAll(xv))], 'pl-dot pl-dot--pink', pl.gA, 0.2), tX = b.text([pl.X(xv) + 0.7, pl.Y(RYH)], 'x', 'pl-text pl-text--blue', pl.gA);
    var pF = P.pill('', 'is-amber'); host.append(h('div', { class: 'pl-readout' }, pF));
    var rows = o.pieces.map(function (p, i) { var q = wrap(P.pill(p.label, ['is-pink', 'is-amber', 'is-green'][i % 3])), r = h('div', { class: 'pl-readout' }, q); host.append(r); return q; });
    function upd() {
      var y = o.fnAll(xv); b.setLine(drop, [pl.X(xv), pl.Y(RYH)], [pl.X(xv), pl.Y(y)]); dot.setAttribute('cx', pl.X(xv)); dot.setAttribute('cy', b.Y(pl.Y(y))); b.setText(tX, [pl.X(xv) + 0.7, pl.Y(RYH)], 'x');
      var pi = o.pieceOf(xv); rows.forEach(function (q, i) { q.style.opacity = i === pi ? 1 : 0.35; });
      var ok = o.target !== undefined && Math.abs(y - o.target) < 1e-9; pF.textContent = 'x ＝ ' + f(xv) + ' → 用第 ' + (pi + 1) + ' 段 → f(x) ＝ ' + f(y); pF.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-amber');
      if (o.onChange) o.onChange(xv, y);
    }
    var hd = pl.b.handle({ pos: [pl.X(xv), pl.Y(RYH)], candidates: o.xs.map(function (v) { return [pl.X(v), pl.Y(RYH)]; }), disabled: function () { return !!(o.gate && o.gate.on); },
      onMove: function (t) { xv = Math.round(pl.Xi(t[0]) * 2) / 2; upd(); }, onEnd: function (t) { xv = Math.round(pl.Xi(t[0]) * 2) / 2; upd(); if (o.onSettle) o.onSettle(xv, o.fnAll(xv), pl); } });
    upd();
    return { pl: pl, setX: function (v) { hd.moveTo([pl.X(v), pl.Y(RYH)]); } };
  }
  function xsRange(a, z) { var r = []; for (var x = a; x <= z + 1e-9; x += 0.5) r.push(x); return r; }
  var P1 = { x0: -3.5, x1: 4.5, y0: -3, y1: 6, ty: 2 };

  var steps = [
    /* 1. 預測＋拖 x */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, s;
      P.choice(st, api, { id: 'pw-p1', predict: true, label: '先猜猜看', prompt: '<b>f(x) ＝ x ＋ 1</b>（x ＜ 0）；<b>x²</b>（0 ≤ x ≤ 2）；<b>4</b>（x ＞ 2）。<br><b>f(0)</b> 等於多少？', row: true, options: [{ t: '1' }, { ok: true, t: '0' }, { t: '都可以' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 x 到三段各看看'); } });
      st.append(P.instr('拖動 <b>x</b>（最下面那排）。上面的粉紅點是 <b>(x, f(x))</b>。看看 x 在哪一段，就用那一段的公式。'));
      s = scene(st, { plane: P1, pieces: [{ fn: function (x) { return x + 1; }, dom: [-3.5, 0], label: ROWS[0] }, { fn: function (x) { return x * x; }, dom: [0, 2], label: ROWS[1] }, { fn: function () { return 4; }, dom: [2, 4.5], label: ROWS[2] }],
        fnAll: F, pieceOf: pieceOf, xs: xsRange(-3, 4), start: 3, marks: [[0, 1, false], [0, 0, true], [2, 4, true]], gate: gate, onChange: function (x) {
          if (gate.on) return; seen[pieceOf(x)] = 1; if (x === 0) seen.zero = 1;
          if (seen[0] && seen[1] && seen[2] && seen.zero && !done) {
            done = true; P.track('aha', { id: 'piecewise-fn', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：f(0) ＝ 0');
            st.append(P.ruleBox('代值之前，<b>先看 x 在哪一段</b>，再用那一段的公式。<br>x ＝ 0 屬於<b>第 2 段</b>（0 ≤ x），所以 f(0) ＝ 0² ＝ <b>0</b>；(0, 1) 是<b>空心點</b>，第 1 段只是靠近它，取不到。<br>x ＝ 2 時第 2 段是 4，第 3 段也是 4，兩段<b>接得起來</b>。', '先判斷在哪一段'));
            api.unlock('先判斷 x 在哪一段');
          }
        } });
      api.solve(function () { gate.on = false; s.setX(-2); s.setX(1); s.setX(0); s.setX(3); });
      st.append(P.hint('x 拖到 0 的時候特別看看：實心點和空心點，f(0) 是哪一個？')); api.lock('先做上面的預測');
    },
    /* 2. 兩段接不接得起來 */
    function (st, api) {
      var seen = {}, done = false, c = 1, pl = PF.plane(st, { x0: -3.5, x1: 4.5, y0: -3, y1: 6, hh: 8, tx: 1, ty: 2 }), b = pl.b, c1 = pl.curve('pl-line pl-line--blue'), c2 = pl.curve('pl-line pl-line--blue'), c3 = pl.curve('pl-line pl-line--blue');
      st.insertBefore(P.instr('左邊那一段改成 <b>x ＋ c</b>。拉動滑桿改變 <b>c</b>，看左段的空心點什麼時候和右段的實心點<b>接在一起</b>。'), st.firstChild);
      var hole = h('circle', { r: 0.24, fill: '#fff', stroke: '#2f6fdc', 'stroke-width': 0.13 }), solid = circ(pl, 0, 0, true); pl.gC.append(hole);
      c2.set(function (x) { return x * x; }, [0, 2]); c3.set(function () { return 4; }, [2, 4.5]); circ(pl, 2, 4, true);
      var pC = P.pill('', 'is-amber'), pJ = P.pill('', 'is-pink'); st.append(h('div', { class: 'pl-readout' }, pC, pJ));
      function upd() {
        c1.set(function (x) { return x + c; }, [-3.5, 0]); hole.setAttribute('cx', pl.X(0)); hole.setAttribute('cy', b.Y(pl.Y(c)));
        var join = c === 0; pC.textContent = '左段：x ＋ ' + (c < 0 ? '(' + f(c) + ')' : f(c)) + '，靠近 x ＝ 0 時趨近 ' + f(c); pJ.textContent = join ? '空心點落在實心點上：接得起來 ✓' : '空心點在 (0, ' + f(c) + ')，實心點在 (0, 0)：中間「跳」了 ' + f(Math.abs(c)); pJ.className = 'pl-pill ' + (join ? 'is-ok' : 'is-pink');
        if (!join) seen.jump = 1; if (join) seen.join = 1;
        if (seen.jump && seen.join && !done) {
          done = true; P.track('aha', { id: 'piecewise-fn', step: 2 });
          st.append(P.ruleBox('<b>c ＝ 0</b> 時，左段靠近的值（0）和右段 f(0) ＝ 0 一樣，圖形<b>接得起來</b>，一筆畫得完。<br>c 不是 0，兩段在 x ＝ 0 就會<b>跳</b>一格，空心點和實心點上下錯開。', '接得起來'));
          api.unlock('值一樣才接得起來');
        }
      }
      var sl = P.slider(-2, 2, 1, function (v) { c = v; upd(); }, 1);
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← c ＝ −2'), h('span', {}, 'c ＝ 2 →')));
      api.solve(function () { sl.value = 1; c = 1; upd(); sl.value = 0; c = 0; upd(); });
      upd(); st.append(P.hint('c 拉到讓兩個點上下錯開、再拉到剛好碰在一起。')); api.lock('找出兩段接得起來的 c');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, goal(y)（符合條件的 y）, need（要找幾個不同的 x）, 場景設定, sols（看詳解用）, msg, rule, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var found = {}, n = 0, fin = false, pN = P.pill('找到 0 / ' + cfg.need, 'is-blue'), s;
          s = scene(b0, Object.assign({ sm: true, target: cfg.goalY, onSettle: function (x, y, pl) {
            if (Math.abs(y - cfg.goalY) < 1e-9 && !found[x]) { found[x] = 1; n++; pN.textContent = '找到 ' + n + ' / ' + cfg.need; pl.b.goalMark([pl.X(x), pl.Y(pl.y0 + 1.1)]); P.toast('找到了：x ＝ ' + f(x) + (n < cfg.need ? '，還有別的' : '')); if (n === cfg.need && !fin) { fin = true; b0.append(P.ruleBox(cfg.rule, '分段函數')); done(); } }
          } }, cfg.scene));
          b0.append(h('div', { class: 'pl-readout' }, pN)); setSolve(function () { cfg.sols.forEach(function (v) { s.setX(v); }); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var scene1 = { plane: P1, pieces: [{ fn: function (x) { return x + 1; }, dom: [-3.5, 0], label: ROWS[0] }, { fn: function (x) { return x * x; }, dom: [0, 2], label: ROWS[1] }, { fn: function () { return 4; }, dom: [2, 4.5], label: ROWS[2] }], fnAll: F, pieceOf: pieceOf, xs: xsRange(-3, 4), start: 3, marks: [[0, 1, false], [0, 0, true], [2, 4, true]] };
      function A(x) { return Math.abs(x - 2); }
      var scene3 = { plane: { x0: -1.5, x1: 5.5, y0: -2, y1: 5, ty: 1 }, pieces: [{ fn: function (x) { return 2 - x; }, dom: [-1.5, 2], label: 'x ＜ 2：f(x) ＝ 2 − x' }, { fn: function (x) { return x - 2; }, dom: [2, 5.5], label: 'x ≥ 2：f(x) ＝ x − 2' }], fnAll: A, pieceOf: function (x) { return x < 2 ? 0 : 1; }, xs: xsRange(-1, 5), start: 5, marks: [[2, 0, true]] };
      var tasks = [
        task({ prompt: '拖動 <b>x</b>，找出讓 <b>f(x) ＝ 1</b> 的 x。（想想看有幾個）', goalY: 1, need: 1, scene: scene1, sols: [1], ans: 'x ＝ 1（只有這一個；f(0) ＝ 0，不是 1）', msg: 'f(1) ＝ 1² ＝ 1', rule: '只有 <b>x ＝ 1</b>。第 1 段的 x ＋ 1 ＝ 1 要 x ＝ 0，可是 0 不在第 1 段（x ＜ 0），所以那是<b>空心點</b>，取不到；f(0) 其實是 0。', hint: '每一段各算一次，算出來的 x 還要在那一段的範圍裡。' }),
        task({ prompt: '找出讓 <b>f(x) ＝ 4</b> 的 x，要找 <b>3 個不同的位置</b>。', goalY: 4, need: 3, scene: scene1, sols: [2, 2.5, 3], ans: 'x ≥ 2 的每一個 x（例如 x ＝ 2、2.5、3），有無限多個', msg: 'f(x) ＝ 4', rule: '第 2 段在 x ＝ 2 時是 4，第 3 段整段都是 4（x ＞ 2）。所以 <b>x ≥ 2</b> 都是答案，有<b>無限多個</b>。', hint: '平平的那一段，每個 x 的 f(x) 是多少？' }),
        task({ prompt: '<b>f(x) ＝ |x − 2|</b> 可以寫成兩段（和絕對值那一課一樣）。拖動 <b>x</b>，找出讓 <b>f(x) ＝ 1</b> 的<b>兩個</b> x。', goalY: 1, need: 2, scene: scene3, sols: [1, 3], ans: 'x ＝ 1 和 x ＝ 3', msg: 'f(1) ＝ 1，f(3) ＝ 1', rule: '|x − 2| ＝ 1：左段 2 − x ＝ 1 得 x ＝ 1，右段 x − 2 ＝ 1 得 x ＝ 3。兩段各一個，都在自己的範圍裡。', hint: '到 2 的距離是 1 的位置有幾個？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'piecewise-fn' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'piecewise-fn', moduleName: '函數與區間：分段函數', askAbout: '分段函數與連續', aha: '分段函數要<b>先看 x 在哪一段</b>，再用那一段的公式。<br>交界點的<b>實心點</b>屬於它那一段，<b>空心點</b>取不到；兩段的值一樣才接得起來。',
        cards: [{ text: '分段函數：每一段有自己的公式與範圍，代值前先判斷 x 屬於哪一段', src: '高中：分段函數' }, { text: '|x − a| ＝ x − a（x ≥ a）；a − x（x ＜ a）：絕對值函數是分段函數', src: '高中：絕對值函數' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '連續與不連續<br>取整數函數' }, { at: 0.85, label: '分段函數的最大最小值<br>反函數' }] },
        teasers: [{ title: '分段函數的最大最小值', q: '分段函數在每一段取最大最小，整體的最大最小值怎麼比？', where: 'S101 2507 第 23 堂：多項式函數（最大最小值與分段）', lv: 'L3' }, { title: '用分段函數處理絕對值', q: '|x − 1| ＋ |x − 4| 畫成分段函數，圖形長什麼樣？', where: 'S101 2507 第 5 堂：數與式（絕對值）', lv: 'L2' }],
        parent: { pitfall: '孩子常常不先判斷 x 在哪一段就直接代公式；也常把交界點的空心點、實心點用反，或以為所有分段函數的圖都是連在一起的。', place: '高中函數，與絕對值、最大最小值的基礎。', ask: ['f(0) 要用哪一段公式？為什麼？', '空心點和實心點差在哪裡？', '兩段的圖什麼時候會接起來？'] },
        classes: ['S101（2507 第 21、23、25 堂）：多項式函數，含分段函數', 'S101（2507 第 5 堂）：數與式，含絕對值'], next: { href: 'play-trig-range.html', text: '下一個：單位圓與三角函數的範圍' } });
    }];
  new P.Lesson({ id: 'piecewise-fn', title: '函數與區間：分段函數', answers: { 1: 'c ＝ 0 時兩段接得起來（空心點落在實心點上）' }, steps: steps });
})();
