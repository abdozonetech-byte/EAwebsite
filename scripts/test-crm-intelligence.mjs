import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ANALYSIS_STATUSES, normalizeAnalysisItem, normalizeEvidence, normalizeScore, toAnalysisRecord } from "../functions/_lib/lead-intelligence.js";
import { TOOLS, TOOL_SCOPES } from "../functions/_lib/mcp-tools.js";
import { onRequest as mcpRequest } from "../functions/mcp.js";
import { onRequest as oauthMetadataRequest } from "../functions/.well-known/oauth-authorization-server.js";
import { onRequest as registerRequest } from "../functions/oauth/register.js";
import { analysisPrompt, discoveryPrompt, parseJsonOutput, startResearchResponse, validateAnalysisOutput } from "../functions/_lib/openai-intelligence.js";

const leadId = "123e4567-e89b-42d3-a456-426614174000";
const valid = normalizeAnalysisItem({
  lead_id: leadId,
  digital_maturity_score: 46,
  opportunity_score: 82,
  sales_priority_score: 71,
  research_confidence: "medium",
  current_situation: "Verified public presence is fragmented.",
  website_analysis: "The public website was reviewed.",
  landing_page_analysis: "No dedicated verified campaign landing page was found.",
  seo_analysis: "Public search evidence was reviewed.",
  geo_analysis: "Structured business facts need clarification.",
  social_analysis: "Public social profiles were reviewed.",
  marketing_analysis: "A measurable lead funnel is an opportunity.",
  crm_automation_analysis: "Booking follow-up could be automated.",
  score_explanations: { digital_maturity: "Evidence-based rubric.", business_opportunity: "Visible gaps with practical remedies.", sales_priority: "Fit and evidence confidence considered." },
  weaknesses: ["Weak CTA"],
  opportunities: ["Booking funnel"],
  recommended_services: ["Landing page", "Local SEO", "CRM automation", "Must be dropped"],
  action_plan: ["Confirm decision-maker", "Offer diagnostic"],
  sales_approach: "Lead with a verified booking-flow observation.",
  evidence: [{ url: "https://example.com/#section", title: "Example", claim: "Supports the website observation." }, { url: "javascript:alert(1)", claim: "Unsafe" }],
  researched_at: "2026-10-14T12:00:00Z",
});

assert.deepEqual(valid.issues, []);
assert.equal(valid.recommendedServices.length, 3);
assert.equal(valid.evidence.length, 1);
assert.equal(valid.evidence[0].url, "https://example.com/");
assert.equal(toAnalysisRecord(valid).analysis_status, "completed");
assert.equal(toAnalysisRecord(valid).research_source, "chatgpt_mcp");
assert.equal(normalizeScore(101), null);
assert.equal(normalizeScore(-1), null);
assert.equal(normalizeEvidence([{ url: "file:///etc/passwd" }]).length, 0);
assert.ok(ANALYSIS_STATUSES.has("processing"));

const missingDate = normalizeAnalysisItem({ ...valid, lead_id: leadId, researched_at: "" });
assert.ok(missingDate.issues.includes("missing_or_invalid_research_date"));

assert.equal(TOOLS.length, 10);
assert.deepEqual(TOOLS.map((item) => item.name), ["list_pending_leads", "get_lead_details", "get_analysis_batch", "save_lead_analysis", "save_lead_report", "update_analysis_status", "get_analysis_status", "list_lead_categories", "propose_new_leads", "get_lead_analysis"]);
for (const name of ["save_lead_analysis", "save_lead_report", "update_analysis_status", "propose_new_leads"]) {
  const descriptor = TOOLS.find((item) => item.name === name);
  assert.equal(descriptor.annotations.readOnlyHint, false);
  assert.equal(descriptor.inputSchema.properties.confirm.const, true);
  assert.ok(TOOL_SCOPES.get(name)[0].endsWith(".write"));
}

