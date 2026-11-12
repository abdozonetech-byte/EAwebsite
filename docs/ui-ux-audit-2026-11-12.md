# UI/UX audit — elboubakry.com

Date: 2026-11-12
Scope: public homepage (`index.html`) and the shared shell (header, footer, language control).
Method: source review of the three stylesheets the homepage loads, plus live-browser measurement at
390, 768, 1024 and 1440 px (iframe harness against the built `dist/`), Lighthouse, DOM and CSS
metrics. No content, feature, API, tracking or SEO behaviour was changed by this pass.

Baseline: Lighthouse accessibility 100, best practices 100, SEO 100 — the problems below are visual,
organisational and typographic, not Lighthouse-visible violations.

## 1. Confirmed findings

### 1.1 Vertical rhythm (visible on every screen)
- Section padding is `129.6px` on most sections, `40px` on the client band and `30px` top on the
  contact block, so the page breathes unevenly.
- The client band is padded twice: section `40px` **and** inner card `78–118px` top / `86–112px`
  bottom, producing a `682px` tall band for a heading and three small logos.
- Section headings carry `margin-bottom: 0` in every section except the training preview (`28px`),
  so heading-to-content distance is accidental rather than designed.

### 1.2 Type hierarchy
- H1 is not monotonic: `50.68px` at 390, `42px` at 768, `45.06px` at 1024, `63.36px` at 1440.
  H1 and H2 are the same size at 768 (`42px`), so the hierarchy collapses on tablets.
- Seven H2 sizes coexist at 1440: `66.24`, `62`, `58`, `42.4`, `38` (plus `47.52`/`43` at smaller
  widths). "Apprendre. Construire. Mettre en pratique." is visibly ~36% smaller than the section
  headings above and below it.
- 25 distinct font sizes in the rendered page, including fractional values (`10.72`, `14.08`,
  `15.2`, `23.2`, `42.4`, `47.52`, `63.36`, `66.24`) caused by inherited scaling.
- Labels drop below the legibility floor: `10px` ("Compétence clé"), `10.72px` (`.tr-label`),
  `11px` (method tags, step numbers).

### 1.3 Colour and surfaces
- 15 text colours, of which six are near-duplicate greys
  (`#414960`, `#45526d`, `#45526d`, `#4d566d`, `#596780`, `#5d6680`, `#687188`).
- 11 background colours with five near-duplicate pale blues
  (`#eaf1ff`, `#f1f5fc`, `#f2f4f7`, `#f3f7ff`, `#f6f9ff`).
- 12 border radii (2, 10, 13, 14, 16, 20, 22, 24, 28, 30, 46%, 999px) and 3 unrelated shadows.
- One contrast failure that is not decorative: the process step numbers (`01–04`) render
  `#a0abc0` at 11px on white → **2.31:1**. The language-switcher label flagged by the same scan is
  a visually-hidden screen-reader label (`.ea-language-name`, clipped), not a real failure.

### 1.4 Alignment and component consistency
- Hero grid is `537px / 630px` at 1440, so a `63px` H1 is squeezed into the narrower column and
  wraps to four lines while the portrait column keeps the extra width.
- Project cards are not uniform: media widths `793, 793, 793, 733` and heights `415, 415, 441, 415`.
  One card is 60px narrower and 26px taller than its siblings.
- Grid gaps vary between `16`, `18`, `24`, `72` and `100px` across sections.
- Desktop text links ("Voir le projet →", "Explorer le programme →") are `22px` tall, i.e. below the
  44px pointer target.
- Footer: `.tr-footer-links` is appended outside the footer container, full-bleed and centred
  (`x: 0`, `width: 497` at 512px), while the rest of the footer is left-aligned inside the container.
  It reads as a leftover block rather than part of the footer.

### 1.5 Shell and interaction
- Mobile menu opens correctly (body scroll locked, `aria-expanded` toggled) but focus stays on
  `<body>`: keyboard and screen-reader users lose their place.
- The mobile active item is drawn as a full-width rule that is visually indistinguishable from the
  row separators.
- Focus styling is inconsistent: premium-portfolio, professional and site-languages each define
  their own `:focus-visible` treatment.
- `scroll-padding-top: 92px` exists and works (measured 139px clearance under the sticky header).

## 2. Root causes
1. Three stylesheets grew additively (`premium-portfolio` → `professional` → `site-languages`) with
   page-specific patches, and later layers override earlier ones without a shared scale.
2. Spacing and type were chosen per component instead of from one scale, so every new section
   introduced another value.
3. Two tiers of headings (section vs. band) were never formalised, so band headings inherited
   whatever the patch layer set.

## 3. Organisation delivered by this pass
- One token block: spacing, section rhythm, gutters, radii, text colours, shadows.
- Two documented heading tiers (section / band) plus the final CTA, all monotonic across breakpoints.
- One section rhythm, one container width, one card padding family.
- Component fixes: hero column balance, project media normalisation, client band compaction,
  footer alignment, 12px minimum label size, step-number contrast, 44px pointer targets.
- Shell fixes: menu focus management, consistent focus ring.

## 4. What deliberately did not change
- Copy, sections, order, links, metadata, structured data, analytics, consent, forms, API calls.
- Palette identity (blue `#0b55ff`, navy `#10172f`, soft `#f3f7ff`) and the Inter typeface.
- Reveal animation, hover motion, marquee, sticky header, mobile menu mechanism.
## 5. Second pass — shared shell and inner pages

