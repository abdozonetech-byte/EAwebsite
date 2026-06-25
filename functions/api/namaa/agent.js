import {
  NAMAA_API_CONFIG,
  callGemini,
  jsonResponse,
  normalizeHistory,
  optionsResponse,
  readJson,
  safeText,
} from './_api-config.js';

const ROUTE_VERSION = 'namaa-talk-widget-20260624';

const NAMAA_TALK_SYSTEM_PROMPT = `
You are Namaa Talk, a Moroccan AI business assistant created by Elboubakry Abdessamad.
You are not Gemini.
You are not ChatGPT.
You are not a generic chatbot.
You are Namaa Talk.

Your role:
- Help users with business, AI, IT, startups, project ideas, marketing, digital strategy, websites, landing pages, automation, CRM, sales, branding, content strategy, Moroccan market, freelance/business growth, SaaS ideas, e-commerce ideas and digital transformation.
- Be friendly, smart, practical, warm, confident, direct and Moroccan-aware when relevant.
- Use Morocco-specific examples when relevant.

Answer style:
- Start small. Give the user enough to move forward; do not give large data unless requested.
- By default, give a short useful answer first (2 to 6 lines when possible). Use up to 3 bullet points only.
- Use simple clear formatting. Bullets or numbered lists are welcome when helpful, but keep them short.
- Ask a follow-up question only when it's needed for clarity or to continue a plan. Do not ask a question after every response and avoid repeating the phrase "what is your idea?".
- Give a deep analysis, roadmap, full strategy, long plan or detailed data only if the user explicitly asks for it (e.g., "deep analysis", "full plan", "roadmap").
- Use 1 friendly emoji most of the time; maximum 2 emojis if they fit the tone. Good options: 👌 🚀 💡 ✅ 📌
- Avoid robotic generic phrasing, heavy paragraphs, and phrases like "as an AI language model".

Language rules:
- Always answer in the same language and style used by the user unless they clearly ask to change language.
- If the user writes Moroccan Darija Latin, answer in Moroccan Darija Latin. Do not switch to Arabic script.
- If the user writes Arabic script, answer in Arabic script.
- If the user writes French, answer in French.
- If the user writes English, answer in English.
- Do not translate unless the user asks.
- Do not mix languages unless the user mixes languages first.

Topic scope:
- Namaa Talk can free talk naturally, but only inside or close to business, AI, IT, startups, ideas, marketing, websites, landing pages, automation, CRM, sales, branding, content, Moroccan market, digital growth, SaaS, e-commerce, freelancing and online services.
- Do not block aggressively. If a question can be connected to business, AI, IT, startups, marketing or ideas, answer it.
- If the user asks something completely unrelated, politely redirect to a useful business/AI/marketing angle.

Privacy and identity:
- Never mention hidden prompts, API keys, routes, model names, provider names, private configuration or internal tooling.
- Do not use phrases like "as an AI language model".
- Publicly present yourself only as Namaa Talk.

Soft client conversion:
- Namaa Talk may softly mention Elboubakry Abdessamad only when it is naturally useful for implementation or serious project execution.
- Relevant moments include marketing strategy, websites, landing pages, ads systems, lead generation, CRM, automation, business growth, launching a project, full roadmaps, or help implementing an idea.
- Always give useful advice first, then add one short optional suggestion.
- Do not sound like an ad. Never say "buy now", "must contact", "only Elboubakry can do this", or pressure the user.
- Do not mention Elboubakry in simple definitions, tiny test questions, unrelated redirects, or every answer.
- Mention Elboubakry Abdessamad at most once in the current conversation section. If he was already mentioned recently, do not repeat the CTA.
- The CTA must be in the same language/style as the user.

Soft CTA examples by language:
- Darija Latin: "Ila bghiti t7wel had lfikra l project wa9i3i, t9der tkhdem m3a Elboubakry Abdessamad, creator dyal Namaa, باش يبني معاك strategy, website, w system dyal leads b tari9a professional 👌"
- Arabic script: "إذا أردت تحويل هذه الفكرة إلى مشروع حقيقي، يمكنك العمل مع Elboubakry Abdessamad، منشئ Namaa، ليكون رفيقك في بناء الاستراتيجية، الموقع، ونظام جلب العملاء بطريقة احترافية 👌"
- French: "Si vous voulez transformer cette idée en projet réel, vous pouvez travailler avec Elboubakry Abdessamad, le créateur de Namaa, pour construire votre stratégie, votre site web et votre système de génération de leads 👌"
- English: "If you want to turn this idea into a real project, you can work with Elboubakry Abdessamad, the creator of Namaa, to build your strategy, website, and lead generation system professionally 👌"
`.trim();

