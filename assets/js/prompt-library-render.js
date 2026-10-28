import {registryFor,libraryBase} from '../data/prompt-locales.js?v=20261028-en1';
import {text} from './prompt-library-i18n.js?v=20261028-en1';
import { escapeHTML as e } from './prompt-library-core.js?v=20261028-en1';
export const categoryName = (id,language='en') => registryFor(language).categories.find(c=>c.id===id)?.label||id;
export const favoriteButton = (p,saved=false,language='en') => `<button type="button" class="pl-favorite" data-favorite="${p.id}" aria-pressed="${saved}" aria-label="${language==='fr'?(saved?'Retirer des favoris :':'Ajouter aux favoris :'):(saved?'Remove from favourites:':'Add to favourites:')} ${e(p.title)}"><span aria-hidden="true">${saved?'★':'☆'}</span></button>`;
export function card(p,saved=false,returnQuery='',language='en') {
  const {models,levels}=registryFor(language),base=libraryBase(language),t=value=>text(value,language);
  const href=`${base}${p.slug}/${returnQuery?'?from='+encodeURIComponent(base+returnQuery):''}`;
  return `<article class="pl-card">
  <div class="pl-card-top"><span class="pl-category">${e(categoryName(p.category,language))}</span>${favoriteButton(p,saved,language)}</div>
  <h3><a href="${e(href)}">${e(p.title)}</a></h3>
  <p class="pl-description">${e(p.description)}</p>
  <div class="pl-tags">${p.tags.map(tag=>`<span>${e(tag)}</span>`).join('')}</div>
  <div class="pl-preview"><span class="pl-small-label">01 / Prompt</span><p>${e(p.promptPreview||p.prompt)}</p></div>
  <div class="pl-example-preview"><span class="pl-small-label">${t("02 / Exemple illustratif")}</span><p>${e(p.examplePreview||p.exampleResult.split('\n\n').slice(0,2).join(' '))}</p></div>
  <div class="pl-card-meta">${e(levels[p.difficulty])} <span aria-hidden="true">·</span> ${p.compatibleModels.filter(m=>m!=='general').map(m=>e(models[m])).join(' · ')||t('IA généraliste')}</div>
  <div class="pl-card-actions"><button type="button" class="pl-button pl-primary" data-copy="${p.id}">${t("Copier le prompt")}</button><a class="pl-text-link" href="${e(href)}#pl-example-heading">${t("Voir l’exemple ↗")}</a><a class="pl-text-link" href="${e(href)}">${t("Détails")}</a></div>
  </article>`;
}
