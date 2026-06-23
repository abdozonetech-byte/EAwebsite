// Namaa API configuration
// Update 45: live source grounding for trusted Morocco research.
// Keep API keys outside frontend JavaScript. Add GEMINI_API_KEY in Cloudflare Pages Secrets.

export const NAMAA_API_CONFIG = {
  talk: {
    provider: 'gemini',
    modelEnv: 'GEMINI_TEXT_MODEL',
    fallbackModel: 'gemini-3.1-flash-lite',
    apiKeyEnv: 'GEMINI_API_KEY',
    // Normal chat uses Gemini through Namaa Voice Layer; confirmed deliverables use bigger controlled output.
    maxOutputTokens: 420,
    conversationMaxOutputTokens: 170,
    conversationTimeoutMs: 8000,
    deliverableMaxOutputTokens: 2400,
    // Update 45: optional Google Search grounding for confirmed research/PDF deliverables.
    groundingModelEnv: 'GEMINI_GROUNDED_MODEL',
    groundingFallbackModel: 'gemini-2.5-flash',
    enableGroundingEnv: 'NAMAA_ENABLE_LIVE_SOURCES',
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
    imageMimeType: 'image/jpeg',
    requestTimeoutMs: 60000,
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


export function isDebugRequest(context) {
  try {
    const request = context?.request;
    const env = context?.env || {};
    const url = request?.url ? new URL(request.url) : null;
    const token = request?.headers?.get('x-namaa-debug-token') || url?.searchParams?.get('token') || '';
    return Boolean(env.NAMAA_DEBUG_TOKEN && token && token === env.NAMAA_DEBUG_TOKEN);
  } catch (error) {
    return false;
  }
}

export function publicRouteStatus(route, connected, extra = {}) {
  return {
    ok: true,
    route,
    connected: Boolean(connected),
    status: connected ? 'ready' : 'configuration_needed',
    ...extra,
  };
}

export function safeApiError(message = 'Namaa route temporarily unavailable.') {
  const value = String(message || '').trim();
  if (!value) return 'Namaa route temporarily unavailable.';
  if (/api key|secret|token|GEMINI|model|generativelanguage|googleapis|stack|trace/i.test(value)) {
    return 'Namaa route temporarily unavailable. Check private Cloudflare configuration and redeploy.';
  }
  return value.slice(0, 220);
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

export function extractGeminiGrounding(data) {
  const candidate = data?.candidates?.[0] || {};
  const metadata = candidate.groundingMetadata || candidate.grounding_metadata || {};
  const chunks = metadata.groundingChunks || metadata.grounding_chunks || [];
  const supports = metadata.groundingSupports || metadata.grounding_supports || [];
  const queries = metadata.webSearchQueries || metadata.web_search_queries || [];

  const sources = chunks
    .map((chunk, index) => {
      const web = chunk.web || chunk.retrievedContext || chunk.retrieved_context || {};
      const uri = web.uri || web.url || '';
      const title = web.title || web.name || '';
      if (!uri && !title) return null;
      let domain = '';
      try { domain = uri ? new URL(uri).hostname.replace(/^www\./, '') : ''; } catch (error) { domain = ''; }
      return {
        id: `live_${index + 1}`,
        shortName: title || domain || `Live source ${index + 1}`,
        name: title || domain || `Live source ${index + 1}`,
        title: title || domain || `Live source ${index + 1}`,
        url: uri,
        uri,
        domain,
        type: 'live_google_search',
        trustLevel: domain && /\b(gov|ma|org|int|worldbank|anrt|hcp|bkam|indh|datareportal|gsma)\b/i.test(domain) ? 2 : 3,
        quality: 'Live grounded source',
        note: 'Live Google Search grounding source returned by Gemini.',
      };
    })
    .filter(Boolean)
    .filter((source, index, list) => list.findIndex((item) => (item.uri || item.title) === (source.uri || source.title)) === index)
    .slice(0, 8);

  return {
    grounded: Boolean(sources.length || queries.length || supports.length),
    sources,
    queries: Array.isArray(queries) ? queries.slice(0, 8) : [],
    supportsCount: Array.isArray(supports) ? supports.length : 0,
  };
}

export function shouldEnableGrounding(env, config) {
  const flagName = config?.enableGroundingEnv || 'NAMAA_ENABLE_LIVE_SOURCES';
  const value = env && flagName ? String(env[flagName] || '').trim().toLowerCase() : '';
  return !['0', 'false', 'off', 'no'].includes(value);
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

export async function callGemini({ env, config, systemInstruction, contents, tools, modelOverride }) {
  const apiKey = getSecret(env, config.apiKeyEnv);
  const model = modelOverride || getModel(env, config);

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
      error: 'Namaa AI model configuration is not ready.',
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

  if (Array.isArray(tools) && tools.length) {
    payload.tools = tools;
  }

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
      error: safeApiError(error?.message || 'Namaa AI request timed out.'),
      model,
      provider: 'gemini',
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: safeApiError(data?.error?.message || 'Namaa AI request failed.'),
      model,
      provider: 'gemini',
    };
  }

  return {
    ok: true,
    status: 200,
    text: extractGeminiText(data),
    grounding: extractGeminiGrounding(data),
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


function extractOpenAIImage(data) {
  const first = Array.isArray(data?.data) ? data.data[0] : null;
  const b64 = first?.b64_json || first?.b64Json || first?.image?.b64_json || first?.image?.data;
  if (!b64) return null;
  return {
    mimeType: 'image/png',
    data: b64,
  };
}

function sizeForAspectRatio(aspectRatio = '16:9') {
  const ratio = String(aspectRatio || '16:9').trim();
  const map = {
    '1:1': '1024x1024',
    '16:9': '1536x864',
    '9:16': '864x1536',
    '4:3': '1280x960',
    '3:4': '960x1280',
    '4:5': '1024x1280',
    '5:4': '1280x1024',
    '3:2': '1344x896',
    '2:3': '896x1344',
    '21:9': '1536x640',
  };
  return map[ratio] || map['16:9'];
}

async function callGeminiImageOpenAI({ apiKey, model, prompt, aspectRatio, config }) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/images/generations';
  const payload = {
    model,
    prompt,
    response_format: 'b64_json',
    n: 1,
    size: sizeForAspectRatio(aspectRatio || config.aspectRatio || '16:9'),
  };

  const { response, data } = await fetchJsonWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  }, config);

  if (!response.ok) {
    return { ok: false, status: response.status, data, error: data?.error?.message || 'OpenAI-compatible image call failed.' };
  }
  const image = extractOpenAIImage(data);
  if (!image?.data) {
    return { ok: false, status: 502, data, error: 'OpenAI-compatible image call returned no image data.' };
  }
  return { ok: true, status: 200, image, text: data?.created ? 'Nano Banana image generated.' : '' };
}

async function callGeminiImageGenerateContent({ apiKey, model, prompt, aspectRatio, config }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.7,
    },
  };

  const { response, data } = await fetchJsonWithRetry(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }, config);

  if (!response.ok) {
    return { ok: false, status: response.status, data, error: data?.error?.message || 'generateContent image call failed.' };
  }
  const image = extractGeminiImage(data);
  if (!image?.data) {
    return { ok: false, status: 502, data, error: extractGeminiText(data) || 'generateContent returned no image data.' };
  }
  return { ok: true, status: 200, image, text: extractGeminiText(data) };
}

