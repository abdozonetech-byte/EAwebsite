import { safeEqual } from "./auth.js";
import { supabaseFetch } from "./supabase.js";

const ACCESS_TTL_SECONDS = 60 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
const ALL_MCP_SCOPES = new Set(["crm.leads.read", "crm.analysis.read", "crm.analysis.write", "crm.discovery.write"]);

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomToken(bytes = 32) {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function sha256Base64Url(value) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))));
  return bytesToBase64Url(digest);
}

async function sha256Hex(value) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseScopes(value) {
  return [...new Set(String(value || "").split(/\s+/).filter((scope) => ALL_MCP_SCOPES.has(scope)))];
}

function configuredClient(env) {
  const clientId = String(env.MCP_OAUTH_CLIENT_ID || "").trim();
  const clientSecret = String(env.MCP_OAUTH_CLIENT_SECRET || "");
  const redirectUris = String(env.MCP_OAUTH_REDIRECT_URIS || "").split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
  if (!clientId || !redirectUris.length) throw new Error("MCP OAuth is not configured.");
  return { clientId, clientSecret, redirectUris };
}

function parseClientCredentials(request, form) {
  let clientId = String(form.get("client_id") || "");
  let clientSecret = String(form.get("client_secret") || "");
  const authorization = request.headers.get("Authorization") || "";
  if (authorization.startsWith("Basic ")) {
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(":");
      if (separator >= 0) {
        clientId = decodeURIComponent(decoded.slice(0, separator));
        clientSecret = decodeURIComponent(decoded.slice(separator + 1));
      }
    } catch {
      return { clientId: "", clientSecret: "" };
    }
  }
  return { clientId, clientSecret };
}

async function validClientCredentials(request, form, env) {
  const configured = configuredClient(env);
  const provided = parseClientCredentials(request, form);
  const idOk = await safeEqual(provided.clientId, configured.clientId);
  const secretOk = configured.clientSecret ? await safeEqual(provided.clientSecret, configured.clientSecret) : true;
  return { ok: idOk && secretOk, clientId: provided.clientId, configured };
}

async function issueTokens(env, clientId, subject, scopes) {
  const accessToken = `mcp_at_${randomToken(32)}`;
  const refreshToken = `mcp_rt_${randomToken(40)}`;
  const now = Date.now();
  await supabaseFetch(env, "mcp_oauth_tokens", {
    method: "POST",
    body: [
      { token_hash: await sha256Hex(accessToken), token_type: "access", client_id: clientId, subject, scopes, expires_at: new Date(now + ACCESS_TTL_SECONDS * 1000).toISOString() },
      { token_hash: await sha256Hex(refreshToken), token_type: "refresh", client_id: clientId, subject, scopes, expires_at: new Date(now + REFRESH_TTL_SECONDS * 1000).toISOString() },
    ],
  });
  return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
}

async function authenticateMcpRequest(request, env, requiredScopes = []) {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return { ok: false, status: 401, error: "missing_token" };
  const token = authorization.slice(7).trim();
  if (!token || token.length > 500) return { ok: false, status: 401, error: "invalid_token" };
  const rows = await supabaseFetch(env, "mcp_oauth_tokens", {
    search: { select: "subject,client_id,scopes,expires_at", token_hash: `eq.${await sha256Hex(token)}`, token_type: "eq.access", revoked_at: "is.null", expires_at: `gt.${new Date().toISOString()}`, limit: "1" },
  });
  if (!rows.length) return { ok: false, status: 401, error: "invalid_token" };
  const scopes = Array.isArray(rows[0].scopes) ? rows[0].scopes : [];
  if (requiredScopes.some((scope) => !scopes.includes(scope))) return { ok: false, status: 403, error: "insufficient_scope" };
  return { ok: true, subject: rows[0].subject, clientId: rows[0].client_id, scopes };
}

export {
  ACCESS_TTL_SECONDS,
  ALL_MCP_SCOPES,
  authenticateMcpRequest,
  configuredClient,
  issueTokens,
  parseScopes,
  randomToken,
  sha256Base64Url,
  sha256Hex,
  validClientCredentials,
};
