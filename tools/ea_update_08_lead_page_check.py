#!/usr/bin/env python3
from pathlib import Path
import sys, re, hashlib
ROOT = Path(__file__).resolve().parents[1]
errors=[]
page = ROOT / 'reserver-diagnostic' / 'index.html'
text = page.read_text(encoding='utf-8')

def count(needle):
    return text.count(needle)

# New CSS bundle must be active once.
if count('/assets/lead-page/reserver-diagnostic-page.css?v=ea-update-08') != 1:
    errors.append('lead CSS bundle is not linked exactly once')

# Old CSS links must not be active on the lead page.
if '/assets/lead-page/reserver-diagnostic.css' in text:
    errors.append('old base lead CSS link is still active')
if '/assets/lead-page/reserver-diagnostic-polish.css' in text:
    errors.append('old polish lead CSS link is still active')

# Protected JavaScript and tracking references must remain.
protected = [
    '/assets/lead-page/reserver-diagnostic.js?v=lead-fix-20260617-01',
    '/assets/js/analytics.js',
    'fbq(\'init\', \'2322425664833523\')',
    'fbq(\'track\', \'PageView\')',
    'sessionStorage.getItem(\'lead_submitted\')',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://www.googletagmanager.com',
    '<link rel="canonical" href="https://elboubakry.com/reserver-diagnostic/"/>'
]
for needle in protected:
    if needle not in text:
        errors.append(f'protected reference missing: {needle}')

font_url='https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap'
if f'<link rel="preload" as="style" href="{font_url}" onload="this.onload=null;this.rel=\'stylesheet\'"/>' not in text:
    errors.append('non-render-blocking Google Fonts preload/onload link missing')
if f'<noscript><link rel="stylesheet" href="{font_url}"/></noscript>' not in text:
    errors.append('Google Fonts noscript fallback missing')

bundle = ROOT / 'assets' / 'lead-page' / 'reserver-diagnostic-page.css'
base = ROOT / 'assets' / 'lead-page' / 'reserver-diagnostic.css'
polish = ROOT / 'assets' / 'lead-page' / 'reserver-diagnostic-polish.css'
if not bundle.exists():
    errors.append('missing lead CSS bundle file')
else:
    btext = bundle.read_text(encoding='utf-8')
    if 'Original: reserver-diagnostic.css' not in btext or 'Original: reserver-diagnostic-polish.css' not in btext:
        errors.append('bundle provenance comments missing')
    if base.read_text(encoding='utf-8').strip() not in btext:
        errors.append('base lead CSS content not preserved in bundle')
    if polish.read_text(encoding='utf-8').strip() not in btext:
        errors.append('polish lead CSS content not preserved in bundle')

# Ensure unrelated high-risk pages were not pointed to lead bundle accidentally.
for other in ['index.html','merci/index.html','services/index.html','insights/index.html']:
    p=ROOT / other
    if p.exists() and '/assets/lead-page/reserver-diagnostic-page.css?v=ea-update-08' in p.read_text(encoding='utf-8'):
        errors.append(f'lead CSS bundle accidentally added to {other}')

if errors:
    print('EA Update 08 verification: FAIL')
    for err in errors:
        print(' -', err)
    sys.exit(1)
print('EA Update 08 verification: PASS')
print('Lead page CSS consolidation: 2 local CSS links replaced by 1 bundle')
print('Lead JS/form/tracking references preserved')
