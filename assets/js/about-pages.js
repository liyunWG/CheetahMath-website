(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getPageName() {
    return window.location.pathname.split('/').pop() || 'about.html';
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function updateMeta(title, description) {
    document.title = title;
    [
      ["meta[name='description']", description],
      ["meta[property='og:title']", title],
      ["meta[property='og:description']", description],
      ["meta[property='og:url']", location.href],
      ["meta[name='twitter:title']", title],
      ["meta[name='twitter:description']", description]
    ].forEach(function (entry) {
      const node = document.querySelector(entry[0]);
      if (node) node.setAttribute('content', entry[1]);
    });
  }

  function loadModel() {
    const raw = window.__ABOUT_DATA__ || {};
    return {
      sections: Array.isArray(raw.sections) ? raw.sections : [],
      items: Array.isArray(raw.items) ? raw.items : []
    };
  }

  const TAB_CAPTIONS = {
    'about-intro': '品牌與課程版圖',
    'about-founders': '創辦人與經營者',
    'about-advisors': '教師與教研顧問'
  };

  function paragraphHtml(text) {
    return '<p>' + escapeHtml(text) + '</p>';
  }

  function bulletsHtml(bullets) {
    if (!bullets || !bullets.length) return '';
    return '<ul class="list">' + bullets.map(function (bullet) {
      return '<li>' + escapeHtml(bullet) + '</li>';
    }).join('') + '</ul>';
  }

  function renderTabs(items, activeSlug) {
    return (
      '<div class="about-tabs" role="tablist">' +
      items.map(function (item) {
        return (
          '<button type="button" role="tab" class="about-tabs__button' +
          (item.slug === activeSlug ? ' is-active' : '') +
          '" data-about-slug="' + escapeHtml(item.slug) + '">' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(TAB_CAPTIONS[item.slug] || '') + '</span>' +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function renderHead(item, summaryText) {
    return (
      '<div class="article-head about-article-head">' +
      '<span class="eyebrow">' + escapeHtml(item.section) + '</span>' +
      '<h1>' + escapeHtml(item.title) + '</h1>' +
      (summaryText ? '<p class="article-summary">' + escapeHtml(summaryText) + '</p>' : '') +
      '</div>'
    );
  }

  function renderIntro(item) {
    const intro = item.intro || {};
    const lead = intro.lead || {};
    const vision = intro.vision || {};
    const pillars = intro.pillars || [];
    return (
      '<article class="about-story-main">' +
      renderHead(item, '一頁看懂獵豹是誰、在教什麼、往哪裡走。') +
      '<section class="card about-lead">' +
      '<div class="about-lead__copy"><h2>' + escapeHtml(lead.title || item.title) + '</h2>' +
      (lead.paragraphs || []).map(paragraphHtml).join('') +
      '</div>' +
      (intro.heroImage ? '<div class="about-lead__art"><img src="' + escapeHtml(intro.heroImage) + '" alt="獵豹科教" loading="lazy"></div>' : '') +
      '</section>' +
      '<div class="about-pillar-grid">' +
      pillars.map(function (pillar) {
        return (
          '<section class="card about-pillar-card">' +
          '<h3><span class="about-pillar-card__icon" aria-hidden="true">' + escapeHtml(pillar.icon || '') + '</span>' + escapeHtml(pillar.title) + '</h3>' +
          (pillar.desc ? '<p>' + escapeHtml(pillar.desc) + '</p>' : '') +
          bulletsHtml(pillar.bullets) +
          '</section>'
        );
      }).join('') +
      '</div>' +
      (vision.paragraphs && vision.paragraphs.length ?
        '<section class="about-vision"><h2>' + escapeHtml(vision.title || 'STEM 教育與願景') + '</h2>' +
        vision.paragraphs.map(paragraphHtml).join('') +
        '</section>' : '') +
      '</article>'
    );
  }

  function avatarHtml(profile, size) {
    if (!profile.image) return '<span class="about-avatar about-avatar--placeholder about-avatar--' + size + '" aria-hidden="true">' + escapeHtml((profile.name || '?').charAt(0)) + '</span>';
    return '<img class="about-avatar about-avatar--' + size + '" src="' + escapeHtml(profile.image) + '" alt="' + escapeHtml(profile.name) + '" loading="lazy">';
  }

  function renderFounders(item) {
    const profiles = item.profiles || [];
    return (
      '<article class="about-story-main">' +
      renderHead(item, '獵豹由深耕數理資優與升學教育的教育者，以及具產業與數位學習經驗的經營者共同創辦。') +
      profiles.map(function (profile) {
        return (
          '<section class="card about-founder-card">' +
          '<div class="about-founder-card__media">' + avatarHtml(profile, 'lg') + '</div>' +
          '<div class="about-founder-card__content">' +
          '<span class="chip chip--muted">' + escapeHtml(profile.role) + '</span>' +
          '<h3>' + escapeHtml(profile.name) + '</h3>' +
          (profile.paragraphs || []).map(paragraphHtml).join('') +
          bulletsHtml(profile.bullets) +
          '</div>' +
          '</section>'
        );
      }).join('') +
      '</article>'
    );
  }

  function renderAdvisors(item) {
    const profiles = item.profiles || [];
    // 每張卡片一律用同樣的高度：簡介先固定高度收合，展開鈕一律輸出（不需要時
    // 只隱藏、保留位置），實際哪幾位需要收合由 syncBioToggles 依真實高度判斷。
    return (
      '<article class="about-story-main">' +
      renderHead(item, '共 ' + profiles.length + ' 位教師與教研顧問，橫跨資優教育、數學競賽、國際課程與程式設計領域。') +
      '<div class="about-team-grid">' +
      profiles.map(function (profile) {
        return (
          '<section class="card about-teacher-card">' +
          '<header class="about-teacher-card__head">' +
          avatarHtml(profile, 'sm') +
          '<div class="about-teacher-card__id">' +
          '<h3>' + escapeHtml(profile.name) + '</h3>' +
          '<span class="chip chip--muted">' + escapeHtml(profile.role) + '</span>' +
          '</div>' +
          '</header>' +
          '<div class="about-bio is-collapsed">' +
          (profile.paragraphs || []).map(paragraphHtml).join('') +
          bulletsHtml(profile.bullets) +
          '</div>' +
          '<button type="button" class="about-bio-toggle" aria-expanded="false">展開完整介紹</button>' +
          '</section>'
        );
      }).join('') +
      '</div>' +
      '</article>'
    );
  }

  function renderStructuredFallback(item) {
    return (
      '<article class="card about-story-main">' +
      renderHead(item, item.summary || '') +
      '<div class="about-body">' + (item.bodyHtml || '') + '</div>' +
      '</article>'
    );
  }

  function renderBody(item) {
    if (item.slug === 'about-intro' && item.intro) return renderIntro(item);
    if (item.slug === 'about-founders' && item.profiles) return renderFounders(item);
    if (item.slug === 'about-advisors' && item.profiles) return renderAdvisors(item);
    return renderStructuredFallback(item);
  }

  // 欄數會隨視窗寬度改變，同一段文字可能這個寬度塞得下、換個寬度塞不下，
  // 所以用實際排版後的高度判斷，而不是用字數猜。
  function syncBioToggles(root) {
    // 名字或職稱較長時標頭會多一行，卡片就會比別人高；先量出最高的標頭，
    // 再讓所有標頭都用這個高度，卡片才會完全等高。
    qsa('.about-team-grid', root).forEach(function (grid) {
      const heads = qsa('.about-teacher-card__head', grid);
      if (!heads.length) return;
      heads.forEach(function (head) { head.style.minHeight = ''; });
      const tallest = heads.reduce(function (max, head) {
        return Math.max(max, head.getBoundingClientRect().height);
      }, 0);
      heads.forEach(function (head) { head.style.minHeight = Math.ceil(tallest) + 'px'; });
    });
    qsa('.about-teacher-card', root).forEach(function (card) {
      const bio = qs('.about-bio', card);
      const button = qs('.about-bio-toggle', card);
      if (!bio || !button) return;
      if (!bio.classList.contains('is-collapsed')) return;
      const overflows = bio.scrollHeight > bio.clientHeight + 1;
      bio.classList.toggle('is-clipped', overflows);
      button.classList.toggle('is-hidden', !overflows);
      button.disabled = !overflows;
    });
  }

  function bindBioToggles(root) {
    qsa('.about-bio-toggle', root).forEach(function (button) {
      button.addEventListener('click', function () {
        const bio = button.previousElementSibling;
        const collapsed = bio.classList.toggle('is-collapsed');
        bio.classList.toggle('is-clipped', collapsed);
        button.textContent = collapsed ? '展開完整介紹' : '收合介紹';
        button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
    });
    syncBioToggles(root);
    // 字體載入前後行高會變，載入完成要再量一次，否則會多出用不到的展開鈕
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { syncBioToggles(root); });
    }
    // 卡片寬度變了（改變視窗大小、換欄數）就要重算。window resize 涵蓋一般情況，
    // ResizeObserver 再補上格線自己變寬（例如捲軸出現）的情形；只在寬度真的改變
    // 時重算，避免自己改高度又觸發自己。
    if (!bindBioToggles.resizeBound) {
      bindBioToggles.resizeBound = true;
      let timer = null;
      window.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { syncBioToggles(document); }, 150);
      });
    }
    if (typeof ResizeObserver === 'function') {
      qsa('.about-team-grid', root).forEach(function (grid) {
        let lastWidth = grid.getBoundingClientRect().width;
        new ResizeObserver(function () {
          const width = grid.getBoundingClientRect().width;
          if (Math.abs(width - lastWidth) < 1) return;
          lastWidth = width;
          syncBioToggles(root);
        }).observe(grid);
      });
    }
  }

  function renderPage(model) {
    const pageName = getPageName();
    const sectionModel = model.sections.find(function (section) {
      return section.page === pageName;
    });
    const main = qs('main.page');
    if (!sectionModel || !main) return;

    const sectionItems = sectionModel.slugs
      .map(function (slug) {
        return model.items.find(function (item) { return item.slug === slug; });
      })
      .filter(Boolean);

    const params = getParams();
    let activeSlug = params.get('slug') || (sectionItems[0] && sectionItems[0].slug) || '';
    if (!sectionItems.some(function (item) { return item.slug === activeSlug; })) {
      activeSlug = sectionItems[0] ? sectionItems[0].slug : '';
    }

    main.innerHTML =
      '<section class="page-hero">' +
      '<div class="container">' +
      '<span class="eyebrow">' + escapeHtml(sectionModel.title) + '</span>' +
      '<h1>' + escapeHtml(sectionModel.title) + '</h1>' +
      '<p>' + escapeHtml(sectionModel.intro || '') + '</p>' +
      '</div>' +
      '</section>' +
      '<section class="section">' +
      '<div class="container">' +
      renderTabs(sectionItems, activeSlug) +
      '<div id="about-detail"></div>' +
      '</div>' +
      '</section>';

    const detail = qs('#about-detail');

    function draw(slug, skipScroll) {
      const item = sectionItems.find(function (entry) { return entry.slug === slug; }) || sectionItems[0];
      if (!item) return;
      detail.innerHTML = renderBody(item);
      bindBioToggles(detail);
      qsa('.about-tabs__button').forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-about-slug') === item.slug);
      });
      const url = new URL(location.href);
      url.searchParams.set('slug', item.slug);
      history.replaceState({}, '', url);
      updateMeta(item.title + '｜' + sectionModel.title + '｜獵豹科教', item.summary || sectionModel.intro || '');
      if (!skipScroll) {
        const tabs = qs('.about-tabs');
        if (tabs) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    qsa('[data-about-slug]').forEach(function (button) {
      button.addEventListener('click', function () {
        draw(button.getAttribute('data-about-slug'));
      });
    });

    draw(activeSlug, true);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderPage(loadModel());
  });
})();
