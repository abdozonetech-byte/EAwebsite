# EA Update 05 — Insights/About Page Performance Cleanup

## Scope

This update only touches the Insights hub, all Insights article pages, and the About page.

Homepage, services pages, lead form page, merci page, SEO metadata, sitemap, schema, analytics and Meta Pixel logic were not changed.

## What changed

1. Added desktop-only media loading for unused/heavy plugin CSS on Insights/About pages:
   - `swiper.min.css`
   - `nice-select.css`
   - `magnific-popup.css`

2. Added desktop-only media loading for `animate.min.css` on Insights article pages and About page.
   - `insights/index.html` keeps `animate.min.css` unchanged because the Insights hub still uses visible `wow fadeInUp` cards.

3. Added `defer` to bottom external JS libraries on Insights/About pages while preserving script order.
   - `analytics.js` was already deferred and was not changed.

## Representative mobile CSS result

| Page | Before | After | Saved |
|---|---:|---:|---:|
| Insights hub | 969,839 bytes | 936,218 bytes | 33,621 bytes |
| Insight article | 969,839 bytes | 891,182 bytes | 78,657 bytes |
| About page | 969,839 bytes | 891,182 bytes | 78,657 bytes |

## Safety notes

- Desktop CSS remains available on desktop through `media="(min-width: 769px)"`.
- Script order is preserved because `defer` scripts execute in document order.
- No CSS selectors were edited.
- No layout, content, animations, tracking or forms were redesigned.
