# WhatsApp notifications for new leads

The website and CRM can notify the administrator at **+212 687 321 925** whenever a lead is created through either of these routes:

- `POST /api/leads` — public diagnostic form
- `POST /api/crm/leads` — authenticated CRM manual entry

Duplicate diagnostic submissions rejected by the existing ten-minute duplicate guard do not create a second notification. Notification delivery runs in the background, so a temporary Meta API failure does not prevent the lead from being saved in Supabase.

## 1. Create the Meta template

Create and approve a WhatsApp Business message template named `new_lead_admin_notification` with French as its language. The body must contain four positional parameters in this exact order:

```text
Nouveau lead reçu.
Nom : {{1}}
Téléphone : {{2}}
Secteur : {{3}}
Source : {{4}}
Ouvrir le CRM : https://elboubakry.com/crm/#leads
```

Meta determines the final template category during review. The Cloud API sender number and the administrator recipient number must be different WhatsApp numbers.

## 2. Configure Cloudflare secrets and variables

Add these values to the production environment used by the Cloudflare Pages project:

| Variable | Type | Value |
| --- | --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | encrypted secret | Permanent Meta system-user access token |
| `WHATSAPP_PHONE_NUMBER_ID` | encrypted secret | Cloud API sender Phone Number ID |
| `WHATSAPP_GRAPH_API_VERSION` | variable | Current supported Graph API version, including the `v` prefix |
| `WHATSAPP_ADMIN_TEMPLATE` | variable | `new_lead_admin_notification` |
| `WHATSAPP_ADMIN_TEMPLATE_LANG` | variable | `fr` |
| `WHATSAPP_ADMIN_TO` | variable | Admin phone in E.164 format, digits only |

Do not commit the access token or service-role keys. After changing production variables, redeploy the current commit so Cloudflare Pages Functions receive the new environment.

## 3. Test safely

1. Add the administrator number as an allowed recipient if the Meta app is still in development mode.
2. Submit one clearly labelled test lead through `/reserver-diagnostic/`.
3. Confirm the lead appears in the CRM.
4. Confirm the WhatsApp notification arrives once.
5. Check Cloudflare Functions logs for `WhatsApp lead notification accepted.` if the message does not arrive.

## Operational behavior

- Missing WhatsApp configuration: lead is saved; notification is skipped and logged.
- Meta API error or timeout: lead is saved; failure is logged without exposing the access token.
- Duplicate public submission within ten minutes: no new lead and no notification.
- CRM edit: no notification, because only new lead creation is monitored.
- Direct inserts made in the Supabase dashboard are not routed through the website Functions and therefore do not notify. Use a Supabase Database Webhook if dashboard-level inserts must also trigger notifications.
