/* 獵豹玩中學｜立體變換：繞軸旋轉、旋轉的順序、鏡射與左右手、正方體的旋轉軸 */
(function () {
  var P = Play, h = P.h, D = Play3D, V3 = PS.v;
  var CC = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f'];
  var MX = [[1, 0, 0], [0, 0, -1], [0, 1, 0]], MY = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], MZ = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
  var MS = [MX, MY, MZ], AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], ANAME = ['x', 'y', 'z'];
  var I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  function T3(m) { return [[m[0][0], m[1][0], m[2][0]], [m[0][1], m[1][1], m[2][1]], [m[0][2], m[1][2], m[2][2]]]; }
  function mm(a, b) { var r = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) for (var k = 0; k < 3; k++) r[i][j] += a[i][k] * b[k][j]; return r; }
  function mv(m, v) { return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]]; }
  function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function allRots() { var seen = {}, list = [I3], q = [I3]; seen[JSON.stringify(I3)] = 1; while (q.length) { var c = q.shift(); [MX, MY, MZ].forEach(function (g) { var n = mm(g, c), k = JSON.stringify(n); if (!seen[k]) { seen[k] = 1; list.push(n); q.push(n); } }); } return list; }
  var ROTS = allRots();
  /* 積木：格心座標（半整數）。螺旋積木有「左右手」之分；L 形積木有對稱面 */
  var PIECES = {
    spiral: { name: '螺旋積木', c: [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5]] },
    ell: { name: '角落積木', c: [[-.5, -.5, 0], [.5, -.5, 0], [-.5, .5, 0], [-.5, -.5, 1]].map(function (p) { return [p[0], p[1], p[2] - 0.5]; }) }
  };
  function key2(c) { return Math.round(c[0] * 2) + ',' + Math.round(c[1] * 2) + ',' + Math.round(c[2] * 2); }
  function pieceFaces(centers, cols) {
    var set = {}; centers.forEach(function (c) { set[key2(c)] = 1; }); var out = [], dirs = [[0, 0, 1], [0, 0, -1], [-1, 0, 0], [1, 0, 0], [0, 1, 0], [0, -1, 0]];
    centers.forEach(function (c, i) { var fs = D.box(c[0] - .5, c[1] - .5, c[2] - .5, 1, 1, 1, cols[i % cols.length]); dirs.forEach(function (d, k) { if (!set[key2([c[0] + d[0], c[1] + d[1], c[2] + d[2]])]) out.push(fs[k]); }); });
    return out;
  }
  function shapeKey(centers) { var q = centers.map(function (c) { return [Math.round(c[0] * 2), Math.round(c[1] * 2), Math.round(c[2] * 2)]; }), mn = [0, 1, 2].map(function (i) { return Math.min.apply(null, q.map(function (c) { return c[i]; })); }); return q.map(function (c) { return [c[0] - mn[0], c[1] - mn[1], c[2] - mn[2]].join(','); }).sort().join('|'); }
  function sameShape(a, b) { return shapeKey(a) === shapeKey(b); }

  /* 積木＋姿勢＋動畫 */
  function Rig(sc, piece, o) {
    o = o || {}; this.sc = sc; this.piece = piece; this.R = o.R || I3; this.theta = 0; this.axis = null; this.busy = false; this.mirror = !!o.mirror; this.axes = !!o.axes; this.alpha = o.alpha;
    if (this.axes) { this.AS = PS.axisSet(1.7); sc.extraTexts = this.AS.texts; PS.dirDedupe(sc); }   /* 軸與正負方向（+x、−x…）；正對著軸看時只畫近的那個標籤 */
    this.draw();
  }
  Rig.prototype = {
    centers: function () { var R = this.R, m = this.mirror; return this.piece.c.map(function (c) { var p = mv(R, c); return m ? [-p[0], p[1], p[2]] : p; }); },
    draw: function () {
      var sc = this.sc, fs = pieceFaces(this.centers(), CC), th = this.theta, ax = this.axis;
      if (ax && th) fs.forEach(function (f) { f.pts = f.pts.map(function (p) { return D.rotAxis(p, ax, th); }); });
      sc.faces = fs; if (this.alpha !== undefined) fs.forEach(function (f) { f.alpha = this.alpha; }, this);
      if (this.axes) sc.lines = this.AS.lines;
      sc.invalidate();
    },
    /* 繞 axis 轉 sign×90°，完成後呼叫 cb */
    rot: function (a, sign, cb) {
      var self = this; if (this.busy) return false; this.busy = true; this.axis = AX[a]; var M = sign > 0 ? MS[a] : T3(MS[a]);
      var sp = PS.spring(0, { k: 150, zeta: 0.62, onUpdate: function (v) { self.theta = v; self.draw(); }, onRest: function () { self.R = mm(M, self.R); self.theta = 0; self.axis = null; self.busy = false; self.draw(); if (cb) cb(); } });
      sp.to(sign * Math.PI / 2); return true;
    },
    setR: function (R) { this.R = R; this.draw(); }
  };
  function mk(host, o) { o = o || {}; return PS.scene(host, { fitR: o.axes ? 2.25 : 1.8, twoCol: true, hFrac: o.drag === false ? 0.66 : 1, yaw: o.yaw === undefined ? -0.6 : o.yaw, pitch: o.pitch === undefined ? 0.5 : o.pitch, drag: o.drag, center: o.center || [0, 0, 0] }); }
  function holders(st, n) { var row = PS.stage(st), out = []; for (var i = 0; i < n; i++) { var d = h('div', { class: 'ps-col' }); row.append(d); out.push(d); } return { row: row, cols: out }; }
  function capt(col, text) { col.append(h('div', { class: 'ps-cap' }, text)); }
  function seqMoves(rig, moves, done) { var i = 0; (function step() { if (i >= moves.length) { if (done) done(); return; } var m = moves[i++]; rig.rot(m[0], m[1], function () { setTimeout(step, 120); }); })(); }

  var steps = [
    /* 1 繞軸轉 90° */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '繞軸旋轉'), P.instr('讓<b>你的積木</b>轉成和<b>目標</b>一模一樣（顏色位置都要對）。按下面的按鈕，每次繞軸轉 90°。'));
      var H = holders(st, 2), mh = Math.max(130, Math.min(175, window.innerHeight - 560));
      capt(H.cols[0], '目標'); capt(H.cols[1], '你的積木（可拖動轉視角）');
      var s1 = mk(H.cols[0], { drag: false, maxH: mh }), s2 = mk(H.cols[1], { axes: true, maxH: mh });
      var goal = mm(MZ, MX); // 先繞 x 再繞 z（逆時針各 90°）
      var tgt = new Rig(s1, PIECES.spiral, { R: goal, axes: true }), me = new Rig(s2, PIECES.spiral, { axes: true }), moves = 0, done = false;
      var pm = P.pill('已轉 0 次', ''), pk = P.pill('還沒一樣', ''), ro = h('div', { class: 'pl-readout' }, pm, pk);
      function after() { moves++; pm.textContent = '已轉 ' + moves + ' 次'; if (eq(me.R, goal)) { pk.className = 'pl-pill is-ok'; pk.textContent = '✓ 一樣了！'; if (!done) { done = true; P.track('aha', { id: 'solid-transform', step: 1 }); st.append(P.ruleBox('<b>旋轉</b>不會改變積木的形狀和大小，只改變它的<b>朝向</b>。每次繞一根軸轉 90°，轉幾次就能擺成不同的姿勢。', '性質')); api.unlock('轉對了！'); } } else { pk.className = 'pl-pill'; pk.textContent = '還沒一樣'; } }
      function go(a, s) { return function () { if (!me.rot(a, s, after)) return; }; }
      var items = []; [0, 1, 2].forEach(function (a) { items.push({ k: a + '+', t: ANAME[a] + ' 軸 ↺', fn: go(a, 1) }, { k: a + '-', t: ANAME[a] + ' 軸 ↻', fn: go(a, -1) }); });
      var br = PS.btnRow(st, items); br.el.classList.add('ps-btngrid');
      var reset = PS.btnRow(st, [{ t: '重來', fn: function () { if (me.busy) return; me.setR(I3); moves = 0; pm.textContent = '已轉 0 次'; pk.className = 'pl-pill'; pk.textContent = '還沒一樣'; } }]);
      api.solve(function () { me.setR(goal); after(); });
      st.append(ro, P.hint('箭頭指向正方向：紅＝+x、綠＝+y、藍＝+z。↺ 逆時針、↻ 順時針（從軸的箭頭端往原點看）。')); api.lock('把積木轉成目標的樣子');
    },
    /* 2 順序有關 */
    function (st, api) {
      var gate = { on: true }, played = 0;
      P.choice(st, api, { id: 'stf-p2', predict: true, label: '先猜猜看', prompt: '「先繞 x 軸轉 90°、再繞 y 軸轉 90°」和「先 y 再 x」，結果會一樣嗎？', row: true, options: [{ t: '一樣' }, { ok: true, t: '不一樣' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('按「播放」看看'); } });
      var H = holders(st, 2), mh = Math.max(120, Math.min(160, window.innerHeight - 600));
      capt(H.cols[0], '先 x 再 y'); capt(H.cols[1], '先 y 再 x');
      var a = new Rig(mk(H.cols[0], { drag: false, maxH: mh, axes: true }), PIECES.spiral, { axes: true }), b = new Rig(mk(H.cols[1], { drag: false, maxH: mh, axes: true }), PIECES.spiral, { axes: true });
      var pr = P.pill('按「播放」', ''), ro = h('div', { class: 'pl-readout' }, pr);
      var br = PS.btnRow(st, [{ k: 'play', t: '▶ 播放', fn: function (btn) {
        if (gate.on) { P.toast('先做上面的預測'); return; } if (a.busy || b.busy) return; a.setR(I3); b.setR(I3); pr.className = 'pl-pill'; pr.textContent = '播放中…'; var n = 0;
        function fin() { if (++n < 2) return; judge(); }
        seqMoves(a, [[0, 1], [1, 1]], fin); seqMoves(b, [[1, 1], [0, 1]], fin);
      } }]);
      function judge() { var same = eq(a.R, b.R); pr.className = 'pl-pill ' + (same ? 'is-ok' : 'is-pink'); pr.textContent = same ? '結果一樣' : '結果不一樣！'; played++;
        if (!same && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-transform', step: 2 }); st.append(P.ruleBox('旋轉的<b>順序</b>會影響結果：先 x 再 y ≠ 先 y 再 x。<br>（先後順序換了，積木最後的姿勢就不同。）', '性質')); P.toast(api.ctx.p2 === 1 ? '你猜對了！不一樣' : '結果不一樣！'); api.unlock('順序很重要！'); } }
      api.solve(function () { gate.on = false; a.setR(mm(MY, MX)); b.setR(mm(MX, MY)); judge(); });
      st.append(ro, P.hint('兩邊同時從一樣的姿勢出發，只是轉的順序相反。')); api.lock('先做上面的預測');
    },
    /* 3 鏡射與左右手 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '鏡射'), P.instr('積木照鏡子（<b>左右對調</b>），鏡中的像能不能<b>轉一轉</b>變成原來的樣子？'));
      var H = holders(st, 2), mh = Math.max(120, Math.min(160, window.innerHeight - 610)), cur = 'spiral', tested = {}, busy = false;
      capt(H.cols[0], '原來'); capt(H.cols[1], '鏡中的像（試 24 種姿勢）');
      var s1 = mk(H.cols[0], { maxH: mh }), s2 = mk(H.cols[1], { drag: false, maxH: mh }), A = new Rig(s1, PIECES.spiral), B = new Rig(s2, PIECES.spiral, { mirror: true });
      var pr = P.pill('', ''), pn = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pr, pn);
      var seg = PS.seg(st, [{ k: 'spiral', t: '螺旋積木' }, { k: 'ell', t: '角落積木' }], function (k) { if (busy) { seg.set(cur, false); return; } cur = k; A.piece = PIECES[k]; B.piece = PIECES[k]; A.setR(I3); B.setR(I3); pr.textContent = '按「自動試」'; pn.textContent = ''; pr.className = 'pl-pill'; });
      seg.set('spiral', false); pr.textContent = '按「自動試」';
      var br = PS.btnRow(st, [{ t: '自動試 24 種姿勢', fn: function () {
        if (busy) return; busy = true; var i = 0, hit = 0, base = A.centers();
        (function step() {
          if (i >= ROTS.length) { busy = false; tested[cur] = hit; pr.className = 'pl-pill ' + (hit ? 'is-ok' : 'is-pink'); pr.textContent = hit ? ('有 ' + hit + ' 種姿勢和原來一樣') : '24 種姿勢，沒有一個一樣！'; pn.textContent = '試完 24 / 24'; B.setR(I3);
            concl(); return; }
          B.setR(ROTS[i]); var ok = sameShape(B.centers(), base); if (ok) hit++; i++; pn.textContent = '第 ' + i + ' / 24 種'; pr.className = 'pl-pill ' + (ok ? 'is-ok' : ''); pr.textContent = ok ? '這個姿勢一樣！' : '還是不一樣'; setTimeout(step, 110);
        })();
      } }]);
      function concl() { if (tested.spiral !== undefined && tested.ell !== undefined && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-transform', step: 3 }); st.append(P.ruleBox('有些形狀的鏡像<b>怎麼轉都不一樣</b>（像<b>左手與右手</b>）。<br>只有「有對稱面」的形狀，鏡像才能轉成原來的樣子。', '性質')); api.unlock('左手右手轉不一樣！'); } }
      api.solve(function () { busy = false; ['spiral', 'ell'].forEach(function (k) { cur = k; seg.set(k, false); A.piece = PIECES[k]; B.piece = PIECES[k]; A.setR(I3); var base = A.centers(), hit = 0; ROTS.forEach(function (R) { B.setR(R); if (sameShape(B.centers(), base)) hit++; }); tested[k] = hit; }); B.setR(I3); pr.className = 'pl-pill is-ok'; pr.textContent = '角落積木有 ' + tested.ell + ' 種姿勢一樣；螺旋積木 0 種'; pn.textContent = '兩種都試完 24 種'; concl(); });
      st.append(ro, P.hint('兩種積木都試一次，比較結果。')); api.lock('兩種積木都試一次');
    },
    /* 4 正方體的旋轉軸 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '正方體的旋轉軸'), P.instr('正方體繞哪些軸轉一轉，會和自己<b>重合</b>？選一種軸，按「轉給我看」。'));
      var sc = PS.scene(st, { fitR: 1.2 }), types = {
        face: { name: '面軸', ax: [0, 1, 0], deg: 90, cnt: 3, desc: '穿過相對面的中心' }, vert: { name: '頂點軸', ax: [1, 1, 1], deg: 120, cnt: 4, desc: '穿過相對的頂點' }, edge: { name: '稜軸', ax: [1, 1, 0], deg: 180, cnt: 6, desc: '穿過相對稜的中點' } };
      var cur = 'face', theta = 0, visited = {}, busy = false, ask = h('div', {});
      var base = D.cubeFaces(-.5, -.5, -.5, 1, '#fff'); var fcol = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f', '#7a4fd6', '#e8590c'];
      function draw() {
        var t = types[cur], u = V3.norm(t.ax); sc.faces = D.cubeFaces(-.5, -.5, -.5, 1, '#fff').map(function (f, i) { f.fill = fcol[i]; f.alpha = 0.78; f.pts = f.pts.map(function (p) { return D.rotAxis(p, u, theta); }); return f; });
        var ghost = D.cubeFaces(-.5, -.5, -.5, 1, '#fff').map(function (f) { f.fill = null; f.stroke = 'rgba(18,37,72,.35)'; f.dash = [4, 4]; f.lw = 1.2; f.nopick = true; return f; }); sc.faces = ghost.concat(sc.faces);
        sc.lines = [{ a: V3.mul(u, -1.1), b: V3.mul(u, 1.1), color: '#122548', w: 3.5, bias: 3 }]; sc.dots = [{ p: V3.mul(u, 1.1), r: 5, color: '#122548' }, { p: V3.mul(u, -1.1), r: 5, color: '#122548' }]; sc.texts = [{ p: V3.mul(u, 1.38), t: '＋端', color: '#122548', size: 13, halo: true, top: true }, { p: V3.mul(u, -1.38), t: '－端', color: '#122548', size: 13, halo: true, top: true }]; sc.invalidate();
      }
      var pt = P.pill('', 'is-blue'), pd = P.pill('', 'is-amber'), pc = P.pill('', 'is-green'), ro = h('div', { class: 'pl-readout' }, pt, pd, pc);
      var seg = PS.seg(st, [{ k: 'face', t: '面軸<br><small>穿過面中心</small>' }, { k: 'vert', t: '頂點軸<br><small>穿過對頂點</small>' }, { k: 'edge', t: '稜軸<br><small>穿過稜中點</small>' }], function (k) { if (busy) { seg.set(cur, false); return; } cur = k; theta = 0; info(); draw(); }, {});
      function info() { var t = types[cur]; pt.textContent = t.name + '：共 ' + t.cnt + ' 條'; pd.textContent = '最少轉 ' + t.deg + '°'; pc.textContent = '每條軸有 ' + (360 / t.deg - 1) + ' 種轉法'; }
      seg.set('face', false); info(); draw();
      var br = PS.btnRow(st, [{ t: '▶ 轉給我看', fn: function () {
        if (busy) return; busy = true; var t = types[cur], sp = PS.spring(0, { k: 90, zeta: 0.8, onUpdate: function (v) { theta = v; draw(); }, onRest: function () { busy = false; visited[cur] = 1; if (Object.keys(visited).length === 3 && !ask.firstChild) showAsk(); } }); sp.to(t.deg * Math.PI / 180);
      } }]);
      function showAsk() {
        br.el.style.display = 'none'; seg.el.style.display = 'none';
        var qb = h('div', {}); ask.append(qb); qb.append(h('div', { class: 'pl-q', html: '把「不轉」也算一種。正方體所有「轉一轉就和自己重合」的方法共有幾種？<br><small>（面軸 3 條×3 種＋頂點軸 4 條×2 種＋稜軸 6 條×1 種＋不轉 1 種）</small>' }));
        P.numBox(qb, { answer: 24, before: '共', unit: '種', okMsg: '對！1 ＋ 3×3 ＋ 4×2 ＋ 6×1 ＝ 24 種。', onOk: function () { P.track('aha', { id: 'solid-transform', step: 4 }); ask.append(P.ruleBox('正方體有 <b>13 條旋轉軸</b>（3 面軸、4 頂點軸、6 稜軸），共 <b>24 種</b>轉法會和自己重合。這就是正方體的<b>旋轉對稱</b>。', '性質')); api.unlock('24 種轉法！'); }, wrong: function () { return '提示：9 ＋ 8 ＋ 6 ＋ 1 ＝ ？'; } });
      }
      api.solve(function () { visited = { face: 1, vert: 1, edge: 1 }; if (!ask.firstChild) showAsk(); });
      st.append(ro, ask, P.hint('三種軸都「轉給我看」一次，會出現一個問題。')); api.lock('三種軸都看一次，再回答問題');
    },
    /* 5 換個外觀 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var sc = PS.scene(box, { fitR: 1.2, pitch: 0.3, yaw: -0.5 }), AS1 = PS.axisSet(1.15, { only: [1] }), th = 0, busy = false, fcol = { f: '#d6336c', b: '#9db7ee', l: '#9ad9b3', r: '#f0d58b', t: '#c5b0ef', d: '#f4b78e' };
          function draw() { var cols = [fcol.f, fcol.b, fcol.l, fcol.r, fcol.t, fcol.d]; sc.faces = D.cubeFaces(-.5, -.5, -.5, 1, '#fff').map(function (f, i) { f.fill = cols[i]; f.pts = f.pts.map(function (p) { return D.rotAxis(p, [0, 1, 0], th); }); f.label = i === 0 ? '紅' : ''; f.labelColor = '#fff'; f.labelSize = 18; return f; }); sc.lines = AS1.lines; sc.invalidate(); }
          PS.dirLabels(sc, { x0: -.5, x1: .5, z0: -.5, z1: .5, y: -.5, lo: -.95, ly: .62 }, { margin: 0.5, size: 15 }); sc.extraTexts = sc.extraTexts.concat(AS1.texts);   /* 左右前後（固定在地板，不跟著積木轉）＋ y 軸的正負端 */
          draw(); PS.btnRow(box, [{ t: '▶ 轉給我看', fn: function () { if (busy) return; busy = true; th = 0; var sp = PS.spring(0, { k: 90, zeta: 0.8, onUpdate: function (v) { th = v; draw(); }, onRest: function () { busy = false; } }); sp.to(Math.PI / 2); } }, { t: '↺ 還原', fn: function () { if (!busy) { th = 0; draw(); } } }]);
          P.choice(box, {}, { id: 'stf-t1', prompt: '紅色的面朝向你。繞 y 軸（綠線）<b>逆時針</b>轉 90° 後（從軸尖端往下看），紅面會轉到哪裡？', row: true, options: [{ t: '右邊', ok: true, fb: '對！逆時針（右手定則）：前面轉到右邊。' }, { t: '左邊', fb: '那是順時針轉的結果。按「轉給我看」確認。' }, { t: '後面', fb: '轉 90° 只會轉到旁邊；轉 180° 才到後面。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var sc = PS.scene(box, { fitR: 1.2 }), u = V3.norm([1, 1, 1]), th = 0, busy = false;
          function draw() { sc.faces = D.cubeFaces(-.5, -.5, -.5, 1, '#fff').map(function (f, i) { f.fill = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f', '#7a4fd6', '#e8590c'][i]; f.alpha = 0.8; f.pts = f.pts.map(function (p) { return D.rotAxis(p, u, th); }); return f; }); sc.lines = [{ a: V3.mul(u, -1.1), b: V3.mul(u, 1.1), color: '#122548', w: 3.5, bias: 3 }]; sc.dots = [{ p: V3.mul(u, 1.1), r: 5, color: '#122548', label: '頂點', dx: 18, dy: -4 }]; sc.invalidate(); }
          draw(); PS.btnRow(box, [{ t: '▶ 轉 120°', fn: function () { if (busy) return; busy = true; th = 0; var sp = PS.spring(0, { k: 90, zeta: 0.8, onUpdate: function (v) { th = v; draw(); }, onRest: function () { busy = false; } }); sp.to(Math.PI * 2 / 3); } }, { t: '↺ 還原', fn: function () { if (!busy) { th = 0; draw(); } } }]);
          box.append(h('div', { class: 'pl-q', html: '正方體繞一條<b>對角線</b>（穿過兩個相對頂點，黑線）轉，<b>最少</b>轉幾度會和自己重合？（按鈕可以看 120° 的樣子）' }));
          P.numBox(box, { answer: 120, unit: '度', okMsg: '對！每個頂點連 3 個面，轉 120° 三個面互換，剛好重合；360 ÷ 3 ＝ 120。', onOk: next, wrong: function (v) { return v === 90 ? '90° 是繞面軸的最小轉角。頂點軸看一個頂點周圍有幾個面。' : '提示：頂點周圍有 3 個面，轉到下一個面要 360° ÷ 3。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var H = holders(box, 2), mh = Math.max(110, Math.min(150, window.innerHeight - 620));
          capt(H.cols[0], '右手積木'); capt(H.cols[1], '鏡中的像'); var a = new Rig(mk(H.cols[0], { maxH: mh }), PIECES.spiral), b = new Rig(mk(H.cols[1], { maxH: mh }), PIECES.spiral, { mirror: true });
          P.choice(box, {}, { id: 'stf-t3', prompt: '螺旋積木的鏡中像，和原來的積木<b>轉一轉</b>能一樣嗎？', options: [{ t: '能，轉到對的姿勢就一樣', fb: '剛剛 24 種姿勢都試過了，沒有一個一樣。' }, { t: '不能，像左手與右手', ok: true, fb: '對！這種沒有對稱面的形狀，鏡像和原來是「左右手」關係。' }], onAnswer: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-transform' }); } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 6 完成 */
    function (st) {
      P.complete(st, {
        id: 'solid-transform', moduleName: '立體變換', askAbout: '國中、高中立體與空間', aha: '旋轉要看「繞哪根軸」，順序不能換；<br>鏡射會把左右手對調。',
        cards: [{ text: '繞軸旋轉只改變朝向；旋轉的順序不同，結果可能不同', src: '國中「對稱、平移與旋轉」延伸到立體（獵豹 J71S CH5）' }, { text: '正方體有 13 條旋轉軸、24 種旋轉對稱；有的形狀鏡像無法轉成原樣（手性）', src: '高中「矩陣與線性變換」的立體前導（獵豹 S112）' }],
        depth: { here: 0.22, cheetah: [{ at: 0.5, label: '旋轉矩陣<br>對稱群' }, { at: 0.9, label: '正多面體的<br>對稱' }] },
        teasers: [
          { title: '旋轉矩陣', q: '繞 z 軸轉 θ 的 3×3 矩陣長什麼樣？為什麼兩次旋轉要「矩陣相乘」而且順序不能換？', where: 'S112 矩陣', lv: 'L2' },
          { title: '24 種旋轉怎麼算出來？', q: '不用一個一個數：先選哪一面朝上（6 種），再選轉幾個 90°（4 種）。', where: '數資班拓展（請洽老師）', lv: 'L2' },
          { title: '正四面體、正十二面體的旋轉對稱', q: '正四面體有幾種旋轉對稱？（12）正十二面體呢？（60）', where: '數資班拓展（請洽老師）', lv: 'L3' },
          { title: '魔術方塊的數學', q: '魔術方塊的每一次轉動，其實就是一個「置換」。為什麼有 4.3×10¹⁹ 種狀態？', where: '數資班拓展（請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子容易把兩次旋轉當成可以交換順序，或以為鏡像轉一轉就會一樣。空間想像力不夠時，只能硬背公式，換個題型就卡住。', place: '空間想像力的核心，從展開圖、三視圖到高中的矩陣與空間向量都用得到。', ask: ['先繞 x 軸再繞 y 軸，和先 y 再 x，結果一樣嗎？', '為什麼右手手套轉一轉也變不成左手手套？', '正方體有幾種轉法會和自己重合？'] },
        classes: ['J71S CH5：三視圖與空間觀察', 'S112：矩陣與線性變換', 'PK4B：幾何變換'],
        next: { href: 'play-solid-views.html', text: '下一個：各種角度觀察' } });
    }];
  new P.Lesson({ id: 'solid-transform', title: '立體變換', answers: { 0: '旋轉只改變積木的朝向，不改變形狀和大小', 2: '只有有對稱面的形狀，鏡像才能轉成原來的樣子（像左手和右手就不行）' }, steps: steps });
})();
