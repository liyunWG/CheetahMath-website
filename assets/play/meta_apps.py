# -*- coding: utf-8 -*-
"""應用問題、分數、機率與推理等新單元的中繼資料，由 build_pages.py 載入。"""

APP = ['assets/play/play-app.js']
APPCSS = ['assets/play/play-app.css']
GEO = ['assets/play/play-geo.js']

PLANT_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><rect x="30" y="86" width="260" height="10" rx="5" fill="#e2d8bd"/>'
    '<g stroke="#fff" stroke-width="2"><rect x="30" y="86" width="52" height="10" fill="rgba(47,111,220,.3)"/><rect x="82" y="86" width="52" height="10" fill="rgba(210,155,31,.4)"/><rect x="134" y="86" width="52" height="10" fill="rgba(47,111,220,.3)"/><rect x="186" y="86" width="52" height="10" fill="rgba(210,155,31,.4)"/><rect x="238" y="86" width="52" height="10" fill="rgba(47,111,220,.3)"/></g>'
    + ''.join('<g transform="translate(%d,92)"><rect x="-3" y="-20" width="6" height="22" fill="#8b6a3e"/><circle cx="0" cy="-30" r="16" fill="#34a853"/></g>' % x for x in (30, 82, 134, 186, 238, 290))
    + '<g font-family="sans-serif" font-weight="800" font-size="17" fill="#122548"><text x="30" y="124">6 棵樹</text><text x="130" y="124" fill="#d6336c">5 段</text><text x="196" y="124" fill="#1f9d55">棵數＝段數＋1</text></g></svg>')

FRACTION_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#fff" stroke-width="3"><rect x="30" y="22" width="65" height="40" rx="6" fill="rgba(47,111,220,.35)"/><rect x="95" y="22" width="65" height="40" rx="6" fill="rgba(214,51,108,.35)"/><rect x="160" y="22" width="65" height="40" rx="6" fill="rgba(31,157,85,.35)"/><rect x="225" y="22" width="65" height="40" rx="6" fill="rgba(210,155,31,.45)"/></g>'
    '<g stroke="#fff" stroke-width="3"><rect x="30" y="80" width="30" height="34" rx="6" fill="rgba(47,111,220,.35)"/><rect x="60" y="80" width="30" height="34" rx="6" fill="rgba(214,51,108,.35)"/><rect x="90" y="80" width="120" height="34" rx="6" fill="rgba(31,157,85,.35)"/><rect x="210" y="80" width="80" height="34" rx="6" fill="rgba(210,155,31,.45)"/></g>'
    '<g font-family="sans-serif" font-weight="800" font-size="20" fill="#122548" text-anchor="middle"><text x="62" y="48">1/4</text><text x="127" y="48">1/4</text><text x="192" y="48">1/4</text><text x="257" y="48">1/4</text></g>'
    '<g font-family="sans-serif" font-weight="800" font-size="15" fill="#d6336c"><text x="30" y="127">不是平分，就不是 1/4</text></g></svg>')

DICE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#cfc6ad" stroke-width="1.5">'
    + ''.join('<rect x="%d" y="%d" width="17" height="17" rx="3" fill="%s"/>' % (28 + a * 18, 10 + (5 - b) * 18, 'rgba(47,111,220,.55)' if a + b == 5 else '#fff') for a in range(6) for b in range(6))
    + '</g><g font-family="sans-serif" font-weight="800" fill="#122548"><text x="165" y="48" font-size="19">和是 7 有 6 格</text><text x="165" y="78" font-size="26" fill="#d6336c">6 ÷ 36 ＝ 1/6</text><text x="165" y="108" font-size="15" fill="#1f9d55">機率 ＝ 想要的格子 ÷ 全部</text></g></svg>')

STROKE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-width="5"><path d="M50 108 L130 108 L130 52 L50 52 Z" stroke="#1f9d55"/><path d="M50 108 L130 52 M130 108 L50 52" stroke="#6d6250" stroke-width="4"/><path d="M50 52 L90 14 L130 52" stroke="#1f9d55"/></g>'
    '<g stroke="#122548" stroke-width="3"><circle cx="50" cy="108" r="9" fill="#ffe8f0" stroke="#d6336c"/><circle cx="130" cy="108" r="9" fill="#ffe8f0" stroke="#d6336c"/><circle cx="130" cy="52" r="9" fill="#fff"/><circle cx="50" cy="52" r="9" fill="#fff"/><circle cx="90" cy="14" r="9" fill="#fff"/></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="165" y="50" font-size="19" fill="#122548">奇點 2 個</text><text x="165" y="82" font-size="25" fill="#1f9d55">能一筆畫！</text><text x="165" y="110" font-size="15" fill="#d6336c">奇點只能是 0 或 2 個</text></g></svg>')

