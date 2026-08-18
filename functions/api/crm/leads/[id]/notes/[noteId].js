import { requireCrmApi } from "../../../../../_lib/crm-api.js";
import { json } from "../../../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../../../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["DELETE"]);
  if (guard) return guard;
  try {
    await supabaseFetch(context.env, "lead_notes", {
      method: "DELETE",
      search: { id: `eq.${context.params.noteId}`, lead_id: `eq.${context.params.id}` },
      headers: { Prefer: "return=minimal" },
    });
    return json({ ok: true });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
