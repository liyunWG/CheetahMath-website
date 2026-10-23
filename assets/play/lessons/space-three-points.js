/* 獵豹玩中學｜空間（一）：三個點決定一個平面（平面的基本性質 Part 1）
   不在空間裡拖點：用固定視角的圖＋「門」「高低不同的柱子＋板子」「按 ＋／－ 調高度」「點格子放柱子」來玩。
   門繞鉸鏈（兩點）轉 → 三根柱子的板子永遠放得穩（三點）→ 四根柱子不一定（四點不一定共面）→ 三根排成一直線板子會翻動（共線）→ 3 個操作關卡。
   要擊中的迷思：以為兩點（一條直線）就能決定平面；三點共線也算；四點一定共面。 */
(function () {
  var P = Play, h = P.h;
  var BLUE = '#2f6fdc', PINK = '#d6336c', GREEN = '#1f9d55', AMBER = '#e08a00', NAVY = '#122548', PURPLE = '#7a4fd6';
  var LCOL = [BLUE, PINK, GREEN, PURPLE], LET = ['A', 'B', 'C', 'D'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 固定視角的斜投影小畫布：世界座標 [x 向右, y 向後, z 向上] ---- */
  function scene(host, c) {
    var svg = h('svg', { viewBox: '0 0 ' + c.W + ' ' + c.H, role: 'img', 'aria-label': c.label || '示意圖', style: { width: '100%', maxWidth: (c.maxW || 460) + 'px', display: 'block', margin: '8px auto', background: '#fbf8f1', borderRadius: '12px', border: '1px solid #e5dccb' } });
    host.append(svg);
    function pr(p) { return [c.ox + c.kx * p[0] + c.ky * p[1], c.oy - c.kyy * p[1] - c.kz * p[2]]; }
    function pts(arr) { return arr.map(function (p) { var q = pr(p); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
    var S = { svg: svg, pr: pr };
    S.clear = function () { while (svg.firstChild) svg.removeChild(svg.firstChild); };
    /* 內容超出畫面（桌面延伸到地板下或很高的地方）時，整張圖縮小一點，讓全部都看得到 */
    S.fit = function (ys) { var y0 = Math.min.apply(null, ys.concat([0])) - (ys.some(function (y) { return y < 12; }) ? 14 : 0), y1 = Math.max.apply(null, ys.concat([c.H])) + (ys.some(function (y) { return y > c.H - 12; }) ? 14 : 0); svg.setAttribute('viewBox', '0 ' + y0.toFixed(1) + ' ' + c.W + ' ' + (y1 - y0).toFixed(1)); };
    S.poly = function (arr, fill, fo, stroke, sw, dash) { svg.append(h('polygon', { points: pts(arr), fill: fill, 'fill-opacity': fo, stroke: stroke || 'none', 'stroke-width': sw || 1, 'stroke-dasharray': dash, 'stroke-linejoin': 'round' })); };
    S.line = function (a, b, stroke, sw, dash) { var A = pr(a), B = pr(b); svg.append(h('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: stroke, 'stroke-width': sw || 1.5, 'stroke-dasharray': dash, 'stroke-linecap': 'round' })); };
    S.ring = function (p, r, stroke, sw, dash) { var q = pr(p); svg.append(h('circle', { cx: q[0], cy: q[1], r: r, fill: 'none', stroke: stroke, 'stroke-width': sw || 2, 'stroke-dasharray': dash })); };
    S.badge = function (p, ch, col) { var q = pr(p); svg.append(h('circle', { cx: q[0], cy: q[1], r: 10, fill: col, stroke: '#fff', 'stroke-width': 2 }), h('text', { x: q[0], y: q[1] + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#fff', 'font-family': 'sans-serif' }, ch)); };
    S.ground = function (x0, y0, x1, y1) { S.poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], '#efe6d2', 1, '#d8cdb5', 1); };
    /* 磚塊柱：(x,y) 是柱子中心，hh 是磚塊數（每塊一格）；頂面中心就是那個「點」 */
    S.pillar = function (x, y, hh, w) {
      w = w || 0.17; var X0 = x - w, X1 = x + w, Y0 = y - w, Y1 = y + w, k;
      if (hh > 0) {
        S.poly([[X0, Y0, 0], [X1, Y0, 0], [X1, Y0, hh], [X0, Y0, hh]], '#dcc7a5', 1, '#8a7355', 1);
        S.poly([[X1, Y0, 0], [X1, Y1, 0], [X1, Y1, hh], [X1, Y0, hh]], '#bfa47c', 1, '#8a7355', 1);
        for (k = 1; k < hh; k++) { S.line([X0, Y0, k], [X1, Y0, k], '#8a7355', 0.8); S.line([X1, Y0, k], [X1, Y1, k], '#8a7355', 0.8); }
      }
      S.poly([[X0, Y0, hh], [X1, Y0, hh], [X1, Y1, hh], [X0, Y1, hh]], '#f0e2c9', 1, '#8a7355', 1);
    };
    /* 由後往前、由左往右畫，前面的柱子才會蓋住後面的 */
    S.posts = function (list) { list.slice().sort(function (a, b) { return (b.y - a.y) || (a.x - b.x); }).forEach(function (q) { S.pillar(q.x, q.y, q.h, q.w); }); };
    return S;
  }

  /* ---- 三根（三腳凳）或四根（四腳桌）高低不同的柱子，上面放一塊板子 ---- */
  var POS3 = [[0, 0], [1.4, 0], [0.7, 1.2]], POS4 = [[0, 0], [1.2, 0], [1.2, 1.1], [0, 1.1]];
  function pillarFig(host, four) {
    var S = scene(host, { W: 340, H: 240, ox: 104, oy: 214, kx: 80, ky: 34, kyy: 26, kz: 30, label: four ? '四根柱子與桌面' : '三根柱子與板子' }), pos = four ? POS4 : POS3;
    return { S: S, draw: function (hs) {
      S.clear(); S.ground(-0.5, -0.5, four ? 1.7 : 1.9, four ? 1.6 : 1.7);
      S.posts(pos.map(function (p, i) { return { x: p[0], y: p[1], h: hs[i] }; }));
      var t = pos.map(function (p, i) { return [p[0], p[1], hs[i]]; }), res = {};
      if (!four) S.poly([t[0], t[1], t[2]], BLUE, 0.32, BLUE, 2.5);
      else {
        var zp = hs[0] + hs[2] - hs[1], dp = [pos[3][0], pos[3][1], zp], gap = hs[3] - zp; res = { zp: zp, gap: gap };
        S.fit([S.pr(dp)[1], S.pr(t[3])[1], S.pr(t[0])[1], S.pr(t[1])[1], S.pr(t[2])[1]]);
        S.poly([t[0], t[1], t[2], dp], BLUE, 0.13, BLUE, 1.5, '5 4'); S.poly([t[0], t[1], t[2]], BLUE, 0.3, BLUE, 2.5);
        if (gap) { S.line(dp, t[3], PINK, 4); S.ring(dp, 7, PINK, 2.5, '3 3'); } else S.ring(t[3], 15, GREEN, 3.5);
      }
      pos.forEach(function (p, i) { S.badge(t[i], LET[i], LCOL[i]); });
      return res;
    } };
  }

  /* 柱高步進器＋圖＋讀數：free 是可以調的柱子編號；其餘柱子固定。onUpdate 在學生每次調整後呼叫 */
  function figUI(host, hs, free, four, o) {
    o = o || {}; var fig = pillarFig(host, four), n = four ? 4 : 3, steppers = [], row = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '8px 0' } }), pA = P.pill('', 'is-green'), pB = P.pill('', 'is-blue'), fixed = [], i;
    [pA, pB].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    function upd(user) {
      var r = fig.draw(hs);
      if (!four) { pA.textContent = '板子同時碰到 A、B、C 三根的頂端 ✓（只有這一種放法）'; pA.className = 'pl-pill is-green'; pB.textContent = '高度：A＝' + hs[0] + '、B＝' + hs[1] + '、C＝' + hs[2]; }
      else {
        var s1 = hs[0] + hs[2], s2 = hs[1] + hs[3], g = r.gap;
        if (g === 0) { pA.textContent = 'D 柱的頂端剛好碰到桌面 ✓：A、B、C、D 四點共面，桌子不會搖'; pA.className = 'pl-pill is-ok'; }
        else if (g > 0) { pA.textContent = 'D 柱比桌面高 ' + g + ' 格：頂端穿過桌面，四點不共面，桌子會搖'; pA.className = 'pl-pill is-pink'; }
        else { pA.textContent = 'D 柱比桌面低 ' + (-g) + ' 格：頂端碰不到桌面，四點不共面，桌子會搖'; pA.className = 'pl-pill is-pink'; }
        pB.textContent = '對角兩根的高度和：A＋C ＝ ' + s1 + '，B＋D ＝ ' + s2 + (s1 === s2 ? '（相等）' : '（不相等）');
      }
      if (user && o.onUpdate) o.onUpdate(hs, r);
    }
    function mk(i) {
      var s = P.stepper('<b style="color:' + LCOL[i] + '">' + LET[i] + '</b> 柱高', 0, 5, hs[i], function (v) {
        if (o.gate && o.gate()) { s.set(hs[i], true); P.toast('先做上面的預測'); return; }
        hs[i] = v; upd(true);
      }); steppers[i] = s; row.append(s.el);
    }
    for (i = 0; i < n; i++) { if (free.indexOf(i) >= 0) mk(i); else fixed.push(LET[i] + '＝' + hs[i]); }
    host.append(row);
    if (fixed.length) { var pF = P.pill('固定不動：' + fixed.join('、'), 'is-blue'); pF.style.whiteSpace = 'normal'; host.append(h('div', { class: 'pl-readout' }, pF)); }
    host.append(h('div', { class: 'pl-readout' }, pA), h('div', { class: 'pl-readout' }, pB));
    upd(false);
    return { setH: function (i, v) { steppers[i].set(v); } };
  }

  /* ---- 三根一樣高的柱子，擺在 5×5 的地板格子上（從上面看），點格子放柱子 ---- */
  function isCol(p) { return (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[1][1] - p[0][1]) * (p[2][0] - p[0][0]) === 0; }
  function rowStage(host, o) {
    var pos = o.init.map(function (q) { return q.slice(); }), active = 0, col = false, phi = 0, raf = 0, miss = 0, t0 = 0, HZ = 2;
    var cap = h('div', { style: { textAlign: 'center', fontSize: '14px', color: '#6b6552', margin: '6px 0 2px' } }), grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px', maxWidth: '300px', margin: '4px auto' } });
    host.append(cap, grid);
    var S = scene(host, { W: 340, H: 178, ox: 50, oy: 152, kx: 40, ky: 16, kyy: 18, kz: 22, label: '三根一樣高的柱子與板子' });
    function renderGrid() {
      grid.innerHTML = '';
      for (var y = 4; y >= 0; y--) for (var x = 0; x < 5; x++) (function (x, y) {
        var k = -1, i; for (i = 0; i < 3; i++) if (pos[i][0] === x && pos[i][1] === y) k = i;
        var b = h('button', { type: 'button', 'aria-label': '第 ' + (x + 1) + ' 格、第 ' + (y + 1) + ' 排' + (k >= 0 ? '：柱子 ' + LET[k] : ''), style: { height: '52px', border: (k === active ? '3px solid ' + NAVY : '2px solid #d8cdb5'), borderRadius: '10px', background: k >= 0 ? LCOL[k] : '#f4ecda', color: '#fff', fontSize: '19px', fontWeight: 800, cursor: 'pointer', padding: 0, boxShadow: k === active ? '0 0 0 3px rgba(18,37,72,.18)' : 'none' } }, k >= 0 ? LET[k] : '');
        b.addEventListener('click', function () { tap(x, y); }); grid.append(b);
      })(x, y);
      cap.innerHTML = '從正上方看地板（下方靠近你）。要放的柱子：<b style="color:' + LCOL[active] + '">' + LET[active] + '</b>——點空格放下去，點已放的柱子可以改選它';
    }
    function draw() {
      S.clear(); S.ground(-0.5, -0.5, 4.5, 4.5);
      for (var k = 0; k <= 4; k++) { S.line([k, -0.5, 0], [k, 4.5, 0], '#e0d5bd', 0.8); S.line([-0.5, k, 0], [4.5, k, 0], '#e0d5bd', 0.8); }
      S.posts(pos.map(function (p) { return { x: p[0], y: p[1], h: HZ, w: 0.14 }; }));
      var t = pos.map(function (p) { return [p[0], p[1], HZ]; });
      if (!col) S.poly(t, BLUE, 0.32, BLUE, 2.5);
      else {
        var d = [pos[1][0] - pos[0][0], pos[1][1] - pos[0][1]], a = pos[0], b = pos[1], i, q;
        for (i = 1; i < 3; i++) for (q = 0; q < i; q++) { var dd = [pos[i][0] - pos[q][0], pos[i][1] - pos[q][1]]; if (dd[0] * dd[0] + dd[1] * dd[1] > d[0] * d[0] + d[1] * d[1]) { d = dd; a = pos[q]; b = pos[i]; } }
        var L = Math.sqrt(d[0] * d[0] + d[1] * d[1]), u = [d[0] / L, d[1] / L], nh = [-u[1], u[0]], w = 1.1, ex = 0.6, e0 = [a[0] - u[0] * ex, a[1] - u[1] * ex], e1 = [b[0] + u[0] * ex, b[1] + u[1] * ex], cp = Math.cos(phi), sp = Math.sin(phi);
        function cn(e, s) { return [e[0] + s * w * cp * nh[0], e[1] + s * w * cp * nh[1], HZ + s * w * sp]; }
        S.poly([cn(e0, 1), cn(e1, 1), cn(e1, -1), cn(e0, -1)], AMBER, 0.3, AMBER, 2.5);
        S.line([e0[0], e0[1], HZ], [e1[0], e1[1], HZ], NAVY, 2, '6 4');
      }
      pos.forEach(function (p, i) { S.badge([p[0], p[1], HZ], LET[i], LCOL[i]); });
    }
    function frame(t) {
      raf = 0; if (!col) return;
      if (!S.svg.isConnected) { if (++miss > 40) return; raf = requestAnimationFrame(frame); return; }
      phi = 0.42 * Math.sin((t - t0) / 420); draw(); raf = requestAnimationFrame(frame);
    }
    function refresh() {
      col = isCol(pos); phi = col ? 0.35 : 0; draw();
      if (col && !reduce && !raf) { t0 = performance.now(); miss = 0; raf = requestAnimationFrame(frame); }
    }
    function tap(x, y) {
      if (o.gate && o.gate()) { P.toast('先做上面的預測'); return; }
      var k = -1, i; for (i = 0; i < 3; i++) if (pos[i][0] === x && pos[i][1] === y) k = i;
      if (k >= 0) { active = k; renderGrid(); return; }
      pos[active] = [x, y]; active = (active + 1) % 3; renderGrid(); refresh(); o.onChange(pos, col);
    }
    renderGrid(); refresh();
    return { pos: pos, isCol: function () { return col; }, setAll: function (cells) { cells.forEach(function (q, i) { pos[i] = q.slice(); }); renderGrid(); refresh(); o.onChange(pos, col); } };
  }
  function colText(col) { return col ? 'A、B、C 三根的頂端在同一條直線上：板子可以繞著這條線翻動，有無限多種放法，固定不了（三點共線決定不了平面）' : 'A、B、C 三根的頂端不在同一條直線上：板子只有一種放法，穩穩的 ✓'; }

  var steps = [
    /* 1. 過兩個點（一條直線）的平面有無限多個：門繞著鉸鏈轉 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, th = 0;
      P.choice(st, api, { id: 'tp-p1', predict: true, label: '先猜猜看', prompt: '門的上下兩個鉸鏈是<b>點 A、點 B</b>（固定不動）。把門想成一個<b>平面</b>：<b>過 A、B 兩點的平面</b>有幾個？', row: true, options: [{ ok: true, t: '無限多個' }, { t: '只有 1 個' }, { t: '2 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('開門試試看'); } });
      st.append(P.instr('A、B 兩個鉸鏈固定在門框上。拉動滑桿<b>開關門</b>，每開一個角度，門都是<b>過 A、B 的一個平面</b>。看看有多少種不同的門。'));
      var S = scene(st, { W: 340, H: 225, ox: 170, oy: 205, kx: 56, ky: 24, kyy: 20, kz: 28, label: '門繞著鉸鏈 A、B 轉動' }), pT = P.pill('', 'is-blue'); pT.style.whiteSpace = 'normal';
      function door(a, r) { var c = Math.cos(a * Math.PI / 180) * r, s = Math.sin(a * Math.PI / 180) * r; return [[0, 0, 0], [c, s, 0], [c, s, 3], [0, 0, 3]]; }
      function draw() {
        S.clear(); var g = [], k; for (k = 0; k <= 36; k++) g.push([2.4 * Math.cos(k * Math.PI / 36), 2.4 * Math.sin(k * Math.PI / 36), 0]);
        S.poly(g, '#efe6d2', 1, '#d8cdb5', 1);
        Object.keys(seen).forEach(function (a) { if (+a !== th) S.poly(door(+a, 2.2), BLUE, 0.06, BLUE, 1, '4 3'); });
        S.poly(door(th, 2.2), BLUE, 0.32, BLUE, 2.5); S.line([0, 0, 0], [0, 0, 3], NAVY, 5);
        S.badge([0, 0, 0], 'A', BLUE); S.badge([0, 0, 3], 'B', BLUE);
      }
      function setTh(v) { th = v; if (!seen[th]) { seen[th] = 1; n++; } draw(); pT.textContent = '門開了 ' + th + '°：過 A、B 的另一個平面（已看過 ' + n + ' 種）'; }
      var sl = P.slider(0, 180, 0, function (v) {
        if (gate.on) { sl.value = th; P.toast('先做上面的預測'); return; }
        setTh(v);
        if (n >= 5 && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 1 }); if (api.ctx.p1 === 0) P.toast('你猜對了：無限多個'); st.append(P.ruleBox('過 A、B 兩點（一條直線）的平面有<b>無限多個</b>：平面可以繞著這條直線轉，每轉一點就是另一個平面。所以只知道兩個點<b>決定不了</b>平面，還要再給一個<b>不在這條直線上</b>的點，才能把平面固定下來。', '兩點不夠')); api.unlock('要再一個不在直線上的點'); }
      }, 15);
      seen[0] = 1; n = 1; draw(); pT.textContent = '門開了 0°：過 A、B 的一個平面（已看過 1 種）';
      st.append(h('div', { class: 'pl-slider-lab' }, h('span', {}, '開門的角度：0° 到 180°')), sl, h('div', { class: 'pl-readout' }, pT));
      api.solve(function () { gate.on = false;[30, 75, 120, 160].forEach(function (v) { sl.value = v; setTh(v); }); if (n >= 5 && !done) { done = true; st.append(P.ruleBox('過 A、B 兩點（一條直線）的平面有<b>無限多個</b>。', '兩點不夠')); api.unlock('要再一個不在直線上的點'); } }, false, '無限多個（門可以開成任何角度，每個角度都是過 A、B 的平面）');
      st.append(P.hint('慢慢拉滑桿，數數看有幾種不同的門。')); api.lock('先做上面的預測');
    },
    /* 2. 三根柱子：板子永遠放得穩（三腳凳不會搖） */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, done = false, hs = [2, 0, 3];
      P.choice(st, api, { id: 'tp-p2', predict: true, label: '先猜猜看', prompt: '地面凹凸不平，<b>三根高低不同的柱子</b>A、B、C，頂端要放一塊板子。板子<b>一定能同時碰到三根的頂端</b>、放得穩嗎？', row: true, options: [{ ok: true, t: '一定可以，放得穩' }, { t: '要看高度，有時第三根會懸空' }, { t: '最多只能碰到兩根' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('調整柱子高度'); } });
      st.append(P.instr('按 <b>＋、－</b> 調整三根柱子的高度（每按一次多一塊磚）。試著想辦法讓板子<b>碰不到其中一根</b>或放不穩——至少換 5 種高度組合。'));
      var ctl = figUI(st, hs, [0, 1, 2], false, { gate: function () { return gate.on; }, onUpdate: function () {
        var k = hs.join(); if (!seen[k]) { seen[k] = 1; n++; }
        if (n >= 5 && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 2 }); if (api.ctx.p2 === 0) P.toast('你猜對了：一定放得穩'); st.append(P.ruleBox('不管三根柱子多高多低，只要三個頂端<b>不在同一條直線上</b>，板子就<b>剛好有一種放法</b>，同時碰到三根。這就是「不共線的三點決定唯一的平面」，也是三腳凳不會搖的原因。', '三點決定一個平面')); api.unlock('三點決定唯一的平面'); }
      } });
      seen[hs.join()] = 1; n = 1;
      api.solve(function () { gate.on = false; [[0, 2], [1, 4], [2, 0], [0, 5], [1, 1], [2, 3]].forEach(function (a) { ctl.setH(a[0], a[1]); }); }, false, '一定可以，放得穩（三個頂端不共線，只有一種板子放法）');
      st.append(P.hint('不管怎麼調，板子都有辦法碰到三根嗎？')); api.lock('先做上面的預測');
    },
    /* 3. 四根柱子：不一定（四點不一定共面） */
    function (st, api) {
      var gate = { on: true }, done = false, seenOk = false, seenBad = false, hs = [1, 0, 0, 0];
      P.choice(st, api, { id: 'tp-p3', predict: true, label: '先猜猜看', prompt: '現在換成<b>四根柱子</b>A、B、C、D 的<b>四腳桌</b>。四根高低不同時，桌面<b>一定能同時碰到四根</b>嗎？', row: true, options: [{ ok: true, t: '不一定' }, { t: '一定可以' }], onAnswer: function (i) { api.ctx.p3 = i; gate.on = false; api.lock('調整柱子高度'); } });
      st.append(P.instr('A、B、C 三根已經決定了藍色桌面（虛線是桌面延伸到 D 的位置）。調整四根柱子的高度，看 D 柱的頂端和桌面的關係。找出一個<b>桌子不會搖</b>（D 剛好碰到桌面）、而且<b>四根不是全部一樣高</b>的組合。'));
      var ctl = figUI(st, hs, [0, 1, 2, 3], true, { gate: function () { return gate.on; }, onUpdate: function (hh, r) {
        var allEq = hh.every(function (v) { return v === hh[0]; });
        if (r.gap === 0 && !allEq) seenOk = true; if (r.gap !== 0) seenBad = true;
        if (seenOk && seenBad && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 3 }); if (api.ctx.p3 === 0) P.toast('你猜對了：不一定'); st.append(P.ruleBox('A、B、C 三根已經決定了一個桌面，<b>第四根 D 的頂端要剛好落在這個桌面上</b>，四點才共面、桌子才不會搖。所以空間中的四個點<b>不一定共面</b>。<br>你也許發現了：不會搖的時候，<b>對角兩根的高度和相等</b>（A＋C ＝ B＋D）。', '四點不一定共面')); api.unlock('四點不一定共面'); }
      } });
      api.solve(function () { gate.on = false; ctl.setH(2, 2); ctl.setH(3, 3); ctl.setH(3, 0); }, false, '不一定：D 要剛好碰到桌面才不會搖（例如 A、B、C、D ＝ 1、0、2、3，因為 1＋2 ＝ 0＋3）');
      st.append(P.hint('桌子會搖的時候，看「D 柱比桌面高／低幾格」，再調整其中一根。')); api.lock('先做上面的預測');
    },
    /* 4. 三根排成一直線：板子翻動 */
    function (st, api) {
      var gate = { on: true }, seenCol = false, seenNon = true, done = false, pR = P.pill(colText(false), 'is-green'); pR.style.whiteSpace = 'normal';
      P.choice(st, api, { id: 'tp-p4', predict: true, label: '先猜猜看', prompt: '三根<b>一樣高</b>的柱子排在地板上。如果 A、B、C <b>排成一直線</b>，頂端的板子會怎樣？', row: true, options: [{ ok: true, t: '可以繞著這條線翻動，放法不唯一' }, { t: '還是只有一種放法' }, { t: '一定會掉下來' }], onAnswer: function (i) { api.ctx.p4 = i; gate.on = false; api.lock('點格子放柱子'); } });
      st.append(P.instr('點下面的格子，把三根柱子放在地板上（上圖是同樣的柱子從斜上方看）。先隨便擺幾種，再試著讓 A、B、C <b>排成一直線</b>。'));
      var R = rowStage(st, { init: [[1, 1], [3, 1], [2, 3]], gate: function () { return gate.on; }, onChange: function (p, col) {
        pR.textContent = colText(col); pR.className = 'pl-pill ' + (col ? 'is-pink' : 'is-green'); if (col) seenCol = true; else seenNon = true;
        if (seenCol && seenNon && !done) { done = true; P.track('aha', { id: 'space-three-points', step: 4 }); if (api.ctx.p4 === 0) P.toast('你猜對了：共線時放法不唯一'); st.append(P.ruleBox('三根柱子排成<b>一直線</b>時，板子可以<b>繞著這條線翻動</b>，有無限多種放法，所以<b>三點共線決定不了平面</b>。要「<b>不共線</b>」的三點，才決定唯一的平面。', '三點要不共線')); api.unlock('不共線的三點才決定唯一的平面'); }
      } });
      st.append(h('div', { class: 'pl-readout' }, pR));
      api.solve(function () { gate.on = false; R.setAll([[0, 2], [2, 2], [4, 2]]); R.setAll([[1, 1], [3, 1], [2, 3]]); }, false, '可以繞著這條線翻動，放法不唯一（三根排成一直線時，三點共線決定不了平面）');
      st.append(P.hint('哪些擺法，三根的頂端會落在同一條線上？橫的、直的、斜的都試試看。')); api.lock('先做上面的預測');
    },
    /* 5. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function tableTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var hs = cfg.hs.slice(), fin = false, ctl;
          ctl = figUI(b0, hs, cfg.free, true, { onUpdate: function (hh, r) { if (!fin && cfg.ok(hh, r)) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule(hh), '找到了')); done(); } } });
          setSolve(function () { cfg.ans.forEach(function (a) { ctl.setH(a[0], a[1]); }); }, cfg.answer); b0.append(P.hint(cfg.hint));
        };
      }
      function rowTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '三根<b>一樣高</b>的柱子。找出 <b>3 種不同的擺法</b>，讓板子<b>會翻動</b>（A、B、C 排成一直線），其中至少要有 <b>1 種是斜著排的</b>。' }));
        var found = [], slanted = false, fin = false, pN = P.pill('已找到 0 種（要 3 種以上）', 'is-blue'), pS = P.pill('斜著排的：還沒有', 'is-amber');
        function upd() { pN.textContent = '已找到 ' + found.length + ' 種（要 3 種以上）'; pS.textContent = slanted ? '斜著排的：已找到 ✓' : '斜著排的：還沒有'; pS.className = 'pl-pill ' + (slanted ? 'is-ok' : 'is-amber'); }
        var R = rowStage(b0, { init: [[0, 0], [4, 0], [2, 3]], onChange: function (p, col) {
          if (!col || fin) return; var key = p.map(function (q) { return q.join(','); }).sort().join('|');
          if (found.indexOf(key) >= 0) { P.toast('這種擺法找過了，換一種'); return; }
          found.push(key); if (p[1][0] !== p[0][0] && p[1][1] !== p[0][1]) slanted = true; upd();
          if (found.length >= 3 && slanted) { fin = true; P.toast('找到 3 種，而且有斜的'); b0.append(P.ruleBox('不管是橫排、直排還是斜排，只要三根的頂端<b>在同一條直線上</b>，板子都可以繞著這條線翻動，<b>決定不了平面</b>。', '找到了')); done(); }
          else if (found.length >= 3) P.toast('還差一種斜著排的');
        } });
        b0.append(h('div', { class: 'pl-readout' }, pN), h('div', { class: 'pl-readout' }, pS));
        setSolve(function () { R.setAll([[0, 0], [1, 0], [2, 0]]); R.setAll([[0, 1], [0, 2], [0, 4]]); R.setAll([[0, 0], [1, 1], [3, 3]]); }, '例如：同一橫排 (0,0)(1,0)(2,0)、同一直排 (0,1)(0,2)(0,4)、斜排 (0,0)(1,1)(3,3)（只要三根在同一條直線上都可以）');
        b0.append(P.hint('三根要排在同一條線上；橫的、直的找到後，再想想怎麼排成斜線。'));
      }
      var tasks = [rowTask,
        tableTask({ prompt: '四腳桌的 A、B、D 三根柱子的高度已經固定。調整<b> C 柱</b>的高度，讓桌子<b>不會搖</b>（四個頂端共面）。', hs: [2, 4, 0, 1], free: [2], ok: function (hh, r) { return r.gap === 0; }, ans: [[2, 3]], answer: 'C ＝ 3（A＋C ＝ 2＋3 ＝ 5，B＋D ＝ 4＋1 ＝ 5，相等才共面）', msg: '桌子不會搖了', rule: function (hh) { return '桌子不會搖：A＋C ＝ ' + hh[0] + '＋' + hh[2] + ' ＝ ' + (hh[0] + hh[2]) + '，B＋D ＝ ' + hh[1] + '＋' + hh[3] + ' ＝ ' + (hh[1] + hh[3]) + '，四個頂端共面。'; }, hint: '看「D 柱比桌面高／低幾格」，或比較對角兩根的高度和。' }),
        tableTask({ prompt: '四根柱子的高度要<b>各不相同</b>，而且桌子<b>不會搖</b>。', hs: [0, 0, 0, 0], free: [0, 1, 2, 3], ok: function (hh, r) { var s = {}; hh.forEach(function (v) { s[v] = 1; }); return Object.keys(s).length === 4 && r.gap === 0; }, ans: [[1, 1], [2, 3], [3, 2]], answer: 'A、B、C、D ＝ 0、1、3、2（A＋C ＝ B＋D ＝ 3；其他符合 A＋C ＝ B＋D 且四個不同的組合也可以）', msg: '高度各不相同，桌子也不會搖', rule: function (hh) { return '高度 ' + hh.join('、') + ' 各不相同，A＋C ＝ ' + (hh[0] + hh[2]) + ' ＝ B＋D，四個頂端共面，桌子不會搖。'; }, hint: '先讓三根決定桌面，再把第四根調到剛好碰到桌面；四個數字不能有重複。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'space-three-points' }); } });
    },
    function (st) {
      P.complete(st, {
        id: 'space-three-points', moduleName: '空間（一）：三個點決定一個平面', askAbout: '平面的基本性質（三點定平面）',
        aha: '<b>過兩個點（一條直線）的平面有無限多個</b>；<b>不共線的三點</b>才決定<b>唯一</b>的平面；第四個點<b>不一定</b>在這個平面上。',
        cards: [{ text: '公理：不在同一直線上的三點，決定唯一一個平面', src: '高中：空間中的直線與平面' }, { text: '推論：一條直線與直線外一點、兩條相交直線、兩條平行直線，也各決定一個平面', src: '平面的基本性質' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '平面方程式 ax＋by＋cz＝d<br>法向量' }, { at: 0.85, label: '四點共面的行列式條件' }] },
        teasers: [{ title: '四點共面', q: '四個點 A、B、C、D 共面，向量 AB、AC、AD 之間有什麼關係？', where: 'S111 2507 第 25 堂（CH1 空間向量 02）', lv: 'L2' }],
        parent: { pitfall: '孩子常以為兩個點（一條直線）就能決定平面；也常忘了「不共線」這個條件；以為任意四點都共面。', place: '空間單元的第一步，後面的直線與平面關係都從這裡出發。', ask: ['過兩個點的平面有幾個？', '三點在同一條直線上，能決定平面嗎？', '空間中的四個點一定共面嗎？（想想四腳桌為什麼會搖）'] },
        classes: ['S111 2507 第 25 堂（2026 年 1 月）：CH1 空間向量 02（共面）', 'S112 2601 第 5 堂（2026 年 3 月）：CH2 空間中平面直線 01（平面方程式）'], next: { href: 'play-space-plane-axioms.html', text: '下一個：兩個平面相交成一條直線' } });
    }];
  new P.Lesson({ id: 'space-three-points', title: '空間（一）：三個點決定一個平面', steps: steps });
})();
