// Namaa Conversation Controller
// Update 25: adds Smart Brief Builder so Namaa asks only missing questions before deliverables.

import {
  inferSmartBriefPatch,
  mergeSmartBrief,
  getSmartBriefStatus,
  smartBriefAnswer,
} from './_smart-brief-builder.js';

export const NAMAA_SCOPE = [
  'business', 'startup', 'startups', 'project', 'projet', 'مشروع', 'مشاريع', 'بيزنس', 'تجارة',
  'marketing', 'ماركتينغ', 'تسويق', 'ads', 'meta', 'facebook', 'instagram', 'tiktok', 'google',
  'ai', 'ia', 'ذكاء', 'intelligence artificielle', 'ecommerce', 'e-commerce', 'saas', 'app', 'application',
  'landing', 'website', 'site', 'whatsapp', 'lead', 'leads', 'client', 'clients', 'sales', 'vente', 'بيع',
  'restaurant', 'clinic', 'clinique', 'medical', 'formation', 'real estate', 'immobilier', 'agency', 'agence',
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
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function includesAny(text, words) {
  const n = normalize(text);
  return words.some((word) => n.includes(normalize(word)));
}

function isGreeting(message) {
  const n = normalize(message).trim();
  return /^(hi|hello|hey|salam|salut|bonjour|bonsoir|السلام|سلام|كيف الحال|labas|labass|cv|ca va|ça va|kifach|ach khbarek)\b/.test(n) && n.length < 90;
}

function isLanguageSwitch(message) {
  const n = normalize(message);
  return /(english|anglais|francais|français|french|darija|arabic|arabe|العربية|بالانجليزية|بالفرنسية|بدارجة|dwa b english|talk in english|parle en)/.test(n) && n.length < 140;
}

function languageSwitchReply(language) {
  if (/english/i.test(language)) return 'Sure, we can continue in English. Tell me your project idea, market, or business problem and I’ll keep it short and clear.';
  if (/darija|arab/i.test(language)) return 'حاضر، نقدر نكملو بهاد الستايل. عطيني فكرة المشروع أو المشكل التجاري وغادي نجاوبك باختصار ووضوح.';
  return 'Bien sûr, on peut continuer avec ce style. Donnez-moi votre idée de projet ou votre problème business et je garde la réponse courte.';
}

function detectLanguage(message, brief) {
  const text = String(message || '');
  if (brief?.language) return brief.language;
  if (/(french|francais|français|بالفرنسية)/i.test(text)) return 'Français professionnel';
  if (/(english|anglais|بالانجليزية)/i.test(text)) return 'English';
  if (/[\u0600-\u06FF]/.test(text)) return 'العربية / Darija';
  if (/(wach|bghit|kifach|chno|3lach|3ndi|akoya|mzyan|daba|khdma|dyal|f casa)/i.test(text)) return 'Darija simple';
  if (/(bonjour|je veux|stratégie|projet|marché|client|budget)/i.test(text)) return 'Français professionnel';
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

  // Keep product/offer very short when the message clearly says what they want to sell.
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
  return getSmartBriefStatus(brief).missingFields.map((field) => ({
    key: field.key,
    label: field.label,
  }));
}

export function briefIsReady(brief = {}) {
  return getSmartBriefStatus(brief).isReady;
}

function hasScope(message) {
  return includesAny(message, NAMAA_SCOPE) || Object.keys(inferBriefPatch(message)).some((key) => key !== 'language');
}

function wantsDeliverable(message) {
  const n = normalize(message);
  if (/(market research|recherche marche|recherche de marche|etude de marche|étude de marché|بحث السوق)/.test(n)) return 'market_research';
  if (/(marketing strategy|strategie marketing|stratégie marketing|خطة تسويقية|marketing plan|ads plan)/.test(n)) return 'marketing_strategy';
  if (/(roadmap|خارطة|خريطة|plan d.action|plan 30|launch plan)/.test(n)) return 'roadmap';
  if (/(pdf|document|rapport|download|telecharger|télécharger)/.test(n)) return 'pdf_choice';
  return null;
}

function isAboutElboubakry(message) {
  return /elboubakry|abdessamad|عبد الصمد|البوبكري|بوكر|bouk/i.test(String(message || ''));
}

function shortScopeRedirect(language) {
  if (/darija|arab/i.test(language)) {
    return 'سمح ليا، أنا Namaa مركز غير على AI, business, startups, marketing والمشاريع. رجعني للمجال ديالي 😄 عطيني فكرة مشروعك ولا المشكل التجاري ونعاونك.';
  }
  if (/english/i.test(language)) {
    return 'I’m focused on AI, business, startups, marketing, and project building. Bring me back to your project idea or business problem and I’ll help you clearly.';
  }
  return 'Je reste focus sur l’IA, business, startups, marketing et création de projet. Donnez-moi votre idée, votre marché ou votre problème business et je vous aide clairement.';
}

function greetingReply(language) {
  if (/darija|arab/i.test(language)) return 'الحمد لله، واجد نخدم معاك 😄 شنو الفكرة أو المشروع اللي بغيتي نطورو اليوم؟';
  if (/english/i.test(language)) return 'I’m good and ready to help 😄 What project, AI idea, startup, or marketing problem do you want to work on today?';
  return 'Ça va très bien, prêt à travailler avec vous 😄 Sur quel projet, idée IA, startup ou problème marketing voulez-vous avancer aujourd’hui ?';
}

function elboubakryReply(language) {
  if (/darija|arab/i.test(language)) {
    return 'إييه، Elboubakry Abdessamad هو صاحب Namaa AI وكيخدم على التسويق الرقمي، المشاريع، AI tools، landing pages وlead generation فالمغرب. Namaa معمول باش يحول الفكرة ديالك ل brief واضح، PDF strategy، mockup، ومن بعد landing page. شنو المشروع اللي بغيتي نخدمو عليه؟';
  }
  if (/english/i.test(language)) {
    return 'Yes. Elboubakry Abdessamad is the person behind Namaa AI, focused on digital marketing, AI tools, landing pages, leads, and Moroccan business projects. Namaa helps turn an idea into a brief, strategy PDF, mockup, and landing page. What project should we build?';
  }
  return 'Oui. Elboubakry Abdessamad est derrière Namaa AI, avec un focus sur marketing digital, IA business, landing pages, leads et projets au Maroc. Namaa sert à transformer une idée en brief, PDF stratégie, mockup puis landing page. Quel projet voulez-vous construire ?';
}

function askMissingQuestions(brief, language) {
  return smartBriefAnswer({ brief, language });
}

function readyChoiceReply(language) {
  if (/darija|arab/i.test(language)) {
    return 'دابا عندي brief كافي. بغيتي نوجد ليك الأول Market Research PDF، ولا Marketing Strategy PDF، ولا Roadmap ديال الإطلاق؟';
  }
  if (/english/i.test(language)) {
    return 'Great, I have enough brief information. Do you want me to prepare a Market Research PDF, a Marketing Strategy PDF, or a Launch Roadmap?';
  }
  return 'Parfait, j’ai assez d’informations. Voulez-vous que je prépare un PDF Market Research, un PDF Marketing Strategy, ou une Roadmap de lancement ?';
}

function simpleDomainReply(message, language) {
  const n = normalize(message);
  if (/darija|arab/i.test(language)) {
    if (n.includes('ai') || n.includes('ia') || n.includes('ذكاء')) return 'AI فالبزنس يعني نستعملو أدوات ذكية باش نربحو الوقت، نحسنو التسويق، نجاوبو العملاء، نوجدو content، وننظمو leads. إلا بغيتي نطبقوها على مشروعك، عطيني النوع ديالو والمدينة.';
    return 'نقدر نشرح ليك الفكرة باختصار، ولكن الأفضل نربطها بمشروع حقيقي. عطيني شنو المجال ديالك والهدف، ونخلي الجواب عملي.';
  }
  if (/english/i.test(language)) {
    if (n.includes('ai')) return 'AI in business means using smart tools to save time, improve marketing, answer customers, create content, and organize leads. To make it useful, tell me your project type and market.';
    return 'I can explain it shortly, but Namaa works best when we connect the answer to a real project. Tell me the field and goal.';
  }
  if (n.includes('ia') || n.includes('ai')) return 'L’IA business sert à gagner du temps, mieux vendre, automatiser des tâches, créer du contenu et organiser les leads. Pour l’appliquer concrètement, donnez-moi votre type de projet et le marché.';
  return 'Je peux répondre simplement, mais Namaa devient vraiment utile quand on relie la réponse à un projet réel. Donnez-moi le domaine et l’objectif.';
}

function businessChatReply(message, brief, language) {
  if (!briefIsReady(brief)) return askMissingQuestions(brief, language);
  return readyChoiceReply(language);
}

export function controlTalk({ message = '', brief = null, action = null }) {
  const patch = inferBriefPatch(message);
  const mergedBrief = mergeBrief(brief, patch);
  const language = detectLanguage(message, mergedBrief);
  const deliverable = action || wantsDeliverable(message);

  if (isGreeting(message)) {
    return { generate: false, intent: 'small_talk', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: greetingReply(language) };
  }

  if (isLanguageSwitch(message)) {
    return { generate: false, intent: 'language_switch', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: languageSwitchReply(language) };
  }

  if (isAboutElboubakry(message)) {
    return { generate: false, intent: 'about_elboubakry', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: elboubakryReply(language) };
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
  const hasProjectSignal = patchKeys.length > 0 || brief;
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
