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
| cheetah-perspective-146 | NOMATCH (best diff=120) |
| cheetah-perspective-176 | DONE 5張全換 530/536->1452 |

## 重要：很多 slug 是同一篇文章的跨分類複本

它們在 lowres-worklist 裡的 images[] 完全相同，換一篇等於全部換好。
已據此把待辦從 55 篇縮成 47 篇，清單見 `scripts/todo-multi-remaining.json`
（每筆的 `same_as` 欄位列出跟它共用同一組圖檔的其他 slug）。

自動標記完成（與已處理文章圖檔相同）：cheetah-salon-100/110/120/139/44/70/86、science-talk-177
| cheetah-perspective-194 | DONE 5張全換 536->~868 |
| cheetah-perspective-196 (=education-talk-197) | MATCH但FB只有390px < 536 無法換 |
| cheetah-perspective-199 (=education-talk-200) | MATCH但FB只有380px < 530 無法換 |
| cheetah-perspective-181 | SKIP 相片連結不含PID(set=pcb.1350686019962814 屬他篇)，探針NOMATCH(diff=75)；貼文自身圖僅359/378px < 536 |
| cheetah-perspective-203 | FB原圖本身就小(312x335 / 285x745) 不大於內文 無法換 |
| cheetah-perspective-47 (=cheetah-salon-46) | 抓到10張 1561-1840px (內文10張536) 待分配 |
| cheetah-salon-102 | 抓到2張 686/856px (內文2張536) 待分配 |
| cheetah-salon-122 (=education-talk-123) | 抓到2張 1132/631px (內文2張530) 待分配 |
| cheetah-salon-124 (=cheetah-salon-125) | 抓到3張 606/679/679px (內文3張530/536) 待分配 |
| cheetah-salon-127 | NOMATCH (貼文只有1張且不符, best diff=116) |
| cheetah-salon-34 | NOMATCH (8張全不符, best diff=73) |
| cheetah-salon-43 | 抓到6張 1280-1568px 已對齊順序(FB順序與內文不同) 待分配 |
| cheetah-salon-59 (=education-talk-60) | 抓到1張 931px(內文530)；第2張FB只有250px 補原檔佔位 待分配 |
| cheetah-salon-67 (=education-talk-68) | 抓到2張 1242/1090px (內文2張536) 待分配 |
| cheetah-salon-82 | 抓到8張 548-1448px 已對齊順序 待分配 |
| cheetah-salon-83 | NOMATCH (貼文只有1張且不符, best diff=106) |
| cheetah-salon-84 | 抓到13張 768-1586px (內文13張536/378) 待分配 |
| cheetah-salon-88 | 抓到3張 640px (內文3張530) 待分配 |
| cheetah-salon-98 | 抓到5張 640-960px (內文5張530) 待分配 |
| education-talk-154 (=cheetah-elite-54 同貼文不同檔) | 抓到4張 1076-1241px (內文4張530) 兩篇都已備妥 待分配 |
| education-talk-232 (=science-talk-231) | 抓到2張 646/662px (內文2張536) 待分配 |
| education-talk-878480896437930 | 內文圖本身就是先前抓下的FB原圖(390/386/682px 完全相同) 無需更換 |
| science-talk-217 (=cheetah-elite-76 同貼文不同檔) | 抓到2張 606/790px (內文2張536) 兩篇都已備妥 待分配 |
| science-talk-227 | 抓到2張 954/470px (內文2張536；第2張FB較小待分配時會自動略過) |
| science-talk-230 | 抓到2張 641/960px (內文2張536) 待分配 |
| science-talk-233 | 抓到3張 1365/1451px (內文3張530/536) 待分配 |
| science-talk-234 | NOMATCH (best diff=41，貼文非本文出處) |
| science-talk-238 | 貼文無相片附件(全是影片) 無法取得高解析 |
| science-talk-95 | 抓到1張 1199px 對到內文第1張；第2張貼文沒有 補原檔佔位 待分配 |
| cheetah-elite-118 | 貼文無相片附件(內文圖為連結預覽) 無法取得 |
| cheetah-elite-132 | NOMATCH (best diff=55) |
| cheetah-elite-12 | 抓到1張 1535px 對到內文第1張；第2張(433px)貼文沒有 補原檔佔位 待分配 |
| cheetah-elite-29 | 抓到1張 1452px 對到內文第1張；第2張貼文沒有 補原檔佔位 待分配 |
| cheetah-elite-35 | 抓到4張 1077px (內文4張536) 待分配 |
| cheetah-elite-48 | 抓到3張 1770-1855px (內文3張530/536) 待分配 |
| cheetah-elite-59 | 抓到6張 640-1080px (內文6張530/536) 待分配 |
| cheetah-elite-64 | 抓到2張 1090/433px (順序與內文相反，已靠雜湊對齊；433那張較小會自動略過) |
| lecture-2082540069365334 | 貼文無相片附件(唯一相片是540x540頭像類) 無法取得 |
| cheetah-elite-22 | （使用者提供正確網址 posts/1295556078063741）抓到1張 1601px 換掉內文第1張；第2張貼文沒有 |
| cheetah-elite-31 | （使用者提供正確網址 posts/1301892074096808）6張全換 378/530/536 -> 1309~1383px |
| cheetah-elite-38 | （使用者提供正確網址 posts/1305465240406158）2張全換 530 -> 1627/755px |
| science-talk-241/242/243/244 | 使用者指示不用再調整 |
