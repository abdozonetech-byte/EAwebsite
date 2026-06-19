#!/usr/bin/env python3
from pathlib import Path
import sys, re
ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted((ROOT / 'services').glob('**/index.html'))
errors=[]
for p in PAGES:
    text=p.read_text(encoding='utf-8')
    rel=p.relative_to(ROOT)
    if text.count('/assets/css/pages/services-desktop-plugins.css?v=ea-update-07') != 1:
        errors.append(f'{rel}: services desktop plugin bundle count is not 1')
    if text.count('/assets/css/pages/services-mobile.css?v=ea-update-07') != 1:
        errors.append(f'{rel}: services mobile bundle count is not 1')
    old=[
        '/assets/css/vendor/animate.min.css?v=',
        '/assets/css/plugins/swiper.min.css?v=',
        '/assets/css/plugins/nice-select.css?v=',
        '/assets/css/vendor/magnific-popup.css?v=',
        '/assets/css/elboubakry-mobile-menu-blanc-bleu-reference.css?v=',
        '/assets/css/elboubakry-mobile-performance-safe.css?v=',
        '/assets/css/elboubakry-mobile-performance-ultra.css?v=',
    ]
    for needle in old:
        if needle in text:
            errors.append(f'{rel}: old services CSS still active: {needle}')
    protected=[
        '/assets/css/vendor/bootstrap.min.css',
        '/assets/css/vendor/spacing.css',
        '/assets/css/vendor-subsets/remixicon-site-subset.css',
        '/assets/css/main.css',
        '/assets/css/abdessamad-polish.css',
        '/assets/css/elboubakry-footer-premium.css',
        '/assets/css/elboubakry-services-hub.css',
        'https://fonts.googleapis.com/css2?family=Urbanist',
        '/assets/js/analytics.js',
    ]
    for needle in protected:
        if needle not in text:
            errors.append(f'{rel}: protected reference missing: {needle}')
    # Keep desktop JS conditional loader unchanged and mobile core unchanged
    if '/assets/js/elboubakry-mobile-core-optimized.js?v=mobile-core-09' not in text:
        errors.append(f'{rel}: mobile core JS missing')
    if 'var desktopScripts = [' not in text:
        errors.append(f'{rel}: desktop script loader missing')

for file in ['assets/css/pages/services-desktop-plugins.css','assets/css/pages/services-mobile.css']:
    if not (ROOT/file).exists(): errors.append(f'missing {file}')
if errors:
    print('EA Update 07 verification: FAIL')
    for err in errors: print(' -', err)
    sys.exit(1)
print('EA Update 07 verification: PASS')
print(f'Services pages checked: {len(PAGES)}')
print('CSS consolidation: 7 services-page CSS links replaced by 2 bundles per services page')