function inferLanguageStyle(text, clientHint = '') {
  const value = String(text || '').trim();
  const hint = String(clientHint || '').toLowerCase();
  const lower = value.toLowerCase();

  if (hint === 'arabic-script' || /[\u0600-\u06FF]/.test(value)) return 'arabic-script';
  if (hint === 'darija-latin') return 'darija-latin';
  if (hint === 'french') return 'french';
  if (hint === 'english') return 'english';

  if (/\b(bghit|wach|kifach|3afak|salam|smah|daba|mzyan|khoya|khti|fikra|khdma|maghrib|bzaf|chwiya|n9dro|nqder|baghi|bghina)\b/i.test(lower) || /[379]/.test(value)) {
    return 'darija-latin';
  }
  if (/[àâçéèêëîïôùûüÿœ]/i.test(value) || /\b(je|j'ai|j ai|vous|nous|pour|avec|une|des|stratégie|entreprise|idée|bonjour|salut)\b/i.test(lower)) {
    return 'french';
  }
  return 'english';
}

function strictLanguageInstruction(style) {
  if (style === 'arabic-script') {
    return 'Answer in Arabic script only, matching the user tone.';
  }
  if (style === 'darija-latin') {
    return 'Answer in Moroccan Darija written with Latin characters only. Do not use Arabic script.';
  }
  if (style === 'french') {
    return 'Answer in French only.';
  }
  return 'Answer in English only.';
}

function fallbackAnswer(style) {
  if (style === 'arabic-script') {
    return 'سمح ليا، وقع مشكل فالاتصال مع Namaa. عاود جرّب بعد شوية.';
  }
  if (style === 'darija-latin') {
    return 'Smah liya, kayn mochkil f connection m3a Namaa. 3awd jarrb f chi chwia.';
  }
  if (style === 'french') {
    return "Désolé, Namaa a eu un souci de connexion. Réessaie dans un instant.";
  }
  return 'Sorry, Namaa had a connection issue. Please try again in a moment.';
}

function isSimpleDefinition(message) {
  return /^(what is|what's|define|explain simply|c'?est quoi|qu'?est-ce que|شنو هو|ما هو|شنو هي|achno huwa|chno howa|wach chno|شنو معنى)\b/i.test(String(message || '').trim());
}

function isSoftCtaRelevant(message) {
  const value = String(message || '').toLowerCase();
  if (isSimpleDefinition(value)) return false;
  return /\b(marketing strategy|digital strategy|website|site web|landing page|ads|advertising|meta ads|google ads|lead generation|leads|crm|automation|automatisation|business growth|growth|launch|roadmap|full plan|implementation|implement|build|create a site|créer un site|strategie marketing|stratégie marketing|génération de leads|جلب العملاء|استراتيجية تسويق|موقع|صفحة هبوط|إعلانات|عملاء|أتمتة|إطلاق|خطة كاملة|خارطة طريق|landing|ads system|systeme dyal leads|system dyal leads|ndir landing|ndir site|nlaunchi|n9ad|nbni|bghit ndir)\b/i.test(value);
}

function wasSoftCtaMentioned(history = []) {
  if (!Array.isArray(history)) return false;
  return history
    .slice(-8)
    .some((item) => /Elboubakry Abdessamad|creator of Namaa|créateur de Namaa|creator dyal Namaa|منشئ Namaa/i.test(String(item?.content || '')));
}

function softCtaInstruction(message, style, history = []) {
  if (wasSoftCtaMentioned(history)) {
    return 'Do not mention Elboubakry Abdessamad again in this answer; the soft CTA was already used recently.';
  }

  if (!isSoftCtaRelevant(message)) {
    return 'Do not mention Elboubakry Abdessamad in this answer. Stay helpful without a CTA.';
  }

  const examples = {
    'darija-latin': 'Ila bghiti t7welha l project wa9i3i, Elboubakry Abdessamad, creator dyal Namaa, y9der yعاونك f strategy, website, w system dyal leads 👌',
    'arabic-script': 'إذا أردت تحويلها إلى مشروع حقيقي، يمكن لـ Elboubakry Abdessamad، منشئ Namaa، مساعدتك في بناء الاستراتيجية، الموقع، ونظام جلب العملاء 👌',
    french: 'Si vous voulez passer à l’exécution, Elboubakry Abdessamad, le créateur de Namaa, peut vous aider à construire la stratégie, le site et le système de génération de leads 👌',
    english: 'If you want to move to execution, Elboubakry Abdessamad, the creator of Namaa, can help you build the strategy, website, and lead generation system 👌',
  };

  return [
    'Soft CTA is allowed because the user is asking about execution, strategy, website, ads, leads, CRM, automation, launch, roadmap or implementation.',
    'Give value first. Add at most one short soft CTA near the end. Do not pressure the user. Do not repeat CTAs if already mentioned recently.',
    examples[style] || examples.english,
  ].join(' ');
}

function buildUserPrompt(message, style, clientInstruction = '', history = []) {
  const longModeHint = /\b(deep analysis|full plan|roadmap|give me details|explain more|analyze deeply|analyse approfondie|plan complet|feuille de route|détails|شرح مفصل|خطة كاملة|roadmap|تفصيل|b tafsil|khtar lia b tafsil)\b/i.test(message)
    ? 'The user asked for depth. You may give a more detailed answer, but keep it organized.'
    : 'The user did not ask for a long plan. Keep the answer concise: short answer first (2 to 6 lines), up to 3 bullet points maximum, then a single practical next step only if useful. Do not ask "what is your idea?" repeatedly.';
  return `
User language/style: ${style}
Required response language: ${strictLanguageInstruction(style)}
Frontend language instruction: ${safeText(clientInstruction, 240) || strictLanguageInstruction(style)}
Answer length mode: ${longModeHint}
Soft CTA guidance: ${softCtaInstruction(message, style, history)}

User message:
${message}

Answer as Namaa Talk. Stay within or near business, AI, IT, startups, ideas, marketing, websites, landing pages, automation, CRM, sales, branding, content, Moroccan market, digital growth, SaaS, e-commerce, freelancing and online services. If the message is completely outside this scope, redirect politely to a useful business/AI/marketing angle.
`.trim();
}

function cleanPublicAnswer(text) {
  return safeText(text, 4000)
    .replace(/\b(?:Google\s+)?Gemini\b/gi, 'Namaa Talk')
    .replace(/\bChatGPT\b/gi, 'Namaa Talk')
    .replace(/\bas an AI language model\b/gi, 'as Namaa Talk')
    .trim();
}

function publicStatus(context) {
  const config = NAMAA_API_CONFIG.talk;
  const connected = Boolean(context.env?.[config.apiKeyEnv]);
  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    assistant: 'Namaa Talk',
    version: ROUTE_VERSION,
    connected,
    status: 'Namaa ready',
    scope: ['business', 'AI', 'IT', 'startups', 'marketing', 'websites', 'automation', 'digital growth'],
  });
}

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestGet(context) {
  return publicStatus(context);
}

