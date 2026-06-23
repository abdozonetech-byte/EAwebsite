import {
  NAMAA_API_CONFIG,
  callGeminiImage,
  getModel,
  getSecret,
  jsonResponse,
  publicRouteStatus,
  optionsResponse,
  readJson,
  safeText,
} from './_api-config.js';

import { buildImageMockupPrompt } from './prompts/index.js';

const ALLOWED_SCOPE = [
  'business', 'startup', 'marketing', 'landing page', 'website', 'ads', 'restaurant', 'clinic',
  'ecommerce', 'e-commerce', 'service', 'brand', 'product', 'whatsapp', 'leads', 'morocco',
  'maroc', 'casablanca', 'rabat', 'marrakech', 'agadir', 'tanger', 'fes', 'kenitra', 'startup maroc',
  'projet', 'business maroc', 'mockup', 'visual', 'design', 'hero section', 'poster', 'social media',
  'saas', 'application', 'mobile app', 'dashboard', 'flyer', 'roll up', 'roll-up', 'logo', 'packaging',
  'education', 'formation', 'immobilier', 'real estate', 'beauty', 'beauté', 'tourisme', 'riad', 'hotel'
];

const PACKS = {
  saas: {
    label: 'SaaS / Application',
    ratio: '16:9',
    primaryAsset: 'Desktop dashboard + mobile app mockup',
    logoIdea: 'Abstract app icon, modern blue/cyan gradient, strong tech identity',
    style: 'Premium tech UI, dashboard cards, mobile app, workflow visualization',
    assets: ['Logo concept', 'Desktop dashboard', 'Mobile app mockup', 'Landing page hero', 'Pitch deck cover', 'LinkedIn launch post'],
    visuals: ['dashboard metrics', 'phone screen', 'workflow nodes', 'SaaS hero section'],
  },
  restaurant: {
    label: 'Restaurant / Food',
    ratio: '4:5',
    primaryAsset: 'Menu + flyer + storefront/roll-up pack',
    logoIdea: 'Readable warm food mark suitable for signage and social media',
    style: 'Warm appetizing premium, local trust, menu cards and reservation CTA',
    assets: ['Logo concept', 'Menu cover', 'Instagram post', 'Flyer offer', 'Roll-up / storefront', 'Landing hero'],
    visuals: ['signature dish', 'menu cards', 'map pin', 'WhatsApp reservation'],
  },
  ecommerce: {
    label: 'E-commerce Maroc',
    ratio: '4:5',
    primaryAsset: 'Product page + ad + packaging mockup',
    logoIdea: 'Minimal commerce brand mark, packaging-friendly and memorable',
    style: 'Conversion-focused product visuals, COD trust, social ads and packaging',
    assets: ['Logo concept', 'Product landing page', 'Packaging mockup', 'Instagram ad', 'Product card', 'WhatsApp order visual'],
    visuals: ['hero product', 'delivery badge', 'price card', 'social proof'],
  },
  clinic: {
    label: 'Clinic / Medical',
    ratio: '16:9',
    primaryAsset: 'Appointment landing page + trust ad',
    logoIdea: 'Soft medical monogram with calm blue trust style',
    style: 'Clean medical premium, appointment flow, trust badges and FAQ feel',
    assets: ['Logo concept', 'Appointment landing page', 'Service cards', 'Instagram trust ad', 'Before/after placeholder', 'WhatsApp booking visual'],
    visuals: ['clinic UI cards', 'booking form', 'trust badges', 'service grid'],
  },
  agency: {
    label: 'Agency / Service Pro',
    ratio: '16:9',
    primaryAsset: 'Agency landing page + LinkedIn carousel cover',
    logoIdea: 'Strong consulting wordmark or badge, premium blue authority',
    style: 'B2B premium, strategic, process-based, analytics and case-study feel',
    assets: ['Logo concept', 'Landing page hero', 'Service cards', 'LinkedIn cover', 'Case study card', 'Proposal cover'],
    visuals: ['process steps', 'consultant card', 'analytics panel', 'CTA section'],
  },
  local_service: {
    label: 'Service local',
    ratio: '4:5',
    primaryAsset: 'Local service landing page + flyer',
    logoIdea: 'Reliable local icon, clean service badge, clear name readability',
    style: 'Trust-first local service, booking focused, before/after and proof',
    assets: ['Logo concept', 'Service flyer', 'Booking landing page', 'Google Maps card', 'WhatsApp CTA', 'Before/after card'],
    visuals: ['service checklist', 'local map', 'team card', 'trust badge'],
  },
  education: {
    label: 'Education / Formation',
    ratio: '16:9',
    primaryAsset: 'Course landing page + certificate/social pack',
    logoIdea: 'Modern education mark, simple symbol, trust and certification feel',
    style: 'Clean learning brand, module cards, credibility and enrollment CTA',
    assets: ['Logo concept', 'Course landing page', 'Program cards', 'Certificate preview', 'Instagram course post', 'Enrollment CTA'],
    visuals: ['course modules', 'student success card', 'certificate', 'lesson grid'],
  },
  real_estate: {
    label: 'Immobilier',
    ratio: '16:9',
    primaryAsset: 'Property landing page + brochure/flyer',
    logoIdea: 'Elegant real estate monogram, premium signage-ready identity',
    style: 'Premium property visuals, location, appointment and trust',
    assets: ['Logo concept', 'Property landing page', 'Brochure cover', 'Listing card', 'Roll-up / office poster', 'WhatsApp appointment visual'],
    visuals: ['property cards', 'map area', 'price band', 'visit CTA'],
  },
  beauty: {
    label: 'Beauté / Lifestyle',
    ratio: '4:5',
    primaryAsset: 'Beauty brand social pack + booking page',
    logoIdea: 'Elegant monogram, soft premium, salon/signage ready',
    style: 'Soft premium beauty identity, booking, service menu and social-first visuals',
    assets: ['Logo concept', 'Instagram post', 'Booking landing page', 'Service price card', 'Story ad', 'Roll-up salon'],
    visuals: ['service cards', 'before/after placeholder', 'booking CTA', 'soft product scene'],
  },
  tourism: {
    label: 'Tourisme / Hébergement',
    ratio: '16:9',
    primaryAsset: 'Booking landing page + travel flyer',
    logoIdea: 'Travel mark with subtle Moroccan premium touch',
    style: 'Warm travel premium, experience storytelling, booking focused',
    assets: ['Logo concept', 'Booking landing page', 'Experience cards', 'Travel flyer', 'Instagram carousel', 'Map/location card'],
    visuals: ['riad cards', 'experience tiles', 'booking calendar', 'location map'],
  },
  ai_business: {
    label: 'AI Business / Automation',
    ratio: '16:9',
    primaryAsset: 'AI agent dashboard + workflow mockup',
    logoIdea: 'Simple AI mark, blue/cyan, app icon and SaaS identity ready',
    style: 'AI product workspace, workflow, agent interface and B2B trust',
    assets: ['Logo concept', 'AI dashboard mockup', 'Workflow graphic', 'Landing hero', 'LinkedIn post', 'Demo CTA visual'],
    visuals: ['chat agent card', 'workflow nodes', 'ROI metrics', 'automation panel'],
  },
  generic: {
    label: 'Business Maroc',
    ratio: '16:9',
    primaryAsset: 'Landing page + social creative + logo concept',
    logoIdea: 'Simple professional mark, blue trust, Moroccan business ready',
    style: 'Clean business factory board, landing page, offer card and WhatsApp CTA',
    assets: ['Logo concept', 'Landing page mockup', 'Social post', 'Offer card', 'WhatsApp CTA', 'Brand mini-board'],
    visuals: ['hero layout', 'proof cards', 'CTA section', 'brand board'],
  },
};


