import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetchPage } from "../../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    const url = new URL(context.request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.max(5, Math.min(50, Number.parseInt(url.searchParams.get("pageSize") || "10", 10) || 10));
    const { rows, total } = await supabaseFetchPage(context.env, "analysis_batches", {
      search: { select: "*", order: "created_at.desc" },
    }, (page - 1) * pageSize, pageSize);
    return json({ ok: true, batches: rows.map((row) => ({
      id: row.id, code: row.batch_code, status: row.status, totalLeads: row.total_leads,
      completedLeads: row.completed_leads, failedLeads: row.failed_leads, createdAt: row.created_at,
    })), pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) } });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
