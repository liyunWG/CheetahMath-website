# -*- coding: utf-8 -*-
"""平面幾何新單元（畢氏定理、圓周角與圓心角）的中繼資料，由 build_pages.py 載入。"""

PYTHAGORAS_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5" stroke-linejoin="round">'
    '<polygon points="100,117 145,57 85,12 40,72" fill="rgba(31,157,85,.28)"/>'
    '<polygon points="40,117 100,117 40,72" fill="rgba(210,155,31,.5)"/><polygon points="100,117 145,117 145,57" fill="rgba(210,155,31,.5)"/>'
    '<polygon points="145,57 145,12 85,12" fill="rgba(210,155,31,.5)"/><polygon points="40,72 40,12 85,12" fill="rgba(210,155,31,.5)"/></g>'
    '<g font-family="sans-serif" font-weight="800" font-size="26"><text x="180" y="60" fill="#122548">a² ＋ b²</text><text x="180" y="98" fill="#1f9d55">＝ c²</text></g></svg>')

CIRCLE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="110" cy="65" r="50" fill="none" stroke="#2a3f6e" stroke-width="3"/>'
    '<g stroke-width="3" stroke-linecap="round"><line x1="110" y1="15" x2="78" y2="103" stroke="#2f6fdc"/><line x1="110" y1="15" x2="142" y2="103" stroke="#2f6fdc"/>'
    '<line x1="110" y1="65" x2="78" y2="103" stroke="#d6336c" stroke-dasharray="5 4"/><line x1="110" y1="65" x2="142" y2="103" stroke="#d6336c" stroke-dasharray="5 4"/></g>'
    '<g fill="#122548"><circle cx="110" cy="15" r="5"/><circle cx="78" cy="103" r="5"/><circle cx="142" cy="103" r="5"/><circle cx="110" cy="65" r="4"/></g>'
    '<g font-family="sans-serif" font-weight="800" font-size="20"><text x="190" y="52" fill="#2f6fdc">圓周角 40°</text><text x="190" y="84" fill="#d6336c">圓心角 80°</text></g></svg>')

GEO = ['assets/play/play-geo.js']

POLYGON_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="70,112 140,112 168,58 105,14 44,62" fill="rgba(210,155,31,.2)" stroke="#122548" stroke-width="3" stroke-linejoin="round"/>'
    '<g stroke="#122548" stroke-width="1.5"><polygon points="140,112 166,112 156,90" fill="rgba(47,111,220,.55)"/><polygon points="168,58 190,72 176,38" fill="rgba(214,51,108,.55)"/>'
    '<polygon points="105,14 120,-2 92,-4" fill="rgba(31,157,85,.55)"/><polygon points="44,62 26,44 22,76" fill="rgba(122,79,214,.55)"/><polygon points="70,112 52,128 44,106" fill="rgba(232,89,12,.55)"/></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="205" y="62" font-size="20" fill="#122548">外角和</text><text x="205" y="96" font-size="30" fill="#d6336c">＝ 360°</text></g></svg>')


TRIG_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5" stroke-linejoin="round"><polygon points="30,112 120,112 120,52" fill="rgba(210,155,31,.28)"/>'
    '<polygon points="30,112 200,112 200,12" fill="rgba(47,111,220,.1)" stroke-dasharray="6 5"/></g>'
    '<path d="M60 112 A30 30 0 0 0 52 98" fill="none" stroke="#2f6fdc" stroke-width="3"/><rect x="108" y="100" width="12" height="12" fill="none" stroke="#122548" stroke-width="2"/><rect x="188" y="100" width="12" height="12" fill="none" stroke="#122548" stroke-width="2"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="222" y="52" font-size="19" fill="#d6336c">sin θ ＝ 對邊 ÷ 斜邊</text><text x="222" y="82" font-size="19" fill="#2f6fdc">cos θ ＝ 鄰邊 ÷ 斜邊</text><text x="222" y="112" font-size="16" fill="#1f9d55">大小不同，比值一樣</text></g></svg>')


