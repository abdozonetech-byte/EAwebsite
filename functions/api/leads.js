import { cleanString } from "../_lib/crm-api.js";
import { json, readJsonBody } from "../_lib/http.js";
import { supabaseErrorResponse, supabaseFetch } from "../_lib/supabase.js";

const SECTORS = new Set([
  "Santé / Cabinet médical",
  "Éducation / Formation",
  "E-commerce / Vente en ligne",
  "Immobilier",
  "Services locaux",
  "Restaurant / Café",
  "Application / Startup",
  "Marque personnelle",
  "Autre",
]);

function isSameSiteRequest(request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (origin) return origin === requestOrigin;
  const referer = request.headers.get("Referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === requestOrigin;
  } catch {
    return false;
  }
}

function cleanUrl(value, max = 1000) {
  const cleaned = cleanString(value, max);
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString().slice(0, max);
  } catch {
    return null;
  }
}

function leadPayload(body) {
  const fullName = cleanString(body?.fullName, 120);
  const phone = String(body?.phone || "").replace(/\D/g, "");
  const email = cleanString(body?.email, 160);
  const businessSector = cleanString(body?.businessSector, 160);

  if (!fullName || fullName.length < 2 || /^\d+$/.test(fullName)) return { error: "Invalid name." };
  if (!/^212[67]\d{8}$/.test(phone)) return { error: "Invalid phone number." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Invalid email address." };
  if (!SECTORS.has(businessSector)) return { error: "Invalid business sector." };

  return {
    data: {
      full_name: fullName,
      phone,
      email,
      business_sector: businessSector,
      source: "diagnostic_site",
      status: "new",
      priority: "medium",
      message: cleanString(body?.message, 4000),
      utm_source: cleanString(body?.utmSource, 200) || cleanString(body?.acquisitionSource, 200),
      utm_medium: cleanString(body?.utmMedium, 200),
      utm_campaign: cleanString(body?.utmCampaign, 200),
      utm_content: cleanString(body?.utmContent, 200),
      utm_term: cleanString(body?.utmTerm, 200),
      fbclid: cleanString(body?.fbclid, 500),
      gclid: cleanString(body?.gclid, 500),
      referrer: cleanUrl(body?.referrer),
      landing_page_url: cleanUrl(body?.landingPageUrl),
    },
  };
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405, { Allow: "POST" });
  }
  if (!isSameSiteRequest(context.request)) return json({ ok: false, message: "Invalid request." }, 403);

  try {
    const parsed = await readJsonBody(context.request, 16000);
    if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
    if (cleanString(parsed.body?.contactUrlCheck, 200)) return json({ ok: true }, 202);

    const payload = leadPayload(parsed.body);
    if (payload.error) return json({ ok: false, message: payload.error }, 400);

    const duplicateCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const duplicates = await supabaseFetch(context.env, "leads", {
      search: {
        select: "id,created_at",
        phone: `eq.${payload.data.phone}`,
        source: "eq.diagnostic_site",
        created_at: `gte.${duplicateCutoff}`,
        limit: "1",
      },
    });
    if (duplicates.length) return json({ ok: true, duplicate: true }, 200);

    await supabaseFetch(context.env, "leads", { method: "POST", body: payload.data });
    return json({ ok: true }, 201);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}

export { isSameSiteRequest, leadPayload };
