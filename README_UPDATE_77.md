# Namaa AI Update 77 — Website Preview Polish

This update polishes **Namaa Website** so it feels like a real browser preview, not a code tool.

## Changes

- Namaa Website remains in the correct flow: Talk → Design → Website → Strategy.
- The Website agent shows only the working landing page preview.
- Source code remains hidden from the user UI.
- Improved browser-style preview UI, spacing, loading state and mobile preview.
- Added a safe fallback preview if Gemini returns planning text instead of a full HTML document, so the user still sees a working landing page preview.
- Updated frontend source tag to `namaa-simple-chat-update-77-website-preview-polish`.
- No API keys added to frontend.

## Test

1. Start in Namaa Talk.
2. Confirm a project brief.
3. Open Namaa Design and generate design.
4. Open Namaa Website.
5. Click Generate / regenerate preview.
6. Confirm that a working landing page appears in the browser preview, with no source code shown.
7. Open final Namaa Strategy.
