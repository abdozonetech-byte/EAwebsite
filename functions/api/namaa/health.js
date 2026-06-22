import { NAMAA_API_CONFIG, jsonResponse } from './_api-config.js';

function isDebugRequest(context) {
  const request = context.request;
  const env = context.env || {};
  const url = new URL(request.url);
  const token = request.headers.get('x-namaa-debug-token') || url.searchParams.get('token') || '';
  return Boolean(env.NAMAA_DEBUG_TOKEN && token && token === env.NAMAA_DEBUG_TOKEN);
}

function providerStatus(env, key) {
  const config = NAMAA_API_CONFIG[key];
  return {
    connected: Boolean(env[config.apiKeyEnv]),
    provider: config.provider || 'gemini',
  };
}

export async function onRequestGet(context) {
  const env = context.env || {};
  const debug = isDebugRequest(context);

  const publicPayload = {
    ok: true,
    service: 'Namaa AI API',
    status: 'ready',
    update: '55-final-qa-security-mobile',
    agents: ['business_talk', 'strategy', 'design', 'website'],
    security: 'Public health check hides models, secret names, prompt internals and routes.',
  };

  if (!debug) return jsonResponse(publicPayload);

  return jsonResponse({
    ...publicPayload,
    public: false,
    debug: true,
    diagnosticsEndpoint: '/api/namaa/diagnostics',
    agentRouter: '/api/namaa/agent',
    providers: {
      talk: providerStatus(env, 'talk'),
      dev: providerStatus(env, 'dev'),
      images: providerStatus(env, 'images'),
    },
    debugNote: 'Use x-namaa-debug-token with NAMAA_DEBUG_TOKEN in Cloudflare for private diagnostics. Do not expose this token in frontend code.',
  });
}
