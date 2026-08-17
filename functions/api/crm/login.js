const COOKIE_NAME = "elboubakry_crm_session";
const SESSION_TTL_SECONDS = 24 * 60 * 60;
const MAX_BODY_BYTES = 4096;
const textEncoder = new TextEncoder();

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));
}

async function safeEqual(left, right) {
  const [leftHash, rightHash] = await Promise.all([sha256(left), sha256(right)]);
  let diff = 0;
  for (let index = 0; index < leftHash.length; index += 1) diff |= leftHash[index] ^ rightHash[index];
  return diff === 0;
}

async function signSession(username, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { v: 1, sub: username, iat: now, exp: now + SESSION_TTL_SECONDS };
  const payloadEncoded = bytesToBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadEncoded)));
  return `${payloadEncoded}.${bytesToBase64Url(signature)}`;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      ...extraHeaders,
    },
  });
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
  const cookie = `${COOKIE_NAME}=${token}; Path=/crm; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}

export function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed." }, 405, { Allow: "POST" });
  }
  return handlePost(context);
}
