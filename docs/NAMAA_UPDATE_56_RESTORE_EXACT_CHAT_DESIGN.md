# Namaa AI Update 56 — Restore exact chat design + Gemini agents

This update restores the simple full-screen Namaa chat design requested by the user instead of the redesigned dashboard/agent hub layout.

## What changed

- Replaced `/assistant-ia-maroc/index.html` with the simple chat layout matching the provided screenshot direction:
  - dark left sidebar
  - centered chat thread
  - top bar with Elboubakry identity
  - `Namaa ready` status
  - `Retour au site` button
  - bottom composer
- Removed the sidebar `Simple Mode` helper section completely.
- Kept the required footer text under the chat input:
  - `Namaa created by Elboubakry Abdessamad`
- Kept the same visual style direction: premium dark sidebar, blue CTA, white chat bubbles, smooth hover/fade animations.
- Added four visible Namaa agents in the same sidebar style:
  - Namaa Business Talk
  - Namaa Strategy
  - Namaa Design
  - Namaa Website
- Connected all visible agents to the existing secure backend route:
  - `/api/namaa/agent`
- Preserved the Update 50–55 backend agent router and Gemini behavior.

## Agent mapping

- `business` → Namaa Business Talk: free talk about AI, business, IT, marketing, startups, websites, WhatsApp/CRM.
- `strategy` → Namaa Strategy: first digital marketing strategy, market research, roadmap, KPIs and design handoff.
- `design` → Namaa Design: Nano Banana/Gemini prompts, mockups, logo directions and brand pack.
- `website` → Namaa Website: real landing page plan or standalone HTML/CSS/JS when requested.

## Security note

No API keys or secrets are stored in the frontend. Gemini remains connected only through Cloudflare environment secrets and the backend `/api/namaa/agent` route.
