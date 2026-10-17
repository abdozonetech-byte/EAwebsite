# Design QA — client references

## 2026-10-16 — Local discovery geography (local only)

Release: production migration 008 succeeded; post-migration checks returned 37 leads, 37 intelligence rows, five added columns and zero anon/authenticated view grants. No paid research or lead import was run. The notes below describe pre-release development verification.

- Redesigned Find New Leads with numbered business/location sections, category suggestions with custom input, city suggestions, country, neighbourhood, optional keywords and explicit API-credit confirmation. Added subtle motion and reduced-motion support.
- Google Maps links use official Maps URLs (`api=1`) with encoded terms. Near me leaves location choice to Google Maps; it does not collect device coordinates in the CRM. This is a Maps launch integration, NOT Places API ingestion or scraping. No Maps results are automatically stored. AI discovery researches public sources and requires review/approval.
- City/country filters work in both Leads and AI Intelligence. Intelligence filtering happens before database pagination/count. Unknown-country leads remain accessible via All countries / Country not recorded. Optional country can be corrected in the lead editor. Existing countries are not inferred or backfilled.
- Migration 008 passed on isolated PostgreSQL/PGlite using migrations 001–003, including rerun, original view column order, preserved lead count, country constraints, service-role grants and invoker security. It has NOT been run in production. Apply before deploying this code. No live data changes or paid research tests.
- Discovery tests cover validation, authenticated API handlers, credit confirmation, country persistence, review-only preview, approved import, actual paginated query filters, safe Maps URLs and bilingual UI. Existing import/intelligence/project/presence/retired-visual/SEO tests passed. Original XLSX-specific validation remains skipped (file unavailable).
- Browser QA on sample-only localhost: desktop modal, small-screen scrolling, updated Maps queries, unknown-country filters return the correct sample in both Leads and Intelligence, optional empty country in manual entry, and French labels/country names. No JavaScript errors observed. Not published in this task.

## Earlier client-reference QA

- Source: user-supplied partner-grid reference (`codex-clipboard-37ee029c-82ed-4b48-8ac9-7446723dacc6.png`)
- Implementation: `http://127.0.0.1:4174/#references`
- Desktop validation: 1440 × 780 CSS pixels, normal density
- Mobile validation: 390 × 844 CSS pixels, normal density
- State: default, all three logo assets loaded

## Full-view comparison

The implementation preserves the reference composition: a pale neutral page background, a large inset white panel, centered purple eyebrow, high-contrast centered headline, generous vertical whitespace, and a single row of evenly sized bordered logo tiles. The three-column grid is an intentional content adaptation because the portfolio currently has three verified references rather than the eight placeholder brands shown in the source.

## Focused checks

- Typography: hierarchy and center alignment match the reference; the existing site typeface is retained for brand consistency.
- Spacing: panel padding, headline-to-grid rhythm, and tile gaps are balanced at desktop and mobile widths.
- Color: neutral surfaces, purple kicker, dark heading, and soft gray borders follow the supplied visual direction.
- Logos: all assets load at their natural resolution; Nova receives an orange backing so its white wordmark remains legible.
- Responsiveness: the logo marquee keeps fixed, legible card proportions at desktop and mobile widths; no horizontal overflow was observed.
- Interaction: the cards move continuously from left to right in a seamless loop, pause on hover or keyboard focus, and retain restrained lift/scale feedback plus visible focus states.
- Motion accessibility: reduced-motion preferences disable the automatic loop and expose a manually scrollable row instead.
- Accessibility: descriptive link names are available to assistive technology and decorative imagery is handled without duplicate announcements.

## Findings and resolution

- P2: Nova's original white wordmark lacked contrast on a white tile. Resolved with a compact brand-orange logo backing.
- P2: the Nova asset made its mobile tile taller than the other references. Resolved by constraining the rendered asset box.
- No outstanding P0, P1, or P2 issues.

## Comparison history

