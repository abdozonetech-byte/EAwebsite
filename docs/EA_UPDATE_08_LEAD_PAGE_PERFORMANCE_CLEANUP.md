# EA Update 08 — Lead/Diagnostic Page Performance Cleanup

Scope: `/reserver-diagnostic/` only.

This update reduces safe render-blocking/resource overhead on the diagnostic lead page without changing the form logic, tracking logic, SEO metadata, layout, visual direction, or animations.

## What changed

- Created `assets/lead-page/reserver-diagnostic-page.css`.
- Consolidated the two existing lead-page CSS files into one request, preserving the original cascade order:
  1. `reserver-diagnostic.css`
  2. `reserver-diagnostic-polish.css`
- Replaced the blocking Google Fonts stylesheet with a preload/onload pattern.
- Kept a `<noscript>` Google Fonts stylesheet fallback.
- Kept the React lead page JavaScript file unchanged.
- Kept `analytics.js` unchanged.
- Kept Meta Pixel code unchanged.

## Result

- Local lead-page CSS links: 2 → 1
- CSS requests saved on `/reserver-diagnostic/`: 1
- Original local lead CSS raw size: 21,403 bytes
- New bundled lead CSS raw size: 21,772 bytes
- Heavy lead JS unchanged for safety: 320,951 bytes

## Why this is safe

The new CSS bundle is a direct concatenation of the old CSS files in the same order. No selectors were renamed, no design rules were rewritten, and no form JavaScript was changed.

The Google Font still loads from the same URL and still uses `display=swap`; the change only prevents the font stylesheet from blocking the first render.

## Protected

No changes were made to homepage, services pages, insights pages, `/merci/`, sitemap, schema, redirects, GA4 analytics logic, Meta Pixel logic, or the lead form JavaScript bundle.
