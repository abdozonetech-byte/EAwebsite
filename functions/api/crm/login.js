import { COOKIE_NAME, SESSION_TTL_SECONDS, safeEqual, signSession } from "../../_lib/auth.js";
import { json, sameOrigin } from "../../_lib/http.js";

const MAX_BODY_BYTES = 4096;

async function handlePost(context) {
  const { request, env } = context;
  if (!sameOrigin(request)) return json({ ok: false, message: "Invalid request." }, 403);

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) return json({ ok: false, message: "Invalid request." }, 415);

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return json({ ok: false, message: "Invalid request." }, 413);

  if (!env.CRM_USERNAME || !env.CRM_PASSWORD || !env.CRM_SESSION_SECRET || String(env.CRM_SESSION_SECRET).length < 32) {
    return json({ ok: false, message: "CRM authentication is not configured." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }

  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password || username.length > 120 || password.length > 300) {
    return json({ ok: false, message: "The username or password is incorrect." }, 401);
  }

  const [usernameOk, passwordOk] = await Promise.all([
    safeEqual(username, String(env.CRM_USERNAME).trim().toLowerCase()),
    safeEqual(password, String(env.CRM_PASSWORD)),
  ]);

  if (!usernameOk || !passwordOk) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return json({ ok: false, message: "The username or password is incorrect." }, 401);
  }

  const token = await signSession(username, String(env.CRM_SESSION_SECRET));
  const cookie = `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}

export function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405, { Allow: "POST" });
  }
  return handlePost(context);
}
