import { NAMAA_API_CONFIG, jsonResponse } from './_api-config.js';

export async function onRequestGet(context) {
  const env = context.env || {};
  return jsonResponse({
    ok: true,
    service: 'Namaa AI API',
    update: '13-gemini-text-and-images',
    security: 'API keys are read only from Cloudflare environment secrets.',
    providers: {
      talk: {
        provider: NAMAA_API_CONFIG.talk.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.talk.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.talk.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel,
      },
      dev: {
        provider: NAMAA_API_CONFIG.dev.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.dev.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.dev.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.dev.modelEnv] || NAMAA_API_CONFIG.dev.fallbackModel,
      },
      images: {
        provider: NAMAA_API_CONFIG.images.provider,
        connected: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]),
        secret: NAMAA_API_CONFIG.images.apiKeyEnv,
        model: env[NAMAA_API_CONFIG.images.modelEnv] || NAMAA_API_CONFIG.images.fallbackModel,
        purpose: NAMAA_API_CONFIG.images.purpose,
        status: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]) ? 'ready' : 'missing-gemini-secret',
      },
    },
  });
}
