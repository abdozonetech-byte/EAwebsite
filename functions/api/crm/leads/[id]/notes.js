import { cleanString, mapNote, requireCrmApi } from "../../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../../../_lib/supabase.js";

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["POST"]);
  if (guard) return guard;
  try {
    const parsed = await readJsonBody(context.request);
    if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
    const body = cleanString(parsed.body?.body, 1000);
    if (!body) return json({ ok: false, message: "Invalid body." }, 400);
    const rows = await supabaseFetch(context.env, "lead_notes", { method: "POST", body: { lead_id: context.params.id, body } });
    return json({ ok: true, note: mapNote(rows[0]) }, 201);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
