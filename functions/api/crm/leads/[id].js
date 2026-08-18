import { leadUpdatePayload, mapAppointment, mapLead, mapNote, requireCrmApi } from "../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../../_lib/supabase.js";

async function getLeadDetails(context) {
  const id = context.params.id;
  const [leadRows, noteRows, appointmentRows] = await Promise.all([
    supabaseFetch(context.env, "leads", { search: { select: "*", id: `eq.${id}`, limit: "1" } }),
    supabaseFetch(context.env, "lead_notes", { search: { select: "*", lead_id: `eq.${id}`, order: "created_at.desc" } }),
    supabaseFetch(context.env, "appointments", { search: { select: "*,leads(*)", lead_id: `eq.${id}`, order: "starts_at.desc" } }),
  ]);
  if (!leadRows.length) return json({ ok: false, message: "Lead not found." }, 404);
  return json({ ok: true, lead: mapLead(leadRows[0]), notes: noteRows.map(mapNote), appointments: appointmentRows.map(mapAppointment) });
}

async function patchLead(context) {
  const parsed = await readJsonBody(context.request);
  if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
  const payload = leadUpdatePayload(parsed.body);
  if (payload.error) return json({ ok: false, message: payload.error }, 400);
  const rows = await supabaseFetch(context.env, "leads", { method: "PATCH", search: { id: `eq.${context.params.id}` }, body: payload.data });
  if (!rows.length) return json({ ok: false, message: "Lead not found." }, 404);
  return json({ ok: true, lead: mapLead(rows[0]) });
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET", "PATCH"]);
  if (guard) return guard;
  try {
    if (context.request.method === "GET") return getLeadDetails(context);
    return patchLead(context);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
