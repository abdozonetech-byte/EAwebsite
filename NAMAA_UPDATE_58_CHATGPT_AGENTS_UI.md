# Namaa AI Update 58 — ChatGPT-style Agents UI

## Goal
Simplify the Namaa page into a clean ChatGPT-style interface while keeping Namaa agents in the sidebar.

## Changes
- Removed dashboard homepage sections from `/assistant-ia-maroc/`.
- Kept a dark sidebar with Namaa agents only:
  - Namaa Business Talk
  - Namaa Strategy
  - Namaa Design
  - Namaa Website
- Homepage now focuses on one central chat textbox.
- Added the footer line under the textbox: `Namaa created by Elboubakry Abdessamad`.
- Added `/api/namaa/agent` if missing, so every agent can route to Gemini from Cloudflare secrets.
- No API keys or secrets are placed in the frontend.

## Notes
The old dashboard assets are left in the project for compatibility, but the public Namaa UI no longer uses the dashboard sections.
