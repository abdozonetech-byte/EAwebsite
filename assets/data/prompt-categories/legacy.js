// Editorial starter collection, not an import of the unavailable 84-prompt source.
// Model labels indicate required capabilities, not verified model tests.
export const categories = [
  ['design','Design'],['vibe-coding','Vibe Coding'],['video','Génération vidéo'],
  ['business','Business Planning'],['image','Génération d’images'],['marketing','Marketing'],
  ['web','Développement web'],['automation','Automatisations'],['learning','Apprentissage & compétences'],
  ['data','Data Science'],['education','Éducation'],['productivity','Productivité quotidienne'],
  ['career','Carrière & emploi'],['research','Recherche & esprit critique'],
].map(([id,label])=>({id,label}));
export const models = {'general':'IA généraliste','chatgpt':'ChatGPT / GPT','claude':'Claude','gemini':'Gemini','codex':'Codex','creative':'Outils IA créatifs'};
export const levels = {beginner:'Débutant',intermediate:'Intermédiaire',advanced:'Avancé'};
const row = (slug,title,description,category,tags,difficulty,prompt,exampleResult,useCases,tips,compatibleModels=['general','chatgpt','claude','gemini']) => ({id:slug,slug,title,description,category,tags,difficulty,prompt,exampleResult,useCases,tips,compatibleModels,variables:[...new Set([...prompt.matchAll(/\[([A-Z][A-Z0-9_]*)\]/g)].map(m=>m[1]))],updatedAt:'2026-10-27',exampleStatus:'illustrative'});
export const legacyPrompts = [
  row('audit-interface-mobile','Auditer une interface mobile','Identifier les frictions d’un parcours et prioriser des améliorations accessibles.','design',['UX','Accessibilité','Audit'],'intermediate',
`Agis comme un designer produit. À partir de [DESCRIPTION_INTERFACE], audite le parcours [PARCOURS] pour [PUBLIC]. Sépare observations fournies et hypothèses. Pour chaque friction, précise son impact, une amélioration, une priorité et une méthode de vérification. Analyse navigation, lisibilité, formulaires, erreurs et accessibilité. Si aucune capture ni mesure n’est fournie, ne prétends pas avoir observé l’interface. Termine par trois prochaines actions réalisables.`,
`Contexte fictif : formulaire de réservation mobile, décrit comme comprenant 12 champs.

Observation fournie : 12 champs avant la confirmation. Le taux d’abandon n’est pas connu.

Priorité 1 — Réduire l’effort initial
Proposition : demander service, créneau et contact, puis recueillir les informations secondaires si nécessaire. Vérification : comparer les taux de complétion à instrumentation identique, sans promettre une hausse.

Priorité 2 — Faciliter la correction
Hypothèse à vérifier : les erreurs ne sont peut-être pas associées aux champs. Ajouter des messages explicites et relier chaque erreur à son contrôle.

Priorité 3 — Vérifier l’accès clavier
Tester l’ordre de tabulation, les libellés et la visibilité du focus sur un appareil réel.

Prochaines actions : cartographier les champs indispensables ; tester avec cinq personnes consentantes ; documenter les erreurs rencontrées.`,
['Préparer un audit UX','Prioriser un formulaire'],['Décrivez un parcours précis.','Ne transmettez pas les données personnelles des utilisateurs.']),
  row('feature-coding-sans-regression','Développer sans régression','Cadrer une fonctionnalité avec un agent de code, sans remplacer l’architecture existante.','vibe-coding',['Codex','Claude Code','Tests'],'advanced',
`Tu interviens dans un dépôt existant pour ajouter [FONCTIONNALITE]. Inspecte d’abord les instructions du dépôt, l’architecture, les scripts et les changements locaux. Préserve les modifications existantes. Propose le plus petit changement cohérent, puis implémente-le si tes outils et autorisations le permettent. Ajoute des tests sur [CAS_CRITIQUES]. N’installe pas de dépendances et ne déploie pas sans accord. N’affirme jamais avoir exécuté une commande qui ne l’a pas été. Rapporte fichiers modifiés, vérifications réellement exécutées et limites.`,
`Exemple de plan : ajout de favoris locaux à un catalogue statique.

1. Inspecter le rendu des cartes, les identifiants et les tests disponibles.
2. Isoler la lecture/écriture du stockage dans un petit module avec gestion des exceptions.
3. Ajouter un bouton aria-pressed sur chaque carte et un filtre Favoris.
4. Tester le stockage indisponible, les identifiants inconnus et l’état vide.

Contrat possible :
function toggleFavorite(ids, id) {
  return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
}

Ce plan est illustratif : aucun dépôt n’a été inspecté et aucun test n’a été exécuté dans cet exemple.`,
['Ajouter une fonctionnalité','Encadrer un agent de développement'],['Donnez les critères d’acceptation.','L’accès au dépôt et aux outils est nécessaire pour exécuter le travail.'],['codex','claude','chatgpt','gemini']),
  row('storyboard-video-produit','Storyboard de vidéo produit','Préparer un tournage ou une génération vidéo avec des plans cohérents.','video',['Storyboard','Reels','Création'],'beginner',
`Prépare un storyboard pour [PRODUIT] destiné à [PUBLIC]. Durée : [DUREE]. Format : [FORMAT]. Fournis un concept, puis une liste de plans avec durée, cadrage, mouvement caméra, lumière, action, texte et son. Respecte les caractéristiques connues du produit. Signale les éléments manquants et les droits à vérifier. Ne prétends pas générer une vidéo si tu ne disposes pas d’un outil vidéo.`,
`Concept fictif : un café artisanal, vidéo verticale de 15 secondes.

0–3 s — Gros plan sur les grains, lumière latérale chaude, caméra fixe. Son : grains versés. Texte : « Une pause qui commence ici ».
3–7 s — Plan rapproché du café préparé, léger travelling avant. Aucun logo ou emballage non fourni.
7–11 s — Main déposant la tasse près d’un carnet, ambiance naturelle. Son discret de la tasse.
11–15 s — Plan produit stable, espace libre pour une signature de marque autorisée. Texte : « Découvrez notre café ».

Format proposé : 9:16. Vérifier les droits de musique et le consentement des personnes visibles. Il s’agit d’un storyboard textuel, pas d’une vidéo générée.`,
['Préparer un Reel','Briefer une équipe créative'],['Fournissez la durée et le format.','Vérifiez les capacités et limites de l’outil vidéo choisi.'],['general','creative','chatgpt','claude','gemini']),
  row('validation-idee-business','Valider une idée en 14 jours','Transformer une idée en hypothèses et expériences de terrain.','business',['PME','Validation','Stratégie'],'beginner',
`Agis comme un conseiller en création d’entreprise. Prépare un sprint de validation de 14 jours pour [IDEE] à [VILLE], ciblant [CLIENTS], avec [BUDGET]. Identifie problème, hypothèses, alternatives existantes et risques. N’invente pas de chiffres de marché ni de concurrents. Propose entretiens, test d’offre et critères de décision définis avant les résultats. Sépare faits, hypothèses et informations à rechercher.`,
`Idée fictive : service de préparation de contenus pour commerces à Casablanca. Budget de test : 1 500 MAD.

Hypothèse centrale : certains commerçants préfèrent un petit forfait régulier à une production interne irrégulière. Ce besoin n’est pas encore validé.

Jours 1–3 : sélectionner un segment et interroger 8 professionnels volontaires sur leur organisation actuelle, sans vendre pendant l’entretien.
Jours 4–7 : créer deux exemples de livrables, une page d’offre et un formulaire minimal.
Jours 8–11 : présenter l’offre à 10 prospects pertinents avec une approche individuelle et respectueuse.
Jours 12–14 : comparer objections, demandes de rendez-vous et acceptations du prix.

Critère de poursuite proposé avant le test : au moins deux demandes de pilote payé. Ce seuil est une règle de décision, pas une prévision de vente.
Budget indicatif : 500 MAD production, 500 MAD diffusion, 500 MAD réserve. Vérifier les coûts réels.`,
['Tester une offre','Préparer des entretiens clients'],['Un seuil de décision n’est pas une garantie.','Remplacez les suppositions par des entretiens.']),
  row('direction-photo-produit','Direction de photo produit','Écrire un brief visuel précis sans inventer une identité de marque.','image',['Photo produit','Composition','Branding'],'beginner',
`Crée un brief de génération d’image pour [PRODUIT], dans le style [STYLE], au format [FORMAT]. Décris composition, angle, lumière, matière, arrière-plan et emplacement du texte. Préserve les caractéristiques et le logo fournis ; si aucun logo n’est fourni, n’en invente pas un officiel. Donne une version principale et deux variantes. Distingue description de l’image souhaitée et image réellement générée.`,
`Brief principal : tasse en céramique blanche sans logo, vue trois quarts, sur une table en bois clair. Lumière diffuse venant de gauche, ombre douce, arrière-plan ivoire. Le produit occupe le tiers droit ; le tiers gauche reste vide pour une mise en page ultérieure. Format carré.

Variante A : fond bleu nuit, lumière plus directionnelle, texture de céramique visible.
Variante B : décor de bureau minimal, carnet fermé, profondeur de champ modérée.

Caractéristiques attendues : anse cohérente, proportions réalistes, pas de texte déformé ni de marque ajoutée. Contrôler ces points sur le résultat de l’outil.

Cet exemple décrit une composition ; aucune image n’est fournie ou générée ici.`,
['Briefer un outil d’image','Préparer des visuels e-commerce'],['Ajoutez une référence autorisée pour préserver le produit.','Vérifiez les détails du logo avant publication.'],['general','creative','chatgpt','claude','gemini']),
  row('calendrier-contenu-30-jours','Calendrier de contenu sur 30 jours','Relier contenus éducatifs, confiance et demandes commerciales.','marketing',['Contenu','Instagram','PME'],'beginner',
`Agis comme un stratège marketing. Crée un calendrier de 30 jours pour [ENTREPRISE] à [VILLE], ciblant [AUDIENCE]. Objectif : [OBJECTIF]. Regroupe les contenus par semaine, avec piliers, formats, accroches, CTA et indicateurs. Adapte la cadence à [RESSOURCES]. N’invente pas de témoignages, résultats ou bénéfices médicaux. Propose une méthode de mesure et signale les validations nécessaires.`,
`Entreprise fictive : studio de photographie à Casablanca. Objectif : obtenir des demandes de séance professionnelle. Ressources : deux publications et une vidéo par semaine.

Semaine 1 — Expliquer : carrousel « Que préparer avant une photo professionnelle ? » ; vidéo montrant l’installation ; CTA vers une checklist.
Semaine 2 — Rassurer : présenter le déroulement d’une séance ; répondre aux questions sur les délais ; utiliser uniquement des images autorisées.
Semaine 3 — Aider à choisir : comparer les usages portrait individuel / équipe ; montrer un exemple de brief ; CTA vers une demande de devis.
Semaine 4 — Faciliter le passage à l’action : expliquer réservation, livrables et tarifs validés ; publier une FAQ.

Mesure : demandes qualifiées, formulaires terminés et rendez-vous issus des liens balisés. Ne pas confondre engagement et vente.`,
['Organiser Instagram','Planifier du contenu local'],['Commencez par une cadence réaliste.','Validez toute promesse commerciale.']),
  row('landing-page-accessible','Structurer une landing page accessible','Concevoir un parcours simple, lisible et mesurable.','web',['HTML','Conversion','Accessibilité'],'intermediate',
`Propose une landing page pour [OFFRE] destinée à [PUBLIC]. Action principale : [ACTION]. Utilise [STACK] sans nouvelle dépendance sauf nécessité justifiée. Fournis structure de page, contenu de départ clairement signalé comme proposition, composant ou extrait HTML sémantique et plan de test. Prévois libellés, erreurs utiles, focus clavier, responsive et minimisation des données. Aucune preuve sociale ou statistique inventée.`,
`Architecture proposée pour un atelier IA : proposition de valeur → public concerné → programme → modalités → inscription.

Extrait HTML illustratif :
<section aria-labelledby="atelier-title">
  <h2 id="atelier-title">Recevoir le programme de l’atelier</h2>
  <form action="/inscription" method="post">
    <label for="email">Votre email professionnel</label>
    <input id="email" name="email" type="email" autocomplete="email" required>
    <button type="submit">Recevoir le programme</button>
  </form>
</section>

Le point d’envoi /inscription est à implémenter : cet extrait n’est pas un formulaire opérationnel.
Tests à réaliser : navigation clavier, champ invalide, message de confirmation serveur, mobile 320 px, consentement et absence de double soumission.`,
['Cadrer une page de conversion','Briefer un développeur'],['Précisez la stack existante.','Ne copiez pas un formulaire sans implémenter son traitement.'],['general','codex','chatgpt','claude','gemini']),
  row('workflow-qualification-crm','Qualifier un lead dans le CRM','Définir une automatisation fiable avec validation humaine et anti-doublons.','automation',['CRM','n8n','Leads'],'intermediate',
`Conçois un workflow pour qualifier les demandes de [ENTREPRISE] avec [OUTILS]. Déclencheur : [DECLENCHEUR]. Décris données minimales, validation, déduplication, règles, revue humaine, notifications internes et reprise après erreur. Les clés API restent côté serveur. N’envoie aucun message externe sans consentement et autorisation appropriés. Fournis un schéma textuel et un exemple JSON fictif sans données personnelles réelles.`,
`Déclencheur → formulaire reçu
→ Valider les champs et limiter les entrées
→ Détecter un doublon par identifiant de soumission
→ Enregistrer la demande avec un statut « À qualifier »
→ Attribuer un responsable selon le service demandé
→ Notifier le responsable, sans diffusion inutile des données
→ Attendre la revue humaine avant un message commercial

Exemple fictif :
{"submission_id":"demo-001","service":"audit","status":"needs_review","assigned_team":"consulting"}

En cas d’échec : conserver un journal sans secrets, réessayer uniquement les opérations idempotentes, puis alerter un administrateur. Les délais et limites de tentatives doivent être définis avant activation.`,
['Briefer un workflow n8n','Fiabiliser la qualification'],['Précisez le schéma réel de votre CRM.','Testez avec des données fictives avant activation.']),
  row('plan-apprentissage-competence','Apprendre une compétence en quatre semaines','Construire un parcours adapté au niveau et au temps disponible.','learning',['Formation','Pratique','Compétences'],'beginner',
`Construis un plan de quatre semaines pour apprendre [COMPETENCE]. Mon niveau : [NIVEAU]. Temps disponible : [TEMPS]. But concret : [LIVRABLE]. Commence par un diagnostic court. Pour chaque semaine, propose une notion, un exercice, un livrable et un critère observable de progression. Ne garantis pas une expertise en quatre semaines. Indique comment ajuster le plan si le rythme est trop élevé.`,
`Objectif fictif : comprendre les bases SQL et écrire des requêtes simples, 3 heures par semaine.

Diagnostic : distinguer ligne/colonne, expliquer un filtre, lire un petit tableau.
Semaine 1 : SELECT et WHERE ; filtrer une table d’entraînement ; expliquer chaque ligne de la requête.
Semaine 2 : GROUP BY ; calculer le nombre de demandes par service sur des données fictives.
Semaine 3 : JOIN ; relier deux petites tables et vérifier les doublons.
Semaine 4 : mini-projet ; répondre à cinq questions sur un jeu d’essai et documenter les limites.

Si les jointures restent difficiles, prolonger la semaine 3 au lieu d’ajouter une nouvelle notion. Ce parcours initie une pratique ; il ne certifie pas un niveau professionnel.`,
['Apprentissage autonome','Préparer un plan de formation'],['Choisissez un livrable observable.','Réservez du temps pour refaire les exercices.']),
  row('audit-qualite-donnees','Auditer la qualité d’un jeu de données','Repérer les risques avant de produire des graphiques ou des modèles.','data',['Qualité des données','Analyse','CSV'],'intermediate',
`À partir du schéma ou de l’échantillon [DONNEES], prépare un audit de qualité pour [OBJECTIF]. Examine types, valeurs manquantes, doublons, unités, périodes et biais de collecte. Distingue les anomalies visibles des contrôles à exécuter. Propose du code de validation adapté à [OUTIL]. Ne prétends pas analyser un fichier inaccessible. Ne déduis pas une causalité d’une corrélation.`,
`Schéma fictif : lead_id, created_at, channel, budget_mad. Aucun fichier fourni : les points ci-dessous sont un plan, pas un diagnostic mesuré.

Contrôles : unicité de lead_id ; dates valides et fuseau explicite ; budget numérique non négatif ; catégories de canal normalisées ; distinction budget inconnu / budget nul.

Pseudocode :
assert every_row_has_id(rows)
report_duplicates(rows, key="lead_id")
report_invalid_dates(rows, column="created_at")
report_missing_values(rows, per_column=True)

Décision : ne pas remplacer automatiquement les budgets manquants par zéro. Évaluer le mécanisme de collecte avant de comparer les canaux. Conserver un journal des transformations pour rendre l’analyse reproductible.`,
['Préparer une analyse','Nettoyer un export CRM'],['Partagez un schéma anonymisé.','Précisez les unités et la période.']),
  row('sequence-pedagogique-active','Créer une séquence pédagogique active','Associer objectifs, exercices et critères d’évaluation.','education',['Pédagogie','Exercices','Formation'],'beginner',
`Prépare une séance sur [SUJET] pour [APPRENANTS], durée [DUREE]. Définis deux objectifs observables, les prérequis, un déroulé minuté, une activité pratique, une adaptation pour les débutants et une évaluation courte avec critères. Évite de supposer des ressources non disponibles. Ne demande pas de données sensibles aux apprenants.`,
`Séance fictive : comprendre un bon brief IA, adultes débutants, 45 minutes.

Objectifs : identifier objectif/contexte/contraintes ; améliorer un brief vague.
0–5 min : comparer « Fais un post » et un brief précisant public, but et format.
5–15 min : présenter une grille simple avec un exemple sans donnée réelle.
15–30 min : par deux, réécrire un brief pour annoncer un atelier local.
30–40 min : échanger les briefs et vérifier qu’un autre groupe comprend le résultat attendu.
40–45 min : évaluation individuelle — nommer une contrainte utile et une information à ne pas partager.

Critères : objectif explicite, contexte suffisant, format vérifiable, aucune donnée sensible. Si aucun accès à un outil IA n’est disponible, réaliser l’activité sur papier.`,
['Préparer un atelier','Former une équipe'],['Adaptez au niveau réel des apprenants.','N’utilisez pas de données client dans les exercices.']),
  row('planifier-semaine-realiste','Planifier une semaine réaliste','Réduire la surcharge et rendre les arbitrages explicites.','productivity',['Organisation','Priorités','Temps'],'beginner',
`Aide-moi à planifier ma semaine avec [TACHES], [CONTRAINTES] et [HEURES_DISPONIBLES]. Classe les tâches par échéance, impact et dépendances. Demande les durées manquantes ou signale tes estimations. Prévois une marge pour imprévus. Si tout ne tient pas, propose explicitement ce qu’il faut reporter ou réduire au lieu de créer un planning irréalisable.`,
`Exemple fictif : 20 heures disponibles, quatre livrables estimés à 23 heures.

Capacité planifiée : 16 heures ; réserve : 4 heures.
Lundi : 3 h — préparer la proposition client dont l’échéance est mardi.
Mardi : 3 h — finaliser la proposition puis répondre aux demandes urgentes.
Mercredi : 4 h — corriger le formulaire bloquant les inscriptions.
Jeudi : 4 h — avancer le rapport, après réception des données.
Vendredi : 2 h — revue et préparation de la semaine suivante.

Arbitrage : reporter 7 heures de refonte non urgente. Les durées sont des estimations à confirmer ; si le formulaire dépasse 4 heures, renégocier le périmètre du rapport.`,
['Organiser son travail','Arbitrer des échéances'],['Ne partagez pas d’agenda confidentiel.','Réservez une marge réaliste.']),
  row('preparer-entretien-star','Préparer un entretien avec la méthode STAR','Structurer des réponses crédibles sans inventer d’expérience.','career',['Entretien','CV','STAR'],'beginner',
`Aide-moi à préparer un entretien pour [POSTE] à partir de [EXPERIENCES]. Propose cinq questions pertinentes, puis une réponse STAR fondée uniquement sur les faits fournis. Si un chiffre ou résultat manque, utilise un emplacement à compléter au lieu de l’inventer. Ajoute des relances possibles et une grille d’auto-évaluation clarté/preuve/pertinence.`,
`Poste fictif : coordinateur marketing. Expérience fournie : organisation d’un calendrier éditorial avec deux collègues, sans résultats chiffrés.

Question : « Comment avez-vous coordonné un projet avec plusieurs interlocuteurs ? »
Situation : notre équipe préparait plusieurs contenus en parallèle.
Tâche : rendre les étapes et validations visibles.
Action : j’ai regroupé les échéances dans un calendrier partagé et clarifié les responsables de validation.
Résultat : [décrire l’effet réellement observé, sans ajouter de chiffre non documenté].

Relances : quel obstacle avez-vous rencontré ? Que feriez-vous différemment ?
Auto-évaluation : la réponse décrit-elle mon rôle personnel, une action concrète et une preuve vérifiable ?`,
['Préparer un entretien','Structurer son expérience'],['Anonymisez les employeurs si nécessaire.','Ne laissez pas un exemple devenir une fausse expérience.']),
  row('comparer-sources-recherche','Comparer des sources avec esprit critique','Séparer preuves, désaccords et incertitudes dans une recherche.','research',['Sources','Recherche','Esprit critique'],'intermediate',
`Étudie [QUESTION] à partir de [SOURCES]. Pour chaque source accessible, indique auteur, date, type, affirmation, preuve et limite. Distingue données primaires, interprétations et opinions. Si tu disposes de la recherche web, privilégie des sources primaires et cite les URL effectivement consultées. Sinon, indique clairement les sources que tu ne peux pas vérifier. Termine par consensus, désaccords et questions ouvertes, sans inventer de références.`,
`Question fictive : un atelier IA a-t-il amélioré le temps de traitement d’une équipe ? Aucune étude n’est fournie dans cet exemple.

Matrice de recherche à compléter :
Source A — journal de temps avant/après : donnée opérationnelle potentiellement utile, mais charge de travail et méthode de collecte à comparer.
Source B — questionnaire des participants : renseigne la perception, pas directement le gain de temps.
Source C — page commerciale du prestataire : peut expliquer l’offre, ne constitue pas une preuve indépendante d’efficacité.

Conclusion provisoire : impossible de quantifier un effet à partir de ces seules descriptions. Chercher des mesures comparables, vérifier les changements simultanés et documenter les limites. Aucune référence réelle n’est affirmée ici.`,
['Préparer une synthèse','Évaluer une affirmation'],['Fournissez les sources ou autorisez une recherche.','Une URL seule ne prouve pas une affirmation.']),
  row('brief-seo-local','Brief SEO pour une page locale','Organiser une page utile sans inventer de volumes de recherche.','marketing',['SEO','Maroc','Contenu'],'intermediate',
`Prépare un brief SEO pour [SERVICE] à [VILLE], destiné à [CLIENTS]. Identifie l’intention probable, les questions utiles, un titre, une meta description, un H1 et un plan. Ne crée pas de faux volumes de recherche, positions ou avis. Si des données Search Console sont fournies, utilise-les ; sinon sépare hypothèses et requêtes à valider. Prévois des liens internes pertinents et des informations locales uniquement si elles sont vérifiées.`,
`Exemple fictif : atelier d’automatisation pour PME à Rabat.

Intention probable à valider : comprendre les usages, le programme et les modalités avant de contacter un intervenant.
Titre proposé : Atelier automatisation pour PME à Rabat | Programme
Meta description proposée : Découvrez un atelier pratique pour identifier les tâches répétitives, cadrer un workflow et préparer un premier test. Consultez le programme et les modalités.
H1 : Atelier d’automatisation pour les PME à Rabat

Plan : public et prérequis ; cas d’usage ; programme ; outils requis ; organisation ; questions fréquentes ; demande de programme.
Liens internes : guide d’automatisation et page de contact existants.
À valider : ville réellement desservie, lieu, dates, prix et données de recherche. Aucun volume ni classement n’est estimé.`,
['Briefer un rédacteur','Structurer une page service'],['Utilisez les requêtes réelles de Search Console lorsqu’elles existent.','Évitez les pages locales interchangeables sans valeur propre.']),
  row('plan-test-anti-regression','Plan de tests anti-régression','Couvrir les cas essentiels avant une mise en production.','vibe-coding',['Tests','QA','Débogage'],'intermediate',
`À partir de [CHANGEMENT] dans [ARCHITECTURE], prépare puis, si les outils le permettent, implémente un plan de tests pour [RISQUES]. Couvre parcours nominal, erreurs, permissions, données existantes, responsive et accessibilité. Sépare tests exécutés et tests proposés. Utilise des données fictives et des services simulés ; n’appelle pas d’API payante ni de production sans autorisation. Explique les limites de couverture.`,
`Changement fictif : un import CSV dans un CRM.

Tests unitaires : en-têtes connus ; accents ; doublons ; ligne vide ; valeurs trop longues ; contenu ressemblant à du HTML traité comme texte.
Tests d’intégration simulés : visiteur non connecté refusé ; aperçu sans écriture ; sauvegarde uniquement après approbation ; reprise après erreur sans doublon.
Tests d’interface : ordre clavier, erreur lisible, tableau utilisable sur mobile.

Invariant : les leads existants conservent leurs champs et identifiants.
Services : base de données et fournisseurs externes simulés.

Statut de cet exemple : plan proposé uniquement. Aucune commande ni suite de tests n’a été exécutée pour produire cet exemple.`,
['Préparer une livraison','Réduire les régressions'],['Identifiez les invariants métier avant les cas de test.','Ne confondez pas tests simulés et validation de production.'],['general','codex','chatgpt','claude','gemini']),
];
const previews = {
  'audit-interface-mobile':'Réduire les champs indispensables, associer les erreurs aux contrôles et tester le clavier : trois priorités, avec hypothèses et vérifications séparées.',
  'feature-coding-sans-regression':'Un plan pour ajouter des favoris locaux : module de stockage protégé, bouton accessible et tests des erreurs, sans réécrire le catalogue.',
  'storyboard-video-produit':'Quatre plans sur 15 secondes : grains, préparation, tasse et signature. Chaque plan précise le cadrage, le son et le texte.',
  'validation-idee-business':'Un sprint de 14 jours : entretiens, exemples de livrables, test d’offre puis décision sur un seuil défini avant les résultats.',
  'direction-photo-produit':'Tasse blanche en vue trois quarts, bois clair, lumière diffuse et espace pour le texte ; variantes bleu nuit et bureau minimal.',
  'calendrier-contenu-30-jours':'Quatre semaines : expliquer, rassurer, aider à choisir puis faciliter la réservation. Des formats réalistes et une mesure des demandes.',
  'landing-page-accessible':'Une structure de page d’atelier, un extrait HTML sémantique et des vérifications clavier, mobile et serveur à réaliser.',
  'workflow-qualification-crm':'Formulaire → validation → anti-doublons → CRM → notification interne → revue humaine. Un JSON fictif précise le statut.',
  'plan-apprentissage-competence':'Quatre semaines de SQL : filtres, regroupements, jointures et mini-projet, avec un critère observable à chaque étape.',
  'audit-qualite-donnees':'Un plan de contrôles : identifiants uniques, dates valides, unités et données manquantes, sans confondre budget inconnu et zéro.',
  'sequence-pedagogique-active':'Une séance de 45 minutes : comparaison de briefs, pratique en binôme, échange puis évaluation, réalisable aussi sans outil IA.',
  'planifier-semaine-realiste':'20 heures disponibles : 16 heures planifiées, 4 heures de réserve et 7 heures de travail non urgent explicitement reportées.',
  'preparer-entretien-star':'Une réponse STAR à compléter à partir d’une coordination éditoriale réelle, sans résultat chiffré inventé, avec questions de relance.',
  'comparer-sources-recherche':'Une matrice distingue mesures opérationnelles, perception des participants et discours commercial, sans conclure sans preuves.',
  'brief-seo-local':'Un titre, une meta description et un plan de page pour un atelier à Rabat ; ville, modalités et données de recherche restent à valider.',
  'plan-test-anti-regression':'Import CSV : caractères spéciaux, doublons, permissions, aperçu sans écriture et validation humaine, avec services externes simulés.',
};
for(const p of legacyPrompts)p.examplePreview=previews[p.slug];
