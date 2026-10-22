/* 獵豹玩中學｜兩條直線的交點＝聯立方程式的解（格點版，交點用精確分數計算）
   預測＋拖動兩條直線（交點、平行、重合）→ 找同時在兩條線上的點 → 3 個操作關卡（交在指定點、平行、重合）。 */
(function () {
  var P = Play, h = P.h;
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); return b ? gcd(b, a % b) : a; }
  function rat(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? '' + n : n + '/' + d; }
  function stage(st, sm) { var w = h('div', { class: 'pl-stage' + (sm ? ' pl-stage--sm' : '') }); st.append(w); return w; }
  function clip(p, d) { var t0 = -1e9, t1 = 1e9; [[0, 12, 0], [0, 10, 1]].forEach(function (r) { var i = r[2]; if (d[i] === 0) return; var a = (r[0] - p[i]) / d[i], b = (r[1] - p[i]) / d[i]; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); }); return [[p[0] + d[0] * t0, p[1] + d[1] * t0], [p[0] + d[0] * t1, p[1] + d[1] * t1]]; }
  /* 經過 p、q 的直線：a x + b y = c（a、b、c 都是整數） */
  function coef(p, q) { var a = q[1] - p[1], b = -(q[0] - p[0]); return [a, b, a * p[0] + b * p[1]]; }
  function eqStr(p, q) {
    var dx = q[0] - p[0], dy = q[1] - p[1]; if (dx === 0) return 'x ＝ ' + p[0]; var g = gcd(dy, dx), mn = dy / g, md = dx / g; if (md < 0) { mn = -mn; md = -md; }
    var bn = p[1] * dx - dy * p[0], bd = dx; var bg = gcd(bn, bd) || 1; bn /= bg; bd /= bg; if (bd < 0) { bn = -bn; bd = -bd; }
    var ms = mn === 0 ? '' : (mn === md ? 'x' : mn === -md ? '−x' : (md === 1 ? ('' + mn).replace('-', '−') : '(' + ('' + mn).replace('-', '−') + '/' + md + ')') + 'x');
    var bs = bn === 0 ? '' : (bd === 1 ? ('' + Math.abs(bn)) : Math.abs(bn) + '/' + bd);
    if (!ms) return 'y ＝ ' + (bn === 0 ? '0' : (bn < 0 ? '−' : '') + bs); return 'y ＝ ' + ms + (bn === 0 ? '' : (bn < 0 ? ' − ' : ' ＋ ') + bs);
  }
  function relate(L1, L2) {
    var A = coef(L1[0], L1[1]), B = coef(L2[0], L2[1]), det = A[0] * B[1] - A[1] * B[0];
    if (det === 0) return (A[0] * B[2] === B[0] * A[2] && A[1] * B[2] === B[1] * A[2]) ? { rel: 'same' } : { rel: 'par' };
    var xn = A[2] * B[1] - B[2] * A[1], yn = A[0] * B[2] - B[0] * A[2];
    return { rel: 'one', x: xn / det, y: yn / det, xs: rat(xn, det), ys: rat(yn, det), lattice: xn % det === 0 && yn % det === 0 };
  }
  /* 畫板：兩條直線；move1／move2 決定哪一條有把手可拖。cfg.onChange(info) 每次變動都呼叫 */
  function makeLines(host, cfg) {
    var board = new P.Board(host, { w: 12, h: 10, axes: true, cls: cfg.cls }), g = h('g'), L1 = cfg.L1.map(function (p) { return p.slice(); }), L2 = cfg.L2.map(function (p) { return p.slice(); }), hds = [], self = { board: board };
    board.gMid.append(g);
    for (var k = 2; k <= 12; k += 2) board.text([k, -0.62], '' + k, 'pl-text pl-text--sm'); for (k = 2; k <= 10; k += 2) board.text([-0.45, k - 0.2], '' + k, 'pl-text pl-text--sm');
    function draw() {
      g.innerHTML = ''; var info = relate(L1, L2);
      [[L1, 'pl-line--blue'], [L2, 'pl-line--pink']].forEach(function (l) { var d = [l[0][1][0] - l[0][0][0], l[0][1][1] - l[0][0][1]], c = clip(l[0][0], d); g.append(h('line', { x1: c[0][0], y1: board.Y(c[0][1]), x2: c[1][0], y2: board.Y(c[1][1]), class: 'pl-line pl-line--bold ' + l[1] })); });
      if (info.rel === 'one' && info.x >= 0 && info.x <= 12 && info.y >= 0 && info.y <= 10) { g.append(h('circle', { cx: info.x, cy: board.Y(info.y), r: 0.26, class: 'pl-dot pl-dot--green', style: 'stroke:#fff;stroke-width:2' })); board.text([info.x + 0.9, info.y + 0.35], '(' + info.xs + ', ' + info.ys + ')', 'pl-text pl-text--sm pl-text--green', g); }
      info.e1 = eqStr(L1[0], L1[1]); info.e2 = eqStr(L2[0], L2[1]); self.info = info; if (cfg.onChange) cfg.onChange(info); return info;
    }
    function mk(L, i, partner, cls) {
      var hd = board.handle({ pos: L[i], cls: cls, valid: function (t) { return !(t[0] === partner()[0] && t[1] === partner()[1]); }, onMove: function (t) { L[i] = t; draw(); } }); hds.push(hd); return hd;
    }
    if (cfg.move1) { mk(L1, 0, function () { return L1[1]; }, 'is-blue'); mk(L1, 1, function () { return L1[0]; }, 'is-blue'); }
    if (cfg.move2) { mk(L2, 0, function () { return L2[1]; }, 'is-pink'); mk(L2, 1, function () { return L2[0]; }, 'is-pink'); }
    self.hds = hds; self.L1 = L1; self.L2 = L2; self.draw = draw;
    /* 看詳解用：把 L1／L2 的兩個把手移到指定位置 */
    self.set = function (a, b) { var i = 0; if (cfg.move1 && a) { hds[0].moveTo(a[0]); hds[1].moveTo(a[1]); i = 2; } if (cfg.move2 && b) { hds[i].moveTo(b[0]); hds[i + 1].moveTo(b[1]); } };
    draw(); return self;
  }
  function pills(st) { var p1 = P.pill('', 'is-blue'), p2 = P.pill('', 'is-pink'), pr = P.pill('', 'is-amber'); st.append(h('div', { class: 'pl-readout pl-readout--col' }, p1, p2, pr)); return function (info) { p1.textContent = '直線 1：' + info.e1; p2.textContent = '直線 2：' + info.e2; pr.className = 'pl-pill ' + (info.rel === 'one' ? 'is-ok' : 'is-amber'); pr.textContent = info.rel === 'one' ? '交點 (' + info.xs + ', ' + info.ys + ')：1 組解' : info.rel === 'par' ? '平行：沒有交點，沒有解' : '重合：每個點都是交點，無限多組解'; }; }

  var steps = [
    /* 1. 預測＋拖動兩條直線 */
    function (st, api) {
      var gate = { on: true }, seen = {}, done = false, upd;
      P.choice(st, api, { id: 'li-p1', predict: true, label: '先猜猜看', prompt: '平面上的<b>兩條直線</b>，交點可能有幾個？', row: true, options: [{ t: '一定是 1 個' }, { t: '0 個、1 個，或無限多個' }, { t: '一定是 2 個' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動把手：做出相交、平行、重合'); } });
      var host = stage(st); upd = null; var lines;
      upd = pills(st);
      lines = makeLines(host, { L1: [[1, 3], [7, 5]], L2: [[2, 9], [8, 2]], move1: true, move2: true, onChange: function (info) {
        if (upd) upd(info); if (gate.on) return; seen[info.rel] = 1;
        if (seen.one && seen.par && seen.same && !done) { done = true; P.track('aha', { id: 'line-intersect', step: 1 }); P.toast(api.ctx.p1 === 1 ? '你猜對了！' : '三種情形都出現了'); st.append(P.ruleBox('兩條直線的位置關係只有三種：<br><b>相交</b>（1 個交點，1 組解）、<b>平行</b>（沒有交點，無解）、<b>重合</b>（無限多個交點，無限多組解）。', '三種關係')); api.unlock('相交、平行、重合'); } } });
      host.querySelectorAll('.pl-handle').forEach(function (e) { e.addEventListener('pointerdown', function () { if (gate.on) P.toast('先做上面的預測'); }, true); });
      api.solve(function () { gate.on = false; lines.set([[1, 3], [7, 5]], [[1, 5], [7, 7]]); lines.set([[1, 3], [7, 5]], [[4, 4], [10, 6]]); lines.set([[1, 3], [7, 5]], [[2, 9], [8, 2]]); });
      st.append(P.hint('藍色、粉紅色的點都可以拖。至少做出「平行」「重合」「相交」各一次。')); api.lock('先做上面的預測');
    },
    /* 2. 交點同時在兩條線上 */
    function (st, api) {
      st.append(P.instr('下面兩條直線的方程式是 <b>x − y ＝ −2</b>（藍）和 <b>x ＋ y ＝ 8</b>（粉紅）。拖動綠點 T，找出<b>同時滿足兩個方程式</b>的點。'));
      var done = false, host = stage(st), pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pt = P.pill('', ''); var board = new P.Board(host, { w: 12, h: 10, axes: true }), g = h('g'); board.gMid.append(g);
      st.append(h('div', { class: 'pl-readout pl-readout--col' }, pa, pb, pt));
      board.line([0, 2], [8, 10], 'pl-line pl-line--bold pl-line--blue'); board.line([0, 8], [8, 0], 'pl-line pl-line--bold pl-line--pink');
      for (var k = 2; k <= 12; k += 2) board.text([k, -0.62], '' + k, 'pl-text pl-text--sm'); for (k = 2; k <= 10; k += 2) board.text([-0.45, k - 0.2], '' + k, 'pl-text pl-text--sm');
      function draw(t) { var u = t[0] - t[1], v = t[0] + t[1]; pa.className = 'pl-pill ' + (u === -2 ? 'is-ok' : 'is-blue'); pb.className = 'pl-pill ' + (v === 8 ? 'is-ok' : 'is-pink'); pa.textContent = 'x − y ＝ ' + u + (u === -2 ? ' ✓' : '（要 −2）').replace('-', '−'); pb.textContent = 'x ＋ y ＝ ' + v + (v === 8 ? ' ✓' : '（要 8）'); pt.textContent = 'T ＝ (' + t[0] + ', ' + t[1] + ')'; return u === -2 && v === 8; }
      var hd = board.handle({ pos: [2, 3], onMove: function (t) { if (draw(t) && !done) { done = true; P.track('aha', { id: 'line-intersect', step: 2 }); P.toast('(3, 5) 同時在兩條線上'); st.append(P.ruleBox('交點 (3, 5) <b>同時在兩條直線上</b>，所以它的座標<b>同時滿足兩個方程式</b>：<br>3 − 5 ＝ −2 ✓　3 ＋ 5 ＝ 8 ✓<br>所以<b>兩條直線的交點，就是聯立方程式的解</b>。', '交點＝解')); api.unlock('交點就是聯立方程式的解'); } } });
      api.solve(function () { hd.moveTo([3, 5]); }); draw([2, 3]); st.append(P.hint('先讓 T 落在藍線上，再沿著藍線找粉紅線也經過的位置。')); api.lock('找到同時滿足的點');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function lineTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt })); var host = stage(b0, true), fin = false, upd = pills(b0), lines;
          lines = makeLines(host, { cls: 'pl-svg--sm', L1: cfg.L1, L2: cfg.L2, move1: false, move2: true, onChange: function (info) { upd(info); if (!fin && cfg.ok(info)) { fin = true; P.toast(cfg.msg); done(); } } });
          setSolve(function () { lines.set(null, cfg.ans); }); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        lineTask({ prompt: '藍線固定。拖動粉紅線的兩個點，讓兩條線的<b>交點剛好是 (4, 6)</b>。', L1: [[0, 10], [10, 0]], L2: [[1, 2], [7, 3]], ok: function (i) { return i.rel === 'one' && i.x === 4 && i.y === 6; }, ans: [[4, 6], [8, 7]], msg: '交點 (4, 6)：x＋y＝10 與另一條都過 (4, 6)', hint: '粉紅線只要通過 (4, 6)，而且不能和藍線重合。' }),
        lineTask({ prompt: '藍線固定。拖動粉紅線，讓兩條線<b>平行</b>（沒有交點，聯立方程式無解）。', L1: [[1, 1], [5, 9]], L2: [[2, 8], [8, 3]], ok: function (i) { return i.rel === 'par'; }, ans: [[3, 1], [7, 9]], msg: '斜率一樣、位置不同：平行', hint: '藍線每往右 1 格，往上幾格？粉紅線也要一樣。' }),
        lineTask({ prompt: '藍線固定。拖動粉紅線，讓兩條線<b>完全重合</b>（有無限多組解）。', L1: [[2, 2], [6, 6]], L2: [[1, 8], [8, 3]], ok: function (i) { return i.rel === 'same'; }, ans: [[3, 3], [9, 9]], msg: '重合：每個點都是交點', hint: '兩個點都要落在藍線上。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'line-intersect' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'line-intersect', moduleName: '兩條直線的交點＝聯立方程式的解', askAbout: '國中二元一次聯立方程式與直線圖形', aha: '兩條直線的交點，同時滿足兩個方程式，<br>所以交點就是聯立方程式的解。',
        cards: [{ text: '二元一次方程式的圖形是一條直線；兩條直線相交 → 聯立方程式恰有一組解', src: '國中「二元一次聯立方程式」「直線圖形」' }, { text: '兩直線平行 → 無解；兩直線重合 → 無限多組解', src: '國中二元一次聯立方程式的解的情形' }],
        depth: { here: 0.25, cheetah: [{ at: 0.5, label: '直線系<br>線性規劃' }, { at: 0.88, label: '直線與圓<br>矩陣與克拉瑪' }] },
        teasers: [
          { title: '含參數的聯立：解的個數', q: 'ax ＋ 2y ＝ 4 與 3x ＋ (a−1)y ＝ 6，a 是多少的時候無解？無限多組解？', where: 'J71A 2507 第 23–26 堂：CH4 二元一次方程式', lv: 'L2' },
          { title: '二元一次方程式的圖形', q: '斜率、截距怎麼從方程式看出來？兩條直線與 x 軸圍成的三角形面積怎麼算？', where: 'J71S 2507 第 24–26 堂：CH6 二元一次方程式圖形；J72A 2601 第 5、6 堂：直線', lv: 'L2' },
          { title: '直線與圓', q: '直線和圓可以有 0、1、2 個交點，要怎麼用方程式判斷？', where: 'S101 2507 第 9–13 堂：CH2 直線與圓', lv: 'L3' }],
        parent: { pitfall: '孩子常把聯立方程式當成「消去法的步驟」，不知道解的幾何意義；也容易以為兩條直線一定有交點，忘了平行與重合的情形。', place: '國中二年級（七下／八上）的核心：把代數方程式與座標平面上的直線連在一起。', ask: ['兩條直線的交點，為什麼同時滿足兩個方程式？', '什麼情況下聯立方程式沒有解？', '什麼情況下有無限多組解？'] },
        classes: ['J71A（2507 第 23–26 堂）：CH4 二元一次方程式', 'J71S（2507 第 16–21、24–26 堂）：二元一次聯立方程式、方程式圖形', 'J72A（2601 第 5、6 堂）：CH2 直線'], next: { href: 'play-completing-square.html', text: '下一個：配方法' } });
    }];
  new P.Lesson({ id: 'line-intersect', title: '兩條直線的交點＝聯立方程式的解', steps: steps });
})();
