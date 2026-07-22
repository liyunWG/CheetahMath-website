# FB 圖片下載標準做法（相片檢視器 / photo theater）

**以後從 FB 下載圖片一律採用本方式。** 貼文頁直接抓 `<img>` 的做法已實測否決，見文末。

## 為什麼一定要開相片檢視器

| | 貼文頁直接抓 | 相片檢視器 |
|---|---|---|
| 解析度 | 多圖貼文排成格子，只有 ~490px | 800–2048px |
| 順序 | 混入頭像／連結預覽圖，順序不可靠 | 相簿原始順序 |

實測（2026-07-21，10 篇）：貼文頁抓到 25 張，僅 5 張 ≥700px，多數比站上現有的 530px 還小。

## 流程

前置：`python scripts/fb-image-grab-server.py`（可用 `FBIMG_STAGE` 指定 staging 目錄），
Chrome 需已登入 FB。以 Claude in Chrome 操作，**不要用內建瀏覽器**（沒有登入狀態）。

1. **導向貼文** `https://www.facebook.com/groups/<gid>/permalink/<pid>/`
2. **取得相片連結**（頁面需等到圖片載入，最多重試 12 次 × 1.5s）
   ```js
   var a=[...document.querySelectorAll('a[href*="/photo/"],a[href*="/photos/"],a[href*="/photo?"]')];
   var hrefs=[...new Set(a.map(x=>x.href.split('&__')[0]))];
   ```
   **只取 `hrefs[0]`**。貼文上每張縮圖各有一個 href，但它們開的是**同一本相簿的不同起點**，
   逐一處理會重複抓（實測 6 張的貼文抓成 20 張）。第一個 href 翻完就會繞回頭，已涵蓋整本。
3. **進檢視器**：`location.href = hrefs[i]`
   —— 用導向，**不要用點擊**。FB 相片牆有時是 `<a>` 有時是純 div，程式化 `.click()` 常打不開檢視器，
   靠截圖定位真實滑鼠點擊則既慢又不穩。
4. **翻頁收集**（同一 set 內）
   ```js
   var cur=()=>document.querySelector('img[data-visualcompletion="media-vc-image"]');
   var nx=document.querySelector('[aria-label="下一張相片"],[aria-label="Next photo"]');
   ```
   每翻一張要等 `naturalWidth>400`，**而且要等 `img.src` 跟上一張不同**
   —— 只等 naturalWidth 會在 fbid 已換、`<img>` 還沒換的空檔抓到上一張，同一篇連抓兩張一樣的。**判斷是否繞回頭要用網址裡的 `fbid`，不能用 `img.src`**
   —— FB 對同一張圖每次回傳的簽章網址都不同，用 src 去重會失效而無限繞圈。
   ```js
   var id=(location.href.match(/fbid=(\d+)/)||[])[1];
   if(ids.indexOf(id)>=0) break;   // 繞回第一張，結束
   ```
5. **送回本機**：同分頁導向（**不是** `window.open`，會被快顯封鎖擋掉）
   ```js
   location.href='http://localhost:8790/grab?name='+slug+'&'+urls.map(u=>'u='+encodeURIComponent(u)).join('&');
   ```
   伺服器一次可收多個 `u`，一篇文章只要一次導向。
6. **分配回網站**
   - 新文章（檔名為 `{slug}-{n}.jpg`）：`distribute-fb-images-hires.py`
   - 舊站文章（bodyHtml 引用舊站檔名）：`distribute-fb-images-inplace.py`，就地覆蓋不改檔名

## ⚠️ 每篇都必須驗證「真的換頁了」

從相片檢視器導向下一則貼文時，FB 的 client-side routing **常常不會真的換頁**，
JS 會跑在上一篇的殘留畫面上，於是**連續好幾篇抓到同一張圖**。
實測 2026-07-21：連續 8 篇都抓到同一張 1080x2340（phone screenshot），檔案 md5 完全相同。

必要防護，兩層都要做：

1. JS_A 開頭先確認網址真的是目標貼文，否則回報 STALE 重試：
   ```js
   if(location.href.indexOf(PID)<0) return 'STALE';
   ```
2. 抓完後**一定要用 md5 檢查 staging 有無重複檔**：
   ```bash
   python -c "import hashlib,glob,os;h={};[h.setdefault(hashlib.md5(open(f,'rb').read()).hexdigest(),[]).append(os.path.basename(f)) for f in glob.glob('tmp/fbimg-hires/*.jpg') if not f.endswith('.thumb.jpg')];[print('DUP',v) for v in h.values() if len(v)>1]"
   ```
   有重複就是撞到這個 bug，把那批砍掉重抓。

## 已知陷阱

- **`hrefs[0]` 可能是別的社團的貼文**：貼文頁上會混入其他社團的相片連結，直接取 `hrefs[0]`
  會跳到不相干的相簿（實測 cheetah-elite-67、cheetah-perspective-204）。過濾規則：
  接受含本篇 PID 的；否則 `idorvanity=` 必須等於本社團 GID、`set=gm.<id>` 必須等於 PID，其餘剔除。
- **導向後要先等 3 秒再找 `a[href*="/photo"]`**：剛 navigate 完 DOM 還是上一頁的殘留，
  立刻查詢會抓到舊連結（配合上面的過濾規則才能擋掉）。
- **有些貼文根本沒有相片附件**：內文的圖其實是連結預覽（`<img>` 只有 ~500x261、沒有任何 photo anchor）。
  這種只能人工另尋來源，不是抓取失敗。

- **`stp=` 參數不能拿掉**：想用「移除 stp 取原圖」的捷徑會回 403，簽章涵蓋該參數。
- **`chrome://settings` 無法導覽**：擴充功能擋掉，所以不要指望改快顯設定，用同分頁導向即可。
- **舊站文章與 FB 貼文非 1:1**：例如 `about-cheetah-161` 內文有 10 張圖，但對應貼文只有 2 張相片。
  舊文章可能是多則貼文合併而成。**依位置自動對應會貼錯圖**，舊站文章必須逐篇人工確認。
- **內文 FB 連結未必是本文出處**：165 篇中有 57 篇的連結與他篇重複（引用的是「相關貼文」）。
  批次處理前先用 post id 去重，重複者排除。
