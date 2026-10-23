/* 獵豹玩中學｜二次函數（二）：頂點就是最低點（或最高點）
   預測＋拖頂點 V 看 y＝(x−h)²＋k → 拉 a 看最小值變最大值 → 3 個操作關卡（沿曲線找最低點、拋球找最高點、拖 V 對準虛線）。
   要擊中的迷思：以為有頂點就一定是最小值（開口向下是最大值）、頂點式裡 h 的符號（(x−2)² 的頂點是 x＝2）、最值出現在 x＝h。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  /* 頂點式與展開式的文字 */
  function sq(hv) { return hv === 0 ? 'x' : hv > 0 ? '(x − ' + f(hv) + ')' : '(x ＋ ' + f(-hv) + ')'; }
  function vform(a, hv, k) {
    var ac = a === 1 ? '' : a === -1 ? '−' : f(a), s = ac + sq(hv) + (hv === 0 ? '' : '') + '²';
    if (hv === 0) s = ac + 'x²';
    return 'y ＝ ' + s + (k === 0 ? '' : k > 0 ? ' ＋ ' + f(k) : ' − ' + f(-k));
  }
  function xform(a, hv, k) {
    var b = -2 * a * hv, c = a * hv * hv + k, ac = a === 1 ? '' : a === -1 ? '−' : f(a), s = 'y ＝ ' + ac + 'x²';
    if (b !== 0) s += (b > 0 ? ' ＋ ' : ' − ') + (Math.abs(b) === 1 ? '' : f(Math.abs(b))) + 'x';
    if (c !== 0) s += (c > 0 ? ' ＋ ' : ' − ') + f(Math.abs(c));
    return s;
  }
  function plane(host, sm) { return PF.plane(host, { x0: -5, x1: 5, y0: -4, y1: 10, hh: 9, tx: 1, ty: 2, sm: sm }); }
  function grid(pl, hs, ks) { var c = []; for (var i = hs[0]; i <= hs[1]; i++) for (var j = ks[0]; j <= ks[1]; j++) c.push([pl.X(i), pl.Y(j)]); return c; }

  var steps = [
    /* 1. 預測＋拖 V（a＝1） */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, hv = 2, k = 1, a = 1;
      P.choice(st, api, { id: 'qv-p1', predict: true, label: '先猜猜看', prompt: '拋物線 <b>y ＝ (x − 2)² ＋ 1</b>，最低的那個點在哪裡？', row: true, options: [{ ok: true, t: '(2, 1)' }, { t: '(−2, 1)' }, { t: '(2, −1)' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動頂點 V 到不同的位置'); } });
      st.append(P.instr('拖動 <b>V</b>（拋物線的最低點），看 <b>y ＝ (x − h)² ＋ k</b> 怎麼變，還有展開之後的樣子。'));
      var pl = plane(st), b = pl.b, cur = pl.curve('pl-line pl-line--blue'), axs = b.line([pl.X(hv), pl.Y(-4)], [pl.X(hv), pl.Y(10)], 'pl-line pl-line--soft', pl.gA), tV = b.text([pl.X(hv) + 0.7, pl.Y(k) - 0.55], 'V', 'pl-text pl-text--pink', pl.gA);
      var pV = P.pill('', 'is-blue'), pX = P.pill('', 'is-amber'), pM = P.pill('', 'is-green'); pV.style.whiteSpace = pX.style.whiteSpace = 'normal'; st.append(h('div', { class: 'pl-readout' }, pV), h('div', { class: 'pl-readout' }, pX), h('div', { class: 'pl-readout' }, pM));
      function upd() {
        cur.set(function (x) { return (x - hv) * (x - hv) + k; }); b.setLine(axs, [pl.X(hv), pl.Y(-4)], [pl.X(hv), pl.Y(10)]); b.setText(tV, [pl.X(hv) + 0.7, pl.Y(k) - 0.55], 'V');
        pV.textContent = '頂點式：' + vform(a, hv, k); pX.textContent = '展開：' + xform(a, hv, k); pM.textContent = 'V ＝ (' + f(hv) + ', ' + f(k) + ')　最小值 ＝ ' + f(k) + '（x ＝ ' + f(hv) + ' 時）';
        if (gate.on) return; var key = hv + ',' + k; if (!seen[key]) { seen[key] = 1; n++; } if (hv < 0) seen.neg = 1; if (hv > 0) seen.pos = 1;
        if (n >= 4 && seen.neg && seen.pos && !done) {
          done = true; P.track('aha', { id: 'quad-vertex', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：頂點是 (2, 1)');
          st.append(P.ruleBox('<b>y ＝ (x − h)² ＋ k</b> 的最低點（頂點）是 <b>(h, k)</b>：x ＝ h 時 y 最小，最小值是 <b>k</b>。<br>注意括號裡是「減 h」：(x − 2)² 的頂點在 x ＝ <b>2</b>；(x ＋ 3)² 的頂點在 x ＝ <b>−3</b>。', '頂點 (h, k)'));
          api.unlock('頂點 ＝ (h, k)');
        }
      }
      var hd = b.handle({ pos: [pl.X(hv), pl.Y(k)], candidates: grid(pl, [-3, 3], [-2, 6]), disabled: function () { return gate.on; }, onMove: function (t) { hv = Math.round(pl.Xi(t[0])); k = Math.round(pl.Yi(t[1])); upd(); } });
      api.solve(function () { gate.on = false; [[-2, 3], [0, 0], [3, 4], [2, 1]].forEach(function (p) { hd.moveTo([pl.X(p[0]), pl.Y(p[1])]); }); });
      upd(); st.append(P.hint('把 V 拖到左邊、右邊、上面、下面，看式子裡哪個數字在變。')); api.lock('先做上面的預測');
    },
    /* 2. 加上 a：最小值變最大值 */
    function (st, api) {
      var seen = {}, done = false, hv = 1, k = 2, a = 1;
      st.append(P.instr('現在多了 <b>a</b>：<b>y ＝ a(x − h)² ＋ k</b>。拉動滑桿改變 a，再拖動 <b>V</b>，看頂點是最低點還是最高點。'));
      var pl = plane(st), b = pl.b, cur = pl.curve('pl-line pl-line--blue'), axs = b.line([pl.X(hv), pl.Y(-4)], [pl.X(hv), pl.Y(10)], 'pl-line pl-line--soft', pl.gA), tV = b.text([pl.X(hv) + 0.7, pl.Y(k) - 0.55], 'V', 'pl-text pl-text--pink', pl.gA);
      var pV = P.pill('', 'is-blue'), pM = P.pill('', 'is-green'); pV.style.whiteSpace = pM.style.whiteSpace = 'normal'; st.append(h('div', { class: 'pl-readout' }, pV), h('div', { class: 'pl-readout' }, pM));
      function upd() {
        var line = a === 0; line ? cur.set(function () { return k; }) : cur.set(function (x) { return a * (x - hv) * (x - hv) + k; });
        b.setLine(axs, [pl.X(hv), pl.Y(-4)], [pl.X(hv), pl.Y(10)]); b.setText(tV, [pl.X(hv) + 0.7, pl.Y(k) + (a < 0 ? 0.55 : -0.55)], 'V');
        pV.textContent = line ? 'a ＝ 0 不是二次函數' : '頂點式：' + vform(a, hv, k); pV.className = 'pl-pill ' + (line ? 'is-amber' : 'is-blue');
        pM.textContent = line ? '要 a ≠ 0' : a > 0 ? 'a ＞ 0：最小值 ＝ ' + f(k) + '（x ＝ ' + f(hv) + '）' : 'a ＜ 0：最大值 ＝ ' + f(k) + '（x ＝ ' + f(hv) + '）'; pM.className = 'pl-pill ' + (a > 0 ? 'is-green' : a < 0 ? 'is-pink' : 'is-amber');
        if (a > 0) seen.pos = 1; if (a < 0) seen.neg = 1;
        if (seen.pos && seen.neg && seen.moved && !done) {
          done = true; P.track('aha', { id: 'quad-vertex', step: 2 });
          st.append(P.ruleBox('頂點 <b>(h, k)</b> 永遠是轉彎的那一點。<br><b>a ＞ 0</b>（開口向上）：頂點是最低點，有<b>最小值 k</b>，沒有最大值。<br><b>a ＜ 0</b>（開口向下）：頂點是最高點，有<b>最大值 k</b>，沒有最小值。', '最大還是最小'));
          api.unlock('開口決定是最大還是最小');
        }
      }
      var hd = b.handle({ pos: [pl.X(hv), pl.Y(k)], candidates: grid(pl, [-3, 3], [-2, 6]), onMove: function (t) { hv = Math.round(pl.Xi(t[0])); k = Math.round(pl.Yi(t[1])); seen.moved = 1; upd(); } });
      var sl = P.slider(-30, 30, 10, function (v) { a = v / 10; upd(); }, 5);
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← a ＝ −3'), h('span', {}, 'a ＝ 3 →')));
      api.solve(function () { hd.moveTo([pl.X(0), pl.Y(5)]); [-20, 10].forEach(function (v) { sl.value = v; a = v / 10; upd(); }); });
      upd(); st.append(P.hint('a 拉成正的、負的，V 也拖幾下，看看頂點是最高還是最低。')); api.lock('把 a 拉成正的和負的');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* 沿著曲線找極值點：cfg.fn、cfg.plane、cfg.xs（可停的 x）、cfg.goalY（要找的極值）、cfg.ask */
      function climb(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var pl = PF.plane(b0, Object.assign({ hh: 8, sm: true }, cfg.plane)), b = pl.b, fin = false, cur = pl.curve('pl-line pl-line--blue'), xv = cfg.start;
          cur.set(cfg.fn); var tQ = b.text([pl.X(xv) + 0.7, pl.Y(cfg.fn(xv))], 'Q', 'pl-text pl-text--pink', pl.gA), pQ = P.pill('', 'is-blue'), pH = P.pill('', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, pQ, pH));
          var cands = cfg.xs.map(function (x) { return [pl.X(x), pl.Y(cfg.fn(x))]; }), axs = b.line([pl.X(xv), pl.Y(pl.y0)], [pl.X(xv), pl.Y(cfg.fn(xv))], 'pl-line pl-line--soft', pl.gA);
          function upd() {
            var y = cfg.fn(xv); b.setText(tQ, [pl.X(xv) + 0.7, pl.Y(y)], 'Q'); b.setLine(axs, [pl.X(xv), pl.Y(pl.y0)], [pl.X(xv), pl.Y(y)]);
            pQ.textContent = 'Q ＝ (' + f(xv) + ', ' + f(y) + ')'; var ok = Math.abs(y - cfg.goalY) < 1e-9; pH.textContent = cfg.ask + ' ＝ ' + f(y); pH.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-amber');
          }
          function settle() { if (Math.abs(cfg.fn(xv) - cfg.goalY) < 1e-9 && !fin) { fin = true; b.goalMark([pl.X(xv), pl.Y(cfg.fn(xv))]); P.toast(cfg.msg); done(); } }
          var hd = b.handle({ pos: [pl.X(xv), pl.Y(cfg.fn(xv))], candidates: cands, onMove: function (t) { xv = Math.round(pl.Xi(t[0]) * 2) / 2; upd(); }, onEnd: function (t) { xv = Math.round(pl.Xi(t[0]) * 2) / 2; upd(); settle(); } });
          setSolve(function () { hd.moveTo([pl.X(cfg.goalX), pl.Y(cfg.goalY)]); }); upd(); b0.append(P.hint(cfg.hint));
        };
      }
      function xsRange(a, b2) { var r = []; for (var x = a; x <= b2 + 1e-9; x += 0.5) r.push(x); return r; }
      /* 拖 V 對準虛線 */
      function match(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '橘色虛線是 <b>y ＝ −(x ＋ 1)² ＋ 3</b>。拖動 <b>V</b>，讓藍色拋物線<b>y ＝ −(x − h)² ＋ k</b> 剛好蓋住它。' }));
        var pl = PF.plane(b0, { x0: -4, x1: 4, y0: -4, y1: 6, hh: 8, tx: 1, ty: 2, sm: true }), b = pl.b, hv = 2, k = 0, fin = false, tg = pl.curve('pl-line pl-line--amber pl-line--dash'), cur = pl.curve('pl-line pl-line--blue');
        tg.set(function (x) { return -(x + 1) * (x + 1) + 3; }); var tV = b.text([pl.X(hv) + 0.7, pl.Y(k) + 0.55], 'V', 'pl-text pl-text--pink', pl.gA), pV = P.pill('', 'is-blue'); pV.style.whiteSpace = 'normal'; b0.append(h('div', { class: 'pl-readout' }, pV));
        function upd() {
          cur.set(function (x) { return -(x - hv) * (x - hv) + k; }); b.setText(tV, [pl.X(hv) + 0.7, pl.Y(k) + 0.55], 'V'); var ok = hv === -1 && k === 3; pV.textContent = vform(-1, hv, k); pV.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-blue');
        }
        function settle() { if (hv === -1 && k === 3 && !fin) { fin = true; b.goalMark([pl.X(hv), pl.Y(k)]); P.toast('頂點 (−1, 3)：y ＝ −(x ＋ 1)² ＋ 3'); done(); } }
        var hd = b.handle({ pos: [pl.X(hv), pl.Y(k)], candidates: grid(pl, [-3, 3], [-3, 5]), onMove: function (t) { hv = Math.round(pl.Xi(t[0])); k = Math.round(pl.Yi(t[1])); upd(); }, onEnd: function (t) { hv = Math.round(pl.Xi(t[0])); k = Math.round(pl.Yi(t[1])); upd(); settle(); } });
        setSolve(function () { hd.moveTo([pl.X(-1), pl.Y(3)]); }); upd(); b0.append(P.hint('V 是頂點。虛線的最高點在哪裡？注意括號裡是「＋」。'));
      }
      var tasks = [
        climb({ prompt: '曲線是 <b>y ＝ x² − 4x ＋ 5</b>。沿著曲線拖動 <b>Q</b>，找出<b>最低</b>的位置。', fn: function (x) { return x * x - 4 * x + 5; }, plane: { x0: -1.5, x1: 5.5, y0: -1, y1: 11, tx: 1, ty: 2 }, xs: xsRange(-1, 5), start: -1, goalX: 2, goalY: 1, ask: '最小值', msg: '最低點 (2, 1)：最小值 1', hint: '往左走、往右走，y 先怎麼變、再怎麼變？' }),
        climb({ prompt: '球的高度 <b>y ＝ −x² ＋ 4x ＋ 1</b>（x 是秒數）。沿著曲線拖動 <b>Q</b>，找出球飛到<b>最高</b>的時候。', fn: function (x) { return -x * x + 4 * x + 1; }, plane: { x0: -1.5, x1: 5.5, y0: -6, y1: 8, tx: 1, ty: 2 }, xs: xsRange(-1, 5), start: 5, goalX: 2, goalY: 5, ask: '最大值', msg: '最高點 (2, 5)：最大值 5', hint: '這次開口向下，頂點是最高還是最低？' }),
        match];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'quad-vertex' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'quad-vertex', moduleName: '二次函數：頂點與最大最小值', askAbout: '二次函數的最大最小值', aha: '頂點 <b>(h, k)</b> 就是拋物線轉彎的那一點：開口向上它是<b>最低點</b>（最小值 k），開口向下它是<b>最高點</b>（最大值 k），都出現在 <b>x ＝ h</b>。',
        cards: [{ text: 'y ＝ a(x − h)² ＋ k：頂點 (h, k)；a ＞ 0 有最小值 k，a ＜ 0 有最大值 k；對稱軸 x ＝ h', src: '國中到高中：二次函數的頂點式' }, { text: '展開式 y ＝ ax² ＋ bx ＋ c 的頂點：x ＝ −b/2a', src: '二次函數的最大最小值' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '限定範圍的最大最小值<br>應用題最值' }, { at: 0.85, label: '含參數的最值<br>判別式' }] },
        teasers: [{ title: '配方法求最值', q: '把 y ＝ x² − 6x ＋ 11 配成頂點式，最小值是多少？', where: 'J91A 2507 第 18 堂：二次函數的最大最小值；J91S 2607 第 4 堂：CH12', lv: 'L2' }, { title: '限定範圍的最大最小值', q: '定義域只取一段 [m, n]，頂點不在範圍內時，最大最小值出現在哪裡？', where: 'S101 2507 第 23 堂：多項式函數（最大最小值與區間）', lv: 'L3' }],
        parent: { pitfall: '孩子常把 (x − 2)² 的頂點寫成 x ＝ −2（符號看反）；也常以為「有頂點就是最小值」，忘了開口向下時頂點是最大值。', place: '國中三年級到高中的二次函數，是最大最小值應用題的基礎。', ask: ['y ＝ (x − 3)² ＋ 2 的最低點在哪裡？', 'y ＝ −(x ＋ 1)² ＋ 4 有最大值還是最小值？是多少？', '球往上丟，最高點為什麼剛好是拋物線的頂點？'] },
        classes: ['J91A（2507 第 15、18 堂）：二次函數，含頂點與最大最小值', 'J91S（2607 第 2、4 堂）：CH12 二次函數', 'S101（2507 第 22、23 堂）：多項式函數，含最大最小值'], next: { href: 'play-quad-interval.html', text: '下一個：限定範圍的最大最小值' } });
    }];
  new P.Lesson({ id: 'quad-vertex', title: '二次函數：頂點與最大最小值', answers: { 1: 'a ＞ 0：頂點是最低點（最小值 k）；a ＜ 0：頂點是最高點（最大值 k）' }, steps: steps });
})();
