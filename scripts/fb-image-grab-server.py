# -*- coding: utf-8 -*-
"""FB 圖片抓取服務（v2，2026-07-21）：頁面用 window.open('/grab?name=&u=ENCODED') 把新鮮
   簽章網址傳來，伺服器端下載並存原檔（不縮小，供內文使用）。另存縮圖給預覽卡片。
   - /grab   : 下載原圖存 fbimg-{name}-{n}.jpg（保留原解析度，上限 2048px 防爆），並產生
               縮圖 fbimg-{name}-{n}.thumb.jpg（<=600px, q80）。回傳極小 HTML 供分頁自動關閉。
   - /ping   : 健康檢查。
   FB 的 CSP 擋 fetch/iframe/img，只有頂層導覽能穿透；工具會遮蔽含 query string 的回傳，
   故不能把網址帶回模型端 curl。"""
import os, io, http.server, socketserver, urllib.request, ssl, json
from urllib.parse import urlparse, parse_qs

STAGE = r'C:\Users\liyun\AppData\Local\Temp\claude\E--20260323-LiyunWG-Cheetah-website--claude-worktrees-fb-posts-category-adjustment-4ea8dd\61582335-5611-41b3-af17-ce10f22170ee\scratchpad\fbimg-hires'
os.makedirs(STAGE, exist_ok=True)
PORT = 8790
FULL_CAP = 2048   # 原圖上限（FB 通常最大 ~2048）
THUMB_MAX = 600   # 卡片縮圖
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
HDR = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
       'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8'}
LOG = os.path.join(STAGE, '_log.jsonl')

try:
    from PIL import Image
    HAVE_PIL = True
except Exception:
    HAVE_PIL = False

def log(rec):
    with open(LOG, 'a', encoding='utf-8') as f:
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')

class H(http.server.BaseHTTPRequestHandler):
    def _send(self, code, body=b'', ctype='text/html; charset=utf-8'):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', ctype)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self):
        p = urlparse(self.path); q = parse_qs(p.query)
        if p.path == '/ping':
            files = [x for x in os.listdir(STAGE) if not x.startswith('_') and not x.endswith('.thumb.jpg')]
            return self._send(200, ('OK %d full files' % len(files)).encode())
        if p.path == '/grab':
            prefix = os.path.basename(q.get('name', ['fbimg'])[0]).replace('..', '')
            urls = q.get('u', [])
            idx0 = q.get('idx', [None])[0]
            results = []
            for i, url in enumerate(urls, 1):
                n = int(idx0) if idx0 else i
                name = '%s-%d.jpg' % (prefix, n)
                rec = {'name': name}
                try:
                    r = urllib.request.urlopen(urllib.request.Request(url, headers=HDR), timeout=30, context=CTX)
                    data = r.read()
                    if HAVE_PIL:
                        try:
                            im = Image.open(io.BytesIO(data)); im = im.convert('RGB')
                            w, h = im.size; m = max(w, h)
                            if m < 400:  # 太小＝抓到佔位圖/縮圖，拒存讓前端重試
                                rec['ok'] = False; rec['err'] = 'too_small_%dx%d' % (w, h)
                                log(rec); results.append(rec); continue
                            full = im
                            if m > FULL_CAP:
                                full = im.resize((round(w*FULL_CAP/m), round(h*FULL_CAP/m)), Image.LANCZOS)
                            out = io.BytesIO(); full.save(out, 'JPEG', quality=90, optimize=True)
                            data = out.getvalue()
                            rec['dim'] = '%dx%d' % full.size
                            # 縮圖
                            tw, th = full.size; tm = max(tw, th)
                            th_im = full if tm <= THUMB_MAX else full.resize((round(tw*THUMB_MAX/tm), round(th*THUMB_MAX/tm)), Image.LANCZOS)
                            tout = io.BytesIO(); th_im.save(tout, 'JPEG', quality=80, optimize=True)
                            with open(os.path.join(STAGE, name.replace('.jpg', '.thumb.jpg')), 'wb') as tf:
                                tf.write(tout.getvalue())
                        except Exception as e:
                            rec['resize_err'] = str(e)[:80]
                    with open(os.path.join(STAGE, name), 'wb') as f:
                        f.write(data)
                    rec['ok'] = True; rec['bytes'] = len(data)
                except Exception as e:
                    rec['ok'] = False; rec['err'] = str(e)[:120]
                log(rec); results.append(rec)
            body = (b'<!doctype html><meta charset=utf-8><body>DONE '
                    + json.dumps(results, ensure_ascii=False).encode())
            return self._send(200, body)
        return self._send(404, b'nope')

    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), H) as httpd:
    print('grab server v2 on', PORT, '| PIL', HAVE_PIL, '| stage', STAGE)
    httpd.serve_forever()
