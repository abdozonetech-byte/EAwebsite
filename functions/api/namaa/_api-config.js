// Namaa API configuration placeholder
// Update 07: keys are intentionally empty and must stay outside frontend JavaScript.
// Recommended: add real secret keys in Cloudflare Pages environment variables.

export const NAMAA_API_CONFIG = {
  talk: {
    provider: '',
    model: '',
    apiKeyEnv: 'GEMINI_API_KEY',
    endpoint: '',
    maxOutputTokens: 700,
  },
  images: {
    provider: '',
    model: '',
    apiKeyEnv: 'NANO_BANANA_API_KEY',
    endpoint: '',
    purpose: 'mockup-only',
  },
  dev: {
    provider: '',
    model: '',
    apiKeyEnv: 'GEMINI_API_KEY',
    endpoint: '',
    maxOutputTokens: 1400,
  },
  openai: {
    apiKeyEnv: 'OPENAI_API_KEY',
    endpoint: '',
  },
  gemini: {
    apiKeyEnv: 'GEMINI_API_KEY',
    endpoint: '',
  },
  nanoBanana: {
    apiKeyEnv: 'NANO_BANANA_API_KEY',
    endpoint: '',
  },
};

export function getSecret(env, envName) {
  return env && envName ? env[envName] || '' : '';
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}
