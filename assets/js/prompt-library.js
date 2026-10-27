import { prompts, categories, models } from '../data/prompts.js?v=20261027-1';
import { readState,stateQuery,filterPrompts,customize,readFavorites,saveFavorites,copyText } from './prompt-library-core.js?v=20261027-1';
import { card,categoryName } from './prompt-library-render.js?v=20261027-1';
const $=id=>document.getElementById(id), catalog=document.querySelector('[data-library]');
let storage;try{storage=window.localStorage;}catch{storage=null;}
let favorites=readFavorites(storage,prompts),state=readState(location.search,prompts),statusTimer;
function notify(text){clearTimeout(statusTimer);const node=$('pl-status');node.textContent=text;node.classList.add('is-visible');statusTimer=setTimeout(()=>node.classList.remove('is-visible'),5000);}
function syncFavorites(){document.querySelectorAll('[data-favorite]').forEach(button=>{const p=prompts.find(p=>p.id===button.dataset.favorite),saved=favorites.includes(p.id);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${saved?'Retirer des':'Ajouter aux'} favoris : ${p.title}`);button.firstElementChild.textContent=saved?'★':'☆';});if($('pl-favorite-count'))$('pl-favorite-count').textContent=favorites.length;}
function syncControls(){
  $('pl-search').value=state.q;for(const key of ['model','level','tag','sort'])$(`pl-${key}`).value=state[key];
  document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===state.category)));
  $('pl-favorites').setAttribute('aria-pressed',String(state.fav));$('pl-clear-search').hidden=!state.q;
}
function render(updateURL=false){
  const found=filterPrompts(prompts,state,favorites,Object.fromEntries(categories.map(c=>[c.id,c.label])),models),size=8,pages=Math.max(1,Math.ceil(found.length/size));state.page=Math.min(state.page,pages);
  $('pl-grid').innerHTML=found.length?found.slice((state.page-1)*size,state.page*size).map(p=>card(p,favorites.includes(p.id))).join(''):`<div class="pl-empty"><h3>${state.fav?'Pas de favori correspondant.':'Aucun prompt correspondant.'}</h3><p>${state.fav?'Ajoutez un prompt avec l’étoile, ou élargissez vos filtres.':'Essayez un autre mot-clé ou retirez un filtre.'}</p><button type="button" class="pl-button" data-reset>Afficher tous les prompts</button></div>`;
  $('pl-catalog-title').textContent=state.fav?'Vos favoris':state.category?categoryName(state.category):'Tous les prompts';
  $('pl-results-count').textContent=`${found.length} résultat${found.length!==1?'s':''} sur ${prompts.length} prompts${pages>1?` · Page ${state.page}/${pages}`:''}`;
  $('pl-pagination').innerHTML=pages>1?`${state.page>1?`<button type="button" class="pl-button" data-page="${state.page-1}" aria-label="Page précédente">← Précédent</button>`:''}<span>Page ${state.page} sur ${pages}</span>${state.page<pages?`<button type="button" class="pl-button" data-page="${state.page+1}" aria-label="Page suivante">Suivant →</button>`:''}`:'';
  syncControls();syncFavorites();if(updateURL)history.replaceState(null,'',location.pathname+stateQuery(state));
}
async function copy(text,button){
  const done=await copyText(text,{clipboard:navigator.clipboard,document,restoreFocus:()=>button.focus({preventScroll:true})});
  if(done){notify('Texte copié. Vérifiez-le avant utilisation.');button.classList.add('pl-copied');setTimeout(()=>button.classList.remove('pl-copied'),1400);}
  else{const dialog=$('pl-copy-dialog');$('pl-copy-fallback').value=text;dialog.showModal();$('pl-copy-fallback').focus();$('pl-copy-fallback').select();notify('Copie automatique indisponible. Le texte est prêt pour une copie manuelle.');}
}
const detail=document.querySelector('[data-prompt-id]'),prompt=detail?prompts.find(p=>p.id===detail.dataset.promptId):null;
let values={};
function updateCustomized(){const complete=prompt.variables.filter(key=>String(values[key]||'').trim()).length;$('pl-customized').textContent=customize(prompt.prompt,values);$('pl-variable-status').textContent=`${complete}/${prompt.variables.length} variables complétées${complete<prompt.variables.length?' · Les champs vides conservent leur emplacement.':''}`;}
document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-copy')){const p=prompts.find(p=>p.id===button.dataset.copy);if(p)await copy(p.prompt,button);return;}
  if(button.hasAttribute('data-favorite')){const id=button.dataset.favorite;if(!prompts.some(p=>p.id===id))return;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];const saved=saveFavorites(storage,favorites);if(catalog&&state.fav){render();$('pl-favorites').focus({preventScroll:true});}else syncFavorites();notify(saved?'Favoris mis à jour sur cet appareil.':'Stockage indisponible : favoris conservés seulement pour cette visite.');return;}
  if(catalog){
    if(button.hasAttribute('data-category')){state.category=button.dataset.category;state.page=1;render(true);}
    if(button.id==='pl-favorites'){state.fav=!state.fav;state.page=1;render(true);}
    if(button.id==='pl-clear-search'){state.q='';state.page=1;render(true);$('pl-search').focus();}
    if(button.id==='pl-reset'||button.hasAttribute('data-reset')){state=readState('',prompts);render(true);if(button.hasAttribute('data-reset'))$('pl-search').focus();}
    if(button.hasAttribute('data-page')){state.page=Number(button.dataset.page);render(true);$('pl-catalog-title').setAttribute('tabindex','-1');$('pl-catalog-title').focus({preventScroll:true});$('pl-catalog-title').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  if(prompt){
    if(button.id==='pl-copy-customized')await copy(customize(prompt.prompt,values),button);
    if(button.id==='pl-copy-example')await copy(prompt.exampleResult,button);
    if(button.id==='pl-reset-variables'){values={};document.querySelectorAll('[data-variable]').forEach(input=>input.value='');updateCustomized();notify('Variables réinitialisées. Le prompt original est inchangé.');}
  }
});
let inputTimer;
document.addEventListener('input',event=>{if(catalog&&event.target.id==='pl-search'){clearTimeout(inputTimer);state.q=event.target.value;state.page=1;inputTimer=setTimeout(()=>render(true),100);}if(prompt&&event.target.hasAttribute('data-variable')){values[event.target.dataset.variable]=event.target.value;updateCustomized();}});
document.addEventListener('change',event=>{if(catalog)for(const key of ['model','level','tag','sort'])if(event.target.id===`pl-${key}`){state[key]=event.target.value;state.page=1;render(true);}});
window.addEventListener('popstate',()=>{if(catalog){clearTimeout(inputTimer);state=readState(location.search,prompts);render();}});
window.addEventListener('storage',()=>{favorites=readFavorites(storage,prompts);if(catalog)render();else syncFavorites();});
document.addEventListener('keydown',event=>{if(catalog&&event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,textarea,select,[contenteditable="true"]')){event.preventDefault();$('pl-search').focus();}});
document.addEventListener('keydown',event=>{const menu=document.querySelector('[data-shell-menu]');if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});
if(catalog){if(matchMedia('(max-width:760px)').matches)$('pl-filter-panel').open=false;render();}
syncFavorites();if(prompt)updateCustomized();
