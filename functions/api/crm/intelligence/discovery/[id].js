import { requireCrmApi } from "../../../../_lib/crm-api.js";
import { json } from "../../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    const [batches, candidates] = await Promise.all([
      supabaseFetch(context.env, "lead_discovery_batches", { search: { select: "*", id: `eq.${context.params.id}`, limit: "1" } }),
      supabaseFetch(context.env, "lead_discovery_candidates", { search: { select: "*", discovery_batch_id: `eq.${context.params.id}`, order: "created_at.asc", limit: "500" } }),
    ]);
    if (!batches.length) return json({ ok: false, message: "Discovery batch not found." }, 404);
    const batch = batches[0];
    return json({ ok: true, batch: { id: batch.id, code: batch.batch_code, category: batch.category || "", city: batch.city, keywords: batch.keywords || "", businessType: batch.business_type || "", status: batch.status, createdAt: batch.created_at }, candidates: candidates.map((row) => ({ id: row.id, businessName: row.business_name, category: row.category || "", city: row.city || "", website: row.website || "", phone: row.public_phone || "", email: row.public_email || "", sourceUrl: row.source_url, evidenceNote: row.evidence_note || "", reviewStatus: row.review_status, matchedLeadId: row.matched_lead_id || "" })) });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
