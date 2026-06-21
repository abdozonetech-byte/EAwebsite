# EA Update 14 — Google SEO Starter Guide Implementation

Date: 2026-06-21

Source used: Google Search Central — SEO Starter Guide.

## Scope

SEO-only update. No UI/UX, CSS, JS, animations, layout, forms, tracking, or performance architecture were changed.

## Google Starter Guide principles applied

- Help Google find and understand the site with clean canonical URLs, sitemap coverage, and indexable resources.
- Keep a logical site structure with one canonical URL per page.
- Improve title/snippet support through consistent page metadata.
- Improve page understanding with structured data and breadcrumbs.
- Keep image preview eligibility with `max-image-preview:large`.
- Keep the thank-you page out of search results with `noindex, follow`.

## Changes

- Standardized document language to `fr-MA`.
- Added/normalized `og:locale` and `og:site_name` metadata across pages.
- Added author metadata across pages.
- Added self hreflang alternates (`fr-MA` and `x-default`) for canonical URLs.
- Added hidden H1 to `/reserver-diagnostic/` for clear page topic without visual change.
- Added homepage BreadcrumbList JSON-LD.
- Updated JSON-LD language and article `dateModified` values.
- Regenerated sitemap with 42 canonical indexable URLs and excluded `/merci/`.
- Added sitemap XML header and HTTP-level noindex protection for `/merci/` in `_headers`.

## Important

This does not guarantee first position in Google. It improves technical clarity and crawl/index understanding according to Google best practices.

## Safety verification

- CSS/JS hash diff versus Update 13: 0 changed files.
- `tools/ea_update_13_mobile_lcp_check.py`: PASS.
- `tools/ea_update_14_google_seo_check.py`: PASS.
