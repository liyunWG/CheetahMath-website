# -*- coding: utf-8 -*-
"""排列組合（基本計數）單元的中繼資料，由 build_pages.py 載入。"""
LIBS = ['assets/play/play-count.js']
CSS = ['assets/play/play-count.css']


def tree_art():
    return ('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#b9ad92" stroke-width="2" fill="none"><path d="M30 65 L90 30 L150 15 M90 30 L150 45 M30 65 L90 100 L150 85 M90 100 L150 115 M150 15 L210 8 M150 15 L210 24 M150 45 L210 40 M150 45 L210 56"/></g>'
            '<g fill="#2f6fdc"><circle cx="90" cy="30" r="9"/><circle cx="150" cy="15" r="9"/><circle cx="150" cy="85" r="9" fill="#d6336c"/></g><g fill="#d6336c"><circle cx="150" cy="45" r="9"/><circle cx="90" cy="100" r="9"/><circle cx="150" cy="115" r="9"/></g>'
            '<circle cx="30" cy="65" r="11" fill="#122548"/><g fill="none" stroke="#d29b1f" stroke-width="3"><circle cx="210" cy="8" r="7"/><circle cx="210" cy="24" r="7"/><circle cx="210" cy="40" r="7"/><circle cx="210" cy="56" r="7"/></g><text x="250" y="70" font-family="sans-serif" font-weight="800" font-size="30" fill="#122548">10</text></svg>')


def boxes_art(nums, res):
    out = '<svg viewBox="0 0 320 130" aria-hidden="true">'
    x = 14
    for i, n in enumerate(nums):
        out += '<rect x="%d" y="40" width="54" height="54" rx="12" fill="#fff4d5" stroke="#b99348" stroke-width="3"/><text x="%d" y="76" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="28" fill="#122548">%s</text>' % (x, x + 27, n)
        x += 54
        if i < len(nums) - 1:
            out += '<text x="%d" y="76" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="22" fill="#8a7f68">×</text>' % (x + 11)
            x += 22
    out += '<text x="%d" y="76" font-family="sans-serif" font-weight="800" font-size="26" fill="#1f9d55">＝ %s</text></svg>' % (x + 4, res)
    return out


def comb_art():
    import math
    pts = [(80 + 42 * math.cos(-math.pi / 2 + i * 2 * math.pi / 5), 66 + 42 * math.sin(-math.pi / 2 + i * 2 * math.pi / 5)) for i in range(5)]
    out = '<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#1f9d55" stroke-width="2.5">'
    for i in range(5):
        for j in range(i + 1, 5):
            out += '<line x1="%.0f" y1="%.0f" x2="%.0f" y2="%.0f"/>' % (pts[i][0], pts[i][1], pts[j][0], pts[j][1])
    out += '</g>'
    for p in pts:
        out += '<circle cx="%.0f" cy="%.0f" r="9" fill="#122548" stroke="#fff" stroke-width="2"/>' % p
    out += '<text x="150" y="74" font-family="sans-serif" font-weight="800" font-size="26" fill="#122548">C(5,2) ＝ 10</text></svg>'
    return out


def choco_art():
    out = '<svg viewBox="0 0 320 130" aria-hidden="true">'
    for i in range(5):
        out += '<rect x="%d" y="30" width="44" height="44" rx="8" fill="%s" stroke="%s" stroke-width="3"/>' % (20 + i * 50 + (6 if i > 1 else 0) + (6 if i > 3 else 0), '#e8f0ff' if i < 2 else '#ffe8f0' if i < 4 else '#e8f0ff', '#2f6fdc' if i < 2 or i == 4 else '#d6336c')
    for i in range(4):
        out += '<rect x="%d" y="86" width="28" height="26" rx="8" fill="#fff7e0" stroke="#d29b1f" stroke-width="2"/>' % (52 + i * 50 + (6 if i > 0 else 0) + (6 if i > 2 else 0))
    out += '<text x="278" y="64" font-family="sans-serif" font-weight="800" font-size="26" fill="#122548">2⁴</text></svg>'
    return out


