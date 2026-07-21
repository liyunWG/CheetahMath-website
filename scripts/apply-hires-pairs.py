# -*- coding: utf-8 -*-
"""張數不符時用的手動配對套用器（2026-07-22）。

distribute-fb-images-inplace.py 只處理「FB 張數 == 內文張數」的文章；
舊站文章常是多則貼文合併，或 FB 相簿多出內文沒用到的照片，這時要人工／雜湊確認
每張的對應關係，再用本腳本逐對套用。

用法：
    python scripts/apply-hires-pairs.py pairs.json           # dry run
    python scripts/apply-hires-pairs.py pairs.json --apply

pairs.json 格式（src 是 bodyHtml 引用的站內相對路徑，hires 是 staging 檔名）：
    [{"src": "pic/columns/xxx.png", "hires": "education-talk-71-1.jpg"}, ...]

與 inplace 版一致的保護：只在新圖比較大時才換、原檔備份到 pic-lowres-backup/、
不改檔名、不動 bodyHtml。
"""
import os, json, sys, shutil
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = os.environ.get('FBIMG_STAGE') or os.path.join(SITE, 'tmp', 'fbimg-hires')
BACKUP = os.path.join(SITE, 'pic-lowres-backup')
DRY = '--apply' not in sys.argv

def main():
    pairs = json.load(open(sys.argv[1], encoding='utf-8'))
    done = skip = 0
    for p in pairs:
        dst = os.path.join(SITE, p['src'])
        hires = os.path.join(STAGE, p['hires'])
        if not os.path.exists(dst):
            print('! 目標不存在:', p['src']); skip += 1; continue
        if not os.path.exists(hires):
            print('! staging 不存在:', p['hires']); skip += 1; continue
        new = Image.open(hires)
        old_w = Image.open(dst).size[0]
        if new.size[0] <= old_w:
            print('  %-52s not larger (%d <= %d)' % (p['src'], new.size[0], old_w)); skip += 1; continue
        if DRY:
            print('  %-52s would replace %d -> %d' % (p['src'], old_w, new.size[0])); done += 1; continue
        bak = os.path.join(BACKUP, p['src'])
        os.makedirs(os.path.dirname(bak), exist_ok=True)
        if not os.path.exists(bak):
            shutil.copy2(dst, bak)
        ext = os.path.splitext(dst)[1].lower()
        if ext == '.png':
            new.convert('RGBA' if new.mode in ('RGBA', 'LA') else 'RGB').save(dst, 'PNG', optimize=True)
        else:
            new.convert('RGB').save(dst, 'JPEG', quality=92, subsampling=0)
        print('  %-52s replaced %d -> %d' % (p['src'], old_w, new.size[0])); done += 1
    print('\n%s：處理 %d 張，略過 %d 張' % ('DRY RUN（加 --apply 才會寫入）' if DRY else '已寫入', done, skip))

main()
