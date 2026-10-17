import { requireCrmApi } from "../../../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../../../_lib/http.js";
import { supabaseFetch, supabaseErrorResponse } from "../../../../../_lib/supabase.js";
import { openAiConfig, startResearchResponse, startProjectResponse, retrieveResearchResponse, parseJsonOutput } from "../../../../../_lib/openai-intelligence.js";
import { ACTIVE, UUID, VISUAL_TYPES, PROJECT_SCHEMAS, projectType, projectResearchPrompt, validateProjectResearch, projectPrompt, validateProjectOutput, publicGeneration } from "../../../../../_lib/lead-project.js";
import { latestLogo, decodeImageResult, saveAsset, assetUrl, assertVisualStorage } from "../../../../../_lib/project-assets.js";
import { PRESENCE_SCHEMA, presencePrompt, validatePresence } from "../../../../../_lib/lead-presence.js";
import { aiBudget, providerUsage, presenceCacheKey, reusablePresence } from "../../../../../_lib/ai-budget.js";

async function poll(env, row, analysis, lead) {
  if(row.kind==='mockup'&&ACTIVE.includes(row.status)&&['research','awaiting_approval'].includes(row.output?.phase)) {
    const saved=await supabaseFetch(env,'lead_project_generations',{method:'PATCH',search:{id:`eq.${row.id}`,status:`eq.${row.status}`,'output->>phase':`eq.${row.output.phase}`},body:{status:'failed',error:'Mockup creation has been removed from this CRM. Saved data is preserved; no further image generation was started.',completed_at:new Date().toISOString()}});
    return saved[0]||row;
  }
  if (!ACTIVE.includes(row.status) || !row.response_id) return row;
  const response = await retrieveResearchResponse(env, row.response_id, row.output?.phase === "research");
  if (response.status === 'completed' && row.output?.phase === 'image') {
    let bytes;
    try { bytes=decodeImageResult(response); }
    catch(error) {
      const saved=await supabaseFetch(env,'lead_project_generations',{method:'PATCH',search:{id:`eq.${row.id}`,response_id:`eq.${row.response_id}`,status:'in.(queued,in_progress)'},body:{status:'failed',error:error.message,completed_at:new Date().toISOString()}});
      return saved[0]||row;
    }
    // Storage retries reuse the same finished image, never start another paid response.
    const asset=await saveAsset(env,row.lead_id,'mockup',bytes,row.id);
    const saved=await supabaseFetch(env,'lead_project_generations',{method:'PATCH',search:{id:`eq.${row.id}`,response_id:`eq.${row.response_id}`,status:'in.(queued,in_progress)'},body:{status:'completed',error:null,completed_at:new Date().toISOString(),output:{render_mode:'image',image_asset_id:asset.id,image_url:assetUrl(row.lead_id,asset.id),download_url:assetUrl(row.lead_id,asset.id,true),logo_asset_id:row.output.logo_asset_id,_type:row.output.selected_type,_research:row.output.research,disclaimer:row.output.logo_asset_id?'AI-generated concept. Check logo lettering and visual accuracy before sharing.':'Proposed branding concept; no official logo was supplied.'}}});
    return saved[0]||row;
  }
  let update;
  if (response.status === "completed") {
    try {
      if (row.output?.phase === "research") {
        const research = validateProjectResearch(parseJsonOutput(response), response);
        if (row.output.render_mode === 'image') {
          if (!research.recommended_mockup_type) throw new Error('The research did not return a valid mockup recommendation. No image was generated.');
          const saved=await supabaseFetch(env,'lead_project_generations',{method:'PATCH',search:{id:`eq.${row.id}`,response_id:`eq.${row.response_id}`,status:'in.(queued,in_progress)','output->>phase':'eq.research'},body:{status:'queued',response_id:null,output:{...row.output,phase:'awaiting_approval',research}}});
          return saved[0]||row;
        }
        // Only one concurrent poll may start the second paid phase.
        const usage = { research: providerUsage(response) };
        const claimed = await supabaseFetch(env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${row.id}`, lead_id: `eq.${row.lead_id}`, response_id: `eq.${row.response_id}`, status: "in.(queued,in_progress)", "output->>phase": "eq.research" }, body: { status: "starting", response_id: null, output: { ...row.output, phase: "preparing_generation", research, usage } } });
        if (!claimed.length) return row;
        const [feedback, solutions] = await Promise.all([
          supabaseFetch(env, "lead_project_feedback", { search: { select: "rating,body", lead_id: `eq.${row.lead_id}`, order: "created_at.desc", limit: "8" } }),
          supabaseFetch(env, "lead_project_generations", { search: { select: "output", lead_id: `eq.${row.lead_id}`, kind: "eq.solution", status: "eq.completed", order: "created_at.desc", limit: "1" } }),
        ]);
        let started;
        try { started = await startProjectResponse(env, row.brief==='presence'?presencePrompt(lead,research,feedback,row.locale):projectPrompt(row.kind, lead, analysis, feedback, projectType(row.kind, row.brief), row.locale, solutions[0]?.output, research), row.brief==='presence'?PRESENCE_SCHEMA:PROJECT_SCHEMAS[row.kind]); }
        catch (error) {
          const failed = await supabaseFetch(env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${row.id}`, status: "eq.starting", response_id: "is.null" }, body: { status: "failed", error: error.message, completed_at: new Date().toISOString() } });
          return failed[0] || claimed[0];
        }
        const currentKey = row.brief === 'presence' ? await presenceCacheKey(lead, analysis, feedback, row.locale) : null;
        const cacheKey = currentKey === row.output.initialCacheKey ? currentKey : null;
        const saved = await supabaseFetch(env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${row.id}`, status: "eq.starting" }, body: { response_id: started.id, model: started.model, status: started.status === "queued" ? "queued" : "in_progress", output: { ...row.output, phase: "generation", research, usage, cacheKey } } });
        return saved[0] || claimed[0];
      }
      const research = row.output?.research;
      const output = row.brief==='presence'?validatePresence(parseJsonOutput(response),research,row.locale):validateProjectOutput(row.kind, parseJsonOutput(response), research?.evidence || analysis?.evidence || []);
      update = { status: "completed", output: { ...output, ...(research ? { _research: research } : {}), _type: projectType(row.kind, row.brief), _cacheKey: row.output?.cacheKey || null, _budget: row.output?.budget || null, _usage: { ...row.output?.usage, generation: providerUsage(response) } }, completed_at: new Date().toISOString(), error: null };
    }
    catch (error) { update = { status: "failed", error: error.message, completed_at: new Date().toISOString() }; }
  } else if (["failed", "cancelled", "incomplete"].includes(response.status)) {
    update = { status: "failed", error: "AI research or generation could not finish. Your previous results are preserved. Check the business details or API credit.", completed_at: new Date().toISOString() };
  } else update = { status: response.status === "queued" ? "queued" : "in_progress" };
  // A concurrent poll cannot overwrite a completed output.
  const saved = await supabaseFetch(env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${row.id}`, lead_id: `eq.${row.lead_id}`, response_id: `eq.${row.response_id}`, status: `in.(${ACTIVE.join(",")})` }, body: update });
  return saved[0] || row;
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "POST"]);
  if (guard) return guard;
  const id = String(context.params.id || "");
  if (!UUID.test(id)) return json({ ok: false, message: "Invalid lead ID." }, 400);
  try {
    const [leads, analyses] = await Promise.all([
      supabaseFetch(context.env, "leads", { search: { select: "id,full_name,company_name,business_sector,city,country,landing_page_url,phone,email", id: `eq.${id}`, limit: "1" } }),
      supabaseFetch(context.env, "lead_analyses", { search: { select: "*", lead_id: `eq.${id}`, limit: "1" } }),
    ]);
    if (!leads.length) return json({ ok: false, message: "Lead not found." }, 404);
    const lead = leads[0], analysis = analyses[0];
    if (context.request.method === "POST") {
      const parsed = await readJsonBody(context.request, 16000);
      if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
      const body = parsed.body;
      if(body?.action==='approve-mockup'||(body?.action==='generate'&&body.kind==='mockup')) return json({message:'Mockups have been removed from this CRM. Use online presence and message drafting instead.'},410);
      if(body?.action==='cancel-mockup') {
        if(!UUID.test(String(body.generationId||''))) return json({message:'Invalid mockup ID.'},400);
        const cancelled=await supabaseFetch(context.env,'lead_project_generations',{method:'PATCH',search:{id:`eq.${body.generationId}`,lead_id:`eq.${id}`,kind:'eq.mockup',status:'eq.queued','output->>phase':'eq.awaiting_approval'},body:{status:'failed',error:'Mockup recommendation dismissed by the user. No image was generated.',completed_at:new Date().toISOString()}});
        return cancelled.length?json({ok:true}):json({message:'Only a recommendation awaiting approval can be dismissed.'},409);
      }
      if (body?.action === "feedback") {
        if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5 || typeof body.body !== "string" || !body.body.trim() || body.body.length > 4000) return json({ ok: false, message: "Choose a rating and write feedback (up to 4,000 characters)." }, 400);
        if (body.generationId) {
          if (!UUID.test(body.generationId)) return json({ ok: false, message: "Invalid project version." }, 400);
          const owned = await supabaseFetch(context.env, "lead_project_generations", { search: { select: "id", id: `eq.${body.generationId}`, lead_id: `eq.${id}`, limit: "1" } });
          if (!owned.length) return json({ ok: false, message: "Project version not found for this lead." }, 404);
        }
        await supabaseFetch(context.env, "lead_project_feedback", { method: "POST", body: { lead_id: id, generation_id: body.generationId || null, rating: body.rating, body: body.body.trim() } });
        return json({ ok: true });
      }
      if (body?.action !== "generate" || !["solution", "mockup"].includes(body.kind) || !projectType(body.kind, body.projectType) || !UUID.test(String(body.requestId || "")) || !["fr", "en"].includes(body.locale) || body.confirmCost !== true) return json({ ok: false, message: "Invalid generation request." }, 400);
      const visual=body.kind==='mockup' && body.visualMockup===true;
      if(visual && body.projectType!=='auto' && !Object.hasOwn(VISUAL_TYPES,body.projectType||'')) return json({message:'Choose a supported visual mockup type.'},400);
      openAiConfig(context.env); // Validate configuration before reserving a job.
      const previous = await supabaseFetch(context.env, "lead_project_generations", { search: { select: "*", request_id: `eq.${body.requestId}`, lead_id: `eq.${id}`, limit: "1" } });
      if (previous.length) return json({ ok: true, generation: publicGeneration(previous[0]) });
      const active = await supabaseFetch(context.env, "lead_project_generations", { search: { select: "*", lead_id: `eq.${id}`, status: `in.(${ACTIVE.join(",")})`, limit: "1" } });
      if (active.length) return json({ ok: true, generation: publicGeneration(active[0]) });
      const budget = aiBudget(context.env);
      let initialCacheKey = null;
      if (body.projectType === 'presence') {
        const [feedback, recent] = await Promise.all([
          supabaseFetch(context.env, 'lead_project_feedback', { search: { select: 'rating,body', lead_id: `eq.${id}`, order: 'created_at.desc', limit: '8' } }),
          supabaseFetch(context.env, 'lead_project_generations', { search: { select: '*', lead_id: `eq.${id}`, brief: 'eq.presence', status: 'eq.completed', order: 'created_at.desc', limit: '20' } }),
        ]);
        const key = await presenceCacheKey(lead, analysis, feedback, body.locale);
        initialCacheKey = key;
        const reusable = recent.find(row => row.lead_id === id && row.locale === body.locale && reusablePresence(row, key, budget.reuseHours));
        if (reusable) return json({ ok: true, reused: true, generation: publicGeneration(reusable) });
      }
      if(visual) await Promise.all([latestLogo(context.env,id),assertVisualStorage(context.env)]); // Check private storage before spending research credit.
      let reserved;
      try {
        [reserved] = await supabaseFetch(context.env, "lead_project_generations", { method: "POST", body: { lead_id: id, request_id: body.requestId, kind: body.kind, brief: projectType(body.kind, body.projectType), locale: body.locale, status: "starting", output: { phase: "research", budget, initialCacheKey, ...(visual?{render_mode:'image'}:{}) } } });
      } catch (error) {
        if (error.status === 409) return json({ ok: false, message: "A generation is already starting. Refresh the project workspace." }, 409);
        throw error;
      }
      let started;
      try { started = await startResearchResponse(context.env, projectResearchPrompt(lead, analysis,visual,body.projectType==='presence'), { country: lead.country, city: lead.city }); }
      catch (error) {
        await supabaseFetch(context.env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${reserved.id}` }, body: { status: "failed", error: error.message, completed_at: new Date().toISOString() } });
        return json({ ok: false, message: error.message }, 502);
      }
      // If saving fails after OpenAI starts, leave the reservation active: never auto-charge again.
      const saved = await supabaseFetch(context.env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${reserved.id}` }, body: { response_id: started.id, model: started.model, status: started.status === "queued" ? "queued" : "in_progress" } });
      return json({ ok: true, generation: publicGeneration(saved[0]) }, 202);
    }
    const [history, feedback] = await Promise.all([
      supabaseFetch(context.env, "lead_project_generations", { search: { select: "*", lead_id: `eq.${id}`, order: "created_at.desc", limit: "20" } }),
      supabaseFetch(context.env, "lead_project_feedback", { search: { select: "id,generation_id,rating,body,created_at", lead_id: `eq.${id}`, order: "created_at.desc", limit: "20" } }),
    ]);
    const shouldPoll = new URL(context.request.url).searchParams.get("poll") === "1";
    for (let index = 0; index < history.length; index++) if (shouldPoll && ACTIVE.includes(history[index].status)) history[index] = await poll(context.env, history[index], analysis, lead);
    return json({ ok: true, contact: { phone: lead.phone || "", email: lead.email || "" }, generations: history.map(publicGeneration), feedback });
  } catch (error) {
    if (error.status) return supabaseErrorResponse(error);
    return json({ ok: false, message: error.message || "Project workspace is temporarily unavailable." }, 503);
  }
}
