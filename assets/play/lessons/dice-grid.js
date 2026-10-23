/* 獵豹玩中學｜兩顆骰子：36 格看機率
   預測＋看每個點數和有幾格 → 塗出指定機率 → 4 個操作關卡（塗出事件：甲比乙大、點數相同、至少一顆 6、乘積是奇數）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA;
  var X0 = 2.2, Y0 = 1.5, CS = 1.3;
  function frac(n) { if (n === 0) return '0'; var g = PA.gcd(n, 36), a = n / g, d = 36 / g; return d === 1 ? '1' : a + '/' + d; }

  /* 6×6 格子：橫軸＝甲骰、縱軸＝乙骰。set／點選／拖過去塗色。o.num 為 true 時每格顯示兩數的和 */
  function makeGrid(board, o) {
    o = o || {}; var g = h('g'), on = {}, rects = {}, mode = false, drag = false, self = { on: on, rects: rects };
    board.gMid.append(g);
    function key(a, b) { return a + ',' + b; }
    function cx(a) { return X0 + (a - 0.5) * CS; } function cy(b) { return Y0 + (b - 0.5) * CS; }
    for (var b = 1; b <= 6; b++) for (var a = 1; a <= 6; a++) {
      var r = h('rect', { x: cx(a) - CS / 2 + 0.03, y: board.Y(cy(b)) - CS / 2 + 0.03, width: CS - 0.06, height: CS - 0.06, rx: 0.12, class: 'pa-cell', 'data-a': a, 'data-b': b }); rects[key(a, b)] = r; g.append(r);
      if (o.num) board.text([cx(a), cy(b) - 0.18], '' + (a + b), 'pl-text pl-text--sm', g).style.pointerEvents = 'none';
    }
    for (var i = 1; i <= 6; i++) { board.text([cx(i), Y0 - 0.35], '' + i, 'pl-text pl-text--sm pl-text--blue', g); board.text([X0 - 0.55, cy(i) - 0.18], '' + i, 'pl-text pl-text--sm pl-text--pink', g); }
    board.text([X0 + 3 * CS, Y0 - 1.1], '甲骰的點數 →', 'pl-text pl-text--sm pl-text--blue', g); board.text([1.0, Y0 + 6 * CS + 0.55], '乙骰↑', 'pl-text pl-text--sm pl-text--pink', g);
    self.set = function (a, b, v) { on[key(a, b)] = !!v; rects[key(a, b)].setAttribute('class', 'pa-cell' + (v ? ' is-on' : '')); };
    self.hi = function (pred) { for (var b = 1; b <= 6; b++) for (var a = 1; a <= 6; a++) rects[key(a, b)].setAttribute('class', 'pa-cell' + (pred(a, b) ? ' is-hi' : '')); };
    self.count = function () { var n = 0; for (var k in on) if (on[k]) n++; return n; };
    self.clear = function () { for (var b = 1; b <= 6; b++) for (var a = 1; a <= 6; a++) self.set(a, b, false); if (o.onChange) o.onChange(); };
    self.fill = function (pred) { for (var b = 1; b <= 6; b++) for (var a = 1; a <= 6; a++) self.set(a, b, pred(a, b)); if (o.onChange) o.onChange(); };
    function cellOf(el) { if (!el || !el.getAttribute) return null; var a = el.getAttribute('data-a'); return a ? [+a, +el.getAttribute('data-b')] : null; }
    if (o.paint) {
      board.svg.addEventListener('pointerdown', function (e) { var c = cellOf(e.target); if (!c || (o.locked && o.locked())) return; mode = !on[key(c[0], c[1])]; drag = true; self.set(c[0], c[1], mode); if (o.onChange) o.onChange(); });
      board.svg.addEventListener('pointermove', function (e) { if (!drag || e.pointerType === 'touch') return; var c = cellOf(document.elementFromPoint(e.clientX, e.clientY)); if (c && !!on[key(c[0], c[1])] !== mode) { self.set(c[0], c[1], mode); if (o.onChange) o.onChange(); } });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { board.svg.addEventListener(t, function () { drag = false; }); });
    }
    return self;
  }

  var steps = [
    /* 1. 預測＋每個點數和有幾格 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, s = 7;
      P.choice(st, api, { id: 'dg-p1', predict: true, label: '先猜猜看', prompt: '同時丟兩顆骰子，<b>點數和</b>是哪一個最容易出現？', row: true, options: [{ t: '和是 2' }, { ok: true, t: '和是 7' }, { t: '和是 12' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('用 ＋ － 換點數和，看有幾格'); } });
      var b = PA.board(st, 11, 10), grid = makeGrid(b, { num: true });
      var pS = P.pill('', 'is-blue'), pK = P.pill('', 'is-amber'), pP = P.pill('', 'is-ok'); st.append(h('div', { class: 'pl-readout' }, pS, pK, pP));
      function draw() { grid.hi(function (a, c) { return a + c === s; }); var k = 0; for (var a = 1; a <= 6; a++) { var c = s - a; if (c >= 1 && c <= 6) k++; } pS.textContent = '點數和是 ' + s; pK.textContent = '有 ' + k + ' 格'; pP.textContent = '機率 ' + k + '/36' + (frac(k) !== k + '/36' ? ' ＝ ' + frac(k) : ''); return k; }
      var sn = P.stepper('點數和是', 2, 12, 7, function (v) {
        if (gate.on) { sn.set(7, true); P.toast('先做上面的預測'); return; } s = v; var k = draw(); seen[v] = k;
        if (seen[2] && seen[7] && seen[12] && !done) { done = true; P.track('aha', { id: 'dice-grid', step: 1 }); P.toast(api.ctx.p1 === 1 ? '你猜對了！和是 7 最多' : '和是 7 的格子最多'); st.append(P.ruleBox('兩顆骰子共有 <b>6 × 6 ＝ 36 格</b>，每一格的機會一樣。<br>和是 7 有 <b>6 格</b>，和是 2 或 12 只有 <b>1 格</b>。<br><b>機率 ＝ 想要的格子數 ÷ 36</b>。', '樣本空間')); api.unlock('機率就是格子數 ÷ 36'); }
      });
      st.append(h('div', { class: 'pl-steprow' }, sn.el));
      api.solve(function () { gate.on = false; [2, 7, 12].forEach(function (v) { s = v; sn.set(v, true); seen[v] = draw(); }); });
      draw(); st.append(P.hint('藍色的格子就是「兩顆點數加起來剛好是這個和」的所有可能。至少看過和是 2、7、12。')); api.lock('先做上面的預測');
    },
    /* 2. 塗出指定機率 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var goals = [{ n: 9, t: '1/4' }, { n: 6, t: '1/6' }, { n: 18, t: '1/2' }];
      function goalTask(gl) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '點選（或用滑鼠拖過）格子塗色，塗出一個<b>機率剛好是 ' + gl.t + '</b> 的事件。塗哪些格子都可以。' }));
          var b = PA.board(b0, 11, 10), fin = false, pN = P.pill('', 'is-pink'), pP = P.pill('', 'is-amber');
          var grid = makeGrid(b, { paint: true, onChange: function () { var n = grid.count(); pN.textContent = '塗了 ' + n + ' 格'; pP.textContent = '機率 ' + n + '/36 ＝ ' + frac(n); var ok = n === gl.n; pP.className = 'pl-pill' + (ok ? ' is-ok' : ' is-amber'); if (ok && !fin) { fin = true; P.toast(n + '/36 ＝ ' + gl.t); done(); } } });
          b0.append(h('div', { class: 'pl-readout' }, pN, pP)); PA.resetBtn(b0, '全部清除', function () { if (!fin) grid.clear(); });
          setSolve(function () { var k = 0; grid.fill(function (a, c) { return (c - 1) * 6 + a <= gl.n; }); }); grid.clear(); b0.append(P.hint('機率 ＝ 塗色的格子數 ÷ 36。'));
        };
      }
      P.taskSeq(box, api, goals.map(goalTask), { lock: '完成 3 個目標', onDone: function () { P.track('aha', { id: 'dice-grid', step: 2 }); st.append(P.ruleBox('你塗幾格，機率就是「幾 ÷ 36」，再約分：<b>9 格 ＝ 1/4、6 格 ＝ 1/6、18 格 ＝ 1/2</b>。<br>機率最大是 36/36 ＝ 1（一定發生），最小是 0（不可能）。', '機率')); api.unlock('塗幾格，機率就是幾 ÷ 36'); } });
    },
    /* 3. 操作關卡：塗出事件 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var evs = [
        { t: '甲骰的點數<b>比乙骰大</b>', f: function (a, c) { return a > c; } },
        { t: '兩顆骰子的點數<b>一樣</b>', f: function (a, c) { return a === c; } },
        { t: '<b>至少有一顆</b>是 6 點', f: function (a, c) { return a === 6 || c === 6; } },
        { t: '兩顆點數<b>相乘是奇數</b>', f: function (a, c) { return (a * c) % 2 === 1; } }];
      function evTask(ev) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '塗出所有符合的格子：' + ev.t + '。' }));
          var b = PA.board(b0, 11, 10), fin = false, pN = P.pill('', 'is-pink'), pM = P.pill('', 'is-amber');
          function want(a, c) { return ev.f(a, c); }
          var grid = makeGrid(b, { paint: true, onChange: function () {
            var n = grid.count(), extra = 0, miss = 0; for (var c = 1; c <= 6; c++) for (var a = 1; a <= 6; a++) { var on = !!grid.on[a + ',' + c], w = want(a, c); if (on && !w) extra++; if (!on && w) miss++; }
            pN.textContent = '塗了 ' + n + ' 格 → ' + n + '/36'; var ok = !extra && !miss; pM.className = 'pl-pill' + (ok ? ' is-ok' : ' is-amber'); pM.textContent = ok ? '✓ 機率 ' + frac(n) : (extra ? '有 ' + extra + ' 格塗錯了' : '還少塗了一些');
            if (ok && !fin) { fin = true; P.toast('機率 ＝ ' + n + '/36 ＝ ' + frac(n)); done(); } } });
          b0.append(h('div', { class: 'pl-readout' }, pN, pM)); PA.resetBtn(b0, '全部清除', function () { if (!fin) grid.clear(); });
          setSolve(function () { grid.fill(want); }); grid.clear(); b0.append(P.hint('一格一格想：這一格的甲、乙兩個點數符合嗎？'));
        };
      }
      P.taskSeq(box, api, evs.map(evTask), { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'dice-grid' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'dice-grid', moduleName: '兩顆骰子：36 格看機率', askAbout: '機率與計數（樣本空間、古典機率）', aha: '先把所有可能排成 36 格，<br>機率就是「想要的格子」÷「全部格子」。',
        cards: [{ text: '古典機率 ＝ 想要的結果數 ÷ 所有可能的結果數（每個結果機會一樣）', src: '國中「機率」（古典機率）' }, { text: '兩顆骰子有 36 種結果；點數和 7 最多（6 種）、2 與 12 最少（各 1 種）', src: '機率的基本例子' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '排列組合算機率<br>AMC 機率題' }, { at: 0.88, label: '條件機率<br>期望值' }] },
        teasers: [
          { title: '兩個人各丟兩顆骰子', q: '甲、乙各丟兩顆骰子，甲的點數和比乙的點數和大的機率是多少？表格變成 11 種和，怎麼算才不會漏？', where: 'A8prep 2411 第 3 堂：機率（例題 2）', lv: 'L2' },
          { title: '抽牌的機率', q: '從 52 張撲克牌抽 5 張，5 張都是紅心的機率是多少？格子畫不出來時，改用組合數怎麼數？', where: 'A8prep 2411 第 3 堂；PK3C 2507 第 21、22 堂：機率論', lv: 'L2' },
          { title: '條件機率', q: '已知兩顆骰子點數和是 7，其中一顆是 3 的機率是多少？格子會縮小成哪些？', where: 'S112 2601 第 10、11 堂：條件機率', lv: 'L3' }],
        parent: { pitfall: '孩子常以為「和是 2～12 一共 11 種，所以機率一樣」，忽略每個和對應的格子數不同。也常把「機率」寫成「可能的結果有幾種」，忘記要除以全部結果數。', place: '國中機率的核心：先列出所有可能（樣本空間），再數想要的。之後的條件機率、期望值都從這裡長出來。', ask: ['兩顆骰子點數和是 7 的機會為什麼比 2 大？', '「甲比乙大」和「乙比甲大」機率一樣嗎？「一樣」又是多少？', '36 格裡，至少有一顆 6 點的有幾格？為什麼不是 12 格？'] },
        classes: ['A8prep（2411 第 3 堂）：機率', 'PK3C（2507 第 21、22 堂）：機率論（一）（二）', 'J91A（2507 第 22–25 堂）：機率'], next: { href: 'play-one-stroke.html', text: '下一個：一筆畫與奇點' } });
    }];
  new P.Lesson({ id: 'dice-grid', title: '兩顆骰子：36 格看機率', steps: steps });
})();
