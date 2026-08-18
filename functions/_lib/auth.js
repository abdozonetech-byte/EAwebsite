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

async function hmac(payload, secret, usages = ["sign", "verify"]) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload)));
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
  const signature = await hmac(payloadEncoded, secret, ["sign"]);
  return `${payloadEncoded}.${bytesToBase64Url(signature)}`;
}

async function verifySession(token, secret, expectedUsername) {
  if (!token || !secret || !expectedUsername) return false;
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

async function hasValidCrmSession(request, env) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const expectedUsername = String(env.CRM_USERNAME || "").trim().toLowerCase();
  return verifySession(cookies.get(COOKIE_NAME), env.CRM_SESSION_SECRET, expectedUsername);
}

export { COOKIE_NAME, SESSION_TTL_SECONDS, hasValidCrmSession, parseCookies, safeEqual, signSession, verifySession };
