import { ACCESS_TTL_SECONDS, issueTokens, sha256Base64Url, sha256Hex, validClientCredentials } from "../_lib/mcp-auth.js";
import { supabaseFetch } from "../_lib/supabase.js";

function tokenJson(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", Pragma: "no-cache", "X-Content-Type-Options": "nosniff" } });
}

function tokenError(error, description, status = 400) {
  return tokenJson({ error, error_description: description }, status);
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return tokenError("invalid_request", "POST is required.", 405);
  let form;
  try { form = await context.request.formData(); } catch { return tokenError("invalid_request", "Invalid form body."); }
  let client;
  try { client = await validClientCredentials(context.request, form, context.env); } catch { return tokenError("server_error", "OAuth is not configured.", 503); }
  if (!client.ok) return tokenError("invalid_client", "Client authentication failed.", 401);
  const grantType = String(form.get("grant_type") || "");
  try {
    if (grantType === "authorization_code") {
      const code = String(form.get("code") || "");
      const redirectUri = String(form.get("redirect_uri") || "");
      const verifier = String(form.get("code_verifier") || "");
      if (!code || !redirectUri || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return tokenError("invalid_grant", "Invalid authorization code request.");
      const codeHash = await sha256Hex(code);
      const rows = await supabaseFetch(context.env, "mcp_oauth_codes", { search: { select: "*", code_hash: `eq.${codeHash}`, used_at: "is.null", expires_at: `gt.${new Date().toISOString()}`, limit: "1" } });
      const record = rows[0];
      if (!record || record.client_id !== client.clientId || record.redirect_uri !== redirectUri) return tokenError("invalid_grant", "Authorization code is invalid or expired.");
      if (await sha256Base64Url(verifier) !== record.code_challenge) return tokenError("invalid_grant", "PKCE verification failed.");
      const consumed = await supabaseFetch(context.env, "mcp_oauth_codes", { method: "PATCH", search: { code_hash: `eq.${codeHash}`, used_at: "is.null" }, body: { used_at: new Date().toISOString() } });
      if (!consumed.length) return tokenError("invalid_grant", "Authorization code was already used.");
      const issued = await issueTokens(context.env, client.clientId, record.subject, record.scopes || []);
      return tokenJson({ access_token: issued.accessToken, token_type: "Bearer", expires_in: issued.expiresIn, refresh_token: issued.refreshToken, scope: (record.scopes || []).join(" ") });
    }
    if (grantType === "refresh_token") {
      const refreshToken = String(form.get("refresh_token") || "");
      const tokenHash = await sha256Hex(refreshToken);
      const rows = await supabaseFetch(context.env, "mcp_oauth_tokens", { search: { select: "*", token_hash: `eq.${tokenHash}`, token_type: "eq.refresh", client_id: `eq.${client.clientId}`, revoked_at: "is.null", expires_at: `gt.${new Date().toISOString()}`, limit: "1" } });
      if (!rows.length) return tokenError("invalid_grant", "Refresh token is invalid or expired.");
      await supabaseFetch(context.env, "mcp_oauth_tokens", { method: "PATCH", search: { token_hash: `eq.${tokenHash}`, revoked_at: "is.null" }, body: { revoked_at: new Date().toISOString() } });
      const issued = await issueTokens(context.env, client.clientId, rows[0].subject, rows[0].scopes || []);
      return tokenJson({ access_token: issued.accessToken, token_type: "Bearer", expires_in: ACCESS_TTL_SECONDS, refresh_token: issued.refreshToken, scope: (rows[0].scopes || []).join(" ") });
    }
    return tokenError("unsupported_grant_type", "Supported grants: authorization_code, refresh_token.");
  } catch {
    return tokenError("server_error", "Token service unavailable.", 503);
  }
}
