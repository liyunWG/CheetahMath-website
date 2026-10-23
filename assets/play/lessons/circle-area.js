/* 獵豹玩中學｜圓面積：切成扇形再拼起來
   切成 n 等分的扇形拼起來 → 剝洋蔥拼成三角形 → 數方格估 π → 3 個操作關卡（半徑變化、圓環、扇形）。 */
(function () {
  var P = Play, h = P.h, G = PlayGeo, rad = G.rad, PI = Math.PI;
  var CA = 'rgba(47,111,220,.5)', CB = 'rgba(214,51,108,.45)';
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function fillPoly(el, c) { el.style.fill = c; el.style.stroke = c.replace(/,[.\d]+\)$/, ',1)'); }
  /* 扇形：頂點 apex、半徑 r、平分線方向 dir、張角 theta（度） */
  function sector(apex, r, dir, theta) { var pts = [apex], k, n = Math.max(4, Math.ceil(theta / 6)); for (k = 0; k <= n; k++) { var a = (dir - theta / 2 + theta * k / n) * rad; pts.push([apex[0] + r * Math.cos(a), apex[1] + r * Math.sin(a)]); } return pts; }
  function pillRow(host, defs) { var row = h('div', { class: 'pl-readout' }), out = []; defs.forEach(function (c) { var p = P.pill('', c); out.push(p); row.append(p); }); host.append(row); return out; }
  function arcD(board, c, r, a0, a1) { var p0 = G.polar(c, r, a0), p1 = G.polar(c, r, a1), large = Math.abs(a1 - a0) > 180 ? 1 : 0; return 'M ' + p0[0] + ' ' + board.Y(p0[1]) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' + p1[0] + ' ' + board.Y(p1[1]); }

  var steps = [
    /* 1. 切成扇形拼起來 */
    function (st, api) {
      var gate = { on: true }, NS = [4, 6, 8, 12, 16, 24, 36, 60], ni = 0, done = false, r = 2, CC = [2.4, 3.4], X0 = 6.2, Y0 = 2.2;
      P.choice(st, api, { id: 'ca-p1', predict: true, label: '先猜猜看', prompt: '把圓切成<b>越來越多</b>的小扇形，再<b>交錯拼起來</b>，拼成的形狀會越來越像？', row: true, options: [{ t: '三角形' }, { ok: true, t: '長方形' }, { t: '圓形' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('按「＋」把圓切得更細'); } });
      var host = stage(st), b = new P.Board(host, { w: 14, h: 6 }), g = h('g'); b.gMid.append(g);
      var pills = pillRow(st, ['is-blue', 'is-pink', 'is-amber']), sn = P.stepper('切成幾等分', 1, NS.length, 1, function (v) { ni = v - 1; draw(); }, function (v) { return NS[v - 1] + ' 份'; }); st.append(h('div', { class: 'pl-steprow' }, sn.el));
      function draw() {
        g.innerHTML = ''; var n = NS[ni], th = 360 / n, w = r * th * rad, k, i;
        for (k = 0; k < n; k++) fillPoly(b.poly(sector(CC, r, th * k + th / 2, th), 'pl-poly', g), k % 2 ? CB : CA);
        for (k = 0; k < n / 2; k++) {
          var xu = X0 + w * k + w / 2, xd = xu + w / 2;
          fillPoly(b.poly(sector([xu, Y0 + r], r, 270, th), 'pl-poly', g), CA); fillPoly(b.poly(sector([xd, Y0], r, 90, th), 'pl-poly', g), CB);
        }
        b.poly([[X0, Y0], [X0 + PI * r, Y0], [X0 + PI * r, Y0 + r], [X0, Y0 + r]], 'pl-poly pl-poly--ghost', g);
        b.text([X0 + PI * r / 2, Y0 - 0.55], '長 ≈ 圓周的一半 ＝ πr', 'pl-text pl-text--sm', g); b.text([X0 + PI * r + 0.9, Y0 + r / 2], '寬 ＝ r', 'pl-text pl-text--sm', g);
        pills[0].textContent = '切成 ' + n + ' 份'; pills[1].textContent = '長 ≈ πr ＝ ' + f2(PI * r) + '　寬 ＝ r ＝ ' + r; pills[2].textContent = '面積 ≈ πr × r ＝ ' + f2(PI * r * r);
        if (ni === NS.length - 1 && !done && !gate.on) { done = true; P.toast(api.ctx.p1 === 1 ? '你猜對了！' : '越來越像長方形'); P.track('aha', { id: 'circle-area', step: 1 }); st.append(P.ruleBox('切得越細，拼起來越像<b>長方形</b>：長 ＝ 圓周的一半 ＝ <b>πr</b>，寬 ＝ <b>r</b>。<br>所以<b>圓面積 ＝ πr × r ＝ πr²</b>。', '圓面積')); api.unlock('圓面積 ＝ πr²！'); }
      }
      api.solve(function () { gate.on = false; ni = NS.length - 1; sn.set(NS.length, true); draw(); }); draw(); st.append(P.hint('藍色和粉紅色的小扇形，一上一下交錯拼起來。切到最細（60 份）看看。')); api.lock('先做上面的預測');
    },
    /* 2. 剝洋蔥：圓環拉直成三角形 */
    function (st, api) {
      st.append(P.instr('把圓像<b>洋蔥</b>一樣，一圈一圈<b>剝下來拉直</b>，疊起來會拼成什麼？'));
      var MS = [2, 4, 6, 10, 16, 24], mi = 0, done = false, r = 1.8, CC = [3, 6.3], BX = 6.4, BY = 0.7, host = stage(st), b = new P.Board(host, { w: 13, h: 9 }), g = h('g'); b.gMid.append(g);
      var pills = pillRow(st, ['is-blue', 'is-pink', 'is-amber']), sn = P.stepper('分成幾圈', 1, MS.length, 1, function (v) { mi = v - 1; draw(); }, function (v) { return MS[v - 1] + ' 圈'; }); st.append(h('div', { class: 'pl-steprow' }, sn.el));
      function draw() {
        g.innerHTML = ''; var m = MS[mi], dl = r / m, i;
        for (i = m - 1; i >= 0; i--) { var rr = (i + 1) * dl; g.append(h('circle', { cx: CC[0], cy: b.Y(CC[1]), r: rr, fill: i % 2 ? CB : CA, stroke: 'rgba(18,37,72,.7)', 'stroke-width': 1.2, style: 'vector-effect:non-scaling-stroke' })); }
        for (i = 0; i < m; i++) { var rho2 = (i + 0.5) * dl, wd = 2 * PI * rho2, yy = BY + (m - 1 - i) * dl; fillPoly(b.poly([[BX - wd / 2, yy], [BX + wd / 2, yy], [BX + wd / 2, yy + dl], [BX - wd / 2, yy + dl]], 'pl-poly', g), i % 2 ? CB : CA); }
        b.poly([[BX - PI * r, BY], [BX + PI * r, BY], [BX, BY + r]], 'pl-poly pl-poly--ghost', g); b.text([BX, BY - 0.45], '底 ≈ 圓周長 ＝ 2πr', 'pl-text pl-text--sm', g); b.text([BX + 0.9, BY + r / 2 + 0.2], '高 ＝ r', 'pl-text pl-text--sm', g);
        pills[0].textContent = '分成 ' + m + ' 圈'; pills[1].textContent = '底 ≈ 2πr ＝ ' + f2(2 * PI * r) + '　高 ＝ r ＝ ' + r; pills[2].textContent = '面積 ≈ ½ × 2πr × r ＝ ' + f2(PI * r * r);
        if (mi === MS.length - 1 && !done) { done = true; P.track('aha', { id: 'circle-area', step: 2 }); st.append(P.ruleBox('圓分成一圈一圈，每一圈拉直都是<b>細長條</b>，疊起來越來越像<b>三角形</b>：底 ＝ 圓周長 <b>2πr</b>、高 ＝ <b>r</b>。<br>面積 ＝ ½ × 2πr × r ＝ <b>πr²</b>——和切扇形算出來的一樣！', '再算一次')); api.unlock('又得到 πr²！'); }
      }
      api.solve(function () { mi = MS.length - 1; sn.set(MS.length, true); draw(); }); draw(); st.append(P.hint('圈數越多，三角形的斜邊越平整。切到 24 圈看看。')); api.lock('把圓分成 24 圈');
    },
    /* 3. 數方格估 π */
    function (st, api) {
      st.append(P.instr('用<b>方格</b>去數圓有多大（半徑 4）：藍色是完全在圓裡的格子，金色是壓到圓邊的格子。方格越小，估得越準。'));
      var S = [1, 0.5, 0.25], si = 0, seen = {}, done = false, r = 4, C0 = [5, 5], host = stage(st), b = new P.Board(host, { w: 10, h: 10 }), g = h('g'); b.gMid.append(g);
      var pills = pillRow(st, ['is-blue', 'is-amber', 'is-pink']), pk = P.pill('', 'is-ok'); st.append(h('div', { class: 'pl-readout' }, pk));
      var sn = P.stepper('方格大小', 1, 3, 1, function (v) { si = v - 1; draw(); }, function (v) { return v === 1 ? '1 × 1' : v === 2 ? '½ × ½' : '¼ × ¼'; }); st.append(h('div', { class: 'pl-steprow' }, sn.el));
      function draw() {
        g.innerHTML = ''; var s = S[si], m = Math.round(r / s), i, j, inner = 0, outer = 0, dIn = '', dOut = '';
        for (i = -m; i < m; i++) for (j = -m; j < m; j++) {
          var x0 = i * s, x1 = (i + 1) * s, y0 = j * s, y1 = (j + 1) * s, far = Math.pow(Math.max(Math.abs(x0), Math.abs(x1)), 2) + Math.pow(Math.max(Math.abs(y0), Math.abs(y1)), 2), near = Math.pow(Math.min(Math.abs(x0), Math.abs(x1)), 2) + Math.pow(Math.min(Math.abs(y0), Math.abs(y1)), 2);
          var seg = 'M ' + (C0[0] + x0) + ' ' + b.Y(C0[1] + y1) + ' h ' + s + ' v ' + s + ' h ' + (-s) + ' z ';
          if (far <= r * r + 1e-9) { inner++; dIn += seg; } else if (near < r * r - 1e-9) { outer++; dOut += seg; }
        }
        g.append(h('path', { d: dOut, fill: 'rgba(210,155,31,.45)', stroke: 'rgba(210,155,31,1)', 'stroke-width': 0.6, style: 'vector-effect:non-scaling-stroke' }), h('path', { d: dIn, fill: 'rgba(47,111,220,.4)', stroke: 'rgba(47,111,220,1)', 'stroke-width': 0.6, style: 'vector-effect:non-scaling-stroke' }), h('circle', { cx: C0[0], cy: b.Y(C0[1]), r: r, fill: 'none', stroke: '#122548', 'stroke-width': 2.4, style: 'vector-effect:non-scaling-stroke' }));
        var lo = inner * s * s, hi = (inner + outer) * s * s, est = (lo + hi) / 2; pills[0].textContent = '藍色格子：' + f1(lo) + ' 以上'; pills[1].textContent = '加上金色格子：' + f1(hi) + ' 以下'; pills[2].textContent = '圓面積 ≈ ' + f1(est);
        pk.textContent = '面積 ÷ 半徑² ≈ ' + f1(est) + ' ÷ 16 ≈ ' + f2(est / 16); seen[si] = 1;
        if (Object.keys(seen).length >= 3 && si === 2 && !done) { done = true; P.track('aha', { id: 'circle-area', step: 3 }); st.append(P.ruleBox('方格越小，估得越準：圓面積 ÷ 半徑² 越來越接近 <b>3.14</b>，也就是 <b>π</b>。<br>所以圓面積 ≈ 3.14 × r²，和 πr² 完全吻合。', '發現 π')); api.unlock('面積 ÷ r² ≈ π！'); }
      }
      api.solve(function () { [1, 2, 3].forEach(function (v) { si = v - 1; sn.set(v, true); draw(); }); }); draw(); st.append(P.hint('三種大小都要看，最後一種最準。注意最下面那個比值。')); api.lock('三種方格都看一遍');
    },
    /* 4. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：半徑變化，面積怎麼變 */
        function (b0, done, setSolve) {
          var T = [{ t: '面積是 r ＝ 1 時的 <b>4 倍</b>', r: 2 }, { t: '面積是 r ＝ 1 時的 <b>9 倍</b>', r: 3 }, { t: '面積剛好是 <b>25π</b>', r: 5 }], ti = 0, r = 1, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); b.gMid.append(g); var pills = pillRow(b0, ['is-blue', 'is-pink']), sr = P.stepper('半徑 r', 1, 6, 1, function (v) { r = v; draw(); }); b0.append(h('div', { class: 'pl-steprow' }, sr.el));
          function txt() { info.innerHTML = '調整圓的半徑，讓' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw() {
            g.innerHTML = '';
            g.append(h('circle', { cx: 6, cy: b.Y(5), r: r * 0.8, fill: 'rgba(47,111,220,.25)', stroke: '#2f6fdc', 'stroke-width': 3, style: 'vector-effect:non-scaling-stroke' }), h('rect', { x: 6, y: b.Y(5 + r * 0.8), width: r * 0.8, height: r * 0.8, fill: 'rgba(214,51,108,.35)', stroke: '#d6336c', 'stroke-width': 2, style: 'vector-effect:non-scaling-stroke' }));
            b.text([6 + r * 0.4, 5 + r * 0.4 - 0.2], 'r²', 'pl-text pl-text--pink pl-text--sm', g);
            pills[0].textContent = '半徑 r ＝ ' + r; pills[1].textContent = '面積 ＝ π × ' + r + '² ＝ ' + r * r + 'π　（是 r＝1 的 ' + r * r + ' 倍）';
            if (ti < 3 && r === T[ti].r) { ti++; if (ti >= 3) { P.toast('半徑 2 倍，面積 4 倍：面積和 r² 成正比'); P.track('aha', { id: 'circle-area', step: 4 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { while (ti < 3) sr.set(T[ti].r); }); txt(); draw(); b0.append(P.hint('粉紅色正方形是邊長 r 的正方形，圓面積是它的 π 倍。'));
        },
        /* 關 2：圓環面積 */
        function (b0, done, setSolve) {
          var T = [{ t: '圓環面積 ＝ <b>16π</b>', r: 3 }, { t: '圓環面積 ＝ <b>21π</b>', r: 2 }, { t: '圓環面積 ＝ <b>9π</b>', r: 4 }], ti = 0, r = 1, R = 5, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); b.gMid.append(g); var pills = pillRow(b0, ['is-blue', 'is-pink', 'is-amber']), sr = P.stepper('小圓半徑 r', 1, 4, 1, function (v) { r = v; draw(); }); b0.append(h('div', { class: 'pl-steprow' }, sr.el));
          function txt() { info.innerHTML = '大圓半徑 5 固定。調整<b>小圓半徑 r</b>，讓' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw() {
            g.innerHTML = ''; g.append(h('circle', { cx: 6, cy: b.Y(5), r: R * 0.9, fill: 'rgba(210,155,31,.4)', stroke: '#d29b1f', 'stroke-width': 3, style: 'vector-effect:non-scaling-stroke' }), h('circle', { cx: 6, cy: b.Y(5), r: r * 0.9, fill: '#fff', stroke: '#d6336c', 'stroke-width': 3, style: 'vector-effect:non-scaling-stroke' }));
            pills[0].textContent = '大圓 ＝ 25π'; pills[1].textContent = '小圓 ＝ ' + r * r + 'π'; pills[2].textContent = '圓環 ＝ 25π − ' + r * r + 'π ＝ ' + (25 - r * r) + 'π';
            if (ti < 3 && 25 - r * r === [16, 21, 9][ti]) { ti++; if (ti >= 3) { P.toast('圓環面積 ＝ 大圓 − 小圓'); P.track('aha', { id: 'circle-area', step: 5 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { while (ti < 3) sr.set(T[ti].r); }); txt(); draw(); b0.append(P.hint('圓環 ＝ 大圓 − 小圓。大圓是 25π。'));
        },
        /* 關 3：扇形佔整圓的幾分之幾 */
        function (b0, done, setSolve) {
          var T = [{ t: '扇形面積是整個圓的 <b>1/4</b>', d: 90 }, { t: '扇形面積是整個圓的 <b>1/3</b>', d: 120 }, { t: '扇形面積是整個圓的 <b>1/6</b>', d: 60 }], ti = 0, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var C0 = [6, 5.2], R = 3.8, b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); b.circle(C0, R, 'pl-circle pl-circle--unit'); b.line(C0, [C0[0] + R, C0[1]], 'pl-line pl-line--soft'); b.gMid.append(g); var pills = pillRow(b0, ['is-blue', 'is-pink', 'is-amber']);
          function txt() { info.innerHTML = '拖動綠點，讓' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw(deg) {
            g.innerHTML = ''; var w = G.wedge(C0, 0, deg, 1.3, deg), pts = sector(C0, R, deg / 2, deg); fillPoly(b.poly(pts, 'pl-poly', g), CA); b.poly(w.pts, 'pl-poly pl-poly--blue', g); var tp = G.polar(C0, 2.3, w.bis); b.text([tp[0], tp[1] - 0.2], deg + '°', 'pl-text pl-text--lg', g);
            var fr = deg / 360; pills[0].textContent = '圓心角 ＝ ' + deg + '°'; pills[1].textContent = '佔整圓的 ' + deg + ' ÷ 360 ＝ ' + f2(fr); pills[2].textContent = '面積 ＝ ' + f2(fr) + ' × πr²';
          }
          var cand = []; for (var d = 5; d <= 355; d += 5) cand.push(G.polar(C0, R, d));
          var hd = b.handle({ pos: cand[8], candidates: cand, onMove: function (t) { var d = Math.round(G.norm(G.dirTo(C0, t))); draw(d); if (ti < 3 && d === T[ti].d) { ti++; if (ti >= 3) { P.toast('扇形面積 ＝ 圓心角 ÷ 360° × 圓面積'); P.track('aha', { id: 'circle-area', step: 6 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } } } });
          draw(45); setSolve(function () { while (ti < 3) hd.moveTo(G.polar(C0, R, T[ti].d)); }); txt(); b0.append(P.hint('整圓是 360°。1/4 圓是幾度？注意 90° 會出現直角符號。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-area' }); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'circle-area', moduleName: '圓面積：切成扇形再拼起來', askAbout: '小學與國中的圓與扇形', aha: '圓切成扇形再拼起來，就是長方形：<br>長 πr、寬 r，所以圓面積 ＝ πr²。',
        cards: [{ text: '圓面積 ＝ π × 半徑 × 半徑；圓周長 ＝ 2πr', src: '國小「圓周率與圓面積」（國小數學課綱）' }, { text: '扇形面積 ＝ 圓心角 ÷ 360° × 圓面積；圓環面積 ＝ 大圓 − 小圓', src: '國小、國中「圓與扇形」' }],
        depth: { here: 0.1, cheetah: [{ at: 0.4, label: '圓與扇形<br>割補進階' }, { at: 0.86, label: '弧度<br>微積分求面積' }] },
        teasers: [
          { title: '圓與扇形的割補', q: '把不規則的圖形用「割補」變成圓、扇形、三角形的組合，面積怎麼一眼看出來？', where: 'PK3C 2507 第 15 堂、2607 第 14 堂：圓與扇形（割補進階）', lv: 'L2' },
          { title: '圓的周長與圓面積', q: '圓周率 π 到底是什麼？周長、面積、半徑、直徑的關係怎麼一次搞懂？', where: 'PK3B 2512 第 20–21 堂：圓的周長、圓面積', lv: 'L1' },
          { title: '弧長與扇形面積', q: '圓心角不是整數倍時，弧長和扇形面積怎麼算？換成弧度會更簡單嗎？', where: 'J82S 2601 第 18 堂 CH10 圓；S111 2507／2607 第 1 堂（弧度）', lv: 'L2' }],
        parent: { pitfall: '孩子常把<b>周長公式 2πr</b>和<b>面積公式 πr²</b>搞混（一個是「r 的一次方」、一個是「r 的平方」）；也常把半徑、直徑弄錯。', place: '國小高年級到國中的基礎，之後的圓柱、圓錐體積、扇形、弧度都會用到。', ask: ['圓切成很多小扇形再拼，為什麼會變成長方形？', '半徑變 2 倍，圓面積變幾倍？為什麼？', '半徑 10 的圓，挖掉半徑 6 的圓，剩下的圓環面積是多少？'] },
        classes: ['PK3B（2512 第 20–21 堂）：關於圓的周長、圓面積', 'PK3C（2507 第 15 堂；2607 第 14 堂）：圓與扇形的周長面積（割補進階）', 'J82S（2601 第 18 堂）：CH10 圓（弧長與扇形面積）'],
        next: { href: 'play-solid-volume.html', text: '下一個：立體圖形的體積與表面積' } });
    }];
  new P.Lesson({ id: 'circle-area', title: '圓面積：切成扇形再拼起來', answers: { 1: '面積 ＝ ½ × 2πr × r ＝ πr²（和切扇形算出來的一樣）', 2: '圓面積 ≈ 3.14 × r²，也就是 πr²' }, steps: steps });
})();
