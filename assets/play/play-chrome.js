/* 獵豹玩中學｜頁首收尾：site.js 非同步注入導覽列與副標後，再標示目前頁面為「獵豹玩中學」（重複套用至頁面穩定） */
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
})();
