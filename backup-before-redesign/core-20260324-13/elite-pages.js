(function () {
  const DATA_PATH = "assets/data/elite-data.json";

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadParams() {
    return new URLSearchParams(window.location.search);
  }

  function pageName() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  async function loadEliteData() {
    const res = await fetch(DATA_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load elite data");
    const data = await res.json();
    return data
      .filter((item) => item.keep !== "不保留")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function renderTagList(tags) {
    return `<div class="tag-row">${(tags || [])
      .slice(0, 4)
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("")}</div>`;
  }

  function renderEliteCard(item, compact) {
    const year = (item.date || "").slice(0, 4);
    return `
      <article class="card elite-card">
        <a class="elite-card__cover" href="elite-story.html?slug=${encodeURIComponent(
          item.slug
        )}">
          <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}">
        </a>
        <div class="card__meta-row">
          <span class="chip">${escapeHtml(item.date || "")}</span>
          <span class="chip chip--muted">${escapeHtml(item.category || "獵豹菁英")}</span>
          ${year ? `<span class="chip chip--muted">${escapeHtml(year)}</span>` : ""}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(compact ? item.summary : item.summary || item.excerpt || "")}</p>
        ${renderTagList(item.tags)}
        <a class="card-link" href="elite-story.html?slug=${encodeURIComponent(
          item.slug
        )}">閱讀全文</a>
      </article>
    `;
  }

  function renderHomeSection(data) {
    const heading = $all(".section-heading h2").find(
      (el) => el.textContent.trim() === "獵豹菁英"
    );
    if (!heading) return;
    const section = heading.closest(".section");
    if (!section) return;
    const intro = $(".section-heading p", section);
    if (intro) {
      intro.textContent =
        "已接上舊站獵豹菁英資料，首頁先精選最新 3 篇成果，完整內容可進入專區查看。";
    }
    const latest = data.slice(0, 3);
    const body = `
      <div class="grid grid--3 elite-grid">
        ${latest.map((item) => renderEliteCard(item, true)).join("")}
      </div>
      <div class="page-nav elite-home-nav">
        <a class="button button--primary" href="students.html">查看 72 篇獵豹菁英</a>
      </div>
    `;
    const container = $(".container", section);
    if (!container) return;
    const existingHeading = $(".section-heading", container);
    container.innerHTML = "";
    if (existingHeading) container.appendChild(existingHeading);
    container.insertAdjacentHTML("beforeend", body);
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
          <h1>把舊站 72 篇榜單、競賽捷報與學生故事正式搬進新網站。</h1>
          <p>這一頁現在已不依賴舊站連結。每一篇內容與封面圖都改由新站本機資料與本機圖片提供，後續也可以再逐篇補標籤、關鍵字與 SEO。</p>
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
                ${years
                  .map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`)
                  .join("")}
              </select>
            </label>
            <label class="elite-toolbar__field">
              <span>類型</span>
              <select id="elite-category">
                <option value="">全部類型</option>
                ${categories
                  .map(
                    (category) =>
                      `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
                  )
                  .join("")}
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
        ? filtered.map((item) => renderEliteCard(item, false)).join("")
        : `<div class="empty-state elite-empty"><h3>沒有找到對應內容</h3><p>可以換別的年份、類型或關鍵字再試一次。</p></div>`;
    }

    [search, year, category].forEach((el) => el.addEventListener("input", applyFilters));
    applyFilters();
  }

  function renderEliteDetail(data) {
    const main = $("main.page");
    if (!main) return;
    const slug = loadParams().get("slug");
    const item = data.find((entry) => entry.slug === slug) || data[0];
    if (!item) return;

    document.title = `${item.title}｜獵豹菁英｜獵豹科教`;

    const titleMeta = $('meta[property="og:title"]');
    if (titleMeta) titleMeta.setAttribute("content", `${item.title}｜獵豹菁英｜獵豹科教`);

    const desc = item.summary || item.excerpt || "";
    const descMeta = $('meta[property="og:description"]');
    if (descMeta) descMeta.setAttribute("content", desc);

    const twitterTitle = $('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", `${item.title}｜獵豹菁英｜獵豹科教`);

    const twitterDesc = $('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", desc);

    main.innerHTML = `
      <section class="page-hero">
        <div class="container article-layout">
          <div class="article-main">
            <img class="article-cover-image" src="${escapeHtml(item.cover)}" alt="${escapeHtml(
      item.title
    )}">
            <div class="article-head">
              <span class="eyebrow">獵豹菁英</span>
              <h1>${escapeHtml(item.title)}</h1>
              <div class="card__meta-row">
                <span class="chip">${escapeHtml(item.date || "")}</span>
                <span class="chip chip--muted">${escapeHtml(item.category || "")}</span>
              </div>
              ${renderTagList(item.tags)}
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
      if (link.getAttribute("href") && /^https?:/i.test(link.getAttribute("href"))) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer");
      }
    });
  }

  async function init() {
    const current = pageName();
    if (!["index.html", "students.html", "elite-story.html", ""].includes(current)) return;
    try {
      const data = await loadEliteData();
      if (current === "index.html" || current === "") renderHomeSection(data);
      if (current === "students.html") renderStudentsPage(data);
      if (current === "elite-story.html") renderEliteDetail(data);
    } catch (error) {
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
