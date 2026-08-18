import { appointmentUpdatePayload, mapAppointment, requireCrmApi } from "../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../../_lib/supabase.js";

async function patchAppointment(context) {
  const parsed = await readJsonBody(context.request);
  if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
  const payload = appointmentUpdatePayload(parsed.body);
  if (payload.error) return json({ ok: false, message: payload.error }, 400);
  const rows = await supabaseFetch(context.env, "appointments", { method: "PATCH", search: { id: `eq.${context.params.id}` }, body: payload.data });
  if (!rows.length) return json({ ok: false, message: "Appointment not found." }, 404);
  return json({ ok: true, appointment: mapAppointment(rows[0]) });
}

async function deleteAppointment(context) {
  await supabaseFetch(context.env, "appointments", {
    method: "DELETE",
    search: { id: `eq.${context.params.id}` },
    headers: { Prefer: "return=minimal" },
  });
  return json({ ok: true });
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["PATCH", "DELETE"]);
  if (guard) return guard;
  try {
    if (context.request.method === "PATCH") return patchAppointment(context);
    return deleteAppointment(context);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
