/* 獵豹玩中學｜塗色（四）：立體切開塗色
   預測＋3×3×3 外面塗色切成 27 塊，看每個小方塊有幾面有色（角 3、邊 2、面 1、內部 0）→ 預測＋n 變大各類怎麼變（為什麼是 n−2）→ 3 個操作關卡（選出角、內部 27 塊、底面不塗）。
   要擊中的迷思：8、12(n−2)、6(n−2)²、(n−2)³ 只會背；不知道哪些面有塗（底面不塗時公式就變了）。 */
(function () {
  var P = Play, h = P.h, D = window.Play3D;
  var PAINT = '#e8590c', WOOD = '#f3ecd8', CLS = ['#9aa3b5', '#1f9d55', '#d29b1f', '#d6336c'], CNAME = ['內部（0 面）', '面上（1 面）', '邊上（2 面）', '角（3 面）'];
  function pill(host, cls) { var p = P.pill('', cls || 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return p; }
  function steppr(host, label, min, max, val, fn) { var sn = P.stepper(label, min, max, val, fn, function (v) { return v; }); host.append(h('div', { class: 'pl-steprow' }, sn.el)); return sn; }
  /* 小方塊 (i, j, k)（0 到 n−1）有哪幾面有色：+x、−x、+y、−y、+z、−z（順序對應 Play3D.box 的面）。variant：'all' 六面都塗，'nobottom' 底面（−y）不塗 */
  /* 面的順序同 Play3D.box：[+z 前, −z 後, −x 左, +x 右, +y 上, −y 下]。v：'all'、'nobottom'，或六個 true／false（哪幾面有塗） */
  function faceFlags(n, i, j, k, v) { var pf = Array.isArray(v) ? v : v === 'nobottom' ? [1, 1, 1, 1, 1, 0] : [1, 1, 1, 1, 1, 1], on = [k === n - 1, k === 0, i === 0, i === n - 1, j === n - 1, j === 0]; return on.map(function (b, t) { return !!(b && pf[t]); }); }
  function count(n, variant) { var c = [0, 0, 0, 0, 0, 0, 0], i, j, k; for (i = 0; i < n; i++) for (j = 0; j < n; j++) for (k = 0; k < n; k++) c[faceFlags(n, i, j, k, variant).filter(Boolean).length]++; return c; }
  function kind(n, i, j, k) { var e = [i, j, k].filter(function (v) { return v === 0 || v === n - 1; }).length; return e; }   /* 在大正方體的 角(3)／邊(2)／面(1)／內部(0) */

  /* 立方體畫面。o: n、variant、gate、onTap(cid)；回傳 {sc, set(n), setExplode(g), setClass(on), sel, rebuild()} */
  function cubeView(host, o) {
    var sc = PS.scene(host, { fitR: 1.2, yaw: -0.6, pitch: 0.45 }), S = { sc: sc, n: o.n, variant: o.variant || 'all', g: 0, cls: false, sel: {}, sel1: -1 };
    S.rebuild = function () {
      var n = S.n, faces = [], i, j, k, c = (n - 1) / 2, sp = 1 + S.g * 0.9, size = 0.92, id = 0;
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) for (k = 0; k < n; k++, id++) {
        var fl = faceFlags(n, i, j, k, S.variant), cnt = fl.filter(Boolean).length, x = (i - c) * sp - size / 2, y = (j - c) * sp - size / 2, z = (k - c) * sp - size / 2, bx = D.box(x, y, z, size, size, size, WOOD), sel = S.sel[id] || S.sel1 === id;
        bx.forEach(function (f, fi) { var painted = fl[fi]; if (S.cls) { f.fill = CLS[cnt]; f.alpha = painted ? 1 : 0.38; } else { f.fill = painted ? PAINT : WOOD; } f.cid = id; f.stroke = sel ? '#122548' : 'rgba(18,37,72,.55)'; f.lw = sel ? 3 : 1; f.double = false; faces.push(f); });
      }
      sc.faces = faces; sc.fit(0.95 * n * (1 + S.g * 0.9) * 0.62 + 0.5); sc.invalidate();
    };
    S.set = function (n) { S.n = n; S.sel = {}; S.sel1 = -1; S.rebuild(); };
    sc.onTap = function (pos, f) { if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; } if (!f) return; if (o.onTap) o.onTap(f.cid, S); };
    S.rebuild(); window.__CUBE = S; return S;
  }
  function btnRow(host, items) { var row = h('div', { class: 'pg-pal' }); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:6px 0 10px'; var out = {}; items.forEach(function (it) { var b = h('button', { type: 'button' }, it.t); b.style.cssText = 'min-height:46px;padding:0 14px;border-radius:14px;font-weight:800;cursor:pointer;border:2px solid ' + (it.c || '#b9ad92') + ';background:#fff;color:#122548'; b.addEventListener('click', function () { it.fn(b); }); row.append(b); out[it.k] = b; }); host.append(row); return out; }
  function legend(host) { var d = h('div', { class: 'pl-readout' }); [3, 2, 1, 0].forEach(function (c) { var p = h('span', { class: 'pl-pill' }, CNAME[c]); p.style.cssText = 'background:' + CLS[c] + ';color:#fff;font-weight:800'; d.append(p); }); host.append(d); }
  function cubeInfo(n, i) { var k = i % n, j = Math.floor(i / n) % n, ii = Math.floor(i / (n * n)); return { i: ii, j: j, k: k }; }

  var steps = [
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, S, pC, pT, pS;
      P.choice(st, api, { id: 'cu-p1', predict: true, label: '先猜猜看', prompt: '3×3×3 的大正方體，<b>外面六個面都塗色</b>，再切成 27 個小方塊。<b>剛好 3 面有色</b>的小方塊有幾個？', row: true, options: [{ t: '12 個' }, { ok: true, t: '8 個' }, { t: '6 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拆開、分類上色'); } });
      st.append(P.instr('橘色是塗了色的面。用「<b>拆開</b>」滑桿把小方塊分開、用手指轉動；<b>點一個小方塊</b>看它有幾面有色；再按「<b>分類上色</b>」，同一種位置的小方塊會變成同一個顏色。'));
      S = cubeView(st, { n: 3, gate: function () { return gate.on; }, onTap: function (cid, V) { V.sel1 = cid; V.rebuild(); var p = cubeInfo(3, cid), fl = faceFlags(3, p.i, p.j, p.k, 'all'), cn = fl.filter(Boolean).length; pS.textContent = '你點的小方塊：在大正方體的「' + ['內部', '面上', '邊上', '角'][kind(3, p.i, p.j, p.k)] + '」，有 ' + cn + ' 面有色'; seen.tap = 1; check(); } });
      var sl = P.slider(0, 10, 0, function (v) { if (gate.on) { sl.value = 0; P.toast('先做上面的預測'); return; } S.g = v / 10; S.rebuild(); seen.ex = 1; check(); }, 1); st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '拆開：0 到 10')), sl);
      var bt = btnRow(st, [{ k: 'c', t: '分類上色', c: '#2f6fdc', fn: function (b) { if (gate.on) { P.toast('先做上面的預測'); return; } S.cls = !S.cls; b.textContent = S.cls ? '回到原本的顏色' : '分類上色'; S.rebuild(); legendEl.style.display = S.cls ? '' : 'none'; if (S.cls) { seen.cls = 1; check(); } } }]);
      var legendEl = h('div'); st.append(legendEl); legend(legendEl); legendEl.style.display = 'none'; pS = pill(st, 'is-blue'); pC = pill(st, 'is-green'); var c3 = count(3, 'all'); pC.textContent = '3 面有色 ' + c3[3] + ' 個（角）、2 面 ' + c3[2] + ' 個（邊）、1 面 ' + c3[1] + ' 個（面）、0 面 ' + c3[0] + ' 個（內部）　共 ' + (c3[0] + c3[1] + c3[2] + c3[3]) + ' 個'; pS.textContent = '點一個小方塊看看（可以先拆開）';
      function check() { if (gate.on || done) return; if (seen.tap && seen.ex && seen.cls) { done = true; P.track('aha', { id: 'color-cube', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：8 個'); st.append(P.ruleBox('小方塊<b>按在大正方體的位置</b>分成四類：<b>角</b>（3 面有色）8 個、<b>邊</b>的中間（2 面）、<b>面</b>的中間（1 面）、<b>內部</b>（0 面，被包在裡面）。<br>正方體有 8 個角，所以 3 面有色的小方塊不管切成多小，都是 <b>8</b> 個。', '位置決定幾面有色')); api.unlock('角 3 面、邊 2 面、面 1 面、內部 0 面'); } }
      api.solve(function () { gate.on = false; sl.value = 6; S.g = 0.6; S.rebuild(); seen.ex = 1; S.cls = true; S.rebuild(); legendEl.style.display = ''; seen.cls = 1; S.sel1 = 0; S.rebuild(); seen.tap = 1; check(); }, false, '8 個（大正方體有 8 個角，每個角上的小方塊有 3 面有色）');
      st.append(P.hint('先拆開，找找哪些小方塊有 3 面橘色。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, S, sn, pT, pR, n = 3;
      P.choice(st, api, { id: 'cu-p2', predict: true, label: '先猜猜看', prompt: '大正方體切得越細（n 越大），<b>3 面有色</b>的小方塊個數會怎麼變？', row: true, options: [{ ok: true, t: '一直是 8 個' }, { t: '越來越多' }, { t: '越來越少' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('調整 n'); } });
      st.append(P.instr('調整<b>切成 n×n×n</b>（2 到 6）。「分類上色」看每一類在哪裡；下面的算式是<b>用位置數出來的</b>：邊上每條邊中間有幾塊？每個面中間有幾塊？內部是幾×幾×幾？'));
      S = cubeView(st, { n: 3, gate: function () { return gate.on; } }); S.cls = true; S.rebuild(); legend(st);
      sn = steppr(st, '切成 n×n×n', 2, 6, 3, function (v) { if (gate.on) { sn.set(n, true); P.toast('先做上面的預測'); return; } n = v; S.set(n); upd(); });
      var sl = P.slider(0, 10, 0, function (v) { if (gate.on) { sl.value = 0; return; } S.g = v / 10; S.rebuild(); }, 1); st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '拆開：0 到 10')), sl);
      pT = pill(st, 'is-blue'); pR = pill(st, 'is-green');
      function upd() { var c = count(n, 'all'), m = n - 2; pT.textContent = 'n ＝ ' + n + '：角 ' + c[3] + ' 個（3 面）；邊 12 條 × 中間 ' + m + ' 塊 ＝ ' + c[2] + ' 個（2 面）；面 6 個 × 中間 ' + m + '×' + m + ' ＝ ' + c[1] + ' 個（1 面）；內部 ' + m + '×' + m + '×' + m + ' ＝ ' + c[0] + ' 個（0 面）'; pR.textContent = '全部 ' + n + '³ ＝ ' + n * n * n + ' 個：' + c[3] + ' ＋ ' + c[2] + ' ＋ ' + c[1] + ' ＋ ' + c[0] + ' ＝ ' + (c[0] + c[1] + c[2] + c[3]) + ' ✓'; pR.className = 'pl-pill is-ok';
        if (gate.on) return; seen[n] = 1; if (seen[3] && seen[4] && seen[5] && !done) { done = true; P.track('aha', { id: 'color-cube', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：一直是 8 個'); st.append(P.ruleBox('每條邊的<b>兩端</b>是角，所以邊中間有 <b>n − 2</b> 塊；每個面去掉一圈邊，中間是 <b>(n − 2)×(n − 2)</b>；去掉外面一層，內部是 <b>(n − 2)³</b>。<br>所以 3 面有色 <b>8</b>；2 面有色 <b>12(n − 2)</b>；1 面有色 <b>6(n − 2)²</b>；0 面有色 <b>(n − 2)³</b>。「n − 2」就是「去掉兩端／兩層」，不用背。', '為什麼是 n − 2')); api.unlock('n − 2：去掉兩端'); } }
      upd();
      api.solve(function () { gate.on = false;[4, 5, 3].forEach(function (v) { sn.set(v, true); n = v; S.set(n); upd(); }); }, false, '一直是 8 個（大正方體永遠只有 8 個角）');
      st.append(P.hint('n 調到 4、5，看「邊上」每條邊中間有幾塊。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function pickTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '3×3×3，外面六個面都塗色。<b>點選所有「剛好 3 面有色」的小方塊</b>（可以拆開、轉動）。' })); var fin = false, S, pS = pill(b0, 'is-blue'), target = {};
        S = cubeView(b0, { n: 3, onTap: function (cid, V) { if (V.sel[cid]) delete V.sel[cid]; else V.sel[cid] = 1; V.rebuild(); upd(); } });
        var sl = P.slider(0, 10, 4, function (v) { S.g = v / 10; S.rebuild(); }, 1); S.g = 0.4; S.rebuild(); b0.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '拆開：0 到 10')), sl);
        for (var i = 0; i < 27; i++) { var p = cubeInfo(3, i); if (faceFlags(3, p.i, p.j, p.k, 'all').filter(Boolean).length === 3) target[i] = 1; }
        function upd() { var ids = Object.keys(S.sel), good = ids.filter(function (k) { return target[k]; }).length, bad = ids.length - good; pS.textContent = '已選 ' + ids.length + ' 個（選對 ' + good + '，選錯 ' + bad + '）；要選 ' + Object.keys(target).length + ' 個'; pS.className = 'pl-pill ' + (bad ? 'is-pink' : 'is-blue'); if (good === Object.keys(target).length && !bad && !fin) { fin = true; P.toast('8 個角都選到了'); b0.append(P.ruleBox('3 面有色的小方塊，就是大正方體 8 個角上的那 8 塊。', '找到了')); done(); } }
        setSolve(function () { S.sel = {}; Object.keys(target).forEach(function (k) { S.sel[k] = 1; }); S.rebuild(); upd(); }, '8 個：大正方體 8 個角上的小方塊'); upd(); b0.append(P.hint('大正方體有幾個角？'));
      }
      function nTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '外面六個面都塗色。調整 n，讓「<b>一面都沒有色</b>」（被包在裡面）的小方塊剛好有 <b>27</b> 個。' })); var fin = false, S, p = pill(b0, 'is-green'), sn;
        S = cubeView(b0, { n: 3 }); S.cls = true; S.rebuild();
        function upd(n) { S.set(n); var c = count(n, 'all'); p.textContent = 'n ＝ ' + n + '：0 面有色的 (n − 2)³ ＝ ' + (n - 2) + '³ ＝ ' + c[0] + ' 個'; p.className = 'pl-pill ' + (c[0] === 27 ? 'is-ok' : 'is-green'); if (c[0] === 27 && !fin) { fin = true; P.toast('n ＝ ' + n + '：27 個'); b0.append(P.ruleBox('0 面有色的是去掉外面一層後的內部：(n − 2)³ ＝ 27，n − 2 ＝ 3，n ＝ 5。', '找到了')); done(); } }
        sn = steppr(b0, '切成 n×n×n', 2, 6, 3, upd); upd(3); setSolve(function () { sn.set(5, true); upd(5); }, 'n ＝ 5（內部 3×3×3 ＝ 27 個）'); b0.append(P.hint('內部是去掉外面一層（兩端）後剩下的正方體。'));
      }
      function bottomTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '這次<b>底面不塗色</b>：先按下面的「<b>下面</b>」把底面的顏色擦掉（只塗上面和四個側面）。再調整 n，讓「<b>一面都沒有色</b>」的小方塊剛好有 <b>36</b> 個。' })); var fin = false, S, p = pill(b0, 'is-green'), sn;
        S = cubeView(b0, { n: 3, variant: [1, 1, 1, 1, 1, 1] }); S.cls = true; S.rebuild(); var FN = ['前面', '後面', '左面', '右面', '上面', '下面'], fb = [];
        var frow = h('div'); frow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0'; b0.append(frow);
        FN.forEach(function (nmf, t) { var b = h('button', { type: 'button' }); b.style.cssText = 'min-height:44px;padding:0 12px;border-radius:12px;font-weight:800;cursor:pointer;border:2px solid #d29b1f;background:#fff;color:#122548'; function lab() { b.textContent = nmf + '：' + (S.variant[t] ? '有塗色' : '沒塗'); b.style.background = S.variant[t] ? '#fff3d0' : '#eee'; } b.addEventListener('click', function () { S.variant = S.variant.slice(); S.variant[t] = S.variant[t] ? 0 : 1; lab(); upd(S.n); }); lab(); fb.push(lab); frow.append(b); });
        function upd(n) { S.set(n); var c = count(n, S.variant), pfOk = S.variant.join('') === '111110'; p.textContent = pfOk ? 'n ＝ ' + n + '：0 面有色 ＝ 內部 ' + (n - 2) + '³ ＋ 最下面一層中間 ' + (n - 2) + '² ＝ ' + (n - 2) * (n - 2) * (n - 2) + ' ＋ ' + (n - 2) * (n - 2) + ' ＝ ' + c[0] + ' 個' : 'n ＝ ' + n + '：現在有塗色的面 ' + S.variant.filter(Boolean).length + ' 個，一面都沒有色的小方塊有 ' + c[0] + ' 個（先把「下面」擦掉、其他五面都要有塗色）'; p.className = 'pl-pill ' + (c[0] === 36 && pfOk ? 'is-ok' : 'is-green'); if (c[0] === 36 && pfOk && !fin) { fin = true; P.toast('n ＝ ' + n + '：36 個'); b0.append(P.ruleBox('底面不塗，最下面一層的小方塊，只要不在側面，就也沒有顏色：多了 (n − 2)² 塊。n ＝ 5：3³ ＋ 3² ＝ 27 ＋ 9 ＝ 36。公式要看「哪些面有塗」，不能死背。', '找到了')); done(); } }
        sn = steppr(b0, '切成 n×n×n', 2, 6, 3, upd); upd(3); setSolve(function () { sn.set(5, true); upd(5); }, 'n ＝ 5（內部 27 ＋ 最下面一層中間 9 ＝ 36）'); b0.append(P.hint('底面沒塗，最下面一層有哪些小方塊也沒有顏色？'));
      }
      P.taskSeq(box, api, [pickTask, nTask, bottomTask], { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'color-cube' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'color-cube', moduleName: '塗色（四）：立體切開塗色', askAbout: '立體塗色後切開，幾面有色',
        aha: '小方塊按<b>位置</b>分類：<b>角 3 面（永遠 8 個）</b>、邊 2 面 12(n−2)、面 1 面 6(n−2)²、內部 0 面 (n−2)³；「<b>n − 2</b>」是去掉兩端；底面不塗，答案就不一樣。',
        cards: [{ text: '大正方體塗色後切成 n³ 個小方塊：3 面 8、2 面 12(n−2)、1 面 6(n−2)²、0 面 (n−2)³', src: '小學到國中：立體塗色' }, { text: '先看哪些面有塗，再按位置（角、邊、面、內部）分類計數', src: '立體塗色的分類' }],
        depth: { here: 0.25, cheetah: [{ at: 0.55, label: '長方體的塗色切塊<br>分層計數' }, { at: 0.85, label: '容斥與對稱' }] },
        teasers: [{ title: '長方體切塊', q: 'a×b×c 的長方體塗色後切開，各類小方塊的個數怎麼算？', where: '進階（尚未對照班級堂次）', lv: 'L2' }],
        parent: { pitfall: '孩子常把 n−2 背成 n−1 或 n；不知道有些面沒塗時公式要改；數內部小方塊時算成 (n−1)³。', place: '立體塗色是小學高年級到國中常見的分類計數題。', ask: ['3×3×3 塗色後，3 面有色的有幾個？為什麼永遠是 8 個？', '為什麼「邊上」每條邊要算 n − 2 塊？', '底面不塗，沒有顏色的小方塊會多幾個？'] },
        classes: [], next: { href: 'play-color-symmetry.html', text: '下一個：塗色（五），對稱與等價' } });
    }];
  new P.Lesson({ id: 'color-cube', title: '塗色（四）：立體切開塗色', steps: steps });
})();