TIME_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#fff" stroke-width="2"><rect x="30" y="22" width="190" height="26" rx="5" fill="rgba(47,111,220,.55)"/><rect x="30" y="62" width="75" height="26" rx="5" fill="rgba(232,136,12,.62)"/><rect x="105" y="62" width="50" height="26" rx="5" fill="rgba(232,136,12,.62)"/></g>'
    '<line x1="220" y1="12" x2="220" y2="100" stroke="#d6336c" stroke-width="2.5" stroke-dasharray="5 4"/><line x1="30" y1="100" x2="290" y2="100" stroke="#6d6250" stroke-width="2"/>'
    '<g font-family="sans-serif" font-weight="800" fill="#122548" font-size="15"><text x="40" y="40">機器洗衣 30</text><text x="40" y="80">掃地 12</text><text x="110" y="80">擦桌 8</text></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="30" y="123" font-size="16" fill="#1f9d55">同時進行：只要 30 分鐘</text></g></svg>')

PERP_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="95" y1="6" x2="95" y2="124" stroke="#1f9d55" stroke-width="3" stroke-dasharray="7 5"/><line x1="30" y1="95" x2="160" y2="95" stroke="#122548" stroke-width="3.5"/>'
    '<g stroke="#2f6fdc" stroke-width="2.5" stroke-dasharray="5 4"><line x1="95" y1="30" x2="30" y2="95"/><line x1="95" y1="30" x2="160" y2="95"/></g>'
    '<rect x="95" y="83" width="12" height="12" fill="none" stroke="#122548" stroke-width="2.5"/><g fill="#122548"><circle cx="30" cy="95" r="6"/><circle cx="160" cy="95" r="6"/></g><circle cx="95" cy="30" r="8" fill="#5fe3b4" stroke="#fff" stroke-width="3"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="195" y="50" font-size="19" fill="#122548">PA ＝ PB</text><text x="195" y="82" font-size="19" fill="#1f9d55">垂直又平分</text><text x="195" y="112" font-size="16" fill="#d6336c">三條交於外心</text></g></svg>')

LINE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#cfc6ad" stroke-width="1"><line x1="20" y1="110" x2="170" y2="110"/><line x1="20" y1="10" x2="20" y2="110"/></g>'
    '<g stroke-width="4" stroke-linecap="round"><line x1="25" y1="95" x2="165" y2="25" stroke="#2f6fdc"/><line x1="30" y1="20" x2="160" y2="100" stroke="#d6336c"/></g>'
    '<circle cx="98" cy="60" r="8" fill="#5fe3b4" stroke="#fff" stroke-width="3"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="190" y="48" font-size="18" fill="#122548">交點 (3, 5)</text><text x="190" y="80" font-size="19" fill="#1f9d55">＝聯立方程式的解</text><text x="190" y="110" font-size="15" fill="#d6336c">平行：無解　重合：無限多</text></g></svg>')

PERIM_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="30,112 150,112 150,52 110,52 110,18 30,18" fill="rgba(210,155,31,.3)" stroke="none"/>'
    '<g stroke-width="5" stroke-linecap="round" fill="none"><path d="M30 112 L150 112 M110 52 L150 52 M30 18 L110 18" stroke="#2f6fdc"/><path d="M150 112 L150 52 M110 52 L110 18 M30 18 L30 112" stroke="#d6336c"/></g>'
    '<rect x="110" y="18" width="40" height="34" fill="none" stroke="#8a7d5c" stroke-width="2" stroke-dasharray="5 4"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="180" y="50" font-size="19" fill="#122548">缺角，周長不變</text><text x="180" y="82" font-size="19" fill="#1f9d55">推成長方形</text><text x="180" y="112" font-size="15" fill="#d6336c">周長 ＝ 2 ×（長＋寬）</text></g></svg>')

