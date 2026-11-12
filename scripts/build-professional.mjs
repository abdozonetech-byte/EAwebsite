import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {profile,courses,clusters} from '../content/professional.mjs';
import {languageAssets,languageControl} from './site-language-ui.mjs';

export const origin='https://elboubakry.com';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const block=(id,s)=>`<!-- professional:${id}:start -->${s}<!-- professional:${id}:end -->`;
const replaceBlock=(html,id,s,anchor='</main>')=>{
 const re=new RegExp(`<!-- professional:${id}:start -->[\\s\\S]*?<!-- professional:${id}:end -->`,'g');
 return re.test(html)?html.replace(re,block(id,s)):html.replace(anchor,block(id,s)+anchor);
};
const base=lang=>lang==='fr'?'/formations/':'/en/training/';
const courseUrl=(c,lang)=>base(lang)+c.id+'/';
const home=lang=>lang==='fr'?'/':'/en/';
const about=lang=>lang==='fr'?'/about-elboubakry-abdessamad':'/en/about/';
const service=lang=>lang==='fr'?'/services/':'/en/services/';
const hub=lang=>lang==='fr'?'/insights/':'/en/guides/';
const guide=(slug,lang)=>lang==='fr'?'/insights/'+slug:'/en/guides/'+slug+'/';
const guideTitle=(slug,lang)=>{
 const html=read(lang==='fr'?`insights/${slug}.html`:`en/guides/${slug}/index.html`);
 return html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g,'').trim()||slug.replaceAll('-',' ');
};
const list=items=>'<ul>'+items.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>';
const person=lang=>({'@type':'Person','@id':origin+'/#person',name:profile.name,alternateName:'Abdessamad Elboubakry',url:origin+about(lang),image:origin+profile.portrait,jobTitle:profile[lang].role,description:profile[lang].intro,knowsAbout:profile[lang].skills,knowsLanguage:profile.languages,homeLocation:{'@type':'Place',name:lang==='fr'?'Casablanca, Maroc':'Casablanca, Morocco'},sameAs:[profile.linkedin]});
const mail=(lang,title='')=>`mailto:${profile.email}?subject=${encodeURIComponent((lang==='fr'?'Demande de formation':'Training enquiry')+(title?' — '+title:''))}&body=${encodeURIComponent(lang==='fr'?'Bonjour Abdessamad,\nJe souhaite discuter d’une formation.\nObjectif :\nNiveau actuel :\nNombre de participants :\n':'Hello Abdessamad,\nI would like to discuss training.\nObjective:\nCurrent level:\nNumber of participants:\n')}`;
const contact=(lang,title='')=>`<div class="tr-actions"><a class="ea-button ea-button-primary" href="${esc(mail(lang,title))}">${lang==='fr'?'Demander cette formation':'Enquire about training'} <span aria-hidden="true">↗</span></a><a class="ea-text-link" href="https://wa.me/${profile.whatsapp}?text=${encodeURIComponent((lang==='fr'?'Bonjour, je souhaite discuter de la formation ':'Hello, I would like to discuss training: ')+title)}" rel="noopener noreferrer">WhatsApp ↗</a></div>`;
const terms=lang=>lang==='fr'?'Le programme est adapté à votre objectif après un échange. Durée, tarif, modalités et dates sont à confirmer directement ; aucune inscription n’est effectuée sur ce site.':'The programme is adapted to your objective after a discussion. Duration, price, delivery arrangements and dates must be confirmed directly; this site does not complete enrolment.';
const cards=lang=>`<div class="tr-cards">${courses.filter(c=>c.status==='approved').map((c,i)=>`<article class="tr-card"><span class="tr-number">0${i+1}</span><p class="tr-label">${esc(c[lang].eyebrow)}</p><h3><a href="${courseUrl(c,lang)}">${esc(c[lang].title)}</a></h3><p>${esc(c[lang].overview)}</p><div class="tr-card-meta">${esc(c[lang].level)}</div><a class="ea-text-link" href="${courseUrl(c,lang)}">${lang==='fr'?'Explorer le programme':'Explore the programme'} <span aria-hidden="true">→</span></a></article>`).join('')}</div>`;
const instructor=lang=>`<section class="tr-section tr-instructor" aria-labelledby="instructor-title"><div><picture><source srcset="/assets/images/elboubakry-growth-portrait.avif" type="image/avif"><img src="${profile.portrait}" width="820" height="980" loading="lazy" decoding="async" alt="${profile.name}"></picture></div><div><p class="tr-label">${lang==='fr'?'Votre formateur':'Your instructor'}</p><h2 id="instructor-title">${profile.name}</h2><p class="tr-lead">${esc(profile[lang].role)}</p><p>${esc(profile[lang].teaching)}</p><p>${lang==='fr'?'Une pratique qui relie acquisition, gestion de projet, développement web, CRM et automatisation. Les projets du portfolio sont présentés avec leur contexte et leurs limites.':'A practice connecting acquisition, project management, web development, CRM and automation. Portfolio projects include their context and limitations.'}</p><a class="ea-text-link" href="${about(lang)}">${lang==='fr'?'Lire le parcours professionnel':'Read the professional profile'} →</a></div></section>`;
const navIcon='<svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><path d="m2 9 10-5 10 5-10 5L2 9Zm4 3v5c4 3 8 3 12 0v-5M22 9v8"/></svg>';
function navigation(html,lang){
 const label=lang==='fr'?'Formations':'Training';
 return html.replace(/<nav\b[^>]*class="(?:ea-nav|ea-shell-nav)"[^>]*>[\s\S]*?<\/nav>/g,nav=>{
  if(lang==='en')nav=nav.replaceAll('href="/"','href="/en/"');
  nav=nav.replace(/<li data-professional-nav>[\s\S]*?<\/li>/g,'');
  return nav.replace(/(<li><a[^>]*href="(?:\/en)?\/services\/"[\s\S]*?<\/li>)/,`$1<li data-professional-nav><a class="ea-nav-icon-link" href="${base(lang)}">${navIcon}<span>${label}</span></a></li>`);
 });
}
function metadata(html,title,description){
 html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`);
 html=html.replace(/<meta\b[^>]*>/g,tag=>{
  const key=tag.match(/(?:name|property)="([^"]+)"/)?.[1];
  if(['description','og:description','twitter:description'].includes(key))return tag.replace(/content="[^"]*"/,`content="${esc(description)}"`);
  if(['og:title','twitter:title'].includes(key))return tag.replace(/content="[^"]*"/,`content="${esc(title)}"`);
  return tag;
 });
 const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
 return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{
  const data=JSON.parse(raw);
  const update=x=>{if(Array.isArray(x)){x.forEach(update);return;}if(!x||typeof x!=='object')return;
   if(['WebPage','CollectionPage'].includes(x['@type'])&&x.url===canonical){x.name=title;x.description=description;}
   Object.values(x).forEach(update);
  };update(data);return `<script type="application/ld+json">${json(data)}</script>`;
 });
}
function schemas(html,lang){
 return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{
  const data=JSON.parse(raw);
  const update=x=>{
   if(Array.isArray(x)){x.forEach(update);return;}
   if(!x||typeof x!=='object')return;
   if(x['@type']==='Person'&&/elboubakry/i.test(x.name||''))Object.assign(x,person(lang));
   if(x['@id']===origin+'/#professional-service')x['@id']=origin+'/#service';
   Object.values(x).forEach(update);
  };update(data);return `<script type="application/ld+json">${raw.includes('\n')?JSON.stringify(data,null,2).replace(/</g,'\\u003c'):json(data)}</script>`;
 });
}
function page(lang,fr,en,title,description,body,extra=[]){
 const template=read(lang==='fr'?'index.html':'en/index.html');
 let header=template.match(/<header\b[\s\S]*?<\/header>/)[0];
 header=header.replace(/ aria-current="page"/g,'').replace(/<!-- site-language-switch:start -->[\s\S]*?<!-- site-language-switch:end -->/,languageControl(fr,en,lang));
 header=header.replaceAll('href="#accueil"',`href="${home(lang)}"`).replaceAll('href="#projets"',`href="${lang==='fr'?'/projets/':'/en/projects/'}"`).replaceAll('href="#contact"',`href="${home(lang)}#contact"`);
 header=navigation(header,lang);
 if(fr.startsWith('/formations/'))header=header.replace(`href="${base(lang)}"`,`href="${base(lang)}" aria-current="${fr==='/formations/'?'page':'location'}"`);
 let footer=template.match(/<footer\b[\s\S]*?<\/footer>/)[0];
 footer=footer.replaceAll('href="#contact"',`href="${home(lang)}#contact"`);
 const url=origin+(lang==='fr'?fr:en);
 const crumbs=[{name:lang==='fr'?'Accueil':'Home',item:origin+home(lang)}];
 if(fr.startsWith('/formations/'))crumbs.push({name:lang==='fr'?'Formations':'Training',item:origin+base(lang)});
 if(![base(lang)].includes(lang==='fr'?fr:en))crumbs.push({name:fr==='/ai/'?'ELBOUBAKRY AI':title,item:url});
 const graph=[person(lang),{'@type':'WebPage',url,name:title,inLanguage:lang,description,about:{'@id':origin+'/#person'}},{'@type':'BreadcrumbList',itemListElement:crumbs.map((x,i)=>({'@type':'ListItem',position:i+1,...x}))},...extra];
 return `<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index, follow, max-image-preview:large"><meta name="author" content="${profile.name}"><meta name="theme-color" content="#0b55ff"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="fr" href="${origin+fr}"><link rel="alternate" hreflang="en" href="${origin+en}"><link rel="alternate" hreflang="x-default" href="${origin+fr}"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:image" content="${origin}/assets/images/elboubakry-social-card.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/css/elboubakry-premium-portfolio.css?v=20261027-nav1"><link rel="stylesheet" href="/assets/css/professional.css?v=20261112-ui1">${languageAssets()}<script defer src="/assets/js/elboubakry-premium-portfolio.js?v=20261112-ui1"></script><script type="application/ld+json">${json({'@context':'https://schema.org','@graph':graph})}</script></head><body><a class="skip-link" href="#main-content">${lang==='fr'?'Aller au contenu principal':'Skip to main content'}</a>${header}<main id="main-content">${body}</main>${footer}</body></html>\n`;
}

