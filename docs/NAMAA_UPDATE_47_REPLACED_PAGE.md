# Namaa AI Update 47 — Dashboard UI Replacement

This update replaces the old `/assistant-ia-maroc/` Namaa AI page with the cleaned dashboard-style Namaa AI UI.

Public routes:
- `/assistant-ia-maroc/` → New Namaa AI dashboard chat interface
- `/namaa-ai/` → Redirects to `/assistant-ia-maroc/` for backward compatibility
- `/namaa/` → Redirects to `/assistant-ia-maroc/` for short access

Kept:
- Existing website pages
- Existing `/functions/api/namaa/` backend
- Existing website floating Namaa button links
- Existing UI/UX/animations from the dashboard template

Removed from visible Namaa page:
- Old MUI Namaa page layout

Security notes:
- No API keys or secrets are stored in the frontend.
- Chat connects to `/api/namaa/talk` when deployed.
- Dashboard files were copied from the previously cleaned Namaa dashboard UI package.
