/* 獵豹玩中學｜遊戲：魔術方塊（2×2／3×3）
   操作：在貼紙上滑動＝轉那一層；空白處拖曳＝轉整顆看不同角度；另有六個面的按鈕、撤銷、提示。
   模型：每個小方塊有位置 c 與貼紙法向 n；轉一層＝把該層所有 c 與 n 繞軸轉 ±90°（整數運算，不會累積誤差）。 */
(function () {
  'use strict';
  var P = Play, PG = PlayGame, D = Play3D, h = P.h, SLUG = 'game-cube';
  var COL = { R: '#d6343c', L: '#f08a24', U: '#f5f5f0', D: '#f2c230', F: '#2fa35a', B: '#2f6fdc' };
  var DIRS = [{ k: 'R', n: [1, 0, 0] }, { k: 'L', n: [-1, 0, 0] }, { k: 'U', n: [0, 1, 0] }, { k: 'D', n: [0, -1, 0] }, { k: 'F', n: [0, 0, 1] }, { k: 'B', n: [0, 0, -1] }];
  var POS = { R: '右', L: '左', U: '上', D: '下', F: '前', B: '後' };
  var HOME = { yaw: -0.75, pitch: 0.55 };
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

  /* 把狀態（與正在轉的那一層）轉成可畫的面 */
  function buildFaces(cube, anim, hl) {
    var faces = [], axis = null;
    if (anim) { axis = [0, 0, 0]; axis[anim.a] = 1; }
    cube.cub.forEach(function (q, ci) {
      var inLayer = anim && q.c[anim.a] === anim.l, tp = inLayer ? function (p) { return D.rotAxis(p, axis, anim.ang); } : function (p) { return p; };
      var body = D.box(q.c[0] - 0.5, q.c[1] - 0.5, q.c[2] - 0.5, 1, 1, 1, '#15171c', { flat: true, stroke: null, nopick: true });
      body.forEach(function (f) { f.pts = f.pts.map(tp); faces.push(f); });
      var lit = hl && q.c[hl.a] === hl.l;
      q.st.forEach(function (t) {
        var tg = tangents(t.n), ct = add3(q.c, t.n, 0.512), k = 0.43;
        var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (sv) { return tp(add3(add3(ct, tg[0], sv[0] * k), tg[1], sv[1] * k)); });
        faces.push({ pts: pts, fill: t.col, stroke: lit ? '#ffcf00' : '#0c0d10', lw: lit ? 3.2 : 1.1, sticker: { ci: ci, n: t.n } });
      });
    });
    return faces;
  }

  function layerName(cube, m) {
    var ax = m.a, o = cube.o, f = m.l === o ? 1 : m.l === -o ? -1 : 0, key = DIRS.filter(function (d) { return d.n[ax] === (f || 1); })[0].k;
    var cw = f === 0 ? m.s === -1 : m.s * f === -1;
    return { where: f === 0 ? '中間那一層' : '「' + POS[key] + '」那一層', view: '從「' + POS[key] + '面」看是' + (cw ? '順時針 ↻' : '逆時針 ↺'), cw: cw };
  }

  /* ------------------------------------------------ 遊戲 */
  var sh, state = null;

  function menu() {
    if (state) { try { state.dispose(); } catch (e) {} state = null; }
    sh = sh || PG.shell({ title: '魔術方塊' });
    sh.right.innerHTML = ''; sh.body.innerHTML = '';
    PG.picker(sh.body, {
      slug: SLUG, levels: LEVELS, howto: '<b>怎麼玩</b>：在方塊的格子上<b>滑動</b>＝轉那一層；在<b>空白處拖曳</b>＝轉整顆看不同角度。讓<b>每一面都變成同一個顏色</b>就過關。卡住時按「提示」，小獵會告訴你下一步。每次都是新的隨機洗亂，玩不完！',
      fmtBest: function (v) { return PG.fmt(v) + '（最快）'; }, onPick: function (lv) { start(lv, PG.newSeed()); }
    });
    sh.toTop();
  }

  function start(lv, seed) {
    if (state) { try { state.dispose(); } catch (e) {} }
    sh.body.innerHTML = ''; sh.right.innerHTML = '';
    var rnd = PG.rng(seed), cube = makeCube(lv.N), scr = scramble(cube, lv.scr, rnd), played = [], hints = 0, busy = false, over = false, queue = [], hl = null, hintMsgTimer = null, timeless = false, dirCW = true, gesture = null;
    var timeChip = h('span', { class: 'pgm-chip pgm-chip--time' }, '⏱ ' + PG.fmt(lv.time)), moveChip = h('span', { class: 'pgm-chip' }, '步數 0');
    var hud = h('div', { class: 'pgm-hud' }, timeChip, moveChip, h('span', { class: 'pgm-chip pgm-chip--soft' }, lv.name + '・題號 ' + seed));
    var host = h('div', { class: 'pgm-stage' }), msg = h('div', { class: 'pgm-msg', 'aria-live': 'polite' }, '小獵：正在洗亂方塊…');
    var faceRow = h('div', { class: 'pgm-faces' }), actRow = h('div', { class: 'pgm-actions' });
    sh.body.append(hud, host, msg, faceRow, actRow);
    var sc = new D.Scene(host, { aspect: 1.08, scale: lv.N === 2 ? 88 : 58, cull: true, yaw: HOME.yaw, pitch: HOME.pitch, label: '魔術方塊，在格子上滑動轉動那一層，在空白處拖曳轉整顆' });
    sc.light = [-0.3, 0.7, 0.6];
    function redraw(anim) { sc.faces = buildFaces(cube, anim || null, hl); sc.invalidate(); }
    redraw();

    /* 動畫與動作佇列（一次只轉一層） */
    function animate(m, dur, cb) {
      var t0 = performance.now(); if (dur <= 0) { cb(); return; }
      (function step(now) { var t = Math.min(1, ((now || performance.now()) - t0) / dur), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; redraw({ a: m.a, l: m.l, ang: m.s * e * Math.PI / 2 }); if (t < 1) requestAnimationFrame(step); else cb(); })(t0);
    }
    function pump() {
      var it = queue.shift(); if (!it) { busy = false; return; } busy = true;
      animate(it.m, it.fast ? 60 : 210, function () { applyMove(cube, it.m); hl = null; redraw(); if (it.done) it.done(); pump(); });
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
      if (busy || over) return; played.push(m); updateHud(); hl = null; say(PG.cheer('good', rnd));
      enqueue(m, false, function () { if (isSolved(cube)) win(); });
    }

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
        lines: ['難度：' + lv.name + '（' + lv.title + '）', '用時 <b>' + PG.fmt(used) + '</b>・步數 <b>' + played.length + '</b>・提示 <b>' + hints + '</b> 次', star < 3 ? '想拿滿 3 顆星：<b>不用提示</b>、並在時限的 40% 內完成。' : '三顆星！你是方塊高手。'],
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
      if (busy || over || !played.length) return; var m = played.pop(); updateHud(); hl = null; enqueue(inv(m), false, function () { if (isSolved(cube)) win(); }); say('小豹：退回上一步。');
    });
    mk('💡 提示', 'is-hint', function () {
      if (busy || over) return; var seq = solution(); if (!seq.length) { say('已經是復原狀態了！'); return; }
      hints++; var m = seq[0], nm = layerName(cube, m); sc.setView(HOME.yaw, HOME.pitch); hl = { a: m.a, l: m.l }; redraw();
      say('小獵：轉' + nm.where + '，' + nm.view + '（黃框那一層）'); P.track('game_hint', { id: SLUG });
      busy = true; setTimeout(function () { var t0 = performance.now(); (function pk(now) { var t = Math.min(1, ((now || performance.now()) - t0) / 650); redraw({ a: m.a, l: m.l, ang: m.s * Math.sin(Math.PI * t) * 0.55 }); if (t < 1) requestAnimationFrame(pk); else { busy = queue.length > 0; redraw(); if (!busy) { } else pump(); } })(t0); }, 350);
    });
    mk('🎯 回正視角', '', function () { sc.setView(HOME.yaw, HOME.pitch); });
    mk('🔀 新題', '', function () { if (busy && !over) return; again(); });

    /* 手勢：在貼紙上滑動＝轉那一層；其他地方交給 Scene 轉整顆 */
    sc.onDragStart = function (pos, e) {
      if (busy || over) return; var f = sc.pick(pos[0], pos[1]); if (!(f && f.sticker)) return;
      gesture = { start: pos, st: f.sticker, id: e.pointerId, done: false }; var cv = sc.canvas;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
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
      var up = function () { cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); gesture = null; };
      cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      return false;
    };

    state = { lose: lose, dispose: function () { timer.destroy(); over = true; queue = []; }, cube: cube, scr: scr, played: played, play: play, sc: sc, lv: lv, isSolved: function () { return isSolved(cube); }, solution: solution, busy: function () { return busy; }, over: function () { return over; }, hintsUsed: function () { return hints; } };
    window.__cube = state;

    /* 洗亂動畫，結束後才開始計時 */
    scr.forEach(function (m, i) { enqueue(m, true, i === scr.length - 1 ? function () { say(PG.cheer('start', rnd) + '（洗亂 ' + lv.scr + ' 步，題號 ' + seed + '）'); timer.start(); busy = false; } : null); });
    sh.toTop();
    P.track('game_start', { id: SLUG, level: lv.id, seed: seed });
  }

  menu();
  window.__cubeAPI = { makeCube: makeCube, applyMove: applyMove, isSolved: isSolved, rot90: rot90, scramble: scramble, inv: inv };
})();
