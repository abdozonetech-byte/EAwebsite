import { requireCrmApi } from "../../../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../../../_lib/http.js";
import { supabaseFetch, supabaseErrorResponse } from "../../../../../_lib/supabase.js";
import { openAiConfig, startProjectResponse, retrieveResearchResponse, parseJsonOutput } from "../../../../../_lib/openai-intelligence.js";
import { ACTIVE, UUID, PROJECT_SCHEMAS, projectPrompt, validateProjectOutput, publicGeneration } from "../../../../../_lib/lead-project.js";

async function poll(env, row, analysis) {
  if (!ACTIVE.includes(row.status) || !row.response_id) return row;
  const response = await retrieveResearchResponse(env, row.response_id);
  let update;
  if (response.status === "completed") {
    try { update = { status: "completed", output: validateProjectOutput(row.kind, parseJsonOutput(response), analysis?.evidence || []), completed_at: new Date().toISOString(), error: null }; }
    catch (error) { update = { status: "failed", error: error.message, completed_at: new Date().toISOString() }; }
  } else if (["failed", "cancelled", "incomplete"].includes(response.status)) {
    update = { status: "failed", error: "AI generation could not finish. Your previous results are preserved. Try a shorter brief or check API credit.", completed_at: new Date().toISOString() };
  } else update = { status: response.status === "queued" ? "queued" : "in_progress" };
  // A concurrent poll cannot overwrite a completed output.
  const saved = await supabaseFetch(env, "lead_project_generations", { method: "PATCH", search: { id: `eq.${row.id}`, lead_id: `eq.${row.lead_id}`, status: `in.(${ACTIVE.join(",")})` }, body: update });
  return saved[0] || row;
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "POST"]);
  if (guard) return guard;
  const id = String(context.params.id || "");
  if (!UUID.test(id)) return json({ ok: false, message: "Invalid lead ID." }, 400);
  try {
    const [leads, analyses] = await Promise.all([
      supabaseFetch(context.env, "leads", { search: { select: "id,full_name,company_name,business_sector,city,landing_page_url,phone,email", id: `eq.${id}`, limit: "1" } }),
      supabaseFetch(context.env, "lead_analyses", { search: { select: "*", lead_id: `eq.${id}`, limit: "1" } }),
    ]);
    if (!leads.length) return json({ ok: false, message: "Lead not found." }, 404);
    const lead = leads[0], analysis = analyses[0];
    if (context.request.method === "POST") {
      const parsed = await readJsonBody(context.request, 16000);
      if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
      const body = parsed.body;
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
      if (body?.action !== "generate" || !["solution", "mockup"].includes(body.kind) || !UUID.test(String(body.requestId || "")) || typeof body.brief !== "string" || body.brief.length > 3000 || !["fr", "en"].includes(body.locale) || body.confirmCost !== true) return json({ ok: false, message: "Invalid generation request." }, 400);
      openAiConfig(context.env); // Validate configuration before reserving a job.
      const previous = await supabaseFetch(context.env, "lead_project_generations", { search: { select: "*", request_id: `eq.${body.requestId}`, lead_id: `eq.${id}`, limit: "1" } });
      if (previous.length) return json({ ok: true, generation: publicGeneration(previous[0]) });
      const active = await supabaseFetch(context.env, "lead_project_generations", { search: { select: "*", lead_id: `eq.${id}`, status: `in.(${ACTIVE.join(",")})`, limit: "1" } });
      if (active.length) return json({ ok: true, generation: publicGeneration(active[0]) });
      const [feedback, solutions] = await Promise.all([
        supabaseFetch(context.env, "lead_project_feedback", { search: { select: "rating,body", lead_id: `eq.${id}`, order: "created_at.desc", limit: "8" } }),
        supabaseFetch(context.env, "lead_project_generations", { search: { select: "output", lead_id: `eq.${id}`, kind: "eq.solution", status: "eq.completed", order: "created_at.desc", limit: "1" } }),
      ]);
      if (!analysis?.current_situation && !body.brief.trim()) return json({ ok: false, message: "Analyze this lead or add a project brief before generating." }, 400);
      let reserved;
      try {
        [reserved] = await supabaseFetch(context.env, "lead_project_generations", { method: "POST", body: { lead_id: id, request_id: body.requestId, kind: body.kind, brief: body.brief.trim(), locale: body.locale, status: "starting" } });
      } catch (error) {
        if (error.status === 409) return json({ ok: false, message: "A generation is already starting. Refresh the project workspace." }, 409);
        throw error;
      }
      let started;
      try { started = await startProjectResponse(context.env, projectPrompt(body.kind, lead, analysis, feedback, body.brief.trim(), body.locale, solutions[0]?.output), PROJECT_SCHEMAS[body.kind]); }
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
    for (let index = 0; index < history.length; index++) if (shouldPoll && ACTIVE.includes(history[index].status)) history[index] = await poll(context.env, history[index], analysis);
    return json({ ok: true, contact: { phone: lead.phone || "", email: lead.email || "" }, generations: history.map(publicGeneration), feedback });
  } catch (error) {
    if (error.status) return supabaseErrorResponse(error);
    return json({ ok: false, message: error.message || "Project workspace is temporarily unavailable." }, 503);
  }
}
