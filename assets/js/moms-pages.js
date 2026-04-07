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

  function getPageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function momUrl(slug) {
    return slug ? "mom-power.html?slug=" + encodeURIComponent(slug) : "mom-power.html";
  }

  function loadMomsData() {
    return (window.__MOMS_DATA__ || [])
      .filter(function (item) {
        return String(item.keep || "保留").trim() !== "不保留";
      })
      .sort(function (a, b) {
        return (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0);
      });
  }

  function renderMomCard(item) {
    return ARTICLE.renderPreviewCard
      ? ARTICLE.renderPreviewCard({
          item: item,
          url: momUrl(item.slug),
          coverImage: item.coverImage || "",
          fallbackLabel: item.cover || item.category || "星媽正能量",
          fallbackTone: "pink",
          previewMetaFields: ["date", "category"],
          linkLabel: "閱讀全文"
        })
      : "";
  }

  function renderMomsPage(data) {
    var main = qs("main.page");
    if (!main) return;

    var categories = unique(
      data.map(function (item) {
        return item.category;
      })
    );

    main.innerHTML =
      '<section class="page-hero page-hero--mom">' +
      '<div class="container">' +
      '<span class="eyebrow">星媽正能量</span>' +
      "<h1>星媽正能量</h1>" +
      "<p>整理給家長的陪伴、節奏與教養思考文章。</p>" +
      "</div>" +
      "</section>" +
      '<section class="section section--mom">' +
      '<div class="container">' +
      '<div class="section-heading"><h2>文章列表</h2><p>可直接搜尋關鍵字，或依分類快速篩選。</p></div>' +
      '<div class="elite-toolbar">' +
      '<label class="elite-toolbar__field"><span>搜尋文章</span><input id="moms-search" class="search-input" type="search" placeholder="輸入關鍵字，例如 家長、陪伴、節奏、孩子"></label>' +
      '<label class="elite-toolbar__field"><span>分類</span><select id="moms-category"><option value="">全部分類</option>' +
      categories
        .map(function (category) {
          return '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + "</option>";
        })
        .join("") +
      "</select></label>" +
      "</div>" +
      '<div class="elite-summary-bar"><strong id="moms-count">0</strong><span>篇結果</span></div>' +
      '<div id="moms-results" class="grid grid--3 elite-grid"></div>' +
      "</div>" +
      "</section>";

    var searchInput = qs("#moms-search");
    var categorySelect = qs("#moms-category");
    var countNode = qs("#moms-count");
    var resultsNode = qs("#moms-results");

    function draw() {
      var q = (searchInput.value || "").trim().toLowerCase();
      var category = categorySelect.value;
      var filtered = data.filter(function (item) {
        var haystack = [item.title, item.summary, item.bodyText, item.category]
          .concat(item.tags || [])
          .concat(item.keywords || [])
          .join(" ")
          .toLowerCase();
        return (!q || haystack.indexOf(q) >= 0) && (!category || item.category === category);
      });

      countNode.textContent = String(filtered.length);
      resultsNode.innerHTML = filtered.length
        ? filtered.map(renderMomCard).join("")
        : '<div class="empty-state elite-empty"><h3>找不到符合條件的文章</h3><p>請試試別的關鍵字，或先清空分類條件。</p></div>';
    }

    [searchInput, categorySelect].forEach(function (element) {
      element.addEventListener("input", draw);
      element.addEventListener("change", draw);
    });

    draw();
  }

  function renderMomDetail(data) {
    var main = qs("main.page");
    if (!main) return;

    var slug = getParams().get("slug");
    var item = data.find(function (entry) {
      return entry.slug === slug;
    }) || data[0];

    if (!item) {
      main.innerHTML =
        '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這篇文章</h1><p>請回到星媽正能量列表重新選擇文章。</p><a class="button button--primary" href="star-mom.html">回到星媽正能量</a></div></div></section>';
      return;
    }

    var bodyHtml = item.bodyHtml
      ? item.bodyHtml
      : (item.body || []).map(function (paragraph) {
          return "<p>" + escapeHtml(paragraph) + "</p>";
        }).join("");

    main.innerHTML = ARTICLE.renderDetailPage({
      sectionLabel: "星媽正能量",
      backHref: "star-mom.html",
      backLabel: "返回星媽正能量",
      item: item,
      bodyHtml: bodyHtml,
      metadataItems: [
        { label: "日期", value: item.date },
        { label: "分類", value: item.category },
        { label: "slug", value: item.slug }
      ]
    });
  }

  function init() {
    var data = loadMomsData();
    if (!data.length) return;

    var page = getPageName();
    if (page === "star-mom.html") renderMomsPage(data);
    if (page === "mom-power.html") renderMomDetail(data);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
