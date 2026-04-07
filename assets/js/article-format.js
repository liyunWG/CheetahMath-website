(function () {
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

  function stripStandaloneLinks(html, urls) {
    var result = String(html || "");
    unique(urls).forEach(function (url) {
      if (!url) return;
      var escaped = escapeRegExp(url).replace(/&/g, "(?:&|&amp;)");
      result = result
        .replace(new RegExp('<p[^>]*>\\s*(?:<span[^>]*>\\s*)*(?:<strong[^>]*>\\s*)?<a[^>]+href="' + escaped + '"[^>]*>[\\s\\S]*?<\\/a>(?:<\\/strong>)?(?:<\\/span>)*\\s*<\\/p>', "gi"), "")
        .replace(new RegExp('<div[^>]*>\\s*(?:<span[^>]*>\\s*)*(?:<strong[^>]*>\\s*)?<a[^>]+href="' + escaped + '"[^>]*>[\\s\\S]*?<\\/a>(?:<\\/strong>)?(?:<\\/span>)*\\s*<\\/div>', "gi"), "");
    });
    return result;
  }

  function renderTags(tags, limit, className) {
    var normalized = typeof limit === "number" ? unique(tags).slice(0, limit) : unique(tags);
    if (!normalized.length) return "";
    return (
      '<div class="' +
      escapeHtml(className || "tag-row") +
      '">' +
      normalized
        .map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function buildPreviewMeta(item, fields, limit) {
    return unique(
      (fields || []).map(function (field) {
        return item && item[field] ? String(item[field]).trim() : "";
      })
    ).slice(0, typeof limit === "number" ? limit : 4);
  }

  function renderPreviewCard(config) {
    var item = config.item || {};
    var url = config.url || "#";
    var coverImage = config.coverImage || "";
    var fallbackTone = config.fallbackTone || "navy";
    var fallbackLabel = config.fallbackLabel || item.category || "";
    var previewMeta = buildPreviewMeta(item, config.previewMetaFields, 4);

    var cover = coverImage
      ? '<a class="elite-card__cover" href="' +
        url +
        '"><img src="' +
        escapeHtml(coverImage) +
        '" alt="' +
        escapeHtml(item.title || fallbackLabel) +
        '"></a>'
      : '<a class="elite-card__cover" href="' +
        url +
        '"><div class="cover-art cover-art--' +
        escapeHtml(fallbackTone) +
        '" style="height:220px;"><span>' +
        escapeHtml(fallbackLabel) +
        "</span></div></a>";

    return (
      '<article class="card elite-card">' +
      cover +
      '<div class="card__meta-row">' +
      previewMeta
        .map(function (value, index) {
          return '<span class="chip' + (index === 0 ? "" : " chip--muted") + '">' + escapeHtml(value) + "</span>";
        })
        .join("") +
      "</div>" +
      "<h3>" +
      escapeHtml(item.title || "") +
      "</h3>" +
      "<p>" +
      escapeHtml(item.summary || item.excerpt || "") +
      "</p>" +
      renderTags(item.tags, 4) +
      '<a class="card-link" href="' +
      url +
      '">' +
      escapeHtml(config.linkLabel || "閱讀全文") +
      "</a>" +
      "</article>"
    );
  }

  function extractLinksFromHtml(html) {
    var matches = [];
    String(html || "").replace(/href="([^"]+)"/gi, function (_, href) {
      matches.push(href);
      return _;
    });
    String(html || "").replace(/https?:\/\/[^\s"'<>]+/gi, function (url) {
      matches.push(url);
      return url;
    });
    return unique(matches.map(normalizeAssetSrc));
  }

  function findOriginalSourceUrl(item) {
    var candidates = []
      .concat(item && item.sourceUrl ? [item.sourceUrl] : [])
      .concat(extractLinksFromHtml(item && item.bodyHtml ? item.bodyHtml : ""));

    var preferred = candidates.find(function (url) {
      return /facebook\.com/i.test(url);
    });

    return preferred || candidates[0] || "";
  }

  function renderOriginalSource(url) {
    if (!url) return "";
    var label = /facebook\.com/i.test(url) ? "查看Facebook原文連結" : "查看原始來源";
    return '<div class="article-source-link"><a href="' + escapeHtml(url) + '" target="_blank" rel="noreferrer">' + label + "</a></div>";
  }

  function renderMetadata(items) {
    var normalized = (items || []).filter(function (item) {
      return item && item.value;
    });
    if (!normalized.length) return "";
    return (
      '<div class="article-meta-grid">' +
      normalized
        .map(function (item) {
          return (
            '<div class="article-meta-item"><span class="article-meta-item__label">' +
            escapeHtml(item.label || "") +
            '</span><strong class="article-meta-item__value">' +
            escapeHtml(item.value || "") +
            "</strong></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function normalizeDetailBody(item, options) {
    var bodyHtml = item && item.bodyHtml ? item.bodyHtml : "";
    var dedupeSources = []
      .concat(options && options.stripImages ? options.stripImages : [])
      .concat(item && item.coverImage ? [item.coverImage] : [])
      .concat(item && item.cover ? [item.cover] : []);
    var sourceUrl = findOriginalSourceUrl(item);

    return stripStandaloneLinks(stripDuplicateImageNodes(bodyHtml || "<p>這篇文章目前沒有內文。</p>", dedupeSources), [sourceUrl]).trim();
  }

  function renderDetailPage(config) {
    var item = config.item || {};
    var sourceUrl = findOriginalSourceUrl(item);
    var bodyHtml = config.bodyHtml || normalizeDetailBody(item, config);

    return (
      '<section class="page-hero">' +
      '<div class="container">' +
      '<a class="back-link" href="' +
      escapeHtml(config.backHref || "#") +
      '">' +
      escapeHtml(config.backLabel || "返回列表") +
      "</a>" +
      '<span class="eyebrow">' +
      escapeHtml(config.sectionLabel || "") +
      "</span>" +
      "<h1>" +
      escapeHtml(item.title || "") +
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
      '<div class="article-body elite-body">' +
      bodyHtml +
      "</div>" +
      renderOriginalSource(sourceUrl) +
      renderMetadata(config.metadataItems || []) +
      "</article>" +
      "</div>" +
      "</section>"
    );
  }

  window.__ARTICLE_FORMAT__ = {
    escapeHtml: escapeHtml,
    unique: unique,
    stripDuplicateImageNodes: stripDuplicateImageNodes,
    renderTags: renderTags,
    buildPreviewMeta: buildPreviewMeta,
    renderPreviewCard: renderPreviewCard,
    findOriginalSourceUrl: findOriginalSourceUrl,
    normalizeDetailBody: normalizeDetailBody,
    renderDetailPage: renderDetailPage,
    renderMetadata: renderMetadata
  };
})();
