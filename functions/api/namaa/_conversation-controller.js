// Namaa Conversation Controller
// Update 29: Natural Conversation Intelligence + Darija Smart Router.
// Goal: Namaa feels like a friendly Moroccan business advisor, not a long generic chatbot.

import {
  inferSmartBriefPatch,
  mergeSmartBrief,
  getSmartBriefStatus,
  smartBriefAnswer,
} from './_smart-brief-builder.js';

export const NAMAA_SCOPE = [
  'business', 'startup', 'startups', 'project', 'projet', 'مشروع', 'مشاريع', 'بيزنس', 'تجارة', 'commerce',
  'marketing', 'ماركتينغ', 'تسويق', 'ads', 'publicite', 'publicité', 'meta', 'facebook', 'instagram', 'tiktok', 'google',
  'ai', 'ia', 'ذكاء', 'intelligence artificielle', 'artificial intelligence', 'ecommerce', 'e-commerce', 'saas', 'app', 'application',
  'landing', 'website', 'site', 'web', 'whatsapp', 'lead', 'leads', 'client', 'clients', 'sales', 'vente', 'sell', 'بيع',
  'restaurant', 'clinic', 'clinique', 'medical', 'formation', 'real estate', 'immobilier', 'agency', 'agence',
  'technology', 'technologie', 'tech', 'it', 'software', 'logiciel', 'automation', 'automatisation', 'digital', 'branding', 'brand',
  'فكرة', 'افكار', 'فلوس', 'ربح', 'متجر', 'موقع', 'تطبيق', 'زبناء', 'عملاء', 'إعلان', 'اعلان',
];

const CITIES = ['casablanca','casa','rabat','marrakech','tanger','agadir','fes','fès','meknes','meknès','kenitra','kénitra','oujda','taroudant','maroc','morocco'];
const CATEGORIES = [
  { value: 'E-commerce / vente de produits', words: ['ecommerce','e-commerce','commerce','produit','product','sell','vente','بيع','cosmetic','fashion','shop'] },
  { value: 'Restaurant / food', words: ['restaurant','food','café','cafe','coffee','patisserie','fast food','dark kitchen','اكل','مطعم'] },
  { value: 'Clinique / médical', words: ['clinic','clinique','medical','médical','dentiste','doctor','derma','esthetic','esthétique','عيادة','طبيب'] },
  { value: 'SaaS / application', words: ['saas','application','app','software','logiciel','platform','plateforme','dashboard','mobile app'] },
  { value: 'Agence / service pro', words: ['agency','agence','service pro','consulting','marketing agency','studio','freelance'] },
  { value: 'Service local', words: ['cleaning','nettoyage','déménagement','service local','repair','coaching','livraison'] },
  { value: 'Formation / cours', words: ['formation','cours','school','école','education','edtech','learn','training'] },
  { value: 'Immobilier', words: ['real estate','immobilier','airbnb','location','appartement','property'] },
  { value: 'AI business / automation', words: ['ai business','ia business','automation','automatisation','agent ai','chatbot','bot'] },
];

export const REQUIRED_BRIEF_FIELDS = [
  { key: 'projectName', label: 'nom du projet' },
  { key: 'category', label: 'type de projet' },
  { key: 'offer', label: 'produit ou offre' },
  { key: 'market', label: 'ville ou marché' },
  { key: 'budget', label: 'budget' },
  { key: 'target', label: 'client cible' },
  { key: 'goal', label: 'objectif principal' },
];

