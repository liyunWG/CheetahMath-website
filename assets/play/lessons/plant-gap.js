/* 獵豹玩中學｜植樹與間隔：數空隙，不是數樹
   預測＋把樹苗拖到路上 → 兩端旗子切換「種／不種」 → 把路捲成一圈 → 3 個操作關卡（調間隔、鋸木頭、圓形池塘）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA;
  var XS = [1, 3, 5, 7, 9, 11], RY = 3.9, SEGC = ['rgba(47,111,220,.22)', 'rgba(210,155,31,.3)'];
  function lerp(a, b, t) { return a + (b - a) * t; }
  function seg(board, g, x0, x1, y, k) { g.append(h('rect', { x: x0 + 0.06, y: board.Y(y) - 0.2, width: Math.max(0, x1 - x0 - 0.12), height: 0.4, rx: 0.2, fill: SEGC[k % 2] })); }

  var steps = [
    /* 1. 預測＋把樹苗拖到路上 */
    function (st, api) {
      var gate = { on: true }, filled = [0, 0, 0, 0, 0, 0], n = 0, done = false, hd;
      P.choice(st, api, { id: 'pg-p1', predict: true, label: '先猜猜看', prompt: '一條 <b>20 公尺</b>的路，每隔 <b>4 公尺</b>種一棵樹，<b>頭尾兩端都要種</b>。一共需要幾棵？', row: true, options: [{ t: '4 棵' }, { t: '5 棵' }, { t: '6 棵' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把樹苗拖到路上的圓點'); } });
      var b = PA.board(st, 12, 7), gs = h('g'), gt = h('g'); b.gMid.append(gs, gt);
      for (var i = 0; i < 5; i++) { seg(b, gs, XS[i], XS[i + 1], RY, i); b.text([(XS[i] + XS[i + 1]) / 2, RY - 0.95], '第 ' + (i + 1) + ' 段', 'pl-text pl-text--sm pl-text--blue', gs); }
      var socks = XS.map(function (x, k) { var c = h('circle', { cx: x, cy: b.Y(RY), r: 0.34, class: 'pa-slot' }); c.style.cursor = 'pointer'; c.addEventListener('click', function () { plant(k); }); gs.append(c); return c; });
      var pT = P.pill('', 'is-green'), pG = P.pill('路被分成 5 段', 'is-amber'), pD = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pT, pG, pD));
      function upd() { pT.textContent = '種了 ' + n + ' 棵'; pD.textContent = n === 6 ? '6 棵 ＝ 5 段 ＋ 1' : '還沒種完'; pD.className = 'pl-pill' + (n === 6 ? ' is-ok' : ''); }
      function plant(k) {
        if (gate.on) { P.toast('先做上面的預測'); return; } if (filled[k]) return;
        filled[k] = 1; n++; socks[k].setAttribute('class', 'pa-slot is-full'); P.pop(PA.tree(b, XS[k], RY, 1, gt, k === 0 || k === 5 ? 'is-end' : '').inner, 0.3); upd();
        if (n === 6 && !done) { done = true; P.track('aha', { id: 'plant-gap', step: 1 }); P.toast(api.ctx.p1 === 2 ? '你猜對了！6 棵' : '種完是 6 棵'); st.append(P.ruleBox('20 公尺每 4 公尺一段，共 <b>5 段</b>；可是<b>頭尾兩端都有樹</b>，所以樹比段<b>多 1</b>：<br><b>棵數 ＝ 段數 ＋ 1 ＝ 6</b>。<br>先數「空隙」，再看兩端要不要補一棵。', '兩端都種')); api.unlock('棵數 ＝ 段數 ＋ 1'); }
      }
      hd = PA.dropper(b, { tray: [6, 1.4], sockets: XS.map(function (x) { return [x, RY]; }), can: function (k) { return !filled[k]; }, disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; }, onDrop: plant });
      b.text([6, 0.3], '樹苗：拖到路上的圓點（點圓點也可以）', 'pl-text pl-text--sm', gs);
      api.solve(function () { gate.on = false; XS.forEach(function (x) { hd.moveTo([x, RY]); }); });
      upd(); st.append(P.hint('先數數看：樹和「段」各有幾個？') ); api.lock('先做上面的預測');
    },
    /* 2. 兩端的旗子：種／不種 */
    function (st, api) {
      st.append(P.instr('路的兩端各有一個按鈕，<b>點一下</b>決定那一端「種」或「不種」。看看<b>樹的棵數</b>和<b>段數</b>怎麼變。'));
      var b = PA.board(st, 12, 7), gs = h('g'), gt = h('g'), gb = h('g'), ends = [1, 1], seen = {}, done = false; b.gMid.append(gs, gt); b.gTop.append(gb);
      for (var i = 0; i < 5; i++) seg(b, gs, XS[i], XS[i + 1], RY, i);
      b.text([6, RY - 1.2], '空隙 5 段（每段 4 公尺）', 'pl-text pl-text--sm pl-text--amber', gs);
      var pT = P.pill('', 'is-green'), pG = P.pill('空隙 5 段', 'is-amber'), pD = P.pill('', 'is-blue'); st.append(h('div', { class: 'pl-readout' }, pT, pG, pD));
      function draw() {
        gt.innerHTML = ''; gb.innerHTML = ''; var cnt = 0;
        for (var k = 0; k < 6; k++) { if ((k === 0 && !ends[0]) || (k === 5 && !ends[1])) { gt.append(h('circle', { cx: XS[k], cy: b.Y(RY), r: 0.34, class: 'pa-slot' })); continue; } cnt++; PA.tree(b, XS[k], RY, 1, gt, k === 0 || k === 5 ? 'is-end' : ''); }
        [0, 1].forEach(function (e) { PA.button(b, e ? 11 : 1, RY + 2.3, 0.85, ends[e] ? '種' : '不種', function () { ends[e] = ends[e] ? 0 : 1; draw(); }, ends[e] ? 'is-on' : 'is-off', gb); });
        pT.textContent = '樹 ' + cnt + ' 棵'; var d = cnt - 5; pD.textContent = d > 0 ? '樹比空隙多 ' + d : d === 0 ? '樹和空隙一樣多' : '樹比空隙少 ' + (-d);
        var type = ends[0] + ends[1]; if (!seen[type]) { seen[type] = 1; if (Object.keys(seen).length === 3 && !done) { done = true; P.track('aha', { id: 'plant-gap', step: 2 }); st.append(P.ruleBox('<b>兩端都種</b>：棵數 ＝ 段數 ＋ 1<br><b>只種一端</b>：棵數 ＝ 段數<br><b>兩端都不種</b>：棵數 ＝ 段數 − 1', '三種情形')); api.unlock('三種情形都看過了'); } }
      }
      api.solve(function () { [[0, 1], [0, 0], [1, 1]].forEach(function (e) { ends = e.slice(); draw(); }); });
      draw(); st.append(P.hint('要把「兩端都種」「只種一端」「兩端都不種」三種都看過。')); api.lock('看過三種情形');
    },
    /* 3. 把路捲成一圈 */
    function (st, api) {
      st.append(P.instr('用滑桿把路<b>捲成一圈</b>（頭和尾接起來）。那兩棵頭尾的樹會怎麼樣？'));
      var b = PA.board(st, 12, 7), gs = h('g'), gt = h('g'), n = 5, u = 0, seen = {}, done = false, C = [6, 3.5], R = 2.6; b.gMid.append(gs, gt);
      var ring = h('circle', { cx: C[0], cy: b.Y(C[1]), r: R, fill: 'none', stroke: '#e2d8bd', 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }); gs.append(ring);
      var pT = P.pill('', 'is-green'), pG = P.pill('', 'is-amber'), pD = P.pill('', ''); var sn;
      function pos(i) { var th = 2 * Math.PI * i / n, L = [lerp(1, 11, i / n), C[1]], c = [C[0] + R * Math.sin(th), C[1] - R * Math.cos(th)]; return [lerp(L[0], c[0], u), lerp(L[1], c[1], u)]; }
      function draw() {
        gt.innerHTML = ''; ring.style.opacity = u; var i, merged = u >= 0.99;
        for (i = 0; i < n; i++) { var a = pos(i), c = pos(i + 1); gt.append(h('line', { x1: a[0], y1: b.Y(a[1]), x2: c[0], y2: b.Y(c[1]), class: 'pa-seg', style: 'stroke:' + SEGC[i % 2].replace(/[.\d]+\)$/, '1)') + ';stroke-width:7;opacity:.55' })); }
        var s = Math.min(1, 10 / n / 1.5);
        for (i = 0; i <= n; i++) { if (merged && i === n) continue; var p = pos(i); PA.tree(b, p[0], p[1] - 0.05, s, gt, merged && i === 0 ? 'is-end' : ''); }
        var trees = merged ? n : n + 1; pT.textContent = '樹 ' + trees + ' 棵'; pG.textContent = '空隙 ' + n + ' 段'; pD.textContent = merged ? '頭尾疊成一棵：棵數 ＝ 段數' : '還是一條路：棵數 ＝ 段數 ＋ 1'; pD.className = 'pl-pill' + (merged ? ' is-ok' : '');
        if (merged && !seen[n]) { seen[n] = 1; if (Object.keys(seen).length >= 2 && !done) { done = true; P.track('aha', { id: 'plant-gap', step: 3 }); st.append(P.ruleBox('<b>環形（圍成一圈）</b>：頭和尾<b>是同一個位置</b>，那兩棵疊成一棵，所以<b>棵數 ＝ 段數</b>。<br>池塘、操場、圓桌，只要圍成一圈都是這樣。', '環形')); api.unlock('環形：棵數 ＝ 段數'); } }
      }
      sn = P.stepper('分成幾段', 3, 8, 5, function (v) { n = v; draw(); }, function (v) { return v + ' 段'; });
      var sl = P.slider(0, 100, 0, function (v) { u = v / 100; draw(); });
      st.append(h('div', { class: 'pl-steprow' }, sn.el), sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 一條路'), h('span', {}, '捲成一圈 →')), h('div', { class: 'pl-readout' }, pT, pG), h('div', { class: 'pl-readout' }, pD));
      api.solve(function () { [4, 5].forEach(function (k) { n = k; sn.set(k, true); sl.value = 100; u = 1; draw(); }); });
      draw(); st.append(P.hint('至少用 2 種不同的段數，各捲成一圈。')); api.lock('2 種段數都捲成一圈');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* 調間隔：直路或環形，找出剛好用到目標棵數的間隔 */
      function intervalTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var b = PA.board(b0, 12, 7, 'pl-svg--sm'), g = h('g'), idx = cfg.start, fin = false, m = cfg.ds.length, RX = function (j) { return 1.6 + j * 8.8 / (m - 1); }, RYY = 2.2; b.gMid.append(g);
          var pD = P.pill('', 'is-blue'), pS = P.pill('', 'is-amber'), pT = P.pill('', 'is-green'); b0.append(h('div', { class: 'pl-readout' }, pD, pS, pT));
          b.line([1, RYY], [11, RYY], 'pl-line pl-line--thin');
          cfg.ds.forEach(function (d, j) { b.dot([RX(j), RYY], 'pl-dot', null, 0.1); b.text([RX(j), RYY - 1.4], '' + d, 'pl-text pl-text--sm'); });
          function draw() {
            g.innerHTML = ''; var d = cfg.ds[idx], gaps = cfg.len / d, trees = cfg.ring ? gaps : gaps + 1, i, s;
            if (cfg.ring) { var C = [6, 4.7], R = 1.85; g.append(h('circle', { cx: C[0], cy: b.Y(C[1]), r: R, fill: 'none', stroke: '#e2d8bd', 'stroke-width': 5 })); s = Math.min(1, (2 * Math.PI * R / gaps) / 1.3); for (i = 0; i < gaps; i++) { var th = 2 * Math.PI * i / gaps; PA.tree(b, C[0] + R * Math.sin(th), C[1] - R * Math.cos(th) - 0.05, s, g); } }
            else { g.append(h('rect', { x: 1, y: b.Y(4.7) - 0.15, width: 10, height: 0.3, rx: 0.15, fill: '#e2d8bd' })); s = Math.min(1, (10 * d / cfg.len) / 1.3); for (i = 0; i <= gaps; i++) PA.tree(b, 1 + 10 * i / gaps, 4.7, s, g); }
            pD.textContent = '間隔 ' + d + ' 公尺'; pS.textContent = '共 ' + gaps + ' 段'; pT.textContent = '樹 ' + trees + ' 棵'; var ok = trees === cfg.target; pT.className = 'pl-pill' + (ok ? ' is-ok' : ' is-green');
            if (ok && !fin) { fin = true; P.toast(cfg.msg); done(); }
          }
          var hd = b.handle({ pos: [RX(idx), RYY], candidates: cfg.ds.map(function (d, j) { return [RX(j), RYY]; }), onMove: function (t) { for (var j = 0; j < m; j++) if (Math.abs(RX(j) - t[0]) < 1e-6) idx = j; draw(); } });
          setSolve(function () { hd.moveTo([RX(cfg.ds.indexOf(cfg.answer)), RYY]); }); draw(); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        intervalTask({ prompt: '路長 <b>60 公尺</b>，頭尾都要種，樹苗剛好 <b>7 棵</b>。拖動把手調整間隔，讓樹剛好用完。', len: 60, ds: [2, 3, 4, 5, 6, 10, 12, 15, 20, 30], start: 3, target: 7, answer: 10, ring: false, msg: '7 棵 ＝ 6 段 ＋ 1，間隔 10 公尺', hint: '尺上的數字是間隔（公尺）。7 棵代表有幾段？再用全長去平分。' }),
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '把一根木頭鋸成 <b>5 段</b>。把鋸子拖到木頭上的記號，每放一次就鋸一刀。' }));
          var b = PA.board(b0, 12, 7, 'pl-svg--sm'), g = h('g'), cut = {}, fin = false, MK = [2, 3, 4, 5, 6, 7, 8, 9, 10], LY = 3.9; b.gMid.append(g);
          var pK = P.pill('', 'is-pink'), pS = P.pill('', 'is-green'); b0.append(h('div', { class: 'pl-readout' }, pK, pS));
          function cuts() { return MK.filter(function (x) { return cut[x]; }); }
          function draw() {
            g.innerHTML = ''; var cs = cuts(), edges = [1].concat(cs, [11]), i, k = cs.length;
            for (i = 0; i < edges.length - 1; i++) g.append(h('rect', { x: edges[i] + (i ? 0.1 : 0), y: b.Y(LY) - 0.55, width: edges[i + 1] - edges[i] - (i ? 0.1 : 0) - (i < edges.length - 2 ? 0.1 : 0), height: 1.1, rx: 0.2, fill: i % 2 ? '#d9b27c' : '#c89a5e', stroke: '#fff', 'stroke-width': 1.5 }));
            MK.forEach(function (x) { if (!cut[x]) g.append(h('circle', { cx: x, cy: b.Y(LY + 0.95), r: 0.17, class: 'pa-slot' })); });
            pK.textContent = '鋸了 ' + k + ' 刀'; pS.textContent = '木頭變成 ' + (k + 1) + ' 段'; pS.className = 'pl-pill' + (k + 1 === 5 ? ' is-ok' : ' is-green');
            if (k + 1 === 5 && !fin) { fin = true; P.toast('4 刀 ＝ 5 段'); done(); }
          }
          var hd = PA.dropper(b, { tray: [6, 1.3], sockets: MK.map(function (x) { return [x, LY + 0.95]; }), can: function (j) { return !cut[MK[j]] && !fin; }, onDrop: function (j) { cut[MK[j]] = 1; draw(); } });
          PA.resetBtn(b0, '重來', function () { if (fin) return; cut = {}; draw(); });
          setSolve(function () { [3, 5, 7, 9].forEach(function (x) { hd.moveTo([x, LY + 0.95]); }); }); draw(); b0.append(P.hint('每鋸一刀，段數會怎麼變？'));
        },
        intervalTask({ prompt: '圓形池塘一圈 <b>168 公尺</b>，沿岸要種剛好 <b>21 棵</b>，間隔要相等。拖動把手調整間隔。', len: 168, ds: [4, 6, 7, 8, 12, 14, 21, 24], start: 2, target: 21, answer: 8, ring: true, msg: '圍成一圈：21 棵 ＝ 21 段，間隔 8 公尺', hint: '尺上的數字是間隔（公尺）。圍成一圈，棵數和段數有什麼關係？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'plant-gap' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'plant-gap', moduleName: '植樹與間隔：數空隙，不是數樹', askAbout: '小學應用問題（植樹、間隔）', aha: '先數「空隙」，再看兩端：<br>兩端都種多一棵，圍成一圈一樣多。',
        cards: [{ text: '兩端都種：棵數 ＝ 段數 ＋ 1；只種一端：棵數 ＝ 段數；兩端都不種：棵數 ＝ 段數 − 1；環形：棵數 ＝ 段數', src: '小學「植樹問題」（直線與環形）' }, { text: '鋸 4 刀，木頭變 5 段（刀數 ＝ 段數 − 1）；總長 ＝ 段數 × 間隔', src: '小學間隔問題' }],
        depth: { here: 0.12, cheetah: [{ at: 0.4, label: '紙條重疊<br>方陣、發車間隔' }, { at: 0.8, label: '週期問題<br>數列與遞推' }] },
        teasers: [
          { title: '紙條接長：重疊長度', q: '15 張 20 公分的紙條，每個連接處重疊 4 公分，全長多少？連接處有幾個？', where: 'PK1A 2607 第 14 堂：間隔問題；PI1A 2607 第 11 堂', lv: 'L2' },
          { title: '方陣問題', q: '人排成實心的正方形、空心的正方形，最外圈有幾人？每邊增加一人，總數怎麼變？', where: 'PK2B 2512 第 6 堂；PI2B 2512 第 4 堂', lv: 'L2' },
          { title: '發車間隔', q: '公車每隔 10 分鐘一班，你走路時迎面遇到的車，間隔和車速有什麼關係？', where: 'PK3D 2512 第 3 堂：發車間隔', lv: 'L3' }],
        parent: { pitfall: '孩子常用「全長 ÷ 間隔」直接當作棵數，忘了頭尾要補一棵（或圍成一圈時不用補）。也常把「兩端都種、只種一端、兩端都不種」混在一起背。', place: '小學三到五年級的應用問題，也是第一次遇到「差一」的思考：數的是點還是段。', ask: ['為什麼 5 根手指之間只有 4 個空隙？', '鋸 4 刀，木頭變成幾段？鋸 10 刀呢？', '圓形的跑道，為什麼棵數和段數一樣多？'] },
        classes: ['PK1A（2607 第 13、14 堂）：植樹問題、間隔問題', 'PI1A（2607 第 12、11 堂；2507 第 13、12 堂）：植樹問題、間隔問題', 'PK2B（2512 第 6 堂）：方陣問題'], next: { href: 'play-time-axis.html', text: '下一個：時間軸統籌' } });
    }];
  new P.Lesson({ id: 'plant-gap', title: '植樹與間隔：數空隙，不是數樹', steps: steps });
})();
