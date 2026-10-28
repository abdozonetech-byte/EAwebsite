import {registryFor,libraryBase} from '../data/prompt-locales.js?v=20261028-en1';
import { readState,stateQuery,filterPrompts,customize,readFavorites,saveFavorites,copyText,extractVariables,safeReturnPath } from './prompt-library-core.js?v=20261028-en1';
import { card,categoryName } from './prompt-library-render.js?v=20261028-en1';
const language=document.documentElement.lang==='fr'?'fr':'en',base=libraryBase(language),choose=(en,fr)=>language==='fr'?fr:en;
const {categories,models}=registryFor(language);
const {prompts}=await import('../data/prompt-index-'+language+'.js?v=20261028-en1');
const $=id=>document.getElementById(id),catalog=document.querySelector('[data-library]');
function syncLanguageLinks(){document.querySelectorAll('[data-pl-language-link]').forEach(link=>{const target=link.dataset.plLanguageLink,params=new URLSearchParams(location.search);if(target!==language)params.delete('tag');if(params.has('from')){const previous=safeReturnPath(params.get('from'),base),query=previous.includes('?')?previous.slice(previous.indexOf('?')):'';params.set('from',libraryBase(target)+query);}link.search=params.toString();});}
const menu=document.querySelector('[data-shell-menu]');function menuLabel(){if(menu&&language==='en')menu.setAttribute('aria-label',menu.getAttribute('aria-expanded')==='true'?'Close menu':'Open menu');}menuLabel();menu?.addEventListener('click',menuLabel);window.addEventListener('resize',menuLabel);
let storage;try{storage=window.localStorage;}catch{storage=null;}
let favorites=readFavorites(storage,prompts),state=readState(location.search,prompts),statusTimer;
function notify(text){clearTimeout(statusTimer);const node=$('pl-status');node.textContent=text;node.classList.add('is-visible');statusTimer=setTimeout(()=>node.classList.remove('is-visible'),5000);}
function syncFavorites(){document.querySelectorAll('[data-favorite]').forEach(button=>{const p=prompts.find(p=>p.id===button.dataset.favorite),saved=favorites.includes(p.id);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${choose(saved?'Remove from favourites:':'Add to favourites:',saved?'Retirer des favoris :':'Ajouter aux favoris :')} ${p.title}`);button.firstElementChild.textContent=saved?'★':'☆';});if($('pl-favorite-count'))$('pl-favorite-count').textContent=favorites.length;}
function syncControls(){
  $('pl-search').value=state.q;for(const key of ['model','level','tag','sort'])$(`pl-${key}`).value=state[key];
  document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===state.category)));
  $('pl-favorites').setAttribute('aria-pressed',String(state.fav));$('pl-clear-search').hidden=!state.q;
}
function render(updateURL=false){
  const found=filterPrompts(prompts,state,favorites,Object.fromEntries(categories.map(c=>[c.id,c.label])),models),size=8,pages=Math.max(1,Math.ceil(found.length/size));state.page=Math.min(state.page,pages);
  $('pl-grid').innerHTML=found.length?found.slice((state.page-1)*size,state.page*size).map(p=>card(p,favorites.includes(p.id),stateQuery(state),language)).join(''):`<div class="pl-empty"><h3>${state.fav?choose('No matching favourites.','Pas de favori correspondant.'):choose('No matching prompts.','Aucun prompt correspondant.')}</h3><p>${state.fav?choose('Save a prompt using its star, or broaden your filters.','Ajoutez un prompt avec l’étoile, ou élargissez vos filtres.'):choose('Try another keyword or remove a filter.','Essayez un autre mot-clé ou retirez un filtre.')}</p><button type="button" class="pl-button" data-reset>${choose('Show all prompts','Afficher tous les prompts')}</button></div>`;
  $('pl-catalog-title').textContent=state.fav?choose('Your favourites','Vos favoris'):state.category?categoryName(state.category,language):choose('All prompts','Tous les prompts');
  $('pl-results-count').textContent=`${found.length} ${choose('result','résultat')}${found.length!==1?'s':''} ${choose('from','sur')} ${prompts.length} prompts${pages>1?` · Page ${state.page}/${pages}`:''}`;
  $('pl-pagination').innerHTML=pages>1?`${state.page>1?`<button type="button" class="pl-button" data-page="${state.page-1}" aria-label="${choose('Previous page','Page précédente')}">← ${choose('Previous','Précédent')}</button>`:''}<label>Page <select id="pl-page-select" aria-label="${choose('Go to page','Aller à la page')}">${Array.from({length:pages},(_,i)=>`<option value="${i+1}"${i+1===state.page?' selected':''}>${i+1} / ${pages}</option>`).join('')}</select></label>${state.page<pages?`<button type="button" class="pl-button" data-page="${state.page+1}" aria-label="${choose('Next page','Page suivante')}">${choose('Next','Suivant')} →</button>`:''}`:'';
  syncControls();syncFavorites();if(updateURL)history.replaceState(null,'',location.pathname+stateQuery(state));syncLanguageLinks();
  document.querySelector('meta[name="robots"]').content=stateQuery(state)?'noindex, follow':'index, follow, max-image-preview:large';
}
async function copy(text,button){
  const done=await copyText(text,{clipboard:navigator.clipboard,document,restoreFocus:()=>button.focus({preventScroll:true})});
  if(done){notify(choose("Text copied. Review it before use.","Texte copié. Vérifiez-le avant utilisation."));button.classList.add('pl-copied');setTimeout(()=>button.classList.remove('pl-copied'),1400);}
  else{const dialog=$('pl-copy-dialog');$('pl-copy-fallback').value=text;dialog.showModal();$('pl-copy-fallback').focus();$('pl-copy-fallback').select();notify(choose("Automatic copying is unavailable. The text is ready for manual copy.","Copie automatique indisponible. Le texte est prêt pour une copie manuelle."));}
}
const detail=document.querySelector('[data-prompt-id]');
const original=detail?$('pl-original').textContent:'';
const prompt=detail?{...prompts.find(p=>p.id===detail.dataset.promptId),prompt:original,variables:extractVariables(original),exampleResult:JSON.parse($('pl-example-data').textContent)}:null;
const fullPromptCache=new Map();
async function fullPrompt(id){
  if(prompt?.id===id)return prompt;
  if(!prompts.some(p=>p.id===id))throw new Error(choose("Prompt not found.","Prompt introuvable."));
  if(!fullPromptCache.has(id))fullPromptCache.set(id,(async()=>{
    const response=await fetch(`/assets/data/prompt-details/${language}/${encodeURIComponent(id)}.json?v=20261028-en1`,{credentials:'omit'});
    if(!response.ok)throw new Error(choose("Unable to load the prompt. Open its detail page to read and copy the text.","Chargement impossible. Ouvrez la page de détail pour lire et copier le texte."));
    const data=await response.json();if(data.id!==id||typeof data.prompt!=='string')throw new Error(choose("Invalid content.","Contenu invalide."));return data;
  })().catch(error=>{fullPromptCache.delete(id);throw error;}));
  return fullPromptCache.get(id);
}
if(detail)$('pl-back-results').href=safeReturnPath(new URLSearchParams(location.search).get('from')||base,base);
let values={};
function updateCustomized(){const complete=prompt.variables.filter(key=>String(values[key]||'').trim()).length;$('pl-customized').textContent=customize(prompt.prompt,values);$('pl-variable-status').textContent=`${complete}/${prompt.variables.length} ${choose('variables completed','variables complétées')}${complete<prompt.variables.length?choose(' · Empty fields retain their placeholders.',' · Les champs vides conservent leur emplacement.'):''}`;}
document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-copy')){button.disabled=true;const label=button.textContent;button.textContent=choose('Loading…','Chargement…');try{const p=await fullPrompt(button.dataset.copy);button.textContent=label;button.disabled=false;await copy(p.prompt,button);}catch(error){notify(error.message);}finally{button.textContent=label;button.disabled=false;}return;}
  if(button.hasAttribute('data-favorite')){const id=button.dataset.favorite;if(!prompts.some(p=>p.id===id))return;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];const saved=saveFavorites(storage,favorites);if(catalog&&state.fav){render();$('pl-favorites').focus({preventScroll:true});}else syncFavorites();notify(saved?choose("Favourites updated on this device.","Favoris mis à jour sur cet appareil."):choose("Storage unavailable: favourites last only for this visit.","Stockage indisponible : favoris conservés seulement pour cette visite."));return;}
  if(catalog){
    if(button.hasAttribute('data-category')){state.category=button.dataset.category;state.page=1;render(true);}
    if(button.id==='pl-favorites'){state.fav=!state.fav;state.page=1;render(true);}
    if(button.id==='pl-clear-search'){state.q='';state.page=1;render(true);$('pl-search').focus();}
    if(button.id==='pl-reset'||button.hasAttribute('data-reset')){state=readState('',prompts);render(true);if(button.hasAttribute('data-reset'))$('pl-search').focus();}
    if(button.id==='pl-view-results'){$('pl-filter-panel').open=false;$('pl-catalog-title').scrollIntoView({block:'start'});}
    if(button.hasAttribute('data-page')){state.page=Number(button.dataset.page);render(true);$('pl-catalog-title').setAttribute('tabindex','-1');$('pl-catalog-title').focus({preventScroll:true});$('pl-catalog-title').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  if(prompt){
    if(button.id==='pl-copy-customized')await copy(customize(prompt.prompt,values),button);
    if(button.id==='pl-copy-example')await copy(prompt.exampleResult,button);
    if(button.id==='pl-reset-variables'){values={};document.querySelectorAll('[data-variable]').forEach(input=>input.value='');updateCustomized();notify(choose("Variables reset. The original prompt is unchanged.","Variables réinitialisées. Le prompt original est inchangé."));}
  }
});
let inputTimer;
document.addEventListener('input',event=>{if(catalog&&event.target.id==='pl-search'){clearTimeout(inputTimer);state.q=event.target.value;state.page=1;inputTimer=setTimeout(()=>render(true),100);}if(prompt&&event.target.hasAttribute('data-variable')){values[event.target.dataset.variable]=event.target.value;updateCustomized();}});
document.addEventListener('change',event=>{if(catalog){for(const key of ['model','level','tag','sort'])if(event.target.id===`pl-${key}`){state[key]=event.target.value;state.page=1;render(true);}if(event.target.id==='pl-page-select'){state.page=Number(event.target.value);render(true);$('pl-catalog-title').setAttribute('tabindex','-1');$('pl-catalog-title').focus({preventScroll:true});$('pl-catalog-title').scrollIntoView({block:'start'});}}});
window.addEventListener('popstate',()=>{if(catalog){clearTimeout(inputTimer);state=readState(location.search,prompts);render();}});
window.addEventListener('storage',()=>{favorites=readFavorites(storage,prompts);if(catalog)render();else syncFavorites();});
document.addEventListener('keydown',event=>{if(catalog&&event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,textarea,select,[contenteditable="true"]')){event.preventDefault();$('pl-search').focus();}});
document.addEventListener('keydown',event=>{const menu=document.querySelector('[data-shell-menu]');if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});
if(catalog){if(matchMedia('(max-width:900px)').matches)$('pl-filter-panel').open=false;render();}
syncFavorites();syncLanguageLinks();if(prompt)updateCustomized();
