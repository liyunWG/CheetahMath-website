/* 獵豹玩中學｜二次不等式（二）：判別式的三種情形
   預測＋拉 k 滑桿讓 y＝x²−4x＋k 上下平移，看和 x 軸有 2 個、1 個、0 個交點（D＞0、＝0、＜0）→ 加上「翻面」→ 3 個操作關卡。
   要擊中的迷思：D＝0 時漏掉「x≠α」或誤判成無解、D＜0 時分不清是「全部實數」還是「無解」。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, f = PF.fmt;
  function plane(host, sm) { return PF.plane(host, { x0: -1.5, x1: 5.5, y0: -6, y1: 8, hh: 8, tx: 1, ty: 2, sm: sm }); }
  /* f(x) ＝ s(x² − 4x ＋ k)，D ＝ 16 − 4k（與 s 無關） */
  function F(s, k) { return function (x) { return s * (x * x - 4 * x + k); }; }
  function disc(k) { return 16 - 4 * k; }
  function rootsTxt(k) { var d = disc(k); if (d < 0) return null; var r = Math.sqrt(d) / 2, a = 2 - r, b = 2 + r; return d === 0 ? [2] : [a, b]; }
  function rf(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? f(Math.round(v)) : '約 ' + f(Math.round(v * 100) / 100); }
  /* 解集合文字：s(x² − 4x ＋ k) ⊲ 0（op 是 ＞、＜、≥、≤） */
  function solText(s, k, op) {
    var d = disc(k), up = s > 0, strict = op === '＞' || op === '＜', wantPos = (op === '＞' || op === '≥');
    var pos = up ? wantPos : !wantPos;   /* 要的是「x² − 4x ＋ k」的正側(true) 或負側(false) */
    if (d < 0) { var sgn = up ? 1 : -1; var allTrue = (op === '＞' || op === '≥') ? sgn > 0 : sgn < 0; return allTrue ? '全部實數' : '無解'; }
    var r = rootsTxt(k);
    if (d === 0) {
      if (pos) return strict ? 'x ≠ 2（除了 2 以外的實數）' : '全部實數';
      return strict ? '無解' : 'x ＝ 2';
    }
    var a = rf(r[0]), b = rf(r[1]), c1 = strict ? '＜' : '≤', c2 = strict ? '＞' : '≥';
    return pos ? ('x ' + c1 + ' ' + a + ' 或 x ' + c2 + ' ' + b) : (a + ' ' + c1 + ' x ' + c1 + ' ' + b);
  }
  function holds(s, k, op, x) { var v = F(s, k)(x); return op === '＞' ? v > 1e-9 : op === '＜' ? v < -1e-9 : op === '≥' ? v >= -1e-9 : v <= 1e-9; }
  function eqName(s, k) { return (s > 0 ? 'x² − 4x ＋ ' : '−x² ＋ 4x − ') + k; }

  /* 畫面：曲線＋與 x 軸的交點。o: s, k 的初值、ops（要顯示哪幾個不等式的解） */
  function scene(host, o) {
    var pl = plane(host, o.sm), b = pl.b, ay = pl.Y(0), s = o.s, k = o.k, cur = pl.curve('pl-line pl-line--blue'), gd = pl.guides({ max: 3 }), gR = h('g'); pl.gA.append(gR);
    var pD = P.pill('', 'is-amber'); host.append(h('div', { class: 'pl-readout' }, pD));
    var rows = (o.ops || ['＞', '＜']).map(function (op) { var p = P.pill('', 'is-green'); p.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, p)); return { op: op, p: p }; });
    var S = { get: function () { return { s: s, k: k }; } };
    function upd() {
      cur.set(F(s, k)); gR.innerHTML = '';
      var d = disc(k), r = rootsTxt(k); if (r) (d === 0 ? [r[0], r[0]] : r).forEach(function (v) { gR.append(b.dot([pl.X(v), ay], 'pl-dot pl-dot--pink', null, 0.22)); });   /* D ＝ 0：兩個根重合，畫兩個疊在一起的點 */
      /* 讀值虛線：根（交點）在下緣、頂點高度與 x ＝ 0 的高度（＝ ±k）在左緣 */
      gd.set([{ x: 2, y: s * (k - 4), cls: 'blue' }, { x: 0, y: s * k, cls: 'amber' }].concat(r ? (d === 0 ? [r[0]] : r).map(function (v) { return { x: v, y: 0, cls: 'pink', ax: 'x' }; }) : []));
      pD.textContent = 'D ＝ 16 − 4k ＝ ' + f(d) + (d > 0 ? '（和 x 軸有 2 個交點）' : d === 0 ? '（剛好碰到 x 軸 1 個點）' : '（碰不到 x 軸）'); pD.className = 'pl-pill ' + (d > 0 ? 'is-green' : d === 0 ? 'is-blue' : 'is-pink');
      rows.forEach(function (r2) { r2.p.textContent = eqName(s, k) + ' ' + r2.op + ' 0：' + solText(s, k, r2.op); });
      if (o.onChange) o.onChange(s, k);
    }
    S.set = function (ns, nk) { s = ns; k = nk; upd(); };
    S.upd = upd; S.pl = pl; upd(); return S;
  }

  var steps = [
    /* 1. 預測＋拉 k */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, k = 3, sc;
      P.choice(st, api, { id: 'qd-p1', predict: true, label: '先猜猜看', prompt: '<b>x² − 4x ＋ 5 ＞ 0</b> 的解是什麼？', row: true, options: [{ ok: true, t: '全部實數' }, { t: 'x ＞ 5' }, { t: '無解' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉 k，看拋物線和 x 軸的關係'); } });
      st.append(P.instr('拉動滑桿改變 <b>k</b>，拋物線 <b>y ＝ x² − 4x ＋ k</b> 會上下平移。看它和 x 軸有幾個交點，以及「＞ 0」「＜ 0」的解怎麼變。'));
      sc = scene(st, { s: 1, k: 3, onChange: function (s, kk) {
        if (gate.on) return; var d = disc(kk); seen[d > 0 ? 'pos' : d === 0 ? 'zero' : 'neg'] = 1;
        if (seen.pos && seen.zero && seen.neg && !done) {
          done = true; P.track('aha', { id: 'quad-ineq-disc', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：k ＝ 5 時拋物線整條在 x 軸上方');
          st.append(P.ruleBox('<b>D ＞ 0</b>：和 x 軸有 2 個交點，解是「兩邊」或「中間」。<br><b>D ＝ 0</b>：剛好碰到一點（頂點在 x 軸上），＞ 0 的解是 <b>x ≠ 2</b>，＜ 0 <b>無解</b>。<br><b>D ＜ 0</b>：碰不到 x 軸，整條在上方：＞ 0 是<b>全部實數</b>，＜ 0 <b>無解</b>。', '三種情形'));
          api.unlock('D 管交點的個數');
        }
      } });
      var sl = P.slider(0, 8, 3, function (v) { if (gate.on) { P.toast('先做上面的預測'); sl.value = 3; return; } sc.set(1, v); }, 1);
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← k ＝ 0'), h('span', {}, 'k ＝ 8 →')));
      api.solve(function () { gate.on = false;[3, 4, 5].forEach(function (v) { sl.value = v; sc.set(1, v); }); });
      st.append(P.hint('k 拉到讓拋物線穿過、剛好碰到、完全離開 x 軸，每種都看看。')); api.lock('先做上面的預測');
    },
    /* 2. 翻面：開口向下 */
    function (st, api) {
      var seen = {}, done = false, sc, s = 1;
      st.append(P.instr('再多一個按鈕：把拋物線<b>上下翻面</b>。拉 <b>k</b> 並翻面，看「＞ 0」和「＜ 0」的解有什麼不同。'));
      sc = scene(st, { s: 1, k: 4, onChange: function (ss, kk) {
        s = ss; if (ss < 0 && disc(kk) < 0) seen.downNeg = 1; if (ss < 0 && disc(kk) === 0) seen.downZero = 1; if (ss > 0 && disc(kk) < 0) seen.upNeg = 1;
        if (seen.downNeg && seen.downZero && seen.upNeg && !done) {
          done = true; P.track('aha', { id: 'quad-ineq-disc', step: 2 });
          st.append(P.ruleBox('開口向<b>下</b>、D ＜ 0：整條在 x 軸<b>下方</b>，＞ 0 <b>無解</b>，＜ 0 是<b>全部實數</b>。<br>開口向<b>下</b>、D ＝ 0：只有頂點碰到 x 軸，＞ 0 <b>無解</b>，≥ 0 只有 <b>x ＝ 2</b>。<br>先看開口，再看 D。', '開口向下'));
          api.unlock('先看開口，再看 D');
        }
      }, ops: ['＞', '≥'] });
      var sl = P.slider(0, 8, 4, function (v) { var c = sc.get(); sc.set(c.s, v); }, 1);
      var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '↕ 把拋物線翻個面'); bt.addEventListener('click', function () { var c = sc.get(); sc.set(-c.s, c.k); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← k ＝ 0'), h('span', {}, 'k ＝ 8 →')), h('div', { class: 'pl-row pl-row--center' }, bt));
      api.solve(function () { sc.set(1, 5); sc.set(-1, 5); sl.value = 4; sc.set(-1, 4); });
      st.append(P.hint('翻面之後，k 拉到 5（碰不到）和 4（剛好碰到）各看一次。')); api.lock('翻面後把 k 拉到碰不到和剛好碰到');
    },
    /* 3. 操作關卡：調 k 達到指定的解集合 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, s, op, startK, ok(k)（過關條件，放開時判斷）, answer, msg, ruleTxt, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { s: cfg.s, k: cfg.startK, sm: true, ops: [cfg.op] }), sl;
          function settle() { if (cfg.ok(+sl.value) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '結果')); done(); } }
          sl = P.slider(0, 8, cfg.startK, function (v) { sc.set(cfg.s, v); }, 1); sl.addEventListener('change', settle);
          b0.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← k ＝ 0'), h('span', {}, 'k ＝ 8 →')));
          setSolve(function () { sl.value = cfg.answer; sc.set(cfg.s, cfg.answer); settle(); }, cfg.ans || cfg.msg); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '拉 <b>k</b>，讓 <b>x² − 4x ＋ k ＞ 0</b> 的解是<b>全部實數</b>。（拋物線要整條在 x 軸上方）', s: 1, op: '＞', startK: 2, ok: function (k) { return disc(k) < 0; }, answer: 6, ans: 'k ＞ 4（例如 k ＝ 5、6、7、8），這時 D ＜ 0，拋物線整條在 x 軸上方', msg: 'D ＜ 0：全部實數', rule: 'D ＜ 0，拋物線碰不到 x 軸、整條在上方，所以 ＞ 0 對<b>所有</b> x 都成立。這裡要 <b>k ＞ 4</b>。', hint: '要讓拋物線完全離開 x 軸，D 要怎麼樣？' }),
        task({ prompt: '拉 <b>k</b>，讓 <b>x² − 4x ＋ k ＞ 0</b> 的解是 <b>x ≠ 2</b>。（只有一個 x 不行）', s: 1, op: '＞', startK: 1, ok: function (k) { return k === 4; }, answer: 4, msg: 'k ＝ 4：(x − 2)² ＞ 0，x ≠ 2', rule: 'k ＝ 4 時 x² − 4x ＋ 4 ＝ (x − 2)²，頂點剛好在 x 軸上。＞ 0 只有 x ＝ 2 不行，所以是 <b>x ≠ 2</b>。', hint: '頂點要剛好落在 x 軸上，D 是多少？' }),
        task({ prompt: '拋物線<b>開口向下</b>：<b>−x² ＋ 4x − k ≥ 0</b>。拉 <b>k</b>，讓解<b>只有 x ＝ 2</b> 一個。', s: -1, op: '≥', startK: 7, ok: function (k) { return k === 4; }, answer: 4, msg: 'k ＝ 4：−(x − 2)² ≥ 0，只有 x ＝ 2', rule: 'k ＝ 4 時 −x² ＋ 4x − 4 ＝ −(x − 2)² ≤ 0，所以 ≥ 0 只剩 <b>x ＝ 2</b>（等於 0 的那一點）。', hint: '開口向下，頂點碰到 x 軸時，其他地方都在哪一側？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'quad-ineq-disc' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'quad-ineq-disc', moduleName: '二次不等式：判別式的三種情形', askAbout: '一元二次不等式與判別式', aha: '先看<b>開口</b>，再看<b>判別式 D</b>：D ＞ 0 有兩個根、D ＝ 0 頂點碰 x 軸、D ＜ 0 碰不到。<br>D ＝ 0 的「≠」和 D ＜ 0 的「全部／無解」最容易弄錯。',
        cards: [{ text: 'a ＞ 0：D ＜ 0 時 ax² ＋ bx ＋ c ＞ 0 恆成立（全部實數）；D ＝ 0 時 ＞ 0 的解是 x ≠ −b/2a；D ＞ 0 看兩根', src: '高中：一元二次不等式與判別式' }, { text: 'a ＜ 0 時整條拋物線翻到 x 軸下方：D ＜ 0 時 ＞ 0 無解、＜ 0 是全部實數', src: '一元二次不等式的恆成立' }],
        depth: { here: 0.35, cheetah: [{ at: 0.6, label: '恆成立問題<br>含參數的判別式' }, { at: 0.9, label: '二次函數與方程式根的分布<br>線性規劃' }] },
        teasers: [{ title: '恆成立問題', q: 'kx² − 2kx ＋ 3 ＞ 0 對所有實數 x 都成立，k 的範圍是什麼？', where: 'S101 2507 第 22、23 堂：多項式函數（判別式）', lv: 'L3' }, { title: '根的分布', q: 'x² − 2ax ＋ 3 ＝ 0 的兩根都大於 1，a 的範圍是什麼？', where: 'S101 2507 第 25 堂：多項式函數（二次不等式）', lv: 'L3' }],
        parent: { pitfall: '孩子常在 D ＝ 0 時，把 ＞ 0 的解寫成「全部實數」或「無解」，漏掉「除了一個點以外」；也常在開口向下時還用開口向上的結論。', place: '高中一元二次不等式與判別式，是恆成立與根的分布的基礎。', ask: ['x² − 4x ＋ 4 ＞ 0 的解是什麼？為什麼 x ＝ 2 不行？', 'x² − 4x ＋ 5 ＞ 0 為什麼對所有 x 都成立？', '−x² ＋ 4x − 4 ≥ 0 的解是什麼？'] },
        classes: ['S101（2507 第 22、23、25 堂）：多項式函數，含判別式與二次不等式', 'J91A（2507 第 14 堂）：二次函數，含判別式', 'J91S（2607 第 3 堂）：CH12 二次函數，含判別式'], next: { href: 'play-interval-notation.html', text: '下一個：函數與區間' } });
    }];
  new P.Lesson({ id: 'quad-ineq-disc', title: '二次不等式：判別式的三種情形', answers: { 1: '開口向下、D ＜ 0：＞ 0 無解、＜ 0 是全部實數；D ＝ 0：≥ 0 只有 x ＝ 2' }, steps: steps });
})();
