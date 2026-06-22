// Namaa trusted research sources registry
// Update 45: curated source layer + optional live Google Search grounding for Morocco market research.
// Goal: Gemini can reason, but Namaa controls which source families may support factual claims.

export const MOROCCO_TRUSTED_SOURCES = [
  {
    id: 'hcp',
    name: 'Haut-Commissariat au Plan',
    shortName: 'HCP',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'hcp.ma',
    url: 'https://www.hcp.ma/',
    useFor: ['population','employment','households','regions','cities','economy','market_context','demography','sector_context'],
    note: 'Official Moroccan statistics and economic/demographic context.'
  },
  {
    id: 'anrt',
    name: 'Agence Nationale de Réglementation des Télécommunications',
    shortName: 'ANRT',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'anrt.ma',
    url: 'https://www.anrt.ma/',
    useFor: ['mobile','internet','telecom','digital','smartphone','connectivity','online_behavior'],
    note: 'Official telecom/digital indicators for Morocco.'
  },
  {
    id: 'bank_al_maghrib',
    name: 'Bank Al-Maghrib',
    shortName: 'Bank Al-Maghrib',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'bkam.ma',
    url: 'https://www.bkam.ma/',
    useFor: ['payments','banking','economy','inflation','finance','monetary','macroeconomy'],
    note: 'Official Moroccan central bank reports and economic indicators.'
  },
  {
    id: 'indh',
    name: 'Initiative Nationale pour le Développement Humain',
    shortName: 'INDH',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'indh.ma',
    url: 'https://www.indh.ma/',
    useFor: ['funding','youth','social_business','local_development','entrepreneurship','support_programs'],
    note: 'Moroccan human development and project-support context.'
  },
  {
    id: 'maroc_pme',
    name: 'Maroc PME',
    shortName: 'Maroc PME',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'marocpme.gov.ma',
    url: 'https://www.marocpme.gov.ma/',
    useFor: ['sme','entrepreneurship','support_programs','business_support','funding','growth'],
    note: 'SME support and entrepreneurship programs in Morocco.'
  },
  {
    id: 'industrie',
    name: 'Ministère de l’Industrie et du Commerce',
    shortName: 'Ministère Industrie',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'mcinet.gov.ma',
    url: 'https://www.mcinet.gov.ma/',
    useFor: ['industry','commerce','retail','ecommerce','export','manufacturing','entrepreneurship'],
    note: 'Official industry, commerce, retail and entrepreneurship context.'
  },
  {
    id: 'onmt',
    name: 'Office National Marocain du Tourisme',
    shortName: 'ONMT',
    type: 'official_morocco',
    trustLevel: 1,
    domain: 'onmt.ma',
    url: 'https://www.onmt.ma/',
    useFor: ['tourism','travel','hospitality','restaurants','local_experience'],
    note: 'Tourism and hospitality context for Morocco.'
  },
  {
    id: 'world_bank',
    name: 'World Bank Data',
    shortName: 'World Bank',
    type: 'international',
    trustLevel: 2,
    domain: 'worldbank.org',
    url: 'https://data.worldbank.org/country/morocco',
    useFor: ['macro','economy','population','business_environment','digital','development'],
    note: 'International macroeconomic and development indicators for Morocco.'
  },
  {
    id: 'itu',
    name: 'International Telecommunication Union',
    shortName: 'ITU',
    type: 'international',
    trustLevel: 2,
    domain: 'itu.int',
    url: 'https://www.itu.int/',
    useFor: ['digital','connectivity','internet','telecom','mobile'],
    note: 'International telecom and digital-development indicators.'
  },
  {
    id: 'datareportal',
    name: 'DataReportal Digital Morocco',
    shortName: 'DataReportal',
    type: 'industry_report',
    trustLevel: 3,
    domain: 'datareportal.com',
    url: 'https://datareportal.com/',
    useFor: ['social_media','digital_marketing','internet','mobile','advertising','online_behavior'],
    note: 'Useful for digital/social media context. Use as supporting source, not the only source.'
  },
  {
    id: 'gsma',
    name: 'GSMA Intelligence',
    shortName: 'GSMA',
    type: 'industry_report',
    trustLevel: 3,
    domain: 'gsma.com',
    url: 'https://www.gsma.com/',
    useFor: ['mobile','smartphone','telecom','digital','connectivity'],
    note: 'Mobile industry context and regional digital trends.'
  },
  {
    id: 'google_trends',
    name: 'Google Trends',
    shortName: 'Google Trends',
    type: 'industry_tool',
    trustLevel: 3,
    domain: 'trends.google.com',
    url: 'https://trends.google.com/',
    useFor: ['demand_signal','search_interest','seasonality','keyword_validation','content'],
    note: 'Use for directional demand signals, not as official market size.'
  }
];