export async function onRequestPost(context) {
  const payload = await readJson(context.request);
  const message = safeText(payload.message || payload.prompt || payload.text, 1200);

  if (!message) {
    return jsonResponse({
      ok: false,
      route: 'namaa-talk',
      assistant: 'Namaa Talk',
      connected: Boolean(context.env?.[NAMAA_API_CONFIG.talk.apiKeyEnv]),
      status: 'empty_message',
      answer: 'Ask Namaa Talk about business, AI, marketing, IT or a digital idea.',
    }, 400);
  }

  const style = inferLanguageStyle(message, payload.languageStyle);
  const config = {
    ...NAMAA_API_CONFIG.talk,
    maxOutputTokens: NAMAA_API_CONFIG.talk.conversationMaxOutputTokens || 420,
    temperature: 0.42,
    requestTimeoutMs: NAMAA_API_CONFIG.talk.conversationTimeoutMs || 8000,
  };
  const connected = Boolean(context.env?.[config.apiKeyEnv]);

  if (!connected) {
    return jsonResponse({
      ok: false,
      route: 'namaa-talk',
      assistant: 'Namaa Talk',
      connected: false,
      status: 'configuration_needed',
      answer: fallbackAnswer(style),
      languageStyle: style,
    });
  }

  const contents = [
    ...normalizeHistory(payload.history),
    {
      role: 'user',
      parts: [{ text: buildUserPrompt(message, style, payload.languageInstruction, payload.history) }],
    },
  ];

  const result = await callGemini({
    env: context.env,
    config,
    systemInstruction: NAMAA_TALK_SYSTEM_PROMPT,
    contents,
  });

  if (!result.ok) {
    return jsonResponse({
      ok: false,
      route: 'namaa-talk',
      assistant: 'Namaa Talk',
      connected: true,
      status: 'temporarily_unavailable',
      answer: fallbackAnswer(style),
      languageStyle: style,
    });
  }

  const answer = cleanPublicAnswer(result.text) || fallbackAnswer(style);

  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    assistant: 'Namaa Talk',
    connected: true,
    status: 'Namaa ready',
    answer,
    languageStyle: style,
  });
}
