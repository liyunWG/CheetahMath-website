/**
 * 獵豹錦囊 YouTube 影片資料（前端載入用）
 *
 * ⚠️ 這是「產物檔」，由 scripts/build-youtube-data.js 依
 * assets/data/youtube-videos.xlsx 自動產生，請勿手改。
 * 更新方式：改 Excel 後執行 `npm run youtube`。
 */
window.__YOUTUBE_DATA__ = {
  "channelUrl": "https://www.youtube.com/@liyuncheetah",
  "videos": [
    {
      "id": "OjD32kBvfjo",
      "title": "從115年學測談數學科備考～以一道學測「平面截立體」的問題為例, 如何能夠 從從容容 游刃有餘(之1) #學測 #數學 #學測數學 #資優數學",
      "views": "211次",
      "date": "2026-01-22",
      "featured": false,
      "length": "1:15"
    },
    {
      "id": "CXGopc-Ozos",
      "title": "長假出國渡假, 就要中斷學習嗎? #網課優勢 #獵豹網課 #資優數學 #科學班 #數資班 #頂大 #AMC",
      "views": "47次",
      "date": "2026-01-07",
      "featured": false,
      "length": "1:00"
    },
    {
      "id": "9ZRh8HxA_r0",
      "title": "你看到學霸的遙遙領先, 其實來自一個被低估的學習系統～你一開始就把它排除了嗎?",
      "views": "434次",
      "date": "2025-12-25",
      "featured": true,
      "length": "4:41"
    },
    {
      "id": "9niC0kul-4I",
      "title": "獵豹資優十問 Q2 資優數學就是競賽數學嗎 #科學班 #資優數學 #amc10 #amc12 #amc8 #升學 #醫學系 #電機系",
      "views": "427次",
      "date": "2025-11-29",
      "featured": false,
      "length": "6:45"
    },
    {
      "id": "RtsUU1qmXI0",
      "title": "獵豹資優十問 Q1：什麼是資優數學? #科學班 #資優數學 #amc10 #amc12 #amc8 #升學 #醫學系 #電機系",
      "views": "635次",
      "date": "2025-11-14",
      "featured": false,
      "length": "7:36"
    },
    {
      "id": "uU4gS7XMtG0",
      "title": "20250831 IMPA 頒獎典禮 獵豹宗翰老師致詞節錄 #IMO #IPhO #EGMO #IJSO #資優數學 #科學班",
      "views": "205次",
      "date": "2025-09-10",
      "featured": false,
      "length": "5:06"
    },
    {
      "id": "yQoreybV0eY",
      "title": "「AMC」：刷題者的墳場‼️～反覆制式的訓練 僵化你的思維～獵豹的「專家模式」讓你腦洞大開 #科學班 #資優數學 #amc10 #amc12 #amc8 #升學 #醫學系 #電機系",
      "views": "251次",
      "date": "2025-09-08",
      "featured": false,
      "length": "18:50"
    },
    {
      "id": "nslVZgtsP88",
      "title": "AMC 獲取高分的終極解密～獵豹數學教你秒殺難題～「舉一反十」「高速解題」的效率學習法 #科學班 #資優數學 #amc10 #amc12 #amc8 #升學 #醫學系 #電機系",
      "views": "275次",
      "date": "2025-09-03",
      "featured": false,
      "length": "12:59"
    },
    {
      "id": "QzJ2NkRauhQ",
      "title": "五分鐘全方位瞭解『AMC』～醫電園的終南捷徑～升學考試高分的關鍵—數學 #科學班 #資優數學 #amc10 #amc12 #amc8 #升學 #醫學系 #電機系",
      "views": "284次",
      "date": "2025-09-01",
      "featured": false,
      "length": "4:56"
    },
    {
      "id": "3aV2nwv2wuA",
      "title": "獵豹教你用小學方法秒解高中難題! #資優數學 #小學數學 #科學班 #數資班 #數學思維 #聰明思考 #amc #amc8 #amc10 #資優",
      "views": "541次",
      "date": "2025-06-21",
      "featured": false,
      "length": "5:36"
    },
    {
      "id": "r7wrCsumKE4",
      "title": "美妙的連分數～～文科媽媽的逆襲",
      "views": "62次",
      "date": "2023-07-30",
      "featured": false,
      "length": "3:34"
    }
  ],
  "shorts": [
    {
      "id": "avbzM-lfvk4",
      "title": "AIME 訓練 讓你從傑出躍升為頂尖, 挑戰台灣頂大電資科系, 申請美國頂大的同學, 好的 AMC 分數 需要搭配相應的 AIME 成績! #科學班 #資優數學 #AMC #AIME #imo #留學",
      "views": "586次",
      "date": "2026-01-14",
      "featured": false
    }
  ]
};

// 補上衍生欄位（url / thumb），供前端直接使用。
(function () {
  var d = window.__YOUTUBE_DATA__;
  function decorate(list) {
    (list || []).forEach(function (v) {
      v.url = "https://www.youtube.com/watch?v=" + v.id;
      v.thumb = "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg";
    });
  }
  decorate(d.videos);
  decorate(d.shorts);
})();
