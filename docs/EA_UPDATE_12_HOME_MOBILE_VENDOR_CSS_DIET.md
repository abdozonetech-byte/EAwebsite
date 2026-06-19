# EA Update 12 — Homepage Mobile Vendor CSS Diet

## Scope

This update targets **homepage mobile performance only**.

No UI/UX design, layout, sections, animations, SEO metadata, sitemap, schema, GA4, Meta Pixel, form logic, or desktop behavior were intentionally changed.

## What changed

A generated mobile-only vendor bundle was added:

- `assets/css/pages/home-mobile-vendor.css`

It contains:

1. A homepage mobile subset of Bootstrap generated from classes used in `index.html`.
2. The existing Swiper CSS.
3. The existing spacing CSS.
4. The existing Remix Icon site subset.

The desktop still loads the original full vendor files with `media="(min-width: 769px)"`.

## Result

- Mobile-applicable homepage CSS before: **1,124,821 bytes**
- Mobile-applicable homepage CSS after: **850,628 bytes**
- Mobile CSS saved: **274,193 bytes**
- Original Bootstrap CSS: **294,472 bytes**
- Generated mobile Bootstrap subset: **20,035 bytes**

## Why this is safe

The change is limited to vendor CSS loading on the homepage. Desktop keeps the original vendor CSS files. Mobile keeps the same visual system, same animations, and the same later homepage override files.

The old files were not deleted.
