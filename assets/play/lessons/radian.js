/* 獵豹玩中學｜弧度：把半徑捲到圓周上
   一段一段捲半徑長的繩子（1 弧度 ≈ 57.3°）→ 拖動點看角度與弧度 → 3 個操作關卡（找弧度、找 π 的分數、弧長與扇形面積）。 */
(function () {
  var P = Play, h = P.h, G = PlayGeo, rad = G.rad, C = [6, 5.2], R = 3.6, PI = Math.PI;
  var COL = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f', '#7a4fd6', '#e8590c', '#0ca5a0'];
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  /* 角度（度）→ 「π 的幾分之幾」文字；不是常見的就回 null */
  function piText(deg) { var g = gcd(Math.round(deg), 180), n = Math.round(deg) / g, d = 180 / g; if (Math.abs(deg - Math.round(deg)) > 1e-9 || deg === 0) return null; return (n === 1 ? '' : n) + 'π' + (d === 1 ? '' : '/' + d); }
  function arcD(board, c, r, a0, a1) { var p0 = G.polar(c, r, a0), p1 = G.polar(c, r, a1), large = Math.abs(a1 - a0) > 180 ? 1 : 0; return 'M ' + p0[0] + ' ' + board.Y(p0[1]) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' + p1[0] + ' ' + board.Y(p1[1]); }
  function circleBoard(host, cls) { var b = new P.Board(host, { w: 12, h: 10, cls: cls }); b.circle(C, R, 'pl-circle pl-circle--unit'); b.line(C, [C[0] + R + 0.8, C[1]], 'pl-line pl-line--soft'); b.dot(C, 'pl-dot', null, 0.14); b.text([C[0] - 0.45, C[1] - 0.6], 'O', 'pl-text'); return b; }
  function ring(step) { var out = [], d; for (d = step; d <= 360; d += step) out.push(G.polar(C, R, d % 360 === 0 ? 0.0001 : d)); return out; }
  function degOf(t) { var d = Math.round(G.norm(G.dirTo(C, t))); return d === 0 ? 360 : d; }
  function pillRow(host, defs) { var row = h('div', { class: 'pl-readout' }), out = []; defs.forEach(function (c) { var p = P.pill('', c); out.push(p); row.append(p); }); host.append(row); return out; }

  var steps = [
    /* 1. 把半徑捲到圓周上 */
    function (st, api) {
      var gate = { on: true }, k = 0, done = false;
      P.choice(st, api, { id: 'rd-p1', predict: true, label: '先猜猜看', prompt: '拿一條和<b>半徑一樣長</b>的繩子，沿著圓周一段一段捲。捲滿<b>一圈</b>需要幾條？', row: true, options: [{ t: '3 條多一點' }, { ok: true, t: '6 條多一點' }, { t: '剛好 8 條' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('按「再捲一段」，一段一段捲'); } });
      var host = stage(st), b = circleBoard(host), g = h('g'); b.gMid.append(g);
      b.line([0.6, 1.0], [0.6 + R, 1.0], 'pl-line pl-line--amber pl-line--bold'); b.text([0.6 + R / 2, 0.35], '一條繩子 ＝ 半徑 r', 'pl-text pl-text--sm');
      var pk = P.pill('', 'is-blue'), pa = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pk, pa), bt = h('button', { type: 'button', class: 'button button--primary pl-small' }, '再捲一段'), br = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '重來');
      st.append(h('div', { class: 'pl-row pl-row--center' }, bt, br), ro);
      function draw() {
        g.innerHTML = ''; var i, full = k >= 7, a0, a1;
        for (i = 0; i < k; i++) { a0 = i * 180 / PI; a1 = Math.min((i + 1) * 180 / PI, 360); var d = arcD(b, C, R, a0, a1); g.append(h('path', { d: d, fill: 'none', stroke: COL[i % 7], 'stroke-width': 7, 'stroke-linecap': 'butt', style: 'vector-effect:non-scaling-stroke' })); b.line(C, G.polar(C, R, a1), 'pl-line pl-line--soft', g); }
        var shown = Math.min(k, 6) + (k >= 7 ? (2 * PI - 6) : 0);
        pk.textContent = k === 0 ? '還沒開始捲' : (k >= 7 ? '捲滿一圈：6 條 ＋ 一小段' : '捲了 ' + k + ' 條'); pa.className = 'pl-pill ' + (full ? 'is-ok' : 'is-amber');
        pa.textContent = k === 0 ? '1 條繩子對的角 ≈ 57.3°' : (full ? '一圈 ≈ ' + f2(shown) + ' 條（＝ 2π）' : k + ' 條 ≈ ' + f2(k * 180 / PI) + '°'); bt.disabled = full;
        if (k === 1) { var w = G.wedge(C, 0, 180 / PI, 1.2, 180 / PI); b.poly(w.pts, 'pl-poly pl-poly--blue', g); var tp = G.polar(C, 1.9, w.bis); b.text([tp[0], tp[1] - 0.15], '1 弧度', 'pl-text pl-text--blue pl-text--sm', g); }
        if (full && !done) { done = true; P.toast(api.ctx.p1 === 1 ? '你猜對了！' : '6 條多一點，不是整數'); P.track('aha', { id: 'radian', step: 1 }); st.append(P.ruleBox('<b>弧長剛好等於半徑</b>的那段弧，所對的圓心角叫 <b>1 弧度</b>（≈ 57.3°）。<br>一圈要 <b>2π ≈ 6.28</b> 條繩子，所以<b>一圈 ＝ 2π 弧度 ＝ 360°</b>、半圈 ＝ π 弧度。', '弧度')); api.unlock('1 弧度 ≈ 57.3°！'); }
      }
      bt.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } if (k < 7) { k++; draw(); } }); br.addEventListener('click', function () { if (!done) { k = 0; draw(); } });
      api.solve(function () { gate.on = false; k = 7; draw(); }); draw(); st.append(P.hint('每一段繩子和半徑一樣長（金色那條）。一直捲，看看最後剩下多少。')); api.lock('先做上面的預測');
    },
    /* 2. 拖動點：角度、弧度、弧長 */
    function (st, api) {
      st.append(P.instr('拖動圓上的<b>綠點</b>，同時看<b>角度</b>和<b>弧度</b>，還有弧長是半徑的幾倍。'));
      var host = stage(st), b = circleBoard(host), g = h('g'), pills = pillRow(st, ['is-blue', 'is-pink', 'is-amber']), seen = {}, n = 0, done = false; b.gMid.append(g);
      function draw(deg) {
        g.innerHTML = ''; var w = G.wedge(C, 0, deg, 1.3, deg), r = deg * PI / 180; b.poly(w.pts, 'pl-poly pl-poly--blue', g); g.append(h('path', { d: arcD(b, C, R, 0, deg > 359.9 ? 359.9 : deg), fill: 'none', stroke: '#d6336c', 'stroke-width': 7, style: 'vector-effect:non-scaling-stroke' }));
        var tp = G.polar(C, 2.2, w.bis); b.text([tp[0], tp[1] - 0.2], deg + '°', 'pl-text pl-text--blue pl-text--lg', g); var pt = piText(deg);
        pills[0].textContent = '角度 ＝ ' + deg + '°'; pills[1].textContent = '弧度 ＝ ' + (pt ? pt + ' ≈ ' : '') + f2(r); pills[2].textContent = '弧長 ＝ ' + f2(r) + ' × 半徑';
      }
      var hd = b.handle({ pos: G.polar(C, R, 60), candidates: ring(15), onMove: function (t) { var d = degOf(t); draw(d); if (!seen[d]) { seen[d] = 1; n++; } if (n >= 6 && !done) { done = true; P.track('aha', { id: 'radian', step: 2 }); st.append(P.ruleBox('<b>弧度 ＝ 弧長 ÷ 半徑</b>。所以 180° ＝ π 弧度、90° ＝ π/2、60° ＝ π/3、360° ＝ 2π。<br>弧度是「沒有單位」的角度：直接就是弧長是半徑的幾倍。', '弧度與角度')); api.unlock('弧度 ＝ 弧長 ÷ 半徑！'); } } });
      api.solve(function () { [30, 90, 135, 180, 270, 345].forEach(function (d) { hd.moveTo(G.polar(C, R, d)); }); }); draw(60); st.append(P.hint('至少看 6 個角度。90° 會出現直角符號，看看它的弧度是多少。')); api.lock('拖動綠點，看 6 個角度');
    },
    /* 3. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：找出幾弧度 */
        function (b0, done, setSolve) {
          var T = [{ k: 1, d: [57, 58] }, { k: 2, d: [114, 115] }, { k: 3, d: [171, 172] }], ti = 0, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var b = circleBoard(host, 'pl-svg--sm'), pills = pillRow(b0, ['is-blue', 'is-pink', 'is-amber']); b.gMid.append(g);
          function txt() { info.innerHTML = '拖動綠點，讓<b>弧長剛好是半徑的 ' + T[Math.min(ti, 2)].k + ' 倍</b>（<b>' + T[Math.min(ti, 2)].k + ' 弧度</b>）。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw(deg) { g.innerHTML = ''; var w = G.wedge(C, 0, deg, 1.3, deg), r = deg * PI / 180; b.poly(w.pts, 'pl-poly pl-poly--blue', g); g.append(h('path', { d: arcD(b, C, R, 0, deg > 359.9 ? 359.9 : deg), fill: 'none', stroke: '#d6336c', 'stroke-width': 7, style: 'vector-effect:non-scaling-stroke' })); var tl = G.polar(C, 2.2, w.bis); b.text([tl[0], tl[1] - 0.2], deg + '°', 'pl-text pl-text--blue pl-text--lg', g); pills[0].textContent = '角度 ＝ ' + deg + '°'; pills[1].textContent = '弧度 ＝ ' + f2(r); pills[2].textContent = '弧長 ÷ 半徑 ＝ ' + f2(r); return r; }
          var hd = b.handle({ pos: G.polar(C, R, 30), candidates: ring(1), onMove: function (t) { var d = degOf(t); draw(d); if (ti < 3 && T[ti].d.indexOf(d) >= 0) { ti++; if (ti >= 3) { P.toast('每多 1 弧度，就多 ≈ 57.3°'); P.track('aha', { id: 'radian', step: 3 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } } } });
          draw(30); setSolve(function () { while (ti < 3) hd.moveTo(G.polar(C, R, T[ti].d[0])); }); txt(); b0.append(P.hint('1 弧度 ≈ 57.3°。你需要剛剛好的位置，可以慢慢拖。'));
        },
        /* 關 2：找出 π 的分數 */
        function (b0, done, setSolve) {
          var T = [{ t: 'π/2', d: 90 }, { t: 'π', d: 180 }, { t: '2π', d: 360 }], ti = 0, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var b = circleBoard(host, 'pl-svg--sm'), pills = pillRow(b0, ['is-blue', 'is-pink', 'is-amber']); b.gMid.append(g);
          function txt() { info.innerHTML = '拖動綠點，讓角剛好是 <b>' + T[Math.min(ti, 2)].t + ' 弧度</b>。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw(deg) { g.innerHTML = ''; var w = G.wedge(C, 0, deg > 359.9 ? 359.9 : deg, 1.3, deg > 359.9 ? 359.9 : deg), r = deg * PI / 180; b.poly(w.pts, 'pl-poly pl-poly--blue', g); g.append(h('path', { d: arcD(b, C, R, 0, deg > 359.9 ? 359.9 : deg), fill: 'none', stroke: '#d6336c', 'stroke-width': 7, style: 'vector-effect:non-scaling-stroke' })); var tl2 = G.polar(C, 2.2, w.bis); b.text([tl2[0], tl2[1] - 0.2], deg + '°', 'pl-text pl-text--blue pl-text--lg', g); var pt = piText(deg === 360 ? 360 : deg); pills[0].textContent = '角度 ＝ ' + deg + '°'; pills[1].textContent = '弧度 ＝ ' + (pt ? pt + ' ≈ ' : '') + f2(r); pills[2].textContent = deg === 90 ? '✓ 直角 ＝ π/2' : (deg === 180 ? '✓ 半圓 ＝ π' : (deg === 360 ? '✓ 一整圈 ＝ 2π' : '')); }
          var hd = b.handle({ pos: G.polar(C, R, 45), candidates: ring(1), onMove: function (t) { var d = degOf(t); draw(d); if (ti < 3 && d === T[ti].d) { ti++; if (ti >= 3) { P.toast('π/2、π、2π ＝ 四分之一圈、半圈、一整圈'); P.track('aha', { id: 'radian', step: 4 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } } } });
          draw(45); setSolve(function () { while (ti < 3) hd.moveTo(G.polar(C, R, T[ti].d)); }); txt(); b0.append(P.hint('一整圈是 2π。想想 π/2 是一整圈的幾分之幾？'));
        },
        /* 關 3：弧長與扇形面積 */
        function (b0, done, setSolve) {
          var th = 2, T = [{ t: '弧長 ＝ <b>10</b>', f: function (r) { return r * th === 10; }, r: 5 }, { t: '扇形面積 ＝ <b>16</b>', f: function (r) { return r * r * th / 2 === 16; }, r: 4 }], ti = 0, r = 2, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); b.gMid.append(g); var pills = pillRow(b0, ['is-blue', 'is-pink', 'is-amber']);
          var sr = P.stepper('半徑 r', 1, 6, r, function (v) { r = v; draw(); }); b0.append(h('div', { class: 'pl-steprow' }, sr.el));
          function txt() { info.innerHTML = '扇形的圓心角固定是 <b>2 弧度</b>。調整半徑 r，讓<b>' + T[Math.min(ti, 1)].t + '</b>。<small>（目標 ' + (Math.min(ti, 1) + 1) + ' / 2）</small>'; }
          function draw() {
            g.innerHTML = ''; var O2 = [3, 1.5], sc = 1.4, rr = r * sc, a0 = 0, a1 = th * 180 / PI, pts = [O2], i; for (i = 0; i <= 30; i++) { var a = (a0 + (a1 - a0) * i / 30) * rad; pts.push([O2[0] + rr * Math.cos(a), O2[1] + rr * Math.sin(a)]); }
            b.poly(pts, 'pl-poly pl-poly--amber', g); g.append(h('path', { d: arcD(b, O2, rr, a0, a1), fill: 'none', stroke: '#d6336c', 'stroke-width': 6, style: 'vector-effect:non-scaling-stroke' })); b.text([O2[0] + 2.2, O2[1] - 0.2], '2 弧度', 'pl-text pl-text--sm', g);
            pills[0].textContent = '半徑 r ＝ ' + r; pills[1].textContent = '弧長 ＝ r × 2 ＝ ' + r * th; pills[2].textContent = '面積 ＝ ½ × r² × 2 ＝ ' + r * r * th / 2;
            if (ti < 2 && T[ti].f(r)) { ti++; if (ti >= 2) { P.toast('弧長 ＝ rθ、面積 ＝ ½r²θ'); P.track('aha', { id: 'radian', step: 5 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { while (ti < 2) sr.set(T[ti].r); }); txt(); draw(); b0.append(P.hint('弧長 ＝ 半徑 × 弧度；扇形面積 ＝ ½ × 半徑² × 弧度。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'radian' }); } });
    },
    /* 4. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'radian', moduleName: '弧度：把半徑捲到圓周上', askAbout: '高中三角函數與弧度', aha: '弧長剛好等於半徑，圓心角就是 1 弧度；<br>一圈是 2π 弧度，弧度 ＝ 弧長 ÷ 半徑。',
        cards: [{ text: '弧度 ＝ 弧長 ÷ 半徑；180° ＝ π 弧度；弧長 s ＝ rθ、扇形面積 ＝ ½r²θ', src: '高中「三角函數」（高中數學課綱）' }, { text: '國中的弧長與扇形面積：圓心角 ÷ 360° × 圓周長（圓面積）', src: '國三「圓」' }],
        depth: { here: 0.3, cheetah: [{ at: 0.5, label: '三角函數 II<br>弧長扇形' }, { at: 0.9, label: '三角函數圖形<br>微積分' }] },
        teasers: [
          { title: '弧長與扇形面積公式', q: '用弧度算弧長 ＝ rθ、扇形面積 ＝ ½r²θ，為什麼比用度數簡單？', where: 'S111 2507／2607 第 1–2 堂：CH1 三角函數 II（弧度、弧長、扇形面積）', lv: 'L2' },
          { title: '國中的弧長與扇形面積', q: '國中用「圓心角 ÷ 360°」算弧長和扇形面積，和弧度有什麼關係？', where: 'J82S 2601 第 18 堂：CH10 圓', lv: 'L1' },
          { title: '三角函數 II', q: '有了弧度，三角函數可以用單位圓重新理解；後面還有和角、倍角等公式。', where: 'S111 2507／2607 第 1–8 堂：CH1 三角函數 II', lv: 'L3' }],
        parent: { pitfall: '孩子常把「弧度」當成另一種「單位」硬背對照表（π ＝ 180°），卻不知道它其實是<b>弧長 ÷ 半徑</b>；也常忘記弧度的值是<b>沒有單位</b>的。', place: '高中三角函數的起點，之後的三角函數圖形、微積分都用弧度。', ask: ['為什麼一圈是 2π 弧度？', '半徑 5、圓心角 2 弧度的弧，弧長是多少？', '90° 是幾弧度？60° 呢？'] },
        classes: ['S111（2507 第 1–8 堂；2607 第 1–8 堂）：CH1 三角函數 II（第 1 堂為弧度、弧長、扇形面積）', 'J82S（2601 第 18 堂）：CH10 圓（弧長與扇形面積）', 'S102（2601 第 18–23 堂）：CH4 三角函數'],
        next: { href: 'play-circle-area.html', text: '下一個：圓面積' } });
    }];
  new P.Lesson({ id: 'radian', title: '弧度：把半徑捲到圓周上', answers: { 1: '弧度 ＝ 弧長 ÷ 半徑；180° ＝ π、90° ＝ π/2、60° ＝ π/3、360° ＝ 2π' }, steps: steps });
})();
