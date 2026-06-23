# Namaa AI — Update 33: Namaa Voice Layer

Goal: keep Gemini as the intelligence engine while making the final answer feel like Namaa, not a generic Gemini response.

## Added
- `functions/api/namaa/prompts/voice-layer.js`
- Namaa Voice Layer system prompt
- Final answer prompt builder that uses:
  - current user message
  - detected intent
  - current project brief
  - missing project questions
  - previous Namaa replies to avoid repetition
  - fallback meaning without copying it robotically

## Improved
- Normal chat now goes through Gemini + Namaa Voice Layer.
- Namaa keeps Darija Latin when the user uses Moroccan chat style.
- Namaa avoids repeating the same sentence in small talk.
- Namaa answers casual messages naturally, then softly returns to AI/business/IT/projects only when natural.
- Namaa still keeps long outputs controlled for PDFs, strategy, roadmap, images and dev.

## Security
- No API keys added to files.
- Gemini still uses `GEMINI_API_KEY` from Cloudflare Secrets only.
