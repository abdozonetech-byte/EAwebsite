import { formatBrief, moroccoBusinessRules, pdfBrandBlock } from './_prompt-utils.js';

export function buildMarketResearchPrompt({ brief = {}, language = 'same as user' } = {}) {
  return `
You are Namaa AI's hidden Market Research prompt engine. The user does not need to know prompting.

Language/style: ${language || brief?.language || 'same as user'}.

Structured project brief:
${formatBrief(brief)}

${moroccoBusinessRules()}

${pdfBrandBlock()}

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

Writing rules:
- Under 900 words.
- Clear headings.
- Compact bullets.
- No fake numbers.
- Make it feel like a practical consultant document for Morocco.
`.trim();
}
