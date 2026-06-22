import { NAMAA_API_CONFIG, jsonResponse } from './_api-config.js';

export async function onRequestGet(context) {
  const env = context.env || {};
  return jsonResponse({
    ok: true,
    service: 'Namaa AI API',
    update: '46-mui-template-rebuild',
    security: 'API keys are read only from Cloudflare environment secrets.',
    promptLibrary: ['sources/source-registry.js','voice-layer.js','conversation.js','market-research.js','marketing-strategy.js','roadmap.js','image-mockup.js','website-template.js','system-talk.js'],
    diagnosticsEndpoint: '/api/namaa/diagnostics',
    muiBaseLayer: ['@mui/material via ESM CDN','ThemeProvider','Chip mode dock','Stepper factory flow','Premium Agent Hub cards','Factory cockpit','LinearProgress factory status','Fade/Grow transitions'],
    uxMap: ['Premium Free Talk entry card','Premium Build Project entry card','Premium entry choice screen + Build Project Wizard + Morocco taxonomy','MUI Agent Hub sidebar','MUI Factory Stepper','Strategy Agent','Design Agent','Web Agent','factory route map'],
    reliability: ['Gemini intelligence with Namaa Voice Layer','soft topic bridge','free natural Darija Latin/French/English/Arabic replies','emoji-aware short replies','controlled deliverables','Gemini timeout protection','one retry for transient 429/5xx errors'],
    brandedPdfGenerator: ['market_research','marketing_strategy','roadmap','Namaa mark','Elboubakry logo','premium cover','Project DNA table','document map','pipeline blocks','execution CTA'],
    smartAgentFlow: ['brief','market_research_pdf','marketing_strategy_pdf','images_mockup','namaa_dev_landing_page','final_cta'],
    smartBriefBuilder: ['projectName','category','branch','offer','market','budget','target','goal','stage','channels','language'],
    marketTaxonomy: ['16 project categories','100+ category branches','30+ Morocco cities/markets','city notes','category strategy notes'],
    strategyAgentUi: ['right preview while generating','premium factory loading card','document section map','automatic PDF preview panel','Market Research / Marketing Strategy / Roadmap states'],
    brandedPdfV2: ['premium printable layout','Project DNA','document map','Namaa Project Factory pipeline','Elboubakry CTA','mobile preview polish'],
    designAgentFactory: ['right preview while generating','logo skeleton','mockup board skeleton','category asset steps','animated Design Agent status','handoff to Web Agent'],
    trustedSourcesEngine: ['Morocco source registry','source selector per brief/category/action','Gemini Google Search grounding for confirmed research PDFs','live citations merged with curated sources','Fact vs Namaa recommendation rule','sources used panel in PDF preview/download','no fake numbers rule'],
    logoMockupPackSystem: ['logo-first workflow','brand board tokens','category-specific outputs','preview-only download lock note','Namaa Image Lab caption','SaaS/restaurant/ecommerce/clinic/agency/local-service/education/real-estate/beauty/tourism/AI packs'],
    providers: {
      talk: {
        provider: NAMAA_API_CONFIG.talk.provider + ' + namaa-voice-layer + smart-brief-builder',
        connected: Boolean(env[NAMAA_API_CONFIG.talk.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.talk.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel,
        behavior: 'Gemini powers daily conversation, then Namaa Voice Layer rewrites the final answer in Namaa style; confirmed deliverables can use Google Search grounding to add fresh citations; controller keeps briefs/actions clean; smart handoff after PDF: market research → strategy → images → dev',
        liveSources: {
          enabledByDefault: true,
          disableWith: NAMAA_API_CONFIG.talk.enableGroundingEnv + '=false',
          modelEnv: NAMAA_API_CONFIG.talk.groundingModelEnv,
          model: env[NAMAA_API_CONFIG.talk.groundingModelEnv] || NAMAA_API_CONFIG.talk.groundingFallbackModel,
        },
      },
      dev: {
        provider: NAMAA_API_CONFIG.dev.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.dev.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.dev.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.dev.modelEnv] || NAMAA_API_CONFIG.dev.fallbackModel,
        templateLibrary: ['saas','restaurant','ecommerce','clinic','agency','local_service','education','real_estate','beauty','tourism','ai_business','marketplace','mobile_app','content_media','b2b_industry','ngo_social','generic'],
        promptLibrary: 'website-template.js',
      },
      images: {
        provider: NAMAA_API_CONFIG.images.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.images.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.images.modelEnv] || NAMAA_API_CONFIG.images.fallbackModel,
        purpose: NAMAA_API_CONFIG.images.purpose,
        packEngine: 'logo-first-category-mockup-pack-v43',
        promptLibrary: 'image-mockup.js',
        status: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]) ? 'ready' : 'missing-gemini-secret',
      },
    },
  });
}
