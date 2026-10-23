/* 獵豹玩中學｜一元一次不等式：蹺蹺板與數線
   預測＋蹺蹺板（砝碼與氣球）看乘負數為什麼要反向 → 在數線上拖 x 找出 −2x＋3 ≥ 7 的解集合 → 3 個操作關卡
   （3x−5＜7、−2x＋3≥7、x 消失的兩題：恆成立／無解）。
   要擊中的迷思：兩邊乘（除）以負數忘了反向、解集合的方向與空心實心、x 消失時不知道答案是「全部」還是「無解」。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PN = window.PN, f = PN.fmt;
  var FLIP = { '＜': '＞', '＞': '＜', '≤': '≥', '≥': '≤' };
  var NV = -5, NX = 5;   /* 解集合的數線範圍 */
  function cmp(l, r) { return l < r ? '＜' : l > r ? '＞' : '＝'; }
  function btn(text, fn) { var b = h('button', { type: 'button', class: 'button button--secondary pl-small' }, text); b.addEventListener('click', fn); return b; }

  /* ---------- 蹺蹺板：正數是砝碼（往下壓），負數是氣球（往上拉） ---------- */
  function seesaw(host, L0, R0, onOp) {
    var b = PA.board(host, 12, 8.6), g = h('g'), PX = 6, PY = 4.3, HL = 4.2, NA = 1.1, L = L0, R = R0, phi = 0, target = 0, anim = false;
    b.gMid.append(g);
    b.poly([[PX - 0.8, PY - 1.5], [PX + 0.8, PY - 1.5], [PX, PY - 0.1]], 'pl-poly', g);
    var beam = b.line([PX - HL, PY], [PX + HL, PY], 'pl-line pl-line--bold', g);
    var it = [0, 1].map(function () {
      var o = { rect: h('rect', { rx: 0.12, fill: 'rgba(47,111,220,.3)', stroke: '#2f6fdc', 'stroke-width': 0.07 }), ball: h('circle', { fill: 'rgba(214,51,108,.28)', stroke: '#d6336c', 'stroke-width': 0.07 }), str: b.line([0, 0], [0, 1], 'pl-line pl-line--pink pl-line--thin', g) };
      g.append(o.rect, o.ball); o.txt = b.text([0, 0], '', 'pl-text', g); return o;
    });
    var ax = PN.axis(b, { vmin: -16, vmax: 16, y: NA, labelGap: 0.9, labelEvery: 4 }), X = ax.X, gN = h('g'); b.gMid.append(gN);
    var dL = b.dot([X(L), NA], 'pl-dot pl-dot--pink', gN, 0.2), dR = b.dot([X(R), NA], 'pl-dot pl-dot--blue', gN, 0.2);
    var tL = b.text([X(L), NA + 0.75], '左', 'pl-text pl-text--sm pl-text--pink', gN), tR = b.text([X(R), NA + 0.75], '右', 'pl-text pl-text--sm pl-text--blue', gN);
    var pS = P.pill('', 'is-blue'); pS.style.fontSize = '1.3em'; host.append(h('div', { class: 'pl-readout' }, pS));
    function side(o, v, e) {
      var s = 0.8 + Math.min(Math.abs(v), 16) * 0.02;
      if (v >= 0) {
        var hgt = v === 0 ? 0.55 : 1.0 * s, w = 1.2 * s; o.rect.style.display = ''; o.ball.style.display = 'none'; o.str.style.display = 'none';
        o.rect.setAttribute('x', e[0] - w / 2); o.rect.setAttribute('y', b.Y(e[1] + 0.1 + hgt)); o.rect.setAttribute('width', w); o.rect.setAttribute('height', hgt);
        b.setText(o.txt, [e[0], e[1] + 0.1 + hgt / 2 - 0.17], f(v));
      } else {
        var r = 0.62 * s, cy = e[1] + 1.9; o.rect.style.display = 'none'; o.ball.style.display = ''; o.ball.setAttribute('cx', e[0]); o.ball.setAttribute('cy', b.Y(cy)); o.ball.setAttribute('r', r);
        b.setLine(o.str, [e[0], e[1]], [e[0], cy - r]); o.str.style.display = ''; b.setText(o.txt, [e[0], cy - 0.17], f(v));
      }
    }
    function draw() {
      var c = Math.cos(phi), s = Math.sin(phi), e0 = [PX - HL * c, PY + HL * s], e1 = [PX + HL * c, PY - HL * s];
      b.setLine(beam, e0, e1); side(it[0], L, e0); side(it[1], R, e1);
      dL.setAttribute('cx', X(L)); dR.setAttribute('cx', X(R)); b.setText(tL, [X(L), NA + 0.75]); b.setText(tR, [X(R), NA + 0.75]);
      pS.textContent = f(L) + ' ' + cmp(L, R) + ' ' + f(R);
    }
    function go() { if (anim) return; anim = true; P.run(function (dt) { var d = target - phi; if (Math.abs(d) < 0.002) { phi = target; draw(); anim = false; return false; } phi += d * Math.min(1, dt * 9); draw(); }); }
    function setVals(l, r) { L = l; R = r; target = Math.max(-1, Math.min(1, (R - L) / 6)) * 0.31; go(); draw(); }
    var api = { apply: function (op) {
      var nl = op.fn(L), nr = op.fn(R); if (Math.abs(nl) > 16 || Math.abs(nr) > 16) { P.toast('數字太大了，按「重來」'); return; }
      var before = cmp(L, R); setVals(nl, nr); if (cmp(L, R) !== before) P.pop(pS, 0.6); if (onOp) onOp(op.cat);
    }, reset: function () { setVals(L0, R0); } };
    setVals(L0, R0); phi = target; draw();
    return api;
  }

  /* ---------- 解集合：在數線上畫出（空心＝不含邊界） ---------- */
  function solSet(S) {
    var m = S.a - S.c, n = S.d - S.b, less = S.s === '＜' || S.s === '≤', closed = S.s === '≤' || S.s === '≥';
    if (m === 0) { var t = S.s === '＜' ? 0 < n : S.s === '≤' ? 0 <= n : S.s === '＞' ? 0 > n : 0 >= n; return { kind: t ? 'all' : 'none' }; }
    return { kind: 'ray', bnd: n / m, less: m > 0 ? less : !less, closed: closed };
  }
  function drawSet(b, X, ay, set) {
    var x0 = X(NV) - 0.5, x1 = X(NX) + 0.5, g = h('g'); b.gMid.append(g);
    if (set.kind === 'all') { g.append(h('rect', { x: x0, y: b.Y(ay) - 0.32, width: x1 - x0, height: 0.64, fill: 'rgba(31,157,85,.35)' })); b.text([6, ay + 1.0], '全部實數', 'pl-text pl-text--green', g); return; }
    if (set.kind === 'none') { b.text([6, ay + 1.0], '沒有任何 x 成立（無解）', 'pl-text pl-text--pink', g); return; }
    var xb = X(set.bnd), xa = set.less ? x0 : xb, xe = set.less ? xb : x1;
    g.append(h('rect', { x: xa, y: b.Y(ay) - 0.32, width: xe - xa, height: 0.64, fill: 'rgba(31,157,85,.35)' }));
    g.append(h('circle', { cx: xb, cy: b.Y(ay), r: 0.26, fill: set.closed ? '#1f9d55' : '#fff', stroke: '#1f9d55', 'stroke-width': 0.12 }));
    b.text([xb + (set.less ? -1.4 : 1.4), ay + 0.95], 'x ' + (set.less ? (set.closed ? '≤' : '＜') : (set.closed ? '≥' : '＞')) + ' ' + f(set.bnd), 'pl-text pl-text--green', g);
  }

  /* ---------- 化簡關卡：兩邊做一樣的事，把 x 變成單獨一個 ---------- */
  function lin(a, b) { if (a === 0) return f(b); var ax = a === 1 ? 'x' : a === -1 ? '−x' : f(a) + 'x'; return b === 0 ? ax : ax + (b > 0 ? ' ＋ ' + b : ' − ' + (-b)); }
  function show(S) { return lin(S.a, S.b) + ' ' + S.s + ' ' + lin(S.c, S.d); }
  function opLabel(o) {
    if (o.t === 'add') return '兩邊 ' + (o.k > 0 ? '＋' : '−') + Math.abs(o.k);
    if (o.t === 'addx') return '兩邊 ' + (o.k > 0 ? '＋' : '−') + (Math.abs(o.k) === 1 ? '' : Math.abs(o.k)) + 'x';
    return '兩邊 ' + (o.t === 'mul' ? '×' : '÷') + (o.k < 0 ? '(' + f(o.k) + ')' : o.k);
  }
  function applyOp(S, o) {
    var n = { a: S.a, b: S.b, c: S.c, d: S.d, s: S.s }, ks = ['a', 'b', 'c', 'd'];
    if (o.t === 'add') { n.b += o.k; n.d += o.k; } else if (o.t === 'addx') { n.a += o.k; n.c += o.k; }
    else if (o.t === 'mul') { ks.forEach(function (k) { n[k] *= o.k; }); if (o.k < 0) n.s = FLIP[n.s]; }
    else { if (ks.some(function (k) { return n[k] % o.k !== 0; })) return null; ks.forEach(function (k) { n[k] /= o.k; }); if (o.k < 0) n.s = FLIP[n.s]; }
    ks.forEach(function (k) { n[k] = n[k] + 0; if (n[k] === 0) n[k] = 0; });
    return n;
  }
  function finished(S) { return (S.a === 1 && S.b === 0 && S.c === 0) || (S.a === 0 && S.c === 0); }

  function puzzle(host, cfg, onFinish, setSolve) {
    host.append(h('div', { class: 'pl-q', html: cfg.prompt }));
    var S0 = cfg.start, S = S0, expr = P.pill('', 'is-blue'), btns = [], log = h('div', {}), reveal = h('div', {}), done = false;
    expr.style.fontSize = '1.35em'; expr.style.whiteSpace = 'normal';
    var row = h('div', { class: 'pl-row pl-row--center' }); row.style.flexWrap = 'wrap';
    function refresh() { expr.textContent = show(S); btns.forEach(function (x) { x.el.disabled = done || applyOp(S, x.o) === null; }); }
    function doOp(i) {
      if (done) return; var o = cfg.ops[i], n = applyOp(S, o); if (!n) return;
      var flipped = n.s !== S.s; S = n;
      log.append(h('div', { class: 'pl-hint', html: opLabel(o) + '：<b>' + show(S) + '</b>' + (flipped ? ' <b style="color:#d6336c">← 乘（除）以負數，不等號反向！</b>' : '') }));
      refresh();
      if (finished(S)) {
        done = true; refresh(); var set = solSet(S0), b = PA.board(reveal, 12, 4.6, 'pl-svg--sm'), ax = PN.axis(b, { vmin: NV, vmax: NX, y: 1.6, labelGap: 0.95 });
        drawSet(b, ax.X, 1.6, set); reveal.append(P.ruleBox(cfg.rule, cfg.ruleLabel || '結果'));
        P.toast(cfg.msg); onFinish();
      }
    }
    function reset() { if (done) return; S = S0; log.innerHTML = ''; refresh(); }
    cfg.ops.forEach(function (o, i) { var e = btn(opLabel(o), function () { doOp(i); }); btns.push({ el: e, o: o }); row.append(e); });
    host.append(expr, row, log); PA.resetBtn(host, '回到最初', reset); host.append(reveal);
    refresh();
    setSolve(function () { reset(); cfg.solve.forEach(function (i) { doOp(i); }); });
    host.append(P.hint(cfg.hint));
  }

  var steps = [
    /* 1. 預測＋蹺蹺板 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, ss;
      P.choice(st, api, { id: 'li-p1', predict: true, label: '先猜猜看', prompt: '<b>3 ＜ 5</b>。兩邊同時乘 <b>−1</b> 之後，<b>−3</b> 和 <b>−5</b> 誰比較大？', row: true, options: [{ t: '−3 ＜ −5' }, { t: '−3 ＞ −5' }, { t: '一樣大' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('試試加、減、乘正數、乘負數'); } });
      st.append(P.instr('蹺蹺板左右兩邊各放一個數：<b>正數是砝碼</b>（往下壓），<b>負數是氣球</b>（往上拉）。按下面的按鈕，<b>兩邊同時</b>做一樣的事，看蹺蹺板怎麼動。'));
      var ops = [{ t: '＋3', fn: function (v) { return v + 3; }, cat: 'add' }, { t: '−3', fn: function (v) { return v - 3; }, cat: 'add' }, { t: '×2', fn: function (v) { return v * 2; }, cat: 'pos' }, { t: '×(−1)', fn: function (v) { return -v; }, cat: 'neg' }];
      ss = seesaw(st, 3, 5, function (cat) {
        if (gate.on) return; seen[cat] = 1;
        if (seen.add && seen.pos && seen.neg && !done) {
          done = true; P.track('aha', { id: 'linear-ineq', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：−3 ＞ −5');
          st.append(P.ruleBox('兩邊同時<b>加、減、乘（除）正數</b>：蹺蹺板傾斜的方向<b>不變</b>，不等號不變。<br>兩邊同時<b>乘（除）負數</b>：砝碼變氣球、氣球變砝碼，蹺蹺板<b>翻過來</b>，不等號要<b>反向</b>。', '乘負數要反向'));
          api.unlock('乘負數，蹺蹺板翻過來');
        }
      });
      var row = h('div', { class: 'pl-row pl-row--center' }); row.style.flexWrap = 'wrap';
      ops.forEach(function (o) { row.append(btn('兩邊 ' + o.t, function () { if (gate.on) { P.toast('先做上面的預測'); return; } ss.apply(o); })); });
      st.append(row, PA.resetBtn(st, '重來', function () { ss.reset(); }));
      api.solve(function () { gate.on = false; ss.apply(ops[0]); ss.apply(ops[2]); ss.apply(ops[3]); });
      st.append(P.hint('每種按鈕都試試看：加、減、乘 2、乘 −1。')); api.lock('先做上面的預測');
    },
    /* 2. 在數線上找出 −2x＋3 ≥ 7 的解集合 */
    function (st, api) {
      var seen = {}, done = false, xv = 3, VALS = []; for (var q = NV; q <= NX; q++) VALS.push(q);
      st.append(P.instr('不等式 <b>−2x ＋ 3 ≥ 7</b>。拖動 <b>x</b>，每到一個位置就代進去試試看，成立的位置會留下<b>綠點</b>，不成立的留下<b>粉紅點</b>。'));
      var b = PA.board(st, 12, 6.2), AY = 2.0, gM = h('g'), gS = h('g'); b.gMid.append(gS); var ax = PN.axis(b, { vmin: NV, vmax: NX, y: AY, labelGap: 1.25 }), X = ax.X; b.gMid.append(gM);
      var tx = b.text([X(xv), AY + 0.95], 'x', 'pl-text pl-text--blue', gM);
      var pV = P.pill('', 'is-amber'), pT = P.pill('', 'is-pink'); st.append(h('div', { class: 'pl-readout' }, pV, pT));
      function upd() {
        var val = -2 * xv + 3, ok = val >= 7; b.setText(tx, [X(xv), AY + 0.95], 'x');
        pV.textContent = '−2x ＋ 3 ＝ ' + f(val); pT.textContent = f(val) + ' ≥ 7 ？ ' + (ok ? '成立' : '不成立'); pT.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-pink');
        if (!seen[xv]) { seen[xv] = ok ? 'y' : 'n'; gM.append(h('circle', { cx: X(xv), cy: b.Y(AY + 1.7), r: 0.15, fill: ok ? '#1f9d55' : '#d6336c' })); }
        if (seen[-3] === 'y' && seen[-2] === 'y' && seen[-1] === 'n' && !done) {
          done = true; P.track('aha', { id: 'linear-ineq', step: 2 });
          gS.append(h('rect', { x: X(NV) - 0.5, y: b.Y(AY) - 0.32, width: X(-2) - X(NV) + 0.5, height: 0.64, fill: 'rgba(31,157,85,.35)' }), h('circle', { cx: X(-2), cy: b.Y(AY), r: 0.26, fill: '#1f9d55', stroke: '#1f9d55', 'stroke-width': 0.12 }));
          st.append(P.ruleBox('成立的 x 是 <b>x ≤ −2</b>：綠點都在 −2 的<b>左邊</b>（包含 −2，所以是<b>實心點</b>）。<br>x 越大，−2x ＋ 3 反而越小，所以方向和直覺相反。', '解集合'));
          api.unlock('x ≤ −2');
        }
      }
      var hd = b.handle({ pos: [X(xv), AY], candidates: VALS.map(function (v) { return [X(v), AY]; }), onMove: function (t) { xv = Math.round(ax.V(t[0])); upd(); } });
      upd();
      api.solve(function () { hd.moveTo([X(-3), AY]); hd.moveTo([X(-2), AY]); hd.moveTo([X(-1), AY]); });
      st.append(P.hint('把 x 拖到左邊、右邊，看看綠點出現在哪一側。')); api.lock('找出成立的範圍');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfgs) {
        return function (b0, done, setSolve) {
          var i = 0;
          function mount() {
            var host = h('div', {}); b0.append(host);
            puzzle(host, cfgs[i], function () {
              if (i + 1 < cfgs.length) { i++; P.later(function () { b0.innerHTML = ''; b0.append(h('div', { class: 'pl-label' }, '同一關的第 ' + (i + 1) + ' 題')); mount(); }); } else done();
            }, setSolve);
          }
          mount();
        };
      }
      var A = function (k) { return { t: 'add', k: k }; }, AX = function (k) { return { t: 'addx', k: k }; }, M = function (k) { return { t: 'mul', k: k }; }, D = function (k) { return { t: 'div', k: k }; };
      var tasks = [
        task([{ prompt: '把 <b>3x − 5 ＜ 7</b> 一步一步化成 <b>x ＜ 數字</b>（讓 x 單獨在左邊）。兩邊一定要做<b>一樣的事</b>。', start: { a: 3, b: -5, c: 0, d: 7, s: '＜' }, ops: [A(5), A(-5), D(3), M(2), AX(-1)], solve: [0, 2],
          msg: '解：x ＜ 4', rule: '兩邊同加、同除以<b>正數</b>，不等號方向不變。解是 <b>x ＜ 4</b>，數線上 4 是<b>空心點</b>（不含 4）。', hint: '先把 −5 處理掉，再處理 x 前面的 3。' }]),
        task([{ prompt: '把 <b>−2x ＋ 3 ≥ 7</b> 化成 <b>x ≤ 數字</b>。小心：有一步會讓不等號變方向。', start: { a: -2, b: 3, c: 0, d: 7, s: '≥' }, ops: [A(-3), A(3), D(-2), D(2), M(-1)], solve: [0, 2],
          msg: '解：x ≤ −2', ruleLabel: '反向', rule: '兩邊同除以<b>負數</b>，不等號<b>反向</b>：−2x ≥ 4 變成 x ≤ −2。和上一步在數線上找到的一樣！', hint: '想想蹺蹺板：什麼時候會翻過來？' }]),
        task([
          { prompt: '把 <b>x ＋ 3 ＞ x ＋ 1</b> 一直化簡，看看 x 會怎麼樣。', start: { a: 1, b: 3, c: 1, d: 1, s: '＞' }, ops: [AX(-1), AX(1), A(-1), A(-3), M(2)], solve: [0],
            msg: '3 ＞ 1 恆成立', ruleLabel: 'x 不見了', rule: 'x 消失後剩下 <b>3 ＞ 1</b>，這是<b>對的</b>，所以不管 x 是多少都成立：<b>全部實數</b>。', hint: '兩邊都有 x，把 x 去掉試試。' },
          { prompt: '再來：把 <b>2x ＋ 3 ＜ 2x − 1</b> 化簡。', start: { a: 2, b: 3, c: 2, d: -1, s: '＜' }, ops: [AX(-2), AX(-1), A(-3), A(1), D(2)], solve: [0],
            msg: '3 ＜ −1 不可能', ruleLabel: 'x 不見了', rule: 'x 消失後剩下 <b>3 ＜ −1</b>，這是<b>錯的</b>，所以沒有任何 x 能讓它成立：<b>無解</b>。', hint: '兩邊都有 2x，把它去掉。' }])];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'linear-ineq' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'linear-ineq', moduleName: '一元一次不等式：蹺蹺板與數線', askAbout: '國中一元一次不等式', aha: '兩邊同時加、減、乘（除）<b>正數</b>，不等號不變；乘（除）<b>負數</b>，蹺蹺板翻過來，不等號要<b>反向</b>。<br>解集合用數線畫：空心不含邊界、實心含邊界。',
        cards: [{ text: '不等式兩邊同加、同減、同乘（除）正數，不等號不變；同乘（除）負數，不等號反向', src: '國中一元一次不等式' }, { text: '解集合在數線上：＜、＞ 用空心點；≤、≥ 用實心點。x 消失時，看剩下的式子對不對：對就是全部實數，錯就是無解', src: '國中一元一次不等式' }],
        depth: { here: 0.15, cheetah: [{ at: 0.4, label: '含絕對值的不等式<br>聯立不等式' }, { at: 0.8, label: '二次不等式<br>線性規劃' }] },
        teasers: [{ title: '含參數的不等式', q: 'ax ＞ b 的解，會因為 a 是正、負、零而不同。a 分別是多少時是「全部實數」或「無解」？', where: 'J72A 第 10～14 堂（2026 年 3～4 月）：CH4 不等式', lv: 'L2' }, { title: '聯立不等式與不等式應用', q: '同時滿足兩個不等式的 x 範圍是什麼？怎麼用數線找出重疊的部分？', where: 'J72S 第 9～12 堂（2026 年 3 月）：CH8 一元一次不等式', lv: 'L2' }],
        parent: { pitfall: '孩子最常忘記「乘或除以負數，不等號要反向」；也常把空心點、實心點用反，或在 x 消失後（例如 3 ＞ 1）不知道答案是「全部實數」還是「無解」。', place: '國中二年級「一元一次不等式」，也是高中二次不等式、線性規劃的基礎。', ask: ['−3 和 −5 誰比較大？為什麼乘 −1 之後大小會反過來？', '解 −2x ＞ 6，為什麼答案是 x ＜ −3，不是 x ＞ −3？', 'x ＋ 3 ＞ x ＋ 1，x 可以是多少？為什麼？'] },
        classes: ['J72A（第 10～14 堂，2026 年 3～4 月）：CH4 不等式', 'J72S（第 9～12 堂，2026 年 3 月）：CH8 一元一次不等式'] });
    }];
  new P.Lesson({ id: 'linear-ineq', title: '一元一次不等式：蹺蹺板與數線', steps: steps });
})();
