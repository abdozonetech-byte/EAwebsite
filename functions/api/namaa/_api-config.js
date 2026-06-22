// Namaa API configuration
// Update 30: Gemini agents with human conversation mode, soft topic bridge, smart brief builder, prompt library, diagnostics, and reliability tuning.
// Keep API keys outside frontend JavaScript. Add GEMINI_API_KEY in Cloudflare Pages Secrets.

export const NAMAA_API_CONFIG = {
  talk: {
    provider: 'gemini',
    modelEnv: 'GEMINI_TEXT_MODEL',
    fallbackModel: 'gemini-3.1-flash-lite',
    apiKeyEnv: 'GEMINI_API_KEY',
    // Normal chat uses a tiny Gemini micro-conversation mode; confirmed deliverables use bigger output.
    maxOutputTokens: 560,
    conversationMaxOutputTokens: 220,
    deliverableMaxOutputTokens: 2400,
    temperature: 0.38,
    requestTimeoutMs: 25000,
    retryAttempts: 1,
  },
  images: {
    provider: 'gemini',
    modelEnv: 'GEMINI_IMAGE_MODEL',
    // Official Google Gemini image model. Can be overridden in Cloudflare with GEMINI_IMAGE_MODEL.
    fallbackModel: 'gemini-3.1-flash-image',
    apiKeyEnv: 'GEMINI_API_KEY',
    purpose: 'mockup-only',
    connected: true,
    aspectRatio: '16:9',
    imageSize: '1K',
    requestTimeoutMs: 45000,
    retryAttempts: 1,
  },
  dev: {
    provider: 'gemini',
    modelEnv: 'GEMINI_TEXT_MODEL',
    fallbackModel: 'gemini-3.1-flash-lite',
    apiKeyEnv: 'GEMINI_API_KEY',
    maxOutputTokens: 2600,
    temperature: 0.38,
    requestTimeoutMs: 28000,
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

export function extractGeminiImage(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  if (!imagePart) return null;
  const inlineData = imagePart.inlineData || imagePart.inline_data || {};
  return {
    mimeType: inlineData.mimeType || inlineData.mime_type || 'image/png',
    data: inlineData.data || '',
  };
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
      error: error?.message || 'Gemini API request timed out.',
      model,
      provider: 'gemini',
    };
  }
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

function extractInteractionsImage(data) {
  const outputImage = data?.output_image || data?.outputImage;
  if (outputImage?.data) {
    return {
      mimeType: outputImage.mime_type || outputImage.mimeType || 'image/png',
      data: outputImage.data,
    };
  }

  const outputs = Array.isArray(data?.output) ? data.output : [];
  for (const item of outputs) {
    const image = item?.image || item?.output_image || item?.outputImage;
    if (image?.data) {
      return {
        mimeType: image.mime_type || image.mimeType || 'image/png',
        data: image.data,
      };
    }
    if ((item?.type === 'image' || item?.mime_type || item?.mimeType) && item?.data) {
      return {
        mimeType: item.mime_type || item.mimeType || 'image/png',
        data: item.data,
      };
    }
  }

  return extractGeminiImage(data);
}

function extractInteractionsText(data) {
  if (typeof data?.output_text === 'string') return data.output_text.trim();
  const outputs = Array.isArray(data?.output) ? data.output : [];
  return outputs
    .map((item) => item?.text || item?.content?.text || '')
    .filter(Boolean)
    .join('\n')
    .trim() || extractGeminiText(data);
}

export async function callGeminiImage({ env, config, prompt, aspectRatio }) {
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
      error: 'Missing Gemini image model. Add GEMINI_IMAGE_MODEL or keep fallback model in _api-config.js.',
      model,
    };
  }

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const responseFormat = {
    type: 'image',
    aspect_ratio: aspectRatio || config.aspectRatio || '16:9',
    image_size: config.imageSize || '1K',
  };

  const payload = {
    model,
    input: [{ type: 'text', text: prompt }],
    response_format: responseFormat,
  };

  let response;
  let data;
  try {
    ({ response, data } = await fetchJsonWithRetry(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20',
      },
      body: JSON.stringify(payload),
    }, config));
  } catch (error) {
    return {
      ok: false,
      status: 504,
      error: error?.message || 'Gemini image request timed out.',
      model,
      provider: 'gemini',
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || 'Gemini image request failed.',
      model,
      provider: 'gemini',
    };
  }

  const image = extractInteractionsImage(data);
  const text = extractInteractionsText(data);

  if (!image?.data) {
    return {
      ok: false,
      status: 502,
      error: text || 'Gemini returned no image data. Try a simpler visual prompt or a different GEMINI_IMAGE_MODEL.',
      model,
      provider: 'gemini',
    };
  }

  return {
    ok: true,
    status: 200,
    provider: 'gemini',
    model,
    image,
    text,
  };
}

export function safeText(value, max = 4000) {
  return String(value || '').trim().slice(0, max);
}
