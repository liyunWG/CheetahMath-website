# -*- coding: utf-8 -*-
"""從 FB 貼文整理 03.xlsx + MERGED-FINAL.json 產生網站 content/*.json"""
import json, re, os, sys, html
import openpyxl

XLDIR = r'E:\20260323_LiyunWG_Cheetah_website\20260720已下載的FB文章統計excel'
SITE = r'E:\20260323_LiyunWG_Cheetah_website\.claude\worktrees\fb-posts-category-adjustment-4ea8dd'
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SITE, 'content')

CATSLUG = {
    '文章專欄-AMC系列': ('amc-series', 'AMC系列'),
    '文章專欄-關於獵豹': ('about-cheetah', '關於獵豹'),
    '文章專欄-獵豹視角': ('cheetah-perspective', '獵豹視角'),
    '文章專欄-獵豹談教育': ('education-talk', '獵豹談教育'),
    '文章專欄-獵豹談科普': ('science-talk', '獵豹談科普'),
    '文章專欄-獵豹私塾': ('cheetah-salon', '獵豹私塾'),
}

# ---------- 關鍵字清理 ----------
INLINE = [
    (r'獵豹在寰宇開設的\s*GM\s*班系?', '獵豹實體課'),
    (r'獵豹在寰宇[開設立]*的', '獵豹開設的'),
    (r'在寰宇[開設立]*的', '開設的'),
    (r'獵豹\s*[·・x×X＊*/]\s*寰宇', '獵豹'),
    (r'獵豹與寰宇|寰宇與獵豹|獵豹和寰宇', '獵豹'),
    (r'[受應]寰宇[的]?邀請', '受邀'),
    (r'寰宇[教育補習班南復校]*', ''),
    (r'硯吉老師', '獵豹老師'),
    (r'硯吉', '獵豹老師'),
    (r'獵豹\s*[/xX×]\s*劉璿', '獵豹'),
    (r'獵豹與劉璿老師合作的', '獵豹'),
    (r'劉璿科學基地[創辦人召集]*', ''),
    (r'劉璿老師', ''),
    (r'劉璿', ''),
    (r'鎮麟自然科學中心', ''),
    (r'獵豹\s*[·・x×X＊*]\s*鎮麟', '獵豹'),
    (r'獵豹和鎮麟', '獵豹'),
    (r'張鎮麟', ''),
    (r'鎮麟', ''),
    (r'宗嶽主任', ''),
    (r'宗嶽', ''),
    (r'耿立老師', ''),
    (r'耿立', ''),
    (r'陳炳富[助理教授總經理]*', ''),
    (r'炳富老師', ''),
    (r'炳富', ''),
    (r'青易老師', '獵豹老師'),
    (r'青易', ''),
    (r'蔡主任', ''),
    (r'陳鎮州老師', ''), (r'鎮州老師', ''), (r'鎮州', ''),
    (r'羅倢老師', ''), (r'羅倢', ''),
    (r'述任老師', ''), (r'述仁老師', ''),
    # GM -> 獵豹實體課 (避開 EGMO 等)
    (r'(?<![A-Za-z])GM(\d*)\s*班系', '獵豹實體課'),
    (r'(?<![A-Za-z])GM(\d*)\s*班', '獵豹實體課'),
    (r'(?<![A-Za-z])GM(\d*)(?![A-Za-z])', '獵豹實體課'),
    # Sci / Scratch 課程提及
    (r'(?<![A-Za-z])Sci\s*\d*[A-Za-z]*(?![a-z])', ''),
    (r'Scratch\s*\d*', ''),
]
# 若該行原本含這些字，清理後大幅變短或所剩無幾就整行刪
BLOCK = re.compile(r'寰宇|劉璿|鎮麟|宗嶽|耿立|炳富|青易|蔡主任|鎮州|羅倢|述[任仁]|(?<![A-Za-z])Sci(?![a-z])|Scratch')

def clean_line(ln):
    orig = ln
    hit = bool(BLOCK.search(ln))
    for pat, rep in INLINE:
        ln = re.sub(pat, rep, ln)
    ln = re.sub(r'[，、,]\s*[，、,]+', '，', ln)
    ln = re.sub(r'^\s*[，、,．。/：:x×＆&+－\-–—]+', '', ln)
    ln = re.sub(r'\s{2,}', ' ', ln).strip()
    if hit:
        core = re.sub(r'[\s\W_]+', '', ln)
        if len(core) < 6:
            return ''
        if len(ln) < len(orig) * 0.45:
            return ''
    return ln

