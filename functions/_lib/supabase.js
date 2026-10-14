import { json } from "./http.js";

const CONFIG_MESSAGE = "CRM database is not configured.";
const UNAVAILABLE_MESSAGE = "Database unavailable.";

class SupabaseError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = "SupabaseError";
    this.status = status;
  }
}

function getSupabaseConfig(env) {
  const url = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new SupabaseError(CONFIG_MESSAGE, 503);
  return { url, key };
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    if (!response.ok) throw new SupabaseError(UNAVAILABLE_MESSAGE, 503);
    return text;
  }
}

async function supabaseFetch(env, path, options = {}) {
  const { url, key } = getSupabaseConfig(env);
  const endpoint = new URL(`${url}/rest/v1/${path.replace(/^\/+/, "")}`);
  if (options.search) {
    for (const [name, value] of Object.entries(options.search)) {
      if (value !== undefined && value !== null && value !== "") endpoint.searchParams.set(name, String(value));
    }
  }

  let response;
  try {
    response = await fetch(endpoint.toString(), {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        ...(options.body ? { "Content-Type": "application/json", Prefer: options.prefer || "return=representation" } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new SupabaseError(UNAVAILABLE_MESSAGE, 503);
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const status = response.status >= 500 ? 503 : response.status;
    const message = status === 503 ? UNAVAILABLE_MESSAGE : "Invalid CRM database request.";
    throw new SupabaseError(message, status);
  }
  return data;
}

async function supabaseFetchAll(env, path, options = {}, pageSize = 1000, maxRows = 10000) {
  const rows = [];
  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const page = await supabaseFetch(env, path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Range: `${offset}-${Math.min(offset + pageSize - 1, maxRows - 1)}`,
      },
    });
    if (!Array.isArray(page)) return page;
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

async function supabaseFetchPage(env, path, options = {}, offset = 0, limit = 25) {
  const { url, key } = getSupabaseConfig(env);
  const endpoint = new URL(`${url}/rest/v1/${path.replace(/^\/+/, "")}`);
  if (options.search) {
    for (const [name, value] of Object.entries(options.search)) {
      if (value !== undefined && value !== null && value !== "") endpoint.searchParams.set(name, String(value));
    }
  }
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 25)));
  let response;
  try {
    response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
        Range: `${safeOffset}-${safeOffset + safeLimit - 1}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new SupabaseError(UNAVAILABLE_MESSAGE, 503);
  }
  const data = await parseResponse(response);
  if (!response.ok) {
    const status = response.status >= 500 ? 503 : response.status;
    throw new SupabaseError(status === 503 ? UNAVAILABLE_MESSAGE : "Invalid CRM database request.", status);
  }
  const range = response.headers.get("Content-Range") || "";
  const totalPart = range.split("/")[1];
  const total = totalPart && totalPart !== "*" ? Number(totalPart) : Array.isArray(data) ? data.length : 0;
  return { rows: Array.isArray(data) ? data : [], total: Number.isFinite(total) ? total : 0 };
}

function supabaseErrorResponse(error) {
  if (error instanceof SupabaseError) return json({ ok: false, message: error.message }, error.status);
  return json({ ok: false, message: UNAVAILABLE_MESSAGE }, 503);
}

export { CONFIG_MESSAGE, SupabaseError, supabaseErrorResponse, supabaseFetch, supabaseFetchAll, supabaseFetchPage };
