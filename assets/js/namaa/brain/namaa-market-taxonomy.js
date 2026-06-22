(function(window){
  'use strict';
  var categories=[
    {key:'saas',label:'SaaS / application',icon:'🤖',note:'Produit digital scalable: focus MVP, pricing, onboarding et rétention.',branches:['SaaS B2B','SaaS B2C','CRM / dashboard','Booking system','FinTech','EdTech','HealthTech','PropTech','AI SaaS','Internal tool','Subscription platform','No-code tool']},
    {key:'ecommerce',label:'E-commerce / vente de produits',icon:'🛒',note:'Vente produit: focus produit test, confiance, COD, livraison et contenu short-form.',branches:['Mode / vêtements','Cosmétiques','Parapharmacie','Produits alimentaires','Électronique','Maison / déco','Produit artisanal','Produit unique à tester','Accessoires mobile','Bijoux / accessoires','Print-on-demand','Marketplace product']},
    {key:'restaurant',label:'Restaurant / food',icon:'🍽️',note:'Food business: focus menu, proximité, reels, Google Maps, WhatsApp réservation et offres.',branches:['Restaurant','Café','Fast food','Pâtisserie','Traiteur','Dark kitchen','Food truck','Glacier / dessert','Healthy food','Boulangerie','Restaurant touristique','Livraison uniquement']},
    {key:'clinic',label:'Clinique / médical',icon:'🏥',note:'Santé/clinique: focus trust, preuve, rendez-vous, WhatsApp confirmation et conformité.',branches:['Dentiste','Clinique esthétique','Dermatologie','Kinésithérapie','Centre ophtalmologique','Laboratoire','Médecin spécialiste','Centre laser','Nutrition / coaching santé','Pédiatrie','Gynécologie','Centre bien-être médical']},
    {key:'agency',label:'Agence / service pro',icon:'💼',note:'Service pro: focus positionnement, preuve, diagnostic gratuit et génération de leads qualifiés.',branches:['Marketing digital','Design / branding','Développement web','Consulting','Comptabilité','Architecture','Photographie / vidéo','RH / recrutement','Business consulting','Call center / BPO','Legal / administratif','Finance / assurance']},
    {key:'local_service',label:'Service local',icon:'🛠️',note:'Service local: focus zone géographique, urgence, WhatsApp, Google Maps et avis clients.',branches:['Nettoyage','Déménagement','Réparation','Beauté à domicile','Coaching','Livraison','Maintenance','Sécurité','Jardinage','Plomberie','Électricité','Climatisation','Car wash','Pressing']},
    {key:'education',label:'Formation / cours',icon:'🎓',note:'Education: focus transformation, niveau, programme, preuve et inscription simple.',branches:['École privée','Cours de langue','Formation digitale','Coaching professionnel','Centre de soutien','Formation IA','Bootcamp tech','Cours en ligne','Formation entreprise','Préparation concours','Kids coding','Soft skills']},
    {key:'real_estate',label:'Immobilier',icon:'🏠',note:'Immobilier: focus localisation, confiance, photos, visite, WhatsApp et qualification acheteur.',branches:['Agence immobilière','Projet locatif','Promotion immobilière','Gestion Airbnb','Courtier','Bureau de vente','Coliving','Conciergerie','Location courte durée','Terrain / lotissement','Investissement locatif']},
    {key:'beauty',label:'Beauté / lifestyle',icon:'✨',note:'Beauté/lifestyle: focus avant/après, rendez-vous, contenu social, confiance et offre claire.',branches:['Salon de beauté','Barbershop','Spa / bien-être','Coach lifestyle','Cosmétiques locaux','Personal brand beauté','Studio makeup','Nails / lashes','Parfums','Mode lifestyle','Fitness studio']},
    {key:'tourism',label:'Tourisme / hébergement',icon:'🏨',note:'Tourisme: focus expérience, storytelling, réservation, avis, saisons et marchés locaux/étrangers.',branches:['Riad','Hôtel boutique','Agence voyage','Expérience locale','Restaurant touristique','Airbnb premium','Guide local','Excursions','Transport touristique','Surf camp','Desert trip','Wellness retreat']},
    {key:'ai_business',label:'AI automation / IT',icon:'⚙️',note:'AI/IT: focus problème métier, automatisation, ROI, intégration et cas d’usage simple.',branches:['AI assistant','Chatbot business','Automation WhatsApp','Internal tool','Data dashboard','IT support','Cybersecurity service','AI agency','Workflow automation','CRM automation','AI content system','AI lead qualification']},
    {key:'marketplace',label:'Marketplace',icon:'🏪',note:'Marketplace: focus two-sided market, supply/demand, trust, commission et acquisition initiale.',branches:['Marketplace services','Marketplace produits','Marketplace talents','Booking marketplace','Delivery marketplace','B2B marketplace','Education marketplace','Real estate marketplace','Health booking','Local services marketplace']},
    {key:'mobile_app',label:'Mobile app',icon:'📱',note:'Mobile app: focus MVP, onboarding, habit loop, use case clair et acquisition low-cost.',branches:['App services locaux','App livraison','App éducation','App finance','App santé','App communauté','App productivité','App booking','App marketplace','App social niche']},
    {key:'content_media',label:'Content / media brand',icon:'🎙️',note:'Media brand: focus niche, audience, format, distribution et monétisation.',branches:['Podcast','YouTube channel','Newsletter','Media niche','Creator personal brand','Community brand','Local news media','Education content']},
    {key:'b2b_industry',label:'B2B / industrie',icon:'🏭',note:'B2B/industrie: focus décisionnaire, cycle de vente, preuve, devis et relation commerciale.',branches:['Fourniture B2B','Industrie légère','Logistique','Import/export','Packaging','Matériel professionnel','Maintenance industrielle','Distribution pro']},
    {key:'ngo_social',label:'Projet social / association',icon:'🤝',note:'Social/association: focus impact, confiance, bénévoles, sponsors et communication claire.',branches:['Association locale','Projet éducatif','Projet social','Collecte de dons','Initiative jeunesse','Programme impact','Community project']}
  ];
  var cityGroups=[
    {label:'National',items:['Maroc entier','Online / International']},
    {label:'Grandes villes',items:['Casablanca','Rabat','Marrakech','Tanger','Agadir','Fès','Meknès','Oujda','Kénitra','Tétouan']},
    {label:'Villes business & régions',items:['Salé','Mohammedia','El Jadida','Safi','Béni Mellal','Nador','Khouribga','Settat','Taza','Larache','Ksar El Kebir','Essaouira','Taroudant','Ouarzazate','Laâyoune','Dakhla','Guelmim','Errachidia','Al Hoceïma','Ifrane','Berrechid','Autre ville / région']}
  ];
  var cityNotes={
    'Maroc entier':'Stratégie nationale: segmentation par villes, test petit budget puis scale progressif.',
    'Online / International':'Marché digital: offre claire, acquisition contenu/ads et confiance internationale.',
    'Casablanca':'Marché très concurrentiel mais fort pouvoir d’achat: différenciation + preuve + vitesse.',
    'Rabat':'Marché institutionnel/pro: crédibilité, sérieux, qualité et relation long terme.',
    'Marrakech':'Tourisme, lifestyle et visuel premium: storytelling et expérience client importants.',
    'Tanger':'Business, logistique et croissance: utile pour B2B, services et commerce.',
    'Agadir':'Tourisme, local services et lifestyle: contenu visuel + Google Maps très utiles.',
    'Fès':'Confiance, tradition, education et services: prix clair + preuve locale.',
    'Meknès':'Marché local efficace: offre simple, proximité et WhatsApp peuvent bien convertir.',
    'Taroudant':'Marché de proximité: confiance, recommandation locale et budget maîtrisé.'
  };
  function normalize(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
  function categoryOptions(){return categories.map(function(c){return c.label;});}
  function cityOptions(){return cityGroups.reduce(function(acc,g){return acc.concat(g.items);},[]);}
  function getCategory(label){var n=normalize(label);return categories.find(function(c){return normalize(c.label)===n || c.key===n || normalize(c.branches.join(' ')).indexOf(n)>-1;}) || null;}
  function getBranches(label){var c=getCategory(label);return c ? c.branches.slice() : ['Général','Premium','Low-cost','B2B','B2C'];}
  function getCategoryNote(label){var c=getCategory(label);return c ? c.note : 'Namaa garde le projet simple: brief clair, stratégie, design et landing page adaptés.';}
  function getCityNote(city){return cityNotes[city] || 'Namaa adapte le plan au marché choisi: confiance, budget, canaux et comportement client.';}
  function iconFor(value){var c=getCategory(value); if(c)return c.icon; var v=String(value||''); if(v==='Maroc entier')return '🇲🇦'; if(v==='Online / International')return '🌍'; if(/Autre/.test(v))return '✍️'; return '📍';}
  window.NamaaMarketTaxonomy={version:'20260622-u39',categories:categories,cityGroups:cityGroups,cityNotes:cityNotes,categoryOptions:categoryOptions(),cityOptions:cityOptions(),getBranches:getBranches,getCategoryNote:getCategoryNote,getCityNote:getCityNote,iconFor:iconFor};
})(window);
