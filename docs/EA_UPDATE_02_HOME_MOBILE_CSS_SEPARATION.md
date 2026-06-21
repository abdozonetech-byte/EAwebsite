# EA Update 02 — Homepage Mobile CSS Separation

**Scope:** homepage mobile CSS only. No design, layout, animation, content, SEO, tracking, form, sitemap, redirect, or desktop behavior change.

## What changed

- Added `assets/css/pages/home-mobile.css`.
- Bundled the late homepage mobile override files into one controlled mobile file.
- Updated only `index.html` CSS links for the late mobile CSS block.
- Kept the original source CSS files in the project for backup and other pages.
- Kept `elboubakry-mobile-performance-safe.css` separate because it loads earlier in the cascade before final polish/growth files. Moving it now could change mobile UI priority.

## Mobile bundle source order

The new file preserves this mobile cascade order:

1. `/assets/css/elboubakry-mobile-menu-blanc-bleu-reference.css`
2. `/assets/css/elboubakry-mobile-hero-focus-blue.css`
3. `/assets/css/elboubakry-mobile-performance-ultra.css`
4. `/assets/css/elboubakry-mobile-official-repair.css`

## Before / after

| Check | Before Update 02 | After Update 02 |
|---|---:|---:|
| Homepage CSS links | 28 | 25 |
| Late mobile CSS requests | 4 | 1 |
| Late mobile CSS raw size | 48721 bytes | 47120 bytes |
| Homepage local CSS raw total | 1451408 bytes | 1449807 bytes |
| Desktop-applicable CSS load order | unchanged | unchanged |

## Safety verification

- New bundle is linked with `media="(max-width: 768px)"` only.
- Desktop-applicable CSS order is unchanged: **true**.
- Old late mobile files are no longer linked from the homepage: **true**.
- New mobile bundle is linked once: **true**.
- CSS braces are balanced: **true**.

## Files added

- `assets/css/pages/home-mobile.css`
- `docs/EA_UPDATE_02_HOME_MOBILE_CSS_LOCK.json`
- `docs/EA_UPDATE_02_HOME_MOBILE_CSS_SEPARATION.md`
- `tools/ea_update_02_home_mobile_check.py`

## Files modified

- `index.html`

## Next safe step

Update 03 should continue homepage CSS separation by extracting desktop-only homepage CSS into a controlled `assets/css/pages/home-desktop.css`, while keeping mobile untouched.
