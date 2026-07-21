# -*- coding: utf-8 -*-
"""兩檔縮圖政策（2026-07-21）：把 fbimg-hires staging 的高解析原圖分配到網站。
   - 內文圖 = 原圖（不縮小）：pic/{sec}/{slug}-{n}.jpg（覆蓋既有小圖；bodyHtml 本就引用此路徑）
   - 預覽卡片縮圖 = 第一張圖的縮圖：pic/{sec}/{slug}-thumb.jpg（<=600px）
   coverImage/imageUrl/imageName 指向縮圖；若 bodyHtml 尚未含任何該 slug 圖片則補上完整原圖 gallery。
   會略過影片內嵌貼文（bodyHtml 含 <!--video-embed-->）。可重複執行。"""
import os, re, glob, json, shutil

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = r'C:\Users\liyun\AppData\Local\Temp\claude\E--20260323-LiyunWG-Cheetah-website--claude-worktrees-fb-posts-category-adjustment-4ea8dd\61582335-5611-41b3-af17-ce10f22170ee\scratchpad\fbimg-hires'
SECTIONS = ['columns', 'elite', 'news', 'courses']

def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;'))

def staged_slugs():
    """回傳 {slug: [full圖路徑排序]}（排除 .thumb.jpg）。"""
    out = {}
    for f in glob.glob(os.path.join(STAGE, '*.jpg')):
        b = os.path.basename(f)
        if b.endswith('.thumb.jpg') or b.startswith('_'):
            continue
        m = re.match(r'(.+)-(\d+)\.jpg$', b)
        if not m:
            continue
        out.setdefault(m.group(1), []).append((int(m.group(2)), f))
    for k in out:
        out[k].sort()
    return out

def find_json(slug):
    for sec in SECTIONS:
        p = os.path.join(SITE, 'content', sec, slug + '.json')
        if os.path.exists(p):
            return p, sec
    return None, None

def main():
    slugs = staged_slugs()
    done = skipped = 0
    for slug, items in slugs.items():
        p, sec = find_json(slug)
        if not p:
            print('  ? no JSON for', slug); continue
        d = json.load(open(p, encoding='utf-8-sig'))
        body = d.get('bodyHtml', '')
        if '<!--video-embed-->' in body:
            skipped += 1; continue  # 影片貼文，不覆蓋
        picdir = os.path.join(SITE, 'pic', sec)
        os.makedirs(picdir, exist_ok=True)
        rel_full = []
        for n, src in items:
            dst = os.path.join(picdir, '%s-%d.jpg' % (slug, n))
            shutil.copyfile(src, dst)           # 內文原圖（覆蓋）
            rel_full.append('pic/%s/%s-%d.jpg' % (sec, slug, n))
        # 卡片縮圖 = 第一張的 .thumb
        thumb_src = os.path.join(STAGE, '%s-1.thumb.jpg' % slug)
        cover = ''
        if os.path.exists(thumb_src):
            shutil.copyfile(thumb_src, os.path.join(picdir, '%s-thumb.jpg' % slug))
            cover = 'pic/%s/%s-thumb.jpg' % (sec, slug)
        else:
            cover = rel_full[0]
        d['coverImage'] = cover
        d['imageUrl'] = cover
        d['imageName'] = os.path.basename(cover)
        d['detailImages'] = rel_full[1:]
        # bodyHtml：移除舊的該 slug 圖片區塊，重建完整原圖 gallery（確保所有下載圖都在內文、
        # 第一張＝卡片縮圖來源）。匯入時圖片一律附在文末，故重建文末 gallery 安全。
        body = re.sub(
            r'<div class="remote-row clearfix"><div class="column full"><img src="pic/%s/%s-[^"]*"[^>]*></div></div>' % (sec, re.escape(slug)),
            '', body)
        gallery = ''.join(
            '<div class="remote-row clearfix"><div class="column full">'
            '<img src="%s" alt="%s"></div></div>' % (pth, esc(d.get('title', '')))
            for pth in rel_full)
        if '<!--fb-gallery-->' not in body:
            body = '<!--fb-gallery-->' + body
        if body.endswith('</div>'):
            body = body[:-6] + gallery + '</div>'
        else:
            body = body + gallery
        d['bodyHtml'] = body
        json.dump(d, open(p, 'w', encoding='utf-8-sig'), ensure_ascii=False, indent=2)
        open(p, 'a', encoding='utf-8-sig').write('\n')
        done += 1
        print('  OK', slug, '| body imgs:', len(rel_full), '| cover:', os.path.basename(cover))
    print('分配完成：%d 篇，略過影片貼文 %d 篇' % (done, skipped))

if __name__ == '__main__':
    main()
