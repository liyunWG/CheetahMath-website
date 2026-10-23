/* 獵豹玩中學｜絕對值（一）：零點把數線切成兩段
   預測＋拖 x 看 |x−2| → 自己找 |x＋1| 的零點 → 3 個操作關卡（|x−2|＝3、分段解 |x−2|＝2x−1、|2x−4|＝6）。
   要擊中的迷思：直接去掉絕對值、負的那一段只改符號、解沒有回頭檢查是否落在那一段。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, PN = window.PN, f = PN.fmt;
  var VMIN = -3, VMAX = 7, AY = 3.0, AZ = 6.2, VALS = [];
  for (var q = VMIN; q <= VMAX; q++) VALS.push(q);
  function innerStr(k, c) { return (k === 1 ? 'x' : k + 'x') + (c > 0 ? ' ＋ ' + c : c < 0 ? ' − ' + (-c) : ''); }
  function negStr(k, c) { return (k === 1 ? '−x' : '−' + k + 'x') + (c > 0 ? ' − ' + c : c < 0 ? ' ＋ ' + (-c) : ''); }
  function wrapPill(p) { p.style.whiteSpace = 'normal'; return p; }

  /* 畫面：數線＋零點＋（可選）可拖動的 x。
     o: k, c（絕對值裡面是 k·x＋c）、placeZero（要學生自己把零點拖到位）、noX（不要 x 把手）、target（|…| 的目標值）、
        gate（預測前擋住）、sm（小畫板）、onX(v, 裡面的值, 絕對值)、onZero()。 */
  function scene(host, o) {
    var k = o.k, c = o.c, z = -c / k, zv = o.placeZero ? 0 : z, zKnown = !o.placeZero, xv = 6, S = {};
    var b = PA.board(host, 12, 7.8, o.sm ? 'pl-svg--sm' : ''), gB = h('g'), gD = h('g');
    b.gMid.append(gB);
    var ax = PN.axis(b, { vmin: VMIN, vmax: VMAX, y: AY, labelGap: 1.25 }), X = ax.X;
    b.gMid.append(gD);
    var zLine = b.line([X(zv), AY + 0.3], [X(zv), AZ - 0.55], 'pl-line pl-line--amber pl-line--dash', gD);
    var tz = b.text([X(zv), o.placeZero ? AZ + 0.95 : AZ + 0.35], o.placeZero ? '零點' : '零點 x ＝ ' + f(z), 'pl-text pl-text--amber', gD);
    var segL = b.text([0, 0], '', 'pl-text pl-text--sm pl-text--pink', gD), segR = b.text([0, 0], '', 'pl-text pl-text--sm pl-text--green', gD);
    var zDot = b.dot([X(z), AY], 'pl-dot pl-dot--green', gD, 0.2);
    var tx = o.noX ? null : b.text([X(xv), AY + 0.95], 'x', 'pl-text pl-text--blue', gD);
    var brk = (k === 1 && !o.noX) ? b.line([X(xv), AY + 1.55], [X(z), AY + 1.55], 'pl-line pl-line--green', gD) : null;
    var tD = brk ? b.text([6, AY + 2.1], '', 'pl-text pl-text--sm', gD) : null;
    var pIn = P.pill('', 'is-green'), pAbs = P.pill('', 'is-blue'), pZ = P.pill('', 'is-amber'), pL = wrapPill(P.pill('', 'is-pink')), pR = wrapPill(P.pill('', 'is-green'));
    if (!o.noX) host.append(h('div', { class: 'pl-readout' }, pIn, pAbs));
    if (o.placeZero) host.append(h('div', { class: 'pl-readout' }, pZ));
    var rowL = h('div', { class: 'pl-readout' }, pL), rowR = h('div', { class: 'pl-readout' }, pR); rowL.style.display = rowR.style.display = 'none'; host.append(rowL, rowR);
    pL.textContent = 'x ＜ ' + f(z) + '：|' + innerStr(k, c) + '| ＝ −(' + innerStr(k, c) + ') ＝ ' + negStr(k, c);
    pR.textContent = 'x ≥ ' + f(z) + '：|' + innerStr(k, c) + '| ＝ ' + innerStr(k, c);

    function bands() {
      gB.innerHTML = ''; var show = zKnown;
      zDot.style.display = segL.style.display = segR.style.display = show ? '' : 'none';
      if (!show) return;
      var x0 = X(VMIN) - 0.5, x1 = X(VMAX) + 0.5;
      gB.append(h('rect', { x: x0, y: b.Y(AY) - 0.32, width: X(z) - x0, height: 0.64, fill: 'rgba(214,51,108,.22)' }), h('rect', { x: X(z), y: b.Y(AY) - 0.32, width: x1 - X(z), height: 0.64, fill: 'rgba(31,157,85,.22)' }));
      b.setText(segL, [(x0 + X(z)) / 2, AY - 2.3], 'x ＜ ' + f(z)); b.setText(segR, [(X(z) + x1) / 2, AY - 2.3], 'x ≥ ' + f(z));
      zDot.setAttribute('cx', X(z)); zDot.setAttribute('cy', b.Y(AY));
      rowL.style.display = rowR.style.display = '';
    }
    function upd() {
      if (o.noX) return;
      var val = k * xv + c, ab = Math.abs(val);
      b.setText(tx, [X(xv), AY + 0.95], 'x');
      pIn.textContent = innerStr(k, c) + ' ＝ ' + f(val); pIn.className = 'pl-pill ' + (val < 0 ? 'is-pink' : 'is-green');
      pAbs.textContent = '|' + innerStr(k, c) + '| ＝ ' + f(ab); pAbs.className = 'pl-pill ' + (o.target !== undefined && ab === o.target ? 'is-ok' : 'is-blue');
      if (brk) {
        if (zKnown) { b.setLine(brk, [X(xv), AY + 1.55], [X(z), AY + 1.55]); brk.setAttribute('class', 'pl-line pl-line--' + (xv < z ? 'pink' : 'green')); b.setText(tD, [(X(xv) + X(z)) / 2, AY + 2.1], xv === z ? '' : '到 ' + f(z) + ' 的距離 ＝ ' + ab); }
        else { brk.style.display = 'none'; b.setText(tD, [6, AY + 2.1], ''); }
      }
      if (zKnown) { pL.style.opacity = val < 0 ? 1 : 0.35; pR.style.opacity = val >= 0 ? 1 : 0.35; }
    }
    function reveal() { bands(); if (hd) hd.el.style.opacity = 1; upd(); }
    /* 零點：拖動中只更新畫面，放開時才算數（不然拖過頭會在經過正確位置的瞬間被判對，把手卻停在別處） */
    function showZ() {
      var val = k * zv + c;
      b.setLine(zLine, [X(zv), AY + 0.3], [X(zv), AZ - 0.55]); b.setText(tz, [X(zv), AZ + 0.95]);
      pZ.textContent = 'x ＝ ' + f(zv) + ' 時，' + innerStr(k, c) + ' ＝ ' + f(val); pZ.className = 'pl-pill ' + (val === 0 ? 'is-ok' : 'is-amber');
    }
    function commitZ() {
      if (k * zv + c !== 0 || zKnown) return;
      zKnown = true; tz.textContent = '零點 x ＝ ' + f(zv); P.toast('零點在 x ＝ ' + f(zv) + '：裡面剛好是 0');
      var g = b.goalMark([X(zv), AZ]); g.setAttribute('class', 'pl-goal'); reveal(); if (o.onZero) o.onZero(S);
    }
    var zh = null, hd = null;
    if (o.placeZero) zh = b.handle({ pos: [X(zv), AZ], candidates: VALS.map(function (v) { return [X(v), AZ]; }), disabled: function () { return zKnown; }, onMove: function (t) { zv = Math.round(ax.V(t[0])); showZ(); }, onEnd: function (t) { zv = Math.round(ax.V(t[0])); showZ(); commitZ(); } });
    if (!o.noX) hd = b.handle({ pos: [X(xv), AY], candidates: VALS.map(function (v) { return [X(v), AY]; }),
      disabled: function () { return !!(o.gate && o.gate.on) || (o.placeZero && !zKnown); },
      onMove: function (t) { xv = Math.round(ax.V(t[0])); upd(); if (o.onX) { var val = k * xv + c; o.onX(xv, val, Math.abs(val)); } } });
    if (hd && o.placeZero) hd.el.style.opacity = 0.35;
    if (o.placeZero) showZ();
    bands(); upd();
    S.b = b; S.X = X; S.z = z; S.zKnown = function () { return zKnown; };
    S.setX = function (v) { hd.moveTo([X(v), AY]); };
    S.toZero = function () { zh.moveTo([X(z), AZ]); };
    return S;
  }

  var steps = [
    /* 1. 預測＋拖 x */
    function (st, api) {
      var gate = { on: true }, seen = { L: 0, R: 0 }, done = false, s;
      P.choice(st, api, { id: 'abs1-p1', predict: true, label: '先猜猜看', prompt: '<b>x ＝ 0</b> 時，<b>|x − 2|</b> 等於多少？', row: true, options: [{ t: '−2' }, { ok: true, t: '2' }, { t: '0' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把 x 拖到零點的左邊和右邊各看看'); } });
      st.append(P.instr('拖動數線上的 <b>x</b>，看看 <b>|x − 2|</b> 怎麼變。'));
      s = scene(st, { k: 1, c: -2, gate: gate, onX: function (v) {
        if (gate.on) return; if (v < 2) seen.L = 1; else seen.R = 1;
        if (seen.L && seen.R && !done) {
          done = true; P.track('aha', { id: 'abs-split', step: 1 }); if (api.ctx.p1 === 1) P.toast('你猜對了：x＝0 時 |x−2| ＝ 2');
          st.append(P.ruleBox('<b>零點</b>是讓絕對值裡面等於 0 的地方，這裡是 <b>x ＝ 2</b>。它把數線切成兩段：<br>右邊（x ≥ 2）裡面是正的：|x − 2| ＝ x − 2<br>左邊（x ＜ 2）裡面是負的：|x − 2| ＝ −(x − 2) ＝ 2 − x<br>絕對值就是 x 到 2 的<b>距離</b>，所以怎麼走都不會是負的。', '零點'));
          api.unlock('零點把數線切成兩段');
        }
      } });
      api.solve(function () { gate.on = false; s.setX(0); s.setX(5); });
      st.append(P.hint('x 在零點的左邊和右邊，去掉絕對值的方法一樣嗎？')); api.lock('先做上面的預測');
    },
    /* 2. 自己找零點：|x＋1| */
    function (st, api) {
      var seen = { L: 0, R: 0 }, done = false, s;
      st.append(P.instr('這次是 <b>|x ＋ 1|</b>。把 <b>零點</b> 拖到「絕對值裡面剛好等於 0」的位置，數線才會被切開。'));
      s = scene(st, { k: 1, c: 1, placeZero: true, onX: function (v) {
        if (!s.zKnown()) return; if (v < -1) seen.L = 1; else seen.R = 1;
        if (seen.L && seen.R && !done) {
          done = true; P.track('aha', { id: 'abs-split', step: 2 });
          st.append(P.ruleBox('<b>零點</b>：讓裡面等於 0 的 x，這裡是 <b>x ＝ −1</b>。<br>右邊（x ≥ −1）：|x ＋ 1| ＝ x ＋ 1<br>左邊（x ＜ −1）：|x ＋ 1| ＝ <b>−(x ＋ 1)</b> ＝ −x − 1<br>負的那一段，要把<b>整個</b>裡面加括號再變號。', '找零點'));
          api.unlock('零點 ＝ 裡面等於 0 的 x');
        }
      }, onZero: function () { st.append(P.hint('零點找到了。再把 x 拖到零點兩邊，看看絕對值怎麼去掉。')); } });
      api.solve(function () { s.toZero(); s.setX(-3); s.setX(3); });
      st.append(P.hint('想想看：x 等於多少時，x ＋ 1 會變成 0？')); api.lock('先找到零點，再把 x 拖到兩邊');
    },
    /* 3. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* 找出所有讓 |…| ＝ 目標值 的 x */
      function findTask(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: cfg.prompt }));
          var found = {}, n = 0, pN = P.pill('找到 0 / ' + cfg.sols.length, 'is-blue'), s;
          s = scene(b0, { k: cfg.k, c: cfg.c, sm: true, target: cfg.target, placeZero: cfg.placeZero, onX: function (v, val, ab) {
            if (ab === cfg.target && !found[v]) { found[v] = 1; n++; pN.textContent = '找到 ' + n + ' / ' + cfg.sols.length; P.toast('找到了：x ＝ ' + f(v) + (n < cfg.sols.length ? '，還有別的位置' : '')); if (n === cfg.sols.length) done(); }
          } });
          b0.append(h('div', { class: 'pl-readout' }, pN));
          setSolve(function () { if (cfg.placeZero) s.toZero(); cfg.sols.forEach(function (v) { s.setX(v); }); }, cfg.ans);
          b0.append(P.hint(cfg.hint));
        };
      }
      /* 分段解：兩段各解一次，解不在那一段就淘汰 */
      function segTask(b0, done, setSolve) {
        b0.append(h('div', { class: 'pl-q', html: '解 <b>|x − 2| ＝ 2x − 1</b>。這次不拖 x：分別在<b>兩段</b>裡去掉絕對值、解出來，看看解會落在哪一段。' }));
        var s = scene(b0, { k: 1, c: -2, sm: true, noX: true }), b = s.b, pressed = {}, nP = 0, out = h('div', {}), g = h('g'); b.gTop.append(g);
        var info = {
          R: { label: '看 x ≥ 2 這一段', cand: -1, ok: false, html: '<b>x ≥ 2</b> 時，|x − 2| ＝ x − 2。<br>解 x − 2 ＝ 2x − 1，得 x ＝ −1。<br>可是 −1 <b>不在</b> x ≥ 2 這一段裡，<b>淘汰</b>。' },
          L: { label: '看 x ＜ 2 這一段', cand: 1, ok: true, html: '<b>x ＜ 2</b> 時，|x − 2| ＝ −(x − 2) ＝ 2 − x。<br>解 2 − x ＝ 2x − 1，得 x ＝ 1。<br>1 在 x ＜ 2 這一段裡，<b>保留</b>。' } };
        function press(key) {
          if (pressed[key]) return; pressed[key] = 1; nP++; var I = info[key];
          g.append(h('circle', { cx: s.X(I.cand), cy: b.Y(AY), r: 0.22, fill: I.ok ? '#1f9d55' : '#8a94a6', stroke: '#fff', 'stroke-width': 0.06 }));
          b.text([s.X(I.cand), AY + 0.95], I.ok ? '✓' : '✗', 'pl-text ' + (I.ok ? 'pl-text--green' : 'pl-text--pink'), g);
          out.append(h('div', { class: 'pl-fb ' + (I.ok ? 'is-good' : 'is-bad'), html: I.html })); btns[key].disabled = true;
          if (nP === 2) { P.toast('答案只有 x ＝ 1'); b0.append(P.ruleBox('解完一段，要<b>回頭檢查</b>：算出來的 x 必須落在<b>這一段</b>裡才算數。這題只有 x ＝ 1（驗算：|1 − 2| ＝ 1，2·1 − 1 ＝ 1）。', '檢查')); done(); }
        }
        var btns = {}; var row = h('div', { class: 'pl-row pl-row--center' });
        ['R', 'L'].forEach(function (key) { var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, info[key].label); bt.addEventListener('click', function () { press(key); }); btns[key] = bt; row.append(bt); });
        b0.append(row, out);
        setSolve(function () { press('R'); press('L'); }, 'x ＝ 1（x ＝ −1 不在 x ≥ 2 這一段，要淘汰）'); b0.append(P.hint('兩段都看過，才知道哪個解能留下來。'));
      }
      var tasks = [
        findTask({ prompt: '拖動 <b>x</b>，找出<b>所有</b>讓 <b>|x − 2| ＝ 3</b> 的 x。', k: 1, c: -2, target: 3, sols: [-1, 5], ans: 'x ＝ −1 和 x ＝ 5（到 2 的距離都是 3）', hint: '絕對值是到 2 的距離。距離 3 的位置有幾個？' }),
        segTask,
        findTask({ prompt: '這題的裡面是 <b>2x − 4</b>。先把 <b>零點</b> 放好，再找出所有讓 <b>|2x − 4| ＝ 6</b> 的 x。', k: 2, c: -4, target: 6, placeZero: true, sols: [-1, 5], ans: '零點是 x ＝ 2；解是 x ＝ −1 和 x ＝ 5', hint: '零點是讓 2x − 4 等於 0 的 x，不是 4。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'abs-split' }); } });
    },
    /* 4. 完成 */
    function (st) {
      P.complete(st, {
        id: 'abs-split', moduleName: '絕對值：零點把數線切成兩段', askAbout: '國中絕對值與數線', aha: '絕對值裡面等於 0 的地方是<b>零點</b>。<br>零點把數線切成兩段，每一段各自去掉絕對值；解出來的 x，要回頭檢查有沒有落在那一段。',
        cards: [{ text: '|A| ＝ A（A ≥ 0）；|A| ＝ −A（A ＜ 0）。|x − a| 是數線上 x 到 a 的距離', src: '國中「整數與數線」：絕對值' }, { text: '解絕對值方程式：找零點 → 數線分段 → 各段去絕對值 → 解 → 檢查解是否在該段', src: '國中到高中：絕對值方程式' }],
        depth: { here: 0.12, cheetah: [{ at: 0.4, label: '絕對值不等式<br>兩個絕對值' }, { at: 0.8, label: '分段函數圖形<br>最小值與距離和' }] },
        teasers: [
          { title: '絕對值是「距離」', q: '|a − b| 在數線上是什麼？|x − 1| ＝ |x − 5| 的 x 在哪裡？', where: 'J71A 2507／2607 第 4、5 堂：整數與數線（絕對值）', lv: 'L2' },
          { title: '兩個絕對值：|x − 1| ＋ |x − 4|', q: '兩個零點把數線切成三段，各段怎麼去絕對值？總和最小是多少？', where: 'S101 2507 第 5 堂：數與式（絕對值）', lv: 'L3' }],
        parent: { pitfall: '孩子常直接把絕對值符號拿掉、沒有先找零點；負的那一段只把符號改掉，沒有把整個式子加括號變號（−(x − 2) 寫成 −x − 2）；解出來也不回頭檢查它是不是落在那一段，結果多出不該有的答案。', place: '國中七年級「整數與數線」的絕對值，到高中會成為絕對值不等式與分段函數的基礎。', ask: ['|x − 2| 在數線上是什麼意思？', '為什麼 x ＝ 0 時 |x − 2| 不是 −2？', '解出來的數字，為什麼還要檢查它在不在那一段？'] },
        classes: ['J71A（2507、2607 第 4、5 堂）：整數與數線，含絕對值', 'S101（2507 第 5 堂）：數與式，含絕對值'], next: { href: 'play-abs-split-2.html', text: '下一個：兩個零點' } });
    }];
  new P.Lesson({ id: 'abs-split', title: '絕對值：零點把數線切成兩段', steps: steps });
})();
