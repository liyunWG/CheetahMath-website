/* 獵豹玩中學｜遊戲：三視圖（正視、右視、上視）
   模型：H[d][x] ＝ 第 d 排（0＝最前排）、第 x 欄（0＝最左）的疊高。
     正視（從前面看）：每欄取最高 F[x]；右視（從右邊看，左邊是前排）：每排取最高 R[d]；上視：H>0 的格子（上方是後排）。
   題型：看 3D 選三視圖／看三視圖選 3D（暖身）、用三視圖蓋方塊（中等、困難）、最少／最多幾塊、補一塊（困難）。
   闖關制：3 條命，每題倒數計時，答對得分（剩餘時間＋連對加成），玩到沒命為止，題目由題號隨機產生。 */
(function () {
  'use strict';
  var P = Play, PG = PlayGame, D = Play3D, h = P.h, SLUG = 'game-views';
  var LV_COL = ['#7fb2ff', '#8de0b0', '#ffd979', '#ff9fbd'];
  var LEVELS = [
    { id: 'warm', name: '暖身', title: '看圖選三視圖', n: 3, hmax: 3, cmin: 4, cmax: 8, kinds: ['pickViews', 'pickModel'], time: { pickViews: 25, pickModel: 30 }, desc: '3×3・每題 <b>25～30 秒</b>・3 條命<br>3D ↔ 三視圖，四選一' },
    { id: 'mid', name: '中等', title: '用三視圖蓋方塊', n: 3, hmax: 3, cmin: 5, cmax: 12, kinds: ['build'], time: { build: 90 }, desc: '3×3・每題 <b>90 秒</b>・3 條命<br>點格子堆出符合三視圖的方塊' },
    { id: 'hard', name: '困難', title: '4×4 ＋ 變化題', n: 4, hmax: 4, cmin: 8, cmax: 18, kinds: ['build', 'count', 'fix'], time: { build: 150, count: 60, fix: 75 }, desc: '4×4・每題 <b>60～150 秒</b>・3 條命<br>重建、最少／最多幾塊、補一塊' }
  ];

  /* ------------------------------------------------ 幾何：由堆疊算三視圖 */
  function viewsOf(H, n, hmax) {
    var F = [], R = [], d, x;
    for (x = 0; x < n; x++) { F[x] = 0; for (d = 0; d < n; d++) F[x] = Math.max(F[x], H[d][x]); }
    for (d = 0; d < n; d++) { R[d] = 0; for (x = 0; x < n; x++) R[d] = Math.max(R[d], H[d][x]); }
    var front = [], right = [], top = [], y, r;
    for (y = hmax - 1; y >= 0; y--) { front.push(F.map(function (f) { return f > y; })); right.push(R.map(function (f) { return f > y; })); }
    for (r = 0; r < n; r++) top.push(H[n - 1 - r].map(function (v) { return v > 0; }));
    return { F: F, R: R, front: front, right: right, top: top };
  }
  function keyOf(V) { return JSON.stringify([V.front, V.right, V.top]); }
  function cloneH(H) { return H.map(function (r) { return r.slice(); }); }
  function total(H) { var s = 0; H.forEach(function (r) { r.forEach(function (v) { s += v; }); }); return s; }
  function genH(rnd, n, hmax, cmin, cmax) {
    for (var tries = 0; tries < 500; tries++) {
      var H = [], d, x, ok = true;
      for (d = 0; d < n; d++) { H[d] = []; for (x = 0; x < n; x++) H[d][x] = rnd() < 0.6 ? 1 + (rnd() < 0.5 ? 0 : rnd.int(hmax)) : 0; }
      var t = total(H); if (t < cmin || t > cmax) continue;
      for (d = 0; d < n; d++) if (Math.max.apply(null, H[d]) === 0) ok = false;
      for (x = 0; x < n; x++) { var m = 0; for (d = 0; d < n; d++) m = Math.max(m, H[d][x]); if (!m) ok = false; }
      if (ok) return H;
    }
    return [[1, 0, 0], [0, 2, 0], [0, 0, 1]].map(function (r) { return r.concat(Array(Math.max(0, n - 3)).fill(0)).slice(0, n); });
  }
  /* 給定三視圖（F、R、上視格），最多與最少要幾塊 */
  function bounds(V, n) {
    var cap = [], d, x, mx = 0;
    for (d = 0; d < n; d++) { cap[d] = []; for (x = 0; x < n; x++) { var occ = V.top[n - 1 - d][x]; cap[d][x] = occ ? Math.min(V.F[x], V.R[d]) : 0; mx += cap[d][x]; } }
    var items = [], i;
    for (x = 0; x < n; x++) items.push({ need: V.F[x], col: x, row: -1 });
    for (d = 0; d < n; d++) items.push({ need: V.R[d], col: -1, row: d });
    var hh = [], best = 1e9, occCount = 0;
    for (d = 0; d < n; d++) { hh[d] = []; for (x = 0; x < n; x++) { hh[d][x] = cap[d][x] > 0 ? 1 : 0; occCount += hh[d][x]; } }
    function sum() { var s = 0; for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) s += hh[a][b]; return s; }
    function go(k) {
      if (sum() >= best) return;
      if (k === items.length) { best = Math.min(best, sum()); return; }
      var it = items[k], cands = [], a;
      if (it.col >= 0) { for (a = 0; a < n; a++) if (cap[a][it.col] >= it.need) cands.push([a, it.col]); } else { for (a = 0; a < n; a++) if (cap[it.row][a] >= it.need) cands.push([it.row, a]); }
      cands.forEach(function (c) { var old = hh[c[0]][c[1]]; hh[c[0]][c[1]] = Math.max(old, it.need); go(k + 1); hh[c[0]][c[1]] = old; });
    }
    go(0); return { min: best, max: mx };
  }

  /* ------------------------------------------------ 畫：2D 視圖 */
  function gridSVG(rows, cell, mark) {
    var nr = rows.length, nc = rows[0].length, w = nc * cell, hh = nr * cell, s = h('svg', { viewBox: '0 0 ' + w + ' ' + hh, width: w, height: hh, class: 'pgm-vsvg', 'aria-hidden': 'true' }), r, c;
    for (r = 0; r < nr; r++) for (c = 0; c < nc; c++) {
      var st = mark ? mark(r, c) : (rows[r][c] ? 1 : 0), fill = st === 1 ? '#bcd6ff' : st === 3 ? '#ffd1dc' : '#ffffff', stroke = st === 2 ? '#d6336c' : '#122548';
      s.append(h('rect', { x: c * cell + 0.5, y: r * cell + 0.5, width: cell - 1, height: cell - 1, fill: fill, stroke: stroke, 'stroke-width': st === 2 ? 1.6 : 0.9, 'stroke-dasharray': st === 2 ? '3 2' : null }));
      if (st === 3) s.append(h('line', { x1: c * cell + 4, y1: r * cell + 4, x2: (c + 1) * cell - 4, y2: (r + 1) * cell - 4, stroke: '#d6336c', 'stroke-width': 1.6 }), h('line', { x1: (c + 1) * cell - 4, y1: r * cell + 4, x2: c * cell + 4, y2: (r + 1) * cell - 4, stroke: '#d6336c', 'stroke-width': 1.6 }));
    }
    return s;
  }
  function viewsRow(V, cell, cmp, labels) {
    var wrap = h('div', { class: 'pgm-views' }), items = [['正視', 'front'], ['右視', 'right'], ['上視', 'top']];
    items.forEach(function (it) {
      var g = V[it[1]], mark = null, ok = false;
      if (cmp) { var need = cmp.need[it[1]], have = cmp.have[it[1]]; ok = JSON.stringify(need) === JSON.stringify(have); mark = function (r, c) { var a = need[r][c], b = have[r][c]; return a && b ? 1 : a ? 2 : b ? 3 : 0; }; }
      wrap.append(h('div', { class: 'pgm-view' + (ok ? ' is-ok' : '') }, gridSVG(g, cell, mark), labels === false ? null : h('span', {}, it[0])));
    });
    return wrap;
  }

  /* ------------------------------------------------ 畫：3D 方塊堆 */
  function stackFaces(H, n) {
    var faces = [], d, x, y;
    for (d = 0; d < n; d++) for (x = 0; x < n; x++) for (y = 0; y < H[d][x]; y++) { D.cubeFaces(x, y, n - 1 - d, 1, LV_COL[y % 4]).forEach(function (f) { faces.push(f); }); }
    return faces;
  }
  function stackScene(host, n, hmax, opt) {
    opt = opt || {};
    var sc = new D.Scene(host, { aspect: opt.aspect || 1.1, scale: opt.scale || (n === 3 ? 52 : 44), cull: true, yaw: -0.72, pitch: 0.5, center: [n / 2, hmax * 0.38, n / 2], drag: opt.drag !== false, static: !!opt.static, width: opt.width, label: '方塊堆，可拖曳旋轉' });
    sc.light = [-0.3, 0.8, 0.5];
    sc.onPreRender = function (c, s) {
      var q = [[0, 0, 0], [n, 0, 0], [n, 0, n], [0, 0, n]].map(function (p) { return s.project(p); });
      c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (var i = 1; i < 4; i++) c.lineTo(q[i][0], q[i][1]); c.closePath(); c.fillStyle = '#f3efe6'; c.fill(); c.strokeStyle = '#cbbd9a'; c.lineWidth = 1.2; c.stroke();
      for (i = 1; i < n; i++) { var a = s.project([i, 0, 0]), b = s.project([i, 0, n]), e = s.project([0, 0, i]), f = s.project([n, 0, i]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.moveTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.strokeStyle = '#ddd2b6'; c.stroke(); }
    };
    if (!opt.noLabels) { sc.texts.push({ p: [n / 2, 0, n + 0.5], t: '前', color: '#d6336c', size: 14 }, { p: [n + 0.5, 0, n / 2], t: '右', color: '#2f6fdc', size: 14 }); }
    sc.faces = stackFaces(opt.H || [], n);
    sc.setH = function (H) { sc.faces = stackFaces(H, n); sc.invalidate(); };
    return sc;
  }

  /* ------------------------------------------------ 題目產生（同一個題號永遠同一題） */
  function distractorsFor(H, n, hmax, rnd, need, mk) {
    var out = [], seen = {}, base = keyOf(viewsOf(H, n, hmax)); seen[base] = 1;
    for (var t = 0; t < 400 && out.length < need; t++) {
      var H2 = cloneH(H), d = rnd.int(n), x = rnd.int(n), kind = rnd.int(4);
      if (kind === 3) { H2 = H2.map(function (r) { return r.slice().reverse(); }); }
      else { var delta = rnd() < 0.5 ? 1 : -1; var v = H2[d][x] + delta; if (v < 0 || v > hmax) v = H2[d][x] + (v < 0 ? 1 : -1); if (v < 0 || v > hmax) continue; H2[d][x] = v; }
      var V2 = viewsOf(H2, n, hmax), k = keyOf(V2); if (seen[k]) continue;
      var ok = true; for (var a = 0; a < n; a++) { if (Math.max.apply(null, H2[a]) === 0) ok = false; } if (!ok) continue;
      seen[k] = 1; out.push(mk ? mk(H2, V2) : { H: H2, V: V2 });
    }
    return out;
  }
  function makeQuestion(lv, kind, seed) {
    var rnd = PG.rng(seed), n = lv.n, hmax = lv.hmax, H = genH(rnd, n, hmax, lv.cmin, lv.cmax), V = viewsOf(H, n, hmax), Q = { kind: kind, H: H, V: V, n: n, hmax: hmax, rnd: rnd, seed: seed };
    if (kind === 'pickViews') {
      var ds = distractorsFor(H, n, hmax, rnd, 3), opts = ds.map(function (o) { return { H: o.H, V: o.V, ok: false }; }); opts.push({ H: H, V: V, ok: true }); Q.opts = rnd.shuffle(opts);
    } else if (kind === 'pickModel') {
      var ds2 = distractorsFor(H, n, hmax, rnd, 3), o2 = ds2.map(function (o) { return { H: o.H, V: o.V, ok: false }; }); o2.push({ H: H, V: V, ok: true }); Q.opts = rnd.shuffle(o2);
    } else if (kind === 'count') {
      var b = bounds(V, n), which = rnd() < 0.5 ? 'min' : 'max', ans = b[which], nums = [ans], cand = [ans - 2, ans - 1, ans + 1, ans + 2, ans + 3].filter(function (v) { return v >= (which === 'min' ? Math.max(1, b.min - 3) : b.min) && v !== ans; });
      cand = rnd.shuffle(cand); while (nums.length < 4 && cand.length) nums.push(cand.shift()); var z = 1; while (nums.length < 4) { if (nums.indexOf(ans + 3 + z) < 0) nums.push(ans + 3 + z); z++; }
      Q.which = which; Q.ans = ans; Q.bounds = b; Q.nums = rnd.shuffle(nums);
    } else if (kind === 'fix') {
      var cells = []; for (var d = 0; d < n; d++) for (var x = 0; x < n; x++) if (H[d][x] > 0) cells.push([d, x]);
      cells = rnd.shuffle(cells); var found = null;
      for (var i = 0; i < cells.length && !found; i++) { var H3 = cloneH(H); H3[cells[i][0]][cells[i][1]]--; if (keyOf(viewsOf(H3, n, hmax)) !== keyOf(V)) { var valid = []; for (var d2 = 0; d2 < n; d2++) for (var x2 = 0; x2 < n; x2++) { if (H3[d2][x2] + 1 > hmax) continue; var H4 = cloneH(H3); H4[d2][x2]++; if (keyOf(viewsOf(H4, n, hmax)) === keyOf(V)) valid.push([d2, x2]); } found = { H3: H3, valid: valid }; } }
      if (!found) return makeQuestion(lv, 'build', seed + 7919);
      Q.H3 = found.H3; Q.valid = found.valid;
    }
    return Q;
  }

  /* ------------------------------------------------ 遊戲畫面 */
  var sh, session = null;
  function menu() {
    if (session) { session.dispose(); session = null; }
    sh = sh || PG.shell({ title: '三視圖' });
    sh.right.innerHTML = ''; sh.body.innerHTML = '';
    PG.picker(sh.body, { slug: SLUG, levels: LEVELS, howto: '<b>怎麼玩</b>：<b>正視</b>＝從前面看、<b>右視</b>＝從右邊看（左邊是前排）、<b>上視</b>＝從上面看（上方是後排）。每題倒數計時，答錯或超時會少一條命，<b>3 條命用完</b>就結束；連續答對有加成。題目每次隨機，玩不完！',
      fmtBest: function (v) { return v + ' 分'; }, onPick: function (lv) { startSession(lv); } });
    sh.toTop();
  }

  function startSession(lv) {
    sh.body.innerHTML = ''; var base = PG.newSeed();
    var S = { lv: lv, hearts: 3, score: 0, q: 0, right: 0, combo: 0, locked: false, timer: null, bestCombo: 0, cur: null }, dead = false;
    var hearts = h('span', { class: 'pgm-hearts', 'aria-label': '剩餘生命' }), qnum = h('span', { class: 'pgm-chip' }, ''), score = h('span', { class: 'pgm-score' }, '0 分'), bar = h('div', { class: 'pgm-bar' }, hearts, qnum, score);
    var tbar = h('div', { class: 'pgm-timebar' }, h('i')), prompt = h('div', { class: 'pgm-prompt' }), area = h('div', { class: 'pgm-q' }), msg = h('div', { class: 'pgm-msg' }, ''), foot = h('div', { class: 'pgm-row2' });
    var skip = h('button', { type: 'button', class: 'pgm-act' }, '⏭ 跳過（−1 命）'); foot.append(skip);
    sh.body.append(bar, tbar, prompt, area, msg, foot);
    function drawHud() { hearts.textContent = '❤'.repeat(S.hearts) + '♡'.repeat(3 - S.hearts); qnum.textContent = lv.name + '・第 ' + S.q + ' 題' + (S.combo >= 2 ? '・連對 ' + S.combo : ''); score.textContent = S.score + ' 分'; }
    var tl = tbar.querySelector('i');
    function stopTimer() { if (S.timer) { S.timer.destroy(); S.timer = null; } }
    function next() {
      if (dead) return; S.q++; S.locked = false; msg.textContent = ''; area.innerHTML = ''; skip.style.display = ''; drawHud();
      var kind = PG.rng(base * 7 + S.q).pick(lv.kinds), Q = makeQuestion(lv, kind, base * 1000 + S.q); S.cur = Q;
      var lim = lv.time[kind]; tl.style.transform = 'scaleX(1)'; tbar.classList.remove('is-low');
      render(Q);
      S.timer = new PG.Timer({ limit: lim, onTick: function (rem) { tl.style.transform = 'scaleX(' + Math.max(0, rem / lim) + ')'; tbar.classList.toggle('is-low', rem <= 8); }, onEnd: function () { resolve(false, '時間到！', Q.reveal); } }); S.timer.start();
      Q.limit = lim;
    }
    function resolve(ok, why, reveal) {
      if (S.locked || dead) return; S.locked = true; var rem = S.timer ? S.timer.remaining() : 0; stopTimer(); skip.style.display = 'none';
      if (ok) {
        var gain = Math.round((100 + 2 * rem) * (1 + 0.1 * Math.min(S.combo, 10))); S.score += gain; S.combo++; S.right++; S.bestCombo = Math.max(S.bestCombo, S.combo); msg.textContent = '✓ +' + gain + ' 分　' + PG.cheer('good'); P.track('game_ok', { id: SLUG, level: lv.id, k: S.cur.kind });
      } else { S.hearts--; S.combo = 0; msg.textContent = (why || '再接再厲') + '　' + PG.cheer('bad'); if (reveal) reveal(); P.track('game_miss', { id: SLUG, level: lv.id, k: S.cur.kind }); }
      drawHud();
      setTimeout(function () { if (S.hearts <= 0) end(); else next(); }, ok ? 900 : 2000);
    }
    skip.addEventListener('click', function () { if (S.cur && S.cur.reveal) { resolve(false, '跳過了', S.cur.reveal); } else resolve(false, '跳過了'); });

    function end() {
      dead = true; stopTimer(); PG.markDone(SLUG); var isNew = PG.setBest(SLUG, lv.id, S.score, false), bv = PG.best(SLUG, lv.id);
      P.track('game_over', { id: SLUG, level: lv.id, score: S.score, right: S.right });
      PG.result(sh.body, { slug: SLUG, moduleName: '三視圖', win: S.right > 0, emoji: S.right >= 8 ? '🏆' : '🧱', title: S.right > 0 ? '挑戰結束！' : '再試一次吧', stars: S.score >= lv.n * 400 ? 3 : S.score >= lv.n * 180 ? 2 : S.right > 0 ? 1 : 0,
        lines: ['難度：' + lv.name + '（' + lv.title + '）', '答對 <b>' + S.right + '</b> 題・得分 <b>' + S.score + '</b>・最長連對 <b>' + S.bestCombo + '</b>'], best: { text: bv + ' 分', isNew: isNew }, cheer: PG.cheer(S.right > 0 ? 'win' : 'fail'),
        buttons: [{ text: '再玩一局（全新隨機題）', fn: function () { startSession(lv); } }, { text: '換難度', kind: 'ghost', fn: menu }],
        teaser: { title: '三視圖與「最少、最多幾塊」', q: '同一組三視圖可以對應很多種方塊堆，最少要幾塊、最多幾塊？怎麼不用硬湊就算出來？', where: 'J71S CH5 三視圖；PK 系列空間想像', lv: 'L2' } });
    }

    /* ---- 各題型的畫面 ---- */
    function render(Q) {
      var n = Q.n, hmax = Q.hmax, cell = n === 3 ? 16 : 13;
      if (Q.kind === 'pickViews') {
        prompt.textContent = '這個方塊堆的三視圖是哪一組？（可拖曳旋轉）';
        var host = h('div', { class: 'pgm-stage' }); area.append(host); stackScene(host, n, hmax, { H: Q.H, aspect: window.innerHeight < 700 ? 1.9 : 1.35, scale: n === 3 ? 50 : 42 });
        var grid = h('div', { class: 'pgm-opts' }); area.append(grid);
        Q.opts.forEach(function (o) { var b = h('button', { type: 'button', class: 'pgm-opt', 'aria-label': '選項' }, viewsRow(o.V, cell, null, false)); o.el = b; b.addEventListener('click', function () { if (S.locked) return; if (o.ok) { b.classList.add('is-right'); resolve(true); } else { b.classList.add('is-wrong'); resolve(false, '不是這組', function () { Q.opts.forEach(function (x) { if (x.ok) x.el.classList.add('is-right'); }); }); } }); grid.append(b); });
        area.append(h('div', { class: 'pgm-views pgm-legend' }, h('span', { class: 'pgm-legend__t' }, '每組由左到右：正視・右視・上視')));
        Q.reveal = function () { Q.opts.forEach(function (x) { if (x.ok) x.el.classList.add('is-right'); }); };
      } else if (Q.kind === 'pickModel') {
        prompt.textContent = '哪一個方塊堆符合這三張視圖？'; area.append(viewsRow(Q.V, n === 3 ? 22 : 18));
        var grid2 = h('div', { class: 'pgm-opts' }); area.append(grid2);
        Q.opts.forEach(function (o) {
          var hostO = h('div', { class: 'pgm-stage' }), b = h('button', { type: 'button', class: 'pgm-opt', 'aria-label': '方塊堆選項' }, hostO); o.el = b; grid2.append(b);
          stackScene(hostO, n, hmax, { H: o.H, aspect: 1.1, scale: n === 3 ? 44 : 36, width: window.innerHeight < 700 ? 116 : 140, drag: false, static: true, noLabels: true });
          b.addEventListener('click', function () { if (S.locked) return; if (o.ok) { b.classList.add('is-right'); resolve(true); } else { b.classList.add('is-wrong'); resolve(false, '不符合', function () { Q.opts.forEach(function (x) { if (x.ok) x.el.classList.add('is-right'); }); }); } });
        });
        Q.reveal = function () { Q.opts.forEach(function (x) { if (x.ok) x.el.classList.add('is-right'); }); };
      } else if (Q.kind === 'build') {
        prompt.innerHTML = '用<b>俯視格</b>點出每格的高度，讓<b>三視圖全部相符</b>（✓）';
        var mine = []; for (var d = 0; d < n; d++) { mine[d] = []; for (var x = 0; x < n; x++) mine[d][x] = 0; }
        var viewHost = h('div', {}); area.append(viewHost); area.append(h('div', { class: 'pgm-legend__t' }, '藍＝已相符　粉紅虛線＝還缺　✗＝多出來'));
        var row = h('div', { class: 'pgm-build' + (n === 4 ? ' pgm-build--4' : '') }), scHost = h('div', { class: 'pgm-stage' }), gw = h('div', { class: 'pgm-gridwrap' }), gridEl = h('div', { class: 'pgm-grid', style: { gridTemplateColumns: 'repeat(' + n + ',' + (n === 3 ? 48 : 44) + 'px)' } });
        row.append(scHost, gw); gw.append(h('span', {}, '後'), gridEl, h('span', {}, '前')); area.append(row);
        var sc = stackScene(scHost, n, hmax, { H: mine, aspect: 1, scale: n === 3 ? 46 : 50 }), cells = [];
        function refresh() {
          var V2 = viewsOf(mine, n, hmax); viewHost.innerHTML = ''; viewHost.append(viewsRow({ front: Q.V.front, right: Q.V.right, top: Q.V.top }, n === 3 ? 18 : 15, { need: Q.V, have: V2 }));
          for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) { var v = mine[n - 1 - r][c], el = cells[r][c]; el.textContent = v ? v : ''; el.className = 'pgm-cell' + (v ? ' h' + v : ''); }
          sc.setH(mine); return keyOf(V2) === keyOf(Q.V);
        }
        for (var r = 0; r < n; r++) { cells[r] = []; for (var c = 0; c < n; c++) (function (r, c) { var b = h('button', { type: 'button', class: 'pgm-cell', 'aria-label': '第 ' + (r + 1) + ' 列第 ' + (c + 1) + ' 格' }); cells[r][c] = b; gridEl.append(b); b.addEventListener('click', function () { if (S.locked) return; var dd = n - 1 - r; mine[dd][c] = (mine[dd][c] + 1) % (hmax + 1); if (refresh()) resolve(true); }); })(r, c); }
        refresh(); Q.mine = mine;
        Q.reveal = function () { for (var a = 0; a < n; a++) for (var b2 = 0; b2 < n; b2++) mine[a][b2] = Q.H[a][b2]; refresh(); msg.textContent += '（上面是參考答案之一）'; };
      } else if (Q.kind === 'count') {
        prompt.innerHTML = '這組三視圖，方塊堆<b>' + (Q.which === 'min' ? '最少' : '最多') + '</b>要幾塊？'; area.append(viewsRow(Q.V, 22));
        area.append(h('div', { class: 'pgm-views pgm-legend' }, h('span', { class: 'pgm-legend__t' }, '提示：上視決定哪些格有方塊；正視、右視限制每格最多多高')));
        var grid3 = h('div', { class: 'pgm-opts' }); area.append(grid3); Q.els = [];
        Q.nums.forEach(function (v) { var b = h('button', { type: 'button', class: 'pgm-opt pgm-opt--num' }, v + ' 塊'); Q.els.push([v, b]); grid3.append(b); b.addEventListener('click', function () { if (S.locked) return; if (v === Q.ans) { b.classList.add('is-right'); resolve(true); } else { b.classList.add('is-wrong'); resolve(false, '答案是 ' + Q.ans + ' 塊', Q.reveal); } }); });
        Q.reveal = function () { Q.els.forEach(function (p) { if (p[0] === Q.ans) p[1].classList.add('is-right'); }); };
      } else if (Q.kind === 'fix') {
        prompt.innerHTML = '少了<b>一塊</b>！點<b>俯視格</b>補上一塊，讓三視圖全部相符';
        area.append(viewsRow(Q.V, n === 3 ? 18 : 15));
        var row3 = h('div', { class: 'pgm-build' + (n === 4 ? ' pgm-build--4' : '') }), scHost3 = h('div', { class: 'pgm-stage' }), gw3 = h('div', { class: 'pgm-gridwrap' }), g3 = h('div', { class: 'pgm-grid', style: { gridTemplateColumns: 'repeat(' + n + ',' + (n === 3 ? 48 : 44) + 'px)' } }); row3.append(scHost3, gw3); gw3.append(h('span', {}, '後'), g3, h('span', {}, '前')); area.append(row3);
        var sc3 = stackScene(scHost3, n, hmax, { H: Q.H3, aspect: 1, scale: n === 3 ? 46 : 50 }), cur = cloneH(Q.H3); Q.cells = [];
        for (var r3 = 0; r3 < n; r3++) { Q.cells[r3] = []; for (var c3 = 0; c3 < n; c3++) (function (r3, c3) { var v = Q.H3[n - 1 - r3][c3], b = h('button', { type: 'button', class: 'pgm-cell' + (v ? ' h' + v : ''), 'aria-label': '補在第 ' + (r3 + 1) + ' 列第 ' + (c3 + 1) + ' 格' }, v ? String(v) : ''); Q.cells[r3][c3] = b; g3.append(b);
          b.addEventListener('click', function () { if (S.locked) return; var dd = n - 1 - r3, good = Q.valid.some(function (p) { return p[0] === dd && p[1] === c3; }); cur[dd][c3] = Math.min(hmax, cur[dd][c3] + 1); sc3.setH(cur); b.textContent = cur[dd][c3]; b.className = 'pgm-cell h' + cur[dd][c3]; if (good) resolve(true); else resolve(false, '補在那裡三視圖還是不符', Q.reveal); }); })(r3, c3); }
        Q.reveal = function () { Q.valid.forEach(function (p) { Q.cells[n - 1 - p[0]][p[1]].classList.add('is-hint'); }); };
      }
    }
    session = { dispose: function () { dead = true; stopTimer(); } };
    P.track('game_start', { id: SLUG, level: lv.id }); sh.toTop(); next();
    window.__views = { S: S, resolve: resolve, next: next };
  }

  window.__viewsAPI = { viewsOf: viewsOf, keyOf: keyOf, genH: genH, bounds: bounds, makeQuestion: makeQuestion, LEVELS: LEVELS, cloneH: cloneH };
  menu();
})();
