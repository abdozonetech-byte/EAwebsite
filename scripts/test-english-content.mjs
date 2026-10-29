import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {guides,projects} from '../assets/data/english-guides.js';
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://elboubakry.com';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll("'",'&#39;');
const pairs=[['/projets/','/en/projects/','projets/index.html'],['/insights/','/en/guides/','insights/index.html'],...guides.map(g=>[g.fr,'/en/guides/'+g.slug+'/',g.fr.slice(1)+'.html'])];
for(const [fr,en,file]of pairs){
 const french=read(file),html=read(en.slice(1)+'index.html');
 assert(html.includes('<html lang="en">'));assert(html.includes(`rel="canonical" href="${origin}${en}"`));assert(html.includes(`property="og:url" content="${origin}${en}"`));
 for(const text of [french,html]){
  for(const [code,route]of [['fr',fr],['en',en],['x-default',fr]])assert(text.includes(`hreflang="${code}" href="${origin}${route}"`));
  assert.equal((text.match(/content-language-switch:start/g)||[]).length,1);
  assert.equal((text.match(/content-language-head:start/g)||[]).length,1);
 }
 assert.equal((html.match(/<h1\b/g)||[]).length,1);assert(!/data-reveal/.test(html),'Long-form content does not wait for animation');
 assert(html.includes(`<a href="${fr}" lang="fr" hreflang="fr">FR`),'French switch must keep French destination');
 for(const match of html.matchAll(/href="#([^"\s]+)"/g))assert(html.includes(`id="${match[1]}"`),'Missing section: '+match[1]);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){
  const route=match[1];if(route==='/'||route.startsWith('//'))continue;
  const target=path.join(root,route);assert(fs.existsSync(target)||fs.existsSync(target+'.html'),'Missing local destination: '+route);
 }
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(graph.find(x=>x['@type']==='Person')['@id'],origin+'/#person');
 const page=graph.find(x=>['CollectionPage','Article'].includes(x['@type']));assert.equal(page.url,origin+en);assert.equal(page.inLanguage,'en');assert.equal(page.translationOfWork['@id'],origin+fr);
 assert(!/aggregateRating|ratingValue|reviewCount/.test(JSON.stringify(graph)));
 assert(read('sitemap.xml').includes(`<loc>${origin}${en}</loc>`));
 assert.equal((html.match(/class="ea-nav-icon"/g)||[]).length,7);
 const guide=guides.find(g=>g.fr===fr);
 if(guide){
  assert.equal(page['@type'],'Article');assert.equal(page.author['@id'],origin+'/#person');assert(html.includes('By <a href="/en/about/">Elboubakry Abdessamad'));
  assert(html.includes(`href="${fr}" hreflang="fr">Read the French version`));
  assert(html.includes('aria-label="On this page"'));
  const faq=graph.find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,guide.faqs.length);
  for(const [q,a]of guide.faqs){assert(html.includes(esc(q)));assert(html.includes(esc(a)));assert(faq.mainEntity.some(x=>x.name===q&&x.acceptedAnswer.text===a));}
  for(const section of guide.sections){assert(html.includes(esc(section.title)));for(const text of [...(section.paragraphs||[]),...(section.items||[])])assert(html.includes(esc(text)));}
 }
}
const portfolio=read('en/projects/index.html'),frPortfolio=read('projets/index.html');
assert(portfolio.includes('not client case studies or evidence of sales performance'));assert(portfolio.includes('Demonstration'));
for(const p of projects){assert(portfolio.includes(`id="${p.id}"`));assert(portfolio.includes(esc(p.title)));assert(portfolio.includes('/assets/images/projects/'+p.image));}
const images=html=>[...html.matchAll(/src="(\/assets\/images\/projects\/[^"]+)"/g)].map(m=>m[1]);assert.deepEqual(images(portfolio),images(frPortfolio));
for(const file of ['en/index.html','en/services/index.html','en/about/index.html',...pairs.map(([,en])=>en.slice(1)+'index.html')]){
 const html=read(file),header=html.match(/<header[\s\S]*?<\/header>/)[0];
 assert(header.includes('href="/en/guides/"'));assert(header.includes('href="/en/projects/"'));assert(!header.includes('Guides (FR)'));assert(!/href="\/en\/(?:guides|projects)\/[^>]*hreflang="fr"/.test(html));
}
console.log('PASS English content: five language pairs, English navigation, local links/anchors, author identity, visible FAQ/schema parity, original project visuals and honest demonstration labels.');
