# -*- coding: utf-8 -*-
"""高中平面向量單元（加減與係數積、內積與投影、平行垂直與面積）的中繼資料，由 build_pages.py 載入。"""

APPV = ['assets/play/play-app.js', 'assets/play/play-fgraph.js', 'assets/play/play-vec.js']
APPCSS = ['assets/play/play-app.css']

ADD_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><defs><marker id="va1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2f6fdc"/></marker><marker id="va2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#d6336c"/></marker><marker id="va3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1f9d55"/></marker></defs>'
    '<line x1="30" y1="104" x2="30" y2="14" stroke="#b9ad92" stroke-width="2"/><line x1="20" y1="104" x2="170" y2="104" stroke="#b9ad92" stroke-width="2"/>'
    '<line x1="30" y1="104" x2="110" y2="74" stroke="#2f6fdc" stroke-width="5" marker-end="url(#va1)"/><line x1="110" y1="74" x2="140" y2="24" stroke="#d6336c" stroke-width="5" stroke-dasharray="7 5" marker-end="url(#va2)"/><line x1="30" y1="104" x2="138" y2="30" stroke="#1f9d55" stroke-width="7" marker-end="url(#va3)"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="44" font-size="17" fill="#122548">頭尾相接：a ＋ b</text><text x="184" y="76" font-size="16" fill="#d6336c">a − b：從 b 指向 a</text><text x="184" y="108" font-size="16" fill="#1f9d55">k·a：同線，k 負反向</text></g></svg>')
DOT_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><line x1="30" y1="104" x2="170" y2="104" stroke="#b9ad92" stroke-width="2"/><line x1="30" y1="104" x2="150" y2="24" stroke="#2f6fdc" stroke-width="5"/><line x1="30" y1="104" x2="120" y2="64" stroke="#d6336c" stroke-width="5"/>'
    '<line x1="120" y1="64" x2="102" y2="56" stroke="#b9ad92" stroke-width="2"/><line x1="30" y1="104" x2="102" y2="56" stroke="#d29b1f" stroke-width="9" opacity=".6"/><path d="M 56 91 A 28 28 0 0 0 58 87" fill="none" stroke="#d29b1f" stroke-width="3"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="44" font-size="17" fill="#122548">a·b ＝ |a||b|cos θ</text><text x="184" y="76" font-size="17" fill="#1f9d55">＝ x₁x₂ ＋ y₁y₂</text><text x="184" y="108" font-size="15" fill="#8a6410">投影長 ＝ a·b ÷ |a|</text></g></svg>')
PARA_ART = (
    '<svg viewBox="0 0 320 130" aria-hidden="true"><polygon points="30,104 110,74 150,24 70,54" fill="rgba(31,157,85,.25)" stroke="#1f9d55" stroke-width="3"/>'
    '<line x1="30" y1="104" x2="110" y2="74" stroke="#2f6fdc" stroke-width="5"/><line x1="30" y1="104" x2="70" y2="54" stroke="#d6336c" stroke-width="5"/><rect x="30" y="92" width="12" height="12" fill="none" stroke="#122548" stroke-width="2.5" transform="rotate(-20 30 104)"/>'
    '<g font-family="sans-serif" font-weight="800"><text x="184" y="40" font-size="16" fill="#1f9d55">平行：x₁y₂ − x₂y₁ ＝ 0</text><text x="184" y="72" font-size="16" fill="#d6336c">垂直：x₁x₂ ＋ y₁y₂ ＝ 0</text><text x="184" y="104" font-size="15" fill="#122548">面積 ＝ |x₁y₂ − x₂y₁|</text></g></svg>')

ENTRIES = [
    dict(slug='vec-addsub', title='向量的加、減與係數積', grade='高中', area='代數', mins='約 10 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動 a、b 的終點，看加法頭尾相接、減法是「從 b 指向 a」、k 倍的向量永遠在同一條線上；再用 s·a＋t·b 湊出目標。',
         see='拖 a、b 看 a＋b 與 a−b、拉 k 看 k·a、3 個操作關卡（拖 b 落在目標、s 和 t 湊出目標、a−b 等於目標）', deep='線性組合與基底、分點公式、向量與幾何證明', classes='S111',
         desc='拖動向量的終點，看加法頭尾相接、減法從 b 指向 a、係數積在同一條線上——高中平面向量互動單元。',
         art=ADD_ART),
    dict(slug='vec-dot', title='向量的內積與投影', grade='高中', area='代數', mins='約 10 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動 b 看夾角 θ 和內積的正負、垂直時內積為 0；用投影看懂內積 ＝ |a| × 投影長，兩個公式永遠一樣。',
         see='拖 b 看夾角與內積、投影的正零負、3 個操作關卡（內積 0、長度固定時內積最大、投影長 3）', deep='柯西不等式、內積與餘弦定理、正射影與最短距離', classes='S111',
         desc='拖動向量看內積的正負與投影，a·b＝|a||b|cos θ＝x₁x₂＋y₁y₂——高中平面向量互動單元。',
         art=DOT_ART),
    dict(slug='vec-para-perp', title='向量的平行、垂直與面積', grade='高中', area='代數', mins='約 10 分鐘', libs=APPV, css=APPCSS,
         blurb='拖動 b 看平行四邊形面積：沿著平行 a 的線滑動面積不變，平行時壓扁成 0；兩盞指示燈告訴你平行（交叉）與垂直（內積）的條件。',
         see='拖 b 看面積、平行燈與垂直燈、3 個操作關卡（平行、垂直、面積恰好 6）', deep='三角形面積與行列式、向量外積、向量與幾何證明', classes='S111',
         desc='拖動向量看平行四邊形的面積，平行是 x₁y₂−x₂y₁＝0、垂直是 x₁x₂＋y₁y₂＝0——高中平面向量互動單元。',
         art=PARA_ART),
]
SOON = []
