import { cleanIntelligenceText } from "../../../_lib/lead-intelligence.js";
import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch, supabaseFetchAll } from "../../../_lib/supabase.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BATCH_SIZE = 500;

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const suffix = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `EA-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${suffix}`;
}

async function resolveLeadIds(env, body) {
  const scope = new Set(["one", "selected", "all", "category"]).has(body?.scope) ? body.scope : "selected";
  const search = { select: "id", order: "created_at.desc" };
  if (scope === "one" || scope === "selected") {
    const ids = [...new Set((Array.isArray(body?.leadIds) ? body.leadIds : [])
      .map((value) => cleanIntelligenceText(value, 80))
      .filter((value) => UUID_PATTERN.test(value)))];
    if (!ids.length) return [];
    search.id = `in.(${ids.slice(0, MAX_BATCH_SIZE).join(",")})`;
  }
  if (scope === "category") {
    const category = cleanIntelligenceText(body?.category, 160);
    if (!category) return [];
    search.business_sector = `eq.${category}`;
  }
  const rows = await supabaseFetchAll(env, "leads", { search }, 1000, MAX_BATCH_SIZE + 1);
  return rows.slice(0, MAX_BATCH_SIZE).map((row) => row.id);
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["POST"]);
  if (guard) return guard;
  try {
    const parsed = await readJsonBody(context.request, 100000);
    if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
    const leadIds = await resolveLeadIds(context.env, parsed.body);
    if (!leadIds.length) return json({ ok: false, message: "No matching leads were found." }, 400);
    const instructions = cleanIntelligenceText(parsed.body?.instructions, 4000) ||
      "Analyze the queued leads with public, verifiable sources. Mark unknown facts UNKNOWN and save evidence URLs.";
    const rows = await supabaseFetch(context.env, "rpc/prepare_analysis_batch", {
      method: "POST",
      body: { p_batch_code: randomCode(), p_lead_ids: leadIds, p_created_by: "crm", p_instructions: instructions },
    });
    const batch = Array.isArray(rows) ? rows[0] : rows;
    return json({
      ok: true,
      batch: { id: batch?.id, code: batch?.batch_code, status: batch?.status || "queued", totalLeads: Number(batch?.total_leads || leadIds.length) },
    }, 201);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
