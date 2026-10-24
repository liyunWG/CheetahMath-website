/* 獵豹玩中學｜三角函數（圖形）：y＝a sin(bx)＋c 的最大最小值與週期
   預測＋拉 a、c 看最高線和最低線 → 拉 b 看週期（範圍不變）→ 3 個操作關卡（對準虛線、依條件調出、a 取負）。
   要擊中的迷思：a 為負時最大值寫成 c＋a（應為 c＋|a|）、以為 b 會改變範圍（b 只改週期）、週期是 360°÷|b|。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  function rad(d) { return d * Math.PI / 180; }
  function Y(a, b, c) { return function (x) { return a * Math.sin(rad(b * x)) + c; }; }
  function plane(host, sm) { return PF.plane(host, { x0: 0, x1: 360, y0: -6, y1: 6, hh: 8, tx: 90, ty: 2, sm: sm }); }
  function eq(a, b, c) {
    var as = a === 1 ? '' : a === -1 ? '−' : f(a), bs = b === 1 ? '' : f(b);
    return 'y ＝ ' + (a === 0 ? '0' : as + 'sin ' + (b === 1 ? 'x' : bs + 'x')) + (c === 0 ? '' : c > 0 ? ' ＋ ' + f(c) : ' − ' + f(-c));
  }

  /* 畫面＋三個滑桿。o: a, b, c（初值）、sliders（要顯示哪幾個）、target（虛線 {a,b,c}）、sm、onChange(a,b,c)、onSettle(a,b,c) */
  function scene(host, o) {
    var pl = plane(host, o.sm), b = pl.b, gd = pl.guides({ max: 3 }), A = o.a, B = o.b, C = o.c, S = {};
    var cur = pl.curve('pl-line pl-line--blue'), tg = pl.curve('pl-line pl-line--amber pl-line--dash');
    if (o.target) tg.set(Y(o.target.a, o.target.b, o.target.c));
    var lMax = b.line([pl.X(0), pl.Y(0)], [pl.X(360), pl.Y(0)], 'pl-line pl-line--green pl-line--dash', pl.gA), lMin = b.line([pl.X(0), pl.Y(0)], [pl.X(360), pl.Y(0)], 'pl-line pl-line--pink pl-line--dash', pl.gA);
    var per = b.line([pl.X(0), pl.Y(-5.5)], [pl.X(360), pl.Y(-5.5)], 'pl-line pl-line--amber pl-line--bold', pl.gA);
    var pE = P.pill('', 'is-blue'), pM = P.pill('', 'is-green'), pN = P.pill('', 'is-pink'), pT = P.pill('', 'is-amber'); [pE, pM, pN, pT].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pE), h('div', { class: 'pl-readout' }, pM, pN), h('div', { class: 'pl-readout' }, pT));
    function upd() {
      cur.set(Y(A, B, C)); var mx = C + Math.abs(A), mn = C - Math.abs(A), T = 360 / B;
      b.setLine(lMax, [pl.X(0), pl.Y(mx)], [pl.X(360), pl.Y(mx)]); b.setLine(lMin, [pl.X(0), pl.Y(mn)], [pl.X(360), pl.Y(mn)]); b.setLine(per, [pl.X(0), pl.Y(-5.5)], [pl.X(T), pl.Y(-5.5)]);
      /* 最大值、最小值標在左緣，一個週期的長度標在下緣 */
      gd.set([{ x: 0, y: mx, cls: 'green' }, { x: 0, y: mn, cls: 'pink' }, { x: T, y: -5.5, cls: 'amber', ax: 'x' }]);
      pE.textContent = eq(A, B, C); pM.textContent = '最大值 ＝ c ＋ |a| ＝ ' + f(C) + ' ＋ ' + f(Math.abs(A)) + ' ＝ ' + f(mx); pN.textContent = '最小值 ＝ c − |a| ＝ ' + f(mn); pT.textContent = '週期 ＝ 360° ÷ ' + f(B) + ' ＝ ' + f(T) + '°（下方橘線是一個週期）';
      if (o.onChange) o.onChange(A, B, C);
    }
    function sl(label, min, max, v0, set) {
      var s = P.slider(min, max, v0, function (v) { set(v); upd(); }, 1); s.addEventListener('change', function () { if (o.onSettle) o.onSettle(A, B, C); });
      host.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, label)), s); return s;
    }
    var show = o.sliders || ['a', 'b', 'c'], sa, sb, sc;
    if (show.indexOf('a') >= 0) sa = sl('a（上下伸縮，可以是負的）', -3, 3, A, function (v) { A = v; });
    if (show.indexOf('b') >= 0) sb = sl('b（左右擠壓）', 1, 4, B, function (v) { B = v; });
    if (show.indexOf('c') >= 0) sc = sl('c（整條上下平移）', -3, 3, C, function (v) { C = v; });
    S.set = function (a, bb, c) { A = a; B = bb; C = c; if (sa) sa.value = a; if (sb) sb.value = bb; if (sc) sc.value = c; upd(); if (o.onSettle) o.onSettle(A, B, C); };
    S.get = function () { return { a: A, b: B, c: C }; };
    upd(); return S;
  }

  var steps = [
    /* 1. 預測＋a、c */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc;
      P.choice(st, api, { id: 'tw-p1', predict: true, label: '先猜猜看', prompt: '<b>y ＝ −3 sin x ＋ 1</b> 的最大值是多少？', row: true, options: [{ ok: true, t: '4' }, { t: '−2' }, { t: '3' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉動 a 和 c'); } });
      st.append(P.instr('拉動 <b>a</b> 和 <b>c</b>（先不動 b）。綠色虛線是最高處，粉紅虛線是最低處。看它們怎麼跟著 a、c 變。'));
      sc = scene(st, { a: 2, b: 1, c: 0, sliders: ['a', 'c'], onChange: function (a, bb, c) {
        if (gate.on) return; if (a < 0) seen.neg = 1; if (c > 0) seen.up = 1; if (c < 0) seen.down = 1; if (Math.abs(a) === 3) seen.big = 1;
        if (seen.neg && seen.up && seen.down && seen.big && !done) {
          done = true; P.track('aha', { id: 'trig-wave', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：最大值是 4');
          st.append(P.ruleBox('<b>c</b> 把整條波上下平移，是「正中間」的高度。<br><b>|a|</b> 是波往上、往下各伸出去多遠：<b>最大值 ＝ c ＋ |a|</b>，<b>最小值 ＝ c − |a|</b>。<br>a 是<b>負</b>的，波只是上下翻過來，最高最低還是 c ± |a|，<b>不是 c ＋ a</b>。', '最大最小值'));
          api.unlock('最大最小值 ＝ c ± |a|');
        }
      } });
      api.solve(function () { gate.on = false; sc.set(-3, 1, 1); sc.set(2, 1, -2); sc.set(3, 1, 2); }, false, 'y ＝ −3 sin x ＋ 1 的最大值是 4（＝ c ＋ |a| ＝ 1 ＋ 3），最小值是 −2');
      st.append(P.hint('a 拉成負的、很大的，c 拉成正的、負的，看最高線怎麼動。')); api.lock('先做上面的預測');
    },
    /* 2. b */
    function (st, api) {
      var seen = {}, done = false, sc;
      st.append(P.instr('現在拉 <b>b</b>。看波的<b>最高、最低</b>有沒有變，以及<b>一個週期</b>（下方橘色線）有多長。'));
      sc = scene(st, { a: 2, b: 1, c: 1, sliders: ['b'], onChange: function (a, bb) { seen[bb] = 1; if (seen[2] && seen[3] && seen[4] && !done) {
        done = true; P.track('aha', { id: 'trig-wave', step: 2 });
        st.append(P.ruleBox('<b>b</b> 只管<b>左右擠壓</b>：b 越大波越擠，一個週期是 <b>360° ÷ |b|</b>。<br>最高、最低<b>完全沒變</b>——範圍只由 <b>a 和 c</b> 決定。', 'b 管週期'));
        api.unlock('b 只改週期，不改範圍'); } } });
      api.solve(function () { sc.set(2, 2, 1); sc.set(2, 3, 1); sc.set(2, 4, 1); }, false, 'b 只改週期（360° ÷ b），最高、最低不變，範圍由 a 和 c 決定');
      st.append(P.hint('b 拉到 2、3、4，每個都看看最高最低有沒有動。')); api.lock('把 b 拉到 2、3、4');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, target（虛線，可空）, ok(a,b,c), answer [a,b,c], ans（正確答案文字）, msg, rule, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { a: 1, b: 1, c: 0, sm: true, target: cfg.target, onSettle: function (a, bb, c) { if (cfg.ok(a, bb, c) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '調好了')); done(); } } });
          setSolve(function () { sc.set(cfg.answer[0], cfg.answer[1], cfg.answer[2]); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '調整 <b>a、b、c</b>，讓藍色的波剛好蓋住橘色虛線。', target: { a: 3, b: 2, c: 2 }, ok: function (a, b, c) { return a === 3 && b === 2 && c === 2; }, answer: [3, 2, 2], ans: 'a ＝ 3、b ＝ 2、c ＝ 2（y ＝ 3 sin 2x ＋ 2）', msg: 'y ＝ 3 sin 2x ＋ 2', rule: '最高 5、最低 −1：中間是 c ＝ (5 ＋ (−1)) ÷ 2 ＝ 2，伸出去 |a| ＝ 3；一個週期 180°，所以 b ＝ 360 ÷ 180 ＝ 2。', hint: '先看最高最低決定 a 和 c，再看一個週期有多長決定 b。' }),
        task({ prompt: '調整 <b>a、b、c</b>，讓波<b>最高是 4、最低是 −2、一個週期是 120°</b>。（a 可以是正的或負的）', ok: function (a, b, c) { return c + Math.abs(a) === 4 && c - Math.abs(a) === -2 && 360 / b === 120; }, answer: [3, 3, 1], ans: 'c ＝ 1、|a| ＝ 3（a ＝ 3 或 −3）、b ＝ 3', msg: '最高 4、最低 −2、週期 120°', rule: '中間 c ＝ (4 ＋ (−2)) ÷ 2 ＝ 1，|a| ＝ 4 − 1 ＝ 3，b ＝ 360 ÷ 120 ＝ 3。a 取 3 或 −3 都可以（−3 只是上下翻過來）。', hint: '最高最低的正中間是 c；從 c 到最高的距離是 |a|。' }),
        task({ prompt: '調整 <b>a、b、c</b>，讓<b>最大值是 1</b>，而且 <b>a 是負的</b>、一個週期是 <b>90°</b>。', ok: function (a, b, c) { return a < 0 && c + Math.abs(a) === 1 && 360 / b === 90; }, answer: [-2, 4, -1], ans: 'b ＝ 4，a 是負的，而且 c ＋ |a| ＝ 1（例如 a ＝ −2、c ＝ −1，或 a ＝ −1、c ＝ 0）', msg: 'a ＜ 0、最大值 1、週期 90°', rule: 'b ＝ 360 ÷ 90 ＝ 4。最大值是 c ＋ |a|（不是 c ＋ a）：a ＝ −2、c ＝ −1 時 −1 ＋ 2 ＝ 1。', hint: 'a 是負的，最大值要用 |a|。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-wave' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'trig-wave', moduleName: 'y ＝ a sin(bx) ＋ c 的最大最小值與週期', askAbout: '三角函數的圖形與最大最小值', aha: '<b>最大值 ＝ c ＋ |a|、最小值 ＝ c − |a|</b>（a 負的也一樣）；<b>b 只改週期</b>，週期是 360° ÷ |b|，範圍不受 b 影響。',
        cards: [{ text: 'y ＝ a sin(bx) ＋ c：最大值 c ＋ |a|、最小值 c − |a|、週期 360° ÷ |b|（2π ÷ |b|）', src: '高中：三角函數的圖形' }, { text: 'a 取負：圖形上下翻過來，最大最小值的範圍不變', src: '三角函數圖形的伸縮與翻轉' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '疊合 a sin x ＋ b cos x<br>相位平移' }, { at: 0.85, label: '三角函數的最大最小值應用' }] },
        teasers: [{ title: '疊合：a sin x ＋ b cos x', q: '3 sin x ＋ 4 cos x 的最大值是多少？為什麼是 5？', where: 'S102 第 18～22 堂（2026 年 5～6 月）：CH4 三角函數', lv: 'L3' }, { title: '三角函數在區間上的最大最小值', q: '限定 x 的範圍，最大最小值會在哪裡出現？', where: 'S111 第 1～8 堂：CH1 三角函數 II', lv: 'L3' }],
        parent: { pitfall: '孩子常把 a 為負時的最大值寫成 c ＋ a；也常以為 b 會改變最大最小值。', place: '高中三角函數圖形，是疊合與最大最小值題型的基礎。', ask: ['y ＝ −2 sin x ＋ 1 的最大值是多少？', 'y ＝ sin 3x 的一個週期是幾度？', 'b 變大，最高最低有改變嗎？'] },
        classes: ['S102（第 18～22 堂，2026 年 5～6 月）：CH4 三角函數', 'S111（第 1～8 堂）：CH1 三角函數 II'], next: { href: 'play-trig-reduction.html', text: '下一個：誘導公式' } });
    }];
  new P.Lesson({ id: 'trig-wave', title: 'y ＝ a sin(bx) ＋ c 的最大最小值與週期', steps: steps });
})();
