/* 獵豹玩中學｜塗色（一）：地圖著色，相鄰與最少色數
   預測＋對角的兩區算不算相鄰（點線圖）→ 預測＋這張地圖最少要幾色 → 預測＋圍成一圈的區域，奇數或偶數格誰要 3 色 → 3 個操作關卡。
   要擊中的迷思：只碰到一個角的區域也當成相鄰；以為每張地圖都要 4 色；用貪心塗卡住就以為沒辦法。 */
(function () {
  var P = Play, h = P.h, PG = window.PG;
  var MAP_A = PG.model(PG.grid(['AABBC', 'ADBCC', 'DDEEC', 'FFEGG']));
  var DIAG = PG.model(PG.grid(['PQ', 'RS']));
  var NAMES = PG.CNAME;
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function stepper(host, label, min, max, val, fn) { var sn = P.stepper(label, min, max, val, fn, function (v) { return v; }); host.append(h('div', { class: 'pl-steprow' }, sn.el)); return sn; }

  var steps = [
    /* 1. 對角算相鄰嗎 */
    function (st, api) {
      var gate = { on: true }, done = false, V;
      P.choice(st, api, { id: 'cm1-p1', predict: true, label: '先猜猜看', prompt: '兩個區域<b>只碰到一個角</b>（對角），它們算「相鄰」嗎？', row: true, options: [{ ok: true, t: '不算相鄰' }, { t: '算相鄰' }, { t: '看顏色' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('只用 2 種顏色塗好'); } });
      st.append(P.instr('先點一個<b>顏色</b>，再點<b>區域</b>塗色（再點一次就擦掉）。相鄰的區域不能同色，同色相鄰的邊界會變<b>紅色</b>。想辦法<b>只用 2 種顏色</b>把 4 塊塗好；也可以按「點線圖」看誰和誰相鄰。'));
      V = PG.view(st, DIAG, { k: 2, graphToggle: true, status: true, gate: function () { return gate.on; }, onChange: function (v) {
        if (gate.on || done || !v.complete() || v.conflicts().length) return;
        if (v.col[0] === v.col[3] && v.col[1] === v.col[2]) { done = true; P.track('aha', { id: 'color-map', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：對角不相鄰'); st.append(P.ruleBox('兩個區域要<b>共用一段邊界線</b>才算<b>相鄰</b>。只碰到<b>一個角</b>（對角）<b>不算相鄰</b>，所以可以塗同一個顏色。<br>在「點線圖」裡，相鄰才連線：左上和右下之間沒有線。', '什麼叫相鄰')); api.unlock('相鄰要共用一段邊界線'); }
      } });
      api.solve(function () { gate.on = false; V.clear(); V.paint(0, 0); V.paint(1, 1); V.paint(2, 1); V.paint(3, 0); }, false, '不算相鄰：只碰到一個角的區域可以塗同一個顏色（左上和右下同色、右上和左下同色，2 色就塗完）');
      st.append(P.hint('左上和右下可以同色嗎？按「點線圖」看看它們有沒有連線。')); api.lock('先做上面的預測');
    },
    /* 2. 最少幾色 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, V, sn;
      P.choice(st, api, { id: 'cm1-p2', predict: true, label: '先猜猜看', prompt: '這張地圖（7 個區域），<b>最少</b>要幾種顏色才能把相鄰的都塗成不同色？', row: true, options: [{ t: '2 種' }, { ok: true, t: '3 種' }, { t: '4 種' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('調整顏色數、塗塗看'); } });
      st.append(P.instr('用下面的按鈕<b>調整顏色數</b>，把整張地圖塗滿，同色相鄰會變紅。找出<b>最少</b>要幾種顏色。'));
      var holder = h('div'); st.append(holder);
      V = PG.view(holder, MAP_A, { k: 2, status: true, gate: function () { return gate.on; }, onChange: function (v) {
        if (gate.on) return; if (v.complete()) { if (v.conflicts().length) seen['bad' + v.k] = 1; else seen['ok' + v.k] = 1; }
        if (seen.bad2 && seen.ok3 && !done) { done = true; P.track('aha', { id: 'color-map', step: 2 }); if (api.ctx.p2 === 1) P.toast('你猜對了：最少 3 種'); st.append(P.ruleBox('A、B、D 三個區域<b>兩兩相鄰</b>，三個一定要不同色，所以<b>至少要 3 種</b>。2 色一定會在某處撞色（紅線）。<br>找最少色數，先找「<b>兩兩都相鄰</b>」的一組區域：有幾個，就至少要幾種顏色。這張圖 3 種剛好夠。', '最少色數')); api.unlock('兩兩相鄰的區域各要一種顏色'); }
      } });
      sn = P.stepper('顏色數', 2, 4, 2, function (v) { V.setK(v); }, function (v) { return v; }); st.insertBefore(h('div', { class: 'pl-steprow' }, sn.el), holder);
      api.solve(function () { gate.on = false; sn.set(2, true); V.setK(2); var c2 = [0, 1, 0, 1, 0, 1, 0]; V.clear(); c2.forEach(function (c, i) { V.paint(i, c); }); sn.set(3, true); V.setK(3); V.clear(); PG.solve(MAP_A, 3).forEach(function (c, i) { V.paint(i, c); }); }, false, '最少 3 種（A、B、D 兩兩相鄰，一定要 3 種；3 種就塗得完）');
      st.append(P.hint('先用 2 種塗塗看，卡在哪裡？再改成 3 種。')); api.lock('先做上面的預測');
    },
    /* 3. 一圈的區域：奇偶 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, V, sn, holder = h('div'), M;
      P.choice(st, api, { id: 'cm1-p3', predict: true, label: '先猜猜看', prompt: '一圈相接的區域（首尾也相鄰），要只用 <b>2 種顏色</b>塗好，要怎麼樣才可能？', row: true, options: [{ ok: true, t: '區域個數是偶數' }, { t: '區域個數是奇數' }, { t: '一定做得到' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('調整區域數、用 2 色塗'); } });
      st.append(P.instr('用按鈕調整這一圈的<b>區域個數</b>（3 到 8），每次都試著<b>只用 2 種顏色</b>塗好。也可以切換「點線圖」看這一圈。'));
      function build(n) { holder.innerHTML = ''; M = PG.model(PG.wheel(n, false)); V = PG.view(holder, M, { k: 2, graphToggle: true, status: true, gate: function () { return gate.on; }, onChange: function (v) {
        if (gate.on || !v.complete()) return; var ok = !v.conflicts().length; seen[(n % 2 ? 'odd' : 'even') + (ok ? 'Ok' : 'Bad')] = 1;
        if (seen.evenOk && seen.oddBad && !done) { done = true; P.track('aha', { id: 'color-map', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：偶數個才行'); st.append(P.ruleBox('一圈區域用 <b>2 色輪流</b>塗：<b>偶數</b>個剛好回到起點，首尾不撞色。<b>奇數</b>個，最後一個會和第一個撞色，要用到<b>第 3 種顏色</b>。<br>這就是「<b>奇數圈要 3 色，偶數圈 2 色</b>」。', '奇圈與偶圈')); api.unlock('偶數圈 2 色，奇數圈要 3 色'); } } }); }
      sn = P.stepper('區域個數', 3, 8, 5, function (v) { build(v); }, function (v) { return v; }); st.append(h('div', { class: 'pl-steprow' }, sn.el), holder); build(5);
      api.solve(function () { gate.on = false; sn.set(6, true); build(6); PG.solve(M, 2).forEach(function (c, i) { V.paint(i, c); }); sn.set(5, true); build(5); [0, 1, 0, 1, 0].forEach(function (c, i) { V.paint(i, c); }); }, false, '區域個數是偶數：2 色輪流塗剛好；奇數個，最後一個和第一個撞色，要 3 色');
      st.append(P.hint('先把 6 個、再把 5 個都用 2 色塗塗看。')); api.lock('先做上面的預測');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function mapTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '用 <b>3 種顏色</b>把這張地圖塗滿，相鄰的區域不能同色（不能有紅線）。' })); var fin = false, M = PG.model(PG.grid(['AABBC', 'ADBCC', 'DDEEC', 'FFEGG'])), V;
        V = PG.view(b0, M, { k: 3, status: true, onChange: function (v) { if (v.complete() && !v.conflicts().length && !fin) { fin = true; P.toast('3 種顏色塗完了'); b0.append(P.ruleBox('A、B、D 兩兩相鄰，先給它們 3 種不同的顏色；其他區域看鄰居用了哪些，挑沒用過的顏色，3 種就夠。', '塗完了')); done(); } } });
        setSolve(function () { V.clear(); PG.solve(M, 3).forEach(function (c, i) { V.paint(i, c); }); }, '3 種顏色就夠：A、B、D 三個兩兩相鄰的區域用 3 種不同色，其他區域避開鄰居用過的顏色'); b0.append(P.hint('先塗兩兩相鄰的 A、B、D，其他的看鄰居用了哪些顏色。'));
      }
      function minTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '中心 O 和外圈 3 個區域，<b>兩兩都相鄰</b>。調整顏色數，找出<b>最少</b>要幾種顏色，並且塗好。' })); var fin = false, M = PG.model(PG.wheel(3, true)), V, sn, chi = PG.chi(M), holder = h('div');
        V = PG.view(holder, M, { k: 2, status: true, onChange: function (v) { if (!v.complete() || v.conflicts().length || fin) return; if (v.k > chi) { P.toast('還可以更少：試試少一種顏色'); return; } fin = true; P.toast('最少 ' + chi + ' 種'); b0.append(P.ruleBox('四個區域<b>兩兩都相鄰</b>，每一個都要不同的顏色，所以最少 <b>4 種</b>。', '最少色數')); done(); } });
        sn = P.stepper('顏色數', 2, 5, 2, function (v) { V.setK(v); }, function (v) { return v; }); b0.append(h('div', { class: 'pl-steprow' }, sn.el), holder);
        setSolve(function () { sn.set(5, true); V.setK(5); V.clear(); PG.solve(M, 5).forEach(function (c, i) { V.paint(i, c); }); sn.set(4, true); V.setK(4); V.clear(); PG.solve(M, 4).forEach(function (c, i) { V.paint(i, c); }); }, '最少 4 種顏色（O 和外圈 3 個區域兩兩相鄰，要 4 個不同色）'); b0.append(P.hint('四個區域誰和誰相鄰？有沒有兩個可以同色的？'));
      }
      function wheelTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '輪形：中心 O 加外圈。只有 <b>3 種顏色</b>，調整<b>外圈的區域個數</b>，讓這張圖<b>剛好能用 3 色塗完</b>。' })); var fin = false, M, V, sn, holder = h('div'), n0 = 5;
        function build(n) { holder.innerHTML = ''; M = PG.model(PG.wheel(n, true)); V = PG.view(holder, M, { k: 3, status: true, onChange: function (v) { if (v.complete() && !v.conflicts().length && !fin) { fin = true; P.toast('外圈 ' + n + ' 格，3 色塗完'); b0.append(P.ruleBox('中心用一種顏色，外圈就只剩 2 種顏色，要<b>輪流</b>塗：外圈個數是<b>偶數</b>才行。奇數個外圈，會撞色，要第 4 種顏色。', '輪形')); done(); } } }); }
        sn = P.stepper('外圈區域個數', 3, 8, n0, function (v) { build(v); }, function (v) { return v; }); b0.append(h('div', { class: 'pl-steprow' }, sn.el), holder); build(n0);
        setSolve(function () { sn.set(6, true); build(6); PG.solve(M, 3).forEach(function (c, i) { V.paint(i, c); }); }, '外圈個數是偶數（例如 4、6、8）：中心 1 種顏色，外圈用另外 2 種輪流塗'); b0.append(P.hint('中心用掉一種顏色後，外圈只剩幾種顏色？外圈要怎麼塗才不撞色？'));
      }
      P.taskSeq(box, api, [mapTask, minTask, wheelTask], { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-map' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-map', moduleName: '塗色（一）：地圖著色，相鄰與最少色數', askAbout: '地圖著色、相鄰、最少色數',
        aha: '<b>相鄰要共用一段邊界線</b>（對角不算）；<b>兩兩相鄰的區域有幾個，至少就要幾種顏色</b>；<b>奇數個的圈要 3 色、偶數個的圈 2 色</b>。',
        cards: [{ text: '相鄰：共用一段邊界線（只碰到一個角不算）；點線圖：相鄰才連線', src: '小學到國中：塗色問題' }, { text: '一圈區域：偶數個 2 色，奇數個 3 色；輪形：外圈偶數個 3 色，奇數個 4 色', src: '圖的著色' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '色數與兩兩相鄰的組數<br>二分圖' }, { at: 0.85, label: '四色定理' }] },
        teasers: [{ title: '染色問題', q: '有些題目先把圖形「染色」再數，會變得很簡單。為什麼染色可以幫忙證明不可能、或幫忙計數？', where: 'PK2B 2512 第 14 堂（2026 年 4 月）：染色問題', lv: 'L2' }],
        parent: { pitfall: '孩子常把只碰到一個角的對角區域也當成相鄰；以為每張地圖都要 4 色；塗不下去就以為沒辦法。', place: '小學到國中的塗色問題，是計數塗色（乘法原理）的基礎。', ask: ['兩個區域只碰到一個角，算相鄰嗎？', '要怎麼判斷一張地圖「最少」要幾種顏色？', '一圈區域什麼時候 2 種顏色就夠？'] },
        classes: ['PK2B（2026 年 4 月，第 14 堂）：染色問題'], next: { href: 'play-color-count1.html', text: '下一個：塗色計數（一），選擇數與塗色順序' } });
    }];
  new P.Lesson({ id: 'color-map', title: '塗色（一）：地圖著色，相鄰與最少色數', steps: steps });
})();
