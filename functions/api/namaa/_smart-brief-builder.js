// Namaa Smart Brief Builder
// Update 39: extracts clean project info with Morocco categories/cities taxonomy.

import { MARKET_CITIES, MARKET_CATEGORY_RULES, detectMarketCategory } from './_market-taxonomy.js';

const FIELD_PRIORITY = [
  'projectName',
  'offer',
  'market',
  'category',
  'target',
  'goal',
  'stage',
  'channels',
  'budget',
  'language',
];

// Update 80: Namaa Talk must not interrogate users.
// A project can move forward with only the essentials, then Gemini/agents infer the rest.
const ESSENTIAL_BRIEF_FIELDS = ['projectName', 'offer', 'market'];

export const SMART_BRIEF_FIELDS = {
  projectName: {
    key: 'projectName',
    label: 'nom du projet',
    shortLabel: 'Nom',
    question: {
      fr: 'Quel est le nom du projet ? Si vous n’avez pas encore de nom, écrivez “pas encore”.',
      en: 'What is the project name? If you do not have one yet, write “not yet”.',
      ar: 'شنو سميت المشروع؟ إلا مازال ما عندكش اسم، كتب غير “مازال”.',
    },
  },
  category: {
    key: 'category',
    label: 'type de projet',
    shortLabel: 'Type',
    question: {
      fr: 'Dans quelle catégorie entre le projet : ecommerce, restaurant, SaaS/app, clinique, service local, formation, immobilier, AI/IT, marketplace, tourisme, beauté, B2B ou autre ?',
      en: 'What category is it: ecommerce, restaurant, SaaS/app, clinic, local service, education, real estate, AI/IT, marketplace, tourism, beauty, B2B, or something else?',
      ar: 'شنو نوع المشروع باختصار؟ مثال: متجر، تطبيق، خدمة، عيادة، تعليم، مطعم، AI/IT...',
    },
  },
  offer: {
    key: 'offer',
    label: 'produit ou offre',
    shortLabel: 'Offre',
    question: {
      fr: 'Qu’est-ce que vous allez vendre exactement ? Produit, service, pack ou abonnement ?',
      en: 'What exactly will you sell: product, service, package, or subscription?',
      ar: 'وصف ليا المشروع ف جوج سطور: شنو كيدير وشنو غادي يبيع ولا يقدم؟',
    },
  },
  market: {
    key: 'market',
    label: 'ville ou marché',
    shortLabel: 'Marché',
    question: {
      fr: 'Le projet cible quelle ville ou marché : Casablanca, Rabat, Marrakech, Tanger, Agadir, tout le Maroc, online/international ou autre ?',
      en: 'Which city or market are you targeting: Casablanca, Rabat, Marrakech, Tangier, Agadir, all Morocco, online/international, or another market?',
      ar: 'فين غادي يخدم المشروع: مدينة معينة ولا المغرب كامل؟',
    },
  },
  budget: {
    key: 'budget',
    label: 'budget',
    shortLabel: 'Budget',
    question: {
      fr: 'Quel budget pouvez-vous tester au début ? Même une estimation suffit, par exemple 1000 DH, 3000 DH ou 10000 DH.',
      en: 'What budget can you test first? An estimate is enough, like 1000 MAD, 3000 MAD, or 10000 MAD.',
      ar: 'إلا بغيتي، عطيني الميزانية التقريبية، وإذا ما بغيتيش دابا نكملو بلا بها.',
    },
  },
  target: {
    key: 'target',
    label: 'client cible',
    shortLabel: 'Cible',
    question: {
      fr: 'Qui est le client cible principal ? Donnez-moi un profil simple.',
      en: 'Who is the main target customer? Give me a simple profile.',
      ar: 'شكون الناس اللي باغي توصل ليهم؟ غير وصف بسيط كافي.',
    },
  },
  goal: {
    key: 'goal',
    label: 'objectif principal',
    shortLabel: 'Objectif',
    question: {
      fr: 'Quel est l’objectif numéro 1 : tester l’idée, vendre, générer des leads WhatsApp, trouver clients, ou créer une marque ?',
      en: 'What is the number one goal: test the idea, sell, generate WhatsApp leads, get clients, or build a brand?',
      ar: 'شنو بغيتي يتحقق أولاً: تجربة الفكرة، مبيعات، leads، ولا branding؟',
    },
  },
  stage: {
    key: 'stage',
    label: 'étape du projet',
    shortLabel: 'Étape',
    question: {
      fr: 'Le projet est à quelle étape : idée, nouveau lancement, projet existant, ou relance ?',
      en: 'What stage is the project in: idea, new launch, existing project, or relaunch?',
      ar: 'المشروع باقي فكرة ولا موجود وبغيتي تطورو؟',
    },
  },
  channels: {
    key: 'channels',
    label: 'canaux actuels',
    shortLabel: 'Canaux',
    question: {
      fr: 'Quels canaux avez-vous déjà : Instagram, TikTok, WhatsApp, site web, Google Maps, ads, ou rien pour l’instant ?',
      en: 'Which channels do you already have: Instagram, TikTok, WhatsApp, website, Google Maps, ads, or nothing yet?',
      ar: 'واش عندك شي قناة دابا: Instagram، WhatsApp، site web، ولا مازال والو؟',
    },
  },
  language: {
    key: 'language',
    label: 'langue de réponse',
    shortLabel: 'Langue',
    question: {
      fr: 'Vous préférez le résultat en français, darija, anglais, arabe, ou mix français + darija ?',
      en: 'Do you prefer the result in French, Darija, English, Arabic, or French + Darija?',
      ar: 'بغيتي نبقى نهضر معاك بالدارجة العربية ولا Darija Latin؟',
    },
  },
};

