import os
# -*- coding: utf-8 -*-
"""遊戲區單元資料（由 build_pages.py 載入）。"""

ART_CUBE = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'games', 'art_cube.svg'), encoding='utf-8').read()

ART_VIEWS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'games', 'art_views.svg'), encoding='utf-8').read()

ENTRIES = [
    dict(slug='game-cube', title='魔術方塊', kind='game', grade='全年段', area='遊戲', mins='約 5 分鐘一局',
         blurb='在方塊上滑動轉一層、空白處拖曳轉整顆。2×2 暖身、3×3 中等與困難，每次都是新的隨機洗亂。',
         see='三個難度、倒數計時、不用提示拿三顆星；卡住時小獵會一步一步提示', deep='空間想像、逆向思考（洗亂幾步就反著走幾步）、規劃與耐心',
         classes='', desc='獵豹玩中學：魔術方塊遊戲，2×2 暖身、3×3 中等與困難，隨機洗亂永遠玩不完，手機滑動就能轉。',
         art=ART_CUBE, libs=['assets/play/play-3d.js', 'assets/play/play-game.js'], css=['assets/play/play-game.css']),
    dict(slug='game-views', title='三視圖', kind='game', grade='全年段', area='遊戲', mins='約 3 分鐘一題',
         blurb='看前視圖、右視圖、上視圖，用積木拼出三個方向看起來都對的立體；任何符合的立體都算對。題目依題號隨機產生，玩不完。',
         see='暖身 6 顆、中等 9 顆、困難 12 顆；練習不計時，或挑戰計時拿星（交卷錯一次罰 30 秒）；成功後揭曉共有幾種拼法、最少最多幾顆', deep='空間想像、三視圖判讀、從限制條件推理（最少／最多）',
         classes='', desc='獵豹玩中學：三視圖遊戲，用積木拼出前視圖、右視圖、上視圖都對的立體，三種難度、隨機出題、可練習也可計時挑戰。',
         art=ART_VIEWS, libs=['assets/play/play-game.js', 'assets/play/games/views-rules.js'], css=['assets/play/play-game.css']),
]
