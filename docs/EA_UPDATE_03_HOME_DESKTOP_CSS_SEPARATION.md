# EA Update 03 — Homepage Desktop CSS Separation

**Scope:** homepage desktop CSS only. No mobile CSS behavior, design, layout, animation, content, SEO, tracking, form, sitemap, redirect, or URL change.

## What changed

- Added `assets/css/pages/home-desktop.css`.
- Moved the homepage desktop-only performance support CSS into this controlled desktop page file.
- Updated only the homepage `index.html` desktop-only link.
- Kept the original source file `assets/css/elboubakry-desktop-performance-safe.css` in the project for rollback safety.

## Desktop bundle source

The new file preserves the exact CSS content from:

1. `/assets/css/elboubakry-desktop-performance-safe.css`

The link is still loaded only with:

```html
media="(min-width: 769px)"
```

## Before / after

| Check | Before Update 03 | After Update 03 |
|---|---:|---:|
| Homepage CSS links | 25 | 25 |
| Desktop page CSS file | `elboubakry-desktop-performance-safe.css` | `pages/home-desktop.css` |
| New desktop bundle raw size | — | 640 bytes |
| Homepage local CSS raw total | 1449807 bytes | 1449807 bytes |
| Mobile-applicable CSS list | unchanged | unchanged |
| Desktop replacement position | same position | same position |

## Safety verification

- New bundle is linked with `media="(min-width: 769px)"` only.
- Mobile-applicable CSS links are unchanged: **true**.
- Old desktop file is no longer linked from the homepage: **true**.
- Old desktop file remains in the project for rollback: **true**.
- New desktop bundle is linked once: **true**.
- Old and new CSS file hashes are equal: **true**.
- CSS braces are balanced: **true**.

## Files added

- `assets/css/pages/home-desktop.css`
- `docs/EA_UPDATE_03_HOME_DESKTOP_CSS_LOCK.json`
- `docs/EA_UPDATE_03_HOME_DESKTOP_CSS_SEPARATION.md`
- `tools/ea_update_03_home_desktop_check.py`

## Files modified

- `index.html`

## Next safe step

Update 04 should start the real performance cleanup: page-specific/vendor cleanup and render-blocking reduction, while keeping the separated mobile and desktop CSS structure protected.
