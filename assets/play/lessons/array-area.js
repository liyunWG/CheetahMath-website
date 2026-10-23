/* 獵豹玩中學｜乘法是陣列與面積
   點排成長方形陣列：幾排 × 每排幾個。轉 90° 是行列互換（乘法可交換）；正方形陣列是平方數，一圈一圈加上去是 1＋3＋5＋…；
   用一刀把陣列切開就是分配律；大正方形切成四塊就是 (a＋b)² ＝ a²＋2ab＋b²。 */
(function () {
  var P = Play, h = P.h;
  var BLUE = '47,111,220', PINK = '214,51,108', AMBER = '210,155,31', GREEN = '31,157,85';
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function rgba(c, a) { return 'rgba(' + c + ',' + a + ')'; }

  /* 點陣畫板：每一格有一個點和一個方格（面積），依陣列範圍與顏色顯示。cell(i, j)：第 i 欄、第 j 列（從下往上）。 */
  function arrayBoard(host, w, hh, o) {
    var b = new P.Board(host, { w: w, h: hh }), dots = [], sqs = [], i, j, area = false, last = null, ox = (o && o.ox) || 0, oy = (o && o.oy) || 0;
    for (i = 0; i < w; i++) { dots[i] = []; sqs[i] = []; }
    for (i = 0; i < w; i++) for (j = 0; j < hh; j++) {
      sqs[i][j] = h('rect', { x: i, y: b.Y(j + 1), width: 1, height: 1, class: 'ca-sq', 'stroke-width': 0.06 }); sqs[i][j].style.display = 'none'; b.gMid.append(sqs[i][j]);
    }
    for (i = 0; i < w; i++) for (j = 0; j < hh; j++) {
      dots[i][j] = h('circle', { cx: i + 0.5, cy: b.Y(j + 0.5), r: 0.27, class: 'ca-dot' }); dots[i][j].style.display = 'none'; b.gMid.append(dots[i][j]);
    }
    /* colorOf(i, j) 回傳 RGB 字串（如 BLUE），或 null 表示這格沒有；範圍 cols×rows 之外一律不畫 */
    function paint(cols, rows, colorOf) {
      last = [cols, rows, colorOf];
      for (i = 0; i < w; i++) for (j = 0; j < hh; j++) {
        var c = (i < cols && j < rows) ? colorOf(i, j) : null, d = dots[i][j], s = sqs[i][j];
        d.style.display = (c && !area) ? '' : 'none'; s.style.display = (c && area) ? '' : 'none';
        if (c) { d.style.fill = rgba(c, 0.9); s.style.fill = rgba(c, 0.38); s.style.stroke = rgba(c, 0.95); }
      }
    }
    return { b: b, paint: paint, setArea: function (v) { area = v; if (last) paint(last[0], last[1], last[2]); }, isArea: function () { return area; } };
  }
  function areaSwitch(host, ab) {
    var btn = h('button', { type: 'button', class: 'pl-chipbtn', 'aria-pressed': 'false' }, '▦ 把點換成方格（面積）');
    btn.addEventListener('click', function () { var on = !ab.isArea(); ab.setArea(on); btn.classList.toggle('is-on', on); btn.setAttribute('aria-pressed', on); btn.textContent = on ? '● 換回點' : '▦ 把點換成方格（面積）'; P.track('area_toggle', { on: on }); });
    host.append(btn); return btn;
  }

  var steps = [
    /* 1. 12 個點排成長方形：行列互換 */
    function (st, api) {
      var gate = { on: true }, c = 2, r = 2, TG = [[1, 12], [2, 6], [3, 4], [4, 3], [6, 2], [12, 1]], found = {}, nf = 0, fin = false, hd;
      P.choice(st, api, { id: 'aa-p1', predict: true, label: '先猜猜看', prompt: '12 個點排成長方形：「<b>3 排，每排 4 個</b>」和「<b>4 排，每排 3 個</b>」，點數一樣嗎？', row: true, options: [{ ok: true, t: '一樣多' }, { t: '3 排的比較多' }, { t: '4 排的比較多' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動右上角，排出 12 個點'); } });
      st.append(P.instr('拖動右上角的點，改變陣列。把<b>剛好 12 個點</b>的長方形<b>每一種排法</b>都找出來（幾排 × 每排幾個）。'));
      var host = stage(st), ab = arrayBoard(host, 12, 12), b = ab.b, rim = b.poly([[0, 0], [1, 0], [1, 1], [0, 1]], 'pl-poly pl-poly--blue');
      var p1 = P.pill('', 'is-blue'), p2 = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, p1, p2), chips = {}, cr = h('div', { class: 'pl-readout' });
      TG.forEach(function (t) { var k = t[0] + '×' + t[1]; chips[k] = P.pill(k, ''); cr.append(chips[k]); });
      var row = h('div', { class: 'pl-row pl-row--center' }), sw = h('button', { type: 'button', class: 'pl-chipbtn' }, '↻ 轉 90°（行列互換）'); row.append(sw);
      sw.addEventListener('click', function () { if (!gate.on) hd.moveTo([r, c]); });
      st.append(ro, cr, row); var as = areaSwitch(row, ab);
      function draw() {
        var n = r * c; ab.paint(c, r, function () { return BLUE; }); b.setPoly(rim, [[0, 0], [c, 0], [c, r], [0, r]]);
        p1.textContent = r + ' 排 × 每排 ' + c + ' 個'; p2.className = 'pl-pill' + (n === 12 ? ' is-ok' : ''); p2.textContent = '＝ ' + n + ' 個';
        var k = r + '×' + c; if (n === 12 && chips[k] && !found[k]) { found[k] = 1; nf++; chips[k].className = 'pl-pill is-ok'; chips[k].textContent = '✓ ' + k; P.toast(r + ' 排 × 每排 ' + c + ' 個：12 個'); }
        if (nf >= TG.length && !fin) { fin = true; P.track('aha', { id: 'array-area', step: 1 }); st.append(P.ruleBox('<b>3 × 4</b> 和 <b>4 × 3</b> 只是把陣列<b>轉 90°</b>，點數沒變：<b>乘法可以交換</b>。<br>12 的所有排法 ＝ 12 的<b>因數配對</b>：1×12、2×6、3×4、4×3、6×2、12×1。<br>把點換成方格，點數就是<b>面積</b>。', '乘法＝陣列＝面積')); api.unlock('全部找到了！'); }
      }
      var cand = []; for (var i = 1; i <= 12; i++) for (var j = 1; j <= 12; j++) cand.push([i, j]);
      hd = b.handle({ pos: [c, r], candidates: cand, disabled: function () { return gate.on; }, onMove: function (t) { c = t[0]; r = t[1]; draw(); } });
      api.solve(function () { gate.on = false; TG.forEach(function (t) { hd.moveTo([t[1], t[0]]); }); }); draw();
      st.append(P.hint('提示：先試試 3 排 4 個，再按「轉 90°」。1 排 12 個也算一種喔。')); api.lock('先做上面的預測');
    },
    /* 2. 正方形陣列：平方數與一圈一圈的 L */
    function (st, api) {
      var T = [{ t: '排出 <b>36</b> 個點的正方形', ok: function (n) { return n * n === 36; }, n: 6 }, { t: '讓最外面那一圈剛好是 <b>15</b> 個點', ok: function (n) { return 2 * n - 1 === 15; }, n: 8 }, { t: '排出「比 80 大」的<b>第一個</b>正方形', ok: function (n) { return n * n === 81; }, n: 9 }], ti = 0, info = h('div', { class: 'pl-q' });
      st.append(info); var host = stage(st), ab = arrayBoard(host, 12, 12), b = ab.b, n = 3;
      var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', 'is-amber'); st.append(h('div', { class: 'pl-readout' }, p1, p2, p3));
      var row = h('div', { class: 'pl-row pl-row--center' }); st.append(row); areaSwitch(row, ab);
      var rim = b.poly([[0, 0], [1, 0], [1, 1], [0, 1]], 'pl-poly pl-poly--ghost');
      function txt() { info.innerHTML = '拖動右上角的點，讓它保持<b>正方形</b>。' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
      function draw() {
        ab.paint(n, n, function (i, j) { return Math.max(i, j) % 2 ? PINK : BLUE; }); b.setPoly(rim, [[0, 0], [n, 0], [n, n], [0, n]]);
        var seq = [], s = 0; for (var k = 1; k <= n; k++) { seq.push(2 * k - 1); s += 2 * k - 1; }
        p1.textContent = n + ' × ' + n + ' ＝ ' + n * n; p2.textContent = '最外圈 ' + (2 * n - 1) + ' 個'; p3.textContent = seq.join(' ＋ ') + ' ＝ ' + s;
        if (ti < T.length && T[ti].ok(n)) { ti++; if (ti >= T.length) { P.track('aha', { id: 'array-area', step: 2 }); P.toast('正方形一圈一圈加：1、3、5、7…'); st.append(P.ruleBox('正方形陣列的點數叫<b>平方數</b>：1、4、9、16、25…<br>每多一圈，多的是一個 <b>L 形</b>：<b>1 ＋ 3 ＋ 5 ＋ 7 ＋ … ＝ n²</b>。', '平方數')); api.unlock('發現平方數！'); } else { P.toast('✓ 找到了，下一個'); txt(); } }
      }
      var cand = []; for (var k = 1; k <= 11; k++) cand.push([k, k]);
      var hd = b.handle({ pos: [3, 3], candidates: cand, onMove: function (t) { n = t[0]; draw(); } });
      api.solve(function () { while (ti < T.length) hd.moveTo([T[ti].n, T[ti].n]); }); txt(); draw();
      st.append(P.hint('顏色一圈藍、一圈粉紅，看看最外面那一圈有幾個。')); api.lock('完成 3 個目標');
    },
    /* 3. 三個操作關卡：一刀切開陣列（分配律） */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function level(cols, rows, goal, hint, msg) {
        return function (b0, done, setSolve) {
          var info = h('div', { class: 'pl-q', html: '這是 <b>' + cols + ' × ' + rows + '</b> 的陣列（' + rows + ' 排，每排 ' + cols + ' 個）。拖動剪刀切開它，' + goal.t + '。' }), host = h('div', { class: 'pl-stage' }), fin = false;
          b0.append(info, host); var ab = arrayBoard(host, 12, 9), b = ab.b, s = 1;
          var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', ''), cutL = b.line([1, 0], [1, rows], 'pl-line pl-line--dash');
          var arow = h('div', { class: 'pl-row pl-row--center' }); b0.append(h('div', { class: 'pl-readout pl-readout--col' }, p1, p2, p3), arow); areaSwitch(arow, ab);
          function draw() {
            ab.paint(cols, rows, function (i) { return i < s ? BLUE : PINK; }); b.setLine(cutL, [s, -0.1], [s, rows + 0.1]);
            var L = s * rows, Rr = (cols - s) * rows;
            p1.textContent = s + ' × ' + rows + ' ＝ ' + L; p2.textContent = (cols - s) + ' × ' + rows + ' ＝ ' + Rr; p3.textContent = cols + ' × ' + rows + ' ＝ ' + L + ' ＋ ' + Rr + ' ＝ ' + (L + Rr);
            if (goal.ok(s) && !fin) { fin = true; P.toast(msg); done(); }
          }
          var cand = []; for (var k = 1; k < cols; k++) cand.push([k, rows + 0.65]);
          var hd = b.handle({ pos: cand[0], candidates: cand, onMove: function (t) { s = t[0]; draw(); } }); b.text([-0.2, rows + 0.45], '✂', 'pl-text');
          setSolve(function () { hd.moveTo([goal.s, rows + 0.65]); }); draw(); b0.append(P.hint(hint));
        };
      }
      var tasks = [
        level(12, 7, { t: '讓左邊那塊的寬剛好是<b>整十</b>', ok: function (s) { return s === 10; }, s: 10 }, '12 × 7 不好心算；整十的那一塊好算多了，剩下的一小塊也好算。', '12 × 7 ＝ 10 × 7 ＋ 2 × 7 ＝ 70 ＋ 14 ＝ 84'),
        level(11, 8, { t: '讓左邊那塊剛好是 <b>40</b> 個點', ok: function (s) { return s * 8 === 40; }, s: 5 }, '左邊那塊有 8 排，每排 s 個。哪個 s 乘 8 是 40？', '11 × 8 ＝ 5 × 8 ＋ 6 × 8 ＝ 40 ＋ 48 ＝ 88'),
        level(12, 6, { t: '讓左右兩塊<b>一樣多</b>', ok: function (s) { return s === 6; }, s: 6 }, '兩塊一樣大，每塊各占全部的幾分之幾？', '12 × 6 ＝ 6 × 6 ＋ 6 × 6 ＝ 36 ＋ 36 ＝ 72')];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { P.track('aha', { id: 'array-area', step: 3 }); box.append(P.ruleBox('把陣列切開，兩塊的點數加起來等於全部：<b>(a ＋ b) × c ＝ a × c ＋ b × c</b>。<br>這就是<b>分配律</b>，也是橫式心算「拆成整十」的原理。', '分配律')); api.unlock('分配律！'); } });
    },
    /* 4. 大正方形切成四塊：(a＋b)² */
    function (st, api) {
      var T = [{ t: '讓 a² ＋ b² ＝ <b>58</b>', v: 58, a: 3 }, { t: '讓 a² ＋ b² ＝ <b>52</b>', v: 52, a: 4 }, { t: '讓 a² ＋ b² ＝ <b>50</b>', v: 50, a: 5 }], ti = 0, info = h('div', { class: 'pl-q' }), a = 3;
      st.append(info); var host = stage(st), ab = arrayBoard(host, 12, 12), b = ab.b, OFF = 1;
      var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', 'is-amber'), tx = [b.text([0, 0], '', 'pl-text pl-text--sm'), b.text([0, 0], '', 'pl-text pl-text--sm'), b.text([0, 0], '', 'pl-text pl-text--sm'), b.text([0, 0], '', 'pl-text pl-text--sm')];
      var cutV = b.line([0, 0], [0, 0], 'pl-line pl-line--dash'), cutH = b.line([0, 0], [0, 0], 'pl-line pl-line--dash');
      st.append(h('div', { class: 'pl-readout pl-readout--col' }, p1, p2, p3)); var row = h('div', { class: 'pl-row pl-row--center' }); st.append(row); areaSwitch(row, ab);
      function txt() { info.innerHTML = '一個 <b>10 × 10</b> 的大正方形，被切成四塊。拖動中間的點，' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
      var la = b.text([0, 0], '', 'pl-text pl-text--blue'), lb = b.text([0, 0], '', 'pl-text pl-text--pink');
      function draw() {
        var bb = 10 - a, q = a * a, w = bb * bb, m = a * bb;
        ab.paint(10 + OFF, 10 + OFF, function (i, j) { if (i < OFF || j < OFF) return null; var x = i - OFF, y = j - OFF; return (x < a && y < a) ? BLUE : (x >= a && y >= a) ? PINK : AMBER; });
        b.setLine(cutV, [OFF + a, OFF - 0.1], [OFF + a, OFF + 10.1]); b.setLine(cutH, [OFF - 0.1, OFF + a], [OFF + 10.1, OFF + a]);
        b.setText(tx[0], [OFF + a / 2, OFF + a / 2 - 0.2], a >= 2 ? 'a²＝' + q : ''); b.setText(tx[1], [OFF + a + bb / 2, OFF + a + bb / 2 - 0.2], bb >= 2 ? 'b²＝' + w : ''); b.setText(tx[2], [OFF + a + bb / 2, OFF + a / 2 - 0.2], 'ab＝' + m); b.setText(tx[3], [OFF + a / 2, OFF + a + bb / 2 - 0.2], 'ab＝' + m);
        b.setText(la, [OFF + a / 2, OFF - 0.6], 'a ＝ ' + a); b.setText(lb, [OFF + a + bb / 2, OFF - 0.6], 'b ＝ ' + bb);
        p1.textContent = 'a² ＋ b² ＝ ' + q + ' ＋ ' + w + ' ＝ ' + (q + w); p2.textContent = '兩塊 ab ＝ 2 × ' + m + ' ＝ ' + 2 * m; p3.textContent = '全部 ＝ ' + (q + w) + ' ＋ ' + 2 * m + ' ＝ 100';
        if (ti < T.length && q + w === T[ti].v) { ti++; if (ti >= T.length) { P.track('aha', { id: 'array-area', step: 4 }); P.toast('(a＋b)² ＝ a²＋2ab＋b²'); st.append(P.ruleBox('大正方形的邊長是 <b>a ＋ b</b>，面積 ＝ 四塊加起來：<br><b>(a ＋ b)² ＝ a² ＋ 2ab ＋ b²</b>。<br>所以 (a＋b)² 一定比 a²＋b² <b>多出兩塊 ab</b>；當 a ＝ b ＝ 5 時 a²＋b² 最小。', '乘法公式的種子')); api.unlock('看見 (a＋b)²！'); } else { P.toast('✓ 找到了，下一個'); txt(); } }
      }
      var cand = []; for (var k = 1; k <= 9; k++) cand.push([OFF + k, OFF + k]);
      var hd = b.handle({ pos: [OFF + 3, OFF + 3], candidates: cand, onMove: function (t) { a = Math.round(t[0] - OFF); draw(); } });
      api.solve(function () { while (ti < T.length) hd.moveTo([OFF + T[ti].a, OFF + T[ti].a]); }); txt(); draw();
      st.append(P.hint('a 和 b 加起來永遠是 10。兩個數字交換，a² ＋ b² 會變嗎？')); api.lock('完成 3 個目標');
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'array-area', moduleName: '乘法是陣列與面積', askAbout: '小學的乘法、平方數與面積', aha: '乘法就是把東西排成長方形陣列；<br>點換成方格就是面積，切開它就是分配律。',
        cards: [{ text: '乘法 ＝ 幾排 × 每排幾個；轉 90° 點數不變，所以 a × b ＝ b × a', src: '國小「乘法」（國小數學課綱）' }, { text: '長方形面積 ＝ 長 × 寬；(a ＋ b) × c ＝ a × c ＋ b × c（分配律）', src: '國小「面積」與「分配律」' }],
        depth: { here: 0.08, cheetah: [{ at: 0.38, label: '完全平方數<br>方陣問題' }, { at: 0.84, label: '乘法公式<br>(a＋b)² 與配方' }] },
        teasers: [
          { title: '完全平方數', q: '1、4、9、16… 為什麼叫「正方形數」？一個數有幾個因數，和它是不是平方數有什麼關係？', where: 'PK2A 2507 第 24 堂；PI2A 2507 第 20 堂、2607 第 4 堂：完全平方數', lv: 'L2' },
          { title: '方陣問題', q: '把棋子排成實心、空心正方形，每邊幾個、最外圈幾個、全部幾個——一次算清楚。', where: 'PK2B 2512 第 6 堂；PI2B 2512 第 4 堂：方陣問題', lv: 'L2' },
          { title: '乘法公式', q: '(a ＋ b)² ＝ a² ＋ 2ab ＋ b² 為什麼對？把大正方形切成四塊，用面積就看得出來。', where: 'J72A 2601 第 20–25 堂：乘法公式', lv: 'L2' }],
        parent: { pitfall: '孩子容易把「<b>幾排 × 每排幾個</b>」說反，其實只要會轉 90°，答案一樣；另外也常把<b>平方</b>（n × n）和<b>乘以 2</b>（n × 2）搞混。', place: '小學中年級乘法的圖像基礎，之後的面積、平方數、分配律心算、乘法公式都建立在這張圖上。', ask: ['3 排每排 4 個，和 4 排每排 3 個，為什麼一樣多？', '為什麼 25 叫「正方形數」？下一個正方形數是多少，要加幾個點？', '12 × 7 怎麼拆成兩個好算的乘法？'] },
        classes: ['PK2A（2507 第 24 堂）：完全平方數', 'PI2A（2507 第 20 堂；2607 第 4 堂）：完全平方數', 'PK2B（2512 第 6 堂）、PI2B（2512 第 4 堂）：方陣問題', 'J72A（2601 第 20–25 堂）：乘法公式'],
        next: { href: 'play-multiplication.html', text: '下一個：乘法公式的圖解' } });
    }];
  new P.Lesson({ id: 'array-area', title: '乘法是陣列與面積', steps: steps });
})();
