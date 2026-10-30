// Stage 1 of the English website: additive homepage, no deployment or private APIs.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {translations,faqs} from '../assets/data/english-home.js';
import {languageAssets,languageControl} from './site-language-ui.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://elboubakry.com';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
let source=fs.readFileSync(path.join(root,'index.html'),'utf8');
source=source.replace(/<!-- site-language-(?:head|switch):start -->[\s\S]*?<!-- site-language-(?:head|switch):end -->\n?/g,'');
const graphMatch=source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if(!graphMatch)throw Error('Homepage structured data is missing.');
const frenchGraph=JSON.parse(graphMatch[1]);
const website=frenchGraph['@graph'].find(item=>item['@type']==='WebSite');
website.inLanguage=['fr','en'];
frenchGraph['@graph']=frenchGraph['@graph'].filter(item=>item['@id']!==origin+'/#webpage');
frenchGraph['@graph'].push({'@type':'WebPage','@id':origin+'/#webpage',url:origin+'/',name:'Consultant Marketing Digital & IA au Maroc | Elboubakry',inLanguage:'fr',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#person'},workTranslation:{'@id':origin+'/en/#webpage'}});
const alternates=`<link rel="alternate" hreflang="fr" href="${origin}/"><link rel="alternate" hreflang="en" href="${origin}/en/"><link rel="alternate" hreflang="x-default" href="${origin}/">`;
function languageHead(){return `<!-- site-language-head:start -->${languageAssets()}${alternates}<!-- site-language-head:end -->\n`;}
function languageSwitch(language){return `<!-- site-language-switch:start -->${languageControl('/','/en/',language)}<!-- site-language-switch:end -->`;}
function integrate(html,language){return html.replace('</head>',languageHead()+'</head>').replace('  <main id="main-content">',languageSwitch(language)+'  <main id="main-content">');}
const french=integrate(source.replace(graphMatch[0],`<script type="application/ld+json">${json(frenchGraph)}</script>`),'fr');

let english=source.replace(graphMatch[0],'__ENGLISH_HOME_GRAPH__');
for(const [fr,en] of Object.entries(translations).sort((a,b)=>b[0].length-a[0].length))english=english.split(escape(fr)).join(escape(en));
english=english.replace('<html lang="fr">','<html lang="en">').replace('name="language" content="fr-MA"','name="language" content="en"').replace('content="fr_MA"','content="en_US"').replace('content="Casablanca, Maroc"','content="Casablanca, Morocco"').replace(`rel="canonical" href="${origin}/"`,`rel="canonical" href="${origin}/en/"`).replace(`property="og:url" content="${origin}/"`,`property="og:url" content="${origin}/en/"`);
english=english.replaceAll('elboubakry-premium-portfolio.js?v=20261027-nav1','elboubakry-premium-portfolio.js?v=20261029-lang1');
english=english.replaceAll('href="/reserver-diagnostic/"','href="#contact"');
english=english.replaceAll('class="ea-logo" href="/"','class="ea-logo" href="/en/"');
english=english.replace(/(<nav class="ea-nav"[\s\S]*?<\/nav>)/,nav=>nav.replace('href="/services/"','href="#expertises"').replace('href="/about-elboubakry-abdessamad"','href="#profile"'));
english=english.replace('<section class="ea-section ea-section-soft" aria-labelledby="profile-note-title">','<section class="ea-section ea-section-soft" id="profile" aria-labelledby="profile-note-title">');
english=english.replace('<h1 id="hero-title">','<p class="ea-english-byline">Elboubakry Abdessamad</p><h1 id="hero-title">');
// Label every unfinished detail destination honestly; do not publish empty English routes.
english=english.replaceAll('href="/services/">Services</a>','href="#expertises">Services</a>').replaceAll('href="/projets/">Work</a>','href="#projets">Work</a>').replaceAll('href="/about-elboubakry-abdessamad">About</a>','href="#profile">About</a>');
english=english.replaceAll('href="/insights/"','href="/insights/" hreflang="fr"').replaceAll('href="/about-elboubakry-abdessamad"','href="/about-elboubakry-abdessamad" hreflang="fr"');
english=english.replaceAll('href="/projets/','hreflang="fr" href="/projets/').replaceAll('href="/insights/consultant-ia-business-maroc"','href="/insights/consultant-ia-business-maroc" hreflang="fr"');
english=english.replace(/<div class="ea-answer-grid"[\s\S]*?<\/div>/,`<section class="ea-english-faq" aria-labelledby="english-faq-title"><span class="ea-kicker">Clear answers</span><h2 id="english-faq-title">Digital marketing and AI consulting in Morocco</h2><div class="ea-answer-grid">${faqs.map(([question,answer])=>`<article class="ea-answer"><h3>${escape(question)}</h3><p>${escape(answer)}</p></article>`).join('')}</div></section>`);
const contact=`<div class="ea-english-contact"><a class="ea-button" href="mailto:abdozonetech@gmail.com?subject=Project%20enquiry">Email your project <span aria-hidden="true">↗</span></a><a class="ea-button ea-button-secondary" href="https://wa.me/212687321925?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20digital%20marketing%20or%20AI%20project." rel="noopener noreferrer">Open WhatsApp <span aria-hidden="true">↗</span></a><a class="ea-english-form-link" href="/reserver-diagnostic/" hreflang="fr">Diagnostic form (French) ↗</a><p>Review your message before sending. Detailed guides, project pages and the diagnostic form are currently in French.</p></div>`;
english=english.replace(/(<section class="ea-section ea-final-cta"[\s\S]*?)<a class="ea-button" href="#contact">[\s\S]*?<\/a>/,`$1${contact}`);
const englishGraph=structuredClone(frenchGraph);
englishGraph['@graph']=englishGraph['@graph'].filter(item=>!['WebPage','FAQPage'].includes(item['@type']));
const person=englishGraph['@graph'].find(item=>item['@type']==='Person');
person.jobTitle='Digital Marketing & Applied AI Consultant';person.description=faqs[0][1];person.homeLocation.name='Casablanca, Morocco';
person.knowsAbout=['Digital marketing strategy','Applied business AI','AI consulting','Process automation','AI assistants and agents','Meta Ads','Google Ads','SEO','Landing pages','Google Analytics','Google Search Console','Lead generation','Marketing automation','CRM','AI-assisted web development'];
const service=englishGraph['@graph'].find(item=>item['@type']==='ProfessionalService');
service.name='Elboubakry Abdessamad — Digital Marketing & AI Consulting';
service.areaServed=service.areaServed.map(area=>area['@type']==='Country'?{...area,name:'Morocco'}:area);
service.serviceType=['Digital marketing consulting','Applied business AI consulting','Process automation','AI assistants and agents','Digital strategy','Paid acquisition','SEO and content','Landing pages','Analytics and tracking','CRM and lead systems'];
englishGraph['@graph'].push({'@type':'WebPage','@id':origin+'/en/#webpage',url:origin+'/en/',name:translations['Consultant Marketing Digital & IA au Maroc | Elboubakry'],description:translations['Marketing, IA appliquée au business, automatisation et systèmes de leads pour les entreprises au Maroc.'],inLanguage:'en',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#person'},translationOfWork:{'@id':origin+'/#webpage'},dateModified:'2026-10-29'});
englishGraph['@graph'].push({'@type':'FAQPage','@id':origin+'/en/#faq',inLanguage:'en',mainEntity:faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
english=integrate(english.replace('__ENGLISH_HOME_GRAPH__',`<script type="application/ld+json">${json(englishGraph)}</script>`),'en');
// Published-in-source core English destinations (stage 2). Keep builds repeatable.
english=english.replaceAll('href="#expertises"','href="/en/services/"').replaceAll('href="#profile"','href="/en/about/"').replaceAll('href="/about-elboubakry-abdessamad" hreflang="fr"','href="/en/about/"').replaceAll('Full profile (French)','Full profile');
english=english.replaceAll('href="/reserver-diagnostic/" hreflang="fr"','href="/en/diagnostic/"').replaceAll('Diagnostic form (French)','Request a free diagnostic').replaceAll('Detailed guides, project pages and the diagnostic form are currently in French.','Detailed guides and project pages are currently in French.');
fs.writeFileSync(path.join(root,'index.html'),french);
fs.mkdirSync(path.join(root,'en'),{recursive:true});fs.writeFileSync(path.join(root,'en/index.html'),english);
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
if(!sitemap.includes(`<loc>${origin}/en/</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>${origin}/en/</loc><lastmod>2026-10-29</lastmod></url>\n</urlset>`);
sitemap=sitemap.replace(/(<loc>https:\/\/elboubakry\.com\/<\/loc>\s*<lastmod>)[^<]+/,'$12026-10-29');fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
let redirects=fs.readFileSync(path.join(root,'_redirects'),'utf8');for(const rule of ['/en  /en/  301','/en/index.html  /en/  301'])if(!redirects.includes(rule))redirects+='\n'+rule;fs.writeFileSync(path.join(root,'_redirects'),redirects.trimEnd()+'\n');
console.log('Built English homepage /en/; preserved French homepage, added reciprocal language signals. No deployment.');
