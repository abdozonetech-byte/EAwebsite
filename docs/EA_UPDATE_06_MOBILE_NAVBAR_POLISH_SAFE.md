# EA Update 06 — Mobile Navbar Polish Safe

## Scope

This update improves only the **homepage mobile navbar visual shell**. It keeps the same HTML, same menu system, same offcanvas behavior, same animations, same desktop CSS, same SEO, same forms, same GA4 and Meta Pixel logic.

## Why this update

The mobile page was visually strong, but the top navbar looked weaker than the rest of the design because the logo and menu button appeared like two separated floating elements. The new mobile-only CSS makes the navbar feel like one premium pill-style header while keeping the same brand direction.

## What changed

Rules were appended to:

```text
assets/css/pages/home-mobile.css
```

The new block is scoped to:

```css
@media (max-width: 768px)
```

It adjusts only:

- mobile header outer spacing
- mobile header inner pill shell
- mobile logo sizing/color consistency
- mobile hamburger button shape and icon strength
- mobile header shadow/border containment

## Performance safety

No new CSS request was added. The update appends a small mobile-only block to the existing mobile file.

| Item | Before | After |
|---|---:|---:|
| Homepage CSS links | 25 | 25 |
| home-mobile.css size | 47,120 bytes | 50,902 bytes |
| Added CSS | — | 3,782 bytes |
| Desktop CSS hash | unchanged | unchanged |
| index.html | unchanged | unchanged |

## Files intentionally not touched

- `index.html`
- `assets/css/pages/home-desktop.css`
- SEO metadata / schema / sitemap / robots
- GA4 / Meta Pixel / form scripts
- desktop behavior
- homepage animations
- sections and content

## Verification

Run:

```bash
python3 tools/ea_update_06_mobile_navbar_check.py
```

Expected result:

```text
PASS
```
