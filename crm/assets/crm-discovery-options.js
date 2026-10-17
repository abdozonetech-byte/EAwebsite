(() => {
  "use strict";
  // Curated major-city choices, not a complete geocoder or a Maps data feed.
  const cities = {
    MA: ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Meknès", "Oujda", "Tétouan", "Kénitra", "El Jadida", "Salé", "Mohammedia", "Safi", "Nador", "Béni Mellal", "Ouarzazate", "Essaouira", "Laâyoune", "Dakhla"],
    DZ: ["Alger", "Oran", "Constantine"], TN: ["Tunis", "Sfax", "Sousse"], EG: ["Cairo", "Alexandria", "Giza"],
    FR: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Nice", "Lille"], ES: ["Madrid", "Barcelona", "Valencia", "Sevilla"], PT: ["Lisboa", "Porto", "Faro"],
    GB: ["London", "Manchester", "Birmingham", "Edinburgh"], US: ["New York", "Los Angeles", "Chicago", "Miami", "Houston"], CA: ["Toronto", "Montréal", "Vancouver", "Ottawa"],
    AE: ["Dubai", "Abu Dhabi", "Sharjah"], SA: ["Riyadh", "Jeddah", "Dammam"], QA: ["Doha", "Al Rayyan", "Al Wakrah"], BE: ["Bruxelles", "Antwerpen", "Liège"],
    CH: ["Zürich", "Genève", "Lausanne", "Bern"], DE: ["Berlin", "Hamburg", "München", "Frankfurt"], IT: ["Roma", "Milano", "Napoli"], NL: ["Amsterdam", "Rotterdam", "Den Haag"],
    SN: ["Dakar", "Thiès", "Saint-Louis"], CI: ["Abidjan", "Bouaké", "Yamoussoukro"], MR: ["Nouakchott", "Nouadhibou"], TR: ["İstanbul", "Ankara", "İzmir"],
    IN: ["Mumbai", "Delhi", "Bengaluru"], CN: ["Beijing", "Shanghai", "Guangzhou"], JP: ["Tokyo", "Osaka", "Kyoto"], AU: ["Sydney", "Melbourne", "Brisbane"],
    BR: ["São Paulo", "Rio de Janeiro", "Brasília"], ZA: ["Johannesburg", "Cape Town", "Durban"],
  };
  const areas = {
    "MA:Casablanca": ["Maârif", "Anfa", "Bourgogne", "Gauthier", "Racine", "Aïn Diab", "Sidi Maârouf", "Oasis", "Californie", "Centre-ville"],
    "MA:Rabat": ["Agdal", "Hay Riad", "Hassan", "Souissi", "Océan"],
    "MA:Marrakech": ["Guéliz", "Hivernage", "Médina", "Palmeraie"],
    "MA:Tanger": ["Malabata", "Iberia", "Marshan", "Centre-ville"],
    "MA:Agadir": ["Talborjt", "Founty", "Dakhla", "Hay Mohammadi"],
    "MA:Fès": ["Ville Nouvelle", "Fès el Bali", "Fès Jdid"],
  };
  const categories = [
    ["Aesthetic clinics", "Cliniques esthétiques"], ["Dental clinics", "Cabinets dentaires"], ["Schools & training", "Écoles et formation"],
    ["Restaurants & cafés", "Restaurants et cafés"], ["Hotels & tourism", "Hôtels et tourisme"], ["Real estate", "Immobilier"],
    ["Retail & e-commerce", "Commerce et e-commerce"], ["Professional services", "Services professionnels"], ["Fitness & wellness", "Sport et bien-être"], ["Industry & construction", "Industrie et construction"],
  ];
  const types = {
    "Aesthetic clinics": [["Independent clinic", "Clinique indépendante"], ["Dermatology practice", "Cabinet de dermatologie"], ["Laser treatment center", "Centre laser"], ["Medical aesthetic center", "Centre médico-esthétique"]],
    "Dental clinics": [["Dental practice", "Cabinet dentaire"], ["Dental clinic", "Clinique dentaire"], ["Orthodontic practice", "Cabinet d’orthodontie"]],
    "Schools & training": [["Private school", "École privée"], ["Training center", "Centre de formation"], ["Language school", "École de langues"], ["Business school", "École de commerce"]],
    "Restaurants & cafés": [["Restaurant", "Restaurant"], ["Café", "Café"], ["Bakery", "Boulangerie"], ["Catering business", "Traiteur"]],
    "Hotels & tourism": [["Hotel", "Hôtel"], ["Riad", "Riad"], ["Travel agency", "Agence de voyages"], ["Tour operator", "Organisateur de voyages"]],
    "Real estate": [["Real estate agency", "Agence immobilière"], ["Property developer", "Promoteur immobilier"], ["Property management", "Gestion immobilière"]],
    "Retail & e-commerce": [["Retail shop", "Boutique"], ["Online store", "Boutique en ligne"], ["Retail brand", "Marque de commerce"]],
    "Professional services": [["Consulting firm", "Cabinet de conseil"], ["Accounting firm", "Cabinet comptable"], ["Law firm", "Cabinet d’avocats"], ["Marketing agency", "Agence marketing"], ["IT company", "Entreprise informatique"]],
    "Fitness & wellness": [["Gym", "Salle de sport"], ["Wellness center", "Centre de bien-être"], ["Spa", "Spa"], ["Fitness studio", "Studio de fitness"]],
    "Industry & construction": [["Construction company", "Entreprise de construction"], ["Manufacturer", "Fabricant"], ["Architecture practice", "Cabinet d’architecture"], ["Industrial supplier", "Fournisseur industriel"]],
  };
  const keywords = [["booking", "Prise de rendez-vous"], ["local business", "Entreprise locale"], ["online sales", "Vente en ligne"], ["training", "Formation"], ["laser", "Laser"], ["consultation", "Consultation"], ["delivery", "Livraison"], ["B2B", "B2B"]];
  window.CrmDiscoveryOptions = { cities, areas, categories, types, keywords };
})();
