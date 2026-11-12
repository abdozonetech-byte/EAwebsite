import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const report=[];
for(const [name,command]of Object.entries(pkg.scripts).filter(([name])=>name.startsWith('test:'))){
 const run=spawnSync(command,{shell:true,encoding:'utf8'});
 const exitCode=run.error?1:run.status;
 const output=[run.stdout,run.stderr,run.error?.message].filter(Boolean).join('\n').trim();
 report.push({name,exitCode,output});
 console.log(`${exitCode===0?'PASS':'FAIL'} ${name}`);if(exitCode!==0)console.error(output);
}
fs.mkdirSync('docs/upgrade',{recursive:true});fs.writeFileSync('docs/upgrade/test-results.json',JSON.stringify(report,null,2)+'\n');
if(report.some(x=>x.exitCode!==0))process.exit(1);
