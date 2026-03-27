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

  function getPageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function loadEliteData() {
    return (window.__ELITE_DATA__ || [])
      .filter(function (item) {
        return item.keep !== "不保留";
      })
      .sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function renderTags(tags) {
    return (
      '<div class="tag-row">' +
      (tags || [])
        .slice(0, 4)
        .map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function getFirstBodyImage(item) {
    const html = item && item.bodyHtml ? item.bodyHtml : "";
    const match = html.match(/<img[^>]+src="([^"]+)"/i);
    return match ? match[1] : "";
  }

  function renderEliteCard(item) {
    const year = (item.date || "").slice(0, 4);
    return (
      '<article class="card elite-card">' +
      '<a class="elite-card__cover" href="elite-story.html?slug=' +
      encodeURIComponent(item.slug) +
      '">' +
      '<img src="' +
      escapeHtml(item.cover) +
      '" alt="' +
      escapeHtml(item.title) +
      '">' +
      "</a>" +
      '<div class="card__meta-row">' +
      '<span class="chip">' +
      escapeHtml(item.date || "") +
      "</span>" +
      '<span class="chip chip--muted">' +
      escapeHtml(item.category || "獵豹菁英") +
      "</span>" +
      (year ? '<span class="chip chip--muted">' + escapeHtml(year) + "</span>" : "") +
      "</div>" +
      "<h3>" +
      escapeHtml(item.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(item.summary || item.excerpt || "") +
      "</p>" +
      renderTags(item.tags) +
      '<a class="card-link" href="elite-story.html?slug=' +
      encodeURIComponent(item.slug) +
      '">閱讀全文</a>' +
      "</article>"
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

  function renderHomeElite(data) {
    const section = qsa(".section").find(function (node) {
      const heading = qs("h2", node);
      return heading && heading.textContent.trim() === "獵豹菁英";
    });
    if (!section) return;

    const sectionHeading = qs(".section-heading", section);
    section.innerHTML =
      '<div class="container">' +
      (sectionHeading ? sectionHeading.outerHTML : "") +
      '<div class="grid grid--3 elite-grid">' +
      data.slice(0, 3).map(renderEliteCard).join("") +
      "</div>" +
      '<div class="page-nav elite-home-nav">' +
      '<a class="button button--primary" href="students.html">查看全部獵豹菁英</a>' +
      "</div>" +
      "</div>";

    const intro = qs(".section-heading p", section);
    if (intro) {
      intro.textContent = "首頁先顯示最新 3 篇，完整內容請進入獵豹菁英專區。";
    }
  }

  function renderStudentsPage(data) {
    const main = qs("main.page");
    if (!main) return;

    const years = unique(
      data.map(function (item) {
        return (item.date || "").slice(0, 4);
      })
    );
    const categories = unique(
      data.map(function (item) {
        return item.category;
      })
    );

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<span class="eyebrow">獵豹菁英</span>' +
      "<h1>獵豹菁英</h1>" +
      "</div>" +
      "</section>" +
      '<section class="section">' +
      '<div class="container">' +
      '<div class="elite-toolbar">' +
      '<label class="elite-toolbar__field">' +
      "<span>搜尋標題</span>" +
      '<input id="elite-search" class="search-input" type="search" placeholder="例如：EGMO、AMC、科學班、心得">' +
      "</label>" +
      '<label class="elite-toolbar__field">' +
      "<span>年份</span>" +
      '<select id="elite-year"><option value="">全部年份</option>' +
      years
        .map(function (year) {
          return '<option value="' + escapeHtml(year) + '">' + escapeHtml(year) + "</option>";
        })
        .join("") +
      "</select>" +
      "</label>" +
      '<label class="elite-toolbar__field">' +
      "<span>類型</span>" +
      '<select id="elite-category"><option value="">全部類型</option>' +
      categories
        .map(function (category) {
          return '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + "</option>";
        })
        .join("") +
      "</select>" +
      "</label>" +
      "</div>" +
      '<div class="elite-summary-bar"><strong id="elite-count">0</strong><span>篇內容</span></div>' +
      '<div id="elite-results" class="grid grid--3 elite-grid"></div>' +
      '<div id="elite-pager-wrap"></div>' +
      "</div>" +
      "</section>";

    const searchInput = qs("#elite-search");
    const yearSelect = qs("#elite-year");
    const categorySelect = qs("#elite-category");
    const countNode = qs("#elite-count");
    const resultsNode = qs("#elite-results");
    const pagerNode = qs("#elite-pager-wrap");
    const pageSize = 12;
    let currentPage = 1;

    function getFilteredItems() {
      const q = (searchInput.value || "").trim().toLowerCase();
      const yearValue = yearSelect.value;
      const categoryValue = categorySelect.value;
      return data.filter(function (item) {
        const haystack = [item.title, item.summary, item.excerpt]
          .concat(item.tags || [])
          .join(" ")
          .toLowerCase();
        const itemYear = (item.date || "").slice(0, 4);
        return (
          (!q || haystack.indexOf(q) >= 0) &&
          (!yearValue || itemYear === yearValue) &&
          (!categoryValue || item.category === categoryValue)
        );
      });
    }

    function draw() {
      const filtered = getFilteredItems();
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      countNode.textContent = String(filtered.length);
      resultsNode.innerHTML = items.length
        ? items.map(renderEliteCard).join("")
        : '<div class="empty-state elite-empty"><h3>沒有找到對應內容</h3><p>可以換別的年份、類型或關鍵字再試一次。</p></div>';

      pagerNode.innerHTML = renderPager(currentPage, totalPages);
      qsa("[data-page]", pagerNode).forEach(function (button) {
        button.addEventListener("click", function () {
          currentPage = Number(button.getAttribute("data-page"));
          draw();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }

    [searchInput, yearSelect, categorySelect].forEach(function (el) {
      el.addEventListener("input", function () {
        currentPage = 1;
        draw();
      });
    });

    draw();
  }

  function renderEliteStory(data) {
    const main = qs("main.page");
    if (!main) return;

    const slug = getParams().get("slug");
    const item =
      data.find(function (entry) {
        return entry.slug === slug;
      }) || data[0];
    if (!item) return;

    const description = item.summary || item.excerpt || "";
    const heroImage = getFirstBodyImage(item);

    document.title = item.title + "｜獵豹菁英｜獵豹科教";

    const ogTitle = qs('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", item.title + "｜獵豹菁英｜獵豹科教");
    const ogDescription = qs('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", description);
    const twitterTitle = qs('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", item.title + "｜獵豹菁英｜獵豹科教");
    const twitterDescription = qs('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", description);

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container elite-story-wrap">' +
      '<div class="article-main elite-story-main">' +
      (heroImage
        ? '<img class="article-cover-image" src="' +
          escapeHtml(heroImage) +
          '" alt="' +
          escapeHtml(item.title) +
          '">'
        : "") +
      '<div class="article-head">' +
      '<span class="eyebrow">獵豹菁英</span>' +
      "<h1>" +
      escapeHtml(item.title) +
      "</h1>" +
      '<div class="card__meta-row">' +
      '<span class="chip">' +
      escapeHtml(item.date || "") +
      "</span>" +
      '<span class="chip chip--muted">' +
      escapeHtml(item.category || "獵豹菁英") +
      "</span>" +
      "</div>" +
      renderTags(item.tags) +
      '<p class="article-summary">' +
      escapeHtml(description) +
      "</p>" +
      "</div>" +
      '<div class="article-body elite-body">' +
      (item.bodyHtml || "<p>" + escapeHtml(description) + "</p>") +
      "</div>" +
      '<div class="elite-story-meta">' +
      "<strong>文章資訊</strong>" +
      "<span>日期：" +
      escapeHtml(item.date || "") +
      "</span>" +
      "<span>分類：" +
      escapeHtml(item.category || "獵豹菁英") +
      "</span>" +
      "<span>slug：" +
      escapeHtml(item.slug || "") +
      "</span>" +
      "</div>" +
      '<div class="page-nav">' +
      '<a class="back-link" href="students.html">回獵豹菁英</a>' +
      '<a class="back-link" href="index.html">回首頁</a>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</section>";

    qsa(".elite-body a").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href && /^https?:/i.test(href)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
      }
    });
  }

  function attachEliteSearch(data) {
    const input = qs("#site-search-input");
    const type = qs("#filter-type");
    const sort = qs("#filter-sort");
    const baseResults = qs("#search-results");
    if (!input || !baseResults) return;

    let panel = qs("#elite-search-results");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "elite-search-results";
      panel.className = "search-results";
      baseResults.insertAdjacentElement("afterend", panel);
    }

    function render() {
      const q = (input.value || "").trim().toLowerCase();
      const typeValue = type ? type.value : "";
      const sortValue = sort ? sort.value : "best";

      if (typeValue && typeValue !== "文章") {
        panel.innerHTML = "";
        return;
      }

      let filtered = data.filter(function (item) {
        const haystack = [item.title, item.summary, item.excerpt]
          .concat(item.tags || [])
          .join(" ")
          .toLowerCase();
        return !q || haystack.indexOf(q) >= 0;
      });

      filtered = filtered.sort(function (a, b) {
        if (sortValue === "latest") return new Date(b.date) - new Date(a.date);
        return new Date(b.date) - new Date(a.date);
      });

      panel.innerHTML = filtered.length
        ? '<div class="section-heading"><h2>獵豹菁英搜尋結果</h2><p>這一區是已搬進新網站的舊站菁英內容。</p></div>' +
          '<div class="grid grid--3 elite-grid">' +
          filtered.slice(0, 24).map(renderEliteCard).join("") +
          "</div>"
        : "";
    }

    [input, type, sort].filter(Boolean).forEach(function (el) {
      el.addEventListener("input", render);
    });

    render();
  }

  function init() {
    const data = loadEliteData();
    if (!data.length) return;

    const currentPage = getPageName();
    if (currentPage === "index.html" || currentPage === "") renderHomeElite(data);
    if (currentPage === "students.html") renderStudentsPage(data);
    if (currentPage === "elite-story.html") renderEliteStory(data);
    if (currentPage === "search.html") attachEliteSearch(data);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
