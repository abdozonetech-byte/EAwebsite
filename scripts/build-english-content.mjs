// Stage 4: translated portfolio and a selected English guide collection. Local only.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {guides,projects} from '../assets/data/english-guides.js';
import {languageAssets,languageControl} from './site-language-ui.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://elboubakry.com';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const template=read('en/services/index.html');
const baseGraph=JSON.parse(template.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].filter(x=>['Person','WebSite','ProfessionalService'].includes(x['@type']));
const head=(fr,en)=>`<!-- content-language-head:start -->${languageAssets()}<link rel="alternate" hreflang="fr" href="${origin}${fr}"><link rel="alternate" hreflang="en" href="${origin}${en}"><link rel="alternate" hreflang="x-default" href="${origin}${fr}"><!-- content-language-head:end -->`;
const switcher=(fr,en,lang)=>`<!-- content-language-switch:start -->${languageControl(fr,en,lang)}<!-- content-language-switch:end -->`;
const cta=`<section class="ea-section ea-section-soft" id="contact"><div class="ea-container"><h2>Choose the next useful step.</h2><p>Discuss your objective and current obstacles before adding more tools, campaigns or complexity.</p><div class="ea-core-actions"><a class="ea-button ea-button-primary" href="/en/diagnostic/">Request a free diagnostic ↗</a><a class="ea-text-link" href="/en/services/">Explore services →</a></div></div></section>`;
const hero=(label,title,intro)=>`<section class="ea-core-hero"><div class="ea-container"><nav class="ea-core-breadcrumb" aria-label="Breadcrumb"><a href="/en/">Home</a><span>/</span>${!['Projects','Guides'].includes(label)?'<a href="/en/guides/">Guides</a><span>/</span>':''}<span>${esc(label)}</span></nav><span class="ea-kicker">${esc(label)} · Morocco</span><h1>${esc(title)}</h1><p>${esc(intro)}</p></div></section>`;
const guideCards=()=>`<div class="ea-core-grid">${guides.map(g=>`<article class="ea-core-card"><span class="ea-kicker">${esc(g.category)}</span><h3><a href="/en/guides/${g.slug}/">${esc(g.title)}</a></h3><p>${esc(g.description)}</p><a class="ea-text-link" href="/en/guides/${g.slug}/">Read guide →</a></article>`).join('')}</div>`;
const pages=[
 {fr:'/projets/',en:'/en/projects/',file:'projets/index.html',label:'Projects',type:'CollectionPage',title:'Digital Marketing, AI & Automation Projects | Elboubakry',description:'Four transparent project demonstrations: lead systems, landing pages, SEO analytics and AI automation by Elboubakry Abdessamad in Morocco.',body:hero('Projects','Projects designed as useful systems.','These demonstrations show my approach and the components I can build. They are not client case studies or evidence of sales performance, and they contain no invented client results.')+`<div class="ea-container">${projects.map((p,i)=>`<article class="ea-project-detail" id="${p.id}"><div><span class="ea-project-number">0${i+1} · Demonstration</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><h3>${p.heading}</h3><ul>${p.items.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>${p.extra?`<h3>Verifiable components</h3><ul>${p.extra.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}<h3>${p.extra?'Transparent limits':'Intended value'}</h3><p>${esc(p.value)}</p>${p.extra?'<a class="ea-text-link" href="/en/guides/ai-business-consultant-morocco/">Explore the AI consulting approach →</a>':''}</div><div class="ea-detail-visual"><img class="ea-project-image" src="/assets/images/projects/${p.image}" width="1400" height="933" loading="lazy" decoding="async" alt="${esc(p.alt)}"></div></article>`).join('')}</div>`+cta},
 {fr:'/insights/',en:'/en/guides/',file:'insights/index.html',label:'Guides',type:'CollectionPage',title:'Digital Marketing & Business AI Guides in Morocco | Elboubakry',description:'English guides to marketing priorities, AI consulting and lead automation for businesses in Casablanca and across Morocco.',body:hero('Guides','Clear thinking for marketing and business AI.','Start with three practical English guides, adapted from the existing French collection. Choose a business problem, understand the trade-offs and identify a useful next step.')+`<section class="ea-section"><div class="ea-container"><h2>Explore the priority guides.</h2>${guideCards()}<p>More topics are available in the <a class="ea-text-link" href="/insights/" hreflang="fr">full French guide collection ↗</a>.</p></div></section>`+cta},
 ...guides.map(g=>({fr:g.fr,en:'/en/guides/'+g.slug+'/',file:g.fr.slice(1)+'.html',label:g.category,type:'Article',title:g.title,description:g.description,guide:g,body:hero(g.category,g.title,g.intro)+`<div class="ea-container ea-guide-layout"><article class="ea-guide-article"><p class="ea-guide-byline">By <a href="/en/about/">Elboubakry Abdessamad</a> · Marketing &amp; applied AI consultant, Casablanca<br>English adaptation · Updated <time datetime="2026-10-29">29 October 2026</time></p><nav class="ea-guide-contents" aria-label="On this page"><h2>On this page</h2><ol>${g.sections.map((s,i)=>`<li><a href="#section-${i+1}">${esc(s.title)}</a></li>`).join('')}<li><a href="#faq">Questions &amp; answers</a></li></ol></nav>${g.sections.map((s,i)=>`<section id="section-${i+1}"><h2>${esc(s.title)}</h2>${(s.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${s.items?`<ul>${s.items.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:''}</section>`).join('')}<section id="faq"><h2>Questions &amp; answers</h2>${g.faqs.map(([q,a])=>`<details class="ea-guide-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section><p class="ea-core-note">This guide describes an approach, not a guarantee of revenue, search rankings or mentions in AI-generated answers.</p><a class="ea-text-link" href="${g.fr}" hreflang="fr">Read the French version ↗</a></article><aside class="ea-guide-sidebar"><div class="ea-core-card"><h2>Continue exploring</h2><ul>${guides.filter(other=>other!==g).map(other=>`<li><a href="/en/guides/${other.slug}/">${esc(other.category)} →</a></li>`).join('')}<li><a href="/en/projects/">Project demonstrations →</a></li></ul><a class="ea-button ea-button-primary" href="/en/diagnostic/">Discuss your project ↗</a></div></aside></div>`+cta}))
];
for(const page of pages){
 let french=read(page.file).replace(/<!-- content-language-(?:head|switch):start -->[\s\S]*?<!-- content-language-(?:head|switch):end -->/g,'');
 french=french.replace('</head>',head(page.fr,page.en)+'</head>').replace('<main id="main-content">',switcher(page.fr,page.en,'fr')+'<main id="main-content">');
 if(!french.includes('content-language-switch:start'))throw Error('Missing language switch insertion point: '+page.file);
 write(page.file,french);
 const schema={'@type':page.type,'@id':origin+page.en+'#page',url:origin+page.en,name:page.title,inLanguage:'en',description:page.description,isPartOf:{'@id':origin+'/#website'},author:{'@id':origin+'/#person'},translationOfWork:{'@id':origin+page.fr},dateModified:'2026-10-29'};
 if(page.type==='Article'){schema.headline=page.title;schema.mainEntityOfPage=origin+page.en;schema.image=origin+'/assets/images/elboubakry-social-card.jpg';}
 else schema.mainEntity={'@type':'ItemList',itemListElement:(page.label==='Projects'?projects.map(p=>({name:p.title,url:origin+page.en+'#'+p.id})):guides.map(g=>({name:g.title,url:origin+'/en/guides/'+g.slug+'/'}))).map((p,i)=>({'@type':'ListItem',position:i+1,...p}))};
 const graph=[...structuredClone(baseGraph),schema,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/en/'},...(page.type==='Article'?[{'@type':'ListItem',position:2,name:'Guides',item:origin+'/en/guides/'}]:[]),{'@type':'ListItem',position:page.type==='Article'?3:2,name:page.type==='Article'?page.title:page.label,item:origin+page.en}]}];
 if(page.guide)graph.push({'@type':'FAQPage','@id':origin+page.en+'#faq',inLanguage:'en',mainEntity:page.guide.faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
 let english=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(page.title)}</title>`)
 .replace(/(<meta name="(?:description|twitter:description)" content=")[^"]*/g,'$1'+esc(page.description))
 .replace(/(<meta property="og:description" content=")[^"]*/g,'$1'+esc(page.description))
 .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g,'$1'+esc(page.title))
 .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${origin}${page.en}">`)
 .replace(/<meta property="og:url"[^>]*>/,`<meta property="og:url" content="${origin}${page.en}">`)
 .replace('property="og:type" content="website"',`property="og:type" content="${page.type==='Article'?'article':'website'}"`)
 .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`)
 .replace(/<!-- core-language-head:start -->[\s\S]*?<!-- core-language-head:end -->/,head(page.fr,page.en))
 .replace(/<!-- core-language-switch:start -->[\s\S]*?<!-- core-language-switch:end -->/,switcher(page.fr,page.en,'en'))
 .replace(/<main id="main-content"[\s\S]*?<\/main>/,`<main id="main-content" class="ea-core-page">${page.body}</main>`);
 english=english.replace(/(<nav class="ea-nav"[\s\S]*?<\/nav>)/,nav=>nav.replace(/ aria-current="page"/g,'').replace(`href="${page.label==='Projects'?'/en/#projets':'/insights/'}"`,`href="${page.label==='Projects'?'/en/projects/':'/en/guides/'}" aria-current="page"`));
 write(page.en.slice(1)+'index.html',english);
}
// Connect all core English pages after their generators run. Do not touch French links elsewhere.
const englishFiles=['en/index.html','en/services/index.html','en/about/index.html',...pages.map(p=>p.en.slice(1)+'index.html')];
for(const file of englishFiles){
 let html=read(file);
 const languageSwitch=html.match(/<!-- (?:site|core|content)-language-switch:start -->[\s\S]*?<!-- (?:site|core|content)-language-switch:end -->/)?.[0];
 if(!languageSwitch)throw Error('Missing language controls: '+file);
 html=html.replace(languageSwitch,'__PRESERVED_LANGUAGE_SWITCH__').replaceAll('href="#projets"','href="/en/projects/"').replaceAll('href="/en/#projets"','href="/en/projects/"').replaceAll('href="/insights/" hreflang="fr">Guides (FR)','href="/en/guides/">Guides')
 .replaceAll('href="/insights/" hreflang="fr"><svg','href="/en/guides/"><svg').replaceAll('<span>Guides (FR)</span>','<span>Guides</span>')
 .replaceAll('href="/insights/" aria-current="page"','href="/en/guides/" aria-current="page"')
 .replaceAll('href="/projets/','href="/en/projects/').replaceAll('Full project collection (French)','Full project collection').replaceAll('View project (French)','View project')
 .replaceAll('Detailed guides and project pages are currently in French.','More guides are available in French.').replaceAll('Detailed guides are currently in French.','More guides are available in French.');
 for(const g of guides){html=html.replaceAll(`href="${g.fr}" hreflang="fr"`,`href="/en/guides/${g.slug}/"`).replaceAll(`href="${g.fr}"`,`href="/en/guides/${g.slug}/"`);}
 // Keep the explicit French-version links on translated articles.
 const own=pages.find(p=>p.guide&&file===p.en.slice(1)+'index.html');if(own)html=html.replace(`href="${own.en}">Read the French version`,`href="${own.fr}" hreflang="fr">Read the French version`);
 html=html.replaceAll('AI and business consulting (French)','AI and business consulting');
 html=html.replace(/<a\b[^>]*href="\/en\/(?:projects|guides)\/[^>]*>/g,tag=>tag.replace(/ hreflang="fr"/g,''));
 html=html.replace(/site-languages.css\?v=[^" ]+/g,'site-languages.css?v=20261030-1');
 html=html.replace('__PRESERVED_LANGUAGE_SWITCH__',languageSwitch);
 write(file,html);
}
let sitemap=read('sitemap.xml'),redirects=read('_redirects');
for(const page of pages){
 if(!sitemap.includes(`<loc>${origin}${page.en}</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>${origin}${page.en}</loc><lastmod>2026-10-29</lastmod></url>\n</urlset>`);
 for(const rule of [`${page.en.slice(0,-1)}  ${page.en}  301`,`${page.en}index.html  ${page.en}  301`])if(!redirects.includes(rule))redirects+='\n'+rule;
}
write('sitemap.xml',sitemap);write('_redirects',redirects.trimEnd()+'\n');
// Place paired language anchors in the header at build time, not with client-side DOM moves.
const pairedFiles=['index.html','services/index.html','about-elboubakry-abdessamad.html','reserver-diagnostic/index.html',...pages.map(p=>p.file),...englishFiles,'en/diagnostic/index.html'];
for(const file of new Set(pairedFiles)){
 let html=read(file);
 const block=html.match(/<!-- (?:site|core|content|diagnostic)-language-switch:start -->[\s\S]*?<!-- (?:site|core|content|diagnostic)-language-switch:end -->/)?.[0];
 if(!block)throw Error('Missing language switch: '+file);
 html=html.replace(block,'');
 html=html.replace(/<header\b[\s\S]*?<\/header>/,header=>{
  if(header.includes('ea-menu-button'))return header.replace(/<button class="ea-menu-button"/,block+'<button class="ea-menu-button"');
  return header.replace('</header>',block+'</header>');
 });
 write(file,html);
}
console.log('Built English projects, guide collection and three adapted guides; connected paired language links and navbar selectors. No deployment.');
