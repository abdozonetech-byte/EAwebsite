---
status: editorial_draft
publish: false
language: fr
proposed_url: /insights/apprendre-developpement-ia-premier-agent
intent: apprendre à concevoir et évaluer un premier assistant puis un agent
existing_overlap: consultant-ia-business-maroc est un guide de service, pas ce tutoriel technique
review_required: exécution de l’exercice et vérification des dépendances avant publication
---
# Comment apprendre le développement IA et créer son premier agent intelligent

Commencez par un assistant qui répond à partir de quelques documents autorisés. Ajoutez ensuite une action limitée, uniquement si elle apporte une valeur identifiable. Cette progression permet d’apprendre séparément la génération de texte, la recherche d’information, l’état d’une conversation et l’exécution d’une action.

Un LLM produit du texte à partir d’un contexte. Un système de recherche sélectionne les passages utiles. Un workflow relie des étapes définies. Un agent utilise un modèle pour décider de certaines étapes ou de certains outils dans un périmètre donné. Un chatbot sans outils peut être un bon premier projet, sans être présenté comme un agent autonome.

## Projet de départ : répondre à partir de trois fiches

Préparez trois petits fichiers : un profil, un service et un programme de formation. Pour chaque fait, conservez la source et un identifiant. Retirez les données personnelles inutiles. Écrivez ensuite cinq questions dont vous connaissez la réponse, ainsi que deux questions auxquelles les documents ne permettent pas de répondre.

Avant le modèle, faites fonctionner la recherche seule. Une version simple découpe les documents en passages courts, normalise les mots et classe les passages qui correspondent à la question. Ce classement lexical est imparfait, mais il permet de comprendre pourquoi une source a été sélectionnée. Il n’exige pas de réentraîner le modèle.

## Les fondations de code à travailler

En JavaScript ou Python, entraînez-vous à lire du JSON, valider des champs, manipuler des listes et traiter une erreur. Côté navigateur, distinguez l’interface, l’état de la conversation et le moteur de génération. Pour une intégration HTTP, une réponse reçue n’est pas nécessairement un succès : vérifiez son statut et son format avant de l’utiliser. La [documentation Fetch de MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) explique ce comportement.

Le moteur peut être local ou distant selon le projet. Pour un navigateur compatible, [WebLLM](https://webllm.mlc.ai/docs/user/basic_usage.html) fournit un moteur de génération côté client. Son premier chargement nécessite des fichiers de modèle ; l’absence d’API d’inférence ne signifie pas absence de téléchargement, de consommation mémoire ou de limites matérielles.

## Construire un comportement vérifiable

Composez le contexte avec des règles courtes, les passages retrouvés et une portion bornée de l’historique. Demandez au modèle de distinguer ce qu’il sait de ce qui manque. Affichez les sources retrouvées indépendamment du texte généré : une URL inventée par le modèle ne doit pas devenir automatiquement un lien de confiance.

Votre grille d’évaluation peut contenir ces colonnes : question, intention attendue, source attendue, faits obligatoires, faits interdits, résultat observé. Testez une question de formation et une demande de prestation sur le même sujet. L’assistant doit reconnaître la différence entre « apprendre Meta Ads » et « faire gérer mes campagnes ».

## Ajouter une première action contrôlée

Une action pédagogique raisonnable consiste à préparer un brouillon de fiche projet, sans l’envoyer ni le sauvegarder automatiquement dans un système réel. Le modèle propose les champs ; votre code vérifie les types et les valeurs autorisées ; l’utilisateur relit avant toute action persistante.

Testez le champ manquant, l’échec réseau, la demande hors périmètre et une instruction malveillante contenue dans un document. Le modèle ne doit pas décider des droits d’accès. Pour avancer avec des exercices structurés, consultez [AI Development & Automation](/formations/developpement-ia-automatisation/). Pour un besoin d’entreprise à réaliser, le [consulting IA](/insights/consultant-ia-business-maroc) présente le cadrage du service.

*Auteur proposé : Elboubakry Abdessamad. Exemple pédagogique, sans résultat client revendiqué.*
