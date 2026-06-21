#!/usr/bin/env python3
from pathlib import Path
import re, sys, hashlib
ROOT = Path(__file__).resolve().parents[1]
index = ROOT / 'index.html'
html = index.read_text(encoding='utf-8')
css_links = re.findall(r'<link[^>]+rel="stylesheet"[^>]*>|<link[^>]+rel="stylesheet"[^>]*>', html)
# More robust count: just href stylesheet links around CSS area.
count = len(re.findall(r'<link[^>]+rel="stylesheet"', html)) + len(re.findall(r'<link[^>]+rel="stylesheet"', html))
# Attribute order differs, so count link tags that contain rel="stylesheet" OR rel before href not enough.
count = len([m.group(0) for m in re.finditer(r'<link[^>]*>', html) if 'rel="stylesheet"' in m.group(0)])
expected = 12 + 1  # 12 local CSS + 1 Google Font stylesheet
errors = []
if count != expected:
    errors.append(f'Expected {expected} stylesheet links on homepage including Google Font, found {count}')
required_any = [
    ['/assets/css/pages/home-shared-pre.css?v=ea-update-10', '/assets/css/pages/home-shared-pre.css?v=ea-update-11'],
    ['/assets/css/elboubakry-mobile-performance-safe.css?v=20260617-menu-clean'],
    ['/assets/css/pages/home-shared-post.css?v=ea-update-10', '/assets/css/pages/home-shared-post.css?v=ea-update-11'],
    ['/assets/css/pages/home-mobile.css?v=ea-update-02'],
    ['/assets/css/pages/home-desktop.css?v=ea-update-03'],
]
required = [next((h for h in group if h in html), group[0]) for group in required_any]
for group in required_any:
    if not any(href in html for href in group):
        errors.append(f'Missing required CSS link option: {group}')
removed = [
    '/assets/css/main.css?v=20260617-menu-clean',
    '/assets/css/abdessamad-polish.css?v=20260617-menu-clean',
    '/assets/css/elboubakry-growth-system.css?v=20260619-mobile-repair',
    '/assets/css/elboubakry-upgrade-07-uiux.css?v=20260617-menu-pro',
]
for href in removed:
    if href in html:
        errors.append(f'Old unbundled homepage CSS link still active: {href}')
# Check order criticality.
order = [html.find(h) for h in required]
if any(i < 0 for i in order) or order != sorted(order):
    errors.append('Critical homepage CSS order is not preserved')
for rel in ['assets/css/pages/home-shared-pre.css','assets/css/pages/home-shared-post.css']:
    p = ROOT / rel
    if not p.exists() or p.stat().st_size == 0:
        errors.append(f'Missing/empty bundle: {rel}')
if 'imagesizes="(max-width: 768px) 72vw"' in html or 'imagesizes="(min-width: 769px) 42vw"' in html:
    errors.append('Old verbose imagesizes syntax still present')
if 'imagesizes="72vw"' not in html or 'imagesizes="42vw"' not in html:
    errors.append('Normalized LCP imagesizes values missing')
if errors:
    print('EA Update 10 verification: FAIL')
    for e in errors:
        print('-', e)
    sys.exit(1)
print('EA Update 10 verification: PASS')
print('Homepage stylesheet links including Google Font:', count)
print('Local homepage CSS links:', count - 1)
print('Homepage local CSS request reduction: 25 -> 12')
