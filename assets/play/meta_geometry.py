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
]
SOON = []
