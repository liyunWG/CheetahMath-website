# -*- coding: utf-8 -*-
"""產生「獵豹玩中學」總覽頁 play.html 與各互動單元頁面（外觀、頁首頁尾沿用 learning-system.html）。
用法：python assets/play/build_pages.py
新增單元：在 LESSONS（已上線）或 SOON（即將推出）加一筆；已上線的單元需有 assets/play/lessons/<slug>.js 與 ART 縮圖。"""
import os, re, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
LINE = 'https://lin.ee/RsjA0Yd'


def grid_art():
    return '<g stroke="#e6dcc2" stroke-width="1">' + ''.join('<line x1="%d" y1="0" x2="%d" y2="130"/>' % (x, x) for x in range(20, 320, 20)) + ''.join('<line x1="0" y1="%d" x2="320" y2="%d"/>' % (y, y) for y in range(10, 130, 20)) + '</g>'


ART = {
    'angle-bisector': '<svg viewBox="0 0 320 130" aria-hidden="true">' + grid_art() + '<g stroke-linecap="round" stroke-width="4" fill="none"><line x1="40" y1="110" x2="290" y2="110" stroke="#122548"/><line x1="40" y1="110" x2="190" y2="10" stroke="#122548"/><line x1="40" y1="110" x2="290" y2="50" stroke="#1f9d55"/></g><circle cx="160" cy="80" r="9" fill="#5fe3b4" stroke="#fff" stroke-width="3"/></svg>',
    'transformations': '<svg viewBox="0 0 320 130" aria-hidden="true">' + grid_art() + '<polygon points="30,105 90,105 50,55" fill="rgba(47,111,220,.2)" stroke="#2f6fdc" stroke-width="3"/><polygon points="190,75 250,75 210,25" fill="none" stroke="#555" stroke-width="2.5" stroke-dasharray="7 6"/><polygon points="190,115 250,115 210,65" fill="rgba(31,157,85,.2)" stroke="#1f9d55" stroke-width="3"/><path d="M96 90 C130 60 150 70 184 96" fill="none" stroke="#d29b1f" stroke-width="3" stroke-dasharray="6 5"/><polygon points="270,40 300,110 240,95" fill="rgba(214,51,108,.18)" stroke="#d6336c" stroke-width="3"/></svg>',
    'multiplication': '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke-width="3"><rect x="90" y="12" width="84" height="84" fill="rgba(47,111,220,.2)" stroke="#2f6fdc"/><rect x="174" y="12" width="56" height="84" fill="rgba(210,155,31,.28)" stroke="#d29b1f"/><rect x="90" y="96" width="84" height="28" fill="rgba(210,155,31,.28)" stroke="#d29b1f"/><rect x="174" y="96" width="56" height="28" fill="rgba(214,51,108,.2)" stroke="#d6336c"/></g><g font-family="sans-serif" font-weight="800" font-size="15" fill="#122548" text-anchor="middle"><text x="132" y="60">a²</text><text x="202" y="60">ab</text><text x="132" y="115">ab</text><text x="202" y="115">b²</text></g></svg>',
    'trig-circle': '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="70" cy="65" r="50" fill="none" stroke="#2a3f6e" stroke-width="3"/><line x1="10" y1="65" x2="130" y2="65" stroke="#b9ad92" stroke-width="1.5"/><line x1="70" y1="65" x2="105" y2="30" stroke="#122548" stroke-width="3"/><line x1="105" y1="65" x2="105" y2="30" stroke="#d6336c" stroke-width="4"/><circle cx="105" cy="30" r="8" fill="#5fe3b4" stroke="#fff" stroke-width="3"/><line x1="105" y1="30" x2="170" y2="30" stroke="#d6336c" stroke-width="2" stroke-dasharray="5 5"/><path d="M165 65 C185 5 205 5 225 65 S265 125 285 65" fill="none" stroke="#d6336c" stroke-width="4" stroke-linecap="round"/></svg>',
    'trig-identities': '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="160" cy="65" r="52" fill="none" stroke="#2a3f6e" stroke-width="3"/><line x1="40" y1="65" x2="280" y2="65" stroke="#b9ad92" stroke-width="1.5"/><line x1="160" y1="8" x2="160" y2="122" stroke="#b9ad92" stroke-width="1.5"/><line x1="160" y1="65" x2="196" y2="28" stroke="#122548" stroke-width="3"/><line x1="160" y1="65" x2="124" y2="28" stroke="#d6336c" stroke-width="3"/><line x1="160" y1="65" x2="124" y2="102" stroke="#2f6fdc" stroke-width="3"/><line x1="196" y1="28" x2="124" y2="28" stroke="#d29b1f" stroke-width="2" stroke-dasharray="5 5"/><circle cx="196" cy="28" r="8" fill="#5fe3b4" stroke="#fff" stroke-width="3"/><circle cx="124" cy="28" r="6" fill="#d6336c"/><circle cx="124" cy="102" r="6" fill="#2f6fdc"/></svg>',
}

