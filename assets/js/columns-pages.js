(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  const ARTICLE = window.__ARTICLE_FORMAT__ || {};

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getPageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function articleUrl(slug) {
    return slug
      ? "article.html?slug=" + encodeURIComponent(slug)
      : "article.html";
  }

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeAssetSrc(value) {
    return String(value || "").replace(/&amp;/g, "&").trim();
  }

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

  function updateMeta(title, description) {
    document.title = title;
    [
      ["meta[name='description']", description],
      ["meta[property='og:title']", title],
      ["meta[property='og:description']", description],
      ["meta[property='og:url']", location.href],
      ["meta[name='twitter:title']", title],
      ["meta[name='twitter:description']", description]
    ].forEach(function (entry) {
      const node = document.querySelector(entry[0]);
      if (node) node.setAttribute("content", entry[1]);
    });
  }

  function loadColumnsModel() {
    const raw = window.__COLUMNS_DATA__ || {};
    const categories = Array.isArray(raw.categories) ? raw.categories : [];
    const items = (Array.isArray(raw.items) ? raw.items : [])
      .filter(function (item) {
        return String(item.keep || "保留").trim() !== "不保留";
      })
      .sort(function (a, b) {
        return (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0);
      });

    return { categories: categories, items: items };
  }

  function renderTags(tags, limit) {
    const normalized = typeof limit === "number" ? unique(tags).slice(0, limit) : unique(tags);
    if (!normalized.length) return "";
    return (
      '<div class="tag-row">' +
      normalized
        .map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function renderPager(currentPage, totalPages) {
    if (totalPages <= 1) return "";
    let html = '<div class="elite-pager">';
    for (let i = 1; i <= totalPages; i += 1) {
      html +=
        '<button type="button" class="elite-pager__button' +
        (i === currentPage ? " is-active" : "") +
        '" data-page="' +
        i +
        '">' +
        i +
        "</button>";
    }
    html += "</div>";
    return html;
  }

  function getCoverImage(item) {
    return item && item.coverImage ? item.coverImage : "";
  }

  function renderColumnCard(item) {
    const coverImage = getCoverImage(item);
    return ARTICLE.renderPreviewCard
      ? ARTICLE.renderPreviewCard({
          item: item,
          url: articleUrl(item.slug),
          coverImage: coverImage,
          fallbackLabel: item.category || "文章專欄",
          fallbackTone: "navy",
          previewMetaFields: ["date", "category", "bucket"],
          linkLabel: "閱讀全文"
        })
      : "";
  }

  function renderColumnsPage(model) {
    const main = qs("main.page");
    if (!main) return;

    const data = model.items;
    const categories = model.categories;
    const categoryMap = Object.fromEntries(
      categories.map(function (category) {
        return [category.slug, category];
      })
    );
    const searchKeyword = (getParams().get("q") || "").trim();
    const selectedCategory = getParams().get("category") || "";
    const countNodeId = "columns-count";
    const pageSize = 12;

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<span class="eyebrow">文章專欄</span>' +
      "<h1>文章專欄</h1>" +
      "</div>" +
      "</section>" +
      '<section class="section">' +
      '<div class="container">' +
      '<div class="elite-toolbar">' +
      '<label class="elite-toolbar__field">' +
      "<span>搜尋文章</span>" +
      '<input id="columns-search" class="search-input" type="search" placeholder="輸入關鍵字，例如 AMC、教育、家長、科學班" value="' +
      escapeHtml(searchKeyword) +
      '">' +
      "</label>" +
      '<label class="elite-toolbar__field">' +
      "<span>分類</span>" +
      '<select id="columns-category"><option value="">全部分類</option>' +
      categories
        .map(function (category) {
          return (
            '<option value="' +
            escapeHtml(category.slug) +
            '"' +
            (category.slug === selectedCategory ? " selected" : "") +
            ">" +
            escapeHtml(category.name) +
            "</option>"
          );
        })
        .join("") +
      "</select>" +
      "</label>" +
      "</div>" +
      '<div id="columns-category-note" class="card" style="margin-bottom:20px;"></div>' +
      '<div class="elite-summary-bar"><strong id="' +
      countNodeId +
      '">0</strong><span>篇結果</span></div>' +
      '<div id="columns-results" class="grid grid--3 elite-grid"></div>' +
      '<div id="columns-pager-wrap"></div>' +
      "</div>" +
      "</section>";

    const searchInput = qs("#columns-search");
    const categorySelect = qs("#columns-category");
    const categoryNote = qs("#columns-category-note");
    const countNode = qs("#" + countNodeId);
    const resultsNode = qs("#columns-results");
    const pagerNode = qs("#columns-pager-wrap");
    let currentPage = 1;

    function drawCategoryNote() {
      const category = categoryMap[categorySelect.value];
      if (!category) {
        categoryNote.innerHTML =
          "<h3>全部分類</h3><p>可直接搜尋關鍵字，或從下拉選單選擇六大子項目。手機上也能快速操作。</p>";
        return;
      }
      categoryNote.innerHTML =
        "<h3>" +
        escapeHtml(category.name) +
        "</h3><p>" +
        escapeHtml(category.description || "") +
        "</p>";
    }

    function getFilteredItems() {
      const q = (searchInput.value || "").trim().toLowerCase();
      const categoryValue = categorySelect.value;
      return data.filter(function (item) {
        const haystack = [item.title, item.summary, item.excerpt, item.bodyText]
          .concat(item.tags || [])
          .join(" ")
          .toLowerCase();
        return (!q || haystack.indexOf(q) >= 0) && (!categoryValue || item.categorySlug === categoryValue);
      });
    }

    function syncUrl() {
      const url = new URL(window.location.href);
      const q = (searchInput.value || "").trim();
      const categoryValue = categorySelect.value;
      q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
      categoryValue ? url.searchParams.set("category", categoryValue) : url.searchParams.delete("category");
      history.replaceState({}, "", url);
    }

    function draw() {
      const filtered = getFilteredItems();
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);
      countNode.textContent = String(filtered.length);
      resultsNode.innerHTML = items.length
        ? items.map(renderColumnCard).join("")
        : '<div class="empty-state elite-empty"><h3>找不到符合條件的文章</h3><p>請試試別的關鍵字，或先清空分類條件。</p></div>';
      pagerNode.innerHTML = renderPager(currentPage, totalPages);
      qsa("[data-page]", pagerNode).forEach(function (button) {
        button.addEventListener("click", function () {
          currentPage = Number(button.getAttribute("data-page"));
          draw();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
      drawCategoryNote();
      syncUrl();
    }

    [searchInput, categorySelect].forEach(function (element) {
      element.addEventListener("input", function () {
        currentPage = 1;
        draw();
      });
      element.addEventListener("change", function () {
        currentPage = 1;
        draw();
      });
    });

    updateMeta("文章專欄｜獵豹科教", "文章專欄整理 AMC 系列、關於獵豹、獵豹視角、獵豹談教育、獵豹談科普與獵豹私塾等內容。");
    draw();
  }

  function renderArticlePage(model) {
    const main = qs("main.page");
    if (!main) return;

    const slug = getParams().get("slug");
    const item =
      model.items.find(function (entry) {
        return entry.slug === slug;
      }) || model.items[0];

    if (!item) {
      main.innerHTML =
        '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這篇文章</h1><p>請回到文章專欄列表重新選擇文章。</p><a class="button button--primary" href="columns.html">回到文章專欄</a></div></div></section>';
      return;
    }

    document.title = item.title + "｜文章專欄";

    main.innerHTML = ARTICLE.renderDetailPage({
      sectionLabel: "文章專欄",
      backHref: "columns.html",
      backLabel: "返回文章專欄",
      item: item,
      stripImages: [getCoverImage(item)],
      metadataItems: [
        { label: "日期", value: item.date },
        { label: "分類", value: item.category },
        { label: "slug", value: item.slug }
      ]
    });

    updateMeta(item.title + "｜文章專欄", item.summary || item.excerpt || "文章專欄");
  }

  function init() {
    const model = loadColumnsModel();
    const page = getPageName();
    if (page === "columns.html") renderColumnsPage(model);
    if (page === "article.html") renderArticlePage(model);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();





