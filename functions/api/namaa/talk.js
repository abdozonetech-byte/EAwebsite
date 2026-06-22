import { NAMAA_API_CONFIG, getSecret, jsonResponse, readJson } from './_api-config.js';

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const config = NAMAA_API_CONFIG.talk;
  const hasKey = Boolean(getSecret(context.env, config.apiKeyEnv));

  return jsonResponse({
    ok: false,
    route: 'namaa-talk',
    connected: false,
    message: 'Namaa Talk API is prepared but not connected yet. Add your provider, model, endpoint and secret key in environment variables.',
    expectedSecret: config.apiKeyEnv,
    hasSecret: hasKey,
    received: {
      message: body.message || '',
      mode: body.mode || 'talk',
    },
  }, 501);
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    status: 'placeholder-ready',
    connected: false,
  });
}
