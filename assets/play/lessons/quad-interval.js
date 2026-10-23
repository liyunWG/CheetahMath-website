/* 獵豹玩中學｜二次函數（三）：限定範圍 [m, n] 的最大最小值
   預測＋拖左右端點 m、n，看最大值、最小值出現在哪裡 → 湊齊「最小值在左端／右端／頂點」三種情形 → 3 個操作關卡。
   要擊中的迷思：直接拿頂點當答案，沒檢查頂點是不是在範圍內；最大最小值只可能出現在頂點或兩個端點。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  function F(x) { return x * x - 4 * x + 1; }   /* 頂點 (2, −3) */
  var VX = 2, NM = -2, NN = 6;
  function plane(host, sm) { return PF.plane(host, { x0: -2.5, x1: 6.5, y0: -7, y1: 14, hh: 10, tx: 1, ty: 5, sm: sm, skipY: [-5] }); }
  /* 在 [m, n] 上用細密取樣找最大、最小（和「只比頂點與端點」的算法互相對照） */
  function extremes(m, n) {
    var mx = -1e9, mn = 1e9, xm = m, xn = m, N = 800;
    for (var i = 0; i <= N; i++) { var x = m + (n - m) * i / N, y = F(x); if (y > mx) { mx = y; xm = x; } if (y < mn) { mn = y; xn = x; } }
    return { max: Math.round(mx * 1e6) / 1e6, min: Math.round(mn * 1e6) / 1e6, xmax: xm, xmin: xn };
  }
  function where(m, n) { /* 最小值出現在哪裡：左端、右端或頂點 */
    if (VX > m && VX < n) return 'vertex'; return F(m) <= F(n) ? 'left' : 'right';
  }
  var WHERE = { left: '左端點', right: '右端點', vertex: '頂點' };

  /* 畫面：f(x) ＝ x² − 4x ＋ 1、兩個端點把手 m、n、範圍內加粗、最大最小點。onChange(m, n, ex) */
  function scene(host, o) {
    var pl = plane(host, o.sm), b = pl.b, m = o.m, n = o.n, cur = pl.curve('pl-line pl-line--blue'), seg = pl.curve('pl-line pl-line--pink pl-line--bold'), RY = -5.5;
    cur.set(F);
    var vx = b.line([pl.X(VX), pl.Y(-7)], [pl.X(VX), pl.Y(14)], 'pl-line pl-line--soft', pl.gA), tVx = b.text([pl.X(VX), pl.Y(14) - 0.3], '頂點 x ＝ 2', 'pl-text pl-text--sm pl-text--amber', pl.gA);
    var dm = b.line([pl.X(m), pl.Y(RY)], [pl.X(m), pl.Y(F(m))], 'pl-line pl-line--pink pl-line--dash', pl.gA), dn = b.line([pl.X(n), pl.Y(RY)], [pl.X(n), pl.Y(F(n))], 'pl-line pl-line--pink pl-line--dash', pl.gA);
    var tm = b.text([pl.X(m) - 0.75, pl.Y(RY)], 'm', 'pl-text pl-text--pink', pl.gA), tn = b.text([pl.X(n) + 0.75, pl.Y(RY)], 'n', 'pl-text pl-text--pink', pl.gA);
    var dMax = b.dot([0, 0], 'pl-dot pl-dot--green', pl.gA, 0.22), dMin = b.dot([0, 0], 'pl-dot pl-dot--blue', pl.gA, 0.22);
    var pR = P.pill('', 'is-pink'), pV = P.pill('', 'is-amber'), pM = P.pill('', 'is-green'), pN = P.pill('', 'is-blue'); [pR, pV, pM, pN].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pR, pV), h('div', { class: 'pl-readout' }, pM, pN));
    var S = {};
    function upd() {
      var ex = extremes(m, n); seg.set(F, [m, n]);
      b.setLine(dm, [pl.X(m), pl.Y(RY)], [pl.X(m), pl.Y(F(m))]); b.setLine(dn, [pl.X(n), pl.Y(RY)], [pl.X(n), pl.Y(F(n))]); b.setText(tm, [pl.X(m) - 0.75, pl.Y(RY)], 'm'); b.setText(tn, [pl.X(n) + 0.75, pl.Y(RY)], 'n');
      dMax.setAttribute('cx', pl.X(ex.xmax)); dMax.setAttribute('cy', b.Y(pl.Y(ex.max))); dMin.setAttribute('cx', pl.X(ex.xmin)); dMin.setAttribute('cy', b.Y(pl.Y(ex.min)));
      pR.textContent = '範圍 [' + f(m) + ', ' + f(n) + ']'; var inside = VX > m && VX < n, atEnd = VX === m || VX === n; pV.textContent = '頂點 x ＝ 2 ' + (inside ? '在範圍內' : atEnd ? '剛好在端點上' : '在範圍外');
      pM.textContent = '最大值 ' + f(ex.max) + '（x ＝ ' + f(Math.round(ex.xmax * 100) / 100) + '）'; pN.textContent = '最小值 ' + f(ex.min) + '（x ＝ ' + f(Math.round(ex.xmin * 100) / 100) + '）';
      if (o.onChange) o.onChange(m, n, ex);
    }
    function settle() { if (o.onSettle) o.onSettle(m, n, extremes(m, n), pl); }
    function cands(row) { var c = []; for (var v = NM; v <= NN; v++) c.push([pl.X(v), pl.Y(row)]); return c; }
    var hm = b.handle({ pos: [pl.X(m), pl.Y(RY)], candidates: cands(RY), disabled: function () { return !!(o.gate && o.gate.on); }, valid: function (t) { return Math.round(pl.Xi(t[0])) < n; }, onMove: function (t) { m = Math.round(pl.Xi(t[0])); upd(); }, onEnd: function () { settle(); } });
    var hn = b.handle({ pos: [pl.X(n), pl.Y(RY)], candidates: cands(RY), disabled: function () { return !!(o.gate && o.gate.on); }, valid: function (t) { return Math.round(pl.Xi(t[0])) > m; }, onMove: function (t) { n = Math.round(pl.Xi(t[0])); upd(); }, onEnd: function () { settle(); } });
    upd();
    S.set = function (a, z) { if (a >= n) { hn.moveTo([pl.X(z), pl.Y(RY)]); hm.moveTo([pl.X(a), pl.Y(RY)]); } else { hm.moveTo([pl.X(a), pl.Y(RY)]); hn.moveTo([pl.X(z), pl.Y(RY)]); } };
    return S;
  }

  var steps = [
    /* 1. 預測＋拖端點 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, s, chips = {};
      P.choice(st, api, { id: 'qi-p1', predict: true, label: '先猜猜看', prompt: '<b>y ＝ x² − 4x ＋ 1</b> 的頂點在 (2, −3)。如果只看 <b>3 ≤ x ≤ 5</b> 這一段，最小值在<b>頂點</b>嗎？', row: true, options: [{ t: '在頂點' }, { t: '不在頂點' }, { t: '不一定' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把兩個端點 m、n 拖到不同的位置'); } });
      st.append(P.instr('拖動 <b>m</b>、<b>n</b>，只看粉紅色這一段曲線。綠點是這一段的<b>最高點</b>，藍點是<b>最低點</b>。看看它們出現在哪裡。'));
      s = scene(st, { m: 3, n: 5, gate: gate, onChange: function (m, n) {
        if (gate.on) return; seen[where(m, n)] = 1;
        ['left', 'right', 'vertex'].forEach(function (k) { if (chips[k]) { chips[k].className = 'pl-pill ' + (seen[k] ? 'is-ok' : 'is-amber'); } });
        if (seen.left && seen.right && seen.vertex && !done) {
          done = true; P.track('aha', { id: 'quad-interval', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：頂點 x＝2 不在 [3, 5] 裡');
          st.append(P.ruleBox('最大最小值只會出現在<b>頂點</b>或<b>兩個端點</b>。<br>頂點的 x 在範圍<b>內</b>：最小值（開口向上）在頂點；頂點在範圍<b>外</b>：最小值在離頂點<b>近</b>的那個端點。', '頂點在不在範圍裡'));
          api.unlock('先看頂點在不在範圍內');
        }
      } });
      var cp = h('div', { class: 'pl-readout' }); ['left', 'right', 'vertex'].forEach(function (k) { chips[k] = P.pill('最小值在' + WHERE[k], 'is-amber'); cp.append(chips[k]); }); st.append(cp);
      api.solve(function () { gate.on = false; s.set(3, 5); s.set(-2, 0); s.set(0, 5); });
      st.append(P.hint('三種「最小值在哪裡」都要湊齊：左端點、右端點、頂點。')); api.lock('先做上面的預測');
    },
    /* 2. 兩個端點一起滑動：頂點進進出出 */
    function (st, api) {
      var seen = {}, done = false, s;
      st.append(P.instr('讓範圍變窄，在曲線上「滑動」：範圍的寬度固定是 <b>2</b>（n ＝ m ＋ 2）。看<b>最小值出現的位置</b>怎麼從端點跳到頂點，又跳到另一個端點。'));
      s = scene(st, { m: -2, n: 0, onChange: function (m, n) {
        seen[where(m, n)] = 1; if (seen.left && seen.right && seen.vertex && !done) {
          done = true; P.track('aha', { id: 'quad-interval', step: 2 });
          st.append(P.ruleBox('範圍在頂點<b>左邊</b>（曲線下降）：最小值在<b>右端點</b>。<br>範圍包住頂點：最小值就是<b>頂點</b>。<br>範圍在頂點<b>右邊</b>（曲線上升）：最小值在<b>左端點</b>。', '滑過頂點'));
          api.unlock('頂點進進出出');
        }
      } });
      api.solve(function () { s.set(-2, 0); s.set(1, 3); s.set(3, 5); });
      st.append(P.hint('先拖 n 再拖 m，讓範圍從左邊一路滑到右邊。')); api.lock('讓範圍滑過頂點');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, ok(m, n, ex), answer:[m, n], msg, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, s = scene(b0, { m: 0, n: 1, sm: true, onSettle: function (m, n, ex, pl) { if (cfg.ok(m, n, ex) && !fin) { fin = true; pl.b.goalMark([pl.X(m), pl.Y(-5.5)]); P.toast(cfg.msg); done(); } } });
          setSolve(function () { s.set(cfg.answer[0], cfg.answer[1]); }); b0.append(P.hint(cfg.hint));
        };
      }
      var near = function (a, b2) { return Math.abs(a - b2) < 1e-6; };
      var tasks = [
        task({ prompt: '調整 <b>m</b>、<b>n</b>，讓<b>最小值出現在頂點</b>，而且<b>最大值在右端點</b>。', ok: function (m, n, ex) { return where(m, n) === 'vertex' && F(n) > F(m); }, answer: [0, 5], msg: '頂點在範圍內，右端點比左端點高', hint: '範圍要包住 x ＝ 2。左右端點誰比較高？' }),
        task({ prompt: '調整 <b>m</b>、<b>n</b>，讓<b>最大值是 6</b>，<b>最小值是 −2</b>。（有不只一種答案）', ok: function (m, n, ex) { return near(ex.max, 6) && near(ex.min, -2); }, answer: [3, 5], msg: '最大值 6、最小值 −2', hint: 'f(x) ＝ 6 和 f(x) ＝ −2 的 x 各是多少？頂點可以在範圍裡嗎？' }),
        task({ prompt: '調整 <b>m</b>、<b>n</b>，讓<b>最大值比最小值剛好大 4</b>。', ok: function (m, n, ex) { return near(ex.max - ex.min, 4); }, answer: [0, 2], msg: '最大值 − 最小值 ＝ 4', hint: '頂點是 (2, −3)。最小值是 −3 嗎？最大值要是多少？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'quad-interval' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'quad-interval', moduleName: '二次函數：限定範圍的最大最小值', askAbout: '二次函數在區間上的最大最小值', aha: '最大最小值只會出現在<b>頂點</b>或<b>兩個端點</b>。<br>先看頂點的 x 在不在範圍內：在，頂點就是一個極值；不在，極值都在端點。',
        cards: [{ text: '限定 m ≤ x ≤ n 時，比較「頂點（若在範圍內）」與「兩個端點」的函數值，最大的是最大值、最小的是最小值', src: '高中：二次函數在區間上的最大最小值' }, { text: '頂點在範圍外：函數在範圍內單調（一路上升或一路下降），極值在兩端', src: '二次函數的單調區間' }],
        depth: { here: 0.35, cheetah: [{ at: 0.6, label: '含參數的區間最值<br>分類討論' }, { at: 0.9, label: '二次函數與不等式<br>恆成立問題' }] },
        teasers: [{ title: '含參數的區間最值', q: 'f(x) ＝ x² − 2ax ＋ 1 在 [0, 3] 的最小值，會隨 a 在哪裡而不同。要怎麼分類？', where: 'S101 2507 第 23 堂：多項式函數（最大最小值與區間）', lv: 'L3' }, { title: '二次函數的應用最值', q: '圍籬、利潤、拋球：定義域受限時，最大值還在頂點嗎？', where: 'J91A 2507 第 18 堂；J91S 2607 第 4 堂：二次函數的最大最小值', lv: 'L2' }],
        parent: { pitfall: '孩子最常見的錯：定義域有限制時，直接拿頂點當答案，沒有檢查頂點的 x 是不是在範圍內；或只比兩個端點，忘了頂點可能在範圍裡。', place: '高中二次函數的最大最小值，是分類討論與應用題的基礎。', ask: ['y ＝ x² − 4x ＋ 1，只看 3 ≤ x ≤ 5，最小值是多少？為什麼不是 −3？', '範圍包住頂點時，最大值會在哪裡？', '為什麼不用比範圍中間的點？'] },
        classes: ['S101（2507 第 23 堂）：多項式函數，含最大最小值與區間', 'J91A（2507 第 18 堂）：二次函數的最大最小值', 'J91S（2607 第 4 堂）：CH12 二次函數'], next: { href: 'play-quad-ineq.html', text: '下一個：二次不等式' } });
    }];
  new P.Lesson({ id: 'quad-interval', title: '二次函數：限定範圍的最大最小值', steps: steps });
})();
