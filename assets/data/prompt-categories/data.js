import {drafts} from './shared.js';
export default drafts('data',[
  [
    "nettoyage-csv-plan",
    "Nettoyer un CSV de façon reproductible",
    "Nettoyage CSV",
    "Préparer des transformations traçables sans modifier silencieusement les données.",
    "SCHEMA|ECHANTILLON ANONYMISE|REGLES|OUTIL",
    "Inventorie types, séparateurs, encodage et unités. Propose règles pour vides, doublons et formats ; conserve original et journal des changements. Montre un petit exemple avant/après et des tests. Ne supprime pas automatiquement une ligne ambiguë ou une valeur extrême.",
    "## Exemple fictif\nAvant : ville « casablanca » et « Casablanca », budget vide et budget 0.\nTransformation : harmoniser la casse de la ville selon référentiel validé ; conserver la distinction vide/zéro.\nJournal : règle, lignes concernées et version de sortie.\nTests : nombre de lignes expliqué, identifiants inchangés et possibilité de revenir au fichier source. Aucune donnée réelle n’est nettoyée dans cet exemple.",
    "Gardez le fichier source immuable.",
    "Remplacer tous les vides par zéro."
  ],
  [
    "analyse-exploratoire-donnees",
    "Conduire une analyse exploratoire",
    "EDA",
    "Explorer distributions et relations avant de formuler une conclusion.",
    "DONNEES|QUESTION|PERIODE|OUTIL",
    "Vérifie qualité et périmètre, puis propose résumés, distributions et comparaisons utiles. Distingue observations, hypothèses et analyses complémentaires. Fournis code ou pseudocode adapté, sans prétendre l’exécuter sur un fichier absent. Signale sélection et données manquantes.",
    "## EDA de demandes fictives\nCommencer par volume par jour, distribution des statuts et taux de champs manquants.\nComparer canaux seulement après harmonisation des périodes et déduplication.\nSi un pic apparaît, vérifier campagne, incident et changement de collecte avant de conclure.\nSortie : graphiques descriptifs et questions à investiguer. Aucun effet causal ni tendance réelle n’est affirmé sans jeu de données accessible.",
    "Examinez la collecte avant d’interpréter les graphiques.",
    "Chercher uniquement les relations favorables à l’hypothèse initiale."
  ],
  [
    "requete-sql-revue",
    "Écrire et revoir une requête SQL",
    "SQL",
    "Produire une requête dont le périmètre et les résultats peuvent être vérifiés.",
    "SCHEMA|QUESTION|DIALECTE|REGLES ACCES",
    "Définis grain, relations et filtres avant la requête. Utilise paramètres plutôt que concaténation d’entrées. Explique jointures, NULL et doublons possibles. Fournis un petit jeu fictif avec résultat attendu et plan de contrôle. Aucune écriture ou requête coûteuse de production sans accord.",
    "## Compter les demandes par statut\n~~~sql\nSELECT status, COUNT(*) AS total\nFROM leads\nWHERE created_at >= :start_at AND created_at < :end_at\nGROUP BY status;\n~~~\nÀ adapter au dialecte et au périmètre d’accès. Test fictif : deux lignes new et une closed donnent 2 et 1. Vérifier fuseau, bornes et exclusion des dossiers non autorisés avant exécution.",
    "Définissez le grain avant les jointures.",
    "Ajouter DISTINCT pour cacher une jointure incorrecte."
  ],
  [
    "choisir-visualisation-donnees",
    "Choisir un graphique utile",
    "Visualisation",
    "Choisir une représentation selon la question et les limites des données.",
    "QUESTION|VARIABLES|PUBLIC|SUPPORT",
    "Compare tableau, barres, lignes et distribution selon types et objectif. Propose axes, unités, échelles et légendes. Évite effets 3D, axes trompeurs et excès de couleurs. Fournis une alternative textuelle et indique quand aucun graphique n’est préférable.",
    "## Demandes par service\nQuestion : comparer les volumes, pas montrer une évolution.\nChoix : barres avec unités et période explicites ; tableau associé pour les valeurs exactes.\nSi un service manque de données, l’indiquer au lieu de le dessiner à zéro.\nUne courbe ne convient que si l’axe représente réellement le temps. La narration doit décrire la comparaison sans inventer la cause des écarts.",
    "Commencez par la question du lecteur.",
    "Choisir un graphique parce qu’il est visuellement spectaculaire."
  ],
  [
    "analyse-test-ab",
    "Analyser un test A/B prudemment",
    "Expérimentation",
    "Évaluer un test avec ses hypothèses et ses incertitudes.",
    "PLAN TEST|COMPTAGES|METRIQUE|REGLES ARRET",
    "Vérifie unité d’assignation, indépendance, durée, exposition et intégrité des groupes. Calcule les taux si les dénominateurs existent ; propose méthode statistique adaptée et intervalle d’incertitude si exécutable. Ne fabrique ni p-value ni significativité. Distingue absence de preuve et absence d’effet.",
    "## Comptages fictifs\nA : 10 conversions sur 100 ; B : 12 sur 100.\nTaux descriptifs : 10 % et 12 %. Écart observé : 2 points.\nCes seuls chiffres ne suffisent pas à annoncer un gagnant. Vérifier assignation, définition de conversion, plan d’analyse et incertitude avec une méthode appropriée.\nDécision : poursuivre ou conclure selon les règles fixées avant le test, pas selon un pic favorable.",
    "Fixez la métrique principale avant de regarder les résultats.",
    "Arrêter dès qu’une variante paraît meilleure."
  ],
  [
    "analyse-cohortes-clients",
    "Analyser des cohortes",
    "Cohortes",
    "Comparer des groupes définis à une même étape de leur parcours.",
    "DONNEES|EVENEMENT DEPART|PERIODE|DEFINITION RETENTION",
    "Définis cohortes, unités, fenêtre et maturité. Propose table de rétention ou retour, règles des données tardives et calculs. Évite de comparer une cohorte récente incomplète à une cohorte ancienne. Explique limites et dénominateurs.",
    "## Cohortes fictives d’inscription\nDépart : mois de première inscription confirmée.\nRetour : nouvelle participation dans les mois suivants, selon définition validée.\nLa cohorte d’octobre ne peut pas encore fournir un retour à trois mois en octobre.\nTable : cohortes en lignes, âge depuis inscription en colonnes ; cellules immatures marquées non disponibles. Ne pas confondre volume initial et fidélité.",
    "Comparez des cohortes au même âge.",
    "Remplir les périodes non encore observées avec zéro."
  ],
  [
    "segmentation-clients-comportements",
    "Segmenter des clients par comportement",
    "Segmentation",
    "Former des groupes utiles et non sensibles à partir de données pertinentes.",
    "DONNEES AUTORISEES|OBJECTIF|VARIABLES|CONTRAINTES",
    "Choisis critères métier ou méthode adaptée, vérifie échelle et données manquantes. Décris chaque segment par comportements observables, taille et incertitude. Évite attributs sensibles et étiquettes dévalorisantes. Propose validation de stabilité et action proportionnée avec revue humaine.",
    "## Segments illustratifs\nGroupes possibles : demandes nouvelles, projets en attente d’information et clients ayant demandé un suivi.\nIls décrivent des états de processus, pas la valeur d’une personne.\nAvant une segmentation statistique, vérifier qualité, périmètre autorisé et stabilité des variables.\nUne action commerciale dépend du consentement et du contexte, pas d’un nom de segment généré automatiquement.",
    "Choisissez une action utile avant la méthode de regroupement.",
    "Interpréter un cluster comme une personnalité réelle."
  ],
  [
    "prevision-incertitude-donnees",
    "Prévoir avec incertitude",
    "Prévision",
    "Construire une prévision conditionnelle en comparant une référence simple.",
    "SERIE|HORIZON|CHANGEMENTS|OBJECTIF",
    "Vérifie historique, fréquence, ruptures et données manquantes. Compare une baseline simple à une méthode justifiée. Définis séparation temporelle, erreur et intervalle si calculable. N’invente pas de précision ni de borne ; explique les conditions qui invalideraient la prévision.",
    "## Demandes hebdomadaires fictives\nBaseline candidate : moyenne récente ou valeur de la même période si saisonnalité documentée.\nValidation : entraîner sur le passé puis comparer à des semaines non utilisées.\nUne campagne exceptionnelle doit être annotée, pas effacée pour améliorer l’erreur.\nSans série accessible, produire seulement un protocole. La prévision ne garantit ni demande ni capacité disponible.",
    "Utilisez une séparation temporelle réaliste.",
    "Mélanger données futures et passées lors de la validation."
  ],
  [
    "test-hypothese-statistique",
    "Préparer un test d’hypothèse",
    "Statistiques",
    "Choisir un test selon la question et le plan de collecte.",
    "QUESTION|VARIABLES|ECHANTILLON|PLAN COLLECTE",
    "Formule hypothèses, unité d’analyse, assumptions et effet d’intérêt. Vérifie indépendance et distribution selon la méthode. Prévois alternative si les conditions ne tiennent pas et interprétation avec taille d’effet. Aucun calcul ou conclusion significative sans données et méthode exécutée.",
    "## Question fictive\nComparer les délais de traitement de deux processus.\nAvant le test : vérifier si les observations sont appariées, les unités et la présence de valeurs extrêmes.\nRésultat à rapporter : estimation de différence, incertitude et limites, pas seulement une p-value.\nAucun test n’est calculé dans cet exemple ; une différence descriptive ne suffit pas à conclure à un effet du processus.",
    "Définissez l’effet utile en plus de l’hypothèse nulle.",
    "Choisir le test qui donne le résultat souhaité."
  ],
  [
    "detection-anomalies-metier",
    "Détecter des anomalies métier",
    "Anomalies",
    "Signaler des observations inhabituelles sans les traiter automatiquement comme erreurs.",
    "SERIE OU TABLE|REGLES|CONTEXTE|CRITICITE",
    "Distingue règle métier, changement de niveau et valeur isolée. Propose méthode simple, seuil à calibrer et revue. Conserve les données originales et les événements explicatifs. Évalue faux positifs et faux négatifs ; aucune suppression ou action conséquente automatique.",
    "## Pic fictif de demandes\nSignal : volume inhabituel par rapport à une fenêtre de référence définie.\nRevue : campagne annoncée, doublons, import ou panne de tracking ?\nAction : annoter et investiguer avant correction.\nUn pic légitime n’est pas une anomalie à supprimer. Le seuil doit être calibré sur l’historique et la tolérance métier ; il n’est pas universel.",
    "Documentez les événements expliquant les écarts.",
    "Supprimer une valeur uniquement parce qu’elle est extrême."
  ],
  [
    "cadre-kpi-metier",
    "Définir un cadre de KPI",
    "KPI",
    "Relier des indicateurs à des décisions et à des définitions stables.",
    "OBJECTIFS|PROCESSUS|SOURCES|RESPONSABLES",
    "Définis pour chaque indicateur formule, grain, période, source, limite et décision associée. Distingue résultat, activité et qualité. Ajoute garde-fous contre métriques de vanité et effets pervers. Ne propose pas de cible numérique sans référence ou décision explicite.",
    "## Inscription à un atelier\nRésultat : inscriptions confirmées selon définition métier.\nActivité : demandes reçues.\nQualité : proportion de demandes complètes, avec dénominateur explicite.\nDécision : si les dossiers incomplets augmentent, examiner le formulaire avant la publicité.\nChaque KPI a un responsable et une fréquence. Les objectifs chiffrés restent à fixer selon historique, capacité et besoin, pas à inventer.",
    "Écrivez la formule en toutes lettres.",
    "Changer la définition entre deux périodes."
  ],
  [
    "preparation-donnees-confidentialite",
    "Préparer des données en protégeant la confidentialité",
    "Données anonymisées",
    "Réduire les risques avant de partager un échantillon d’analyse.",
    "CHAMPS|USAGE|DESTINATAIRES|RISQUES REIDENTIFICATION",
    "Classe identifiants directs, quasi-identifiants et informations sensibles. Propose minimisation, agrégation ou données synthétiques selon le besoin. Vérifie que la combinaison des champs ne réidentifie pas facilement une personne. Ne qualifie pas automatiquement un jeu d’anonyme ; prévois revue et accès limités.",
    "## Échantillon CRM pour test\nRemplacer noms, emails et téléphones par valeurs fictives ; supprimer le texte libre non nécessaire.\nGarder uniquement les dates agrégées utiles au test et des catégories générales si suffisantes.\nVérifier qu’un cas rare ne devient pas identifiable par recoupement.\nLa pseudonymisation n’équivaut pas automatiquement à l’anonymat. Utiliser une revue adaptée avant tout transfert réel.",
    "Préférez un jeu synthétique quand il suffit au test.",
    "Retirer seulement le nom et considérer le reste sans risque."
  ],
  [
    "narration-insights-dashboard",
    "Rédiger des insights de dashboard",
    "Narration analytique",
    "Expliquer ce que les données permettent et ne permettent pas de décider.",
    "TABLEAU|DEFINITIONS|CONTEXTE|PUBLIC",
    "Structure résumé, observations, explications possibles et prochaines vérifications. Cite les valeurs réellement fournies avec période et unité. N’invente pas de cause, de tendance ou de précision. Signale données manquantes et comparaisons non valides ; limite les actions à ce qui est soutenu.",
    "## Rapport fictif incomplet\nObservation : les demandes sont renseignées, mais leur qualification manque.\nInterprétation prudente : le volume seul ne permet pas de juger la qualité commerciale.\nProchaine action : relier les statuts puis comparer des périodes cohérentes.\nLe texte évite « la campagne fonctionne mieux » tant que l’objectif et la mesure ne sont pas connus. Il ne remplace pas les valeurs absentes par des estimations.",
    "Séparez explicitement observation et interprétation.",
    "Transformer chaque variation en recommandation urgente."
  ],
  [
    "evaluation-modele-ml",
    "Évaluer un modèle de machine learning",
    "Évaluation ML",
    "Choisir des tests adaptés au coût des erreurs et à l’usage prévu.",
    "TACHE|DONNEES|METRIQUES|RISQUES",
    "Définis baseline, découpage sans fuite, métriques, calibration si pertinente et analyse des erreurs. Examine sous-groupes autorisés, dérive et limites de généralisation. Prévois revue humaine et conditions de non-déploiement. Aucun score n’est rapporté sans exécution réelle.",
    "## Classification de tickets fictive\nBaseline : règles simples de mots-clés, à comparer au modèle.\nDécoupage : éviter que des versions d’un même ticket soient dans entraînement et test.\nÉvaluer : erreurs de routage, demandes urgentes manquées et cas incertains.\nUn bon score global ne suffit pas si les cas de sécurité sont mal traités. Le rapport doit afficher exemples d’erreurs et conditions de revue humaine.",
    "Mesurez le coût des erreurs, pas seulement l’accuracy.",
    "Choisir une métrique qui masque les cas critiques."
  ]
]);

