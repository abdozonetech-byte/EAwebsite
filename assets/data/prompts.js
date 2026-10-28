// Authoring entry point. The browser uses the generated compact index instead.
import {legacyPrompts} from './prompt-categories/legacy.js';
import {categories,models,levels} from './prompt-registry.js';
import c0 from './prompt-categories/design.js';
import c1 from './prompt-categories/vibe-coding.js';
import c2 from './prompt-categories/video.js';
import c3 from './prompt-categories/business.js';
import c4 from './prompt-categories/image.js';
import c5 from './prompt-categories/marketing.js';
import c6 from './prompt-categories/web.js';
import c7 from './prompt-categories/automation.js';
import c8 from './prompt-categories/learning.js';
import c9 from './prompt-categories/data.js';
import c10 from './prompt-categories/education.js';
import c11 from './prompt-categories/productivity.js';
import c12 from './prompt-categories/career.js';
import c13 from './prompt-categories/research.js';
export {categories,models,levels};
const labels=['Audit UX','Développement par critères','Storyboard vertical','Validation business','Photo produit','Calendrier éditorial','Frontend accessible','Collecte de leads','Parcours de formation','Qualité des données','Plan de leçon','Planification des priorités','Réponses STAR','Matrice de preuves','SEO local','CI et non-régression'];
const mistakes=['Confondre description et observation de l’interface.','Coder avant de vérifier les contrats existants.','Supposer que tous les outils vidéo produisent les mêmes fonctions.','Prendre une intention déclarée pour une vente validée.','Inventer le logo ou les caractéristiques d’un produit.','Promettre des résultats sans preuves.','Confondre un extrait HTML et une fonction serveur opérationnelle.','Activer des communications sans consentement ni revue.','Annoncer une expertise après quelques exercices.','Remplacer toutes les valeurs manquantes par zéro.','Préparer une activité sans critère d’apprentissage.','Planifier plus de travail que la capacité disponible.','Inventer un chiffre pour rendre une expérience plus convaincante.','Inventer des références ou confondre opinion et preuve.','Créer de faux volumes ou classements de recherche.','Déclarer un test réussi sans l’avoir exécuté.'];
const preserved=legacyPrompts.map((p,i)=>({...p,originalPrompt:p.prompt,subcategory:labels[i],accomplishes:p.description,howToUse:['Complétez les variables avec des informations précises et non sensibles.','Copiez le prompt dans un outil adapté, puis fournissez seulement les ressources autorisées.','Vérifiez chaque fait, test ou hypothèse avant d’utiliser le résultat.'],proTips:[...p.tips],commonMistakes:[mistakes[i],'Prendre l’exemple illustratif pour un résultat testé.'],sourceType:'revised',provenance:{origin:'Existing repository starter collection, 4e4bc2c',revisionScope:'Educational metadata added; original prompt body preserved',modelTested:false},relatedPromptIds:[]}));
export const prompts=[...preserved,...c0,...c1,...c2,...c3,...c4,...c5,...c6,...c7,...c8,...c9,...c10,...c11,...c12,...c13];
for(const p of prompts){
 const ranked=prompts.filter(q=>q.id!==p.id).map(q=>({q,score:(q.category===p.category?10:0)+q.tags.filter(t=>p.tags.includes(t)).length})).sort((a,b)=>b.score-a.score);
 p.relatedPromptIds=ranked.slice(0,3).map(item=>item.q.id);
}
