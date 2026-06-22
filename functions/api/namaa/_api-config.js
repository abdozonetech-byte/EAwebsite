// Namaa API configuration
// Update 10: Gemini-only text connection for Namaa Talk and NamaaDev.
// Keep API keys outside frontend JavaScript. Add GEMINI_API_KEY in Cloudflare Pages Secrets.

export const NAMAA_API_CONFIG = {
  talk: {
    provider: 'gemini',
    modelEnv: 'GEMINI_TEXT_MODEL',
    fallbackModel: 'gemini-3.1-flash-lite',
    apiKeyEnv: 'GEMINI_API_KEY',
    maxOutputTokens: 900,
    temperature: 0.55,
  },
  images: {
    provider: 'gemini',
    modelEnv: 'GEMINI_IMAGE_MODEL',
    fallbackModel: '',
    apiKeyEnv: 'GEMINI_API_KEY',
    purpose: 'mockup-only',
    connected: false,
  },
  dev: {
    provider: 'gemini',
    modelEnv: 'GEMINI_TEXT_MODEL',
    fallbackModel: 'gemini-3.1-flash-lite',
    apiKeyEnv: 'GEMINI_API_KEY',
    maxOutputTokens: 2600,
    temperature: 0.45,
  },
};

export function getSecret(env, envName) {
  return env && envName ? env[envName] || '' : '';
}

export function getModel(env, config) {
  return (config && config.modelEnv && env && env[config.modelEnv]) || (config && config.fallbackModel) || '';
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
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

export function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-10)
    .filter((item) => item && typeof item.content === 'string')
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content).slice(0, 1800) }],
    }));
}

export function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('\n').trim();
}

export async function callGemini({ env, config, systemInstruction, contents }) {
  const apiKey = getSecret(env, config.apiKeyEnv);
  const model = getModel(env, config);

  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: `Missing Cloudflare secret: ${config.apiKeyEnv}`,
      model,
    };
  }

  if (!model) {
    return {
      ok: false,
      status: 500,
      error: 'Missing Gemini model. Add GEMINI_TEXT_MODEL or keep fallback model in _api-config.js.',
      model,
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: config.temperature ?? 0.5,
      maxOutputTokens: config.maxOutputTokens || 900,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || 'Gemini API request failed.',
      model,
      provider: 'gemini',
    };
  }

  return {
    ok: true,
    status: 200,
    text: extractGeminiText(data),
    model,
    provider: 'gemini',
  };
}

export function safeText(value, max = 4000) {
  return String(value || '').trim().slice(0, max);
}