const CITIES = MARKET_CITIES;

const CATEGORY_RULES = MARKET_CATEGORY_RULES;

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
  if (/darija|darija simple|بدارجة|بالدارجة/.test(n)) return 'Darija Latin';
  if (/[\u0600-\u06FF]/.test(raw)) return 'Arabic';
  if (/\b(wach|bghit|kifach|chno|3lach|3ndi|akoya|mzyan|daba|dyal|f casa|n9der|n3ref)\b/.test(n)) return 'Darija Latin';
  if (/bonjour|projet|stratégie|strategie|marché|marche|client|budget/.test(n)) return 'Français professionnel';
  return 'English';
}

function detectCategory(text = '') {
  return detectMarketCategory(text) || CATEGORY_RULES.find((rule) => hasAny(text, rule.words))?.value || '';
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
    /(?:dyal|de|of|ديال)\s+([^.;\n]{3,90})/i,
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
    /(?:project name|nom du projet|اسم المشروع|smit l projet|smit projet|smito|سميتو|سميته|سميتها|called|named|اسمها)\s*[:=-]?\s*([\p{L}\p{N}][\p{L}\p{N}\s&'.-]{1,60})/iu,
    /(?:my project is|mon projet s'appelle|mon projet est)\s+([\p{L}\p{N}][\p{L}\p{N}\s&'.-]{1,60})/iu,
  ];
  for (const pattern of patterns) {
    const m = raw.match(pattern);
    if (m && m[1]) return cap(m[1], 70);
  }
  return '';
}


function isDarijaLatin(language = '') {
  return /darija latin|darija simple|francais \+ darija|français \+ darija/i.test(String(language || ''));
}

function isArabicLanguage(language = '') {
  return /^arabic$/i.test(String(language || '')) || /العربية/.test(String(language || ''));
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
  if (/darija/.test(l)) return 'dr';
  if (/arab|العربية/.test(l)) return 'ar';
  return 'fr';
}

const DARIJA_LATIN_QUESTIONS = {
  projectName: 'شنو سميت المشروع؟ إلا مازال ما كايناش، كتب غير “مازال”.',
  category: 'شنو نوع المشروع باختصار؟ متجر، تطبيق، خدمة، عيادة، مطعم، AI/IT ولا شي مجال آخر؟',
  offer: 'وصف ليا المشروع ف جوج سطور: شنو كيدير وشنو غادي يقدم للناس؟',
  market: 'فين غادي يخدم المشروع: مدينة معينة ولا المغرب كامل؟',
  budget: 'الميزانية نقدر نخليوها من بعد. إلا بغيتي، عطيني غير رقم تقريبي.',
  target: 'شكون الناس اللي باغي توصل ليهم؟ غير وصف بسيط كافي.',
  goal: 'شنو باغي أول نتيجة: مبيعات، leads، تجربة الفكرة، ولا branding؟',
  stage: 'المشروع باقي فكرة ولا موجود وبغيتي تطورو؟',
  channels: 'واش عندك شي قناة دابا: Instagram، WhatsApp، site web، ولا مازال والو؟',
  language: 'بغيتي نبقى نهضر معاك بالدارجة العربية ولا Darija Latin؟',
};

export function getSmartMissingFields(brief = {}) {
  return ESSENTIAL_BRIEF_FIELDS
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
  const requiredTotal = ESSENTIAL_BRIEF_FIELDS.length;
  const filledEssential = ESSENTIAL_BRIEF_FIELDS.filter((key) => {
    const value = brief?.[key];
    return value && (!Array.isArray(value) || value.length) && String(value).trim();
  });
  const score = Math.round(Math.min(100, (filledEssential.length / requiredTotal) * 100));
  const mustAsk = missing.slice(0, 1);
  const nextQuestions = mustAsk.map((field) => lang === 'dr' ? (DARIJA_LATIN_QUESTIONS[field.key] || field.question.fr) : (field.question[lang] || field.question.fr));
  const isReady = missing.length === 0;
  const level = score >= 100 ? 'ready' : score >= 67 ? 'almost' : score >= 34 ? 'discovery' : 'start';
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
  const questions = (status.nextQuestions || []).slice(0, 1);
  const firstQuestion = questions[0] || '';

  if (status.isReady) {
    if (isDarijaLatin(language) || isArabicLanguage(language)) return 'فهمت الفكرة الأساسية ✅ غادي نلخصها ليك دابا ونسولك واش الفهم صحيح. إذا قلتي نعم، نمشيو مباشرة لـ Namaa Design.';
    if (/english/i.test(language)) return 'I have the essential brief ✅ I will summarize it now. If it is correct, we move directly to Namaa Design.';
    return 'J’ai les infos essentielles ✅ Je résume maintenant. Si c’est correct, on passe directement à Namaa Design.';
  }

  if (isDarijaLatin(language) || isArabicLanguage(language)) {
    return `مزيان، غادي ناخد غير الضروري بلا صداع 💡\n${firstQuestion ? firstQuestion : 'وصف ليا المشروع ف جوج سطور: شنو كيدير وشنو غادي يقدم للناس؟'}`;
  }
  if (/english/i.test(language)) {
    return `Good, I only need the essentials 💡\n${firstQuestion ? firstQuestion : 'Describe the project in two lines: what does it do and what does it offer?'}`;
  }
  return `Très bien, je prends seulement l’essentiel 💡\n${firstQuestion ? firstQuestion : 'Décrivez le projet en deux lignes : que fait-il et quelle offre propose-t-il ?'}`;
}
