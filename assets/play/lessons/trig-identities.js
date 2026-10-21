/* 獵豹玩中學｜三角公式看得見：誘導公式＝鏡射、和角公式＝旋轉、倍角公式（單位圓，半徑 5 格＝1） */
(function () {
  var P = Play, h = P.h, rad = Math.PI / 180, C = [6, 6], R = 5;
  function stage(st) { var w = h('div', { class: 'pl-stage' }); st.append(w); return w; }
  function f2(n) { var s = (Math.round(n * 100) / 100).toFixed(2); s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; }
  var LAT = (function () { var c = []; for (var x = 0; x <= 12; x++) for (var y = 0; y <= 12; y++) if (Math.pow(x - C[0], 2) + Math.pow(y - C[1], 2) === R * R) c.push([x, y]); return c; })();
  function onCircle(raw) { var dx = raw[0] - C[0], dy = raw[1] - C[1], L = Math.hypot(dx, dy) || 1; return [C[0] + R * dx / L, C[1] + R * dy / L]; }
  function deg(p) { var a = Math.atan2(p[1] - C[1], p[0] - C[0]) / rad; return a < 0 ? a + 360 : a; }
  function thetaMark(b, p, g, sym) {
    var th = deg(p); if (th < 3) return; var pts = [], k, a;
    for (k = 0; k <= 24; k++) { a = th * k / 24 * rad; pts.push([C[0] + 1.3 * Math.cos(a), C[1] + 1.3 * Math.sin(a)]); }
    g.append(h('polyline', { points: b.pts(pts), class: 'pl-line pl-line--amber', fill: 'none' }));
    a = th / 2 * rad; b.text([C[0] + 2.1 * Math.cos(a), C[1] + 2.1 * Math.sin(a) - 0.25], sym || 'θ', 'pl-text pl-text--amber pl-text--lg', g);
  }
  function unitBoard(host, sm) {
    var b = new P.Board(host, { w: 12, h: 12, pad: 0.5, axes: true, ox: 6, oy: 6, cls: sm ? 'pl-svg--sm' : '' }); if (!sm) P.snapSwitch(b, host);
    b.circle(C, R, 'pl-circle pl-circle--unit'); b.text([C[0] - 0.4, C[1] - 0.5], 'O', 'pl-text pl-text--sm');
    return b;
  }
  function cs(p) { return [(p[0] - C[0]) / R, (p[1] - C[1]) / R]; }
  function pt(c, s) { return [C[0] + R * c, C[1] + R * s]; }
  function circH(b, start, cls, onMove) { return b.handle({ pos: start, cls: cls, candidates: function () { return b.snapOn ? LAT : null; }, constrain: onCircle, onMove: onMove }); }

  var steps = [
    /* 1 誘導公式＝鏡射 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '誘導公式'), P.instr('不用背！按下面四個按鈕，看 P 的<b>鏡中像 P′</b> 跑到哪。'));
      var host = stage(st), b = unitBoard(host), g = h('g'); b.gMid.append(g);
      var P0 = [10, 9], cur = 0, seen = {}, n = 0;
      var T = [
        { n: '−θ', name: 'x 軸鏡射', f: function (c, s) { return [c, -s]; }, line: [[0, 6], [12, 6]], sin: 'sin(−θ) ＝ −sin θ', cos: 'cos(−θ) ＝ cos θ' },
        { n: '180°−θ', name: 'y 軸鏡射', f: function (c, s) { return [-c, s]; }, line: [[6, 0], [6, 12]], sin: 'sin(180°−θ) ＝ sin θ', cos: 'cos(180°−θ) ＝ −cos θ' },
        { n: '180°+θ', name: '對原點翻轉', f: function (c, s) { return [-c, -s]; }, line: null, sin: 'sin(180°+θ) ＝ −sin θ', cos: 'cos(180°+θ) ＝ −cos θ' },
        { n: '90°−θ', name: '對 y＝x 鏡射', f: function (c, s) { return [s, c]; }, line: [[0, 0], [12, 12]], sin: 'sin(90°−θ) ＝ cos θ', cos: 'cos(90°−θ) ＝ sin θ' }];
      var pS = P.pill('', 'is-pink'), pC = P.pill('', 'is-blue'), ro = h('div', { class: 'pl-readout' }, pS, pC), seg = h('div', { class: 'pl-seg' });
      var btns = T.map(function (t, i) { var bt = h('button', { type: 'button', class: 'pl-opt' }, t.n); bt.addEventListener('click', function () { cur = i; draw(hd.pos); if (!seen[i]) { seen[i] = 1; n++; } if (n >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'trig-identities', step: 1 }); st.append(P.ruleBox('誘導公式＝<b>對稱</b>：鏡射只會讓座標<b>變號</b>或<b>對調</b>。<br>(x, y) → (x, −y)、(−x, y)、(−x, −y)、(y, x)', '看得見')); api.unlock('四個公式都是鏡射！'); } }); seg.append(bt); return bt; });
      function draw(p) {
        g.innerHTML = ''; var q = cs(p), t = T[cur], r = t.f(q[0], q[1]), Q = pt(r[0], r[1]); thetaMark(b, p, g);
        btns.forEach(function (bt, i) { bt.classList.toggle('is-sel', i === cur); });
        if (t.line) b.line(t.line[0], t.line[1], 'pl-line pl-line--green pl-line--dash pl-line--bold', g); else b.dot(C, 'pl-dot pl-dot--green', g, 0.26);
        b.line(p, Q, 'pl-line pl-line--amber pl-line--dash', g); b.line(C, p, 'pl-line', g); b.line(C, Q, 'pl-line pl-line--pink', g); b.dot(Q, 'pl-dot pl-dot--pink', g, 0.26);
        b.text([Q[0] + (Q[0] >= C[0] ? 0.7 : -0.7), Q[1] + 0.5], 'P′', 'pl-text pl-text--pink', g);
        pS.textContent = t.sin; pC.textContent = t.cos;
      }
      var hd = circH(b, P0, '', function (tp) { draw(tp); });
      draw(P0); st.append(seg, ro, P.hint('也可以拖動 P，看公式是不是永遠成立。')); api.lock('四個按鈕都按一次');
    },
    /* 2 和角公式＝旋轉 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '和角公式'), P.instr('拖動<b>藍點 α</b> 和<b>粉紅點 β</b>。把「旋轉 α 的座標軸」當尺，量 β 的位置。'));
      var host = stage(st), b = unitBoard(host), g = h('g'); b.gMid.append(g);
      var A0 = [10, 9], B0 = [9, 10], moved = { a: 0, b: 0 };
      var pX = P.pill('', 'is-blue'), pY = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout pl-readout--col' }, pX, pY), A, Bp;
      function draw() {
        g.innerHTML = ''; var a = cs(A), bb = cs(Bp), ca = a[0], sa = a[1], cb = bb[0], sb = bb[1];
        b.text([A[0] + (A[0] >= C[0] ? 0.9 : -0.9), A[1] + 0.5], 'α', 'pl-text pl-text--blue pl-text--lg', g); b.text([Bp[0] + (Bp[0] >= C[0] ? 0.9 : -0.9), Bp[1] + 0.5], 'β', 'pl-text pl-text--pink pl-text--lg', g); thetaMark(b, A, g, 'α'); 
        var e1 = [ca, sa], e2 = [-sa, ca], p1 = pt(cb * ca, cb * sa), p2 = [p1[0] + R * sb * e2[0], p1[1] + R * sb * e2[1]];
        b.line(C, pt(ca, sa), 'pl-line pl-line--soft', g); b.line(C, pt(e2[0], e2[1]), 'pl-line pl-line--soft', g); b.line(C, Bp, 'pl-line pl-line--soft', g);
        b.line(C, p1, 'pl-line pl-line--blue pl-line--bold', g); b.line(p1, p2, 'pl-line pl-line--pink pl-line--bold', g); b.line(C, p2, 'pl-line', g); b.dot(p2, 'pl-dot pl-dot--green', g, 0.3);
        b.text([p2[0] + (p2[0] >= C[0] ? 0.9 : -0.9), p2[1] + 0.6], 'α+β', 'pl-text pl-text--green', g);
        var res = [cb * ca - sb * sa, cb * sa + sb * ca];
        pX.textContent = 'cos(α+β) ＝ ' + f2(ca) + '×' + f2(cb) + ' − ' + f2(sa) + '×' + f2(sb) + ' ＝ ' + f2(res[0]);
        pY.textContent = 'sin(α+β) ＝ ' + f2(sa) + '×' + f2(cb) + ' + ' + f2(ca) + '×' + f2(sb) + ' ＝ ' + f2(res[1]);
      }
      function chk() { if (moved.a && moved.b && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'trig-identities', step: 2 }); st.append(P.ruleBox('旋轉 α 之後，(cos β, sin β) 變成<br><b>cos β·(cos α, sin α) ＋ sin β·(−sin α, cos α)</b><br>所以 <b>cos(α+β) ＝ cosα cosβ − sinα sinβ</b>、<b>sin(α+β) ＝ sinα cosβ + cosα sinβ</b>', '公式')); api.unlock('和角公式是旋轉合成！'); } }
      A = A0; Bp = B0;
      circH(b, A0, 'is-blue', function (t) { A = t; moved.a = 1; draw(); chk(); }); circH(b, B0, 'is-pink', function (t) { Bp = t; moved.b = 1; draw(); chk(); });
      draw(); st.append(ro, P.hint('藍線＝沿 α 方向走 cos β；粉紅線＝轉 90° 方向走 sin β。終點就是 α＋β。')); api.lock('兩個點都拖一下');
    },
    /* 3 倍角 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '倍角公式'), P.instr('讓 β ＝ α（兩次轉一樣的角）。拖動 α，看 <b>2α</b>。'));
      var host = stage(st), b = unitBoard(host), g = h('g'); b.gMid.append(g); var A = [10, 9], n = 0, ask = h('div', {});
      var pX = P.pill('', 'is-blue'), pY = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout pl-readout--col' }, pX, pY);
      function draw() {
        g.innerHTML = ''; thetaMark(b, A, g, 'α'); var a = cs(A), ca = a[0], sa = a[1], p1 = pt(ca * ca, ca * sa), p2 = [p1[0] + R * sa * (-sa), p1[1] + R * sa * ca];
        b.line(C, A, 'pl-line pl-line--soft', g); b.line(C, p1, 'pl-line pl-line--blue pl-line--bold', g); b.line(p1, p2, 'pl-line pl-line--pink pl-line--bold', g); b.line(C, p2, 'pl-line', g); b.dot(p2, 'pl-dot pl-dot--green', g, 0.3); b.text([p2[0] + (p2[0] >= C[0] ? 0.9 : -0.9), p2[1] + 0.6], '2α', 'pl-text pl-text--green', g);
        pX.textContent = 'cos 2α ＝ cos²α − sin²α ＝ ' + f2(ca * ca) + ' − ' + f2(sa * sa) + ' ＝ ' + f2(ca * ca - sa * sa);
        pY.textContent = 'sin 2α ＝ 2 sinα cosα ＝ 2×' + f2(sa) + '×' + f2(ca) + ' ＝ ' + f2(2 * sa * ca);
      }
      circH(b, A, 'is-blue', function (t) { A = t; draw(); n++; if (n >= 2 && !ask.firstChild) showAsk(); });
      function showAsk() {
        var qb = h('div', {}); ask.append(qb); qb.append(h('div', { class: 'pl-q', html: '某個 α 的 <b>cos α ＝ 0.6、sin α ＝ 0.8</b>。<br><b>sin 2α ＝ ？</b>' }));
        P.numBox(qb, { answer: 0.96, okMsg: '對！sin 2α ＝ 2 × 0.8 × 0.6 ＝ 0.96。', onOk: function () { P.track('aha', { id: 'trig-identities', step: 3 }); setTimeout(function () { qb.style.display = 'none'; }, 1100); ask.append(P.ruleBox('<b>sin 2α ＝ 2 sinα cosα</b>，<b>cos 2α ＝ cos²α − sin²α</b>。<br>倍角公式＝和角公式裡 β ＝ α。', '公式')); api.unlock('倍角也是旋轉！'); }, wrong: function (v) { return v === 1.6 || v === 1.2 ? '提示：2 × sinα × cosα，兩個數相乘後再乘 2。' : '提示：sin 2α ＝ 2 sinα cosα。'; } });
      }
      draw(); st.append(ro, ask, P.hint('拖動 α 兩次以上，會出現一個問題。')); api.lock('拖動 α，再回答問題');
    },
    /* 4 換個外觀（每題都有圖） */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function sb() { var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); return unitBoard(host, true); }
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var b = sb(), g = h('g'); b.gMid.append(g); var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'); box.append(h('div', { class: 'pl-readout' }, pa, pb));
          function draw(p) {
            g.innerHTML = ''; var q = cs(p), Q = pt(-q[0], q[1]); thetaMark(b, p, g); b.line(C, p, 'pl-line', g); b.line(C, Q, 'pl-line pl-line--pink', g); b.line(p, Q, 'pl-line pl-line--amber pl-line--dash', g);
            b.line([p[0], C[1]], p, 'pl-line pl-line--blue pl-line--bold', g); b.line([Q[0], C[1]], Q, 'pl-line pl-line--pink pl-line--bold', g); b.dot(Q, 'pl-dot pl-dot--pink', g, 0.24); b.text([Q[0] - 0.4, Q[1] + 0.8], '180°−θ', 'pl-text pl-text--pink pl-text--sm', g);
            pa.textContent = 'sin θ ＝ ' + f2(q[1]); pb.textContent = 'sin(180°−θ) ＝ ' + f2(q[1]);
          }
          b.handle({ pos: pt(Math.cos(30 * rad), Math.sin(30 * rad)), candidates: null, constrain: onCircle, valid: function (p) { return p[0] > C[0] + 0.3 && p[1] > C[1] + 0.3; }, onMove: draw }); draw(pt(Math.cos(30 * rad), Math.sin(30 * rad)));
          P.choice(box, {}, { id: 'ti-t1', prompt: '拖動 P，看它對 y 軸的鏡中像。sin(180° − 30°) 等於？', options: [{ t: 'sin 30°', ok: true, fb: '對！180°−θ 是 y 軸鏡射，高度（sin θ）不變。' }, { t: '−sin 30°', fb: 'y 軸鏡射只改橫座標的正負，高度不變。' }, { t: 'cos 30°', fb: '對調座標的是 90°−θ。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var b = sb(), A = [10, 9], Bp = [9, 10], a = cs(A), bb = cs(Bp), e2 = [-a[1], a[0]];
          var p1 = pt(bb[0] * a[0], bb[0] * a[1]), p2 = [p1[0] + R * bb[1] * e2[0], p1[1] + R * bb[1] * e2[1]];
          b.line(C, A, 'pl-line pl-line--soft'); b.line(C, Bp, 'pl-line pl-line--soft'); b.dot(A, 'pl-dot pl-dot--blue', null, 0.22); b.dot(Bp, 'pl-dot pl-dot--pink', null, 0.22);
          b.line(C, p1, 'pl-line pl-line--blue pl-line--bold'); b.line(p1, p2, 'pl-line pl-line--pink pl-line--bold'); b.line(C, p2, 'pl-line'); b.dot(p2, 'pl-dot pl-dot--green', null, 0.3);
          b.text([A[0] + 0.9, A[1] + 0.2], 'α', 'pl-text pl-text--blue'); b.text([Bp[0] - 0.2, Bp[1] + 0.8], 'β', 'pl-text pl-text--pink'); b.text([p2[0] + 1.1, p2[1] + 0.5], 'α+β', 'pl-text pl-text--green pl-text--sm'); b.text([(C[0] + p1[0]) / 2 + 2.3, (C[1] + p1[1]) / 2 - 0.8], 'cosβ·cosα', 'pl-text pl-text--blue pl-text--sm');
          P.choice(box, {}, { id: 'ti-t2', prompt: '橫座標由藍線（沿 α 走）與粉紅線（轉 90° 走）合成。cos(α + β) 的正確展開是？', options: [{ t: 'cosα cosβ − sinα sinβ', ok: true, fb: '對！橫座標：cosβ·cosα 再減掉 sinβ·sinα（粉紅線往左退）。' }, { t: 'cosα cosβ ＋ sinα sinβ', fb: '那是 cos(α − β)。' }, { t: 'cosα ＋ cosβ', fb: '旋轉合成不是直接把兩個值相加喔。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var b = sb(), s2 = Math.SQRT1_2, P45 = pt(s2, s2), P90 = [6, 11];
          b.line(C, P45, 'pl-line pl-line--blue pl-line--bold'); b.line(C, P90, 'pl-line pl-line--pink pl-line--bold'); b.line(C, [11, 6], 'pl-line pl-line--soft');
          function arcP(r, from, to) { var q = []; for (var j = 0; j <= 20; j++) { var t = (from + (to - from) * j / 20) * rad; q.push([C[0] + r * Math.cos(t), C[1] + r * Math.sin(t)]); } return q; }
          b.gMid.append(h('polyline', { points: b.pts(arcP(1.6, 0, 45)), class: 'pl-line pl-line--amber', fill: 'none' }), h('polyline', { points: b.pts(arcP(2.4, 45, 90)), class: 'pl-line pl-line--amber', fill: 'none' }));
          b.dot(P45, 'pl-dot pl-dot--blue', null, 0.24); b.dot(P90, 'pl-dot pl-dot--pink', null, 0.24); b.text([8.3, 6.5], '45°', 'pl-text pl-text--amber pl-text--sm'); b.text([7.3, 8.2], '再 45°', 'pl-text pl-text--amber pl-text--sm'); b.text([P45[0] + 1.3, P45[1] + 0.3], '45°', 'pl-text pl-text--blue pl-text--sm'); b.text([7.5, 11.2], '90° ＝ 2 × 45°', 'pl-text pl-text--pink pl-text--sm');
          box.append(h('div', { class: 'pl-q', html: '45° 轉兩次是 90°。用倍角公式：<br>sin 90° ＝ 2 sin45° cos45° ＝ 2 × (√2/2) × (√2/2) ＝ ？' }));
          P.numBox(box, { answer: 1, okMsg: '對！2 × 1/2 ＝ 1，和圖上 90° 的位置（最高點）一致。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-identities' }); }, wrong: function () { return '提示：√2/2 × √2/2 ＝ 1/2，再乘 2。'; } });
        }];
      function next() { setTimeout(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 5 完成 */
    function (st) {
      P.complete(st, {
        id: 'trig-identities', moduleName: '三角公式看得見', askAbout: '高中三角函數', aha: '誘導公式是「鏡射」，和角公式是「旋轉」，<br>都不是要死背的口訣。',
        cards: [{ text: '誘導公式：−θ、180°±θ、90°−θ 都是對稱，只改變號或對調 sin、cos', src: '高一「廣義角與三角函數」（獵豹 S102 CH4）' }, { text: '和角、倍角公式：旋轉 α 再旋轉 β ＝ 旋轉 α＋β', src: '高二「三角函數 II」（獵豹 S111 CH1）' }],
        depth: { here: 0.4, cheetah: [{ at: 0.62, label: '積化和差<br>疊合' }, { at: 0.92, label: '複數旋轉<br>托勒密' }] },
        teasers: [
          { title: '積化和差與和差化積', q: '2 sinα cosβ 為什麼能變成 sin(α+β) + sin(α−β)？用菱形對角線看穿。', where: 'S111 CH1 三角函數 II', lv: 'L2' },
          { title: '疊合：a sin x ＋ b cos x', q: '兩個波相加竟然還是一個波，振幅與相位怎麼找？', where: 'S111 CH1', lv: 'L2' },
          { title: '複數與棣美弗定理', q: '乘以 (cos θ ＋ i sin θ) 就是旋轉 θ！和角公式一行推出。', where: '高二／競賽班', lv: 'L3' },
          { title: '托勒密定理與三角恆等式', q: '圓內接四邊形的對角線積，竟然藏著和角公式。', where: '競賽幾何班（PK4B 延伸）', lv: 'L3' }],
        parent: { pitfall: '高中生常在公式堆裡硬背：誘導公式有 28 條、和角公式正負號容易錯。沒有圖像，考試時一緊張就記混。', place: '高一到高二的三角函數核心；學測、分科與 AMC 的三角題都依賴它。', ask: ['sin(180° − θ) 為什麼等於 sin θ？（畫單位圓）', 'cos(α+β) 的負號從哪裡來？', '倍角公式和和角公式是什麼關係？'] },
        classes: ['S102 CH4：三角函數', 'S111 CH1：三角函數 II', 'J91A（2607）：三角比（先備）'],
        next: { href: 'play.html', text: '回獵豹玩中學看全部單元' } });
    }];
  new P.Lesson({ id: 'trig-identities', title: '三角公式看得見', steps: steps });
})();
