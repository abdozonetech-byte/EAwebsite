# Namaa AI Update 66 — Website Browser Preview

This update keeps the current Namaa UI/UX and changes the Namaa Website workspace so the generated landing page opens inside the agent space as a browser-style preview.

## Changed
- Added a browser-style preview section inside Namaa Website.
- Added browser chrome UI: dots, preview URL, live preview label.
- Added Desktop / Mobile preview toggles.
- Moved the landing page preview above the code and details so the user sees the page first.
- Kept HTML/CSS/JS code output, copy button, and download button.
- Kept Gemini backend routing via `/api/namaa/agent` and no API key in frontend.

## Security
- The generated landing page is rendered inside a sandboxed iframe.
- No secrets or Gemini keys are exposed in frontend files.
