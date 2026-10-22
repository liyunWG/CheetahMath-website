/* 獵豹玩中學｜迷你 3D 引擎（Canvas 2D、畫家演算法、可拖曳旋轉、點選面）
   座標：x 向右、y 向上、z 朝向使用者。所有單位用「格」（立方體邊長 1）。
   用法：
     var sc = new Play3D.Scene(host, { aspect: 1, yaw: -0.6, pitch: 0.45, scale: 70 });
     sc.faces = Play3D.cubeFaces(0,0,0, 1, '#2f6fdc'); sc.render();
   face: { pts:[[x,y,z],…], fill:'#rrggbb', stroke:'#…', lw:2, alpha:1, label:'A', id:any, flat:false, dash:[4,4] }
   line: { a:[x,y,z], b:[x,y,z], color, w, dash, id }      dot: { p:[x,y,z], r:6, color, label, id }
   text: { p:[x,y,z], t:'A', color, size, dx, dy }  */
(function () {
  'use strict';
  var P = window.Play, h = P.h;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rotY(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
  function rotX(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
  function rotZ(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
  /* 繞任意軸（過原點）旋轉 */
  function rotAxis(p, axis, a) {
    var L = Math.hypot(axis[0], axis[1], axis[2]), u = [axis[0] / L, axis[1] / L, axis[2] / L], c = Math.cos(a), s = Math.sin(a), d = u[0] * p[0] + u[1] * p[1] + u[2] * p[2];
    var cr = [u[1] * p[2] - u[2] * p[1], u[2] * p[0] - u[0] * p[2], u[0] * p[1] - u[1] * p[0]];
    return [p[0] * c + cr[0] * s + u[0] * d * (1 - c), p[1] * c + cr[1] * s + u[1] * d * (1 - c), p[2] * c + cr[2] * s + u[2] * d * (1 - c)];
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]; return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function rgb(c, k, a) { var v = hex(c); return 'rgba(' + Math.min(255, Math.round(v[0] * k)) + ',' + Math.min(255, Math.round(v[1] * k)) + ',' + Math.min(255, Math.round(v[2] * k)) + ',' + (a === undefined ? 1 : a) + ')'; }

  function Scene(host, o) {
    o = o || {};
    var self = this;
    this.yaw = o.yaw === undefined ? -0.6 : o.yaw; this.pitch = o.pitch === undefined ? 0.45 : o.pitch;
    this.scale = o.scale || 70; this.persp = o.persp || 0; this.aspect = o.aspect || 1; this.maxH = o.maxH || 0; this.cull = !!o.cull; this.center = o.center || [0, 0, 0];
    this.autoFit = !!o.autoFit; this.fitR = o.fitR || 0; this.autoH = !!o.autoH; this.hFrac = o.hFrac || 1; this.minH = o.minH || 0;
    this.fixedW = o.width || 0; this.faces = []; this.lines = []; this.dots = []; this.texts = []; this.extraTexts = null; this.light = [-0.35, 0.8, 0.5];
    this.onRender = null; this.draggable = o.drag !== false; this.lockPitch = !!o.lockPitch; this.onDragStart = o.onDragStart; this.onTap = o.onTap; this.onDrag = o.onDrag; this.onHover = o.onHover;
    this.canvas = h('canvas', { class: 'pl-3d', 'aria-label': o.label || '立體圖，可以用手指拖曳旋轉' });
    this.canvas.style.touchAction = o.scroll ? 'pan-y' : 'none';
    if (o.static) { this.canvas.style.pointerEvents = 'none'; this.canvas.style.touchAction = 'auto'; }
    this.wrap = h('div', { class: 'pl-stage pl-stage--3d' }, this.canvas); host.append(this.wrap);
    this.vx = 0; this.vy = 0; this.dirty = true; this.dragging = false; this.cw = 300; this.ch = 300;
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    if (window.ResizeObserver) new ResizeObserver(function () { self._resize(); }).observe(this.wrap); else window.addEventListener('resize', function () { self._resize(); });
    if (this.draggable) this._bind();
    this._loop = this._loop.bind(this); requestAnimationFrame(this._loop);
  }
  Scene.prototype = {
    _resize: function () {
      var w = this.fixedW || (this.wrap.clientWidth - 8); if (w < 50) w = 300; var hh = Math.min(w / this.aspect, this.maxH || o_maxH(this));
      if (this.autoH) { /* 自動高度：電腦版 340–420px、手機 250–320px（依螢幕高度），不被 maxH 擠扁 */ var wide = window.innerWidth >= 900, ih = window.innerHeight, base = wide ? Math.max(360, Math.min(440, ih * 0.52)) : Math.max(260, Math.min(330, ih * 0.38)); hh = Math.min(base * this.hFrac, w / this.aspect); if (this.minH) hh = Math.max(hh, Math.min(this.minH, w)); }
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.cw = w; this.ch = hh; this.canvas.style.width = this.fixedW ? this.fixedW + 'px' : '100%'; this.canvas.style.maxWidth = '100%'; this.canvas.style.height = hh + 'px'; this.dpr = dpr; this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(hh * dpr); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._k(); this.dirty = true;
    },
    /* 縮放：有 fitR（物件以 center 為中心的外接半徑，世界座標）就自動合適大小，任何視角都完整在畫布內 */
    _k: function () { this.k = this.fitR ? Math.min(this.cw, this.ch) / (2 * this.fitR * 1.12) : (this.scaleFixed || this.scale) * Math.min(1, this.cw / 330); },
    fit: function (R) { this.fitR = R; this._k(); this.dirty = true; },
    /* ---- 自動適配（autoFit:true）：用「所有點到外接盒中心的最大距離 R」（與旋轉無關的外接球）決定縮放，
       再扣掉點圓半徑、文字標籤的像素外擴，保證任何視角、轉動途中都不會超出畫布；物件改變時每次繪製重算 ---- */
    _textW: function (t, size) { var w = 0; String(t).split('').forEach(function (ch) { w += ch.charCodeAt(0) > 255 ? size : size * 0.62; }); return w; },
    /* 蒐集所有會畫出來的東西：{p:世界座標, l,r,t,b: 投影後向四周的像素外擴} */
    _items: function () {
      var out = [], self = this;
      this.faces.forEach(function (f) { if (f.hidden) return; f.pts.forEach(function (p) { out.push({ p: p, l: 1.5, r: 1.5, t: 1.5, b: 1.5 }); }); });
      this.lines.forEach(function (ln) { if (ln.hidden) return; var w = (ln.w || 2.5) / 2 + 1; out.push({ p: ln.a, l: w, r: w, t: w, b: w }, { p: ln.b, l: w, r: w, t: w, b: w }); });
      this.dots.forEach(function (d) {
        if (d.hidden) return; var r = (d.r || 6) + 2, it = { p: d.p, l: r, r: r, t: r, b: r };
        if (d.label) { var size = d.size || 15, hw = self._textW(d.label, size) / 2, dx = d.dx || 0, dy = d.dy === undefined ? -(d.r || 6) - 9 : d.dy; it.l = Math.max(it.l, hw - dx); it.r = Math.max(it.r, hw + dx); it.t = Math.max(it.t, -dy + size / 2 + 1); it.b = Math.max(it.b, dy + size / 2 + 1); }
        out.push(it);
      });
      (this.extraTexts ? this.texts.concat(this.extraTexts) : this.texts).forEach(function (x) {
        if (x.hidden) return; var size = x.size || 15, hw = self._textW(x.t, size) / 2 + (x.bg ? 4 : x.halo ? 3 : 1), dx = x.dx || 0, dy = x.dy || 0, hh = (x.bg ? 10 : size / 2) + (x.halo ? 3 : 1);
        out.push({ p: x.p, l: Math.max(2, hw - dx), r: Math.max(2, hw + dx), t: Math.max(2, hh - dy), b: Math.max(2, hh + dy) });
        if (x.p2) out.push({ p: x.p2, l: Math.max(2, hw - dx), r: Math.max(2, hw + dx), t: Math.max(2, hh - dy), b: Math.max(2, hh + dy) });   /* 會上下移動的標籤：另一端也要算進 fit */
      });
      return out;
    },
    _autoFit: function () {
      var it = this._items(); if (!it.length) return; var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], i, j;
      for (i = 0; i < it.length; i++) for (j = 0; j < 3; j++) { mn[j] = Math.min(mn[j], it[i].p[j]); mx[j] = Math.max(mx[j], it[i].p[j]); }
      var c = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], R = 0.2, exX = 0, exY = 0;
      for (i = 0; i < it.length; i++) { var p = it[i].p; R = Math.max(R, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])); exX = Math.max(exX, it[i].l, it[i].r); exY = Math.max(exY, it[i].t, it[i].b); }
      this.center = c; this.k = Math.max(6, Math.min((this.cw / 2 - 6 - exX) / R, (this.ch / 2 - 6 - exY) / R));
    },
    /* 檢查：yaw 每 step°（0～360）× pitch 每 step°（−90～90）逐一投影，所有繪製項目的包圍盒是否都在畫布內（留 margin px）。回傳 {ok, combos, bad, minMargin} */
    checkFit: function (step, margin) {
      step = step || 15; margin = margin === undefined ? 4 : margin; if (this.autoFit) this._autoFit();
      var it = this._items(), c = this.center, k = this.k, combos = 0, bad = 0, minM = 1e9, W = this.cw, Ht = this.ch, yd, pd, i;
      for (yd = 0; yd < 360; yd += step) for (pd = -90; pd <= 90; pd += step) {
        combos++; var ya = yd * Math.PI / 180, pa = pd * Math.PI / 180, worst = 1e9;
        for (i = 0; i < it.length; i++) {
          var q = rotX(rotY([it[i].p[0] - c[0], it[i].p[1] - c[1], it[i].p[2] - c[2]], ya), pa), x = W / 2 + q[0] * k, y = Ht / 2 - q[1] * k, o = it[i];
          worst = Math.min(worst, x - o.l, W - (x + o.r), y - o.t, Ht - (y + o.b));
        }
        minM = Math.min(minM, worst); if (worst < margin) bad++;
      }
      return { ok: bad === 0, combos: combos, bad: bad, minMargin: Math.round(minM * 10) / 10, w: W, h: Ht };
    },
    invalidate: function () { this.dirty = true; },
    _loop: function () {
      if (!this.dragging && (Math.abs(this.vx) > 1e-4 || Math.abs(this.vy) > 1e-4)) { this.yaw += this.vx; this.pitch = this.lockPitch ? this.pitch : Math.max(-1.5, Math.min(1.5, this.pitch + this.vy)); this.vx *= 0.93; this.vy *= 0.93; this.dirty = true; }
      if (this.dirty) { this.dirty = false; this.render(); }
      requestAnimationFrame(this._loop);
    },
    /* 3D → 螢幕。回傳 [sx, sy, depth]（depth 越大越靠近使用者） */
    project: function (p) {
      var q = rotX(rotY([p[0] - this.center[0], p[1] - this.center[1], p[2] - this.center[2]], this.yaw), this.pitch), f = 1;
      if (this.persp) f = this.persp / (this.persp - q[2]);
      return [this.cw / 2 + q[0] * this.k * f, this.ch / 2 - q[1] * this.k * f, q[2]];
    },
    view: function (p) { return rotX(rotY([p[0] - this.center[0], p[1] - this.center[1], p[2] - this.center[2]], this.yaw), this.pitch); },
    /* 平滑轉到指定視角 */
    setView: function (yaw, pitch, instant) {
      var self = this; this.vx = this.vy = 0;
      if (instant || reduce) { this.yaw = yaw; this.pitch = pitch; this.dirty = true; return; }
      var sy = new P.Spring(this.yaw, { k: 120, zeta: 0.7, onUpdate: function (v) { self.yaw = v; self.dirty = true; } }), sp = new P.Spring(this.pitch, { k: 120, zeta: 0.7, onUpdate: function (v) { self.pitch = v; self.dirty = true; } });
      sy.to(yaw); sp.to(pitch);
    },
    render: function () {
      var c = this.ctx, items = [], self = this, L = this.light, i, f, k, glows = [];
      if (this.autoFit) this._autoFit();
      c.clearRect(0, 0, this.cw, this.ch);
      if (this.onPreRender) this.onPreRender(c, this);
      for (i = 0; i < this.faces.length; i++) {
        f = this.faces[i]; if (f.hidden) continue;
        var vs = f.pts.map(function (p) { return self.view(p); }), n = cross(sub(vs[1], vs[0]), sub(vs[2], vs[0])), nl = Math.hypot(n[0], n[1], n[2]) || 1;
        n = [n[0] / nl, n[1] / nl, n[2] / nl];
        var facing = n[2] > 0; if (this.cull && !facing && !f.double) continue;
        var d = 0; for (k = 0; k < vs.length; k++) d += vs[k][2]; d /= vs.length;
        items.push({ t: 0, d: d, f: f, n: n, facing: facing });
      }
      for (i = 0; i < this.lines.length; i++) { var ln = this.lines[i]; if (ln.hidden) continue; items.push({ t: 1, d: (this.view(ln.a)[2] + this.view(ln.b)[2]) / 2 + (ln.bias || 0.02), l: ln }); }
      for (i = 0; i < this.dots.length; i++) { var dt = this.dots[i]; if (dt.hidden) continue; items.push({ t: 2, d: this.view(dt.p)[2] + 0.04, o: dt }); }
      var allT = this.extraTexts ? this.texts.concat(this.extraTexts) : this.texts;
      for (i = 0; i < allT.length; i++) { var tx = allT[i]; if (tx.hidden || tx.skip) continue; items.push({ t: 3, d: tx.top ? 1e6 : this.view(tx.p)[2] + 0.08, x: tx }); }
      items.sort(function (a, b) { return a.d - b.d; });
      for (i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.t === 0) {
          f = it.f; var s = f.pts.map(function (p) { return self.project(p); }); c.beginPath(); c.moveTo(s[0][0], s[0][1]); for (k = 1; k < s.length; k++) c.lineTo(s[k][0], s[k][1]); c.closePath();
          if (f.fill) { var br = f.flat ? 1 : 0.72 + 0.28 * Math.max(0, it.n[0] * L[0] + it.n[1] * L[1] + it.n[2] * L[2]) * (it.facing ? 1 : 0.6); c.fillStyle = rgb(f.fill, br, f.alpha === undefined ? 1 : f.alpha); c.fill(); }
          if (f.stroke !== null) { c.strokeStyle = f.stroke || 'rgba(18,37,72,.85)'; c.lineWidth = f.lw || 1.6; c.lineJoin = 'round'; c.setLineDash(f.dash || []); c.stroke(); c.setLineDash([]); }
          if (f.label) { var cx = 0, cy = 0; s.forEach(function (q) { cx += q[0]; cy += q[1]; }); c.fillStyle = f.labelColor || '#122548'; c.font = '800 ' + (f.labelSize || 15) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(f.label, cx / s.length, cy / s.length); }
          if (f.glow) glows.push({ f: f, s: s });
        } else if (it.t === 1) {
          var a = this.project(it.l.a), b = this.project(it.l.b); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.strokeStyle = it.l.color || '#122548'; c.lineWidth = it.l.w || 2.5; c.lineCap = 'round'; c.setLineDash(it.l.dash || []); c.stroke(); c.setLineDash([]);
        } else if (it.t === 2) {
          var q = this.project(it.o.p); c.beginPath(); c.arc(q[0], q[1], it.o.r || 6, 0, 6.2832); c.fillStyle = it.o.color || '#122548'; c.fill(); if (it.o.ring) { c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); }
          if (it.o.label) { c.fillStyle = it.o.labelColor || '#122548'; c.font = '800 ' + (it.o.size || 15) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.o.label, q[0] + (it.o.dx || 0), q[1] + (it.o.dy === undefined ? -(it.o.r || 6) - 9 : it.o.dy)); }
        } else {
          var tp = this.project(it.x.p); c.fillStyle = it.x.color || '#122548'; c.font = '800 ' + (it.x.size || 15) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
          if (it.x.bg) { var w = c.measureText(it.x.t).width + 8; c.fillStyle = it.x.bg; c.fillRect(tp[0] + (it.x.dx || 0) - w / 2, tp[1] + (it.x.dy || 0) - 10, w, 20); c.fillStyle = it.x.color || '#122548'; }
          if (it.x.halo) { c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineJoin = 'round'; c.strokeText(it.x.t, tp[0] + (it.x.dx || 0), tp[1] + (it.x.dy || 0)); c.fillStyle = it.x.color || '#122548'; }
          c.fillText(it.x.t, tp[0] + (it.x.dx || 0), tp[1] + (it.x.dy || 0));
        }
      }
      /* 發光的面（face.glow＝光的顏色，glowBig＝更亮更大）：最後再畫一次，光暈會蓋在鄰居上面 */
      glows.forEach(function (g) {
        var gf = g.f, col = typeof gf.glow === 'string' ? gf.glow : (gf.glow.color || gf.fill), big = gf.glowBig ? 1.6 : 1, dpr = self.dpr || 1, s2 = g.s;
        c.save(); c.beginPath(); c.moveTo(s2[0][0], s2[0][1]); for (var q = 1; q < s2.length; q++) c.lineTo(s2[q][0], s2[q][1]); c.closePath();
        c.shadowColor = col; c.shadowBlur = 28 * big * dpr; c.fillStyle = gf.fill ? rgb(gf.fill, 1) : col; c.fill();
        c.shadowBlur = 16 * big * dpr; c.lineWidth = 3.4 * big; c.strokeStyle = col; c.lineJoin = 'round'; c.stroke(); c.restore();
      });
      if (this.onRender) this.onRender(c, this);
      if (this.tagFn) { var tg = this.tagFn(this); if (tg) { c.save(); c.font = '800 13px sans-serif'; var tw = c.measureText(tg).width + 18; c.beginPath(); if (c.roundRect) c.roundRect(8, 8, tw, 26, 13); else c.rect(8, 8, tw, 26); c.fillStyle = 'rgba(255,243,208,.96)'; c.fill(); c.strokeStyle = 'rgba(185,147,72,.9)'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = '#6b4a00'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(tg, 17, 21.5); c.restore(); } }
    },
    /* 滑鼠移過、或手指按住的面改變時呼叫 onHover(face|null, event)；face 可帶 hkey 供辨識（面物件重建後仍視為同一塊） */
    _hover: function (pos, e) {
      var f = pos ? this.pick(pos[0], pos[1]) : null, key = f ? (f.hkey || f) : null;
      if (key !== this._hk) { this._hk = key; if (this.onHover) this.onHover(f, e); }
    },
    /* 點選：回傳最上層的 face（或 null） */
    pick: function (x, y) {
      var self = this, best = null, bd = -1e9;
      for (var i = 0; i < this.faces.length; i++) {
        var f = this.faces[i]; if (f.hidden || f.nopick) continue;
        var vs = f.pts.map(function (p) { return self.view(p); }), n = cross(sub(vs[1], vs[0]), sub(vs[2], vs[0]));
        if (this.cull && n[2] <= 0 && !f.double) continue;
        var s = f.pts.map(function (p) { return self.project(p); }), inside = false;
        for (var a = 0, b = s.length - 1; a < s.length; b = a++) { if (((s[a][1] > y) !== (s[b][1] > y)) && (x < (s[b][0] - s[a][0]) * (y - s[a][1]) / (s[b][1] - s[a][1]) + s[a][0])) inside = !inside; }
        if (inside) { var d = 0; vs.forEach(function (v) { d += v[2]; }); d /= vs.length; if (d > bd) { bd = d; best = f; } }
      }
      return best;
    },
    _pos: function (e) { var r = this.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; },
    _bind: function () {
      var self = this, cv = this.canvas, last = null, moved = 0, start = null;
      cv.addEventListener('touchstart', function (e) { if (!self.canvas.style.touchAction || self.canvas.style.touchAction === 'none') e.preventDefault(); }, { passive: false });
      cv.addEventListener('pointermove', function (e) { if (self.onHover && !self.dragging && (e.pointerType === 'mouse' || e.buttons)) self._hover(self._pos(e), e); });
      cv.addEventListener('pointerleave', function (e) { if (self.onHover && !self.dragging && e.pointerType === 'mouse') self._hover(null, e); });
      cv.addEventListener('pointerdown', function (e) {
        var pos = self._pos(e); if (self.onHover) self._hover(pos, e);
        if (self.onDragStart && self.onDragStart(pos, e) === false) {
          if (self.onHover) { var clr = function (ev) { cv.removeEventListener('pointerup', clr); cv.removeEventListener('pointercancel', clr); self._hover(ev && ev.pointerType === 'mouse' ? self._pos(ev) : null, ev); }; cv.addEventListener('pointerup', clr); cv.addEventListener('pointercancel', clr); }
          return;
        }
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
        self.dragging = true; last = [e.clientX, e.clientY]; start = pos; moved = 0; self.vx = self.vy = 0;
        var mv = function (ev) {
          var dx = ev.clientX - last[0], dy = ev.clientY - last[1]; last = [ev.clientX, ev.clientY]; moved += Math.abs(dx) + Math.abs(dy);
          if (self.onDrag && self.onDrag(self._pos(ev), [dx, dy], ev) === true) return;
          self.yaw += dx * 0.011; if (!self.lockPitch) self.pitch = Math.max(-1.5, Math.min(1.5, self.pitch + dy * 0.011)); self.vx = dx * 0.011; self.vy = self.lockPitch ? 0 : dy * 0.011; self.dirty = true;
        };
        var up = function (ev) { cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); self.dragging = false; if (moved < 6 && self.onTap) self.onTap(start, self.pick(start[0], start[1]), ev); if (self.onDragEnd) self.onDragEnd(self._pos(ev), ev); if (reduce) { self.vx = self.vy = 0; } };
        cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      });
    }
  };
  function o_maxH(s) { return Math.max(200, Math.min(window.innerHeight * 0.5, 420)); }

  /* ---------------------------------------------------------------- 形狀小工具 */
  function box(x, y, z, sx, sy, sz, color, opt) {
    var x1 = x + sx, y1 = y + sy, z1 = z + sz, V = [[x, y, z], [x1, y, z], [x1, y1, z], [x, y1, z], [x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]];
    // 每面頂點順序：由外面看為逆時針（法向朝外）
    var F = [[4, 5, 6, 7], [1, 0, 3, 2], [0, 4, 7, 3], [5, 1, 2, 6], [7, 6, 2, 3], [0, 1, 5, 4]], out = [];
    for (var i = 0; i < 6; i++) { var f = { pts: F[i].map(function (j) { return V[j]; }), fill: color }; if (opt) for (var k in opt) f[k] = opt[k]; out.push(f); }
    return out;
  }
  function cubeFaces(x, y, z, s, color, opt) { return box(x, y, z, s, s, s, color, opt); }
  /* 由頂點與面（索引，外看逆時針）建立 faces */
  function mesh(V, F, color, opt) { return F.map(function (idx, i) { var f = { pts: idx.map(function (j) { return V[j]; }), fill: Array.isArray(color) ? color[i % color.length] : color }; if (opt) for (var k in opt) f[k] = opt[k]; return f; }); }
  var UNIT_CUBE_V = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  var CUBE_EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

  window.Play3D = { Scene: Scene, rotX: rotX, rotY: rotY, rotZ: rotZ, rotAxis: rotAxis, sub: sub, cross: cross, box: box, cubeFaces: cubeFaces, mesh: mesh, hex: hex, rgb: rgb, UNIT_CUBE_V: UNIT_CUBE_V, CUBE_EDGES: CUBE_EDGES };
})();
