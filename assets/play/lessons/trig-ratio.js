/* 獵豹玩中學｜三角比：相似的比值不變
   拉大三角形比值不變 → 改變角度比值跟著變（sin、cos、tan）→ 3 個操作關卡（找角度、格點相似三角形、量樹高）。 */
(function () {
  var P = Play, h = P.h, G = PlayGeo, rad = G.rad, O = [1, 1];
  function stage(st) { var wrap = h('div', { class: 'pl-stage' }); st.append(wrap); return wrap; }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function pillRow(host, defs) { var row = h('div', { class: 'pl-readout' }), out = []; defs.forEach(function (c) { var p = P.pill('', c); out.push(p); row.append(p); }); host.append(row); return out; }

  /* 圓弧上的直角三角形：斜邊從 O 到圓弧上的點，回傳 {board, draw(deg), cands} */
  function trigBoard(host, cls) {
    var R = 8, board = new P.Board(host, { w: 12, h: 10, cls: cls }), g = h('g'); board.gMid.append(g);
    board.gMid.append(h('path', { d: 'M ' + (O[0] + R) + ' ' + board.Y(O[1]) + ' A ' + R + ' ' + R + ' 0 0 0 ' + O[0] + ' ' + board.Y(O[1] + R), class: 'pl-circle', style: 'stroke-dasharray:6 5' }));
    board.line(O, [O[0] + R + 1, O[1]], 'pl-line pl-line--soft'); board.line(O, [O[0], O[1] + R + 1], 'pl-line pl-line--soft');
    var cands = []; for (var d = 5; d <= 85; d += 5) cands.push(G.polar(O, R, d));
    function draw(deg, pills) {
      g.innerHTML = ''; var Pp = G.polar(O, R, deg), A = [Pp[0], O[1]], w = G.wedge(O, 0, deg, 1.6, deg), s = Math.sin(deg * rad), c = Math.cos(deg * rad);
      board.poly([O, A, Pp], 'pl-poly pl-poly--amber', g); board.rightMark(A, [-1, 0], [0, 1], 0.5, g); board.poly(w.pts, 'pl-poly pl-poly--blue', g);
      board.line(A, Pp, 'pl-line pl-line--pink pl-line--bold', g); board.line(O, A, 'pl-line pl-line--blue pl-line--bold', g); board.line(O, Pp, 'pl-line pl-line--green pl-line--bold', g);
      var tp = G.polar(O, 2.3, w.bis); board.text([tp[0], tp[1] - 0.2], deg + '°', 'pl-text pl-text--blue pl-text--lg', g);
      board.text([A[0] + 0.7, (O[1] + Pp[1]) / 2], '對邊', 'pl-text pl-text--pink pl-text--sm', g); board.text([(O[0] + A[0]) / 2, O[1] - 0.55], '鄰邊', 'pl-text pl-text--blue pl-text--sm', g);
      if (pills) { pills[0].textContent = 'θ ＝ ' + deg + '°'; pills[1].textContent = 'sin θ ＝ ' + f2(s); pills[2].textContent = 'cos θ ＝ ' + f2(c); pills[3].textContent = 'tan θ ＝ ' + f2(s / c); }
    }
    return { board: board, draw: draw, cands: cands, R: R };
  }

  var steps = [
    /* 1. 拉大三角形，比值不變 */
    function (st, api) {
      var th = Math.atan2(4, 3) / rad, c = Math.cos(th * rad), sn = Math.sin(th * rad), gate = { on: true }, seen = {}, n = 0, done = false;
      P.choice(st, api, { id: 'tr-p1', predict: true, label: '先猜猜看', prompt: '直角三角形的<b>角度固定</b>，把它<b>拉大</b>。「對邊 ÷ 斜邊」的值會…？', row: true, options: [{ t: '變大' }, { t: '變小' }, { t: '不變' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('拖動綠點，把三角形拉大縮小'); } });
      var host = stage(st), board = new P.Board(host, { w: 12, h: 10 }), g = h('g'); board.gMid.append(g);
      var r1 = pillRow(st, ['is-pink', 'is-blue', 'is-green']), r2 = pillRow(st, ['is-amber', 'is-amber', 'is-amber']);
      var cand = []; for (var L = 2; L <= 9.5; L += 0.5) cand.push([O[0] + L * c, O[1] + L * sn]);
      function draw(B) {
        g.innerHTML = ''; var A = [B[0], O[1]], a = B[1] - O[1], b = B[0] - O[0], hy = Math.hypot(a, b), w = G.wedge(O, 0, th, 1.4, th);
        board.poly([O, A, B], 'pl-poly pl-poly--amber', g); board.rightMark(A, [-1, 0], [0, 1], 0.5, g); board.poly(w.pts, 'pl-poly pl-poly--blue', g);
        board.text([A[0] + 0.8, (O[1] + B[1]) / 2], '對邊', 'pl-text pl-text--pink pl-text--sm', g); board.text([(O[0] + A[0]) / 2, O[1] - 0.55], '鄰邊', 'pl-text pl-text--blue pl-text--sm', g); board.text([(O[0] + B[0]) / 2 - 0.9, (O[1] + B[1]) / 2 + 0.5], '斜邊', 'pl-text pl-text--green pl-text--sm', g);
        r1[0].textContent = '對邊 ＝ ' + f2(a); r1[1].textContent = '鄰邊 ＝ ' + f2(b); r1[2].textContent = '斜邊 ＝ ' + f2(hy);
        r2[0].textContent = '對邊 ÷ 斜邊 ＝ ' + f2(a / hy); r2[1].textContent = '鄰邊 ÷ 斜邊 ＝ ' + f2(b / hy); r2[2].textContent = '對邊 ÷ 鄰邊 ＝ ' + f2(a / b); return Math.round(hy * 2);
      }
      var hd = board.handle({ pos: cand[4], candidates: cand, disabled: function () { return gate.on; }, onMove: function (t) { var k = draw(t); if (!seen[k]) { seen[k] = 1; n++; } if (n >= 4 && !done) { done = true; P.track('aha', { id: 'trig-ratio', step: 1 }); P.toast(api.ctx.p1 === 2 ? '你猜對了！' : '比值真的沒變'); st.append(P.ruleBox('三角形怎麼拉大縮小，只要<b>角度一樣</b>（相似三角形），三條邊的<b>比值就不變</b>：對邊 ÷ 斜邊 ＝ 0.80、鄰邊 ÷ 斜邊 ＝ 0.60。<br>這些固定的比值，就叫<b>三角比</b>。', '相似的比值不變')); api.unlock('比值不變！'); } } });
      api.solve(function () { gate.on = false; [cand[0], cand[6], cand[10], cand[14]].forEach(hd.moveTo); });
      draw(cand[4]); st.append(P.hint('小提示：三角形變大時，三條邊的長度都會變，但「比」會怎麼樣？至少拉 4 種大小。')); api.lock('先做上面的預測');
    },
    /* 2. 改變角度，比值跟著變 */
    function (st, api) {
      st.append(P.instr('這次<b>斜邊長度固定</b>，拖動綠點改變<b>角度 θ</b>。sin、cos、tan 會怎麼變？'));
      var host = stage(st), T = trigBoard(host), pills = pillRow(st, ['is-blue', 'is-pink', 'is-green', 'is-amber']), seen = {}, n = 0, done = false;
      var hd = T.board.handle({ pos: T.cands[5], candidates: T.cands, onMove: function (t) { var d = Math.round(G.dirTo(O, t)); T.draw(d, pills); if (!seen[d]) { seen[d] = 1; n++; } if (n >= 6 && !done) { done = true; P.track('aha', { id: 'trig-ratio', step: 2 }); st.append(P.ruleBox('<b>角度一變，三角比就跟著變</b>：θ 越大，sin θ 越大、cos θ 越小、tan θ 越大。<br>每個角度都有自己固定的 sin θ ＝ 對邊 ÷ 斜邊、cos θ ＝ 鄰邊 ÷ 斜邊、tan θ ＝ 對邊 ÷ 鄰邊。', '三角比')); api.unlock('角度決定三角比！'); } } }); T.draw(25, pills);
      api.solve(function () { [10, 30, 45, 60, 75, 85].forEach(function (d) { hd.moveTo(G.polar(O, T.R, d)); }); });
      st.append(P.hint('至少看 6 個不同的角度。注意 θ 接近 90° 時 tan θ 會怎樣？')); api.lock('拖動綠點，看 6 個角度');
    },
    /* 3. 三個操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        /* 關 1：找出指定三角比的角度 */
        function (b0, done, setSolve) {
          var T = [{ t: '<b>sin θ ＝ 0.50</b>', d: 30 }, { t: '<b>tan θ ＝ 1.00</b>', d: 45 }, { t: '<b>cos θ ＝ 0.50</b>', d: 60 }], ti = 0, info = h('div', { class: 'pl-q' }); b0.append(info);
          var host = h('div', { class: 'pl-stage pl-stage--sm' }); b0.append(host); var B = trigBoard(host, 'pl-svg--sm'), pills = pillRow(b0, ['is-blue', 'is-pink', 'is-green', 'is-amber']);
          function txt() { info.innerHTML = '拖動綠點，找出讓 ' + T[Math.min(ti, 2)].t + ' 的角度。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          var hd = B.board.handle({ pos: B.cands[3], candidates: B.cands, onMove: function (t) { var d = Math.round(G.dirTo(O, t)); B.draw(d, pills); if (ti < 3 && d === T[ti].d) { ti++; if (ti >= 3) { P.toast('這三個是最常用的特殊角：30°、45°、60°'); P.track('aha', { id: 'trig-ratio', step: 3 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } } } });
          B.draw(15, pills); setSolve(function () { while (ti < 3) hd.moveTo(G.polar(O, B.R, T[ti].d)); }); txt(); b0.append(P.hint('三角比的值會「剛好」出現在特殊角上。'));
        },
        /* 關 2：格線上找 sin ＝ 3/5 的三角形 */
        function (b0, done, setSolve) {
          var host = h('div', { class: 'pl-stage pl-stage--sm' }), seen = {}, n = 0, g = h('g');
          b0.append(h('div', { class: 'pl-q', html: '拖動頂點 B，找出 <b>sin θ ＝ 3/5（0.60）</b>的<b>格點直角三角形</b>（找 <b>2 種不同大小</b>）。' }), host);
          var bd = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); bd.gMid.append(g); var pr = pillRow(b0, ['is-pink', 'is-blue', 'is-green', 'is-amber']), pn = P.pill('找到 0 / 2', 'is-amber'); pr[3].parentNode.append(pn);
          var cand = []; for (var x = 2; x <= 11; x++) for (var y = 2; y <= 9; y++) cand.push([x, y]);
          function draw(B) {
            g.innerHTML = ''; var A = [B[0], O[1]], a = B[1] - O[1], b = B[0] - O[0], hy = Math.hypot(a, b), ok = Math.abs(a / hy - 0.6) < 1e-9;
            bd.poly([O, A, B], 'pl-poly pl-poly--amber', g); bd.rightMark(A, [-1, 0], [0, 1], 0.5, g); var w = G.wedge(O, 0, Math.atan2(a, b) / rad, 1.3, Math.atan2(a, b) / rad); bd.poly(w.pts, 'pl-poly pl-poly--blue', g);
            pr[0].textContent = '對邊 ＝ ' + a; pr[1].textContent = '鄰邊 ＝ ' + b; pr[2].textContent = '斜邊 ＝ ' + f2(hy); pr[3].className = 'pl-pill ' + (ok ? 'is-ok' : 'is-amber'); pr[3].textContent = ok ? '✓ sin θ ＝ ' + a + '/' + f2(hy) + ' ＝ 0.60' : 'sin θ ＝ ' + f2(a / hy);
            if (ok) { var key = a + ',' + b; if (!seen[key]) { seen[key] = 1; n++; pn.textContent = '找到 ' + Math.min(n, 2) + ' / 2'; if (n >= 2) { P.toast('大小不同，角度和比值都一樣：它們是相似三角形'); P.track('aha', { id: 'trig-ratio', step: 4 }); done(); } } }
          }
          var hd = bd.handle({ pos: [7, 6], candidates: cand, onMove: draw }); draw([7, 6]); setSolve(function () { [[5, 4], [9, 7]].forEach(hd.moveTo); }); b0.append(P.hint('對邊 ÷ 斜邊 ＝ 0.6。想想看有名的 3-4-5 直角三角形，還有它的 2 倍。'));
        },
        /* 關 3：用仰角量樹高 */
        function (b0, done, setSolve) {
          var T = [{ t: '<b>tan θ ＝ 1</b>（仰角 45°）', k: 1 }, { t: '<b>tan θ ＝ 2</b>', k: 2 }, { t: '<b>tan θ ＝ 0.5</b>', k: 0.5 }], ti = 0, info = h('div', { class: 'pl-q' }), host = h('div', { class: 'pl-stage pl-stage--sm' }), g = h('g'); b0.append(info, host);
          var bd = new P.Board(host, { w: 12, h: 10, cls: 'pl-svg--sm' }); bd.gMid.append(g); var TX = 11, TH = 4; bd.line([0, 1], [12, 1], 'pl-line'); bd.line([TX, 1], [TX, 1 + TH], 'pl-line pl-line--green pl-line--bold'); bd.dot([TX, 1 + TH], 'pl-dot pl-dot--green', null, 0.2); bd.text([TX - 0.8, 1 + TH + 0.5], '樹高 ＝ 4', 'pl-text pl-text--green pl-text--sm');
          var pr = pillRow(b0, ['is-blue', 'is-amber', 'is-pink']);
          function txt() { info.innerHTML = '樹高 4 公尺。拖動你站的位置，讓「<b>樹高 ÷ 距離</b>」的 ' + T[Math.min(ti, 2)].t + '。<small>（目標 ' + (Math.min(ti, 2) + 1) + ' / 3）</small>'; }
          function draw(p) {
            g.innerHTML = ''; var d = TX - p[0], k = TH / d, ang = Math.atan2(TH, d) / rad, top = [TX, 1 + TH], w = G.wedge(p, 0, ang, 1.2, ang);
            bd.line(p, top, 'pl-line pl-line--pink pl-line--dash', g); bd.line(p, [TX, 1], 'pl-line pl-line--blue pl-line--bold', g); bd.rightMark([TX, 1], [-1, 0], [0, 1], 0.5, g); bd.poly(w.pts, 'pl-poly pl-poly--blue', g);
            pr[0].textContent = '距離 ＝ ' + d; pr[1].textContent = 'tan θ ＝ 4 ÷ ' + d + ' ＝ ' + f2(k); pr[2].textContent = '仰角 θ ≈ ' + (Math.round(ang * 10) / 10) + '°'; return k;
          }
          var cand = []; for (var x = 1; x <= 9; x++) cand.push([x, 1]);
          var hd = bd.handle({ pos: [5, 1], candidates: cand, onMove: function (t) { var k = draw(t); if (ti < 3 && Math.abs(k - T[ti].k) < 1e-9) { ti++; if (ti >= 3) { P.toast('tan θ ＝ 對邊 ÷ 鄰邊：知道角度，就能算出高度'); P.track('aha', { id: 'trig-ratio', step: 5 }); txt(); done(); } else { P.toast('✓ 找到了，下一個'); txt(); } } } });
          draw([5, 1]); setSolve(function () { while (ti < 3) hd.moveTo([TX - TH / T[ti].k, 1]); }); txt(); b0.append(P.hint('樹高是 4。距離和樹高一樣時，仰角是多少？距離只有一半時呢？'));
        }];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-ratio' }); } });
    },
    /* 4. 完成 */
    function (st, api) {
      P.complete(st, {
        id: 'trig-ratio', moduleName: '三角比：相似的比值不變', askAbout: '國三三角比與相似形', aha: '角度一樣的直角三角形，<br>邊長的比值永遠一樣——這就是三角比。',
        cards: [{ text: '相似三角形對應邊的比相等；同一個角度的 sin、cos、tan 是固定的值', src: '國三「相似形」與「三角比」（國中數學課綱）' }, { text: 'sin θ ＝ 對邊 ÷ 斜邊、cos θ ＝ 鄰邊 ÷ 斜邊、tan θ ＝ 對邊 ÷ 鄰邊', src: '國三「三角比」' }],
        depth: { here: 0.2, cheetah: [{ at: 0.45, label: '特殊角<br>測量應用' }, { at: 0.88, label: '廣義角<br>正餘弦定理' }] },
        teasers: [
          { title: '相似形與面積比', q: '為什麼角度一樣就相似？邊長放大 2 倍，面積會放大幾倍？', where: 'J82S 2601 第 8–13 堂 CH9 相似形；J82A 2601 第 23–28 堂 CH1 相似形', lv: 'L2' },
          { title: '三角比的應用', q: '用 sin、cos、tan 解測量、斜坡與面積問題，特殊角怎麼一眼看出？', where: 'J91A 2607 第 1–3 堂：三角比（另有習題課）', lv: 'L2' },
          { title: '廣義角與三角函數', q: '角度超過 90°、甚至是負的，sin、cos 還有意義嗎？單位圓怎麼看？', where: 'S102 2601 第 18–23 堂：CH4 三角函數', lv: 'L3' },
          { title: '餘弦定理', q: '三角形不是直角時，第三邊怎麼算？c² ＝ a² ＋ b² − 2ab·cos C', where: 'S102 2601 第 20–21 堂：CH4 三角函數', lv: 'L3' }],
        parent: { pitfall: '孩子常背「sin ＝ 對邊 ÷ 斜邊」卻不知道<b>為什麼比值是固定的</b>——因為是相似三角形；也常搞混對邊、鄰邊是<b>相對於哪個角</b>。', place: '國三的重點，是高中三角函數、測量與向量的起點。', ask: ['三角形拉大了，為什麼對邊 ÷ 斜邊沒有變？', '知道 30° 角的 sin 是 0.5，斜邊 10 的話對邊是多少？', '站在離大樓 20 公尺處，仰角 45°，大樓大約多高？'] },
        classes: ['J91A（2607 第 1–3 堂）：三角比', 'J82S（2601 第 8–13 堂）：CH9 相似形', 'J82A（2601 第 23–28 堂）：CH1 相似形', 'S102（2601 第 18–23 堂）：CH4 三角函數'], next: { href: 'play-radian.html', text: '下一個：弧度' } });
    }];
  new P.Lesson({ id: 'trig-ratio', title: '三角比：相似的比值不變', steps: steps });
})();
