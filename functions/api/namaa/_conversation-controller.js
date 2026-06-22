// Namaa Conversation Controller
// Update 32: Gemini Free Talk mode.
// Goal: controller routes intent and fallback only; Gemini handles daily/free conversation while Namaa stays focused on AI/business/IT/startups/marketing/technology/programming.

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
  'technology', 'technologie', 'tech', 'it', 'software', 'logiciel', 'programming', 'programmation', 'code', 'coding', 'developer', 'dev', 'automation', 'automatisation', 'digital', 'branding', 'brand',
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
  const raw = String(message || '').toLowerCase();
  const n = normalize(message);
  // In Morocco, when the user says "Darija", Namaa must write Darija with Latin/French letters.
  // Arabic script is used only when the user explicitly asks for Arabic / Arabic letters.
  if (/(arabic letters|arabic script|الحروف العربية|بحروف عربية|بالحروف العربية|العربية|بالعربية|عربي|fusha|فصحى)/.test(n)) return 'Arabic';
  if (/(darija|dariija|derija|ddarija|maghribi|moroccan arabic|بدارجة|بالدارجة|داريجة|دارجة)/.test(n)) return 'Darija Latin';
  if (/(english|anglais|in english|بالانجليزية|بالإنجليزية|englizi)/.test(n)) return 'English';
  if (/(francais darija|français darija|mix|fr darija)/.test(raw) || /(francais darija|mix|fr darija)/.test(n)) return 'Français + Darija';
  if (/(francais|français|french|en francais|en français|بالفرنسية)/.test(raw) || /(francais|french|en francais)/.test(n)) return 'Français professionnel';
  return '';
}

function isDarijaLatin(language = '') {
  return /darija latin|darija simple|francais \+ darija|français \+ darija/i.test(String(language || ''));
}

function isArabicLanguage(language = '') {
  return /^arabic$/i.test(String(language || '')) || /العربية/.test(String(language || ''));
}

function detectLanguage(message, brief) {
  const explicit = detectExplicitLanguage(message);
  if (explicit) return explicit;
  const text = String(message || '');
  if (brief?.language) return brief.language;
  if (/\b(salam|salaam|labas|labass|kifach|chno|chkon|wach|bghit|3ndi|3and|akoya|khouya|mzyan|daba|dyal|casa|flous|flouss|malk|jawb|nta|ana|ghadi|yrba7|katchouf|lmountakhab)\b/i.test(text)) return 'Darija Latin';
  if (/[\u0600-\u06FF]/.test(text)) return 'Arabic';
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
  if (/^(chkon nta|nta chkon|daba nta chkon|nta chkon daba|who are you|qui es tu|شنو انت|شكون انت|wach nta ai|wach nta robot)$/.test(n) || /\b(nta|nti|نتا|انت)\b.*\b(chkon|شكون|who)\b/.test(n)) return 'who_are_you';
  if (/(\bjaw\b|jaw lyoum|jaw daba|weather|meteo|météo|الجو|طقس|shta|chta|الشمس|برد|سخون|حر|rain|pluie)/.test(n)) return 'weather';
  if (/^(chno katdir|شنو كتدير|what can you do|wach t9dr t3awni|شنو تقدر دير)$/.test(n)) return 'what_do';
  return '';
}

function isFriendlyOffTopicBridge(message = '') {
  const n = normalize(message);
  return /(football|foot|match|kora|lkora|كرة|ماتش|المنتخب|mountakhab|lmountakhab|world cup|coupe du monde|كاس العالم|barca|real madrid|ronaldo|messi|fifa|botola)/.test(n);
}

function isWeatherOrDailySmallTalk(message = '') {
  const n = normalize(message);
  return /(\bjaw\b|jaw lyoum|jaw daba|weather|meteo|météo|الجو|طقس|shta|chta|الشمس|برد|سخون|حر|rain|pluie)/.test(n) && isVeryShort(message);
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
  if (isDarijaLatin(language)) return 'Wakha asahbi, nkemlo b Darija b 7rof fransawiya 😄 Chno lfikra ola l-projet li f rask lyoum? 💡';
  if (isArabicLanguage(language)) return 'حاضر، نكمل بالعربية الواضحة. ما هي فكرة المشروع أو المشكل الذي تريد الاشتغال عليه اليوم؟ 💡';
  if (/english/i.test(language)) return 'Sure, we’ll continue in English 👍 What project, AI idea, or business problem are we working on today?';
  return 'Parfait, on continue en français 👍 Quelle idée de projet ou quel problème business voulez-vous travailler aujourd’hui ?';
}

