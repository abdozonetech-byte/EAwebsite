# Namaa AI Update 74 — Full Flow Test

## Goal
Stabilize the Namaa AI user journey before final CRM/Sheet work.

Correct flow:

```text
Namaa Business Talk → Namaa Design → Namaa Website → Namaa Strategy
```

## What changed

- Locked the agent order so users cannot jump to Website before Design or Strategy before Website.
- Business Talk now only opens the correct next step: Namaa Design.
- Design opens Website only after design output is generated.
- Website opens Strategy only after a real landing page preview is generated.
- Strategy remains the final output step with 3 branded strategy boards.
- CRM/email popup is parked for the final CRM update, as requested.
- Updated frontend cache version to `v=74`.
- Updated backend brain version to `74-full-flow-test`.

## Not changed

- No API keys were added to frontend.
- Gemini routing remains backend-only through Cloudflare secrets.
- Website preview still hides source code and shows only the live landing page preview.
- CRM/Sheet final connection is left for the last update.

## Test checklist

1. Open `/assistant-ia-maroc/`.
2. Ask Namaa Business Talk to build a project.
3. Confirm the brief with `yes`, `s7i7`, `ok`, or `oui`.
4. Open Namaa Design.
5. Generate design.
6. Open Namaa Website.
7. Generate live landing page preview.
8. Open final Namaa Strategy.
9. Generate strategy boards.
10. Confirm there is no CRM/email popup yet.

