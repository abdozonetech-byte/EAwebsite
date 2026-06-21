# EA Update 11 — Homepage shared CSS safe minify + duplicate audit

## Scope

This update touches only the homepage shared CSS bundles and the homepage cache-busting query strings for those two bundles.

Touched files:

```text
index.html
assets/css/pages/home-shared-pre.css
assets/css/pages/home-shared-post.css
docs/EA_UPDATE_11_HOMEPAGE_CSS_SAFE_MINIFY_LOCK.json
tools/ea_update_11_homepage_css_minify_check.py
EA_UPDATE_11_REPORT.txt
```

## What changed

The two homepage shared CSS bundles were minified safely. This means comments and formatting whitespace were compressed, but selectors and declarations were kept.

No UI/UX redesign was made. No animation logic was changed. No page sections were changed.

## Performance result

| Bundle | Before | After | Saved |
|---|---:|---:|---:|
| home-shared-pre.css | 547,696 bytes | 468,254 bytes | 79,442 bytes |
| home-shared-post.css | 321,427 bytes | 263,333 bytes | 58,094 bytes |
| Total | 869,123 bytes | 731,587 bytes | 137,536 bytes |

Saved: **15.82%** from homepage shared CSS bundle weight.

## Duplicate audit result

The audit scanned 6492 CSS rule blocks and found 136 exact duplicate rule signatures.

They were **not removed** in this update because your current UI depends on many late cascade fixes. Removing duplicates without visual browser comparison can break spacing, hero, carousel, navbar, or mobile sections.

## Device separation protection

Kept unchanged:

```text
assets/css/pages/home-mobile.css  media=(max-width: 768px)
assets/css/pages/home-desktop.css media=(min-width: 769px)
```

## Verification

Run:

```bash
python3 tools/ea_update_11_homepage_css_minify_check.py
```
