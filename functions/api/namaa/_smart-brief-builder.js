// Namaa Smart Brief Builder
// Update 25: extracts clean project info, scores readiness, and asks only the missing questions.

const FIELD_PRIORITY = [
  'projectName',
  'category',
  'offer',
  'market',
  'budget',
  'target',
  'goal',
  'stage',
  'channels',
  'language',
];

export const SMART_BRIEF_FIELDS = {
  projectName: {
    key: 'projectName',
    label: 'nom du projet',
    shortLabel: 'Nom',
    question: {
      fr: 'Quel est le nom du projet ? Si vous n’avez pas encore de nom, écrivez “pas encore”.',
      en: 'What is the project name? If you do not have one yet, write “not yet”.',
      ar: 'شنو سميت المشروع؟ إلا مازال ما عندكش الاسم، كتب “مازال”.',
    },
  },
  category: {
    key: 'category',
    label: 'type de projet',
    shortLabel: 'Type',
    question: {
      fr: 'Dans quelle catégorie entre le projet : ecommerce, restaurant, SaaS/app, clinique, service local, formation, immobilier, ou autre ?',
      en: 'What category is it: ecommerce, restaurant, SaaS/app, clinic, local service, education, real estate, or something else?',
      ar: 'شنو نوع المشروع: ecommerce، restaurant، SaaS/app، clinic، service local، formation، immobilier، ولا شي حاجة أخرى؟',
    },
  },
  offer: {
    key: 'offer',
    label: 'produit ou offre',
    shortLabel: 'Offre',
    question: {
      fr: 'Qu’est-ce que vous allez vendre exactement ? Produit, service, pack ou abonnement ?',
      en: 'What exactly will you sell: product, service, package, or subscription?',
      ar: 'شنو غادي تبيع بالضبط؟ منتج، خدمة، pack، ولا abonnement؟',
    },
  },
  market: {
    key: 'market',
    label: 'ville ou marché',
    shortLabel: 'Marché',
    question: {
      fr: 'Le projet cible quelle ville ou marché : Casablanca, Rabat, Marrakech, tout le Maroc, ou autre ?',
      en: 'Which city or market are you targeting: Casablanca, Rabat, Marrakech, all Morocco, or another market?',
      ar: 'فين غادي يبدا المشروع؟ Casablanca، Rabat، Marrakech، المغرب كامل، ولا مدينة أخرى؟',
    },
  },
  budget: {
    key: 'budget',
    label: 'budget',
    shortLabel: 'Budget',
    question: {
      fr: 'Quel budget pouvez-vous tester au début ? Même une estimation suffit, par exemple 1000 DH, 3000 DH ou 10000 DH.',
      en: 'What budget can you test first? An estimate is enough, like 1000 MAD, 3000 MAD, or 10000 MAD.',
      ar: 'شحال الميزانية اللي تقدر تجرب بها فالبداية؟ غير تقريبية كافية: 1000dh، 3000dh، 10000dh...',
    },
  },
  target: {
    key: 'target',
    label: 'client cible',
    shortLabel: 'Cible',
    question: {
      fr: 'Qui est le client cible principal ? Donnez-moi un profil simple.',
      en: 'Who is the main target customer? Give me a simple profile.',
      ar: 'شكون هو الزبون المستهدف؟ عطيني profile بسيط ديالو.',
    },
  },
  goal: {
    key: 'goal',
    label: 'objectif principal',
    shortLabel: 'Objectif',
    question: {
      fr: 'Quel est l’objectif numéro 1 : tester l’idée, vendre, générer des leads WhatsApp, trouver clients, ou créer une marque ?',
      en: 'What is the number one goal: test the idea, sell, generate WhatsApp leads, get clients, or build a brand?',
      ar: 'شنو الهدف الأول: نجرب الفكرة، نبيع، نجيب leads ف WhatsApp، نلقى clients، ولا نبني brand؟',
    },
  },
  stage: {
    key: 'stage',
    label: 'étape du projet',
    shortLabel: 'Étape',
    question: {
      fr: 'Le projet est à quelle étape : idée, nouveau lancement, projet existant, ou relance ?',
      en: 'What stage is the project in: idea, new launch, existing project, or relaunch?',
      ar: 'فين واصل المشروع: غير فكرة، إطلاق جديد، مشروع موجود، ولا بغيت تعاود تطلقو؟',
    },
  },
  channels: {
    key: 'channels',
    label: 'canaux actuels',
    shortLabel: 'Canaux',
    question: {
      fr: 'Quels canaux avez-vous déjà : Instagram, TikTok, WhatsApp, site web, Google Maps, ads, ou rien pour l’instant ?',
      en: 'Which channels do you already have: Instagram, TikTok, WhatsApp, website, Google Maps, ads, or nothing yet?',
      ar: 'شنو القنوات اللي عندك دابا: Instagram، TikTok، WhatsApp، site web، Google Maps، ads، ولا مازال والو؟',
    },
  },
  language: {
    key: 'language',
    label: 'langue de réponse',
    shortLabel: 'Langue',
    question: {
      fr: 'Vous préférez le résultat en français, darija, anglais, arabe, ou mix français + darija ?',
      en: 'Do you prefer the result in French, Darija, English, Arabic, or French + Darija?',
      ar: 'بأي لغة بغيتي النتيجة: français، darija، english، العربية، ولا français + darija؟',
    },
  },
};

