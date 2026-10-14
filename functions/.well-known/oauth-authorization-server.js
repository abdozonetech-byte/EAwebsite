import { json } from "../_lib/http.js";

export function onRequest(context) {
  const origin = new URL(context.request.url).origin;
  return json({ issuer: origin, authorization_endpoint: `${origin}/oauth/authorize`, token_endpoint: `${origin}/oauth/token`, response_types_supported: ["code"], grant_types_supported: ["authorization_code", "refresh_token"], code_challenge_methods_supported: ["S256"], token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post", "none"], scopes_supported: ["crm.leads.read", "crm.analysis.read", "crm.analysis.write", "crm.discovery.write"] });
}
