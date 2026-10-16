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

The lead intelligence detail page contains Problems & Solutions, Mockup, Contact Lead and Feedback sections. Users choose an output type and language, not a prompt or brief. Each new generation first researches the exact business with server-side web search. Matching identity and evidence URLs returned by actual web-tool output are required before structured generation begins. Uncertain identity or missing sources fails safely. Saved CRM analysis and feedback are supplementary context; existing research is never overwritten. Sources and the new research date appear alongside the saved result. Research supports an assessment, not a verified exhaustive audit.

Previously saved landing-page, homepage and booking-page concepts continue to render through the fixed responsive CRM layout with HTML downloads. They remain clearly distinct from the new visual image mockups below. Booking forms in these older concepts are disabled previews, not working submissions.

The existing encrypted `OPENAI_API_KEY`, optional `OPENAI_MODEL` and `OPENAI_PROJECT_ID` configuration is reused. `POST /api/crm/intelligence/leads/:id/project` reserves a private version and starts a background Responses API request with a strict JSON schema. `GET .../project?poll=1` retrieves the response and persists validated results. Plain `GET` returns stored versions, feedback and existing contact details without contacting OpenAI. Opening this workspace also resumes polling an unfinished version. The newest 20 versions and feedback notes are shown; older database rows are preserved.

Each generation requires an explicit API-credit confirmation in the UI, a UUID request ID and authenticated same-origin access. The same request ID reuses its version; a partial unique database index permits only one active generation per lead. A failed revision preserves completed versions. Feedback is associated with the lead and, when chosen from a result tab, its selected saved version. The latest feedback is included on the next explicit generation. Feedback does not trigger a paid request automatically.

Phone and email fields are used only to build WhatsApp and mailto draft links in the browser, and are omitted from project prompts. Clicking a contact link opens a draft; the CRM does not send it automatically. Feedback is sent as context only after generation confirmation.

The no-prompt workflow uses two billable background responses: web research, then strict-schema content generation. Phases are persisted in the existing generation `output` JSON; the existing `brief` column stores the allowlisted output-type key for new jobs. No new migration is required. A compare-and-set transition on status, response ID and research phase prevents concurrent polls from starting generation twice. Legacy saved results and pending structured-generation jobs remain supported. If a provider request starts but saving its ID fails, the reservation is retained; do not retry automatically or clear it without reconciling provider activity. Polling requires the CRM tab to remain open or be reopened; this is not an independent scheduled worker.

Integration reference: [OpenAI web search and returned sources](https://developers.openai.com/api/docs/guides/tools-web-search).

Validation: `npm run test:crm-project`, existing intelligence/import tests and the SEO audit. Project tests use mocked OpenAI and database responses; they cover authentication, schema validation, evidence restrictions, no raw contact fields in prompts, duplicate-job prevention, feedback ownership, completed-result persistence and failed-revision preservation. Perform one approved billable generation after migration/deployment to verify live provider access; the local preview does not establish API billing or model permissions.

Structured output reference: [OpenAI Responses structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).

## Branded visual mockups — local implementation, migration pending

Apply `supabase/migrations/007_project_visual_assets.sql` before deploying this update. It adds a private `crm-project-visuals` Storage bucket and the service-role-only `lead_project_assets` metadata table. It does not modify existing leads, analyses, generation versions or feedback. Existing solutions and HTML concepts do not require the new asset table merely to render. No production migration or billable image generation was performed during implementation.

Workflow:

1. Open Generate mockup. Optionally upload a logo once for the lead. PNG/JPEG/WebP files up to 6 MB are decoded in-browser, scaled to at most 1024 pixels and normalized to PNG. The backend accepts PNG only, at most 2 MB and at most 4096 pixels per side. Replacing a logo preserves previous files for earlier results. It does not spend OpenAI credit.
2. Choose AI recommendation or a preferred visual type: devices, cup/mug, clothing/uniform, packaging, stationery, signage, complete brand presentation. Confirm the research API cost.
3. Backend web research returns a supported recommended type, rationale and actual web-tool source URLs. The job pauses at `queued` / `awaiting_approval`, with no image API request yet. Polling stops while approval is pending. Review the recommendation, optionally override it or upload/replace the logo, then confirm the separate image-generation cost. Dismissing the recommendation releases the existing one-active-job lock without an image request.
4. Approval atomically claims the queued recommendation. It snapshots the latest logo asset ID and sends its bytes as a private image input with public business research and saved feedback. Phone/email CRM fields are not included. No user-written prompt is needed. Without a logo, the prompt requests proposed business-name typography, not a supposed official logo.
5. One background Responses request uses the forced `image_generation` tool with PNG output, medium quality and 1536×1024 size. The top-level model reuses `OPENAI_MODEL`; optional `OPENAI_IMAGE_MODEL` defaults to documented `gpt-image-1.5`. Set a supported image model explicitly if required by account access. The implementation does not establish provider permission, organization verification, billing or model compatibility; an approved live test is still required.
6. A validated finished PNG is uploaded to private Storage. The CRM saves metadata, research, selected type and logo ID alongside that version, and shows Download PNG and Change type / new version. Existing versions remain selectable. Results are concepts; generated lettering and logo accuracy must be checked before sharing. The system does not guarantee pixel-perfect logo reproduction.

Asset API: authenticated `POST /api/crm/intelligence/leads/:id/assets` with PNG bytes; `GET .../assets` returns latest logo metadata; `GET .../assets?asset=:uuid&download=1` checks lead ownership and proxies the private image with an attachment filename. No Storage key, provider response ID, base64 result or signed/public Storage URL is exposed. PNG signature/dimension/byte checks, private-bucket checks, stream size limits and `nosniff` apply. No public Storage policies are added; check existing account-wide policies do not grant broad object access.

Generation API adds `visualMockup:true` for new image requests and `approve-mockup` / `cancel-mockup` actions. Legacy requests/jobs continue through the earlier structured-content path. A compare-and-set transition prevents double charging on duplicate/concurrent approvals. If Storage saving fails, polling retries the same completed provider image rather than generating again. Ambiguous image-start transport failures retain the reservation for manual provider reconciliation; never clear such a reservation and retry blindly. Reopening the CRM resumes polling, but this is not an independent scheduled worker.

Tests: `npm run test:crm-visuals` uses mocked APIs for uploads, private bucket enforcement, cross-lead access rejection, approval gating, recommendation override, concurrent duplicate approval, real PNG bytes/download headers, optional-logo prompts, Storage retry without new charges, and version preservation. No generated image is claimed in the localhost demo: it uses a labelled placeholder and disables the mock PNG download. Browser-based visual verification remains pending because the browser security gate denied preview access during this session.

References: [OpenAI image-generation tool](https://developers.openai.com/api/docs/guides/tools-image-generation), [image inputs](https://developers.openai.com/api/docs/guides/images-vision).
