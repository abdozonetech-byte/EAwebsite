import { json } from "../_lib/http.js";

export function onRequest(context) {
  const origin = new URL(context.request.url).origin;
  return json({ resource: `${origin}/mcp`, authorization_servers: [origin], scopes_supported: ["crm.leads.read", "crm.analysis.read", "crm.analysis.write", "crm.discovery.write"], bearer_methods_supported: ["header"] });
}
