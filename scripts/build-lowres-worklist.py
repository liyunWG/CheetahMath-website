# -*- coding: utf-8 -*-
"""列出「內文含舊站低解析圖」的文章，並附上可重抓的 FB 原文網址。
   輸出 scripts/lowres-worklist.json：{slug, section, fbUrl, images:[{src,w,h}]}
   低解析判定：寬度 < 700px（舊站縮圖集中在 330/378/476/520/530/536）。"""
import json, glob, re, os
from PIL import Image

MAXW = 700
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def fb_url(d):
    if 'facebook.com' in (d.get('sourceUrl') or ''):
        return d['sourceUrl']
    for u in re.findall(r'href="(https?://[^"]*facebook\.com[^"]*)"', d.get('bodyHtml') or ''):
        if '/hashtag/' not in u:
            return u
    return ''

def main():
    out = []
    for f in glob.glob(os.path.join(SITE, 'content', '*', '*.json')):
        try:
            d = json.load(open(f, encoding='utf-8-sig'))
        except Exception:
            continue
        if not isinstance(d, dict) or not d.get('slug'):
            continue
        imgs = []
        for src in dict.fromkeys(re.findall(r'<img[^>]+src="([^"]+)"', d.get('bodyHtml') or '')):
            p = os.path.join(SITE, src.split('?')[0])
            if src.startswith(('http', 'data:')) or not os.path.exists(p):
                continue
            try:
                w, h = Image.open(p).size
            except Exception:
                continue
            if w < MAXW:
                imgs.append({'src': src, 'w': w, 'h': h})
        if imgs:
            out.append({'slug': d['slug'], 'section': os.path.basename(os.path.dirname(f)),
                        'fbUrl': fb_url(d), 'images': imgs})
    out.sort(key=lambda x: (not x['fbUrl'], x['section'], x['slug']))
    dst = os.path.join(SITE, 'scripts', 'lowres-worklist.json')
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    have = [x for x in out if x['fbUrl']]
    print('articles %d (with FB url %d), images %d (recoverable %d)'
          % (len(out), len(have), sum(len(x['images']) for x in out),
             sum(len(x['images']) for x in have)))
    for x in out:
        if not x['fbUrl']:
            print('  no FB source:', x['section'], x['slug'], len(x['images']), 'imgs')

main()