function greetingReply(language) {
  if (isDarijaLatin(language)) return 'Wa 3alaykom salam 👋 labas 3lik? Ana mzyan w wajed nkhdem m3ak. Chno lfikra li dayra f rask lyoum? 💡';
  if (isArabicLanguage(language)) return 'وعليكم السلام 👋 الحمد لله بخير. ما هي فكرة المشروع أو الهدف الذي تريد العمل عليه اليوم؟';
  if (/english/i.test(language)) return 'Hi 👋 I’m good and ready to help. What project, AI idea, startup, or marketing problem are we working on today?';
  return 'Bonjour 👋 Ça va très bien. Sur quelle idée, projet IA, startup ou problème marketing voulez-vous avancer aujourd’hui ?';
}

function casualReply(intent, language) {
  if (isDarijaLatin(language)) {
    if (intent === 'ack') return 'Mzyan 😄 nkhlliha simple. Ila 3ndek chi fikra, projet, marketing problem ola AI tool bghiti tfhamo, golha lia.';
    if (intent === 'answer_what') return 'Njawebk b kol wodou7 😄 3la chno bghiti l-jawab? 3tini su2al ola fikra dyal projet.';
    if (intent === 'tease') return 'Hhh walo asahbi, ghi kan7awel nb9a m3ak f l-flow 😄 chno lfikra li bghiti nkhdmo 3liha?';
    if (intent === 'who_are_you') return 'Ana Namaa AI 🤖 sa7bek f AI, business, startups, IT, marketing w projects. Kat-hder 3adi, w ana nretteb lik l-fikra w nkhrej lik plan/PDF/mockup ila bghiti 💼';
    if (intent === 'weather') return 'L-jaw ila kan zwin, khasna hta l-fikra tkoun zwina bhalo 😄☀️ Ma 3ndich météo live, walakin n9der n3awnek nwde7o chi projet ytla3 mzyan 💡';
    if (intent === 'what_do') return 'N9der n3awnek f 4 7wayj: nwde7o l-fikra 💡, nwjed PDF strategy 📄, nkhleq logo/mockup 🎨, w nkhrej landing page bsita 💻. Chno bghiti?';
  }
  if (isArabicLanguage(language)) {
    if (intent === 'ack') return 'ممتاز 😄 أعطني فكرة المشروع أو المشكل التجاري وسنرتبه خطوة بخطوة.';
    if (intent === 'answer_what') return 'أجيبك على ماذا بالضبط؟ أعطني السؤال أو فكرة المشروع وسأبقي الجواب واضحاً ومختصراً.';
    if (intent === 'tease') return 'لا شيء 😄 فقط أحاول أن أبقى معك في المسار الصحيح. ما هي فكرة المشروع؟';
    if (intent === 'who_are_you') return 'أنا Namaa AI 🤖 مساعدك في AI و business و startups و marketing و IT. أساعدك من الفكرة إلى الخطة والموكاب والصفحة.';
    if (intent === 'weather') return 'الجو إذا كان جميلاً نحتاج فكرة مشروع جميلة مثله 😄 لا أملك طقساً مباشراً، لكن أستطيع مساعدتك في مشروعك.';
    if (intent === 'what_do') return 'أساعدك في توضيح الفكرة، إنشاء PDF استراتيجية، موكاب/لوغو، وصفحة هبوط بسيطة. ما المشروع؟';
  }
  if (/english/i.test(language)) {
    if (intent === 'ack') return 'Great 😄 Keep it simple: send me your idea, project, AI tool question, or business problem.';
    if (intent === 'answer_what') return 'Answer what exactly? 😄 Send me the question or project idea and I’ll keep it short.';
    if (intent === 'tease') return 'Haha nothing, I’m just keeping the flow alive 😄 What idea or project should we shape?';
    if (intent === 'who_are_you') return 'I’m Namaa AI 🤖 your friendly assistant for AI, business, startups, marketing, IT, and project building.';
    if (intent === 'weather') return 'If the weather is nice, let’s make the project idea nice too 😄☀️ I don’t have live weather, but I can help with the business forecast 💼';
    if (intent === 'what_do') return 'I can help with 4 things: clarify the idea 💡, create a strategy PDF 📄, generate mockups/logo 🎨, and build a simple landing page 💻. What’s the project?';
  }
  if (intent === 'ack') return 'Parfait 😄 Envoyez-moi l’idée, le projet, l’outil IA ou le problème business.';
  if (intent === 'answer_what') return 'Répondre à quoi exactement ? 😄 Envoyez-moi la question ou l’idée du projet, je garde ça clair.';
  if (intent === 'tease') return 'Haha rien, je garde juste le flow vivant 😄 Quelle idée ou projet voulez-vous structurer ?';
  if (intent === 'who_are_you') return 'Je suis Namaa AI 🤖 votre assistant friendly pour IA, business, startups, marketing, IT et projets au Maroc.';
  if (intent === 'weather') return 'Si la météo est bonne, on peut rendre l’idée du projet encore meilleure 😄☀️ Je n’ai pas la météo live, mais je peux aider côté business 💼';
  if (intent === 'what_do') return 'Je peux aider sur 4 choses : clarifier l’idée 💡, créer un PDF stratégie 📄, générer logo/mockups 🎨, et créer une landing page simple 💻. Quel est le projet ?';
  return '';
}

