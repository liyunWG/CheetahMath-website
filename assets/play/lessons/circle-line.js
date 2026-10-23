/* 獵豹玩中學｜圓與直線的關係
   預測＋拖直線看 d 與 r 比大小（相離／相切／相交，判別式同步）→ 預測＋看半徑、d、半弦的直角三角形（弦長 ＝ 2√(r²−d²)）→ 預測＋拖點 Q 數切線（圓內 0、圓上 1、圓外 2）→ 3 個操作關卡。
   圓：x²＋y²＝25（圓心在原點、半徑 5）。要擊中的迷思：d 的公式算錯；弦長漏了「2 倍」；圓外一點的切線有 2 條。 */
(function () {
  var PV = window.PV; PV.XR = [-8.25, 8.25]; PV.YR = [-5.5, 5.5];
  var P = Play, h = P.h, f = PV.f, R = 5, R2 = 25;
  var CA = '#2f6fdc', CB = '#d6336c', CG = '#1f9d55', CT = '#d29b1f', CD = '#8a8470';
  var XW = [-7, 7], YW = [-5, 5];   /* 圓半徑 5：格點範圍要涵蓋圓上下左右的頂點與圓外一格 */
  var PLEX = { skipX: [-7, -5, -3, -1, 1, 3, 5, 7], skipY: [-5, -3, -1, 1, 3, 5] };
  var LATT12 = [[5, 0], [-5, 0], [0, 5], [0, -5], [3, 4], [3, -4], [-3, 4], [-3, -4], [4, 3], [4, -3], [-4, 3], [-4, -3]];
  function sty(el, color, w, dash) { el.style.stroke = color; el.style.strokeWidth = w + 'px'; if (dash) el.style.strokeDasharray = '6 5'; return el; }
  function tl(a, b) { var s = ''; if (a !== 0) s += (a === 1 ? '' : a === -1 ? '−' : f(a)) + 'x'; if (b !== 0) s += (s === '' ? (b < 0 ? '−' : '') : (b < 0 ? ' − ' : ' ＋ ')) + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y'; return s; }
  function dec(v) { return f(Math.round(v * 100) / 100); }
  function circleBoxes() { var o = [], k; for (k = 0; k < 24; k++) { var t = 2 * Math.PI * k / 24; o.push([R * Math.cos(t), R * Math.sin(t), 0.12, 0.12]); } return o; }
  var CB24 = circleBoxes();

  /* 直線（兩個把手 A、B）與圓 x²＋y²＝25。o: A、B、fixedA、gate、onChange(info)、onSettle(info)、tri（畫直角三角形）*/
  function lineScene(host, o) {
    var pl = PV.plane(host, false, PLEX), b = pl.b, A = o.A.slice(), B = o.B.slice(), S = {};
    var circ = PV.circ(pl, CA, { w: 4 }), ln = PV.fline(pl, CB, { w: 5 }), chord = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CG, 7), dseg = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CT, 4, true), hseg = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CG, 3, true), rseg = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CD, 2, true), rt = PV.right(pl, { layer: pl.gC });
    var i1 = b.dot([0, 0], 'pl-dot pl-dot--amber', pl.gC, 0.2), i2 = b.dot([0, 0], 'pl-dot pl-dot--amber', pl.gC, 0.2), tA = b.text([0, 0], 'A', 'pl-text pl-text--pink', pl.gC), tB = b.text([0, 0], 'B', 'pl-text pl-text--pink', pl.gC), td = b.text([0, 0], 'd', 'pl-text pl-text--amber', pl.gC), tO = b.text([0, 0], 'O', 'pl-text', pl.gC);
    circ.set([0, 0], R); b.dot([pl.X(0), pl.Y(0)], 'pl-dot', pl.gC, 0.12);
    function set2(el, p, q) { b.setLine(el, [pl.X(p[0]), pl.Y(p[1])], [pl.X(q[0]), pl.Y(q[1])]); }
    function upd() {
      var g = PV.gen(A[0], A[1], B[0], B[1]), a = g[0], bb = g[1], c = g[2], n2 = a * a + bb * bb, nn = Math.sqrt(n2), d = Math.abs(c) / nn, delta = R2 * n2 - c * c, kind = delta > 0 ? 'int' : delta === 0 ? 'tan' : 'out';
      ln.set(a, bb, c);
      var F = [-c * a / n2, -c * bb / n2], u = [-bb / nn, a / nn], half = delta >= 0 ? Math.sqrt(delta / n2) : 0, P1 = [F[0] + u[0] * half, F[1] + u[1] * half], P2 = [F[0] - u[0] * half, F[1] - u[1] * half];
      var showD = c !== 0, vFO = showD ? [-F[0] / d, -F[1] / d] : [0, 0];
      i1.style.display = i2.style.display = 'none'; chord.style.display = hseg.style.display = rseg.style.display = 'none';
      if (kind === 'int' || kind === 'tan') { [[i1, P1], [i2, P2]].forEach(function (k, ix) { if (kind === 'tan' && ix === 1) return; k[0].style.display = ''; k[0].setAttribute('cx', pl.X(k[1][0])); k[0].setAttribute('cy', b.Y(pl.Y(k[1][1]))); }); }
      if (kind === 'int') { chord.style.display = ''; set2(chord, P1, P2); }
      if (o.tri && kind === 'int' && showD) { hseg.style.display = ''; set2(hseg, F, P1); rseg.style.display = ''; set2(rseg, [0, 0], P1); }
      if (showD) { dseg.style.display = ''; set2(dseg, [0, 0], F); rt.set(F, u, vFO, 0.4); } else { dseg.style.display = 'none'; rt.hide(true); }
      var avoid = [[A[0], A[1], 0.62, 0.62], [B[0], B[1], 0.62, 0.62]].concat(PV.segBoxes(PV.clip(a, bb, c) ? PV.clip(a, bb, c)[0] : [0, 0], PV.clip(a, bb, c) ? PV.clip(a, bb, c)[1] : [0, 0], 0.5, 0.1), CB24, [[0, 0, 0.3, 0.3]]);
      var lA = PV.pick(pl, PV.around(A, u).concat(PV.ring(A, Math.PI / 2, [1.4, 1.8, 2.3])), avoid); avoid.push(lA.m); var lB = PV.pick(pl, PV.around(B, u).concat(PV.ring(B, Math.PI / 2, [1.4, 1.8, 2.3])), avoid); avoid.push(lB.m);
      b.setText(tA, lA.b, 'A'); b.setText(tB, lB.b, 'B');
      var lo = PV.pick(pl, [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9], [-1.4, 0], [1.4, 0], [0, -1.3], [0, 1.3]], avoid, [0.3, 0.45]); avoid.push(lo.m); b.setText(tO, lo.b, 'O');
      if (showD) { var mid = [F[0] / 2, F[1] / 2], nv = [-vFO[1], vFO[0]], ld = PV.pick(pl, [[mid[0] + nv[0] * 0.6, mid[1] + nv[1] * 0.6], [mid[0] - nv[0] * 0.6, mid[1] - nv[1] * 0.6], [mid[0] + nv[0] * 1.0, mid[1] + nv[1] * 1.0], [mid[0] - nv[0] * 1.0, mid[1] - nv[1] * 1.0]].concat(PV.ring(mid, Math.atan2(nv[1], nv[0]), [1.3, 1.7, 2.2])), avoid, [0.3, 0.45]); avoid.push(ld.m); b.setText(td, ld.b, 'd'); } else b.setText(td, [0, 0], '');
      var info = { A: A, B: B, g: g, a: a, b: bb, c: c, n2: n2, d: d, delta: delta, kind: kind, chord: 2 * half, half: half, F: F }; S.info = info; if (o.onChange) o.onChange(info);
    }
    var cands = PV.lattice(pl, XW, YW, true);
    function dis() { return !!(o.gate && o.gate.on); }
    function H(P0, set, other, cls) {
      function apply(t) { set(Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))); upd(); }
      return b.handle({ r: 0.3, cls: cls, pos: [pl.X(P0[0]), pl.Y(P0[1])], candidates: cands, disabled: dis,
        valid: function (t) { var q = other(); return !(Math.round(pl.Xi(t[0])) === q[0] && Math.round(pl.Yi(t[1])) === q[1]); }, onMove: apply, onEnd: function (t) { apply(t); if (o.onSettle) o.onSettle(S.info); } });
    }
    var hA = o.fixedA ? null : H(A, function (x, y) { A[0] = x; A[1] = y; }, function () { return B; }), hB = H(B, function (x, y) { B[0] = x; B[1] = y; }, function () { return A; });
    S.setA = function (x, y) { hA.moveTo([pl.X(x), pl.Y(y)]); }; S.setB = function (x, y) { hB.moveTo([pl.X(x), pl.Y(y)]); }; S.pl = pl; S.A = A; S.B = B;
    upd(); return S;
  }
  function lineReadout(host, withChord) {
    var pD = P.pill('', 'is-amber'), pR = P.pill('', 'is-blue'), pK = P.pill('', 'is-green'), pS = P.pill('', 'is-pink'); [pD, pR, pK, pS].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pD), h('div', { class: 'pl-readout' }, pR), h('div', { class: 'pl-readout' }, pK), h('div', { class: 'pl-readout' }, pS));
    return function (i) {
      pD.textContent = '直線：' + tl(i.a, i.b) + (i.c === 0 ? '' : i.c < 0 ? ' − ' + (-i.c) : ' ＋ ' + i.c) + ' ＝ 0';
      pR.textContent = 'd ＝ |C| ÷ √(A² ＋ B²) ＝ ' + Math.abs(i.c) + ' ÷ √' + i.n2 + ' ≈ ' + dec(i.d) + '　（半徑 r ＝ 5）';
      pK.textContent = i.kind === 'int' ? 'd ＜ r：相交（2 個交點）' : i.kind === 'tan' ? 'd ＝ r：相切（只有 1 個交點）' : 'd ＞ r：相離（沒有交點）'; pK.className = 'pl-pill ' + (i.kind === 'tan' ? 'is-ok' : 'is-green');
      pS.textContent = withChord ? (i.kind === 'int' ? '弦長 ＝ 2√(r² − d²) ＝ 2√(25 − ' + dec(i.d * i.d) + ') ≈ ' + dec(i.chord) : '沒有弦（弦長要在相交時才有）')
        : '聯立後判別式 Δ 的正負 ＝ r²(A² ＋ B²) − C² ＝ 25×' + i.n2 + ' − ' + i.c * i.c + ' ＝ ' + i.delta + '（Δ ' + (i.delta > 0 ? '＞ 0' : i.delta === 0 ? '＝ 0' : '＜ 0') + '）';
    };
  }

  /* 切線：點 Q（任意格點）；圓外 2 條、圓上 1 條、圓內 0 條。o: Q、fixedT（改成兩個切點把手 T₁、T₂ 與固定的 Q）、gate、onChange(info)、onSettle(info) */
  function tanScene(host, o) {
    var pl = PV.plane(host, false, PLEX), b = pl.b, Q = o.Q.slice(), S = {}, circ = PV.circ(pl, CA, { w: 4 });
    circ.set([0, 0], R); b.dot([pl.X(0), pl.Y(0)], 'pl-dot', pl.gC, 0.12);
    var L = [PV.fline(pl, CB, { w: 4 }), PV.fline(pl, CB, { w: 4 })], seg = [sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CD, 2, true), sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CD, 2, true)], rts = [PV.right(pl, { layer: pl.gC }), PV.right(pl, { layer: pl.gC })], dots = [b.dot([0, 0], 'pl-dot pl-dot--amber', pl.gC, 0.2), b.dot([0, 0], 'pl-dot pl-dot--amber', pl.gC, 0.2)];
    var tq = b.text([0, 0], 'Q', 'pl-text pl-text--pink', pl.gC), tT = [b.text([0, 0], '', 'pl-text pl-text--amber', pl.gC), b.text([0, 0], '', 'pl-text pl-text--amber', pl.gC)], tO = b.text([0, 0], 'O', 'pl-text', pl.gC);
    function set2(el, p, q) { b.setLine(el, [pl.X(p[0]), pl.Y(p[1])], [pl.X(q[0]), pl.Y(q[1])]); }
    var Ts = o.twoT ? [o.T1.slice(), o.T2.slice()] : [];
    function upd() {
      var q2 = Q[0] * Q[0] + Q[1] * Q[1], kind = q2 > R2 ? 'out' : q2 === R2 ? 'on' : 'in', pts = [];
      if (o.twoT) { pts = Ts.slice(); }
      else if (kind === 'out') { var qn = Math.sqrt(q2), k = R2 / q2, w = Math.sqrt(R2 * (q2 - R2)) / q2; pts = [[k * Q[0] - w * Q[1], k * Q[1] + w * Q[0]], [k * Q[0] + w * Q[1], k * Q[1] - w * Q[0]]]; }   /* 切點：極線 x₀x＋y₀y＝r² 與圓的交點 */
      else if (kind === 'on') pts = [Q.slice()];
      var avoid = [[Q[0], Q[1], 0.62, 0.62]].concat(CB24, [[0, 0, 0.3, 0.3]], pts.map(function (t) { return [t[0], t[1], 0.62, 0.62]; })), info = { Q: Q.slice(), kind: kind, tangents: [], count: o.twoT ? 2 : kind === 'out' ? 2 : kind === 'on' ? 1 : 0, T: pts };
      [0, 1].forEach(function (i) {
        var t = pts[i]; if (!t) { L[i].hide(true); seg[i].style.display = 'none'; rts[i].hide(true); dots[i].style.display = 'none'; b.setText(tT[i], [0, 0], ''); return; }
        L[i].hide(false).set(t[0], t[1], -R2); info.tangents.push(t);               /* 切線：x₀x ＋ y₀y ＝ r² */
        seg[i].style.display = ''; set2(seg[i], [0, 0], t); dots[i].style.display = ''; dots[i].setAttribute('cx', pl.X(t[0])); dots[i].setAttribute('cy', b.Y(pl.Y(t[1])));
        var tn = Math.hypot(t[0], t[1]), ur = [-t[0] / tn, -t[1] / tn], ut = [-t[1] / tn, t[0] / tn];
        var vv = ut; var qd = [Q[0] - t[0], Q[1] - t[1]]; if (!o.twoT && qd[0] * ut[0] + qd[1] * ut[1] < 0) vv = [-ut[0], -ut[1]]; rts[i].set(t, ur, vv, 0.4);
        var lt = PV.pick(pl, PV.ring(t, Math.atan2(t[1], t[0]), [1.3, 1.8, 2.4]), avoid.concat(PV.segBoxes([0, 0], t, 0.5, 0.1)), [0.5, 0.45]); avoid.push(lt.m); b.setText(tT[i], lt.b, o.twoT ? 'T' + (i + 1 === 1 ? '₁' : '₂') : 'T' + (kind === 'out' ? (i === 0 ? '₁' : '₂') : ''));
      });
      var lq = PV.pick(pl, PV.ring(Q, 0.8, [1.1, 1.5, 2.1, 2.7]), avoid, [0.45, 0.45]); b.setText(tq, lq.b, 'Q');
      b.setText(tO, PV.pick(pl, [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9]], avoid, [0.3, 0.45]).b, 'O'); S.info = info; if (o.onChange) o.onChange(info);
    }
    var cands = PV.lattice(pl, XW, YW, true);
    function dis() { return !!(o.gate && o.gate.on); }
    S.pl = pl; S.Q = Q;
    if (o.twoT) {
      var cs = LATT12.map(function (p) { return [pl.X(p[0]), pl.Y(p[1])]; });
      [0, 1].forEach(function (i) { var hh = b.handle({ r: 0.3, cls: 'is-amber', pos: [pl.X(Ts[i][0]), pl.Y(Ts[i][1])], candidates: cs, disabled: dis, onMove: function (t) { Ts[i] = [Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))]; upd(); }, onEnd: function () { if (o.onSettle) o.onSettle(S.info); } }); S['setT' + (i + 1)] = function (x, y) { hh.moveTo([pl.X(x), pl.Y(y)]); }; });
      b.dot([pl.X(Q[0]), pl.Y(Q[1])], 'pl-dot pl-dot--pink', pl.gC, 0.22);
    } else {
      var hq = b.handle({ r: 0.3, cls: 'is-pink', pos: [pl.X(Q[0]), pl.Y(Q[1])], candidates: cands, disabled: dis, onMove: function (t) { Q[0] = Math.round(pl.Xi(t[0])); Q[1] = Math.round(pl.Yi(t[1])); upd(); }, onEnd: function () { if (o.onSettle) o.onSettle(S.info); } });
      S.setQ = function (x, y) { hq.moveTo([pl.X(x), pl.Y(y)]); };
    }
    upd(); return S;
  }
  function tanReadout(host) {
    var pQ = P.pill('', 'is-pink'), pN = P.pill('', 'is-green'), pF = P.pill('', 'is-amber'); [pQ, pN, pF].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pQ), h('div', { class: 'pl-readout' }, pN), h('div', { class: 'pl-readout' }, pF));
    return function (i) {
      var q2 = i.Q[0] * i.Q[0] + i.Q[1] * i.Q[1];
      pQ.textContent = 'Q ＝ ' + PV.vs(i.Q[0], i.Q[1]) + '，OQ² ＝ ' + q2 + '，r² ＝ 25：' + (i.kind === 'out' ? 'Q 在圓外' : i.kind === 'on' ? 'Q 在圓上' : 'Q 在圓內');
      pN.textContent = '切線有 ' + i.count + ' 條'; pN.className = 'pl-pill is-green';
      pF.textContent = i.kind === 'on' ? '切線：' + tl(i.Q[0], i.Q[1]) + ' ＝ 25（x₀x ＋ y₀y ＝ r²）' : '切線與半徑 OT 的夾角永遠是 90°（直角符號）';
    };
  }

  var steps = [
    /* 1. d 與 r */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'cl-p1', predict: true, label: '先猜猜看', prompt: '圓的半徑 <b>r ＝ 5</b>。圓心到直線的距離 <b>d ＝ 6</b>，直線和圓的關係是？', row: true, options: [{ ok: true, t: '相離（沒有交點）' }, { t: '相切' }, { t: '相交（2 個交點）' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 A、B 轉動直線'); } });
      st.append(P.instr('圓心 O 在原點，半徑 <b>r ＝ 5</b>。拖動 <b>A</b>、<b>B</b> 移動紅線，橘色虛線是圓心到直線的<b>距離 d</b>（垂直，有直角符號）。看 d 和 r 比大小時，交點有幾個。'));
      var host = h('div'); st.append(host);
      sc = lineScene(host, { A: [-3, 1], B: [3, 1], gate: gate, onChange: function (i) {
        ro && ro(i); if (gate.on) return; seen[i.kind] = 1;
        if (seen.out && seen.tan && seen.int && !done) {
          done = true; P.track('aha', { id: 'circle-line', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：d ＞ r 相離');
          st.append(P.ruleBox('圓心到直線的距離 <b>d</b> 和半徑 <b>r</b> 比大小：<br><b>d ＞ r</b> 相離（0 個交點）；<b>d ＝ r</b> 相切（1 個交點）；<b>d ＜ r</b> 相交（2 個交點）。<br>用聯立方程式的判別式也一樣：Δ ＜ 0、＝ 0、＞ 0 ↔ 相離、相切、相交。兩種做法的結論永遠一致。', 'd 與 r 比大小'));
          api.unlock('d 與 r 比大小');
        }
      } });
      ro = lineReadout(st, false); ro(sc.info);
      api.solve(function () { gate.on = false; sc.setA(-5, 3); sc.setB(5, 3); sc.setA(3, 4); sc.setB(3, -4); sc.setA(-2, 0); sc.setB(2, 2); }, false, '相離：d ＝ 6 ＞ r ＝ 5（沒有交點）；d ＝ r 相切、d ＜ r 相交');
      st.append(P.hint('把直線往圓外推、再往圓裡拉，看 d、判別式和交點。要找出恰好相切的那一刻。')); api.lock('先做上面的預測');
    },
    /* 2. 弦長 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, sc, ro;
      P.choice(st, api, { id: 'cl-p2', predict: true, label: '先猜猜看', prompt: '<b>r ＝ 5、d ＝ 3</b>，直線被圓截出的弦，長度是多少？', row: true, options: [{ ok: true, t: '8' }, { t: '4' }, { t: '2' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 A、B 轉動直線'); } });
      st.append(P.instr('直線和圓相交時，圓心、弦的中點、弦的端點構成一個<b>直角三角形</b>：斜邊是半徑 r，一股是 d，另一股是<b>半弦</b>（綠色虛線）。拖動 A、B，看弦長 ＝ 2 × 半弦。'));
      var host = h('div'); st.append(host);
      sc = lineScene(host, { A: [-4, 3], B: [4, 3], tri: true, gate: gate, onChange: function (i) {
        ro && ro(i); if (gate.on) return; if (i.kind === 'int') { var k = i.g.join(); if (!seen[k]) { seen[k] = 1; n++; } }
        if (n >= 4 && !done) {
          done = true; P.track('aha', { id: 'circle-line', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：弦長 ＝ 8');
          st.append(P.ruleBox('半弦 ＝ √(r² − d²)（畢氏定理），所以 <b>弦長 ＝ 2√(r² − d²)</b>。<br>r ＝ 5、d ＝ 3：半弦 ＝ √(25 − 9) ＝ 4，弦長 ＝ <b>8</b>（不是 4，要乘 2）。d ＝ 0 時弦就是直徑 10。', '弦長公式'));
          api.unlock('弦長 ＝ 2√(r² − d²)');
        }
      } });
      ro = lineReadout(st, true); ro(sc.info);
      api.solve(function () { gate.on = false; sc.setA(-4, 3); sc.setB(4, 3); sc.setA(-4, 4); sc.setB(4, 4); sc.setA(-4, 0); sc.setB(4, 0); sc.setA(-2, 1); sc.setB(2, 3); sc.setA(-4, 2); sc.setB(4, 2); }, false, '弦長 ＝ 2√(5² − 3²) ＝ 8（要乘 2）');
      st.append(P.hint('多拖幾個位置，看綠色虛線（半弦）和弦長的關係。')); api.lock('先做上面的預測');
    },
    /* 3. 切線 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'cl-p3', predict: true, label: '先猜猜看', prompt: '從<b>圓外</b>一個點 Q，可以畫幾條切線？', row: true, options: [{ ok: true, t: '2 條' }, { t: '1 條' }, { t: '無限多條' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動 Q'); } });
      st.append(P.instr('拖動點 <b>Q</b>，把它放在圓內、圓上、圓外，看切線有幾條。每條切線都和半徑 OT <b>垂直</b>（直角符號）。'));
      var host = h('div'); st.append(host);
      sc = tanScene(host, { Q: [2, 1], gate: gate, onChange: function (i) {
        ro && ro(i); if (gate.on) return; seen[i.kind] = 1;
        if (seen.in && seen.on && seen.out && !done) {
          done = true; P.track('aha', { id: 'circle-line', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：圓外有 2 條切線');
          st.append(P.ruleBox('圓外一點 <b>2 條</b>切線；圓上一點 <b>1 條</b>；圓內一點 <b>0 條</b>。切線永遠和過切點的半徑<b>垂直</b>。<br>圓 x² ＋ y² ＝ r² 上的點 (x₀, y₀)，切線方程式是 <b>x₀x ＋ y₀y ＝ r²</b>。', '切線'));
          api.unlock('圓外 2 條、圓上 1 條、圓內 0 條');
        }
      } });
      ro = tanReadout(st); ro(sc.info);
      api.solve(function () { gate.on = false; sc.setQ(1, 1); sc.setQ(3, 4); sc.setQ(5, 5); sc.setQ(-4, 3); sc.setQ(2, 1); }, false, '圓外一點 2 條切線，圓上 1 條，圓內 0 條');
      st.append(P.hint('Q 拖到圓裡面、剛好在圓上（例如 (3, 4)）、圓外面，各看一次。')); api.lock('先做上面的預測');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function lineTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, ro, sc = lineScene(b0, { A: cfg.A, B: cfg.B, tri: cfg.tri, onChange: function (i) { ro && ro(i); }, onSettle: function (i) {
            if (cfg.ok(i) && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(i.B[0]), sc.pl.Y(i.B[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } });
          ro = lineReadout(b0, cfg.tri); ro(sc.info); setSolve(function () { sc.setA(cfg.ans[0][0], cfg.ans[0][1]); sc.setB(cfg.ans[1][0], cfg.ans[1][1]); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      function tanTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '點 <b>Q(5, 5)</b> 在圓外。拖動切點 <b>T₁</b>、<b>T₂</b>，畫出從 Q 出發的<b>兩條切線</b>（兩條切線都要通過 Q）。' }));
        var fin = false, ro, sc = tanScene(b0, { twoT: true, Q: [5, 5], T1: [0, -5], T2: [-5, 0], onChange: function (i) { ro && ro(i); }, onSettle: function (i) {
          var T = i.T, ok = T[0][0] * 5 + T[0][1] * 5 === 25 && T[1][0] * 5 + T[1][1] * 5 === 25 && !(T[0][0] === T[1][0] && T[0][1] === T[1][1]);
          if (ok && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(5), sc.pl.Y(5)]); P.toast('兩條切線都通過 Q(5, 5)'); b0.append(P.ruleBox('切點 (x₀, y₀) 的切線是 x₀x ＋ y₀y ＝ 25。要通過 Q(5, 5)：5x₀ ＋ 5y₀ ＝ 25，也就是 x₀ ＋ y₀ ＝ 5，而且切點在圓上：(5, 0) 與 (0, 5)。', '找到了')); done(); } } });
        var pQ = P.pill('', 'is-pink'), pA = P.pill('', 'is-amber'), pB2 = P.pill('', 'is-amber'); [pQ, pA, pB2].forEach(function (p) { p.style.whiteSpace = 'normal'; }); b0.append(h('div', { class: 'pl-readout' }, pQ), h('div', { class: 'pl-readout' }, pA), h('div', { class: 'pl-readout' }, pB2));
        ro = function (i) {
          var T = i.T; pQ.textContent = 'Q ＝ (5, 5)（固定）'; [pA, pB2].forEach(function (p, k) { var t = T[k], v = 5 * t[0] + 5 * t[1]; p.textContent = '切點 T' + (k + 1 === 1 ? '₁' : '₂') + ' ＝ ' + PV.vs(t[0], t[1]) + '，切線 ' + tl(t[0], t[1]) + ' ＝ 25；Q 代入左邊 ＝ ' + v + (v === 25 ? ' ✓ 通過 Q' : ' ✗ 沒通過 Q'); p.className = 'pl-pill ' + (v === 25 ? 'is-ok' : 'is-amber'); });
        };
        ro(sc.info); setSolve(function () { sc.setT1(5, 0); sc.setT2(0, 5); }, '切點是 (5, 0) 與 (0, 5)（切線 x ＝ 5 與 y ＝ 5，都通過 Q(5, 5)）'); b0.append(P.hint('切線 x₀x ＋ y₀y ＝ 25 要通過 Q，把 Q 的座標代進去，x₀ 和 y₀ 要滿足什麼？'));
      }
      var tasks = [
        lineTask({ prompt: '拖動 <b>A</b>、<b>B</b>，讓直線<b>恰好和圓相切</b>。', A: [-3, 5], B: [3, 3], ok: function (i) { return i.kind === 'tan'; }, ans: [[5, -3], [5, 3]], answer: '直線 x ＝ 5（A(5, −3)、B(5, 3)）：d ＝ 5 ＝ r，相切；通過 (1, 3)、(5, 0) 的直線（3x ＋ 4y ＝ 25）也可以', msg: 'd ＝ r ＝ 5：相切', rule: '相切就是 d ＝ r ＝ 5，判別式 ＝ 0。例如鉛直線 x ＝ 5（d ＝ 5），或 3x ＋ 4y ＝ 25（切於 (3, 4)）。', hint: '相切時 d ＝ r，橘色虛線和半徑一樣長（5）。橫線或直線 x ＝ 常數 比較好找。' }),
        lineTask({ prompt: '圓的半徑 r ＝ 5。拖動 <b>A</b>、<b>B</b>，讓直線截出的<b>弦長是 8</b>。', A: [-4, 4], B: [4, 4], tri: true, ok: function (i) { return i.kind === 'int' && 25 * i.n2 - i.c * i.c === 16 * i.n2; }, ans: [[-4, 3], [4, 3]], answer: '直線 y ＝ 3（d ＝ 3）：弦長 ＝ 2√(25 − 9) ＝ 8；y ＝ −3、x ＝ ±3 也可以', msg: 'd ＝ 3：弦長 ＝ 8', rule: '弦長 ＝ 2√(r² − d²) ＝ 8 → √(25 − d²) ＝ 4 → d² ＝ 9 → d ＝ 3。所以直線要離圓心 3：例如 y ＝ 3。', hint: '弦長是 2 × 半弦。半弦是 4，r ＝ 5，那 d 是多少？（3、4、5）' }),
        tanTask];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-line' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'circle-line', moduleName: '圓與直線的關係', askAbout: '圓與直線的關係',
        aha: '<b>d 與 r 比大小</b>決定相離、相切、相交；<b>弦長 ＝ 2√(r² − d²)</b>（別忘了 2 倍）；<b>圓外一點有 2 條切線</b>，切線和半徑垂直。',
        cards: [{ text: 'd ＞ r 相離、d ＝ r 相切、d ＜ r 相交；d ＝ |Ax₀ ＋ By₀ ＋ C| ÷ √(A² ＋ B²)', src: '高中：圓與直線' }, { text: '弦長 ＝ 2√(r² − d²)；圓 x² ＋ y² ＝ r² 上 (x₀, y₀) 的切線是 x₀x ＋ y₀y ＝ r²', src: '弦長與切線' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '切線長公式<br>最短、最長距離' }, { at: 0.85, label: '圓外一點到圓的距離' }] },
        teasers: [{ title: '切線長', q: '圓外一點 Q 到切點的距離（切線長）是 √(OQ² − r²)。為什麼？', where: 'S101 2507 第 18 堂（CH2 直線與圓 08）', lv: 'L2' }],
        parent: { pitfall: '孩子常把 d 與 r 的大小關係記反；弦長漏了乘 2；以為圓外一點只有 1 條切線。', place: '解析幾何的重點，接著是兩圓之間的關係。', ask: ['d ＞ r 的時候，直線和圓有幾個交點？', 'r ＝ 5、d ＝ 3，弦長是多少？為什麼要乘 2？', '圓外一點可以畫幾條切線？'] },
        classes: ['S101（2025 年 11 月，第 17、18 堂）：CH2 直線與圓 07、08（切線）'], next: { href: 'play-circle-circle.html', text: '下一個：兩圓之間的關係' } });
    }];
  new P.Lesson({ id: 'circle-line', title: '圓與直線的關係', steps: steps });
})();
