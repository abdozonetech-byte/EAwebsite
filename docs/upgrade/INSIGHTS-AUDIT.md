# Audit des 30 guides et plan éditorial

Audit initial du 11 novembre 2026 ; revue de livraison le 12 novembre 2026. Source : dépôt EAwebsite, commit `e64a68d4313604fae0eff9bb8b38a9eba7bb2016`. Les 30 entrées viennent de la bibliothèque existante ; le guide dédié `consultant-ia-business-maroc` est conservé en plus, sans être ajouté artificiellement au décompte des 30.

## Méthode et limites

Extraction du corps `.ea-article-content`, des titres, liens, signatures et dates, puis comparaison des intentions. Le fichier [de preuves](insights-audit-baseline.json) conserve les mesures et empreintes du contenu **avant modification**. Les comptes de mots sont indicatifs, sans seuil de classement. Le script accepte un checkout de référence explicite et ne doit pas être exécuté contre le site modifié pour recréer la référence.

Il n’y a pas eu d’accès à Search Console, aux requêtes, positions, conversions ou backlinks. Les chevauchements ci-dessous constituent des **risques de cannibalisation**, pas une démonstration de perte de trafic. Aucune URL n’a été supprimée ou redirigée pour les résoudre.

## Constats et changements réalisés

- 30 guides inspectés, de 394 à 1 430 mots ; quatre traitements courts : stratégie générale, comparaison publicitaire, analytics et automatisation.
- Aucun des 30 corps ne comporte de lien externe vers une source primaire. Cela indique un besoin de justification, pas que toutes les affirmations sont fausses.
- 20 guides sans signature visible dédiée ; toutes les pages de guide ont maintenant une signature reliée au profil complet et une proposition de prochaine étape vers une formation ou un service.
- 22 guides ont moins de deux liens contextuels vers d’autres guides dans le corps. Les blocs de formation ajoutés améliorent les prochaines étapes ; les recommandations de liens éditoriaux du tableau restent à intégrer avec les révisions.
- 26 guides affichent déjà une date de mise à jour. Les dates en texte simple ne sont pas une preuve d’obsolescence. Elles ont été conservées : aucun rafraîchissement artificiel de date.
- La collection rend désormais les 30 cartes dans le HTML. Le filtrage est une amélioration JavaScript et ne conditionne plus la découverte des liens.
- Six points d’entrée thématiques ont été ajoutés à `/insights/`. L’absence actuelle de tutoriels complets IA/code/CRM est signalée par une orientation vers les programmes, sans faire passer un guide de conseil pour un cours technique.

## Chevauchements à traiter avant de créer de nouvelles URLs

| Groupe | Rôles proposés |
|---|---|
| Stratégie générale / stratégie PME / visibilité-croissance | Pilier de méthode / plan sous contraintes / mesure de la valeur |
| SEO-content / SEO visibilité / SEO-contenu | Architecture éditoriale et GEO / diagnostic technique / atelier de rédaction |
| Leads qualifiés / leads PME | Qualification approfondie / déploiement d’un pilote simple |
| Landing page leads / landing page conversion | Construction complète / checklist d’audit d’une page |
| Analytics / tracking-KPI / bons-KPI | Instrumentation / interprétation du parcours / choix des indicateurs |
| Consultant Maroc / Casablanca / services | Choix d’accompagnement / contexte local documenté / offre et prise de contact |

La proximité de titres seule ne justifie pas une fusion. Avant tout changement de canonical ou redirection : examiner les requêtes partagées, les backlinks, les conversions et l’utilité distincte ; préparer une table de redirections seulement si une fusion est validée.

## Informations évolutives à revoir

Aucune erreur technique datée précise n’est confirmée par cet audit de structure. Les parties à revalider avant publication d’une révision sont les réglages Meta/Google/TikTok, la terminologie et les événements GA4, les mécanismes WhatsApp, les fonctionnalités de recherche IA, les outils de coding et les étapes Cloudflare. Les recommandations stratégiques générales ne doivent pas être présentées comme des règles de plateforme. Le guide coût Meta Ads ne contient pas de tarif vérifié à transformer en prix commercial.

