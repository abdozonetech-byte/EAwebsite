export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export const variablePattern = () => /\[([A-Z][A-Z0-9_]*(?: [A-Z0-9_]+)*)\]/g;
export const extractVariables = prompt => [...new Set([...prompt.matchAll(variablePattern())].map(match=>match[1]))];
export function customize(prompt, values) {
  return prompt.replace(variablePattern(),(match,key)=>String(values[key]||'').trim()||match);
}
export function safeReturnPath(value) {
  try{const url=new URL(value,'https://local.invalid');return url.origin==='https://local.invalid'&&url.pathname==='/prompts/'&&!url.hash?url.pathname+url.search:'/prompts/';}catch{return '/prompts/';}
}
export function readState(search, catalog) {
  const params=new URLSearchParams(search), allowed=(name,values)=>values.includes(params.get(name))?params.get(name):'';
  return {q:(params.get('q')||'').slice(0,200),category:allowed('category',[...new Set(catalog.map(p=>p.category))]),model:allowed('model',[...new Set(catalog.flatMap(p=>p.compatibleModels))]),level:allowed('level',['beginner','intermediate','advanced']),tag:allowed('tag',[...new Set(catalog.flatMap(p=>p.tags))]),sort:allowed('sort',['recommended','alpha','updated','difficulty'])||'recommended',fav:params.get('fav')==='1',page:Math.min(10000,Math.max(1,parseInt(params.get('page'),10)||1))};
}
export function stateQuery(state) {
  const params=new URLSearchParams();
  for(const key of ['q','category','model','level','tag'])if(state[key])params.set(key,state[key]);
  if(state.sort!=='recommended')params.set('sort',state.sort);
  if(state.fav)params.set('fav','1');if(state.page>1)params.set('page',state.page);
  return params.size?`?${params}`:'';
}
export function filterPrompts(catalog,state,favorites=[],categoryLabels={},modelLabels={}) {
  const words=normalize(state.q).split(/\s+/).filter(Boolean),ranks={beginner:0,intermediate:1,advanced:2};
  const found=catalog.filter(p=>(!state.category||p.category===state.category)&&(!state.model||p.compatibleModels.includes(state.model))&&(!state.level||p.difficulty===state.level)&&(!state.tag||p.tags.includes(state.tag))&&(!state.fav||favorites.includes(p.id))&&words.every(word=>(p.searchText||normalize([p.title,p.description,p.category,categoryLabels[p.category],...p.tags,p.prompt,...p.useCases,...p.compatibleModels.flatMap(m=>[m,modelLabels[m]])].join(' '))).includes(word)));
  return found.sort((a,b)=>state.sort==='alpha'?a.title.localeCompare(b.title,'fr'):state.sort==='updated'?b.updatedAt.localeCompare(a.updatedAt):state.sort==='difficulty'?ranks[a.difficulty]-ranks[b.difficulty]:0);
}
export const FAVORITES_KEY='ea-prompt-favorites-v1';
export function readFavorites(storage,catalog) {
  try {const ids=JSON.parse(storage.getItem(FAVORITES_KEY)||'[]');return Array.isArray(ids)?[...new Set(ids.filter(id=>catalog.some(p=>p.id===id)))]:[];}catch{return [];}
}
export function saveFavorites(storage,ids) {try{storage.setItem(FAVORITES_KEY,JSON.stringify(ids));return true;}catch{return false;}}
export async function copyText(text,{clipboard,document,restoreFocus=()=>{}}) {
  try {if(clipboard?.writeText){await clipboard.writeText(text);return true;}}catch{/* Try a selection-based copy, then offer manual copying. */}
  const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(area);area.select();
  let done=false;try{done=document.execCommand('copy');}catch{}finally{area.remove();restoreFocus();}
  return done;
}
export function validateCatalog(catalog,categories,models) {
  const seen=new Set(),titles=new Set(),bodies=new Set();if(!catalog.length)throw new Error('Empty prompt catalog');
  for(const p of catalog){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||seen.has(p.slug)||p.id!==p.slug)throw new Error(`Invalid/duplicate slug: ${p.slug}`);seen.add(p.slug);
    if(!categories.some(c=>c.id===p.category))throw new Error(`Unknown category: ${p.slug}`);
    if(titles.has(normalize(p.title))||bodies.has(normalize(p.prompt)))throw new Error(`Duplicate title/body: ${p.slug}`);titles.add(normalize(p.title));bodies.add(normalize(p.prompt));
    for(const key of ['title','description','prompt','exampleResult','examplePreview'])if(typeof p[key]!=='string'||!p[key].trim())throw new Error(`Missing ${key}: ${p.slug}`);
    if(p.exampleResult.length<200||p.exampleStatus!=='illustrative')throw new Error(`Incomplete/unlabeled example: ${p.slug}`);
    for(const key of ['tags','useCases','tips','compatibleModels','howToUse','proTips','commonMistakes','relatedPromptIds'])if(!Array.isArray(p[key])||!p[key].length||p[key].some(item=>typeof item!=='string'||!item.trim()))throw new Error(`Missing ${key}: ${p.slug}`);
    if(!p.subcategory||!p.accomplishes||!['revised','newly_authored','imported'].includes(p.sourceType)||!p.provenance?.origin||p.provenance.modelTested!==false)throw new Error(`Invalid provenance/education: ${p.slug}`);
    if(p.prompt.length<300)throw new Error(`Prompt too short: ${p.slug}`);
    if(p.relatedPromptIds.some(id=>id===p.id||!catalog.some(q=>q.id===id)))throw new Error(`Broken relation: ${p.slug}`);
    if(!['beginner','intermediate','advanced'].includes(p.difficulty)||p.compatibleModels.some(m=>!models[m]))throw new Error(`Invalid metadata: ${p.slug}`);
    const variables=extractVariables(p.prompt);
    if(JSON.stringify(variables)!==JSON.stringify(p.variables))throw new Error(`Variable mismatch: ${p.slug}`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(p.updatedAt))throw new Error(`Invalid date: ${p.slug}`);
  }
  if(new Set(catalog.map(p=>p.exampleResult)).size!==catalog.length)throw new Error('Duplicate examples');
}
