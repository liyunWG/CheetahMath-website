/* 獵豹玩中學｜圓的方程（一）：標準式
   預測＋拖圓心 C 看 (x − h)²＋(y − k)²＝r² 的正負號 → 預測＋拖圓上的點 P 看 r² 與 r → 3 個操作關卡（照方程式調出圓）。
   要擊中的迷思：圓心的符號寫反（(x＋3)² 的圓心是 −3）；把 r² 當成半徑。 */
(function () {
  var P = Play, h = P.h, PV = window.PV, f = PV.f, vs = PV.vs;
  var CA = '#2f6fdc', CB = '#d6336c', CG = '#1f9d55', CT = '#d29b1f', CD = '#8a8470';
  var XR = [-5, 5], YR = [-3, 3];
  function sq(v, c) { return c === 0 ? v + '²' : '(' + v + (c > 0 ? ' − ' + c : ' ＋ ' + (-c)) + ')²'; }
  function eq(hh, kk, r2) { return sq('x', hh) + ' ＋ ' + sq('y', kk) + ' ＝ ' + r2; }
  function rtxt(r2) {   /* √r2 化到最簡 */
    var k = 1, m = r2, q; for (q = Math.floor(Math.sqrt(r2)); q >= 2; q--) if (r2 % (q * q) === 0) { k = q; m = r2 / (q * q); break; }
    return m === 1 ? '' + k : (k === 1 ? '' : k) + '√' + m;
  }
  function paren(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }

  /* 圓＋兩個把手：圓心 C（拖它整個圓跟著走）、圓上的點 P（拖它改半徑）。o: C、P、fixedC、gate、onChange(C, P, r2)、onSettle(C, P, r2) */
  function scene(host, o) {
    var pl = PV.plane(host), b = pl.b, C = o.C.slice(), Pp = o.P.slice(), S = {};
    var circ = PV.circ(pl, CA, { w: 5 }), rl = b.line([0, 0], [0, 0], 'pl-line', pl.gC); rl.style.stroke = CT; rl.style.strokeWidth = '3px'; rl.style.strokeDasharray = '6 5';
    var tc = b.text([0, 0], 'C', 'pl-text pl-text--blue', pl.gC), tp = b.text([0, 0], 'P', 'pl-text pl-text--pink', pl.gC), tr = b.text([0, 0], 'r', 'pl-text pl-text--amber', pl.gC);
    function r2() { return (Pp[0] - C[0]) * (Pp[0] - C[0]) + (Pp[1] - C[1]) * (Pp[1] - C[1]); }
    function upd() {
      var R2 = r2(), r = Math.sqrt(R2); circ.set(C, r); b.setLine(rl, [pl.X(C[0]), pl.Y(C[1])], [pl.X(Pp[0]), pl.Y(Pp[1])]);
      var u = [(Pp[0] - C[0]) / r, (Pp[1] - C[1]) / r], out = [u[0] > 0 ? 1 : -1, 0];
      var avoid = [[C[0], C[1], 0.62, 0.62], [Pp[0], Pp[1], 0.62, 0.62]].concat(PV.segBoxes(C, Pp, 0.5, 0.1)), lc = PV.pick(pl, PV.ring(C, Math.atan2(-u[1], -u[0]), [1.1, 1.5]), avoid); avoid.push(lc.m);
      var lp = PV.pick(pl, PV.ring(Pp, Math.atan2(u[1], u[0]), [1.1, 1.5]), avoid); avoid.push(lp.m);
      var mid = [(C[0] + Pp[0]) / 2, (C[1] + Pp[1]) / 2], n = [-u[1], u[0]], lr = PV.pick(pl, [[mid[0] + n[0] * 0.55, mid[1] + n[1] * 0.55], [mid[0] - n[0] * 0.55, mid[1] - n[1] * 0.55], [mid[0] + n[0] * 0.9, mid[1] + n[1] * 0.9], [mid[0] - n[0] * 0.9, mid[1] - n[1] * 0.9]], avoid, [0.3, 0.45]);
      b.setText(tc, lc.b, 'C'); b.setText(tp, lp.b, 'P'); b.setText(tr, lr.b, 'r'); S.r2 = R2;
      if (o.onChange) o.onChange(C, Pp, R2);
    }
    var cands = PV.lattice(pl, XR, YR, true);
    function dis() { return !!(o.gate && o.gate.on); }
    function inWin(p) { return p[0] >= XR[0] && p[0] <= XR[1] && p[1] >= YR[0] && p[1] <= YR[1]; }
    var hP, hC;
    function rnd(v, k) { return Math.round(k === 0 ? pl.Xi(v) : pl.Yi(v)); }
    hP = b.handle({ r: 0.3, cls: 'is-pink', pos: [pl.X(Pp[0]), pl.Y(Pp[1])], candidates: cands, disabled: dis,
      valid: function (t) { var x = rnd(t[0], 0), y = rnd(t[1], 1); return !(x === C[0] && y === C[1]); },
      onMove: function (t) { Pp[0] = rnd(t[0], 0); Pp[1] = rnd(t[1], 1); upd(); }, onEnd: function (t) { Pp[0] = rnd(t[0], 0); Pp[1] = rnd(t[1], 1); upd(); if (o.onSettle) o.onSettle(C, Pp, r2()); } });
    hC = o.fixedC ? null : b.handle({ r: 0.3, pos: [pl.X(C[0]), pl.Y(C[1])], candidates: cands, disabled: dis,
      valid: function (t) { var x = rnd(t[0], 0), y = rnd(t[1], 1), q = [x + Pp[0] - C[0], y + Pp[1] - C[1]]; return inWin(q); },
      onMove: function (t) { var x = rnd(t[0], 0), y = rnd(t[1], 1), dx = x - C[0], dy = y - C[1]; C[0] = x; C[1] = y; Pp[0] += dx; Pp[1] += dy; hP.set([pl.X(Pp[0]), pl.Y(Pp[1])], true); upd(); },
      onEnd: function () { if (o.onSettle) o.onSettle(C, Pp, r2()); } });
    S.setC = function (x, y) { hC.moveTo([pl.X(x), pl.Y(y)]); }; S.setP = function (x, y) { hP.moveTo([pl.X(x), pl.Y(y)]); }; S.pl = pl; S.C = C; S.P = Pp;
    upd(); return S;
  }
  function readout(host) {
    var pCP = P.pill('', 'is-blue'), pEq = P.pill('', 'is-green'), pR = P.pill('', 'is-amber'), pSub = P.pill('', 'is-pink'); [pEq, pR, pSub].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pCP), h('div', { class: 'pl-readout' }, pEq), h('div', { class: 'pl-readout' }, pR), h('div', { class: 'pl-readout' }, pSub));
    return function (C, Pp, R2) {
      var dx = Pp[0] - C[0], dy = Pp[1] - C[1];
      pCP.textContent = '圓心 C ＝ ' + vs(C[0], C[1]) + '　P ＝ ' + vs(Pp[0], Pp[1]); pEq.textContent = eq(C[0], C[1], R2); pR.textContent = 'r² ＝ ' + R2 + '，所以半徑 r ＝ ' + rtxt(R2);
      pSub.textContent = 'P 代入：(' + f(Pp[0]) + ' − ' + paren(C[0]) + ')² ＋ (' + f(Pp[1]) + ' − ' + paren(C[1]) + ')² ＝ ' + dx * dx + ' ＋ ' + dy * dy + ' ＝ ' + R2 + ' ✓';
    };
  }

  var steps = [
    /* 1. 圓心的符號 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'cs-p1', predict: true, label: '先猜猜看', prompt: '圓的方程式是 <b>(x ＋ 3)² ＋ (y − 2)² ＝ 16</b>，圓心在哪裡？', row: true, options: [{ ok: true, t: '(−3, 2)' }, { t: '(3, −2)' }, { t: '(3, 2)' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動圓心 C'); } });
      st.append(P.instr('拖動<b>圓心 C</b>（整個圓跟著走），看方程式裡的<b>正負號</b>怎麼變。把圓心拉到左邊、右邊、上面、下面都試試。'));
      var host = h('div'); st.append(host);
      sc = scene(host, { C: [1, 1], P: [4, 1], gate: gate, onChange: function (C, Pp, R2) {
        ro && ro(C, Pp, R2); if (gate.on) return; if (C[0] < 0) seen.hn = 1; if (C[0] > 0) seen.hp = 1; if (C[1] < 0) seen.kn = 1; if (C[1] > 0) seen.kp = 1;
        if (seen.hn && seen.hp && seen.kn && seen.kp && !done) {
          done = true; P.track('aha', { id: 'circle-std', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：(x ＋ 3)² 的圓心是 −3');
          st.append(P.ruleBox('圓心 <b>(h, k)</b>、半徑 r 的圓：<b>(x − h)² ＋ (y − k)² ＝ r²</b>。<br>括號裡是<b>減號</b>：圓心在右邊（h ＞ 0）寫 (x − h)；圓心在左邊（h ＜ 0）就會變成 <b>(x ＋ |h|)</b>。所以 (x ＋ 3)² 的圓心 x 座標是 <b>−3</b>，正負號和圓心<b>相反</b>。', '圓的標準式'));
          api.unlock('括號裡的符號和圓心相反');
        }
      } });
      ro = readout(st); ro(sc.C, sc.P, sc.r2);
      api.solve(function () { gate.on = false; sc.setC(-2, 1); sc.setC(2, -1); sc.setC(-1, -2); sc.setC(2, 2); }, false, '(x ＋ 3)² ＋ (y − 2)² ＝ 16 的圓心是 (−3, 2)（括號裡的正負號和圓心相反）');
      st.append(P.hint('把圓心拉到四個不同的象限，看括號裡是加還是減。')); api.lock('先做上面的預測');
    },
    /* 2. r² 與 r */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'cs-p2', predict: true, label: '先猜猜看', prompt: '方程式 <b>x² ＋ y² ＝ 25</b> 的圓，半徑是多少？', row: true, options: [{ ok: true, t: '5' }, { t: '25' }, { t: '√5' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動圓上的點 P'); } });
      st.append(P.instr('圓心固定在原點。拖動圓上的點 <b>P</b> 改變半徑，看右邊的數字是 <b>r</b> 還是 <b>r²</b>。P 的座標代入方程式，一定會成立。'));
      var host = h('div'); st.append(host);
      sc = scene(host, { C: [0, 0], P: [3, 4], fixedC: true, gate: gate, onChange: function (C, Pp, R2) {
        ro && ro(C, Pp, R2); if (gate.on) return; var r = Math.round(Math.sqrt(R2)); if (r * r === R2) seen.sq = 1; else seen.ns = 1;
        if (seen.sq && seen.ns && !done) {
          done = true; P.track('aha', { id: 'circle-std', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：r² ＝ 25，r ＝ 5');
          st.append(P.ruleBox('方程式右邊是 <b>r²</b>（半徑的平方），不是半徑。r² ＝ Δx² ＋ Δy²（畢氏定理）。<br>r² ＝ 25 → r ＝ 5；r² ＝ 13 不是平方數 → r ＝ √13。要寫方程式時，右邊要寫 r²。', 'r² 不是 r'));
          api.unlock('右邊是 r²');
        }
      } });
      ro = readout(st); ro(sc.C, sc.P, sc.r2);
      api.solve(function () { gate.on = false; sc.setP(5, 0); sc.setP(2, 3); sc.setP(0, 4); }, false, 'x² ＋ y² ＝ 25 的圓，半徑 r ＝ 5（右邊是 r²）');
      st.append(P.hint('P 拉到 (3, 4)、(5, 0)，再拉到 (2, 3)，看 r² 和 r 各是多少。')); api.lock('先做上面的預測');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, ro, sc = scene(b0, { C: cfg.C0, P: cfg.P0, onChange: function (C, Pp, R2) { ro && ro(C, Pp, R2); }, onSettle: function (C, Pp, R2) {
            if (cfg.ok(C, R2) && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(Pp[0]), sc.pl.Y(Pp[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } });
          ro = readout(b0); ro(sc.C, sc.P, sc.r2); setSolve(function () { sc.setC(cfg.ans[0][0], cfg.ans[0][1]); sc.setP(cfg.ans[1][0], cfg.ans[1][1]); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '調出圓 <b>(x ＋ 2)² ＋ (y − 3)² ＝ 9</b>：先拖<b>圓心 C</b>，再拖<b>圓上的點 P</b> 調半徑。', C0: [1, 0], P0: [3, 0], ok: function (C, R2) { return C[0] === -2 && C[1] === 3 && R2 === 9; }, ans: [[-2, 3], [1, 3]], answer: '圓心 C ＝ (−2, 3)，半徑 3（P 在 (1, 3)、(−2, 0)、(−5, 3) 都可以）', msg: '圓心 (−2, 3)，r² ＝ 9', rule: '(x ＋ 2)² ＝ (x − (−2))²，圓心的 x 座標是 −2；(y − 3)²，圓心的 y 座標是 3；右邊 9 ＝ r²，半徑是 3。', hint: '括號裡 x ＋ 2 是 x − (−2)，所以圓心的 x 座標是？右邊 9 是 r²，r 是多少？' }),
        task({ prompt: '調出一個圓：<b>圓心 C 在 (3, −2)</b>，而且<b>通過原點</b>。', C0: [0, 1], P0: [2, 1], ok: function (C, R2) { return C[0] === 3 && C[1] === -2 && R2 === 13; }, ans: [[3, -2], [0, 0]], answer: '圓心 C ＝ (3, −2)，P 拉到原點 (0, 0)：r² ＝ 3² ＋ 2² ＝ 13，方程式 (x − 3)² ＋ (y ＋ 2)² ＝ 13', msg: '(x − 3)² ＋ (y ＋ 2)² ＝ 13', rule: '圓通過原點，原點到圓心的距離就是半徑：r² ＝ 3² ＋ (−2)² ＝ 13。方程式是 (x − 3)² ＋ (y ＋ 2)² ＝ 13。', hint: '圓通過原點，表示原點就是圓上的一個點。把 P 拉過去看看。' }),
        task({ prompt: '調出一個圓：<b>圓心在第四象限</b>，<b>半徑是 2</b>，而且<b>同時和 x 軸、y 軸相切</b>。', C0: [1, -1], P0: [2, -1], ok: function (C, R2) { return C[0] === 2 && C[1] === -2 && R2 === 4; }, ans: [[2, -2], [4, -2]], answer: '圓心 C ＝ (2, −2)，半徑 2（(x − 2)² ＋ (y ＋ 2)² ＝ 4）；P 在 (4, −2)、(0, −2)、(2, 0) 都可以', msg: '(x − 2)² ＋ (y ＋ 2)² ＝ 4', rule: '和 x 軸相切：圓心到 x 軸的距離 ＝ r，所以 |k| ＝ 2；和 y 軸相切：|h| ＝ 2。圓心在第四象限（h ＞ 0、k ＜ 0）→ 圓心 (2, −2)，方程式 (x − 2)² ＋ (y ＋ 2)² ＝ 4。', hint: '相切：圓心到軸的距離剛好等於半徑。圓心的 x、y 座標的大小各是多少？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-std' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'circle-std', moduleName: '圓的方程（一）：標準式', askAbout: '圓的標準式',
        aha: '<b>括號裡的正負號和圓心相反</b>：(x ＋ 3)² 的圓心是 −3；<b>右邊是 r²</b>，不是半徑。',
        cards: [{ text: '圓心 (h, k)、半徑 r：(x − h)² ＋ (y − k)² ＝ r²', src: '高中：圓的方程' }, { text: '圓上的點代入方程式一定成立；右邊是 r²，r² ＝ Δx² ＋ Δy²', src: '圓的定義（到圓心的距離都是 r）' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '三點定圓<br>圓的參數式' }, { at: 0.85, label: '軌跡問題' }] },
        teasers: [{ title: '三點定圓', q: '不在同一直線上的三個點，可以決定一個圓。怎麼求圓心和半徑？', where: 'S101 2507「CH2 直線與圓」系列', lv: 'L2' }],
        parent: { pitfall: '孩子常把 (x ＋ 3)² 的圓心寫成 (3, …)；也常把 r² 當成半徑，寫出 (x − 1)² ＋ (y − 2)² ＝ 3 就以為半徑是 3。', place: '圓與直線、圓與圓的基礎。', ask: ['(x ＋ 3)² ＋ (y − 2)² ＝ 16 的圓心和半徑是多少？', '方程式右邊的 16 是半徑還是半徑的平方？', '圓心 (1, 2)、半徑 3 的圓，方程式怎麼寫？'] },
        classes: ['S101（2025 年 9 月，第 13 堂）：CH2 直線與圓 05'], next: { href: 'play-circle-gen.html', text: '下一個：圓的方程（一般式）' } });
    }];
  new P.Lesson({ id: 'circle-std', title: '圓的方程（一）：標準式', steps: steps });
})();
