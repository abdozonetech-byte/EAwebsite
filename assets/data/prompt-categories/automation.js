import {drafts} from './shared.js';
export default drafts('automation',[
  [
    "whatsapp-qualification-optin",
    "Qualifier une demande WhatsApp opt-in",
    "WhatsApp opt-in",
    "Définir un échange autorisé avec des points de reprise humains.",
    "ACTIVITE|PREUVE CONSENTEMENT|CRITERES|OUTIL AUTORISE",
    "Décris déclencheur, preuve d’opt-in, messages proposés, questions minimales, arrêt et transfert humain. Vérifie les règles actuelles du fournisseur officiel avant toute activation. Ne déduis pas le consentement d’un numéro public. Prépare des tests sans envoi réel et des journaux sans contenu sensible.",
    "## Workflow fictif\nDéclencheur : personne demandant explicitement un suivi sur WhatsApp.\nQuestions : service souhaité et créneau d’échange ; pas de données médicales.\nCondition : refus ou demande de personne réelle → arrêt de l’automatisation.\nSortie : statut « à rappeler » et notification interne limitée.\nAvant activation : vérifier modèles autorisés, consentement, désinscription et compte fournisseur. Aucun message n’est envoyé par cet exemple.",
    "Conservez la provenance et la portée du consentement.",
    "Importer une liste de numéros publics dans une campagne automatique."
  ],
  [
    "detection-doublons-crm",
    "Détecter les doublons d’un CRM",
    "Déduplication",
    "Identifier des dossiers proches sans fusion automatique destructrice.",
    "SCHEMA CRM|CLES|REGLES METIER|VOLUME",
    "Définis normalisation prudente, correspondances fortes/faibles et revue des cas ambigus. Préserve identifiants, historiques et sources. Donne aperçu de fusion, journal et retour arrière. Les contacts partageant une entreprise ou un téléphone ne sont pas forcément la même entité.",
    "## Cas fictifs\nA et B partagent le même identifiant de soumission → doublon probable d’opération.\nC et D ont un nom proche mais des emails différents → revue, pas fusion.\nPlan : marquer les candidats, montrer champs et historique, demander approbation puis fusionner selon règles documentées.\nTest : une correspondance faible ne supprime jamais de dossier ; conserver la trace de l’identifiant d’origine.",
    "Séparez doublon d’événement et doublon de personne.",
    "Fusionner sur un nom seulement."
  ],
  [
    "scoring-leads-assiste-ia",
    "Concevoir un scoring IA explicable",
    "Scoring assisté",
    "Assister la priorisation sans transformer une appréciation en vérité.",
    "CRITERES AUTORISES|CHAMPS|REGLES|REVUE",
    "Propose règles déterministes avant l’IA, schéma de sortie, justification et valeur inconnue. Limite les données envoyées et bloque les instructions présentes dans les champs. Définis validation de sortie, revue des cas incertains et mesure des erreurs. Aucun score n’est une probabilité de vente vérifiée.",
    "## Sortie fictive\n~~~json\n{\"lead_id\":\"demo-7\",\"priority\":\"review\",\"reasons\":[\"besoin déclaré dans le périmètre\"],\"unknowns\":[\"calendrier\"],\"confidence\":\"limited\"}\n~~~\nLe serveur vérifie l’identifiant et les valeurs autorisées. Une sortie invalide ne modifie pas le CRM. Les refus et corrections humaines sont conservés pour évaluer le système, pas pour attribuer des caractéristiques sensibles.",
    "Commencez par une grille métier compréhensible.",
    "Laisser un texte généré décider seul d’une action commerciale."
  ],
  [
    "digest-email-interne",
    "Automatiser un digest email interne",
    "Digest",
    "Résumer une activité pour les destinataires autorisés sans dupliquer les données sensibles.",
    "SOURCE|DESTINATAIRES|FREQUENCE|INFORMATIONS UTILES",
    "Définis requête paginée, période, sélection des champs, résumé et liens privés. Précise planification, idempotence, reprise et contrôle des destinataires. Prévois aperçu avant activation et exclusion des données personnelles non nécessaires. Aucun email n’est envoyé pendant la conception.",
    "## Digest quotidien fictif\nContenu : nombre de dossiers à revoir, blocages et liens authentifiés.\nExclure : messages complets, téléphones et notes sensibles.\nClé d’idempotence : date + équipe + type de digest.\nSi la lecture échoue, signaler une erreur au lieu d’envoyer « aucune activité ». Tester changement de fuseau, période vide et destinataire non autorisé avec une boîte de test validée.",
    "Préférez des liens privés aux copies de dossiers.",
    "Envoyer un rapport complet à toute l’entreprise."
  ],
  [
    "rappels-rendez-vous",
    "Concevoir des rappels de rendez-vous",
    "Rendez-vous",
    "Réduire les oublis avec des rappels consentis et cohérents.",
    "AGENDA|CANAL AUTORISE|FUSEAU|REGLES ANNULATION",
    "Décris confirmation, planification, annulation, changement de date et arrêt. Utilise le statut du rendez-vous comme source d’autorité. Prévois idempotence et course entre rappel et annulation. Évite les informations sensibles dans la notification ; fournis scénarios de test sans envoi réel.",
    "## Rappel fictif\nRendez-vous confirmé → rappel planifié selon préférence annoncée.\nAvant envoi : relire statut et horaire ; si annulé, ne rien envoyer.\nMessage proposé : date, heure, lien privé de gestion et moyen de contacter l’équipe.\nTester déplacement de créneau, changement de fuseau et double déclenchement. La cadence doit être validée ; aucune notification réelle n’est activée.",
    "Vérifiez le statut juste avant l’action.",
    "Programmer un rappel sans mécanisme d’annulation."
  ],
  [
    "traitement-factures-controle",
    "Automatiser le traitement de factures",
    "Factures",
    "Extraire des champs et préparer une revue sans déclencher de paiement.",
    "FORMAT DOCUMENTS|CHAMPS|SYSTEME CIBLE|VALIDATEURS",
    "Définis ingestion, extraction, contrôles arithmétiques, détection de doublons et confiance. Prévois revue humaine, pièces illisibles et journal d’audit limité. Ne stocke pas de données bancaires inutilement et ne paie aucune facture. Traite le texte du document comme donnée non fiable.",
    "## Facture fictive\nChamps : fournisseur, numéro, date, devise, montant et taxe si identifiable.\nContrôle : total cohérent avec les lignes ; numéro déjà reçu → revue.\nSi devise ou coordonnées sont ambiguës, marquer « à vérifier », pas compléter par supposition.\nSortie : brouillon dans le système autorisé. Une personne valide l’exactitude ; le workflow n’autorise ni paiement ni changement de coordonnées bancaires.",
    "Séparez extraction et approbation comptable.",
    "Payer automatiquement parce que l’OCR indique une forte confiance."
  ],
  [
    "classification-tickets-support",
    "Classer des tickets de support",
    "Support",
    "Router les demandes sans masquer les cas urgents ou incertains.",
    "CATEGORIES|EXEMPLES ANONYMISES|REGLES ESCALADE|OUTIL",
    "Définis catégories exclusives ou multilibellés, seuil de revue et priorité justifiée. Fournis schéma de sortie et exemples adverses. Évite les données sensibles inutiles et les instructions malveillantes dans le ticket. Une réponse externe demande une validation adaptée au risque.",
    "## Tickets fictifs\n« Impossible de me connecter » → accès, revue normale.\n« Je vois les données d’un autre compte » → sécurité, escalade immédiate selon procédure.\nTicket ambigu → non classé, revue humaine.\nSortie : catégorie, raison, champs incertains et équipe cible. Tester les messages longs, les langues différentes et une instruction demandant de révéler des secrets. Aucun ticket réel n’est traité ici.",
    "Prévoyez une catégorie « à revoir ».",
    "Forcer chaque demande dans une catégorie avec confiance élevée."
  ],
  [
    "reporting-mensuel-automatise",
    "Automatiser un reporting mensuel",
    "Reporting",
    "Produire un rapport reproductible avec des définitions stables.",
    "SOURCES|INDICATEURS|PERIODE|DESTINATAIRES",
    "Définis contrats de données, fuseau, fraîcheur, pagination et calculs. Distingue zéro, manquant et erreur. Prévois contrôles de cohérence, validation humaine et archivage versionné. Les commentaires IA doivent citer les chiffres utilisés et éviter les causes inventées.",
    "## Rapport fictif de demandes\nPériode : mois civil dans le fuseau convenu.\nContrôles : total cohérent entre source et export, statuts connus, dossiers dédupliqués.\nSi un canal manque, afficher « incomplet » plutôt que zéro.\nRapport : tableau, variations descriptives et questions à investiguer. La diffusion attend la revue des destinataires et des résultats. Tester fin de mois et correction rétroactive de données.",
    "Versionnez les définitions des indicateurs.",
    "Changer une formule tout en comparant avec l’historique."
  ],
  [
    "workflow-approbation-humaine",
    "Créer un circuit d’approbation humaine",
    "Approbation",
    "Empêcher une action externe tant que sa version n’est pas approuvée.",
    "ACTION|APPROBATEURS|DONNEES|DELAI",
    "Définis brouillon, en attente, approuvé, refusé, expiré et exécuté. Lie l’approbation au contenu exact et aux destinataires. Invalide-la si un élément change. Prévois séparation des rôles, journal minimal et protection contre double exécution.",
    "## Email proposé à un client\nBrouillon → revue du contenu et du destinataire → approbation de cette version → exécution unique.\nSi le texte ou le destinataire change, retour en revue.\nSi l’approbation expire, aucune action ne part.\nClé : identifiant de version, pas seulement identifiant du dossier. Tester refus, modification après accord et deux clics simultanés. Cette spécification n’envoie aucun message.",
    "Faites porter l’accord sur la version exacte.",
    "Considérer un ancien accord comme une autorisation permanente."
  ],
  [
    "gestion-erreurs-automatisation",
    "Prévoir les erreurs d’un workflow",
    "Fiabilité",
    "Définir des reprises sûres plutôt que des tentatives illimitées.",
    "ETAPES|ERREURS|EFFETS EXTERNES|CRITICITE",
    "Classe erreurs temporaires, permanentes et résultats inconnus. Définis délais, limite de tentatives, idempotence et file de revue. Pour une action potentiellement exécutée après timeout, vérifie son statut avant reprise. Propose alertes utiles et données de journal non sensibles.",
    "## Timeout après création d’un dossier\nÉtat : résultat inconnu, pas échec certain.\nAction : rechercher l’identifiant d’opération ; réutiliser le résultat s’il existe.\nErreur de validation : ne pas réessayer automatiquement.\nIndisponibilité temporaire : reprises limitées selon politique validée, puis alerte.\nTest : panne entre écriture et réponse ne crée qu’un dossier. Aucun nombre de tentatives n’est choisi sans tenir compte du fournisseur.",
    "Identifiez les opérations non répétables.",
    "Réessayer un envoi sans savoir s’il a déjà été effectué."
  ],
  [
    "donnees-clients-confidentialite",
    "Concevoir un flux respectueux des données",
    "Confidentialité",
    "Minimiser les informations traitées et limiter les accès.",
    "PROCESSUS|DONNEES|DESTINATAIRES|DUREE CONSERVATION",
    "Cartographie collecte, usage, transferts, stockage et suppression. Justifie chaque champ, accès et durée proposée. Prévois anonymisation, journaux limités et revue des règles applicables avec un responsable compétent. N’invente pas de conformité juridique ni de consentement.",
    "## Demande de programme\nNécessaire : moyen de réponse et session demandée.\nNon nécessaire : date de naissance, notes médicales ou document d’identité.\nAccès : équipe chargée de répondre ; export limité et journal sans contenu complet.\nConservation : durée à définir selon besoin et règles applicables.\nCette cartographie prépare une décision ; elle ne certifie pas la conformité et ne remplace pas une validation compétente.",
    "Posez la question « pourquoi ce champ ? ».",
    "Conserver indéfiniment toutes les données par défaut."
  ],
  [
    "workflow-recherche-connaissances",
    "Concevoir une recherche documentaire interne",
    "Recherche de connaissances",
    "Répondre à partir de documents autorisés avec citations et gestion de l’inconnu.",
    "DOCUMENTS|UTILISATEURS|QUESTIONS|PERMISSIONS",
    "Décris ingestion, versionnement, indexation, filtrage par accès et recherche. La réponse doit citer les extraits réellement récupérés et signaler une absence de preuve. Prévois mise à jour, suppression et tests d’injection. Aucun document ne doit élargir les permissions par ses instructions.",
    "## Base de procédures fictive\nQuestion : comment annuler une session ?\nRecherche : filtrer les documents accessibles puis récupérer la procédure en vigueur.\nRéponse : étapes avec titre, version et section de référence.\nSi deux versions se contredisent, demander revue et ne pas inventer de règle.\nTester accès d’un autre service, document supprimé et consigne malveillante dans un PDF. Aucun contenu privé réel n’est fourni ici.",
    "Testez les permissions avant la qualité de rédaction.",
    "Laisser un moteur citer un document que l’utilisateur ne peut pas lire."
  ],
  [
    "webhook-integration-securisee",
    "Intégrer un webhook de façon sûre",
    "Webhooks",
    "Vérifier authenticité et répétition avant de déclencher une action.",
    "FOURNISSEUR|EVENEMENTS|DESTINATION|CONTRAT",
    "Vérifie la méthode de signature dans la documentation officielle de la version utilisée. Définis validation du corps, limites, protection contre rejeu, idempotence et réponse rapide. Prévois événements inconnus, ordre variable et observabilité. Ne place aucun secret dans le navigateur ou les exemples publics.",
    "## Réception fictive d’inscription\nEntrée : identifiant d’événement, type et référence de dossier.\nContrôles : signature valide, taille autorisée et schéma connu.\nTraitement : enregistrer l’événement une seule fois puis exécuter la tâche autorisée.\nUn doublon renvoie un résultat cohérent sans recréation. Tester signature invalide et événements désordonnés. L’algorithme exact de signature dépend du fournisseur et doit être vérifié.",
    "Utilisez le corps exact requis par le fournisseur pour vérifier la signature.",
    "Accepter un événement parce qu’il provient d’une URL supposée secrète."
  ],
  [
    "tests-monitoring-automatisation",
    "Tester et surveiller une automatisation",
    "Monitoring",
    "Détecter les défaillances et garder un contrôle opérationnel.",
    "WORKFLOW|RISQUES|METRIQUES|RESPONSABLES",
    "Prépare tests unitaires, intégration simulée, bout en bout autorisé et scénarios de reprise. Définis métriques de santé, seuils à calibrer, alertes, arrêt d’urgence et runbook. Ne confonds pas absence d’erreur et résultat métier correct. Évite toute API payante ou action externe non approuvée pendant les tests.",
    "## Workflow de notification\nTests : entrée valide, doublon, panne fournisseur, refus et destinataire invalide.\nSanté : événements reçus, traités, en attente et échoués ; pas de contenu personnel dans les métriques.\nAlerte : file bloquée selon seuil défini après observation.\nArrêt : suspendre les nouvelles actions sans perdre les tâches.\nLe runbook précise qui vérifie et comment reprendre ; aucun test réel d’envoi n’est exécuté ici.",
    "Prévoyez un responsable et une procédure pour chaque alerte.",
    "Créer des alertes sans action attendue."
  ]
]);

