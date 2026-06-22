# Namaa AI — Update 50: Gemini Agent Router

This update connects the Namaa dashboard chat UI to a unified Gemini-backed agent router.

## Added

- New Cloudflare Pages Function:
  - `/api/namaa/agent`

## Agents now routed

- `business` → Namaa Business Talk
- `strategy` → Namaa Strategy
- `design` → Namaa Design
- `website` → Namaa Website

## Frontend change

The dashboard chat now sends messages first to:

```txt
/api/namaa/agent
```

Then falls back to:

```txt
/api/namaa/talk
/api/namaa
```

## Security

- No API key is stored in frontend JavaScript.
- The router uses Cloudflare environment secret `GEMINI_API_KEY`.
- Model names can still be overridden with `GEMINI_TEXT_MODEL` and `GEMINI_IMAGE_MODEL`.
- If the secret is missing, the agent returns a safe fallback instead of exposing errors.

## Next update

Update 51 should strengthen the agent prompt brain and separate deeper behavior per agent.
