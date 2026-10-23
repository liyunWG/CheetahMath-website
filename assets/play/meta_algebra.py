# -*- coding: utf-8 -*-
"""代數與乘法單元（配方法、乘法是陣列與面積、絕對值…）的中繼資料，由 build_pages.py 載入。"""

APPN = ['assets/play/play-app.js', 'assets/play/play-numline.js']
APPF = ['assets/play/play-app.js', 'assets/play/play-fgraph.js']
APPNF = ['assets/play/play-app.js', 'assets/play/play-numline.js', 'assets/play/play-fgraph.js']
APPCSS = ['assets/play/play-app.css']

COMPLETE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2.5" stroke-linejoin="round">'
    '<rect x="30" y="20" width="56" height="56" fill="rgba(47,111,220,.28)"/><rect x="86" y="20" width="28" height="56" fill="rgba(210,155,31,.4)"/>'
    '<rect x="30" y="76" width="56" height="28" fill="rgba(210,155,31,.4)"/><rect x="86" y="76" width="28" height="28" fill="rgba(31,157,85,.3)" stroke-dasharray="6 4"/></g>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="58" y="55" font-size="22" fill="#2f6fdc">x²</text><text x="100" y="54" font-size="14" fill="#8a6410">3x</text><text x="58" y="95" font-size="14" fill="#8a6410">3x</text><text x="100" y="95" font-size="14" fill="#1f9d55">9</text></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="150" y="52" font-size="18" fill="#122548">x² ＋ 6x ＋ 9</text><text x="150" y="86" font-size="22" fill="#d6336c">＝ (x ＋ 3)²</text></g></svg>')

ARRAY_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><g fill="#2f6fdc">'
    + ''.join('<circle cx="%d" cy="%d" r="7"/>' % (40 + i * 22, 28 + j * 22) for i in range(4) for j in range(3)) +
    '</g><rect x="26" y="14" width="92" height="70" fill="rgba(47,111,220,.1)" stroke="#2f6fdc" stroke-width="2" stroke-dasharray="6 4" rx="6"/>'
    '<g fill="#d6336c">' + ''.join('<circle cx="%d" cy="%d" r="7"/>' % (180 + i * 22, 22 + j * 22) for i in range(3) for j in range(4)) + '</g>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="72" y="116" font-size="20" fill="#122548">3 × 4</text><text x="214" y="116" font-size="20" fill="#122548">4 × 3</text><text x="136" y="68" font-size="24" fill="#122548">＝</text></g></svg>')

ABS1_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><rect x="24" y="64" width="136" height="14" fill="rgba(214,51,108,.28)"/><rect x="160" y="64" width="136" height="14" fill="rgba(31,157,85,.28)"/>'
    '<line x1="20" y1="71" x2="300" y2="71" stroke="#122548" stroke-width="3" stroke-linecap="round"/>'
    '<line x1="160" y1="26" x2="160" y2="71" stroke="#d29b1f" stroke-width="3" stroke-dasharray="6 5"/><circle cx="160" cy="71" r="7" fill="#1f9d55" stroke="#fff" stroke-width="2.5"/>'
    '<g stroke="#122548" stroke-width="2.5">' + ''.join('<line x1="%d" y1="64" x2="%d" y2="78"/>' % (x, x) for x in (60, 110, 210, 260)) + '</g>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="160" y="18" font-size="16" fill="#8a6410">零點 x ＝ 2</text>'
    '<text x="90" y="104" font-size="16" fill="#d6336c">x ＜ 2：2 − x</text><text x="232" y="104" font-size="16" fill="#1f9d55">x ≥ 2：x − 2</text>'
    '<text x="160" y="126" font-size="13" fill="#122548">|x − 2| ＝ 到 2 的距離</text></g></svg>')

ABS2_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><rect x="24" y="92" width="96" height="12" fill="rgba(214,51,108,.28)"/><rect x="120" y="92" width="80" height="12" fill="rgba(210,155,31,.38)"/><rect x="200" y="92" width="96" height="12" fill="rgba(31,157,85,.28)"/>'
    '<line x1="20" y1="98" x2="300" y2="98" stroke="#122548" stroke-width="3" stroke-linecap="round"/>'
    '<polyline points="24,12 120,60 200,60 296,12" fill="none" stroke="#2f6fdc" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>'
    '<g stroke="#d29b1f" stroke-width="2.5" stroke-dasharray="5 4"><line x1="120" y1="60" x2="120" y2="98"/><line x1="200" y1="60" x2="200" y2="98"/></g>'
    '<g fill="#1f9d55" stroke="#fff" stroke-width="2.5"><circle cx="120" cy="98" r="6"/><circle cx="200" cy="98" r="6"/></g>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="160" y="46" font-size="15" fill="#8a6410">中間一段：和 ＝ 3</text><text x="120" y="122" font-size="13" fill="#122548">零點 1</text><text x="200" y="122" font-size="13" fill="#122548">零點 4</text>'
    '<text x="62" y="30" font-size="13" fill="#d6336c">5 − 2x</text><text x="262" y="30" font-size="13" fill="#1f9d55">2x − 5</text></g></svg>')

