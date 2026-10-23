/* 獵豹玩中學｜E0 原型（不對外）：3D 可拖動的點＋半透明平面＋手機手勢
   三個點 A、B、C 決定一個半透明平面，第四個點 D 看是不是在這個平面上（共面）。
   驗證重點：拖點時視角不轉、點不被平面遮住、標籤不互相壓住、手機 375px 可操作。 */
(function () {
  var P = Play, h = P.h, V = PS.v, COL = PS.COL;
  function f1(v) { return (Math.round(v * 100) / 100).toString().replace('-', '−'); }
  function vs(p) { return '(' + p.map(function (x) { return String(x).replace('-', '−'); }).join(', ') + ')'; }

  var steps = [
    function (st, api) {
      st.append(P.instr('拖動 <b>A、B、C、D</b> 四個點。拖在<b>點上</b>是移動點（視角不會轉），拖在<b>空白處</b>才是旋轉視角。藍色半透明的面是 A、B、C 三點決定的平面。'));
      var sc = P3.scene(st), pts = [
        { name: 'A', p: [-2, 1, 1], color: COL.blue, mode: 'floor' }, { name: 'B', p: [2, 0, 1], color: COL.blue, mode: 'floor' },
        { name: 'C', p: [0, 2, -2], color: COL.blue, mode: 'floor' }, { name: 'D', p: [1, 3, 0], color: COL.pink, mode: 'floor' }];
      var main = [], drag = P3.drag(sc, pts, { onMove: function () { rebuild(); } });
      var pA = P.pill('', 'is-blue'), pE = P.pill('', 'is-green'), pD = P.pill('', 'is-pink'), pG = P.pill('', 'is-amber'); [pA, pE, pD, pG].forEach(function (p) { p.style.whiteSpace = 'normal'; });
      P3.controls(st, sc, pts);
      st.append(h('div', { class: 'pl-readout' }, pA), h('div', { class: 'pl-readout' }, pE), h('div', { class: 'pl-readout' }, pD), h('div', { class: 'pl-readout' }, pG));
      var base = sc.onPreRender; sc.onPreRender = function (c, s) { main.forEach(function (d, i) { d.ring = drag.hot === i; d.ringColor = '#122548'; d.ringW = 3; }); base(c, s); };
      function rebuild() {
        var A = pts[0].p, B = pts[1].p, C = pts[2].p, D = pts[3].p, eq = P3.planeEq(A, B, C), faces = [], lines = P3.floor(sc), texts = [];
        sc.P3.layoutItems = []; var angTx = null;
        var fc = P3.planeFace(A, B, C, { also: [D], color: COL.blue }); if (fc) faces.push(fc);
        [[A, B], [B, C], [A, C]].forEach(function (e) { lines.push({ a: e[0], b: e[1], color: COL.blue, w: 3 }); });
        pts.forEach(function (pt) { var g = [pt.p[0], 0, pt.p[2]]; if (pt.p[1] > 0) lines.push({ a: pt.p, b: g, color: 'rgba(18,37,72,.45)', w: 1.5, dash: [4, 4] }); });
        var info = '';
        if (eq) {
          var nl = V.len(eq.n), s = (V.dot(eq.n, D) - eq.d), dist = Math.abs(s) / nl, foot = V.sub(D, V.mul(eq.n, s / (nl * nl)));
          if (Math.abs(s) > 1e-9) lines.push({ a: D, b: foot, color: COL.pink, w: 2.5, dash: [5, 4] });
          pE.textContent = '平面 ABC：' + P3.eqStr(eq); pD.textContent = Math.abs(s) < 1e-9 ? 'D 在平面 ABC 上：A、B、C、D 四點共面 ✓' : 'D 到平面 ABC 的距離 ＝ ' + f1(dist); pD.className = 'pl-pill ' + (Math.abs(s) < 1e-9 ? 'is-ok' : 'is-pink');
          var BA = V.sub(A, B), BC = V.sub(C, B), ang = Math.acos(Math.max(-1, Math.min(1, V.dot(BA, BC) / (V.len(BA) * V.len(BC))))) * 180 / Math.PI, right = Math.abs(ang - 90) < 1e-9;
          if (right) { P3.rightMark(B, V.norm(BA), V.norm(BC), 0.32).forEach(function (l) { lines.push(l); }); }
          var tx = { p: B, t: right ? '∠B＝90°' : '∠B＝' + f1(ang) + '°', color: COL.green, size: 13, halo: true }; texts.push(tx); angTx = tx;
          pG.textContent = '∠ABC ＝ ' + f1(ang) + '°' + (right ? '（直角，畫小方框）' : '');
        } else { pE.textContent = 'A、B、C 在同一直線上：可以有很多個平面，所以要「不共線」的三點才能定出一個平面'; pD.textContent = ''; pG.textContent = ''; }
        pA.textContent = 'A ' + vs(A) + '　B ' + vs(B) + '　C ' + vs(C) + '　D ' + vs(D);
        var shadow = []; pts.forEach(function (pt) { if (pt.p[1] > 0) shadow.push({ p: [pt.p[0], 0, pt.p[2]], r: 3, color: 'rgba(18,37,72,.5)' }); });
        main = pts.map(function (pt, i) { var d = { p: pt.p, r: 9, color: pt.color, label: pt.name, labelColor: pt.color, size: 17, top: true, ring: drag.hot === i }; sc.P3.layoutItems.push({ obj: d, kind: 'dot' }); return d; });
        if (angTx) sc.P3.layoutItems.push({ obj: angTx, kind: 'text' });   /* 點的名字先排，角度的字再找空位 */
        sc.faces = faces; sc.lines = lines; sc.texts = texts; sc.dots = shadow.concat(main); sc.invalidate();
      }
      rebuild(); window.__E0 = { sc: sc, pts: pts, drag: drag, rebuild: rebuild };
      api.solve(function () { drag.moveTo(3, [1, 1, 0]); drag.moveTo(3, [0, 1, 0]); }, false, '把 D 拖到 A、B、C 的平面上，四點就共面');
      api.unlock('原型完成'); st.append(P.hint('這是 E0 原型，只用來測試 3D 的拖點與手機手勢。'));
    },
    function (st) {
      P.complete(st, { id: 'e0-proto', moduleName: 'E0 原型', askAbout: '3D 原型', aha: '拖點時視角不轉、拖空白處才旋轉。', cards: [{ text: '原型：三點決定一個平面', src: 'E0' }], depth: { here: 0.3, cheetah: [{ at: 0.6, label: '空間' }] }, teasers: [], parent: { pitfall: '—', place: '—', ask: ['—'] }, classes: [], next: { href: 'play.html', text: '回獵豹玩中學' } });
    }];
  new P.Lesson({ id: 'e0-proto', title: 'E0 原型：3D 拖點與平面', steps: steps });
})();
