/* 獵豹玩中學｜排列（宗翰講義 主題7）：名額依序分給人／位置；相鄰綁塊、不相鄰扣除或插空 */
(function () {
  var P = Play, h = P.h, PC = window.PC, sv = PC.sv, PEOPLE = '甲乙丙丁戊己庚'.split('');

  var steps = [
    /* 1 P(n,k)：挑人排座位 */
    function (st, api) {
      var gate = { on: true };
      P.choice(st, api, { id: 'cp-p1', predict: true, label: '先猜猜看', prompt: '甲乙丙丁戊 5 個人，選 3 個人排成一列（有先後順序）。共有幾種排法？', row: true, options: [{ t: '10 種' }, { t: '60 種' }, { t: '125 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('點人，依序填進座位；排出 5 種'); } });
      var seats = [], total = 3, pool = h('div', { class: 'pc-tabs' }), seatRow = h('div', { class: 'pc-seatrow' }), found = PC.found(st, { label: '已排出' }), bx = PC.boxes(st, [{ n: 5, label: '第 1 位', cls: 'is-blue' }, { n: 4, label: '第 2 位', cls: 'is-pink' }, { n: 3, label: '第 3 位', cls: 'is-green' }], { result: false }), chips = [];
      PEOPLE.slice(0, 5).forEach(function (p) { var b = h('button', { type: 'button', class: 'pc-tab' }, p); b.addEventListener('click', function () { pick(p, b); }); chips.push(b); pool.append(b); });
      function drawSeats() {
        seatRow.innerHTML = ''; for (var i = 0; i < total; i++) { var s = h('button', { type: 'button', class: 'pc-seatbtn' + (seats[i] ? ' is-on' : '') }, seats[i] || '座' + (i + 1)); (function (i) { s.addEventListener('click', function () { if (gate.on) return; if (seats[i] && i === seats.length - 1) { unpick(); } }); })(i); seatRow.append(s); }
        chips.forEach(function (b) { b.disabled = seats.indexOf(b.textContent) >= 0; b.style.opacity = b.disabled ? .35 : 1; });
        var items = [5, 4, 3].map(function (n, i) { return { n: n, label: '第 ' + (i + 1) + ' 位', cls: ['is-blue', 'is-pink', 'is-green'][i] + (i < seats.length ? ' is-set' : '') }; }); bx.set(items, gate.on || found.count < 5 ? false : 60);
      }
      function pick(p) { if (gate.on) { P.toast('先做上面的預測'); return; } if (seats.indexOf(p) >= 0 || seats.length >= total) return; seats.push(p); drawSeats();
        if (seats.length === total) { var key = seats.join(''); found.add(key); setTimeout(function () { seats = []; drawSeats(); check(); }, 700); } }
      function unpick() { seats.pop(); drawSeats(); }
      function check() { if (found.count >= 5 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-perm', step: 1 }); drawSeats(); st.append(P.ruleBox('排 3 個位子：第 1 位 5 種人可選，第 2 位剩 4 人，第 3 位剩 3 人：<b>5 × 4 × 3 ＝ 60</b>。<br>這叫<b>排列</b>：從 n 個選 k 個並排順序，<b>P(n, k) ＝ n × (n−1) × … 共 k 個數</b>相乘。', '排列')); P.toast(api.ctx.p1 === 1 ? '你猜對了！60 種' : '60 種'); api.unlock('60 種！'); } }
      api.solve(function () { gate.on = false; ['甲乙丙', '甲乙丁', '甲乙戊', '甲丙乙', '甲丙丁'].forEach(function (k) { found.add(k); }); seats = []; check(); });
      st.append(seatRow, pool); drawSeats(); api.lock('先做上面的預測');
    },
    /* 2 三種說法都是 5×4×3 */
    function (st, api) {
      var visited = {}, scenes = [
        { t: '3 人選座位', d: '甲乙丙 3 個人上公車，有 5 個空位，<b>每人選一個座位</b>。', who: ['甲', '乙', '丙'], what: '每人 5 → 4 → 3 個座位可選', boxes: [5, 4, 3], lab: ['甲選', '乙選', '丙選'] },
        { t: '5 人搶 3 座位', d: '5 個人上車，只有 3 個空位，<b>選 3 人入座</b>（三個座位不同）。', who: ['座位1', '座位2', '座位3'], what: '每個座位依序選人', boxes: [5, 4, 3], lab: ['位1', '位2', '位3'] },
        { t: '3 件獎品給 5 人', d: '不同的獎品 A、B、C 分給 5 個人，<b>每人至多一件</b>。', who: ['A', 'B', 'C'], what: '每件獎品依序選得主', boxes: [5, 4, 3], lab: ['A 給', 'B 給', 'C 給'] }];
      st.append(P.instr('下面三個故事，看起來不一樣。點一點，看看<b>各有幾種</b>。'));
      var tabsHost = h('div', {}), card = h('div', { class: 'pc-scene' }), bxHost = h('div', {}), q = h('div', {}), asked = false, bx; st.append(tabsHost, card, bxHost, q); bx = PC.boxes(bxHost, []);
      var tabs = PC.tabs(tabsHost, scenes.map(function (s) { return { t: s.t }; }), function (i) {
        var s = scenes[i]; visited[i] = 1; card.innerHTML = ''; card.append(h('div', { class: 'pl-q', html: s.d }), h('div', { class: 'pc-who' }, s.who.map(function (w) { return PC.chip(w, 'is-pink'); })), h('div', { class: 'pc-note' }, s.what));
        bx.set(s.boxes.map(function (n, k) { return { n: n, label: s.lab[k], cls: ['is-blue', 'is-pink', 'is-green'][k] }; })); check();
      }, 0);
      function check() { if (Object.keys(visited).length === 3 && !asked) { asked = true; var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '三個故事的種數<b>都一樣</b>。是幾種？' })); P.numBox(qb, { answer: 60, okMsg: '對！都是 5 × 4 × 3 ＝ 60。', onOk: function () { P.track('aha', { id: 'count-perm', step: 2 }); setTimeout(function () { qb.style.display = 'none'; }, 1400); st.append(P.ruleBox('三個故事的結構一樣：把 <b>3 個不同的「名額」</b>依序分給 5 個不同的人（或位置），不能重複使用，所以都是 <b>5 × 4 × 3</b>。<br>數的是「誰坐哪一個位子、誰領哪一件獎品」；若只問「選出哪三人」就不一樣了（那是組合）。', '同一種結構')); api.unlock('三種說法，同一個答案！'); } }); } }
      api.solve(function () { tabs.pick(1); tabs.pick(2); });
      api.lock('三個故事都點一遍');
    },
    /* 3 相鄰：綁成一塊 */
    function (st, api) {
      var gate = { on: true };
      P.choice(st, api, { id: 'cp-p3', predict: true, label: '先猜猜看', prompt: '甲乙丙丁戊 5 人排成一列，<b>甲、乙必須相鄰</b>。共有幾種排法？', row: true, options: [{ t: '24 種' }, { t: '48 種' }, { t: '120 種' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('按「綁成一塊」'); } });
      var bound = false, flip = false, rowEl = h('div', { class: 'pc-people' }), cap = h('div', { class: 'pl-caption' }), q = h('div', {}), asked = false, btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '把甲乙綁成一塊'), swap = h('button', { type: 'button', class: 'button button--secondary pl-small', style: { display: 'none' } }, '塊內交換 ⇄'), bx = PC.boxes(st, []);
      function draw() {
        rowEl.innerHTML = ''; if (!bound) { PEOPLE.slice(0, 5).forEach(function (p) { rowEl.append(PC.chip(p, 'pc-big')); }); bx.set([]); bx.el.style.display = 'none'; cap.textContent = '5 個人排隊，每個都是一個單位'; }
        else { var blk = h('span', { class: 'pc-block' }, flip ? '乙甲' : '甲乙'); rowEl.append(blk); ['丙', '丁', '戊'].forEach(function (p) { rowEl.append(PC.chip(p, 'pc-big')); }); bx.el.style.display = ''; bx.set([{ n: '4！', label: '4 個單位排隊' }, { n: '2！', label: '塊內甲乙互換', cls: 'is-pink' }], 48); cap.innerHTML = '綁成一塊後只剩 <b>4 個單位</b>（甲乙塊、丙、丁、戊）：排隊 4！＝ 24 種；塊內甲乙可以互換 2！＝ 2 種'; }
      }
      btn.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } bound = !bound; btn.textContent = bound ? '鬆開' : '把甲乙綁成一塊'; swap.style.display = bound ? '' : 'none'; draw(); if (bound && !asked) { asked = true; var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '共有 4！ × 2！ ＝ 24 × 2 ＝ ？ 種排法' })); P.numBox(qb, { answer: 48, okMsg: '對！24 × 2 ＝ 48。', onOk: function () { P.track('aha', { id: 'count-perm', step: 3 }); setTimeout(function () { qb.style.display = 'none'; }, 1400); st.append(P.ruleBox('「必須相鄰」是限制：把相鄰的人<b>綁成一塊</b>，當成一個單位排隊（4！），再<b>鬆綁</b>，塊內互換（2！）。<br><b>4！× 2！＝ 48</b>。', '綁塊')); P.toast(api.ctx.p3 === 1 ? '你猜對了！48 種' : '48 種'); api.unlock('綁塊再鬆綁！'); } }); } });
      swap.addEventListener('click', function () { flip = !flip; draw(); });
      api.solve(function () { gate.on = false; if (!bound) btn.click(); });
      st.append(rowEl, h('div', { class: 'pc-btnrow' }, btn, swap), cap, q); draw(); api.lock('先做上面的預測');
    },
    /* 4 不相鄰：總數扣掉相鄰 */
    function (st, api) {
      st.append(P.instr('換個問題：5 人排隊，<b>甲、乙不可以相鄰</b>。用「全部」扣掉「相鄰」。'));
      var rowEl = h('div', { class: 'pc-people' }), bx = PC.boxes(st, [{ n: 120, label: '全部 5！' }, { n: 48, label: '相鄰', cls: 'is-pink' }], { op: '−', result: '？' }), q = h('div', {});
      PEOPLE.slice(0, 5).forEach(function (p) { rowEl.append(PC.chip(p, p === '甲' || p === '乙' ? 'is-pink pc-big' : 'pc-big')); });
      st.append(rowEl, bx.el, h('div', { class: 'pc-note' }, '全部：5！＝ 120 種；相鄰：把甲乙綁成一塊，4！× 2！＝ 48 種（上一題算過）'));
      var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '不相鄰 ＝ 全部 − 相鄰 ＝ 120 − 48 ＝ ？' }));
      P.numBox(qb, { answer: 72, okMsg: '對！120 − 48 ＝ 72 種。', onOk: function () { P.track('aha', { id: 'count-perm', step: 4 }); bx.set([{ n: 120, label: '全部 5！' }, { n: 48, label: '相鄰', cls: 'is-pink' }], 72); setTimeout(function () { qb.style.display = 'none'; }, 1400); st.append(P.ruleBox('<b>正難則反</b>：「不相鄰」不好直接數，就用<b>全部 − 相鄰</b>。<br>5！− 4！× 2！＝ 120 − 48 ＝ <b>72</b>。', '扣除法')); api.unlock('用扣除法算出 72！'); }, wrong: function (v) { return v === 168 ? '不相鄰是「全部」扣掉「相鄰」，要用減的。' : '提示：120 − 48。'; } });
      st.append(q); api.lock('算出不相鄰的種數');
    },
    /* 5 不相鄰：插空 */
    function (st, api) {
      st.append(P.instr('用<b>插空</b>再算一次：先排丙丁戊，中間與兩端有 <b>4 個空隙</b>。點 2 個空隙放甲和乙。'));
      var host = PC.stage(st), svg = PC.svg(host, 320, 110, 'pl-svg--sm'), g = sv('g', {}), sel = [], found = PC.found(st, { total: 6, label: '空隙選法' }), q = h('div', {}), asked = false; svg.append(g);
      var X = [48, 116, 184, 252];
      function draw() {
        g.innerHTML = ''; ['丙', '丁', '戊'].forEach(function (p, i) { var cx = [96, 176, 256][i]; g.append(sv('rect', { x: cx - 22, y: 46, width: 44, height: 40, rx: 10, fill: '#fff', stroke: '#6d6250', 'stroke-width': 2.5 }), PC.text(cx, 66, p, 17)); });
        for (var i = 0; i < 4; i++) (function (i) { var on = sel.indexOf(i) >= 0, gx = [44, 136, 216, 296][i], gr = sv('g', { class: 'pc-tap' }); gr.append(sv('rect', { x: gx - 15, y: 38, width: 30, height: 56, rx: 8, fill: on ? '#ffe8f0' : '#fff7e0', stroke: on ? '#d6336c' : '#d29b1f', 'stroke-width': 2, 'stroke-dasharray': on ? 'none' : '4 3' }), PC.text(gx, 66, on ? (sel.indexOf(i) === 0 ? '甲' : '乙') : '空', 13, on ? 'pm-pink' : 'pm-ghost'), PC.text(gx, 28, '空隙' + (i + 1), 10, 'pm-ghost')); gr.addEventListener('click', function () { tog(i); }); g.append(gr); })(i);
      }
      function tog(i) { if (sel.length === 2) sel = []; var k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else sel.push(i); draw(); if (sel.length === 2) { var ss = sel.slice().sort(); found.add(ss.join(), '空隙' + (ss[0] + 1) + '、' + (ss[1] + 1)); ask(); } }
      function ask() { if (found.count >= 6 && !asked) { asked = true; svg.style.maxHeight = '100px'; q.append(PC.boxes(q, [{ n: '3！', label: '排丙丁戊' }, { n: 6, label: '選 2 個空隙 C(4,2)', cls: 'is-blue' }, { n: '2！', label: '甲乙對調', cls: 'is-pink' }], { result: '？' }).el); var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '3！ × 6 × 2！ ＝ ？ 種' })); P.numBox(qb, { answer: 72, okMsg: '對！6 × 6 × 2 ＝ 72，和「全部 − 相鄰」一樣。', onOk: function () { P.track('aha', { id: 'count-perm', step: 5 }); setTimeout(function () { qb.style.display = 'none'; }, 1400); st.append(P.ruleBox('<b>插空法</b>：先排「沒限制」的人（3！），再把「不能相鄰」的人放進<b>空隙</b>（C(4,2) × 2！）。<br>兩種方法得到同一個答案 <b>72</b>，可以放心。', '插空')); api.unlock('兩種方法都是 72！'); } }); } }
      api.solve(function () { [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].forEach(function (c) { sel = []; tog(c[0]); tog(c[1]); }); });
      st.append(q); draw(); api.lock('找出 6 種空隙選法');
    },
    /* 6 換個外觀 */
    function (st, api) {
      PC.quiz(st, api, 'count-perm', [
        function (box, done) {
          var row = h('div', { class: 'pc-people' }); PEOPLE.slice(0, 6).forEach(function (p) { row.append(PC.chip(p, 'pc-big')); }); box.append(row, h('div', { class: 'pc-seatrow' }, [1, 2, 3, 4].map(function (i) { return h('span', { class: 'pc-seatbtn' }, '座' + i); })));
          PC.num(box, '6 個人（甲～己）選 4 個人排成一列。共有幾種排法？', 360, done, '對！6 × 5 × 4 × 3 ＝ 360。', function (v) { return v === 15 ? '15 是只選人（組合）；要排順序，連乘 4 個數。' : '提示：第 1 位 6 種，第 2 位 5 種，…連乘 4 個數。'; });
        },
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 90, 'pl-svg--sm'); ['甲', '乙', '丙', '丁'].forEach(function (p, i) { svg.append(sv('rect', { x: 28 + i * 66, y: 20, width: 52, height: 44, rx: 10, fill: i < 2 ? '#ffe8f0' : '#fff', stroke: i < 2 ? '#d6336c' : '#6d6250', 'stroke-width': 2.5 }), PC.text(54 + i * 66, 42, p, 17, i < 2 ? 'pm-pink' : ''), PC.text(54 + i * 66, 80, '位置 ' + (i + 1), 10, 'pm-ghost')); });
          PC.num(box, '甲、乙、丙、丁 4 人排成一列，<b>甲、乙不可相鄰</b>。共有幾種排法？', 12, done, '對！全部 4！＝ 24，相鄰 3！× 2！＝ 12，24 − 12 ＝ 12。', function (v) { return v === 24 ? '24 是全部；要扣掉「甲乙相鄰」的 3！× 2！＝ 12。' : '提示：全部 4！，相鄰（綁塊）3！×2！，相減。'; });
        },
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 150, 'pl-svg--sm'), own = [0, 0, 0, 0], NAMES = ['甲', '乙', '丙'], cap = h('div', { class: 'pl-caption' }); box.append(cap);
          function draw() { svg.innerHTML = ''; for (var i = 0; i < 4; i++) (function (i) { var gr = sv('g', { class: 'pc-tap' }); gr.append(sv('rect', { x: 20 + i * 72, y: 14, width: 56, height: 40, rx: 10, fill: '#fff4d5', stroke: '#b99348', 'stroke-width': 2.5 }), PC.text(48 + i * 72, 34, '獎品' + (i + 1), 12), sv('line', { x1: 48 + i * 72, y1: 54, x2: 48 + own[i] * 100 + 60, y2: 96, class: 'pl-line pl-line--soft', style: 'stroke:#b9ad92;stroke-width:2;stroke-dasharray:none' })); gr.addEventListener('click', function () { own[i] = (own[i] + 1) % 3; draw(); }); svg.append(gr); })(i);
            NAMES.forEach(function (n, k) { svg.append(sv('circle', { cx: 60 + k * 100, cy: 114, r: 18, class: 'pc-c pc-c--pink' }), PC.text(60 + k * 100, 115, n, 14, 'pc-tw')); });
            var same = own.every(function (o) { return o === own[0]; }); cap.innerHTML = same ? '<b style="color:#d6336c">全給同一人：不合規定</b>' : '這樣分是可以的'; }
          draw(); box.append(h('div', { class: 'pc-note' }, '（點獎品，換一個得主）'));
          PC.num(box, '4 件不同的獎品全部分給甲、乙、丙（可以有人沒拿到），但<b>不可全部給同 1 人</b>。共有幾種分配法？', 78, done, '對！每件 3 種去處：3⁴ ＝ 81，扣掉全給甲、全給乙、全給丙 3 種，81 − 3 ＝ 78。', function (v) { return v === 81 ? '81 包含了「全給同一人」的 3 種，要扣掉。' : '提示：3⁴ 再扣掉 3 種。'; });
        }]);
    },
    /* 7 完成 */
    function (st) {
      P.complete(st, {
        id: 'count-perm', moduleName: '排列', askAbout: '國中的排列與計數', aha: '排列就是把「名額」依序分給不同的人；<br>有限制就用綁塊、扣除或插空。',
        cards: [{ text: '排列：n × (n−1) × … 連乘 k 個數；5 人排隊 5！＝ 120', src: '宗翰講義「基本計數／排組原理」主題 7' }, { text: '相鄰：綁成一塊；不相鄰：全部 − 相鄰，或先排別人再插空', src: '宗翰講義 主題 7（說例 4）' }],
        depth: { here: 0.24, cheetah: [{ at: 0.52, label: '綁塊、插空<br>扣除法' }, { at: 0.88, label: '錯排<br>排容原理' }] },
        teasers: [
          { title: '獎品分配：不可全部給 1 人', q: '3⁵ − 3 ＝ 240：先算全部，再扣掉不合的。若「每人至少 1 件」呢？', where: '宗翰講義 主題 7 說例 3', lv: 'L2' },
          { title: '圓桌排列', q: '圍成一圈的排列，旋轉後相同，n 個人有 (n−1)！種，為什麼？', where: '國中資優班／高中排列組合', lv: 'L2' },
          { title: '字典排列', q: '把所有排列按字典順序列出來，第 k 個是什麼？', where: 'PK1A（2607）第 6 堂「字典排列」', lv: 'L2' },
          { title: '排容原理與錯排', q: '4 個人拿錯帽子，有幾種？用「扣掉再補回」算出來。', where: 'A1012prep、高中數學班', lv: 'L3' }],
        parent: { pitfall: '孩子常常分不清「選人」和「排人」：只選出哪幾個人是組合，還要排順序才是排列。遇到「不可以…」的限制，直接數很容易漏。', place: '國中到高中排列組合的核心，後面機率、二項式定理都用得到。', ask: ['這題要不要排順序？', '「必須相鄰」可以怎麼處理？', '「不可以相鄰」除了扣除，還能怎麼算？'] },
        classes: ['宗翰講義：基本計數／排組原理（主題 7 排列）', 'PK1A（2607）：字典排列', 'A1012prep：排容原理'],
        next: { href: 'play-count-bijection.html', text: '下一個：一一對應與換個說法' } });
    }];
  new P.Lesson({ id: 'count-perm', title: '排列', steps: steps });
})();