AUX_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="3"><line x1="20" y1="24" x2="170" y2="24"/><line x1="20" y1="104" x2="170" y2="104"/></g>'
    '<polyline points="45,24 120,64 70,104" fill="none" stroke="#122548" stroke-width="4" stroke-linejoin="round"/>'
    '<line x1="20" y1="64" x2="170" y2="64" stroke="#1f9d55" stroke-width="4" stroke-dasharray="8 5"/>'
    '<path d="M104 56 A18 18 0 0 0 100 64" fill="rgba(47,111,220,.5)" stroke="none"/><path d="M100 64 L104 56 L88 58 Z" fill="rgba(47,111,220,.5)"/><path d="M100 64 L104 72 L88 72 Z" fill="rgba(214,51,108,.5)"/>'
    '<g fill="#fff" stroke="#122548" stroke-width="3"><circle cx="45" cy="24" r="6"/><circle cx="70" cy="104" r="6"/><circle cx="120" cy="64" r="7" fill="#5fe3b4"/></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="195" y="46" font-size="18" fill="#122548">畫一條輔助線</text><text x="195" y="78" font-size="19" fill="#1f9d55">∠P ＝ ∠A ＋ ∠C</text><text x="195" y="108" font-size="15" fill="#d6336c">平行・垂直・延長・連接</text></g></svg>')

