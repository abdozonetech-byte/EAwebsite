# Namaa AI — Update 73

## Goal
Keep the Namaa Pack CRM simple and clean: only collect the user email and a pack link that opens the generated Namaa Pack.

## Frontend
- The final popup asks only for the email.
- A pack link is generated automatically from the Namaa session.
- The popup sends `{ email, pack_link }` to `/api/namaa/pack-lead`.

## Backend
- `/api/namaa/pack-lead` forwards only email + pack link to Google Apps Script.
- Cloudflare secret needed: `NAMAA_PACK_CRM_WEBHOOK_URL`.

## Pack viewer
- New page: `/assistant-ia-maroc/pack/`
- The pack link opens a dashboard-style view of the generated Namaa pack.

## Google Sheets Apps Script
Use the script in:
`docs/NAMAA_PACK_CRM_EMAIL_PACK_LINK_ONLY_APPS_SCRIPT.js`

It creates:
- `Dashboard`
- `Pack Leads` with only `Email` and `Pack Link` columns.
