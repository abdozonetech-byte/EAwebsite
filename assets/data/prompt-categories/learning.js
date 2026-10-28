import {drafts} from './shared.js';
export default drafts('learning',[
  [
    "expliquer-concept-simple",
    "Expliquer un concept difficile simplement",
    "Explication",
    "Comprendre une notion sans supprimer ses limites importantes.",
    "CONCEPT|NIVEAU|CONTEXTE",
    "Explique d’abord en langage simple, puis avec un exemple concret et une analogie dont tu précises la limite. Ajoute trois questions de compréhension et une reformulation plus technique. Évite jargon inutile et simplification fausse ; demande le prérequis manquant si essentiel.",
    "## Comprendre une API\nUne API définit une manière de demander un service à un logiciel.\nExemple : une application demande les créneaux disponibles à un agenda.\nAnalogie : un formulaire de commande ; limite : elle ne décrit pas toute la sécurité ni le transport.\nQuestions : qui demande ? Quel format est accepté ? Que se passe-t-il si la demande échoue ? Une API n’est pas nécessairement publique ou gratuite.",
    "Demandez une reformulation avec votre propre exemple.",
    "Prendre l’analogie pour une description complète."
  ],
  [
    "flashcards-rappel-actif",
    "Créer des flashcards de rappel actif",
    "Rappel actif",
    "Transformer un contenu en questions courtes et évaluables.",
    "CONTENU|NIVEAU|NOTIONS PRIORITAIRES",
    "Crée des cartes question/réponse portant sur une seule idée, avec pièges fréquents et critère de réussite. Mélange définition, application et distinction. Reste fidèle au contenu fourni et signale les ambiguïtés. Ne transforme pas une phrase longue en carte impossible à évaluer.",
    "## Cartes SQL illustratives\nQ : WHERE ou HAVING pour filtrer les lignes avant regroupement ?\nR : WHERE ; HAVING filtre les groupes après agrégation.\nQ : Pourquoi vérifier les doublons après une jointure ?\nR : Une relation un-à-plusieurs peut multiplier les lignes.\nCritère : expliquer avec un exemple, pas seulement citer le mot. Ces cartes doivent être confrontées au cours et adaptées au niveau de l’apprenant.",
    "Préférez une seule difficulté par carte.",
    "Mémoriser des formulations sans tester leur application."
  ],
  [
    "pratique-debat-structure",
    "Pratiquer un débat structuré",
    "Argumentation",
    "Construire et examiner des arguments sans confondre persuasion et preuve.",
    "SUJET|POSITION INITIALE|NIVEAU",
    "Propose thèse, arguments, objections et conditions qui feraient changer d’avis. Organise une séance où tu poses une question à la fois. Distingue fait vérifiable, valeur et hypothèse. Ne fabrique pas de statistique pour renforcer un argument ; évalue la qualité du raisonnement.",
    "## Sujet : introduire un outil IA en équipe\nThèse possible : un pilote limité peut clarifier les usages.\nObjection : le temps de formation et les risques de données peuvent dépasser le bénéfice.\nQuestion de débat : quelle observation justifierait d’arrêter le pilote ?\nCritères : cohérence, traitement du contre-exemple et qualité des preuves. Le but est d’améliorer le raisonnement, pas de déclarer automatiquement une position gagnante.",
    "Définissez ce qui pourrait réfuter votre position.",
    "Chercher uniquement des arguments favorables."
  ],
  [
    "conversation-anglais-pratique",
    "Pratiquer l’anglais oral",
    "Anglais",
    "S’entraîner à une situation avec corrections ciblées et niveau adapté.",
    "SITUATION|NIVEAU|OBJECTIF|TEMPS",
    "Propose un jeu de rôle, une question à la fois, avec vocabulaire utile et relances. Corrige après la réponse sans interrompre chaque phrase. Distingue clarté, grammaire et prononciation ; sans audio, ne prétends pas évaluer la voix. Termine par un exercice de reprise.",
    "## Situation : présenter un atelier\nQuestion : “What will participants be able to do after the session?”\nRéponse possible : “They will practise three basic techniques and complete a small exercise.”\nRetour : formulation claire ; préciser les techniques si connues.\nExercice : refaire la réponse en 30 secondes avec un exemple. Sans enregistrement audio, le rythme et la prononciation restent non évalués.",
    "Choisissez une situation que vous rencontrez réellement.",
    "Demander une note de prononciation sur du texte seul."
  ],
  [
    "exercice-cas-pratique",
    "Créer un cas pratique d’apprentissage",
    "Cas pratique",
    "Passer d’une notion à une décision concrète avec corrigé raisonné.",
    "COMPETENCE|NIVEAU|CONTEXTE|DUREE",
    "Écris un cas fictif, les données suffisantes, les questions et un corrigé séparé. Prévois plusieurs réponses défendables lorsque pertinent. Explique critères et erreurs fréquentes, sans présenter les données fictives comme une étude réelle. Adapte la charge à la durée.",
    "## Cas : choisir un canal de contact\nUne équipe reçoit des demandes par formulaire et téléphone mais ignore les doublons.\nQuestion : que vérifier avant de comparer les volumes ?\nCorrigé proposé : définir une demande unique, période et source, puis examiner la qualité du suivi.\nUne réponse recommandant immédiatement plus de publicité manque le problème de mesure. Le cas est fictif et vise le raisonnement, non un benchmark commercial.",
    "Séparez clairement exercice et corrigé.",
    "Cacher une information indispensable puis sanctionner son absence."
  ],
  [
    "evaluation-competence-diagnostic",
    "Évaluer une compétence avec preuves",
    "Diagnostic de compétence",
    "Identifier acquis et lacunes par des tâches observables.",
    "COMPETENCE|NIVEAU VISE|TEMPS|PREUVES DISPONIBLES",
    "Prépare un diagnostic progressif avec tâches, critères et exemples de niveaux. Sépare connaissance déclarée et performance observée. N’attribue pas une certification ni un score définitif sur quelques réponses. Propose la prochaine pratique à partir des erreurs constatées.",
    "## Diagnostic SQL\nTâche 1 : filtrer une table simple.\nTâche 2 : expliquer une agrégation.\nTâche 3 : repérer une jointure qui multiplie les lignes.\nCritères : résultat, explication et vérification sur petit jeu fictif.\nUne difficulté à la tâche 3 suggère une pratique des cardinalités, pas une incapacité générale. Le diagnostic ne remplace pas une évaluation professionnelle complète.",
    "Demandez à l’apprenant d’expliquer sa vérification.",
    "Confondre vitesse de réponse et maîtrise."
  ],
  [
    "entrainement-entretien-technique",
    "S’entraîner à expliquer un raisonnement technique",
    "Entretien technique",
    "Pratiquer une résolution à voix haute sans inventer d’expérience.",
    "DOMAINE|NIVEAU|FORMAT ENTRETIEN",
    "Pose un problème adapté, laisse proposer une solution, puis introduis une contrainte. Évalue clarification, approche, compromis et tests. Donne un retour après chaque étape et une solution possible séparée. Ne prétends pas reproduire les questions exactes d’un employeur.",
    "## Problème : import de données\nQuestion : comment éviter deux créations si la requête est répétée ?\nRelance : que faire après un timeout dont le résultat est inconnu ?\nRéponse attendue : identifier l’opération, vérifier l’idempotence et ne pas relancer aveuglément.\nRetour : valoriser les questions sur les contrats et les tests, pas une liste de mots techniques. Aucun entretien réel n’est simulé à l’identique.",
    "Travaillez l’explication des compromis.",
    "Mémoriser une réponse sans comprendre la contrainte."
  ],
  [
    "challenge-apprentissage-projet",
    "Apprendre avec un mini-projet",
    "Apprentissage par projet",
    "Construire un projet limité qui démontre une compétence précise.",
    "COMPETENCE|TEMPS|OUTILS|LIVRABLE",
    "Propose un défi réalisable, jalons, contraintes et critères de fin. Prévois une version minimale et une extension facultative. Donne des indices graduels plutôt que toute la solution immédiatement. Utilise des données fictives et réserve les actions externes à une autorisation.",
    "## Défi : catalogue statique\nMinimum : cinq fiches, recherche textuelle et lien détail.\nJalon 1 : données structurées ; 2 : rendu ; 3 : filtre et état vide ; 4 : vérifications clavier.\nExtension : favoris locaux.\nCritères : aucun contenu injecté comme HTML, recherche vide cohérente et routes lisibles. L’objectif est d’apprendre un flux complet, pas de construire une plateforme en un week-end.",
    "Choisissez une compétence centrale et limitez les extensions.",
    "Ajouter des fonctions jusqu’à ne jamais terminer."
  ],
  [
    "reflexion-apprentissage-hebdo",
    "Faire un bilan d’apprentissage",
    "Réflexion",
    "Ajuster une méthode d’étude à partir de ce qui a été réellement pratiqué.",
    "ACTIVITES|DIFFICULTES|PREUVES|PROCHAINE SEMAINE",
    "Classe acquis, erreurs récurrentes et questions ouvertes. Demande des exemples concrets de ce qui peut être fait sans aide. Propose une seule modification de méthode et une pratique de consolidation. Ne transforme pas le temps passé en mesure automatique de maîtrise.",
    "## Bilan fictif\nPratiqué : trois requêtes SQL ; difficulté : jointures.\nPreuve : les filtres simples sont expliqués sans notes, mais le nombre de lignes après jointure reste mal anticipé.\nAjustement : dessiner les relations avant de coder deux petits exemples.\nProchaine semaine : refaire un cas sans correction visible, puis comparer. Le nombre d’heures n’est pas une preuve suffisante d’apprentissage.",
    "Appuyez le bilan sur un livrable.",
    "Remplacer la pratique par une longue réflexion abstraite."
  ],
  [
    "tutorat-socratique",
    "Apprendre par questions socratiques",
    "Tutorat",
    "Faire émerger le raisonnement sans donner immédiatement la réponse.",
    "NOTION|PROBLEME|NIVEAU",
    "Pose une question à la fois, attends la réponse et ajuste la difficulté. Utilise indices graduels, contre-exemples et vérification de compréhension. Corrige les erreurs importantes sans humilier. Après l’échange, résume le raisonnement et propose un nouvel exemple de transfert.",
    "## Comprendre un doublon\nQuestion initiale : deux lignes au même nom représentent-elles forcément la même personne ?\nIndice : quelles informations permettraient de les distinguer sans collecter davantage de données sensibles ?\nContre-exemple : deux employés d’une entreprise peuvent partager un standard.\nSynthèse attendue : choisir des critères adaptés au processus et revoir les cas ambigus. Le tuteur n’impose pas une conclusion avant d’écouter le raisonnement.",
    "Laissez une vraie tentative avant de donner l’indice.",
    "Poser des questions dont la formulation contient déjà toute la réponse."
  ],
  [
    "expliquer-document-technique",
    "Comprendre un document technique",
    "Lecture technique",
    "Extraire concepts, contrats et implications d’un document accessible.",
    "DOCUMENT|NIVEAU|OBJECTIF|PASSAGES DIFFICILES",
    "Résume la structure, explique les termes indispensables et relie les sections au cas d’usage. Cite les passages fournis et sépare paraphrase, interprétation et question ouverte. Si le document est absent ou partiel, ne prétends pas le connaître. Propose un petit exercice de vérification.",
    "## Document fictif : contrat d’un webhook\nNotions à repérer : événement, signature, identifiant et réponse.\nQuestion pratique : que garantit chaque champ ?\nInterprétation à éviter : une réponse HTTP réussie ne prouve pas nécessairement la fin du traitement métier.\nExercice : suivre un événement doublonné dans le contrat fourni. Les détails exacts doivent venir du document, pas d’un fournisseur supposé.",
    "Travaillez sur un extrait court avant le document entier.",
    "Prendre une explication générale pour le contrat exact d’un service."
  ],
  [
    "identifier-erreurs-apprentissage",
    "Identifier ses erreurs fréquentes",
    "Correction ciblée",
    "Transformer des erreurs récurrentes en exercices ciblés.",
    "TRAVAUX|CORRECTIONS|COMPETENCE",
    "Classe les erreurs par concept, procédure et vérification. Donne un exemple fourni, une explication et un exercice similaire mais différent. Distingue manque de connaissance et manque de relecture. Ne déduis pas une aptitude générale de quelques erreurs.",
    "## Erreur SQL fictive\nSymptôme : total multiplié après jointure.\nCause à vérifier : relation un-à-plusieurs non prise en compte.\nExercice : compter d’abord les lignes de chaque table, puis prévoir le nombre après jointure avant d’exécuter.\nCritère : expliquer pourquoi le résultat change et comment l’éviter. La correction porte sur un mécanisme, pas sur une étiquette « mauvais en analyse ».",
    "Demandez une nouvelle application après la correction.",
    "Relire uniquement la solution sans refaire l’exercice."
  ],
  [
    "plan-repetition-espacee",
    "Planifier une répétition espacée",
    "Révisions",
    "Organiser des reprises actives selon les difficultés observées.",
    "NOTIONS|ECHEANCE|TEMPS|RESULTATS RECENTS",
    "Propose un calendrier flexible de rappel actif, mélange de notions et réévaluation. Adapte la fréquence selon réussite réelle, sans présenter un intervalle universel optimal. Prévois une stratégie en cas de retard. Le planning doit tenir dans le temps fourni.",
    "## Révisions sur deux semaines\nJour 1 : expliquer trois notions sans notes.\nJour 3 : refaire les questions difficiles avec un exemple différent.\nJour 7 : mélanger notions nouvelles et anciennes.\nJour 14 : mini-cas de transfert.\nSi une séance est manquée, réduire le lot et reprendre les éléments prioritaires. Les intervalles sont illustratifs et doivent suivre le niveau de rappel, pas une promesse scientifique universelle.",
    "Mesurez le rappel avant de consulter les notes.",
    "Répéter la lecture et appeler cela rappel actif."
  ],
  [
    "rubrique-auto-evaluation",
    "Créer une grille d’auto-évaluation",
    "Auto-évaluation",
    "Évaluer un livrable avec des critères observables et des preuves.",
    "LIVRABLE|OBJECTIF|NIVEAU|CONTRAINTES",
    "Définis quatre à six critères avec niveaux décrits par comportement. Donne exemples de preuves et actions de progrès. Évite les adjectifs vagues et les scores assimilés à une certification. Prévois une comparaison entre auto-évaluation et revue externe si disponible.",
    "## Grille d’un brief IA\nCritères : objectif, contexte, contraintes, format et vérification.\nNiveau initial : le résultat demandé reste vague.\nNiveau opérationnel : un tiers peut exécuter la tâche et vérifier les livrables.\nPreuve : faire reformuler le brief par une autre personne.\nAction de progrès : préciser le critère le moins observable. La grille sert à guider une révision, pas à attribuer un niveau officiel.",
    "Demandez une preuve pour chaque niveau choisi.",
    "S’auto-noter seulement selon la confiance ressentie."
  ]
]);

