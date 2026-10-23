/* 獵豹玩中學｜塗色（二）：計數塗色(一)，選擇數與塗色順序
   預測＋鄰居同色或不同色，這一格還剩幾種顏色 → 預測＋人臉（戴眼鏡）決定塗色順序，看哪種順序每一步的選擇數固定、能連乘 → 3 個操作關卡。
   要擊中的迷思：每格都寫 (k−1)；不看鄰居是不是同色；順序隨便排就想直接連乘。 */
(function () {
  var P = Play, h = P.h, PG = window.PG;
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function nm(M, i) { return M.regions[i].name; }

  /* 塗色順序工具：點圖上的區域一個一個排進順序，按「試試這個順序」，畫面算出每一步還剩幾種顏色可以選。
     o: k（顏色數）、onTry(result)；回傳 {V, order, tryIt(), setOrder(ids)} */
  function orderTool(host, M, o) {
    var order = [], T = {}, line, res, V;
    V = PG.view(host, M, { k: o.k, nopal: true, small: true, gate: o.gate, onTap: function (i) { if (order.indexOf(i) >= 0) { P.toast('這個區域已經排進順序了'); return; } order.push(i); show(); } });
    var row = h('div', { class: 'pg-pal' }); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:6px 0 10px';
    function btn(t, fn, c) { var b = h('button', { type: 'button' }, t); b.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;font-weight:800;cursor:pointer;border:2px solid ' + (c || '#b9ad92') + ';background:#fff;color:#122548'; b.addEventListener('click', fn); row.append(b); return b; }
    btn('退一步', function () { order.pop(); show(); }); btn('清除順序', function () { order = []; show(); }); btn('試試這個順序', function () { T.tryIt(); }, '#d29b1f'); host.append(row); line = pill(host, 'is-blue'); res = pill(host, 'is-amber');
    function show() {
      M.regions.forEach(function (rg, i) { var t = order.indexOf(i); V.tx[i].textContent = t >= 0 ? '' + (t + 1) : (rg.lab || rg.name); });
      line.textContent = '順序：' + (order.length ? order.map(function (i) { return nm(M, i); }).join(' → ') : '（點圖上的區域，一個一個排進來）') + '　（已排 ' + order.length + ' / ' + M.n + '）'; res.textContent = ''; res.className = 'pl-pill is-amber';
    }
    T.tryIt = function () {
      if (order.length < M.n) { P.toast('要把 ' + M.n + ' 個區域都排進順序'); return null; }
      var sets = PG.orderSets(M, V.k, order), fixed = sets.every(function (s) { return s.length === 1; }), r = { fixed: fixed, sets: sets, order: order.slice() };
      if (fixed) { var prod = sets.reduce(function (a, s) { return a * s[0]; }, 1), tot = PG.count(M, V.k); r.prod = prod; r.total = tot; res.textContent = '✓ 每一步的選擇數都固定：' + order.map(function (i, t) { return nm(M, i) + ' ' + sets[t][0]; }).join(' → ') + '。連乘 ' + sets.map(function (s) { return s[0]; }).join(' × ') + ' ＝ ' + prod + '，和電腦列舉全部塗法的總數 ' + tot + ' 一樣'; res.className = 'pl-pill is-ok'; }
      else { var bad = sets.map(function (s, t) { return s.length > 1 ? nm(M, order[t]) + '：有時剩 ' + s.join(' 種、有時剩 ') + ' 種' : null; }).filter(Boolean); res.textContent = '✗ 選擇數不固定（' + bad.join('；') + '）：要看前面塗了哪些顏色，沒辦法直接連乘'; res.className = 'pl-pill is-pink'; }
      if (o.onTry) o.onTry(r); return r;
    };
    T.setOrder = function (ids) { order = ids.map(function (id) { return M.regions.findIndex(function (r) { return r.id === id; }); }); show(); }; T.V = V; T.order = function () { return order; }; show(); return T;
  }

  var steps = [
    /* 1. 選擇數＝總色數－鄰居用了幾種不同的顏色 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, V, M = PG.model(PG.grid(['AACBB'], { A: 'A', C: 'C', B: 'B' }));
      P.choice(st, api, { id: 'cc1-p1', predict: true, label: '先猜猜看', prompt: '共有 <b>4 種顏色</b>。A、B 都塗好了，而且<b>塗成同一種顏色</b>。夾在中間的 C（和 A、B 都相鄰）還剩幾種顏色可以選？', row: true, options: [{ ok: true, t: '3 種' }, { t: '2 種' }, { t: '1 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('塗 A、B，看 C 還剩幾種'); } });
      st.append(P.instr('A、B 不相鄰，C 和兩邊都相鄰。<b>先塗 A、B</b>（不要塗 C），看下面「C 還剩幾種」：A、B 塗<b>同色</b>和<b>不同色</b>各試試。'));
      V = PG.view(st, M, { k: 4, status: true, watch: 'C', gate: function () { return gate.on; }, onChange: function (v) {
        if (gate.on || done) return; var a = v.col[0], b = v.col[2], c = v.col[1]; if (c >= 0 || a < 0 || b < 0) return; seen[a === b ? 'same' : 'diff'] = 1;
        if (seen.same && seen.diff) { done = true; P.track('aha', { id: 'color-count1', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：3 種'); st.append(P.ruleBox('塗一格時，<b>選擇數 ＝ 總色數 − 已塗好的鄰居用了「幾種不同」的顏色</b>。<br>A、B 同色：鄰居只用了 1 種，C 剩 4 − 1 ＝ <b>3</b> 種；A、B 不同色：用了 2 種，C 只剩 4 − 2 ＝ <b>2</b> 種。所以不是每格都「總色數減 1」，要看鄰居用了<b>幾種不同的顏色</b>。', '選擇數')); api.unlock('選擇數 ＝ 總色數 − 鄰居用了幾種不同顏色'); }
      } });
      api.solve(function () { gate.on = false; V.clear(); V.paint(0, 0); V.paint(2, 0); V.paint(0, 1); V.paint(2, 2); V.paint(0, 0); V.paint(2, 0); }, false, 'C 剩 3 種（A、B 同色，鄰居只用了 1 種顏色：4 − 1 ＝ 3；不同色就只剩 2 種）');
      st.append(P.hint('A、B 先塗同一種顏色看看，再改成不同顏色。')); api.lock('先做上面的預測');
    },
    /* 2. 塗色順序 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, M = PG.model(PG.face('glasses')), T;
      P.choice(st, api, { id: 'cc1-p2', predict: true, label: '先猜猜看', prompt: '要算人臉有幾種塗法。為了好算，<b>先塗哪些區域</b>最好？', row: true, options: [{ ok: true, t: '和很多區域相鄰的（臉、鏡架）' }, { t: '眼睛、耳朵這些小的' }, { t: '順序沒差' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('排順序、試試看'); } });
      st.append(P.instr('4 種顏色塗這張<b>戴眼鏡的人臉</b>（鏡架碰到兩隻眼睛、鼻子和臉；眼睛、鼻子都碰到臉）。<b>點圖上的區域</b>，一個一個排成塗色順序，再按「試試這個順序」，看每一步還剩幾種顏色可選。試試好的排法，也試試壞的排法。'));
      T = orderTool(st, M, { k: 4, gate: function () { return gate.on; }, onTry: function (r) {
        if (gate.on) return; seen[r.fixed ? 'ok' : 'bad'] = 1; if (seen.ok && seen.bad && !done) { done = true; P.track('aha', { id: 'color-count1', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：先塗相鄰多的'); st.append(P.ruleBox('每一步的選擇數要<b>固定</b>，才能一步一步<b>連乘</b>。把「和很多區域相鄰」的先塗（臉、鏡架），後面每個區域的鄰居顏色都<b>已經互不相同</b>，選擇數就固定。<br>如果兩隻眼睛先塗、鏡架最後塗，鏡架的鄰居（臉、左眼、右眼）可能只用了 2 種、也可能 3 種顏色，選擇數就<b>不固定</b>——這種情形要<b>分類討論</b>（下一個單元）。', '塗色順序')); api.unlock('先塗相鄰多的，選擇數才固定'); } } });
      api.solve(function () { gate.on = false; T.setOrder(['F', 'A', 'B', 'G', 'N', 'L', 'R', 'M']); T.tryIt(); T.setOrder(['F', 'G', 'A', 'B', 'N', 'L', 'R', 'M']); T.tryIt(); }, false, '先塗和很多區域相鄰的（臉、鏡架），後面每一步的選擇數才固定，能連乘');
      st.append(P.hint('先排「臉、鏡架」再排別的；也排排看「兩隻眼睛先，鏡架最後」。')); api.lock('先做上面的預測');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function orderTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '4 種顏色塗這張<b>有眉毛的人臉</b>（眉毛碰到臉和同一邊的眼睛）。排出一個<b>每一步選擇數都固定</b>的塗色順序，按「試試這個順序」。' })); var fin = false, M = PG.model(PG.face('brows')), T;
        T = orderTool(b0, M, { k: 4, onTry: function (r) { if (r.fixed && !fin) { fin = true; P.toast('每一步都固定，可以連乘'); b0.append(P.ruleBox('先塗臉，再塗只碰到臉的耳、鼻、嘴，每個眼睛、眉毛都在「鄰居顏色已經互不相同」之後才塗，選擇數固定。例如 臉 4、耳 3、耳 3、眼 3、眉 2、眼 3、眉 2、鼻 3、嘴 3，連乘 ＝ 11664。', '找到了')); done(); } } });
        setSolve(function () { T.setOrder(['F', 'L', 'R', 'A', 'P', 'B', 'Q', 'N', 'M']); T.tryIt(); }, '例如 臉 → 左耳 → 右耳 → 左眼 → 左眉 → 右眼 → 右眉 → 鼻 → 嘴（臉要最先塗；不能讓左眼、右眼這兩個互不相鄰的先塗，臉最後塗）');
        b0.append(P.hint('什麼區域最好最先塗？最不能留到最後塗的是誰？'));
      }
      function kTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '有眉毛的人臉，用 <b>k 種顏色</b>塗。調整 k，讓塗法的<b>總數剛好是 192 種</b>。（下面照「臉 → 耳 → 耳 → 眼 → 眉 → 眼 → 眉 → 鼻 → 嘴」的順序連乘。）' })); var fin = false, M = PG.model(PG.face('brows')), pT = pill(b0, 'is-blue'), pE = pill(b0, 'is-green'), V, sn, holder = h('div');
        function upd(k) { var f = [k, k - 1, k - 1, k - 1, k - 2, k - 1, k - 2, k - 1, k - 1], prod = f.reduce(function (a, x) { return a * Math.max(x, 0); }, 1), tot = PG.count(M, k);
          pT.textContent = 'k ＝ ' + k + '：每一步的選擇數 ' + f.map(function (x) { return Math.max(x, 0); }).join(' × ') + ' ＝ ' + prod; pE.textContent = '電腦把全部塗法列出來：共 ' + tot + ' 種' + (tot === prod ? '（和連乘一樣 ✓）' : ''); pE.className = 'pl-pill ' + (tot === 192 ? 'is-ok' : 'is-green'); if (tot === 192 && !fin) { fin = true; P.toast('k ＝ ' + k + '：192 種'); b0.append(P.ruleBox('k ＝ 3：3 × 2 × 2 × 2 × 1 × 2 × 1 × 2 × 2 ＝ 192。眉毛碰到「臉和眼睛」，這兩個顏色不同，所以眉毛只剩 k − 2 種。', '找到了')); done(); } }
        sn = P.stepper('顏色數 k', 3, 6, 5, function (v) { upd(v); }, function (v) { return v; }); b0.append(h('div', { class: 'pl-steprow' }, sn.el)); b0.append(holder); V = PG.view(holder, M, { k: 3, nopal: true, small: true, onTap: function () { } }); upd(5);
        setSolve(function () { sn.set(3, true); upd(3); }, 'k ＝ 3（3 × 2 × 2 × 2 × 1 × 2 × 1 × 2 × 2 ＝ 192）'); b0.append(P.hint('眉毛旁邊有「臉」和「眼睛」，它們的顏色一樣嗎？k 太大，總數會很多。'));
      }
      function forceTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '4 種顏色。先塗<b>臉、左眼、右眼</b>（不要塗鏡架），讓<b>鏡架只剩 1 種顏色可以選</b>。' })); var fin = false, M = PG.model(PG.face('glasses')), V;
        V = PG.view(b0, M, { k: 4, status: true, small: true, watch: 'G', onChange: function (v) { var gi = M.regions.findIndex(function (r) { return r.id === 'G'; }); if (v.col[gi] >= 0 || v.conflicts().length || fin) return; var ix = function (id) { return M.regions.findIndex(function (r) { return r.id === id; }); }, f = v.col[ix('F')] >= 0, a = v.col[ix('A')] >= 0, b = v.col[ix('B')] >= 0; if (f && a && b && v.watchN === 1) { fin = true; P.toast('鏡架只剩 1 種'); b0.append(P.ruleBox('臉、左眼、右眼用了 3 種不同的顏色，鏡架的鄰居用了 3 種，只剩 4 − 3 ＝ 1 種。要讓選擇數最少，就讓鄰居的顏色<b>都不一樣</b>；兩隻眼睛同色時，鏡架就有 2 種可選。', '找到了')); done(); } } });
        var idx = function (id) { return M.regions.findIndex(function (r) { return r.id === id; }); };
        setSolve(function () { V.clear(); V.paint(idx('F'), 0); V.paint(idx('A'), 1); V.paint(idx('B'), 2); }, '臉、左眼、右眼塗 3 種不同的顏色（例如橘、藍、綠），鏡架的鄰居用了 3 種，只剩 4 − 3 ＝ 1 種'); b0.append(P.hint('鏡架旁邊有誰？讓它們的顏色全都不一樣。'));
      }
      P.taskSeq(box, api, [orderTask, kTask, forceTask], { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-count1' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-count1', moduleName: '塗色（二）：計數塗色(一)，選擇數與塗色順序', askAbout: '塗色的塗法數、選擇數、塗色順序',
        aha: '塗一格的<b>選擇數 ＝ 總色數 − 鄰居用了幾種「不同」的顏色</b>；先塗<b>相鄰多</b>的區域，每一步選擇數才<b>固定</b>，才能連乘。',
        cards: [{ text: '選擇數 ＝ 總色數 − 已塗鄰居用到的不同顏色數；每步選擇數固定，就可以連乘（乘法原理）', src: '小學高年級到國中：乘法原理' }, { text: '先塗相鄰最多的區域；若某一格的鄰居可能同色也可能不同色，選擇數不固定，要分類討論', src: '塗色計數' }],
        depth: { here: 0.25, cheetah: [{ at: 0.55, label: '色多項式<br>刪除與收縮' }, { at: 0.85, label: '圖的色多項式與遞推' }] },
        teasers: [{ title: '分類討論', q: '當選擇數不固定時，怎麼分類才不會重複、不會漏掉？', where: 'PK2A 2507 第 8 堂（加法原理與乘法原理）', lv: 'L2' }],
        parent: { pitfall: '孩子常常每格都寫「總色數減 1」；不看鄰居是不是同色；順序亂排就想直接連乘。', place: '乘法原理的應用，接著是需要分類討論的塗色。', ask: ['塗一格，要看鄰居用了「幾種不同」的顏色，為什麼？', '塗色時為什麼要先塗相鄰多的區域？', '什麼情形選擇數會不固定？'] },
        classes: ['PK2A（2025 年 8 月，第 8 堂）：加法原理與乘法原理（染色）', 'PI2A（2025 年 7 月，第 4 堂）：加法原理與乘法原理(二)（塗色）'], next: { href: 'play-color-count2.html', text: '下一個：塗色計數（二），分類討論與環形' } });
    }];
  new P.Lesson({ id: 'color-count1', title: '塗色（二）：計數塗色(一)，選擇數與塗色順序', steps: steps });
})();
