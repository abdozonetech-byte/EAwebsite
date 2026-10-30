import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const script=fs.readFileSync(new URL('../assets/js/analytics.js',import.meta.url),'utf8');
function setup(url='https://elboubakry.com/',referrer=''){
 const events=[],handlers={},storage=new Map(),scripts=[];
 const window={location:new URL(url),ELBOUBAKRY_TRACKING:{GA4_MEASUREMENT_ID:'G-TEST123',ENABLE_META_PIXEL:false},gtag:(...args)=>events.push(args),addEventListener:(k,v)=>handlers[k]=v,dispatchEvent(){},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout(){}};
 const document={referrer,title:'Test',readyState:'loading',querySelector:()=>null,addEventListener:(k,v)=>handlers[k]=v,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
 const context=vm.createContext({window,document,URL,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}});
 vm.runInContext(script,context);
 return {events,handlers,scripts,rerun:()=>vm.runInContext(script,context)};
}
for(const referrer of ['https://www.google.com/search?q=test','https://www.bing.com/search?q=test','https://notgemini.google.com/']){
 const test=setup(undefined,referrer);assert(!test.events.some(e=>e[1]==='ai_referral_visit'),referrer);
}
for(const [host,source]of [['gemini.google.com','gemini'],['chatgpt.com','chatgpt'],['perplexity.ai','perplexity'],['copilot.microsoft.com','copilot'],['claude.ai','claude']]){
 const test=setup(undefined,'https://'+host+'/');assert.equal(test.events.find(e=>e[1]==='ai_referral_visit')?.[2].ai_source,source);
 test.rerun();assert.equal(test.events.filter(e=>e[1]==='ai_referral_visit').length,1);
}
for(const url of ['http://127.0.0.1:4180/','https://preview.pages.dev/','https://elboubakry.com/crm/','https://elboubakry.com/admin','https://elboubakry.com/api/leads'])assert.equal(setup(url).events.length,0,url);
assert(setup('https://elboubakry.com/insights/consultant-marketing-digital-casablanca/').events.some(e=>e[1]==='geo_landing_view'));
const test=setup();
const link={dataset:{},textContent:'Diagnostic',getAttribute:k=>k==='href'?'/en/diagnostic/':null,closest:()=>null};
test.handlers.click({target:{closest:()=>link}});assert(test.events.some(e=>e[1]==='diagnostic_cta_click'));
test.rerun();assert.equal(test.events.filter(e=>e[0]==='config').length,1);
for(const [slug,anchor]of [['consultant-marketing-digital-casablanca','livrables-casablanca'],['generation-leads-qualifies-maroc','grille-qualification']]){
 const html=fs.readFileSync(new URL('../insights/'+slug+'.html',import.meta.url),'utf8');
 assert(html.includes('id="'+anchor+'"'));assert(html.includes('"dateModified": "2026-10-30"'));
 assert(html.includes('datetime="2026-10-30"'));assert(html.includes('analytics.js?v=20261030-quality1'));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
}
console.log('PASS public tracking: conservative AI attribution, private/local exclusion, duplicate loading guard, trailing slash pages and English diagnostic CTA. No network requests.');
