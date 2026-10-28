import {drafts} from './shared.js';
export default drafts('web',[
  [
    "architecture-information-site",
    "Définir l’architecture d’information",
    "Architecture web",
    "Organiser pages et liens selon les tâches des visiteurs.",
    "OBJECTIF SITE|PUBLIC|CONTENUS|STACK",
    "Inventorie les contenus, regroupe les intentions et propose arborescence, navigation et règles d’URL. Distingue page, section et filtre. Préserve les URLs utiles, prépare les redirections et identifie les contenus manquants. Donne parcours et tests de trouvabilité avant implémentation.",
    "## Site d’ateliers\n/ : orientation ; /ateliers/ : comparaison ; /ateliers/<slug>/ : programme ; /contact/ : demande.\nLes filtres de niveau ne deviennent pas automatiquement des pages indexables.\nMigration : conserver les URLs existantes pertinentes et rediriger uniquement vers une destination équivalente.\nTest : trouver un atelier débutant depuis l’accueil et comprendre la prochaine étape. Les slugs finaux restent à confronter aux routes existantes.",
    "Faites l’inventaire des URLs avant une réorganisation.",
    "Confondre menu court et contenu supprimé."
  ],
  [
    "plan-site-statique-astro",
    "Planifier un site statique avec Astro",
    "Astro",
    "Évaluer une organisation statique de contenu sans imposer une migration.",
    "CONTENU|STACK EXISTANTE|INTERACTIONS|HEBERGEMENT",
    "Vérifie si Astro répond au besoin et compare avec la solution existante. Si retenu, propose pages, layouts, collections, composants et interactions client minimales. Spécifie génération des routes, métadonnées et validation de contenu. Vérifie les commandes et APIs dans la documentation de la version choisie avant de coder.",
    "## Plan de catalogue\nCollections : ateliers et guides ; layout commun pour navigation et métadonnées.\nRoutes générées à partir des slugs validés. Recherche côté client sur un index limité ; contenu complet présent dans les pages.\nAcceptation : build sans dépendance à une base, route inconnue en 404 et liens internes valides.\nLa configuration exacte et les commandes sont à vérifier sur la version installée ; aucune migration n’a été exécutée.",
    "Ne migrez pas un site stable sans besoin identifié.",
    "Hydrater toute la page pour une interaction isolée."
  ],
  [
    "systeme-design-tailwind",
    "Organiser un design system Tailwind",
    "Tailwind CSS",
    "Relier classes utilitaires et décisions de design documentées.",
    "VERSION TAILWIND|TOKENS|COMPOSANTS|CONTRAINTES",
    "Inspecte configuration et version existantes avant de choisir la syntaxe. Définis tokens, variantes de composants, focus et responsive. Fournis un exemple de bouton et sa recette ; évite classes construites arbitrairement depuis une entrée utilisateur. Explique migration et validation du CSS généré.",
    "## Organisation proposée\nTokens : action, texte, surface et espace de contrôle.\nBouton : variantes primaire/secondaire, taille stable, focus visible et état désactivé explicite.\nContrôle : toutes les variantes existent dans le CSS de production et restent lisibles en mobile.\nLa syntaxe de configuration dépend de la version du projet et doit être vérifiée. Cet exemple ne prétend pas qu’une configuration particulière a été compilée.",
    "Vérifiez la version avant de reprendre un exemple de configuration.",
    "Créer une classe dynamique absente de la compilation."
  ],
  [
    "optimisation-core-web-vitals",
    "Diagnostiquer les Core Web Vitals",
    "Web performance",
    "Relier les mesures de terrain et de laboratoire à des corrections ciblées.",
    "URL OU CODE|MESURES|APPAREILS|CONTRAINTES",
    "Sépare données terrain et tests laboratoire, puis examine chargement principal, réactivité et stabilité visuelle. Demande les mesures manquantes. Propose une correction par cause, protocole avant/après et garde-fous. N’annonce pas un score Lighthouse ni une amélioration sans mesure.",
    "## Plan pour une page illustrée\nHypothèse : l’image principale retarde le contenu visible.\nContrôles : dimensions, format, priorité de chargement et temps serveur.\nAction candidate : adapter la taille et réserver l’espace, sans charger paresseusement une image critique.\nMesure : comparer même page, réseau et appareil ; examiner aussi les interactions.\nSans rapport fourni, aucun Core Web Vital n’est déclaré bon ou mauvais.",
    "Conservez les conditions de mesure.",
    "Prendre un score de laboratoire isolé pour une mesure de tous les utilisateurs."
  ],
  [
    "donnees-structurees-implementation",
    "Implémenter des données structurées cohérentes",
    "Schema.org",
    "Décrire le contenu visible sans inventer d’entités ni de preuves.",
    "TYPE DE PAGE|CONTENU VISIBLE|IDENTITE|STACK",
    "Choisis des types adaptés au contenu, justifie les propriétés et fournis un JSON-LD minimal. Réutilise les identifiants cohérents du site. Exclue avis, prix ou qualifications non présents. Prévois validation syntaxique, cohérence des URLs et vérification des exigences de moteur actuelles via sources officielles.",
    "## Ressource pédagogique fictive\n~~~json\n{\"@context\":\"https://schema.org\",\"@type\":\"LearningResource\",\"name\":\"Guide d’initiation\",\"inLanguage\":\"fr\",\"isAccessibleForFree\":true}\n~~~\nÀ compléter avec URL et auteur réels. Le balisage doit correspondre à la page ; il ne garantit pas un résultat enrichi ni une citation IA. Tester syntaxe, canonical et contenu visible avant livraison.",
    "Commencez par les faits effectivement publiés.",
    "Ajouter des étoiles ou avis pour attirer les moteurs."
  ],
  [
    "validation-formulaire-securisee",
    "Sécuriser la validation d’un formulaire",
    "Formulaires",
    "Définir un contrat de validation cohérent entre client et serveur.",
    "CHAMPS|REGLES METIER|ENDPOINT|MENACES",
    "Définis types, longueurs, formats, valeurs autorisées et erreurs par champ. Le serveur reste autoritaire. Prévois protection contre abus, requêtes répétées et contenu traité comme texte. Ne journalise pas de secrets. Fournis cas valides/invalides et comportement de reprise sans perte inutile.",
    "## Demande de programme\nChamps : email, session choisie et consentement pertinent.\nClient : aide de saisie ; serveur : vérifier email et identifiant de session autorisé.\nRejet : champ trop long, session inconnue ou corps inattendu.\nAcceptation : double soumission ne crée pas deux demandes, message accessible et aucun secret dans la réponse. Les données de test sont fictives ; l’endpoint reste à implémenter.",
    "Testez directement les requêtes, pas seulement le navigateur.",
    "Faire confiance aux contrôles HTML pour protéger le serveur."
  ],
  [
    "plan-deploiement-cloudflare-pages",
    "Préparer un déploiement Cloudflare Pages",
    "Cloudflare Pages",
    "Rendre la publication reproductible et réversible.",
    "DEPOT|COMMANDE BUILD|DOSSIER SORTIE|ENVIRONNEMENTS",
    "Inspecte les scripts puis documente branche, build, sortie, variables serveur, redirections et headers. Prévois environnement de prévisualisation, vérification des fonctions et rollback. Ne copie pas de secrets dans les fichiers publics. Vérifie les réglages actuels avant de donner des commandes ; ne publie pas sans accord.",
    "## Checklist proposée\n1. Build local et liens internes validés.\n2. Dossier de sortie identifié dans le projet.\n3. Variables privées configurées côté plateforme.\n4. Prévisualisation contrôlée : routes, 404, cache et fonctions.\n5. Publication uniquement après autorisation.\nRetour arrière : revenir à une version connue et vérifier les contrats de données. Aucun déploiement ni réglage de compte n’est effectué par cet exemple.",
    "Vérifiez les fonctions serveur autant que les pages statiques.",
    "Déclarer la mise en ligne réussie après un simple push Git."
  ],
  [
    "audit-securite-site-web",
    "Auditer la sécurité d’un site web",
    "Audit sécurité web",
    "Identifier des risques techniques dans un périmètre autorisé.",
    "ARCHITECTURE|SURFACES|ACCES AUTORISES|CRITICITE",
    "Réalise d’abord les contrôles non destructifs : configuration, secrets exposés, validation, permissions et dépendances. Classe les risques avec scénario et preuve. Propose remédiation et test de refus. Ne scanne pas un tiers, n’exploite pas de faille et ne modifie pas les protections sans autorisation.",
    "## Site public avec espace privé\nRisque à examiner : une route publique peut exposer un fichier interne.\nContrôle : inventaire de sortie de build et règles de routage.\nAutre contrôle : une requête non authentifiée vers une route privée doit être refusée.\nLes headers de sécurité complètent les contrôles applicatifs ; ils ne remplacent pas l’autorisation. Aucun défaut réel n’est affirmé sans inspection.",
    "Définissez le périmètre et les actions permises.",
    "Transformer un audit en tentative d’exploitation non autorisée."
  ],
  [
    "architecture-donnees-supabase",
    "Concevoir une architecture Supabase",
    "Supabase",
    "Définir tables, permissions et migrations en préservant les données.",
    "ENTITES|RELATIONS|ROLES|CONTRAINTES",
    "Propose schéma, clés, contraintes, index et politiques d’accès. Distingue accès utilisateur et service serveur. Prévois migrations additives, données existantes, sauvegarde et tests intercomptes. Vérifie les APIs de la version réelle. N’applique pas de SQL en production sans autorisation.",
    "## Demandes et notes internes\nTables : demandes ; notes liées par identifiant de demande ; auteur déterminé côté serveur.\nContrainte : identifiant de soumission unique pour l’idempotence.\nPermissions : un utilisateur ne lit que les dossiers autorisés ; un secret administrateur reste serveur.\nTests : notes d’un autre compte refusées et migration compatible avec les dossiers existants. Ce schéma est une proposition, pas une base déjà migrée.",
    "Écrivez les tests d’accès avant les politiques finales.",
    "Désactiver les protections pour résoudre un problème de lecture."
  ],
  [
    "dashboard-crm-developpement",
    "Développer un dashboard CRM",
    "CRM frontend",
    "Construire des vues utiles sans perdre les fonctionnalités existantes.",
    "CRM EXISTANT|DONNEES|ROLES|ACTIONS",
    "Inspecte routes et contrats. Implémente indicateurs utiles, liste paginée, filtres, détail et actions autorisées. Distingue chargement, erreur et données vides. Préserve identifiants et informations existantes. Teste permissions, saisie longue, mobile et double action ; ne change pas le modèle de données sans nécessité documentée.",
    "## Vue de demandes\nRésumé : à qualifier, à relancer et rendez-vous proches.\nListe : pagination serveur, filtres persistants et lien détail.\nErreur : expliquer l’échec de lecture, ne pas afficher « 0 demande ».\nActions : édition avec validation, suppression seulement selon les règles approuvées.\nRecette : dossier existant intact, filtrage cohérent, retour à la liste conservé et accès intercompte refusé. Aucun contact réel n’est modifié.",
    "Définissez les actions fréquentes avant les indicateurs.",
    "Rendre une liste élégante mais impossible à filtrer."
  ],
  [
    "chargement-images-web",
    "Optimiser le chargement des images",
    "Images web",
    "Réduire le coût des médias sans dégrader leur fonction.",
    "IMAGES|EMPLACEMENTS|TAILLES AFFICHEES|STACK",
    "Classe images critiques et non critiques. Propose dimensions, variantes, formats et stratégie de chargement selon leur usage. Réserve l’espace pour éviter les sauts et préserve textes alternatifs pertinents. Mesure poids et rendu ; ne transforme pas un gain d’octets en score de performance inventé.",
    "## Page de service\nHero : taille adaptée au viewport, espace réservé, chargement non retardé si critique.\nGalerie sous la ligne de flottaison : variantes plus petites et chargement différé approprié.\nDécor : alternative vide si aucune information n’est transmise.\nContrôles : même cadrage utile, absence de flou excessif et de décalage de mise en page. Le poids final doit être mesuré sur les fichiers produits.",
    "Dimensionnez selon l’affichage réel.",
    "Appliquer lazy-loading à toutes les images sans distinction."
  ],
  [
    "404-etats-erreur-web",
    "Concevoir une 404 et des états d’erreur",
    "États d’erreur",
    "Aider à récupérer d’un échec sans masquer le statut technique.",
    "ROUTES|ERREURS|PARCOURS|STACK",
    "Spécifie 404 réelle, erreur réseau, absence de résultat et refus d’accès. Donne message, action de récupération et contenu conservé. Évite les redirections systématiques vers l’accueil et les erreurs rendues en HTTP 200. Prévois contrôles de statut et navigation clavier.",
    "## Route inconnue\nTitre : « Cette page est introuvable » ; liens vers ressources et accueil.\nStatut attendu : 404, pas une page de succès.\nErreur de filtre : état vide différent, avec option d’effacer les critères.\nErreur réseau : réessayer sans perdre la sélection.\nRefus privé : ne pas révéler l’existence d’un dossier non autorisé. Tester chaque cas séparément dans l’environnement local.",
    "Distinguez absence de contenu et panne de lecture.",
    "Renvoyer toutes les URLs inconnues vers l’accueil."
  ],
  [
    "strategie-internationalisation-site",
    "Préparer l’internationalisation d’un site",
    "Internationalisation",
    "Planifier langues, URLs et contenu sans dupliquer mécaniquement le site.",
    "LANGUES|PUBLICS|CONTENUS|ARCHITECTURE",
    "Compare besoins réels et coût de maintenance. Définis routes, sélection de langue, traductions, formats de date et direction du texte si nécessaire. Prévois canonical/hreflang adaptés, contenus manquants et revue humaine. Ne redirige pas automatiquement de manière bloquante selon une géolocalisation supposée.",
    "## Site français avec future version anglaise\nPriorité : pages essentielles traduites et relues, pas tout le catalogue automatiquement.\nRoutes proposées : espaces linguistiques distincts après validation de l’architecture.\nSélecteur : accessible, conserve la page équivalente lorsqu’elle existe.\nUne traduction absente doit être indiquée sans faux équivalent. Tester dates, libellés longs et métadonnées ; la décision de langue suit les besoins du public.",
    "Évaluez la capacité de maintenir les traductions.",
    "Publier une traduction automatique non relue comme édition finalisée."
  ],
  [
    "audit-seo-technique-web",
    "Auditer le SEO technique",
    "SEO technique",
    "Vérifier les signaux techniques avant de modifier le contenu.",
    "SITE OU DEPOT|SITEMAP|RAPPORTS|PERIMETRE",
    "Contrôle statuts, robots, canonicals, redirections, liens internes, métadonnées, contenu rendu et sitemap. Vérifie la cohérence des variantes d’URL et des données structurées. Priorise les problèmes confirmés avec preuve et correction. Ne demande pas une désindexation massive et ne garantis pas l’indexation.",
    "## Audit préparatoire\nContrôles : URL canonique retourne 200 ; variantes redirigent directement ; sitemap ne contient pas d’URL privée ; liens internes évitent les chaînes.\nDistinguer robots.txt et noindex : leur rôle doit être vérifié dans le contexte réel.\nUne page valide techniquement n’est pas garantie indexée. Documenter les statuts observés et tester les corrections avant publication, sans inventer de rapport Search Console.",
    "Vérifiez le rendu et les statuts réels.",
    "Traiter toute URL non indexée comme une erreur technique."
  ]
]);

