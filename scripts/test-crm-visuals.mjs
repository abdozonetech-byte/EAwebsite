import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {onRequest as project} from '../functions/api/crm/intelligence/leads/[id]/project.js';
import {onRequest as assets} from '../functions/api/crm/intelligence/leads/[id]/assets.js';
import {signSession} from '../functions/_lib/auth.js';
import {validatePng,decodeImageResult} from '../functions/_lib/project-assets.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const leadId='123e4567-e89b-42d3-a456-426614174000',otherLead='123e4567-e89b-42d3-a456-426614174001';
const env={CRM_USERNAME:'test',CRM_SESSION_SECRET:'private-test-secret',SUPABASE_URL:'https://database.test',SUPABASE_SERVICE_ROLE_KEY:'fake-key',OPENAI_API_KEY:'fake-openai'};
const cookie=`elboubakry_crm_session=${await signSession('test',env.CRM_SESSION_SECRET)}`;
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+juykAAAAASUVORK5CYII=','base64'));
assert.deepEqual(validatePng(png),{width:1,height:1});
assert.throws(()=>validatePng(new TextEncoder().encode('<svg onload="alert(1)"></svg>')));
assert.throws(()=>validatePng(new Uint8Array(2097153)));
assert.throws(()=>decodeImageResult({output:[]}));
const huge=png.slice();new DataView(huge.buffer).setUint32(16,50000);assert.throws(()=>validatePng(huge));
let rows=[],assetRows=[],feedback=[],starts=[],objects=new Map(),provider=new Map(),storageFailure=false,uncertain=false,expectLogo=true,bucketPublic=false;
const originalFetch=globalThis.fetch;
const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
const matches=(row,search)=>[...search].every(([key,val])=>{
  if(['select','limit','order','on_conflict'].includes(key))return true;
  const actual=key==='output->>phase'?row.output?.phase:row[key];
  if(val==='is.null')return actual==null;
  if(val.startsWith('eq.'))return String(actual)===val.slice(3);
  if(val.startsWith('in.('))return val.slice(4,-1).split(',').includes(actual);
  return true;
});
globalThis.fetch=async(url,opts={})=>{
  const u=new URL(url),method=opts.method||'GET';
  if(u.host==='api.openai.com'){
    if(method==='POST'){
      const body=JSON.parse(opts.body);starts.push(body);
      assert(!opts.body.includes('PRIVATE-PHONE'));assert(!opts.body.includes('PRIVATE-EMAIL'));
      const id=`resp_visual${starts.length}`;
      if(body.tools[0].type==='image_generation'){
        assert.equal(body.background,true);assert.equal(body.tool_choice.type,'image_generation');assert.equal(body.max_tool_calls,1);assert.equal(body.tools[0].output_format,'png');
        assert.equal(body.input[0].content.some(c=>c.type==='input_image'&&c.image_url.startsWith('data:image/png;base64,')),expectLogo);
        provider.set(id,{status:'completed',output:[{type:'image_generation_call',result:Buffer.from(png).toString('base64')}]});
      }else{
        const research={identity_status:uncertain?'uncertain':'verified',business_name:'Example Academy',summary:'Business training in Casablanca.',findings:['The official site lists courses.'],recommended_mockup_type:'stationery',recommendation_reason:'Branded stationery supports course enquiries.',evidence:[{url:'https://example.com/',title:'Official business',claim:'Training services.'}]};
        provider.set(id,{status:'completed',output_text:JSON.stringify(research),output:[{type:'web_search_call',action:{sources:[{url:'https://example.com/'}]}}]});
      }
      return respond({id,status:'queued',model:'test-model'});
    }
    return respond(provider.get(u.pathname.split('/').pop()));
  }
  assert.equal(u.host,'database.test');
  if(u.pathname.startsWith('/storage/v1/')){
    assert.equal(opts.headers.Authorization,'Bearer fake-key');
    if(storageFailure)return respond({error:'unavailable'},503);
    if(u.pathname.includes('/bucket/'))return respond({public:bucketPublic});
    const path=u.pathname.replace('/storage/v1/object/','').replace(/^authenticated\//,'');
    if(method==='POST'){objects.set(path,new Uint8Array(opts.body));return respond({Key:path});}
    return objects.has(path)?new Response(objects.get(path),{headers:{'Content-Type':'image/png'}}):respond({},404);
  }
  const body=opts.body?JSON.parse(opts.body):null,table=u.pathname.split('/').pop();
  if(table==='leads')return respond([{id:u.searchParams.get('id').slice(3),full_name:'Example Academy',company_name:'Example Academy',city:'Casablanca',phone:'PRIVATE-PHONE',email:'PRIVATE-EMAIL'}]);
  if(table==='lead_analyses')return respond([]); // Research must work even without an earlier analysis.
  if(table==='lead_project_feedback')return respond(feedback);
  const records=table==='lead_project_generations'?rows:table==='lead_project_assets'?assetRows:null;
  assert(records,`Unknown table ${table}`);
  if(method==='POST'){
    const existing=records.find(r=>body.id&&r.id===body.id);
    if(existing){Object.assign(existing,body);return respond([existing]);}
    const row={id:crypto.randomUUID(),created_at:new Date().toISOString(),...body};records.unshift(row);return respond([row]);
  }
  const filtered=records.filter(row=>matches(row,u.searchParams));
  if(method==='PATCH'){filtered.forEach(row=>Object.assign(row,body));return respond(filtered);}
  assert.equal(method,'GET','Visual workflow never deletes records');
  return respond(filtered.slice(0,Number(u.searchParams.get('limit')||100)));
};
async function call(handler,method='GET',body,query='',id=leadId,auth=true){
  return handler({env,params:{id},request:new Request(`https://crm.test/api/crm/intelligence/leads/${id}/${handler===assets?'assets':'project'}${query}`,{method,headers:{...(auth?{Cookie:cookie}:{}),Origin:'https://crm.test',...(body?{'Content-Type':body instanceof Uint8Array?'image/png':'application/json'}:{})},...(body?{body:body instanceof Uint8Array?body:JSON.stringify(body)}:{})})});
}
const generate=()=>({action:'generate',kind:'mockup',projectType:'auto',visualMockup:true,locale:'fr',confirmCost:true,requestId:crypto.randomUUID()});
try{
  assert.equal((await call(assets,'POST',png,'',leadId,false)).status,401);
  bucketPublic=true;assert.equal((await call(assets,'POST',png)).status,400);assert.equal(starts.length,0,'A public bucket must be rejected before spending credit');bucketPublic=false;
  const upload=await call(assets,'POST',png);assert.equal(upload.status,201);const logo=(await upload.json()).logo;
  assert.equal(starts.length,0,'Logo uploads never spend API credit');
  assert.equal((await call(assets,'GET',null,`?asset=${logo.id}`)).headers.get('Content-Type'),'image/png');
  assert.equal((await call(assets,'GET',null,`?asset=${logo.id}` ,otherLead)).status,404,'Cross-lead asset access forbidden');
  const request=generate();const start=await call(project,'POST',request);assert.equal(start.status,202);
  const jobId=(await start.json()).generation.id;
  await call(project,'POST',request);assert.equal(starts.length,1,'Research requests are idempotent');
  const reviewed=await(await call(project,'GET',null,'?poll=1')).json();
  assert.equal(reviewed.generations[0].phase,'awaiting_approval');assert.equal(reviewed.generations[0].recommendation.type,'stationery');assert.equal(starts.length,1,'Research never auto-starts a paid image');
  const approve={action:'approve-mockup',generationId:jobId,projectType:'clothing',locale:'fr',confirmCost:true};
  assert.equal((await call(project,'POST',{...approve,confirmCost:false})).status,400);
  assert.equal((await call(project,'POST',{...approve,projectType:'javascript:bad'})).status,400);
  assert.equal((await call(project,'POST',approve,'',otherLead)).status,404);
  await Promise.all([call(project,'POST',approve),call(project,'POST',approve)]);
  assert.equal(starts.length,2,'Concurrent approvals create one image request');
  assert(starts[1].input[0].content[0].text.includes('T-shirt'),'Override is used, not the recommended stationery');
  storageFailure=true;assert.equal((await call(project,'GET',null,'?poll=1')).status,503);assert.equal(rows[0].status,'queued');
  storageFailure=false;
  const finished=await(await call(project,'GET',null,'?poll=1')).json();const result=finished.generations[0];
  assert.equal(starts.length,2,'Saving a previously generated image must not spend twice');
  assert.equal(result.status,'completed');assert.equal(result.output._type,'clothing');assert.equal(result.output.logo_asset_id,logo.id);assert.equal(result.output.render_mode,'image');
  assert(!JSON.stringify(result).includes('base64'));assert(!JSON.stringify(result).includes('fake-key'));
  const download=await call(assets,'GET',null,`?asset=${result.output.image_asset_id}&download=1`);
  assert.equal(download.status,200);assert(download.headers.get('Content-Disposition').startsWith('attachment'));assert.deepEqual(new Uint8Array(await download.arrayBuffer()),png);
  await call(project,'POST',approve);assert.equal(starts.length,2,'Repeat approval on a completed image is free');
  await call(assets,'POST',png);assert.equal(assetRows.filter(r=>r.purpose==='logo').length,2,'Replacing logo preserves earlier versions');assert.equal(result.output.logo_asset_id,logo.id);
  const previous=JSON.stringify(result.output);
  await call(project,'POST',generate());await call(project,'GET',null,'?poll=1');
  const dismissId=rows[0].id;assert.equal((await call(project,'POST',{action:'cancel-mockup',generationId:dismissId})).status,200);
  assert.equal(starts.length,3,'Dismissing a recommendation does not generate an image');
  uncertain=true;await call(project,'POST',generate());await call(project,'GET',null,'?poll=1');assert.equal(rows[0].status,'failed');assert.equal(starts.length,4);
  assert.equal(JSON.stringify(rows.find(r=>r.id===jobId).output),previous,'Later failures preserve saved mockups');
  uncertain=false;expectLogo=false;
  const withoutLogo=await(await call(project,'POST',generate(),'',otherLead)).json();
  await call(project,'GET',null,'?poll=1',otherLead);
  await call(project,'POST',{action:'approve-mockup',generationId:withoutLogo.generation.id,projectType:'devices',locale:'en',confirmCost:true},'',otherLead);
  assert(starts.at(-1).input[0].content[0].text.includes('No logo is supplied'));
  console.log('CRM visual tests passed: private logo uploads, ownership, research-only approval gate, type override, idempotent concurrent approval, logo image input, private PNG download, storage retry without another charge, version preservation and uncertain identity.');
}finally{globalThis.fetch=originalFetch;}
