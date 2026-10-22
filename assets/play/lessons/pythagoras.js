/* 獵豹玩中學｜畢氏定理：重排四個直角三角形
   兩條直角邊 a、b，斜邊 c。大正方形邊長 a+b：
     擺法 A：b×b 與 a×a 兩個正方形＋四個三角形　　擺法 B：斜放的 c×c 正方形＋四個三角形（三個三角形只是平移）。
   a＝水平短邊、b＝垂直短邊。 */
(function () {
  var P = Play, h = P.h;
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function fmt(n) { return String(Math.round(n * 100) / 100); }

  /* 擺法 A 的四個三角形，以及搬到擺法 B 要平移的向量 */
  function layout(a, b) {
    var S = a + b;
    return {
      S: S,
      tri: [[[b, 0], [S, 0], [S, b]], [[b, 0], [b, b], [S, b]], [[0, b], [b, b], [0, S]], [[b, b], [b, S], [0, S]]],
      mv: [[0, 0], [-b, a], [0, -b], [a, 0]],
      sqB: [[0, 0], [b, 0], [b, b], [0, b]], sqA: [[b, b], [S, b], [S, S], [b, S]], sqC: [[b, 0], [S, b], [a, S], [0, a]]
    };
  }
  function shift(poly, v, t) { return poly.map(function (p) { return [p[0] + v[0] * t, p[1] + v[1] * t]; }); }

  /* 畫出可以用 t（0＝擺法 A，1＝擺法 B）控制的整張圖；回傳 draw(t) */
  function figure(board, a, b, o) {
    o = o || {}; var L = layout(a, b), S = L.S;
    board.poly([[0, 0], [S, 0], [S, S], [0, S]], 'pl-poly pl-poly--ghost');
    var sa = board.poly(L.sqA, 'pl-poly'), sb = board.poly(L.sqB, 'pl-poly pl-poly--pink'), sc = board.poly(L.sqC, 'pl-poly pl-poly--green');
    var tris = L.tri.map(function (t) { return board.poly(t, 'pl-poly pl-poly--amber'); });
    var ta = board.text([b + a / 2, b + a / 2 - 0.2], 'a²', 'pl-text pl-text--blue pl-text--lg'), tb = board.text([b / 2, b / 2 - 0.2], 'b²', 'pl-text pl-text--pink pl-text--lg'), tc = board.text([S / 2, S / 2 - 0.2], 'c²', 'pl-text pl-text--green pl-text--lg');
    if (o.nums) { ta.textContent = 'a² = ' + a * a; tb.textContent = 'b² = ' + b * b; tc.textContent = 'c² = ' + (a * a + b * b); }
    board.text([b + a / 2, -0.45], 'a', 'pl-text pl-text--blue'); board.text([S + 0.45, b / 2 + 0.1], 'b', 'pl-text pl-text--pink');    function draw(t) {
      tris.forEach(function (el, i) { board.setPoly(el, shift(L.tri[i], L.mv[i], t)); });
      var oa = Math.max(0, 1 - t * 2.2), oc = Math.max(0, t * 2.2 - 1.2);
      [sa, sb, ta, tb].forEach(function (el) { el.style.opacity = oa; }); [sc, tc].forEach(function (el) { el.style.opacity = Math.min(1, oc); });
    }
    return draw;
  }

  function sliderBar(st, onv) {
    var sl = P.slider(0, 100, 0, onv);
    st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 擺法 A'), h('span', {}, '擺法 B →')));
    return sl;
  }

  var steps = [
    /* 1. 預測＋搬三角形 */
    function (st, api) {
      var gate = { on: true }, a = 3, b = 4, done = false;
      P.choice(st, api, { id: 'py-p1', predict: true, label: '先猜猜看', prompt: '兩種擺法，<b>四個三角形</b>都一樣，大正方形也一樣大。<b>空白的面積</b>會…？', row: true, options: [{ t: '擺法 A 較大' }, { t: '擺法 B 較大' }, { t: '一樣大' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉滑桿，把三個三角形搬一搬'); } });
      var host = stage(st), board = new P.Board(host, { w: 7, h: 7 }), draw = figure(board, a, b), pill = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pill);
      function upd(t) {
        draw(t);
        pill.textContent = t < 0.03 ? '空白：a² ＋ b² ＝ 9 ＋ 16 ＝ 25' : t > 0.97 ? '空白：c² ＝ 25' : '搬動中：三角形面積不變';
        if (t > 0.97 && !done) { done = true; P.track('aha', { id: 'pythagoras', step: 1 }); P.toast(api.ctx.p1 === 2 ? '你猜對了！' : '空白面積真的沒變'); st.append(P.ruleBox('四個三角形搬來搬去，<b>空白部分的面積不變</b>。<br>所以 <b>a² ＋ b² ＝ c²</b>：兩條直角邊的平方和＝斜邊的平方。', '畢氏定理')); api.unlock('發現畢氏定理了！'); }
      }
      var sl = sliderBar(st, function (v) { if (gate.on) { sl.value = 0; P.toast('先做上面的預測'); return; } upd(v / 100); });
      api.solve(function () { gate.on = false; sl.value = 100; upd(1); });
      upd(0); st.append(ro, P.hint('這個三角形的兩條直角邊是 a＝3、b＝4。三個三角形只是「平移」，沒有轉動也沒有變形。'));
      api.lock('先做上面的預測');
    },
    /* 2. 自己動手搬四個三角形，再用方格正方形量出 c */
    function (st, api) {
      st.append(P.instr('換你動手！把<b>四個三角形</b>拖到大正方形的<b>四個角落</b>（只能平移，不能轉）。看看中間空出什麼。'));
      var a = 3, b = 4, L = layout(a, b), S = L.S, host = stage(st), board = new P.Board(host, { w: S, h: S }), solved = false;
      board.poly([[0, 0], [S, 0], [S, S], [0, S]], 'pl-poly pl-poly--ghost');
      var sa = board.poly(L.sqA, 'pl-poly'), sb = board.poly(L.sqB, 'pl-poly pl-poly--pink'), sc = board.poly(L.sqC, 'pl-poly pl-poly--green'), tc = board.text([S / 2, S / 2 - 0.2], 'c²', 'pl-text pl-text--green pl-text--lg');
      sc.style.opacity = 0; tc.style.opacity = 0;
      var sq = board.poly([[0, 0], [0, 0], [0, 0], [0, 0]], 'pl-poly pl-poly--pink'); sq.style.opacity = 0; sq.style.strokeDasharray = '7 5'; sq.style.pointerEvents = 'none';
      var off = [[0, 0], [0, 0], [0, 0], [0, 0]], base = [[0, 0], [0, 0], [0, 0], [0, 0]], tris = L.tri.map(function (t) { var el = board.poly(t, 'pl-poly pl-poly--amber'); el.style.cursor = 'grab'; return el; });
      var pc = P.pill('就位 0 / 4', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pc), calc = h('div', { class: 'pl-readout' }), box2 = h('div', {}), pn = P.pill('', ''), pt = P.pill('', ''); st.append(ro, calc, box2);
      function place(i) { board.setPoly(tris[i], shift(L.tri[i], off[i], 1)); }
      function ok(i) { return off[i][0] === L.mv[i][0] && off[i][1] === L.mv[i][1]; }
      function check() {
        var k = 0; tris.forEach(function (el, i) { var g = ok(i); el.style.stroke = g ? '#1f9d55' : ''; if (g) k++; });
        pc.textContent = '就位 ' + k + ' / 4'; pc.className = 'pl-pill' + (k === 4 ? ' is-ok' : ' is-amber');
        if (k === 4 && !solved) { solved = true; sa.style.opacity = 0; sb.style.opacity = 0; sc.style.opacity = 1; tc.style.opacity = 1; P.toast('中間空出一個斜斜的正方形！'); measure(); }
      }
      tris.forEach(function (el, i) {
        board.dragBody(el, function (p, d) { if (solved) return; off[i] = [base[i][0] + d[0], base[i][1] + d[1]]; place(i); },
          function () { if (solved) return; off[i] = [Math.round(off[i][0]), Math.round(off[i][1])]; base[i] = off[i].slice(); place(i); check(); });
      });
      /* 量一量：用方格正方形 n × n 去比，找出斜正方形的邊長 */
      function measure() {
        calc.append(P.pill('大正方形 7 × 7 ＝ 49', 'is-blue'), P.pill('4 個三角形 ＝ 4 × 6 ＝ 24', 'is-amber'), P.pill('空白（斜正方形）＝ 49 − 24 ＝ 25', 'is-ok'));
        box2.append(P.instr('用<b>方格正方形 n × n</b>（粉紅虛線）去比：n 是多少時，面積剛好等於中間斜正方形？'));
        var sn = P.stepper('邊長 n', 1, 7, 1, function (v) { setN(v); }); box2.append(h('div', { class: 'pl-steprow' }, sn.el), h('div', { class: 'pl-readout' }, pn, pt));
        api.solve(function () { sn.set(5); }); sq.style.opacity = 0.55; setN(1);
        function setN(v) {
          board.setPoly(sq, [[0, 0], [v, 0], [v, v], [0, v]]); pn.textContent = 'n × n ＝ ' + v * v; var eq = v * v === 25; pn.className = 'pl-pill' + (eq ? ' is-ok' : '');
          pt.className = 'pl-pill' + (eq ? ' is-ok' : ''); pt.textContent = eq ? '✓ 剛好 25！邊長 c ＝ 5' : (v * v < 25 ? '比 25 小，再大一點' : '比 25 大，再小一點');
          if (eq) { P.track('aha', { id: 'pythagoras', step: 2 }); if (!st.querySelector('.pl-rule')) st.append(P.ruleBox('空白面積 ＝ c² ＝ 25，方格正方形 5 × 5 剛好一樣大，所以斜邊 <b>c ＝ 5</b>。<br>3² ＋ 4² ＝ 9 ＋ 16 ＝ 25 ＝ 5²：用面積<b>量出來</b>的畢氏定理。', '發現')); api.unlock('量出斜邊 c ＝ 5 了！'); }
        }
      }
      api.solve(function () { tris.forEach(function (el, i) { off[i] = L.mv[i].slice(); base[i] = L.mv[i].slice(); place(i); }); check(); });
      st.append(P.hint('提示：有一個三角形本來就在角落。每個三角形只要「平移」就能到另一個角落，不用翻轉。')); api.lock('把四個三角形都拖到角落');
    },
    /* 3. 換成別的三角形 */
    function (st, api) {
      st.append(P.instr('換別的直角三角形試試：改變 <b>a</b>、<b>b</b>，把滑桿拉到擺法 B，看 a²＋b² 和 c² 是不是還一樣。'));
      var a = 2, b = 3, seen = {}, n = 0, done = false, host = stage(st), pr = h('div', { class: 'pl-readout' }), cur = { t: 0 };
      var sa = P.stepper('短邊 a', 1, 5, a, function (v) { a = v; build(); }), sb = P.stepper('短邊 b', 1, 5, b, function (v) { b = v; build(); });
      st.append(h('div', { class: 'pl-steprow' }, sa.el, sb.el));
      var sl = sliderBar(st, function (v) { cur.t = v / 100; upd(); }); st.append(pr);
      var draw, p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', 'is-green'), pk = P.pill('', ''); pr.append(p1, p2, p3, pk);
      function build() { host.innerHTML = ''; var board = new P.Board(host, { w: a + b, h: a + b }); draw = figure(board, a, b); sl.value = 0; cur.t = 0; upd(); }
      function upd() {
        draw(cur.t); var c2 = a * a + b * b; p1.textContent = 'a² ＝ ' + a * a; p2.textContent = 'b² ＝ ' + b * b; p3.textContent = 'c² ＝ ' + c2;
        var ok = cur.t > 0.97; pk.className = 'pl-pill' + (ok ? ' is-ok' : ''); pk.textContent = ok ? '✓ ' + a * a + ' ＋ ' + b * b + ' ＝ ' + c2 : (cur.t < 0.03 ? '拉滑桿看 c²' : '搬動中');
        if (ok) { var key = Math.min(a, b) + ',' + Math.max(a, b); if (!seen[key]) { seen[key] = 1; n++; } if (n >= 3 && !done) { done = true; P.track('aha', { id: 'pythagoras', step: 3 }); st.append(P.ruleBox('不管兩條直角邊多長，<b>a² ＋ b² ＝ c²</b> 都成立。<br>c² 不是平方數也沒關係：例如 a＝2、b＝3 時，c² ＝ 13，c ＝ √13。', '一般化')); api.unlock('每個直角三角形都成立！'); } }
      }
      api.solve(function () { [[2, 3], [1, 2], [3, 5]].forEach(function (p) { a = p[0]; b = p[1]; sa.set(a, true); sb.set(b, true); build(); sl.value = 100; cur.t = 1; upd(); }); });
      build(); st.append(P.hint('提示：至少試 3 種不同的 (a, b)。三個三角形永遠只用平移就能搬過去。')); api.lock('試 3 種三角形');
    },
    /* 4. 四個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function sq(x) { return x * x; }
      function isSq(n) { var r = Math.round(Math.sqrt(n)); return r * r === n; }
      var tasks = [
        /* 關 1：格線上，長度² 的目標 */
        function (b0, done, setSolve) {
          var targets = [13, 25, 50], sol = [[2, 3], [3, 4], [5, 5]], ti = 0, O = [1, 1], info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g');
          b0.append(info, host); var bd = new P.Board(host, { w: 10, h: 10, cls: 'pl-svg--sm' }); bd.gMid.append(g); var seg = bd.line(O, O, 'pl-line pl-line--green pl-line--bold'); bd.dot(O, 'pl-dot', null, 0.18); bd.text([O[0] - 0.5, O[1] - 0.6], 'O', 'pl-text');
          var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pc = P.pill('', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, pa, pb, pc));
          function txt() { info.innerHTML = '從 O 拖一個點到格點，讓「<b>長度的平方</b>」剛好等於 <b>' + targets[ti] + '</b>。<small>（目標 ' + (ti + 1) + ' / 3）</small>'; }
          function draw(p) {
            var dx = p[0] - O[0], dy = p[1] - O[1]; bd.setLine(seg, O, p); g.innerHTML = '';
            bd.line(O, [p[0], O[1]], 'pl-line pl-line--blue pl-line--dash', g); bd.line([p[0], O[1]], p, 'pl-line pl-line--pink pl-line--dash', g); if (dx > 0 && dy > 0) bd.rightMark([p[0], O[1]], [-1, 0], [0, 1], 0.4, g);
            pa.textContent = '橫 ' + dx; pb.textContent = '直 ' + dy; pc.textContent = '長度² ＝ ' + dx + '² ＋ ' + dy + '² ＝ ' + (dx * dx + dy * dy); return dx * dx + dy * dy;
          }
          var hd = bd.handle({ pos: [3, 2], onMove: function (t) { var n = draw(t); if (ti < targets.length && n === targets[ti]) { ti++; if (ti >= targets.length) { P.toast('三個目標都找到了！'); P.track('aha', { id: 'pythagoras', step: 4 }); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } } } });
          setSolve(function () { while (ti < targets.length) hd.moveTo([O[0] + sol[ti][0], O[1] + sol[ti][1]]); });
          txt(); draw([3, 2]); b0.append(P.hint('提示：長度² ＝ 橫² ＋ 直²。想想哪兩個平方數（1、4、9、16、25…）加起來剛好是目標。'));
        },
        /* 關 2：哪些三角形是直角？ */
        function (b0, done, setSolve) {
          var A = [2, 2], B = [10, 2], found = { A: false, B: false, C: false }, host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g');
          b0.append(h('div', { class: 'pl-q', html: 'A、B 固定。拖動 <b>C</b>，找出讓 △ABC 成為<b>直角三角形</b>的位置：直角在 <b>A</b>、在 <b>B</b>、在 <b>C</b> 各找一個。' }), host);
          var bd = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), tri = bd.poly([A, B, [6, 5]], 'pl-poly pl-poly--amber'); bd.gMid.append(g);
          [[A, 'A', [-0.5, -0.6]], [B, 'B', [0.5, -0.6]]].forEach(function (q) { bd.dot(q[0], 'pl-dot', null, 0.18); bd.text([q[0][0] + q[2][0], q[0][1] + q[2][1]], q[1], 'pl-text pl-text--lg'); });
          var tC = bd.text([0, 0], 'C', 'pl-text pl-text--lg pl-text--pink'), pl = P.pill('', ''), chips = {}, ro = h('div', { class: 'pl-readout' }, pl); ['A', 'B', 'C'].forEach(function (k) { chips[k] = P.pill('直角在 ' + k, ''); ro.append(chips[k]); }); b0.append(ro);
          function d2(p, q) { return sq(p[0] - q[0]) + sq(p[1] - q[1]); }
          function dot3(V, P1, P2) { return (P1[0] - V[0]) * (P2[0] - V[0]) + (P1[1] - V[1]) * (P2[1] - V[1]); }
          function unit(V, P1) { var dx = P1[0] - V[0], dy = P1[1] - V[1], L1 = Math.hypot(dx, dy); return [dx / L1, dy / L1]; }
          function draw(C) {
            bd.setPoly(tri, [A, B, C]); bd.setText(tC, [C[0] + 0.5, C[1] + 0.55]); g.innerHTML = '';
            var s = [d2(B, C), d2(A, C), d2(A, B)].sort(function (x, y) { return x - y; }), who = dot3(A, B, C) === 0 ? 'A' : dot3(B, A, C) === 0 ? 'B' : dot3(C, A, B) === 0 ? 'C' : '';
            pl.textContent = s[0] + ' ＋ ' + s[1] + (s[0] + s[1] === s[2] ? ' ＝ ' : ' ≠ ') + s[2]; pl.className = 'pl-pill' + (who ? ' is-ok' : '');
            if (who) {
              var V = who === 'A' ? A : who === 'B' ? B : C, Q1 = who === 'A' ? B : A, Q2 = who === 'A' ? C : who === 'B' ? C : B; bd.rightMark(V, unit(V, Q1), unit(V, Q2), 0.6, g);
              found[who] = true; chips[who].className = 'pl-pill is-ok'; chips[who].textContent = '✓ 直角在 ' + who;
            }
            if (found.A && found.B && found.C) { P.toast('三種直角都找到了！'); P.track('aha', { id: 'pythagoras', step: 5 }); done(); }
          }
          var cand = []; for (var x = 1; x <= 11; x++) for (var y = 1; y <= 9; y++) if (y !== 2) cand.push([x, y]);
          var hd = bd.handle({ pos: [6, 5], candidates: cand, onMove: draw }); draw([6, 5]);
          setSolve(function () { [[2, 6], [10, 5], [6, 6]].forEach(hd.moveTo); }); b0.append(P.hint('提示：較短兩邊的平方和 ＝ 最長邊的平方，就是直角（畢氏定理的逆定理）。'));
        },
        /* 關 3：長、寬、對角線都是整數的長方形 */
        function (b0, done, setSolve) {
          var host = h('div', { class: 'pl-stage pl-stage--sm' }), seen = {}, n = 0;
          b0.append(h('div', { class: 'pl-q', html: '拖動長方形的右上角，找出<b>長、寬、對角線都是整數</b>的長方形（找 <b>2 種</b>）。' }), host);
          var bd = new P.Board(host, { w: 12, h: 12, cls: 'pl-svg--sm' }), rect = bd.poly([[0, 0], [1, 0], [1, 1], [0, 1]], 'pl-poly pl-poly--amber'), dg = bd.line([0, 0], [1, 1], 'pl-line pl-line--green pl-line--dash');
          var pw = P.pill('', 'is-blue'), ph = P.pill('', 'is-pink'), pd = P.pill('', ''), pn = P.pill('找到 0 / 2', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, pw, ph, pd, pn));
          function draw(p) {
            var w = p[0], hh = p[1], d = w * w + hh * hh, ok = isSq(d); bd.setPoly(rect, [[0, 0], [w, 0], [w, hh], [0, hh]]); bd.setLine(dg, [0, 0], p);
            pw.textContent = '長 ' + w; ph.textContent = '寬 ' + hh; pd.className = 'pl-pill' + (ok ? ' is-ok' : ''); pd.textContent = ok ? '✓ 對角線 ＝ ' + Math.round(Math.sqrt(d)) : '對角線 ＝ √' + d;
            if (ok) { var key = Math.min(w, hh) + ',' + Math.max(w, hh); if (!seen[key]) { seen[key] = 1; n++; pn.textContent = '找到 ' + Math.min(n, 2) + ' / 2'; if (n >= 2) { P.toast('找到兩種了！它們都是「畢氏三元數」'); P.track('aha', { id: 'pythagoras', step: 6 }); done(); } } }
          }
          var hd = bd.handle({ pos: [7, 5], valid: function (t) { return t[0] >= 1 && t[1] >= 1; }, onMove: draw }); draw([7, 5]);
          setSolve(function () { [[3, 4], [6, 8]].forEach(hd.moveTo); }); b0.append(P.hint('對角線是直角三角形的斜邊，所以 長² ＋ 寬² 要剛好是某個整數的平方。'));
        },
        /* 關 4：梯子靠牆 */
        function (b0, done, setSolve) {
          var host = h('div', { class: 'pl-stage pl-stage--sm' }), seen = {}, n = 0;
          b0.append(h('div', { class: 'pl-q', html: '<b>13 公尺</b>的梯子靠牆。拖動梯腳，找出「梯頂離地也剛好是<b>整數公尺</b>」的位置（有 <b>2 個</b>）。' }), host);
          var bd = new P.Board(host, { w: 14, h: 14, cls: 'pl-svg--sm' }); bd.line([0, 0], [14, 0], 'pl-line'); bd.line([0, 0], [0, 14], 'pl-line');
          var lad = bd.line([5, 0], [0, 12], 'pl-line pl-line--amber pl-line--bold'), gm = h('g'); bd.gMid.append(gm);
          var px = P.pill('', 'is-blue'), py = P.pill('', 'is-pink'), pk = P.pill('找到 0 / 2', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, px, py, pk));
          var cand = []; for (var x = 1; x <= 12; x++) cand.push([x, 0]);
          function draw(p) {
            var xx = p[0], hh = Math.sqrt(169 - xx * xx), ok = isSq(169 - xx * xx); bd.setLine(lad, p, [0, hh]); gm.innerHTML = ''; bd.rightMark([0, 0], [1, 0], [0, 1], 0.7, gm);
            px.textContent = '離牆 ' + xx + ' 公尺'; py.className = 'pl-pill' + (ok ? ' is-ok' : ' is-pink'); py.textContent = ok ? '✓ 高 ' + Math.round(hh) + ' 公尺' : '高 ' + (Math.round(hh * 100) / 100) + ' 公尺';
            if (ok && !seen[xx]) { seen[xx] = 1; n++; pk.textContent = '找到 ' + n + ' / 2'; if (n >= 2) { P.toast('5-12-13 就是這樣出現的！'); P.track('aha', { id: 'pythagoras', step: 7 }); done(); } }
          }
          var hd = bd.handle({ pos: [8, 0], candidates: cand, onMove: draw }); draw([8, 0]);
          setSolve(function () { [[5, 0], [12, 0]].forEach(hd.moveTo); }); b0.append(P.hint('梯腳、牆、梯子圍成直角三角形，斜邊固定是 13。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'pythagoras' }); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'pythagoras', moduleName: '畢氏定理：重排四個直角三角形', askAbout: '國二、國三幾何', aha: '把四個直角三角形換個擺法，<br>空白面積不變，所以 a² ＋ b² ＝ c²。',
        cards: [{ text: '直角三角形兩股的平方和＝斜邊的平方；反過來三邊滿足 a²＋b²＝c² 就是直角三角形', src: '國二「畢氏定理」（國中數學課綱）' }, { text: '長方形對角線、梯子靠牆、座標平面兩點距離都能用畢氏定理算', src: '國二「畢氏定理的應用」' }],
        depth: { here: 0.15, cheetah: [{ at: 0.4, label: '弦圖證明<br>畢氏三元數' }, { at: 0.86, label: '座標距離<br>餘弦定理' }] },
        teasers: [
          { title: '畢氏定理的不同證明', q: '除了重排面積，還有「內弦圖、外弦圖」等證法，為什麼它們都對？還能推出射影定理。', where: 'PK4A 2507 第 19 堂「勾股定理」', lv: 'L2' },
          { title: '畢氏三元數', q: '3-4-5、5-12-13、8-15-17、7-24-25、9-40-41 怎麼一次找出來？', where: 'PK4A 2507 第 19 堂（常用勾股弦數）', lv: 'L2' },
          { title: '座標上的兩點距離', q: '座標平面上任兩點的距離公式，其實就是畢氏定理；圓的方程式也是。', where: 'J81S 2507 第 2 堂、2607 第 1 堂；J72S 2601 第 24 堂', lv: 'L2' },
          { title: '餘弦定理', q: '三角形不是直角時，第三邊怎麼算？c² ＝ a² ＋ b² − 2ab·cos C，90° 時就回到畢氏定理。', where: 'S102 2601 第 20–21 堂：CH4 三角函數', lv: 'L3' }],
        parent: { pitfall: '孩子常把斜邊搞錯：公式只在<b>直角三角形</b>成立，而且 c 一定是<b>最長的邊</b>（直角對面那條）；也常忘了開根號，把 c² 當成 c。', place: '國二下的重點，之後的座標距離、圓、三角函數、立體幾何對角線都會用到。', ask: ['為什麼兩種擺法的空白面積一樣？', '3、4、5 為什麼是直角三角形？5、6、7 是嗎？', '一張長 24、寬 7 的長方形桌子，最長可以放多長的桿子？'] },
        classes: ['J81A（2507 第 13–18 堂；2607 第 10–15 堂）：CH2 勾股定理', 'J81S（2507 第 2–3 堂＋習題課第 4–7 堂；2607 第 1–2 堂）：平方根與畢氏定理', 'J72S（2601 第 22–24 堂）：CH02 平方根與畢氏定理', 'PK3C（2507 第 5 堂；2607 第 5 堂）：勾股定理（畢氏定理）', 'PK4A（2507 第 19 堂；2607 第 15 堂）：勾股定理'],
        next: { href: 'play-circle-angles.html', text: '下一個：圓周角與圓心角' } });
    }];
  new P.Lesson({ id: 'pythagoras', title: '畢氏定理：重排四個直角三角形', steps: steps });
})();
