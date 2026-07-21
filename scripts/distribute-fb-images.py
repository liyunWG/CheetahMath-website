# -*- coding: utf-8 -*-
"""把 staging 的 fbimg-{postid}-{n}.jpg 分配到 pic/{section}/，並寫進各 content JSON。"""
import os, re, glob, json, shutil

SITE = r'E:\20260323_LiyunWG_Cheetah_website\.claude\worktrees\fb-posts-category-adjustment-4ea8dd'
STAGE = r'C:\Users\liyun\AppData\Local\Temp\claude\E--20260323-LiyunWG-Cheetah-website--claude-worktrees-fb-posts-category-adjustment-4ea8dd\61582335-5611-41b3-af17-ce10f22170ee\scratchpad\fbimg'

SECTIONS = ['columns', 'elite', 'news', 'courses']

def stage_imgs(pid):
    fs = glob.glob(os.path.join(STAGE, f'fbimg-{pid}-*.jpg'))
    def n(f):
        m = re.search(r'-(\d+)\.jpg$', f)
        return int(m.group(1)) if m else 0
    return sorted(fs, key=n)

def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;'))

updated = 0
imgs_total = 0
no_img = []
for sec in SECTIONS:
    picdir = os.path.join(SITE, 'pic', sec)
    os.makedirs(picdir, exist_ok=True)
    for f in glob.glob(os.path.join(SITE, 'content', sec, '*.json')):
        d = json.load(open(f, encoding='utf-8-sig'))
        if not isinstance(d, dict) or d.get('migrationPage') != 'fb-group-import-20260720':
            continue
        m = re.search(r'(?:posts|permalink)/(\d+)', d.get('sourceUrl', ''))
        if not m:
            continue
        pid = m.group(1)
        imgs = stage_imgs(pid)
        if not imgs:
            no_img.append((sec, d['slug']))
            continue
        slug = d['slug']
        rel_paths = []
        for i, src in enumerate(imgs, 1):
            dst_name = f'{slug}-{i}.jpg'
            shutil.copyfile(src, os.path.join(picdir, dst_name))
            rel_paths.append(f'pic/{sec}/{dst_name}')
        # 封面 = 第一張
        cover = rel_paths[0]
        d['coverImage'] = cover
        d['imageUrl'] = cover
        d['imageName'] = os.path.basename(cover)
        if 'cover' in d:
            d['cover'] = cover
        # 內文附上所有圖片（詳情頁會把封面去重，僅顯示一次）
        gallery = ''.join(
            f'<div class="remote-row clearfix"><div class="column full">'
            f'<img src="{p}" alt="{esc(d.get("title",""))}"></div></div>'
            for p in rel_paths)
        body = d.get('bodyHtml', '')
        if gallery and '<!--fb-gallery-->' not in body:
            if body.endswith('</div>'):
                body = body[:-6] + gallery + '</div>'
            else:
                body = body + gallery
            body = '<!--fb-gallery-->' + body
            d['bodyHtml'] = body
        json.dump(d, open(f, 'w', encoding='utf-8-sig'), ensure_ascii=False, indent=2)
        open(f, 'a', encoding='utf-8-sig').write('\n')
        updated += 1
        imgs_total += len(rel_paths)

print(f'更新文章 {updated} 篇，配圖 {imgs_total} 張')
print(f'無圖文章 {len(no_img)} 篇')
