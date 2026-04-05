(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeAssetSrc(value) {
    return String(value || "").replace(/&amp;/g, "&").trim();
  }

  function stripDuplicateImageNodes(html, sources) {
    var result = String(html || "");
    unique((sources || []).map(normalizeAssetSrc)).forEach(function (src) {
      if (!src) return;
      var escaped = escapeRegExp(src).replace(/&/g, "(?:&|&amp;)");
      result = result
        .replace(new RegExp('<p[^>]*>\\s*<img[^>]+src="' + escaped + '"[^>]*>\\s*</p>', "gi"), "")
        .replace(new RegExp('<div[^>]*>\\s*<img[^>]+src="' + escaped + '"[^>]*>\\s*</div>', "gi"), "")
        .replace(new RegExp('<figure[^>]*>\\s*<img[^>]+src="' + escaped + '"[^>]*>\\s*</figure>', "gi"), "")
        .replace(new RegExp('<img[^>]+src="' + escaped + '"[^>]*>', "gi"), "");
    });
    return result;
  }

  function getPageName() {
    var raw = window.location.pathname.split("/").pop() || "index.html";
    return raw.includes(".") ? raw : raw + ".html";
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function courseArticleUrl(slug) {
    return slug
      ? "course-article.html?slug=" + encodeURIComponent(slug)
      : "course-article.html";
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

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function renderTags(tags) {
    var normalized = unique(tags);
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

  var CATEGORY_THEMES = {
    "小學P": "gold",
    "國中J": "navy",
    "科學班FA00": "navy",
    "高中S": "navy",
    "GGB": "gold"
  };

  var CATEGORY_LABELS = {
    "小學P": "小學 P",
    "國中J": "國中 J",
    "科學班FA00": "科學班 FA00",
    "高中S": "高中 S",
    "GGB": "GGB"
  };

  var ALL_CATEGORIES = ["小學P", "國中J", "科學班FA00", "高中S", "GGB"];

  function renderCourseCard(item) {
    var theme = CATEGORY_THEMES[item.category] || "navy";
    var label = CATEGORY_LABELS[item.category] || item.category;
    var year = (item.date || "").slice(0, 4);
    var meta = [item.date, item.category, year].filter(Boolean);

    var coverHtml;
    if (item.cover) {
      coverHtml =
        '<a class="course-card__cover" href="' + courseLink(item) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '</a>';
    } else {
      coverHtml =
        '<a class="course-card__cover cover-art cover-art--' + escapeHtml(theme) + '" href="' + courseLink(item) + '">' +
        '<span>' + escapeHtml(label) + '</span>' +
        '</a>';
    }

    return (
      '<article class="card elite-card">' +
      coverHtml +
      '<div class="card__meta-row">' +
      meta
        .map(function (value, index) {
          return (
            '<span class="chip' +
            (index === 0 ? "" : " chip--muted") +
            '">' +
            escapeHtml(value) +
            "</span>"
          );
        })
        .join("") +
      "</div>" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.summary || item.excerpt || "") + "</p>" +
      renderTags((item.tags || []).slice(0, 4)) +
      '<a class="card-link" href="' + courseLink(item) + '">查看課程詳情</a>' +
      "</article>"
    );
  }

  function renderPager(currentPage, totalPages) {
    if (totalPages <= 1) return "";
    var html = '<div class="elite-pager">';
    for (var i = 1; i <= totalPages; i += 1) {
      html +=
        '<button type="button" class="elite-pager__button' +
        (i === currentPage ? " is-active" : "") +
        '" data-page="' + i + '">' +
        i +
        "</button>";
    }
    html += "</div>";
    return html;
  }

  function renderCoursesPage(data) {
    var main = qs("main.page");
    if (!main) return;

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<span class="eyebrow">課程總覽</span>' +
      '<h1>課程不是平鋪直敘地從淺到深，而是對應不同階段、目標與能力結構。</h1>' +
      '<div class="page-nav">' +
      '<a class="button button--primary" href="contact.html">預約選課諮詢</a>' +
      '<a class="button button--secondary" href="learning-system.html">看學習系統</a>' +
      '</div>' +
      '</div>' +
      '</section>' +
      '<section class="section">' +
      '<div class="container">' +
      '<div class="elite-toolbar">' +
      '<label class="elite-toolbar__field">' +
      '<span>搜尋課程</span>' +
      '<input id="courses-search" class="search-input" type="search" placeholder="輸入關鍵字，例如 科學班、AMC、高中、數資班">' +
      '</label>' +
      '<label class="elite-toolbar__field">' +
      '<span>分類</span>' +
      '<select id="courses-category"><option value="">全部分類</option>' +
      ALL_CATEGORIES.map(function (cat) {
        return '<option value="' + escapeHtml(cat) + '">' + escapeHtml(CATEGORY_LABELS[cat] || cat) + '</option>';
      }).join("") +
      '</select>' +
      '</label>' +
      '</div>' +
      '<div class="elite-summary-bar"><strong id="courses-count">0</strong><span>門課程</span></div>' +
      '<div id="courses-results" class="grid grid--3 elite-grid"></div>' +
      '<div id="courses-pager-wrap"></div>' +
      '</div>' +
      '</section>';

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
        var haystack = [item.title, item.summary, item.excerpt, item.bodyText, item.code]
          .concat(item.tags || [])
          .concat(item.keywords || [])
          .join(" ")
          .toLowerCase();

        return (
          (!q || haystack.indexOf(q) >= 0) &&
          (!categoryValue || item.category === categoryValue)
        );
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
        : '<div class="empty-state elite-empty"><h3>找不到符合條件的課程</h3><p>請試試別的關鍵字，或先清空分類篩選。</p></div>';

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
    var item =
      data.find(function (entry) {
        return entry.slug === slug;
      }) || null;

    if (!item) {
      main.innerHTML =
        '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這門課程</h1><p>請回到課程總覽重新選擇。</p><a class="button button--primary" href="courses.html">回到課程總覽</a></div></div></section>';
      return;
    }

    document.title = item.title + "｜課程總覽｜獵豹科教";

    var detailImages = unique(
      []
        .concat(item.detailImages || [])
        .filter(Boolean)
        .map(normalizeAssetSrc)
    ).filter(function (src) {
      return src && src !== normalizeAssetSrc(item.cover);
    });

    var bodyHtml = stripDuplicateImageNodes(
      item.bodyHtml || "<p>這門課程目前沒有詳細說明。</p>",
      [item.cover].concat(detailImages)
    );

    var detailImagesHtml = detailImages.length
      ? '<div class="course-detail-gallery">' +
        detailImages
          .map(function (src, index) {
            return (
              '<figure class="article-cover">' +
              '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.title + ' 課程圖 ' + (index + 1)) + '">' +
              "</figure>"
            );
          })
          .join("") +
        "</div>"
      : "";

    var metaChips = [
      item.date ? "<span><strong>日期：</strong>" + escapeHtml(item.date) + "</span>" : "",
      item.category ? "<span><strong>分類：</strong>" + escapeHtml(item.category) + "</span>" : "",
      item.code ? "<span><strong>課程編號：</strong>" + escapeHtml(item.code) + "</span>" : ""
    ]
      .filter(Boolean)
      .join("");
    var slugBlock = item.slug
      ? '<div class="elite-story-meta"><span><strong>slug：</strong>' + escapeHtml(item.slug) + "</span></div>"
      : "";

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<a class="back-link" href="courses.html">返回課程總覽</a>' +
      '<span class="eyebrow">課程總覽</span>' +
      "<h1>" + escapeHtml(item.title) + "</h1>" +
      "<p>" + escapeHtml(item.summary || item.excerpt || "") + "</p>" +
      renderTags(item.tags) +
      "</div>" +
      "</section>" +
      '<section class="section">' +
      '<div class="container elite-story-wrap">' +
      '<article class="card article-card elite-story-main">' +
      (item.cover
        ? '<div class="article-cover"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '"></div>'
        : "") +
      detailImagesHtml +
      '<div class="article-body elite-body">' +
      bodyHtml +
      "</div>" +
      (metaChips ? '<div class="elite-story-meta">' + metaChips + "</div>" : "") +
      slugBlock +
      "</article>" +
      "</div>" +
      "</section>";
  }

  function renderCoursesSearch(data) {
    if (getPageName() !== "search.html") return;
    var query = (getParams().get("q") || getParams().get("keyword") || "").trim().toLowerCase();
    if (!query) return;

    var main = qs("main.page");
    if (!main) return;

    var results = data.filter(function (item) {
      var haystack = [item.title, item.summary, item.excerpt, item.bodyText, item.code]
        .concat(item.tags || [])
        .concat(item.keywords || [])
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) >= 0;
    });

    var anchorSection =
      qsa(".section", main).slice(-1)[0] ||
      main;

    var existing = qs("[data-courses-search]", main);
    if (existing) existing.remove();

    var block = document.createElement("section");
    block.className = "section";
    block.setAttribute("data-courses-search", "true");
    block.innerHTML =
      '<div class="container">' +
      '<div class="section-heading">' +
      "<h2>課程總覽搜尋結果</h2>" +
      "<p>目前找到 " +
      results.length +
      " 門與「" +
      escapeHtml(query) +
      "」相關的課程。</p>" +
      "</div>" +
      '<div class="grid grid--3 elite-grid">' +
      (results.length
        ? results.slice(0, 12).map(renderCourseCard).join("")
        : '<div class="empty-state elite-empty"><h3>課程總覽沒有符合結果</h3><p>可改試課程名稱、級別或科目關鍵字。</p></div>') +
      "</div>" +
      (results.length > 12
        ? '<div class="page-nav"><a class="button button--secondary" href="courses.html">到課程總覽查看更多</a></div>'
        : "") +
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
