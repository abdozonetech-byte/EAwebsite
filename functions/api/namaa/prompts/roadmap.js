import { formatBrief, moroccoBusinessRules, pdfBrandBlock } from './_prompt-utils.js';
import { buildSourcesPromptBlock, buildGroundedSearchInstruction } from '../sources/source-registry.js';

export function buildRoadmapPrompt({ brief = {}, language = 'same as user', selectedSources } = {}) {
  return `
You are Namaa AI's hidden Roadmap prompt engine. The user does not need to know prompting.

Language/style: ${language || brief?.language || 'same as user'}.

Structured project brief:
${formatBrief(brief)}

${moroccoBusinessRules()}

${pdfBrandBlock()}

${buildSourcesPromptBlock({ brief, selectedSources, action: 'roadmap' })}

${buildGroundedSearchInstruction({ brief, selectedSources, action: 'roadmap' })}

TASK:
Create a Launch Roadmap PDF draft for this project.

Required structure:
1. Project objective
2. Week 1: offer, proof and positioning
3. Week 2: content, landing page and WhatsApp flow
4. Week 3: ads test and first leads/sales
5. Week 4: optimization and scale decision
6. Practical task checklist
7. KPIs and decision rules

Source and citation rules:
- Add a short 'Sources used' section near the end.
- Separate verified/source-backed context from Namaa recommendations.
- Do not invent exact statistics; write 'needs verification from an official source' when needed.

Writing rules:
- Under 850 words.
- Make it actionable and founder-friendly.
- Each week must have concrete tasks.
`.trim();
}
