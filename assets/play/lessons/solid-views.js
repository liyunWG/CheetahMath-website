/* 獵豹玩中學｜各種角度觀察：前視、上視、右視、三視圖、由視圖還原積木堆、最多與最少 */
(function () {
  var P = Play, h = P.h, V3 = PS.v;
  var N = 3, MAXH = 3, LEVC = ['#86aaf0', '#5f8fe0', '#3f74cf'];
  function sum(H) { var s = 0; H.forEach(function (r) { r.forEach(function (v) { s += v; }); }); return s; }
  function zeros() { var H = []; for (var i = 0; i < N; i++) H.push([0, 0, 0]); return H; }
  function cells(H) { return PS.heightCells(H); }
  function faces(H) { return PS.cubeFaces(cells(H), function (c) { return LEVC[c[1] % 3]; }, { alpha: 1 }); }
  function viewsEq(v, w) { return PS.sameGrid(v.front, w.front) && PS.sameGrid(v.top, w.top) && PS.sameGrid(v.right, w.right); }
  /* 由前視、右視各欄高度，求 N×N 格中最少／最多方塊數（暴力） */
  function minMax(F, R) {
    var best = { min: 1e9, max: -1, minH: null, maxH: null }, H = zeros(), idx = [];
    (function rec(p) {
      if (p === N * N) { for (var i = 0; i < N; i++) { var m = 0; for (var j = 0; j < N; j++) m = Math.max(m, H[i][j]); if (m !== F[i]) return; } for (var j2 = 0; j2 < N; j2++) { var m2 = 0; for (var i2 = 0; i2 < N; i2++) m2 = Math.max(m2, H[i2][j2]); if (m2 !== R[j2]) return; } var s = sum(H); if (s < best.min) { best.min = s; best.minH = JSON.parse(JSON.stringify(H)); } if (s > best.max) { best.max = s; best.maxH = JSON.parse(JSON.stringify(H)); } return; }
      var i = Math.floor(p / N), j = p % N; for (var v = 0; v <= Math.min(F[i], R[j]); v++) { H[i][j] = v; rec(p + 1); } H[i][j] = 0;
    })(0);
    return best;
  }
  function viewsFromFR(F, R) { var f = [], r = []; for (var k = MAXH - 1; k >= 0; k--) { f.push(F.map(function (x) { return x > k ? 1 : 0; })); r.push(R.map(function (x) { return x > k ? 1 : 0; })); } return { front: f, right: r }; }
  function viewCap(g, name, u) { var d = h('div', { class: 'ps-viewbox' }); d.append(PS.viewSvg(g, { u: u || 22 }), h('span', {}, name)); return d; }

  /* 建造介面：左邊俯視格（點一下加 1 塊），右邊 3D */
  function buildUI(host, o) {
    o = o || {}; var H = zeros(), row = PS.stage(host), gc = h('div', { class: 'ps-gridcol' }), grid = h('div', { class: 'ps-cellgrid' }), btn = [];
    grid.style.gridTemplateColumns = 'repeat(' + N + ',1fr)'; gc.append(h('div', { class: 'ps-cap' }, '俯視格：點一下加 1 塊'), grid); row.append(gc);
    var sc = PS.scene(row, { scale: 62, aspect: 1.15, maxH: o.maxH || 150, center: [N / 2, MAXH / 2, -N / 2], yaw: -0.65, pitch: 0.5 });
    var api = { H: H, sc: sc, onChange: o.onChange };
    function refresh() {
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) { var v = H[c][N - 1 - r], b = btn[r * N + c]; b.textContent = v ? String(v) : ''; b.dataset.n = v; }
      sc.faces = faces(H); sc.invalidate(); if (api.onChange) api.onChange(H);
    }
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) (function (r, c) { var b = h('button', { type: 'button', class: 'ps-cell', 'aria-label': '加一塊' }); b.addEventListener('click', function () { var i = c, j = N - 1 - r; H[i][j] = (H[i][j] + 1) % (MAXH + 1); refresh(); }); btn.push(b); grid.append(b); })(r, c);
    api.refresh = refresh; api.clear = function () { for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) H[i][j] = 0; refresh(); }; refresh(); return api;
  }

  var steps = [
    /* 1 三個方向看 */
    function (st, api) {
      var H = [[2, 1, 0], [1, 1, 2], [0, 0, 1]], V = PS.views(H), seen = {}, n = 0, gate = { on: true };
      P.choice(st, api, { id: 'sv-p1', predict: true, label: '先猜猜看', prompt: '從<b>正上方</b>往下看這堆積木（共 8 塊），會看到幾個正方形？', row: true, options: [{ t: '8 個' }, { t: '6 個' }, { t: '5 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('按「前視、上視、右視」看看'); } });
      var sc = PS.scene(st, { scale: 60, aspect: 1.7, maxH: Math.max(140, Math.min(190, window.innerHeight - 560)), center: [N / 2, MAXH / 2, -N / 2], yaw: -0.65, pitch: 0.5 });
      sc.faces = faces(H); sc.invalidate();
      var holder = h('div', { class: 'ps-viewrow' }); var info = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, info);
      var names = { front: '前視圖', top: '上視圖', right: '右視圖' }, cams = { solid: [-0.65, 0.5], front: [0, 0], top: [0, Math.PI / 2], right: [-Math.PI / 2, 0] };
      var seg = PS.seg(st, [{ k: 'solid', t: '立體' }, { k: 'front', t: '前視' }, { k: 'top', t: '上視' }, { k: 'right', t: '右視' }], function (k) {
        if (gate.on) { seg.set('solid', false); P.toast('先做上面的預測'); return; }
        sc.setView(cams[k][0], cams[k][1]); holder.innerHTML = '';
        if (k === 'solid') { info.textContent = '拖動可以自己轉'; } else { holder.append(viewCap(V[k], names[k], 24)); var cnt = 0; V[k].forEach(function (r) { r.forEach(function (x) { cnt += x; }); }); info.textContent = names[k] + '：看到 ' + cnt + ' 個正方形'; if (!seen[k]) { seen[k] = 1; n++; } }
        if (n >= 3 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-views', step: 1 }); st.append(P.ruleBox('從<b>前、上、右</b>三個方向看，各得到一張<b>平面圖</b>，叫做<b>三視圖</b>。<br>被擋住的方塊看不見，所以<b>看到的正方形數 ≠ 方塊總數</b>。', '名稱')); P.toast(api.ctx.p1 === 1 ? '你猜對了！上視是 6 個' : '上視圖是 6 個正方形'); api.unlock('三個方向都看過了！'); }
      });
      seg.set('solid', false); st.append(holder, ro); api.lock('先做上面的預測');
    },
    /* 2 由三視圖搭出積木 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '由三視圖搭積木'), P.instr('照著上面的三視圖，在下面<b>搭出一堆積木</b>。三個視圖都對就成功！'));
      var puzzles = [[[1, 0, 0], [2, 1, 0], [1, 1, 2]], [[2, 0, 1], [0, 1, 0], [1, 0, 3]], [[1, 2, 0], [0, 3, 1], [2, 0, 1]]], T = puzzles[PS.rand(puzzles.length)], TV = PS.views(T), done = false;
      var vr = h('div', { class: 'ps-viewrow' }); vr.append(viewCap(TV.front, '前視圖', 20), viewCap(TV.top, '上視圖', 20), viewCap(TV.right, '右視圖', 20)); st.append(vr);
      var pf = P.pill('', ''), pt = P.pill('', ''), pr = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pf, pt, pr);
      var ui = buildUI(st, { maxH: Math.max(125, Math.min(150, window.innerHeight - 610)), onChange: function (H) {
        var V = PS.views(H), a = PS.sameGrid(V.front, TV.front), b = PS.sameGrid(V.top, TV.top), c = PS.sameGrid(V.right, TV.right);
        function set(p, ok, t) { p.className = 'pl-pill ' + (ok ? 'is-ok' : ''); p.textContent = (ok ? '✓ ' : '✗ ') + t; } set(pf, a, '前視'); set(pt, b, '上視'); set(pr, c, '右視');
        if (a && b && c && !done) { done = true; P.track('aha', { id: 'solid-views', step: 2 }); var same = PS.sameGrid(H, T); st.append(P.ruleBox('三個視圖都對了！' + (same ? '' : '<br>你搭的和標準答案<b>不一樣</b>，但三視圖相同——同樣的三視圖，積木堆<b>可能不只一種</b>。'), '發現')); api.unlock('搭對了！'); }
      } });
      st.append(ro, P.hint('先看上視圖決定哪些格有積木，再用前視、右視決定高度。')); api.lock('三個視圖都對');
    },
    /* 3 最少與最多 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '最少、最多'), P.instr('只給<b>前視圖</b>和<b>右視圖</b>，積木堆有很多種搭法。找出<b>最少</b>和<b>最多</b>要幾塊。'));
      var F = [2, 3, 1], R = [3, 1, 2], MM = minMax(F, R), TV = viewsFromFR(F, R), got = { min: false, max: false };
      var vr = h('div', { class: 'ps-viewrow' }); vr.append(viewCap(TV.front, '前視圖', 20), viewCap(TV.right, '右視圖', 20)); st.append(vr);
      var pc = P.pill('', ''), pm = P.pill('最少：？', ''), px = P.pill('最多：？', ''), ro = h('div', { class: 'pl-readout' }, pc, pm, px);
      var ui = buildUI(st, { maxH: Math.max(125, Math.min(150, window.innerHeight - 600)), onChange: function (H) {
        var V = PS.views(H), ok = PS.sameGrid(V.front, TV.front) && PS.sameGrid(V.right, TV.right), s = sum(H); pc.className = 'pl-pill ' + (ok ? 'is-ok' : ''); pc.textContent = (ok ? '✓ 符合兩個視圖　' : '✗ 還不符合　') + s + ' 塊';
        if (ok && s === MM.min && !got.min) { got.min = true; pm.className = 'pl-pill is-ok'; pm.textContent = '最少：' + MM.min + ' 塊 ✓'; P.toast('找到最少：' + MM.min + ' 塊'); }
        if (ok && s === MM.max && !got.max) { got.max = true; px.className = 'pl-pill is-ok'; px.textContent = '最多：' + MM.max + ' 塊 ✓'; P.toast('找到最多：' + MM.max + ' 塊'); }
        if (got.min && got.max && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-views', step: 3 }); st.append(P.ruleBox('<b>最多</b>：每一格都放到「前視、右視要求的較小值」。<b>最少</b>：只放必要的，讓每個要求的高度剛好被某一格達到。<br>這一題：最少 <b>' + MM.min + '</b> 塊、最多 <b>' + MM.max + '</b> 塊。', '推理')); api.unlock('找到最少與最多了！'); }
      } });
      st.append(ro, P.hint('格子最多放 3 塊。符合兩個視圖才算數。先試試把每格都放滿，再一格一格拿掉。')); api.lock('找出最少與最多');
    },
    /* 4 換個外觀 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var H = [[1, 0, 0], [3, 1, 0], [0, 2, 2]], V = PS.views(H), g = h('div', { class: 'ps-cellgrid ps-cellgrid--static' });
          g.style.gridTemplateColumns = 'repeat(3,1fr)'; for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) { var v = H[c][N - 1 - r]; g.append(h('div', { class: 'ps-cell ps-cell--static', 'data-n': v }, v ? String(v) : '')); }
          var fig = h('div', { class: 'ps-viewrow' }, h('div', { class: 'ps-viewbox' }, g, h('span', {}, '俯視：每格的方塊數（上＝後面）'))); box.append(fig);
          var flip = V.front.map(function (r) { return r.slice().reverse(); }), tr = [[0, 0, 0], [0, 0, 0], [0, 0, 0]].map(function (_, i) { return [0, 1, 2].map(function (j) { return V.top[i][j]; }); });
          var opts = [{ g: flip, ok: false, fb: '左右反了。前視圖的左邊對應俯視格的左邊那一欄。' }, { g: V.front, ok: true, fb: '對！每一欄取最高的那一格：左欄 1、中欄 3、右欄 2。' }, { g: V.right, ok: false, fb: '這是從右邊看的右視圖。' }];
          P.choice(box, {}, { id: 'sv-t1', prompt: '上面是<b>俯視</b>時每格的方塊數。<b>前視圖</b>（從前面看）是哪一個？', row: true, options: opts.map(function (o2) { return { t: PS.viewSvgHtml(o2.g, 14), ok: o2.ok, fb: o2.fb }; }), onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var H = [[2, 1, 0], [0, 3, 1], [1, 0, 2]], V = PS.views(H);
          var sc = PS.scene(box, { scale: 60, aspect: 1.7, maxH: Math.max(130, Math.min(170, window.innerHeight - 600)), center: [N / 2, MAXH / 2, -N / 2], yaw: -0.65, pitch: 0.5 }); sc.faces = faces(H); sc.invalidate();
          var cams = { solid: [-0.65, 0.5], right: [-Math.PI / 2, 0] }; var seg = PS.seg(box, [{ k: 'solid', t: '立體' }, { k: 'right', t: '右視' }], function (k) { sc.setView(cams[k][0], cams[k][1]); });
          var cnt = 0; V.right.forEach(function (r) { r.forEach(function (x) { cnt += x; }); });
          box.append(h('div', { class: 'pl-q', html: '這堆積木的<b>右視圖</b>有幾個正方形？（按「右視」看）' })); P.numBox(box, { answer: cnt, unit: '個', okMsg: '對！右視圖每一欄取最高：從前到後高度 ' + [0, 1, 2].map(function (j) { return Math.max(H[0][j], H[1][j], H[2][j]); }).join('、') + '，共 ' + cnt + ' 個。', onOk: next, wrong: function () { return '提示：右視圖由前到後，每一欄看最高的那一疊。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var F = [1, 3, 2], R = [2, 3, 1], MM = minMax(F, R), TV = viewsFromFR(F, R);
          var vr = h('div', { class: 'ps-viewrow' }); vr.append(viewCap(TV.front, '前視圖', 22), viewCap(TV.right, '右視圖', 22)); box.append(vr);
          box.append(h('div', { class: 'pl-q', html: '只知道前視圖和右視圖，這堆積木<b>最少</b>要幾塊？' })); P.numBox(box, { answer: MM.min, unit: '塊', okMsg: '對！最少 ' + MM.min + ' 塊（最多是 ' + MM.max + ' 塊）。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-views' }); }, wrong: function () { return '提示：前視圖三欄高 1、3、2；右視圖三列高 2、3、1。每個高度至少要有一格放到那麼高，而且一格可以同時滿足兩邊。'; } });
        }];
      function next() { setTimeout(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 5 完成 */
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
  new P.Lesson({ id: 'solid-views', title: '各種角度觀察', steps: steps });
})();