# 已上線：slug, 標題, 年段, 領域, 時間, 一句話, 你會看到, 班上才會教（資優延伸）, 班級
LESSONS = [
    ('angle-bisector', '角平分線', '國中', '幾何', '約 6 分鐘', '在格線上拖出角平分線，親眼看見「到兩邊一樣遠」，再用它找出三條路的消防站位置。',
     '格點吸附、摺紙驗證、內心與內切圓', '角平分線定理、內心與面積、尺規、塞瓦定理', 'J82S／J81S／J91A／PK4B'),
    ('transformations', '幾何變換：平移、鏡射、旋轉', '國中', '幾何', '約 7 分鐘', '把圖形搬進虛線框、對鏡子看像、繞中心轉動；全部落在格點上，座標一目了然。',
     '平移向量、鏡射垂直平分、旋轉距離不變', '旋轉移形、將軍飲馬、兩次鏡射＝旋轉、旋轉矩陣', 'J71S／J82A／PK4B／S112'),
    ('multiplication', '乘法公式的圖解', '國中', '代數', '約 7 分鐘', '(a+b)²、(a−b)²、平方差、(x+p)(x+q) 全部用面積切塊看懂，不再死背口訣。',
     '邊長一改方塊就彈一下、剪下搬動平方差', '配方法、立方公式、算幾不等式、Sophie Germain 恆等式', 'J81A／J81S／高中 S 系列'),
    ('trig-circle', '三角函數：單位圓', '國中', '三角函數', '約 7 分鐘', '拖動圓上的點，看 sin、cos、tan 怎麼長出來，再把高度畫成波形。',
     '圓上格點 3-4-5、sin²＋cos²＝1、tan 爆衝、波形連動', '弧度、和角公式、疊合、複數與單位根', 'J91A／S102／S111'),
    ('trig-identities', '三角公式看得見', '高中', '三角函數', '約 8 分鐘', '誘導公式是鏡射、和角公式是旋轉、倍角是旋轉兩次：公式不必背，看得見。',
     '四種鏡射、旋轉合成座標、倍角', '積化和差、疊合、棣美弗定理、托勒密定理', 'S102／S111'),
]
SOON = [
    ('多邊形的外角和為什麼是 360°', '國中', '幾何', '滑桿把外角「聚」到一點，不管幾邊形都繞一圈。'),
    ('配方法＝補成正方形', '國中', '代數', '把 x²＋6x 補成完整正方形，二次函數頂點一眼看出。'),
    ('三角比：相似的比值不變', '國中', '三角函數', '拖大拖小直角三角形，sin、cos 的比值卻不動。'),
    ('弧度：把半徑捲到圓周上', '高中', '三角函數', '1 弧度到底多大？為什麼 π 才是圓的好朋友。'),
    ('餘弦定理與畢氏定理', '高中', '三角函數', '固定兩邊、改變夾角，第三邊跟著變；90° 時回到畢氏。'),
    ('圓面積：切成扇形再拼起來', '小學', '幾何', '切越細越像長方形，πr² 自己長出來。'),
    ('乘法是陣列與面積', '小學', '代數', '行列互換、平方數與乘法公式的最早種子。'),
]
TOOLS = [
    ('類比', '把新問題換成學過的', 0), ('富比尼原理', '換個順序數同一件事', 0), ('奇偶性', '一奇一偶就矛盾', 0), ('抽屜原理', '分組後必有重複', 0),
    ('排容原理', '多算的扣掉、扣多的補回', 0), ('相反的視角', '倒過來想', 0), ('歸納', '從小例子找規律', 0), ('一般化', '把數字換成字母', 0),
    ('特殊化', '先試極端與特例', 0), ('變化', '動一動，看哪裡不動', 0), ('不變性', '旋轉、平移之下不變的量', 1), ('單向變化', '只增不減的指標', 0),
    ('無窮遞減', '越拆越小到停不了', 0), ('對稱', '鏡射、旋轉、平衡', 1), ('極值', '找最大最小', 0), ('遞迴', '用前一步算下一步', 0),
    ('步步逼近', '一步一步靠近答案', 0), ('著色', '用顏色幫思考分類', 0), ('隨機化', '用機率看穿確定的題', 0), ('轉換觀點', '代數↔面積、算式↔圖形', 1),
    ('模組化', '只看餘數', 0), ('蠻力', '先窮舉再找捷徑', 0)]
