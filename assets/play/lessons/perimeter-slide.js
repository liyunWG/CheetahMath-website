/* 獵豹玩中學｜周長問題：把凹進去的邊推出去
   預測＋拖動缺角（周長不變、面積會變）→ 滑桿把邊推出去補成長方形 → 缺口開在邊的中間（周長變長）→ 3 個操作關卡。 */
(function () {
  var P = Play, h = P.h, X0 = 2, X1 = 10, Y0 = 2, Y1 = 8;   /* 外框：長方形 (2,2)–(10,8)，長 8、寬 6，周長 28 */
  function stage(st, sm) { var w = h('div', { class: 'pl-stage' + (sm ? ' pl-stage--sm' : '') }); st.append(w); return w; }
  function fmt(n) { return '' + Math.round(n * 100) / 100; }
  /* 畫出多邊形：橫的邊藍色、直的邊粉紅色；回傳 {H 橫邊總長, V 直邊總長, per 周長, area 面積} */
  function drawShape(board, g, v) {
    var n = v.length, H = 0, V = 0, area = 0, i; g.innerHTML = '';
    g.append(h('polygon', { points: board.pts(v), class: 'pl-poly pl-poly--amber' }));
    for (i = 0; i < n; i++) {
      var a = v[i], b = v[(i + 1) % n], dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]); area += a[0] * b[1] - b[0] * a[1];
      if (dx < 1e-9 && dy < 1e-9) continue;
      if (dy < 1e-9) { H += dx; board.line(a, b, 'pl-line pl-line--bold pl-line--blue', g); } else { V += dy; board.line(a, b, 'pl-line pl-line--bold pl-line--pink', g); }
    }
    return { H: H, V: V, per: H + V, area: Math.abs(area) / 2 };
  }
  function cornerShape(x, y) { return [[X0, Y0], [X1, Y0], [X1, y], [x, y], [x, Y1], [X0, Y1]]; }                  /* 右上角缺一塊 */
  function midShape(xe, ye) { return [[X0, Y0], [X1, Y0], [X1, Y1], [xe, Y1], [xe, ye], [4, ye], [4, Y1], [X0, Y1]]; }  /* 上邊中間缺一塊（寬 xe−4） */
  function pillRow(st) { var pH = P.pill('', 'is-blue'), pV = P.pill('', 'is-pink'), pP = P.pill('', 'is-amber'), pA = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pH, pV), h('div', { class: 'pl-readout' }, pP, pA)); return function (s, extra) { pH.textContent = '橫的邊共 ' + fmt(s.H); pV.textContent = '直的邊共 ' + fmt(s.V); pP.textContent = '周長 ＝ ' + fmt(s.per); pA.textContent = '面積 ＝ ' + fmt(s.area); if (extra) { pP.className = 'pl-pill ' + extra; } }; }
  function frame(board, g) { board.poly([[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], 'pl-poly pl-poly--ghost', g); }

  var steps = [
    /* 1. 預測＋拖動缺角 */
    function (st, api) {
      var gate = { on: true }, moves = {}, nm = 0, done = false;
      P.choice(st, api, { id: 'ps-p1', predict: true, label: '先猜猜看', prompt: '一個 8 × 6 的長方形（周長 28），從<b>右上角剪掉一塊</b>。剪掉之後，周長會…？', row: true, options: [{ t: '變短' }, { ok: true, t: '不變' }, { t: '變長' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動缺角的角，看周長'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), gF = h('g'), g = h('g'); board.gMid.append(gF, g); frame(board, gF);
      var upd = pillRow(st);
      function draw(t) { var s = drawShape(board, g, cornerShape(t[0], t[1])); upd(s, s.per === 28 ? 'is-ok' : 'is-amber'); }
      var hd = board.handle({ pos: [7, 5], valid: function (t) { return t[0] >= 3 && t[0] <= 10 && t[1] >= 3 && t[1] <= 8; }, constrain: function (r) { return r; }, disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; },
        onMove: function (t) { draw(t); var k = t.join(','); if (!moves[k]) { moves[k] = 1; nm++; } if (nm >= 5 && !done) { done = true; P.track('aha', { id: 'perimeter-slide', step: 1 }); P.toast(api.ctx.p1 === 1 ? '你猜對了！周長不變' : '周長還是 28'); st.append(P.ruleBox('缺角的大小一直在變，<b>面積</b>變小了，但<b>周長永遠是 28</b>，和原本的長方形一樣。', '周長不變')); api.unlock('缺角，周長不變！'); } } });
      api.solve(function () { gate.on = false; [[6, 6], [4, 4], [9, 7], [5, 3], [8, 4]].forEach(hd.moveTo); });
      draw([7, 5]); st.append(P.hint('藍色是橫的邊、粉紅色是直的邊。拖動缺角那個角，至少換 5 個位置。')); api.lock('先做上面的預測');
    },
    /* 2. 把邊推出去 */
    function (st, api) {
      st.append(P.instr('用滑桿把凹進去的邊<b>推出去</b>，看看橫的邊和直的邊<b>各共多長</b>。'));
      var starts = [[7, 5], [5, 4], [4, 6]], si = 0, u = 0, seen = {}, done = false;
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), gF = h('g'), g = h('g'); board.gMid.append(gF, g); frame(board, gF);
      var upd = pillRow(st);
      function draw() { var s0 = starts[si], x = s0[0] + (X1 - s0[0]) * u, y = s0[1] + (Y1 - s0[1]) * u, s = drawShape(board, g, cornerShape(x, y)); upd(s, 'is-ok'); if (u >= 0.99 && !seen[si]) { seen[si] = 1; P.toast('補成長方形：周長 ＝ 2 × (8 ＋ 6)'); } if (Object.keys(seen).length >= 2 && !done) { done = true; P.track('aha', { id: 'perimeter-slide', step: 2 }); st.append(P.ruleBox('凹進去的邊往外推的時候，<b>橫的邊總長永遠是 16（＝上下各一個「長」）</b>，<b>直的邊總長永遠是 12（＝左右各一個「寬」）</b>。<br>所以周長 ＝ 16 ＋ 12 ＝ 28，和外面的長方形一樣：<b>周長 ＝ 2 ×（長 ＋ 寬）</b>。', '平移法')); api.unlock('把邊推出去，周長不變'); } }
      var sl = P.slider(0, 100, 0, function (v) { u = v / 100; draw(); }), sn = P.stepper('缺角大小', 1, 3, 1, function (v) { si = v - 1; sl.value = 0; u = 0; draw(); }, function (v) { return ['小', '中', '大'][v - 1] + '缺角'; });
      st.append(h('div', { class: 'pl-steprow' }, sn.el), sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 缺角'), h('span', {}, '推成長方形 →')));
      api.solve(function () { [1, 2].forEach(function (k) { si = k - 1; sn.set(k, true); sl.value = 100; u = 1; draw(); }); });
      draw(); st.append(P.hint('至少用 2 種缺角大小，各推成長方形一次。')); api.lock('2 種缺角都推成長方形');
    },
    /* 3. 缺口開在邊的中間 */
    function (st, api) {
      var gate = { on: true }, ys = {}, done = false;
      P.choice(st, api, { id: 'ps-p3', predict: true, label: '先猜猜看', prompt: '這次缺口開在<b>上面那條邊的中間</b>（不是角落）。周長還會不變嗎？', row: true, options: [{ t: '不變' }, { ok: true, t: '變長' }, { t: '變短' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動缺口的角，看周長'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), gF = h('g'), g = h('g'); board.gMid.append(gF, g); frame(board, gF);
      var upd = pillRow(st);
      function draw(t) { var s = drawShape(board, g, midShape(t[0], t[1])), d = Y1 - t[1]; upd(s, s.per === 28 ? 'is-ok' : 'is-pink'); return d; }
      var hd = board.handle({ pos: [7, 6], valid: function (t) { return t[0] >= 5 && t[0] <= 9 && t[1] >= 3 && t[1] <= 7; }, disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; },
        onMove: function (t) { var d = draw(t); ys[d] = 1; if (Object.keys(ys).length >= 3 && !done) { done = true; P.track('aha', { id: 'perimeter-slide', step: 3 }); P.toast(api.ctx.p3 === 1 ? '你猜對了！變長了' : '周長變長了'); st.append(P.ruleBox('缺口在邊的中間時，缺口的<b>兩面牆</b>是多出來的直邊，推不出去。<br>周長 ＝ 28 ＋ 2 × <b>缺口的深度</b>。<br>只有<b>缺在角落</b>，凹進去的邊才能全部推到外面。', '角落與中間')); api.unlock('缺口在中間，周長會變長'); } } });
      api.solve(function () { gate.on = false; [[7, 5], [6, 4], [8, 3]].forEach(hd.moveTo); });
      draw([7, 6]); st.append(P.hint('至少看 3 種不同的深度。深度 ＝ 缺口往下凹了幾格。')); api.lock('先做上面的預測');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(prompt, mk) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: prompt })); var host = stage(b0, true), board = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), gF = h('g'), g = h('g'); board.gMid.append(gF, g); frame(board, gF);
          var upd = pillRow(b0); mk(board, g, upd, done, setSolve, b0);
          b0.append(h('div', { class: 'pl-caption' }, ''));
        };
      }
      var tasks = [
        task('缺掉右上角的一塊，讓<b>缺掉的面積剛好是 6</b>。找出 <b>2 種</b>不同的缺法，周長會是多少？', function (board, g, upd, done, setSolve, b0) {
          var found = {}, nf = 0, fin = false, pf = P.pill('已找到 0 / 2 種', 'is-amber'); b0.insertBefore(h('div', { class: 'pl-readout' }, pf), b0.lastChild);
          function draw(t) { var s = drawShape(board, g, cornerShape(t[0], t[1])), miss = (X1 - t[0]) * (Y1 - t[1]); upd(s, 'is-ok'); return miss; }
          var hd = board.handle({ pos: [7, 5], valid: function (t) { return t[0] >= 3 && t[0] <= 10 && t[1] >= 3 && t[1] <= 8; }, onMove: function (t) { var m = draw(t); if (m === 6 && !found[t.join(',')]) { found[t.join(',')] = 1; nf++; pf.textContent = '已找到 ' + nf + ' / 2 種'; P.toast('缺 6 格，周長還是 28'); if (nf >= 2 && !fin) { fin = true; pf.className = 'pl-pill is-ok'; done(); } } } });
          setSolve(function () { [[4, 7], [7, 6]].forEach(hd.moveTo); }); draw([7, 5]);
        }),
        task('缺口開在上邊中間，讓<b>周長剛好是 32</b>。', function (board, g, upd, done, setSolve) {
          var fin = false;
          function draw(t) { var s = drawShape(board, g, midShape(t[0], t[1])); upd(s, s.per === 32 ? 'is-ok' : 'is-pink'); return s.per; }
          var hd = board.handle({ pos: [7, 7], valid: function (t) { return t[0] >= 5 && t[0] <= 9 && t[1] >= 3 && t[1] <= 7; }, onMove: function (t) { if (draw(t) === 32 && !fin) { fin = true; P.toast('28 ＋ 2 × 深度 2 ＝ 32'); done(); } } });
          setSolve(function () { hd.moveTo([7, 6]); }); draw([7, 7]);
        }),
        task('兩個角落各缺一塊：右上角（上面的把手）和左下角（下面的把手）。讓<b>缺掉的面積合起來剛好是 10</b>，周長會變嗎？', function (board, g, upd, done, setSolve) {
          var D = [8, 6], G = [4, 4], fin = false;
          function shape() { return [[G[0], Y0], [X1, Y0], [X1, D[1]], [D[0], D[1]], [D[0], Y1], [X0, Y1], [X0, G[1]], [G[0], G[1]]]; }
          function draw() { var s = drawShape(board, g, shape()), miss = (X1 - D[0]) * (Y1 - D[1]) + (G[0] - X0) * (G[1] - Y0); upd(s, 'is-ok'); if (miss === 10 && !fin) { fin = true; P.toast('缺 10 格，周長還是 28'); done(); } return miss; }
          var h1 = board.handle({ pos: D, valid: function (t) { return t[0] >= 6 && t[0] <= 10 && t[1] >= 5 && t[1] <= 8; }, onMove: function (t) { D = t; draw(); } }), h2 = board.handle({ pos: G, cls: 'is-pink', valid: function (t) { return t[0] >= 3 && t[0] <= 5 && t[1] >= 3 && t[1] <= 5; }, onMove: function (t) { G = t; draw(); } });
          setSolve(function () { h1.moveTo([6, 6]); h2.moveTo([4, 4]); }, '周長不變，還是 28（缺在角落，周長不會變）'); draw();
        })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'perimeter-slide' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'perimeter-slide', moduleName: '周長問題：把凹進去的邊推出去', askAbout: '小學周長問題（平移法）', aha: '缺在角落，把凹進去的邊推出去，周長不變；<br>周長＝橫的邊共 ＋ 直的邊共。',
        cards: [{ text: '缺在角落的直角圖形，周長 ＝ 外框長方形的周長 ＝ 2 ×（長 ＋ 寬）（平移法）', src: '小學「周長問題」' }, { text: '缺口在邊的中間：周長 ＝ 外框周長 ＋ 2 × 缺口深度', src: '小學周長問題（凹凸圖形）' }],
        depth: { here: 0.14, cheetah: [{ at: 0.42, label: '直線形的周長<br>面積與割補' }, { at: 0.85, label: '圓與扇形周長<br>曲線形' }] },
        teasers: [
          { title: '直線形中的周長問題', q: '階梯形、十字形的周長，不用一條一條量，怎麼一眼算出來？切一刀或剪掉一塊之後，周長多了還是少了？', where: 'PK4A 2507 第 9 堂：直線形中的周長問題；PK1A 2607 第 7 堂：周長問題', lv: 'L2' },
          { title: '周長問題的進階', q: '邊長 10 公分的正方形紙片，橫剪一刀、豎剪兩刀分成 6 塊，6 塊的周長總和比原來的正方形增加了多少？', where: 'PK1A 2607 第 7 堂（例 6）；PI1A 2607 第 5 堂：周長問題', lv: 'L2' },
          { title: '圓與扇形的周長', q: '圓的周長怎麼來的？割補之後曲線形的周長和面積怎麼算？', where: 'PK3B 2512 第 20 堂：關於圓的周長；PK3C 2507 第 15 堂：圓與扇形周長面積', lv: 'L3' }],
        parent: { pitfall: '孩子常一條邊一條邊加，漏掉凹進去的邊；也常以為「剪掉一塊，周長就變短」，其實缺在角落時周長不變，缺在中間反而變長。', place: '小學三到四年級的周長問題，是之後面積、割補、等積變形的基礎。', ask: ['剪掉長方形的一個角，周長會變嗎？為什麼？', '缺口在邊的中間，周長變多少？', '橫的邊和直的邊，各自共多長？'] },
        classes: ['PK1A（2607 第 7 堂）：周長問題', 'PI1A（2607 第 5 堂、2507 第 6 堂）：周長問題', 'PK4A（2507 第 9 堂）：直線形中的周長問題'], next: { href: 'play-dice-grid.html', text: '下一個：兩顆骰子看機率' } });
    }];
  new P.Lesson({ id: 'perimeter-slide', title: '周長問題：把凹進去的邊推出去', steps: steps });
})();
