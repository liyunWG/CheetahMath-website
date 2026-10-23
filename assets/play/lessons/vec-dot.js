/* 獵豹玩中學｜向量（二）：內積與投影
   預測＋拖 b 的終點看夾角 θ、內積的正負 → 看 b 在 a 上的投影（內積 ＝ |a| × 投影長）→ 3 個操作關卡
   （讓內積 ＝ 0、b 的長度固定時讓內積最大、讓投影長 ＝ 3）。
   要擊中的迷思：內積是數不是向量、a·b＝0 就是垂直（不是 a 或 b 是零）、投影長可能是負的。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PF = window.PF, PV = window.PV, f = PV.f, vs = PV.vs;
  var A = [3, 4], LA = 5, CA = '#2f6fdc', CB = '#d6336c', CP = '#d29b1f';
  function f2(v) { v = Math.round(v * 100) / 100; return (v < 0 ? '−' : '') + Math.abs(v); }
  function dotv(B) { return A[0] * B[0] + A[1] * B[1]; }

  /* 畫面。o: b（初值）、cands（b 能停的格點，預設全部格點）、showProj、gate、sm、onChange(B, d)、onSettle(B, d) */
  function scene(host, o) {
    var pl = PV.plane(host, o.sm), b = pl.b, B = o.b.slice(), S = {}, gG = h('g'); pl.gC.append(gG);
    b.line([pl.X(-1.3 * A[0]), pl.Y(-1.3 * A[1])], [pl.X(1.3 * A[0]), pl.Y(1.3 * A[1])], 'pl-line pl-line--soft', pl.gA);
    var proj = b.line([0, 0], [0, 0], 'pl-line', gG), drop = b.line([0, 0], [0, 0], 'pl-line pl-line--soft', gG); proj.style.stroke = CP; proj.style.strokeWidth = '9px'; proj.style.strokeLinecap = 'butt'; proj.style.opacity = '.55';
    var aa = PV.arrow(pl, CA, gG, { w: 4 }), ab = PV.arrow(pl, CB, gG, { w: 4 }); aa.set([0, 0], A);
    var tA = b.text([0, 0], 'a', 'pl-text pl-text--blue', pl.gC), tB = b.text([0, 0], 'b', 'pl-text pl-text--pink', pl.gC);
    var gM = h('g'); pl.gC.append(gM);
    var pA = P.pill('', 'is-blue'), pB = P.pill('', 'is-pink'), pT = P.pill('', 'is-amber'), p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-green'), pP = P.pill('', 'is-amber');
    [pA, pB, pT, p1, p2, pP].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pA, pB), h('div', { class: 'pl-readout' }, pT), h('div', { class: 'pl-readout' }, p1), h('div', { class: 'pl-readout' }, p2)); if (o.showProj) host.append(h('div', { class: 'pl-readout' }, pP));
    function upd() {
      var d = dotv(B), LB = Math.hypot(B[0], B[1]), al = Math.atan2(A[1], A[0]), be = Math.atan2(B[1], B[0]), delta = be - al; while (delta > Math.PI) delta -= 2 * Math.PI; while (delta <= -Math.PI) delta += 2 * Math.PI;
      var th = Math.round(Math.abs(delta) * 180 / Math.PI * 1e6) / 1e6, cosT = Math.cos(delta);
      ab.set([0, 0], B); gM.innerHTML = '';
      var db = [B[0] / LB, B[1] / LB]; var mid0 = al + delta / 2, isPar = Math.abs(A[0] * B[1] - A[1] * B[0]) === 0;
      var aPl = PV.place(pl, [0, 0], A, [A, B, [0, 0]], 0.6), bPl = PV.place(pl, [0, 0], B, [A, B, aPl.m, [0, 0]], 0.6), thBest = null, thD = -1e9, TW = [1.4, 0.45];
      [1.3, 1.7, 2.1, 2.5, 2.9].forEach(function (rad0) { [0, 0.25, -0.25, 0.5, -0.5, 0.9, -0.9, 1.4, -1.4].forEach(function (da) { var m = [rad0 * Math.cos(mid0 + da), rad0 * Math.sin(mid0 + da)], dd = 1e9, me = [m[0], m[1], TW[0], TW[1]]; [A, B, aPl.m, bPl.m].forEach(function (q) { dd = Math.min(dd, PV.gap(me, q)); }); dd = Math.min(dd, 0.6) - (rad0 - 1.3) * 0.05; if (m[0] < -4.6 || m[0] > 4.6 || m[1] < -3.3 || m[1] > 3.3) dd -= 5; if (dd > thD) { thD = dd; thBest = m; } }); });
      if (isPar) thBest = [0.9 * Math.cos(mid0 + 0.6), 0.9 * Math.sin(mid0 + 0.6)];
      b.setText(tA, aPl.b, 'a'); b.setText(tB, bPl.b, 'b');
      /* 角：90° 畫直角符號，其他畫圓弧，旁邊標度數 */
      var perp = d === 0, par = Math.abs(A[0] * B[1] - A[1] * B[0]) === 0;
      if (perp) { var ua = [A[0] / LA, A[1] / LA], s = 0.45; gM.append(h('polyline', { points: b.pts([[pl.X(s * ua[0]), pl.Y(s * ua[1])], [pl.X(s * ua[0] + s * db[0]), pl.Y(s * ua[1] + s * db[1])], [pl.X(s * db[0]), pl.Y(s * db[1])]]), class: 'pl-right' })); }
      else if (!par) { var r = 0.9, p0 = [pl.X(r * Math.cos(al)), b.Y(pl.Y(r * Math.sin(al)))], p1v = [pl.X(r * Math.cos(be)), b.Y(pl.Y(r * Math.sin(be)))]; gM.append(h('path', { d: 'M ' + p0[0] + ' ' + p0[1] + ' A ' + (r * 10 / 12) + ' ' + (r * 10 / 12) + ' 0 0 ' + (delta > 0 ? 0 : 1) + ' ' + p1v[0] + ' ' + p1v[1], fill: 'none', stroke: CP, 'stroke-width': 0.08 })); }
      b.text([pl.X(thBest[0]), pl.Y(thBest[1]) - 0.15], 'θ ＝ ' + f(Math.round(th)) + '°', 'pl-text pl-text--sm pl-text--amber', gM);
      /* 投影：b 落在 a 這條線上的影子 */
      var k = d / (LA * LA), F = [k * A[0], k * A[1]], pj = d / LA; b.setLine(proj, [pl.X(0), pl.Y(0)], [pl.X(F[0]), pl.Y(F[1])]); proj.style.display = o.showProj ? '' : 'none';
      if (o.showProj) { b.setLine(drop, [pl.X(B[0]), pl.Y(B[1])], [pl.X(F[0]), pl.Y(F[1])]); if (!perp && !par) { var w = [B[0] - F[0], B[1] - F[1]], wl = Math.hypot(w[0], w[1]), v = [w[0] / wl, w[1] / wl], u = [(-F[0]) / (Math.hypot(F[0], F[1])), (-F[1]) / (Math.hypot(F[0], F[1]))], sz = 0.3; gM.append(h('polyline', { points: b.pts([[pl.X(F[0] + sz * u[0]), pl.Y(F[1] + sz * u[1])], [pl.X(F[0] + sz * u[0] + sz * v[0]), pl.Y(F[1] + sz * u[1] + sz * v[1])], [pl.X(F[0] + sz * v[0]), pl.Y(F[1] + sz * v[1])]]), class: 'pl-right' })); } } else drop.style.display = 'none';
      pA.textContent = 'a ＝ (3, 4)，|a| ＝ 5'; pB.textContent = 'b ＝ ' + vs(B[0], B[1]) + '，|b| ＝ ' + f2(LB); pT.textContent = 'θ ＝ ' + f(Math.round(th)) + '°（a 和 b 的夾角）';
      p1.textContent = '|a||b|cos θ ＝ 5 × ' + f2(LB) + ' × ' + f2(cosT) + ' ＝ ' + f2(LA * LB * cosT); p2.textContent = 'x₁x₂ ＋ y₁y₂ ＝ 3·(' + f(B[0]) + ') ＋ 4·(' + f(B[1]) + ') ＝ ' + f(d); p2.className = 'pl-pill ' + (d > 0 ? 'is-green' : d === 0 ? 'is-amber' : 'is-pink');
      pP.textContent = 'b 在 a 上的投影長 ＝ (a·b) ÷ |a| ＝ ' + f(d) + ' ÷ 5 ＝ ' + f2(pj) + (pj < 0 ? '（負：影子在 a 的反方向）' : ''); pP.className = 'pl-pill ' + (o.target !== undefined && Math.abs(pj - o.target) < 1e-9 ? 'is-ok' : 'is-amber');
      if (o.mark && o.mark(B, d)) p2.className = 'pl-pill is-ok';
      if (o.onChange) o.onChange(B, d);
    }
    var cands = o.cands ? o.cands(pl) : PV.lattice(pl, [-5, 5], [-3, 4]);
    var hd = b.handle({ r: 0.3, pos: [pl.X(B[0]), pl.Y(B[1])], candidates: cands, disabled: function () { return !!(o.gate && o.gate.on); }, onMove: function (t) { B = [Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))]; upd(); }, onEnd: function (t) { B = [Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))]; upd(); if (o.onSettle) o.onSettle(B, dotv(B), pl); } });
    S.setB = function (x, y) { hd.moveTo([pl.X(x), pl.Y(y)]); }; S.pl = pl; upd(); return S;
  }

  var steps = [
    /* 1. 預測＋內積的正負 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc;
      P.choice(st, api, { id: 'vd-p1', predict: true, label: '先猜猜看', prompt: 'a 和 b 的夾角<b>大於 90°</b>（鈍角）時，內積 <b>a·b</b> 是正的、零，還是負的？', row: true, options: [{ t: '正的' }, { t: '零' }, { ok: true, t: '負的' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 b，看內積的正負'); } });
      st.append(P.instr('a ＝ (3, 4) 固定（藍色）。拖動 <b>b</b> 的終點，看夾角 <b>θ</b> 和內積怎麼變。<b>兩個算法</b>（用角度、用座標）的結果永遠一樣。'));
      sc = scene(st, { b: [2, 1], gate: gate, onChange: function (B, d) {
        if (gate.on) return; seen[d > 0 ? 'pos' : d === 0 ? 'zero' : 'neg'] = 1;
        if (seen.pos && seen.zero && seen.neg && !done) {
          done = true; P.track('aha', { id: 'vec-dot', step: 1 }); if (api.ctx.p1 === 2) P.toast('你猜對了：鈍角時內積是負的');
          st.append(P.ruleBox('夾角 θ ＜ 90°：內積<b>正</b>；θ ＝ 90°（<b>垂直</b>）：內積 <b>0</b>；θ ＞ 90°：內積<b>負</b>。<br>內積是一個<b>數</b>（不是向量）：<b>a·b ＝ |a||b|cos θ ＝ x₁x₂ ＋ y₁y₂</b>。兩個算法每次都一樣。', '內積的正負'));
          api.unlock('θ 小正、90° 零、大負');
        }
      } });
      api.solve(function () { gate.on = false; sc.setB(2, 1); sc.setB(4, -3); sc.setB(-3, 1); }, false, '鈍角時內積是負的（θ ＜ 90° 正、θ ＝ 90° 為 0、θ ＞ 90° 負）');
      st.append(P.hint('把 b 拉到 a 的旁邊、和 a 垂直、轉到 a 的反方向。')); api.lock('先做上面的預測');
    },
    /* 2. 投影 */
    function (st, api) {
      var seen = {}, done = false, sc;
      st.append(P.instr('橘色粗線是 <b>b 在 a 上的投影</b>（從 b 的終點垂直往下掉到 a 那條線上）。拖動 b，看投影的長度和內積有什麼關係。'));
      sc = scene(st, { b: [2, 3], showProj: true, onChange: function (B, d) {
        seen[d > 0 ? 'pos' : d === 0 ? 'zero' : 'neg'] = 1;
        if (seen.pos && seen.zero && seen.neg && !done) {
          done = true; P.track('aha', { id: 'vec-dot', step: 2 });
          st.append(P.ruleBox('<b>內積 ＝ |a| × 投影長</b>：a·b ＝ 5 × (投影長)，所以<b>投影長 ＝ (a·b) ÷ |a|</b>。<br>投影在 a 的方向上，是<b>正的</b>；投影跑到 a 的<b>反方向</b>，投影長就是<b>負的</b>（內積也是負的）。b 和 a 垂直時，影子縮成一點，投影長 ＝ 0。', '投影'));
          api.unlock('內積 ＝ |a| × 投影長');
        }
      } });
      api.solve(function () { sc.setB(2, 3); sc.setB(4, -3); sc.setB(-3, 1); }, false, '投影長 ＝ (a·b) ÷ |a|；投影在 a 的反方向時是負的，垂直時是 0');
      st.append(P.hint('b 拉到 a 的同側、垂直、反側各看一次。')); api.lock('看投影的正、零、負');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: prompt, cands(pl)→格點、ok(B, d)、b0、answers（看詳解的 b）、ans、msg、rule、hint、showProj、target */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, sc;
          sc = scene(b0, { b: cfg.b0, sm: true, showProj: !!cfg.showProj, target: cfg.target, mark: cfg.ok, cands: cfg.cands, onSettle: function (B, d, pl) {
            if (cfg.ok(B, d) && !fin) { fin = true; pl.b.goalMark([pl.X(B[0]), pl.Y(B[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '內積')); done(); } } });
          setSolve(function () { sc.setB(cfg.ansB[0], cfg.ansB[1]); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '拖動 <b>b</b>，讓 <b>a·b ＝ 0</b>（b 不能是零向量）。', b0: [2, 1], ok: function (B, d) { return d === 0; }, ansB: [4, -3], ans: 'b ＝ (4, −3) 或 (−4, 3)（3×4 ＋ 4×(−3) ＝ 0，a 和 b 垂直）', msg: 'a·b ＝ 0：垂直', rule: 'a·b ＝ 3x ＋ 4y ＝ 0 時，a ⊥ b。例如 b ＝ (4, −3)：3×4 ＋ 4×(−3) ＝ 0。（粉紅 b 和藍 a 之間出現直角符號。）', hint: '3x ＋ 4y ＝ 0，x、y 要一正一負。' }),
        task({ prompt: '<b>b 的長度固定是 5</b>（只能停在長度 5 的格點上）。拖動 <b>b</b>，讓<b>內積 a·b 最大</b>。', b0: [5, 0], cands: function (pl) { var c = []; for (var x = -5; x <= 5; x++) for (var y = -3; y <= 4; y++) if (x * x + y * y === 25) c.push([pl.X(x), pl.Y(y)]); return c; }, ok: function (B, d) { return d === 25; }, ansB: [3, 4], ans: 'b ＝ (3, 4)（和 a 同方向，a·b ＝ 5 × 5 × cos 0° ＝ 25，是最大值）', msg: 'a·b ＝ 25：同方向最大', rule: 'b 長度固定時，a·b ＝ |a||b|cos θ，cos θ ＝ 1（θ ＝ 0°，b 和 a <b>同方向</b>）最大：5 × 5 × 1 ＝ 25。', hint: 'cos θ 最大是多少？這時 a、b 是什麼關係？' }),
        task({ prompt: '拖動 <b>b</b>，讓 <b>b 在 a 上的投影長剛好是 3</b>（橘色粗線長度 3）。', b0: [2, 3], showProj: true, target: 3, ok: function (B, d) { return d === 15; }, ansB: [5, 0], ans: 'b ＝ (5, 0) 或 (1, 3)（a·b ＝ 15，投影長 ＝ 15 ÷ 5 ＝ 3）', msg: '投影長 3：a·b ＝ 15', rule: '投影長 ＝ (a·b) ÷ |a| ＝ 3，所以 a·b ＝ 3 × 5 ＝ <b>15</b>：3x ＋ 4y ＝ 15。(5, 0) 和 (1, 3) 都可以。', hint: '投影長 ＝ 內積 ÷ 5，所以內積要是多少？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'vec-dot' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'vec-dot', moduleName: '向量的內積與投影', askAbout: '向量的內積與投影', aha: '<b>a·b ＝ |a||b|cos θ ＝ x₁x₂ ＋ y₁y₂</b>：兩個算法永遠一樣；夾角小於 90° 正、等於 90° 零、大於 90° 負。<br><b>內積 ＝ |a| × b 在 a 上的投影長</b>。',
        cards: [{ text: 'a·b ＝ |a||b|cos θ ＝ x₁x₂ ＋ y₁y₂；a ⊥ b ⇔ a·b ＝ 0；b 在 a 上的投影長 ＝ (a·b) ÷ |a|', src: '高中：平面向量的內積' }, { text: '內積是一個數；θ ＜ 90° 正、θ ＝ 90° 零、θ ＞ 90° 負', src: '內積的符號與夾角' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '柯西不等式<br>內積與餘弦定理' }, { at: 0.85, label: '正射影與最短距離' }] },
        teasers: [{ title: '柯西不等式', q: '(a·b)² ≤ |a|²|b|² 為什麼成立？什麼時候等號成立？', where: 'S111 CH2 指對數函數 07＋平面向量（2025 年 11 月，第 16 堂）', lv: 'L3' }],
        parent: { pitfall: '孩子常把內積算成向量；把 a·b ＝ 0 誤解成 a 或 b 是零向量；投影長是負的時不知道怎麼辦。', place: '高中平面向量，是垂直、夾角、面積與最短距離的基礎。', ask: ['a ＝ (3, 4)、b ＝ (4, −3)，內積是多少？它們垂直嗎？', '夾角是鈍角時，內積是正是負？', '投影長是負的代表什麼？'] },
        classes: ['S111（第 16 堂，2025 年 11 月）：CH2 指對數函數 07＋平面向量'], next: { href: 'play-vec-para-perp.html', text: '下一個：平行、垂直與面積' } });
    }];
  new P.Lesson({ id: 'vec-dot', title: '向量的內積與投影', steps: steps });
})();
