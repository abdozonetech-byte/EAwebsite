#!/usr/bin/env python3
"""EA Update 09 verification: safe font/image resource cleanup.
Run from project root: python3 tools/ea_update_09_resource_audit_check.py
"""
from pathlib import Path
from bs4 import BeautifulSoup
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
FONT = "https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
errors = []
html_pages = sorted(ROOT.rglob('*.html'))

font_pages = []
blocking_font_pages = []
safe_font_pages = []
missing_image_dimensions = []
small_arrow_pages = []

for page in html_pages:
    text = page.read_text(encoding='utf-8', errors='ignore')
    rel = page.relative_to(ROOT).as_posix()
    if FONT in text:
        font_pages.append(rel)
        has_safe_preload_onload = f'<link rel="preload" as="style" href="{FONT}" onload="this.onload=null;this.rel=\'stylesheet\'"/>' in text
        has_media_print = f'<link rel="stylesheet" href="{FONT}" media="print" onload="this.media=\'all\'"/>' in text
        has_preload = f'<link rel="preload" as="style" href="{FONT}"' in text
        has_noscript = '<noscript>' in text and FONT in text
        if has_preload and (has_safe_preload_onload or has_media_print) and has_noscript:
            safe_font_pages.append(rel)
        else:
            errors.append(f'Unsafe or incomplete font loading pattern: {rel}')

        soup_no_noscript = BeautifulSoup(text, 'html.parser')
        for ns in soup_no_noscript.find_all('noscript'):
            ns.extract()
        for link in soup_no_noscript.find_all('link'):
            href = link.get('href', '')
            rels = link.get('rel') or []
            if FONT in href and 'stylesheet' in rels:
                media = (link.get('media') or '').strip().lower()
                onload = link.get('onload') or ''
                # media=print/onload is intentionally non-render-blocking.
                if not (media == 'print' and "this.media='all'" in onload):
                    blocking_font_pages.append(rel)

    soup = BeautifulSoup(text, 'html.parser')
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if src.startswith('https://www.facebook.com'):
            continue
        if not img.get('width') or not img.get('height'):
            missing_image_dimensions.append({
                'page': rel,
                'src': src,
                'html': str(img)[:180]
            })
        if src.endswith('/assets/images/shape/small-arrow.png'):
            small_arrow_pages.append(rel)
            if img.get('width') != '45' or img.get('height') != '20':
                errors.append(f'small-arrow dimensions missing or changed: {rel}')

if blocking_font_pages:
    errors.append('Blocking Urbanist stylesheet remains outside noscript: ' + ', '.join(sorted(set(blocking_font_pages))[:8]))
if missing_image_dimensions:
    errors.append(f'{len(missing_image_dimensions)} local img tags are missing width/height')

index = (ROOT / 'index.html').read_text(encoding='utf-8')
protected_index_refs = [
    '/assets/css/pages/home-mobile.css?v=ea-update-02',
    '/assets/css/pages/home-desktop.css?v=ea-update-03',
    '/assets/js/elboubakry-mobile-core-optimized.js?v=mobile-core-09',
    '/assets/js/elboubakry-mockup-carousel.js?v=20260617-menu-clean',
    "fbq('init', '2322425664833523')",
    '<link href="https://elboubakry.com/" rel="canonical"/>'
]
for needle in protected_index_refs:
    if needle not in index:
        errors.append(f'Protected homepage reference missing: {needle}')

lead = (ROOT / 'reserver-diagnostic' / 'index.html').read_text(encoding='utf-8')
protected_lead_refs = [
    '/assets/lead-page/reserver-diagnostic-page.css?v=ea-update-08',
    '/assets/lead-page/reserver-diagnostic.js?v=lead-fix-20260617-01',
    "fbq('init', '2322425664833523')",
    '<link rel="canonical" href="https://elboubakry.com/reserver-diagnostic/"/>'
]
for needle in protected_lead_refs:
    if needle not in lead:
        errors.append(f'Protected lead-page reference missing: {needle}')

summary = {
    'status': 'PASS' if not errors else 'FAIL',
    'html_pages_checked': len(html_pages),
    'font_pages_checked': len(font_pages),
    'safe_font_pages': len(safe_font_pages),
    'blocking_font_pages': sorted(set(blocking_font_pages)),
    'local_images_missing_width_or_height': len(missing_image_dimensions),
    'small_arrow_pages_fixed': sorted(set(small_arrow_pages)),
    'errors': errors,
}
print(json.dumps(summary, ensure_ascii=False, indent=2))
if errors:
    sys.exit(1)