function normalize(text = '') {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^\p{L}\p{N}\s?!.:-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(text, words) {
  const n = normalize(text);
  return words.some((word) => n.includes(normalize(word)));
}

function isVeryShort(message = '') {
  return normalize(message).split(/\s+/).filter(Boolean).length <= 5 && normalize(message).length <= 70;
}

function detectExplicitLanguage(message = '') {
  const n = normalize(message);
  if (/(darija|dariija|derija|ddarija|maghribi|moroccan arabic|بدارجة|بالدارجة|داريجة|دارجة)/.test(n)) return 'Darija simple';
  if (/(arabic|arabe|العربية|بالعربية|عربي)/.test(n)) return 'العربية / Darija';
  if (/(english|anglais|in english|بالانجليزية|بالإنجليزية|englizi)/.test(n)) return 'English';
  if (/(francais|français|french|en francais|en français|بالفرنسية)/.test(n)) return 'Français professionnel';
  if (/(francais darija|français darija|mix|fr darija)/.test(n)) return 'Français + Darija';
  return '';
}

function detectLanguage(message, brief) {
  const explicit = detectExplicitLanguage(message);
  if (explicit) return explicit;
  const text = String(message || '');
  if (brief?.language) return brief.language;
  if (/\b(salam|salaam|labas|labass|kifach|chno|chkon|wach|bghit|3ndi|3and|akoya|khouya|mzyan|daba|dyal|casa|flous|flouss|malk|jawb|nta|ana|ghadi|yrba7|katchouf|lmountakhab)\b/i.test(text)) return 'Darija simple';
  if (/[\u0600-\u06FF]/.test(text)) return 'العربية / Darija';
  if (/(bonjour|je veux|strategie|stratégie|projet|marche|marché|client|budget|entreprise)/i.test(text)) return 'Français professionnel';
  return 'English';
}

export function inferBriefPatch(message = {}) {
  const text = String(message || '');
  const n = normalize(text);
  const patch = {};

  const city = CITIES.find((item) => n.includes(normalize(item)));
  if (city) patch.market = city === 'casa' ? 'Casablanca' : city.charAt(0).toUpperCase() + city.slice(1);

  const category = CATEGORIES.find((item) => includesAny(text, item.words));
  if (category) patch.category = category.value;

  const budgetMatch = text.match(/(?:budget\s*)?(\d{3,6})\s*(?:dh|mad|dhs|درهم|درهما)/i);
  if (budgetMatch) patch.budget = budgetMatch[1] + ' DH';

  if (includesAny(text, ['leads','lead','client','clients','whatsapp','messages','rdv','appointment'])) patch.goal = 'Générer des leads WhatsApp';
  else if (includesAny(text, ['sales','sell','vendre','vente','بيع'])) patch.goal = 'Vendre plus en ligne';
  else if (includesAny(text, ['launch','lancer','nbda','بدأ','start'])) patch.goal = 'Lancer une offre claire';

  if (includesAny(text, ['new project','nouveau projet','bghit ndir','bghit nbda','start project','فكرة'])) patch.stage = 'Nouveau projet à lancer';

  if (!patch.offer && category) {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 8 && cleaned.length < 160) patch.offer = cleaned;
  }

  patch.language = detectLanguage(text, null);
  return { ...patch, ...inferSmartBriefPatch(text, patch) };
}

export function mergeBrief(brief, patch) {
  return mergeSmartBrief(brief || {}, patch || {});
}

export function getMissingBriefFields(brief = {}) {
  return getSmartBriefStatus(brief).missingFields.map((field) => ({ key: field.key, label: field.label }));
}

export function briefIsReady(brief = {}) {
  return getSmartBriefStatus(brief).isReady;
}

function hasScope(message) {
  return includesAny(message, NAMAA_SCOPE) || Object.keys(inferBriefPatch(message)).some((key) => key !== 'language');
}

function wantsDeliverable(message) {
  const n = normalize(message);
  if (/(market research|recherche marche|recherche de marche|etude de marche|étude de marché|بحث السوق|دراسة السوق|analyse marche)/.test(n)) return 'market_research';
  if (/(marketing strategy|strategie marketing|stratégie marketing|خطة تسويقية|marketing plan|ads plan|strategie|strategy)/.test(n)) return 'marketing_strategy';
  if (/(roadmap|خارطة|خريطة|plan d action|plan 30|launch plan|خطة العمل)/.test(n)) return 'roadmap';
  if (/(pdf|document|rapport|download|telecharger|télécharger)/.test(n)) return 'pdf_choice';
  return null;
}

function isGreeting(message) {
  const n = normalize(message);
  return /^(hi|hello|hey|salam|salaam|salut|bonjour|bonsoir|السلام|سلام|السلام عليكم|labas|labass|labas 3lik|cv|ca va|ça va|kifach|ach khbarek|chno akhbar|wach labas)\b/.test(n) && n.length < 110;
}

function isLanguageSwitch(message) {
  return Boolean(detectExplicitLanguage(message)) && normalize(message).length < 150;
}

function isAboutElboubakry(message) {
  return /elboubakry|abdessamad|عبد الصمد|البوبكري|بوكر|bouk/i.test(String(message || ''));
}

