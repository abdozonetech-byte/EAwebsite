import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {build} from 'esbuild';
import {profile,courses} from '../content/professional.mjs';
const built=await build({entryPoints:['ai-src/retrieval.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {intentOf,retrieve,buildMessages}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const read=f=>fs.readFileSync(f,'utf8');
const doc=f=>parseHTML(read(f)).document;
const knowledge=JSON.parse(read('assets/ai/knowledge.json'));
test('all existing sitemap URLs survive and no article draft is published',()=>{
 const before=read('tests/fixtures/baseline-sitemap.xml'),after=read('sitemap.xml');
 for(const [url]of before.matchAll(/<loc>[^<]+<\/loc>/g))assert(after.includes(url),url);
 assert(!after.includes('/draft'));
 for(const record of knowledge.records){assert(!record.url.includes('/draft'));assert(!record.text.includes('EDITORIAL_DRAFT'));}
});
test('all 30 existing guides are crawlable from hub with JS disabled',()=>{
 const hub=doc('insights/index.html');assert.equal(hub.querySelectorAll('[data-insights-grid] article').length,30);
 const audit=JSON.parse(read('docs/upgrade/insights-audit-baseline.json'));
 for(const row of audit.rows){
  assert(hub.querySelector(`[href="/insights/${row.slug}"]`),row.slug);
  const article=doc('insights/'+row.slug+'.html');assert(article.querySelector('.ea-article-author a[href="/about-elboubakry-abdessamad"]'),row.slug);
 }
});
test('bilingual courses include all learning fields and honest structured data',()=>{
 for(const lang of ['fr','en'])for(const course of courses){
  const route=(lang==='fr'?'formations/':'en/training/')+course.id+'/';
  const page=doc(route+'index.html'),data=JSON.parse(page.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  const schema=data.find(x=>x['@type']==='Course');assert(schema);
  assert.equal(schema.name,course[lang].title);assert.equal(schema.inLanguage,lang);
  assert.equal(page.querySelectorAll('.tr-modules details').length,course[lang].modules.length);
  for(const key of ['audience','level','prerequisites','outcome'])assert(page.body.textContent.includes(course[lang][key]));
  for(const module of course[lang].modules)for(const part of module)assert(page.body.textContent.includes(part));
  assert(!/offers|aggregateRating|reviewCount|timeRequired|educationalCredentialAwarded/.test(JSON.stringify(schema)));
  assert(page.querySelector('a[href^="mailto:"]'));assert.equal(page.querySelectorAll('h1').length,1);
  assert.equal(page.querySelector('[hreflang="fr"][rel="alternate"]').getAttribute('href'),'https://elboubakry.com/formations/'+course.id+'/');
  assert.equal(page.querySelector('[hreflang="en"][rel="alternate"]').getAttribute('href'),'https://elboubakry.com/en/training/'+course.id+'/');
 }
});
test('professional profile and homepage keep consulting and add training',()=>{
 for(const [lang,file]of [['fr','index.html'],['en','en/index.html']]){
  const page=doc(file);assert(page.querySelector('h1').textContent.includes(profile[lang].role));
  assert(page.querySelector('#expertises'));assert(page.querySelector('#projets'));assert(page.querySelector('#contact'));
  assert.equal(page.querySelectorAll('header [data-professional-nav]').length,1);assert.equal(page.querySelectorAll('#training-preview-title').length,1);
  assert(!page.querySelector('script[src*="assets/ai/"]'),'LLM must not load on the homepage');
 }
});
test('original portraits and operational functions are unchanged',()=>{
 for(const file of ['assets/images/elboubakry-growth-portrait.webp','assets/images/elboubakry-growth-portrait.avif','functions/_middleware.js','_routes.json']){
  const original=JSON.parse(read('tests/fixtures/preserved-blobs.json'))[file];const bytes=fs.readFileSync(file);assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),original,file);
 }
});
const questions=[
 ['Je veux apprendre le développement IA','learn','course','developpement-ia-automatisation','fr'],
 ['J’ai besoin d’un agent IA pour mon entreprise','hire','service','services','fr'],
 ['Je veux apprendre Meta Ads','learn','course','marketing-digital-acquisition','fr'],
 ['J’ai besoin de gestion de campagnes marketing','hire','service','services','fr'],
 ['Qui est Abdessamad ?','profile','profile','about','fr'],
 ['I want to learn AI development','learn','course','developpement-ia-automatisation','en'],
 ['I need an AI agent for my company','hire','service','services','en'],
 ['I want to learn Meta Ads','learn','course','marketing-digital-acquisition','en'],
 ['Please manage marketing campaigns for my company','hire','service','services','en'],
 ['Who is Abdessamad?','profile','profile','about','en'],
 ['Show me your projects','projects','project','projects','en'],
 ['Je veux lire un guide SEO','read','article','insights','fr']
];
for(const [q,intent,kind,url,lang]of questions)test('retrieval: '+q,()=>{
 const result=retrieve(q,knowledge.records,lang);assert.equal(result.intent,intent);
 assert(result.records.some(x=>x.kind===kind&&x.url.includes(url)),JSON.stringify(result));
 assert(result.records.every(x=>x.language===lang));
 if(intent==='hire')assert(!result.records.some(x=>x.kind==='course'));
});
test('follow-up uses training context; explicit hiring switches intent',()=>{
 const history=[{role:'user',content:'Je veux apprendre le développement IA'},{role:'assistant',content:'Le parcours AI Development & Automation couvre ces bases.'}];
 const follow=retrieve('Quels modules et prérequis ?',knowledge.records,'fr',history);assert.equal(follow.intent,'learn');assert(follow.records.some(x=>x.url.includes('developpement-ia-automatisation')));
 assert.equal(retrieve('Finalement, j’ai besoin de confier la réalisation à un consultant',knowledge.records,'fr',history).intent,'hire');
 assert.equal(intentOf('I do not want to learn, I need an agent for my company'),'hire');
});
test('local system context covers every role and only bounded approved content',()=>{
 const result=buildMessages('Who is Abdessamad?',knowledge.records,'en',Array.from({length:40},(_,i)=>({role:i%2?'assistant':'user',content:'x'.repeat(5000)})));
 assert(result.messages.length<=6);assert(result.messages[0].content.includes('trainer'));assert(result.messages[0].content.includes('CRM'));assert(result.messages[0].content.includes('project manager'));
 assert(result.messages.slice(1,-1).every(x=>x.content.length<=500));
 assert(result.selection.records.reduce((n,x)=>n+x.text.length,0)<=4700);
 assert(result.messages[0].content.includes('Do not invent'));
});
test('assistant does not send prompts to an external inference API or persist conversations',()=>{
 const app=read('ai-src/app.ts'),worker=read('ai-src/worker.ts'),runtime=read('ai-src/runtime.ts');
 assert(!/localStorage|sessionStorage|sendBeacon|api\.openai|workers\.ai|\/api\/ai/.test(app+worker+runtime));
 assert(app.includes("fetch('/assets/ai/knowledge.json'"));assert(app.includes("import('./runtime')"));assert(worker.includes("['GET','HEAD'].includes(request.method)"));
 for(const file of ['ai/index.html','en/ai/index.html']){const page=doc(file);assert(!page.querySelector('script[src*="analytics"]'));assert(page.querySelector('#ai-cancel-load'));assert(page.querySelector('#ai-clear'));}
});
test('new page images, controls and language alternatives meet static accessibility basics',()=>{
 for(const file of ['formations/index.html','en/training/index.html','ai/index.html','en/ai/index.html',...courses.map(c=>'formations/'+c.id+'/index.html')]){
  const page=doc(file);assert(page.querySelector('main'));assert(page.querySelector('[href="#main-content"]'));
  for(const img of page.querySelectorAll('img')){assert(img.hasAttribute('alt'));assert(img.hasAttribute('width'));assert(img.hasAttribute('height'));}
  for(const textarea of page.querySelectorAll('textarea'))assert(page.querySelector(`label[for="${textarea.id}"]`));
  for(const button of page.querySelectorAll('button'))assert(button.textContent.trim()||button.getAttribute('aria-label'));
 }
});
test('AI breadcrumbs match visible navigation and English contact links resolve to home',()=>{
 for(const file of ['ai/index.html','en/ai/index.html']){
  const page=doc(file),schema=JSON.parse(page.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  const crumbs=schema.find(x=>x['@type']==='BreadcrumbList').itemListElement;
  assert.equal(crumbs.length,2);assert.equal(crumbs[1].name,'ELBOUBAKRY AI');
 }
 for(const file of ['en/ai/index.html','en/training/index.html',...courses.map(c=>'en/training/'+c.id+'/index.html')]){
  const page=doc(file);assert(!page.querySelector('footer [href="#contact"]'));assert(page.querySelector('footer [href="/en/#contact"]'));
  assert(!page.querySelector('.ea-nav a[href="/"]'));assert(page.querySelector('.ea-nav a[href="/en/"]'));
 }
});
test('approved article edits change the next knowledge build; restored sources reproduce the original index',async()=>{
 const file='insights/automatisation-marketing-maroc.html',original=read(file),before=read('assets/ai/knowledge.json');
 try{
  const page=doc(file),area=page.querySelector('.ea-article-content');assert(area);
  const p=area.querySelector('p');p.textContent+=' Knowledge sync verification token 58129.';
  fs.writeFileSync(file,page.toString());
  await import('../scripts/build-knowledge.mjs?verification=changed');
  const changed=JSON.parse(read('assets/ai/knowledge.json'));
  assert.notEqual(changed.contentHash,JSON.parse(before).contentHash);
  assert(changed.records.some(x=>x.text.includes('Knowledge sync verification token 58129.')));
 }finally{
  fs.writeFileSync(file,original);
  await import('../scripts/build-knowledge.mjs?verification=restored');
 }
 assert.equal(read('assets/ai/knowledge.json'),before);
});
