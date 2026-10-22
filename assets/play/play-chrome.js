/* 獵豹玩中學｜頁首收尾：site.js 非同步注入導覽列與副標後，再標示目前頁面為「獵豹玩中學」（重複套用至頁面穩定）；
   單元／遊戲頁在頁首捲出畫面時，右上角浮出「選單」鈕 */
(function () {
  var tries = 0;
  function fix() {
    var nav = document.querySelector('.nav'), sub = document.querySelector('.brand__subtitle');
    var link = nav && nav.querySelector('a[href="play.html"]');
    if (link) nav.querySelectorAll('a').forEach(function (a) { a.classList.toggle('is-active', a === link); });
    if (sub) sub.textContent = '獵豹玩中學';
  }
  fix();
  var t = setInterval(function () { fix(); if (++tries > 60) clearInterval(t); }, 100);

  if (document.body && document.body.classList.contains('page-play-lesson')) {
    var fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'pl-menu-fab'; fab.setAttribute('aria-label', '開啟主選單'); fab.textContent = '☰';
    document.body.appendChild(fab);
    fab.addEventListener('click', function () {
      window.scrollTo(0, 0);
      var tg = document.querySelector('.topbar__nav-toggle');
      setTimeout(function () { if (tg && tg.getAttribute('aria-expanded') !== 'true') tg.click(); }, 50);
    });
    var bar = document.querySelector('.topbar');
    function sync() { var b = bar ? bar.getBoundingClientRect().bottom : 0; fab.classList.toggle('is-on', b < 8); }
    window.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync); sync(); setInterval(sync, 700);
  }
})();