async function callGeminiImageInteractions({ apiKey, model, prompt, aspectRatio, config }) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const responseFormat = {
    type: 'image',
    mime_type: config.imageMimeType || 'image/jpeg',
    aspect_ratio: aspectRatio || config.aspectRatio || '16:9',
    image_size: config.imageSize || '1K',
  };

  const payload = {
    model,
    input: [{ type: 'text', text: prompt }],
    response_format: responseFormat,
  };

  const { response, data } = await fetchJsonWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
      'Api-Revision': '2026-05-20',
    },
    body: JSON.stringify(payload),
  }, config);

  if (!response.ok) {
    return { ok: false, status: response.status, data, error: data?.error?.message || 'Interactions image call failed.' };
  }
  const image = extractInteractionsImage(data);
  if (!image?.data) {
    return { ok: false, status: 502, data, error: extractInteractionsText(data) || 'Interactions returned no image data.' };
  }
  return { ok: true, status: 200, image, text: extractInteractionsText(data) };
}

function uniqueImageModels(primaryModel) {
  return [
    primaryModel,
    'gemini-3.1-flash-image',
    'gemini-2.5-flash-image',
    'gemini-3-pro-image',
    'gemini-3-pro-image-preview',
  ].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index);
}

export async function callGeminiImage({ env, config, prompt, aspectRatio }) {
  const apiKey = getSecret(env, config.apiKeyEnv);
  const primaryModel = getModel(env, config);

  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: 'Namaa private AI secret is not configured.',
      model: primaryModel,
    };
  }

  if (!primaryModel) {
    return {
      ok: false,
      status: 500,
      error: 'Namaa image model configuration is not ready.',
      model: primaryModel,
    };
  }

  // Use the canonical Gemini image path first, then fall back to the other supported surfaces.
  const attempts = [
    ['generate-content', callGeminiImageGenerateContent],
    ['interactions', callGeminiImageInteractions],
    ['openai-compatible', callGeminiImageOpenAI],
  ];
  const errors = [];

  for (const model of uniqueImageModels(primaryModel)) {
    for (const [method, fn] of attempts) {
      try {
        const result = await fn({ apiKey, model, prompt, aspectRatio, config });
        if (result.ok && result.image?.data) {
          return {
            ok: true,
            status: 200,
            provider: 'gemini',
            method,
            model,
            image: result.image,
            text: result.text || '',
          };
        }
        errors.push(`${model}/${method}: ${result.status || 500}`);
      } catch (error) {
        errors.push(`${model}/${method}: ${error?.message || 'failed'}`);
      }
    }
  }

  return {
    ok: false,
    status: 200,
    error: 'Namaa image generation returned no image data. Falling back to local visual board.',
    model: primaryModel,
    provider: 'gemini',
    fallback: true,
    privateDebug: errors.slice(0, 8),
  };
}

export function safeText(value, max = 4000) {
  return String(value || '').trim().slice(0, max);
}