WALL = ['連分數', '伯努利試驗', '插板法', '阿貝爾求和', '高斯符號', '塞瓦定理', '梅涅勞斯定理', '完全四點形', '幾何小花', '共邊定理', '共角定理', '蝴蝶模型', '等積變形', '補形法', '旋轉移形',
        '觀察不變量', '無限還原法', 'Fubini 雙重計數', '遞迴與數列', '微積分入門', '尺規作圖', '圓冪與四點共圓']
VS = [
    ('角平分線', '到兩邊等距、三角形的內心。', '角平分線定理（對邊比例）、內心與面積公式、尺規作圖、塞瓦定理。<br><small>J82S／J91A／PK4B</small>'),
    ('幾何變換', '平移、旋轉、對稱的定義與座標。', '旋轉移形解難題、將軍飲馬、兩次鏡射＝旋轉、旋轉矩陣。<br><small>J82A／PK4B／S112</small>'),
    ('乘法公式', '(a±b)²、平方差的展開與因式分解。', '配方法、立方公式、算幾不等式、Sophie Germain 恆等式。<br><small>J81A／J81S／高中 S 系列</small>'),
    ('三角函數', '直角三角形的 sin、cos、tan 與特殊角。', '廣義角、和角與疊合、正餘弦定理、托勒密定理與複數旋轉。<br><small>J91A／S102／S111</small>'),
]
TIERS = [
    ('lv--1', 'L1', '課綱基礎：看懂為什麼', '學校課本都有的觀念，改成可以動手的畫面。<b>這個網站玩的就是這一層。</b>', '例：角平分線上的點到兩邊等距'),
    ('lv--2', 'L2', '資優延伸：用得巧', '同一個觀念換個外觀、再多走兩步。獵豹資優班與數資班的日常。', '例：角平分線定理、旋轉移形、配方法'),
    ('lv--3', 'L3', '競賽挑戰：想得深', '超出課綱，AMC、數學競賽與大學預修的世界。', '例：塞瓦與梅涅勞斯、連分數、複數旋轉'),
]
LESSON_DESC = {
    'angle-bisector': '在格線上拖出角平分線，親眼看見「到兩邊一樣遠」——國中幾何互動單元。',
    'transformations': '在格線上平移、鏡射、旋轉圖形，用座標看懂全等變換——國中幾何互動單元。',
    'multiplication': '用面積切塊看懂 (a+b)²、(a−b)²、平方差，不再死背——國中代數互動單元。',
    'trig-circle': '拖動單位圓上的點，看 sin、cos、tan 怎麼長出來——三角函數互動單元。',
    'trig-identities': '用鏡射、旋轉看懂誘導公式與和角公式——高中三角函數互動單元。',
}

tpl = open(os.path.join(ROOT, 'learning-system.html'), encoding='utf-8').read()
head0, rest = tpl.split('<main class="page">', 1)
tail = rest.split('</main>', 1)[1]
tail = re.sub(r'(<a class=")is-active(" href=")', r'\1\2', tail)
head0 = re.sub(r'(<a class=")is-active(" href=")', r'\1\2', head0)
e = html.escape


