import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {faqs} from '../assets/data/english-diagnostic.js';
import {leadPayload} from '../functions/api/leads.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const french=read('reserver-diagnostic/index.html'),english=read('en/diagnostic/index.html'),thanks=read('en/thank-you/index.html');
const script=read('assets/lead-page/reserver-diagnostic.js');
const esc=s=>s.replaceAll('&','&amp;');
for(const html of [french,english]){
 for(const [lang,route]of [['fr','/reserver-diagnostic/'],['en','/en/diagnostic/'],['x-default','/reserver-diagnostic/']])assert(html.includes(`hreflang="${lang}" href="https://elboubakry.com${route}"`));
 assert.equal((html.match(/diagnostic-language-switch:start/g)||[]).length,1);
 assert(html.includes('id="diagnostic-form"'));assert(html.includes('name="contact_url_check"'));assert(html.includes('data-defer-submit-tracking="true"'));assert(html.includes('novalidate'));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
}
assert(english.includes('lang="en"'));assert(english.includes('href="https://elboubakry.com/en/diagnostic/" rel="canonical"'));
assert(english.includes('Moroccan phone / WhatsApp'));assert(english.includes('Moroccan mobile number: 06, 07 or +212.'));assert(english.includes('email me instead'));
assert(english.includes('id="email" name="email"'));assert(!/<input[^>]*id="email"[^>]*required/.test(english));
const frSectors=[...french.matchAll(/<option>([^<]+)<\/option>/g)].map(m=>m[1]);
const enSectors=[...english.matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)];
assert.deepEqual(enSectors.map(m=>m[1]),frSectors);assert.equal(enSectors.length,9);assert(english.includes('Healthcare / Medical practice'));
assert(!/(?:href|src)="\.\.\/assets\//.test(english));
assert(!/Réserver|Veuillez|Demander mon|Vos informations|Votre nom|Secteur d’activité/.test(english));
const graph=JSON.parse(english.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
assert.equal(graph.find(x=>x['@type']==='ContactPage').url,'https://elboubakry.com/en/diagnostic/');
const faq=graph.find(x=>x['@type']==='FAQPage');for(const [q,a]of faqs){assert(english.includes(esc(q)));assert(english.includes(esc(a)));assert(faq.mainEntity.some(x=>x.name===q&&x.acceptedAnswer.text===a));}
assert(thanks.includes('content="noindex,follow"'));assert(thanks.includes('lang="en"'));assert(thanks.includes('/assets/js/thank-you-tracking.js'));
assert(!read('sitemap.xml').includes('<loc>https://elboubakry.com/en/thank-you/</loc>'));
assert(read('_headers').includes('/en/thank-you/\n  X-Robots-Tag: noindex'));
// Run the real browser script in an isolated DOM with mocked fetch, no network.
function setup(lang='en',result={ok:true,json:async()=>({ok:true})}){
 const nodes={},requests=[],events=[],timers=[];let focused='';
 const element=(id,tagName='INPUT')=>nodes[id]={id,tagName,value:'',textContent:'',disabled:false,className:'',attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},focus(){focused=id;},addEventListener(k,fn){this.handlers[k]=fn;}};
 for(const field of ['name','phone','email','sector']){element(field,field==='sector'?'SELECT':'INPUT');element(field+'-error');}
 const status=element('form-status'),label={textContent:lang==='en'?'Request my free diagnostic':'Demander mon diagnostic gratuit'};
 const button={disabled:false,querySelector:()=>label};
 const form=element('diagnostic-form');form.elements={contact_url_check:{value:''}};form.querySelector=()=>button;
 const storage=new Map();
 const document={documentElement:{lang,scrollHeight:1000,classList:{add(){}}},getElementById:id=>nodes[id],querySelector:()=>null,querySelectorAll:()=>[],referrer:''};
 const window={innerHeight:800,scrollY:0,addEventListener(){},location:{href:'https://elboubakry.com'+(lang==='en'?'/en/diagnostic/':'/reserver-diagnostic/'),search:'?utm_source=google&utm_campaign=diagnostic'},setTimeout(fn,ms){timers.push({fn,ms});return 1;},clearTimeout(){},trackEvent:(...args)=>events.push(args)};
 const fetch=async(url,options)=>{requests.push({url,options});return typeof result==='function'?result():result;};
 vm.runInNewContext(script,{document,window,URLSearchParams,AbortController,Date,fetch,sessionStorage:{setItem:(k,v)=>storage.set(k,v)},console:{warn(){},error(){}}});
 const valid=()=>{Object.assign(nodes.name,{value:'Example Business'});nodes.phone.value='06 12 34 56 78';nodes.sector.value='Services locaux';nodes.name.handlers.input();};
 return {nodes,form,status,button,label,storage,events,requests,window,timers,valid,focused:()=>focused,submit:()=>form.handlers.submit({preventDefault(){}})};
}
for(const lang of ['en','fr']){
 const test=setup(lang);await test.submit();assert.equal(test.requests.length,0);assert.equal(test.focused(),'name');assert.equal(test.nodes.name.attrs['aria-invalid'],'true');assert(test.status.textContent.startsWith(lang==='en'?'Please correct':'Corrigez'));
 test.valid();test.nodes.phone.value='+33 6 12 34 56 78';await test.submit();assert.equal(test.requests.length,0);assert.equal(test.focused(),'phone');
 test.valid();test.nodes.email.value='not-an-email';await test.submit();assert.equal(test.requests.length,0);assert.equal(test.focused(),'email');
 test.nodes.email.value='';await test.submit();assert.equal(test.requests.length,1);
 const request=test.requests[0],payload=JSON.parse(request.options.body);assert.equal(request.url,'/api/leads');assert.equal(request.options.method,'POST');assert.equal(request.options.credentials,'same-origin');assert.equal(payload.phone,'212612345678');assert.equal(payload.businessSector,'Services locaux');assert.equal(payload.email,'');assert.equal(payload.utmSource,'google');assert.equal(payload.utmCampaign,'diagnostic');assert(!leadPayload(payload).error);
 assert.equal(test.window.location.href,lang==='en'?'/en/thank-you/':'/merci/');assert.equal(test.storage.get('lead_submitted'),'true');assert.equal(test.events.length,1);assert.equal(test.events[0][0],'consultation_form_submit');assert.equal(test.timers[0].ms,8000);
}
for(const phone of ['07 12 34 56 78','+212 6 12 34 56 78','212612345678']){const test=setup();test.valid();test.nodes.phone.value=phone;await test.submit();assert.equal(test.requests.length,1);assert(!leadPayload(JSON.parse(test.requests[0].options.body)).error);}
const trap=setup();trap.valid();trap.form.elements.contact_url_check.value='spam';await trap.submit();assert.equal(trap.requests.length,0);
for(const response of [{ok:false,json:async()=>({ok:false})},{ok:true,json:async()=>({ok:false})},()=>{throw Error('Network failed');}]){const test=setup('en',response);test.valid();await test.submit();assert.equal(test.requests.length,1);assert.equal(test.button.disabled,false);assert.equal(test.label.textContent,'Request my free diagnostic');assert(test.status.textContent.startsWith('Your request could not be sent'));assert(!test.storage.has('lead_submitted'));assert.equal(test.events.length,0);assert(test.window.location.href.startsWith('https:'));}
let resolve;const pending=setup('en',()=>new Promise(r=>{resolve=r;}));pending.valid();const first=pending.submit();assert.equal(pending.button.disabled,true);assert.equal(pending.label.textContent,'Sending...');await pending.submit();assert.equal(pending.requests.length,1);resolve({ok:true,json:async()=>({ok:true})});await first;
// A direct visit to the confirmation page must not invent a conversion.
for(const submitted of [false,true]){
 const storage=new Map(submitted?[['lead_submitted','true']]:[]),events=[];
 const context={document:{readyState:'complete'},sessionStorage:{getItem:k=>storage.get(k),removeItem:k=>storage.delete(k)},window:{trackEvent:(...args)=>events.push(args)},console:{warn(){}}};
 vm.runInNewContext(read('assets/js/thank-you-tracking.js'),context);
 assert.equal(events.length,submitted?2:0);assert(!storage.has('lead_submitted'));
 vm.runInNewContext(read('assets/js/thank-you-tracking.js'),context);assert.equal(events.length,submitted?2:0);
}
console.log('PASS English/French diagnostic: schema, canonical/alternates, stable CRM sectors, validation, Moroccan phones, optional email, honeypot, duplicate-click guard, request payload, loading/error recovery and language-specific confirmation. All fetch calls mocked.');
