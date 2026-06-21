#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import json, re, sys
BASE=Path(__file__).resolve().parents[1]
required=[
 'insights/generation-leads-qualifies-maroc/index.html',
 'insights/pourquoi-publicites-facebook-ne-generent-pas-clients/index.html',
 'insights/combien-coute-campagne-meta-ads-maroc/index.html',
 'insights/strategie-digitale-pme-maroc/index.html',
]
missing=[p for p in required if not (BASE/p).exists()]
if missing:
    print('FAIL missing pages', missing); sys.exit(1)
for p in required:
    html=(BASE/p).read_text(encoding='utf-8')
    soup=BeautifulSoup(html,'html.parser')
    if not soup.find('link', rel='canonical'):
        print('FAIL no canonical',p); sys.exit(1)
    if not soup.find('script', attrs={'type':'application/ld+json'}):
        print('FAIL no JSON-LD',p); sys.exit(1)
    if not soup.find('h1'):
        print('FAIL no H1',p); sys.exit(1)
    text=soup.get_text(' ', strip=True)
    if 'Réserver un diagnostic gratuit' not in text:
        print('FAIL no CTA',p); sys.exit(1)
js=(BASE/'assets/data/insights-articles.js').read_text(encoding='utf-8')
arr=json.loads(re.search(r'=\s*(\[.*\])\s*;', js, re.S).group(1))
ids=[x['id'] for x in arr]
for id_ in ['pourquoi-publicites-facebook-ne-generent-pas-clients','combien-coute-campagne-meta-ads-maroc']:
    if id_ not in ids:
        print('FAIL missing article data',id_); sys.exit(1)
sitemap=(BASE/'sitemap.xml').read_text(encoding='utf-8')
for url in ['/insights/pourquoi-publicites-facebook-ne-generent-pas-clients/','/insights/combien-coute-campagne-meta-ads-maroc/']:
    if 'https://elboubakry.com'+url not in sitemap:
        print('FAIL missing sitemap url',url); sys.exit(1)
print('PASS: EA Update 17 first SEO articles check')
print('Article data count:', len(arr))
