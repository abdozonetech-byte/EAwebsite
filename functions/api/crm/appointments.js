import { appointmentInsertPayload, mapAppointment, requireCrmApi } from "../../_lib/crm-api.js";
import { json, readJsonBody } from "../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../_lib/supabase.js";

async function getAppointments(context) {
  const rows = await supabaseFetch(context.env, "appointments", { search: { select: "*,leads(*)", order: "starts_at.asc" } });
  return json({ ok: true, appointments: rows.map(mapAppointment) });
}

async function postAppointment(context) {
  const parsed = await readJsonBody(context.request);
  if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
  const payload = appointmentInsertPayload(parsed.body);
  if (payload.error) return json({ ok: false, message: payload.error }, 400);
  const rows = await supabaseFetch(context.env, "appointments", { method: "POST", body: payload.data });
  if (payload.data.lead_id) {
    await supabaseFetch(context.env, "leads", { method: "PATCH", search: { id: `eq.${payload.data.lead_id}` }, body: { status: "appointment" }, prefer: "return=minimal" });
  }
  return json({ ok: true, appointment: mapAppointment(rows[0]) }, 201);
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "POST"]);
  if (guard) return guard;
  try {
    if (context.request.method === "GET") return getAppointments(context);
    return postAppointment(context);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
