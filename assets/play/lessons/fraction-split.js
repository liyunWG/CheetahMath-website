/* 獵豹玩中學｜分數：平分才是 1/n
   預測＋拖切刀把手「平分」→ 平分成幾份、取幾份 → 同樣是 1/3，整體不同個數不同 → 3 個操作關卡（等值分數、12 個的 2/3、比 1/5 小比 1/7 大）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA;
  var FILL = ['rgba(47,111,220,.32)', 'rgba(214,51,108,.3)', 'rgba(31,157,85,.32)', 'rgba(210,155,31,.4)', 'rgba(122,79,214,.3)', 'rgba(12,165,160,.32)', 'rgba(232,89,12,.3)', 'rgba(154,163,181,.45)'];
  function fracTxt(k, d) { var g = PA.gcd(k, d); return k + '/' + d; }

  var steps = [
    /* 1. 預測＋把蛋糕切成一樣大 */
    function (st, api) {
      var gate = { on: true }, cuts = [2, 4, 9], done = false, hs = [], g = h('g');
      P.choice(st, api, { id: 'fs-p1', predict: true, label: '先猜猜看', prompt: '一塊長蛋糕被切成 <b>4 塊</b>（大小不一樣）。<b>最左邊那 1 塊</b>是整塊蛋糕的 1/4 嗎？', options: [{ t: '是，切成 4 塊就是 1/4' }, { t: '不是，還要看大小' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動三個切刀，讓 4 塊一樣大'); } });
      var b = PA.board(st, 14, 6); b.gMid.append(g);
      var pW = P.pill('', 'is-blue'), pS = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pW, pS));
      function widths() { var e = [0].concat(cuts, [12]); return e.slice(1).map(function (v, i) { return v - e[i]; }); }
      function draw() {
        g.innerHTML = ''; var e = [0].concat(cuts, [12]), w = widths(), i, eq = w.every(function (v) { return v === w[0]; });
        for (i = 1; i < 12; i++) g.append(h('line', { x1: 1 + i, y1: b.Y(3.8), x2: 1 + i, y2: b.Y(2.2), stroke: '#e6dcc2', 'stroke-width': 0.04 }));
        for (i = 0; i < 4; i++) { g.append(h('rect', { x: 1 + e[i] + 0.04, y: b.Y(3.8), width: w[i] - 0.08, height: 1.6, rx: 0.15, fill: FILL[i], stroke: '#fff', 'stroke-width': 0.06 })); b.text([1 + (e[i] + e[i + 1]) / 2, 2.8], w[i] + ' 格', 'pl-text pl-text--sm', g); }
        cuts.forEach(function (c) { g.append(h('line', { x1: 1 + c, y1: b.Y(3.8), x2: 1 + c, y2: b.Y(4.6), stroke: '#8a7d5c', 'stroke-width': 0.06, 'stroke-dasharray': '.15 .12' })); });
        pW.textContent = '4 塊：' + w.join('、') + ' 格'; pS.className = 'pl-pill' + (eq ? ' is-ok' : ' is-pink'); pS.textContent = eq ? '✓ 一樣大：每塊是整個的 1/4' : '大小不一樣，不是 1/4';
        if (eq && !done && !gate.on) { done = true; P.track('aha', { id: 'fraction-split', step: 1 }); P.toast(api.ctx.p1 === 1 ? '你猜對了！要平分才行' : '要平分才能叫 1/4'); st.append(P.ruleBox('分數的前提是「<b>平分</b>」：把 1 個整體<b>平分成 4 份</b>，每一份才是 <b>1/4</b>。<br>切得大小不同，就不能叫 1/4。', '平分')); api.unlock('平分，才有 1/n'); }
      }
      cuts.forEach(function (c0, i) {
        var hd = b.handle({ pos: [1 + c0, 5], constrain: function (raw) { return [raw[0], 5]; }, disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; },
          valid: function (t) { var c = cuts.slice(); c[i] = t[0] - 1; return c[0] >= 1 && c[2] <= 11 && c[1] - c[0] >= 1 && c[2] - c[1] >= 1; },
          onMove: function (t) { cuts[i] = t[0] - 1; draw(); } }); hs.push(hd);
      });
      api.solve(function () { gate.on = false; [3, 6, 9].forEach(function (c, i) { hs[i].moveTo([1 + c, 5]); }); });
      draw(); st.append(P.hint('每一格一樣大。拖動上面的切刀，數數看每塊有幾格。')); api.lock('先做上面的預測');
    },
    /* 2. 平分成幾份、取幾份 */
    function (st, api) {
      st.append(P.instr('先決定<b>平分成幾份</b>，再<b>點一點</b>你要取的幾份。看看分數怎麼寫出來。'));
      var n = 4, sel = {}, seenN = {}, big = false, done = false, g = h('g'), b = PA.board(st, 14, 6); b.gMid.append(g);
      var pA = P.pill('', 'is-blue'), pB = P.pill('', 'is-pink'), pF = P.pill('', 'is-ok'); st.append(h('div', { class: 'pl-readout' }, pA, pB, pF));
      function cnt() { return Object.keys(sel).filter(function (k) { return sel[k]; }).length; }
      function draw() {
        g.innerHTML = ''; var w = 12 / n, i, k = cnt();
        for (i = 0; i < n; i++) {
          (function (i) {
            var r = h('rect', { x: 1 + i * w + 0.04, y: b.Y(4.8), width: w - 0.08, height: 1.7, rx: 0.15, fill: sel[i] ? 'rgba(214,51,108,.5)' : 'rgba(47,111,220,.14)', stroke: sel[i] ? '#d6336c' : '#2f6fdc', 'stroke-width': 0.07, style: 'cursor:pointer' });
            r.addEventListener('click', function () { sel[i] = !sel[i]; draw(); }); g.append(r);
          })(i);
          if (w > 1.5) b.text([1 + (i + 0.5) * w, 3.75], '1/' + n, 'pl-text pl-text--sm', g);
        }
        b.line([1, 1.6], [13, 1.6], 'pl-line pl-line--thin', g);
        for (i = 0; i <= n; i++) g.append(h('line', { x1: 1 + i * w, y1: b.Y(1.8), x2: 1 + i * w, y2: b.Y(1.4), stroke: '#6d6250', 'stroke-width': 0.06 }));
        b.text([1, 0.7], '0', 'pl-text pl-text--sm', g); b.text([13, 0.7], '1', 'pl-text pl-text--sm', g);
        if (k > 0) { b.dot([1 + 12 * k / n, 1.6], 'pl-dot pl-dot--green', g, 0.24); b.text([1 + 12 * k / n, 2.35], fracTxt(k, n), 'pl-text pl-text--green', g); }
        pA.textContent = '平分成 ' + n + ' 份（分母）'; pB.textContent = '取了 ' + k + ' 份（分子）'; pF.textContent = k ? '取了 ' + k + ' 個 1/' + n + ' ＝ ' + k + '/' + n : '點一點要取的份數'; pF.className = 'pl-pill' + (k ? ' is-ok' : '');
        if (k >= 1) { seenN[n] = 1; if (k >= 2) big = true; if (Object.keys(seenN).length >= 3 && big && !done) { done = true; P.track('aha', { id: 'fraction-split', step: 2 }); st.append(P.ruleBox('<b>分母</b>＝平分成幾份，<b>分子</b>＝取了幾份。<br>每一份是 <b>1/n</b>，取 k 份就是 k 個 1/n，寫成 <b>k/n</b>。', '分數')); api.unlock('分母、分子看懂了'); } }
      }
      var sn = P.stepper('平分成', 2, 8, 4, function (v) { n = v; sel = {}; draw(); }, function (v) { return v + ' 份'; });
      st.append(h('div', { class: 'pl-steprow' }, sn.el));
      api.solve(function () { [3, 5, 4].forEach(function (v) { n = v; sn.set(v, true); sel = { 0: true, 1: true }; draw(); }); });
      draw(); st.append(P.hint('至少用 3 種「平分成幾份」，每次取幾份試試看，其中有一次取 2 份以上。')); api.lock('用 3 種份數試試看');
    },
    /* 3. 同樣是 1/3，整體不同 */
    function (st, api) {
      st.append(P.instr('巧克力平分成 <b>3 份</b>，點一份就是它的 <b>1/3</b>。拉滑桿換不同的巧克力總數，看看 <b>1/3 是幾個</b>。'));
      var total = 12, seen = {}, pick = -1, done = false, g = h('g'), b = PA.board(st, 14, 7); b.gMid.append(g);
      var pT = P.pill('', 'is-blue'), pU = P.pill('', 'is-amber'), pR = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pT, pU, pR));
      function draw() {
        g.innerHTML = ''; var per = total / 3, gi, j;
        for (gi = 0; gi < 3; gi++) {
          (function (gi) {
            var x0 = 1 + gi * 4.3, rect = h('rect', { x: x0, y: b.Y(6.2), width: 3.7, height: 4.4, rx: 0.4, fill: pick === gi ? 'rgba(210,155,31,.38)' : '#fff', stroke: pick === gi ? '#d29b1f' : '#cfc6ad', 'stroke-width': 0.09, style: 'cursor:pointer' });
            rect.addEventListener('click', function () { pick = gi; seen[total] = 1; draw(); if (Object.keys(seen).length >= 3 && !done) { done = true; P.track('aha', { id: 'fraction-split', step: 3 }); st.append(P.ruleBox('分數是「整體的幾分之幾」：<b>同樣是 1/3，整體越大，1/3 的個數越多</b>。<br>12 個的 1/3 是 4 個，6 個的 1/3 只有 2 個。', '整體')); api.unlock('整體不同，個數就不同'); } });
            g.append(rect);
            for (j = 0; j < per; j++) { var cx = x0 + 0.95 + Math.floor(j / 3) * 1.25, cy = 5.3 - (j % 3) * 1.15; g.append(h('circle', { cx: cx, cy: b.Y(cy), r: 0.44, fill: '#8b5a2b', stroke: '#fff', 'stroke-width': 0.05, style: 'pointer-events:none' })); }
          })(gi);
        }
        pT.textContent = '一共 ' + total + ' 個'; pU.textContent = '平分成 3 份，每份 ' + per + ' 個'; pR.textContent = pick >= 0 ? '1/3 ＝ ' + per + ' 個' : '點一份看看'; pR.className = 'pl-pill' + (pick >= 0 ? ' is-ok' : '');
      }
      var sl = P.slider(3, 18, 12, function (v) { total = +v; pick = -1; draw(); }, 3);
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '3 個'), h('span', {}, '18 個')));
      api.solve(function () { [6, 12, 18].forEach(function (v) { total = v; sl.value = v; pick = 0; seen[v] = 1; draw(); }); done = true; st.append(P.ruleBox('分數是「整體的幾分之幾」：<b>同樣是 1/3，整體越大，1/3 的個數越多</b>。', '整體')); });
      draw(); st.append(P.hint('至少用 3 種不同的總數，每次都點一份。')); api.lock('3 種總數都點過一份');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：等值分數 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '每一條數線都是從 0 到 1。最上面那條已經標好 <b>1/2</b>，把下面三條的點拖到<b>同一個位置</b>。' }));
          var b = PA.board(b0, 15, 7, 'pl-svg--sm'), g = h('g'), rows = [{ d: 4, y: 4.2, k: 1 }, { d: 6, y: 2.7, k: 1 }, { d: 12, y: 1.2, k: 3 }], fin = false, hs = [], labs = []; b.gMid.append(g);
          function X(k, d) { return 1 + 12 * k / d; }
          g.append(h('line', { x1: 7, y1: b.Y(6.4), x2: 7, y2: b.Y(0.5), stroke: '#d6336c', 'stroke-width': 0.07, 'stroke-dasharray': '.22 .2' }));
          [{ d: 2, y: 5.7 }].concat(rows).forEach(function (r) { b.line([1, r.y], [13, r.y], 'pl-line pl-line--thin', g); for (var k = 0; k <= r.d; k++) g.append(h('line', { x1: X(k, r.d), y1: b.Y(r.y + 0.18), x2: X(k, r.d), y2: b.Y(r.y - 0.18), stroke: '#6d6250', 'stroke-width': 0.06 })); });
          b.dot([7, 5.7], 'pl-dot pl-dot--green', g, 0.3); b.text([14.2, 5.45], '1/2', 'pl-text pl-text--sm pl-text--green', g);
          function upd() { var all = true; rows.forEach(function (r, i) { labs[i].textContent = r.k + '/' + r.d; labs[i].setAttribute('class', 'pl-text pl-text--sm' + (2 * r.k === r.d ? ' pl-text--green' : '')); if (2 * r.k !== r.d) all = false; }); if (all && !fin) { fin = true; P.toast('2/4 ＝ 3/6 ＝ 6/12 ＝ 1/2'); done(); } }
          rows.forEach(function (r, i) {
            labs.push(b.text([14.2, r.y - 0.25], r.k + '/' + r.d, 'pl-text pl-text--sm', g));
            var cs = []; for (var k = 0; k <= r.d; k++) cs.push([X(k, r.d), r.y]);
            hs.push(b.handle({ pos: [X(r.k, r.d), r.y], candidates: cs, onMove: function (t) { r.k = Math.round((t[0] - 1) * r.d / 12); upd(); } }));
          });
          setSolve(function () { rows.forEach(function (r, i) { hs[i].moveTo([7, r.y]); }); }); upd(); b0.append(P.hint('分成幾份不同，但要停在同一個位置。'));
        },
        /* 關 2：12 個的 2/3 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '取出 12 個巧克力的 <b>2/3</b>：先<b>平分</b>，再點選要取的份。' }));
          var n = 2, sel = {}, fin = false, g = h('g'), b = PA.board(b0, 14, 6, 'pl-svg--sm'); b.gMid.append(g);
          var pA = P.pill('', 'is-blue'), pB = P.pill('', 'is-amber'); b0.append(h('div', { class: 'pl-readout' }, pA, pB));
          function draw() {
            g.innerHTML = ''; var ok = 12 % n === 0, per = 12 / n, j, gi, picked = 0;
            for (j = 0; j < 12; j++) { var gi2 = ok ? Math.floor(j / per) : 0; }
            if (!ok) { for (j = 0; j < 12; j++) g.append(h('circle', { cx: 1.7 + (j % 6) * 1.9, cy: b.Y(4.4 - Math.floor(j / 6) * 1.6), r: 0.5, fill: '#8b5a2b', stroke: '#fff', 'stroke-width': 0.05 })); b.text([7, 1.2], '12 個不能平分成 ' + n + ' 份', 'pl-text pl-text--sm pl-text--pink', g); }
            else for (gi = 0; gi < n; gi++) (function (gi) {
              var w = 12.4 / n, x0 = 0.8 + gi * (12.4 / n) + 0.1, rc = h('rect', { x: x0, y: b.Y(5.4), width: w - 0.2, height: 3.8, rx: 0.3, fill: sel[gi] ? 'rgba(214,51,108,.28)' : '#fff', stroke: sel[gi] ? '#d6336c' : '#cfc6ad', 'stroke-width': 0.08, style: 'cursor:pointer' });
              rc.addEventListener('click', function () { sel[gi] = !sel[gi]; draw(); }); g.append(rc);
              var cols = Math.ceil(per / 3);
              for (var q = 0; q < per; q++) g.append(h('circle', { cx: x0 + (w - 0.2) / 2 + (Math.floor(q / 3) - (cols - 1) / 2) * 0.95, cy: b.Y(4.5 - (q % 3) * 0.95), r: 0.36, fill: '#8b5a2b', stroke: '#fff', 'stroke-width': 0.05, style: 'pointer-events:none' }));
            })(gi);
            if (ok) Object.keys(sel).forEach(function (k) { if (sel[k]) picked += per; });
            pA.textContent = '平分成 ' + n + ' 份'; pB.textContent = ok ? '選了 ' + picked + ' 個' : '先換一個能平分的份數'; pB.className = 'pl-pill' + (ok && picked === 8 ? ' is-ok' : ' is-amber');
            if (ok && picked === 8 && n === 3 && !fin) { fin = true; P.toast('12 個的 2/3 ＝ 8 個'); done(); }
          }
          var sn = P.stepper('平分成', 2, 6, 2, function (v) { n = v; sel = {}; draw(); }, function (v) { return v + ' 份'; }); b0.append(h('div', { class: 'pl-steprow' }, sn.el));
          setSolve(function () { sn.set(3); sel = { 0: true, 1: true }; draw(); }); draw(); b0.append(P.hint('2/3 的分母告訴你要平分成幾份，分子告訴你取幾份。'));
        },
        /* 關 3：比 1/5 小、比 1/7 大 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '把一條長條平分成 <b>n 份</b>，找一個 n，讓<b>每一份比 1/5 小、卻比 1/7 大</b>。' }));
          var n = 3, fin = false, g = h('g'), b = PA.board(b0, 14, 6, 'pl-svg--sm'); b.gMid.append(g);
          var pA = P.pill('', 'is-blue'), pB = P.pill('', ''); b0.append(h('div', { class: 'pl-readout' }, pA, pB));
          function draw() {
            g.innerHTML = ''; var w = 12 / n, i, ok = 1 / n < 1 / 5 && 1 / n > 1 / 7;
            for (i = 0; i < n; i++) g.append(h('rect', { x: 1 + i * w + 0.03, y: b.Y(4.4), width: w - 0.06, height: 1.4, rx: 0.12, fill: i === 0 ? 'rgba(214,51,108,.5)' : 'rgba(47,111,220,.14)', stroke: i === 0 ? '#d6336c' : '#2f6fdc', 'stroke-width': 0.06 }));
            [[12 / 5, '1/5 的長度', '#2f6fdc', 'pl-text--l'], [12 / 7, '1/7 的長度', '#1f9d55', 'pl-text--r']].forEach(function (m) { g.append(h('line', { x1: 1 + m[0], y1: b.Y(5.3), x2: 1 + m[0], y2: b.Y(1.9), stroke: m[2], 'stroke-width': 0.09, 'stroke-dasharray': '.2 .16' })); b.text([1 + m[0] + (m[3] === 'pl-text--l' ? 0.12 : -0.12), 5.55], m[1], 'pl-text pl-text--sm ' + m[3], g); });
            pA.textContent = '平分成 ' + n + ' 份，每份是 1/' + n; pB.className = 'pl-pill' + (ok ? ' is-ok' : ''); pB.textContent = ok ? '✓ 比 1/5 小、比 1/7 大' : (1 / n >= 1 / 5 ? '還太大了' : '太小了');
            if (ok && !fin) { fin = true; P.toast('1/7 ＜ 1/6 ＜ 1/5'); done(); }
          }
          var sn = P.stepper('平分成', 1, 12, 3, function (v) { n = v; draw(); }, function (v) { return v + ' 份'; }); b0.append(h('div', { class: 'pl-steprow' }, sn.el));
          setSolve(function () { sn.set(6); }); draw(); b0.append(P.hint('分母越大，每一份越小還是越大？'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'fraction-split' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'fraction-split', moduleName: '分數：平分才是 1/n', askAbout: '小學分數的觀念（平分、單位分數、等值分數）', aha: '分數是把一個整體「平分」，再取幾份；<br>分母越大，每一份越小。',
        cards: [{ text: '把整體平分成 n 份，每份是 1/n；取 k 份就是 k/n（分母＝平分幾份，分子＝取幾份）', src: '小學「分數」（等分與單位分數）' }, { text: '同樣是 1/3，整體不同，個數就不同；分母相同的分數，分子越大越大；單位分數的分母越大越小', src: '小學分數的大小比較' }],
        depth: { here: 0.12, cheetah: [{ at: 0.4, label: '埃及分數<br>分數的應用' }, { at: 0.82, label: '分數裂項<br>有理數縮放' }] },
        teasers: [
          { title: '荷魯斯之眼：古埃及人怎麼分？', q: '7 塊一樣的烤餅分給 4 個人，古埃及人只用 1/2、1/4 這種「單位分數」，怎麼分才公平？', where: 'PK1A 2607 第 12 堂：荷魯斯之眼（一）；PI1A 2507 第 8 堂：分數（一）', lv: 'L2' },
          { title: '分數的比較與縮放', q: '1/3 和 2/7 誰大？不通分，只用「放大縮小」也能比。', where: 'PK2A 2507 第 19 堂；PK3D 2512 第 16 堂：分數縮放', lv: 'L2' },
          { title: '分數裂項', q: '1/(1×2) ＋ 1/(2×3) ＋ … ＋ 1/(99×100)，一個一個加太慢，有什麼捷徑？', where: 'PK3C 2507 第 7、16 堂：分數裂項（一）（二）', lv: 'L3' }],
        parent: { pitfall: '孩子常把「切成幾塊」當成分母，沒注意要「平分」；也常以為分母越大分數越大。另一個常見的錯是忘了分數是「整體的幾分之幾」，不同整體的 1/2 不能直接比大小。', place: '小學三到五年級分數的起點，之後的通分、分數加減乘除、比例與百分率都建立在這裡。', ask: ['切成 4 塊，每塊都是 1/4 嗎？為什麼？', '1/3 和 1/5，哪一份比較大？怎麼知道？', '6 個蘋果的 1/3 和 12 個蘋果的 1/3，一樣多嗎？'] },
        classes: ['PK1A（2607 第 12 堂）：荷魯斯之眼（一）', 'PI1A（2507 第 8、14、15 堂）：分數（一）（二）（三）', 'PK3C（2507 第 7、16 堂）：分數裂項（一）（二）'], next: { href: 'play-perimeter-slide.html', text: '下一個：周長問題' } });
    }];
  new P.Lesson({ id: 'fraction-split', title: '分數：平分才是 1/n', steps: steps });
})();
