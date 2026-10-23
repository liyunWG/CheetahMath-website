/* 獵豹玩中學｜一一對應與換個說法（宗翰講義 主題5、6）：把難數的東西，換成好數的東西 */
(function () {
  var P = Play, h = P.h, PC = window.PC, sv = PC.sv;
  function comp(bits, n) { var out = [], c = 1; for (var i = 0; i < n - 1; i++) { if (bits[i]) { out.push(c); c = 1; } else c++; } out.push(c); return out; }

  /* 巧克力：n 顆、n−1 條縫，點縫切／連 */
  function chocolate(host, n, onChange) {
    var svg = PC.svg(host, 320, 120, 'pl-svg--sm'), g = sv('g', {}), bits = []; svg.append(g); for (var i = 0; i < n - 1; i++) bits.push(0);
    var w = Math.min(44, 290 / n), x0 = 160 - n * w / 2;
    function draw() {
      g.innerHTML = ''; var i, cs = comp(bits, n), idx = 0, gi = 0;
      var groupOf = []; cs.forEach(function (c, k) { for (var t = 0; t < c; t++) groupOf.push(k); });
      for (i = 0; i < n; i++) g.append(sv('rect', { x: x0 + i * w + 2 + (groupOf[i] * 3), y: 24, width: w - 4, height: 40, rx: 6, fill: groupOf[i] % 2 ? '#ffe8f0' : '#e8f0ff', stroke: groupOf[i] % 2 ? '#d6336c' : '#2f6fdc', 'stroke-width': 2.5 }), PC.text(x0 + i * w + w / 2 + groupOf[i] * 3, 44, '🍫', Math.min(18, w * .5)));
      for (i = 0; i < n - 1; i++) (function (i) { var gr = sv('g', { class: 'pc-tap' }), cx = x0 + (i + 1) * w + groupOf[i + 1] * 3 - 1.5; gr.append(sv('rect', { x: cx - 13, y: 70, width: 26, height: 36, rx: 8, fill: bits[i] ? '#ffd6d6' : '#fff7e0', stroke: bits[i] ? '#d6336c' : '#d29b1f', 'stroke-width': 2 }), PC.text(cx, 88, bits[i] ? '切' : '連', 13, bits[i] ? 'pm-pink' : 'pm-amber')); gr.addEventListener('click', function () { bits[i] = 1 - bits[i]; draw(); if (onChange) onChange(bits.slice(), comp(bits, n)); }); g.append(gr); })(i);
      g.append(PC.text(160, 12, '點下面的「連／切」', 12, 'pm-ghost'));
    }
    draw(); return { bits: function () { return bits; }, set: function (a) { bits = a.slice(); draw(); if (onChange) onChange(bits.slice(), comp(bits, n)); } };
  }
  /* 單位三角格：邊長 n，點內部單位線段，標出兩側三角形拼成的平行四邊形 */
  function triGrid(host, n, onSeg) {
    var s = Math.min(62, 276 / n), H = 24 + n * s * 0.866, svg = PC.svg(host, 320, H, 'pl-svg--sm'), g = sv('g', {}), found = {}, nf = 0, cur = null, r, c; svg.append(g);
    function P_(r, c) { return [160 + (c - r / 2) * s, 12 + r * s * 0.866]; }
    function nbrs(r, c) { var o = []; if (c - 1 >= 0) o.push([r, c - 1]); if (c + 1 <= r) o.push([r, c + 1]); if (r >= 1 && c - 1 >= 0) o.push([r - 1, c - 1]); if (r >= 1 && c <= r - 1) o.push([r - 1, c]); if (r + 1 <= n) { o.push([r + 1, c]); o.push([r + 1, c + 1]); } return o; }
    var edges = [];
    for (r = 0; r <= n; r++) for (c = 0; c <= r; c++) nbrs(r, c).forEach(function (q) { if (q[0] > r || (q[0] === r && q[1] > c)) { var A = [r, c], B = q, bd = (A[1] === 0 && B[1] === 0) || (A[1] === A[0] && B[1] === B[0]) || (A[0] === n && B[0] === n); edges.push({ a: A, b: B, interior: !bd, key: A + '-' + B }); } });
    function third(e) { var na = nbrs(e.a[0], e.a[1]).map(String), res = []; nbrs(e.b[0], e.b[1]).forEach(function (q) { if (na.indexOf(String(q)) >= 0) res.push(q); }); return res; }
    function draw() {
      g.innerHTML = '';
      if (cur) third(cur).forEach(function (t) { g.append(sv('polygon', { points: [cur.a, cur.b, t].map(function (p) { return P_(p[0], p[1]).join(','); }).join(' '), class: 'pl-poly pl-poly--amber' })); });
      edges.forEach(function (e) { var a = P_(e.a[0], e.a[1]), b = P_(e.b[0], e.b[1]), isCur = cur && cur.key === e.key, done = found[e.key]; g.append(sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'pl-line', style: 'stroke:' + (!e.interior ? '#122548' : isCur ? '#1f9d55' : done ? '#1f9d55' : '#b9ad92') + ';stroke-width:' + (!e.interior ? 3 : isCur ? 5 : done ? 3.5 : 2) + ';stroke-dasharray:none' }));
        if (e.interior) { var hit = sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'transparent', 'stroke-width': 18, class: 'pc-tap' }); hit.addEventListener('click', function () { cur = e; if (!found[e.key]) { found[e.key] = 1; nf++; } draw(); if (onSeg) onSeg(nf, e); }); g.append(hit); } });
    }
    draw(); var total = edges.filter(function (e) { return e.interior; }).length; return { total: total, count: function () { return nf; }, tap: function (k) { edges.filter(function (e) { return e.interior; }).slice(0, k).forEach(function (e) { cur = e; if (!found[e.key]) { found[e.key] = 1; nf++; } }); draw(); if (onSeg) onSeg(nf, cur); } };
  }

  /* 立方體示意圖：從左前上角 A 走到右後下角 G，只能往右、往後、往下 */
  function cubeFig(host) {
    var svg = PC.svg(host, 320, 170, 'pl-svg--sm'), F = [[60, 50], [160, 50], [160, 140], [60, 140]], K = [[110, 20], [210, 20], [210, 110], [110, 110]], i;
    function ln(a, b, hid) { svg.append(sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'pl-line', style: 'stroke:' + (hid ? '#c5bba3' : '#6d6250') + ';stroke-width:' + (hid ? 2 : 2.5) + ';stroke-dasharray:' + (hid ? '4 5' : 'none') })); }
    for (i = 0; i < 4; i++) { ln(F[i], F[(i + 1) % 4], false); ln(K[i], K[(i + 1) % 4], i === 2 || i === 3); ln(F[i], K[i], i === 3); }
    function arrow(a, b, col, lab, dx, dy) { svg.append(sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'pl-line', style: 'stroke:' + col + ';stroke-width:4;stroke-dasharray:none' }), PC.text(b[0] + dx, b[1] + dy, lab, 13, 'pm-' + (col === '#2f6fdc' ? 'blue' : col === '#d29b1f' ? 'amber' : 'pink'))); }
    arrow(F[0], [F[0][0] + 44, F[0][1]], '#2f6fdc', '右', 8, -12); arrow(F[0], [F[0][0] + 22, F[0][1] - 18], '#d29b1f', '後', -2, -12); arrow(F[0], [F[0][0], F[0][1] + 44], '#d6336c', '下', -14, 6);
    svg.append(sv('circle', { cx: F[0][0], cy: F[0][1], r: 10, class: 'pc-c pc-c--green', stroke: '#fff', 'stroke-width': 2 }), PC.text(F[0][0], F[0][1] + 1, 'A', 12, 'pc-tw'), sv('circle', { cx: K[2][0], cy: K[2][1], r: 10, class: 'pc-c pc-c--pink', stroke: '#fff', 'stroke-width': 2 }), PC.text(K[2][0], K[2][1] + 1, 'G', 12, 'pc-tw'));
  }

  var steps = [
    /* 1 巧克力：看縫不看顆 */
    function (st, api) {
      var gate = { on: true };
      P.choice(st, api, { id: 'cb-p1', predict: true, label: '先猜猜看', prompt: '5 顆巧克力排成一列，分成幾次拿完（每次拿連續的幾顆）。例如 (2, 1, 2)。共有幾種拿法？', row: true, options: [{ t: '5 種' }, { ok: true, t: '16 種' }, { t: '32 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('點「連／切」，找出不同的拿法'); } });
      var host = PC.stage(st), found = PC.found(st, { label: '已找到拿法' }), cap = h('div', { class: 'pl-caption' }, '點縫，切開＝不同次拿；連著＝同一次拿'), q = h('div', {}), asked = false;
      var ch = chocolate(host, 5, function (bits, cs) { if (gate.on) { P.toast('先做上面的預測'); return; } cap.innerHTML = '拿法：(' + cs.join(', ') + ')　←　切法：' + bits.map(function (b) { return b ? '切' : '連'; }).join('、'); found.add(bits.join(''), '(' + cs.join(',') + ')'); check(); });
      function check() { if (found.count >= 8 && !asked) { asked = true; found.el.querySelector('.pc-found').style.display = 'none'; cap.style.display = 'none'; PC.shrink(host.querySelector('svg'), 100); var qb = h('div', {}); q.append(PC.boxes(q, [2, 2, 2, 2].map(function (n, i) { return { n: n, label: '縫 ' + (i + 1) }; }), { result: 16 }).el, qb); qb.append(h('div', { class: 'pl-q', html: '「拿法」和「切法」一一對應：4 條縫，每條 2 種（切／連）。那 <b>10 顆</b>巧克力有幾種拿法？' })); P.numBox(qb, { answer: 512, okMsg: '對！10 顆有 9 條縫：2⁹ ＝ 512。', onOk: function () { P.track('aha', { id: 'count-bijection', step: 1 }); PC.tuck(qb); st.append(P.ruleBox('<b>看「縫」不看「顆」</b>：每種拿法對應一種切法，每條縫「切／連」二選一。<br>n 顆有 n−1 條縫：<b>2ⁿ⁻¹</b> 種。5 顆 ＝ 2⁴ ＝ 16，10 顆 ＝ 2⁹ ＝ 512。', '一一對應')); P.toast(api.ctx.p1 === 1 ? '你猜對了！16 種' : '16 種'); api.unlock('換成看縫，一行算完！'); }, wrong: function (v) { return v === 1024 ? '10 顆有 9 條縫，不是 10 條。' : '提示：n 顆有幾條縫？每條縫 2 種選擇。'; } }); } }
      api.solve(function () { gate.on = false; for (var m = 0; m < 8; m++) { var bits = [m & 1, m >> 1 & 1, m >> 2 & 1, 0]; found.add(bits.join(''), '(' + comp(bits, 5).join(',') + ')'); } check(); });
      st.append(cap, q); api.lock('先做上面的預測');
    },
    /* 2 補成固定 5 局 */
    function (st, api) {
      st.append(P.instr('甲、乙比賽：<b>甲先勝 3 局</b>或<b>乙先勝 2 局</b>就結束。把賽程<b>補成固定 5 局</b>（甲 3 勝、乙 2 勝），再看真正打了幾局。'));
      var host = PC.stage(st), svg = PC.svg(host, 320, 120, 'pl-svg--sm'), g = sv('g', {}), sel = [], found = PC.found(st, { label: '真實賽程' }), cap = h('div', { class: 'pl-caption' }, '點 2 個格子，當作「乙勝」的 2 局；其餘 3 局是甲勝'), q = h('div', {}), asked = false; svg.append(g);
      function draw(pad, real) {
        g.innerHTML = ''; for (var i = 0; i < 5; i++) (function (i) { var on = sel.indexOf(i) >= 0, ch = pad ? pad.charAt(i) : '？', stopped = real !== undefined && i >= real.length, gr = sv('g', { class: 'pc-tap' });
          gr.append(sv('rect', { x: 22 + i * 58, y: 28, width: 48, height: 48, rx: 10, fill: on ? '#e8f0ff' : '#fff', stroke: on ? '#2f6fdc' : '#b9ad92', 'stroke-width': 2.5, opacity: stopped ? .35 : 1 }), PC.text(46 + i * 58, 52, pad ? ch : on ? '乙' : '甲', 18, (pad ? ch : (on ? '乙' : '甲')) === '乙' ? 'pm-blue' : 'pm-pink'), PC.text(46 + i * 58, 92, '第' + (i + 1) + '局', 12, 'pm-ghost')); gr.addEventListener('click', function () { tog(i); }); g.append(gr); })(i);
        g.append(PC.text(160, 12, '補寫後的 5 局（灰色＝比賽已結束，是補寫的）', 12, 'pm-ghost'));
      }
      function realOf(pad) { var a = 0, b = 0, out = ''; for (var i = 0; i < pad.length; i++) { out += pad.charAt(i); if (pad.charAt(i) === '甲') a++; else b++; if (a === 3 || b === 2) break; } return out; }
      function tog(i) { if (sel.length === 2) sel = []; var k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else sel.push(i);
        if (sel.length === 2) { var pad = ''; for (var j = 0; j < 5; j++) pad += sel.indexOf(j) >= 0 ? '乙' : '甲'; var real = realOf(pad); draw(pad, real); cap.innerHTML = '補成 <b>' + pad + '</b>　→　從左讀到有人達標就停：真實賽程 <b>' + real + '</b>'; found.add(real); check(); return; } draw(); cap.textContent = '再點 1 個格子'; }
      function check() { if (found.count >= 6 && !asked) { asked = true; PC.shrink(svg, 110); var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '每種真實賽程，都對應「5 個位置選 2 個給乙」的唯一一種；反過來也是。所以共有幾種勝負情形？' })); P.numBox(qb, { answer: 10, okMsg: '對！C(5,2) ＝ 5×4÷2 ＝ 10。', onOk: function () { P.track('aha', { id: 'count-bijection', step: 2 }); PC.tuck(qb); st.append(P.ruleBox('<b>補成固定長度</b>：把長短不同的賽程，補成 5 局（3 甲 2 乙）。<b>一一對應</b>：每種賽程 ↔ 一個「選 2 個位置給乙」。<br>所以是 <b>C(5,2) ＝ 10</b>，不必一場一場分類。', '補寫賽程')); api.unlock('補成固定 5 局，一步算完！'); }, wrong: function (v) { return v === 20 ? '位置不分先後（乙乙順序不分），要除以 2。' : '提示：5 個位置選 2 個給乙。'; } }); } }
      api.solve(function () { for (var i = 0; i < 5; i++) for (var j = i + 1; j < 5; j++) { sel = []; tog(i); tog(j); } });
      st.append(cap, q); draw(); api.lock('找出 6 種不同的真實賽程');
    },
    /* 3 後右下：排成一列 */
    function (st, api) {
      var gate = { on: true }, ex = [1, 1, 1], list = h('div', { class: 'pc-found' }), cap = h('div', { class: 'pl-caption' }), seen = {};
      P.choice(st, api, { id: 'cb-p3', predict: true, label: '先猜猜看', prompt: '立方體從一個頂點走到對角頂點，要「右 2 次、後 2 次、下 2 次」，不多不少。最短路徑有幾種？', row: true, options: [{ t: '6 種' }, { ok: true, t: '90 種' }, { t: '720 種' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('改變右、後、下的次數'); } });
      list.style.maxHeight = '110px';
      function perms(arr) { var out = {}, rec = function (rest, pre) { if (!rest.length) { out[pre] = 1; return; } rest.forEach(function (x, i) { rec(rest.slice(0, i).concat(rest.slice(i + 1)), pre + x); }); }; rec(arr, ''); return Object.keys(out); }
      function draw() {
        var arr = []; for (var i = 0; i < ex[0]; i++) arr.push('右'); for (i = 0; i < ex[1]; i++) arr.push('後'); for (i = 0; i < ex[2]; i++) arr.push('下'); var tot = arr.length, num = PC.fact(tot) / (PC.fact(ex[0]) * PC.fact(ex[1]) * PC.fact(ex[2]));
        list.innerHTML = ''; if (tot <= 4) perms(arr).forEach(function (p) { list.append(PC.chip(p.split('').join(''), 'is-amber')); }); else list.append(h('span', { class: 'pc-note' }, '太多了，不列出來'));
        cap.innerHTML = '把 ' + tot + ' 個動作排成一列：<b>' + tot + '！ ÷ (' + ex.map(function (e) { return e + '！'; }).join(' × ') + ') ＝ ' + num + ' 種</b>';
        seen[ex.join()] = 1;
        if (seen['2,2,2'] && !st.querySelector('.pl-rule') && !gate.on) { P.track('aha', { id: 'count-bijection', step: 3 }); st.append(P.ruleBox('每條最短路徑 ＝ 把「右、後、下」的動作<b>排成一列</b>：一一對應。<br>有重複的動作要除掉重複：<b>(a＋b＋c)！ ÷ (a！b！c！)</b>。右 2、後 2、下 2：6！÷(2！2！2！) ＝ <b>90</b>。', '換個說法')); P.toast(api.ctx.p3 === 1 ? '你猜對了！90 種' : '90 種'); api.unlock('路徑＝排成一列！'); }
      }
      function mk(i, lab) { var s = P.stepper(lab, 0, 2, ex[i], function (v) { if (gate.on) { s.set(ex[i], true); return; } ex[i] = v; if (ex[0] + ex[1] + ex[2] === 0) { ex[i] = 1; s.set(1, true); } draw(); }, function (v) { return v + ' 次'; }); return s; }
      var s0 = mk(0, '右'), s1 = mk(1, '後'), s2 = mk(2, '下'), row = h('div', { class: 'pl-steprow pc-steprow3' }, s0.el, s1.el, s2.el);
      api.solve(function () { gate.on = false; ex = [2, 2, 2]; [s0, s1, s2].forEach(function (s) { s.set(2, true); }); draw(); });
      cubeFig(PC.stage(st));
      st.append(row, list, cap); draw(); api.lock('先做上面的預測');
    },
    /* 4 單位平行四邊形 ↔ 內部線段 */
    function (st, api) {
      st.append(P.instr('三角格裡，每個<b>單位平行四邊形</b>都由 2 個小三角形拼成。點格子裡的<b>淺灰線段</b>，看它對應的平行四邊形。'));
      var host = PC.stage(st), gridHost = h('div', {}), n = 4, grid, pill = P.pill('', 'is-green'), q = h('div', {}), asked = false;
      host.append(gridHost);
      function build() { gridHost.innerHTML = ''; asked = false; q.innerHTML = ''; grid = triGrid(gridHost, n, function (nf) { pill.textContent = '你標出 ' + nf + ' 個'; if (nf >= 6 && !asked) { asked = true; stp.el.style.display = 'none'; var qb = h('div', {}); q.append(qb); var ans = 3 * n * (n - 1) / 2; qb.append(h('div', { class: 'pl-q', html: '每個平行四邊形 ↔ 唯一一條<b>內部</b>單位線段（共用邊）。邊長 ' + n + ' 的大三角形，共有幾個單位平行四邊形？' })); P.numBox(qb, { answer: ans, okMsg: '對！內部線段：三個方向各 ' + n * (n - 1) / 2 + ' 條，共 ' + ans + ' 條。', onOk: function () { P.track('aha', { id: 'count-bijection', step: 4 }); PC.tuck(qb); st.append(P.ruleBox('<b>平行四邊形 ↔ 內部線段</b>：一對一，所以數線段就好。<br><b>富比尼（算兩次）</b>：邊長 n 有 n² 個小三角形，每個 3 條邊，共 3n² 次；外框 3n 條各被算 1 次，內部各被算 2 次：內部邊 ＝ (3n² − 3n) ÷ 2 ＝ <b>3n(n−1) ÷ 2</b>。', '一一對應')); api.unlock('數線段，就是數平行四邊形！'); }, wrong: function () { return '提示：三個方向各有幾條內部線段？一共 3n(n−1)÷2。'; } }); } }); pill.textContent = '你標出 0 個'; }
      var stp = P.stepper('邊長', 3, 5, 4, function (v) { n = v; build(); }, function (v) { return v + ' 格'; });
      api.solve(function () { for (var k = 0; k < 6 && !asked; k++) gridHost.querySelectorAll('line.pc-tap')[k].dispatchEvent(new MouseEvent('click', { bubbles: true })); });
      st.append(stp.el, h('div', { class: 'pl-readout' }, pill), q); build(); api.lock('先標出 6 個平行四邊形');
    },
    /* 5 窮舉：按答對題數分層 */
    function (st, api) {
      var gate = { on: true }, lit = {}, nlit = 0, c = 0;
      P.choice(st, api, { id: 'cb-p5', predict: true, label: '先猜猜看', prompt: '10 題選擇題：答對 4 分、答錯倒扣 1 分、不答 0 分。最多有幾種不同的總分？', row: true, options: [{ t: '41 種' }, { ok: true, t: '45 種' }, { t: '51 種' }], onAnswer: function (i) { api.ctx.p5 = i; gate.on = false; api.lock('按答對題數，一層一層點亮分數'); } });
      var host = PC.stage(st), svg = PC.svg(host, 320, 96, 'pl-svg--sm'), g = sv('g', {}), pill = P.pill('', 'is-blue'), cap = h('div', { class: 'pl-caption' }), q = h('div', {}), asked = false, layers = {}; svg.append(g);
      function draw() {
        g.innerHTML = ''; for (var s = -10; s <= 40; s++) { var x = 6 + (s + 10) * 6.1, on = lit[s]; g.append(sv('rect', { x: x, y: 28, width: 5.4, height: 34, rx: 1, fill: on ? '#1f9d55' : '#e3dccd' })); }
        [-10, 0, 10, 20, 30, 40].forEach(function (s) { g.append(PC.text(6 + (s + 10) * 6.1 + 2.7, 76, String(s), 12, 'pm-ghost')); });
        g.append(PC.text(160, 12, '所有可能的分數（−10 到 40）', 12, 'pm-ghost'));
        pill.textContent = '已點亮 ' + Object.keys(layers).length + ' / 11 層';
      }
      var stp = P.stepper('答對題數', 0, 10, 0, function (v) { if (gate.on) { stp.set(0, true); return; } c = v; cap.innerHTML = '答對 ' + c + ' 題：答錯 w 題（0 到 ' + (10 - c) + '），分數 ＝ 4×' + c + ' − w，涵蓋 <b>' + (5 * c - 10) + ' 到 ' + 4 * c + '</b> 每一個整數'; }, function (v) { return v + ' 題'; });
      var btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '點亮這一層');
      btn.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } if (layers[c]) return; layers[c] = 1; for (var s = 5 * c - 10; s <= 4 * c; s++) if (!lit[s]) { lit[s] = 1; nlit++; } draw(); check(); });
      function check() { if (Object.keys(layers).length === 11 && !asked) { asked = true; var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '最低 −10、最高 40，中間共 51 個整數，但有幾個<b>暗的格子</b>點不亮（無法得到的分數）。不同的總分共有幾種？' })); P.numBox(qb, { answer: 45, okMsg: '對！暗的是 29、33、34、37、38、39 共 6 個：51 − 6 ＝ 45。', onOk: function () { P.track('aha', { id: 'count-bijection', step: 5 }); PC.tuck(qb); st.append(P.ruleBox('<b>窮舉也要有系統</b>：按「答對幾題」分層，每層的分數是連續的一段；再看全部合起來有哪些洞。<br>驗算：51 − 6 ＝ <b>45</b> 種。', '分層窮舉')); P.toast(api.ctx.p5 === 1 ? '你猜對了！45 種' : '45 種'); api.unlock('分層窮舉！'); }, wrong: function (v) { return v === 51 ? '51 是最低到最高的所有整數，但 29、33 等分數得不到，要扣掉。' : '提示：數數暗格子有幾個，51 再扣掉。'; } }); } }
      api.solve(function () { gate.on = false; for (var v = 0; v <= 10; v++) { stp.set(v); btn.click(); } });
      st.append(stp.el, h('div', { class: 'pc-btnrow' }, btn), cap, h('div', { class: 'pl-readout' }, pill), q); draw(); api.lock('先做上面的預測');
    },
    /* 6 換個外觀 */
    function (st, api) {
      PC.quiz(st, api, 'count-bijection', [
        function (box, done) {
          var host = PC.stage(box), pill = P.pill('', 'is-green'); chocolate(host, 8, function (bits, cs) { pill.textContent = '拿法 (' + cs.join(', ') + ')'; }); box.append(h('div', { class: 'pl-readout' }, pill));
          PC.num(box, '8 顆巧克力排成一列，分次拿完（每次拿連續的幾顆）。共有幾種拿法？（點縫試試）', 128, done, '對！8 顆有 7 條縫：2⁷ ＝ 128。', function (v) { return v === 256 ? '8 顆有 7 條縫（不是 8 條）：2⁷。' : '提示：n 顆有 n−1 條縫，每條縫 2 種。'; });
        },
        function (box, done) {
          var found = PC.found(box, { label: '已排出' }), cur = h('div', { class: 'pc-btnrow' }), btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '隨機排一列');
          box.append(h('div', { class: 'pl-q', html: '右 2 次、後 2 次、下 2 次，排成一列。有幾種排法？（按鈕可以隨機排一列看看）' }), cur, btn);
          btn.addEventListener('click', function () { var a = PC.shuffle(['右', '右', '後', '後', '下', '下']); cur.innerHTML = ''; a.forEach(function (t) { cur.append(PC.chip(t, t === '右' ? 'is-blue' : t === '後' ? 'is-amber' : 'is-pink')); }); found.add(a.join('')); });
          P.numBox(box, { answer: 90, okMsg: '對！6！÷ (2！2！2！) ＝ 720 ÷ 8 ＝ 90。', onOk: done, wrong: function (v) { return v === 720 ? '720 是 6 個動作全不同的排法；有 3 組一樣的動作，要除以 2！× 2！× 2！＝ 8。' : '提示：6！ 再除掉重複。'; } });
        },
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 120, 'pl-svg--sm'), g = sv('g', {}), pick = -1, mode = '甲', found = PC.found(box, { label: '真實賽程' }); svg.append(g);
          function realOf(pad) { var a = 0, b = 0, out = ''; for (var i = 0; i < pad.length; i++) { out += pad.charAt(i); if (pad.charAt(i) === '甲') a++; else b++; if (a === 2 || b === 2) break; } return out; }
          function draw(pad, real) { g.innerHTML = ''; for (var i = 0; i < 3; i++) (function (i) { var gr = sv('g', { class: 'pc-tap' }), ch = pad ? pad.charAt(i) : '？', stopped = real !== undefined && i >= real.length; gr.append(sv('rect', { x: 62 + i * 70, y: 22, width: 56, height: 52, rx: 10, fill: i === pick ? '#e8f0ff' : '#fff', stroke: i === pick ? '#2f6fdc' : '#b9ad92', 'stroke-width': 2.5, opacity: stopped ? .35 : 1 }), PC.text(90 + i * 70, 48, ch, 20, ch === '乙' ? 'pm-blue' : 'pm-pink'), PC.text(90 + i * 70, 92, '第' + (i + 1) + '局', 12, 'pm-ghost')); gr.addEventListener('click', function () { pick = i; var other = mode === '甲' ? '乙' : '甲', pd = ''; for (var j = 0; j < 3; j++) pd += j === pick ? other : mode; var r = realOf(pd); draw(pd, r); found.add(r); }); g.append(gr); })(i); g.append(PC.text(160, 10, '點 1 格當「少數方」，其餘補成同一人（共 3 局）', 12, 'pm-ghost')); }
          var btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '多數方：甲'); btn.addEventListener('click', function () { mode = mode === '甲' ? '乙' : '甲'; btn.textContent = '多數方：' + mode; });
          draw(); box.append(h('div', { class: 'pc-btnrow' }, btn));
          PC.num(box, '改規則：<b>先勝 2 局</b>者獲勝（最多 3 局）。補成固定 3 局（2 勝＋1 勝），一一對應「選哪 1 局給少數方」。真實賽程共有幾種？（甲贏、乙贏都要算）', 6, done, '對！甲贏 3 種＋乙贏 3 種 ＝ 6（也可用 2 × C(3,1) ＝ 6）。', function (v) { return v === 3 ? '3 只是其中一方贏的賽程，另一方也要算：再 × 2。' : '提示：3 個位置選 1 個給少數方，甲贏、乙贏各一組。'; });
        }]);
    },
    /* 7 完成 */
    function (st) {
      P.complete(st, {
        id: 'count-bijection', moduleName: '一一對應與換個說法', askAbout: '國中資優的計數與一一對應', aha: '難數的東西，換成一一對應的好數的東西；<br>換個說法，答案一眼看穿。',
        cards: [{ text: '一一對應：拿法 ↔ 切法；賽程 ↔ 補成固定長度的排列；平行四邊形 ↔ 內部線段', src: '宗翰講義「基本計數／排組原理」主題 5' }, { text: '窮舉要分層：按答對題數分層，再看有哪些洞', src: '宗翰講義 主題 6' }],
        depth: { here: 0.3, cheetah: [{ at: 0.58, label: '富比尼<br>算兩次' }, { at: 0.9, label: '遞迴<br>補寫與反射' }] },
        teasers: [
          { title: '巧克力與插板法', q: '把 n 顆相同的巧克力分給 k 個人，用「插板」一一對應成排列，C(n+k−1, k−1)。', where: 'PK3D 插板法', lv: 'L2' },
          { title: '三角格裡的平行四邊形（富比尼）', q: '邊長 n 時是 3n(n−1)÷2，換成三角形與邊的配對算兩次。', where: '宗翰講義 主題 5 說例 1（專家思維）', lv: 'L3' },
          { title: '反射原理（賽程補寫的升級版）', q: '路徑計數裡，把碰到線之後的路徑「翻過去」，就能一一對應。', where: '高中數學班／競賽班', lv: 'L3' },
          { title: 'Fubini 雙重計數', q: '同一批東西數兩次，是競賽組合最常用的武器。', where: 'A1012prep 富比尼原理', lv: 'L3' }],
        parent: { pitfall: '孩子數難題時，常常「一個一個列」；其實可以先問：這個東西能不能一一對應成一個更好數的東西？', place: '國中資優班到高中競賽的重要思維，是「換個角度」的核心例子。', ask: ['這個東西可以對應到什麼更好數的東西？', '為什麼這兩種東西是一對一的？', '有沒有可能補成固定長度？'] },
        classes: ['宗翰講義：基本計數／排組原理（主題 5、6）', 'PK3D：插板法', 'A1012prep：富比尼原理'],
        next: { href: 'play.html', text: '回獵豹玩中學看全部單元' } });
    }];
  new P.Lesson({ id: 'count-bijection', title: '一一對應與換個說法', steps: steps });
})();