PROMO_CUT = re.compile(r'^\s*(={3,}|-{3,}|—{3,}|─{3,}|\*{3,})\s*$')
PROMO_KEY = re.compile(r'開跑|報名|按讚留言|課程編號|試上|優惠|官方line|QR\s*code|邁向頂尖|諮詢', re.I)

def trim_trailing_promo(lines, keep_ratio=0.45):
    """文章類：砍掉結尾的課程宣傳區塊"""
    total = sum(len(x) for x in lines)
    for i in range(len(lines)):
        if PROMO_CUT.match(lines[i]):
            tail = '\n'.join(lines[i+1:])
            head_len = sum(len(x) for x in lines[:i])
            if PROMO_KEY.search(tail) and total and head_len / total >= keep_ratio:
                return lines[:i]
    return lines

# FB 機制性雜訊（報名/分享/私訊等），但保留含實質資訊的行
NOISE = re.compile(
    r'按讚|留言\s*\+\s*1|留言『|留言「|私訊星媽|公開分享|指定分享|分享文|官方\s*line|'
    r'QR\s*Code|揪團|跟團|團報|優惠碼|[Aa]方案|[Bb]方案|早鳥|報名繳費|轉帳|填表|截圖|'
    r'掃描|入群|加入獵豹|見底下留言|請見留言|連結請見|詳情請見|回放\s*\+\s*1', re.I)
KEEPINFO = re.compile(
    r'時間|日期|上課|費用|適合|對象|課程編號|班課編號|營隊編號|老師|主講|地點|年級|'
    r'學費|堂|週|月|點|:|：')
URLONLY = re.compile(r'^[\[\(【（]?\s*(?:\*\*)?\s*https?://\S+\s*[\]\)】）]?\s*$')
HASHONLY = re.compile(r'^[#＃][^\s]{0,40}(\s+[#＃][^\s]{0,40})*$')

def is_noise(line):
    if URLONLY.match(line) or HASHONLY.match(line):
        return True
    if re.fullmatch(r'[\s=\-—─*·.。、]{0,}', line):
        return True
    if NOISE.search(line) and not KEEPINFO.search(line):
        return True
    return False

def clean_body(text, drop_promo):
    lines = [l.strip() for l in text.replace('\r', '').split('\n')]
    lines = [l for l in lines if l]
    if drop_promo:
        lines = trim_trailing_promo(lines)
    out = []
    for l in lines:
        if is_noise(l):
            continue
        c = clean_line(l)
        c = re.sub(r'\s*\[?https?://\S+\]?\s*', ' ', c).strip()
        c = re.sub(r'\s{2,}', ' ', c)
        if c and not re.fullmatch(r'[\s\W_]+', c):
            out.append(c)
    return out

# ---------- 產生 HTML ----------
def esc(s):
    return html.escape(str(s), quote=False)

def build_body_html(title, paras):
    head = ('<div class="is-container-in"><div class="remote-row clearfix"><div class="column full">'
            f'<h1 class="size-48 is-title1-48 is-title-bold">{esc(title)}</h1></div></div>')
    body = '<div class="remote-row clearfix"><div class="column half">'
    for p in paras:
        strong = len(p) < 40 and re.search(r'[‼️❗️🎯🔺🏆🥇👍🎖🔹🔸■●※]|^\d+[.、]|^【|^『|^「', p)
        inner = f'<strong>{esc(p)}</strong>' if strong else esc(p)
        body += f'<p class="normal-txt"><span style="font-size:22px;">{inner}</span></p>'
    body += '</div></div></div>'
    return head + body

TITLE_TRIM = re.compile(r'^[\s~～\-—–\*#=＝]+|[\s~～\-—–\*=＝]+$')
PAIRS = [('「', '」'), ('『', '』'), ('【', '】'), ('《', '》'), ('（', '）'), ('(', ')'), ('[', ']')]
def balance(t):
    for o, c in PAIRS:
        if t.startswith(o) and t.endswith(c):
            t = t[1:-1].strip()
    for o, c in PAIRS:
        if t.count(o) > t.count(c):
            t = t.replace(o, '', t.count(o) - t.count(c))
        elif t.count(c) > t.count(o):
            t = t.replace(c, '', t.count(c) - t.count(o))
    return t.strip()

