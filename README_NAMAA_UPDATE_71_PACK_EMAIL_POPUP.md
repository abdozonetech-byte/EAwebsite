# Namaa AI Update 71 — Full Pack Email Popup + CRM Lead Capture

## What changed

- Added a small professional popup after the final Namaa Strategy step.
- The popup asks only for the user's email to send the full Namaa Pack.
- Added a visible button inside the final Strategy output: `Send full pack by email`.
- Added backend endpoint: `/api/namaa/pack-lead`.
- The endpoint captures:
  - Email
  - Project brief
  - Design output
  - Website preview summary
  - Final strategy output
  - Namaa flow status
- The endpoint forwards the lead to CRM / Google Sheets.

## CRM / email configuration

The endpoint supports these Cloudflare environment variables/secrets:

- `NAMAA_PACK_CRM_WEBHOOK_URL` — recommended Google Apps Script / CRM webhook.
- `NAMAA_CRM_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `LEADS_WEBHOOK_URL`
- `APPS_SCRIPT_WEBHOOK_URL`

If none is set, the project falls back to the existing diagnostic Google Apps Script URL already used in the website.

Optional automatic email sending through Resend:

- `RESEND_API_KEY`
- `NAMAA_EMAIL_FROM` or `RESEND_FROM_EMAIL`

Without Resend, the user request is still captured in CRM so you can send the full pack manually or through Apps Script automation.

## Flow

Namaa Talk → Namaa Design → Namaa Website → Namaa Strategy → Email popup → CRM lead.
