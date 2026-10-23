/* 獵豹玩中學｜圓的方程（二）：一般式與配方
   預測＋調 D、E、F 三個滑桿看一般式變成標準式（F 增大圓縮小成一點再消失）→ 預測 x²＋y²＋2x＋2y＋5＝0 是不是圓 → 3 個操作關卡。
   要擊中的迷思：一般式沒先檢查 D²＋E²−4F＞0；圓心符號反、半徑忘了除以 2。 */
(function () {
  var P = Play, h = P.h, PV = window.PV, f = PV.f, fr = PV.fr;
  var CA = '#2f6fdc', CT = '#d29b1f', CB = '#d6336c';
  function sqx(v, D) { return D === 0 ? v + '²' : '(' + v + (D > 0 ? ' ＋ ' : ' − ') + fr(Math.abs(D), 2) + ')²'; }
  function genStr(D, E, F) {
    var s = 'x² ＋ y²'; if (D !== 0) s += (D > 0 ? ' ＋ ' : ' − ') + (Math.abs(D) === 1 ? '' : Math.abs(D)) + 'x'; if (E !== 0) s += (E > 0 ? ' ＋ ' : ' − ') + (Math.abs(E) === 1 ? '' : Math.abs(E)) + 'y'; if (F !== 0) s += (F > 0 ? ' ＋ ' : ' − ') + Math.abs(F); return s + ' ＝ 0';
  }
  function rStr(N) {   /* √N / 2 化到最簡 */
    var k = 1, m = N, q; for (q = Math.floor(Math.sqrt(N)); q >= 2; q--) if (N % (q * q) === 0) { k = q; m = N / (q * q); break; }
    if (m === 1) return fr(k, 2); var root = '√' + m; if (k % 2 === 0) return (k / 2 === 1 ? '' : k / 2) + root; return (k === 1 ? '' : k) + root + ' / 2';
  }

  /* 圓＋三個滑桿。o: D、E、F（初值）、ranges、onChange(D, E, F, N)、onSettle(D, E, F, N)、gate */
  function scene(host, o) {
    var pl = PV.plane(host), b = pl.b, V = { D: o.D, E: o.E, F: o.F }, S = {}, circ = PV.circ(pl, CA, { w: 5 }), dot = b.dot([0, 0], 'pl-dot pl-dot--amber', pl.gC, 0.22);
    var pG = P.pill('', 'is-blue'), pSq = P.pill('', 'is-green'), pN = P.pill('', 'is-amber'), pR = P.pill('', 'is-pink'); [pG, pSq, pN, pR].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    var rows = [], sliders = {};
    [['D', -6, 6], ['E', -6, 6], ['F', -8, 12]].forEach(function (k) {
      var nm = k[0], sl = P.slider(k[1], k[2], V[nm], function (v) { V[nm] = v; upd(); }, 1); sliders[nm] = sl; sl.addEventListener('change', function () { if (o.onSettle) o.onSettle(V.D, V.E, V.F, N()); });
      rows.push(h('div', { class: 'pl-slider-lab' }, h('span', {}, nm + '：' + k[1] + ' 到 ' + k[2])), sl);
    });
    host.append.apply(host, rows); host.append(h('div', { class: 'pl-readout' }, pG), h('div', { class: 'pl-readout' }, pSq), h('div', { class: 'pl-readout' }, pN), h('div', { class: 'pl-readout' }, pR));
    function N() { return V.D * V.D + V.E * V.E - 4 * V.F; }
    function upd() {
      var n = N(), c = [-V.D / 2, -V.E / 2];
      pG.textContent = genStr(V.D, V.E, V.F);
      pSq.textContent = sqx('x', V.D) + ' ＋ ' + sqx('y', V.E) + ' ＝ ' + fr(n, 4) + '　（配方：右邊 ＝ (D² ＋ E² − 4F) / 4）';
      pN.textContent = 'D² ＋ E² − 4F ＝ ' + V.D * V.D + ' ＋ ' + V.E * V.E + ' − (' + 4 * V.F + ') ＝ ' + n + (n > 0 ? '（＞ 0）' : n === 0 ? '（剛好是 0）' : '（＜ 0）');
      if (n > 0) { circ.hide(false).set(c, Math.sqrt(n) / 2); dot.style.display = ''; pR.textContent = '是圓：圓心 (' + fr(-V.D, 2) + ', ' + fr(-V.E, 2) + ')，半徑 ' + rStr(n); pR.className = 'pl-pill is-green'; }
      else if (n === 0) { circ.hide(true); dot.style.display = ''; pR.textContent = '縮成一個點：只有 (' + fr(-V.D, 2) + ', ' + fr(-V.E, 2) + ') 滿足，半徑 ＝ 0'; pR.className = 'pl-pill is-amber'; }
      else { circ.hide(true); dot.style.display = 'none'; pR.textContent = '右邊是負數，沒有任何點滿足：不是圓'; pR.className = 'pl-pill is-pink'; }
      dot.setAttribute('cx', pl.X(c[0])); dot.setAttribute('cy', b.Y(pl.Y(c[1])));
      if (o.onChange) o.onChange(V.D, V.E, V.F, n);
    }
    S.set = function (D, E, F) { V.D = D; V.E = E; V.F = F; sliders.D.value = D; sliders.E.value = E; sliders.F.value = F; upd(); }; S.V = V; S.N = N; S.sliders = sliders; S.pl = pl;
    upd(); return S;
  }

  var steps = [
    /* 1. F 增大 */
    function (st, api) {
      var seen = {}, done = false, sc, gate = true;
      P.choice(st, api, { id: 'cg-p1', predict: true, label: '先猜猜看', prompt: '圓 <b>x² ＋ y² − 4x ＋ 2y ＋ F ＝ 0</b>，把 <b>F 越調越大</b>，圓會怎麼變？', row: true, options: [{ ok: true, t: '越縮越小，最後消失' }, { t: '越來越大' }, { t: '大小不變，只是移動' }], onAnswer: function (i) { api.ctx.p1 = i; gate = false; api.lock('調 F、D、E 三個滑桿'); } });
      st.append(P.instr('調整滑桿 <b>D、E、F</b>，看一般式怎麼<b>配方</b>成標準式。重點是 <b>F</b>：把 F 從小調到大，看圓怎麼變。'));
      var host = h('div'); st.append(host);
      sc = scene(host, { D: -4, E: 2, F: -4, onChange: function (D, E, F, n) {
        if (gate) return; if (n > 0) seen.c = 1; if (n === 0) seen.p = 1; if (n < 0) seen.n = 1;
        if (seen.c && seen.p && seen.n && !done) {
          done = true; P.track('aha', { id: 'circle-gen', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：F 變大，圓縮小直到消失');
          st.append(P.ruleBox('配方：x² ＋ y² ＋ Dx ＋ Ey ＋ F ＝ 0 ⇒ <b>(x ＋ D/2)² ＋ (y ＋ E/2)² ＝ (D² ＋ E² − 4F)/4</b>。<br>圓心 <b>(−D/2, −E/2)</b>，半徑 <b>√(D² ＋ E² − 4F) / 2</b>。<br>右邊 ＞ 0 才是圓；＝ 0 縮成一點；＜ 0 什麼都沒有。所以一般式一定要先檢查 <b>D² ＋ E² − 4F ＞ 0</b>。', '一般式與配方'));
          api.unlock('先檢查 D² ＋ E² − 4F ＞ 0');
        }
      } });
      api.solve(function () { gate = false; sc.set(-4, 2, -4); sc.set(-4, 2, 2); sc.set(-4, 2, 5); sc.set(-4, 2, 8); }, false, 'F 越大，圓越小：F ＝ 5 縮成一點（D² ＋ E² − 4F ＝ 0），F ＞ 5 就消失');
      st.append(P.hint('F 慢慢往右拉，注意「D² ＋ E² − 4F」那一列。')); api.lock('先做上面的預測');
    },
    /* 2. 是不是圓 */
    function (st, api) {
      var seen = {}, done = false, sc, gate = true;
      P.choice(st, api, { id: 'cg-p2', predict: true, label: '先猜猜看', prompt: '<b>x² ＋ y² ＋ 2x ＋ 2y ＋ 5 ＝ 0</b> 是一個圓嗎？', row: true, options: [{ ok: true, t: '不是，沒有任何點滿足' }, { t: '是，圓心 (−1, −1)' }, { t: '是，半徑 √5' }], onAnswer: function (i) { api.ctx.p2 = i; gate = false; api.lock('把 D、E、F 調成 2、2、5'); } });
      st.append(P.instr('把滑桿調成 <b>D ＝ 2、E ＝ 2、F ＝ 5</b>，驗證你的預測。再把 <b>F 往小調</b>，看它什麼時候才變成圓。'));
      var host = h('div'); st.append(host);
      sc = scene(host, { D: 0, E: 0, F: -4, onChange: function (D, E, F, n) {
        if (gate) return; if (D === 2 && E === 2 && F === 5) seen.t = 1; if (seen.t && D === 2 && E === 2 && n > 0) seen.c = 1;
        if (seen.t && seen.c && !done) {
          done = true; P.track('aha', { id: 'circle-gen', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：D² ＋ E² − 4F ＜ 0，不是圓');
          st.append(P.ruleBox('D ＝ 2、E ＝ 2、F ＝ 5：D² ＋ E² − 4F ＝ 4 ＋ 4 − 20 ＝ <b>−12 ＜ 0</b>，所以<b>不是圓</b>。看起來像圓的方程式，不一定是圓。<br>把 F 調小到 1（4 ＋ 4 − 4 ＝ 4 ＞ 0）才變成圓：圓心 (−1, −1)，半徑 1。', '先檢查再用'));
          api.unlock('先算 D² ＋ E² − 4F');
        }
      } });
      api.solve(function () { gate = false; sc.set(2, 2, 5); sc.set(2, 2, 1); }, false, '不是圓：D² ＋ E² − 4F ＝ 4 ＋ 4 − 20 ＝ −12 ＜ 0');
      st.append(P.hint('先調到 2、2、5，看看「右邊」是多少。')); api.lock('先做上面的預測');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { D: cfg.d0[0], E: cfg.d0[1], F: cfg.d0[2], onSettle: function (D, E, F, n) {
            if (cfg.ok(D, E, F, n) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '調出來了')); done(); } } });
          setSolve(function () { sc.set(cfg.ans[0], cfg.ans[1], cfg.ans[2]); if (!fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '調出來了')); done(); } }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '調出<b>圓心 (2, −1)、半徑 3</b> 的圓。', d0: [0, 0, -4], ok: function (D, E, F) { return D === -4 && E === 2 && F === -4; }, ans: [-4, 2, -4], answer: 'D ＝ −4、E ＝ 2、F ＝ −4（圓心 (−D/2, −E/2) ＝ (2, −1)，r² ＝ (16 ＋ 4 ＋ 16)/4 ＝ 9）', msg: 'D ＝ −4、E ＝ 2、F ＝ −4', rule: '圓心 (−D/2, −E/2) ＝ (2, −1) → D ＝ −4、E ＝ 2。半徑 3：(D² ＋ E² − 4F)/4 ＝ 9 → 20 − 4F ＝ 36 → F ＝ −4。', hint: '圓心的 x 座標是 −D/2，所以 D 是圓心 x 座標的負兩倍。再用右邊 ＝ 9 算 F。' }),
        task({ prompt: '圓心在 <b>(1, 2)</b>，把圓<b>剛好縮成一個點</b>（半徑 ＝ 0）。', d0: [0, 0, 0], ok: function (D, E, F, n) { return D === -2 && E === -4 && n === 0; }, ans: [-2, -4, 5], answer: 'D ＝ −2、E ＝ −4、F ＝ 5（圓心 (1, 2)，D² ＋ E² − 4F ＝ 4 ＋ 16 − 20 ＝ 0）', msg: '圓縮成一個點 (1, 2)', rule: '圓心 (1, 2) → D ＝ −2、E ＝ −4。縮成一點：D² ＋ E² − 4F ＝ 0 → 20 − 4F ＝ 0 → F ＝ 5。', hint: '先調 D、E 讓圓心對，再慢慢調 F 到「D² ＋ E² − 4F」剛好是 0。' }),
        task({ prompt: '調出<b>圓心 (−2, 1)</b>、而且<b>通過原點</b>的圓。', d0: [0, 0, -4], ok: function (D, E, F, n) { return D === 4 && E === -2 && F === 0 && n > 0; }, ans: [4, -2, 0], answer: 'D ＝ 4、E ＝ −2、F ＝ 0（原點代入得 F ＝ 0；半徑 √20 / 2 ＝ √5）', msg: 'D ＝ 4、E ＝ −2、F ＝ 0', rule: '通過原點：(0, 0) 代入 x² ＋ y² ＋ Dx ＋ Ey ＋ F ＝ 0 得 <b>F ＝ 0</b>。圓心 (−2, 1) → D ＝ 4、E ＝ −2。半徑是 √(16 ＋ 4)/2 ＝ √5。', hint: '原點在圓上，把 (0, 0) 代進一般式看看，F 會是多少？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-gen' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'circle-gen', moduleName: '圓的方程（二）：一般式與配方', askAbout: '圓的一般式與配方',
        aha: '一般式要<b>配方</b>成標準式：圓心 <b>(−D/2, −E/2)</b>、半徑 <b>√(D² ＋ E² − 4F)/2</b>；<b>先檢查 D² ＋ E² − 4F ＞ 0</b>，不然不是圓。',
        cards: [{ text: 'x² ＋ y² ＋ Dx ＋ Ey ＋ F ＝ 0 是圓 ⇔ D² ＋ E² − 4F ＞ 0', src: '高中：圓的一般式' }, { text: '圓心 (−D/2, −E/2)，半徑 √(D² ＋ E² − 4F)/2；D² ＋ E² − 4F ＝ 0 是一個點，＜ 0 沒有圖形', src: '配方法' }],
        depth: { here: 0.3, cheetah: [{ at: 0.5, label: '三點定圓<br>圓系方程式' }, { at: 0.85, label: '軌跡問題' }] },
        teasers: [{ title: '三點定圓', q: '把三個點的座標代入一般式，得到 D、E、F 的聯立方程式。為什麼三點不能共線？', where: 'S101 2507「CH2 直線與圓」系列', lv: 'L2' }],
        parent: { pitfall: '孩子常忘了檢查 D² ＋ E² − 4F ＞ 0；配方後圓心的符號寫反；半徑忘了除以 2。', place: '圓與直線、圓與圓的基礎。', ask: ['x² ＋ y² − 4x ＋ 6y ＋ 4 ＝ 0 的圓心和半徑是多少？', 'x² ＋ y² ＋ 2x ＋ 2y ＋ 5 ＝ 0 是圓嗎？為什麼？', '圓通過原點時，一般式的 F 是多少？'] },
        classes: ['S101（2025 年 9 月，第 13 堂）：CH2 直線與圓 05'], next: { href: 'play-circle-line.html', text: '下一個：圓與直線的關係' } });
    }];
  new P.Lesson({ id: 'circle-gen', title: '圓的方程（二）：一般式與配方', steps: steps });
})();
