/* 獵豹玩中學｜加法原理與標數法（宗翰講義 主題3）：分類相加、路口標數、遞迴 */
(function () {
  var P = Play, h = P.h, PC = window.PC, sv = PC.sv;

  /* 路口標數格：cols×rows 個路口，missH=[[c,r]] 缺少 (c,r)→(c+1,r) 的橫街，missV 缺少 (c,r)→(c,r+1) 的縱街 */
  function makeGrid(host, o) {
    var cols = o.cols, rows = o.rows, W = 320, dx = (W - 70) / (cols - 1), dy = 50, H = 58 + (rows - 1) * dy, svg = PC.svg(host, W, H, 'pl-svg--sm'), g = sv('g', {}), val = {}, miss = {};
    svg.append(g); (o.missH || []).forEach(function (m) { miss['H' + m] = 1; }); (o.missV || []).forEach(function (m) { miss['V' + m] = 1; });
    val['0,0'] = 1;
    function X(c) { return 35 + c * dx; } function Y(r) { return H - 24 - r * dy; }
    function hasH(c, r) { return c >= 0 && c < cols - 1 && !miss['H' + [c, r]]; } function hasV(c, r) { return r >= 0 && r < rows - 1 && !miss['V' + [c, r]]; }
    function pre(c, r) { var p = []; if (hasH(c - 1, r)) p.push([c - 1, r]); if (hasV(c, r - 1)) p.push([c, r - 1]); return p; }
    function ready(c, r) { var p = pre(c, r); return p.length > 0 && p.every(function (q) { return val[q.join()] !== undefined; }); }
    function draw(fresh) {
      g.innerHTML = '';
      var c, r;
      for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) { if (hasH(c, r)) g.append(sv('line', { x1: X(c), y1: Y(r), x2: X(c + 1), y2: Y(r), class: 'pl-line', style: 'stroke:#6d6250;stroke-width:3;stroke-dasharray:none' })); if (hasV(c, r)) g.append(sv('line', { x1: X(c), y1: Y(r), x2: X(c), y2: Y(r + 1), class: 'pl-line', style: 'stroke:#6d6250;stroke-width:3;stroke-dasharray:none' })); }
      g.append(PC.text(X(0), Y(0) + 27, 'A 出發', 12, 'pm-pink'), PC.text(X(cols - 1), Y(rows - 1) - 26, '終點 B', 12, 'pm-pink'));
      for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) (function (c, r) {
        var k = c + ',' + r, v = val[k], isA = c === 0 && r === 0, isB = c === cols - 1 && r === rows - 1, can = v === undefined && ready(c, r), gr = sv('g', { class: can ? 'pc-node is-pending' : 'pc-node', transform: 'translate(' + X(c) + ',' + Y(r) + ')' });
        gr.append(sv('circle', { r: 20, fill: 'transparent' }), sv('circle', { r: 14, class: 'pc-c ' + (v !== undefined ? (isB ? 'pc-c--pink' : 'pc-c--blue') : 'pc-c--navy'), style: v === undefined && !can ? 'opacity:.45' : '' }), PC.text(0, 1, v !== undefined ? String(v) : (isA ? 'A' : isB ? 'B' : ''), v !== undefined && v > 99 ? 11 : 13, 'pc-tw'));
        if (v === undefined && isB) { gr.lastChild.textContent = 'B'; }
        gr.addEventListener('click', function () { tap(c, r); }); g.append(gr);
        if (fresh === k) { gr.style.transformBox = 'fill-box'; gr.style.transformOrigin = 'center'; P.pop(gr, 0.3); }
      })(c, r);
    }
    function tap(c, r) {
      var k = c + ',' + r; if (val[k] !== undefined) return;
      if (!ready(c, r)) { P.toast('先標好它左邊和下面「有街相連」的路口'); return; }
      var s = 0; pre(c, r).forEach(function (q) { s += val[q.join()]; }); val[k] = s; draw(k); if (o.onReveal) o.onReveal(c, r, s, pre(c, r).map(function (q) { return val[q.join()]; }));
    }
    draw(); return { val: function (c, r) { return val[c + ',' + r]; }, final: function () { return val[(cols - 1) + ',' + (rows - 1)]; } };
  }
  /* 青蛙石塊：n 個石塊排成圓；點擊跳過去。onJump(path) */
  function stones(host, n, onJump) {
    var svg = PC.svg(host, 320, 190, 'pl-svg--sm'), g = sv('g', {}), pos = [], path = [0], names = 'ABCDE'.split(''), i; svg.append(g);
    for (i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; pos.push([160 + 70 * Math.cos(a), 98 + 70 * Math.sin(a)]); }
    function draw() {
      g.innerHTML = ''; var i, j;
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) g.append(sv('line', { x1: pos[i][0], y1: pos[i][1], x2: pos[j][0], y2: pos[j][1], class: 'pl-line', style: 'stroke:#d9ccb0;stroke-width:1.5;stroke-dasharray:none' }));
      for (i = 0; i + 1 < path.length; i++) g.append(sv('line', { x1: pos[path[i]][0], y1: pos[path[i]][1], x2: pos[path[i + 1]][0], y2: pos[path[i + 1]][1], class: 'pl-line pl-line--green pl-line--bold' }));
      var cur = path[path.length - 1];
      for (i = 0; i < n; i++) (function (i) { var gr = sv('g', { class: 'pc-tap' }); gr.append(sv('circle', { cx: pos[i][0], cy: pos[i][1], r: 24, fill: 'transparent' }), sv('circle', { cx: pos[i][0], cy: pos[i][1], r: 15, class: 'pc-c ' + (i === cur ? 'pc-c--green' : i === 0 ? 'pc-c--pink' : 'pc-c--navy'), stroke: '#fff', 'stroke-width': 2 }), PC.text(pos[i][0], pos[i][1] + 1, names[i], 14, 'pc-tw')); gr.addEventListener('click', function () { jump(i); }); g.append(gr); })(i);
      if (path.length > 1) g.append(PC.text(160, 98, (path.length - 1) + ' 跳', 14, 'pm-amber'));
    }
    function jump(i) { var cur = path[path.length - 1]; if (i === cur) { P.toast('每次必須跳到「別的」石塊'); return; } path.push(i); draw(); if (onJump) onJump(path.map(function (k) { return names[k]; }).join('')); }
    draw(); return { reset: function () { path = [0]; draw(); }, len: function () { return path.length - 1; } };
  }

  var steps = [
    /* 1 乘還是加？ */
    function (st, api) {
      st.append(P.instr('每一題都要選：是<b>連乘</b>，還是<b>相加</b>？'));
      var cards = [
        { t: '從家走到車站（3 條路），再從車站走到學校（2 條路）。', a: 'x', why: '乘：3 × 2 ＝ 6（兩段都要走）' },
        { t: '去學校可以搭公車（2 條路線）<b>或</b>搭捷運（3 條路線），只選一種。', a: '+', why: '加：2 ＋ 3 ＝ 5（只做其中一類）' },
        { t: '點餐：先選 1 種主餐（4 種），再選 1 種飲料（3 種）。', a: 'x', why: '乘：4 × 3 ＝ 12（兩樣都要選）' },
        { t: '週末只去一個地方：動物園有 2 種套票，科博館有 3 種套票。', a: '+', why: '加：2 ＋ 3 ＝ 5（只去一個地方）' }], ok = 0, box = h('div', { class: 'pc-cards' });
      cards.forEach(function (c) {
        var el = h('div', { class: 'pc-card' }, h('div', { class: 'pc-card__t', html: c.t }), h('div', { class: 'pc-btnrow' })), why = h('div', { class: 'pl-fb' }), row = el.lastChild, done = false;
        [['x', '連乘 ×'], ['+', '相加 ＋']].forEach(function (o) { var b = h('button', { type: 'button', class: 'pc-tab' }, o[1]); b.addEventListener('click', function () {
          if (done) return; if (o[0] === c.a) { done = true; ok++; b.classList.add('is-on'); why.className = 'pl-fb is-good'; why.innerHTML = '✓ ' + c.why; row.style.display = 'none'; el.classList.add('is-ok'); P.track('choice_ok', { id: 'count-add-1' });
            if (ok === 4) { P.track('aha', { id: 'count-add', step: 1 }); st.append(P.ruleBox('<b>分成連續的步驟，每一步都要做 → 乘</b>。<br><b>分成不同的類別，只做其中一類 → 加</b>。', '乘或加')); api.unlock('分得出乘或加了！'); } }
          else { P.shake(el); why.className = 'pl-fb is-bad'; why.textContent = '再想想：兩件事都要做，還是只做其中一件？'; } }); row.append(b); });
        el.append(why); box.append(el);
      });
      st.append(box); api.lock('4 題都答對');
    },
    /* 2 路線分類：A → D */
    function (st, api) {
      var gate = { on: true }, nAB = 3, revealed = {}, nrev = 0, host, svgHost, sum = h('div', { class: 'pc-calc' }), asked = false, q = h('div', {});
      P.choice(st, api, { id: 'ca-p2', predict: true, label: '先猜猜看', prompt: '由 A 走到 D，不走回頭路。有幾種路線？（A–B 3 條、B–C 3 條、C–D 2 條，另有長路 A–C、B–D、A–D 各 1 條）', row: true, options: [{ t: '18 種' }, { t: '24 種' }, { t: '36 種' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('依「經過哪些中間站」分類'); } });
      host = PC.stage(st); svgHost = h('div', {}); host.append(svgHost);
      var cats = [{ id: 'AD', t: 'A→D 直達', edges: ['AD'], f: function () { return [1]; } }, { id: 'ABD', t: 'A→B→D', edges: ['AB', 'BD'], f: function () { return [nAB, 1]; } }, { id: 'ACD', t: 'A→C→D', edges: ['AC', 'CD'], f: function () { return [1, 2]; } }, { id: 'ABCD', t: 'A→B→C→D', edges: ['AB', 'BC', 'CD'], f: function () { return [nAB, 3, 2]; } }];
      function draw() {
        svgHost.innerHTML = ''; var svg = PC.svg(svgHost, 320, 150, 'pl-svg--sm'), X = { A: 36, B: 118, C: 202, D: 284 }, y0 = 82, hl = {};
        cats.forEach(function (c) { if (revealed[c.id] === 'cur') c.edges.forEach(function (e) { hl[e] = 1; }); });
        function road(a, b, k, cnt, key) { var off = (k - (cnt - 1) / 2) * 15; svg.append(sv('path', { d: 'M' + X[a] + ' ' + y0 + ' Q' + (X[a] + X[b]) / 2 + ' ' + (y0 + off * 2) + ' ' + X[b] + ' ' + y0, fill: 'none', class: 'pl-line ' + (hl[key] ? 'pl-line--green pl-line--bold' : ''), style: hl[key] ? '' : 'stroke:#b9ad92;stroke-width:2.5;stroke-dasharray:none' })); }
        function longRoad(a, b, ctrl, key) { svg.append(sv('path', { d: 'M' + X[a] + ' ' + y0 + ' Q' + (X[a] + X[b]) / 2 + ' ' + ctrl + ' ' + X[b] + ' ' + y0, fill: 'none', class: 'pl-line ' + (hl[key] ? 'pl-line--green pl-line--bold' : ''), style: hl[key] ? '' : 'stroke:#b9ad92;stroke-width:2.5;stroke-dasharray:none' })); }
        for (var k = 0; k < nAB; k++) road('A', 'B', k, nAB, 'AB'); for (k = 0; k < 3; k++) road('B', 'C', k, 3, 'BC'); for (k = 0; k < 2; k++) road('C', 'D', k, 2, 'CD');
        longRoad('A', 'D', -34, 'AD'); longRoad('A', 'C', 8, 'AC'); longRoad('B', 'D', 156, 'BD');
        Object.keys(X).forEach(function (n) { svg.append(sv('circle', { cx: X[n], cy: y0, r: 13, class: 'pc-c pc-c--navy', stroke: '#fff', 'stroke-width': 2 }), PC.text(X[n], y0 + 1, n, 13, 'pc-tw')); });
      }
      var tabs = h('div', { class: 'pc-tabs' });
      cats.forEach(function (c) { var b = h('button', { type: 'button', class: 'pc-tab' }, c.t); b.addEventListener('click', function () {
        if (gate.on) { P.toast('先做上面的預測'); return; }
        cats.forEach(function (x) { if (revealed[x.id] === 'cur') revealed[x.id] = 'done'; }); if (!revealed[c.id]) nrev++; revealed[c.id] = 'cur'; draw(); calc(c); stepper.el.style.display = nrev >= 1 ? 'none' : ''; check(); }); tabs.append(b); });
      function total() { var t = 0; cats.forEach(function (c) { t += c.f().reduce(function (a, b) { return a * b; }, 1); }); return t; }
      function calc(c) {
        var f = c.f(), lines = []; cats.forEach(function (x) { if (revealed[x.id]) lines.push(x.t + '：' + x.f().join(' × ') + ' ＝ ' + x.f().reduce(function (a, b) { return a * b; }, 1)); });
        sum.innerHTML = lines.join('<br>');
      }
      function check() {
        if (nrev === 4 && !asked) { asked = true; var tot = total(); tabs.style.display = 'none'; var qb = h('div', {}); q.append(qb); qb.append(h('div', { class: 'pl-q', html: '四類互不重複、也沒有遺漏。把四類的種數<b>加起來</b>，A 到 D 共有幾種？' })); P.numBox(qb, { answer: tot, okMsg: '對！' + cats.map(function (x) { return x.f().reduce(function (a, b) { return a * b; }, 1); }).join(' ＋ ') + ' ＝ ' + tot + '。每一類裡面用乘法，類和類之間用加法。', onOk: function () { P.track('aha', { id: 'count-add', step: 2 }); setTimeout(function () { qb.style.display = 'none'; }, 1500); st.append(P.ruleBox('先依「<b>經過哪些中間站</b>」分類（加法），每一類裡面各段連乘（乘法）。<br>只有 B、C 兩個中間站：有沒有經過 B、有沒有經過 C，共 4 類，不重複不遺漏。', '分類')); P.toast(api.ctx.p2 === 1 ? '你猜對了！24 種' : '分類加起來是 24 種'); api.unlock('分類相加，類內連乘！'); } }); }
      }
      var stepper = P.stepper('A–B 路數', 1, 4, 3, function (v) { if (gate.on) { stepper.set(3, true); return; } nAB = v; draw(); }, function (v) { return v + ' 條'; });
      st.append(stepper.el, tabs, sum, q); draw(); api.lock('先做上面的預測');
    },
    /* 3 標數法 */
    function (st, api) {
      st.append(P.instr('走<b>捷徑</b>（只往右、往上）。點路口標數：<b>左邊的數 ＋ 下面的數</b>（有街相連才加）。從 A 往外標到 B。'));
      var host = PC.stage(st), done = false, cap = h('div', { class: 'pl-caption' }, '先標好左邊和下面的路口，才能標這個路口。亮起來閃的就可以點。');
      var grid = makeGrid(host, { cols: 5, rows: 4, missH: [[1, 1], [2, 2]], missV: [[3, 0]], onReveal: function (c, r, v, parts) { cap.innerHTML = '這個路口 ＝ ' + parts.join(' ＋ ') + ' ＝ <b>' + v + '</b>' + (parts.length === 1 ? '（只有一條路通到這裡，直接抄）' : ''); if (c === 4 && r === 3 && !done) { done = true; P.track('aha', { id: 'count-add', step: 3 }); st.append(P.ruleBox('<b>每個路口 ＝ 左邊的數 ＋ 下面的數</b>（有街相連才加；只有一條路就直接抄）。<br>街道缺得不整齊、沒有公式時，一個路口一個路口標數最可靠。B 處共有 <b>' + v + '</b> 條捷徑。', '標數法')); api.unlock('B 處有 ' + v + ' 條捷徑！'); } } });
      st.append(cap); api.lock('標到右上角 B');
    },
    /* 4 青蛙跳：先玩 */
    function (st, api) {
      st.append(P.instr('青蛙在 A，<b>連跳 4 次</b>，每次必須跳到別的石塊，最後要<b>回到 A</b>。點石塊試試，找出不同的跳法。'));
      var host = PC.stage(st), found = PC.found(st, { label: '已找到' }), pill = P.pill('', 'is-blue'), fr;
      fr = stones(host, 5, function (s) {
        pill.textContent = s.split('').join('→');
        if (fr.len() === 4) { var ok = s.charAt(4) === 'A'; if (ok) { var isNew = found.add(s, s.split('').join('→')); P.toast(isNew ? '回到 A 了！新的跳法' : '這條走過了'); } else P.toast('第 4 跳沒回到 A，重來'); setTimeout(function () { fr.reset(); pill.textContent = 'A'; check(); }, 700); }
      });
      st.append(h('div', { class: 'pl-readout' }, pill)); pill.textContent = 'A';
      function check() { if (found.count >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-add', step: 4 }); st.append(P.ruleBox('光是這樣找就找了好久。其實總共有 <b>52 種</b>！下一步看看怎麼不用一條一條找就算出來。', '好多！')); api.unlock('找到好幾種了！'); } }
      api.lock('找出 4 種不同的跳法');
    },
    /* 4b 遞迴 */
    function (st, api) {
      st.append(P.instr('換個想法：<b>前 n−1 次隨便跳</b>（每次 4 種選擇），<b>第 n 次要跳回 A</b>，前提是第 n−1 次不在 A。'));
      var vals = [0, 0, 4, 12], rows = 0, tbl = h('table', { class: 'pc-tbl' }, h('tr', {}, h('th', {}, '跳 n 次'), h('th', {}, '隨便跳'), h('th', {}, '扣掉「上一次在 A」'), h('th', {}, '回到 A'))), btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '算下一列'), q = h('div', {}), asked = false;
      var an = [1, 0, 4, 12];
      function addRow(n) { var tot = Math.pow(4, n - 1), minus = an[n - 1], r = h('tr', {}, h('td', {}, String(n)), h('td', {}, '4' + '⁰¹²³⁴'.charAt(n - 1) + ' ＝ ' + tot), h('td', {}, '− ' + minus), h('td', {}, h('b', {}, String(tot - minus)))); tbl.append(r); P.pop(r); }
      btn.addEventListener('click', function () { rows++; addRow(rows); if (rows === 3 && !asked) { asked = true; btn.style.display = 'none'; q.append(h('div', { class: 'pl-q', html: '照同樣的方法：跳 4 次回到 A 的方法數 ＝ 4³ − (跳 3 次回到 A 的 12 種) ＝ ？' })); P.numBox(q, { answer: 52, before: 'a₄ ＝', okMsg: '對！64 − 12 ＝ 52，和你一條一條找的同一件事（只是不用找）。', onOk: function () { P.track('aha', { id: 'count-add', step: 5 }); st.append(P.ruleBox('<b>aₙ ＝ 4ⁿ⁻¹ − aₙ₋₁</b>：前 n−1 次隨便跳，扣掉「第 n−1 次剛好在 A」的情形。<br>a₁＝0、a₂＝4、a₃＝12、a₄＝<b>52</b>、a₅＝204。每多跳一次只要一行算式。', '遞迴（補集）')); api.unlock('52 種，一行算出來！'); } }); } });
      st.append(tbl, h('div', { class: 'pc-btnrow' }, btn), q); api.lock('按「算下一列」，再算 a₄');
    },
    /* 5 換個外觀 */
    function (st, api) {
      PC.quiz(st, api, 'count-add', [
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 130, 'pl-svg--sm'), X = [46, 160, 274], y0 = 66;
          for (var k = 0; k < 3; k++) { var off = (k - 1) * 17; svg.append(sv('path', { d: 'M46 66 Q103 ' + (66 + off * 2) + ' 160 66', fill: 'none', style: 'stroke:#b9ad92;stroke-width:2.5' })); }
          for (k = 0; k < 5; k++) { var o2 = (k - 2) * 14, bus = k < 2; svg.append(sv('path', { d: 'M160 66 Q217 ' + (66 + o2 * 2) + ' 274 66', fill: 'none', style: 'stroke:' + (bus ? '#2f6fdc' : '#d6336c') + ';stroke-width:2.8' })); }
          X.forEach(function (x, i) { svg.append(sv('circle', { cx: x, cy: y0, r: 13, class: 'pc-c pc-c--navy', stroke: '#fff', 'stroke-width': 2 }), PC.text(x, y0 + 1, ['家', '站', '校'][i], 13, 'pc-tw')); });
          svg.append(PC.text(217, 14, '藍：公車 2 條', 12, 'pm-blue'), PC.text(217, 122, '粉紅：捷運 3 條', 12, 'pm-pink'));
          PC.num(box, '家到車站有 3 條路；車站到學校可以搭<b>公車（2 條）或捷運（3 條）</b>，二選一。家到學校共有幾種走法？', 15, done, '對！車站到學校 2 ＋ 3 ＝ 5 種（分類加），再和第一段連乘：3 × 5 ＝ 15。', function (v) { return v === 18 ? '車站到學校是「二選一」，要相加 2 ＋ 3 ＝ 5，不是 2 × 3。' : '提示：先算車站到學校共有幾種（加），再和家到車站連乘。'; });
        },
        function (box, done) {
          var host = PC.stage(box), gr = makeGrid(host, { cols: 4, rows: 3, missH: [[1, 1]], missV: [] });
          var ans = 0; (function () { var v = {}; v['0,0'] = 1; for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) { if (c === 0 && r === 0) continue; var s = 0; if (c > 0 && !(c - 1 === 1 && r === 1)) s += v[(c - 1) + ',' + r]; if (r > 0) s += v[c + ',' + (r - 1)]; v[c + ',' + r] = s; } ans = v['3,2']; })();
          PC.num(box, '點路口標數（缺了一小段橫街）。從 A 走捷徑到 B，共有幾條？', ans, done, '對！B 處 ＝ 左邊 ＋ 下面，共 ' + ans + ' 條。', function () { return '提示：每個路口 ＝ 左邊的數 ＋ 下面的數（有街相連才加）。'; });
        },
        function (box, done) {
          var host = PC.stage(box), fr = stones(host, 3, function () { });
          PC.num(box, '青蛙在 3 個石塊 A、B、C 之間跳，每次必須跳到別的石塊。從 A 出發連跳 <b>3 次</b>回到 A，有幾種跳法？（點石塊試試）', 2, done, '對！aₙ ＝ 2ⁿ⁻¹ − aₙ₋₁：a₁＝0、a₂＝2、a₃＝4 − 2 ＝ 2。（A→B→C→A、A→C→B→A）', function (v) { return v === 4 ? '4 是前 2 次隨便跳的方法數，要扣掉「第 2 次剛好在 A」的 2 種。' : '提示：先試著跳跳看，第 3 跳要回到 A，前 2 次不能在 A。'; });
        }]);
    },
    /* 6 完成 */
    function (st) {
      P.complete(st, {
        id: 'count-add', moduleName: '加法原理與標數法', askAbout: '國小高年級到國中的計數', aha: '分成不同的類別、只做其中一類，就相加；<br>類別裡面的每一步，再連乘。',
        cards: [{ text: '分類（只做其中一類）→ 加；連續步驟（都要做）→ 乘', src: '宗翰講義「基本計數／排組原理」主題 3' }, { text: '標數法：路口 ＝ 左邊 ＋ 下面；遞迴 aₙ ＝ 4ⁿ⁻¹ − aₙ₋₁', src: '宗翰講義 主題 3（說例 3、4）' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '遞迴<br>補集' }, { at: 0.88, label: '一一對應<br>富比尼原理' }] },
        teasers: [
          { title: '逐站累加 f(X)', q: '站數很多的路線圖，一站一站累加比分類更好用：f(D) ＝ 1 ＋ f(B)×1 ＋ f(C)×2。', where: '宗翰講義 主題 3 說例 2（另解）', lv: 'L2' },
          { title: '遞迴與一般式', q: 'aₙ ＝ (4ⁿ ＋ 4·(−1)ⁿ) ÷ 5，怎麼用遞迴猜出一般式？', where: '宗翰講義 主題 3 說例 3（專家思維）', lv: 'L3' },
          { title: '整數分拆', q: '把整數拆成幾個正整數的和，用加法原理分類，數得完不重複。', where: 'PK1A（2607）第 3 堂「整數分拆」', lv: 'L2' },
          { title: 'Fubini 雙重計數', q: '同一批東西從兩個角度數兩次，直接算出難題。', where: 'A1012prep 富比尼原理', lv: 'L3' }],
        parent: { pitfall: '最常見的錯誤是「乘加混用」：該分類相加時連乘，或該連乘時相加。另一個常見問題是分類有重疊或遺漏。', place: '國小高年級到國中的計數基礎，標數法與遞迴是後面排列組合與機率的重要工具。', ask: ['這件事是「連續的步驟」還是「不同的類別」？', '分類的時候，怎麼確定不重複也不遺漏？', '標數法裡，一個路口的數字是怎麼來的？'] },
        classes: ['宗翰講義：基本計數／排組原理（主題 3 加法原理）', 'PK1A（2607）：整數分拆', 'A1012prep：富比尼原理'],
        next: { href: 'play-count-comb.html', text: '下一個：組合與算兩次' } });
    }];
  new P.Lesson({ id: 'count-add', title: '加法原理與標數法', steps: steps });
})();
