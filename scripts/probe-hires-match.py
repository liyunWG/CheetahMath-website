# -*- coding: utf-8 -*-
"""探針：把某篇已抓的 staging 圖跟該篇內文圖做感知雜湊比對，判斷這則 FB 貼文是不是本文出處。"""
import glob,os,json,sys
from PIL import Image
slug=sys.argv[1]
w=[x for x in json.load(open('scripts/lowres-worklist.json',encoding='utf-8')) if x['slug']==slug][0]
def sig(im):
    g=im.convert('L').resize((16,16)); p=list(g.getdata()); a=sum(p)/len(p); return [1 if v>a else 0 for v in p]
fs=[f for f in sorted(glob.glob('tmp/fbimg-hires/%s-*.jpg'%slug)) if not f.endswith('.thumb.jpg')]
if not fs: print('no staging'); sys.exit()
best=999; pairs=[]
for im in w['images']:
    o=Image.open(im['src']); b=sig(o)
    sc=sorted((sum(1 for x,y in zip(b,sig(Image.open(f))) if x!=y),os.path.basename(f)) for f in fs)
    pairs.append((im['src'],o.size,sc[0]))
    best=min(best,sc[0][0])
print('MATCH' if best<=15 else 'NOMATCH','(best diff=%d, staging %d 張 / 內文 %d 張)'%(best,len(fs),len(w['images'])))
for s,sz,b in pairs: print('  %-50s %-11s -> %s'%(os.path.basename(s),'%dx%d'%sz,b))
