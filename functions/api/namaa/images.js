import { NAMAA_API_CONFIG, getSecret, jsonResponse, readJson } from './_api-config.js';

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const config = NAMAA_API_CONFIG.images;
  const hasKey = Boolean(getSecret(context.env, config.apiKeyEnv));

  return jsonResponse({
    ok: false,
    route: 'namaa-images',
    connected: false,
    message: 'Namaa Images API is prepared but not connected yet. Add your Nano Banana provider/model/endpoint and secret key in environment variables.',
    expectedSecret: config.apiKeyEnv,
    hasSecret: hasKey,
    purpose: config.purpose,
    received: {
      prompt: body.prompt || '',
      mode: body.mode || 'images',
    },
  }, 501);
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    route: 'namaa-images',
    status: 'placeholder-ready',
    connected: false,
    purpose: 'mockup-only',
  });
}