1. Initial implementation established the inset panel, centered heading, and three equal logo tiles.
2. Final pass improved Nova contrast, equalized responsive card heights, and verified loaded assets and overflow at desktop and mobile breakpoints.
3. Motion pass removed the supporting sentence and converted the static grid into a seamless, pauseable left-to-right client loop.

final result: passed

## CRM usability update — 2026-10-15

- Shared dashboard, leads, appointments and settings styles now use readable text sizes, consistent spacing, larger controls and responsive action rows.
- AI Intelligence adds a three-step research indicator, a rotating ring for indeterminate work and a 0–100 completion animation once the server reports a terminal result. Partial results are explicitly identified. No elapsed-time percentage is presented as measured progress.
- Detail scores count up to their saved values, stop there and respect reduced-motion preferences. Returning to the same score does not replay the animation.
- An active-job button lets users reopen progress after closing the modal. Polling no longer replaces discovery forms or unrelated dialogs. Poll failures can be reconnected through that button.
- Search focus and caret survive intelligence refreshes. Lead table rows support Enter and Space; active navigation and filter controls expose accessible names.
- Browser checks with synthetic sample leads: all five navigation screens at 1440px, 390px and 320px with no document-level horizontal overflow; score endpoints 46/82/71; completion ring 100; background polling preserved a discovery form; reduced-motion preference rendered final scores immediately; search cursor position preserved.
- Syntax checks, CRM intelligence/import regression suites and the deployment SEO audit passed. Workbook-specific import verification was skipped because the original workbook was unavailable.
- Browser preview uses synthetic API responses only. No production lead data was changed and no paid AI requests were made. This does not establish live OpenAI billing or service availability.
- Local sample preview: http://127.0.0.1:4178/crm/#intelligence. Preview server is in `/tmp/elboubakry-crm-ux-preview.mjs`, outside the production repository.

## Lead project workspace — 2026-10-16

- Added a dedicated workspace between the saved intelligence scores and original research cards: problem/solution plans, responsive landing-page mockups, contact drafts and version-linked feedback.
- Existing lead records and research remain read-only in the new API. New project versions and feedback are stored separately using additive migration 006 (prepared, not applied to production during this local implementation).
- Desktop 1440px and mobile 390px/320px: all four project sections fit without document-level horizontal overflow. The scrollable section navigation is constrained to the workspace. Direct lead URLs survive refresh.
- Local browser checks confirmed feedback saving, completion of a simulated mockup job, preservation of the earlier version, and valid WhatsApp/mailto draft links. Exported standalone mockup HTML contains a restrictive content policy, no scripts, escaped content and embedded styles.
- Backend tests cover authenticated access, explicit generation confirmation, duplicate request reuse, no second job while one is active, validation and evidence restrictions, feedback ownership and retention of completed versions after a failed revision. No production leads were changed and no live API generation was run.
- Saved local preview server: `../crm-design-preview.mjs`, outside the deployable repository. Its top banner explicitly identifies sample data. Preview starts with `node ../crm-design-preview.mjs` and binds only to 127.0.0.1:4178.

## Automatic project research — 2026-10-16

- Removed the brief field from the generation workflow. Users select a mockup type (AI choice, landing page, homepage, booking) or solution focus (complete plan, marketing, SEO/GEO, AI/automation, conversion), plus language and API-credit confirmation.
- Backend first researches the exact business using public web sources, validates returned source URLs against actual provider web-tool output, then generates strict-schema content. Uncertain identity and missing evidence stop generation. Sources and research date are saved with each new version; existing leads, analyses and completed versions remain untouched. No additional database migration.
- Two paid phases are protected by request IDs, the existing one-active-job index, and a compare-and-set research-to-generation transition. Existing pending structured-only jobs remain supported. Polling resumes when the workspace is reopened; no scheduled worker is claimed.
- Browser checks at 1440px and 390px confirmed no brief input, all type options, responsive dialogs, a simulated research/generation completion, a disabled booking-form concept, saved source display and no horizontal document overflow. Screenshots: `/tmp/crm-auto-research-mobile.png`, `/tmp/crm-auto-solution-desktop.png`.
- CRM project, intelligence and import regression tests passed, along with the SEO audit and syntax checks. Import workbook-specific verification was skipped because that workbook is unavailable. Project tests include uncertain identity, unsupported URLs and concurrent polling with exactly one second-phase start. Local simulation only: no paid provider call, production data write or deployment was performed for this update.