function friendlyOffTopicBridge(language) {
  if (isDarijaLatin(language)) return 'L-kora zwina w l-mountakhab dima f l9alb 🇲🇦⚽ Nkhlli l-analyse l terrain, w nrj3o l match dyal projet dyalek 😄 chno l-fikra li bghiti nreb7o biha?';
  if (isArabicLanguage(language)) return 'الكرة جميلة والمنتخب دائماً في القلب 🇲🇦⚽ لكن نعود لمباراة مشروعك 😄 ما هي الفكرة التي تريد أن نربح بها؟';
  if (/english/i.test(language)) return 'Football is fun 🇲🇦⚽ but I won’t go deep there. Let’s win the project match too 😄 What’s the idea?';
  return 'Le foot c’est sympa 🇲🇦⚽, mais je ne vais pas aller loin là-dessus. Revenons au match de votre projet 😄 Quelle est l’idée ?';
}

function shortScopeRedirect(language) {
  if (isDarijaLatin(language)) return 'N9der ndir m3ak hadra khfifa 😄 walakin focus dyali huwa AI, business, startups, IT, marketing w projects. Ila 3ndek fikra, n9der n3awnek nwde7oha 💼';
  if (isArabicLanguage(language)) return 'أستطيع محادثتك بخفة 😄 لكن تركيزي هو AI و business و startups و IT و marketing والمشاريع. أعطني فكرة مشروعك ونرتبها.';
  if (/english/i.test(language)) return 'I can keep the chat friendly 😄 but my real focus is AI, business, startups, IT, marketing, and projects. Got an idea we can shape? 💼';
  return 'Je peux garder la discussion légère 😄 mais mon vrai focus reste IA, business, startups, IT, marketing et projets. Quelle idée voulez-vous structurer ? 💼';
}

function elboubakryReply(language) {
  if (isDarijaLatin(language)) return 'Elboubakry Abdessamad huwa li mora Namaa AI 💼 kaykhdem 3la marketing digital, AI tools, landing pages w lead generation f Morocco. Namaa msayb bach y7ewwel l-fikra dyalek l brief, PDF strategy, mockup w landing page. Chno projet li bghiti nbdaw bih?';
  if (isArabicLanguage(language)) return 'Elboubakry Abdessamad هو صاحب Namaa AI 💼 يركز على التسويق الرقمي، أدوات AI، صفحات الهبوط وتوليد العملاء في المغرب. ما المشروع الذي تريد بناءه؟';
  if (/english/i.test(language)) return 'Yes. Elboubakry Abdessamad is behind Namaa AI 💼 focused on digital marketing, AI tools, landing pages, leads, and Moroccan business projects. What project should we build?';
  return 'Oui. Elboubakry Abdessamad est derrière Namaa AI 💼 avec un focus sur marketing digital, IA business, landing pages, leads et projets au Maroc. Quel projet voulez-vous construire ?';
}

function askMissingQuestions(brief, language) {
  return smartBriefAnswer({ brief, language });
}

