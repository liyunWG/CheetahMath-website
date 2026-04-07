(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  var ARTICLE = window.__ARTICLE_FORMAT__ || {};

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function normalizeAssetSrc(value) {
    return String(value || "").replace(/&amp;/g, "&").trim();
  }

  function getPageName() {
    var raw = window.location.pathname.split("/").pop() || "index.html";
    return raw.includes(".") ? raw : raw + ".html";
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function courseArticleUrl(slug) {
    return slug ? "course-article.html?slug=" + encodeURIComponent(slug) : "course-article.html";
  }

  function courseLink(item) {
    if (item && item.slug && (item.bodyHtml || item.bodyText || item.coverImage)) {
      return courseArticleUrl(item.slug);
    }
    return item && item.file ? item.file : courseArticleUrl(item && item.slug);
  }

  function loadCoursesData() {
    return (window.__COURSES_DATA__ || [])
      .filter(function (item) {
        return String(item.keep || "保留").trim() !== "不保留";
      })
      .sort(function (a, b) {
        return (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0);
      });
  }

  function renderTags(tags) {
    return ARTICLE.renderTags ? ARTICLE.renderTags(tags) : "";
  }

  var CATEGORY_THEMES = {
    P: "gold",
    J: "navy",
    FA00: "navy",
    S: "navy",
    GGB: "gold",
    "科學班前瞻營": "gold",
    FA: "navy"
  };

  var CATEGORY_LABELS = {
    P: "國小數學 P",
    J: "國中數學 J",
    FA00: "科學班 FA00",
    S: "高中數學 S",
    GGB: "GGB",
    "科學班前瞻營": "科學班前瞻營",
    FA: "FA 高階競賽"
  };

  var ALL_CATEGORIES = ["P", "J", "FA00", "S", "GGB", "科學班前瞻營", "FA"];

  function renderCourseCard(item) {
    var category = item.category || "";
    return ARTICLE.renderPreviewCard
      ? ARTICLE.renderPreviewCard({
          item: item,
          url: courseLink(item),
          coverImage: item.cover,
          fallbackLabel: CATEGORY_LABELS[category] || category || "課程總覽",
          fallbackTone: CATEGORY_THEMES[category] || "navy",
          previewMetaFields: ["date", "category", "code", "level"],
          linkLabel: "閱讀全文"
        })
      : "";
  }

  function renderPager(currentPage, totalPages) {
    if (totalPages <= 1) return "";
    var html = '<div class="elite-pager">';
    for (var i = 1; i <= totalPages; i += 1) {
      html +=
        '<button type="button" class="elite-pager__button' +
        (i === currentPage ? " is-active" : "") +
        '" data-page="' +
        i +
        '">' +
        i +
        "</button>";
    }
    return html + "</div>";
  }

  function renderCoursesPage(data) {
    var main = qs("main.page");
    if (!main) return;

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<span class="eyebrow">課程總覽</span>' +
      "<h1>課程總覽</h1>" +
      "<p>依年級、課程方向與目標快速查看所有課程與延伸內容。</p>" +
      "</div>" +
      "</section>" +
      '<section class="section">' +
      '<div class="container">' +
      '<div class="elite-toolbar">' +
      '<label class="elite-toolbar__field"><span>搜尋課程</span><input id="courses-search" class="search-input" type="search" placeholder="輸入關鍵字，例如 AMC、FA00、科學班、GGB"></label>' +
      '<label class="elite-toolbar__field"><span>分類</span><select id="courses-category"><option value="">全部分類</option>' +
      ALL_CATEGORIES.map(function (category) {
        return '<option value="' + escapeHtml(category) + '">' + escapeHtml(CATEGORY_LABELS[category] || category) + "</option>";
      }).join("") +
      "</select></label>" +
      "</div>" +
      '<div class="elite-summary-bar"><strong id="courses-count">0</strong><span>篇結果</span></div>' +
      '<div id="courses-results" class="grid grid--3 elite-grid"></div>' +
      '<div id="courses-pager-wrap"></div>' +
      "</div>" +
      "</section>";

    var searchInput = qs("#courses-search");
    var categorySelect = qs("#courses-category");
    var countNode = qs("#courses-count");
    var resultsNode = qs("#courses-results");
    var pagerNode = qs("#courses-pager-wrap");
    var pageSize = 12;
    var currentPage = 1;

    function getFilteredItems() {
      var q = (searchInput.value || "").trim().toLowerCase();
      var categoryValue = categorySelect.value;

      return data.filter(function (item) {
        var haystack = [item.title, item.summary, item.excerpt, item.bodyText, item.code, item.level]
          .concat(item.tags || [])
          .concat(item.keywords || [])
          .join(" ")
          .toLowerCase();

        return (!q || haystack.indexOf(q) >= 0) && (!categoryValue || item.category === categoryValue);
      });
    }

    function draw() {
      var filtered = getFilteredItems();
      var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = 1;

      var start = (currentPage - 1) * pageSize;
      var items = filtered.slice(start, start + pageSize);

      countNode.textContent = String(filtered.length);
      resultsNode.innerHTML = items.length
        ? items.map(renderCourseCard).join("")
        : '<div class="empty-state elite-empty"><h3>找不到符合條件的課程</h3><p>請試試別的關鍵字，或先清空分類條件。</p></div>';

      pagerNode.innerHTML = renderPager(currentPage, totalPages);
      qsa("[data-page]", pagerNode).forEach(function (button) {
        button.addEventListener("click", function () {
          currentPage = Number(button.getAttribute("data-page"));
          draw();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
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

    draw();
  }

  function renderCourseArticle(data) {
    var main = qs("main.page");
    if (!main) return;

    var slug = getParams().get("slug");
    var item = data.find(function (entry) {
      return entry.slug === slug;
    }) || null;

    if (!item) {
      main.innerHTML =
        '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這門課程</h1><p>請回到課程總覽重新選擇內容。</p><a class="button button--primary" href="courses.html">回到課程總覽</a></div></div></section>';
      return;
    }

    document.title = item.title + "｜課程總覽";

    var detailImages = unique([].concat(item.detailImages || []).filter(Boolean).map(normalizeAssetSrc)).filter(function (src) {
      return src && src !== normalizeAssetSrc(item.cover);
    });

    var detailImagesHtml = detailImages.length
      ? '<div class="course-detail-gallery">' +
        detailImages
          .map(function (src, index) {
            return '<figure class="article-cover"><img src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.title + " 課程圖片 " + (index + 1)) + '"></figure>';
          })
          .join("") +
        "</div>"
      : "";

    var bodyHtml = ARTICLE.normalizeDetailBody
      ? ARTICLE.normalizeDetailBody(item, { stripImages: [item.cover] })
      : item.bodyHtml || "<p>這門課程目前沒有詳細說明。</p>";

    main.innerHTML = ARTICLE.renderDetailPage({
      sectionLabel: "課程總覽",
      backHref: "courses.html",
      backLabel: "返回課程總覽",
      item: item,
      bodyHtml: bodyHtml + detailImagesHtml,
      stripImages: [item.cover],
      metadataItems: [
        { label: "日期", value: item.date },
        { label: "分類", value: item.category },
        { label: "課程編號", value: item.code },
        { label: "slug", value: item.slug }
      ]
    });
  }

  function renderCoursesSearch(data) {
    if (getPageName() !== "search.html") return;
    var query = (getParams().get("q") || getParams().get("keyword") || "").trim().toLowerCase();
    if (!query) return;

    var main = qs("main.page");
    if (!main) return;

    var results = data.filter(function (item) {
      var haystack = [item.title, item.summary, item.excerpt, item.bodyText, item.code, item.level]
        .concat(item.tags || [])
        .concat(item.keywords || [])
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) >= 0;
    });

    var anchorSection = qsa(".section", main).slice(-1)[0] || main;
    var existing = qs("[data-courses-search]", main);
    if (existing) existing.remove();

    var block = document.createElement("section");
    block.className = "section";
    block.setAttribute("data-courses-search", "true");
    block.innerHTML =
      '<div class="container">' +
      '<div class="section-heading"><h2>課程總覽搜尋結果</h2><p>目前找到 ' +
      results.length +
      ' 篇與「' +
      escapeHtml(query) +
      '」相關的課程內容。</p></div>' +
      '<div class="grid grid--3 elite-grid">' +
      (results.length
        ? results.slice(0, 12).map(renderCourseCard).join("")
        : '<div class="empty-state elite-empty"><h3>課程總覽沒有符合結果</h3><p>可改試課程名稱、年級、課程代碼或目標關鍵字。</p></div>') +
      "</div>" +
      (results.length > 12 ? '<div class="page-nav"><a class="button button--secondary" href="courses.html">到課程總覽查看更多</a></div>' : "") +
      "</div>";

    anchorSection.insertAdjacentElement("afterend", block);
  }

  function init() {
    var data = loadCoursesData();
    if (!data.length) return;

    var page = getPageName();
    if (page === "courses.html") renderCoursesPage(data);
    if (page === "course-article.html") renderCourseArticle(data);
    if (page === "search.html") renderCoursesSearch(data);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
