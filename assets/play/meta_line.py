# -*- coding: utf-8 -*-
"""高中解析幾何單元（直線方程、圓的方程、圓與直線、兩圓）的中繼資料，由 build_pages.py 載入。"""

APPV = ['assets/play/play-app.js', 'assets/play/play-fgraph.js', 'assets/play/play-vec.js']
APPCSS = ['assets/play/play-app.css']

LINE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="30" y1="104" x2="30" y2="14" stroke="#b9ad92" stroke-width="2"/><line x1="20" y1="104" x2="170" y2="104" stroke="#b9ad92" stroke-width="2"/>'
    '<line x1="30" y1="104" x2="150" y2="34" stroke="#2f6fdc" stroke-width="5"/><line x1="30" y1="104" x2="60" y2="104" stroke="#d29b1f" stroke-width="3" stroke-dasharray="6 4"/>'
    '<path d="M 62 104 A 32 32 0 0 0 56 88" fill="none" stroke="#1f9d55" stroke-width="3.5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">k ＝ tan α ＝ Δy ÷ Δx</text><text x="184" y="72" font-size="16" fill="#1f9d55">五種寫法，哪些不能用？</text><text x="184" y="104" font-size="15" fill="#d6336c">平行看截距、垂直 k₁k₂＝−1</text></g></svg>')

CSTD_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="30" y1="104" x2="30" y2="14" stroke="#b9ad92" stroke-width="2"/><line x1="20" y1="104" x2="170" y2="104" stroke="#b9ad92" stroke-width="2"/>'
    '<circle cx="100" cy="62" r="38" fill="rgba(47,111,220,.12)" stroke="#2f6fdc" stroke-width="5"/><circle cx="100" cy="62" r="5" fill="#2f6fdc"/><line x1="100" y1="62" x2="138" y2="62" stroke="#d29b1f" stroke-width="3" stroke-dasharray="6 4"/><circle cx="138" cy="62" r="5" fill="#d6336c"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="44" font-size="17" fill="#122548">(x − h)² ＋ (y − k)²</text><text x="184" y="76" font-size="17" fill="#122548">＝ r²</text><text x="184" y="108" font-size="15" fill="#d6336c">符號和圓心相反</text></g></svg>')
CGEN_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="30" y1="104" x2="30" y2="14" stroke="#b9ad92" stroke-width="2"/><line x1="20" y1="104" x2="170" y2="104" stroke="#b9ad92" stroke-width="2"/>'
    '<circle cx="90" cy="62" r="40" fill="none" stroke="#2f6fdc" stroke-width="4"/><circle cx="90" cy="62" r="24" fill="none" stroke="#2f6fdc" stroke-width="4" opacity=".6"/><circle cx="90" cy="62" r="9" fill="none" stroke="#2f6fdc" stroke-width="4" opacity=".35"/><circle cx="90" cy="62" r="4" fill="#d29b1f"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">x²＋y²＋Dx＋Ey＋F＝0</text><text x="184" y="72" font-size="15" fill="#1f9d55">圓心 (−D/2, −E/2)</text><text x="184" y="104" font-size="15" fill="#d6336c">D²＋E²−4F ＞ 0 才是圓</text></g></svg>')

CLINE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="90" cy="65" r="42" fill="rgba(47,111,220,.1)" stroke="#2f6fdc" stroke-width="4"/><line x1="30" y1="40" x2="150" y2="40" stroke="#d6336c" stroke-width="4"/>'
    '<line x1="90" y1="65" x2="90" y2="40" stroke="#d29b1f" stroke-width="3" stroke-dasharray="5 4"/><line x1="90" y1="65" x2="123" y2="40" stroke="#8a8470" stroke-width="2"/><circle cx="90" cy="65" r="3.5" fill="#122548"/><rect x="90" y="40" width="9" height="9" fill="none" stroke="#122548" stroke-width="2"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">d ＞ r 離、＝ r 切、＜ r 交</text><text x="184" y="72" font-size="16" fill="#1f9d55">弦長 ＝ 2√(r² − d²)</text><text x="184" y="104" font-size="15" fill="#d6336c">圓外一點 2 條切線</text></g></svg>')

