# -*- coding: utf-8 -*-
"""高中空間中的直線與平面單元（E1～E4）的中繼資料，由 build_pages.py 載入。"""
LIBS3 = ['assets/play/play-3d.js', 'assets/play/play-solid-lib.js', 'assets/play/play-3dpt.js']
CSS3 = ['assets/play/play-solid.css']

TP_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="30,98 120,106 150,50 60,42" fill="rgba(47,111,220,.2)" stroke="#2f6fdc" stroke-width="2.5" stroke-dasharray="6 4"/>'
    '<line x1="60" y1="92" x2="130" y2="96" stroke="#2f6fdc" stroke-width="3"/><line x1="130" y1="96" x2="112" y2="58" stroke="#2f6fdc" stroke-width="3"/><line x1="60" y1="92" x2="112" y2="58" stroke="#2f6fdc" stroke-width="3"/>'
    '<circle cx="60" cy="92" r="7" fill="#2f6fdc"/><circle cx="130" cy="96" r="7" fill="#2f6fdc"/><circle cx="112" cy="58" r="7" fill="#2f6fdc"/><circle cx="96" cy="30" r="7" fill="#d6336c"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">過直線的平面：無限多個</text><text x="184" y="72" font-size="16" fill="#2f6fdc">不共線三點：唯一一個</text><text x="184" y="104" font-size="15" fill="#d6336c">第四點不一定共面</text></g></svg>')

PA_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="20,100 130,112 160,70 50,58" fill="rgba(122,79,214,.18)" stroke="#7a4fd6" stroke-width="2.5"/>'
    '<polygon points="60,100 120,30 156,36 98,108" fill="rgba(47,111,220,.22)" stroke="#2f6fdc" stroke-width="2.5" stroke-dasharray="6 4"/><line x1="52" y1="82" x2="150" y2="94" stroke="#1f9d55" stroke-width="5" stroke-linecap="round"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">兩平面相交：一條直線</text><text x="184" y="72" font-size="16" fill="#1f9d55">沒有公共點：平行</text><text x="184" y="104" font-size="15" fill="#d6336c">兩點在平面內 → 整條在</text></g></svg>')

SK_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="20,100 130,112 160,70 50,58" fill="rgba(122,79,214,.10)" stroke="#b9ad92" stroke-width="2"/>'
    '<line x1="40" y1="84" x2="150" y2="96" stroke="#2f6fdc" stroke-width="5" stroke-linecap="round"/><line x1="60" y1="30" x2="150" y2="58" stroke="#d6336c" stroke-width="5" stroke-linecap="round"/><line x1="112" y1="42" x2="112" y2="92" stroke="#d29b1f" stroke-width="2.5" stroke-dasharray="5 4"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">平行、相交、歪斜</text><text x="184" y="72" font-size="16" fill="#d29b1f">歪斜線：不共面</text><text x="184" y="104" font-size="15" fill="#d6336c">不相交不一定平行</text></g></svg>')

LP_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="20,104 130,116 170,76 60,64" fill="rgba(122,79,214,.16)" stroke="#7a4fd6" stroke-width="2.5"/>'
    '<line x1="95" y1="92" x2="95" y2="22" stroke="#d6336c" stroke-width="5" stroke-linecap="round"/><circle cx="95" cy="92" r="5" fill="#7a4fd6"/><circle cx="95" cy="22" r="7" fill="#d6336c"/>'
    '<polyline points="95,80 107,82 107,92" fill="none" stroke="#122548" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">平行：平面內有一條平行線</text><text x="184" y="72" font-size="16" fill="#d6336c">垂直：要垂直兩條相交線</text><text x="184" y="104" font-size="15" fill="#d29b1f">三垂線定理</text></g></svg>')

TW_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="20,104 130,116 170,76 60,64" fill="rgba(122,79,214,.16)" stroke="#7a4fd6" stroke-width="2.5"/>'
    '<polygon points="55,100 135,108 140,30 62,24" fill="rgba(47,111,220,.22)" stroke="#2f6fdc" stroke-width="2.5" stroke-dasharray="6 4"/><line x1="55" y1="100" x2="135" y2="108" stroke="#122548" stroke-width="5"/>'
    '<polyline points="64,98 62,86 74,87" fill="none" stroke="#122548" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">面面平行：兩條相交線</text><text x="184" y="72" font-size="16" fill="#2f6fdc">面面垂直：經過垂線</text><text x="184" y="104" font-size="15" fill="#d6336c">二面角：垂直於稜的兩線</text></g></svg>')

AN_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="20,104 130,116 170,76 60,64" fill="rgba(122,79,214,.16)" stroke="#7a4fd6" stroke-width="2.5"/>'
    '<line x1="70" y1="92" x2="118" y2="32" stroke="#d6336c" stroke-width="5" stroke-linecap="round"/><line x1="70" y1="92" x2="118" y2="100" stroke="#8a8470" stroke-width="3.5" stroke-dasharray="6 4"/><line x1="118" y1="32" x2="118" y2="100" stroke="#8a8470" stroke-width="2" stroke-dasharray="4 4"/>'
    '<path d="M 96 95 A 26 26 0 0 0 90 78" fill="none" stroke="#1f9d55" stroke-width="3.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">異面直線夾角：0°～90°</text><text x="184" y="72" font-size="16" fill="#1f9d55">線面角：和射影的夾角</text><text x="184" y="104" font-size="15" fill="#d6336c">二面角：0°～180°</text></g></svg>')

