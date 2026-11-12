import {CreateWebWorkerMLCEngine} from '@mlc-ai/web-llm';
export async function createEngine(worker:Worker,f16:boolean,onProgress:(progress:number,text:string)=>void){
 const model=f16?'Qwen2.5-1.5B-Instruct-q4f16_1-MLC':'Qwen2.5-1.5B-Instruct-q4f32_1-MLC';
 return CreateWebWorkerMLCEngine(worker,model,{initProgressCallback:p=>onProgress(p.progress,p.text),logLevel:'ERROR'},{context_window_size:8192});
}