// All page mutations are repeatable. Original pages remain the source for their
// existing services, project demonstrations and approved article prose.
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||['node_modules','dist','content','docs','tests'].includes(e.name)?[]:e.isDirectory()?walk(path.posix.join(dir,e.name)):[path.posix.join(dir,e.name)]);}
const baselineFiles=walk('').filter(x=>x.endsWith('.html'));
for(const file of baselineFiles){
 let html=read(file),lang=/<html[^>]*lang="en"/.test(html)?'en':'fr';
 if(file.startsWith('crm/'))continue;
 html=navigation(html,lang);
 html=html.replace(/elboubakry-insights-hub\.js\?v=[^"']+/g,'elboubakry-insights-hub.js?v=20261111-1');
 html=schemas(html,lang);
 if(lang==='en')html=html.replace(/(<p class="ea-guide-byline">[\s\S]*?<\/a>)[\s\S]*?<br>/,`$1 · ${esc(profile.en.role)}, Casablanca<br>`);
 html=html.replace(/(<img\b[^>]*src="[^"]*elboubakry-growth-portrait\.[^"]*"[^>]*alt=")[^"]*(")/g,`$1${profile.name} — ${esc(profile[lang].role)}$2`);
 if(!html.includes('professional.css')&&(/ea-nav-icon-link/.test(html)))html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/professional.css?v=20261112-ui1"></head>');
 html=html.replace(/(<(?:div|section)[^>]*class="[^"]*(?:ea-shell-footer-brand|ea-footer-brand)[^"]*"[^>]*>[\s\S]*?<p>)[\s\S]*?<\/p>/,`$1${esc(profile[lang].footer)}</p>`);
 html=html.replace(/<footer\b[\s\S]*?<\/footer>/,footer=>replaceBlock(footer,'footer',`<p class="tr-footer-links"><a href="${base(lang)}">${lang==='fr'?'Formations':'Training'}</a> · <a href="${lang==='fr'?'/ai/':'/en/ai/'}">ELBOUBAKRY AI</a></p>`,'</footer>'));
 if(['index.html','en/index.html'].includes(file)){
  const p=profile[lang];html=metadata(html,p.headline+' | Elboubakry',p.intro);
  html=html.replace(/(<h1 id="hero-title">)[\s\S]*?<\/h1>/,`$1${esc(p.headline).replace(lang==='fr'?'au Maroc':'in Morocco',`<span>${lang==='fr'?'au Maroc':'in Morocco'}</span>`)}</h1>`)
   .replace(/(<p class="ea-hero-lead">)[\s\S]*?<\/p>/,`$1${lang==='fr'?'Marketing digital · Développement IA · Web &amp; CRM · Automatisation':'Digital marketing · AI development · Web &amp; CRM · Automation'}</p>`)
   .replace(/(<p class="ea-hero-summary">)[\s\S]*?<\/p>/,`$1${esc(p.intro)}</p>`);
  html=replaceBlock(html,'hero-training',`<a class="ea-text-link tr-hero-link" href="${base(lang)}">${lang==='fr'?'Découvrir les formations':'Explore training'} →</a>`,'<div class="ea-hero-meta"');
  const preview=`<section class="ea-section tr-preview" aria-labelledby="training-preview-title"><div class="ea-container"><p class="ea-kicker">${lang==='fr'?'Formation & pratique':'Training & practice'}</p><div class="tr-heading"><h2 id="training-preview-title">${lang==='fr'?'Apprendre. Construire. Mettre en pratique.':'Learn. Build. Put it into practice.'}</h2><p>${lang==='fr'?'Trois parcours pour développer vos compétences, en complément de mes missions de conseil et de développement.':'Three learning tracks alongside my consulting and development services.'}</p></div>${cards(lang)}<a class="ea-text-link" href="${base(lang)}">${lang==='fr'?'Toutes les formations':'All training programmes'} →</a></div></section>`;
  html=replaceBlock(html,'training-preview',preview,'<section class="ea-section" id="methode"');
 }
 if(['about-elboubakry-abdessamad.html','en/about/index.html'].includes(file)){
  html=metadata(html,profile.name+' | '+profile[lang].role,(lang==='fr'?'Découvrez le parcours d’Elboubakry Abdessamad : formation informatique, marketing digital, gestion de projet, développement web et automatisation.':'Explore Elboubakry Abdessamad’s background in IT teaching, digital marketing, project management, web development and automation.'));
  html=html.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/,`$1${profile.name}, ${esc(profile[lang].headline)}</h1>`);
  html=replaceBlock(html,'profile',`<section class="tr-profile ea-container"><h2>${lang==='fr'?'Conseiller, développer et transmettre':'Consulting, development and teaching'}</h2><p>${esc(profile[lang].intro)}</p><p>${esc(profile[lang].teaching)}</p>${list(profile[lang].skills)}<a class="ea-text-link" href="${base(lang)}">${lang==='fr'?'Explorer mes formations':'Explore my training programmes'} →</a></section>`);
 }
 if(file.startsWith('insights/')&&file!=='insights/index.html'){
  if(!html.includes('class="ea-article-author"'))html=html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/,'$1<p class="ea-article-author"></p>');
  html=html.replace(/(<p class="ea-article-author">)[\s\S]*?<\/p>/,`$1Par <a href="${about('fr')}">${profile.name}</a> — ${esc(profile.fr.role)}</p>`);
  const course=/ia-|automatisation|consultant-ia/.test(file)?courses[1]:courses[0];
  html=replaceBlock(html,'article-next',`<section class="tr-related"><h2>Passer à la pratique</h2><p>Apprendre avec le parcours <a href="${courseUrl(course,'fr')}">${esc(course.fr.title)}</a>, ou <a href="/services/">confier la mise en œuvre à un consultant</a>.</p></section>`,'</article>');
 }
 write(file,html);
}

for(const lang of ['fr','en']){
 const fr='/formations/',en='/en/training/';
 const title=lang==='fr'?'Formations Marketing Digital & IA au Maroc | Elboubakry':'Digital Marketing & AI Training in Morocco | Elboubakry';
 const headline=lang==='fr'?'Des compétences qui deviennent des projets.':'Skills that become real projects.';
 const description=lang==='fr'?'Formations pratiques en marketing digital, développement IA et automatisation avec Elboubakry Abdessamad. Explorez les programmes et échangeons sur votre objectif.':'Practical digital marketing, AI development and business automation training with Elboubakry Abdessamad. Explore the programmes and discuss your learning goals.';
 const faq=lang==='fr'?[
  ['Quel parcours choisir ?','Marketing Digital & Acquisition pour structurer vos campagnes et votre suivi. AI Development & Automation pour coder et intégrer. AI for Business pour organiser un usage métier sans prérequis de programmation.'],
  ['Les formations conviennent-elles aux débutants ?','Chaque programme indique son niveau et ses prérequis. Un échange permet d’adapter le point de départ à votre expérience et à votre objectif.'],
  ['Comment demander une formation ?','Contactez-moi par email ou WhatsApp en précisant le parcours, votre objectif et votre niveau. Les modalités sont confirmées directement avant tout engagement.'],
  ['Proposez-vous aussi du conseil et du développement ?','Oui. Les formations complètent les missions de stratégie marketing, développement web et IA, CRM et automatisation. Vous pouvez apprendre, me confier la réalisation ou discuter d’un accompagnement adapté.']
 ]:[
  ['Which track should I choose?','Choose Digital Marketing & Acquisition for campaigns and lead follow-up; AI Development & Automation for coding and integrations; AI for Business for an operational use case without prior programming.'],
  ['Are these programmes suitable for beginners?','Each programme lists its level and prerequisites. A discussion helps adapt the starting point to your experience and objective.'],
  ['How do I request training?','Contact me by email or WhatsApp with your chosen track, goal and current level. Arrangements are confirmed directly before any commitment.'],
  ['Do you also offer consulting and development?','Yes. Training complements marketing strategy, web and AI development, CRM and automation services. You can learn, commission implementation or discuss an appropriate combination.']
 ];
 const body=`<div class="ea-container"><nav class="tr-breadcrumb" aria-label="${lang==='fr'?'Fil d’Ariane':'Breadcrumb'}"><a href="${home(lang)}">${lang==='fr'?'Accueil':'Home'}</a><span>/</span><span>${lang==='fr'?'Formations':'Training'}</span></nav><section class="tr-hero"><div><p class="ea-kicker">${lang==='fr'?'Formations · Maroc':'Training · Morocco'}</p><h1>${headline}</h1><p class="tr-lead">${lang==='fr'?'Marketing digital, développement IA et automatisation. Comprendre les principes, pratiquer sur un cas concret, repartir avec un projet.':'Digital marketing, AI development and automation. Understand the principles, work through a concrete example and build a project.'}</p><div class="tr-actions"><a class="ea-button ea-button-primary" href="#programmes">${lang==='fr'?'Choisir mon parcours':'Choose my track'} ↓</a><a class="ea-text-link" href="${service(lang)}">${lang==='fr'?'Besoin d’une réalisation ?':'Need implementation?'} →</a></div></div><aside class="tr-hero-panel"><p class="tr-label">${lang==='fr'?'Une méthode concrète':'A practical approach'}</p><ol><li><span>01</span><strong>${lang==='fr'?'Comprendre':'Understand'}</strong><p>${lang==='fr'?'Un objectif, des principes clairs.':'One objective, clear principles.'}</p></li><li><span>02</span><strong>${lang==='fr'?'Construire':'Build'}</strong><p>${lang==='fr'?'Des exercices guidés, un projet utile.':'Guided exercises, a useful project.'}</p></li><li><span>03</span><strong>${lang==='fr'?'Vérifier':'Verify'}</strong><p>${lang==='fr'?'Des tests, du recul, une prochaine étape.':'Tests, reflection and a next step.'}</p></li></ol></aside></section><section class="tr-section" id="programmes"><p class="tr-label">${lang==='fr'?'Trois parcours, votre objectif':'Three tracks, your objective'}</p><h2>${lang==='fr'?'Choisissez ce que vous voulez construire.':'Choose what you want to build.'}</h2>${cards(lang)}</section>${instructor(lang)}<section class="tr-section tr-project-panel"><p class="tr-label">${lang==='fr'?'Projets pédagogiques':'Learning projects'}</p><h2>${lang==='fr'?'Des livrables pour montrer ce que vous avez appris.':'Deliverables that show what you have learned.'}</h2><div class="tr-cards">${courses.map(c=>`<article><h3>${esc(c[lang].title)}</h3><p>${esc(c[lang].outcome)}</p></article>`).join('')}</div><p>${lang==='fr'?'Ces exercices ne sont pas des résultats clients.':'These exercises are not client results.'} <a href="${lang==='fr'?'/projets/':'/en/projects/'}">${lang==='fr'?'Voir les démonstrations du portfolio':'Explore portfolio demonstrations'} →</a></p></section><section class="tr-section"><h2>${lang==='fr'?'Questions fréquentes':'Frequently asked questions'}</h2><div class="tr-faq">${faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section><section class="tr-section tr-cta"><p class="tr-label">${lang==='fr'?'La prochaine étape':'The next step'}</p><h2>${lang==='fr'?'Quel projet voulez-vous apprendre à réaliser ?':'What project would you like to learn to build?'}</h2><p>${terms(lang)}</p>${contact(lang)}<a class="tr-secondary-link" href="${hub(lang)}">${lang==='fr'?'Commencer par les guides':'Start with the guides'} →</a></section></div>`;
 write(base(lang).slice(1)+'index.html',page(lang,fr,en,title,description,body));
 for(const c of courses.filter(c=>c.status==='approved')){
  const d=c[lang];const details=`<div class="ea-container"><nav class="tr-breadcrumb" aria-label="${lang==='fr'?'Fil d’Ariane':'Breadcrumb'}"><a href="${home(lang)}">${lang==='fr'?'Accueil':'Home'}</a><span>/</span><a href="${base(lang)}">${lang==='fr'?'Formations':'Training'}</a><span>/</span><span>${esc(d.title)}</span></nav><section class="tr-course-hero"><p class="ea-kicker">${esc(d.eyebrow)}</p><h1>${lang==='fr'?'Formation : ':''}${esc(d.title)}</h1><p class="tr-lead">${esc(d.overview)}</p>${contact(lang,d.title)}</section><div class="tr-course-layout"><div><section class="tr-section"><h2>${lang==='fr'?'Ce que vous saurez faire':'What you will be able to do'}</h2>${list(d.objectives)}</section><section class="tr-section" id="modules"><h2>${lang==='fr'?'Le programme, module par module':'The programme, module by module'}</h2><div class="tr-modules">${d.modules.map(([t,concept,exercise],i)=>`<details${i===0?' open':''}><summary><span class="tr-module-no">${String(i+1).padStart(2,'0')}</span><span>${esc(t)}</span></summary><div><p>${esc(concept)}</p><p class="tr-exercise"><strong>${lang==='fr'?'Mise en pratique':'Practical exercise'}</strong><br>${esc(exercise)}</p></div></details>`).join('')}</div></section><section class="tr-section tr-project-panel"><p class="tr-label">${lang==='fr'?'Votre projet final':'Your final project'}</p><h2>${lang==='fr'?'Un résultat concret et vérifiable.':'A concrete, reviewable outcome.'}</h2><p>${esc(d.outcome)}</p></section></div><aside class="tr-course-aside"><h2>${lang==='fr'?'Ce parcours est-il pour vous ?':'Is this track for you?'}</h2><dl><dt>${lang==='fr'?'Public':'Audience'}</dt><dd>${esc(d.audience)}</dd><dt>${lang==='fr'?'Niveau':'Level'}</dt><dd>${esc(d.level)}</dd><dt>${lang==='fr'?'Prérequis':'Prerequisites'}</dt><dd>${esc(d.prerequisites)}</dd></dl><p>${terms(lang)}</p><a class="ea-text-link" href="${service(lang)}">${lang==='fr'?'Confier la réalisation':'Commission implementation'} →</a></aside></div>${instructor(lang)}<section class="tr-section"><h2>${lang==='fr'?'Pour préparer votre parcours':'Prepare for your learning journey'}</h2><ul>${d.guides.map(s=>`<li><a href="${guide(s,lang)}">${guideTitle(s,lang)} →</a></li>`).join('')}</ul></section><section class="tr-section tr-cta"><h2>${lang==='fr'?'Parlons de votre objectif.':'Let’s discuss your objective.'}</h2><p>${terms(lang)}</p>${contact(lang,d.title)}</section></div>`;
  const schema={'@type':'Course','@id':origin+courseUrl(c,lang)+'#course',url:origin+courseUrl(c,lang),name:d.title,description:d.overview,inLanguage:lang,provider:{'@id':origin+'/#person'},educationalLevel:d.level,coursePrerequisites:d.prerequisites,teaches:d.objectives,hasPart:d.modules.map(([name,description])=>({'@type':'LearningResource',name,description})),audience:{'@type':'EducationalAudience',audienceType:d.audience}};
  write(courseUrl(c,lang).slice(1)+'index.html',page(lang,courseUrl(c,'fr'),courseUrl(c,'en'),d.title+' — '+(lang==='fr'?'Formation':'Training')+' | Elboubakry',d.overview,details,[schema]));
 }
}

const ctx={window:{}};vm.runInNewContext(read('assets/data/insights-articles.js'),ctx);
const articles=ctx.window.ELBOUBAKRY_INSIGHTS_ARTICLES;
// Render cards into HTML; filtering is an enhancement, never the content source.
let insight=read('insights/index.html');
insight=insight.replace(/(<p class="ea-insights-author-line">)[\s\S]*?<\/p>/,`$1Par <a href="${about('fr')}">${profile.name}</a> — ${esc(profile.fr.role)}</p>`);
insight=insight.replace(/(<div[^>]*data-insights-grid=""[^>]*>)[\s\S]*?<\/div>/,`$1${articles.map(a=>`<article class="ea-insight-card" data-category="${esc(a.category)}"><a class="ea-insight-card-button" href="/insights/${a.slug}"><span class="ea-insight-top"><span class="ea-insight-tag">${esc(a.category)}</span><span class="ea-insight-time">${esc(a.readingTime)}</span></span><span class="ea-insight-body"><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><span class="ea-insight-link">Lire le guide →</span></span></a></article>`).join('')}</div>`);
const clusterBody=`<section class="tr-knowledge container"><h2>Apprendre par domaine</h2><p>Des guides pour comprendre, des programmes pour pratiquer et des services pour mettre en œuvre.</p><div class="tr-clusters">${clusters.map(c=>`<article><h3>${esc(c.fr)}</h3><ul>${c.slugs.map(s=>`<li><a href="/insights/${s}">${esc(articles.find(a=>a.slug===s)?.title||'Consulting IA & business')}</a></li>`).join('')}${c.course?`<li><a href="${courseUrl(courses.find(x=>x.id===c.course),'fr')}">Programme de formation →</a></li>`:''}</ul>${c.id==='ai-development'?'<p>Pour l’approche technique détaillée, consultez le programme ; le guide lié présente les usages métier.</p>':''}</article>`).join('')}</div></section>`;
insight=replaceBlock(insight,'clusters',clusterBody,'<section class="section-space"');
if(!insight.includes('professional:clusters:start'))insight=replaceBlock(insight,'clusters',clusterBody);
insight=metadata(insight,'Guides Marketing, SEO & IA au Maroc | Elboubakry','Explorez les guides existants : marketing digital, SEO, IA, automatisation, web et CRM. Des parcours de lecture reliés aux formations et aux services.');
insight=insight.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/,'$1Guides marketing digital, IA &amp; automatisation</h1>');
write('insights/index.html',insight);

// AI pages have no third-party analytics: conversation text stays in memory.
for(const lang of ['fr','en']){
 const isFr=lang==='fr';const title=isFr?'ELBOUBAKRY AI — Assistant virtuel local':'ELBOUBAKRY AI — Local virtual assistant';
 const description=isFr?'Explorez les formations, services, projets et guides avec l’assistant virtuel d’Elboubakry Abdessamad. Génération locale dans votre navigateur compatible.':'Explore training, services, projects and guides with Elboubakry Abdessamad’s virtual assistant. Local generation in a compatible browser.';
 const body=`<div class="ea-container tr-ai"><nav class="tr-breadcrumb" aria-label="${isFr?'Fil d’Ariane':'Breadcrumb'}"><a href="${home(lang)}">${isFr?'Accueil':'Home'}</a><span>/</span><span>ELBOUBAKRY AI</span></nav><p class="ea-kicker">${isFr?'Votre point de départ':'Your starting point'}</p><h1>ELBOUBAKRY <span class="ea-blue">AI</span><span class="tr-ai-subtitle">${isFr?'Assistant virtuel':'Virtual assistant'}</span></h1><p class="tr-lead">${isFr?'Apprendre, construire ou confier un projet.':'Learn, build or commission a project.'}</p><p>${isFr?'Je suis l’assistant virtuel d’Elboubakry Abdessamad, pas Abdessamad lui-même. Mes réponses s’appuient sur les contenus approuvés de ce site.':'I am Elboubakry Abdessamad’s virtual assistant, not Abdessamad himself. My answers use this site’s approved content.'}</p><section class="tr-ai-start" aria-labelledby="local-heading"><h2 id="local-heading">${isFr?'Une conversation sur votre appareil':'A conversation on your device'}</h2><p>${isFr?'Le modèle est téléchargé depuis Hugging Face et MLC au premier lancement (environ 1 Go de fichiers, avec environ 2 Go de mémoire GPU requis). Le téléchargement peut prendre plusieurs minutes. Ensuite, les messages sont traités sur votre appareil : aucune API d’inférence externe. Un navigateur compatible WebGPU et suffisamment de mémoire sont nécessaires.':'On first use, model files download from Hugging Face and MLC (approximately 1 GB of files, with around 2 GB of GPU memory required). This may take several minutes. Messages are then processed on your device: no external inference API. A WebGPU-compatible browser and sufficient memory are required.'}</p><p>${isFr?'Les fournisseurs de fichiers voient les requêtes de téléchargement, pas votre conversation. L’historique reste uniquement dans cet onglet. Les fichiers du modèle peuvent rester en cache ; effacer les données du site les supprime.':'File hosts receive download requests, not your conversation. History stays only in this tab. Model files may remain cached; clearing site data removes them.'}</p><button class="ea-button ea-button-primary" id="ai-load" type="button">${isFr?'Vérifier et charger le modèle':'Check and load model'}</button><button class="tr-control" id="ai-cancel-load" type="button" hidden>${isFr?'Annuler le chargement':'Cancel loading'}</button><p id="ai-status" role="status" aria-live="polite">${isFr?'Le modèle n’est pas encore chargé.':'The model is not loaded yet.'}</p><progress id="ai-progress" max="1" value="0" hidden aria-label="${isFr?'Chargement du modèle':'Model loading'}"></progress></section><div class="tr-ai-suggestions" aria-label="${isFr?'Exemples de questions':'Example questions'}">${(isFr?['Je veux apprendre le développement IA','J’ai besoin d’un agent IA pour mon entreprise','Je veux apprendre Meta Ads','Qui est Abdessamad ?']:['I want to learn AI development','I need an AI agent for my company','I want to learn Meta Ads','Who is Abdessamad?']).map(q=>`<button type="button" data-ai-question="${esc(q)}">${esc(q)}</button>`).join('')}</div><section id="ai-transcript" role="log" aria-live="polite" aria-label="${isFr?'Conversation':'Conversation'}"></section><form id="ai-form"><label for="ai-message">${isFr?'Votre question':'Your question'}</label><textarea id="ai-message" rows="3" maxlength="1200" required placeholder="${isFr?'Formation, service, projet ou guide…':'Training, service, project or guide…'}"></textarea><div class="tr-actions"><button class="ea-button ea-button-primary" id="ai-send" disabled>${isFr?'Envoyer':'Send'}</button><button class="tr-control" id="ai-stop" type="button" disabled>${isFr?'Arrêter':'Stop'}</button><button class="tr-control" id="ai-clear" type="button">${isFr?'Effacer la conversation':'Clear conversation'}</button></div></form><p class="tr-ai-note">${isFr?'L’IA peut se tromper. Vérifiez les pages sources et confirmez les modalités directement avec Abdessamad.':'AI can make mistakes. Check source pages and confirm arrangements directly with Abdessamad.'}</p><nav class="tr-ai-fallback" aria-label="${isFr?'Explorer le site':'Explore the site'}"><a href="${base(lang)}">${isFr?'Formations':'Training'}</a><a href="${service(lang)}">${isFr?'Services de conseil':'Consulting services'}</a><a href="${lang==='fr'?'/projets/':'/en/projects/'}">${isFr?'Projets':'Projects'}</a><a href="${hub(lang)}">${isFr?'Guides':'Guides'}</a><a href="mailto:${profile.email}">${isFr?'Contacter Abdessamad':'Contact Abdessamad'}</a></nav><noscript><p>${isFr?'Activez JavaScript pour utiliser le modèle local. Les liens ci-dessus restent accessibles.':'Enable JavaScript to use the local model. The links above remain accessible.'}</p></noscript></div>`;
 let html=page(lang,'/ai/','/en/ai/',title,description,body).replace('</body>','<script type="module" src="/assets/ai/app.js?v=20261111-1"></script></body>');
 // AI breadcrumb has no training parent.
 html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,s)=>{const g=JSON.parse(s);g['@graph'].find(x=>x['@type']==='BreadcrumbList').itemListElement=[{'@type':'ListItem',position:1,name:isFr?'Accueil':'Home',item:origin+home(lang)},{'@type':'ListItem',position:2,name:'ELBOUBAKRY AI',item:origin+(isFr?'/ai/':'/en/ai/')}];return `<script type="application/ld+json">${json(g)}</script>`;});
 write((isFr?'ai/':'en/ai/')+'index.html',html);
}

// New sitemap entries preserve every existing URL and its historical lastmod.
let sitemap=read('sitemap.xml');
for(const lang of ['fr','en'])for(const route of [base(lang),...courses.filter(c=>c.status==='approved').map(c=>courseUrl(c,lang)),lang==='fr'?'/ai/':'/en/ai/']){
 if(!sitemap.includes(`<loc>${origin+route}</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>${origin+route}</loc><lastmod>2026-11-11</lastmod></url>\n</urlset>`);
}
write('sitemap.xml',sitemap);
let redirects=read('_redirects');
for(const lang of ['fr','en'])for(const route of [base(lang),...courses.filter(c=>c.status==='approved').map(c=>courseUrl(c,lang)),lang==='fr'?'/ai/':'/en/ai/'])for(const alias of [route.slice(0,-1),route+'index.html']){
 const line=`${alias}  ${route}  301`;if(!redirects.split('\n').some(x=>x.trim().split(/\s+/)[0]===alias))redirects+='\n'+line;
}
write('_redirects',redirects.trimEnd()+'\n');
console.log('Built bilingual professional identity, training, crawlable Insights cards and local assistant pages.');
