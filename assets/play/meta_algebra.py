# -*- coding: utf-8 -*-
"""代數與乘法單元（配方法、乘法是陣列與面積）的中繼資料，由 build_pages.py 載入。"""

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

ENTRIES = [
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
