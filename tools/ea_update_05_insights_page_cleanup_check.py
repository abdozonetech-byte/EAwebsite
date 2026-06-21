#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import sys
root = Path(__file__).resolve().parents[1]
targets = [root/'about-elboubakry-abdessamad/index.html'] + sorted((root/'insights').rglob('index.html'))
fail=[]
for p in targets:
    soup=BeautifulSoup(p.read_text(errors='ignore'), 'html.parser')
    rel=str(p.relative_to(root))
    for href in ['/assets/css/plugins/swiper.min.css','/assets/css/plugins/nice-select.css','/assets/css/vendor/magnific-popup.css']:
        tag=soup.find('link', href=lambda v: v and v.split('?',1)[0] == href)
        if not tag or tag.get('media') != '(min-width: 769px)':
            fail.append(f'{rel}: expected desktop media on {href}')
    animate=soup.find('link', href=lambda v: v and v.split('?',1)[0] == '/assets/css/vendor/animate.min.css')
    if rel == 'insights/index.html':
        if animate and animate.get('media') == '(min-width: 769px)':
            fail.append('insights/index.html: animate must remain unchanged for hub animations')
    else:
        if not animate or animate.get('media') != '(min-width: 769px)':
            fail.append(f'{rel}: expected desktop media on animate.min.css')
    for s in soup.find_all('script'):
        src=s.get('src')
        if not src or '/assets/js/analytics.js' in src:
            continue
        if src.startswith('/assets/js/') or src.startswith('/assets/data/'):
            if not s.has_attr('defer'):
                fail.append(f'{rel}: missing defer on {src}')
if fail:
    print('FAIL')
    for f in fail[:50]: print('-',f)
    print(f'Total failures: {len(fail)}')
    sys.exit(1)
print('PASS: Update 05 insights/about cleanup verified')
print(f'Checked pages: {len(targets)}')
