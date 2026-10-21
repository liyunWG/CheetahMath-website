# -*- coding: utf-8 -*-
"""遊戲區單元資料（由 build_pages.py 載入）。"""

ART_CUBE = ('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#101216" stroke-width="2.5" stroke-linejoin="round">'
            '<polygon points="160,14 226,40 160,66 94,40" fill="#f5f5f0"/><polygon points="94,40 160,66 160,122 94,96" fill="#2fa35a"/><polygon points="226,40 160,66 160,122 226,96" fill="#d6343c"/></g>'
            '<g stroke="#101216" stroke-width="1.5"><line x1="116" y1="22" x2="182" y2="48"/><line x1="138" y1="31" x2="204" y2="57"/><line x1="94" y1="59" x2="160" y2="85"/><line x1="94" y1="77" x2="160" y2="103"/><line x1="116" y1="49" x2="116" y2="105"/><line x1="138" y1="58" x2="138" y2="114"/>'
            '<line x1="182" y1="58" x2="182" y2="114"/><line x1="204" y1="49" x2="204" y2="105"/><line x1="160" y1="66" x2="226" y2="40" opacity="0"/></g>'
            '<g fill="#f2c230" stroke="#101216" stroke-width="1.5"><polygon points="182,48 204,57 182,66 160,57"/></g>'
            '<g font-family="sans-serif" font-weight="900" font-size="15" fill="#122548"><text x="250" y="52">↻</text><text x="34" y="100">↺</text></g></svg>')

ART_VIEWS = ('<svg viewBox="0 0 320 130" aria-hidden="true"><g stroke="#122548" stroke-width="2" stroke-linejoin="round">'
             '<polygon points="60,54 92,40 124,54 92,68" fill="#bcd6ff"/><polygon points="60,54 92,68 92,96 60,82" fill="#5b9bff"/><polygon points="124,54 92,68 92,96 124,82" fill="#3f7fe0"/>'
             '<polygon points="60,26 92,12 124,26 92,40" fill="#ffe7a1"/><polygon points="60,26 92,40 92,54 60,40" fill="#ffd166"/><polygon points="124,26 92,40 92,54 124,40" fill="#e6b33f"/></g>'
             '<g stroke="#122548" stroke-width="1.5" fill="#fff"><rect x="170" y="26" width="26" height="26"/><rect x="196" y="26" width="26" height="26" fill="#bcd6ff"/><rect x="170" y="52" width="26" height="26" fill="#bcd6ff"/><rect x="196" y="52" width="26" height="26" fill="#bcd6ff"/>'
             '<rect x="236" y="52" width="26" height="26" fill="#bcd6ff"/><rect x="262" y="52" width="26" height="26" fill="#bcd6ff"/><rect x="262" y="26" width="26" height="26" fill="#bcd6ff"/></g>'
             '<g font-family="sans-serif" font-weight="800" font-size="12" fill="#5a6477" text-anchor="middle"><text x="196" y="100">上視</text><text x="262" y="100">正視</text></g></svg>')

ENTRIES = [
    dict(slug='game-cube', title='魔術方塊', kind='game', grade='全年段', area='遊戲', mins='約 5 分鐘一局',
         blurb='在方塊上滑動轉一層、空白處拖曳轉整顆。2×2 暖身、3×3 中等與困難，每次都是新的隨機洗亂。',
         see='三個難度、倒數計時、不用提示拿三顆星；卡住時小獵會一步一步提示', deep='空間想像、逆向思考（洗亂幾步就反著走幾步）、規劃與耐心',
         classes='', desc='獵豹玩中學：魔術方塊遊戲，2×2 暖身、3×3 中等與困難，隨機洗亂永遠玩不完，手機滑動就能轉。',
         art=ART_CUBE, libs=['assets/play/play-3d.js', 'assets/play/play-game.js'], css=['assets/play/play-game.css']),
    dict(slug='game-views', title='三視圖', kind='game', grade='全年段', area='遊戲', mins='約 5 分鐘一局',
         blurb='看 3D 選三視圖、看三視圖選 3D、用三視圖蓋方塊，還有「最少最多幾塊」與「補一塊」。3 條命闖關，題目每次隨機。',
         see='暖身 3×3 選擇題、中等 3×3 重建、困難 4×4 變化題；每題倒數，連對有加成', deep='空間想像、三視圖判讀、從限制條件推理（最少／最多）',
         classes='', desc='獵豹玩中學：三視圖遊戲，看 3D 選三視圖、用三視圖蓋方塊、最少最多幾塊，三種難度，題目隨機永遠玩不完。',
         art=ART_VIEWS, libs=['assets/play/play-3d.js', 'assets/play/play-game.js'], css=['assets/play/play-game.css']),
]
