import { callMcpTool } from "../../../_lib/mcp-tools.js";
import {
  analysisPrompt,
  discoveryPrompt,
  parseJsonOutput,
  retrieveResearchResponse,
  startResearchResponse,
  validateAnalysisOutput,
} from "../../../_lib/openai-intelligence.js";
import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../_lib/http.js";
import { supabaseFetch } from "../../../_lib/supabase.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTERNAL_AUTH = { subject: "crm-openai-backend", clientId: "crm-backend", scopes: ["crm.leads.read", "crm.analysis.read", "crm.analysis.write", "crm.discovery.write"] };

function safeKind(value) {
  return value === "analysis" || value === "discovery" ? value : "";
}

async function findBatch(env, kind, batchId) {
  if (!UUID_PATTERN.test(String(batchId || ""))) return null;
  const table = kind === "analysis" ? "analysis_batches" : "lead_discovery_batches";
  const rows = await supabaseFetch(env, table, { search: { select: "*", id: `eq.${batchId}`, limit: "1" } });
  return rows[0] || null;
}

function publicJob(kind, batch, extra = {}) {
  return {
    kind,
    batchId: batch.id,
    batchCode: batch.batch_code,
    status: batch.ai_status || batch.status,
    model: batch.ai_model || "",
    error: batch.ai_error || "",
    ...(kind === "analysis" ? {
      completed: Number(batch.completed_leads || 0),
      failed: Number(batch.failed_leads || 0),
      total: Number(batch.total_leads || 0),
    } : { saved: Number(batch.ai_result_count || 0) }),
    ...extra,
  };
}

async function startAnalysis(env, batch) {
  const leads = await supabaseFetch(env, "analysis_batch_leads", {
    search: { select: "lead_id,status,leads(id,full_name,company_name,business_sector,city,landing_page_url,message)", batch_id: `eq.${batch.id}`, order: "queued_at.asc", limit: "100" },
  });
  if (!leads.length) throw new Error("This research batch has no queued leads.");
  if (leads.length > 50) throw new Error("Run direct AI research in batches of 50 leads or fewer.");
  await supabaseFetch(env, "analysis_batches", { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { status: "processing", ai_status: "starting", ai_error: null, started_at: new Date().toISOString() } });
  await supabaseFetch(env, "analysis_batch_leads", { method: "PATCH", search: { batch_id: `eq.${batch.id}`, status: "eq.awaiting_chatgpt" }, body: { status: "in_progress", started_at: new Date().toISOString(), error_message: null } });
  for (const row of leads) {
    await supabaseFetch(env, "lead_analyses", { method: "POST", search: { on_conflict: "lead_id" }, prefer: "resolution=merge-duplicates,return=representation", body: { lead_id: row.lead_id, analysis_status: "processing", research_source: "openai_api", error_message: null } });
  }
  let started;
  try {
    started = await startResearchResponse(env, analysisPrompt(batch, leads));
  } catch (error) {
    await failJob(env, "analysis", batch, error.message);
    throw error;
  }
  const updated = await supabaseFetch(env, "analysis_batches", { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { ai_response_id: started.id, ai_model: started.model, ai_status: started.status || "queued", ai_error: null } });
  return updated[0] || { ...batch, ai_response_id: started.id, ai_model: started.model, ai_status: started.status || "queued" };
}

async function startDiscovery(env, batch) {
  await supabaseFetch(env, "lead_discovery_batches", { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { status: "in_progress", ai_status: "starting", ai_error: null } });
  let started;
  try {
    started = await startResearchResponse(env, discoveryPrompt(batch));
  } catch (error) {
    await failJob(env, "discovery", batch, error.message);
    throw error;
  }
  const updated = await supabaseFetch(env, "lead_discovery_batches", { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { ai_response_id: started.id, ai_model: started.model, ai_status: started.status || "queued", ai_error: null } });
  return updated[0] || { ...batch, ai_response_id: started.id, ai_model: started.model, ai_status: started.status || "queued" };
}

async function failJob(env, kind, batch, message) {
  const table = kind === "analysis" ? "analysis_batches" : "lead_discovery_batches";
  await supabaseFetch(env, table, { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { status: "failed", ai_status: "failed", ai_error: String(message || "AI research failed.").slice(0, 1000), ...(kind === "analysis" ? { completed_at: new Date().toISOString() } : {}) } });
  if (kind === "analysis") {
    const leads = await supabaseFetch(env, "analysis_batch_leads", { search: { select: "lead_id", batch_id: `eq.${batch.id}`, status: "in.(awaiting_chatgpt,in_progress)", limit: "100" } });
    for (const row of leads) await callMcpTool(env, "update_analysis_status", { lead_id: row.lead_id, status: "failed", error_message: message, confirm: true }, INTERNAL_AUTH);
    if (leads.length) await supabaseFetch(env, "lead_analyses", { method: "PATCH", search: { lead_id: `in.(${leads.map((row) => row.lead_id).join(",")})` }, body: { research_source: "openai_api" } });
  }
}