const CITIES = [
  ['casablanca', 'Casablanca'], ['casa', 'Casablanca'], ['الدار البيضاء', 'Casablanca'],
  ['rabat', 'Rabat'], ['marrakech', 'Marrakech'], ['marrakesh', 'Marrakech'],
  ['tanger', 'Tanger'], ['tangier', 'Tanger'], ['agadir', 'Agadir'], ['fes', 'Fès'], ['fès', 'Fès'],
  ['meknes', 'Meknès'], ['meknès', 'Meknès'], ['kenitra', 'Kénitra'], ['kénitra', 'Kénitra'],
  ['oujda', 'Oujda'], ['tetouan', 'Tétouan'], ['tétouan', 'Tétouan'], ['taroudant', 'Taroudant'],
  ['maroc entier', 'Maroc entier'], ['tout le maroc', 'Maroc entier'], ['all morocco', 'Maroc entier'],
  ['morocco', 'Maroc entier'], ['maroc', 'Maroc entier'], ['المغرب كامل', 'Maroc entier'],
];

const CATEGORY_RULES = [
  { value: 'E-commerce / vente de produits', words: ['ecommerce','e-commerce','e commerce','shop','store','boutique','produit','products','vente de produits','cod','cash on delivery','cosmetic','cosmetics','beauty products','fashion','clothes','shoes','accessoires','بيع منتجات'] },
  { value: 'Restaurant / food', words: ['restaurant','food','cafe','café','coffee','patisserie','pâtisserie','fast food','dark kitchen','snack','menu','مطعم','اكل','ماكلة'] },
  { value: 'Clinique / médical', words: ['clinic','clinique','medical','médical','dentiste','dental','doctor','derma','dermatologie','esthetic','esthétique','aesthetic','عيادة','طبيب','أسنان'] },
  { value: 'SaaS / application', words: ['saas','application','app','mobile app','software','logiciel','platform','plateforme','dashboard','subscription','abonnement','تطبيق','منصة'] },
  { value: 'Agence / service pro', words: ['agency','agence','consulting','cabinet','service pro','freelance','studio','marketing agency','b2b','consultant'] },
  { value: 'Service local', words: ['cleaning','nettoyage','demenagement','déménagement','plombier','electricien','électricien','repair','réparation','livraison','service local','home service'] },
  { value: 'Formation / cours', words: ['formation','cours','school','ecole','école','education','edtech','training','coaching','academy','apprendre','تعليم','دروس'] },
  { value: 'Immobilier', words: ['real estate','immobilier','airbnb','location','appartement','property','villa','terrain','عقار','كراء'] },
  { value: 'Beauté / lifestyle', words: ['beauty','beaute','beauté','salon','coiffure','spa','cosmetique','cosmétique','makeup','maquillage','lifestyle'] },
  { value: 'Tourisme / hébergement', words: ['tourisme','tourism','hotel','hôtel','riad','hostel','voyage','travel','booking','hébergement'] },
  { value: 'AI business / automation', words: ['ai business','ia business','automation','automatisation','agent ai','chatbot','bot','ia','ai tool','outil ia'] },
];

