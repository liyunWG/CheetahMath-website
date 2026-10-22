/* 獵豹玩中學｜遊戲：三視圖（玩法與畫面移植自「獵豹數學奇幻之旅」第 13 關 L13_views.html）
   用積木在 3×3 地板上拼出「前視圖、右視圖、上視圖」三個方向看起來都對的立體；任何符合的立體都算對。
   規則庫 Views（views／compare／solutions／starsFor…）見 views-rules.js（原版原封搬入）；題目由 ViewsGen 依題號隨機產生。
   手機一屏版面：三張小目標圖＋計時、3D 場景（左側浮動視角鈕）、號碼鍵＋放／拿切換、返回上一步＋交卷，全部同屏；
   次要功能（全部清除以外的重來、換一題、練習／計時切換、拿走選取的）收在「⋯」小面板。
   操作：放積木模式下，點 3D 地板的格子（或那一疊任一顆）就在那格疊一顆；拿積木模式下點那一疊就拿走最上面一顆；
        按住最上面那顆拖到別格＝搬走；長按一疊＝選取（再點另一格搬過去）；拖空白處＝轉視角。 */
(function () {
  'use strict';
  var P = Play, PG = PlayGame, h = P.h, V = window.Views, G = V.Gen, SLUG = 'game-views', ns = 'http://www.w3.org/2000/svg';
  var LEVELS = [
    { id: 'warm', name: '暖身', title: '6 顆積木', li: 0, desc: '6 顆積木・3 星 60 秒內<br>先用練習熟悉，再挑戰計時' },
    { id: 'mid', name: '中等', title: '9 顆積木', li: 1, desc: '9 顆積木・3 星 120 秒內<br>塔有高有低，要看三個方向' },
    { id: 'hard', name: '困難', title: '12 顆積木', li: 2, desc: '12 顆積木・3 星 180 秒內<br>會有很多種拼法，找出一種就對' }
  ];
  var LAYER = [[239, 159, 39], [93, 202, 165], [133, 183, 235], [175, 169, 236]];   // 每一層一種顏色，高度好數
  var D2R = Math.PI / 180, DEF_ANG = -35 * D2R, DEF_PITCH = 30 * D2R, N = 3, H = 3, LONG_MS = 420;

  function el(n, a, p) { var e = document.createElementNS(ns, n); for (var k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; }
  function rgb(c, f) { return 'rgb(' + Math.round(c[0] * f) + ',' + Math.round(c[1] * f) + ',' + Math.round(c[2] * f) + ')'; }
  function attr(t, k) { return t && t.getAttribute ? t.getAttribute(k) : null; }
  function statKey(id) { return 'game:' + SLUG + ':stat:' + id; }
  function stats(id) { var s = P.store.get(statKey(id), null); return s || { n: 0, stars: 0 }; }

  /* 畫一個立體（正交投影，a＝水平轉角，pt＝仰角：30° 是一般視角、0° 正前方、90° 正上方）。
     積木半透明，地板號碼看得到；只畫朝向觀察者、且沒有被鄰居擋住的面。（原版 scene() 原封移植） */
  function scene(svg, items, a, pt, s, ox, oy, o) {
    svg.innerHTML = ''; o = o || {};
    var cs = Math.cos(a), sn = Math.sin(a), CP = Math.cos(pt), SP = Math.sin(pt), cx = N / 2, cy = N / 2;
    function P3(x, y, z) { var X = x - cx, Y = y - cy, xr = X * cs - Y * sn, yr = X * sn + Y * cs; return [ox + xr * s, oy - (z * CP + yr * SP) * s, yr * CP - z * SP]; }
    function poly(pts, at) { at.points = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); return el('polygon', at, svg); }
    var i, p;
    for (i = 0; i < 9; i++) {
      p = V.xy(i);
      var fill = o.hover === i ? (o.hoverOk ? '#ffe08a' : '#f4b6b6') : '#fff';
      poly([P3(p[0], p[1], 0), P3(p[0] + 1, p[1], 0), P3(p[0] + 1, p[1] + 1, 0), P3(p[0], p[1] + 1, 0)], { fill: fill, stroke: '#bbb', 'stroke-width': 1, 'data-col': i });
    }
    if (o.floor) {
      for (i = 0; i < 9 && pt > 0.2; i++) { p = V.xy(i); var c0 = P3(p[0] + 0.5, p[1] + 0.5, 0);
        var n0 = el('text', { x: c0[0], y: c0[1] + 8, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 'bold', fill: 'rgba(0,0,0,0.3)', 'pointer-events': 'none' }, svg); n0.textContent = i + 1; }
      [['前', N / 2, -0.75], ['後', N / 2, N + 0.75], ['左', -0.75, N / 2], ['右', N + 0.75, N / 2]].forEach(function (q) {
        var pp = P3(q[1], q[2], 0), t = el('text', { x: pp[0], y: pp[1] + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 'bold', fill: '#666', 'pointer-events': 'none' }, svg);
        t.textContent = q[0];
      });
    }
    var occ = {}; items.forEach(function (it) { if (!it.ghost) occ[it.c.join(',')] = 1; });
    var FACES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]];
    items.map(function (it) { var c = it.c; return { it: it, d: P3(c[0] + 0.5, c[1] + 0.5, c[2] + 0.5)[2] }; })
      .sort(function (u, v) { return v.d - u.d; })
      .forEach(function (ob) {
        var it = ob.it, x = it.c[0], y = it.c[1], z = it.c[2];
        FACES.forEach(function (n) {
          if (!it.ghost && occ[[x + n[0], y + n[1], z + n[2]].join(',')]) return;
          if ((n[0] * sn + n[1] * cs) * CP - n[2] * SP >= 0) return;
          var q;
          if (n[0]) { var fx = x + (n[0] > 0 ? 1 : 0); q = [P3(fx, y, z), P3(fx, y + 1, z), P3(fx, y + 1, z + 1), P3(fx, y, z + 1)]; }
          else if (n[1]) { var fy = y + (n[1] > 0 ? 1 : 0); q = [P3(x, fy, z), P3(x + 1, fy, z), P3(x + 1, fy, z + 1), P3(x, fy, z + 1)]; }
          else q = [P3(x, y, z + 1), P3(x + 1, y, z + 1), P3(x + 1, y + 1, z + 1), P3(x, y + 1, z + 1)];
          var at = { fill: rgb(it.col, n[2] ? 1 : n[0] ? 0.82 : 0.66), 'fill-opacity': 0.62, stroke: rgb(it.col, 0.36), 'stroke-width': 1.4, 'stroke-linejoin': 'round' };
          if (it.ghost) { at['fill-opacity'] = 0.45; at.stroke = '#D85A30'; at['stroke-width'] = 2.4; at['stroke-dasharray'] = '5 3'; at['pointer-events'] = 'none'; }
          else if (it.i !== undefined) { at['data-col'] = it.i; if (it.top) at['data-top'] = 1; }
          if (it.sel) { at.stroke = '#e8a600'; at['stroke-width'] = 3.4; at['fill-opacity'] = 0.85; }
          poly(q, at);
        });
      });
    // 每疊最上面的編號圓牌最後畫，永遠不會被擋住
    if (o.tags && pt > 0.2) o.tags.forEach(function (tg) {
      var p0 = V.xy(tg.i), c1 = P3(p0[0] + 0.5, p0[1] + 0.5, tg.h);
      el('circle', { cx: c1[0], cy: c1[1], r: 11, fill: '#fff', 'fill-opacity': 0.92, stroke: '#1f3a5f', 'stroke-width': 1.5, 'data-col': tg.i, 'data-top': 1 }, svg);
      var tt = el('text', { x: c1[0], y: c1[1] + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 'bold', fill: '#1f3a5f', 'pointer-events': 'none' }, svg); tt.textContent = tg.i + 1;
    });
  }

  var sh, session = null;
  /* 舊版（選擇題闖關）用同一個鍵存的是「分數、越高越好」，新版存「用時秒數、越低越好」，第一次載入時清掉舊紀錄 */
  (function migrate() { if (!P.store.get('game:' + SLUG + ':v2', false)) { ['warm', 'mid', 'hard'].forEach(function (id) { try { localStorage.removeItem('cheetah-play:game:' + SLUG + ':best:' + id); } catch (e) {} }); P.store.set('game:' + SLUG + ':v2', true); } })();
  function menu() {
    if (session) { session.dispose(); session = null; }
    sh = sh || PG.shell({ title: '三視圖' });
    sh.card.classList.remove('pgv-card');
    sh.right.innerHTML = ''; sh.body.innerHTML = '';
    PG.picker(sh.body, { slug: SLUG, levels: LEVELS,
      howto: '<b>怎麼玩</b>：看上面<b>三張目標視圖</b>（前視圖、右視圖、上視圖），用積木在 3×3 地板上拼出一個「三個方向看起來都對」的立體，按<b>交卷</b>比對。<b>任何符合的立體都算對</b>。題目每次隨機（有題號），玩不完！',
      fmtBest: function (b, lv) { var s = stats(lv.id); return s.n || b !== null ? '已解 ' + s.n + ' 題' + (b !== null ? '・最佳 ' + PG.fmt(b) + '・' + PG.stars(s.stars) : '') : '還沒有紀錄'; },
      onPick: function (lv) { start(lv); } });
    sh.toTop();
  }

  function start(lv) {
    if (session) session.dispose();
    sh.body.innerHTML = ''; sh.card.classList.add('pgv-card');
    var li = lv.li, qno = PG.rng(Date.now() & 0xffffff).int(9000) + 1, Z = null, TGT = null, prevKey = null, timedMode = true;
    var hts = V.zeros(), sel = null, mode = 'add', ang = DEF_ANG, pitch = DEF_PITCH, sec = 0, timer = null, wrong = 0, over = false, down = null, drag = null, tween = null, hist = [], fullMsg = '';
    var ref = {};

    /* ---- 畫面骨架（由上到下：目標圖＋計時、3D 場景、號碼鍵＋放／拿、返回＋交卷、訊息） ---- */
    var qChip = h('div', { class: 'pgv-q' }), timeChip = h('div', { class: 'pgv-time' }, '0:00'), cnt = h('span', { class: 'pgv-cnt' }), moreBtn = h('button', { type: 'button', class: 'pgv-more', 'aria-label': '更多功能', 'aria-expanded': 'false' }, '⋯');
    var vw = h('div', { class: 'pgv-vw' }); ['vf', 'vr', 'vt'].forEach(function (id) { var s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 170 210'); ref[id] = s; vw.append(s); });
    var top = h('div', { class: 'pgv-top' }, vw, h('div', { class: 'pgv-info' }, qChip, timeChip, h('div', { class: 'pgv-info2' }, cnt, moreBtn)));
    var sc = document.createElementNS(ns, 'svg'); sc.setAttribute('viewBox', '45 10 330 330'); sc.setAttribute('class', 'pgv-sc'); sc.setAttribute('aria-label', '積木場景：點格子放積木，按住最上面的積木拖到別格，拖空白處轉視角');
    var vB = {}, vbtns = h('div', { class: 'pgv-vbtns' }); [['vF', '前視角'], ['vR', '右視角'], ['vT', '上視角'], ['vO', '還原']].forEach(function (p) { var b = h('button', { type: 'button', class: 'pgv-view ' + p[0] }, p[1]); vB[p[0]] = b; vbtns.append(b); });
    var thLine = h('small', {}), bMode = h('button', { type: 'button' }), bRe = h('button', { type: 'button' }, '↻ 重來這一題'), bSwap = h('button', { type: 'button' }, '⟳ 換一題'), bTake = h('button', { type: 'button' }, '拿走選取的');
    var pop = h('div', { class: 'pgv-pop', hidden: true }, thLine, bMode, bRe, bSwap, bTake);
    var scwrap = h('div', { class: 'pgv-scwrap' }, sc, vbtns, pop);
    var keys = [], keyGrid = h('div', { class: 'pgv-keys' });
    for (var k = 0; k < 9; k++) (function (i) { var b = h('button', { type: 'button', class: 'pgv-key', 'aria-label': i + 1 + ' 號格' }); b.onclick = function () { pressKey(i); }; keys.push(b); keyGrid.append(b); })(k);
    var mAdd = h('button', { type: 'button', class: 'pgv-m on' }, '＋ 放積木'), mRem = h('button', { type: 'button', class: 'pgv-m' }, '－ 拿積木'), bClr = h('button', { type: 'button', class: 'pgv-clr' }, '全部清除');
    var pad = h('div', { class: 'pgv-pad' }, keyGrid, h('div', { class: 'pgv-side' }, mAdd, mRem, bClr));
    var bUndo = h('button', { type: 'button', class: 'pgv-btn pgv-undo' }, '↶ 返回上一步'), bSub = h('button', { type: 'button', class: 'pgv-btn pgv-sub' }, '✓ 交卷');
    var msg = h('div', { class: 'pgv-msg', 'aria-live': 'polite', title: '點一下看完整訊息' });
    sh.body.append(top, scwrap, pad, h('div', { class: 'pgv-acts' }, bUndo, bSub), msg);

    function say(t, kind) { fullMsg = t; msg.textContent = t; msg.className = 'pgv-msg' + (kind ? ' is-' + kind : ''); }
    msg.onclick = function () { if (fullMsg && msg.scrollWidth > msg.clientWidth) P.toast(fullMsg); };
    function timed() { return timedMode; }
    function snap() { hist.push({ h: hts.slice(), sel: sel }); if (hist.length > 200) hist.shift(); }
    function stopTimer() { clearInterval(timer); timer = null; }
    function startTimer() {   // 第一步動作時才開始，而且只有計時挑戰
      if (timer || over || !timed()) return;
      timer = setInterval(function () {
        sec++;
        if (V.chargedTime(sec, wrong) > Z.times[2]) { over = true; stopTimer(); sel = null; drag = null; say('時間到，這一題沒有完成', 'bad'); lose(); }
        draw();
      }, 1000);
    }
    function acted() { startTimer(); }
    function closePop() { pop.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); }
    moreBtn.onclick = function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; moreBtn.setAttribute('aria-expanded', pop.hidden ? 'false' : 'true'); draw(); };
    pop.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    document.addEventListener('pointerdown', onDocDown, true);
    function onDocDown(e) { if (!pop.hidden && !pop.contains(e.target) && e.target !== moreBtn) closePop(); }

    /* ---- 畫 ---- */
    function hoverOk(c) { return c !== null && drag && c !== drag.col && hts[c] < H; }
    function draw() {
      var dr = drag && drag.on, hh = hts.slice(); if (dr) hh[drag.col]--;
      var items = [], tags = [], i, z, p;
      for (i = 0; i < 9; i++) {
        p = V.xy(i);
        for (z = 0; z < hh[i]; z++) items.push({ c: [p[0], p[1], z], col: LAYER[z], i: i, top: z === hh[i] - 1, sel: !dr && sel === i && z === hh[i] - 1 });
        if (hh[i] > 0) tags.push({ i: i, h: hh[i] });
      }
      var hv = dr ? drag.hover : null;
      if (dr && hoverOk(hv)) { p = V.xy(hv); items.push({ c: [p[0], p[1], hh[hv]], col: LAYER[hh[hv]], ghost: true }); }
      var cp = Math.cos(pitch);
      scene(sc, items, ang, pitch, 56, 210, 185 + 55 * cp, { floor: true, tags: tags, hover: dr ? hv : undefined, hoverOk: dr && hoverOk(hv) });
      if (dr) {   // 搬在手上的那顆跟著手指
        var g = el('g', { 'pointer-events': 'none', transform: 'translate(' + drag.px.toFixed(1) + ',' + (drag.py - 18).toFixed(1) + ')' }, sc);
        var col = LAYER[Math.max(0, hts[drag.col] - 1)];
        el('polygon', { points: '0,-16 18,-8 0,0 -18,-8', fill: rgb(col, 1), 'fill-opacity': 0.8, stroke: rgb(col, 0.36), 'stroke-width': 2 }, g);
        el('polygon', { points: '-18,-8 0,0 0,20 -18,12', fill: rgb(col, 0.66), 'fill-opacity': 0.8, stroke: rgb(col, 0.36), 'stroke-width': 2 }, g);
        el('polygon', { points: '18,-8 0,0 0,20 18,12', fill: rgb(col, 0.82), 'fill-opacity': 0.8, stroke: rgb(col, 0.36), 'stroke-width': 2 }, g);
      }
      for (i = 0; i < 9; i++) {
        var b = keys[i]; b.innerHTML = '<b>' + (i + 1) + '</b><small>' + (hts[i] ? '高 ' + hts[i] + (hts[i] >= H ? '（滿）' : '') : '空') + '</small>';
        b.className = 'pgv-key' + (sel === i ? ' sel' : '') + (mode === 'rem' ? (hts[i] ? ' rem' : '') : (hts[i] ? ' has' : '')); b.disabled = over;
      }
      mAdd.className = 'pgv-m' + (mode === 'add' ? ' on' : ''); mRem.className = 'pgv-m' + (mode === 'rem' ? ' on rem' : '');
      bTake.disabled = over || sel === null; bUndo.disabled = over || !hist.length; bClr.disabled = over; bSub.disabled = over; mAdd.disabled = over; mRem.disabled = over;
      cnt.textContent = '桌上 ' + V.total(hts) + ' 顆' + (sel !== null ? '・已選 ' + (sel + 1) + ' 號' : '');
      var T = Z.times, ch = V.chargedTime(sec, wrong);
      qChip.textContent = lv.name + '・題號 ' + qno;
      if (timed()) { timeChip.textContent = '⏱ ' + PG.fmt(ch) + (wrong ? '（+' + V.PENALTY * wrong + '）' : '') + ' / ' + PG.fmt(T[2]); timeChip.classList.toggle('is-low', ch > T[1]); }
      else { timeChip.textContent = '📖 練習・不計時'; timeChip.classList.remove('is-low'); }
      bMode.textContent = timed() ? '切換成「練習」（不計時、不給星）' : '切換成「計時挑戰」';
      thLine.textContent = timed() ? '3 星 ' + PG.fmt(T[0]) + ' 內｜2 星 ' + PG.fmt(T[1]) + ' 內｜1 星 ' + PG.fmt(T[2]) + ' 內｜交卷錯一次加 ' + V.PENALTY + ' 秒' : '練習模式：不計時、不給星。切換成計時挑戰後，放第一顆積木時開始計時';
    }
    function target(svg, rows, cap, name, colr) {
      svg.innerHTML = ''; var C = 50, x0 = 10, y0 = 30;
      el('rect', { x: 1.5, y: 1.5, width: 167, height: 207, rx: 10, fill: 'none', stroke: colr, 'stroke-width': 4 }, svg);
      var t0 = el('text', { x: 85, y: 22, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 'bold', fill: colr }, svg); t0.textContent = name;
      rows.forEach(function (r, j) { for (var i = 0; i < N; i++) el('rect', { x: x0 + i * C, y: y0 + j * C, width: C, height: C, fill: r.charAt(i) === '#' ? '#6f6d66' : '#fff', stroke: '#bbb', 'stroke-width': 1 }, svg); });
      var t = el('text', { x: 85, y: 200, 'text-anchor': 'middle', 'font-size': 14, fill: '#666' }, svg); t.textContent = cap;
    }

    /* ---- 載入題目（同一題號永遠同一題；與上一題相同就往下一個題號） ---- */
    function load(q, quiet, reuse) {
      qno = q; stopTimer(); removeOv(); closePop();
      if (!reuse) { Z = G.generate(li, qno); while (prevKey && Z.key === prevKey) { qno++; Z = G.generate(li, qno); } prevKey = Z.key; }
      TGT = Z.target; hts = V.zeros(); sel = null; drag = null; hist = []; sec = 0; wrong = 0; over = false; ang = DEF_ANG; pitch = DEF_PITCH;
      target(ref.vf, TGT.front, '左　右', '前視圖', '#2da44e'); target(ref.vr, TGT.right, '前　後', '右視圖', '#1677d6'); target(ref.vt, TGT.top, '下＝前', '上視圖', '#e0a000');
      if (!quiet) say('點格子或按號碼放積木，目標是三張圖都對');
      draw(); P.track('game_load', { id: SLUG, level: lv.id, q: qno });
    }

    /* ---- 動作（每個都是「返回上一步」的一步） ---- */
    function addAt(i) { var n = V.add(hts, i, H); if (!n) { say(String(i + 1) + ' 號格已經疊到最高（' + H + ' 顆）', 'bad'); return; } snap(); hts = n; sel = null; acted(); say('在 ' + (i + 1) + ' 號格放了一顆，現在高 ' + hts[i]); draw(); }
    function removeAt(i) { var n = V.removeTop(hts, i); if (!n) { say(String(i + 1) + ' 號格是空的，沒有積木可拿', 'bad'); return; } snap(); hts = n; sel = null; acted(); say('拿走了 ' + (i + 1) + ' 號格最上面的一顆'); draw(); }
    function moveTo(from, to) {
      if (from === to) { sel = null; say('取消選取'); draw(); return; }
      var n = V.moveTop(hts, from, to, H); if (!n) { say(String(to + 1) + ' 號格已經疊到最高，搬不上去', 'bad'); return; }
      snap(); hts = n; sel = null; acted(); say('把 ' + (from + 1) + ' 號格最上面的積木搬到 ' + (to + 1) + ' 號格'); draw();
    }
    function pressKey(i) { if (over) return; if (mode === 'rem') removeAt(i); else if (sel !== null) moveTo(sel, i); else addAt(i); }
    mAdd.onclick = function () { mode = 'add'; say('放積木：點格子或按號碼放一顆'); draw(); };
    mRem.onclick = function () { mode = 'rem'; sel = null; say('拿積木：點那一疊或按號碼，拿走最上面一顆'); draw(); };
    bTake.onclick = function () { closePop(); if (over || sel === null) return; removeAt(sel); };
    bClr.onclick = function () { if (over) return; if (!V.total(hts)) { say('桌上本來就是空的', 'bad'); return; } snap(); hts = V.zeros(); sel = null; acted(); say('全部清除了，按「返回上一步」可救回'); draw(); };
    bUndo.onclick = function () { if (over) return; if (!hist.length) { say('還沒有可以返回的步驟', 'bad'); return; } var s = hist.pop(); hts = s.h; sel = null; say('返回上一步'); draw(); };
    bRe.onclick = function () { closePop(); load(qno, true, true); say('重新開始這一題'); };
    bSwap.onclick = function () { closePop(); load(PG.rng(Date.now() & 0xffffff).int(9000) + 1, false); };
    bMode.onclick = function () { closePop(); timedMode = !timedMode; load(qno, true, true); say(timed() ? '計時挑戰：放第一顆積木時開始計時' : '練習模式：不計時、不給星'); };

    /* ---- 結算：蓋在場景上的小卡（下一題、換一題、換難度、問老師），控制仍留在畫面內 ---- */
    var ovEl = null;
    function removeOv() { if (ovEl) { ovEl.remove(); ovEl = null; } }
    function overlay(o) {
      removeOv(); closePop();
      var btns = h('div', { class: 'btns' });
      o.buttons.forEach(function (b) { btns.append(h('button', { type: 'button', class: b.go ? 'go' : '', onclick: b.fn }, b.text)); });
      ovEl = h('div', { class: 'pgv-ov', role: 'dialog', 'aria-label': o.title }, h('div', { class: 'hd' }, h('h3', {}, (o.emoji || '') + ' ' + o.title), o.stars !== undefined ? h('div', { class: 'st' }, PG.stars(o.stars)) : null), o.lines.map(function (l) { return h('p', { html: l }); }), btns);
      scwrap.append(ovEl);
    }
    function askLine() { P.track('cta_click', { id: SLUG }); P.askTeacher('老師您好，我的孩子剛玩了「獵豹玩中學」的遊戲「三視圖」，想了解適合的班級與試聽方式。（來源：獵豹玩中學／' + SLUG + '）'); }

    bSub.onclick = function () {
      if (over) return;
      if (!V.total(hts)) { say('桌上還沒有積木，不能交卷', 'bad'); return; }
      var c = V.compare(V.views(V.cubesOf(hts), N, H), TGT);
      var line = '前視圖' + (c.front ? '符合' : '不符') + '、右視圖' + (c.right ? '符合' : '不符') + '、上視圖' + (c.top ? '符合' : '不符');
      if (c.ok) {
        over = true; stopTimer(); sel = null; drag = null;
        var sols = V.solutions(TGT, N, H), used = V.total(hts), lo = 99, hi = 0;
        sols.forEach(function (s) { var n = V.total(s); lo = Math.min(lo, n); hi = Math.max(hi, n); });
        var reveal = sols.length > 1 ? '這題共有 ' + sols.length + ' 種拼法，最少 ' + lo + ' 顆、最多 ' + hi + ' 顆，你用了 ' + used + ' 顆' : '這題只有一種拼法，共 ' + used + ' 顆';
        var s = stats(lv.id), t = V.chargedTime(sec, wrong), gr = timed() ? V.starsFor(sec, wrong, Z.times) : 0, isNew = false; s.n++;
        if (timed()) { s.stars = Math.max(s.stars || 0, gr); isNew = PG.setBest(SLUG, lv.id, t, true); }
        P.store.set(statKey(lv.id), s); PG.markDone(SLUG); P.track('game_win', { id: SLUG, level: lv.id, q: qno, t: t, stars: gr, wrong: wrong });
        say('交卷成功！' + reveal, 'good');
        var bv = PG.best(SLUG, lv.id);
        overlay({ title: '交卷成功！', emoji: '🧱', stars: timed() ? gr : undefined,
          lines: [reveal, (timed() ? '用時 <b>' + PG.fmt(t) + '</b>' + (wrong ? '（交卷錯 ' + wrong + ' 次，含罰時）' : '') + (bv !== null ? '・最佳 ' + PG.fmt(bv) + (isNew ? ' 🎉新紀錄' : '') : '') : '練習模式不計時、不給星') + '・已解 ' + s.n + ' 題'],
          buttons: [{ text: '下一題 ▶', go: true, fn: function () { load(qno + 1, false); } }, { text: '換一題', fn: function () { bSwap.onclick(); } }, { text: '換難度', fn: menu }, { text: '問老師：適合哪班？', fn: askLine }] });
      } else { wrong++; say('交卷：' + line + (timed() ? '，加罰 ' + V.PENALTY + ' 秒' : ''), 'bad'); }
      draw();
    };
    function lose() {
      PG.markDone(SLUG); P.track('game_timeout', { id: SLUG, level: lv.id, q: qno });
      overlay({ title: '時間到！', emoji: '⏰', lines: ['這一題沒有在時限內完成。', '可以先切換成練習模式慢慢拼。'],
        buttons: [{ text: '重來這一題', go: true, fn: function () { bRe.onclick(); } }, { text: '換一題', fn: function () { bSwap.onclick(); } }, { text: '換難度', fn: menu }, { text: '問老師：適合哪班？', fn: askLine }] });
    }

    /* ---- 看四周（場景左側浮動按鈕） ---- */
    function goView(a, p) {
      clearInterval(tween);
      var a0 = ang, p0 = pitch, da = (((a - a0) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI, n = 0;
      tween = setInterval(function () { n++; var f = n / 8; f = 1 - (1 - f) * (1 - f); ang = a0 + da * f; pitch = p0 + (p - p0) * f; draw(); if (n >= 8) clearInterval(tween); }, 30);
    }
    vB.vF.onclick = function () { goView(0, 0); say('從正前方看：這就是「前視圖」的方向'); };
    vB.vR.onclick = function () { goView(-90 * D2R, 0); say('從右邊看：這就是「右視圖」的方向（前面在左邊）'); };
    vB.vT.onclick = function () { goView(0, 90 * D2R); say('從正上方看：這就是「上視圖」的方向（前面在下方）'); };
    vB.vO.onclick = function () { goView(DEF_ANG, DEF_PITCH); say('回到一般的斜角視角'); };

    /* ---- 手勢：點一下＝依模式放／拿；按住最上面那顆拖到別格＝搬走；長按一疊＝選取；按別處拖＝轉視角 ---- */
    function colAt(x, y) {
      var e = document.elementFromPoint(x, y);
      while (e && e !== sc) { var c = attr(e, 'data-col'); if (c !== null) return Number(c); e = e.parentNode; }
      return null;
    }
    function svgPoint(ev) { var pt = sc.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var m = sc.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : pt; }
    function clearLP() { if (down && down.lp) { clearTimeout(down.lp); down.lp = null; } }
    sc.addEventListener('pointerdown', function (ev) {
      if (over) return; closePop();
      var t = ev.target, c = attr(t, 'data-col');
      down = { x: ev.clientX, y: ev.clientY, ang0: ang, col: c === null ? null : Number(c), top: attr(t, 'data-top') !== null, moved: false, long: false, lp: null };
      clearInterval(tween);
      if (down.col !== null && hts[down.col] > 0) {   // 長按：選取這一疊最上面那顆
        var d0 = down; down.lp = setTimeout(function () { if (down === d0 && !d0.moved) { d0.long = true; sel = sel === d0.col ? null : d0.col; say(sel === null ? '取消選取' : '選取了 ' + (d0.col + 1) + ' 號格最上面的積木，點另一格就搬過去', ''); draw(); } }, LONG_MS);
      }
      try { sc.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    sc.addEventListener('pointermove', function (ev) {
      if (!down) return;
      var dx = ev.clientX - down.x, dy = ev.clientY - down.y;
      if (!down.moved && Math.abs(dx) + Math.abs(dy) > 7) { down.moved = true; clearLP(); if (!down.long && down.top && hts[down.col] > 0) { drag = { on: true, col: down.col, hover: down.col, px: 0, py: 0 }; sc.classList.add('dragging'); } }
      if (drag && drag.on) { var q = svgPoint(ev); drag.px = q.x; drag.py = q.y; drag.hover = colAt(ev.clientX, ev.clientY); draw(); }
      else if (down.moved && !down.long) { ang = down.ang0 + dx * 0.012; draw(); }
    });
    function endGesture(ev, cancel) {
      if (!down) return; clearLP(); var d = down; down = null; sc.classList.remove('dragging');
      if (drag && drag.on) {
        var from = drag.col, to = cancel ? null : colAt(ev.clientX, ev.clientY); drag = null;
        if (to !== null && to !== from) moveTo(from, to); else draw();
        return;
      }
      if (cancel || d.moved || d.long) return;
      tapAt(d);
    }
    sc.addEventListener('pointerup', function (ev) { endGesture(ev, false); });
    sc.addEventListener('pointercancel', function (ev) { endGesture(ev, true); });
    function tapAt(d) {
      if (over) return;
      if (d.col === null) { if (sel !== null) { sel = null; say('取消選取'); draw(); } return; }
      if (sel !== null) { moveTo(sel, d.col); return; }
      if (mode === 'rem') { removeAt(d.col); return; }
      addAt(d.col);
    }

    session = { dispose: function () { stopTimer(); clearInterval(tween); document.removeEventListener('pointerdown', onDocDown, true); } };
    window.__views = { get state() { return { qno: qno, Z: Z, TGT: TGT, h: hts, over: over, wrong: wrong, sec: sec, timed: timedMode, hist: hist.length, sel: sel, mode: mode }; }, load: load, keys: keys, bSub: bSub, bUndo: bUndo, bClr: bClr, bTake: bTake, bRe: bRe, bSwap: bSwap, bMode: bMode, mAdd: mAdd, mRem: mRem, moreBtn: moreBtn, pop: pop, sc: sc, scwrap: scwrap, vw: ref, vB: vB, tick: function (n) { sec += n; draw(); }, timeChip: timeChip, msg: msg, get ov() { return ovEl; } };
    P.track('game_start', { id: SLUG, level: lv.id });
    load(qno, false); sh.toTop();
  }

  window.__viewsAPI = { Views: V, Gen: G };
  menu();
})();
