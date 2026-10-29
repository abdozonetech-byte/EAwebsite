// Stage 2: static English services/profile; no production services or deployment.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {services,process as steps,audiences,skills,career,credentials,profileFaqs} from '../assets/data/english-core.js';
import {languageAssets,languageControl} from './site-language-ui.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://elboubakry.com';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,text)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),text);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const home=read('en/index.html');
const homeGraph=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const alternates=(fr,en)=>`<link rel="alternate" hreflang="fr" href="${origin}${fr}"><link rel="alternate" hreflang="en" href="${origin}${en}"><link rel="alternate" hreflang="x-default" href="${origin}${fr}">`;
const switcher=(fr,en,lang)=>`<!-- core-language-switch:start -->${languageControl(fr,en,lang)}<!-- core-language-switch:end -->`;
const section=(title,body,soft=false,id='')=>`<section class="ea-section${soft?' ea-section-soft':''}"${id?` id="${id}"`:''}><div class="ea-container"><h2>${esc(title)}</h2>${body}</div></section>`;
const cards=items=>`<div class="ea-core-grid">${items.map(([title,body])=>`<article class="ea-core-card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div>`;
const contact=section('Let’s clarify the next useful step.',`<p>Describe your objective, current situation and what is getting in the way. We can discuss priorities before choosing an implementation.</p><div class="ea-core-actions"><a class="ea-button" href="mailto:abdozonetech@gmail.com?subject=Project%20enquiry">Email your project ↗</a><a class="ea-button ea-button-secondary" href="https://wa.me/212687321925?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20digital%20marketing%20or%20AI%20project." rel="noopener noreferrer">Open WhatsApp ↗</a><a class="ea-text-link" href="/reserver-diagnostic/" hreflang="fr">Diagnostic form (French) ↗</a></div><p class="ea-core-note">Review your message before sending. The diagnostic form and detailed guides are currently in French.</p>`,true,'contact');
const serviceBody=section('Four connected levers.',`<p>Every engagement starts with the context, objectives and available resources. Services can be combined into one coherent plan or used separately.</p><div class="ea-core-grid">${services.map((s,i)=>`<article class="ea-core-card"><span class="ea-kicker">0${i+1}</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><ul>${s.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a class="ea-text-link" href="${s.guide}" hreflang="fr">${esc(s.label)} ↗</a></article>`).join('')}</div>`,false,'services')+
 section('Designed for businesses that want structure before scale.',cards(audiences),true)+
 section('From today’s situation to a measurable plan.',cards(steps.map(([t,b],i)=>[`0${i+1} · ${t}`,b])))+
 section('Clear scope. Practical delivery.',cards([['Business priorities','Priorities linked to a specific business objective, with concrete deliverables rather than isolated actions.'],['Measurement from the start','Tracking and useful indicators defined early, with technology proportionate to the need and the team.']]),true)+
 section('Try a practical AI use case.',`<p>Explore use cases, customise a prompt and review an illustrative example. No account or API request is required.</p><a class="ea-text-link" href="/prompts/?category=automation">Explore automation prompts ↗</a>`)+contact;
const profileBody=section('A systems-oriented approach.',`<p>My work combines digital marketing, applied business AI, web development, automation, project management and training. This business and technical perspective helps me translate a problem into clear requirements, user journeys, conversion pages, tracking and controlled workflows.</p><p>I start by understanding the offer, clarifying messages, choosing channels and preparing pages, then measure conversions and improve progressively. Strategy and implementation stay connected: from defining the need and coordinating the project to reviewing AI-assisted work and connecting it to SEO, campaigns, CRM and useful indicators.</p>`)+
 section('Core expertise.',cards([['Digital marketing strategy','Clarify the offer, audience, priorities and action plan.'],['Digital advertising','Structure campaigns around a measurable objective.'],['Landing pages & conversion','Turn traffic into clearer enquiries.'],['SEO & content','Build useful, lasting visibility.'],['Analytics & tracking','Measure meaningful clicks, sources and conversions.'],['Marketing automation','Organise enquiries and follow-up without unnecessary complexity.']])+`<a class="ea-text-link" href="/en/services/">Explore services →</a>`,true)+
 section('Technical and AI skills.',cards(skills))+
 section('Professional experience.',`<div class="ea-core-timeline">${career.map(([date,title,body])=>`<article><span class="ea-kicker">${esc(date)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div>`,true)+
 section('Education & certifications.',`<ul class="ea-core-credentials">${credentials.map(([title,body])=>`<li><strong>${esc(title)}</strong><span>${esc(body)}</span></li>`).join('')}</ul>`)+
 section('Questions about my work.',cards(profileFaqs),true)+contact;
const pages=[
 {file:'services/index.html',fr:'/services/',en:'/en/services/',label:'Services',title:'Digital Marketing, AI & Automation Services in Morocco',description:'Digital strategy, advertising, SEO, landing pages, CRM and business AI automation with Elboubakry Abdessamad, based in Casablanca, Morocco.',heading:'Marketing, AI and business consulting for your next stage.',intro:'I help you clarify your strategy, build the right assets, activate acquisition channels and measure what turns visits into qualified enquiries.',body:serviceBody,type:'CollectionPage'},
 {file:'about-elboubakry-abdessamad.html',fr:'/about-elboubakry-abdessamad',en:'/en/about/',label:'About',title:'Elboubakry Abdessamad | Marketing & AI Consultant in Morocco',description:'Meet Elboubakry Abdessamad, a Casablanca-based digital marketing and applied AI consultant working on acquisition, SEO, CRM and automation in Morocco.',heading:'Elboubakry Abdessamad, digital marketing & AI consultant in Morocco.',intro:'Based in Casablanca, I connect marketing, applied business AI and automation to help Moroccan businesses attract, convert, follow up and simplify operations. I work in Arabic, French and English.',body:profileBody,type:'ProfilePage'}
];
for(const page of pages){
 let french=read(page.file).replace(/<!-- core-language-(?:head|switch):start -->[\s\S]*?<!-- core-language-(?:head|switch):end -->/g,'');
 const head=`<!-- core-language-head:start -->${languageAssets()}${alternates(page.fr,page.en)}<!-- core-language-head:end -->`;
 write(page.file,french.replace('</head>',head+'</head>').replace('<main id="main-content">',switcher(page.fr,page.en,'fr')+'<main id="main-content">'));
 let graph=structuredClone(homeGraph);
 graph['@graph']=graph['@graph'].filter(x=>!['WebPage','FAQPage'].includes(x['@type']));
 const person=graph['@graph'].find(x=>x['@type']==='Person');
 const schema={'@type':page.type,'@id':origin+page.en+'#page',url:origin+page.en,name:page.title,description:page.description,inLanguage:'en',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#person'},translationOfWork:{'@id':origin+page.fr+(page.type==='ProfilePage'?'#profile-page':'#page')},dateModified:'2026-10-29'};
 if(page.type==='ProfilePage'){
  schema.mainEntity={'@id':person['@id']};
  person.knowsLanguage=['ar','fr','en'];
  person.alumniOf={'@type':'EducationalOrganization',name:'ITIAM Formation'};
  graph['@graph'].push({'@type':'FAQPage','@id':origin+page.en+'#faq',inLanguage:'en',mainEntity:profileFaqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
 }else{
  schema.mainEntity={'@type':'ItemList',itemListElement:services.map((s,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Service',name:s.title,description:s.description,provider:{'@id':person['@id']},areaServed:{'@type':'Country',name:'Morocco'},url:origin+page.en+'#services'}}))};
 }
 graph['@graph'].push(schema,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/en/'},{'@type':'ListItem',position:2,name:page.label,item:origin+page.en}]});
 let english=home.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(page.title)}</title>`)
 .replace(/(<meta name="(?:description|twitter:description)" content=")[^"]*/g,'$1'+esc(page.description))
 .replace(/(<meta property="og:description" content=")[^"]*/g,'$1'+esc(page.description))
 .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g,'$1'+esc(page.title))
 .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${origin}${page.en}">`)
 .replace(/<meta property="og:url"[^>]*>/,`<meta property="og:url" content="${origin}${page.en}">`)
 .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>`)
 .replace(/<!-- site-language-head:start -->[\s\S]*?<!-- site-language-head:end -->/,head)
 .replace(/<!-- site-language-switch:start -->[\s\S]*?<!-- site-language-switch:end -->/,switcher(page.fr,page.en,'en'))
 .replace(/<main id="main-content">[\s\S]*?<\/main>/,`<main id="main-content" class="ea-core-page"><section class="ea-core-hero"><div class="ea-container"><nav class="ea-core-breadcrumb" aria-label="Breadcrumb"><a href="/en/">Home</a><span>/</span><span>${page.label}</span></nav><span class="ea-kicker">${page.type==='ProfilePage'?'About · Casablanca, Morocco':'Services · Morocco'}</span><h1>${esc(page.heading)}</h1><p>${esc(page.intro)}</p><div class="ea-core-actions"><a class="ea-button" href="#contact">Discuss your project ↗</a><a class="ea-text-link" href="${page.type==='ProfilePage'?'/en/services/':'/en/about/'}">${page.type==='ProfilePage'?'Explore services':'Meet your consultant'} →</a></div></div></section>${page.body}</main>`);
 // Main navigation is page-relative only where a section is on this page.
 english=english.replaceAll('href="#accueil"','href="/en/"').replaceAll('href="#projets"','href="/en/#projets"').replaceAll('class="ea-button"','class="ea-button ea-button-primary"');
 if(page.type==='ProfilePage')english=english.replace('property="og:type" content="website"','property="og:type" content="profile"');
 else english=english.replace('<span class="ea-kicker">Services · Morocco</span>','<span class="ea-kicker">Services · Casablanca, Morocco</span>');
 english=english.replaceAll('href="/reserver-diagnostic/" hreflang="fr"','href="/en/diagnostic/"').replaceAll('Diagnostic form (French)','Request a free diagnostic').replaceAll('The diagnostic form and detailed guides are currently in French.','Detailed guides are currently in French.');
 english=english.replace(/(<nav class="ea-nav"[\s\S]*?<\/nav>)/,nav=>nav.replace(/ aria-current="page"/g,'').replace(`href="${page.en}"`,`href="${page.en}" aria-current="page"`));
 write(page.en.slice(1)+'index.html',english);
}
let sitemap=read('sitemap.xml');
let redirects=read('_redirects');
for(const p of pages){
 if(!sitemap.includes(`<loc>${origin}${p.en}</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>${origin}${p.en}</loc><lastmod>2026-10-29</lastmod></url>\n</urlset>`);
 for(const rule of [`${p.en.slice(0,-1)}  ${p.en}  301`,`${p.en}index.html  ${p.en}  301`])if(!redirects.includes(rule))redirects+='\n'+rule;
}
write('sitemap.xml',sitemap);write('_redirects',redirects.trimEnd()+'\n');
console.log('Built /en/services/ and /en/about/ with paired French language navigation. No deployment.');
