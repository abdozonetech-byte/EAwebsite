import {drafts} from './shared.js';
export default drafts('business',[
  [
    "strategie-prix-service",
    "Développer une stratégie de prix",
    "Pricing",
    "Comparer des structures de prix selon valeur, coûts et capacité.",
    "SERVICE|CLIENTS|COUTS|CAPACITE",
    "Propose forfait, abonnement et option modulaire si pertinents. Calcule les marges uniquement avec les données fournies. Établis scénarios, limites de périmètre, questions de validation et test de disposition à payer. Ne présente pas une estimation comme un prix de marché vérifié.",
    "## Service fictif de maintenance\nOptions : forfait défini, abonnement avec volume inclus, interventions hors périmètre tarifées séparément.\nCoûts supposés : 8 h de travail à 150 MAD/h, soit 1 200 MAD avant autres charges. Ce coût ne détermine pas seul le prix de vente.\nTest : présenter les options à des clients pertinents et recueillir les objections. Vérifier capacité, taxes et temps de support avant engagement.",
    "Incluez les reprises et le support dans les coûts.",
    "Fixer le prix uniquement en copiant un concurrent."
  ],
  [
    "personas-clients-recherche",
    "Construire des personas étayés",
    "Personas",
    "Décrire des besoins clients sans inventer de profils démographiques.",
    "OFFRE|ENTRETIENS OU DONNEES|SEGMENTS",
    "Regroupe les comportements et problèmes observés. Pour chaque persona, précise tâche, déclencheur, objections, décision et preuve disponible. Distingue données, hypothèses et questions à poser. Évite les attributs sensibles ou les biographies décoratives non utiles à la décision.",
    "## Segment hypothétique : responsable de petit atelier\nTâche : remplir des sessions sans gérer plusieurs listes.\nDéclencheur : erreurs répétées de confirmation.\nObjections à vérifier : temps de mise en place et dépendance à un outil.\nPreuve manquante : aucun entretien fourni. Questions : comment sont confirmées les places ? Qui tient la liste ?\nCe persona est une hypothèse de recherche, pas un portrait représentatif établi.",
    "Ancrez chaque attribut dans une observation utile.",
    "Inventer âge, revenus et loisirs pour rendre le persona crédible."
  ],
  [
    "swot-basee-preuves",
    "Faire une SWOT fondée sur des preuves",
    "SWOT",
    "Séparer les capacités internes et les facteurs externes documentés.",
    "ACTIVITE|DONNEES INTERNES|SOURCES EXTERNES",
    "Construis une matrice forces/faiblesses/opportunités/menaces. Associe chaque point à une preuve ou marque-le comme hypothèse. Priorise trois implications stratégiques et les informations à vérifier. Ne transforme pas des aspirations en forces ni des tendances non sourcées en faits.",
    "## Atelier fictif\n| Quadrant | Élément | Statut |\n| Force | Processus d’inscription documenté | À confirmer par document |\n| Faiblesse | Suivi manuel dispersé | Description fournie |\n| Opportunité | Besoin possible d’ateliers courts | Hypothèse |\n| Menace | Dépendance à un seul canal | Risque à mesurer |\nAction : vérifier la concentration des demandes avant de diversifier. Cette SWOT ne rapporte aucune étude de marché réalisée.",
    "Reliez chaque point à une décision possible.",
    "Remplir quatre cases avec des généralités interchangeables."
  ],
  [
    "analyse-concurrents-documentee",
    "Analyser des concurrents avec méthode",
    "Concurrence",
    "Comparer les offres et leurs preuves sans inventer de parts de marché.",
    "OFFRE|MARCHE|CONCURRENTS OU SOURCES",
    "Définis les critères avant de comparer. Utilise sources publiques accessibles et dates de consultation si recherche disponible. Compare cible, offre, prix affiché, parcours et preuves ; indique inconnu lorsque nécessaire. Dégage un espace de différenciation à tester sans dénigrer les concurrents.",
    "## Matrice de comparaison à remplir\n| Critère | Offre A | Offre B |\n| Programme | À vérifier sur page officielle | À vérifier |\n| Prix publié | Non fourni | Non fourni |\n| Inscription | Formulaire décrit | Inconnu |\nDifférenciation candidate : rendre les prérequis et livrables plus clairs. Aucun nom réel ni classement n’est inventé ; les liens et conditions doivent être examinés avant conclusion.",
    "Comparez des offres substituables pour le client.",
    "Déduire la qualité réelle d’un service de son seul site."
  ],
  [
    "plan-unit-economics",
    "Modéliser les unit economics",
    "Unit economics",
    "Évaluer l’équilibre d’une unité vendue avec des hypothèses explicites.",
    "UNITE VENDUE|PRIX|COUTS VARIABLES|COUTS FIXES",
    "Définis marge contributive, seuil de couverture et capacité. Fournis formules, scénario central et sensibilités. Sépare TVA, encaissement et revenu selon les informations disponibles. Signale les coûts manquants et ne traite pas un modèle simplifié comme une prévision financière validée.",
    "## Session fictive\nHypothèses : prix 300 MAD/place, coût variable 50 MAD/place, coût fixe de session 1 000 MAD.\nContribution par place : 250 MAD. Couverture simplifiée : 1 000/250 = 4 places, avant charges non incluses.\nÀ 3 places : contribution totale 750 MAD, insuffisante pour ce coût fixe.\nLimites : fiscalité, annulations et capacité à vérifier. Le calcul illustre la mécanique, pas la rentabilité réelle d’une activité.",
    "Listez les coûts exclus du calcul.",
    "Confondre marge contributive et bénéfice net."
  ],
  [
    "funnel-vente-business",
    "Définir un funnel commercial",
    "Funnel commercial",
    "Relier les étapes commerciales à une progression vérifiable.",
    "OFFRE|CANAL|CYCLE DE VENTE|EQUIPE",
    "Cartographie découverte, qualification, proposition et décision. Définis critères d’entrée/sortie, responsable, informations minimales et motifs de perte. Propose indicateurs par étape sans taux de conversion inventés. Prévois consentement, relances proportionnées et sortie simple.",
    "## Service de formation B2B\nDécouverte → demande de programme → échange de cadrage → proposition → décision.\nSortie de qualification : besoin, calendrier et interlocuteur confirmés, pas seulement une adresse email.\nMesures : dossiers à chaque étape, durée et raisons de non-poursuite.\nLa relance cesse sur refus. Aucun nombre de ventes n’est prédit ; commencer par instrumenter les étapes réellement utilisées.",
    "Définissez un critère de passage observable.",
    "Multiplier les étapes pour donner une impression de sophistication."
  ],
  [
    "plan-pitch-investisseur",
    "Structurer un pitch investisseur",
    "Pitch deck",
    "Présenter une thèse de projet avec ses preuves et ses incertitudes.",
    "PROJET|PUBLIC INVESTISSEUR|PREUVES|BESOIN FINANCEMENT",
    "Propose un fil narratif et un plan de diapositives : problème, solution, modèle, marché vérifiable, traction réelle, équipe, risques et usage des fonds. Indique données manquantes et questions probables. Ne crée ni traction, clients, qualifications ni chiffres de marché.",
    "## Plan pour un outil de réservation\n1. Problème observé et méthode de validation.\n2. Parcours proposé et démonstration.\n3. Modèle économique à tester.\n4. Marché : périmètre et sources à rechercher.\n5. Pilotes : uniquement ceux réellement documentés.\n6. Risques : adoption, intégrations et support.\n7. Fonds : lots de travail et hypothèses de coût.\nLes emplacements manquants restent explicitement « à documenter ».",
    "Distinguez preuve de demande et intérêt verbal.",
    "Présenter une estimation de marché comme une traction."
  ],
  [
    "offre-service-claire",
    "Construire une offre de service",
    "Offre commerciale",
    "Définir un service achetable avec limites et livrables clairs.",
    "COMPETENCES|CLIENT IDEAL|PROBLEME|RESSOURCES",
    "Propose une offre comprenant résultat visé, livrables, étapes, prérequis, exclusions et critères de fin. Décris responsabilités client/prestataire et modalités à valider. Sépare promesse de moyens et résultat dépendant de facteurs externes. Donne une version courte de présentation.",
    "## Offre : cadrage d’une automatisation\nLivrables : cartographie du processus, priorités, spécification d’un pilote et plan de test.\nExclusions : intégration en production et campagnes de messages.\nPrérequis : accès aux procédures anonymisées et disponibilité d’un responsable.\nFin : périmètre et critères du pilote validés.\nPrésentation : « Nous identifions une tâche répétitive et préparons un pilote testable ». Aucun gain chiffré n’est garanti.",
    "Écrivez les exclusions aussi clairement que les livrables.",
    "Vendre une liste d’outils à la place d’un service."
  ],
  [
    "strategie-prevente",
    "Tester une prévente responsable",
    "Prévente",
    "Vérifier une intention d’achat sans tromper sur la disponibilité.",
    "OFFRE A TESTER|PUBLIC|DELAI|CONTRAINTES",
    "Définis prototype de l’offre, conditions présentées, canal de recrutement et critères de décision. Distingue inscription d’intérêt, réservation et paiement. Prévois transparence sur ce qui existe, règles de remboursement à faire valider et traitement des données. Ne lance ni encaissement ni message sans autorisation.",
    "## Pilote d’atelier\nPage : programme proposé, date à confirmer, mention « session pilote ».\nÉtape 1 : recueillir un intérêt sans paiement.\nÉtape 2 : confirmer capacité et modalités.\nÉtape 3 : proposer une réservation avec conditions validées.\nCritère fixé avant test : nombre minimal d’engagements pour organiser la session, choisi selon les coûts réels. Une liste d’emails seule n’est pas une vente.",
    "Annoncez clairement le stade du produit.",
    "Faire passer une préinscription pour une commande ferme."
  ],
  [
    "guide-entretiens-clients",
    "Préparer des entretiens clients",
    "Entretiens clients",
    "Explorer comportements et problèmes sans orienter les réponses.",
    "SEGMENT|HYPOTHESE|DECISION A PRENDRE",
    "Rédige introduction, consentement, questions ouvertes, relances et grille de notes. Explore les événements passés plutôt que des intentions abstraites. Sépare entretien et vente. Décris synthèse, signaux contraires et limites de l’échantillon ; ne collecte pas de données sans utilité.",
    "## Hypothèse : inscriptions difficiles à suivre\nQuestions : « Racontez votre dernière session » ; « Comment avez-vous confirmé les places ? » ; « Que s’est-il passé lorsqu’une personne a annulé ? »\nRelance neutre : « Pouvez-vous montrer un exemple anonymisé ? »\nÉviter : « Un CRM vous ferait gagner du temps, non ? »\nSynthèse : événement, conséquence, solution actuelle et coût perçu. Conserver aussi les cas où aucun problème n’apparaît.",
    "Demandez des faits récents plutôt que des prédictions.",
    "Présenter sa solution avant de comprendre le problème."
  ],
  [
    "scenarios-revenus-incertitude",
    "Construire des scénarios de revenus",
    "Scénarios financiers",
    "Explorer les facteurs de revenu sans présenter un scénario comme une prévision certaine.",
    "MODELE ECONOMIQUE|CAPACITE|HYPOTHESES|PERIODE",
    "Construis scénarios prudent, central et haut à partir de volumes et prix explicites. Ajoute saisonnalité si documentée, délai d’encaissement et limites de capacité. Fournis les formules et sensibilités. Ne crée pas de croissance exponentielle ni d’estimation de marché sans preuve.",
    "## Scénario fictif mensuel\n| Scénario | Missions | Prix unitaire | Revenu brut |\n| Prudent | 2 | 2 000 MAD | 4 000 MAD |\n| Central | 3 | 2 000 MAD | 6 000 MAD |\n| Haut | 4 | 2 000 MAD | 8 000 MAD |\nCe ne sont pas des probabilités. Vérifier capacité, coûts, fiscalité et délais de paiement. Une mission signée n’est pas nécessairement encaissée dans le mois.",
    "Testez la sensibilité au volume et au temps de livraison.",
    "Confondre revenu, trésorerie et résultat net."
  ],
  [
    "positionnement-marche",
    "Clarifier un positionnement de marché",
    "Positionnement",
    "Choisir une place compréhensible par un segment précis.",
    "OFFRE|CLIENTS|ALTERNATIVES|PREUVES",
    "Définis catégorie de référence, problème prioritaire, différence utile et preuve. Propose trois formulations, explique leurs compromis et un test de compréhension. Évite les superlatifs invérifiables. Identifie ce que l’offre ne cherche pas à couvrir.",
    "## Service fictif pour organismes de formation\nPositionnement proposé : « Un accompagnement pour organiser les demandes d’inscription, du formulaire au suivi ».\nDifférence à démontrer : processus adapté à l’équipe, pas simple installation d’outil.\nExclusion : remplacement complet du système de gestion.\nTest : demander à des responsables de reformuler l’offre et de citer leur alternative actuelle. Le choix doit être validé auprès du segment, pas seulement préféré en interne.",
    "Rendez la différence utile au client, pas seulement originale.",
    "Se déclarer leader sans preuve."
  ],
  [
    "evaluation-partenariat",
    "Évaluer un partenariat stratégique",
    "Partenariats",
    "Comparer intérêt, dépendances et risques d’une collaboration.",
    "PARTENAIRE|OBJECTIF|CONTRIBUTIONS|CONTRAINTES",
    "Évalue complémentarité, responsabilités, accès aux données, marque, coûts et sortie. Propose un pilote limité avec critères et gouvernance. Identifie conflits d’intérêt et points contractuels à faire examiner. Ne contacte pas le partenaire et ne conclus pas d’accord.",
    "## Pilote avec un lieu de formation\nContribution A : contenu pédagogique ; contribution B : salle et organisation.\nPilote : une session, périmètre écrit, données d’inscription accessibles uniquement selon les rôles convenus.\nMesures : qualité d’organisation et satisfaction recueillie avec consentement.\nSortie : traitement des annulations, droits sur les supports et fin des accès. Les clauses nécessitent une validation appropriée avant engagement.",
    "Préparez la sortie avant de démarrer.",
    "Partager une liste client comme contrepartie implicite."
  ],
  [
    "registre-risques-business",
    "Évaluer les risques d’un projet",
    "Risques business",
    "Prioriser les risques et les actions de réduction proportionnées.",
    "PROJET|DEPENDANCES|RESSOURCES|HORIZON",
    "Crée un registre événement/cause/impact/signal/mesure/responsable. Utilise des appréciations qualitatives justifiées lorsque les probabilités ne sont pas connues. Propose prévention, contingence et seuils d’escalade. Ne transforme pas des scores arbitraires en probabilités réelles.",
    "## Risque d’un atelier\nÉvénement : annulation du lieu.\nCause possible : dépendance à une seule salle.\nSignal : confirmation non reçue à la date convenue.\nPrévention : confirmation écrite et solution alternative.\nContingence : information des inscrits et options conformes aux conditions validées.\nPriorité qualitative : élevée si l’échéance est proche. Aucune probabilité chiffrée n’est prétendue ; le responsable doit confirmer les actions.",
    "Définissez un signal d’alerte observable.",
    "Remplir une matrice sans propriétaire des actions."
  ]
]);

