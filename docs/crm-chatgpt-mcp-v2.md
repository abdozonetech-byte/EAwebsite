# Elboubakry CRM v2.0 — ChatGPT MCP Lead Intelligence

## What this upgrade does

The CRM queues selected lead IDs in Supabase. The owner then starts research in a normal ChatGPT conversation using the connected custom MCP app. ChatGPT reads only authorized queued records and writes validated results back through scoped MCP tools. The CRM displays the saved scores, evidence and Markdown report automatically.

This architecture does **not** use the paid OpenAI model API and does **not** attempt to start or control a personal ChatGPT conversation in the background.

## Architecture

```text
CRM dashboard
  -> Cloudflare Pages Functions
  -> Supabase research queue
  -> HTTPS /mcp server
  -> OAuth 2.1 authorization code + PKCE
  -> connected ChatGPT custom MCP app
  -> confirmed MCP writes
  -> Supabase lead intelligence
  -> CRM dashboard
```

The MCP implementation follows the current official OpenAI custom MCP guidance: a stable public HTTPS endpoint, streaming HTTP-compatible JSON-RPC, OAuth 2.1 with PKCE, protected-resource metadata, per-tool security schemes and write-tool annotations.

## Database migrations

Apply in order:

1. `supabase/migrations/001_crm_schema.sql`
2. `supabase/migrations/002_lead_intelligence.sql`
3. `supabase/migrations/003_chatgpt_mcp_lead_intelligence.sql`

Migration 003 is additive. It preserves existing leads and analysis content, upgrades old `pending`/`analyzed` states to `queued`/`completed`, and adds:

- `analysis_batches`
- `analysis_batch_leads`
- `lead_discovery_batches`
- `lead_discovery_candidates`
- `mcp_oauth_codes`
- `mcp_oauth_tokens`
- `mcp_audit_log`
- the idempotent `prepare_analysis_batch` database function
- additional lead-intelligence fields and indexes

All new tables have RLS enabled. Access is revoked from `anon` and `authenticated`; only the server-side service role is granted access.

## Required Cloudflare variables and secrets

Existing:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `CRM_USERNAME`
- `CRM_PASSWORD` (secret)
- `CRM_SESSION_SECRET` (secret, at least 32 random characters)

New MCP OAuth values:

- `MCP_OAUTH_CLIENT_ID`
- `MCP_OAUTH_CLIENT_SECRET` (secret; a long random value)
- `MCP_OAUTH_REDIRECT_URIS` — exact ChatGPT callback URL(s), comma-separated

Never place the Supabase service-role key, CRM password, OAuth client secret or access tokens in frontend JavaScript.

## Public endpoints

- `POST /mcp` — stateless MCP streaming-HTTP JSON-RPC endpoint
- `GET /.well-known/oauth-protected-resource`
- `GET /.well-known/oauth-authorization-server`
- `GET|POST /oauth/authorize`
- `POST /oauth/token`

The authorization server supports authorization code + PKCE (`S256`) and rotating refresh tokens. OAuth codes are one-time use and expire after ten minutes. Access tokens expire after one hour. Refresh tokens expire after thirty days.

## MCP tool inventory

| Tool | Scope | Type |
|---|---|---|
| `list_pending_leads` | `crm.leads.read` | Read |
| `get_lead_details` | `crm.leads.read` | Read |
| `get_analysis_batch` | `crm.analysis.read` | Read |
| `save_lead_analysis` | `crm.analysis.write` | Confirmed write |
| `save_lead_report` | `crm.analysis.write` | Confirmed write |
| `update_analysis_status` | `crm.analysis.write` | Confirmed write |
| `get_analysis_status` | `crm.analysis.read` | Read |
| `list_lead_categories` | `crm.leads.read` | Read |
| `propose_new_leads` | `crm.discovery.write` | Confirmed review-queue write |
| `get_lead_analysis` | `crm.analysis.read` | Read |

Write inputs require `confirm: true`, are described as writes through MCP annotations, and are recorded in `mcp_audit_log`. The MCP server never exposes unrestricted SQL or Supabase credentials.

## Connect in ChatGPT

1. Deploy the migrations and Cloudflare Pages project.
2. In ChatGPT, add a custom MCP server/plugin.
3. Enter `https://elboubakry.com/mcp` as the server URL.
4. Choose OAuth authentication.
5. Enter the configured client ID and client secret.
6. Copy the exact callback URL shown by ChatGPT into `MCP_OAUTH_REDIRECT_URIS` and redeploy if necessary.
7. Scan/refresh tools and confirm all ten tools are visible.
8. Install the private custom app/plugin in the intended ChatGPT workspace/account.
9. Open the CRM, queue one non-sensitive test lead, and copy the generated ChatGPT instruction.
10. In ChatGPT, invoke `get_analysis_batch`, then test a confirmed status update and a confirmed analysis save.
11. Return to the CRM and verify that the status, scores, evidence and Markdown report appear.

Do not claim the connection is live until step 11 succeeds.

## Lead discovery safety

`Find New Leads` creates a discovery batch only. ChatGPT may propose candidates from compliant public sources using `propose_new_leads`; it does not create CRM leads. Candidates appear in the CRM review queue, where duplicate detection and explicit approval run before insertion.

Google Maps, LinkedIn and other restricted sources must be used only through authorized access methods and according to their terms. The implementation does not include scraping or login bypasses.

## Tests

Run:

```bash
npm run test:crm-intelligence
npm run test:crm-import
node scripts/test-whatsapp-notification.mjs
```

The local MCP contract test covers tool inventory, write confirmations, score/evidence validation, missing research dates, MCP initialize/list behavior and unauthorized tool rejection. A production end-to-end test still requires deployed migrations, configured secrets and a connected ChatGPT custom app.
