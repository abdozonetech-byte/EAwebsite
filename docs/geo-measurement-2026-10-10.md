# GEO measurement plan — Morocco

Updated: 2026-10-10

## Purpose

Measure whether ChatGPT, Gemini and other answer engines are discovering Elboubakry’s Morocco-focused pages and whether those visits become useful actions. Referral traffic is evidence of a visit, not proof that a model recommended the website.

## GA4 events implemented

### `ai_referral_visit`

Sent once per landing page and browser session when the referrer hostname matches a known answer engine.

Parameters:

- `ai_source`: `chatgpt`, `gemini`, `google_ai`, `perplexity`, `copilot` or `claude`
- `referrer_host`: the actual referring hostname
- `landing_page`: the first page path
- `market`: `morocco`

### `geo_landing_view`

Sent on the focused marketing, AI, SEO, analytics and automation pages.

Parameters:

- `service_slug`: stable internal service identifier
- `market`: `morocco`
- `location_focus`: `casablanca` for the Casablanca page, otherwise `morocco`

Existing diagnostic, WhatsApp, email, phone and service CTA events remain unchanged. This makes it possible to compare an AI referral or GEO landing page with later conversion actions.

## GA4 configuration after deployment

Create event-scoped custom dimensions for:

- AI source → `ai_source`
- Referrer host → `referrer_host`
- Landing page → `landing_page`
- Service topic → `service_slug`
- Market → `market`
- Location focus → `location_focus`

Mark the existing diagnostic/form submission events as key events. Do not mark page-view events as key events.

## Monthly review

1. Compare `ai_referral_visit` by source and landing page.
2. Compare `geo_landing_view` by service topic and engaged sessions.
3. Check diagnostic, WhatsApp and form actions following those sessions.
4. Compare the same landing pages in Search Console, including the generative-AI report when available.
5. Keep a dated note of neutral manual tests in ChatGPT and Gemini; results can vary by account, language and date.

## Interpretation limits

- Direct traffic can hide referrals when an app removes the referrer.
- Google traffic is grouped as `google_ai` only when it arrives from a Google hostname; GA4 cannot always distinguish AI Overviews from ordinary Google Search using the referrer alone.
- A citation or impression does not guarantee a lead, and a single manual model response is not a ranking result.
