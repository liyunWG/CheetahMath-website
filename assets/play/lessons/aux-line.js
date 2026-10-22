/* 獵豹玩中學｜畫輔助線：畫一條線，條件就串起來
   四種最基本的輔助線：作平行線（豬腳）→ 拖動 P 驗證 → 作垂線（作高，畫直角符號）→ 延長線（外角）→ 3 個操作關卡（另一個豬腳、鈍角三角形的高、連接對角線）。 */
(function () {
  var P = Play, h = P.h, G = PlayGeo, rad = G.rad;
  function stage(st, sm) { var w = h('div', { class: 'pl-stage' + (sm ? ' pl-stage--sm' : '') }); st.append(w); return w; }
  function clip(p, d) { var t0 = -1e9, t1 = 1e9; [[0, 12, 0], [0, 10, 1]].forEach(function (r) { var i = r[2]; if (Math.abs(d[i]) < 1e-9) return; var a = (r[0] - p[i]) / d[i], b = (r[1] - p[i]) / d[i]; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); }); return [[p[0] + d[0] * t0, p[1] + d[1] * t0], [p[0] + d[0] * t1, p[1] + d[1] * t1]]; }
  /* 取整數且加總剛好等於 total（最大餘數法） */
  function roundSum(vals, total) { var fl = vals.map(Math.floor), rest = total - fl.reduce(function (a, b) { return a + b; }, 0), order = vals.map(function (v, i) { return [v - Math.floor(v), i]; }).sort(function (a, b) { return b[0] - a[0]; }), k; for (k = 0; k < rest; k++) fl[order[k][1]]++; return fl; }
  /* 頂點 V 上、從 X 方向到 Y 方向的角：畫扇形（剛好 90° 自動畫直角符號）並標出度數 txt */
  function corner(board, g, V, X, Y, r, txt, cls, tcls) {
    var d1 = G.dirTo(V, X), d = G.shortest(d1, G.dirTo(V, Y)), w = G.wedge(V, d1, d1 + d, r, d), el = board.poly(w.pts, 'pl-poly ' + (cls || ''), g), tp = G.polar(V, r + 0.95, w.bis);
    board.text([tp[0], tp[1] - 0.2], txt, 'pl-text pl-text--sm ' + (tcls || ''), g); return w;
  }
  function dot(board, g, p, name, dx, dy) { board.dot(p, 'pl-dot', g, 0.17); if (name) board.text([p[0] + (dx || 0.35), p[1] + (dy || 0.55)], name, 'pl-text', g); }
  function seg(board, g, a, b, cls) { board.line(a, b, cls || 'pl-line pl-line--bold', g); }

  /* 豬腳圖：上下兩條平行線（y＝8、y＝2），P 在中間，A、C 在 P 的左邊 */
  function pigBase(board, g, p, A, C) {
    seg(board, g, [0, 8], [12, 8], 'pl-line'); seg(board, g, [0, 2], [12, 2], 'pl-line');
    board.text([11.5, 8.45], 'B', 'pl-text', g); board.text([11.5, 1.45], 'D', 'pl-text', g);
    seg(board, g, A, p); seg(board, g, C, p); dot(board, g, A, 'A', -0.2, 0.55); dot(board, g, C, 'C', -0.2, -1.0); dot(board, g, p, 'P', 0.6, 0.45);
  }
  /* 在 P 畫出兩個「內錯角」，回傳 [∠(PA 與水平線), ∠(PC 與水平線)] 的度數 */
  function pigMarks(board, g, p, A, C, l1, l2) {
    var up = [p[0] - 1, p[1]];
    corner(board, g, p, up, A, 1.3, l1 + '°', 'pl-poly--blue', 'pl-text--blue'); corner(board, g, p, up, C, 1.75, l2 + '°', 'pl-poly--pink', 'pl-text--pink');
  }

  var steps = [
    /* 1. 預測＋作平行線 */
    function (st, api) {
      var gate = { on: true }, done = false, p = [6, 5], a1 = 35, a2 = 50, A = [6 - 3 / Math.tan(a1 * rad), 8], C = [6 - 3 / Math.tan(a2 * rad), 2], E = [9, 6];
      P.choice(st, api, { id: 'al-p1', predict: true, label: '先猜猜看', prompt: '已知 <b>AB ∥ CD</b>，∠A ＝ <b>35°</b>，∠C ＝ <b>50°</b>。中間折起來的 <b>∠APC</b> 是多少？', row: true, options: [{ t: '85°' }, { t: '15°' }, { t: '95°' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('畫一條過 P、平行 AB 的輔助線'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'); board.gMid.append(g);
      var pk = P.pill('', 'is-amber'), pr = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pk), h('div', { class: 'pl-readout' }, pr));
      function draw() {
        g.innerHTML = ''; pigBase(board, g, p, A, C);
        corner(board, g, A, [A[0] + 1, A[1]], p, 1.3, a1 + '°', 'pl-poly--blue', 'pl-text--blue'); corner(board, g, C, [C[0] + 1, C[1]], p, 1.3, a2 + '°', 'pl-poly--pink', 'pl-text--pink');
        var par = E[1] === p[1] && E[0] !== p[0], d = [E[0] - p[0], E[1] - p[1]], c = clip(p, d);
        board.line(c[0], c[1], 'pl-line pl-line--bold pl-line--green' + (par ? '' : ' pl-line--dash'), g);
        if (par) pigMarks(board, g, p, A, C, a1, a2);
        pr.className = 'pl-pill' + (par ? ' is-ok' : ''); pr.textContent = par ? '✓ 輔助線 ∥ AB ∥ CD' : '輔助線還沒和 AB 平行';
        pk.textContent = par ? '∠APC ＝ ' + a1 + '° ＋ ' + a2 + '° ＝ ' + (a1 + a2) + '°' : '∠APC ＝ ？';
        if (par && !done && !gate.on) { done = true; P.track('aha', { id: 'aux-line', step: 1 }); P.toast(api.ctx.p1 === 0 ? '你猜對了！85°' : '∠APC ＝ 85°'); st.append(P.ruleBox('過 P 畫一條<b>平行於 AB 的輔助線</b>，上、下兩個「內錯角」立刻現形：<br>∠APC ＝ 35° ＋ 50° ＝ <b>85°</b>。<br>兩條平行線中間有折點，就<b>過折點作平行線</b>。', '作平行線')); api.unlock('作平行線，內錯角現形'); }
      }
      var hd = board.handle({ pos: E, cls: 'is-pink', valid: function (t) { return !(t[0] === p[0] && t[1] === p[1]); }, disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; }, onMove: function (t) { E = t; draw(); } });
      api.solve(function () { gate.on = false; hd.moveTo([10, 5]); }); draw(); st.append(P.hint('拖動粉紅色的點：輔助線要和上、下兩條線<b>同一個方向</b>。')); api.lock('先做上面的預測');
    },
    /* 2. 拖動 P：∠APC ＝ ∠A ＋ ∠C */
    function (st, api) {
      st.append(P.instr('輔助線已經畫好了。拖動 <b>P</b> 到不同位置，看看 <b>∠APC</b> 和 <b>∠A、∠C</b> 的關係。'));
      var p = [7, 5], A = [2, 8], C = [3, 2], moves = {}, nm = 0, done = false, host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'); board.gMid.append(g);
      var pa = P.pill('', 'is-blue'), pc = P.pill('', 'is-pink'), pp = P.pill('', 'is-ok'); st.append(h('div', { class: 'pl-readout' }, pa, pc), h('div', { class: 'pl-readout' }, pp));
      function draw() {
        g.innerHTML = ''; pigBase(board, g, p, A, C); var x = G.angAt(A, [A[0] + 1, A[1]], p), y = G.angAt(C, [C[0] + 1, C[1]], p), tot = Math.round(x + y), r = roundSum([x, y], tot);
        corner(board, g, A, [A[0] + 1, A[1]], p, 1.3, r[0] + '°', 'pl-poly--blue', 'pl-text--blue'); corner(board, g, C, [C[0] + 1, C[1]], p, 1.3, r[1] + '°', 'pl-poly--pink', 'pl-text--pink');
        board.line([0, p[1]], [12, p[1]], 'pl-line pl-line--bold pl-line--green', g); pigMarks(board, g, p, A, C, r[0], r[1]);
        pa.textContent = '∠A ＝ ' + r[0] + '°'; pc.textContent = '∠C ＝ ' + r[1] + '°'; pp.textContent = '∠APC ＝ ' + r[0] + '° ＋ ' + r[1] + '° ＝ ' + tot + '°';
      }
      var hd = board.handle({ pos: p, valid: function (t) { return t[0] >= 5 && t[0] <= 10 && t[1] >= 3 && t[1] <= 7; }, onMove: function (t) { p = t; draw(); var k = t.join(','); if (!moves[k]) { moves[k] = 1; nm++; } if (nm >= 6 && !done) { done = true; P.track('aha', { id: 'aux-line', step: 2 }); st.append(P.ruleBox('不管 P 在哪裡，過 P 作平行線之後都是：<br><b>∠APC ＝ ∠A ＋ ∠C</b>（豬腳）。<br>這個「作平行線 → 內錯角」的做法，是平行線題最常用的輔助線。', '豬腳')); P.toast('∠APC ＝ ∠A ＋ ∠C'); api.unlock('豬腳：∠P ＝ ∠A ＋ ∠C'); } } });
      api.solve(function () { [[5, 3], [9, 7], [6, 6], [10, 4], [8, 3], [5, 7]].forEach(hd.moveTo); }); draw(); st.append(P.hint('至少拖 6 個位置。P 要在兩條平行線中間、在 A、C 的右邊。')); api.lock('拖動 P 6 次');
    },
    /* 3. 作垂線（作高） */
    function (st, api) {
      st.append(P.instr('要用「底 × 高」或畢氏定理，常常要<b>作高</b>：從 <b>A</b> 向 <b>BC</b> 作垂線。拖動 <b>H</b>，找到 <b>AH ⟂ BC</b> 的位置。'));
      var B = [2, 2], C = [11, 2], A = [5, 8], H = [8, 2], seen = {}, done = false, host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'); board.gMid.append(g);
      var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), pk = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, p1, p2), h('div', { class: 'pl-readout' }, pk));
      function draw() {
        g.innerHTML = ''; var a = G.angAt(H, A, B), r = roundSum([a, 180 - a], 180), ok = H[0] === A[0];
        board.poly([B, C, A], 'pl-poly pl-poly--amber', g); seg(board, g, B, C, 'pl-line'); seg(board, g, A, H, 'pl-line pl-line--bold pl-line--green' + (ok ? '' : ' pl-line--dash'));
        dot(board, g, B, 'B', -0.5, -0.9); dot(board, g, C, 'C', 0.2, -0.9); dot(board, g, A, 'A', 0.3, 0.45);
        corner(board, g, H, A, B, 1.2, r[0] + '°', 'pl-poly--blue', 'pl-text--blue'); corner(board, g, H, A, C, 1.2, r[1] + '°', 'pl-poly--pink', 'pl-text--pink');
        p1.textContent = '∠AHB ＝ ' + r[0] + '°'; p2.textContent = '∠AHC ＝ ' + r[1] + '°'; pk.className = 'pl-pill' + (ok ? ' is-ok' : ''); pk.textContent = ok ? '✓ AH ⟂ BC：AH 是 BC 上的高' : '還不是垂直，繼續拖動 H';
        return ok;
      }
      var hd = board.handle({ pos: H, candidates: [3, 4, 5, 6, 7, 8, 9, 10].map(function (x) { return [x, 2]; }), onMove: function (t) { H = t; seen[t[0]] = 1; if (draw() && !done) { done = true; P.track('aha', { id: 'aux-line', step: 3 }); P.toast('AH ⟂ BC，兩個角都是 90°'); st.append(P.ruleBox('從頂點作<b>垂直</b>於對邊的線（<b>作高</b>），三角形被切成<b>兩個直角三角形</b>（直角用「⌐」小方框表示）。<br>有了直角，就能用<b>畢氏定理</b>、<b>面積 ＝ 底 × 高 ÷ 2</b>。<br>這裡：BC ＝ 9，高 AH ＝ 6，面積 ＝ 9 × 6 ÷ 2 ＝ <b>27</b>。', '作垂線')); api.unlock('作高：垂直符號'); } } });
      api.solve(function () { hd.moveTo([6, 2]); hd.moveTo([5, 2]); }); draw(); st.append(P.hint('兩個角加起來是 180°。找到兩個角一樣大的位置。')); api.lock('找到垂直的位置');
    },
    /* 4. 延長線與外角 */
    function (st, api) {
      st.append(P.instr('把三角形的一邊 <b>BC 往外延長</b>到 D。拖動 <b>D</b>，看看新出現的<b>外角</b>和三角形的內角有什麼關係。'));
      var B = [2, 2], C = [8, 2], A = [5, 7], D = [10, 2], seen = {}, done = false, host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'); board.gMid.append(g);
      var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pe = P.pill('', 'is-ok'); st.append(h('div', { class: 'pl-readout' }, pa, pb), h('div', { class: 'pl-readout' }, pe));
      function draw() {
        g.innerHTML = ''; var x = G.angAt(A, B, C), y = G.angAt(B, A, C), tot = Math.round(x + y), r = roundSum([x, y], tot);
        board.poly([A, B, C], 'pl-poly pl-poly--amber', g); seg(board, g, A, B, 'pl-line'); seg(board, g, A, C, 'pl-line'); seg(board, g, B, C, 'pl-line'); seg(board, g, C, D, 'pl-line pl-line--bold pl-line--green pl-line--dash');
        dot(board, g, A, 'A', 0.3, 0.45); dot(board, g, B, 'B', -0.5, -0.9); dot(board, g, C, 'C', -0.4, -0.9); dot(board, g, D, 'D', 0, -1.4);
        corner(board, g, A, B, C, 1.2, r[0] + '°', 'pl-poly--blue', 'pl-text--blue'); corner(board, g, B, C, A, 1.5, r[1] + '°', 'pl-poly--pink', 'pl-text--pink'); corner(board, g, C, D, A, 1.4, tot + '°', 'pl-poly--green', 'pl-text--green');
        pa.textContent = '∠A ＝ ' + r[0] + '°'; pb.textContent = '∠B ＝ ' + r[1] + '°'; pe.textContent = '外角 ∠ACD ＝ ' + r[0] + '° ＋ ' + r[1] + '° ＝ ' + tot + '°';
      }
      var hd = board.handle({ pos: D, candidates: [9, 10, 11].map(function (x) { return [x, 2]; }), onMove: function (t) { D = t; seen[t[0]] = 1; draw(); if (Object.keys(seen).length >= 2 && !done) { done = true; P.track('aha', { id: 'aux-line', step: 4 }); st.append(P.ruleBox('<b>延長一邊</b>，就多出一個<b>外角</b>。外角 ＝ 和它<b>不相鄰的兩個內角的和</b>：<br>∠ACD ＝ ∠A ＋ ∠B。<br>原因：∠ACB ＋ ∠ACD ＝ 180°，三角形內角和 ∠A ＋ ∠B ＋ ∠ACB ＝ 180°。', '延長線')); api.unlock('延長一邊，外角現形'); } } });
      api.solve(function () { hd.moveTo([9, 2]); hd.moveTo([11, 2]); }); draw(); st.append(P.hint('至少把 D 放在 2 個不同的位置。')); api.lock('把 D 拖到 2 個位置');
    },
    /* 5. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：另一個豬腳：作平行線 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '已知 AB ∥ CD，∠A ＝ <b>28°</b>，∠C ＝ <b>47°</b>。畫出<b>過 P 的平行輔助線</b>，讓 ∠APC 現形。' }));
          var p = [8, 5], a1 = 28, a2 = 47, A = [8 - 3 / Math.tan(a1 * rad), 8], C = [8 - 3 / Math.tan(a2 * rad), 2], E = [10, 7], fin = false, host = stage(b0, true), board = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), g = h('g'); board.gMid.append(g);
          var pk = P.pill('', 'is-amber'), pr = P.pill('', ''); b0.append(h('div', { class: 'pl-readout' }, pk, pr));
          function draw() { g.innerHTML = ''; pigBase(board, g, p, A, C); corner(board, g, A, [A[0] + 1, A[1]], p, 1.2, a1 + '°', 'pl-poly--blue', 'pl-text--blue'); corner(board, g, C, [C[0] + 1, C[1]], p, 1.2, a2 + '°', 'pl-poly--pink', 'pl-text--pink');
            var par = E[1] === p[1] && E[0] !== p[0], c = clip(p, [E[0] - p[0], E[1] - p[1]]); board.line(c[0], c[1], 'pl-line pl-line--bold pl-line--green' + (par ? '' : ' pl-line--dash'), g); if (par) pigMarks(board, g, p, A, C, a1, a2);
            pr.className = 'pl-pill' + (par ? ' is-ok' : ''); pr.textContent = par ? '✓ 平行' : '還沒平行'; pk.textContent = par ? '∠APC ＝ ' + a1 + '° ＋ ' + a2 + '° ＝ ' + (a1 + a2) + '°' : '∠APC ＝ ？'; if (par && !fin) { fin = true; P.toast('∠APC ＝ 28° ＋ 47° ＝ 75°'); done(); } }
          var hd = board.handle({ pos: E, cls: 'is-pink', valid: function (t) { return !(t[0] === p[0] && t[1] === p[1]); }, onMove: function (t) { E = t; draw(); } });
          setSolve(function () { hd.moveTo([4, 5]); }); draw(); b0.append(P.hint('輔助線要和 AB 同一個方向。'));
        },
        /* 關 2：鈍角三角形的高：先延長、再作垂線 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '這個三角形在 B 是鈍角。作 <b>BC 邊上的高</b>：高的腳 H 會落在 BC 的<b>延長線</b>上。拖動 H，找到 <b>AH ⟂ 直線 BC</b>。' }));
          var B = [4, 2], C = [7, 2], A = [2, 7], H = [0, 2], fin = false, host = stage(b0, true), board = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), g = h('g'); board.gMid.append(g);
          var pk = P.pill('', ''), pa = P.pill('', 'is-blue'); b0.append(h('div', { class: 'pl-readout' }, pa, pk));
          function draw() {
            g.innerHTML = ''; var out = H[0] < B[0] || H[0] > C[0], ok = H[0] === A[0];
            board.poly([A, B, C], 'pl-poly pl-poly--amber', g); seg(board, g, B, C, 'pl-line'); if (out) seg(board, g, H[0] < B[0] ? H : C, H[0] < B[0] ? B : H, 'pl-line pl-line--bold pl-line--blue pl-line--dash');
            seg(board, g, A, B, 'pl-line'); seg(board, g, A, C, 'pl-line'); seg(board, g, A, H, 'pl-line pl-line--bold pl-line--green' + (ok ? '' : ' pl-line--dash'));
            dot(board, g, A, 'A', 0.3, 0.45); dot(board, g, B, 'B', 0.1, -0.9); dot(board, g, C, 'C', 0.2, -0.9);
            if (H[0] !== B[0] && H[0] !== C[0]) { var other = H[0] < B[0] ? C : (H[0] > C[0] ? B : C); var a = G.angAt(H, A, other); corner(board, g, H, A, other, 1.2, Math.round(a) + '°', 'pl-poly--blue', 'pl-text--blue'); pa.textContent = '∠AH' + (H[0] < B[0] ? 'C' : H[0] > C[0] ? 'B' : 'C') + ' ＝ ' + Math.round(a) + '°'; } else pa.textContent = 'H 和頂點重合了';
            pk.className = 'pl-pill' + (ok ? ' is-ok' : ''); pk.textContent = ok ? '✓ AH ⟂ BC（要先延長 BC）' : '還不是垂直'; if (ok && !fin) { fin = true; P.toast('鈍角三角形的高在外面：先延長 BC'); done(); }
          }
          var hd = board.handle({ pos: H, candidates: [0, 1, 2, 3, 5, 6, 8, 9, 10, 11].map(function (x) { return [x, 2]; }), onMove: function (t) { H = t; draw(); } });
          setSolve(function () { hd.moveTo([2, 2]); }); draw(); b0.append(P.hint('虛線是延長出來的 BC。高的腳要正對著 A 的下面。'));
        },
        /* 關 3：連接對角線 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '想知道<b>四邊形的內角和</b>，可以<b>連接一條對角線</b>，把它切成兩個三角形。點一個頂點，再點對面（不相鄰）的頂點。' }));
          var Q = { A: [2, 2], B: [9, 3], C: [10, 8], D: [3, 7] }, names = ['A', 'B', 'C', 'D'], sel = null, diag = null, fin = false, host = stage(b0, true), board = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), g = h('g'); board.gMid.append(g);
          var pk = P.pill('', 'is-amber'), p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'); b0.append(h('div', { class: 'pl-readout' }, pk), h('div', { class: 'pl-readout' }, p1, p2));
          function tri(a, b, c, cls, tcls) { var vs = [a, b, c].map(function (n) { return Q[n]; }), ang = [G.angAt(vs[0], vs[1], vs[2]), G.angAt(vs[1], vs[0], vs[2]), G.angAt(vs[2], vs[0], vs[1])], r = roundSum(ang, 180); board.poly(vs, 'pl-poly ' + cls, g); corner(board, g, vs[0], vs[1], vs[2], 0.9, r[0] + '°', cls, tcls); corner(board, g, vs[1], vs[0], vs[2], 0.9, r[1] + '°', cls, tcls); corner(board, g, vs[2], vs[0], vs[1], 0.9, r[2] + '°', cls, tcls); }
          function draw() {
            g.innerHTML = '';
            if (!diag) { var vs = names.map(function (n) { return Q[n]; }), ang = vs.map(function (v, i) { return G.angAt(v, vs[(i + 3) % 4], vs[(i + 1) % 4]); }), r = roundSum(ang, 360); board.poly(vs, 'pl-poly pl-poly--amber', g); vs.forEach(function (v, i) { corner(board, g, v, vs[(i + 3) % 4], vs[(i + 1) % 4], 0.9, r[i] + '°', 'pl-poly--blue', 'pl-text--blue'); }); pk.textContent = '四個內角：' + r.join('° ＋ ') + '°'; p1.textContent = '內角和 ＝ ？'; p2.textContent = ''; }
            else { var o = diag === 'AC' ? ['B', 'D'] : ['A', 'C']; tri(diag[0], diag[1], o[0], 'pl-poly--blue', 'pl-text--blue'); tri(diag[0], diag[1], o[1], 'pl-poly--pink', 'pl-text--pink'); seg(board, g, Q[diag[0]], Q[diag[1]], 'pl-line pl-line--bold pl-line--green pl-line--dash'); pk.textContent = '連接 ' + diag + '，切成兩個三角形'; p1.textContent = '三角形內角和 ＝ 180°'; p2.textContent = '兩個合起來 ＝ 360°'; }
            names.forEach(function (n) { var v = Q[n], c = h('g', { style: 'cursor:pointer' }, h('circle', { cx: v[0], cy: board.Y(v[1]), r: 0.55, fill: 'transparent' }), h('circle', { cx: v[0], cy: board.Y(v[1]), r: 0.22, class: 'pl-dot' + (sel === n ? ' pl-dot--green' : '') })); c.addEventListener('click', function () { tap(n); }); g.append(c); board.text([v[0] + (n === 'A' || n === 'D' ? -0.6 : 0.6), v[1] + (n === 'A' || n === 'B' ? -1.0 : 0.5)], n, 'pl-text', g); });
          }
          function tap(n) { if (diag) return; if (!sel) { sel = n; draw(); return; } if (sel === n) { sel = null; draw(); return; } var pair = [sel, n].sort().join(''); if (pair !== 'AC' && pair !== 'BD') { P.toast('要連接不相鄰的兩個頂點（對角線）'); sel = null; draw(); return; } diag = pair; sel = null; draw(); if (!fin) { fin = true; P.toast('兩個三角形：180° ＋ 180° ＝ 360°'); done(); } }
          PA_reset(b0, function () { if (!fin) { diag = null; sel = null; draw(); } else { diag = null; sel = null; draw(); } });
          setSolve(function () { tap('A'); tap('C'); }); draw(); b0.append(P.hint('連好之後可以按「重來」，試試另一條對角線，結果一樣。'));
        }];
      function PA_reset(host, fn) { var b = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '重來'); b.addEventListener('click', fn); host.append(h('div', { class: 'pl-row pl-row--center' }, b)); }
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'aux-line' }); } });
    },
    /* 6. 完成 */
    function (st) {
      P.complete(st, {
        id: 'aux-line', moduleName: '畫輔助線：畫一條線，條件就串起來', askAbout: '平面幾何的輔助線（作平行線、作垂線、延長線、連接兩點）', aha: '題目的條件沒串起來時，<br>畫一條輔助線，角度和邊就現形了。',
        cards: [{ text: '作平行線：兩條平行線中間的折線，過折點作平行線，內錯角相等；豬腳 ∠APC ＝ ∠A ＋ ∠C', src: '國中「平行線與角度」' }, { text: '作垂線（高）：切出直角三角形，用畢氏定理與面積公式；延長一邊：外角 ＝ 兩個不相鄰內角的和；連接對角線：四邊形內角和 ＝ 360°', src: '國中「三角形的基本性質」' }],
        depth: { here: 0.2, cheetah: [{ at: 0.48, label: '平面閉折線<br>補形與旋轉' }, { at: 0.88, label: '幾何證明的<br>輔助線策略' }] },
        teasers: [
          { title: '平面閉折線：鋸齒與星形', q: '一個折點、兩個折點、好多個折點的折線，角度和怎麼一次算出來？每一個折點都要畫輔助線嗎？', where: 'J82A 2601 第 6、8、10–12 堂：平面閉折線', lv: 'L2' },
          { title: '幾何小花：旋轉與補形', q: '把一個三角形旋轉、補成平行四邊形，分散的線段就接在一起了。什麼題目適合這招？', where: 'J82A 2601 第 23 堂：幾何小花', lv: 'L2' },
          { title: '角度追蹤', q: '圖上一個角都沒給，只有幾條平行線和等腰三角形，怎麼一步一步追到答案？', where: 'PK2A 2507 第 7、11 堂：角度問題（五）（六）；PI1A 2507 第 17、18 堂', lv: 'L2' },
          { title: '作高與勾股定理', q: '斜邊上的高、鈍角三角形的高，怎麼和畢氏定理、面積合在一起用？', where: 'J81A 2507 第 13–18 堂：CH2 勾股定理', lv: 'L2' }],
        parent: { pitfall: '孩子遇到平行線的折線題常常「看著圖發呆」，不知道從哪裡下手；常見的錯是把兩個角直接相加或相減。輔助線要畫在「折點」上，並和已知的平行線同方向。', place: '國中平行線、三角形的角度與面積題的基本功，也是之後所有幾何證明的起點。', ask: ['這張圖看起來少了什麼？要畫哪一條線？', '為什麼輔助線要過折點、而且要平行？', '鈍角三角形的高，為什麼會跑到三角形外面？'] },
        classes: ['J82A（2601 第 6、8、10–12 堂）：平面閉折線', 'J82A（2601 第 23 堂）：幾何小花', 'PK2A（2507 第 7、11 堂）：角度問題（五）（六）', 'J81A（2507 第 13–18 堂）：CH2 勾股定理'], next: { href: 'play-line-intersect.html', text: '下一個：兩條直線的交點' } });
    }];
  new P.Lesson({ id: 'aux-line', title: '畫輔助線：畫一條線，條件就串起來', steps: steps });
})();
