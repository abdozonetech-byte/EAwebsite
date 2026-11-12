# Maintaining approved content

Use the canonical source for each fact. Generated HTML and `assets/ai/knowledge.json` are outputs, not a second independently authored biography or catalogue.

| Content | Canonical source | Build behavior |
|---|---|---|
| Shared name, role, summary, teaching background, skills, contact, portrait | `content/professional.mjs` | Updates homepage, profile block, authorship, footer, Person schema and knowledge records |
| Bilingual course facts and modules | `content/professional.mjs` | Generates overview/detail pages and matching Course schema, retrieval records and exercises |
| Existing French services and project descriptions | `services/index.html`, `projets/index.html` | Preserves visible prose and extracts approved knowledge from it |
| Existing English services, projects and guide adaptations | `assets/data/english-core.js`, `assets/data/english-guides.js` and existing English builders | Run `npm run build:english` after source edits; its final content build restores shared identity/training and knowledge |
| Existing French guide body | Its `insights/<slug>.html` canonical page | Read into knowledge only when explicitly approved in the manifest |
| Guide card title, description, category, reading time | `assets/data/insights-articles.js` | Renders the existing catalogue into crawlable HTML |
| Sources admitted to AI retrieval | `content/approved-pages.json` | Only `approved` entries in allowed public source paths are extracted |
| Article proposals | `content/drafts/*.md` | Never published or included in retrieval by the build |
| Prompt library | Existing prompt data/generator | `npm run build:prompts` ends with the shared content build |

Legacy professional-history prose remains in the existing profile and its English adaptation. Update it deliberately in both languages when a new historical fact is approved; shared role/skill/course facts belong in `professional.mjs`. Language adaptations remain editorially maintained rather than automatically translated.

A new article should first be reviewed in drafts. After approval, create or update its canonical HTML, its catalogue record and manifest entry. Preserve an existing URL when revising it. Add meaningful internal links, sources and a real review date. New translations need reciprocal hreflang only when a real equivalent exists. Run the build and tests, then inspect the pages. Publication is separate.

The deterministic index contains its content hash. It is rebuilt on every `npm run build`, so changes need no model retraining. A regression test proves that a change to an approved article changes the index and restoring that article restores identical output. Drafts and private documents are deliberately outside the approved manifest and outside `dist/`.

`npm run build` packages the site but does not deploy. Do not use the repository root as the new public output directory: it contains source manuscripts and internal documents. Preserve existing Cloudflare bindings and Functions when changing the deployment output to `dist`.
