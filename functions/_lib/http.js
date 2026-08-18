function crmHeaders(extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  return headers;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: crmHeaders(extraHeaders) });
}

function text(message, status = 200, extraHeaders = {}) {
  const headers = crmHeaders(extraHeaders);
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(message, { status, headers });
}

function methodNotAllowed(methods) {
  return json({ ok: false, message: "Method not allowed." }, 405, { Allow: methods.join(", ") });
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readJsonBody(request, maxBytes = 20000) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) return { ok: false, status: 400, message: "Invalid body." };
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return { ok: false, status: 400, message: "Invalid body." };
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false, status: 400, message: "Invalid body." };
  }
}

export { crmHeaders, json, methodNotAllowed, readJsonBody, sameOrigin, text };