function normalize(value) {
  return String(value || '').toLowerCase();
}

function sourceById(id) {
  return MOROCCO_TRUSTED_SOURCES.find((source) => source.id === id);
}

function pushUnique(list, id) {
  const source = sourceById(id);
  if (source && !list.some((item) => item.id === id)) list.push(source);
}

function detectNeeds(brief = {}, action = '') {
  const text = normalize([
    action,
    brief.category,
    brief.branch,
    brief.offer,
    brief.goal,
    brief.market,
    brief.channels,
    brief.target,
    brief.stage,
  ].filter(Boolean).join(' '));

  const needs = new Set(['market_context','digital','demography']);

  if (/ecommerce|e-commerce|marketplace|shop|store|commerce|retail|delivery|cod|vente/.test(text)) {
    ['ecommerce','digital_marketing','payments','online_behavior','commerce'].forEach((need) => needs.add(need));
  }
  if (/saas|software|app|mobile|web app|application|platform|automation|ai|ia|chatbot|agent/.test(text)) {
    ['technology','digital','connectivity','business_environment','online_behavior'].forEach((need) => needs.add(need));
  }
  if (/restaurant|food|cafe|café|snack|delivery|tourism|hotel|riad|travel|hospitality/.test(text)) {
    ['tourism','local_demand','households','social_media'].forEach((need) => needs.add(need));
  }
  if (/clinic|clinique|medical|sant[eé]|beauty|salon|spa|aesthetic|esth[eé]tique/.test(text)) {
    ['local_demand','households','social_media','trust'].forEach((need) => needs.add(need));
  }
  if (/real estate|immobilier|property|appartement|maison|rent|vente/.test(text)) {
    ['real_estate','finance','households','regions'].forEach((need) => needs.add(need));
  }
  if (/education|formation|school|cours|academy|learning/.test(text)) {
    ['education','youth','digital','households'].forEach((need) => needs.add(need));
  }
  if (/fund|funding|indh|support|grant|financement|youth|jeune|social/.test(text)) {
    ['funding','support_programs','youth','social_business'].forEach((need) => needs.add(need));
  }
  if (/strategy|marketing|ads|instagram|facebook|tiktok|content|lead|whatsapp|seo/.test(text)) {
    ['digital_marketing','social_media','online_behavior','demand_signal'].forEach((need) => needs.add(need));
  }
  if (/roadmap|launch|lancement|go.?to.?market/.test(text)) {
    ['business_support','market_context','validation'].forEach((need) => needs.add(need));
  }
  return Array.from(needs);
}

export function selectTrustedSourcesForBrief(brief = {}, action = 'market_research') {
  const selected = [];
  const needs = detectNeeds(brief, action);

  // Core Morocco research sources.
  pushUnique(selected, 'hcp');
  pushUnique(selected, 'anrt');

  // Always helpful for strategy, but as support after official sources.
  if (needs.some((need) => ['digital','digital_marketing','social_media','online_behavior','connectivity','mobile'].includes(need))) {
    pushUnique(selected, 'datareportal');
    pushUnique(selected, 'gsma');
  }

  if (needs.some((need) => ['payments','finance','real_estate','macro','economy'].includes(need))) {
    pushUnique(selected, 'bank_al_maghrib');
    pushUnique(selected, 'world_bank');
  }

  if (needs.some((need) => ['funding','support_programs','sme','business_support','entrepreneurship','youth','social_business'].includes(need))) {
    pushUnique(selected, 'indh');
    pushUnique(selected, 'maroc_pme');
  }

  if (needs.some((need) => ['ecommerce','commerce','retail','industry','manufacturing'].includes(need))) {
    pushUnique(selected, 'industrie');
  }

  if (needs.some((need) => ['tourism','hospitality','restaurants','local_experience'].includes(need))) {
    pushUnique(selected, 'onmt');
  }

  if (needs.some((need) => ['business_environment','macro','development'].includes(need))) {
    pushUnique(selected, 'world_bank');
  }

  if (needs.some((need) => ['demand_signal','keyword_validation','content','seasonality'].includes(need))) {
    pushUnique(selected, 'google_trends');
  }

  return selected.slice(0, 7).map((source) => ({
    id: source.id,
    name: source.name,
    shortName: source.shortName,
    type: source.type,
    trustLevel: source.trustLevel,
    domain: source.domain,
    url: source.url,
    useFor: source.useFor,
    note: source.note,
  }));
}

