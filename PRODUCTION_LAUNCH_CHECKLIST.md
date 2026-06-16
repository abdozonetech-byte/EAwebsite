# Production Launch Checklist — Elboubakry Website

Generated: 2026-06-16 19:02 UTC

Use this checklist after pushing to GitHub and after Cloudflare finishes deployment.

## 1. Deployment

- [ ] Run `git status` and confirm there are no unexpected files.
- [ ] Run `git add .`
- [ ] Run `git commit -m "Update 09 final audit and production checklist"`
- [ ] Run `git push`
- [ ] Open Cloudflare → Workers & Pages → `eawebsite` → Deployments.
- [ ] Confirm latest deployment is **Success**.
- [ ] If live site still shows old version, purge Cloudflare cache and hard refresh.

## 2. Core Pages

Open and verify:

- [ ] `https://www.elboubakry.com/`
- [ ] `https://www.elboubakry.com/insights/`
- [ ] `https://www.elboubakry.com/reserver-diagnostic/`
- [ ] `https://www.elboubakry.com/about-elboubakry-abdessamad.html`
- [ ] `https://www.elboubakry.com/merci/`
- [ ] `https://www.elboubakry.com/sitemap.xml`
- [ ] `https://www.elboubakry.com/robots.txt`
- [ ] `https://www.elboubakry.com/llms.txt`
- [ ] `https://www.elboubakry.com/.well-known/security.txt`

## 3. Insights / Articles

- [ ] `/insights/` loads with full design, not raw HTML.
- [ ] Every visible article card opens correctly.
- [ ] No page shows `Guide en préparation`.
- [ ] Every article has a clear H1.
- [ ] Every article has the same header/footer style.
- [ ] Every article has a CTA to `/reserver-diagnostic/`.
- [ ] No duplicated paths like `/insights/insights/`.
- [ ] No duplicated diagnostic paths like `/reserver-diagnostic/reserver-diagnostic/`.

## 4. Lead Page + Google Sheet

- [ ] Open `https://www.elboubakry.com/reserver-diagnostic/`.
- [ ] Form loads on desktop.
- [ ] Form loads on mobile.
- [ ] Required fields are clear.
- [ ] Submit button is visible and clickable.
- [ ] Open `https://www.elboubakry.com/reserver-diagnostic/?lead_debug=1`.
- [ ] Click `Send TEST LEAD to Google Sheet`.
- [ ] Verify a row appears in Google Sheet with `TEST LEAD - Elboubakry Website`.
- [ ] Verify WhatsApp fallback link works.
- [ ] Verify success/thank-you flow works.

## 5. UI / UX

- [ ] No horizontal scroll on mobile.
- [ ] Navbar works on desktop and mobile.
- [ ] Main CTA wording is consistent: `Réserver un diagnostic gratuit`.
- [ ] Footer keeps the same brand feeling and is not visually disconnected.
- [ ] No large empty section gaps.
- [ ] Cards are aligned and readable.
- [ ] Hero text has no repeated `Consultant` wording.
- [ ] Portfolio carousel remains smooth.

## 6. SEO

- [ ] Homepage title and meta description are correct.
- [ ] Insights title and meta description are correct.
- [ ] Every article has unique title/meta/canonical.
- [ ] sitemap.xml contains only working public pages.
- [ ] robots.txt references sitemap.xml.
- [ ] canonical URLs use `https://www.elboubakry.com`.
- [ ] No canonical points to localhost, GitHub Pages, or pages.dev.
- [ ] JSON-LD does not include fake reviews, fake ratings, fake clients, or fake results.
- [ ] Submit sitemap to Google Search Console.

## 7. AI SEO

- [ ] `llms.txt` opens correctly.
- [ ] `assets/data/ai-overview.json` opens correctly.
- [ ] Brand/entity wording is consistent: `Elboubakry Abdessamad` and `Consultant Marketing Digital au Maroc`.
- [ ] FAQ content is visible where FAQ schema exists.

## 8. Security

- [ ] `_headers` is deployed by Cloudflare Pages.
- [ ] Browser console shows no CSP errors.
- [ ] The form still works after CSP headers.
- [ ] External links open safely.
- [ ] `/.well-known/security.txt` opens.

## 9. Speed

- [ ] Homepage loads quickly on mobile.
- [ ] Hero image loads correctly.
- [ ] Non-critical images lazy-load.
- [ ] No broken WebP images.
- [ ] Run PageSpeed Insights for mobile and desktop.
- [ ] Fix any live-only PageSpeed issue.

## 10. Final Approval

- [ ] Desktop approved.
- [ ] Mobile approved.
- [ ] Articles approved.
- [ ] Lead test approved.
- [ ] Google Sheet lead received.
- [ ] Cloudflare deployment success.
- [ ] Search Console sitemap submitted.

