import { cleanDiscoveryCriteria } from "../../../_lib/discovery-location.js";
import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch, supabaseFetchPage } from "../../../_lib/supabase.js";

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `DISC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "POST"]);
  if (guard) return guard;
  try {
    if (context.request.method === "GET") {
      const url = new URL(context.request.url);
      const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
      const pageSize = 10;
      const { rows, total } = await supabaseFetchPage(context.env, "lead_discovery_batches", {
        search: { select: "*", order: "created_at.desc" },
      }, (page - 1) * pageSize, pageSize);
      return json({ ok: true, batches: rows.map((row) => ({ id: row.id, code: row.batch_code, category: row.category || "", city: row.city, country: row.country || "", locality: row.locality || "", keywords: row.keywords || "", businessType: row.business_type || "", status: row.status, createdAt: row.created_at })), pagination: { page, pageSize, total } });
    }
    const parsed = await readJsonBody(context.request, 50000);
    if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
    if (parsed.body?.confirmAi !== "on" && parsed.body?.confirmAi !== true) return json({ ok: false, message: "Confirm API credit usage before creating an AI discovery batch." }, 400);
    let criteria;
    try { criteria = cleanDiscoveryCriteria(parsed.body); }
    catch (error) { return json({ ok: false, message: error.message }, 400); }
    if (!criteria.city || (!criteria.category && !criteria.keywords && !criteria.businessType)) return json({ ok: false, message: "Add a city and at least one search criterion." }, 400);
    const rows = await supabaseFetch(context.env, "lead_discovery_batches", {
      method: "POST",
      body: { batch_code: randomCode(), category: criteria.category || null, city: criteria.city, country: criteria.country, locality: criteria.locality || null, keywords: criteria.keywords || null, business_type: criteria.businessType || null },
    });
    const row = rows[0];
    return json({ ok: true, batch: { id: row.id, code: row.batch_code, status: row.status, ...criteria } }, 201);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
