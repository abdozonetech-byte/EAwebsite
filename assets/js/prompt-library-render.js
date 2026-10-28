import { categories, models, levels } from '../data/prompt-registry.js?v=20261027-2';
import { escapeHTML as e } from './prompt-library-core.js?v=20261027-2';
export const categoryName = id => categories.find(c=>c.id===id)?.label||id;
export const favoriteButton = (p,saved=false) => `<button type="button" class="pl-favorite" data-favorite="${p.id}" aria-pressed="${saved}" aria-label="${saved?'Retirer des':'Ajouter aux'} favoris : ${e(p.title)}"><span aria-hidden="true">${saved?'★':'☆'}</span></button>`;
export function card(p,saved=false,returnQuery='') {
  const href=`/prompts/${p.slug}/${returnQuery?'?from='+encodeURIComponent('/prompts/'+returnQuery):''}`;
  return `<article class="pl-card">
  <div class="pl-card-top"><span class="pl-category">${e(categoryName(p.category))}</span>${favoriteButton(p,saved)}</div>
  <h3><a href="${e(href)}">${e(p.title)}</a></h3>
  <p class="pl-description">${e(p.description)}</p>
  <div class="pl-tags">${p.tags.map(tag=>`<span>${e(tag)}</span>`).join('')}</div>
  <div class="pl-preview"><span class="pl-small-label">01 / Prompt</span><p>${e(p.promptPreview||p.prompt)}</p></div>
  <div class="pl-example-preview"><span class="pl-small-label">02 / Exemple illustratif</span><p>${e(p.examplePreview||p.exampleResult.split('\n\n').slice(0,2).join(' '))}</p></div>
  <div class="pl-card-meta">${e(levels[p.difficulty])} <span aria-hidden="true">·</span> ${p.compatibleModels.filter(m=>m!=='general').map(m=>e(models[m])).join(' · ')||'IA généraliste'}</div>
  <div class="pl-card-actions"><button type="button" class="pl-button pl-primary" data-copy="${p.id}">Copier le prompt</button><a class="pl-text-link" href="${e(href)}#pl-example-heading">Voir l’exemple ↗</a><a class="pl-text-link" href="${e(href)}">Détails</a></div>
  </article>`;
}
