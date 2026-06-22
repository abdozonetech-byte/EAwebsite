import { formatBrief, moroccoBusinessRules, pdfBrandBlock } from './_prompt-utils.js';
import { buildSourcesPromptBlock, buildGroundedSearchInstruction } from '../sources/source-registry.js';

export function buildMarketResearchPrompt({ brief = {}, language = 'same as user', selectedSources } = {}) {
  return `
You are Namaa AI's hidden Market Research prompt engine. The user does not need to know prompting.

Language/style: ${language || brief?.language || 'same as user'}.

Structured project brief:
${formatBrief(brief)}

${moroccoBusinessRules()}

${pdfBrandBlock()}

${buildSourcesPromptBlock({ brief, selectedSources, action: 'market_research' })}

${buildGroundedSearchInstruction({ brief, selectedSources, action: 'market_research' })}

TASK:
Create a Market Research PDF draft for this project.

Required structure:
1. Executive project snapshot
2. Morocco market context
3. Target customer behavior
4. Competitors and alternatives
5. Opportunity gap
6. Risks and assumptions
7. Positioning recommendation
8. Validation plan for the next 7 days

Source and citation rules:
- Add a short 'Sources used' section near the end.
- Separate verified/source-backed context from Namaa recommendations.
- Do not invent exact statistics; write 'needs verification from an official source' when needed.

Writing rules:
- Under 900 words.
- Clear headings.
- Compact bullets.
- No fake numbers.
- Make it feel like a practical consultant document for Morocco.
`.trim();
}