The first pass was scoped to the homepage. Extending the measurement to the pages that share the
shell (`about-...html`, `formations/`, `insights/`, an insight article, `ai/`, `en/`) surfaced five
further defects that the homepage could not reveal, because those pages load a different base
stylesheet (`main.css` + `elboubakry-global-shell.css`) and render at a 10px root font size.

### 5.1 Container centring was homepage-only
`.ea-container` sets `margin-inline: auto` in `elboubakry-premium-portfolio.css`, a sheet the inner
pages do not load. On `about-...html` the profile block therefore rendered at `x: 0` with
`margin: 0px` while its siblings were centred. Fix: the organisation layer now declares
`margin-inline: auto` on `.ea-container`, so centring no longer depends on which sheet is present.

### 5.2 Footer links escaped the footer container
`.tr-footer-links` is appended by the build outside `.ea-shell-footer-inner`, so on inner pages it
was full-bleed and centred (`x: 0`, `text-align: center`) under a left-aligned footer. Fix: the same
container width, left alignment and hairline rule used on the homepage now apply to
`.ea-shell-footer .tr-footer-links`. Measured: footer inner `x: 100 / w: 1240`, links
`x: 100 / w: 1240`.

### 5.3 10px root inflates rem-based typography
The template sets `html { font-size: 10px }`. `professional.css` was authored against a 16px root,
so every `rem` value in it renders at 62.5% on those pages:
- `.tr-clusters h3` (`1.2rem`) → **12px**, i.e. a cluster heading smaller than its own 18px list items;
- `.tr-clusters p` (`.88rem`) → **8.8px**;
- `.tr-related h2` (`1.35rem !important`) → **13.5px**, a section heading smaller than body copy.
Fix: those three blocks now carry explicit px sizes in the organisation layer (19px / 14px / 26px).
Changing the root was rejected because `main.css` is otherwise px-based and Bootstrap gutters assume
the 10px root.

### 5.4 A second blue failed contrast
`main.css` defines `--rs-theme-primary: #5777ff`. As body-size text that is **3.8:1** on white and
**3.67:1** on `#f9faff`; as a button background with white text it is **3.83:1**. The homepage uses
`#0b55ff`, so the site shipped two different brand blues with different legibility.
Fix: `--rs-theme-primary` is aligned to `#0b55ff` (5.6:1 with white, 5.6:1 as text on white).
Measured contrast failures: insights **25 → 2**, about **8 → 4** (the two remaining on about are
white text over a gradient card, where the scanner reads the transparent parent as white).

### 5.5 Insights closing band was the only full-bleed block
`main > .ea-insights-cta` ("Ressource pratique") is a direct child of `<main>` while every sibling
sits in a Bootstrap container, so it rendered edge-to-edge at `x: 0 / w: 1425` with a 28px radius
touching the viewport, and its `.ea-insights-kicker` spanned the whole 924px grid column because grid
items blockify `inline-flex` into `flex`.
Fix: the band now matches the container content box at every breakpoint (verified `dx: 0` at
585/700/752/885/1024/1425px) and the kicker is `justify-self: start`.

### 5.6 Pointer targets
Desktop header links were 22px tall and card text links 22–26px, below the 24px WCAG 2.5.8 minimum.
Fix: header links and standalone card links now have `min-height: 24px` (card links 44px); measured
header links 24px, header height unchanged at 83px.

### 5.7 Booking page label floor
`reserver-diagnostic/` loads its own sheet (`assets/lead-page/reserver-diagnostic.css`) and none of the
shared ones, so it kept 10.5–11.5px reassurance text ("Aucun paiement demandé", "4 champs",
"optionnel", privacy note, final-CTA eyebrow) and a 4.0:1 grey on two labels. Fix: a scoped block in
that page sheet raises those to 12px and darkens `optionnel` / "Diagnostic réalisé par" to
`#526079` (5.7:1). Text below 12px on the page: **16 → 0**.

## 6. Evidence

| Check | Result |
| --- | --- |
| Section rhythm @1440 | `100.8px` on all content sections, `40px` on the client band |
| Section rhythm @390/768 | `64px` on all content sections |
| H1 scale 390 / 768 / 1024 / 1440 | `38 / 44 / 45.06 / 63.36px` (monotonic) |
| Section H2 scale 390 / 768 / 1024 / 1440 | `32.75 / 35.32 / 47.11 / 66.24px` |
| Project media | `334×250` ×4 @390, `442×420` ×4 @768, `793×420` ×4 @1440 |
| Contrast failures (home / formations / ai / insights / about / en) | `2 / 2 / 2 / 2 / 4 / 3` — all remaining are visually-hidden labels or text over gradients |
| Text below 12px (home / insights / about / booking) | `4 / 0 / 0 / 0` — the 4 are the 11px FR/EN control labels |
| Horizontal overflow | `0` at 390, 768, 1024, 1440 on every page measured |
| Mobile menu | opens with focus on the first link, Escape returns focus to the button |
| Inner-page container / footer alignment | `dx: 0` vs the page container |
| `npm run lint` / `npm run typecheck` / `npm test` | pass / pass / 12 of 12 groups |
| Lighthouse (built output, mobile viewport) | accessibility 100, best practices 100, SEO 100, 0 failures |

Build output: 488 HTML files, 480 sitemap URLs, SEO audit passed. Changes are uncommitted and not
deployed; publication to elboubakry.com remains an owner action.
