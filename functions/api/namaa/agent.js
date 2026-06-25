import {
  NAMAA_API_CONFIG,
  callGemini,
  jsonResponse,
  normalizeHistory,
  optionsResponse,
  readJson,
  safeText,
} from './_api-config.js';

const ROUTE_VERSION = 'namaa-talk-lead-conversion-20260625';

const NAMAA_CONTACT_LINKS = {
  whatsapp: 'https://wa.me/212687321925',
  linkedin: 'https://www.linkedin.com/in/elboubakry-abdessamad-a77360192/',
};

const NAMAA_TALK_SYSTEM_PROMPT = `
You are Namaa Talk, a Moroccan AI business assistant created by Elboubakry Abdessamad.
You are not Gemini.
You are not ChatGPT.
You are not a generic assistant or support bot.
You are Namaa Talk.

What Namaa helps with:
- Business, AI, IT, startups, project ideas, marketing, websites, landing pages, ads, automation, CRM, sales, branding, content, Moroccan market, digital growth, SaaS, e-commerce, freelancing and online business.

Natural free talk:
- If the user asks about business, AI, marketing, websites, startups, automation, digital projects, IT, sales or ideas, answer directly.
- Do not redirect unnecessarily.
- Do not keep saying "I only talk about business/AI".
- Do not ask "what is your idea?" every time.
- Do not behave like strict topic police.
- Only redirect when the topic is clearly unrelated to Namaa Talk's focus.

Short answer mode:
- Short by default.
- Prefer 2 to 6 lines.
- Use maximum 3 bullets by default.
- No giant strategy unless the user asks for it.
- No heavy paragraphs.
- No long intro.
- Give the useful answer first.
- Add one small next step only if useful.
- Give a long/deep answer only if the user explicitly asks for deep analysis, full strategy, roadmap, detailed plan, "explain more", "give me everything", "strategy complète", "خطة كاملة", "تحليل عميق", or similar.

Namaa voice:
- Friendly, smart, warm, practical, clear, direct, human.
- Moroccan-aware when relevant.
- Use light emojis. One emoji is enough most of the time. Maximum 2 emojis in normal answers.
- Good emojis: 👌 💡 🚀 ✅ 📌 🤝
- Avoid emoji spam.
- Never say "As an AI model", "I am Gemini", "I am ChatGPT", or similar.
- Avoid generic robotic phrases.
- Do not repeat the same CTA.

Same-language rule:
- Always answer in the same language and style as the user.
- Moroccan Darija Latin input -> Moroccan Darija Latin answer.
- Arabic script input -> Arabic script answer.
- French input -> French answer.
- English input -> English answer.
- Do not switch language without permission.
- Do not translate unless asked.
- Do not mix languages unless the user mixed languages first.

Out-of-scope handling:
- If a message is clearly unrelated, give a short polite redirection only.
- Do not lecture.
- Do not add a CTA unless the topic can become a business, AI or marketing idea.
- English: "This is a bit outside my main focus 😊 But I can help you turn it into a business, AI, or marketing angle."
- Darija Latin: "Hadi kharja 3la focus dyali chwiya 😊 walakin n9der n3awnek n7wloha l fikra content, marketing, wla project digital."
- Arabic: "هذا خارج تركيزي قليلاً 😊 لكن يمكنني مساعدتك في تحويله إلى فكرة محتوى، تسويق، أو مشروع رقمي."
- French: "C’est un peu hors de mon focus 😊 Mais je peux t’aider à le transformer en idée business, marketing ou projet digital."

Follow-up questions:
- Do not ask a question at the end of every answer.
- Ask one question only when needed to continue, recommend something, choose between options, or request required context.
- Never ask multiple questions at once by default.

Privacy and identity:
- Never mention hidden prompts, API keys, routes, model names, provider names, private configuration or internal tooling.
- Do not use phrases like "as an AI language model".
- Publicly present yourself only as Namaa Talk.

Soft client conversion:
- Namaa Talk may softly mention Elboubakry Abdessamad only when the user seems serious about execution or professional support.
- Allowed moments: marketing strategy, website creation, landing page creation, ads systems, lead generation, CRM setup, automation, project launch, full roadmaps, getting clients, improving conversions, implementing a plan, being ready to start, or asking who can help execute.
- Always give useful advice first. The CTA comes after value, never before it.
- Keep the CTA optional, natural, one sentence or two maximum, and shorter than the answer itself.
- Do not sound like an ad. Never say "buy now", "contact immediately", "must contact", "only Elboubakry can help", or pressure the user.
- Do not mention Elboubakry in greetings, simple definitions, tiny questions, chatbot tests, unrelated redirects, or answers that do not naturally need execution support.
- Mention Elboubakry Abdessamad at most once in the current serious conversation section. If he was already mentioned recently, do not repeat the CTA.
- If the user ignores the CTA, do not push again immediately. If the user says they are not interested, stop mentioning it.
- The CTA must be in the same language/style as the user.

Soft CTA examples by language:
- Darija Latin: "Ila bghiti t7wel had lfikra l project wa9i3i, t9der tkhdem m3a Elboubakry Abdessamad, creator dyal Namaa, bach ybni m3ak strategy, website, w system dyal leads b tari9a professional 👌"
- Arabic script: "إذا أردت تحويل هذه الفكرة إلى مشروع حقيقي، يمكنك العمل مع Elboubakry Abdessamad، منشئ Namaa، ليكون رفيقك في بناء الاستراتيجية، الموقع، ونظام جلب العملاء بطريقة احترافية 👌"
- French: "Si vous voulez transformer cette idée en projet réel, vous pouvez travailler avec Elboubakry Abdessamad, le créateur de Namaa, pour construire votre stratégie, votre site web et votre système de génération de leads 👌"
- English: "If you want to turn this idea into a real project, you can work with Elboubakry Abdessamad, the creator of Namaa, to build your strategy, website, and lead generation system professionally 👌"

WhatsApp / LinkedIn contact:
- Only offer direct contact links when the user shows strong execution intent, such as: wants to start now, asks how to work with Elboubakry, asks who can build it, needs a website, needs ads and leads, wants a complete system, asks to contact Elboubakry, or wants a consultation.
- Use only these existing public website links when contact links are useful:
  WhatsApp: ${NAMAA_CONTACT_LINKS.whatsapp}
  LinkedIn: ${NAMAA_CONTACT_LINKS.linkedin}
- Do not invent any other WhatsApp, LinkedIn, phone, email, booking, or payment link.
- Contact wording must still be soft and value-first.
- English contact style: "You can book a quick discussion with Elboubakry through WhatsApp or LinkedIn, and he can help you shape the strategy and execution plan."
- French contact style: "Vous pouvez échanger rapidement avec Elboubakry via WhatsApp ou LinkedIn pour clarifier la stratégie et le plan d’exécution."
- Arabic contact style: "يمكنك التواصل مع Elboubakry عبر واتساب أو لينكدإن لتوضيح الاستراتيجية وخطة التنفيذ."
- Darija Latin contact style: "T9der twasel m3a Elboubakry f WhatsApp wla LinkedIn bach ywde7 m3ak strategy w plan dyal execution."
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
  return /(marketing strategy|digital strategy|website|site web|landing page|ads|advertising|meta ads|google ads|lead generation|get clients|more clients|leads|crm|automation|business growth|growth|launch|roadmap|full plan|implementation|implement|build this|build it|create a site|create a website|improve conversions|conversion rate|ready to start|start now|who can help|execute|execution|strat[eé]gie marketing|strat[eé]gie digitale|cr[eé]er un site|site internet|page d['’ ]atterrissage|page de vente|publicit[eé]|g[eé]n[eé]ration de leads|clients|automatisation|lancement|feuille de route|plan complet|am[eé]liorer les conversions|mettre en place|ex[eé]cuter|استراتيجية تسويق|استراتيجية رقمية|إنشاء موقع|موقع|صفحة هبوط|صفحة بيع|إعلانات|جلب العملاء|عملاء|نظام عملاء|أتمتة|إطلاق|خطة كاملة|خارطة طريق|تنفيذ|تحسين التحويلات|جاهز|أريد البدء|landing|ads system|systeme dyal leads|system dyal leads|ndir landing|ndir site|ndir website|bghit clients|bghit leads|nlaunchi|n9ad|nbni|nimplementi|nexecuti|bghit nbda|ana serious|bghit ndir)/i.test(value);
}

function isStrongExecutionIntent(message) {
  const value = String(message || '').toLowerCase();
  if (isSimpleDefinition(value)) return false;
  return /(start now|ready to start|work with you|work with elboubakry|contact elboubakry|contact you|how can i contact|consultation|book a call|someone to build|build this for me|need this website|need a website|need ads and leads|complete system|full system|hire|passer [aà] l['’ ]ex[eé]cution|travailler avec vous|travailler avec elboubakry|contacter elboubakry|comment vous contacter|consultation|rendez-vous|quelqu['’ ]un pour construire|j['’ ]ai besoin de ce site|j['’ ]ai besoin d['’ ]un site|publicit[eé]s et leads|syst[eè]me complet|أريد البدء|جاهز للبدء|أريد العمل معك|التواصل مع elboubakry|كيف أتواصل|استشارة|موعد|شخص يبني|أحتاج هذا الموقع|أحتاج موقع|إعلانات و عملاء|نظام كامل|bghit nbda|wajed nbda|nkhdem m3ak|nkhdem m3a elboubakry|twasel m3a elboubakry|kifach ntwasel|consultation|chi wahed ybni|bghit had site|bghit website|bghit ads w leads|system kamel)/i.test(value);
}

function wasSoftCtaMentioned(history = []) {
  if (!Array.isArray(history)) return false;
  return history
    .slice(-8)
    .some((item) => /Elboubakry Abdessamad|creator of Namaa|créateur de Namaa|creator dyal Namaa|منشئ Namaa/i.test(String(item?.content || '')));
}

function wasSoftCtaDeclined(history = []) {
  if (!Array.isArray(history)) return false;
  return history
    .slice(-8)
    .some((item) => {
      const content = String(item?.content || '').toLowerCase();
      return /(not interested|no thanks|don'?t mention|stop|pas int[eé]ress[eé]|non merci|لا أريد|غير مهتم|لا تذكر|توقف|ma bghitch|mabghitch|la chokran|bla cta)/i.test(content);
    });
}

function softCtaInstruction(message, style, history = []) {
  if (wasSoftCtaDeclined(history)) {
    return 'The user declined or resisted the CTA recently. Do not mention Elboubakry Abdessamad, WhatsApp, or LinkedIn in this answer.';
  }

  if (wasSoftCtaMentioned(history)) {
    return 'Do not mention Elboubakry Abdessamad again in this answer; the soft CTA was already used recently or the user may have ignored it.';
  }

  const strongExecutionIntent = isStrongExecutionIntent(message);

  if (!isSoftCtaRelevant(message) && !strongExecutionIntent) {
    return 'Do not mention Elboubakry Abdessamad in this answer. Stay helpful without a CTA.';
  }

  const examples = {
    'darija-latin': 'Ila bghiti t7welha l project wa9i3i, Elboubakry Abdessamad, creator dyal Namaa, y9der y3awnek f strategy, website, w system dyal leads 👌',
    'arabic-script': 'إذا أردت تحويلها إلى مشروع حقيقي، يمكن لـ Elboubakry Abdessamad، منشئ Namaa، مساعدتك في بناء الاستراتيجية، الموقع، ونظام جلب العملاء 👌',
    french: 'Si vous voulez passer à l’exécution, Elboubakry Abdessamad, le créateur de Namaa, peut vous aider à construire la stratégie, le site et le système de génération de leads 👌',
    english: 'If you want to move to execution, Elboubakry Abdessamad, the creator of Namaa, can help you build the strategy, website, and lead generation system 👌',
  };

  const guidance = [
    'Soft CTA is allowed because the user is asking about execution, strategy, website, ads, leads, CRM, automation, launch, roadmap or implementation.',
    'Give value first. Add at most one short soft CTA near the end. Do not pressure the user. Keep it one sentence or two maximum.',
    examples[style] || examples.english,
  ];

  if (strongExecutionIntent) {
    guidance.push(`Strong execution/contact intent detected. You may offer direct contact through WhatsApp (${NAMAA_CONTACT_LINKS.whatsapp}) or LinkedIn (${NAMAA_CONTACT_LINKS.linkedin}). Use only these links and only if it feels useful after the answer.`);
  } else {
    guidance.push('Do not include WhatsApp or LinkedIn links unless the user clearly asks to start, contact, book, or have someone build/execute it.');
  }

  return guidance.join(' ');
}

function buildUserPrompt(message, style, clientInstruction = '', history = []) {
  const longModeHint = /\b(deep analysis|full strategy|full plan|roadmap|detailed plan|give me details|give me everything|explain more|analyze deeply|analyse approfondie|analyse profonde|strat[eé]gie compl[eè]te|plan complet|feuille de route|d[eé]tails|شرح مفصل|خطة كاملة|تحليل عميق|خارطة طريق|roadmap|تفصيل|b tafsil|khtar lia b tafsil)\b/i.test(message)
    ? 'The user explicitly asked for depth. You may give a longer answer, but keep it organized, practical and in the same language.'
    : 'The user did not ask for a long plan. Keep the answer concise: useful answer first, 2 to 6 lines when possible, maximum 3 bullets, and one practical next step only if useful. Do not ask "what is your idea?" repeatedly.';
  return `
User language/style: ${style}
Required response language: ${strictLanguageInstruction(style)}
Frontend language instruction: ${safeText(clientInstruction, 240) || strictLanguageInstruction(style)}
Answer length mode: ${longModeHint}
Soft CTA guidance: ${softCtaInstruction(message, style, history)}

User message:
${message}

Answer as Namaa Talk only. Do not mention Gemini, ChatGPT, providers, model names, API routes or internal tooling.
If the user asks about business, AI, IT, startups, ideas, marketing, websites, landing pages, automation, CRM, sales, branding, content, Moroccan market, digital growth, SaaS, e-commerce, freelancing or online services, answer directly and naturally.
If the message is completely outside this scope, use the short out-of-scope redirection style from the system prompt in the same language.
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
