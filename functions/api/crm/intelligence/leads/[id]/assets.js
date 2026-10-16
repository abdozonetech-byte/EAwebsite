import { requireCrmApi } from '../../../../../_lib/crm-api.js';
import { crmHeaders, json } from '../../../../../_lib/http.js';
import { supabaseFetch, supabaseErrorResponse } from '../../../../../_lib/supabase.js';
import { UUID } from '../../../../../_lib/lead-project.js';
import { latestLogo, publicAsset, saveAsset, readAsset, MAX_LOGO_BYTES } from '../../../../../_lib/project-assets.js';

export async function onRequest(context) {
  const guard = await requireCrmApi(context,['GET','POST']);
  if (guard) return guard;
  const id = String(context.params.id || '');
  if (!UUID.test(id)) return json({message:'Invalid lead ID.'},400);
  try {
    const leads = await supabaseFetch(context.env,'leads',{search:{select:'id',id:`eq.${id}`,limit:'1'}});
    if (!leads.length) return json({message:'Lead not found.'},404);
    if (context.request.method === 'POST') {
      if (context.request.headers.get('Content-Type') !== 'image/png') return json({message:'Upload a PNG logo.'},400);
      if (Number(context.request.headers.get('Content-Length')) > MAX_LOGO_BYTES) return json({message:'Logo must be at most 2 MB.'},413);
      const reader = context.request.body?.getReader();
      if (!reader) return json({message:'Choose a logo.'},400);
      const parts=[];let total=0;
      while (true) {
        const {done,value}=await reader.read();if(done) break;
        total+=value.length;if(total>MAX_LOGO_BYTES){await reader.cancel();return json({message:'Logo must be at most 2 MB.'},413);}parts.push(value);
      }
      const bytes=new Uint8Array(total);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
      const row=await saveAsset(context.env,id,'logo',bytes);
      return json({ok:true,logo:publicAsset(row)},201);
    }
    const url=new URL(context.request.url),assetId=url.searchParams.get('asset');
    if (!assetId) return json({ok:true,logo:publicAsset(await latestLogo(context.env,id))});
    if (!UUID.test(assetId)) return json({message:'Invalid asset ID.'},400);
    const rows=await supabaseFetch(context.env,'lead_project_assets',{search:{select:'*',id:`eq.${assetId}`,lead_id:`eq.${id}`,limit:'1'}});
    if(!rows.length) return json({message:'Asset not found for this lead.'},404);
    const bytes=await readAsset(context.env,rows[0]);
    const headers=crmHeaders({'Content-Type':'image/png','Content-Length':String(bytes.length),'Content-Disposition':`${url.searchParams.get('download')==='1'?'attachment':'inline'}; filename="${rows[0].purpose}-${assetId}.png"`});
    return new Response(bytes,{headers});
  } catch(error) {
    if(error.status) return supabaseErrorResponse(error);
    return json({message:error.message||'Project asset unavailable.'},400);
  }
}
