# -*- coding: utf-8 -*-
"""代數與乘法單元（配方法、乘法是陣列與面積、絕對值…）的中繼資料，由 build_pages.py 載入。"""

APPN = ['assets/play/play-app.js', 'assets/play/play-numline.js']
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
