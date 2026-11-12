import {WebWorkerMLCEngineHandler} from '@mlc-ai/web-llm';
const handler=new WebWorkerMLCEngineHandler();
// A model worker may only download artifacts, never send inference payloads.
const download=globalThis.fetch.bind(globalThis);
globalThis.fetch=(input,init)=>{
 const request=new Request(input,init),url=new URL(request.url);
 const allowed=url.origin===self.location.origin||url.hostname==='huggingface.co'||url.hostname.endsWith('.huggingface.co')||url.hostname.endsWith('.hf.co')||url.hostname==='raw.githubusercontent.com';
 if(!allowed||!['GET','HEAD'].includes(request.method))return Promise.reject(new Error('Only model artifact downloads are allowed.'));
 return download(request);
};
self.onmessage=event=>handler.onmessage(event);
