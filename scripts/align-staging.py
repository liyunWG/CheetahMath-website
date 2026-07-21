# -*- coding: utf-8 -*-
"""把某篇 staging 的高解析圖，用感知雜湊對到 lowres-worklist 內文圖的正確順序後改名。

用途：FB 相簿順序常與舊站文章內文順序不同，distribute-fb-images-inplace.py 是「依序」對應的，
      不先對齊會貼錯圖。另外相簿張數也常少於內文張數，本腳本會把對不到的內文位置
      補上「原檔本身」當佔位，讓張數吻合；distribute 會判定 not larger 而略過，安全。

  python scripts/align-staging.py {slug}            # 只看對應結果
  python scripts/align-staging.py {slug} --apply    # 實際改名／補佔位
"""
import glob, json, os, re, shutil, sys
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = os.environ.get('FBIMG_STAGE') or os.path.join(SITE, 'tmp', 'fbimg-hires')
THRESH = 15

slug = sys.argv[1]
apply_ = '--apply' in sys.argv
work = [x for x in json.load(open(os.path.join(SITE, 'scripts', 'lowres-worklist.json'), encoding='utf-8'))
        if x['slug'] == slug][0]


def sig(im):
    g = im.convert('L').resize((16, 16))
    p = list(g.getdata())
    a = sum(p) / len(p)
    return [1 if v > a else 0 for v in p]


files = sorted(f for f in glob.glob(os.path.join(STAGE, slug + '-*.jpg')) if not f.endswith('.thumb.jpg'))
sigs = {f: sig(Image.open(f)) for f in files}

# 每個內文位置挑最像的 staging 檔（貪心：diff 小的先配，一對一）
cands = []
for i, img in enumerate(work['images']):
    b = sig(Image.open(os.path.join(SITE, img['src'])))
    for f in files:
        cands.append((sum(1 for x, y in zip(b, sigs[f]) if x != y), i, f))
cands.sort()
pair, usedf, usedi = {}, set(), set()
for d, i, f in cands:
    if d > THRESH or i in usedi or f in usedf:
        continue
    pair[i] = (f, d)
    usedi.add(i)
    usedf.add(f)

for i, img in enumerate(work['images']):
    if i in pair:
        f, d = pair[i]
        print('  body[%d] %-46s <- %-28s diff=%d' % (i + 1, os.path.basename(img['src']), os.path.basename(f), d))
    else:
        print('  body[%d] %-46s <- (無對應，補原檔佔位)' % (i + 1, os.path.basename(img['src'])))
extra = [f for f in files if f not in usedf]
for f in extra:
    print('  多餘 staging（將刪除）:', os.path.basename(f))

if not apply_:
    print('\nDRY RUN（加 --apply 才會實際改名）')
    sys.exit()

tmpdir = os.path.join(STAGE, '_align_' + slug)
os.makedirs(tmpdir, exist_ok=True)
for i in range(len(work['images'])):
    dst = os.path.join(tmpdir, '%s-%d.jpg' % (slug, i + 1))
    if i in pair:
        shutil.copy2(pair[i][0], dst)
    else:
        Image.open(os.path.join(SITE, work['images'][i]['src'])).convert('RGB').save(dst, 'JPEG', quality=92)
for f in glob.glob(os.path.join(STAGE, slug + '-*.jpg')):
    os.remove(f)
for f in glob.glob(os.path.join(tmpdir, '*.jpg')):
    shutil.move(f, os.path.join(STAGE, os.path.basename(f)))
os.rmdir(tmpdir)
print('\n已對齊 %d 張' % len(work['images']))
