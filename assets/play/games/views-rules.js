/* 獵豹玩中學｜三視圖遊戲：規則庫（純函式）＋隨機出題。
   第一段（// Classic script … 到 })(typeof window …）是「獵豹數學奇幻之旅」第 13 關 L13_views.html 的 Views 規則庫，原封搬入、一個字都沒改；
   第二段 ViewsGen 是新增的隨機出題器。瀏覽器裡是 window.Views／window.ViewsGen，Node 裡是 module.exports（供測試用）。 */
// Classic script: window.Views in the browser, module.exports in Node (for tests).
// 2026-10-19 (touch-battle copy): the tray of six pieces is gone. Students stack unlimited single cubes on
// the nine numbered floor cells, so a build is just nine column heights (index i = number i+1).
// Numbers follow the top view: 1 2 3 are the BACK row, 7 8 9 the FRONT row, columns left to right.
// Axes: x runs left -> right, y runs front -> back, z runs up. A cube is [x, y, z].
(function (root) {
  var CELLS = 9;
  function xy(i) { return [i % 3, 2 - Math.floor(i / 3)]; }
  function zeros() { return [0, 0, 0, 0, 0, 0, 0, 0, 0]; }
  function cubesOf(h) { var o = []; for (var i = 0; i < CELLS; i++) { var p = xy(i); for (var z = 0; z < h[i]; z++) o.push([p[0], p[1], z]); } return o; }
  function heightsOf(cubes) { var h = zeros(); cubes.forEach(function (c) { h[(2 - c[1]) * 3 + c[0]]++; }); return h; }
  function total(h) { return h.reduce(function (a, b) { return a + b; }, 0); }
  // Each of these returns a NEW list of heights, or null when the move is not allowed.
  function add(h, i, H) { if (h[i] >= H) return null; var n = h.slice(); n[i]++; return n; }
  function removeTop(h, i) { if (h[i] <= 0) return null; var n = h.slice(); n[i]--; return n; }
  function moveTop(h, from, to, H) { if (from === to || h[from] <= 0 || h[to] >= H) return null; var n = h.slice(); n[from]--; n[to]++; return n; }

  // The three views as rows of '#' and '.', top row first.
  //   front: seen from the front; columns are x, left to right.
  //   right: seen from the right-hand side; columns are y, with the FRONT of the model on the left.
  //   top:   seen from above by someone standing at the front; back row first, columns are x.
  function views(cubes, N, H) {
    var f = {}, r = {}, t = {};
    cubes.forEach(function (c) { f[c[0] + ',' + c[2]] = 1; r[c[1] + ',' + c[2]] = 1; t[c[0] + ',' + c[1]] = 1; });
    function grid(set, rows, cols, k) { var out = []; rows.forEach(function (b) { out.push(cols.map(function (a) { return set[k(a, b)] ? '#' : '.'; }).join('')); }); return out; }
    var up = [], cols = [], back = []; for (var i = 0; i < N; i++) { cols.push(i); back.unshift(i); } for (var z = H - 1; z >= 0; z--) up.push(z);
    return { front: grid(f, up, cols, function (a, b) { return a + ',' + b; }), right: grid(r, up, cols, function (a, b) { return a + ',' + b; }),
      top: grid(t, back, cols, function (a, b) { return a + ',' + b; }) };
  }
  // Which of the three views agree. Any model with the same three views is accepted; no stored answer is consulted.
  function compare(a, b) {
    var res = { front: a.front.join('/') === b.front.join('/'), right: a.right.join('/') === b.right.join('/'), top: a.top.join('/') === b.top.join('/') };
    res.ok = res.front && res.right && res.top; return res;
  }
  // Every column-height list (no floating cubes) whose three views equal `target`. Used for the reveal after a
  // puzzle is solved ("this one has N ways, from a to b cubes"); never to judge a build.
  function solutions(target, N, H) {
    var fh = [], rh = [], i, j;
    function need(rows, k) { var m = 0; rows.forEach(function (r, j) { if (r.charAt(k) === '#') m = Math.max(m, H - j); }); return m; }
    for (i = 0; i < N; i++) { fh.push(need(target.front, i)); rh.push(need(target.right, i)); }
    var lo = [], hi = [];
    for (i = 0; i < CELLS; i++) {
      var p = xy(i), filled = target.top[N - 1 - p[1]].charAt(p[0]) === '#';
      lo.push(filled ? 1 : 0); hi.push(filled ? Math.min(fh[p[0]], rh[p[1]], H) : 0);
      if (lo[i] > hi[i]) return [];
    }
    var out = [], h = zeros();
    (function go(k) {
      if (k === CELLS) { if (compare(views(cubesOf(h), N, H), target).ok) out.push(h.slice()); return; }
      for (var v = lo[k]; v <= hi[k]; v++) { h[k] = v; go(k + 1); }
      h[k] = 0;
    })(0);
    return out;
  }

  // Three puzzles. `model` only produces the three target views; any build with the same views is accepted.
  // `times` = seconds for 3 stars, 2 stars, and the limit.
  var PUZZLES = {
    warmup: { name: '暖身', N: 3, H: 3, times: [60, 120, 180],
      model: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0], [2, 2, 0], [2, 2, 1]] },
    medium: { name: '中等', N: 3, H: 3, times: [120, 210, 300],
      model: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [0, 2, 0], [0, 0, 1], [1, 0, 1], [0, 0, 2], [0, 2, 1]] },
    hard: { name: '困難', N: 3, H: 3, times: [180, 300, 420],
      model: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [1, 2, 0], [2, 2, 0], [1, 0, 1], [0, 1, 1], [1, 2, 1], [2, 2, 1], [0, 1, 2], [2, 2, 2]] },
  };
  // 題目 B: same number of cubes and same time limits, but a different kind of build (the A models sit on an L-shaped
  // base, the B models on a T- or plus-shaped base), so B is not a mirror image of A.
  PUZZLES.warmupB = { name: '暖身', N: 3, H: 3, times: [60, 120, 180],
    model: [[0, 2, 0], [1, 2, 0], [2, 2, 0], [1, 1, 0], [1, 0, 0], [1, 2, 1]] };
  PUZZLES.mediumB = { name: '中等', N: 3, H: 3, times: [120, 210, 300],
    model: [[0, 2, 0], [1, 2, 0], [2, 2, 0], [1, 1, 0], [1, 0, 0], [1, 0, 1], [1, 0, 2], [1, 1, 1], [2, 2, 1]] };
  PUZZLES.hardB = { name: '困難', N: 3, H: 3, times: [180, 300, 420],
    model: [[0, 2, 0], [1, 2, 0], [1, 2, 1], [1, 2, 2], [0, 1, 0], [0, 1, 1], [1, 1, 0], [2, 1, 0], [2, 1, 1], [1, 0, 0], [1, 0, 1], [1, 0, 2]] };
  // SETS[difficulty][version]: 0 = 題目 A, 1 = 題目 B.
  var SETS = [[PUZZLES.warmup, PUZZLES.warmupB], [PUZZLES.medium, PUZZLES.mediumB], [PUZZLES.hard, PUZZLES.hardB]];
  // Stars come from time. Every wrong 交卷 adds PENALTY seconds, so submitting is not a free way to test guesses.
  var PENALTY = 30;
  function chargedTime(seconds, wrong) { return seconds + PENALTY * (wrong || 0); }
  function starsFor(seconds, wrong, times) { var t = chargedTime(seconds, wrong); return t <= times[0] ? 3 : t <= times[1] ? 2 : t <= times[2] ? 1 : 0; }

  var Views = { CELLS: CELLS, xy: xy, zeros: zeros, cubesOf: cubesOf, heightsOf: heightsOf, total: total, add: add, removeTop: removeTop, moveTop: moveTop,
    views: views, compare: compare, solutions: solutions, PUZZLES: PUZZLES, SETS: SETS, PENALTY: PENALTY, chargedTime: chargedTime, starsFor: starsFor };
  root.Views = Views;
  if (typeof module !== 'undefined' && module.exports) module.exports = Views;
})(typeof window !== 'undefined' ? window : globalThis);

