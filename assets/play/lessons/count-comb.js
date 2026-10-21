/* 獵豹玩中學｜組合與「算兩次」（宗翰講義 主題4）：先排順序，再除掉重複；選線圍圖形 */
(function () {
  var P = Play, h = P.h, PC = window.PC, sv = PC.sv, LET = 'ABCDEFGH';

  /* 圓上的 n 個點，點兩點連線。opts: interactive, full, onEdge(count, key, deg) */
  function circleGraph(host, n, o) {
    o = o || {}; var svg = PC.svg(host, 320, 190, 'pl-svg--sm'), g = sv('g', {}), pos = [], edges = {}, cnt = 0, sel = -1, deg = [], i, j; svg.append(g);
    for (i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; pos.push([160 + 68 * Math.cos(a), 98 + 68 * Math.sin(a)]); deg.push(0); }
    function add(i, j) { var k = Math.min(i, j) + '-' + Math.max(i, j); if (edges[k]) return false; edges[k] = 1; cnt++; deg[i]++; deg[j]++; return k; }
    if (o.full) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) add(i, j);
    function draw() {
      g.innerHTML = '';
      Object.keys(edges).forEach(function (k) { var p = k.split('-'); g.append(sv('line', { x1: pos[p[0]][0], y1: pos[p[0]][1], x2: pos[p[1]][0], y2: pos[p[1]][1], class: 'pl-line pl-line--green', style: 'stroke-width:2.5' })); });
      for (i = 0; i < n; i++) (function (i) {
        var gr = sv('g', { class: o.interactive ? 'pc-tap' : '' }); gr.append(sv('circle', { cx: pos[i][0], cy: pos[i][1], r: 22, fill: 'transparent' }), sv('circle', { cx: pos[i][0], cy: pos[i][1], r: 14, class: 'pc-c ' + (sel === i ? 'pc-c--amber' : 'pc-c--navy'), stroke: '#fff', 'stroke-width': 2 }), PC.text(pos[i][0], pos[i][1] + 1, LET.charAt(i), 14, 'pc-tw'));
        var dx = pos[i][0] < 160 ? -26 : 26, dy = pos[i][1] < 98 ? -4 : 6; if (o.showDeg) gr.append(PC.text(pos[i][0] + (Math.abs(pos[i][0] - 160) < 5 ? 0 : dx), pos[i][1] + (Math.abs(pos[i][0] - 160) < 5 ? (pos[i][1] < 98 ? -24 : 26) : dy), deg[i] + ' 場', 11, 'pm-amber'));
        if (o.interactive) gr.addEventListener('click', function () { tap(i); }); g.append(gr);
      })(i);
    }
    function tap(i) {
      if (o.locked && o.locked()) { P.toast('先做上面的預測'); return; }
      if (sel < 0) { sel = i; draw(); return; } if (sel === i) { sel = -1; draw(); return; }
      var k = add(sel, i); if (!k) { P.toast('這兩隊已經比過了'); sel = -1; draw(); return; } sel = -1; draw(); if (o.onEdge) o.onEdge(cnt, k, deg);
    }
    draw(); return { count: function () { return cnt; }, degs: function () { return deg; }, svg: svg };
  }

  /* 矩形：nv 條直線 × nh 條橫線，點兩條直線與兩條橫線圍出矩形 */
  function rectGrid(host, nv, nh, onFound) {
    var svg = PC.svg(host, 320, 170, 'pl-svg--sm'), g = sv('g', {}), sel = { v: [], h: [] }, found = {}, nf = 0, x0 = 40, x1 = 280, y0 = 24, y1 = 146, last = null; svg.append(g);
    function VX(i) { return x0 + i * (x1 - x0) / (nv - 1); } function HY(j) { return y0 + j * (y1 - y0) / (nh - 1); }
    function draw() {
      g.innerHTML = '';
      if (last) g.append(sv('rect', { x: VX(last[0]), y: HY(last[2]), width: VX(last[1]) - VX(last[0]), height: HY(last[3]) - HY(last[2]), class: 'pl-poly pl-poly--amber' }));
      var i, j;
      for (i = 0; i < nv; i++) { var on = sel.v.indexOf(i) >= 0; g.append(sv('line', { x1: VX(i), y1: y0 - 8, x2: VX(i), y2: y1 + 8, class: 'pl-line', style: 'stroke:' + (on ? '#d6336c' : '#6d6250') + ';stroke-width:' + (on ? 4.5 : 2.5) + ';stroke-dasharray:none' }), PC.text(VX(i), 10, 'v' + (i + 1), 11, 'pm-ghost')); var hit = sv('line', { x1: VX(i), y1: y0 - 10, x2: VX(i), y2: y1 + 10, stroke: 'transparent', 'stroke-width': 26, class: 'pc-tap' }); (function (i) { hit.addEventListener('click', function () { pick('v', i); }); })(i); g.append(hit); }
      for (j = 0; j < nh; j++) { var on2 = sel.h.indexOf(j) >= 0; g.append(sv('line', { x1: x0 - 10, y1: HY(j), x2: x1 + 10, y2: HY(j), class: 'pl-line', style: 'stroke:' + (on2 ? '#2f6fdc' : '#6d6250') + ';stroke-width:' + (on2 ? 4.5 : 2.5) + ';stroke-dasharray:none' }), PC.text(x0 - 24, HY(j), 'h' + (j + 1), 11, 'pm-ghost')); var hit2 = sv('line', { x1: x0 - 12, y1: HY(j), x2: x1 + 12, y2: HY(j), stroke: 'transparent', 'stroke-width': 26, class: 'pc-tap' }); (function (j) { hit2.addEventListener('click', function () { pick('h', j); }); })(j); g.append(hit2); }
    }
    function pick(kind, i) {
      var a = sel[kind], k = a.indexOf(i); if (k >= 0) a.splice(k, 1); else if (a.length < 2) a.push(i); else { a.shift(); a.push(i); }
      if (sel.v.length === 2 && sel.h.length === 2) { var v = sel.v.slice().sort(), hh = sel.h.slice().sort(), key = v.join() + '|' + hh.join(); last = [v[0], v[1], hh[0], hh[1]]; if (!found[key]) { found[key] = 1; nf++; } if (onFound) onFound(nf, key); sel = { v: [], h: [] }; draw(); return; }
      last = null; draw();
    }
    draw(); return { count: function () { return nf; } };
  }

  var steps = [
    /* 1 握手／循環賽 */
    function (st, api) {
      var gate = { on: true }, n = 5, gr, done = false, host, cap = h('div', { class: 'pl-caption' }), pill = P.pill('', 'is-green');
      P.choice(st, api, { id: 'cc-p1', predict: true, label: '先猜猜看', prompt: '5 個球隊，任兩隊都要比賽一次。共要安排幾場？', row: true, options: [{ t: '5 場' }, { t: '10 場' }, { t: '20 場' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('點兩個隊連一條線，連出所有比賽'); } });
      host = PC.stage(st);
      function build() {
        host.innerHTML = ''; done = false; var total = n * (n - 1) / 2;
        gr = circleGraph(host, n, { interactive: true, showDeg: true, locked: function () { return gate.on; }, onEdge: function (c, k, deg) {
          pill.textContent = '已安排 ' + c + ' 場'; if (c < total) return;
          if (done) return; done = true; var d = deg[0];
          cap.innerHTML = '每個隊都打了 <b>' + d + '</b> 場。' + n + ' 個隊「隊次」共 ' + n + ' × ' + d + ' ＝ ' + n * d + '，但<b>每場有 2 個隊</b>，被算了 2 次 → ' + n * d + ' ÷ 2 ＝ <b>' + total + ' 場</b>';
          if (n >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-comb', step: 1 }); st.append(P.ruleBox('<b>算兩次</b>：從「隊」數是 n × (n−1)，從「場」數每場被算 2 次，所以場數 ＝ <b>n(n−1) ÷ 2</b>。<br>這就是「握手問題」，也是 <b>C(n, 2)</b>。', '算兩次')); P.toast(api.ctx.p1 === 1 ? '你猜對了！10 場' : '連出來是 10 場'); api.unlock('n(n−1)÷2！'); } } });
        pill.textContent = '已安排 0 場'; cap.innerHTML = '';
      }
      var stp = P.stepper('球隊數', 3, 6, 5, function (v) { if (gate.on) { stp.set(5, true); return; } n = v; build(); }, function (v) { return v + ' 隊'; });
      st.append(stp.el, h('div', { class: 'pl-readout' }, pill), cap); build(); api.lock('先做上面的預測');
    },
    /* 2 順序與重複：C(n,k) */
    function (st, api) {
      var gate = { on: true }, n = 5, k = 2, seen = {}, list = h('div', { class: 'pc-found' }), cap = h('div', { class: 'pl-caption' }), bx;
      list.style.maxHeight = '110px';
      P.choice(st, api, { id: 'cc-p2', predict: true, label: '先猜猜看', prompt: '從 5 本不同的書挑 2 本（不分先後），有幾種組合？', row: true, options: [{ t: '5 種' }, { t: '10 種' }, { t: '20 種' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('改變書的本數和挑幾本'); } });
      bx = PC.boxes(st, []);
      function combos(n, k) { var out = [], rec = function (s, pre) { if (pre.length === k) { out.push(pre); return; } for (var i = s; i < n; i++) rec(i + 1, pre + 'abcdef'.charAt(i)); }; rec(0, ''); return out; }
      function draw() {
        list.innerHTML = ''; combos(n, k).forEach(function (c) { list.append(PC.chip(c, 'is-amber')); });
        var ordered = PC.perm(n, k), f = PC.fact(k), res = ordered / f, items = []; for (var i = 0; i < k; i++) items.push({ n: n - i, label: '第 ' + (i + 1) + ' 本' });
        bx.set(items, ordered); var wrap = bx.el; wrap.append(h('span', { class: 'pc-op' }, '÷'), h('span', { class: 'pc-box is-green' }, h('b', {}, k + '！'), h('i', {}, '＝' + f)), h('span', { class: 'pc-op' }, '＝'), h('span', { class: 'pc-res' }, String(res)));
        cap.innerHTML = '有順序 ' + ordered + ' 種（ab 和 ba 算不同）；每一組被算了 <b>' + f + '</b> 次 → ' + ordered + ' ÷ ' + f + ' ＝ <b>' + res + '</b> 種組合';
        seen[n + ',' + k] = 1;
        if (seen['5,2'] && seen['5,3'] && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-comb', step: 2 }); st.append(P.ruleBox('<b>C(n, k) ＝ n(n−1)…(n−k+1) ÷ k！</b>：先考慮順序，再除掉「同一組被算了 k！次」。<br>C(5,2) ＝ 5×4÷2 ＝ 10；C(5,3) ＝ 5×4×3÷6 ＝ 10。', '組合')); P.toast(api.ctx.p2 === 1 ? '你猜對了！10 種' : '10 種'); api.unlock('先排順序，再除掉重複！'); }
      }
      var sn = P.stepper('書', 3, 5, 5, function (v) { if (gate.on) { sn.set(5, true); return; } n = v; draw(); }, function (v) { return v + ' 本'; }), sk = P.stepper('挑', 2, 3, 2, function (v) { if (gate.on) { sk.set(2, true); return; } k = v; draw(); }, function (v) { return v + ' 本'; });
      st.append(h('div', { class: 'pl-steprow' }, sn.el, sk.el), list, cap); draw(); api.lock('先做上面的預測');
    },
    /* 3 選 3 個坐＝選 2 個空著 */
    function (st, api) {
      st.append(P.instr('5 個空位，3 個人入座。點座位選出<b>坐的 3 個位子</b>，看看<b>空著的 2 個</b>是哪兩個。'));
      var host = PC.stage(st), svg = PC.svg(host, 320, 110, 'pl-svg--sm'), g = sv('g', {}), sel = [], found = PC.found(st, { total: 10, label: '已找到' }), cap = h('div', { class: 'pl-caption' }, '點 3 個座位'); svg.append(g);
      function draw() {
        g.innerHTML = ''; for (var i = 0; i < 5; i++) (function (i) { var on = sel.indexOf(i) >= 0, gr = sv('g', { class: 'pc-tap' }); gr.append(sv('rect', { x: 20 + i * 58, y: 28, width: 46, height: 46, rx: 10, class: 'pc-seat' + (on ? ' is-on' : '') }), PC.text(43 + i * 58, 51, LET.charAt(i), 17), PC.text(43 + i * 58, 92, on ? '坐' : '', 12, 'pm-blue')); gr.addEventListener('click', function () { tog(i); }); g.append(gr); })(i);
      }
      function tog(i) { var k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else { if (sel.length === 3) sel = []; sel.push(i); }
        if (sel.length === 3) { var s = sel.slice().sort(), sit = s.map(function (x) { return LET.charAt(x); }).join(''), empty = [0, 1, 2, 3, 4].filter(function (x) { return s.indexOf(x) < 0; }).map(function (x) { return LET.charAt(x); }).join(''); var nw = found.add(sit, sit + '（空 ' + empty + '）'); cap.innerHTML = '坐 <b>' + sit + '</b> ⇄ 空 <b>' + empty + '</b>' + (nw ? '' : '（這組找過了）'); draw(); check(); setTimeout(function () { sel = []; draw(); }, 600); return; }
        cap.textContent = '點 3 個座位'; draw(); }
      function check() { if (found.count >= 6 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-comb', step: 3 }); st.append(P.ruleBox('每一種「坐哪 3 個」，都剛好對應一種「空哪 2 個」：<b>一對一</b>。<br>所以 <b>C(5,3) ＝ C(5,2) ＝ 5×4÷2 ＝ 10</b>。一般：<b>C(n,k) ＝ C(n, n−k)</b>。', '選坐＝選空')); api.unlock('選 3 個坐 ＝ 選 2 個空著！'); } }
      st.append(cap); draw(); api.lock('找出 6 種不同的坐法');
    },
    /* 4 三角形個數 */
    function (st, api) {
      st.append(P.instr('圖中有 6 條斜線和 2 條橫線。點<b>兩條斜線＋一條橫線</b>，圍出一個三角形。'));
      var host = PC.stage(st), svg = PC.svg(host, 320, 160, 'pl-svg--sm'), g = sv('g', {}), sel = { s: [], h: null }, found = {}, nf = 0, last = null, pill = P.pill('', 'is-green'), asked = false, q = h('div', {}); svg.append(g);
      var ap = [160, 14], XB = [40, 88, 136, 184, 232, 280], YH = [66, 140], cap = h('div', { class: 'pl-caption' }, '');
      function px(i, yh) { var t = (yh - ap[1]) / (140 - ap[1]); return [ap[0] + (XB[i] - ap[0]) * t, yh]; }
      function draw() {
        g.innerHTML = ''; if (last) g.append(sv('polygon', { points: [ap, px(last[0], YH[last[2]]), px(last[1], YH[last[2]])].map(function (p) { return p.join(','); }).join(' '), class: 'pl-poly pl-poly--amber' }));
        XB.forEach(function (x, i) { var on = sel.s.indexOf(i) >= 0; g.append(sv('line', { x1: ap[0], y1: ap[1], x2: x, y2: 140, class: 'pl-line', style: 'stroke:' + (on ? '#d6336c' : '#6d6250') + ';stroke-width:' + (on ? 4.5 : 2.5) + ';stroke-dasharray:none' }), PC.text(x, 154, String(i + 1), 11, 'pm-ghost')); var hit = sv('line', { x1: ap[0], y1: ap[1], x2: x, y2: 140, stroke: 'transparent', 'stroke-width': 22, class: 'pc-tap' }); hit.addEventListener('click', function () { pick('s', i); }); g.append(hit); });
        YH.forEach(function (y, j) { var on = sel.h === j, a = px(0, y), b = px(5, y); g.append(sv('line', { x1: a[0] - 6, y1: y, x2: b[0] + 6, y2: y, class: 'pl-line', style: 'stroke:' + (on ? '#2f6fdc' : '#6d6250') + ';stroke-width:' + (on ? 4.5 : 2.5) + ';stroke-dasharray:none' })); var hit = sv('line', { x1: a[0] - 8, y1: y, x2: b[0] + 8, y2: y, stroke: 'transparent', 'stroke-width': 22, class: 'pc-tap' }); hit.addEventListener('click', function () { pick('h', j); }); g.append(hit); });
      }
      function pick(kind, i) {
        if (kind === 's') { var k = sel.s.indexOf(i); if (k >= 0) sel.s.splice(k, 1); else sel.s.push(i); if (sel.s.length === 3) { cap.textContent = '三條斜線交在同一點，圍不出三角形'; P.toast('3 條斜線交在同一點，圍不出三角形'); sel.s = []; last = null; draw(); return; } } else { sel.h = sel.h === i ? null : i; }
        last = null; if (sel.s.length === 2 && sel.h !== null) { var s2 = sel.s.slice().sort(), key = s2.join() + '|' + sel.h; last = [s2[0], s2[1], sel.h]; if (!found[key]) { found[key] = 1; nf++; } cap.innerHTML = '斜線 ' + (s2[0] + 1) + '、' + (s2[1] + 1) + ' ＋ 橫線 ' + (sel.h + 1) + ' → 一個三角形'; sel = { s: [], h: null }; pill.textContent = '你找到 ' + nf + ' 個'; draw(); ask(); return; }
        draw();
      }
      function ask() { if (nf >= 6 && !asked) { asked = true; var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '每個三角形＝<b>選 2 條斜線 ＋ 選 1 條橫線</b>。圖中最多共有幾個三角形？' })); P.numBox(qb, { answer: 30, okMsg: '對！斜線選 2 條：C(6,2) ＝ 15；橫線選 1 條：2 種。15 × 2 ＝ 30。', onOk: function () { P.track('aha', { id: 'count-comb', step: 4 }); setTimeout(function () { qb.style.display = 'none'; }, 1500); st.append(P.ruleBox('把「用眼睛找圖形」改成「<b>選線</b>」：三角形 ＝ 2 條斜線＋1 條橫線，<b>C(6,2) × 2 ＝ 30</b>。<br>一般：m 條斜線、k 條橫線，共 <b>k × C(m,2)</b> 個。', '選線')); api.unlock('用選線數三角形！'); }, wrong: function (v) { return v === 15 ? '還要選橫線：L1 或 L2，共 2 種，要連乘。' : '提示：斜線選 2 條有幾種？橫線選 1 條有幾種？連乘。'; } }); } }
      st.append(h('div', { class: 'pl-readout' }, pill), cap, q); pill.textContent = '你找到 0 個'; draw(); api.lock('先找出 6 個三角形');
    },
    /* 5 矩形個數 */
    function (st, api) {
      st.append(P.instr('5 條直線、4 條橫線。點<b>兩條直線＋兩條橫線</b>，圍出一個矩形。'));
      var host = PC.stage(st), pill = P.pill('你找到 0 個', 'is-green'), asked = false, q = h('div', {});
      rectGrid(host, 5, 4, function (nf) { pill.textContent = '你找到 ' + nf + ' 個'; if (nf >= 6 && !asked) { asked = true; var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '任選 <b>2 條直線＋2 條橫線</b>，一定恰好圍成 1 個矩形。圖中共有幾個矩形？' })); P.numBox(qb, { answer: 60, okMsg: '對！C(5,2) × C(4,2) ＝ 10 × 6 ＝ 60。', onOk: function () { P.track('aha', { id: 'count-comb', step: 5 }); setTimeout(function () { qb.style.display = 'none'; }, 1500); st.append(P.ruleBox('矩形 ＝ 選 2 條直線 ＋ 選 2 條橫線，<b>C(m,2) × C(n,2)</b>。<br>5 條直線、4 條橫線：10 × 6 ＝ <b>60</b>。', '選線')); api.unlock('矩形也是選線！'); }, wrong: function (v) { return v === 20 ? '是「選 2 條」不是「選 1 條」：直線 C(5,2) 種，橫線 C(4,2) 種。' : '提示：直線選 2 條有幾種？橫線選 2 條有幾種？連乘。'; } }); } });
      st.append(h('div', { class: 'pl-readout' }, pill), q); api.lock('先找出 6 個矩形');
    },
    /* 6 兩對情侶：綁塊 */
    function (st, api) {
      st.append(P.instr('電影院一排 6 個座位，兩對情侶（甲、乙）各自要<b>相鄰</b>而坐。先把每對<b>綁成一塊</b>，再選位置。'));
      var host = PC.stage(st), svg = PC.svg(host, 320, 150, 'pl-svg--sm'), g = sv('g', {}), sel = [], found = PC.found(st, { total: 6, label: '座位型態' }), asked = false, q = h('div', {}); svg.append(g);
      function draw(pat) {
        g.innerHTML = ''; g.append(PC.text(160, 12, '4 個單位：甲塊、乙塊、空、空（點 2 個放情侶塊）', 11, 'pm-ghost'));
        for (var i = 0; i < 4; i++) (function (i) { var on = sel.indexOf(i) >= 0, gr = sv('g', { class: 'pc-tap' }); gr.append(sv('rect', { x: 28 + i * 66, y: 24, width: 56, height: 36, rx: 10, class: 'pc-seat' + (on ? ' is-on' : '') }), PC.text(56 + i * 66, 42, on ? (sel.indexOf(i) === 0 ? '甲塊' : '乙塊') : '空', 14, on ? (sel.indexOf(i) === 0 ? 'pm-pink' : 'pm-blue') : 'pm-ghost')); gr.addEventListener('click', function () { tog(i); }); g.append(gr); })(i);
        if (pat) { g.append(PC.text(160, 84, '展開成 6 個座位：', 11, 'pm-ghost')); var x = 20, seat = 0; pat.forEach(function (u) { var w = u === '空' ? 1 : 2; for (var k = 0; k < w; k++) { g.append(sv('rect', { x: 20 + seat * 46, y: 94, width: 40, height: 40, rx: 8, fill: u === '甲' ? '#ffe8f0' : u === '乙' ? '#e8f0ff' : '#fff', stroke: u === '甲' ? '#d6336c' : u === '乙' ? '#2f6fdc' : '#b9ad92', 'stroke-width': 2.5 }), PC.text(40 + seat * 46, 114, u === '空' ? '' : u + (k + 1), 13, u === '甲' ? 'pm-pink' : 'pm-blue')); seat++; } }); }
      }
      function tog(i) { if (sel.length === 2) sel = []; var k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else sel.push(i);
        if (sel.length === 2) { var pat = [0, 1, 2, 3].map(function (u) { return u === sel[0] ? '甲' : u === sel[1] ? '乙' : '空'; }); var s2 = sel.slice().sort().join(''); draw(pat); found.add(s2, [0, 1, 2, 3].map(function (u) { return sel.indexOf(u) >= 0 ? '■' : '□'; }).join('')); ask(); return; } draw(); }
      function ask() { if (found.count >= 6 && !asked) { asked = true; svg.style.maxHeight = '118px'; var qb = h('div', {}); q.append(PC.boxes(q, [{ n: 6, label: '選 2 個位置', cls: 'is-blue' }, { n: 2, label: '哪塊放左', cls: 'is-pink' }, { n: 4, label: '塊內互換 2×2', cls: 'is-green' }]).el, qb); qb.append(h('div', { class: 'pl-q', html: '選位置 C(4,2) ＝ 6 種；哪對在左 2 種；「鬆綁」後每塊內的兩人可互換，2 × 2 ＝ 4 種。共有幾種座位安排？' })); P.numBox(qb, { answer: 48, okMsg: '對！6 × 2 × 4 ＝ 48。', onOk: function () { P.track('aha', { id: 'count-comb', step: 6 }); setTimeout(function () { qb.style.display = 'none'; }, 1500); st.append(P.ruleBox('「必須相鄰」是限制：把相鄰的兩人<b>綁成一塊</b>，限制就消失，變成 4 個單位排隊。<br>步驟：<b>綁</b>（情侶成塊）→ <b>排</b>（C(4,2)×2）→ <b>鬆綁</b>（塊內 2×2）＝ <b>48</b>。', '綁塊')); api.unlock('綁塊再鬆綁！'); }, wrong: function (v) { return v === 12 ? '別忘了「鬆綁」：每對情侶內部的兩人可以互換，要再乘 2 × 2。' : '提示：6 × 2 × 4。'; } }); } }
      st.append(h('div', { class: 'pl-fb' }), q); draw(); api.lock('找出 6 種座位型態');
    },
    /* 7 換個外觀 */
    function (st, api) {
      PC.quiz(st, api, 'count-comb', [
        function (box, done) {
          var host = PC.stage(box); circleGraph(host, 6, { full: true, showDeg: true });
          PC.num(box, '6 個球隊，任兩隊都比賽一次（圖中每條線是一場）。共要幾場？', 15, done, '對！每隊打 5 場，6 × 5 ÷ 2 ＝ 15 場。', function (v) { return v === 30 ? '6 × 5 ＝ 30 是「隊次」，每場有 2 個隊，被算了 2 次，要 ÷ 2。' : '提示：每隊打 5 場，隊次 ÷ 2。'; });
        },
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 170, 'pl-svg--sm'), out = {}, cnt = 0, pill = P.pill('', 'is-pink');
          function draw() { svg.innerHTML = ''; for (var i = 0; i < 100; i++) (function (i) { var cx = 36 + (i % 10) * 27, cy = 18 + Math.floor(i / 10) * 15.5, on = out[i], c = sv('circle', { cx: cx, cy: cy, r: 5.5, fill: on ? '#d6336c' : '#2f6fdc', stroke: '#fff', 'stroke-width': 1 }), hit = sv('circle', { cx: cx, cy: cy, r: 12, fill: 'transparent', class: 'pc-tap' }); hit.addEventListener('click', function () { if (out[i]) { delete out[i]; cnt--; } else if (cnt < 2) { out[i] = 1; cnt++; } else { P.toast('只淘汰 2 人'); } pill.textContent = '淘汰 ' + cnt + ' 人（紅色）'; draw(); }); svg.append(c, hit); })(i); }
          pill.textContent = '淘汰 0 人（紅色）'; draw(); box.append(h('div', { class: 'pl-readout' }, pill));
          PC.num(box, '從 100 人中選出 <b>98 人</b>。「選 98 人」等於「淘汰哪 2 人」（點圓點試試）。選法共有幾種？', 4950, done, '對！C(100,98) ＝ C(100,2) ＝ 100 × 99 ÷ 2 ＝ 4950。', function () { return '提示：選 98 人 ＝ 選 2 人淘汰，C(100,2) ＝ 100 × 99 ÷ 2。'; });
        },
        function (box, done) {
          var host = PC.stage(box); rectGrid(host, 4, 3, function () { });
          PC.num(box, '4 條直線、3 條橫線（點線圍圍看）。圖中共有幾個矩形？', 18, done, '對！C(4,2) × C(3,2) ＝ 6 × 3 ＝ 18。', function (v) { return v === 12 ? '12 ＝ 4 × 3 只是選 1 條；矩形要「選 2 條直線＋選 2 條橫線」。' : '提示：直線選 2 條有幾種？橫線選 2 條有幾種？'; });
        }]);
    },
    /* 8 完成 */
    function (st) {
      P.complete(st, {
        id: 'count-comb', moduleName: '組合與算兩次', askAbout: '國中的組合與計數', aha: '先排順序，再除掉「同一組被算了幾次」；<br>很多圖形題，都是「選線」。',
        cards: [{ text: 'C(n,2) ＝ n(n−1)÷2；C(n,k) ＝ C(n, n−k)', src: '宗翰講義「基本計數／排組原理」主題 4' }, { text: '三角形 ＝ 2 條斜線＋1 條橫線；矩形 ＝ 2 條直線＋2 條橫線', src: '宗翰講義 主題 4（說例 1、2）' }],
        depth: { here: 0.22, cheetah: [{ at: 0.5, label: '綁塊與插空<br>算兩次' }, { at: 0.88, label: '組合恆等式<br>二項式定理' }] },
        teasers: [
          { title: '算兩次（富比尼原理）', q: '同一個數，從「隊」和從「場」兩個角度算兩次，直接得到公式。', where: '宗翰講義 主題 4（專家思維）', lv: 'L2' },
          { title: '綁塊與鬆綁', q: '「必須相鄰」怎麼處理？綁成一塊再鬆綁，兩對情侶 48 種。', where: '宗翰講義 主題 4 說例 4', lv: 'L2' },
          { title: '重複組合與插板法', q: '把相同的球放進不同的盒子，用「插板」變成 C(n+k−1, k−1)。', where: 'PK3D 插板法', lv: 'L2' },
          { title: 'Fubini 雙重計數', q: '同一批東西數兩次：握手問題、角的個數、對角線個數。', where: 'A1012prep 富比尼原理', lv: 'L3' }],
        parent: { pitfall: '孩子容易把「組合」與「排列」混淆：該不分順序時算了順序，結果多算好幾倍。圖形個數題則常靠「用眼睛找」，容易漏。', place: '國中組合與機率的基礎；高中「排列組合」與「二項式定理」的起點。', ask: ['這件事有沒有順序？每一組被算了幾次？', '要數的圖形，可以由哪幾條線決定？', '選 98 個人，為什麼等於選 2 個人？'] },
        classes: ['宗翰講義：基本計數／排組原理（主題 4 C(n,2)）', 'PK3D：插板法', 'A1012prep：富比尼原理'],
        next: { href: 'play-count-perm.html', text: '下一個：排列' } });
    }];
  new P.Lesson({ id: 'count-comb', title: '組合與算兩次', steps: steps });
})();
