(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  function normalize(text){return utils.normalize(text);}
  function valueText(value){
    if(Array.isArray(value))return value.join(' ');
    if(value && typeof value==='object')return Object.keys(value).map(function(key){return valueText(value[key]);}).join(' ');
    return String(value || '');
  }
  function briefText(brief){return valueText(brief || '');}
  function combinedText(text,brief){return normalize([text || '', briefText(brief)].join(' '));}
  function isGreeting(text){return /^(hi|hello|hey|salam|slm|salut|bonjour|bonsoir|السلام|مرحبا)\s*[!.؟?]*$/i.test(String(text||'').trim());}
  function isBusinessQuestion(text){
    var t=normalize(text);
    if(isGreeting(t))return true;
    var allowed=['business','startup','startups','projet','project','marketing','ads','meta','facebook','instagram','tiktok','google','whatsapp','lead','leads','client','clients','vente','sales','ecommerce','e-commerce','site','landing','brand','marque','logo','contenu','content','ia','ai','automation','automatisation','restaurant','café','cafe','clinic','clinique','immobilier','real estate','freelance','budget','morocco','maroc','darija','business plan','strategy','stratégie','strategie','سوق','مشروع','تسويق','زبناء','عملاء','إعلانات','شركة','مقاولة','ستارتاب','بزنس','واش','بغيت','كيفاش','شنو','kifach','bghit','chno','wach','khdma','idea','idée','idee','money','profit','rentable','mache','marché','market','customer','customers','offer','offre','vendre','sell','pricing','prix','mockup','flyer','roll up','roll-up','poster','visual','website','saas','application','app','dashboard'];
    var blocked=['football','match','game pass','xbox','recipe','homework','math','song','movie','celebrity','weather','politics','dating','medical','health'];
    var hasAllowed=allowed.some(function(word){return t.indexOf(word)>-1;});
    var hasBlocked=blocked.some(function(word){return t.indexOf(word)>-1;});
    if(hasBlocked && !hasAllowed)return false;
    return hasAllowed;
  }
  function inferSector(text,brief){
    var t=combinedText(text,brief);
    if(/restaurant|café|cafe|food|snack|pâtisserie|patisserie|traiteur|dark kitchen|food truck|مطعم|مقهى/.test(t))return 'restaurant / café';
    if(/ecommerce|e-commerce|shop|store|boutique|produit|product|cod|cosmétique|cosmetique|mode|vêtement|تجارة|متجر/.test(t))return 'e-commerce';
    if(/clinic|clinique|esthetic|esthétique|aesthetic|doctor|dentiste|dermato|laboratoire|kiné|kine|عيادة|طبيب/.test(t))return 'clinique / santé esthétique';
    if(/saas|application|mobile app|dashboard|marketplace|edtech|fintech|outil interne|software|logiciel/.test(t))return 'SaaS / application';
    if(/real estate|immobilier|agence immobili|airbnb|courtier|عقار/.test(t))return 'immobilier';
    if(/school|école|ecole|formation|course|cours|coaching|edtech|دروس|مدرسة|تكوين/.test(t))return 'éducation / formation';
    if(/beauty|beauté|barber|barbershop|spa|salon|cosmétique|lifestyle/.test(t))return 'beauté / lifestyle';
    if(/tourisme|riad|hotel|hôtel|airbnb|voyage|travel|hébergement|hebergement/.test(t))return 'tourisme / hébergement';
    if(/freelance|agency|agence|service|consulting|consultant|خدمة|marketing digital|design|branding|dev/.test(t))return 'service / freelance';
    if(/ai|ia|automation|automatisation|agent|chatbot|ذكاء/.test(t))return 'AI business / automation';
    return 'projet business au Maroc';
  }
  function inferProjectCategory(text,brief){
    var t=combinedText(text,brief);
    if(/saas|application|mobile app|dashboard|marketplace|logiciel|software|\bapp\b/.test(t))return 'saas';
    if(/restaurant|café|cafe|food|snack|pâtisserie|traiteur|dark kitchen|food truck/.test(t))return 'restaurant';
    if(/ecommerce|e-commerce|boutique|store|shop|product|produit|cod|cosmétique|vêtement/.test(t))return 'ecommerce';
    if(/clinique|clinic|dentiste|dermato|doctor|médecin|medecin|laboratoire|kiné|medical|santé|sante/.test(t))return 'clinic';
    if(/immobilier|real estate|airbnb|courtier|promotion immobilière/.test(t))return 'real_estate';
    if(/formation|école|ecole|cours|coaching|edtech|centre de soutien/.test(t))return 'education';
    if(/barber|barbershop|beauté|beauty|spa|lifestyle|salon/.test(t))return 'beauty';
    if(/tourisme|riad|hôtel|hotel|voyage|travel|hébergement|hebergement/.test(t))return 'tourism';
    if(/nettoyage|déménagement|demenagement|réparation|maintenance|livraison|service local/.test(t))return 'local_service';
    if(/agence|agency|consulting|consultant|marketing digital|branding|design|photographie|video/.test(t))return 'agency';
    if(/ai|ia|automation|automatisation|agent|chatbot/.test(t))return 'ai_business';
    return 'generic';
  }
  var packs={
    saas:{label:'SaaS / Application',style:'Premium tech, dashboard, mobile app, clean product UI',primaryAsset:'Desktop dashboard + mobile app mockup',ratio:'16:9',logoIdea:'Abstract N mark, gradient blue, app icon ready',assets:['Logo concept','Desktop dashboard mockup','Mobile app mockup','Landing page hero','Pitch deck cover','LinkedIn launch post'],visuals:['dashboard cards','phone screen','workflow nodes','metric widgets'],copyAngles:['Save time','Automate work','Get more qualified leads']},
    restaurant:{label:'Restaurant / Food',style:'Warm, appetizing, local trust, premium menu visuals',primaryAsset:'Menu + flyer + storefront/roll-up pack',ratio:'4:5',logoIdea:'Simple food symbol, warm contrast, readable signage',assets:['Logo concept','Menu cover','Instagram post','Flyer offer','Roll-up / storefront','Landing hero'],visuals:['signature dish','menu cards','map pin','reservation CTA'],copyAngles:['Reserve now','Today offer','Near you']},
    ecommerce:{label:'E-commerce Maroc',style:'Conversion-focused product pack, COD trust, social ads',primaryAsset:'Product page + ad + packaging mockup',ratio:'4:5',logoIdea:'Minimal commerce mark, package-friendly, high recall',assets:['Logo concept','Product landing mockup','Packaging mockup','Instagram ad','Product card','WhatsApp order visual'],visuals:['hero product','trust badges','delivery label','price offer'],copyAngles:['Order now','Delivery Morocco','Cash on delivery']},
    clinic:{label:'Clinic / Medical',style:'Clean medical premium, calm trust, appointment focused',primaryAsset:'Appointment landing page + trust ad',ratio:'16:9',logoIdea:'Soft medical monogram, calm blue, premium trust',assets:['Logo concept','Appointment landing page','Service cards','Instagram trust ad','Before/after placeholder','WhatsApp booking visual'],visuals:['professional clinic cards','booking form','trust badges','FAQ tiles'],copyAngles:['Book diagnosis','Safe process','Professional care']},
    agency:{label:'Agency / Service Pro',style:'B2B premium, authority, process and case-study feel',primaryAsset:'Agency landing page + LinkedIn carousel cover',ratio:'16:9',logoIdea:'Strong wordmark, consulting badge, premium blue',assets:['Logo concept','Landing page hero','Service cards','LinkedIn cover','Case study card','Proposal cover'],visuals:['consultant cards','process steps','analytics panel','CTA box'],copyAngles:['Get diagnosis','Grow with strategy','Launch faster']},
    local_service:{label:'Service local',style:'Trust-first local service, fast booking, proof and WhatsApp',primaryAsset:'Local service landing page + flyer',ratio:'4:5',logoIdea:'Reliable icon, local badge, clear service mark',assets:['Logo concept','Service flyer','Booking landing page','Google Maps card','WhatsApp CTA','Before/after card'],visuals:['service checklist','local map','worker/team card','trust badge'],copyAngles:['Book today','Fast service','Trusted locally']},
    education:{label:'Education / Formation',style:'Clean learning brand, course cards, credibility and enrollment',primaryAsset:'Course landing page + certificate/social pack',ratio:'16:9',logoIdea:'Modern education mark, simple symbol, trust badge',assets:['Logo concept','Course landing page','Program cards','Certificate preview','Instagram course post','Enrollment CTA'],visuals:['course cards','student success','modules','certificate'],copyAngles:['Start learning','Join the course','Build your skills']},
    real_estate:{label:'Immobilier',style:'Premium property visuals, trust, location and appointment',primaryAsset:'Property landing page + brochure/flyer',ratio:'16:9',logoIdea:'Elegant real estate monogram, premium signage ready',assets:['Logo concept','Property landing page','Brochure cover','Listing card','Roll-up / office poster','WhatsApp appointment visual'],visuals:['property cards','map area','price band','appointment CTA'],copyAngles:['Book a visit','View properties','Invest smart']},
    beauty:{label:'Beauté / Lifestyle',style:'Elegant beauty identity, soft premium, social-first visuals',primaryAsset:'Beauty brand social pack + booking page',ratio:'4:5',logoIdea:'Elegant monogram, soft premium colors, salon signage ready',assets:['Logo concept','Instagram post','Booking landing page','Service price card','Story ad','Roll-up salon'],visuals:['service cards','before/after placeholder','booking CTA','soft product scene'],copyAngles:['Book now','Glow with trust','Limited offer']},
    tourism:{label:'Tourisme / Hébergement',style:'Warm travel premium, experience storytelling, booking focused',primaryAsset:'Booking landing page + travel flyer',ratio:'16:9',logoIdea:'Travel mark, Moroccan premium touch, simple icon',assets:['Logo concept','Booking landing page','Experience cards','Travel flyer','Instagram carousel','Map/location card'],visuals:['riad/hotel cards','experience tiles','booking calendar','location'],copyAngles:['Book your stay','Discover Morocco','Premium experience']},
    ai_business:{label:'AI Business / Automation',style:'AI product workspace, workflow, agent UI and B2B trust',primaryAsset:'AI agent dashboard + workflow mockup',ratio:'16:9',logoIdea:'Futuristic but simple AI mark, blue/cyan, app icon ready',assets:['Logo concept','AI dashboard mockup','Workflow graphic','Landing hero','LinkedIn post','Demo CTA visual'],visuals:['chat agent card','workflow nodes','ROI metrics','automation panel'],copyAngles:['Automate replies','Save time','Turn leads into actions']},
    generic:{label:'Business Maroc',style:'Clean business factory board, landing + social + logo basics',primaryAsset:'Landing page + social creative + logo concept',ratio:'16:9',logoIdea:'Simple professional mark, blue trust, Moroccan business ready',assets:['Logo concept','Landing page mockup','Social post','Offer card','WhatsApp CTA','Brand mini-board'],visuals:['hero layout','proof cards','CTA section','brand board'],copyAngles:['Launch clearly','Get clients','Build trust']}
  };
  function enrichMockupPack(key,pack){
    pack=pack || packs.generic;
    var projectSpecific={
      saas:{logoStage:'App icon + wordmark',brandStage:'Blue/cyan tech tokens',mockupStage:'Desktop dashboard + mobile app',launchStage:'Pitch cover + LinkedIn post',downloadNote:'SaaS pack preview only: logo, dashboard and app mockups appear together before final design export.',outputs:['Logo lockup','Dashboard mockup','Mobile app screen','Landing hero','Pitch cover']},
      restaurant:{logoStage:'Signage-ready food mark',brandStage:'Warm food palette + menu typography',mockupStage:'Menu, flyer and roll-up',launchStage:'Instagram offer + WhatsApp reservation',downloadNote:'Restaurant pack preview only: menu/flyer/roll-up are shown for validation before export.',outputs:['Logo lockup','Menu cover','Flyer','Roll-up/storefront','Instagram post']},
      ecommerce:{logoStage:'Packaging-friendly commerce mark',brandStage:'Product colors + COD trust badges',mockupStage:'Product page, packaging and ad',launchStage:'WhatsApp order + social proof',downloadNote:'Ecommerce pack preview only: product page, packaging and ad direction are generated together.',outputs:['Logo lockup','Product page','Packaging','Ad creative','Order card']},
      clinic:{logoStage:'Medical trust monogram',brandStage:'Calm blue/white medical system',mockupStage:'Appointment page + trust ad',launchStage:'Booking CTA + FAQ trust visual',downloadNote:'Clinic pack preview only: appointment page and trust visuals stay business-safe, no medical claims.',outputs:['Logo lockup','Appointment page','Trust ad','Service cards','Booking visual']},
      agency:{logoStage:'Consulting wordmark/badge',brandStage:'Authority blue + case-study style',mockupStage:'Landing page + LinkedIn carousel',launchStage:'Proposal cover + diagnostic CTA',downloadNote:'Agency pack preview only: service, proposal and LinkedIn assets are aligned before final export.',outputs:['Logo lockup','Landing hero','Service cards','LinkedIn cover','Proposal cover']},
      local_service:{logoStage:'Reliable local service badge',brandStage:'Trust palette + booking UI',mockupStage:'Flyer + Google Maps + WhatsApp CTA',launchStage:'Before/after proof card',downloadNote:'Local service pack preview only: booking and proof assets appear in one validation board.',outputs:['Logo lockup','Service flyer','Booking page','Map card','WhatsApp visual']},
      education:{logoStage:'Education trust symbol',brandStage:'Learning palette + module cards',mockupStage:'Course page + certificate',launchStage:'Enrollment post + program CTA',downloadNote:'Education pack preview only: course/certificate assets are shown as concept direction.',outputs:['Logo lockup','Course page','Certificate','Program cards','Enrollment post']},
      real_estate:{logoStage:'Premium property monogram',brandStage:'Elegant real-estate palette',mockupStage:'Property page + brochure',launchStage:'Visit booking + listing cards',downloadNote:'Real estate pack preview only: property and visit assets are generated as concept mockups.',outputs:['Logo lockup','Property page','Brochure','Listing card','Visit CTA']},
      beauty:{logoStage:'Elegant salon monogram',brandStage:'Soft premium lifestyle palette',mockupStage:'Social pack + booking page',launchStage:'Story ad + service price card',downloadNote:'Beauty pack preview only: social/booking assets are previewed before final brand export.',outputs:['Logo lockup','Instagram post','Booking page','Story ad','Price card']},
      tourism:{logoStage:'Travel mark with Moroccan touch',brandStage:'Warm premium hospitality palette',mockupStage:'Booking page + travel flyer',launchStage:'Experience carousel + location card',downloadNote:'Tourism pack preview only: booking and experience assets are shown as a single board.',outputs:['Logo lockup','Booking page','Travel flyer','Experience cards','Map card']},
      ai_business:{logoStage:'AI app icon + agent mark',brandStage:'Cyan/blue workflow identity',mockupStage:'AI agent dashboard + workflow',launchStage:'Demo CTA + LinkedIn post',downloadNote:'AI business pack preview only: agent UI and workflow graphics are generated as mockup direction.',outputs:['Logo lockup','AI dashboard','Workflow graphic','Landing hero','Demo CTA']},
      generic:{logoStage:'Clean business mark',brandStage:'Blue trust identity',mockupStage:'Landing page + social creative',launchStage:'Offer card + WhatsApp CTA',downloadNote:'Business pack preview only: logo, landing and social assets are prepared as concept direction.',outputs:['Logo lockup','Landing page','Social post','Offer card','WhatsApp CTA']}
    };
    var spec=projectSpecific[key] || projectSpecific.generic;
    return Object.assign({
      key:key,
      assetFlow:['Logo first','Brand board','Category mockups','Launch visuals'],
      stages:[spec.logoStage,spec.brandStage,spec.mockupStage,spec.launchStage],
      outputs:spec.outputs,
      downloadNote:spec.downloadNote,
      logoPrompt:'Generate a clear, memorable logo concept before any mockup: '+spec.logoStage+'. Keep it readable and suitable for website, social and print.'
    },pack,{assets:pack.assets.slice(),visuals:pack.visuals.slice(),copyAngles:pack.copyAngles.slice()});
  }
  function getMockupPack(input,brief){
    var key=inferProjectCategory(input,brief);
    var pack=packs[key] || packs.generic;
    return enrichMockupPack(key,pack);
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
  function inferMockupDirection(text,brief){
    var pack=getMockupPack(text,brief);
    var sector=inferSector(text,brief);
    var t=combinedText(text,brief);
    var direction={
      sector:sector,
      title:pack.label+' mockup pack',
      subtitle:pack.primaryAsset,
      cta:(/whatsapp|lead|booking|rendez/.test(t) ? 'Réserver sur WhatsApp' : 'Tester le projet'),
      audience:'Clients cibles au Maroc',
      accent:pack.style,
      visual:pack.visuals[0] || 'project board',
      layout:pack.assets,
      pack:pack
    };
    if(/instagram|ad|ads|creative|pub|meta|facebook|tiktok/.test(t)){
      direction.layout=['Logo concept','Hook visual','Problem/Solution ad','Offer card','CTA story'];
      direction.visual='Social ad creative mockup';
      direction.cta='Envoyer un message';
    }
    if(/hero|section/.test(t)){
      direction.layout=['Logo concept','Navbar','Hero headline','Proof line','CTA pair','Visual side'];
    }
    return direction;
  }
  function buildImagePrompt(text,brief,aspectRatio){
    var pack=getMockupPack(text,brief);
    var project=valueText((brief && brief.projectName) || '').trim() || 'Moroccan business project';
    return [
      'Create one premium presentation-board mockup image for '+project+'.',
      'Category: '+pack.label+'.',
      'Primary pack: '+pack.primaryAsset+'.',
      'Assets to show in the same image: '+pack.assets.join(', ')+'.',
      'Visual ingredients: '+pack.visuals.join(', ')+'.',
      'Logo direction: '+pack.logoIdea+'.',
      'Style: '+pack.style+'. Use modern Moroccan business/SaaS quality, clean blue-white premium UI, strong hierarchy, realistic devices/prints where relevant.',
      'Keep text minimal and readable. No fake statistics. No tiny paragraphs. No unsafe content.',
      'Aspect ratio: '+(aspectRatio || pack.ratio || '16:9')+'.',
      'User request: '+String(text || '').slice(0,900)
    ].join('\n');
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
      b.pageName='Restaurant '+city;b.eyebrow='Restaurant local';b.headline='Remplissez vos tables avec une page simple et gourmande';b.subline='Menu best-sellers, offre du jour, avis clients et bouton WhatsApp pour réserver rapidement.';b.cta='Réserver sur WhatsApp';b.secondCta='Voir le menu';b.proof=['Menu clair','Avis clients','Réservation rapide'];b.cards=[['Menu signature','Mettez 3 plats forts au centre au lieu de tout montrer.'],['Offre du jour','Un deal simple pour déclencher la première visite.'],['Local trust','Adresse, horaires, photos réelles et avis visibles.']];b.steps=['Hero appétissant','Best-sellers','Avis clients','Map + WhatsApp'];b.tone='Chaud, local, appétissant';
    }else if(sector.indexOf('e-commerce')>-1){
      b.pageName='E-commerce Maroc';b.eyebrow='E-commerce COD';b.headline='Vendez votre produit avec une page rapide et crédible';b.subline='Produit héros, bénéfices, prix clair, livraison au Maroc et commande WhatsApp ou formulaire.';b.cta='Commander maintenant';b.secondCta='Voir les bénéfices';b.proof=['COD ready','Livraison Maroc','Avis clients'];b.cards=[['Produit héros','Un seul produit ou pack pour tester vite.'],['Preuve sociale','Avis, UGC, photos et questions fréquentes.'],['Commande simple','Bouton WhatsApp + formulaire court.']];b.steps=['Produit','Bénéfices','Offre','Commande'];b.tone='Conversion, trust, direct response';
    }else if(sector.indexOf('clinique')>-1){
      b.pageName='Clinique '+city;b.eyebrow='Clinique premium';b.headline='Convertissez les visiteurs en rendez-vous qualifiés';b.subline='Une page rassurante avec services, expertise, FAQ sécurité et CTA diagnostic.';b.cta='Réserver un diagnostic';b.secondCta='Voir les services';b.proof=['Expertise','FAQ sécurité','Rendez-vous'];b.cards=[['Confiance','Présentation claire de l’équipe et des services.'],['Diagnostic','CTA orienté rendez-vous, pas seulement information.'],['FAQ','Répondre aux objections avant WhatsApp.']];b.steps=['Hero confiance','Services','Preuves','Diagnostic'];b.tone='Premium médical, rassurant, propre';
    }else if(sector.indexOf('SaaS')>-1 || sector.indexOf('AI business')>-1){
      b.pageName='AI / SaaS Business';b.eyebrow='AI automation';b.headline='Montrez comment votre outil aide les entreprises marocaines';b.subline='Cas d’usage, workflow, gain de temps et CTA demo pour transformer la curiosité en lead.';b.cta='Demander une demo';b.secondCta='Voir les cas d’usage';b.proof=['Use cases','Workflow','Demo CTA'];b.cards=[['Cas d’usage','Expliquez 3 problèmes business que l’outil résout.'],['Workflow','Montrez comment l’agent répond, classe et recommande.'],['ROI simple','Temps gagné, leads organisés, meilleure réponse client.']];b.steps=['Problème','Solution','Workflow','Demo'];b.tone='Tech premium, clair, crédible';
    }
    return b;
  }
  window.NamaaBrain={
    isGreeting:isGreeting,
    isBusinessQuestion:isBusinessQuestion,
    inferSector:inferSector,
    inferProjectCategory:inferProjectCategory,
    getMockupPack:getMockupPack,
    inferObjective:inferObjective,
    inferCity:inferCity,
    inferMockupDirection:inferMockupDirection,
    buildImagePrompt:buildImagePrompt,
    inferDevBlueprint:inferDevBlueprint
  };
})(window);