RADIAN_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="100" cy="65" r="50" fill="none" stroke="#2a3f6e" stroke-width="3"/>'
    '<g fill="none" stroke-width="7"><path d="M150 65 A50 50 0 0 0 135 100" stroke="#2f6fdc"/><path d="M135 100 A50 50 0 0 1 100 115" stroke="#d6336c" transform="rotate(0)"/><path d="M100 115 A50 50 0 0 1 60 100" stroke="#1f9d55"/></g>'
    '<g stroke="#b9ad92" stroke-width="2"><line x1="100" y1="65" x2="150" y2="65"/><line x1="100" y1="65" x2="135" y2="100"/></g><circle cx="100" cy="65" r="4" fill="#122548"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="185" y="52" font-size="19" fill="#2f6fdc">弧長 ＝ 半徑</text><text x="185" y="80" font-size="19" fill="#d6336c">→ 1 弧度</text><text x="185" y="110" font-size="19" fill="#122548">一圈 ＝ 2π</text></g></svg>')


CIRCLE_AREA_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="62" cy="65" r="46" fill="rgba(47,111,220,.18)" stroke="#122548" stroke-width="3"/>'
    '<g stroke="#122548" stroke-width="1.5"><line x1="62" y1="19" x2="62" y2="111"/><line x1="16" y1="65" x2="108" y2="65"/><line x1="29" y1="32" x2="95" y2="98"/><line x1="95" y1="32" x2="29" y2="98"/></g>'
    '<g stroke="#122548" stroke-width="2"><polygon points="140,100 160,100 150,60" fill="rgba(47,111,220,.5)"/><polygon points="155,60 175,60 165,100 145,100" fill="rgba(214,51,108,.4)" transform="translate(0,0)"/>'
    '<polygon points="170,100 190,100 180,60" fill="rgba(47,111,220,.5)"/><polygon points="185,60 205,60 195,100 175,100" fill="rgba(214,51,108,.4)"/><polygon points="200,100 220,100 210,60" fill="rgba(47,111,220,.5)"/></g>'
    '<rect x="140" y="60" width="80" height="40" fill="none" stroke="#d6336c" stroke-width="2.5" stroke-dasharray="6 5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="240" y="62" font-size="18" fill="#122548">長 πr × 寬 r</text><text x="240" y="96" font-size="26" fill="#d6336c">＝ πr²</text></g></svg>')


COSINE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke-linejoin="round" stroke-linecap="round"><polygon points="40,108 130,108 98,34" fill="rgba(210,155,31,.26)" stroke="#122548" stroke-width="2.5"/>'
    '<line x1="40" y1="108" x2="130" y2="108" stroke="#2f6fdc" stroke-width="4"/><line x1="40" y1="108" x2="98" y2="34" stroke="#d6336c" stroke-width="4"/><line x1="98" y1="34" x2="130" y2="108" stroke="#1f9d55" stroke-width="4"/></g>'
    '<path d="M62 108 A22 22 0 0 0 57 92" fill="none" stroke="#122548" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="160" y="46" font-size="18" fill="#122548">c² ＝ a² ＋ b²</text><text x="160" y="76" font-size="21" fill="#d6336c">− 2ab·cos C</text><text x="160" y="108" font-size="15" fill="#1f9d55">C ＝ 90° 就是畢氏定理</text></g></svg>')


