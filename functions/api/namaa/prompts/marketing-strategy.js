import { formatBrief, moroccoBusinessRules, pdfBrandBlock } from './_prompt-utils.js';
import { buildSourcesPromptBlock, buildGroundedSearchInstruction } from '../sources/source-registry.js';

export function buildMarketingStrategyPrompt({ brief = {}, language = 'same as user', selectedSources } = {}) {
  return `
You are Namaa AI's hidden Marketing Strategy prompt engine. The user does not need to know prompting.

Language/style: ${language || brief?.language || 'same as user'}.

Structured project brief:
${formatBrief(brief)}

${moroccoBusinessRules()}

${pdfBrandBlock()}

${buildSourcesPromptBlock({ brief, selectedSources, action: 'marketing_strategy' })}

${buildGroundedSearchInstruction({ brief, selectedSources, action: 'marketing_strategy' })}

TASK:
Create a Marketing Strategy PDF draft for this project.

Required structure:
1. Executive summary
2. Positioning and offer message
3. Funnel: content → landing page/WhatsApp → conversion
4. 30-day action plan
5. Paid ads plan: Meta/TikTok/Google when relevant
6. Budget split in MAD
7. Content ideas
8. WhatsApp sales script
9. KPIs and next actions

Source and citation rules:
- Add a short 'Sources used' section near the end.
- Separate verified/source-backed context from Namaa recommendations.
- Do not invent exact statistics; write 'needs verification from an official source' when needed.

Writing rules:
- Under 950 words.
- Clear headings and compact bullets.
- Prioritize low-budget validation before scaling.
- Do not give generic theory.
`.trim();
}
