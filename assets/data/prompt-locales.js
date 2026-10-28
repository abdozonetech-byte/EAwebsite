import {categories,models,levels} from './prompt-registry.js';
const labels=['Design','Vibe Coding','Video Generation','Business Planning','Image Generation','Marketing','Web Development','Automations','Learning & Skills','Data Science','Education','Everyday Productivity','Career & Job Search','Research & Critical Thinking'];
export function registryFor(language='en'){
 return language==='fr'?{categories,models,levels}:{categories:categories.map((c,i)=>({...c,label:labels[i]})),models:{...models,general:'General-purpose AI',creative:'Creative AI tools'},levels:{beginner:'Beginner',intermediate:'Intermediate',advanced:'Advanced'}};
}
export const libraryBase=language=>language==='fr'?'/prompts/fr/':'/prompts/';
