// Approved identity: existing profile at e64a68d + owner's 2026-11-11 brief.
// Edit facts here. HTML, Person markup and AI knowledge are derived at build time.
export const profile = {
 name: 'Elboubakry Abdessamad',
 email: 'abdozonetech@gmail.com', whatsapp: '212687321925',
 linkedin: 'https://www.linkedin.com/in/elboubakry-abdessamad-a77360192/',
 portrait: '/assets/images/elboubakry-growth-portrait.webp',
 languages: ['ar','fr','en'],
 fr: {
  role: 'Consultant, Formateur & Développeur IA',
  headline: 'Consultant, Formateur & Développeur IA au Maroc',
  intro: 'J’accompagne les entreprises dans leur croissance digitale et je forme les professionnels aux technologies de l’IA, au marketing digital et à l’automatisation.',
  teaching: 'Formateur informatique et développement web de 2018 à 2021 : création de supports pédagogiques, exercices et accompagnement de projets.',
  skills: ['Stratégie marketing digital','Meta Ads et Google Ads','SEO et GEO','Développement IA et coding assisté par IA','Fondamentaux Python, JavaScript, HTML et CSS','Sites web et landing pages','Développement CRM et génération de leads','Agents IA, LLM et intégrations API','Automatisation des processus','GA4, Search Console et tracking des conversions','Gestion de projet','Enseignement professionnel et formation pratique'],
  footer: 'Conseil, formation et développement IA au Maroc. Marketing digital, web, CRM et automatisation.'
 },
 en: {
  role: 'Consultant, Trainer & AI Developer',
  headline: 'Consultant, Trainer & AI Developer in Morocco',
  intro: 'I help businesses grow digitally and train professionals in AI technologies, digital marketing and automation.',
  teaching: 'IT and web development trainer from 2018 to 2021: teaching materials, practical exercises and project mentoring.',
  skills: ['Digital marketing strategy','Meta Ads and Google Ads','SEO and GEO','AI development and AI-assisted coding','Python, JavaScript, HTML and CSS foundations','Websites and landing pages','CRM development and lead generation','AI agents, LLMs and API integrations','Process automation','GA4, Search Console and conversion tracking','Project management','Professional teaching and practical training'],
  footer: 'Consulting, training and AI development in Morocco. Digital marketing, web, CRM and automation.'
 }
};