function enrichPack(key, pack = {}) {
  const specs = {
    saas: { logoStage: 'App icon + wordmark', brandStage: 'Blue/cyan tech tokens', mockupStage: 'Desktop dashboard + mobile app', launchStage: 'Pitch cover + LinkedIn launch', outputs: ['Logo lockup','Desktop dashboard','Mobile app screen','Landing hero','Pitch cover'], downloadNote: 'Preview only: SaaS logo, dashboard and app mockups are shown for validation before final export.' },
    restaurant: { logoStage: 'Signage-ready food mark', brandStage: 'Warm food palette + menu typography', mockupStage: 'Menu, flyer and roll-up', launchStage: 'Instagram offer + WhatsApp reservation', outputs: ['Logo lockup','Menu cover','Flyer','Roll-up/storefront','Instagram post'], downloadNote: 'Preview only: restaurant menu, flyer and signage direction are generated before final export.' },
    ecommerce: { logoStage: 'Packaging-friendly commerce mark', brandStage: 'Product colors + COD trust badges', mockupStage: 'Product page, packaging and ad', launchStage: 'WhatsApp order + social proof', outputs: ['Logo lockup','Product page','Packaging','Ad creative','Order card'], downloadNote: 'Preview only: ecommerce product page, packaging and ad direction are generated together.' },
    clinic: { logoStage: 'Medical trust monogram', brandStage: 'Calm medical blue/white system', mockupStage: 'Appointment page + trust ad', launchStage: 'Booking CTA + FAQ trust visual', outputs: ['Logo lockup','Appointment page','Trust ad','Service cards','Booking visual'], downloadNote: 'Preview only: clinic visuals stay trust-focused and business-safe, without medical claims.' },
    agency: { logoStage: 'Consulting wordmark/badge', brandStage: 'Authority blue + case-study style', mockupStage: 'Landing page + LinkedIn carousel', launchStage: 'Proposal cover + diagnostic CTA', outputs: ['Logo lockup','Landing hero','Service cards','LinkedIn cover','Proposal cover'], downloadNote: 'Preview only: service, proposal and LinkedIn assets are aligned before final export.' },
    local_service: { logoStage: 'Reliable local service badge', brandStage: 'Trust palette + booking UI', mockupStage: 'Flyer + Google Maps + WhatsApp CTA', launchStage: 'Before/after proof card', outputs: ['Logo lockup','Service flyer','Booking page','Map card','WhatsApp visual'], downloadNote: 'Preview only: local booking and proof assets appear in one validation board.' },
    education: { logoStage: 'Education trust symbol', brandStage: 'Learning palette + module cards', mockupStage: 'Course page + certificate', launchStage: 'Enrollment post + program CTA', outputs: ['Logo lockup','Course page','Certificate','Program cards','Enrollment post'], downloadNote: 'Preview only: course and certificate assets are shown as concept direction.' },
    real_estate: { logoStage: 'Premium property monogram', brandStage: 'Elegant real-estate palette', mockupStage: 'Property page + brochure', launchStage: 'Visit booking + listing cards', outputs: ['Logo lockup','Property page','Brochure','Listing card','Visit CTA'], downloadNote: 'Preview only: property and visit assets are generated as concept mockups.' },
    beauty: { logoStage: 'Elegant salon monogram', brandStage: 'Soft premium lifestyle palette', mockupStage: 'Social pack + booking page', launchStage: 'Story ad + service price card', outputs: ['Logo lockup','Instagram post','Booking page','Story ad','Price card'], downloadNote: 'Preview only: social and booking assets are previewed before final brand export.' },
    tourism: { logoStage: 'Travel mark with Moroccan touch', brandStage: 'Warm hospitality palette', mockupStage: 'Booking page + travel flyer', launchStage: 'Experience carousel + location card', outputs: ['Logo lockup','Booking page','Travel flyer','Experience cards','Map card'], downloadNote: 'Preview only: booking and experience assets are shown as one premium board.' },
    ai_business: { logoStage: 'AI app icon + agent mark', brandStage: 'Cyan/blue workflow identity', mockupStage: 'AI agent dashboard + workflow', launchStage: 'Demo CTA + LinkedIn post', outputs: ['Logo lockup','AI dashboard','Workflow graphic','Landing hero','Demo CTA'], downloadNote: 'Preview only: AI agent UI and workflow graphics are generated as mockup direction.' },
    generic: { logoStage: 'Clean business mark', brandStage: 'Blue trust identity', mockupStage: 'Landing page + social creative', launchStage: 'Offer card + WhatsApp CTA', outputs: ['Logo lockup','Landing page','Social post','Offer card','WhatsApp CTA'], downloadNote: 'Preview only: logo, landing and social assets are prepared as concept direction.' },
  };
  const spec = specs[key] || specs.generic;
  return {
    key,
    ...pack,
    assetFlow: ['Logo first','Brand board','Category mockups','Launch visuals'],
    stages: [spec.logoStage, spec.brandStage, spec.mockupStage, spec.launchStage],
    outputs: spec.outputs,
    downloadNote: spec.downloadNote,
    logoPrompt: `Generate a clear, memorable logo concept before any mockup: ${spec.logoStage}. Keep it readable and suitable for website, social media and print.`
  };
}

