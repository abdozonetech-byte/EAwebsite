import { NAMAA_API_CONFIG, getSecret, jsonResponse, readJson } from './_api-config.js';

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const config = NAMAA_API_CONFIG.dev;
  const hasKey = Boolean(getSecret(context.env, config.apiKeyEnv));

  return jsonResponse({
    ok: false,
    route: 'namaa-dev',
    connected: false,
    message: 'NamaaDev API is prepared but not connected yet. Add your provider, model, endpoint and secret key in environment variables.',
    expectedSecret: config.apiKeyEnv,
    hasSecret: hasKey,
    received: {
      prompt: body.prompt || '',
      mode: body.mode || 'dev',
    },
  }, 501);
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    route: 'namaa-dev',
    status: 'placeholder-ready',
    connected: false,
  });
}