def head_for(file, title, desc, body_class, extra_js):
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, head0, flags=re.S)
    for pat in (r'(<meta name="description" content=")[^"]*', r'(<meta property="og:description" content=")[^"]*', r'(<meta name="twitter:description" content=")[^"]*'):
        h = re.sub(pat, lambda m: m.group(1) + desc, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + title, h)
    h = re.sub(r'(<meta name="twitter:title" content=")[^"]*', lambda m: m.group(1) + title, h)
    h = h.replace('learning-system.html', file)
    h = h.replace('  <script src="assets/data/elite-data.js" defer=""></script>\n', '').replace('  <script src="assets/js/elite-pages.js" defer=""></script>\n', '')
    h = h.replace('<link rel="stylesheet" href="assets/css/styles.css">', '<link rel="stylesheet" href="assets/css/styles.css">\n  <link rel="stylesheet" href="assets/play/play.css">')
    h = h.replace('<script src="assets/js/site.js" defer=""></script>', '<script src="assets/js/site.js" defer=""></script>' + extra_js)
    h = h.replace('<body>', '<body%s data-page-title="%s">' % (' class="%s"' % body_class if body_class else '', title))
    h = h.replace('學習系統</span>', '獵豹玩中學</span>')
    return h


def write(name, text):
    open(os.path.join(ROOT, name), 'w', encoding='utf-8', newline='\n').write(text)
    print('wrote', name)


# ---------------------------------------------------------------- 載入單元資料（內建 5 個＋ meta_*.py 追加的單元／遊戲）
import glob, importlib.util

GAME_SOON = [
    ('河內塔', '全年段', '遊戲', '把圓盤一個一個搬到另一根柱子，最少要幾步？遞迴的最佳入門。'),
    ('塞車時間', '全年段', '遊戲', '移動車子讓紅車開出去，培養空間與規劃能力。'),
    ('數獨與邏輯推理', '全年段', '遊戲', '用排除法一格一格推理，沒有猜測。'),
]
ENTRIES = []
for t in LESSONS:
    slug, title, grade, area, mins, blurb, see, deep, classes = t
    ENTRIES.append(dict(slug=slug, title=title, kind='lesson', grade=grade, area=area, mins=mins, blurb=blurb, see=see, deep=deep, classes=classes, desc=LESSON_DESC[slug], art=ART[slug], libs=[], css=[]))
for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'meta_*.py'))):
    spec = importlib.util.spec_from_file_location('meta_mod', f)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    for en in m.ENTRIES:
        en.setdefault('libs', []); en.setdefault('css', []); en.setdefault('kind', 'lesson')
        ENTRIES.append(en)
    SOON.extend(getattr(m, 'SOON', []))
    GAME_SOON.extend(getattr(m, 'GAME_SOON', []))
SOON = [s for s in SOON if s[0] not in {en['title'] for en in ENTRIES}]
AREAS = ['幾何', '立體幾何', '代數', '三角函數', '排列組合']


def css_links(paths):
    return ''.join('\n  <link rel="stylesheet" href="%s">' % p for p in paths)


# ---------------------------------------------------------------- 互動單元／遊戲頁
for en in ENTRIES:
    js_dir = 'games' if en['kind'] == 'game' else 'lessons'
    scripts = ['assets/play/play-core.js'] + en['libs'] + ['assets/play/%s/%s.js' % (js_dir, en['slug']), 'assets/play/play-chrome.js']
    extra_js = ''.join('\n  <script src="%s" defer=""></script>' % p for p in scripts)
    h = head_for('play-%s.html' % en['slug'], '%s｜獵豹玩中學｜獵豹科教' % en['title'], en['desc'], 'page-play-lesson' + (' page-play-game' if en['kind'] == 'game' else ''), extra_js)
    if en['css']:
        h = h.replace('<link rel="stylesheet" href="assets/play/play.css">', '<link rel="stylesheet" href="assets/play/play.css">' + css_links(en['css']), 1)
    body = '<main class="page"><div class="play-wrap"><div id="play-root"><noscript><p class="pl-noscript">這個互動單元需要開啟瀏覽器的 JavaScript 才能操作。</p></noscript></div></div></main>'
    write('play-%s.html' % en['slug'], h + body + tail)


