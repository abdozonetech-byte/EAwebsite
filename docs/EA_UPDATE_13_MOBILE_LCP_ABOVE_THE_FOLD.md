# EA Update 13 — Mobile LCP + Above-the-Fold Optimization

## Scope

This update targets **homepage mobile performance only**, especially FCP/LCP and render-blocking CSS.

No UI/UX design, layout, sections, text, animations, SEO metadata, sitemap, schema, GA4, Meta Pixel, forms, URLs, redirects, or desktop behavior were intentionally changed.

## What changed

A mobile critical CSS file was added:

- `assets/css/pages/home-mobile-critical.css`

It contains the existing mobile vendor subset plus critical above-the-fold rules for:

- mobile header/navbar
- offcanvas menu shell
- hero headline/focus pill
- hero CTAs/social icons
- hero portrait/card
- core mobile layout/base styles needed for the first screen

A full mobile deferred CSS bundle was added:

- `assets/css/pages/home-mobile-deferred.css`

It preserves the original mobile cascade in this order:

1. `home-shared-pre.css`
2. `elboubakry-mobile-performance-safe.css`
3. `home-shared-post.css`
4. `home-mobile.css`

The deferred bundle is inserted after idle by the existing mobile core flow. Desktop keeps the original full CSS files under `media="(min-width: 769px)"`.

## Result

- Mobile render-blocking CSS before: **850,628 bytes**
- Mobile render-blocking CSS after: **328,463 bytes**
- Mobile render-blocking CSS saved from the initial path: **522,165 bytes**

## Safety notes

The old CSS files were not deleted. The full mobile styling still loads after idle, so below-the-fold sections, animations, carousel, FAQ, services, and footer keep the same final design.

Desktop styles were protected by desktop-only media attributes and were not moved into the mobile deferred bundle.
