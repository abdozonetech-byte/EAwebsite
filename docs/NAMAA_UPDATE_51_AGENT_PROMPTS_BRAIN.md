# Namaa AI — Update 51: Agent Prompts Brain

## Goal
Strengthen the intelligence and output behavior of each Namaa agent without changing the dashboard UI/UX or animations.

## What changed
- Upgraded `/api/namaa/agent` with stronger role prompts for:
  - Namaa Business Talk
  - Namaa Strategy
  - Namaa Design
  - Namaa Website
- Added shared Namaa identity and language rules:
  - Darija Latin when the user writes Darija Latin
  - French, English, or Arabic script only when requested/used
  - Morocco-first practical business execution
- Added stronger output contracts per agent:
  - Business Talk: short diagnosis + steps + one smart question
  - Strategy: diagnosis, market logic, positioning, offer, roadmap, KPIs, design handoff
  - Design: brand direction, logo concepts, palette, mockups, Nano Banana/Gemini prompt
  - Website: landing page plan or safe standalone HTML/CSS/JS when requested
- Added intent detection metadata inside the internal prompt.
- Added `brainVersion: 51-agent-prompts-brain` to API responses.
- Kept secrets outside frontend code.

## Files changed
- `functions/api/namaa/agent.js`
- `assistant-ia-maroc/js/namaa-chat.js`
- `docs/NAMAA_UPDATE_51_AGENT_PROMPTS_BRAIN.md`
- `SECURITY_SCAN_UPDATE_51.md`
- `deploy-git-commands.txt`

## Security note
This update changes backend prompt routing behavior only. No API keys or secrets were added to frontend files.
