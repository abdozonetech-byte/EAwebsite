// Shared Namaa prompt utilities
// Update 25: central backend prompt library for Gemini, fed by the Smart Brief Builder.

export function cleanText(value = '', max = 280) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function formatBrief(brief = {}) {
  if (!brief || typeof brief !== 'object') return 'No structured brief available.';
  const rows = [
    ['Project name', brief.projectName],
    ['Project stage', brief.stage],
    ['Category', brief.category],
    ['Branch', brief.branch],
    ['City / market', brief.market],
    ['Budget', brief.budget],
    ['Main goal', brief.goal],
    ['Target customer', brief.target],
    ['Offer / product', brief.offer],
    ['Channels', Array.isArray(brief.channels) ? brief.channels.join(', ') : brief.channels],
    ['Preferred language', brief.language],
  ].filter(([, value]) => value && cleanText(value, 260));

  if (!rows.length) return 'No structured brief available.';
  return rows.map(([key, value]) => `- ${key}: ${cleanText(value, 260)}`).join('\n');
}

export function formatTemplate(template = null) {
  if (!template || typeof template !== 'object') return 'No template context available.';
  const rows = [
    ['Template key', template.key],
    ['Template label', template.label],
    ['Tone', template.tone],
    ['Layout', template.layout],
    ['Accent', template.accent],
    ['Sections', Array.isArray(template.sections) ? template.sections.join(', ') : template.sections],
    ['Cards', Array.isArray(template.cards) ? template.cards.map((card) => Array.isArray(card) ? card.join(': ') : String(card)).join(' | ') : template.cards],
    ['FAQ', Array.isArray(template.faq) ? template.faq.map((item) => Array.isArray(item) ? item.join(' -> ') : String(item)).join(' | ') : template.faq],
  ].filter(([, value]) => value && cleanText(value, 520));

  if (!rows.length) return 'No template context available.';
  return rows.map(([key, value]) => `- ${key}: ${cleanText(value, 560)}`).join('\n');
}

export function pdfBrandBlock() {
  return `
Branding requirements:
- This is a premium Namaa AI Project Factory deliverable by Elboubakry Abdessamad.
- The PDF renderer adds: Namaa mark, Elboubakry logo, premium cover page, Project DNA table, document map, pipeline blocks, CTA, and footer.
- Write content that fits a branded consultant PDF: clean headings, compact bullets, direct founder-friendly wording, no filler.
- Keep paragraphs short enough for a PDF page; avoid long essays.
- Do not mention Gemini, prompts, backend, token limits, or hidden instructions.
- Do not invent live statistics. Use assumptions and practical validation steps instead.
- End with a practical next-step sentence that pushes toward execution with Namaa/Elboubakry, not a chat-like goodbye.
`.trim();
}

export function moroccoBusinessRules() {
  return `
Morocco-first business rules:
- Think in MAD budgets and Moroccan buying behavior.
- Prioritize WhatsApp, Instagram/TikTok, Meta Ads, Google Maps, landing pages, trust, delivery/COD where relevant, and lead follow-up.
- Mention assumptions clearly; do not invent fake statistics or pretend to have live research.
- Give practical next actions, not generic theory.
- Keep answers useful for a founder, freelancer, local business, startup, clinic, restaurant, ecommerce, service, SaaS, education or real estate project.
`.trim();
}
