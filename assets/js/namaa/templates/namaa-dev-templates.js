(function(window){
  'use strict';
  var utils=window.NamaaUtils || {escapeHtml:function(value){return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}};
  function valueText(value){
    if(Array.isArray(value))return value.join(' ');
    if(value && typeof value==='object')return Object.keys(value).map(function(key){return valueText(value[key]);}).join(' ');
    return String(value || '');
  }
  function normalize(value){return valueText(value).toLowerCase();}
  function escape(value){return utils.escapeHtml ? utils.escapeHtml(value) : String(value || '');}
  var TEMPLATES={
    saas:{
      key:'saas',label:'SaaS / Application',tone:'premium tech, dashboard, product-led, B2B trust',accent:'#38bdf8',layout:'Dashboard hero + features + workflow + pricing/demo CTA',
      sections:['Hero SaaS','Problem cards','Product dashboard','Workflow','Use cases','Demo CTA','FAQ'],
      pageName:'SaaS Launch',eyebrow:'SaaS / AI product',headline:'Montrez votre solution comme un vrai produit prêt à tester',subline:'Une landing page claire avec dashboard, cas d’usage, workflow et bouton demo pour transformer la curiosité en leads qualifiés.',cta:'Demander une demo',secondCta:'Voir les cas d’usage',
      proof:['Demo CTA','Dashboard preview','Use cases'],cards:[['Cas d’usage','3 problèmes business que votre outil résout avec un résultat visible.'],['Workflow','Expliquez le chemin utilisateur en 3 étapes simples.'],['Preuve produit','Ajoutez dashboard, KPIs et bénéfices concrets sans blabla.']],
      faq:[['Est-ce prêt pour un MVP ?','Oui, la page sert à tester l’intérêt avant de développer trop cher.'],['Quel CTA utiliser ?','Demo, waitlist ou audit gratuit selon le niveau du projet.']]
    },
    restaurant:{
      key:'restaurant',label:'Restaurant / Food',tone:'warm, appetizing, local, reservation-focused',accent:'#f97316',layout:'Food hero + menu best sellers + offer + reviews + map/WhatsApp',
      sections:['Hero menu','Best sellers','Offre du jour','Avis','Map + WhatsApp','FAQ'],
      pageName:'Restaurant Local',eyebrow:'Restaurant au Maroc',headline:'Donnez faim, rassurez vite, et transformez les visiteurs en réservations',subline:'Une page simple avec menu signature, offre claire, avis, adresse et réservation WhatsApp.',cta:'Réserver sur WhatsApp',secondCta:'Voir le menu',
      proof:['Menu clair','Avis clients','Réservation rapide'],cards:[['Menu signature','Mettez 3 plats forts au centre au lieu de montrer tout le menu.'],['Offre simple','Une offre du jour déclenche la première visite.'],['Confiance locale','Adresse, horaires, photos réelles et avis visibles.']],
      faq:[['Est-ce utile si j’ai déjà Instagram ?','Oui, Instagram attire; la page organise l’offre et facilite la réservation.'],['Quel budget test ?','Commencez petit avec contenu local + boost géographique.']]
    },
    ecommerce:{
      key:'ecommerce',label:'E-commerce Maroc',tone:'direct response, trust, product, COD-ready',accent:'#22c55e',layout:'Product hero + benefits + proof + offer stack + order CTA',
      sections:['Produit héros','Bénéfices','Preuve sociale','Offre pack','Livraison/COD','FAQ','Commande'],
      pageName:'E-commerce Maroc',eyebrow:'Produit à tester',headline:'Présentez un produit clair et donnez envie de commander maintenant',subline:'Une landing page orientée conversion avec bénéfices, prix, livraison, garanties et CTA WhatsApp ou commande.',cta:'Commander maintenant',secondCta:'Voir les bénéfices',
      proof:['COD ready','Livraison Maroc','Avis clients'],cards:[['Produit héros','Un seul produit ou pack pour tester vite.'],['Preuve sociale','Avis, UGC, photos et questions fréquentes.'],['Commande simple','Bouton WhatsApp + formulaire court.']],
      faq:[['Je dois avoir un stock énorme ?','Non, commencez par tester un produit ou un pack.'],['WhatsApp ou site ?','Au début, WhatsApp suffit si l’offre est claire.']]
    },
    clinic:{
      key:'clinic',label:'Clinique / Médical',tone:'clean, reassuring, premium, appointment-focused',accent:'#0ea5e9',layout:'Trust hero + services + doctor/clinic proof + FAQ + appointment CTA',
      sections:['Hero confiance','Services','Pourquoi nous','FAQ sécurité','Rendez-vous','WhatsApp'],
      pageName:'Clinique Premium',eyebrow:'Santé / esthétique',headline:'Transformez la confiance en rendez-vous qualifiés',subline:'Une page rassurante avec services, expertise, objections fréquentes et bouton diagnostic.',cta:'Réserver un diagnostic',secondCta:'Voir les services',
      proof:['Expertise','FAQ sécurité','Rendez-vous'],cards:[['Confiance','Présentation claire de l’équipe, du lieu et des services.'],['Diagnostic','CTA orienté rendez-vous, pas seulement information.'],['FAQ','Répondre aux objections avant WhatsApp.']],
      faq:[['Peut-on afficher avant/après ?','Oui uniquement si c’est autorisé et présenté avec prudence.'],['Quel CTA marche le mieux ?','Diagnostic, consultation ou demande d’information rapide.']]
    },
    agency:{
      key:'agency',label:'Agence / Service pro',tone:'B2B premium, authority, process, case-study',accent:'#2563eb',layout:'Authority hero + services + process + proof + diagnostic CTA',
      sections:['Hero autorité','Services','Process','Preuves','FAQ','Diagnostic'],
      pageName:'Agence Service Pro',eyebrow:'Service B2B',headline:'Expliquez votre valeur comme une offre claire, pas comme une liste de services',subline:'Une landing page pour vendre une méthode, rassurer avec preuves et inviter au diagnostic.',cta:'Demander un diagnostic',secondCta:'Voir la méthode',
      proof:['Méthode claire','Preuves','CTA diagnostic'],cards:[['Offre claire','Une promesse visible dès le premier écran.'],['Process','Montrez comment vous accompagnez le client.'],['Preuves','Cas, chiffres internes, témoignages ou livrables.']],
      faq:[['Dois-je afficher les prix ?','Affichez une fourchette ou une offre d’entrée si possible.'],['Quel canal B2B ?','LinkedIn + landing page + preuve + rendez-vous.']]
    },
    local_service:{
      key:'local_service',label:'Service local',tone:'trust-first, simple, fast booking, local proof',accent:'#14b8a6',layout:'Service promise + checklist + before/after + local area + WhatsApp',
      sections:['Promesse','Services','Avant/après','Zone','Avis','Réservation'],
      pageName:'Service Local',eyebrow:'Service proche de vous',headline:'Rendez votre service local simple à comprendre et facile à réserver',subline:'Une page courte avec zone de service, preuve, offres et bouton WhatsApp.',cta:'Réserver maintenant',secondCta:'Voir les services',
      proof:['Zone locale','WhatsApp','Preuve rapide'],cards:[['Service précis','Expliquez ce qui est inclus et ce qui ne l’est pas.'],['Zone claire','Ville/quartiers servis pour éviter les leads inutiles.'],['Preuve','Photos, avis et garantie simple.']],
      faq:[['Pourquoi une page si j’ai WhatsApp ?','La page prépare le client avant la conversation.'],['Quel contenu ?','Avant/après, checklist, prix de départ et zone.']]
    },
    education:{
      key:'education',label:'Formation / Cours',tone:'learning trust, modules, outcomes, enrollment',accent:'#8b5cf6',layout:'Course hero + modules + outcomes + certificate + enrollment CTA',
      sections:['Hero formation','Modules','Résultats','Certificat','FAQ','Inscription'],
      pageName:'Formation Maroc',eyebrow:'Formation / cours',headline:'Présentez la formation comme un parcours clair avec résultat',subline:'Une page avec programme, bénéfices, preuve, certificat et inscription simple.',cta:'S’inscrire',secondCta:'Voir le programme',
      proof:['Programme','Certificat','Inscription'],cards:[['Programme clair','Découpez la formation en modules simples.'],['Résultat','Expliquez ce que l’apprenant saura faire.'],['Confiance','Prof, avis, certificat ou portfolio.']],
      faq:[['Combien de modules ?','Commencez par 4 à 6 modules visibles.'],['Quel CTA ?','Inscription, appel WhatsApp ou préinscription.']]
    },
    real_estate:{
      key:'real_estate',label:'Immobilier',tone:'premium property, trust, visit booking, location',accent:'#a16207',layout:'Property hero + listings + location + financing/trust + visit CTA',
      sections:['Hero bien','Listings','Localisation','Avantages','Visite','Contact'],
      pageName:'Immobilier Premium',eyebrow:'Immobilier',headline:'Transformez les visites en demandes sérieuses',subline:'Une page premium avec biens, localisation, bénéfices, preuves et prise de rendez-vous.',cta:'Réserver une visite',secondCta:'Voir les biens',
      proof:['Localisation','Visite','Conseil'],cards:[['Biens clairs','Montrez 3 offres ou typologies importantes.'],['Localisation','Mettez le quartier et les avantages.'],['Contact rapide','CTA WhatsApp ou formulaire de visite.']],
      faq:[['Dois-je tout afficher ?','Non, montrez les biens phares et invitez à demander plus.'],['Quel CTA ?','Visite, appel ou demande de brochure.']]
    },
    beauty:{
      key:'beauty',label:'Beauté / Lifestyle',tone:'soft premium, social-first, booking',accent:'#ec4899',layout:'Beauty hero + services + transformations + pricing + booking CTA',
      sections:['Hero beauté','Services','Transformations','Prix','Avis','Réservation'],
      pageName:'Beauty Brand',eyebrow:'Beauté / lifestyle',headline:'Créez une image premium et donnez envie de réserver',subline:'Une page élégante avec services, tarifs, preuves visuelles, avis et réservation WhatsApp.',cta:'Réserver un créneau',secondCta:'Voir les services',
      proof:['Services','Résultats','Booking'],cards:[['Service menu','3 à 6 services lisibles et bien présentés.'],['Preuve visuelle','Photos, avis et résultats autorisés.'],['Réservation','CTA simple vers WhatsApp ou agenda.']],
      faq:[['Instagram suffit ?','Instagram attire, mais la page structure l’offre.'],['Afficher les prix ?','Oui, au moins prix à partir de.']]
    },
    tourism:{
      key:'tourism',label:'Tourisme / Hébergement',tone:'warm travel, experience, booking, location',accent:'#f59e0b',layout:'Experience hero + rooms/offers + location + activities + booking CTA',
      sections:['Hero expérience','Offres','Activités','Localisation','Avis','Réservation'],
      pageName:'Travel Experience',eyebrow:'Tourisme / hébergement',headline:'Vendez une expérience, pas seulement une chambre ou une activité',subline:'Une page immersive avec offre, photos, localisation, avis et réservation simple.',cta:'Réserver',secondCta:'Découvrir l’expérience',
      proof:['Localisation','Avis','Réservation'],cards:[['Expérience','Expliquez ce que le visiteur va vivre.'],['Confiance','Avis, photos réelles, localisation et garanties.'],['Booking','CTA visible avec WhatsApp ou formulaire.']],
      faq:[['Quelle langue ?','Français + English selon cible touristes.'],['Quel contenu ?','Photos réelles, activités, prix de départ et localisation.']]
    },
    ai_business:{
      key:'ai_business',label:'AI Business / Automation',tone:'AI product, workflow, productivity, B2B value',accent:'#06b6d4',layout:'AI agent hero + workflow + business use cases + demo CTA',
      sections:['Hero AI','Workflow','Use cases','ROI simple','Demo','FAQ'],
      pageName:'AI Business',eyebrow:'IA / automatisation',headline:'Montrez comment l’IA fait gagner du temps et organise les leads',subline:'Une landing page qui explique l’agent, les cas d’usage, le workflow et le résultat business.',cta:'Tester la demo',secondCta:'Voir les cas d’usage',
      proof:['Agent IA','Workflow','ROI simple'],cards:[['Cas d’usage','Réponses clients, tri des leads, scripts et suivi.'],['Workflow','Montrez ce qui se passe étape par étape.'],['Résultat','Temps gagné, leads mieux organisés, meilleure conversion.']],
      faq:[['Faut-il tout automatiser ?','Non, commencez par une seule tâche répétitive.'],['Quel marché ?','PME, agences, cliniques, restaurants et services.']]
    },
    generic:{
      key:'generic',label:'Business Maroc',tone:'clean, trust, conversion, Moroccan SME',accent:'#2563eb',layout:'Universal business landing page',
      sections:['Hero','Offre','Bénéfices','Process','FAQ','CTA'],
      pageName:'Namaa Landing',eyebrow:'Business Maroc',headline:'Transformez votre idée en page claire prête à tester',subline:'Une landing page simple, mobile-first, avec message clair, preuves et CTA WhatsApp.',cta:'Demander un diagnostic',secondCta:'Voir la méthode',
      proof:['Mobile-first','WhatsApp CTA','Trust section'],cards:[['Offre claire','Une promesse simple, visible dès le premier écran.'],['Preuve rapide','Avis, photos, garanties et FAQ pour rassurer.'],['Conversion','CTA WhatsApp et formulaire court pour capter les leads.']],
      faq:[['Par où commencer ?','Commencez par un brief, une offre et une page test.'],['Combien de sections ?','6 sections suffisent pour un MVP.']]
    }
  };
  function detect(input,brief){
    var value=normalize([input || '', valueText(brief || {})].join(' '));
    if(/saas|application|mobile app|dashboard|marketplace|software|logiciel|\bapp\b/.test(value))return 'saas';
    if(/restaurant|café|cafe|food|snack|pâtisserie|patisserie|traiteur|dark kitchen|food truck/.test(value))return 'restaurant';
    if(/ecommerce|e-commerce|boutique|store|shop|product|produit|cod|packaging|cosmétique|cosmetique|vêtement|vetement/.test(value))return 'ecommerce';
    if(/clinique|clinic|dentiste|dermato|doctor|médecin|medecin|laboratoire|kiné|kine|medical|santé|sante/.test(value))return 'clinic';
    if(/immobilier|real estate|airbnb|courtier|promotion immobilière/.test(value))return 'real_estate';
    if(/formation|école|ecole|cours|coaching|edtech|centre de soutien/.test(value))return 'education';
    if(/barber|barbershop|beauté|beauty|spa|lifestyle|salon/.test(value))return 'beauty';
    if(/tourisme|riad|hôtel|hotel|voyage|travel|hébergement|hebergement/.test(value))return 'tourism';
    if(/nettoyage|déménagement|demenagement|réparation|repair|maintenance|livraison|service local/.test(value))return 'local_service';
    if(/agence|agency|consulting|consultant|marketing digital|branding|design|photographie|video/.test(value))return 'agency';
    if(/ai|ia|automation|automatisation|agent|chatbot|intelligence artificielle/.test(value))return 'ai_business';
    return 'generic';
  }
  function get(input,brief){
    var key=detect(input,brief);
    var base=TEMPLATES[key] || TEMPLATES.generic;
    var template=Object.assign({},base);
    template.sections=base.sections.slice();
    template.proof=base.proof.slice();
    template.cards=base.cards.map(function(card){return card.slice();});
    template.faq=base.faq.map(function(item){return item.slice();});
    return template;
  }
  function cityFromBrief(brief,input){
    var text=normalize((brief && (brief.market || brief.city)) || input || '');
    if(/casablanca|casa|الدار/.test(text))return 'Casablanca';
    if(/rabat|الرباط/.test(text))return 'Rabat';
    if(/marrakech|مراكش/.test(text))return 'Marrakech';
    if(/agadir|اكادير|أكادير/.test(text))return 'Agadir';
    if(/tanger|tangier|طنجة/.test(text))return 'Tanger';
    if(/fes|fès|فاس/.test(text))return 'Fès';
    return 'Maroc';
  }
  function projectName(brief,template){return (brief && brief.projectName) || template.pageName || 'Namaa Landing';}
  function choose(value,fallback){return value || fallback;}
  function buildFiles(input,brief){
    var template=get(input,brief);
    var city=cityFromBrief(brief,input);
    var name=projectName(brief,template);
    var goal=(brief && brief.goal) || 'générer des leads qualifiés';
    var offer=(brief && brief.offer) || template.subline;
    var target=(brief && brief.target) || 'clients au Maroc';
    var headline=choose((brief && brief.projectName) ? template.headline : '', template.headline);
    var html='<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>'+escape(name)+'</title>\n  <meta name="description" content="Landing page '+escape(template.label)+' pour '+escape(city)+'">\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n'+
      '  <header class="site-hero">\n    <nav class="nav"><strong>'+escape(name)+'</strong><a href="#contact">Contact</a></nav>\n'+
      '    <section class="hero-grid">\n      <div>\n        <p class="eyebrow">'+escape(template.eyebrow)+' · '+escape(city)+'</p>\n        <h1>'+escape(headline)+'</h1>\n        <p class="lead">'+escape(offer)+'</p>\n        <div class="actions"><a class="btn" href="#contact">'+escape(template.cta)+'</a><a class="btn ghost" href="#process">'+escape(template.secondCta)+'</a></div>\n      </div>\n'+
      '      <aside class="hero-card">\n        <span>'+escape(template.proof[0])+'</span><span>'+escape(template.proof[1])+'</span><span>'+escape(template.proof[2])+'</span>\n        <div class="mini-board"><b>Objectif</b><p>'+escape(goal)+'</p></div>\n      </aside>\n    </section>\n  </header>\n'+
      '  <main>\n    <section class="benefits" aria-label="Bénéfices">\n'+template.cards.map(function(card){return '      <article><h2>'+escape(card[0])+'</h2><p>'+escape(card[1])+'</p></article>';}).join('\n')+'\n    </section>\n'+
      '    <section class="process" id="process"><p class="eyebrow">Template NamaaDev</p><h2>Structure recommandée</h2><div class="steps">'+template.sections.map(function(section,i){return '<span><b>'+String(i+1).padStart(2,'0')+'</b>'+escape(section)+'</span>';}).join('')+'</div></section>\n'+
      '    <section class="audience"><div><p class="eyebrow">Cible</p><h2>'+escape(target)+'</h2><p>Le message doit rester simple, crédible et orienté action. Chaque section pousse vers un rendez-vous, une commande ou une conversation WhatsApp.</p></div><div class="offer-box"><b>Offre</b><p>'+escape(offer)+'</p></div></section>\n'+
      '    <section class="faq">\n      <p class="eyebrow">FAQ</p><h2>Questions rapides</h2>\n'+template.faq.map(function(item){return '      <details><summary>'+escape(item[0])+'</summary><p>'+escape(item[1])+'</p></details>';}).join('\n')+'\n    </section>\n  </main>\n'+
      '  <footer id="contact"><div><strong>'+escape(template.cta)+'</strong><p>Connectez cette page à WhatsApp, formulaire ou CRM selon votre projet.</p></div><a class="btn" href="https://wa.me/212600000000">WhatsApp</a></footer>\n'+
      '  <script src="script.js"></script>\n</body>\n</html>';
    var css=':root{--accent:'+template.accent+';--blue:#2563eb;--dark:#07152f;--text:#52657f;--soft:#eef6ff;--line:#dbeafe}\n*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fbff;color:var(--dark)}a{text-decoration:none}.site-hero{min-height:74vh;padding:24px;background:radial-gradient(circle at 85% 12%,color-mix(in srgb,var(--accent) 28%,transparent),transparent 32%),linear-gradient(135deg,#fff,#eef6ff)}.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:60px}.nav strong{font-size:18px}.nav a{font-weight:900;color:var(--blue)}.hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:28px;align-items:center}.eyebrow{display:inline-flex;margin:0;padding:8px 12px;border-radius:999px;background:#dbeafe;color:var(--blue);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}h1{max-width:850px;margin:16px 0;font-size:clamp(38px,7vw,72px);line-height:.92;letter-spacing:-.06em}.lead{max-width:660px;color:var(--text);font-size:18px;line-height:1.62}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:999px;background:var(--blue);color:#fff;font-weight:900;box-shadow:0 16px 36px rgba(37,99,235,.20)}.btn.ghost{background:#fff;color:var(--blue);border:1px solid #bfdbfe;box-shadow:none}.hero-card{min-height:360px;border-radius:34px;background:linear-gradient(145deg,#0f172a,var(--blue));padding:26px;display:grid;align-content:end;gap:12px;box-shadow:0 30px 80px rgba(37,99,235,.25);position:relative;overflow:hidden}.hero-card:before{content:"";position:absolute;inset:24px 24px auto auto;width:120px;height:120px;border-radius:32px;background:color-mix(in srgb,var(--accent) 42%,#fff);opacity:.85}.hero-card span,.mini-board{position:relative;z-index:1;width:max-content;max-width:100%;padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-weight:900}.mini-board{border-radius:22px;width:100%;background:rgba(255,255,255,.12)}.mini-board p{margin:5px 0 0;color:#eaf2ff;font-weight:700}.benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:28px}.benefits article,.process,.audience,.faq,footer{background:#fff;border:1px solid var(--line);border-radius:28px;padding:24px;box-shadow:0 18px 44px rgba(37,99,235,.08)}.benefits h2,.process h2,.audience h2,.faq h2{margin:10px 0 8px;font-size:clamp(24px,3vw,38px);letter-spacing:-.045em}.benefits p,.audience p,footer p,.faq p{color:var(--text);line-height:1.6}.process,.audience,.faq,footer{margin:0 28px 28px}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.steps span{padding:14px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,#f8fbff,#fff);font-weight:900;color:#0b255d}.steps b{display:block;color:var(--blue);font-size:11px;margin-bottom:4px}.audience{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;align-items:center}.offer-box{padding:22px;border-radius:24px;background:linear-gradient(145deg,#eff6ff,#fff);border:1px solid #bfdbfe}.offer-box b{color:var(--blue);text-transform:uppercase;font-size:12px;letter-spacing:.08em}.faq details{border:1px solid var(--line);border-radius:18px;padding:14px;margin-top:10px;background:#fbfdff}.faq summary{cursor:pointer;font-weight:900}footer{display:flex;align-items:center;justify-content:space-between;gap:18px}@media(max-width:860px){.site-hero{padding:18px}.nav{margin-bottom:38px}.hero-grid,.benefits,.audience,.steps{grid-template-columns:1fr}.hero-card{min-height:250px}.process,.audience,.faq,footer{margin:0 18px 18px}footer{align-items:flex-start;flex-direction:column}}';
    var js='document.querySelectorAll(\'a[href^="#"]\').forEach(function(link){link.addEventListener(\'click\',function(event){var target=document.querySelector(this.getAttribute(\'href\'));if(target){event.preventDefault();target.scrollIntoView({behavior:\'smooth\'});}});});';
    var bodyOnly=html.replace(/^[\s\S]*<body>\n?/,'').replace(/\n?<script[\s\S]*$/,'');
    var previewDoc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+bodyOnly+'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script></body></html>';
    return {blueprint:{sector:template.label,templateKey:template.key,templateLabel:template.label,templateTone:template.tone,templateSections:template.sections,city:city,pageName:name,eyebrow:template.eyebrow,headline:headline,subline:offer,cta:template.cta,secondCta:template.secondCta,proof:template.proof,cards:template.cards,steps:template.sections,tone:template.tone},html:html,css:css,js:js,previewDoc:previewDoc,template:template};
  }
  window.NamaaDevTemplates={all:TEMPLATES,detect:detect,get:get,buildFiles:buildFiles};
})(window);
