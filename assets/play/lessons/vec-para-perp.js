/* 獵豹玩中學｜向量（三）：平行、垂直與面積
   預測＋拖 b 看平行四邊形面積（沿著平行 a 的線滑動面積不變）→ 兩個「指示燈」：平行（x₁y₂−x₂y₁＝0）、垂直（x₁x₂＋y₁y₂＝0）→ 3 個操作關卡
   （平行、垂直、面積恰好是 6）。
   要擊中的迷思：平行條件寫成 x₁x₂＋y₁y₂＝0（那是垂直）、面積要取絕對值、平行時面積是 0（平行四邊形壓扁了）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, PV = window.PV, f = PV.f, vs = PV.vs;
  var A = [2, 1], CA = '#2f6fdc', CB = '#d6336c', CG = '#1f9d55';
  function cross(B) { return A[0] * B[1] - B[0] * A[1]; }
  function dotv(B) { return A[0] * B[0] + A[1] * B[1]; }

  /* 畫面。o: b（初值）、gate、sm、onChange(B, area)、onSettle(B)、lights（要不要顯示兩個指示燈） */
  function scene(host, o) {
    var pl = PV.plane(host, o.sm), b = pl.b, B = o.b.slice(), S = {}, LB = 1;
    var par = b.poly([[0, 0], [0, 0], [0, 0], [0, 0]], 'pl-poly pl-poly--green', pl.gC), pline = b.line([0, 0], [0, 0], 'pl-line pl-line--soft', pl.gA);
    var aa = PV.arrow(pl, CA, null, { w: 4 }), ab = PV.arrow(pl, CB, null, { w: 4 }); aa.set([0, 0], A);
    var tA = b.text([0, 0], 'a', 'pl-text pl-text--blue', pl.gC), tB = b.text([0, 0], 'b', 'pl-text pl-text--pink', pl.gC), gM = h('g'); pl.gC.append(gM);
    var pI = P.pill('', 'is-blue'), pAr = P.pill('', 'is-green'), pPa = P.pill('', 'is-amber'), pPe = P.pill('', 'is-amber'); [pI, pAr, pPa, pPe].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pI), h('div', { class: 'pl-readout' }, pAr)); if (o.lights === true || o.lights === 'par') host.append(h('div', { class: 'pl-readout' }, pPa)); if (o.lights === true || o.lights === 'perp') host.append(h('div', { class: 'pl-readout' }, pPe));   /* 關卡只顯示和題目有關的那盞燈，避免另一盞亮起時被當成答對 */
    function pts(P1) { return [[pl.X(0), pl.Y(0)], [pl.X(A[0]), pl.Y(A[1])], [pl.X(A[0] + P1[0]), pl.Y(A[1] + P1[1])], [pl.X(P1[0]), pl.Y(P1[1])]]; }
    function upd() {
      var c = cross(B), d = dotv(B), area = Math.abs(c), L = Math.hypot(B[0], B[1]), db = [B[0] / L, B[1] / L];
      b.setPoly(par, pts(B)); b.setLine(pline, [pl.X(B[0] - 4 * A[0]), pl.Y(B[1] - 4 * A[1])], [pl.X(B[0] + 4 * A[0]), pl.Y(B[1] + 4 * A[1])]); ab.set([0, 0], B);
      var LA0 = Math.hypot(A[0], A[1]), nine = d === 0 ? [0.93 * (A[0] / LA0 + db[0]), 0.93 * (A[1] / LA0 + db[1]), 0.7, 0.4] : [99, 99], aPl = PV.place(pl, [0, 0], A, [A, B, [0, 0], nine], 0.6), bPl = PV.place(pl, [0, 0], B, [A, B, aPl.m, [0, 0], nine], 0.6); b.setText(tA, aPl.b, 'a'); b.setText(tB, bPl.b, 'b'); gM.innerHTML = '';
      if (d === 0) { var ua = [A[0] / Math.hypot(A[0], A[1]), A[1] / Math.hypot(A[0], A[1])], s = 0.45; gM.append(h('polyline', { points: b.pts([[pl.X(s * ua[0]), pl.Y(s * ua[1])], [pl.X(s * ua[0] + s * db[0]), pl.Y(s * ua[1] + s * db[1])], [pl.X(s * db[0]), pl.Y(s * db[1])]]), class: 'pl-right' })); b.text([pl.X(1.3 * (ua[0] + db[0]) / 1.4), pl.Y(1.3 * (ua[1] + db[1]) / 1.4) - 0.15], '90°', 'pl-text pl-text--sm pl-text--amber', gM); }
      pI.textContent = 'a ＝ (2, 1)，b ＝ ' + vs(B[0], B[1]);
      pAr.textContent = '面積 ＝ |x₁y₂ − x₂y₁| ＝ |2·(' + f(B[1]) + ') − (' + f(B[0]) + ')·1| ＝ ' + f(area) + (area === 0 ? '（壓扁了）' : ''); pAr.className = 'pl-pill ' + (o.target !== undefined && area === o.target ? 'is-ok' : 'is-green');
      pPa.textContent = '平行燈：x₁y₂ − x₂y₁ ＝ ' + f(c) + (c === 0 ? '　💡 平行！' : ''); pPa.className = 'pl-pill ' + (c === 0 ? 'is-ok' : 'is-amber');
      pPe.textContent = '垂直燈：x₁x₂ ＋ y₁y₂ ＝ ' + f(d) + (d === 0 ? '　💡 垂直！' : ''); pPe.className = 'pl-pill ' + (d === 0 ? 'is-ok' : 'is-amber');
      if (o.onChange) o.onChange(B, area, c, d);
    }
    var cands = PV.lattice(pl, o.xr || [-4, 4], o.yr || [-3, 3]);
    var hd = b.handle({ r: 0.3, pos: [pl.X(B[0]), pl.Y(B[1])], candidates: cands, disabled: function () { return !!(o.gate && o.gate.on); }, onMove: function (t) { B = [Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))]; upd(); }, onEnd: function (t) { B = [Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))]; upd(); if (o.onSettle) o.onSettle(B, pl); } });
    S.setB = function (x, y) { hd.moveTo([pl.X(x), pl.Y(y)]); }; S.pl = pl; upd(); return S;
  }

  var steps = [
    /* 1. 預測＋面積 */
    function (st, api) {
      var gate = { on: true }, seen = {}, zero = false, done = false, sc;
      P.choice(st, api, { id: 'vp-p1', predict: true, label: '先猜猜看', prompt: 'a、b 張出一個平行四邊形（綠色）。把 b 的終點<b>沿著和 a 平行的線</b>（灰色虛線）滑動，面積會…？', row: true, options: [{ t: '變大' }, { ok: true, t: '不變' }, { t: '變小' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 b，看面積'); } });
      st.append(P.instr('a ＝ (2, 1) 固定。拖動 <b>b</b> 的終點，看平行四邊形的<b>面積</b>。灰色虛線是「過 b 的終點、和 a 平行」的線。'));
      sc = scene(st, { b: [1, 2], gate: gate, onChange: function (B, area, c) {
        if (gate.on) return; var k = Math.abs(c); (seen[k] = seen[k] || {})[B.join()] = 1; if (c === 0) zero = true;
        var same = Object.keys(seen).some(function (kk) { return Number(kk) !== 0 && Object.keys(seen[kk]).length >= 2; });
        if (same && zero && !done) {
          done = true; P.track('aha', { id: 'vec-para-perp', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：面積不變');
          st.append(P.ruleBox('平行四邊形面積 ＝ <b>底 × 高</b>。b 沿著和 a 平行的線滑動，<b>底（a）和高都沒變</b>，所以面積不變。<br>面積公式：<b>|x₁y₂ − x₂y₁|</b>。b 和 a 在同一條線上時，高是 0，平行四邊形<b>壓扁</b>，面積 ＝ 0——這就是<b>平行</b>的條件。', '面積'));
          api.unlock('面積 ＝ |x₁y₂ − x₂y₁|');
        }
      } });
      api.solve(function () { gate.on = false; sc.setB(1, 2); sc.setB(-1, 1); sc.setB(3, 3); sc.setB(4, 2); }, false, '沿著和 a 平行的線滑動，面積不變（底和高都沒變）；b 和 a 平行時面積 ＝ 0');
      st.append(P.hint('b 沿著灰色虛線滑幾個位置，再拖到 a 的那條線上。')); api.lock('先做上面的預測');
    },
    /* 2. 指示燈 */
    function (st, api) {
      var seen = {}, done = false, sc;
      st.append(P.instr('下面有兩盞「指示燈」：<b>平行燈</b>（x₁y₂ − x₂y₁）和<b>垂直燈</b>（x₁x₂ ＋ y₁y₂）。拖動 <b>b</b>，把兩盞燈各點亮一次。'));
      sc = scene(st, { b: [1, 2], lights: true, onChange: function (B, area, c, d) {
        if (c === 0) seen.par = 1; if (d === 0) seen.perp = 1;
        if (seen.par && seen.perp && !done) {
          done = true; P.track('aha', { id: 'vec-para-perp', step: 2 });
          st.append(P.ruleBox('<b>平行</b>：<b>x₁y₂ − x₂y₁ ＝ 0</b>（平行四邊形壓扁，面積 0）。<br><b>垂直</b>：<b>x₁x₂ ＋ y₁y₂ ＝ 0</b>（內積 0，畫面出現直角符號）。<br>兩個條件<b>不一樣</b>：一個是座標交叉相乘相減，一個是對應相乘相加。', '平行與垂直'));
          api.unlock('平行用交叉、垂直用內積');
        }
      } });
      api.solve(function () { sc.setB(4, 2); sc.setB(-1, 2); }, false, '平行：x₁y₂ − x₂y₁ ＝ 0（例如 b ＝ (4, 2)）；垂直：x₁x₂ ＋ y₁y₂ ＝ 0（例如 b ＝ (−1, 2)）');
      st.append(P.hint('哪些 b 會讓平行燈亮？哪些讓垂直燈亮？')); api.lock('把兩盞燈各點亮一次');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc = scene(b0, { b: [1, 2], sm: true, lights: cfg.lights || false, target: cfg.target, onSettle: function (B, pl) { if (cfg.ok(B) && !fin) { fin = true; pl.b.goalMark([pl.X(B[0]), pl.Y(B[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '算一算')); done(); } } });
          setSolve(function () { sc.setB(cfg.ansB[0], cfg.ansB[1]); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '拖動 <b>b</b>，讓 <b>b ∥ a</b>（平行，b 不能是零向量）。', lights: 'par', ok: function (B) { return cross(B) === 0; }, ansB: [4, 2], ans: 'b ＝ (4, 2)（或 (2, 1)、(−2, −1)、(−4, −2)）：x₁y₂ − x₂y₁ ＝ 2×2 − 4×1 ＝ 0', msg: 'b ∥ a：x₁y₂ − x₂y₁ ＝ 0', rule: '平行：2·y − x·1 ＝ 0，也就是 x ＝ 2y。b ＝ (4, 2)、(2, 1)、(−2, −1)… 都在 a 的那條線上，平行四邊形壓扁成一條線。', hint: '平行四邊形壓扁，面積是多少？' }),
        task({ prompt: '拖動 <b>b</b>，讓 <b>b ⊥ a</b>（垂直）。', lights: 'perp', ok: function (B) { return dotv(B) === 0; }, ansB: [-1, 2], ans: 'b ＝ (−1, 2) 或 (1, −2)：x₁x₂ ＋ y₁y₂ ＝ 2×(−1) ＋ 1×2 ＝ 0', msg: 'b ⊥ a：x₁x₂ ＋ y₁y₂ ＝ 0', rule: '垂直：2x ＋ y ＝ 0。b ＝ (−1, 2)：2×(−1) ＋ 1×2 ＝ 0；畫面上 a 和 b 之間出現直角符號。', hint: '垂直要內積是 0，x、y 要一正一負。' }),
        task({ prompt: '拖動 <b>b</b>，讓平行四邊形的<b>面積剛好是 6</b>。', target: 6, ok: function (B) { return Math.abs(cross(B)) === 6; }, ansB: [0, 3], ans: '例如 b ＝ (0, 3)（面積 ＝ |2×3 − 0×1| ＝ 6），也可以是 (0, −3)、(−2, 2)、(4, −1) 等', msg: '面積 ＝ 6', rule: '面積 ＝ |2y − x| ＝ 6。b ＝ (0, 3)：|2×3 − 0| ＝ 6。b 沿著和 a 平行的線滑動，面積都一樣。', hint: '面積 ＝ |2y − x|，哪些 (x, y) 讓它等於 6？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'vec-para-perp' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'vec-para-perp', moduleName: '向量的平行、垂直與面積', askAbout: '向量的平行、垂直與面積', aha: '<b>平行</b>：x₁y₂ − x₂y₁ ＝ 0；<b>垂直</b>：x₁x₂ ＋ y₁y₂ ＝ 0。<br>平行四邊形面積 ＝ <b>|x₁y₂ − x₂y₁|</b>：b 沿著平行 a 的線滑動，面積不變；平行時面積 ＝ 0。',
        cards: [{ text: 'a ∥ b ⇔ x₁y₂ − x₂y₁ ＝ 0；a ⊥ b ⇔ x₁x₂ ＋ y₁y₂ ＝ 0；平行四邊形面積 ＝ |x₁y₂ − x₂y₁|', src: '高中：平面向量的平行、垂直與面積' }, { text: '三角形面積 ＝ ½|x₁y₂ − x₂y₁|', src: '向量面積公式' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '三角形面積與行列式<br>向量的外積' }, { at: 0.85, label: '向量與幾何證明' }] },
        teasers: [{ title: '三角形的面積', q: 'A(0,0)、B(3,1)、C(1,4)，三角形面積怎麼用向量一行算出來？', where: 'S111 CH2 指對數函數 07＋平面向量（2025 年 11 月，第 16 堂）', lv: 'L2' }],
        parent: { pitfall: '孩子常把平行條件寫成 x₁x₂ ＋ y₁y₂ ＝ 0（那是垂直）；面積忘了取絕對值；不知道平行時面積是 0。', place: '高中平面向量的最後一塊：判斷平行、垂直與求面積。', ask: ['(2, 1) 和 (4, 2) 平行嗎？怎麼算？', '(2, 1) 和 (−1, 2) 垂直嗎？怎麼算？', '平行四邊形的面積為什麼是 |x₁y₂ − x₂y₁|？'] },
        classes: ['S111（第 16 堂，2025 年 11 月）：CH2 指對數函數 07＋平面向量'], next: { href: 'play.html', text: '回獵豹玩中學，看其他單元' } });
    }];
  new P.Lesson({ id: 'vec-para-perp', title: '向量的平行、垂直與面積', steps: steps });
})();
