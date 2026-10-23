/* 獵豹玩中學｜空間（一）：三個點決定一個平面（平面的基本性質 Part 1）
   預測＋把平面繞著直線 AB 轉（過一條直線的平面有無限多個）→ 預測＋拖點 C（不共線的三點才決定一個平面）→ 拖點 D 看共面 → 3 個操作關卡。
   要擊中的迷思：以為兩點（一條直線）就能決定平面；三點共線也算；四點一定共面。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL, sv = function (p) { return '(' + p.map(function (x) { return String(x).replace('-', '−'); }).join(', ') + ')'; };
  var BOX = { x: [-3, 3], y: [0, 4], z: [-3, 3] };
  function ptAt(name, p, color, o) { var r = { name: name, p: p.slice(), color: color, mode: 'floor' }; if (o) for (var k in o) r[k] = o[k]; return r; }
  function line3(a, b, color, w, dash) { var c = P3.clipLine(a, b, BOX); return c ? { a: c[0], b: c[1], color: color, w: w || 2.5, dash: dash } : null; }
  function cross(a, b, c) { return V.cross(V.sub(b, a), V.sub(c, a)); }
  function collinear(a, b, c) { var n = cross(a, b, c); return !n[0] && !n[1] && !n[2]; }
  function sideOf(eq, p) { return V.dot(eq.n, p) - eq.d; }

  /* 平面 ABC ＋ 一個會動的點 D 的舞台 */
  function planeStage(host, o) {
    var pts = o.pts, S = P3.stage(host, { pts: pts, box: BOX, gate: o.gate, onEnd: o.onEnd, onMove: o.onMove, controls: o.controls, build: function (S2) {
      var A = pts[0].p, B = pts[1].p, C = pts[2].p, spec = { faces: [], lines: [], dots: [], texts: [] }, eq = P3.planeEq(A, B, C);
      if (eq) { var f = P3.planeFace(A, B, C, { also: o.also ? [pts[3].p] : [], color: COL.blue }); if (f) spec.faces.push(f); [[A, B], [B, C], [A, C]].forEach(function (e) { spec.lines.push({ a: e[0], b: e[1], color: COL.blue, w: 3 }); }); }
      else { var l = line3(A, B, COL.blue, 3); if (l) spec.lines.push(l); }
      if (o.extra) o.extra(spec, S2, eq); return spec;
    } });
    return S;
  }

  var steps = [
    /* 1. 過一條直線的平面有無限多個 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, th = 0, A = [-2, 1, 0], B = [2, 1, 0];
      P.choice(st, api, { id: 'tp-p1', predict: true, label: '先猜猜看', prompt: '空間中有一條直線，<b>過這條直線的平面</b>有幾個？', row: true, options: [{ ok: true, t: '無限多個' }, { t: '只有 1 個' }, { t: '2 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('轉動平面'); } });
      st.append(P.instr('藍色的直線 AB 固定不動。拉動滑桿，把<b>平面繞著直線 AB 轉</b>，看看有多少種不同的平面。'));
      var pts = [ptAt('A', A, COL.blue, { fixed: true }), ptAt('B', B, COL.blue, { fixed: true })], pT = P.pill('', 'is-blue');
      var S = P3.stage(st, { pts: pts, box: BOX, controls: false, build: function () {
        var u = [1, 0, 0], v = [0, Math.sin(th * Math.PI / 180), Math.cos(th * Math.PI / 180)], c = [0, 1, 0], hu = 3, hv = 2.2, spec = { faces: [], lines: [], texts: [] };
        var q = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(function (s) { return V.add(c, V.add(V.mul(u, s[0] * hu), V.mul(v, s[1] * hv))); });
        spec.faces.push({ pts: q, fill: COL.blue, alpha: 0.22, stroke: 'rgba(47,111,220,.7)', lw: 1.6, dash: [6, 4], flat: true, nopick: true, double: true });
        spec.lines.push({ a: [-3, 1, 0], b: [3, 1, 0], color: COL.blue, w: 4 }); return spec;
      } });
      var sl = P.slider(0, 180, 0, function (v) { if (gate.on) { sl.value = th; P.toast('先做上面的預測'); return; } th = v; S.rebuild(); pT.textContent = '平面轉了 ' + th + '°：過直線 AB 的另一個平面'; if (!seen[th]) { seen[th] = 1; n++; } if (n >= 5 && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：無限多個'); st.append(P.ruleBox('過一條直線的平面有<b>無限多個</b>：平面可以繞著直線轉，每轉一點就是另一個平面。所以只知道兩個點（一條直線）<b>決定不了</b>平面，還要再給一個<b>不在這條直線上</b>的點，才能把平面固定下來。', '直線不夠')); api.unlock('要再一個不在直線上的點'); } }, 15);
      st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '平面繞直線 AB 轉：0° 到 180°')), sl, h('div', { class: 'pl-readout' }, pT)); pT.textContent = '平面轉了 0°';
      api.solve(function () { gate.on = false;[30, 75, 120, 160, 15, 0].forEach(function (v) { sl.value = v; th = v; S.rebuild(); }); }, false, '無限多個（平面可以繞著直線轉）');
      st.append(P.hint('慢慢拉滑桿，數數看有幾種不同的平面。')); api.lock('先做上面的預測');
    },
    /* 2. 不共線的三點 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, pts = [ptAt('A', [-2, 1, 0], COL.blue, { fixed: true }), ptAt('B', [2, 1, 0], COL.blue, { fixed: true }), ptAt('C', [0, 3, 2], COL.pink)], pE = P.pill('', 'is-green'), seenC = false; pE.style.whiteSpace = 'normal';
      P.choice(st, api, { id: 'tp-p2', predict: true, label: '先猜猜看', prompt: '<b>A、B、C 三點在同一條直線上</b>時，可以決定一個平面嗎？', row: true, options: [{ ok: true, t: '不行（有無限多個平面）' }, { t: '可以，只有 1 個' }, { t: '可以，有 2 個' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拖動點 C'); } });
      st.append(P.instr('A、B 固定，拖動<b>點 C</b>（可以改成「上下移動」），看藍色平面。當 C 走到<b>直線 AB 上</b>會發生什麼事？'));
      var S = planeStage(st, { pts: pts, gate: function () { return gate.on; }, onMove: function () { }, extra: function (spec, S2, eq) {
        var l = line3(pts[0].p, pts[1].p, COL.blue, 2, [5, 4]); if (!eq && l) spec.lines.push(l); },
        onEnd: function () { } });
      st.append(h('div', { class: 'pl-readout' }, pE));
      function upd() { var eq = P3.planeEq(pts[0].p, pts[1].p, pts[2].p); if (eq) { pE.textContent = '平面 ABC：' + P3.eqStr(eq) + '（只有這一個）'; pE.className = 'pl-pill is-green'; } else { pE.textContent = 'A、B、C 在同一條直線上：過它們的平面有無限多個，決定不了平面'; pE.className = 'pl-pill is-pink'; } return eq; }
      var oldRebuild = S.rebuild; S.rebuild = function () { oldRebuild(); var eq = upd(); if (gate.on) return; if (!eq) seenC = true; else { var k = pts[2].p.join(); if (!seen[k]) { seen[k] = 1; n++; } } if (seenC && n >= 3 && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：共線決定不了平面'); st.append(P.ruleBox('<b>不在同一直線上</b>的三點，決定<b>唯一</b>一個平面（公理）。三點共線時，過它們的平面有無限多個，就像一條直線；所以條件是「不共線」。', '三點決定一個平面')); api.unlock('不共線的三點才決定唯一的平面'); } };
      S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(2, [1, 2, 1]); S.moveTo(2, [-1, 3, 0]); S.moveTo(2, [0, 1, 2]); S.moveTo(2, [0, 1, 0]); }, false, '不行：三點共線時，有無限多個平面，決定不了平面');
      st.append(P.hint('把 C 拖到不同的地方；再把它拖到 A、B 的連線上看看（高度要和 A、B 一樣）。')); api.lock('先做上面的預測');
    },
    /* 3. 第四點共面 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, pts = [ptAt('A', [-2, 0, -1], COL.blue, { fixed: true }), ptAt('B', [2, 0, 0], COL.blue, { fixed: true }), ptAt('C', [0, 2, 1], COL.blue, { fixed: true }), ptAt('D', [1, 3, 0], COL.pink)], pD = P.pill('', 'is-pink'), pE = P.pill('', 'is-green'); [pD, pE].forEach(function (p) { p.style.whiteSpace = 'normal'; });
      P.choice(st, api, { id: 'tp-p3', predict: true, label: '先猜猜看', prompt: '空間中的<b>任意四個點</b>，一定在同一個平面上嗎？', row: true, options: [{ ok: true, t: '不一定' }, { t: '一定' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動點 D'); } });
      st.append(P.instr('A、B、C 固定，決定了藍色平面。拖動<b>點 D</b>（兩種移動方式都試試），看它什麼時候剛好落在平面上。'));
      var S = planeStage(st, { pts: pts, also: true, gate: function () { return gate.on; } });
      st.append(h('div', { class: 'pl-readout' }, pE), h('div', { class: 'pl-readout' }, pD));
      var old = S.rebuild; S.rebuild = function () { old(); var eq = P3.planeEq(pts[0].p, pts[1].p, pts[2].p), s = sideOf(eq, pts[3].p), on = s === 0; pE.textContent = '平面 ABC：' + P3.eqStr(eq); pD.textContent = on ? 'D ' + sv(pts[3].p) + ' 代入左邊 ＝ ' + eq.d + '：D 在平面上，A、B、C、D 四點共面 ✓' : 'D ' + sv(pts[3].p) + ' 代入左邊 ＝ ' + (s + eq.d) + ' ≠ ' + eq.d + '：D 不在平面上，四點不共面'; pD.className = 'pl-pill ' + (on ? 'is-ok' : 'is-pink'); if (gate.on) return; var k = pts[3].p.join(); if (on && !seen[k]) { seen[k] = 1; n++; } if (n >= 2 && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：四點不一定共面'); st.append(P.ruleBox('A、B、C 決定一個平面，<b>第四個點 D</b>要<b>剛好落在這個平面上</b>，四點才共面：D 的座標代入平面方程式要成立。<br>所以空間中的四個點<b>不一定共面</b>（像四面體的四個頂點）。', '共面')); api.unlock('四點不一定共面'); } };
      S.rebuild();
      api.solve(function () { gate.on = false; S.moveTo(3, [3, 1, 1]); S.moveTo(3, [-1, 1, 0]); S.moveTo(3, [1, 3, 2]); }, false, '不一定：D 要剛好在平面 x ＋ 3y − 4z ＝ 2 上，四點才共面');
      st.append(P.hint('D 的高度改變，要配合橫向位置才會剛好在平面上。看「代入左邊」的數字。')); api.lock('先做上面的預測');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var fin = false, pE = P.pill('', 'is-green'), pD = P.pill('', 'is-pink'); [pE, pD].forEach(function (p) { p.style.whiteSpace = 'normal'; });
          var pts = cfg.pts.map(function (q, i) { return ptAt(q[0], q[1], q[2] === 'move' ? COL.pink : COL.blue, { fixed: q[2] !== 'move' }); });
          var S = planeStage(b0, { pts: pts, also: cfg.also, onEnd: function (pt, i, S2) { if (cfg.ok(pts) && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '找到了')); done(); } } });
          b0.append(h('div', { class: 'pl-readout' }, pE), h('div', { class: 'pl-readout' }, pD));
          var old = S.rebuild; S.rebuild = function () { old(); var eq = P3.planeEq(pts[0].p, pts[1].p, pts[2].p); if (!eq) { pE.textContent = 'A、B、C 共線：不能決定平面'; pE.className = 'pl-pill is-pink'; } else { pE.textContent = '平面 ABC：' + P3.eqStr(eq); pE.className = 'pl-pill is-green'; } if (pts[3]) { if (eq) { var s = sideOf(eq, pts[3].p); pD.textContent = 'D 代入左邊 ＝ ' + (s + eq.d) + (s === 0 ? '（＝ ' + eq.d + '，在平面上 ✓）' : '（不等於 ' + eq.d + '）'); pD.className = 'pl-pill ' + (s === 0 ? 'is-ok' : 'is-pink'); } else pD.textContent = ''; } else pD.textContent = '點 C ' + sv(pts[2].p); }; S.rebuild();
          setSolve(function () { cfg.ans.forEach(function (a) { S.moveTo(a[0], a[1]); }); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      var P4 = [['A', [-2, 0, -1]], ['B', [2, 0, 0]], ['C', [0, 2, 1]]];
      var tasks = [
        task({ prompt: 'A、B、C 固定。把<b>點 D</b> 拖到它們決定的<b>平面上</b>（D 不能和 A、B、C 重合）。', pts: P4.map(function (q) { return [q[0], q[1], 'fix']; }).concat([['D', [1, 3, 0], 'move']]), also: true, ok: function (p) { var eq = P3.planeEq(p[0].p, p[1].p, p[2].p); return sideOf(eq, p[3].p) === 0 && !p.slice(0, 3).some(function (q) { return q.p.join() === p[3].p.join(); }); }, ans: [[3, [3, 1, 1]]], answer: 'D ＝ (3, 1, 1)（平面 x ＋ 3y − 4z ＝ 2；(−1, 1, 0) 也可以）', msg: 'D 在平面 ABC 上：四點共面', rule: '平面 ABC 是 x ＋ 3y − 4z ＝ 2。D(3, 1, 1)：3 ＋ 3 − 4 ＝ 2 ✓，所以 D 在平面上，四點共面。', hint: '用「代入左邊」那一列：要等於平面方程式右邊的數字。' }),
        task({ prompt: 'A、B 固定。拖動<b>點 C</b>，讓 A、B、C <b>三點共線</b>（這時決定不了平面）。', pts: [['A', [-2, 1, -1], 'fix'], ['B', [0, 2, 0], 'fix'], ['C', [1, 1, 2], 'move']], ok: function (p) { return collinear(p[0].p, p[1].p, p[2].p); }, ans: [[2, [2, 3, 1]]], answer: 'C ＝ (2, 3, 1)（A、B、C 在同一條直線上，B 是 A、C 的中點）', msg: 'A、B、C 共線：決定不了平面', rule: 'A(−2, 1, −1) 到 B(0, 2, 0) 是 (2, 1, 1)，再走一次 (2, 1, 1) 就是 C(2, 3, 1)。三點共線，平面就不唯一了。', hint: '從 A 走到 B 的「方向」是 (2, 1, 1)，再從 B 照同樣方向走一次。' }),
        task({ prompt: 'A、B、C 固定。拖動<b>點 D</b>，讓 D 在平面 ABC 上，而且 <b>D 的高度是 3</b>。', pts: P4.map(function (q) { return [q[0], q[1], 'fix']; }).concat([['D', [1, 1, 0], 'move']]), also: true, ok: function (p) { var eq = P3.planeEq(p[0].p, p[1].p, p[2].p); return sideOf(eq, p[3].p) === 0 && p[3].p[1] === 3; }, ans: [[3, [1, 3, 2]]], answer: 'D ＝ (1, 3, 2) 或 (−3, 3, 1)（平面 x ＋ 3y − 4z ＝ 2，y ＝ 3 時 x − 4z ＝ −7）', msg: 'D 在平面上，高度 3', rule: '高度 y ＝ 3 代入 x ＋ 3y − 4z ＝ 2，得 x − 4z ＝ −7：(1, 3, 2)（1 − 8 ＝ −7 ✓）或 (−3, 3, 1)（−3 − 4 ＝ −7 ✓）。', hint: '高度 3 代進方程式，剩下 x 與 z 的關係。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-three-points' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-three-points', moduleName: '空間（一）：三個點決定一個平面', askAbout: '平面的基本性質（三點定平面）',
        aha: '<b>過一條直線的平面有無限多個</b>；<b>不共線的三點</b>才決定<b>唯一</b>的平面；第四個點<b>不一定</b>在這個平面上。',
        cards: [{ text: '公理：不在同一直線上的三點，決定唯一一個平面', src: '高中：空間中的直線與平面' }, { text: '推論：一條直線與直線外一點、兩條相交直線、兩條平行直線，也各決定一個平面', src: '平面的基本性質' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '平面方程式 ax＋by＋cz＝d<br>法向量' }, { at: 0.85, label: '四點共面的行列式條件' }] },
        teasers: [{ title: '四點共面', q: '四個點 A、B、C、D 共面，向量 AB、AC、AD 之間有什麼關係？', where: 'S111 2507 第 25 堂（CH1 空間向量 02）', lv: 'L2' }],
        parent: { pitfall: '孩子常以為兩個點（一條直線）就能決定平面；也常忘了「不共線」這個條件；以為任意四點都共面。', place: '空間單元的第一步，後面的直線與平面關係都從這裡出發。', ask: ['過一條直線的平面有幾個？', '三點在同一條直線上，能決定平面嗎？', '空間中的四個點一定共面嗎？'] },
        classes: ['S111 2507 第 25 堂（2026 年 1 月）：CH1 空間向量 02（共面）', 'S112 2601 第 5 堂（2026 年 3 月）：CH2 空間中平面直線 01（平面方程式）'], next: { href: 'play-space-plane-axioms.html', text: '下一個：兩個平面相交成一條直線' } });
    }];
  new P.Lesson({ id: 'space-three-points', title: '空間（一）：三個點決定一個平面', steps: steps });
})();
