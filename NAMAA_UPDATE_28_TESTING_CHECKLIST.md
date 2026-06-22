# Namaa AI — Update 28 Testing & Gemini Optimization

This update focuses on reliability, token control, and simple testing before more product features.

## What changed

- Added `/api/namaa/diagnostics` to test Namaa controller logic without spending Gemini tokens.
- Normal chat remains short and controlled before Gemini is called.
- Deliverables use a bigger controlled Gemini output budget only after confirmation.
- Gemini text/image calls now include timeout protection and one retry for temporary 429/5xx errors.
- Health endpoint now reports Update 28 and the diagnostics endpoint.

## Test after Cloudflare redeploy

1. Open `/api/namaa/health`
   - Check update is `28-testing-gemini-optimization`.
   - Check Talk, Dev, and Images show connected if `GEMINI_API_KEY` is set.

2. Open `/api/namaa/diagnostics`
   - It should return `ok: true`.
   - This costs 0 Gemini tokens.

3. Test normal conversation
   - `salam`
   - Expected: short friendly answer.

4. Test out-of-scope
   - `chkon ghadi yrba7 match lyoum?`
   - Expected: polite redirect to AI/business/startups/marketing/projects.

5. Test project brief
   - `bghit ndir ecommerce f casa budget 3000dh`
   - Expected: Namaa asks missing project questions, not a long strategy.

6. Test deliverable
   - After brief is ready, ask: `create market research pdf`
   - Expected: branded Market Research PDF content.

7. Test images
   - Switch to Namaa Images and ask for a mockup.
   - Expected: right sidebar receives image result, or fallback mockup if Gemini image model is unavailable.

8. Test NamaaDev
   - Switch to NamaaDev and ask for a landing page.
   - Expected: preview + HTML/CSS/JS tabs + copy/download buttons.

## Optional Cloudflare model variables

Keep only `GEMINI_API_KEY` required. Add model overrides only if needed:

- `GEMINI_TEXT_MODEL`
- `GEMINI_IMAGE_MODEL`

Never place real API keys inside frontend files or GitHub.
