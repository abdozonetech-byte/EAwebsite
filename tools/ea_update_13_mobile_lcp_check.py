#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
index=root/'index.html'
soup=BeautifulSoup(index.read_text(encoding='utf-8'),'html.parser')
crit=root/'assets/css/pages/home-mobile-critical.css'
deferred=root/'assets/css/pages/home-mobile-deferred.css'
assert crit.exists() and crit.stat().st_size > 10000, 'mobile critical CSS missing or too small'
assert deferred.exists() and deferred.stat().st_size > 700000, 'mobile deferred CSS missing or incomplete'
crit_link=soup.find('link', href='/assets/css/pages/home-mobile-critical.css?v=ea-update-13')
assert crit_link and crit_link.get('media') == '(max-width: 768px)', 'critical CSS link missing or not mobile-only'
assert soup.find('link', href='/assets/css/pages/home-mobile-deferred.css?v=ea-update-13') is not None, 'noscript deferred fallback missing'
for href in ['/assets/css/pages/home-shared-pre.css?v=ea-update-11','/assets/css/pages/home-shared-post.css?v=ea-update-11']:
    link=soup.find('link', href=href)
    assert link and link.get('media') == '(min-width: 769px)', f'{href} not desktop protected'
for removed in ['/assets/css/pages/home-mobile-vendor.css?v=ea-update-12','/assets/css/pages/home-mobile.css?v=ea-update-02','/assets/css/elboubakry-mobile-performance-safe.css?v=20260617-menu-clean']:
    assert soup.find('link', href=removed) is None, f'{removed} should not be render-blocking in head'
html=index.read_text(encoding='utf-8')
assert 'home-mobile-deferred.css?v=ea-update-13' in html and 'eaLoadDeferredMobileCSS' in html, 'deferred mobile loader missing'
# Ensure desktop vendor files are still protected.
for href in ['/assets/css/vendor/bootstrap.min.css?v=20260617-menu-clean','/assets/css/plugins/swiper.min.css?v=20260617-menu-clean','/assets/css/vendor/spacing.css?v=20260617-menu-clean']:
    link=soup.find('link', href=href)
    assert link and link.get('media') == '(min-width: 769px)', f'{href} desktop media protection missing'
print('PASS: EA Update 13 mobile LCP above-the-fold optimization')
