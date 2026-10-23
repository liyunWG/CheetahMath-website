/* 獵豹玩中學｜函數與區間（一）：區間符號與定義域
   預測＋拖端點、切換實心／空心，看 [ ]、( ) 和「t 在不在區間裡」→ 用 √(x−1) 找定義域 → 3 個操作關卡（[2,5)、(−∞,3]、|x|≤2）。
   要擊中的迷思：端點要不要包含（中括號／小括號）、∞ 永遠用小括號、不等式和區間符號的互相轉換。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PN = window.PN, f = PN.fmt;
  var VMIN = -5, VMAX = 5, AY = 2.6, RE = AY + 3.3, RT = AY + 1.5, VALS = [];
  for (var q = VMIN; q <= VMAX; q++) VALS.push(q);

  function intervalStr(S) {
    var l = S.linf ? '(' : (S.lc ? '[' : '('), r = S.rinf ? ')' : (S.rc ? ']' : ')');
    return l + (S.linf ? '−∞' : f(S.a)) + ', ' + (S.rinf ? '∞' : f(S.b)) + r;
  }
  function ineqStr(S) {
    if (S.linf && S.rinf) return '全部實數';
    if (S.linf) return 'x ' + (S.rc ? '≤' : '＜') + ' ' + f(S.b);
    if (S.rinf) return 'x ' + (S.lc ? '≥' : '＞') + ' ' + f(S.a);
    return f(S.a) + ' ' + (S.lc ? '≤' : '＜') + ' x ' + (S.rc ? '≤' : '＜') + ' ' + f(S.b);
  }
  function inside(S, t) { return (S.linf || (S.lc ? t >= S.a : t > S.a)) && (S.rinf || (S.rc ? t <= S.b : t < S.b)); }
  function same(S, T) { /* 兩個區間是否相同（無限那一側不比端點） */
    return !!S.linf === !!T.linf && !!S.rinf === !!T.rinf && (S.linf || (S.a === T.a && !!S.lc === !!T.lc)) && (S.rinf || (S.b === T.b && !!S.rc === !!T.rc));
  }

  /* 畫面：數線＋可拖動的端點 a、b（上排）＋測試點 t（中排）＋實心空心按鈕＋無限按鈕。
     o: a, b, lc, rc, linf, rinf, gate, sm, withT, onChange(S)（拖動中）, onSettle(S)（放開手或按鈕時）。 */
  function scene(host, o) {
    var S = { a: o.a, b: o.b, lc: o.lc, rc: o.rc, linf: !!o.linf, rinf: !!o.rinf, t: o.t === undefined ? 0 : o.t }, api = {};
    var b = PA.board(host, 12, 7.6, o.sm ? 'pl-svg--sm' : ''), gB = h('g'), gD = h('g'); b.gMid.append(gB);
    var ax = PN.axis(b, { vmin: VMIN, vmax: VMAX, y: AY, labelGap: 1.25 }), X = ax.X; b.gMid.append(gD);
    var lA = b.line([X(S.a), AY], [X(S.a), RE - 0.5], 'pl-line pl-line--soft', gD), lB = b.line([X(S.b), AY], [X(S.b), RE - 0.5], 'pl-line pl-line--soft', gD), lT = o.withT ? b.line([X(S.t), AY], [X(S.t), RT - 0.4], 'pl-line pl-line--soft', gD) : null;
    var mA = h('circle', { r: 0.27, 'stroke-width': 0.13 }), mB = h('circle', { r: 0.27, 'stroke-width': 0.13 }); gD.append(mA, mB);
    var tA = b.text([X(S.a) - 0.7, RE], 'a', 'pl-text pl-text--green', gD), tB = b.text([X(S.b) + 0.7, RE], 'b', 'pl-text pl-text--green', gD), tT = o.withT ? b.text([X(S.t) + 0.7, RT], 't', 'pl-text pl-text--pink', gD) : null;
    var pI = P.pill('', 'is-blue'), pN = P.pill('', 'is-green'), pT = o.withT ? P.pill('', 'is-pink') : null; pI.style.fontSize = '1.2em'; pN.style.whiteSpace = 'normal';
    host.append(h('div', { class: 'pl-readout' }, pI, pN)); if (pT) host.append(h('div', { class: 'pl-readout' }, pT));
    function paint() {
      gB.innerHTML = ''; var x0 = S.linf ? X(VMIN) - 0.5 : X(S.a), x1 = S.rinf ? X(VMAX) + 0.5 : X(S.b);
      gB.append(h('rect', { x: x0, y: b.Y(AY) - 0.3, width: Math.max(0, x1 - x0), height: 0.6, fill: 'rgba(31,157,85,.38)' }));
      [[mA, S.a, S.lc, S.linf], [mB, S.b, S.rc, S.rinf]].forEach(function (m) { m[0].style.display = m[3] ? 'none' : ''; m[0].setAttribute('cx', X(m[1])); m[0].setAttribute('cy', b.Y(AY)); m[0].setAttribute('fill', m[2] ? '#1f9d55' : '#fff'); m[0].setAttribute('stroke', '#1f9d55'); });
      b.setLine(lA, [X(S.a), AY], [X(S.a), RE - 0.5]); b.setLine(lB, [X(S.b), AY], [X(S.b), RE - 0.5]); lA.style.display = S.linf ? 'none' : ''; lB.style.display = S.rinf ? 'none' : '';
      b.setText(tA, [X(S.a) - 0.7, RE]); b.setText(tB, [X(S.b) + 0.7, RE]); tA.style.display = S.linf ? 'none' : ''; tB.style.display = S.rinf ? 'none' : '';
      pI.textContent = '區間 ' + intervalStr(S); pN.textContent = '不等式 ' + ineqStr(S);
      if (o.withT) { var ok = inside(S, S.t); b.setLine(lT, [X(S.t), AY], [X(S.t), RT - 0.4]); b.setText(tT, [X(S.t) + 0.7, RT]); pT.textContent = 't ＝ ' + f(S.t) + (ok ? ' 在區間裡' : ' 不在區間裡'); pT.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-pink'); }
    }
    function chg() { paint(); if (o.onChange) o.onChange(S); }
    function settle() { if (o.onSettle) o.onSettle(S); }
    var dis = function () { return !!(o.gate && o.gate.on); };
    var hA = b.handle({ pos: [X(S.a), RE], candidates: VALS.map(function (v) { return [X(v), RE]; }), disabled: dis, valid: function (t) { return S.rinf || Math.round(ax.V(t[0])) < S.b; }, onMove: function (t) { S.a = Math.round(ax.V(t[0])); chg(); }, onEnd: function () { settle(); } });
    var hB = b.handle({ pos: [X(S.b), RE], candidates: VALS.map(function (v) { return [X(v), RE]; }), disabled: dis, valid: function (t) { return S.linf || Math.round(ax.V(t[0])) > S.a; }, onMove: function (t) { S.b = Math.round(ax.V(t[0])); chg(); }, onEnd: function () { settle(); } });
    var hT = o.withT ? b.handle({ pos: [X(S.t), RT], candidates: VALS.map(function (v) { return [X(v), RT]; }), disabled: dis, onMove: function (t) { S.t = Math.round(ax.V(t[0])); chg(); } }) : null;
    function sync() { hA.hide(S.linf); hB.hide(S.rinf); }
    /* 按鈕 */
    var row = h('div', { class: 'pl-row pl-row--center' }); row.style.flexWrap = 'wrap';
    function tog(label, fn) { var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, label); bt.addEventListener('click', function () { if (dis()) { P.toast('先做上面的預測'); return; } fn(); sync(); chg(); settle(); }); row.append(bt); return bt; }
    var bL = tog('左端點：實心／空心', function () { if (!S.linf) S.lc = !S.lc; }), bR = tog('右端點：實心／空心', function () { if (!S.rinf) S.rc = !S.rc; });
    var row2 = h('div', { class: 'pl-row pl-row--center' }); row2.style.flexWrap = 'wrap';
    function tog2(label, fn) { var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, label); bt.addEventListener('click', function () { if (dis()) { P.toast('先做上面的預測'); return; } fn(); sync(); chg(); settle(); }); row2.append(bt); return bt; }
    if (o.inf) { tog2('左邊拉到 −∞', function () { S.linf = !S.linf; }); tog2('右邊拉到 ∞', function () { S.rinf = !S.rinf; }); }
    host.append(row); if (o.inf) host.append(row2);
    api.set = function (a, z) { if (a >= S.b) { hB.moveTo([X(z), RE]); hA.moveTo([X(a), RE]); } else { hA.moveTo([X(a), RE]); hB.moveTo([X(z), RE]); } };
    api.setT = function (v) { hT.moveTo([X(v), RT]); };
    api.press = function (k) { ({ L: bL, R: bR }[k]).click(); };
    api.state = function () { return S; };
    api.inf = function (side) { var bts = row2.querySelectorAll('button'); bts[side === 'L' ? 0 : 1].click(); };
    paint(); sync();
    return api;
  }

  var steps = [
    /* 1. 預測＋端點與符號 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc;
      P.choice(st, api, { id: 'in-p1', predict: true, label: '先猜猜看', prompt: '區間 <b>[1, 4)</b>，也就是 <b>1 ≤ x ＜ 4</b>。它包含 <b>4</b> 嗎？', row: true, options: [{ t: '包含' }, { ok: true, t: '不包含' }, { t: '看情況' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把 t 放在端點上，切換實心空心'); } });
      st.append(P.instr('拖動 <b>a</b>、<b>b</b> 決定區間的兩端，再把 <b>t</b> 拖到端點上。按下面的按鈕切換<b>實心（含）</b>與<b>空心（不含）</b>，看 t 在不在區間裡。'));
      function check(S) {
        if (gate.on) return; var atEnd = (S.t === S.a && !S.linf) || (S.t === S.b && !S.rinf);
        if (atEnd) { var closed = (S.t === S.a ? S.lc : S.rc); seen[closed ? 'in' : 'out'] = 1; }
        if (seen['in'] && seen.out && !done) {
          done = true; P.track('aha', { id: 'interval-notation', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：[1, 4) 不包含 4');
          st.append(P.ruleBox('<b>實心點、中括號 [ ]</b>：包含端點（≤、≥）。<br><b>空心點、小括號 ( )</b>：不含端點（＜、＞）。<br>同一個位置，實心就在、空心就不在，差別只在端點。', '端點含不含'));
          api.unlock('實心含端點、空心不含');
        }
      }
      sc = scene(st, { a: 1, b: 4, lc: true, rc: false, t: 2, withT: true, gate: gate, onChange: check, onSettle: check });
      api.solve(function () { gate.on = false; sc.setT(4); sc.press('R'); sc.press('R'); });
      st.append(P.hint('t 放在端點上，把那一端按成實心、再按成空心，看看結果。')); api.lock('先做上面的預測');
    },
    /* 2. 定義域：√(x−1) */
    function (st, api) {
      var seen = {}, done = false, xv = -2;
      st.append(P.instr('函數 <b>f(x) ＝ √(x − 1)</b>。<b>x</b> 能代進去的值叫做<b>定義域</b>。拖動 <b>x</b> 試試看，能算（根號裡不是負的）的位置留下綠點，不能算的留下粉紅點。'));
      var b = PA.board(st, 12, 6.2), gB = h('g'), gM = h('g'); b.gMid.append(gB); var AY2 = 2.0, ax = PN.axis(b, { vmin: VMIN, vmax: VMAX, y: AY2, labelGap: 1.25 }), X = ax.X; b.gMid.append(gM);
      var tx = b.text([X(xv), AY2 + 0.95], 'x', 'pl-text pl-text--blue', gM), pV = P.pill('', 'is-amber'), pO = P.pill('', 'is-pink'); st.append(h('div', { class: 'pl-readout' }, pV, pO));
      function upd() {
        var inner = xv - 1, ok = inner >= 0; b.setText(tx, [X(xv), AY2 + 0.95], 'x'); pV.textContent = 'x − 1 ＝ ' + f(inner); pO.textContent = ok ? '根號裡 ≥ 0：能算 ✓' : '根號裡是負的：不能算 ✗'; pO.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-pink');
        if (!seen[xv]) { seen[xv] = ok ? 'y' : 'n'; gM.append(h('circle', { cx: X(xv), cy: b.Y(AY2 + 1.7), r: 0.15, fill: ok ? '#1f9d55' : '#d6336c' })); }
        if (seen[1] === 'y' && seen[0] === 'n' && seen[3] === 'y' && !done) {
          done = true; P.track('aha', { id: 'interval-notation', step: 2 });
          gB.append(h('rect', { x: X(1), y: b.Y(AY2) - 0.3, width: X(VMAX) + 0.5 - X(1), height: 0.6, fill: 'rgba(31,157,85,.38)' }), h('circle', { cx: X(1), cy: b.Y(AY2), r: 0.27, fill: '#1f9d55', stroke: '#1f9d55', 'stroke-width': 0.13 }));
          st.append(P.ruleBox('x − 1 要 <b>≥ 0</b> 才能開根號，所以 <b>x ≥ 1</b>。1 本身可以（√0 ＝ 0），所以是實心點。<br>寫成區間：<b>[1, ∞)</b>。∞ 不是一個數，沒有「到頭」，所以旁邊<b>一律用小括號</b>。', '定義域 [1, ∞)'));
          api.unlock('定義域 ＝ [1, ∞)');
        }
      }
      var hd = b.handle({ pos: [X(xv), AY2], candidates: VALS.map(function (v) { return [X(v), AY2]; }), onMove: function (t) { xv = Math.round(ax.V(t[0])); upd(); } });
      upd();
      api.solve(function () { hd.moveTo([X(0), AY2]); hd.moveTo([X(1), AY2]); hd.moveTo([X(3), AY2]); });
      st.append(P.hint('x 拖到 0、1、3 附近，看看哪些位置能算。')); api.lock('找出 x 能代的範圍');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { a: -1, b: 1, lc: true, rc: true, sm: true, inf: !!cfg.inf, onSettle: function (S) { if (same(S, cfg.target) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '區間符號')); done(); } } });
          setSolve(function () { cfg.solve(sc); }); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '用 <b>a</b>、<b>b</b> 和按鈕，調出區間 <b>[2, 5)</b>（也就是 2 ≤ x ＜ 5）。', target: { a: 2, b: 5, lc: true, rc: false }, solve: function (s) { s.set(2, 5); s.press('R'); }, msg: '[2, 5)：2 ≤ x ＜ 5', rule: '左邊是中括號（含 2，實心），右邊是小括號（不含 5，空心）。', hint: '先把兩端拖到位，再看哪一端要空心。' }),
        task({ prompt: '調出區間 <b>(−∞, 3]</b>（也就是 x ≤ 3）。左邊要拉到無限。', inf: true, target: { linf: true, b: 3, rc: true }, solve: function (s) { s.set(0, 3); s.inf('L'); }, msg: '(−∞, 3]：x ≤ 3', rule: '−∞ 這一側沒有端點，用<b>小括號</b>；3 本身包含，用<b>中括號</b>：(−∞, 3]。', hint: '無限的那一端不能「包含」。右邊的 3 要實心還是空心？' }),
        task({ prompt: '<b>|x| ≤ 2</b>：到 0 的距離不超過 2 的 x。用區間表示它。', target: { a: -2, b: 2, lc: true, rc: true }, solve: function (s) { s.set(-2, 2); }, msg: '[−2, 2]：|x| ≤ 2', rule: '|x| ≤ 2 就是 −2 ≤ x ≤ 2，兩端都包含：<b>[−2, 2]</b>。這和絕對值那一課的「到 0 的距離」是同一件事。', hint: '距離 ≤ 2，剛好等於 2 的點算不算？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'interval-notation' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'interval-notation', moduleName: '函數與區間：區間符號與定義域', askAbout: '區間符號與函數定義域', aha: '<b>實心＝中括號［ ］＝含端點</b>，<b>空心＝小括號（ ）＝不含端點</b>；∞ 不是數，旁邊<b>一律用小括號</b>。<br>定義域就是 x 能代進去的範圍。',
        cards: [{ text: '[a, b]：a ≤ x ≤ b；[a, b)：a ≤ x ＜ b；(a, ∞)：x ＞ a；(−∞, b]：x ≤ b', src: '高中：區間符號' }, { text: '定義域：x 能代入函數的所有值，例如 √(x − 1) 要 x − 1 ≥ 0，定義域 [1, ∞)', src: '高中：函數的定義域' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '值域與最大最小值<br>絕對值不等式' }, { at: 0.85, label: '分段函數<br>反函數與合成' }] },
        teasers: [{ title: '定義域與值域', q: 'f(x) ＝ √(4 − x²) 的定義域與值域各是什麼？', where: 'S101 2507 第 21 堂：多項式函數（定義域與值域）', lv: 'L2' }, { title: '區間的交集與聯集', q: '[1, 5) 和 (3, 8] 的交集、聯集各是什麼區間？', where: 'S101 2507 第 25 堂：多項式函數（區間）', lv: 'L2' }],
        parent: { pitfall: '孩子常把中括號和小括號用反；也常把 ∞ 旁邊寫成中括號。定義域的題目會忘記根號裡不能是負的、分母不能是 0。', place: '高中函數的第一步：用區間符號寫出定義域與值域。', ask: ['[1, 4) 和 (1, 4] 有什麼不同？', '為什麼 ∞ 旁邊要用小括號？', 'f(x) ＝ √(x − 1) 的 x 可以是 0 嗎？為什麼？'] },
        classes: ['S101（2507 第 21 堂）：多項式函數，含定義域與值域', 'S101（2507 第 23、25 堂）：多項式函數，含區間'], next: { href: 'play-piecewise-fn.html', text: '下一個：分段函數' } });
    }];
  new P.Lesson({ id: 'interval-notation', title: '函數與區間：區間符號與定義域', answers: { 1: '定義域是 [1, ∞)（x ≥ 1，1 是實心點，∞ 旁邊用小括號）' }, steps: steps });
})();