CCIRC_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><circle cx="70" cy="65" r="38" fill="rgba(47,111,220,.1)" stroke="#2f6fdc" stroke-width="4"/><circle cx="120" cy="65" r="30" fill="rgba(214,51,108,.1)" stroke="#d6336c" stroke-width="4"/>'
    '<line x1="95" y1="38" x2="95" y2="92" stroke="#7c4dbd" stroke-width="3" stroke-dasharray="5 4"/><circle cx="70" cy="65" r="3.5" fill="#2f6fdc"/><circle cx="120" cy="65" r="3.5" fill="#d6336c"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#122548">d 比 r₁＋r₂、|r₁−r₂|</text><text x="184" y="72" font-size="16" fill="#d29b1f">公切線 4、3、2、1、0 條</text><text x="184" y="104" font-size="15" fill="#7c4dbd">兩圓相減 ＝ 公共弦</text></g></svg>')

ENTRIES = [
    dict(slug='line-eq', title='直線方程：斜率、五種形式與兩線關係', grade='高中', area='代數', mins='約 12 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動兩個點看傾斜角與斜率（水平線 0、鉛直線沒有）；同一條線的五種寫法同步轉換，看哪些「不能用」；轉動 L₂ 看平行、重合、垂直與夾角。',
         see='拖 A、B 看傾斜角與斜率、五種形式同步轉換、轉動 L₂ 看兩線關係、4 個操作關卡（斜率 −1/2、一般式、平行、垂直）', deep='點到直線的距離、兩平行線的距離、線性規劃', classes='S101',
         desc='拖動兩個點看直線的傾斜角、斜率，五種方程式形式與兩條直線的平行、垂直——高中解析幾何互動單元。',
         art=LINE_ART),
    dict(slug='circle-std', title='圓的方程（一）：標準式', grade='高中', area='代數', mins='約 10 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動圓心與圓上的點，方程式 (x − h)² ＋ (y − k)² ＝ r² 即時更新：括號裡的正負號和圓心相反，右邊是 r² 不是 r。',
         see='拖圓心看正負號、拖圓上的點看 r² 與 r、3 個操作關卡（照方程式調出圓、圓心加通過原點、與兩軸相切）', deep='三點定圓、圓的參數式、軌跡問題', classes='S101',
         desc='拖動圓心與半徑，看圓的標準式 (x−h)²+(y−k)²=r² 怎麼變——高中解析幾何互動單元。',
         art=CSTD_ART),
    dict(slug='circle-gen', title='圓的方程（二）：一般式與配方', grade='高中', area='代數', mins='約 10 分鐘', libs=APPV, css=APPCSS,
         blurb='調 D、E、F 三個滑桿，看一般式配方成標準式；F 越大圓越小，縮成一點再消失，這就是 D²＋E²−4F 的意義。',
         see='調 D、E、F 看配方與圓、預測 x²＋y²＋2x＋2y＋5＝0 是不是圓、3 個操作關卡（圓心加半徑、縮成一點、通過原點）', deep='三點定圓、圓系方程式、軌跡問題', classes='S101',
         desc='調整圓的一般式 D、E、F，看配方與圓心半徑，D²+E²−4F>0 才是圓——高中解析幾何互動單元。',
         art=CGEN_ART),
    dict(slug='circle-line', title='圓與直線的關係', grade='高中', area='代數', mins='約 12 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動直線看圓心到直線的距離 d 與半徑 r 比大小；看半徑、d、半弦的直角三角形得到弦長；拖動一個點數出切線有 2、1、0 條。',
         see='拖直線看相離相切相交與判別式、直角三角形與弦長、拖 Q 數切線、3 個操作關卡（恰好相切、弦長 8、過圓外一點的兩條切線）', deep='切線長公式、最短距離與最長距離、圓的切線方程式', classes='S101',
         desc='拖動直線看 d 與 r 的大小、弦長公式與圓外一點的兩條切線——高中解析幾何互動單元。',
         art=CLINE_ART),
    dict(slug='circle-circle', title='兩圓之間的關係', grade='高中', area='代數', mins='約 12 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動第二個圓的圓心與半徑，看圓心距 d 與 r₁＋r₂、|r₁−r₂| 比大小，數出 4、3、2、1、0 條公切線；兩圓方程式相減就是公共弦所在的直線。',
         see='拖 C₂ 與半徑看五種關係與公切線、兩圓相減得到公共弦、3 個操作關卡（外切、內切、公共弦落在 y 軸）', deep='根軸與圓冪、圓系方程式、阿波羅尼斯圓', classes='S101',
         desc='拖動兩圓看外離、外切、相交、內切、內含與公切線條數，以及兩圓相減的公共弦——高中解析幾何互動單元。',
         art=CCIRC_ART),
]
SOON = []
