# Namaa AI Update 45 — Live Sources / Gemini Grounding

This update adds optional live source grounding for confirmed Namaa research deliverables.

## Added

- Gemini Google Search grounding for confirmed PDF deliverables.
- Grounded model support via `GEMINI_GROUNDED_MODEL` with fallback `gemini-2.5-flash`.
- `NAMAA_ENABLE_LIVE_SOURCES=false` switch to disable live grounding if needed.
- Live citations extracted from Gemini grounding metadata and merged with curated Morocco source registry.
- PDF preview and printable PDF can display clickable live citation sources.
- Health and diagnostics endpoints updated to show live source status.

## Important

Free Talk remains fast and does not use live grounding by default. Grounding is only used for confirmed deliverables like Market Research, Marketing Strategy, and Launch Roadmap.

## Cloudflare variables

Required:

```txt
GEMINI_API_KEY
```

Optional:

```txt
GEMINI_GROUNDED_MODEL=gemini-2.5-flash
NAMAA_ENABLE_LIVE_SOURCES=false
```

Leave `NAMAA_ENABLE_LIVE_SOURCES` empty or unset to keep live source grounding enabled.
