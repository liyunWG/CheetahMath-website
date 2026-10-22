/* 獵豹玩中學｜各種角度觀察：前視、上視、右視、三視圖、由視圖還原積木堆、最多與最少、基礎題與挑戰題
   題庫與答案都由 solid-views-bank.js 用窮舉算出（每格 0～3 塊，4⁹＝262,144 種堆法），這個檔案只負責畫面與互動。 */
(function () {
  var P = Play, h = P.h, B = SolidViewsBank, N = B.N, MAXH = B.MAXH;
  var LEVC = ['#86aaf0', '#5f8fe0', '#3f74cf'], CENTER = [N / 2, MAXH / 2, -N / 2], BOX = { x0: 0, x1: N, z0: -N, z1: 0, y: 0, lo: -0.55, ly: MAXH + 0.25 };
  var CAMS = { solid: [-0.65, 0.5], front: [0, 0], top: [0, Math.PI / 2], right: [-Math.PI / 2, 0] };
  var VNAME = { front: '前視圖', top: '上視圖', right: '右視圖' }, VFROM = { front: '正前方', top: '正上方', right: '正右側' };
  function faces(H) { return PS.cubeFaces(PS.heightCells(H), function (c) { return LEVC[c[1] % 3]; }, { alpha: 1 }); }
  /* 淡淡的 3×3×3 框線：讓畫面大小固定、看得出可放的範圍，積木增減時視角不會跳動 */
  function cage() { var V = [], E = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]], i; for (i = 0; i < 8; i++) V.push([(i & 1) * N, ((i >> 1) & 1) * MAXH, -((i >> 2) & 1) * N]); return E.map(function (e, k) { var fr = k === 0 || k === 2; /* 前面（z＝0）的上緣與下緣用粉紅色標出，對應「前」 */ return { a: V[e[0]], b: V[e[1]], color: fr ? '#e48ab0' : '#cdbf9d', w: fr ? 2 : 1.2, dash: fr ? null : [4, 4], bias: -5 }; }); }
  function copy(H) { return B.copy(H); }

  /* 3D 積木場景：地板＋前後左右標示＋視角小標（轉到前／上／右視時寫「從哪裡看」） */
  function mkScene(host, o) {
    o = o || {}; var sc = PS.scene(host, { hFrac: o.hFrac || 1, fitR: 2.7, center: CENTER, yaw: CAMS.solid[0], pitch: CAMS.solid[1], onTap: o.onTap });
    PS.floor(sc, BOX); PS.dirLabels(sc, BOX); PS.viewTag(sc); sc.lines = cage(); return sc;
  }
  /* 場景＋「立體／前視／上視／右視」按鈕。回傳 {sc, seg} */
  function viewScene(host, H, o) {
    o = o || {}; var sc = mkScene(host, { hFrac: o.hFrac || 0.86 }); sc.faces = faces(H); sc.invalidate();
    var seg = PS.seg(host, [{ k: 'solid', t: '立體' }, { k: 'front', t: '前視' }, { k: 'top', t: '上視' }, { k: 'right', t: '右視' }], function (k) { PS.camTo(sc, CAMS[k][0], CAMS[k][1], null, 1100); });
    seg.el.classList.add('ps-seg--views'); seg.set('solid', false); return { sc: sc, seg: seg };
  }
  /* 三視圖小圖列（全單元共用大小）。keys：['front','top','right'] 的任意組合；grids 由 B.viewsOf 算出 */
  function figs(host, V, keys) { return PS.viewFigRow(host, keys.map(function (k) { return { g: V[k], k: k }; })); }

  /* ---------------------------------------------------------------- 建造介面：場景＋俯視格＋放／拿＋返回＋全部清除 */
  function buildUI(host, o) {
    o = o || {}; var H = B.zeros(), hist = [], mode = 'put', wrap = h('div', { class: 'ps-build' }), gc = h('div', { class: 'ps-gridcol' }), grid = h('div', { class: 'ps-cellgrid' }), cap = h('div', { class: 'ps-cap' }), btn = [], capTimer = null, api = { H: H, onChange: o.onChange };
    host.append(wrap);
    var sc = mkScene(wrap, { hFrac: window.innerWidth >= 900 ? 0.86 : 0.6, onTap: function (pos, face) {
      var m = face && face.id ? /^c(-?\d+),(-?\d+),(-?\d+)$/.exec(face.id) : null; if (m) act(+m[1], -(+m[3]) - 1);
    } });
    api.sc = sc;
    function capText() { cap.className = 'ps-cap'; cap.textContent = mode === 'put' ? '俯視格：點一下放 1 塊（最高 ' + MAXH + ' 塊）' : '俯視格：點一下拿走最上面 1 塊'; }
    function warn(msg, i, j) {
      cap.className = 'ps-cap is-warn'; cap.textContent = msg; clearTimeout(capTimer); capTimer = setTimeout(capText, 2400);
      var b = btn[(N - 1 - j) * N + i]; if (b) { b.classList.remove('is-shake'); void b.offsetWidth; b.classList.add('is-shake'); }
    }
    function snap() { hist.push(JSON.stringify(H)); if (hist.length > 60) hist.shift(); }
    function total() { return B.sum(H); }
    function act(i, j) {
      var cur = H[i][j];
      if (mode === 'put') { if (cur >= MAXH) { warn('這一疊已經是最高了（最多疊 ' + MAXH + ' 塊）', i, j); return; } snap(); H[i][j] = cur + 1; }
      else { if (cur <= 0) { warn('這一格沒有積木可以拿', i, j); return; } snap(); H[i][j] = cur - 1; }
      refresh();
    }
    function refresh() {
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) { var v = H[c][N - 1 - r], b = btn[r * N + c]; b.textContent = v ? String(v) : ''; b.dataset.n = v; b.setAttribute('aria-label', (v ? '這一格有 ' + v + ' 塊，' : '這一格是空的，') + (mode === 'put' ? '點一下放 1 塊' : '點一下拿走最上面 1 塊')); }
      sc.faces = faces(H); sc.invalidate(); undo.disabled = !hist.length; clr.disabled = total() === 0; if (api.onChange) api.onChange(H);
    }
    grid.style.gridTemplateColumns = 'repeat(' + N + ',1fr)';
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) (function (r, c) { var b = h('button', { type: 'button', class: 'ps-cell' }); b.addEventListener('click', function () { act(c, N - 1 - r); }); btn.push(b); grid.append(b); })(r, c);
    var bPut = h('button', { type: 'button', class: 'ps-btn ps-mode ps-mode--put is-on', 'aria-pressed': 'true' }, '＋ 放'), bDel = h('button', { type: 'button', class: 'ps-btn ps-mode ps-mode--del', 'aria-pressed': 'false' }, '－ 拿');
    function setMode(m) { mode = m; bPut.classList.toggle('is-on', m === 'put'); bDel.classList.toggle('is-on', m === 'del'); bPut.setAttribute('aria-pressed', m === 'put'); bDel.setAttribute('aria-pressed', m === 'del'); grid.classList.toggle('is-del', m === 'del'); capText(); refresh(); }
    bPut.addEventListener('click', function () { setMode('put'); }); bDel.addEventListener('click', function () { setMode('del'); });
    var undo = h('button', { type: 'button', class: 'ps-btn' }, '↶ 返回上一步'), clr = h('button', { type: 'button', class: 'ps-btn' }, '全部清除');
    undo.addEventListener('click', function () { if (!hist.length) return; var M = JSON.parse(hist.pop()); for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) H[i][j] = M[i][j]; refresh(); });
    clr.addEventListener('click', function () { if (!total()) return; snap(); for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) H[i][j] = 0; refresh(); });
    gc.append(cap, grid, h('div', { class: 'ps-tools' }, h('div', { class: 'ps-modes' }, bPut, bDel), undo, clr)); wrap.append(gc);
    api.refresh = refresh; api.mode = function () { return mode; };
    api.setH = function (M) { snap(); for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) H[i][j] = M[i][j]; refresh(); };
    api.clear = function () { for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) H[i][j] = 0; hist.length = 0; refresh(); };
    capText(); refresh(); return api;
  }

  /* 搭積木：給三個（或兩個）視圖，搭出任何一個符合的堆法。判定＝你搭的堆法的視圖和題目的每一張都相同（不是只認一個標準答案） */
  function buildStep(cfg) {
    return function (st, api) {
      var T = cfg.T, TV = B.viewsOf(T), keys = cfg.keys, sols = B.solve(keys.reduce(function (o, k) { o[k] = TV[k]; return o; }, {})), done = false;
      st.append(h('div', { class: 'pl-label' }, cfg.label), P.instr(cfg.instr));
      var row = figs(st, TV, keys), fe = {}; keys.forEach(function (k, i) { fe[k] = row.children[i]; });
      var pc = P.pill('', ''), ro = h('div', { class: 'pl-readout ps-ro' }, pc); st.append(ro);
      var ui = buildUI(st, { onChange: function (H) {
        var V = B.viewsOf(H), n = 0, s = B.sum(H); keys.forEach(function (k) { var ok = B.eq(V[k], TV[k]); fe[k].classList.toggle('is-ok', ok); if (ok) n++; });
        pc.className = 'pl-pill' + (n === keys.length ? ' is-ok' : ''); pc.textContent = '相符 ' + n + ' / ' + keys.length + ' 張視圖　共 ' + s + ' 塊';
        if (n === keys.length && !done) {
          done = true; P.track('aha', { id: 'solid-views', step: cfg.step }); var same = B.eq(H, T);
          st.append(P.ruleBox('每一張視圖都對了！這組視圖<b>一共有 ' + sols.length + ' 種</b>堆法，你搭的是其中一種' + (same ? '' : '（和老師準備的不一樣，但視圖相同，一樣正確）') + '。<br>' + cfg.note, '發現')); api.unlock('搭對了！');
        }
      } });
      api.solve(function () { ui.setH(T); });
      st.append(P.hint(cfg.hint)); api.lock('搭出符合視圖的積木');
    };
  }

  var STEPS = [
    /* 1 三個方向看 */
    function (st, api) {
      var H = B.STEP1, V = B.viewsOf(H), seen = {}, n = 0, gate = { on: true }, tot = B.sum(H), top = B.footprint(H);
      P.choice(st, api, { id: 'sv-p1', predict: true, label: '先猜猜看', prompt: '從<b>正上方</b>往下看這堆積木（共 ' + tot + ' 塊），會看到幾個正方形？', row: true, options: [{ t: tot + ' 個' }, { t: top + ' 個' }, { t: (top - 1) + ' 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('按「前視、上視、右視」看看'); } });
      var sc = mkScene(st); sc.faces = faces(H); sc.invalidate();
      var holder = h('div', { class: 'ps-viewrow ps-viewrow--figs ps-slot' }), info = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, info), cur = 'solid';
      function check() { if (n >= 3 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-views', step: 1 }); st.append(P.ruleBox('從<b>前、上、右</b>三個方向看，各得到一張<b>平面圖</b>，叫做<b>三視圖</b>。<br>被擋住的方塊看不見，所以<b>看到的正方形數 ≠ 方塊總數</b>。', '名稱')); P.toast(api.ctx.p1 === 1 ? '你猜對了！上視是 ' + top + ' 個' : '上視圖是 ' + top + ' 個正方形'); api.unlock('三個方向都看過了！'); } }
      function render(k) {
        holder.innerHTML = ''; info.className = 'pl-pill';
        if (k === 'solid') { info.textContent = '拖動可以自己轉'; return; }
        holder.append(PS.viewFig(V[k], k)); info.textContent = VNAME[k] + '：從' + VFROM[k] + '看到 ' + B.squares(V[k]) + ' 個正方形';
        if (!seen[k]) { seen[k] = 1; n++; } check();
      }
      var seg = PS.seg(st, [{ k: 'solid', t: '立體' }, { k: 'front', t: '前視' }, { k: 'top', t: '上視' }, { k: 'right', t: '右視' }], function (k) {
        if (gate.on) { seg.set(cur, false); P.toast('先做上面的預測'); return; }
        cur = k; holder.innerHTML = ''; info.className = 'pl-pill is-amber'; info.textContent = k === 'solid' ? '鏡頭轉回斜角…' : '鏡頭正轉到「' + VFROM[k] + '」…';
        PS.camTo(sc, CAMS[k][0], CAMS[k][1], function () { render(k); }, 1300);
      });
      seg.el.classList.add('ps-seg--views');
      api.solve(function () {
        gate.on = false; seen.front = seen.top = seen.right = 1; n = 3; check();
        seg.set('front', false); PS.camTo(sc, 0, 0, function () { render('front'); seg.set('top', false); PS.camTo(sc, 0, Math.PI / 2, function () { render('top'); seg.set('right', false); PS.camTo(sc, -Math.PI / 2, 0, function () { render('right'); }, 900); }, 900); }, 900);
      });
      seg.set('solid', false); st.append(holder, ro, P.hint('地板上的「前、後、左、右」會跟著積木轉；轉到前視、上視、右視時，左上角會寫現在是從哪個方向看。')); api.lock('先做上面的預測');
    },
    /* 2、3 由三視圖搭出積木 */
    buildStep({ step: 2, T: B.PUZ[0], keys: ['front', 'top', 'right'], label: '由三視圖搭積木（1／2）', instr: '照著三視圖<b>搭出積木</b>，三個視圖都對就成功！', hint: '先看上視圖決定哪些格有積木，再用前視、右視決定高度。點錯了就按「－ 拿」或「↶ 返回上一步」。', note: '同樣的三視圖，積木堆<b>可能不只一種</b>，只要三張視圖都對就算數。' }),
    buildStep({ step: 3, T: B.PUZ[1], keys: ['front', 'top', 'right'], label: '由三視圖搭積木（2／2）', instr: '再來一題，<b>更有挑戰</b>：搭出符合三視圖的積木。', hint: '高度 3 的欄在前視圖或右視圖會頂到最上面一列。可以用「－ 拿」把多放的拿掉。', note: '視圖越多，限制越多；但三視圖也不一定只剩一種堆法。' }),
    /* 4 最少與最多 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '最少、最多'), P.instr('只給<b>前視圖</b>和<b>右視圖</b>，積木堆有很多種搭法。找出<b>最少</b>和<b>最多</b>要幾塊。'));
      var G = B.fromFR(B.STEP3.F, B.STEP3.R), sols = B.solve(G), MM = B.stats(sols), minH = null, maxH = null, got = { min: false, max: false };
      sols.forEach(function (s) { var t = B.sum(s); if (t === MM.min && !minH) minH = s; if (t === MM.max && !maxH) maxH = s; });
      figs(st, G, ['front', 'right']);
      var pc = P.pill('', ''), pm = P.pill('最少：？', ''), px = P.pill('最多：？', ''), ro = h('div', { class: 'pl-readout ps-ro' }, pc, pm, px); st.append(ro);
      var ui = buildUI(st, { onChange: function (H) {
        var V = B.viewsOf(H), ok = B.eq(V.front, G.front) && B.eq(V.right, G.right), s = B.sum(H); pc.className = 'pl-pill ' + (ok ? 'is-ok' : ''); pc.textContent = (ok ? '✓ 符合 ' : '✗ 還不符合　') + s + ' 塊';
        if (ok && s === MM.min && !got.min) { got.min = true; pm.className = 'pl-pill is-ok'; pm.textContent = '最少：' + MM.min + ' 塊 ✓'; P.toast('找到最少：' + MM.min + ' 塊'); }
        if (ok && s === MM.max && !got.max) { got.max = true; px.className = 'pl-pill is-ok'; px.textContent = '最多：' + MM.max + ' 塊 ✓'; P.toast('找到最多：' + MM.max + ' 塊'); }
        if (got.min && got.max && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-views', step: 4 }); st.append(P.ruleBox('<b>最多</b>：每一格都放到「前視、右視要求的較小值」。<b>最少</b>：只放必要的，讓每個要求的高度剛好被某一格達到。<br>這一題共 ' + MM.count + ' 種堆法：最少 <b>' + MM.min + '</b> 塊、最多 <b>' + MM.max + '</b> 塊。', '推理')); api.unlock('找到最少與最多了！'); }
      } });
      api.solve(function () { ui.setH(minH); ui.setH(maxH); });
      st.append(P.hint('格子最多放 3 塊。符合兩個視圖才算數。先試試把每格都放滿，再用「－ 拿」一格一格拿掉。')); api.lock('找出最少與最多');
    },
    quizStep('basic'), quizStep('challenge'),
    /* 7 完成 */
    function (st) {
      P.complete(st, {
        id: 'solid-views', moduleName: '各種角度觀察', askAbout: '國七立體圖形與三視圖', aha: '看到的正方形，不等於方塊的總數；<br>三個方向合起來，才能還原立體。',
        cards: [{ text: '前視圖、上視圖、右視圖：從三個方向看到的平面圖；被擋住的方塊看不見', src: '國七「三視圖」（獵豹 J71S CH5）' }, { text: '只給兩個視圖時，積木堆可能有多種搭法，可以推出最少與最多的塊數', src: '資優班常見的計數與推理延伸（詳細堂次請洽老師）' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '最少最多<br>系統推理' }, { at: 0.88, label: '投影與截面<br>空間想像' }] },
        teasers: [
          { title: '最少、最多的系統解法', q: '不用試，怎麼用「每欄取最高」直接算出最多？最少又要怎麼想？（4×4、5×5 也一樣）', where: 'J71S CH5（詳細堂次請洽老師）', lv: 'L2' },
          { title: '等角投影與立體圖的畫法', q: '怎麼把立體積木畫成一張看得出深度的平面圖？', where: '數資班拓展（請洽老師）', lv: 'L2' },
          { title: '影子與光源', q: '太陽光與手電筒的影子有什麼不同？平行投影與透視投影的差別。', where: '數資班拓展（請洽老師）', lv: 'L3' },
          { title: '由截面還原立體', q: '一個立體被切很多刀，每一刀的截面都知道，能不能還原它？（電腦斷層的數學）', where: '數資班拓展（請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子常把「看到的正方形數」當成方塊數，忘了被擋住的；也常分不清前視與右視誰在左誰在右。', place: '國七三視圖的核心，也是空間想像力、工程製圖與電腦圖學的起點。', ask: ['從上面看和從前面看，看到的正方形數一樣嗎？為什麼？', '只看前視圖和右視圖，積木最多、最少各是幾塊？', '右視圖的左邊是積木的前面還是後面？'] },
        classes: ['J71S CH5：三視圖', 'J91S：立體圖形', 'PK3C：錐體與球體'],
        next: { href: 'play-solid-nets.html', text: '下一個：展開圖' } });
    }];

  /* ---------------------------------------------------------------- 測驗：基礎題（6）與挑戰題（8）。題目固定順序、選項位置每次重新打亂 */
  var WRONG = {
    frontSquares: '提示：前視圖每一欄只看最高的那一疊。', topSquares: '提示：俯視圖只看「哪些格子有積木」，疊多高都算一個。', rightSquares: '提示：右視圖由前到後，每一欄看最高的那一疊。',
    hiddenTop: '提示：先數正上方看得到幾塊（有積木的格子數），再用總塊數去減。', min: '提示：每個高度至少要有一格放到那麼高；一格可以同時滿足前、右兩邊。', max: '提示：每一格最多放到「該欄與該列要求高度」的較小值。', count3: '提示：上視圖決定哪些格有積木；再看哪些格的高度還有選擇。'
  };
  var SEG = {
    basic: { name: '基礎題', done: '基礎題全部完成！<br>記得：<b>前視看每欄最高、右視看每列最高、上視看哪些格有積木</b>；被擋住的方塊看不見，所以正方形數 ≠ 方塊數。', ask: '完成 6 題基礎題' },
    challenge: { name: '挑戰題', done: '挑戰題全部完成！<br>只給<b>兩張視圖</b>，堆法常常不只一種，要用<b>最少、最多</b>描述；給<b>三張視圖</b>才可能剛好只有一種。這些答案都是電腦把 262,144 種堆法全部檢查過算出來的。', ask: '完成 8 題挑戰題' }
  };
  function optHtml(o) { return o.grid ? PS.viewSvgHtml(o.grid) : o.plan ? PS.planHtml(o.plan) : o.t; }
  function quizStep(seg) {
    return function (st, api) {
      var Q = B.build()[seg], S = SEG[seg], box = h('div', {}), k = 0; st.append(box);
      function show() {
        var q = Q[k]; box.innerHTML = ''; var V = B.viewsOf(q.truth.H);
        var prog = h('div', { class: 'ps-prog', 'aria-hidden': 'true' }); Q.forEach(function (_, i) { prog.append(h('i', { class: i < k ? 'on' : i === k ? 'cur' : '' })); });
        box.append(h('div', { class: 'pl-label' }, S.name + '　第 ' + (k + 1) + ' / ' + Q.length + ' 題'), prog);
        var wrap = h('div', { class: 'ps-qwrap' + (q.show && q.show.length > 2 ? ' ps-qwrap--stack' : '') }), left = h('div', { class: 'ps-qfig' }), right = h('div', { class: 'ps-qans' }); wrap.append(left, right); box.append(wrap);
        if (q.stack) viewScene(left, q.stack, { hFrac: 0.8 }); if (q.show) figs(left, V, q.show);
        function nxt() { if (k + 1 < Q.length) P.later(function () { k++; show(); }, 900); else finish(); }
        if (q.kind === 'num') {
          right.append(h('div', { class: 'pl-q', html: q.prompt }));
          P.numBox(right, { answer: q.answer, unit: q.unit, okMsg: q.explain, onOk: nxt, wrong: function () { return WRONG[q.truth.type] || '再想想看～'; } });
        } else {
          P.choice(right, {}, { id: 'sv-' + q.id, prompt: q.prompt, row: !!(q.options[0].grid || q.options[0].plan), options: q.options.map(function (o) { return { t: optHtml(o), ok: o.ok, fb: o.fb }; }), onAnswer: nxt });
        }
      }
      function finish() { P.track('transfer_ok', { id: 'solid-views', seg: seg }); P.toast(S.name + '全部完成！'); st.append(P.ruleBox(S.done, '完成')); api.unlock(S.name + '全部完成！'); }
      show(); api.lock(S.ask);
    };
  }
  new P.Lesson({ id: 'solid-views', title: '各種角度觀察', steps: STEPS });
})();
