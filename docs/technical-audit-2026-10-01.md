# Technical Website Audit — 1 October 2026

Website: https://elboubakry.com/

Status: audit completed locally and against the live website. The optimization described below is saved locally but has not been pushed.

## Executive summary

The website has a strong technical SEO foundation for the Moroccan market. Crawlability, canonicalization, structured data, responsive behavior, security headers, analytics, and conversion tracking are correctly implemented. The site should remain structurally stable while Google Search Console gathers indexing and performance data.

## Verified results

- All 36 URLs listed in the sitemap returned HTTP 200 on the live website.
- HTTP traffic redirects to HTTPS.
- The `www` hostname redirects to the canonical non-`www` hostname.
- `/index.html` and non-canonical directory URLs redirect correctly.
- Unknown URLs return a real HTTP 404 response.
- `robots.txt` allows the public website and excludes `/crm/`, `/api/crm/`, `/docs/`, and `/evidence/`.
- CRM and API responses are configured as private and non-indexable.
- All audited public pages have a unique title, meta description, canonical URL, Open Graph URL, and exactly one H1.
- Internal references, sitemap URLs, redirects, and structured-data URLs passed the repository SEO audit.
- The homepage includes Person, WebSite, ProfessionalService, and FAQ structured data.
- Geographic signals target Morocco and Casablanca through `fr-MA`, `fr_MA`, `MA-CAS`, `areaServed: Maroc`, and a Casablanca postal address.
- Images have alternative text and explicit dimensions. Below-the-fold images use lazy loading.
- Static images use long-lived browser caching.
- Security headers include CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, and a strict referrer policy.
- GA4 measurement `G-KRP71BRZ5E` and Meta Pixel are configured.
- Tracking covers CTA clicks, WhatsApp, email, telephone, LinkedIn, important internal links, form starts, successful lead submissions, conversions, and scroll depth.
- The diagnostic form includes validation, a honeypot, an eight-second request timeout, success-page conversion tracking, and a user-facing fallback message.

## Responsive and UI verification

The following pages were checked at 390 × 844 and 1440 × 900:

- Home
- Projects
- Services
- Profile
- Guides
- Diagnostic

Results:

- No document-level horizontal overflow.
- No visible broken images.
- No browser console errors.
- One H1 per page.
- Navigation icons remain present on the full-navigation pages.
- Homepage mobile CTA buttons are centered within the page content area.
- The Guides topic-filter row intentionally scrolls horizontally on mobile without widening the document.

## Local optimization saved

The homepage and Projects page loaded `remixicon.css` even though neither page used a Remix Icon class. The unused stylesheet reference was removed from:

- `index.html`
- `projets/index.html`

This removes one render-blocking request and approximately 18.8 KB of compressed CSS from a first visit to either page. Navigation and content icons are unaffected because those pages use inline SVG icons.

Deployment status: not pushed.

## Automated validation

The repository audit passed with:

- 43 HTML files checked
- 36 sitemap URLs checked
- 30 dynamic article links checked
- 369 structured-data URLs checked
- 95 redirect rules checked
- 146 repository files checked

JavaScript syntax checks and `git diff --check` also passed.

## Recommended next priorities

1. Keep public URLs, page topics, and primary headings stable while Search Console collects at least four weeks of data.
2. Review Search Console weekly for indexing exclusions, Core Web Vitals, queries, countries, pages, and click-through rate.
3. Consolidate the multiple CSS layers used by the Profile and Guides pages in a separate, carefully tested performance update.
4. Continue publishing useful Morocco-focused content only when it answers a distinct search need; avoid creating overlapping pages for the same query.
5. Compare leads and conversions by landing page and acquisition source in GA4 rather than judging progress from traffic alone.

## Decision record

No broad redesign, URL change, mass metadata rewrite, or risky stylesheet removal was performed during this audit. Only the confirmed unused dependency on Home and Projects was removed.
