#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import json, sys
BASE=Path(__file__).resolve().parents[1]
services=['consultant-marketing-digital-maroc','generation-leads-maroc','landing-page-lead-generation-maroc','meta-ads-maroc','google-ads-maroc','seo-maroc','content-marketing-maroc','automatisation-marketing-ia-maroc']
errors=[]
for slug in services:
    p=BASE/'services'/slug/'index.html'
    if not p.exists(): errors.append(f'missing {p}'); continue
    soup=BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser')
    if not soup.title or not soup.title.get_text(strip=True): errors.append(f'missing title {slug}')
    if not soup.find('meta', attrs={'name':'description'}): errors.append(f'missing description {slug}')
    if not soup.find('meta', attrs={'name':'ea:primary-keyword'}): errors.append(f'missing primary keyword meta {slug}')
    if len(soup.find_all('link', attrs={'data-ea-seo-cluster':'update-15'})) < 2: errors.append(f'missing related cluster links {slug}')
    ok=False
    for s in soup.find_all('script', type='application/ld+json'):
        try: obj=json.loads(s.string or s.get_text())
        except Exception: continue
        arr=obj if isinstance(obj,list) else [obj]
        for item in arr:
            if item.get('@type')=='Service' and item.get('keywords') and item.get('audience') and item.get('areaServed'):
                ok=True
    if not ok: errors.append(f'missing enhanced Service schema {slug}')
km=BASE/'assets/data/seo-keyword-map.json'
if not km.exists(): errors.append('missing keyword map')
else:
    data=json.loads(km.read_text(encoding='utf-8'))
    if len(data.get('pages',[])) < 10: errors.append('keyword map incomplete')
if errors:
    print('FAIL: EA Update 15 verification')
    for e in errors: print(' -',e)
    sys.exit(1)
print('PASS: EA Update 15 keyword map + service SEO verification')
print('Service pages checked:', len(services))
print('Keyword map:', km.relative_to(BASE))
