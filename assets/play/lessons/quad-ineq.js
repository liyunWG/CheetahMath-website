/* 獵豹玩中學｜二次不等式（一）：拋物線在 x 軸的上方還是下方
   預測＋拖 T 看拋物線在 x 軸上方（＞0）或下方（＜0）→ 把拋物線翻個面看解集合跟著翻 → 3 個操作關卡（在數線上塗出解集合）。
   要擊中的迷思：背「大於取兩邊、小於取中間」不知道為什麼、開口向下時口訣整個反過來、≥ 和 ＞ 差在兩個根要不要塗。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  var R1 = 2, R2 = 3;   /* x² − 5x ＋ 6 ＝ (x − 2)(x − 3) */
  function g(s) { return function (x) { return s * (x * x - 5 * x + 6); }; }
  function plane(host, sm) { return PF.plane(host, { x0: -0.7, x1: 5.7, y0: -7, y1: 7, hh: 8, tx: 1, ty: 2, sm: sm }); }
  function sign(v) { return Math.abs(v) < 1e-9 ? 0 : v > 0 ? 1 : -1; }
  function eqStr(s) { return s > 0 ? 'x² − 5x ＋ 6' : '−x² ＋ 5x − 6'; }

  /* 解集合畫在 x 軸上：左段 L、點 R1、中段 M、點 R2、右段 R。painted 是目前塗了哪些（1/0）。 */
  var ITEMS = ['L', 'p1', 'M', 'p2', 'R'], REP = { L: 1, p1: R1, M: 2.5, p2: R2, R: 4 };
  function truth(s, op) { var t = {}; ITEMS.forEach(function (k) { var v = sign(g(s)(REP[k])); t[k] = op === '＞' ? v > 0 : op === '＜' ? v < 0 : op === '≥' ? v >= 0 : v <= 0; }); return t; }
  function axisSets(pl, layer, painted, clickable, onClick) {
    var b = pl.b, ay = pl.Y(0), x0 = pl.X(0), x1 = pl.X(5), xa = pl.X(R1), xb = pl.X(R2), els = {};
    layer.innerHTML = '';
    var bands = { L: [x0, xa], M: [xa, xb], R: [xb, x1] };
    ['L', 'M', 'R'].forEach(function (k) {
      var r = h('rect', { x: bands[k][0] + 0.05, y: b.Y(ay) - 0.3, width: bands[k][1] - bands[k][0] - 0.1, height: 0.6, rx: 0.2 }); els[k] = r; layer.append(r);
    });
    ['p1', 'p2'].forEach(function (k) { var c = h('circle', { cx: k === 'p1' ? xa : xb, cy: b.Y(ay), r: 0.3 }); els[k] = c; layer.append(c); });
    ITEMS.forEach(function (k) {
      var on = !!painted[k]; els[k].setAttribute('fill', on ? (k[0] === 'p' ? '#1f9d55' : 'rgba(31,157,85,.45)') : (k[0] === 'p' ? '#fff' : 'rgba(0,0,0,.05)')); els[k].setAttribute('stroke', on ? '#1f9d55' : '#8a94a6'); els[k].setAttribute('stroke-width', k[0] === 'p' ? 0.12 : 0.06);
      if (clickable) { els[k].style.cursor = 'pointer'; els[k].addEventListener('click', function () { onClick(k); }); }
    });
    return els;
  }

  var steps = [
    /* 1. 預測＋拖 T */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, xv = 4, pl = null, gS = null, painted = { L: 1, M: 0, R: 1, p1: 0, p2: 0 };
      P.choice(st, api, { id: 'qn-p1', predict: true, label: '先猜猜看', prompt: '<b>x² − 5x ＋ 6 ＜ 0</b> 的解，畫在數線上會是什麼樣子？', row: true, options: [{ t: '中間一段' }, { t: '左右兩邊' }, { t: '只有一個點' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 T，看拋物線在 x 軸的哪一側'); } });
      st.append(P.instr('拖動 <b>T</b> 在 x 軸上走。T 正上方（或正下方）的點是拋物線 <b>y ＝ x² − 5x ＋ 6</b>。看它在 x 軸的<b>上方</b>還是<b>下方</b>。'));
      pl = plane(st); var b = pl.b, cur = pl.curve('pl-line pl-line--blue'), ay = pl.Y(0); gS = h('g'); b.gMid.insertBefore(gS, pl.gC);
      cur.set(g(1));
      var drop = b.line([pl.X(xv), ay], [pl.X(xv), pl.Y(g(1)(xv))], 'pl-line pl-line--soft', pl.gA), dot = b.dot([pl.X(xv), pl.Y(g(1)(xv))], 'pl-dot pl-dot--pink', pl.gA, 0.2), marks = h('g'); pl.gA.append(marks);
      var tT = b.text([pl.X(xv), ay + 1.25], 'T', 'pl-text pl-text--blue', pl.gA);
      var pF = P.pill('', 'is-amber'), pS = P.pill('', 'is-green'); st.append(h('div', { class: 'pl-readout' }, pF, pS));
      var cands = []; for (var v = 0; v <= 5 + 1e-9; v += 0.5) cands.push([pl.X(v), ay]);
      function upd() {
        var y = g(1)(xv), sg = sign(y); b.setLine(drop, [pl.X(xv), ay], [pl.X(xv), pl.Y(y)]); dot.setAttribute('cx', pl.X(xv)); dot.setAttribute('cy', b.Y(pl.Y(y))); b.setText(tT, [pl.X(xv), ay + (y > 0 ? -1.25 : 1.25)], 'T');
        pF.textContent = 'x ＝ ' + f(xv) + ' 時，x² − 5x ＋ 6 ＝ ' + f(y); pS.textContent = sg > 0 ? '在 x 軸上方：＞ 0' : sg < 0 ? '在 x 軸下方：＜ 0' : '在 x 軸上：＝ 0'; pS.className = 'pl-pill ' + (sg > 0 ? 'is-green' : sg < 0 ? 'is-pink' : 'is-amber');
        if (gate.on) return; var key = xv < R1 ? 'L' : xv > R2 ? 'R' : (xv > R1 && xv < R2) ? 'M' : 'z';
        if (key !== 'z' && !seen[key]) { seen[key] = 1; marks.append(b.dot([pl.X(xv), ay - 0.62], sg > 0 ? 'pl-dot pl-dot--green' : 'pl-dot pl-dot--pink', null, 0.13)); }
        if (seen.L && seen.M && seen.R && !done) {
          done = true; P.track('aha', { id: 'quad-ineq', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：＜ 0 在中間一段');
          axisSets(pl, gS, { L: 0, M: 1, R: 0, p1: 0, p2: 0 }, false);
          st.append(P.ruleBox('拋物線和 x 軸交在 <b>x ＝ 2</b> 和 <b>x ＝ 3</b>（這兩點 y ＝ 0）。<br>在 x 軸<b>下方</b>（＜ 0）的只有中間一段：<b>2 ＜ x ＜ 3</b>。<br>在 x 軸<b>上方</b>（＞ 0）的是左右兩邊：<b>x ＜ 2 或 x ＞ 3</b>。<br>「小於取中間、大於取兩邊」是<b>看圖</b>看出來的，不必背。', '看圖'));
          api.unlock('上方是 ＞ 0，下方是 ＜ 0');
        }
      }
      var hd = b.handle({ pos: [pl.X(xv), ay], candidates: cands, disabled: function () { return gate.on; }, onMove: function (t) { xv = Math.round(pl.Xi(t[0]) * 2) / 2; upd(); } });
      api.solve(function () { gate.on = false;[1, 2.5, 4].forEach(function (v) { hd.moveTo([pl.X(v), ay]); }); });
      upd(); st.append(P.hint('T 走到左邊、中間、右邊各一次，看拋物線在上方還是下方。')); api.lock('先做上面的預測');
    },
    /* 2. 翻個面 */
    function (st, api) {
      var seen = {}, done = false, s = 1, xv = 1, flipped = false;
      st.append(P.instr('按鈕把拋物線<b>上下翻個面</b>（x² 前面的符號變負）。再拖動 <b>T</b>，看「＞ 0」和「＜ 0」的位置有沒有跟著換。'));
      var pl = plane(st), b = pl.b, cur = pl.curve('pl-line pl-line--blue'), ay = pl.Y(0), title = b.text([3.2, 7.45], '', 'pl-text pl-text--blue', pl.gA);
      var drop = b.line([pl.X(xv), ay], [pl.X(xv), pl.Y(g(1)(xv))], 'pl-line pl-line--soft', pl.gA), dot = b.dot([pl.X(xv), pl.Y(g(1)(xv))], 'pl-dot pl-dot--pink', pl.gA, 0.2), tT = b.text([pl.X(xv), ay + 1.25], 'T', 'pl-text pl-text--blue', pl.gA);
      var pF = P.pill('', 'is-amber'), pS = P.pill('', 'is-green'); st.append(h('div', { class: 'pl-readout' }, pF, pS));
      var cands = []; for (var v = 0; v <= 5 + 1e-9; v += 0.5) cands.push([pl.X(v), ay]);
      function upd() {
        var y = g(s)(xv), sg = sign(y); cur.set(g(s)); b.setText(title, [3.2, 7.45], 'y ＝ ' + eqStr(s));
        b.setLine(drop, [pl.X(xv), ay], [pl.X(xv), pl.Y(y)]); dot.setAttribute('cx', pl.X(xv)); dot.setAttribute('cy', b.Y(pl.Y(y))); b.setText(tT, [pl.X(xv), ay + (y > 0 ? -1.25 : 1.25)], 'T');
        pF.textContent = 'x ＝ ' + f(xv) + ' 時，y ＝ ' + f(y); pS.textContent = sg > 0 ? '在 x 軸上方：＞ 0' : sg < 0 ? '在 x 軸下方：＜ 0' : '在 x 軸上：＝ 0'; pS.className = 'pl-pill ' + (sg > 0 ? 'is-green' : sg < 0 ? 'is-pink' : 'is-amber');
        if (s < 0) { seen.flip = 1; if (xv > R1 && xv < R2 && sg > 0) seen.midPos = 1; if ((xv < R1 || xv > R2) && sg < 0) seen.outNeg = 1; }
        if (seen.flip && seen.midPos && seen.outNeg && !done) {
          done = true; P.track('aha', { id: 'quad-ineq', step: 2 });
          st.append(P.ruleBox('開口<b>向下</b>時整個反過來：<br><b>＞ 0</b> 的是<b>中間</b>一段（2 ＜ x ＜ 3），<b>＜ 0</b> 的是<b>兩邊</b>。<br>所以「大於取兩邊」只對<b>開口向上</b>成立，要先看圖。兩個根永遠是分界點。', '開口向下'));
          api.unlock('開口向下就反過來');
        }
      }
      var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '↕ 把拋物線翻個面'); bt.addEventListener('click', function () { s = -s; upd(); });
      var hd = b.handle({ pos: [pl.X(xv), ay], candidates: cands, onMove: function (t) { xv = Math.round(pl.Xi(t[0]) * 2) / 2; upd(); } });
      st.append(h('div', { class: 'pl-row pl-row--center' }, bt));
      api.solve(function () { s = -1; upd(); hd.moveTo([pl.X(2.5), ay]); hd.moveTo([pl.X(1), ay]); });
      upd(); st.append(P.hint('翻面之後，T 在中間、在兩邊，上下方各是什麼？')); api.lock('翻面後把 T 拖到中間和兩邊');
    },
    /* 3. 操作關卡：在數線上塗出解集合 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var pl = plane(b0, true), b = pl.b, painted = {}, fin = false, T = truth(cfg.s, cfg.op), gS = h('g'), pO = P.pill('', 'is-blue');
          b.gMid.append(gS); pl.curve('pl-line pl-line--blue').set(g(cfg.s)); b0.append(h('div', { class: 'pl-readout' }, pO));
          pO.textContent = cfg.label; var fb = h('div', { class: 'pl-fb' });
          function redraw() {
            axisSets(pl, gS, painted, true, function (k) { if (fin) return; painted[k] = painted[k] ? 0 : 1; redraw(); check(); });
          }
          function check() {
            var ok = ITEMS.every(function (k) { return !!painted[k] === T[k]; });
            pO.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-blue');
            if (ok && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '解集合')); done(); }
          }
          redraw(); b0.append(P.hint('點一下數線上的線段或圓點來塗色（塗色＝這裡的 x 讓不等式成立）。空心圓＝不含，實心圓＝包含。'));
          setSolve(function () { ITEMS.forEach(function (k) { painted[k] = T[k] ? 1 : 0; }); redraw(); check(); });
        };
      }
      var tasks = [
        task({ prompt: '看圖，在數線上塗出 <b>x² − 5x ＋ 6 ＜ 0</b> 的解。', s: 1, op: '＜', label: 'x² − 5x ＋ 6 ＜ 0', msg: '解：2 ＜ x ＜ 3', rule: '拋物線在 x 軸<b>下方</b>的只有中間一段，而且<b>不含</b>兩個根（＜ 是嚴格小於，所以 2 和 3 是空心圓）。' }),
        task({ prompt: '看圖，在數線上塗出 <b>x² − 5x ＋ 6 ≥ 0</b> 的解。', s: 1, op: '≥', label: 'x² − 5x ＋ 6 ≥ 0', msg: '解：x ≤ 2 或 x ≥ 3', rule: '＞ 0 的是左右兩邊；加上「＝」，兩個根（y ＝ 0 的地方）也要塗成<b>實心圓</b>：<b>x ≤ 2 或 x ≥ 3</b>。' }),
        task({ prompt: '拋物線翻面了。看圖，在數線上塗出 <b>−x² ＋ 5x − 6 ＞ 0</b> 的解。', s: -1, op: '＞', label: '−x² ＋ 5x − 6 ＞ 0', msg: '解：2 ＜ x ＜ 3', rule: '開口向下，在 x 軸<b>上方</b>的是中間一段，不含兩個根：<b>2 ＜ x ＜ 3</b>。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'quad-ineq' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'quad-ineq', moduleName: '二次不等式：看拋物線的上方和下方', askAbout: '一元二次不等式', aha: '二次不等式的解，就是拋物線在 <b>x 軸上方</b>（＞ 0）或<b>下方</b>（＜ 0）的那些 x。<br>兩個根是分界點；開口向下時整個反過來。',
        cards: [{ text: 'a ＞ 0、兩根 α ＜ β：ax² ＋ bx ＋ c ＞ 0 的解是 x ＜ α 或 x ＞ β；＜ 0 的解是 α ＜ x ＜ β', src: '高中：一元二次不等式' }, { text: '要不要塗根：＞、＜ 不含（空心圓）；≥、≤ 包含（實心圓）', src: '一元二次不等式的解集合' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '判別式與恆成立<br>穿線法高次不等式' }, { at: 0.85, label: '分式不等式<br>含參數的二次不等式' }] },
        teasers: [{ title: '穿線法：高次不等式', q: '(x − 1)(x − 2)(x − 4) ＞ 0 的解，怎麼從左到右「穿」過去？', where: 'S101 2507 第 25 堂：多項式函數（二次不等式）', lv: 'L3' }, { title: '二次不等式的應用', q: '利潤 ＞ 0 的範圍、拋球高度 ≥ 某值的時間段，怎麼用二次不等式解？', where: 'S101 2507 第 25 堂：多項式函數', lv: 'L2' }],
        parent: { pitfall: '孩子常把口訣「大於取兩邊、小於取中間」背反，或是開口向下時還照背；也常忘了 ≥ 的兩個根要包含進來。', place: '高中一元二次不等式，是判別式、恆成立與線性規劃的基礎。', ask: ['x² − 5x ＋ 6 ＜ 0 的解，為什麼是中間一段？', '開口向下的 −x² ＋ 5x − 6 ＞ 0，解和上一題一樣嗎？為什麼？', '≥ 和 ＞ 差在哪裡？根要不要算？'] },
        classes: ['S101（2507 第 25 堂）：多項式函數，含二次不等式'], next: { href: 'play-quad-ineq-disc.html', text: '下一個：判別式與三種情形' } });
    }];
  new P.Lesson({ id: 'quad-ineq', title: '二次不等式：看拋物線的上方和下方', steps: steps });
})();
