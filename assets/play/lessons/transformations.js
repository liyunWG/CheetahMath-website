/* 獵豹玩中學｜幾何變換：平移、鏡射、旋轉（格點版，座標都是整數） */
(function () {
  var P = Play, h = P.h, rad = Math.PI / 180;
  function stage(st) { var w = h('div', { class: 'pl-stage' }); st.append(w); return w; }
  function add(p, v) { return [p[0] + v[0], p[1] + v[1]]; }
  function fmt(n) { return String(Math.round(n * 10) / 10); }
  function lab(b, p, t, cls, off) { return b.text([p[0] + (off ? off[0] : 0), p[1] + (off ? off[1] : 0)], t, cls || 'pl-text'); }
  function rot(p, c, deg) { var a = deg * rad, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
  function allPts(w, hh) { var c = []; for (var x = 0; x <= w; x++) for (var y = 0; y <= hh; y++) c.push([x, y]); return c; }
  var NAMES = ['A', 'B', 'C'];

  var steps = [
    /* 1 平移 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '平移'), P.instr('拖動綠點 A′，把整個三角形<b>搬進虛線框</b>。'));
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); P.snapSwitch(board, host);
      var T0 = [[1, 1], [4, 2], [2, 4]], goal = [5, 4], done = false, cand = allPts(9, 7);
      board.poly(T0.map(function (p) { return add(p, goal); }), 'pl-poly pl-poly--ghost');
      board.poly(T0, 'pl-poly pl-poly--blue');
      T0.forEach(function (p, i) { board.dot(p, 'pl-dot', null, 0.12); lab(board, p, NAMES[i], 'pl-text pl-text--blue', [i === 1 ? 0.5 : -0.5, -0.55]); });
      var gArrows = h('g'), img = board.poly(T0, 'pl-poly pl-poly--green'); board.gMid.append(gArrows);
      var labs = T0.map(function (p, i) { return lab(board, p, NAMES[i] + '′', 'pl-text pl-text--green'); });
      var pv = P.pill('', 'is-green'), pc = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pv, pc);
      function draw(t) {
        var d = [t[0] - T0[0][0], t[1] - T0[0][1]], I = T0.map(function (p) { return add(p, d); });
        board.setPoly(img, I); gArrows.innerHTML = '';
        I.forEach(function (p, i) { if (d[0] || d[1]) board.line(T0[i], p, 'pl-line pl-line--green pl-line--dash', gArrows); board.setText(labs[i], [p[0] + (i === 1 ? 0.5 : -0.5), p[1] + 0.5]); });
        pv.textContent = '三個點都：' + (d[0] >= 0 ? '右 ' + fmt(d[0]) : '左 ' + fmt(-d[0])) + '、' + (d[1] >= 0 ? '上 ' + fmt(d[1]) : '下 ' + fmt(-d[1]));
        var ok = board.snapOn ? (d[0] === goal[0] && d[1] === goal[1]) : (Math.abs(d[0] - goal[0]) < 0.3 && Math.abs(d[1] - goal[1]) < 0.3);
        pc.className = 'pl-pill' + (ok ? ' is-ok' : ''); pc.textContent = ok ? '✓ 進框了' : '還沒進框'; return { ok: ok, d: d };
      }
      var hd = board.handle({ pos: T0[0].slice(), candidates: function () { return board.snapOn ? cand : null; }, valid: function (p) { return p[0] >= 0 && p[0] <= 9 && p[1] >= 0 && p[1] <= 7; },
        onMove: function (t) {
          var r = draw(t);
          if (r.ok && !done) {
            done = true; if (!board.snapOn) { hd.set(add(T0[0], goal)); draw(add(T0[0], goal)); }
            P.track('aha', { id: 'transformations', step: 1 });
            st.append(P.ruleBox('<b>平移</b>：每個點都移動<b>同一個方向、同一個距離</b>（三條虛線平行又一樣長）。形狀、大小、朝向都不變。', '性質')); api.unlock('這就是平移！');
          }
        } });
      api.solve(function () { hd.moveTo(add(T0[0], goal)); });
      draw(T0[0]); st.append(ro, P.hint('三個點一起走：看上面「右幾、上幾」。')); api.lock('把三角形搬進虛線框');
    },
    /* 2 鏡射 */
    function (st, api) {
      var gate = { on: true };
      P.choice(st, api, { id: 'tr-p2', predict: true, label: '先猜猜看', prompt: '直線 y = x 是一面鏡子。點 P(2, 7) 的鏡中像 P′ 在哪？', row: true, options: [{ t: '(7, 2)' }, { t: '(−2, −7)' }, { t: '(2, −7)' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 P，換 3 個位置'); } });
      var host = stage(st), board = new P.Board(host, { w: 10, h: 10 }); P.snapSwitch(board, host);
      board.line([0, 0], [10, 10], 'pl-line pl-line--green pl-line--dash'); lab(board, [8, 9.4], '鏡線 y = x', 'pl-text pl-text--green pl-text--sm');
      var g = h('g'); board.gMid.append(g); var seen = {}, n = 0, cand = allPts(10, 10), pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout' }, pa, pb);
      function draw(p) {
        g.innerHTML = ''; var q = [p[1], p[0]], m = [(p[0] + p[1]) / 2, (p[0] + p[1]) / 2];
        board.line(p, q, 'pl-line pl-line--amber pl-line--dash', g); board.dot(q, 'pl-dot pl-dot--pink', g, 0.22); board.dot(m, 'pl-dot', g, 0.12);
        var up = p[1] >= p[0], tag = function (pt, name, cls, above) { var x = Math.max(1.4, Math.min(8.6, pt[0] + (above ? -0.9 : 0.9))), y = Math.max(0.3, Math.min(9.7, pt[1] + (above ? 0.75 : -0.95))); board.text([x, y], name + '(' + fmt(pt[0]) + ', ' + fmt(pt[1]) + ')', cls, g); };
        tag(p, 'P', 'pl-text pl-text--blue', up); tag(q, 'P′', 'pl-text pl-text--pink', !up);
        if (p[0] !== p[1]) { var L = Math.hypot(q[0] - p[0], q[1] - p[1]); board.rightMark(m, [(q[0] - p[0]) / L, (q[1] - p[1]) / L], [1 / Math.SQRT2, 1 / Math.SQRT2], 0.4, g); }
        pa.textContent = 'P (' + fmt(p[0]) + ', ' + fmt(p[1]) + ')'; pb.textContent = 'P′ (' + fmt(q[0]) + ', ' + fmt(q[1]) + ')';
      }
      var hd = board.handle({ pos: [2, 7], candidates: function () { return board.snapOn ? cand : null; }, disabled: function () { return gate.on; }, valid: function (p) { return p[0] >= 0 && p[1] >= 0; },
        onMove: function (t) {
          draw(t); var k = Math.round(t[0] * 2) + ',' + Math.round(t[1] * 2);
          if (t[0] !== t[1] && !seen[k]) { seen[k] = 1; n++; }
          if (n >= 3 && !st.querySelector('.pl-rule')) {
            P.track('aha', { id: 'transformations', step: 2 });
            st.append(P.ruleBox('<b>鏡射</b>：P 和 P′ 的連線被鏡線<b>垂直平分</b>（直角記號＋中點）。<br>對 y = x 鏡射：<b>(x, y) → (y, x)</b> 座標對調。', '性質'));
            P.toast(api.ctx.p2 === 0 ? '你猜對了！座標對調' : '座標對調：(x, y) → (y, x)'); api.unlock('發現規律了！');
          }
        } });
      api.solve(function () { gate.on = false; [[3, 8], [6, 1], [1, 4]].forEach(hd.moveTo); });
      draw([2, 7]); st.append(ro, P.hint('P′ 會自己跟著動。虛線＝P 到鏡中像的連線。')); api.lock('先做上面的預測');
    },
    /* 3 旋轉 */
    function (st, api) {
      var gate = { on: true }, C0 = [6, 5], T = [[8, 5], [10, 6], [8, 8]];
      P.choice(st, api, { id: 'tr-p3', predict: true, label: '先猜猜看', prompt: '△ABC 繞中心 ★ <b>逆時針</b>轉 90°，A 會跑到 ★ 的…？', row: true, options: [{ t: '正上方' }, { t: '正左方' }, { t: '正下方' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('按 ＋ 轉轉看'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 });
      board.poly(T, 'pl-poly pl-poly--ghost'); var arc = h('g'); board.gMid.append(arc);
      var tri = board.poly(T, 'pl-poly pl-poly--pink'), spokes = T.map(function () { return board.line(C0, C0, 'pl-line pl-line--amber pl-line--dash'); });
      var tl = T.map(function (p, i) { return lab(board, p, NAMES[i] + '′', 'pl-text pl-text--pink'); });
      T.forEach(function (p, i) { board.dot(p, 'pl-dot', null, 0.1); lab(board, p, NAMES[i], 'pl-text', [i === 1 ? 0.5 : -0.45, -0.5]); });
      board.dot(C0, 'pl-dot pl-dot--amber', null, 0.22); lab(board, C0, '★', 'pl-text pl-text--amber', [-0.5, -0.5]);
      var pa = P.pill('', 'is-pink'), pd = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pa, pd), visited = {};
      function draw(a) {
        var I = T.map(function (p) { return rot(p, C0, a); }); board.setPoly(tri, I);
        I.forEach(function (p, i) { board.setLine(spokes[i], C0, p); board.setText(tl[i], [p[0] + (p[0] >= C0[0] ? 0.5 : -0.5), p[1] + 0.5]); });
        arc.innerHTML = '';
        if (Math.abs(a) > 1) { var pts = []; for (var k = 0; k <= 30; k++) pts.push(rot(T[0], C0, a * k / 30)); arc.append(h('polyline', { points: board.pts(pts), class: 'pl-line pl-line--amber', fill: 'none' })); }
        pa.textContent = '轉了 ' + fmt(Math.round(a)) + '°'; pd.textContent = 'A 到 ★ 的距離 ' + fmt(Math.hypot(I[0][0] - C0[0], I[0][1] - C0[1])) + '（不變）';
      }
      var sp = new P.Spring(0, { k: 160, zeta: 0.5, onUpdate: draw }); draw(0);
      var stp = P.stepper('旋轉 ×90°', 0, 4, 0, function (v) {
        if (gate.on) return; sp.to(v * 90); visited[v] = 1;
        if (visited[1] && visited[2] && !st.querySelector('.pl-rule')) setTimeout(concl, 650);
      }, function (v) { return v * 90 + '°'; });
      function concl() {
        if (st.querySelector('.pl-rule')) return;
        P.track('aha', { id: 'transformations', step: 3 });
        st.append(P.ruleBox('<b>旋轉</b>：每個點繞中心轉<b>同樣的角度</b>，到中心的<b>距離不變</b>（橘色虛線一樣長），形狀不變。', '性質'));
        P.toast(api.ctx.p3 === 0 ? '你猜對了！在正上方' : '逆時針 90°：A 轉到正上方'); api.unlock('看懂旋轉了！');
      }
      api.solve(function () { gate.on = false; visited[1] = visited[2] = 1; stp.set(1, true); sp.to(90); concl(); });
      st.append(stp.el, ro, P.hint('橘色弧線＝A 走過的路；轉 4 次回到原位。')); api.lock('先做上面的預測');
    },
    /* 4 辨認 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      var T = [[1, 2], [4, 2], [1, 5]];
      function pair(img, extra) {
        var host = h('div', { class: 'pl-stage' }); box.append(host); var b = new P.Board(host, { w: 12, h: 10 });
        b.poly(T, 'pl-poly pl-poly--blue'); b.poly(img, 'pl-poly pl-poly--pink'); if (extra) extra(b); return b;
      }
      function ask(n, prompt, ans, fb, img, extra) {
        box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + n + ' / 4 題'));
        pair(img, extra);
        var opts = ['平移', '旋轉', '鏡射'].map(function (t, i) { return { t: t, ok: i === ans, fb: i === ans ? fb : '再看看：藍色變成粉紅色，各點是怎麼走的？' }; });
        P.choice(box, {}, { id: 'tr-t' + n, prompt: prompt, row: true, options: opts, onAnswer: next });
      }
      var qs = [
        function () { ask(1, '藍色三角形變成粉紅色三角形，是哪一種變換？', 0, '對！每個點都向右、向下走同樣的路。', [[7, 0], [10, 0], [7, 3]], function (b) { [0, 1, 2].forEach(function (i) { b.line(T[i], [T[i][0] + 6, T[i][1] - 2], 'pl-line pl-line--amber pl-line--dash'); }); }); },
        function () { ask(2, '這一次呢？（綠色虛線是一面鏡子）', 2, '對！兩邊對稱，朝向反過來。', [[11, 2], [8, 2], [11, 5]], function (b) { b.line([6, 0], [6, 10], 'pl-line pl-line--green pl-line--dash'); }); },
        function () { ask(3, '這一次呢？（★ 是中心）', 1, '對！繞 ★ 逆時針轉了 90°。', [[8, 1], [8, 4], [5, 1]], function (b) { b.dot([5, 5], 'pl-dot pl-dot--amber', null, 0.22); lab(b, [5, 5], '★', 'pl-text pl-text--amber', [-0.5, 0.4]); }); },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 4 / 4 題'));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm', axes: true, ox: 5, oy: 6 }), O = [6, 5], P0 = [10, 6];
          b.text([5.4, 4.3], 'O', 'pl-text pl-text--sm'); b.dot(P0, 'pl-dot pl-dot--blue', null, 0.2); lab(b, P0, 'P(4, 1)', 'pl-text pl-text--blue', [0.3, 0.75]);
          var g = h('g'); b.gMid.append(g);
          function xy(p) { return '(' + fmt(Math.round((p[0] - O[0]) * 10) / 10) + ', ' + fmt(Math.round((p[1] - O[1]) * 10) / 10) + ')'; }
          function draw(a) {
            g.innerHTML = ''; var Q = rot(P0, O, a), pts = [];
            for (var i = 0; i <= 30; i++) pts.push(rot(P0, O, a * i / 30));
            g.append(h('polyline', { points: b.pts(pts), class: 'pl-line pl-line--amber', fill: 'none' })); b.line(O, Q, 'pl-line pl-line--pink pl-line--dash', g); b.dot(Q, 'pl-dot pl-dot--pink', g, 0.22);
            if (Math.abs(a) > 1) b.text([Math.max(1.6, Math.min(10.4, Q[0] + 0.3)), Math.max(0.5, Math.min(9.6, Q[1] + 0.75))], 'P′' + xy(Q), 'pl-text pl-text--pink', g);
          }
          var sp = new P.Spring(0, { k: 160, zeta: 0.5, onUpdate: draw }); draw(0);
          var stp = P.stepper('旋轉 ×90°', 0, 4, 0, function (v) { sp.to(v * 90); }, function (v) { return v * 90 + '°'; }); box.append(stp.el);
          box.append(h('div', { class: 'pl-q', html: '按 ＋ 讓 P <b>逆時針</b>轉。轉 90° 後，P 變成 (−1, <b>？</b>)。？ 是多少？' }));
          P.numBox(box, { answer: 4, okMsg: '對！旋轉 90°：(x, y) → (−y, x)，所以 (4, 1) → (−1, 4)。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'transformations' }); }, wrong: function () { return '提示：按 ＋ 轉 90°，看看粉紅點的座標。'; } });
        }
      ];
      function next() { setTimeout(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 4 題');
    },
    /* 5 完成 */
    function (st) {
      P.complete(st, {
        id: 'transformations', moduleName: '幾何變換', askAbout: '國七、國八幾何與坐標', aha: '平移、鏡射、旋轉：<br>形狀大小都不變，只是「位置與朝向」變了。',
        cards: [{ text: '平移＝每點走同一個向量；鏡射＝連線被鏡線垂直平分；旋轉＝繞中心轉同角度、距離不變', src: '國中「對稱、平移與旋轉」（獵豹 J71S CH5）' }, { text: '旋轉 90°：(x, y) → (−y, x)；對 y = x 鏡射：(x, y) → (y, x)', src: '高中「矩陣與線性變換」（獵豹 S112）的起點' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '旋轉移形<br>輔助線' }, { at: 0.88, label: 'PK4B<br>幾何變換' }] },
        teasers: [
          { title: '旋轉移形（手拉手模型）', q: '正三角形內一點到三頂點距離是 3、4、5，求邊長——把圖形「轉」一下就看穿。', where: 'J82A 幾何小花、PK4B 幾何變換', lv: 'L2' },
          { title: '翻折與最短路徑（將軍飲馬）', q: '對稱點如何把折線「拉直」？兩次、三次翻折呢？', where: 'J71S CH5', lv: 'L2' },
          { title: '兩次鏡射＝旋轉？', q: '連續對相交的兩面鏡子鏡射，結果竟是一個旋轉，角度是多少？', where: 'PK4B 幾何變換', lv: 'L3' },
          { title: '用矩陣表示旋轉', q: '為什麼 (x, y) → (x cos θ − y sin θ, x sin θ + y cos θ)？', where: 'S112 矩陣', lv: 'L3' }],
        parent: { pitfall: '孩子常把「旋轉」只當成「看起來轉過去」，不會用「到中心距離不變、角度相同」來做題；鏡射則常忘記方向會反過來。', place: '國中「對稱、平移、旋轉」到高中「線性變換」的共同基礎；也是幾何證明「旋轉移形」「對稱點」輔助線的來源。', ask: ['平移的時候，每個點走的路有什麼共同點？', '鏡射之後，點和它的像連起來，與鏡線有什麼關係？', '旋轉 90° 後，座標 (x, y) 會變成什麼？'] },
        classes: ['J71S（CH5）：坐標、對稱、平移與旋轉', 'J82A 幾何小花：旋轉移形、輔助線', 'PK4B：幾何變換、割補', 'S112：矩陣與線性變換'],
        next: { href: 'play-multiplication.html', text: '下一個：乘法公式的圖解' } });
    }];
  new P.Lesson({ id: 'transformations', title: '幾何變換', steps: steps });
})();
