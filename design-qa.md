# Design QA — client references

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
