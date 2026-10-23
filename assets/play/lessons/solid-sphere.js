/* 獵豹玩中學｜球與圓錐、圓柱的關係（祖暅原理）
   半徑 R＝3 的半球，和「半徑 3、高 3 的圓柱挖掉一個倒立圓錐（尖在底、口在頂）」。
   在高度 y 切開：半球的截面是圓，面積 π(9−y²)；挖掉圓錐的圓柱，截面是圓環，外半徑 3、內半徑 y，面積 π(9−y²)。每個高度都一樣 → 體積一樣。 */
(function () {
  var P = Play, h = P.h, R = 3, Y0 = 6.6, CX1 = 3.9, CX2 = 10.1, TOPC = 3.0;
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  /* n3 ＝ 體積 × 3（整數）→ 顯示成整數或 n3/3 */
  function fr(n3) { return n3 % 3 === 0 ? String(n3 / 3) : n3 + '/3'; }
  function f2(n) { return String(Math.round(n * 100) / 100); }
  function arcPath(b, cx, y0, r) { return 'M ' + (cx - r) + ' ' + b.Y(y0) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + b.Y(y0) + ' Z'; }
  function circ(b, c, r, fill, stroke, layer) { return b.circle(c, r, 'pl-circle', layer, { style: 'fill:' + fill + ';stroke:' + stroke + ';stroke-width:3' }); }
  function setR(el, r) { el.setAttribute('r', Math.max(0, r)); el.style.display = r < 0.02 ? 'none' : ''; }

  /* 兩個立體的側視圖＋截面圖。回傳 update(y)：y＝切的高度（0～3） */
  function figures(b) {
    var L = [CX1 - R, CX1 + R], Rr = [CX2 - R, CX2 + R];
    b.line([0.2, Y0], [13.8, Y0], 'pl-line pl-line--soft');
    var dome = h('path', { d: arcPath(b, CX1, Y0, R), class: 'pl-poly pl-poly--green' }); b.gMid.append(dome);
    b.poly([[Rr[0], Y0], [Rr[1], Y0], [Rr[1], Y0 + R], [Rr[0], Y0 + R]], 'pl-poly pl-poly--ghost');
    b.poly([[Rr[0], Y0], [Rr[0], Y0 + R], [CX2, Y0]], 'pl-poly pl-poly--pink'); b.poly([[CX2, Y0], [Rr[1], Y0 + R], [Rr[1], Y0]], 'pl-poly pl-poly--pink');
    b.line([CX2, Y0], [Rr[0], Y0 + R], 'pl-line pl-line--soft'); b.line([CX2, Y0], [Rr[1], Y0 + R], 'pl-line pl-line--soft');
    b.text([CX1, Y0 + R + 0.55], '半球', 'pl-text pl-text--green pl-text--lg'); b.text([CX2, Y0 + R + 0.55], '圓柱挖掉圓錐', 'pl-text pl-text--pink pl-text--lg');
    var cut = b.line([0.2, Y0], [13.8, Y0], 'pl-line pl-line--amber pl-line--dash'), s1 = b.line([0, 0], [0, 0], 'pl-line pl-line--green pl-line--bold'), s2 = b.line([0, 0], [0, 0], 'pl-line pl-line--pink pl-line--bold'), s3 = b.line([0, 0], [0, 0], 'pl-line pl-line--pink pl-line--bold');
    var disc = circ(b, [CX1, TOPC], R, 'rgba(31,157,85,.28)', '#1f9d55'), out = circ(b, [CX2, TOPC], R, 'rgba(214,51,108,.24)', '#d6336c'), inn = circ(b, [CX2, TOPC], 0, '#fff', '#d6336c');
    b.text([CX1, -0.45], '截面：圓', 'pl-text pl-text--green'); b.text([CX2, -0.45], '截面：圓環', 'pl-text pl-text--pink');
    return function (y) {
      var yy = Y0 + y, w = Math.sqrt(Math.max(0, R * R - y * y));
      b.setLine(cut, [0.2, yy], [13.8, yy]); b.setLine(s1, [CX1 - w, yy], [CX1 + w, yy]); b.setLine(s2, [Rr[0], yy], [CX2 - y, yy]); b.setLine(s3, [CX2 + y, yy], [Rr[1], yy]);
      setR(disc, w); setR(inn, y); return R * R - y * y;
    };
  }

  var steps = [
    /* 1. 預測＋拉滑桿：同一個高度，截面一樣大 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false;
      P.choice(st, api, { id: 'ss2-p1', predict: true, label: '先猜猜看', prompt: '<b>半球</b>和<b>「圓柱挖掉圓錐」</b>（高度、寬度都一樣），哪個體積大？', row: true, options: [{ t: '半球大' }, { t: '挖掉圓錐的較大' }, { ok: true, t: '一樣大' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉滑桿，在不同高度切一刀'); } });
      var host = stage(st), board = new P.Board(host, { w: 14, h: 11 }), upd = figures(board), p1 = P.pill('', 'is-ok'), p2 = P.pill('', 'is-pink'), p3 = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, p1, p2, p3);
      function draw(v) {
        var y = R * v / 100, a = upd(y), k = Math.round(v / 12.5);
        p1.textContent = '半球截面（圓）：' + f2(a) + 'π'; p2.textContent = '圓環：' + f2(a) + 'π'; p3.textContent = '高度 y ＝ ' + f2(y);
        if (v > 0 && v < 100 && !seen[k]) { seen[k] = 1; n++; }
        if (n >= 4 && !done) { done = true; P.track('aha', { id: 'solid-sphere', step: 1 }); P.toast(api.ctx.p1 === 2 ? '你猜對了！' : '每個高度都一樣大'); st.append(P.ruleBox('不管在哪個高度切，<b>半球的圓面積</b> ＝ <b>圓環的面積</b>（都是 π(9 − y²)）。<br>每個高度的截面積都相等，<b>體積就相等</b>——這叫<b>祖暅原理</b>（西方叫卡瓦列里原理）。', '祖暅原理')); api.unlock('兩個體積一樣大！'); }
      }
      var sl = P.slider(0, 100, 50, function (v) { if (gate.on) { sl.value = 50; P.toast('先做上面的預測'); return; } draw(+v); });
      api.solve(function () { gate.on = false; [20, 40, 60, 85].forEach(function (v) { sl.value = v; draw(v); }); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '↓ 底部'), h('span', {}, '頂部 ↑')));
      draw(50); st.append(ro, P.hint('橘色虛線是切的位置。綠色＝半球被切到的地方，粉紅＝挖掉圓錐後的柱體被切到的地方。圓環的內圈半徑剛好等於 y（因為圓錐是 45° 角）。'));
      api.lock('先做上面的預測');
    },
    /* 2. 疊切片：把立體切成 n 片圓餅疊起來，看總體積 */
    function (st, api) {
      st.append(P.instr('把立體切成 <b>n 片</b>圓餅疊起來，片越多越準。比比看<b>圓柱、圓錐、半球</b>（半徑 3、高 3）的體積。<small>（單位 π）</small>'));
      var shape = 'cyl', n = 3, seen = {}, done = false, host = stage(st), b = new P.Board(host, { w: 8, h: 4, cls: 'pl-svg--sm' }), CX = 4, Y0 = 0.3, g = h('g'), outl = h('g'); b.gMid.append(outl, g);
      var NAME = { cyl: '圓柱', cone: '圓錐', hemi: '半球' }, CLS = { cyl: 'pl-poly pl-poly--green', cone: 'pl-poly pl-poly--pink', hemi: 'pl-poly' };
      function rOf(sh, y) { return sh === 'cyl' ? R : sh === 'cone' ? y : Math.sqrt(Math.max(0, R * R - y * y)); }
      function outline() {
        outl.innerHTML = '';
        if (shape === 'cyl') b.poly([[CX - R, Y0], [CX + R, Y0], [CX + R, Y0 + R], [CX - R, Y0 + R]], 'pl-poly pl-poly--ghost', outl);
        else if (shape === 'cone') b.poly([[CX, Y0], [CX + R, Y0 + R], [CX - R, Y0 + R]], 'pl-poly pl-poly--ghost', outl);
        else outl.append(h('path', { d: arcPath(b, CX, Y0, R), class: 'pl-poly pl-poly--ghost' }));
      }
      var bar = h('div', { class: 'pl-opts pl-opts--row' }), btn = {}; ['cyl', 'cone', 'hemi'].forEach(function (k) { btn[k] = h('button', { type: 'button', class: 'pl-opt' }, NAME[k]); btn[k].addEventListener('click', function () { shape = k; draw(); }); bar.append(btn[k]); });
      var sn = P.stepper('切成幾片', 1, 12, n, function (v) { n = v; draw(); }), p1 = P.pill('', 'is-amber'), p2 = P.pill('', 'is-blue'), ro = h('div', { class: 'pl-readout' }, p1, p2);
      st.append(bar, h('div', { class: 'pl-steprow' }, sn.el), ro);
      function draw() {
        g.innerHTML = ''; outline(); var dy = R / n, tot = 0, i;
        for (i = 0; i < n; i++) { var y = (i + 0.5) * dy, r = rOf(shape, y), y1 = Y0 + i * dy; tot += r * r * dy; b.poly([[CX - r, y1], [CX + r, y1], [CX + r, y1 + dy], [CX - r, y1 + dy]], CLS[shape], g, { style: 'fill-opacity:.55;stroke-width:1.5' }); }
        ['cyl', 'cone', 'hemi'].forEach(function (k) { btn[k].classList.toggle('is-sel', k === shape); });
        p1.textContent = NAME[shape] + ' 切成 ' + n + ' 片'; p2.textContent = '疊起來 ≈ ' + (Math.round(tot * 10) / 10).toFixed(1) + 'π';
        if (n >= 10) { seen[shape] = Math.round(tot * 10) / 10; var all = seen.cyl !== undefined && seen.cone !== undefined && seen.hemi !== undefined; if (all && !done) { done = true; P.track('aha', { id: 'solid-sphere', step: 2 }); st.append(P.ruleBox('圓錐 ≈ <b>9π</b>、半球 ≈ <b>18π</b>、圓柱 ＝ <b>27π</b>：<b>圓錐 : 半球 : 圓柱 ＝ 1 : 2 : 3</b>。<br>半球 ＋ 圓錐 ＝ 圓柱，所以<b>半球 ＝ 圓柱 − 圓錐 ＝ 18π</b>，整個球 ＝ 2 × 18π ＝ <b>36π ＝ (4/3)π·3³</b>。', '發現')); api.unlock('球的體積 ＝ (4/3)πr³！'); } }
      }
      api.solve(function () { n = 12; sn.set(12, true); ['cyl', 'cone', 'hemi'].forEach(function (k) { shape = k; draw(); }); });
      draw(); st.append(P.hint('提示：每種立體都要切到 10 片以上（越薄越準），把三個答案比一比。')); api.lock('三種立體都切成 10 片以上');
    },
    /* 3. 倒水實驗：球和圓錐的水倒進圓柱 */
    function (st, api) {
      var gate = { on: true }, poured = { s: false, c: false }, done = false, lvl = 0;
      P.choice(st, api, { id: 'ss2-p3', predict: true, label: '先猜猜看', prompt: '球裝滿水，倒進剛好放得下它的圓柱（寬 ＝ 高 ＝ 2r）。水位會到哪裡？', row: true, options: [{ t: '1/3' }, { t: '1/2' }, { ok: true, t: '2/3' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('按按鈕，把水倒進圓柱'); } });
      var host = stage(st), b = new P.Board(host, { w: 14, h: 6 });
      var sph = circ(b, [2, 3], 2, 'rgba(47,111,220,.4)', '#2f6fdc'), cone = b.poly([[10, 1], [14, 1], [12, 5]], 'pl-poly pl-poly--pink');
      b.poly([[5, 1], [9, 1], [9, 5], [5, 5]], 'pl-poly pl-poly--ghost'); var water = b.poly([[5, 1], [9, 1], [9, 1], [5, 1]], 'pl-poly'); water.style.fill = 'rgba(47,111,220,.4)'; water.style.stroke = '#2f6fdc';
      b.poly([[5, 1], [9, 1], [9, 5], [5, 5]], 'pl-poly pl-poly--ghost').style.fill = 'none';
      b.text([2, 0.15], '球', 'pl-text pl-text--blue'); b.text([7, 0.15], '圓柱', 'pl-text pl-text--green'); b.text([12, 0.15], '圓錐', 'pl-text pl-text--pink'); b.text([7, 5.5], '高 ＝ 2r', 'pl-text pl-text--sm');
      var sp = new P.Spring(0, { k: 110, zeta: 0.95, onUpdate: function (v) { var top = 1 + Math.max(0, v) * 4; b.setPoly(water, [[5, 1], [9, 1], [9, top], [5, top]]); water.style.display = v < 0.005 ? 'none' : ''; } });
      var pl = P.pill('水位 ＝ 0', 'is-blue'), ro = h('div', { class: 'pl-readout' }, pl);
      var bS = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '倒球的水'), bC = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '倒圓錐的水'), bR = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '全部倒回去');
      st.append(h('div', { class: 'pl-row pl-row--center' }, bS, bC, bR), ro);
      function upd() {
        lvl = (poured.s ? 2 : 0) + (poured.c ? 1 : 0); sp.to(lvl / 3); sph.style.opacity = poured.s ? 0.12 : 1; cone.style.opacity = poured.c ? 0.15 : 1;
        pl.textContent = '水位 ＝ ' + (lvl === 0 ? '0' : lvl === 3 ? '滿了！（3/3）' : lvl + '/3'); pl.className = 'pl-pill' + (lvl === 3 ? ' is-ok' : ' is-blue');
        if (lvl === 3 && !done) { done = true; P.toast(api.ctx.p3 === 2 ? '球的水剛好是 2/3，你猜對了！' : '剛好裝滿！'); P.track('aha', { id: 'solid-sphere', step: 3 }); st.append(P.ruleBox('球 ＋ 圓錐 ＝ 剛好裝滿圓柱：球 ＝ 圓柱的 <b>2/3</b>，圓錐 ＝ <b>1/3</b>。<br><b>圓錐 : 球 : 圓柱 ＝ 1 : 2 : 3</b>——和切片算出來的一樣！據說這是阿基米德最得意的發現。', '性質')); api.unlock('1 : 2 : 3！'); }
      }
      function act(f) { return function () { if (gate.on) { P.toast('先做上面的預測'); return; } f(); upd(); }; }
      bS.addEventListener('click', act(function () { poured.s = true; })); bC.addEventListener('click', act(function () { poured.c = true; })); bR.addEventListener('click', act(function () { poured.s = false; poured.c = false; }));
      api.solve(function () { gate.on = false; poured.s = true; poured.c = true; upd(); });
      st.append(P.hint('球和圓錐都裝滿水。先倒哪個都可以，也可以只倒一個看看水位。')); api.lock('先做上面的預測');
    },
    /* 4. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function G(hh) { return R * R * hh - hh * hh * hh / 3; }           /* 高度 hh 以下的體積（單位 π），半球與「圓柱挖掉圓錐」一樣 */
      function inv(v) { var lo = 0, hi = R, k; for (k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (G(m) < v) lo = m; else hi = m; } return (lo + hi) / 2; }
      var tasks = [
        /* 關 1：圓錐的水倒進圓柱，倒幾杯會滿？ */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '圓錐和圓柱<b>同底、同高</b>。圓錐裝滿水倒進圓柱，按「倒一杯」，看<b>倒幾杯</b>會剛好裝滿？' }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var bd = new P.Board(host, { w: 10, h: 5, cls: 'pl-svg--sm' }), k = 0;
          var cone = bd.poly([[0.5, 0.5], [4.5, 0.5], [2.5, 4.5]], 'pl-poly pl-poly--pink'); bd.poly([[5.5, 0.5], [9.5, 0.5], [9.5, 4.5], [5.5, 4.5]], 'pl-poly pl-poly--ghost'); var wt = bd.poly([[5.5, 0.5], [9.5, 0.5], [9.5, 0.5], [5.5, 0.5]], 'pl-poly'); wt.style.fill = 'rgba(214,51,108,.3)'; wt.style.stroke = '#d6336c';
          bd.text([2.5, -0.35], '圓錐', 'pl-text pl-text--pink'); bd.text([7.5, -0.35], '圓柱', 'pl-text pl-text--green');
          var sp = new P.Spring(0, { k: 110, zeta: 0.95, onUpdate: function (v) { var top = 0.5 + Math.max(0, v) * 4; bd.setPoly(wt, [[5.5, 0.5], [9.5, 0.5], [9.5, top], [5.5, top]]); wt.style.display = v < 0.005 ? 'none' : ''; } });
          var pk = P.pill('倒了 0 杯', 'is-pink'), bt = h('button', { type: 'button', class: 'button button--primary pl-small' }, '倒一杯'), br = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '重來'); b0.append(h('div', { class: 'pl-row pl-row--center' }, bt, br), h('div', { class: 'pl-readout' }, pk));
          function upd() { sp.to(k / 3); pk.textContent = k === 0 ? '倒了 0 杯' : '倒了 ' + k + ' 杯'; pk.className = 'pl-pill ' + (k === 3 ? 'is-ok' : 'is-pink'); if (k === 3) { pk.textContent = '✓ 倒了 3 杯，剛好滿！'; bt.disabled = true; P.toast('圓錐的體積是同底同高圓柱的 1/3'); P.track('aha', { id: 'solid-sphere', step: 4 }); done(); } }
          bt.addEventListener('click', function () { if (k < 3) { k++; upd(); } }); br.addEventListener('click', function () { if (k < 3) { k = 0; upd(); } });
          setSolve(function () { k = 3; upd(); }); b0.append(P.hint('每一杯都是圓錐裝滿的水。'));
        },
        /* 關 2：半球的水倒進「圓柱挖掉圓錐」的碗 */
        function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '半球裝滿水。拉動滑桿，把水倒進<b>「圓柱挖掉圓錐」的碗</b>，看看水會倒到哪裡？' }));
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var bd = new P.Board(host, { w: 14, h: 4.5, cls: 'pl-svg--sm' }), C1 = 3.5, C2 = 10.5, Z = 0.6, fin = false;
          bd.line([0.2, Z], [13.8, Z], 'pl-line pl-line--soft'); bd.gMid.append(h('path', { d: arcPath(bd, C1, Z, R), class: 'pl-poly pl-poly--ghost' }));
          bd.poly([[C2 - R, Z], [C2 + R, Z], [C2 + R, Z + R], [C2 - R, Z + R]], 'pl-poly pl-poly--ghost'); bd.poly([[C2, Z], [C2 + R, Z + R], [C2 - R, Z + R]], 'pl-poly pl-poly--ghost');
          var w1 = bd.poly([[0, 0], [0, 0], [0, 0]], 'pl-poly'), wl = bd.poly([[0, 0], [0, 0], [0, 0]], 'pl-poly pl-poly--pink'), wr = bd.poly([[0, 0], [0, 0], [0, 0]], 'pl-poly pl-poly--pink'); [w1, wl, wr].forEach(function (e) { e.style.fillOpacity = 0.5; });
          bd.text([C1, Z + R + 0.5], '半球', 'pl-text pl-text--blue'); bd.text([C2, Z + R + 0.5], '圓柱挖掉圓錐', 'pl-text pl-text--pink');
          var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pc = P.pill('', '');
          function draw(t) {
            var h1 = inv((1 - t) * G(R)), h2 = inv(t * G(R)), pts = [], i;
            for (i = 0; i <= 20; i++) { var y = h1 * i / 20; pts.push([C1 - Math.sqrt(R * R - y * y), Z + y]); } for (i = 20; i >= 0; i--) { var y2 = h1 * i / 20; pts.push([C1 + Math.sqrt(R * R - y2 * y2), Z + y2]); }
            bd.setPoly(w1, h1 < 0.01 ? [[0, 0], [0, 0]] : pts); bd.setPoly(wl, h2 < 0.01 ? [[0, 0], [0, 0]] : [[C2 - R, Z], [C2 - R, Z + h2], [C2 - h2, Z + h2], [C2, Z]]); bd.setPoly(wr, h2 < 0.01 ? [[0, 0], [0, 0]] : [[C2 + R, Z], [C2 + R, Z + h2], [C2 + h2, Z + h2], [C2, Z]]);
            pa.textContent = '半球裡 ' + (Math.round((1 - t) * 180) / 10).toFixed(1) + 'π'; pb.textContent = '碗裡 ' + (Math.round(t * 180) / 10).toFixed(1) + 'π'; var full = t > 0.995; pc.className = 'pl-pill' + (full ? ' is-ok' : ''); pc.textContent = full ? '✓ 碗剛好滿，半球剛好空！' : '還在倒…';
            if (full && !fin) { fin = true; P.toast('半球的水 ＝ 碗的容量'); P.track('aha', { id: 'solid-sphere', step: 5 }); done(); }
          }
          var sl = P.slider(0, 100, 0, function (v) { draw(v / 100); }); b0.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 還沒倒'), h('span', {}, '全部倒完 →')), h('div', { class: 'pl-readout' }, pa, pb, pc));
          setSolve(function () { sl.value = 100; draw(1); }); draw(0); b0.append(P.hint('倒的過程中，注意兩邊水位的變化，最後會停在哪裡？'));
        },
        /* 關 3：調整半徑，找出目標體積 */
        function (b0, done, setSolve) {
          var targets = [{ t: '體積變成 r ＝ 1 時的 <b>8 倍</b>', r: 2 }, { t: '體積剛好是 <b>36π</b>', r: 3 }, { t: '體積剛好是 <b>288π</b>', r: 6 }], ti = 0, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(info, host);
          var bd = new P.Board(host, { w: 7, h: 7, cls: 'pl-svg--sm' }), ball = circ(bd, [3.5, 3.5], 0.5, 'rgba(47,111,220,.25)', '#2f6fdc'), tr = bd.text([3.5, 0.3], 'r', 'pl-text pl-text--lg pl-text--blue');
          var pv = P.pill('', 'is-blue'), px = P.pill('', 'is-amber'), r = 1;
          var sr = P.stepper('半徑 r', 1, 6, 1, function (v) { r = v; upd(); }); b0.append(h('div', { class: 'pl-steprow' }, sr.el), h('div', { class: 'pl-readout' }, pv, px));
          function txt() { info.innerHTML = '調整球的半徑 r，讓' + targets[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function upd() {
            ball.setAttribute('r', r * 0.5); bd.setText(tr, [3.5, 0.3], 'r ＝ ' + r); pv.textContent = '體積 ＝ ' + fr(4 * r * r * r) + 'π'; px.textContent = '是 r ＝ 1 時的 ' + r * r * r + ' 倍';
            if (ti < 3 && r === targets[ti].r) { ti++; if (ti >= 3) { P.toast('體積跟 r 的「三次方」成正比！'); P.track('aha', { id: 'solid-sphere', step: 6 }); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { while (ti < 3) { var v = targets[ti].r; sr.set(v); } }); txt(); upd(); b0.append(P.hint('提示：體積 ＝ (4/3)πr³。半徑變 2 倍，體積變幾倍？'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-sphere' }); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'solid-sphere', moduleName: '球與圓錐、圓柱的關係', askAbout: '立體幾何與體積', aha: '球 ＝ 圓柱 − 圓錐：<br>每個高度的截面積都相等，體積就相等。',
        cards: [{ text: '球的體積 ＝ (4/3)πr³；圓錐 : 球 : 圓柱（球外切）＝ 1 : 2 : 3', src: '國中、高中「立體圖形的體積」' }, { text: '祖暅原理（卡瓦列里原理）：等高處截面積都相等的兩個立體，體積相等', src: '高中「空間中的體積」與數學史' }],
        depth: { here: 0.3, cheetah: [{ at: 0.5, label: '卡瓦列里原理<br>球表面積' }, { at: 0.9, label: '球冠體積<br>空間向量' }] },
        teasers: [
          { title: '卡瓦列里原理（祖暅原理）', q: '同樣的切片想法：為什麼角錐體積是同底同高柱體的 1/3？球體積又怎麼用它算出來？', where: 'PK3C 2507 第 20 堂「錐體與球體」', lv: 'L2' },
          { title: '球的表面積', q: '球的表面積為什麼是 4πr²？把球切成無數個小角錐，每個小角錐的高都是 r。', where: 'PK3C 2507 第 20 堂「錐體與球體」', lv: 'L2' },
          { title: '球冠的體積', q: '只取球的一小塊「球冠」，體積怎麼算？同樣用切片，和圓柱、圓錐比一比。', where: 'PK3C 2507 第 20 堂（作業：球冠體積）', lv: 'L3' },
          { title: '空間向量與空間幾何', q: '立體圖形放進座標空間，距離、夾角、體積都能用向量算。', where: 'S111／S112（2507 第 24–25 堂；2601 第 1–9 堂）：空間向量、空間中平面直線、專題：空間幾何', lv: 'L3' }],
        parent: { pitfall: '孩子常背了公式卻<b>分不清球和圓錐</b>的係數：球是 <b>4/3</b>、圓錐是 <b>1/3</b>、半球是 <b>2/3</b>；也常忘記球的公式是 <b>r 的三次方</b>，不是平方（平方是表面積）。', place: '國中立體圖形與高中空間概念的基礎，也是積分求體積的起點。', ask: ['球為什麼剛好是圓柱的三分之二？', '半球和「圓柱挖掉圓錐」，在每個高度切開有什麼一樣？', '如果把球的半徑變成 2 倍，體積會變成幾倍？（8 倍，因為是 r 的三次方）'] },
        classes: ['PK3C（2507 第 20 堂）：錐體與球體——卡瓦列里原理、球體積、球表面積、球冠', 'PK3C（2607 第 15 堂）：柱體與椎體的表面積與體積', 'PK4B（2512 第 9 堂）：圓柱與圓錐的體積與表面積', 'PK3B（2512 第 14 堂）：柱體體積與表面積', 'J91S（2607 第 7–9 堂）：CH03 生活中的立體圖形', 'J91A（2507 第 25–27 堂）：立體幾何'] });
    }];
  new P.Lesson({ id: 'solid-sphere', title: '球與圓錐、圓柱的關係', answers: { 1: '圓錐 : 半球 : 圓柱 ＝ 1 : 2 : 3（半球 ＋ 圓錐 ＝ 圓柱）' }, steps: steps });
})();
