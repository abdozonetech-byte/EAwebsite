import { buildMarketResearchPrompt } from './market-research.js';
import { buildMarketingStrategyPrompt } from './marketing-strategy.js';
import { buildRoadmapPrompt } from './roadmap.js';

export { NAMAA_TALK_SYSTEM_PROMPT } from './system-talk.js';
export { buildMarketResearchPrompt } from './market-research.js';
export { buildMarketingStrategyPrompt } from './marketing-strategy.js';
export { buildRoadmapPrompt } from './roadmap.js';
export { buildImageMockupPrompt } from './image-mockup.js';
export { NAMAA_DEV_SYSTEM_PROMPT, buildWebsiteTemplatePrompt } from './website-template.js';
export { INTENT_ROUTER_SCHEMA } from './intent-router.js';

export function buildDeliverablePrompt(action, brief, language, selectedSources) {
  const normalized = String(action || '').trim();
  if (normalized === 'market_research') return buildMarketResearchPrompt({ brief, language, selectedSources });
  if (normalized === 'roadmap') return buildRoadmapPrompt({ brief, language, selectedSources });
  return buildMarketingStrategyPrompt({ brief, language, selectedSources });
}

export { NAMAA_CONVERSATION_SYSTEM_PROMPT, buildConversationPrompt } from './conversation.js';
export { NAMAA_VOICE_LAYER_SYSTEM_PROMPT, buildNamaaVoicePrompt } from './voice-layer.js';