/* ---------------------------------------------------------------- 隨機出題器（新增）
   每題由「難度＋題號＋嘗試次數」決定種子，同一題號永遠重現同一題。模型只用 9 個格高（每格 0～3），
   所以不可能懸空（積木一定疊在下面有積木的地方）。通過下列規則才採用，否則換下一個嘗試次數：
   1. 顆數＝難度規定（暖身 6、中等 9、困難 12，與原版相同）；每格高度 ≤ 3。
   2. 底面（有積木的格）用 4 鄰接連成一塊，格數在難度規定的範圍內。
   3. 三張視圖都不退化：前視圖、右視圖至少 3 格、而且沒有塗滿 9 格；上視圖就是底面（≥ 4 格）。
   4. 用 Views.solutions 列出所有符合三視圖的拼法：模型本身必須在其中（至少 1 解）。
   5. 解的數量依難度限制：暖身 1～6 種（避免太模糊）、中等 1～40 種、困難要 ≥ 2 種（有多種拼法，「最少、最多顆」才有意思）。
   6. 困難另外要求塔高分布較複雜：至少一座高 3、至少兩座高 ≥ 2、至少兩種不同的高度。
   7. 連續兩題不重複：呼叫端傳入上一題的 key，相同就換下一個嘗試次數。 */
