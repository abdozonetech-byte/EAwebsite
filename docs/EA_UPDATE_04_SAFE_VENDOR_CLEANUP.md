# EA Update 04 — Safe Vendor Cleanup

## Scope

This update performs a safe performance cleanup without changing UI/UX, layout, animations, content, SEO metadata, tracking, forms, sitemap, redirects, or page structure.

## Main change

The project previously loaded the full Remix Icon stylesheet on most pages:

- `assets/css/vendor/remixicon.css`
- Raw size: `140,557 bytes`

That file contains thousands of icon rules, while the site uses only a small set of icons.

Update 04 adds a generated sitewide subset:

- `assets/css/vendor-subsets/remixicon-site-subset.css`
- Raw size: `5,974 bytes`

All active HTML references to the full Remix Icon CSS were replaced with the subset.

## Result

- Active full Remix Icon CSS links in HTML: `0`
- Active subset links in HTML: `41`
- Valid site icon rules covered by subset: `100`
- Raw CSS saved per page where the icon CSS is loaded: `134,583 bytes`

## Visual safety

The subset keeps:

- the same `@font-face`
- the same Remix Icon font family
- the same `[class^="ri-"]` base rule
- the exact `content` values from the original Remix Icon CSS

So the existing icons should render the same.

## Note

One token was found in the HTML but does not exist in the original Remix Icon CSS: `ri-target-line`.
Because it was already missing in the original library, this update keeps the same behavior and does not invent a replacement icon.

## Verification

Run:

```bash
python3 tools/ea_update_04_remixicon_subset_check.py
```

Expected status: `PASS`.
