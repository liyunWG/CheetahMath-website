(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  var ARTICLE = window.__ARTICLE_FORMAT__ || {};
  var SECTION_LABEL = "獵豹錦囊";

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

  function loadYoutubeData() {
    var d = window.__YOUTUBE_DATA__ || {};
    return {
      channelUrl: d.channelUrl || "https://www.youtube.com/@liyuncheetah",
      videos: (d.videos || []).slice(),
      shorts: (d.shorts || []).slice()
    };
  }

  // 簡單標題比對：沿用全站的模糊比對（若有），否則退回 indexOf。
  function titleMatch(text, q) {
    if (!q) return true;
    var hay = String(text || "").toLowerCase();
    var needle = q.toLowerCase();
    return window.__cheetahTextMatch ? window.__cheetahTextMatch(hay, needle) : hay.indexOf(needle) >= 0;
  }

  function fmtDate(value) {
    var s = String(value || "").trim();
    return s ? s.replace(/-/g, "/") : "";
  }

  // ---- 卡片樣板 ------------------------------------------------------------

  function videoCard(v, opts) {
    opts = opts || {};
    var big = opts.big ? " yt-card--big" : "";
    var badge = v.length ? '<span class="yt-thumb__badge">' + escapeHtml(v.length) + "</span>" : "";
    var metaBits = [];
    if (v.date) metaBits.push(escapeHtml(fmtDate(v.date)));
    return (
      '<a class="yt-card' + big + '" href="' + escapeHtml(v.url) + '" target="_blank" rel="noreferrer">' +
      '<span class="yt-thumb">' +
      '<img loading="lazy" src="' + escapeHtml(v.thumb) + '" alt="' + escapeHtml(v.title) + '">' +
      badge +
      '<span class="yt-thumb__play" aria-hidden="true"></span>' +
      "</span>" +
      '<span class="yt-card__body">' +
      '<span class="yt-card__title">' + escapeHtml(v.title) + "</span>" +
      '<span class="yt-card__meta">' + metaBits.join(" · ") + "</span>" +
      "</span>" +
      "</a>"
    );
  }

  function shortCard(v) {
    var metaBits = [];
    if (v.date) metaBits.push(escapeHtml(fmtDate(v.date)));
    return (
      '<a class="yt-short" href="' + escapeHtml(v.url) + '" target="_blank" rel="noreferrer">' +
      '<span class="yt-short__thumb">' +
      '<img loading="lazy" src="' + escapeHtml(v.thumb) + '" alt="' + escapeHtml(v.title) + '">' +
      "</span>" +
      '<span class="yt-short__title">' + escapeHtml(v.title) + "</span>" +
      '<span class="yt-short__meta">' + metaBits.join(" · ") + "</span>" +
      "</a>"
    );
  }

  function renderMomCard(item) {
    return ARTICLE.renderPreviewCard
      ? ARTICLE.renderPreviewCard({
          item: item,
          url: momUrl(item.slug),
          coverImage: item.coverImage || "",
          fallbackLabel: item.cover || item.category || SECTION_LABEL,
          fallbackTone: "pink",
          previewMetaFields: ["date", "category"],
          linkLabel: "閱讀全文"
        })
      : "";
  }

  function emptyBlock(title, hint) {
    return (
      '<div class="empty-state elite-empty"><h3>' +
      escapeHtml(title) +
      "</h3><p>" +
      escapeHtml(hint) +
      "</p></div>"
    );
  }

  // ---- 主頁面（頻道版面）---------------------------------------------------

  function renderMomsPage(data, yt) {
    var main = qs("main.page");
    if (!main) return;

    var categories = unique(
      data.map(function (item) {
        return item.category;
      })
    );

    main.innerHTML =
      '<section class="section yt-channel-section"><div class="container">' +
      // 頻道頭
      '<header class="yt-head">' +
      '<div class="yt-head__avatar"><img src="pic/logo.png" alt="獵豹錦囊"></div>' +
      '<div class="yt-head__info">' +
      '<h1 class="yt-head__name">獵豹錦囊</h1>' +
      '<p class="yt-head__handle">獵豹科教 · @liyuncheetah</p>' +
      '<p class="yt-head__desc">短講、觀念、競賽數學與家長錦囊——把獵豹的學習系統，用一支支影片說給你聽。</p>' +
      '<a class="yt-head__cta" href="' + escapeHtml(yt.channelUrl) + '" target="_blank" rel="noreferrer">前往 YouTube 頻道</a>' +
      "</div>" +
      "</header>" +
      // 分頁列 + 搜尋
      '<div class="yt-tabbar">' +
      '<nav class="yt-tabs" role="tablist">' +
      '<button type="button" class="yt-tab is-active" data-tab="home" role="tab">首頁</button>' +
      '<button type="button" class="yt-tab" data-tab="videos" role="tab">影片</button>' +
      '<button type="button" class="yt-tab" data-tab="shorts" role="tab">Shorts</button>' +
      '<button type="button" class="yt-tab" data-tab="articles" role="tab">文章</button>' +
      "</nav>" +
      '<label class="yt-search"><span class="yt-search__icon" aria-hidden="true"></span>' +
      '<input id="yt-search" type="search" placeholder="搜尋這個頻道" aria-label="搜尋獵豹錦囊"></label>' +
      "</div>" +
      // 面板
      '<div class="yt-panels">' +
      '<section class="yt-panel" data-panel="home"></section>' +
      '<section class="yt-panel" data-panel="videos" hidden></section>' +
      '<section class="yt-panel" data-panel="shorts" hidden></section>' +
      '<section class="yt-panel" data-panel="articles" hidden>' +
      '<div class="elite-toolbar"><label class="elite-toolbar__field"><span>分類</span>' +
      '<select id="moms-category"><option value="">全部分類</option>' +
      categories
        .map(function (category) {
          return '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + "</option>";
        })
        .join("") +
      "</select></label></div>" +
      '<div class="elite-summary-bar"><strong id="moms-count">0</strong><span>篇文章</span></div>' +
      '<div id="moms-results" class="grid grid--3 elite-grid"></div>' +
      "</section>" +
      "</div>" +
      "</div></section>";

    var searchInput = qs("#yt-search");
    var categorySelect = qs("#moms-category");
    var countNode = qs("#moms-count");
    var resultsNode = qs("#moms-results");
    var panels = {
      home: qs('.yt-panel[data-panel="home"]'),
      videos: qs('.yt-panel[data-panel="videos"]'),
      shorts: qs('.yt-panel[data-panel="shorts"]'),
      articles: qs('.yt-panel[data-panel="articles"]')
    };

    var state = { tab: "home" };

    function query() {
      return (searchInput.value || "").trim();
    }

    // 首頁：無搜尋→精選 + 最新影片 + Shorts；有搜尋→合併結果
    function drawHome() {
      var q = query();
      if (q) {
        var vids = yt.videos.filter(function (v) { return titleMatch(v.title, q); });
        var shrt = yt.shorts.filter(function (v) { return titleMatch(v.title, q); });
        panels.home.innerHTML = vids.length || shrt.length
          ? (vids.length ? '<div class="yt-grid">' + vids.map(function (v) { return videoCard(v); }).join("") + "</div>" : "") +
            (shrt.length ? '<h2 class="yt-row__title">Shorts</h2><div class="yt-shorts-row">' + shrt.map(shortCard).join("") + "</div>" : "")
          : emptyBlock("找不到符合的影片", "換個關鍵字，或到「文章」分頁看看。");
        return;
      }
      var featured = yt.videos.filter(function (v) { return v.featured; })[0] || yt.videos[0];
      var latest = yt.videos.filter(function (v) { return v !== featured; }).slice(0, 8);
      var html = "";
      if (featured) html += '<div class="yt-featured">' + videoCard(featured, { big: true }) + "</div>";
      if (latest.length)
        html += '<h2 class="yt-row__title">最新影片</h2><div class="yt-grid">' + latest.map(function (v) { return videoCard(v); }).join("") + "</div>";
      if (yt.shorts.length)
        html += '<h2 class="yt-row__title">Shorts</h2><div class="yt-shorts-row">' + yt.shorts.map(shortCard).join("") + "</div>";
      panels.home.innerHTML = html || emptyBlock("尚無影片", "之後上傳的影片會出現在這裡。");
    }

    function drawVideos() {
      var q = query();
      var vids = yt.videos.filter(function (v) { return titleMatch(v.title, q); });
      panels.videos.innerHTML = vids.length
        ? '<div class="yt-grid">' + vids.map(function (v) { return videoCard(v); }).join("") + "</div>"
        : emptyBlock("找不到符合的影片", "換個關鍵字再試試。");
    }

    function drawShorts() {
      var q = query();
      var shrt = yt.shorts.filter(function (v) { return titleMatch(v.title, q); });
      panels.shorts.innerHTML = shrt.length
        ? '<div class="yt-shorts-grid">' + shrt.map(shortCard).join("") + "</div>"
        : emptyBlock("找不到符合的 Shorts", "換個關鍵字再試試。");
    }

    // 文章：沿用原本的比對＋計分＋分類篩選＋搜尋紀錄
    function drawArticles() {
      var q = query().toLowerCase();
      var category = categorySelect.value;
      var matched = data
        .map(function (item) {
          var haystack = [item.title, item.summary, item.bodyText, item.category]
            .concat(item.tags || [])
            .concat(item.keywords || [])
            .join(" ")
            .toLowerCase();
          return { item: item, haystack: haystack };
        })
        .filter(function (x) {
          return (
            (!q || (window.__cheetahTextMatch ? window.__cheetahTextMatch(x.haystack, q) : x.haystack.indexOf(q) >= 0)) &&
            (!category || x.item.category === category)
          );
        });
      var ranked = matched;
      if (q && window.__cheetahSearchScore) {
        var floor = window.__cheetahSearchFloor ? window.__cheetahSearchFloor(q) : 0;
        matched.forEach(function (x) {
          x.score = window.__cheetahSearchScore(x.haystack, x.item.title, q);
        });
        ranked = matched
          .filter(function (x) { return x.score >= floor; })
          .sort(function (a, b) { return b.score - a.score; });
      }
      var filtered = ranked.map(function (x) { return x.item; });
      countNode.textContent = String(filtered.length);
      resultsNode.innerHTML = filtered.length
        ? filtered.map(renderMomCard).join("")
        : emptyBlock("找不到符合條件的文章", "請試試別的關鍵字，或先清空分類條件。");
    }

    function drawActive() {
      if (state.tab === "home") drawHome();
      else if (state.tab === "videos") drawVideos();
      else if (state.tab === "shorts") drawShorts();
      else if (state.tab === "articles") drawArticles();
    }

    function switchTab(tab) {
      state.tab = tab;
      qsa(".yt-tab").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-tab") === tab);
      });
      Object.keys(panels).forEach(function (key) {
        panels[key].hidden = key !== tab;
      });
      searchInput.placeholder = tab === "articles" ? "搜尋文章關鍵字" : "搜尋這個頻道";
      drawActive();
    }

    qsa(".yt-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-tab"));
      });
    });

    searchInput.addEventListener("input", function () {
      drawActive();
      // 記錄搜尋關鍵字到 Google Sheet（停止輸入約 1.5 秒後記一次）
      if (window.__cheetahLogSearch) {
        var count =
          state.tab === "articles"
            ? Number(countNode.textContent) || 0
            : qsa(".yt-card, .yt-short", panels[state.tab]).length;
        window.__cheetahLogSearch(searchInput.value, count, SECTION_LABEL);
      }
    });
    categorySelect.addEventListener("change", drawArticles);

    // 初始渲染四個面板（切換時不需重繪，但先畫好文章計數）
    drawHome();
    drawArticles();
  }

  // ---- 單篇文章頁（mom-power.html）維持原樣，只更新顯示字串 ------------------

  function renderMomDetail(data) {
    var main = qs("main.page");
    if (!main) return;

    var slug = getParams().get("slug");
    var item =
      data.find(function (entry) {
        return entry.slug === slug;
      }) || data[0];

    if (!item) {
      main.innerHTML =
        '<section class="section"><div class="container"><div class="empty-state"><h1>找不到這篇文章</h1><p>請回到' +
        SECTION_LABEL +
        '列表重新選擇文章。</p><a class="button button--primary" href="star-mom.html">回到' +
        SECTION_LABEL +
        "</a></div></div></section>";
      return;
    }

    var bodyHtml = item.bodyHtml
      ? item.bodyHtml
      : (item.body || [])
          .map(function (paragraph) {
            return "<p>" + escapeHtml(paragraph) + "</p>";
          })
          .join("");

    main.innerHTML = ARTICLE.renderDetailPage({
      sectionLabel: SECTION_LABEL,
      backHref: "star-mom.html",
      backLabel: "返回" + SECTION_LABEL,
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
    var page = getPageName();

    if (page === "star-mom.html") {
      var yt = loadYoutubeData();
      renderMomsPage(data, yt);
    }
    if (page === "mom-power.html") {
      if (!data.length) return;
      renderMomDetail(data);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
