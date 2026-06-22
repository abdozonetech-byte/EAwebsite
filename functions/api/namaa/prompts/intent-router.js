// Reserved for the next optimization stage: structured Gemini intent routing.
// The current controller is rule-based to keep normal chat cheap and fast.

export const INTENT_ROUTER_SCHEMA = {
  intents: [
    'small_talk',
    'business_question',
    'market_research_request',
    'marketing_strategy_request',
    'roadmap_request',
    'image_mockup_request',
    'website_request',
    'out_of_scope',
  ],
  requiredBriefFields: [
    'projectName', 'category', 'offer', 'market', 'budget', 'target', 'goal', 'stage', 'channels', 'language',
  ],
};
