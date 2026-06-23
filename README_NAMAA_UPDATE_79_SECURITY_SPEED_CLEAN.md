# Namaa AI Update 79 — Security + Speed + Final Clean

This update keeps CRM/Google Sheet parked for the final CRM update and focuses on production safety, speed and cleanup.

## What changed

- Updated Namaa frontend cache versions to `v=79`.
- Added long-cache rules for `/assistant-ia-maroc/js/*`, `/assistant-ia-maroc/css/*`, and image assets.
- Added `no-store` and `noindex` for `/api/*`.
- Reduced public API status endpoints so they no longer expose model names, secret names, prompt-library internals, or private configuration.
- Replaced `/api/namaa/health` with a safe public health check. Debug connection booleans require `NAMAA_DEBUG_TOKEN`.
- Locked `/api/namaa/diagnostics` behind `NAMAA_DEBUG_TOKEN`.
- Sanitized public Gemini/API errors so private configuration details are not shown to visitors.
- Kept the correct flow: `Namaa Talk → Namaa Design → Namaa Website → Namaa Strategy`.
- Kept CRM/Sheet/email popup parked until the final CRM update.

## Debug token

Optional Cloudflare secret:

```text
NAMAA_DEBUG_TOKEN=your-private-token
```

Then use:

```text
/api/namaa/health?token=your-private-token
/api/namaa/diagnostics?token=your-private-token
```

## Git commands

```bash
git status
git add .
git commit -m "Update 79: secure and clean Namaa production build"
git branch -M main
git remote set-url origin https://github.com/abdozonetech-byte/EAwebsite.git
git push -u origin main
```
