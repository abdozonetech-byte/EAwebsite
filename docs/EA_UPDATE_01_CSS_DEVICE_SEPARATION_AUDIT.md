# EA Update 01 — CSS Map & Protection
**Scope:** audit/protection only. No UI, UX, animation, SEO, tracking, form, sitemap, redirect, or content change.
## What this update does
- Creates a locked map of current CSS load order for every HTML page.
- Records file sizes, media attributes, and SHA-256 hashes before future splitting.
- Identifies which files are safe candidates for future mobile/desktop separation.
- Adds a repeatable audit script: `tools/ea_css_audit.py`.

## Current project facts
- HTML pages detected: **43**.
- CSS assets referenced by pages: **31**.
- JS assets detected by pages: **32**.
- Total referenced CSS across the project: **1491.7 KB raw**.
- Homepage CSS load order count: **27 CSS links**.
- Homepage CSS referenced size if all matching files are counted: **1417.4 KB raw**.

## Main diagnosis
The website can be separated safely into desktop and mobile CSS, but not by deleting old files suddenly. The current UI is protected by a long cascade of files where later files override earlier files. Future updates must preserve load order until each section is migrated and visually checked.

## Recommended separation model
```text
assets/css/core/base.css
assets/css/pages/home-base.css
assets/css/pages/home-mobile.css   media=(max-width: 768px)
assets/css/pages/home-desktop.css  media=(min-width: 769px)
assets/css/pages/services-base.css
assets/css/pages/services-mobile.css
assets/css/pages/services-desktop.css
assets/css/pages/insights-base.css
assets/css/pages/insights-mobile.css
assets/css/pages/insights-desktop.css
```

## Priority files to split later
| Priority | File | Reason |
|---|---|---|
| 1 | `/assets/css/elboubakry-growth-system.css` (238.1 KB) | Very large homepage file with many mobile and desktop rules. |
| 2 | `/assets/css/main.css` (409.0 KB) | Large legacy theme file with many global and responsive rules. |
| 3 | `/assets/css/elboubakry-final-polish-pass.css` (38.3 KB) | Late override file; important for current visual stability. |
| 4 | `/assets/css/elboubakry-upgrade-07-uiux.css` (35.9 KB) | Late override file used on many pages. |
| 5 | `/assets/css/vendor/bootstrap.min.css` (287.6 KB) | Large vendor CSS; must be reduced only after checking used components. |
| 6 | `/assets/css/vendor/remixicon.css` (137.3 KB) | Large icon font CSS; can be optimized later only if icon usage is mapped. |

## Safe rules for Update 02
- Start with homepage mobile only.
- Do not edit desktop selectors.
- Do not remove animations.
- Do not change HTML content, URLs, schema, GA4, Meta Pixel, form logic, or sitemap.
- Move mobile-only rules progressively into a new controlled mobile file, then compare screenshots.

## Files added by Update 01
- `docs/EA_UPDATE_01_CSS_LOAD_ORDER_LOCK.json`
- `docs/EA_UPDATE_01_CSS_DEVICE_SEPARATION_AUDIT.md`
- `tools/ea_css_audit.py`
