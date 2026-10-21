/* 獵豹玩中學｜樹形圖與排隊（宗翰講義 主題1）：一步一步展開，不重複也不遺漏 */
(function () {
  var P = Play, h = P.h, PC = window.PC;
  function badminton(seq) {
    var a = (seq.match(/豹/g) || []).length, b = (seq.match(/翰/g) || []).length, n = seq.length;
    return (n >= 2 && seq.charAt(n - 1) === seq.charAt(n - 2)) || a === 3 || b === 3;
  }
  function firstTo2(seq) { var a = (seq.match(/豹/g) || []).length, b = (seq.match(/翰/g) || []).length; return a === 2 || b === 2; }
  function perms(arr) { if (arr.length <= 1) return [arr.join('')]; var out = []; arr.forEach(function (x, i) { perms(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(function (r) { out.push(x + r); }); }); return out; }

  var steps = [
    /* 1 樹形圖：羽球賽程 */
    function (st, api) {
      var gate = { on: true }, done = false;
      P.choice(st, api, { id: 'ct-p1', predict: true, label: '先猜猜看', prompt: '羽球賽：<b>先連勝兩場</b>或<b>先勝三場</b>的人贏。賽程共有幾種勝負情形？', row: true, options: [{ t: '6 種' }, { t: '10 種' }, { t: '16 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('點黃色虛線圈，一場一場往下分'); } });
      var host = PC.stage(st), pe = P.pill('', 'is-green'), pp = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pe, pp);
      var tree = PC.tree(host, { names: ['豹', '翰'], colors: ['blue', 'pink'], rowH: 24, end: badminton, locked: function () { return gate.on; }, onChange: function (i) {
        pe.textContent = '已結束的賽程：' + i.ended + ' 種'; pp.textContent = i.pending ? '還有 ' + i.pending + ' 個沒展開' : '全部展開了';
        if (!i.pending && !done && !gate.on) { done = true; P.track('aha', { id: 'count-tree', step: 1 }); st.append(P.ruleBox('每一條從「開始」走到<b>金色圈</b>的路，就是一種勝負情形。一共 <b>10 種</b>：豹先贏第 1 場 5 種，翰先 5 種。<br>樹形圖一層一層分，<b>不重複、不遺漏</b>。', '樹形圖')); P.toast(api.ctx.p1 === 1 ? '你猜對了！10 種' : '數出來是 10 種'); api.unlock('樹形圖數出 10 種！'); } } });
      st.append(ro, P.hint('藍＝豹勝、粉紅＝翰勝；金色外圈＝比賽結束。'));
    },
    /* 2 專家思維：只畫一半 ×2 */
    function (st, api) {
      st.append(P.instr('換個角度：只畫<b>第 1 場豹勝</b>這一半，另一半一樣。'));
      var hostA = PC.stage(st), hostB = null, btn = h('button', { type: 'button', class: 'button button--primary pl-small', style: { display: 'none' } }, '把豹和翰對調 ⇄'), done = false, pe = P.pill('', 'is-green'), ro = h('div', { class: 'pl-readout' }, pe), treeB = null;
      var tA = PC.tree(hostA, { start: '豹', names: ['豹', '翰'], colors: ['blue', 'pink'], rowH: 22, end: badminton, onChange: function (i) {
        pe.textContent = '豹先贏：' + i.ended + ' 種' + (i.pending ? '（還有 ' + i.pending + ' 個沒展開）' : '');
        if (!i.pending && !treeB) btn.style.display = '';
      } });
      btn.addEventListener('click', function () {
        if (treeB) return; btn.style.display = 'none'; hostB = PC.stage(st); st.insertBefore(hostB, ro);
        treeB = PC.tree(hostB, { start: '翰', names: ['豹', '翰'], colors: ['blue', 'pink'], rowH: 22, end: badminton }); treeB.expandAll();
        pe.textContent = '豹先 5 ＋ 翰先 5 ＝ 10 種'; pe.className = 'pl-pill is-ok';
        if (!done) { done = true; P.track('aha', { id: 'count-tree', step: 2 }); st.append(P.ruleBox('把豹和翰<b>互換</b>，另一半的樹<b>一模一樣</b>（只是顏色對調）。<br>所以<b>只畫一半、再 × 2</b>：5 × 2 ＝ 10。還能用來檢查樹有沒有漏枝。', '對稱')); api.unlock('只畫一半就夠了！'); }
      });
      st.append(ro, h('div', { class: 'pl-row pl-row--center' }, btn)); api.lock('把這一半展開');
    },
    /* 3 立方體最短路徑 */
    function (st, api) {
      st.append(P.instr('從 <b>A</b> 沿稜線走到 <b>G</b>，走<b>最短</b>的路。點相鄰的頂點前進，找出所有走法。'));
      var host = PC.stage(st), svg = PC.svg(host, 320, 236, 'pl-svg--sm'), g = PC.sv('g', {}); svg.append(g);
      var V = { A: [64, 200], B: [190, 200], C: [248, 160], D: [122, 160], E: [64, 82], F: [190, 82], G: [248, 42], H: [122, 42] };
      var E = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'], hidden = { DA: 1, CD: 1, DH: 1 };
      var adj = {}; 'ABCDEFGH'.split('').forEach(function (c) { adj[c] = []; }); E.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
      var dist = { G: 0, C: 1, F: 1, H: 1, B: 2, D: 2, E: 2, A: 3 }, path = ['A'], found = PC.found(st, { total: 6, label: '已走出' }), pth = P.pill('A', 'is-blue'), fin = false;
      st.append(h('div', { class: 'pl-readout' }, pth));
      function draw() {
        g.innerHTML = '';
        E.forEach(function (e) { g.append(PC.sv('line', { x1: V[e[0]][0], y1: V[e[0]][1], x2: V[e[1]][0], y2: V[e[1]][1], class: 'pl-line', style: hidden[e] ? 'stroke:#c5bba3;stroke-width:2;stroke-dasharray:4 5' : 'stroke:#6d6250;stroke-width:2.5;stroke-dasharray:none' })); });
        for (var i = 0; i + 1 < path.length; i++) g.append(PC.sv('line', { x1: V[path[i]][0], y1: V[path[i]][1], x2: V[path[i + 1]][0], y2: V[path[i + 1]][1], class: 'pl-line pl-line--green pl-line--bold' }));
        var cur = path[path.length - 1];
        Object.keys(V).forEach(function (k) {
          var can = !fin && adj[cur].indexOf(k) >= 0, gr = PC.sv('g', { class: can ? 'pc-tap' : '' }); gr.addEventListener('click', function () { go(k); });
          gr.append(PC.sv('circle', { cx: V[k][0], cy: V[k][1], r: 22, fill: 'transparent' }), PC.sv('circle', { cx: V[k][0], cy: V[k][1], r: 13, class: k === cur ? 'pc-c pc-c--green' : k === 'G' ? 'pc-c pc-c--pink' : can ? 'pc-c pc-c--amber' : 'pc-c pc-c--navy', stroke: '#fff', 'stroke-width': 2 }), PC.text(V[k][0], V[k][1] + 1, k, 13, 'pc-tw')); g.append(gr);
        });
        pth.textContent = path.join(' → ');
      }
      function go(k) {
        if (fin) return; var cur = path[path.length - 1];
        if (adj[cur].indexOf(k) < 0) { P.toast('要沿著稜線，走到相鄰的頂點'); return; }
        if (dist[k] >= dist[cur]) { P.toast('這樣會繞遠路；最短路徑每一步都要更靠近 G'); return; }
        path.push(k); draw();
        if (k === 'G') { fin = true; var key = path.join(''), isNew = found.add(key, path.join('→')); P.toast(isNew ? '找到一條新的！' : '這條走過了'); setTimeout(function () { path = ['A']; fin = false; draw(); check(); }, 900); }
      }
      function check() {
        if (found.count >= 6 && !st.querySelector('.pl-rule')) {
          P.track('aha', { id: 'count-tree', step: 3 });
          st.append(PC.boxes(st, [{ n: 3, label: '第 1 步', cls: 'is-blue' }, { n: 2, label: '第 2 步', cls: 'is-pink' }, { n: 1, label: '第 3 步', cls: 'is-green' }]).el, P.ruleBox('A 的鄰點 B、D、E，G 的鄰點 C、F、H 沒有共同點，所以至少走 <b>3 步</b>。<br>第 1 步 3 種、第 2 步 2 種、第 3 步 1 種：<b>3 × 2 × 1 ＝ 6</b>（乘法原理）。', '樹形圖'));
          api.unlock('6 條全找到了！');
        }
      }
      draw(); api.lock('找出 6 條最短路徑');
    },
    /* 4 n 人排隊 */
    function (st, api) {
      var gate = { on: true }, visited = {}, names = '甲乙丙丁戊'.split('');
      P.choice(st, api, { id: 'ct-p4', predict: true, label: '先猜猜看', prompt: '3 個人排隊有 6 種。那 <b>4 個人</b>排隊有幾種？', row: true, options: [{ t: '8 種' }, { t: '12 種' }, { t: '24 種' }], onAnswer: function (i) { api.ctx.p4 = i; gate.on = false; api.lock('按 ＋ 增加人數'); } });
      var bx = PC.boxes(st, []), list = h('div', { class: 'pc-found' }), cap = h('div', { class: 'pl-caption' });
      function draw(n) {
        var items = []; for (var i = n; i >= 1; i--) items.push({ n: i, label: '第 ' + (n - i + 1) + ' 位' }); bx.set(items);
        list.innerHTML = ''; if (n <= 4) perms(names.slice(0, n)).forEach(function (p) { list.append(PC.chip(p)); }); else list.append(h('span', { class: 'pc-note' }, '120 種太多，不列了：5 × 4 × 3 × 2 × 1'));
        cap.innerHTML = n >= 2 ? n + ' 人排隊 ＝ 第 1 位有 ' + n + ' 種 × 剩下 ' + (n - 1) + ' 人排隊 ' + (n - 1 >= 2 ? '（' + PC.fact(n - 1) + ' 種）' : '') : '1 個人只有 1 種排法';
      }
      var stp = P.stepper('人數', 1, 5, 3, function (v) {
        if (gate.on) { stp.set(3, true); draw(3); return; } visited[v] = 1; draw(v);
        if (visited[4] && visited[5] && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-tree', step: 4 }); st.append(P.ruleBox('n 個人排隊 ＝ <b>n × (n−1) × … × 2 × 1</b>，記作 <b>n！</b>（n 階乘）。<br>3 人 6 種、4 人 24 種、5 人 120 種。', '階乘')); P.toast(api.ctx.p4 === 2 ? '你猜對了！24 種' : '4 人排隊是 24 種'); api.unlock('階乘看懂了！'); }
      }, function (v) { return v + ' 人'; });
      st.append(stp.el, list, cap); draw(3); api.lock('先做上面的預測');
    },
    /* 5 換個外觀 */
    function (st, api) {
      PC.quiz(st, api, 'count-tree', [
        function (box, done) {
          var bx = PC.boxes(box, [1, 2, 3, 4, 5].map(function (i) { return { n: '？', label: '第 ' + i + ' 位' }; }), { result: false }); bx.el.classList.add('pc-boxes--tight');
          PC.num(box, '甲、乙、丙、丁、戊 5 個人排成一列，每個位置依序選人，共有幾種排法？', 120, done, '對！5 × 4 × 3 × 2 × 1 ＝ 5！＝ 120。', function () { return '提示：第 1 位 5 種，第 2 位剩 4 種……全部連乘。'; });
        },
        function (box, done) {
          box.append(h('div', { class: 'pl-q', html: '改規則：<b>先勝 2 場</b>的人贏（最多 3 場）。點開下面的樹，數一數有幾種勝負情形？' }));
          var host = PC.stage(box); PC.tree(host, { names: ['豹', '翰'], colors: ['blue', 'pink'], rowH: 26, end: firstTo2, cls: 'pl-svg--sm' });
          P.numBox(box, { answer: 6, okMsg: '對！豹先贏第 1 場 3 種（豹豹、豹翰豹、豹翰翰），翰先同樣 3 種，共 6 種。', onOk: done, wrong: function () { return '提示：每個金色圈是一種；豹先與翰先各有幾個？'; } });
        },
        function (box, done) {
          var found = PC.found(box, { label: '已排出' }), row = h('div', { class: 'pc-btnrow' }), cur = h('div', { class: 'pc-btnrow' }), btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '隨機排一列');
          box.append(h('div', { class: 'pl-q', html: '從 A 走到 G：要「<b>右</b>」2 次、「<b>後</b>」1 次、「<b>下</b>」1 次，不多不少。把這 4 個動作排成一列，有幾種排法？' }), cur, btn);
          btn.addEventListener('click', function () { var a = PC.shuffle(['右', '右', '後', '下']); cur.innerHTML = ''; a.forEach(function (t) { cur.append(PC.chip(t, t === '右' ? 'is-blue' : t === '後' ? 'is-amber' : 'is-pink')); }); found.add(a.join('')); });
          P.numBox(box, { answer: 12, okMsg: '對！4 個位置選 2 個放「右」，再排後、下：4！÷ 2！＝ 12。', onOk: done, wrong: function (v) { return v === 24 ? '兩個「右」一樣，互換不算新的排法，24 要除掉重複。' : '提示：先按幾次「隨機排一列」看看，4 個動作全排是 24，但兩個「右」是一樣的。'; } });
        }
      ]);
    },
    /* 6 完成 */
    function (st) {
      P.complete(st, {
        id: 'count-tree', moduleName: '樹形圖與排隊', askAbout: '國小高年級的計數與樹形圖', aha: '一層一層分下去，不重複也不遺漏；<br>排隊就是一步一步連乘。',
        cards: [{ text: '樹形圖：把事情一步一步分，數到「結束」的路徑就是方法數', src: '宗翰講義「基本計數／排組原理」主題 1' }, { text: 'n 個人排隊有 n！種；最短路徑 ＝ 把方向動作排成一列', src: '宗翰講義 主題 1（說例 2、3）' }],
        depth: { here: 0.14, cheetah: [{ at: 0.45, label: '換個說法<br>變成排隊' }, { at: 0.85, label: '遞迴<br>一一對應' }] },
        teasers: [
          { title: '最短路徑＝排列有重複', q: '右 a 次、後 b 次、下 c 次，最短路徑數 ＝ (a＋b＋c)！÷ (a！b！c！)，為什麼？', where: '宗翰講義 主題 1（專家思維）', lv: 'L2' },
          { title: '先連勝兩場的賽程：只畫一半', q: '用「限制條件＋對稱」不畫完整棵樹，一眼看出 10 種。', where: '宗翰講義 主題 1 說例 1', lv: 'L2' },
          { title: '字典排列', q: '把所有排列按字典順序列出來，第 k 個是什麼？', where: 'PK1A（2607）第 6 堂「字典排列」', lv: 'L2' },
          { title: '遞迴與計數', q: '青蛙跳石塊：aₙ ＝ 4ⁿ⁻¹ − aₙ₋₁，不用畫樹也能算到第 6 跳。', where: '宗翰講義 主題 3 說例 3', lv: 'L3' }],
        parent: { pitfall: '孩子常常用「一條一條列」的方法，列到一半就漏掉或重複；也不知道什麼時候可以用乘法。樹形圖的意義是讓「分類」有順序。', place: '小學高年級到國中的計數基礎，是排列、組合、機率的起點。', ask: ['這棵樹每一層在做什麼決定？', '為什麼 4 個人排隊是 4 × 3 × 2 × 1？', '兩個「右」一樣的時候，排法為什麼要除以 2？'] },
        classes: ['宗翰講義：基本計數／排組原理（主題 1 樹形圖）', 'PK1A（2607）：字典排列、整數分拆'],
        next: { href: 'play-count-multiply.html', text: '下一個：乘法原理' } });
    }];
  new P.Lesson({ id: 'count-tree', title: '樹形圖與排隊', steps: steps });
})();
