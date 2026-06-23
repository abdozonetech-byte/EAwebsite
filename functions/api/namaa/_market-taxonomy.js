// Namaa Market Taxonomy
// Update 39: shared Morocco categories, branches and city detection for Smart Brief Builder and Conversation Controller.

export const MARKET_CITIES = [
  ['maroc entier', 'Maroc entier'], ['tout le maroc', 'Maroc entier'], ['all morocco', 'Maroc entier'], ['morocco', 'Maroc entier'], ['maroc', 'Maroc entier'], ['المغرب كامل', 'Maroc entier'],
  ['online', 'Online / International'], ['international', 'Online / International'], ['worldwide', 'Online / International'], ['global', 'Online / International'],
  ['casablanca', 'Casablanca'], ['casa', 'Casablanca'], ['كازا', 'Casablanca'], ['الدار البيضاء', 'Casablanca'],
  ['rabat', 'Rabat'], ['الرباط', 'Rabat'], ['sale', 'Salé'], ['salé', 'Salé'], ['سلا', 'Salé'],
  ['marrakech', 'Marrakech'], ['marrakesh', 'Marrakech'], ['مراكش', 'Marrakech'],
  ['tanger', 'Tanger'], ['tangier', 'Tanger'], ['طنجة', 'Tanger'],
  ['agadir', 'Agadir'], ['اكادير', 'Agadir'], ['أكادير', 'Agadir'],
  ['fes', 'Fès'], ['fès', 'Fès'], ['فاس', 'Fès'],
  ['meknes', 'Meknès'], ['meknès', 'Meknès'], ['مكناس', 'Meknès'],
  ['kenitra', 'Kénitra'], ['kénitra', 'Kénitra'], ['القنيطرة', 'Kénitra'],
  ['oujda', 'Oujda'], ['وجدة', 'Oujda'], ['tetouan', 'Tétouan'], ['tétouan', 'Tétouan'], ['تطوان', 'Tétouan'],
  ['mohammedia', 'Mohammedia'], ['المحمدية', 'Mohammedia'], ['el jadida', 'El Jadida'], ['الجديدة', 'El Jadida'],
  ['safi', 'Safi'], ['اسفي', 'Safi'], ['آسفي', 'Safi'], ['beni mellal', 'Béni Mellal'], ['béni mellal', 'Béni Mellal'], ['بني ملال', 'Béni Mellal'],
  ['nador', 'Nador'], ['الناظور', 'Nador'], ['khouribga', 'Khouribga'], ['خريبكة', 'Khouribga'], ['settat', 'Settat'], ['سطات', 'Settat'],
  ['taza', 'Taza'], ['تازة', 'Taza'], ['larache', 'Larache'], ['العرائش', 'Larache'], ['ksar el kebir', 'Ksar El Kebir'], ['القصر الكبير', 'Ksar El Kebir'],
  ['essaouira', 'Essaouira'], ['الصويرة', 'Essaouira'], ['taroudant', 'Taroudant'], ['تارودانت', 'Taroudant'],
  ['ouarzazate', 'Ouarzazate'], ['ورزازات', 'Ouarzazate'], ['laayoune', 'Laâyoune'], ['laâyoune', 'Laâyoune'], ['العيون', 'Laâyoune'],
  ['dakhla', 'Dakhla'], ['الداخلة', 'Dakhla'], ['guelmim', 'Guelmim'], ['كلميم', 'Guelmim'], ['errachidia', 'Errachidia'], ['الرشيدية', 'Errachidia'],
  ['al hoceima', 'Al Hoceïma'], ['الحسيمة', 'Al Hoceïma'], ['ifrane', 'Ifrane'], ['إفران', 'Ifrane'], ['berrechid', 'Berrechid'], ['برشيد', 'Berrechid'],
];

