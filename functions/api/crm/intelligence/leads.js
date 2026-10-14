import { ANALYSIS_STATUSES, cleanIntelligenceText, mapIntelligenceRow } from "../../../_lib/lead-intelligence.js";
import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetchAll, supabaseFetchPage } from "../../../_lib/supabase.js";

function searchTerm(value) {
  return cleanIntelligenceText(value, 120).replace(/[*,()]/g, " ").replace(/\s+/g, " ");
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    const url = new URL(context.request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.max(10, Math.min(100, Number.parseInt(url.searchParams.get("pageSize") || "25", 10) || 25));
    const analysisStatus = cleanIntelligenceText(url.searchParams.get("analysisStatus"), 40);
    const category = cleanIntelligenceText(url.searchParams.get("category"), 160);
    const query = searchTerm(url.searchParams.get("search"));
    const sort = cleanIntelligenceText(url.searchParams.get("sort"), 40);
    const minOpportunity = Number.parseInt(url.searchParams.get("minOpportunityScore") || "", 10);
    const search = { select: "*", order: sort === "opportunity_desc" ? "opportunity_score.desc.nullslast,created_at.desc" : sort === "recent_analysis" ? "analysis_updated_at.desc.nullslast" : "created_at.desc" };
    if (analysisStatus && analysisStatus !== "all" && ANALYSIS_STATUSES.has(analysisStatus)) search.analysis_status = `eq.${analysisStatus}`;
    if (category && category !== "all") search.business_sector = `eq.${category}`;
    if (Number.isFinite(minOpportunity) && minOpportunity >= 0 && minOpportunity <= 100) search.opportunity_score = `gte.${minOpportunity}`;
    if (query) {
      const pattern = `*${query}*`;
      search.or = `(full_name.ilike.${pattern},company_name.ilike.${pattern},city.ilike.${pattern},business_sector.ilike.${pattern})`;
    }
    const [{ rows, total }, statusRows] = await Promise.all([
      supabaseFetchPage(context.env, "lead_intelligence_overview", { search }, (page - 1) * pageSize, pageSize),
      supabaseFetchAll(context.env, "lead_intelligence_overview", { search: { select: "analysis_status,opportunity_score", order: "created_at.desc" } }, 1000, 20000),
    ]);
    const summary = { total: statusRows.length, notAnalyzed: 0, queued: 0, processing: 0, completed: 0, failed: 0, highOpportunity: 0 };
    for (const row of statusRows) {
      const status = ANALYSIS_STATUSES.has(row.analysis_status) ? row.analysis_status : "not_analyzed";
      if (status === "not_analyzed") summary.notAnalyzed += 1;
      else summary[status] += 1;
      if (Number(row.opportunity_score) >= 70) summary.highOpportunity += 1;
    }
    return json({ ok: true, leads: rows.map(mapIntelligenceRow), pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) }, summary });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
