/* 獵豹玩中學｜圓周角與圓心角
   圓心 O＝(6,6)、半徑 4.5。點的位置都用「角度」表示（每 5° 或 10° 一格），所以圓心角、圓周角都是整數度。 */
(function () {
  var P = Play, h = P.h, rad = Math.PI / 180, O = [6, 6], R = 4.5;
  function polar(d, r) { r = r === undefined ? R : r; return [O[0] + r * Math.cos(d * rad), O[1] + r * Math.sin(d * rad)]; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  function dirTo(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]) / rad; }
  function shortest(d1, d2) { return ((d2 - d1 + 540) % 360) - 180; }
  /* 角的小扇形：頂點 V、從方向 d1 轉過 d（沒給 d 就取較短的那一邊） */
  function wedge(V, d1, d2, r, d) {
    if (d === undefined) d = shortest(d1, d2); var pts = [V], i;
    for (i = 0; i <= 24; i++) { var a = (d1 + d * i / 24) * rad; pts.push([V[0] + r * Math.cos(a), V[1] + r * Math.sin(a)]); }
    return { pts: pts, bis: d1 + d / 2, val: Math.abs(d) };
  }
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function newBoard(host, cls) { var b = new P.Board(host, { w: 12, h: 12, cls: cls }); b.circle(O, R, 'pl-circle pl-circle--unit'); b.dot(O, 'pl-dot', null, 0.14); b.text([O[0] - 0.45, O[1] - 0.55], 'O', 'pl-text'); return b; }
  function ring(from, to, step) { var out = [], d; for (d = from; d <= to; d += step) out.push(polar(d)); return out; }
  var A_ANG = 230;

  /* 小測驗用的圓：點 {名字: 角度}、連線 [[名字,名字,樣式]]、文字 [[位置,字,樣式]] */
  function qfig(box, pts, lines, texts) {
    var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = newBoard(host, 'pl-svg--sm');
    (lines || []).forEach(function (l) { var p = l[0] === 'O' ? O : polar(pts[l[0]]), q = l[1] === 'O' ? O : polar(pts[l[1]]); b.line(p, q, 'pl-line ' + (l[2] || '')); });
    Object.keys(pts).forEach(function (k) { var p = polar(pts[k]), o = polar(pts[k], R + 0.75); b.dot(p, 'pl-dot pl-dot--blue', null, 0.17); b.text([o[0], o[1] - 0.2], k, 'pl-text pl-text--lg'); });
    (texts || []).forEach(function (t) { b.text(t[0], t[1], 'pl-text pl-text--lg ' + (t[2] || '')); });
    return b;
  }

  var steps = [
    /* 1. 預測＋拖動 P：圓周角不變 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false;
      P.choice(st, api, { id: 'ca-p1', predict: true, label: '先猜猜看', prompt: 'A、B 固定。點 P 在圓上<b>繞一圈</b>，圓周角 ∠APB 會…？', row: true, options: [{ t: '越來越大' }, { t: '越來越小' }, { t: '一直不變' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 P，繞圓一圈'); } });
      var host = stage(st), board = newBoard(host), A = polar(A_ANG), B = polar(A_ANG + 80);
      var pa = board.line(A, A, 'pl-line pl-line--blue'), pb = board.line(A, A, 'pl-line pl-line--blue'), oa = board.line(O, A, 'pl-line pl-line--pink pl-line--dash'), ob = board.line(O, B, 'pl-line pl-line--pink pl-line--dash');
      var wo = board.poly(wedge(O, A_ANG, 0, 1.5, 80).pts, 'pl-poly pl-poly--pink'), wp = board.poly([O, O, O], 'pl-poly pl-poly--blue');
      board.dot(A, 'pl-dot', null, 0.17); board.dot(B, 'pl-dot', null, 0.17); board.text([A[0] - 0.5, A[1] - 0.6], 'A', 'pl-text pl-text--lg'); board.text([B[0] + 0.5, B[1] - 0.6], 'B', 'pl-text pl-text--lg');
      board.text(polar(A_ANG + 40, 2.3), '80°', 'pl-text pl-text--pink pl-text--lg');
      var tp = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg'), tl = board.text([0, 0], 'P', 'pl-text pl-text--lg');
      var q1 = P.pill('', 'is-blue'), q2 = P.pill('圓心角 ∠AOB ＝ 80°', 'is-pink'), ro = h('div', { class: 'pl-readout' }, q1, q2);
      var cand = ring(A_ANG + 85, A_ANG + 355, 5);
      function draw(p) {
        var d = dirTo(p, A), e = dirTo(p, B), w = wedge(p, d, e, 1.3), a = norm(dirTo(O, p));
        board.setLine(pa, p, A); board.setLine(pb, p, B); board.setPoly(wp, w.pts);
        board.setText(tp, [p[0] + 1.9 * Math.cos(w.bis * rad), p[1] + 1.9 * Math.sin(w.bis * rad) - 0.2], Math.round(w.val) + '°'); board.setText(tl, [p[0] + 0.6 * Math.cos(dirTo(O, p) * rad), p[1] + 0.6 * Math.sin(dirTo(O, p) * rad) - 0.2]);
        q1.textContent = '圓周角 ∠APB ＝ ' + Math.round(w.val) + '°'; return Math.round(a / 5);
      }
      var hd = board.handle({ pos: polar(90), candidates: cand, disabled: function () { return gate.on; }, onMove: function (t) { var k = draw(t); if (!seen[k]) { seen[k] = 1; n++; } if (n >= 5 && !done) { done = true; P.track('aha', { id: 'circle-angles', step: 1 }); P.toast(api.ctx.p1 === 2 ? '你猜對了！' : '圓周角真的沒有變'); st.append(P.ruleBox('A、B 不動，P 在圓上<b>怎麼跑</b>，圓周角 ∠APB 都是 <b>40°</b>：同一條弧所對的圓周角<b>都相等</b>。<br>而且圓心角 80° ＝ 圓周角 40° 的 <b>2 倍</b>。', '性質')); api.unlock('圓周角永遠不變！'); } } });
      api.solve(function () { gate.on = false; [polar(60), polar(120), polar(160), polar(20), polar(75)].forEach(hd.moveTo); });
      draw(polar(90)); st.append(ro, P.hint('粉紅是圓心角（看弧的中心），藍色是圓周角（從圓上的點 P 看同一條弧）。'));
      api.lock('先做上面的預測');
    },
    /* 2. 拖動 B：弧越大，圓周角是圓心角的一半 */
    function (st, api) {
      st.append(P.instr('A 固定，拖動 <b>B</b> 改變弧 AB 的大小。看圓心角和圓周角的關係。'));
      var host = stage(st), board = newBoard(host), A = polar(A_ANG), seen = {}, n = 0, done = false;
      var wo = board.poly([O, O, O], 'pl-poly pl-poly--pink'), wp = board.poly([O, O, O], 'pl-poly pl-poly--blue');
      var oa = board.line(O, A, 'pl-line pl-line--pink pl-line--dash'), ob = board.line(O, O, 'pl-line pl-line--pink pl-line--dash'), pa = board.line(O, O, 'pl-line pl-line--blue'), pb = board.line(O, O, 'pl-line pl-line--blue');
      board.dot(A, 'pl-dot', null, 0.17); board.text([A[0] - 0.5, A[1] - 0.6], 'A', 'pl-text pl-text--lg'); var Pd = board.dot(O, 'pl-dot', null, 0.17), tP = board.text([0, 0], 'P', 'pl-text pl-text--lg'), tB = board.text([0, 0], 'B', 'pl-text pl-text--lg');
      var to = board.text([0, 0], '', 'pl-text pl-text--pink pl-text--lg'), tp = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg');
      var q1 = P.pill('', 'is-pink'), q2 = P.pill('', 'is-blue'), q3 = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, q1, q2, q3);
      function draw(bAng) {
        var th = norm(bAng - A_ANG), B = polar(bAng), pAng = bAng + (360 - th) / 2, p = polar(pAng), w = wedge(p, dirTo(p, A), dirTo(p, B), 1.3), wc = wedge(O, A_ANG, 0, 1.5, th);
        board.setPoly(wo, wc.pts); board.setPoly(wp, w.pts); board.setLine(ob, O, B); board.setLine(pa, p, A); board.setLine(pb, p, B);
        board.setText(tB, [polar(bAng, R + 0.75)[0], polar(bAng, R + 0.75)[1] - 0.2]); board.setText(tP, [p[0] + 0.6 * Math.cos(pAng * rad), p[1] + 0.6 * Math.sin(pAng * rad) - 0.2]);
        Pd.setAttribute('cx', p[0]); Pd.setAttribute('cy', board.Y(p[1]));
        board.setText(to, [polar(wc.bis, 2.6)[0], polar(wc.bis, 2.6)[1] - 0.2], th + '°'); board.setText(tp, [p[0] + 1.9 * Math.cos(w.bis * rad), p[1] + 1.9 * Math.sin(w.bis * rad) - 0.2], Math.round(w.val) + '°');
        q1.textContent = '圓心角 ∠AOB ＝ ' + th + '°'; q2.textContent = '圓周角 ∠APB ＝ ' + Math.round(w.val) + '°'; q3.textContent = th + ' ÷ 2 ＝ ' + Math.round(w.val);
        return th;
      }
      var cand = []; for (var d = 20; d <= 340; d += 10) cand.push(polar(A_ANG + d));
      var hd = board.handle({ pos: polar(A_ANG + 100), candidates: cand, onMove: function (t) { var th = draw(norm(dirTo(O, t))); if (!seen[th]) { seen[th] = 1; n++; } if (n >= 4 && !done) { done = true; P.track('aha', { id: 'circle-angles', step: 2 }); st.append(P.ruleBox('同一條弧所對的<b>圓周角</b>，永遠是<b>圓心角的一半</b>。<br>弧超過半圓時，圓周角就變成鈍角（例如圓心角 300° → 圓周角 150°）。', '性質')); api.unlock('圓周角 ＝ 圓心角 ÷ 2！'); } } });
      api.solve(function () { [A_ANG + 60, A_ANG + 140, A_ANG + 220, A_ANG + 300].forEach(function (a) { hd.moveTo(polar(a)); }); });
      draw(A_ANG + 100); st.append(ro, P.hint('提示：至少換 4 種弧的大小，也試試弧很大（超過半圓）時圓周角變成多少。')); api.lock('拖動 B，試 4 種弧');
    },
    /* 3. 直徑所對的圓周角是直角 */
    function (st, api) {
      var gate = { on: true }, done = false;
      P.choice(st, api, { id: 'ca-p3', predict: true, label: '先猜猜看', prompt: '如果 <b>AB 是直徑</b>（通過圓心），圓周角 ∠APB 會是幾度？', row: true, options: [{ t: '45°' }, { t: '90°' }, { t: '120°' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('把 B 拉到 A 的正對面'); } });
      var host = stage(st), board = newBoard(host), A = polar(A_ANG), ob = board.line(O, O, 'pl-line pl-line--pink pl-line--dash');
      var wp = board.poly([O, O, O], 'pl-poly pl-poly--blue'), pa = board.line(O, O, 'pl-line pl-line--blue'), pb = board.line(O, O, 'pl-line pl-line--blue'), ab = board.line(A, A, 'pl-line pl-line--green pl-line--bold');
      board.dot(A, 'pl-dot', null, 0.17); board.text([A[0] - 0.5, A[1] - 0.6], 'A', 'pl-text pl-text--lg'); var Pd = board.dot(O, 'pl-dot', null, 0.17), tB = board.text([0, 0], 'B', 'pl-text pl-text--lg'), tP = board.text([0, 0], 'P', 'pl-text pl-text--lg'), tp = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg');
      var q1 = P.pill('', 'is-blue'), q2 = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, q1, q2);
      function draw(bAng) {
        var th = norm(bAng - A_ANG), B = polar(bAng), pAng = bAng + (360 - th) / 2, p = polar(pAng), w = wedge(p, dirTo(p, A), dirTo(p, B), 1.3), dia = th === 180;
        board.setLine(ob, O, B); board.setLine(pa, p, A); board.setLine(pb, p, B); board.setPoly(wp, w.pts); board.setLine(ab, A, B); ab.style.opacity = dia ? 1 : 0;
        board.setText(tB, [polar(bAng, R + 0.75)[0], polar(bAng, R + 0.75)[1] - 0.2]); board.setText(tP, [p[0] + 0.6 * Math.cos(pAng * rad), p[1] + 0.6 * Math.sin(pAng * rad) - 0.2]); Pd.setAttribute('cx', p[0]); Pd.setAttribute('cy', board.Y(p[1]));
        board.setText(tp, [p[0] + 1.9 * Math.cos(w.bis * rad), p[1] + 1.9 * Math.sin(w.bis * rad) - 0.2], Math.round(w.val) + '°');
        q1.textContent = '圓周角 ∠APB ＝ ' + Math.round(w.val) + '°'; q2.className = 'pl-pill' + (dia ? ' is-ok' : ''); q2.textContent = dia ? '✓ AB 是直徑' : 'AB 還不是直徑'; return dia;
      }
      var cand = []; for (var d = 20; d <= 340; d += 10) cand.push(polar(A_ANG + d));
      var hd = board.handle({ pos: polar(A_ANG + 120), candidates: cand, disabled: function () { return gate.on; }, onMove: function (t) { if (draw(norm(dirTo(O, t))) && !done) { done = true; P.track('aha', { id: 'circle-angles', step: 3 }); P.toast(api.ctx.p3 === 1 ? '你猜對了！' : '剛好是直角'); st.append(P.ruleBox('<b>直徑</b>所對的圓周角是 <b>90°</b>（半圓的圓周角是直角）。<br>因為直徑是 180° 的圓心角，一半就是 90°。', '性質')); api.unlock('半圓所對的圓周角是直角！'); } } });
      api.solve(function () { gate.on = false; hd.moveTo(polar(A_ANG + 180)); });
      draw(A_ANG + 120); st.append(ro, P.hint('提示：直徑通過圓心 O，B 和 A 在圓心的兩側、成一直線。')); api.lock('先做上面的預測');
    },
    /* 4. 為什麼：等腰三角形＋外角 */
    function (st, api) {
      st.append(P.instr('為什麼是一半？先看最簡單的情形：<b>PB 是直徑</b>。按「＋」一步一步看。'));
      var host = stage(st), board = newBoard(host), Pa = 200, Ba = 20, Aa = 90, Pp = polar(Pa), Bp = polar(Ba), Ap = polar(Aa), x = Math.round(Math.abs(shortest(dirTo(Pp, O), dirTo(Pp, Ap)))), done = false;
      board.line(Pp, Bp, 'pl-line pl-line--blue'); board.line(Pp, Ap, 'pl-line pl-line--blue'); var oa = board.line(O, Ap, 'pl-line pl-line--pink');
      [Pp, Bp, Ap].forEach(function (p) { board.dot(p, 'pl-dot', null, 0.17); });
      board.text([Pp[0] - 0.6, Pp[1] - 0.1], 'P', 'pl-text pl-text--lg'); board.text([Bp[0] + 0.6, Bp[1] - 0.1], 'B', 'pl-text pl-text--lg'); board.text([Ap[0], Ap[1] + 0.7], 'A', 'pl-text pl-text--lg');
      var g1 = h('g'), g2 = h('g'), g3 = h('g'); board.gMid.append(g1, g2, g3);
      var m1 = [(Pp[0] + O[0]) / 2, (Pp[1] + O[1]) / 2], m2 = [(Ap[0] + O[0]) / 2, (Ap[1] + O[1]) / 2];
      g1.append(h('text', { x: m1[0] - 0.1, y: board.Y(m1[1]) + 0.9, class: 'pl-text pl-text--pink' }, 'r'), h('text', { x: m2[0] + 0.5, y: board.Y(m2[1]), class: 'pl-text pl-text--pink' }, 'r'));
      var wxp = wedge(Pp, dirTo(Pp, O), dirTo(Pp, Ap), 1.1), wxa = wedge(Ap, dirTo(Ap, O), dirTo(Ap, Pp), 1.1), woc = wedge(O, Ba, Aa, 1.4, shortest(Ba, Aa));
      g2.append(h('polygon', { points: board.pts(wxp.pts), class: 'pl-poly pl-poly--blue' }), h('polygon', { points: board.pts(wxa.pts), class: 'pl-poly pl-poly--blue' }), h('text', { x: Pp[0] + 2.0 * Math.cos(wxp.bis * rad), y: board.Y(Pp[1] + 2.0 * Math.sin(wxp.bis * rad)) + 0.2, class: 'pl-text pl-text--blue pl-text--lg' }, 'x'), h('text', { x: Ap[0] + 1.7 * Math.cos(wxa.bis * rad), y: board.Y(Ap[1] + 1.7 * Math.sin(wxa.bis * rad)) + 0.2, class: 'pl-text pl-text--blue pl-text--lg' }, 'x'));
      g3.append(h('polygon', { points: board.pts(woc.pts), class: 'pl-poly pl-poly--pink' }), h('text', { x: polar(woc.bis, 2.6)[0], y: board.Y(polar(woc.bis, 2.6)[1]) + 0.2, class: 'pl-text pl-text--pink pl-text--lg' }, '2x'));
      var note = h('div', { class: 'pl-fb is-good' }), TXT = ['<b>第 1 步</b>：OP、OA 都是<b>半徑</b>，所以 OP ＝ OA，△OPA 是<b>等腰三角形</b>。', '<b>第 2 步</b>：等腰三角形的兩個底角相等，把它們都叫 <b>x</b>（這裡 x ＝ ' + x + '°）。', '<b>第 3 步</b>：∠AOB 是△OPA 的<b>外角</b>，等於兩個不相鄰內角的和：x ＋ x ＝ <b>2x</b>。所以圓心角是圓周角的 2 倍。'];
      var sp = P.stepper('步驟', 1, 3, 1, function (v) { show(v); }, function (v) { return v + ' / 3'; });
      function show(v) { g1.style.display = v >= 1 ? '' : 'none'; g2.style.display = v >= 2 ? '' : 'none'; g3.style.display = v >= 3 ? '' : 'none'; note.innerHTML = TXT[v - 1]; if (v === 3 && !done) { done = true; P.track('aha', { id: 'circle-angles', step: 4 }); st.append(P.ruleBox('<b>圓周角 ＝ 圓心角的一半</b>，原因是：半徑相等 → 等腰三角形 → 外角 ＝ 兩個底角的和。<br>P 不在直徑上的情形，把它拆成兩個這樣的小情形就好。', '原因')); api.unlock('看懂原因了！'); } }
      api.solve(function () { sp.set(3); }); show(1); st.append(h('div', { class: 'pl-steprow' }, sp.el), note); api.lock('按「＋」看到第 3 步');
    },
    /* 5. 用用看 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      function head(i) { box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + i + ' / 4 題')); }
      var qs = [
        function () { head(1); qfig(box, { A: 220, B: 320, P: 90 }, [['O', 'A', 'pl-line--pink pl-line--dash'], ['O', 'B', 'pl-line--pink pl-line--dash'], ['P', 'A', 'pl-line--blue'], ['P', 'B', 'pl-line--blue']], [[[O[0], O[1] - 1.8], '100°', 'pl-text--pink']]);
          box.append(h('div', { class: 'pl-q', html: '圓心角 ∠AOB ＝ <b>100°</b>，圓周角 ∠APB ＝ ？' })); P.numBox(box, { answer: 50, unit: '°', okMsg: '對！圓周角是圓心角的一半：100° ÷ 2 ＝ 50°。', onOk: next, wrong: function (v) { return v === 200 ? '倒過來了：圓周角是圓心角的「一半」。' : '提示：圓周角 ＝ 圓心角 ÷ 2。'; } }); },
        function () { head(2); qfig(box, { A: 235, B: 305, P: 90 }, [['O', 'A', 'pl-line--pink pl-line--dash'], ['O', 'B', 'pl-line--pink pl-line--dash'], ['P', 'A', 'pl-line--blue'], ['P', 'B', 'pl-line--blue']], [[[6, 8.9], '35°', 'pl-text--blue']]);
          box.append(h('div', { class: 'pl-q', html: '圓周角 ∠APB ＝ <b>35°</b>，圓心角 ∠AOB ＝ ？' })); P.numBox(box, { answer: 70, unit: '°', okMsg: '對！圓心角是圓周角的 2 倍：35° × 2 ＝ 70°。', onOk: next, wrong: function () { return '提示：圓心角 ＝ 圓周角 × 2。'; } }); },
        function () { head(3); qfig(box, { A: 222, B: 318, P: 60, Q: 130 }, [['P', 'A', 'pl-line--blue'], ['P', 'B', 'pl-line--blue'], ['Q', 'A', 'pl-line--pink'], ['Q', 'B', 'pl-line--pink']], [[[4.6, 8.7], '48°', 'pl-text--pink']]);
          P.choice(box, {}, { id: 'ca-t3', prompt: 'P、Q 都在圓上。∠AQB ＝ 48°，那 ∠APB ＝ ？', row: true, options: [{ t: '24°', fb: '圓周角不是再除以 2；同一條弧所對的圓周角都一樣大。' }, { t: '48°', ok: true, fb: '對！∠APB 和 ∠AQB 看的是同一條弧 AB，所以一樣大。' }, { t: '96°', fb: '96° 是圓心角 ∠AOB，不是圓周角。' }], onAnswer: next }); },
        function () { head(4); qfig(box, { A: 250, B: 30, C: 310 }, [['O', 'A', 'pl-line--pink pl-line--dash'], ['O', 'B', 'pl-line--pink pl-line--dash'], ['C', 'A', 'pl-line--blue'], ['C', 'B', 'pl-line--blue']], [[[7.55, 4.75], '140°', 'pl-text--pink']]);
          box.append(h('div', { class: 'pl-q', html: '圓心角 ∠AOB ＝ <b>140°</b>（對著右下方的<b>小弧</b> AB），C 在這條<b>小弧</b>上，∠ACB ＝ ？' })); P.numBox(box, { answer: 110, unit: '°', okMsg: '對！C 看到的是另一邊的大弧：360° − 140° ＝ 220°，圓周角 ＝ 220° ÷ 2 ＝ 110°（鈍角）。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-angles' }); }, wrong: function (v) { return v === 70 ? '70° 是大弧上的點看到的角。C 在小弧上，看到的是大弧。' : '提示：C 所對的弧是「看不到 C 的那條弧」，也就是 360° − 140°，再除以 2。'; } }); }];
      qs[0](); api.lock('完成 4 題');
    },
    /* 6. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'circle-angles', moduleName: '圓周角與圓心角', askAbout: '國三圓與幾何', aha: '同一條弧所對的圓周角都相等，<br>而且是圓心角的一半。',
        cards: [{ text: '圓周角＝所對弧的圓心角的一半；同弧所對的圓周角相等', src: '國三「圓的性質」（國中數學課綱）' }, { text: '直徑所對的圓周角是 90°（半圓的圓周角是直角）', src: '國三「圓的性質」' }],
        depth: { here: 0.2, cheetah: [{ at: 0.45, label: '圓內接四邊形<br>弦切角' }, { at: 0.88, label: '圓冪與四點共圓<br>托勒密定理' }] },
        teasers: [
          { title: '圓內接四邊形', q: '圓內接四邊形的對角為什麼互補？四點共圓要怎麼判斷？', where: '資優班常見的圓與四點共圓延伸（詳細堂次請洽老師）', lv: 'L2' },
          { title: '弦切角', q: '切線和弦的夾角，為什麼也等於所對弧的圓周角？', where: '國三圓的性質與資優班延伸（詳細堂次請洽老師）', lv: 'L2' },
          { title: '圓冪與相交弦', q: '兩條弦相交，線段乘積為什麼相等？', where: '資優班與競賽幾何（詳細堂次請洽老師）', lv: 'L3' },
          { title: '托勒密定理', q: '圓內接四邊形，對角線乘積 ＝ 兩組對邊乘積之和。', where: '競賽幾何與高中三角函數（詳細堂次請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子常忘記<b>要看同一條弧</b>：圓周角在弧的哪一邊，看到的弧就不同；也常把圓心角、圓周角的 2 倍關係<b>弄反</b>。', place: '國三「圓」的核心，之後的圓內接四邊形、弦切角、四點共圓都建立在它上面。', ask: ['點在圓上跑，為什麼那個角都不變？', '直徑所對的角為什麼一定是直角？', '圓周角如果是鈍角，它看的弧是大弧還是小弧？'] },
        classes: ['國三「圓的性質」：課綱主題，獵豹班上會系統教並延伸（詳細堂次請洽老師）', '資優班：圓內接四邊形、弦切角、圓冪、托勒密（詳細堂次請洽老師）'],
        next: { href: 'play-solid-sphere.html', text: '下一個：球與圓錐、圓柱的關係' } });
    }];
  new P.Lesson({ id: 'circle-angles', title: '圓周角與圓心角', steps: steps });
})();
