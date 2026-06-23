# Namaa AI Update 65 — Website Workspace

## What changed
- Added a dedicated **Namaa Website Workspace**.
- Namaa Website is no longer only a normal chat view; it now has organized sections:
  - Project brief
  - Landing page blueprint
  - Hero + offer
  - Sections + copywriting
  - CTA + lead flow
  - Integration checklist
  - HTML/CSS/JS code area
  - Safe iframe preview
- Added buttons:
  - Generate landing page + code
  - Copy code
  - Download HTML
  - Back to Namaa Talk
- Namaa Website receives the same project brief from Business Talk and can also receive the Design handoff.
- Frontend calls `/api/namaa/agent` with agent `website`.
- Gemini API key remains backend-only through Cloudflare secrets.

## Security notes
- No API key added to frontend.
- HTML preview uses sandboxed iframe `srcdoc`.
- Generated code is displayed as text first, not executed in the main page.
- Download button creates a local HTML file from the generated code.

## Deployment
Use the commands in `deploy-git-commands.txt`.
