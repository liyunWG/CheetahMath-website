/* 獵豹玩中學｜餘弦定理與畢氏定理
   固定兩邊 a、b，拖動夾角 C：第三邊 c 跟著變。c² 和 a²＋b² 的差剛好是 −2ab·cos C；C ＝ 90° 時差為 0，回到畢氏定理。
   a＝CB（水平）、b＝CA（拖動 A）、c＝AB。需要 play-geo.js。 */
(function () {
  var P = Play, h = P.h, G = PlayGeo, rad = G.rad;
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('-', '−'); }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('-', '−'); }
  function z(x) { return Math.abs(x) < 1e-9 ? 0 : x; }

  var W = 15, HH = 12.4, BY = 4.8;
  /* 三角形畫板（含 a²＋b² 與 c² 的長條比較）。o: {start, alt, onMove(th, d), disabled}。 */
  function figure(host, a, b, o) {
    o = o || {};
    var span = b + Math.max(a, b), k = Math.min(11 / span, 6 / b), rr = b * k, Cx = (W - span * k) / 2 + b * k, C = [Cx, BY], Bp = [Cx + a * k, BY], bs = 13 / ((a + b) * (a + b)), BX0 = 1;
    var bd = new P.Board(host, { w: W, h: HH }), th = o.start || 60, hd;
    var tri = bd.poly([C, Bp, [Cx, BY + 1]], 'pl-poly pl-poly--amber');
    var lA = bd.line(C, Bp, 'pl-line pl-line--blue pl-line--bold'), lB = bd.line(C, C, 'pl-line pl-line--pink pl-line--bold'), lC = bd.line(C, Bp, 'pl-line pl-line--green pl-line--bold');
    var wd = bd.poly([C, C, C], 'pl-poly pl-poly--blue'), tC = bd.text(C, '', 'pl-text pl-text--lg');
    var tAl = bd.text(C, '', 'pl-text pl-text--blue'), tBl = bd.text(C, '', 'pl-text pl-text--pink'), tCl = bd.text(C, '', 'pl-text pl-text--green');
    var vC = bd.text([Cx - 0.5, BY - 0.6], 'C', 'pl-text pl-text--lg'), vB = bd.text([Bp[0] + 0.5, BY - 0.6], 'B', 'pl-text pl-text--lg'), vA = bd.text(C, 'A', 'pl-text pl-text--lg');
    /* 長條比較：上面 a²＋b²，下面 c² */
    var yb1 = 2.0, yb2 = 0.55, bh = 0.8, sa = a * a * bs, sb = b * b * bs;
    function rect(x, y, w, hh, cls) { return bd.poly([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], cls); }
    rect(BX0, yb1, sa, bh, 'pl-poly pl-poly--blue'); rect(BX0 + sa, yb1, sb, bh, 'pl-poly pl-poly--pink');
    bd.text([BX0 + sa / 2, yb1 + bh / 2 - 0.2], 'a²', 'pl-text pl-text--blue'); bd.text([BX0 + sa + sb / 2, yb1 + bh / 2 - 0.2], 'b²', 'pl-text pl-text--pink');
    var barC = rect(BX0, yb2, 1, bh, 'pl-poly pl-poly--green'), tbc = bd.text([BX0 + 0.6, yb2 + bh / 2 - 0.2], 'c²', 'pl-text pl-text--green');
    bd.line([BX0 + sa + sb, yb2 - 0.1], [BX0 + sa + sb, yb1 + bh + 0.1], 'pl-line pl-line--dash pl-line--thin');
    var altEls = null;
    if (o.alt) altEls = { ah: bd.line(C, C, 'pl-line pl-line--amber pl-line--dash'), hb: bd.line(C, C, 'pl-line pl-line--bold', null, { stroke: '#7a4fd6' }), hc: bd.line(C, C, 'pl-line pl-line--dash pl-line--soft'), th: bd.text(C, 'H', 'pl-text pl-text--lg'), rm: bd.poly([C, C, C], 'pl-poly pl-poly--blue') };
    function info(t) {
      var cs = z(Math.cos(t * rad)), sn = Math.sin(t * rad), sum = a * a + b * b, c2 = sum - 2 * a * b * cs;
      return { th: t, cos: cs, sin: sn, sum: sum, c2: c2, c: Math.sqrt(c2), delta: c2 - sum };
    }
    function set(t) {
      th = t; var d = info(t), A = G.polar(C, rr, t), mB = [(C[0] + A[0]) / 2, (C[1] + A[1]) / 2], mC = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2], n = [-Math.sin(t * rad), Math.cos(t * rad)];
      bd.setPoly(tri, [C, Bp, A]); bd.setLine(lB, C, A); bd.setLine(lC, A, Bp);
      var w = G.wedge(C, 0, t, 1.15, t); bd.setPoly(wd, w.pts); var low = t < 30 || t >= 130, lp = low ? [Cx + 1.8, BY - 0.55] : G.polar(C, 2.0, w.bis); bd.setText(tC, [lp[0], lp[1] - (low ? 0 : 0.2)], 'C ＝ ' + t + '°');
      bd.setText(vA, [A[0] + 1.05 * Math.cos(t * rad), A[1] + 1.05 * Math.sin(t * rad) - 0.2]);
      bd.setText(tAl, [Cx + a * k / 2, BY - 1.6], 'a ＝ ' + a); bd.setText(tBl, [mB[0] + 0.85 * n[0], mB[1] + 0.85 * n[1] - 0.2], 'b ＝ ' + b);
      var v = [Bp[0] - A[0], Bp[1] - A[1]], vl = Math.hypot(v[0], v[1]), n2 = [v[1] / vl, -v[0] / vl]; if (n2[0] * (mC[0] - C[0]) + n2[1] * (mC[1] - C[1]) < 0) n2 = [-n2[0], -n2[1]];
      var cp = vl < 3.6 ? [Bp[0] + 0.3, BY - 1.6] : [mC[0] + 0.95 * n2[0], mC[1] + 0.95 * n2[1] - 0.2]; bd.setText(tCl, cp, 'c ＝ ' + f2(d.c));
      var cw = d.c2 * bs; bd.setPoly(barC, [[BX0, yb2], [BX0 + cw, yb2], [BX0 + cw, yb2 + bh], [BX0, yb2 + bh]]); bd.setText(tbc, [BX0 + Math.max(cw / 2, 0.6), yb2 + bh / 2 - 0.2], 'c²');
      if (altEls) {
        var Hh = [C[0] + rr * Math.cos(t * rad), BY]; bd.setLine(altEls.ah, A, Hh); bd.setLine(altEls.hb, Hh, Bp); bd.setLine(altEls.hc, C, Hh);
        bd.setText(altEls.th, [Hh[0], BY - 0.95], (Math.abs(Hh[0] - C[0]) < 0.01 || Math.abs(Hh[0] - Bp[0]) < 1.7) ? '' : 'H');
        var near = Math.abs(Hh[0] - C[0]) < 0.01 || Math.abs(Hh[0] - Bp[0]) < 0.05;
        bd.setPoly(altEls.rm, near ? [Hh, Hh, Hh] : (function () { var s = 0.5, dir = Bp[0] >= Hh[0] ? 1 : -1; return [[Hh[0] + dir * s, BY], [Hh[0] + dir * s, BY + s], [Hh[0], BY + s], Hh]; })());
      }
      return d;
    }
    var cand = []; for (var q = 10; q <= 170; q += 5) cand.push(G.polar(C, rr, q));
    hd = bd.handle({ pos: G.polar(C, rr, th), candidates: cand, disabled: o.disabled, onMove: function (t) { var d = set(Math.round(G.norm(G.dirTo(C, t)))); if (o.onMove) o.onMove(d.th, d); } });
    set(th);
    return { bd: bd, hd: hd, set: set, info: info, C: C, B: Bp, k: k, go: function (t) { hd.moveTo(G.polar(C, rr, t)); }, cur: function () { return th; } };
  }
  function cmp(d) { return Math.abs(d.delta) < 1e-6 ? '✓ c² ＝ a²＋b²' : (d.delta < 0 ? 'c² 比 a²＋b² 小' : 'c² 比 a²＋b² 大'); }

  var steps = [
    /* 1. 預測＋拖動夾角，比較 c² 與 a²＋b² */
    function (st, api) {
      var gate = { on: true }, hit = false, a = 3, b = 4, p1 = P.pill('', 'is-green'), p2 = P.pill('', 'is-blue'), p3 = P.pill('', '');
      P.choice(st, api, { id: 'cl-p1', predict: true, label: '先猜猜看', prompt: '三角形的兩邊固定：<b>a ＝ 3、b ＝ 4</b>。把它們中間的夾角 C <b>慢慢張大</b>，第三邊 c 會怎麼變？', row: true, options: [{ t: '一直變長' }, { t: '一直變短' }, { t: '都不變' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動紅點，改變夾角 C'); } });
      st.append(P.instr('拖動頂點 <b>A</b> 改變夾角 C。下面的長條：<b>上面是 a² ＋ b²</b>，<b>下面是 c²</b>，比比看誰長。'));
      var host = stage(st), f = figure(host, a, b, {
        start: 40, disabled: function () { return gate.on; }, onMove: function (th, d) {
          p1.textContent = 'c² ＝ ' + f2(d.c2); p3.className = 'pl-pill' + (Math.abs(d.delta) < 1e-6 ? ' is-ok' : ''); p3.textContent = cmp(d);
          if (Math.abs(d.delta) < 1e-6 && !gate.on && !hit) { hit = true; P.track('aha', { id: 'cosine-law', step: 1 }); P.toast(api.ctx.p1 === 0 ? '你猜對了：張越大，c 越長' : 'C 張越大，c 越長'); st.append(P.ruleBox('夾角 <b>C ＝ 90°</b> 時，c² 剛好等於 a² ＋ b²，這就是<b>畢氏定理</b>。<br>夾角比 90° 小，c² 比較小；比 90° 大，c² 比較大。', '畢氏定理只是特例')); api.unlock('90° 時是畢氏定理！'); }
        }
      });
      p2.textContent = 'a² ＋ b² ＝ ' + (a * a + b * b); p1.textContent = 'c² ＝ ' + f2(f.info(40).c2); p3.textContent = cmp(f.info(40));
      st.append(h('div', { class: 'pl-readout' }, p1, p2, p3));
      api.solve(function () { gate.on = false; f.go(90); }); st.append(P.hint('找一找：c² 和 a² ＋ b² 什麼時候剛好一樣長？')); api.lock('先做上面的預測');
    },
    /* 2. 差剛好是 −2ab cos C */
    function (st, api) {
      var a = 3, b = 4, T = [{ t: '讓 c² 比 a² ＋ b² <b>少 12</b>', d: -12, th: 60 }, { t: '讓 c² 比 a² ＋ b² <b>多 12</b>', d: 12, th: 120 }, { t: '讓 c² <b>剛好等於</b> a² ＋ b²', d: 0, th: 90 }], ti = 0, info = h('div', { class: 'pl-q' });
      var p1 = P.pill('', 'is-green'), p2 = P.pill('', 'is-blue'), p3 = P.pill('', 'is-amber');
      st.append(info); var host = stage(st), f = figure(host, a, b, { start: 40, onMove: function (th, d) { draw(d); } });
      st.append(h('div', { class: 'pl-readout' }, p1, p2, p3));
      function txt() { info.innerHTML = '定義 <b>差 Δ ＝ c² − (a² ＋ b²)</b>。拖動 A，' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
      function draw(d) {
        p1.textContent = 'Δ ＝ ' + f1(d.delta); p2.textContent = 'cos C ＝ ' + f2(d.cos); p3.textContent = Math.abs(d.cos) < 1e-9 ? 'Δ ÷ cos C ＝ （cos C 是 0）' : 'Δ ÷ cos C ＝ ' + f1(d.delta / d.cos);
        if (ti < T.length && Math.abs(d.delta - T[ti].d) < 1e-6) {
          ti++; if (ti >= T.length) { P.track('aha', { id: 'cosine-law', step: 2 }); P.toast('Δ ÷ cos C 永遠是 −24'); st.append(P.ruleBox('Δ ÷ cos C 一直都是 <b>−24</b>，而 24 ＝ 2 × 3 × 4 ＝ <b>2ab</b>。<br>所以 Δ ＝ −2ab·cos C，也就是<br><b>c² ＝ a² ＋ b² − 2ab·cos C</b>（餘弦定理）。', '餘弦定理')); api.unlock('發現餘弦定理！'); } else { P.toast('✓ 找到了，下一個'); txt(); }
        }
      }
      draw(f.info(40)); txt(); api.solve(function () { while (ti < T.length) f.go(T[ti].th); });
      st.append(P.hint('觀察 Δ ÷ cos C 這個數字，它是不是一直一樣？')); api.lock('完成 3 個目標');
    },
    /* 3. 為什麼是 −2ab cos C：作高切成兩個直角三角形 */
    function (st, api) {
      var a = 3, b = 4, seen = { acute: false, right: false, obtuse: false }, chips = {}, p1 = P.pill('', 'is-pink'), p2 = P.pill('', 'is-blue'), p3 = P.pill('', 'is-green'), ro = h('div', { class: 'pl-readout' }, p1, p2, p3), kinds = h('div', { class: 'pl-readout' }), fin = false;
      st.append(P.instr('從 A 向底邊作高 <b>AH</b>，把三角形切出一個<b>直角三角形</b> AHB（紫色是 HB）。用畢氏定理算 c²，看看和餘弦定理合不合。<b>銳角、直角、鈍角</b>各拖一次。'));
      [['acute', '銳角 C'], ['right', '直角 C'], ['obtuse', '鈍角 C']].forEach(function (q) { chips[q[0]] = P.pill(q[1], ''); kinds.append(chips[q[0]]); });
      var host = stage(st), f = figure(host, a, b, { start: 40, alt: true, onMove: function (th, d) { draw(d); } });
      st.append(ro, kinds);
      function draw(d) {
        var hb2 = Math.pow(a - b * d.cos, 2), ah2 = Math.pow(b * d.sin, 2);
        p1.textContent = 'HB² ＝ (a − b·cos C)² ＝ ' + f2(hb2); p2.textContent = 'AH² ＝ (b·sin C)² ＝ ' + f2(ah2); p3.textContent = 'HB² ＋ AH² ＝ ' + f2(hb2 + ah2) + ' ＝ c² ✓';
        var kd = d.th < 90 ? 'acute' : d.th === 90 ? 'right' : 'obtuse'; if (!seen[kd]) { seen[kd] = true; chips[kd].className = 'pl-pill is-ok'; chips[kd].textContent = '✓ ' + chips[kd].textContent; }
        if (seen.acute && seen.right && seen.obtuse && !fin) { fin = true; P.track('aha', { id: 'cosine-law', step: 3 }); st.append(P.ruleBox('c² ＝ (a − b·cos C)² ＋ (b·sin C)² ＝ a² − 2ab·cos C ＋ b²(cos²C ＋ sin²C) ＝ <b>a² ＋ b² − 2ab·cos C</b>。<br>鈍角時垂足 H 跑到 C 的左邊，(a − b·cos C) 變得比 a 還長——所以 c 才會比較長。', '用畢氏定理證明')); api.unlock('證明完成！'); }
      }
      draw(f.info(40)); api.solve(function () { f.go(60); f.go(90); f.go(130); });
      st.append(P.hint('數字會跟著畫面變：HB² ＋ AH² 永遠和 c² 一樣。')); api.lock('銳角、直角、鈍角各拖一次');
    },
    /* 4. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      function level(a, b, c, ans, hint, msg) {
        return function (b0, done, setSolve) {
          var info = h('div', { class: 'pl-q', html: '兩邊固定：<b>a ＝ ' + a + '、b ＝ ' + b + '</b>。拖動 A，讓第三邊剛好是 <b>c ＝ ' + c + '</b>。' }), host = h('div', { class: 'pl-stage' }), p1 = P.pill('', 'is-green'), p2 = P.pill('', ''), fin = false;
          b0.append(info, host);
          var f = figure(host, a, b, { start: 30, onMove: function (th, d) { draw(d); } });
          b0.append(h('div', { class: 'pl-readout' }, p1, p2));
          function draw(d) {
            var ok = Math.abs(d.c - c) < 1e-6; p1.textContent = 'c ＝ ' + f2(d.c) + '　（c² ＝ ' + f2(d.c2) + '）'; p2.className = 'pl-pill' + (ok ? ' is-ok' : ''); p2.textContent = ok ? '✓ 夾角 C ＝ ' + d.th + '°' : '夾角 C ＝ ' + d.th + '°';
            if (ok && !fin) { fin = true; P.toast(msg); done(); }
          }
          draw(f.info(30)); setSolve(function () { f.go(ans); }); b0.append(P.hint(hint));
        };
      }
      var tasks = [
        level(5, 8, 7, 60, '想一想：c² ＝ 49 時，−2ab·cos C 要等於多少？', '60° 的 cos 是 1/2：c² ＝ 25 ＋ 64 − 40 ＝ 49'),
        level(7, 8, 13, 120, 'c 比 a、b 都長很多，夾角應該比 90° 大還是小？', '120° 的 cos 是 −1/2：c² ＝ 49 ＋ 64 ＋ 56 ＝ 169'),
        level(6, 8, 10, 90, '6、8、10 讓你想到什麼？cos C 要是多少？', '6² ＋ 8² ＝ 10²：90° 就是畢氏定理')];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { P.track('transfer_ok', { id: 'cosine-law' }); api.unlock('全部完成！'); } });
    },
    /* 5. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'cosine-law', moduleName: '餘弦定理與畢氏定理', askAbout: '高中三角函數與餘弦定理', aha: '固定兩邊、改變夾角，第三邊跟著變：<br>c² ＝ a² ＋ b² − 2ab·cos C，C ＝ 90° 就是畢氏定理。',
        cards: [{ text: '餘弦定理：c² ＝ a² ＋ b² − 2ab·cos C；夾角為 90° 時 cos C ＝ 0，回到畢氏定理', src: '高一「正餘弦定理」（高中數學課綱）' }, { text: '知道兩邊和夾角，可以求第三邊；知道三邊，也可以反過來求角度', src: '高一「解三角形」' }],
        depth: { here: 0.45, cheetah: [{ at: 0.66, label: '正弦定理與外接圓<br>三角形求解' }, { at: 0.92, label: '向量內積<br>餘弦定理的另一面' }] },
        teasers: [
          { title: '用三邊求角度', q: '只知道三條邊長 a、b、c，怎麼用餘弦定理反過來求出每個角？可以判斷是銳角、直角還是鈍角三角形嗎？', where: 'S102 2601 第 20–21 堂：CH4 三角函數（餘弦定理例題 47–49）', lv: 'L3' },
          { title: '正弦定理與外接圓', q: '另一條定理：a／sin A ＝ b／sin B ＝ c／sin C ＝ 2R，和餘弦定理合起來就能解任何三角形。', where: 'S102 2601 第 20 堂：CH4 三角函數（正弦定理與餘弦定理）', lv: 'L3' },
          { title: '畢氏定理與勾股弦數', q: '90° 的特例：3-4-5、5-12-13、8-15-17 怎麼一次找出來？不同證法又是什麼？', where: 'PK4A 2507 第 19 堂「勾股定理」', lv: 'L2' }],
        parent: { pitfall: '孩子常把公式裡的 <b>−2ab·cos C</b> 的負號和 cos C 的正負搞混：夾角<b>大於 90°</b> 時 cos C 是負的，所以 c² 反而<b>更大</b>；另外，C 一定是 <b>a、b 的夾角</b>（c 的對角），不是別的角。', place: '高一「正餘弦定理」的核心，之後的向量內積、三角形面積與最大最小值都會用到。', ask: ['夾角是 90° 時，餘弦定理變成什麼定理？', '夾角越大，第三邊越長還是越短？為什麼？', 'a ＝ 5、b ＝ 8、夾角 60°，第三邊的平方是多少？'] },
        classes: ['S102（2601 第 20–21 堂）：CH4 三角函數（正弦定理與餘弦定理）', 'PK4A（2507 第 19 堂）：勾股定理', 'J81A（2507 第 13–18 堂；2607 第 10–15 堂）：CH2 勾股定理'],
        next: { href: 'play-pythagoras.html', text: '回頭看：畢氏定理' } });
    }];
  new P.Lesson({ id: 'cosine-law', title: '餘弦定理與畢氏定理', steps: steps });
})();