ENTRIES = [
    dict(slug='space-three-points', title='空間（一）：三個點決定一個平面', grade='高中', area='立體幾何', mins='約 12 分鐘', libs=[], css=[],
         blurb='不用在空間裡拖點：開關一扇門，看出「過兩個點的平面有無限多個」；調整三根柱子的高度，板子永遠放得穩（三腳凳不會搖）；四腳桌卻不一定；三根排成一直線時，板子會翻動。',
         see='拉滑桿開門、按 ＋－ 調柱子高度、點地板格子放柱子、3 個操作關卡（排成一直線、讓四腳桌不會搖、四根高度各不相同又不搖）', deep='平面方程式與法向量、四點共面的行列式條件、空間座標', classes='S111、S112',
         desc='用門、三腳凳和四腳桌的生活情境看三點決定平面、過直線的平面有無限多個、四點不一定共面——高中空間中的直線與平面互動單元。',
         art=TP_ART),
    dict(slug='space-plane-axioms', title='空間（二）：兩個平面相交成一條直線', grade='高中', area='立體幾何', mins='約 12 分鐘', libs=LIBS3, css=CSS3,
         blurb='拖動三個點決定平面 β，看它和地面 α 的公共部分永遠是一條直線（或平行沒有公共點）；再看「直線上有兩個點在平面內，整條直線都在平面內」。',
         see='拖 P、Q、R 看交線、拖 M、N 看直線與平面、3 個操作關卡（讓兩平面平行、交線經過 T、交線和 x 軸平行）', deep='兩平面交線的方向、法向量外積、三平面的位置關係', classes='S111、S112',
         desc='用 3D 拖點看兩個平面相交成一條直線、直線上兩點在平面內——高中空間中的直線與平面互動單元。',
         art=PA_ART),
    dict(slug='space-skew', title='空間（三）：兩條直線的位置關係與歪斜線', grade='高中', area='立體幾何', mins='約 10 分鐘', libs=LIBS3, css=CSS3,
         blurb='拖動第二條直線的兩個點，看它和第一條直線是平行、相交，還是「不共面」的歪斜線；不相交不一定平行。',
         see='拖 C、D 看三種關係與共面的平面、3 個操作關卡（歪斜、相交一點、平行）', deep='歪斜線的夾角與距離、共垂線、向量三重積', classes='S111、S112',
         desc='用 3D 拖點看空間中兩直線的平行、相交、歪斜——高中空間中的直線與平面互動單元。',
         art=SK_ART),
    dict(slug='space-line-plane', title='空間（四）：直線與平面', grade='高中', area='立體幾何', mins='約 14 分鐘', libs=LIBS3, css=CSS3,
         blurb='拖動直線看它和平面的三種位置；看出「垂直平面內一條線不夠、要垂直兩條相交線」；再用三垂線定理看 PH 為什麼也垂直。',
         see='拖 M、N 看線面平行、拖 P 看線面垂直、拖 H 看三垂線定理、3 個操作關卡（過 T 而平行、OP 垂直平面長 3、找 PH ⊥ l）', deep='線面垂直的性質、點到平面的距離、空間向量與法向量', classes='S111、S112',
         desc='用 3D 拖點看線面平行、線面垂直的判定與三垂線定理——高中空間中的直線與平面互動單元。',
         art=LP_ART),
    dict(slug='space-two-planes', title='空間（五）：兩個平面的位置關係與二面角', grade='高中', area='立體幾何', mins='約 14 分鐘', libs=LIBS3, css=CSS3,
         blurb='看出「面面平行要兩條相交線都平行」、「經過另一個平面的垂線就垂直」，再用兩條垂直於稜的線量二面角。',
         see='拖 Q 看面面平行、轉動並傾斜平面看面面垂直、拖 T 量二面角、3 個操作關卡（平行、垂直、135° 的二面角）', deep='二面角的法向量求法、三垂線法、空間向量', classes='S111、S112',
         desc='用 3D 拖點看面面平行與垂直的判定、二面角怎麼量——高中空間中的直線與平面互動單元。',
         art=TW_ART),
    dict(slug='space-angles', title='空間（六）：空間中的三種角', grade='高中', area='立體幾何', mins='約 14 分鐘', libs=LIBS3, css=CSS3,
         blurb='歪斜線的夾角要平行移動成相交再量；線面角是直線和它射影的夾角（最小角）；二面角用兩條垂直於稜的線量，範圍到 180°。',
         see='拖動歪斜線量夾角、轉動平面內的線找最小角、拖動 T 量二面角、4 個操作關卡（歪斜 45°、線面角 45°、二面角 45°、線面角 90°）', deep='最小角定理、三面角、用空間向量求三種角', classes='S111、S112',
         desc='用 3D 拖點比較異面直線夾角、線面角與二面角的定義與範圍——高中空間中的直線與平面互動單元。',
         art=AN_ART),
]
SOON = []
