/* 獵豹玩中學｜截面：用一個平面切正方體，看切面是幾邊形（三角形、四邊形、五邊形、正六邊形） */
(function () {
  var P = Play, h = P.h, D = Play3D, V3 = PS.v;
  var CV = [], CE = [], i, j;
  [-.5, .5].forEach(function (x) { [-.5, .5].forEach(function (y) { [-.5, .5].forEach(function (z) { CV.push([x, y, z]); }); }); });
  for (i = 0; i < 8; i++) for (j = i + 1; j < 8; j++) { var df = 0; for (var k = 0; k < 3; k++) if (Math.abs(CV[i][k] - CV[j][k]) > 0) df++; if (df === 1) CE.push([i, j]); }
  var FCOL = ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'];
  var PRE = { flat: { n: [0, 1, 0], name: '水平切' }, diag: { n: [0, 1, 1], name: '對角切' }, corner: { n: [1, 1, 1], name: '切角' }, tilt: { n: [2, 3, 4], name: '斜切' } };
  var NAMES = { 3: '三角形', 4: '四邊形', 5: '五邊形', 6: '六邊形' };

  function unit(n) { return V3.norm(n); }
  /* 平面 n·p = d 與正方體的截面（依序排好的頂點） */
  function section(n, d) {
    var pts = [];
    CE.forEach(function (e) {
      var a = CV[e[0]], b = CV[e[1]], pa = V3.dot(n, a) - d, pb = V3.dot(n, b) - d; if (Math.abs(pa - pb) < 1e-12) return; var t = pa / (pa - pb); if (t < -1e-9 || t > 1 + 1e-9) return;
      var p = V3.lerp(a, b, t), dup = pts.some(function (q) { return V3.len(V3.sub(p, q)) < 1e-6; }); if (!dup) pts.push(p);
    });
    if (pts.length < 3) return [];
    var c = [0, 0, 0]; pts.forEach(function (p) { c = V3.add(c, p); }); c = V3.mul(c, 1 / pts.length);
    var helper = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], u = V3.norm(V3.cross(n, helper)), v = V3.cross(n, u);
    pts.sort(function (p, q) { var pp = V3.sub(p, c), qq = V3.sub(q, c); return Math.atan2(V3.dot(pp, v), V3.dot(pp, u)) - Math.atan2(V3.dot(qq, v), V3.dot(qq, u)); });
    return pts;
  }
  function sideLens(pts) { return pts.map(function (p, i) { return V3.len(V3.sub(pts[(i + 1) % pts.length], p)); }); }
  function shapeName(pts) {
    var n = pts.length, L = sideLens(pts), eq = Math.max.apply(null, L) - Math.min.apply(null, L) < 0.01;
    if (n === 3) return eq ? '正三角形' : '三角形';
    if (n === 6) { return eq && regularAngles(pts) ? '正六邊形' : '六邊形'; }
    if (n === 4) {
      var d = [0, 1, 2, 3].map(function (i) { return V3.sub(pts[(i + 1) % 4], pts[i]); }), right = Math.abs(V3.dot(d[0], d[1])) < 1e-6, par = function (a, b) { return V3.len(V3.cross(a, b)) < 1e-6; };
      if (right && eq) return '正方形'; if (right) return '長方形'; if (par(d[0], d[2]) && par(d[1], d[3])) return '平行四邊形'; if (par(d[0], d[2]) || par(d[1], d[3])) return '梯形'; return '四邊形';
    }
    return n + ' 邊形';
  }
  function regularAngles(pts) { var n = pts.length, a0 = null, ok = true; pts.forEach(function (p, i) { var v1 = V3.norm(V3.sub(pts[(i + n - 1) % n], p)), v2 = V3.norm(V3.sub(pts[(i + 1) % n], p)), a = Math.acos(V3.dot(v1, v2)); if (a0 === null) a0 = a; else if (Math.abs(a - a0) > 0.01) ok = false; }); return ok; }

  /* 場景：透明正方體＋截面 */
  function SecScene(host, o) {
    o = o || {}; this.sc = PS.scene(host, { scale: o.scale || 112, aspect: o.aspect || 1.6, maxH: o.maxH || 200, yaw: -0.65, pitch: 0.45 }); this.n = [0, 1, 0]; this.d = 0; var sc = this.sc;
    sc.lines = CE.map(function (e) { return { a: CV[e[0]], b: CV[e[1]], color: '#122548', w: 2 }; });
  }
  SecScene.prototype = {
    set: function (n, d) {
      this.n = unit(n); this.d = d; var pts = section(this.n, d), sc = this.sc;
      sc.faces = D.cubeFaces(-.5, -.5, -.5, 1, '#fff').map(function (f, i) { f.fill = FCOL[i]; f.alpha = 0.14; f.stroke = null; f.flat = true; f.nopick = true; return f; });
      sc.dots = []; sc.texts = []; var keep = sc.lines.slice(0, CE.length); sc.lines = keep;
      if (pts.length >= 3) { sc.faces.push({ pts: pts, fill: '#f2a93b', alpha: 0.82, stroke: '#b4700b', lw: 2.4, flat: true, double: true, nopick: true }); pts.forEach(function (p) { sc.dots.push({ p: p, r: 4, color: '#b4700b' }); }); }
      sc.invalidate(); return pts;
    },
    range: function () { var n = this.n, r = (Math.abs(n[0]) + Math.abs(n[1]) + Math.abs(n[2])) / 2; return r; }
  };
  /* 把「過三個鄰頂點」切下一個角，剩下的立體（7 個頂點） */
  function cornerCutSolid() { var V = CV.filter(function (p) { return !(p[0] > 0 && p[1] > 0 && p[2] > 0); }), F = PS.hull(V); return { V: V, F: F, E: (function () { var seen = {}, E = []; F.forEach(function (f) { for (var i = 0; i < f.length; i++) { var a = f[i], b = f[(i + 1) % f.length], k = Math.min(a, b) + '-' + Math.max(a, b); if (!seen[k]) { seen[k] = 1; E.push([a, b]); } } }); return E; })() }; }

  var steps = [
    /* 1 切切看 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, cur = 'tilt';
      P.choice(st, api, { id: 'ss-p1', predict: true, label: '先猜猜看', prompt: '用<b>一個平面</b>切正方體，<b>切面最多</b>可能是幾邊形？', row: true, options: [{ t: '四邊形' }, { t: '五邊形' }, { t: '六邊形' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('換切法、拉滑桿，找出三、四、五、六邊形'); } });
      var ss = new SecScene(st, { maxH: Math.max(150, Math.min(200, window.innerHeight - 590)) }), pr = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pr), tags = h('div', { class: 'ps-pills' }), tp = {};
      [3, 4, 5, 6].forEach(function (k) { tp[k] = P.pill(NAMES[k] + ' ？', ''); tags.append(tp[k]); });
      function upd(v) {
        if (gate.on) { P.toast('先做上面的預測'); return; } var nn = unit(PRE[cur].n), r = Math.abs(nn[0]) + Math.abs(nn[1]) + Math.abs(nn[2]); var d = (v / 200 - 0.5) * (r - 0.02); if (Math.abs(d) < 0.02) d = 0;
        var pts = ss.set(PRE[cur].n, d), k = pts.length; pr.textContent = k >= 3 ? '切面：' + shapeName(pts) + '（' + k + ' 邊形）' : '沒有切到';
        if (k >= 3 && NAMES[k] && !seen[k]) { seen[k] = 1; n++; tp[k].textContent = NAMES[k] + ' ✓'; tp[k].className = 'pl-pill is-ok'; }
        if (n >= 4 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-section', step: 1 }); st.append(P.ruleBox('切一刀，切面可能是<b>三角形、四邊形、五邊形、六邊形</b>，<b>最多 6 邊</b>。<br>因為正方體只有 <b>6 個面</b>，每個面最多被切出一條邊。', '發現')); P.toast(api.ctx.p1 === 2 ? '你猜對了！最多六邊形' : '最多是六邊形'); api.unlock('三到六邊形都找到了！'); }
      }
      var sl = P.slider(0, 200, 100, upd), seg = PS.seg(st, Object.keys(PRE).map(function (k) { return { k: k, t: PRE[k].name }; }), function (k) { cur = k; sl.value = 100; upd(100); }, {});
      api.solve(function () { gate.on = false; Object.keys(PRE).forEach(function (k) { if (n >= 4) return; cur = k; seg.set(k, false); for (var v = 0; v <= 200 && n < 4; v += 4) { sl.value = v; upd(v); } }); });
      seg.set('tilt', false); st.append(h('div', { class: 'ps-note' }, '拉動滑桿，平面從一邊移到另一邊'), sl, ro, tags); ss.set(PRE.tilt.n, 0); pr.textContent = '先做預測，再拉滑桿'; api.lock('先做上面的預測');
    },
    /* 2 正六邊形 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '正六邊形'), P.instr('平面朝著「<b>角</b>」的方向切。把滑桿調到切面是<b>正六邊形</b>！'));
      var ss = new SecScene(st, { maxH: Math.max(150, Math.min(210, window.innerHeight - 560)) }), n0 = [1, 1, 1], done = false, nn = unit(n0), r = Math.abs(nn[0]) + Math.abs(nn[1]) + Math.abs(nn[2]);
      var pr = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pr);
      var sl = P.slider(0, 200, 30, function (v) {
        var d = (v / 200 - 0.5) * (r - 0.02); if (Math.abs(d) < 0.03) { d = 0; sl.value = 100; } var pts = ss.set(n0, d), name = pts.length >= 3 ? shapeName(pts) : '沒有切到'; pr.textContent = '切面：' + name; pr.className = 'pl-pill ' + (name === '正六邊形' ? 'is-ok' : 'is-amber');
        if (name === '正六邊形' && !done) { done = true; P.track('aha', { id: 'solid-section', step: 2 }); st.append(P.ruleBox('平面<b>通過正方體中心</b>、並且<b>垂直於一條體對角線</b>時，切面是<b>正六邊形</b>（頂點是 6 條稜的中點）。<br>每邊長 ＝ √(0.5² ＋ 0.5²) ＝ √2／2 ≈ 0.71。', '性質')); api.unlock('找到正六邊形了！'); }
      });
      ss.set(n0, (30 / 200 - 0.5) * (r - 0.02)); pr.textContent = '切面：三角形（小的）';
      api.solve(function () { sl.value = 100; sl.dispatchEvent(new Event('input')); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 靠近一個角'), h('span', {}, '靠近對面的角 →')), ro, P.hint('接近正中間時會「吸」過去。')); api.lock('調出正六邊形');
    },
    /* 3 切下一個角 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '切下一個角'), P.instr('把平面推到<b>剛好通過 3 個相鄰頂點</b>（圖中的橘色點），切下一個小角。'));
      var ss = new SecScene(st, { maxH: Math.max(150, Math.min(200, window.innerHeight - 600)) }), n0 = [1, 1, 1], nn = unit(n0), r = Math.abs(nn[0]) + Math.abs(nn[1]) + Math.abs(nn[2]), dT = 0.5 / Math.sqrt(3), done = false, ask = h('div', {});
      var pr = P.pill('', 'is-amber'), ro = h('div', { class: 'pl-readout' }, pr);
      var sl = P.slider(0, 200, 150, function (v) {
        if (done) return; var d = (v / 200 - 0.5) * (r - 0.02); if (Math.abs(d - dT) < 0.025) { d = dT; sl.value = Math.round((dT / (r - 0.02) + 0.5) * 200); } var pts = ss.set(n0, d); pr.textContent = '切面：' + (pts.length >= 3 ? shapeName(pts) : '沒有切到');
        if (Math.abs(d - dT) < 1e-9 && !done) { done = true; sl.disabled = true; P.track('aha', { id: 'solid-section', step: 3 }); pr.className = 'pl-pill is-ok'; pr.textContent = '切面：正三角形（邊長 √2）'; showAsk(); }
      });
      function showAsk() {
        var qb = h('div', {}); ask.append(qb); qb.append(h('div', { class: 'pl-q', html: '切下來的是一個<b>三角錐</b>（三條稜長都是 1）。它的體積是整個正方體的幾分之幾？<br><small>想想：底是直角三角形（面積 1/2），高 1，三角錐體積 ＝ 底面積 × 高 ÷ 3。</small>' }));
        P.choice(qb, {}, { id: 'ss-t3', prompt: '', row: true, options: [{ t: '1/3', fb: '1/3 是用整個正方形當底、高 1 的錐體。這裡的底是直角三角形（正方形的一半）。' }, { t: '1/6', ok: true, fb: '對！(1/2 × 1) ÷ 3 ＝ 1/6。' }, { t: '1/8', fb: '1/8 是切成 8 個小正方體的一份。' }], onAnswer: function () { P.track('transfer_ok', { id: 'solid-section', q: 3 }); setTimeout(function () { qb.style.display = 'none'; }, 1200); ask.append(P.ruleBox('把平面推到經過 3 個鄰頂點，切面是<b>正三角形</b>，切下的是 <b>1/6 個正方體</b>的三角錐。', '性質')); api.unlock('切下一個角了！'); } });
      }
      var ref = ss.set(n0, (150 / 200 - 0.5) * (r - 0.02));
      [[-.5, .5, .5], [.5, -.5, .5], [.5, .5, -.5]].forEach(function (p) { ss.sc.dots.push({ p: p, r: 6, color: '#e8590c', ring: true }); }); ss.sc.invalidate();
      var oldSet = ss.set; ss.set = function (n, d) { var pts = oldSet.call(ss, n, d); [[-.5, .5, .5], [.5, -.5, .5], [.5, .5, -.5]].forEach(function (p) { ss.sc.dots.push({ p: p, r: 6, color: '#e8590c', ring: true }); }); ss.sc.invalidate(); return pts; };
      pr.textContent = '切面：' + shapeName(ref);
      api.solve(function () { sl.value = Math.round((dT / (r - 0.02) + 0.5) * 200); sl.dispatchEvent(new Event('input')); });
      st.append(sl, h('div', { class: 'pl-slider-lab' }, h('span', {}, '← 平面在中間'), h('span', {}, '推向那個角 →')), ro, ask, P.hint('接近橘色三點時會「吸」過去。')); api.lock('切下一個角');
    },
    /* 4 換個外觀 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var sc = PS.scene(box, { scale: 112, aspect: 1.7, maxH: Math.max(140, Math.min(190, window.innerHeight - 580)), yaw: -0.65, pitch: 0.45 });
          sc.faces = D.cubeFaces(-.5, -.5, -.5, 1, '#fff').map(function (f, i) { f.fill = FCOL[i]; f.alpha = 0.14; f.stroke = null; f.flat = true; f.nopick = true; return f; });
          var A = CV[0], C = CV[3], F = CV[5]; // (-.5,-.5,-.5)、(-.5,.5,.5)... 取同一個頂點的三條面對角線端點
          var T = [[-.5, -.5, -.5].map(function (x) { return x; }), [.5, -.5, .5], [.5, .5, -.5]]; T = [[-.5, -.5, .5], [.5, -.5, -.5], [-.5, .5, -.5]];
          sc.lines = CE.map(function (e) { return { a: CV[e[0]], b: CV[e[1]], color: '#122548', w: 2 }; }); sc.faces.push({ pts: T, fill: '#f2a93b', alpha: 0.8, stroke: '#b4700b', lw: 2.4, flat: true, double: true, nopick: true });
          ['A', 'B', 'C'].forEach(function (nm, i) { sc.dots.push({ p: T[i], r: 6, color: '#b4700b', ring: true, label: nm, dy: -13 }); }); sc.invalidate();
          P.choice(box, {}, { id: 'ss-t1', prompt: '平面經過<b>正方體的三個頂點 A、B、C</b>（三條都是某個面的對角線）。切面 △ABC 是什麼三角形？', row: true, options: [{ t: '正三角形', ok: true, fb: '對！三邊都是面對角線，長度都是 √2。' }, { t: '直角三角形', fb: '三條邊一樣長，三個角都是 60°。' }, { t: '等腰三角形', fb: '三邊一樣長，是更特別的正三角形。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var ss = new SecScene(box, { maxH: Math.max(140, Math.min(190, window.innerHeight - 600)) }); var pts = ss.set([1, 1, 1], 0); [0, 1, 2, 3, 4, 5].forEach(function (i) { ss.sc.texts.push({ p: V3.mid(pts[i], pts[(i + 1) % 6]), t: '?', color: '#fff', bg: '#d6336c', size: 12 }); }); ss.sc.invalidate();
          P.choice(box, {}, { id: 'ss-t2', prompt: '這個正六邊形的 6 個頂點，是正方體 6 條稜的<b>中點</b>。正方體邊長 1，正六邊形的<b>每邊</b>長是多少？', row: true, options: [{ t: '1／2', fb: '1/2 是半條稜的長。六邊形的邊是斜著連接兩個中點。' }, { t: '√2／2', ok: true, fb: '對！相鄰兩中點的距離 ＝ √(0.5² ＋ 0.5²) ＝ √2／2 ≈ 0.71。' }, { t: '1', fb: '1 是整條稜長，六邊形的邊比它短。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var S = cornerCutSolid(), sc = PS.scene(box, { scale: 112, aspect: 1.7, maxH: Math.max(140, Math.min(190, window.innerHeight - 580)), yaw: -0.65, pitch: 0.45 });
          PS.addSolid(sc, S, { alpha: 0.5, dotR: 4 }); sc.faces.forEach(function (f, i) { if (f.pts.length === 3 && V3.dot(V3.norm(V3.cross(V3.sub(f.pts[1], f.pts[0]), V3.sub(f.pts[2], f.pts[0]))), [1, 1, 1]) > 0.9) f.fill = '#f2a93b'; }); sc.invalidate();
          box.append(h('div', { class: 'pl-q', html: '切掉一個角（橘色是新切出來的面）。剩下的立體有 <b>7 個頂點、12 條稜</b>。它有幾個面？（想想歐拉公式 V − E + F ＝ 2）' }));
          P.numBox(box, { answer: 7, before: '面 F ＝', okMsg: '對！7 − 12 + F ＝ 2，F ＝ 7（3 個正方形＋ 3 個變成三角形的面＋ 1 個切面）。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-section' }); }, wrong: function () { return '提示：7 − 12 + F ＝ 2。'; } });
        }];
      function next() { setTimeout(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 5 完成 */
    function (st) {
      P.complete(st, {
        id: 'solid-section', moduleName: '截面', askAbout: '國中、高中立體幾何', aha: '切正方體一刀，切面最多是六邊形；<br>過中心且垂直體對角線，切面是正六邊形。',
        cards: [{ text: '截面：平面與立體相交的圖形；正方體的截面可以是三角形、四邊形、五邊形、六邊形', src: '國中、高中立體圖形的觀察（獵豹 J91S 立體圖形）' }, { text: '過 3 個相鄰頂點的平面切下 1/6 個正方體；過中心垂直體對角線的截面是正六邊形', src: '資優班常見的截面與體積主題（詳細堂次請洽老師）' }],
        depth: { here: 0.2, cheetah: [{ at: 0.5, label: '截面積與體積<br>最大最小' }, { at: 0.9, label: '正多面體的<br>截面' }] },
        teasers: [
          { title: '正六邊形截面的面積', q: '正方體的正六邊形截面，面積是多少？為什麼它是所有截面裡最大的之一？', where: 'J91S 立體圖形（詳細堂次請洽老師）', lv: 'L2' },
          { title: '切一刀，把體積分成 1:1', q: '過正方體中心的任何平面，都把體積分成相等兩半，為什麼？', where: '數資班拓展（請洽老師）', lv: 'L2' },
          { title: '截面與祖暅原理', q: '兩個立體在同高處截面積都相等，體積就相等。球的體積怎麼用這招算出來？', where: 'PK3C 錐體與球體', lv: 'L3' },
          { title: '正四面體的截面', q: '正四面體切一刀，切面最多幾邊形？有沒有可能是正方形？', where: '數資班拓展（請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子很難「看穿」立體內部，常憑感覺猜切面形狀；切面的邊其實來自平面與各個面的交線，最多 6 個面就最多 6 條邊。', place: '國中立體圖形的觀察與高中立體幾何、微積分「截面法求體積」的基礎。', ask: ['切正方體一刀，切面最多幾邊形？為什麼？', '怎麼切才能切出正六邊形？', '切掉一個角後，剩下的立體有幾個面？'] },
        classes: ['J91S：立體圖形', 'PK3C：錐體與球體', 'J71S CH5：三視圖與空間觀察'],
        next: { href: 'play.html', text: '回獵豹玩中學看全部單元' } });
    }];
  new P.Lesson({ id: 'solid-section', title: '截面', steps: steps });
})();
