/* 獵豹玩中學｜正弦定理：三角形解的個數（SSA）
   預測＋拉 a（圓規的半徑）看圓和射線有幾個交點 → 用 h＝b sin A 和 b 兩個刻度分成四種情形 → 3 個操作關卡（剛好相切、兩個三角形、鈍角 A）。
   要擊中的迷思：只算一個 B（忘了 180°−B）、有補角時沒檢查 A＋B＜180°、A 為鈍角還討論兩解、a＝b 誤判成兩解。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, f2 = function (v) { v = Math.round(v * 100) / 100; return (v < 0 ? '−' : '') + Math.abs(v); };
  var AY = 2.0, U = 0.55, BLEN = 10;
  function rad(d) { return d * Math.PI / 180; }
  /* 圓（圓心 C、半徑 a）和射線（從 A 往右）的交點 B：B ＝ A ＋ t（只取 t ＞ 0）。回傳 t 的陣列（長度單位）。 */
  function cut(A, a) {
    var hh = BLEN * Math.sin(rad(A)), bc = BLEN * Math.cos(rad(A)), D = a * a - hh * hh, ts = [], EPS = 1e-9;
    if (D < -EPS) return ts; if (Math.abs(D) <= EPS) { if (bc > EPS) ts.push(bc); return ts; }
    var s = Math.sqrt(D); [bc - s, bc + s].forEach(function (t) { if (t > EPS) ts.push(t); }); return ts;
  }
  /* 用正弦定理算個數（和上面的幾何方法互相對照） */
  function countAlg(A, a) {
    var sB = BLEN * Math.sin(rad(A)) / a; if (a <= 0 || sB > 1 + 1e-9) return 0; var B1 = Math.asin(Math.min(1, sB)) * 180 / Math.PI, n = 0;
    if (A + B1 < 180 - 1e-9) n++; if (Math.abs(sB - 1) > 1e-9 && A + (180 - B1) < 180 - 1e-9) n++; return n;
  }

  /* 畫面。o: A（角 A）、a（初值）、gate、sm、onChange(a, n)、onSettle(a, n)、regions（要不要顯示四種情形的標籤）、noSlider */
  function scene(host, o) {
    var b = PA.board(host, 12, 8, o.sm ? 'pl-svg--sm' : ''), A = o.A, a = o.a, S = {}, gD = h('g'), AX = A > 90 ? 1.0 + BLEN * U * Math.abs(Math.cos(rad(A))) + 0.4 : 1.0; b.gMid.append(gD);
    var C = [AX + BLEN * U * Math.cos(rad(A)), AY + BLEN * U * Math.sin(rad(A))];
    b.line([AX - 0.3, AY], [11.6, AY], 'pg-axis'); b.line([AX, AY], C, 'pl-line pl-line--blue pl-line--bold');
    var circle = b.circle(C, 1, 'pl-circle', null, { fill: 'rgba(210,155,31,.08)', stroke: '#d29b1f', 'stroke-width': 0.08, 'stroke-dasharray': '0.35 0.25' });
    b.dot([AX, AY], 'pl-dot', null, 0.16); b.dot(C, 'pl-dot pl-dot--blue', null, 0.2);
    b.text([AX - 0.5, AY - 0.55], 'A', 'pl-text'); b.text([C[0] + 0.6, C[1] + 0.35], 'C', 'pl-text pl-text--blue');
    var gA = h('g'); b.gMid.append(gA);
    /* 角 A：90° 畫直角符號 */
    if (A === 90) gA.append(h('polyline', { points: b.pts([[AX + 0.5, AY], [AX + 0.5, AY + 0.5], [AX, AY + 0.5]]), class: 'pl-right' }));
    else { var r = 0.9; gA.append(h('path', { d: 'M ' + (AX + r) + ' ' + b.Y(AY) + ' A ' + r + ' ' + r + ' 0 0 0 ' + (AX + r * Math.cos(rad(A))) + ' ' + b.Y(AY + r * Math.sin(rad(A))), fill: 'none', stroke: '#d29b1f', 'stroke-width': 0.08 })); }
    b.text([AX + 1.45 * Math.cos(rad(A / 2)) + 0.2, AY + 1.45 * Math.sin(rad(A / 2)) - 0.15], 'A ＝ ' + A + '°', 'pl-text pl-text--sm pl-text--amber');
    var pA = P.pill('', 'is-blue'), pH = P.pill('', 'is-amber'), pB = P.pill('', 'is-pink'), pN = P.pill('', 'is-green'); [pB].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pA, pH), h('div', { class: 'pl-readout' }, pB), h('div', { class: 'pl-readout' }, pN));
    var chips = null;
    if (o.regions) { chips = {}; var cr = h('div', { class: 'pl-readout' }); [['lt', 'a ＜ h：0 個'], ['eq', 'a ＝ h：1 個'], ['mid', 'h ＜ a ＜ b：2 個'], ['ge', 'a ≥ b：1 個']].forEach(function (c) { chips[c[0]] = P.pill(c[1], 'is-amber'); cr.append(chips[c[0]]); }); host.append(cr); }
    function upd() {
      var ts = cut(A, a), n = ts.length, hh = BLEN * Math.sin(rad(A)); gD.innerHTML = '';
      b.circle(C, a * U, 'pl-circle', gD, { fill: 'none', stroke: '#d29b1f', 'stroke-width': 0.08, 'stroke-dasharray': '0.35 0.25' }); circle.style.display = 'none';
      ts.forEach(function (t, i) {
        var B = [AX + t * U, AY]; gD.append(b.line([AX, AY], B, 'pl-line pl-line--pink pl-line--bold'), b.line(B, C, 'pl-line pl-line--pink pl-line--dash')); gD.append(b.dot(B, 'pl-dot pl-dot--pink', null, 0.24));
        b.text([B[0], AY - 0.65], n > 1 ? 'B' + (i + 1 === 1 ? '₁' : '₂') : 'B', 'pl-text pl-text--pink', gD);
        if (Math.abs(a - hh) < 1e-9) gD.append(h('polyline', { points: b.pts([[B[0] - 0.4, AY], [B[0] - 0.4, AY + 0.4], [B[0], AY + 0.4]]), class: 'pl-right' }));
      });
      pA.textContent = 'a ＝ ' + f2(a) + '（圓的半徑）'; pH.textContent = 'h ＝ b·sin A ＝ ' + f2(hh) + '，b ＝ ' + BLEN;
      var sB = BLEN * Math.sin(rad(A)) / (a || 1e-9);
      pB.textContent = a <= 0 ? '' : sB > 1 + 1e-9 ? 'sin B ＝ b·sin A ÷ a ＝ ' + f2(sB) + ' ＞ 1：沒有這樣的角 B' : 'sin B ＝ b·sin A ÷ a ＝ ' + f2(sB) + (n === 2 ? '　B₁ ＝ ' + f2(Math.asin(sB) * 180 / Math.PI) + '°、B₂ ＝ 180° − B₁ ＝ ' + f2(180 - Math.asin(sB) * 180 / Math.PI) + '°' : n === 1 ? '　B ＝ ' + f2(Math.atan2(hh, ts[0] * 0 + 0) * 0 + (sB >= 1 - 1e-9 ? 90 : (Math.abs(a - BLEN) < 1e-9 ? 90 - 0 : 0)) || 0) + '' : '');
      /* 更清楚的 B 角度：由三角形 ABC 三邊直接算（和正弦定理對照） */
      if (a > 0 && n >= 1) { var parts = ts.map(function (t, i) { var Bx = t, vB = [-t, 0], vC = [BLEN * Math.cos(rad(A)) - t, hh], ang = Math.acos(Math.max(-1, Math.min(1, (vB[0] * vC[0] + vB[1] * vC[1]) / (Math.hypot(vB[0], vB[1]) * Math.hypot(vC[0], vC[1]))))) * 180 / Math.PI; return (n > 1 ? 'B' + (i + 1 === 1 ? '₁' : '₂') : 'B') + ' ＝ ' + f2(ang) + '°'; }); pB.textContent = (sB > 1 + 1e-9 ? '' : 'sin B ＝ b·sin A ÷ a ＝ ' + f2(sB) + '　') + parts.join('、'); }
      pN.textContent = n === 0 ? '圓碰不到射線：做不出三角形（0 個）' : n === 1 ? '只有 1 個三角形' : '有 2 個三角形（B₁ 和 B₂ 兩個交點）'; pN.className = 'pl-pill ' + (n === 0 ? 'is-pink' : n === 1 ? 'is-green' : 'is-blue');
      if (chips) { var key = a < hh - 1e-9 ? 'lt' : Math.abs(a - hh) < 1e-9 ? 'eq' : a < BLEN - 1e-9 ? 'mid' : 'ge'; Object.keys(chips).forEach(function (k) { chips[k].className = 'pl-pill ' + (S.seen && S.seen[k] ? 'is-ok' : 'is-amber'); }); S.cur = key; }
      if (o.onChange) o.onChange(a, n, S);
    }
    S.seen = {};
    if (!o.noSlider) {
      var sl = P.slider(0, 12, a, function (v) { if (o.gate && o.gate.on) { P.toast('先做上面的預測'); sl.value = a; return; } a = v; if (chips) { var hh = BLEN * Math.sin(rad(A)); S.seen[a < hh - 1e-9 ? 'lt' : Math.abs(a - hh) < 1e-9 ? 'eq' : a < BLEN - 1e-9 ? 'mid' : 'ge'] = 1; } upd(); }, 1);
      sl.addEventListener('change', function () { if (o.onSettle) o.onSettle(a, cut(A, a).length); });
      host.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← a ＝ 0'), h('span', {}, 'a ＝ 12 →'))); S.sl = sl;
    }
    S.set = function (v) { a = v; if (S.sl) S.sl.value = v; if (chips) { var hh = BLEN * Math.sin(rad(A)); S.seen[a < hh - 1e-9 ? 'lt' : Math.abs(a - hh) < 1e-9 ? 'eq' : a < BLEN - 1e-9 ? 'mid' : 'ge'] = 1; } upd(); if (o.onSettle) o.onSettle(a, cut(A, a).length); };
    S.count = function () { return cut(A, a).length; }; S.alg = function () { return countAlg(A, a); };
    upd(); return S;
  }

  var steps = [
    /* 1. 預測＋圓規 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc;
      P.choice(st, api, { id: 'ts-p1', predict: true, label: '先猜猜看', prompt: '△ABC 中，<b>A ＝ 30°</b>、<b>b ＝ 10</b>。如果 <b>a ＝ 7</b>，能做出幾個不同的三角形？', row: true, options: [{ t: '0 個' }, { t: '1 個' }, { ok: true, t: '2 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉動 a，數圓和射線有幾個交點'); } });
      st.append(P.instr('以 <b>C</b> 為圓心、<b>a</b> 為半徑畫圓（圓規）。圓和 A 出發的那條<b>射線</b>的交點就是 <b>B</b>。拉動 <b>a</b>，數數有幾個交點。'));
      sc = scene(st, { A: 30, a: 4, gate: gate, onChange: function (a, n) {
        if (gate.on) return; seen[n] = 1; if (seen[0] && seen[1] && seen[2] && !done) {
          done = true; P.track('aha', { id: 'trig-sine-cases', step: 1 }); if (api.ctx.p1 === 2) P.toast('你猜對了：a ＝ 7 有 2 個三角形');
          st.append(P.ruleBox('圓太小碰不到射線：<b>0 個</b>。剛好碰到（相切）：<b>1 個</b>，而且是<b>直角</b>。穿過射線：<b>2 個</b>，兩個 B 角加起來是 <b>180°</b>（B₁ ＋ B₂ ＝ 180°）。圓很大時，只剩<b>1 個</b>。', '圓規'));
          api.unlock('0 個、1 個、2 個都看到了');
        }
      } });
      api.solve(function () { gate.on = false;[4, 5, 7, 12].forEach(function (v) { sc.set(v); }); }, false, 'a ＝ 7 時有 2 個三角形（圓穿過射線，有兩個交點 B₁、B₂）');
      st.append(P.hint('a 拉到很小、剛好碰到、穿過去、很大，每種都數數。')); api.lock('先做上面的預測');
    },
    /* 2. 四種情形 */
    function (st, api) {
      var done = false, sc;
      st.append(P.instr('A ＝ 30°、b ＝ 10 時，<b>h ＝ b·sin A ＝ 5</b>（C 到射線的距離）。把 <b>a</b> 拉到每一段，看交點個數。四個標籤都亮起來就完成。'));
      sc = scene(st, { A: 30, a: 2, regions: true, onChange: function (a, n, S) {
        if (S.seen.lt && S.seen.eq && S.seen.mid && S.seen.ge && !done) {
          done = true; P.track('aha', { id: 'trig-sine-cases', step: 2 });
          st.append(P.ruleBox('A 是<b>銳角</b>時，比 a 和兩個刻度 <b>h ＝ b sin A</b>、<b>b</b>：<br>a ＜ h：<b>0 個</b>；a ＝ h：<b>1 個</b>（直角三角形）；h ＜ a ＜ b：<b>2 個</b>；a ≥ b：<b>1 個</b>。<br>a ＝ b 時 B₁ 會落在 A 上（退成一個點），所以只有 <b>1 個</b>。', '四種情形'));
          api.unlock('h 和 b 兩個刻度分出四種情形');
        }
      } });
      api.solve(function () { [3, 5, 7, 10].forEach(function (v) { sc.set(v); }); }, false, 'a ＜ 5：0 個；a ＝ 5：1 個；5 ＜ a ＜ 10：2 個；a ≥ 10：1 個');
      st.append(P.hint('a ＝ 5 和 a ＝ 10 是兩個分界，各看一次。')); api.lock('四種情形都看過');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, A, ok(a, n), answer, ans, msg, rule, hint（放開滑桿才算數） */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { A: cfg.A, a: cfg.a0, sm: true, onSettle: function (a, n) { if (cfg.ok(a, n) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '解的個數')); done(); } } });
          setSolve(function () { sc.set(cfg.answer); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '<b>A ＝ 30°、b ＝ 10</b>。拉動 <b>a</b>，讓圓<b>剛好碰到</b>射線（只有 1 個三角形，而且是<b>直角三角形</b>）。', A: 30, a0: 2, ok: function (a, n) { return a === 5; }, answer: 5, ans: 'a ＝ 5（剛好等於 h ＝ b·sin A ＝ 5，B 是直角）', msg: 'a ＝ 5：剛好相切，直角三角形', rule: 'a ＝ h ＝ b sin A ＝ 10 × 1/2 ＝ 5 時，圓和射線只碰一點，CB 垂直射線，B ＝ 90°。', hint: 'C 到射線的距離 h 是多少？' }),
        task({ prompt: '<b>A ＝ 30°、b ＝ 10</b>。拉動 <b>a</b>，讓能做出<b>兩個</b>不同的三角形。', A: 30, a0: 2, ok: function (a, n) { return n === 2; }, answer: 7, ans: 'a 在 5 和 10 之間（例如 a ＝ 6、7、8、9）', msg: '5 ＜ a ＜ 10：2 個三角形', rule: 'h ＜ a ＜ b，也就是 5 ＜ a ＜ 10，圓穿過射線，B₁、B₂ 兩個交點都在 A 的右邊，所以有 2 個三角形。', hint: 'a 要比 h 大，又要比 b 小。' }),
        task({ prompt: '這次 <b>A ＝ 140°</b>（鈍角）、<b>b ＝ 10</b>。拉動 <b>a</b>，讓能做出三角形（1 個）。', A: 140, a0: 2, ok: function (a, n) { return n === 1; }, answer: 11, ans: 'a ＞ 10（A 是鈍角時，a ＞ b 才有 1 個三角形，沒有 2 個的情形）', msg: 'A 是鈍角：a ＞ b 才有 1 個', rule: 'A 是鈍角時，三角形不可能再有第二個鈍角，所以<b>最多 1 個</b>：a ≤ b 時是 0 個，a ＞ b 時是 1 個。', hint: '鈍角 A 對的邊 a 要比 b 大還是小？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-sine-cases' }); } });
    },
    /* 完成 */
    function (st) {
      P.complete(st, {
        id: 'trig-sine-cases', moduleName: '正弦定理：三角形解的個數', askAbout: '正弦定理與解的個數', aha: '已知兩邊和其中一邊的對角（SSA），三角形可能 <b>0、1、2 個</b>。A 銳角時，用 <b>h ＝ b sin A</b> 和 <b>b</b> 兩個刻度分成四種；A 鈍角最多 1 個。',
        cards: [{ text: 'A 銳角：a ＜ b sin A 無解；a ＝ b sin A 一解；b sin A ＜ a ＜ b 兩解；a ≥ b 一解。A 直角或鈍角：a ≤ b 無解，a ＞ b 一解', src: '高中：正弦定理的解的個數' }, { text: '兩解時 B₁ ＋ B₂ ＝ 180°，要檢查 A ＋ B ＜ 180°', src: '正弦定理 sin B ＝ b sin A ÷ a' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '三角形面積公式<br>正餘弦定理綜合' }, { at: 0.85, label: '測量與應用題' }] },
        teasers: [{ title: '正餘弦定理的綜合', q: '已知兩邊與一對角，用餘弦定理也能解 c：c² − 2bc cos A ＋ b² − a² ＝ 0，判別式和幾個解有什麼關係？', where: 'S102 第 18～22 堂（2026 年 5～6 月）：CH4 三角函數', lv: 'L3' }],
        parent: { pitfall: '孩子常只算出一個 B（sin⁻¹ 的那個），忘了還有 180° − B；也常在 A 是鈍角時還討論兩解，或把 a ＝ b 判成兩解。', place: '高中正弦定理，解三角形的基礎。', ask: ['A ＝ 30°、b ＝ 10，a 是多少時剛好一個三角形、而且是直角三角形？', 'A 是鈍角時，最多有幾個三角形？為什麼？', 'a ＝ b 時為什麼只有一個三角形？'] },
        classes: ['S102（第 18～22 堂，2026 年 5～6 月）：CH4 三角函數', 'S111（第 1～8 堂）：CH1 三角函數 II'], next: { href: 'play.html', text: '回獵豹玩中學，看其他單元' } });
    }];
  new P.Lesson({ id: 'trig-sine-cases', title: '正弦定理：三角形解的個數', steps: steps });
})();
