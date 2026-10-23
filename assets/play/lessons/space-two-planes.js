/* 獵豹玩中學｜空間（五）：兩個平面（平行判定、垂直判定、二面角）
   預測＋拖 Q 看「平面 β 內只有一條線平行 α 不夠，要兩條相交線」→ 預測＋β 過 α 的垂線就垂直（轉動、傾斜）→ 預測＋二面角＝兩條垂直於稜的線的夾角 → 3 個操作關卡。
   要擊中的迷思：面面平行只看一條線；面面垂直只看「看起來垂直」；二面角隨便量兩條線、不知道要垂直於稜。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL, BOX = { x: [-3, 3], y: [0, 4], z: [-3, 3] }, VIO = COL.violet;
  function ptAt(name, p, color, o) { var r = { name: name, p: p.slice(), color: color, mode: 'floor' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function f1(v) { return (Math.round(v * 10) / 10).toString().replace('-', '−'); }
  function alpha() { return { p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true }; }
  function pillRow(host, n, cls) { var out = []; for (var i = 0; i < n; i++) { var p = P.pill('', cls && cls[i] || 'is-green'); p.style.whiteSpace = 'normal'; out.push(p); host.append(h('div', { class: 'pl-readout' }, p)); } return out; }
  function line3(a, b, color, w) { var c = P3.clipLine(a, b, BOX); return c ? { a: c[0], b: c[1], color: color, w: w || 3 } : null; }

  /* ───────── 平行判定：m₁（過 K 平行 x 軸）＋ m₂（過 K、Q）決定平面 β ───────── */
  function parStage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, build: function () {
      var K = pts[0].p, E = pts[1].p, Q = pts[2].p, spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [alpha()], dots: [] }, eq = P3.planeEq(K, E, Q), kind;
      var l1 = line3(K, E, COL.blue, 4), l2 = line3(K, Q, COL.pink, 4); if (l1) { spec.lines.push(l1); spec.texts.push({ p: V.lerp(l1.a, l1.b, 0.1), t: 'm₁', color: COL.blue, size: 16, halo: true }); } if (l2) { spec.lines.push(l2); spec.texts.push({ p: V.lerp(l2.a, l2.b, 0.9), t: 'm₂', color: COL.pink, size: 16, halo: true }); }
      if (!eq) kind = 'none'; else {
        var bf = P3.planeInBox(eq.n, eq.d, BOX, { color: COL.blue, alpha: 0.2 }); if (bf) { spec.faces.push(bf); spec.texts.push({ p: V.add(V.mul(bf.pts.reduce(function (a, b) { return V.add(a, b); }, [0, 0, 0]), 1 / bf.pts.length), [0, 0.15, 0]), t: 'β', color: COL.blue, size: 18, halo: true }); }
        if (!eq.n[0] && !eq.n[2]) kind = 'par';
        else { kind = 'int'; var n = eq.n, d = eq.d, a0 = n[0] ? [d / n[0], 0, 0] : [0, 0, d / n[2]], L = line3(a0, V.add(a0, [n[2], 0, -n[0]]), COL.green, 5); if (L) spec.lines.push(L); }
      }
      hold.kind = kind; hold.eq = eq; return spec;
    } }); Object.defineProperty(S, 'kind', { get: function () { return hold.kind; } }); Object.defineProperty(S, 'eq', { get: function () { return hold.eq; } }); return S;
  }
  var PAR_PTS = function () { return [ptAt('K', [0, 2, 0], COL.blue, { fixed: true }), ptAt('E', [2, 2, 0], COL.blue, { fixed: true }), ptAt('Q', [0, 3, 2], COL.pink)]; };
  function parText(S) { var k = S.kind; return k === 'par' ? 'β：' + P3.eqStr(S.eq) + '，m₁、m₂ 都平行於 α：β ∥ α，沒有公共點' : k === 'int' ? 'β：' + P3.eqStr(S.eq) + '：m₁ 雖然平行於 α，β 還是和 α 相交（綠線）' : 'Q 在 m₁ 上：只有一條直線，決定不了 β'; }

  /* ───────── 垂直判定：軸 OT ＋ 水平線 e(θ) 決定平面 β ───────── */
  function perpStage(host, o) {
    var pts = o.pts, st2 = o.st, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, valid: function (p, pt, i) { return !(i === 1 && !p[0] && !p[1] && !p[2]); }, build: function () {
      var O = [0, 0, 0], T = pts[1].p, th = st2.th * Math.PI / 180, e = [Math.cos(th), 0, Math.sin(th)], spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [alpha()], dots: [] };
      var n = V.cross(T, e), nl = V.len(n), ny = nl < 1e-9 ? null : n[1] / nl; hold.ny = ny;
      spec.lines.push({ a: O, b: T, color: COL.pink, w: 4.5 }, { a: V.mul(e, -2.8), b: V.mul(e, 2.8), color: COL.amber, w: 3 }); spec.texts.push({ p: V.mul(e, 2.8), t: '邊', color: COL.amber, size: 15, halo: true });
      if (ny !== null) {
        var nn = V.mul(n, 1 / nl), pf = P3.planeInBox(nn, 0, BOX, { color: COL.blue, alpha: 0.2 });
        if (pf) { spec.faces.push(pf); spec.texts.push({ p: V.add(V.mul(pf.pts.reduce(function (a, b) { return V.add(a, b); }, [0, 0, 0]), 1 / pf.pts.length), [0, 0.15, 0]), t: 'β', color: COL.blue, size: 18, halo: true }); }
        if (Math.abs(ny) < 1e-9) { var up = [0, 1, 0], ed = e; P3.rightMark(O, up, ed, 0.36, COL.green).forEach(function (l) { spec.lines.push(l); }); }
      }
      return spec;
    } }); Object.defineProperty(S, 'ny', { get: function () { return hold.ny; } }); return S;
  }

  /* ───────── 二面角：稜＝x 軸，α 半平面朝 +z，β 半平面朝 OT（T 在 x＝0 的平面上） ───────── */
  var CANDS = []; (function () { for (var y = 0; y <= 3; y++) for (var z = -3; z <= 3; z++) if (y || z) CANDS.push([0, y, z]); })();
  function dihStage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, controls: false, yaw: Math.PI / 2 - 0.4, pitch: 0.3, build: function () {
      var O = [0, 0, 0], T = pts[1].p, u = V.norm(T), spec = { faces: [], lines: [], texts: [], dots: [] }, X = V.norm([1, 0, 0]);
      spec.faces.push({ pts: [[-3, 0, 0], [3, 0, 0], [3, 0, 3], [-3, 0, 3]], fill: VIO, alpha: 0.16, stroke: 'rgba(122,79,214,.55)', lw: 1.4, flat: true, nopick: true, double: true });
      spec.faces.push({ pts: [[-3, 0, 0], [3, 0, 0], V.add([3, 0, 0], V.mul(u, 3)), V.add([-3, 0, 0], V.mul(u, 3))], fill: COL.blue, alpha: 0.2, stroke: 'rgba(47,111,220,.7)', lw: 1.6, dash: [6, 4], flat: true, nopick: true, double: true });
      spec.lines.push({ a: [-3, 0, 0], b: [3, 0, 0], color: COL.navy, w: 5 }, { a: O, b: [0, 0, 2.6], color: COL.amber, w: 3.5 }, { a: O, b: V.mul(u, 2.6), color: COL.pink, w: 3.5 });
      spec.texts.push({ p: [3, 0, 0], t: '稜', color: COL.navy, size: 16, halo: true }, { p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true }, { p: V.add(V.mul(u, 2.2), [1.4, 0, 0]), t: 'β', color: COL.blue, size: 18, halo: true });
      P3.rightMark(O, X, [0, 0, 1], 0.4, COL.amber).forEach(function (l) { spec.lines.push(l); }); P3.rightMark(O, X, u, 0.4, COL.pink).forEach(function (l) { spec.lines.push(l); });
      var ang = Math.acos(Math.max(-1, Math.min(1, u[2]))) * 180 / Math.PI; hold.ang = ang;
      var bis = V.norm(V.add([0, 0, 1], u)), mid = V.len(V.add([0, 0, 1], u)) < 1e-9 ? [0, 1, 0] : bis; spec.texts.push({ p: V.mul(mid, 1.05), t: Math.abs(ang - 90) < 1e-9 ? '90°' : f1(ang) + '°', color: COL.green, size: 15, halo: true });
      return spec;
    } }); Object.defineProperty(S, 'ang', { get: function () { return hold.ang; } }); return S;
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, pts = PAR_PTS(), pK;
      P.choice(st, api, { id: 'tw-p1', predict: true, label: '先猜猜看', prompt: '平面 β 內有<b>一條</b>直線 m₁ 平行於平面 α，那 β 一定平行於 α 嗎？', row: true, options: [{ ok: true, t: '不一定' }, { t: '一定' }, { t: '一定相交' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 Q'); } });
      st.append(P.instr('平面 <b>β</b>（藍）由兩條相交直線 <b>m₁</b>（藍，平行於地面）和 <b>m₂</b>（粉紅，過 K、Q）決定。拖動 <b>Q</b>，看 β 和地面 α 的關係。m₂ 要放在什麼位置，β 才平行於 α？'));
      var S = parStage(st, { pts: pts, gate: function () { return gate.on; } }); pK = pillRow(st, 1)[0];
      var old = S.rebuild; S.rebuild = function () { old(); pK.textContent = parText(S); pK.className = 'pl-pill ' + (S.kind === 'par' ? 'is-ok' : 'is-green'); if (gate.on) return; seen[S.kind] = 1; if (seen.par && seen.int && !done) { done = true; P.track('aha', { id: 'space-two-planes', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：只有一條線平行不一定'); st.append(P.ruleBox('平面 β 內<b>只有一條</b>直線平行於 α，β 還是可能和 α 相交（m₂ 傾斜時就是）。<br><b>面面平行的判定</b>：β 內有<b>兩條相交</b>的直線都<b>平行於 α</b>，β 就平行於 α。（m₂ 也要水平，β 才是水平的。）', '面面平行')); api.unlock('兩條相交直線都平行於 α → β ∥ α'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(2, [0, 2, 2]); S.moveTo(2, [0, 3, 2]); }, false, '不一定：β 內只有一條線平行於 α 不夠，要有兩條相交的直線都平行於 α');
      st.append(P.hint('Q 的高度改變看看，再讓 Q 和 K 一樣高。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, st2 = { th: 0 }, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('T', [0, 3, 0], COL.pink)], pr, S;
      P.choice(st, api, { id: 'tw-p2', predict: true, label: '先猜猜看', prompt: '平面 β 經過平面 α 的<b>一條垂線</b>（垂直於 α 的直線），β 和 α 的關係是？', row: true, options: [{ ok: true, t: 'β 垂直於 α' }, { t: 'β 平行於 α' }, { t: '不一定' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('轉動平面、拖動 T'); } });
      st.append(P.instr('粉紅線 <b>OT</b> 是平面 β 內的一條直線（現在垂直於地面 α）。拉滑桿讓 β 繞著它轉；再拖動 <b>T</b> 把 OT 斜過來，看 β 和 α 還垂不垂直。<b>90°</b> 會畫綠色直角符號。'));
      S = perpStage(st, { pts: pts, st: st2, gate: function () { return gate.on; } });
      var sl = P.slider(0, 165, 0, function (v) { st2.th = v; S.rebuild(); }, 15); st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '轉動平面 β：0° 到 165°')), sl); pr = pillRow(st, 2, ['is-green', 'is-amber']);
      var old = S.rebuild; S.rebuild = function () { old(); var ny = S.ny, T = pts[1].p; if (ny === null) { pr[0].textContent = 'OT 和邊在同一條直線上：決定不了平面'; pr[1].textContent = ''; return; } var phi = Math.acos(Math.min(1, Math.abs(ny))) * 180 / Math.PI; pr[0].textContent = 'β 和 α 的夾角 ＝ ' + f1(phi) + '°' + (Math.abs(ny) < 1e-9 ? '：β ⊥ α ✓' : ''); pr[0].className = 'pl-pill ' + (Math.abs(ny) < 1e-9 ? 'is-ok' : 'is-green'); var vert = !T[0] && !T[2]; pr[1].textContent = Math.abs(ny) < 1e-9 ? 'β 內有一條垂直於 α 的直線（鉛直線）' : 'β 內沒有垂直於 α 的直線'; if (gate.on) return;
        if (Math.abs(ny) < 1e-9 && vert) seen['v' + st2.th] = 1; if (Math.abs(ny) > 1e-9 && ny !== null) seen.nonperp = 1; if (Object.keys(seen).filter(function (k) { return k[0] === 'v'; }).length >= 3 && seen.nonperp && !done) { done = true; P.track('aha', { id: 'space-two-planes', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：β 垂直於 α'); st.append(P.ruleBox('<b>面面垂直的判定</b>：一個平面<b>經過另一個平面的垂線</b>，這兩個平面<b>垂直</b>。OT 垂直於 α 時，β 怎麼轉，夾角都是 <b>90°</b>。<br>OT 斜了，β 裡面就沒有垂直於 α 的線，夾角就不是 90°（除非邊剛好和 T 的影子同一個方向，β 裡又出現了垂線）。', '面面垂直')); api.unlock('經過垂線的平面 ⊥ 這個平面'); } }; S.rebuild();
      api.solve(function () { gate.on = false; [45, 90, 135].forEach(function (v) { sl.value = v; st2.th = v; S.rebuild(); }); S.moveTo(1, [1, 3, 0]); sl.value = 60; st2.th = 60; S.rebuild(); S.moveTo(1, [0, 3, 0]); }, false, 'β 垂直於 α（β 經過 α 的垂線）');
      st.append(P.hint('先讓 T 在 O 的正上方，慢慢轉 β；再把 T 拖歪。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('T', [0, 2, 1], COL.pink, { cands: CANDS, mode: 'plane-x' })], pr, S;
      P.choice(st, api, { id: 'tw-p3', predict: true, label: '先猜猜看', prompt: '要量兩個平面的<b>二面角</b>，應該量哪兩條線的夾角？', row: true, options: [{ ok: true, t: '兩個平面內、都垂直於「稜」的兩條線' }, { t: '兩個平面內任意兩條線' }, { t: '稜本身和一個平面' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動 T'); } });
      st.append(P.instr('兩個平面（紫的 α、藍的 β）像一本書，<b>稜</b>是黑色粗線（x 軸）。橘線在 α 內、粉紅線在 β 內，<b>都垂直於稜</b>（直角符號）。拖動 <b>T</b> 轉動 β（可按「從側面看」），看<b>二面角</b>。'));
      S = dihStage(st, { pts: pts, gate: function () { return gate.on; } }); PS.btnRow(st, [{ k: 'side', t: '↔ 從側面看（沿著稜）', fn: function () { PS.camTo(S.sc, Math.PI / 2, 0.02, null, 600); } }, { k: 'reset', t: '⟲ 視角重置', fn: function () { PS.camTo(S.sc, S.sc.home.yaw, S.sc.home.pitch, null, 600); } }]); pr = pillRow(st, 2, ['is-green', 'is-amber']);
      var old = S.rebuild; S.rebuild = function () { old(); var a = S.ang, T = pts[1].p; pr[0].textContent = '二面角 ＝ ' + f1(a) + '°' + (Math.abs(a - 90) < 1e-9 ? '（直二面角：兩個平面垂直）' : ''); pr[1].textContent = 'T ' + '(' + T.join(', ').replace(/-/g, '−') + ')：β 半平面朝向 OT，和 α 半平面（朝 +z）的夾角'; if (gate.on) return; seen[Math.round(a)] = 1; if (Object.keys(seen).length >= 4 && !done) { done = true; P.track('aha', { id: 'space-two-planes', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：兩條都垂直於稜的線'); st.append(P.ruleBox('<b>二面角</b>：在稜上取一點，在兩個平面內各作一條<b>垂直於稜</b>的射線，這兩條射線的夾角就是二面角（橘線和粉紅線）。從側面看（沿著稜），它就是真實的角度。二面角的範圍是 0° 到 180°，<b>90°</b> 就是兩個平面垂直。', '二面角')); api.unlock('二面角 ＝ 兩條垂直於稜的線的夾角'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(1, [0, 1, 1]); S.moveTo(1, [0, 2, 0]); S.moveTo(1, [0, 1, -1]); S.moveTo(1, [0, 2, 1]); }, false, '兩條垂直於稜的線（一個平面內一條）：它們的夾角就是二面角');
      st.append(P.hint('把 T 放到 β 立起來、倒下去、折回另一邊，看角度怎麼變。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function parTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>Q</b>，讓平面 β <b>平行於</b>地面 α。' })); var fin = false, pts = PAR_PTS(), pK = null, S;
        S = parStage(b0, { pts: pts, onEnd: function () { if (S.kind === 'par' && !fin) { fin = true; P.toast('β ∥ α'); b0.append(P.ruleBox('β 內有兩條相交直線 m₁、m₂ 都平行於 α（都和 K 一樣高），β 就平行於 α。Q 的高度要和 K 一樣：2。', '找到了')); done(); } } }); pK = pillRow(b0, 1)[0];
        var old = S.rebuild; S.rebuild = function () { old(); pK.textContent = parText(S); }; S.rebuild(); setSolve(function () { S.moveTo(2, [0, 2, 2]); }, 'Q ＝ (0, 2, 2)：和 K 一樣高（高度 2），m₂ 也平行於 α，β ∥ α'); b0.append(P.hint('m₂ 也要平行於地面：Q 和 K 的高度要怎麼樣？'));
      }
      function perpTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '平面 β 繞邊轉了 <b>60°</b>。拖動 <b>T</b>，讓 β <b>垂直於</b>地面 α。' })); var fin = false, st2 = { th: 60 }, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('T', [2, 3, 1], COL.pink)], pr, S;
        S = perpStage(b0, { pts: pts, st: st2, onEnd: function () { if (Math.abs(S.ny) < 1e-9 && S.ny !== null && !fin) { fin = true; P.toast('β ⊥ α'); b0.append(P.ruleBox('β 要垂直於 α，β 內必須有一條垂直於 α 的直線。OT 是 β 內的線，讓 OT 垂直於地面：T 在 O 的正上方（x ＝ 0、z ＝ 0）。', '找到了')); done(); } } }); pr = pillRow(b0, 1);
        var old = S.rebuild; S.rebuild = function () { old(); var ny = S.ny; pr[0].textContent = ny === null ? '決定不了平面' : 'β 和 α 的夾角 ＝ ' + f1(Math.acos(Math.min(1, Math.abs(ny))) * 180 / Math.PI) + '°'; }; S.rebuild(); setSolve(function () { S.moveTo(1, [0, 3, 0]); }, 'T ＝ (0, 3, 0)：OT 垂直於 α，β 經過這條垂線，β ⊥ α'); b0.append(P.hint('怎麼放 T，β 裡面才有「垂直於地面」的線？'));
      }
      function dihTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '拖動 <b>T</b>，讓二面角是 <b>135°</b>（β 倒向另一邊）。' })); var fin = false, pts = [ptAt('O', [0, 0, 0], COL.violet, { fixed: true, noShadow: true }), ptAt('T', [0, 2, 1], COL.pink, { cands: CANDS, mode: 'plane-x' })], pr, S;
        S = dihStage(b0, { pts: pts, onEnd: function () { var T = pts[1].p; if (T[1] > 0 && T[2] === -T[1] && !fin) { fin = true; P.toast('二面角 135°'); b0.append(P.ruleBox('二面角是 OT 和 +z 方向的夾角。T(0, y, −y)：OT 和 +z 夾 135°（和 −z 夾 45°）。', '找到了')); done(); } } }); PS.btnRow(b0, [{ k: 'side', t: '↔ 從側面看', fn: function () { PS.camTo(S.sc, Math.PI / 2, 0.02, null, 600); } }]); pr = pillRow(b0, 1);
        var old = S.rebuild; S.rebuild = function () { old(); pr[0].textContent = '二面角 ＝ ' + f1(S.ang) + '°'; }; S.rebuild(); setSolve(function () { S.moveTo(1, [0, 1, -1]); }, 'T ＝ (0, 1, −1)（或 (0, 2, −2)）：OT 和 +z 的夾角 135°'); b0.append(P.hint('135° ＝ 90° ＋ 45°：先到 90°（T 在正上方），再往 −z 那邊倒 45°。'));
      }
      P.taskSeq(box, api, [parTask, perpTask, dihTask], { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-two-planes' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-two-planes', moduleName: '空間（五）：兩個平面的位置關係與二面角', askAbout: '兩個平面的位置關係、面面平行與垂直的判定、二面角',
        aha: '<b>面面平行</b>：一個平面內有<b>兩條相交</b>的直線都平行於另一個平面；<b>面面垂直</b>：一個平面<b>經過</b>另一個平面的<b>垂線</b>；<b>二面角</b>＝兩個平面內<b>都垂直於稜</b>的兩條線的夾角。',
        cards: [{ text: '面面平行判定：一個平面內有兩條相交直線都平行於另一個平面，則這兩個平面平行', src: '高中：平面與平面平行' }, { text: '面面垂直判定：一個平面經過另一個平面的垂線，則這兩個平面垂直；二面角：兩半平面內垂直於稜的射線的夾角', src: '平面與平面垂直、二面角' }],
        depth: { here: 0.35, cheetah: [{ at: 0.55, label: '二面角的向量求法<br>法向量夾角' }, { at: 0.85, label: '三垂線法求二面角' }] },
        teasers: [{ title: '二面角與法向量', q: '用兩個平面的法向量求二面角，什麼時候是法向量夾角、什麼時候是它的補角？', where: 'S112 2601 第 5 堂（CH2 空間中平面直線 01）', lv: 'L3' }],
        parent: { pitfall: '孩子常只驗證一條線平行就說兩平面平行；面面垂直只憑「看起來垂直」；量二面角時隨便取兩條線，沒有垂直於稜。', place: '空間單元的後半，接著是三種空間角的比較。', ask: ['兩個平面平行，要滿足什麼條件？', '怎樣的兩個平面是垂直的？', '二面角要用哪兩條線來量？'] },
        classes: ['S111 2507 第 24 堂（2026 年 1 月）：CH1 空間向量 01（二面角）', 'S112 2601 第 5 堂（2026 年 3 月）：CH2 空間中平面直線 01（二面角、法向量）'], next: { href: 'play-space-angles.html', text: '下一個：空間中的三種角' } });
    }];
  new P.Lesson({ id: 'space-two-planes', title: '空間（五）：兩個平面的位置關係與二面角', steps: steps });
})();
