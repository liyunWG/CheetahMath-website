# -*- coding: utf-8 -*-
"""就地覆蓋版（2026-07-21）：把 fbimg-hires staging 的高解析原圖，依序覆蓋回舊文章
   bodyHtml 既有的低解析圖路徑（例如 pic/columns/2023080509034855356-25e5ec5b.png）。
   —— 與 distribute-fb-images-hires.py 的差別：不改檔名、不改 bodyHtml，只換檔案內容，
      因為舊站文章引用的是舊站檔名，改名會導致引用失效。
   staging 檔名須為 {slug}-{n}.jpg，n 由 1 起算，對應 lowres-worklist.json 內 images[] 的順序。
   原圖備份到 pic-lowres-backup/ 之下（相同相對路徑），可重複執行。"""
import os, json, glob, re, shutil, sys
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = os.environ.get('FBIMG_STAGE') or os.path.join(SITE, 'tmp', 'fbimg-hires')
BACKUP = os.path.join(SITE, 'pic-lowres-backup')
WORKLIST = os.path.join(SITE, 'scripts', 'lowres-worklist.json')
DRY = '--apply' not in sys.argv

def staged():
    out = {}
    for f in glob.glob(os.path.join(STAGE, '*.jpg')):
        b = os.path.basename(f)
        if b.endswith('.thumb.jpg') or b.startswith('_'):
            continue
        m = re.match(r'(.+)-(\d+)\.jpg$', b)
        if m:
            out.setdefault(m.group(1), []).append((int(m.group(2)), f))
    for k in out:
        out[k].sort()
    return out

def replace(src_rel, hires):
    """把 hires 轉存成 src_rel 既有的格式與路徑，先備份原檔。"""
    dst = os.path.join(SITE, src_rel)
    if not os.path.exists(dst):
        return 'target missing'
    new = Image.open(hires)
    old_w = Image.open(dst).size[0]
    if new.size[0] <= old_w:
        return 'not larger (%d <= %d)' % (new.size[0], old_w)
    if DRY:
        return 'would replace %d -> %d' % (old_w, new.size[0])
    bak = os.path.join(BACKUP, src_rel)
    os.makedirs(os.path.dirname(bak), exist_ok=True)
    if not os.path.exists(bak):
        shutil.copy2(dst, bak)
    ext = os.path.splitext(dst)[1].lower()
    if ext == '.png':
        new.convert('RGBA' if new.mode in ('RGBA', 'LA') else 'RGB').save(dst, 'PNG', optimize=True)
    else:
        new.convert('RGB').save(dst, 'JPEG', quality=92, subsampling=0)
    return 'replaced %d -> %d' % (old_w, new.size[0])

def main():
    work = {x['slug']: x for x in json.load(open(WORKLIST, encoding='utf-8'))}
    st = staged()
    if not st:
        print('staging 空的：%s' % STAGE); return
    done = skip = 0
    skipped_articles = []
    for slug, items in sorted(st.items()):
        w = work.get(slug)
        if not w:
            print('? 不在 worklist:', slug); continue
        imgs = w['images']
        if len(items) != len(imgs):
            # 張數不吻合＝無法確認對應關係（舊站文章常是多則貼文合併），一律跳過待辦，
            # 依位置硬對會把圖貼到錯的位置。
            print('! 跳過 %s：staging %d 張 / 內文 %d 張，數量不符' % (slug, len(items), len(imgs)))
            skipped_articles.append((slug, len(items), len(imgs)))
            continue
        for (n, hires), img in zip(items, imgs):
            r = replace(img['src'], hires)
            print('  %-28s %-52s %s' % (slug, img['src'], r))
            done += r.startswith(('replaced', 'would'))
            skip += not r.startswith(('replaced', 'would'))
    print('\n%s：處理 %d 張，略過 %d 張' % ('DRY RUN（加 --apply 才會實際寫入）' if DRY else '已寫入', done, skip))
    if skipped_articles:
        print('張數不符待辦 %d 篇：' % len(skipped_articles))
        for s, a, b in skipped_articles:
            print('  %-32s FB %d 張 / 內文 %d 張' % (s, a, b))
        json.dump([{'slug': s, 'fb': a, 'body': b} for s, a, b in skipped_articles],
                  open(os.path.join(SITE, 'scripts', 'todo-count-mismatch.json'), 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)

main()
