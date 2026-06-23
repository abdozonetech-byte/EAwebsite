import { NAMAA_API_CONFIG, isDebugRequest, jsonResponse } from './_api-config.js';

const UPDATE = '79-security-speed-clean';

export async function onRequestGet(context) {
  const env = context.env || {};
  const debug = isDebugRequest(context);
  const publicBody = {
    ok: true,
    service: 'Namaa AI API',
    status: 'ready',
    update: UPDATE,
  };

  if (!debug) return jsonResponse(publicBody);

  return jsonResponse({
    ...publicBody,
    debug: true,
    connections: {
      talk: Boolean(env[NAMAA_API_CONFIG.talk.apiKeyEnv]),
      designImages: Boolean(env[NAMAA_API_CONFIG.images.apiKeyEnv]),
      website: Boolean(env[NAMAA_API_CONFIG.dev.apiKeyEnv]),
      crmWebhook: Boolean(env.NAMAA_PACK_CRM_WEBHOOK_URL),
      resend: Boolean(env.RESEND_API_KEY && (env.NAMAA_EMAIL_FROM || env.RESEND_FROM_EMAIL)),
    },
    note: 'Debug view shows only connection booleans. No model names, secret names, prompt libraries or private routes are exposed.',
  });
}