def make_title(first_line, paras, prefix_out=None):
    fallback = paras[0] if paras else ''
    t = first_line or fallback
    t = re.sub(r'https?://\S+', '', t)
    t = re.sub(r'[#＃]\S+', '', t)
    t = TITLE_TRIM.sub('', t).strip()
    # 開頭若是「【今晚6/26(五)…】」這類時間提示，改用後面的主標題
    m = re.match(r'^\s*[【『\[]([^】』\]]{2,40})[】』\]]\s*(.+)$', t)
    if m and re.search(r'今晚|今早|今天|明天|明晚|本週|下週|週[一二三四五六日]|\d+/\d+|AM|PM|上午|下午|晚上', m.group(1)):
        rest = m.group(2).strip()
        if len(re.sub(r'\W', '', rest)) >= 8:
            t = rest
            if prefix_out is not None:
                prefix_out.append(m.group(1))
    t = balance(t)
    # 太短（例如只有「賀」）就再接下一段
    i = 0
    while len(re.sub(r'\W', '', t)) < 4 and i < len(paras):
        nxt = re.sub(r'https?://\S+', '', paras[i]).strip()
        if re.sub(r'\W', '', nxt) and nxt != t:
            t = (t + ' ' + nxt).strip() if t else nxt
        i += 1
    if len(t) > 52:
        m = [x for x in re.split(r'[，。！？!?～]', t) if x.strip()]
        if m and 8 <= len(m[0]) <= 52:
            t = m[0]
        else:
            t = t[:50] + '…'
    return balance(TITLE_TRIM.sub('', t).strip()) or fallback[:40]

def make_summary(paras, title):
    buf = []
    for p in paras:
        if p == title or len(re.sub(r'\W', '', p)) < 6:
            continue
        if re.match(r'^[#＃]', p) or PROMO_KEY.search(p) and len(p) < 30:
            continue
        buf.append(p)
        if sum(len(x) for x in buf) > 70:
            break
    s = '　'.join(buf) if buf else title
    s = re.sub(r'https?://\S+', '', s).strip()
    return (s[:96] + '…') if len(s) > 98 else s

def year_of(date):
    return (date or '')[:4]

def make_tags(cat_name, date, text, extra=None):
    tags = [cat_name]
    for kw in ['AMC', 'AIME', 'IMO', 'EGMO', 'IJSO', 'IPhO', 'USAMO', 'GGB', 'FA00',
               '科學班', '數資班', '學測', '會考', '資優數學', '微積分', '競賽', '前瞻營',
               '直播講座', '公開課', '榜單', '實體課', '啟蒙教育']:
        if kw in text and kw not in tags:
            tags.append(kw)
        if len(tags) >= 6:
            break
    y = year_of(date)
    if y:
        tags.append(y)
    for e in (extra or []):
        if e not in tags:
            tags.append(e)
    return tags[:8]

# ---------- 主流程 ----------
def post_id(url):
    m = re.search(r'(?:posts|permalink)/(\d+)', url or '')
    return m.group(1) if m else ''

