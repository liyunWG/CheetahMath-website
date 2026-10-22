/* 獵豹玩中學｜配方法＝補成正方形
   x² ＋ px：一個 x×x 的正方形＋ p×x 的長條。長條從中間切開，一半放右邊、一半轉到下面，右下角缺 (p/2)×(p/2)；
   補上去就是 (x ＋ p/2)²。再用同樣的想法找拋物線的最低點、解方程式。 */
(function () {
  var P = Play, h = P.h;
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function R(x, y, w, hh) { return [[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]]; }
  /* 設定長方形；寬或高是 0 就藏起來 */
  function setR(b, el, x, y, w, hh) { b.setPoly(el, R(x, y, w, hh)); el.style.display = (w < 1e-6 || hh < 1e-6) ? 'none' : ''; }
  function mn(n) { return String(n).replace('-', '−'); }
  function sgn(n, s) { return n > 0 ? s + ' ＋ ' + n : s; }

  /* 圖上的正方形：邊長在畫面上取 4 格，文字一律寫 x */
  var X = 4, OX = 0.5, OY = 6.2;

  /* 畫出「x² ＋ p·x」切在 c 處的排法；回傳更新函式 upd(p, c, s)，s 是補上的小方塊邊長 */
  function figure(b, o) {
    o = o || {};
    var ghost = b.poly(R(OX + X, OY, 6, X), 'pl-poly pl-poly--ghost'), cut = b.line([OX + X, OY], [OX + X, OY], 'pl-line pl-line--dash pl-line--thin');
    var S = b.poly(R(OX, OY, X, X), 'pl-poly pl-poly--blue'), Rr = b.poly(R(OX + X, OY, 3, X), 'pl-poly pl-poly--amber'), Bb = b.poly(R(OX, OY - 3, X, 3), 'pl-poly pl-poly--amber');
    var hole = b.poly(R(OX + X, OY - 3, 3, 3), 'pl-poly pl-poly--ghost'), patch = b.poly(R(OX + X, OY - 1, 1, 1), 'pl-poly pl-poly--green');
    var tS = b.text([OX + X / 2, OY + X / 2 - 0.2], 'x²', 'pl-text pl-text--blue pl-text--lg'), tR = b.text([0, 0], '', 'pl-text pl-text--amber'), tB = b.text([0, 0], '', 'pl-text pl-text--amber'), tH = b.text([0, 0], '', 'pl-text pl-text--green');
    b.text([OX - 0.45, OY + X / 2 - 0.2], 'x', 'pl-text pl-text--blue');
    b.text([OX + X / 2, OY + X + 0.5], 'x', 'pl-text pl-text--blue');
    return function upd(p, c, s) {
      var q = p - c, hs = s === undefined ? 0 : s;
      ghost.style.display = o.ghost === false ? 'none' : ''; b.setPoly(ghost, R(OX + X, OY, p, X));
      b.setLine(cut, [OX + X + c, OY - 0.2], [OX + X + c, OY + X + 0.2]); cut.style.display = (o.ghost === false || c <= 0 || c >= p) ? 'none' : '';
      setR(b, Rr, OX + X, OY, q, X); setR(b, Bb, OX, OY - c, X, c); setR(b, hole, OX + X, OY - c, q, c);
      b.setText(tR, [OX + X + q / 2, OY + X / 2 - 0.2], q > 0 ? q + 'x' : ''); b.setText(tB, [OX + X / 2, OY - c / 2 - 0.2], c > 0 ? c + 'x' : '');
      setR(b, patch, OX + X, OY - hs, hs, hs);
      if (hs >= 2) b.setText(tH, [OX + X + Math.min(q, hs) / 2, OY - Math.min(c, hs) / 2 - 0.2], hs + '×' + hs);
      else if (o.holeLabel && q > 0 && c > 0) b.setText(tH, [OX + X + q / 2, OY - c / 2 - 0.2], '缺');
      else b.setText(tH, [0, 0], '');
    };
  }

  /* 拋物線畫板：y ＝ x² ＋ B·x ＋ C。視窗從 (xmin, ymin) 起 12×12 格；回傳 {b, X(t), Y(t), pos(x), handle}。 */
  function parab(host, B, C, xmin, ymin, startX, onMove) {
    var b = new P.Board(host, { w: 12, h: 12, axes: true, ox: -ymin, oy: -xmin }), f = function (x) { return x * x + B * x + C; }, d = '', pen = false, k, x, y;
    for (x = xmin; x <= xmin + 12 + 1e-9; x += 0.1) {
      y = f(x);
      if (y >= ymin - 0.4 && y <= ymin + 12.4) { d += (pen ? ' L ' : ' M ') + (x - xmin).toFixed(3) + ' ' + b.Y(y - ymin).toFixed(3); pen = true; } else pen = false;
    }
    b.gMid.append(h('path', { d: d, class: 'pl-line pl-line--blue pl-line--bold', fill: 'none' }));
    for (k = Math.ceil(xmin / 2) * 2; k <= xmin + 12; k += 2) if (k !== 0) b.text([k - xmin, -ymin - 0.5], mn(k), 'pl-text pl-text--sm');
    for (k = Math.ceil(ymin / 2) * 2; k <= ymin + 12; k += 2) if (k !== 0) b.text([-xmin - 0.45, k - ymin - 0.15], mn(k), 'pl-text pl-text--sm');
    var cand = []; for (x = Math.ceil(xmin + 0.5); x <= xmin + 11.5; x++) { y = f(x); if (y >= ymin + 0.2 && y <= ymin + 11.8) cand.push([x - xmin, y - ymin]); }
    var sx = startX === undefined ? cand[0][0] + xmin : startX;
    var hd = b.handle({ pos: [sx - xmin, f(sx) - ymin], candidates: cand, onMove: function (t) { var X0 = t[0] + xmin; onMove(X0, f(X0), t); } });
    onMove(sx, f(sx), [sx - xmin, f(sx) - ymin]);
    return { b: b, f: f, hd: hd, go: function (X0) { hd.moveTo([X0 - xmin, f(X0) - ymin]); }, pos: function (X0) { return [X0 - xmin, f(X0) - ymin]; } };
  }

  var steps = [
    /* 1. 切開長條，拼成缺角的正方形 */
    function (st, api) {
      var gate = { on: true }, c = 0, hit = false;
      P.choice(st, api, { id: 'cs-p1', predict: true, label: '先猜猜看', prompt: '<b>x² ＋ 6x</b>：一個 x×x 的正方形，旁邊接一條「6 長」的長條。想補成一個<b>完整的大正方形</b>，缺掉的那一小塊會是多大？', row: true, options: [{ t: '3 × 3' }, { t: '6 × 6' }, { t: '3 × 6' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動剪刀，把長條切開'); } });
      st.append(P.instr('橘色長條是 <b>6x</b>。拖動上方的<b>剪刀</b>決定切在哪裡：左邊那塊<b>轉 90° 放到正方形下面</b>，右邊那塊靠在正方形旁邊。'));
      var host = stage(st), b = new P.Board(host, { w: 11, h: 11.8 }), upd = figure(b, { holeLabel: true });
      b.line([OX + X, 11], [OX + X + 6, 11], 'pl-line pl-line--soft pl-line--bold'); for (var k = 0; k <= 6; k++) b.dot([OX + X + k, 11], 'pl-dot', null, 0.1);
      b.text([OX + X - 1.05, 10.88], '✂', 'pl-text');
      var pw = P.pill('', 'is-blue'), ph = P.pill('', 'is-pink'), pk = P.pill('', '');
      st.append(h('div', { class: 'pl-readout' }, pw, ph, pk));
      function draw() {
        var q = 6 - c; upd(6, c, 0);
        pw.textContent = '寬 ＝ ' + sgn(q, 'x'); ph.textContent = '高 ＝ ' + sgn(c, 'x'); var ok = q === c;
        pk.className = 'pl-pill' + (ok ? ' is-ok' : ''); pk.textContent = ok ? '✓ 寬＝高：補上缺角就是大正方形' : (c === 0 || c === 6 ? '還是長長的長方形' : '寬 ≠ 高：補上缺角也不是正方形');
        if (ok && !gate.on && !hit) {
          hit = true; P.track('aha', { id: 'completing-square', step: 1 }); P.toast(api.ctx.p1 === 0 ? '你猜對了！缺 3×3' : '缺掉的是 3×3');
          st.append(P.ruleBox('把 <b>6x</b> 從正中間切成兩個 <b>3x</b>，缺掉的角落就是 <b>3 × 3 ＝ 9</b>。<br>3 是 6 的<b>一半</b>，補的面積是「一半的平方」。', '補成正方形'));
          api.unlock('缺角是 3×3！');
        }
      }
      var cand = []; for (k = 0; k <= 6; k++) cand.push([OX + X + k, 11]);
      var hd = b.handle({ pos: cand[0], candidates: cand, onMove: function (t) { c = Math.round(t[0] - OX - X); draw(); }, disabled: function () { return gate.on; } });
      api.solve(function () { gate.on = false; hd.moveTo(cand[3]); }); draw();
      st.append(P.hint('試試切在不同的位置：看看「寬」和「高」什麼時候一樣。')); api.lock('先做上面的預測');
    },
    /* 2. 補上缺角：找出剛好填滿的小方塊 */
    function (st, api) {
      var PS = [6, 10, 12], ti = 0, s = 1, host, b, upd, info = h('div', { class: 'pl-q' });
      st.append(info);
      host = stage(st); b = new P.Board(host, { w: 11, h: 11.8 }); upd = figure(b, { ghost: false });
      var pa = P.pill('', 'is-green'), pb = P.pill('', ''), pc = P.pill('', 'is-blue'); st.append(h('div', { class: 'pl-readout' }, pa, pb, pc));
      var sp = P.stepper('補上的小方塊邊長', 0, 7, 1, function (v) { s = v; draw(); });
      st.append(h('div', { class: 'pl-steprow' }, sp.el));
      function txt() { var p = PS[Math.min(ti, PS.length - 1)]; info.innerHTML = '現在是 <b>x² ＋ ' + p + 'x</b>，已經把長條切成一半擺好。調整小方塊的邊長，讓它<b>剛好填滿缺角</b>。<small>（目標 ' + (Math.min(ti, PS.length - 1) + 1) + ' / ' + PS.length + '）</small>'; }
      function draw() {
        var p = PS[Math.min(ti, PS.length - 1)], hf = p / 2; upd(p, hf, s);
        pa.textContent = '補上 ' + s + '×' + s + ' ＝ ' + s * s; var ok = s === hf;
        pb.className = 'pl-pill' + (ok ? ' is-ok' : ''); pb.textContent = ok ? '✓ 剛好補滿' : (s < hf ? '還有空隙' : '超出去了'); pc.textContent = ok ? 'x² ＋ ' + p + 'x ＋ ' + s * s + ' ＝ (x ＋ ' + hf + ')²' : '缺角的邊長是多少？';
        if (ok && ti < PS.length) {
          ti++; if (ti >= PS.length) { P.track('aha', { id: 'completing-square', step: 2 }); st.append(P.ruleBox('x 前面的數字（一次項係數）取<b>一半</b>，再<b>平方</b>，就是要補的數。<br><b>x² ＋ px ＋ (p÷2)² ＝ (x ＋ p÷2)²</b>', '配方的步驟')); api.unlock('補成完全平方！'); } else { P.toast('✓ 補滿了，換下一個'); txt(); }
        }
      }
      api.solve(function () { while (ti < PS.length) { s = PS[ti] / 2; sp.set(s); } }); txt(); draw();
      st.append(P.hint('看缺角是幾格寬、幾格高。注意每次長條的長度都不一樣。')); api.lock('補滿 3 個缺角');
    },
    /* 3. 拋物線：配方看出最低點 */
    function (st, api) {
      var done = false, pq, pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pc = P.pill('', 'is-amber');
      st.append(P.instr('這是 <b>y ＝ x² ＋ 6x ＋ 5</b> 的圖形。拖動點，找出<b>最低的位置</b>。注意下面三個數字怎麼變。'));
      var host = stage(st);
      pq = parab(host, 6, 5, -9, -5, -6, function (x, y) {
        pa.textContent = 'x ＝ ' + mn(x); pb.textContent = '(x ＋ 3)² ＝ ' + (x + 3) * (x + 3); pc.textContent = 'y ＝ ' + (x + 3) * (x + 3) + ' − 4 ＝ ' + mn(y);
        if (x === -3 && !done) { done = true; P.track('aha', { id: 'completing-square', step: 3 }); P.toast('最低點 (−3, −4)'); st.append(P.ruleBox('x² ＋ 6x ＋ 5 ＝ (x² ＋ 6x ＋ 9) − 9 ＋ 5 ＝ <b>(x ＋ 3)² − 4</b>。<br>平方一定 ≥ 0，所以 (x＋3)² 最小是 0，y 最小就是 <b>−4</b>，發生在 <b>x ＝ −3</b>。', '配方看最低點')); api.unlock('找到最低點！'); }
      });
      st.append(h('div', { class: 'pl-readout' }, pa, pb, pc));
      api.solve(function () { pq.go(-3); }); st.append(P.hint('提示：看中間那格 (x ＋ 3)²，它什麼時候最小？')); api.lock('拖到最低點');
    },
    /* 4. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：y ＝ x² ＋ 4x ＋ 1 的最低點 */
        function (b0, done, setSolve) {
          var info = h('div', { class: 'pl-q', html: '拖動點，找出 <b>y ＝ x² ＋ 4x ＋ 1</b> 的<b>最低點</b>，並讀出最小值。' }), host = h('div', { class: 'pl-stage' }), pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), fin = false;
          b0.append(info, host); var pq = parab(host, 4, 1, -8, -5, 1, function (x, y) { pa.textContent = 'x ＝ ' + mn(x); pb.textContent = 'y ＝ ' + mn(y); if (x === -2 && !fin) { fin = true; P.toast('最低點 (−2, −3)：y ＝ (x＋2)² − 3'); P.track('aha', { id: 'completing-square', step: 4 }); done(); } });
          b0.append(h('div', { class: 'pl-readout' }, pa, pb));
          setSolve(function () { pq.go(-2); }); b0.append(P.hint('x² ＋ 4x 要補成完全平方，補多少？再看看哪一項決定最小值。'));
        },
        /* 關 2：y ＝ x² − 6x ＋ 10 的最低點 */
        function (b0, done, setSolve) {
          var info = h('div', { class: 'pl-q', html: '拖動點，找出 <b>y ＝ x² − 6x ＋ 10</b> 的<b>最低點</b>。' }), host = h('div', { class: 'pl-stage' }), pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), fin = false;
          b0.append(info, host); var pq = parab(host, -6, 10, -3, -2, 5, function (x, y) { pa.textContent = 'x ＝ ' + mn(x); pb.textContent = 'y ＝ ' + mn(y); if (x === 3 && !fin) { fin = true; P.toast('最低點 (3, 1)：y ＝ (x−3)² ＋ 1'); done(); } });
          b0.append(h('div', { class: 'pl-readout' }, pa, pb));
          setSolve(function () { pq.go(3); }); b0.append(P.hint('一次項是負的，補成完全平方會變成 (x − □)²。'));
        },
        /* 關 3：解 x² − 4x − 5 ＝ 0 */
        function (b0, done, setSolve) {
          var info = h('div', { class: 'pl-q', html: '<b>x² − 4x − 5 ＝ 0</b> 的解，就是圖形碰到橫軸（y ＝ 0）的位置。拖動點，找出<b>兩個解</b>。' }), host = h('div', { class: 'pl-stage' }), pa = P.pill('', 'is-blue'), pb = P.pill('', 'is-pink'), pk = P.pill('找到 0 / 2', 'is-amber'), seen = {}, n = 0;
          b0.append(info, host); var pq = parab(host, -4, -5, -4, -10, 2, function (x, y) {
            pa.textContent = 'x ＝ ' + mn(x); pb.className = 'pl-pill' + (y === 0 ? ' is-ok' : ' is-pink'); pb.textContent = (y === 0 ? '✓ ' : '') + 'y ＝ ' + mn(y);
            if (y === 0 && !seen[x]) { seen[x] = 1; n++; pk.textContent = '找到 ' + n + ' / 2'; if (n >= 2) { P.toast('配方：(x−2)² ＝ 9，所以 x−2 ＝ ±3'); P.track('transfer_ok', { id: 'completing-square' }); done(); } else P.toast('✓ 找到一個了'); }
          });
          b0.append(h('div', { class: 'pl-readout' }, pa, pb, pk));
          setSolve(function () { pq.go(5); pq.go(-1); }); b0.append(P.hint('把 x² − 4x 補成完全平方後，變成「平方 ＝ 某個數」，開根號會有兩個答案。'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'completing-square', moduleName: '配方法＝補成正方形', askAbout: '國中一元二次方程式與二次函數', aha: 'x² ＋ px 缺的那一角，邊長是 p 的一半，<br>補上它就是完整的正方形 (x ＋ p/2)²。',
        cards: [{ text: '配方：x² ＋ px ＋ (p/2)² ＝ (x ＋ p/2)²；補上去的是一次項係數一半的平方', src: '國三「一元二次方程式的配方法」（國中數學課綱）' }, { text: '二次函數 y ＝ x² ＋ bx ＋ c 配方成 (x ＋ b/2)² ＋ k，頂點就是 (−b/2, k)', src: '國三「二次函數」' }],
        depth: { here: 0.3, cheetah: [{ at: 0.52, label: '配方法解方程式<br>頂點與最值' }, { at: 0.88, label: '判別式<br>配方在高中的推廣' }] },
        teasers: [
          { title: '配方法解一元二次方程式', q: '係數不是 1 時（例如 2x² ＋ 3x − 1 ＝ 0）怎麼配方？公式解怎麼從配方推出來？', where: 'J81A 2507 第 23 堂 CH4 一元二次方程；J81S 2507 第 14–15 堂、2607 第 10–11 堂 CH05', lv: 'L2' },
          { title: '配方法與二次函數的頂點', q: '把 y ＝ ax² ＋ bx ＋ c 配方成 y ＝ a(x − h)² ＋ k，頂點、對稱軸、最大最小值一次看出。', where: 'J91A 2507 第 14 堂 二次函數；J91S 2607 第 2 堂 CH12 二次函數', lv: 'L2' },
          { title: '配方法在因式分解的用處', q: '十字交乘、拆項法之外，第三種因式分解方法就是配方——它對什麼式子也有效？', where: 'J81A 2507 第 19 堂 CH3 因式分解', lv: 'L2' }],
        parent: { pitfall: '最常見的錯誤是補的數<b>忘了取一半再平方</b>（直接補 6 或 3）；也常忘記補了一個數，等號另一邊<b>也要補同一個數</b>（或把它扣掉）。', place: '國三一元二次方程式與二次函數的基礎，高中學二次函數的最大最小值、判別式、圓的方程式都靠它。', ask: ['x² ＋ 8x 缺一個多大的方塊才能補成正方形？', '為什麼 (x ＋ 3)² 最小是 0？所以 x² ＋ 6x ＋ 5 最小是多少？', '不用畫圖，怎麼知道 x² − 4x − 5 ＝ 0 的兩個解？'] },
        classes: ['J81A（2507 第 19 堂 CH3；第 23 堂 CH4）：因式分解中的配方法、一元二次方程', 'J81S（2507 第 14–15 堂；2607 第 10–11 堂）：CH05 一元二次方程式（主題二 配方法）', 'J91A（2507 第 14 堂）：二次函數（配方抓頂點）', 'J91S（2607 第 2 堂）：CH12 二次函數（配方法與二次函數）'],
        next: { href: 'play-multiplication.html', text: '回頭看：乘法公式的圖解' } });
    }];
  new P.Lesson({ id: 'completing-square', title: '配方法＝補成正方形', steps: steps });
})();
