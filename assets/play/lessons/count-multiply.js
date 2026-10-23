/* 獵豹玩中學｜乘法原理（宗翰講義 主題2）：每一步都要做 → 選項盒子連乘 */
(function () {
  var P = Play, h = P.h, PC = window.PC, sv = PC.sv;
  var COLS = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f', '#7a4fd6'], COLN = ['藍', '紅', '綠', '黃', '紫'];

  /* 路線圖：段數與每段路數；picked = 每段選第幾條（高亮） */
  function routeSvg(host, counts, picked, names) {
    var n = counts.length, W = 320, H = 130, svg = PC.svg(host, W, H, 'pl-svg--sm'), xs = [], i, k;
    for (i = 0; i <= n; i++) xs.push(36 + i * (W - 72) / n);
    for (i = 0; i < n; i++) for (k = 0; k < counts[i]; k++) {
      var off = (k - (counts[i] - 1) / 2) * 17, hl = picked && picked[i] === k;
      svg.append(sv('path', { d: 'M' + xs[i] + ' 66 Q' + (xs[i] + xs[i + 1]) / 2 + ' ' + (66 + off * 2) + ' ' + xs[i + 1] + ' 66', fill: 'none', class: 'pl-line ' + (hl ? 'pl-line--green pl-line--bold' : 'pl-line--soft'), style: hl ? '' : 'stroke-dasharray:none;stroke:#b9ad92' }));
    }
    for (i = 0; i <= n; i++) { svg.append(sv('circle', { cx: xs[i], cy: 66, r: 13, class: 'pc-c pc-c--navy', stroke: '#fff', 'stroke-width': 2 }), PC.text(xs[i], 67, (names || 'ABCDE')[i], 13, 'pc-tw')); }
    return svg;
  }

  var steps = [
    /* 1 數對：先選 x 再選 y */
    function (st, api) {
      var gate = { on: true }, sel = { x: null, y: null }, filled = {}, nfill = 0, xs = ['1', '2', '3'], ys = ['a', 'b'];
      P.choice(st, api, { id: 'cm-p1', predict: true, label: '先猜猜看', prompt: '數對 (x, y)：x 可以是 1、2、3，y 可以是 a、b。一共能寫出幾種數對？', row: true, options: [{ t: '5 種' }, { ok: true, t: '6 種' }, { t: '8 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('先選 x，再選 y，寫出所有數對'); } });
      var rx = h('div', { class: 'pc-tabs' }), ry = h('div', { class: 'pc-tabs' }), pill = P.pill('', 'is-green'), cells = {};
      var tbl = h('table', { class: 'pc-tbl' }, h('tr', {}, h('th', {}, 'x＼y'), h('th', {}, 'a'), h('th', {}, 'b')));
      xs.forEach(function (x) { var r = h('tr', {}, h('th', {}, x)); ys.forEach(function (y) { var c = h('td', {}, '　'); cells[x + y] = c; r.append(c); }); tbl.append(r); });
      function upd() { pill.textContent = '已寫出 ' + nfill + ' 種'; pill.className = 'pl-pill is-green' + (nfill === 6 ? ' is-ok' : ''); }
      function pick(kind, v, b) {
        if (gate.on) { P.toast('先做上面的預測'); return; } sel[kind] = v; (kind === 'x' ? rx : ry).querySelectorAll('.pc-tab').forEach(function (e) { e.classList.toggle('is-on', e === b); });
        if (sel.x && sel.y) { var k = sel.x + sel.y; if (!filled[k]) { filled[k] = 1; nfill++; cells[k].textContent = '(' + sel.x + ', ' + sel.y + ')'; cells[k].style.background = '#e6f6ec'; P.pop(cells[k]); } sel = { x: null, y: null }; rx.querySelectorAll('.pc-tab').forEach(function (e) { e.classList.remove('is-on'); }); ry.querySelectorAll('.pc-tab').forEach(function (e) { e.classList.remove('is-on'); }); upd();
          if (nfill === 6 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-multiply', step: 1 }); st.append(PC.boxes(st, [{ n: 3, label: '選 x', cls: 'is-blue' }, { n: 2, label: '選 y', cls: 'is-pink' }]).el, P.ruleBox('寫出一個數對分成<b>兩個步驟</b>：先選 x（3 種），再選 y（2 種）。<br>每個步驟都要做 → <b>連乘</b>：3 × 2 ＝ 6。', '乘法原理')); P.toast(api.ctx.p1 === 1 ? '你猜對了！6 種' : '寫出來是 6 種'); api.unlock('6 種全寫出來了！'); } }
      }
      function mk(row, kind, arr) { arr.forEach(function (v) { var b = h('button', { type: 'button', class: 'pc-tab' }, v); b.addEventListener('click', function () { pick(kind, v, b); }); row.append(b); }); }
      mk(rx, 'x', xs); mk(ry, 'y', ys);
      api.solve(function () { gate.on = false; Array.prototype.forEach.call(rx.children, function (bx) { Array.prototype.forEach.call(ry.children, function (by) { bx.click(); by.click(); }); }); });
      st.append(h('div', { class: 'pc-note' }, '先點一個 x，再點一個 y，就寫下一個數對'), rx, ry, tbl, h('div', { class: 'pl-readout' }, pill)); upd(); api.lock('先做上面的預測');
    },
    /* 2 路線連乘 */
    function (st, api) {
      var gate = { on: true }, a = 4, b = 3, c = 5, picks = 0, changed = false, host, svgHost, bx;
      P.choice(st, api, { id: 'cm-p2', predict: true, label: '先猜猜看', prompt: 'A 到 B 有 4 條路、B 到 C 有 3 條、C 到 D 有 5 條。每一段都必須走，A 到 D 共有幾種走法？', row: true, options: [{ t: '12' }, { ok: true, t: '60' }, { t: '20' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('按「隨機走一條」，或改變路數'); } });
      host = PC.stage(st); svgHost = h('div', {}); host.append(svgHost);
      var found = {}, nfound = 0, pill = P.pill('', 'is-green');
      function draw(pk) { svgHost.innerHTML = ''; routeSvg(svgHost, [a, b, c], pk); bx.set([{ n: a, label: 'A→B', cls: 'is-blue' }, { n: b, label: 'B→C', cls: 'is-pink' }, { n: c, label: 'C→D', cls: 'is-green' }]); pill.textContent = '共 ' + a * b * c + ' 種，你走過 ' + nfound + ' 種'; }
      var steprow = h('div', { class: 'pl-steprow pc-steprow3' }), sa = P.stepper('A→B', 1, 5, a, function (v) { if (gate.on) { sa.set(4, true); return; } a = v; reset(); }), sb = P.stepper('B→C', 1, 5, b, function (v) { if (gate.on) { sb.set(3, true); return; } b = v; reset(); }), sc = P.stepper('C→D', 1, 5, c, function (v) { if (gate.on) { sc.set(5, true); return; } c = v; reset(); });
      steprow.append(sa.el, sb.el, sc.el);
      function reset() { found = {}; nfound = 0; changed = true; draw(); check(); }
      var btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '隨機走一條');
      btn.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } var pk = [Math.floor(Math.random() * a), Math.floor(Math.random() * b), Math.floor(Math.random() * c)], key = pk.join(); if (!found[key]) { found[key] = 1; nfound++; } picks++; draw(pk); check(); });
      function check() { if (picks >= 3 && changed && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-multiply', step: 2 }); st.append(P.ruleBox('每一段路都是一個<b>選項盒子</b>，A 到 D 要依序走完每一段 → 盒子裡的路數<b>連乘</b>。<br>不是 4 ＋ 3 ＋ 5：因為每一段都必須走。', '連乘')); P.toast(api.ctx.p2 === 1 ? '你猜對了！60 種' : '連乘是 60 種'); api.unlock('每段都要走，所以連乘！'); } }
      bx = PC.boxes(host, [], {}); host.append(h('div', { class: 'pl-readout' }, pill));
      api.solve(function () { gate.on = false; sa.set(4); for (var t = 0; t < 3; t++) btn.click(); });
      st.append(steprow, h('div', { class: 'pc-btnrow' }, btn)); draw(); api.lock('先做上面的預測');
    },
    /* 3 信號燈箱：每盞燈 2 選 1 */
    function (st, api) {
      var gate = { on: true }, n = 2, state = [0, 0, 0, 0, 0, 0], reached = false;
      P.choice(st, api, { id: 'cm-p3', predict: true, label: '先猜猜看', prompt: '信號燈箱有 6 個燈泡，每個都可以亮或暗。能表示幾種信號？（全部都暗，不算一種信號）', row: true, options: [{ t: '12 種' }, { t: '36 種' }, { ok: true, t: '63 種' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('按 ＋ 增加燈泡，到 6 個'); } });
      var host = PC.stage(st), svgHost = h('div', {}); host.append(svgHost); var bx = PC.boxes(st, []), pill = P.pill('', 'is-amber'), cap = h('div', { class: 'pl-caption' });
      function val() { var v = 0; for (var i = 0; i < n; i++) v = v * 2 + state[i]; return v; }
      function draw() {
        svgHost.innerHTML = ''; var svg = PC.svg(svgHost, 320, 90, 'pl-svg--sm'), gap = 46, x0 = 160 - (n - 1) * gap / 2;
        for (var i = 0; i < n; i++) { (function (i) { var g = sv('g', { class: 'pc-tap' }); g.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } state[i] = 1 - state[i]; draw(); }); g.append(sv('circle', { cx: x0 + i * gap, cy: 44, r: 20, fill: state[i] ? '#ffd84d' : '#e3dccd', stroke: '#6d6250', 'stroke-width': 2.5 }), PC.text(x0 + i * gap, 44, state[i] ? '亮' : '暗', 13, state[i] ? '' : 'pm-ghost')); svg.append(g); })(i); }
        var items = []; for (var j = 0; j < n; j++) items.push({ n: 2, label: '第 ' + (j + 1) + ' 燈' }); bx.set(items, undefined);
        var total = Math.pow(2, n); bx.el.lastChild.textContent = String(total); pill.textContent = '信號 ' + state.slice(0, n).join('') + (val() === 0 ? '：全暗，不算' : '');
        cap.innerHTML = n + ' 個燈泡：2' + '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(n) + ' ＝ ' + total + ' 種，扣掉全暗 1 種 ＝ <b>' + (total - 1) + ' 種信號</b>';
        if (n === 6 && !reached && !gate.on) { reached = true; P.track('aha', { id: 'count-multiply', step: 3 }); st.append(P.ruleBox('每個燈泡「亮、暗」2 選 1，6 個燈泡連乘：<b>2⁶ ＝ 64</b>。<br>其中「全暗」不算信號，所以是 <b>64 − 1 ＝ 63 種</b>。', '乘法原理')); P.toast(api.ctx.p3 === 2 ? '你猜對了！63 種' : '63 種'); api.unlock('2 的 6 次方，扣掉 1！'); }
      }
      var stp = P.stepper('燈泡數', 2, 6, 2, function (v) { if (gate.on) { stp.set(2, true); return; } n = v; draw(); }, function (v) { return v + ' 個'; });
      api.solve(function () { gate.on = false; stp.set(6); });
      st.append(stp.el, h('div', { class: 'pl-readout' }, pill), cap); draw(); api.lock('先做上面的預測');
    },
    /* 4 糖果：以糖果為主角 */
    function (st, api) {
      var gate = { on: true }, nC = 2, nP = 2, seen = {}, P_ = '甲乙丙'.split('');
      P.choice(st, api, { id: 'cm-p4', predict: true, label: '先猜猜看', prompt: '5 種不同的糖果，全部分給甲、乙、丙三人（可以有人沒拿到）。共有幾種分法？', row: true, options: [{ t: '15 種' }, { t: '125 種' }, { ok: true, t: '243 種' }], onAnswer: function (i) { api.ctx.p4 = i; gate.on = false; api.lock('用小例子觀察：改糖果數與人數'); } });
      var list = h('div', { class: 'pc-found' }), bx = PC.boxes(st, []), cap = h('div', { class: 'pl-caption' });
      list.style.maxHeight = '120px';
      function draw() {
        list.innerHTML = ''; var items = [], i, total = Math.pow(nP, nC);
        for (i = 1; i <= nC; i++) items.push({ n: nP, label: '糖果 ' + i, cls: 'is-pink' }); bx.set(items); bx.el.lastChild.textContent = String(total);
        var rec = function (pre) { if (pre.length === nC) { list.append(PC.chip(pre.join(''), 'is-amber')); return; } P_.slice(0, nP).forEach(function (p) { rec(pre.concat(p)); }); }; rec([]);
        cap.innerHTML = nC + ' 顆糖各自決定給誰（每顆 ' + nP + ' 種）：' + nP + '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(nC) + ' ＝ <b>' + total + '</b><br><small>每個字依序是糖果 1、2…的主人</small>';
        seen[nC + ',' + nP] = 1;
        if (seen['2,3'] && seen['3,2'] && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'count-multiply', step: 4 }); st.append(P.ruleBox('每一顆糖都要分出去，所以<b>以糖果為主角</b>：每顆糖有「人數」種去處，連乘 → <b>人數<sup>糖果數</sup></b>。<br>5 種糖給 3 人：3⁵ ＝ <b>243</b>（不是 5³ ＝ 125）。看 2 顆糖給 3 人是 9，3 顆糖給 2 人是 8，不一樣！', '常見錯誤')); P.toast(api.ctx.p4 === 2 ? '你猜對了！243 種' : '3⁵ ＝ 243 種'); api.unlock('底數是人數，指數是糖果數！'); }
      }
      var sc = P.stepper('糖果', 1, 3, 2, function (v) { if (gate.on) { sc.set(2, true); return; } nC = v; draw(); }, function (v) { return v + ' 顆'; }), sp = P.stepper('人數', 2, 3, 2, function (v) { if (gate.on) { sp.set(2, true); return; } nP = v; draw(); }, function (v) { return v + ' 人'; });
      api.solve(function () { gate.on = false; nC = 2; nP = 3; sc.set(2, true); sp.set(3, true); draw(); nC = 3; nP = 2; sc.set(3, true); sp.set(2, true); draw(); });
      st.append(h('div', { class: 'pl-steprow' }, sc.el, sp.el), list, cap); draw(); api.lock('先做上面的預測');
    },
    /* 5 因數個數（資優延伸） */
    function (st, api) {
      var gate = { on: true }, ex = [0, 0, 0], fh = h('div', {}), found = PC.found(fh, { total: 24, label: '已收集因數' }), shown = false;
      P.choice(st, api, { id: 'cm-p5', predict: true, label: '先猜猜看', prompt: '504 ＝ 2³ × 3² × 7。504 有幾個正因數？', row: true, options: [{ t: '12 個' }, { ok: true, t: '24 個' }, { t: '504 個' }], onAnswer: function (i) { api.ctx.p5 = i; gate.on = false; api.lock('組出 8 個不同因數'); } });
      var cur = P.pill('', 'is-blue'), btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '收集這個因數'), q = h('div', {}), rows = h('div', {});
      function val() { return Math.pow(2, ex[0]) * Math.pow(3, ex[1]) * Math.pow(7, ex[2]); }
      function draw() { cur.textContent = '2' + '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(ex[0]) + ' × 3' + '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(ex[1]) + ' × 7' + '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(ex[2]) + ' ＝ ' + val(); }
      function mk(i, lab, max) {
        var row = h('div', { class: 'pc-tabs pc-tabs--s' }, h('span', { class: 'pc-lab' }, lab));
        for (var v = 0; v <= max; v++) (function (v) { var b = h('button', { type: 'button', class: 'pc-tab pc-tab--s' + (v === 0 ? ' is-on' : '') }, String(v)); b.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } ex[i] = v; row.querySelectorAll('.pc-tab').forEach(function (x) { x.classList.toggle('is-on', x === b); }); draw(); }); row.append(b); })(v);
        rows.append(row);
      }
      mk(0, '2 的次方', 3); mk(1, '3 的次方', 2); mk(2, '7 的次方', 1);
      btn.addEventListener('click', function () {
        if (gate.on) { P.toast('先做上面的預測'); return; } found.add(String(val())); draw();
        if (found.count >= 8 && !shown) { shown = true; fh.querySelector('.pc-found').style.display = 'none'; q.append(PC.boxes(q, [{ n: 4, label: '2 的次方 0~3', cls: 'is-blue' }, { n: 3, label: '3 的次方 0~2', cls: 'is-pink' }, { n: 2, label: '7 的次方 0~1', cls: 'is-green' }], { result: false }).el); P.numBox(q, { answer: 24, before: '共有', unit: '個因數', okMsg: '對！三個次數各自獨立選：4 × 3 × 2 ＝ 24。', onOk: function () { P.track('aha', { id: 'count-multiply', step: 5 }); st.append(P.ruleBox('每個因數都是 2ᵃ × 3ᵇ × 7ᶜ，三個次數<b>各自獨立選</b>：<b>(3＋1)(2＋1)(1＋1) ＝ 24</b>。', '因數個數')); P.toast(api.ctx.p5 === 1 ? '你猜對了！24 個' : '24 個'); api.unlock('次數加 1 再連乘！'); } }); }
      });
      api.solve(function () { gate.on = false; [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [0, 1, 0], [0, 2, 0], [0, 0, 1], [1, 1, 0]].forEach(function (e) { ex = e; draw(); btn.click(); }); });
      st.append(rows, h('div', { class: 'pl-readout' }, cur), h('div', { class: 'pc-btnrow' }, btn), fh, q); draw(); api.lock('先做上面的預測');
    },
    /* 6 塗色：先塗鄰居最多的 */
    function (st, api) {
      var gate = { on: true }, brush = 0, paint = {}, R = {}, shown = false;
      P.choice(st, api, { id: 'cm-p6', predict: true, label: '先猜猜看', prompt: '要幫怪獸塗色：相鄰的區域不能同色，共 5 種顏色。<b>先塗哪一個區域</b>，之後的選擇數最容易算？', row: true, options: [{ t: '耳朵' }, { ok: true, t: '臉' }, { t: '眼睛' }], onAnswer: function (i) { api.ctx.p6 = i; gate.on = false; api.lock('選顏色，再點區域塗色'); } });
      var host = PC.stage(st), svg = PC.svg(host, 320, 190, 'pl-svg--sm'), pal = h('div', { class: 'pc-tabs' }), q = h('div', {}), badges = sv('g', {}), cap = h('div', { class: 'pl-caption' }, '先選顏色，再點區域。相鄰的區域不能同色。');
      var regs = [
        { id: 'face', name: '臉', draw: function () { return sv('ellipse', { cx: 160, cy: 104, rx: 84, ry: 70 }); }, bx: 160, by: 150 },
        { id: 'horn', name: '角', draw: function () { return sv('polygon', { points: '160,8 142,44 178,44' }); }, bx: 160, by: 26 },
        { id: 'earL', name: '左耳', draw: function () { return sv('circle', { cx: 66, cy: 62, r: 22 }); }, bx: 66, by: 62 },
        { id: 'earR', name: '右耳', draw: function () { return sv('circle', { cx: 254, cy: 62, r: 22 }); }, bx: 254, by: 62 },
        { id: 'eyeL', name: '左眼', draw: function () { return sv('circle', { cx: 128, cy: 92, r: 14 }); }, bx: 128, by: 92 },
        { id: 'eyeR', name: '右眼', draw: function () { return sv('circle', { cx: 192, cy: 92, r: 14 }); }, bx: 192, by: 92 },
        { id: 'mouth', name: '嘴巴', draw: function () { return sv('ellipse', { cx: 160, cy: 134, rx: 28, ry: 12 }); }, bx: 160, by: 134 }];
      function shake(e) { P.shake(e); }
      regs.forEach(function (r) { var e = r.draw(); e.setAttribute('class', 'pc-reg'); e.setAttribute('fill', '#fff'); e.setAttribute('stroke', '#122548'); e.setAttribute('stroke-width', 2.5); e.style.cursor = 'pointer'; R[r.id] = e; svg.append(e); e.addEventListener('click', function () { tap(r); }); });
      svg.append(badges);
      function tap(r) {
        if (gate.on) { P.toast('先做上面的預測'); return; }
        if (r.id !== 'face' && paint.face === brush) { P.toast('和臉相鄰，不能同色'); shake(R[r.id]); return; }
        if (r.id === 'face') { var bad = Object.keys(paint).some(function (k) { return k !== 'face' && paint[k] === brush; }); if (bad) { P.toast('有相鄰的區域已經是這個顏色'); shake(R.face); return; } }
        paint[r.id] = brush; R[r.id].setAttribute('fill', COLS[brush]); R[r.id].setAttribute('fill-opacity', 0.55); draw();
      }
      function draw() {
        badges.innerHTML = '';
        if (paint.face !== undefined) regs.forEach(function (r) { if (r.id !== 'face') { var t = PC.text(r.bx, r.by, '4 種', 12, 'pm-amber'); if (paint[r.id] === undefined) badges.append(t); } });
        if (Object.keys(paint).length === 7 && !shown) { shown = true; var items = [{ n: 5, label: '臉', cls: 'is-blue' }]; for (var i = 0; i < 6; i++) items.push({ n: 4, label: ['角', '左耳', '右耳', '左眼', '右眼', '嘴'][i] }); pal.style.display = 'none'; cap.style.display = 'none'; PC.shrink(svg, 140); var bb = PC.boxes(q, items, { result: false }); bb.el.classList.add('pc-boxes--tight'); q.append(bb.el, h('div', { class: 'pc-note', html: '臉 5 種，其餘 6 個區域各 4 種（只要和臉不同色）' })); P.numBox(q, { answer: 20480, okMsg: '對！5 × 4⁶ ＝ 5 × 4096 ＝ 20480。', onOk: function () { P.track('aha', { id: 'count-multiply', step: 6 }); st.append(P.ruleBox('塗色要先塗<b>鄰居最多</b>的區域（臉）：它有 5 種；其他 6 個區域只需要「和臉不同色」，各 <b>4 種</b>，彼此不相鄰。<br><b>5 × 4⁶ ＝ 20480</b>。', '塗色')); P.toast(api.ctx.p6 === 1 ? '你猜對了！先塗臉' : '先塗臉最好'); api.unlock('先塗鄰居最多的！'); }, wrong: function (v) { return v === 5 * 4 * 6 ? '4 要連乘 6 次：4⁶ ＝ 4096。' : '提示：臉 5 種，其餘 6 個區域各 4 種，連乘。'; } }); } }
      COLS.forEach(function (c, i) { var b = h('button', { type: 'button', class: 'pc-tab', style: { background: c, color: '#fff', borderColor: c } }, COLN[i]); b.addEventListener('click', function () { brush = i; pal.querySelectorAll('.pc-tab').forEach(function (x, k) { x.style.outline = k === i ? '3px solid #122548' : 'none'; }); }); pal.append(b); });
      pal.firstChild.style.outline = '3px solid #122548';
      api.solve(function () { gate.on = false; regs.forEach(function (r) { if (paint[r.id] === undefined) { brush = r.id === 'face' ? 0 : 1 + (paint.face === 1 ? 1 : 0); tap(r); } }); });
      st.append(pal, cap, q); api.lock('先做上面的預測');
    },
    /* 7 換個外觀 */
    function (st, api) {
      PC.quiz(st, api, 'count-multiply', [
        function (box, done) { routeSvg(PC.stage(box), [3, 4, 2], null); PC.num(box, 'A 到 B 有 3 條路，B 到 C 有 4 條，C 到 D 有 2 條。每段都必須走，A 到 D 共有幾種走法？', 24, done, '對！3 × 4 × 2 ＝ 24（每一段都要走 → 連乘）。', function (v) { return v === 9 ? '3 ＋ 4 ＋ 2 ＝ 9 是把三段「二選一」；這裡每段都要走，應該連乘。' : '提示：每一段都是一個選項盒子，連乘。'; }); },
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 150, 'pl-svg--sm'), pos = [[160, 82], [160, 22], [60, 118], [260, 118]], names = ['中心', '①', '②', '③'], col = [-1, -1, -1, -1], BC = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f'];
          [1, 2, 3].forEach(function (i) { svg.append(sv('line', { x1: pos[0][0], y1: pos[0][1], x2: pos[i][0], y2: pos[i][1], class: 'pl-line pl-line--soft' })); });
          pos.forEach(function (p, i) { var g = sv('g', { class: 'pc-tap' }), c = sv('circle', { cx: p[0], cy: p[1], r: i ? 19 : 26, fill: '#fff', stroke: '#122548', 'stroke-width': 2.5 }); g.append(c, PC.text(p[0], p[1], names[i], 13)); g.addEventListener('click', function () { col[i] = (col[i] + 1) % 4; c.setAttribute('fill', BC[col[i]]); c.setAttribute('fill-opacity', 0.55); }); svg.append(g); });
          PC.num(box, '中心區域和 ①②③ 三個區域都相鄰，①②③ 彼此不相鄰。用 4 種顏色（可重複使用），相鄰不同色，共有幾種塗法？（點圓圈可以試塗）', 108, done, '對！先塗中心 4 種，①②③ 各剩 3 種：4 × 3 × 3 × 3 ＝ 108。', function (v) { return v === 4 * 3 * 2 * 1 ? '①②③ 彼此不相鄰，可以重複用同一種顏色，各有 3 種。' : '提示：先塗鄰居最多的中心。'; });
        },
        function (box, done) {
          var host = PC.stage(box), svg = PC.svg(host, 320, 100, 'pl-svg--sm'), st6 = [0, 0, 0, 0, 0, 0], cnt = h('div', { class: 'pl-readout' }), pill = P.pill('', 'is-green'); cnt.append(pill); var seen = {};
          function draw() { svg.innerHTML = ''; for (var i = 0; i < 6; i++) { (function (i) { var g = sv('g', { class: 'pc-tap' }); g.addEventListener('click', function () { st6[i] = 1 - st6[i]; seen[st6.join('')] = 1; draw(); }); g.append(sv('circle', { cx: 36 + i * 50, cy: 40, r: 20, fill: st6[i] ? '#e6f6ec' : '#ffe8f0', stroke: st6[i] ? '#1f9d55' : '#d6336c', 'stroke-width': 2.5 }), PC.text(36 + i * 50, 40, st6[i] ? '○' : '✕', 18), PC.text(36 + i * 50, 80, '第' + (i + 1) + '題', 12, 'pm-ghost')); svg.append(g); })(i); } pill.textContent = '你寫過 ' + Object.keys(seen).length + ' 種答案卷'; }
          draw(); box.append(cnt);
          PC.num(box, '6 題是非題，每題只能填 ○ 或 ✕。（點圓圈試填）不同的答案卷共有幾種？', 64, done, '對！每題 2 種，連乘：2⁶ ＝ 64。', function () { return '提示：每題 2 種選擇，6 題連乘。'; });
        }]);
    },
    /* 8 完成 */
    function (st) {
      P.complete(st, {
        id: 'count-multiply', moduleName: '乘法原理', askAbout: '國小高年級到國中的計數', aha: '一件事分成連續的步驟、每一步都要做，<br>就把每一步的選擇數連乘。',
        cards: [{ text: '每一步都要做 → 乘；選項盒子連乘', src: '宗翰講義「基本計數／排組原理」主題 2' }, { text: 'n 個不同的東西分給 m 個人：mⁿ 種；因數個數 ＝ (各次數＋1) 連乘', src: '宗翰講義 主題 2（說例 3、4）' }],
        depth: { here: 0.17, cheetah: [{ at: 0.45, label: '看縫不看顆<br>一一對應' }, { at: 0.85, label: '完全平方數<br>百盞燈' }] },
        teasers: [
          { title: '巧克力：看「縫」不看「顆」', q: '5 顆巧克力分次拿完有 2⁴ ＝ 16 種，10 顆呢？為什麼只要看縫？', where: '宗翰講義 主題 2 說例 2', lv: 'L2' },
          { title: '百盞燈與完全平方數', q: '100 盞燈、100 個人依序按倍數的開關，最後哪幾盞亮著？', where: '宗翰講義 主題 2 說例 4', lv: 'L2' },
          { title: '插板法', q: '把相同的東西分給不同的人（每人至少 1 個），怎麼用「插板」一次算完？', where: 'PK3D 插板法', lv: 'L2' },
          { title: '街道路線：每區選一條橫街', q: '不能往左的棋盤路線，只要每個區塊選一條橫街，連乘 4 × 3 × 6 × 4 ＝ 288。', where: '宗翰講義 主題 2 說例 5', lv: 'L3' }],
        parent: { pitfall: '孩子容易「加乘不分」：該連乘的時候相加（4＋3＋5），或把 3⁵ 寫成 5³。關鍵是問自己：這件事是不是「每一步都要做」？誰是主角？', place: '小學高年級計數的核心，往後排列、組合、機率都由它長出來。', ask: ['這件事分成哪幾個步驟？每個步驟有幾種選擇？', '為什麼 5 種糖分給 3 個人是 3⁵ 而不是 5³？', '塗色為什麼要先塗鄰居最多的？'] },
        classes: ['宗翰講義：基本計數／排組原理（主題 2 乘法原理）', 'PK3D：插板法', 'PK1A（2607）：整數分拆'],
        next: { href: 'play-count-add.html', text: '下一個：加法原理與標數法' } });
    }];
  new P.Lesson({ id: 'count-multiply', title: '乘法原理', steps: steps });
})();
