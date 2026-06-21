#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
import json, re, sys, xml.etree.ElementTree as ET
root = Path(__file__).resolve().parents[1]
errors = []
SITE = 'https://elboubakry.com'

def rel_url(path):
    rel = path.relative_to(root).as_posix()
    if rel == 'index.html': return SITE + '/'
    if rel.endswith('/index.html'): return SITE + '/' + rel[:-len('index.html')]
    return SITE + '/' + rel

def jsonld_items(soup):
    items=[]
    for s in soup.find_all('script', type='application/ld+json'):
        try:
            data=json.loads(s.string or s.get_text())
        except Exception as e:
            errors.append(f'Invalid JSON-LD: {e}')
            continue
        if isinstance(data, list): items.extend(data)
        else: items.append(data)
    return items

canonicals=[]
for p in sorted(root.rglob('index.html')):
    rel = p.relative_to(root).as_posix()
    soup = BeautifulSoup(p.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    is_merci = rel.startswith('merci/')
    if soup.html and soup.html.get('lang') != 'fr-MA':
        errors.append(f'{rel}: html lang is not fr-MA')
    title = soup.title.get_text(strip=True) if soup.title else ''
    desc = soup.find('meta', attrs={'name':'description'})
    canon = soup.find('link', rel='canonical')
    robots = soup.find('meta', attrs={'name':'robots'})
    if not title: errors.append(f'{rel}: missing title')
    if not desc or not desc.get('content','').strip(): errors.append(f'{rel}: missing description')
    if not canon or not canon.get('href','').startswith(SITE): errors.append(f'{rel}: missing/invalid canonical')
    if not robots: errors.append(f'{rel}: missing robots')
    if is_merci:
        if 'noindex' not in robots.get('content',''):
            errors.append(f'{rel}: merci page must be noindex')
    else:
        if not soup.find('h1'): errors.append(f'{rel}: missing h1')
        if not soup.find('meta', property='og:locale'): errors.append(f'{rel}: missing og:locale')
        if not soup.find('meta', property='og:site_name'): errors.append(f'{rel}: missing og:site_name')
        if not soup.find('link', rel='alternate', hreflang='fr-MA'): errors.append(f'{rel}: missing fr-MA alternate')
        if canon: canonicals.append(canon['href'])
    _ = jsonld_items(soup)

# Homepage breadcrumb
home_soup=BeautifulSoup((root/'index.html').read_text(encoding='utf-8', errors='ignore'), 'html.parser')
home_types=[x.get('@type') for x in jsonld_items(home_soup) if isinstance(x,dict)]
if 'BreadcrumbList' not in home_types:
    errors.append('homepage missing BreadcrumbList JSON-LD')

# Sitemap validation
sitemap=(root/'sitemap.xml').read_text(encoding='utf-8')
try:
    ns={'sm':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    tree=ET.fromstring(sitemap)
    locs=[el.text for el in tree.findall('sm:url/sm:loc', ns)]
except Exception as e:
    errors.append(f'sitemap invalid XML: {e}')
    locs=[]
if SITE+'/merci/' in locs:
    errors.append('/merci/ should not be in sitemap')
missing=[c for c in canonicals if c not in locs]
if missing:
    errors.append('sitemap missing canonicals: '+', '.join(missing[:5]))

headers=(root/'_headers').read_text(encoding='utf-8', errors='ignore')
if '/merci/' not in headers or 'X-Robots-Tag: noindex, follow' not in headers:
    errors.append('_headers missing /merci/ noindex')
if '/sitemap.xml' not in headers or 'application/xml' not in headers:
    errors.append('_headers missing sitemap XML content-type')

if errors:
    print('FAIL: EA Update 14 SEO check')
    for e in errors:
        print('-', e)
    sys.exit(1)
print('PASS: EA Update 14 Google SEO Starter Guide check')
print(f'Indexable canonical URLs in sitemap: {len(locs)}')
