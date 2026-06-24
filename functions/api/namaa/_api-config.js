export const NAMAA_API_CONFIG = {
  talk: {
    modelEnv: 'GEMINI_TEXT_MODEL',
    fallbackModel: 'gemini-3.1-flash-lite',
    apiKeyEnv: 'GEMINI_API_KEY',
    maxOutputTokens: 420,
    conversationMaxOutputTokens: 420,
    conversationTimeoutMs: 8000,
    temperature: 0.38,
    requestTimeoutMs: 25000,
    retryAttempts: 1,
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

export function safeText(value, max = 4000) {
  return String(value || '').trim().slice(0, max);
}

export function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-8)
    .filter((item) => item && typeof item.content === 'string')
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: safeText(item.content, 1600) }],
    }));
}

function safeApiError(message = 'Namaa Talk is temporarily unavailable.') {
  const value = String(message || '').trim();
  if (!value) return 'Namaa Talk is temporarily unavailable.';
  if (/api key|secret|token|model|generativelanguage|googleapis|stack|trace/i.test(value)) {
    return 'Namaa Talk is temporarily unavailable. Check private Cloudflare configuration and redeploy.';
  }
  return value.slice(0, 220);
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('\n').trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('Namaa request timeout'), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithRetry(url, options = {}, config = {}) {
  const attempts = Math.max(0, Number(config.retryAttempts || 0));
  const timeoutMs = Number(config.requestTimeoutMs || 25000);
  let lastResponse = null;
  let lastData = null;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      const data = await response.json().catch(() => ({}));
      lastResponse = response;
      lastData = data;
      if (response.ok || !shouldRetry(response.status) || attempt === attempts) {
        return { response, data };
      }
    } catch (error) {
      if (attempt === attempts) throw error;
    }
    await sleep(350 * (attempt + 1));
  }

  return { response: lastResponse, data: lastData || {} };
}

export async function callGemini({ env, config, systemInstruction, contents }) {
  const apiKey = getSecret(env, config.apiKeyEnv);
  const model = getModel(env, config);

  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: 'Namaa private AI secret is not configured.',
      model,
    };
  }

  if (!model) {
    return {
      ok: false,
      status: 500,
      error: 'Namaa model configuration is not ready.',
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
      temperature: config.temperature ?? 0.42,
      maxOutputTokens: config.maxOutputTokens || 420,
    },
  };

  let response;
  let data;
  try {
    ({ response, data } = await fetchJsonWithRetry(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }, config));
  } catch (error) {
    return {
      ok: false,
      status: 504,
      error: safeApiError(error?.message),
      model,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: safeApiError(data?.error?.message),
      model,
    };
  }

  return {
    ok: true,
    status: 200,
    text: extractGeminiText(data),
    model,
  };
}
