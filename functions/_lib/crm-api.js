import { hasValidCrmSession } from "./auth.js";
import { json, methodNotAllowed, sameOrigin } from "./http.js";

const LEAD_STATUSES = new Set(["new", "contacted", "follow_up", "appointment", "no_show", "won", "not_interested"]);
const PRIORITIES = new Set(["low", "medium", "high"]);
const APPOINTMENT_STATUSES = new Set(["scheduled", "completed", "no_show", "cancelled"]);

async function requireCrmApi(context, methods) {
  if (!methods.includes(context.request.method)) return methodNotAllowed(methods);
  if (!["GET", "HEAD"].includes(context.request.method) && !sameOrigin(context.request)) {
    return json({ ok: false, message: "Unauthorized." }, 401);
  }
  if (!(await hasValidCrmSession(context.request, context.env))) {
    return json({ ok: false, message: "Unauthorized." }, 401);
  }
  return null;
}

function cleanString(value, max = 1000) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, max) : null;
}

function mapLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone || "",
    email: row.email || "",
    company: row.company_name || "",
    businessSector: row.business_sector || "",
    city: row.city || "",
    source: row.source || "manual",
    status: row.status || "new",
    priority: row.priority || "medium",
    message: row.message || "",
    nextFollowUpAt: row.next_follow_up_at || "",
    utmSource: row.utm_source || "",
    utmMedium: row.utm_medium || "",
    utmCampaign: row.utm_campaign || "",
    utmContent: row.utm_content || "",
    utmTerm: row.utm_term || "",
    fbclid: row.fbclid || "",
    gclid: row.gclid || "",
    referrer: row.referrer || "",
    landingPageUrl: row.landing_page_url || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNote(row) {
  if (!row) return null;
  return { id: row.id, leadId: row.lead_id, body: row.body, createdAt: row.created_at };
}

function mapAppointment(row) {
  if (!row) return null;
  const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
  return {
    id: row.id,
    leadId: row.lead_id || "",
    title: row.title || "",
    startsAt: row.starts_at,
    status: row.status || "scheduled",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lead: lead ? mapLead(lead) : null,
  };
}

function leadInsertPayload(body) {
  const fullName = cleanString(body?.fullName, 120);
  if (!fullName) return { error: "Invalid body." };
  const status = cleanString(body?.status, 40) || "new";
  const priority = cleanString(body?.priority, 40) || "medium";
  if (!LEAD_STATUSES.has(status) || !PRIORITIES.has(priority)) return { error: "Invalid body." };
  return {
    data: {
      full_name: fullName,
      phone: cleanString(body?.phone, 40),
      email: cleanString(body?.email, 160),
      company_name: cleanString(body?.company, 160),
      business_sector: cleanString(body?.businessSector, 160),
      city: cleanString(body?.city, 100),
      source: cleanString(body?.source, 80) || "manual",
      status,
      priority,
      message: cleanString(body?.message, 4000),
      next_follow_up_at: cleanString(body?.nextFollowUpAt, 80),
      utm_source: cleanString(body?.utmSource, 200),
      utm_medium: cleanString(body?.utmMedium, 200),
      utm_campaign: cleanString(body?.utmCampaign, 200),
      utm_content: cleanString(body?.utmContent, 200),
      utm_term: cleanString(body?.utmTerm, 200),
      fbclid: cleanString(body?.fbclid, 500),
      gclid: cleanString(body?.gclid, 500),
      referrer: cleanString(body?.referrer, 1000),
      landing_page_url: cleanString(body?.landingPageUrl, 1000),
    },
  };
}

function leadUpdatePayload(body) {
  const fields = {
    fullName: ["full_name", 120],
    phone: ["phone", 40],
    email: ["email", 160],
    company: ["company_name", 160],
    businessSector: ["business_sector", 160],
    city: ["city", 100],
    source: ["source", 80],
    message: ["message", 4000],
    nextFollowUpAt: ["next_follow_up_at", 80],
  };
  const data = {};
  for (const [source, [target, max]] of Object.entries(fields)) {
    if (Object.prototype.hasOwnProperty.call(body || {}, source)) data[target] = cleanString(body[source], max);
  }
  if (Object.prototype.hasOwnProperty.call(body || {}, "status")) {
    const status = cleanString(body.status, 40);
    if (!LEAD_STATUSES.has(status)) return { error: "Invalid body." };
    data.status = status;
  }
  if (Object.prototype.hasOwnProperty.call(body || {}, "priority")) {
    const priority = cleanString(body.priority, 40);
    if (!PRIORITIES.has(priority)) return { error: "Invalid body." };
    data.priority = priority;
  }
  if (!Object.keys(data).length) return { error: "Invalid body." };
  return { data };
}

function appointmentInsertPayload(body) {
  const startsAt = cleanString(body?.startsAt, 80);
  if (!startsAt || Number.isNaN(new Date(startsAt).getTime())) return { error: "Invalid body." };
  const status = cleanString(body?.status, 40) || "scheduled";
  if (!APPOINTMENT_STATUSES.has(status)) return { error: "Invalid body." };
  return {
    data: {
      lead_id: cleanString(body?.leadId, 80),
      title: cleanString(body?.title, 160),
      starts_at: new Date(startsAt).toISOString(),
      status,
      notes: cleanString(body?.notes, 1000),
    },
  };
}

function appointmentUpdatePayload(body) {
  const data = {};
  if (Object.prototype.hasOwnProperty.call(body || {}, "leadId")) data.lead_id = cleanString(body.leadId, 80);
  if (Object.prototype.hasOwnProperty.call(body || {}, "title")) data.title = cleanString(body.title, 160);
  if (Object.prototype.hasOwnProperty.call(body || {}, "notes")) data.notes = cleanString(body.notes, 1000);
  if (Object.prototype.hasOwnProperty.call(body || {}, "startsAt")) {
    const startsAt = cleanString(body.startsAt, 80);
    if (!startsAt || Number.isNaN(new Date(startsAt).getTime())) return { error: "Invalid body." };
    data.starts_at = new Date(startsAt).toISOString();
  }
  if (Object.prototype.hasOwnProperty.call(body || {}, "status")) {
    const status = cleanString(body.status, 40);
    if (!APPOINTMENT_STATUSES.has(status)) return { error: "Invalid body." };
    data.status = status;
  }
  if (!Object.keys(data).length) return { error: "Invalid body." };
  return { data };
}

export {
  APPOINTMENT_STATUSES,
  LEAD_STATUSES,
  PRIORITIES,
  appointmentInsertPayload,
  appointmentUpdatePayload,
  cleanString,
  leadInsertPayload,
  leadUpdatePayload,
  mapAppointment,
  mapLead,
  mapNote,
  requireCrmApi,
};
