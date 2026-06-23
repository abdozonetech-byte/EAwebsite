# Namaa AI Update 60 — Namaa Talk Personality

## Goal
Strengthen Namaa Business Talk so it behaves like Namaa, not like a generic Gemini chatbot.

## Changes
- Updated `/functions/api/namaa/agent.js` brain version to `60-namaa-talk-personality`.
- Rebuilt the Namaa Business Talk system behavior:
  - Friendly Moroccan business-partner tone.
  - Same language/style as the user.
  - Darija Latin stays Darija Latin.
  - Emojis only when useful.
  - No generic Gemini-style phrasing.
- Added the greeting rule:
  - If the user says hi/salam/hello, Namaa asks whether they want free talk or project building.
- Added free talk behavior:
  - Namaa can speak naturally about AI, business, IT, marketing, startups, websites, WhatsApp/CRM and Moroccan execution.
- Added project mode behavior:
  - Namaa starts discovery with practical questions before routing to Design, Website or Strategy.
- Added frontend chat history support so Gemini receives recent conversation context.
- Updated frontend cache version to `v=60`.

## Security
- No API keys added to frontend.
- Gemini remains connected only through Cloudflare secrets.
- No backend route or secret details are exposed in the UI.
