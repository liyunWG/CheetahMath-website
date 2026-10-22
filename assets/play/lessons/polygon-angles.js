/* 獵豹玩中學｜多邊形的外角和為什麼是 360°
   走一圈（轉了多少）→ 把外角搬到同一點拼成一圈 → 拖動頂點外角和不變 → 4 個操作關卡（正多邊形、龜步、內角和）。 */
(function () {
  var P = Play, h = P.h, G = PlayGeo, rad = G.rad, C0 = [6, 5.2];
  var COL = ['rgba(47,111,220,.5)', 'rgba(214,51,108,.5)', 'rgba(31,157,85,.5)', 'rgba(210,155,31,.55)', 'rgba(122,79,214,.5)', 'rgba(232,89,12,.5)', 'rgba(12,165,160,.5)', 'rgba(154,163,181,.6)'];
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function fillPoly(el, c) { el.style.fill = c; el.style.stroke = c.replace(/,[.\d]+\)$/, ',1)'); }
  function poly(n) { return G.ellipsePoly(n, C0, 4.6, 3.6, 200); }
  function tip(board, g, V, d, txt, color) { var r = 2.0, p = G.polar(V, r, d); board.text([p[0], p[1] - 0.2], txt, 'pl-text pl-text--sm ' + (color || ''), g); }

  var steps = [
    /* 1. 走一圈：一共轉了幾度 */
    function (st, api) {
      var gate = { on: true }, n = 3, seen = {}, done = false, t = 0, pts, an, cum, per;
      P.choice(st, api, { id: 'pa-p1', predict: true, label: '先猜猜看', prompt: '小豹沿著多邊形的邊走一圈回到出發點，過程中<b>一共轉了幾度</b>？', row: true, options: [{ t: '180°' }, { t: '360°' }, { t: '720°' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拉滑桿讓小豹走一圈，換幾種多邊形'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'), outline = board.poly([C0, C0, C0], 'pl-poly pl-poly--ghost'); board.gMid.append(g);
      var pTurn = P.pill('', 'is-amber'), pEnd = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pTurn, pEnd);
      var sn = P.stepper('邊數 n', 3, 8, 3, function (v) { n = v; sl.value = 0; t = 0; build(); draw(); });
      function build() { pts = poly(n); an = G.polyAngles(pts); cum = [0]; for (var i = 0; i < n; i++) cum.push(cum[i] + dist(pts[i], pts[(i + 1) % n])); per = cum[n]; board.setPoly(outline, pts); }
      function draw() {
        g.innerHTML = ''; var s = t * per, e = 0, v, turned = 0; while (e < n - 1 && s >= cum[e + 1]) e++;
        var p = G.lerp(pts[e], pts[(e + 1) % n], (s - cum[e]) / (cum[e + 1] - cum[e])), hd = an.heads[e] * rad, u = [Math.cos(hd), Math.sin(hd)], q = [-u[1], u[0]];
        for (v = 1; v <= n; v++) if (s >= cum[v] - 1e-6) { var idx = v % n, d1 = an.heads[(idx + n - 1) % n], w = G.wedge(pts[idx], d1, d1 + an.ext[idx], 1.2, an.ext[idx]); turned += an.ext[idx]; fillPoly(board.poly(w.pts, 'pl-poly', g), COL[(v - 1) % 8]); tip(board, g, pts[idx], w.bis, Math.round(an.ext[idx]) + '°'); }
        board.poly([[p[0] + 0.6 * u[0], p[1] + 0.6 * u[1]], [p[0] - 0.3 * u[0] + 0.32 * q[0], p[1] - 0.3 * u[1] + 0.32 * q[1]], [p[0] - 0.3 * u[0] - 0.32 * q[0], p[1] - 0.3 * u[1] - 0.32 * q[1]]], 'pl-poly pl-poly--green', g);
        pTurn.textContent = '已經轉了 ' + Math.round(turned) + '°'; var full = t > 0.999; pEnd.className = 'pl-pill' + (full ? ' is-ok' : ''); pEnd.textContent = full ? '✓ 走完一圈：共轉 ' + Math.round(turned) + '°' : '繼續走…';
        if (full && !seen[n]) { seen[n] = 1; var c = Object.keys(seen).length; if (c >= 3 && !done) { done = true; P.track('aha', { id: 'polygon-angles', step: 1 }); P.toast(api.ctx.p1 === 1 ? '你猜對了！' : '都是 360°'); st.append(P.ruleBox('不管是三角形、四邊形還是更多邊，走一圈回到原來的方向，一共<b>轉了 360°</b>。<br>每個轉角就是一個<b>外角</b>，所以<b>多邊形的外角和 ＝ 360°</b>。', '外角和')); api.unlock('外角和 ＝ 360°！'); } }
      }
      var sl = P.slider(0, 100, 0, function (v) { if (gate.on) { sl.value = 0; P.toast('先做上面的預測'); return; } t = v / 100; draw(); });
      st.append(sn.el, sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 出發'), h('span', {}, '走完一圈 →')), ro);
      api.solve(function () { gate.on = false; [3, 4, 5].forEach(function (k) { n = k; sn.set(k, true); build(); sl.value = 100; t = 1; draw(); }); });
      build(); draw(); st.append(P.hint('箭頭每到一個頂點就要轉一個角（彩色），那就是外角。至少換 3 種多邊形。')); api.lock('先做上面的預測');
    },
    /* 2. 把外角搬到同一點 */
    function (st, api) {
      st.append(P.instr('把每個頂點的<b>外角</b>「剪」下來，拉滑桿把它們<b>全部搬到同一個點</b>，看看會拼出什麼。'));
      var n = 4, seen = {}, done = false, u = 0, pts, an, host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'), outline = board.poly([C0, C0, C0], 'pl-poly pl-poly--ghost'), M = [6, 5.2]; board.gMid.append(g);
      var pk = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pk), sn = P.stepper('邊數 n', 3, 8, 4, function (v) { n = v; sl.value = 0; u = 0; build(); draw(); });
      function build() { pts = poly(n); an = G.polyAngles(pts); board.setPoly(outline, pts); }
      function draw() {
        g.innerHTML = ''; var i, tot = 0;
        for (i = 0; i < n; i++) { var d1 = an.heads[(i + n - 1) % n], apex = G.lerp(pts[i], M, u), w = G.wedge(apex, d1, d1 + an.ext[i], 1.8, an.ext[i]); tot += an.ext[i]; fillPoly(board.poly(w.pts, 'pl-poly', g), COL[i % 8]); if (u > 0.99) { var tp = G.polar(M, 1.2, w.bis); board.text([tp[0], tp[1] - 0.2], Math.round(an.ext[i]) + '°', 'pl-text pl-text--sm', g); } }
        var full = u > 0.99; pk.className = 'pl-pill' + (full ? ' is-ok' : ' is-amber'); pk.textContent = full ? '✓ 拼成一整圈 ＝ 360°（沒有縫、沒有重疊）' : '外角們還散在各個頂點…';
        if (full && !seen[n]) { seen[n] = 1; if (Object.keys(seen).length >= 3 && !done) { done = true; P.track('aha', { id: 'polygon-angles', step: 2 }); st.append(P.ruleBox('不管幾邊形，所有外角搬到同一點，<b>剛好拼成一個圓周</b>，一點縫隙也沒有，所以外角和 ＝ <b>360°</b>。', '原因')); api.unlock('外角拼成一整圈！'); } }
      }
      var sl = P.slider(0, 100, 0, function (v) { u = v / 100; draw(); });
      st.append(sn.el, sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 在各個頂點'), h('span', {}, '搬到同一點 →')), ro);
      api.solve(function () { [3, 4, 5].forEach(function (k) { n = k; sn.set(k, true); build(); sl.value = 100; u = 1; draw(); }); });
      build(); draw(); st.append(P.hint('至少換 3 種多邊形，每次都把滑桿拉到最右邊。')); api.lock('3 種多邊形都拼成一圈');
    },
    /* 3. 拖動頂點，外角和不變 */
    function (st, api) {
      st.append(P.instr('拖動任何一個<b>頂點</b>，把五邊形拉得很歪。外角們會變，但<b>外角和</b>呢？'));
      var pts = [[3, 2], [9, 2], [11, 6], [7, 9], [2, 7]], moves = 0, done = false, hs = [], host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'), pg = board.poly(pts, 'pl-poly pl-poly--amber'); board.gMid.append(g);
      var pe = h('div', { class: 'pl-readout pl-readout--col' }), p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-ok'), p3 = P.pill('', 'is-pink'); pe.append(p1, p2, p3); st.append(pe);
      function draw() {
        g.innerHTML = ''; board.setPoly(pg, pts); var an = G.polyAngles(pts); if (!an) return; var i, txt = [];
        for (i = 0; i < 5; i++) { var d1 = an.heads[(i + 4) % 5], w = G.wedge(pts[i], d1, d1 + an.ext[i], 0.9, an.ext[i]); fillPoly(board.poly(w.pts, 'pl-poly', g), COL[i]); txt.push(Math.round(an.ext[i]) + '°'); }
        p1.textContent = '外角：' + txt.join(' ＋ '); p2.textContent = '外角和 ＝ ' + Math.round(an.sum) + '°（永遠不變）'; p3.textContent = '內角和 ＝ 540°';
      }
      pts.forEach(function (p0, i) {
        var hd = board.handle({ pos: p0, valid: function (t) { var q = pts.slice(); q[i] = t; return !!G.polyAngles(q); }, onMove: function (t) { var q = pts.slice(); q[i] = t; if (!G.polyAngles(q)) { hd.set(pts[i], true); return; } pts[i] = t; draw(); moves++;
          if (moves >= 6 && !done) { done = true; P.track('aha', { id: 'polygon-angles', step: 3 }); st.append(P.ruleBox('每個外角都會變大變小，但加起來<b>永遠是 360°</b>。外角和只和「繞一圈」有關，和多邊形的形狀、邊長都沒關係。', '性質')); api.unlock('外角和永遠 360°！'); } } }); hs.push(hd);
      });
      api.solve(function () { [[2, 1], [11, 7], [6, 9], [1, 6], [4, 3], [8, 3]].forEach(function (p, k) { hs[[0, 2, 3, 4, 0, 1][k]].moveTo(p); }); });
      draw(); st.append(P.hint('頂點只能拖到「還是凸多邊形」的位置。至少拖 6 次，試試把它拉得很扁。')); api.lock('拖動頂點 6 次');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：每個外角 = 目標度數 */
        function (b0, done, setSolve) {
          var targets = [60, 40, 90], ti = 0, n = 5, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var bd = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), pg = bd.poly([C0, C0, C0], 'pl-poly pl-poly--amber'); bd.gMid.append(g);
          var pa = P.pill('', 'is-pink'), pb = P.pill('', 'is-blue'); b0.append(h('div', { class: 'pl-readout' }, pa, pb));
          var sn = P.stepper('邊數 n', 3, 12, n, function (v) { n = v; draw(); }); b0.append(h('div', { class: 'pl-steprow' }, sn.el));
          function txt() { info.innerHTML = '<b>正 n 邊形</b>的每個外角都一樣大。調整邊數 n，讓<b>每個外角剛好是 ' + targets[Math.min(ti, 2)] + '°</b>。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw() {
            g.innerHTML = ''; var pts = G.regPoly(n, C0, 3.6, 90 + 180 / n), an = G.polyAngles(pts), e = 360 / n; bd.setPoly(pg, pts);
            for (var i = 0; i < n; i++) { var d1 = an.heads[(i + n - 1) % n], w = G.wedge(pts[i], d1, d1 + an.ext[i], 1.0, an.ext[i]); fillPoly(bd.poly(w.pts, 'pl-poly', g), COL[1]); }
            pa.textContent = '每個外角 ＝ 360° ÷ ' + n + ' ＝ ' + (Math.round(e * 10) / 10) + '°'; pb.textContent = '每個內角 ＝ ' + (Math.round((180 - e) * 10) / 10) + '°';
            if (ti < 3 && Math.abs(e - targets[ti]) < 1e-9) { ti++; if (ti >= 3) { P.toast('外角 ＝ 360° ÷ 邊數'); P.track('aha', { id: 'polygon-angles', step: 4 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { while (ti < 3) { sn.set(360 / targets[ti]); } }); txt(); draw(); b0.append(P.hint('外角和是 360°，平分給 n 個角。'));
        },
        /* 關 2：龜步走回起點 */
        function (b0, done, setSolve) {
          var ks = [5, 8, 9], ti = 0, alpha = 60, L = 2.2, S0 = [4.3, 2.0], info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(info, host);
          var bd = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), path = h('polyline', { points: '', class: 'pl-line pl-line--green pl-line--bold', fill: 'none' }); bd.gMid.append(path); bd.dot(S0, 'pl-dot pl-dot--pink', null, 0.22); var endDot = bd.dot(S0, 'pl-dot', null, 0.18);
          var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-amber'), pc = P.pill('', ''); b0.append(h('div', { class: 'pl-readout' }, pa, pb, pc));
          function txt() { info.innerHTML = '小豹「向前走一步、左轉 α°」重複<b>' + ks[Math.min(ti, 2)] + ' 步</b>。拉滑桿調整 α，讓牠<b>剛好走回起點</b>（粉紅點）。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw() {
            var k = ks[Math.min(ti, 2)], pts = [S0], hd = 0, i; for (i = 0; i < k; i++) { var q = pts[i]; pts.push([q[0] + L * Math.cos(hd * rad), q[1] + L * Math.sin(hd * rad)]); hd += alpha; }
            path.setAttribute('points', bd.pts(pts)); path.style.display = ''; var E = pts[k]; endDot.setAttribute('cx', E[0]); endDot.setAttribute('cy', bd.Y(E[1])); var closed = dist(E, S0) < 0.06, total = k * alpha;
            pa.textContent = 'α ＝ ' + alpha + '°'; pb.textContent = k + ' 步共轉 ' + k + ' × ' + alpha + ' ＝ ' + total + '°'; pc.className = 'pl-pill' + (closed ? ' is-ok' : ''); pc.textContent = closed ? '✓ 走回起點了！' : '還沒回到起點';
            if (closed && ti < 3) { P.toast(total === 360 ? '剛好轉一圈 360°：正 ' + k + ' 邊形！' : '轉了 ' + total / 360 + ' 圈才回到起點（星形）'); ti++; if (ti >= 3) { P.track('aha', { id: 'polygon-angles', step: 5 }); txt(); done(); } else { txt(); setTimeout(draw, 650); } }
          }
          var sl = P.slider(10, 170, alpha, function (v) { alpha = +v; draw(); }); b0.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '10°'), h('span', {}, '170°')));
          setSolve(function () { while (ti < 3) { var k = ks[ti]; alpha = 360 / k; sl.value = alpha; draw(); } }); txt(); draw(); b0.append(P.hint('轉的總角度要剛好是 360° 的倍數，才會回到起點、方向也和一開始一樣。'));
        },
        /* 關 3：內角和與每個內角 */
        function (b0, done, setSolve) {
          var targets = [{ t: '內角和剛好是 <b>1080°</b>', n: 8 }, { t: '每個內角剛好是 <b>150°</b>', n: 12 }], ti = 0, n = 5, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var bd = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }), pg = bd.poly([C0, C0, C0], 'pl-poly pl-poly--amber'); bd.gMid.append(g);
          var pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pc = P.pill('外角和 ＝ 360°（不變）', 'is-ok'); b0.append(h('div', { class: 'pl-readout' }, pa, pb, pc));
          var sn = P.stepper('邊數 n', 3, 14, n, function (v) { n = v; draw(); }); b0.append(h('div', { class: 'pl-steprow' }, sn.el));
          function txt() { info.innerHTML = '調整正多邊形的邊數，讓' + targets[Math.min(ti, 1)].t + '。<small>（目標 ' + (Math.min(ti, 1) + 1) + ' / 2）</small>'; }
          function draw() {
            g.innerHTML = ''; var pts = G.regPoly(n, C0, 3.6, 90 + 180 / n), an = G.polyAngles(pts), inner = 180 - 360 / n; bd.setPoly(pg, pts);
            var d1 = an.heads[0] + 180, w = G.wedge(pts[1], an.heads[1], an.heads[0] + 180, 1.1, inner); fillPoly(bd.poly(w.pts, 'pl-poly', g), COL[0]);
            pa.textContent = '內角和 ＝ (' + n + ' − 2) × 180° ＝ ' + (n - 2) * 180 + '°'; pb.textContent = '每個內角 ＝ ' + (Math.round(inner * 10) / 10) + '°';
            var ok = ti === 0 ? (n - 2) * 180 === 1080 : Math.abs(inner - 150) < 1e-9;
            if (ti < 2 && ok) { ti++; if (ti >= 2) { P.toast('內角和 ＝ (n − 2) × 180°'); P.track('aha', { id: 'polygon-angles', step: 6 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } }
          }
          setSolve(function () { while (ti < 2) { sn.set(targets[ti].n); } }); txt(); draw(); b0.append(P.hint('內角和 ＝ n 個「平角 180°」− 外角和 360°。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'polygon-angles' }); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'polygon-angles', moduleName: '多邊形的外角和為什麼是 360°', askAbout: '國中多邊形與幾何', aha: '沿著多邊形走一圈會轉 360°，<br>所以不管幾邊形，外角和都是 360°。',
        cards: [{ text: '多邊形的外角和 ＝ 360°；正 n 邊形每個外角 ＝ 360° ÷ n', src: '國中「多邊形的內角與外角」（國中數學課綱）' }, { text: 'n 邊形的內角和 ＝ (n − 2) × 180°', src: '國中「多邊形的內角和」' }],
        depth: { here: 0.15, cheetah: [{ at: 0.4, label: '正多邊形<br>角度問題' }, { at: 0.86, label: '多邊形分割<br>面積與鋪磚' }] },
        teasers: [
          { title: '三角形的外角定理', q: '三角形的外角 ＝ 兩個不相鄰內角的和，為什麼？它和「外角和 360°」是什麼關係？', where: 'J81S 2507 第 23–25 堂：CH7 三角形的基本性質（外角、多邊形內外角和）', lv: 'L2' },
          { title: '平面閉折線', q: '把多邊形推廣成「可以交叉、可以凹進去」的閉折線，角度和還能算嗎？', where: 'J82A 2601 第 6、8、10–12 堂：平面閉折線', lv: 'L2' },
          { title: '直線形中的角度問題', q: '平行線、三角形、多邊形混在一起的角度題，怎麼一步一步算出來？', where: 'PK4A 2507 第 7 堂：直線形中的角度問題', lv: 'L2' }],
        parent: { pitfall: '孩子常把「內角和」和「外角和」搞混：內角和隨邊數增加，外角和永遠是 <b>360°</b>；也常忘記外角是「延長一邊」後產生的那個角。', place: '國中多邊形角度的核心，之後的正多邊形、鋪磚、三角函數的弧度（轉一圈 ＝ 2π）都會用到。', ask: ['沿著多邊形走一圈，為什麼一定是轉 360°？', '正十二邊形每個外角幾度？每個內角呢？', '如果一個正多邊形每個外角是 30°，它有幾邊？'] },
        classes: ['J81S（2507 第 23–25 堂）：CH7 三角形的基本性質（含多邊形的內角和、外角和）', 'J82A（2601 第 6、8、10–12 堂）：平面閉折線', 'PK4A（2507 第 7 堂）：直線形中的角度問題'],
        next: { href: 'play-trig-ratio.html', text: '下一個：三角比' } });
    }];
  new P.Lesson({ id: 'polygon-angles', title: '多邊形的外角和為什麼是 360°', steps: steps });
})();
