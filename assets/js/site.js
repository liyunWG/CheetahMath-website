(function () {
  const SITE = {
    brand: "獵豹資優",
    subtitle: "國小到國中資優數理學習系統",
    footer: "獵豹資優提供完整的數理培育路徑，從能力診斷、課程安排到升學競賽規劃，協助孩子穩定進步。"
  };

  const navLinks = [
    ["one-page.html", "品牌總覽"],
    ["about.html", "關於我們"],
    ["features.html", "核心特色"],
    ["courses.html", "課程介紹"],
    ["needs.html", "需求導航"],
    ["columns.html", "專欄文章"],
    ["news.html", "最新消息"],
    ["students.html", "學生成果"],
    ["star-mom.html", "家長見證"]
  ];

  const page = location.pathname.split("/").pop() || "index.html";

  const linkButton = (href, label, variant) =>
    `<a class="${variant}" href="${href}">${label}</a>`;

  const cards = (items) =>
    items
      .map(
        (item) =>
          `<article class="card"><h3>${item.title}</h3><p>${item.text}</p>${
            item.link ? `<a class="card-link" href="${item.link.href}">${item.link.label}</a>` : ""
          }</article>`
      )
      .join("");

  const featureBoxes = (items) =>
    items
      .map(
        (item) =>
          `<a class="feature-box" href="${item.href}"><h3>${item.title}</h3><p>${item.text}</p></a>`
      )
      .join("");

  const heroGrid = (eyebrow, title, intro, primary, secondary, asideTitle, asideMeta) => `
    <section class="page-hero">
      <div class="container page-hero__grid">
        <div>
          <span class="eyebrow">${eyebrow}</span>
          <h1>${title}</h1>
          <p>${intro}</p>
          <div class="page-nav">
            ${primary ? linkButton(primary.href, primary.label, "button button--primary") : ""}
            ${secondary ? linkButton(secondary.href, secondary.label, secondary.kind || "button button--secondary") : ""}
          </div>
        </div>
        <div class="hero-card visual-card">
          <div>
            <h3>${asideTitle}</h3>
            <p class="meta">${asideMeta}</p>
          </div>
        </div>
      </div>
    </section>
  `;

  const pageHero = (eyebrow, title, intro, actionsHtml) => `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">${eyebrow}</span>
        <h1>${title}</h1>
        <p>${intro}</p>
        <div class="page-nav">${actionsHtml}</div>
      </div>
    </section>
  `;

  const section = (heading, intro, content) => `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <h2>${heading}</h2>
          <p>${intro}</p>
        </div>
        ${content}
      </div>
    </section>
  `;

  const coursePage = (title, intro, items) => ({
    title: `${title}｜${SITE.brand}`,
    subtitle: title,
    main:
      pageHero(
        "課程介紹",
        title,
        intro,
        [
          linkButton("courses.html", "回到課程總覽", "back-link"),
          linkButton("contact.html", "預約課程諮詢", "button button--primary")
        ].join("")
      ) +
      section("課程重點", "我們以實作、推理與表達三條主線安排學習節奏。", `<div class="grid grid--3">${cards(items)}</div>`)
  });

  const needPage = (title, intro, courseHref) => ({
    title: `${title}｜${SITE.brand}`,
    subtitle: title,
    main: pageHero(
      "需求導航",
      title,
      intro,
      [
        linkButton(courseHref || "courses.html", "查看建議課程", "button button--primary"),
        linkButton("needs.html", "回到需求導航", "back-link")
      ].join("")
    )
  });

  const needItems = [
    ["need-private-school.html", "私校準備", "針對私中入學評量，整理數學、自然與閱讀邏輯的關鍵能力。"],
    ["need-gifted-junior.html", "國中資優班", "聚焦數理推理、資料整理與題型變化，提升鑑別度。"],
    ["need-science-class.html", "科學班準備", "強化實驗理解、自然推論與跨科整合表達。"],
    ["need-math-gifted.html", "數理資優", "建立抽象推理與進階題目拆解能力。"],
    ["need-elementary-competition.html", "國小競賽", "從 P 級競賽入門，穩定培養解題速度與精準度。"],
    ["need-secondary-competition.html", "國中競賽", "銜接 J、S 與 AMC 題型，建立中高階競賽視野。"],
    ["need-amc.html", "AMC / AIME", "鎖定國際數學競賽的題感、策略與書寫品質。"],
    ["need-second-stage.html", "複試加強", "針對第二階段測驗設計短衝與模擬回饋。"],
    ["need-acceleration.html", "超前學習", "依照孩子程度安排跨年級進度，不盲目超修。"],
    ["need-international.html", "國際學校", "以英數理整合與探究任務，銜接國際課程語境。"],
    ["need-learning-path.html", "學習路徑規劃", "先釐清目標與目前落點，再安排可執行的成長節奏。"]
  ];

  const pages = {
    "index.html": {
      title: `${SITE.brand}｜國小到國中的資優數理學習`,
      subtitle: SITE.subtitle,
      main:
        `
        <section class="hero">
          <div class="container hero__grid">
            <div>
              <span class="eyebrow">資優數理品牌</span>
              <h1>讓孩子的數理能力，長成真正可累積的優勢。</h1>
              <p>從私校、資優班、科學班到 AMC / AIME，獵豹資優用明確的學習系統，幫孩子建立解題力、思考力與長期自信。</p>
              <div class="page-nav">
                ${linkButton("needs.html", "依需求找方案", "button button--primary")}
                ${linkButton("one-page.html", "快速認識品牌", "button button--secondary")}
              </div>
            </div>
            <div class="hero-card visual-card">
              <div>
                <h3>分級診斷 × 小班培育 × 追蹤回饋</h3>
                <p class="meta">以目標導向課程串接每一個學習階段，避免孩子只會刷題卻沒有真正進步。</p>
              </div>
            </div>
          </div>
        </section>
        ` +
        section(
          "依目標快速導航",
          "先找到孩子現在最需要解決的問題，再往下安排課程與節奏。",
          `<div class="quick-grid">${featureBoxes(needItems.map(([href, title, text]) => ({ href, title, text })))}</div>`
        ) +
        section(
          "我們最常協助的三類家庭",
          "不同目標需要不同安排，重點不是學得越多越好，而是學得對。",
          `<div class="carousel">${cards([
            { title: "升學導向家庭", text: "想準備私校、資優班或科學班，需要明確的考程與補強計畫。" },
            { title: "競賽培育家庭", text: "希望從校內資優延伸到數學競賽，建立更高層次的解題能力。" },
            { title: "超前學習家庭", text: "孩子學得快，但需要有架構的進階路徑，而不是無止盡往前趕。" }
          ])}</div>`
        ) +
        section(
          "教學系統的三個核心",
          "內容設計重視理解深度，也重視孩子每週的實際執行狀態。",
          `<div class="grid grid--3">${cards([
            { title: "診斷先行", text: "先看孩子的基礎、速度與思考盲點，再安排班級與作業量。" },
            { title: "分層教學", text: "同年級不等於同程度，教材與練習會依能力分層推進。" },
            { title: "回饋可追蹤", text: "每個階段都看得到進步與待補強項目，家長不會只收到模糊結論。" }
          ])}</div>`
        ) +
        section(
          "延伸閱讀與諮詢入口",
          "如果你還在釐清方向，可以先從品牌、課程與家長經驗開始看。",
          `<div class="grid grid--3">${cards([
            { title: "課程總覽", text: "查看 P、J、S、AMC / AIME、GGB 與科學營等課程安排。", link: { href: "courses.html", label: "前往課程介紹" } },
            { title: "專欄與觀點", text: "整理家長常見問題、資優培育迷思與學習規劃方法。", link: { href: "columns.html", label: "閱讀專欄文章" } },
            { title: "家長見證", text: "看看不同家庭如何從焦慮與迷惘，走向更清楚的學習路徑。", link: { href: "star-mom.html", label: "查看家長分享" } }
          ])}</div>`
        )
    },
    "one-page.html": {
      title: `品牌總覽｜${SITE.brand}`,
      subtitle: "品牌總覽",
      main:
        heroGrid(
          "品牌總覽",
          "一頁看懂獵豹資優的教學方式與服務對象。",
          "我們陪伴的不是單一考試，而是一條從能力診斷、目標設定到長期成長的數理學習路徑。",
          { href: "about.html", label: "認識品牌理念" },
          { href: "features.html", label: "查看核心特色" },
          "適合這些家庭",
          "私校、資優班、競賽、超前學習、國際體系銜接"
        ) +
        section(
          "我們如何陪孩子成長",
          "課程安排不追求表面進度，而是建立真正可遷移的能力。",
          `<div class="grid grid--2">${cards([
            { title: "先診斷再分班", text: "從孩子目前程度出發，避免太淺無聊或太難挫折。" },
            { title: "把難題拆成能力模組", text: "將題型訓練、觀念理解與表達整理拆開練，效果更穩。" },
            { title: "定期回看成長軌跡", text: "不是只看分數，而是分析錯因與學習習慣是否改善。" },
            { title: "家長也能清楚掌握", text: "用易懂的方式說明目前位置、接下來目標與建議節奏。" }
          ])}</div>`
        )
    },
    "about.html": {
      title: `關於我們｜${SITE.brand}`,
      subtitle: "關於我們",
      main:
        pageHero(
          "品牌理念",
          "關於獵豹資優",
          "我們相信資優教育不是提早做難題，而是更早建立有效思考的方法，讓孩子在長線學習中持續保有競爭力與熱情。",
          [
            linkButton("one-page.html", "回到品牌總覽", "button button--primary"),
            linkButton("index.html", "返回首頁", "back-link")
          ].join("")
        ) +
        section(
          "我們重視的三件事",
          "比起華麗包裝，我們更在意教學是否真的有效。",
          `<div class="grid grid--3">${cards([
            { title: "理解優先", text: "每個進階概念都要有可驗證的理解，而不是只靠熟練背法。" },
            { title: "節奏合適", text: "超前不是越快越好，而是剛好快到孩子能穩穩接住。" },
            { title: "長線視角", text: "今天的課程安排要能幫孩子銜接明年的挑戰。" }
          ])}</div>`
        )
    },
    "features.html": {
      title: `核心特色｜${SITE.brand}`,
      subtitle: "核心特色",
      main:
        pageHero(
          "教學特色",
          "讓學習成果被看見，也能被複製。",
          "我們把數理培育拆成可管理的系統，讓孩子知道自己為什麼進步，家長也知道下一步該怎麼走。",
          [
            linkButton("courses.html", "看課程安排", "button button--primary"),
            linkButton("contact.html", "預約諮詢", "back-link")
          ].join("")
        ) +
        section(
          "系統化的關鍵做法",
          "從課前到課後，每個環節都有明確目的。",
          `<div class="grid grid--3">${cards([
            { title: "程度分層", text: "依能力而不是只依年級安排教材，提升學習效率。" },
            { title: "題型拆解", text: "針對應用題、幾何、數論、推理題做策略性訓練。" },
            { title: "週期追蹤", text: "用階段檢核看懂問題，不把短期失常當成長期結論。" },
            { title: "升學與競賽並重", text: "兼顧考試結果與能力深度，避免只會對付單一題庫。" },
            { title: "家長溝通清楚", text: "把學習狀況翻譯成可理解、可決策的資訊。" },
            { title: "學習心態養成", text: "幫孩子建立面對挑戰的穩定性，而不是只靠外力推動。" }
          ])}</div>`
        )
    },
    "courses.html": {
      title: `課程介紹｜${SITE.brand}`,
      subtitle: "課程介紹",
      main:
        pageHero(
          "課程總覽",
          "依程度與目標，找到合適的數理培育方案。",
          "從競賽基礎到高階挑戰，課程設計會依孩子的階段、目標與學習節奏做出不同安排。",
          [linkButton("contact.html", "預約選課諮詢", "button button--primary"), linkButton("index.html", "返回首頁", "back-link")].join("")
        ) +
        section(
          "主要課程",
          "先看課程定位，再看哪一門最符合孩子現在的需求。",
          `<div class="quick-grid">${featureBoxes([
            { href: "course-p.html", title: "P 課程", text: "國小競賽與資優啟蒙，建立題感與思考表達。" },
            { href: "course-j.html", title: "J 課程", text: "銜接國中資優與校內拔尖，深化代數與幾何推理。" },
            { href: "course-s.html", title: "S 課程", text: "進階挑戰班，適合具備穩定基礎的學生往上突破。" },
            { href: "course-amc-aime.html", title: "AMC / AIME", text: "面向國際數學競賽的策略訓練與高階題型演練。" },
            { href: "course-ggb.html", title: "GGB 幾何探究", text: "透過動態幾何培養觀察、猜想與證明能力。" },
            { href: "course-science-camp.html", title: "科學營隊", text: "短期主題式探究，結合實作、提問與跨域思考。" }
          ])}</div>`
        )
    },
    "course-p.html": coursePage("P 課程", "適合國小中高年級的孩子，從基礎推理、數感與競賽入門開始，建立穩定的數學表達能力。", [
      { title: "數感與運算策略", text: "把算得快，升級成知道為什麼可以這樣算。" },
      { title: "應用題拆解", text: "從讀題、列式到驗算，降低粗心與卡關機率。" },
      { title: "競賽啟蒙", text: "逐步接觸 PI、PK 題型，培養不同於校內題的解題視角。" }
    ]),
    "course-j.html": coursePage("J 課程", "以國中資優與競賽需求為核心，強化代數、幾何與邏輯推理的整合能力。", [
      { title: "代數推理", text: "建立方程、函數與數列題型的分析框架。" },
      { title: "幾何整合", text: "從作圖、角度到比例，提升圖形題處理速度。" },
      { title: "資優題型訓練", text: "針對國中資優鑑定與拔尖班常見題型做分層演練。" }
    ]),
    "course-s.html": coursePage("S 課程", "給已具備不錯基礎、想持續往高階挑戰前進的學生，內容重視抽象理解與策略整合。", [
      { title: "進階數論與組合", text: "從規律發現到證明，提升抽象問題處理力。" },
      { title: "高階題組演練", text: "練習在資訊量多、條件複雜時維持思路清晰。" },
      { title: "書寫與表達", text: "不只做對，也要能把思考歷程完整表達出來。" }
    ]),
    "course-amc-aime.html": coursePage("AMC / AIME 課程", "聚焦國際數學競賽常見題型與解題策略，協助學生從 AMC 穩定邁向 AIME。", [
      { title: "題型地圖", text: "掌握代數、幾何、數論、組合在 AMC / AIME 的常見出題方式。" },
      { title: "限時策略", text: "訓練取捨、時間分配與錯題回看，提升整體得分率。" },
      { title: "高階突破", text: "從單題技巧走向系統理解，幫助學生應對更複雜的題目。" }
    ]),
    "course-ggb.html": coursePage("GGB 幾何探究", "使用 GeoGebra 動態幾何工具，把幾何從靜態記憶，變成可觀察、可驗證、可推論的學習過程。", [
      { title: "動態觀察", text: "透過拖曳與測量快速發現圖形中的規律。" },
      { title: "猜想與驗證", text: "從直覺發現走向有依據的推論與說明。" },
      { title: "證明前準備", text: "幫孩子建立幾何證明前必要的結構感與語言能力。" }
    ]),
    "course-science-camp.html": coursePage("科學營隊", "以短期主題式課程串連科學探究、觀察紀錄與團隊討論，讓孩子在做中學。", [
      { title: "主題實作", text: "圍繞單一主題安排任務，讓孩子從操作中理解原理。" },
      { title: "跨域連結", text: "結合數學、自然與邏輯思考，不把知識切得太碎。" },
      { title: "成果表達", text: "把觀察結果整理成可說明、可分享的成果。" }
    ]),
    "needs.html": {
      title: `需求導航｜${SITE.brand}`,
      subtitle: "需求導航",
      main:
        pageHero(
          "依需求找方向",
          "先確認目標，再安排課程與進度。",
          "如果你現在最在意的是升學、競賽或超前學習，可以從下面的主題直接進入對應頁面。",
          linkButton("index.html", "返回首頁", "back-link")
        ) +
        section("需求分類", "每個入口都對應一種常見家庭情境。", `<div class="quick-grid">${featureBoxes(needItems.map(([href, title, text]) => ({ href, title, text })))}</div>`)
    },
    "need-private-school.html": needPage("私校準備", "如果目標是私中或私校入學，我們會先補齊基礎理解，再提升題目速度與穩定度，避免只背題型卻換題就失分。", "courses.html"),
    "need-gifted-junior.html": needPage("國中資優班", "國中資優鑑定需要的不只是超前進度，更是邏輯組織、跨題型遷移與穩定作答能力。", "course-j.html"),
    "need-science-class.html": needPage("科學班準備", "科學班重視科學理解、觀察推論與整合表達，我們會同步補強數理思維與探究能力。", "course-science-camp.html"),
    "need-math-gifted.html": needPage("數理資優", "針對數理資優題型，我們會從推理結構、觀念連結與高難度題目拆解三個方向同步加強。", "course-j.html"),
    "need-elementary-competition.html": needPage("國小競賽", "若孩子已具備不錯基礎，國小競賽是訓練思考深度與題目彈性的很好起點。", "course-p.html"),
    "need-secondary-competition.html": needPage("國中競賽", "國中競賽的難度與抽象程度明顯提升，需要更完整的題型架構與解題節奏訓練。", "course-s.html"),
    "need-amc.html": needPage("AMC / AIME 規劃", "想準備 AMC 或進一步挑戰 AIME，關鍵在於長期累積，而不是考前短衝。", "course-amc-aime.html"),
    "need-second-stage.html": needPage("複試加強", "當孩子已通過初試，第二階段更需要模擬實戰、錯題分析與短期節奏管理。", "courses.html"),
    "need-acceleration.html": needPage("超前學習", "超前學習的重點是深度與穩定，不是把高年級內容硬塞進來。我們會依孩子承接力安排進度。", "courses.html"),
    "need-international.html": needPage("國際學校銜接", "若孩子走國際體系，數理能力需要能對應英文題意、探究任務與跨領域表達。", "course-ggb.html"),
    "need-learning-path.html": needPage("學習路徑規劃", "當你不確定該先補基礎、衝競賽還是備考時，最有效的做法是先把目標、時間與目前程度說清楚。", "contact.html"),
    "columns.html": {
      title: `專欄文章｜${SITE.brand}`,
      subtitle: "專欄文章",
      main:
        pageHero(
          "觀點整理",
          "給家長看的數理培育專欄。",
          "整理資優教育、競賽準備與學習規劃的常見問題，幫助家長用更清楚的方式做判斷。",
          [linkButton("news.html", "看最新消息", "button button--primary"), linkButton("index.html", "返回首頁", "back-link")].join("")
        ) +
        section(
          "近期主題",
          "以下是家長最常關心的三個方向。",
          `<div class="grid grid--3">${cards([
            { title: "什麼時候適合開始競賽？", text: "不是越早越好，重點是基礎是否穩、孩子是否具備足夠的耐挫力。" },
            { title: "超前學習會不會揠苗助長？", text: "只要節奏設計得當，超前可以是深化理解，而不是表面趕進度。" },
            { title: "私校與資優班準備有什麼不同？", text: "兩者雖有交集，但題目重點、時間安排與策略其實差異很大。" }
          ])}</div>`
        )
    },
    "news.html": {
      title: `最新消息｜${SITE.brand}`,
      subtitle: "最新消息",
      main:
        pageHero(
          "活動與公告",
          "掌握課程開班、營隊資訊與近期講座。",
          "你可以先看最新開課方向，再決定是否安排試聽、諮詢或能力診斷。",
          [linkButton("contact.html", "預約諮詢", "button button--primary"), linkButton("index.html", "返回首頁", "back-link")].join("")
        ) +
        section(
          "近期公告",
          "網站目前先以示意內容呈現，後續可以再補上真實活動資訊。",
          `<div class="grid grid--3">${cards([
            { title: "新班開放登記", text: "春季班與暑期營隊可先留下需求，安排顧問回覆適合的班型。" },
            { title: "家長講座規劃中", text: "將陸續推出私校、資優班與競賽規劃主題的公開講座。" },
            { title: "能力診斷服務", text: "針對孩子目前程度與目標，提供初步學習路徑建議。" }
          ])}</div>`
        )
    },
    "students.html": {
      title: `學生成果｜${SITE.brand}`,
      subtitle: "學生成果",
      main:
        pageHero(
          "學生表現",
          "看見孩子如何從基礎進步到能獨立解題。",
          "我們更在意的是成長軌跡與能力遷移，成果不只是一張成績單，而是孩子能否面對更高難度挑戰。",
          [linkButton("courses.html", "查看課程安排", "button button--primary"), linkButton("index.html", "返回首頁", "back-link")].join("")
        ) +
        section(
          "常見成長樣貌",
          "不同起點的孩子，進步方式也不同。",
          `<div class="grid grid--3">${cards([
            { title: "從怕數學到願意挑戰", text: "先建立小成功經驗，再逐步提升題目難度與學習信心。" },
            { title: "從會算到會想", text: "把原本只會套公式的習慣，轉成有邏輯的分析與表達。" },
            { title: "從單點表現到長期穩定", text: "不只考一次好，而是在不同考試與題型裡都能維持品質。" }
          ])}</div>`
        )
    },
    "star-mom.html": {
      title: `家長見證｜${SITE.brand}`,
      subtitle: "家長見證",
      main:
        pageHero(
          "家長回饋",
          "很多家長真正需要的，是清楚知道孩子現在在哪裡。",
          "當焦慮被具體的診斷與計畫取代，家庭就更能把力氣放在陪伴，而不是每天追著成績跑。",
          [linkButton("contact.html", "預約諮詢", "button button--primary"), linkButton("index.html", "返回首頁", "back-link")].join("")
        ) +
        section(
          "常見回饋",
          "以下是網站示意版的家長聲音，之後可再換成實際案例。",
          `<div class="grid grid--3">${cards([
            { title: "看得到孩子哪裡卡住", text: "以前只知道他考不好，現在知道是讀題、推理還是速度出了問題。" },
            { title: "不再盲目補習", text: "顧問把目標拆清楚後，我們終於知道該補什麼、不該補什麼。" },
            { title: "孩子更願意學", text: "當他知道自己不是不會，而是方法沒抓到，抗拒感就明顯下降。" }
          ])}</div>`
        )
    },
    "contact.html": {
      title: `聯絡我們｜${SITE.brand}`,
      subtitle: "聯絡我們",
      main:
        pageHero(
          "諮詢入口",
          "先談孩子目前狀況，再決定課程與節奏。",
          "若你願意提供孩子年級、目前程度、目標與時間表，我們就能更快幫你判斷適合的方向。",
          linkButton("index.html", "返回首頁", "back-link")
        ) +
        section(
          "建議先準備的資訊",
          "讓第一次諮詢更有效率。",
          `<div class="grid grid--3">${cards([
            { title: "目前年級與就讀體系", text: "公校、私校、雙語或國際體系，會影響課程建議。" },
            { title: "近期目標", text: "例如私校考試、資優鑑定、競賽或超前學習安排。" },
            { title: "孩子學習狀況", text: "包含強項、卡關點、可配合的時間與目前補習經驗。" }
          ])}</div>`
        )
    },
    "learning-system.html": {
      title: `學習系統｜${SITE.brand}`,
      subtitle: "學習系統",
      main:
        pageHero(
          "教學系統",
          "把進步變成可以追蹤、可以複製的流程。",
          "學習系統包含診斷、分班、課程、作業與回饋五個環節，目的是讓每一次投入都產生累積效果。",
          [linkButton("features.html", "查看核心特色", "button button--primary"), linkButton("index.html", "返回首頁", "back-link")].join("")
        ) +
        section(
          "五個環節",
          "完整系統比單點補強更容易做出長期成果。",
          `<div class="grid grid--3">${cards([
            { title: "能力診斷", text: "看清楚孩子目前落點與主要盲點。" },
            { title: "分層分班", text: "安排合適難度，避免課程失衡。" },
            { title: "課內學習", text: "建立觀念、題型與表達三重能力。" },
            { title: "課後練習", text: "用適量作業讓新能力真正穩定下來。" },
            { title: "階段回饋", text: "分析進步與待補強處，決定下一步方向。" }
          ])}</div>`
        )
    },
    "search.html": {
      title: `站內導覽｜${SITE.brand}`,
      subtitle: "站內導覽",
      main:
        pageHero(
          "站內導覽",
          "這個頁面可作為之後擴充站內搜尋的入口。",
          "目前先提供快速導覽，若之後要加入關鍵字搜尋、篩選課程或文章索引，可以直接在這頁延伸。",
          [linkButton("courses.html", "看課程", "button button--primary"), linkButton("columns.html", "看文章", "button button--secondary")].join("")
        ) +
        section(
          "快速入口",
          "先用導覽方式找到需要的內容。",
          `<div class="grid grid--3">${cards([
            { title: "需求導航", text: "不知道從哪裡開始時，先依家庭目標找方向。", link: { href: "needs.html", label: "前往需求導航" } },
            { title: "課程介紹", text: "已經知道方向時，直接看每門課程定位與適合對象。", link: { href: "courses.html", label: "前往課程介紹" } },
            { title: "品牌總覽", text: "想快速認識教學理念與品牌定位，可從一頁總覽開始。", link: { href: "one-page.html", label: "前往品牌總覽" } }
          ])}</div>`
        )
    }
  };

  const currentPage = pages[page];

  document.querySelectorAll(".brand__title").forEach((el) => {
    el.textContent = SITE.brand;
  });

  document.querySelectorAll(".brand__subtitle").forEach((el) => {
    el.textContent = currentPage?.subtitle || SITE.subtitle;
  });

  document.querySelectorAll(".footer__inner p").forEach((el) => {
    el.textContent = SITE.footer;
  });

  if (currentPage) {
    document.title = currentPage.title;
    const main = document.querySelector("main.page");
    if (main) main.innerHTML = currentPage.main;
  }

  document.querySelectorAll(".nav").forEach((nav) => {
    nav.innerHTML = navLinks
      .map(([href, label]) => {
        const active = href === page ? "is-active" : "";
        return `<a class="${active}" href="${href}">${label}</a>`;
      })
      .join("");
  });

  const targets = document.querySelectorAll(".hero-card, .card, .feature-box, .section-heading");
  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.16 }
  );

  targets.forEach((el) => observer.observe(el));
})();