def main():
    fb = json.load(open(os.path.join(XLDIR, 'fb-group-695697124716309-MERGED-FINAL.json'), encoding='utf-8-sig'))
    byurl = {p['url'].rstrip('/'): p for p in fb['posts']}

    # 自動採用編號最大的 Excel 版本（03、04、…）
    import glob as _glob
    xls = sorted(_glob.glob(os.path.join(XLDIR, '20260720FB社團貼文整理[0-9][0-9].xlsx')))
    xl_path = xls[-1] if xls else os.path.join(XLDIR, '20260720FB社團貼文整理03.xlsx')
    print('讀取 Excel:', os.path.basename(xl_path))
    wb = openpyxl.load_workbook(xl_path, read_only=True)
    ws = wb['貼文總表']
    # 課程總覽指定貼文（不論 Excel 標記皆納入，確保產出可重現）
    FORCE_COURSE_SEQ = {'964', '904', '920', '970', '977', '989', '928'}
    rows = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        if r[12] != '需放入' and str(r[0]) not in FORCE_COURSE_SEQ:
            continue
        url = (r[10] or '').rstrip('/')
        p = byurl.get(url)
        rows.append({
            'seq': str(r[0]), 'date': str(r[1] or '')[:10], 'title5': str(r[3] or ''),
            'npic': r[4], 'cat': str(r[6] or ''), 'code': str(r[7] or ''),
            'url': url, 'note': str(r[11] or ''), 'pid': post_id(url),
            'body': (p['body'] if p else '') or str(r[5] or ''),
        })

    # 課程總覽：一個課程類型一則（取最具代表性的 2026 貼文）
    COURSE_MAP = {
        '964': dict(file='course-s.html', slug='cheetah-course-S', code='2607S', level='高中',
                    category='高中數學S', bullets=['高一 S101／高二 S111', '高三 S12N 進度', '課綱＋加深加廣']),
        '904': dict(file='course-ggb.html', slug='cheetah-course-GGB', code='2602CMG', level='國小 / 國中',
                    category='電腦數學GGB', bullets=['GeoGebra 動態幾何', '3D 建模實作', 'AI 工具聯用']),
        '920': dict(file='course-amc-aime.html', slug='cheetah-course-AIME', code='2601AIME', level='國中 / 高中',
                    category='AMC／AIME', bullets=['AIME 考前衝刺', '深水區難題', 'USAMO 晉級線']),
        # 下面兩門實體課沒有對應的 legacy 課程頁，slug 需避開 deriveCourseFile
        # 會比對的關鍵字（fa00 / amc / ggb / science-camp / 單字 j,p,s），否則會覆蓋既有課程
        '970': dict(file='', slug='cheetah-course-onsite-elementary', code='2026實體P', level='國小',
                    category='小學實體課', title='【2026/07 獵豹小學實體課】隆重登場',
                    bullets=['大台北實體課', '小學資優數學', '示範教學']),
        '977': dict(file='', slug='cheetah-course-onsite-a8', code='2026實體A8', level='國小 / 國中',
                    category='AMC8實體課', bullets=['AMC8 實體課', 'AI 概念輔助教學', '專家模式訓練']),
        '989': dict(file='', slug='cheetah-course-onsite-beitou', code='2607北投實體', level='國小 / 國中 / 高中',
                    category='北投實體課', bullets=['薇閣／幼華專班', '私校進度銜接', '小四～高中']),
        # 928 併入既有「科學班前瞻營」課程頁（slug 保持 legacy-course-science-camp）
        '928': dict(file='course-science-camp.html', slug='legacy-course-science-camp', code='2602SPrep', level='國中',
                    category='科學班前瞻營', title='科學班前瞻營～獵豹的專家模式備考',
                    bullets=['前瞻營模考', '專家思維模式', '超額訓練＋前瞻題型']),
    }
    COURSE_SKIP = {'898', '906', '917', '921', '922', '925'}

    # 與網站既有文章重複，或圖卡／純連結分享無實質內文 —— 不產生檔案
    SKIP_PID = {
        '1142031846749499', '1116387222647295', '1116148629337821', '1063793854573299',
        '938280853791267', '889037938715559', '794717838147570', '793276181625069',
        '702538584032163',
        '2036253520660656', '2036250113994330', '2034387217513953', '2033669824252359',
        '944012979884721', '1263091537976862', '1518943379058342', '1518930895726257',
        '1518933249059355', '2024225011863507',
    }
    # 產生後人工修訂過的標題
    TITLE_OVERRIDE = {
        '730530291232992': '專家模式～用「極端值分析」破解帽子問題',
        '981682226117796': '賀 獵豹學子 Jackie Wang 錄取 CMU 計算機科學',
    }

    made = {'columns': [], 'elite': [], 'news': [], 'courses': []}
    skipped = []

    for it in rows:
        cat = it['cat']
        if it['pid'] in SKIP_PID:
            skipped.append((it['seq'], cat, 'duplicate-or-empty'))
            continue
        is_article = cat.startswith('文章專欄')
        paras = clean_body(it['body'], drop_promo=is_article or cat in ('榜單捷報', '學生心得'))
        if not paras:
            skipped.append((it['seq'], cat, 'empty-after-clean'))
            continue
        first = clean_line(it['title5'].split(' / ')[0].strip()) or paras[0]
        pref = []
        title = TITLE_OVERRIDE.get(it['pid']) or make_title(first, paras, pref)
        tkey = re.sub(r'\W', '', title)
        body_paras = []
        for i, p in enumerate(paras):
            pkey = re.sub(r'\W', '', p)
            if i < 2 and tkey and (pkey == tkey or (len(pkey) < 60 and (pkey.startswith(tkey) or tkey.startswith(pkey)))):
                continue
            body_paras.append(p)
        if not body_paras:
            body_paras = paras
        summary = make_summary(body_paras, title)
        text_all = ' '.join(paras)
        bodyHtml = build_body_html(title, body_paras)
        base = dict(
            title=title, date=it['date'], summary=summary, excerpt=summary,
            sourceUrl=it['url'] + '/', coverImage='', imageUrl='', imageName='',
            keep='保留', bodyHtml=bodyHtml,
            notes=f"2026-07-20 由 FB 社團貼文（序 {it['seq']}）匯入" + (f"；清理：{it['note']}" if it['note'] else ''),
            migrationPage='fb-group-import-20260720',
            listDescription=summary, popularity=0, freshness=0,
        )
        base['_prefix'] = pref[0] if pref else ''

        if is_article:
            cslug, cname = CATSLUG[cat]
            made['columns'].append(dict(base,
                slug=f'{cslug}-{it["pid"]}', category=cname, categorySlug=cslug,
                bucket='文章專欄', tags=make_tags(cname, it['date'], text_all, ['文章專欄']),
                keywords=[], targetPage='columns.html', detailImages=[],
                legacyId=0, legacyCategoryId=0, legacyCategoryUrl='', coverLabel=''))
        elif cat in ('榜單捷報', '學生心得'):
            ecat = '榜單文章' if cat == '榜單捷報' else '學生成果文章'
            made['elite'].append(dict(base,
                slug=f'cheetah-elite-{it["pid"]}', category=ecat, categorySlug='',
                bucket='獵豹菁英', tags=make_tags(ecat, it['date'], text_all, ['獵豹菁英']),
                keywords=[], targetPage='students.html'))
        elif cat in ('直播講座', '活動發布'):
            ncat = '直播講座' if cat == '直播講座' else '活動訊息'
            pre = 'lecture' if cat == '直播講座' else 'event'
            made['news'].append(dict(base,
                slug=f'{pre}-{it["pid"]}', category=ncat, coverLabel=ncat,
                tags=make_tags(ncat, it['date'], text_all, ['最新消息']),
                keywords=[], targetPage='news.html', popularity=82, freshness=95))
        elif cat == '課程發布':
            cfg = COURSE_MAP.get(it['seq'])
            if not cfg:
                skipped.append((it['seq'], cat, 'course-duplicate'))
                continue
            ctitle = cfg.get('title') or title
            csummary = summary
            cbody = bodyHtml
            if cfg.get('title'):
                cbody = build_body_html(ctitle, body_paras)
                csummary = make_summary(body_paras, ctitle)
            made['courses'].append(dict(base,
                title=ctitle, summary=csummary, excerpt=csummary, listDescription=csummary, bodyHtml=cbody,
                slug=cfg['slug'], file=cfg['file'], code=cfg['code'], level=cfg['level'],
                category=cfg['category'], bucket='課程總覽', detailImages=[],
                tags=make_tags(cfg['category'], it['date'], text_all, ['課程總覽']),
                keywords=[], bullets=cfg['bullets'], targetPage='courses.html',
                popularity=84, freshness=92))

    order = ['slug', 'title', 'date', 'category', 'categorySlug', 'bucket', 'code', 'level', 'file',
             'summary', 'excerpt', 'sourceUrl', 'coverImage', 'detailImages', 'imageUrl', 'imageName',
             'coverLabel', 'tags', 'keywords', 'bullets', 'keep', 'targetPage', 'bodyHtml', 'notes',
             'migrationPage', 'listDescription', 'legacyId', 'legacyCategoryId', 'legacyCategoryUrl',
             'popularity', 'freshness']

    # 同一活動多次宣傳會產生相同標題，補上區別標記
    for items in made.values():
        seen = {}
        for it in items:
            seen.setdefault(it['title'], []).append(it)
        for title, group in seen.items():
            if len(group) < 2:
                continue
            for it in group:
                pre = it.pop('_prefix', '') or ''
                if re.search(r'今早|今晚|今天|就在今|明[天晚]', pre):
                    mark = '（當日提醒）'
                elif re.search(r'本週|下週|週[一二三四五六日]', pre):
                    mark = '（活動預告）'
                else:
                    mark = f'（{it["date"][5:].replace("-", "/")} 公告）'
                it['title'] = title + mark
                it['bodyHtml'] = it['bodyHtml'].replace(
                    f'is-title-bold">{esc(title)}</h1>', f'is-title-bold">{esc(it["title"])}</h1>', 1)
    for items in made.values():
        for it in items:
            it.pop('_prefix', None)

    for section, items in made.items():
        d = os.path.join(OUT, section)
        os.makedirs(d, exist_ok=True)
        for it in items:
            ordered = {k: it[k] for k in order if k in it}
            with open(os.path.join(d, it['slug'] + '.json'), 'w', encoding='utf-8-sig') as f:
                json.dump(ordered, f, ensure_ascii=False, indent=2)
                f.write('\n')
        print(f'{section}: {len(items)}')
    print('skipped:', len(skipped))
    for s in skipped:
        print('  ', s)

main()
