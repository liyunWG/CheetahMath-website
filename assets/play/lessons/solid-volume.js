/* 獵豹玩中學｜立體圖形的體積與表面積
   疊積木看「底面積 × 高」→ 正方體拆成 3 個角錐（1/3）→ 圓柱側面攤平的表面積 → 3 個操作關卡（最省表面積、錐柱等體積、圓柱表面積）。 */
(function () {
  var P = Play, h = P.h, D = Play3D, PI = Math.PI;
  var LAYER = ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'];
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function pillRow(host, defs) { var row = h('div', { class: 'pl-readout' }), out = []; defs.forEach(function (c) { var p = P.pill('', c); out.push(p); row.append(p); }); host.append(row); return out; }
  /* a × b × h 個單位方塊（y 向上） */
  function boxCells(a, b, hh) { var cells = [], x, y, z; for (x = 0; x < a; x++) for (y = 0; y < hh; y++) for (z = 0; z < b; z++) cells.push([x, y, z]); return cells; }
  function showBox(sc, a, b, hh) { sc.center = [a / 2, hh / 2, b / 2]; sc.faces = PS.cubeFaces(boxCells(a, b, hh), function (c) { return LAYER[c[1] % 6]; }); sc.lines = []; sc.dots = []; sc.invalidate(); }
  /* 角錐：底面四個頂點 base、頂點 apex，沿 off 平移 */
  function pyramid(base, apex, off, fill) {
    var mv = function (p) { return [p[0] + off[0], p[1] + off[1], p[2] + off[2]]; }, B = base.map(mv), A = mv(apex), fs = [{ pts: B, fill: fill, alpha: 0.9, stroke: 'rgba(18,37,72,.8)', lw: 1.6 }], i;
    for (i = 0; i < 4; i++) fs.push({ pts: [B[i], B[(i + 1) % 4], A], fill: fill, alpha: 0.9, stroke: 'rgba(18,37,72,.8)', lw: 1.6 });
    return fs;
  }
  /* 圓柱展開圖：回傳 {draw(r, hh)}；一個長方形（長 2πr、寬 hh）和兩個圓 */
  function netBoard(host, cls) {
    var b = new P.Board(host, { w: 14, h: 9, cls: cls }), g = h('g'); b.gMid.append(g);
    return {
      board: b, draw: function (r, hh) {
        g.innerHTML = ''; var s = Math.min(0.62, 13 / (2 * PI * r), 6.6 / (hh + 4 * r)), rr = r * s, hs = hh * s, L = 2 * PI * rr, x0 = (14 - L) / 2, y0 = 2 * rr + 1.1;
        b.poly([[x0, y0], [x0 + L, y0], [x0 + L, y0 + hs], [x0, y0 + hs]], 'pl-poly pl-poly--amber', g);
        g.append(h('circle', { cx: 7, cy: b.Y(y0 + hs + rr + 0.35), r: rr, fill: 'rgba(47,111,220,.3)', stroke: '#2f6fdc', 'stroke-width': 2.5, style: 'vector-effect:non-scaling-stroke' }));
        g.append(h('circle', { cx: 7, cy: b.Y(y0 - rr - 0.9), r: rr, fill: 'rgba(47,111,220,.3)', stroke: '#2f6fdc', 'stroke-width': 2.5, style: 'vector-effect:non-scaling-stroke' }));
        b.text([7, y0 - 0.55], '側面攤平成長方形：長 ＝ 圓周 2πr、寬 ＝ 高 h', 'pl-text pl-text--sm', g);
      }
    };
  }

  var steps = [
    /* 1. 疊積木：底面積 × 高 */
    function (st, api) {
      st.append(P.instr('用單位方塊疊出長方體。改變<b>長、寬、高</b>，讓<b>體積剛好是 24</b>，找出 <b>3 種不同的疊法</b>。'));
      var A = 2, B = 2, H = 2, seen = {}, n = 0, done = false, sc = PS.scene(st, { fitR: 4, yaw: -0.65, pitch: 0.45 });
      var pills = pillRow(st, ['is-blue', 'is-amber', 'is-pink']), pn = P.pill('找到 0 / 3', 'is-amber'); st.append(h('div', { class: 'pl-readout' }, pn));
      var sa = P.stepper('長 a', 1, 6, A, function (v) { A = v; upd(); }), sb = P.stepper('寬 b', 1, 6, B, function (v) { B = v; upd(); }), sh = P.stepper('高 h', 1, 6, H, function (v) { H = v; upd(); });
      st.append(h('div', { class: 'pl-steprow' }, sa.el, sb.el, sh.el));
      function upd() {
        showBox(sc, A, B, H); var base = A * B, vol = base * H; pills[0].textContent = '一層有 ' + A + ' × ' + B + ' ＝ ' + base + ' 塊'; pills[1].textContent = '疊 ' + H + ' 層'; pills[2].className = 'pl-pill ' + (vol === 24 ? 'is-ok' : 'is-pink'); pills[2].textContent = '體積 ＝ ' + base + ' × ' + H + ' ＝ ' + vol;
        if (vol === 24) { var key = [A, B, H].sort().join(','); if (!seen[key]) { seen[key] = 1; n++; pn.textContent = '找到 ' + Math.min(n, 3) + ' / 3'; if (n >= 3 && !done) { done = true; P.track('aha', { id: 'solid-volume', step: 1 }); st.append(P.ruleBox('不管怎麼疊，<b>體積 ＝ 一層有幾塊（底面積）× 疊幾層（高）</b>。<br>柱體都一樣：<b>體積 ＝ 底面積 × 高</b>，底面不管是長方形、三角形還是圓。', '柱體體積')); api.unlock('體積 ＝ 底面積 × 高！'); } } }
      }
      api.solve(function () { [[2, 3, 4], [1, 4, 6], [2, 2, 6]].forEach(function (t) { A = t[0]; B = t[1]; H = t[2]; sa.set(A, true); sb.set(B, true); sh.set(H, true); upd(); }); });
      upd(); st.append(P.hint('可以用手指轉動立體。想想看 24 可以拆成哪三個數相乘？')); api.lock('找出 3 種體積 24 的疊法');
    },
    /* 2. 正方體拆成三個角錐 */
    function (st, api) {
      var gate = { on: true }, done = false, t = 0;
      P.choice(st, api, { id: 'sv-p2', predict: true, label: '先猜猜看', prompt: '一個正方體，可以剛好切成 <b>3 個一模一樣的角錐</b>（頂點都在同一個角）。每個角錐的體積是正方體的…？', row: true, options: [{ t: '1/2' }, { ok: true, t: '1/3' }, { t: '1/4' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('拉滑桿把三個角錐拆開'); } });
      var sc = PS.scene(st, { fitR: 1.6, yaw: -0.65, pitch: 0.45 }), AP = [0.5, 0.5, 0.5];
      var BASES = [[[-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5], [-0.5, -0.5, 0.5]], [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]], [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]]], DIR = [[-1, 0, 0], [0, -1, 0], [0, 0, -1]], COLS = ['#9db7ee', '#f3a6c3', '#9ad9b3'];
      var pc = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pc);
      function draw() { var fs = []; BASES.forEach(function (bs, i) { var d = 0.9 * t; fs = fs.concat(pyramid(bs, AP, [DIR[i][0] * d, DIR[i][1] * d, DIR[i][2] * d], COLS[i])); }); sc.faces = fs; sc.lines = []; sc.dots = []; sc.invalidate(); pc.textContent = t > 0.97 ? '3 個角錐：底 1 × 1、高 1，一模一樣' : '三個角錐合起來是一個正方體'; pc.className = 'pl-pill ' + (t > 0.97 ? 'is-ok' : 'is-amber');
        if (t > 0.97 && !done && !gate.on) { done = true; P.toast(api.ctx.p2 === 1 ? '你猜對了！' : '剛好是 1/3'); P.track('aha', { id: 'solid-volume', step: 2 }); st.append(P.ruleBox('正方體（體積 1）剛好分成 <b>3 個一樣的角錐</b>，每個角錐的體積是 <b>1/3</b>。<br>底和高都和正方體一樣的角錐、圓錐：<b>體積 ＝ 1/3 × 底面積 × 高</b>。', '錐體體積')); api.unlock('錐體 ＝ 1/3 柱體！'); } }
      var sl = P.slider(0, 100, 0, function (v) { if (gate.on) { sl.value = 0; P.toast('先做上面的預測'); return; } t = v / 100; draw(); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 合起來'), h('span', {}, '拆開 →')), ro);
      api.solve(function () { gate.on = false; sl.value = 100; t = 1; draw(); }); draw(); st.append(P.hint('三個角錐的頂點都在正方體的同一個角。可以用手指轉動看看。')); api.lock('先做上面的預測');
    },
    /* 3. 圓柱的表面積：攤平 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, r = 1, hh = 2;
      P.choice(st, api, { id: 'sv-p3', predict: true, label: '先猜猜看', prompt: '把圓柱的<b>側面</b>剪開、攤平，會是什麼形狀？', row: true, options: [{ t: '圓形' }, { ok: true, t: '長方形' }, { t: '三角形' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('調整半徑和高，看展開圖'); } });
      var host = stage(st), N = netBoard(host), pills = pillRow(st, ['is-amber', 'is-blue', 'is-pink']);
      var sr = P.stepper('半徑 r', 1, 5, r, function (v) { r = v; upd(); }), sh = P.stepper('高 h', 1, 6, hh, function (v) { hh = v; upd(); }); st.append(h('div', { class: 'pl-steprow' }, sr.el, sh.el));
      function upd() {
        N.draw(r, hh); pills[0].textContent = '側面 ＝ 2πr × h ＝ ' + 2 * r * hh + 'π'; pills[1].textContent = '兩個底 ＝ 2 × πr² ＝ ' + 2 * r * r + 'π'; pills[2].textContent = '表面積 ＝ ' + (2 * r * hh + 2 * r * r) + 'π';
        if (gate.on) return; var key = r + ',' + hh; if (!seen[key]) { seen[key] = 1; n++; } if (n >= 4 && !done) { done = true; P.toast(api.ctx.p3 === 1 ? '你猜對了！' : '攤平是長方形'); P.track('aha', { id: 'solid-volume', step: 3 }); st.append(P.ruleBox('圓柱側面攤平是<b>長方形</b>：長 ＝ 底圓的周長 <b>2πr</b>、寬 ＝ 高 <b>h</b>。<br><b>表面積 ＝ 側面積 ＋ 兩個底 ＝ 2πrh ＋ 2πr²</b>。', '圓柱表面積')); api.unlock('表面積 ＝ 2πrh ＋ 2πr²！'); }
      }
      api.solve(function () { gate.on = false; [[1, 1], [2, 3], [3, 2], [4, 5]].forEach(function (p) { r = p[0]; hh = p[1]; sr.set(r, true); sh.set(hh, true); upd(); }); });
      upd(); st.append(P.hint('至少換 4 組 (r, h)，看看側面長方形的「長」怎麼跟著 r 變。')); api.lock('先做上面的預測');
    },
    /* 4. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：36 塊方塊，表面積最小的疊法 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '用 <b>36 塊</b>方塊疊成長方體。調整長、寬、高，找出<b>表面積最小</b>的疊法。' }));
          var A = 1, B = 6, H = 6, found = false, sc = PS.scene(b0, { fitR: 4.5, yaw: -0.65, pitch: 0.45 }), pills = pillRow(b0, ['is-blue', 'is-amber', 'is-pink']);
          var sa = P.stepper('長 a', 1, 6, A, function (v) { A = v; upd(); }), sb = P.stepper('寬 b', 1, 6, B, function (v) { B = v; upd(); }), sh = P.stepper('高 h', 1, 6, H, function (v) { H = v; upd(); }); b0.append(h('div', { class: 'pl-steprow' }, sa.el, sb.el, sh.el));
          function upd() {
            showBox(sc, A, B, H); var vol = A * B * H, sa2 = 2 * (A * B + B * H + A * H); pills[0].textContent = '體積 ＝ ' + vol; pills[1].textContent = '表面積 ＝ ' + sa2; pills[2].className = 'pl-pill ' + (vol === 36 && sa2 === 66 ? 'is-ok' : 'is-pink'); pills[2].textContent = vol !== 36 ? '要剛好 36 塊' : (sa2 === 66 ? '✓ 最小！' : '還能更小嗎？');
            if (vol === 36 && sa2 === 66 && !found) { found = true; P.toast('3 × 3 × 4：越接近正方體越省'); P.track('aha', { id: 'solid-volume', step: 4 }); done(); }
          }
          setSolve(function () { A = 3; B = 3; H = 4; sa.set(3, true); sb.set(3, true); sh.set(4, true); upd(); }); upd(); b0.append(P.hint('36 ＝ 1×6×6、2×3×6、3×3×4⋯⋯哪一種最「方」？'));
        },
        /* 關 2：錐和柱一樣多水 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '圓柱（半徑 3、高 4）和圓錐<b>底一樣大</b>。調整圓錐的高，讓兩個<b>裝的水一樣多</b>。' }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var bd = new P.Board(host, { w: 12, h: 9, cls: 'pl-svg--sm' }), g = h('g'); bd.gMid.append(g); var hc = 1, found = false, sc = 0.5, pills = pillRow(b0, ['is-green', 'is-pink', 'is-amber']);
          var sn = P.stepper('圓錐的高', 1, 16, hc, function (v) { hc = v; upd(); }); b0.append(h('div', { class: 'pl-steprow' }, sn.el));
          function upd() {
            g.innerHTML = ''; var w = 6 * sc, y0 = 0.7; bd.poly([[1, y0], [1 + w, y0], [1 + w, y0 + 4 * sc], [1, y0 + 4 * sc]], 'pl-poly pl-poly--green', g); bd.poly([[6.5, y0], [6.5 + w, y0], [6.5 + w / 2, y0 + hc * sc]], 'pl-poly pl-poly--pink', g); bd.text([1 + w / 2, y0 - 0.45], '圓柱', 'pl-text pl-text--sm', g); bd.text([6.5 + w / 2, y0 - 0.45], '圓錐', 'pl-text pl-text--sm', g);
            var vy = 9 * 4, vc = 9 * hc / 3, eq = vy === vc; pills[0].textContent = '圓柱 ＝ π×3²×4 ＝ ' + vy + 'π'; pills[1].textContent = '圓錐 ＝ ⅓×π×3²×' + hc + ' ＝ ' + vc + 'π'; pills[2].className = 'pl-pill ' + (eq ? 'is-ok' : 'is-amber'); pills[2].textContent = eq ? '✓ 一樣多！' : (vc < vy ? '圓錐比較少' : '圓錐比較多');
            if (eq && !found) { found = true; P.toast('圓錐要 3 倍高，才和圓柱一樣多'); P.track('aha', { id: 'solid-volume', step: 5 }); done(); }
          }
          setSolve(function () { hc = 12; sn.set(12); }); upd(); b0.append(P.hint('同底同高時，圓錐只有圓柱的 1/3。想一樣多，圓錐要…？'));
        },
        /* 關 3：圓柱表面積目標 */
        function (b0, done, setSolve) {
          var T = [{ t: '表面積 ＝ <b>16π</b>', s: 16 }, { t: '表面積 ＝ <b>20π</b>', s: 20 }, { t: '表面積 ＝ <b>36π</b>', s: 36 }], ti = 0, r = 1, hh = 1, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(info, host);
          var N = netBoard(host, 'pl-svg--sm'), pills = pillRow(b0, ['is-amber', 'is-blue', 'is-pink']), sr = P.stepper('半徑 r', 1, 5, r, function (v) { r = v; upd(); }), sh = P.stepper('高 h', 1, 6, hh, function (v) { hh = v; upd(); }); b0.append(h('div', { class: 'pl-steprow' }, sr.el, sh.el));
          function txt() { info.innerHTML = '調整圓柱的半徑和高，讓' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3；答案可能不只一種）</small>'; }
          function upd() {
            N.draw(r, hh); var tot = 2 * r * hh + 2 * r * r; pills[0].textContent = '側面 ＝ ' + 2 * r * hh + 'π'; pills[1].textContent = '兩個底 ＝ ' + 2 * r * r + 'π'; pills[2].textContent = '表面積 ＝ ' + tot + 'π';
            if (ti < 3 && tot === T[ti].s) { ti++; if (ti >= 3) { P.toast('表面積 ＝ 2πrh ＋ 2πr²'); P.track('aha', { id: 'solid-volume', step: 6 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { var sol = [[2, 2], [2, 3], [3, 3]]; while (ti < 3) { var s = sol[ti]; r = s[0]; hh = s[1]; sr.set(r, true); sh.set(hh, true); upd(); } }); txt(); upd(); b0.append(P.hint('表面積 ＝ 2πr × h ＋ 2 × πr²。先想想 r 要多大，底就先佔掉多少。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-volume' }); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'solid-volume', moduleName: '立體圖形的體積與表面積', askAbout: '國中立體圖形與體積', aha: '柱體體積 ＝ 底面積 × 高；錐體是它的 1/3；<br>表面積要把所有面攤開加起來。',
        cards: [{ text: '柱體體積 ＝ 底面積 × 高；錐體體積 ＝ 1/3 × 底面積 × 高', src: '國中「立體圖形的體積」（國中數學課綱）' }, { text: '圓柱表面積 ＝ 2πrh ＋ 2πr²：側面展開是長方形（長 ＝ 底圓周長）', src: '國中「立體圖形的表面積與展開圖」' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '錐體與球體<br>展開圖' }, { at: 0.9, label: '卡瓦列里原理<br>積分求體積' }] },
        teasers: [
          { title: '生活中的立體圖形', q: '柱體、錐體的體積與表面積怎麼用在生活問題？展開圖怎麼幫忙算表面積？', where: 'J91S 2607 第 7–9 堂：CH03 生活中的立體圖形', lv: 'L1' },
          { title: '立體幾何：體積與表面積', q: '多面體、柱體、錐體的體積與表面積，加上展開圖與截面，一次整理。', where: 'J91A 2507 第 25–27 堂：立體幾何', lv: 'L2' },
          { title: '圓柱與圓錐', q: '圓柱、圓錐的體積與表面積；柱體的體積與表面積怎麼用「割補」算？', where: 'PK4B 2512 第 9 堂；PK3B 2512 第 14 堂；PK3C 2607 第 15 堂', lv: 'L2' },
          { title: '錐體與球體', q: '為什麼角錐是柱體的 1/3？球的體積和表面積怎麼用卡瓦列里原理推出來？', where: 'PK3C 2507 第 20 堂：錐體與球體', lv: 'L3' }],
        parent: { pitfall: '孩子常把<b>體積</b>（立方單位）和<b>表面積</b>（平方單位）搞混，也常忘記錐體要乘 <b>1/3</b>；圓柱表面積容易漏掉<b>兩個底</b>。', place: '國中立體圖形的核心，之後的球體積、截面、立體幾何與微積分求體積都從這裡開始。', ask: ['疊方塊時，體積為什麼是「一層幾塊」乘「幾層」？', '圓錐為什麼是同底同高圓柱的 1/3？', '圓柱側面攤平，長方形的長為什麼是 2πr？'] },
        classes: ['J91S（2607 第 7–9 堂）：CH03 生活中的立體圖形（柱體、錐體、表面積、展開圖）', 'J91A（2507 第 25–27 堂）：立體幾何', 'PK3C（2507 第 20 堂；2607 第 15 堂）：錐體與球體、柱體與錐體的表面積與體積', 'PK4B（2512 第 9 堂）：圓柱與圓錐的體積與表面積', 'PK3B（2512 第 14 堂）：柱體體積與表面積'] });
    }];
  new P.Lesson({ id: 'solid-volume', title: '立體圖形的體積與表面積', answers: { 0: '柱體體積 ＝ 底面積 × 高' }, steps: steps });
})();
