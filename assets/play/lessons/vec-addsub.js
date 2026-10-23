/* 獵豹玩中學｜向量（一）：加、減與係數積
   預測＋拖 a、b 的終點看 a＋b（頭尾相接）→ 看 a−b（從 b 的終點指向 a 的終點）→ 拉 k 看 k·a → 3 個操作關卡
   （拖 b 讓 a＋b 落在目標、用 s·a＋t·b 湊出目標、拖 b 讓 a−b 等於目標）。
   要擊中的迷思：減法方向搞反（a−b 是從 b 指向 a）、k 為負時忘了反向、座標各自相加相減。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, PV = window.PV, f = PV.f, vs = PV.vs;
  var XR = [-3, 3], YR = [-2, 2];                       /* 終點候選：和與差都留在畫面內 */
  var CA = '#2f6fdc', CB = '#d6336c', CR = '#1f9d55', CT = '#d29b1f';
  function tip(b, pl, p, ux, uy) { return [p[0] + 0.7 * ux, p[1] + 0.7 * uy]; }
  function dir(p) { var L = Math.hypot(p[0], p[1]) || 1; return [p[0] / L, p[1] / L]; }

  /* 加法／減法的畫面。o: mode（'add'|'sub'）、a、b（初值）、fixedA（a 不能拖）、target（目標終點，畫橘色）、gate、sm、
     onChange(a, b, res)、onSettle(a, b, res) */
  function scene(host, o) {
    var pl = PV.plane(host, o.sm), b = pl.b, A = o.a.slice(), B = o.b.slice(), add = o.mode === 'add', S = {};
    var tgt = null, tgtArrow = null, tlm = o.target ? [o.target[0] + (o.target[0] >= 0 ? 1.1 : -1.1), o.target[1] + 0.5, 0.7, 0.4] : [99, 99];
    if (o.target) { tgtArrow = PV.arrow(pl, CT, null, { dash: true, w: 3 }); tgtArrow.set([0, 0], o.target); b.text([pl.X(o.target[0]) + (o.target[0] >= 0 ? 0.95 : -0.95), pl.Y(o.target[1]) + 0.45], '目標', 'pl-text pl-text--sm pl-text--amber', pl.gC); }
    var cp = PV.arrow(pl, add ? CB : '#7fcf9f', null, { dash: true, w: add ? 3 : 3 }), res = PV.arrow(pl, CR, null, { w: 6 }), aa = PV.arrow(pl, CA, null, { w: 4 }), ab = PV.arrow(pl, CB, null, { w: 4 });
    var ta = b.text([0, 0], 'a', 'pl-text pl-text--blue', pl.gC), tb = b.text([0, 0], 'b', 'pl-text pl-text--pink', pl.gC), tr = b.text([0, 0], add ? 'a＋b' : 'a−b', 'pl-text pl-text--green', pl.gC);
    var pA = P.pill('', 'is-blue'), pB = P.pill('', 'is-pink'), pR = P.pill('', 'is-green'); pR.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, pA, pB), h('div', { class: 'pl-readout' }, pR));
    function resV() { return add ? [A[0] + B[0], A[1] + B[1]] : [A[0] - B[0], A[1] - B[1]]; }
    function upd() {
      var r = resV(), cr = A[0] * B[1] - A[1] * B[0], sa = cr > 0 ? -1 : 1, la = PV.place(pl, [0, 0], A, [A, B, r, [0, 0], tlm], 0.6), lb = PV.place(pl, [0, 0], B, [A, B, r, la.m, tlm], 0.6);
      aa.set([0, 0], A); ab.set([0, 0], B); b.setText(ta, la.b, 'a'); b.setText(tb, lb.b, 'b');
      var segP = add ? [0, 0] : B, segQ = add ? r : A, lr = PV.place(pl, segP, segQ, [A, B, r, la.m, lb.m, [0, 0], tlm], 0.75, [0.9, 0.4]);
      if (add) { cp.set(A, [A[0] + B[0], A[1] + B[1]]); res.set([0, 0], r); } else { cp.set([0, 0], r); res.set(B, A); }
      b.setText(tr, lr.b, (r[0] === 0 && r[1] === 0) ? '' : add ? 'a＋b' : 'a−b');   /* 零向量沒有箭頭，不寫名字 */
      pA.textContent = 'a ＝ ' + vs(A[0], A[1]); pB.textContent = 'b ＝ ' + vs(B[0], B[1]);
      pR.textContent = add ? 'a＋b ＝ (' + f(A[0]) + '＋' + (B[0] < 0 ? '(' + f(B[0]) + ')' : f(B[0])) + ', ' + f(A[1]) + '＋' + (B[1] < 0 ? '(' + f(B[1]) + ')' : f(B[1])) + ') ＝ ' + vs(r[0], r[1])
        : 'a−b ＝ (' + f(A[0]) + '−' + (B[0] < 0 ? '(' + f(B[0]) + ')' : f(B[0])) + ', ' + f(A[1]) + '−' + (B[1] < 0 ? '(' + f(B[1]) + ')' : f(B[1])) + ') ＝ ' + vs(r[0], r[1]);
      var ok = o.target && r[0] === o.target[0] && r[1] === o.target[1]; pR.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-green');
      if (o.onChange) o.onChange(A, B, r);
    }
    var cands = PV.lattice(pl, o.xr || XR, o.yr || YR);
    function dis() { return !!(o.gate && o.gate.on); }
    function tipH(P0, set, lbl) {
      return b.handle({ r: 0.3, pos: [pl.X(P0[0]), pl.Y(P0[1])], candidates: cands, disabled: dis, onMove: function (t) { set(Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))); upd(); }, onEnd: function (t) { set(Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))); upd(); if (o.onSettle) o.onSettle(A, B, resV(), pl); } });
    }
    var hA = o.fixedA ? null : tipH(A, function (x, y) { A[0] = x; A[1] = y; }), hB = tipH(B, function (x, y) { B[0] = x; B[1] = y; });
    S.setA = function (x, y) { hA.moveTo([pl.X(x), pl.Y(y)]); }; S.setB = function (x, y) { hB.moveTo([pl.X(x), pl.Y(y)]); };
    S.res = resV; S.pl = pl; upd(); return S;
  }

  var steps = [
    /* 1. 加法 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, sc;
      P.choice(st, api, { id: 'va-p1', predict: true, label: '先猜猜看', prompt: 'a ＝ (3, 1)、b ＝ (1, 2)。<b>a ＋ b</b> 的終點座標是？', row: true, options: [{ ok: true, t: '(4, 3)' }, { t: '(3, 2)' }, { t: '(2, −1)' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 a、b 的終點'); } });
      st.append(P.instr('拖動 <b>a</b>、<b>b</b> 的箭頭終點。把 b <b>接在 a 的後面</b>（粉紅虛線），從原點到最後的終點，就是 <b>a ＋ b</b>（綠色）。'));
      sc = scene(st, { mode: 'add', a: [3, 1], b: [1, 2], gate: gate, onChange: function (A, B) {
        if (gate.on) return; var k = A.join() + '|' + B.join(); if (!seen[k]) { seen[k] = 1; n++; }
        if (n >= 4 && !done) {
          done = true; P.track('aha', { id: 'vec-addsub', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：a＋b ＝ (4, 3)');
          st.append(P.ruleBox('向量相加：<b>頭尾相接</b>，從 a 的起點到 b 的終點。座標就是<b>各自相加</b>：<b>(x₁ ＋ x₂, y₁ ＋ y₂)</b>。<br>先沿 a 走，再沿 b 走，和先沿 b 走再沿 a 走，終點一樣（平行四邊形的對角線）。', '向量加法'));
          api.unlock('座標各自相加');
        }
      } });
      api.solve(function () { gate.on = false; sc.setA(2, 1); sc.setB(-1, 2); sc.setA(-2, -1); sc.setB(3, 1); sc.setA(3, 1); sc.setB(1, 2); }, false, 'a ＋ b ＝ (3＋1, 1＋2) ＝ (4, 3)（座標各自相加）');
      st.append(P.hint('a、b 各拖幾下，看綠色箭頭怎麼走，座標怎麼算。')); api.lock('先做上面的預測');
    },
    /* 2. 減法 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, sc;
      P.choice(st, api, { id: 'va-p2', predict: true, label: '先猜猜看', prompt: '<b>a − b</b> 的箭頭，畫在哪裡？', row: true, options: [{ ok: true, t: '從 b 的終點指向 a 的終點' }, { t: '從 a 的終點指向 b 的終點' }, { t: '從原點指向 b 的終點' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 a、b 的終點'); } });
      st.append(P.instr('綠色粗箭頭是 <b>a − b</b>。拖動 a、b 的終點，看它從哪裡畫到哪裡。淡綠色虛線是把它<b>平移到原點</b>的樣子。'));
      sc = scene(st, { mode: 'sub', a: [3, 1], b: [1, 2], gate: gate, onChange: function (A, B) {
        if (gate.on) return; var k = A.join() + '|' + B.join(); if (!seen[k]) { seen[k] = 1; n++; }
        if (n >= 4 && !done) {
          done = true; P.track('aha', { id: 'vec-addsub', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：從 b 的終點指向 a 的終點');
          st.append(P.ruleBox('<b>a − b</b> 是「從 <b>b 的終點</b>指向 <b>a 的終點</b>」的箭頭：b ＋ (a − b) ＝ a。<br>座標各自相減：<b>(x₁ − x₂, y₁ − y₂)</b>。誰減誰、箭頭就指向「被減的那個」(a)。', '向量減法'));
          api.unlock('a − b：從 b 指向 a');
        }
      } });
      api.solve(function () { gate.on = false; sc.setA(2, 1); sc.setB(-1, 2); sc.setA(-2, -1); sc.setB(3, 1); sc.setA(3, 1); sc.setB(1, 2); }, false, 'a − b 是從 b 的終點指向 a 的終點的箭頭，座標是 (x₁−x₂, y₁−y₂)');
      st.append(P.hint('b ＋ (a − b) 剛好會走到哪裡？')); api.lock('先做上面的預測');
    },
    /* 3. 係數積 */
    function (st, api) {
      var seen = {}, done = false, k = 2, A = [2, 1], pl = PV.plane(st), b = pl.b;
      st.append(P.instr('拖動 <b>a</b> 的終點，再拉滑桿改變 <b>k</b>。綠色粗箭頭是 <b>k · a</b>。看 k 是正是負、大是小時，它怎麼變。'));
      var kk = PV.arrow(pl, CR, null, { w: 8 }), aa = PV.arrow(pl, CA, null, { w: 3 }), ta = b.text([0, 0], 'a', 'pl-text pl-text--blue', pl.gC);
      var pK = P.pill('', 'is-amber'), pV = P.pill('', 'is-green'), pD = P.pill('', 'is-pink'); pD.style.whiteSpace = 'normal'; st.append(h('div', { class: 'pl-readout' }, pK, pV), h('div', { class: 'pl-readout' }, pD));
      function upd() {
        var K = [k * A[0], k * A[1]], d = Math.hypot(A[0], A[1]) || 1; kk.set([0, 0], K); aa.set([0, 0], A); b.setText(ta, PV.place(pl, [0, 0], A, [A, K, [0, 0]], 0.6).b, 'a');
        pK.textContent = 'k ＝ ' + f(k); pV.textContent = 'k·a ＝ ' + f(k) + ' × ' + vs(A[0], A[1]) + ' ＝ ' + vs(K[0], K[1]); pD.textContent = k === 0 ? 'k ＝ 0：變成零向量' : (k < 0 ? '反向' : '同向') + '，長度是 a 的 ' + f(Math.abs(k)) + ' 倍（' + (Math.abs(k) > 1 ? '變長' : Math.abs(k) < 1 ? '變短' : '一樣長') + '）';
        if (k < 0) seen.neg = 1; if (Math.abs(k) > 1) seen.big = 1; if (k !== 0 && Math.abs(k) < 1) seen.small = 1;
        if (seen.neg && seen.big && seen.small && !done) {
          done = true; P.track('aha', { id: 'vec-addsub', step: 3 });
          st.append(P.ruleBox('<b>k ＞ 0</b>：和 a 同方向；<b>k ＜ 0</b>：<b>反方向</b>。<b>|k| ＞ 1</b> 變長、<b>|k| ＜ 1</b> 變短。座標各乘 k：<b>k·a ＝ (kx, ky)</b>。<br>k·a 永遠和 a 在<b>同一條直線</b>上，所以 k·a 和 a <b>平行</b>。', '係數積'));
          api.unlock('k·a 和 a 在同一條線上');
        }
      }
      var hd = b.handle({ r: 0.3, pos: [pl.X(A[0]), pl.Y(A[1])], candidates: PV.lattice(pl, [-3, 3], [-2, 2]), onMove: function (t) { A = [Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))]; upd(); } });
      var sl = P.slider(-4, 6, 4, function (v) { k = v / 2; upd(); }, 1); st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← k ＝ −2'), h('span', {}, 'k ＝ 3 →')));
      api.solve(function () { [-4, 6, 1].forEach(function (v) { sl.value = v; k = v / 2; upd(); }); }, false, 'k 是負的就反向，|k| ＞ 1 變長、|k| ＜ 1 變短；k·a ＝ (kx, ky)');
      upd(); st.append(P.hint('k 拉成負的、很大的、很小的。')); api.lock('把 k 拉成負的、大於 1 的、小於 1 的');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* 關 1、關 3：拖 b 的終點，讓結果落在目標（放開才算數） */
      function dragTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { mode: cfg.mode, a: cfg.a, b: cfg.b0, fixedA: true, target: cfg.target, sm: true, xr: [-4, 4], yr: [-3, 3], onSettle: function (A, B, r, pl) {
            if (r[0] === cfg.target[0] && r[1] === cfg.target[1] && !fin) { fin = true; pl.b.goalMark([pl.X(B[0]), pl.Y(B[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '算算看')); done(); } } });
          setSolve(function () { sc.setB(cfg.ans[0], cfg.ans[1]); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      /* 關 2：用 s、t 兩個滑桿湊出目標 */
      function comboTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: 'a ＝ (2, 1)、b ＝ (1, 2)。拉動 <b>s</b>、<b>t</b>，讓 <b>s·a ＋ t·b</b> 的終點剛好落在橘色的目標 (3, 0)。' }));
        var pl = PV.plane(b0, true), b = pl.b, s = 1, t = 1, fin = false, tg = [3, 0];
        var ta = PV.arrow(pl, CA, null, { dash: true, w: 3 }), tb = PV.arrow(pl, CB, null, { dash: true, w: 3 }), res = PV.arrow(pl, CR, null, { w: 6 }), A0 = PV.arrow(pl, CA, null, { w: 3 }), B0 = PV.arrow(pl, CB, null, { w: 3 });
        A0.set([0, 0], [2, 1]); B0.set([0, 0], [1, 2]); b.dot([pl.X(3), pl.Y(0)], 'pl-dot pl-dot--amber', pl.gC, 0.24); b.text([pl.X(3) + 0.95, pl.Y(0) - 0.55], '目標', 'pl-text pl-text--sm pl-text--amber', pl.gC);
        var pS = P.pill('', 'is-blue'), pR = P.pill('', 'is-green'); pR.style.whiteSpace = 'normal'; b0.append(h('div', { class: 'pl-readout' }, pS), h('div', { class: 'pl-readout' }, pR));
        function upd() { var P1 = [2 * s, 1 * s], R = [P1[0] + t, P1[1] + 2 * t]; ta.set([0, 0], P1); tb.set(P1, R); res.set([0, 0], R); pS.textContent = 's ＝ ' + f(s) + '，t ＝ ' + f(t); var ok = R[0] === tg[0] && R[1] === tg[1]; pR.textContent = 's·a ＋ t·b ＝ ' + vs(P1[0], P1[1]) + ' ＋ ' + vs(t, 2 * t) + ' ＝ ' + vs(R[0], R[1]); pR.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-green'); }
        function settle() { if (2 * s + t === 3 && s + 2 * t === 0 && !fin) { fin = true; b.goalMark([pl.X(3), pl.Y(0)]); P.toast('s ＝ 2、t ＝ −1'); b0.append(P.ruleBox('s·a ＋ t·b ＝ (2s ＋ t, s ＋ 2t)。要得到 (3, 0)：2s ＋ t ＝ 3、s ＋ 2t ＝ 0，解出 <b>s ＝ 2、t ＝ −1</b>：2a − b ＝ (4 − 1, 2 − 2) ＝ (3, 0)。係數可以是負的。', '湊出來了')); done(); } }
        var ss = P.slider(-2, 3, 1, function (v) { s = v; upd(); }, 1), st2 = P.slider(-2, 3, 1, function (v) { t = v; upd(); }, 1);
        ss.addEventListener('change', settle); st2.addEventListener('change', settle);
        b0.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, 's（a 的倍數）：−2 到 3')), ss, h('div', { class: 'pl-slider-lab' }, h('span', {}, 't（b 的倍數）：−2 到 3')), st2);
        setSolve(function () { ss.value = 2; st2.value = -1; s = 2; t = -1; upd(); settle(); }, 's ＝ 2、t ＝ −1（2a − b ＝ (4−1, 2−2) ＝ (3, 0)）'); upd(); b0.append(P.hint('先看 x 座標：2s ＋ t ＝ 3；再看 y 座標 s ＋ 2t ＝ 0。t 可以是負的。'));
      }
      var tasks = [
        dragTask({ prompt: 'a ＝ (2, 1)（藍色，固定）。拖動 <b>b</b> 的終點，讓 <b>a ＋ b</b> 的終點剛好落在橘色目標 (5, 4)。', mode: 'add', a: [2, 1], b0: [1, 1], target: [5, 4], ans: [3, 3], answer: 'b ＝ (3, 3)（a ＋ b ＝ (2＋3, 1＋3) ＝ (5, 4)）', msg: 'b ＝ (3, 3)：a＋b ＝ (5, 4)', rule: 'a ＋ b ＝ (5, 4)，所以 b ＝ (5, 4) − (2, 1) ＝ <b>(3, 3)</b>：目標減掉 a。', hint: '目標的 x 座標是 5，a 的 x 座標是 2，b 的 x 座標要多少？' }),
        comboTask,
        dragTask({ prompt: 'a ＝ (4, 2)（藍色，固定）。拖動 <b>b</b> 的終點，讓 <b>a − b</b>（淡綠色虛線，平移到原點的樣子）的終點落在橘色目標 (1, 3)。', mode: 'sub', a: [4, 2], b0: [1, 1], target: [1, 3], ans: [3, -1], answer: 'b ＝ (3, −1)（a − b ＝ (4−3, 2−(−1)) ＝ (1, 3)）', msg: 'b ＝ (3, −1)：a−b ＝ (1, 3)', rule: 'a − b ＝ (1, 3)，所以 b ＝ a − (1, 3) ＝ (4 − 1, 2 − 3) ＝ <b>(3, −1)</b>。', hint: 'a − b ＝ 目標，那 b ＝ a − 目標。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'vec-addsub' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'vec-addsub', moduleName: '向量的加、減與係數積', askAbout: '向量的加減與係數積', aha: '<b>加法頭尾相接</b>，座標各自相加；<b>a − b 是從 b 的終點指向 a 的終點</b>；<b>k·a 和 a 在同一條線上</b>，k 為負就反向。',
        cards: [{ text: 'a ＋ b ＝ (x₁＋x₂, y₁＋y₂)；a − b ＝ (x₁−x₂, y₁−y₂)；k·a ＝ (kx₁, ky₁)', src: '高中：平面向量的運算' }, { text: 'a − b 是從 b 的終點指向 a 的終點；k·a 與 a 平行，k ＜ 0 時反向', src: '向量的幾何意義' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '線性組合與基底<br>分點公式' }, { at: 0.85, label: '向量與幾何證明' }] },
        teasers: [{ title: '線性組合', q: '任何一個向量都能寫成 s·a ＋ t·b 嗎？a、b 要滿足什麼條件？', where: 'S111 CH2 指對數函數 07＋平面向量（2025 年 11 月，第 16 堂）', lv: 'L2' }],
        parent: { pitfall: '孩子常把 a − b 的方向畫反（變成從 a 指向 b）；k 為負數時忘了反向；加法只記座標、不會看箭頭。', place: '高中平面向量的第一步，是內積、平行與垂直的基礎。', ask: ['a − b 的箭頭從哪裡指向哪裡？', 'k 是負的時候，k·a 和 a 有什麼關係？', 'a ＝ (2, 1)、b ＝ (3, 3)，a ＋ b 是多少？'] },
        classes: ['S111（第 16 堂，2025 年 11 月）：CH2 指對數函數 07＋平面向量'], next: { href: 'play-vec-dot.html', text: '下一個：內積與投影' } });
    }];
  new P.Lesson({ id: 'vec-addsub', title: '向量的加、減與係數積', steps: steps });
})();
