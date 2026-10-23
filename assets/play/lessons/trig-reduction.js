/* 獵豹玩中學｜三角函數（誘導公式）：奇變偶不變，符號看象限
   階段 1：拖 P(α)，看 −α、180°−α、180°＋α、360°−α 的對稱點 Q → 階段 2：每次轉 90°，看函數名什麼時候要變 →
   階段 3：3 個關卡（先看圖，再決定「變或不變」「正或負」）。
   要擊中的迷思：符號要看「原本的函數」在那個象限的正負（不是變完之後的）、奇數倍 90° 函數名要變、α 當成銳角。 */
(function () {
  var P = Play, h = P.h, PA = window.PA, f2 = function (v) { v = Math.round(v * 100) / 100; return (v < 0 ? '−' : '') + Math.abs(v); };
  var CX = 4.3, CY = 4.3, R = 2.6;
  function rad(d) { return d * Math.PI / 180; }
  function pt(d, r) { r = r || R; return [CX + r * Math.cos(rad(d)), CY + r * Math.sin(rad(d))]; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  function sg(v) { return Math.abs(v) < 1e-9 ? 0 : v > 0 ? 1 : -1; }
  function angOf(t) { return norm(Math.round(Math.atan2(t[1] - CY, t[0] - CX) * 180 / Math.PI)); }
  var TF = [{ k: '−α', q: function (a) { return norm(-a); } }, { k: '180° − α', q: function (a) { return norm(180 - a); } }, { k: '180° ＋ α', q: function (a) { return norm(180 + a); } }, { k: '360° − α', q: function (a) { return norm(360 - a); } }];

  /* 畫面：單位圓、P(α)、Q。o: alpha、q(α)→Q 的角度、dragP（P 能不能拖）、gate、sm、onChange(alpha, qd) */
  function scene(host, o) {
    var b = PA.board(host, 12, 8.6, o.sm ? 'pl-svg--sm' : ''), al = o.alpha, qd = o.q(al), S = {};
    b.circle([CX, CY], R, 'pl-circle pl-circle--unit'); b.line([CX - R - 0.5, CY], [CX + R + 0.5, CY], 'pg-axis'); b.line([CX, CY - R - 0.5], [CX, CY + R + 0.5], 'pg-axis');
    var gA = h('g'); b.gMid.append(gA);
    var oP = b.line([CX, CY], [CX, CY], 'pl-line pl-line--blue pl-line--bold'), oQ = b.line([CX, CY], [CX, CY], 'pl-line pl-line--pink pl-line--bold'), link = b.line([0, 0], [0, 0], 'pl-line pl-line--soft');
    var dQ = b.dot([0, 0], 'pl-dot pl-dot--pink', null, 0.24), tP = b.text([0, 0], 'P', 'pl-text pl-text--blue'), tQ = b.text([0, 0], 'Q', 'pl-text pl-text--pink');
    var pP = P.pill('', 'is-blue'), pQ = P.pill('', 'is-pink'), pR = P.pill('', 'is-amber'), pS = P.pill('', 'is-green'); [pP, pQ, pR, pS].forEach(function (p) { p.style.whiteSpace = 'normal'; });
    host.append(h('div', { class: 'pl-readout' }, pP), h('div', { class: 'pl-readout' }, pQ), h('div', { class: 'pl-readout' }, pR, pS));
    function arc(g, d, r, col, label, fixed) {
      if (d === 90) g.append(h('polyline', { points: b.pts([[CX + 0.45, CY], [CX + 0.45, CY + 0.45], [CX, CY + 0.45]]), class: 'pl-right' }));
      else if (d !== 0) g.append(h('path', { d: 'M ' + (CX + r) + ' ' + b.Y(CY) + ' A ' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 0 ' + (CX + r * Math.cos(rad(d))) + ' ' + b.Y(CY + r * Math.sin(rad(d))), fill: 'none', stroke: col, 'stroke-width': 0.08 }));
      if (d !== 0) { var m = rad(d / 2), pos = fixed ? [CX + 1.5, CY - 0.55] : [CX + (r + 0.5) * Math.cos(m), CY + (r + 0.5) * Math.sin(m) - 0.15]; b.text(pos, label, 'pl-text pl-text--sm', g); }
    }
    function upd() {
      var p = pt(al), q = pt(qd), c0 = Math.cos(rad(al)), s0 = Math.sin(rad(al)), cq = Math.cos(rad(qd)), sq = Math.sin(rad(qd));
      b.setLine(oP, [CX, CY], p); b.setLine(oQ, [CX, CY], q); b.setLine(link, p, q); dQ.setAttribute('cx', q[0]); dQ.setAttribute('cy', b.Y(q[1]));
      var same = qd === al; dQ.style.display = same ? 'none' : ''; link.style.display = same ? 'none' : ''; b.setText(tP, [p[0] + (c0 >= 0 ? (same ? 1.55 : 0.7) : (same ? -1.55 : -0.7)), p[1] + 0.45], same ? 'P ＝ Q' : 'P'); b.setText(tQ, [q[0] + (cq >= 0 ? 0.7 : -0.7), q[1] + (sq >= 0 ? 0.45 : -0.45)], same ? '' : 'Q');
      gA.innerHTML = ''; arc(gA, al, 0.8, '#2f6fdc', 'α ＝ ' + al + '°', true); if (qd !== al) arc(gA, qd, 1.45, '#d6336c', qd + '°');
      pP.textContent = 'P(α) ＝ (cos α, sin α) ＝ (' + f2(c0) + ', ' + f2(s0) + ')'; pQ.textContent = 'Q（' + qd + '°）＝ (' + f2(cq) + ', ' + f2(sq) + ')';
      var xs = Math.abs(Math.abs(cq) - Math.abs(c0)) < 1e-9 ? 'cos α' : 'sin α', ys = Math.abs(Math.abs(sq) - Math.abs(s0)) < 1e-9 ? 'sin α' : 'cos α';
      var xv = (xs === 'cos α' ? c0 : s0), yv = (ys === 'sin α' ? s0 : c0);
      pR.textContent = 'Q 的 x ＝ ' + (sg(cq) === sg(xv) ? '＋' : '−') + xs; pS.textContent = 'Q 的 y ＝ ' + (sg(sq) === sg(yv) ? '＋' : '−') + ys;
      S.xs = xs; S.ys = ys; S.xsign = sg(cq) === sg(xv) ? 1 : -1; S.ysign = sg(sq) === sg(yv) ? 1 : -1;
      if (o.onChange) o.onChange(al, qd, S);
    }
    var AL = [15, 30, 45, 60, 75], hd = o.dragP === false ? null : b.handle({ pos: pt(al), candidates: AL.map(function (a) { return pt(a); }), disabled: function () { return !!(o.gate && o.gate.on); }, onMove: function (t) { al = angOf(t); qd = o.q(al); upd(); } });
    S.setAlpha = function (a) { al = a; qd = o.q(al); if (hd) hd.set(pt(a), true); upd(); };
    S.setQ = function (fn) { o.q = fn; qd = fn(al); upd(); };
    S.moveP = function (a) { hd.moveTo(pt(a)); };
    S.state = function () { return { al: al, qd: qd }; };
    upd(); return S;
  }
  var FN = function (xs, ys) { return { x: xs, y: ys }; };

  var steps = [
    /* 階段 1：對稱點 */
    function (st, api) {
      var gate = { on: true }, seenT = {}, moved = {}, done = false, cur = 1, sc, rules = {}, btns = [];
      P.choice(st, api, { id: 'tr2-p1', predict: true, label: '先猜猜看', prompt: 'α 是銳角。<b>sin(180° − α)</b> 等於什麼？', row: true, options: [{ ok: true, t: 'sin α' }, { t: '−sin α' }, { t: 'cos α' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('按按鈕換對稱點，再拖動 P'); } });
      st.append(P.instr('藍色點 <b>P</b> 在 α 的位置（銳角）。按按鈕選一種變換，粉紅色點 <b>Q</b> 就是那個角。拖動 P，看 Q 的座標和 P 有什麼關係。'));
      sc = scene(st, { alpha: 30, q: TF[1].q, gate: gate, onChange: function (al, qd, S) {
        if (gate.on) return; moved[al] = 1; rules[cur] = { xs: S.xs, ys: S.ys, xsign: S.xsign, ysign: S.ysign }; seenT[cur] = 1;
        if (seenT[0] && seenT[1] && seenT[2] && seenT[3] && Object.keys(moved).length >= 2 && !done) {
          done = true; P.track('aha', { id: 'trig-reduction', step: 1 });
          var line = function (i) { var r = rules[i]; return 'Q ＝ ' + TF[i].k + '：cos 變成 ' + (r.xsign > 0 ? '＋' : '−') + 'cos α，sin 變成 ' + (r.ysign > 0 ? '＋' : '−') + 'sin α'; };
          if (api.ctx.p1 === 0) P.toast('你猜對了：sin(180° − α) ＝ sin α');
          st.append(P.ruleBox([0, 1, 2, 3].map(line).join('<br>') + '<br>（−α 和 360° − α 是同一個位置。）<br>函數名<b>都沒變</b>，只有<b>符號</b>不同：看 Q 在哪個象限。', '對稱點'));
          api.unlock('函數名不變，只有符號看象限');
        }
      } });
      var row = h('div', { class: 'pl-row pl-row--center' }); row.style.flexWrap = 'wrap';
      TF.forEach(function (t, i) { var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, 'Q ＝ ' + t.k); bt.addEventListener('click', function () { if (gate.on) { P.toast('先做上面的預測'); return; } cur = i; sc.setQ(t.q); }); btns.push(bt); row.append(bt); });
      st.append(row);
      api.solve(function () { gate.on = false; [0, 1, 2, 3].forEach(function (i) { cur = i; sc.setQ(TF[i].q); }); sc.moveP(60); }, false, 'sin(180° − α) ＝ sin α（Q 和 P 左右對稱，高度一樣）');
      st.append(P.hint('四個按鈕都按一遍，P 也拖幾下。')); api.lock('先做上面的預測');
    },
    /* 階段 2：轉 90° */
    function (st, api) {
      var seen = {}, moved = {}, done = false, k = 0, sc;
      st.append(P.instr('按「再轉 90°」，Q 每次從 P 開始再多轉 90°（Q ＝ α ＋ 90°×次數）。看 Q 的 x、y 座標和 P 的 cos α、sin α 是怎麼對應的。'));
      sc = scene(st, { alpha: 30, q: function (a) { return norm(a + 90 * k); }, onChange: function (al, qd, S) {
        moved[al] = 1; seen[k] = 1;
        if (seen[1] && seen[2] && seen[3] && !done) {
          done = true; P.track('aha', { id: 'trig-reduction', step: 2 });
          st.append(P.ruleBox('轉 <b>1 次、3 次</b>（奇數個 90°）：x、y <b>互換</b>，cos 的位置變成 sin α、sin 的位置變成 cos α：<b>函數名要變</b>。<br>轉 <b>2 次、4 次</b>（偶數個 90°）：x、y 沒有互換，<b>函數名不變</b>。<br>這就是「<b>奇變偶不變</b>」。符號再看 Q 在哪個象限。', '奇變偶不變'));
          api.unlock('奇數個 90° 就互換');
        }
      } });
      var lab = P.pill('', 'is-blue'), bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '再轉 90°'), bz = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '回到 0 次');
      function show() { lab.textContent = '轉了 ' + k + ' 次 ＝ ' + (90 * k) + '°'; }
      bt.addEventListener('click', function () { if (k >= 4) return; k++; sc.setQ(function (a) { return norm(a + 90 * k); }); show(); });
      bz.addEventListener('click', function () { k = 0; sc.setQ(function (a) { return norm(a + 90 * k); }); show(); });
      st.append(h('div', { class: 'pl-readout' }, lab), h('div', { class: 'pl-row pl-row--center' }, bt, bz)); show();
      api.solve(function () { [1, 2, 3].forEach(function (n) { k = n; sc.setQ(function (a) { return norm(a + 90 * k); }); show(); }); }, false, '奇數個 90°（轉 1、3 次）函數名要變，偶數個 90°（轉 2、4 次）函數名不變');
      st.append(P.hint('轉 1、2、3 次各看一次，Q 的 x 和 y 是 P 的哪一個？')); api.lock('轉到 1、2、3 次');
    },
    /* 階段 3：操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      /* cfg: expr（題目）, q(α)、truth: {name: '變'|'不變', sign: '＋'|'−'}, ans, rule, hint */
      function task(cfg) {
        return function (b0, done, setSolve) {
          b0.append(h('div', { class: 'pl-q', html: '看圖（α ＝ 30°）：<b>' + cfg.expr + '</b> 等於什麼？決定<b>函數名要不要變</b>、<b>符號是正還是負</b>。' }));
          var sc = scene(b0, { alpha: 30, q: cfg.q, dragP: false, sm: true }), pick = { name: null, sign: null }, fin = false, pF = P.pill('', 'is-blue'), bs = {};
          function mk(key, val, label) { var bt = h('button', { type: 'button', class: 'button button--secondary pl-small' }, label); bt.addEventListener('click', function () { if (fin) return; pick[key] = val; ['name', 'sign'].forEach(function (kk) { Object.keys(bs[kk]).forEach(function (v) { bs[kk][v].classList.toggle('is-picked', pick[kk] === v); bs[kk][v].style.outline = pick[kk] === v ? '3px solid #2f6fdc' : ''; }); }); check(); }); (bs[key] = bs[key] || {})[val] = bt; return bt; }
          function check() {
            pF.textContent = cfg.expr + ' ＝ ' + (pick.sign || '？') + (pick.name === null ? '？' : pick.name === '變' ? cfg.other : cfg.same);
            if (pick.name !== null && pick.sign !== null) { var ok = pick.name === cfg.truth.name && pick.sign === cfg.truth.sign; pF.className = 'pl-pill ' + (ok ? 'is-ok' : 'is-pink'); if (ok && !fin) { fin = true; P.toast(cfg.msg); b0.append(P.ruleBox(cfg.rule, '誘導公式')); done(); } else if (!ok) { pF.textContent += '　✗ 對照 Q 的座標再看看'; } }
          }
          b0.append(h('div', { class: 'pl-readout' }, pF), h('div', { class: 'pl-row pl-row--center' }, mk('name', '不變', '函數名不變'), mk('name', '變', '函數名要變')), h('div', { class: 'pl-row pl-row--center' }, mk('sign', '＋', '符號：＋'), mk('sign', '−', '符號：−')));
          check(); setSolve(function () { pick.name = cfg.truth.name; pick.sign = cfg.truth.sign; Object.keys(bs).forEach(function (kk) { Object.keys(bs[kk]).forEach(function (v) { bs[kk][v].style.outline = pick[kk] === v ? '3px solid #2f6fdc' : ''; }); }); check(); }, cfg.ans); b0.append(P.hint(cfg.hint));
        };
      }
      var tasks = [
        task({ expr: 'sin(180° ＋ α)', q: function (a) { return norm(180 + a); }, truth: { name: '不變', sign: '−' }, same: 'sin α', other: 'cos α', msg: 'sin(180° ＋ α) ＝ −sin α', ans: 'sin(180° ＋ α) ＝ −sin α（函數名不變，符號是負）', rule: '180° 是偶數個 90°，<b>函數名不變</b>。Q 在第三象限，y 是負的，所以符號是 <b>−</b>：sin(180° ＋ α) ＝ <b>−sin α</b>。', hint: '看 Q 的 y 座標（sin）是正還是負。' }),
        task({ expr: 'cos(270° ＋ α)', q: function (a) { return norm(270 + a); }, truth: { name: '變', sign: '＋' }, same: 'cos α', other: 'sin α', msg: 'cos(270° ＋ α) ＝ sin α', ans: 'cos(270° ＋ α) ＝ ＋sin α（函數名要變，符號是正）', rule: '270° 是 3 個 90°（奇數），<b>函數名要變</b>：cos 變 sin。Q 在第四象限，<b>原函數 cos</b> 在第四象限是正的，所以符號是 <b>＋</b>：cos(270° ＋ α) ＝ <b>sin α</b>。', hint: '看 Q 的 x 座標（cos）是什麼，它等於 P 的哪一個座標？' }),
        task({ expr: 'sin(270° − α)', q: function (a) { return norm(270 - a); }, truth: { name: '變', sign: '−' }, same: 'sin α', other: 'cos α', msg: 'sin(270° − α) ＝ −cos α', ans: 'sin(270° − α) ＝ −cos α（函數名要變，符號是負）', rule: '270° 是奇數個 90°，<b>函數名要變</b>：sin 變 cos。Q 在第三象限，<b>原函數 sin</b> 在第三象限是負的，所以符號是 <b>−</b>：sin(270° − α) ＝ <b>−cos α</b>。', hint: '符號要看「原本的函數」在 Q 那個象限的正負。' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'trig-reduction' }); } });
    },
    /* 完成 */
    function (st) {
      P.complete(st, {
        id: 'trig-reduction', moduleName: '誘導公式：奇變偶不變，符號看象限', askAbout: '三角函數的誘導公式', aha: '<b>奇變偶不變</b>：加減奇數個 90°，sin 與 cos 互換；偶數個 90°，函數名不變。<br><b>符號看象限</b>：把 α 當銳角，看<b>原本的函數</b>在那個象限是正還是負。',
        cards: [{ text: 'kπ/2 ± α：k 為奇數函數名變（sin↔cos、tan↔cot）、偶數不變；符號看原函數在該象限的正負', src: '高中：三角函數的誘導公式' }, { text: 'sin(180° − α) ＝ sin α、cos(180° − α) ＝ −cos α、sin(180° ＋ α) ＝ −sin α、sin(−α) ＝ −sin α', src: '對稱點的座標關係' }],
        depth: { here: 0.3, cheetah: [{ at: 0.55, label: '和角公式<br>三角函數圖形平移' }, { at: 0.85, label: '三角函數化簡與求值' }] },
        teasers: [{ title: '化簡與求值', q: 'sin(π ＋ α)·cos(3π/2 − α) 化簡後是什麼？', where: 'S111 第 1～8 堂：CH1 三角函數 II', lv: 'L3' }, { title: '和角公式', q: 'sin(α ＋ β) 怎麼用旋轉的想法推出來？', where: 'S102 第 18～22 堂（2026 年 5～6 月）：CH4 三角函數', lv: 'L3' }],
        parent: { pitfall: '孩子常用「變完之後的函數」判斷符號，其實要看原本的函數；也常把 3π/2 當成偶數倍，或忘了先把 α 當銳角。', place: '高中三角函數化簡與求值的基礎。', ask: ['sin(π − α) 等於什麼？為什麼？', 'cos(3π/2 ＋ α) 的函數名要變嗎？', '符號要看變之前還是變之後的函數？'] },
        classes: ['S111（第 1～8 堂）：CH1 三角函數 II', 'S102（第 18～22 堂，2026 年 5～6 月）：CH4 三角函數'], next: { href: 'play-trig-sine-cases.html', text: '下一個：正弦定理' } });
    }];
  new P.Lesson({ id: 'trig-reduction', title: '誘導公式：奇變偶不變，符號看象限', steps: steps });
})();
