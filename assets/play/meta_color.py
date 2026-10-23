# -*- coding: utf-8 -*-
"""塗色問題單元（F1～F6）的中繼資料，由 build_pages.py 載入。"""
APPR = ['assets/play/play-app.js', 'assets/play/play-region.js']
CSS = ['assets/play/play-app.css']

MAP_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="3"><rect x="20" y="20" width="50" height="45" fill="#e8590c"/><rect x="70" y="20" width="50" height="45" fill="#2f6fdc"/><rect x="20" y="65" width="50" height="45" fill="#2f6fdc"/><rect x="70" y="65" width="50" height="45" fill="#1f9d55"/><rect x="120" y="20" width="40" height="90" fill="#d29b1f"/></g>'
    '<line x1="70" y1="65" x2="120" y2="65" stroke="#e03131" stroke-width="0"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">相鄰要共用邊界線</text><text x="184" y="72" font-size="16" fill="#e03131">同色相鄰：紅線</text><text x="184" y="104" font-size="15" fill="#1f9d55">最少要幾種顏色？</text></g></svg>')

CC1_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><ellipse cx="85" cy="66" rx="52" ry="52" fill="#ffd8a8" stroke="#122548" stroke-width="3"/><ellipse cx="62" cy="58" rx="9" ry="9" fill="#2f6fdc" stroke="#122548" stroke-width="2.5"/><ellipse cx="108" cy="58" rx="9" ry="9" fill="#2f6fdc" stroke="#122548" stroke-width="2.5"/>'
    '<rect x="62" y="55" width="46" height="6" fill="#1f9d55" stroke="#122548" stroke-width="2"/><polygon points="78,80 92,80 85,66" fill="#d6336c" stroke="#122548" stroke-width="2"/><ellipse cx="85" cy="100" rx="14" ry="6" fill="#7a4fd6" stroke="#122548" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="170" y="40" font-size="16" fill="#122548">選擇數 ＝ 總色數 − 鄰居用了</text><text x="170" y="62" font-size="16" fill="#d6336c">幾種「不同」的顏色</text><text x="170" y="96" font-size="15" fill="#1f9d55">先塗相鄰多的 → 能連乘</text></g></svg>')

CC2_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="85,18 115,28 128,58 115,88 85,98 55,88 42,58 55,28" fill="none" stroke="#122548" stroke-width="3"/><circle cx="85" cy="58" r="16" fill="#e8590c" stroke="#122548" stroke-width="3"/>'
    '<g stroke="#122548" stroke-width="2.5"><polygon points="85,18 115,28 100,46 70,46 55,28" fill="#2f6fdc"/><polygon points="115,28 128,58 108,62 100,46" fill="#1f9d55"/><polygon points="128,58 115,88 98,72 108,62" fill="#2f6fdc"/><polygon points="115,88 85,98 78,76 98,72" fill="#1f9d55"/><polygon points="85,98 55,88 72,72 78,76" fill="#2f6fdc"/></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="160" y="40" font-size="16" fill="#122548">鄰居同色或不同色？</text><text x="160" y="64" font-size="16" fill="#d6336c">分類：每類連乘再相加</text><text x="160" y="100" font-size="15" fill="#1f9d55">環形、輪形：不用背公式</text></g></svg>')

CUBE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5"><polygon points="40,50 100,50 124,30 64,30" fill="#e8590c"/><polygon points="40,50 100,50 100,108 40,108" fill="#e8590c"/><polygon points="100,50 124,30 124,88 100,108" fill="#d6531a"/></g>'
    '<g stroke="#122548" stroke-width="1.5" opacity=".6"><line x1="60" y1="50" x2="60" y2="108"/><line x1="80" y1="50" x2="80" y2="108"/><line x1="40" y1="70" x2="100" y2="70"/><line x1="40" y1="89" x2="100" y2="89"/></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="170" y="40" font-size="16" fill="#122548">角 3 面永遠 8 個</text><text x="170" y="66" font-size="16" fill="#d29b1f">邊 12(n−2)、面 6(n−2)²</text><text x="170" y="100" font-size="15" fill="#6c757d">內部 (n−2)³</text></g></svg>')

CSYM_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5"><rect x="30" y="30" width="26" height="26" fill="#122548"/><rect x="56" y="30" width="26" height="26" fill="#fff"/><rect x="30" y="56" width="26" height="26" fill="#fff"/><rect x="56" y="56" width="26" height="26" fill="#fff"/>'
    '<rect x="104" y="30" width="26" height="26" fill="#fff"/><rect x="130" y="30" width="26" height="26" fill="#122548"/><rect x="104" y="56" width="26" height="26" fill="#fff"/><rect x="130" y="56" width="26" height="26" fill="#fff"/></g>'
    '<path d="M 92 100 A 24 24 0 0 0 70 96" fill="none" stroke="#d29b1f" stroke-width="3.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">轉一轉算同一種</text><text x="184" y="66" font-size="16" fill="#d29b1f">不能一律除以 4</text><text x="184" y="100" font-size="15" fill="#d6336c">翻轉不一定更少</text></g></svg>')

CCHK_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2"><rect x="20" y="20" width="22" height="22" fill="#9aa3b5"/><rect x="42" y="20" width="22" height="22" fill="#fff"/><rect x="64" y="20" width="22" height="22" fill="#9aa3b5"/><rect x="86" y="20" width="22" height="22" fill="#fff"/>'
    '<rect x="20" y="42" width="22" height="22" fill="#fff"/><rect x="42" y="42" width="44" height="22" fill="#a5d8ff"/><rect x="86" y="42" width="22" height="22" fill="#fff"/><rect x="20" y="64" width="22" height="22" fill="#9aa3b5"/><rect x="42" y="64" width="22" height="22" fill="#fff"/><rect x="64" y="64" width="22" height="22" fill="#9aa3b5"/><rect x="86" y="64" width="22" height="22" fill="#fff"/></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="140" y="40" font-size="16" fill="#122548">骨牌：一黑一白</text><text x="140" y="66" font-size="16" fill="#d6336c">黑白不一樣多 → 不可能</text><text x="140" y="100" font-size="15" fill="#1f9d55">用染色證明</text></g></svg>')