export const MARKET_CATEGORY_RULES = [
  { value: 'SaaS / application', words: ['saas','application','app','mobile app','software','logiciel','platform','plateforme','dashboard','subscription','abonnement','تطبيق','منصة','crm','booking system','fintech','edtech','healthtech','proptech'] },
  { value: 'E-commerce / vente de produits', words: ['ecommerce','e-commerce','e commerce','shop','store','boutique','produit','products','vente de produits','cod','cash on delivery','cosmetic','cosmetics','beauty products','fashion','clothes','l7wayej','7wayej','حوايج','ملابس','لباس','shoes','accessoires','بيع منتجات','متجر','منتج','منتجات','parapharmacie','packaging'] },
  { value: 'Restaurant / food', words: ['restaurant','food','cafe','café','coffee','patisserie','pâtisserie','fast food','dark kitchen','snack','menu','مطعم','اكل','ماكلة','traiteur','food truck','glacier','dessert'] },
  { value: 'Clinique / médical', words: ['clinic','clinique','medical','médical','dentiste','dental','doctor','derma','dermatologie','esthetic','esthétique','aesthetic','عيادة','طبيب','أسنان','laboratoire','kiné','kine','laser','nutrition','santé','sante'] },
  { value: 'Agence / service pro', words: ['agency','agence','consulting','cabinet','service pro','freelance','studio','marketing agency','b2b','consultant','branding','design','comptabilité','architecture','photographie','rh','recrutement','call center','bpo'] },
  { value: 'Service local', words: ['cleaning','nettoyage','demenagement','déménagement','plombier','electricien','électricien','repair','réparation','livraison','service local','home service','maintenance','jardinage','car wash','pressing','sécurité','security'] },
  { value: 'Formation / cours', words: ['formation','cours','school','ecole','école','education','edtech','training','coaching','academy','apprendre','تعليم','دروس','bootcamp','langue','centre de soutien','kids coding'] },
  { value: 'Immobilier', words: ['real estate','immobilier','airbnb','location','appartement','property','villa','terrain','عقار','كراء','promotion immobilière','conciergerie','coliving','lotissement'] },
  { value: 'Beauté / lifestyle', words: ['beauty','beaute','beauté','salon','coiffure','spa','cosmetique','cosmétique','makeup','maquillage','lifestyle','barber','barbershop','nails','lashes','parfum','fitness'] },
  { value: 'Tourisme / hébergement', words: ['tourisme','tourism','hotel','hôtel','riad','hostel','voyage','travel','booking','hébergement','hebergement','airbnb premium','guide local','excursion','surf camp','desert trip'] },
  { value: 'AI automation / IT', words: ['ai business','ia business','automation','automatisation','agent ai','chatbot','bot','ia','ai tool','outil ia','workflow automation','data dashboard','cybersecurity','it support','ai agency','crm automation'] },
  { value: 'Marketplace', words: ['marketplace','place de marché','two sided','2-sided','booking marketplace','delivery marketplace','b2b marketplace','marketplace talents','marketplace services'] },
  { value: 'Mobile app', words: ['mobile app','app mobile','application mobile','app livraison','app finance','app santé','app communaute','app communauté','app productivite','app productivité'] },
  { value: 'Content / media brand', words: ['podcast','youtube channel','newsletter','media brand','creator','personal brand','community brand','local news','content creator','créateur contenu'] },
  { value: 'B2B / industrie', words: ['industrie','industrial','b2b industry','logistique','import export','import/export','packaging b2b','matériel professionnel','distribution pro','maintenance industrielle'] },
  { value: 'Projet social / association', words: ['association','ngo','ong','projet social','impact','bénévoles','benevoles','collecte de dons','initiative jeunesse','community project'] },
];

export const MARKET_CATEGORY_LABELS = MARKET_CATEGORY_RULES.map((item) => item.value);

function normalize(text = '') {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

export function detectMarketCity(text = '') {
  const n = normalize(text);
  const found = MARKET_CITIES.find(([word]) => n.includes(normalize(word)));
  return found ? found[1] : '';
}

export function detectMarketCategory(text = '') {
  const n = normalize(text);
  const matches = MARKET_CATEGORY_RULES.filter((rule) => rule.words.some((word) => n.includes(normalize(word))));
  if (!matches.length) return '';
  const priority = [
    'AI automation / IT',
    'B2B / industrie',
    'Marketplace',
    'Mobile app',
    'SaaS / application',
    'Clinique / médical',
    'Restaurant / food',
    'Tourisme / hébergement',
    'Immobilier',
    'Formation / cours',
    'Beauté / lifestyle',
    'Service local',
    'Agence / service pro',
    'E-commerce / vente de produits',
    'Content / media brand',
    'Projet social / association',
  ];
  matches.sort((a, b) => priority.indexOf(a.value) - priority.indexOf(b.value));
  return matches[0].value;
}