const CHANNELS = [
  ['instagram', 'Instagram'], ['insta', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['meta ads', 'Meta Ads'],
  ['google ads', 'Google Ads'], ['google maps', 'Google Maps'], ['maps', 'Google Maps'], ['whatsapp', 'WhatsApp'],
  ['site web', 'Site web'], ['website', 'Site web'], ['landing page', 'Landing page'], ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'], ['ads', 'Ads'], ['rien', 'Rien pour l’instant'], ['walo', 'Rien pour l’instant'], ['nothing', 'Rien pour l’instant'],
];

function normalize(text = '') {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function cap(value, max = 160) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function hasAny(text, words) {
  const n = normalize(text);
  return words.some((word) => n.includes(normalize(word)));
}

function detectLanguage(text = '', brief = {}) {
  if (brief?.language) return brief.language;
  const raw = String(text || '');
  const n = normalize(raw);
  if (/english|anglais|بالانجليزية|in english/.test(n)) return 'English';
  if (/francais|français|french|بالفرنسية/.test(n)) return 'Français professionnel';
  if (/darija|darija simple|بدارجة|بالدارجة/.test(n)) return 'Darija simple';
  if (/[\u0600-\u06FF]/.test(raw)) return 'العربية / Darija';
  if (/\b(wach|bghit|kifach|chno|3lach|3ndi|akoya|mzyan|daba|dyal|f casa|n9der|n3ref)\b/.test(n)) return 'Darija simple';
  if (/bonjour|projet|stratégie|strategie|marché|marche|client|budget/.test(n)) return 'Français professionnel';
  return 'English';
}

function detectCategory(text = '') {
  return CATEGORY_RULES.find((rule) => hasAny(text, rule.words))?.value || '';
}

function detectMarket(text = '') {
  const n = normalize(text);
  const found = CITIES.find(([word]) => n.includes(normalize(word)));
  return found ? found[1] : '';
}

function detectBudget(text = '') {
  const raw = String(text || '');
  const budgetMatch = raw.match(/(?:budget|ميزانية|b\s*)?\s*(\d{2,7}(?:[\s.,]\d{3})?)\s*(?:dh|mad|dhs|درهم|درهما|dirham|dirhams)/i);
  if (budgetMatch) return budgetMatch[1].replace(/[\s.,]/g, '') + ' DH';
  const monthlyMatch = raw.match(/(\d{2,7})\s*(?:dh|mad|dhs)\s*\/?\s*(?:month|mois|شهر)/i);
  if (monthlyMatch) return monthlyMatch[1] + ' DH / mois';
  return '';
}

function detectGoal(text = '') {
  const n = normalize(text);
  if (/market research|recherche marche|etude de marche|étude de marché|بحث السوق/.test(n)) return 'Comprendre le marché et valider l’opportunité';
  if (/strategy|strategie|stratégie|خطة|marketing plan|ads plan/.test(n)) return 'Créer une stratégie marketing claire';
  if (/roadmap|خارطة|خريطة|plan 30|launch plan|lancement/.test(n)) return 'Construire une roadmap de lancement';
  if (/leads|lead|client|clients|whatsapp|rdv|appointment|messages/.test(n)) return 'Générer des leads WhatsApp';
  if (/sell|sales|vendre|vente|بيع|commandes/.test(n)) return 'Vendre plus et obtenir des commandes';
  if (/launch|lancer|nbda|start|بدأ/.test(n)) return 'Lancer le projet proprement';
  if (/brand|marque|branding/.test(n)) return 'Créer une marque claire';
  return '';
}

function detectStage(text = '') {
  const n = normalize(text);
  if (/idea|idée|idee|فكرة/.test(n)) return 'Idée initiale à transformer en projet';
  if (/new project|nouveau projet|bghit ndir|bghit nbda|start project|lancer|launch/.test(n)) return 'Nouveau projet à lancer';
  if (/existing|existant|deja|déjà| عندي |3ndi/.test(n)) return 'Projet existant à développer';
  if (/relance|relaunch|redémarrer|redemarrer/.test(n)) return 'Projet existant à relancer';
  return '';
}

function detectChannels(text = '') {
  const n = normalize(text);
  const found = [];
  CHANNELS.forEach(([word, label]) => {
    if (n.includes(normalize(word)) && !found.includes(label)) found.push(label);
  });
  return found;
}

function detectTarget(text = '') {
  const raw = cap(text, 220);
  const patterns = [
    /(?:target|cible|client cible|customers?|audience|لمن|للناس|للنساء|للرجال)\s*[:=-]?\s*([^.;\n]{3,120})/i,
    /(?:pour|for|لـ|ديال)\s+([^.;\n]{3,90})/i,
  ];
  for (const pattern of patterns) {
    const m = raw.match(pattern);
    if (m && m[1]) return cap(m[1], 120);
  }
  if (/b2b|entreprise|companies|business owners|professionals|professionnels/i.test(raw)) return 'Entrepreneurs / professionnels';
  if (/women|femmes|نساء|lbnat|bnat|girls|filles/i.test(raw)) return 'Femmes / jeunes femmes intéressées par l’offre';
  if (/young|jeunes|شباب|18-35|18 35/i.test(raw)) return 'Jeunes actifs 18-35 ans';
  return '';
}

function detectOffer(text = '', category = '') {
  const raw = cap(text, 260);
  const patterns = [
    /(?:sell|vendre|بيع|produit|product|service|offer|offre)\s*[:=-]?\s*([^.;\n]{3,150})/i,
    /(?:dyal|de|of)\s+([^.;\n]{3,90})/i,
  ];
  for (const pattern of patterns) {
    const m = raw.match(pattern);
    if (m && m[1]) return cap(m[1], 140);
  }
  if (category && raw.length >= 8 && raw.length <= 140) return raw;
  return '';
}

function detectProjectName(text = '') {
  const raw = cap(text, 180);
  const patterns = [
    /(?:project name|nom du projet|اسم المشروع|smit l projet|smit projet|smito|called|named|اسمها)\s*[:=-]?\s*([\p{L}\p{N}][\p{L}\p{N}\s&'.-]{1,60})/iu,
    /(?:my project is|mon projet s'appelle|mon projet est)\s+([\p{L}\p{N}][\p{L}\p{N}\s&'.-]{1,60})/iu,
  ];
  for (const pattern of patterns) {
    const m = raw.match(pattern);
    if (m && m[1]) return cap(m[1], 70);
  }
  return '';
}

export function inferSmartBriefPatch(message = '', currentBrief = {}) {
  const text = String(message || '');
  const category = detectCategory(text);
  const patch = {
    language: detectLanguage(text, currentBrief),
  };
  const projectName = detectProjectName(text);
  const market = detectMarket(text);
  const budget = detectBudget(text);
  const goal = detectGoal(text);
  const stage = detectStage(text);
  const channels = detectChannels(text);
  const target = detectTarget(text);
  const offer = detectOffer(text, category || currentBrief?.category || '');

  if (projectName) patch.projectName = projectName;
  if (category) patch.category = category;
  if (market) patch.market = market;
  if (budget) patch.budget = budget;
  if (goal) patch.goal = goal;
  if (stage) patch.stage = stage;
  if (channels.length) patch.channels = channels;
  if (target) patch.target = target;
  if (offer && !/^\s*(hi|hello|salam|bonjour|كيف الحال)/i.test(text)) patch.offer = offer;

  return normalizeSmartBriefPatch(patch);
}

export function normalizeSmartBriefPatch(patch = {}) {
  const output = {};
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      const clean = [...new Set(value.map((item) => cap(item, 60)).filter(Boolean))];
      if (clean.length) output[key] = clean;
      return;
    }
    output[key] = cap(value, key === 'offer' ? 180 : 120);
  });
  return output;
}

