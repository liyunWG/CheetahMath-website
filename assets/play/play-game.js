/* 獵豹玩中學｜遊戲共用小函式庫：亂數（可種子化）、倒數計時、難度選擇、最佳成績、結算畫面 */
(function () {
  'use strict';
  var P = window.Play, h = P.h, store = P.store;

  /* ------------------------------------------------ 亂數：mulberry32，同一個題號永遠出同一題 */
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    function f() { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    f.seed = seed;
    f.int = function (n) { return Math.floor(f() * n); };
    f.range = function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.shuffle = function (arr) { var b = arr.slice(), i, j, t; for (i = b.length - 1; i > 0; i--) { j = Math.floor(f() * (i + 1)); t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
    return f;
  }
  function newSeed() { return Math.floor(Math.random() * 999999) + 1; }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  /* ------------------------------------------------ 計時器：limit>0 為倒數（到 0 呼叫 onEnd），limit=0 為正數 */
  function Timer(o) {
    o = o || {}; this.limit = o.limit || 0; this.onTick = o.onTick; this.onEnd = o.onEnd; this.acc = 0; this.t0 = 0; this.running = false; this.iv = null; this.ended = false;
    var self = this; this._vis = function () { if (document.hidden) { if (self.running) { self.pause(); self._auto = true; } } else if (self._auto) { self._auto = false; self.resume(); } };
    document.addEventListener('visibilitychange', this._vis);
  }
  Timer.prototype = {
    elapsed: function () { return this.acc + (this.running ? (Date.now() - this.t0) / 1000 : 0); },
    remaining: function () { return this.limit ? Math.max(0, this.limit - this.elapsed()) : 0; },
    start: function () { this.acc = 0; this.ended = false; this.resume(); },
    resume: function () { var self = this; if (this.running || this.ended) return; this.running = true; this.t0 = Date.now(); clearInterval(this.iv); this.iv = setInterval(function () { self._tick(); }, 200); this._tick(); },
    pause: function () { if (!this.running) return; this.acc = this.elapsed(); this.running = false; clearInterval(this.iv); },
    stop: function () { var e = this.elapsed(); this.pause(); this.ended = true; return e; },
    destroy: function () { this.stop(); document.removeEventListener('visibilitychange', this._vis); },
    _tick: function () {
      var rem = this.remaining(); if (this.onTick) this.onTick(this.limit ? rem : this.elapsed(), this.elapsed());
      if (this.limit && rem <= 0 && !this.ended) { this.stop(); if (this.onEnd) this.onEnd(); }
    }
  };

  /* ------------------------------------------------ 最佳成績／已玩標記 */
  function bestKey(slug, level) { return 'game:' + slug + ':best:' + level; }
  function best(slug, level) { return store.get(bestKey(slug, level), null); }
  /* lowerBetter：時間越短越好；回傳是否破紀錄 */
  function setBest(slug, level, val, lowerBetter) {
    var old = best(slug, level), isNew = old === null || (lowerBetter ? val < old : val > old);
    if (isNew) store.set(bestKey(slug, level), val); return isNew;
  }
  function markDone(slug) { var d = store.get('done', {}); d[slug] = Date.now(); store.set('done', d); }

  /* ------------------------------------------------ 小獵／小豹的鼓勵語 */
  var CHEER = {
    start: ['小獵：慢慢看，先找規律。', '小豹：動手轉一轉，答案會出現。', '小獵：準備好了就開始吧！'],
    win: ['小獵：太厲害了！', '小豹：你的空間感很強喔！', '小獵：下一題會更有趣。'],
    good: ['小豹：答對了！', '小獵：漂亮！', '小豹：保持節奏～'],
    bad: ['小豹：沒關係，再看一次。', '小獵：差一點點，換個角度看看。'],
    fail: ['小獵：時間到！再來一題吧。', '小豹：多玩幾次就會變快。']
  };
  function cheer(kind, r) { var a = CHEER[kind] || CHEER.start; return a[Math.floor((r ? r() : Math.random()) * a.length)]; }

  /* ------------------------------------------------ 遊戲外殼（頁首＋內容區） */
  function shell(cfg) {
    var root = document.getElementById('play-root'); root.innerHTML = '';
    var body = h('div', { class: 'pl-body pgm-body' }), right = h('div', { class: 'pgm-head__r' });
    var head = h('div', { class: 'pl-head pgm-head' }, h('a', { class: 'pl-head__back', href: 'play.html#games' }, '← 遊戲區'), h('div', { class: 'pl-head__title' }, cfg.title), right);
    var card = h('section', { class: 'pl-lesson pgm-card', 'aria-label': cfg.title }, head, body, P.credit());
    root.append(card); document.title = cfg.title + '｜獵豹玩中學｜獵豹科教';
    function toTop() { var top = card.getBoundingClientRect().top + window.scrollY - 8; window.scrollTo({ top: top, behavior: 'auto' }); }
    if (window.innerWidth <= 900) { toTop(); window.addEventListener('load', toTop); setTimeout(toTop, 500); }
    return { card: card, head: head, right: right, body: body, toTop: toTop };
  }

  /* ------------------------------------------------ 難度選擇卡片 */
  var TONE = { warm: 'pgm-lv--1', mid: 'pgm-lv--2', hard: 'pgm-lv--3' };
  function picker(host, cfg) {
    host.innerHTML = '';
    var wrap = h('div', { class: 'pgm-picker' });
    if (cfg.howto) wrap.append(h('div', { class: 'pgm-howto', html: cfg.howto }));
    cfg.levels.forEach(function (lv) {
      var b = best(cfg.slug, lv.id), btn = h('button', { type: 'button', class: 'pgm-level' },
        h('span', { class: 'pgm-lv ' + (TONE[lv.id] || '') }, lv.name),
        h('span', { class: 'pgm-level__body' }, h('b', {}, lv.title || lv.name), h('span', { html: lv.desc }), h('em', {}, cfg.fmtBest ? cfg.fmtBest(b, lv) : (b === null ? '還沒有紀錄' : '最佳：' + b))),
        h('span', { class: 'pgm-level__go', 'aria-hidden': 'true' }, '▶'));
      btn.addEventListener('click', function () { P.track('game_level', { id: cfg.slug, level: lv.id }); cfg.onPick(lv); });
      wrap.append(btn);
    });
    host.append(wrap); return wrap;
  }

  /* ------------------------------------------------ 結算畫面 */
  function stars(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return s; }
  function result(host, cfg) {
    host.innerHTML = '';
    var box = h('div', { class: 'pgm-result' + (cfg.win ? ' is-win' : ' is-fail') });
    var banner = h('div', { class: 'pgm-result__banner' }, h('div', { class: 'pgm-result__emoji', 'aria-hidden': 'true' }, cfg.emoji || (cfg.win ? '🏆' : '⏰')), h('h2', {}, cfg.title));
    box.append(banner);
    if (cfg.stars !== undefined) box.append(h('div', { class: 'pgm-stars', 'aria-label': cfg.stars + ' 顆星' }, stars(cfg.stars)));
    if (cfg.lines && cfg.lines.length) box.append(h('ul', { class: 'pgm-lines' }, cfg.lines.map(function (l) { return h('li', { html: l }); })));
    if (cfg.best) box.append(h('div', { class: 'pgm-best' + (cfg.best.isNew ? ' is-new' : '') }, (cfg.best.isNew ? '🎉 新紀錄！' : '最佳紀錄：') + cfg.best.text));
    box.append(h('div', { class: 'pgm-cheer' }, cfg.cheer || cheer(cfg.win ? 'win' : 'fail')));
    var btns = h('div', { class: 'pgm-btns' });
    (cfg.buttons || []).forEach(function (b) { btns.append(h('button', { type: 'button', class: 'button ' + (b.kind === 'ghost' ? 'button--secondary' : 'button--primary') + ' pgm-btn', onclick: b.fn }, b.text)); });
    box.append(btns);
    if (cfg.teaser) {
      var t = cfg.teaser;
      box.append(h('div', { class: 'pl-label pl-label--gold' }, '想再往下挖？班上才會教的進階挑戰'),
        h('button', { type: 'button', class: 'pl-teaser', onclick: function () { P.track('teaser', { id: cfg.slug, t: t.title }); P.askTeacher('老師您好，我的孩子剛玩了「獵豹玩中學」的遊戲「' + cfg.moduleName + '」，想了解「' + t.title + '」在班上怎麼教（' + t.where + '）。'); } },
          h('span', { class: 'pl-teaser__lock', 'aria-hidden': 'true' }, '🔒'), h('span', { class: 'pl-teaser__body' }, h('b', {}, t.title), h('span', { html: t.q }), h('em', {}, '班上會教：' + t.where)), h('span', { class: 'pl-teaser__lv' }, t.lv || 'L2')));
    }
    box.append(h('div', { class: 'pgm-btns pgm-btns--end' },
      h('button', { type: 'button', class: 'button button--secondary pgm-btn', onclick: function () { P.track('cta_click', { id: cfg.slug }); P.askTeacher('老師您好，我的孩子剛玩了「獵豹玩中學」的遊戲「' + cfg.moduleName + '」，想了解適合的班級與試聽方式。（來源：獵豹玩中學／' + cfg.slug + '）'); } }, '問老師：適合哪一班？'),
      h('a', { class: 'button button--secondary pgm-btn', href: 'play.html#games' }, '回遊戲區')));
    host.append(box);
    if (cfg.win && P.pop) { try { P.pop(banner.querySelector('.pgm-result__emoji')); } catch (e) {} }
    return box;
  }

  window.PlayGame = { rng: rng, newSeed: newSeed, fmt: fmt, Timer: Timer, best: best, setBest: setBest, markDone: markDone, cheer: cheer, shell: shell, picker: picker, result: result, stars: stars };
})();
