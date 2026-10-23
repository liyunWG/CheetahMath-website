/* 獵豹玩中學｜圓周角與圓心角
   圓心 O＝(6,6)、半徑 4.5。點的位置都用「角度」表示（每 5° 或 10° 一格），所以圓心角、圓周角都是整數度。 */
(function () {
  var P = Play, h = P.h, rad = Math.PI / 180, O = [6, 6], R = 4.5;
  function polar(d, r) { r = r === undefined ? R : r; return [O[0] + r * Math.cos(d * rad), O[1] + r * Math.sin(d * rad)]; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  function dirTo(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]) / rad; }
  function shortest(d1, d2) { return ((d2 - d1 + 540) % 360) - 180; }
  /* 角的小扇形：頂點 V、從方向 d1 轉過 d（沒給 d 就取較短的那一邊）。剛好 90° 時畫成直角符號（小方框） */
  function wedge(V, d1, d2, r, d) {
    if (d === undefined) d = shortest(d1, d2); var pts = [V], i;
    if (Math.abs(Math.abs(d) - 90) < 0.01) {
      var sd = r * 0.7, u = [Math.cos(d1 * rad), Math.sin(d1 * rad)], w = [Math.cos((d1 + d) * rad), Math.sin((d1 + d) * rad)];
      pts.push([V[0] + u[0] * sd, V[1] + u[1] * sd], [V[0] + (u[0] + w[0]) * sd, V[1] + (u[1] + w[1]) * sd], [V[0] + w[0] * sd, V[1] + w[1] * sd]);
    } else for (i = 0; i <= 24; i++) { var a = (d1 + d * i / 24) * rad; pts.push([V[0] + r * Math.cos(a), V[1] + r * Math.sin(a)]); }
    return { pts: pts, bis: d1 + d / 2, val: Math.abs(d) };
  }
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function newBoard(host, cls) { var b = new P.Board(host, { w: 12, h: 12, cls: cls }); b.circle(O, R, 'pl-circle pl-circle--unit'); b.dot(O, 'pl-dot', null, 0.14); b.text([O[0] - 0.45, O[1] - 0.55], 'O', 'pl-text'); return b; }
  function ring(from, to, step) { var out = [], d; for (d = from; d <= to; d += step) out.push(polar(d)); return out; }
  var A_ANG = 230;

  var steps = [
    /* 1. 預測＋拖動 P：圓周角不變 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false;
      P.choice(st, api, { id: 'ca-p1', predict: true, label: '先猜猜看', prompt: 'A、B 固定。點 P 在圓上<b>繞一圈</b>，圓周角 ∠APB 會…？', row: true, options: [{ t: '越來越大' }, { t: '越來越小' }, { ok: true, t: '一直不變' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 P，繞圓一圈'); } });
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
      P.choice(st, api, { id: 'ca-p3', predict: true, label: '先猜猜看', prompt: '如果 <b>AB 是直徑</b>（通過圓心），圓周角 ∠APB 會是幾度？', row: true, options: [{ t: '45°' }, { ok: true, t: '90°' }, { t: '120°' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('把 B 拉到 A 的正對面'); } });
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
    /* 4. 為什麼：拖動 A，看等腰三角形的底角與圓心角 */
    function (st, api) {
      st.append(P.instr('為什麼是一半？先看最簡單的情形：<b>PB 是直徑</b>。拖動 <b>A</b> 在圓上跑，看 △OPA 的角。'));
      var host = stage(st), board = newBoard(host), Pa = 200, Ba = 20, Pp = polar(Pa), Bp = polar(Ba), seen = {}, n = 0, done = false;
      board.line(Pp, Bp, 'pl-line pl-line--blue');
      var pa = board.line(Pp, Pp, 'pl-line pl-line--blue'), oa = board.line(O, O, 'pl-line pl-line--pink'), op = board.line(O, Pp, 'pl-line pl-line--pink');
      var wx = board.poly([O, O, O], 'pl-poly pl-poly--blue'), wy = board.poly([O, O, O], 'pl-poly pl-poly--blue'), wo = board.poly([O, O, O], 'pl-poly pl-poly--pink');
      [Pp, Bp].forEach(function (p) { board.dot(p, 'pl-dot', null, 0.17); });
      board.text([Pp[0] - 0.6, Pp[1] - 0.1], 'P', 'pl-text pl-text--lg'); board.text([Bp[0] + 0.6, Bp[1] - 0.1], 'B', 'pl-text pl-text--lg');
      var tA = board.text([0, 0], 'A', 'pl-text pl-text--lg'), tx = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg'), ty = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg'), to = board.text([0, 0], '', 'pl-text pl-text--pink pl-text--lg');
      var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-blue'), p3 = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout pl-readout--col' }, p1, p2, p3);
      function draw(aAng) {
        var A = polar(aAng), wp = wedge(Pp, dirTo(Pp, O), dirTo(Pp, A), 1.1), wa = wedge(A, dirTo(A, O), dirTo(A, Pp), 1.1), wc = wedge(O, Ba, aAng, 1.5), x = Math.round(wp.val);
        board.setLine(pa, Pp, A); board.setLine(oa, O, A); board.setPoly(wx, wp.pts); board.setPoly(wy, wa.pts); board.setPoly(wo, wc.pts);
        board.setText(tA, [polar(aAng, R + 0.75)[0], polar(aAng, R + 0.75)[1] - 0.2]);
        board.setText(tx, [Pp[0] + 2.0 * Math.cos(wp.bis * rad), Pp[1] + 2.0 * Math.sin(wp.bis * rad) - 0.2], 'x ＝ ' + x + '°'); board.setText(ty, [A[0] + 1.9 * Math.cos(wa.bis * rad), A[1] + 1.9 * Math.sin(wa.bis * rad) - 0.2], 'x ＝ ' + Math.round(wa.val) + '°');
        board.setText(to, [polar(wc.bis, 2.6)[0], polar(wc.bis, 2.6)[1] - 0.2], Math.round(wc.val) + '°');
        p1.textContent = '圓周角 x ＝ ∠OPA ＝ ' + x + '°'; p2.textContent = '∠OAP ＝ ' + Math.round(wa.val) + '°（OA ＝ OP，底角相等）'; p3.textContent = '圓心角 ∠AOB ＝ ' + Math.round(wc.val) + '° ＝ 2 × ' + x + '°';
        return Math.round(aAng / 10);
      }
      var cand = []; for (var d = 10; d < 360; d += 10) if (d !== Ba && d !== Pa) cand.push(polar(d));
      var hd = board.handle({ pos: polar(90), candidates: cand, onMove: function (t) {
        var k = draw(norm(dirTo(O, t))); if (!seen[k]) { seen[k] = 1; n++; }
        if (n >= 5 && !done) { done = true; P.track('aha', { id: 'circle-angles', step: 4 }); st.append(P.ruleBox('A 跑到哪裡，兩個底角都一樣大（都是 x，因為 OA ＝ OP 是半徑），圓心角 ∠AOB 永遠 ＝ <b>x ＋ x ＝ 2x</b>。<br>這是三角形的<b>外角</b>＝兩個不相鄰內角的和。所以<b>圓周角 ＝ 圓心角的一半</b>。P 不在直徑上的情形，拆成兩個這樣的小情形就好。', '原因')); api.unlock('看懂原因了！'); }
      } });
      api.solve(function () { [60, 130, 250, 320, 100].forEach(function (a) { hd.moveTo(polar(a)); }); });
      draw(90); st.append(ro, P.hint('提示：至少換 5 個位置。看看 x、∠OAP 和圓心角三個數字之間的關係。')); api.lock('拖動 A，試 5 個位置');
    },
    /* 5. 四個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function angAt(V, X, Y) { return wedge(V, dirTo(V, X), dirTo(V, Y), 1).val; }
      function circlePts(from, to, step, skip) { var out = [], d; for (d = from; d < to; d += step) if (!skip || skip.indexOf(d % 360) < 0) out.push(polar(d)); return out; }
      function lab(board, P0, ang, txt) { return board.text([polar(ang, R + 0.75)[0], polar(ang, R + 0.75)[1] - 0.2], txt, 'pl-text pl-text--lg'); }
      var tasks = [
        /* 關 1：反過來——拖動 B，做出 35° 的圓周角 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: 'A、P 固定。拖動 <b>B</b>，讓<b>圓周角 ∠APB ＝ 35°</b>。<small>（圓心角要變多少？）</small>' }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var board = newBoard(host, 'pl-svg--sm'), A = polar(230), Pp = polar(90);
          var l1 = board.line(Pp, A, 'pl-line pl-line--blue'), l2 = board.line(Pp, A, 'pl-line pl-line--blue'), l3 = board.line(O, A, 'pl-line pl-line--pink pl-line--dash'), l4 = board.line(O, A, 'pl-line pl-line--pink pl-line--dash'), wp = board.poly([O, O, O], 'pl-poly pl-poly--blue'), wo = board.poly([O, O, O], 'pl-poly pl-poly--pink');
          board.dot(A, 'pl-dot', null, 0.17); board.dot(Pp, 'pl-dot', null, 0.17); lab(board, 0, 230, 'A'); lab(board, 0, 90, 'P'); var tB = board.text([0, 0], 'B', 'pl-text pl-text--lg'), tp = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg'), to = board.text([0, 0], '', 'pl-text pl-text--pink pl-text--lg');
          var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), p3 = P.pill('目標：圓周角 35°', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, p1, p2, p3));
          function draw(bAng) {
            var B = polar(bAng), w = wedge(Pp, dirTo(Pp, A), dirTo(Pp, B), 1.3), c = wedge(O, 230, bAng, 1.5, undefined), val = Math.round(w.val);
            board.setLine(l1, Pp, A); board.setLine(l2, Pp, B); board.setLine(l4, O, B); board.setPoly(wp, w.pts); board.setPoly(wo, c.pts);
            board.setText(tB, [polar(bAng, R + 0.75)[0], polar(bAng, R + 0.75)[1] - 0.2]); board.setText(tp, [Pp[0] + 1.9 * Math.cos(w.bis * rad), Pp[1] + 1.9 * Math.sin(w.bis * rad) - 0.2], val + '°'); board.setText(to, [polar(c.bis, 2.6)[0], polar(c.bis, 2.6)[1] - 0.2], Math.round(c.val) + '°');
            p1.textContent = '圓周角 ∠APB ＝ ' + val + '°'; p2.textContent = '圓心角 ∠AOB ＝ ' + Math.round(c.val) + '°'; p1.className = 'pl-pill ' + (val === 35 ? 'is-ok' : 'is-blue');
            return val;
          }
          var cand = []; for (var t = 20; t <= 340; t += 10) if (t !== 220) cand.push(polar(230 + t));
          var hd = board.handle({ pos: polar(330), candidates: cand, onMove: function (t) { if (draw(norm(dirTo(O, t))) === 35) { P.toast('✓ 圓周角 35° ＝ 圓心角 70° 的一半'); P.track('aha', { id: 'circle-angles', step: 5 }); done(); } } }); draw(330);
          setSolve(function () { hd.moveTo(polar(300)); }); b0.append(P.hint('提示：看看畫面上圓周角和圓心角兩個數字是什麼關係，再決定 B 要放哪裡。'));
        },
        /* 關 2：同一條弧，兩個圓周角都是 48° */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: 'A、B 固定（弧 AB 是 96°）。拖動 <b>P</b> 和 <b>Q</b>，讓兩個圓周角<b>都是 48°</b>，而且 P、Q <b>離得遠一點</b>。' }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var board = newBoard(host, 'pl-svg--sm'), A = polar(220), B = polar(316);
          var lp1 = board.line(A, A, 'pl-line pl-line--blue'), lp2 = board.line(A, A, 'pl-line pl-line--blue'), lq1 = board.line(A, A, 'pl-line pl-line--pink'), lq2 = board.line(A, A, 'pl-line pl-line--pink');
          board.dot(A, 'pl-dot', null, 0.17); board.dot(B, 'pl-dot', null, 0.17); board.text([polar(220, R + 0.75)[0], polar(220, R + 0.75)[1] - 0.2], 'A', 'pl-text pl-text--lg'); board.text([polar(316, R + 0.75)[0], polar(316, R + 0.75)[1] - 0.2], 'B', 'pl-text pl-text--lg');
          var tP = board.text([0, 0], 'P', 'pl-text pl-text--blue pl-text--lg'), tQ = board.text([0, 0], 'Q', 'pl-text pl-text--pink pl-text--lg'), pv = P.pill('', 'is-blue'), qv = P.pill('', 'is-pink'), gl = P.pill('', ''); b0.append(h('div', { class: 'pl-readout' }, pv, qv, gl));
          var pa = 270, qa = 295, hp, hq;
          function draw() {
            var Pp = polar(pa), Qp = polar(qa), vp = Math.round(angAt(Pp, A, B)), vq = Math.round(angAt(Qp, A, B));
            board.setLine(lp1, Pp, A); board.setLine(lp2, Pp, B); board.setLine(lq1, Qp, A); board.setLine(lq2, Qp, B);
            board.setText(tP, [Pp[0] + 1.1 * Math.cos(pa * rad), Pp[1] + 1.1 * Math.sin(pa * rad) - 0.2], 'P：' + vp + '°'); board.setText(tQ, [Qp[0] + 1.1 * Math.cos(qa * rad), Qp[1] + 1.1 * Math.sin(qa * rad) - 0.2], 'Q：' + vq + '°');
            pv.textContent = '∠APB ＝ ' + vp + '°'; qv.textContent = '∠AQB ＝ ' + vq + '°'; var sep = Math.abs(shortest(pa, qa)), ok = vp === 48 && vq === 48 && sep >= 40;
            gl.className = 'pl-pill' + (ok ? ' is-ok' : ''); gl.textContent = ok ? '✓ 兩個都是 48°' : (vp === 132 || vq === 132 ? '在小弧上會是 132° ＝ 180° − 48°' : '兩個都要 48°，且離遠一點');
            if (ok) { board.goalMark(Pp); board.goalMark(Qp); P.toast('同一條弧，圓周角一樣大！'); P.track('aha', { id: 'circle-angles', step: 6 }); done(); }
          }
          function mk(init, set) { return board.handle({ pos: polar(init), candidates: circlePts(0, 360, 5, [220]), onMove: function (t) { set(norm(dirTo(O, t))); draw(); } }); }
          hp = mk(pa, function (a) { pa = a; }); hq = mk(qa, function (a) { qa = a; }); draw();
          setSolve(function () { hp.moveTo(polar(60)); hq.moveTo(polar(150)); }); b0.append(P.hint('P、Q 要跑到 A、B 的「對面」那一大段弧上。'));
        },
        /* 關 3：大弧與小弧 */
        function (b0, done, setSolve) {
          var targets = [70, 110], sol = [130, 310], ti = 0, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(info, host);
          var board = newBoard(host, 'pl-svg--sm'), A = polar(250), B = polar(30);
          var l1 = board.line(A, A, 'pl-line pl-line--blue'), l2 = board.line(A, A, 'pl-line pl-line--blue'), wc = wedge(O, 250, 30, 1.5, 140); board.line(O, A, 'pl-line pl-line--pink pl-line--dash'); board.line(O, B, 'pl-line pl-line--pink pl-line--dash'); board.poly(wc.pts, 'pl-poly pl-poly--pink');
          board.dot(A, 'pl-dot', null, 0.17); board.dot(B, 'pl-dot', null, 0.17); board.text([polar(250, R + 0.75)[0], polar(250, R + 0.75)[1] - 0.2], 'A', 'pl-text pl-text--lg'); board.text([polar(30, R + 0.75)[0], polar(30, R + 0.75)[1] - 0.2], 'B', 'pl-text pl-text--lg'); board.text([polar(wc.bis, 2.0)[0], polar(wc.bis, 2.0)[1] - 0.2], '140°', 'pl-text pl-text--pink pl-text--lg');
          var wp = board.poly([O, O, O], 'pl-poly pl-poly--blue'), tC = board.text([0, 0], 'C', 'pl-text pl-text--blue pl-text--lg'), tv = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg'), pv = P.pill('', 'is-blue'), pg = P.pill('', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, pv, pg));
          function txt() { info.innerHTML = '圓心角 ∠AOB ＝ <b>140°</b>。拖動 <b>C</b>，先找出 <b>∠ACB ＝ ' + targets[0] + '°</b> 的位置，再找出 <b>∠ACB ＝ ' + targets[1] + '°</b> 的位置。<small>（目標 ' + (Math.min(ti, 1) + 1) + ' / 2）</small>'; pg.textContent = ti < 2 ? '目標：' + targets[ti] + '°' : '✓ 都找到了'; }
          function draw(cAng) {
            var C = polar(cAng), w = wedge(C, dirTo(C, A), dirTo(C, B), 1.3), v = Math.round(w.val); board.setLine(l1, C, A); board.setLine(l2, C, B); board.setPoly(wp, w.pts);
            board.setText(tC, [C[0] + 0.7 * Math.cos(cAng * rad), C[1] + 0.7 * Math.sin(cAng * rad) - 0.2]); board.setText(tv, [C[0] + 1.9 * Math.cos(w.bis * rad), C[1] + 1.9 * Math.sin(w.bis * rad) - 0.2], v + '°'); pv.textContent = '∠ACB ＝ ' + v + '°'; return v;
          }
          var hd = board.handle({ pos: polar(330), candidates: circlePts(0, 360, 5, [250, 30]), onMove: function (t) {
            var v = draw(norm(dirTo(O, t))); if (ti < 2 && v === targets[ti]) { ti++; if (ti >= 2) { P.toast('C 在小弧上，看到的是大弧：220° ÷ 2 ＝ 110°'); P.track('aha', { id: 'circle-angles', step: 7 }); txt(); done(); } else { P.toast('✓ 找到了，再找下一個'); txt(); } }
          } });
          draw(330); txt(); setSolve(function () { while (ti < 2) hd.moveTo(polar(sol[ti])); }); b0.append(P.hint('提示：C 在 A、B 的「同一側」和「另一側」，看到的角會一樣嗎？'));
        },
        /* 關 4：對角互補 → 四點共圓 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: 'A、B、C 固定。拖動 <b>D</b>，找出讓<b>對角 ∠B ＋ ∠D ＝ 180°</b> 的位置（找 <b>3 個</b>），看看它們有什麼共同點。' }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var bd = new P.Board(host, { w: 12, h: 12, cls: 'pl-svg--sm' }), A = [3, 2], B = [11, 6], C = [10, 9], seen = {}, n = 0, hd;
          var circ = bd.circle([6, 6], 5, 'pl-circle pl-circle--unit', null, { style: 'stroke-dasharray:7 5;opacity:0' }), quad = bd.poly([A, B, C, [6, 8]], 'pl-poly pl-poly--amber'), dots = h('g'); bd.gMid.append(dots);
          [[A, 'A', [-0.5, -0.6]], [B, 'B', [0.6, -0.1]], [C, 'C', [0.5, 0.5]]].forEach(function (q) { bd.dot(q[0], 'pl-dot', null, 0.17); bd.text([q[0][0] + q[2][0], q[0][1] + q[2][1]], q[1], 'pl-text pl-text--lg'); });
          var tD = bd.text([0, 0], 'D', 'pl-text pl-text--pink pl-text--lg'), pb = P.pill('', 'is-blue'), pd = P.pill('', 'is-pink'), ps = P.pill('', ''), pn = P.pill('找到 0 / 3', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, pb, pd, ps, pn));
          function draw(D) {
            bd.setPoly(quad, [A, B, C, D]); bd.setText(tD, [D[0] + 0.5, D[1] + 0.55]);
            var ab = angAt(B, A, C), ad = angAt(D, A, C), ok = Math.abs(ab + ad - 180) < 1e-6; pb.textContent = '∠B ＝ ' + Math.round(ab * 10) / 10 + '°'; pd.textContent = '∠D ＝ ' + Math.round(ad * 10) / 10 + '°';
            ps.className = 'pl-pill' + (ok ? ' is-ok' : ''); ps.textContent = ok ? '✓ ∠B ＋ ∠D ＝ 180°' : '∠B ＋ ∠D ＝ ' + Math.round((ab + ad) * 10) / 10 + '°';
            if (ok) { var key = D.join(','); if (!seen[key]) { seen[key] = 1; n++; pn.textContent = '找到 ' + Math.min(n, 3) + ' / 3'; bd.dot(D, 'pl-dot pl-dot--green', dots, 0.2); bd.goalMark(D);
              if (n >= 3) { circ.style.opacity = 1; P.toast('三個 D 都在同一個圓上！'); P.track('aha', { id: 'circle-angles', step: 8 }); b0.append(P.ruleBox('找到的 D 全都和 A、B、C <b>在同一個圓上</b>：圓內接四邊形<b>對角互補</b>；反過來，對角互補的四邊形<b>一定四點共圓</b>。', '發現')); done(); } } }
          }
          var cand = []; for (var x = 1; x <= 11; x++) for (var y = 1; y <= 11; y++) if (!((x === 3 && y === 2) || (x === 11 && y === 6) || (x === 10 && y === 9))) cand.push([x, y]);
          hd = bd.handle({ pos: [6, 8], candidates: cand, onMove: draw }); draw([6, 8]);
          setSolve(function () { [[2, 9], [3, 10], [6, 11]].forEach(hd.moveTo); }); b0.append(P.hint('D 要放在 AC 線的「另一邊」（B 的對面）。圓圈等你找到 3 個才會出現。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-angles' }); } });
    },
    /* 6. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'circle-angles', moduleName: '圓周角與圓心角', askAbout: '國三圓與幾何', aha: '同一條弧所對的圓周角都相等，<br>而且是圓心角的一半。',
        cards: [{ text: '圓周角＝所對弧的圓心角的一半；同弧所對的圓周角相等', src: '國三「圓的性質」（國中數學課綱）' }, { text: '直徑所對的圓周角是 90°（半圓的圓周角是直角）', src: '國三「圓的性質」' }],
        depth: { here: 0.2, cheetah: [{ at: 0.45, label: '圓內接四邊形<br>弦切角' }, { at: 0.88, label: '圓冪與四點共圓<br>托勒密定理' }] },
        teasers: [
          { title: '圓內接四邊形', q: '圓內接四邊形的對角為什麼互補？反過來，對角互補的四邊形一定四點共圓嗎？', where: 'PK3A 2507 第 19–20 堂；J91A 2507 第 7–9 堂、2607 第 10–11 堂；J82S 2601 第 19 堂', lv: 'L2' },
          { title: '弦切角', q: '切線和弦的夾角，為什麼也等於所對弧的圓周角？圓內角、圓外角又是弧的幾分之幾？', where: 'J91A 2507 第 5 堂、2607 第 8 堂；J82S 2601 第 18–19 堂；PK3A 2507 第 19 堂', lv: 'L2' },
          { title: '圓冪與相交弦', q: '兩條弦相交、或割線與切線相交，線段乘積為什麼相等？', where: 'J91A 2507 第 7 堂、2607 第 9 堂：相交弦、切割線、圓冪', lv: 'L3' },
          { title: '托勒密定理', q: '圓內接四邊形，對角線乘積 ＝ 兩組對邊乘積之和。', where: 'J91A 2507 第 8–9 堂、2607 第 10–11 堂：托勒密與四點共圓', lv: 'L3' }],
        parent: { pitfall: '孩子常忘記<b>要看同一條弧</b>：圓周角在弧的哪一邊，看到的弧就不同；也常把圓心角、圓周角的 2 倍關係<b>弄反</b>。', place: '國三「圓」的核心，之後的圓內接四邊形、弦切角、四點共圓都建立在它上面。', ask: ['點在圓上跑，為什麼那個角都不變？', '直徑所對的角為什麼一定是直角？', '圓周角如果是鈍角，它看的弧是大弧還是小弧？'] },
        classes: ['J82S（2601 第 14–19 堂）：CH10 圓', 'J91A（2507 第 1–9 堂；2607 第 4–11 堂）：圓形——圓周角、弦切角、圓內接四邊形、圓冪、托勒密', 'PK3A（2507 第 19–20 堂）：關於圓的角度(1)(2)——圓心角、圓周角、弦切角、四點共圓', 'PK4A（2507 第 17 堂）：曲線形中的角度問題'],
        next: { href: 'play-solid-sphere.html', text: '下一個：球與圓錐、圓柱的關係' } });
    }];
  new P.Lesson({ id: 'circle-angles', title: '圓周角與圓心角', answers: { 1: '同一條弧所對的圓周角，永遠是圓心角的一半（弧超過半圓時，圓周角是鈍角）', 3: '圓周角 ＝ 圓心角 ÷ 2（圓心角 ∠AOB 永遠 ＝ 2x）' }, steps: steps });
})();
