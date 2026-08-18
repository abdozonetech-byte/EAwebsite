import { LEAD_STATUSES, cleanString, leadInsertPayload, mapLead, requireCrmApi } from "../../_lib/crm-api.js";
import { json, readJsonBody } from "../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../_lib/supabase.js";

function searchTerm(value) {
  return cleanString(value, 120)?.replace(/[*,()]/g, " ").replace(/\s+/g, " ") || "";
}

async function getLeads(context) {
  const url = new URL(context.request.url);
  const status = cleanString(url.searchParams.get("status"), 40);
  const sector = cleanString(url.searchParams.get("sector"), 160);
  const source = cleanString(url.searchParams.get("source"), 80);
  const query = searchTerm(url.searchParams.get("search"));
  const search = { select: "*", order: "created_at.desc" };
  if (status && status !== "all" && LEAD_STATUSES.has(status)) search.status = `eq.${status}`;
  if (sector && sector !== "all") search.business_sector = `eq.${sector}`;
  if (source && source !== "all") search.source = `eq.${source}`;
  if (query) {
    const pattern = `*${query}*`;
    search.or = `(full_name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern},company_name.ilike.${pattern},city.ilike.${pattern},business_sector.ilike.${pattern},source.ilike.${pattern})`;
  }
  const rows = await supabaseFetch(context.env, "leads", { search });
  return json({ ok: true, leads: rows.map(mapLead) });
}

async function postLead(context) {
  const parsed = await readJsonBody(context.request);
  if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
  const payload = leadInsertPayload(parsed.body);
  if (payload.error) return json({ ok: false, message: payload.error }, 400);
  const rows = await supabaseFetch(context.env, "leads", { method: "POST", body: payload.data });
  return json({ ok: true, lead: mapLead(rows[0]) }, 201);
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "POST"]);
  if (guard) return guard;
  try {
    if (context.request.method === "GET") return getLeads(context);
    return postLead(context);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
