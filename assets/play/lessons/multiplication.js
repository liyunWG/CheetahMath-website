/* 獵豹玩中學｜乘法公式的圖解（面積切塊；邊長用彈簧動態，方塊會像實體一樣彈一下） */
(function () {
  var P = Play, h = P.h;
  function stage(st) { var w = h('div', { class: 'pl-stage' }); st.append(w); return w; }
  function canvas(host, w, hh) { var s = h('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'pl-svg', preserveAspectRatio: 'xMidYMid meet' }); host.append(s); var g = h('g'); s.append(g); return g; }
  function rect(g, x, y, w, hh, cls, label, size) {
    g.append(h('rect', { x: x, y: y, width: Math.max(0, w), height: Math.max(0, hh), class: 'pl-poly pl-poly--' + cls }));
    if (label && w > 26 && hh > 20) g.append(txt(x + w / 2, y + hh / 2, label, size || 15));
  }
  function txt(x, y, t, size, cls) { var e = h('text', { x: x, y: y, class: 'pm-t ' + (cls || ''), 'font-size': size || 15 }); e.textContent = t; return e; }
  function brace(g, x1, x2, y, label, cls) { g.append(h('line', { x1: x1 + 1, y1: y, x2: x2 - 1, y2: y, class: 'pl-line pl-line--thin ' + (cls || '') }), txt((x1 + x2) / 2, y - 9, label, 15, cls)); }
  function braceV(g, y1, y2, x, label, cls) { g.append(h('line', { x1: x, y1: y1 + 1, x2: x, y2: y2 - 1, class: 'pl-line pl-line--thin ' + (cls || '') }), txt(x - 11, (y1 + y2) / 2, label, 15, cls)); }
  function spring(v, fn) { var s = new P.Spring(v, { k: 300, zeta: 0.45, onUpdate: fn }); return s; }

  var steps = [
    /* 1 (a+b)² 面積 */
    function (st, api) {
      var gate = { on: true }, touched = 0;
      P.choice(st, api, { id: 'mf-p1', predict: true, label: '先猜猜看', prompt: '(a + b)² 是不是等於 a² + b²？（例如 a＝3、b＝2）', row: true, options: [{ t: '一樣' }, { t: '會多一些' }, { t: '會少一些' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('按 ＋ − 改變 a、b'); } });
      var host = stage(st), g = canvas(host, 320, 250), A = 3, B = 2, u = 27, ox = 36, oy = 30;
      var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout' }, pa, pb);
      var sa = spring(3, draw), sb = spring(2, draw);
      function draw() {
        var a = sa.x * u, b = sb.x * u; g.innerHTML = '';
        rect(g, ox, oy, a, a, 'blue', 'a²'); rect(g, ox + a, oy, b, a, 'amber', 'ab'); rect(g, ox, oy + a, a, b, 'amber', 'ab'); rect(g, ox + a, oy + a, b, b, 'pink', 'b²');
        brace(g, ox, ox + a, oy - 6, 'a', 'pm-blue'); brace(g, ox + a, ox + a + b, oy - 6, 'b', 'pm-pink'); braceV(g, oy, oy + a, ox - 6, 'a', 'pm-blue'); braceV(g, oy + a, oy + a + b, ox - 6, 'b', 'pm-pink');
        pa.textContent = '(a+b)² = ' + (A + B) * (A + B); pb.textContent = 'a²+b² = ' + (A * A + B * B) + '，少了 ' + 2 * A * B + ' ＝ 2ab';
      }
      draw();
      function chg() {
        if (gate.on) return; sa.to(A); sb.to(B); touched++; draw();
        if (touched >= 3 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'multiplication', step: 1 }); st.append(P.ruleBox('<b>(a + b)² ＝ a² ＋ 2ab ＋ b²</b><br>中間多出來的，就是<b>兩塊 ab</b>。', '公式')); P.toast(api.ctx.p1 === 1 ? '你猜對了！會多一些' : '多出了兩塊 ab'); api.unlock('看到公式的樣子了！'); }
      }
      var s1 = P.stepper('a', 1, 5, 3, function (v) { A = v; chg(); }), s2 = P.stepper('b', 1, 3, 2, function (v) { B = v; chg(); });
      var row = h('div', { class: 'pl-steprow' }, s1.el, s2.el);
      api.solve(function () { gate.on = false; s1.set(4); s2.set(1); s1.set(3); });
      st.append(row, ro, P.hint('邊長一改，四塊面積跟著彈一下。')); api.lock('先做上面的預測');
    },
    /* 2 積木填空 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '把四塊加起來'), P.instr('照著圖，把 (a + b)² 的<b>三種面積</b>填進空格。'));
      var host = stage(st), g = canvas(host, 320, 230), a = 3 * 27, b = 2 * 27, ox = 36, oy = 28;
      rect(g, ox, oy, a, a, 'blue', 'a²'); rect(g, ox + a, oy, b, a, 'amber', 'ab'); rect(g, ox, oy + a, a, b, 'amber', 'ab'); rect(g, ox + a, oy + a, b, b, 'pink', 'b²');
      brace(g, ox, ox + a + b, oy - 6, 'a + b'); braceV(g, oy, oy + a + b, ox - 6, 'a+b');
      P.fillSlots(st, { parts: ['(a + b)² ＝ ', { slot: 0 }, ' ＋ ', { slot: 1 }, ' ＋ ', { slot: 2 }], chips: [{ id: 'a2', html: 'a²' }, { id: 'ab', html: 'ab' }, { id: '2ab', html: '2ab' }, { id: 'b2', html: 'b²' }, { id: '2a', html: '2a' }], answer: ['a2', '2ab', 'b2'], anyOrder: true,
        onOk: function () { P.track('aha', { id: 'multiplication', step: 2 }); st.append(P.ruleBox('兩塊 <b>ab</b> 一樣大，合起來就是 <b>2ab</b>。', '合併')); api.unlock('答對了！'); } });
      api.lock('填好三個空格');
    },
    /* 3 (a−b)² */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '(a − b)² 呢？'), P.instr('(a − b)² 是邊長 <b>a − b</b> 的正方形。從 a×a 的大正方形拿掉<b>右邊一條</b>和<b>下面一條</b>（每條<b>長 a、寬 b</b>），剩下的藍色邊長就是 a − b。'));
      var host = stage(st), g = canvas(host, 320, 232), a = 5, b = 2, u = 30, ox = 46, oy = 44, phase = 0, asked = false;
      var cap = h('div', { class: 'pl-caption' }), ro = h('div', { class: 'pl-readout' }), pr = P.pill('', 'is-blue'), pn = P.pill('', 'is-pink'); ro.append(pr, pn);
      function strip(x, y, w, hh) { g.append(h('rect', { x: x, y: y, width: w, height: hh, class: 'pm-strip' })); }
      function draw() {
        var A = a * u, B = b * u, C = (a - b) * u; g.innerHTML = '';
        rect(g, ox, oy, A, A, 'blue', phase === 0 ? 'a² = 25' : '', 18);
        if (phase >= 1) { strip(ox + C, oy, B, A); g.append(txt(ox + C + B / 2, oy + C / 2 - 12, '長條①', 13), txt(ox + C + B / 2, oy + C / 2 + 4, 'a×b', 13), txt(ox + C + B / 2, oy + C / 2 + 20, '= 10', 13)); }
        if (phase >= 2) {
          strip(ox, oy + C, A, B); g.append(txt(ox + C / 2, oy + C + B / 2, '長條② ab＝10', 13));
          g.append(h('rect', { x: ox + C, y: oy + C, width: B, height: B, class: 'pl-poly pl-poly--amber' }), txt(ox + C + B / 2, oy + C + B / 2, 'b²', 17));
          g.append(h('rect', { x: ox, y: oy, width: C, height: C, class: 'pl-poly pl-poly--blue', 'fill-opacity': 0.9 }), txt(ox + C / 2, oy + C / 2 - 8, '(a−b)²', 16), txt(ox + C / 2, oy + C / 2 + 12, '＝3×3＝9', 14));
          brace(g, ox + C, ox + A, oy + A + 14, 'b', 'pm-amber'); braceV(g, oy + C, oy + A, ox + A + 14, 'b', 'pm-amber');
        }
        brace(g, ox, ox + A, oy - 22, 'a = 5', 'pm-blue'); braceV(g, oy, oy + A, ox - 6, 'a', 'pm-blue');
        if (phase >= 1) brace(g, ox + C, ox + A, oy - 6, 'b', 'pm-pink');
        if (phase === 2) g.append(txt(ox + C / 2, oy + A + 14, 'a − b = 3', 13, 'pm-blue'));
        pr.textContent = phase === 0 ? 'a² = 25' : phase === 1 ? 'a² − ab = 25 − 10 = 15' : 'a² − ab − ab = 25 − 10 − 10 = 5';
        pn.textContent = phase < 2 ? '' : '藍色真正的 (a−b)² ＝ 3×3 ＝ 9'; pn.style.display = phase < 2 ? 'none' : '';
        cap.innerHTML = ['先看 a×a 的大正方形：邊長 a ＝ 5，面積 25。', '拿掉右邊一條：<b>長 a、寬 b</b>，面積 ab ＝ 10。', '再拿掉下面一條（也是長 a、寬 b）。右下角 <b>b×b</b> 的小方塊被兩條都蓋到，<b>拿了兩次</b>！'][phase];
      }
      draw();
      var stp = P.stepper('拿掉長條', 0, 2, 0, function (v) { phase = v; draw(); if (v === 2 && !asked) { asked = true; setTimeout(ask, 900); } }, function (v) { return v + ' 條'; });
      var q = h('div', {}), qb = h('div', {});
      function ask() {
        stp.el.style.display = 'none'; cap.style.display = 'none'; q.append(qb); qb.append(h('div', { class: 'pl-q', html: '只算 25 − 10 − 10 ＝ 5，但藍色真正的面積是 3×3 ＝ 9。<br>差了多少？' }));
        P.numBox(qb, { answer: 4, before: '差了', okMsg: '對！差的 4 ＝ <b>b²</b>（2×2）：右下角被拿了兩次，要補回來。', onOk: function () { P.track('aha', { id: 'multiplication', step: 3 }); setTimeout(function () { qb.style.display = 'none'; ro.style.display = 'none'; }, 1200); q.append(P.ruleBox('<b>(a − b)² ＝ a² − 2ab ＋ b²</b><br>最後的 ＋b² 就是補回「被拿掉兩次的右下角」。', '公式')); api.unlock('補回角落！'); } });
      }
      api.solve(function () { stp.set(2, true); phase = 2; draw(); if (!asked) { asked = true; ask(); } });
      st.append(stp.el, cap, ro, q); api.lock('拿掉兩條長條');
    },
        /* 4 平方差：剪下搬動 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '平方差'), P.instr('從大正方形<b>挖掉</b>一個 b×b 的角，剩下 L 形。<b>把右上那塊搬過去</b>，拉滑桿。'));
      var host = stage(st), g = canvas(host, 320, 214), a = 6, b = 2, u = 30, ox = 20, oy = 30, t = 0, done = false;
      var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout' }, pa, pb);
      function draw() {
        g.innerHTML = ''; var A = a * u, B = b * u, C = (a - b) * u;
        g.append(h('rect', { x: ox + C, y: oy, width: B, height: B, class: 'pl-poly pl-poly--ghost' }), txt(ox + C + B / 2, oy + B / 2, 'b²', 13, 'pm-ghost'));
        rect(g, ox, oy + B, A, C, 'blue', t < 0.98 ? 'a(a−b)' : '', 14);
        var c0 = [ox + C / 2, oy + B / 2], c1 = [ox + A + B / 2, oy + B + C / 2], cx = c0[0] + (c1[0] - c0[0]) * t, cy = c0[1] + (c1[1] - c0[1]) * t, w0 = C, h0 = B;
        var pg = h('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + (-90 * t) + ')' }); pg.append(h('rect', { x: -w0 / 2, y: -h0 / 2, width: w0, height: h0, class: 'pl-poly pl-poly--pink' })); g.append(pg);
        if (t > 0.98) { brace(g, ox, ox + A + B, oy - 8, 'a + b', 'pm-blue'); braceV(g, oy + B, oy + A, ox + A + B + 14, '', ''); g.append(txt(ox + A + B + 2, oy + B + C / 2 - 26, 'a−b', 13, 'pm-blue')); }
        else { brace(g, ox, ox + A, oy - 8, 'a'); }
        pa.textContent = 'L 形 ＝ a² − b² ＝ ' + (a * a - b * b); pb.textContent = t > 0.98 ? '長方形 ＝ (a+b)(a−b) ＝ ' + (a + b) * (a - b) : '正在搬…';
        if (t >= 0.98 && !done) { done = true; P.track('aha', { id: 'multiplication', step: 4 }); st.append(P.ruleBox('<b>(a + b)(a − b) ＝ a² − b²</b><br>同一塊面積，換個擺法。', '公式')); P.toast('面積沒變，只是換了擺法'); api.unlock('平方差公式！'); }
      }
      draw();
      var sl = P.slider(0, 100, 0, function (v) { t = v / 100; draw(); }); sl.addEventListener('change', function () { if (+sl.value > 90 && +sl.value < 100) { sl.value = 100; t = 1; draw(); } });
      api.solve(function () { sl.value = 100; t = 1; draw(); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 原位'), h('span', {}, '搬到右邊 →')), ro, P.hint('粉紅那塊旋轉 90° 接到藍色右邊。')); api.lock('把滑桿拉到最右邊');
    },
    /* 5 代數方塊：(x+p)(x+q) */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '(x ＋ p)(x ＋ q)'), P.instr('x 是<b>任意長度</b>。拉動 x，再改 p、q，看展開式怎麼長出來。'));
      var host = stage(st), g = canvas(host, 320, 252), u = 28, ox = 34, oy = 30, X = 4, p = 2, q = 3, touched = 0, ro = h('div', { class: 'pl-readout' }), pe = P.pill('', 'is-blue'), pv = P.pill('', '');
      ro.append(pe, pv); var sp = spring(2, draw), sq = spring(3, draw);
      function draw() {
        var x = X * u, pp = sp.x * u, qq = sq.x * u; g.innerHTML = '';
        rect(g, ox, oy, x, x, 'blue', 'x²', 17); rect(g, ox + x, oy, qq, x, 'amber', q + 'x'); rect(g, ox, oy + x, x, pp, 'amber', p + 'x'); rect(g, ox + x, oy + x, qq, pp, 'pink', String(p * q));
        for (var i = 1; i < q; i++) g.append(h('line', { x1: ox + x + i * u, y1: oy, x2: ox + x + i * u, y2: oy + x, class: 'pl-line pl-line--thin' }));
        for (var j = 1; j < p; j++) g.append(h('line', { x1: ox, y1: oy + x + j * u, x2: ox + x, y2: oy + x + j * u, class: 'pl-line pl-line--thin' }));
        brace(g, ox, ox + x, oy - 6, 'x', 'pm-blue'); brace(g, ox + x, ox + x + qq, oy - 6, String(q), 'pm-pink'); braceV(g, oy, oy + x, ox - 6, 'x', 'pm-blue'); braceV(g, oy + x, oy + x + pp, ox - 6, String(p), 'pm-pink');
        pe.textContent = '(x+' + p + ')(x+' + q + ') ＝ x² + ' + (p + q) + 'x + ' + (p * q);
        pv.textContent = 'x＝' + X + '：' + (X + p) * (X + q) + ' ＝ ' + (X * X + (p + q) * X + p * q) + ' ✓';
      }
      function chg() { sp.to(p); sq.to(q); draw(); touched++; if (touched >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'multiplication', step: 5 }); st.append(P.ruleBox('<b>(x + p)(x + q) ＝ x² ＋ (p + q)x ＋ pq</b><br>x 的係數＝兩條長條加起來的個數 <b>p + q</b>。', '公式')); api.unlock('展開式看得見了！'); } }
      var sx = P.slider(30, 50, 40, function (v) { X = v / 10; chg(); }, 5), s1 = P.stepper('p', 1, 3, 2, function (v) { p = v; chg(); }), s2 = P.stepper('q', 1, 3, 3, function (v) { q = v; chg(); });
      api.solve(function () { s1.set(1); s2.set(1); s1.set(3); s2.set(2); });
      st.append(h('div', { class: 'pl-steprow' }, s1.el, s2.el), sx, h('div', { class: 'pl-slider-lab' }, h('span', {}, 'x 短'), h('span', {}, 'x 長')), ro); api.lock('改一改 x、p、q');
    },
    /* 6 換個外觀（每題都有圖） */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function cv(w, hh) { var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var g = canvas(host, w, hh); host.querySelector('svg').classList.add('pl-svg--sm'); return g; }
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var g = cv(320, 212), u = 26, x = 4 * u, t = 3 * u, ox = 44, oy = 28;
          rect(g, ox, oy, x, x, 'blue', 'x²', 16); rect(g, ox + x, oy + x, t, t, 'pink', '9', 16);
          g.append(h('rect', { x: ox + x, y: oy, width: t, height: x, class: 'pl-poly pl-poly--ghost' }), h('rect', { x: ox, y: oy + x, width: x, height: t, class: 'pl-poly pl-poly--ghost' }), txt(ox + x + t / 2, oy + x / 2, '？', 22), txt(ox + x / 2, oy + x + t / 2, '？', 22));
          brace(g, ox, ox + x, oy - 6, 'x', 'pm-blue'); brace(g, ox + x, ox + x + t, oy - 6, '3', 'pm-pink'); braceV(g, oy, oy + x, ox - 6, 'x', 'pm-blue'); braceV(g, oy + x, oy + x + t, ox - 6, '3', 'pm-pink');
          P.choice(box, {}, { id: 'mf-t1', prompt: '小明寫 (x + 3)² ＝ x² + 9，只算了實心的兩塊。圖上少了哪一塊（虛線？）？', options: [{ t: '兩塊 3x（共 6x）', ok: true, fb: '對！中間兩塊長方形 3x、3x 被漏掉，應該是 x² + 6x + 9。' }, { t: '一塊 x²', fb: 'x² 已經有了喔。' }, { t: '一塊 9', fb: '9 已經有了喔。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var g = cv(320, 196), a = 6, b = 1, u = 26, ox = 20, oy = 34, t = 0, done = false;
          function draw() {
            g.innerHTML = ''; var A = a * u, B = b * u, C = (a - b) * u;
            g.append(h('rect', { x: ox + C, y: oy, width: B, height: B, class: 'pl-poly pl-poly--ghost' })); rect(g, ox, oy + B, A, C, 'blue', t < 0.98 ? '50 × 49' : '', 14);
            var c0 = [ox + C / 2, oy + B / 2], c1 = [ox + A + B / 2, oy + B + C / 2], cx = c0[0] + (c1[0] - c0[0]) * t, cy = c0[1] + (c1[1] - c0[1]) * t;
            var pg = h('g', { transform: 'translate(' + cx + ',' + cy + ') rotate(' + (-90 * t) + ')' }); pg.append(h('rect', { x: -C / 2, y: -B / 2, width: C, height: B, class: 'pl-poly pl-poly--pink' })); g.append(pg);
            if (t > 0.98) { brace(g, ox, ox + A + B, oy - 8, '50 ＋ 1 ＝ 51', 'pm-blue'); g.append(txt(ox + A + B + 44, oy + B + C / 2 - 8, '50 − 1', 14, 'pm-pink'), txt(ox + A + B + 44, oy + B + C / 2 + 10, '＝ 49', 14, 'pm-pink')); } else brace(g, ox, ox + A, oy - 8, '50', 'pm-blue');
          }
          draw(); box.append(P.slider(0, 100, 0, function (v) { t = v / 100; draw(); if (t >= 0.98 && !done) done = true; }), h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 原位（示意圖）'), h('span', {}, '搬過去 →')));
          box.append(h('div', { class: 'pl-q', html: '平方差速算：<b>51 × 49</b> ＝ (50 + 1)(50 − 1) ＝ 50² − 1² ＝ ？' }));
          P.numBox(box, { answer: 2499, okMsg: '對！2500 − 1 ＝ 2499。', onOk: next, wrong: function () { return '提示：50² ＝ 2500，再減掉 1² 。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var g = cv(320, 176), u = 40, x0 = 30, y0 = 36;
          g.append(h('line', { x1: x0, y1: y0, x2: x0 + 6 * u, y2: y0, class: 'pl-line pl-line--soft' }));
          for (var i = 0; i <= 6; i++) { g.append(h('line', { x1: x0 + i * u, y1: y0 - 4, x2: x0 + i * u, y2: y0 + 4, class: 'pl-line' })); g.append(txt(x0 + i * u, y0 + 16, String(i), 11)); }
          g.append(h('line', { x1: x0 + 2 * u, y1: y0 - 14, x2: x0 + 5 * u, y2: y0 - 14, class: 'pl-line pl-line--green pl-line--bold' }), txt(x0 + 3.5 * u, y0 - 26, 'a − b ＝ 5 − 2 ＝ 3', 13, 'pm-blue'), h('circle', { cx: x0 + 2 * u, cy: y0, r: 6, class: 'pl-dot pl-dot--pink' }), h('circle', { cx: x0 + 5 * u, cy: y0, r: 6, class: 'pl-dot pl-dot--blue' }), txt(x0 + 2 * u, y0 + 32, 'b', 14, 'pm-pink'), txt(x0 + 5 * u, y0 + 32, 'a', 14, 'pm-blue'));
          rect(g, 40, 90, 3 * 24, 3 * 24, 'blue', '(a−b)² ＝ 9', 13); rect(g, 190, 90, 3 * 24, 3 * 24, 'pink', '(b−a)² ＝ 9', 13);
          P.choice(box, {}, { id: 'mf-t3', prompt: '(a − b)² 和 (b − a)² 相等嗎？', options: [{ t: '相等，都是邊長 3 的正方形面積', ok: true, fb: '對！(b − a) ＝ −3 只是方向反了，邊長還是 3，平方後一樣。' }, { t: '不相等，一個正一個負', fb: '平方永遠不會是負的喔。' }], onAnswer: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'multiplication' }); } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 7 完成 */
    function (st) {
      P.complete(st, {
        id: 'multiplication', moduleName: '乘法公式的圖解', askAbout: '國八代數', aha: '乘法公式不是要背的：<br>它是同一塊面積，切成不同的塊。',
        cards: [{ text: '(a + b)² ＝ a² + 2ab + b²；(a − b)² ＝ a² − 2ab + b²', src: '國二「乘法公式與多項式」（獵豹 J81A CH1、J81S CH4）' }, { text: '(a + b)(a − b) ＝ a² − b²；(x + p)(x + q) ＝ x² + (p + q)x + pq', src: '國二「乘法公式」與國三「因式分解」的共同基礎' }],
        depth: { here: 0.18, cheetah: [{ at: 0.45, label: '配方法<br>平方差速算' }, { at: 0.85, label: '算幾不等式<br>代數恆等變形' }] },
        teasers: [
          { title: '配方法＝補成正方形', q: 'x² + 6x 缺哪一塊才能補成完整正方形？這招如何找出最小值？', where: 'J81A CH4', lv: 'L2' },
          { title: '立方公式與 (a+b)³', q: '把正方形升級成正方體：(a + b)³ 會切成幾塊？每塊是什麼？', where: 'J81A／J81S 延伸、高中二項式定理', lv: 'L2' },
          { title: '算幾不等式', q: '周長固定，什麼形狀面積最大？(a + b)² ≥ 4ab 與正方形的關係。', where: '高中數學班（S 系列）、競賽基礎', lv: 'L3' },
          { title: '代數恆等變形（Sophie Germain）', q: 'a⁴ + 4b⁴ 竟然能因式分解？怎麼「補」出平方差？', where: '資優／競賽班', lv: 'L3' }],
        parent: { pitfall: '最常見的錯誤是 (a + b)² ＝ a² + b²，漏掉中間兩塊 2ab；(a − b)² 則常忘記最後的 ＋b²。死背口訣，換個外觀就忘。', place: '國二「乘法公式」是因式分解、一元二次方程式、二次函數配方的共同地基。', ask: ['(a + b)² 的圖裡有哪四塊？', '為什麼 (a − b)² 要 ＋b²？', '51 × 49 怎麼用平方差在心裡算？'] },
        classes: ['J81A CH1：乘法公式與多項式', 'J81S CH4：乘法公式與因式分解', 'J81A CH4：配方法', '高中 S 系列：二項式定理與不等式'],
        next: { href: 'play-trig-circle.html', text: '下一個：三角函數的單位圓' } });
    }];
  new P.Lesson({ id: 'multiplication', title: '乘法公式的圖解', steps: steps });
})();
