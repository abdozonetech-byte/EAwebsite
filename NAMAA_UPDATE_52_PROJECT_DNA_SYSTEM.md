# Namaa AI Update 52 — Project DNA System

## Goal
Create a central Project DNA system so Namaa AI Talk collects one clean project brief and all agents can reuse the same data.

## Added
- Persistent Project DNA state using browser localStorage.
- `window.NamaaRuntime.getProjectDNA()`, `setProjectDNA()`, and `clearProjectDNA()` helpers.
- Project DNA score, status, created/updated timestamps and agent-ready routing map.
- Sidebar Project DNA status card.
- Agent sidebar unlock behavior after Project DNA is ready.
- MUI Agent Hub now reacts to active Project DNA and shows DNA readiness.
- New chat keeps the active Project DNA instead of deleting it.
- New project flow clears old Project DNA before starting a fresh brief.

## UX behavior
- Before Project DNA: agents show “Needs Project DNA” and open Project Build.
- After Project DNA: agents show “DNA ready” and can reuse the saved brief.
- Market / Strategy / Startup agents route to the right document actions.
- Brand / Mockups and IT / Website agents open with the saved Project DNA context.

## Safety
- No unrelated website pages changed.
- Home remains Namaa AI Talk first.
- Arabic script removed from visible Namaa Talk / Project Build UI strings by default.
