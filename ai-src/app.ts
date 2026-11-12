import {buildMessages,type KnowledgeRecord,type Turn} from './retrieval';
import type {WebWorkerMLCEngine} from '@mlc-ai/web-llm';
const language=document.documentElement.lang==='en'?'en':'fr';
const t=(fr:string,en:string)=>language==='fr'?fr:en;
function get<T extends HTMLElement>(id:string){const el=document.getElementById(id);if(!el)throw Error('Missing element '+id);return el as T;}
const load=get<HTMLButtonElement>('ai-load'),send=get<HTMLButtonElement>('ai-send'),stop=get<HTMLButtonElement>('ai-stop'),clear=get<HTMLButtonElement>('ai-clear'),cancelLoad=get<HTMLButtonElement>('ai-cancel-load'),status=get('ai-status'),progress=get<HTMLProgressElement>('ai-progress'),form=get<HTMLFormElement>('ai-form'),input=get<HTMLTextAreaElement>('ai-message'),transcript=get('ai-transcript');
let engine:WebWorkerMLCEngine|undefined,worker:Worker|undefined,records:KnowledgeRecord[]=[],history:Turn[]=[],busy=false,loadEpoch=0,stopped=false;
function statusText(s:string){status.textContent=s;}
function resetLoad(){load.disabled=false;cancelLoad.hidden=true;progress.hidden=true;}
cancelLoad.addEventListener('click',()=>{loadEpoch++;worker?.terminate();worker=undefined;engine=undefined;resetLoad();statusText(t('Chargement annulé. Vous pouvez réessayer.','Loading cancelled. You can retry.'));});
load.addEventListener('click',async()=>{
 const epoch=++loadEpoch;load.disabled=true;statusText(t('Vérification de WebGPU…','Checking WebGPU…'));
 try{
  if(!navigator.gpu)throw Error('WEBGPU');
  const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw Error('WEBGPU');
  cancelLoad.hidden=false;progress.hidden=false;progress.value=0;
  statusText(t('Chargement du modèle local. Vous pouvez annuler.','Loading local model. You can cancel.'));
  const [{createEngine},response]=await Promise.all([import('./runtime'),fetch('/assets/ai/knowledge.json',{cache:'no-cache'})]);
  if(epoch!==loadEpoch)return;
  if(!response.ok)throw Error('KNOWLEDGE');
  const data=await response.json();if(data.version!==1||!Array.isArray(data.records))throw Error('KNOWLEDGE');
  records=data.records;worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
  const candidate=await createEngine(worker,adapter.features.has('shader-f16'),(value)=>{
   if(epoch!==loadEpoch)return;progress.value=value;statusText(t('Chargement du modèle : ','Loading model: ')+Math.round(value*100)+'%');
  });
  if(epoch!==loadEpoch){await candidate.unload();return;}
  engine=candidate;send.disabled=false;cancelLoad.hidden=true;progress.hidden=true;load.hidden=true;
  statusText(t('Modèle prêt. Génération locale sur votre appareil.','Model ready. Generation runs locally on your device.'));input.focus();
 }catch(error){
  if(epoch!==loadEpoch)return;
  worker?.terminate();worker=undefined;engine=undefined;resetLoad();
  statusText(error instanceof Error&&error.message==='WEBGPU'?t('WebGPU n’est pas disponible ici. Utilisez un navigateur compatible ou explorez les formations, services et guides ci-dessous. Aucun message n’a été envoyé à une API IA.','WebGPU is unavailable here. Use a compatible browser or explore training, services and guides below. No message was sent to an AI API.'):t('Le modèle n’a pas pu être chargé (réseau, mémoire ou compatibilité). Réessayez ou utilisez les liens ci-dessous.','The model could not load (network, memory or compatibility). Retry or use the links below.'));
 }
});
function bubble(role:'user'|'assistant',content:string){
 const article=document.createElement('article');article.className='tr-message';article.dataset.role=role;
 const heading=document.createElement('h2');heading.textContent=role==='user'?t('Vous','You'):'ELBOUBAKRY AI';
 const p=document.createElement('p');p.textContent=content;article.append(heading,p);transcript.append(article);return {article,p};
}
form.addEventListener('submit',async event=>{
 event.preventDefault();const query=input.value.trim();if(!query||!engine||busy)return;
 const generationEpoch=loadEpoch;
 busy=true;stopped=false;send.disabled=true;clear.disabled=true;stop.disabled=false;
 const currentEngine=engine;const {messages,selection}=buildMessages(query,records,language,history);
 bubble('user',query);input.value='';const answer=bubble('assistant',t('Préparation de la réponse…','Preparing an answer…'));let content='';
 statusText(t('Génération locale en cours…','Generating locally…'));
 transcript.setAttribute('aria-busy','true');
 try{
  const stream=await currentEngine.chat.completions.create({messages,stream:true,max_tokens:512,temperature:0.25,top_p:0.8});
  for await(const chunk of stream){if(generationEpoch!==loadEpoch)return;content+=chunk.choices[0]?.delta.content||'';answer.p.textContent=content;}
  if(generationEpoch!==loadEpoch)return;
  if(!content.trim())throw Error('EMPTY');
  // Only retrieved, build-approved routes become clickable. Generated HTML is never inserted.
  const sources=document.createElement('nav');sources.className='tr-sources';sources.setAttribute('aria-label',t('Sources consultées','Retrieved sources'));
  const urls=new Set<string>();
  for(const record of selection.records){if(urls.has(record.url)||!/^\/(?!\/)/.test(record.url))continue;urls.add(record.url);const a=document.createElement('a');a.href=record.url;a.textContent=record.title;sources.append(a);}
  answer.article.append(sources);
  if(!stopped){history.push({role:'user',content:query},{role:'assistant',content});history=history.slice(-12);}
  else answer.p.append(document.createTextNode(t('\n[Réponse interrompue]','\n[Answer stopped]')));
  statusText(stopped?t('Réponse interrompue.','Answer stopped.'):t('Réponse générée localement. Vérifiez les sources.','Answer generated locally. Check the sources.'));
 }catch{
  if(generationEpoch!==loadEpoch)return;
  answer.p.textContent=t('La génération a échoué. Aucun service IA externe n’a été utilisé. Réessayez avec une question plus courte ou consultez les liens du site.','Generation failed. No external AI service was used. Retry with a shorter question or use the site links.');
  input.value=query;statusText(t('Erreur de génération locale.','Local generation error.'));
 }finally{if(generationEpoch===loadEpoch){busy=false;send.disabled=false;clear.disabled=false;stop.disabled=true;transcript.setAttribute('aria-busy','false');input.focus();}}
});
stop.addEventListener('click',()=>{stopped=true;stop.disabled=true;void engine?.interruptGenerate();});
clear.addEventListener('click',async()=>{
 if(busy)return;history=[];transcript.replaceChildren();input.value='';
 try{await engine?.resetChat();statusText(t('Conversation effacée.','Conversation cleared.'));}catch{statusText(t('Historique effacé. Rechargez la page si le modèle ne répond plus.','History cleared. Reload if the model no longer responds.'));}
 input.focus();
});
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-ai-question]'))button.addEventListener('click',()=>{input.value=button.dataset.aiQuestion||'';input.focus();});
window.addEventListener('pagehide',()=>{loadEpoch++;history=[];worker?.terminate();worker=undefined;engine=undefined;});
window.addEventListener('pageshow',event=>{
 if(!event.persisted)return;
 busy=false;transcript.replaceChildren();transcript.setAttribute('aria-busy','false');input.value='';
 send.disabled=true;stop.disabled=true;clear.disabled=false;load.hidden=false;resetLoad();
 statusText(t('Rechargez le modèle pour commencer une nouvelle conversation.','Reload the model to start a new conversation.'));
});
