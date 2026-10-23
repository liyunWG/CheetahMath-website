# -*- coding: utf-8 -*-
"""高中三角函數單元（單位圓範圍、a sin(bx)+c、誘導公式、正弦定理解的個數）的中繼資料，由 build_pages.py 載入。"""

APP = ['assets/play/play-app.js']
APPF = ['assets/play/play-app.js', 'assets/play/play-fgraph.js']
APPCSS = ['assets/play/play-app.css']

RANGE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="90" cy="65" r="52" fill="none" stroke="#2a3f6e" stroke-width="3"/><line x1="26" y1="65" x2="154" y2="65" stroke="#b9ad92" stroke-width="2"/><line x1="90" y1="8" x2="90" y2="122" stroke="#b9ad92" stroke-width="2"/>'
    '<line x1="90" y1="65" x2="125" y2="26" stroke="#122548" stroke-width="3.5"/><circle cx="125" cy="26" r="8" fill="#5fe3b4" stroke="#fff" stroke-width="3"/>'
    '<line x1="142" y1="8" x2="142" y2="122" stroke="#d29b1f" stroke-width="2" stroke-dasharray="5 4"/><line x1="90" y1="65" x2="142" y2="6" stroke="#d29b1f" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="176" y="40" font-size="16" fill="#d6336c">sin、cos：−1 到 1</text><text x="176" y="72" font-size="16" fill="#8a6410">tan：可以無限大</text><text x="176" y="104" font-size="14" fill="#122548">半徑 ＝ 1，影子不出圈</text></g></svg>')
WAVE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="70" x2="300" y2="70" stroke="#6d6250" stroke-width="2"/>'
    '<g stroke-width="2.5" stroke-dasharray="6 5"><line x1="20" y1="24" x2="300" y2="24" stroke="#1f9d55"/><line x1="20" y1="106" x2="300" y2="106" stroke="#d6336c"/></g>'
    '<path d="M30 70 Q70 -4 110 70 T190 70 T270 70" fill="none" stroke="#2f6fdc" stroke-width="4.5" stroke-linecap="round"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="206" y="18" font-size="15" fill="#1f9d55">最大 c ＋ |a|</text><text x="206" y="124" font-size="15" fill="#d6336c">最小 c − |a|</text></g></svg>')
REDUCE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="90" cy="65" r="52" fill="none" stroke="#2a3f6e" stroke-width="3"/><line x1="26" y1="65" x2="154" y2="65" stroke="#b9ad92" stroke-width="2"/><line x1="90" y1="8" x2="90" y2="122" stroke="#b9ad92" stroke-width="2"/>'
    '<line x1="90" y1="65" x2="135" y2="35" stroke="#2f6fdc" stroke-width="3.5"/><line x1="90" y1="65" x2="45" y2="35" stroke="#d6336c" stroke-width="3.5"/><line x1="135" y1="35" x2="45" y2="35" stroke="#b9ad92" stroke-width="2" stroke-dasharray="5 4"/>'
    '<circle cx="135" cy="35" r="7" fill="#2f6fdc"/><circle cx="45" cy="35" r="7" fill="#d6336c"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="176" y="42" font-size="16" fill="#122548">奇變偶不變</text><text x="176" y="74" font-size="16" fill="#1f9d55">符號看象限</text><text x="176" y="106" font-size="14" fill="#d6336c">sin(180° − α) ＝ sin α</text></g></svg>')
CASES_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="104" x2="300" y2="104" stroke="#6d6250" stroke-width="2"/><line x1="40" y1="104" x2="140" y2="46" stroke="#2f6fdc" stroke-width="4"/>'
    '<circle cx="140" cy="46" r="40" fill="rgba(210,155,31,.1)" stroke="#d29b1f" stroke-width="3" stroke-dasharray="6 5"/>'
    '<circle cx="110" cy="104" r="7" fill="#d6336c" stroke="#fff" stroke-width="2.5"/><circle cx="170" cy="104" r="7" fill="#d6336c" stroke="#fff" stroke-width="2.5"/><circle cx="140" cy="46" r="6" fill="#2f6fdc"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="206" y="44" font-size="16" fill="#122548">a 在 h 與 b 之間</text><text x="206" y="72" font-size="18" fill="#d6336c">2 個三角形</text><text x="206" y="104" font-size="14" fill="#8a6410">0、1、2 個都可能</text></g></svg>')

