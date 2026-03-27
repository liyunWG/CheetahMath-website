(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function loadEliteData() {
    const data = window.__ELITE_DATA__ || [];
    return data
      .filter((item) => item.keep !== "不保留")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function renderTags(tags) {
    return `<div class="tag-row">${(tags || [])
      .slice(0, 4)
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("")}</div>`;
  }

  function renderEliteCard(item) {
    const year = (item.date || "").slice(0, 4);
    return `
      <article class="card elite-card">
        <a class="elite-card__cover" href="elite-story.html?slug=${encodeURIComponent(item.slug)}">
          <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}">
        </a>
        <div class="card__meta-row">
          <span class="chip">${escapeHtml(item.date || "")}</span>
          <span class="chip chip--muted">${escapeHtml(item.category || "獵豹菁英")}</span>
          ${year ? `<span class="chip chip--muted">${escapeHtml(year)}</span>` : ""}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || item.excerpt || "")}</p>
        ${renderTags(item.tags)}
        <a class="card-link" href="elite-story.html?slug=${encodeURIComponent(item.slug)}">閱讀全文</a>
      </article>
    `;
  }

  function findHomeEliteSection() {
    return $all(".section").find((section) => {
      const heading = $("h2", section);
      return heading && heading.textContent.trim() === "獵豹菁英";
    });
  }

  function renderHomeElite(data) {
    const section = findHomeEliteSection();
    if (!section) return;
    const heading = $(".section-heading", section);
    const latest = data.slice(0, 3);
    section.innerHTML = `
      <div class="container">
        ${heading ? heading.outerHTML : ""}
        <div class="grid grid--3 elite-grid">
          ${latest.map(renderEliteCard).join("")}
        </div>
        <div class="page-nav elite-home-nav">
          <a class="button button--primary" href="students.html">查看全部 72 篇獵豹菁英</a>
        </div>
      </div>
    `;
    const intro = $(".section-heading p", section);
    if (intro) {
      intro.textContent = "首頁先放最新 3 篇，完整榜單、競賽捷報與學生故事已全部搬進獵豹菁英頁。";
    }
  }

  function renderStudentsPage(data) {
    const main = $("main.page");
    if (!main) return;

    const years = unique(data.map((item) => (item.date || "").slice(0, 4)));
    const categories = unique(data.map((item) => item.category));

    main.innerHTML = `
      <section class="page-hero">
        <div class="container">
          <span class="eyebrow">獵豹菁英</span>
          <h1>舊站 72 篇獵豹菁英內容已正式搬進新網站。</h1>
          <p>封面圖、正文圖片與文章內容都已改由新網站本機檔案提供，未來即使舊站撤掉，這一區也能獨立存在。</p>
          <div class="page-nav">
            <a class="button button--primary" href="index.html">回首頁</a>
            <a class="button button--secondary" href="search.html">全站搜尋</a>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="elite-toolbar">
            <label class="elite-toolbar__field">
              <span>搜尋標題</span>
              <input id="elite-search" class="search-input" type="search" placeholder="例如：EGMO、AMC、科學班、心得">
            </label>
            <label class="elite-toolbar__field">
              <span>年份</span>
              <select id="elite-year">
                <option value="">全部年份</option>
                ${years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("")}
              </select>
            </label>
            <label class="elite-toolbar__field">
              <span>類型</span>
              <select id="elite-category">
                <option value="">全部類型</option>
                ${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="elite-summary-bar">
            <strong id="elite-count">0</strong>
            <span>篇內容</span>
          </div>
          <div id="elite-results" class="grid grid--3 elite-grid"></div>
        </div>
      </section>
    `;

    const search = $("#elite-search");
    const year = $("#elite-year");
    const category = $("#elite-category");
    const count = $("#elite-count");
    const results = $("#elite-results");

    function applyFilters() {
      const q = (search.value || "").trim().toLowerCase();
      const yearValue = year.value;
      const categoryValue = category.value;
      const filtered = data.filter((item) => {
        const haystack = [item.title, item.summary, item.excerpt, ...(item.tags || [])]
          .join(" ")
          .toLowerCase();
        const itemYear = (item.date || "").slice(0, 4);
        return (
          (!q || haystack.includes(q)) &&
          (!yearValue || itemYear === yearValue) &&
          (!categoryValue || item.category === categoryValue)
        );
      });

      count.textContent = String(filtered.length);
      results.innerHTML = filtered.length
        ? filtered.map(renderEliteCard).join("")
        : `<div class="empty-state elite-empty"><h3>沒有找到對應內容</h3><p>可以換別的年份、類型或關鍵字再試一次。</p></div>`;
    }

    [search, year, category].forEach((el) => el.addEventListener("input", applyFilters));
    applyFilters();
  }

  function renderEliteStory(data) {
    const main = $("main.page");
    if (!main) return;
    const slug = params().get("slug");
    const item = data.find((entry) => entry.slug === slug) || data[0];
    if (!item) return;

    const desc = item.summary || item.excerpt || "";
    document.title = `${item.title}｜獵豹菁英｜獵豹科教`;

    const ogTitle = $('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${item.title}｜獵豹菁英｜獵豹科教`);
    const ogDesc = $('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);
    const twTitle = $('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", `${item.title}｜獵豹菁英｜獵豹科教`);
    const twDesc = $('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", desc);

    main.innerHTML = `
      <section class="page-hero">
        <div class="container article-layout">
          <div class="article-main">
            <img class="article-cover-image" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}">
            <div class="article-head">
              <span class="eyebrow">獵豹菁英</span>
              <h1>${escapeHtml(item.title)}</h1>
              <div class="card__meta-row">
                <span class="chip">${escapeHtml(item.date || "")}</span>
                <span class="chip chip--muted">${escapeHtml(item.category || "獵豹菁英")}</span>
              </div>
              ${renderTags(item.tags)}
              <p class="article-summary">${escapeHtml(desc)}</p>
            </div>
            <div class="article-body elite-body">${item.bodyHtml || `<p>${escapeHtml(desc)}</p>`}</div>
            <div class="page-nav">
              <a class="back-link" href="students.html">回獵豹菁英</a>
              <a class="back-link" href="index.html">回首頁</a>
            </div>
          </div>
          <aside class="article-side">
            <div class="card">
              <h3>文章資訊</h3>
              <p><strong>日期：</strong>${escapeHtml(item.date || "")}</p>
              <p><strong>分類：</strong>${escapeHtml(item.category || "獵豹菁英")}</p>
              <p><strong>slug：</strong>${escapeHtml(item.slug || "")}</p>
            </div>
          </aside>
        </div>
      </section>
    `;

    $all(".elite-body a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && /^https?:/i.test(href)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
      }
    });
  }

  function attachEliteSearch(data) {
    const input = $("#site-search-input");
    const type = $("#filter-type");
    const grade = $("#filter-grade");
    const sort = $("#filter-sort");
    const baseResults = $("#search-results");
    if (!input || !baseResults) return;

    let panel = $("#elite-search-results");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "elite-search-results";
      panel.className = "search-results";
      baseResults.insertAdjacentElement("afterend", panel);
    }

    function render() {
      const q = (input.value || "").trim().toLowerCase();
      const typeValue = type ? type.value : "";
      const gradeValue = grade ? grade.value : "";
      const sortValue = sort ? sort.value : "best";

      if (typeValue && typeValue !== "文章") {
        panel.innerHTML = "";
        return;
      }

      let filtered = data.filter((item) => {
        const itemYear = (item.date || "").slice(0, 4);
        const haystack = [item.title, item.summary, item.excerpt, item.category, itemYear, ...(item.tags || [])]
          .join(" ")
          .toLowerCase();
        const gradeMatch = !gradeValue || itemYear.includes(gradeValue);
        return (!q || haystack.includes(q)) && gradeMatch;
      });

      filtered = filtered.sort((a, b) => {
        if (sortValue === "latest") return new Date(b.date) - new Date(a.date);
        return new Date(b.date) - new Date(a.date);
      });

      panel.innerHTML = filtered.length
        ? `
          <div class="section-heading">
            <h2>獵豹菁英搜尋結果</h2>
            <p>這一區是已搬進新網站的舊站菁英內容。</p>
          </div>
          <div class="grid grid--3 elite-grid">
            ${filtered.slice(0, 24).map(renderEliteCard).join("")}
          </div>
        `
        : "";
    }

    [input, type, grade, sort].filter(Boolean).forEach((el) => el.addEventListener("input", render));
    render();
  }

  function init() {
    const data = loadEliteData();
    if (!data.length) return;

    const current = pageName();
    if (current === "index.html" || current === "") renderHomeElite(data);
    if (current === "students.html") renderStudentsPage(data);
    if (current === "elite-story.html") renderEliteStory(data);
    if (current === "search.html") attachEliteSearch(data);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
