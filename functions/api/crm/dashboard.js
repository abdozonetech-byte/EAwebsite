import { mapAppointment, mapLead, requireCrmApi } from "../../_lib/crm-api.js";
import { json } from "../../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../../_lib/supabase.js";

function dayKey(date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["GET"]);
  if (guard) return guard;
  try {
    const [leadRows, appointmentRows] = await Promise.all([
      supabaseFetch(context.env, "leads", { search: { select: "*", order: "created_at.desc" } }),
      supabaseFetch(context.env, "appointments", { search: { select: "*,leads(*)", order: "starts_at.asc" } }),
    ]);
    const leads = leadRows.map(mapLead);
    const appointments = appointmentRows.map(mapAppointment);
    const today = dayKey(new Date());
    const metrics = {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      followUp: leads.filter((lead) => lead.status === "follow_up").length,
      appointment: leads.filter((lead) => lead.status === "appointment").length,
      noShow: leads.filter((lead) => lead.status === "no_show").length,
      won: leads.filter((lead) => lead.status === "won").length,
      notInterested: leads.filter((lead) => lead.status === "not_interested").length,
      today: appointments.filter((item) => item.status === "scheduled" && dayKey(item.startsAt) === today).length,
    };
    const attention = leads
      .filter((lead) => lead.status === "new" || lead.status === "follow_up" || lead.priority === "high")
      .sort((a, b) => (a.priority === "high" ? -1 : 0) - (b.priority === "high" ? -1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
    const upcoming = appointments.filter((item) => item.status === "scheduled" && new Date(item.startsAt) >= new Date(Date.now() - 86400000)).slice(0, 3);
    return json({ ok: true, metrics, attention, upcoming, recent: leads.slice(0, 5) });
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
