import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {translations,faqs} from '../assets/data/english-diagnostic.js';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://elboubakry.com';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const translate=(html,map)=>{for(const [fr,en]of Object.entries(map).sort((a,b)=>b[0].length-a[0].length))html=html.split(esc(fr)).join(esc(en));return html;};
const fr='/reserver-diagnostic/',en='/en/diagnostic/';
const head=`<!-- diagnostic-language-head:start --><link rel="stylesheet" href="/assets/css/site-languages.css?v=20261029-3"><link rel="alternate" hreflang="fr" href="${origin}${fr}"><link rel="alternate" hreflang="en" href="${origin}${en}"><link rel="alternate" hreflang="x-default" href="${origin}${fr}"><!-- diagnostic-language-head:end -->`;
const switcher=lang=>`<!-- diagnostic-language-switch:start --><div class="ea-language-row"><div class="ea-container"><span>${lang==='en'?'Free marketing diagnostic · Morocco':'Diagnostic marketing gratuit · Maroc'}</span><nav aria-label="${lang==='en'?'Website language':'Langue du site'}"><a href="${fr}" lang="fr" hreflang="fr"${lang==='fr'?' aria-current="page"':''}>FR <span>Français</span></a><a href="${en}" lang="en" hreflang="en"${lang==='en'?' aria-current="page"':''}>EN <span>English</span></a></nav></div></div><!-- diagnostic-language-switch:end -->`;
let source=read('reserver-diagnostic/index.html').replace(/<!-- diagnostic-language-(?:head|switch):start -->[\s\S]*?<!-- diagnostic-language-(?:head|switch):end -->/g,'').replaceAll('reserver-diagnostic.js?v=20260928-ux2','reserver-diagnostic.js?v=20261029-i18n1');
write('reserver-diagnostic/index.html',source.replace('</head>',head+'</head>').replace('<main>',switcher('fr')+'<main>'));
let english=source.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
// English labels retain the exact API-approved French values (CRM contract).
const sectors=[];
english=english.replace(/<option>([^<]+)<\/option>/g,(_,value)=>{const index=sectors.push(value)-1;return `<option value="__SECTOR_${index}__">${value}</option>`;});
english=translate(english,translations);
sectors.forEach((value,i)=>{english=english.replace(`__SECTOR_${i}__`,value);});
english=english.replace('lang="fr"','lang="en"').replaceAll('content="fr_MA"','content="en_US"')
 .replaceAll('href="../assets/','href="/assets/').replaceAll('src="../assets/','src="/assets/')
 .replaceAll(origin+fr,origin+en).replaceAll('href="/#homeonepage"','href="/en/"')
 .replaceAll('href="/politique-confidentialite"','href="/politique-confidentialite" hreflang="fr"')
 .replaceAll('href="/mentions-legales"','href="/mentions-legales" hreflang="fr"')
 .replaceAll('href="/politique-cookies"','href="/politique-cookies" hreflang="fr"')
 .replace('aria-describedby="phone-error"','aria-describedby="phone-error phone-help"')
 .replace('<p aria-live="polite" class="field-error" id="phone-error"></p>','<p aria-live="polite" class="field-error" id="phone-error"></p><p id="phone-help" class="diagnostic-phone-help">Moroccan mobile number: 06, 07 or +212. For other countries, <a href="mailto:abdozonetech@gmail.com">email me instead</a>.</p>')
 .replace('<body>','<body class="ea-diagnostic-english">');
english=english.replace(/<div class="faq-list">[\s\S]*?<\/div>/,`<div class="faq-list">${faqs.map(([q,a],i)=>`<details${i===0?' open':''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`);
const graph={'@context':'https://schema.org','@graph':[
 {'@type':'ContactPage','@id':origin+en+'#page',name:translations['Diagnostic Marketing Gratuit | Elboubakry Abdessamad'],description:translations["Demandez un diagnostic marketing gratuit et confidentiel pour clarifier vos priorités d'acquisition, de conversion et de mesure avec Elboubakry Abdessamad."],url:origin+en,inLanguage:'en',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#person'},translationOfWork:{'@id':origin+fr},dateModified:'2026-10-29'},
 {'@type':'Person','@id':origin+'/#person',name:'Elboubakry Abdessamad',jobTitle:'Digital Marketing Consultant in Morocco'},
 {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/en/'},{'@type':'ListItem',position:2,name:'Free marketing diagnostic',item:origin+en}]},
 {'@type':'FAQPage','@id':origin+en+'#faq',inLanguage:'en',mainEntity:faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))}
]};
english=english.replace('</head>',head+`<script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script></head>`).replace('<main>',switcher('en')+'<main>');
write('en/diagnostic/index.html',english);
const thanksMap={
 'Merci | Elboubakry Abdessamad':'Thank You | Elboubakry Abdessamad',
 'Merci — Demande reçue | Elboubakry Abdessamad':'Thank You — Enquiry Received | Elboubakry Abdessamad',
 'Merci, votre demande de diagnostic marketing a été envoyée avec succès.':'Thank you. Your marketing diagnostic request has been sent successfully.',
 'Votre demande de diagnostic marketing a été envoyée avec succès.':'Your marketing diagnostic request has been sent successfully.',
 'Merci, votre demande a été envoyée avec succès.':'Thank you. Your enquiry has been sent successfully.',
 'Je vous contacterai rapidement pour discuter de votre projet.':'I will contact you to discuss your project.',
 'En-tête':'Header',
 'Retour au portfolio Elboubakry Abdessamad':'Back to the Elboubakry Abdessamad portfolio',
 'Retour au portfolio':'Back to portfolio',
 'Me contacter sur WhatsApp':'Contact me on WhatsApp',
 'Tous droits réservés.':'All rights reserved.',
 'Confidentialité':'Privacy (French)',
 'Mentions légales':'Legal notice (French)',
 'Cookies':'Cookies (French)',
 'Elboubakry Abdessamad, consultant marketing digital au Maroc':'Elboubakry Abdessamad, digital marketing consultant in Morocco'
};
let thanks=translate(read('merci/index.html'),thanksMap).replace('lang="fr"','lang="en"').replaceAll('fr_MA','en_US').replaceAll(origin+'/merci/',origin+'/en/thank-you/').replaceAll('href="../assets/','href="/assets/').replaceAll('src="../assets/','src="/assets/').replaceAll('href="/#homeonepage"','href="/en/"');
write('en/thank-you/index.html',thanks);
let sitemap=read('sitemap.xml');if(!sitemap.includes(`<loc>${origin}${en}</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>${origin}${en}</loc><lastmod>2026-10-29</lastmod></url>\n</urlset>`);write('sitemap.xml',sitemap);
let redirects=read('_redirects');for(const route of [en,'/en/thank-you/'])for(const rule of [`${route.slice(0,-1)}  ${route}  301`,`${route}index.html  ${route}  301`])if(!redirects.includes(rule))redirects+='\n'+rule;write('_redirects',redirects.trimEnd()+'\n');
let headers=read('_headers');if(!headers.includes('/en/thank-you/'))headers+='\n/en/thank-you/\n  X-Robots-Tag: noindex, follow\n';write('_headers',headers);
console.log('Built English diagnostic and noindex thank-you page. Existing /api/leads contract preserved. No submissions.');