export function mergeSmartBrief(brief = {}, patch = {}) {
  const base = { ...(brief || {}) };
  const cleanPatch = normalizeSmartBriefPatch(patch || {});
  Object.entries(cleanPatch).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && !value.length)) return;
    if (key === 'language') {
      base[key] = base[key] || value;
      return;
    }
    if (Array.isArray(value)) {
      const previous = Array.isArray(base[key]) ? base[key] : (base[key] ? [base[key]] : []);
      base[key] = [...new Set([...previous, ...value])];
      return;
    }
    // Do not overwrite an existing user answer unless the field is empty.
    if (!base[key] || String(base[key]).trim().length < 2) base[key] = value;
  });
  return base;
}

function chooseLang(language = '') {
  const l = normalize(language);
  if (/english/.test(l)) return 'en';
  if (/darija|arab|العربية/.test(l)) return 'ar';
  return 'fr';
}

export function getSmartMissingFields(brief = {}) {
  return FIELD_PRIORITY
    .filter((key) => key !== 'language')
    .map((key) => SMART_BRIEF_FIELDS[key])
    .filter((field) => {
      const value = brief?.[field.key];
      return !value || (Array.isArray(value) && !value.length) || !String(value).trim();
    });
}

export function getSmartBriefStatus(brief = {}, language = '') {
  const lang = chooseLang(language || brief?.language || '');
  const missing = getSmartMissingFields(brief);
  const filled = FIELD_PRIORITY.filter((key) => {
    const value = brief?.[key];
    return value && (!Array.isArray(value) || value.length) && String(value).trim();
  });
  const requiredTotal = FIELD_PRIORITY.length - 1;
  const score = Math.round(Math.min(100, (filled.filter((key) => key !== 'language').length / requiredTotal) * 100));
  const mustAsk = missing.slice(0, 2);
  const nextQuestions = mustAsk.map((field) => field.question[lang] || field.question.fr);
  const isReady = missing.length <= 1;
  const level = score >= 90 ? 'ready' : score >= 55 ? 'almost' : score >= 25 ? 'discovery' : 'start';
  const summary = Object.entries(brief || {})
    .filter(([, value]) => value && (!Array.isArray(value) || value.length))
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : cap(value, 140)}`);

  return {
    score,
    level,
    isReady,
    filledFields: filled,
    missingFields: missing.map((field) => ({ key: field.key, label: field.label, shortLabel: field.shortLabel })),
    nextQuestions,
    nextFieldKeys: mustAsk.map((field) => field.key),
    compactBrief: summary.join('\n'),
    deliverablesReady: isReady,
  };
}

export function smartBriefAnswer({ brief = {}, language = '' } = {}) {
  const status = getSmartBriefStatus(brief, language);
  const lang = chooseLang(language || brief?.language || '');
  if (status.isReady) {
    if (lang === 'ar') return 'دابا عندي brief كافي. شنو بغيتي نوجد ليك الأول: Market Research PDF، Marketing Strategy PDF، ولا Roadmap؟';
    if (lang === 'en') return 'Great, I have enough brief information. What should I create first: Market Research PDF, Marketing Strategy PDF, or Launch Roadmap?';
    return 'Parfait, j’ai assez d’informations. Que voulez-vous créer en premier : Market Research PDF, Marketing Strategy PDF, ou Launch Roadmap ?';
  }
  const questions = status.nextQuestions;
  if (lang === 'ar') return `مزيان، فهمت الاتجاه 😄 باش نعطيك نتيجة قوية وما نطولش عليك، جاوبني غير على هاد ${questions.length} سؤال: ${questions.join(' ')}`;
  if (lang === 'en') return `Good, I understand the direction 😄 To give you a strong result without long random answers, answer these ${questions.length} question(s): ${questions.join(' ')}`;
  return `Très bien, je comprends la direction 😄 Pour vous donner un résultat fort sans réponse trop longue, répondez juste à ces ${questions.length} question(s) : ${questions.join(' ')}`;
}
