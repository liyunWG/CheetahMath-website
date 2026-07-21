# -*- coding: utf-8 -*-
"""把「其實是影片、卻被抓到廣告縮圖」的貼文改成正確的內嵌影片 / 原文連結註記。
   - youtube : 內文嵌入 YouTube iframe，封面用 YouTube 縮圖。
   - tiktok  : 內文嵌入 TikTok 官方 player iframe，封面用 TikTok oEmbed 縮圖。
   - fbnote  : 內文加註「影片請點擊 Facebook 原文連結」，封面用 fallback 色塊（移除圖）。
   可重複執行；會移除舊的廣告縮圖檔與內文中該 slug 的 <img> 區塊。"""
import os, re, json, glob, ssl, urllib.request

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
H = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}

# slug -> spec
JOBS = {
    # TikTok player 對此影片顯示「不可用」(原片已刪)，改用 FB 原文註記；封面沿用 TikTok 縮圖。
    'science-talk-1403179600634721': {'type': 'fbnote',
        'tiktok_cover': 'https://www.tiktok.com/@user5108208808470/video/7304856240734096683'},
    'amc-series-1841645373454806': {'type': 'youtube', 'vid': 'QzJ2NkRauhQ'},
    'cheetah-salon-1234600197492663': {'type': 'fbnote'},
    'education-talk-1938602070425802': {'type': 'youtube', 'vid': '9ZRh8HxA_r0'},
    'cheetah-perspective-1649957585956920': {'type': 'youtube', 'vid': 'bZeL1IDM4PM'},
    # 2026-07-21 補：body 內含 YouTube 連結、但無相簿照片（nofbid）的影片貼文
    'cheetah-salon-1228557841430232': {'type': 'youtube', 'vid': 'nlleRaUBOPg'},
    'science-talk-1440864713532876': {'type': 'youtube', 'vid': '2fAPgOCjToA'},
    'cheetah-perspective-1813266626292681': {'type': 'youtube', 'vid': 'uGrBHohIgQY'},
    'cheetah-perspective-857162778569742': {'type': 'youtube', 'vid': 'J9Wxps5Ut-Y'},
}
MARK_A, MARK_B = '<!--video-embed-->', '<!--/video-embed-->'

def find_json(slug):
    for sec in ('columns', 'elite', 'news', 'courses'):
        p = os.path.join(SITE, 'content', sec, slug + '.json')
        if os.path.exists(p):
            return p, sec
    return None, None

def dl(url, dst):
    r = urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=30, context=CTX)
    data = r.read()
    with open(dst, 'wb') as f:
        f.write(data)
    return len(data)

def yt_thumb(vid, dst):
    for q in ('maxresdefault', 'hqdefault'):
        try:
            if dl('https://img.youtube.com/vi/%s/%s.jpg' % (vid, q), dst) > 3000:
                return True
        except Exception:
            pass
    return False

def tiktok_thumb(url, dst):
    try:
        r = urllib.request.urlopen(urllib.request.Request(
            'https://www.tiktok.com/oembed?url=' + url, headers=H), timeout=20, context=CTX)
        j = json.load(r)
        t = j.get('thumbnail_url')
        if t:
            return dl(t, dst) > 3000
    except Exception as e:
        print('  tiktok oembed err', str(e)[:80])
    return False

def yt_embed(vid):
    # iframe 帶 width/height 屬性（如 img 般有內在尺寸），responsive 靠 max-width + aspect-ratio。
    return ('<div class="remote-row clearfix"><div class="column full">'
            '<iframe width="720" height="405" src="https://www.youtube.com/embed/{VID}" '
            'title="YouTube video player" frameborder="0" '
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" '
            'allowfullscreen loading="lazy" '
            'style="display:block;margin:0 auto;width:100%;max-width:720px;aspect-ratio:16/9;height:auto;border:0;">'
            '</iframe></div></div>').replace('{VID}', vid)

