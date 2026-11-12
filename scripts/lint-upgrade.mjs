import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const files=['content/professional.mjs','assets/js/elboubakry-insights-hub.js',...fs.readdirSync('scripts').filter(x=>/^(build-(professional|knowledge|local-ai)|package-public|run-tests|serve-preview|lint-upgrade|audit-insights)\.mjs$/.test(x)).map(x=>'scripts/'+x)];
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(file+'\n'+result.stderr);}
const css=fs.readFileSync('assets/css/professional.css','utf8');if((css.match(/{/g)||[]).length!==(css.match(/}/g)||[]).length)throw Error('Unbalanced CSS');
console.log(`Syntax lint passed for ${files.length} authored JavaScript modules and additive CSS. TypeScript is checked separately.`);