ENTRIES = [
    dict(slug='pythagoras', title='畢氏定理：重排四個直角三角形', grade='國中', area='幾何', mins='約 8 分鐘',
         blurb='拖動滑桿，把三個直角三角形搬到另一個位置：空白面積不變，a²＋b²＝c² 自己現形，再換不同的三角形驗證。',
         see='滑桿搬三角形、自己把四個三角形拖到角落、用面積量出 c、4 個操作關卡（格線長度、找直角、整數長方形、梯子）', deep='畢氏三元數、不同證法、座標距離、餘弦定理', classes='J81A／J81S／J72S／PK3C／PK4A',
         desc='拖動滑桿重排四個直角三角形，看見 a²＋b²＝c²，再用面積算出斜邊——國中幾何互動單元。',
         art=PYTHAGORAS_ART),
    dict(slug='circle-angles', title='圓周角與圓心角', grade='國中', area='幾何', mins='約 8 分鐘',
         blurb='拖動圓上的點，圓周角一動也不動；拖動弧的大小，圓心角永遠是圓周角的兩倍；直徑所對的角是直角。',
         see='拖動 P 繞圓、改變弧的大小、直徑所對的直角、拖動看懂證明、4 個操作關卡（做出指定角度、同弧、大弧小弧、四點共圓）', deep='圓內接四邊形、弦切角、圓冪、托勒密定理', classes='J82S／J91A／PK3A／PK4A',
         desc='拖動圓上的點，發現同弧所對的圓周角都相等、是圓心角的一半，直徑所對的圓周角是直角——國中幾何互動單元。',
         art=CIRCLE_ART),
    dict(slug='polygon-angles', title='多邊形的外角和為什麼是 360°', grade='國中', area='幾何', mins='約 9 分鐘', libs=GEO,
         blurb='跟著小豹沿多邊形走一圈，看牠一共轉了幾度；再把所有外角搬到同一點拼成一圈。拖歪頂點，外角和還是不變。',
         see='小豹走一圈、外角搬到同一點拼成圓、拖動頂點、3 個操作關卡（正多邊形、龜步走回起點、內角和）', deep='三角形外角定理、平面閉折線、直線形角度問題', classes='J81S／J82A／PK4A',
         desc='沿著多邊形走一圈、把外角拼成一整圈，發現多邊形的外角和永遠是 360°——國中幾何互動單元。',
         art=POLYGON_ART),
    dict(slug='trig-ratio', title='三角比：相似的比值不變', grade='國中', area='三角函數', mins='約 8 分鐘', libs=GEO,
         blurb='把直角三角形拉大縮小，邊長都變了，對邊 ÷ 斜邊卻紋風不動；再改變角度，看 sin、cos、tan 怎麼跟著變。',
         see='拖動拉大縮小、改變角度看 sin／cos／tan、3 個操作關卡（找特殊角、格點相似三角形、量樹高）', deep='相似形與面積比、廣義角、餘弦定理', classes='J91A／J82S／J82A／S102',
         desc='拖動拉大直角三角形，發現相似三角形的邊長比不變，認識 sin、cos、tan 三角比——國中三角函數互動單元。',
         art=TRIG_ART),
    dict(slug='radian', title='弧度：把半徑捲到圓周上', grade='高中', area='三角函數', mins='約 8 分鐘', libs=GEO,
         blurb='拿一條和半徑一樣長的繩子沿圓周捲，捲幾條剛好一圈？1 弧度到底多大？為什麼 π 才是圓的好朋友。',
         see='一段一段捲半徑長的繩子、拖動點同時看角度與弧度、3 個操作關卡（找弧度、找 π 的分數、弧長與扇形面積）', deep='弧長與扇形面積公式、三角函數 II、三角函數圖形', classes='S111／J82S／S102',
         desc='沿圓周一段一段捲半徑長的繩子，發現 1 弧度約 57.3°、一圈是 2π，弧度＝弧長÷半徑——高中三角函數互動單元。',
         art=RADIAN_ART),
    dict(slug='circle-area', title='圓面積：切成扇形再拼起來', grade='小學', area='幾何', mins='約 8 分鐘', libs=GEO,
         blurb='把圓切成越來越多的小扇形，交錯拼起來，越來越像長方形；再剝洋蔥、數方格，用三種方法看見圓面積是 πr²。',
         see='切扇形拼長方形、剝洋蔥拼三角形、數方格估 π、3 個操作關卡（半徑變化、圓環、扇形）', deep='圓與扇形的割補、圓周長與圓面積、弧長與扇形面積', classes='PK3B／PK3C／J82S',
         desc='把圓切成扇形再拼起來，發現圓面積是 πr²；還能用剝洋蔥和數方格驗證——小學幾何互動單元。',
         art=CIRCLE_AREA_ART),
    dict(slug='cosine-law', title='餘弦定理與畢氏定理', grade='高中', area='三角函數', mins='約 9 分鐘', libs=GEO,
         blurb='固定三角形的兩邊，拖動夾角：第三邊跟著變，c² 與 a²＋b² 差的剛好是 −2ab·cos C；夾角 90° 時，就回到畢氏定理。',
         see='拖動夾角比較 c² 與 a²＋b² 的長條、自己發現 −2ab·cos C、作高用畢氏定理證明、3 個操作關卡（用夾角湊出指定邊長）', deep='用三邊求角、正弦定理與外接圓、向量內積', classes='S102／PK4A／J81A',
         desc='固定兩邊、拖動夾角，親眼看見餘弦定理 c²＝a²＋b²−2ab·cos C，90° 時就是畢氏定理——高中三角函數互動單元。',
         art=COSINE_ART),
]
SOON = []
