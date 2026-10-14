import { hasValidCrmSession } from "../_lib/auth.js";
import { configuredClient, parseScopes, randomToken, sha256Hex } from "../_lib/mcp-auth.js";
import { supabaseFetch } from "../_lib/supabase.js";

function html(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" } });
}

function esc(value) {
  return String(value || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function paramsFrom(source) {
  return {
    responseType: String(source.get("response_type") || ""),
    clientId: String(source.get("client_id") || ""),
    redirectUri: String(source.get("redirect_uri") || ""),
    codeChallenge: String(source.get("code_challenge") || ""),
    challengeMethod: String(source.get("code_challenge_method") || ""),
    scope: String(source.get("scope") || ""),
    state: String(source.get("state") || ""),
  };
}

function validate(values, env) {
  let client;
  try { client = configuredClient(env); } catch { return { error: "MCP OAuth is not configured." }; }
  if (values.responseType !== "code" || values.clientId !== client.clientId) return { error: "Invalid OAuth request." };
  if (!client.redirectUris.includes(values.redirectUri)) return { error: "The redirect URI is not registered." };
  if (values.challengeMethod !== "S256" || !/^[A-Za-z0-9_-]{43,128}$/.test(values.codeChallenge)) return { error: "PKCE S256 is required." };
  const scopes = parseScopes(values.scope);
  if (!scopes.length) return { error: "At least one CRM scope is required." };
  return { client, scopes };
}

function consentPage(values, scopes) {
  const hidden = Object.entries({ response_type: values.responseType, client_id: values.clientId, redirect_uri: values.redirectUri, code_challenge: values.codeChallenge, code_challenge_method: values.challengeMethod, scope: scopes.join(" "), state: values.state }).map(([name, value]) => `<input type="hidden" name="${name}" value="${esc(value)}">`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect ChatGPT | Elboubakry CRM</title><style>:root{font-family:Inter,system-ui,sans-serif;color:#0a1429;background:#f4f7fc}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 10% 5%,#dce8ff,transparent 34rem),#f4f7fc}.card{width:min(560px,100%);padding:32px;border:1px solid #dfe7f3;border-radius:24px;background:white;box-shadow:0 28px 80px rgba(20,45,90,.13)}.mark{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;color:white;background:#2463eb;font-weight:900;font-size:22px}.eyebrow{margin:20px 0 4px;color:#2463eb;font-size:11px;font-weight:900;letter-spacing:.13em}.card h1{margin:0;font-size:30px;letter-spacing:-.04em}.card>p{color:#657086}.permissions{display:grid;gap:8px;margin:24px 0}.permissions div{padding:12px;border-radius:12px;background:#f5f8fe;font-size:13px}.notice{padding:13px;border-left:3px solid #2463eb;background:#edf3ff;color:#43516a;font-size:12px}.actions{display:flex;gap:10px;margin-top:24px}.actions button{height:44px;flex:1;border:1px solid #dfe7f3;border-radius:12px;font-weight:850}.approve{border-color:#2463eb!important;color:white;background:#2463eb}.cancel{background:white;color:#4f5d72}@media(max-width:520px){.card{padding:23px}.actions{flex-direction:column}}</style></head><body><main class="card"><div class="mark">E.</div><p class="eyebrow">SECURE MCP CONNECTION</p><h1>Connect ChatGPT to your CRM?</h1><p>ChatGPT will only receive the permissions listed below. Database credentials remain server-side.</p><div class="permissions">${scopes.map((scope) => `<div>${esc(scope)}</div>`).join("")}</div><div class="notice">Write tools remain confirmation-gated and every authorized change is logged.</div><form method="post">${hidden}<div class="actions"><button class="cancel" name="decision" value="deny">Cancel</button><button class="approve" name="decision" value="approve">Allow connection</button></div></form></main></body></html>`;
}

function oauthRedirect(redirectUri, values) {
  const target = new URL(redirectUri);
  for (const [key, value] of Object.entries(values)) if (value) target.searchParams.set(key, value);
  return Response.redirect(target.toString(), 302);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!["GET", "POST"].includes(request.method)) return html("Method not allowed.", 405);
  const source = request.method === "GET" ? new URL(request.url).searchParams : await request.formData();
  const values = paramsFrom(source);
  const checked = validate(values, env);
  if (checked.error) return html(`<h1>Connection unavailable</h1><p>${esc(checked.error)}</p>`, 400);
  if (!(await hasValidCrmSession(request, env))) {
    const current = `${new URL(request.url).pathname}?${new URLSearchParams(Object.fromEntries(source.entries())).toString()}`;
    return Response.redirect(`${new URL(request.url).origin}/crm/login/?next=${encodeURIComponent(current)}`, 302);
  }
  if (request.method === "GET") return html(consentPage(values, checked.scopes));
  if (String(source.get("decision")) !== "approve") return oauthRedirect(values.redirectUri, { error: "access_denied", state: values.state });
  const code = `mcp_code_${randomToken(32)}`;
  await supabaseFetch(env, "mcp_oauth_codes", { method: "POST", body: { code_hash: await sha256Hex(code), client_id: values.clientId, redirect_uri: values.redirectUri, code_challenge: values.codeChallenge, scopes: checked.scopes, subject: String(env.CRM_USERNAME || "crm-owner").trim().toLowerCase(), expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() } });
  return oauthRedirect(values.redirectUri, { code, state: values.state });
}
