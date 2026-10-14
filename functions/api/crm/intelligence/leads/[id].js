import { mapIntelligenceRow } from "../../../../_lib/lead-intelligence.js";
import { requireCrmApi } from "../../../../_lib/crm-api.js";
import { json } from "../../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    const rows = await supabaseFetch(context.env, "lead_intelligence_overview", {
      search: { select: "*", id: `eq.${context.params.id}`, limit: "1" },
    });
    if (!rows.length) return json({ ok: false, message: "Lead intelligence record not found." }, 404);
    return json({ ok: true, lead: mapIntelligenceRow(rows[0]) });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
