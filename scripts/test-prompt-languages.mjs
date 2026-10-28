import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prompts as en} from '../assets/data/prompts-en.js';
import {prompts as fr} from '../assets/data/prompts.js';
import {prompts as enIndex} from '../assets/data/prompt-index-en.js';
import {prompts as frIndex} from '../assets/data/prompt-index-fr.js';
import {registryFor,libraryBase} from '../assets/data/prompt-locales.js';
import {validateCatalog,customize,readFavorites,saveFavorites,filterPrompts,readState,safeReturnPath,escapeHTML} from '../assets/js/prompt-library-core.js';
import {card} from '../assets/js/prompt-library-render.js';
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
const registry=registryFor('en');validateCatalog(en,registry.categories,registry.models);
assert.equal(en.length,210);assert.equal(enIndex.length,210);assert.equal(frIndex.length,210);
assert.deepEqual(en.map(p=>p.id),fr.map(p=>p.id));
for(const category of registry.categories)assert.equal(en.filter(p=>p.category===category.id).length,15);
for(const [language,catalog,index] of [['en',en,enIndex],['fr',fr,frIndex]]){
 const base=libraryBase(language),main=read(base.slice(1)+'index.html');
 assert(main.includes(`<html lang="${language}">`));assert(main.includes('data-pl-language-link="en"'));assert(main.includes('data-pl-language-link="fr"'));
 for(const p of catalog){
  const suffix=p.slug+'/',html=read(base.slice(1)+suffix+'index.html');
  assert(html.includes(`<html lang="${language}">`));assert(html.includes(`<link rel="canonical" href="https://elboubakry.com${base+suffix}">`));
  for(const locale of ['en','fr'])assert(html.includes(`hreflang="${locale}" href="https://elboubakry.com${libraryBase(locale)+suffix}"`));
  assert(html.includes(`hreflang="x-default" href="https://elboubakry.com/prompts/${suffix}"`));
  assert(html.includes(escapeHTML(p.prompt)));assert.equal(JSON.parse(html.match(/id="pl-example-data">([\s\S]*?)<\/script>/)[1]),p.exampleResult);
  assert.deepEqual(JSON.parse(read(`assets/data/prompt-details/${language}/${p.slug}.json`)),p);
  assert(index.find(q=>q.id===p.id));assert(main.includes(`${base+p.slug}/`));
  assert(html.includes(`"inLanguage":"${language}"`));
  const rendered=card(p,false,'?category=design&page=2',language);assert(rendered.includes(base+p.slug+'/'));assert(rendered.includes(language==='en'?'Copy prompt':'Copier le prompt'));
 }
 const guide=read(base.slice(1)+'guide/index.html');assert(guide.includes(`<html lang="${language}">`));assert.equal((guide.match(/id="etape-\d+"/g)||[]).length,10);
}
for(const p of en){const original=fr.find(q=>q.id===p.id);assert.notEqual(p.prompt,original.prompt);assert.notEqual(p.exampleResult,original.exampleResult);assert(/^Act as an? /.test(p.prompt));assert.equal(p.provenance.sourceId,p.id);assert.equal(p.provenance.modelTested,false);assert(!/\b(?:Agis|Exemple|Définis|Fournis|hypothèses)\b/.test(p.prompt+p.exampleResult));}
assert.equal(customize('[TARGET AUDIENCE] / [TARGET AUDIENCE]',{'TARGET AUDIENCE':'Casablanca $& <b>'}),'Casablanca $& <b> / Casablanca $& <b>');
assert.equal(safeReturnPath('/prompts/fr/?category=design'),'/prompts/fr/?category=design');assert.equal(safeReturnPath('https://evil.test','/prompts/fr/'),'/prompts/fr/');
const storage={value:null,getItem(){return this.value;},setItem(key,value){this.value=value;}};saveFavorites(storage,[en[0].id]);assert.deepEqual(readFavorites(storage,fr),[fr[0].id]);
assert(filterPrompts(enIndex,{...readState('',enIndex),q:'privacy'}).length>0);
const home=read('prompts/index.html');assert(home.includes('AI Prompt<br><span>Library.'));assert(home.includes('English is the default language.'));assert(!home.includes('Bibliothèque de<br>'));
console.log('PASS: 210 English adaptations and preserved French sources; 424 static pages, locale-specific indexes/payloads, reciprocal hreflang/x-default, correct canonical/document/schema languages, English default, shared favourites, safe return paths, English search and literal customisation.');
