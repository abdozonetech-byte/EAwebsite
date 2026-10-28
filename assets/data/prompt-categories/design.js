import {drafts} from './shared.js';
export default drafts('design',[
  [
    "identite-marque-complete",
    "Définir une identité de marque",
    "Identité de marque",
    "Construire une direction de marque utilisable sur plusieurs supports.",
    "ACTIVITE|PUBLIC CIBLE|VALEURS|SUPPORTS",
    "Propose deux territoires créatifs distincts. Pour chacun, précise promesse, personnalité, ton, typographies par rôle, palette et direction iconographique. Compare les compromis puis recommande une piste. Ajoute les règles de déclinaison et une checklist des supports. N’invente ni logo officiel ni disponibilité juridique.",
    "## Piste : atelier de réparation\nPromesse : rendre la réparation compréhensible. Ton direct, sans jargon.\n- A : signalétique d’atelier, bleu profond et accent orange pour les devis et la vitrine.\n- B : univers éditorial, ivoire et vert sombre pour les récits de réparation.\nRecommandation illustrative : A si l’orientation en boutique prime. Déclinaisons : devis, carte, enseigne et page service. Tester la lisibilité et vérifier séparément les droits du nom.",
    "Fournissez les contraintes d’impression et les supports existants.",
    "Choisir des couleurs sans définir leurs usages."
  ],
  [
    "wireframe-landing-premium",
    "Wireframer une landing page premium",
    "Wireframe",
    "Organiser une page autour d’une décision principale et de preuves disponibles.",
    "OFFRE|AUDIENCE|ACTION|PREUVES",
    "Dessine un wireframe textuel desktop et mobile. Pour chaque bloc, indique objectif, contenu indispensable et CTA. Décris les états du formulaire et les réordonnancements mobiles. Réserve les témoignages aux preuves fournies. Donne un protocole pour vérifier compréhension de l’offre et accès à l’action principale.",
    "## Wireframe : atelier photo\n1. Hero : public, résultat pédagogique, bouton « Voir les dates ».\n2. Programme : trois compétences à pratiquer.\n3. Modalités : matériel, durée et prix à confirmer.\n4. Questions : niveau et annulation.\n5. Inscription : date et contact minimal.\nSur mobile, le programme suit le hero. Une erreur indique le champ à corriger. Test proposé : un lecteur peut-il expliquer public, durée et prochaine étape sans aide ?",
    "Définissez le CTA avant de dessiner les sections.",
    "Donner le même poids à plusieurs actions concurrentes."
  ],
  [
    "tokens-systeme-design",
    "Créer des tokens de design",
    "Design tokens",
    "Transformer les choix visuels en un système réutilisable.",
    "MARQUE|COMPOSANTS|CONTRAINTES",
    "Définis tokens primitifs, sémantiques et de composants. Fournis un extrait CSS et une table couleurs, espacements, rayons, typographie et états. Distingue propositions et décisions existantes. Couvre focus, erreur et désactivé. Donne une méthode de migration progressive sans remplacer toute la feuille de style.",
    "## Organisation proposée\nPrimitif → sémantique → composant : bleu → action → fond de bouton.\n~~~css\n:root {\n  --color-action: #0b55ff;\n  --color-ink: #10172f;\n  --space-control: .75rem;\n  --radius-control: .5rem;\n}\n~~~\nPilote : bouton et champ, puis formulaire complet. Comparer les états clavier et mesurer chaque paire de contraste avant validation. Cet extrait ne constitue pas un système déjà testé.",
    "Commencez par les états des composants les plus utilisés.",
    "Créer un token différent par valeur sans hiérarchie."
  ],
  [
    "palette-couleurs-accessible",
    "Concevoir une palette accessible",
    "Couleurs",
    "Définir des rôles de couleur et leur procédure de vérification.",
    "COULEURS EXISTANTES|USAGES|CONTRAINTES DE MARQUE",
    "Propose fond, texte, lien, action, succès et erreur. Donne les codes et une matrice des paires à tester selon la taille du texte. Calcule le contraste si un outil fiable est disponible, sinon marque-le à vérifier. Prévois un signal non coloré pour chaque statut.",
    "## Palette de travail non certifiée\n| Rôle | Proposition | Contrôle |\n| Texte | #10172f sur blanc | Contraste à calculer |\n| Action | Blanc sur #0b55ff | Mesurer aussi hover |\n| Erreur | Rouge sombre + message | Ne pas utiliser uniquement la couleur |\nUn champ invalide reçoit un texte explicite associé au contrôle. Un état actif utilise aussi une forme ou un libellé. Tester le contraste renforcé avant adoption.",
    "Mesurez les combinaisons réellement utilisées.",
    "Déclarer une palette entière accessible après un seul calcul."
  ],
  [
    "navigation-mobile-redesign",
    "Repenser une navigation mobile",
    "Navigation mobile",
    "Rendre les destinations essentielles accessibles sans surcharge.",
    "ARBORESCENCE|TACHES PRIORITAIRES|CONTRAINTES",
    "Réorganise les liens selon les tâches sans supprimer de destination nécessaire. Décris menu fermé/ouvert, focus, Escape, défilement et orientation. Compare panneau déroulant et plein écran. Fournis libellés, schéma textuel et scénarios de test au clavier et à une main.",
    "## Menu d’un organisme de formation\nLiens : formations, calendrier, ressources, contact. L’inscription reste distincte.\n- Fermé : bouton nommé et état annoncé.\n- Ouvert : liens dans un ordre logique ; Escape ferme et restitue le focus.\n- Après activation : fermer et rétablir le défilement.\nTest : atteindre le calendrier à une main puis au clavier. Vérifier à 375 px les libellés longs et l’absence de contenu masqué par le clavier virtuel.",
    "Fournissez les destinations réelles, pas une capture seule.",
    "Cacher une fonction essentielle pour alléger le menu."
  ],
  [
    "specification-dashboard-saas",
    "Spécifier un dashboard SaaS",
    "Dashboard",
    "Relier les informations affichées à des décisions métier.",
    "UTILISATEURS|DECISIONS|DONNEES DISPONIBLES",
    "Établis trois décisions prioritaires puis spécifie chaque zone : donnée, fréquence, interaction et action. Définis filtres, permissions et états vide/chargement/erreur. Écarte les métriques indisponibles et les graphiques décoratifs. Fournis composants et critères d’acceptation mobiles.",
    "## Suivi des demandes\n| Zone | Information | Action |\n| À traiter | Demandes assignées | Ouvrir le dossier |\n| Blocages | Motif et ancienneté | Réassigner si autorisé |\n| Agenda | Créneaux confirmés | Consulter |\nVide : expliquer comment créer la première demande. Erreur : ne pas afficher zéro comme si la base était vide. Les indicateurs proposés n’affirment aucun chiffre réel ; la fraîcheur des données doit être visible.",
    "Reliez chaque indicateur à une décision.",
    "Afficher des métriques flatteuses sans action associée."
  ],
  [
    "handoff-design-developpeur",
    "Préparer un handoff développeur",
    "Handoff",
    "Réduire les ambiguïtés entre maquette et réalisation.",
    "ECRANS|COMPOSANTS|STACK",
    "Rédige un dossier couvrant variantes, mesures utiles, contenu, assets autorisés et responsive. Spécifie états, ordre clavier, erreurs et dépendances. Sépare décisions validées et questions ouvertes. Termine par une checklist maquette/implémentation et un protocole pour accepter ou corriger les écarts.",
    "## Handoff d’un formulaire de devis\nComposants : champ, sélection du service, erreur et envoi.\n- Largeur fluide, sans dépassement mobile.\n- Validation client pour aider ; serveur pour faire autorité.\n- Après erreur, conserver les valeurs et identifier le champ concerné.\nQuestion ouverte : délai de réponse à confirmer, donc aucune promesse affichée.\nRecette : saisie longue, clavier, erreur serveur, succès. Documenter la raison de chaque écart visuel accepté.",
    "Précisez les états absents de la maquette.",
    "Livrer des captures sans expliquer les interactions."
  ],
  [
    "hierarchie-cta-conversion",
    "Clarifier la hiérarchie des CTA",
    "Conversion",
    "Réduire la concurrence entre les actions d’une page.",
    "PAGE|OBJECTIF|ETAPE DU PARCOURS",
    "Inventorie les actions puis classe-les en primaire, secondaire et utilitaire. Propose libellés, emplacements et fréquence. Relie chaque CTA à une intention et à une destination. Prépare une hypothèse de test et des mesures, sans annoncer de hausse de conversion non observée.",
    "## Page de diagnostic\nPrimaire : « Réserver un diagnostic » vers le calendrier.\nSecondaire : « Voir la méthode » vers l’explication.\nUtilitaire : coordonnées et confidentialité.\nLe CTA principal apparaît après la proposition puis après les modalités. Hypothèse : une destination claire réduit l’hésitation. Mesurer les clics pertinents et les réservations terminées ; un clic seul ne prouve ni compréhension ni vente.",
    "Vérifiez que la destination tient la promesse du bouton.",
    "Optimiser un libellé sans corriger sa destination."
  ],
  [
    "plan-recherche-utilisateurs",
    "Planifier une recherche utilisateurs",
    "Recherche UX",
    "Choisir une méthode capable de répondre à une question produit.",
    "QUESTION PRODUIT|PUBLIC|DELAI|RESSOURCES",
    "Formule les inconnues prioritaires et choisis une méthode proportionnée. Prépare recrutement, consentement, guide et synthèse. Évite questions orientées et données personnelles inutiles. Sépare observation, interprétation et décision. Explique les biais et les limites d’un petit échantillon.",
    "## Recherche : abandon d’inscription\nQuestion : où le participant ne comprend-il plus la prochaine étape ?\nMéthode : cinq sessions avec des volontaires pertinents, sans prétendre mesurer une fréquence représentative.\nTâche : trouver une session et commencer une inscription fictive.\nConsigne : penser à voix haute sans guidage des clics.\nSynthèse : verbatim anonymisé → friction → hypothèse → proposition. Tout enregistrement nécessite un consentement explicite.",
    "Distinguez compréhension d’un problème et mesure de sa fréquence.",
    "Utiliser « aimez-vous le design ? » comme preuve d’utilisabilité."
  ],
  [
    "onboarding-premiere-valeur",
    "Concevoir un onboarding utile",
    "Onboarding",
    "Amener un utilisateur à une première valeur sans surcharge.",
    "PRODUIT|PREMIERE VALEUR|INFORMATIONS REQUISES",
    "Cartographie le premier parcours réussi. Diffère les informations non indispensables. Décris progression, aide contextuelle, reprise et sortie. Propose une version sans tutoriel obligatoire. Définis événements minimaux et critères de réussite sans contenu personnel dans les événements.",
    "## Premier devis\nParcours : choisir un modèle → ajouter une ligne fictive → prévisualiser.\nLes coordonnées de facturation ne sont demandées qu’au moment nécessaire. Une aide courte peut être ignorée.\nReprise : ouvrir le dernier brouillon valide si le stockage a été autorisé.\nMesure proposée : passage à la prévisualisation, sans texte du devis. Tester aussi le refus du tutoriel et la reprise après interruption.",
    "Définissez une première valeur observable.",
    "Confondre configuration et bénéfice utilisateur."
  ],
  [
    "page-produit-ecommerce-design",
    "Designer une page produit e-commerce",
    "E-commerce",
    "Aider à évaluer un produit et choisir sa variante.",
    "PRODUIT|VARIANTES|CONTRAINTES ACHAT",
    "Spécifie galerie, informations de décision, variantes, prix, disponibilité et achat. Prévois indisponibilité, erreur panier et frais encore inconnus. Décris mobile et alternatives textuelles. Ne crée ni avis ni rareté ni prix barré sans preuve. Donne des scénarios de recette.",
    "## Lampe artisanale\nDécision : dimensions, matière, finition et alimentation.\nVariantes : boutons nommés avec état sélectionné ; indisponibilité explicite.\nLivraison : « Calculée selon la destination » si le tarif est inconnu.\nGalerie : vue générale, détail et mise à l’échelle.\nRecette : la disponibilité suit la variante ; une erreur panier ne détruit pas la sélection. Aucun faux stock limité n’est affiché.",
    "Listez les questions qui empêchent l’achat.",
    "Révéler les conditions essentielles après paiement."
  ],
  [
    "critique-hierarchie-visuelle",
    "Critiquer la hiérarchie visuelle",
    "Hiérarchie visuelle",
    "Faciliter le parcours de lecture sans tout redessiner.",
    "DESCRIPTION OU CAPTURE|LECTEUR|MESSAGE PRINCIPAL",
    "Analyse ordre de lecture, densité, alignements et regroupements à partir du matériel accessible. Si tu n’as qu’une description, signale tes hypothèses. Propose trois corrections, leur raison et un test. Préserve les contenus utiles et les contraintes de marque.",
    "## Page de service décrite\nObservation fournie : quatre titres de même taille et six boutons identiques.\n1. Isoler la proposition principale pour créer une entrée claire.\n2. Rapprocher chaque preuve de l’affirmation soutenue.\n3. Réserver le style primaire au rendez-vous.\nTest : demander une reformulation de l’offre après lecture. Taille exacte, contraste et ordre réel doivent être contrôlés sur la page, pas déduits de la description.",
    "Demandez des corrections localisées avant une refonte.",
    "Confondre goût personnel et friction observée."
  ],
  [
    "specification-micro-interactions",
    "Spécifier des micro-interactions",
    "Motion design",
    "Utiliser le mouvement pour expliquer un changement d’état.",
    "COMPOSANTS|ETATS|CONTRAINTES ACCESSIBILITE",
    "Précise déclencheur, état initial/final, durée proposée, interruption et erreur. Préfère les transitions peu coûteuses. Prévois reduced-motion, annonces et fonctionnement sans animation. Ne simule pas un pourcentage de progression sans mesure réelle. Donne les contrôles de performance et de compréhension.",
    "## Interaction de copie\nActivation → tentative de copie → confirmation seulement si elle réussit.\nSuccès : état visuel bref et annonce « Copié ».\nErreur : sélection manuelle, sans faux succès.\nMouvement : transition d’opacité légère, supprimée avec reduced-motion.\nUne opération serveur de durée inconnue reste indéterminée : elle ne monte pas artificiellement à 100 %. La fonction doit rester compréhensible sans transition.",
    "Spécifiez l’erreur aussi précisément que le succès.",
    "Faire dépendre une information uniquement du mouvement."
  ],
  [
    "revue-accessibilite-design",
    "Revoir l’accessibilité d’un design",
    "Accessibilité WCAG",
    "Préparer une revue AA sans confondre intention et certification.",
    "ECRANS|PARCOURS|TECHNOLOGIES ASSISTIVES",
    "Crée une matrice critère, élément, vérification, défaut éventuel et remédiation. Couvre contrastes, cibles, focus, noms accessibles, erreurs et redistribution du contenu. Distingue examen de maquette et tests nécessitant navigateur ou lecteur d’écran. N’annonce pas de conformité globale après une revue partielle.",
    "## Revue préparatoire\n| Élément | Vérification | Limite |\n| Bouton menu | Nom et état | Implémentation nécessaire |\n| Liens | Focus et ordre | Test clavier |\n| Texte sur bleu | Contraste | Calcul nécessaire |\n| Mobile | Absence de perte | Test navigateur |\nConclusion : aucun niveau certifié. Résoudre d’abord les obstacles d’accès aux destinations, puis consigner chaque preuve et chaque contrôle restant.",
    "Conservez une preuve datée pour les tests exécutés.",
    "Déclarer AA parce qu’un outil automatique ne signale rien."
  ]
]);

