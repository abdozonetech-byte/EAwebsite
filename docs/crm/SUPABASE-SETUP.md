# CRM Supabase Setup

This CRM connects through Cloudflare Pages Functions. Do not place Supabase keys in browser JavaScript, HTML, or public files.

## Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the migration file:
   `supabase/migrations/001_crm_schema.sql`
4. Copy the Supabase Project URL.
5. Copy the Supabase `service_role` key.
6. Open Cloudflare Pages for this website.
7. Go to `Settings` then `Variables and Secrets`.
8. Add Preview secrets:
   `SUPABASE_URL`
   `SUPABASE_SERVICE_ROLE_KEY`
9. Add Production secrets:
   `SUPABASE_URL`
   `SUPABASE_SERVICE_ROLE_KEY`
10. Keep both values encrypted as secrets where Cloudflare offers secret storage.

## Existing CRM Auth Secrets

Keep the existing CRM authentication secrets configured in Cloudflare:

`CRM_USERNAME`

`CRM_PASSWORD`

`CRM_SESSION_SECRET`

## Security Notes

The browser CRM calls authenticated `/api/crm/*` endpoints only. Cloudflare Pages Functions read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `context.env` and call Supabase REST from the server side.

The Supabase tables have row level security enabled and no public anon policies. The browser must not connect directly to Supabase for CRM data.