# ---------------------------------------------------------------- 總覽頁
def card_live(en):
    return ('<article class="card play-card reveal" data-grade="%s" data-area="%s" data-slug="%s"><div class="play-card__art">%s</div><div class="play-card__body">'
            '<div class="meta"><span class="tag">%s</span><span class="tag">%s</span><span class="tag">%s</span><span class="done-mark" hidden>✓ 玩過了</span></div>'
            '<h3>%s</h3><p>%s</p><p class="see">你會看到：%s</p><div class="depth"><b>班上才會教：</b>%s<br><small>%s</small></div>'
            '<a class="button button--primary go" href="play-%s.html">開始玩</a></div></article>') % (
        en['grade'], en['area'], en['slug'], en['art'], en['grade'], en['area'], en['mins'], e(en['title']), e(en['blurb']), e(en['see']), e(en['deep']), e(en['classes']), en['slug'])


def card_game(en):
    return ('<article class="card play-card play-card--game reveal" data-grade="all" data-area="遊戲" data-slug="%s"><div class="play-card__art">%s</div><div class="play-card__body">'
            '<div class="meta"><span class="tag">全年段</span><span class="tag">暖身・中等・困難</span><span class="done-mark" hidden>✓ 玩過了</span></div>'
            '<h3>%s</h3><p>%s</p><p class="see">%s</p><div class="depth"><b>練的是：</b>%s</div>'
            '<a class="button button--primary go" href="play-%s.html">開始遊戲</a></div></article>') % (
        en['slug'], en['art'], e(en['title']), e(en['blurb']), e(en['see']), e(en['deep']), en['slug'])


def card_soon(title, grade, area, blurb):
    return ('<article class="card play-card is-soon reveal" data-grade="%s" data-area="%s"><div class="play-card__body"><div class="meta"><span class="tag">%s</span><span class="tag">%s</span><span class="soon">即將推出</span></div>'
            '<h3>%s</h3><p>%s</p><a class="card-link" href="%s" target="_blank" rel="noreferrer">想要這個？跟老師說</a></div></article>') % (
        'all' if grade == '全年段' else grade, area, grade, area, e(title), e(blurb), LINE)


lessons_only = [en for en in ENTRIES if en['kind'] == 'lesson']
games_only = [en for en in ENTRIES if en['kind'] == 'game']
cards = ''.join(card_live(en) for en in lessons_only) + ''.join(card_soon(*s) for s in SOON)
game_cards = ''.join(card_game(en) for en in games_only) + ''.join(card_soon(*s) for s in GAME_SOON)
tiers = ''.join('<article class="card reveal"><h3><span class="lv %s">%s</span>%s</h3><p>%s</p><p class="tier-eg">%s</p></article>' % (c, l, e(t), d, e(eg)) for c, l, t, d, eg in TIERS)
tools = ''.join('<div class="tool-chip%s"><b>%s</b><span>%s</span></div>' % (' is-ready' if r else '', e(n), e(d)) for n, d, r in TOOLS)
wall = ''.join('<span class="tag">%s</span>' % e(w) for w in WALL)
vs = ''.join('<div class="vs-row"><h3>%s</h3><div class="school"><b>學校課本：</b>%s</div><div class="cheetah"><b>獵豹班上：</b>%s</div></div>' % (e(a), e(b), c) for a, b, c in VS)
area_btns = '<button type="button" class="chipbtn is-on" data-v="">全部領域</button>' + ''.join('<button type="button" class="chipbtn" data-v="%s">%s</button>' % (a, a) for a in AREAS)
n_units = len(lessons_only)

