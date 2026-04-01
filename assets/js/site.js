(async function () {
  const DATA_SCRIPTS = [
    "assets/data/site-shell-data.js",
    "assets/data/site-page-data.js",
    "assets/data/needs-data.js",
    "assets/data/courses-data.js",
    "assets/data/moms-data.js",
    "assets/data/news-data.js",
    "assets/data/students-data.js",
    "assets/data/columns-data.js"
  ];

  async function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureData() {
    const needsColumns = !window.__COLUMNS_DATA__;
    const needsSiteData =
      !window.__SITE_SHELL__ ||
      !window.__SITE_PAGE_DATA__ ||
      !window.__NEEDS_DATA__ ||
      !window.__COURSES_DATA__ ||
      !window.__MOMS_DATA__ ||
      !window.__NEWS_DATA__ ||
      !window.__STUDENTS_DATA__;
    if (!needsColumns && !needsSiteData) return;
    for (const src of DATA_SCRIPTS) {
      if (src === "assets/data/columns-data.js" && window.__COLUMNS_DATA__) continue;
      await loadScript(src);
    }
  }

  await ensureData();

  const SHELL = window.__SITE_SHELL__ || {};
  const PAGE_DATA = window.__SITE_PAGE_DATA__ || {};
  const SITE = SHELL.site || {};
  const NAV = Array.isArray(SHELL.nav) ? SHELL.nav : [];
  const BANNERS = Array.isArray(SHELL.banners) ? SHELL.banners : [];
  const FOOTER = SHELL.footer || {};
  const GOALS = Array.isArray(window.__NEEDS_DATA__) ? window.__NEEDS_DATA__ : [];
  const COURSES = Array.isArray(window.__COURSES_DATA__) ? window.__COURSES_DATA__ : [];
  const MOMS = Array.isArray(window.__MOMS_DATA__) ? window.__MOMS_DATA__ : [];
  const NEWS = Array.isArray(window.__NEWS_DATA__) ? window.__NEWS_DATA__ : [];
  const STUDENTS = window.__STUDENTS_DATA__ || {};
  const CASES = Array.isArray(STUDENTS.cases) ? STUDENTS.cases : [];
  const STUDENT_HONORS = Array.isArray(STUDENTS.honors) ? STUDENTS.honors : [];

  const PAGE = () => location.pathname.split("/").pop() || "index.html";
  const PARAMS = () => new URLSearchParams(location.search);
  const articleUrl = (slug) =>
    slug ? `article.html?slug=${encodeURIComponent(slug)}` : "article.html";
  const eliteStoryUrl = (slug) =>
    slug ? `elite-story.html?slug=${encodeURIComponent(slug)}` : "elite-story.html";
  const momUrl = (slug) =>
    slug ? `mom-power.html?slug=${encodeURIComponent(slug)}` : "mom-power.html";

  const getColumnItems = () => {
    const data = window.__COLUMNS_DATA__;
    return data && Array.isArray(data.items) ? data.items : [];
  };

  const keepItem = (item) => String(item.keep || "保留").trim() !== "不保留";

  const featuredArticles = (count) =>
    getColumnItems()
      .filter(keepItem)
      .slice(0, count)
      .map((item) => ({
        slug: item.slug,
        title: item.title,
        date: item.date,
        category: item.category,
        tags: (item.tags || []).filter(Boolean),
        summary: item.summary || item.excerpt || "",
        cover: item.cover || "",
        popularity: item.popularity || 84,
        freshness: item.freshness || 80
      }));

  const page = (route) => {
    const main = document.querySelector("main.page");
    if (main) main.innerHTML = route;
  };

  const cover = (label, tone) =>
    `<div class="cover-art cover-art--${tone || "gold"}"><span>${label}</span></div>`;

  const tags = (list, pink) =>
    `<div class="tag-row">${(list || [])
      .map((item) => `<span class="tag${pink ? " tag--pink" : ""}">${item}</span>`)
      .join("")}</div>`;

  const meta = (date, category, pink) =>
    `<div class="card__meta-row">${date ? `<span class="chip">${date}</span>` : ""}${
      category ? `<span class="chip${pink ? " chip--pink" : " chip--muted"}">${category}</span>` : ""
    }</div>`;

  const card = (item, link, tone, pink) =>
    `<article class="card${pink ? " card--mom" : ""}">${
      item.cover ? cover(item.cover, tone) : ""
    }${meta(item.date, item.category, pink)}<h3>${item.title}</h3><p>${
      item.summary || item.text || ""
    }</p>${tags(item.tags, pink)}${
      link ? `<a class="card-link" href="${link}">前往內容</a>` : ""
    }</article>`;

  const section = (title, intro, content, cls) =>
    `<section class="section ${cls || ""}"><div class="container"><div class="section-heading"><h2>${title}</h2><p>${intro}</p></div>${content}</div></section>`;

  const buttonLink = (button) => {
    const target = button.newTab ? ` target="_blank" rel="noreferrer"` : "";
    return `<a class="button button--${button.style || "primary"}" href="${button.href}"${target}>${button.label}</a>`;
  };

  const pageNav = (buttons) =>
    `<div class="page-nav">${(buttons || []).map(buttonLink).join("")}</div>`;

  const textCardGrid = (cards, cols) =>
    `<div class="grid ${cols || "grid--3"}">${(cards || [])
      .map((item) => `<article class="card"><h3>${item.title}</h3><p>${item.text}</p></article>`)
      .join("")}</div>`;

  const buildListPage = (name, body) =>
    `<section class="page-hero"><div class="container"><span class="eyebrow">${name}</span><h1>${body.title}</h1><p>${body.intro}</p>${
      body.nav || ""
    }</div></section>${body.sections.join("")}`;

  function applyChrome(title, subtitle) {
    document.title = title;
    document.querySelectorAll(".brand__title").forEach((el) => {
      el.innerHTML = `<img src="pic/logo.png" alt="${SITE.brand || "獵豹科教"} logo">`;
    });
    document.querySelectorAll(".brand__subtitle").forEach((el) => {
      el.textContent = subtitle || SITE.subtitle || "";
    });
    document.querySelectorAll(".nav").forEach((nav) => {
      nav.innerHTML = NAV.map(
        ([href, label]) => `<a class="${href === PAGE() ? "is-active" : ""}" href="${href}">${label}</a>`
      ).join("");
    });
    document.querySelectorAll(".footer__inner").forEach((footer) => {
      footer.innerHTML = `<div class="footer-grid"><div><h3>${SITE.brand || ""}</h3><p>${
        SITE.footer || ""
      }</p></div><div><h3>${FOOTER.quickTitle || ""}</h3><div class="footer-links">${(
        FOOTER.quickLinks || []
      )
        .map(([href, label]) => `<a href="${href}">${label}</a>`)
        .join("")}</div></div><div><h3>${FOOTER.socialTitle || ""}</h3><div class="footer-social"><a class="footer-social__link footer-social__link--line" href="${
        SITE.lineUrl || "#"
      }" target="_blank" rel="noreferrer"><img src="pic/line_icon.png" alt="官方 Line"><span>${
        FOOTER.lineLabel || ""
      }</span></a><a class="footer-social__link" href="${SITE.fbUrl || "#"}" target="_blank" rel="noreferrer"><img src="pic/FB_icon.png" alt="Facebook"><span>${
        FOOTER.fbLabel || ""
      }</span></a><a class="footer-social__link" href="${SITE.ytUrl || "#"}" target="_blank" rel="noreferrer"><img src="pic/YT_icon.png" alt="YouTube"><span>${
        FOOTER.ytLabel || ""
      }</span></a></div></div></div>`;
    });
    document.querySelectorAll(".social-float").forEach((el) => {
      el.innerHTML = `<a class="social-float__link social-float__link--line" href="${SITE.lineUrl || "#"}" target="_blank" rel="noreferrer"><span class="social-float__badge">${
        FOOTER.floatBadge || ""
      }</span><img src="pic/line_icon.png" alt="官方 Line"></a><a class="social-float__link" href="${
        SITE.fbUrl || "#"
      }" target="_blank" rel="noreferrer"><img src="pic/FB_icon.png" alt="Facebook"></a><a class="social-float__link" href="${
        SITE.ytUrl || "#"
      }" target="_blank" rel="noreferrer"><img src="pic/YT_icon.png" alt="YouTube"></a>`;
    });
    setupMobileNav();
  }

  function setupMobileNav() {
    document.querySelectorAll(".topbar__inner").forEach((shell) => {
      const nav = shell.querySelector(".nav");
      if (!nav) return;
      let button = shell.querySelector(".topbar__nav-toggle");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "topbar__nav-toggle";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open menu");
        button.innerHTML = '<span class="topbar__nav-toggle-bar"></span>';
        shell.insertBefore(button, nav);
      }
      if (button.__mobileNavReady) return;
      button.__mobileNavReady = true;
      const isDesktop = () => window.innerWidth >= 980;
      const setOpen = (open) => {
        button.setAttribute("aria-expanded", String(open));
        nav.classList.toggle("is-open", open);
        shell.classList.toggle("is-nav-open", open);
      };
      button.addEventListener("click", () => {
        if (isDesktop()) return;
        setOpen(button.getAttribute("aria-expanded") !== "true");
      });
      nav.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", () => {
          if (!isDesktop()) setOpen(false);
        })
      );
      window.addEventListener("resize", () => {
        if (isDesktop()) setOpen(false);
      });
    });
  }

  const eliteSearchItems = () =>
    (window.__ELITE_DATA__ || [])
      .filter(keepItem)
      .map((item) => {
        const time = Date.parse(item.date || "") || 0;
        const ageDays = time ? Math.max(0, Math.round((Date.now() - time) / 86400000)) : 9999;
        const freshness = Math.max(10, 100 - Math.round(ageDays / 30));
        return {
          type: "獵豹菁英",
          title: item.title,
          summary: item.summary || item.excerpt || "",
          tags: (item.tags || []).filter(Boolean),
          keywords: [item.category, item.bucket, item.slug].concat(item.tags || []).filter(Boolean),
          body: [item.excerpt, item.bodyText].filter(Boolean).join(" "),
          url: item.slug ? eliteStoryUrl(item.slug) : "elite-story.html",
          popularity: 86,
          freshness,
          grade: "獵豹菁英",
          topic: item.category || "獵豹菁英",
          date: item.date || ""
        };
      });

  const columnsSearchItems = () =>
    getColumnItems()
      .filter(keepItem)
      .map((item) => {
        const time = Date.parse(item.date || "") || 0;
        const ageDays = time ? Math.max(0, Math.round((Date.now() - time) / 86400000)) : 9999;
        const freshness = Math.max(10, 100 - Math.round(ageDays / 30));
        return {
          type: "文章專欄",
          title: item.title,
          summary: item.summary || item.excerpt || "",
          tags: (item.tags || []).filter(Boolean),
          keywords: [item.category, item.bucket, item.slug].concat(item.tags || []).filter(Boolean),
          body: [item.excerpt, item.bodyText].filter(Boolean).join(" "),
          url: item.slug ? articleUrl(item.slug) : "article.html",
          popularity: item.popularity || 84,
          freshness,
          grade: "文章專欄",
          topic: item.category || "文章專欄",
          date: item.date || ""
        };
      });

  const searchData = () => [
    ...GOALS.map((item) => ({
      type: "家長導航",
      title: item.title,
      summary: item.intro,
      tags: [item.grade, item.topic, item.short],
      keywords: [item.title, item.short, item.topic],
      body: item.points.join(" "),
      url: item.file,
      popularity: 72,
      freshness: 78,
      grade: item.grade,
      topic: item.topic,
      date: ""
    })),
    ...COURSES.map((item) => ({
      type: "課程",
      title: item.title,
      summary: item.summary,
      tags: item.tags,
      keywords: item.tags,
      body: item.bullets.join(" "),
      url: item.file,
      popularity: 82,
      freshness: 74,
      grade: item.level,
      topic: "課程",
      date: ""
    })),
    ...columnsSearchItems(),
    ...MOMS.map((item) => ({
      type: "星媽正能量",
      title: item.title,
      summary: item.summary,
      tags: item.tags,
      keywords: item.keywords,
      body: item.body.join(" "),
      url: momUrl(item.slug),
      popularity: item.popularity,
      freshness: item.freshness,
      grade: "家長",
      topic: item.category,
      date: item.date || ""
    })),
    ...NEWS.map((item) => ({
      type: "最新消息",
      title: item.title,
      summary: item.summary,
      tags: item.tags,
      keywords: item.keywords,
      body: item.summary,
      url: "news.html",
      popularity: item.popularity,
      freshness: item.freshness,
      grade: "全站",
      topic: item.category,
      date: item.date || ""
    })),
    ...eliteSearchItems()
  ];

  const buildHome = () => {
    const home = PAGE_DATA.home || {};
    const landing = home.landing || {};
    const featured = featuredArticles(3);
    const search = home.search || {};
    const learning = home.learningSystem || {};
    const tiles = Array.isArray(learning.tiles) ? learning.tiles : [];
    return `<section class="hero hero--banner-only"><div class="container"><div class="hero-panel hero-panel--banner" data-banner-slider>${BANNERS.map(
      (banner, index) =>
        `<div class="hero-banner${index === 0 ? " is-active" : ""}"><img src="${banner.src}" alt="${banner.alt}"></div>`
    ).join("")}<div class="hero-banner__dots">${BANNERS.map(
      (_, index) =>
        `<button type="button" class="hero-banner__dot${
          index === 0 ? " is-active" : ""
        }" data-banner-dot="${index}" aria-label="切換到第 ${index + 1} 張 banner"></button>`
    ).join("")}</div></div><div class="goal-chip-row">${GOALS.map(
      (goal, index) =>
        `<a class="goal-chip reveal-seq" style="--delay:${index * 60}ms" href="${goal.file}"><span>${goal.short}</span><small>${goal.title}</small></a>`
    ).join("")}</div></div></section>${section(
      landing.title || "",
      landing.intro || "",
      `<div class="feature-slab"><div><span class="eyebrow">${landing.eyebrow || ""}</span><h3>${
        landing.headline || ""
      }</h3><p>${landing.text || ""}</p></div>${pageNav(landing.buttons || [])}</div>`
    )}${section(
      home.featuredArticles ? home.featuredArticles.title : "",
      home.featuredArticles ? home.featuredArticles.intro : "",
      `<div class="grid grid--3">${featured.map((item) => card(item, articleUrl(item.slug), "navy")).join("")}</div>`
    )}${section(
      search.title || "",
      search.intro || "",
      `<div class="feature-slab"><form action="search.html" class="search-quick-form"><label class="search-label" for="home-search-input">${
        search.label || ""
      }</label><input id="home-search-input" class="search-input" type="search" name="q" placeholder="${
        search.placeholder || ""
      }"><div class="tag-row">${(search.tags || [])
        .map((item) => `<span class="tag">${item}</span>`)
        .join("")}</div><div class="page-nav"><button class="button button--primary" type="submit">${
        search.submitLabel || ""
      }</button><a class="button button--secondary" href="search.html">${search.linkLabel || ""}</a></div></form></div>`
    )}${section(
      home.news ? home.news.title : "",
      home.news ? home.news.intro : "",
      `<div class="grid grid--3">${NEWS.map((item) => card(item, "news.html", "gold")).join("")}</div>`
    )}${section(
      home.students ? home.students.title : "",
      home.students ? home.students.intro : "",
      `<div class="grid grid--3">${STUDENT_HONORS.map(
        (item) => `<article class="card"><h3>${item.title}</h3><p>${item.text}</p>${tags(item.tags)}</article>`
      ).join("")}</div>`
    )}${section(
      home.moms ? home.moms.title : "",
      home.moms ? home.moms.intro : "",
      `<div class="grid grid--3">${MOMS.map((item) => card(item, momUrl(item.slug), "pink", true)).join("")}</div>`,
      "section--mom"
    )}${section(
      learning.title || "",
      learning.intro || "",
      `<div class="split-panel"><div class="split-panel__main"><h3>${learning.headline || ""}</h3><p>${
        learning.text || ""
      }</p><div class="page-nav"><a class="button button--primary" href="learning-system.html">${
        learning.primaryLabel || ""
      }</a><a class="button button--secondary" href="${SITE.systemUrl || "#"}" target="_blank" rel="noreferrer">${
        learning.secondaryLabel || ""
      }</a></div></div><div class="split-panel__side">${tiles
        .map(
          (item, index) =>
            `<div class="system-tile${index === 1 ? " system-tile--navy" : ""}">${item}</div>`
        )
        .join("")}</div></div>`
    )}`;
  };

  const buildSearch = () => {
    const search = PAGE_DATA.search || {};
    return `<section class="page-hero"><div class="container"><span class="eyebrow">${search.eyebrow || "全站搜尋"}</span><h1>${
      search.title || ""
    }</h1><p>${search.intro || ""}</p></div></section><section class="section"><div class="container search-layout"><aside class="search-panel"><label class="search-label" for="site-search-input">${
      search.label || ""
    }</label><input id="site-search-input" class="search-input" type="search" placeholder="${
      search.placeholder || ""
    }" value="${PARAMS().get("q") || ""}"><div class="filter-group"><span>${
      search.typeLabel || ""
    }</span><select id="filter-type"><option value="">全部</option>${(search.typeOptions || [])
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("")}</select></div><div class="filter-group"><span>${
      search.gradeLabel || ""
    }</span><select id="filter-grade"><option value="">全部</option>${(search.gradeOptions || [])
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("")}</select></div><div class="filter-group"><span>${
      search.sortLabel || ""
    }</span><select id="filter-sort">${(search.sortOptions || [])
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("")}</select></div></aside><div><div id="search-results" class="search-results"></div></div></div></section><script type="application/json" id="search-data">${JSON.stringify(
      searchData()
    )}</script>`;
  };

  const momPage = (item) => {
    const detail = PAGE_DATA.momDetail || {};
    return `<section class="page-hero page-hero--mom"><div class="container article-layout"><div class="article-main">${cover(
      item.cover,
      "pink"
    )}<div class="article-head"><span class="eyebrow">${detail.eyebrow || ""}</span><h1>${item.title}</h1>${meta(
      item.date,
      item.category,
      true
    )}${tags(item.tags, true)}<p class="article-summary">${item.summary}</p></div><div class="article-body">${item.body
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("")}</div><div class="page-nav"><a class="back-link" href="star-mom.html">${
      detail.backListLabel || ""
    }</a><a class="back-link" href="index.html">${detail.backHomeLabel || ""}</a></div></div><aside class="article-side"><div class="card card--mom"><h3>${
      detail.categoryTitle || ""
    }</h3><p>${item.category}</p><p><strong>${detail.keywordsLabel || ""}</strong>${(
      item.keywords || []
    ).join("、")}</p></div></aside></div></section>`;
  };

  const routes = {
    "index.html": () => [PAGE_DATA.home?.seoTitle || "", PAGE_DATA.home?.subtitle || "", buildHome()],
    "one-page.html": () => {
      const config = PAGE_DATA.onePage || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          nav: pageNav(config.buttons || []),
          sections: (config.sections || []).map((item) =>
            section(item.title, item.intro, textCardGrid(item.cards, "grid--3"))
          )
        })
      ];
    },
    "needs.html": () => {
      const config = PAGE_DATA.needsLanding || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          sections: [
            section(
              config.sectionTitle || "",
              config.sectionIntro || "",
              `<div class="goal-grid">${GOALS.map(
                (goal) =>
                  `<a class="feature-box feature-box--goal" href="${goal.file}"><strong>${goal.title}</strong><p>${goal.intro}</p><span class="card-link">${config.cardLinkLabel || ""}</span></a>`
              ).join("")}</div>`
            )
          ]
        })
      ];
    },
    "courses.html": () => {
      const config = PAGE_DATA.coursesLanding || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          nav: pageNav(config.buttons || []),
          sections: [
            section(
              config.sectionTitle || "",
              config.sectionIntro || "",
              `<div class="grid grid--3">${COURSES.map(
                (course) =>
                  `<article class="card">${cover(course.title, course.theme)}${meta("", course.level)}<h3>${
                    course.title
                  }</h3><p>${course.summary}</p><ul class="list">${course.bullets
                    .map((bullet) => `<li>${bullet}</li>`)
                    .join("")}</ul><a class="card-link" href="${course.file}">${
                    config.cardLinkLabel || ""
                  }</a></article>`
              ).join("")}</div>`
            )
          ]
        })
      ];
    },
    "columns.html": () => ["文章專欄｜獵豹科教", "文章專欄", ""],
    "star-mom.html": () => {
      const config = PAGE_DATA.momsLanding || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        `<section class="page-hero page-hero--mom"><div class="container"><span class="eyebrow">${config.eyebrow || ""}</span><h1>${
          config.title || ""
        }</h1><p>${config.intro || ""}</p>${tags(config.heroTags || [], true)}</div></section>${section(
          config.sectionTitle || "",
          config.sectionIntro || "",
          `<div class="grid grid--3">${MOMS.map((item) => card(item, momUrl(item.slug), "pink", true)).join("")}</div>`,
          "section--mom"
        )}`
      ];
    },
    "news.html": () => {
      const config = PAGE_DATA.newsLanding || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          sections: [
            section(
              config.sectionTitle || "",
              config.sectionIntro || "",
              `<div class="grid grid--3">${NEWS.map((item) => card(item, "", "gold")).join("")}</div>`
            )
          ]
        })
      ];
    },
    "learning-system.html": () => {
      const config = PAGE_DATA.learningSystem || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          nav: `<div class="page-nav"><a class="button button--primary" href="${SITE.systemUrl || "#"}" target="_blank" rel="noreferrer">${
            config.systemButtonLabel || ""
          }</a><a class="back-link" href="index.html">${config.backHomeLabel || ""}</a></div>`,
          sections: [section(config.sectionTitle || "", config.sectionIntro || "", textCardGrid(config.cards))]
        })
      ];
    },
    "about.html": () => {
      const config = PAGE_DATA.about || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          sections: [section(config.sectionTitle || "", config.sectionIntro || "", textCardGrid(config.cards))]
        })
      ];
    },
    "features.html": () => {
      const config = PAGE_DATA.features || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          sections: [section(config.sectionTitle || "", config.sectionIntro || "", textCardGrid(config.cards, "grid--2"))]
        })
      ];
    },
    "students.html": () => {
      const config = PAGE_DATA.studentsLanding || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          sections: [
            section(
              config.honorsTitle || "",
              config.honorsIntro || "",
              `<div class="grid grid--3">${STUDENT_HONORS.map(
                (item) => `<article class="card"><h3>${item.title}</h3><p>${item.text}</p>${tags(item.tags)}</article>`
              ).join("")}</div>`
            ),
            section(config.extraTitle || "", config.extraIntro || "", textCardGrid(config.extraCards))
          ]
        })
      ];
    },
    "contact.html": () => {
      const config = PAGE_DATA.contact || {};
      return [
        config.seoTitle || "",
        config.subtitle || "",
        buildListPage(config.eyebrow || "", {
          title: config.title || "",
          intro: config.intro || "",
          nav: `<div class="page-nav"><a class="button button--primary" href="${SITE.lineUrl || "#"}" target="_blank" rel="noreferrer">${
            config.lineLabel || ""
          }</a><a class="button button--secondary" href="${SITE.fbUrl || "#"}" target="_blank" rel="noreferrer">${
            config.fbLabel || ""
          }</a></div>`,
          sections: [section(config.sectionTitle || "", config.sectionIntro || "", textCardGrid(config.cards))]
        })
      ];
    },
    "search.html": () => ["全站搜尋｜獵豹科教", "全站搜尋", buildSearch()],
    "article.html": () => ["文章專欄｜獵豹科教", "文章專欄", ""],
    "elite-story.html": () => ["獵豹菁英｜獵豹科教", "獵豹菁英", ""],
    "mom-power.html": () => {
      const item = MOMS.find((entry) => entry.slug === PARAMS().get("slug")) || MOMS[0];
      return [`${item.title}｜星媽正能量`, "星媽正能量", momPage(item)];
    }
  };

  const courseDetail = PAGE_DATA.courseDetail || {};
  COURSES.forEach((course) => {
    routes[course.file] = () => [
      `${course.title}｜獵豹科教`,
      course.title,
      buildListPage(courseDetail.eyebrow || "", {
        title: course.title,
        intro: course.summary,
        nav: `<div class="page-nav"><a class="button button--primary" href="contact.html">${
          courseDetail.ctaLabel || ""
        }</a><a class="back-link" href="courses.html">${courseDetail.backListLabel || ""}</a><a class="back-link" href="index.html">${
          courseDetail.backHomeLabel || ""
        }</a></div>`,
        sections: [
          section(
            courseDetail.highlightsTitle || "",
            courseDetail.highlightsIntro || "",
            `<div class="grid grid--3">${course.bullets
              .map((bullet, index) => `<article class="card"><h3>重點 ${index + 1}</h3><p>${bullet}</p></article>`)
              .join("")}</div>`
          ),
          section(
            courseDetail.tagsTitle || "",
            courseDetail.tagsIntro || "",
            `<div class="card">${tags(course.tags)}</div>`
          )
        ]
      })
    ];
  });

  const goalDetail = PAGE_DATA.goalDetail || {};
  GOALS.forEach((goal) => {
    routes[goal.file] = () => [
      `${goal.title}｜獵豹科教`,
      goal.title,
      buildListPage(goalDetail.eyebrow || "", {
        title: goal.title,
        intro: goal.intro,
        nav: `<div class="page-nav"><a class="button button--primary" href="${goal.relatedCourse}">${
          goalDetail.ctaLabel || ""
        }</a><a class="back-link" href="needs.html">${goalDetail.backListLabel || ""}</a><a class="back-link" href="index.html">${
          goalDetail.backHomeLabel || ""
        }</a></div>`,
        sections: [
          section(
            goalDetail.highlightsTitle || "",
            goalDetail.highlightsIntro || "",
            `<div class="grid grid--3">${goal.points
              .map((point, index) => `<article class="card"><h3>重點 ${index + 1}</h3><p>${point}</p></article>`)
              .join("")}</div>`
          ),
          section(
            goalDetail.readingTitle || "",
            goalDetail.readingIntro || "",
            `<div class="grid grid--2">${featuredArticles(2)
              .map((item) => card(item, articleUrl(item.slug), "navy"))
              .join("")}<article class="card"><h3>${goalDetail.courseCardTitle || ""}</h3><p>${
              goalDetail.courseCardText || ""
            }</p><a class="card-link" href="${goal.relatedCourse}">${
              goalDetail.courseCardLinkLabel || ""
            }</a></article></div>`
          )
        ]
      })
    ];
  });

  function wrapRichContentImages() {
    document.querySelectorAll(".article-body img, .elite-body img, .about-body img").forEach((img) => {
      if (img.closest(".rich-shimmer-frame, .elite-card__cover, .about-overview__tile, .about-profile__media, .a_pic")) return;
      const frame = document.createElement("span");
      frame.className = "rich-shimmer-frame";
      img.parentNode.insertBefore(frame, img);
      frame.appendChild(img);
    });
  }

  const picked = (routes[PAGE()] || routes["index.html"])();
  const main = document.querySelector("main.page");
  const shouldHydrateMain = !main || !main.children.length;
  applyChrome(picked[0], picked[1]);
  if (shouldHydrateMain) page(picked[2]);
  wrapRichContentImages();

  const targets = document.querySelectorAll(".hero-panel, .card:not(.article-card), .feature-box, .section-heading, .goal-chip");
  targets.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
    { threshold: 0.16 }
  );
  targets.forEach((el) => observer.observe(el));

  const slider = document.querySelector("[data-banner-slider]");
  if (slider) {
    const slides = [...slider.querySelectorAll(".hero-banner")];
    const dots = [...slider.querySelectorAll("[data-banner-dot]")];
    let current = 0;
    const show = (index) => {
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      current = index;
    };
    dots.forEach((dot) => dot.addEventListener("click", () => show(Number(dot.dataset.bannerDot))));
    setInterval(() => show((current + 1) % slides.length), 4500);
  }

  const dataEl = document.getElementById("search-data");
  if (dataEl) {
    const searchConfig = PAGE_DATA.search || {};
    const liveItems = typeof searchData === "function" ? searchData() : JSON.parse(dataEl.textContent);
    const items = liveItems.map((item) => {
      const title = String(item.title || "");
      const tagsText = (item.tags || []).join(" ");
      const keywordsText = (item.keywords || []).join(" ");
      const summary = String(item.summary || "");
      const body = String(item.body || "");
      const topic = String(item.topic || "");
      const gradeLabel = String(item.grade || "");
      const normalize = (value) =>
        String(value || "")
          .toLowerCase()
          .normalize("NFKC")
          .replace(/\s+/g, " ")
          .trim();
      const squeeze = (value) => normalize(value).replace(/[\s\-_/|,.;:!?"'[\](){}]+/g, "");
      return {
        ...item,
        _search: {
          title,
          summary,
          topic,
          gradeLabel,
          titleNorm: normalize(title),
          titleTight: squeeze(title),
          tagsNorm: normalize(tagsText),
          tagsTight: squeeze(tagsText),
          keywordsNorm: normalize(keywordsText),
          keywordsTight: squeeze(keywordsText),
          summaryNorm: normalize(summary),
          summaryTight: squeeze(summary),
          bodyNorm: normalize(body),
          bodyTight: squeeze(body),
          topicNorm: normalize(topic),
          gradeNorm: normalize(gradeLabel),
          urlNorm: normalize(item.url || ""),
          typeNorm: normalize(item.type || "")
        }
      };
    });

    const input = document.getElementById("site-search-input");
    const type = document.getElementById("filter-type");
    const grade = document.getElementById("filter-grade");
    const sort = document.getElementById("filter-sort");
    const box = document.getElementById("search-results");
    const initialQuery = PARAMS().get("q") || "";
    if (initialQuery && !input.value) input.value = initialQuery;

    const normalize = (value) =>
      String(value || "")
        .toLowerCase()
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .trim();
    const squeeze = (value) => normalize(value).replace(/[\s\-_/|,.;:!?"'[\](){}]+/g, "");
    const tokenize = (value) => normalize(value).split(/\s+/).filter(Boolean);
    const goalType = normalize("家長導航");
    const momType = normalize("星媽正能量");
    const columnType = normalize("文章專欄");
    const eliteType = normalize("獵豹菁英");

    const categoryRank = (item) =>
      item._search && item._search.typeNorm === goalType ? 0 : item._search && item._search.typeNorm === momType ? 2 : 1;

    const fieldLevel = (norm, tight, phrase, phraseTight) => {
      if (!phrase) return -1;
      if (norm === phrase || tight === phraseTight) return 0;
      if (norm.startsWith(phrase) || tight.startsWith(phraseTight)) return 1;
      if (norm.includes(phrase) || tight.includes(phraseTight)) return 2;
      return -1;
    };

    const rankItem = (item, q) => {
      if (!q) return { matched: true, bucket: 99, score: item.popularity * 0.6 + item.freshness * 0.4 };
      const phrase = normalize(q);
      const phraseTight = squeeze(q);
      const tokens = tokenize(q);
      const tightTokens = tokens.map((token) => squeeze(token)).filter(Boolean);
      const data = item._search;
      const titleLevel = fieldLevel(data.titleNorm, data.titleTight, phrase, phraseTight);
      const tagLevel = Math.min(
        ...[
          fieldLevel(data.tagsNorm, data.tagsTight, phrase, phraseTight),
          fieldLevel(data.keywordsNorm, data.keywordsTight, phrase, phraseTight)
        ].filter((level) => level >= 0),
        Infinity
      );
      const summaryLevel = fieldLevel(data.summaryNorm, data.summaryTight, phrase, phraseTight);
      const bodyLevel = fieldLevel(data.bodyNorm, data.bodyTight, phrase, phraseTight);
      const metaLevel = Math.min(
        ...[
          fieldLevel(data.topicNorm, data.topicNorm, phrase, phraseTight),
          fieldLevel(data.gradeNorm, data.gradeNorm, phrase, phraseTight),
          fieldLevel(data.urlNorm, data.urlNorm, phrase, phraseTight)
        ].filter((level) => level >= 0),
        Infinity
      );
      let bucket = Infinity;
      if (titleLevel === 0) bucket = 0;
      else if (titleLevel < Infinity && titleLevel >= 1) bucket = 1;
      else if (tagLevel < Infinity) bucket = 2;
      else if (summaryLevel >= 0) bucket = 3;
      else if (bodyLevel >= 0) bucket = 4;
      else if (metaLevel < Infinity) bucket = 5;
      let score = 0;
      if (titleLevel === 0) score += 4000;
      else if (titleLevel === 1) score += 2800;
      else if (titleLevel === 2) score += 2300;
      if (tagLevel === 0) score += 1900;
      else if (tagLevel === 1) score += 1500;
      else if (tagLevel === 2) score += 1200;
      if (summaryLevel === 0) score += 960;
      else if (summaryLevel === 1) score += 820;
      else if (summaryLevel === 2) score += 700;
      if (bodyLevel === 0) score += 560;
      else if (bodyLevel === 1) score += 470;
      else if (bodyLevel === 2) score += 360;
      if (metaLevel === 0) score += 220;
      else if (metaLevel === 1) score += 180;
      else if (metaLevel === 2) score += 120;
      let matchedTokens = 0;
      tightTokens.forEach((token, index) => {
        const looseToken = tokens[index] || "";
        let tokenScore = 0;
        if (data.titleTight === token) tokenScore = Math.max(tokenScore, 360);
        if (data.titleTight.startsWith(token)) tokenScore = Math.max(tokenScore, 260);
        if (data.titleTight.includes(token)) tokenScore = Math.max(tokenScore, 210);
        if (data.tagsTight.includes(token) || data.keywordsTight.includes(token)) tokenScore = Math.max(tokenScore, 180);
        if (data.summaryTight.includes(token)) tokenScore = Math.max(tokenScore, 105);
        if (data.bodyTight.includes(token)) tokenScore = Math.max(tokenScore, 55);
        if (data.topicNorm.includes(looseToken) || data.gradeNorm.includes(looseToken)) tokenScore = Math.max(tokenScore, 40);
        if (tokenScore > 0) matchedTokens += 1;
        score += tokenScore;
      });
      if (tokens.length && matchedTokens === tokens.length) score += 220 + tokens.length * 18;
      else if (tokens.length > 1 && matchedTokens > 0) score -= Math.max(0, (tokens.length - matchedTokens) * 120);
      const matched = bucket < Infinity || score > 0;
      return { matched, bucket: bucket < Infinity ? bucket : 6, score: matched ? score + item.popularity * 0.12 + item.freshness * 0.08 : 0 };
    };

    const compareBest = (a, b) => {
      const categoryDiff = categoryRank(a) - categoryRank(b);
      if (categoryDiff) return categoryDiff;
      const bucketDiff = (a.rank.bucket ?? 99) - (b.rank.bucket ?? 99);
      if (bucketDiff) return bucketDiff;
      const scoreDiff = (b.rank.score || 0) - (a.rank.score || 0);
      if (scoreDiff) return scoreDiff;
      const popularityDiff = (b.popularity || 0) - (a.popularity || 0);
      if (popularityDiff) return popularityDiff;
      const freshnessDiff = (b.freshness || 0) - (a.freshness || 0);
      if (freshnessDiff) return freshnessDiff;
      return (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0);
    };

    const compareLatest = (a, b) => {
      const momDiff = categoryRank(a) - categoryRank(b);
      if (momDiff && Math.max(categoryRank(a), categoryRank(b)) === 2) return momDiff;
      return (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0) || b.freshness - a.freshness || compareBest(a, b);
    };

    const comparePopular = (a, b) => {
      const momDiff = categoryRank(a) - categoryRank(b);
      if (momDiff && Math.max(categoryRank(a), categoryRank(b)) === 2) return momDiff;
      return b.popularity - a.popularity || b.freshness - a.freshness || compareBest(a, b);
    };

    const weaveColumnElite = (list) => {
      const pinnedHead = [];
      const pinnedTail = [];
      const middle = [];
      list.forEach((item) => {
        const rank = categoryRank(item);
        if (rank === 0) pinnedHead.push(item);
        else if (rank === 2) pinnedTail.push(item);
        else middle.push(item);
      });
      const groups = [];
      middle.forEach((item) => {
        const prev = groups[groups.length - 1];
        const score = item.rank && typeof item.rank.score === "number" ? item.rank.score : 0;
        if (!prev || prev.bucket !== (item.rank && item.rank.bucket) || Math.abs(prev.score - score) > 260) {
          groups.push({ bucket: item.rank && item.rank.bucket, score, items: [item] });
          return;
        }
        prev.items.push(item);
      });
      const woven = groups.flatMap((group) => {
        const columns = [];
        const elites = [];
        group.items.forEach((item) => {
          if (item._search && item._search.typeNorm === columnType) columns.push(item);
          else if (item._search && item._search.typeNorm === eliteType) elites.push(item);
        });
        if (!columns.length || !elites.length) return group.items;
        const useColumnFirst = ((columns[0].rank && columns[0].rank.score) || 0) >= ((elites[0].rank && elites[0].rank.score) || 0);
        let pullColumn = useColumnFirst;
        const targets = [];
        while (columns.length || elites.length) {
          if (pullColumn && columns.length) targets.push(columns.shift());
          else if (!pullColumn && elites.length) targets.push(elites.shift());
          else if (columns.length) targets.push(columns.shift());
          else if (elites.length) targets.push(elites.shift());
          pullColumn = !pullColumn;
        }
        return group.items.map((item) =>
          item._search && (item._search.typeNorm === columnType || item._search.typeNorm === eliteType) ? targets.shift() : item
        );
      });
      return pinnedHead.concat(woven, pinnedTail);
    };

    const render = () => {
      const q = input.value.trim();
      let list = items
        .filter((item) => !type.value || item.type === type.value)
        .filter((item) => !grade.value || item.grade.includes(grade.value))
        .map((item) => ({ ...item, rank: rankItem(item, q) }))
        .filter((item) => !q || item.rank.matched)
        .sort((a, b) => (sort.value === "latest" ? compareLatest(a, b) : sort.value === "popular" ? comparePopular(a, b) : compareBest(a, b)));
      if (q && sort.value === "best") list = weaveColumnElite(list);
      box.innerHTML = list.length
        ? list
            .map(
              (item) =>
                `<article class="card search-card"><div class="search-card__head"><span class="search-result__type">${item.type}</span>${tags(
                  item.tags.slice(0, 3)
                )}</div><h3>${item.title}</h3><p>${item.summary}</p><div class="card__meta-row"><span class="chip chip--muted">${
                  item.grade
                }</span><span class="chip chip--muted">${item.topic}</span></div><a class="card-link" href="${item.url}">${
                  searchConfig.resultLinkLabel || "前往內容"
                }</a></article>`
            )
            .join("")
        : `<div class="empty-state"><h3>${searchConfig.emptyTitle || ""}</h3><p>${searchConfig.emptyIntro || ""}</p></div>`;
      const url = new URL(location.href);
      q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
      history.replaceState({}, "", url);
    };

    [input, type, grade, sort].forEach((el) => el.addEventListener("input", render));
    render();
  }
})();