LINEAR_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="86,118 114,118 100,92" fill="#cfc6ad"/>'
    '<line x1="22" y1="82" x2="178" y2="102" stroke="#122548" stroke-width="5" stroke-linecap="round"/>'
    '<rect x="34" y="52" width="30" height="28" rx="4" fill="rgba(47,111,220,.3)" stroke="#2f6fdc" stroke-width="2.5"/>'
    '<line x1="150" y1="98" x2="150" y2="58" stroke="#d6336c" stroke-width="2"/><circle cx="150" cy="40" r="20" fill="rgba(214,51,108,.28)" stroke="#d6336c" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="49" y="72" font-size="17" fill="#122548">3</text><text x="150" y="46" font-size="17" fill="#d6336c">−3</text></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="196" y="48" font-size="17" fill="#122548">3 ＜ 5</text><text x="196" y="80" font-size="17" fill="#d6336c">×(−1) 之後</text><text x="196" y="112" font-size="20" fill="#1f9d55">−3 ＞ −5</text></g></svg>')

QOPEN_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="100" x2="300" y2="100" stroke="#6d6250" stroke-width="2"/><line x1="160" y1="8" x2="160" y2="122" stroke="#6d6250" stroke-width="2"/>'
    '<path d="M110 12 Q160 188 210 12" fill="none" stroke="#2f6fdc" stroke-width="4.5" stroke-linecap="round"/>'
    '<path d="M138 12 Q160 150 182 12" fill="none" stroke="#d6336c" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 5"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="226" y="40" font-size="17" fill="#2f6fdc">a 小：胖</text><text x="226" y="66" font-size="17" fill="#d6336c">|a| 大：瘦</text><text x="226" y="116" font-size="15" fill="#122548">a ＜ 0 向下</text></g></svg>')

QVERTEX_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="104" x2="300" y2="104" stroke="#6d6250" stroke-width="2"/>'
    '<path d="M60 14 Q130 190 200 14" fill="none" stroke="#2f6fdc" stroke-width="4.5" stroke-linecap="round"/><line x1="130" y1="20" x2="130" y2="116" stroke="#b9ad92" stroke-width="2" stroke-dasharray="5 5"/>'
    '<circle cx="130" cy="101" r="9" fill="#5fe3b4" stroke="#fff" stroke-width="3"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="214" y="44" font-size="17" fill="#122548">頂點 (h, k)</text><text x="214" y="72" font-size="17" fill="#1f9d55">a ＞ 0：最小值 k</text><text x="214" y="100" font-size="17" fill="#d6336c">a ＜ 0：最大值 k</text></g></svg>')

QINTERVAL_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="104" x2="300" y2="104" stroke="#6d6250" stroke-width="2"/>'
    '<path d="M50 14 Q130 190 210 14" fill="none" stroke="#2f6fdc" stroke-width="3.5" stroke-linecap="round"/>'
    '<path d="M150 46 Q168 60 190 22" fill="none" stroke="#d6336c" stroke-width="6" stroke-linecap="round"/>'
    '<g stroke="#d6336c" stroke-width="2.5" stroke-dasharray="5 4"><line x1="150" y1="46" x2="150" y2="108"/><line x1="190" y1="22" x2="190" y2="108"/></g>'
    '<circle cx="150" cy="46" r="7" fill="#2f6fdc" stroke="#fff" stroke-width="2.5"/><circle cx="190" cy="22" r="7" fill="#1f9d55" stroke="#fff" stroke-width="2.5"/>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="150" y="124" font-size="15" fill="#d6336c">m</text><text x="190" y="124" font-size="15" fill="#d6336c">n</text></g>'
    '<g font-family="sans-serif" font-weight="800"><text x="226" y="48" font-size="16" fill="#122548">頂點在範圍外</text><text x="226" y="76" font-size="16" fill="#1f9d55">極值在端點</text></g></svg>')

