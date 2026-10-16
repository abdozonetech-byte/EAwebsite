import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { onRequest } from '../functions/api/crm/intelligence/leads/[id]/project.js';
import { signSession } from '../functions/_lib/auth.js';
import { PROJECT_SCHEMAS, projectPrompt, validateProjectOutput } from '../functions/_lib/lead-project.js';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const leadId='123e4567-e89b-42d3-a456-426614174000', requestId='123e4567-e89b-42d3-a456-426614174001', generationId='123e4567-e89b-42d3-a456-426614174002';
const env={CRM_USERNAME:'test',CRM_SESSION_SECRET:'local-test-secret',SUPABASE_URL:'https://database.test',SUPABASE_SERVICE_ROLE_KEY:'fake-db-key',OPENAI_API_KEY:'fake-openai-key'};
const cookie=`elboubakry_crm_session=${await signSession('test',env.CRM_SESSION_SECRET)}`;
const solution={title:'Improve the booking journey',summary:'A proposed project based on the saved research.',problems:[{problem:'Booking CTA is unclear.',solution:'Make one clear booking entry point.',service:'Landing page',priority:'high',evidence_url:'https://example.com/contact',assumption:false}],next_steps:['Confirm priorities'],questions:['Who handles bookings?'],sales_approach:'Offer a short walkthrough.',email_subject:'A proposed booking improvement',email_body:'Hello, would a short walkthrough be useful?',whatsapp:'Hello, may I share a booking idea?'};
const mockup={brand_name:'Sample Clinic',eyebrow:'A clearer booking journey',headline:'Make your next step simple',description:'A proposed landing page concept.',cta_label:'Request a consultation',accent:'emerald',features:['Clear services','Easy booking','Personal follow-up'],sections:[{title:'Services',body:'Present the available services.'},{title:'Approach',body:'Explain the consultation journey.'},{title:'Contact',body:'Make booking easy.'}],design_rationale:'A calm, clear visual direction.'};
assert.deepEqual(validateProjectOutput('mockup',mockup),mockup);
assert.throws(()=>validateProjectOutput('mockup',{...mockup,accent:'red;url(javascript:alert(1))'}));
assert.throws(()=>validateProjectOutput('solution',{...solution,problems:[{...solution.problems[0],assumption:'false'}]}));
const unsupported=validateProjectOutput('solution',solution,[]);
assert.equal(unsupported.problems[0].evidence_url,'');
assert.equal(unsupported.problems[0].assumption,true);
const prompt=projectPrompt('solution',{full_name:'Business',phone:'PRIVATE-PHONE',email:'PRIVATE-EMAIL'}, {current_situation:'Saved finding'}, [{rating:4,body:'Use simpler copy'}], 'Focus on bookings','fr',null);
assert(!prompt.includes('PRIVATE-PHONE'));assert(!prompt.includes('PRIVATE-EMAIL'));assert(prompt.includes('Use simpler copy'));
assert.equal(PROJECT_SCHEMAS.mockup.additionalProperties,false);
const originalFetch=globalThis.fetch;
let openaiStarts=0, snapshots=0, rows=[], feedback=[], responseStatus='completed';
const requests=[];
globalThis.fetch=async(url,opts={})=>{
  const u=new URL(url), method=opts.method||'GET', body=opts.body?JSON.parse(opts.body):null;
  requests.push({path:u.pathname,method,body});
  const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
  if(u.host==='api.openai.com'){
    if(method==='POST'){
      openaiStarts++;
      assert.equal(body.background,true);assert.equal(body.text.format.type,'json_schema');assert.equal(body.text.format.strict,true);
      assert(!opts.body.includes('PRIVATE-PHONE'));assert(!opts.body.includes('PRIVATE-EMAIL'));
      return respond({id:'resp_project123',status:'queued',model:'test-model'});
    }
    snapshots++;
    return respond({status:responseStatus,output_text:JSON.stringify(solution)});
  }
  assert.equal(u.host,'database.test');
  const table=u.pathname.split('/').pop();
  if(table==='leads')return respond([{id:leadId,full_name:'Business',city:'Casablanca',phone:'PRIVATE-PHONE',email:'PRIVATE-EMAIL'}]);
  if(table==='lead_analyses')return respond([{lead_id:leadId,current_situation:'Saved finding',evidence:[{url:'https://example.com/contact'}]}]);
  if(table==='lead_project_feedback'){
    if(method==='POST'){feedback.push({...body,id:generationId,created_at:new Date().toISOString()});return respond([feedback.at(-1)]);}
    return respond(feedback);
  }
  if(table==='lead_project_generations'){
    let filtered=rows.filter(r=>(!u.searchParams.get('request_id')||u.searchParams.get('request_id')===`eq.${r.request_id}`)&&(!u.searchParams.get('id')||u.searchParams.get('id')===`eq.${r.id}`)&&(!u.searchParams.get('lead_id')||u.searchParams.get('lead_id')===`eq.${r.lead_id}`)&&(!u.searchParams.get('kind')||u.searchParams.get('kind')===`eq.${r.kind}`)&&(!u.searchParams.get('status')||(u.searchParams.get('status').startsWith('in.')?u.searchParams.get('status').includes(r.status):u.searchParams.get('status')===`eq.${r.status}`)));
    if(method==='POST'){const row={id:rows.length?'123e4567-e89b-42d3-a456-426614174077':generationId,...body,created_at:new Date().toISOString()};rows.push(row);return respond([row]);}
    if(method==='PATCH'){filtered.forEach(r=>Object.assign(r,body));return respond(filtered);}
    return respond(filtered);
  }
  throw new Error(`Unexpected request ${url}`);
};
async function call(method='GET',body,query='',headers={Cookie:cookie}){
  return onRequest({env,params:{id:leadId},request:new Request(`https://crm.test/api/crm/intelligence/leads/${leadId}/project${query}`,{method,headers:{...headers,'Content-Type':'application/json',Origin:'https://crm.test'},...(body?{body:JSON.stringify(body)}:{})})});
}
try{
  assert.equal((await call('GET',null,'',{})).status,401);
  assert.equal((await call('DELETE')).status,405);
  assert.equal((await call('POST',{action:'generate',kind:'solution',requestId,brief:'',locale:'en',confirmCost:false})).status,400);
  const startBody={action:'generate',kind:'solution',requestId,brief:'Focus on bookings',locale:'en',confirmCost:true};
  const started=await call('POST',startBody);assert.equal(started.status,202);assert.equal((await started.json()).generation.status,'queued');
  assert.equal((await call('POST',startBody)).status,200);assert.equal(openaiStarts,1,'Duplicate request must not charge twice');
  assert.equal((await call('POST',{...startBody,requestId:'123e4567-e89b-42d3-a456-426614174099'})).status,200);assert.equal(openaiStarts,1,'Active generation must be reused');
  const read=await(await call()).json();assert.equal(read.contact.phone,'PRIVATE-PHONE');assert.equal(snapshots,0,'Plain GET never polls OpenAI');
  const completed=await(await call('GET',null,'?poll=1')).json();assert.equal(completed.generations[0].status,'completed');assert.equal(completed.generations[0].output.title,solution.title);
  assert(!JSON.stringify(completed).includes('resp_project123'),'Provider ID stays server-side');
  assert.equal((await call('POST',{action:'feedback',rating:5,body:'',generationId})).status,400);
  assert.equal((await call('POST',{action:'feedback',rating:5,body:'Make the headline shorter.',generationId})).status,200);
  assert.equal(feedback.length,1);
  assert.equal((await call('POST',{action:'feedback',rating:5,body:'Cross lead',generationId:'123e4567-e89b-42d3-a456-426614174099'})).status,404);
  assert.equal(openaiStarts,1);
  responseStatus='incomplete';
  const retryId='123e4567-e89b-42d3-a456-426614174088';
  const priorOutput=JSON.stringify(rows[0].output);
  await call('POST',{...startBody,requestId:retryId});
  const failedResult=await(await call('GET',null,'?poll=1')).json();
  assert.equal(failedResult.generations[1].status,'failed');
  assert.equal(failedResult.generations[0].status,'completed');
  assert.equal(JSON.stringify(rows[0].output),priorOutput,'Failed revisions must preserve earlier results');
  assert(!requests.some(r=>r.method==='DELETE'),'No record deletion');
  assert(!requests.some(r=>['leads','lead_analyses'].includes(r.path.split('/').pop())&&r.method!=='GET'),'Existing leads and research are read-only');
  console.log('CRM project tests passed: auth, validation, strict schemas, contact privacy, idempotency, active-job reuse, saved results, evidence restrictions, feedback ownership and no lead mutations.');
} finally {globalThis.fetch=originalFetch;}
