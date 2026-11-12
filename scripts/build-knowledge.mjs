import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {profile,courses} from '../content/professional.mjs';
const records=[];
const add=(record)=>records.push({...record,text:record.text.replace(/\s+/g,' ').trim()});
for(const language of ['fr','en']){
 const p=profile[language],fr=language==='fr',about=fr?'/about-elboubakry-abdessamad':'/en/about/';
 add({id:'profile-'+language,kind:'profile',language,url:about,title:profile.name,text:`${profile.name}. ${p.role}. ${p.intro} ${p.teaching} ${p.skills.join('. ')}. ${fr?'Basé à Casablanca. Langues : arabe, français et anglais.':'Based in Casablanca. Languages: Arabic, French and English.'}`});
 add({id:'contact-'+language,kind:'contact',language,url:fr?'/formations/':'/en/training/',title:fr?'Contact et inscription':'Contact and enrolment',text:fr?`Contacter Abdessamad pour un devis de service ou une formation : ${profile.email}, WhatsApp +${profile.whatsapp}. Aucun tarif, durée, date, format ni certification de fin de formation n’est confirmé. Demander les modalités directement. Aucun paiement ou inscription sur le site.`:`Contact Abdessamad for services or training: ${profile.email}, WhatsApp +${profile.whatsapp}. No training price, duration, date, delivery format or completion certification is confirmed. Confirm terms directly. No payment or enrolment on this site.`});
 for(const c of courses.filter(c=>c.status==='approved')){
  const d=c[language];add({id:c.id+'-'+language,kind:'course',language,topic:c.cluster,url:(fr?'/formations/':'/en/training/')+c.id+'/',title:d.title,text:`${d.overview} ${fr?'Public':'Audience'}: ${d.audience} ${fr?'Niveau':'Level'}: ${d.level}. ${fr?'Prérequis':'Prerequisites'}: ${d.prerequisites} ${fr?'Objectifs':'Objectives'}: ${d.objectives.join('; ')}. ${fr?'Modules':'Modules'}: ${d.modules.map(m=>m[0]+': '+m[1]).join(' ')} ${fr?'Projet final':'Final project'}: ${d.outcome}`});
  d.modules.forEach((m,i)=>add({id:c.id+'-'+language+'-module-'+i,kind:'module',language,topic:c.cluster,url:(fr?'/formations/':'/en/training/')+c.id+'/#modules',title:d.title+' — '+m[0],text:m.join('. ')}));
 }
}
const manifest=JSON.parse(fs.readFileSync('content/approved-pages.json','utf8'));
for(const item of manifest.filter(x=>x.status==='approved')){
 if(!/^(insights\/|en\/guides\/|services\/|en\/services\/|projets\/|en\/projects\/)/.test(item.file)||item.file.includes('..'))throw Error('Unapproved source path: '+item.file);
 const doc=parseHTML(fs.readFileSync(item.file,'utf8')).document;
 const url=new URL(doc.querySelector('[rel=canonical]').getAttribute('href')).pathname;
 const main=doc.querySelector('.ea-article-content')||doc.querySelector('.ea-guide-article')||doc.querySelector('main');
 if(!main)throw Error('No visible source content: '+item.file);
 for(const unwanted of main.querySelectorAll('script,style,nav,aside,.tr-related,.tr-profile'))unwanted.remove();
 const title=doc.querySelector('h1')?.textContent.trim()||doc.title;
 const pieces=[...main.querySelectorAll('h2,h3,p,li')].map(n=>n.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);
 let chunk='',index=0;
 const flush=()=>{if(chunk)add({id:item.file+'-'+index++,kind:item.kind,language:item.language,url,title,text:chunk});chunk='';};
 for(const piece of pieces){if(chunk.length+piece.length>1400)flush();chunk+=(chunk?' ':'')+piece;}flush();
}
const serialized=JSON.stringify(records);
const output={version:1,contentHash:createHash('sha256').update(serialized).digest('hex'),records};
fs.mkdirSync('assets/ai',{recursive:true});
fs.writeFileSync('assets/ai/knowledge.json',JSON.stringify(output)+'\n');
console.log(`Built ${records.length} approved local knowledge records (${Buffer.byteLength(JSON.stringify(output))} bytes). Drafts excluded.`);