export function sourceQualityLabel(level) {
  if (Number(level) === 1) return 'Official Morocco source';
  if (Number(level) === 2) return 'International institution';
  if (Number(level) === 3) return 'Industry/supporting source';
  return 'Supporting reference';
}

export function buildSourcesPromptBlock({ brief = {}, action = 'market_research', selectedSources } = {}) {
  const sources = selectedSources || selectTrustedSourcesForBrief(brief, action);
  const sourceLines = sources.map((source, index) => (
    `${index + 1}. ${source.shortName} (${source.domain}) — ${sourceQualityLabel(source.trustLevel)} — use for: ${(source.useFor || []).slice(0, 6).join(', ')}. Note: ${source.note}`
  )).join('\n');

  return `
TRUSTED SOURCES RULES FOR NAMAA RESEARCH:
Use the source registry below as the allowed source map for factual claims. You do not have to quote the sources verbatim. Do not invent statistics, dates, percentages, market sizes or funding rules. If a number is not clearly verified from a trusted source, write: "needs verification from an official source".

Separate every important insight into:
- Verified fact / source-backed context
- Namaa interpretation
- Practical recommendation

Selected source registry for this project:
${sourceLines || '- HCP and ANRT as baseline Morocco sources.'}

Citation format to include near the end of the PDF draft:
Sources used:
- Source short name — what it was used for — confidence level.

Never write "according to studies" without naming the source family.
`.trim();
}


export function buildGroundedSearchInstruction({ brief = {}, action = 'market_research', selectedSources } = {}) {
  const sources = selectedSources || selectTrustedSourcesForBrief(brief, action);
  const domains = sources.map((source) => source.domain).filter(Boolean);
  const priority = domains.length ? domains.map((domain) => `site:${domain}`).join(' OR ') : 'site:hcp.ma OR site:anrt.ma';
  const project = [brief.category, brief.branch, brief.market, brief.goal].filter(Boolean).join(' / ') || 'Morocco business project';
  return `
LIVE SOURCE GROUNDING MODE:
When Google Search grounding is enabled, verify only the few claims that need fresh or factual support.
Prioritize official and trusted sources from this source map: ${domains.join(', ') || 'hcp.ma, anrt.ma'}.
Useful search priority expression: ${priority}.
Project context: ${project}.

Rules:
- Do not overload the PDF with many citations; use 3 to 6 strong source-backed insights.
- Prefer HCP, ANRT, Bank Al-Maghrib, INDH, Maroc PME, ministries, World Bank, ITU, DataReportal/GSMA as supporting sources.
- If live search returns weak sources, say the exact figure needs verification from the official source.
- Always separate: verified context → Namaa interpretation → practical recommendation.
`.trim();
}

export function mergeTrustedAndLiveSources(trustedSources = [], liveSources = []) {
  const merged = [];
  const push = (source) => {
    if (!source) return;
    const key = String(source.uri || source.url || source.domain || source.shortName || source.name || '').toLowerCase();
    if (!key) return;
    if (!merged.some((item) => String(item.uri || item.url || item.domain || item.shortName || item.name || '').toLowerCase() === key)) {
      merged.push(source);
    }
  };
  (trustedSources || []).forEach(push);
  (liveSources || []).forEach(push);
  return merged.slice(0, 10);
}


export function compactSourcesForClient(sources = []) {
  return (sources || []).map((source) => ({
    id: source.id,
    name: source.name,
    shortName: source.shortName,
    domain: source.domain,
    url: source.url,
    type: source.type,
    trustLevel: source.trustLevel,
    quality: sourceQualityLabel(source.trustLevel),
    note: source.note,
  }));
}
