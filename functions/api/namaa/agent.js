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
- Be friendly, smart, professional, practical, warm, strategic, direct, human and Moroccan-aware when relevant.
- Use Morocco-specific examples when relevant.

Answer style:
- Start small. Give the user enough to move forward. Do not give large data before the user asks for it.
- By default, give a short useful answer first with 3 to 5 strong points maximum.
- Use simple clear formatting. Bullets or numbered lists are welcome when helpful.
- Ask one smart follow-up question or suggest one practical next action when needed.
- Give a deep analysis, roadmap, full strategy, long plan or detailed data only if the user asks for it.
- Use 1 to 3 friendly emojis maximum when they fit the tone. Good options: 👌 🚀 💡 ✅ 📌 📈 🤝
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

function buildUserPrompt(message, style, clientInstruction = '') {
  const longModeHint = /\b(deep analysis|full plan|roadmap|give me details|explain more|analyze deeply|analyse approfondie|plan complet|feuille de route|détails|شرح مفصل|خطة كاملة|roadmap|تفصيل|b tafsil|khtar lia b tafsil)\b/i.test(message)
    ? 'The user asked for depth. You may give a more detailed answer, but keep it organized.'
    : 'The user did not ask for a long plan. Keep the answer concise: short intro, 3 to 5 points maximum, then one next question/action.';
  return `
User language/style: ${style}
Required response language: ${strictLanguageInstruction(style)}
Frontend language instruction: ${safeText(clientInstruction, 240) || strictLanguageInstruction(style)}
Answer length mode: ${longModeHint}

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
      parts: [{ text: buildUserPrompt(message, style, payload.languageInstruction) }],
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
