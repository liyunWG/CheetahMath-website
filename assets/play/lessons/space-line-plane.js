/* 獵豹玩中學｜空間（四）：直線與平面（平行判定、垂直判定、三垂線定理）
   預測＋拖直線 l 看它和地面 α 平行／相交／在平面內（平面內有一條平行線就平行）→ 預測＋拖 OP 看「垂直平面內『一條』線不夠、要垂直『兩條相交線』」→ 預測＋三垂線定理 → 3 個操作關卡。
   要擊中的迷思：直線只和平面內一條線垂直就說垂直平面；平行判定忘了「直線在平面外」；三垂線定理的「射影」看不出來。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL, BOX = { x: [-3, 3], y: [0, 4], z: [-3, 3] }, VIO = COL.violet;
  function sv(p) { return '(' + p.map(function (x) { return String(x).replace('-', '−'); }).join(', ') + ')'; }
  function ptAt(name, p, color, o) { var r = { name: name, p: p.slice(), color: color, mode: 'floor' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function f1(v) { return (Math.round(v * 10) / 10).toString().replace('-', '−'); }
  function angle(u, v) { return Math.acos(Math.max(-1, Math.min(1, V.dot(u, v) / (V.len(u) * V.len(v))))) * 180 / Math.PI; }
  function alpha() { return { p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true }; }
  function pillRow(host, n, cls) { var out = []; for (var i = 0; i < n; i++) { var p = P.pill('', cls && cls[i] || 'is-green'); p.style.whiteSpace = 'normal'; out.push(p); host.append(h('div', { class: 'pl-readout' }, p)); } return out; }

  /* ───────── 關 1：直線 l（M、N）與地面 α ───────── */
  function lpStage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, build: function () {
      var M = pts[0].p, N = pts[1].p, c = P3.clipLine(M, N, BOX), spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [alpha()], dots: [] };
      var kind = (M[1] === 0 && N[1] === 0) ? 'in' : (M[1] === N[1] ? 'par' : 'cross');
      if (c) { spec.lines.push({ a: c[0], b: c[1], color: COL.pink, w: 4 }); spec.texts.push({ p: V.lerp(c[0], c[1], 0.1), t: 'l', color: COL.pink, size: 16, halo: true }); }
      if (kind === 'par') {   /* 平面內有一條和 l 平行的直線 m（就是 l 在地面的影子） */
        var m1 = [M[0], 0, M[2]], m2 = [N[0], 0, N[2]], cm = P3.clipLine(m1, m2, BOX); if (cm) { spec.lines.push({ a: cm[0], b: cm[1], color: COL.green, w: 3.5 }); spec.texts.push({ p: V.lerp(cm[0], cm[1], 0.9), t: 'm', color: COL.green, size: 16, halo: true }); }
        spec.faces.push({ pts: [M, N, m2, m1], fill: COL.green, alpha: 0.18, stroke: 'rgba(31,157,85,.6)', lw: 1.2, flat: true, nopick: true, double: true });
      }
      if (kind === 'cross') { var t = M[1] / (M[1] - N[1]), X = V.lerp(M, N, t); if (Math.abs(X[0]) <= 3.01 && Math.abs(X[2]) <= 3.01) spec.dots.push({ p: X, r: 6, color: COL.amber, label: 'X' }); hold.X = X; }
      if (o.T) spec.dots.push({ p: o.T, r: 7, color: COL.amber, label: 'T' });
      hold.kind = kind; return spec;
    } }); Object.defineProperty(S, 'kind', { get: function () { return hold.kind; } }); Object.defineProperty(S, 'X', { get: function () { return hold.X; } }); return S;
  }
  function lpText(kind, M, N) {
    return kind === 'in' ? 'l 在平面 α 內（兩個點的高度都是 0）' : kind === 'par' ? 'l 和 α 平行：高度都是 ' + M[1] + '，α 內有一條直線 m 和 l 平行（綠線），l 在 α 外' : 'l 穿過 α，只有一個交點 X（高度從 ' + M[1] + ' 變到 ' + N[1] + '，中間會走到 0）';
  }

  /* ───────── 關 2：OP 與地面內過 O 的直線 a、b、c ───────── */
  function perpStage(host, o) {
    var pts = o.pts, st2 = o.st, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, valid: function (p, pt, i) { return !(i === 1 && !p[0] && !p[1] && !p[2]); }, onEnd: o.onEnd, build: function () {
      var O = pts[0].p, Pp = pts[1].p, spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [alpha()], dots: [] }, op = V.sub(Pp, O), refs = [['a', [1, 0, 0], COL.amber], ['b', [0, 0, 1], COL.teal]];
      if (o.useC) { var ph = st2.phi * Math.PI / 180; refs.push(['c', [Math.cos(ph), 0, Math.sin(ph)], COL.violet]); }
      spec.lines.push({ a: O, b: Pp, color: COL.pink, w: 4.5 });
      var ang = {}; refs.forEach(function (r) { var e = V.mul(r[1], 2.7); spec.lines.push({ a: V.mul(e, -1), b: e, color: r[2], w: 3 }); spec.texts.push({ p: e, t: r[0], color: r[2], size: 16, halo: true }); var d = angle(op, r[1]); ang[r[0]] = d;
        if (Math.abs(d - 90) < 1e-9) { var ru = V.norm(op), rv = r[1]; P3.rightMark(O, ru, rv, 0.34, r[2]).forEach(function (l) { spec.lines.push(l); }); } });
      hold.ang = ang; return spec;
    } }); Object.defineProperty(S, 'ang', { get: function () { return hold.ang; } }); return S;
  }

  /* ───────── 關 3：三垂線定理 ───────── */
  var LA = [-1, 0, 3], LB = [3, 0, -1], LD = [1, 0, -1], HC = [[-1, 0, 3], [0, 0, 2], [1, 0, 1], [2, 0, 0], [3, 0, -1]], PP = [0, 3, 0];
  function tvStage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, controls: false, build: function () {
      var Hp = pts[2].p, A = [0, 0, 0], spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [alpha(), { p: [3, 0, -1], t: 'l', color: COL.blue, size: 16, halo: true }], dots: [] }, dd = V.mul(V.sub(LB, LA), 0.25), d = V.norm(dd);
      var c = P3.clipLine(LA, LB, BOX); spec.lines.push({ a: c[0], b: c[1], color: COL.blue, w: 4 });
      spec.lines.push({ a: A, b: PP, color: COL.gray, w: 3 }, { a: A, b: Hp, color: COL.amber, w: 3 }, { a: PP, b: Hp, color: COL.pink, w: 4 });
      P3.rightMark(A, [0, 1, 0], V.norm(Hp), 0.3, COL.gray).forEach(function (l) { spec.lines.push(l); });   /* PA ⊥ 平面：∠PAH ＝ 90° */
      var ah = V.sub(Hp, A), ph = V.sub(Hp, PP), a1 = V.dot(ah, dd), a2 = V.dot(ph, dd); hold.ah = a1; hold.ph = a2;
      if (a1 === 0) { P3.rightMark(Hp, V.norm(V.sub(A, Hp)), d, 0.3, COL.amber).forEach(function (l) { spec.lines.push(l); }); }
      if (a2 === 0) { P3.rightMark(Hp, V.norm(V.sub(PP, Hp)), d, 0.3, COL.pink).forEach(function (l) { spec.lines.push(l); }); }
      return spec;
    } }); Object.defineProperty(S, 'ah', { get: function () { return hold.ah; } }); Object.defineProperty(S, 'ph', { get: function () { return hold.ph; } }); return S;
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, pts = [ptAt('M', [-2, 2, -1], COL.pink), ptAt('N', [2, 3, 1], COL.pink)], pK;
      P.choice(st, api, { id: 'lp-p1', predict: true, label: '先猜猜看', prompt: '平面 α <b>外</b>的一條直線 l，只要和 α <b>內的某一條直線</b>平行，l 就和平面 α 平行嗎？', row: true, options: [{ ok: true, t: '是，l 平行於 α' }, { t: '不一定' }, { t: '不是，要和 α 內每一條都平行' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 M、N'); } });
      st.append(P.instr('地面 <b>α</b>（紫）。直線 <b>l</b> 過 M、N（粉紅）。拖動 M、N，看 l 和 α 的關係。當 l 和平面內的<b>綠色直線 m</b> 平行時，會出現綠色的面。'));
      var S = lpStage(st, { pts: pts, gate: function () { return gate.on; } }); pK = pillRow(st, 1, ['is-green'])[0];
      var old = S.rebuild; S.rebuild = function () { old(); var k = S.kind; pK.textContent = lpText(k, pts[0].p, pts[1].p); pK.className = 'pl-pill ' + (k === 'par' ? 'is-ok' : 'is-green'); if (gate.on) return; seen[k] = 1; if (seen.par && seen.cross && seen.in && !done) { done = true; P.track('aha', { id: 'space-line-plane', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：平行於平面內的一條線就夠了'); st.append(P.ruleBox('直線 l 在平面 α <b>外</b>，只要和 α <b>內的一條直線 m 平行</b>，l 就和 α <b>平行</b>（判定定理）。不必和 α 內每一條都平行（那是辦不到的：α 內有各種方向的直線）。<br>直線和平面有三種位置：<b>在平面內</b>、<b>平行</b>（沒有公共點）、<b>相交</b>（一個交點）。', '線面平行')); api.unlock('l 平行於平面內的一條線 → l ∥ α'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(0, [-2, 2, 1]); S.moveTo(1, [2, 2, 1]); S.moveTo(0, [-2, 0, 1]); S.moveTo(1, [2, 0, 1]); S.moveTo(0, [-2, 2, 1]); S.moveTo(1, [2, 3, 1]); }, false, '是：l 在 α 外，只要和 α 內的某一條直線平行，l 就平行於 α');
      st.append(P.hint('兩個點放到一樣高、再放到地面上、再一高一低，各看一次。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, st2 = { phi: 45 }, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('P', [0, 2, 2], COL.pink)], pr;
      P.choice(st, api, { id: 'lp-p2', predict: true, label: '先猜猜看', prompt: '直線 OP 和平面 α 內的<b>一條直線</b>垂直，就能說 OP 垂直於平面 α 嗎？', row: true, options: [{ ok: true, t: '不能，還不夠' }, { t: '能' }, { t: '要垂直 α 內所有直線才行，所以不可能' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 P'); } });
      st.append(P.instr('O 在地面上，直線 <b>OP</b>（粉紅）。地面上過 O 有三條直線 a（橘）、b（青）、c（紫，用滑桿轉動）。拖動 <b>P</b>，看 OP 和它們各夾幾度（<b>90°</b> 會畫直角符號）。'));
      var S = perpStage(st, { pts: pts, st: st2, useC: true, gate: function () { return gate.on; } });
      var sl = P.slider(0, 165, 45, function (v) { st2.phi = v; S.rebuild(); }, 15); st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '轉動 c：0° 到 165°')), sl); pr = pillRow(st, 3, ['is-amber', 'is-blue', 'is-pink']);
      var old = S.rebuild; S.rebuild = function () { old(); var a = S.ang, Pp = pts[1].p, up = Pp[0] === 0 && Pp[2] === 0; pr[0].textContent = '∠(OP, a) ＝ ' + f1(a.a) + '°' + (a.a === 90 ? ' ✓ 垂直' : ''); pr[1].textContent = '∠(OP, b) ＝ ' + f1(a.b) + '°' + (a.b === 90 ? ' ✓ 垂直' : ''); pr[2].textContent = '∠(OP, c) ＝ ' + f1(a.c) + '°' + (a.c === 90 ? ' ✓ 垂直' : '');
        if (gate.on) return; if (a.a === 90 && a.b !== 90) seen.one = 1; if (a.a === 90 && a.b === 90 && up) { seen.both = 1; if (Math.abs(a.c - 90) < 1e-9) seen.c = 1; } if (seen.one && seen.both && seen.c && !done) { done = true; P.track('aha', { id: 'space-line-plane', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：一條不夠'); st.append(P.ruleBox('OP 只垂直於 α 內的<b>一條</b>線（例如 a），還不夠：P 可以偏向一邊（和 b 不垂直）。<br>OP 垂直於 α 內<b>兩條相交的直線</b>（a 和 b），OP 就<b>垂直於整個平面</b>，這時它垂直於 α 內<b>所有</b>過 O 的直線（轉動 c 看看，永遠是 90°）。這就是線面垂直的判定定理。', '線面垂直')); api.unlock('垂直於兩條相交直線 → 垂直於平面'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(1, [0, 2, 1]); sl.value = 90; st2.phi = 90; S.moveTo(1, [0, 2, 0]); sl.value = 30; st2.phi = 30; S.rebuild(); }, false, '不能：垂直於平面內一條直線還不夠，要垂直於兩條相交的直線才行');
      st.append(P.hint('先讓 OP 只垂直 a（P 的 x 座標是 0 但偏在一邊），再把 P 放到 O 的正上方。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, done = false, seen = {}, pts = [ptAt('P', PP, COL.pink, { fixed: true }), ptAt('A', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('H', [3, 0, -1], COL.amber, { cands: HC })], pr;
      P.choice(st, api, { id: 'lp-p3', predict: true, label: '先猜猜看', prompt: 'PA 垂直於平面 α，A 在 α 內。從 A 作 AH 垂直於 α 內的直線 l（H 在 l 上），那 <b>PH 和 l</b> 的關係是？', row: true, options: [{ ok: true, t: 'PH 垂直 l' }, { t: 'PH 和 l 不一定垂直' }, { t: 'PH 平行 l' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動 H'); } });
      st.append(P.instr('PA（灰）垂直地面 α。藍線 <b>l</b> 在地面上，<b>H</b> 在 l 上（只能停在 l 的格點）。拖動 H，看 <b>AH ⊥ l</b>（橘色直角）什麼時候成立，那時 <b>PH 和 l</b> 呢（粉紅直角）？'));
      var S = tvStage(st, { pts: pts, gate: function () { return gate.on; } }); pr = pillRow(st, 2, ['is-amber', 'is-pink']);
      var old = S.rebuild; S.rebuild = function () { old(); var Hp = pts[2].p; pr[0].textContent = 'AH · (1, 0, −1) ＝ ' + S.ah + (S.ah === 0 ? '：AH ⊥ l ✓' : '：AH 不垂直 l'); pr[1].textContent = 'PH · (1, 0, −1) ＝ ' + S.ph + (S.ph === 0 ? '：PH ⊥ l ✓' : '：PH 不垂直 l'); pr[1].className = 'pl-pill ' + (S.ph === 0 ? 'is-ok' : 'is-pink'); if (gate.on) return; seen[Hp.join()] = 1; if (S.ah === 0) seen.foot = 1; if (Object.keys(seen).length >= 3 && seen.foot && !done) { done = true; P.track('aha', { id: 'space-line-plane', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：PH ⊥ l'); st.append(P.ruleBox('<b>三垂線定理</b>：PA ⊥ 平面 α，AH ⊥ α 內的直線 l（H 在 l 上），那麼 <b>PH ⊥ l</b>。<br>為什麼？PH ＝ PA ＋ AH，PA 垂直平面所以垂直 l，PH · l ＝ PA · l ＋ AH · l ＝ 0 ＋ AH · l。所以 PH · l 和 AH · l <b>永遠一樣</b>：AH ⊥ l 時 PH ⊥ l（兩個數字同時變 0）。', '三垂線定理')); api.unlock('PA ⊥ 平面，AH ⊥ l → PH ⊥ l'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(2, [0, 0, 2]); S.moveTo(2, [2, 0, 0]); S.moveTo(2, [1, 0, 1]); }, false, 'PH 垂直 l（三垂線定理：PA ⊥ 平面、AH ⊥ l，則 PH ⊥ l）');
      st.append(P.hint('H 在 l 上慢慢移動，看兩個內積是不是永遠一樣。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function lineTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '點 <b>T(0, 2, 0)</b> 在地面上方 2 的高度。拖動 M、N，讓直線 l <b>通過 T</b>，而且 <b>l 平行於平面 α</b>。' })); var fin = false, pts = [ptAt('M', [-2, 2, -1], COL.pink), ptAt('N', [2, 3, 1], COL.pink)], pK;
        var S = lpStage(b0, { pts: pts, T: [0, 2, 0], onEnd: function () { var M = pts[0].p, N = pts[1].p, T = [0, 2, 0], c = V.cross(V.sub(T, M), V.sub(N, M)); if (S.kind === 'par' && !c[0] && !c[1] && !c[2] && !fin) { fin = true; P.toast('l 過 T，而且平行於 α'); b0.append(P.ruleBox('l 平行於 α（在 α 外）：M、N 一樣高，高度就是 T 的高度 2。再讓 l 過 T(0, 2, 0)：M、N、T 三點在一條線上。', '找到了')); done(); } } });
        var old = S.rebuild; pK = pillRow(b0, 1, ['is-green'])[0]; S.rebuild = function () { old(); pK.textContent = lpText(S.kind, pts[0].p, pts[1].p); }; S.rebuild();
        setSolve(function () { S.moveTo(0, [-2, 2, 0]); S.moveTo(1, [2, 2, 0]); }, 'M ＝ (−2, 2, 0)、N ＝ (2, 2, 0)：高度都是 2，l 平行於 α，又通過 T(0, 2, 0)'); b0.append(P.hint('平行於地面：兩個點要一樣高。再看看高度是多少才會經過 T。'));
        /* T 標記：用固定的點畫出來（放在 pts 的第三個，固定、不可拖） */
      }
      function perpTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>P</b>，讓直線 OP <b>垂直於整個平面 α</b>，而且 <b>OP 的長度是 3</b>。' })); var fin = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('P', [1, 2, 2], COL.pink)], st2 = { phi: 45 }, pr;
        var S = perpStage(b0, { pts: pts, st: st2, useC: false, onEnd: function () { var Pp = pts[1].p; if (Pp[0] === 0 && Pp[2] === 0 && Pp[1] === 3 && !fin) { fin = true; P.toast('OP ⊥ α，長度 3'); b0.append(P.ruleBox('OP 要垂直 a（x 軸）和 b（z 軸）：P 在 O 的正上方，x ＝ 0、z ＝ 0。長度是 3，所以 P ＝ (0, 3, 0)。', '找到了')); done(); } } }); pr = pillRow(b0, 2, ['is-amber', 'is-blue']);
        var old = S.rebuild; S.rebuild = function () { old(); var a = S.ang; pr[0].textContent = '∠(OP, a) ＝ ' + f1(a.a) + '°' + (a.a === 90 ? ' ✓' : ''); pr[1].textContent = '∠(OP, b) ＝ ' + f1(a.b) + '°' + (a.b === 90 ? ' ✓' : ''); }; S.rebuild();
        setSolve(function () { S.moveTo(1, [0, 3, 0]); }, 'P ＝ (0, 3, 0)（在 O 的正上方，高度 3）'); b0.append(P.hint('OP 要同時垂直 a 和 b，P 不能偏向任何一邊。'));
      }
      function tvTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: 'PA ⊥ 地面 α。拖動 <b>H</b>（在直線 l 上），找出讓 <b>PH ⊥ l</b> 的位置。' })); var fin = false, pts = [ptAt('P', PP, COL.pink, { fixed: true }), ptAt('A', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('H', [3, 0, -1], COL.amber, { cands: HC })], pr;
        var S = tvStage(b0, { pts: pts, onEnd: function () { if (S.ph === 0 && !fin) { fin = true; P.toast('PH ⊥ l（H ＝ (1, 0, 1)）'); b0.append(P.ruleBox('PH ⊥ l 的那個 H，剛好也是 AH ⊥ l 的位置（三垂線定理）：H 是 A 在 l 上的垂足 (1, 0, 1)。', '找到了')); done(); } } }); pr = pillRow(b0, 2, ['is-amber', 'is-pink']);
        var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = 'AH · (1, 0, −1) ＝ ' + S.ah; pr[1].textContent = 'PH · (1, 0, −1) ＝ ' + S.ph + (S.ph === 0 ? '：PH ⊥ l ✓' : ''); }; S.rebuild();
        setSolve(function () { S.moveTo(2, [1, 0, 1]); }, 'H ＝ (1, 0, 1)（A 在 l 上的垂足，這時 AH ⊥ l、PH ⊥ l）'); b0.append(P.hint('不用算 PH，找「AH ⊥ l」比較容易，兩者同時成立。'));
      }
      P.taskSeq(box, api, [lineTask, perpTask, tvTask], { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-line-plane' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-line-plane', moduleName: '空間（四）：直線與平面', askAbout: '直線與平面的位置關係、平行判定、垂直判定、三垂線定理',
        aha: '<b>平面外的直線平行於平面內一條線，就平行於平面</b>；要垂直於平面，要垂直於<b>兩條相交</b>的線；<b>三垂線定理</b>：PA ⊥ 平面、AH ⊥ l，則 PH ⊥ l。',
        cards: [{ text: '線面平行判定：平面外一條直線和平面內一條直線平行，則這條直線和這個平面平行', src: '高中：直線與平面平行' }, { text: '線面垂直判定：直線垂直於平面內兩條相交直線，則垂直於這個平面；三垂線定理：PA ⊥ α，AH ⊥ l，則 PH ⊥ l', src: '直線與平面垂直、三垂線定理' }],
        depth: { here: 0.35, cheetah: [{ at: 0.55, label: '線面垂直的性質<br>點到平面的距離' }, { at: 0.85, label: '空間向量與法向量' }] },
        teasers: [{ title: '三垂線定理的用途', q: '三垂線定理可以怎麼用來求點到直線的距離、二面角？', where: 'S111 2507 第 24、25 堂（三垂線定理）', lv: 'L2' }],
        parent: { pitfall: '孩子常只驗證直線和平面內「一條」線垂直就說垂直平面；平行判定忘了直線要在平面「外」；三垂線定理不知道「射影」是什麼。', place: '空間單元的核心，接著是兩個平面的關係與二面角。', ask: ['直線和平面內一條線垂直，就垂直平面嗎？', '要垂直平面，至少要垂直平面內的幾條線？它們有什麼條件？', '三垂線定理在說什麼？'] },
        classes: ['S111 2507 第 24、25 堂（2026 年 1 月）：CH1 空間向量 01、02（三垂線）'], next: { href: 'play-space-two-planes.html', text: '下一個：兩個平面的位置關係與二面角' } });
    }];
  new P.Lesson({ id: 'space-line-plane', title: '空間（四）：直線與平面', steps: steps });
})();
