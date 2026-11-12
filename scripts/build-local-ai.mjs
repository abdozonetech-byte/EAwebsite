import {build} from 'esbuild';
import fs from 'node:fs';
fs.rmSync('assets/ai/chunks',{recursive:true,force:true});
await build({entryPoints:{app:'ai-src/app.ts',worker:'ai-src/worker.ts'},outdir:'assets/ai',bundle:true,format:'esm',splitting:true,chunkNames:'chunks/[name]-[hash]',minify:true,target:'es2022',legalComments:'eof',metafile:true}).then(result=>fs.writeFileSync('docs/upgrade/ai-bundle.json',JSON.stringify({outputs:Object.fromEntries(Object.entries(result.metafile.outputs).map(([k,v])=>[k,{bytes:v.bytes,imports:v.imports}]))},null,2)+'\n'));
console.log('Built lazy, self-hosted WebLLM client and module worker. No remote inference endpoint.');
