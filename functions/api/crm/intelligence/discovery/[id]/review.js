import { requireCrmApi } from "../../../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../../../_lib/http.js";
import { analyzeImportRows, toLeadInsert } from "../../../../../_lib/lead-import.js";
import { supabaseErrorResponse, supabaseFetch, supabaseFetchAll } from "../../../../../_lib/supabase.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function candidateRow(row) {
  return { fullName: row.business_name, company: row.business_name, phone: row.public_phone, email: row.public_email, website: row.website, city: row.city, businessSector: row.category || "Autre", source: "chatgpt_mcp_discovery", status: "new", priority: "medium", message: `${row.evidence_note || ""}${row.source_url ? `\nResearch source: ${row.source_url}` : ""}`.trim(), candidateId: row.id };
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["POST"]); if (guard) return guard;
  try {
    const parsed = await readJsonBody(context.request, 100000); if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
    const selectedIds = [...new Set((Array.isArray(parsed.body?.candidateIds) ? parsed.body.candidateIds : []).filter((id) => UUID_PATTERN.test(id)))].slice(0, 100);
    if (!selectedIds.length) return json({ ok: false, message: "Select at least one candidate." }, 400);
    const [candidates, existing] = await Promise.all([
      supabaseFetch(context.env, "lead_discovery_candidates", { search: { select: "*", discovery_batch_id: `eq.${context.params.id}`, id: `in.(${selectedIds.join(",")})`, review_status: "eq.pending", limit: "100" } }),
      supabaseFetchAll(context.env, "leads", { search: { select: "id,full_name,company_name,phone,email,city,landing_page_url,status,priority,source,business_sector,message", order: "created_at.desc" } }, 1000, 20000),
    ]);
    const byCandidate = new Map(candidates.map((row) => [row.id, row]));
    const prepared = candidates.map(candidate => ({ ...candidateRow(candidate), country: candidate.country || "" }));
    const analyzed = analyzeImportRows(prepared, existing).map((row) => ({ ...row, candidateId: prepared[row.index]?.candidateId }));
    const summary = { total: analyzed.length, ready: analyzed.filter((row) => row.disposition === "ready").length, duplicates: analyzed.filter((row) => row.disposition === "duplicate").length, invalid: analyzed.filter((row) => row.disposition === "invalid").length };
    const confirmation = `DISCOVERY_${context.params.id}_${summary.total}_${summary.ready}_${summary.duplicates}_${summary.invalid}`;
    if (parsed.body?.mode !== "commit") return json({ ok: true, confirmation, summary, rows: analyzed.map((row) => ({ candidateId: row.candidateId, fullName: row.fullName, city: row.city, country: row.country, website: row.website, disposition: row.disposition, duplicate: row.duplicate, issues: row.issues })) });
    if (parsed.body?.confirmation !== confirmation) return json({ ok: false, message: "Review changed. Preview again before saving." }, 409);
    let inserted = 0; let duplicates = 0; let rejected = 0;
    for (const row of analyzed) {
      if (row.disposition === "ready") {
        const candidate = byCandidate.get(row.candidateId);
        const created = await supabaseFetch(context.env, "leads", { method: "POST", body: { ...toLeadInsert(row), country: candidate?.country || null } });
        await supabaseFetch(context.env, "lead_discovery_candidates", { method: "PATCH", search: { id: `eq.${row.candidateId}` }, body: { review_status: "approved", matched_lead_id: created[0]?.id || null, reviewed_at: new Date().toISOString() } });
        inserted += 1;
      } else if (row.disposition === "duplicate") {
        await supabaseFetch(context.env, "lead_discovery_candidates", { method: "PATCH", search: { id: `eq.${row.candidateId}` }, body: { review_status: "duplicate", matched_lead_id: row.duplicate?.id || null, reviewed_at: new Date().toISOString() } });
        duplicates += 1;
      } else {
        await supabaseFetch(context.env, "lead_discovery_candidates", { method: "PATCH", search: { id: `eq.${row.candidateId}` }, body: { review_status: "rejected", reviewed_at: new Date().toISOString() } });
        rejected += 1;
      }
    }
    const pending = await supabaseFetch(context.env, "lead_discovery_candidates", { search: { select: "id", discovery_batch_id: `eq.${context.params.id}`, review_status: "eq.pending", limit: "1" } });
    if (!pending.length) await supabaseFetch(context.env, "lead_discovery_batches", { method: "PATCH", search: { id: `eq.${context.params.id}` }, body: { status: "completed" } });
    return json({ ok: true, result: { inserted, duplicates, rejected } }, 201);
  } catch (error) { return supabaseErrorResponse(error); }
}