function formatBrief(brief = {}) {
  if (!brief || typeof brief !== 'object') return '';
  const rows = [
    ['Nom', brief.projectName], ['Étape', brief.stage], ['Type', brief.category], ['Branche', brief.branch],
    ['Marché', brief.market], ['Budget', brief.budget], ['Objectif', brief.goal],
    ['Cible', brief.target], ['Offre', brief.offer],
    ['Canaux', Array.isArray(brief.channels) ? brief.channels.join(', ') : brief.channels],
    ['Langue', brief.language],
  ].filter((row) => row[1]);
  return rows.map(([key, value]) => `${key}: ${String(value).replace(/\s+/g, ' ').trim().slice(0, 220)}`).join('\n');
}

function briefText(brief) {
  if (!brief || typeof brief !== 'object') return '';
  return Object.values(brief).flat().join(' ');
}

function detectPack(prompt, brief = null, requestedPack = null) {
  if (requestedPack?.key && PACKS[requestedPack.key]) {
    return enrichPack(requestedPack.key, PACKS[requestedPack.key]);
  }
  const value = `${prompt || ''} ${briefText(brief)}`.toLowerCase();
  if (/saas|application|mobile app|dashboard|marketplace|software|logiciel|\bapp\b/.test(value)) return enrichPack('saas', PACKS.saas);
  if (/restaurant|café|cafe|food|snack|pâtisserie|traiteur|dark kitchen|food truck/.test(value)) return enrichPack('restaurant', PACKS.restaurant);
  if (/ecommerce|e-commerce|boutique|store|shop|product|produit|cod|packaging|cosmétique|vêtement/.test(value)) return enrichPack('ecommerce', PACKS.ecommerce);
  if (/clinique|clinic|dentiste|dermato|doctor|médecin|medecin|laboratoire|kiné|medical|santé|sante/.test(value)) return enrichPack('clinic', PACKS.clinic);
  if (/immobilier|real estate|airbnb|courtier|promotion immobilière/.test(value)) return enrichPack('real_estate', PACKS.real_estate);
  if (/formation|école|ecole|cours|coaching|edtech|centre de soutien/.test(value)) return enrichPack('education', PACKS.education);
  if (/barber|barbershop|beauté|beauty|spa|lifestyle|salon/.test(value)) return enrichPack('beauty', PACKS.beauty);
  if (/tourisme|riad|hôtel|hotel|voyage|travel|hébergement|hebergement/.test(value)) return enrichPack('tourism', PACKS.tourism);
  if (/nettoyage|déménagement|demenagement|réparation|maintenance|livraison|service local/.test(value)) return enrichPack('local_service', PACKS.local_service);
  if (/agence|agency|consulting|consultant|marketing digital|branding|design|photographie|video/.test(value)) return enrichPack('agency', PACKS.agency);
  if (/ai|ia|automation|automatisation|agent|chatbot/.test(value)) return enrichPack('ai_business', PACKS.ai_business);
  return enrichPack('generic', PACKS.generic);
}

