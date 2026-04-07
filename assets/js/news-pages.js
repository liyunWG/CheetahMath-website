(function () {
  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }
  const ARTICLE = window.__ARTICLE_FORMAT__ || {};
  function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }
  function escapeRegExp(value) { return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function normalizeAssetSrc(value) { return String(value || "").replace(/&amp;/g, "&").trim(); }
  function stripDuplicateImageNodes(html, sources) {
    let result = String(html || "");
    unique((sources || []).map(normalizeAssetSrc)).forEach(function (src) {
      if (!src) return;
      const escaped = escapeRegExp(src).replace(/&/g, "(?:&|&amp;)");
      result = result
        .replace(new RegExp('<p[^>]*>\\s*<img[^>]+src="' + escaped + '"[^>]*>\\s*</p>', "gi"), "")
        .replace(new RegExp('<div[^>]*>\\s*<img[^>]+src="' + escaped + '"[^>]*>\\s*</div>', "gi"), "")
        .replace(new RegExp('<figure[^>]*>\\s*<img[^>]+src="' + escaped + '"[^>]*>\\s*</figure>', "gi"), "")
        .replace(new RegExp('<img[^>]+src="' + escaped + '"[^>]*>', "gi"), "");
    });
    return result;
  }
  function getPageName() { return window.location.pathname.split("/").pop() || "index.html"; }
  function getParams() { return new URLSearchParams(window.location.search); }
  function newsStoryUrl(slug) { return slug ? "news-story.html?slug=" + encodeURIComponent(slug) : "news-story.html"; }
  function unique(values) { return Array.from(new Set((values || []).filter(Boolean))); }
  function updateMeta(title, description) {
    document.title = title;
    [["meta[name='description']", description],["meta[property='og:title']", title],["meta[property='og:description']", description],["meta[property='og:url']", location.href],["meta[name='twitter:title']", title],["meta[name='twitter:description']", description]].forEach(function (entry) {
      const node = document.querySelector(entry[0]); if (node) node.setAttribute("content", entry[1]);
    });
  }
  function loadNewsData() {
    return (window.__NEWS_DATA__ || []).filter(function (item) { return String(item.keep || "保留").trim() !== "不保留"; }).sort(function (a, b) { return (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0); });
  }
  function renderTags(tags, limit) {
    const normalized = typeof limit === "number" ? unique(tags).slice(0, limit) : unique(tags);
    if (!normalized.length) return "";
    return '<div class="tag-row">' + normalized.map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>';
  }
  function renderPager(currentPage, totalPages) {
    if (totalPages <= 1) return "";
    let html = '<div class="elite-pager">';
    for (let i = 1; i <= totalPages; i += 1) html += '<button type="button" class="elite-pager__button' + (i === currentPage ? ' is-active' : '') + '" data-page="' + i + '">' + i + '</button>';
    return html + '</div>';
  }
  function renderNewsCard(item) {
    return ARTICLE.renderPreviewCard
      ? ARTICLE.renderPreviewCard({
          item: item,
          url: newsStoryUrl(item.slug),
          coverImage: item.coverImage,
          fallbackLabel: item.cover || item.category || '最新消息',
          fallbackTone: 'gold',
          previewMetaFields: ['date', 'category', 'bucket'],
          linkLabel: '閱讀全文'
        })
      : '';
  }
  function renderNewsPage(data) {
    const main = qs('main.page'); if (!main) return;
    const pageSize = 12; let currentPage = 1;
    main.innerHTML = '<section class="page-hero"><div class="container"><span class="eyebrow">最新消息</span><h1>最新消息</h1><p>直播講座、活動公告與重要更新，都集中整理在這裡。</p></div></section><section class="section"><div class="container"><div class="elite-toolbar"><label class="elite-toolbar__field"><span>搜尋消息</span><input id="news-search" class="search-input" type="search" placeholder="輸入關鍵字，例如 科學班、直播講座、前瞻營"></label></div><div class="elite-summary-bar"><strong id="news-count">0</strong><span>篇結果</span></div><div id="news-results" class="grid grid--3 elite-grid"></div><div id="news-pager-wrap"></div></div></section>';
    const searchInput = qs('#news-search'); const countNode = qs('#news-count'); const resultsNode = qs('#news-results'); const pagerNode = qs('#news-pager-wrap');
    function getFilteredItems() {
      const q = (searchInput.value || '').trim().toLowerCase();
      return data.filter(function (item) {
        const haystack = [item.title, item.summary, item.excerpt, item.bodyText].concat(item.tags || []).concat(item.keywords || []).join(' ').toLowerCase();
        return !q || haystack.indexOf(q) >= 0;
      });
    }
    function draw() {
      const filtered = getFilteredItems(); const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize)); if (currentPage > totalPages) currentPage = 1;
      const start = (currentPage - 1) * pageSize; const items = filtered.slice(start, start + pageSize);
      countNode.textContent = String(filtered.length);
      resultsNode.innerHTML = items.length ? items.map(renderNewsCard).join('') : '<div class="empty-state elite-empty"><h3>找不到符合條件的最新消息</h3><p>請試試別的關鍵字。</p></div>';
      pagerNode.innerHTML = renderPager(currentPage, totalPages);
      qsa('[data-page]', pagerNode).forEach(function (button) { button.addEventListener('click', function () { currentPage = Number(button.getAttribute('data-page')); draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
    }
    searchInput.addEventListener('input', function () { currentPage = 1; draw(); });
    updateMeta('最新消息｜獵豹科教', '獵豹最新消息頁面，整理科學班、數資班、直播講座與重要活動公告。');
    draw();
  }
  function renderNewsStory(data) {
    const main = qs('main.page'); if (!main) return;
    const slug = getParams().get('slug'); const item = data.find(function (entry) { return entry.slug === slug; }) || data[0];
    if (!item) { main.innerHTML = '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這篇最新消息</h1><p>請回到最新消息列表重新選擇文章。</p><a class="button button--primary" href="news.html">回到最新消息</a></div></div></section>'; return; }
    main.innerHTML = ARTICLE.renderDetailPage({
      sectionLabel: '最新消息',
      backHref: 'news.html',
      backLabel: '返回最新消息',
      item: item,
      stripImages: [item.coverImage],
      metadataItems: [
        { label: '日期', value: item.date },
        { label: '分類', value: item.category },
        { label: 'slug', value: item.slug }
      ]
    });
    updateMeta(item.title + '｜最新消息', item.summary || item.excerpt || '最新消息');
  }
  function init() { const data = loadNewsData(); if (!data.length) return; const page = getPageName(); if (page === 'news.html') renderNewsPage(data); if (page === 'news-story.html') renderNewsStory(data); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