ENTRIES = [
    dict(slug='trig-range', title='單位圓：sin、cos 的範圍與 tan 的無限', grade='高中', area='三角函數', mins='約 9 分鐘', libs=APP, css=APPCSS,
         blurb='拖動單位圓上的 P，看 sin、cos 的影子永遠不出圓；再用 x＝1 的切線看 tan 為什麼可以無限大，90° 時不存在；最後看倒數 sec。',
         see='拖 P 繞圓看座標影子、tan 的切線截距、sec＝1/cos、3 個操作關卡（sin＝0.5、cos 最小、tan＝1）', deep='三角函數圖形與最大最小值、反三角函數、三角不等式', classes='S102／S111',
         desc='在單位圓上拖動點 P，看 sin、cos 只在 −1 到 1 之間，tan 可以任意大——高中三角函數的範圍互動單元。',
         art=RANGE_ART),
    dict(slug='trig-wave', title='y＝a sin(bx)＋c 的最大最小值與週期', grade='高中', area='三角函數', mins='約 9 分鐘', libs=APPF, css=APPCSS,
         blurb='拉動 a、b、c 三個滑桿，看波的最高、最低和週期怎麼跟著變：最大 c＋|a|、最小 c−|a|，b 只改週期、不改範圍。',
         see='拉 a、c 看最高最低線、拉 b 看週期、3 個操作關卡（對準虛線、依條件調出、a 取負）', deep='疊合 a sin x＋b cos x、相位平移、三角函數的最大最小值應用', classes='S102／S111',
         desc='拉動 a、b、c，發現 y＝a sin(bx)＋c 的最大值 c＋|a|、最小值 c−|a|、週期 360°÷|b|——高中三角函數圖形互動單元。',
         art=WAVE_ART),
    dict(slug='trig-reduction', title='誘導公式：奇變偶不變，符號看象限', grade='高中', area='三角函數', mins='約 10 分鐘', libs=APP, css=APPCSS,
         blurb='先用單位圓上的對稱點看 −α、180°−α、180°＋α；再每次轉 90°，看函數名什麼時候要變；最後判斷「變不變」「正負」，不用死背口訣。',
         see='拖 P 看四種對稱點 Q、每次轉 90° 看 x y 互換、3 個操作關卡（sin(180°＋α)、cos(270°＋α)、sin(270°−α)）', deep='和角公式、三角函數化簡與求值、圖形平移', classes='S111／S102',
         desc='用單位圓的對稱與 90° 旋轉看懂誘導公式：奇變偶不變，符號看象限——高中三角函數互動單元。',
         art=REDUCE_ART),
    dict(slug='trig-sine-cases', title='正弦定理：三角形解的個數', grade='高中', area='三角函數', mins='約 10 分鐘', libs=APP, css=APPCSS,
         blurb='已知兩邊和其中一邊的對角，拉動 a 用圓規掃描，數圓和射線的交點，發現三角形可能 0、1、2 個，並用 h＝b sin A 與 b 兩個刻度歸納；再看鈍角 A。',
         see='拉 a 數交點、h 與 b 分出四種情形、鈍角 A、3 個操作關卡（剛好相切、兩個三角形、鈍角 A）', deep='三角形面積公式、正餘弦定理綜合、測量應用', classes='S102／S111',
         desc='用圓規掃描看正弦定理 SSA 的 0、1、2 個解，並用 h＝b sin A 與 b 歸納——高中解三角形互動單元。',
         art=CASES_ART),
]
SOON = []
