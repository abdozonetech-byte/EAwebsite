import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {services,profileFaqs,career,credentials} from '../assets/data/english-core.js';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://elboubakry.com';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const esc=s=>s.replaceAll('&','&amp;');
for(const [file,fr,en,type]of [['services/index.html','/services/','/en/services/','CollectionPage'],['about-elboubakry-abdessamad.html','/about-elboubakry-abdessamad','/en/about/','ProfilePage']]){
 const french=read(file),english=read(en.slice(1)+'index.html');
 for(const html of [french,english]){
  assert.equal((html.match(/core-language-switch:start/g)||[]).length,1);
  for(const [code,url]of [['fr',fr],['en',en],['x-default',fr]])assert(html.includes(`hreflang="${code}" href="${origin}${url}"`));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
 }
 assert(english.includes('<html lang="en">'));
 assert(english.includes(`rel="canonical" href="${origin}${en}"`));
 assert(english.includes(`property="og:url" content="${origin}${en}"`));
 assert(english.includes('class="ea-button ea-button-primary"'),'Visible primary CTA');
 assert(english.includes(type==='ProfilePage'?'name="description" content="Meet Elboubakry':'name="description" content="Digital strategy'));
 assert(english.includes(`href="${en}" aria-current="page"`));
 assert(english.includes('href="/en/services/"'));assert(english.includes('href="/en/about/"'));
 assert(!english.includes('href="/en/booking'));
 assert(!/Réserver|Consultant Marketing Digital au Maroc|Quatre leviers/.test(english));
 assert(!/(?:href|src)="(?:\.\.\/)?assets\//.test(english),'assets must resolve from nested routes');
 for(const m of english.matchAll(/href="#([^"\s]+)"/g))assert(english.includes(`id="${m[1]}"`),'missing section '+m[1]);
 const graph=JSON.parse(english.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const page=graph.find(x=>x['@type']===type);assert.equal(page.url,origin+en);assert.equal(page.inLanguage,'en');
 const person=graph.find(x=>x['@type']==='Person');assert.equal(person['@id'],origin+'/#person');assert.equal(person.name,'Elboubakry Abdessamad');
 assert(!/aggregateRating|reviewCount|ratingValue/.test(JSON.stringify(graph)));
 if(type==='CollectionPage')for(const service of services)assert(english.includes(esc(service.title)));
 else{
  assert.equal(page.mainEntity['@id'],origin+'/#person');
  const faq=graph.find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,profileFaqs.length);
  for(const [q,a]of profileFaqs){assert(english.includes(esc(q)));assert(english.includes(esc(a)));assert(faq.mainEntity.some(x=>x.name===q&&x.acceptedAnswer.text===a));}
  for(const item of [...career,...credentials])for(const value of item)assert(english.includes(esc(value)));
 }
 const header=english.match(/<header[\s\S]*?<\/header>/)[0];assert.equal((header.match(/class="ea-nav-icon"/g)||[]).length,7);
 assert(english.includes('mailto:abdozonetech@gmail.com?subject=Project%20enquiry'));assert(english.includes('https://wa.me/212687321925?text='));
 for(const match of english.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){
  const url=match[1];if(url==='/'||url.startsWith('//'))continue;
  const candidate=path.join(root,url);assert(fs.existsSync(candidate)||fs.existsSync(candidate+'.html'),`Missing local link: ${url}`);
 }
 assert(read('sitemap.xml').includes(`<loc>${origin}${en}</loc>`));
}
console.log('PASS English services/profile: reciprocal language pairs, metadata, stable identity, FAQ parity, career/credentials, icons, anchors, contact drafts and local links.');
