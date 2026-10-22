/* 獵豹玩中學｜展開圖：正方體 11 種展開圖、判斷能不能摺、柱體與錐體展開、螞蟻爬立方體（最短路徑） */
(function () {
  var P = Play, h = P.h, D = Play3D, V3 = PS.v, PI = Math.PI;
  var CUBECOL = ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'];

  /* ---------------------------------------------------------------- 展開圖場景 */
  function NetScene(host, o) {
    o = o || {}; this.sc = PS.scene(host, { fitR: 2, twoCol: !!(o.aspect && o.aspect < 1.3), yaw: -0.4, pitch: 0.85 }); this.net = null; this.t = 0; this.labels = o.labels !== false;
  }
  NetScene.prototype = {
    setNet: function (net, colors) { this.net = net; this.colors = colors || null; this.setT(0); },
    centerAt: function (t) { var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; this.net.all(t).forEach(function (F) { F.forEach(function (p) { for (var i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } }); }); return [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2]; },
    setT: function (t) {
      var net = this.net, self = this, F = net.all(t), mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; this.t = t;
      F.forEach(function (pts) { pts.forEach(function (p) { for (var i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } }); });
      var c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], R = 0.3; F.forEach(function (pts) { pts.forEach(function (p) { R = Math.max(R, V3.len(V3.sub(p, c))); }); });
      this.sc.center = c; this.sc.fit(R);
      this.sc.faces = F.map(function (pts, i) { var f = net.faces[i]; return { pts: pts, fill: f.color || (self.colors ? self.colors[i % self.colors.length] : CUBECOL[i % 6]), alpha: 0.88, stroke: '#122548', lw: 1.6, label: self.labels && f.label ? f.label : '', labelSize: 18, double: true }; });
      /* 摺線：每個面和它的父面共用的那條邊（虛線，跟著摺）。面太多（圓柱、圓錐）就不畫 */
      this.sc.lines = net.n <= 8 ? net.faces.map(function (f, i) { var hg = net.hinge(i, t); return hg ? { a: hg[0], b: hg[1], color: '#d6336c', w: 3, dash: [6, 4], bias: 4 } : null; }).filter(Boolean) : [];
      this.sc.invalidate();
    },
    /* 彈簧摺到 t1 */
    animate: function (t1, done) { var self = this, sp = PS.spring(this.t, { k: 55, zeta: 0.85, onUpdate: function (v) { self.setT(Math.max(0, Math.min(1.02, v))); }, onRest: function () { self.setT(t1); if (done) done(); } }); sp.to(t1); }
  };

  /* ---------------------------------------------------------------- 柱體與錐體的展開圖 */
  function regularOnEdge(A, B, n, outward) { // 以 A、B 為一邊的正 n 邊形，位於邊的 outward 方向（單位向量）
    var w = Math.hypot(B[0] - A[0], B[1] - A[1]), R = w / (2 * Math.sin(PI / n)), ap = w / (2 * Math.tan(PI / n)), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], C = [M[0] + outward[0] * ap, M[1] + outward[1] * ap];
    var th0 = Math.atan2(A[1] - C[1], A[0] - C[0]), th1 = Math.atan2(B[1] - C[1], B[0] - C[0]), dir = Math.sin(th1 - th0) > 0 ? 1 : -1, pts = [];
    for (var k = 0; k < n; k++) pts.push([C[0] + R * Math.cos(th0 + dir * 2 * PI * k / n), C[1] + R * Math.sin(th0 + dir * 2 * PI * k / n)]);
    return pts;
  }
  var LAT = '#9db7ee', BASE = '#f3a6c3';
  function netTPrism() {
    var s = 1.2, H = 1.6, F = [], i;
    for (i = 0; i < 3; i++) F.push({ p: [[i * s, 0], [(i + 1) * s, 0], [(i + 1) * s, H], [i * s, H]], parent: i ? i - 1 : -1, a: [i * s, 0], b: [i * s, H], phi: 2 * PI / 3, color: LAT });
    F.push({ p: [[0, 0], [s, 0], [s / 2, -s * Math.sqrt(3) / 2]], parent: 0, a: [0, 0], b: [s, 0], phi: PI / 2, color: BASE }, { p: [[0, H], [s, H], [s / 2, H + s * Math.sqrt(3) / 2]], parent: 0, a: [0, H], b: [s, H], phi: PI / 2, color: BASE });
    return new PS.Net(F);
  }
  function netSPyramid() {
    var a = 0.7, H = 1.2, L = Math.sqrt(H * H + a * a), phi = PI - Math.atan(H / a), F = [{ p: [[-a, -a], [a, -a], [a, a], [-a, a]], parent: -1, color: BASE }];
    F.push({ p: [[-a, a], [a, a], [0, a + L]], parent: 0, a: [-a, a], b: [a, a], phi: phi, color: LAT }, { p: [[a, a], [a, -a], [a + L, 0]], parent: 0, a: [a, a], b: [a, -a], phi: phi, color: LAT },
      { p: [[a, -a], [-a, -a], [0, -a - L]], parent: 0, a: [a, -a], b: [-a, -a], phi: phi, color: LAT }, { p: [[-a, -a], [-a, a], [-a - L, 0]], parent: 0, a: [-a, -a], b: [-a, a], phi: phi, color: LAT });
    return new PS.Net(F);
  }
  function netCylinder() {
    var n = 24, r = 0.55, w = 2 * PI * r / n, H = 1.3, F = [], i;
    for (i = 0; i < n; i++) F.push({ p: [[i * w, 0], [(i + 1) * w, 0], [(i + 1) * w, H], [i * w, H]], parent: i ? i - 1 : -1, a: [i * w, 0], b: [i * w, H], phi: 2 * PI / n, color: i % 2 ? '#9db7ee' : '#b3c8f3' });
    var ap = w / (2 * Math.tan(PI / n)), top = regularOnEdge([0, H], [w, H], n, [0, 1]), bot = regularOnEdge([w, 0], [0, 0], n, [0, -1]);
    F.push({ p: top, parent: 0, a: [0, H], b: [w, H], phi: PI / 2, color: BASE }, { p: bot, parent: 0, a: [w, 0], b: [0, 0], phi: PI / 2, color: BASE });
    return new PS.Net(F);
  }
  function netCone() {
    var n = 24, R = 0.6, L = 1.5, Hc = Math.sqrt(L * L - R * R), wb = 2 * R * Math.sin(PI / n), alpha = 2 * Math.asin(wb / (2 * L)), ab = R * Math.cos(PI / n), F = [], i;
    var cosphi = (Hc * Hc * Math.cos(2 * PI / n) + ab * ab) / (Hc * Hc + ab * ab), phi = Math.acos(Math.max(-1, Math.min(1, cosphi)));
    for (i = 0; i < n; i++) { var B0 = [L * Math.cos(i * alpha), L * Math.sin(i * alpha)], B1 = [L * Math.cos((i + 1) * alpha), L * Math.sin((i + 1) * alpha)]; F.push({ p: [[0, 0], B0, B1], parent: i ? i - 1 : -1, a: [0, 0], b: B0, phi: phi, color: i % 2 ? '#9db7ee' : '#b3c8f3' }); }
    var B0 = [L, 0], B1 = [L * Math.cos(alpha), L * Math.sin(alpha)], M = [(B0[0] + B1[0]) / 2, (B0[1] + B1[1]) / 2], ln = Math.hypot(M[0], M[1]), out = [M[0] / ln, M[1] / ln], phib = PI - Math.atan(Hc / ab);
    F.push({ p: regularOnEdge(B0, B1, n, out), parent: 0, a: B0, b: B1, phi: phib, color: BASE });
    return new PS.Net(F);
  }
  var SOLIDS = { tprism: { name: '正三角柱', mk: netTPrism, note: '側面 3 個長方形排成一排，上下各接一個三角形。' }, spyr: { name: '正四角錐', mk: netSPyramid, note: '一個正方形底面，四邊各接一個三角形。' }, cyl: { name: '圓柱', mk: netCylinder, note: '側面展開是<b>長方形</b>：長＝底圓周長 2πr、寬＝高；上下各接一個圓。' }, cone: { name: '圓錐', mk: netCone, note: '側面展開是<b>扇形</b>：弧長＝底圓周長；再接一個圓當底面。' } };

  function hexInfo() {
    var all = PS.hexominoes(), valid = [], bad = []; all.forEach(function (c) { (PS.cubeNet(c).cubeValid() ? valid : bad).push(c); });
    function run(c) { var m = 1, set = {}; c.forEach(function (x) { set[x.join(',')] = 1; }); c.forEach(function (x) { [[1, 0], [0, 1]].forEach(function (d) { var l = 1, p = [x[0] + d[0], x[1] + d[1]]; if (set[[x[0] - d[0], x[1] - d[1]].join(',')]) return; while (set[p.join(',')]) { l++; p = [p[0] + d[0], p[1] + d[1]]; } m = Math.max(m, l); }); }); return m; }
    valid.sort(function (a, b) { return run(b) - run(a); }); return { all: all, valid: valid, bad: bad, run: run };
  }

  var steps = [
    /* 1 摺起來 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '展開圖'), P.instr('把正方體沿稜剪開、攤平，就是<b>展開圖</b>。拉動滑桿，把它<b>摺回正方體</b>。'));
      var cells = [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]], net = PS.cubeNet(cells, 1), ns = new NetScene(st, { maxH: Math.max(170, Math.min(230, window.innerHeight - 520)) }), done = false;
      ns.setNet(net); ns.sc.pitch = 0.9; ns.sc.invalidate();
      var pr = P.pill('攤平', ''), ro = h('div', { class: 'pl-readout' }, pr);
      var sl = P.slider(0, 100, 0, function (v) { ns.setT(v / 100); var t = v / 100; pr.textContent = t < 0.02 ? '攤平' : t > 0.98 ? '摺好了！' : '摺到 ' + Math.round(v) + '%'; pr.className = 'pl-pill' + (t > 0.98 ? ' is-ok' : ''); if (t > 0.98 && !done) { done = true; P.track('aha', { id: 'solid-nets', step: 1 }); st.append(P.ruleBox('展開圖的 <b>6 個正方形</b>，摺起來剛好變成正方體的 <b>6 個面</b>。<br>數字相同的面，攤平和摺起來是同一面（可以拖動轉轉看）。', '名稱')); api.unlock('摺成正方體了！'); } });
      sl.addEventListener('change', function () { if (+sl.value > 90 && +sl.value < 100) { sl.value = 100; sl.dispatchEvent(new Event('input')); } });
      api.solve(function () { sl.value = 100; sl.dispatchEvent(new Event('input')); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 攤平'), h('span', {}, '摺起來 →')), ro, P.hint('數字是面的編號，粉紅虛線是摺線。也可以用手指拖動畫面，轉到不同角度看。')); api.lock('把滑桿拉到最右邊');
    },
    /* 2 能摺還是不能摺 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '能不能摺成正方體？'), P.instr('每個都由 <b>6 個正方形</b>連成。先<b>猜</b>能不能摺成正方體，再看它怎麼摺。數字是面的編號，粉紅虛線是<b>摺線</b>。'));
      var info = hexInfo(), seq = PS.shuffle(PS.shuffle(info.valid).slice(0, 4).map(function (c) { return { c: c, ok: true }; }).concat(PS.shuffle(info.bad).slice(0, 3).map(function (c) { return { c: c, ok: false }; }))), i = 0, right = 0, tried = 0, locked = false;
      var row = PS.stage(st), left = h('div', { class: 'ps-col ps-netcol' }); row.append(left); var ns = new NetScene(row, { aspect: 1.15, maxH: Math.max(130, Math.min(170, window.innerHeight - 600)) });
      var pr = P.pill('', ''), pc = P.pill('', 'is-blue'), ro = h('div', { class: 'pl-readout' }, pr, pc);
      var br = PS.btnRow(st, [{ k: 'y', t: '✓ 能摺', cls: 'is-green', fn: function () { judge(true); } }, { k: 'n', t: '✗ 不能摺', cls: 'is-pink', fn: function () { judge(false); } }, { k: 'next', t: '下一個 ▶', fn: function () { next(); } }]);
      br.b.next.style.display = 'none';
      function load() { var q = seq[i % seq.length]; left.innerHTML = ''; left.append(PS.netSvg(q.c, { u: 24, numbers: true })); ns.setNet(PS.cubeNet(q.c), null); locked = false; br.b.y.disabled = br.b.n.disabled = false; br.b.next.style.display = 'none'; pr.className = 'pl-pill'; pr.textContent = '第 ' + (i + 1) + ' 個：你覺得呢？'; pc.textContent = '答對 ' + right + ' / ' + tried; }
      function judge(says) {
        if (locked) return; locked = true; var q = seq[i % seq.length], ok = says === q.ok; tried++; if (ok) right++; br.b.y.disabled = br.b.n.disabled = true;
        pr.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-pink'); pr.textContent = (ok ? '✓ 答對了：' : '✗ 答錯了：') + (q.ok ? '它能摺成正方體' : '它摺不成正方體（紅色的兩個面疊在一起）'); pc.textContent = '答對 ' + right + ' / ' + tried;
        ns.animate(1, q.ok ? null : function () { var d = ns.net.dirs(), cnt = {}; d.forEach(function (x) { var k = x.join(); cnt[k] = (cnt[k] || 0) + 1; }); ns.sc.faces.forEach(function (f, j) { if (cnt[d[j].join()] > 1) { f.fill = '#e03131'; f.alpha = 0.9; } }); ns.sc.invalidate(); }); br.b.next.style.display = '';
        if (right >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-nets', step: 2 }); st.append(P.ruleBox('不是每個「6 個正方形連在一起」都能摺成正方體！<br>常見<b>不能摺</b>：<b>一排有 5 個</b>、有 <b>2×2 的四個方塊擠在一起</b>、兩個面摺過去會<b>疊在同一面</b>。', '規律')); api.unlock('抓到訣竅了！'); }
      }
      function next() { i++; load(); }
      api.solve(function () { for (var g = 0; g < 12 && right < 4; g++) { if (locked) next(); judge(seq[i % seq.length].ok); } });
      st.append(ro, P.hint('答對 4 個就過關；錯了也沒關係，看它怎麼摺會更清楚。')); load(); api.lock('答對 4 個');
    },
    /* 3 11 種 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '正方體的展開圖'), P.instr('6 個正方形連起來共有 35 種，其中<b>只有 11 種</b>能摺成正方體。把 11 種都<b>點開看一遍</b>。'));
      var info = hexInfo(), V = info.valid, seen = {}, n = 0, cur = 0, ns = new NetScene(st, { aspect: 1.9, maxH: Math.max(130, Math.min(170, window.innerHeight - 590)) });
      var pr = P.pill('已看 0 / 11', 'is-blue'), pg = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pr, pg), pick = h('div', { class: 'ps-netpick' }), btns = [];
      V.forEach(function (c, k) { var b = h('button', { type: 'button', 'aria-label': '第 ' + (k + 1) + ' 種' }); b.append(PS.netSvg(c, { u: 9 })); b.addEventListener('click', function () { show(k); }); btns.push(b); pick.append(b); });
      function show(k) {
        cur = k; btns.forEach(function (b, j) { b.classList.toggle('is-sel', j === k); }); var c = V[k]; ns.setNet(PS.cubeNet(c), null); ns.animate(1);
        var run = info.run(c); pg.textContent = '第 ' + (k + 1) + ' 種：' + (run === 4 ? '有一排 4 個' : run === 3 ? '最長一排 3 個' : '階梯形（最長一排 2 個）');
        if (!seen[k]) { seen[k] = 1; n++; btns[k].classList.add('is-seen'); pr.textContent = '已看 ' + n + ' / 11'; }
        if (n >= 11 && !st.querySelector('.pl-rule')) { var g4 = V.filter(function (x) { return info.run(x) === 4; }).length, g3 = V.filter(function (x) { return info.run(x) === 3; }).length, g2 = V.length - g4 - g3; P.track('aha', { id: 'solid-nets', step: 3 }); st.append(P.ruleBox('正方體的展開圖<b>共 11 種</b>：<b>一排 4 個</b>的 ' + g4 + ' 種、<b>最長一排 3 個</b>的 ' + g3 + ' 種、<b>階梯形</b>的 ' + g2 + ' 種。', '共 11 種')); api.unlock('11 種都看過了！'); }
      }
      api.solve(function () { V.forEach(function (c, k) { if (!seen[k]) show(k); }); });
      st.append(pick, ro, P.hint('點一個縮圖，看它怎麼摺；數字＝面的編號、粉紅虛線＝摺線；綠色＝已看過。')); show(0); api.lock('把 11 種都點開看過');
    },
    /* 4 柱體與錐體 */
    function (st, api) {
      var gate = { on: true }, seen = {}, ns = null, cur = 'tprism', fold = 0;
      P.choice(st, api, { id: 'sn-p4', predict: true, label: '先猜猜看', prompt: '圓錐的<b>側面</b>攤平，會是什麼形狀？', row: true, options: [{ t: '長方形' }, { t: '扇形' }, { t: '圓形' }], onAnswer: function (i) { api.ctx.p4 = i; gate.on = false; api.lock('四種立體都摺一次'); } });
      ns = new NetScene(st, { aspect: 1.8, maxH: Math.max(130, Math.min(180, window.innerHeight - 600)), labels: false });
      var pn = h('div', { class: 'pl-caption' }), pr = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pr);
      var seg = PS.seg(st, [{ k: 'tprism', t: '三角柱' }, { k: 'spyr', t: '四角錐' }, { k: 'cyl', t: '圓柱' }, { k: 'cone', t: '圓錐' }], function (k) { if (gate.on) { seg.set(cur, false); P.toast('先做上面的預測'); return; } load(k); });
      var sl = P.slider(0, 100, 0, function (v) { ns.setT(v / 100); fold = v / 100; if (fold > 0.98) mark(); }); sl.addEventListener('change', function () { if (+sl.value > 90 && +sl.value < 100) { sl.value = 100; sl.dispatchEvent(new Event('input')); } });
      function mark() { if (seen[cur]) return; seen[cur] = 1; var n = Object.keys(seen).length; pr.textContent = '已摺過 ' + n + ' / 4 種'; pn.innerHTML = SOLIDS[cur].note;
        if (n >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-nets', step: 4 }); st.append(P.ruleBox('<b>柱體</b>的側面展開是長方形；<b>錐體</b>的側面是三角形（圓錐是<b>扇形</b>）。<br>圓柱側面的長 ＝ 底圓周長 <b>2πr</b>。', '性質')); P.toast(api.ctx.p4 === 1 ? '你猜對了！圓錐側面是扇形' : '圓錐側面展開是扇形'); api.unlock('四種都摺過了！'); } }
      function load(k) { cur = k; seg.set(k, false); ns.setNet(SOLIDS[k].mk(), null); ns.sc.pitch = -0.95; ns.sc.yaw = -0.5; sl.value = 0; fold = 0; pn.innerHTML = SOLIDS[k].note; }
      seg.set('tprism', false); load('tprism'); pr.textContent = '已摺過 0 / 4 種';
      api.solve(function () { gate.on = false; ['tprism', 'spyr', 'cyl', 'cone'].forEach(function (k) { if (seen[k]) return; load(k); sl.value = 100; sl.dispatchEvent(new Event('input')); }); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 攤平'), h('span', {}, '摺起來 →')), pn, ro); api.lock('先做上面的預測');
    },
    /* 5 螞蟻爬立方體 */
    function (st, api) {
      var gate = { on: true };
      P.choice(st, api, { id: 'sn-p5', predict: true, label: '先猜猜看', prompt: '螞蟻從 <b>A</b> 爬到對角的 <b>G</b>。沿著稜走要 3 格。<b>爬過面</b>能更短嗎？', row: true, options: [{ t: '3 格最短' }, { t: '可以更短' }], onAnswer: function (i) { api.ctx.p5 = i; gate.on = false; api.lock('調整路線，再把上面攤平'); } });
      var sc = PS.scene(st, { fitR: 1.75, yaw: -0.55, pitch: 0.5, center: [0, 0.4, 0] });
      var t = 0.2, psi = 0, done = false, A = [-.5, -.5, .5], G = [.5, .5, -.5], hinge = [0, .5, .5];
      var CF = D.cubeFaces(-.5, -.5, -.5, 1, '#fff'), cols = ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'];
      function draw() {
        var X = [-.5 + t, .5, .5], rot = function (p) { var o = [p[0] - hinge[0], p[1] - hinge[1], p[2] - hinge[2]], r = D.rotAxis(o, [1, 0, 0], psi * PI / 180); return [r[0] + hinge[0], r[1] + hinge[1], r[2] + hinge[2]]; };
        sc.faces = CF.map(function (f, i) { var top = i === 4; return { pts: top ? f.pts.map(rot) : f.pts, fill: cols[i], alpha: top ? 0.62 : 0.3, stroke: '#122548', lw: 1.3, flat: true, double: true, nopick: true }; });
        var G2 = rot(G), len1 = Math.hypot(t, 1), len2 = Math.hypot(1 - t, 1), tot = len1 + len2;
        sc.lines = [{ a: A, b: X, color: '#e8590c', w: 4.5, bias: 3 }, { a: X, b: G2, color: '#e8590c', w: 4.5, bias: 3 }, { a: [-.5, .5, .5], b: [.5, .5, .5], color: '#d6336c', w: 3, dash: [6, 4], bias: 4 }];
        sc.texts = [{ p: [0, -0.05, .5], t: '前面', color: '#122548', size: 14, halo: true, top: true }, { p: rot([0, .5, -.05]), t: '上面', color: '#122548', size: 14, halo: true, top: true }, { p: [0, .5, .5], t: '摺線', color: '#d6336c', size: 13, dy: 13, halo: true, top: true }];
        sc.dots = [{ p: A, r: 6, color: '#122548', label: 'A', dy: 16 }, { p: G2, r: 6, color: '#122548', label: 'G', dy: -14 }, { p: X, r: 5, color: '#e8590c' }];
        sc.invalidate(); var straight = psi > 88 && Math.abs(t - 0.5) < 0.001;
        pl.textContent = '全長 ＝ ' + (Math.round(tot * 100) / 100) + '（沿稜走是 3）'; pl.className = 'pl-pill ' + (tot < 2.3 ? 'is-ok' : '');
        if (straight && !done) { done = true; P.track('aha', { id: 'solid-nets', step: 5 }); st.append(P.ruleBox('把兩個面<b>攤平成一個平面</b>，兩點之間<b>直線最短</b>：<br>全長 ＝ √(2² ＋ 1²) ＝ <b>√5 ≈ 2.24</b>，比沿稜走的 3 短！', '最短路徑')); P.toast(api.ctx.p5 === 1 ? '你猜對了！可以更短' : '爬過面可以更短'); api.unlock('找到最短路徑了！'); }
      }
      var pl = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pl);
      var s1 = P.slider(0, 100, 20, function (v) { if (gate.on) { P.toast('先做上面的預測'); return; } t = Math.abs(v - 50) < 4 ? 0.5 : v / 100; draw(); });
      var s2 = P.slider(0, 90, 0, function (v) { if (gate.on) { P.toast('先做上面的預測'); return; } psi = v; draw(); });
      api.solve(function () { gate.on = false; t = 0.5; psi = 90; s1.value = 50; s2.value = 90; draw(); });
      st.append(h('div', { class: 'ps-note' }, '① 路線經過上緣的位置'), s1, h('div', { class: 'ps-note' }, '② 把「上面」往外攤平'), s2, ro, P.hint('先把 ① 調到正中間，再把 ② 拉到最右。')); draw(); api.lock('先做上面的預測');
    },
    /* 6 換個外觀 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var cells = [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]], net = PS.cubeNet(cells, 2), dirs = net.dirs(), my = 0, opp = -1;
          net.faces.forEach(function (f, i) { if (f.label === '1') my = i; }); dirs.forEach(function (d, i) { if (d[0] === -dirs[my][0] && d[1] === -dirs[my][1] && d[2] === -dirs[my][2]) opp = i; });
          var row = PS.stage(box), left = h('div', { class: 'ps-col ps-netcol' }); row.append(left); var svg = h('svg', { viewBox: '0 0 108 80', width: 118, height: 90, class: 'ps-netsvg' });
          net.faces.forEach(function (f) { var c = cells[f.cell], x = c[0] * 26 + 3, y = c[1] * 26 + 3; svg.append(h('rect', { x: x, y: y, width: 26, height: 26, class: 'ps-netcell', fill: f.label === '1' ? 'rgba(214,51,108,.35)' : '' })); var tx = h('text', { x: x + 13, y: y + 18, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#122548' }); tx.textContent = f.label; svg.append(tx); }); left.append(svg);
          var ns = new NetScene(row, { aspect: 1.1, maxH: Math.max(120, Math.min(160, window.innerHeight - 610)) }); ns.setNet(net); ns.setT(1); ns.sc.pitch = 0.5; ns.sc.yaw = -0.6; ns.sc.invalidate();
          var labs = net.faces.map(function (f) { return f.label; }).filter(function (x) { return x !== '1' && x !== net.faces[opp].label; }), opts = [net.faces[opp].label].concat(labs.slice(0, 2)).sort();
          P.choice(box, {}, { id: 'sn-t1', prompt: '摺成正方體後，<b>面 1</b>（粉紅）的對面是哪一面？（右邊可以拖動轉轉看）', row: true, options: opts.map(function (lb) { return { t: '面 ' + lb, ok: lb === net.faces[opp].label, fb: lb === net.faces[opp].label ? '對！相對的面在展開圖上會隔一個正方形。' : '面 ' + lb + ' 和面 1 在立方體上是相鄰的。' }; }), onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var cells = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 2]].slice(0, 0); var cs = [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]];
          var svg = h('svg', { viewBox: '0 0 190 130', class: 'ps-fan', width: '100%' }); cs.forEach(function (c) { svg.append(h('rect', { x: c[0] * 40 + 15, y: c[1] * 40 + 5, width: 40, height: 40, class: 'ps-netcell' })); }); var t1 = h('text', { x: 55, y: 125, 'font-size': 13, 'font-weight': 800, fill: '#d6336c', 'text-anchor': 'middle' }); t1.textContent = '每格邊長 2'; svg.append(t1);
          var st2 = h('div', { class: 'pl-stage' }); st2.append(svg); box.append(st2);
          box.append(h('div', { class: 'pl-q', html: '這個展開圖的每個正方形<b>邊長是 2</b>。整個展開圖的<b>總面積</b>（＝正方體的表面積）是多少？' })); P.numBox(box, { answer: 24, okMsg: '對！6 個面 × (2×2) ＝ 24。', onOk: next, wrong: function () { return '提示：6 個正方形，每個面積 2×2 ＝ 4。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var ns = new NetScene(box, { aspect: 1.9, maxH: Math.max(130, Math.min(170, window.innerHeight - 590)), labels: false }); ns.setNet(netCylinder()); ns.sc.pitch = -0.95; ns.sc.yaw = -0.5; ns.setT(0);
          var sl = P.slider(0, 100, 0, function (v) { ns.setT(v / 100); }); box.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 攤平'), h('span', {}, '摺起來 →')));
          P.choice(box, {}, { id: 'sn-t3', prompt: '把圓柱的側面剪開攤平成<b>長方形</b>。長方形的<b>長邊</b>等於底圓的什麼？', row: true, options: [{ t: '直徑', fb: '直徑是 2r，不是繞一圈的長度。' }, { t: '周長', ok: true, fb: '對！側面繞底圓一圈，所以長邊＝底圓周長 2πr。' }, { t: '面積', fb: '長度不是面積喔。' }], onAnswer: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-nets' }); } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 7 完成 */
    function (st) {
      P.complete(st, {
        id: 'solid-nets', moduleName: '展開圖', askAbout: '國中立體幾何', aha: '正方體的展開圖共有 11 種；<br>立體上最短的路，攤平後是一條直線。',
        cards: [{ text: '展開圖：把立體沿稜剪開攤平；正方體 6 個正方形連成的 35 種圖形中，只有 11 種能摺回正方體', src: '國中「立體圖形：展開圖」（獵豹 J91S 立體圖形、J71S CH5）' }, { text: '柱體側面展開是長方形，圓錐側面展開是扇形；表面最短路徑要把面攤平成直線', src: '資優班常見的立體最短路徑主題（詳細堂次請洽老師）' }],
        depth: { here: 0.22, cheetah: [{ at: 0.5, label: '表面最短路徑<br>圓錐扇形' }, { at: 0.9, label: '多面體展開<br>與著色' }] },
        teasers: [
          { title: '圓錐的側面積', q: '圓錐側面展開成扇形，用扇形面積推出 πrL，怎麼推？', where: 'PK3C 錐體與球體', lv: 'L2' },
          { title: '圓錐上的最短路徑', q: '螞蟻繞圓錐一圈回到同一點，最短路線怎麼走？（攤成扇形再拉直）', where: '數資班拓展（請洽老師）', lv: 'L2' },
          { title: '正多面體的展開圖', q: '正十二面體、正二十面體的展開圖有多少種？為什麼數不完？', where: '數資班拓展（請洽老師）', lv: 'L3' },
          { title: '展開圖與著色', q: '展開圖上塗色，摺起來相鄰的面不同色，最少要幾色？', where: '數資班拓展（請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子常憑感覺判斷展開圖，沒有「摺起來誰和誰相鄰」的概念；遇到螞蟻爬行等最短路徑題，只會沿稜走。', place: '國中立體圖形的核心：表面積、最短路徑與空間想像都用得到展開圖。', ask: ['展開圖上相對的面有什麼規律？', '為什麼一排 5 個正方形不能摺成正方體？', '螞蟻怎麼爬立方體最短？'] },
        classes: ['J91S：立體圖形', 'J71S CH5：三視圖與空間觀察', 'PK3C：錐體與球體'],
        next: { href: 'play-solid-section.html', text: '下一個：截面' } });
    }];
  new P.Lesson({ id: 'solid-nets', title: '展開圖', steps: steps });
})();