function seemsInScope(prompt) {
  const value = String(prompt || '').toLowerCase();
  if (!value) return false;
  return ALLOWED_SCOPE.some((term) => value.includes(term)) || value.length <= 280;
}

function normalizeAspectRatio(value, pack) {
  const ratio = String(value || pack?.ratio || '').trim();
  const allowed = new Set(['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4', '21:9']);
  return allowed.has(ratio) ? ratio : '16:9';
}

function buildImagePrompt(userPrompt, aspectRatio, brief, pack) {
  return `
Create ONE premium presentation-board mockup image for a Moroccan business/startup project.

User request:
${userPrompt}

Structured project brief, if available:
${formatBrief(brief) || 'No structured brief'}

Detected creative pack:
- Category: ${pack.label}
- Primary asset: ${pack.primaryAsset}
- Logo direction: ${pack.logoIdea}
- Visual style: ${pack.style}
- Assets to show together in the board: ${pack.assets.join(', ')}
- Visual ingredients: ${pack.visuals.join(', ')}

Design goal:
- Create a single clean mockup board, not a finished client deliverable.
- Include logo concept + the right mockups for this category.
- If SaaS/app: show desktop dashboard and mobile app screens.
- If restaurant: show menu/flyer/storefront or roll-up feel.
- If clinic: show appointment landing page, trust cards and booking CTA.
- If ecommerce: show product page, ad creative and packaging/order visual.
- If service/agency: show landing page, social/LinkedIn asset and proposal/case card.
- Use premium SaaS/agency-quality UI/UX composition, strong hierarchy, realistic devices or print mockups where relevant.
- Modern Moroccan business market, clean blue/white visual system with category-appropriate accent.
- Keep text minimal and readable. Avoid tiny unreadable paragraphs.
- Business-safe only: no political content, adult content, weapons, drugs or gambling.
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
  const pack = detectPack(prompt, brief, body.pack);
  const aspectRatio = normalizeAspectRatio(body.aspectRatio || body.ratio || config.aspectRatio, pack);

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

  const imagePrompt = buildImageMockupPrompt({ userPrompt: prompt, aspectRatio, brief, pack });
  const result = await callGeminiImage({
    env: context.env,
    config,
    prompt: imagePrompt,
    aspectRatio,
  });

  if (!result.ok) {
    return jsonResponse({
      ok: true,
      route: 'namaa-images',
      connected: true,
      generated: false,
      fallback: 'local-mockup-panel',
      pack,
      aspectRatio,
      answer: `Namaa prepared a local ${pack.label} visual board while Nano Banana did not return a JPG yet.`,
      image: null,
    }, 200);
  }

  return jsonResponse({
    ok: true,
    route: 'namaa-images',
    connected: true,
    purpose: config.purpose,
    aspectRatio,
    pack,
    answer: result.text || `Namaa Images generated a ${pack.label} creative mockup pack.`,
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
  return jsonResponse(publicRouteStatus('namaa-images', hasSecret, { service: 'Namaa Design Images', purpose: config.purpose }));
}
