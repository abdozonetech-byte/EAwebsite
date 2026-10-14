const MAX_IMPORT_ROWS = 5000;
const IMPORT_SOURCE = "casablanca_aesthetic_research";

function cleanImportText(value, max = 1000) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeImportPhone(value) {
  let digits = cleanImportText(value, 80).replace(/\D/g, "");
  if (digits.startsWith("00212")) digits = digits.slice(2);
  if (digits.startsWith("2120")) digits = `212${digits.slice(4)}`;
  if (digits.startsWith("0") && digits.length === 10) digits = `212${digits.slice(1)}`;
  return digits;
}

function normalizeImportEmail(value) {
  return cleanImportText(value, 160).toLowerCase();
}

function normalizeImportUrl(value) {
  const raw = cleanImportText(value, 1000);
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol)) return "";
    url.hash = "";
    return url.toString().slice(0, 1000);
  } catch {
    return "";
  }
}

function normalizeDomain(value) {
  const normalized = normalizeImportUrl(value);
  if (!normalized) return "";
  try { return new URL(normalized).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

function normalizeBusiness(value) {
  return cleanImportText(value, 200).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidMoroccanPhone(value) {
  return !value || /^212[5-7]\d{8}$/.test(value);
}

function normalizeImportRow(row, index = 0) {
  const fullName = cleanImportText(row?.fullName || row?.company, 120);
  const company = cleanImportText(row?.company, 160);
  const phone = normalizeImportPhone(row?.phone);
  const email = normalizeImportEmail(row?.email);
  const website = normalizeImportUrl(row?.website || row?.landingPageUrl);
  const city = cleanImportText(row?.city || "Casablanca", 100);
  const businessSector = cleanImportText(row?.businessSector || "Santé / Cabinet médical", 160);
  const status = cleanImportText(row?.status || "new", 40);
  const priority = cleanImportText(row?.priority || "medium", 40);
  const source = cleanImportText(row?.source || IMPORT_SOURCE, 80);
  const message = cleanImportText(row?.message, 4000);
  const issues = [];
  if (fullName.length < 2) issues.push("missing_name");
  if (!phone && !email && !website) issues.push("missing_contact");
  if (!isValidMoroccanPhone(phone)) issues.push("invalid_phone");
  if (!isValidEmail(email)) issues.push("invalid_email");
  if ((row?.website || row?.landingPageUrl) && !website) issues.push("invalid_website");
  if (!new Set(["new", "contacted", "follow_up", "appointment", "no_show", "won", "not_interested"]).has(status)) issues.push("invalid_status");
  if (!new Set(["low", "medium", "high"]).has(priority)) issues.push("invalid_priority");
  return {
    index,
    fullName,
    company,
    phone,
    email,
    website,
    city,
    businessSector,
    status,
    priority,
    source,
    message,
    issues,
  };
}

function duplicateKeys(row) {
  const business = normalizeBusiness(row.company || row.fullName);
  const city = normalizeBusiness(row.city);
  return [
    row.phone ? ["phone", row.phone] : null,
    row.email ? ["email", row.email.toLowerCase()] : null,
    row.website ? ["domain", normalizeDomain(row.website)] : null,
    business && city ? ["business_city", `${business}|${city}`] : null,
  ].filter((entry) => entry && entry[1]);
}

function existingLeadIndex(leads) {
  const index = new Map();
  for (const lead of leads || []) {
    const normalized = normalizeImportRow({
      fullName: lead.full_name || lead.fullName,
      company: lead.company_name || lead.company,
      phone: lead.phone,
      email: lead.email,
      website: lead.landing_page_url || lead.landingPageUrl,
      city: lead.city,
      businessSector: lead.business_sector || lead.businessSector,
      status: lead.status || "new",
      priority: lead.priority || "medium",
      source: lead.source || "manual",
      message: lead.message,
    });
    for (const [type, value] of duplicateKeys(normalized)) {
      const key = `${type}:${value}`;
      if (!index.has(key)) index.set(key, { id: lead.id, fullName: normalized.fullName, type });
    }
  }
  return index;
}

function analyzeImportRows(rows, existingLeads = []) {
  const existing = existingLeadIndex(existingLeads);
  const inFile = new Map();
  const analyzed = [];
  for (let index = 0; index < rows.length; index += 1) {
    const normalized = normalizeImportRow(rows[index], index);
    let duplicate = null;
    for (const [type, value] of duplicateKeys(normalized)) {
      const key = `${type}:${value}`;
      if (existing.has(key)) { duplicate = { ...existing.get(key), matchedBy: type, scope: "crm" }; break; }
      if (inFile.has(key)) { duplicate = { id: null, fullName: inFile.get(key), matchedBy: type, scope: "file" }; break; }
    }
    if (!normalized.issues.length) {
      for (const [type, value] of duplicateKeys(normalized)) {
        const key = `${type}:${value}`;
        if (!inFile.has(key)) inFile.set(key, normalized.fullName);
      }
    }
    analyzed.push({ ...normalized, duplicate, disposition: normalized.issues.length ? "invalid" : duplicate ? "duplicate" : "ready" });
  }
  return analyzed;
}

function toLeadInsert(row) {
  return {
    full_name: row.fullName,
    phone: row.phone || null,
    email: row.email || null,
    company_name: row.company || null,
    business_sector: row.businessSector || null,
    city: row.city || null,
    source: row.source || IMPORT_SOURCE,
    status: row.status || "new",
    priority: row.priority || "medium",
    message: row.message || null,
    landing_page_url: row.website || null,
  };
}

function toLeadUpdate(row) {
  const data = toLeadInsert(row);
  delete data.source;
  delete data.status;
  delete data.priority;
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== null && value !== ""));
}

export {
  IMPORT_SOURCE,
  MAX_IMPORT_ROWS,
  analyzeImportRows,
  cleanImportText,
  duplicateKeys,
  isValidEmail,
  isValidMoroccanPhone,
  normalizeDomain,
  normalizeImportEmail,
  normalizeImportPhone,
  normalizeImportRow,
  normalizeImportUrl,
  toLeadInsert,
  toLeadUpdate,
};
