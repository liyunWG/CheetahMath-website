/* 獵豹玩中學｜各種角度觀察：題庫與規則（純函式，瀏覽器是 window.SolidViewsBank，Node 是 module.exports，供驗證腳本使用）
   座標：H[i][j]＝第 i 欄（由左到右）、第 j 列（由前到後）疊了幾塊（0～3）。
   視圖（0/1 陣列）：front＝由前面看，列由上到下、欄由左到右；top＝由上往下看，列由後到前、欄由左到右；
   right＝由右邊看，列由上到下、欄由前到後（前面在左邊）。
   所有答案都由程式窮舉（每格 0～3 塊，共 4⁹＝262,144 種堆法）算出，不手寫。 */
(function (root) {
  'use strict';
  var N = 3, MAXH = 3;
  function zeros() { var H = []; for (var i = 0; i < N; i++) H.push([0, 0, 0]); return H; }
  function copy(H) { return H.map(function (r) { return r.slice(); }); }
  function sum(H) { var s = 0; H.forEach(function (r) { r.forEach(function (v) { s += v; }); }); return s; }
  function squares(g) { var n = 0; g.forEach(function (r) { r.forEach(function (v) { n += v; }); }); return n; }
  function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function viewsOf(H) {
    var f = [], t = [], r = [], k, i, j;
    for (k = MAXH - 1; k >= 0; k--) { var rf = [], rr = []; for (i = 0; i < N; i++) { var a = 0; for (j = 0; j < N; j++) if (H[i][j] > k) a = 1; rf.push(a); } for (j = 0; j < N; j++) { var b = 0; for (i = 0; i < N; i++) if (H[i][j] > k) b = 1; rr.push(b); } f.push(rf); r.push(rr); }
    for (j = N - 1; j >= 0; j--) { var rt = []; for (i = 0; i < N; i++) rt.push(H[i][j] > 0 ? 1 : 0); t.push(rt); }
    return { front: f, top: t, right: r };
  }
  /* 每欄／每列需要的最高高度（由前視圖、右視圖的格子讀出） */
  function colMax(g, c) { var m = 0; g.forEach(function (row, ri) { if (row[c]) m = Math.max(m, MAXH - ri); }); return m; }
  /* 窮舉：符合 target 裡「有給的」視圖（front、top、right 任選）的所有堆法 */
  function solve(tg) {
    var out = [], H = zeros(), Fm = tg.front ? [0, 1, 2].map(function (i) { return colMax(tg.front, i); }) : null, Rm = tg.right ? [0, 1, 2].map(function (j) { return colMax(tg.right, j); }) : null;
    (function go(k) {
      if (k === 9) { var v = viewsOf(H); if ((tg.front && !eq(v.front, tg.front)) || (tg.top && !eq(v.top, tg.top)) || (tg.right && !eq(v.right, tg.right))) return; out.push(copy(H)); return; }
      var i = Math.floor(k / 3), j = k % 3, lo = 0, hi = MAXH;
      if (Fm) hi = Math.min(hi, Fm[i]); if (Rm) hi = Math.min(hi, Rm[j]);
      if (tg.top) { if (tg.top[N - 1 - j][i]) lo = 1; else hi = 0; }
      for (var v2 = lo; v2 <= hi; v2++) { H[i][j] = v2; go(k + 1); } H[i][j] = 0;
    })(0);
    return out;
  }
  function stats(sols) { var mn = 1e9, mx = -1; sols.forEach(function (h) { var s = sum(h); mn = Math.min(mn, s); mx = Math.max(mx, s); }); return { count: sols.length, min: mn, max: mx }; }
  function footprint(H) { return squares(viewsOf(H).top); }
  function planOf(H) { var p = []; for (var r = 0; r < N; r++) { var row = []; for (var c = 0; c < N; c++) row.push(H[c][N - 1 - r]); p.push(row); } return p; }
  function flipLR(g) { return g.map(function (r) { return r.slice().reverse(); }); }
  function flipUD(g) { return g.slice().reverse().map(function (r) { return r.slice(); }); }
  function shuffle(a, rng) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------------------------------------------------------------- 題目用的積木堆（固定，答案全部由程式算） */
  var S = {
    frontQ: [[2, 0, 1], [0, 3, 0], [1, 0, 2]],               // 前視圖有幾個正方形
    top5: [[3, 1, 0], [0, 2, 2], [1, 0, 0]],                // 俯視圖 5 格、共 9 塊
    right7: [[2, 1, 0], [0, 3, 1], [1, 0, 2]],               // 右視圖
    front6: [[1, 0, 0], [3, 1, 0], [0, 2, 2]],               // 前視圖（左右不對稱）
    plan4: [[1, 2, 0], [0, 1, 3], [2, 0, 1]],                // 由視圖選立體
    hide: [[3, 0, 1], [1, 2, 0], [0, 1, 2]],                 // 被擋住的方塊
    missing: [[2, 0, 0], [2, 0, 1], [0, 0, 2]],              // 補缺的視圖（前＋上 → 右唯一）
    ambA: [[0, 0, 1], [0, 1, 3], [0, 2, 0]],                 // 只給前＋右：6～11 塊
    ambC: [[3, 0, 2], [0, 0, 2], [0, 0, 3]],                 // 只給前＋右：8～16 塊
    uniq: [[0, 1, 0], [0, 0, 1], [0, 2, 3]],                 // 三視圖只有唯一堆法
    count: [[1, 3, 2], [0, 1, 2], [0, 1, 0]]                 // 三視圖共 5 種堆法
  };
  var STEP1 = [[2, 1, 0], [1, 1, 2], [0, 0, 1]];                                  // 第 1 步示範用（8 塊、俯視 6 格）
  var PUZ = [[[1, 0, 0], [2, 1, 0], [1, 1, 2]], [[2, 0, 1], [0, 1, 0], [1, 0, 3]], [[1, 2, 0], [0, 3, 1], [2, 0, 1]]];   // 第 2 步：由三視圖搭積木（三題擇一）
  function fromFR(F, R) { var f = [], r = []; for (var k = MAXH - 1; k >= 0; k--) { f.push(F.map(function (x) { return x > k ? 1 : 0; })); r.push(R.map(function (x) { return x > k ? 1 : 0; })); } return { front: f, right: r }; }
  var STEP3 = { F: [2, 3, 1], R: [3, 1, 2] };                                     // 第 3 步：只給前＋右，找最少／最多
  var CAP = { front: '前視圖', top: '上視圖', right: '右視圖' };

  function gridOpts(correct, cands, rng, extra) {
    var out = [{ grid: correct, ok: true }], seen = [JSON.stringify(correct)];
    cands.forEach(function (g) { var k = JSON.stringify(g); if (out.length < 3 && seen.indexOf(k) < 0) { seen.push(k); out.push({ grid: g, ok: false }); } });
    return shuffle(out, rng);
  }
  function planOpts(H, rng) {
    var tv = viewsOf(H), cands = [], i, j, out = [{ plan: planOf(H), ok: true }], seen = [JSON.stringify(planOf(H))];
    function differs(G) { var v = viewsOf(G); return !(eq(v.front, tv.front) && eq(v.top, tv.top) && eq(v.right, tv.right)); }
    var flip = copy(H).reverse(); cands.push(flip);
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) { [1, -1].forEach(function (d) { var G = copy(H); G[i][j] += d; if (G[i][j] >= 0 && G[i][j] <= MAXH) cands.push(G); }); }
    cands.forEach(function (G) { var k = JSON.stringify(planOf(G)); if (out.length < 3 && seen.indexOf(k) < 0 && differs(G)) { seen.push(k); out.push({ plan: planOf(G), ok: false }); } });
    return shuffle(out, rng);
  }

  /* 題目清單。回傳 {basic:[…], challenge:[…]}；每題 {id, kind:'num'|'choice', stack?, show:[視圖名…]（題圖顯示哪些視圖小圖）, prompt, answer|options, unit, explain, truth}
     選項的位置每次都用 rng 重新打亂；題目順序固定（由淺到深）。truth＝驗證腳本用的原始資料（不顯示給學生） */
  function yn(rng, uniqueOk, fbU, fbN) { return shuffle([{ t: '唯一，只有一種堆法', ok: uniqueOk, fb: fbU }, { t: '不唯一，有很多種堆法', ok: !uniqueOk, fb: fbN }], rng); }
  function build(rng) {
    rng = rng || Math.random; var Q = { basic: [], challenge: [] }, v, st, vv;
    // 基礎 1：前視圖有幾個正方形
    v = viewsOf(S.frontQ); Q.basic.push({ id: 'b1', kind: 'num', stack: S.frontQ, prompt: '這堆積木共 <b>' + sum(S.frontQ) + ' 塊</b>。從<b>正前方</b>看（前視圖），會看到幾個正方形？（按「前視」確認）', answer: squares(v.front), unit: '個', explain: '前視圖每一欄看最高的那一疊：左欄 ' + colMax(v.front, 0) + '、中欄 ' + colMax(v.front, 1) + '、右欄 ' + colMax(v.front, 2) + '，共 ' + squares(v.front) + ' 個（比 ' + sum(S.frontQ) + ' 塊少，後面的被前面擋住）。', truth: { type: 'frontSquares', H: S.frontQ } });
    // 基礎 2：俯視圖有幾個正方形
    v = viewsOf(S.top5); Q.basic.push({ id: 'b2', kind: 'num', stack: S.top5, prompt: '這堆積木共 <b>' + sum(S.top5) + ' 塊</b>。從<b>正上方</b>往下看（俯視圖），會看到幾個正方形？（按「上視」確認）', answer: squares(v.top), unit: '個', explain: '俯視圖看的是「哪些格子有積木」，不管疊幾層：有積木的格子共 ' + squares(v.top) + ' 格，所以是 ' + squares(v.top) + ' 個正方形（比 ' + sum(S.top5) + ' 塊少，因為疊高的被擋住了）。', truth: { type: 'topSquares', H: S.top5 } });
    // 基礎 3：右視圖幾個正方形
    v = viewsOf(S.right7); Q.basic.push({ id: 'b3', kind: 'num', stack: S.right7, prompt: '這堆積木的<b>右視圖</b>有幾個正方形？（按「右視」看）', answer: squares(v.right), unit: '個', explain: '右視圖由前到後，每一欄看最高的那一疊：高度 ' + [0, 1, 2].map(function (j) { return Math.max(S.right7[0][j], S.right7[1][j], S.right7[2][j]); }).join('、') + '，共 ' + squares(v.right) + ' 個。', truth: { type: 'rightSquares', H: S.right7 } });
    // 基礎 4：被擋住的方塊
    v = viewsOf(S.hide); var hid = sum(S.hide) - footprint(S.hide); Q.basic.push({ id: 'b4', kind: 'num', stack: S.hide, prompt: '這堆積木共 <b>' + sum(S.hide) + ' 塊</b>。從<b>正上方</b>看，被擋住（看不到）的方塊有幾塊？', answer: hid, unit: '塊', explain: '正上方只看得到每一疊最上面那一塊，共 ' + footprint(S.hide) + ' 塊；其餘 ' + sum(S.hide) + ' − ' + footprint(S.hide) + ' ＝ ' + hid + ' 塊被擋住。', truth: { type: 'hiddenTop', H: S.hide } });
    // 基礎 5：由立體選前視圖
    v = viewsOf(S.front6); st = gridOpts(v.front, [flipLR(v.front), v.right, v.top, flipUD(v.front)], rng);
    Q.basic.push({ id: 'b5', kind: 'choice', stack: S.front6, prompt: '這堆積木的<b>前視圖</b>（從前面看）是哪一個？（按「前視」看）', options: st.map(function (o) { return { grid: o.grid, ok: o.ok, fb: o.ok ? '對！每一欄取最高的那一疊，左欄 ' + colMax(v.front, 0) + '、中欄 ' + colMax(v.front, 1) + '、右欄 ' + colMax(v.front, 2) + '。' : '再看一次：前視圖的左邊對應積木的左邊，每一欄看最高的那一疊。' }; }), truth: { type: 'frontChoice', H: S.front6 } });
    // 基礎 6：由三視圖選立體（選項是「俯視格數字」）
    v = viewsOf(S.plan4); Q.basic.push({ id: 'b6', kind: 'choice', show: ['front', 'top', 'right'], prompt: '這是某堆積木的三視圖。哪一個「俯視格數字」（每格的方塊數，上＝後面）是它？', options: planOpts(S.plan4, rng).map(function (o) { return { plan: o.plan, ok: o.ok, fb: o.ok ? '對！這個堆法的前、上、右視圖都和題目一樣。' : '這個堆法的三視圖有一張和題目不一樣（試著把它的前、上、右視圖畫出來比一比）。' }; }), truth: { type: 'planChoice', H: S.plan4 } });
    // 挑戰 1：補上缺的視圖（前＋上 → 右）
    v = viewsOf(S.missing); var ft = solve({ front: v.front, top: v.top });
    st = gridOpts(v.right, [flipLR(v.right), v.front, v.top, flipUD(v.right)], rng);
    Q.challenge.push({ id: 'c1', kind: 'choice', show: ['front', 'top'], prompt: '只給<b>前視圖</b>和<b>上視圖</b>。缺的<b>右視圖</b>是哪一個？（用前、上視圖的欄高與格子推出來）', options: st.map(function (o) { return { grid: o.grid, ok: o.ok, fb: o.ok ? '對！前視圖決定每一欄最高有多高，上視圖決定哪些格有積木，合起來右視圖只剩這一種（共 ' + ft.length + ' 種堆法，右視圖都一樣）。' : '這個右視圖和前、上視圖推出來的不一樣。' }; }), truth: { type: 'missingRight', H: S.missing } });
    // 挑戰 2、3：前＋右 的最少／最多（ambA）
    function mm(key, id, kind) {
      var H = S[key], vv2 = viewsOf(H), sol = solve({ front: vv2.front, right: vv2.right }), s = stats(sol), isMin = kind === 'min';
      return { id: id, kind: 'num', show: ['front', 'right'], prompt: '只知道<b>前視圖</b>和<b>右視圖</b>（格子最多疊 3 塊），這堆積木<b>最' + (isMin ? '少' : '多') + '</b>要幾塊？', answer: isMin ? s.min : s.max, unit: '塊', explain: isMin ? '最少：只在必要的格子放，讓前視圖每一欄、右視圖每一列要求的高度剛好被某一格達到，而且一格可以同時滿足兩邊 → ' + s.min + ' 塊。（所有 ' + s.count + ' 種堆法中最少）' : '最多：每一格都放到「該欄與該列要求高度的較小值」，只要不讓兩張視圖多出格子 → ' + s.max + ' 塊。（所有 ' + s.count + ' 種堆法中最多）', truth: { type: kind, H: H } };
    }
    Q.challenge.push(mm('ambA', 'c2', 'min'), mm('ambA', 'c3', 'max'));
    // 挑戰 4：只給兩張視圖，立體唯一嗎？  挑戰 5：三張視圖呢？
    vv = viewsOf(S.ambA); var sA = solve({ front: vv.front, right: vv.right }), uu = viewsOf(S.uniq), sU = solve({ front: uu.front, top: uu.top, right: uu.right });
    Q.challenge.push({ id: 'c4', kind: 'choice', show: ['front', 'right'], prompt: '只給<b>前視圖</b>和<b>右視圖</b>。積木堆是<b>唯一</b>的嗎？', options: yn(rng, sA.length === 1, '不是喔：同樣的前、右視圖，上視圖（哪些格有積木）還可以不一樣。', '對！共 ' + sA.length + ' 種堆法（' + stats(sA).min + ' 到 ' + stats(sA).max + ' 塊）。只有兩張視圖，上視圖的位置還有很多選擇。'), truth: { type: 'unique2', H: S.ambA } });
    Q.challenge.push({ id: 'c5', kind: 'choice', show: ['front', 'top', 'right'], prompt: '給了<b>前、上、右三張視圖</b>。積木堆是<b>唯一</b>的嗎？', options: yn(rng, sU.length === 1, '對！三張視圖互相限制，這一題只剩一種堆法。', '這一題三張視圖剛好把每一疊的高度都鎖死了，只有 1 種堆法。'), truth: { type: 'unique3', H: S.uniq } });
    // 挑戰 6、7：最少／最多（ambC，視圖與前面不同）
    Q.challenge.push(mm('ambC', 'c6', 'min'), mm('ambC', 'c7', 'max'));
    // 挑戰 8：三視圖的堆法有幾種
    var cv = viewsOf(S.count), call = solve({ front: cv.front, top: cv.top, right: cv.right });
    Q.challenge.push({ id: 'c8', kind: 'num', show: ['front', 'top', 'right'], prompt: '給了前、上、右三張視圖。符合的積木堆法<b>一共有幾種</b>？（高度不同就算不同堆法）', answer: call.length, unit: '種', explain: '上視圖決定哪些格有積木；前視圖、右視圖限制每欄每列的最高高度，其中有幾格的高度可以自由選，一共 ' + call.length + ' 種（用窮舉列出全部）。', truth: { type: 'count3', H: S.count } });
    return Q;
  }

  root.SolidViewsBank = { N: N, MAXH: MAXH, S: S, STEP1: STEP1, PUZ: PUZ, STEP3: STEP3, fromFR: fromFR, CAP: CAP, zeros: zeros, copy: copy, sum: sum, squares: squares, eq: eq, viewsOf: viewsOf, solve: solve, stats: stats, footprint: footprint, planOf: planOf, build: build, shuffle: shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SolidViewsBank;
})(typeof window !== 'undefined' ? window : globalThis);
