/* 獵豹玩中學｜空間中的線與面：平行・相交・歪斜、線與面、面與面（以正方體為舞台） */
(function () {
  var P = Play, h = P.h, V3 = PS.v;
  var NAMES = 'ABCDEFGH';
  var VERT = [[-.5, -.5, .5], [.5, -.5, .5], [.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5], [-.5, .5, -.5]]; // A B C D（下）E F G H（上）
  var EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  var FACES = [{ n: [0, 0, 1], name: '前面', v: [0, 1, 5, 4] }, { n: [0, 0, -1], name: '後面', v: [2, 3, 7, 6] }, { n: [-1, 0, 0], name: '左面', v: [3, 0, 4, 7] }, { n: [1, 0, 0], name: '右面', v: [1, 2, 6, 5] }, { n: [0, 1, 0], name: '上面', v: [4, 5, 6, 7] }, { n: [0, -1, 0], name: '下面', v: [3, 2, 1, 0] }];
  var FCOL = ['#9db7ee', '#f3a6c3', '#9ad9b3', '#f0d58b', '#c5b0ef', '#f4b78e'];
  function ename(i) { return NAMES[EDGES[i][0]] + NAMES[EDGES[i][1]]; }
  function dir(e) { return V3.sub(VERT[e[1]], VERT[e[0]]); }
  /* 兩條稜的關係：same / parallel / meet / skew */
  function rel(i, j) {
    if (i === j) return 'same'; var a = EDGES[i], b = EDGES[j];
    if (V3.len(V3.cross(dir(a), dir(b))) < 1e-9) return 'parallel';
    if (a[0] === b[0] || a[0] === b[1] || a[1] === b[0] || a[1] === b[1]) return 'meet';
    return 'skew';
  }
  var RN = { parallel: '平行', meet: '相交', skew: '歪斜', same: '同一條' };
  function mkCube(st, o) {
    o = o || {}; var sc = PS.scene(st, { fitR: 0.98 });
    if (o.dir) PS.dirLabels(sc, { x0: -.5, x1: .5, z0: -.5, z1: .5, y: -.5, lo: -.95, ly: .62 }, { margin: 0.5, size: 15, up: 1.0 });   /* 面的名稱有方向（前、後、左、右、上）：標在正方體四周 */
    sc.faces = FACES.map(function (f, i) { return { pts: f.v.map(function (j) { return VERT[j]; }), fill: FCOL[i], alpha: o.faceAlpha === undefined ? 0.2 : o.faceAlpha, stroke: null, id: 'f' + i, flat: true }; });
    sc.lines = EDGES.map(function (e, i) { return { a: VERT[e[0]], b: VERT[e[1]], color: '#122548', w: 2.4, id: 'e' + i }; });
    sc.dots = VERT.map(function (p, i) { return { p: p, r: 4, color: '#122548', label: NAMES[i], size: 14, dy: i < 4 ? 15 : -13 }; });
    return sc;
  }
  function paint(sc, map) { // map: edgeIndex → color
    sc.lines.forEach(function (l, i) { var c = map[i]; l.color = c || '#122548'; l.w = c ? 5 : 2.4; }); sc.texts = [];
    sc.invalidate();
  }
  function edgeTap(sc, i) { var q = sc.project(V3.mid(VERT[EDGES[i][0]], VERT[EDGES[i][1]])); sc.onTap([q[0], q[1]], null); }
  var COL = { blue: PS.COL.blue, pink: PS.COL.pink, green: PS.COL.green, amber: '#d29b1f' };

  var steps = [
    /* 1 直線的三種關係 */
    function (st, api) {
      var gate = { on: true }, seen = {}, n = 0, sel = [];
      P.choice(st, api, { id: 'sl-p1', predict: true, label: '先猜猜看', prompt: '在<b>空間</b>裡，兩條<b>不平行</b>的直線，一定會相交嗎？', row: true, options: [{ t: '一定會' }, { t: '不一定' }, { t: '一定不會' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('依序點兩條稜，多試幾組'); } });
      var sc = mkCube(st, { maxH: Math.max(170, Math.min(250, window.innerHeight - 520)) }), ro = h('div', { class: 'pl-readout' }), pr = P.pill('點兩條稜，看它們的關係', ''); ro.append(pr);
      var tags = h('div', { class: 'ps-pills' }), tp = {}; ['parallel', 'meet', 'skew'].forEach(function (k) { tp[k] = P.pill(RN[k] + ' ？', ''); tags.append(tp[k]); });
      sc.onTap = function (pos) {
        if (gate.on) { P.toast('先做上面的預測'); return; }
        var i = PS.nearestSeg(sc, pos, EDGES.map(function (e) { return [VERT[e[0]], VERT[e[1]]]; }), 20); if (i < 0) return; tapEdge(i);
      };
      function tapEdge(i) {
        if (sel.length === 2) sel = []; sel.push(i); var map = {}; map[sel[0]] = COL.blue; if (sel[1] !== undefined) map[sel[1]] = COL.pink; paint(sc, map);
        sc.texts = sel.map(function (e, k) { return { p: V3.mid(VERT[EDGES[e][0]], VERT[EDGES[e][1]]), t: ename(e), color: '#fff', bg: k ? COL.pink : COL.blue, size: 13 }; }); sc.invalidate();
        if (sel.length === 2) {
          var r = rel(sel[0], sel[1]); pr.className = 'pl-pill ' + (r === 'skew' ? 'is-pink' : r === 'parallel' ? 'is-ok' : 'is-amber'); pr.textContent = ename(sel[0]) + ' 與 ' + ename(sel[1]) + '：' + RN[r] + (r === 'skew' ? '（不平行、也不相交）' : '');
          if (r !== 'same' && !seen[r]) { seen[r] = 1; n++; tp[r].textContent = RN[r] + ' ✓'; tp[r].className = 'pl-pill is-ok'; }
          if (n >= 3 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-lines', step: 1 }); st.append(P.ruleBox('空間中兩直線有<b>三種</b>關係：<b>平行</b>、<b>相交</b>、<b>歪斜</b>。<br>歪斜＝<b>不平行、也不相交</b>（不在同一個平面上）。這是平面上沒有的！', '性質')); P.toast(api.ctx.p1 === 1 ? '你猜對了！不一定' : '不平行也可能碰不到：歪斜'); api.unlock('發現歪斜了！'); }
        } else { pr.className = 'pl-pill'; pr.textContent = '再點第二條稜'; }
      };
      api.solve(function () { gate.on = false; [0, 2, 0, 1, 0, 5].forEach(tapEdge); });
      st.append(ro, tags, P.hint('先點一條（藍），再點另一條（粉紅）。找出平行、相交、歪斜各一組。')); sc.invalidate(); api.lock('先做上面的預測');
    },
    /* 2 與一條稜歪斜的有幾條 */
    function (st, api) {
      var cls = null, ref = 0, shown = {};
      P.choice(st, api, { id: 'sl-p2', predict: true, label: '先猜猜看', prompt: '正方體有 12 條稜。與稜 <b>AB</b> <b>歪斜</b>的稜有幾條？', row: true, options: [{ t: '2 條' }, { t: '4 條' }, { t: '6 條' }], onAnswer: function (i) { api.ctx.p2 = i; gate.on = false; api.lock('按三個按鈕，看各幾條'); } });
      var gate = { on: true };
      var sc = mkCube(st, { maxH: Math.max(170, Math.min(240, window.innerHeight - 540)) }), ps = P.pill('', 'is-ok'), pm = P.pill('', 'is-amber'), pk = P.pill('', 'is-pink'), ro = h('div', { class: 'pl-readout' }, ps, pm, pk);
      function show(k) {
        var map = {}; map[ref] = COL.blue; var cnt = 0;
        if (k) EDGES.forEach(function (e, i) { if (rel(ref, i) === k) { map[i] = k === 'parallel' ? COL.green : k === 'meet' ? COL.amber : COL.pink; cnt++; } });
        paint(sc, map); sc.texts = [{ p: V3.mid(VERT[EDGES[ref][0]], VERT[EDGES[ref][1]]), t: ename(ref), color: '#fff', bg: COL.blue, size: 13 }]; sc.invalidate(); return cnt;
      }
      function counts() { var c = { parallel: 0, meet: 0, skew: 0 }; EDGES.forEach(function (e, i) { var r = rel(ref, i); if (c[r] !== undefined) c[r]++; }); ps.textContent = '平行 ' + c.parallel + ' 條'; pm.textContent = '相交 ' + c.meet + ' 條'; pk.textContent = '歪斜 ' + c.skew + ' 條'; }
      var row = PS.btnRow(st, [{ k: 'parallel', t: '平行', cls: 'is-green', fn: function () { pick('parallel'); } }, { k: 'meet', t: '相交', fn: function () { pick('meet'); } }, { k: 'skew', t: '歪斜', cls: 'is-pink', fn: function () { pick('skew'); } }]);
      function pick(k) {
        if (gate.on) { P.toast('先做上面的預測'); return; }
        cls = k; show(k); shown[k] = 1; Object.keys(row.b).forEach(function (kk) { row.b[kk].classList.toggle('is-on', kk === k); });
        if (shown.parallel && shown.meet && shown.skew && !st.querySelector('.pl-rule')) {
          P.track('aha', { id: 'solid-lines', step: 2 });
          st.append(P.ruleBox('其他 11 條稜：<b>3 條平行、4 條相交、4 條歪斜</b>。<br>換成任何一條稜（點點看），結果都一樣。', '計數')); P.toast(api.ctx.p2 === 1 ? '你猜對了！4 條' : '歪斜的有 4 條'); api.unlock('數出來了！');
        }
      }
      sc.onTap = function (pos) { if (gate.on) return; var i = PS.nearestSeg(sc, pos, EDGES.map(function (e) { return [VERT[e[0]], VERT[e[1]]]; }), 20); if (i >= 0) { ref = i; counts(); show(cls); } };
      api.solve(function () { gate.on = false; pick('parallel'); pick('meet'); pick('skew'); });
      counts(); show(null); st.append(ro, P.hint('粗藍線是 AB。也可以點別的稜，換一條當基準。')); api.lock('先做上面的預測');
    },
    /* 3 線與面 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '直線與平面'), P.instr('先點<b>一條稜</b>（線），再點<b>一個面</b>，看它們的關係。'));
      var mode = 'e', eSel = null, fSel = null, seen = {}, n = 0;
      var sc = mkCube(st, { dir: true, maxH: Math.max(170, Math.min(250, window.innerHeight - 520)) }), pr = P.pill('點一條稜、再點一個面', ''), ro = h('div', { class: 'pl-readout' }, pr);
      var seg = PS.seg(st, [{ k: 'e', t: '╱ 選稜' }, { k: 'f', t: '▱ 選面' }], function (k) { mode = k; }); seg.set('e', false);
      var tags = h('div', { class: 'ps-pills' }), tp = {}; [['in', '在面上'], ['para', '平行'], ['perp', '垂直']].forEach(function (k) { tp[k[0]] = P.pill(k[1] + ' ？', ''); tags.append(tp[k[0]]); });
      function relEF(ei, fi) {
        var e = EDGES[ei], f = FACES[fi], p0 = VERT[f.v[0]], da = V3.dot(f.n, V3.sub(VERT[e[0]], p0)), db = V3.dot(f.n, V3.sub(VERT[e[1]], p0));
        if (Math.abs(da) < 1e-9 && Math.abs(db) < 1e-9) return { k: 'in' }; if (Math.abs(da - db) < 1e-9) return { k: 'para' };
        var foot = Math.abs(da) < 1e-9 ? VERT[e[0]] : VERT[e[1]], other = Math.abs(da) < 1e-9 ? VERT[e[1]] : VERT[e[0]]; return { k: 'perp', foot: foot, up: V3.norm(V3.sub(other, foot)) };
      }
      function draw() {
        sc.lines.length = EDGES.length; var map = {}; if (eSel !== null) map[eSel] = COL.blue; paint(sc, map); sc.texts = [];
        sc.faces.forEach(function (f, i) { f.alpha = (fSel === i) ? 0.55 : 0.18; f.fill = (fSel === i) ? '#f0d58b' : FCOL[i]; });
        if (eSel !== null) sc.texts.push({ p: V3.mid(VERT[EDGES[eSel][0]], VERT[EDGES[eSel][1]]), t: ename(eSel), color: '#fff', bg: COL.blue, size: 13 });
        if (eSel !== null && fSel !== null) {
          var r = relEF(eSel, fSel), label = { in: '在面上', para: '平行（不相交）', perp: '垂直（相交成直角）' }[r.k]; pr.className = 'pl-pill ' + (r.k === 'perp' ? 'is-pink' : r.k === 'para' ? 'is-ok' : 'is-amber'); pr.textContent = ename(eSel) + ' 與 ' + FACES[fSel].name + '：' + label;
          if (r.k === 'perp') { var f = FACES[fSel], u = r.up, w = V3.norm(V3.sub(V3.mid(VERT[f.v[0]], VERT[f.v[2]]), r.foot)), s = 0.16, a = V3.add(r.foot, V3.mul(u, s)), b = V3.add(a, V3.mul(w, s)), c = V3.add(r.foot, V3.mul(w, s)); sc.lines.push({ a: a, b: b, color: '#d6336c', w: 2.4 }, { a: b, b: c, color: '#d6336c', w: 2.4 }); }
          if (!seen[r.k]) { seen[r.k] = 1; n++; tp[r.k].textContent = { in: '在面上', para: '平行', perp: '垂直' }[r.k] + ' ✓'; tp[r.k].className = 'pl-pill is-ok'; }
          if (n >= 3 && !st.querySelector('.pl-rule')) { P.track('aha', { id: 'solid-lines', step: 3 }); st.append(P.ruleBox('直線與平面只有<b>三種</b>關係：<b>在平面上</b>、<b>平行</b>（碰不到）、<b>相交</b>（垂直是相交的特例）。<br>每個面：4 條稜在面上、4 條垂直、4 條平行。', '性質')); api.unlock('三種關係都看到了！'); }
        } else { pr.className = 'pl-pill'; pr.textContent = eSel === null ? '先點一條稜' : '再點一個面'; }
        sc.invalidate();
      }
      sc.onTap = function (pos, face) {
        var segs = EDGES.map(function (e) { return [VERT[e[0]], VERT[e[1]]]; });
        if (mode === 'e') { var i = PS.nearestSeg(sc, pos, segs, 18); if (i >= 0) { eSel = i; mode = 'f'; seg.set('f', false); draw(); } else if (face && face.id) { fSel = +face.id.slice(1); draw(); } }
        else { var j = PS.nearestSeg(sc, pos, segs, 5); if (j >= 0) { eSel = j; draw(); } else if (face && face.id) { fSel = +face.id.slice(1); draw(); } }
      };
      api.solve(function () { [[0, 5], [0, 4], [8, 5]].forEach(function (c) { eSel = c[0]; fSel = c[1]; draw(); }); });
      st.append(ro, tags, P.hint('先選稜（藍）→ 自動換成選面（黃）。想換稜，按「選稜」。')); draw(); api.lock('找出三種關係各一組');
    },
    /* 4 面與面 */
    function (st, api) {
      st.append(h('div', { class: 'pl-label' }, '平面與平面'), P.instr('點<b>兩個面</b>，看它們是<b>平行</b>還是<b>垂直</b>。'));
      var sel = [], seen = {}, n = 0, ask = h('div', {});
      var sc = mkCube(st, { dir: true, maxH: Math.max(160, Math.min(230, window.innerHeight - 560)), faceAlpha: 0.3 }), pr = P.pill('點兩個面', ''), ro = h('div', { class: 'pl-readout' }, pr);
      function paintF() { sc.faces.forEach(function (f, i) { var s = sel.indexOf(i); f.fill = s === 0 ? '#9db7ee' : s === 1 ? '#f3a6c3' : '#e4dcc8'; f.alpha = s >= 0 ? 0.6 : 0.22; f.label = s >= 0 ? FACES[i].name : ''; f.labelColor = '#122548'; f.labelSize = 14; }); sc.invalidate(); }
      sc.onTap = function (pos, face) {
        if (!face || !face.id) return; var i = +face.id.slice(1); if (sel.length === 2) sel = []; if (sel.indexOf(i) < 0) sel.push(i); paintF();
        if (sel.length === 2) { var par = V3.len(V3.cross(FACES[sel[0]].n, FACES[sel[1]].n)) < 1e-9, k = par ? 'para' : 'perp'; pr.className = 'pl-pill ' + (par ? 'is-ok' : 'is-pink'); pr.textContent = FACES[sel[0]].name + ' 與 ' + FACES[sel[1]].name + '：' + (par ? '平行' : '垂直（夾 90°）'); var key = sel.slice().sort().join(); if (!seen[key]) { seen[key] = k; n++; } var cp = 0, cv = 0; Object.keys(seen).forEach(function (x) { seen[x] === 'para' ? cp++ : cv++; }); pr.textContent += '　　已看過：平行 ' + cp + '、垂直 ' + cv; if (cp >= 1 && cv >= 2 && !ask.firstChild) showAsk(); }
        else { pr.className = 'pl-pill'; pr.textContent = '再點第二個面'; }
      };
      function showAsk() {
        var qb = h('div', {}); ask.append(qb); qb.append(h('div', { class: 'pl-q', html: '正方體 6 個面，任選 2 個面配成一對，共 15 對。<b>平行</b>的有幾對？' }));
        P.numBox(qb, { answer: 3, before: '平行 ＝', okMsg: '對！上下、前後、左右，共 3 對平行；其餘 12 對都互相垂直。', onOk: function () { P.track('aha', { id: 'solid-lines', step: 4 }); ask.append(P.ruleBox('兩個平面：<b>平行</b>（永遠碰不到）或<b>相交</b>。正方體相鄰的面相交成 <b>90°</b>（互相垂直）。<br>15 對面：<b>3 對平行、12 對垂直</b>。', '性質')); api.unlock('面與面的關係！'); }, wrong: function () { return '提示：每個面只有「對面」和它平行，6 個面共 3 對。'; } });
      }
      api.solve(function () { sel = [4, 5]; paintF(); if (!ask.firstChild) showAsk(); });
      st.append(ro, ask, P.hint('點完兩個面，還會再點新的一組。試幾組後會出現問題。')); paintF(); api.lock('點幾組面，再回答問題');
    },
    /* 5 換個外觀 */
    function (st, api) {
      var box = h('div', {}), k = 0; st.append(box);
      function cubeFig(map, texts) { var sc = mkCube(box, { maxH: Math.max(150, Math.min(220, window.innerHeight - 560)) }); paint(sc, map || {}); sc.texts = texts || []; sc.invalidate(); return sc; }
      function tag(i, color) { return { p: V3.mid(VERT[EDGES[i][0]], VERT[EDGES[i][1]]), t: ename(i), color: '#fff', bg: color, size: 13 }; }
      var qs = [
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 1 / 3 題')); var m = {}; m[0] = COL.blue; cubeFig(m, [tag(0, COL.blue)]);
          P.choice(box, {}, { id: 'sl-t1', prompt: '哪一條稜和 <b>AB</b>（藍色）是<b>歪斜</b>？', row: true, options: [{ t: 'BC', fb: 'BC 和 AB 相交在頂點 B。' }, { t: 'EF', fb: 'EF 和 AB 平行（同方向、碰不到）。' }, { t: 'CG', ok: true, fb: '對！CG 與 AB 不平行，延長也碰不到。' }], onAnswer: next });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 2 / 3 題')); var m = {}; [0, 2, 4, 6].forEach(function (i) { m[i] = COL.blue; }); cubeFig(m, []);
          box.append(h('div', { class: 'pl-q', html: '藍色的 4 條稜<b>互相平行</b>。正方體一共有 3 個方向，每個方向 4 條稜。想想：全部 12 條稜中，<b>互相平行的稜</b>（2 條配成一對）共有幾對？' }));
          P.numBox(box, { answer: 18, before: '共', unit: '對', okMsg: '對！每個方向 4 條選 2 條：4×3÷2 ＝ 6 對，3 個方向 ＝ 18 對。', onOk: next, wrong: function () { return '提示：同一方向的 4 條稜，兩兩配對有 4×3÷2 ＝ 6 種；共 3 個方向。'; } });
        },
        function () {
          box.innerHTML = ''; box.append(h('div', { class: 'pl-label' }, '第 3 / 3 題')); var S = PS.solid('tprism'), sc = PS.scene(box, { fitR: 1.1 });
          PS.addSolid(sc, S, { alpha: 0.2, stroke: null }); var nm = { 0: 'A', 2: 'B', 4: 'C', 1: 'D', 3: 'E', 5: 'F' }; S.V.forEach(function (p, i) { sc.dots[i].label = nm[i]; sc.dots[i].size = 14; sc.dots[i].dy = i % 2 ? -13 : 15; });
          sc.lines.forEach(function (l, i) { var e = S.E[i]; if ((e[0] === 0 && e[1] === 2)) { l.color = COL.blue; l.w = 5; } if (e[0] === 3 && e[1] === 5) { l.color = COL.pink; l.w = 5; } });
          P.choice(box, {}, { id: 'sl-t3', prompt: '三角柱 ABC-DEF。<b>AB</b>（藍）與 <b>EF</b>（粉紅）的關係是？', row: true, options: [{ t: '平行', fb: 'AB 平行的是 DE（上下底面對應的邊），不是 EF。' }, { t: '相交', fb: '兩條線不在同一個面上，也沒有共同點。' }, { t: '歪斜', ok: true, fb: '對！不平行、也不相交，在不同的底面上。' }], onAnswer: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'solid-lines' }); } });
        }];
      function next() { P.later(function () { k++; qs[k](); }, 900); }
      qs[0](); api.lock('完成 3 題');
    },
    /* 6 完成 */
    function (st) {
      P.complete(st, {
        id: 'solid-lines', moduleName: '空間中的線與面', askAbout: '國中立體幾何', aha: '空間中的兩條線，除了平行與相交，<br>還有一種：歪斜。',
        cards: [{ text: '兩直線：平行、相交、歪斜；直線與平面：在面上、平行、相交（含垂直）；兩平面：平行或相交', src: '國中「立體圖形」（獵豹 J91S 立體圖形）' }, { text: '正方體：與一條稜歪斜的有 4 條；15 對面中 3 對平行、12 對垂直', src: '立體觀念的基礎，可延伸到歪斜線的夾角與距離' }],
        depth: { here: 0.2, cheetah: [{ at: 0.52, label: '歪斜線的夾角<br>與距離' }, { at: 0.9, label: '三垂線定理<br>二面角' }] },
        teasers: [
          { title: '歪斜線的夾角', q: '兩條歪斜線碰不到，怎麼算它們的夾角？（平移其中一條讓它們相交）', where: 'J91S 立體圖形（詳細堂次請洽老師）', lv: 'L2' },
          { title: '歪斜線的距離', q: '正方體中，AB 與 CG 兩條歪斜線之間最短距離是多少？怎麼找那條公垂線？', where: '數資班拓展（請洽老師）', lv: 'L3' },
          { title: '三垂線定理', q: '點到平面的垂足、垂線與斜線的關係，為什麼能一步判斷直角？', where: '高中立體幾何（請洽老師）', lv: 'L3' },
          { title: '二面角', q: '兩個相交平面的「夾角」怎麼量？正方體相鄰兩面是 90°，那正四面體呢？', where: '數資班拓展（請洽老師）', lv: 'L3' }],
        parent: { pitfall: '孩子容易把平面幾何的直覺帶進空間：以為「不平行就會相交」。歪斜是立體幾何才有的新關係，沒有操作過很難想像。', place: '國中立體圖形、高中空間向量與立體幾何的共同基礎。', ask: ['為什麼空間中的兩條線可能既不平行、也不相交？', '正方體裡，和一條稜歪斜的稜有幾條？', '正方體 6 個面，兩兩配對有幾對平行？'] },
        classes: ['J91S：立體圖形', 'J71S CH5：三視圖（立體觀察的先備）', 'PK3C：錐體與球體'],
        next: { href: 'play-solid-transform.html', text: '下一個：立體變換' } });
    }];
  new P.Lesson({ id: 'solid-lines', title: '空間中的線與面', steps: steps });
})();
