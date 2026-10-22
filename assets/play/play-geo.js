/* 獵豹玩中學｜幾何小工具（角度、角的扇形、凸多邊形）。供多個單元共用，需在 play-core.js 之後載入。
   座標一律是「數學座標」（y 向上，與 Play.Board 相同）；角度用度。 */
(function () {
  'use strict';
  var rad = Math.PI / 180;
  function norm(d) { return ((d % 360) + 360) % 360; }
  function dirTo(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]) / rad; }
  function shortest(d1, d2) { return ((d2 - d1 + 540) % 360) - 180; }
  function polar(c, r, d) { return [c[0] + r * Math.cos(d * rad), c[1] + r * Math.sin(d * rad)]; }
  /* 角的記號：頂點 V、從方向 d1 轉過 d（沒給 d 就取較短的一邊）。剛好 90° 時畫成直角符號（小方框），否則是圓弧扇形。
     回傳 {pts, bis（平分線方向）, val（角度大小）} */
  function wedge(V, d1, d2, r, d) {
    if (d === undefined) d = shortest(d1, d2); var pts = [V], i;
    if (Math.abs(Math.abs(d) - 90) < 0.01) {
      var s = r * 0.7, u = [Math.cos(d1 * rad), Math.sin(d1 * rad)], w = [Math.cos((d1 + d) * rad), Math.sin((d1 + d) * rad)];
      pts.push([V[0] + u[0] * s, V[1] + u[1] * s], [V[0] + (u[0] + w[0]) * s, V[1] + (u[1] + w[1]) * s], [V[0] + w[0] * s, V[1] + w[1] * s]);
    } else for (i = 0; i <= 24; i++) { var a = (d1 + d * i / 24) * rad; pts.push([V[0] + r * Math.cos(a), V[1] + r * Math.sin(a)]); }
    return { pts: pts, bis: d1 + d / 2, val: Math.abs(d) };
  }
  function angAt(V, X, Y) { return Math.abs(shortest(dirTo(V, X), dirTo(V, Y))); }
  /* 逆時針凸多邊形：回傳每個邊的方向 heads[i]（頂點 i 到 i+1）與每個頂點的外角 ext[i]（頂點 i 處，從上一條邊轉到下一條邊）；不是凸的（有外角 ≤ 0）回傳 null */
  function polyAngles(pts) {
    var n = pts.length, heads = [], ext = [], i, ok = true;
    for (i = 0; i < n; i++) heads.push(dirTo(pts[i], pts[(i + 1) % n]));
    for (i = 0; i < n; i++) { var e = norm(heads[i] - heads[(i + n - 1) % n]); if (e < 0.01 || e > 179.99) ok = false; ext.push(e); }
    return ok ? { heads: heads, ext: ext, sum: ext.reduce(function (a, b) { return a + b; }, 0) } : null;
  }
  /* 橢圓上不等間隔的 n 個點（一定是凸的），當作「看起來隨便畫」的凸多邊形 */
  function ellipsePoly(n, c, rx, ry, rot) {
    var out = [], k, jit = [0, 14, -10, 12, -14, 9, -8, 11];
    for (k = 0; k < n; k++) { var a = (rot || 0) + 360 * k / n + (n > 3 ? jit[k % 8] * 0.6 : jit[k % 8]); out.push([c[0] + rx * Math.cos(a * rad), c[1] + ry * Math.sin(a * rad)]); }
    return out;
  }
  function regPoly(n, c, r, rot) { var out = [], k; for (k = 0; k < n; k++) out.push(polar(c, r, (rot || 0) + 360 * k / n)); return out; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  window.PlayGeo = { rad: rad, norm: norm, dirTo: dirTo, shortest: shortest, polar: polar, wedge: wedge, angAt: angAt, polyAngles: polyAngles, ellipsePoly: ellipsePoly, regPoly: regPoly, lerp: lerp };
})();
