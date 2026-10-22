# -*- coding: utf-8 -*-
"""立體幾何單元的中繼資料（由 build_pages.py 載入）。"""
LIBS = ['assets/play/play-3d.js', 'assets/play/play-solid-lib.js']
CSS = ['assets/play/play-solid.css']


def cube_svg(extra=''):
    return ('<svg viewBox="0 0 320 130" aria-hidden="true">' + extra +
            '<g stroke="#122548" stroke-width="3" stroke-linejoin="round"><polygon points="110,40 190,40 190,110 110,110" fill="rgba(47,111,220,.25)"/>'
            '<polygon points="110,40 150,15 230,15 190,40" fill="rgba(214,51,108,.22)"/><polygon points="190,40 230,15 230,85 190,110" fill="rgba(31,157,85,.25)"/></g></svg>')


ENTRIES = [
    dict(slug='solid-basic', title='立體圖形的基本性質', grade='國中', area='立體幾何', mins='約 8 分鐘',
         blurb='數一數正方體的頂點、稜、面，發現所有多面體都有 頂點 − 稜 + 面 ＝ 2，再看為什麼正多面體只有 5 種。',
         see='可旋轉的透明多面體、歐拉公式、頂點拼角看出 5 種正多面體', deep='歐拉公式的應用、多面體計數、正多面體的對偶與對稱', classes='J91S／J71S／PK3C',
         desc='拖動旋轉多面體，數頂點、稜、面，發現歐拉公式，並看為什麼正多面體只有 5 種——國中立體幾何互動單元。',
         art=('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="3" stroke-linejoin="round"><polygon points="70,40 130,40 130,100 70,100" fill="rgba(47,111,220,.22)"/><polygon points="70,40 100,18 160,18 130,40" fill="rgba(214,51,108,.2)"/><polygon points="130,40 160,18 160,78 130,100" fill="rgba(31,157,85,.22)"/></g>'
              '<g fill="#122548"><circle cx="70" cy="40" r="5"/><circle cx="130" cy="40" r="5"/><circle cx="130" cy="100" r="5"/><circle cx="70" cy="100" r="5"/><circle cx="100" cy="18" r="5"/><circle cx="160" cy="18" r="5"/><circle cx="160" cy="78" r="5"/></g>'
              '<g font-family="sans-serif" font-weight="800" font-size="15" fill="#122548"><text x="200" y="44">V − E + F</text><text x="200" y="74">＝ 8 − 12 + 6</text><text x="200" y="104" fill="#d6336c">＝ 2</text></g></svg>')),
    dict(slug='solid-lines', title='空間中的線與面', grade='國中', area='立體幾何', mins='約 8 分鐘',
         blurb='平面上不平行的線一定會相交，空間裡卻不一定：認識歪斜線，並看懂線與面、面與面的關係。',
         see='可旋轉的正方體、點選稜與面、歪斜線計數', deep='歪斜線的夾角與距離、三垂線定理、二面角', classes='J91S／J71S／PK3C',
         desc='在正方體上點選稜與面，認識平行、相交、歪斜，以及線與面、面與面的關係——國中立體幾何互動單元。',
         art=('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke-width="4" stroke-linecap="round"><line x1="70" y1="100" x2="150" y2="100" stroke="#2f6fdc"/><line x1="150" y1="100" x2="150" y2="30" stroke="#122548" stroke-width="2.5" stroke-dasharray="5 5"/>'
              '<line x1="110" y1="60" x2="190" y2="60" stroke="#122548" stroke-width="2.5"/><line x1="190" y1="60" x2="190" y2="20" stroke="#122548" stroke-width="2.5" stroke-dasharray="5 5"/><line x1="190" y1="100" x2="250" y2="30" stroke="#d6336c"/></g>'
              '<text x="215" y="112" font-family="sans-serif" font-weight="800" font-size="15" fill="#d6336c">歪斜</text></svg>')),
    dict(slug='solid-transform', title='立體變換', grade='國中', area='立體幾何', mins='約 9 分鐘',
         blurb='繞 x、y、z 軸把積木轉到目標姿勢，發現旋轉順序不能換；鏡射為什麼讓左手右手轉不成一樣；正方體有 24 種旋轉對稱。',
         see='可旋轉的積木與動畫、旋轉順序對照、24 種姿勢自動試轉、正方體旋轉軸', deep='旋轉矩陣、旋轉對稱群、正多面體的對稱、魔術方塊的數學', classes='J71S／S112／PK4B',
         desc='用積木練習繞軸旋轉，發現旋轉順序不能交換，看懂鏡射與左右手，認識正方體的 24 種旋轉對稱——立體幾何互動單元。',
         art=('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="3" stroke-linejoin="round"><polygon points="60,70 90,70 90,100 60,100" fill="rgba(47,111,220,.3)"/><polygon points="90,70 120,70 120,40 90,40" fill="rgba(214,51,108,.3)"/><polygon points="120,70 150,70 150,40 120,40" fill="rgba(31,157,85,.3)"/></g>'
              '<path d="M180 65 C 200 20, 250 20, 262 55" fill="none" stroke="#d29b1f" stroke-width="4" stroke-linecap="round"/><polygon points="262,55 252,38 272,44" fill="#d29b1f"/>'
              '<g stroke="#122548" stroke-width="3" stroke-linejoin="round"><polygon points="215,110 245,110 245,85 215,85" fill="rgba(47,111,220,.3)"/><polygon points="245,110 275,95 275,70 245,85" fill="rgba(214,51,108,.3)"/></g></svg>')),
    dict(slug='solid-views', title='各種角度觀察', grade='國中', area='立體幾何', mins='約 9 分鐘',
         blurb='從前、上、右三個方向看積木堆，認識三視圖；再用視圖搭出積木，還要找出只看兩個視圖時最少與最多要幾塊。',
         see='可拖動的 3D 積木（標有前後左右）、前上右視角一鍵切換、由三視圖搭積木（可放可拿）、最少最多推理、14 題基礎與挑戰題', deep='最少最多的系統解法、等角投影、影子與光源、由截面還原立體', classes='J71S／J91S／PK3C',
         desc='從三個方向觀察積木堆，認識三視圖，由視圖搭出積木，並推理最少與最多塊數——國中立體幾何互動單元。',
         art=('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5" stroke-linejoin="round"><polygon points="40,70 70,70 70,100 40,100" fill="rgba(47,111,220,.35)"/><polygon points="70,70 100,70 100,100 70,100" fill="rgba(47,111,220,.35)"/><polygon points="40,40 70,40 70,70 40,70" fill="rgba(47,111,220,.55)"/>'
              '<polygon points="140,70 170,70 170,100 140,100" fill="rgba(47,111,220,.35)"/><polygon points="140,40 170,40 170,70 140,70" fill="rgba(47,111,220,.35)"/><polygon points="230,70 260,70 260,100 230,100" fill="rgba(47,111,220,.35)"/><polygon points="260,70 290,70 290,100 260,100" fill="rgba(47,111,220,.35)"/></g>'
              '<g font-family="sans-serif" font-weight="800" font-size="13" fill="#122548" text-anchor="middle"><text x="70" y="120">前視</text><text x="155" y="120">上視</text><text x="260" y="120">右視</text></g></svg>')),
    dict(slug='solid-nets', title='展開圖', grade='國中', area='立體幾何', mins='約 10 分鐘',
         blurb='把展開圖摺回正方體，判斷哪些能摺、找齊 11 種，再看柱體、錐體的展開，並用展開圖解開螞蟻爬立方體的最短路徑。',
         see='可摺疊的 3D 展開圖、35 種六連方塊判斷、圓柱圓錐展開、最短路徑攤平', deep='圓錐側面積與最短路徑、正多面體展開、展開圖與著色', classes='J91S／J71S／PK3C',
         desc='拉動滑桿把展開圖摺成立體，判斷能不能摺成正方體，找出 11 種展開圖，並用攤平解螞蟻最短路徑——國中立體幾何互動單元。',
         art=('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5" stroke-linejoin="round"><rect x="50" y="52" width="26" height="26" fill="rgba(47,111,220,.3)"/><rect x="76" y="52" width="26" height="26" fill="rgba(214,51,108,.3)"/><rect x="102" y="52" width="26" height="26" fill="rgba(31,157,85,.3)"/><rect x="128" y="52" width="26" height="26" fill="rgba(210,155,31,.3)"/><rect x="76" y="26" width="26" height="26" fill="rgba(122,79,214,.3)"/><rect x="76" y="78" width="26" height="26" fill="rgba(232,89,12,.3)"/></g>'
              '<path d="M175 65 C 195 30, 225 30, 238 52" fill="none" stroke="#d29b1f" stroke-width="3.5" stroke-linecap="round"/><polygon points="238,52 226,40 246,40" fill="#d29b1f"/>'
              '<g stroke="#122548" stroke-width="3" stroke-linejoin="round"><polygon points="255,60 285,60 285,90 255,90" fill="rgba(47,111,220,.25)"/><polygon points="255,60 270,48 300,48 285,60" fill="rgba(214,51,108,.22)"/><polygon points="285,60 300,48 300,78 285,90" fill="rgba(31,157,85,.25)"/></g></svg>')),
    dict(slug='solid-section', title='截面', grade='國中', area='立體幾何', mins='約 8 分鐘',
         blurb='用一個平面切正方體，切面會是什麼形狀？找出三角形、四邊形、五邊形，還有神奇的正六邊形。',
         see='可拖動滑桿的平面切割、四種切法、切下一個角、歐拉公式再應用', deep='截面積與體積、過中心的切法、祖暅原理、正四面體的截面', classes='J91S／PK3C／J71S',
         desc='拉動滑桿用平面切正方體，看切面是三角形、四邊形、五邊形或正六邊形，並算切下一個角的體積——立體幾何互動單元。',
         art=('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="3" stroke-linejoin="round"><polygon points="120,40 200,40 200,110 120,110" fill="rgba(47,111,220,.12)"/><polygon points="120,40 150,15 230,15 200,40" fill="rgba(214,51,108,.1)"/><polygon points="200,40 230,15 230,85 200,110" fill="rgba(31,157,85,.12)"/>'
              '<polygon points="120,75 160,40 215,28 230,50 190,85 140,110" fill="rgba(242,169,59,.75)" stroke="#b4700b"/></g></svg>')),
]
SOON = [
    ('立體圖形的體積與表面積', '國中', '立體幾何', '柱體、錐體為什麼是 1/3？倒水、切片、堆疊一次看懂。'),
    ('球與圓錐、圓柱的關係', '高中', '立體幾何', '祖暅原理：同高處截面積相等，體積就相等。'),
]

for _e in ENTRIES:
    _e['libs'] = LIBS + (['assets/play/solid-views-bank.js'] if _e['slug'] == 'solid-views' else [])
    _e['css'] = CSS