const initialize = await mcpRequest({ request: new Request("https://elboubakry.com/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } }) }), env: {} });
assert.equal(initialize.status, 200);
assert.equal((await initialize.json()).result.serverInfo.name, "elboubakry-crm");

const toolsList = await mcpRequest({ request: new Request("https://elboubakry.com/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) }), env: {} });
assert.equal((await toolsList.json()).result.tools.length, 10);

const unauthorized = await mcpRequest({ request: new Request("https://elboubakry.com/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "list_pending_leads", arguments: {} } }) }), env: {} });
assert.equal(unauthorized.status, 401);
assert.match(unauthorized.headers.get("WWW-Authenticate"), /oauth-protected-resource/);

const oauthMetadata = await oauthMetadataRequest({ request: new Request("https://elboubakry.com/.well-known/oauth-authorization-server"), env: {} });
assert.equal((await oauthMetadata.json()).registration_endpoint, "https://elboubakry.com/oauth/register");

const rejectedRegistration = await registerRequest({
  request: new Request("https://elboubakry.com/oauth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ redirect_uris: ["https://attacker.example/callback"] }) }),
  env: {},
});
assert.equal(rejectedRegistration.status, 400);
assert.equal((await rejectedRegistration.json()).error, "invalid_redirect_uri");

const parsedAi = parseJsonOutput({ output: [{ type: "message", content: [{ type: "output_text", text: `\`\`\`json\n${JSON.stringify({ analyses: [{ ...valid, lead_id: leadId }] })}\n\`\`\`` }] }] });
assert.equal(parsedAi.analyses[0].lead_id, leadId);
assert.equal(validateAnalysisOutput(parsedAi, [leadId]).length, 1);
assert.match(analysisPrompt({ instructions: "Verify sources" }, [{ lead_id: leadId, leads: { full_name: "Example", city: "Casablanca" } }]), /Return ONLY valid JSON/);
assert.match(discoveryPrompt({ category: "Aesthetic clinic", city: "Casablanca" }), /review queue/i);
await assert.rejects(() => startResearchResponse({}, "test"), /not configured/i);
const originalFetch = globalThis.fetch;
let capturedOpenAiRequest;
globalThis.fetch = async (url, options) => {
  capturedOpenAiRequest = { url, options };
  return new Response(JSON.stringify({ id: "resp_test", status: "queued", model: "gpt-5.5" }), { status: 200, headers: { "Content-Type": "application/json" } });
};
try {
  const started = await startResearchResponse({ OPENAI_API_KEY: "server-only-test-key" }, "Research this business");
  assert.equal(started.id, "resp_test");
  assert.equal(capturedOpenAiRequest.url, "https://api.openai.com/v1/responses");
  const requestBody = JSON.parse(capturedOpenAiRequest.options.body);
  assert.equal(requestBody.background, true);
  assert.equal(requestBody.tools[0].type, "web_search");
  assert.equal(requestBody.tools[0].user_location.country, "MA");
  assert.equal(capturedOpenAiRequest.options.headers.Authorization, "Bearer server-only-test-key");
} finally {
  globalThis.fetch = originalFetch;
}

const migration003 = await readFile(new URL("../supabase/migrations/003_chatgpt_mcp_lead_intelligence.sql", import.meta.url), "utf8");
assert.match(migration003, /drop view if exists public\.lead_intelligence_overview;/i);
assert.match(migration003, /create view public\.lead_intelligence_overview/i);

const migration004 = await readFile(new URL("../supabase/migrations/004_mcp_dynamic_client_registration.sql", import.meta.url), "utf8");
assert.match(migration004, /create table if not exists public\.mcp_oauth_clients/i);

const migration005 = await readFile(new URL("../supabase/migrations/005_openai_backend_jobs.sql", import.meta.url), "utf8");
assert.match(migration005, /analysis_batches add column if not exists ai_response_id/i);

console.log("CRM intelligence and MCP contract tests passed.");