// Each module: [title, concepts, exercise]. No unverified commercial terms.
export const courses = [
 {id:'marketing-digital-acquisition',status:'approved',cluster:'digital-marketing',
  fr:{title:'Marketing Digital & Acquisition',eyebrow:'De la stratégie à la demande qualifiée',
   overview:'Construisez un parcours d’acquisition cohérent : une offre claire, les bons canaux, une landing page et un suivi des prospects. Chaque module transforme une décision marketing en livrable vérifiable.',
   audience:'Entrepreneurs, responsables marketing, indépendants et professionnels souhaitant structurer leur acquisition.',level:'Débutant à intermédiaire',
   prerequisites:'Savoir utiliser un navigateur et un tableur. Venir avec une activité ou choisir un cas pédagogique ; aucun budget publicitaire n’est requis pour les exercices.',
   objectives:['Relier offre, audience et objectifs à un plan marketing','Préparer des campagnes Meta Ads et Google Ads avec des hypothèses explicites','Évaluer une page avec le SEO, le GEO et la conversion','Définir des événements, KPI et étapes CRM utiles'],
   modules:[
    ['Fondamentaux & stratégie','Positionnement, audience, parcours client et stratégie social media.','Écrire un brief d’une page et un calendrier de contenu lié à trois objections clients.'],
    ['Meta Ads & Google Ads','Objectif, intention, structure de campagne, message, création et mesure.','Concevoir deux plans de campagne et une grille de test, sans les publier ni engager de budget.'],
    ['SEO & GEO','Intention de recherche, architecture, réponses utiles, sources et limites de la visibilité générative.','Auditer une page et proposer des titres, liens internes et réponses vérifiables.'],
    ['Landing pages & conversion','Hiérarchie, preuve, formulaire, accessibilité et parcours mobile.','Prototyper une landing page et vérifier son parcours sur mobile.'],
    ['Analytics & KPI','Google Analytics, Search Console, événements, UTM et qualité des données.','Définir un plan de mesure distinguant clic, demande, lead qualifié et client.'],
    ['CRM & gestion des leads','Qualification, statuts, responsable, prochaine action et suivi.','Organiser un pipeline de test et traiter un doublon ou une demande incomplète.']
   ],outcome:'Un dossier d’acquisition : brief, plans de campagne, landing page, plan de mesure et pipeline CRM de démonstration.',
   guides:['strategie-marketing-digital-maroc','meta-ads-leads-qualifies-maroc','analytics-tracking-marketing-maroc']},
  en:{title:'Digital Marketing & Acquisition',eyebrow:'From strategy to qualified enquiries',
   overview:'Build a coherent acquisition journey: a clear offer, suitable channels, a landing page and lead follow-up. Each module turns a marketing decision into a reviewable deliverable.',
   audience:'Entrepreneurs, marketing managers, freelancers and professionals who want to structure acquisition.',level:'Beginner to intermediate',
   prerequisites:'Basic browser and spreadsheet skills. Bring a business or choose a teaching scenario; exercises do not require advertising spend.',
   objectives:['Connect the offer, audience and objectives to a marketing plan','Prepare Meta Ads and Google Ads campaigns with explicit hypotheses','Review a page for SEO, GEO and conversion','Define useful events, KPIs and CRM stages'],
   modules:[
    ['Foundations & strategy','Positioning, audience, customer journey and social media strategy.','Write a one-page brief and a content calendar addressing three customer objections.'],
    ['Meta Ads & Google Ads','Objectives, intent, campaign structure, message, creative and measurement.','Design two campaign plans and a test matrix without publishing or spending.'],
    ['SEO & GEO','Search intent, architecture, useful answers, sources and limits of generative visibility.','Audit a page and propose titles, internal links and verifiable answers.'],
    ['Landing pages & conversion','Hierarchy, evidence, forms, accessibility and mobile journeys.','Prototype a landing page and check its mobile journey.'],
    ['Analytics & KPIs','Google Analytics, Search Console, events, UTMs and data quality.','Define a measurement plan distinguishing clicks, enquiries, qualified leads and customers.'],
    ['CRM & lead management','Qualification, stages, ownership, next actions and follow-up.','Organise a test pipeline and handle a duplicate or incomplete enquiry.']
   ],outcome:'An acquisition portfolio: brief, campaign plans, landing page, measurement plan and demonstration CRM pipeline.',
   guides:['digital-marketing-consultant-morocco','marketing-automation-morocco']}
 },
 {id:'developpement-ia-automatisation',status:'approved',cluster:'ai-development',
  fr:{title:'AI Development & Automation',eyebrow:'Comprendre, construire, tester',
   overview:'Passez d’un besoin à une application web assistée par IA. Apprenez les bases du code, la recherche dans des connaissances locales et les workflows contrôlables, puis testez le résultat avant tout déploiement.',
   audience:'Professionnels techniques débutants, développeurs web et profils marketing souhaitant construire des outils IA.',level:'Fondations puis mise en pratique progressive',
   prerequisites:'Être à l’aise avec les fichiers et le navigateur. Un ordinateur permettant d’installer les outils de développement ; les bases Python et JavaScript sont introduites dans le parcours.',
   objectives:['Lire et modifier du Python et du JavaScript simples','Utiliser Codex ou un outil similaire avec des critères d’acceptation','Distinguer LLM, recherche documentaire, agent et workflow','Connecter une API en protégeant les données et les secrets','Tester une application et préparer un déploiement Cloudflare'],
   modules:[
    ['Fondamentaux du développement IA','LLM, contexte, limites, prompt engineering et évaluation.','Comparer des réponses à une grille de faits attendus et identifier une réponse non étayée.'],
    ['Python & JavaScript','Variables, fonctions, objets, JSON, erreurs et appels asynchrones.','Transformer des demandes fictives en objets validés et écrire un test de cas invalide.'],
    ['Développement assisté par IA','Codex et outils similaires : brief, contexte du dépôt, changements limités et revue.','Faire produire un formulaire, examiner le diff et corriger une erreur avec un test.'],
    ['Agents, recherche & workflows','Sources locales, recherche de passages, mémoire de session, outils et validation humaine.','Créer un assistant qui cite ses sources et reconnaît une information absente.'],
    ['API & applications web IA','HTTP, intégrations, validation des entrées, permissions et états de l’interface.','Connecter une API de démonstration et simuler une erreur réseau sans perdre la saisie.'],
    ['Tests, sécurité & Cloudflare','Contrôles d’accès, secrets côté serveur, tests, build, prévisualisation et retour arrière.','Préparer une version de test, une checklist de déploiement Cloudflare et un plan de rollback.']
   ],outcome:'Un prototype d’assistant ou d’application web IA, accompagné de tests, sources, limites documentées et instructions de déploiement.',
   guides:['consultant-ia-business-maroc','automatisation-marketing-maroc']},
  en:{title:'AI Development & Automation',eyebrow:'Understand, build, test',
   overview:'Turn a need into an AI-assisted web application. Learn coding foundations, retrieval from local knowledge and controlled workflows, then test the result before deployment.',
   audience:'Technical beginners, web developers and marketing professionals who want to build AI tools.',level:'Foundations followed by progressive practice',
   prerequisites:'Comfort with files and a browser. A computer that can install development tools; Python and JavaScript foundations are introduced in the programme.',
   objectives:['Read and modify simple Python and JavaScript','Use Codex or a similar tool with acceptance criteria','Distinguish LLMs, retrieval, agents and workflows','Connect an API while protecting data and secrets','Test an application and prepare Cloudflare deployment'],
   modules:[
    ['AI development foundations','LLMs, context, limitations, prompt engineering and evaluation.','Compare answers with an expected-facts checklist and identify an unsupported answer.'],
    ['Python & JavaScript','Variables, functions, objects, JSON, errors and asynchronous calls.','Transform fictional enquiries into validated objects and test invalid input.'],
    ['AI-assisted development','Codex and similar tools: briefs, repository context, bounded changes and review.','Generate a form, inspect the diff and fix an error with a test.'],
    ['Agents, retrieval & workflows','Local sources, passage retrieval, session memory, tools and human approval.','Build an assistant that cites sources and recognises missing information.'],
    ['APIs & AI web applications','HTTP, integrations, input validation, permissions and interface states.','Connect a demonstration API and simulate network failure without losing user input.'],
    ['Testing, security & Cloudflare','Access control, server-side secrets, tests, builds, previews and rollback.','Prepare a test version, Cloudflare deployment checklist and rollback plan.']
   ],outcome:'An AI assistant or web application prototype with tests, sources, documented limits and deployment instructions.',
   guides:['ai-business-consultant-morocco','marketing-automation-morocco']}
 },
 {id:'ia-pour-entreprise',status:'approved',cluster:'ai-business',
  fr:{title:'AI for Business',eyebrow:'Des usages utiles, dans votre activité',
   overview:'Choisissez un problème opérationnel et construisez une solution proportionnée. Utilisez l’IA pour préparer, organiser et vérifier le travail, avec une personne responsable des décisions.',
   audience:'Entrepreneurs, dirigeants de PME, équipes commerciales et responsables opérationnels.',level:'Débutant, sans programmation préalable',
   prerequisites:'Savoir utiliser les outils numériques courants. Apporter un processus à améliorer et des données fictives ou autorisées.',
   objectives:['Prioriser un usage IA avec des critères concrets','Préparer des workflows de productivité et marketing','Concevoir un site ou un CRM adapté à un besoin','Organiser la validation humaine et la protection des données','Présenter un projet métier testable'],
   modules:[
    ['IA pour entrepreneurs','Capacités, limites, coût complet et choix d’un cas d’usage.','Comparer trois tâches et choisir un pilote avec un résultat observable.'],
    ['Productivité & prompts','Contexte, consignes, exemples, vérification et travail documentaire.','Créer un workflow de synthèse avec sources et liste des informations manquantes.'],
    ['Créer un site avec des outils IA','Offre, contenu, pages, mobile, formulaires et revue du code généré.','Préparer un prototype de site et tester la clarté de son appel à l’action.'],
    ['CRM & automatisations métier','Pipeline, données autorisées, déclencheurs, statuts et exceptions.','Dessiner un processus demande → qualification → prochaine action avec reprise manuelle.'],
    ['Marketing assisté par IA','Recherche, briefs, variantes de messages, calendrier et reporting.','Construire un brief et relier chaque contenu à une question client vérifiable.'],
    ['IA responsable & projet pratique','Confidentialité, biais, erreurs, validation, documentation et mesure.','Présenter un pilote, ses tests, les situations où l’arrêter et les décisions réservées à une personne.']
   ],outcome:'Un pilote métier documenté : processus, prototype, critères d’évaluation, responsabilités et plan d’amélioration.',
   guides:['ia-business-petite-entreprise','ia-strategie-marketing','automatisation-marketing-maroc']},
  en:{title:'AI for Business',eyebrow:'Useful applications for your work',
   overview:'Choose an operational problem and build a proportionate solution. Use AI to prepare, organise and check work while keeping a person responsible for decisions.',
   audience:'Entrepreneurs, SME leaders, sales teams and operations managers.',level:'Beginner; no prior programming required',
   prerequisites:'Everyday digital skills. Bring a process to improve and fictional or authorised data.',
   objectives:['Prioritise an AI use case with concrete criteria','Prepare productivity and marketing workflows','Design a website or CRM around a real need','Organise human review and data protection','Present a testable business project'],
   modules:[
    ['AI for entrepreneurs','Capabilities, limits, total cost and use-case selection.','Compare three tasks and choose a pilot with an observable outcome.'],
    ['Productivity & prompts','Context, instructions, examples, verification and document work.','Create a summary workflow with sources and a list of missing information.'],
    ['Build a website with AI tools','Offer, content, pages, mobile, forms and generated-code review.','Prepare a website prototype and test the clarity of its call to action.'],
    ['CRM & business automation','Pipeline, authorised data, triggers, stages and exceptions.','Map enquiry → qualification → next action with a manual recovery path.'],
    ['AI-assisted marketing','Research, briefs, message variants, calendars and reporting.','Build a brief and connect each content item to a verifiable customer question.'],
    ['Responsible AI & practical project','Privacy, bias, errors, review, documentation and measurement.','Present a pilot, its tests, when to stop it and decisions reserved for a person.']
   ],outcome:'A documented business pilot: process, prototype, evaluation criteria, responsibilities and improvement plan.',
   guides:['ai-business-consultant-morocco','marketing-automation-morocco']}
 }
];

export const clusters = [
 {id:'digital-marketing',fr:'Marketing digital',en:'Digital marketing',slugs:['strategie-marketing-digital-maroc','meta-ads-leads-qualifies-maroc','publicite-digitale-maroc-meta-google-tiktok']},
 {id:'seo-geo',fr:'SEO & GEO',en:'SEO & GEO',slugs:['seo-content-strategy-maroc','seo-local-maroc','seo-maroc-visibilite-entreprise']},
 {id:'ai-development',fr:'Développement IA',en:'AI development',slugs:['consultant-ia-business-maroc'],course:'developpement-ia-automatisation'},
 {id:'agents-automation',fr:'Agents IA & automatisation',en:'AI agents & automation',slugs:['automatisation-marketing-maroc','ia-business-petite-entreprise','ia-strategie-marketing']},
 {id:'web-crm',fr:'Développement web & CRM',en:'Web development & CRM',slugs:['landing-page-generation-leads-maroc','generation-leads-qualifies-maroc','whatsapp-leads-qualifies']},
 {id:'training',fr:'Formation professionnelle',en:'Professional training',slugs:[],course:'marketing-digital-acquisition'}
];