ENTRIES = [
    dict(slug='plant-gap', title='植樹與間隔：數空隙，不是數樹', grade='小學', area='應用問題', mins='約 8 分鐘', libs=APP, css=APPCSS,
         blurb='把樹苗拖到路上，數數樹和「段」各有幾個；再點旗子換成只種一端、兩端都不種，最後把路捲成一圈，看棵數和段數怎麼變。',
         see='拖樹苗上路、兩端旗子切換種／不種、把路捲成圓、3 個操作關卡（調間隔、鋸木頭、圓形池塘）', deep='紙條重疊接長、方陣問題、發車間隔', classes='PK1A／PI1A／PK2B／PK3D',
         desc='把樹苗拖到路上，發現兩端都種棵數＝段數＋1、環形棵數＝段數——小學應用問題（植樹、間隔）互動單元。',
         art=PLANT_ART),
    dict(slug='fraction-split', title='分數：平分才是 1/n', grade='小學', area='數與量', mins='約 8 分鐘', libs=APP, css=APPCSS,
         blurb='拖動切刀把蛋糕切成一樣大，發現要「平分」才能叫 1/4；再看分母、分子各代表什麼，以及同樣是 1/3，整體不同個數也不同。',
         see='拖切刀平分、取幾份在數線上標出、巧克力 1/3 隨總數變化、3 個操作關卡（等值分數、12 個的 2/3、比 1/5 小比 1/7 大）', deep='埃及分數、分數的比較與縮放、分數裂項', classes='PK1A／PI1A／PK2A／PK3C',
         desc='拖動切刀把蛋糕平分，看懂分母、分子與 1/n，發現分數是「整體的幾分之幾」——小學分數互動單元。',
         art=FRACTION_ART),
    dict(slug='dice-grid', title='兩顆骰子：36 格看機率', grade='小學', area='機率與推理', mins='約 8 分鐘', libs=APP, css=APPCSS,
         blurb='把兩顆骰子的所有可能排成 36 格，看看哪個點數和最容易出現；再塗出指定機率的事件，機率就是想要的格子除以 36。',
         see='每個點數和有幾格、塗出 1/4、1/6、1/2、4 個操作關卡（甲比乙大、點數相同、至少一顆 6、乘積是奇數）', deep='兩人各丟兩顆骰子、抽牌的機率、條件機率', classes='A8prep／PK3C／J91A／S112',
         desc='把兩顆骰子的 36 種結果排成格子，塗色看懂機率＝想要的格子數÷36——機率互動單元。',
         art=DICE_ART),
    dict(slug='one-stroke', title='一筆畫與奇點', grade='小學', area='機率與推理', mins='約 8 分鐘', libs=APP, css=APPCSS,
         blurb='用筆一個點一個點走，每條線只走一次。換不同的起點試試，找出奇點的秘密，再把不能畫的圖修好。',
         see='拖動筆畫圖、換起點看成功或卡住、拿掉一條線修好圖、3 個操作關卡（梯形圖、七橋拆一座橋、星形加一條線）', deep='七橋問題、歐拉公式、路線設計', classes='PI1A／PK3D／PI2A',
         desc='用筆一筆畫圖，發現能一筆畫的圖奇點只有 0 或 2 個，再動手修好不能畫的圖——小學圖論入門互動單元。',
         art=STROKE_ART),
    dict(slug='time-axis', title='時間軸統籌：同時進行', grade='小學', area='應用問題', mins='約 9 分鐘', libs=APP, css=APPCSS,
         blurb='把工作方塊拖進時間軸：機器自己做的時候，人去做別的事。再試有先後順序的咖哩飯、煎魚，和四個人過橋，找出最快的方法。',
         see='拖方塊排時間軸、咖哩飯先後順序、煎魚鍋位、3 個操作關卡（泡茶、四人過橋、煎 5 條魚）', deep='合理下料、最短時間排程、買票與運費最省', classes='PK1A／PI1A',
         desc='把洗衣、煮飯、煎魚排進時間軸，發現讓機器和人同時進行、鍋子不空著，總時間才會最短——小學統籌互動單元。',
         art=TIME_ART),
    dict(slug='perp-bisector', title='垂直平分線與外心', grade='國中', area='幾何', mins='約 9 分鐘', libs=APP, css=APPCSS,
         blurb='在格線上找出到 A、B 兩點一樣遠的點，它們排成一條線；再看三角形三條垂直平分線交在同一點，那就是外心。',
         see='格點吸附、找 5 個一樣遠的點、沿線拖動看直角與中點、拖 C 看三種三角形的外心、4 個操作關卡（消防站、直角與鈍角三角形）', deep='三角形的四心、尺規作圖、四點共圓', classes='J91A／J82S／J82A／J81S',
         desc='在格線上找出到兩點等距的點，發現垂直平分線，並用三條垂直平分線找出三角形的外心——國中幾何互動單元。',
         art=PERP_ART),
    dict(slug='line-intersect', title='兩條直線的交點＝聯立方程式的解', grade='國中', area='代數', mins='約 8 分鐘', libs=APP, css=APPCSS,
         blurb='拖動兩條直線，做出相交、平行、重合；再找一個同時在兩條線上的點，發現交點的座標同時滿足兩個方程式。',
         see='拖動直線看交點座標與方程式、找同時滿足兩式的點、3 個操作關卡（交在指定點、平行、重合）', deep='含參數的聯立方程式、直線系、線性規劃、直線與圓', classes='J71A／J71S／J72A／S101',
         desc='拖動兩條直線，看懂交點就是聯立方程式的解；平行無解、重合有無限多組解——國中代數互動單元。',
         art=LINE_ART),
    dict(slug='perimeter-slide', title='周長問題：把凹進去的邊推出去', grade='小學', area='幾何', mins='約 8 分鐘', libs=APP, css=APPCSS,
         blurb='長方形剪掉一個角，周長會變嗎？拖動缺角、用滑桿把凹進去的邊推出去，發現橫的邊、直的邊各共多長；缺口開在中間時，周長又會怎麼變？',
         see='拖缺角看周長不變、滑桿把邊推成長方形、缺口在中間周長變長、3 個操作關卡（缺面積 6、周長 32、兩個缺角）', deep='直線形周長與割補、紙片切割的周長增加、圓與扇形周長', classes='PK1A／PI1A／PK4A／PK3B',
         desc='拖動長方形的缺角，發現缺在角落時周長不變，缺在邊的中間周長會變長——小學周長問題互動單元。',
         art=PERIM_ART),
    dict(slug='aux-line', title='畫輔助線：畫一條線，條件就串起來', grade='國中', area='幾何', mins='約 10 分鐘', libs=GEO + APP, css=APPCSS,
         blurb='平面幾何最基本的四種輔助線：過折點作平行線（豬腳）、作高畫出直角、延長一邊看外角、連接對角線。自己動手畫，條件就串起來了。',
         see='作平行線讓內錯角現形、拖動 P 驗證豬腳、作高找直角符號、延長線與外角、3 個操作關卡（另一個豬腳、鈍角三角形的高、連接對角線）', deep='平面閉折線、幾何小花（旋轉與補形）、角度追蹤、幾何證明', classes='J82A／PK2A／PI1A／J81A',
         desc='自己畫輔助線：作平行線、作垂線、延長線、連接兩點，看懂平面幾何解題時為什麼要畫輔助線——國中幾何互動單元。',
         art=AUX_ART),
]
SOON = []