async function applyAnalysis(env, batch, payload) {
  const queue = await supabaseFetch(env, "analysis_batch_leads", { search: { select: "lead_id", batch_id: `eq.${batch.id}`, limit: "100" } });
  const leadIds = queue.map((row) => row.lead_id);
  const normalized = validateAnalysisOutput(payload, leadIds);
  const byLead = new Map(normalized.map((item) => [item.leadId, item]));
  let completed = 0; let failed = 0;
  for (const leadId of leadIds) {
    const item = byLead.get(leadId);
    if (!item || item.issues.length) {
      const details = item?.issues?.join(", ") || "missing_analysis";
      await callMcpTool(env, "update_analysis_status", { lead_id: leadId, status: "failed", error_message: details, confirm: true }, INTERNAL_AUTH);
      failed += 1;
      continue;
    }
    const result = await callMcpTool(env, "save_lead_analysis", {
      lead_id: leadId,
      analysis: {
        lead_id: leadId,
        digital_maturity_score: item.digitalMaturityScore,
        opportunity_score: item.opportunityScore,
        sales_priority_score: item.salesPriorityScore,
        research_confidence: item.researchConfidence,
        current_situation: item.currentSituation,
        website_analysis: item.websiteAnalysis,
        landing_page_analysis: item.landingPageAnalysis,
        seo_analysis: item.seoAnalysis,
        geo_analysis: item.geoAnalysis,
        social_analysis: item.socialAnalysis,
        marketing_analysis: item.marketingAnalysis,
        crm_automation_analysis: item.crmAutomationAnalysis,
        score_explanations: item.scoreExplanations,
        weaknesses: item.weaknesses,
        opportunities: item.opportunities,
        recommended_services: item.recommendedServices,
        action_plan: item.actionPlan,
        sales_approach: item.salesApproach,
        evidence: item.evidence,
        report_markdown: item.reportMarkdown,
        researched_at: item.researchedAt,
      },
      confirm: true,
    }, INTERNAL_AUTH);
    if (result.isError) failed += 1;
    else {
      await supabaseFetch(env, "lead_analyses", { method: "PATCH", search: { lead_id: `eq.${leadId}` }, body: { research_source: "openai_api" } });
      completed += 1;
    }
  }
  const status = completed === leadIds.length ? "completed" : completed ? "partial" : "failed";
  const rows = await supabaseFetch(env, "analysis_batches", { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { status, ai_status: status, ai_error: failed ? `${failed} lead analyses failed validation.` : null, completed_leads: completed, failed_leads: failed, completed_at: new Date().toISOString() } });
  return publicJob("analysis", rows[0] || batch, { completed, failed, total: leadIds.length });
}

async function applyDiscovery(env, batch, payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates.slice(0, 100) : [];
  if (!candidates.length) throw new Error("The AI response did not include valid discovery candidates.");
  const result = await callMcpTool(env, "propose_new_leads", { batch_id: batch.id, category: batch.category || "", city: batch.city || "Casablanca", leads: candidates, confirm: true }, INTERNAL_AUTH);
  if (result.isError) throw new Error(result.structuredContent?.message || "Candidate validation failed.");
  const saved = Number(result.structuredContent?.saved_for_review || 0);
  const rows = await supabaseFetch(env, "lead_discovery_batches", { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { status: "ready_for_review", ai_status: "completed", ai_error: null, ai_result_count: saved } });
  return publicJob("discovery", rows[0] || batch, { saved });
}

async function pollJob(env, kind, batch) {
  if (!batch.ai_response_id) return publicJob(kind, batch);
  if (["completed", "partial", "failed"].includes(batch.ai_status)) return publicJob(kind, batch);
  const response = await retrieveResearchResponse(env, batch.ai_response_id);
  if (response.status === "completed") {
    try {
      const payload = parseJsonOutput(response);
      return kind === "analysis" ? await applyAnalysis(env, batch, payload) : await applyDiscovery(env, batch, payload);
    } catch (error) {
      await failJob(env, kind, batch, error.message);
      return publicJob(kind, { ...batch, ai_status: "failed", ai_error: error.message, status: "failed" });
    }
  }
  if (["failed", "cancelled", "incomplete"].includes(response.status)) {
    const message = response?.error?.message || response?.incomplete_details?.reason || `OpenAI response ${response.status}.`;
    await failJob(env, kind, batch, message);
    return publicJob(kind, { ...batch, ai_status: "failed", ai_error: message, status: "failed" });
  }
  const table = kind === "analysis" ? "analysis_batches" : "lead_discovery_batches";
  const rows = await supabaseFetch(env, table, { method: "PATCH", search: { id: `eq.${batch.id}` }, body: { ai_status: response.status || "in_progress" } });
  return publicJob(kind, rows[0] || { ...batch, ai_status: response.status || "in_progress" });
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "POST"]);
  if (guard) return guard;
  try {
    let kind; let batchId;
    if (context.request.method === "POST") {
      const parsed = await readJsonBody(context.request, 20_000);
      if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
      kind = safeKind(parsed.body?.kind); batchId = String(parsed.body?.batchId || "");
    } else {
      const url = new URL(context.request.url);
      kind = safeKind(url.searchParams.get("kind")); batchId = String(url.searchParams.get("batchId") || "");
    }
    if (!kind || !UUID_PATTERN.test(batchId)) return json({ ok: false, message: "A valid job type and batch ID are required." }, 400);
    const batch = await findBatch(context.env, kind, batchId);
    if (!batch) return json({ ok: false, message: "Research batch not found." }, 404);
    if (context.request.method === "POST") {
      if (batch.ai_response_id && batch.ai_status !== "failed") return json({ ok: true, job: publicJob(kind, batch) });
      const started = kind === "analysis" ? await startAnalysis(context.env, batch) : await startDiscovery(context.env, batch);
      return json({ ok: true, job: publicJob(kind, started) }, 202);
    }
    return json({ ok: true, job: await pollJob(context.env, kind, batch) });
  } catch (error) {
    const message = String(error?.message || "AI automation failed.").slice(0, 500);
    const status = message.includes("not configured") ? 503 : Number(error?.status) >= 400 && Number(error?.status) < 500 ? Number(error.status) : 502;
    return json({ ok: false, message }, status);
  }
}
