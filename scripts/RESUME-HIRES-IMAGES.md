# 接手說明：舊站文章內文圖換高解析（多圖批次）

**新 session 只要說「照 scripts/RESUME-HIRES-IMAGES.md 繼續」即可。**

## 現在做到哪

- 單圖那批（49 篇）**已完成並 commit**（`a050029`），共 47 張換成高解析。
- **多圖那批 `scripts/todo-multi-remaining.json`（47 篇）已全部跑完**，唯一剩下的是
  `science-talk-241/242/243/244` —— 這 4 篇沒有 FB 網址，**要問使用者要**。
- 逐篇結果一律看 `scripts/multi-results.md`（每篇都有一列）。
  另有 `cheetah-elite-22/31/38` 共用的 post id `1290753188544030` 經實測是錯的，
  抓到的 7 張與內文完全對不上，**需使用者提供正確 FB 網址**。

## 進度怎麼查（不要憑記憶，一律重算）

```bash
cd E:/20260323_LiyunWG_Cheetah_website/.claude/worktrees/old-articles-image-compression-check-8ba1e9
python -c "
import json,glob,os
todo=json.load(open('scripts/todo-multi.json',encoding='utf-8'))
staged=set(os.path.basename(f).rsplit('-',1)[0] for f in glob.glob('tmp/fbimg-hires/*.jpg'))
rest=[x for x in todo if x['slug'] not in staged]
print('剩下',len(rest),'篇'); [print(' ',x['slug'],x['pid'],x['n_body']) for x in rest[:10]]
"
```

`tmp/fbimg-hires/{slug}-{n}.jpg` 存在 = 那篇已抓過。**staging 就是進度來源。**

## 做法

抓圖流程完全照 `scripts/FB-IMAGE-DOWNLOAD-METHOD.md`（含裡面所有陷阱），重點：

1. 前置：`python scripts/fb-image-grab-server.py`（8790 port，可能已在跑，先 curl 測）；
   用 **Claude in Chrome**（`mcp__claude-in-chrome__*`），不是內建瀏覽器（沒 FB 登入）。
2. 每篇：navigate 貼文 → 等 3 秒 → 取 photo 連結（**要過濾別社團的**）→ 導向檢視器 →
   翻頁收集（**等 `img.src` 變化**，用 `fbid` 判斷繞回頭）→ 一次導向 grab server 送回。
3. **定版做法（2026-07-22 改良，快很多）**：可以用檢視器翻頁，但**每翻一張都要驗 PID**，
   一篇 = 一個 4 步 browser_batch，兩篇可以塞同一個 batch：
   - `navigate` 貼文頁
   - JS：等 6 秒 →（等 5 秒會抓到還沒渲染完的側欄連結，實測 about-cheetah-166 因此整篇抓錯相簿）
     取 `a[href*="/photo"]` 中 **href 必須含本篇 PID** 的；一張都沒有就回 `NOPHOTO`（＝這則貼文
     沒有相片附件，或相片連結是別篇的，例如反覆出現的 `set=pcb.1350686019962814`）；
     有就 `location.href = a[0].href`
   - JS：等 4 秒 → 若 `location.href` 不含 PID 或找不到 `media-vc-image` 就回 `BAD`；
     否則 for 迴圈翻頁收集，**每一圈都重驗 `location.href` 仍含 PID**（不含就 break），
     用 `fbid` 判斷繞回頭，等 `img.src` 變化才算換頁成功。結果存 `window.__urls`
   - JS：`location.href='http://localhost:8790/grab?name={slug}&'+urls.map(...)` 一次送回
   —— 有了「每圈驗 PID」這道防線，翻頁不會再翻進別篇相簿，不需要再一張一張抓。
4. **探針策略（省時間的關鍵）**：每篇**先只抓第 1 張**，然後跑
   `python scripts/probe-hires-match.py {slug}`，兩個條件都過才抓整篇：
   - `MATCH`（best diff ≤ 15）才是本文出處。`NOMATCH`（diff > 100）代表這則貼文
     根本不是這篇的圖，砍掉 staging、記進 `scripts/multi-results.md`，別抓整本相簿。
   - 第 1 張的寬度要**大於**內文圖寬度。這批舊貼文常見 FB 只有 460-490px，
     比站上 530/536px 還小（about-cheetah-166 就是），抓了也換不了。
5. **每批（約 5 篇）做一次 md5 重複檢查**，有重複就是撞到 FB 沒真的換頁，砍掉重抓：
   ```bash
   python -c "import hashlib,glob,os;h={};[h.setdefault(hashlib.md5(open(f,'rb').read()).hexdigest(),[]).append(os.path.basename(f)) for f in glob.glob('tmp/fbimg-hires/*.jpg') if not f.endswith('.thumb.jpg')];print([v for v in h.values() if len(v)>1] or 'none')"
   ```

## 分配回網站

```bash
python scripts/distribute-fb-images-inplace.py            # dry run
python scripts/distribute-fb-images-inplace.py --apply    # 實際寫入
```

- 就地覆蓋、不改檔名、只在「比原檔大」時才換，原檔備份到 `pic-lowres-backup/`（**不要刪**）。
- **distribute 是「依序」對應的，FB 相簿順序常與內文不同，分配前一定要先跑對齊**：
  ```bash
  python scripts/align-staging.py {slug}            # 看對應結果
  python scripts/align-staging.py {slug} --apply    # 依感知雜湊改名成內文順序
  ```
  它會把 staging 改名成內文順序、刪掉多餘的；內文有而相簿沒有的位置**補上原檔本身當佔位**，
  這樣張數就吻合，distribute 會判定 not larger 自動略過，安全。
  **絕對不要依位置硬對**，會貼錯圖。
- 張數不符又沒對齊的會被跳過並寫進 `scripts/todo-count-mismatch.json`。

## 已知待處理 / 卡住的

- `science-talk-241` `-242` `-243` `-244`：worklist 和 planB-queue 都沒有 FB 網址，**要問使用者要**。
- planB-queue 裡有些 post id 是錯的（實測 cheetah-elite-117/122/41 都指到別篇）。
  抓完若感知雜湊跟內文圖完全對不上（diff 都 > 100），八成是 id 錯了，**回報使用者要正確網址**，不要硬套。
- 沒有相片附件的貼文（內文圖其實是連結預覽）不是失敗，記下來回報即可。

## 收尾

commit 範圍只含 `pic/` 和 `scripts/`；**不要**把 `pic-lowres-backup/`、`tmp/`
或該 worktree 裡另外 220+ 個與此事無關的 modified 檔（`content/*.json`、`assets/data/*.js`）一起提交。
使用者未授權 push，**只 commit 不 push**。
