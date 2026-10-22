/* 獵豹玩中學｜遊戲：魔術方塊（2×2／3×3）
   配色、發光、操作細節向「獵豹數學奇幻之旅」第 7 關 L07_cube.html 看齊：
   操作＝在貼紙上滑動轉那一層（往左右滑轉橫列、往上下滑轉直列；外層、中層都能轉；每次固定 90°）；
        空白處拖曳或右下角 360° 圓環＝轉視角；滑鼠移到／手指按住貼紙＝該貼紙發出自己顏色的光；
        另有六個面的按鈕、撤銷、提示（不限次數，會配合目前視角標出發光貼紙與滑動方向）。
   模型：每個小方塊有位置 c 與貼紙法向 n；轉一層＝把該層所有 c 與 n 繞軸轉 ±90°（整數運算，不會累積誤差）。 */
(function () {
  'use strict';
  var P = Play, PG = PlayGame, D = Play3D, h = P.h, SLUG = 'game-cube';
  var COL = { U: '#f5f4ee', D: '#ffd900', F: '#08c766', B: '#2479ff', R: '#f02c36', L: '#ff8500' };   // 奇幻之旅配色
  var COLNAME = { '#f5f4ee': '白色', '#ffd900': '黃色', '#08c766': '綠色', '#2479ff': '藍色', '#f02c36': '紅色', '#ff8500': '橘色' };
  var BODY = '#11141b', BODY_EDGE = '#080a0e', STICKER_EDGE = '#0b0d13';
  var DIRS = [{ k: 'R', n: [1, 0, 0] }, { k: 'L', n: [-1, 0, 0] }, { k: 'U', n: [0, 1, 0] }, { k: 'D', n: [0, -1, 0] }, { k: 'F', n: [0, 0, 1] }, { k: 'B', n: [0, 0, -1] }];
  var POS = { R: '右', L: '左', U: '上', D: '下', F: '前', B: '後' };
  var HOME = { yaw: -0.6, pitch: 0.44 };   // 約 34°／25°：和奇幻之旅同一個預設視角
  var PERSP = 16.7;   // 透視距離（格）：奇幻之旅 perspective 1200px ÷ 方塊 72px ≈ 16.7 格
  var LEVELS = [
    { id: 'warm', name: '暖身', title: '2×2 迷你方塊', N: 2, scr: 4, time: 240, desc: '2×2・洗亂 4 步・<b>4 分鐘</b>倒數<br>只有角塊，最適合練手感' },
    { id: 'mid', name: '中等', title: '3×3 經典方塊', N: 3, scr: 6, time: 360, desc: '3×3・洗亂 6 步・<b>6 分鐘</b>倒數<br>用提示一步一步還原' },
    { id: 'hard', name: '困難', title: '3×3 深度洗亂', N: 3, scr: 14, time: 600, desc: '3×3・洗亂 14 步・<b>10 分鐘</b>倒數<br>要靠觀察與規劃' }
  ];

  /* ------------------------------------------------ 方塊模型 */
  function rot90(v, a, s) {
    var w = [0, 0, 0]; w[a] = 1; var d = v[a];
    var cr = [w[1] * v[2] - w[2] * v[1], w[2] * v[0] - w[0] * v[2], w[0] * v[1] - w[1] * v[0]];
    return [w[0] * d + s * cr[0] + 0, w[1] * d + s * cr[1] + 0, w[2] * d + s * cr[2] + 0].map(function (x) { return x === 0 ? 0 : x; });
  }
  function makeCube(N) {
    var o = (N - 1) / 2, cub = [], x, y, z;
    for (x = 0; x < N; x++) for (y = 0; y < N; y++) for (z = 0; z < N; z++) {
      var c = [x - o, y - o, z - o], st = [];
      DIRS.forEach(function (d) { var a = d.n[0] ? 0 : d.n[1] ? 1 : 2, sg = d.n[a]; if (c[a] * sg === o) st.push({ n: d.n.slice(), col: COL[d.k] }); });
      cub.push({ c: c, st: st });
    }
    return { N: N, o: o, cub: cub };
  }
  function applyMove(cube, m) {
    cube.cub.forEach(function (q) { if (q.c[m.a] === m.l) { q.c = rot90(q.c, m.a, m.s); q.st.forEach(function (t) { t.n = rot90(t.n, m.a, m.s); }); } });
  }
  function isSolved(cube) {
    var seen = {}, ok = true;
    cube.cub.forEach(function (q) { q.st.forEach(function (t) { var k = t.n.join(','); if (seen[k] === undefined) seen[k] = t.col; else if (seen[k] !== t.col) ok = false; }); });
    return ok;
  }
  function inv(m) { return { a: m.a, l: m.l, s: -m.s }; }
  function layers(cube) { var r = [], i; for (i = 0; i < cube.N; i++) r.push(i - cube.o); return r; }
  function scramble(cube, n, rnd) {
    var out = [], last = null, ls = layers(cube);
    while (out.length < n) {
      var m = { a: rnd.int(3), l: rnd.pick(ls), s: rnd.pick([-1, 1]) };
      if (last && last.a === m.a && last.l === m.l) continue;
      out.push(m); last = m;
    }
    return out;
  }
  function tangents(n) {
    var a = n[0] ? 0 : n[1] ? 1 : 2, s = n[a], u = [0, 0, 0], v = [0, 0, 0]; u[(a + 1) % 3] = 1; v[(a + 2) % 3] = 1;
    if (s < 0) { var t = u; u = v; v = t; } return [u, v];
  }
  function add3(a, b, k) { return [a[0] + b[0] * (k === undefined ? 1 : k), a[1] + b[1] * (k === undefined ? 1 : k), a[2] + b[2] * (k === undefined ? 1 : k)]; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]].map(function (x) { return x === 0 ? 0 : x; }); }

  /* 把狀態（與正在轉的那一層、發光的貼紙）轉成可畫的面。ui.hover／ui.hint＝貼紙代號 'ci:si' */
  function buildFaces(cube, anim, ui) {
    ui = ui || {}; var faces = [], axis = null;
    if (anim) { axis = [0, 0, 0]; axis[anim.a] = 1; }
    cube.cub.forEach(function (q, ci) {
      var inLayer = anim && q.c[anim.a] === anim.l, tp = inLayer ? function (p) { return D.rotAxis(p, axis, anim.ang); } : function (p) { return p; };
      D.box(q.c[0] - 0.5, q.c[1] - 0.5, q.c[2] - 0.5, 1, 1, 1, BODY, { flat: true, stroke: BODY_EDGE, lw: 1.4, nopick: true }).forEach(function (f) { f.pts = f.pts.map(tp); faces.push(f); });
      q.st.forEach(function (t, si) {
        var tg = tangents(t.n), key = ci + ':' + si;
        function quad(k, off, r) { var ct = add3(q.c, t.n, off), out = []; r = r || 0; [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]].forEach(function (cn) { var cx = cn[0] * (k - r), cy = cn[1] * (k - r), i, a; if (!r) { out.push([cn[0] * k, cn[1] * k]); return; } for (i = 0; i <= 3; i++) { a = (cn[2] + i * 30) * Math.PI / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } }); return out.map(function (sv) { return tp(add3(add3(ct, tg[0], sv[0]), tg[1], sv[1])); }); }
        var f = { pts: quad(0.44, 0.512, 0.1), fill: t.col, flat: true, stroke: STICKER_EDGE, lw: 2.6, sticker: { ci: ci, si: si, n: t.n }, hkey: key };
        if (ui.hint === key) { f.glow = t.col; f.glowBig = true; } else if (ui.hover === key) f.glow = t.col;
        faces.push(f);
        faces.push({ pts: quad(0.35, 0.52, 0.07), stroke: 'rgba(255,255,255,0.24)', lw: 1, nopick: true });   // 貼紙內側的細亮邊
      });
    });
    return faces;
  }

  /* ------------------------------------------------ 遊戲 */
  var sh, state = null;

  function menu() {
    if (state) { try { state.dispose(); } catch (e) {} state = null; }
    sh = sh || PG.shell({ title: '魔術方塊' });
    sh.right.innerHTML = ''; sh.body.innerHTML = '';
    PG.picker(sh.body, {
      slug: SLUG, levels: LEVELS, howto: '<b>怎麼玩</b>：從彩色貼紙往<b>左右滑</b>轉那一橫列、往<b>上下滑</b>轉那一直列（每次 90°）；在<b>空白處拖曳</b>或拖右下角<b>圓環</b>轉整顆看不同角度。讓<b>每一面都變成同一個顏色</b>就過關。卡住時按「提示」，會用發光的貼紙告訴你下一步（不限次數）。每次都是新的隨機洗亂，玩不完！',
      fmtBest: function (v) { return v === null ? '還沒有紀錄' : '最佳：' + PG.fmt(v) + '（最快）'; }, onPick: function (lv) { start(lv, PG.newSeed()); }
    });
    sh.toTop();
  }

  function start(lv, seed) {
    if (state) { try { state.dispose(); } catch (e) {} }
    sh.body.innerHTML = ''; sh.right.innerHTML = '';
    var rnd = PG.rng(seed), cube = makeCube(lv.N), scr = scramble(cube, lv.scr, rnd), played = [], hints = 0, busy = false, over = false, queue = [], timeless = false, dirCW = true, gesture = null;
    var ui = { hover: null, hint: null }, curAnim = null, hintOn = false, hintMove = null, hintCand = null, hintText = '';
    var timeChip = h('span', { class: 'pgm-chip pgm-chip--time' }, '⏱ ' + PG.fmt(lv.time)), moveChip = h('span', { class: 'pgm-chip' }, '步數 0');
    var hud = h('div', { class: 'pgm-hud' }, timeChip, moveChip, h('span', { class: 'pgm-chip pgm-chip--soft' }, lv.name + '・題號 ' + seed));
    var host = h('div', { class: 'pgm-stage pgm-cubestage' }), msg = h('div', { class: 'pgm-msg', 'aria-live': 'polite' }, '小獵：正在洗亂方塊…');
    var faceRow = h('div', { class: 'pgm-faces' }), actRow = h('div', { class: 'pgm-actions' });
    sh.body.append(hud, host, msg, faceRow, actRow);
    var sc = new D.Scene(host, { aspect: 1.08, scale: lv.N === 2 ? 88 : 58, cull: true, persp: PERSP, yaw: HOME.yaw, pitch: HOME.pitch, label: '魔術方塊，在貼紙上滑動轉動那一層，在空白處拖曳轉整顆' });
    sc.light = [-0.3, 0.7, 0.6];
    function redraw(anim) { if (anim !== undefined) curAnim = anim; sc.faces = buildFaces(cube, curAnim, ui); sc.invalidate(); }
    redraw(null);

    /* 360° 視角圓環（拖曳轉整顆方塊） */
    var dial = h('div', { class: 'pgm-dial' },
      h('svg', { viewBox: '0 0 100 100', class: 'pgm-dial__svg', role: 'img', 'aria-label': '拖曳這個圓環轉動魔術方塊視角' }, h('circle', { cx: 50, cy: 50, r: 38, class: 'pgm-dial__track' }), h('path', { d: 'M25 24 A36 36 0 0 1 73 18 M73 18 L72 29 M73 18 L62 17', class: 'pgm-dial__arrow' }), h('path', { d: 'M75 76 A36 36 0 0 1 27 82 M27 82 L28 71 M27 82 L38 83', class: 'pgm-dial__arrow' })),
      h('div', { class: 'pgm-dial__cap' }, '360° 視角', h('small', {}, '拖曳圓環')));
    host.append(dial);
    (function () {
      var drag = null, svg = dial.querySelector('svg');
      svg.addEventListener('pointerdown', function (e) { if (over) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { svg.setPointerCapture(e.pointerId); } catch (_) {} svg.classList.add('dragging'); e.preventDefault(); });
      svg.addEventListener('pointermove', function (e) { if (!drag || drag.id !== e.pointerId) return; sc.vx = sc.vy = 0; sc.yaw += (e.clientX - drag.x) * 0.0183; sc.pitch = Math.max(-1.5, Math.min(1.5, sc.pitch + (e.clientY - drag.y) * 0.0148)); drag.x = e.clientX; drag.y = e.clientY; sc.invalidate(); e.preventDefault(); });
      function up(e) { if (drag && drag.id === e.pointerId) { drag = null; svg.classList.remove('dragging'); } }
      svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
      svg.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    })();

    /* 動畫與動作佇列（一次只轉一層） */
    function animate(m, dur, cb) {
      var t0 = performance.now(); if (dur <= 0) { cb(); return; }
      (function step(now) { var t = Math.min(1, ((now || performance.now()) - t0) / dur), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; redraw({ a: m.a, l: m.l, ang: m.s * e * Math.PI / 2 }); if (t < 1) requestAnimationFrame(step); else cb(); })(t0);
    }
    function pump() {
      var it = queue.shift(); if (!it) { busy = false; return; } busy = true;
      animate(it.m, it.fast ? 60 : 210, function () { applyMove(cube, it.m); clearHint(); redraw(null); if (it.done) it.done(); pump(); });
    }
    function enqueue(m, fast, done) { queue.push({ m: m, fast: fast, done: done }); if (!busy) pump(); }

    function updateHud() { moveChip.textContent = '步數 ' + played.length; }
    function say(t) { msg.textContent = t; }
    function solution() {
      var full = scr.concat(played), seq = full.slice().reverse().map(inv), st = [];
      seq.forEach(function (x) { var t = st[st.length - 1]; if (t && t.a === x.a && t.l === x.l && t.s === -x.s) st.pop(); else st.push(x); });
      return st;
    }
    function play(m) {
      if (busy || over) return; played.push(m); updateHud(); say(PG.cheer('good', rnd));
      enqueue(m, false, function () { if (isSolved(cube)) win(); });
    }

    /* ---- 提示：配合「目前視角」找一張看得到的貼紙，標出發光與滑動方向 ---- */
    function screenDir(u) { var ax = Math.abs(u[0]), ay = Math.abs(u[1]); if (ax >= ay * 1.8) return u[0] > 0 ? '右' : '左'; if (ay >= ax * 1.8) return u[1] > 0 ? '下' : '上'; return (u[0] > 0 ? '右' : '左') + (u[1] > 0 ? '下' : '上'); }
    function hintFor(move) {
      var best = null;
      cube.cub.forEach(function (q, ci) {
        q.st.forEach(function (t, si) {
          var depth = D.rotX(D.rotY(t.n, sc.yaw), sc.pitch)[2]; if (depth <= 0.18) return;
          var p = add3(q.c, t.n, 0.5), ps = sc.project(p), off = 0;
          [0, 1, 2].forEach(function (ax) { if (t.n[ax] === 0) off += Math.abs(q.c[ax]); });
          [0, 1, 2].forEach(function (ax) {
            if (t.n[ax] !== 0) return;
            [1, -1].forEach(function (sg) {
              var tv = [0, 0, 0]; tv[ax] = sg; var w = cross3(t.n, tv), a = w[0] ? 0 : w[1] ? 1 : 2;
              if (a !== move.a || q.c[a] !== move.l || w[a] !== move.s) return;
              var pe = sc.project(add3(p, tv, 1)), sv = [pe[0] - ps[0], pe[1] - ps[1]], L = Math.hypot(sv[0], sv[1]); if (L < 12) return;
              var score = depth * 10 - off; if (!best || score > best.score) best = { ci: ci, si: si, key: ci + ':' + si, col: t.col, score: score, u: [sv[0] / L, sv[1] / L], p: p };
            });
          });
        });
      });
      return best;
    }
    function hintMessage(c, left) {
      if (!c) return '目前視角看不清要轉的那一層。請拖曳右下角圓環（或在空白處拖曳）稍微換個角度，提示會跟著更新。';
      var d = screenDir(c.u), horizontal = Math.abs(c.u[0]) >= Math.abs(c.u[1]);
      return '找畫面中發光的' + (COLNAME[c.col] || '') + '貼紙，從貼紙向畫面' + d + '方滑（看白色箭頭），轉動它所在的' + (horizontal ? '橫列' : '直列') + '。剩下 ' + left + ' 步。';
    }
    function clearHint() { hintOn = false; hintMove = null; hintCand = null; ui.hint = null; }
    function showHint() {
      if (busy || over) return; var seq = solution();
      if (!seq.length) { say('已經是復原狀態了！'); return; }
      hints++; hintOn = true; hintMove = seq[0]; hintCand = hintFor(hintMove); ui.hint = hintCand ? hintCand.key : null; hintText = hintMessage(hintCand, seq.length); say('小獵：' + hintText); redraw(); P.track('game_hint', { id: SLUG });
    }
    /* 每次重畫時：視角若換了，提示的貼紙與箭頭也跟著換；另外畫出滑動方向的箭頭 */
    sc.onRender = function (c, s) {
      if (!hintOn || !hintMove || over) return;
      var cand = hintFor(hintMove), k = cand ? cand.key : null;
      if (k !== ui.hint) { hintCand = cand; ui.hint = k; hintText = hintMessage(cand, solution().length); say('小獵：' + hintText); sc.faces = buildFaces(cube, curAnim, ui); sc.dirty = true; }
      else hintCand = cand;
      if (!cand) return;
      var a = s.project(cand.p), len = Math.min(54, s.k * 0.95), e = [a[0] + cand.u[0] * len, a[1] + cand.u[1] * len], ang = Math.atan2(cand.u[1], cand.u[0]);
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = cand.col; c.shadowBlur = 12 * (s.dpr || 1); c.strokeStyle = '#ffffff'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(e[0], e[1]); c.moveTo(e[0], e[1]); c.lineTo(e[0] - Math.cos(ang - 0.5) * 14, e[1] - Math.sin(ang - 0.5) * 14); c.moveTo(e[0], e[1]); c.lineTo(e[0] - Math.cos(ang + 0.5) * 14, e[1] - Math.sin(ang + 0.5) * 14); c.stroke(); c.restore();
    };

    /* 結束 */
    var timer = new PG.Timer({
      limit: lv.time,
      onTick: function (rem) { if (timeless) return; timeChip.textContent = '⏱ ' + PG.fmt(rem); timeChip.classList.toggle('is-low', rem <= 30); },
      onEnd: function () { if (!over) lose(); }
    });
    function finish() { over = true; timer.stop(); PG.markDone(SLUG); }
    function again() { start(lv, PG.newSeed()); }
    function win() {
      var used = timer.elapsed(); finish();
      var star = 1 + (hints === 0 ? 1 : 0) + (!timeless && used <= lv.time * 0.4 ? 1 : 0), isNew = false;
      if (!timeless) isNew = PG.setBest(SLUG, lv.id, Math.round(used), true);
      var bestV = PG.best(SLUG, lv.id); P.track('game_win', { id: SLUG, level: lv.id, t: Math.round(used), hints: hints, moves: played.length });
      PG.result(sh.body, { slug: SLUG, moduleName: '魔術方塊', win: true, title: '復原成功！', emoji: '🧊', stars: star,
        lines: ['難度：' + lv.name + '（' + lv.title + '）', '用時 <b>' + PG.fmt(used) + '</b>・步數 <b>' + played.length + '</b>・提示 <b>' + hints + '</b> 次', star < 3 ? '想拿滿 3 顆星：<b>不看提示</b>、並在時限的 40% 內完成。' : '三顆星！你是方塊高手。'],
        best: { text: bestV === null ? '—' : PG.fmt(bestV), isNew: isNew },
        buttons: [{ text: '再來一題（新的隨機洗亂）', fn: again }, { text: '換難度', kind: 'ghost', fn: menu }],
        teaser: { title: '魔術方塊與置換群', q: '方塊有 4.3×10¹⁹ 種狀態，為什麼任何一種最多 20 步就能復原？每一步其實是一個「置換」。', where: '高中／競賽班（離散數學、群論入門）', lv: 'L3' } });
    }
    function lose() {
      finish(); P.track('game_timeout', { id: SLUG, level: lv.id });
      PG.result(sh.body, { slug: SLUG, moduleName: '魔術方塊', win: false, title: '時間到！', emoji: '⏰', cheer: PG.cheer('fail', rnd),
        lines: ['難度：' + lv.name, '已經轉了 <b>' + played.length + '</b> 步，沒關係，慢慢練。'],
        buttons: [{ text: '繼續玩這一題（不計時）', fn: function () { resume(); } }, { text: '再來一題', kind: 'ghost', fn: again }, { text: '換難度', kind: 'ghost', fn: menu }],
        teaser: { title: '用「逆序」思考還原', q: '洗亂 n 步，反過來走 n 步就回到原狀。更短的方法怎麼找？', where: '競賽班：思考工具「相反的視角」', lv: 'L2' } });
    }
    function resume() { /* 回到棋盤，不計時 */
      over = false; timeless = true; sh.body.innerHTML = ''; sh.body.append(hud, host, msg, faceRow, actRow); timeChip.textContent = '不計時'; timeChip.classList.remove('is-low'); say('小豹：沒有時間壓力，慢慢轉。'); sc.invalidate();
    }

    /* 面按鈕（世界座標：上下左右前後，順時針＝從該面外面看） */
    var dirBtn = h('button', { type: 'button', class: 'pgm-dir', 'aria-pressed': 'false' }, '↻ 順時針');
    dirBtn.addEventListener('click', function () { dirCW = !dirCW; dirBtn.textContent = dirCW ? '↻ 順時針' : '↺ 逆時針'; dirBtn.classList.toggle('is-ccw', !dirCW); });
    DIRS.forEach(function (d) {
      var a = d.n[0] ? 0 : d.n[1] ? 1 : 2, f = d.n[a];
      var b = h('button', { type: 'button', class: 'pgm-face', style: { borderColor: COL[d.k] }, 'aria-label': POS[d.k] + '面轉一下' }, h('i', { style: { background: COL[d.k] } }), POS[d.k]);
      b.addEventListener('click', function () { play({ a: a, l: f * cube.o, s: dirCW ? -f : f }); });
      faceRow.append(b);
    });
    faceRow.append(dirBtn);

    /* 撤銷、提示、回正、新題 */
    function mk(t, cls, fn) { var b = h('button', { type: 'button', class: 'pgm-act ' + cls }, t); b.addEventListener('click', fn); actRow.append(b); return b; }
    mk('↶ 撤銷', '', function () {
      if (busy || over || !played.length) return; var m = played.pop(); updateHud(); enqueue(inv(m), false, function () { if (isSolved(cube)) win(); }); say('小豹：退回上一步。');
    });
    mk('💡 提示', 'is-hint', showHint);
    mk('🎯 回正視角', '', function () { sc.setView(HOME.yaw, HOME.pitch); });
    mk('🔀 新題', '', function () { if (busy && !over) return; again(); });

    /* 發光：滑鼠移到、或手指按住的貼紙，發出自己顏色的光（hover 由 Scene 的 onHover 通知） */
    sc.onHover = function (f) {
      var k = f && f.sticker ? f.hkey : null; if (over) k = null;
      if (k !== ui.hover) { ui.hover = k; sc.canvas.style.cursor = k ? 'grab' : ''; redraw(); }
    };

    /* 手勢：在貼紙上滑動＝轉那一層；其他地方交給 Scene 轉整顆 */
    sc.onDragStart = function (pos, e) {
      if (busy || over) return; var f = sc.pick(pos[0], pos[1]); if (!(f && f.sticker)) return;
      gesture = { start: pos, st: f.sticker, id: e.pointerId, done: false }; var cv = sc.canvas;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      cv.style.cursor = 'grabbing';
      var mv = function (ev) {
        if (!gesture || gesture.done) return; var r = cv.getBoundingClientRect(), d = [ev.clientX - r.left - gesture.start[0], ev.clientY - r.top - gesture.start[1]], L = Math.hypot(d[0], d[1]);
        if (L < 14) return; gesture.done = true;
        var cb = cube.cub[gesture.st.ci], n = gesture.st.n, p = add3(cb.c, n, 0.5), ps = sc.project(p), best = null;
        [0, 1, 2].forEach(function (ax) {
          if (n[ax] !== 0) return; var ev3 = [0, 0, 0]; ev3[ax] = 1; var pe = sc.project(add3(p, ev3)), sv = [pe[0] - ps[0], pe[1] - ps[1]], sl = Math.hypot(sv[0], sv[1]) || 1, cs = (sv[0] * d[0] + sv[1] * d[1]) / (sl * L);
          if (!best || Math.abs(cs) > Math.abs(best.cs)) best = { ax: ax, cs: cs };
        });
        if (!best) return; var tv = [0, 0, 0]; tv[best.ax] = best.cs >= 0 ? 1 : -1; var w = cross3(n, tv), a = w[0] ? 0 : w[1] ? 1 : 2;
        play({ a: a, l: cb.c[a], s: w[a] });
      };
      var up = function () { cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); gesture = null; cv.style.cursor = ui.hover ? 'grab' : ''; };
      cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      return false;
    };

    state = { lose: lose, dispose: function () { timer.destroy(); over = true; queue = []; }, cube: cube, scr: scr, played: played, play: play, sc: sc, lv: lv, ui: ui, isSolved: function () { return isSolved(cube); }, solution: solution, busy: function () { return busy; }, over: function () { return over; }, hintsUsed: function () { return hints; }, hintCand: function () { return hintCand; }, showHint: showHint };
    window.__cube = state;

    /* 洗亂動畫，結束後才開始計時 */
    scr.forEach(function (m, i) { enqueue(m, true, i === scr.length - 1 ? function () { say(PG.cheer('start', rnd) + '（洗亂 ' + lv.scr + ' 步，題號 ' + seed + '）'); timer.start(); busy = false; } : null); });
    sh.toTop();
    P.track('game_start', { id: SLUG, level: lv.id, seed: seed });
  }

  menu();
  window.__cubeAPI = { makeCube: makeCube, applyMove: applyMove, isSolved: isSolved, rot90: rot90, scramble: scramble, inv: inv, COL: COL, buildFaces: buildFaces };
})();
