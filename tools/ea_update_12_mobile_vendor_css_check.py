#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
index=root/'index.html'
soup=BeautifulSoup(index.read_text(encoding='utf-8'),'html.parser')
hrefs=[l.get('href','') for l in soup.find_all('link', rel=lambda x:x and 'stylesheet' in x)]
assert '/assets/css/pages/home-mobile-vendor.css?v=ea-update-12' in hrefs, 'mobile vendor bundle missing'
for href in ['/assets/css/vendor/bootstrap.min.css?v=20260617-menu-clean','/assets/css/plugins/swiper.min.css?v=20260617-menu-clean','/assets/css/vendor/spacing.css?v=20260617-menu-clean','/assets/css/vendor-subsets/remixicon-site-subset.css?v=ea-update-04']:
    link=soup.find('link', href=href)
    assert link is not None, f'{href} missing'
    assert link.get('media') == '(min-width: 769px)', f'{href} not desktop protected'
assert (root/'assets/css/pages/home-mobile-vendor.css').exists(), 'bundle file missing'
assert (root/'assets/css/pages/home-mobile-vendor.css').stat().st_size < (root/'assets/css/vendor/bootstrap.min.css').stat().st_size + (root/'assets/css/plugins/swiper.min.css').stat().st_size + (root/'assets/css/vendor/spacing.css').stat().st_size + (root/'assets/css/vendor-subsets/remixicon-site-subset.css').stat().st_size, 'bundle not smaller than old mobile vendor load'
print('PASS: EA Update 12 mobile vendor CSS diet')
