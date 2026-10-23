/* 獵豹玩中學｜垂直平分線與外心（格點版：所有點都吸附在格點上，判斷用精確整數運算）
   預測＋找到 A、B 一樣遠的點 → 沿垂直平分線拖動 → 三條垂直平分線交於外心 → 4 個操作關卡。 */
(function () {
  var P = Play, h = P.h, A = [2, 3], B = [10, 3], M = [6, 3];
  function d2(p, q) { return (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]); }
  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  /* 在線段 a–b 旁邊標出長度（偏向上方／右方），拖動時跟著即時更新 */
  function dl(board, g, a, b, txt, cls) { var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L < 0.3) return; var nx = -dy / L, ny = dx / L; if (ny < -1e-9 || (Math.abs(ny) < 1e-9 && nx < 0)) { nx = -nx; ny = -ny; } board.text([(a[0] + b[0]) / 2 + nx * 0.7, (a[1] + b[1]) / 2 + ny * 0.7 - 0.2], txt, 'pl-text ' + (cls || ''), g); }
  function stage(st) { var w = h('div', { class: 'pl-stage' }); st.append(w); return w; }
  function clip(p, d) { var t0 = -1e9, t1 = 1e9; [[0, 12, 0], [0, 10, 1]].forEach(function (r) { var i = r[2]; if (Math.abs(d[i]) < 1e-9) return; var a = (r[0] - p[i]) / d[i], b = (r[1] - p[i]) / d[i]; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); }); return [[p[0] + d[0] * t0, p[1] + d[1] * t0], [p[0] + d[0] * t1, p[1] + d[1] * t1]]; }
  function circumcenter(a, b, c) {
    var D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])); if (D === 0) return null;
    var a2 = a[0] * a[0] + a[1] * a[1], b2 = b[0] * b[0] + b[1] * b[1], c2 = c[0] * c[0] + c[1] * c[1];
    return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / D, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / D];
  }
  function dotAt(p, q, r) { return (q[0] - p[0]) * (r[0] - p[0]) + (q[1] - p[1]) * (r[1] - p[1]); }
  function kind(a, b, c) { var d = [dotAt(a, b, c), dotAt(b, a, c), dotAt(c, a, b)]; return d.some(function (v) { return v === 0; }) ? 'right' : d.some(function (v) { return v < 0; }) ? 'obtuse' : 'acute'; }
  function pts(x0, x1, y0, y1, ok) { var o = []; for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) if (!ok || ok(x, y)) o.push([x, y]); return o; }
  function baseAB(b) { b.line(A, B, 'pl-line'); b.dot(A, 'pl-dot', null, 0.2); b.dot(B, 'pl-dot', null, 0.2); b.text([A[0] - 0.2, A[1] - 0.95], 'A', 'pl-text'); b.text([B[0] + 0.2, B[1] - 0.95], 'B', 'pl-text'); }

  var steps = [
    /* 1. 預測＋找到一樣遠的點 */
    function (st, api) {
      var gate = { on: true }, found = {}, nf = 0, done = false, g = h('g');
      P.choice(st, api, { id: 'pb-p1', predict: true, label: '先猜猜看', prompt: '平面上有些點，到 A、B 兩點<b>一樣遠</b>。把這些點通通找出來，它們會排成什麼形狀？', row: true, options: [{ ok: true, t: '一條直線' }, { t: '一個圓' }, { t: '亂散各處' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動 P，找出 5 個到 A、B 一樣遠的點'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }); board.gMid.append(g); baseAB(board);
      var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pl = P.pill('', ''), pf = P.pill('已找到 0 / 5 個', 'is-amber'); st.append(h('div', { class: 'pl-readout' }, pa, pb), h('div', { class: 'pl-readout' }, pl, pf));
      function draw(t) {
        g.innerHTML = ''; var da = d2(t, A), db = d2(t, B), eq = da === db;
        g.append(h('line', { x1: t[0], y1: board.Y(t[1]), x2: A[0], y2: board.Y(A[1]), class: 'pl-line pl-line--blue pl-line--dash' }), h('line', { x1: t[0], y1: board.Y(t[1]), x2: B[0], y2: board.Y(B[1]), class: 'pl-line pl-line--pink pl-line--dash' }));
        dl(board, g, t, A, fmt(Math.sqrt(da)), 'pl-text--blue'); dl(board, g, t, B, fmt(Math.sqrt(db)), 'pl-text--pink');
        pa.textContent = 'PA ＝ ' + fmt(Math.sqrt(da)); pb.textContent = 'PB ＝ ' + fmt(Math.sqrt(db)); pl.className = 'pl-pill' + (eq ? ' is-ok' : ''); pl.textContent = eq ? '✓ 一樣遠' : (da < db ? '離 A 比較近' : '離 B 比較近');
        return eq;
      }
      var hd = board.handle({ pos: [3, 6], disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; },
        onMove: function (t) {
          var eq = draw(t); if (!eq) return; var key = t.join(',');
          if (!found[key]) { found[key] = 1; nf++; pf.textContent = '已找到 ' + nf + ' / 5 個'; P.toast('到 A、B 一樣遠'); }
          if (nf >= 5 && !done) { done = true; P.track('aha', { id: 'perp-bisector', step: 1 }); board.line([6, 0], [6, 10], 'pl-line pl-line--green pl-line--dash'); board.dot(M, 'pl-dot pl-dot--green', null, 0.18); board.rightMark(M, [-1, 0], [0, 1], 0.5); st.append(P.ruleBox('到 A、B <b>一樣遠</b>的點，全部排在<b>一條直線</b>上。<br>這條線和 AB <b>垂直</b>，又剛好通過 AB 的<b>中點</b>，叫做 AB 的<b>垂直平分線</b>。', '名稱')); P.toast(api.ctx.p1 === 0 ? '你猜對了！是一條直線' : '它們排成一條直線'); api.unlock('一條直線！'); }
        } });
      api.solve(function () { gate.on = false; [[6, 8], [6, 6], [6, 1], [6, 5], [6, 9]].forEach(hd.moveTo); });
      draw([3, 6]); st.append(P.hint('提示：到 A 和到 B 的距離相等時，會亮「一樣遠」。每個位置都要靠格點。')); api.lock('先做上面的預測');
    },
    /* 2. 沿著垂直平分線：中點與直角 */
    function (st, api) {
      st.append(P.instr('沿著這條線拖動 <b>P</b>，看看 P 到 A、B 的距離，以及這條線和 AB 的關係。'));
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'), seen = {}, nSeen = 0, up = false, down = false; board.gMid.append(g);
      board.line([6, 0], [6, 10], 'pl-line pl-line--green'); baseAB(board); board.dot(M, 'pl-dot pl-dot--green', null, 0.2); board.text([M[0] + 0.75, M[1] - 0.95], 'M', 'pl-text pl-text--green');
      var pa = P.pill('', 'is-blue'), pm = P.pill('AM ＝ MB ＝ 4', 'is-amber'), pr = P.pill('∠PMA ＝ 90°', 'is-ok'); st.append(h('div', { class: 'pl-readout' }, pa, pm, pr));
      function draw(t) { g.innerHTML = ''; g.append(h('line', { x1: t[0], y1: board.Y(t[1]), x2: A[0], y2: board.Y(A[1]), class: 'pl-line pl-line--blue pl-line--dash' }), h('line', { x1: t[0], y1: board.Y(t[1]), x2: B[0], y2: board.Y(B[1]), class: 'pl-line pl-line--pink pl-line--dash' })); board.rightMark(M, [-1, 0], [0, t[1] > 3 ? 1 : -1], 0.5, g); dl(board, g, t, A, fmt(Math.sqrt(d2(t, A))), 'pl-text--blue'); dl(board, g, t, B, fmt(Math.sqrt(d2(t, B))), 'pl-text--pink'); pa.textContent = 'PA ＝ PB ＝ ' + fmt(Math.sqrt(d2(t, A))); }
      var cand = pts(6, 6, 0, 10, function (x, y) { return y !== 3; });
      var hd = board.handle({ pos: [6, 7], candidates: cand, onMove: function (t) { draw(t); var k = t.join(','); if (!seen[k]) { seen[k] = 1; nSeen++; } if (t[1] > 3) up = true; else down = true;
        if (nSeen >= 4 && up && down && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'perp-bisector', step: 2 }); st.append(P.ruleBox('<b>垂直平分線</b>有兩個性質：<br>① <b>平分</b>：通過 AB 的中點 M（AM ＝ MB）<br>② <b>垂直</b>：和 AB 成 90°<br>線上每一點，到 A、B 的距離都<b>相等</b>。', '垂直平分線')); P.toast('線上每一點都一樣遠'); api.unlock('垂直又平分！'); } } });
      api.solve(function () { [[6, 9], [6, 5], [6, 1], [6, 2]].forEach(hd.moveTo); });
      draw([6, 7]); st.append(P.hint('至少看 4 個位置，要有在 AB 上面的、也要有在 AB 下面的。')); api.lock('看 4 個位置（上面和下面都要）');
    },
    /* 3. 三角形：三條垂直平分線交於外心 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false;
      P.choice(st, api, { id: 'pb-p3', predict: true, label: '先猜猜看', prompt: '三角形三個邊各有一條<b>垂直平分線</b>。這三條線會<b>交在同一點</b>嗎？', row: true, options: [{ ok: true, t: '一定交在同一點' }, { t: '有時候會' }, { t: '不會' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('拖動 C，找出三種三角形'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'), C0 = [5, 7]; board.gMid.append(g); baseAB(board);
      var pr = P.pill('', 'is-blue'), pk = P.pill('', 'is-amber'), pp = P.pill('', ''); st.append(h('div', { class: 'pl-readout' }, pr), h('div', { class: 'pl-readout' }, pk, pp));
      var ok = function (x, y) { var o = circumcenter(A, B, [x, y]); return !!o && o[0] > 0.3 && o[0] < 11.7 && o[1] > 0.3 && o[1] < 9.7; };
      var cand = pts(0, 12, 0, 10, ok);
      function draw(C) {
        g.innerHTML = ''; var O = circumcenter(A, B, C), R = Math.sqrt(d2(O, A)), tri = [A, B, C], k = kind(A, B, C), i, cols = ['pl-line--blue', 'pl-line--pink', 'pl-line--amber'];
        g.append(h('polygon', { points: board.pts(tri), class: 'pl-poly pl-poly--amber' })); board.text([C[0] + 0.8, C[1] + 0.55], 'C', 'pl-text', g);
        g.append(h('circle', { cx: O[0], cy: board.Y(O[1]), r: R, fill: 'none', stroke: '#2a3f6e', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke', 'stroke-dasharray': '6 5' }));
        for (i = 0; i < 3; i++) { var p = tri[i], q = tri[(i + 1) % 3], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], d = [-(q[1] - p[1]), q[0] - p[0]], cl = clip(m, d); g.append(h('line', { x1: cl[0][0], y1: board.Y(cl[0][1]), x2: cl[1][0], y2: board.Y(cl[1][1]), class: 'pl-line ' + cols[i] })); g.append(h('circle', { cx: m[0], cy: board.Y(m[1]), r: 0.12, class: 'pl-dot' })); var ul = Math.hypot(q[0] - p[0], q[1] - p[1]), dl = Math.hypot(d[0], d[1]); board.rightMark(m, [(p[0] - q[0]) / ul, (p[1] - q[1]) / ul], [d[0] / dl, d[1] / dl], 0.4, g); }
        g.append(h('circle', { cx: O[0], cy: board.Y(O[1]), r: 0.24, class: 'pl-dot pl-dot--green' })); board.text([O[0] + 0.6, O[1] - 0.85], 'O', 'pl-text pl-text--green', g);
        var inside = (function () { var s = function (a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }, s1 = s(A, B, O), s2 = s(B, C, O), s3 = s(C, A, O); return (s1 > 1e-9 && s2 > 1e-9 && s3 > 1e-9) || (s1 < -1e-9 && s2 < -1e-9 && s3 < -1e-9); })();
        pr.textContent = 'OA ＝ OB ＝ OC ＝ ' + fmt(R); pk.textContent = k === 'right' ? '直角三角形' : k === 'obtuse' ? '鈍角三角形' : '銳角三角形';
        pp.textContent = k === 'right' ? 'O 在斜邊的中點' : inside ? 'O 在三角形裡面' : 'O 在三角形外面'; pp.className = 'pl-pill' + (k === 'right' ? ' is-ok' : '');
        return k;
      }
      var hd = board.handle({ pos: C0, candidates: cand, disabled: function () { if (gate.on) { P.toast('先做上面的預測'); return true; } return false; },
        onMove: function (t) { var k = draw(t); seen[k] = 1; if (Object.keys(seen).length === 3 && !done) { done = true; P.track('aha', { id: 'perp-bisector', step: 3 }); P.toast(api.ctx.p3 === 0 ? '你猜對了！永遠交在同一點' : '永遠交在同一點'); st.append(P.ruleBox('不管什麼三角形，三條垂直平分線<b>一定交在同一點 O</b>，叫<b>外心</b>。<br>O 到三個頂點<b>一樣遠</b>，所以能畫出一個通過三個頂點的圓（外接圓）。<br>銳角：O 在裡面；<b>直角：O 在斜邊中點</b>；鈍角：O 在外面。', '外心')); api.unlock('外心看懂了！'); } } });
      api.solve(function () { gate.on = false; [[5, 7], [6, 7], [0, 5]].forEach(hd.moveTo); });
      draw(C0); st.append(P.hint('把 C 拖成銳角、直角、鈍角三種三角形各一次。')); api.lock('先做上面的預測');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* 找一個點到指定的點一樣遠 */
      function equalTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }), board, g = h('g'), fin = false; b0.append(host); board = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); board.gMid.append(g);
          var polyEl = cfg.pts.length === 3 ? board.poly(cfg.pts, 'pl-poly pl-poly--amber') : board.line(cfg.pts[0], cfg.pts[1], 'pl-line');
          cfg.pts.forEach(function (p, i) { board.dot(p, 'pl-dot', null, 0.2); board.text([p[0] + (p[0] > 9 ? 0.5 : -0.3), p[1] - 0.95], cfg.names[i], 'pl-text'); });
          if (cfg.guide) board.line(cfg.guide[0], cfg.guide[1], 'pl-line pl-line--dash pl-line--amber');
          var ps = cfg.pts.map(function () { return P.pill('', 'is-blue'); }), pl = P.pill('', ''); b0.append(h('div', { class: 'pl-readout' }, ps), h('div', { class: 'pl-readout' }, pl));
          function draw(t) {
            g.innerHTML = ''; var ds = cfg.pts.map(function (p) { return d2(t, p); }), eq = ds.every(function (v) { return v === ds[0]; });
            cfg.pts.forEach(function (p, i) { g.append(h('line', { x1: t[0], y1: board.Y(t[1]), x2: p[0], y2: board.Y(p[1]), class: 'pl-line pl-line--dash ' + ['pl-line--blue', 'pl-line--pink', 'pl-line--amber'][i] })); ps[i].textContent = cfg.names[i] + ' 到 P：' + fmt(Math.sqrt(ds[i])); dl(board, g, t, p, fmt(Math.sqrt(ds[i])), ['pl-text--blue', 'pl-text--pink', 'pl-text--amber'][i]); });
            pl.className = 'pl-pill' + (eq ? ' is-ok' : ''); pl.textContent = eq ? '✓ 到每個點都一樣遠' : '距離還不一樣'; return eq;
          }
          var hd = board.handle({ pos: cfg.start, candidates: cfg.cand, onMove: function (t) { var eq = draw(t); if (eq && !fin) { fin = true; P.toast(cfg.msg); done(); } } });
          setSolve(function () { hd.moveTo(cfg.ans); }); draw(cfg.start); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        equalTask({ prompt: '在虛線 <b>y ＝ 8</b> 上找一個點 P，讓它到 A、B <b>一樣遠</b>。', pts: [A, B], names: ['A', 'B'], guide: [[0, 8], [12, 8]], cand: pts(0, 12, 8, 8), start: [3, 8], ans: [6, 8], msg: 'P 在垂直平分線上', hint: '到 A、B 一樣遠的點，都在哪一條線上？' }),
        equalTask({ prompt: '三個村莊 A、B、C 要蓋一座消防站 P，到<b>三個村莊一樣遠</b>。找出 P 的位置。', pts: [A, B, [8, 9]], names: ['A', 'B', 'C'], cand: pts(0, 12, 0, 10), start: [4, 6], ans: [6, 5], msg: 'P 就是外心', hint: '先用 A、B 的垂直平分線，再看 C。' }),
        equalTask({ prompt: '這是<b>直角三角形</b>（直角在 A）。找出到三個頂點一樣遠的點，看它落在哪裡？', pts: [A, B, [2, 9]], names: ['A', 'B', 'C'], cand: pts(0, 12, 0, 10), start: [4, 4], ans: [6, 6], msg: '直角三角形的外心在斜邊中點', hint: '斜邊是哪一條邊？它的中點到三個頂點會一樣遠嗎？' }),
        equalTask({ prompt: '這是<b>鈍角三角形</b>。外心會跑到三角形的外面，找找看。', pts: [A, B, [0, 5]], names: ['A', 'B', 'C'], cand: pts(0, 12, 0, 10), start: [5, 6], ans: [6, 9], msg: '鈍角三角形的外心在外面', hint: '先在 A、B 的垂直平分線上找。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 4 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'perp-bisector' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'perp-bisector', moduleName: '垂直平分線與外心', askAbout: '國中幾何（垂直平分線、三角形的外心）', aha: '垂直平分線上的每一點，到兩端一樣遠；<br>三條垂直平分線交於外心，到三個頂點一樣遠。',
        cards: [{ text: '垂直平分線：垂直於線段且通過中點；線上每一點到線段兩端等距，反過來到兩端等距的點必在這條線上', src: '國中「三角形的基本性質」（中垂線）' }, { text: '三角形三邊的垂直平分線交於一點（外心），外心到三頂點等距；直角三角形的外心在斜邊中點', src: '國中「三角形的外心」' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '四心與歐拉線<br>尺規作圖' }, { at: 0.88, label: '四點共圓<br>圓冪與圓內接' }] },
        teasers: [
          { title: '三角形的四心', q: '外心、內心、重心、垂心各有什麼性質？什麼時候四個心會重疊成一個點？', where: 'J91A 2507 第 10–13 堂：三角形的四心；J82S 2601 第 19–21 堂', lv: 'L2' },
          { title: '尺規作圖：作垂直平分線', q: '只用圓規和沒有刻度的直尺，怎麼作出線段的垂直平分線？為什麼這樣作是對的？', where: 'J82A 2601 第 9 堂：加課 3（CH3 尺規）', lv: 'L2' },
          { title: '外接圓與四點共圓', q: '任意三點都有外接圓，那第四個點在什麼條件下也會落在同一個圓上？', where: 'J91A 2507 第 9 堂：四點共圓', lv: 'L3' }],
        parent: { pitfall: '孩子常只記得「垂直平分線」是一條線，忘了它同時要「垂直」和「平分」兩個條件；也常把外心（垂直平分線的交點）和內心（角平分線的交點）混淆。', place: '國二「三角形的基本性質」與國三「三角形的心」的核心，也是之後尺規作圖與圓的證明的基礎。', ask: ['線段垂直平分線上的點，為什麼到兩端一樣遠？', '直角三角形的外心為什麼剛好在斜邊中點？', '外心和內心，各是用哪種線交出來的？'] },
        classes: ['J91A（2507 第 10–13 堂）：三角形的四心', 'J82S（2601 第 19–21 堂）：CH10 圓、CH11 幾何證明與三心', 'J81S（2507 第 25 堂）：CH7 三角形的基本性質（含垂直平分線）'], next: { href: 'play-line-intersect.html', text: '下一個：兩直線的交點' } });
    }];
  new P.Lesson({ id: 'perp-bisector', title: '垂直平分線與外心', steps: steps });
})();
