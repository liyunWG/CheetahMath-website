/* 獵豹玩中學｜塗色（三）：計數塗色(二)，分類討論與環形
   預測＋四區方塊：最後一格的選擇數要看兩個鄰居同不同色，分兩類各自連乘再相加 → 預測＋一圈區域：把首尾相鄰拆成「首尾同色／不同色」兩類，自己看出遞推 → 4 個操作關卡（k、n、輪形）。
   要擊中的迷思：分類漏掉或重複；環形忘了首尾相鄰；環形公式只會背；輪形不知道中心先塗外圈就少一色。 */
(function () {
  var P = Play, h = P.h, PG = window.PG;
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function steppr(host, label, min, max, val, fn) { var sn = P.stepper(label, min, max, val, fn, function (v) { return v; }); host.append(h('div', { class: 'pl-steprow' }, sn.el)); return sn; }
  function btnRow(host, items) { var row = h('div', { class: 'pg-pal' }); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:6px 0 10px'; var out = {}; items.forEach(function (it) { var b = h('button', { type: 'button' }, it.t); b.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;font-weight:800;cursor:pointer;border:2px solid ' + (it.c || '#b9ad92') + ';background:#fff;color:#122548'; b.addEventListener('click', it.fn); row.append(b); out[it.k] = b; }); host.append(row); return out; }
  function sq(M, k) { var A = 0, B = 1, C = 2, D = 3, same = 0, diff = 0; PG.enumerate(M, k, function (col) { if (col[B] === col[C]) same++; else diff++; }); return { same: same, diff: diff, total: same + diff }; }
  function pw(a, n) { return Math.pow(a, n); }
  /* 環形 n 區（首尾相鄰）與鏈（只有前後相鄰，首尾不相鄰）：回傳 {ring, chain, endSame, endDiff} */
  function ringModel(n) { return PG.model(PG.wheel(n, false)); }
  function chainModel(n) { var d = PG.wheel(n, false), adj = []; for (var i = 0; i + 1 < n; i++) adj.push([d.regions[i].id, d.regions[i + 1].id]); d.adj = adj; return PG.model(d); }
  function ringStats(n, k) { var R = ringModel(n), C = chainModel(n), same = 0, diff = 0; PG.enumerate(C, k, function (col) { if (col[0] === col[n - 1]) same++; else diff++; }); return { ring: PG.count(R, k), chain: PG.count(C, k), endSame: same, endDiff: diff }; }

  var steps = [
    /* 1. 四區方塊：分類 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, M = PG.model(PG.grid(['AB', 'CD'])), k = 4, V, pA, pB, pC, ks = {};
      P.choice(st, api, { id: 'cc2-p1', predict: true, label: '先猜猜看', prompt: '四區方塊（A 和 B、C 相鄰，D 和 B、C 相鄰）。依 A → B → C → D 的順序塗，A、B、C 都塗好了。<b>D 還剩幾種顏色</b>可選？', row: true, options: [{ ok: true, t: '要看 B、C 是不是同色' }, { t: '一定是 (總色數 − 1)' }, { t: '一定是 (總色數 − 2)' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('分成兩類看看'); } });
      st.append(P.instr('D 的鄰居是 B 和 C，它們<b>可能同色</b>，也<b>可能不同色</b>，選擇數就不一樣。按下面兩個按鈕，分成<b>兩類</b>各算一遍；也調整顏色數 k 看看。'));
      V = PG.view(st, M, { k: 4, nopal: true, small: true, onTap: function () { } });
      var sn = steppr(st, '顏色數 k', 3, 6, 4, function (v) { k = v; if (cur) show(cur); ks[v] = 1; });
      var cur = null, bt = btnRow(st, [{ k: 's', t: '看「B、C 同色」這一類', fn: function () { show('same'); } }, { k: 'd', t: '看「B、C 不同色」這一類', fn: function () { show('diff'); } }]);
      pA = pill(st, 'is-blue'); pB = pill(st, 'is-green'); pC = pill(st, 'is-amber');
      function show(w) {
        if (gate.on) { P.toast('先做上面的預測'); return; } cur = w; var c = sq(M, k);
        if (w === 'same') { pA.textContent = '「B、C 同色」：A ' + k + ' → B ' + (k - 1) + ' → C 只能和 B 同色 1 → D 只要避開 B（也就是 C）的顏色 ' + (k - 1) + '　＝ ' + k + ' × ' + (k - 1) + ' × 1 × ' + (k - 1) + ' ＝ ' + k * (k - 1) * (k - 1); pB.textContent = '電腦列舉：B、C 同色的塗法共 ' + c.same + ' 種' + (c.same === k * (k - 1) * (k - 1) ? ' ✓' : ''); }
        else { pA.textContent = '「B、C 不同色」：A ' + k + ' → B ' + (k - 1) + ' → C 要避開 A、B ' + (k - 2) + ' → D 要避開 B、C 兩種不同的顏色 ' + (k - 2) + '　＝ ' + k + ' × ' + (k - 1) + ' × ' + (k - 2) + ' × ' + (k - 2) + ' ＝ ' + k * (k - 1) * (k - 2) * (k - 2); pB.textContent = '電腦列舉：B、C 不同色的塗法共 ' + c.diff + ' 種' + (c.diff === k * (k - 1) * (k - 2) * (k - 2) ? ' ✓' : ''); }
        pC.textContent = '兩類加起來 ' + c.same + ' ＋ ' + c.diff + ' ＝ ' + c.total + '，電腦把全部塗法列出來也是 ' + PG.count(M, k) + ' 種：不重複、不遺漏 ✓'; pC.className = 'pl-pill is-ok'; seen[w] = 1;
        if (seen.same && seen.diff && !done) { done = true; P.track('aha', { id: 'color-count2', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：要看 B、C 是不是同色'); st.append(P.ruleBox('鄰居可能<b>同色</b>也可能<b>不同色</b>時，選擇數<b>不固定</b>，就要<b>分類</b>：每一類各自連乘，再<b>相加</b>。<br>分類要<b>不重複、不遺漏</b>：兩類加起來剛好等於全部塗法的總數。', '分類討論')); api.unlock('分類：每類連乘，再相加'); }
      }
      api.solve(function () { gate.on = false; sn.set(4, true); k = 4; show('same'); show('diff'); sn.set(5, true); k = 5; show('same'); }, false, '要看 B、C 是不是同色：同色時 D 剩 (k − 1) 種，不同色時 D 剩 (k − 2) 種，要分兩類各自連乘再相加');
      st.append(P.hint('兩類各按一次，看連乘式有什麼不一樣。')); api.lock('先做上面的預測');
    },
    /* 2. 環形 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, n = 5, k = 3, holder = h('div'), pA, pB, pC, sn, V;
      P.choice(st, api, { id: 'cc2-p2', predict: true, label: '先猜猜看', prompt: '3 種顏色塗一圈 n 格（<b>首尾也相鄰</b>）。第一格有 3 種選擇，往後每格都「避開前一格」有 2 種。那塗法總共是 3 × 2^(n−1) 種嗎？', row: true, options: [{ ok: true, t: '不是，比它少' }, { t: '是' }, { t: '比它多' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('調整格數 n'); } });
      st.append(P.instr('用按鈕調整這一圈的<b>格數 n</b>（3 到 8）。上面的算法，是把這圈「<b>剪開成一條線</b>」（首尾不相鄰）來算；把<b>首尾同色</b>和<b>首尾不同色</b>分開，看哪一類才是「真正的一圈」。'));
      sn = steppr(st, '格數 n', 3, 8, 5, function (v) { n = v; build(); });
      st.append(holder); pA = pill(st, 'is-blue'); pB = pill(st, 'is-green'); pC = pill(st, 'is-amber');
      function build() {
        holder.innerHTML = ''; V = PG.view(holder, ringModel(n), { k: k, nopal: true, small: true, onTap: function () { } }); var r = ringStats(n, k);
        pA.textContent = '剪開成一條線（首尾不相鄰）：3 × 2' + '^' + (n - 1) + ' ＝ ' + r.chain + ' 種'; pB.textContent = '其中「首尾同色」' + r.endSame + ' 種（這就是 ' + (n - 1) + ' 格的一圈：' + (n > 3 ? ringStats(n - 1, k).ring : 6) + ' 種）；「首尾不同色」' + r.endDiff + ' 種';
        pC.textContent = n + ' 格一圈（首尾相鄰）的塗法 ＝ 首尾不同色的那一類 ＝ ' + r.ring + ' 種　（' + r.chain + ' − ' + r.endSame + ' ＝ ' + r.ring + (r.ring === r.chain - r.endSame ? ' ✓' : '') + '）'; pC.className = 'pl-pill is-ok';
        if (gate.on) return; seen[n] = 1; if (seen[3] && seen[4] && seen[5] && seen[6] && !done) { done = true; P.track('aha', { id: 'color-count2', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：比 3 × 2^(n−1) 少'); st.append(P.ruleBox('剪開成一條線有 <b>k(k−1)^(n−1)</b> 種，但這裡面<b>首尾同色</b>的塗法，在真正的一圈裡不能算（首尾相鄰）。<br>首尾同色的塗法，把首尾合併成一格，就是 <b>(n−1) 格的一圈</b>。所以 <b>n 格的一圈 ＋ (n−1) 格的一圈 ＝ k(k−1)^(n−1)</b>。這就是環形塗色的遞推，不用背公式。', '環形塗色')); api.unlock('n 格環 ＋ (n−1) 格環 ＝ k(k−1)^(n−1)'); }
      }
      build();
      api.solve(function () { gate.on = false; [3, 4, 5, 6].forEach(function (v) { sn.set(v, true); n = v; build(); }); sn.set(5, true); n = 5; build(); }, false, '不是，比 3 × 2^(n−1) 少：剪開成線的塗法裡，首尾同色的那一些，在首尾相鄰的一圈裡不能算');
      st.append(P.hint('n 從 3 調到 6，看「首尾同色」和「首尾不同色」兩類各有幾種。')); api.lock('先做上面的預測');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function sqTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '四區方塊。調整顏色數 k，讓「<b>B、C 不同色</b>」這一類剛好有 <b>48</b> 種塗法。' })); var fin = false, M = PG.model(PG.grid(['AB', 'CD'])), p = pill(b0, 'is-green'), p2 = pill(b0, 'is-blue');
        PG.view(b0, M, { k: 4, nopal: true, small: true, onTap: function () { } });
        function upd(k) { var c = sq(M, k); p.textContent = 'k ＝ ' + k + '：B、C 不同色 ' + k + ' × ' + (k - 1) + ' × ' + (k - 2) + ' × ' + (k - 2) + ' ＝ ' + c.diff + ' 種'; p2.textContent = 'B、C 同色 ' + c.same + ' 種；合計 ' + c.total + ' 種'; p.className = 'pl-pill ' + (c.diff === 48 ? 'is-ok' : 'is-green'); if (c.diff === 48 && !fin) { fin = true; P.toast('k ＝ ' + k + '：48 種'); b0.append(P.ruleBox('不同色這一類：k(k−1)(k−2)²。k ＝ 4：4 × 3 × 2 × 2 ＝ 48。', '找到了')); done(); } }
        var sn = steppr(b0, '顏色數 k', 3, 6, 6, upd); b0.insertBefore(b0.lastChild, p.parentNode); upd(6); setSolve(function () { sn.set(4, true); upd(4); }, 'k ＝ 4（4 × 3 × 2 × 2 ＝ 48）'); b0.append(P.hint('不同色那一類：k × (k−1) × (k−2) × (k−2)。'));
      }
      function ringTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '3 種顏色塗一圈（首尾相鄰）。調整<b>格數 n</b>，讓塗法剛好有 <b>66</b> 種。' })); var fin = false, holder = h('div'), p = pill(b0, 'is-green'), sn;
        function upd(n) { var r = ringStats(n, 3); holder.innerHTML = ''; PG.view(holder, ringModel(n), { k: 3, nopal: true, small: true, onTap: function () { } }); p.textContent = n + ' 格一圈：' + r.ring + ' 種（剪開成線 ' + r.chain + '，減去首尾同色 ' + r.endSame + '）'; p.className = 'pl-pill ' + (r.ring === 66 ? 'is-ok' : 'is-green'); if (r.ring === 66 && !fin) { fin = true; P.toast('n ＝ ' + n + '：66 種'); b0.append(P.ruleBox('n ＝ 6：3 × 2^5 ＝ 96 種是剪開成線，首尾同色的有 30 種（5 格一圈），96 − 30 ＝ 66 種。', '找到了')); done(); } }
        sn = steppr(b0, '格數 n', 3, 8, 3, upd); b0.append(holder); upd(3); setSolve(function () { sn.set(6, true); upd(6); }, 'n ＝ 6（6 格一圈、3 色：96 − 30 ＝ 66 種）'); b0.append(P.hint('3 格：6 種、4 格：18 種、5 格：30 種…往下接。'));
      }
      function wheelTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '輪形：中心 O 加外圈，<b>4 種顏色</b>。調整<b>外圈格數 n</b>，讓塗法剛好有 <b>72</b> 種。（提示：中心先塗，外圈只剩 3 種顏色。）' })); var fin = false, holder = h('div'), p = pill(b0, 'is-green'), sn;
        function upd(n) { var M = PG.model(PG.wheel(n, true)), tot = PG.count(M, 4), rg = ringStats(n, 3).ring; holder.innerHTML = ''; PG.view(holder, M, { k: 4, nopal: true, small: true, onTap: function () { } }); p.textContent = '外圈 ' + n + ' 格：中心 4 種 × 外圈（只剩 3 種顏色的一圈）' + rg + ' ＝ ' + 4 * rg + ' 種（電腦列舉 ' + tot + ' 種' + (tot === 4 * rg ? ' ✓' : '') + '）'; p.className = 'pl-pill ' + (tot === 72 ? 'is-ok' : 'is-green'); if (tot === 72 && !fin) { fin = true; P.toast('n ＝ ' + n + '：72 種'); b0.append(P.ruleBox('輪形：中心先塗，有 4 種；外圈每格都和中心相鄰，只剩 3 種顏色，外圈就是「3 色塗一圈」。n ＝ 4：4 × 18 ＝ 72。', '找到了')); done(); } }
        sn = steppr(b0, '外圈格數 n', 3, 7, 3, upd); b0.append(holder); upd(3); setSolve(function () { sn.set(4, true); upd(4); }, 'n ＝ 4（中心 4 種 × 外圈 3 色塗 4 格一圈 18 種 ＝ 72）'); b0.append(P.hint('外圈用 3 色塗一圈：前一關算過 3 格、4 格、5 格各幾種。'));
      }
      function cmpTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '四區方塊。調整顏色數 k，讓「<b>B、C 同色</b>」這一類比「<b>B、C 不同色</b>」<b>更多</b>。' })); var fin = false, M = PG.model(PG.grid(['AB', 'CD'])), p = pill(b0, 'is-green'), p2 = pill(b0, 'is-blue');
        PG.view(b0, M, { k: 4, nopal: true, small: true, onTap: function () { } });
        function upd(k) { var c = sq(M, k); p.textContent = 'k ＝ ' + k + '：B、C 同色 ' + c.same + ' 種，B、C 不同色 ' + c.diff + ' 種'; p2.textContent = c.same > c.diff ? '同色比較多 ✓' : '不同色比較多（或一樣）'; p.className = 'pl-pill ' + (c.same > c.diff ? 'is-ok' : 'is-green'); if (c.same > c.diff && !fin) { fin = true; P.toast('k ＝ ' + k + '：同色比較多'); b0.append(P.ruleBox('同色：k(k−1)²；不同色：k(k−1)(k−2)²。k 很小時，(k−2)² 很小，不同色比較少；k 變大，不同色就超過同色。所以每一類有多少種，要看 k。', '找到了')); done(); } }
        var sn = steppr(b0, '顏色數 k', 3, 6, 5, upd); upd(5); setSolve(function () { sn.set(3, true); upd(3); }, 'k ＝ 3（同色 3 × 2 × 1 × 2 ＝ 12，不同色 3 × 2 × 1 × 1 ＝ 6）'); b0.append(P.hint('比較 (k−1) 和 (k−2)²。'));
      }
      P.taskSeq(box, api, [sqTask, ringTask, wheelTask, cmpTask], { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-count2' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-count2', moduleName: '塗色（三）：計數塗色(二)，分類討論與環形', askAbout: '塗色計數的分類討論、環形與輪形',
        aha: '鄰居可能同色也可能不同色時，要<b>分類</b>（每類連乘再相加，<b>不重複、不遺漏</b>）；環形＝剪開成線，<b>減掉首尾同色</b>；輪形＝中心先塗，外圈是<b>少一色</b>的環形。',
        cards: [{ text: '分類：每一類各自連乘，再相加；兩類加起來等於全部（用列舉檢查）', src: '分類討論' }, { text: '環形（首尾相鄰）：n 格環 ＋ (n−1) 格環 ＝ k(k−1)^(n−1)；n 格環 ＝ (k−1)^n ＋ (−1)^n (k−1)；輪形 ＝ 中心 k 種 × (k−1) 色的 n 格環', src: '環形塗色' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '色多項式<br>刪除與收縮' }, { at: 0.85, label: '環形塗色的通式與容斥' }] },
        teasers: [{ title: '環形塗色通式', q: 'a(n) ＋ a(n−1) ＝ k(k−1)^(n−1)，怎麼推出 (k−1)^n ＋ (−1)^n (k−1)？', where: 'PK2A 2507 第 8 堂（加法原理與乘法原理）', lv: 'L3' }],
        parent: { pitfall: '孩子常常分類時漏掉一類或重複算；環形忘了首尾相鄰；輪形不知道中心塗了之後，外圈就少一種顏色。', place: '國中到高中的塗色計數，用列舉驗證分類是否不重複、不遺漏。', ask: ['什麼時候塗色的選擇數會不固定？', '環形為什麼不能直接用 k(k−1)^(n−1)？', '輪形怎麼拆成中心和外圈？'] },
        classes: ['PK2A（2025 年 8 月，第 8 堂）：加法原理與乘法原理（染色）', 'PI2A（2025 年 7 月，第 4 堂）：加法原理與乘法原理(二)（塗色）'], next: { href: 'play-color-cube.html', text: '下一個：塗色（四），立體切開塗色' } });
    }];
  new P.Lesson({ id: 'color-count2', title: '塗色（三）：計數塗色(二)，分類討論與環形', steps: steps });
})();
