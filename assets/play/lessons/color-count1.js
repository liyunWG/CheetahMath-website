/* 獵豹玩中學｜塗色（二）：計數塗色(一)，選擇數與塗色順序
   全程真實塗色：點顏色、點區域。看每一格「還能選幾種」，自己決定塗色順序，看哪種順序每一步的選擇數固定、能連乘。
   主題：說例 6「有五種顏色的畫筆塗魚，相鄰區域不同色，顏色可重複、不一定用完」（魚身體碰到所有部分）。
   要擊中的迷思：每格都寫 (k−1)；不看鄰居是不是同色；順序隨便排就想直接連乘。 */
(function () {
  var P = Play, h = P.h, PG = window.PG;
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function btn(host, t, fn) { var b = h('button', { type: 'button' }, t); b.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;font-weight:800;cursor:pointer;border:2px solid #d29b1f;background:#fff;color:#122548;margin:4px'; b.addEventListener('click', fn); host.append(b); return b; }
  function nm(M, i) { return M.regions[i].name; }
  var HINT0 = '把每一區都塗好，這裡會告訴你這個塗色順序好不好';
  /* 塗完（每區都有色、沒有同色相鄰）之後，看「你這次的塗色順序」是不是每一步選擇數都固定 */
  function judge(V, M, k, res) {
    if (!V.complete() || V.conflicts().length) { res.textContent = V.complete() ? '還有同色相鄰（紅色），先改掉再看' : HINT0; res.className = 'pl-pill is-amber'; return null; }
    var order = V.order.slice(), sets = PG.orderSets(M, k, order), fixed = sets.every(function (s) { return s.length === 1; }), r = { fixed: fixed, order: order, sets: sets };
    var seq = order.map(function (i) { return nm(M, i); }).join(' → ');
    if (fixed) { var prod = sets.reduce(function (a, s) { return a * s[0]; }, 1), tot = PG.count(M, k); r.prod = prod; r.total = tot; res.textContent = '✓ 你的順序：' + seq + '。每一步的選擇數都固定：' + sets.map(function (s) { return s[0]; }).join(' × ') + ' ＝ ' + prod + '，和電腦列舉全部塗法的總數 ' + tot + ' 一樣'; res.className = 'pl-pill is-ok'; }
    else { var bad = sets.map(function (s, t) { return s.length > 1 ? nm(M, order[t]) + '：有時剩 ' + s.join(' 種、有時剩 ') + ' 種' : null; }).filter(Boolean); res.textContent = '✗ 你的順序：' + seq + '。選擇數不固定（' + bad.join('；') + '）：要看前面塗了哪些顏色，沒辦法直接連乘。按「再塗一次」換個順序'; res.className = 'pl-pill is-pink'; }
    return r;
  }
  function idxOf(M, id) { return M.regions.findIndex(function (r) { return r.id === id; }); }

  var steps = [
    /* 1. 選擇數＝總色數－鄰居用了幾種不同的顏色（魚，5 色） */
    function (st, api) {
      var gate = { on: true }, done = false, M = PG.model(PG.fish()), V;
      P.choice(st, api, { id: 'cc1-p1', predict: true, label: '先猜猜看', prompt: '有 <b>5 種顏色</b>的畫筆塗這條魚，<b>相鄰的區域不能同色</b>。魚的<b>身體</b>已經塗好了，<b>左眼</b>還剩幾種顏色可以選？', row: true, options: [{ ok: true, t: '4 種' }, { t: '5 種' }, { t: '3 種' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把魚塗滿'); } });
      st.append(P.instr('先點一個<b>顏色</b>，再點<b>區域</b>塗色（再點同一色就擦掉）。同色相鄰的邊界會變<b>紅色</b>。<b>先塗身體</b>，再點一點別的區域（眼睛、魚鰭、嘴），看下面的提示：它<b>還能選幾種</b>顏色。最後把整條魚塗滿。'));
      V = PG.view(st, M, { k: 5, status: true, info: true, gate: function () { return gate.on; }, onChange: function (v) {
        if (gate.on || done || !v.complete() || v.conflicts().length) return; done = true; P.track('aha', { id: 'color-count1', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：4 種');
        st.append(P.ruleBox('塗一格時，<b>選擇數 ＝ 總色數 − 已塗好的鄰居用了「幾種不同」的顏色</b>。<br>魚身體和每一個部分都相鄰，身體塗好以後，眼睛、魚鰭、嘴各自只剩 5 − 1 ＝ <b>4</b> 種。兩隻眼睛<b>不相鄰</b>，可以塗同一色，也可以不同色。', '選擇數')); api.unlock('選擇數 ＝ 總色數 − 鄰居用了幾種不同顏色');
      } });
      api.solve(function () { gate.on = false; V.clear(); PG.solve(M, 5).forEach(function (c, i) { V.paint(i, c); }); V.focusI = 4; V.draw(); }, false, '4 種（身體塗好了，左眼的鄰居只有身體，用了 1 種顏色：5 − 1 ＝ 4）');
      st.append(P.hint('身體塗好後，點眼睛看提示。')); api.lock('先做上面的預測');
    },
    /* 2. 塗色順序 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, M = PG.model(PG.fish()), V, res;
      P.choice(st, api, { id: 'cc1-p2', predict: true, label: '先猜猜看', prompt: '要算這條魚（5 色）一共有幾種塗法。為了好算，<b>先塗哪裡</b>最好？', row: true, options: [{ ok: true, t: '身體（碰到每一個部分）' }, { t: '眼睛' }, { t: '順序沒差' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('用不同的順序塗兩次'); } });
      st.append(P.instr('這次用<b>不同的順序</b>把魚塗滿<b>兩次</b>：一次<b>先塗身體</b>，一次<b>先塗兩隻眼睛</b>（最後才塗身體）。每次塗完，下面會告訴你這個順序每一步的選擇數<b>固定</b>不固定，固定才能連乘。塗完一次，按「再塗一次」。'));
      V = PG.view(st, M, { k: 5, status: true, info: true, gate: function () { return gate.on; }, onChange: function (v) {
        if (gate.on || !res) return; var r = judge(v, M, 5, res); if (!r) return; seen[r.fixed ? 'ok' : 'bad'] = 1;
        if (seen.ok && seen.bad && !done) { done = true; P.track('aha', { id: 'color-count1', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：先塗身體'); st.append(P.ruleBox('<b>先塗身體</b>：身體 5 種，之後每一格都只剩 4 種，<b>每一步的選擇數固定</b>，可以連乘：5 × 4 × 4 × 4 × 4 × 4 × 4 ＝ <b>20480</b> 種。<br>如果<b>先塗兩隻眼睛</b>，最後才塗身體，身體要避開兩隻眼睛的顏色：眼睛同色身體剩 4 種，不同色只剩 3 種，選擇數<b>不固定</b>，就不能直接連乘（要分類討論）。<br>所以要<b>先塗和很多區域相鄰</b>的。', '塗色順序')); api.unlock('先塗相鄰多的，選擇數才固定，才能連乘'); }
      } });
      res = pill(st, 'is-amber'); res.textContent = HINT0; var row = h('div'); row.style.textAlign = 'center'; st.append(row); btn(row, '再塗一次', function () { if (!gate.on) { V.clear(); res.textContent = HINT0; res.className = 'pl-pill is-amber'; } });
      api.solve(function () { gate.on = false; var sol = PG.solve(M, 5); V.clear(); ['A', 'E', 'B', 'T', 'L', 'R', 'M'].forEach(function (id) { V.paint(idxOf(M, id), sol[idxOf(M, id)]); }); V.clear(); ['B', 'T', 'L', 'R', 'A', 'E', 'M'].forEach(function (id) { V.paint(idxOf(M, id), sol[idxOf(M, id)]); }); }, false, '先塗身體（碰到每一個部分的），之後每一格都只剩 4 種，每一步選擇數固定：5 × 4 × 4 × 4 × 4 × 4 × 4 ＝ 20480');
      st.append(P.hint('第一次：身體、背鰭、左鰭、右鰭、眼睛、嘴。第二次：先左眼、右眼，最後才塗身體。')); api.lock('先做上面的預測');
    },
    /* 3. 操作關卡（全部要塗色） */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function paintTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var fin = false, M = PG.model(cfg.def()), V, res = pill(b0, 'is-amber');
          V = PG.view(b0, M, { k: cfg.k, status: true, info: true, small: cfg.small, onChange: function (v) { var r = judge(v, M, cfg.k, res); if (r && r.fixed && !fin) { fin = true; P.toast('每一步選擇數都固定'); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } });
          var row = h('div'); row.style.textAlign = 'center'; b0.append(row); btn(row, '再塗一次', function () { V.clear(); res.textContent = HINT0; res.className = 'pl-pill is-amber'; });
          res.textContent = HINT0;
          setSolve(function () { var sol = PG.solve(M, cfg.k); V.clear(); cfg.order.forEach(function (id) { V.paint(idxOf(M, id), sol[idxOf(M, id)]); }); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      function forceTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '4 種顏色塗這張戴眼鏡的人臉。先塗<b>臉、左眼、右眼</b>（<b>不要塗鏡架</b>），讓<b>鏡架只剩 1 種顏色可以選</b>。' })); var fin = false, M = PG.model(PG.face()), V;
        V = PG.view(b0, M, { k: 4, status: true, watch: 'G', small: true, onChange: function (v) { if (v.col[idxOf(M, 'G')] >= 0 || v.conflicts().length || fin) return; if (v.col[idxOf(M, 'F')] >= 0 && v.col[idxOf(M, 'A')] >= 0 && v.col[idxOf(M, 'B')] >= 0 && v.watchN === 1) { fin = true; P.toast('鏡架只剩 1 種'); b0.append(P.ruleBox('鏡架的鄰居有臉、左眼、右眼、鼻。臉、左眼、右眼用了 3 種不同的顏色，鏡架只剩 4 − 3 ＝ 1 種。要讓選擇數最少，就讓鄰居的顏色<b>都不一樣</b>；兩隻眼睛同色時，鏡架就有 2 種可選。', '找到了')); done(); } } });
        setSolve(function () { V.clear(); V.paint(idxOf(M, 'F'), 0); V.paint(idxOf(M, 'A'), 1); V.paint(idxOf(M, 'B'), 2); }, '臉、左眼、右眼塗 3 種不同的顏色（例如橘、藍、綠），鏡架的鄰居用了 3 種，只剩 4 − 3 ＝ 1 種'); b0.append(P.hint('鏡架旁邊有誰？讓它們的顏色全都不一樣。'));
      }
      var tasks = [
        paintTask({ prompt: '這條魚改用 <b>4 種顏色</b>。把它塗滿，並用一個<b>每一步選擇數都固定</b>的順序（先塗誰？）。塗完下面會告訴你。', def: PG.fish, k: 4, order: ['B', 'T', 'L', 'R', 'A', 'E', 'M'], rule: '先塗身體（4 種），之後每一格都剩 3 種：4 × 3 × 3 × 3 × 3 × 3 × 3 ＝ 2916 種。', answer: '先塗身體：身體 4 種，其他每一格都只剩 3 種，連乘 4 × 3 × 3 × 3 × 3 × 3 × 3 ＝ 2916', hint: '什麼區域最好最先塗？' }),
        paintTask({ prompt: '4 種顏色塗這張<b>戴眼鏡的人臉</b>（鏡架碰到兩隻眼睛、鼻子和臉；臉碰到耳、鏡架、鼻、嘴）。把它塗滿，用一個<b>每一步選擇數都固定</b>的順序。', def: PG.face, k: 4, small: true, order: ['F', 'G', 'A', 'B', 'N', 'L', 'R', 'M'], rule: '先塗臉和鏡架（相鄰多的），再塗眼睛、鼻、耳、嘴，每一步的鄰居顏色都已經互不相同：4 × 3 × 3 × 3 × 2 × 3 × 3 × 3 ＝ 5832 種。', answer: '先塗臉、鏡架，再塗眼睛、鼻、耳、嘴：4 × 3 × 3 × 3 × 2 × 3 × 3 × 3 ＝ 5832（不能先塗兩隻眼睛、最後才塗鏡架）', hint: '鏡架不能留到眼睛都塗好以後才塗。' }),
        forceTask];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-count1' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-count1', moduleName: '塗色（二）：計數塗色(一)，選擇數與塗色順序', askAbout: '塗色的塗法數、選擇數、塗色順序',
        aha: '塗一格的<b>選擇數 ＝ 總色數 − 鄰居用了幾種「不同」的顏色</b>；先塗<b>相鄰多</b>的區域（魚的身體），每一步選擇數才<b>固定</b>，才能連乘：5 × 4^6 ＝ 20480。',
        cards: [{ text: '選擇數 ＝ 總色數 − 已塗鄰居用到的不同顏色數；每步選擇數固定，就可以連乘（乘法原理）', src: '小學高年級到國中：乘法原理' }, { text: '先塗相鄰最多的區域；若某一格的鄰居可能同色也可能不同色，選擇數不固定，要分類討論', src: '塗色計數' }],
        depth: { here: 0.25, cheetah: [{ at: 0.55, label: '色多項式<br>刪除與收縮' }, { at: 0.85, label: '圖的色多項式與遞推' }] },
        teasers: [{ title: '分類討論', q: '當選擇數不固定時，怎麼分類才不會重複、不會漏掉？', where: 'PK2A 2507 第 8 堂（加法原理與乘法原理）', lv: 'L2' }],
        parent: { pitfall: '孩子常常每格都寫「總色數減 1」；不看鄰居是不是同色；順序亂排就想直接連乘。', place: '乘法原理的應用，接著是需要分類討論的塗色。', ask: ['塗一格，要看鄰居用了「幾種不同」的顏色，為什麼？', '塗色時為什麼要先塗相鄰多的區域？', '什麼情形選擇數會不固定？'] },
        classes: ['PK2A（2025 年 8 月，第 8 堂）：加法原理與乘法原理（染色）', 'PI2A（2025 年 7 月，第 4 堂）：加法原理與乘法原理(二)（塗色）'], next: { href: 'play-color-count2.html', text: '下一個：塗色計數（二），分類討論與環形' } });
    }];
  new P.Lesson({ id: 'color-count1', title: '塗色（二）：計數塗色(一)，選擇數與塗色順序', steps: steps });
})();
