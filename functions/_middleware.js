const COOKIE_NAME = "elboubakry_crm_session";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

const textEncoder = new TextEncoder();

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function parseCookies(header) {
  const cookies = new Map();
  for (const part of (header || "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    cookies.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }
  return cookies;
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload)));
}

async function verifySession(token, secret, expectedUsername) {
  if (!token || !secret) return false;
  const [payloadEncoded, signatureEncoded] = token.split(".");
  if (!payloadEncoded || !signatureEncoded) return false;

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadEncoded)));
  } catch {
    return false;
  }

  if (payload?.v !== 1 || payload?.sub !== expectedUsername || typeof payload?.iat !== "number" || typeof payload?.exp !== "number") {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.iat > now + 60 || payload.exp <= now || payload.exp - payload.iat > SESSION_TTL_SECONDS + 60) return false;

  let provided;
  try {
    provided = base64UrlToBytes(signatureEncoded);
  } catch {
    return false;
  }
  const expected = await hmac(payloadEncoded, secret);
  if (provided.length !== expected.length) return false;

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) diff |= expected[index] ^ provided[index];
  return diff === 0;
}

function withCrmHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function isHtmlNavigation(request, pathname) {
  const accept = request.headers.get("Accept") || "";
  return accept.includes("text/html") || pathname.endsWith("/") || !pathname.split("/").pop()?.includes(".");
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/crm/")) return context.next();

  const loginRoute = pathname === "/crm/login/" || pathname === "/crm/login/index.html";
  const cookies = parseCookies(request.headers.get("Cookie"));
  const expectedUsername = String(env.CRM_USERNAME || "elboubakry").trim().toLowerCase();
  const sessionValid = await verifySession(cookies.get(COOKIE_NAME), env.CRM_SESSION_SECRET, expectedUsername);

  if (loginRoute) {
    if (sessionValid) return Response.redirect(new URL("/crm/", url), 302);
    return withCrmHeaders(await context.next());
  }

  if (!sessionValid) {
    if (isHtmlNavigation(request, pathname)) {
      const loginUrl = new URL("/crm/login/", url);
      if (pathname !== "/crm/") loginUrl.searchParams.set("next", pathname);
      return new Response(null, { status: 302, headers: { Location: loginUrl.toString(), "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet" } });
    }
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  return withCrmHeaders(await context.next());
}
