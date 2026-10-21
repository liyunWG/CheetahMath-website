/* 獵豹玩中學｜三角函數：單位圓（半徑 5 格＝1；圓上的格點剛好是 3-4-5） */
(function () {
  var P = Play, h = P.h, rad = Math.PI / 180, C = [6, 6], R = 5;
  function stage(st) { var w = h('div', { class: 'pl-stage' }); st.append(w); return w; }
  function f2(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, function (m) { return m === '.00' ? '' : m.replace(/0+$/, ''); }); }
  function deg(p) { var a = Math.atan2(p[1] - C[1], p[0] - C[0]) / rad; return a < 0 ? a + 360 : a; }
  var LAT = (function () { var c = []; for (var x = 0; x <= 12; x++) for (var y = 0; y <= 12; y++) if (Math.pow(x - C[0], 2) + Math.pow(y - C[1], 2) === R * R) c.push([x, y]); return c; })();
  function onCircle(raw) { var dx = raw[0] - C[0], dy = raw[1] - C[1], L = Math.hypot(dx, dy) || 1; return [C[0] + R * dx / L, C[1] + R * dy / L]; }
  function thetaMark(b, p, g, sym) {
    var th = deg(p); if (th < 3) return; var pts = [], k, a;
    for (k = 0; k <= 24; k++) { a = th * k / 24 * rad; pts.push([C[0] + 1.3 * Math.cos(a), C[1] + 1.3 * Math.sin(a)]); }
    g.append(h('polyline', { points: b.pts(pts), class: 'pl-line pl-line--amber', fill: 'none' }));
    a = th / 2 * rad; b.text([C[0] + 2.1 * Math.cos(a), C[1] + 2.1 * Math.sin(a) - 0.25], sym || 'θ', 'pl-text pl-text--amber pl-text--lg', g);
  }
  function unitBoard(host, sm) {
    var b = new P.Board(host, { w: 12, h: 12, pad: 0.5, axes: true, ox: 6, oy: 6, cls: sm ? 'pl-svg--sm' : '' }); if (!sm) P.snapSwitch(b, host);
    b.circle(C, R, 'pl-circle pl-circle--unit'); b.text([C[0] + R + 0.05, C[1] - 0.45], '1', 'pl-text pl-text--sm'); b.text([C[0] - 0.4, C[1] + R + 0.15], '1', 'pl-text pl-text--sm'); b.text([C[0] - 0.4, C[1] - 0.5], 'O', 'pl-text pl-text--sm');
    return b;
  }
  function circleHandle(b, start, onMove, extra) {
    var o = { pos: start, candidates: function () { return b.snapOn ? LAT : null; }, constrain: onCircle, onMove: onMove }; if (extra) for (var k in extra) o[k] = extra[k];
    return b.handle(o);
  }
  function clipLine(dir) { var t = 99; if (dir[0]) t = Math.min(t, (dir[0] > 0 ? 12 - C[0] : C[0]) / Math.abs(dir[0])); if (dir[1]) t = Math.min(t, (dir[1] > 0 ? 12 - C[1] : C[1]) / Math.abs(dir[1])); return t; }

  var steps = [
    /* 1 單位圓：座標＝(cos, sin) */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '單位圓（半徑＝1）'), P.instr('拖動綠點 P 繞圓一圈。先把 P 拖到 <b>cos θ ＝ 0</b> 的地方。'));
      var host = stage(st), b = unitBoard(host), g = h('g'); b.gMid.append(g); var done = false;
      var pc = P.pill('', 'is-blue'), ps = P.pill('', 'is-pink'), pa = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pa, pc, ps);
      function draw(p) {
        g.innerHTML = ''; var cs = (p[0] - C[0]) / R, sn = (p[1] - C[1]) / R, th = deg(p);
        b.line(C, p, 'pl-line', g); b.line(C, [p[0], C[1]], 'pl-line pl-line--blue pl-line--bold', g); thetaMark(b, p, g); b.line([p[0], C[1]], p, 'pl-line pl-line--pink pl-line--bold', g);
        pa.textContent = 'θ ＝ ' + f2(th) + '°'; pc.textContent = 'cos θ ＝ ' + f2(cs) + '（橫）'; ps.textContent = 'sin θ ＝ ' + f2(sn) + '（縱）';
        return Math.abs(cs) < 1e-9;
      }
      function move(t) {
        var ok = draw(t); if (ok && !done) { done = true; P.track('aha', { id: 'trig-circle', step: 1 }); st.append(P.ruleBox('單位圓上的點 P：<b>橫座標 ＝ cos θ</b>，<b>縱座標 ＝ sin θ</b>。<br>半徑是 1，所以 sin θ、cos θ 一定在 −1 到 1 之間。', '定義')); api.unlock('cos θ ＝ 0，P 在最上或最下！'); }
      }
      var hd = circleHandle(b, [9, 10], move);
      api.solve(function () { hd.set([6, 11]); move([6, 11]); });
      draw([9, 10]); st.append(ro, P.hint('藍＝橫向（cos θ）、粉紅＝縱向（sin θ）。圓上的格點剛好是 3-4-5。')); api.lock('把 P 拖到最上面或最下面');
    },
    /* 2 sin²+cos²=1 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '為什麼 sin²θ ＋ cos²θ ＝ 1'), P.instr('P 在圓上，藍、粉紅、黑三條線圍成<b>直角三角形</b>。黑色斜邊是 <b>1</b>。'));
      var host = stage(st), b = unitBoard(host), g = h('g'); b.gMid.append(g);
      var pe = P.pill('', 'is-blue'), ro = h('div', { class: 'pl-readout' }, pe), seen = {}, n = 0, ask = h('div', {});
      function draw(p) {
        g.innerHTML = ''; var cs = (p[0] - C[0]) / R, sn = (p[1] - C[1]) / R;
        b.poly([C, [p[0], C[1]], p], 'pl-poly pl-poly--amber', g); thetaMark(b, p, g); b.text([(C[0] + p[0]) / 2, C[1] - (sn >= 0 ? 0.55 : -0.4)], 'cos θ', 'pl-text pl-text--blue pl-text--sm', g); b.text([p[0] + (cs >= 0 ? 0.55 : -0.55), (C[1] + p[1]) / 2], 'sin θ', 'pl-text pl-text--pink pl-text--sm', g); b.text([(C[0] + p[0]) / 2 + (cs >= 0 ? -0.5 : 0.5), (C[1] + p[1]) / 2 + (sn >= 0 ? 0.5 : -0.5)], '1', 'pl-text pl-text--sm', g);
        pe.textContent = 'cos²θ ＋ sin²θ ＝ ' + f2(cs * cs) + ' ＋ ' + f2(sn * sn) + ' ＝ ' + f2(cs * cs + sn * sn);
      }
      var hd = circleHandle(b, [9, 10], function (t) { draw(t); var k = t.join(); if (!seen[k]) { seen[k] = 1; n++; } if (n >= 3 && !ask.firstChild) showAsk(); });
      api.solve(function () { hd.set([9, 10]); draw([9, 10]); if (!ask.firstChild) showAsk(); });
      function showAsk() {
        var sv = host.querySelector('svg'); if (sv) sv.style.maxHeight = '215px';
        var qb = h('div', {}); ask.append(qb);
        qb.append(h('div', { class: 'pl-q', html: '第一象限，<b>cos θ ＝ 0.6</b>，那 <b>sin θ ＝ ？</b><br><small>看上面藍色算式：<b>平方</b>後相加會等於 1。</small>' }));
        P.numBox(qb, { answer: 0.8, okMsg: '對！畢氏定理：0.6² ＋ 0.8² ＝ 1。', onOk: function () { P.track('aha', { id: 'trig-circle', step: 2 }); setTimeout(function () { qb.style.display = 'none'; }, 1100); ask.append(P.ruleBox('畢氏定理：<b>cos²θ ＋ sin²θ ＝ 1</b><br>它不是要背的公式，是圓的半徑 ＝ 1。', '公式')); api.unlock('這條公式看得見了！'); }, wrong: function (v) { return v === 0.4 ? '0.6 ＋ 0.4 ＝ 1 是「直接相加」，但公式要的是「<b>平方後</b>再相加」：cos²θ ＋ sin²θ ＝ 1。<br>先算 0.6² ＝ 0.36，所以 sin²θ ＝ 1 − 0.36 ＝ 0.64；sin θ 是「平方後等於 0.64」的數。' : v === 0.64 ? '0.64 是 sin²θ（平方後的值）。sin θ 要再「開根號」：什麼數乘以自己等於 0.64？' : '提示：cos²θ ＋ sin²θ ＝ 1。0.6² ＝ 0.36，所以 sin²θ ＝ 1 − 0.36 ＝ 0.64。'; } });
      }
      draw([9, 10]); st.append(ro, ask, P.hint('先拖動 P 到 3 個不同位置，會出現一個問題。')); api.lock('拖動 P，再回答問題');
    },
    /* 3 tan */
    function (st, api) {
      var gate = { on: true }, ask = null;
      P.choice(st, api, { id: 'tc-p3', predict: true, label: '先猜猜看', prompt: 'P 從右邊 (θ＝0°) 往上轉，快到 90° 時，tan θ 會…？', row: true, options: [{ t: '越來越小' }, { t: '越來越大' }, { t: '不變' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('把 P 慢慢拖到最上面'); } });
      var host = stage(st), b = unitBoard(host), g = h('g'); b.gMid.append(g);
      b.line([C[0] + R, 0], [C[0] + R, 12], 'pl-line pl-line--amber pl-line--dash'); b.text([C[0] + R + 0.0, 0.45], '切線 x＝1', 'pl-text pl-text--amber pl-text--sm');
      var pt = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pt), done = false;
      function draw(p) {
        g.innerHTML = ''; var dx = p[0] - C[0], dy = p[1] - C[1], L = Math.hypot(dx, dy), d = [dx / L, dy / L], tm = clipLine(d), tn = clipLine([-d[0], -d[1]]);
        b.line([C[0] - d[0] * tn, C[1] - d[1] * tn], [C[0] + d[0] * tm, C[1] + d[1] * tm], 'pl-line pl-line--thin', g);
        b.line(C, p, 'pl-line', g); thetaMark(b, p, g);
        if (Math.abs(dx) < 1e-9) { pt.textContent = 'tan θ ＝ sin θ ÷ cos θ ＝ ' + f2(dy / R) + ' ÷ 0 ＝ 不存在！'; b.text([C[0] + R + 0.5, 11.2], '碰不到 ↑', 'pl-text pl-text--amber pl-text--sm', g); return true; }
        var tanv = dy / dx, ty = C[1] + R * tanv;
        b.line([C[0] + R, C[1]], [C[0] + R, Math.max(0, Math.min(12, ty))], 'pl-line pl-line--amber pl-line--bold', g); b.dot([C[0] + R, Math.max(0, Math.min(12, ty))], 'pl-dot pl-dot--amber', g, 0.2);
        if (ty > 12) b.text([C[0] + R - 0.8, 11.3], 'tan θ ↑', 'pl-text pl-text--amber pl-text--sm', g); if (ty < 0) b.text([C[0] + R - 0.8, 0.8], 'tan θ ↓', 'pl-text pl-text--amber pl-text--sm', g);
        pt.textContent = 'tan θ ＝ sin θ ÷ cos θ ＝ ' + f2(dy / R) + ' ÷ ' + f2(dx / R) + ' ＝ ' + f2(tanv);
        return false;
      }
      var hd;
      api.solve(function () { gate.on = false; hd.set([6, 11]); move([6, 11]); });
      function move(t) { if (gate.on) return; var inf = draw(t); if (inf && !done) { done = true; P.track('aha', { id: 'trig-circle', step: 3 }); st.append(P.ruleBox('<b>tan θ ＝ sin θ ÷ cos θ</b>，就是切線 x＝1 上的高度。<br>θ 接近 90° 時，射線幾乎平行切線，tan θ 變得<b>超大</b>；剛好 90° 就<b>不存在</b>。', '定義')); P.toast(api.ctx.p3 === 1 ? '你猜對了！越來越大' : 'tan θ 越來越大，直到不存在'); api.unlock('看到 tan θ 爆衝了！'); } }
      hd = circleHandle(b, [11, 6], move, { disabled: function () { return gate.on; } });
      draw([11, 6]); st.append(ro, P.hint('橘色粗線＝ tan θ 的大小；P 往上轉，它往上衝。')); api.lock('先做上面的預測');
    },
    /* 4 波形連動 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, 'sin θ 的波形'), P.instr('拉動滑桿讓 P 繞圓轉。P 的<b>高度</b>會被畫成一條波。'));
      var host = stage(st), W = 320, H = 210, svg = h('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'pl-svg' }); host.append(svg); var g = h('g'); svg.append(g);
      var cx = 68, cy = 104, r = 54, x0 = 150, ww = 160, ang = 0, done = false, playing = false;
      var pa = P.pill('', ''), ps = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout' }, pa, ps), sl, btn;
      var sp = new P.Spring(0, { k: 200, zeta: 0.75, onUpdate: function (v) { ang = v; draw(); } });
      function draw() {
        g.innerHTML = ''; var a = ang * rad, s = Math.sin(a), px = cx + r * Math.cos(a), py = cy - r * s;
        g.append(h('line', { x1: 8, y1: cy, x2: x0 + ww + 6, y2: cy, class: 'pl-line pl-line--soft' }), h('line', { x1: cx, y1: cy - r - 10, x2: cx, y2: cy + r + 10, class: 'pl-line pl-line--soft' }), h('circle', { cx: cx, cy: cy, r: r, class: 'pl-circle' }));
        [90, 180, 270, 360].forEach(function (d) { g.append(h('line', { x1: x0 + ww * d / 360, y1: cy - 4, x2: x0 + ww * d / 360, y2: cy + 4, class: 'pl-line' })); var t = h('text', { x: x0 + ww * d / 360, y: cy + 18, class: 'pm-t', 'font-size': 10 }); t.textContent = d + '°'; g.append(t); });
        var pts = []; for (var k = 0; k <= Math.floor(ang); k += 2) pts.push((x0 + ww * k / 360).toFixed(1) + ',' + (cy - r * Math.sin(k * rad)).toFixed(1)); pts.push((x0 + ww * ang / 360).toFixed(1) + ',' + py.toFixed(1));
        g.append(h('polyline', { points: pts.join(' '), class: 'pl-line pl-line--pink pl-line--bold', fill: 'none' }));
        g.append(h('line', { x1: px, y1: py, x2: x0 + ww * ang / 360, y2: py, class: 'pl-line pl-line--pink pl-line--dash' }), h('line', { x1: cx, y1: cy, x2: px, y2: py, class: 'pl-line' }), h('line', { x1: px, y1: cy, x2: px, y2: py, class: 'pl-line pl-line--pink' }));
        if (ang > 3) { var ap = [], q; for (q = 0; q <= 20; q++) { var aa = ang * q / 20 * rad; ap.push((cx + 20 * Math.cos(aa)).toFixed(1) + ',' + (cy - 20 * Math.sin(aa)).toFixed(1)); } g.append(h('polyline', { points: ap.join(' '), class: 'pl-line pl-line--amber', fill: 'none' })); var tm = h('text', { x: cx + 32 * Math.cos(a / 2), y: cy - 32 * Math.sin(a / 2) + 4, class: 'pm-t pm-amber', 'font-size': 13 }); tm.textContent = 'θ'; g.append(tm); }
        g.append(h('circle', { cx: px, cy: py, r: 7, class: 'pl-dot pl-dot--green' }), h('circle', { cx: x0 + ww * ang / 360, cy: py, r: 6, class: 'pl-dot pl-dot--pink' }));
        pa.textContent = 'θ ＝ ' + Math.round(ang) + '°'; ps.textContent = 'sin θ ＝ ' + f2(s);
        if (ang >= 358 && !done) { done = true; playing = false; if (btn) btn.textContent = '▶ 自動轉'; P.track('aha', { id: 'trig-circle', step: 4 }); st.append(P.ruleBox('<b>sin θ 的波形</b>＝圓上的點「高度」隨角度畫出來。<br>轉一圈 360° 就重複一次，這就是<b>週期</b>。', '波形')); api.unlock('波形是圓轉出來的！'); }
      }
      sl = P.slider(0, 360, 0, function (v) { playing = false; btn.textContent = '▶ 自動轉'; sp.to(v); });
      btn = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '▶ 自動轉');
      btn.addEventListener('click', function () {
        playing = !playing; btn.textContent = playing ? '⏸ 暫停' : '▶ 自動轉'; if (!playing) return; if (ang >= 358) { sp.jump(0); sl.value = 0; }
        P.run(function (dt) { if (!playing) return false; var v = Math.min(360, ang + 70 * dt); sp.jump(v); sl.value = v; if (v >= 360) { playing = false; btn.textContent = '▶ 自動轉'; return false; } });
      });
      api.solve(function () { playing = false; btn.textContent = '▶ 自動轉'; sp.jump(360); sl.value = 360; });
      draw(); st.append(sl, h('div', { class: 'pl-row pl-row--center' }, btn), ro); api.lock('轉滿一圈（把滑桿拉到最右）');
    },
    /* 5 換個外觀（每題都有圖） */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function sb() { var host = h('div', { class: 'pl-stage pl-stage--sm' }); box.append(host); return unitBoard(host, true); }
      function clampT(x, y) { return [Math.max(1.6, Math.min(10.4, x)), Math.max(0.6, Math.min(11.4, y))]; }
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var b = sb(), g = h('g'); b.gMid.append(g);
          function draw(p) { g.innerHTML = ''; var c = (p[0] - C[0]) / R, s = (p[1] - C[1]) / R; b.line(C, p, 'pl-line', g); b.line(C, [p[0], C[1]], 'pl-line pl-line--blue pl-line--bold', g); b.line([p[0], C[1]], p, 'pl-line pl-line--pink pl-line--bold', g); var t = clampT(p[0] + (c >= 0 ? 1.1 : -1.1), p[1] + (s >= 0 ? 0.8 : -1)); b.text(t, '(' + f2(c) + ', ' + f2(s) + ')', 'pl-text pl-text--sm', g); }
          b.handle({ pos: [11, 6], candidates: LAT, onMove: draw }); draw([11, 6]);
          P.choice(box, {}, { id: 'tc-t1', prompt: '拖動 P 到 θ ＝ 180° 的位置，看座標。cos 180° ＝ ？', row: true, options: [{ t: '−1', ok: true, fb: '對！P 在 (−1, 0)，橫座標是 −1，sin 180° ＝ 0。' }, { t: '0', fb: '0 是縱座標（sin θ）。' }, { t: '1', fb: 'P 在左邊，橫座標是負的。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var b = sb(), p = [9, 2];
          b.line(C, p, 'pl-line'); b.line(C, [p[0], C[1]], 'pl-line pl-line--blue pl-line--bold'); b.line([p[0], C[1]], p, 'pl-line pl-line--pink pl-line--bold'); b.rightMark([p[0], C[1]], [-1, 0], [0, -1], 0.4); b.dot(p, 'pl-dot pl-dot--green', null, 0.28);
          b.text([7.5, 6.7], 'cos θ ＝ 0.6', 'pl-text pl-text--blue pl-text--sm'); b.text([10.7, 4], 'sin θ ＝ ？', 'pl-text pl-text--pink pl-text--sm'); b.text([9, 1.2], 'P', 'pl-text');
          box.append(h('div', { class: 'pl-q', html: 'P 在<b>第四象限</b>（右下），<b>cos θ ＝ 0.6</b>。那 <b>sin θ ＝ ？</b>（有正負號）' }));
          P.numBox(box, { answer: -0.8, okMsg: '對！大小是 0.8，P 在 x 軸下方，所以是 −0.8。', onOk: next, wrong: function (v) { return v === 0.8 ? '大小對了，但第四象限 P 在 x 軸「下方」，縱座標是正還是負？' : '提示：cos²θ ＋ sin²θ ＝ 1，所以 sin²θ ＝ 1 − 0.36 ＝ 0.64；再看 P 在 x 軸上方還是下方，決定正負。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var b = sb(), g = h('g'); b.gMid.append(g); b.line([0, 11], [12, 11], 'pl-line pl-line--amber pl-line--dash'); b.text([2.2, 11.5], '高度 1 的線', 'pl-text pl-text--amber pl-text--sm');
          function draw(p) { g.innerHTML = ''; var s = (p[1] - C[1]) / R; b.line(C, p, 'pl-line', g); thetaMark(b, p, g); b.line([p[0], C[1]], p, 'pl-line pl-line--pink pl-line--bold', g); b.text(clampT(p[0] + (p[0] >= C[0] ? 1.5 : -1.5), (p[1] + C[1]) / 2), 'sin θ ＝ ' + f2(s), 'pl-text pl-text--pink pl-text--sm', g); }
          b.handle({ pos: [9, 10], candidates: null, constrain: onCircle, onMove: draw }); draw([9, 10]);
          P.choice(box, {}, { id: 'tc-t3', prompt: '拖動 P 繞圓一圈。為什麼 sin θ 永遠不會大於 1？', options: [{ t: '因為圓的半徑是 1，P 最高也只到 1', ok: true, fb: '對！P 在單位圓上，高度最多是半徑 1。' }, { t: '因為角度最大是 360°', fb: '角度可以繼續轉很多圈，波形會重複。' }], onAnswer: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-circle' }); } });
        }];
      function next() { setTimeout(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 6 完成 */
    function (st) {
      P.complete(st, {
        id: 'trig-circle', moduleName: '三角函數：單位圓', askAbout: '國三、高一三角函數', aha: '三角函數不是三個要背的比值，<br>而是「圓上的點」的座標。',
        cards: [{ text: 'cos θ ＝ 橫座標、sin θ ＝ 縱座標；tan θ ＝ sin θ ÷ cos θ', src: '高一「廣義角的三角函數」（獵豹 S102 CH4）' }, { text: 'sin²θ ＋ cos²θ ＝ 1、sin 的波形與週期', src: '國三「三角比」（J91A 2607）與高二「三角函數的圖形」（S111 CH1）' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '弧度<br>和角公式' }, { at: 0.9, label: '疊合<br>複數旋轉' }] },
        teasers: [
          { title: '弧度：把半徑「捲」到圓周', q: '為什麼數學家不用 360°，而用 π？1 弧度到底多大？', where: 'S102 CH4 三角函數', lv: 'L2' },
          { title: '和角公式（旋轉合成）', q: 'sin(α＋β) 為什麼不是 sin α ＋ sin β？旋轉兩次＝旋轉一次！', where: 'S102 CH4、S111 CH1 三角函數 II', lv: 'L2' },
          { title: '疊合：兩個波相加', q: 'sin x ＋ cos x 竟然還是一個正弦波？振幅與相位怎麼算？', where: 'S111 CH1', lv: 'L3' },
          { title: '複數與單位根', q: '乘以 i 就是旋轉 90°？單位圓上的正 n 邊形頂點是誰？', where: '高二／競賽班', lv: 'L3' }],
        parent: { pitfall: '孩子往往把 sin、cos、tan 當成「SOH-CAH-TOA」口訣，到高中遇到鈍角、負角就卡住；因為他們沒有「圓」的畫面。', place: '國三三角比是「直角三角形」的特例；高中的廣義角、波形、和角公式都是單位圓的延伸。', ask: ['單位圓上的點 P，座標是什麼？', 'cos 90° 為什麼是 0？', 'sin 的最大值為什麼是 1？'] },
        classes: ['J91A（2607）：三角比', 'S102 CH4：三角函數', 'S111 CH1：三角函數 II'],
        next: { href: 'play-trig-identities.html', text: '下一個：三角公式看得見' } });
    }];
  new P.Lesson({ id: 'trig-circle', title: '三角函數：單位圓', steps: steps });
})();
