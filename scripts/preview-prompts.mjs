// Local QA only: no production data or analytics requests.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.xml':'application/xml'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1'),route=decodeURIComponent(url.pathname);
  if(route==='/assets/js/tracking-config.js'){res.writeHead(200,{'Content-Type':'text/javascript'});return res.end('window.ELBOUBAKRY_TRACKING={ENABLE_GA4:false,ENABLE_META_PIXEL:false};');}
  if(route.startsWith('/api/')||route.startsWith('/crm/')){res.writeHead(404);return res.end('Private routes are not served in the prompt-library preview.');}
  let file=path.resolve(root,'.'+route);const relative=path.relative(root,file);if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);return res.end();}
  const stat=await fs.stat(file).catch(()=>null);if(stat?.isDirectory())file=path.join(file,'index.html');else if(!stat&&!path.extname(file))file+='.html';
  const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(4180,'127.0.0.1',()=>console.log('Prompt library preview: http://127.0.0.1:4180/prompts/ (analytics disabled, CRM inaccessible)'));