(function (root) {
  var Views = root.Views;
  function mulberry32(a) { a = a >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function mix(li, qno, salt) { var x = (li + 1) * 1000003 ^ (qno * 7919) ^ (salt * 104729 + 0x9E3779B9); x = Math.imul(x ^ (x >>> 16), 0x85EBCA6B); x = Math.imul(x ^ (x >>> 13), 0xC2B2AE35); return (x ^ (x >>> 16)) >>> 0; }
  var SPEC = [
    { name: '暖身', cubes: 6, cells: [4, 5], sols: [1, 6] },
    { name: '中等', cubes: 9, cells: [5, 7], sols: [1, 40] },
    { name: '困難', cubes: 12, cells: [6, 8], sols: [2, 400], hardShape: true }
  ];
  var N = 3, H = 3;
  function neighbors(i) { var o = [], x = i % 3, y = Math.floor(i / 3); if (x > 0) o.push(i - 1); if (x < 2) o.push(i + 1); if (y > 0) o.push(i - 3); if (y < 2) o.push(i + 3); return o; }
  function connected(h) {
    var cells = [], i; for (i = 0; i < 9; i++) if (h[i] > 0) cells.push(i);
    if (!cells.length) return false; var seen = {}, stack = [cells[0]]; seen[cells[0]] = 1;
    while (stack.length) { var c = stack.pop(); neighbors(c).forEach(function (n) { if (h[n] > 0 && !seen[n]) { seen[n] = 1; stack.push(n); } }); }
    return Object.keys(seen).length === cells.length;
  }
  function filled(rows) { var n = 0; rows.forEach(function (r) { for (var i = 0; i < r.length; i++) if (r.charAt(i) === '#') n++; }); return n; }
  function key(h) { return h.join(''); }
  // 一次嘗試：回傳格高或 null
  function attempt(rnd, spec) {
    var k = spec.cells[0] + Math.floor(rnd() * (spec.cells[1] - spec.cells[0] + 1)), set = [Math.floor(rnd() * 9)], h = Views.zeros();
    h[set[0]] = 1;
    while (set.length < k) { var cand = []; set.forEach(function (c) { neighbors(c).forEach(function (n) { if (!h[n] && cand.indexOf(n) < 0) cand.push(n); }); }); var pick = cand[Math.floor(rnd() * cand.length)]; h[pick] = 1; set.push(pick); }
    var left = spec.cubes - k;
    while (left > 0) { var open = set.filter(function (c) { return h[c] < H; }); if (!open.length) return null; h[open[Math.floor(rnd() * open.length)]]++; left--; }
    return h;
  }
  function accept(h, spec, info) {
    if (Views.total(h) !== spec.cubes || h.some(function (v) { return v < 0 || v > H; })) return false;
    var cells = h.filter(function (v) { return v > 0; }).length; if (cells < spec.cells[0] || cells > spec.cells[1]) return false;
    if (!connected(h)) return false;
    var cubes = Views.cubesOf(h), t = Views.views(cubes, N, H), f = filled(t.front), r = filled(t.right), tp = filled(t.top);
    if (f < 3 || r < 3 || tp < 4 || f >= 9 || r >= 9) return false;
    var sols = Views.solutions(t, N, H), own = sols.some(function (s) { return key(s) === key(h); });
    if (!own || sols.length < spec.sols[0] || sols.length > spec.sols[1]) return false;
    if (spec.hardShape) { var c3 = h.filter(function (v) { return v === 3; }).length, c2 = h.filter(function (v) { return v >= 2; }).length, kinds = {}; h.forEach(function (v) { if (v) kinds[v] = 1; }); if (c3 < 1 || c2 < 2 || Object.keys(kinds).length < 2) return false; }
    info.cubes = cubes; info.target = t; info.sols = sols; return true;
  }
  /* li：0 暖身、1 中等、2 困難；qno：題號（正整數）；avoid：上一題的 key（連續兩題不重複） */
  function generate(li, qno, avoid) {
    var spec = SPEC[li];
    for (var salt = 0; salt < 3000; salt++) {
      var rnd = mulberry32(mix(li, qno, salt)), h = attempt(rnd, spec), info = {};
      if (!h || !accept(h, spec, info)) continue;
      if (avoid && key(h) === avoid) continue;
      var lo = 99, hi = 0; info.sols.forEach(function (s) { var n = Views.total(s); lo = Math.min(lo, n); hi = Math.max(hi, n); });
      return { li: li, qno: qno, salt: salt, h: h, key: key(h), cubes: info.cubes, target: info.target, sols: info.sols, lo: lo, hi: hi, times: Views.SETS[li][0].times, name: spec.name };
    }
    var P0 = Views.SETS[li][0], hh = Views.heightsOf(P0.model.map(function (c) { return c.slice(); })), cb = Views.cubesOf(hh), tt = Views.views(cb, N, H), ss = Views.solutions(tt, N, H);
    return { li: li, qno: qno, salt: -1, h: hh, key: key(hh), cubes: cb, target: tt, sols: ss, lo: 0, hi: 0, times: P0.times, name: spec.name };
  }
  var Gen = { SPEC: SPEC, generate: generate, connected: connected, key: key, mulberry32: mulberry32 };
  Views.Gen = Gen; root.ViewsGen = Gen;
})(typeof window !== 'undefined' ? window : globalThis);
