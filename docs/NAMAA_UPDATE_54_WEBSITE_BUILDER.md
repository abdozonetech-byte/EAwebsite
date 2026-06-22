# Namaa AI Update 54 — Website Builder Agent

## Goal
Strengthen **Namaa Website** so it can transform Namaa Strategy and Namaa Design handoffs into landing page blueprints and safe one-file HTML/CSS/JS when requested.

## What changed
- Updated `/api/namaa/agent` brain version to `54-website-builder`.
- Added a dedicated Website Builder protocol.
- Improved Namaa Website instructions for:
  - conversion-focused landing page blueprints;
  - section-by-section copywriting;
  - WhatsApp/lead flow logic;
  - trust/proof/FAQ blocks;
  - mobile-first UI notes;
  - complete standalone one-file HTML/CSS/JS when requested.
- Increased website agent output capacity for longer code responses.
- Improved handoff context length so Strategy/Design outputs can be reused better by Website.
- Updated Namaa Website sidebar prompts.
- Added safe frontend rendering for fenced code blocks and a copy button.

## Safety rules added
- No API keys, secrets or hidden trackers in generated code.
- No suspicious external scripts or unknown form endpoints.
- No `eval` or `document.write`.
- Forms default to safe demo behavior unless a real endpoint is provided.
- Static hosting-friendly one-file HTML/CSS/JS by default.

## Files changed
- `functions/api/namaa/agent.js`
- `assistant-ia-maroc/js/namaa-chat.js`
- `assistant-ia-maroc/css/namaa-ai.css`
- `docs/NAMAA_UPDATE_54_WEBSITE_BUILDER.md`
- `SECURITY_SCAN_UPDATE_54.md`
- `deploy-git-commands.txt`

## Next update
Update 55 should do final QA, mobile checks, security review, API route verification and deploy readiness.