function casualIntent(message = '') {
  const n = normalize(message);
  if (!isVeryShort(message)) return '';
  if (/^(ok|okay|mzyan|mezian|tamam|d accord|daccord|bien|nice|شكرا|merci|thanks|thx|lah yhafdk|safi|صافي)$/.test(n)) return 'ack';
  if (/^(jawb|jawbni|جاوب|جاوبني|answer|reponds|réponds|red 3lia|رد عليا)$/.test(n)) return 'answer_what';
  if (/^(malk|مالك|chno malk|chno bik|اش مالك|علاش|why)$/.test(n)) return 'tease';
  if (/^(chkon nta|nta chkon|who are you|qui es tu|شنو انت|شكون انت|wach nta ai|wach nta robot)$/.test(n)) return 'who_are_you';
  if (/^(chno katdir|شنو كتدير|what can you do|wach t9dr t3awni|شنو تقدر دير)$/.test(n)) return 'what_do';
  return '';
}

function isFriendlyOffTopicBridge(message = '') {
  const n = normalize(message);
  return /(football|foot|match|kora|lkora|كرة|ماتش|المنتخب|mountakhab|lmountakhab|world cup|coupe du monde|كاس العالم|barca|real madrid|ronaldo|messi|fifa|botola)/.test(n);
}

function emojiForMessage(message = '', brief = {}) {
  const n = normalize(message + ' ' + JSON.stringify(brief || {}));
  const emojis = [];
  if (/(ai|ia|ذكاء|automation|tech|it|app|saas|software|website|site)/.test(n)) emojis.push('🤖');
  if (/(business|startup|projet|project|مشروع|بيزنس|brand|marque)/.test(n)) emojis.push('💼');
  if (/(budget|dh|mad|money|flous|فلوس|ربح|vente|sales|بيع)/.test(n)) emojis.push('💰');
  if (/(marketing|ads|meta|facebook|instagram|tiktok|content|pub|اعلان|تسويق)/.test(n)) emojis.push('📣');
  if (/(idea|idée|فكرة|creative|mockup|logo)/.test(n)) emojis.push('💡');
  if (/(maroc|morocco|casa|casablanca|rabat|marrakech|tanger|agadir)/.test(n)) emojis.push('🇲🇦');
  if (!emojis.length) emojis.push('😄');
  return emojis.slice(0, 3).join('');
}

function languageSwitchReply(language) {
  if (/english/i.test(language)) return 'Sure, we continue in English 👍 Tell me your project idea or business problem, and I’ll keep it short.';
  if (/darija|arab/i.test(language)) return 'واخا، نكملو بالدارجة 😄 عطيني الفكرة ديال المشروع ولا المشكل اللي باغي نحلّو.';
  return 'Parfait, on continue en français 👍 Donnez-moi votre idée de projet ou votre problème business.';
}

function greetingReply(language) {
  if (/darija|arab/i.test(language)) return 'الحمد لله بخير 😄 واجد نخدم معاك. شنو المشروع ولا الفكرة اللي باغي نوضحوها اليوم؟';
  if (/english/i.test(language)) return 'Hi 👋 I’m good and ready to help. What project, AI idea, startup, or marketing problem are we working on today?';
  return 'Bonjour 👋 Ça va très bien. Sur quel projet, idée IA, startup ou problème marketing voulez-vous avancer aujourd’hui ?';
}

