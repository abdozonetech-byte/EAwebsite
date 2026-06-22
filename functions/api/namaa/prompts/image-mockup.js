import { formatBrief } from './_prompt-utils.js';

export function buildImageMockupPrompt({ userPrompt = '', aspectRatio = '16:9', brief = {}, pack = {} } = {}) {
  const assets = Array.isArray(pack.assets) ? pack.assets.join(', ') : '';
  const visuals = Array.isArray(pack.visuals) ? pack.visuals.join(', ') : '';
  return `
Create ONE premium presentation-board mockup image for a Moroccan business/startup project.

User request:
${userPrompt}

Structured project brief:
${formatBrief(brief)}

Detected creative pack:
- Category: ${pack.label || 'Business project'}
- Primary asset: ${pack.primaryAsset || 'Professional mockup board'}
- Logo direction: ${pack.logoIdea || 'Modern, readable, premium logo concept'}
- Visual style: ${pack.style || 'Clean premium UI/UX with strong hierarchy'}
- Assets to show together in the board: ${assets || 'Logo, landing page preview, social post, mockup cards'}
- Visual ingredients: ${visuals || 'business cards, website screens, CTA cards'}

Design rules:
- Create a single clean mockup board, not a final client deliverable.
- Include a logo concept plus the correct mockups for the project category.
- SaaS/app: show desktop dashboard and mobile app screens.
- Restaurant: show menu, flyer and storefront/roll-up feel.
- Clinic: show appointment landing page, trust cards and booking CTA.
- Ecommerce: show product page, ad creative and packaging/order visual.
- Service/agency: show landing page, social/LinkedIn asset and proposal/case card.
- Use premium SaaS/agency-quality composition, realistic devices or print mockups where relevant.
- Modern Moroccan business market, clean blue/white visual system with category-appropriate accent.
- Keep text minimal and readable. Avoid tiny unreadable paragraphs.
- Business-safe only: no political content, adult content, weapons, drugs or gambling.
- Aspect ratio: ${aspectRatio}.
`.trim();
}
