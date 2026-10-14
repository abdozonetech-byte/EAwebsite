import { randomToken } from "../_lib/mcp-auth.js";
import { supabaseFetch } from "../_lib/supabase.js";

const OPENAI_REDIRECT_HOSTS = new Set(["chatgpt.com", "chat.openai.com"]);

function registrationJson(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", Pragma: "no-cache", "X-Content-Type-Options": "nosniff" },
  });
}

function registrationError(error, description, status = 400) {
  return registrationJson({ error, error_description: description }, status);
}

function validRedirectUris(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
  const unique = [...new Set(value.map((item) => String(item || "").trim()))];
  if (unique.some((item) => item.length > 500)) return null;
  try {
    for (const item of unique) {
      const url = new URL(item);
      if (url.protocol !== "https:" || !OPENAI_REDIRECT_HOSTS.has(url.hostname)) return null;
    }
  } catch {
    return null;
  }
  return unique;
}

export async function onRequest(context) {
  if (context.request.method !== "POST") return registrationError("invalid_client_metadata", "POST is required.", 405);
  let payload;
  try {
    const length = Number(context.request.headers.get("Content-Length") || 0);
    if (length > 20_000) return registrationError("invalid_client_metadata", "Registration request is too large.", 413);
    payload = await context.request.json();
  } catch {
    return registrationError("invalid_client_metadata", "A valid JSON body is required.");
  }

  const redirectUris = validRedirectUris(payload?.redirect_uris);
  if (!redirectUris) return registrationError("invalid_redirect_uri", "Only HTTPS ChatGPT redirect URIs are accepted.");
  const grantTypes = Array.isArray(payload.grant_types) ? payload.grant_types : ["authorization_code", "refresh_token"];
  const responseTypes = Array.isArray(payload.response_types) ? payload.response_types : ["code"];
  if (!grantTypes.includes("authorization_code") || grantTypes.some((item) => !["authorization_code", "refresh_token"].includes(item))) {
    return registrationError("invalid_client_metadata", "Unsupported grant type.");
  }
  if (responseTypes.length !== 1 || responseTypes[0] !== "code") return registrationError("invalid_client_metadata", "Only the code response type is supported.");
  if (payload.token_endpoint_auth_method && payload.token_endpoint_auth_method !== "none") {
    return registrationError("invalid_client_metadata", "Dynamic clients must use PKCE public-client authentication.");
  }

  const clientId = `mcp_dcr_${randomToken(24)}`;
  const clientName = String(payload.client_name || "ChatGPT").trim().slice(0, 120) || "ChatGPT";
  try {
    await supabaseFetch(context.env, "mcp_oauth_clients", {
      method: "POST",
      body: { client_id: clientId, redirect_uris: redirectUris, token_endpoint_auth_method: "none", client_name: clientName },
    });
  } catch {
    return registrationError("server_error", "Client registration is temporarily unavailable.", 503);
  }

  return registrationJson({
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: clientName,
    redirect_uris: redirectUris,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  }, 201);
}
