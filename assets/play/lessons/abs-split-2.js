/* 獵豹玩中學｜絕對值（二）：兩個零點，數線切成三段
   預測＋拖 x 看 |x−1|＋|x−4|（折線圖同步）→ 自己放兩個零點 |x＋1|＋|x−3| → 3 個操作關卡（和＝5、找最小的位置、和＝8）。
   要擊中的迷思：兩個絕對值要分三段討論、中間一段兩個絕對值的 x 剛好抵消（和是常數，等於兩個零點的距離）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PN = window.PN, f = PN.fmt;
  var AY = 2.9, HP = 4.2, HH = 8.4;
  function term(a) { return a < 0 ? 'x ＋ ' + (-a) : 'x − ' + a; }
  function leftEnd(s) { return s === 0 ? '−2x' : s > 0 ? s + ' − 2x' : '−2x − ' + (-s); }
  function rightEnd(s) { return s === 0 ? '2x' : s > 0 ? '2x − ' + s : '2x ＋ ' + (-s); }
  function wrapPill(p) { p.style.whiteSpace = 'normal'; return p; }

  /* 畫面：數線＋折線圖（和）＋可拖動的 x。
     o: a, b（兩個零點，a＜b）、vmin, vmax、placeZeros（要學生自己放兩個零點）、target（和的目標值，畫一條虛線）、
        gate（預測前擋住）、sm、onX(v, 和)。 */
  function scene(host, o) {
    var a = o.a, bb = o.b, vmin = o.vmin, vmax = o.vmax, S = {}, known = !o.placeZeros, xv = o.x0 === undefined ? vmax - 1 : o.x0, VALS = [], HVALS = [];
    for (var q = vmin; q <= vmax; q++) VALS.push(q);
    for (q = vmin; q <= vmax + 1e-9; q += 0.5) HVALS.push(q);
    function F(v) { return Math.abs(v - a) + Math.abs(v - bb); }
    var maxf = Math.max(F(vmin), F(vmax));
    var b = PA.board(host, 12, HH, o.sm ? 'pl-svg--sm' : ''), gB = h('g'), gD = h('g'), gS = h('g'); b.gMid.append(gB);
    var ax = PN.axis(b, { vmin: vmin, vmax: vmax, y: AY, labelGap: 1.25 }), X = ax.X; b.gMid.append(gD, gS);
    function Yf(v) { return AY + HP * F(v) / maxf; }
    /* 圖形（零點放好之後才出現） */
    var pts = []; for (q = vmin; q <= vmax + 1e-9; q += 0.25) pts.push([X(q), Yf(q)]);
    var curve = h('polyline', { points: b.pts(pts), class: 'pl-line pl-line--blue', fill: 'none' }); gD.append(curve);
    var drop = b.line([X(xv), AY + 0.5], [X(xv), Yf(xv)], 'pl-line pl-line--dash pl-line--soft', gD), dot = b.dot([X(xv), Yf(xv)], 'pl-dot pl-dot--pink', gD, 0.2);
    var tx = b.text([X(xv) - 0.65, AY + 0.65], 'x', 'pl-text pl-text--blue', gD);
    var tgt = null, tgtT = null;
    if (o.target !== undefined) { tgt = b.line([X(vmin) - 0.5, AY + HP * o.target / maxf], [X(vmax) + 0.5, AY + HP * o.target / maxf], 'pl-line pl-line--pink pl-line--dash', gD); tgtT = b.text([X(vmax) - 0.9, AY + HP * o.target / maxf + 0.5], '和 ＝ ' + o.target, 'pl-text pl-text--sm pl-text--pink', gD); }
    var zl = [a, bb].map(function (v) { return b.line([X(v), AY - 0.3], [X(v), AY + HP + 0.3], 'pl-line pl-line--amber pl-line--dash', gS); });
    var zt = [a, bb].map(function (v) { return b.text([X(v), AY + HP + 0.85], '零點 ' + f(v), 'pl-text pl-text--sm pl-text--amber', gS); });
    var segT = [h('g'), h('g'), h('g')].map(function (g, i) { return b.text([0, 0], '', 'pl-text pl-text--sm ' + ['pl-text--pink', 'pl-text--amber', 'pl-text--green'][i], gS); });
    /* 讀數 */
    var pA = P.pill('', 'is-blue'), pB = P.pill('', 'is-blue'), pS = P.pill('', 'is-green');
    host.append(h('div', { class: 'pl-readout' }, pA, pB), h('div', { class: 'pl-readout' }, pS));
    var rowTxt = [
      'x ＜ ' + f(a) + '：和 ＝ −(' + term(a) + ') − (' + term(bb) + ') ＝ ' + leftEnd(a + bb),
      f(a) + ' ≤ x ＜ ' + f(bb) + '：和 ＝ (' + term(a) + ') − (' + term(bb) + ') ＝ ' + f(bb - a),
      'x ≥ ' + f(bb) + '：和 ＝ (' + term(a) + ') ＋ (' + term(bb) + ') ＝ ' + rightEnd(a + bb)];
    var rows = rowTxt.map(function (t, i) { var p = wrapPill(P.pill(t, ['is-pink', 'is-amber', 'is-green'][i])), r = h('div', { class: 'pl-readout' }, p); r.style.display = 'none'; r._p = p; host.append(r); return r; });
    /* 零點把手（placeZeros）：A 管 |x＋…|、B 管 |x−…|，放開時才算數 */
    var zh = [null, null], zv = [0, 0], zOk = [false, false], rowsY = [AY + 1.3, AY + 3.4], zlab = [], pZ = [P.pill('', 'is-amber'), P.pill('', 'is-amber')];
    function showZ(i) { var v = i ? bb : a, val = zv[i] - v; pZ[i].textContent = '零點 ' + 'AB'[i] + '：x ＝ ' + f(zv[i]) + ' 時，' + term(v) + ' ＝ ' + f(val); pZ[i].className = 'pl-pill ' + (val === 0 ? 'is-ok' : 'is-amber'); b.setText(zlab[i], [X(zv[i]), rowsY[i] + 0.95]); }
    function commitZ(i) {
      var v = i ? bb : a; if (zOk[i] || zv[i] !== v) return; zOk[i] = true; P.toast('零點 ' + 'AB'[i] + ' 在 x ＝ ' + f(v)); b.goalMark([X(v), rowsY[i]]).setAttribute('class', 'pl-goal');
      if (zOk[0] && zOk[1]) { known = true; reveal(); if (o.onZeros) o.onZeros(S); }
    }
    if (o.placeZeros) [0, 1].forEach(function (i) {
      zlab[i] = b.text([X(0), rowsY[i] + 0.95], '零點 ' + 'AB'[i], 'pl-text pl-text--amber', b.gMid);
      zh[i] = b.handle({ pos: [X(0), rowsY[i]], candidates: VALS.map(function (v) { return [X(v), rowsY[i]]; }), disabled: function () { return zOk[i]; },
        onMove: function (t) { zv[i] = Math.round(ax.V(t[0])); showZ(i); }, onEnd: function (t) { zv[i] = Math.round(ax.V(t[0])); showZ(i); commitZ(i); } });
      showZ(i);
    });
    if (o.placeZeros) host.insertBefore(h('div', { class: 'pl-readout' }, pZ[0], pZ[1]), host.querySelector('.pl-readout'));
    var hd = b.handle({ pos: [X(xv), AY], candidates: HVALS.map(function (v) { return [X(v), AY]; }),
      disabled: function () { return !!(o.gate && o.gate.on) || !known; },
      onMove: function (t) { xv = ax.V(t[0]); upd(); if (o.onX) o.onX(xv, F(xv)); } });
    function show(on) { [gB, gD, gS].forEach(function (g) { g.style.display = on ? '' : 'none'; }); rows.forEach(function (r) { r.style.display = on ? '' : 'none'; }); pA.parentNode.style.display = pS.parentNode.style.display = on ? '' : 'none'; hd.el.style.display = on ? '' : 'none'; }
    function bands() {
      gB.innerHTML = ''; var x0 = X(vmin) - 0.5, x1 = X(vmax) + 0.5, xa = X(a), xb = X(bb);
      [[x0, xa, 'rgba(214,51,108,.22)'], [xa, xb, 'rgba(210,155,31,.3)'], [xb, x1, 'rgba(31,157,85,.22)']].forEach(function (r) { gB.append(h('rect', { x: r[0], y: b.Y(AY) - 0.32, width: r[1] - r[0], height: 0.64, fill: r[2] })); });
      b.setText(segT[0], [(x0 + xa) / 2, AY - 2.3], 'x ＜ ' + f(a)); b.setText(segT[1], [(xa + xb) / 2, AY - 2.3], f(a) + ' ≤ x ＜ ' + f(bb)); b.setText(segT[2], [(xb + x1) / 2, AY - 2.3], 'x ≥ ' + f(bb));
    }
    function upd() {
      var v = xv, fa = Math.abs(v - a), fb = Math.abs(v - bb), sum = fa + fb;
      b.setLine(drop, [X(v), AY + 0.5], [X(v), Yf(v)]); dot.setAttribute('cx', X(v)); dot.setAttribute('cy', b.Y(Yf(v))); b.setText(tx, [X(v) - 0.65, AY + 0.65], 'x');
      pA.textContent = '|' + term(a) + '| ＝ ' + f(fa); pB.textContent = '|' + term(bb) + '| ＝ ' + f(fb); pS.textContent = '和 ＝ ' + f(fa) + ' ＋ ' + f(fb) + ' ＝ ' + f(sum);
      var tg = o.target !== undefined ? o.target : o.best; pS.className = 'pl-pill ' + (tg !== undefined && sum === tg ? 'is-ok' : 'is-green');
      var act = v < a ? 0 : v < bb ? 1 : 2; rows.forEach(function (r, i) { r._p.style.opacity = i === act ? 1 : 0.35; });
    }
    function reveal() { show(true); zh.forEach(function (z) { if (z) z.hide(true); }); zlab.forEach(function (t) { t.style.display = 'none'; }); pZ[0].parentNode.style.display = 'none'; bands(); upd(); }
    bands(); show(known);
    if (!known) { gS.style.display = 'none'; hd.el.style.display = 'none'; }
    upd();
    S.setX = function (v) { hd.moveTo([X(v), AY]); };
    S.setZeros = function () { zh[0].moveTo([X(a), rowsY[0]]); zh[1].moveTo([X(bb), rowsY[1]]); };
    S.known = function () { return known; };
    return S;
  }

  var steps = [
    /* 1. 預測＋拖 x：|x−1|＋|x−4| */
    function (st, api) {
      var gate = { on: true }, seen = [0, 0, 0], done = false, s;
      P.choice(st, api, { id: 'abs2-p1', predict: true, label: '先猜猜看', prompt: '<b>x ＝ 2</b> 時，<b>|x − 1| ＋ |x − 4|</b> 等於多少？', row: true, options: [{ t: '1' }, { ok: true, t: '3' }, { t: '5' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把 x 拖到三段各看看'); } });
      st.append(P.instr('拖動數線上的 <b>x</b>，看看 <b>|x − 1| ＋ |x − 4|</b> 的和怎麼變（上面的折線就是和）。'));
      s = scene(st, { a: 1, b: 4, vmin: -2, vmax: 8, gate: gate, best: 3, onX: function (v) {
        if (gate.on) return; seen[v < 1 ? 0 : v < 4 ? 1 : 2] = 1;
        if (seen[0] && seen[1] && seen[2] && !done) {
          done = true; P.track('aha', { id: 'abs-split-2', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：x＝2 時和是 3');
          st.append(P.ruleBox('兩個零點 <b>1</b> 和 <b>4</b> 把數線切成<b>三段</b>，每段各自去絕對值：<br>左邊：和 ＝ 5 − 2x（越往右越小）<br>右邊：和 ＝ 2x − 5（越往右越大）<br><b>中間：和 ＝ 3，不管 x 在哪都一樣</b>，因為兩個 x 剛好抵消。', '三段'));
          api.unlock('兩個零點，切成三段');
        }
      } });
      api.solve(function () { gate.on = false; s.setX(-1); s.setX(2); s.setX(7); });
      st.append(P.hint('x 在中間一段時，和有沒有跟著 x 變？')); api.lock('先做上面的預測');
    },
    /* 2. 自己放兩個零點：|x＋1|＋|x−3| */
    function (st, api) {
      var seen = [0, 0, 0], done = false, s;
      st.append(P.instr('這次是 <b>|x ＋ 1| ＋ |x − 3|</b>。把 <b>零點 A</b>（管 |x ＋ 1|）和 <b>零點 B</b>（管 |x − 3|）拖到各自「裡面剛好等於 0」的位置。'));
      s = scene(st, { a: -1, b: 3, vmin: -3, vmax: 7, placeZeros: true, best: 4, onX: function (v) {
        if (!s.known()) return; seen[v < -1 ? 0 : v < 3 ? 1 : 2] = 1;
        if (seen[0] && seen[1] && seen[2] && !done) {
          done = true; P.track('aha', { id: 'abs-split-2', step: 2 });
          st.append(P.ruleBox('中間一段和永遠是 <b>4</b>。零點是 −1 和 3，它們相距 <b>3 − (−1) ＝ 4</b>。<br>中間的和就是<b>兩個零點的距離</b>，而且這就是和的<b>最小值</b>。', '中間一段'));
          api.unlock('中間 ＝ 兩個零點的距離');
        }
      }, onZeros: function () { st.append(P.hint('零點放好了。再把 x 拖到三段各看看。')); } });
      api.solve(function () { s.setZeros(); s.setX(-3); s.setX(1); s.setX(6); });
      st.append(P.hint('想想看：x 等於多少時，x ＋ 1 變成 0？x − 3 呢？')); api.lock('先放好兩個零點，再把 x 拖到三段');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function findTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var found = {}, n = 0, pN = P.pill('找到 0 / ' + cfg.need, 'is-blue'), s;
          s = scene(b0, { a: cfg.a, b: cfg.b, vmin: cfg.vmin, vmax: cfg.vmax, sm: true, target: cfg.target, best: cfg.best, x0: cfg.x0, onX: function (v, sum) {
            if (sum === cfg.goal && !found[v]) { found[v] = 1; n++; pN.textContent = '找到 ' + n + ' / ' + cfg.need; P.toast('找到了：x ＝ ' + f(v) + (n < cfg.need ? '，還有別的位置' : '')); if (n === cfg.need) done(); }
          } });
          b0.append(h('div', { class: 'pl-readout' }, pN));
          setSolve(function () { cfg.sols.forEach(function (v) { s.setX(v); }); }, cfg.ans);
          b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        findTask({ prompt: '拖動 <b>x</b>，找出<b>所有</b>讓 <b>|x − 1| ＋ |x − 4| ＝ 5</b> 的 x（虛線是和 ＝ 5）。', a: 1, b: 4, vmin: -2, vmax: 8, target: 5, goal: 5, need: 2, sols: [0, 5], ans: 'x ＝ 0 和 x ＝ 5', hint: '三段裡，哪幾段的和會碰到虛線？' }),
        findTask({ prompt: '讓 <b>|x − 1| ＋ |x − 4|</b> 的和<b>最小</b>。找出 <b>3 個不同的位置</b>，和都是最小值。', a: 1, b: 4, vmin: -2, vmax: 8, best: 3, goal: 3, need: 3, sols: [1, 2.5, 4], ans: '1 到 4 之間的每個 x 都可以（例如 x ＝ 1、2.5、4），和的最小值是 3', hint: '看折線圖，最低的地方不只一個點。' }),
        findTask({ prompt: '零點在 <b>2</b> 和 <b>6</b>。找出所有讓 <b>|x − 2| ＋ |x − 6| ＝ 8</b> 的 x（虛線是和 ＝ 8）。', a: 2, b: 6, vmin: -2, vmax: 8, target: 8, goal: 8, need: 2, sols: [0, 8], ans: 'x ＝ 0 和 x ＝ 8（中間一段的和只有 4，碰不到 8）', hint: '中間一段的和是多少？它碰得到虛線嗎？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'abs-split-2' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'abs-split-2', moduleName: '絕對值：兩個零點，數線切成三段', askAbout: '絕對值與分段討論', aha: '兩個絕對值有兩個零點，把數線切成<b>三段</b>，每段各自去絕對值。<br>中間一段兩個 x 抵消，和是<b>常數</b>，等於兩個零點的距離，也是和的最小值。',
        cards: [{ text: '|x − a| ＋ |x − b|（a ＜ b）：x ＜ a、a ≤ x ＜ b、x ≥ b 三段；中間一段恆為 b − a，也是最小值', src: '高中：絕對值與分段討論' }, { text: '|x − a| 是 x 到 a 的距離；|x − a| ＋ |x − b| 是 x 到兩點的距離和', src: '國中到高中：絕對值的幾何意義' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '絕對值不等式<br>分段函數圖形' }, { at: 0.85, label: '含參數的絕對值<br>最值問題' }] },
        teasers: [{ title: '距離和的最小值', q: '數線上有三個點 1、4、9，x 在哪裡時 |x − 1| ＋ |x − 4| ＋ |x − 9| 最小？', where: 'S101 2507 第 5 堂：數與式（絕對值）', lv: 'L3' }],
        parent: { pitfall: '孩子常只找出一個零點、或把三段的邊界點放錯段；去絕對值時負的那一段忘了整個變號；中間一段不知道可以直接看出是常數，還用很長的計算。', place: '高中「數與式」的絕對值，是分段函數、絕對值不等式與最值問題的基礎。', ask: ['|x − 1| ＋ |x − 4| 在數線上是什麼意思？', '為什麼 x 在 1 和 4 中間時，和一直是 3？', '兩個零點之間的距離，和最小值有什麼關係？'] },
        classes: ['S101（2507 第 5 堂）：數與式，含絕對值'], next: { href: 'play-linear-ineq.html', text: '下一個：一元一次不等式' } });
    }];
  new P.Lesson({ id: 'abs-split-2', title: '絕對值：兩個零點，數線切成三段', steps: steps });
})();
