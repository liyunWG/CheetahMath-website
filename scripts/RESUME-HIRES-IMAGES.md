# 接手說明：舊站文章內文圖換高解析（多圖批次）

**新 session 只要說「照 scripts/RESUME-HIRES-IMAGES.md 繼續」即可。**

## 現在做到哪

- 單圖那批（49 篇）**已完成並 commit**（`a050029`），共 47 張換成高解析。
- 現在在做**多圖那批**：`scripts/todo-multi.json`（78 篇）。已處理 10 篇，結果記在 `scripts/multi-results.md`。
- 已完成：education-talk-71、about-cheetah-167/170、amc-series-45/85/87（共換 27 張）。
- 確認無解：about-cheetah-161（貼文與內文無關）、166（FB 較小）、amc-series-156（不符）、168（連結不含 PID，待人工）。

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
3. **多圖一律用「逐張」抓，不要用檢視器翻頁**（翻頁會翻進別篇貼文的相簿，實測 education-talk-71
   翻到 `set=pcb.1350686019962814`）。定版做法，每張都跑一輪：
   - navigate 貼文頁 → **等 6 秒**（等 5 秒會抓到還沒渲染完的側欄連結，實測 about-cheetah-166 因此
     整篇抓錯相簿）
   - 取 `a[href*="/photo"]` 中**href 必須含本篇 PID** 的，取第 i 個，`location.href=` 導過去
   - 進檢視器後**先驗 `location.href` 仍含 PID**，不含就回報 `WRONGALBUM` 不要抓
   - 送圖用 grab server 的 `idx=` 指定編號：`http://localhost:8790/grab?name={slug}&idx={n}&u={encoded}`
   - 一個 browser_batch 可以塞 2-3 張的來回，不用一張一次
4. **抓完先用 `tmp/probe.py {slug}` 做感知雜湊比對**再決定要不要繼續抓：
   `MATCH` 才是本文出處；`NOMATCH`（best diff > 100）代表這則貼文根本不是這篇文章的圖，
   直接砍掉 staging、記下來回報使用者，不要浪費時間抓完整本相簿。
   實測 about-cheetah-161 就是這種（貼文 2 張與內文 10 張完全無關）。
4. **每批（約 5 篇）做一次 md5 重複檢查**，有重複就是撞到 FB 沒真的換頁，砍掉重抓：
   ```bash
   python -c "import hashlib,glob,os;h={};[h.setdefault(hashlib.md5(open(f,'rb').read()).hexdigest(),[]).append(os.path.basename(f)) for f in glob.glob('tmp/fbimg-hires/*.jpg') if not f.endswith('.thumb.jpg')];print([v for v in h.values() if len(v)>1] or 'none')"
   ```

## 分配回網站

```bash
python scripts/distribute-fb-images-inplace.py            # dry run
python scripts/distribute-fb-images-inplace.py --apply    # 實際寫入
```

- 就地覆蓋、不改檔名、只在「比原檔大」時才換，原檔備份到 `pic-lowres-backup/`（**不要刪**）。
- **張數不符的一律跳過**，寫進 `scripts/todo-count-mismatch.json`。
  這種要用感知雜湊逐張比對確認對應（16x16 灰階 hash，diff ≤ 5 才算命中），
  確認後把 staging 檔改名成對應的 `{slug}-{n}.jpg`、刪掉多餘的，再重跑一次 --apply。
  **絕對不要依位置硬對**，會貼錯圖。

## 已知待處理 / 卡住的

- `science-talk-241` `-242` `-243` `-244`：worklist 和 planB-queue 都沒有 FB 網址，**要問使用者要**。
- planB-queue 裡有些 post id 是錯的（實測 cheetah-elite-117/122/41 都指到別篇）。
  抓完若感知雜湊跟內文圖完全對不上（diff 都 > 100），八成是 id 錯了，**回報使用者要正確網址**，不要硬套。
- 沒有相片附件的貼文（內文圖其實是連結預覽）不是失敗，記下來回報即可。

## 收尾

commit 範圍只含 `pic/` 和 `scripts/`；**不要**把 `pic-lowres-backup/`、`tmp/`
或該 worktree 裡另外 220+ 個與此事無關的 modified 檔（`content/*.json`、`assets/data/*.js`）一起提交。
使用者未授權 push，**只 commit 不 push**。
