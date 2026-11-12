import fs from 'node:fs';
import path from 'node:path';
const output='dist';fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);
const publicDirectories=['assets','insights','en','formations','ai','projets','services','prompts','crm','reserver-diagnostic','merci'];
const publicFiles=fs.readdirSync('.').filter(file=>/\.(html|png|ico|svg|webmanifest)$/.test(file)||['_headers','_redirects','_routes.json','robots.txt','sitemap.xml','humans.txt','llms.txt'].includes(file));
for(const name of [...publicDirectories,...publicFiles])fs.cpSync(name,path.join(output,name),{recursive:true});
console.log('Packaged static public files in dist/. Drafts, content source, tests, dependencies and private material excluded. Existing Pages Functions remain in functions/.');
