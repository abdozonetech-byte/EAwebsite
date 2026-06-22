# Namaa Update 55 — Mobile Responsive Polish

## Goal
Final cleanup for mobile, responsive behavior, smooth animations, drawer sidebar, preview panel, and chat usability.

## Improvements
- Added dynamic viewport height support with `--namaa-vh` to avoid mobile browser bar issues.
- Improved mobile chat layout so the composer stays comfortable and content does not overflow horizontally.
- Improved sidebar drawer behavior on tablet/mobile with cleaner height, scrolling, and backdrop layering.
- Improved mobile preview panel behavior for agent dashboards and outputs.
- Added keyboard-aware mode to hide the topbar while typing on small screens.
- Added stronger focus-visible states for accessibility.
- Added safer scroll containment for thread, sidebar, and preview body.
- Reduced heavy movement for users with reduced motion preferences.

## Scope
Only Namaa AI page assets were changed:
- `/assistant-ia-maroc/index.html`
- `/assets/css/namaa-ai-chat.css`
- `/assets/js/namaa-ai-chat.js`

No unrelated website pages were changed.
