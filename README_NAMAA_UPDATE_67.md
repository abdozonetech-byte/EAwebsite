# Namaa AI Update 67 — Website Live Preview Only

This update changes Namaa Website / Namaa Dev behavior so the user sees a working landing page inside the agent workspace as a browser-style preview, not source code.

## Changes
- Removed the visible code source section from the Namaa Website workspace.
- Removed visible Copy Code / Download HTML controls from the page.
- Kept the internal Gemini HTML/CSS/JS generation logic, but renders it only inside the sandboxed iframe preview.
- Enlarged the browser preview area so the landing page opens like a mini website.
- Kept Namaa agents routing and Gemini backend connection unchanged.
- Bumped cache version to `v=67` for the Namaa CSS and JS.

## Git push commands
```bash
git status
git add .
git commit -m "Update 67: show Namaa Website as live preview only"
git branch -M main
git remote set-url origin https://github.com/abdozonetech-byte/EAwebsite.git
git push -u origin main
```
