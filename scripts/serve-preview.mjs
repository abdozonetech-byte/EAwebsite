// Local static preview with Cloudflare-style clean URLs and response policies.
// Contact form submissions and protected Pages Functions are deliberately not executed here.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),headersText=fs.readFileSync(path.join(root,'_headers'),'utf8');
const csp=headersText.match(/Content-Security-Policy: ([^\n]+)/)[1];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.avif':'image/avif','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 if(/^\/(crm|api|mcp|oauth|\.well-known)(\/|$)/.test(pathname)){res.writeHead(403);res.end('Protected functionality requires the existing Pages Functions runtime.');return;}
 const clean=path.resolve(root,'.'+pathname);if(!clean.startsWith(root+path.sep)&&clean!==root){res.writeHead(403);res.end();return;}
 const file=[clean,clean+'.html',path.join(clean,'index.html')].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile());
 if(!file){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Security-Policy':csp.replace('; upgrade-insecure-requests',''),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173 — static preview, no production changes'));
