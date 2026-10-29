import assert from 'node:assert/strict';
import fs from 'node:fs';
import {faqs} from '../assets/data/english-home.js';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const french=read('index.html'),english=read('en/index.html');
const schemas=html=>JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
for(const [language,html,route]of [['fr',french,'/'],['en',english,'/en/']]){
 assert(html.includes(`<html lang="${language}">`));assert(html.includes(`rel="canonical" href="https://elboubakry.com${route}"`));
 assert(html.includes(`property="og:url" content="https://elboubakry.com${route}"`));
 for(const [code,path]of [['fr','/'],['en','/en/'],['x-default','/']])assert(html.includes(`hreflang="${code}" href="https://elboubakry.com${path}"`));
 assert.equal((html.match(/site-language-switch:start/g)||[]).length,1);assert.equal((html.match(/site-language-head:start/g)||[]).length,1);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);assert(html.includes(`hreflang="${language}" aria-current="page"`));
 const header=html.match(/<header[\s\S]*?<\/header>/)[0];assert.equal((header.match(/class="ea-nav-icon"/g)||[]).length,7);
 const graph=schemas(html),person=graph.find(x=>x['@type']==='Person'),service=graph.find(x=>x['@type']==='ProfessionalService'),page=graph.find(x=>x['@type']==='WebPage');
 assert.equal(person['@id'],'https://elboubakry.com/#person');assert.equal(person.name,'Elboubakry Abdessamad');assert.equal(service['@id'],'https://elboubakry.com/#service');
 assert.equal(service.address.addressLocality,'Casablanca');assert.equal(service.address.addressCountry,'MA');assert(!service.address.streetAddress);
 assert.equal(page.inLanguage,language);assert.equal(page.url,'https://elboubakry.com'+route);assert.deepEqual(graph.find(x=>x['@type']==='WebSite').inLanguage,['fr','en']);
 for(const match of html.matchAll(/href="#([^"\s]+)"/g))assert(html.includes(`id="${match[1]}"`),`Missing anchor ${match[1]}`);
 assert(!/aggregateRating|ratingValue|reviewCount/.test(JSON.stringify(graph)));
}
assert(french.includes('Consultant Marketing Digital &amp; IA'));assert(french.includes('href="/reserver-diagnostic/">Réserver un diagnostic'));
assert(english.includes('Digital Marketing &amp; AI Consultant'));assert(english.includes('Based in Casablanca'));
assert(!/J’aide|Réserver un|Accompagnement|Projets sélectionnés|Compétence clé|Basé à|Consulter/.test(english));
const faq=schemas(english).find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,faqs.length);
for(const [question,answer]of faqs){assert(english.includes(`<h3>${question}</h3>`));assert(english.includes(`<p>${answer}</p>`));assert(faq.mainEntity.some(x=>x.name===question&&x.acceptedAnswer.text===answer));}
assert(english.includes('rankings, indexing and citations in AI-generated answers are not guaranteed'));
assert(english.includes('href="mailto:abdozonetech@gmail.com?subject=Project%20enquiry"'));assert(english.includes('https://wa.me/212687321925?text='));
assert(english.includes('Review your message before sending.'));assert(english.includes('href="/en/diagnostic/"'));assert(english.includes('Request a free diagnostic'));
assert(english.includes('href="/en/services/"'));assert(english.includes('href="/en/about/"'));assert(!english.includes('href="/en/booking'));
assert(english.includes('Full profile'));assert(english.includes('View project'));assert(english.includes('href="/en/projects/'));assert(english.includes('href="/en/guides/"'));
for(const reference of ['wakalatalanbae.ma','casaaesthetic.com','novaconsort.com'])assert(english.includes(reference));
const imageSources=html=>[...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(imageSources(english),imageSources(french));
const sitemap=read('sitemap.xml');assert.equal((sitemap.match(/<loc>https:\/\/elboubakry.com\/en\/<\/loc>/g)||[]).length,1);
assert(read('_redirects').includes('/en  /en/  301'));assert(read('llms.txt').includes('https://elboubakry.com/en/'));
const script=read('assets/js/elboubakry-premium-portfolio.js');assert(script.includes("document.documentElement.lang === 'en'"));assert(script.includes("'Close menu' : 'Open menu'"));
assert(!/fetch\(|localStorage|location\.replace|navigator\.language/.test(script),'No forced language detection or external request');
console.log('PASS English homepage: French primary preserved, self-canonicals, reciprocal hreflang, one identity, truthful Morocco service data, visible/schema FAQ parity, original assets, labelled French links, safe contact drafts and translated menu.');
