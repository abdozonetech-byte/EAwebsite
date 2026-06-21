#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import json, sys
ROOT = Path(__file__).resolve().parents[1]
SERVICE_SLUGS = [
 'consultant-marketing-digital-maroc','generation-leads-maroc','landing-page-lead-generation-maroc','meta-ads-maroc','google-ads-maroc','seo-maroc','content-marketing-maroc','automatisation-marketing-ia-maroc'
]
errors=[]
for slug in SERVICE_SLUGS:
    path=ROOT/'services'/slug/'index.html'
    if not path.exists():
        errors.append(f'Missing page: {slug}')
        continue
    soup=BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    if not soup.find(id='services-lies'):
        errors.append(f'Missing related section: {slug}')
    if not soup.select_one('section#use-cases .ea-services-section-head [data-ea-update="16-usecase-context"]'):
        errors.append(f'Missing use-case SEO paragraph: {slug}')
    if not soup.select_one('section#faq .ea-services-faq article[data-ea-update="16-faq"]'):
        errors.append(f'Missing added FAQ: {slug}')
    if not soup.head.find('meta', attrs={'name':'ea:update-16'}):
        errors.append(f'Missing update meta: {slug}')
    txt='\n'.join(s.string or '' for s in soup.find_all('script', type='application/ld+json'))
    if 'serviceOutput' not in txt or '#ea-update-16-related-itemlist' not in txt:
        errors.append(f'Missing JSON-LD update: {slug}')

diag=ROOT/'reserver-diagnostic'/'index.html'
if diag.exists():
    soup=BeautifulSoup(diag.read_text(encoding='utf-8'), 'html.parser')
    if not soup.head.find('meta', attrs={'name':'ea:update-16'}): errors.append('Diagnostic missing update meta')
    if len(soup.head.find_all('link', attrs={'rel':'related', 'data-ea-update':'16'})) < 5: errors.append('Diagnostic missing related links')
else:
    errors.append('Missing diagnostic page')

lock=ROOT/'docs'/'EA_UPDATE_16_SERVICE_PAGES_CONTENT_SEO_LOCK.json'
if not lock.exists():
    errors.append('Missing lock file')
else:
    data=json.loads(lock.read_text(encoding='utf-8'))
    if data.get('css_js_changed'):
        errors.append('CSS/JS changed unexpectedly: '+', '.join(data.get('css_js_changed_files', [])))

if errors:
    print('FAIL: EA Update 16 service content SEO check')
    for e in errors: print('-', e)
    sys.exit(1)
print('PASS: EA Update 16 service content SEO check')
print(f'Service pages checked: {len(SERVICE_SLUGS)}')
print('CSS/JS changed: NO')
