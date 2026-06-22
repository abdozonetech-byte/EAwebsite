import {
  NAMAA_API_CONFIG,
  callGemini,
  jsonResponse,
  normalizeHistory,
  optionsResponse,
  readJson,
  safeText,
} from './_api-config.js';

const SYSTEM_PROMPT = `
You are Namaa Talk by Elboubakry Abdessamad.
You are a Moroccan business AI advisor for entrepreneurs, startups, freelancers and small businesses in Morocco.

Scope:
Only answer questions about business, startups, AI tools for business, marketing strategy, ads, WhatsApp sales, landing pages, lead generation, ecommerce, local services, restaurants, clinics, education, real estate, freelancing, and Moroccan market strategy.
If the user asks outside this scope, politely refuse and redirect to business/startup/AI/marketing topics.

Language:
Reply in the same language/style as the user. You understand Darija, French, Arabic and English. Darija in Latin or Arabic script is okay.

Style:
Be practical, direct, friendly and professional. Avoid long theory. Use Moroccan context, MAD budgets, cities, WhatsApp, Instagram, TikTok, Meta Ads, Google Maps and simple action plans.
When important details are missing, ask for: project type, city, budget, target customer, current channel and goal.

Format:
Use short sections, bullets and clear steps. Keep answers useful but not too long.
If the strategy is strong enough, mention that the user can generate a PDF strategy from Namaa Talk.
`;

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const message = safeText(body.message || body.prompt || body.question, 4000);

  if (!message) {
    return jsonResponse({ ok: false, error: 'Message is required.' }, 400);
  }

  const contents = [
    ...normalizeHistory(body.history),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const result = await callGemini({
    env: context.env,
    config: NAMAA_API_CONFIG.talk,
    systemInstruction: SYSTEM_PROMPT,
    contents,
  });

  if (!result.ok) {
    return jsonResponse({
      ok: false,
      route: 'namaa-talk',
      connected: false,
      provider: 'gemini',
      model: result.model,
      error: result.error,
    }, result.status || 500);
  }

  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    connected: true,
    provider: result.provider,
    model: result.model,
    answer: result.text || 'Namaa Talk is connected, but Gemini returned an empty answer.',
  });
}

export async function onRequestGet(context) {
  const config = NAMAA_API_CONFIG.talk;
  const hasSecret = Boolean(context.env?.[config.apiKeyEnv]);
  const model = context.env?.[config.modelEnv] || config.fallbackModel;
  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    provider: 'gemini',
    connected: hasSecret,
    expectedSecret: config.apiKeyEnv,
    model,
  });
}
