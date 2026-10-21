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
    this.fixedW = o.width || 0; this.faces = []; this.lines = []; this.dots = []; this.texts = []; this.light = [-0.35, 0.8, 0.5];
    this.onRender = null; this.draggable = o.drag !== false; this.lockPitch = !!o.lockPitch; this.onDragStart = o.onDragStart; this.onTap = o.onTap; this.onDrag = o.onDrag;
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
      var w = this.fixedW || (this.wrap.clientWidth - 8); if (w < 50) w = 300; var hh = Math.min(w / this.aspect, this.maxH || o_maxH(this)); var dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.cw = w; this.ch = hh; this.canvas.style.width = this.fixedW ? this.fixedW + 'px' : '100%'; this.canvas.style.maxWidth = '100%'; this.canvas.style.height = hh + 'px'; this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(hh * dpr); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.k = (this.scaleFixed || this.scale) * Math.min(1, w / 330); this.dirty = true;
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
      var c = this.ctx, items = [], self = this, L = this.light, i, f, k;
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
      for (i = 0; i < this.texts.length; i++) { var tx = this.texts[i]; if (tx.hidden) continue; items.push({ t: 3, d: this.view(tx.p)[2] + 0.08, x: tx }); }
      items.sort(function (a, b) { return a.d - b.d; });
      for (i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.t === 0) {
          f = it.f; var s = f.pts.map(function (p) { return self.project(p); }); c.beginPath(); c.moveTo(s[0][0], s[0][1]); for (k = 1; k < s.length; k++) c.lineTo(s[k][0], s[k][1]); c.closePath();
          if (f.fill) { var br = f.flat ? 1 : 0.72 + 0.28 * Math.max(0, it.n[0] * L[0] + it.n[1] * L[1] + it.n[2] * L[2]) * (it.facing ? 1 : 0.6); c.fillStyle = rgb(f.fill, br, f.alpha === undefined ? 1 : f.alpha); c.fill(); }
          if (f.stroke !== null) { c.strokeStyle = f.stroke || 'rgba(18,37,72,.85)'; c.lineWidth = f.lw || 1.6; c.lineJoin = 'round'; c.setLineDash(f.dash || []); c.stroke(); c.setLineDash([]); }
          if (f.label) { var cx = 0, cy = 0; s.forEach(function (q) { cx += q[0]; cy += q[1]; }); c.fillStyle = f.labelColor || '#122548'; c.font = '800 ' + (f.labelSize || 15) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(f.label, cx / s.length, cy / s.length); }
        } else if (it.t === 1) {
          var a = this.project(it.l.a), b = this.project(it.l.b); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.strokeStyle = it.l.color || '#122548'; c.lineWidth = it.l.w || 2.5; c.lineCap = 'round'; c.setLineDash(it.l.dash || []); c.stroke(); c.setLineDash([]);
        } else if (it.t === 2) {
          var q = this.project(it.o.p); c.beginPath(); c.arc(q[0], q[1], it.o.r || 6, 0, 6.2832); c.fillStyle = it.o.color || '#122548'; c.fill(); if (it.o.ring) { c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); }
          if (it.o.label) { c.fillStyle = it.o.labelColor || '#122548'; c.font = '800 ' + (it.o.size || 15) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.o.label, q[0] + (it.o.dx || 0), q[1] + (it.o.dy === undefined ? -(it.o.r || 6) - 9 : it.o.dy)); }
        } else {
          var tp = this.project(it.x.p); c.fillStyle = it.x.color || '#122548'; c.font = '800 ' + (it.x.size || 15) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
          if (it.x.bg) { var w = c.measureText(it.x.t).width + 8; c.fillStyle = it.x.bg; c.fillRect(tp[0] + (it.x.dx || 0) - w / 2, tp[1] + (it.x.dy || 0) - 10, w, 20); c.fillStyle = it.x.color || '#122548'; }
          c.fillText(it.x.t, tp[0] + (it.x.dx || 0), tp[1] + (it.x.dy || 0));
        }
      }
      if (this.onRender) this.onRender(c, this);
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
      cv.addEventListener('pointerdown', function (e) {
        var pos = self._pos(e); if (self.onDragStart && self.onDragStart(pos, e) === false) return;
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
