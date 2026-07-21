# 多圖批次結果log（跑到哪就記到哪）

| slug | 結果 |
|---|---|
| education-talk-71 | DONE 6張中5張換 536->679 |
| about-cheetah-161 | NOMATCH 貼文2張與內文10張無關 |
| about-cheetah-166 | MATCH但FB較小(463<536) 無法換 |
| about-cheetah-167 | DONE 3張中2張換 536->1004/842（順序與內文不同，靠雜湊配對）|
| about-cheetah-168 | SKIP 貼文相片連結不含PID(set=a.)，無法安全鎖定相簿，待人工 |
| about-cheetah-170 | DONE 18張中5張換 536->~1240 |
| amc-series-156 | NOMATCH (post只有1張且不符) |
| amc-series-45 | DONE 6張中5張換 536->1484 |
| amc-series-85 | DONE 14張中5張換 536->1586 |
| amc-series-87 | DONE 9張中5張換 536->1452 |
| cheetah-perspective-101 | DONE 3張全換 536->2048 |
| cheetah-perspective-111 | DONE 4張全換 536->1448 |
| cheetah-perspective-140 | DONE 14張中5張換 536->1908/1166, 378->~620 |

## 下一篇從 cheetah-perspective-146 開始（見 scripts/todo-multi.json 順序）

注意：進度用 `scripts/multi-results.md` 這張表判斷，**不要只看 tmp/fbimg-hires 有沒有檔案**
——抓到一半的文章（只有 -1.jpg）也會出現在 staging，會被誤判成已完成。
