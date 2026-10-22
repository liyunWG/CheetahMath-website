/* 獵豹玩中學｜角平分線（格點版：所有點都吸附在格點上，判斷用精確整數運算） */
(function () {
  var P = Play, h = P.h;
  var O = [1, 1], A = [11, 1], B = [7, 9];                 // 兩邊：OA 沿 x 軸，OB 方向 (3,4)；長度相等 → 平分線方向 (2,1)
  var U1 = [1, 0], U2 = [0.6, 0.8], UB = [2 / Math.sqrt(5), 1 / Math.sqrt(5)], VB = [-1 / Math.sqrt(5), 2 / Math.sqrt(5)];
  var rad = Math.PI / 180;
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function len(a) { return Math.hypot(a[0], a[1]); }
  function foot(Pt, Q, u) { return add(Q, mul(u, dot(sub(Pt, Q), u))); }
  function distLine(Pt, Q, u) { return Math.abs((Pt[0] - Q[0]) * u[1] - (Pt[1] - Q[1]) * u[0]); }
  function inAngle(p) { var dx = p[0] - O[0], dy = p[1] - O[1]; return dy > 0 && 4 * dx - 3 * dy > 0; }
  function angOf(v) { return Math.atan2(v[1], v[0]) / rad; }
  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function rayToEdge(board, dir) { var t = 1e9; if (dir[0] > 0) t = Math.min(t, (board.w - O[0]) / dir[0]); if (dir[1] > 0) t = Math.min(t, (board.hh - O[1]) / dir[1]); return add(O, mul(dir, t)); }
  function arcPts(r, a0, a1) { var pts = [O]; for (var i = 0; i <= 24; i++) { var a = (a0 + (a1 - a0) * i / 24) * rad; pts.push([O[0] + r * Math.cos(a), O[1] + r * Math.sin(a)]); } return pts; }
  function latticeInside() { var c = []; for (var x = 0; x <= 12; x++) for (var y = 0; y <= 10; y++) if (inAngle([x, y])) c.push([x, y]); return c; }
  function baseArms(board) {
    board.line(O, [12, 1], 'pl-line'); board.line(O, rayToEdge(board, [0.6, 0.8]), 'pl-line');
    board.dot(O, 'pl-dot'); board.text([O[0] - 0.55, O[1] - 0.55], 'O', 'pl-text');
  }
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }

  var steps = [
    /* 1. 動手：平分這個角 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '角平分線'), P.instr('拖動綠點，把這個角<b>剛好平分</b>成兩個一樣大的角。'));
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); P.snapSwitch(board, host);
      baseArms(board);
      var w1 = board.poly([O, O, O], 'pl-poly'), w2 = board.poly([O, O, O], 'pl-poly pl-poly--pink');
      var mid = board.line(O, O, 'pl-line pl-line--green'); var l1 = board.text([0, 0], '', 'pl-text pl-text--blue pl-text--lg'), l2 = board.text([0, 0], '', 'pl-text pl-text--pink pl-text--lg');
      var pillA = P.pill('', 'is-blue'), pillB = P.pill('', 'is-pink'), lamp = P.pill('', ''); var ro = h('div', { class: 'pl-readout' }, pillA, pillB, lamp);
      var done = false, cand = latticeInside();
      function draw(t) {
        var v = sub(t, O), a = angOf(v), a2deg = angOf([3, 4]);
        board.setLine(mid, O, rayToEdge(board, mul(v, 1 / len(v))));
        board.setPoly(w1, arcPts(2.6, 0, a)); board.setPoly(w2, arcPts(2.6, a, a2deg));
        board.setText(l1, [O[0] + 4.6 * Math.cos(a / 2 * rad), O[1] + 4.6 * Math.sin(a / 2 * rad) - 0.2], fmt(a) + '°');
        board.setText(l2, [O[0] + 4.6 * Math.cos((a + a2deg) / 2 * rad) - 0.4, O[1] + 4.6 * Math.sin((a + a2deg) / 2 * rad) + 0.1], fmt(a2deg - a) + '°');
        pillA.textContent = '下面的角 ' + fmt(a) + '°'; pillB.textContent = '上面的角 ' + fmt(a2deg - a) + '°';
        var ok = board.snapOn ? (v[0] === 2 * v[1]) : Math.abs(a - (a2deg - a)) < 1.2;
        lamp.className = 'pl-pill' + (ok ? ' is-ok' : ''); lamp.textContent = ok ? '✓ 兩個角一樣大' : '還不一樣大';
        return ok;
      }
      var hd = board.handle({ pos: [8, 3], candidates: function () { return board.snapOn ? cand : null; }, valid: inAngle,
        onMove: function (t) { var ok = draw(t); if (ok && !done) { done = true; if (!board.snapOn) hd.set([O[0] + 4, O[1] + 2]); P.track('aha', { id: 'angle-bisector', step: 1 }); st.append(P.ruleBox('把一個角分成<b>兩個相等的角</b>的射線，叫做<b>角平分線</b>。', '名稱')); api.unlock('這條線叫「角平分線」'); } } });
      draw([8, 3]); api.solve(function () { hd.moveTo([5, 3]); });
      st.append(ro, P.hint('提示：剛好平分的點，每往右 2 格就要往上 1 格。也可以關掉吸附自由拖。'));
      api.lock('先把角平分');
    },
    /* 2. 預測＋沿平分線拖動 P */
    function (st, api) {
      var gate = { on: true };
      P.choice(st, api, { id: 'ab-p2', predict: true, label: '先猜猜看', prompt: '在角平分線上放一點 P。它到<b>兩邊的距離</b>會…？', options: [{ t: '離上面那條邊比較近' }, { t: '離下面那條邊比較近' }, { t: '一樣遠' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('沿平分線拖動 P'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); P.snapSwitch(board, host);
      baseArms(board);
      var bis = []; for (var k = 1; k <= 5; k++) bis.push([1 + 2 * k, 1 + k]);
      board.line(O, rayToEdge(board, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]), 'pl-line pl-line--green'); bis.forEach(function (b) { board.dot(b, 'pl-dot pl-dot--green', null, 0.13); });
      var g = h('g'); board.gMid.append(g); var seen = {}, count = 0, pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'); var ro = h('div', { class: 'pl-readout' }, pa, pb);
      function draw(p) {
        g.innerHTML = ''; var f1 = [p[0], 1], f2 = foot(p, O, U2);
        var d1 = distLine(p, O, U1), d2 = distLine(p, O, U2);
        g.append(h('line', { x1: p[0], y1: board.Y(p[1]), x2: f1[0], y2: board.Y(f1[1]), class: 'pl-line pl-line--blue pl-line--dash' }), h('line', { x1: p[0], y1: board.Y(p[1]), x2: f2[0], y2: board.Y(f2[1]), class: 'pl-line pl-line--pink pl-line--dash' }));
        board.rightMark(f1, [-1, 0], [0, 1], 0.4, g); var nv = mul(sub(p, f2), 1 / len(sub(p, f2))); board.rightMark(f2, mul(U2, -1), nv, 0.4, g);
        pa.textContent = '到下邊 ' + fmt(d1); pb.textContent = '到上邊 ' + fmt(d2);
      }
      var hd = board.handle({ pos: bis[2], candidates: bis, disabled: function () { return gate.on; }, onMove: function (t) { draw(t); var key = t.join(','); if (!seen[key]) { seen[key] = 1; count++; } if (count >= 3 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'angle-bisector', step: 2 }); st.append(P.ruleBox('角平分線上的<b>每一點</b>，到角的<b>兩邊一樣遠</b>。', '性質')); P.toast(api.ctx.p2 === 2 ? '你猜對了！' : '兩個距離永遠一樣'); api.unlock('發現規律了！'); } } });
      api.solve(function () { gate.on = false; [bis[0], bis[1], bis[3]].forEach(hd.moveTo); });
      draw(bis[2]); st.append(ro, P.hint('虛線＝距離（從 P 垂直走到邊）；平分線上的格點距離剛好是整數。'));
      api.lock('先做上面的預測');
    },
    /* 3. 反過來：到兩邊一樣遠的點在哪？ */
    function (st, api) {
      st.append(P.instr('反過來想：<b>到兩邊一樣遠</b>的格點在哪裡？<br>每次距離相等就會留下綠點。'));
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); P.snapSwitch(board, host);
      baseArms(board); var trail = h('g'), g = h('g'); board.gMid.append(trail, g); var cand = latticeInside(), found = {}, n = 0, done = false;
      var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pc = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pa, pb, pc);
      function draw(p) {
        g.innerHTML = ''; var f1 = [p[0], 1], f2 = foot(p, O, U2), d1 = distLine(p, O, U1), d2 = distLine(p, O, U2);
        g.append(h('line', { x1: p[0], y1: board.Y(p[1]), x2: f1[0], y2: board.Y(f1[1]), class: 'pl-line pl-line--blue pl-line--dash' }), h('line', { x1: p[0], y1: board.Y(p[1]), x2: f2[0], y2: board.Y(f2[1]), class: 'pl-line pl-line--pink pl-line--dash' }));
        board.rightMark(f1, [-1, 0], [0, 1], 0.4, g); var nv3 = sub(p, f2), L3 = len(nv3); if (L3 > 0.01) board.rightMark(f2, mul(U2, -1), mul(nv3, 1 / L3), 0.4, g);
        pa.textContent = fmt(d1); pb.textContent = fmt(d2);
        var ok = board.snapOn ? (p[0] - 1 === 2 * (p[1] - 1)) : Math.abs(d1 - d2) < 0.22; pc.className = 'pl-pill' + (ok ? ' is-ok' : ''); pc.textContent = ok ? '✓ 一樣遠' : '不一樣遠';
        if (ok) { var key = (board.snapOn ? p.join(',') : Math.round(p[0] * 2) + ',' + Math.round(p[1] * 2)); if (!found[key]) { found[key] = 1; n++; trail.append(h('circle', { cx: p[0], cy: board.Y(p[1]), r: 0.2, class: 'pl-dot pl-dot--green' })); pop2(trail.lastChild); reveal(); } }
      }
      function pop2(el) { el.style.transformOrigin = 'center'; el.style.transformBox = 'fill-box'; P.pop(el); }
      function reveal() { if (n >= 4 && !done) { done = true; var e = rayToEdge(board, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]); board.line(O, e, 'pl-line pl-line--green pl-line--dash', trail); P.track('aha', { id: 'angle-bisector', step: 3 }); st.append(P.ruleBox('到角兩邊<b>一樣遠</b>的點，<b>全都在角平分線上</b>。<br>角平分線＝「到兩邊等距的點」排成的線。', '性質')); api.unlock('綠點排成了角平分線！'); } }
      var hd = board.handle({ pos: [5, 5], candidates: function () { return board.snapOn ? cand : null; }, valid: inAngle, onMove: function (t) { draw(t); } });
      api.solve(function () { [[3, 2], [5, 3], [7, 4], [9, 5]].forEach(hd.moveTo); });
      draw([5, 5]); st.append(ro, P.hint('目標：找到 4 個「一樣遠」的格點，看看它們排成什麼。')); api.lock('找出 4 個綠點');
    },
    /* 4. 為什麼？摺紙 */
    function (st, api) {
      st.append(P.instr('沿著角平分線<b>摺</b>起來看看。拖動滑桿。'));
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); P.snapSwitch(board, host).style.display = 'none';
      var Pt = [7, 4], F1 = [7, 1], L = 10.5, sFar = [O[0] + L, 1], pinkEnd = add(O, mul(U2, L));
      var g = h('g'); board.gMid.append(g); var done = false, note = h('div', { class: 'pl-fb' });
      function fold(X, c) { var r = sub(X, O), a = dot(r, UB), b = dot(r, VB); return add(O, add(mul(UB, a), mul(VB, b * c))); }
      var bisEnd = add(O, mul(UB, L));
      function draw(s) {
        g.innerHTML = ''; var c = Math.cos(Math.PI * s); var armEnd = fold(sFar, c), F1f = fold(F1, c);
        g.append(h('polygon', { points: board.pts([O, armEnd, fold(bisEnd, c)]), class: 'pl-poly' }), h('polygon', { points: board.pts([O, bisEnd, pinkEnd]), class: 'pl-poly pl-poly--pink' }));
        board.line(O, bisEnd, 'pl-line pl-line--green pl-line--dash', g); board.line(O, armEnd, 'pl-line pl-line--blue', g); board.line(O, pinkEnd, 'pl-line pl-line--pink', g);
        var f2 = foot(Pt, O, U2); board.line(Pt, f2, 'pl-line pl-line--pink pl-line--dash', g); board.line(Pt, F1f, 'pl-line pl-line--blue pl-line--dash', g);
        var nv4 = mul(sub(Pt, f2), 1 / len(sub(Pt, f2))); board.rightMark(f2, mul(U2, -1), nv4, 0.4, g);
        var fv = function (v) { var a = dot(v, UB), b2 = dot(v, VB); return add(mul(UB, a), mul(VB, b2 * c)); }; board.rightMark(F1f, fv([-1, 0]), fv([0, 1]), 0.4, g); board.dot(Pt, 'pl-dot', g); board.text([Pt[0] + 0.5, Pt[1] + 0.5], 'P', 'pl-text', g);
        if (s >= 0.97 && !done) { done = true; note.className = 'pl-fb is-good'; note.innerHTML = '兩條邊<b>完全重疊</b>，兩條垂直線段也完全重疊，長度一樣。'; P.track('aha', { id: 'angle-bisector', step: 4 }); st.append(P.ruleBox('角平分線是這個角的<b>對稱軸</b>：沿它摺起來，兩邊完全重疊，所以到兩邊的距離一定相等。', '原因')); api.unlock('看懂原因了！'); }
      }
      var sl = P.slider(0, 100, 0, function (v) { draw(v / 100); }); api.solve(function () { sl.value = 100; draw(1); });
      draw(0); st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 攤開'), h('span', {}, '摺起來 →')), note); api.lock('把滑桿拉到最右邊');
    },
    /* 5. 用用看：三條路的消防站（內心） */
    function (st, api) {
      st.append(P.instr('三條路圍出一個三角形。把消防站 P 放在<b>到三條路一樣遠</b>的格點。'));
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); P.snapSwitch(board, host);
      var V = [[1, 1], [9, 1], [1, 7]]; board.poly(V, 'pl-poly pl-poly--amber');
      var names = ['A', 'B', 'C'], offs = [[-0.5, -0.6], [0.5, -0.6], [-0.5, 0.5]]; V.forEach(function (v, i) { board.dot(v, 'pl-dot'); board.text([v[0] + offs[i][0], v[1] + offs[i][1]], names[i], 'pl-text'); });
      var g = h('g'), extra = h('g'); board.gMid.append(extra, g); var done = false;
      var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', 'is-amber'), pc = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, p1, p2, p3, pc);
      function inside(p) { return p[1] > 1 && p[0] > 1 && 3 * p[0] + 4 * p[1] < 31; }
      var cand = []; for (var x = 0; x <= 12; x++) for (var y = 0; y <= 10; y++) if (inside([x, y])) cand.push([x, y]);
      function dists(p) { return [p[1] - 1, p[0] - 1, (31 - 3 * p[0] - 4 * p[1]) / 5]; }
      function draw(p) {
        g.innerHTML = ''; var d = dists(p), fs = [[p[0], 1], [1, p[1]], null]; var f3 = foot(p, [9, 1], [-0.8, 0.6]); fs[2] = f3; var cl = ['blue', 'pink', 'amber'];
        fs.forEach(function (f, i) { g.append(h('line', { x1: p[0], y1: board.Y(p[1]), x2: f[0], y2: board.Y(f[1]), class: 'pl-line pl-line--' + cl[i] + ' pl-line--dash' })); });
        var sd = [[1, 0], [0, 1], [-0.8, 0.6]]; fs.forEach(function (f, i) { var v = sub(p, f), L = len(v); if (L > 0.45) board.rightMark(f, sd[i], mul(v, 1 / L), 0.38, g); });
        p1.textContent = '到下邊 ' + fmt(d[0]); p2.textContent = '到左邊 ' + fmt(d[1]); p3.textContent = '到斜邊 ' + fmt(d[2]);
        var ok = board.snapOn ? (5 * d[0] === 5 * d[1] && 5 * d[1] === 5 * d[2]) : (Math.max.apply(null, d) - Math.min.apply(null, d) < 0.25);
        pc.className = 'pl-pill' + (ok ? ' is-ok' : ''); pc.textContent = ok ? '✓ 三個一樣遠' : '還不一樣遠'; return ok;
      }
      var hd = board.handle({ pos: [4, 2], candidates: function () { return board.snapOn ? cand : null; }, valid: inside, onMove: function (t) { var ok = draw(t); if (ok && !done) { done = true; var I = [3, 3]; if (!board.snapOn) { hd.set(I); draw(I); } board.circle(I, 2, 'pl-circle', extra, { class: 'pl-circle', style: 'stroke:#1f9d55;stroke-width:3;fill:rgba(31,157,85,.14)' }); V.forEach(function (v) { board.line(v, I, 'pl-line pl-line--green pl-line--dash', extra); }); P.track('aha', { id: 'angle-bisector', step: 5 }); st.append(P.ruleBox('三個角的角平分線<b>交在同一點</b>——<b>內心</b>。它到三邊一樣遠，所以能畫出<b>內切圓</b>。', '性質')); api.unlock('找到內心了！'); } } });
      api.solve(function () { hd.moveTo([3, 3]); });
      draw([4, 2]); st.append(ro, P.hint('提示：到下邊和左邊一樣遠的格點，在左下角的 45° 線上。')); api.lock('找到到三邊等距的格點');
    },
    /* 6 換個外觀（每一題都有圖） */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function fig() { var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); baseArms(b); return b; }
      function feet(b, p, g) {
        var f1 = [p[0], 1], f2 = foot(p, O, U2), nv = mul(sub(p, f2), 1 / len(sub(p, f2)));
        b.line(p, f1, 'pl-line pl-line--blue pl-line--dash', g); b.line(p, f2, 'pl-line pl-line--pink pl-line--dash', g);
        b.rightMark(f1, [-1, 0], [0, 1], 0.4, g); b.rightMark(f2, mul(U2, -1), nv, 0.4, g); return [f1, f2];
      }
      function mid(a, c, dx, dy) { return [(a[0] + c[0]) / 2 + dx, (a[1] + c[1]) / 2 + dy]; }
      var qs = [
        function () {
          box.innerHTML = ''; var b = fig(), g = h('g'); b.gMid.append(g); var cand = latticeInside();
          var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), lamp = P.pill('', ''), pf = P.pill('已找到 0 個一樣遠的點', 'is-amber'); var ro = h('div', { class: 'pl-readout' }, pa, pb, lamp), found = {}, nf = 0, bisLine = null; box.append(ro, h('div', { class: 'pl-readout' }, pf));
          function draw(p) { g.innerHTML = ''; feet(b, p, g); b.dot(p, 'pl-dot', g, 0.14); b.text([p[0] + 0.5, p[1] + 0.55], 'P', 'pl-text', g); pa.textContent = '到下邊 ' + fmt(distLine(p, O, U1)); pb.textContent = '到上邊 ' + fmt(distLine(p, O, U2)); var ok = p[0] - 1 === 2 * (p[1] - 1); lamp.className = 'pl-pill' + (ok ? ' is-ok' : ''); lamp.textContent = ok ? '✓ 一樣遠' : '不一樣遠'; return ok; }
          /* 找到一樣遠的點就留下綠點（不會因為拖開而消失）；找到 3 個以上，把它們連成的角平分線畫出來 */
          b.handle({ pos: [8, 3], candidates: cand, valid: inAngle, onMove: function (t) { if (draw(t)) { var k = t.join(','); if (!found[k]) { found[k] = 1; nf++; b.goalMark(t); pf.textContent = '已找到 ' + nf + ' 個一樣遠的點'; pf.className = 'pl-pill is-ok'; } if (nf >= 3 && !bisLine) { bisLine = b.line(O, rayToEdge(b, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]), 'pl-line pl-line--green pl-line--dash', b.gMark); P.toast('這些點排成一條線：就是角平分線！'); } } } }); draw([8, 3]);
          P.choice(box, { unlock: next }, { id: 'ab-t1', label: '第 1 / 4 題', prompt: '點 P 到角的兩邊<b>一樣遠</b>（拖動 P 找找看）。P 一定在哪裡？', options: [{ t: '這個角的角平分線上', ok: true, fb: '對！到兩邊等距，就在角平分線上。' }, { t: '角的其中一邊上', fb: '在邊上的點到那一邊的距離是 0，不可能和另一邊一樣遠（頂點除外）。' }, { t: '離頂點最近的位置', fb: '一樣遠和離頂點多遠無關。' }], onAnswer: function () { next(); } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 4 題')); var b = fig(), p = [11, 6];
          b.line(O, rayToEdge(b, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]), 'pl-line pl-line--green pl-line--dash'); var fs = feet(b, p); b.dot(p, 'pl-dot', null, 0.16); b.text([p[0] + 0.45, p[1] + 0.6], 'P', 'pl-text');
          var m1 = mid(p, fs[0], 0.6, 0), m2 = mid(p, fs[1], 0.5, 0.5); b.text(m1, '5', 'pl-text pl-text--blue pl-text--lg'); b.text(m2, '？', 'pl-text pl-text--pink pl-text--lg');
          box.append(h('div', { class: 'pl-q', html: 'P 在 ∠AOB 的<b>角平分線</b>（綠色虛線）上，P 到邊 OA 的距離是 <b>5</b>。P 到邊 OB 的距離是？' }));
          P.numBox(box, { answer: 5, okMsg: '對！平分線上的點到兩邊等距。', onOk: next, wrong: function (v) { return v === 10 ? '距離不是加起來，而是一樣長喔。' : '回想：平分線上的點，兩個距離怎麼樣？'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 4 題')); var b = fig(), p = [9, 5];
          b.line(O, rayToEdge(b, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]), 'pl-line pl-line--green pl-line--dash'); var fs = feet(b, p); b.dot(p, 'pl-dot', null, 0.16); b.text([p[0] + 0.45, p[1] + 0.6], 'P', 'pl-text');
          b.text(mid(p, fs[0], 1.1, 0), 'x + 1', 'pl-text pl-text--blue pl-text--lg'); b.text(mid(p, fs[1], 0.3, 0.8), '2x − 2', 'pl-text pl-text--pink pl-text--lg');
          box.append(h('div', { class: 'pl-q', html: 'P 在<b>角平分線</b>上。P 到一邊的距離是 <b>x + 1</b>，到另一邊是 <b>2x − 2</b>。x 是多少？' }));
          P.numBox(box, { answer: 3, okMsg: '對！x + 1 = 2x − 2，所以 x = 3（兩個距離都是 4）。', onOk: next, wrong: function () { return '提示：兩個距離「相等」，列出 x + 1 = 2x − 2。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 4 / 4 題'));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); var b = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' });
          var V = [[1, 1], [9, 1], [1, 7]]; b.poly(V, 'pl-poly pl-poly--amber'); V.forEach(function (v, i) { b.dot(v, 'pl-dot', null, 0.12); b.text([v[0] + [-0.5, 0.5, -0.5][i], v[1] + [-0.6, -0.6, 0.5][i]], ['A', 'B', 'C'][i], 'pl-text'); });
          [[[3, 3], '甲'], [[5, 4], '乙'], [[2, 2], '丙']].forEach(function (q) { b.dot(q[0], 'pl-dot pl-dot--pink', null, 0.2); b.text([q[0][0] + 0.55, q[0][1] + 0.6], q[1], 'pl-text pl-text--pink'); });
          P.choice(box, {}, { id: 'ab-t4', prompt: '三條路圍成三角形，消防站要到<b>三條路一樣遠</b>，蓋在哪一點？', row: true, options: [{ t: '甲', ok: true, fb: '對！甲是三個角的角平分線的交點（內心），到三邊都是 2。' }, { t: '乙', fb: '乙是斜邊的中點，到三個「頂點」一樣遠，不是到三條邊。' }, { t: '丙', fb: '丙只到下邊、左邊一樣遠，離斜邊比較近。' }], onAnswer: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'angle-bisector' }); } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 4 題');
    },
    /* 7. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'angle-bisector', moduleName: '角平分線', askAbout: '國八、國九幾何', aha: '角平分線上的點，<br>到角的兩邊一樣遠；反過來也成立。',
        cards: [{ text: '平分線上的點到角的兩邊等距；到兩邊等距的點在平分線上', src: '國二「三角形的基本性質：中垂線與角平分線」（獵豹 J82S／J81S）' }, { text: '三條角平分線交於一點＝內心（到三邊等距）', src: '國三「三角形的心」（獵豹 J91A）' }],
        depth: { here: 0.17, cheetah: [{ at: 0.42, label: '角平分線定理<br>內心與面積' }, { at: 0.86, label: 'PK4B<br>塞瓦、梅涅勞斯' }] },
        teasers: [
          { title: '角平分線定理', q: '角平分線把對邊分成兩段，比等於什麼？BD : DC ＝ ？', where: 'J82S CH7（2601 第 4 堂）、J81S CH7（2507 第 25 堂）', lv: 'L2' },
          { title: '內心與面積', q: '三角形面積 ＝ 內切圓半徑 × 周長 ÷ 2，為什麼？怎麼用它秒解題？', where: 'J91A 三角形的四心（2507 第 10–13 堂；2607 第 12–16 堂）', lv: 'L2' },
          { title: '尺規作圖：作角平分線', q: '只用圓規和直尺，怎麼作出角平分線？為什麼一定對？', where: 'J82A 2601 加課 3（CH3 尺規）', lv: 'L2' },
          { title: '塞瓦定理', q: '三條線交於一點的比例條件是什麼？（超出課綱，競賽常考）', where: 'PK4B 塞瓦定理（2512 第 23 堂）、J91A 2607 第 5 堂', lv: 'L3' }],
        parent: { pitfall: '孩子往往只會背「角平分線把角分成兩半」，卻不知道它最重要的用途：<b>平分線上的點到兩邊等距</b>；也容易把角平分線、中線、高搞混。', place: '國二「三角形的基本性質」與國三「三角形的心」的基礎，也是會考與 AMC 幾何常用的性質。', ask: ['角平分線上的點，到角的兩邊為什麼一樣遠？', '如果一個點到兩邊一樣遠，它會在哪裡？', '三條路圍成的三角形，要蓋一個到三條路一樣遠的公園，要放在哪？'] },
        classes: ['J82S（2601 第 4、21 堂）：CH7 三角形的基本性質、CH11 幾何證明與三心', 'J81S（2507 第 25 堂）：CH7 三角形的基本性質', 'J91A（2507 第 10–13 堂；2607 第 12–16 堂）：三角形的四心', 'J82A（2601 加課 3）：CH3 尺規'],
        next: { href: 'play-transformations.html', text: '下一個：幾何變換' } });
    }];
  new P.Lesson({ id: 'angle-bisector', title: '角平分線', steps: steps });
})();