function casualReply(intent, language) {
  if (/darija|arab/i.test(language)) {
    if (intent === 'ack') return 'مزيان 😄 عطيني غير الفكرة ديالك ولا المشكل التجاري ونبداو خطوة بخطوة.';
    if (intent === 'answer_what') return 'جاوبك على شنو بالضبط؟ 😄 عطيني السؤال ولا الفكرة ديال المشروع، ونخلي الجواب قصير وواضح.';
    if (intent === 'tease') return 'هههه والو، غير كنحاول نبقى مركز معاك 😄 أرا الفكرة ديال المشروع ونخدموها مزيان.';
    if (intent === 'who_are_you') return 'أنا Namaa AI 🤖 مساعد ديالك فـ AI, business, startups, marketing والمشاريع فالمغرب. كنعاونك من الفكرة حتى strategy, mockup و landing page.';
    if (intent === 'what_do') return 'نقدر نعاونك فـ 4 حوايج: نفهم الفكرة 💡، نوجد PDF strategy 📄، نصاوب mockup/logo 🎨، ونخرج landing page بسيطة 💻. شنو المشروع؟';
  }
  if (/english/i.test(language)) {
    if (intent === 'ack') return 'Great 😄 Give me your project idea or business problem and we’ll build it step by step.';
    if (intent === 'answer_what') return 'Answer what exactly? 😄 Send me the question or project idea and I’ll keep it short.';
    if (intent === 'tease') return 'Haha nothing, I’m just staying focused 😄 Bring me the project idea and we’ll make it strong.';
    if (intent === 'who_are_you') return 'I’m Namaa AI 🤖 your assistant for AI, business, startups, marketing, and Moroccan projects.';
    if (intent === 'what_do') return 'I can help with 4 things: clarify the idea 💡, create a strategy PDF 📄, generate mockups/logo 🎨, and build a simple landing page 💻. What’s the project?';
  }
  if (intent === 'ack') return 'Parfait 😄 Donnez-moi l’idée du projet ou le problème business, et on avance étape par étape.';
  if (intent === 'answer_what') return 'Répondre à quoi exactement ? 😄 Envoyez-moi la question ou l’idée du projet, je garde ça court.';
  if (intent === 'tease') return 'Haha rien, je reste juste focus 😄 Donnez-moi l’idée du projet et on la structure proprement.';
  if (intent === 'who_are_you') return 'Je suis Namaa AI 🤖 votre assistant pour l’IA, business, startups, marketing et projets au Maroc.';
  if (intent === 'what_do') return 'Je peux aider sur 4 choses : clarifier l’idée 💡, créer un PDF stratégie 📄, générer logo/mockups 🎨, et créer une landing page simple 💻. Quel est le projet ?';
  return '';
}

function friendlyOffTopicBridge(language) {
  if (/darija|arab/i.test(language)) return 'الكرة زوينة والمنتخب ديما فالقلب 🇲🇦⚽ إن شاء الله يفرحونا. ولكن أنا هنا باش نربحو حتى المشروع ديالك 😄 أرا الفكرة ونبني ليك plan بحال خطة الماتش.';
  if (/english/i.test(language)) return 'Football is fun 🇲🇦⚽ but I won’t go deep there. I’m here to help your project win too 😄 Tell me the business idea and we’ll build the game plan.';
  return 'Le foot c’est sympa 🇲🇦⚽, mais je ne vais pas aller loin là-dessus. Je suis là pour faire gagner votre projet aussi 😄 Donnez-moi l’idée et on construit le plan.';
}

function shortScopeRedirect(language) {
  if (/darija|arab/i.test(language)) return 'نقدر ندير معاك هضرة خفيفة 😄 ولكن خدمتي الأساسية هي AI, business, startups, IT, marketing والمشاريع. رجعني لفكرة مشروعك ونخدموها بطريقة عملية 💼';
  if (/english/i.test(language)) return 'I can keep the chat friendly 😄 but my real focus is AI, business, startups, IT, marketing, and projects. Bring me back to your idea and I’ll help clearly 💼';
  return 'Je peux garder la discussion simple 😄 mais mon vrai focus reste IA, business, startups, IT, marketing et projets. Revenons à votre idée et je vous aide clairement 💼';
}

function elboubakryReply(language) {
  if (/darija|arab/i.test(language)) return 'إييه، Elboubakry Abdessamad هو صاحب Namaa AI 💼 كيركز على marketing digital، AI tools، landing pages و lead generation فالمغرب. Namaa معمول باش يحول الفكرة ديالك ل brief، PDF strategy، mockup ومن بعد landing page. شنو المشروع اللي بغيتي نخدمو عليه؟';
  if (/english/i.test(language)) return 'Yes. Elboubakry Abdessamad is behind Namaa AI 💼 focused on digital marketing, AI tools, landing pages, leads, and Moroccan business projects. What project should we build?';
  return 'Oui. Elboubakry Abdessamad est derrière Namaa AI 💼 avec un focus sur marketing digital, IA business, landing pages, leads et projets au Maroc. Quel projet voulez-vous construire ?';
}

function askMissingQuestions(brief, language) {
  return smartBriefAnswer({ brief, language });
}

