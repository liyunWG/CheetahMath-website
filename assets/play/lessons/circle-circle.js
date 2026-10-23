/* 獵豹玩中學｜兩圓之間的關係
   預測＋拖第二個圓的圓心與半徑，看圓心距 d 與 r₁＋r₂、|r₁−r₂| 比大小，數公切線 4、3、2、1、0 條 → 預測＋兩圓方程式相減得到的直線（相交時是公共弦）→ 3 個操作關卡。
   圓 C₁ 固定：圓心 (−2, 0)、半徑 3。要擊中的迷思：外切與內切的條件搞混；漏了內切有 1 條公切線；兩圓不相交時，相減得到的直線不是公共弦。 */
(function () {
  var PV = window.PV; PV.XR = [-8.25, 8.25]; PV.YR = [-5.5, 5.5];
  var P = Play, h = P.h, f = PV.f;
  var C1 = [-2, 0], R1 = 3, CA = '#2f6fdc', CB = '#d6336c', CG = '#1f9d55', CT = '#d29b1f', CP = '#7c4dbd', CD = '#8a8470';
  var XW = [-6, 6], YW = [-4, 4], PLEX = { skipX: [-7, -5, -3, -1, 1, 3, 5, 7], skipY: [-5, -3, -1, 1, 3, 5] };
  var KIND = { out: ['外離', 4], ext: ['外切', 3], int: ['相交', 2], inner: ['內切', 1], in: ['內含', 0], same: ['重合', 0] };
  function sty(el, color, w, dash) { el.style.stroke = color; el.style.strokeWidth = w + 'px'; if (dash) el.style.strokeDasharray = '6 5'; return el; }
  function tl(a, b) { var s = ''; if (a !== 0) s += (a === 1 ? '' : a === -1 ? '−' : f(a)) + 'x'; if (b !== 0) s += (s === '' ? (b < 0 ? '−' : '') : (b < 0 ? ' − ' : ' ＋ ')) + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y'; return s; }
  function lineStr(A, B, C) { return tl(A, B) + (C === 0 ? '' : C < 0 ? ' − ' + (-C) : ' ＋ ' + C) + ' ＝ 0'; }
  function circStr(a, b, r) { var F = a * a + b * b - r * r; return 'x² ＋ y²' + (a === 0 ? '' : (a < 0 ? ' ＋ ' : ' − ') + (Math.abs(2 * a)) + 'x') + (b === 0 ? '' : (b < 0 ? ' ＋ ' : ' − ') + (Math.abs(2 * b)) + 'y') + (F === 0 ? '' : F < 0 ? ' − ' + (-F) : ' ＋ ' + F) + ' ＝ 0'; }
  function cboxes(c, r) { var o = [], k, n = Math.max(16, Math.round(r * 8)); for (k = 0; k < n; k++) { var t = 2 * Math.PI * k / n; o.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), 0.12, 0.12]); } return o; }
  function circles(c2, r2) {   /* 兩圓的關係（全部用整數比較） */
    var d2 = (c2[0] - C1[0]) * (c2[0] - C1[0]) + (c2[1] - C1[1]) * (c2[1] - C1[1]), s2 = (R1 + r2) * (R1 + r2), m2 = (R1 - r2) * (R1 - r2), kind;
    if (d2 === 0) kind = R1 === r2 ? 'same' : 'in'; else kind = d2 > s2 ? 'out' : d2 === s2 ? 'ext' : d2 > m2 ? 'int' : d2 === m2 ? 'inner' : 'in';
    return { d2: d2, d: Math.sqrt(d2), s2: s2, m2: m2, kind: kind };
  }
  function tangents(c2, r2) {
    var dx = c2[0] - C1[0], dy = c2[1] - C1[1], d = Math.hypot(dx, dy), out = []; if (d < 1e-9) return out; var th = Math.atan2(dy, dx);
    [r2 - R1, -(r2 + R1)].forEach(function (delta) {
      var q = delta / d; if (Math.abs(q) > 1 + 1e-9) return; q = Math.max(-1, Math.min(1, q)); var al = Math.acos(q), phis = (al < 1e-7 || Math.abs(al - Math.PI) < 1e-7) ? [th + al] : [th + al, th - al];
      phis.forEach(function (phi) { var n = [Math.cos(phi), Math.sin(phi)]; out.push([n[0], n[1], -(n[0] * C1[0] + n[1] * C1[1] - R1)]); });
    });
    return out;
  }
  function radical(c2, r2) {   /* 兩圓方程式相減：(C₁) − (C₂) ＝ 0，整數、最簡 */
    var A = 2 * (c2[0] - C1[0]), B = 2 * (c2[1] - C1[1]), C = (C1[0] * C1[0] + C1[1] * C1[1] - R1 * R1) - (c2[0] * c2[0] + c2[1] * c2[1] - r2 * r2); if (A === 0 && B === 0) return null;
    var g = PV.gcd(PV.gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return [A, B, C];
  }

  /* 兩圓的畫面。o: C2、R2（初值）、tang（畫公切線）、chord（畫公共弦與相減的直線）、fixedC2、gate、onChange(info)、onSettle(info) */
  function scene(host, o) {
    var pl = PV.plane(host, false, PLEX), b = pl.b, c2 = o.C2.slice(), r2 = o.R2, S = {};
    var k1 = PV.circ(pl, CA, { w: 4 }), k2 = PV.circ(pl, CB, { w: 4 }), tg = [0, 1, 2, 3].map(function () { return PV.fline(pl, CT, { w: 3, dash: true }); }), rad = PV.fline(pl, CP, { w: 3, dash: true }), chord = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CG, 7), cl = sty(b.line([0, 0], [0, 0], 'pl-line', pl.gC), CD, 2, true);
    var dot1 = b.dot([pl.X(C1[0]), pl.Y(C1[1])], 'pl-dot pl-dot--blue', pl.gC, 0.2), dot2 = b.dot([0, 0], 'pl-dot pl-dot--pink', pl.gC, 0.2), t1 = b.text([0, 0], 'C₁', 'pl-text pl-text--blue', pl.gC), t2 = b.text([0, 0], 'C₂', 'pl-text pl-text--pink', pl.gC), td = b.text([0, 0], 'd', 'pl-text pl-text--amber', pl.gC);
    var i1 = b.dot([0, 0], 'pl-dot pl-dot--green', pl.gC, 0.16), i2 = b.dot([0, 0], 'pl-dot pl-dot--green', pl.gC, 0.16);
    k1.set(C1, R1);
    function set2(el, p, q) { b.setLine(el, [pl.X(p[0]), pl.Y(p[1])], [pl.X(q[0]), pl.Y(q[1])]); }
    function upd() {
      var I = circles(c2, r2), tl2 = o.tang ? tangents(c2, r2) : [], rad2 = o.chord ? radical(c2, r2) : null; k2.set(c2, r2);
      tg.forEach(function (ln, i) { if (tl2[i]) ln.hide(false).set(tl2[i][0], tl2[i][1], tl2[i][2]); else ln.hide(true); });
      if (rad2) rad.hide(false).set(rad2[0], rad2[1], rad2[2]); else rad.hide(true);
      chord.style.display = i1.style.display = i2.style.display = 'none'; var pts = null;
      if (o.chord && I.kind === 'int') { var ex = [(c2[0] - C1[0]) / I.d, (c2[1] - C1[1]) / I.d], a = (I.d2 + R1 * R1 - r2 * r2) / (2 * I.d), hh = Math.sqrt(R1 * R1 - a * a), m = [C1[0] + ex[0] * a, C1[1] + ex[1] * a]; pts = [[m[0] - ex[1] * hh, m[1] + ex[0] * hh], [m[0] + ex[1] * hh, m[1] - ex[0] * hh]]; chord.style.display = ''; set2(chord, pts[0], pts[1]); [[i1, pts[0]], [i2, pts[1]]].forEach(function (k) { k[0].style.display = ''; k[0].setAttribute('cx', pl.X(k[1][0])); k[0].setAttribute('cy', b.Y(pl.Y(k[1][1]))); }); }
      dot2.setAttribute('cx', pl.X(c2[0])); dot2.setAttribute('cy', b.Y(pl.Y(c2[1]))); set2(cl, C1, c2); cl.style.display = I.d2 === 0 ? 'none' : '';
      var avoid = [[C1[0], C1[1], 0.62, 0.62], [c2[0], c2[1], 0.62, 0.62]].concat(cboxes(C1, R1), cboxes(c2, r2), I.d2 > 0 ? PV.segBoxes(C1, c2, 0.5, 0.1) : []), u = I.d2 === 0 ? [1, 0] : [(c2[0] - C1[0]) / I.d, (c2[1] - C1[1]) / I.d];
      var l1 = PV.pick(pl, PV.ring(C1, Math.atan2(-u[1], -u[0]) + Math.PI / 2, [1.1, 1.5, 2.0, 2.6, 3.3, 4.0]), avoid, [0.4, 0.45]); avoid.push(l1.m); var l2 = PV.pick(pl, PV.ring(c2, Math.atan2(u[1], u[0]) + Math.PI / 2, [1.1, 1.5, 2.0, 2.6, 3.3, 4.0]), avoid, [0.4, 0.45]); avoid.push(l2.m);
      b.setText(t1, l1.b, 'C₁'); b.setText(t2, l2.b, 'C₂');
      if (I.d2 > 0) { var mid = [(C1[0] + c2[0]) / 2, (C1[1] + c2[1]) / 2], nv = [-u[1], u[0]], ld = PV.pick(pl, [[mid[0] + nv[0] * 0.6, mid[1] + nv[1] * 0.6], [mid[0] - nv[0] * 0.6, mid[1] - nv[1] * 0.6], [mid[0] + nv[0] * 1.0, mid[1] + nv[1] * 1.0], [mid[0] - nv[0] * 1.0, mid[1] - nv[1] * 1.0]].concat(PV.ring(mid, Math.atan2(nv[1], nv[0]), [1.3, 1.7, 2.2])), avoid, [0.3, 0.45]); b.setText(td, ld.b, 'd'); } else b.setText(td, [0, 0], '');
      var info = { C2: c2.slice(), r2: r2, kind: I.kind, d: I.d, d2: I.d2, s: R1 + r2, m: Math.abs(R1 - r2), tangents: tl2, rad: rad2, pts: pts }; S.info = info; if (o.onChange) o.onChange(info);
    }
    var cands = PV.lattice(pl, XW, YW, true);
    function dis() { return !!(o.gate && o.gate.on); }
    if (!o.fixedC2) { var hC = b.handle({ r: 0.3, cls: 'is-pink', pos: [pl.X(c2[0]), pl.Y(c2[1])], candidates: cands, disabled: dis, onMove: function (t) { c2[0] = Math.round(pl.Xi(t[0])); c2[1] = Math.round(pl.Yi(t[1])); upd(); }, onEnd: function () { if (o.onSettle) o.onSettle(S.info); } }); S.setC = function (x, y) { hC.moveTo([pl.X(x), pl.Y(y)]); }; }
    var sn = P.stepper('圓 C₂ 的半徑 r₂', 1, 6, r2, function (v) { if (dis()) { sn.set(r2, true); P.toast('先做上面的預測'); return; } r2 = v; upd(); if (o.onSettle) o.onSettle(S.info); }, function (v) { return v; });
    host.append(h('div', { class: 'pl-steprow' }, sn.el));
    S.setR = function (v) { sn.set(v); }; S.pl = pl; S.upd = upd; upd(); return S;
  }
  function readout(host, mode) {
    var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-green'), p3 = P.pill('', 'is-amber'), p4 = P.pill('', 'is-pink'); [p1, p2, p3, p4].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, p1), h('div', { class: 'pl-readout' }, p2), h('div', { class: 'pl-readout' }, p3)); if (mode === 'chord') host.append(h('div', { class: 'pl-readout' }, p4));
    return function (i) {
      var d = Math.round(i.d * 100) / 100;
      if (mode === 'chord') {
        p1.textContent = 'C₁：' + circStr(C1[0], C1[1], R1); p2.textContent = 'C₂：' + circStr(i.C2[0], i.C2[1], i.r2);
        p3.textContent = i.rad ? 'C₁ − C₂：' + lineStr(i.rad[0], i.rad[1], i.rad[2]) : '兩圓同圓心，相減沒有直線';
        p4.textContent = i.kind === 'int' ? '兩圓相交：這條直線就是公共弦所在的直線（兩個交點都在上面）' : i.kind === 'ext' || i.kind === 'inner' ? '兩圓相切：這條直線是過切點的公切線，沒有公共弦' : i.kind === 'same' ? '兩圓重合' : '兩圓沒有交點：相減還是得到一條直線，但它不是公共弦'; p4.className = 'pl-pill ' + (i.kind === 'int' ? 'is-ok' : 'is-pink');
      } else {
        p1.textContent = '圓心距 d ＝ ' + f(d) + '　r₁ ＋ r₂ ＝ ' + i.s + '　|r₁ − r₂| ＝ ' + i.m; var K = KIND[i.kind];
        p2.textContent = i.kind === 'same' ? '兩圓重合' : ('d ' + (i.kind === 'out' ? '＞ r₁ ＋ r₂' : i.kind === 'ext' ? '＝ r₁ ＋ r₂' : i.kind === 'int' ? '介於 |r₁ − r₂| 與 r₁ ＋ r₂ 之間' : i.kind === 'inner' ? '＝ |r₁ − r₂|' : '＜ |r₁ − r₂|') + ' → ' + K[0]); p2.className = 'pl-pill ' + (i.kind === 'ext' || i.kind === 'inner' ? 'is-ok' : 'is-green');
        p3.textContent = '公切線 ' + K[1] + ' 條（圖上的橘色虛線）';
      }
    };
  }

  var steps = [
    /* 1. 外離、外切、相交、內切、內含 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'cc-p1', predict: true, label: '先猜猜看', prompt: '兩圓的半徑是 <b>3 和 2</b>，圓心距 <b>d ＝ 5</b>，兩圓的關係是？', row: true, options: [{ ok: true, t: '外切' }, { t: '相交' }, { t: '外離' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 C₂、調整半徑 r₂'); } });
      st.append(P.instr('藍圓 <b>C₁</b> 固定（半徑 3）。拖動粉紅圓的圓心 <b>C₂</b>、用按鈕調整半徑 <b>r₂</b>，看圓心距 d 和 <b>r₁＋r₂</b>、<b>|r₁−r₂|</b> 比大小，再數數橘色的<b>公切線</b>有幾條。'));
      var host = h('div'); st.append(host);
      sc = scene(host, { C2: [2, 2], R2: 2, tang: true, gate: gate, onChange: function (i) {
        ro && ro(i); if (gate.on) return; seen[i.kind] = 1;
        if (seen.out && seen.ext && seen.int && seen.inner && seen.in && !done) {
          done = true; P.track('aha', { id: 'circle-circle', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：d ＝ r₁ ＋ r₂ 是外切');
          st.append(P.ruleBox('<b>d ＞ r₁＋r₂</b> 外離（4 條公切線）；<b>d ＝ r₁＋r₂</b> 外切（3 條）；<b>|r₁−r₂| ＜ d ＜ r₁＋r₂</b> 相交（2 條）；<b>d ＝ |r₁−r₂|</b> 內切（<b>1</b> 條）；<b>d ＜ |r₁−r₂|</b> 內含（0 條）。<br>外切在「和」的邊界，內切在「差」的邊界；內切雖然只有一個切點，還是有 1 條公切線。', '兩圓的五種關係'));
          api.unlock('4、3、2、1、0 條公切線');
        }
      } });
      ro = readout(st, 'rel'); ro(sc.info);
      api.solve(function () { gate.on = false; sc.setC(2, 0); sc.setR(2); sc.setC(5, 0); sc.setC(0, 0); sc.setR(4); sc.setC(-1, 0); sc.setR(1); sc.setC(-1, 0); sc.setR(2); sc.setC(6, 0); sc.setR(1); sc.setC(2, 2); sc.setR(2); }, false, '圓心距 d ＝ 5 ＝ r₁ ＋ r₂ ＝ 3 ＋ 2，所以是外切（3 條公切線）');
      st.append(P.hint('把 C₂ 拖到不同地方，也試試調大、調小 r₂。要找到五種關係各一次。')); api.lock('先做上面的預測');
    },
    /* 2. 公共弦 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, sc, ro;
      P.choice(st, api, { id: 'cc-p2', predict: true, label: '先猜猜看', prompt: '兩圓相交時，把<b>兩個圓的方程式相減</b>，得到的是？', row: true, options: [{ ok: true, t: '公共弦所在的直線' }, { t: '兩圓圓心的連線' }, { t: '兩個交點的座標' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 C₂、調整半徑 r₂'); } });
      st.append(P.instr('下面列出兩個圓的方程式，和它們<b>相減</b>得到的直線（紫色虛線）。拖動 <b>C₂</b>、調整 <b>r₂</b>，看相交時的<b>公共弦</b>（綠色粗線）是不是在那條直線上；兩圓不相交時又是什麼情形。'));
      var host = h('div'); st.append(host);
      sc = scene(host, { C2: [2, 1], R2: 3, chord: true, gate: gate, onChange: function (i) {
        ro && ro(i); if (gate.on) return; if (i.kind === 'int') seen.i = 1; if ((i.kind === 'out' || i.kind === 'in') && i.rad) seen.n = 1;
        if (seen.i && seen.n && !done) {
          done = true; P.track('aha', { id: 'circle-circle', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：相減得到公共弦所在的直線');
          st.append(P.ruleBox('兩圓方程式相減，x²、y² 消掉，剩下一條<b>直線</b>：兩圓<b>相交</b>時，它就是<b>公共弦所在的直線</b>（兩個交點代入兩個圓都成立，所以也成立相減的式子）。<br>兩圓<b>不相交</b>時，相減還是會得到一條直線，但它<b>不是公共弦</b>，因為根本沒有交點。', '公共弦'));
          api.unlock('相減 → 公共弦所在的直線');
        }
      } });
      ro = readout(st, 'chord'); ro(sc.info);
      api.solve(function () { gate.on = false; sc.setC(2, 1); sc.setR(3); sc.setC(6, 3); sc.setR(1); sc.setC(2, 1); sc.setR(3); }, false, '相減得到公共弦所在的直線（只有兩圓相交時才是公共弦）');
      st.append(P.hint('先看相交的樣子，再把 C₂ 拉遠（或把 r₂ 調小讓它被包在裡面），看紫線還在不在、還是不是公共弦。')); api.lock('先做上面的預測');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var fin = false, ro, sc = scene(b0, { C2: cfg.C2, R2: cfg.R2, tang: cfg.tang, chord: cfg.chord, fixedC2: cfg.fixed, onChange: function (i) { ro && ro(i); }, onSettle: function (i) {
            if (cfg.ok(i) && !fin) { fin = true; sc.pl.b.goalMark([sc.pl.X(i.C2[0]), sc.pl.Y(i.C2[1])]); P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } });
          ro = readout(b0, cfg.chord ? 'chord' : 'rel'); ro(sc.info); setSolve(function () { if (cfg.ans[0]) sc.setC(cfg.ans[0][0], cfg.ans[0][1]); sc.setR(cfg.ans[1]); if (!fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '調出<b>外切</b>：拖動 <b>C₂</b>、調整 <b>r₂</b>，讓兩圓剛好相切在外面（公切線 3 條）。', C2: [3, 1], R2: 1, tang: true, ok: function (i) { return i.kind === 'ext'; }, ans: [[3, 0], 2], answer: 'C₂ ＝ (3, 0)、r₂ ＝ 2（d ＝ 5 ＝ 3 ＋ 2）；只要 d ＝ 3 ＋ r₂ 都可以', msg: 'd ＝ r₁ ＋ r₂：外切', rule: '外切：d ＝ r₁ ＋ r₂。例如 C₂ 在 (3, 0)，d ＝ 5，r₂ ＝ 2：3 ＋ 2 ＝ 5。切點在兩圓心的連線上，公切線有 3 條。', hint: '外切：圓心距剛好等於兩個半徑的「和」。先決定 C₂ 的位置算出 d，再調 r₂。' }),
        task({ prompt: '調出<b>內切</b>：讓小圓剛好在大圓裡面碰到大圓（公切線 1 條）。', C2: [0, 2], R2: 2, tang: true, ok: function (i) { return i.kind === 'inner'; }, ans: [[0, 0], 1], answer: 'C₂ ＝ (0, 0)、r₂ ＝ 1（d ＝ 2 ＝ 3 − 1）；C₂ ＝ (−2, 1)、r₂ ＝ 2（d ＝ 1 ＝ 3 − 2）也可以', msg: 'd ＝ |r₁ − r₂|：內切', rule: '內切：d ＝ |r₁ − r₂|，是「差」不是「和」。例如 C₂ 在 (0, 0)，d ＝ 2，r₂ ＝ 1：3 − 1 ＝ 2。只有 1 個切點，也只有 1 條公切線。', hint: '內切：圓心距剛好等於兩個半徑的「差」。' }),
        task({ prompt: '圓 C₂ 的圓心固定在 <b>(2, 0)</b>。調整 <b>r₂</b>，讓兩圓的<b>公共弦剛好落在 y 軸</b>（相減得到的直線是 x ＝ 0）。', C2: [2, 0], R2: 1, chord: true, fixed: true, ok: function (i) { return i.kind === 'int' && i.rad && i.rad[0] === 1 && i.rad[1] === 0 && i.rad[2] === 0; }, ans: [null, 3], answer: 'r₂ ＝ 3（兩圓半徑相同，公共弦就是兩圓心連線的垂直平分線 x ＝ 0）', msg: 'r₂ ＝ 3：公共弦在 x ＝ 0', rule: '相減：C₁ − C₂ ＝ 8x ＋ r₂² − 9 ＝ 0，所以 x ＝ (9 − r₂²) / 8。要 x ＝ 0，就是 r₂² ＝ 9，r₂ ＝ 3。半徑一樣大的兩圓，公共弦就是圓心連線的垂直平分線。', hint: '看紫色那一列的 x 的係數與常數項：常數項要變成 0。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'circle-circle' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'circle-circle', moduleName: '兩圓之間的關係', askAbout: '兩圓之間的關係',
        aha: '兩圓的關係看 <b>圓心距 d 與 r₁＋r₂、|r₁−r₂| 比大小</b>：外離 4、外切 3、相交 2、內切 <b>1</b>、內含 0 條公切線；<b>兩圓方程式相減</b>得到公共弦所在的直線（要相交才是公共弦）。',
        cards: [{ text: 'd ＞ r₁＋r₂ 外離（4）；d ＝ r₁＋r₂ 外切（3）；|r₁−r₂| ＜ d ＜ r₁＋r₂ 相交（2）；d ＝ |r₁−r₂| 內切（1）；d ＜ |r₁−r₂| 內含（0）', src: '高中：兩圓的位置關係' }, { text: '兩圓相減得到的直線：相交時是公共弦所在的直線；相切時是過切點的公切線', src: '公共弦與根軸' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '根軸與圓冪<br>圓系方程式' }, { at: 0.85, label: '阿波羅尼斯圓' }] },
        teasers: [{ title: '根軸', q: '兩圓相減得到的直線，到兩圓的「圓冪」相等。不相交的兩圓也有這條線，它是什麼？', where: 'S101 2507 第 17 堂（CH2 直線與圓 07）', lv: 'L3' }],
        parent: { pitfall: '孩子常把外切與內切的條件搞混；漏了內切有 1 條公切線；兩圓不相交時也把相減的直線當成公共弦。', place: '解析幾何的收尾，接著進入空間中的直線與平面。', ask: ['外切時 d 和半徑的關係是什麼？內切呢？', '兩圓相切時有幾條公切線？', '兩圓沒有交點，相減得到的直線還是公共弦嗎？'] },
        classes: ['S101（2025 年 11 月，第 18、19 堂）：CH2 直線與圓 08（兩圓、公切線）'], next: { href: 'play.html', text: '回獵豹玩中學，看其他單元' } });
    }];
  new P.Lesson({ id: 'circle-circle', title: '兩圓之間的關係', steps: steps });
})();
