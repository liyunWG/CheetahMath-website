/* 獵豹玩中學｜三角函數（範圍）：單位圓上，sin、cos 只在 −1 到 1，tan 可以無限大
   預測＋拖 P 繞單位圓，看座標的影子 → 加上 x＝1 的切線看 tan → 倒數 sec ＝ 1/cos → 3 個操作關卡（sin θ＝0.5、cos θ 最小、tan θ＝1）。
   要擊中的迷思：以為 tan 也在 −1 到 1 之間、不知道為什麼 sin cos 不會超過 1、sec／csc 取不到 (−1, 1)。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, f2 = function (v) { v = Math.round(v * 100) / 100; return (v < 0 ? '−' : '') + Math.abs(v); };
  var CX = 4.3, CY = 5.0, R = 2.7, TX = CX + R, SX = 10.2, BY = 1.15, LIM = 3.0;
  var ANG = []; for (var a = 0; a < 360; a += 15) ANG.push(a);
  function rad(d) { return d * Math.PI / 180; }
  function close(a, b) { return Math.abs(a - b) < 1e-9; }
  function ptOf(d) { return [CX + R * Math.cos(rad(d)), CY + R * Math.sin(rad(d))]; }
  function angOf(t) { var d = Math.round(Math.atan2(t[1] - CY, t[0] - CX) * 180 / Math.PI); return ((d % 360) + 360) % 360; }

  /* 畫面。o: mode（'sc'＝只看 sin cos；'tan'＝加切線；'sec'＝再加 sec）、start、gate、sm、onChange(d)、onSettle(d) */
  function scene(host, o) {
    var b = PA.board(host, 12, 9, o.sm ? 'pl-svg--sm' : ''), d = o.start === undefined ? 30 : o.start, S = {};
    b.circle([CX, CY], R, 'pl-circle pl-circle--unit');
    b.line([CX - R - 0.5, CY], [CX + R + 0.5, CY], 'pg-axis'); b.line([CX, CY - R - 0.5], [CX, CY + R + 0.5], 'pg-axis');
    /* cos 的影子在下面那條數線，sin 的影子在右邊那條 */
    b.line([CX - R, BY], [CX + R, BY], 'pl-line pl-line--thin'); b.line([SX, CY - R], [SX, CY + R], 'pl-line pl-line--thin');
    [-1, 0, 1].forEach(function (k) {
      b.line([CX + R * k, BY - 0.12], [CX + R * k, BY + 0.12], 'pl-line pl-line--thin'); b.text([CX + R * k, BY - 0.62], f2(k), 'pl-text pl-text--sm');
      b.line([SX - 0.12, CY + R * k], [SX + 0.12, CY + R * k], 'pl-line pl-line--thin'); b.text([SX + 0.6, CY + R * k - 0.15], f2(k), 'pl-text pl-text--sm');
    });
    b.text([CX + R + 1.9, BY - 0.1], 'cos θ', 'pl-text pl-text--sm pl-text--green'); b.text([SX, CY + R + 0.75], 'sin θ', 'pl-text pl-text--sm pl-text--pink');
    var tanOn = o.mode !== 'sc';
    var tl = b.line([TX, 0.7], [TX, 8.3], 'pl-line pl-line--soft'); tl.style.display = tanOn ? '' : 'none';
    var tlab = b.text([TX + 1.1, 8.55], 'x ＝ 1', 'pl-text pl-text--sm pl-text--amber'); tlab.style.display = tanOn ? '' : 'none';
    var gArc = h('g'); b.gMid.append(gArc);
    var ray = b.line([CX, CY], [CX, CY], 'pl-line pl-line--amber'), tdot = b.dot([TX, CY], 'pl-dot pl-dot--amber', null, 0.2), tT = b.text([TX + 0.7, CY], 'T', 'pl-text pl-text--amber'), tArrow = b.text([TX + 0.1, 0], '', 'pl-text pl-text--amber');
    var dropC = b.line([0, 0], [0, 0], 'pl-line pl-line--soft'), dropS = b.line([0, 0], [0, 0], 'pl-line pl-line--soft'), oP = b.line([CX, CY], [CX, CY], 'pl-line pl-line--blue pl-line--bold');
    var dC = b.dot([0, 0], 'pl-dot pl-dot--green', null, 0.2), dS = b.dot([0, 0], 'pl-dot pl-dot--pink', null, 0.2);
    var tP = b.text([0, 0], 'P', 'pl-text pl-text--blue');
    var pA = P.pill('', 'is-blue'), pC = P.pill('', 'is-green'), pS = P.pill('', 'is-pink'), pT = P.pill('', 'is-amber'), pSec = P.pill('', 'is-amber');
    host.append(h('div', { class: 'pl-readout' }, pA, pC, pS)); if (tanOn) host.append(h('div', { class: 'pl-readout' }, pT)); if (o.mode === 'sec') host.append(h('div', { class: 'pl-readout' }, pSec));
    function upd() {
      var c = Math.cos(rad(d)), s = Math.sin(rad(d)), p = ptOf(d);
      b.setLine(oP, [CX, CY], p); b.setLine(dropC, p, [p[0], BY]); b.setLine(dropS, p, [SX, p[1]]); dC.setAttribute('cx', p[0]); dC.setAttribute('cy', b.Y(BY)); dS.setAttribute('cx', SX); dS.setAttribute('cy', b.Y(p[1]));
      b.setText(tP, [p[0] - 1.05 * s, p[1] + 1.05 * c - 0.15], 'P');
      /* 角度：90° 畫直角符號，其他畫圓弧，旁邊標度數 */
      gArc.innerHTML = '';
      if (d !== 0) {
        if (d === 90) gArc.append(h('polyline', { points: b.pts([[CX + 0.5, CY], [CX + 0.5, CY + 0.5], [CX, CY + 0.5]]), class: 'pl-right' }));
        else { var r = 0.75, ex = CX + r * c, ey = CY + r * s; gArc.append(h('path', { d: 'M ' + (CX + r) + ' ' + b.Y(CY) + ' A ' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 0 ' + ex + ' ' + b.Y(ey), fill: 'none', stroke: '#d29b1f', 'stroke-width': 0.08 })); }
        var ma = rad(d / 2); gArc.append(b.text([CX + 1.25 * Math.cos(ma), CY + 1.25 * Math.sin(ma) - 0.15], d + '°', 'pl-text pl-text--sm pl-text--amber', gArc));
      }
      pA.textContent = 'θ ＝ ' + d + '°'; pC.textContent = 'cos θ ＝ ' + f2(c); pS.textContent = 'sin θ ＝ ' + f2(s);
      if (tanOn) {
        var und = close(c, 0) || Math.abs(c) < 1e-9; tdot.style.display = tT.style.display = tArrow.style.display = 'none';
        if (und) { pT.textContent = 'tan θ ＝ 不存在（射線和 x＝1 平行，永遠碰不到）'; pT.className = 'pl-pill is-pink'; b.setLine(ray, [CX, CY], [CX, s > 0 ? CY + LIM + 0.6 : CY - LIM - 0.6]); tArrow.style.display = ''; b.setText(tArrow, [CX + 0.6, s > 0 ? CY + LIM + 0.55 : CY - LIM - 0.75], s > 0 ? '↑' : '↓'); }
        else {
          var tn = s / c, ty = CY + R * tn;
          if (Math.abs(R * tn) <= LIM) { b.setLine(ray, [CX - (c < 0 ? 0 : 0), CY], [TX, ty]); tdot.style.display = tT.style.display = ''; tdot.setAttribute('cx', TX); tdot.setAttribute('cy', b.Y(ty)); b.setText(tT, [TX + 0.7, ty], 'T'); }
          else { var yb = CY + (tn > 0 ? LIM : -LIM), xb = CX + (yb - CY) / tn; b.setLine(ray, [CX, CY], [xb, yb]); tArrow.style.display = ''; b.setText(tArrow, [xb + 0.15, yb + (tn > 0 ? 0.55 : -0.75)], tn > 0 ? '↑' : '↓'); }
          pT.textContent = 'tan θ ＝ ' + f2(tn) + (Math.abs(R * tn) > LIM ? '（T 跑出畫面了）' : ''); pT.className = 'pl-pill ' + (Math.abs(tn) > 1 ? 'is-pink' : 'is-amber');
        }
      } else b.setLine(ray, [CX, CY], [CX, CY]);
      if (o.mode === 'sec') { pSec.textContent = Math.abs(c) < 1e-9 ? 'sec θ ＝ 1/cos θ ＝ 不存在' : 'sec θ ＝ 1/cos θ ＝ 1 ÷ ' + f2(c) + ' ＝ ' + f2(1 / c); }
      if (o.mark) { var ok = o.mark(d, c, s); [pC, pS, pT].forEach(function (q) { q.classList.remove('is-ok'); }); if (ok) (o.markPill === 'tan' ? pT : o.markPill === 'cos' ? pC : pS).className = 'pl-pill is-ok'; }
      if (o.onChange) o.onChange(d, c, s);
    }
    var hd = b.handle({ pos: ptOf(d), candidates: ANG.map(ptOf), disabled: function () { return !!(o.gate && o.gate.on); },
      onMove: function (t) { d = angOf(t); upd(); }, onEnd: function (t) { d = angOf(t); upd(); if (o.onSettle) o.onSettle(d, b); } });
    S.setD = function (v) { hd.moveTo(ptOf(v)); };
    upd(); return S;
  }

  var steps = [
    /* 1. 預測＋sin、cos 的影子 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc;
      P.choice(st, api, { id: 'tr-p1', predict: true, label: '先猜猜看', prompt: 'P 在<b>半徑 1</b> 的圓上繞一圈。<b>sin θ</b>（P 的高度）最大會到多少？', row: true, options: [{ ok: true, t: '1' }, { t: '√2 ≈ 1.41' }, { t: '2' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 P 繞圓，看兩個影子'); } });
      st.append(P.instr('拖動 <b>P</b> 繞單位圓（半徑 ＝ 1）。<b>cos θ</b> 是 P 左右的位置（綠點），<b>sin θ</b> 是 P 上下的高度（粉紅點）。'));
      sc = scene(st, { mode: 'sc', start: 30, gate: gate, onChange: function (d, c, s) {
        if (gate.on) return; if (close(s, 1)) seen.s1 = 1; if (close(s, -1)) seen.s2 = 1; if (close(c, 1)) seen.c1 = 1; if (close(c, -1)) seen.c2 = 1;
        if (seen.s1 && seen.s2 && seen.c1 && seen.c2 && !done) {
          done = true; P.track('aha', { id: 'trig-range', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：sin θ 最大是 1');
          st.append(P.ruleBox('P 在<b>半徑 1</b> 的圓上，座標 (cos θ, sin θ) 不可能超出圓。<br>所以 <b>−1 ≤ sin θ ≤ 1</b>、<b>−1 ≤ cos θ ≤ 1</b>：最大 1（在 90° 或 0°），最小 −1（在 270° 或 180°）。', 'sin cos 的範圍'));
          api.unlock('sin、cos 都在 −1 到 1');
        }
      } });
      api.solve(function () { gate.on = false; [90, 270, 0, 180].forEach(function (v) { sc.setD(v); }); }, false, 'sin θ 最大是 1（在 90°），最小是 −1（在 270°）；cos θ 也在 −1 到 1 之間');
      st.append(P.hint('把 P 拖到最上面、最下面、最右邊、最左邊。')); api.lock('先做上面的預測');
    },
    /* 2. tan：x＝1 的切線 */
    function (st, api) {
      var seen = {}, done = false, sc;
      st.append(P.instr('加上一條 <b>x ＝ 1</b> 的直線。從圓心過 P 畫一條線，碰到這條線的點 <b>T</b>，它的<b>高度</b>就是 <b>tan θ</b>。拖動 P，看 T 怎麼跑。'));
      sc = scene(st, { mode: 'tan', start: 45, onChange: function (d, c, s) {
        var tn = Math.abs(c) < 1e-9 ? null : s / c;
        if (d === 90) seen.und = 1; if (tn !== null && Math.abs(tn) > 3) seen.big = 1; if (tn !== null && tn < -0.5) seen.neg = 1; if (tn !== null && close(tn, 1)) seen.one = 1;
        if (seen.und && seen.big && seen.neg && !done) {
          done = true; P.track('aha', { id: 'trig-range', step: 2 });
          st.append(P.ruleBox('P 越接近 90°，射線越平，T 衝得越高：<b>tan θ 可以任意大</b>，沒有上限。<br>到 90° 時射線和 x ＝ 1 <b>平行</b>，碰不到，<b>tan 90° 不存在</b>。<br>所以 tan θ 可以是<b>任何實數</b>，不像 sin、cos 被關在 −1 到 1。', 'tan 沒有上限'));
          api.unlock('tan 可以是任何實數');
        }
      } });
      api.solve(function () { [45, 75, 90, 135].forEach(function (v) { sc.setD(v); }); }, false, 'tan θ 可以是任何實數（沒有最大最小值）；tan 90° 不存在');
      st.append(P.hint('P 拖到 75°、90°、135° 看看。')); api.lock('看 T 在 75°、90°、135° 的位置');
    },
    /* 3. sec ＝ 1/cos */
    function (st, api) {
      var seen = {}, done = false, sc;
      st.append(P.instr('再看<b>倒數</b>：<b>sec θ ＝ 1 ÷ cos θ</b>。cos 在 −1 到 1 之間，它的倒數會在哪裡？拖動 P 看看。'));
      sc = scene(st, { mode: 'sec', start: 60, onChange: function (d, c) {
        if (close(c, 1)) seen.a = 1; if (close(c, -1)) seen.b = 1; if (close(Math.abs(c), 0.5)) seen.h = 1; if (close(c, 0)) seen.z = 1;
        if (seen.a && seen.b && seen.h && seen.z && !done) {
          done = true; P.track('aha', { id: 'trig-range', step: 3 });
          st.append(P.ruleBox('cos 的絕對值 ≤ 1，倒數的絕對值就 <b>≥ 1</b>：sec θ ≥ 1 或 sec θ ≤ −1。<br>cos 越接近 0，sec 越大；cos ＝ 0 時 sec <b>不存在</b>。<br>csc ＝ 1/sin 也是一樣的道理。', '倒數'));
          api.unlock('sec 取不到 −1 和 1 之間');
        }
      } });
      api.solve(function () { [0, 60, 90, 180].forEach(function (v) { sc.setD(v); }); }, false, 'sec θ 只會 ≥ 1 或 ≤ −1，取不到 −1 和 1 之間的值');
      st.append(P.hint('找出 cos θ ＝ 1、−1、±0.5、0 的位置。')); api.lock('找 cos 等於 1、−1、0.5 和 0 的位置');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, mode, mark(d,c,s), markPill, goal(d)（符合就算找到）, need, answer（看詳解用的角度）, ans（正確答案文字）, msg, rule, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var found = {}, n = 0, fin = false, pN = P.pill('找到 0 / ' + cfg.need, 'is-blue');
          var sc = scene(b0, { mode: cfg.mode, sm: true, start: cfg.start, mark: cfg.mark, markPill: cfg.markPill, onSettle: function (d, b) {
            if (cfg.goal(d) && !found[d]) { found[d] = 1; n++; pN.textContent = '找到 ' + n + ' / ' + cfg.need; var pp = ptOf(d); b.goalMark(pp); P.toast('找到了：θ ＝ ' + d + '°' + (n < cfg.need ? '，還有別的位置' : '')); if (n === cfg.need && !fin) { fin = true; b0.append(P.ruleBox(cfg.rule, '單位圓')); done(); } }
          } });
          b0.append(h('div', { class: 'pl-readout' }, pN)); setSolve(function () { cfg.answer.forEach(function (v) { sc.setD(v); }); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '拖動 <b>P</b>，找出所有讓 <b>sin θ ＝ 0.5</b> 的角度 θ（0° 到 360°，有 2 個）。', mode: 'sc', start: 0, mark: function (d, c, s) { return close(s, 0.5); }, markPill: 'sin', goal: function (d) { return close(Math.sin(rad(d)), 0.5); }, need: 2, answer: [30, 150], ans: 'θ ＝ 30° 和 θ ＝ 150°（這兩個角的高度都是 0.5）', rule: 'sin θ ＝ 0.5 是高度 0.5 的位置，圓上有<b>左右對稱的兩個點</b>：θ ＝ 30° 和 150°。', hint: '高度是 0.5 的位置，圓上有幾個點？' }),
        task({ prompt: '拖動 <b>P</b>，讓 <b>cos θ 最小</b>（找出 cos θ 的最小值出現在哪個角）。', mode: 'sc', start: 90, mark: function (d, c) { return close(c, -1); }, markPill: 'cos', goal: function (d) { return close(Math.cos(rad(d)), -1); }, need: 1, answer: [180], ans: 'θ ＝ 180°（cos 180° ＝ −1，是最小值）', rule: 'cos θ 是 P 左右的位置，最左邊是 <b>−1</b>，在 θ ＝ 180°。這就是 cos 的最小值。', hint: 'cos 是左右的位置。最小就是最靠哪一邊？' }),
        task({ prompt: '拖動 <b>P</b>，找出所有讓 <b>tan θ ＝ 1</b> 的角度 θ（0° 到 360°，有 2 個）。', mode: 'tan', start: 0, mark: function (d, c, s) { return Math.abs(c) > 1e-9 && close(s / c, 1); }, markPill: 'tan', goal: function (d) { var c = Math.cos(rad(d)); return Math.abs(c) > 1e-9 && close(Math.sin(rad(d)) / c, 1); }, need: 2, answer: [45, 225], ans: 'θ ＝ 45° 和 θ ＝ 225°（T 的高度都是 1）', rule: 'tan θ ＝ 1 就是 T 的高度是 1：射線在 θ ＝ 45°，往反方向延長的 θ ＝ 225° 也會碰到同一個 T。', hint: 'T 的高度是 1，這條線從圓心出發往哪兩個方向？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-range' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'trig-range', moduleName: '單位圓：sin、cos 的範圍與 tan 的無限', askAbout: '三角函數的範圍', aha: '單位圓半徑是 1，所以 <b>sin、cos 都只在 −1 到 1 之間</b>；tan 是切線 x ＝ 1 上的高度，<b>可以任意大</b>。<br>倒數 sec、csc 的絕對值一定 ≥ 1。',
        cards: [{ text: '−1 ≤ sin θ ≤ 1、−1 ≤ cos θ ≤ 1；tan θ、cot θ 可以是任何實數；|sec θ| ≥ 1、|csc θ| ≥ 1', src: '高中：三角函數的範圍' }, { text: '單位圓上 P(cos θ, sin θ)；tan θ ＝ sin θ ÷ cos θ，是 x ＝ 1 的切線上的高度', src: '三角函數的定義（單位圓）' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '三角函數的圖形<br>週期與最大最小值' }, { at: 0.85, label: '反三角函數<br>三角不等式' }] },
        teasers: [{ title: '三角函數的最大最小值', q: 'y ＝ 3 sin x ＋ 1 的最大值與最小值各是多少？', where: 'S102 第 18～22 堂（2026 年 5～6 月）：CH4 三角函數', lv: 'L2' }, { title: '三角方程式', q: '2 sin θ ＝ 1 在 0° 到 360° 有幾個解？', where: 'S111 第 1～8 堂：CH1 三角函數 II', lv: 'L3' }],
        parent: { pitfall: '孩子常以為 tan θ 也在 −1 到 1 之間；也常忘記 sec、csc 取不到 −1 和 1 之間的值。', place: '高中三角函數的第一步：知道每個三角函數能取到哪些值。', ask: ['sin θ 最大是多少？為什麼不會更大？', 'tan 90° 為什麼不存在？', 'sin θ ＝ 0.5 在 0° 到 360° 有幾個解？'] },
        classes: ['S102（第 18～22 堂，2026 年 5～6 月）：CH4 三角函數', 'S111（第 1～8 堂）：CH1 三角函數 II'], next: { href: 'play-trig-circle.html', text: '再玩：三角函數單位圓' } });
    }];
  new P.Lesson({ id: 'trig-range', title: '單位圓：sin、cos 的範圍與 tan 的無限', steps: steps });
})();