function readyChoiceReply(language) {
  if (/darija|arab/i.test(language)) return 'دابا عندي brief كافي ✅ شنو بغيتي نوجد ليك الأول: Market Research PDF 🔎، Marketing Strategy PDF 📣، ولا Roadmap ديال الإطلاق 🚀؟';
  if (/english/i.test(language)) return 'Great, I have enough brief information ✅ What should I prepare first: Market Research PDF 🔎, Marketing Strategy PDF 📣, or Launch Roadmap 🚀?';
  return 'Parfait, j’ai assez d’informations ✅ Que voulez-vous préparer d’abord : Market Research PDF 🔎, Marketing Strategy PDF 📣, ou Roadmap de lancement 🚀 ?';
}

function simpleDomainReply(message, language) {
  const n = normalize(message);
  const emoji = emojiForMessage(message);
  if (/darija|arab/i.test(language)) {
    if (/(ai|ia|ذكاء)/.test(n)) return `${emoji} AI فالبزنس كيعني نستعملو أدوات ذكية باش نربحو الوقت، نحسنو التسويق، وننظمو العملاء. باش نطبقوها صح، شنو نوع المشروع ديالك؟`;
    if (/(prompt|برومبت|prompts)/.test(n)) return 'بالضبط 💡 المشكل غالباً ماشي فالأداة، المشكل فـ prompt. Namaa غادي يبني prompt قوي فالباكند، وانت غير جاوب بشكل عادي. شنو بغيتي تخلق؟';
    return `${emoji} نقدر نجاوبك باختصار، ولكن الأفضل نربطها بمشروع حقيقي. شنو المجال والهدف ديالك؟`;
  }
  if (/english/i.test(language)) {
    if (/(ai|ia)/.test(n)) return `${emoji} AI in business means using smart tools to save time, improve marketing, and organize leads. To apply it well, what project are you working on?`;
    if (/(prompt|prompts)/.test(n)) return 'Exactly 💡 Most people struggle with prompts. Namaa builds the strong backend prompt for you. What do you want to create?';
    return `${emoji} I can answer shortly, but Namaa works best when we connect the answer to a real project. What field and goal do you have?`;
  }
  if (/(ia|ai)/.test(n)) return `${emoji} L’IA business sert à gagner du temps, mieux vendre, automatiser des tâches et organiser les leads. Pour l’appliquer concrètement, quel est votre projet ?`;
  if (/(prompt|prompts)/.test(n)) return 'Exactement 💡 Beaucoup bloquent sur le prompt. Namaa construit le prompt fort en backend pour vous. Qu’est-ce que vous voulez créer ?';
  return `${emoji} Je peux répondre simplement, mais Namaa devient vraiment utile quand on relie la réponse à un projet réel. Quel est le domaine et l’objectif ?`;
}

function businessChatReply(message, brief, language) {
  const emoji = emojiForMessage(message, brief);
  if (!briefIsReady(brief)) return askMissingQuestions(brief, language);
  if (/darija|arab/i.test(language)) return `${emoji} مزيان، عندي معلومات كافية على المشروع. ما غاديش نعطيك نتيجة طويلة بلا ما تطلبها. واش نوجد Market Research PDF، Marketing Strategy PDF، ولا Roadmap؟`;
  if (/english/i.test(language)) return `${emoji} Good, I have enough project info. I won’t generate a long result unless you ask. Do you want Market Research PDF, Marketing Strategy PDF, or Roadmap?`;
  return `${emoji} Très bien, j’ai assez d’informations. Je ne génère pas un long résultat sans votre accord. Voulez-vous Market Research PDF, Marketing Strategy PDF ou Roadmap ?`;
}

function enforceExplicitLanguageOnBrief(brief, explicitLanguage) {
  if (!explicitLanguage) return brief;
  return { ...(brief || {}), language: explicitLanguage };
}

