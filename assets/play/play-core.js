/* 獵豹玩中學｜互動核心（Lesson 引擎、格線畫板、彈簧動態、元件）
   設計原則：手機優先、每個步驟一屏、拖曳 1:1 跟手、放開後以彈簧吸附到格點。 */
(function () {
  'use strict';
  var NSURI = 'http://www.w3.org/2000/svg';
  var SVGTAGS = { svg: 1, g: 1, circle: 1, rect: 1, line: 1, path: 1, text: 1, polygon: 1, ellipse: 1, polyline: 1, defs: 1, marker: 1, tspan: 1, clipPath: 1 };
  var LINE_URL = 'https://lin.ee/RsjA0Yd';

  function h(tag, attrs) {
    var el = SVGTAGS[tag] ? document.createElementNS(NSURI, tag) : document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, kid) {
    if (kid === null || kid === undefined || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(el, k); }); return; }
    el.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('cheetah-play:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cheetah-play:' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function track(name, data) {
    var ev = Object.assign({ t: Date.now(), name: name }, data || {});
    var log = store.get('events', []); log.push(ev); store.set('events', log.slice(-300));
    if (window.dataLayer) window.dataLayer.push(Object.assign({ event: 'play_' + name }, data || {}));
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ 彈簧動態 */
  var springs = new Set(), tasks = new Set(), last = 0, running = false;
  function frame(t) {
    var dt = Math.min(1 / 30, (t - last) / 1000 || 1 / 60); last = t;
    var n = Math.ceil(dt / (1 / 240)), step = dt / n;
    springs.forEach(function (s) {
      for (var i = 0; i < n; i++) s._step(step);
      if (s.onUpdate) s.onUpdate(s.x, s.v);
      if (s._rest()) { s.x = s.target; s.v = 0; springs.delete(s); if (s.onUpdate) s.onUpdate(s.x, 0); if (s.onRest) s.onRest(); }
    });
    tasks.forEach(function (f) { if (f(dt) === false) tasks.delete(f); });
    if (springs.size || tasks.size) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  function Spring(x, o) { o = o || {}; this.x = x; this.v = 0; this.target = x; this.k = o.k || 260; this.m = o.m || 1; this.zeta = o.zeta === undefined ? 0.7 : o.zeta; this.onUpdate = o.onUpdate; this.onRest = o.onRest; }
  Spring.prototype = {
    get c() { return 2 * this.zeta * Math.sqrt(this.k * this.m); },
    to: function (t, v) { this.target = t; if (v !== undefined) this.v = v; if (reduce) { this.jump(t); return this; } springs.add(this); kick(); return this; },
    jump: function (x) { this.x = x; this.target = x; this.v = 0; springs.delete(this); if (this.onUpdate) this.onUpdate(x, 0); },
    _step: function (dt) { var a = (-this.k * (this.x - this.target) - this.c * this.v) / this.m; this.v += a * dt; this.x += this.v * dt; },
    _rest: function () { return Math.abs(this.v) < 0.01 && Math.abs(this.x - this.target) < 0.002; }
  };
  function run(fn) { tasks.add(fn); kick(); }
  var ease = { inOut: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, out: function (t) { return 1 - Math.pow(1 - t, 3); } };
  /* 小工具：彈出（綠勾、徽章） */
  function pop(el, from) { if (reduce) return; var s = new Spring(from === undefined ? 0 : from, { k: 520, zeta: 0.38, onUpdate: function (v) { el.style.transform = 'scale(' + v + ')'; } }); s.jump(from === undefined ? 0 : from); s.to(1); }
  function shake(el) { if (reduce) return; var s = new Spring(10, { k: 1100, zeta: 0.18, onUpdate: function (v) { el.style.transform = 'translateX(' + v + 'px)'; } }); s.to(0, 0); }

  /* ------------------------------------------------------------ 格線畫板（座標單位＝一格；y 向上） */
  function Board(host, o) {
    o = o || {};
    this.w = o.w || 12; this.hh = o.h || 10; this.pad = o.pad === undefined ? 0.8 : o.pad; this.grid = o.grid || 1; this.snapOn = o.snap !== false;
    this.svg = h('svg', { viewBox: (-this.pad) + ' ' + (-this.pad) + ' ' + (this.w + 2 * this.pad) + ' ' + (this.hh + 2 * this.pad), class: 'pl-svg' + (o.cls ? ' ' + o.cls : ''), preserveAspectRatio: 'xMidYMid meet' });
    this.svg.style.touchAction = 'pan-y pinch-zoom';
    this.gGrid = h('g'); this.gMid = h('g'); this.gTop = h('g');
    this.svg.append(this.gGrid, this.gMid, this.gTop);
    host.append(this.svg);
    this.drawGrid(o);
  }
  Board.prototype = {
    Y: function (y) { return this.hh - y; },
    P: function (p) { return [p[0], this.hh - p[1]]; },
    drawGrid: function (o) {
      var g = this.gGrid; g.innerHTML = '';
      for (var x = 0; x <= this.w; x++) g.append(h('line', { x1: x, y1: 0, x2: x, y2: this.hh, class: x % 5 === 0 ? 'pg-major' : 'pg-minor' }));
      for (var y = 0; y <= this.hh; y++) g.append(h('line', { x1: 0, y1: this.Y(y), x2: this.w, y2: this.Y(y), class: y % 5 === 0 ? 'pg-major' : 'pg-minor' }));
      for (x = 0; x <= this.w; x++) for (y = 0; y <= this.hh; y++) g.append(h('circle', { cx: x, cy: this.Y(y), r: 0.055, class: 'pg-dot' }));
      if (o && o.axes) { g.append(h('line', { x1: 0, y1: this.Y(o.ox || 0), x2: this.w, y2: this.Y(o.ox || 0), class: 'pg-axis' }), h('line', { x1: o.oy || 0, y1: 0, x2: o.oy || 0, y2: this.hh, class: 'pg-axis' })); }
    },
    setSnap: function (on) { this.snapOn = on; },
    fromEvent: function (ev) { var p = this.svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; var q = p.matrixTransform(this.svg.getScreenCTM().inverse()); return [q.x, this.hh - q.y]; },
    clamp: function (p) { return [Math.max(0, Math.min(this.w, p[0])), Math.max(0, Math.min(this.hh, p[1]))]; },
    snap: function (p) { var g = this.grid; p = this.clamp(p); return this.snapOn ? [Math.round(p[0] / g) * g, Math.round(p[1] / g) * g] : p; },
    /* 圖形輔助：參數都用「數學座標」 */
    line: function (a, b, cls, layer, extra) { var el = h('line', Object.assign({ x1: a[0], y1: this.Y(a[1]), x2: b[0], y2: this.Y(b[1]), class: cls || 'pl-line' }, extra || {})); (layer || this.gMid).append(el); return el; },
    setLine: function (el, a, b) { el.setAttribute('x1', a[0]); el.setAttribute('y1', this.Y(a[1])); el.setAttribute('x2', b[0]); el.setAttribute('y2', this.Y(b[1])); },
    poly: function (pts, cls, layer, extra) { var el = h('polygon', Object.assign({ points: this.pts(pts), class: cls || 'pl-poly' }, extra || {})); (layer || this.gMid).append(el); return el; },
    pts: function (pts) { var self = this; return pts.map(function (p) { return p[0].toFixed(3) + ',' + (self.hh - p[1]).toFixed(3); }).join(' '); },
    setPoly: function (el, pts) { el.setAttribute('points', this.pts(pts)); },
    circle: function (c, r, cls, layer, extra) { var el = h('circle', Object.assign({ cx: c[0], cy: this.Y(c[1]), r: r, class: cls || 'pl-circle' }, extra || {})); (layer || this.gMid).append(el); return el; },
    dot: function (c, cls, layer, r) { return this.circle(c, r || 0.16, cls || 'pl-dot', layer); },
    text: function (p, t, cls, layer, extra) { var el = h('text', Object.assign({ x: p[0], y: this.Y(p[1]), class: cls || 'pl-text' }, extra || {})); el.textContent = t; (layer || this.gMid).append(el); return el; },
    setText: function (el, p, t) { el.setAttribute('x', p[0]); el.setAttribute('y', this.Y(p[1])); if (t !== undefined) el.textContent = t; },
    rightMark: function (corner, u, v, s, layer) { s = s || 0.38; var a = [corner[0] + u[0] * s, corner[1] + u[1] * s], b = [a[0] + v[0] * s, a[1] + v[1] * s], c = [corner[0] + v[0] * s, corner[1] + v[1] * s]; var el = h('polyline', { points: this.pts([a, b, c]), class: 'pl-right' }); (layer || this.gMid).append(el); return el; },
    /* 可拖曳把手。opts: pos, candidates（只能停在這些點上）, constrain(raw)->點, onMove(p), onEnd(p), r */
    handle: function (opts) {
      var self = this, r = opts.r || 0.46;
      var ring = h('circle', { r: 0.5, class: 'pl-ring', cx: 0, cy: 0 }); ring.style.opacity = 0;
      var g = h('g', { class: 'pl-handle' + (opts.cls ? ' ' + opts.cls : '') }, h('circle', { r: 1.0, fill: 'transparent' }), h('circle', { r: r, class: 'pl-hd' }));
      this.gTop.append(ring, g);
      var sx = new Spring(0, { k: 520, zeta: 0.62 }), sy = new Spring(0, { k: 520, zeta: 0.62 });
      var api = { pos: opts.pos.slice(), el: g, active: false };
      function place() { g.setAttribute('transform', 'translate(' + sx.x + ',' + sy.x + ')'); }
      sx.onUpdate = place; sy.onUpdate = place;
      api.set = function (p, instant) { api.pos = p.slice(); if (instant) { sx.jump(p[0]); sy.jump(self.Y(p[1])); } else { sx.to(p[0]); sy.to(self.Y(p[1])); } };
      api.set(opts.pos, true);
      api.hide = function (v) { g.style.display = v ? 'none' : ''; ring.style.display = v ? 'none' : ''; };
      function target(raw) {
        var t = raw;
        var cs = typeof opts.candidates === 'function' ? opts.candidates() : opts.candidates;
        if (cs) { var best = null, bd = 1e9; cs.forEach(function (c) { var d = Math.hypot(c[0] - raw[0], c[1] - raw[1]); if (d < bd) { bd = d; best = c; } }); return best; }
        if (opts.constrain) t = opts.constrain(raw);
        return self.snap(t);
      }
      g.addEventListener('touchstart', function (e) { if (!(opts.disabled && opts.disabled())) e.preventDefault(); }, { passive: false });
      g.addEventListener('pointerdown', function (e) {
        if (opts.disabled && opts.disabled()) return;
        e.preventDefault(); try { g.setPointerCapture(e.pointerId); } catch (_) {}
        api.active = true; g.classList.add('is-drag');
        var mv = function (ev) { var raw = self.fromEvent(ev); var t = target(raw); if (opts.valid && !opts.valid(t)) return; ring.setAttribute('cx', t[0]); ring.setAttribute('cy', self.Y(t[1])); ring.style.opacity = 1;
          if (t[0] !== api.pos[0] || t[1] !== api.pos[1]) { api.pos = t.slice(); sx.to(t[0]); sy.to(self.Y(t[1])); opts.onMove && opts.onMove(t, raw); } };
        var up = function () { g.removeEventListener('pointermove', mv); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); api.active = false; g.classList.remove('is-drag'); ring.style.opacity = 0; opts.onEnd && opts.onEnd(api.pos); };
        g.addEventListener('pointermove', mv); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up); mv(e);
      });
      return api;
    },
    /* 在板子上拖曳任意元素（例如整個圖形） */
    dragBody: function (el, onMove, onEnd) {
      var self = this;
      el.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) {}
        var p0 = self.fromEvent(e), last = p0;
        var mv = function (ev) { var p = self.fromEvent(ev); onMove(p, [p[0] - p0[0], p[1] - p0[1]], p0); last = p; };
        var up = function () { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); onEnd && onEnd(); };
        el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
    }
  };
  /* 「格點吸附」開關（所有幾何畫板共用） */
  function snapSwitch(board, host) {
    var btn = h('button', { type: 'button', class: 'pl-chipbtn is-on', 'aria-pressed': 'true' }, '⌗ 格點吸附：開');
    btn.addEventListener('click', function () { var on = !board.snapOn; board.setSnap(on); btn.classList.toggle('is-on', on); btn.setAttribute('aria-pressed', on); btn.textContent = '⌗ 格點吸附：' + (on ? '開' : '關'); track('snap_toggle', { on: on }); });
    (host || board.svg.parentNode).append(btn); return btn;
  }

  /* ------------------------------------------------------------ 共用元件 */
  function ruleBox(html, label) { return h('div', { class: 'pl-rule' }, h('span', { class: 'pl-rule__lb' }, label || '性質'), h('div', { html: html })); }
  function instr(html) { return h('div', { class: 'pl-instr', html: html }); }
  function hint(html) { return h('div', { class: 'pl-hint', html: html }); }
  function pill(html, cls) { return h('span', { class: 'pl-pill ' + (cls || ''), html: html }); }
  function toast(msg) { var t = document.querySelector('.pl-toast'); if (!t) { t = h('div', { class: 'pl-toast' }); document.body.append(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2200); }

  function choice(host, api, cfg) {
    var box = h('div', { class: 'pl-choice' });
    if (cfg.label) box.append(h('div', { class: 'pl-label' }, cfg.label));
    box.append(h('div', { class: 'pl-q', html: cfg.prompt }));
    var fb = h('div', { class: 'pl-fb' }), list = h('div', { class: 'pl-opts' + (cfg.row ? ' pl-opts--row' : '') }), locked = false;
    cfg.options.forEach(function (o, i) {
      var b = h('button', { type: 'button', class: 'pl-opt' }, h('span', { html: o.t }));
      b.addEventListener('click', function () {
        if (locked) return;
        if (cfg.predict) { locked = true; box.classList.add('is-done'); b.classList.add('is-sel'); fb.className = 'pl-fb is-good'; fb.textContent = '好，預測記下了！來驗證看看。'; track('predict', { step: cfg.id, i: i }); if (cfg.onAnswer) cfg.onAnswer(i); return; }
        if (o.ok) { locked = true; b.classList.add('is-right'); fb.className = 'pl-fb is-good'; fb.innerHTML = o.fb || '答對了！'; track('choice_ok', { step: cfg.id }); if (cfg.onAnswer) cfg.onAnswer(i); }
        else { b.classList.remove('is-wrong'); void b.offsetWidth; b.classList.add('is-wrong'); shake(b); fb.className = 'pl-fb is-bad'; fb.innerHTML = o.fb || '再想想看～'; track('choice_wrong', { step: cfg.id }); }
      });
      list.append(b);
    });
    box.append(list, fb); host.append(box); return box;
  }
  function numBox(host, cfg) {
    var inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '答案' });
    var ck = h('div', { class: 'pl-ck' }, '✓');
    var box = h('div', { class: 'pl-numbox' }, cfg.before ? h('span', { html: cfg.before }) : null, inp, cfg.unit ? h('span', {}, cfg.unit) : null, ck);
    var fb = h('div', { class: 'pl-fb' }), done = false;
    function chk() {
      if (done) return; var v = parseFloat(String(inp.value).replace(/[−－–]/g, '-').replace(/[^0-9.\-]/g, '')); if (isNaN(v)) return;
      if (Math.abs(v - cfg.answer) < 1e-6) { done = true; box.classList.add('is-ok'); box.classList.remove('is-bad'); inp.disabled = true; fb.className = 'pl-fb is-good'; fb.innerHTML = cfg.okMsg || ''; pop(ck); track('num_ok'); if (cfg.onOk) cfg.onOk(); }
      else { box.classList.add('is-bad'); shake(box); setTimeout(function () { box.classList.remove('is-bad'); }, 500); fb.className = 'pl-fb is-bad'; fb.innerHTML = (cfg.wrong && cfg.wrong(v)) || '再想想看～'; track('num_wrong'); fb.style.scrollMarginBottom = '96px'; try { fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }
    }
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') chk(); });
    host.append(box, h('div', { class: 'pl-row pl-row--center' }, h('button', { type: 'button', class: 'button button--primary pl-small', onclick: chk }, '確認')), fb);
  }
  /* 積木填空：點積木放進空格，全對出現綠勾 */
  function fillSlots(host, cfg) {
    var n = cfg.answer.length, placed = Array(n).fill(null), done = false, slots = [], chipEls = {};
    var box = h('div', { class: 'pl-slotbox' }), tray = h('div', { class: 'pl-tray' }), ck = h('div', { class: 'pl-ck' }, '✓');
    var byId = {}; cfg.chips.forEach(function (c) { byId[c.id] = c; });
    cfg.parts.forEach(function (p) {
      if (typeof p === 'string') box.append(h('span', { html: p }));
      else { var s = h('button', { type: 'button', class: 'pl-slot', 'aria-label': '空格' }); s.addEventListener('click', function () { if (done) return; var id = placed[p.slot]; if (id !== null) { placed[p.slot] = null; chipEls[id].classList.remove('is-used'); draw(); } }); slots[p.slot] = s; box.append(s); }
    });
    box.append(ck);
    cfg.chips.forEach(function (c) { var el = h('button', { type: 'button', class: 'pl-tchip', html: c.html }); el.addEventListener('click', function () { if (done) return; var i = placed.indexOf(null); if (i < 0) return; placed[i] = c.id; el.classList.add('is-used'); draw(); check(); }); chipEls[c.id] = el; tray.append(el); });
    function draw() { slots.forEach(function (s, i) { var id = placed[i]; s.innerHTML = id === null ? '' : byId[id].html; s.className = 'pl-slot' + (id === null ? '' : ' is-fill'); }); }
    function check() {
      if (placed.indexOf(null) >= 0) return;
      var ok = cfg.anyOrder ? placed.slice().sort().join() === cfg.answer.slice().sort().join() : placed.every(function (id, i) { return id === cfg.answer[i]; });
      if (ok) { done = true; box.classList.add('is-ok'); pop(ck); track('slot_ok'); if (cfg.onOk) cfg.onOk(); }
      else { slots.forEach(function (s) { s.classList.add('is-bad'); shake(s); }); track('slot_wrong'); if (cfg.onBad) cfg.onBad(); setTimeout(function () { placed.fill(null); Object.keys(chipEls).forEach(function (k) { chipEls[k].classList.remove('is-used'); }); draw(); }, 800); }
    }
    host.append(box, tray); draw();
  }
  /* 大圓點滑桿 */
  function slider(min, max, value, onInput, step) {
    var s = h('input', { type: 'range', class: 'pl-slider', min: min, max: max, value: value, step: step || 1 }); s.addEventListener('input', function () { onInput(+s.value); }); return s;
  }
  /* 步進器（手機好按）：回傳 {el, set(v)} */
  function stepper(label, min, max, value, onChange, fmt) {
    var v = value, out = h('span', { class: 'pl-stepper__v' }), minus = h('button', { type: 'button', class: 'pl-stepper__b', 'aria-label': label + ' 減一' }, '−'), plus = h('button', { type: 'button', class: 'pl-stepper__b', 'aria-label': label + ' 加一' }, '＋');
    function draw() { out.textContent = fmt ? fmt(v) : v; minus.disabled = v <= min; plus.disabled = v >= max; }
    function set(n, silent) { v = Math.max(min, Math.min(max, n)); draw(); if (!silent) onChange(v); }
    minus.addEventListener('click', function () { set(v - 1); }); plus.addEventListener('click', function () { set(v + 1); }); draw();
    return { el: h('div', { class: 'pl-stepper' }, h('span', { class: 'pl-stepper__l', html: label }), minus, out, plus), set: set, get: function () { return v; } };
  }

  /* ------------------------------------------------------------ 完成頁：性質卡、深度標尺、鎖住的進階卡、問老師 */
  function depthRuler(d) {
    // d: {here:0..1, cheetah:[{at:0..1, label}]}
    var bar = h('div', { class: 'pl-ruler__bar' },
      h('span', { class: 'pl-ruler__seg pl-ruler__seg--1' }, '課綱'), h('span', { class: 'pl-ruler__seg pl-ruler__seg--2' }, '資優'), h('span', { class: 'pl-ruler__seg pl-ruler__seg--3' }, '競賽'));
    var wrap = h('div', { class: 'pl-ruler' }, h('div', { class: 'pl-ruler__title' }, '深度標尺'), h('div', { class: 'pl-ruler__track' }, bar));
    var here = h('div', { class: 'pl-ruler__mk pl-ruler__mk--here', style: { left: (d.here * 100) + '%' } }, h('b', {}, '你剛玩的'), h('i'));
    wrap.querySelector('.pl-ruler__track').append(here);
    (d.cheetah || []).forEach(function (c, i) { wrap.querySelector('.pl-ruler__track').append(h('div', { class: 'pl-ruler__mk pl-ruler__mk--cheetah', style: { left: (c.at * 100) + '%' } }, h('i'), h('b', { html: c.label }))); });
    return wrap;
  }
  function askTeacher(text) {
    track('cta_click');
    try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) {}
    var ta = h('textarea', { readonly: true }, text);
    var m = h('div', { class: 'pl-modal' }, h('div', { class: 'pl-modal__box' }, h('h3', {}, '訊息已複製，貼到 LINE 就能傳給老師'), ta,
      h('div', { class: 'pl-row pl-row--end' }, h('a', { class: 'button button--primary pl-small', href: LINE_URL, target: '_blank', rel: 'noreferrer' }, '開啟獵豹官方 LINE'), h('button', { type: 'button', class: 'button button--secondary pl-small', onclick: function () { m.remove(); } }, '關閉'))));
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
    document.body.append(m); ta.select();
  }
  function complete(host, cfg) {
    track('complete', { id: cfg.id });
    var done = store.get('done', {}); done[cfg.id] = Date.now(); store.set('done', done);
    var teasers = (cfg.teasers || []).map(function (t) {
      return h('button', { type: 'button', class: 'pl-teaser', onclick: function () { track('teaser', { id: cfg.id, t: t.title }); askTeacher('老師您好，我的孩子剛玩了網站上的「' + cfg.moduleName + '」，想了解「' + t.title + '」在班上怎麼教（' + t.where + '）。'); } },
        h('span', { class: 'pl-teaser__lock', 'aria-hidden': 'true' }, '🔒'), h('span', { class: 'pl-teaser__body' }, h('b', {}, t.title), h('span', { html: t.q }), h('em', {}, '班上會教：' + t.where)), h('span', { class: 'pl-teaser__lv' }, t.lv || 'L2'));
    });
    host.append(
      h('div', { class: 'pl-done' },
        h('div', { class: 'pl-label' }, '完成！你發現了'),
        h('div', { class: 'pl-aha', html: cfg.aha }),
        h('div', { class: 'pl-cards' }, (cfg.cards || []).map(function (c) { return h('div', { class: 'pl-pcard' }, h('b', {}, c.text), h('span', {}, '出處：' + c.src)); })),
        depthRuler(cfg.depth),
        h('div', { class: 'pl-label pl-label--gold' }, '想再往下挖？班上才會教的進階挑戰'),
        h('div', { class: 'pl-teasers' }, teasers),
        h('details', { class: 'pl-parent', onclick: function () { track('parent_open', { id: cfg.id }); } }, h('summary', {}, '家長看這裡：孩子可能卡在哪？'),
          h('div', { class: 'pl-parent__body' }, h('h4', {}, '孩子可能卡在哪'), h('div', { html: cfg.parent.pitfall }), h('h4', {}, '這個概念的位置'), h('div', { html: cfg.parent.place }), h('h4', {}, '在家可以問孩子'), h('ul', {}, cfg.parent.ask.map(function (q) { return h('li', { html: q }); })),
            h('h4', {}, '在獵豹哪裡會系統教'), h('ul', {}, cfg.classes.map(function (c) { return h('li', { html: c }); })))),
        h('div', { class: 'pl-row pl-row--center pl-gap' },
          h('button', { type: 'button', class: 'button button--primary', onclick: function () { askTeacher('老師您好，我的孩子剛玩了網站上的「' + cfg.moduleName + '」，想了解' + cfg.askAbout + '的班級狀況與試聽方式。（來源：獵豹玩中學／' + cfg.id + '）'); } }, '問老師：我的孩子適合哪一班？'),
          cfg.next ? h('a', { class: 'button button--secondary', href: cfg.next.href }, cfg.next.text + ' →') : null,
          h('a', { class: 'button button--secondary', href: 'play.html' }, '回獵豹玩中學'))));
  }

  /* ------------------------------------------------------------ Lesson 引擎 */
  function Lesson(cfg) {
    var self = this; this.cfg = cfg; this.i = -1; this.ctx = {};
    var root = document.getElementById('play-root'); root.innerHTML = '';
    this.dots = h('div', { class: 'pl-dots', 'aria-hidden': 'true' }); cfg.steps.forEach(function () { self.dots.append(h('i')); });
    this.stage = h('div', { class: 'pl-body' });
    this.msg = h('div', { class: 'pl-foot__msg', 'aria-live': 'polite' });
    this.next = h('button', { type: 'button', class: 'button button--primary pl-next' }, '繼續 ▶');
    this.back = h('button', { type: 'button', class: 'button button--secondary pl-back', 'aria-label': '上一步' }, '◀');
    this.next.addEventListener('click', function () { self.go(self.i + 1); }); this.back.addEventListener('click', function () { self.go(self.i - 1); });
    this.foot = h('div', { class: 'pl-foot' }, this.back, this.msg, this.next);
    this.card = h('section', { class: 'pl-lesson', 'aria-label': cfg.title }, h('div', { class: 'pl-head' }, h('a', { class: 'pl-head__back', href: 'play.html' }, '← 獵豹玩中學'), h('div', { class: 'pl-head__title' }, cfg.title), this.dots), this.stage, this.foot);
    root.append(this.card);
    document.title = cfg.title + '｜獵豹玩中學｜獵豹科教';
    track('start', { id: cfg.id }); this.go(0, true);
    if (window.innerWidth <= 900) {
      /* 手機：頁首載入後版面還會位移，幾次校正到卡片頂端（使用者自己捲動過就不再動） */
      var fixTop = function () { if (self.i === 0 && Math.abs(window.scrollY - (self._y || 0)) < 3) self.toTop(true); };
      window.addEventListener('load', fixTop); setTimeout(fixTop, 500); setTimeout(fixTop, 1400);
    }
  }
  Lesson.prototype = {
    unlock: function (m) { this.next.disabled = false; this.msg.textContent = m || ''; this.next.classList.add('is-ready'); },
    lock: function (m) { this.next.disabled = true; this.msg.textContent = m || ''; this.next.classList.remove('is-ready'); },
    go: function (n, first) {
      if (n < 0 || n >= this.cfg.steps.length) return; var self = this; this.i = n;
      Array.prototype.forEach.call(this.dots.children, function (d, k) { d.className = k < n ? 'on' : k === n ? 'cur' : ''; });
      var tt = document.querySelector('.pl-toast'); if (tt) tt.classList.remove('show'); this.stage.innerHTML = ''; var last = n === this.cfg.steps.length - 1;
      this.foot.style.display = last ? 'none' : ''; this.back.style.visibility = n === 0 ? 'hidden' : 'visible'; this.lock('');
      var api = { unlock: function (m) { self.unlock(m); }, lock: function (m) { self.lock(m); }, ctx: this.ctx, lesson: this, isLast: last };
      track('step', { id: this.cfg.id, n: n });
      this.cfg.steps[n](this.stage, api);
      if (!first || window.innerWidth <= 900) this.toTop(first);
    },
    toTop: function (instant) { var top = this.card.getBoundingClientRect().top + window.scrollY - 8; window.scrollTo({ top: top, behavior: (reduce || instant) ? 'auto' : 'smooth' }); this._y = instant ? Math.max(0, top) : this._y; }
  };

  window.Play = { h: h, store: store, track: track, Spring: Spring, run: run, ease: ease, pop: pop, shake: shake, Board: Board, snapSwitch: snapSwitch, ruleBox: ruleBox, instr: instr, hint: hint, pill: pill, toast: toast, choice: choice, numBox: numBox, fillSlots: fillSlots, slider: slider, stepper: stepper, complete: complete, Lesson: Lesson, askTeacher: askTeacher, LINE_URL: LINE_URL };
})();
