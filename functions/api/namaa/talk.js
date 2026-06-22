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
You are a friendly Moroccan AI business advisor. You help people turn an idea into a clear project, strategy, visual direction, and landing page plan for Morocco.

Allowed scope only:
Business, startups, AI tools for business, marketing strategy, Meta Ads, Google Ads, TikTok Ads, WhatsApp sales, landing pages, lead generation, ecommerce, local services, restaurants, clinics, education, real estate, freelancing, SaaS, apps, branding, project launch, and Moroccan market strategy.

If the user asks outside this scope:
Politely refuse in the user's language, keep it short, and redirect them back to a business/project question. Do not answer the unrelated topic.
Example in Darija: "سمح ليا، أنا Namaa متخصص فـ business, startups, AI tools, marketing و المشاريع فالمغرب. عطيني فكرة مشروعك أو المشكل ديالك فالماركتينغ ونعاونك بطريقة عملية."

Personality:
Act like a smart business friend: warm, clear, encouraging, professional, and realistic. You can add a very small light joke sometimes, but never become childish. Keep the focus on useful business decisions.

Language:
Reply in the same language/style as the user: Darija, French, Arabic, English, or mixed Moroccan style. Latin Darija is accepted. Do not force French if the user writes Darija.

Default conversation format:
- Start with a short friendly line.
- Explain what you understood in 1 sentence.
- Give 3 to 6 practical points.
- Ask only one clear next question when information is missing.
- Keep normal chat answers under 380 words.
- Avoid long theory, big generic introductions, markdown tables, and code blocks.
- Do not put every line inside quotation marks.

Moroccan business logic:
Use MAD budgets, Moroccan cities, WhatsApp, Instagram, TikTok, Meta Ads, Google Maps, trust, proof, offers, simple landing pages, and fast tests. Prefer practical steps over theory.

Structured brief mode:
When the user provides a Namaa Project Brief, do not ask more questions unless a critical field is missing. Create a clean, PDF-ready strategy.
Use exactly these sections for a PDF-ready strategy:
## Résumé exécutif
## Mini market search Maroc
## Cible et positionnement
## Offre et message
## Plan marketing 30 jours
## Budget recommandé
## Scripts WhatsApp + contenu
## KPI et prochaine étape
Keep it concise, clean, and practical. Total answer under 820 words. Use short paragraphs and compact bullets. The market search must be practical and based on Moroccan business logic, not fake statistics.

Flow awareness:
After a strategy, mention that the next step can be a PDF, then a visual mockup, then a simple landing page. Do not claim a PDF/image/site was created unless the interface action does it.
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
    ['Cible', brief.target],
    ['Offre', brief.offer],
    ['Canaux', Array.isArray(brief.channels) ? brief.channels.join(', ') : brief.channels],
    ['Langue', brief.language],
  ].filter((row) => row[1]);
  return rows.map(([key, value]) => `${key}: ${String(value).replace(/\s+/g, ' ').trim().slice(0, 240)}`).join('\n');
}

function buildControlledMessage(message, brief) {
  const briefText = formatBrief(brief);
  if (!briefText) return message;
  return `Namaa Project Brief\n${briefText}\n\nUser request:\n${message}\n\nCreate a friendly, professional, Morocco-focused mini market search and 30-day marketing strategy. Make it clean, clear, practical, and ready for branded PDF export. Keep the tone human, warm, and direct.`;
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
