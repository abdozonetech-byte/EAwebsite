import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {CHANNELS,PRESENCE_SCHEMA,presencePrompt,validatePresence,safePresenceUrl} from '../functions/_lib/lead-presence.js';

export const presenceFixture={outreach_problem_channels:['website'],summary:'SAMPLE: make the consultation next step easier to find.',channels:CHANNELS.map(channel=>({channel,status:['website','seo'].includes(channel)?'observed':'not_verified',score:['website','seo'].includes(channel)?62:null,confidence:'medium',summary:'SAMPLE observation for the interface test.',strengths:['website','seo'].includes(channel)?['Clear business identity']:[],problems:channel==='website'?[{problem:'SAMPLE: enquiry action is unclear',impact:'Visitors may need more guidance.',next_step:'Clarify the main enquiry action.',evidence_url:'https://example.com/contact'}]:[],links:['website','seo'].includes(channel)?[{label:'Sample contact source',url:'https://example.com/contact'}]:[]})),email_subject:'Une idée pour vos demandes de consultation',email_body:'Bonjour, je suis Abdessamad Elboubakry, consultant marketing digital et IA. Une piste serait de clarifier le parcours de demande de consultation sur votre site. Seriez-vous disponible pour un bref échange ?',whatsapp:'Bonjour, je suis Abdessamad Elboubakry, consultant marketing digital et IA. Puis-je vous partager une idée pour simplifier vos demandes de consultation ?'};
const research={evidence:[{url:'https://example.com/contact'}],summary:'Observed contact page.'};
const valid=validatePresence(presenceFixture,research);
assert.equal(valid._purpose,'presence');assert.equal(valid.channels[0].score,62);assert.equal(PRESENCE_SCHEMA.additionalProperties,false);
assert.equal(safePresenceUrl('javascript:alert(1)'), '');assert.equal(safePresenceUrl('https://password:secret@example.com/'),'');
const unsupported=structuredClone(presenceFixture);unsupported.channels[3]={...unsupported.channels[3],status:'observed',score:90,strengths:['Invented'],links:[{label:'Fake Facebook',url:'https://facebook.com/invented'}]};
const normalized=validatePresence(unsupported,research);assert.equal(normalized.channels[3].score,null);assert.equal(normalized.channels[3].status,'not_verified');assert.deepEqual(normalized.channels[3].strengths,[]);
unsupported.outreach_problem_channels=['facebook'];unsupported.email_body='Your Facebook profile is inactive.';
const safeDraft=validatePresence(unsupported,research);assert.equal(safeDraft._drafts_general,true);assert(!safeDraft.email_body.includes('inactive'));
const wrongPlatform=structuredClone(presenceFixture);wrongPlatform.channels[3].links=[{label:'Wrong source',url:'https://example.com/contact'}];assert.deepEqual(validatePresence(wrongPlatform,research).channels[3].links,[]);
const limited=structuredClone(presenceFixture);limited.channels[0].status='limited';limited.channels[0].score=20;assert.equal(validatePresence(limited,research).channels[0].score,null);
const invalid=structuredClone(presenceFixture);invalid.channels[0].score=101;assert.throws(()=>validatePresence(invalid,research));
const duplicates=structuredClone(presenceFixture);duplicates.channels[1].channel='website';assert.throws(()=>validatePresence(duplicates,research));
const prompt=presencePrompt({full_name:'Business',phone:'PRIVATE-PHONE',email:'PRIVATE-EMAIL'},research,[],'fr');assert(!prompt.includes('PRIVATE-'));assert(prompt.includes('not proof'));assert(prompt.includes('No accusations'));

// Offline DOM contract test: no browser access, live data, API spend or outgoing messages.
const handlers={},host={innerHTML:''},contact={innerHTML:''},review={checked:false};
const lead={id:'123e4567-e89b-42d3-a456-426614174000',company:'Sample business',city:'Casablanca',website:'javascript:alert(1)',evidence:[{url:'https://example.com/contact',title:'Contact source'},{url:'javascript:bad',title:'Unsafe'}]};
const result={id:'version1',kind:'solution',status:'completed',createdAt:'2026-10-16T10:00:00Z',output:{...valid,_research:{...research,researched_at:'2026-10-16T10:00:00Z'}}};
const document={documentElement:{lang:'en'},getElementById:id=>({leadProjectWorkspace:host,presenceContactActions:contact,presenceReviewed:review}[id]||null),addEventListener:(type,fn)=>handlers[type]=fn};
let clipboard='';
const context={document,window:{},location:{hash:`#intelligence/lead/${lead.id}`},URL,Intl,Date,console,encodeURIComponent,setTimeout,clearTimeout,navigator:{clipboard:{writeText:async text=>{clipboard=text;}}},fetch:async()=>({status:200,ok:true,json:async()=>({generations:[result,{kind:'mockup',status:'completed',output:{render_mode:'image'}}],feedback:[],contact:{phone:'0612345678',email:'sample@example.com'}})})};
vm.runInNewContext(await readFile(new URL('../crm/assets/crm-presence.js',import.meta.url),'utf8'),context);
context.window.CrmProject.mount(lead);await new Promise(resolve=>setImmediate(resolve));
assert(host.innerHTML.includes('Verify this observation'));assert(host.innerHTML.includes('Business links & evidence'));assert(!host.innerHTML.includes('javascript:'));assert(!host.innerHTML.includes('Mockup'));assert(!host.innerHTML.includes('report'));assert(host.innerHTML.includes('62<small>/100'));
const event=(kind,value)=>({target:{closest:selector=>selector===`[data-presence-${kind}]`?{dataset:{[kind==='tab'?'presenceTab':'presenceAction']:value}}:null}});
await handlers.click(event('tab','messages'));assert(host.innerHTML.includes('presenceEmail'));assert(!contact.innerHTML.includes('wa.me'));
handlers.change({target:{id:'presenceReviewed',checked:true}});assert(contact.innerHTML.includes('https://wa.me/212612345678'));assert(contact.innerHTML.includes('mailto:sample@example.com'));
handlers.input({target:{dataset:{draft:'whatsapp'},value:'Edited & reviewed?'}});assert(!contact.innerHTML.includes('wa.me'),'Editing a draft requires renewed review');
await handlers.click(event('action','copy-whatsapp'));assert.equal(clipboard,'Edited & reviewed?');
const index=await readFile(new URL('../crm/index.html',import.meta.url),'utf8');assert(index.includes('crm-presence.js'));assert(!index.includes('src="/crm/assets/crm-project.js'));
const intelligence=await readFile(new URL('../crm/assets/crm-intelligence.js',import.meta.url),'utf8');const detail=intelligence.slice(intelligence.indexOf('  function detail()'),intelligence.indexOf('  function render()'));assert(!detail.includes('reportMarkdown'));assert(!detail.includes('download'));assert(detail.includes('leadProjectWorkspace'));
console.log('CRM presence tests passed: strict channel schema, source/platform validation, unknown-score suppression, prompt privacy, retired UI, problem/source rendering, editable drafts, review-gated WhatsApp/email links and safe copying.');