ENTRIES = [
    dict(slug='count-tree', title='樹形圖與排隊', grade='小學', area='排列組合', mins='約 7 分鐘',
         blurb='用可以點開的樹，一場一場分出羽球賽的所有勝負情形；再用同樣的想法算排隊與立方體最短路徑。',
         see='可展開的樹形圖、立方體走稜線、n 人排隊的階乘', deep='只畫一半再乘 2、最短路徑＝排列有重複、遞迴、字典排列', classes='宗翰講義：基本計數／排組原理；PK1A 字典排列',
         desc='用可以點開的樹形圖數出所有勝負情形，再學排隊與階乘——小學高年級到國中計數互動單元。', art=tree_art(), libs=LIBS, css=CSS),
    dict(slug='count-multiply', title='乘法原理', grade='小學', area='排列組合', mins='約 9 分鐘',
         blurb='每一步都要做，就把選擇數連乘：從數對、路線、信號燈箱，一路玩到糖果分配、因數個數與塗色。',
         see='選項盒子、可調路數的路線圖、燈泡開關、糖果分配、塗色怪獸', deep='看縫不看顆、百盞燈與完全平方數、插板法、街道路線每區選一條橫街', classes='宗翰講義：基本計數／排組原理；PK3D 插板法；PK1A 整數分拆',
         desc='用選項盒子、路線圖與塗色理解乘法原理：每一步都要做就連乘——小學高年級到國中計數互動單元。', art=boxes_art(['3', '2', '4'], '24'), libs=LIBS, css=CSS),
    dict(slug='count-add', title='加法原理與標數法', grade='小學', area='排列組合', mins='約 9 分鐘',
         blurb='什麼時候乘、什麼時候加？用分類數路線、點路口標數，再用遞迴算出青蛙跳石塊。',
         see='乘或加的判斷、A→D 路線分類、可點的路口標數網格、青蛙跳石塊', deep='逐站累加、遞迴與一般式、整數分拆、富比尼原理', classes='宗翰講義：基本計數／排組原理；PK1A 整數分拆；A1012prep 富比尼原理',
         desc='用分類與標數法學加法原理：路線分類、路口標數、青蛙跳石塊與遞迴——小學高年級到國中計數互動單元。', art=boxes_art(['8', '9'], '17').replace('×', '＋'), libs=LIBS, css=CSS),
    dict(slug='count-comb', title='組合與算兩次', grade='國中', area='排列組合', mins='約 10 分鐘',
         blurb='從握手問題與循環賽出發，先排順序再除掉重複，推出 C(n,2)；再用「選線」數三角形、矩形，最後處理兩對情侶的相鄰座位。',
         see='點兩隊連線、選座位一對一、選線圍三角形與矩形、綁塊與鬆綁', deep='算兩次（富比尼）、綁塊與鬆綁、插板法、組合恆等式', classes='宗翰講義：基本計數／排組原理；PK3D 插板法；A1012prep 富比尼原理',
         desc='用握手問題、選座位、選線數圖形理解組合 C(n,k) 與「算兩次」——國中計數互動單元。', art=comb_art(), libs=LIBS, css=CSS),
    dict(slug='count-perm', title='排列', grade='國中', area='排列組合', mins='約 10 分鐘',
         blurb='把「名額」依序分給不同的人：從挑人排座位開始，到相鄰要綁塊、不相鄰用扣除或插空。',
         see='點人填座位、三個故事同一種結構、綁成一塊、插空選位置', deep='正難則反、插空法、圓桌排列、字典排列、錯排與排容原理', classes='宗翰講義：基本計數／排組原理；PK1A 字典排列；A1012prep 排容原理',
         desc='用挑人排座位、綁塊與插空理解排列：P(n,k)、相鄰與不相鄰——國中計數互動單元。', art=boxes_art(['5', '4', '3'], '60'), libs=LIBS, css=CSS),
    dict(slug='count-bijection', title='一一對應與換個說法', grade='國中', area='排列組合', mins='約 11 分鐘',
         blurb='難數的東西，換成好數的：巧克力看縫不看顆、賽程補成固定 5 局、路徑排成一列、三角格裡的平行四邊形。',
         see='可切可連的巧克力、補寫賽程、排成一列、三角格點線段、分層窮舉', deep='富比尼算兩次、插板法、反射原理、Fubini 雙重計數', classes='宗翰講義：基本計數／排組原理；PK3D 插板法；A1012prep 富比尼原理',
         desc='用一一對應把難數的題目換成好數的：巧克力與縫、補寫賽程、排成一列——國中資優計數互動單元。', art=choco_art(), libs=LIBS, css=CSS),
]
SOON = []
