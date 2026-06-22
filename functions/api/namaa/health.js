import { NAMAA_API_CONFIG, getSecret, jsonResponse } from './_api-config.js';

export async function onRequestGet(context) {
  return jsonResponse({
    ok: true,
    name: 'Namaa API placeholder',
    connected: false,
    agents: {
      talk: {
        provider: NAMAA_API_CONFIG.talk.provider,
        model: NAMAA_API_CONFIG.talk.model,
        expectedSecret: NAMAA_API_CONFIG.talk.apiKeyEnv,
        hasSecret: Boolean(getSecret(context.env, NAMAA_API_CONFIG.talk.apiKeyEnv)),
      },
      images: {
        provider: NAMAA_API_CONFIG.images.provider,
        model: NAMAA_API_CONFIG.images.model,
        expectedSecret: NAMAA_API_CONFIG.images.apiKeyEnv,
        hasSecret: Boolean(getSecret(context.env, NAMAA_API_CONFIG.images.apiKeyEnv)),
      },
      dev: {
        provider: NAMAA_API_CONFIG.dev.provider,
        model: NAMAA_API_CONFIG.dev.model,
        expectedSecret: NAMAA_API_CONFIG.dev.apiKeyEnv,
        hasSecret: Boolean(getSecret(context.env, NAMAA_API_CONFIG.dev.apiKeyEnv)),
      },
    },
  });
}
