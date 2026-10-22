/* 獵豹玩中學｜球與圓錐、圓柱的關係（祖暅原理）
   半徑 R＝3 的半球，和「半徑 3、高 3 的圓柱挖掉一個倒立圓錐（尖在底、口在頂）」。
   在高度 y 切開：半球的截面是圓，面積 π(9−y²)；挖掉圓錐的圓柱，截面是圓環，外半徑 3、內半徑 y，面積 π(9−y²)。每個高度都一樣 → 體積一樣。 */
(function () {
  var P = Play, h = P.h, R = 3, Y0 = 6.6, CX1 = 3.9, CX2 = 10.1, TOPC = 3.0;
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  /* n3 ＝ 體積 × 3（整數）→ 顯示成整數或 n3/3 */
  function fr(n3) { return n3 % 3 === 0 ? String(n3 / 3) : n3 + '/3'; }
  function f2(n) { return String(Math.round(n * 100) / 100); }
  function arcPath(b, cx, y0, r) { return 'M ' + (cx - r) + ' ' + b.Y(y0) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + b.Y(y0) + ' Z'; }
  function circ(b, c, r, fill, stroke, layer) { return b.circle(c, r, 'pl-circle', layer, { style: 'fill:' + fill + ';stroke:' + stroke + ';stroke-width:3' }); }
  function setR(el, r) { el.setAttribute('r', Math.max(0, r)); el.style.display = r < 0.02 ? 'none' : ''; }

  /* 兩個立體的側視圖＋截面圖。回傳 update(y)：y＝切的高度（0～3） */
  function figures(b) {
    var L = [CX1 - R, CX1 + R], Rr = [CX2 - R, CX2 + R];
    b.line([0.2, Y0], [13.8, Y0], 'pl-line pl-line--soft');
    var dome = h('path', { d: arcPath(b, CX1, Y0, R), class: 'pl-poly pl-poly--green' }); b.gMid.append(dome);
    b.poly([[Rr[0], Y0], [Rr[1], Y0], [Rr[1], Y0 + R], [Rr[0], Y0 + R]], 'pl-poly pl-poly--ghost');
    b.poly([[Rr[0], Y0], [Rr[0], Y0 + R], [CX2, Y0]], 'pl-poly pl-poly--pink'); b.poly([[CX2, Y0], [Rr[1], Y0 + R], [Rr[1], Y0]], 'pl-poly pl-poly--pink');
    b.line([CX2, Y0], [Rr[0], Y0 + R], 'pl-line pl-line--soft'); b.line([CX2, Y0], [Rr[1], Y0 + R], 'pl-line pl-line--soft');
    b.text([CX1, Y0 + R + 0.55], '半球', 'pl-text pl-text--green pl-text--lg'); b.text([CX2, Y0 + R + 0.55], '圓柱挖掉圓錐', 'pl-text pl-text--pink pl-text--lg');
    var cut = b.line([0.2, Y0], [13.8, Y0], 'pl-line pl-line--amber pl-line--dash'), s1 = b.line([0, 0], [0, 0], 'pl-line pl-line--green pl-line--bold'), s2 = b.line([0, 0], [0, 0], 'pl-line pl-line--pink pl-line--bold'), s3 = b.line([0, 0], [0, 0], 'pl-line pl-line--pink pl-line--bold');
    var disc = circ(b, [CX1, TOPC], R, 'rgba(31,157,85,.28)', '#1f9d55'), out = circ(b, [CX2, TOPC], R, 'rgba(214,51,108,.24)', '#d6336c'), inn = circ(b, [CX2, TOPC], 0, '#fff', '#d6336c');
    b.text([CX1, -0.45], '截面：圓', 'pl-text pl-text--green'); b.text([CX2, -0.45], '截面：圓環', 'pl-text pl-text--pink');
    return function (y) {
      var yy = Y0 + y, w = Math.sqrt(Math.max(0, R * R - y * y));
      b.setLine(cut, [0.2, yy], [13.8, yy]); b.setLine(s1, [CX1 - w, yy], [CX1 + w, yy]); b.setLine(s2, [Rr[0], yy], [CX2 - y, yy]); b.setLine(s3, [CX2 + y, yy], [Rr[1], yy]);
      setR(disc, w); setR(inn, y); return R * R - y * y;
    };
  }

  /* 小測驗用的圖：{type:'sphere'|'half'|'cyl'|'cylcone'} */
  function qfig(box, type) {
    var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = new P.Board(host, { w: 12, h: 8, cls: 'pl-svg--sm' }), c = [6, 4], r = 3;
    if (type === 'sphere') { circ(b, c, r, 'rgba(47,111,220,.2)', '#2f6fdc'); b.line(c, [c[0] + r, c[1]], 'pl-line pl-line--pink'); b.text([c[0] + r / 2, c[1] + 0.5], 'r', 'pl-text pl-text--pink pl-text--lg'); }
    if (type === 'half') { b.line([3, 2], [9, 2], 'pl-line'); b.gMid.append(h('path', { d: arcPath(b, 6, 2, 3), class: 'pl-poly pl-poly--green' })); b.line([6, 2], [9, 2], 'pl-line pl-line--pink'); b.text([7.5, 1.2], 'r', 'pl-text pl-text--pink pl-text--lg'); }
    if (type === 'cyl' || type === 'cylcone') {
      b.poly([[3, 1], [9, 1], [9, 7], [3, 7]], 'pl-poly pl-poly--ghost'); circ(b, c, r, 'rgba(47,111,220,.2)', '#2f6fdc');
      if (type === 'cylcone') { b.poly([[3, 1], [9, 1], [6, 7]], 'pl-poly pl-poly--pink'); b.text([6, 2.1], '圓錐', 'pl-text pl-text--pink'); b.text([c[0] + 0.1, 4.8], '球', 'pl-text pl-text--lg'); }
    }
    return b;
  }

  var steps = [
    /* 1. 預測＋拉滑桿：同一個高度，截面一樣大 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false;
      P.choice(st, api, { id: 'ss2-p1', predict: true, label: '先猜猜看', prompt: '<b>半球</b>和<b>「圓柱挖掉圓錐」</b>（高度、寬度都一樣），哪個體積大？', row: true, options: [{ t: '半球大' }, { t: '挖掉圓錐的較大' }, { t: '一樣大' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉滑桿，在不同高度切一刀'); } });
      var host = stage(st), board = new P.Board(host, { w: 14, h: 11 }), upd = figures(board), p1 = P.pill('', 'is-ok'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, p1, p2, p3);
      function draw(v) {
        var y = R * v / 100, a = upd(y), k = Math.round(v / 12.5);
        p1.textContent = '半球截面（圓）：' + f2(a) + 'π'; p2.textContent = '圓環：' + f2(a) + 'π'; p3.textContent = '高度 y ＝ ' + f2(y);
        if (v > 0 && v < 100 && !seen[k]) { seen[k] = 1; n++; }
        if (n >= 4 && !done) { done = true; P.track('aha', { id: 'solid-sphere', step: 1 }); P.toast(api.ctx.p1 === 2 ? '你猜對了！' : '每個高度都一樣大'); st.append(P.ruleBox('不管在哪個高度切，<b>半球的圓面積</b> ＝ <b>圓環的面積</b>（都是 π(9 − y²)）。<br>每個高度的截面積都相等，<b>體積就相等</b>——這叫<b>祖暅原理</b>（西方叫卡瓦列里原理）。', '祖暅原理')); api.unlock('兩個體積一樣大！'); }
      }
      var sl = P.slider(0, 100, 50, function (v) { if (gate.on) { sl.value = 50; P.toast('先做上面的預測'); return; } draw(+v); });
      api.solve(function () { gate.on = false; [20, 40, 60, 85].forEach(function (v) { sl.value = v; draw(v); }); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '↓ 底部'), h('span', {}, '頂部 ↑')));
      draw(50); st.append(ro, P.hint('橘色虛線是切的位置。綠色＝半球被切到的地方，粉紅＝挖掉圓錐後的柱體被切到的地方。圓環的內圈半徑剛好等於 y（因為圓錐是 45° 角）。'));
      api.lock('先做上面的預測');
    },
    /* 2. 算出球的體積 */
    function (st, api) {
      st.append(P.instr('用祖暅原理算球的體積。圓柱半徑 3、高 3。<small>（答案單位都是 π）</small>'));
      var host = stage(st), board = new P.Board(host, { w: 14, h: 11 }); figures(board)(1.5);
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        { q: '圓柱：半徑 3、高 3，體積 ＝ π × 3² × 3 ＝ ？π', ans: 27, ok: '對！圓柱 ＝ 27π。', wr: 'π × 3 × 3 × 3。' },
        { q: '同底同高的圓錐，體積是圓柱的 <b>1/3</b>。圓錐 ＝ ？π', ans: 9, ok: '對！27 ÷ 3 ＝ 9，圓錐 ＝ 9π。', wr: '27 ÷ 3。' },
        { q: '圓柱挖掉圓錐，剩下的體積 ＝ 27π − 9π ＝ ？π', ans: 18, ok: '對！剩下 18π。', wr: '27 − 9。' },
        { q: '半球和它「每個高度截面積都一樣」，所以<b>半球體積</b> ＝ ？π', ans: 18, ok: '對！祖暅原理：半球 ＝ 18π。', wr: '和上一題剩下的體積一樣大。' },
        { q: '整個球是兩個半球，體積 ＝ ？π', ans: 36, ok: '對！球 ＝ 36π ＝ <b>4/3 × π × 3³</b>。這就是球的體積公式 V ＝ (4/3)πr³。', wr: '18 × 2。' }];
      function next() { P.later(function () { k++; show(); }, 800); }
      function show() {
        if (k >= qs.length) { P.track('aha', { id: 'solid-sphere', step: 2 }); st.append(P.ruleBox('<b>球的體積 ＝ (4/3)πr³</b>，是用「<b>圓柱 − 圓錐</b>」算出來的，不用背。<br>半球 ＝ 圓柱 − 圓錐 ＝ πr³ − (1/3)πr³ ＝ (2/3)πr³。', '推導')); api.unlock('算出球的體積了！'); return; }
        var q = qs[k]; box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + (k + 1) + ' / ' + qs.length + ' 步'), h('div', { class: 'pl-q', html: q.q }));
        P.numBox(box, { answer: q.ans, unit: 'π', okMsg: q.ok, onOk: next, wrong: function () { return '提示：' + q.wr; } });
      }
      show(); api.lock('完成 5 個小問題');
    },
    /* 3. 圓錐、球、圓柱 ＝ 1 : 2 : 3 */
    function (st, api) {
      var gate = { on: true }, r = 3, seen = {}, n = 0, done = false;
      P.choice(st, api, { id: 'ss2-p3', predict: true, label: '先猜猜看', prompt: '球剛好放進圓柱（高 ＝ 2r）。球的體積是圓柱的…？', row: true, options: [{ t: '1/3' }, { t: '1/2' }, { t: '2/3' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('改變半徑 r，看三個體積'); draw(); } });
      var host = stage(st), b = new P.Board(host, { w: 14, h: 7 });
      b.poly([[0.5, 1], [4.5, 1], [2.5, 5]], 'pl-poly pl-poly--pink'); b.text([2.5, 0.2], '圓錐', 'pl-text pl-text--pink');
      circ(b, [7, 3], 2, 'rgba(47,111,220,.22)', '#2f6fdc'); b.text([7, 0.2], '球', 'pl-text pl-text--blue');
      b.poly([[9.5, 1], [13.5, 1], [13.5, 5], [9.5, 5]], 'pl-poly pl-poly--green'); circ(b, [11.5, 3], 2, 'rgba(47,111,220,.22)', '#2f6fdc'); b.text([11.5, 0.2], '圓柱', 'pl-text pl-text--green');
      b.text([2.5, 5.55], '底＝圓柱底、高 2r', 'pl-text pl-text--sm'); b.text([11.5, 5.55], '高 ＝ 2r', 'pl-text pl-text--sm');
      var sr = P.stepper('半徑 r', 1, 5, r, function (v) { r = v; draw(); }), pc = P.pill('', 'is-pink'), pb = P.pill('', 'is-blue'), pg = P.pill('', 'is-ok'), pr = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pc, pb, pg, pr);
      function draw() {
        var c = 2 * r * r * r / 3, s = 4 * r * r * r / 3, y = 2 * r * r * r; pc.textContent = '圓錐 ' + fr(2 * r * r * r) + 'π'; pb.textContent = '球 ' + fr(4 * r * r * r) + 'π'; pg.textContent = '圓柱 ' + fr(6 * r * r * r) + 'π'; pr.textContent = c / c + ' : ' + s / c + ' : ' + y / c;
        if (!seen[r]) { seen[r] = 1; n++; } if (n >= 3 && !done && !gate.on) { done = true; P.track('aha', { id: 'solid-sphere', step: 3 }); P.toast(api.ctx.p3 === 2 ? '你猜對了！' : '球是圓柱的 2/3'); st.append(P.ruleBox('不管 r 多大，<b>圓錐 : 球 : 圓柱 ＝ 1 : 2 : 3</b>。<br>球 ＝ 圓柱的 <b>2/3</b>；這是阿基米德最得意的發現，據說他的墓碑上就刻著「球與外切圓柱」。', '性質')); api.unlock('1 : 2 : 3！'); } }
      st.append(h('div', { class: 'pl-steprow' }, sr.el), ro, P.hint('圓錐：(1/3)·πr²·2r。球：(4/3)πr³。圓柱：πr²·2r。三個式子都有 r³！'));
      api.solve(function () { gate.on = false; [1, 4, 5].forEach(function (v) { r = v; sr.set(v, true); draw(); }); }); draw(); api.lock('先做上面的預測');
    },
    /* 4. 用用看 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      function head(i) { box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 ' + i + ' / 4 題')); }
      var qs = [
        function () { head(1); qfig(box, 'sphere'); box.append(h('div', { class: 'pl-q', html: '球的半徑是 <b>6</b>，體積 ＝ ？π' })); P.numBox(box, { answer: 288, unit: 'π', okMsg: '對！(4/3) × 6³ ＝ (4/3) × 216 ＝ 288，體積 ＝ 288π。', onOk: next, wrong: function () { return '提示：V ＝ (4/3)πr³，r³ ＝ 6 × 6 × 6 ＝ 216。'; } }); },
        function () {
          head(2); qfig(box, 'cyl'); P.choice(box, {}, { id: 'ss2-t2', prompt: '球剛好放進圓柱（半徑 r、高 2r）。<b>圓柱</b>的體積是<b>球</b>的幾倍？', row: true, options: [{ t: '1.5 倍', ok: true, fb: '對！圓柱 2πr³ ÷ 球 (4/3)πr³ ＝ 3/2 ＝ 1.5。' }, { t: '2 倍', fb: '2 倍是「球和圓錐」的比。圓柱 : 球 ＝ 3 : 2。' }, { t: '3 倍', fb: '3 是比例裡的「圓柱」那一份，圓柱 : 圓錐 ＝ 3 : 1。' }], onAnswer: next });
        },
        function () { head(3); qfig(box, 'half'); box.append(h('div', { class: 'pl-q', html: '<b>半球</b>的半徑是 <b>6</b>，體積 ＝ ？π' })); P.numBox(box, { answer: 144, unit: 'π', okMsg: '對！(2/3) × 6³ ＝ (2/3) × 216 ＝ 144，半球 ＝ 144π（是整個球 288π 的一半）。', onOk: next, wrong: function (v) { return v === 288 ? '288π 是整個球，題目是半球。' : '提示：半球 ＝ (2/3)πr³。'; } }); },
        function () { head(4); qfig(box, 'cylcone'); box.append(h('div', { class: 'pl-q', html: '球放進圓柱（r ＝ 3、高 6）。圓柱 ＝ 54π，圓錐（底同圓柱、高 6）＝ 18π。<b>球</b> ＝ ？π<br><small>提示：圓柱 : 球 : 圓錐 的關係</small>' }));
          P.numBox(box, { answer: 36, unit: 'π', okMsg: '對！球 ＝ 圓柱 − 圓錐 ＝ 54π − 18π ＝ 36π（也就是 1 : 2 : 3 裡的「2」）。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-sphere' }); }, wrong: function () { return '提示：圓錐 : 球 : 圓柱 ＝ 1 : 2 : 3，圓錐是 18π，球就是它的 2 倍。'; } }); }];
      qs[0](); api.lock('完成 4 題');
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'solid-sphere', moduleName: '球與圓錐、圓柱的關係', askAbout: '立體幾何與體積', aha: '球 ＝ 圓柱 − 圓錐：<br>每個高度的截面積都相等，體積就相等。',
        cards: [{ text: '球的體積 ＝ (4/3)πr³；圓錐 : 球 : 圓柱（球外切）＝ 1 : 2 : 3', src: '國中、高中「立體圖形的體積」' }, { text: '祖暅原理（卡瓦列里原理）：等高處截面積都相等的兩個立體，體積相等', src: '高中「空間中的體積」與數學史' }],
        depth: { here: 0.3, cheetah: [{ at: 0.5, label: '祖暅原理<br>最大內接圖形' }, { at: 0.9, label: '積分求體積<br>表面積與體積' }] },
        teasers: [
          { title: '祖暅原理與其他立體', q: '同樣的切片想法，還能算出圓錐、四面體、牟合方蓋的體積。', where: '資優班常見的立體幾何延伸（詳細堂次請洽老師）', lv: 'L2' },
          { title: '球的表面積', q: '球的表面積為什麼是 4πr²？它和體積公式有什麼關係？', where: '國中與高中立體幾何延伸（詳細堂次請洽老師）', lv: 'L2' },
          { title: '最大內接圖形', q: '球裡面放圓柱，體積最大是多少？怎麼用 AM-GM 找出最大值？', where: '資優班與競賽的極值問題（詳細堂次請洽老師）', lv: 'L3' },
          { title: '用積分算體積', q: '把切片「一片一片加起來」，就是積分；球與圓錐都是它的特例。', where: '高中選修數學與大學預修（詳細堂次請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子常背了公式卻<b>分不清球和圓錐</b>的係數：球是 <b>4/3</b>、圓錐是 <b>1/3</b>、半球是 <b>2/3</b>；也常忘記球的公式是 <b>r 的三次方</b>，不是平方（平方是表面積）。', place: '國中立體圖形與高中空間概念的基礎，也是積分求體積的起點。', ask: ['球為什麼剛好是圓柱的三分之二？', '半球和「圓柱挖掉圓錐」，在每個高度切開有什麼一樣？', '如果把球的半徑變成 2 倍，體積會變成幾倍？（8 倍，因為是 r 的三次方）'] },
        classes: ['國中、高中「立體圖形的體積」：課綱主題，獵豹班上會系統教並延伸（詳細堂次請洽老師）', '資優班：祖暅原理、最大內接圖形、積分求體積（詳細堂次請洽老師）'] });
    }];
  new P.Lesson({ id: 'solid-sphere', title: '球與圓錐、圓柱的關係', steps: steps });
})();