function readyChoiceReply(language) {
  if (isDarijaLatin(language)) return 'Daba 3ndi brief kafi ✅ chno bghiti nwjed lik lwl: Market Research PDF 🔎, Marketing Strategy PDF 📣, ola Roadmap dyal launch 🚀?';
  if (isArabicLanguage(language)) return 'الآن لدي brief كافٍ ✅ ماذا تريد أولاً: Market Research PDF 🔎، Marketing Strategy PDF 📣، أم Roadmap للإطلاق 🚀؟';
  if (/english/i.test(language)) return 'Great, I have enough brief information ✅ What should I prepare first: Market Research PDF 🔎, Marketing Strategy PDF 📣, or Launch Roadmap 🚀?';
  return 'Parfait, j’ai assez d’informations ✅ Que voulez-vous préparer d’abord : Market Research PDF 🔎, Marketing Strategy PDF 📣, ou Roadmap de lancement 🚀 ?';
}

function simpleDomainReply(message, language) {
  const n = normalize(message);
  const emoji = emojiForMessage(message);
  if (isDarijaLatin(language)) {
    if (/(ai|ia|ذكاء)/.test(n)) return `${emoji} AI f business kay3ni nsta3mlo tools dkiya bach nreb7o lweqt, n7ssno marketing, w nndmo leads. Ila bghina ntb9oha s7i7: chno no3 projet dyalek?`;
    if (/(prompt|برومبت|prompts)/.test(n)) return 'Exactly 💡 lmochkil ghaliban machi f tool, lmochkil f kifach nchr7o l-fikra. Hder 3adi w Namaa yrettebha lik. Chno bghiti tkhleq?';
    return `${emoji} N9der njawbk bikhtisar, walakin ila rbetnaha b projet 7aqiqi ghadi tkoun natija aqwa. Chno lmajal w lhadaf dyalek?`;
  }
  if (isArabicLanguage(language)) {
    if (/(ai|ia|ذكاء)/.test(n)) return `${emoji} AI في البزنس يعني استعمال أدوات ذكية لتوفير الوقت، تحسين التسويق وتنظيم العملاء. ما نوع مشروعك؟`;
    if (/(prompt|برومبت|prompts)/.test(n)) return 'بالضبط 💡 المشكل ghaliban ليس في الأداة، بل في طريقة شرح الفكرة. تحدث بشكل عادي وNamaa يرتبها لك. ماذا تريد أن تنشئ؟';
    return `${emoji} أستطيع أن أجيبك باختصار، لكن الأفضل ربط الجواب بمشروع حقيقي. ما المجال والهدف؟`;
  }
  if (/english/i.test(language)) {
    if (/(ai|ia)/.test(n)) return `${emoji} AI in business means using smart tools to save time, improve marketing, and organize leads. To apply it well, what project are you working on?`;
    if (/(prompt|prompts)/.test(n)) return 'Exactly 💡 Most people struggle to explain the idea clearly. You talk normally, and Namaa structures it for you. What do you want to create?';
    return `${emoji} I can answer shortly, but Namaa works best when we connect the answer to a real project. What field and goal do you have?`;
  }
  if (/(ia|ai)/.test(n)) return `${emoji} L’IA business sert à gagner du temps, mieux vendre, automatiser des tâches et organiser les leads. Pour l’appliquer concrètement, quel est votre projet ?`;
  if (/(prompt|prompts)/.test(n)) return 'Exactement 💡 Beaucoup bloquent parce que l’idée n’est pas encore claire. Vous parlez normalement, et Namaa la structure pour vous. Qu’est-ce que vous voulez créer ?';
  return `${emoji} Je peux répondre simplement, mais Namaa devient vraiment utile quand on relie la réponse à un projet réel. Quel est le domaine et l’objectif ?`;
}

function businessChatReply(message, brief, language) {
  const emoji = emojiForMessage(message, brief);
  if (!briefIsReady(brief)) return askMissingQuestions(brief, language);
  if (isDarijaLatin(language)) return `${emoji} Mzyan, 3ndi info kafya 3la projet. Ma ghadich nkhrej résultat twil bla mowafaqtek. Bghiti Market Research PDF, Marketing Strategy PDF, ola Roadmap?`;
  if (isArabicLanguage(language)) return `${emoji} جيد، لدي معلومات كافية عن المشروع. لن أُخرج نتيجة طويلة بدون موافقتك. هل تريد Market Research PDF، Marketing Strategy PDF، أم Roadmap؟`;
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

  if (isWeatherOrDailySmallTalk(message)) {
    return { generate: false, intent: 'casual_conversation', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: casualReply('weather', language) };
  }

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
    return { generate: false, intent: 'free_conversation', language, briefPatch: patch, brief: mergedBrief, briefStatus: getSmartBriefStatus(mergedBrief, language), answer: shortScopeRedirect(language) };
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
