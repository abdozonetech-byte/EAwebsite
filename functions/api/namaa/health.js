import { NAMAA_API_CONFIG, jsonResponse } from './_api-config.js';

export async function onRequestGet(context) {
  const env = context.env || {};
  return jsonResponse({
    ok: true,
    service: 'Namaa AI API',
    update: '33-namaa-voice-layer',
    security: 'API keys are read only from Cloudflare environment secrets.',
    promptLibrary: ['voice-layer.js','conversation.js','market-research.js','marketing-strategy.js','roadmap.js','image-mockup.js','website-template.js','system-talk.js'],
    diagnosticsEndpoint: '/api/namaa/diagnostics',
    reliability: ['Gemini intelligence with Namaa Voice Layer','soft topic bridge','free natural Darija Latin/French/English/Arabic replies','emoji-aware short replies','controlled deliverables','Gemini timeout protection','one retry for transient 429/5xx errors'],
    brandedPdfGenerator: ['market_research','marketing_strategy','roadmap','Namaa logo','Elboubakry brand identity'],
    smartAgentFlow: ['brief','market_research_pdf','marketing_strategy_pdf','images_mockup','namaa_dev_landing_page','final_cta'],
    smartBriefBuilder: ['projectName','category','offer','market','budget','target','goal','stage','channels','language'],
    providers: {
      talk: {
        provider: NAMAA_API_CONFIG.talk.provider + ' + namaa-voice-layer + smart-brief-builder',
        connected: Boolean(env[NAMAA_API_CONFIG.talk.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.talk.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel,
        behavior: 'Gemini powers daily conversation, then Namaa Voice Layer rewrites the final answer in Namaa's Moroccan/friendly/short style while staying limited to AI, business, IT, startups, marketing, technology, programming and projects; controller keeps briefs/actions clean; optimized deliverables; smart handoff after PDF: market research → strategy → images → dev',
      },
      dev: {
        provider: NAMAA_API_CONFIG.dev.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.dev.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.dev.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.dev.modelEnv] || NAMAA_API_CONFIG.dev.fallbackModel,
        templateLibrary: ['saas','restaurant','ecommerce','clinic','agency','local_service','education','real_estate','beauty','tourism','ai_business','generic'],
        promptLibrary: 'website-template.js',
      },
      images: {
        provider: NAMAA_API_CONFIG.images.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.images.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.images.modelEnv] || NAMAA_API_CONFIG.images.fallbackModel,
        purpose: NAMAA_API_CONFIG.images.purpose,
        packEngine: 'category-based-logo-mockup-board',
        promptLibrary: 'image-mockup.js',
        status: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]) ? 'ready' : 'missing-gemini-secret',
      },
    },
  });
}
