(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  function normalize(text){return utils.normalize(text);}
  function isGreeting(text){return /^(hi|hello|hey|salam|slm|salut|bonjour|bonsoir|السلام|مرحبا)\s*[!.؟?]*$/i.test(String(text||'').trim());}
  function isBusinessQuestion(text){
    var t=normalize(text);
    if(isGreeting(t))return true;
    var allowed=['business','startup','startups','projet','project','marketing','ads','meta','facebook','instagram','tiktok','google','whatsapp','lead','leads','client','clients','vente','sales','ecommerce','e-commerce','site','landing','brand','marque','logo','contenu','content','ia','ai','automation','automatisation','restaurant','café','cafe','clinic','clinique','immobilier','real estate','freelance','budget','morocco','maroc','darija','business plan','strategy','stratégie','strategie','سوق','مشروع','تسويق','زبناء','عملاء','إعلانات','شركة','مقاولة','ستارتاب','بزنس','واش','بغيت','كيفاش','شنو','kifach','bghit','chno','wach','khdma'];
    var blocked=['football','match','game pass','xbox','recipe','homework','math','song','movie','celebrity','weather','politics','dating','medical','health'];
    var hasAllowed=allowed.some(function(word){return t.indexOf(word)>-1;});
    var hasBlocked=blocked.some(function(word){return t.indexOf(word)>-1;});
    return hasAllowed || !hasBlocked;
  }
  function inferSector(text){
    var t=normalize(text);
    if(/restaurant|café|cafe|food|snack|مطعم|مقهى/.test(t))return 'restaurant / café';
    if(/ecommerce|e-commerce|shop|store|boutique|produit|product|تجارة|متجر/.test(t))return 'e-commerce';
    if(/clinic|clinique|esthetic|esthétique|aesthetic|doctor|dentiste|عيادة|طبيب/.test(t))return 'clinique / santé esthétique';
    if(/real estate|immobilier|agence immobili|عقار/.test(t))return 'immobilier';
    if(/school|école|ecole|formation|course|دروس|مدرسة|تكوين/.test(t))return 'éducation / formation';
    if(/freelance|agency|agence|service|consulting|consultant|خدمة/.test(t))return 'service / freelance';
    if(/ai|ia|automation|automatisation|agent|chatbot|ذكاء/.test(t))return 'AI business / automation';
    return 'projet business au Maroc';
  }
  function inferObjective(text){
    var t=normalize(text);
    if(/lead|leads|client|clients|زبناء|عملاء/.test(t))return 'générer des leads et convertir sur WhatsApp';
    if(/launch|lancer|start|nbda|بغيت|أبدأ/.test(t))return 'lancer le projet avec un test simple';
    if(/ads|meta|facebook|instagram|tiktok|إعلانات/.test(t))return 'organiser une stratégie ads rentable';
    if(/site|landing|website|page/.test(t))return 'créer une landing page claire qui convertit';
    return 'clarifier l’offre et trouver les prochaines actions';
  }
  function inferCity(text){
    var t=normalize(text);
    if(/casablanca|casa|دار البيضاء|الدار البيضاء/.test(t))return 'Casablanca';
    if(/rabat|الرباط/.test(t))return 'Rabat';
    if(/marrakech|marrakesh|مراكش/.test(t))return 'Marrakech';
    if(/agadir|أكادير|اكادير/.test(t))return 'Agadir';
    if(/tanger|tangier|طنجة/.test(t))return 'Tanger';
    if(/fes|fès|فاس/.test(t))return 'Fès';
    if(/meknes|مكناس/.test(t))return 'Meknès';
    if(/taroudant|تارودانت/.test(t))return 'Taroudant';
    return 'Maroc';
  }
  function inferMockupDirection(text){
    var sector=inferSector(text);
    var t=normalize(text);
    var direction={
      sector:sector,
      title:'Business landing page mockup',
      subtitle:'Hero clair, preuve rapide, offre simple et CTA WhatsApp',
      cta:'Demander un devis',
      audience:'Clients locaux au Maroc',
      accent:'Blue trust',
      visual:'Clean business hero',
      layout:['Hero section','Problem / solution','Offer cards','Trust proof','WhatsApp CTA']
    };
    if(sector.indexOf('restaurant')>-1){
      direction.title='Restaurant local mockup';
      direction.subtitle='Réservation rapide, menu visuel, offre du jour et localisation';
      direction.cta='Réserver sur WhatsApp';
      direction.audience='Familles, jeunes actifs et clients proches';
      direction.accent='Warm food contrast';
      direction.visual='Plat signature + avis client';
      direction.layout=['Hero appétissant','Menu best-sellers','Offre du jour','Avis clients','Map + WhatsApp'];
    }else if(sector.indexOf('e-commerce')>-1){
      direction.title='E-commerce Maroc mockup';
      direction.subtitle='Produit héros, livraison, paiement à la livraison et preuve sociale';
      direction.cta='Commander maintenant';
      direction.audience='Acheteurs Instagram/TikTok au Maroc';
      direction.accent='Conversion blue';
      direction.visual='Product card + trust badges';
      direction.layout=['Produit héros','Bénéfices','Prix / offre','Avis','Commande WhatsApp'];
    }else if(sector.indexOf('clinique')>-1){
      direction.title='Clinique esthétique mockup';
      direction.subtitle='Confiance, expertise, avant/après encadré et rendez-vous simple';
      direction.cta='Réserver un diagnostic';
      direction.audience='Clients qui cherchent sécurité, résultat et crédibilité';
      direction.accent='Medical premium';
      direction.visual='Portrait pro + service cards';
      direction.layout=['Hero confiance','Services','Preuves','FAQ sécurité','Rendez-vous'];
    }else if(sector.indexOf('AI business')>-1){
      direction.title='AI business mockup';
      direction.subtitle='Automatisation, gain de temps, assistant IA et dashboard simple';
      direction.cta='Tester l’agent IA';
      direction.audience='PME, freelances et startups marocaines';
      direction.accent='AI neon blue';
      direction.visual='Agent interface + workflow';
      direction.layout=['Hero AI','Use cases','Workflow','ROI simple','Demo CTA'];
    }else if(sector.indexOf('service')>-1){
      direction.title='Service business mockup';
      direction.subtitle='Problème clair, résultat promis, preuve et demande de contact';
      direction.cta='Parler au consultant';
      direction.audience='Prospects B2B ou clients locaux';
      direction.accent='Professional blue';
      direction.visual='Consultant + checklist';
      direction.layout=['Promesse','Diagnostic','Process','Résultats','Contact'];
    }
    if(/instagram|ad|ads|creative|pub|meta|facebook|tiktok/.test(t)){
      direction.layout=['Hook visuel','Problème','Solution','Offre','CTA'];
      direction.visual='Ad creative mockup';
      direction.cta='Envoyer un message';
    }
    if(/hero|section/.test(t)){
      direction.layout=['Navbar','Hero headline','Proof line','CTA pair','Visual side'];
    }
    return direction;
  }
  function inferDevBlueprint(text){
    var sector=inferSector(text);
    var city=inferCity(text);
    var b={
      sector:sector,
      city:city,
      pageName:'Namaa Landing',
      eyebrow:'Landing page business',
      headline:'Transformez votre projet en machine à leads',
      subline:'Une page simple, claire et mobile-first pour expliquer votre offre, gagner la confiance et convertir les visiteurs en conversations WhatsApp.',
      cta:'Demander un diagnostic',
      secondCta:'Voir la méthode',
      proof:['Mobile-first','WhatsApp CTA','Trust section'],
      cards:[['Offre claire','Une promesse simple, visible dès le premier écran.'],['Preuve rapide','Avis, photos, garanties et FAQ pour rassurer.'],['Conversion','CTA WhatsApp et formulaire court pour capter les leads.']],
      steps:['Comprendre le besoin','Présenter la solution','Prouver la valeur','Convertir sur WhatsApp'],
      tone:'Premium, clair et orienté conversion'
    };
    if(sector.indexOf('restaurant')>-1){
      b.pageName='Restaurant '+city;
      b.eyebrow='Restaurant local';
      b.headline='Remplissez vos tables avec une page simple et gourmande';
      b.subline='Menu best-sellers, offre du jour, avis clients et bouton WhatsApp pour réserver rapidement.';
      b.cta='Réserver sur WhatsApp';
      b.secondCta='Voir le menu';
      b.proof=['Menu clair','Avis clients','Réservation rapide'];
      b.cards=[['Menu signature','Mettez 3 plats forts au centre au lieu de tout montrer.'],['Offre du jour','Un deal simple pour déclencher la première visite.'],['Local trust','Adresse, horaires, photos réelles et avis visibles.']];
      b.steps=['Hero appétissant','Best-sellers','Avis clients','Map + WhatsApp'];
      b.tone='Chaud, local, appétissant';
    }else if(sector.indexOf('e-commerce')>-1){
      b.pageName='E-commerce Maroc';
      b.eyebrow='E-commerce COD';
      b.headline='Vendez votre produit avec une page rapide et crédible';
      b.subline='Produit héros, bénéfices, prix clair, livraison au Maroc et commande WhatsApp ou formulaire.';
      b.cta='Commander maintenant';
      b.secondCta='Voir les bénéfices';
      b.proof=['COD ready','Livraison Maroc','Avis clients'];
      b.cards=[['Produit héros','Un seul produit ou pack pour tester vite.'],['Preuve sociale','Avis, UGC, photos et questions fréquentes.'],['Commande simple','Bouton WhatsApp + formulaire court.']];
      b.steps=['Produit','Bénéfices','Offre','Commande'];
      b.tone='Conversion, trust, direct response';
    }else if(sector.indexOf('clinique')>-1){
      b.pageName='Clinique '+city;
      b.eyebrow='Clinique premium';
      b.headline='Convertissez les visiteurs en rendez-vous qualifiés';
      b.subline='Une page rassurante avec services, expertise, FAQ sécurité et CTA diagnostic.';
      b.cta='Réserver un diagnostic';
      b.secondCta='Voir les services';
      b.proof=['Expertise','FAQ sécurité','Rendez-vous'];
      b.cards=[['Confiance','Présentation claire de l’équipe et des services.'],['Diagnostic','CTA orienté rendez-vous, pas seulement information.'],['FAQ','Répondre aux objections avant WhatsApp.']];
      b.steps=['Hero confiance','Services','Preuves','Diagnostic'];
      b.tone='Premium médical, rassurant, propre';
    }else if(sector.indexOf('AI business')>-1){
      b.pageName='AI Business';
      b.eyebrow='AI automation';
      b.headline='Montrez comment votre agent IA aide les entreprises marocaines';
      b.subline='Cas d’usage, workflow, gain de temps et CTA demo pour transformer la curiosité en lead.';
      b.cta='Demander une demo';
      b.secondCta='Voir les cas d’usage';
      b.proof=['Use cases','Workflow','Demo CTA'];
      b.cards=[['Cas d’usage','Expliquez 3 problèmes business que l’IA résout.'],['Workflow','Montrez comment l’agent répond, classe et recommande.'],['ROI simple','Temps gagné, leads organisés, meilleure réponse client.']];
      b.steps=['Problème','Agent IA','Workflow','Demo'];
      b.tone='Tech premium, clair, crédible';
    }
    return b;
  }
  window.NamaaBrain={
    isGreeting:isGreeting,
    isBusinessQuestion:isBusinessQuestion,
    inferSector:inferSector,
    inferObjective:inferObjective,
    inferCity:inferCity,
    inferMockupDirection:inferMockupDirection,
    inferDevBlueprint:inferDevBlueprint
  };
})(window);
