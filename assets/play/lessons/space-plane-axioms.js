/* 獵豹玩中學｜空間（二）：兩個平面相交成一條直線、直線上兩點在平面內（平面的基本性質 Part 2）
   預測＋拖動 P、Q、R（決定平面 β）看它和地面 α 的交線 → 預測＋拖動 M、N 看「直線上有兩個點在平面內，整條直線都在平面內」→ 3 個操作關卡。
   要擊中的迷思：兩個平面相交只有一個點；兩個平面相交的圖形是「面」；平面外的直線也可能「有兩個點在平面上」。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL, BOX = { x: [-3, 3], y: [0, 4], z: [-3, 3] }, VIO = COL.violet;
  function sv(p) { return '(' + p.map(function (x) { return String(x).replace('-', '−'); }).join(', ') + ')'; }
  function ptAt(name, p, color, o) { var r = { name: name, p: p.slice(), color: color, mode: 'floor' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function line3(a, b, color, w, dash) { var c = P3.clipLine(a, b, BOX); return c ? { a: c[0], b: c[1], color: color, w: w || 2.5, dash: dash } : null; }
  /* 平面 β（過 P、Q、R）與地面 α（y＝0）的關係：{kind:'line'|'par'|'same'|'none', n, d, L:[a,b]（交線上的兩點）} */
  function betaInfo(p, q, r) {
    var n = V.cross(V.sub(q, p), V.sub(r, p)); if (!n[0] && !n[1] && !n[2]) return { kind: 'none' };
    var e = P3.planeEq(p, q, r), nn = e.n, d = e.d;
    if (!nn[0] && !nn[2]) return d === 0 ? { kind: 'same', n: nn, d: d } : { kind: 'par', n: nn, d: d };
    var a0 = nn[0] ? [d / nn[0], 0, 0] : [0, 0, d / nn[2]], dir = [nn[2], 0, -nn[0]];
    return { kind: 'line', n: nn, d: d, a: a0, b: V.add(a0, dir), dir: dir };
  }

  /* 兩個平面的舞台：α＝地面（紫），β 過 P、Q、R（藍），交線（綠）。o: onEnd、gate、T（要經過的固定點） */
  function stage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, build: function () {
      var spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [], dots: [] }, bi = betaInfo(pts[0].p, pts[1].p, pts[2].p);
      var bf = bi.kind === 'none' ? null : P3.planeInBox(bi.n, bi.d, BOX, { color: COL.blue, alpha: 0.2 });
      if (bf && bi.kind !== 'same') { spec.faces.push(bf); var cm = bf.pts.reduce(function (a, b) { return V.add(a, b); }, [0, 0, 0]); spec.texts.push({ p: V.add(V.mul(cm, 1 / bf.pts.length), [0, 0.15, 0]), t: 'β', color: COL.blue, size: 18, halo: true }); }
      spec.texts.push({ p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true });
      if (bi.kind === 'line') { var l = line3(bi.a, bi.b, COL.green, 5); if (l) { spec.lines.push(l); var m = V.lerp(l.a, l.b, 0.5); spec.texts.push({ p: m, t: 'l', color: COL.green, size: 17, halo: true }); } }
      if (o.T) spec.dots.push({ p: o.T, r: 7, color: COL.amber, label: 'T' });
      hold.bi = bi; return spec;
    } }); Object.defineProperty(S, 'bi', { get: function () { return hold.bi; } }); return S;
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, par = false, done = false, pts = [ptAt('P', [-2, 1, -1], COL.blue), ptAt('Q', [2, 2, -1], COL.blue), ptAt('R', [0, 3, 2], COL.blue)], pK = P.pill('', 'is-green'); pK.style.whiteSpace = 'normal';
      P.choice(st, api, { id: 'pa-p1', predict: true, label: '先猜猜看', prompt: '兩個<b>不重合</b>的平面，如果有一個公共點，那它們的<b>公共部分</b>是什麼？', row: true, options: [{ ok: true, t: '一條直線' }, { t: '只有這一個點' }, { t: '一個平面' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 P、Q、R'); } });
      st.append(P.instr('紫色是地面平面 <b>α</b>，藍色平面 <b>β</b> 由 P、Q、R 三點決定。拖動這三個點，看 α 和 β 的<b>公共部分</b>（綠色粗線）。也試試讓 β 和 α 平行。'));
      var S = stage(st, { pts: pts, gate: function () { return gate.on; } }); st.append(h('div', { class: 'pl-readout' }, pK));
      var old = S.rebuild; S.rebuild = function () { old(); var bi = S.bi; pK.textContent = bi.kind === 'line' ? 'α 與 β 相交，公共部分是一條直線 l（β：' + P3.eqStr({ n: bi.n, d: bi.d }) + '）' : bi.kind === 'par' ? 'β 和 α 平行：沒有公共點' : bi.kind === 'same' ? 'β 和 α 重合' : 'P、Q、R 共線：決定不了平面'; pK.className = 'pl-pill ' + (bi.kind === 'line' ? 'is-green' : 'is-amber'); if (gate.on) return;
        if (bi.kind === 'line') { var k = bi.n.join() + '|' + bi.d; if (!seen[k]) { seen[k] = 1; n++; } } if (bi.kind === 'par') par = true;
        if (n >= 3 && par && !done) { done = true; P.track('aha', { id: 'space-plane-axioms', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：一條直線'); st.append(P.ruleBox('兩個<b>不重合</b>的平面如果有一個公共點，那它們的公共部分是<b>過這個點的一條直線</b>（公理）。不會只有一個點，也不會是一個面。<br>如果<b>沒有公共點</b>，兩個平面就是<b>平行</b>。', '兩平面相交')); api.unlock('兩平面相交於一條直線'); } };
      S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(2, [0, 2, 0]); S.moveTo(0, [-2, 2, -1]); S.moveTo(1, [2, 2, -1]); S.moveTo(2, [0, 2, 2]); S.moveTo(0, [-2, 1, -1]); }, false, '一條直線（兩個不重合的平面相交，公共部分是一條直線；沒有公共點就平行）');
      st.append(P.hint('把 P、Q、R 拖到不同高度，再讓三個點一樣高，看綠線在不在。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, hold = {}, pts = [ptAt('M', [-2, 2, 0], COL.pink), ptAt('N', [2, 3, 1], COL.pink)], pK = P.pill('', 'is-green'); pK.style.whiteSpace = 'normal';
      P.choice(st, api, { id: 'pa-p2', predict: true, label: '先猜猜看', prompt: '一條直線上<b>有兩個點</b>在平面 α 內，這條直線和平面 α 的關係是？', row: true, options: [{ ok: true, t: '整條直線都在平面 α 內' }, { t: '只有那兩個點在 α 內' }, { t: '不一定' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動 M、N'); } });
      st.append(P.instr('地面 <b>α</b>（紫色）。直線過 <b>M、N</b> 兩點（粉紅）。把兩個點放到不同高度，看直線和 α 的關係；高度是 0 就是「在 α 上」。'));
      var S = P3.stage(st, { pts: pts, box: BOX, gate: function () { return gate.on; }, build: function () {
        var M = pts[0].p, N = pts[1].p, c = P3.clipLine(M, N, BOX), spec = { faces: [P3.floorFace({ box: BOX }, VIO, 0.14)], lines: [], texts: [{ p: [-2.4, 0, 2.4], t: 'α', color: VIO, size: 18, halo: true }], dots: [] };
        if (c) spec.lines.push({ a: c[0], b: c[1], color: COL.pink, w: 4 }); var cnt2 = (M[1] === 0 ? 1 : 0) + (N[1] === 0 ? 1 : 0); hold.cnt = cnt2;
        if (cnt2 === 1) { /* 只有一個點在 α 上，那個點就是交點 */ }
        else if (cnt2 === 0 && M[1] !== N[1]) { var t = M[1] / (M[1] - N[1]), X = V.lerp(M, N, t); if (Math.abs(X[0]) <= 3.01 && Math.abs(X[2]) <= 3.01) spec.dots.push({ p: X, r: 6, color: COL.amber, label: 'X' }); } return spec; } });
      st.append(h('div', { class: 'pl-readout' }, pK));
      var old = S.rebuild; S.rebuild = function () { old(); var M = pts[0].p, N = pts[1].p, c = hold.cnt; var msg = c === 2 ? 'M、N 都在 α 內（高度 0）：整條直線 MN 都在 α 內 ✓' : c === 1 ? '只有一個點在 α 內：直線穿過 α，只有這一個交點' : (M[1] === N[1] ? '兩點一樣高（' + M[1] + '）：直線和 α 平行，沒有公共點' : '兩點都不在 α 內：直線穿過 α（交點 X），或延伸後才會碰到'); pK.textContent = msg; pK.className = 'pl-pill ' + (c === 2 ? 'is-ok' : 'is-green'); if (gate.on) return;
        seen[c === 2 ? 'in' : c === 1 ? 'one' : M[1] === N[1] ? 'par' : 'x'] = 1; if (seen.in && seen.one && seen.par && !done) { done = true; P.track('aha', { id: 'space-plane-axioms', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：整條直線都在平面內'); st.append(P.ruleBox('一條直線上<b>有兩個點</b>在一個平面內，那麼這條<b>直線整條</b>都在這個平面內（公理）。<br>只有<b>一個</b>點在平面內時，直線是<b>穿過</b>平面；兩點一樣高又不在平面上，直線和平面<b>平行</b>。', '直線與平面')); api.unlock('兩點在平面內 → 整條直線在平面內'); } };
      S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(0, [-2, 0, 0]); S.moveTo(1, [2, 0, 1]); S.moveTo(1, [2, 3, 1]); S.moveTo(0, [-2, 3, 0]); }, false, '整條直線都在平面 α 內（有兩個點在平面內，直線就在平面內）');
      st.append(P.hint('先把兩個點都放到地面，再只留一個在地面，最後讓兩點一樣高。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function planeTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var fin = false, pK = P.pill('', 'is-green'); pK.style.whiteSpace = 'normal';
          var pts = cfg.pts.map(function (q) { return ptAt(q[0], q[1], COL.blue, q[2] ? { fixed: true } : null); });
          var S = stage(b0, { pts: pts, T: cfg.T, onEnd: function () { if (cfg.ok(S.bi, pts) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } }); b0.append(h('div', { class: 'pl-readout' }, pK));
          var old = S.rebuild; S.rebuild = function () { old(); var bi = S.bi; pK.textContent = bi.kind === 'line' ? 'β：' + P3.eqStr({ n: bi.n, d: bi.d }) + '，和 α 相交於一條直線' : bi.kind === 'par' ? 'β：' + P3.eqStr({ n: bi.n, d: bi.d }) + '，和 α 平行' : bi.kind === 'same' ? 'β 和 α 重合' : 'P、Q、R 共線，沒有平面'; }; S.rebuild();
          setSolve(function () { cfg.ans.forEach(function (a) { S.moveTo(a[0], a[1]); }); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        planeTask({ prompt: '拖動 P、Q、R，讓平面 β <b>和地面 α 平行</b>（沒有公共點）。', pts: [['P', [-2, 1, -1]], ['Q', [2, 2, -1]], ['R', [0, 3, 2]]], ok: function (bi) { return bi.kind === 'par'; }, ans: [[0, [-2, 2, -1]], [2, [0, 2, 2]]], answer: 'P、Q、R 三點一樣高（例如都在高度 2）：β 是 y ＝ 2，和 α 平行', msg: 'β ∥ α：沒有公共點', rule: '三個點一樣高（都在 y ＝ h），β 就是水平的平面 y ＝ h。h ≠ 0 時和 α 沒有公共點，平行。', hint: '平行的平面不會相交，三個點要怎麼放，平面才是「水平」的？' }),
        planeTask({ prompt: '點 <b>T(−1, 0, 2)</b> 在地面上。拖動 Q、R（P 固定），讓兩平面的<b>交線經過 T</b>。', pts: [['P', [2, 0, -1], true], ['Q', [2, 2, 1]], ['R', [-1, 3, 0]]], T: [-1, 0, 2], ok: function (bi) { return bi.kind === 'line' && bi.n[0] * -1 + bi.n[2] * 2 === bi.d; }, ans: [[1, [0, 1, 0]], [2, [-1, 2, 0]]], answer: 'Q ＝ (0, 1, 0)、R ＝ (−1, 2, 0)：β 是 x ＋ y ＋ z ＝ 1，T 代入 −1 ＋ 0 ＋ 2 ＝ 1 ✓（β 過 P 與 T，交線就是直線 PT）', msg: '交線經過 T', rule: '交線在 α（y ＝ 0）上，要經過 T，T 的座標必須滿足 β 的方程式（y ＝ 0 代入，剩下 x、z 的關係）。', hint: '看「β：…」那一列，把 T 的 x、z 代進去，要等於右邊。' }),
        planeTask({ prompt: '拖動 P、Q、R，讓交線<b>和 x 軸平行，但不是 x 軸本身</b>。', pts: [['P', [-2, 1, 0]], ['Q', [2, 2, 1]], ['R', [0, 3, -2]]], ok: function (bi) { return bi.kind === 'line' && bi.n[0] === 0 && bi.n[2] !== 0 && bi.d !== 0; }, ans: [[0, [-2, 0, 1]], [1, [2, 0, 1]], [2, [0, 2, 0]]], answer: 'P(−2, 0, 1)、Q(2, 0, 1)、R(0, 2, 0)：β 是 y ＋ 2z ＝ 2，交線是 z ＝ 1（y ＝ 0），和 x 軸平行', msg: '交線和 x 軸平行', rule: '交線和 x 軸平行，表示 β 的方程式沒有 x（x 的係數是 0），例如 y ＋ 2z ＝ 2；右邊不是 0，交線 z ＝ 1，不是 x 軸本身。', hint: '交線的方向和 x 軸一樣：β 的方程式裡面，x 的係數要是 0。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-plane-axioms' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-plane-axioms', moduleName: '空間（二）：兩個平面相交成一條直線', askAbout: '平面的基本性質（兩平面相交、直線在平面內）',
        aha: '兩個不重合的平面有公共點，公共部分就是<b>一條直線</b>；直線上<b>有兩個點</b>在平面內，<b>整條直線</b>都在平面內。',
        cards: [{ text: '公理：兩個不重合的平面如果有一個公共點，則它們相交於過這個點的一條直線', src: '高中：平面的基本性質' }, { text: '公理：一條直線上有兩點在一個平面內，則這條直線上所有的點都在這個平面內', src: '平面的基本性質' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '兩平面交線的求法<br>法向量外積' }, { at: 0.85, label: '三平面的位置關係' }] },
        teasers: [{ title: '交線的方向', q: '兩個平面的交線，方向向量可以怎麼從兩個法向量求出來？', where: 'S112 2601 第 8 堂（空間中平面直線 03）', lv: 'L2' }],
        parent: { pitfall: '孩子常以為兩個平面相交只有一個點；也常忘了「不重合」這個條件。', place: '平面基本性質的第二部分，接著是歪斜線與直線平面的位置關係。', ask: ['兩個不重合的平面相交，交集是什麼？', '直線上有兩個點在平面內，直線在平面內嗎？', '兩個平面沒有公共點，是什麼關係？'] },
        classes: ['S112 2601 第 5 堂（2026 年 3 月）：CH2 空間中平面直線 01', 'S112 2601 第 8 堂（2026 年 3 月）：空間中平面直線 03（交線）'], next: { href: 'play-space-skew.html', text: '下一個：歪斜線' } });
    }];
  new P.Lesson({ id: 'space-plane-axioms', title: '空間（二）：兩個平面相交成一條直線', steps: steps });
})();
