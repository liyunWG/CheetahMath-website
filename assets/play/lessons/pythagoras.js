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

  /* 小測驗用的直角三角形圖（圖不一定照比例） */
  function triFig(box, labels) {
    var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = new P.Board(host, { w: 12, h: 8, cls: 'pl-svg--sm' });
    var A = [2, 1], B = [10, 1], C = [2, 7];
    b.poly([A, B, C], 'pl-poly pl-poly--amber'); b.rightMark(A, [1, 0], [0, 1], 0.6);
    b.text([6, 0.15], labels[0], 'pl-text pl-text--blue pl-text--lg'); b.text([1.1, 4.1], labels[1], 'pl-text pl-text--pink pl-text--lg'); b.text([6.9, 4.7], labels[2], 'pl-text pl-text--green pl-text--lg');
    return b;
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
    /* 2. 用面積算出斜邊 */
    function (st, api) {
      st.append(P.instr('用面積算算看：直角邊 <b>3</b> 和 <b>4</b>，斜邊 <b>c</b> 是多少？'));
      var host = stage(st), board = new P.Board(host, { w: 7, h: 7 }); figure(board, 3, 4)(1);
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        { q: '大正方形邊長是 3 ＋ 4 ＝ 7，面積是多少？', ans: 49, ok: '對！7 × 7 ＝ 49。', wr: '邊長是 3 ＋ 4 ＝ 7，面積 ＝ 7 × 7。' },
        { q: '每個三角形面積是 3 × 4 ÷ 2 ＝ 6。<b>四個</b>三角形共多大？', ans: 24, ok: '對！4 × 6 ＝ 24。', wr: '一個三角形是 6，乘以 4 個。' },
        { q: '斜放的正方形（c²）＝ 大正方形 − 四個三角形 ＝ 49 − 24 ＝？', ans: 25, ok: '對！c² ＝ 25。', wr: '49 − 24。' },
        { q: 'c² ＝ 25，所以斜邊 c ＝？', ans: 5, ok: '對！c ＝ 5。3² ＋ 4² ＝ 5²，這就是有名的「3-4-5」直角三角形。', wr: '什麼數的平方是 25？' }];
      function next() { P.later(function () { k++; show(); }, 800); }
      function show() {
        if (k >= qs.length) { P.track('aha', { id: 'pythagoras', step: 2 }); st.append(P.ruleBox('c² ＝ (a＋b)² − 4 × (ab ÷ 2) ＝ a² ＋ b²。<br>用面積就<b>算出</b>了畢氏定理，不是死背。', '原因')); api.unlock('用面積算出 c ＝ 5 了！'); return; }
        var q = qs[k]; box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + (k + 1) + ' / ' + qs.length + ' 步'), h('div', { class: 'pl-q', html: q.q }));
        P.numBox(box, { answer: q.ans, okMsg: q.ok, onOk: next, wrong: function () { return '提示：' + q.wr; } });
      }
      show(); api.lock('完成 4 個小問題');
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
    /* 4. 用用看 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      function head(i) { box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + i + ' / 4 題')); }
      var qs = [
        function () { head(1); triFig(box, ['6', '8', 'c']); box.append(h('div', { class: 'pl-q', html: '直角三角形兩條直角邊是 <b>6</b> 和 <b>8</b>，斜邊是？<small>（圖不一定照比例）</small>' })); P.numBox(box, { answer: 10, okMsg: '對！c² ＝ 36 ＋ 64 ＝ 100，c ＝ 10。', onOk: next, wrong: function () { return '提示：c² ＝ 6² ＋ 8² ＝ 36 ＋ 64。'; } }); },
        function () { head(2); triFig(box, ['b', '5', '13']); box.append(h('div', { class: 'pl-q', html: '斜邊是 <b>13</b>，一條直角邊是 <b>5</b>，另一條直角邊 b 是多少？' })); P.numBox(box, { answer: 12, okMsg: '對！b² ＝ 13² − 5² ＝ 169 − 25 ＝ 144，b ＝ 12。', onOk: next, wrong: function () { return '提示：斜邊的平方減去另一邊的平方：b² ＝ 169 − 25。'; } }); },
        function () {
          head(3); box.append(h('div', { class: 'pl-q', html: '三條邊長各是下面哪一組時，這個三角形是<b>直角三角形</b>？<small>（逆定理：a²＋b²＝c² 就是直角）</small>' }));
          P.choice(box, {}, { id: 'py-t3', prompt: '', row: true, options: [{ t: '4、5、6', fb: '16 ＋ 25 ＝ 41，不等於 36。' }, { t: '5、12、13', ok: true, fb: '對！25 ＋ 144 ＝ 169 ＝ 13²，是直角三角形。' }, { t: '6、8、9', fb: '36 ＋ 64 ＝ 100，不等於 81。' }], onAnswer: function () { next(); } });
        },
        function () {
          head(4); var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = new P.Board(host, { w: 12, h: 8, cls: 'pl-svg--sm' });
          var R = [[1, 1], [11, 1], [11, 7], [1, 7]]; b.poly(R, 'pl-poly pl-poly--amber'); b.line([1, 1], [11, 7], 'pl-line pl-line--green pl-line--dash');
          b.text([6, 0.15], '24', 'pl-text pl-text--blue pl-text--lg'); b.text([11.9, 4.1], '7', 'pl-text pl-text--pink pl-text--lg'); b.text([5.4, 4.7], '？', 'pl-text pl-text--green pl-text--lg');
          [[1, 1], [11, 1], [11, 7], [1, 7]].forEach(function (c, i) { b.rightMark(c, [[1, 0], [-1, 0], [-1, 0], [1, 0]][i], [[0, 1], [0, 1], [0, -1], [0, -1]][i], 0.5); });
          box.append(h('div', { class: 'pl-q', html: '長方形長 <b>24</b>、寬 <b>7</b>，<b>對角線</b>有多長？' }));
          P.numBox(box, { answer: 25, okMsg: '對！對角線把長方形切成直角三角形：24² ＋ 7² ＝ 576 ＋ 49 ＝ 625，所以是 25。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'pythagoras' }); }, wrong: function () { return '提示：對角線是直角三角形的斜邊，兩條直角邊是 24 和 7。'; } });
        }];
      qs[0](); api.lock('完成 4 題');
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'pythagoras', moduleName: '畢氏定理：重排四個直角三角形', askAbout: '國二、國三幾何', aha: '把四個直角三角形換個擺法，<br>空白面積不變，所以 a² ＋ b² ＝ c²。',
        cards: [{ text: '直角三角形兩股的平方和＝斜邊的平方；反過來三邊滿足 a²＋b²＝c² 就是直角三角形', src: '國二「畢氏定理」（國中數學課綱）' }, { text: '長方形對角線、梯子靠牆、座標平面兩點距離都能用畢氏定理算', src: '國二「畢氏定理的應用」' }],
        depth: { here: 0.15, cheetah: [{ at: 0.4, label: '畢氏三元數<br>座標距離' }, { at: 0.86, label: '餘弦定理<br>費馬最後定理' }] },
        teasers: [
          { title: '畢氏定理的不同證明', q: '除了重排面積，還有相似三角形、總統證明等做法，為什麼它們都對？', where: '資優班常見的證明延伸（詳細堂次請洽老師）', lv: 'L2' },
          { title: '畢氏三元數', q: '3-4-5、5-12-13、8-15-17 還有哪些？用一條公式一次找出全部整數解。', where: '資優班常見的數論與幾何延伸（詳細堂次請洽老師）', lv: 'L2' },
          { title: '座標上的距離與圓', q: '座標平面上任兩點的距離公式、圓的方程式，其實都是畢氏定理。', where: '國二、國三座標幾何與高中解析幾何', lv: 'L2' },
          { title: '餘弦定理', q: '三角形不是直角時，第三邊怎麼算？c² ＝ a² ＋ b² − 2ab·cos C', where: '高中三角函數；競賽幾何基本功', lv: 'L3' }],
        parent: { pitfall: '孩子常把斜邊搞錯：公式只在<b>直角三角形</b>成立，而且 c 一定是<b>最長的邊</b>（直角對面那條）；也常忘了開根號，把 c² 當成 c。', place: '國二下的重點，之後的座標距離、圓、三角函數、立體幾何對角線都會用到。', ask: ['為什麼兩種擺法的空白面積一樣？', '3、4、5 為什麼是直角三角形？5、6、7 是嗎？', '一張長 24、寬 7 的長方形桌子，最長可以放多長的桿子？'] },
        classes: ['國二「畢氏定理」：課綱主題，獵豹班上會系統教並延伸（詳細堂次請洽老師）', '資優班：畢氏三元數、不同證法、座標與圓（詳細堂次請洽老師）'],
        next: { href: 'play-circle-angles.html', text: '下一個：圓周角與圓心角' } });
    }];
  new P.Lesson({ id: 'pythagoras', title: '畢氏定理：重排四個直角三角形', steps: steps });
})();
