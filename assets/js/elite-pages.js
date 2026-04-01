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

  function eliteStoryUrl(slug) {
    return slug
      ? "elite-story.html?slug=" + encodeURIComponent(slug)
      : "elite-story.html";
  }

  function loadEliteData() {
    return (window.__ELITE_DATA__ || [])
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
    const normalized = unique(tags);
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

  function getFirstBodyImage(item) {
    const html = item && item.bodyHtml ? item.bodyHtml : "";
    const matches = html.match(/<img[^>]+src="([^"]+)"[^>]*>/gi) || [];

    for (const imgHtml of matches) {
      const srcMatch = imgHtml.match(/src="([^"]+)"/i);
      const widthMatch = imgHtml.match(/width="(\d+)"/i);
      const heightMatch = imgHtml.match(/height="(\d+)"/i);
      const src = srcMatch ? srcMatch[1] : "";
      const width = widthMatch ? Number(widthMatch[1]) : 0;
      const height = heightMatch ? Number(heightMatch[1]) : 0;

      if (!src) continue;
      if (width >= 420 || height >= 320) return src;
      if (!/body-\d+\.(jpg|jpeg|png|webp)$/i.test(src) && width > 0 && height > 0) continue;
      return src;
    }

    return "";
  }

  function renderEliteCard(item) {
    const year = (item.date || "").slice(0, 4);
    const meta = [item.date, item.category, year].filter(Boolean);
    return (
      '<article class="card elite-card">' +
      '<a class="elite-card__cover" href="' +
      eliteStoryUrl(item.slug) +
      '">' +
      '<img src="' +
      escapeHtml(item.cover) +
      '" alt="' +
      escapeHtml(item.title) +
      '">' +
      "</a>" +
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
      "<h3>" +
      escapeHtml(item.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(item.summary || item.excerpt || "") +
      "</p>" +
      renderTags(item.tags) +
      '<a class="card-link" href="' +
      eliteStoryUrl(item.slug) +
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

  function getHomeEliteSection() {
    const sections = qsa(".section");
    return (
      sections.find(function (section) {
        const heading = qs("h2", section);
        return heading && heading.textContent.trim() === "獵豹菁英";
      }) || null
    );
  }

  function renderHomeElite(data) {
    const section = getHomeEliteSection();
    if (!section) return;

    section.innerHTML =
      '<div class="container">' +
      '<div class="section-heading">' +
      "<h2>獵豹菁英</h2>" +
      "<p>精選最新三篇成果，完整內容可進入獵豹菁英列表查看。</p>" +
      "</div>" +
      '<div class="grid grid--3 elite-grid">' +
      data.slice(0, 3).map(renderEliteCard).join("") +
      "</div>" +
      '<div class="page-nav elite-home-nav">' +
      '<a class="button button--primary" href="students.html">查看全部獵豹菁英</a>' +
      "</div>" +
      "</div>";
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
      "<span>搜尋文章</span>" +
      '<input id="elite-search" class="search-input" type="search" placeholder="輸入關鍵字，例如 EGMO、AMC、建中、科學班">' +
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
      '<div class="elite-summary-bar"><strong id="elite-count">0</strong><span>篇結果</span></div>' +
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
        const haystack = [item.title, item.summary, item.excerpt, item.bodyText]
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
        : '<div class="empty-state elite-empty"><h3>找不到符合條件的文章</h3><p>請試試別的關鍵字，或先清空年份與類型篩選。</p></div>';

      pagerNode.innerHTML = renderPager(currentPage, totalPages);
      qsa("[data-page]", pagerNode).forEach(function (button) {
        button.addEventListener("click", function () {
          currentPage = Number(button.getAttribute("data-page"));
          draw();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }

    [searchInput, yearSelect, categorySelect].forEach(function (element) {
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

  function renderEliteStory(data) {
    const main = qs("main.page");
    if (!main) return;

    const slug = getParams().get("slug");
    const item =
      data.find(function (entry) {
        return entry.slug === slug;
      }) || data[0];

    if (!item) {
      main.innerHTML =
        '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這篇文章</h1><p>請回到獵豹菁英列表重新選擇文章。</p><a class="button button--primary" href="students.html">回到獵豹菁英</a></div></div></section>';
      return;
    }

    document.title = item.title + "｜獵豹菁英";

    const heroImage = getFirstBodyImage(item);
    const metaChips = [
      item.date ? "<span><strong>日期：</strong>" + escapeHtml(item.date) + "</span>" : "",
      item.category ? "<span><strong>類型：</strong>" + escapeHtml(item.category) + "</span>" : "",
      item.slug ? "<span><strong>slug：</strong>" + escapeHtml(item.slug) + "</span>" : "",
    ]
      .filter(Boolean)
      .join("");

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<a class="back-link" href="students.html">返回獵豹菁英</a>' +
      '<span class="eyebrow">獵豹菁英</span>' +
      "<h1>" +
      escapeHtml(item.title) +
      "</h1>" +
      "<p>" +
      escapeHtml(item.summary || item.excerpt || "") +
      "</p>" +
      renderTags(item.tags) +
      "</div>" +
      "</section>" +
      '<section class="section">' +
      '<div class="container elite-story-wrap">' +
      '<article class="card article-card elite-story-main">' +
      (heroImage
        ? '<div class="article-cover"><img src="' +
          escapeHtml(heroImage) +
          '" alt="' +
          escapeHtml(item.title) +
          '"></div>'
        : "") +
      '<div class="article-body elite-body">' +
      (item.bodyHtml || "<p>這篇文章目前沒有內文。</p>") +
      "</div>" +
      (metaChips ? '<div class="elite-story-meta">' + metaChips + "</div>" : "") +
      "</article>" +
      "</div>" +
      "</section>";
  }

  function renderEliteSearch(data) {
    if (getPageName() !== "search.html") return;
    if (document.getElementById("search-data")) return;
    const query = (getParams().get("q") || getParams().get("keyword") || "").trim().toLowerCase();
    if (!query) return;

    const main = qs("main.page");
    if (!main) return;

    const results = data.filter(function (item) {
      const haystack = [item.title, item.summary, item.excerpt, item.bodyText]
        .concat(item.tags || [])
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) >= 0;
    });

    const anchorSection =
      qsa(".section", main).slice(-1)[0] ||
      qsa(".page-section", main).slice(-1)[0] ||
      main;

    const existing = qs("[data-elite-search]", main);
    if (existing) existing.remove();

    const block = document.createElement("section");
    block.className = "section";
    block.setAttribute("data-elite-search", "true");
    block.innerHTML =
      '<div class="container">' +
      '<div class="section-heading">' +
      "<h2>獵豹菁英搜尋結果</h2>" +
      "<p>目前找到 " +
      results.length +
      " 篇與「" +
      escapeHtml(query) +
      "」相關的獵豹菁英內容。</p>" +
      "</div>" +
      '<div class="grid grid--3 elite-grid">' +
      (results.length
        ? results.slice(0, 12).map(renderEliteCard).join("")
        : '<div class="empty-state elite-empty"><h3>獵豹菁英沒有符合結果</h3><p>可改試學校、考試名稱、競賽名稱或學生目標。</p></div>') +
      "</div>" +
      (results.length > 12
        ? '<div class="page-nav elite-home-nav"><a class="button button--secondary" href="students.html">到獵豹菁英頁查看更多</a></div>'
        : "") +
      "</div>";

    anchorSection.insertAdjacentElement("afterend", block);
  }

  function init() {
    const data = loadEliteData();
    if (!data.length) return;

    const page = getPageName();
    if (page === "index.html") renderHomeElite(data);
    if (page === "students.html") renderStudentsPage(data);
    if (page === "elite-story.html") renderEliteStory(data);
    if (page === "search.html") renderEliteSearch(data);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
