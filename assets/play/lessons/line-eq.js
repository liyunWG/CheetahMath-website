/* 獵豹玩中學｜直線方程：斜率、五種形式與兩線關係
   預測＋拖 A、B 兩點看傾斜角與斜率 → 預測＋同一條線的五種寫法同步轉換（看哪些形式「不能用」）→ 預測＋轉動 L₂ 看平行、重合、垂直與夾角 → 4 個操作關卡。
   要擊中的迷思：水平線與鉛直線搞反；鉛直線用點斜式／斜截式；截距式用在過原點與水平、鉛直線；垂直寫成 k₁k₂＝1；平行沒檢查是否重合。 */
(function () {
  var P = Play, h = P.h, PV = window.PV, f = PV.f, fr = PV.fr;
  var CA = '#2f6fdc', CB = '#d6336c', CG = '#1f9d55', CT = '#d29b1f', CP = '#7c4dbd', CD = '#8a8470';
  var XR = [-5, 5], YR = [-3, 3];
  function sty(el, color, w, dash) { el.style.stroke = color; el.style.strokeWidth = w + 'px'; if (dash) el.style.strokeDasharray = '6 5'; return el; }
  function wr(t) { return t.length === 1 ? t : '(' + t + ')'; }
  function paren(s) { return (/^−|\//.test(s)) ? '(' + s + ')' : s; }
  function lin(v, c) { return c === 0 ? v : c > 0 ? v + ' − ' + c : v + ' ＋ ' + (-c); }       /* x − 3、y ＋ 2 */
  function kx(s) { return s === '0' ? '' : s === '1' ? 'x' : s === '−1' ? '−x' : (/\//.test(s) ? '(' + s + ')x' : s + 'x'); }
  function term(c, v, first) {
    if (c === 0) return ''; var a = Math.abs(c), co = a === 1 ? '' : '' + a;
    if (first) return (c < 0 ? '−' : '') + co + v; return (c < 0 ? ' − ' : ' ＋ ') + co + v;
  }
  function genStr(g) {
    var s = term(g[0], 'x', true) + term(g[1], 'y', g[0] === 0); if (g[2] !== 0) s += (g[2] < 0 ? ' − ' : ' ＋ ') + Math.abs(g[2]); return s + ' ＝ 0';
  }
  /* 過 A、B 的直線，五種寫法（不能用的形式回傳 null 與原因） */
  function forms(A, B) {
    var x1 = A[0], y1 = A[1], x2 = B[0], y2 = B[1], dx = x2 - x1, dy = y2 - y1, g = PV.gen(x1, y1, x2, y2), vert = dx === 0, hor = dy === 0, out = {};
    var ks = vert ? null : fr(dy, dx), bn = y1 * dx - dy * x1, bd = dx;
    if (!vert) { if (bd < 0) { bn = -bn; bd = -bd; } }
    var bs = vert ? null : fr(Math.abs(bn), bd), bneg = bn < 0, b0 = bn === 0;
    out.g = genStr(g); out.gen = g;
    if (vert) { out.ps = out.sl = null; out.psWhy = out.slWhy = '鉛直線沒有斜率 k'; }
    else {
      var kc = ks === '1' ? '' : ks === '−1' ? '−' : (/\//.test(ks) ? '(' + ks + ')' : ks);
      out.ps = lin('y', y1) + ' ＝ ' + kc + '(' + lin('x', x1) + ')';
      var kp = kx(ks); out.sl = 'y ＝ ' + (kp === '' ? (b0 ? '0' : (bneg ? '−' : '') + bs) : kp + (b0 ? '' : (bneg ? ' − ' : ' ＋ ') + bs));
    }
    if (vert || hor) { out.tp = null; out.tpWhy = '分母會是 0（' + (vert ? 'Δx ＝ 0' : 'Δy ＝ 0') + '）'; } else out.tp = wr(lin('y', y1)) + ' / ' + paren(f(dy)) + ' ＝ ' + wr(lin('x', x1)) + ' / ' + paren(f(dx));
    if (g[2] === 0) { out.ic = null; out.icWhy = '截距是 0，分母不能是 0（過原點）'; }
    else if (vert || hor) { out.ic = null; out.icWhy = '和' + (vert ? ' y' : ' x') + ' 軸平行，只有一個截距'; }
    else out.ic = 'x / ' + paren(fr(-g[2], g[0])) + ' ＋ y / ' + paren(fr(-g[2], g[1])) + ' ＝ 1';
    out.vert = vert; out.hor = hor; out.org = g[2] === 0; return out;
  }

  /* 兩點定一條直線的畫面。o: A、B、fixedA、gate、slope（畫傾斜角與斜率三角形）、sm、onChange(A,B)、onSettle(A,B) */
  function twoPts(host, o) {
    var pl = PV.plane(host, o.sm), b = pl.b, A = o.A.slice(), B = o.B.slice(), S = {};
    var ln = PV.fline(pl, CA, { w: 5 }), ta = b.text([0, 0], 'A', 'pl-text pl-text--blue', pl.gC), tb = b.text([0, 0], 'B', 'pl-text pl-text--blue', pl.gC), tal, hr, tri1, tri2, arc, rt;
    if (o.slope) {
      hr = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gA), CD, 2, true); tri1 = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gA), CT, 3, true); tri2 = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gA), CP, 3, true);
      arc = PV.arc(pl, CG, { w: 4, layer: pl.gA }); rt = PV.right(pl, { layer: pl.gA }); tal = b.text([0, 0], '', 'pl-text pl-text--green', pl.gC);
    }
    function upd() {
      var dx = B[0] - A[0], dy = B[1] - A[1], g = PV.gen(A[0], A[1], B[0], B[1]), L = Math.hypot(dx, dy), u = [dx / L, dy / L];
      ln.set(g[0], g[1], g[2]);
      var cl = PV.clip(g[0], g[1], g[2]), hA = [A[0], A[1], 0.62, 0.62], hB = [B[0], B[1], 0.62, 0.62], avoid = [hA, hB].concat(cl ? PV.segBoxes(cl[0], cl[1], 0.5, 0.1) : []), lA = PV.pick(pl, PV.around(A, u), avoid), lB;
      avoid.push(lA.m); lB = PV.pick(pl, PV.around(B, u), avoid); avoid.push(lB.m);
      if (o.slope) avoid = avoid.concat(PV.segBoxes(A, [PV.XR[1], A[1]], 0.5, 0.1), PV.segBoxes(A, [B[0], A[1]], 0.5, 0.1), PV.segBoxes([B[0], A[1]], B, 0.5, 0.1));
      var al = null;
      if (o.slope) {
        var ux = dx, uy = dy; if (uy < 0 || (uy === 0 && ux < 0)) { ux = -ux; uy = -uy; }
        var a = Math.atan2(uy, ux), deg = a * 180 / Math.PI, base = PV.ring(A, a / 2, [1.9, 2.4, 2.9, 3.4]);
        b.setLine(hr, [pl.X(A[0]), pl.Y(A[1])], [pl.X(PV.XR[1]), pl.Y(A[1])]); b.setLine(tri1, [pl.X(A[0]), pl.Y(A[1])], [pl.X(B[0]), pl.Y(A[1])]); b.setLine(tri2, [pl.X(B[0]), pl.Y(A[1])], [pl.X(B[0]), pl.Y(B[1])]);
        if (Math.abs(deg - 90) < 1e-9) { arc.hide(true); rt.set(A, [1, 0], [0, 1], 0.5); } else { rt.hide(true); arc.hide(false).set(A, 1.0, 0, a); }
        al = PV.pick(pl, base, avoid, [1.5, 0.45]); b.setText(tal, al.b, 'α＝' + f(Math.round(deg * 10) / 10) + '°'); S.alpha = deg;
      }
      b.setText(ta, lA.b, 'A'); b.setText(tb, lB.b, 'B'); S.dx = dx; S.dy = dy; S.g = g;
      if (o.onChange) o.onChange(A, B, S);
    }
    var cands = PV.lattice(pl, XR, YR, true);
    function dis() { return !!(o.gate && o.gate.on); }
    function H(P0, set, other) {
      function apply(t) { set(Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))); upd(); }
      return b.handle({ r: 0.3, pos: [pl.X(P0[0]), pl.Y(P0[1])], candidates: cands, disabled: dis,
        valid: function (t) { var q = other(); return !(Math.round(pl.Xi(t[0])) === q[0] && Math.round(pl.Yi(t[1])) === q[1]); },
        onMove: apply, onEnd: function (t) { apply(t); if (o.onSettle) o.onSettle(A, B, S); } });
    }
    var hA = o.fixedA ? null : H(A, function (x, y) { A[0] = x; A[1] = y; }, function () { return B; }), hB = H(B, function (x, y) { B[0] = x; B[1] = y; }, function () { return A; });
    if (o.fixedA) { b.dot([pl.X(A[0]), pl.Y(A[1])], 'pl-dot pl-dot--blue', b.gTop, 0.2); }
    S.setA = function (x, y) { hA.moveTo([pl.X(x), pl.Y(y)]); }; S.setB = function (x, y) { hB.moveTo([pl.X(x), pl.Y(y)]); }; S.pl = pl; S.A = A; S.B = B;
    upd(); return S;
  }
  function slopeReadout(host) {
    var pAB = P.pill('', 'is-blue'), pK = P.pill('', 'is-green'), pAl = P.pill('', 'is-amber'); pK.style.whiteSpace = 'normal'; pAl.style.whiteSpace = 'normal';
    host.append(h('div', { class: 'pl-readout' }, pAB), h('div', { class: 'pl-readout' }, pK), h('div', { class: 'pl-readout' }, pAl));
    return function (A, B, S) {
      var dx = S.dx, dy = S.dy; pAB.textContent = 'A ＝ ' + PV.vs(A[0], A[1]) + '　B ＝ ' + PV.vs(B[0], B[1]);
      pK.textContent = dx === 0 ? 'Δx ＝ 0：鉛直線，沒有斜率' : 'k ＝ Δy ÷ Δx ＝ ' + f(dy) + ' ÷ ' + (dx < 0 ? '(' + f(dx) + ')' : f(dx)) + ' ＝ ' + fr(dy, dx);
      pAl.textContent = dx === 0 ? 'α ＝ 90°，tan 90° 不存在' : 'α ＝ ' + f(Math.round(S.alpha * 10) / 10) + '°，tan α ＝ ' + f(Math.round(dy / dx * 1000) / 1000);
    };
  }
  function formsTable(host) {
    var rows = {}, names = [['ps', '點斜式', 'is-blue'], ['sl', '斜截式', 'is-pink'], ['tp', '兩點式', 'is-amber'], ['ic', '截距式', 'is-green'], ['g', '一般式', 'is-ok']];
    names.forEach(function (n) {
      var nm = P.pill(n[1], n[2] === 'is-ok' ? 'is-blue' : n[2]), eq = P.pill('', 'is-green'); eq.style.whiteSpace = 'normal'; eq.style.textAlign = 'left'; nm.style.minWidth = '4.2em';
      host.append(h('div', { class: 'pl-readout' }, nm, eq)); rows[n[0]] = { nm: nm, eq: eq };
    });
    return function (A, B) {
      var F = forms(A, B);
      [['ps', 'psWhy'], ['sl', 'slWhy'], ['tp', 'tpWhy'], ['ic', 'icWhy'], ['g', null]].forEach(function (k) {
        var r = rows[k[0]], t = F[k[0]];
        if (t) { r.eq.textContent = t; r.eq.className = 'pl-pill is-green'; r.eq.style.opacity = ''; r.nm.style.opacity = ''; }
        else { r.eq.textContent = '✗ 不能用：' + F[k[1]]; r.eq.className = 'pl-pill'; r.eq.style.opacity = '.7'; r.nm.style.opacity = '.45'; }
      });
      return F;
    };
  }

  /* L₁ 固定（過 (−2,0)、(2,2)，一般式 x − 2y ＋ 2 ＝ 0，斜率 1/2），拖 C、D 決定 L₂。o: C、D、fixedC、gate、sm、onChange(info)、onSettle(info) */
  var G1 = PV.gen(-2, 0, 2, 2), D1 = [4, 2];
  function relScene(host, o) {
    var pl = PV.plane(host, o.sm), b = pl.b, C = o.C.slice(), D = o.D.slice(), S = {};
    var l1 = PV.fline(pl, CA, { w: 5 }), l2 = PV.fline(pl, CB, { w: 5 }); l1.set(G1[0], G1[1], G1[2]);
    var t1 = b.text([0, 0], 'L₁', 'pl-text pl-text--blue', pl.gC), t2 = b.text([0, 0], 'L₂', 'pl-text pl-text--pink', pl.gC), tc = b.text([0, 0], 'C', 'pl-text pl-text--pink', pl.gC), td = b.text([0, 0], 'D', 'pl-text pl-text--pink', pl.gC), ti = b.text([0, 0], 'I', 'pl-text', pl.gC);
    var di = b.dot([0, 0], 'pl-dot pl-dot--amber', pl.gC, 0.2), arc = PV.arc(pl, CG, { w: 4 }), rt = PV.right(pl), ta = b.text([0, 0], '', 'pl-text pl-text--green', pl.gC);
    function endLabelCands(g, avoidDir) {
      var c = PV.clip(g[0], g[1], g[2]); if (!c) return [[0, 0]]; var out = [], u = [c[1][0] - c[0][0], c[1][1] - c[0][1]], L = Math.hypot(u[0], u[1]); u = [u[0] / L, u[1] / L];
      [[c[0], 1], [c[1], -1]].forEach(function (e) { [0, 1, 2, 3, 4].forEach(function (t) { var p = [e[0][0] + u[0] * e[1] * (1.1 + t * 1.5), e[0][1] + u[1] * e[1] * (1.1 + t * 1.5)]; out.push([p[0] - u[1] * 0.85, p[1] + u[0] * 0.85], [p[0] + u[1] * 0.85, p[1] - u[0] * 0.85]); }); });
      return out;
    }
    function upd() {
      var d2 = [D[0] - C[0], D[1] - C[1]], g2 = PV.gen(C[0], C[1], D[0], D[1]), cr = D1[0] * d2[1] - D1[1] * d2[0], dt = D1[0] * d2[0] + D1[1] * d2[1], kind;
      var same = g2[0] === G1[0] && g2[1] === G1[1] && g2[2] === G1[2];
      kind = cr === 0 ? (same ? 'coin' : 'par') : dt === 0 ? 'perp' : 'int';
      l2.set(g2[0], g2[1], g2[2]);
      var u2 = [d2[0] / Math.hypot(d2[0], d2[1]), d2[1] / Math.hypot(d2[0], d2[1])], c1 = PV.clip(G1[0], G1[1], G1[2]), c2 = PV.clip(g2[0], g2[1], g2[2]), avoid = [[C[0], C[1], 0.62, 0.62], [D[0], D[1], 0.62, 0.62]].concat(PV.segBoxes(c1[0], c1[1], 0.5, 0.1), c2 ? PV.segBoxes(c2[0], c2[1], 0.5, 0.1) : []), lc = PV.pick(pl, PV.around(C, u2), avoid); avoid.push(lc.m);
      var ld = PV.pick(pl, PV.around(D, u2), avoid); avoid.push(ld.m);
      var I = null, inside = false; S.theta = null; if (kind === 'int' || kind === 'perp') S.theta = Math.atan2(Math.abs(cr), Math.abs(dt)) * 180 / Math.PI;
      if (kind === 'int' || kind === 'perp') {
        var det = G1[0] * g2[1] - g2[0] * G1[1]; I = [(G1[1] * g2[2] - g2[1] * G1[2]) / det, (g2[0] * G1[2] - G1[0] * g2[2]) / det, det];
        inside = I[0] >= PV.XR[0] + 0.2 && I[0] <= PV.XR[1] - 0.2 && I[1] >= PV.YR[0] + 0.2 && I[1] <= PV.YR[1] - 0.2;
      }
      var li, lal = null;
      if (inside) {
        di.style.display = ''; di.setAttribute('cx', pl.X(I[0])); di.setAttribute('cy', b.Y(pl.Y(I[1])));
        var n1 = Math.hypot(D1[0], D1[1]), e1 = [D1[0] / n1, D1[1] / n1], e2 = [d2[0] / Math.hypot(d2[0], d2[1]), d2[1] / Math.hypot(d2[0], d2[1])];
        if (e1[0] * e2[0] + e1[1] * e2[1] < 0) e2 = [-e2[0], -e2[1]];            /* 取銳角那一側 */
        if (kind === 'perp') { arc.hide(true); rt.set(I, e1, e2, 0.5); }
        else { rt.hide(true); var a1 = Math.atan2(e1[1], e1[0]), a2 = Math.atan2(e2[1], e2[0]); if (a2 - a1 > Math.PI) a2 -= 2 * Math.PI; if (a1 - a2 > Math.PI) a2 += 2 * Math.PI; arc.hide(false).set(I, 0.8, a1, a2); }
        var mid = Math.atan2(e1[1] + e2[1], e1[0] + e2[0]);
        if (kind === 'perp') mid = Math.atan2(e1[1] + e2[1], e1[0] + e2[0]);
        var cands = PV.ring(I, mid, [1.9, 2.4, 2.9, 3.4, 4.0, 4.6]);
        if (!o.noI) { li = PV.pick(pl, PV.around(I, e1, 1.0), avoid); avoid.push(li.m); b.setText(ti, li.b, 'I'); } else b.setText(ti, [0, 0], '');
        var th = S.theta;
        lal = PV.pick(pl, cands, avoid, [1.5, 0.45]); b.setText(ta, lal.b, kind === 'perp' ? '90°' : 'θ＝' + f(Math.round(th * 10) / 10) + '°'); avoid.push(lal.m);
      } else { di.style.display = 'none'; arc.hide(true); rt.hide(true); b.setText(ti, [0, 0], ''); b.setText(ta, [0, 0], ''); }
      var lab1 = PV.pick(pl, endLabelCands(G1), avoid, [0.4, 0.45]); avoid.push(lab1.m); b.setText(t1, lab1.b, 'L₁');
      var lab2 = PV.pick(pl, endLabelCands(g2), avoid, [0.4, 0.45]); b.setText(t2, lab2.b, 'L₂');
      b.setText(tc, lc.b, 'C'); b.setText(td, ld.b, 'D');
      var info = { kind: kind, g2: g2, d2: d2, I: I, inside: inside, cr: cr, dt: dt, theta: S.theta }; S.info = info; if (o.onChange) o.onChange(info, C, D);
    }
    var cands = PV.lattice(pl, XR, YR, true);
    function dis() { return !!(o.gate && o.gate.on); }
    function H(P0, set, other) {
      function apply(t) { set(Math.round(pl.Xi(t[0])), Math.round(pl.Yi(t[1]))); upd(); }
      return b.handle({ r: 0.3, pos: [pl.X(P0[0]), pl.Y(P0[1])], candidates: cands, disabled: dis,
        valid: function (t) { var q = other(); return !(Math.round(pl.Xi(t[0])) === q[0] && Math.round(pl.Yi(t[1])) === q[1]); },
        onMove: apply, onEnd: function (t) { apply(t); if (o.onSettle) o.onSettle(S.info, C, D); } });
    }
    var hC = o.fixedC ? null : H(C, function (x, y) { C[0] = x; C[1] = y; }, function () { return D; }), hD = H(D, function (x, y) { D[0] = x; D[1] = y; }, function () { return C; });
    if (o.fixedC) b.dot([pl.X(C[0]), pl.Y(C[1])], 'pl-dot pl-dot--pink', pl.gC, 0.2);
    S.setC = function (x, y) { hC.moveTo([pl.X(x), pl.Y(y)]); }; S.setD = function (x, y) { hD.moveTo([pl.X(x), pl.Y(y)]); }; S.pl = pl;
    upd(); return S;
  }
  /* 兩線關係的文字讀數 */
  function relReadout(host) {
    var pK = P.pill('', 'is-blue'), pL = P.pill('', 'is-pink'), pR = P.pill('', 'is-green'), pT = P.pill('', 'is-amber'); [pK, pL, pR, pT].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pK, pL), h('div', { class: 'pl-readout' }, pR), h('div', { class: 'pl-readout' }, pT));
    return function (info) {
      var d2 = info.d2, vert = d2[0] === 0, k2 = vert ? null : fr(d2[1], d2[0]);
      pK.textContent = 'L₁：k₁ ＝ 1/2，y 截距 1'; pL.textContent = 'L₂：' + genStr(info.g2);
      var g2 = info.g2, yint = g2[1] === 0 ? null : fr(-g2[2], g2[1]);
      if (info.kind === 'coin') { pR.textContent = 'k₂ ＝ ' + k2 + '，y 截距 ' + yint + '：斜率相同、截距也相同 → 同一條線（重合）'; pR.className = 'pl-pill is-green'; pT.textContent = '重合不算「平行」：記得檢查截距'; }
      else if (info.kind === 'par') { pR.textContent = vert ? 'L₂ 鉛直' : 'k₂ ＝ ' + k2 + ' ＝ k₁，但 y 截距 ' + yint + ' ≠ 1 → 平行（不重合）'; pR.className = 'pl-pill is-green'; pT.textContent = '平行：斜率相同、截距不同，永遠不相交'; }
      else if (info.kind === 'perp') { pR.textContent = 'k₁ × k₂ ＝ 1/2 × (' + k2 + ') ＝ ' + fr(d2[1], 2 * d2[0]) + ' → 垂直'; pR.className = 'pl-pill is-green'; pT.textContent = '垂直：k₁k₂ ＝ −1（有負號）；夾角 90°'; }
      else {
        pR.textContent = vert ? 'L₂ 是鉛直線，k₂ 不存在' : 'k₁ × k₂ ＝ 1/2 × (' + k2 + ') ＝ ' + fr(d2[1], 2 * d2[0]) + ' ≠ −1，不垂直';
        pR.className = 'pl-pill is-green';
        var i = info.I;
        pT.textContent = '交點 I ＝ (' + fr(Math.round(i[0] * i[2]), i[2]) + ', ' + fr(Math.round(i[1] * i[2]), i[2]) + ')' + (info.inside ? '' : '（在畫面外）') + '　夾角 θ ＝ ' + f(Math.round(info.theta * 10) / 10) + '°';
      }
      if (info.kind === 'perp' || info.kind === 'int') { /* 夾角公式（兩條線都有斜率時才能用） */
        var tt = null; if (!vert) { var k1 = 0.5, kk = d2[1] / d2[0]; if (Math.abs(1 + k1 * kk) > 1e-9) tt = Math.abs((k1 - kk) / (1 + k1 * kk)); }
        if (info.kind === 'int') pT.textContent += (vert ? '（k₂ 不存在，tan θ 的公式不能用）' : tt === null ? '' : '，tan θ ＝ |(k₁−k₂)/(1＋k₁k₂)| ＝ ' + f(Math.round(tt * 1000) / 1000));
      }
    };
  }

  var steps = [
    /* 1. 傾斜角與斜率 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'le-p1', predict: true, label: '先猜猜看', prompt: '一條<b>水平線</b>（和 x 軸平行）的斜率是多少？', row: true, options: [{ ok: true, t: '0' }, { t: '1' }, { t: '斜率不存在' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 A、B 兩個點'); } });
      st.append(P.instr('拖動 <b>A</b>、<b>B</b> 兩個點，直線跟著轉。綠色弧是<b>傾斜角 α</b>（從 x 軸正向逆時針轉到直線），橘色與紫色虛線是 <b>Δx、Δy</b>。'));
      var host = h('div'); st.append(host);
      sc = twoPts(host, { slope: true, A: [-2, -1], B: [2, 1], gate: gate, onChange: function (A, B, S) {
        ro && ro(A, B, S); if (gate.on) return;
        if (S.dy === 0) seen.h = 1; if (S.dx === 0) seen.v = 1; if (S.dx !== 0 && S.dy / S.dx > 0) seen.p = 1; if (S.dx !== 0 && S.dy / S.dx < 0) seen.n = 1;
        if (seen.h && seen.v && seen.p && seen.n && !done) {
          done = true; P.track('aha', { id: 'line-eq', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：水平線的斜率是 0');
          st.append(P.ruleBox('斜率 <b>k ＝ tan α ＝ Δy ÷ Δx</b>。<br><b>水平線</b>：Δy ＝ 0，α ＝ 0°，<b>k ＝ 0</b>。<b>鉛直線</b>：Δx ＝ 0，α ＝ 90°，<b>斜率不存在</b>（不能除以 0）。<br>α ＜ 90° 時 k ＞ 0（往右上），α ＞ 90° 時 k ＜ 0（往右下）。同一條線上任取兩點，Δy ÷ Δx 都一樣。', '傾斜角與斜率'));
          api.unlock('水平線 k ＝ 0；鉛直線沒有斜率');
        }
      } });
      ro = slopeReadout(st); ro(sc.A, sc.B, sc);
      api.solve(function () { gate.on = false; sc.setB(2, -1); sc.setB(-2, 2); sc.setB(2, 1); sc.setB(1, -3); sc.setB(2, 1); }, false, '水平線的斜率是 0；鉛直線沒有斜率；α ＜ 90° 斜率為正，α ＞ 90° 斜率為負');
      st.append(P.hint('先拉成水平、再拉成鉛直，然後試試往右上和往右下，看 α 與 k 怎麼變。')); api.lock('先做上面的預測');
    },
    /* 2. 五種形式 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, upT;
      P.choice(st, api, { id: 'le-p2', predict: true, label: '先猜猜看', prompt: '鉛直線 <b>x ＝ 2</b> 可以寫成斜截式 <b>y ＝ kx ＋ b</b> 嗎？', row: true, options: [{ ok: true, t: '不行，找不到斜率 k' }, { t: '可以，k ＝ 0' }, { t: '可以，k ＝ 2' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 A、B 兩個點'); } });
      st.append(P.instr('同一條直線，五種寫法同步轉換。拖動 <b>A</b>、<b>B</b>，看哪些寫法會變成「<b>✗ 不能用</b>」，想想為什麼。'));
      var host = h('div'); st.append(host);
      sc = twoPts(host, { A: [-2, 1], B: [2, 3], gate: gate, onChange: function (A, B) {
        var F = upT && upT(A, B); if (!F || gate.on) return;
        if (F.vert) seen.v = 1; else if (F.hor) seen.h = 1; else if (F.org) seen.o = 1;
        if (seen.v && seen.h && seen.o && !done) {
          done = true; P.track('aha', { id: 'line-eq', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：鉛直線沒有斜率');
          st.append(P.ruleBox('<b>點斜式、斜截式</b>需要斜率：鉛直線不能用。<b>兩點式</b>分母不能是 0：水平線、鉛直線不能用。<b>截距式 x/a ＋ y/b ＝ 1</b> 的 a、b 是分母，不能是 0：過原點、水平線、鉛直線都不能用。<br><b>一般式 Ax ＋ By ＋ C ＝ 0</b> 永遠可以用（鉛直線 x ＝ 2 就是 x − 2 ＝ 0）。給條件時，先看有沒有特殊情形，再選形式。', '五種形式'));
          api.unlock('一般式永遠可以用');
        }
      } });
      upT = formsTable(st); upT(sc.A, sc.B);
      api.solve(function () { gate.on = false; sc.setA(-2, 1); sc.setB(-2, 3); sc.setB(2, 1); sc.setA(-2, -1); sc.setB(2, 1); sc.setA(-2, 1); sc.setB(2, 3); }, false, '鉛直線：只有一般式能用；水平線：點斜式、斜截式、一般式能用；過原點：截距式不能用');
      st.append(P.hint('把直線拉成鉛直、水平，還有「剛好過原點」的樣子，各看一次。')); api.lock('先做上面的預測');
    },
    /* 3. 兩線關係 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'le-p3', predict: true, label: '先猜猜看', prompt: '兩條直線的斜率都是 <b>1/2</b>，它們<b>一定平行</b>嗎？', row: true, options: [{ ok: true, t: '不一定，也可能是同一條線' }, { t: '一定平行，不會重合' }, { t: '一定相交' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動 C、D 兩個點'); } });
      st.append(P.instr('藍線 <b>L₁</b> 固定。拖動 <b>C</b>、<b>D</b> 轉動粉紅線 <b>L₂</b>，看它們的關係：平行、重合、垂直，或是相交（會標出交點 I 與夾角 θ）。'));
      var host = h('div'); st.append(host);
      sc = relScene(host, { C: [-3, -2], D: [3, -1], gate: gate, onChange: function (info) {
        ro && ro(info); if (gate.on) return; seen[info.kind] = 1;
        if (seen.par && seen.coin && seen.perp && seen.int && !done) {
          done = true; P.track('aha', { id: 'line-eq', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：斜率相同還要看截距');
          st.append(P.ruleBox('<b>平行</b>：k₁ ＝ k₂，而且截距不同。截距也相同就是<b>重合</b>（同一條線）。<br><b>垂直</b>：<b>k₁ × k₂ ＝ −1</b>（不是 1）；若一條線鉛直，只有另一條水平才垂直。<br>其他情形相交於一點，夾角 <b>tan θ ＝ |(k₁ − k₂) / (1 ＋ k₁k₂)|</b>。交點就是兩個方程式的聯立解。', '兩線關係'));
          api.unlock('平行要看截距；垂直 k₁k₂ ＝ −1');
        }
      } });
      ro = relReadout(st); ro(sc.info);
      api.solve(function () { gate.on = false; sc.setC(0, -1); sc.setD(2, 0); sc.setC(-2, 0); sc.setD(2, 2); sc.setC(1, 1); sc.setD(2, -1); sc.setC(-3, -2); sc.setD(3, -1); }, false, '斜率相同且截距不同才是平行；截距也相同是重合；垂直時 k₁k₂ ＝ −1');
      st.append(P.hint('把 L₂ 拉到和 L₁ 平行、剛好疊在一起、垂直，各看一次。')); api.lock('先做上面的預測');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function slopeTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '直線過定點 <b>A(−2, 1)</b>（藍點，固定）。拖動 <b>B</b>，讓直線的<b>斜率是 −1/2</b>。' }));
        var fin = false, ro, sc = twoPts(b0, { slope: true, A: [-2, 1], B: [1, 2], fixedA: true, onChange: function (A, B, S) { ro && ro(A, B, S); }, onSettle: function (A, B, S) {
          if (S.dx !== 0 && 2 * S.dy + S.dx === 0 && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(B[0]), sc.pl.Y(B[1])]); P.toast('k ＝ ' + fr(S.dy, S.dx)); b0.append(P.ruleBox('k ＝ Δy ÷ Δx ＝ −1/2：往右 2，往下 1（或往右 4，往下 2…）。這樣的 B 不只一個，它們都在同一條線上。', '找到了')); done(); } } });
        ro = slopeReadout(b0); ro(sc.A, sc.B, sc);
        setSolve(function () { sc.setB(2, -1); }, 'B ＝ (2, −1)（Δx ＝ 4，Δy ＝ −2，k ＝ −1/2）；(0, 0)、(4, −2) 也可以'); b0.append(P.hint('往右走 2，要往上還是往下走 1？'));
      }
      function formTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>A</b>、<b>B</b>，讓直線的<b>一般式剛好是 2x − 3y − 6 ＝ 0</b>。' }));
        var fin = false, up, sc = twoPts(b0, { A: [-2, 1], B: [2, 3], onChange: function (A, B) { up && up(A, B); }, onSettle: function (A, B, S) {
          if (S.g[0] === 2 && S.g[1] === -3 && S.g[2] === -6 && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(B[0]), sc.pl.Y(B[1])]); P.toast('2x − 3y − 6 ＝ 0'); b0.append(P.ruleBox('令 y ＝ 0 得 x ＝ 3，令 x ＝ 0 得 y ＝ −2，所以直線過 (3, 0) 與 (0, −2)，截距式是 x/3 ＋ y/(−2) ＝ 1，兩邊都能變回 2x − 3y − 6 ＝ 0。', '找到了')); done(); } } });
        up = formsTable(b0); up(sc.A, sc.B);
        setSolve(function () { sc.setA(3, 0); sc.setB(0, -2); }, '直線過 (3, 0) 與 (0, −2)（令 y ＝ 0 得 x ＝ 3，令 x ＝ 0 得 y ＝ −2）；(6, 2) 也在線上'); b0.append(P.hint('這條線和兩條軸各相交在哪裡？令 y ＝ 0、令 x ＝ 0 看看。'));
      }
      function relTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, ro, sc = relScene(b0, { noI: true, C: cfg.C, D: cfg.D0, fixedC: true, onChange: function (info) { ro && ro(info); }, onSettle: function (info, C, D) {
            if (info.kind === cfg.kind && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(D[0]), sc.pl.Y(D[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } });
          ro = relReadout(b0); ro(sc.info); setSolve(function () { sc.setD(cfg.ans[0], cfg.ans[1]); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [slopeTask, formTask,
        relTask({ prompt: 'L₂ 過定點 <b>C(0, −1)</b>（粉紅點，固定）。拖動 <b>D</b>，讓 L₂ <b>和 L₁ 平行</b>（不能重合）。', C: [0, -1], D0: [2, 2], kind: 'par', ans: [2, 0], answer: 'D ＝ (2, 0)（斜率 1/2，y 截距 −1）；(4, 1)、(−2, −2) 也可以', msg: 'k₂ ＝ 1/2，截距不同：平行', rule: 'L₂ 要和 L₁ 的斜率一樣（k ＝ 1/2），所以 D 是從 C 往右 2、往上 1。C 不在 L₁ 上，所以不會重合。', hint: '平行就是斜率一樣：從 C 出發，往右 2、往上 1。' }),
        relTask({ prompt: 'L₂ 過定點 <b>C(1, 1)</b>（粉紅點，固定）。拖動 <b>D</b>，讓 L₂ <b>和 L₁ 垂直</b>。', C: [1, 1], D0: [3, 2], kind: 'perp', ans: [2, -1], answer: 'D ＝ (2, −1)（k₂ ＝ −2，1/2 × (−2) ＝ −1）；(0, 3) 也可以', msg: 'k₁k₂ ＝ −1：垂直', rule: 'k₁ ＝ 1/2，垂直要 k₂ ＝ −2（1/2 × (−2) ＝ −1）：從 C 往右 1、往下 2。', hint: '垂直要 k₁k₂ ＝ −1，k₂ 該是多少？往右 1 要往上還是下走幾格？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'line-eq' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'line-eq', moduleName: '直線方程：斜率、五種形式與兩線關係', askAbout: '直線的斜率、方程式的五種形式與兩條直線的關係',
        aha: '<b>水平線 k ＝ 0，鉛直線沒有斜率</b>；<b>形式不能用，是因為分母或斜率不存在</b>；平行要<b>檢查截距</b>，垂直是 <b>k₁k₂ ＝ −1</b>。',
        cards: [{ text: 'k ＝ tan α ＝ (y₂ − y₁)/(x₂ − x₁)；平行 k₁ ＝ k₂（截距不同）；垂直 k₁k₂ ＝ −1（或 A₁A₂ ＋ B₁B₂ ＝ 0）', src: '高中：直線方程' }, { text: '夾角：tan θ ＝ |(k₁ − k₂)/(1 ＋ k₁k₂)|；一般式 Ax ＋ By ＋ C ＝ 0 永遠可以用', src: '兩直線的夾角' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '點到直線的距離<br>兩平行線的距離' }, { at: 0.85, label: '線性規劃' }] },
        teasers: [{ title: '點到直線的距離', q: '點 (x₀, y₀) 到直線 Ax ＋ By ＋ C ＝ 0 的距離，為什麼是 |Ax₀ ＋ By₀ ＋ C| ÷ √(A² ＋ B²)？', where: 'S101 2507「CH2 直線與圓」系列（第 9 堂起）', lv: 'L2' }],
        parent: { pitfall: '孩子常把水平線和鉛直線的斜率弄反；用截距式寫過原點的線；垂直時寫成 k₁k₂ ＝ 1；平行時沒檢查是不是同一條線。', place: '高中解析幾何的第一步，接著就是圓與直線、圓與圓。', ask: ['水平線的斜率是多少？鉛直線呢？', '為什麼過原點的線不能用截距式？', '斜率都是 2 的兩條線，一定平行嗎？'] },
        classes: ['S101（2025 年 8 月，第 9 堂）：CH2 直線與圓 01'], next: { href: 'play-circle-std.html', text: '下一個：圓的方程（標準式）' } });
    }];
  new P.Lesson({ id: 'line-eq', title: '直線方程：斜率、五種形式與兩線關係', steps: steps });
})();
