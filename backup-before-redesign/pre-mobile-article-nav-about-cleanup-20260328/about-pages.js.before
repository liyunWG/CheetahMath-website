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

  function normalizeLines(text) {
    return String(text || '')
      .replace(/\r/g, '')
      .split('\n')
      .map(function (line) {
        return line.replace(/\s+/g, ' ').trim();
      })
      .filter(Boolean);
  }

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function getImages(item) {
    return unique((String(item.bodyHtml || '').match(/pic\/about\/[^"')\s>]+/g) || []));
  }

  function buildQuickFacts(items) {
    return [
      { label: '頁面數', value: String(items.length) },
      { label: '內容模組', value: String(items.reduce(function (sum, item) { return sum + Math.max(1, parseStructuredSections(item).length); }, 0)) },
      { label: '更新方式', value: 'Excel 原稿 + 網站轉版' }
    ];
  }

  function renderSelector(items, activeSlug) {
    return (
      '<div class="about-selector">' +
      items.map(function (item) {
        return (
          '<button type="button" class="about-selector__button' +
          (item.slug === activeSlug ? ' is-active' : '') +
          '" data-about-slug="' + escapeHtml(item.slug) + '">' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(item.summary || '') + '</span>' +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function renderFacts(items) {
    return (
      '<div class="goal-chip-row about-chip-row">' +
      buildQuickFacts(items).map(function (fact) {
        return '<div class="goal-chip"><span>' + escapeHtml(fact.value) + '</span><small>' + escapeHtml(fact.label) + '</small></div>';
      }).join('') +
      '</div>'
    );
  }

  function paragraphHtml(text) {
    return '<p>' + escapeHtml(text) + '</p>';
  }

  function parseStructuredSections(item) {
    const lines = normalizeLines(item.draftBody);
    const sections = [];
    let current = null;

    function pushCurrent() {
      if (!current) return;
      current.paragraphs = current.paragraphs.filter(Boolean);
      current.bullets = current.bullets.filter(Boolean);
      if (current.title || current.paragraphs.length || current.bullets.length) {
        sections.push(current);
      }
    }

    lines.forEach(function (line) {
      const headingMatch = line.match(/^【(.+?)】\s*(.*)$/);
      const isNamedSection = /^(國內升學|國際升學|資優與競賽|STEM教育|獵豹師資團隊|數理科學的重要性|升學與職場的競爭力|全球視野下的K12菁英教育)$/.test(line);
      const isSeriesHeading = /^(PK|J|FJ|S|FS|FA|FU|GGB)系列/.test(line);
      if (headingMatch) {
        pushCurrent();
        current = { title: headingMatch[1], subtitle: headingMatch[2], paragraphs: [], bullets: [] };
        return;
      }
      if (isNamedSection || isSeriesHeading) {
        pushCurrent();
        current = { title: line, subtitle: '', paragraphs: [], bullets: [] };
        return;
      }
      if (!current) {
        current = { title: item.title, subtitle: '', paragraphs: [], bullets: [] };
      }
      if (/^(\( ?[ⅰⅱⅲⅳⅴⅵⅶⅷⅸx]+ ?\)|\d+[.）]|[•●■])/.test(line)) {
        current.bullets.push(line.replace(/^[•●■]\s*/, ''));
      } else {
        current.paragraphs.push(line);
      }
    });

    pushCurrent();
    return sections;
  }

  function parseTeamProfiles(item) {
    const lines = normalizeLines(item.draftBody);
    const images = getImages(item);
    const profiles = [];
    let i = 0;
    let imageIndex = 0;

    function isRoleLine(line) {
      return /(共同創辦人|教研|教師|顧問|總監|系統研發|教材開發|規劃|委員|負責團隊)/.test(line) && !/老師$/.test(line);
    }

    while (i < lines.length) {
      if (!isRoleLine(lines[i])) {
        i += 1;
        continue;
      }
      const role = lines[i];
      const name = lines[i + 1] || '';
      if (!/老師|團隊|Leon|Kevin|Jackie|Tim|Wayne/.test(name)) {
        i += 1;
        continue;
      }
      i += 2;
      const bio = [];
      while (i < lines.length && !isRoleLine(lines[i])) {
        bio.push(lines[i]);
        i += 1;
      }
      profiles.push({
        role: role,
        name: name,
        bio: bio,
        image: images[imageIndex] || ''
      });
      imageIndex += 1;
    }

    return profiles;
  }

  function renderProfiles(item, featuredCount) {
    const profiles = parseTeamProfiles(item);
    if (!profiles.length) return '';
    const featured = profiles.slice(0, featuredCount);
    const grid = profiles.slice(featuredCount);
    return (
      (featured.length ? '<div class="about-team-featured">' + featured.map(renderProfileCard).join('') + '</div>' : '') +
      (grid.length ? '<div class="about-team-grid">' + grid.map(renderProfileCard).join('') + '</div>' : '')
    );
  }

  function renderProfileCard(profile) {
    return (
      '<article class="card about-profile">' +
      (profile.image ? '<div class="about-profile__media"><img src="' + escapeHtml(profile.image) + '" alt="' + escapeHtml(profile.name) + '"></div>' : '') +
      '<div class="about-profile__content">' +
      '<span class="chip chip--muted">' + escapeHtml(profile.role) + '</span>' +
      '<h3>' + escapeHtml(profile.name) + '</h3>' +
      profile.bio.map(paragraphHtml).join('') +
      '</div>' +
      '</article>'
    );
  }

  function renderIntro(item) {
    const images = getImages(item);
    const sections = parseStructuredSections(item);
    const lead = sections.shift();
    return (
      '<article class="card about-story-main">' +
      '<div class="article-head about-article-head">' +
      '<span class="eyebrow">' + escapeHtml(item.section) + '</span>' +
      '<h1>' + escapeHtml(item.title) + '</h1>' +
      '<p class="article-summary">' + escapeHtml(item.summary || '') + '</p>' +
      '</div>' +
      '<div class="about-overview">' +
      images.slice(0, 5).map(function (image, index) {
        return '<div class="about-overview__tile"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml((sections[index] && sections[index].title) || item.title) + '"></div>';
      }).join('') +
      '</div>' +
      (lead ? '<section class="about-copy-block"><h2>' + escapeHtml(lead.title) + '</h2>' + lead.paragraphs.map(paragraphHtml).join('') + '</section>' : '') +
      '<div class="about-section-grid">' + sections.map(function (section) {
        return '<section class="card about-section-card"><h3>' + escapeHtml(section.title) + '</h3>' + section.paragraphs.map(paragraphHtml).join('') + (section.bullets.length ? '<ul class="list">' + section.bullets.map(function (bullet) { return '<li>' + escapeHtml(bullet) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
      }).join('') + '</div>' +
      '</article>'
    );
  }

  function renderStructuredStory(item) {
    const sections = parseStructuredSections(item);
    return (
      '<article class="card about-story-main">' +
      '<div class="article-head about-article-head">' +
      '<span class="eyebrow">' + escapeHtml(item.section) + '</span>' +
      '<h1>' + escapeHtml(item.title) + '</h1>' +
      '<p class="article-summary">' + escapeHtml(item.summary || '') + '</p>' +
      '</div>' +
      '<div class="about-section-stack">' + sections.map(function (section) {
        return '<section class="about-copy-block"><h2>' + escapeHtml(section.title) + (section.subtitle ? '<small>' + escapeHtml(section.subtitle) + '</small>' : '') + '</h2>' + section.paragraphs.map(paragraphHtml).join('') + (section.bullets.length ? '<ul class="list">' + section.bullets.map(function (bullet) { return '<li>' + escapeHtml(bullet) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
      }).join('') +
      '</article>'
    );
  }

  function renderCurriculum(item) {
    const sections = parseStructuredSections(item);
    const hero = sections.shift();
    return (
      '<article class="card about-story-main">' +
      '<div class="article-head about-article-head">' +
      '<span class="eyebrow">' + escapeHtml(item.section) + '</span>' +
      '<h1>' + escapeHtml(item.title) + '</h1>' +
      '<p class="article-summary">' + escapeHtml(item.summary || '') + '</p>' +
      '</div>' +
      (hero ? '<section class="about-copy-block"><h2>' + escapeHtml(hero.title) + '</h2>' + hero.paragraphs.map(paragraphHtml).join('') + '</section>' : '') +
      '<div class="about-course-grid">' + sections.map(function (section) {
        return '<section class="card about-course-card"><h3>' + escapeHtml(section.title) + '</h3>' + section.paragraphs.map(paragraphHtml).join('') + (section.bullets.length ? '<ul class="list">' + section.bullets.map(function (bullet) { return '<li>' + escapeHtml(bullet) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
      }).join('') + '</div>' +
      '</article>'
    );
  }

  function renderBody(item) {
    if (item.slug === 'about-intro') return renderIntro(item);
    if (item.slug === 'about-founders') return '<article class="about-story-main">' + renderProfiles(item, 2) + '</article>';
    if (item.slug === 'about-advisors') return '<article class="about-story-main">' + renderProfiles(item, 2) + '</article>';
    if (item.slug === 'feature-curriculum') return renderCurriculum(item);
    return renderStructuredStory(item);
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
      renderFacts(sectionItems) +
      '</div>' +
      '</section>' +
      '<section class="section">' +
      '<div class="container">' +
      '<div class="elite-toolbar about-toolbar">' +
      '<label class="elite-toolbar__field">' +
      '<span>切換頁面</span>' +
      '<select id="about-select">' +
      sectionItems.map(function (item) {
        return '<option value="' + escapeHtml(item.slug) + '"' + (item.slug === activeSlug ? ' selected' : '') + '>' + escapeHtml(item.title) + '</option>';
      }).join('') +
      '</select>' +
      '</label>' +
      '</div>' +
      renderSelector(sectionItems, activeSlug) +
      '<div id="about-detail"></div>' +
      '</div>' +
      '</section>';

    const detail = qs('#about-detail');
    const select = qs('#about-select');

    function draw(slug) {
      const item = sectionItems.find(function (entry) { return entry.slug === slug; }) || sectionItems[0];
      if (!item) return;
      detail.innerHTML = renderBody(item);
      qsa('.about-selector__button').forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-about-slug') === item.slug);
      });
      if (select) select.value = item.slug;
      const url = new URL(location.href);
      url.searchParams.set('slug', item.slug);
      history.replaceState({}, '', url);
      updateMeta(item.title + '｜' + sectionModel.title + '｜獵豹科教', item.summary || sectionModel.intro || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (select) {
      select.addEventListener('change', function () {
        draw(select.value);
      });
    }

    qsa('[data-about-slug]').forEach(function (button) {
      button.addEventListener('click', function () {
        draw(button.getAttribute('data-about-slug'));
      });
    });

    draw(activeSlug);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderPage(loadModel());
  });
})();