def tiktok_embed(vid):
    return ('<div class="remote-row clearfix"><div class="column full">'
            '<iframe width="325" height="578" src="https://www.tiktok.com/player/v1/{VID}" '
            'title="TikTok video player" allow="fullscreen" loading="lazy" '
            'style="display:block;margin:0 auto;width:100%;max-width:325px;aspect-ratio:9/16;height:auto;border:0;">'
            '</iframe></div></div>').replace('{VID}', vid)

def fbnote(src):
    return ('<div class="remote-row clearfix"><div class="column full"><p class="normal-txt">'
            '<span style="font-size:22px;">\U0001F4F9 本篇影片請點擊 '
            '<a href="{SRC}" target="_blank" rel="noopener">Facebook 原文連結</a> 觀看。'
            '</span></p></div></div>').replace('{SRC}', src)

def strip_slug_imgs(body, slug, sec):
    # 移除內文中引用該 slug 圖片的 <div class="remote-row clearfix"><div class="column full"><img ...></div></div>
    pat = re.compile(r'<div class="remote-row clearfix"><div class="column full"><img src="pic/%s/%s-[^"]*"[^>]*></div></div>' % (sec, re.escape(slug)))
    return pat.sub('', body)

def strip_embeds(body):
    # 移除先前插入的（含標記或未標記）影片內嵌區塊，確保可重複執行。
    body = re.sub(re.escape(MARK_A) + '.*?' + re.escape(MARK_B), '', body, flags=re.S)
    body = re.sub(r'<div class="remote-row clearfix"><div class="column full">(?:<div style="max-width:[^"]*"><div[^>]*>)?<iframe[^>]*(?:youtube\.com/embed|tiktok\.com/player)[^>]*></iframe>(?:</div></div>)?</div></div>', '', body, flags=re.S)
    return body

def main():
    for slug, spec in JOBS.items():
        p, sec = find_json(slug)
        if not p:
            print('MISSING', slug); continue
        d = json.load(open(p, encoding='utf-8-sig'))
        body = d.get('bodyHtml', '')
        body = strip_slug_imgs(body, slug, sec)
        body = strip_embeds(body)
        picdir = os.path.join(SITE, 'pic', sec)
        # 移除舊廣告縮圖 / 舊封面
        for old in glob.glob(os.path.join(picdir, slug + '-*.jpg')):
            os.remove(old)
        cover = ''
        cover_dst = os.path.join(picdir, slug + '-cover.jpg')
        cover_rel = 'pic/%s/%s-cover.jpg' % (sec, slug)
        if spec['type'] == 'youtube':
            embed = yt_embed(spec['vid'])
            if yt_thumb(spec['vid'], cover_dst):
                cover = cover_rel
        elif spec['type'] == 'tiktok':
            embed = tiktok_embed(spec['vid'])
            if tiktok_thumb(spec['url'], cover_dst):
                cover = cover_rel
        else:  # fbnote（可選：沿用 TikTok 縮圖當封面）
            embed = fbnote(d.get('sourceUrl', ''))
            if spec.get('tiktok_cover') and tiktok_thumb(spec['tiktok_cover'], cover_dst):
                cover = cover_rel
        embed = MARK_A + embed + MARK_B
        # 在 is-container-in 最外層結尾前插入 embed
        if body.endswith('</div>'):
            body = body[:-6] + embed + '</div>'
        else:
            body = body + embed
        d['bodyHtml'] = body
        d['coverImage'] = cover
        d['imageUrl'] = cover
        d['imageName'] = os.path.basename(cover) if cover else ''
        d['detailImages'] = []
        json.dump(d, open(p, 'w', encoding='utf-8-sig'), ensure_ascii=False, indent=2)
        open(p, 'a', encoding='utf-8-sig').write('\n')
        print('OK', slug, spec['type'], '| cover:', cover or '(fallback block)')

if __name__ == '__main__':
    main()