QINEQ_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="70" x2="300" y2="70" stroke="#6d6250" stroke-width="2"/>'
    '<path d="M40 6 Q130 150 220 6" fill="none" stroke="#2f6fdc" stroke-width="4.5" stroke-linecap="round"/>'
    '<rect x="40" y="63" width="52" height="14" rx="6" fill="rgba(31,157,85,.4)"/><rect x="168" y="63" width="52" height="14" rx="6" fill="rgba(31,157,85,.4)"/><rect x="92" y="63" width="76" height="14" rx="6" fill="rgba(214,51,108,.35)"/>'
    '<circle cx="92" cy="70" r="7" fill="#fff" stroke="#122548" stroke-width="3"/><circle cx="168" cy="70" r="7" fill="#fff" stroke="#122548" stroke-width="3"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="236" y="44" font-size="16" fill="#1f9d55">上方：＞ 0</text><text x="236" y="72" font-size="16" fill="#d6336c">下方：＜ 0</text><text x="236" y="106" font-size="14" fill="#122548">看圖，不用背</text></g></svg>')

QDISC_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="64" x2="300" y2="64" stroke="#6d6250" stroke-width="2"/>'
    '<path d="M30 6 Q80 120 130 6" fill="none" stroke="#2f6fdc" stroke-width="3.5" stroke-linecap="round"/>'
    '<path d="M150 64 Q185 100 220 64" fill="none" stroke="#d29b1f" stroke-width="3.5" stroke-linecap="round"/>'
    '<path d="M240 10 Q270 60 300 10" fill="none" stroke="#d6336c" stroke-width="3.5" stroke-linecap="round"/>'
    '<circle cx="48" cy="64" r="5" fill="#d6336c"/><circle cx="112" cy="64" r="5" fill="#d6336c"/><circle cx="185" cy="64" r="5" fill="#d6336c"/>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle" font-size="15"><text x="80" y="104" fill="#1f9d55">D ＞ 0</text><text x="185" y="104" fill="#8a6410">D ＝ 0</text><text x="270" y="104" fill="#d6336c">D ＜ 0</text><text x="160" y="126" font-size="13" fill="#122548">2 個、1 個、0 個交點</text></g></svg>')

INTERVAL_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><rect x="70" y="68" width="150" height="14" fill="rgba(31,157,85,.4)"/>'
    '<line x1="20" y1="75" x2="300" y2="75" stroke="#122548" stroke-width="3" stroke-linecap="round"/>'
    '<circle cx="70" cy="75" r="9" fill="#1f9d55" stroke="#fff" stroke-width="3"/><circle cx="220" cy="75" r="9" fill="#fff" stroke="#1f9d55" stroke-width="4"/>'
    '<g font-family="sans-serif" font-weight="800" text-anchor="middle"><text x="145" y="40" font-size="26" fill="#122548">[ 1 , 4 )</text><text x="70" y="108" font-size="14" fill="#1f9d55">實心：含</text><text x="220" y="108" font-size="14" fill="#122548">空心：不含</text></g></svg>')

PIECE_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="20" y1="100" x2="300" y2="100" stroke="#6d6250" stroke-width="2"/><line x1="100" y1="10" x2="100" y2="120" stroke="#6d6250" stroke-width="2"/>'
    '<g fill="none" stroke="#2f6fdc" stroke-width="4.5" stroke-linecap="round"><line x1="30" y1="86" x2="100" y2="72"/><path d="M100 100 Q150 100 190 42"/><line x1="190" y1="42" x2="260" y2="42"/></g>'
    '<circle cx="100" cy="72" r="6" fill="#fff" stroke="#2f6fdc" stroke-width="3.5"/><circle cx="100" cy="100" r="6" fill="#2f6fdc"/><circle cx="190" cy="42" r="6" fill="#2f6fdc"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="206" y="26" font-size="14" fill="#122548">先看 x 在哪一段</text><text x="206" y="70" font-size="14" fill="#d6336c">空心：取不到</text><text x="206" y="90" font-size="14" fill="#1f9d55">實心：算它的</text></g></svg>')

