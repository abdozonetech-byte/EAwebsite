import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetchAll } from "../../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    const rows = await supabaseFetchAll(context.env, "leads", { search: { select: "business_sector", business_sector: "not.is.null", order: "business_sector.asc" } }, 1000, 20000);
    const categories = [...new Set(rows.map((row) => String(row.business_sector || "").trim()).filter(Boolean))];
    return json({ ok: true, categories });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
