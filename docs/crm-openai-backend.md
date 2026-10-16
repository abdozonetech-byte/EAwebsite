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

## Lead project workspace

Apply the additive `supabase/migrations/006_lead_project_workspace.sql` before deploying the project workspace. It creates private `lead_project_generations` and `lead_project_feedback` tables, with service-role access only. It does not backfill, update or remove existing leads or research.

The lead intelligence detail page now contains Problems & Solutions, Mockup, Contact Lead and Feedback sections. Solution plans pair problems with proposed deliverables, priorities, supporting URLs, questions, next steps and draft outreach. Recommendations without a supporting URL from the original research are labelled for confirmation. The assistant uses saved research; it does not claim that it performed a new website audit.

Mockups are responsive landing-page concepts rendered by a fixed CRM template from validated structured content. They are not image-generation output or arbitrary model-authored HTML. Desktop/mobile views and standalone HTML download are available. Downloads escape model text, contain no scripts or remote assets, and set a restrictive content policy.

The existing encrypted `OPENAI_API_KEY`, optional `OPENAI_MODEL` and `OPENAI_PROJECT_ID` configuration is reused. `POST /api/crm/intelligence/leads/:id/project` reserves a private version and starts a background Responses API request with a strict JSON schema. `GET .../project?poll=1` retrieves the response and persists validated results. Plain `GET` returns stored versions, feedback and existing contact details without contacting OpenAI. Opening this workspace also resumes polling an unfinished version. The newest 20 versions and feedback notes are shown; older database rows are preserved.

Each generation requires an explicit API-credit confirmation in the UI, a UUID request ID and authenticated same-origin access. The same request ID reuses its version; a partial unique database index permits only one active generation per lead. A failed revision preserves completed versions. Feedback is associated with the lead and, when chosen from a result tab, its selected saved version. The latest feedback is included on the next explicit generation. Feedback does not trigger a paid request automatically.

Phone and email fields are used only to build WhatsApp and mailto draft links in the browser, and are omitted from project prompts. Clicking a contact link opens a draft; the CRM does not send it automatically. Project briefs and feedback are sent as context only after the generation confirmation.

Validation: `npm run test:crm-project`, existing intelligence/import tests and the SEO audit. Project tests use mocked OpenAI and database responses; they cover authentication, schema validation, evidence restrictions, no raw contact fields in prompts, duplicate-job prevention, feedback ownership, completed-result persistence and failed-revision preservation. Perform one approved billable generation after migration/deployment to verify live provider access; the local preview does not establish API billing or model permissions.

Structured output reference: [OpenAI Responses structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
