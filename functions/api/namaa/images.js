import {
  NAMAA_API_CONFIG,
  callGeminiImage,
  getModel,
  getSecret,
  jsonResponse,
  optionsResponse,
  readJson,
  safeText,
} from './_api-config.js';

const ALLOWED_SCOPE = [
  'business', 'startup', 'marketing', 'landing page', 'website', 'ads', 'restaurant', 'clinic',
  'ecommerce', 'e-commerce', 'service', 'brand', 'product', 'whatsapp', 'leads', 'morocco',
  'maroc', 'casablanca', 'rabat', 'marrakech', 'agadir', 'tanger', 'fes', 'kenitra', 'startup maroc',
  'projet', 'business maroc', 'mockup', 'visual', 'design', 'hero section', 'poster', 'social media'
];

function formatBrief(brief = {}) {
  if (!brief || typeof brief !== 'object') return '';
  const rows = [
    ['Nom', brief.projectName], ['Étape', brief.stage], ['Type', brief.category], ['Branche', brief.branch],
    ['Marché', brief.market], ['Budget', brief.budget], ['Objectif', brief.goal],
    ['Canaux', Array.isArray(brief.channels) ? brief.channels.join(', ') : brief.channels],
  ].filter((row) => row[1]);
  return rows.map(([key, value]) => `${key}: ${String(value).slice(0, 300)}`).join('\n');
}

function seemsInScope(prompt) {
  const value = String(prompt || '').toLowerCase();
  if (!value) return false;
  return ALLOWED_SCOPE.some((term) => value.includes(term)) || value.length <= 280;
}

function normalizeAspectRatio(value) {
  const ratio = String(value || '').trim();
  const allowed = new Set(['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4', '21:9']);
  return allowed.has(ratio) ? ratio : '16:9';
}

function buildImagePrompt(userPrompt, aspectRatio, brief) {
  return `
Create a professional mockup image for a Moroccan business/startup project.

User request:
${userPrompt}

Structured project brief, if available:
${formatBrief(brief) || "No structured brief"}

Design goal:
- Create only a clean visual mockup/concept, not a finished client deliverable.
- Style: premium SaaS/agency quality, modern Moroccan business market, clean blue/white visual system.
- Use professional UI/UX composition, strong hierarchy, realistic landing page or ad mockup feel.
- Keep it business-safe: no political content, no adult content, no weapons, no drugs, no gambling.
- Avoid tiny unreadable text. If text appears, keep it minimal and simple.
- Prefer a high-converting landing page / marketing mockup composition with hero area, CTA space, visual cards, and trust indicators.
- Aspect ratio: ${aspectRatio}.
`.trim();
}

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const config = NAMAA_API_CONFIG.images;
  const prompt = safeText(body.prompt || body.message || body.question, 2500);
  const brief = body.brief && typeof body.brief === 'object' ? body.brief : null;
  const aspectRatio = normalizeAspectRatio(body.aspectRatio || body.ratio || config.aspectRatio);

  if (!prompt) {
    return jsonResponse({ ok: false, error: 'Prompt is required.' }, 400);
  }

  if (!seemsInScope(prompt)) {
    return jsonResponse({
      ok: false,
      route: 'namaa-images',
      error: 'Namaa Images is limited to business, startup, marketing, landing page and Moroccan project mockups.',
    }, 400);
  }

  const imagePrompt = buildImagePrompt(prompt, aspectRatio, brief);
  const result = await callGeminiImage({
    env: context.env,
    config,
    prompt: imagePrompt,
    aspectRatio,
  });

  if (!result.ok) {
    return jsonResponse({
      ok: false,
      route: 'namaa-images',
      connected: false,
      provider: 'gemini',
      model: result.model,
      error: result.error,
      fallback: 'local-mockup-panel',
    }, result.status || 500);
  }

  return jsonResponse({
    ok: true,
    route: 'namaa-images',
    connected: true,
    provider: result.provider,
    model: result.model,
    purpose: config.purpose,
    aspectRatio,
    answer: result.text || 'Namaa Images generated a business mockup concept.',
    image: {
      mimeType: result.image.mimeType,
      data: result.image.data,
      dataUrl: `data:${result.image.mimeType};base64,${result.image.data}`,
    },
  });
}

export async function onRequestGet(context) {
  const config = NAMAA_API_CONFIG.images;
  const hasSecret = Boolean(getSecret(context.env, config.apiKeyEnv));
  const model = getModel(context.env, config);
  return jsonResponse({
    ok: true,
    route: 'namaa-images',
    provider: 'gemini',
    connected: hasSecret,
    expectedSecret: config.apiKeyEnv,
    model,
    purpose: config.purpose,
    aspectRatio: config.aspectRatio,
    status: hasSecret ? 'ready' : 'missing-gemini-secret',
  });
}
