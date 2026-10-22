/* 獵豹玩中學｜時間軸統籌：同時進行
   預測＋把工作方塊拖進時間軸（機器在做的時候人去做別的事）→ 有先後順序的咖哩飯 → 煎魚（鍋子一次放 2 條）→ 3 個操作關卡（泡茶、四人過橋、煎 5 條魚）。 */
(function () {
  var P = Play, h = P.h, PA = window.PA;
  var X0 = 2.2, W = 11, COLS = { m: 'rgba(47,111,220,.55)', p: 'rgba(232,136,12,.62)', a: 'rgba(31,157,85,.55)', b: 'rgba(214,51,108,.5)' };

  /* 時間軸：tasks=[{id,label,dur,kind('m'|'p'|…),lanes:[可放的軌道],after:[id…]}]；每個方塊的把手在方塊中央，拖到想放的時間（整數分鐘）。
     cfg: {lanes:[名稱], best:[[t,lane]…]（看詳解用）, optimum, onChange(tl), onDone(tl)} */
  function makeTimeline(b, cfg) {
    var tasks = cfg.tasks, T = tasks.reduce(function (s, t) { return s + t.dur; }, 0), k = W / T, nl = cfg.lanes.length, top = 5.9, st = [], hds = [], gBg = h('g'), gB = h('g'), self = {}, fin = false, byId = {};
    b.gMid.append(gBg, gB); tasks.forEach(function (t, i) { byId[t.id] = i; });
    function LY(l) { return top - l * 2.2; }
    var t0 = 0; tasks.forEach(function (tk, i) { st[i] = { t: t0, lane: tk.lanes[0] }; t0 += tk.dur; });
    function cx(i) { return X0 + k * (st[i].t + tasks[i].dur / 2); }
    function maxEnd() { var m = 0; tasks.forEach(function (tk, i) { m = Math.max(m, st[i].t + tk.dur); }); return m; }
    function okAt(i, t, lane) {
      var d = tasks[i].dur, j;
      for (j = 0; j < tasks.length; j++) { if (j === i) continue; if (st[j].lane === lane && t < st[j].t + tasks[j].dur && st[j].t < t + d) return false; }
      for (j = 0; j < (tasks[i].after || []).length; j++) { var a = byId[tasks[i].after[j]]; if (t < st[a].t + tasks[a].dur) return false; }
      for (j = 0; j < tasks.length; j++) { if ((tasks[j].after || []).indexOf(tasks[i].id) >= 0 && st[j].t < t + d) return false; }
      return true;
    }
    function cands(i) { var out = [], tk = tasks[i]; tk.lanes.forEach(function (l) { for (var t = 0; t + tk.dur <= T; t++) out.push([X0 + k * (t + tk.dur / 2), LY(l)]); }); return out; }
    var step = T <= 8 ? 1 : T <= 20 ? 2 : T <= 40 ? 5 : 10, i, l;
    for (l = 0; l < nl; l++) { gBg.append(h('rect', { x: X0 - 0.05, y: b.Y(LY(l)) - 0.62, width: W + 0.1, height: 1.24, rx: 0.15, fill: l % 2 ? '#fbf6e6' : '#eef3fd', stroke: '#e2d8bd', 'stroke-width': 0.04 })); b.text([1.0, LY(l) - 0.18], cfg.lanes[l], 'pl-text pl-text--sm', gBg); }
    b.line([X0, 2.0], [X0 + W, 2.0], 'pl-line pl-line--thin', gBg);
    for (i = 0; i <= T; i += step) { gBg.append(h('line', { x1: X0 + k * i, y1: b.Y(2.0), x2: X0 + k * i, y2: b.Y(1.75), stroke: '#6d6250', 'stroke-width': 0.05 })); b.text([X0 + k * i, 1.0], '' + i, 'pl-text pl-text--sm', gBg); }
    b.text([1.0, 1.0], '分鐘', 'pl-text pl-text--sm pl-text--amber', gBg);
    var endLine = h('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#d6336c', 'stroke-width': 0.06, 'stroke-dasharray': '.2 .18' }); gBg.append(endLine);
    function draw() {
      gB.innerHTML = '';
      tasks.forEach(function (tk, i) {
        var x = X0 + k * st[i].t, y = LY(st[i].lane);
        gB.append(h('rect', { x: x + 0.03, y: b.Y(y) - 0.5, width: Math.max(0.1, k * tk.dur - 0.06), height: 1.0, rx: 0.14, fill: COLS[tk.kind || 'p'], stroke: '#fff', 'stroke-width': 0.05, style: 'pointer-events:none' }));
        var lab = tk.s && k * tk.dur < tk.label.length * 0.5 + 0.2 ? tk.s : tk.label; b.text([x + k * tk.dur / 2, y + 0.95], lab, 'pl-text pl-text--sm', gB);
      });
      var e = maxEnd(); endLine.setAttribute('x1', X0 + k * e); endLine.setAttribute('x2', X0 + k * e); endLine.setAttribute('y1', b.Y(LY(0) + 0.8)); endLine.setAttribute('y2', b.Y(2.0));
      if (cfg.onChange) cfg.onChange(self, e);
      if (e === cfg.optimum && !fin) { fin = true; if (cfg.onDone) cfg.onDone(self, e); }
    }
    tasks.forEach(function (tk, i) {
      var hd = b.handle({ pos: [cx(i), LY(st[i].lane)], candidates: function () { return cands(i); }, cls: tk.kind === 'm' ? 'is-blue' : '',
        valid: function (p) { var tt = Math.round((p[0] - X0) / k - tk.dur / 2), ln = 0; for (var q = 0; q < nl; q++) if (Math.abs(LY(q) - p[1]) < 0.01) ln = q; return okAt(i, tt, ln); },
        onMove: function (p) { var tt = Math.round((p[0] - X0) / k - tk.dur / 2), ln = 0; for (var q = 0; q < nl; q++) if (Math.abs(LY(q) - p[1]) < 0.01) ln = q; st[i] = { t: tt, lane: ln }; draw(); } });
      hds.push(hd);
    });
    self.T = T; self.maxEnd = maxEnd; self.finished = function () { return fin; };
    self.setAll = function (arr) { arr.forEach(function (a, i) { st[i] = { t: a[0], lane: a[1] }; hds[i].set([cx(i), LY(a[1])]); }); draw(); };
    draw(); return self;
  }

  function timelineTask(cfg) {
    return function (host, done, setSolve) {
      host.append(h('div', { class: 'pl-q', html: cfg.prompt }));
      var b = PA.board(host, 14, 8, 'pl-svg--sm'), seq = cfg.tasks.reduce(function (s, t) { return s + t.dur; }, 0), pA = P.pill('一件一件做：' + seq + ' 分鐘', 'is-amber'), pB = P.pill('', 'is-blue'), tl;
      host.append(h('div', { class: 'pl-readout' }, pA, pB));
      tl = makeTimeline(b, Object.assign({ onChange: function (t, e) { pB.textContent = '你排的：' + e + ' 分鐘'; pB.className = 'pl-pill ' + (e === cfg.optimum ? 'is-ok' : 'is-blue'); }, onDone: function () { P.toast('最快 ' + cfg.optimum + ' 分鐘：' + cfg.msg); done(); } }, cfg));
      setSolve(function () { tl.setAll(cfg.best); }); host.append(P.hint(cfg.hint));
    };
  }

  /* 四人過橋：點人選（最多 2 個），按「過橋」；時間取較慢的那位 */
  function bridgeTask(host, done, setSolve) {
    host.append(h('div', { class: 'pl-q', html: '四個人要過一座橋，天黑了，只有<b>一支手電筒</b>，橋<b>一次最多 2 人</b>，而且要有人把手電筒送回來。兩人一起走，<b>要等比較慢的那位</b>。想辦法讓全部人最快過橋。' }));
    var PPL = [{ n: '丁丁', m: 1 }, { n: '迪西', m: 2 }, { n: '拉拉', m: 5 }, { n: '小波', m: 10 }], side = [0, 0, 0, 0], torch = 0, sel = {}, time = 0, fin = false, log = [];
    var b = PA.board(host, 12, 7, 'pl-svg--sm'), g = h('g'), pT = P.pill('', 'is-amber'), pS = P.pill('', ''), btn = h('button', { type: 'button', class: 'button button--primary pl-small' }, '過橋 →'), msg = h('div', { class: 'pl-caption' });
    b.gMid.append(g); host.append(h('div', { class: 'pl-readout' }, pT, pS), h('div', { class: 'pl-row pl-row--center' }, btn, (function () { var r = h('button', { type: 'button', class: 'button button--secondary pl-small' }, '重來'); r.addEventListener('click', function () { if (!fin) reset(); }); return r; })()), msg);
    function cnt() { return Object.keys(sel).filter(function (k) { return sel[k]; }); }
    function draw() {
      g.innerHTML = ''; var i, pos = { 0: 0, 1: 0 };
      g.append(h('rect', { x: 0.2, y: b.Y(6.4), width: 3.9, height: 5.4, rx: 0.3, fill: torch === 0 ? '#fff6dc' : '#fbf6e6', stroke: torch === 0 ? '#d29b1f' : '#e2d8bd', 'stroke-width': 0.08 }), h('rect', { x: 4.1, y: b.Y(6.4), width: 3.8, height: 5.4, fill: '#e6efff' }), h('rect', { x: 7.9, y: b.Y(6.4), width: 3.9, height: 5.4, rx: 0.3, fill: torch === 1 ? '#fff6dc' : '#fbf6e6', stroke: torch === 1 ? '#d29b1f' : '#e2d8bd', 'stroke-width': 0.08 }));
      b.text([2.15, 0.35], torch === 0 ? '手電筒在這邊' : '出發的岸', 'pl-text pl-text--sm pl-text--amber', g); b.text([9.85, 0.35], torch === 1 ? '手電筒在這邊' : '要到達的岸', 'pl-text pl-text--sm pl-text--amber', g); b.text([6, 3.4], '橋', 'pl-text pl-text--sm pl-text--blue', g);
      PPL.forEach(function (p, i) {
        var s = side[i], x = (s === 0 ? 1.2 : 8.9) + (pos[s] % 2) * 1.9, y = 5.0 - Math.floor(pos[s] / 2) * 2.2; pos[s]++;
        var c = h('g', { style: 'cursor:pointer' }, h('circle', { cx: x, cy: b.Y(y), r: 0.62, fill: sel[i] ? '#5fe3b4' : '#fff', stroke: sel[i] ? '#1f9d55' : '#122548', 'stroke-width': 0.09 }));
        c.addEventListener('click', function () { tap(i); }); g.append(c); b.text([x, y - 0.17], '' + p.m, 'pl-text', g); b.text([x, y - 1.15], p.n, 'pl-text pl-text--sm', g);
      });
      var sc = cnt().length; btn.textContent = torch === 0 ? '過橋 →' : '← 回去送手電筒'; btn.disabled = !(sc >= 1 && sc <= 2) || fin;
      pT.textContent = '已用 ' + time + ' 分鐘'; pS.textContent = fin ? '全部到達' : '手電筒在' + (torch === 0 ? '左' : '右') + '岸，選 1～2 人';
    }
    function tap(i) { if (fin) return; if (side[i] !== torch) { P.toast('手電筒不在這一邊'); return; } if (sel[i]) sel[i] = false; else { if (cnt().length >= 2) { P.toast('橋一次最多 2 人'); return; } sel[i] = true; } draw(); }
    function cross() {
      var ids = cnt(); if (ids.length < 1 || ids.length > 2) return; var m = Math.max.apply(null, ids.map(function (k) { return PPL[k].m; }));
      ids.forEach(function (k) { side[k] = 1 - side[k]; }); torch = 1 - torch; time += m; log.push(ids.map(function (k) { return PPL[k].n; }).join('＋') + ' ' + (torch ? '→' : '←') + ' ' + m); sel = {};
      var all = side.every(function (s) { return s === 1; });
      if (all) { fin = true; if (time === 17) { P.toast('17 分鐘，最快了！'); msg.textContent = log.join('；'); draw(); done(); return; } msg.innerHTML = '花了 <b>' + time + '</b> 分鐘，全部過橋了。還能更快嗎？按「重來」再試。'; fin = false; sel = {}; reset(true); return; }
      msg.textContent = log.join('；'); draw();
    }
    function reset(keepMsg) { side = [0, 0, 0, 0]; torch = 0; sel = {}; time = 0; log = []; if (!keepMsg) msg.textContent = ''; draw(); }
    btn.addEventListener('click', cross);
    setSolve(function () { reset(); [[0, 1], [0], [2, 3], [1], [0, 1]].forEach(function (ids) { sel = {}; ids.forEach(function (k) { sel[k] = true; }); cross(); }); });
    draw(); host.append(P.hint('旁邊的數字是每個人過橋要幾分鐘。想一想：誰最適合送手電筒回來？'));
  }

  var LANES2 = ['機器', '人'];
  var steps = [
    /* 1. 預測＋洗衣機同時進行 */
    function (st, api) {
      var gate = { on: true }, done = false, tl;
      P.choice(st, api, { id: 'ta-p1', predict: true, label: '先猜猜看', prompt: '洗衣機洗衣服要 <b>30 分鐘</b>（機器自己洗）。洗衣的時候，我還要<b>掃地 12 分鐘</b>、<b>擦桌子 8 分鐘</b>。全部做完，最少要幾分鐘？', row: true, options: [{ t: '20 分鐘' }, { t: '30 分鐘' }, { t: '50 分鐘' }], onAnswer: function (i) { api.ctx.p1 = i; gate.on = false; api.lock('把「掃地」「擦桌子」拖到洗衣的時間裡'); } });
      var b = PA.board(st, 14, 8), pA = P.pill('一件一件做：50 分鐘', 'is-amber'), pB = P.pill('', 'is-blue'); st.append(h('div', { class: 'pl-readout' }, pA, pB));
      tl = makeTimeline(b, { lanes: ['機器', '人'], tasks: [{ id: 'w', label: '洗衣 30', dur: 30, kind: 'm', lanes: [0] }, { id: 's', label: '掃地 12', dur: 12, lanes: [1] }, { id: 'q', label: '擦桌 8', s: '擦桌', dur: 8, lanes: [1] }], best: [[0, 0], [0, 1], [12, 1]], optimum: 30,
        onChange: function (t, e) { if (gate.on && e !== 50) { P.toast('先做上面的預測'); t.setAll([[0, 0], [30, 1], [42, 1]]); return; } pB.textContent = '你排的：' + e + ' 分鐘'; pB.className = 'pl-pill ' + (e === 30 ? 'is-ok' : 'is-blue'); },
        onDone: function () { if (done) return; done = true; P.track('aha', { id: 'time-axis', step: 1 }); P.toast(api.ctx.p1 === 1 ? '你猜對了！30 分鐘' : '最少 30 分鐘'); st.append(P.ruleBox('洗衣機自己洗的時候，<b>人不用一直盯著</b>，可以同時去掃地、擦桌子（12 ＋ 8 ＝ 20，沒超過 30）。<br>所以總時間只要 <b>30 分鐘</b>，比一件一件做（50 分鐘）少了 20 分鐘。', '同時進行')); api.unlock('同時進行，更省時間'); } });
      api.solve(function () { gate.on = false; tl.setAll([[0, 0], [0, 1], [12, 1]]); });
      st.append(P.hint('藍色是機器自己做、橘色是人要動手。藍色方塊在跑的時候，橘色方塊可以排在同一段時間。人自己的兩件事不能重疊。')); api.lock('先做上面的預測');
    },
    /* 2. 有先後順序：咖哩飯 */
    function (st, api) {
      st.append(P.instr('做咖哩飯：有些事<b>一定要先做完才能做下一件</b>。把方塊拖到最適合的時間，讓全部<b>最快做完</b>。'));
      var done = false, b = PA.board(st, 14, 8), pA = P.pill('一件一件做：37 分鐘', 'is-amber'), pB = P.pill('', 'is-blue'); st.append(h('div', { class: 'pl-readout' }, pA, pB));
      var tl = makeTimeline(b, { lanes: LANES2, tasks: [{ id: 'r', label: '煮飯 20', dur: 20, kind: 'm', lanes: [0] }, { id: 'w', label: '洗菜 5', s: '洗菜', dur: 5, lanes: [1] }, { id: 'c', label: '切菜 4', s: '切菜', dur: 4, lanes: [1], after: ['w'] }, { id: 'f', label: '炒料 6', s: '炒料', dur: 6, lanes: [1], after: ['c'] }, { id: 'p', label: '盛盤 2', s: '盤', dur: 2, lanes: [1], after: ['r', 'f'] }], best: [[0, 0], [0, 1], [5, 1], [9, 1], [20, 1]], optimum: 22,
        onChange: function (t, e) { pB.textContent = '你排的：' + e + ' 分鐘'; pB.className = 'pl-pill ' + (e === 22 ? 'is-ok' : 'is-blue'); },
        onDone: function () { if (done) return; done = true; P.track('aha', { id: 'time-axis', step: 2 }); st.append(P.ruleBox('洗菜 → 切菜 → 炒料要<b>一件接一件</b>（共 15 分鐘），電鍋同時煮飯 20 分鐘；最後飯和料都好了才能盛盤（2 分鐘）。<br>全部 <b>20 ＋ 2 ＝ 22 分鐘</b>：<b>最長的那條接力線，決定總時間</b>。', '最長的路線')); api.unlock('最長的那一串決定總時間'); } });
      api.solve(function () { tl.setAll([[0, 0], [0, 1], [5, 1], [9, 1], [20, 1]]); });
      st.append(P.hint('順序：洗菜 → 切菜 → 炒料；飯和炒料都好了才能盛盤（盤＝盛盤 2 分鐘）。排錯順序的方塊拖不過去。')); api.lock('排出最快的 22 分鐘');
    },
    /* 3. 換外觀：煎魚 */
    function (st, api) {
      st.append(P.instr('平底鍋一次可以放 <b>2 條</b>魚，每條魚<b>正面、反面各煎 1 分鐘</b>（先正後反）。煎 <b>3 條魚</b>，最少幾分鐘？把方塊排進兩個鍋位。'));
      var done = false, b = PA.board(st, 14, 8), pA = P.pill('一條一條煎：6 分鐘', 'is-amber'), pB = P.pill('', 'is-blue'); st.append(h('div', { class: 'pl-readout' }, pA, pB));
      var tl = makeTimeline(b, { lanes: ['鍋位 1', '鍋位 2'], tasks: [{ id: 'a1', label: '1正', dur: 1, kind: 'a', lanes: [0, 1] }, { id: 'b1', label: '1反', dur: 1, kind: 'b', lanes: [0, 1], after: ['a1'] }, { id: 'a2', label: '2正', dur: 1, kind: 'a', lanes: [0, 1] }, { id: 'b2', label: '2反', dur: 1, kind: 'b', lanes: [0, 1], after: ['a2'] }, { id: 'a3', label: '3正', dur: 1, kind: 'a', lanes: [0, 1] }, { id: 'b3', label: '3反', dur: 1, kind: 'b', lanes: [0, 1], after: ['a3'] }], best: [[0, 0], [1, 1], [0, 1], [2, 0], [1, 0], [2, 1]], optimum: 3,
        onChange: function (t, e) { pB.textContent = '你排的：' + e + ' 分鐘'; pB.className = 'pl-pill ' + (e === 3 ? 'is-ok' : 'is-blue'); },
        onDone: function () { if (done) return; done = true; P.track('aha', { id: 'time-axis', step: 3 }); st.append(P.ruleBox('3 條魚共有 <b>6 個面</b>，鍋子一次煎 2 面，所以最少 <b>6 ÷ 2 ＝ 3 分鐘</b>。<br>關鍵是<b>鍋子不要空著</b>：第 3 條魚的正面，可以和第 1 條魚的反面一起煎。', '不要讓鍋子空著')); api.unlock('鍋子一直滿著，最快'); } });
      api.solve(function () { tl.setAll([[0, 0], [1, 1], [0, 1], [2, 0], [1, 0], [2, 1]]); });
      st.append(P.hint('「1反」一定要排在「1正」後面。每一分鐘兩個鍋位都放滿，就是最快。')); api.lock('排出最快的 3 分鐘');
    },
    /* 4. 操作關卡 */
    function (st, api) {
      var box = h('div', {}); st.append(box);
      var tasks = [
        timelineTask({ prompt: '泡一壺茶：<b>燒開水 8 分鐘</b>（水壺自己燒）、洗茶壺 1、洗茶杯 1、拿茶葉 1；<b>水燒開了才能泡茶</b>（泡茶 1 分鐘，要在其他事都做完後）。排出最快的時間。', lanes: ['水壺', '人'], tasks: [{ id: 'b', label: '燒水 8', dur: 8, kind: 'm', lanes: [0] }, { id: 'w1', label: '洗壺 1', s: '壺', dur: 1, lanes: [1] }, { id: 'w2', label: '洗杯 1', s: '杯', dur: 1, lanes: [1] }, { id: 'l', label: '茶葉 1', s: '葉', dur: 1, lanes: [1] }, { id: 't', label: '泡茶 1', s: '泡', dur: 1, lanes: [1], after: ['b', 'w1', 'w2', 'l'] }], best: [[0, 0], [0, 1], [1, 1], [2, 1], [8, 1]], optimum: 9, msg: '燒水的時候把別的事做完', hint: '壺＝洗茶壺、杯＝洗茶杯、葉＝拿茶葉、泡＝泡茶（各 1 分鐘）。燒水的 8 分鐘，人有空嗎？' }),
        bridgeTask,
        timelineTask({ prompt: '煎 <b>5 條魚</b>：鍋子一次放 2 條，每條正面、反面各煎 1 分鐘（先正後反）。排出最快的時間。', lanes: ['鍋位 1', '鍋位 2'], tasks: [1, 2, 3, 4, 5].reduce(function (a, i) { a.push({ id: 'a' + i, label: i + '正', dur: 1, kind: 'a', lanes: [0, 1] }, { id: 'b' + i, label: i + '反', dur: 1, kind: 'b', lanes: [0, 1], after: ['a' + i] }); return a; }, []), best: [[0, 0], [1, 1], [0, 1], [2, 0], [1, 0], [3, 0], [2, 1], [4, 0], [3, 1], [4, 1]], optimum: 5, msg: '10 個面 ÷ 2 ＝ 5', hint: '總共幾個面？鍋子一次煎幾個面？' })];
      P.taskSeq(box, api, tasks, { lock: '完成 3 個關卡', onDone: function () { api.unlock('全部完成！'); P.track('transfer_ok', { id: 'time-axis' }); } });
    },
    /* 5. 完成 */
    function (st) {
      P.complete(st, {
        id: 'time-axis', moduleName: '時間軸統籌：同時進行', askAbout: '小學統籌與合理安排（合理下料）', aha: '機器在做的時候，人可以做別的事；<br>讓大家都不要閒著，總時間才會最短。',
        cards: [{ text: '同時進行：機器自己做的時間，人可以去做別的事；總時間由「最長的那一串」決定', src: '小學「統籌」（合理安排時間）' }, { text: '鍋子一次煎 2 面：n 條魚共 2n 面，最少 2n ÷ 2 ＝ n 分鐘（n ≥ 2）', src: '統籌問題（煎魚）' }],
        depth: { here: 0.15, cheetah: [{ at: 0.42, label: '合理下料<br>最短時間排程' }, { at: 0.85, label: '最佳化<br>資源分配' }] },
        teasers: [
          { title: '四人過橋：為什麼不是 19？', q: '1、2、5、10 分鐘的四個人過橋，最快 17 分鐘。為什麼要先讓兩個最慢的人一起走？推廣到更多人還成立嗎？', where: 'PK1A 2607 第 1 堂：合理下料（例題 4）', lv: 'L2' },
          { title: '買票與運費怎麼最省？', q: '遊樂園單人票 10 元、團體票 80 元（限 10 人），35 位學生，怎麼買最便宜？統籌法也能用在花錢上。', where: 'PK1A 2607 第 1 堂：合理下料（例題 3）；PI1A 2507 第 4 堂', lv: 'L2' },
          { title: '統籌法與運籌學', q: '工廠、物流怎麼排班才不浪費？華羅庚的「統籌法」想解決什麼問題？', where: 'PK1A 2607 第 1 堂：合理下料（Cogitation）', lv: 'L3' }],
        parent: { pitfall: '孩子常把所有時間「一件一件加起來」，沒想到機器在跑的時候人是空的。也常忽略先後順序（要先洗菜才能切菜），排出不可能的方案。', place: '小學三年級的「統籌」入門，第一次把生活中的時間排程變成數學問題。', ask: ['洗衣機在洗衣服的時候，你可以做哪些事？', '3 條魚為什麼不是 4 分鐘？', '哪一串工作決定了總共要花多久？'] },
        classes: ['PK1A（2607 第 1 堂）：合理下料', 'PI1A（2507 第 4 堂）：合理下料'], next: { href: 'play-fraction-split.html', text: '下一個：分數：平分才是 1/n' } });
    }];
  new P.Lesson({ id: 'time-axis', title: '時間軸統籌：同時進行', steps: steps });
})();
