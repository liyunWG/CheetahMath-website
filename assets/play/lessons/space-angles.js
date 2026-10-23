/* 獵豹玩中學｜空間（六）：空間中的三種角（異面直線的夾角、線面角、二面角）
   預測＋異面直線夾角（平移成相交）→ 預測＋線面角＝直線和它的「射影」的夾角（最小角）→ 預測＋二面角（0°～180°）→ 4 個操作關卡。
   要擊中的迷思：異面直線的夾角直接在圖上量；線面角量成和垂線的夾角；三種角的範圍搞混（0°～90°、0°～90°、0°～180°）。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL, BOX = { x: [-3, 3], y: [0, 4], z: [-3, 3] }, VIO = COL.violet;
  function ptAt(name, p, color, o) { var r = { name: name, p: p.slice(), color: color, mode: 'floor' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function f1(v) { return (Math.round(v * 10) / 10).toString().replace('-', '−'); }
  function deg(r) { return r * 180 / Math.PI; }
  function alpha() { return { p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true }; }
  function pillRow(host, n, cls) { var out = []; for (var i = 0; i < n; i++) { var p = P.pill('', cls && cls[i] || 'is-green'); p.style.whiteSpace = 'normal'; out.push(p); host.append(h('div', { class: 'pl-readout' }, p)); } return out; }
  function line3(a, b, color, w) { var c = P3.clipLine(a, b, BOX); return c ? { a: c[0], b: c[1], color: color, w: w || 3 } : null; }

  /* ───────── 角 1：異面直線 l₁（A、B）與 l₂（C、D）的夾角 ───────── */
  function skewStage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, valid: function (p, pt, i) { var j = i === 2 ? 3 : i === 3 ? 2 : -1; return j < 0 || p.join() !== pts[j].p.join(); }, build: function () {
      var A = pts[0].p, B = pts[1].p, C = pts[2].p, D = pts[3].p, u = V.sub(B, A), v = V.sub(D, C), spec = { faces: [], lines: [], texts: [], dots: [] }, Z = [0, 1, 0];
      var l1 = line3(A, B, COL.blue, 4), l2 = line3(C, D, COL.pink, 4); if (l1) { spec.lines.push(l1); spec.texts.push({ p: V.lerp(l1.a, l1.b, 0.12), t: 'l₁', color: COL.blue, size: 16, halo: true }); } if (l2) { spec.lines.push(l2); spec.texts.push({ p: V.lerp(l2.a, l2.b, 0.9), t: 'l₂', color: COL.pink, size: 16, halo: true }); }
      var vn = V.norm(v), cp = P3.clipLine(Z, V.add(Z, vn), BOX); if (cp) spec.lines.push({ a: cp[0], b: cp[1], color: COL.pink, w: 2.5, dash: [6, 4] });   /* 把 l₂ 平移到過 l₁ 上的一點 Z */
      spec.dots.push({ p: Z, r: 5, color: COL.navy });
      var c2 = Math.pow(V.dot(u, v), 2) * 1, d2 = V.dot(u, u) * V.dot(v, v), cos = Math.sqrt(c2 / d2), th = deg(Math.acos(Math.min(1, cos))); hold.th = th; hold.c2 = c2; hold.d2 = d2; hold.u = u; hold.v = v;
      var ub = V.norm(u), vv = V.dot(ub, vn) < 0 ? V.mul(vn, -1) : vn, bis = V.add(ub, vv), bl = V.len(bis); spec.texts.push({ p: V.add(Z, V.mul(bl < 1e-9 ? [0, 1, 0] : V.mul(bis, 1 / bl), 0.9)), t: Math.abs(th - 90) < 1e-9 ? '90°' : f1(th) + '°', color: COL.green, size: 15, halo: true });
      if (Math.abs(th - 90) < 1e-9) P3.rightMark(Z, ub, vn, 0.34, COL.green).forEach(function (l) { spec.lines.push(l); });
      return spec;
    } }); ['th', 'c2', 'd2', 'u', 'v'].forEach(function (k) { Object.defineProperty(S, k, { get: function () { return hold[k]; } }); }); return S;
  }
  var SK_PTS = function () { return [ptAt('A', [-2, 1, 0], COL.blue, { fixed: true }), ptAt('B', [2, 1, 0], COL.blue, { fixed: true }), ptAt('C', [-2, 3, -2], COL.pink), ptAt('D', [2, 3, 2], COL.pink)]; };
  function sv(p) { return '(' + p.join(', ').replace(/-/g, '−') + ')'; }

  /* ───────── 角 2：線面角（OP 與地面） ───────── */
  var PC = []; (function () { for (var y = 1; y <= 4; y++) { PC.push([0, y, 0]); for (var k = 1; k <= 3; k++) { PC.push([k, y, 0], [-k, y, 0], [0, y, k], [0, y, -k], [k, y, k], [k, y, -k], [-k, y, k], [-k, y, -k]); } } })();
  function lpStage(host, o) {
    var pts = o.pts, st2 = o.st, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, build: function () {
      var O = [0, 0, 0], Pp = pts[1].p, Pq = [Pp[0], 0, Pp[2]], spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [alpha()], dots: [] }, hz = Math.hypot(Pp[0], Pp[2]);
      spec.lines.push({ a: O, b: Pp, color: COL.pink, w: 4.5 });
      var phi = deg(Math.atan2(Pp[1], hz)); hold.phi = phi; hold.hz = hz;
      if (hz > 0) { spec.lines.push({ a: O, b: Pq, color: COL.gray, w: 3.5, dash: [6, 4] }, { a: Pp, b: Pq, color: COL.gray, w: 2, dash: [4, 4] }); spec.dots.push({ p: Pq, r: 5, color: COL.gray, label: 'P′' }); P3.rightMark(Pq, [0, 1, 0], V.norm(V.sub(O, Pq)), 0.3, COL.gray).forEach(function (l) { spec.lines.push(l); }); var bis = V.norm(V.add(V.norm(Pp), V.norm(Pq))); spec.texts.push({ p: V.mul(bis, 0.95), t: 'φ', color: COL.green, size: 16, halo: true }); }
      if (st2) { var ps = st2.psi * Math.PI / 180, e = [Math.cos(ps), 0, Math.sin(ps)], op = V.sub(Pp, O); spec.lines.push({ a: V.mul(e, -2.8), b: V.mul(e, 2.8), color: COL.violet, w: 3 }); spec.texts.push({ p: V.mul(e, 2.8), t: 'c', color: COL.violet, size: 16, halo: true }); hold.thc = deg(Math.acos(Math.min(1, Math.abs(V.dot(op, e)) / V.len(op)))); hold.psi0 = hz > 0 ? ((deg(Math.atan2(Pp[2], Pp[0])) % 180) + 180) % 180 : null; }
      return spec;
    } }); ['phi', 'hz', 'thc', 'psi0'].forEach(function (k) { Object.defineProperty(S, k, { get: function () { return hold[k]; } }); }); return S;
  }

  /* ───────── 角 3：二面角（稜＝x 軸） ───────── */
  var CANDS = []; (function () { for (var y = 0; y <= 3; y++) for (var z = -3; z <= 3; z++) if (y || z) CANDS.push([0, y, z]); })();
  function dihStage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, controls: false, yaw: Math.PI / 2 - 0.4, pitch: 0.3, build: function () {
      var O = [0, 0, 0], T = pts[1].p, u = V.norm(T), spec = { faces: [], lines: [], texts: [], dots: [] };
      spec.faces.push({ pts: [[-3, 0, 0], [3, 0, 0], [3, 0, 3], [-3, 0, 3]], fill: VIO, alpha: 0.16, stroke: 'rgba(122,79,214,.55)', lw: 1.4, flat: true, nopick: true, double: true });
      spec.faces.push({ pts: [[-3, 0, 0], [3, 0, 0], V.add([3, 0, 0], V.mul(u, 3)), V.add([-3, 0, 0], V.mul(u, 3))], fill: COL.blue, alpha: 0.2, stroke: 'rgba(47,111,220,.7)', lw: 1.6, dash: [6, 4], flat: true, nopick: true, double: true });
      spec.lines.push({ a: [-3, 0, 0], b: [3, 0, 0], color: COL.navy, w: 5 }, { a: O, b: [0, 0, 2.6], color: COL.amber, w: 3.5 }, { a: O, b: V.mul(u, 2.6), color: COL.pink, w: 3.5 });
      spec.texts.push({ p: [3, 0, 0], t: '稜', color: COL.navy, size: 16, halo: true }, { p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true }, { p: V.add(V.mul(u, 2.2), [1.4, 0, 0]), t: 'β', color: COL.blue, size: 18, halo: true });
      P3.rightMark(O, [1, 0, 0], [0, 0, 1], 0.4, COL.amber).forEach(function (l) { spec.lines.push(l); }); P3.rightMark(O, [1, 0, 0], u, 0.4, COL.pink).forEach(function (l) { spec.lines.push(l); });
      var ang = deg(Math.acos(Math.max(-1, Math.min(1, u[2])))); hold.ang = ang; var sum = V.add([0, 0, 1], u), mid = V.len(sum) < 1e-9 ? [0, 1, 0] : V.norm(sum); spec.texts.push({ p: V.mul(mid, 1.05), t: Math.abs(ang - 90) < 1e-9 ? '90°' : f1(ang) + '°', color: COL.green, size: 15, halo: true });
      return spec;
    } }); Object.defineProperty(S, 'ang', { get: function () { return hold.ang; } }); return S;
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, pts = SK_PTS(), pr, S;
      P.choice(st, api, { id: 'an-p1', predict: true, label: '先猜猜看', prompt: '兩條<b>異面直線</b>（歪斜線）的夾角，範圍是？', row: true, options: [{ ok: true, t: '大於 0°、小於或等於 90°' }, { t: '0° 到 180°' }, { t: '大於 90°' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 C、D'); } });
      st.append(P.instr('歪斜線沒有交點，怎麼量夾角？把 <b>l₂ 平行移動</b>到和 l₁ 相交（粉紅虛線，過 Z 點），量那個角。拖動 <b>C、D</b>，看夾角怎麼變；<b>90°</b> 畫直角符號。'));
      S = skewStage(st, { pts: pts, gate: function () { return gate.on; } }); pr = pillRow(st, 2, ['is-green', 'is-amber']);
      var old = S.rebuild; S.rebuild = function () { old(); var u = S.u, v = S.v; pr[0].textContent = '方向向量：l₁ ' + sv(u) + '，l₂ ' + sv(v); pr[1].textContent = 'cos θ ＝ |u·v| ÷ (|u||v|) ＝ ' + Math.abs(V.dot(u, v)) + ' ÷ ' + f1(Math.sqrt(S.d2)) + '，夾角 θ ＝ ' + f1(S.th) + '°'; if (gate.on) return; seen[Math.round(S.th)] = 1; if (Math.abs(S.th - 90) < 1e-9) seen.p = 1; if (Object.keys(seen).length >= 4 && seen.p && !done) { done = true; P.track('aha', { id: 'space-angles', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：0° 到 90°'); st.append(P.ruleBox('<b>異面直線的夾角</b>：把其中一條直線<b>平行移動</b>到和另一條相交，量出來的銳角（或直角）。所以範圍是 <b>0° &lt; θ ≤ 90°</b>（平行時是 0°，不算異面）。<br>用方向向量算：<b>cos θ ＝ |u·v| ÷ (|u||v|)</b>，有絕對值，所以不會是鈍角。', '異面直線的夾角')); api.unlock('異面直線夾角：0° < θ ≤ 90°'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(2, [-2, 3, -2]); S.moveTo(3, [-2, 3, 2]); S.moveTo(3, [2, 3, -2]); S.moveTo(3, [0, 3, -2]); S.moveTo(3, [2, 3, 2]); }, false, '大於 0°、小於或等於 90°（平行移動後量銳角，cos θ 取絕對值）');
      st.append(P.hint('拖幾個不同的方向，把 l₂ 轉到和 l₁ 垂直也看看。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, st2 = { psi: 0 }, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('P', [2, 2, 0], COL.pink, { cands: PC })], pr, S, sl;
      P.choice(st, api, { id: 'an-p2', predict: true, label: '先猜猜看', prompt: '直線 OP 和平面 α 內<b>過 O 的所有直線</b>所成的角，哪一條最小？', row: true, options: [{ ok: true, t: 'OP 在 α 內的射影 OP′' }, { t: '垂直於 OP′ 的那條' }, { t: '都一樣大' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 P、轉動 c'); } });
      st.append(P.instr('<b>線面角 φ</b> ＝ 直線 OP 和它在平面上的<b>射影 OP′</b>（灰色虛線）的夾角。紫線 <b>c</b> 是 α 內過 O 的一條線，用滑桿轉動它，看 <b>OP 和 c 的夾角</b>什麼時候最小。也可以拖動 P。'));
      S = lpStage(st, { pts: pts, st: st2, gate: function () { return gate.on; } }); sl = P.slider(0, 165, 0, function (v) { st2.psi = v; S.rebuild(); }, 15); st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '轉動 c：0° 到 165°')), sl); pr = pillRow(st, 3, ['is-green', 'is-pink', 'is-amber']);
      var old = S.rebuild; S.rebuild = function () { old(); var P0 = pts[1].p; pr[0].textContent = 'P ' + sv(P0) + '：線面角 φ ＝ ' + f1(S.phi) + '°（OP 和射影 OP′ 的夾角）'; pr[1].textContent = '∠(OP, c) ＝ ' + f1(S.thc) + '°'; var hit = S.hz > 0 && Math.abs(S.thc - S.phi) < 1e-6; pr[1].className = 'pl-pill ' + (hit ? 'is-ok' : 'is-pink'); pr[2].textContent = hit ? 'c 剛好在射影 OP′ 的方向：∠(OP, c) ＝ φ，這是最小的角 ✓' : S.hz > 0 ? '∠(OP, c) ≥ φ（c 離射影方向越遠，夾角越大）' : 'P 在 O 的正上方：沒有射影，OP ⊥ α，φ ＝ 90°'; if (gate.on) return;
        seen['s' + st2.psi] = 1; if (hit) seen.hit = 1; if (S.hz > 0 && S.thc < S.phi - 1e-6) seen.bad = 1; if (Object.keys(seen).filter(function (k) { return k[0] === 's'; }).length >= 4 && seen.hit && !done) { done = true; P.track('aha', { id: 'space-angles', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：射影最小'); st.append(P.ruleBox('<b>線面角</b>：直線和它在平面內的<b>射影</b>的夾角。它是直線和平面內所有直線夾角中<b>最小</b>的（最小角定理）。<br>範圍是 <b>0° ≤ φ ≤ 90°</b>：直線在平面內或平行於平面是 0°，垂直於平面是 90°。注意是量和「射影」的夾角，不是和垂線 PP′ 的夾角。', '線面角')); api.unlock('線面角：和射影的夾角（最小角）'); } }; S.rebuild();
      api.solve(function () { gate.on = false;[30, 60, 90, 120, 0].forEach(function (v) { sl.value = v; st2.psi = v; S.rebuild(); }); }, false, 'OP 在 α 內的射影 OP′（它和 OP 的夾角最小，就是線面角）');
      st.append(P.hint('把滑桿慢慢轉一圈，找最小的夾角在哪裡。P 現在的射影沿著 x 軸方向。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('T', [0, 2, 1], COL.pink, { cands: CANDS, mode: 'plane-x' })], pr, S;
      P.choice(st, api, { id: 'an-p3', predict: true, label: '先猜猜看', prompt: '<b>二面角</b>的大小範圍是？', row: true, options: [{ ok: true, t: '0° 到 180°' }, { t: '0° 到 90°' }, { t: '0° 到 360°' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動 T'); } });
      st.append(P.instr('二面角用<b>兩條垂直於稜的射線</b>（橘、粉紅）的夾角來量。拖動 <b>T</b>（可按「從側面看」）把 β 立起來、倒到另一邊，看角度可以到多大。'));
      S = dihStage(st, { pts: pts, gate: function () { return gate.on; } }); PS.btnRow(st, [{ k: 'side', t: '↔ 從側面看（沿著稜）', fn: function () { PS.camTo(S.sc, Math.PI / 2, 0.02, null, 600); } }, { k: 'reset', t: '⟲ 視角重置', fn: function () { PS.camTo(S.sc, S.sc.home.yaw, S.sc.home.pitch, null, 600); } }]); pr = pillRow(st, 1);
      var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = '二面角 ＝ ' + f1(S.ang) + '°'; if (gate.on) return; seen[Math.round(S.ang)] = 1; if (S.ang > 120) seen.big = 1; if (Object.keys(seen).length >= 4 && seen.big && !done) { done = true; P.track('aha', { id: 'space-angles', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：0° 到 180°'); st.append(P.ruleBox('<b>二面角</b>的範圍是 <b>0° 到 180°</b>（可以是鈍角）。<br>三種空間角比一比：<b>異面直線夾角</b> 0° &lt; θ ≤ 90°；<b>線面角</b> 0° ≤ φ ≤ 90°；<b>二面角</b> 0° ≤ θ ≤ 180°。', '三種角的範圍')); api.unlock('二面角：0° 到 180°'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(1, [0, 2, 0]); S.moveTo(1, [0, 1, -1]); S.moveTo(1, [0, 1, -3]); S.moveTo(1, [0, 2, 1]); }, false, '0° 到 180°（二面角可以是鈍角）');
      st.append(P.hint('T 拖到 β 倒向另一邊（z 是負的），看角度是不是超過 90°。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function skewTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 C、D，讓 l₂ 和 l₁ 是<b>歪斜線</b>，而且<b>夾角剛好是 45°</b>。' })); var fin = false, pts = SK_PTS(), pr, S; pts[3].p = [2, 3, 0];
        S = skewStage(b0, { pts: pts, onEnd: function () { var A = pts[0].p, B = pts[1].p, C = pts[2].p, D = pts[3].p, u = V.sub(B, A), v = V.sub(D, C), w = V.sub(C, A), skew = V.dot(V.cross(u, v), w) !== 0; if (skew && 2 * Math.pow(V.dot(u, v), 2) === V.dot(u, u) * V.dot(v, v) && !fin) { fin = true; P.toast('歪斜，夾角 45°'); b0.append(P.ruleBox('夾角 45°：cos θ ＝ |u·v| ÷ (|u||v|) ＝ √2/2，也就是 2(u·v)² ＝ |u|²|v|²。l₁ 的方向是 (4, 0, 0)，l₂ 的方向像 (1, 1, 0) 或 (1, 0, 1) 就會是 45°；再讓 l₂ 離開 l₁，才是歪斜。', '找到了')); done(); } } }); pr = pillRow(b0, 1);
        var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = '夾角 θ ＝ ' + f1(S.th) + '°'; }; S.rebuild(); setSolve(function () { S.moveTo(2, [-1, 2, 1]); S.moveTo(3, [1, 4, 1]); }, 'C ＝ (−1, 2, 1)、D ＝ (1, 4, 1)：l₂ 的方向是 (2, 2, 0)，和 l₁ 的 (4, 0, 0) 夾 45°；l₂ 在 z ＝ 1 的平面上，和 l₁（z ＝ 0）不相交，歪斜'); b0.append(P.hint('l₁ 沿 x 軸。l₂ 的方向要和 x 軸夾 45°：x 和 y（或 z）的變化一樣多。'));
      }
      function lineAngleTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>P</b>，讓<b>線面角 φ 是 45°</b>。' })); var fin = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('P', [1, 3, 1], COL.pink, { cands: PC })], pr, S;
        S = lpStage(b0, { pts: pts, onEnd: function () { if (Math.abs(S.phi - 45) < 1e-6 && !fin) { fin = true; P.toast('φ ＝ 45°'); b0.append(P.ruleBox('線面角 φ ＝ 射影和 OP 的夾角：tan φ ＝ 高度 ÷ 射影長。要 45°，高度要等於射影長：例如 P(2, 2, 0)、P(1, 1, 0)、P(0, 2, 2)。', '找到了')); done(); } } }); pr = pillRow(b0, 1);
        var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = '高度 ＝ ' + pts[1].p[1] + '，射影長 ＝ ' + f1(S.hz) + '，φ ＝ ' + f1(S.phi) + '°'; }; S.rebuild(); setSolve(function () { S.moveTo(1, [2, 2, 0]); }, 'P ＝ (2, 2, 0)（高度 2、射影長 2，φ ＝ 45°）；(1, 1, 0)、(0, 2, 2) 也可以'); b0.append(P.hint('45° 的直角三角形：高和底一樣長。看「高度」和「射影長」。'));
      }
      function dihTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>T</b>，讓<b>二面角是 45°</b>。' })); var fin = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('T', [0, 2, -2], COL.pink, { cands: CANDS, mode: 'plane-x' })], pr, S;
        S = dihStage(b0, { pts: pts, onEnd: function () { var T = pts[1].p; if (T[1] > 0 && T[2] === T[1] && !fin) { fin = true; P.toast('二面角 45°'); b0.append(P.ruleBox('二面角是 OT 和 +z 方向的夾角。T(0, y, y)：高度和 z 一樣，夾角 45°。', '找到了')); done(); } } }); PS.btnRow(b0, [{ k: 'side', t: '↔ 從側面看', fn: function () { PS.camTo(S.sc, Math.PI / 2, 0.02, null, 600); } }]); pr = pillRow(b0, 1);
        var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = '二面角 ＝ ' + f1(S.ang) + '°'; }; S.rebuild(); setSolve(function () { S.moveTo(1, [0, 1, 1]); }, 'T ＝ (0, 1, 1)（或 (0, 2, 2)）：OT 和 +z 夾 45°'); b0.append(P.hint('二面角 45°：往 +z 走多少，就往上走多少。'));
      }
      function perpTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>P</b>，讓<b>線面角是最大的 90°</b>（OP 垂直於平面）。' })); var fin = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('P', [2, 2, 1], COL.pink, { cands: PC })], S, pr;
        S = lpStage(b0, { pts: pts, onEnd: function () { if (Math.abs(S.phi - 90) < 1e-6 && !fin) { fin = true; P.toast('φ ＝ 90°：OP ⊥ α'); b0.append(P.ruleBox('φ ＝ 90° 時射影縮成一個點（P 在 O 正上方），OP 垂直於平面。線面角最大是 90°，最小是 0°。', '找到了')); done(); } } }); pr = pillRow(b0, 1);
        var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = 'φ ＝ ' + f1(S.phi) + '°'; }; S.rebuild(); setSolve(function () { S.moveTo(1, [0, 2, 0]); }, 'P 在 O 的正上方，例如 (0, 2, 0)：OP ⊥ α，φ ＝ 90°'); b0.append(P.hint('射影要縮成一個點：P 的 x、z 座標都是 0。'));
      }
      P.taskSeq(box, api, [skewTask, lineAngleTask, dihTask, perpTask], { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-angles' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-angles', moduleName: '空間（六）：空間中的三種角', askAbout: '空間中的角（異面直線夾角、線面角、二面角）',
        aha: '<b>異面直線夾角</b>：平行移動成相交，0° &lt; θ ≤ 90°；<b>線面角</b>：直線和它<b>射影</b>的夾角（最小角），0° ≤ φ ≤ 90°；<b>二面角</b>：兩條<b>垂直於稜</b>的線的夾角，0° ≤ θ ≤ 180°。',
        cards: [{ text: '異面直線夾角 cos θ ＝ |u·v| ÷ (|u||v|)；線面角 φ：sin φ ＝ 高 ÷ 斜線長；二面角：垂直於稜的兩射線的夾角', src: '高中：空間中的角' }, { text: '最小角定理：直線和平面所成的角，是這條直線和平面內所有直線所成角中最小的', src: '線面角' }],
        depth: { here: 0.35, cheetah: [{ at: 0.55, label: '最小角定理的證明<br>三面角' }, { at: 0.85, label: '用空間向量求三種角' }] },
        teasers: [{ title: '三種角的向量求法', q: '用方向向量與法向量，三種角的公式分別怎麼寫？什麼時候要取絕對值？', where: 'S111 2507 第 24 堂（CH1 空間向量 01）', lv: 'L3' }],
        parent: { pitfall: '孩子常把線面角量成和垂線的夾角；忘了異面直線夾角要平行移動；二面角量成隨便兩條線的夾角，沒有垂直於稜。', place: '空間單元的最後一站，把三種角的定義與範圍放在一起比。', ask: ['異面直線的夾角怎麼量？範圍多少？', '線面角是直線和什麼的夾角？', '二面角的範圍為什麼可以到 180°？'] },
        classes: ['S111 2507 第 24 堂（2026 年 1 月）：CH1 空間向量 01（歪斜、二面角）', 'S112 2601 第 5 堂（2026 年 3 月）：CH2 空間中平面直線 01（二面角）'], next: { href: 'play-color-map.html', text: '下一個：塗色（一），地圖著色' } });
    }];
  new P.Lesson({ id: 'space-angles', title: '空間（六）：空間中的三種角', steps: steps });
})();
