import {drafts} from './shared.js';
export default drafts('productivity',[
  [
    "notes-reunion-actions",
    "Transformer une réunion en actions",
    "Réunions",
    "Extraire décisions et tâches sans inventer d’engagement.",
    "NOTES|PARTICIPANTS AUTORISES|OBJECTIF",
    "Sépare décisions, actions, questions et informations. Pour chaque tâche, indique responsable et échéance uniquement s’ils sont fournis, sinon à confirmer. Relie chaque élément au passage source. Prépare une version courte à relire avant partage, sans contenu sensible inutile.",
    "## Notes fictives\nDécision : tester le nouveau formulaire sur une copie locale.\nAction : préparer les cas de test ; responsable à confirmer ; date non fixée.\nQuestion : qui valide les textes d’erreur ?\nInformation : la mise en production n’a pas été autorisée.\nLe résumé ne transforme pas « on pourrait » en engagement. Les noms et délais manquants restent explicitement à confirmer.",
    "Relisez les décisions avant diffusion.",
    "Attribuer une tâche à quelqu’un qui ne l’a pas acceptée."
  ],
  [
    "reecriture-email-professionnel",
    "Réécrire un email professionnel",
    "Email",
    "Clarifier un message en conservant le sens et les engagements réels.",
    "BROUILLON|DESTINATAIRE|OBJECTIF|TON",
    "Propose objet, version concise et version plus chaleureuse. Conserve les faits et signale toute ambiguïté. N’ajoute ni promesse, délai, accord ni pièce jointe inexistante. Explique les changements importants et prépare le texte pour revue, sans envoi.",
    "## Brouillon fictif de suivi\nObjet : « Précision sur le programme demandé ».\nMessage : « Bonjour, merci pour votre intérêt. Pour vous orienter vers la bonne session, pourriez-vous préciser votre niveau actuel ? Je pourrai ensuite vous transmettre les modalités correspondantes. »\nAucun délai de réponse ni disponibilité n’est promis. Si le programme est joint, vérifier qu’il existe réellement avant de l’annoncer.",
    "Définissez la réponse attendue en une phrase.",
    "Rendre le message plus commercial en inventant une offre."
  ],
  [
    "plan-execution-projet",
    "Planifier l’exécution d’un projet",
    "Plan projet",
    "Transformer un objectif en étapes avec dépendances et responsables.",
    "OBJECTIF|LIVRABLES|RESSOURCES|ECHEANCE",
    "Décompose les lots, repère chemin critique, validations et risques. Estime les durées comme hypothèses si elles ne sont pas fournies. Prévois marge, suivi et critères de fin. Signale l’incompatibilité éventuelle entre périmètre, ressources et date au lieu de produire un calendrier irréaliste.",
    "## Projet fictif : atelier public\nLots : programme validé → lieu confirmé → inscription → communication → organisation.\nLa communication dépend des modalités ; ne pas annoncer une date encore incertaine.\nSuivi : tableau lot, responsable, entrée nécessaire et preuve de fin.\nMarge : réserver du temps pour validation et imprévus. Les durées doivent être estimées avec les personnes concernées ; le planning ne crée pas une capacité supplémentaire.",
    "Validez les dépendances avant les dates.",
    "Répartir toutes les tâches uniformément sans considérer les blocages."
  ],
  [
    "matrice-decision-criteres",
    "Créer une matrice de décision",
    "Décision",
    "Comparer des options avec des critères et incertitudes explicites.",
    "OPTIONS|OBJECTIF|CRITERES|CONTRAINTES",
    "Distingue critères éliminatoires et préférences. Propose pondérations à valider, données disponibles et inconnues. Montre une analyse de sensibilité plutôt qu’un classement faussement précis. La matrice aide la décision ; elle ne remplace pas le jugement sur les risques.",
    "## Choix d’un outil fictif\nÉliminatoire : accès conforme aux rôles et export des données.\nPréférences : simplicité, coût total et maintenance.\nSi le coût d’une option est inconnu, ne pas lui attribuer arbitrairement la moyenne.\nComparer ensuite deux jeux de poids pour voir si le classement change. Une recommandation fragile doit être présentée comme conditionnelle, pas comme un gagnant absolu.",
    "Définissez les critères avant de noter les options.",
    "Ajuster les poids pour faire gagner l’option préférée."
  ],
  [
    "procedure-operationnelle-sop",
    "Rédiger une procédure opérationnelle",
    "SOP",
    "Documenter une tâche répétable avec exceptions et points de contrôle.",
    "PROCESSUS|UTILISATEURS|OUTILS|RISQUES",
    "Définis objectif, déclencheur, prérequis, étapes, résultat et responsable. Ajoute erreurs, escalade, preuves minimales et date de révision. N’invente pas d’accès ou d’autorisation. Prévois un test par une personne découvrant la procédure.",
    "## SOP : vérifier une demande\nDéclencheur : nouvelle demande dans la file autorisée.\n1. Vérifier complétude et doublon.\n2. Confirmer le service demandé.\n3. Assigner au responsable selon la règle validée.\nException : information ambiguë → revue, pas suppression.\nFin : statut et prochaine action documentés.\nLe test consiste à suivre la procédure sur un dossier fictif et relever toute étape nécessitant une explication orale.",
    "Faites tester la procédure par un nouveau lecteur.",
    "Décrire une intention sans étapes vérifiables."
  ],
  [
    "resume-document-long",
    "Résumer un document long",
    "Synthèse",
    "Conserver les idées importantes, réserves et références d’un document.",
    "DOCUMENT|PUBLIC|OBJECTIF|LONGUEUR",
    "Fais un plan, un résumé exécutif et une liste décisions/questions. Associe les éléments sensibles aux sections sources quand elles sont accessibles. Signale parties manquantes et ambiguïtés. Ne fais pas passer une interprétation pour une citation ni un document partiel pour complet.",
    "## Synthèse d’un document fictif\nObjet : organisation d’un atelier.\nDécisions décrites : programme à valider et inscription manuelle.\nRéserve : lieu et date non confirmés.\nQuestion : qui prend en charge les annulations ?\nLa synthèse doit conserver cette incertitude au lieu d’annoncer un événement prêt. Les références de section ne sont ajoutées que si le document accessible les fournit réellement.",
    "Précisez l’usage du résumé avant sa longueur.",
    "Supprimer les réserves pour rendre le texte plus fluide."
  ],
  [
    "organiser-base-connaissances",
    "Organiser une base de connaissances personnelle",
    "Notes",
    "Créer une structure retrouvable sans surclasser chaque information.",
    "NOTES|USAGES|OUTIL|CONTRAINTES",
    "Propose catégories limitées, conventions de titre, liens et revue. Distingue référence, projet actif et archive. Prévois recherche, traitement des doublons et protection des informations privées. Ne déplace ni ne supprime de fichier sans autorisation ; fournis d’abord un plan.",
    "## Structure proposée\nProjets actifs : décisions et prochaines actions.\nRéférences : procédures stables et sources.\nArchives : projets clos, conservés selon besoin.\nTitre : sujet + date utile ; liens entre note de décision et preuve.\nPilote : classer dix notes puis tester trois recherches réelles. Ne pas créer une arborescence profonde avant de savoir ce que l’on doit retrouver.",
    "Testez la récupération d’une information.",
    "Passer plus de temps à classer qu’à utiliser les notes."
  ],
  [
    "itineraire-voyage-verifiable",
    "Préparer un itinéraire à vérifier",
    "Voyage",
    "Organiser un déplacement selon contraintes sans inventer horaires ou prix.",
    "DESTINATION|DATES|BUDGET|PREFERENCES",
    "Propose un rythme réaliste, zones, temps tampons et alternatives. Les horaires, tarifs, accès et formalités doivent être vérifiés via sources actuelles si la recherche est disponible, sinon marqués à confirmer. N’effectue aucune réservation et ne demande pas de documents sensibles.",
    "## Journée illustrative à Casablanca\nMatin : une activité dans une zone choisie, puis pause.\nAprès-midi : deuxième activité proche pour limiter les trajets.\nPrévoir marge de transport et alternative intérieure selon météo.\nHoraires, disponibilité, prix et conditions d’accès restent à vérifier aux dates réelles. Le plan n’affirme aucune réservation ni ouverture actuelle et ne remplace pas une vérification des formalités applicables.",
    "Regroupez les activités par zone.",
    "Remplir chaque heure sans prévoir trajets et imprévus."
  ],
  [
    "organisation-budget-personnel",
    "Organiser un budget personnel",
    "Budget",
    "Classer recettes et dépenses sans demander d’informations bancaires identifiantes.",
    "REVENUS AGREGES|DEPENSES|PERIODE|OBJECTIF",
    "Propose catégories, calendrier de suivi et écarts à examiner. Distingue dépenses fixes, variables et ponctuelles. Utilise les montants fournis uniquement ; ne recommande pas de produit financier. Signale les postes manquants et prépare des scénarios ajustables, sans jugement sur la personne.",
    "## Budget fictif mensuel\nRevenu : 8 000 unités ; dépenses connues : 6 500 ; reste apparent : 1 500.\nAvant conclusion : vérifier dépenses annuelles, dettes éventuelles et variations de revenu.\nSuivi : montant prévu, réel et raison d’écart.\nCe tableau organise des informations ; il n’est pas un conseil d’investissement et ne justifie pas une dépense sur le seul reste apparent. Aucune donnée bancaire réelle n’est nécessaire.",
    "Ajoutez les dépenses irrégulières.",
    "Considérer un mois comme représentatif de toute l’année."
  ],
  [
    "plan-delegation-taches",
    "Préparer une délégation claire",
    "Délégation",
    "Transmettre une tâche avec autonomie, limites et critères de fin.",
    "TACHES|ROLES|CAPACITES|CONTRAINTES",
    "Pour chaque tâche, précise résultat, contexte, ressources, autorité, échéance à confirmer et contrôle. Distingue délégation et transfert d’accès. Prévois questions, escalade et feedback. Ne crée pas d’engagement ni d’accès sensible sans validation.",
    "## Tâche fictive : préparer une FAQ\nRésultat : brouillon de dix réponses fondées sur le programme validé.\nAutonomie : proposer formulations ; ne pas publier ni promettre une modalité nouvelle.\nRessource : document de référence autorisé.\nContrôle : chaque réponse correspond à une information vérifiée ; les inconnues sont listées.\nDate et responsable sont à convenir. Une délégation ne constitue pas une autorisation de compte administrateur.",
    "Précisez ce qui peut être décidé sans vous.",
    "Déléguer un résultat sans fournir les ressources nécessaires."
  ],
  [
    "revue-productivite-hebdomadaire",
    "Faire une revue de productivité",
    "Revue hebdomadaire",
    "Ajuster les priorités à partir du travail réellement accompli.",
    "OBJECTIFS|TACHES TERMINEES|BLOCAGES|CAPACITE",
    "Compare prévu et réalisé sans confondre activité et impact. Identifie report, interruption et estimation erronée. Propose trois décisions maximum pour la semaine suivante. Préserve une marge et signale les engagements incompatibles ; ne transforme pas la revue en notation personnelle.",
    "## Revue fictive\nAccompli : formulaire corrigé et programme relu.\nReporté : refonte non urgente, car validation client en retard.\nDécisions : clarifier le délai de validation, réduire le nombre de tâches ouvertes et réserver une marge.\nLe bilan décrit des contraintes ; il ne conclut pas que la personne manque de motivation. La capacité suivante doit être confirmée avant de reprendre tout le retard.",
    "Évaluez les décisions, pas le nombre de cases cochées.",
    "Reporter toutes les tâches sans revoir le périmètre."
  ],
  [
    "formule-tableur-plan",
    "Planifier une formule de tableur",
    "Tableur",
    "Définir une formule adaptée aux colonnes, à la locale et aux erreurs.",
    "SCHEMA TABLEAU|RESULTAT|OUTIL|LOCALE",
    "Demande types, en-têtes et exemples fictifs. Propose formule ou pseudocode, explique plages et cas limites. Vérifie noms de fonctions et séparateurs selon l’outil. Prévois cellules vides, dates et division par zéro. Ne prétends pas avoir recalculé un classeur absent.",
    "## Besoin : taux de dossiers complets\nNumérateur : dossiers marqués complets ; dénominateur : dossiers éligibles.\nPseudocode : SI total_eligible = 0, afficher non disponible ; sinon complets / total_eligible.\nCas de test : 3 sur 4 → 75 % ; 0 sur 0 → non disponible.\nLa formule exacte dépend des colonnes et de la locale. Un champ vide ne doit pas être automatiquement traité comme « incomplet » sans règle métier.",
    "Fournissez un exemple de résultat attendu.",
    "Copier une formule sans vérifier plages et séparateurs."
  ],
  [
    "notes-vers-taches-structurees",
    "Transformer des notes en tâches",
    "Gestion de tâches",
    "Distinguer idées, décisions et actions exécutables.",
    "NOTES|PROJET|REGLES PRIORITE",
    "Extrais tâches avec verbe d’action, résultat et dépendance. Ne transforme pas une idée en engagement ni un nom cité en responsable. Marque échéances et propriétaires manquants. Propose une liste courte de clarifications puis un tableau prêt à revoir.",
    "## Notes fictives\n« Peut-être refaire le formulaire ; demander à l’équipe ; lancement pas validé. »\nTâches proposées : recueillir les difficultés du formulaire ; définir le périmètre de correction.\nÀ confirmer : responsable et date.\nPas une tâche autorisée : lancer en production.\nLe tableau conserve le statut « idée » pour la refonte tant que la décision n’est pas prise. Aucun outil de gestion n’est modifié automatiquement.",
    "Gardez la différence entre intention et décision.",
    "Créer des échéances pour rendre la liste plus complète."
  ],
  [
    "comparer-propositions-services",
    "Comparer des propositions de service",
    "Comparaison d’offres",
    "Rendre les périmètres et coûts comparables avant une décision.",
    "PROPOSITIONS|OBJECTIF|CONTRAINTES|CRITERES",
    "Compare livrables, exclusions, responsabilités, dépendances, coût total et conditions. Signale les informations non comparables et prépare des questions aux prestataires. Évite de classer uniquement sur le prix affiché. Aucun accord ni achat n’est conclu.",
    "## Deux devis fictifs\nA inclut cadrage et prototype ; B inclut seulement réalisation selon un brief déjà validé.\nLe prix seul ne permet donc pas une comparaison.\nQuestions : qui rédige les contenus ? Quelles reprises ? Quel support ? Quels coûts récurrents ?\nRecommandation conditionnelle : clarifier d’abord le périmètre manquant. Une offre moins chère peut correspondre à moins de travail, sans être meilleure ou moins bonne en soi.",
    "Normalisez le périmètre avant les montants.",
    "Comparer des prix qui couvrent des responsabilités différentes."
  ]
]);

