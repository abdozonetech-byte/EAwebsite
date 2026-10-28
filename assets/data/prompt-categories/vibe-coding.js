import {drafts} from './shared.js';
export default drafts('vibe-coding',[
  [
    "idee-brief-developpement",
    "Transformer une idée en brief de développement",
    "Brief produit",
    "Transformer une idée imprécise en périmètre fonctionnel vérifiable.",
    "IDEE|UTILISATEURS|OBJECTIF|CONTRAINTES",
    "Définis problème, utilisateurs, parcours principal et exclusions. Distingue besoin et solution supposée. Propose un MVP, modèle de données minimal, risques et critères d’acceptation. Pose les questions qui bloquent l’architecture avant de coder. Livre un brief utilisable par un développeur, pas seulement une liste de fonctionnalités.",
    "## Brief : réservation d’ateliers\nProblème supposé : les demandes arrivent sur plusieurs canaux.\nMVP : catalogue de sessions, formulaire de demande, confirmation manuelle et export des inscrits.\nExclusions : paiement et réservation instantanée tant que les règles ne sont pas définies.\nAcceptation : demande valide enregistrée une fois, erreur lisible, accès administratif protégé.\nQuestion bloquante : qui confirme la capacité restante ? Ce choix détermine la gestion des créneaux.",
    "Décrivez la décision métier avant les écrans.",
    "Prendre toutes les idées initiales pour des exigences."
  ],
  [
    "plan-projet-coding-ia",
    "Planifier un projet assisté par IA",
    "Plan de développement",
    "Décomposer un projet en lots contrôlables par un agent de code.",
    "DEPOT|LIVRABLE|DELAI|OUTILS AUTORISES",
    "Inspecte le dépôt si accessible puis construis un graphe de dépendances. Définis lots, entrée/sortie, tests, points de revue et retour arrière. Réserve les changements de données et déploiements à une autorisation distincte. Explique comment conserver le contexte sans transmettre de secrets ni laisser l’agent dériver du périmètre.",
    "## Lots d’un catalogue\n1. Contrat de contenu et validation.\n2. Rendu statique et routes.\n3. Recherche et états vides.\n4. Copie, favoris et tests.\nRevue après chaque contrat stable, pas après chaque fichier. Une régression bloque le lot suivant. Le déploiement n’est pas inclus dans l’autorisation de développer. Ce plan suppose un site existant ; les commandes exactes dépendent du dépôt inspecté.",
    "Donnez à chaque lot une preuve de fin observable.",
    "Lancer des modifications parallèles sans définir les responsabilités."
  ],
  [
    "frontend-responsive-agent",
    "Implémenter un frontend responsive",
    "Frontend",
    "Produire une interface adaptative à partir d’un brief sans changer la stack.",
    "BRIEF|STACK|ECRANS|DONNEES EXEMPLE",
    "Inspecte les composants et styles existants. Implémente structure sémantique, états, interactions et responsive. Définis des critères aux petites et grandes largeurs, au clavier et avec reduced-motion. Utilise des données fictives identifiées. Rapporte tests réellement exécutés et fonctions encore simulées ; ne déploie pas.",
    "## Plan d’interface : annuaire\nComposants : recherche, filtres, carte et détail.\nMobile : une colonne, filtres repliables ; bureau : grille lisible.\nÉtats : résultats, aucun résultat et chargement seulement si une requête existe.\nAcceptation : recherche sans rechargement, lien détail partageable et aucun débordement horizontal.\nLes mesures de performance et les commandes de build restent à exécuter sur le projet réel.",
    "Fournissez les états d’erreur en plus de l’écran nominal.",
    "Remplacer l’architecture pour reproduire une maquette."
  ],
  [
    "choix-stack-pragmatique",
    "Choisir une stack pragmatique",
    "Architecture",
    "Comparer des technologies selon les besoins et la maintenance réelle.",
    "FONCTIONS|EQUIPE|HEBERGEMENT|VOLUME",
    "Compare trois options, dont la stack existante si disponible. Évalue rendu, authentification, données, coûts opérationnels, compétences et réversibilité. Ne choisis pas une technologie pour sa popularité seule. Livre une matrice, une recommandation conditionnelle et un petit test permettant de vérifier le risque principal.",
    "## Catalogue éditorial sans compte\n| Option | Avantage | Coût de complexité |\n| HTML/JS | Déploiement simple | Génération à organiser |\n| Générateur statique | Templates et contenu | Étape de build |\n| Application serveur | Fonctions dynamiques | Exploitation accrue |\nChoix illustratif : statique si le contenu change par publication. Test : ajouter une entrée et vérifier routes, métadonnées et recherche. Si l’édition multiutilisateur devient indispensable, réévaluer la décision.",
    "Incluez le coût de maintenance dans la comparaison.",
    "Comparer seulement la vitesse du premier prototype."
  ],
  [
    "refactorisation-code-sure",
    "Refactoriser sans changer le comportement",
    "Refactorisation",
    "Réduire une dette technique en conservant les contrats existants.",
    "CODE OU MODULE|COMPORTEMENT ATTENDU|RISQUES",
    "Identifie entrées, sorties, effets de bord et dépendances. Ajoute des tests de caractérisation avant la transformation. Propose une extraction limitée, conserve les interfaces publiques et montre comment vérifier la parité. Ne mélange pas refactorisation et ajout de fonctions ; préserve les changements locaux.",
    "## Extraction d’un filtre\nAvant : normalisation et filtrage mélangés au rendu.\nAprès : une fonction pure reçoit catalogue et critères ; le rendu consomme sa sortie.\nTests de parité : accents, recherche vide, filtres combinés et ordre stable.\nAucun changement du format des données ni des URLs n’est prévu. Si un comportement ambigu apparaît, le documenter avant correction plutôt que le modifier silencieusement.",
    "Fixez les invariants avant d’optimiser.",
    "Changer une API publique au milieu d’un nettoyage interne."
  ],
  [
    "diagnostic-bug-complexe",
    "Diagnostiquer un bug complexe",
    "Débogage",
    "Identifier une cause avec des preuves avant de modifier le code.",
    "SYMPTOME|REPRODUCTION|JOURNAUX ANONYMISES|CHANGEMENTS RECENTS",
    "Construis une chronologie, classe les hypothèses puis propose les vérifications discriminantes les moins risquées. Reproduis avec services simulés si possible. Sépare cause, facteur aggravant et correction. N’applique pas plusieurs changements spéculatifs à la fois. Termine par un test de non-régression et les preuves encore manquantes.",
    "## Symptôme : import doublonné\nHypothèses : double clic, reprise réseau ou déclenchement serveur répété.\nVérification prioritaire : comparer l’identifiant de soumission dans les journaux anonymisés.\nSi deux traitements partagent le même identifiant, tester l’idempotence ; s’ils diffèrent, inspecter l’interface.\nCorrection candidate : contrainte d’unicité et réponse réutilisée. Aucun diagnostic n’est confirmé avant observation des requêtes. Tester ensuite une reprise après timeout.",
    "Fournissez une reproduction minimale.",
    "Masquer le symptôme avec un délai arbitraire."
  ],
  [
    "feature-bout-en-bout",
    "Livrer une fonctionnalité de bout en bout",
    "Livraison fonctionnelle",
    "Relier interface, serveur, données et vérifications dans un même périmètre.",
    "FEATURE|ARCHITECTURE|CONTRAT METIER|AUTORISATIONS",
    "Inspecte le projet puis décris le flux complet. Implémente contrats, validation, permissions, interface et erreurs sans reconstruire l’application. Prévois migration additive si nécessaire, compatibilité et rollback. Vérifie parcours nominal et refus d’accès. Une action externe ou un déploiement requiert l’autorisation prévue ; rapporte les limites.",
    "## Fonction : note interne sur un dossier\nFlux : utilisateur autorisé → validation longueur → enregistrement lié au dossier → retour dans l’interface.\nDonnées : identifiant du dossier, auteur serveur, texte et date.\nTests : dossier d’un autre compte refusé ; double soumission gérée ; erreur conserve le brouillon.\nMigration proposée : table additive, sans toucher aux dossiers. Le plan n’autorise pas son application en production.",
    "Incluez la permission dans le contrat de la fonctionnalité.",
    "Tester uniquement la réussite depuis l’interface."
  ],
  [
    "specification-technique-production",
    "Rédiger une spécification technique",
    "Spécification",
    "Définir un contrat de réalisation utilisable et testable.",
    "PROBLEME|SYSTEME EXISTANT|CONTRAINTES|DECISIONS VALIDEES",
    "Rédige objectifs, non-objectifs, flux, interfaces, données, sécurité, états d’échec et observabilité. Ajoute exemples de requêtes fictives, critères d’acceptation et questions ouvertes. Documente les compromis et les changements incompatibles. N’invente pas une décision d’architecture déjà approuvée.",
    "## Spécification : export de demandes\nContrat : export des dossiers visibles par l’utilisateur, pas de l’ensemble de la base.\nColonnes : identifiant, date, service et statut ; données personnelles exclues par défaut.\nErreurs : session expirée, export trop volumineux, erreur de lecture.\nAcceptation : pagination serveur complète, même filtrage que l’écran et absence de fuite intercompte.\nQuestion ouverte : durée de conservation d’un fichier généré.",
    "Donnez des exemples d’erreurs autant que de réponses valides.",
    "Laisser les règles d’accès implicites."
  ],
  [
    "revue-pull-request",
    "Revoir une pull request avec preuves",
    "Code review",
    "Trouver des régressions concrètes dans un diff sans réécrire le projet.",
    "DIFF|OBJECTIF|TESTS DISPONIBLES",
    "Inspecte le contexte nécessaire et concentre la revue sur bugs, sécurité, données et contrats. Pour chaque défaut, donne sévérité, fichier/ligne vérifiés, scénario déclencheur et correction minimale. Sépare préférences de style et problèmes fonctionnels. Ne crée pas de commentaire distant ni de modification sans autorisation.",
    "## Exemple de constat à vérifier\nRisque : le filtre d’export peut ignorer les permissions appliquées à l’écran.\nScénario : un utilisateur choisit « Tout exporter » après filtrage local ; la requête serveur n’inclut pas son périmètre.\nVérification : comparer les garde-fous des endpoints liste/export.\nCorrection minimale : réutiliser la même restriction serveur.\nIl s’agit d’un exemple de revue, sans numéro de ligne réel ni défaut confirmé dans un dépôt.",
    "Fournissez le diff et l’intention du changement.",
    "Présenter un soupçon sans scénario reproductible."
  ],
  [
    "durcissement-securite-application",
    "Améliorer la sécurité d’une application",
    "Sécurité applicative",
    "Prioriser des protections selon les surfaces réellement exposées.",
    "ARCHITECTURE|ACTIFS|MENACES|PERMISSIONS",
    "Cartographie frontières de confiance, authentification, autorisation, entrées et secrets. Propose des contrôles non destructifs puis les corrections prioritaires. Préserve les données existantes et prépare les tests de refus. Ne lance pas de scan intrusif ni d’exploitation sur un système non autorisé.",
    "## Formulaire public vers CRM\nFrontières : navigateur → serveur public → base privée.\nPriorités : validation serveur, limitation de taille, contrôle des rôles et secret jamais envoyé au client.\nTests proposés : entrée trop longue, HTML traité comme texte, accès au dossier d’un autre utilisateur refusé.\nLa présence de ces tests ne prouve pas une sécurité globale. Toute analyse active nécessite un périmètre autorisé.",
    "Décrivez les actifs et les conséquences d’un abus.",
    "Assimiler clé publique d’un service et secret administrateur."
  ],
  [
    "optimisation-performance-agent",
    "Optimiser une application à partir de mesures",
    "Performance",
    "Choisir une optimisation après identification du goulot d’étranglement.",
    "PARCOURS|MESURES|BUDGET PERFORMANCE|STACK",
    "Établis une référence et vérifie les conditions de mesure. Sépare réseau, CPU, rendu et base. Choisis une modification ciblée, précise le bénéfice attendu et les risques puis compare avant/après. Ne sacrifie pas accessibilité ou sécurité. N’annonce aucun score sans exécution de l’outil correspondant.",
    "## Catalogue lent : piste de travail\nObservation supposée : téléchargement initial excessif.\nMesure à obtenir : poids transféré, temps de traitement et nombre de nœuds.\nChangement candidat : index compact et chargement des détails à la demande.\nContrôle : même recherche, même accès sans JavaScript et copie complète conservée.\nUne diminution des octets ne suffit pas à prouver un gain ressenti ; mesurer le parcours réel sur un profil réseau constant.",
    "Ne changez qu’une famille de causes à la fois.",
    "Optimiser avant de connaître le coût dominant."
  ],
  [
    "documentation-technique-maintenable",
    "Documenter un projet pour sa maintenance",
    "Documentation",
    "Rendre un dépôt exploitable sans transmettre de secrets.",
    "DEPOT|LECTEURS|OPERATIONS FREQUENTES",
    "Vérifie les scripts et l’architecture accessibles. Rédige démarrage, variables d’environnement sans valeurs secrètes, structure, tests, migrations et procédures d’incident. Distingue commandes vérifiées et proposées. Fournis une checklist de mise à jour de la documentation lors des prochaines modifications.",
    "## Guide d’exploitation proposé\n- Démarrage : utiliser le script réellement présent dans package.json.\n- Configuration : nom de variable, rôle et caractère obligatoire, sans valeur.\n- Données : migration additive, sauvegarde et validation des permissions.\n- Incident : conserver les journaux anonymisés et vérifier la version déployée.\nLes commandes ne sont pas inventées : si le dépôt manque, la section reste « à confirmer ».",
    "Faites tester le guide par quelqu’un qui découvre le dépôt.",
    "Copier des secrets réels dans un exemple de configuration."
  ],
  [
    "audit-preparation-release",
    "Vérifier une release avant livraison",
    "Release readiness",
    "Décider si une version peut être livrée sur la base de preuves.",
    "CHANGEMENTS|CRITERES|ENVIRONNEMENTS|RISQUES",
    "Crée une matrice tests, build, migrations, permissions, rollback, monitoring et documentation. Indique preuve, statut et responsable de chaque point. Classe bloquants et risques acceptables sans convertir un test non exécuté en réussite. Produis une recommandation go/no-go conditionnelle ; ne déploie pas.",
    "## Décision illustrative : no-go\n| Contrôle | Statut |\n| Tests unitaires | À exécuter |\n| Build reproductible | À exécuter |\n| Migration réversible | Non documentée |\n| Retour arrière | À préparer |\nBloquant : aucune preuve sur la migration. Action : tester une copie anonymisée et documenter la restauration. Le tableau illustre une méthode ; il ne rapporte pas l’état d’un projet réel.",
    "Exigez une preuve attachée à chaque statut.",
    "Déclarer une release prête parce que la page d’accueil s’affiche."
  ]
]);