## Branded visual mockup studio — 2026-10-16 (local, not deployed)

- New mockup flow supports an optional saved lead logo, AI recommendation with rationale, seven visual categories, user override and separate image-cost approval. It pauses after research; no image is generated merely by opening the recommendation. Previous HTML concepts still render and download.
- Private PNG assets use additive migration 007, with service-role-only metadata and authenticated ownership-checked download routes. Logos are normalized in-browser; image bytes stay server-side/private Storage. No public Storage URLs or provider keys are exposed. Migration is prepared but not applied live.
- `test:crm-visuals` passes mocked integration checks for upload, file limits/signatures/dimensions, private bucket enforcement, cross-lead access, no-cost upload, research/approval separation, recommended-type override, concurrent approvals, logo/no-logo inputs, PNG download headers/content, storage retry without another paid request, unchanged older versions and uncertain-identity failure. Existing project, intelligence, import and SEO checks pass; the original workbook-specific import check remains skipped (file unavailable).
- Local demo supports logo saving, simulated research, recommendation review, type selection, simulated image completion and version retention. It explicitly renders a placeholder, not a claimed AI photo, and disables its mock PNG download. Actual download bytes are covered by the server tests.
- Visual browser QA is NOT complete: Chrome automation became unresponsive, and the in-app browser security gate denied access. No alternate browser or indirect UI-control workaround was attempted after that denial. User review on localhost is still required, followed by an approved billable provider test after migration/deployment.

## Presence and professional outreach — 2026-10-16 (local, not deployed)

- At the user's request, the CRM entry point no longer loads the mockup/project component. Mockup controls, solution-plan controls, report display, report download handlers and the long report-style detail grid have been removed from the active UI. The replacement has Online presence, Message lead and Notes tabs.
- Stored leads, research, historical versions and private visual files are preserved. New mockup generation and approval API requests return 410 without calling OpenAI. Polling retires research/waiting-approval mockup tasks without starting another paid generation; already-started image results can still be reconciled and saved. An ambiguous already-starting provider request still requires manual reconciliation rather than an unsafe retry.
- Six presence cards cover website/booking, SEO readiness, AI-search readiness, Facebook/Meta, Instagram and Google Business/Maps. Each has observation/status, optional AI strength score, confidence, strengths, problem/impact/next-step pairs and direct evidence links. Unknown/limited channels are not assigned fabricated numerical scores. Saved older observations are labelled not rechecked. Public-search links are labelled as searches, not official profiles.
- New presence generation reuses the existing private solution-version storage (`kind=solution`, `brief=presence`, `_purpose=presence`) and web research → strict-schema generation pipeline. No database migration is required. Exact source URLs and platform matching are validated; unsupported problems are discarded. Outreach references must point to observed, source-backed problem channels. Otherwise neutral introductory drafts replace unsupported sales claims.
- Editable email/WhatsApp drafts require user review before contact links are enabled; editing resets review. Links open drafts only, never automatic sends. Contact values are omitted from model prompts, and all URLs/text are validated/escaped. No real paid API generation or production data write was performed for this change.
- Tests passed: offline DOM contracts for the replacement UI, no report/mockup controls in the active entry point, source/score validation, neutral-draft fallback, encoded draft links, renewed review after edits, the complete authenticated presence backend pipeline, archival preservation, retired-generation no-spend checks, plus existing intelligence/import/SEO checks. Original workbook-specific import validation remains skipped (source workbook unavailable). Actual browser layout QA remains pending; no claim of visual verification is made.