ENTRIES = [
    dict(slug='color-map', title='塗色（一）：地圖著色，相鄰與最少色數', grade='小學', area='排列組合', mins='約 12 分鐘', libs=APPR, css=CSS,
         blurb='點選區域塗色，同色相鄰的邊界變紅；看出對角不算相鄰、兩兩相鄰的區域各要一種顏色，一圈區域奇數個要 3 色。',
         see='塗色與點線圖、調整顏色數找最少色數、一圈區域的奇偶、3 個操作關卡（3 色塗滿、最少色數、輪形外圈）', deep='染色問題、圖的著色、四色定理', classes='PK2B',
         desc='點選區域塗色，看相鄰、同色衝突與最少色數——小學到國中的塗色問題互動單元。',
         art=MAP_ART),
    dict(slug='color-count1', title='塗色（二）：計數塗色(一)，選擇數與塗色順序', grade='小學', area='排列組合', mins='約 14 分鐘', libs=APPR, css=CSS,
         blurb='塗人臉要算有幾種塗法：看出選擇數是「總色數減鄰居用了幾種不同顏色」，再學會先塗相鄰多的區域，每一步選擇數才固定、才能連乘。',
         see='看鄰居同色或不同色的選擇數、排塗色順序（戴眼鏡的人臉）、3 個操作關卡（有眉毛的人臉找能連乘的順序、調顏色數得 192 種、讓鏡架只剩 1 種）', deep='色多項式、刪除與收縮、分類討論', classes='PK2A、PI2A',
         desc='用人臉塗色看選擇數與塗色順序，學會乘法原理的塗色計數——小學到國中的塗色問題互動單元。',
         art=CC1_ART),
    dict(slug='color-count2', title='塗色（三）：計數塗色(二)，分類討論與環形', grade='國中', area='排列組合', mins='約 14 分鐘', libs=APPR, css=CSS,
         blurb='鄰居可能同色也可能不同色時，選擇數不固定：分兩類各自連乘再相加；再把環形剪開、扣掉首尾同色，輪形先塗中心，不用背公式。',
         see='四區方塊分類並用電腦列舉檢查、環形首尾同色與不同色、4 個操作關卡（k 讓不同色 48 種、環形 66 種、輪形 72 種、同色比不同色多）', deep='色多項式、環形塗色通式、容斥原理', classes='PK2A、PI2A',
         desc='看分類討論、環形與輪形塗色計數，用列舉驗證不重複不遺漏——國中塗色問題互動單元。',
         art=CC2_ART),
    dict(slug='color-cube', title='塗色（四）：立體切開塗色', grade='國中', area='立體幾何', mins='約 14 分鐘', libs=APPR + ['assets/play/play-3d.js', 'assets/play/play-solid-lib.js'], css=CSS + ['assets/play/play-solid.css'],
         blurb='大正方體外面塗色切成小方塊：按位置（角、邊、面、內部）分類，看出 3 面有色永遠 8 個、n−2 是去掉兩端；底面不塗，答案就變。',
         see='拆開、轉動、點選小方塊、分類上色、調整 n、3 個操作關卡（選出 8 個角、內部 27 塊、底面不塗 36 塊）', deep='長方體塗色切塊、分層計數、容斥', classes='',
         desc='可旋轉、可拆開的 3D 立方體，看塗色後切開各類小方塊的個數——立體塗色問題互動單元。',
         art=CUBE_ART),
    dict(slug='color-symmetry', title='塗色（五）：對稱與等價，旋轉翻轉算一種', grade='國中', area='排列組合', mins='約 12 分鐘', libs=['assets/play/play-app.js'], css=CSS,
         blurb='2×2 方格塗黑白、項鍊塗黑白：點一個圖樣看它轉一轉會變成誰，把同一種的分成一堆；看出不能一律除以 4，翻轉也不一定讓種類變少。',
         see='點圖樣圈出同一堆、項鍊旋轉與翻轉、3 個操作關卡（轉一轉還是自己、轉半圈才回來、翻轉才相同）', deep='Burnside 引理、群的作用、Pólya 計數', classes='',
         desc='把旋轉、翻轉後一樣的圖樣分成一堆，看等價類與項鍊塗色——國中資優的塗色計數互動單元。',
         art=CSYM_ART),
    dict(slug='color-checkerboard', title='塗色（六）：棋盤染色，證明「不可能」', grade='國中', area='排列組合', mins='約 12 分鐘', libs=['assets/play/play-app.js'], css=CSS,
         blurb='放骨牌蓋棋盤：每一塊骨牌一定蓋一黑一白，所以黑白不一樣多就不可能蓋滿；自己改拿哪兩格，讓棋盤蓋得滿。',
         see='放骨牌看黑白、8×8 缺對角蓋不滿、3 個操作關卡（4×4 拿兩格蓋滿、8×8 改拿一黑一白、3×3 拿一格）', deep='染色證明法、L 形骨牌、不變量', classes='PK2B',
         desc='用黑白染色證明骨牌蓋不滿棋盤，每塊骨牌一定蓋一黑一白——國中競賽的染色問題互動單元。',
         art=CCHK_ART),
]
SOON = []
