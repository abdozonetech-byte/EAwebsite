import { requireCrmApi } from "../../_lib/crm-api.js";
import { json } from "../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    await supabaseFetch(context.env, "leads", { search: { select: "id", limit: "1" } });
    return json({ ok: true, status: "connected" });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