Le coût attend une aide à l’estimation ; les guides « apprendre » attendent exercices et résultat ; le contenu de conseil commercial ne suffit pas à ces intentions. Les brouillons proposés traitent ces écarts, avec scénarios explicitement pédagogiques.

## Revue page par page

Clusters : A marketing digital ; B SEO/GEO ; C développement IA ; D agents et automatisation ; E web/CRM ; F formation. P1 = révision prioritaire, P2 = différenciation ou enrichissement. Toutes les URLs sont conservées.

| Guide existant | Mots | Cluster / priorité | Intention et action éditoriale |
|---|---:|---|---|
| [strategie-marketing-digital-maroc](https://elboubakry.com/insights/strategie-marketing-digital-maroc) | 447 | A · P1 | **Stratégie globale.** Développer un brief rempli et un arbitrage de canaux ; distinguer le guide PME et la mesure de croissance. |
| [publicite-digitale-maroc-meta-google-tiktok](https://elboubakry.com/insights/publicite-digitale-maroc-meta-google-tiktok) | 489 | A · P1 | **Comparer les canaux.** Ajouter une matrice intention / création / mesure et des références officielles ; éviter une recommandation de plateforme universelle. |
| [generation-leads-qualifies-maroc](https://elboubakry.com/insights/generation-leads-qualifies-maroc) | 1373 | A / E · P1 | **Qualifier les demandes.** Garder la grille et le scénario existants ; réunir les deux définitions de lead qualifié, distinguer le pilote PME. |
| [landing-page-generation-leads-maroc](https://elboubakry.com/insights/landing-page-generation-leads-maroc) | 1208 | E · P2 | **Construire le parcours de conversion.** Conserver comme guide complet ; ajouter un schéma de formulaire et un lien vers un audit visuel distinct. |
| [seo-content-strategy-maroc](https://elboubakry.com/insights/seo-content-strategy-maroc) | 1238 | B · P1 | **Architecture éditoriale SEO.** Intégrer le brouillon SEO/GEO dans cette URL ; conserver intentions, maillage et mesure. |
| [consultant-marketing-digital-maroc](https://elboubakry.com/insights/consultant-marketing-digital-maroc) | 1067 | A · P2 | **Choisir et cadrer une prestation.** Garder le guide de décision ; distinguer clairement les services, la formation et le contexte Casablanca. |
| [analytics-tracking-marketing-maroc](https://elboubakry.com/insights/analytics-tracking-marketing-maroc) | 394 | A · P1 | **Mettre en place la mesure.** Ajouter un petit plan d’événements et une vérification GA4 ; réserver les décisions KPI au guide tracking-kpi-marketing. |
| [automatisation-marketing-maroc](https://elboubakry.com/insights/automatisation-marketing-maroc) | 407 | D · P1 | **Automatiser le suivi.** Intégrer le brouillon Meta Ads → landing page → CRM ; détailler dédoublonnage, échec et reprise. |
| [consultant-marketing-digital-casablanca](https://elboubakry.com/insights/consultant-marketing-digital-casablanca) | 1430 | A · P2 | **Accompagnement local.** Conserver les besoins locaux et livrables ; retirer à terme les répétitions avec le guide national après analyse des requêtes. |
| [bons-kpi-performance](https://elboubakry.com/insights/bons-kpi-performance) | 641 | A · P2 | **Choisir les indicateurs.** Créer un arbre de décision et un exemple chiffré explicitement fictif ; renvoyer au guide tracking pour l’instrumentation. |
| [tracking-kpi-marketing](https://elboubakry.com/insights/tracking-kpi-marketing) | 1162 | A · P2 | **Relier mesure et décisions.** Conserver comme guide de diagnostic ; distinguer instrumentation et KPI, sourcer les termes GA4. |
| [ia-business-petite-entreprise](https://elboubakry.com/insights/ia-business-petite-entreprise) | 562 | D · P1 | **Prioriser un usage métier.** Ajouter une matrice impact / données / contrôle et un contre-exemple ; relier AI for Business, sans prétendre enseigner le code. |
| [confiance-levier-marketing](https://elboubakry.com/insights/confiance-levier-marketing) | 643 | A · P2 | **Évaluer la preuve.** La catégorie IA & Productivité est peu adaptée : proposition de reclassement Méthode & Confiance ; expliciter preuve et limites. |
| [ia-strategie-marketing](https://elboubakry.com/insights/ia-strategie-marketing) | 697 | D · P2 | **Organiser le travail marketing avec IA.** Ajouter une entrée, une sortie et une grille de revue ; distinguer automatisation contrôlée et simple génération de texte. |
| [landing-page-conversion-maroc](https://elboubakry.com/insights/landing-page-conversion-maroc) | 652 | E · P1 | **Diagnostiquer une page.** Différencier en checklist d’audit avec exemple annoté ; le guide landing-page-generation-leads porte déjà la construction. |
| [parcours-client-avant-pub](https://elboubakry.com/insights/parcours-client-avant-pub) | 652 | A · P2 | **Cartographier les décisions client.** Ajouter un parcours rempli avec points de friction ; renvoyer au brief offre et au guide acquisition. |
| [presence-digitale-credible](https://elboubakry.com/insights/presence-digitale-credible) | 660 | A · P2 | **Évaluer une présence professionnelle.** Donner une grille concrète site / profils / preuves ; éviter de répéter le guide confiance. |
| [clarifier-offre-message-tunnel](https://elboubakry.com/insights/clarifier-offre-message-tunnel) | 646 | A · P2 | **Préparer une campagne.** Fournir un brief rempli offre / objection / preuve / CTA ; conserver comme prérequis du guide Meta Ads. |
| [generation-leads-pme-maroc](https://elboubakry.com/insights/generation-leads-pme-maroc) | 709 | A / E · P1 | **Démarrer un système pour PME.** Différencier par un pilote à faible complexité ; forte proximité thématique avec generation-leads-qualifies-maroc. |
| [erreurs-budget-meta-ads](https://elboubakry.com/insights/erreurs-budget-meta-ads) | 659 | A · P2 | **Diagnostiquer une perte de budget.** Organiser par symptômes, hypothèses, contrôles ; vérifier toute affirmation liée aux réglages actuels de Meta. |
| [combien-coute-campagne-meta-ads-maroc](https://elboubakry.com/insights/combien-coute-campagne-meta-ads-maroc) | 679 | A · P1 | **Estimer le coût.** Le titre attend une estimation : proposer un calculateur pédagogique à variables, sans inventer de tarifs ou benchmarks locaux. |
| [meta-ads-leads-qualifies-maroc](https://elboubakry.com/insights/meta-ads-leads-qualifies-maroc) | 1194 | A · P2 | **Améliorer la qualité des leads Meta.** Garder la boucle CRM existante ; sources officielles et exemple de critères de qualification ; ne pas dupliquer le nouveau workflow. |
| [whatsapp-leads-qualifies](https://elboubakry.com/insights/whatsapp-leads-qualifies) | 658 | A / E · P1 | **Qualifier par conversation.** Ajouter une grille courte et la sortie du suivi ; sourcer les contraintes applicables avant de détailler API ou messages automatiques. |
| [seo-maroc-visibilite-entreprise](https://elboubakry.com/insights/seo-maroc-visibilite-entreprise) | 1041 | B · P1 | **Prioriser un audit SEO.** Le différencier comme diagnostic technique et plan priorisé ; le pilier SEO-content porte l’architecture éditoriale. |
| [seo-contenu-maroc](https://elboubakry.com/insights/seo-contenu-maroc) | 701 | B · P1 | **Rédiger une page utile.** Le différencier comme atelier de brief et révision d’une seule page ; chevauchement avec le pilier SEO. |
| [seo-local-maroc](https://elboubakry.com/insights/seo-local-maroc) | 664 | B · P2 | **Améliorer une présence locale.** Conserver l’intention locale ; vérifier les recommandations de profils et citer les consignes officielles concernées. |
| [growth-strategy-visibilite-croissance](https://elboubakry.com/insights/growth-strategy-visibilite-croissance) | 680 | A · P2 | **Relier visibilité et valeur.** Concentrer sur une chaîne de mesure et ses limites d’attribution ; ne pas réécrire la stratégie générale. |
| [strategie-digitale-pme-maroc](https://elboubakry.com/insights/strategie-digitale-pme-maroc) | 695 | A · P1 | **Prioriser avec peu de ressources.** Fournir un plan de priorités de PME et critères de renoncement ; garder distinct du guide stratégie générale. |
| [calendrier-contenu-vente](https://elboubakry.com/insights/calendrier-contenu-vente) | 658 | A · P2 | **Construire un calendrier.** Ajouter une semaine de calendrier fictif reliant objection, preuve, format et action ; ne pas promettre de ventes. |
| [video-courte-message](https://elboubakry.com/insights/video-courte-message) | 643 | A · P2 | **Écrire une vidéo courte.** Ajouter un storyboard pédagogique et une grille de lecture ; garder les durées comme exemples, pas règles algorithmiques. |

## Six livrables éditoriaux, sans publication automatique

| Brouillon | Décision d’architecture | Ce qui reste à valider |
|---|---|---|
| [01 — Formation marketing](../../content/drafts/01-formation-marketing-digital-maroc.md) | Nouvel article dans `/insights/`, intention pédagogique distincte du conseil | Revue de l’auteur, correspondance exacte avec les programmes |
| [02 — Premier agent IA](../../content/drafts/02-apprendre-developpement-ia-agent.md) | Nouveau tutoriel ; le guide consulting IA existant reste commercial | Reproduire l’exercice dans un environnement documenté |
| [03 — SEO vs GEO](../../content/drafts/03-seo-vs-geo.md) | Enrichir `/insights/seo-content-strategy-maroc`, conserver ses sections utiles | Intégrer l’apport sans remplacer le pilier par une simple comparaison |
| [04 — CRM avec IA](../../content/drafts/04-crm-avec-ia.md) | Nouveau guide technique ; complément du portfolio démonstratif | Reproduire schéma et tests de droits sur données fictives |
| [05 — Automatisation des leads](../../content/drafts/05-automatiser-generation-leads.md) | Enrichir `/insights/automatisation-marketing-maroc` | Valider le workflow, les reprises et les droits des intégrations |
| [06 — Codex et Cloudflare](../../content/drafts/06-site-codex-cloudflare.md) | Nouveau tutoriel sous `/insights/` | Reproduire le parcours et vérifier la configuration de déploiement |

Ordre conseillé : révisions 03 et 05, puis 01, puis tutoriels 02 / 04 / 06 après reproduction. Aucun calendrier public ou cadence de publication n’est promis. Tous les fichiers portent `status: editorial_draft` et `publish: false` ; aucun n’entre dans le sitemap, le paquet public ou l’index IA.

## Validation d’un article

L’auteur vérifie le texte, les références primaires, les limites et les exemples. Un tutoriel est reproduit. Ajouter uniquement les captures et résultats réellement obtenus, avec environnement et date ; distinguer démonstration et résultat client. Conserver l’URL d’une révision, les sections toujours utiles et la date initiale ; n’ajouter une date de mise à jour qu’après revue substantielle. Après approbation, intégrer le contenu à la page canonique, mettre à jour le catalogue, inscrire la page dans `content/approved-pages.json`, puis reconstruire et contrôler les liens, métadonnées, schema et index IA.

Les fondamentaux SEO restent applicables aux fonctionnalités IA de Google ; aucune promesse de citation ou de classement n’est faite. Références : [Google Search — fonctionnalités IA](https://developers.google.com/search/docs/appearance/ai-features), [Schema.org Course](https://schema.org/Course), [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
