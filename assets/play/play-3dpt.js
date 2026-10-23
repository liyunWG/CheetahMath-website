/* 獵豹玩中學｜3D 可拖動的點（E0 共用元件：空間中的直線與平面各單元共用）
   依賴 play-core.js、play-3d.js（Play3D）、play-solid-lib.js（PS）。全域名稱：P3
   重點：
   ・拖點優先於旋轉：手指／滑鼠按在點上就拖點，視角不動；按在空白處才旋轉。
   ・點只能停在整數格點（snap），拖曳時有「落影線」（垂直虛線＋地面小圓點）幫忙看高度；兩種移動方式：在水平面上移動、沿鉛直方向上下移動。
   ・點、標籤畫在最上層，半透明的平面不會遮住它們；標籤依畫面位置自動挑不互相壓住的角落（P3.layout）。
   ・一律用正投影（沒有透視），畫面縮放固定（不隨點移動而縮放），所以螢幕位置與空間位置可以互換（P3.unproject）。 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, D = window.Play3D, PS = window.PS, P3 = window.P3 = {};
  var V = PS.v;
  P3.COL = PS.COL;

  /* ---------------------------------------------------------------- 場景（固定縮放與中心） */
  /* o: box {x:[-3,3], y:[0,4], z:[-3,3]}（可動範圍）、fitR（外接半徑，預設含整個範圍）、yaw、pitch、twoCol */
  P3.scene = function (host, o) {
    o = o || {}; var bx = o.box || { x: [-3, 3], y: [0, 4], z: [-3, 3] }, c = [(bx.x[0] + bx.x[1]) / 2, (bx.y[0] + bx.y[1]) / 2, (bx.z[0] + bx.z[1]) / 2];
    var R = Math.hypot(bx.x[1] - bx.x[0], bx.y[1] - bx.y[0], bx.z[1] - bx.z[0]) / 2 + 0.6;
    var sc = new D.Scene(host, { aspect: o.twoCol ? 1 : 0.8, autoH: true, hFrac: o.hFrac || 1, fitR: o.fitR || R, center: c, yaw: o.yaw === undefined ? -0.7 : o.yaw, pitch: o.pitch === undefined ? 0.5 : o.pitch, drag: true, label: o.label || '立體圖：拖曳點移動，拖曳空白處旋轉視角' });
    sc.box = bx; sc.home = { yaw: sc.yaw, pitch: sc.pitch }; sc.P3 = { pts: [], layoutItems: [] };
    sc.onPreRender = function () { P3.layout(sc); };
    (PS.scenes = PS.scenes || []).push(sc); return sc;
  };
  /* 地面格線與外框（淡淡的，幫忙看深度） */
  P3.floor = function (sc, o) {
    o = o || {}; var bx = sc.box, i, col = 'rgba(122,110,80,.28)', out = [];
    for (i = bx.x[0]; i <= bx.x[1]; i++) out.push({ a: [i, bx.y[0], bx.z[0]], b: [i, bx.y[0], bx.z[1]], color: col, w: 1, bias: -0.5 });
    for (i = bx.z[0]; i <= bx.z[1]; i++) out.push({ a: [bx.x[0], bx.y[0], i], b: [bx.x[1], bx.y[0], i], color: col, w: 1, bias: -0.5 });
    if (o.frame !== false) {
      var X = bx.x, Y = bx.y, Z = bx.z, fc = 'rgba(122,110,80,.4)';
      [[[X[0], Y[0], Z[0]], [X[0], Y[1], Z[0]]], [[X[1], Y[0], Z[0]], [X[1], Y[1], Z[0]]], [[X[0], Y[0], Z[1]], [X[0], Y[1], Z[1]]], [[X[1], Y[0], Z[1]], [X[1], Y[1], Z[1]]]].forEach(function (s) { out.push({ a: s[0], b: s[1], color: fc, w: 1, dash: [4, 4], bias: -0.5 }); });
    }
    return out;
  };

  /* ---------------------------------------------------------------- 螢幕 ↔ 空間 */
  var rotX = D.rotX, rotY = D.rotY;
  /* 螢幕上的一點對應的視線：{o: 視線上的一點, d: 單位方向（朝向使用者）} */
  P3.unproject = function (sc, pos) {
    var q = [(pos[0] - sc.cw / 2) / sc.k, -(pos[1] - sc.ch / 2) / sc.k, 0], back = function (v) { var w = rotY(rotX(v, -sc.pitch), -sc.yaw); return w; };
    var o = back(q), d = back([0, 0, 1]);
    return { o: [o[0] + sc.center[0], o[1] + sc.center[1], o[2] + sc.center[2]], d: d };
  };
  /* 視線與水平面 y＝y0 的交點（視線幾乎水平就回傳 null） */
  P3.rayFloor = function (ray, y0) { if (Math.abs(ray.d[1]) < 0.12) return null; var t = (y0 - ray.o[1]) / ray.d[1]; return [ray.o[0] + ray.d[0] * t, y0, ray.o[2] + ray.d[2] * t]; };
  /* 視線與「座標平面」（axis＝0、1、2 分別代表 x、y、z 固定為 val）的交點；視線幾乎平行就回傳 null */
  P3.rayAxis = function (ray, axis, val) { if (Math.abs(ray.d[axis]) < 0.12) return null; var t = (val - ray.o[axis]) / ray.d[axis]; return [ray.o[0] + ray.d[0] * t, ray.o[1] + ray.d[1] * t, ray.o[2] + ray.d[2] * t]; };
  /* 視線與鉛直線（過 (x0, ·, z0)）最接近的高度 y（視線幾乎鉛直就回傳 null）
     最小化 |w0 ＋ t·d − u·e|²（e＝(0,1,0)）：d·(…)＝0 與 e·(…)＝0 兩式解出 t，再 u ＝ w0.y ＋ t·d.y */
  P3.rayVertical = function (ray, x0, z0) {
    var d = ray.d, w = [ray.o[0] - x0, ray.o[1], ray.o[2] - z0], b = d[1], dd = d[0] * w[0] + d[1] * w[1] + d[2] * w[2], den = 1 - b * b;
    if (den < 0.02) return null; var t = (b * w[1] - dd) / den; return w[1] + t * b;
  };

  /* ---------------------------------------------------------------- 拖點（優先於旋轉） */
  /* pts: [{p:[x,y,z]（會被直接修改）, name, color, fixed, mode:'floor'|'vertical'（可隨時改）, dot（畫出來的點，可省略）}]
     o: snap（預設 1）、hit（觸控半徑 px，預設 28）、onMove(pt, i)、onEnd(pt, i)、valid(p, pt, i)→false 則拒絕、gate(){回傳 true 則不能拖}
     回傳 {pick(pos), moveTo(i, p), hot} */
  P3.drag = function (sc, pts, o) {
    o = o || {}; var snap = o.snap || 1, HIT = o.hit || 28, bx = sc.box, cv = sc.canvas, api = { hot: -1 };
    function clampP(p) { return [Math.max(bx.x[0], Math.min(bx.x[1], p[0])), Math.max(bx.y[0], Math.min(bx.y[1], p[1])), Math.max(bx.z[0], Math.min(bx.z[1], p[2]))]; }
    function sn(p) { return [Math.round(p[0] / snap) * snap, Math.round(p[1] / snap) * snap, Math.round(p[2] / snap) * snap]; }
    api.pick = function (pos) {
      var best = -1, bd = 1e9, bz = -1e9, i;
      for (i = 0; i < pts.length; i++) {
        if (pts[i].fixed || pts[i].hidden) continue; var q = sc.project(pts[i].p), d = Math.hypot(q[0] - pos[0], q[1] - pos[1]); if (d > HIT) continue;
        if (best < 0 || d < bd - 6 || (d < bd + 6 && q[2] > bz)) { best = i; bd = d; bz = q[2]; }   /* 差不多近的兩個點，選比較靠近使用者的 */
      }
      return best;
    };
    api.moveTo = function (i, p) {
      var pt = pts[i], np;
      if (pt.cands) { var bd = 1e9; pt.cands.forEach(function (c) { var d = V.len(V.sub(c, p)); if (d < bd) { bd = d; np = c.slice(); } }); }   /* 只能停在指定的幾個點（例如直線上的格點） */
      else np = sn(clampP(p));
      if (o.valid && o.valid(np, pt, i) === false) return false;
      if (np[0] === pt.p[0] && np[1] === pt.p[1] && np[2] === pt.p[2]) return false; pt.p = np; if (o.onMove) o.onMove(pt, i); sc.invalidate(); return true;
    };
    sc.onDragStart = function (pos, e) {
      if (o.gate && o.gate()) return undefined;
      var i = api.pick(pos); if (i < 0) return undefined;
      var pt = pts[i], pid = e.pointerId, y0 = pt.p[1];
      try { cv.setPointerCapture(pid); } catch (_) {} api.hot = i; sc.invalidate();
      var mv = function (ev) {
        if (ev.pointerId !== pid) return; var ray = P3.unproject(sc, sc._pos(ev)), np = null;
        if (pt.mode === 'vertical') { var yy = P3.rayVertical(ray, pt.p[0], pt.p[2]); if (yy !== null) np = [pt.p[0], yy, pt.p[2]]; }
        else if (pt.mode === 'plane-x') { var fx = P3.rayAxis(ray, 0, pt.p[0]); if (fx) np = fx; }   /* 在 x ＝ 固定值的鉛直平面上移動（看二面角用） */
        else { var f = P3.rayFloor(ray, y0 = pt.p[1]); if (f) np = f; }
        if (np) api.moveTo(i, np);
      };
      var up = function (ev) { if (ev.pointerId !== pid) return; cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); api.hot = -1; sc.invalidate(); if (o.onEnd) o.onEnd(pt, i); };
      cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      return false;
    };
    return api;
  };

  /* ---------------------------------------------------------------- 標籤自動避讓（畫面上的像素） */
  /* sc.P3.layoutItems：[{obj, kind:'dot'|'text', anchor(): 空間座標, w, h}]；每次繪製前，替每個標籤挑一個不壓到點、其他標籤、畫布邊緣的位置 */
  P3.addLabel = function (sc, obj, kind) { sc.P3.layoutItems.push({ obj: obj, kind: kind || 'dot' }); return obj; };
  function textW(t, size) { var w = 0; String(t).split('').forEach(function (ch) { w += ch.charCodeAt(0) > 255 ? size : size * 0.62; }); return w; }
  P3.layout = function (sc) {
    var items = sc.P3.layoutItems, placed = [], dots = [], W = sc.cw, H = sc.ch, i, j, k;
    sc.dots.forEach(function (d) { if (!d.hidden) { var q = sc.project(d.p); dots.push([q[0], q[1], (d.r || 6) + 4]); } });
    sc.lines.forEach(function (l) {   /* 線也當成障礙（沿線每隔約 10px 放一個小圓），地面格線與外框不算 */
      if (l.hidden || (l.bias !== undefined && l.bias < 0)) return; var p0 = sc.project(l.a), p1 = sc.project(l.b), n = Math.max(1, Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 10)), t;
      for (t = 0; t <= n; t++) dots.push([p0[0] + (p1[0] - p0[0]) * t / n, p0[1] + (p1[1] - p0[1]) * t / n, 2.5]);
    });
    function overlap(a, b, m) { return !(a[2] < b[0] - m || a[0] > b[2] + m || a[3] < b[1] - m || a[1] > b[3] + m); }
    items.forEach(function (it) {
      var o = it.obj; if (o.hidden || !o.label && !o.t) return; var txt = o.label || o.t, size = o.size || 15, w = textW(txt, size) + (o.bg ? 8 : 4), hh = size + 6, q = sc.project(it.kind === 'dot' ? o.p : o.p), r = it.kind === 'dot' ? (o.r || 6) : 4, best = null, bs = -1e9;
      var cands = [], rad = [r + 8, r + 18, r + 30, r + 46, r + 64, r + 84], ang = [-90, -60, -30, 0, 30, 60, 90, 120, 150, 180, 210, 240];
      rad.forEach(function (R) { ang.forEach(function (a) { var t = a * Math.PI / 180; cands.push([Math.cos(t) * (R + (Math.abs(Math.cos(t)) * w / 2)), Math.sin(t) * (R + Math.abs(Math.sin(t)) * hh / 2)]); }); });
      cands.forEach(function (c, idx) {
        var cx = Math.max(w / 2 + 3, Math.min(W - w / 2 - 3, q[0] + c[0])), cy = Math.max(hh / 2 + 3, Math.min(H - hh / 2 - 3, q[1] + c[1])), box = [cx - w / 2, cy - hh / 2, cx + w / 2, cy + hh / 2], s = 0;   /* 超出畫布就推回畫布裡 */
        for (j = 0; j < placed.length; j++) if (overlap(box, placed[j], 2)) s -= 50;
        for (j = 0; j < dots.length; j++) { var d = dots[j], db = [d[0] - d[2], d[1] - d[2], d[0] + d[2], d[1] + d[2]]; if (overlap(box, db, 1)) s -= 50; }
        s -= idx * 0.05; if (s > bs) { bs = s; best = [cx - q[0], cy - q[1], box]; }
      });
      if (it.kind === 'dot') { o.dx = best[0]; o.dy = best[1]; } else { o.dx = best[0]; o.dy = best[1]; }
      placed.push(best[2]);
    });
  };

  /* ---------------------------------------------------------------- 平面與記號 */
  /* 過三點的半透明平面（長方形，剛好蓋住三點再多留 margin 格）；三點共線時回傳 null */
  P3.planeFace = function (a, b, c, o) {
    o = o || {}; var n = V.cross(V.sub(b, a), V.sub(c, a)), L = V.len(n); if (L < 1e-9) return null;
    n = V.mul(n, 1 / L); var u = V.norm(V.sub(b, a)), v = V.cross(n, u), g = V.mul(V.add(V.add(a, b), c), 1 / 3), mg = o.margin === undefined ? 1.3 : o.margin, hu = 0, hv = 0;
    [a, b, c].concat(o.also || []).forEach(function (p) { var d = V.sub(p, g); hu = Math.max(hu, Math.abs(V.dot(d, u))); hv = Math.max(hv, Math.abs(V.dot(d, v))); });
    hu += mg; hv += mg; var pts = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(function (s) { return V.add(g, V.add(V.mul(u, s[0] * hu), V.mul(v, s[1] * hv))); });
    return { pts: pts, fill: o.color || '#2f6fdc', alpha: o.alpha === undefined ? 0.2 : o.alpha, stroke: o.stroke || 'rgba(47,111,220,.7)', lw: 1.6, dash: [6, 4], flat: true, nopick: true, double: true, n: n, g: g };
  };
  /* 空間中的直角符號：在 corner 處，沿單位向量 u、v 各畫一小段（邊長 s 格）圍成小方框。回傳 3 條線 */
  P3.rightMark = function (corner, u, v, s, color) {
    s = s || 0.28; var a = V.add(corner, V.mul(u, s)), b = V.add(a, V.mul(v, s)), c = V.add(corner, V.mul(v, s));
    return [{ a: a, b: b, color: color || '#122548', w: 2 }, { a: b, b: c, color: color || '#122548', w: 2 }];
  };
  /* 三點整數座標 → 平面方程式 Ax＋By＋Cz＝D（整數、最簡、第一個非零係數為正）；共線回傳 null */
  P3.planeEq = function (a, b, c) {
    var n = V.cross(V.sub(b, a), V.sub(c, a)); if (!n[0] && !n[1] && !n[2]) return null;
    var g = function (x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = x % y; x = y; y = t; } return x; }, k = g(g(n[0], n[1]), n[2]) || 1; n = n.map(function (v) { return v / k; });
    var s = n[0] !== 0 ? Math.sign(n[0]) : n[1] !== 0 ? Math.sign(n[1]) : Math.sign(n[2]); n = n.map(function (v) { return v * s + 0; });
    return { n: n, d: V.dot(n, a) };
  };
  P3.eqStr = function (e) {
    var t = function (c, v, first) { if (!c) return ''; var a = Math.abs(c), co = a === 1 ? '' : a; return (first ? (c < 0 ? '−' : '') : (c < 0 ? ' − ' : ' ＋ ')) + co + v; };
    var s = '', f = true; [[e.n[0], 'x'], [e.n[1], 'y'], [e.n[2], 'z']].forEach(function (k) { var x = t(k[0], k[1], f); if (x) { s += x; f = false; } });
    return s + ' ＝ ' + (e.d === 0 ? '0' : (e.d < 0 ? '−' + (-e.d) : e.d));
  };

  /* ---------------------------------------------------------------- 把直線（無限長）切在可動範圍內 */
  /* 過 a、b 的直線，與長方體範圍的交線段 [p, q]；不相交回傳 null（slab 法） */
  P3.clipLine = function (a, b, box) {
    var d = V.sub(b, a), t0 = -1e9, t1 = 1e9, rg = [box.x, box.y, box.z], i;
    for (i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-12) { if (a[i] < rg[i][0] - 1e-9 || a[i] > rg[i][1] + 1e-9) return null; continue; }
      var u = (rg[i][0] - a[i]) / d[i], w = (rg[i][1] - a[i]) / d[i]; if (u > w) { var tt = u; u = w; w = tt; } t0 = Math.max(t0, u); t1 = Math.min(t1, w);
    }
    if (t0 > t1) return null; return [V.add(a, V.mul(d, t0)), V.add(a, V.mul(d, t1))];
  };
  /* 水平大平面（y＝y0，蓋住整個地面範圍） */
  P3.floorFace = function (sc, color, alpha, y0) {
    var bx = sc.box, y = y0 || 0; return { pts: [[bx.x[0], y, bx.z[0]], [bx.x[1], y, bx.z[0]], [bx.x[1], y, bx.z[1]], [bx.x[0], y, bx.z[1]]], fill: color || '#7a4fd6', alpha: alpha === undefined ? 0.13 : alpha, stroke: 'rgba(122,79,214,.5)', lw: 1.4, flat: true, nopick: true, double: true };
  };
  /* 平面 n·x＝d 在長方體範圍內的截面（多邊形，3～6 邊）；沒有截面回傳 null */
  P3.planeInBox = function (n, d, box, o) {
    o = o || {}; var X = box.x, Y = box.y, Z = box.z, C = [], i, j, k, e = 1e-9, pts = [];
    var corners = []; [X[0], X[1]].forEach(function (x) { [Y[0], Y[1]].forEach(function (y) { [Z[0], Z[1]].forEach(function (z) { corners.push([x, y, z]); }); }); });
    var edges = []; for (i = 0; i < 8; i++) for (j = i + 1; j < 8; j++) { var df = 0; for (k = 0; k < 3; k++) if (corners[i][k] !== corners[j][k]) df++; if (df === 1) edges.push([corners[i], corners[j]]); }
    edges.forEach(function (E) { var a = E[0], b = E[1], fa = V.dot(n, a) - d, fb = V.dot(n, b) - d; if (Math.abs(fa) < e && Math.abs(fb) < e) { pts.push(a, b); return; } if (Math.abs(fa) < e) { pts.push(a); return; } if (Math.abs(fb) < e) { pts.push(b); return; } if (fa * fb < 0) pts.push(V.lerp(a, b, fa / (fa - fb))); });
    var uniq = []; pts.forEach(function (p) { if (!uniq.some(function (q) { return V.len(V.sub(p, q)) < 1e-7; })) uniq.push(p); }); if (uniq.length < 3) return null;
    var g = V.mul(uniq.reduce(function (a, b) { return V.add(a, b); }, [0, 0, 0]), 1 / uniq.length), nn = V.norm(n), u0 = V.norm(V.sub(uniq[0], g)), v0 = V.cross(nn, u0);
    uniq.sort(function (p, q) { return Math.atan2(V.dot(V.sub(p, g), v0), V.dot(V.sub(p, g), u0)) - Math.atan2(V.dot(V.sub(q, g), v0), V.dot(V.sub(q, g), u0)); });
    return { pts: uniq, fill: o.color || '#2f6fdc', alpha: o.alpha === undefined ? 0.2 : o.alpha, stroke: o.stroke || 'rgba(47,111,220,.7)', lw: 1.6, dash: o.dash === false ? null : [6, 4], flat: true, nopick: true, double: true };
  };

  /* ---------------------------------------------------------------- 舞台：場景＋可拖的點＋重畫 */
  /* o: pts（[{p, name, color, fixed, hidden, mode, noShadow, noLabel}]）、box、snap、yaw、pitch、floor（預設 true）、controls（預設 true）、gate()、valid(p, pt, i)
        build(S) → {faces, lines, texts, dots}（每次點動了就呼叫；texts／dots 帶 label 的會參加標籤避讓）、onMove(pt, i, S)、onEnd(pt, i, S)
     回傳 S：{sc, pts, drag, rebuild(), moveTo(i, p)（程式代拖，會觸發 onEnd）} */
  P3.stage = function (host, o) {
    var sc = P3.scene(host, { box: o.box, yaw: o.yaw, pitch: o.pitch, hFrac: o.hFrac }), S = { sc: sc, pts: o.pts }, main = [];
    S.drag = P3.drag(sc, o.pts, { snap: o.snap, valid: o.valid, gate: o.gate, onMove: function (pt, i) { S.rebuild(); if (o.onMove) o.onMove(pt, i, S); }, onEnd: function (pt, i) { S.rebuild(); if (o.onEnd) o.onEnd(pt, i, S); } });
    var base = sc.onPreRender; sc.onPreRender = function (c, s) { main.forEach(function (d, i) { d.ring = S.drag.hot === d._i; d.ringColor = '#122548'; d.ringW = 3; }); base(c, s); };
    if (o.controls !== false) S.ctrl = P3.controls(host, sc, o.pts);
    S.rebuild = function () {
      var spec = (o.build && o.build(S)) || {}, faces = (spec.faces || []).slice(), lines = (o.floor === false ? [] : P3.floor(sc)).concat(spec.lines || []), dots = [], texts = (spec.texts || []).slice();
      sc.P3.layoutItems = [];
      o.pts.forEach(function (pt) { if (!pt.hidden && !pt.noShadow && pt.p[1] > 0) { lines.push({ a: pt.p, b: [pt.p[0], 0, pt.p[2]], color: 'rgba(18,37,72,.4)', w: 1.4, dash: [4, 4] }); dots.push({ p: [pt.p[0], 0, pt.p[2]], r: 3, color: 'rgba(18,37,72,.5)' }); } });
      main = []; o.pts.forEach(function (pt, i) { if (pt.hidden) return; var d = { p: pt.p, r: pt.fixed ? 7 : 9, color: pt.color || COLB, top: true, _i: i }; if (!pt.noLabel) { d.label = pt.name; d.labelColor = pt.color || COLB; d.size = 17; sc.P3.layoutItems.push({ obj: d, kind: 'dot' }); } main.push(d); });
      (spec.dots || []).forEach(function (d) { d.top = true; if (d.label) sc.P3.layoutItems.push({ obj: d, kind: 'dot' }); main.push(d); d._i = -2; });
      texts.forEach(function (t) { if (t.t) sc.P3.layoutItems.push({ obj: t, kind: 'text' }); });
      sc.faces = faces; sc.lines = lines; sc.texts = texts; sc.dots = dots.concat(main); sc.invalidate();
    };
    S.moveTo = function (i, p) { S.drag.moveTo(i, p); S.rebuild(); if (o.onEnd) o.onEnd(o.pts[i], i, S); };
    S.rebuild(); window.__E0 = S; return S;
  };
  var COLB = '#2f6fdc';

  /* ---------------------------------------------------------------- 控制鈕：移動方式、視角重置 */
  P3.controls = function (host, sc, pts, o) {
    o = o || {}; var seg = PS.seg(host, [{ k: 'floor', t: '↔ 在地面上移動' }, { k: 'vertical', t: '↕ 上下移動' }], function (k) { pts.forEach(function (p) { p.mode = k; }); }, { cols: 2 });
    seg.set('floor', false);
    var btns = PS.btnRow(host, [{ k: 'reset', t: '⟲ 視角重置', fn: function () { PS.camTo(sc, sc.home.yaw, sc.home.pitch, null, 600); } }, { k: 'top', t: '⬇ 從上面看', fn: function () { PS.camTo(sc, sc.yaw, 1.45, null, 600); } }, { k: 'front', t: '➡ 從前面看', fn: function () { PS.camTo(sc, 0, 0.02, null, 600); } }]);
    return { seg: seg, btns: btns };
  };
})();
