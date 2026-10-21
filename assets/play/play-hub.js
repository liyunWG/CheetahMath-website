/* 獵豹玩中學｜總覽頁：年段／領域篩選、已玩過標記 */
(function () {
  var grid = document.getElementById('play-grid'); if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.play-card')), allCards = [].slice.call(document.querySelectorAll('.play-card')), empty = document.getElementById('play-empty'), want = { grade: '', area: '' };
  function apply() {
    var shown = 0;
    cards.forEach(function (c) { var ok = (!want.grade || c.dataset.grade === want.grade || c.dataset.grade === 'all') && (!want.area || c.dataset.area === want.area); c.hidden = !ok; if (ok) shown++; });
    empty.hidden = shown > 0;
  }
  [].forEach.call(document.querySelectorAll('.play-filter-row'), function (row) {
    row.addEventListener('click', function (e) {
      var b = e.target.closest('.chipbtn'); if (!b) return;
      [].forEach.call(row.querySelectorAll('.chipbtn'), function (x) { x.classList.toggle('is-on', x === b); });
      want[row.dataset.group] = b.dataset.v; apply();
    });
  });
  try {
    var done = JSON.parse(localStorage.getItem('cheetah-play:done') || '{}');
    allCards.forEach(function (c) { if (done[c.dataset.slug]) { var m = c.querySelector('.done-mark'); if (m) m.hidden = false; } });
  } catch (e) {}
})();
