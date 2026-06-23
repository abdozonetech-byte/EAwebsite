# Namaa AI Update 72 — Full Flow QA

This update focuses on stabilizing the complete Namaa flow before final CRM/email and mobile production polishing.

## Correct user flow

1. Namaa Business Talk
   - Free conversation about AI, business, IT, marketing, startups and Morocco-first execution.
   - Project mode collects the project brief and asks for confirmation.

2. Namaa Design
   - Opens after the brief is ready/confirmed.
   - Generates logo directions, brand system, mockups and Nano Banana/Gemini prompts.
   - Can generate a visual preview, but no public download button is shown. The final pack is captured by email.

3. Namaa Website
   - Opens after Design is ready.
   - Generates a real landing page internally and shows only the live browser preview.
   - Source code stays hidden from the public UI.

4. Namaa Strategy
   - Opens after Website preview is ready.
   - Generates the final 3 branded boards: Market Research, Digital Marketing Strategy and 30/60/90 Roadmap.
   - Shows the professional email popup to request the full Namaa Pack.

## Update 72 changes

- Added frontend flow guards so users do not jump directly to Website or Strategy before the previous steps are ready.
- Updated Namaa agent prompt rules to match the final order: Talk → Design → Website → Strategy.
- Corrected old prompt text that still mentioned opening Website/Strategy directly after Talk.
- Removed the public design JPG download action; the pack should be requested by email instead.
- Strategy final board now ends with final action notes and the email pack CTA.
- Updated cache version to v72.
- Ran JS syntax checks on Namaa frontend and Cloudflare Functions.

## Required Cloudflare secrets / environment variables

For text agents:

```text
GEMINI_API_KEY
```

For image generation if available:

```text
GEMINI_IMAGE_MODEL
```

For CRM capture, configure one of:

```text
NAMAA_PACK_CRM_WEBHOOK_URL
NAMAA_CRM_WEBHOOK_URL
GOOGLE_SHEETS_WEBHOOK_URL
LEADS_WEBHOOK_URL
APPS_SCRIPT_WEBHOOK_URL
```

For sending email automatically through Resend:

```text
RESEND_API_KEY
NAMAA_EMAIL_FROM
```

If Resend is not configured, the email popup still captures the lead to CRM when the Google Sheets webhook is configured.