export function controlTalk({ message = '', brief = null, action = null }) {
  const explicitLanguage = detectExplicitLanguage(message);
  const patch = inferBriefPatch(message);
  if (explicitLanguage) patch.language = explicitLanguage;
  const mergedBrief = enforceExplicitLanguageOnBrief(mergeBrief(brief, patch), explicitLanguage);
  const language = detectLanguage(message, mergedBrief);
  const deliverable = action || wantsDeliverable(message);
  const casual = casualIntent(message);

  if (isGreeting(message)) {
    return { generate: false, intent: 'small_talk', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: greetingReply(language) };
  }

  if (isLanguageSwitch(message)) {
    return { generate: false, intent: 'language_switch', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: languageSwitchReply(language) };
  }

  if (casual) {
    return { generate: false, intent: 'casual_conversation', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: casualReply(casual, language) };
  }

  if (isAboutElboubakry(message)) {
    return { generate: false, intent: 'about_elboubakry', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: elboubakryReply(language) };
  }

  if (isFriendlyOffTopicBridge(message) && !hasScope(message) && !deliverable) {
    return { generate: false, intent: 'friendly_off_topic_bridge', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: friendlyOffTopicBridge(language) };
  }

  if (!hasScope(message) && !deliverable) {
    return { generate: false, intent: 'out_of_scope', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: shortScopeRedirect(language) };
  }

  if (deliverable && !['pdf_choice'].includes(deliverable)) {
    if (!briefIsReady(mergedBrief)) {
      return { generate: false, intent: 'brief_required', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: askMissingQuestions(mergedBrief, language), actions: ['guided_brief'] };
    }
    return { generate: true, intent: deliverable, action: deliverable, language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language) };
  }

  if (deliverable === 'pdf_choice') {
    if (!briefIsReady(mergedBrief)) {
      return { generate: false, intent: 'brief_required', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: askMissingQuestions(mergedBrief, language), actions: ['guided_brief'] };
    }
    return { generate: false, intent: 'pdf_choice', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: readyChoiceReply(language), actions: ['market_research', 'marketing_strategy', 'roadmap'] };
  }

  const patchKeys = Object.keys(patch || {}).filter((key) => key !== 'language');
  const hasProjectSignal = patchKeys.length > 0 || Boolean(brief);
  return {
    generate: false,
    intent: hasProjectSignal ? 'business_chat' : 'domain_chat',
    language,
    briefPatch: patch,
    brief: mergedBrief,
    briefStatus: getSmartBriefStatus(mergedBrief, language),
    answer: hasProjectSignal ? businessChatReply(message, mergedBrief, language) : simpleDomainReply(message, language),
    actions: hasProjectSignal ? (briefIsReady(mergedBrief) ? ['market_research', 'marketing_strategy', 'roadmap'] : ['guided_brief']) : [],
  };
}

export function compactBriefText(brief = {}) {
  return Object.entries(brief || {})
    .filter(([, value]) => value && String(value).trim())
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value).replace(/\s+/g, ' ').trim().slice(0, 240)}`)
    .join('\n');
}

export function buildDeliverablePrompt(action, brief, language) {
  const briefText = compactBriefText(brief);
  const commonRules = `
You are Namaa AI's hidden prompt engine. The user does not need to know prompting.
Use this structured brief only. Do not ask extra questions unless a critical field is absent.
Language/style: ${language || brief?.language || 'same as user'}.
Market: Morocco-first. Use practical Moroccan business logic, MAD budgets, WhatsApp, Instagram/TikTok, Meta Ads, Google Maps, trust, local customer behavior, landing pages, leads, and simple validation.
Do not invent fake statistics. If you mention market insights, phrase them as practical observations.
Write clean content for a branded PDF by Namaa AI and Elboubakry Abdessamad.
Use clear headings, compact bullets, and professional language.
No code blocks. No markdown tables. No generic theory.
`;

  if (action === 'market_research') {
    return `${commonRules}\nTASK: Generate a Market Research PDF draft.\nBrief:\n${briefText}\n\nRequired sections:\n1. Executive project snapshot\n2. Morocco market context\n3. Target customer behavior\n4. Competitor and alternative analysis\n5. Opportunity gap\n6. Risks and assumptions\n7. Positioning recommendation\n8. What to validate in the next 7 days\nKeep it under 900 words.`;
  }

  if (action === 'roadmap') {
    return `${commonRules}\nTASK: Generate a Launch Roadmap PDF draft.\nBrief:\n${briefText}\n\nRequired sections:\n1. Project objective\n2. Week 1: offer and proof\n3. Week 2: content and landing page\n4. Week 3: WhatsApp/sales flow and ads test\n5. Week 4: optimization and scale decision\n6. Task checklist\n7. KPIs and decision rules\nKeep it under 850 words.`;
  }

  return `${commonRules}\nTASK: Generate a Marketing Strategy PDF draft.\nBrief:\n${briefText}\n\nRequired sections:\n1. Executive summary\n2. Positioning and offer message\n3. Funnel: content → landing page/WhatsApp → conversion\n4. 30-day Meta/TikTok/Google/WhatsApp plan\n5. Budget split in MAD\n6. Content ideas\n7. WhatsApp script\n8. KPIs and next actions\nKeep it under 950 words.`;
}