main = '''<main class="page">
<section class="page-hero play-hero"><div class="container">
<span class="eyebrow">獵豹玩中學</span>
<h1>先玩懂觀念，再看見資優數學有多深。</h1>
<p class="lead">把幾何性質、立體幾何、乘法公式、三角函數與排列組合最容易「死背卻不懂」的觀念，做成可以動手的小實驗；還有玩不完的數學遊戲。手機一屏一步、免登入、拖一拖就懂。玩完之後，你會知道孩子在班上還能走多遠。</p>
<div class="page-nav"><a class="button button--primary" href="play-angle-bisector.html">從第一個開始玩</a><a class="button button--secondary" href="#games">直接玩遊戲</a><a class="button button--secondary" href="%(line)s" target="_blank" rel="noreferrer">問老師哪一班適合</a></div>
<p class="play-note">已上線 %(n)d 個互動單元＋ %(g)d 款遊戲・不用登入・手機也能玩・進度只存在這台裝置</p>
</div></section>

<section class="section"><div class="container">
<div class="section-heading reveal"><h2>三層深度：你玩的是第一層</h2><p>互動只能放基本觀念，所以每個單元結尾都會標出「獵豹班上才會教」的進階內容，讓你一眼看到深度。</p></div>
<div class="play-tier">%(tiers)s</div>
</div></section>

<section class="section" id="units"><div class="container">
<div class="section-heading reveal"><h2>互動單元</h2><p>已上線的單元可以直接玩；其他單元陸續推出，想先玩哪一個可以告訴老師。</p></div>
<div class="play-filters" id="play-filters">
<div class="play-filter-row" data-group="grade" role="group" aria-label="年段"><button type="button" class="chipbtn is-on" data-v="">全部年段</button><button type="button" class="chipbtn" data-v="小學">小學</button><button type="button" class="chipbtn" data-v="國中">國中</button><button type="button" class="chipbtn" data-v="高中">高中</button></div>
<div class="play-filter-row" data-group="area" role="group" aria-label="領域">%(areas)s</div>
</div>
<div class="play-grid" id="play-grid">%(cards)s</div>
<p class="play-empty" id="play-empty" hidden>這個組合還沒有單元，請換一個條件，或直接跟老師說你想玩什麼。</p>
</div></section>

<section class="section" id="games"><div class="container">
<div class="section-heading reveal"><h2>數學遊戲區</h2><p>每款遊戲都能選難度（暖身・中等・困難），依難度有不同的計時；題目每次隨機出，永遠玩不完。最佳成績存在這台裝置。</p></div>
<div class="play-grid play-grid--games">%(gcards)s</div>
</div></section>

<section class="section"><div class="container">
<div class="section-heading reveal"><h2>同一個主題，學校教到哪、獵豹教到哪</h2><p>互動單元只是入口。這是同樣的主題在獵豹班上延伸出去的樣子。</p></div>
<div class="vs-table reveal">%(vs)s</div>
</div></section>

<section class="section"><div class="container">
<div class="section-heading reveal"><h2>資優生的 22 個思考工具</h2><p>參考《數學家的 22 個思考工具》整理。亮起來的是目前互動單元已經用到的工具，其餘會陸續做成單元。</p></div>
<div class="tool-grid reveal">%(tools)s</div>
</div></section>

<section class="section"><div class="container">
<div class="section-heading reveal"><h2>獵豹課堂主題牆</h2><p>這些是獵豹班上真的會教的主題（節錄自各班講義），互動單元只是它們的基礎入口。</p></div>
<div class="wall reveal">%(wall)s</div>
</div></section>

<section class="section"><div class="container">
<article class="card reveal play-cta"><h3>想知道孩子適合哪一班？</h3><p>把孩子剛玩完的單元名稱、年級與卡住的地方告訴老師，我們會建議適合的班級與試聽方式。</p>
<div class="page-nav"><a class="button button--primary" href="%(line)s" target="_blank" rel="noreferrer">用 LINE 問老師</a><a class="button button--secondary" href="courses.html">先看課程總覽</a><a class="button button--secondary" href="https://www.facebook.com/groups/695697124716309" target="_blank" rel="noreferrer">加入 FB 星媽社團</a></div></article>
</div></section>
''' % dict(line=LINE, tiers=tiers, cards=cards, gcards=game_cards, vs=vs, tools=tools, wall=wall, areas=area_btns, n=n_units, g=len(games_only))
main += '</main>'

h = head_for('play.html', '獵豹玩中學｜互動數學單元｜獵豹科教', '獵豹玩中學：幾何、立體幾何、乘法公式、三角函數、排列組合的互動數學單元，加上魔術方塊與三視圖遊戲，手機一屏一步、免登入。', '',
             '\n  <script src="assets/play/play-hub.js" defer=""></script>\n  <script src="assets/play/play-chrome.js" defer=""></script>')
write('play.html', h + main + tail)