ENTRIES = [
    dict(slug='abs-split', title='絕對值：零點把數線切成兩段', grade='國中', area='代數', mins='約 8 分鐘', libs=APPN, css=APPCSS,
         blurb='拖動數線上的 x，看 |x − 2| 在零點兩邊為什麼要用不同的方式去掉絕對值；自己找出零點，再解絕對值方程式，並學會檢查解有沒有落在那一段。',
         see='拖 x 看距離與正負、把零點拖到裡面等於 0 的位置、3 個操作關卡（|x−2|＝3、分段解 |x−2|＝2x−1、|2x−4|＝6）', deep='絕對值不等式、兩個絕對值、分段函數', classes='J71A／S101',
         desc='拖動數線上的 x，發現零點把數線切成兩段，每一段各自去掉絕對值，再檢查解有沒有落在那一段——國中絕對值互動單元。',
         art=ABS1_ART),
    dict(slug='abs-split-2', title='絕對值：兩個零點，數線切成三段', grade='高中', area='代數', mins='約 9 分鐘', libs=APPN, css=APPCSS,
         blurb='|x − 1| ＋ |x − 4| 有兩個零點，把數線切成三段。拖動 x 看折線怎麼走，發現中間一段和永遠是 3；再自己放零點、找出和最小的位置。',
         see='拖 x 看三段與折線、自己放兩個零點、3 個操作關卡（和＝5、找 3 個最小的位置、和＝8）', deep='絕對值不等式、分段函數圖形、距離和的最小值', classes='S101',
         desc='拖動 x 看 |x−1|＋|x−4| 的折線，發現兩個零點切成三段、中間一段和是常數——高中絕對值與分段討論互動單元。',
         art=ABS2_ART),
    dict(slug='linear-ineq', title='一元一次不等式：蹺蹺板與數線', grade='國中', area='代數', mins='約 9 分鐘', libs=APPN, css=APPCSS,
         blurb='砝碼和氣球的蹺蹺板，讓你親眼看到為什麼乘（除）負數不等號要反向；再在數線上找出解集合，並一步一步把 x 單獨留下，連 x 消失的兩種情形都弄懂。',
         see='蹺蹺板按鈕看不等號、拖 x 在數線上找解集合、3 個操作關卡（3x−5＜7、−2x＋3≥7、x 消失的兩題）', deep='含絕對值的不等式、聯立不等式、含參數的不等式', classes='J72A／J72S',
         desc='用砝碼與氣球的蹺蹺板看懂乘負數為什麼要反向，在數線上找出解集合，再一步步解一元一次不等式——國中代數互動單元。',
         art=LINEAR_ART),
    dict(slug='quad-open', title='二次函數：開口方向與大小', grade='高中', area='代數', mins='約 8 分鐘', libs=APPF, css=APPCSS,
         blurb='拉動 a 看拋物線的開口方向和胖瘦：正負管上下、|a| 管胖瘦；再拖動點 P(1, a)，發現 a 就是 x＝1 時的高度。',
         see='拉 a 滑桿看 y＝ax²、拖 P 控制 a、3 個操作關卡（a＝2、a＝−0.5、向下且比虛線更胖）', deep='頂點與極值、a b c 與圖形、判別式', classes='J91A／J91S／S101',
         desc='拉動 a 看 y＝ax² 的開口方向與胖瘦，發現 |a| 越大越瘦、a 的正負管上下——二次函數互動單元。',
         art=QOPEN_ART),
    dict(slug='quad-vertex', title='二次函數：頂點與最大最小值', grade='高中', area='代數', mins='約 9 分鐘', libs=APPF, css=APPCSS,
         blurb='拖動頂點 V 看 y＝(x−h)²＋k 怎麼變，發現頂點就是最低點；再拉 a 看開口向下時變成最高點，最後用拋球與對準虛線練習。',
         see='拖 V 看頂點式與展開式、拉 a 看最小值變最大值、3 個操作關卡（沿曲線找最低點、拋球最高點、拖 V 對準虛線）', deep='限定範圍的最大最小值、配方法求最值、應用題最值', classes='J91A／J91S／S101',
         desc='拖動頂點看 y＝a(x−h)²＋k，發現頂點是最低點或最高點，a 的正負決定是最小值還是最大值——二次函數互動單元。',
         art=QVERTEX_ART),
    dict(slug='quad-interval', title='二次函數：限定範圍的最大最小值', grade='高中', area='代數', mins='約 9 分鐘', libs=APPF, css=APPCSS,
         blurb='只看 [m, n] 這一段曲線：拖動兩個端點，看最高點、最低點出現在哪裡，發現頂點在不在範圍內，決定答案在頂點還是端點。',
         see='拖端點看最大最小點、湊齊最小值在左端／右端／頂點三種情形、3 個操作關卡', deep='含參數的區間最值、分類討論、恆成立問題', classes='S101／J91A／J91S',
         desc='拖動範圍的兩個端點，發現二次函數的最大最小值只在頂點或端點出現，先看頂點在不在範圍內——高中二次函數互動單元。',
         art=QINTERVAL_ART),
    dict(slug='quad-ineq', title='二次不等式：看拋物線的上方和下方', grade='高中', area='代數', mins='約 9 分鐘', libs=APPF, css=APPCSS,
         blurb='拖動 T 看拋物線在 x 軸的上方還是下方，發現「大於取兩邊、小於取中間」是看圖看出來的；把拋物線翻面，看解集合跟著反過來，再在數線上塗出解。',
         see='拖 T 看上下方、按鈕翻面、3 個操作關卡（塗出 ＜0、≥0、翻面後的 ＞0）', deep='判別式與恆成立、穿線法高次不等式、含參數的二次不等式', classes='S101',
         desc='看二次函數圖形在 x 軸的上方與下方，理解二次不等式的解集合，開口向下時整個反過來——高中二次不等式互動單元。',
         art=QINEQ_ART),
    dict(slug='quad-ineq-disc', title='二次不等式：判別式的三種情形', grade='高中', area='代數', mins='約 9 分鐘', libs=APPF, css=APPCSS,
         blurb='拉 k 讓拋物線上下平移，看它和 x 軸有 2 個、1 個、0 個交點，發現判別式 D 決定解集合是兩邊、除了一點、還是全部實數／無解；再翻面看開口向下。',
         see='拉 k 看交點與解、翻面、3 個操作關卡（全部實數、x≠2、−x²＋4x−k≥0 只有 x＝2）', deep='恆成立問題、含參數的判別式、根的分布', classes='S101／J91A／J91S',
         desc='用拋物線和 x 軸的交點個數看懂判別式，解二次不等式時 D＝0、D＜0 的特殊情形——高中二次不等式互動單元。',
         art=QDISC_ART),
    dict(slug='interval-notation', title='函數與區間：區間符號與定義域', grade='高中', area='代數', mins='約 9 分鐘', libs=APPNF, css=APPCSS,
         blurb='拖動區間的兩個端點，切換實心與空心，看中括號、小括號和「t 在不在區間裡」；再用 √(x−1) 找出定義域，並把 |x|≤2 寫成區間。',
         see='拖端點與測試點、實心空心按鈕、√(x−1) 定義域、3 個操作關卡（[2,5)、(−∞,3]、|x|≤2）', deep='值域與最大最小值、區間的交集聯集、絕對值不等式', classes='S101',
         desc='用拖動端點看懂區間符號：實心含端點、空心不含端點，無限一律用小括號，再找函數的定義域——高中函數互動單元。',
         art=INTERVAL_ART),
    dict(slug='piecewise-fn', title='函數與區間：分段函數', grade='高中', area='代數', mins='約 9 分鐘', libs=APPF, css=APPCSS,
         blurb='拖動 x，看它落在哪一段，就用哪一段的公式；觀察交界點的空心點與實心點，調 c 讓兩段接起來，最後把 |x−2| 寫成分段函數。',
         see='拖 x 看三段公式與圖、調 c 看接不接得起來、3 個操作關卡（f(x)＝1、f(x)＝4、|x−2| 的兩個解）', deep='連續與不連續、分段函數的最大最小值、取整數函數', classes='S101',
         desc='拖動 x 看分段函數：先判斷 x 在哪一段再代值，交界的空心點與實心點，兩段值一樣才接得起來——高中函數互動單元。',
         art=PIECE_ART),
    dict(slug='completing-square', title='配方法＝補成正方形', grade='國中', area='代數', mins='約 9 分鐘',
         blurb='把 x²＋6x 的長條從中間切開，一半放旁邊、一半轉到下面，缺的角落就是要補的數；再用它找出拋物線的最低點、解方程式。',
         see='拖動剪刀切長條、調整小方塊補滿缺角、在拋物線上找最低點、3 個操作關卡（頂點、頂點、解 x²−4x−5＝0）', deep='配方法解一元二次方程式、二次函數頂點與最值、判別式', classes='J81A／J81S／J91A／J91S',
         desc='把 x²＋6x 切開重排，補上缺角就是完整正方形，再用配方法找二次函數的最低點與方程式的解——國中代數互動單元。',
         art=COMPLETE_ART),
    dict(slug='array-area', title='乘法是陣列與面積', grade='小學', area='代數', mins='約 8 分鐘',
         blurb='把點排成長方形陣列：3×4 和 4×3 轉 90° 一樣多；正方形陣列是平方數；一刀切開就是分配律；大正方形切四塊就是 (a＋b)²。',
         see='拖動陣列找出 12 點的所有排法、一圈一圈長出平方數、切開陣列拆成好算的乘法、(a＋b)² 切四塊、點與面積一鍵切換', deep='完全平方數、方陣問題、乘法公式', classes='PK2A／PI2A／PK2B／PI2B／J72A',
         desc='用點陣看懂乘法：行列互換、平方數、分配律與面積，再切出 (a＋b)²——小學到國中乘法互動單元。',
         art=ARRAY_ART),
]
SOON = []
