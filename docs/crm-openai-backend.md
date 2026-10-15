# Direct AI research inside the CRM

The CRM can run lead analysis and compliant public-business discovery directly from its Cloudflare backend. The user stays inside `/crm/#intelligence`; no ChatGPT browser tab, copied prompt, or manual import is required.

## Architecture

```text
Authenticated CRM
  -> Cloudflare Pages Function
  -> OpenAI Responses API (background mode + web search)
  -> evidence-backed JSON result
  -> server-side validation
  -> Supabase analysis or discovery-review tables
  -> CRM intelligence UI
```

The existing MCP integration remains available in the repository, but the CRM UI now uses the direct backend API workflow.

## Required configuration

Apply `supabase/migrations/005_openai_backend_jobs.sql`, then configure the production Cloudflare Pages environment:

| Variable | Type | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | encrypted secret | Authorizes server-side OpenAI API calls |
| `OPENAI_MODEL` | variable | Model used for research; defaults to `gpt-5.5` |
| `OPENAI_PROJECT_ID` | variable, optional | Selects an OpenAI project when required |

The API key must never be committed, added to frontend JavaScript, or sent to the browser. A ChatGPT subscription does not supply API credits; OpenAI API billing is separate.

## Runtime behavior

- Analysis jobs support up to 50 leads per batch.
- Only business context needed for research is sent; personal phone and email fields are excluded.
- Web findings must contain evidence URLs. Unknown facts remain unknown.
- AI output is parsed and validated against the exact queued CRM lead IDs before any write.
- Discovery results go to the existing review queue and are never inserted as leads automatically.
- Duplicate submissions reuse the existing active/completed OpenAI response rather than starting a second billable job.
- Missing configuration and failed validation are shown as failed jobs without exposing secrets.

## Deployment verification

1. Apply migration 005.
2. Add `OPENAI_API_KEY` as a Cloudflare encrypted secret and deploy.
3. Sign in to the CRM and open **AI Intelligence**.
4. Analyze one clearly labelled test lead.
5. Confirm the job progresses from queued/in progress to completed.
6. Open the lead intelligence page and verify scores, evidence URLs, research date, and Markdown report.
7. Run one discovery search and confirm candidates appear only in the review queue.

OpenAI web search and background responses can incur API charges. Keep batch sizes deliberate and monitor project usage limits.
