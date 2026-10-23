/* 獵豹玩中學｜立體圖形的基本性質：點線面、歐拉公式、為什麼只有 5 種正多面體 */
(function () {
  var P = Play, h = P.h, V3 = PS.v;
  function f1(n) { return String(Math.round(n * 10) / 10); }
  function mkCube(st) { var S = PS.solid('cube'), sc = PS.scene(st, { fitR: 1.05 }); PS.addSolid(sc, S, { alpha: 0.35 }); return { S: S, sc: sc }; }

  /* 在一個頂點周圍拼 n 個正 m 邊形的平面圖（SVG 字串元素） */
  function fanSvg(m, n) {
    var svg = h('svg', { viewBox: '0 0 300 190', class: 'ps-fan', width: '100%' }), cx = 150, cy = 96, L = m === 6 ? 46 : 52, alpha = (m - 2) * Math.PI / m, ext = 2 * Math.PI / m, cols = ['#2f6fdc', '#d6336c', '#1f9d55', '#d29b1f', '#7a4fd6', '#e8590c'];
    for (var k = 0; k < n; k++) {
      var d = -Math.PI / 2 + k * alpha, x = cx, y = cy, pts = [[x, y]];
      for (var i = 0; i < m - 1; i++) { x += L * Math.cos(d); y += L * Math.sin(d); pts.push([x, y]); d += ext; }
      svg.append(h('polygon', { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: cols[k % 6], 'fill-opacity': 0.34, stroke: '#122548', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    }
    var total = n * alpha, gap = 2 * Math.PI - total;
    if (gap > 0.02) { var a0 = -Math.PI / 2 + total, a1 = -Math.PI / 2 + 2 * Math.PI; svg.append(h('path', { d: 'M ' + cx + ' ' + cy + ' L ' + (cx + 34 * Math.cos(a0)).toFixed(1) + ' ' + (cy + 34 * Math.sin(a0)).toFixed(1) + ' A 34 34 0 ' + (gap > Math.PI ? 1 : 0) + ' 1 ' + (cx + 34 * Math.cos(a1)).toFixed(1) + ' ' + (cy + 34 * Math.sin(a1)).toFixed(1) + ' Z', fill: 'rgba(255,255,255,.9)', stroke: '#d6336c', 'stroke-width': 2, 'stroke-dasharray': '5 4' })); var t = h('text', { x: cx + 12 * Math.cos((a0 + a1) / 2), y: cy + 12 * Math.sin((a0 + a1) / 2) + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#d6336c' }); t.textContent = '缺口'; svg.append(t); }
    svg.append(h('circle', { cx: cx, cy: cy, r: 5, fill: '#122548' }));
    return { svg: svg, sum: Math.round(total * 180 / Math.PI), alpha: Math.round(alpha * 180 / Math.PI) };
  }

  var steps = [
    /* 1 數點線面 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '點、線、面'), P.instr('拖動轉一轉，選一種再<b>點一點</b>，把正方體的頂點、稜、面都數一遍。'));
      var o = mkCube(st), sc = o.sc, S = o.S, mode = 'v', got = { v: {}, e: {}, f: {} }, need = { v: 8, e: 12, f: 6 };
      var pv = P.pill('', 'is-blue'), pe = P.pill('', 'is-pink'), pf = P.pill('', 'is-green'), ro = h('div', { class: 'pl-readout' }, pv, pe, pf);
      function cnt(k) { return Object.keys(got[k]).length; }
      function refresh() {
        S.V.forEach(function (p, i) { var d = sc.dots[i]; d.color = got.v[i] ? '#1f9d55' : '#122548'; d.r = got.v[i] ? 8 : 5; d.label = got.v[i] ? String(got.v[i]) : ''; d.labelColor = '#1f9d55'; d.ring = !!got.v[i]; });
        S.E.forEach(function (e, i) { var l = sc.lines[i]; l.color = got.e[i] ? '#d6336c' : '#122548'; l.w = got.e[i] ? 5 : 2.2; });
        sc.texts = []; S.E.forEach(function (e, i) { if (got.e[i]) sc.texts.push({ p: V3.mid(S.V[e[0]], S.V[e[1]]), t: String(got.e[i]), color: '#fff', bg: '#d6336c', size: 12 }); });
        sc.faces.forEach(function (f, i) { var g = got.f[i]; f.fill = g ? '#1f9d55' : ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'][i % 6]; f.alpha = g ? 0.55 : 0.35; f.label = g ? String(g) : ''; f.labelColor = '#fff'; f.labelSize = 20; });
        pv.textContent = '頂點 ' + cnt('v') + ' / 8'; pe.textContent = '稜 ' + cnt('e') + ' / 12'; pf.textContent = '面 ' + cnt('f') + ' / 6';
        sc.invalidate();
        if (cnt('v') === 8 && cnt('e') === 12 && cnt('f') === 6 && !st.querySelector('.pl-rule')) {
          P.track('aha', { id: 'solid-basic', step: 1 });
          st.append(P.ruleBox('立體圖形由三種東西組成：<b>面</b>（平的）、<b>稜</b>（兩個面相交的線）、<b>頂點</b>（稜相交的點）。<br>正方體：<b>8 個頂點、12 條稜、6 個面</b>。', '名稱')); api.unlock('都數完了！');
        }
      }
      sc.onTap = function (pos, face) {
        if (mode === 'v') { var i = PS.nearestPoint(sc, pos, S.V, 26); if (i >= 0 && !got.v[i]) got.v[i] = cnt('v') + 1; }
        else if (mode === 'e') { var j = PS.nearestSeg(sc, pos, S.E.map(function (e) { return [S.V[e[0]], S.V[e[1]]]; }), 16); if (j >= 0 && !got.e[j]) got.e[j] = cnt('e') + 1; }
        else if (face && face.id && !got.f[+face.id.slice(1)]) got.f[+face.id.slice(1)] = cnt('f') + 1;
        refresh();
      };
      var seg = PS.seg(st, [{ k: 'v', t: '● 頂點' }, { k: 'e', t: '╱ 稜' }, { k: 'f', t: '▱ 面' }], function (k) { mode = k; });
      api.solve(function () { S.V.forEach(function (p, i) { if (!got.v[i]) got.v[i] = cnt('v') + 1; }); S.E.forEach(function (e, i) { if (!got.e[i]) got.e[i] = cnt('e') + 1; }); sc.faces.forEach(function (f, i) { if (!got.f[i]) got.f[i] = cnt('f') + 1; }); refresh(); });
      seg.set('v', false); st.append(ro, P.hint('藍＝頂點、粉紅＝稜、綠＝面。背面的也要數，轉過去再點。')); refresh(); api.lock('頂點、稜、面各數完');
    },
    /* 2 歐拉公式 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, S = null;
      P.choice(st, api, { id: 'sb-p2', predict: true, label: '先猜猜看', prompt: '數一數各種多面體的 <b>頂點 − 稜 + 面</b>，結果會是…？', row: true, options: [{ t: '每個都不同' }, { ok: true, t: '全部都一樣' }, { t: '都是 0' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('把 6 種多面體都看一遍'); } });
      var sc = PS.scene(st, { fitR: 1.1 });
      var pc = P.pill('', 'is-blue'), pe2 = P.pill('', 'is-pink'), pf = P.pill('', 'is-green'), pr = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, pc, pe2, pf, pr);
      var items = [['tpyramid', '三角錐'], ['cube', '正方體'], ['tprism', '三角柱'], ['spyramid', '四角錐'], ['pprism', '五角柱'], ['octa', '八面體']];
      var seg = PS.seg(st, items.map(function (it) { return { k: it[0], t: it[1] }; }), function (k) {
        if (gate.on) { seg.set(seg.cur, false); P.toast('先做上面的預測'); return; }
        S = PS.solid(k); PS.addSolid(sc, S, { alpha: 0.4 });
        pc.textContent = '頂點 V ＝ ' + S.V.length; pe2.textContent = '稜 E ＝ ' + S.E.length; pf.textContent = '面 F ＝ ' + S.F.length; pr.textContent = 'V − E + F ＝ ' + (S.V.length - S.E.length + S.F.length); pr.className = 'pl-pill is-ok';
        if (!seen[k]) { seen[k] = 1; n++; }
        if (n >= 6 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-basic', step: 2 }); st.append(P.ruleBox('每一個（沒有洞的）多面體都一樣：<br><b>頂點 − 稜 + 面 ＝ 2</b>　這叫<b>歐拉公式</b>。', '公式')); P.toast(api.ctx.p2 === 1 ? '你猜對了！全部都是 2' : '全部都是 2！'); api.unlock('發現歐拉公式了！'); }
      }, { cols: 3 });
      seg.set('cube', false); S = PS.solid('cube'); PS.addSolid(sc, S, { alpha: 0.4 });
      pc.textContent = '頂點 V ＝ 8'; pe2.textContent = '稜 E ＝ 12'; pf.textContent = '面 F ＝ 6'; pr.textContent = 'V − E + F ＝ 2'; pr.className = 'pl-pill is-ok';
      api.solve(function () { gate.on = false; items.forEach(function (it) { seg.set(it[0]); }); });
      st.append(ro); api.lock('先做上面的預測');
    },
    /* 3 用歐拉公式算 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function fig(key) { var S = PS.solid(key), sc = PS.scene(box, { fitR: 1.1 }); PS.addSolid(sc, S, { alpha: 0.4, dotR: 4 }); return S; }
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '用歐拉公式算算看（1 / 2）')); fig('icosa');
          box.append(h('div', { class: 'pl-q', html: '這個多面體有 <b>12 個頂點</b>、<b>30 條稜</b>。它有幾個面？（V − E + F ＝ 2）' }));
          P.numBox(box, { answer: 20, before: '面 F ＝', okMsg: '對！12 − 30 + F ＝ 2，所以 F ＝ 20（20 個三角形，正二十面體）。', onOk: next, wrong: function () { return '提示：12 − 30 + F ＝ 2，F 要多少才會變成 2？'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '用歐拉公式算算看（2 / 2）')); fig('dodeca');
          box.append(h('div', { class: 'pl-q', html: '這個多面體有 <b>20 個頂點</b>、<b>12 個面</b>（每面是正五邊形）。它有幾條稜？' }));
          P.numBox(box, { answer: 30, before: '稜 E ＝', okMsg: '對！20 − E + 12 ＝ 2，所以 E ＝ 30。也可以數：12 面 × 5 邊 ÷ 2（每條稜被兩個面共用）＝ 30。', onOk: function () { api.unlock('算出來了！'); P.track('transfer_ok', { id: 'solid-basic', q: 3 }); }, wrong: function () { return '提示：20 − E + 12 ＝ 2。或者：12 個面各 5 條邊，每條稜被 2 個面共用。'; } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 2 題');
    },
    /* 4 為什麼只有 5 種正多面體 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '正多面體'), P.instr('正多面體：每個面都是<b>一樣的正多邊形</b>，每個頂點接的面也一樣多。<br>在<b>一個頂點</b>拼拼看，什麼時候摺得起來？'));
      var m = 3, n = 3, found = {}, nf = 0, names = { '3,3': '正四面體', '3,4': '正八面體', '3,5': '正二十面體', '4,3': '正六面體', '5,3': '正十二面體' };
      var host = h('div', { class: 'pl-stage' }); st.append(host);
      var info = P.pill('', 'is-blue'), ok = P.pill('', ''), ro = h('div', { class: 'pl-readout' }, info, ok), list = h('div', { class: 'ps-pills' });
      var chips = {}; Object.keys(names).forEach(function (k) { var c = P.pill(names[k] + ' ？', ''); chips[k] = c; list.append(c); });
      function draw() {
        host.innerHTML = ''; var r = fanSvg(m, n); host.append(r.svg); var key = m + ',' + n, valid = r.sum < 360;
        info.textContent = n + ' × ' + r.alpha + '° ＝ ' + r.sum + '°'; ok.className = 'pl-pill ' + (valid ? 'is-ok' : 'is-bad'); ok.textContent = valid ? '✓ 小於 360°，摺得起來' : (r.sum === 360 ? '✗ 剛好 360°，攤平了' : '✗ 超過 360°，擠不下');
        if (valid && names[key] && !found[key]) { found[key] = 1; nf++; chips[key].textContent = names[key] + ' ✓'; chips[key].className = 'pl-pill is-ok'; P.toast('找到「' + names[key] + '」！'); }
        if (nf === 5 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-basic', step: 4 }); st.append(P.ruleBox('頂點周圍的角加起來要<b>小於 360°</b>才摺得起來。<br>所以正多面體<b>只有 5 種</b>：正四、六、八、十二、二十面體。', '為什麼')); api.unlock('只有 5 種！'); }
      }
      var segM = PS.seg(st, [{ k: 3, t: '正三角形<br>60°' }, { k: 4, t: '正方形<br>90°' }, { k: 5, t: '正五邊形<br>108°' }, { k: 6, t: '正六邊形<br>120°' }], function (k) { m = k; draw(); });
      segM.set(3, false);
      var stp = P.stepper('一個頂點接', 3, 6, 3, function (v) { n = v; draw(); }, function (v) { return v + ' 個'; });
      api.solve(function () { [[3, 3], [3, 4], [3, 5], [4, 3], [5, 3]].forEach(function (c) { m = c[0]; n = c[1]; segM.set(m, false); stp.set(n, true); draw(); }); });
      st.append(h('div', { class: 'pl-row pl-row--center' }, stp.el), ro, list, P.hint('換形狀、換個數，找出 5 種摺得起來的組合。')); draw(); api.lock('找出 5 種正多面體');
    },
    /* 5 換個外觀 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var S = PS.solid('spyramid'), sc = PS.scene(box, { fitR: 1.1 }); PS.addSolid(sc, S, { alpha: 0.4 });
          box.append(h('div', { class: 'pl-q', html: '這個正四角錐有 <b>5 個頂點</b>、<b>5 個面</b>。它有幾條稜？' }));
          P.numBox(box, { answer: 8, before: '稜 E ＝', okMsg: '對！5 − E + 5 ＝ 2，E ＝ 8（底面 4 條＋側面 4 條）。', onOk: next, wrong: function () { return '提示：V − E + F ＝ 2，5 − E + 5 ＝ 2。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var host = h('div', { class: 'pl-stage' }); box.append(host); host.append(fanSvg(5, 3).svg);
          P.choice(box, {}, { id: 'sb-t2', prompt: '每個頂點接 <b>3 個正五邊形</b>（如上圖），拼出來的是哪一種正多面體？', options: [{ t: '正六面體（正方體）', fb: '正方體的面是正方形。' }, { t: '正十二面體', ok: true, fb: '對！12 個正五邊形，每個頂點接 3 個。' }, { t: '正二十面體', fb: '正二十面體的面是正三角形。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var S = PS.solid('pprism'), sc = PS.scene(box, { fitR: 1.1 }); PS.addSolid(sc, S, { alpha: 0.4 });
          box.append(h('div', { class: 'pl-q', html: '正五角柱有 <b>10 個頂點</b>、<b>15 條稜</b>。它有幾個面？（想想：2 個五邊形底面＋幾個側面）' }));
          P.numBox(box, { answer: 7, before: '面 F ＝', okMsg: '對！10 − 15 + F ＝ 2，F ＝ 7（2 個底面＋ 5 個側面）。', onOk: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-basic' }); }, wrong: function () { return '提示：10 − 15 + F ＝ 2。'; } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 6 完成 */
    function (st) {
      P.complete(st, {
        id: 'solid-basic', moduleName: '立體圖形的基本性質', askAbout: '國中立體幾何', aha: '多面體的 頂點 − 稜 + 面 ＝ 2，<br>而且正多面體只有 5 種。',
        cards: [{ text: '立體圖形由面、稜、頂點組成；正方體有 8 個頂點、12 條稜、6 個面', src: '國中「立體圖形」（獵豹 J91S 立體圖形）' }, { text: '歐拉公式 V − E + F ＝ 2；頂點周圍的角和要小於 360°，所以正多面體只有 5 種', src: '數資班常見的拓展主題（詳細堂次請洽老師）' }],
        depth: { here: 0.18, cheetah: [{ at: 0.5, label: '歐拉公式<br>多面體計數' }, { at: 0.88, label: '正多面體<br>對偶與對稱' }] },
        teasers: [
          { title: '歐拉公式的應用', q: '只知道面的形狀與個數，如何算出頂點數與稜數？（像「足球」有幾個五邊形與六邊形？）', where: 'J91S 立體圖形（詳細堂次請洽老師）', lv: 'L2' },
          { title: '正多面體的對偶', q: '把每個面的中心連起來，正六面體變成誰？正十二面體呢？', where: '數資班拓展（請洽老師）', lv: 'L3' },
          { title: '正多面體的對稱', q: '正方體有幾種「轉一轉會與自己重合」的方法？（24 種）正十二面體呢？', where: '數資班拓展（請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子常把「面、稜、頂點」搞混，也不會系統地數；遇到不熟悉的立體圖形就靠肉眼亂數，容易漏掉背面的。', place: '國中「立體圖形」的起點，也是後面展開圖、三視圖、體積與表面積的基礎。', ask: ['正方體有幾個頂點、幾條稜、幾個面？', '三角錐的 V − E + F 是多少？', '為什麼不能用正六邊形拼出正多面體？'] },
        classes: ['J91S：立體圖形', 'J71S CH5：三視圖（立體觀察的先備）', 'PK3C：錐體與球體'],
        next: { href: 'play-solid-lines.html', text: '下一個：空間中的線與面' } });
    }];
  new P.Lesson({ id: 'solid-basic', title: '立體圖形的基本性質', answers: { 0: '立體圖形由面、稜、頂點組成；正方體有 8 個頂點、12 條稜、6 個面' }, steps: steps });
})();
