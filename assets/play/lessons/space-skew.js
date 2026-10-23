/* 獵豹玩中學｜空間（三）：兩條直線的位置關係與歪斜線（平面的基本性質 Part 3）
   預測＋拖動直線 l₂ 的兩個點 C、D，看它和 l₁ 是平行、相交、還是歪斜（不在同一平面）→ 3 個操作關卡。
   要擊中的迷思：兩條不相交的直線一定平行；以為空間中的兩條直線一定共面。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL, BOX = { x: [-3, 3], y: [0, 4], z: [-3, 3] };
  function sv(p) { return '(' + p.map(function (x) { return String(x).replace('-', '−'); }).join(', ') + ')'; }
  function ptAt(name, p, color, o) { var r = { name: name, p: p.slice(), color: color, mode: 'floor' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  var zero = function (v) { return !v[0] && !v[1] && !v[2]; };
  /* l₁：A、B；l₂：C、D（都是整條直線）。回傳 {kind:'same'|'par'|'int'|'skew', triple, X} */
  function rel(A, B, C, D) {
    var u = V.sub(B, A), v = V.sub(D, C), w = V.sub(C, A), uv = V.cross(u, v), tri = V.dot(uv, w);
    if (zero(uv)) return { kind: zero(V.cross(w, u)) ? 'same' : 'par', triple: 0 };
    if (tri !== 0) return { kind: 'skew', triple: tri, uv: uv };
    var den = V.dot(uv, uv), t = V.dot(V.cross(w, v), uv) / den, X = V.add(A, V.mul(u, t)); return { kind: 'int', triple: 0, X: X, uv: uv };
  }
  var NAME = { same: '重合', par: '平行', int: '相交', skew: '歪斜' };

  function stage(host, o) {
    var pts = o.pts, hold = {}, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, build: function () {
      var A = pts[0].p, B = pts[1].p, C = pts[2].p, D = pts[3].p, r = rel(A, B, C, D), spec = { faces: [], lines: [], texts: [], dots: [] }, c1 = P3.clipLine(A, B, BOX), c2 = P3.clipLine(C, D, BOX);
      if (c1) { spec.lines.push({ a: c1[0], b: c1[1], color: COL.blue, w: 4 }); spec.texts.push({ p: V.lerp(c1[0], c1[1], 0.88), t: 'l₁', color: COL.blue, size: 16, halo: true }); }
      if (c2) { spec.lines.push({ a: c2[0], b: c2[1], color: COL.pink, w: 4 }); spec.texts.push({ p: V.lerp(c2[0], c2[1], 0.12), t: 'l₂', color: COL.pink, size: 16, halo: true }); }
      var n = V.cross(V.sub(B, A), V.sub(C, A)), plane = !zero(n) ? P3.planeFace(A, B, C, { also: [D], color: r.kind === 'skew' ? COL.amber : COL.green, alpha: r.kind === 'skew' ? 0.13 : 0.2, stroke: r.kind === 'skew' ? 'rgba(210,155,31,.7)' : 'rgba(31,157,85,.7)' }) : null;
      if (plane) spec.faces.push(plane);
      if (r.kind === 'skew' && plane) { var nn = V.norm(n), s = V.dot(nn, V.sub(D, A)); r.dist = Math.abs(s); spec.lines.push({ a: D, b: V.sub(D, V.mul(nn, s)), color: COL.amber, w: 2, dash: [5, 4] }); }
      if (r.kind === 'int' && r.X[0] >= -3 && r.X[0] <= 3 && r.X[1] >= 0 && r.X[1] <= 4 && r.X[2] >= -3 && r.X[2] <= 3) spec.dots.push({ p: r.X, r: 6, color: COL.green, label: 'X' });
      hold.r = r; return spec;
    } }); Object.defineProperty(S, 'r', { get: function () { return hold.r; } }); return S;
  }
  function readout(host) {
    var pK = P.pill('', 'is-green'), pT = P.pill('', 'is-amber'); pK.style.whiteSpace = 'normal'; pT.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, pK), h('div', { class: 'pl-readout' }, pT));
    return function (r, pts) {
      pK.textContent = 'l₁ 與 l₂：' + NAME[r.kind]; pK.className = 'pl-pill ' + (r.kind === 'skew' ? 'is-pink' : 'is-green');
      pT.textContent = r.kind === 'skew' ? '找不到同時包含 l₁、l₂ 的平面：D 離「l₁ 與 C 決定的平面」還有 ' + (Math.round((r.dist || 0) * 100) / 100) + ' → 不共面（歪斜）' : r.kind === 'int' ? '有一個交點，l₁、l₂ 在同一個平面上（綠色平面）' : r.kind === 'par' ? '方向一樣、沒有交點，l₁、l₂ 在同一個平面上（綠色平面）' : 'l₁、l₂ 是同一條直線';
    };
  }

  var steps = [
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, pts = [ptAt('A', [-2, 1, 0], COL.blue, { fixed: true }), ptAt('B', [2, 1, 0], COL.blue, { fixed: true }), ptAt('C', [-2, 3, -2], COL.pink), ptAt('D', [2, 3, 2], COL.pink)], ro;
      P.choice(st, api, { id: 'sk-p1', predict: true, label: '先猜猜看', prompt: '空間中<b>兩條不相交</b>的直線，一定平行嗎？', row: true, options: [{ ok: true, t: '不一定，也可能是歪斜' }, { t: '一定平行' }, { t: '一定在同一個平面上' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 C、D'); } });
      st.append(P.instr('藍線 <b>l₁</b>（A、B）固定，粉紅線 <b>l₂</b> 由 <b>C、D</b> 決定。拖動 C、D，看 l₁、l₂ 是平行、相交，還是<b>歪斜</b>。能放進同一個平面（綠色或黃色的面）才叫共面。'));
      var S = stage(st, { pts: pts, gate: function () { return gate.on; } }); ro = readout(st);
      var old = S.rebuild; S.rebuild = function () { old(); var r = S.r; ro(r); if (gate.on) return; seen[r.kind] = 1; if (seen.par && seen.int && seen.skew && !done) { done = true; P.track('aha', { id: 'space-skew', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：不相交也可能歪斜'); st.append(P.ruleBox('空間中兩條直線有三種關係：<b>平行</b>（共面、不相交）、<b>相交</b>（共面、有一個交點）、<b>歪斜</b>（<b>不共面</b>，也不相交）。<br>所以<b>不相交</b>不代表平行，還要看有沒有在同一個平面上。', '三種位置關係')); api.unlock('歪斜線：不共面、不相交'); } }; S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(2, [-2, 3, 0]); S.moveTo(3, [2, 3, 0]); S.moveTo(2, [-2, 1, -2]); S.moveTo(3, [2, 1, 2]); S.moveTo(2, [-2, 3, -2]); S.moveTo(3, [2, 3, 2]); }, false, '不一定：不相交的兩條直線，可能平行，也可能歪斜（不共面）');
      st.append(P.hint('把 C、D 拉成和 l₁ 同方向、讓兩條線交在一點、再放到上面讓它們「錯開」。')); api.lock('先做上面的預測');
    },
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var fin = false, ro, pts = [ptAt('A', [-2, 1, 0], COL.blue, { fixed: true }), ptAt('B', [2, 1, 0], COL.blue, { fixed: true }), ptAt('C', cfg.C, COL.pink), ptAt('D', cfg.D, COL.pink)];
          var S = stage(b0, { pts: pts, onEnd: function () { if (S.r.kind === cfg.kind && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } }); ro = readout(b0); var old = S.rebuild; S.rebuild = function () { old(); ro(S.r); }; S.rebuild();
          setSolve(function () { cfg.ans.forEach(function (a) { S.moveTo(a[0], a[1]); }); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ prompt: '拖動 C、D，讓 l₂ 和 l₁ 是<b>歪斜線</b>。', kind: 'skew', C: [-2, 1, -2], D: [2, 1, 2], ans: [[2, [-2, 3, -2]], [3, [2, 3, 2]]], answer: 'C ＝ (−2, 3, −2)、D ＝ (2, 3, 2) 之類：l₂ 在 l₁ 的上方、方向不同，又不會碰到 l₁', msg: '歪斜：不共面', rule: '歪斜線：不相交、方向不同，也不在同一個平面上。例如 l₂ 比 l₁ 高、又朝不同方向。', hint: '想像兩條馬路，一條在高架橋上、一條在地面上，方向不同。' }),
        task({ prompt: '拖動 C、D，讓 l₂ 和 l₁ <b>相交於一點</b>（不能平行）。', kind: 'int', C: [-2, 3, -2], D: [2, 3, 2], ans: [[2, [0, 1, -2]], [3, [0, 1, 2]]], answer: 'C ＝ (0, 1, −2)、D ＝ (0, 1, 2)：l₂ 穿過 l₁ 上的 (0, 1, 0)（交點）', msg: '相交於一點', rule: '兩條直線要相交，必須有一個點同時在兩條線上，而且它們共面。(0, 1, 0) 在 l₁ 上，也在 l₂ 上。', hint: 'l₁ 上有一個點 (0, 1, 0)，讓 l₂ 也走過它。' }),
        task({ prompt: '拖動 C、D，讓 l₂ 和 l₁ <b>平行</b>（不能重合）。', kind: 'par', C: [-2, 3, -2], D: [2, 3, 2], ans: [[2, [-2, 3, 1]], [3, [2, 3, 1]]], answer: 'C ＝ (−2, 3, 1)、D ＝ (2, 3, 1)：方向和 l₁ 一樣（沿 x 軸），位置不同', msg: '平行：共面、不相交', rule: '平行：方向向量成比例，而且不重合。l₁ 的方向是 (4, 0, 0)，l₂ 要有同樣的方向，例如 C、D 的 y、z 座標都一樣。', hint: 'l₁ 是沿 x 軸方向，l₂ 的 C、D 要怎麼放，方向才一樣？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-skew' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-skew', moduleName: '空間（三）：兩條直線的位置關係與歪斜線', askAbout: '空間中兩條直線的位置關係（歪斜線）',
        aha: '空間中兩條直線有<b>平行、相交、歪斜</b>三種關係；<b>歪斜線不共面</b>，所以「不相交」不一定平行。',
        cards: [{ text: '平行：共面且沒有交點；相交：共面且有一個交點；歪斜：不共面', src: '高中：空間中兩直線的位置關係' }, { text: '判斷：先看方向向量是否成比例（平行），再看是否有共同點；不共面就是歪斜', src: '歪斜線' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '歪斜線的夾角<br>歪斜線的距離' }, { at: 0.85, label: '共垂線' }] },
        teasers: [{ title: '歪斜線的夾角', q: '兩條歪斜線不相交，它們的夾角要怎麼量？', where: 'S111 2507 第 24 堂（CH1 空間向量 01）', lv: 'L2' }],
        parent: { pitfall: '孩子常以為「不相交就是平行」；也常想像不出「不在同一個平面上」是什麼樣子。', place: '空間中的直線與平面的基本觀念，接著是直線與平面的位置關係。', ask: ['空間中兩條直線有哪三種關係？', '兩條不相交的直線一定平行嗎？為什麼？', '歪斜線為什麼說「不共面」？'] },
        classes: ['S111 2507 第 24 堂（2026 年 1 月）：CH1 空間向量 01（歪斜）', 'S112 2601 第 9 堂（2026 年 4 月）：空間中直線 04（歪斜）'], next: { href: 'play-space-line-plane.html', text: '下一個：直線與平面的位置關係' } });
    }];
  new P.Lesson({ id: 'space-skew', title: '空間（三）：兩條直線的位置關係與歪斜線', steps: steps });
})();
