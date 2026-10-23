/* 獵豹玩中學｜二次函數（一）：開口方向與大小
   預測＋拉 a 滑桿看 y＝ax² → 拖動點 P(1, a)：a 就是 x＝1 時的高度 → 3 個操作關卡（對準虛線 a＝2、a＝−0.5、開口向下且比虛線更胖）。
   要擊中的迷思：以為 a 越大開口越大（其實 |a| 越大越瘦）、不知道 a 的正負決定開口方向、a＝0 時不是二次函數。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  function aStr(a) { return a === 1 ? '' : a === -1 ? '−' : f(a); }
  function eq(a) { return a === 0 ? 'y ＝ 0' : 'y ＝ ' + aStr(a) + 'x²'; }
  function plane(host, sm) { return PF.plane(host, { x0: -4, x1: 4, y0: -8, y1: 8, hh: 9, tx: 1, ty: 4, sm: sm, skipX: [1] }); }
  /* 這一頁用的曲線：y＝a x² */
  function setCurve(c, a) { c.set(function (x) { return a * x * x; }); }

  var steps = [
    /* 1. 預測＋滑桿 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, a = 1;
      P.choice(st, api, { id: 'qo-p1', predict: true, label: '先猜猜看', prompt: '拋物線 <b>y ＝ −2x²</b> 的開口朝哪裡？', row: true, options: [{ t: '朝上' }, { t: '朝下' }, { t: '看不出來' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉動 a，看開口和胖瘦'); } });
      st.append(P.instr('拉動滑桿改變 <b>a</b>，看 <b>y ＝ ax²</b> 的開口怎麼變。虛線是 y ＝ x²（a ＝ 1），粉紅虛線是 a 的相反數。'));
      var pl = plane(st), ref = pl.curve('pl-line pl-line--soft'), mir = pl.curve('pl-line pl-line--pink pl-line--dash'), cur = pl.curve('pl-line pl-line--blue');
      ref.set(function (x) { return x * x; });
      var pA = P.pill('', 'is-blue'), pD = P.pill('', 'is-green'), pW = P.pill('', 'is-amber'); st.append(h('div', { class: 'pl-readout' }, pA, pD, pW));
      function upd() {
        setCurve(cur, a); a === 0 ? mir.clear() : setCurve(mir, -a);
        pA.textContent = 'a ＝ ' + f(a) + '：' + eq(a); pD.textContent = a > 0 ? 'a ＞ 0：開口向上' : a < 0 ? 'a ＜ 0：開口向下' : 'a ＝ 0：不是拋物線'; pD.className = 'pl-pill ' + (a > 0 ? 'is-green' : a < 0 ? 'is-pink' : 'is-amber');
        pW.textContent = a === 0 ? '要 a ≠ 0 才是二次函數' : Math.abs(a) > 1 ? '|a| ＝ ' + f(Math.abs(a)) + '：比 y＝x² 更瘦' : Math.abs(a) < 1 ? '|a| ＝ ' + f(Math.abs(a)) + '：比 y＝x² 更胖' : '|a| ＝ 1：和 y＝x² 一樣';
        if (gate.on) return; if (a > 0) seen.pos = 1; if (a < 0) seen.neg = 1; if (Math.abs(a) > 1) seen.thin = 1; if (a !== 0 && Math.abs(a) < 1) seen.fat = 1;
        if (seen.pos && seen.neg && seen.thin && seen.fat && !done) {
          done = true; P.track('aha', { id: 'quad-open', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：a ＜ 0 開口向下');
          st.append(P.ruleBox('<b>a 的正負</b>決定開口方向：a ＞ 0 向上、a ＜ 0 向下。<br><b>|a| 的大小</b>決定胖瘦：|a| 越大越<b>瘦</b>（開口越小），|a| 越小越<b>胖</b>。<br>a 和 −a 的圖形一模一樣，只是上下翻過來。', 'a 管什麼'));
          api.unlock('a 管方向和胖瘦');
        }
      }
      var sl = P.slider(-30, 30, 10, function (v) { if (gate.on) { P.toast('先做上面的預測'); sl.value = 10; return; } a = v / 10; upd(); }, 5);
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← a ＝ −3'), h('span', {}, 'a ＝ 3 →')));
      api.solve(function () { gate.on = false;[20, -20, 5, -5].forEach(function (v) { sl.value = v; a = v / 10; upd(); }); });
      upd(); st.append(P.hint('把 a 拉成正的、負的、大的、小的，每種都看看。')); api.lock('先做上面的預測');
    },
    /* 2. 拖動點 P(1, a) */
    function (st, api) {
      var seen = {}, done = false, a = 1, pl = plane(st), b = pl.b, cur = pl.curve('pl-line pl-line--blue'), drop = b.line([pl.X(1), pl.Y(0)], [pl.X(1), pl.Y(1)], 'pl-line pl-line--soft', pl.gA);
      st.insertBefore(P.instr('拖動點 <b>P</b>：它的位置是 <b>(1, a)</b>。拋物線 <b>y ＝ ax²</b> 會跟著 P 動，看看 P 的高度和 a 有什麼關係。'), st.firstChild);
      var tP = b.text([pl.X(1) + 0.7, pl.Y(1)], 'P', 'pl-text pl-text--pink', pl.gA);
      var pA = P.pill('', 'is-blue'), pH = P.pill('', 'is-amber'); st.append(h('div', { class: 'pl-readout' }, pA, pH));
      var cands = []; for (var y = -4; y <= 4 + 1e-9; y += 0.5) cands.push([pl.X(1), pl.Y(y)]);
      function upd() {
        setCurve(cur, a); b.setLine(drop, [pl.X(1), pl.Y(0)], [pl.X(1), pl.Y(a)]); b.setText(tP, [pl.X(1) + 0.7, pl.Y(a)], 'P');
        pA.textContent = 'P ＝ (1, ' + f(a) + ')：' + eq(a); pH.textContent = 'x ＝ 1 時，y ＝ a ＝ ' + f(a);
        if (a > 0) seen.pos = 1; if (a < 0) seen.neg = 1; if (Math.abs(a) >= 3) seen.big = 1; if (a !== 0 && Math.abs(a) <= 0.5) seen.small = 1;
        if (seen.pos && seen.neg && seen.big && seen.small && !done) {
          done = true; P.track('aha', { id: 'quad-open', step: 2 });
          st.append(P.ruleBox('x ＝ 1 時 y ＝ a × 1² ＝ <b>a</b>，所以 <b>a 就是 P 的高度</b>。<br>P 在 x 軸上方（a ＞ 0）開口向上，在下方開口向下；P 離 x 軸越遠（|a| 越大），拋物線越<b>瘦</b>。', 'P 的高度 ＝ a'));
          api.unlock('a 就是 x ＝ 1 時的高度');
        }
      }
      var hd = b.handle({ pos: [pl.X(1), pl.Y(a)], candidates: cands, onMove: function (t) { a = Math.round(pl.Yi(t[1]) * 2) / 2; upd(); } });
      upd();
      api.solve(function () { hd.moveTo([pl.X(1), pl.Y(3)]); hd.moveTo([pl.X(1), pl.Y(-3.5)]); hd.moveTo([pl.X(1), pl.Y(0.5)]); });
      st.append(P.hint('把 P 拉得高高的、低低的、靠近 x 軸，看拋物線怎麼變。')); api.lock('把 P 拖到各種高度');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, target（虛線的 a，可空）, ok(a)（過關條件）, answer（看詳解用）, msg, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var pl = plane(b0, true), b = pl.b, a = 1, fin = false, cur = pl.curve('pl-line pl-line--blue'), tg = pl.curve('pl-line pl-line--amber pl-line--dash');
          if (cfg.target !== undefined) tg.set(function (x) { return cfg.target * x * x; });
          var drop = b.line([pl.X(1), pl.Y(0)], [pl.X(1), pl.Y(1)], 'pl-line pl-line--soft', pl.gA), tP = b.text([pl.X(1) + 0.7, pl.Y(1)], 'P', 'pl-text pl-text--pink', pl.gA);
          var pA = P.pill('', 'is-blue'); b0.append(h('div', { class: 'pl-readout' }, pA));
          var cands = []; for (var y = -4; y <= 4 + 1e-9; y += 0.5) cands.push([pl.X(1), pl.Y(y)]);
          function upd() {
            setCurve(cur, a); b.setLine(drop, [pl.X(1), pl.Y(0)], [pl.X(1), pl.Y(a)]); b.setText(tP, [pl.X(1) + 0.7, pl.Y(a)], 'P');
            var ok = cfg.ok(a); pA.textContent = 'a ＝ ' + f(a) + '：' + eq(a); pA.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-blue');
          }
          /* 放開手才算數（拖動途中經過正確位置不算） */
          function settle() { if (cfg.ok(a) && !fin) { fin = true; b.goalMark([pl.X(1), pl.Y(a)]); P.toast(cfg.msg); done(); } }
          var hd = b.handle({ pos: [pl.X(1), pl.Y(a)], candidates: cands, onMove: function (t) { a = Math.round(pl.Yi(t[1]) * 2) / 2; upd(); }, onEnd: function (t) { a = Math.round(pl.Yi(t[1]) * 2) / 2; upd(); settle(); } });
          setSolve(function () { hd.moveTo([pl.X(1), pl.Y(cfg.answer)]); }); upd(); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '拖動 <b>P</b>，讓拋物線剛好蓋住橘色虛線。', target: 2, ok: function (a) { return a === 2; }, answer: 2, msg: '剛好重合：a ＝ 2', hint: '橘色虛線在 x ＝ 1 的高度是多少？' }),
        task({ prompt: '這次橘色虛線開口向下。拖動 <b>P</b>，讓拋物線剛好蓋住它。', target: -0.5, ok: function (a) { return a === -0.5; }, answer: -0.5, msg: '剛好重合：a ＝ −0.5', hint: '開口向下，又比較胖。' }),
        task({ prompt: '橘色虛線是 y ＝ 2x²。拖動 <b>P</b>，讓拋物線<b>開口向下</b>，而且比虛線<b>更胖</b>。', target: 2, ok: function (a) { return a < 0 && a > -2; }, answer: -1, msg: '開口向下、|a| 比 2 小：更胖', hint: '向下要看 a 的正負；更胖要看 |a| 和 2 比大小。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'quad-open' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'quad-open', moduleName: '二次函數：開口方向與大小', askAbout: '二次函數圖形', aha: '<b>a 的正負</b>決定開口方向，<b>|a| 的大小</b>決定胖瘦：|a| 越大越瘦。<br>a 就是 x ＝ 1 時的高度。',
        cards: [{ text: 'y ＝ ax²：a ＞ 0 開口向上、a ＜ 0 開口向下；|a| 越大開口越小（越瘦）', src: '國中到高中：二次函數圖形' }, { text: 'a 與 −a 的拋物線，以 x 軸為對稱互相翻轉；a ＝ 0 就不是二次函數', src: '二次函數的定義' }],
        depth: { here: 0.15, cheetah: [{ at: 0.4, label: '頂點與極值<br>配方法' }, { at: 0.8, label: '二次函數的係數<br>判別式與圖形' }] },
        teasers: [{ title: 'a、b、c 與圖形', q: '從拋物線的開口、對稱軸位置、y 截距，能判斷 a、b、c 的正負嗎？', where: 'J91A 2507 第 14、15 堂：二次函數；J91S 2607 第 1、2 堂：CH12 二次函數', lv: 'L2' }, { title: '三點決定拋物線', q: '給三個點，怎麼找出 a、b、c？拋物線的形狀為什麼只看 a？', where: 'S101 2507 第 21 堂：多項式函數', lv: 'L3' }],
        parent: { pitfall: '孩子常以為 a 越大拋物線開口越大；其實 |a| 越大越瘦。也常把「開口方向」和「頂點在上在下」混在一起，或忘了 a 不能是 0。', place: '國中三年級二次函數的第一步，高中會延伸到頂點、極值、判別式。', ask: ['y ＝ 3x² 和 y ＝ x² 哪一個比較瘦？為什麼？', 'y ＝ −x² 和 y ＝ x² 的圖形有什麼關係？', 'x ＝ 1 時 y 是多少？它和 a 有什麼關係？'] },
        classes: ['J91A（2507 第 14、15 堂）：二次函數，含開口與頂點', 'J91S（2607 第 1、2 堂）：CH12 二次函數', 'S101（2507 第 21 堂）：多項式函數，含開口與頂點'], next: { href: 'play-quad-vertex.html', text: '下一個：頂點與極值' } });
    }];
  new P.Lesson({ id: 'quad-open', title: '二次函數：開口方向與大小', steps: steps });
})();
