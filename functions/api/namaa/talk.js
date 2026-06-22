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

Controlled strategy mode:
When the user provides a structured Namaa Project Brief, do not ask more questions unless a critical field is missing. Produce a clean strategy that can be exported to PDF.
Do not write code blocks. Do not use quotation marks around every line. Do not use markdown tables. Do not make the answer messy.

Format for structured brief:
## Résumé du projet
## Diagnostic marché Maroc
## Offre et cible
## Plan marketing 30 jours
## Budget recommandé
## Script WhatsApp
## Prochaine étape
Each section should be concise with practical bullets. Keep total answer under 900 words.
`;

function formatBrief(brief = {}) {
  if (!brief || typeof brief !== 'object') return '';
  const rows = [
    ['Nom', brief.projectName],
    ['Étape', brief.stage],
    ['Type', brief.category],
    ['Branche', brief.branch],
    ['Marché', brief.market],
    ['Budget', brief.budget],
    ['Objectif', brief.goal],
    ['Canaux', Array.isArray(brief.channels) ? brief.channels.join(', ') : brief.channels],
  ].filter((row) => row[1]);
  return rows.map(([key, value]) => `${key}: ${String(value).slice(0, 500)}`).join('\n');
}

function buildControlledMessage(message, brief) {
  const briefText = formatBrief(brief);
  if (!briefText) return message;
  return `Namaa Project Brief\n${briefText}\n\nUser request:\n${message}\n\nCreate a professional Morocco-focused market diagnosis and 30-day marketing strategy. The output must be clean, clear and ready for PDF export.`;
}

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const message = safeText(body.message || body.prompt || body.question, 4000);
  const brief = body.brief && typeof body.brief === 'object' ? body.brief : null;
  const controlledMessage = safeText(buildControlledMessage(message, brief), 5000);

  if (!message) {
    return jsonResponse({ ok: false, error: 'Message is required.' }, 400);
  }

  const contents = [
    ...(brief ? [] : normalizeHistory(body.history)),
    {
      role: 'user',
      parts: [{ text: controlledMessage }],
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
