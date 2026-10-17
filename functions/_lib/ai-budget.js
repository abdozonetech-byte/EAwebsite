// Request limits, not a dollar-spend guarantee. Input and hosted search are billed separately.
const PROFILES = {
  economy: { effort: "low", context: "low", calls: 4, research: 4000, generation: 6000 },
  balanced: { effort: "medium", context: "medium", calls: 8, research: 6000, generation: 8000 },
  detailed: { effort: "high", context: "medium", calls: 12, research: 10000, generation: 12000 },
};
function bounded(value, fallback, min, max) {
  if (value === "" || value == null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.floor(number))) : fallback;
}
export function aiBudget(env = {}, { kind = "project", leadCount = 1 } = {}) {
  const profile = Object.hasOwn(PROFILES, env.OPENAI_RESEARCH_PROFILE) ? env.OPENAI_RESEARCH_PROFILE : "balanced";
  const base = PROFILES[profile];
  const count = kind === "analysis" ? bounded(leadCount, 1, 1, 50) : 1;
  return {
    profile, effort: base.effort, context: base.context,
    maxToolCalls: bounded(env.OPENAI_MAX_SEARCH_CALLS, Math.min(100, base.calls * count), 1, 100),
    maxResearchTokens: bounded(env.OPENAI_MAX_RESEARCH_OUTPUT_TOKENS, Math.min(64000, base.research * count), 2000, 64000),
    maxGenerationTokens: bounded(env.OPENAI_MAX_GENERATION_OUTPUT_TOKENS, base.generation, 2000, 16000),
    maxInputCharacters: bounded(env.OPENAI_MAX_INPUT_CHARACTERS, 160000, 4000, 500000),
    reuseHours: bounded(env.OPENAI_PRESENCE_REUSE_HOURS, 24, 0, 168),
  };
}
export function checkPromptBudget(input, policy) {
  if (typeof input !== "string" || !input.trim()) throw new Error("AI research needs a non-empty prompt.");
  if (input.length > policy.maxInputCharacters) throw new Error("The research input exceeds the configured size limit. Select fewer leads; no API call was made.");
  return input;
}
export function providerUsage(response) {
  const safe = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
  return {
    inputTokens: safe(response?.usage?.input_tokens), outputTokens: safe(response?.usage?.output_tokens),
    totalTokens: safe(response?.usage?.total_tokens), reasoningTokens: safe(response?.usage?.output_tokens_details?.reasoning_tokens),
    cachedInputTokens: safe(response?.usage?.input_tokens_details?.cached_tokens),
    webToolCalls: Array.isArray(response?.output) ? response.output.filter(item => item.type === "web_search_call").length : null,
  };
}
export async function presenceCacheKey(lead, analysis, feedback, locale) {
  const input = JSON.stringify({ version: 1, locale, business: [lead.id, lead.full_name, lead.company_name, lead.business_sector, lead.city, lead.country, lead.landing_page_url], analysis: analysis || null, feedback: feedback.map(item => [item.rating, item.body]) });
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)))].map(byte => byte.toString(16).padStart(2,"0")).join("");
}
export function reusablePresence(row, key, hours, now = Date.now()) {
  if (!hours || row?.status !== "completed" || row?.brief !== "presence" || row?.output?._purpose !== "presence" || row.output._cacheKey !== key || !row.output._research?.evidence?.length) return false;
  return [row.completed_at, row.output._research.researched_at].every(date => {
    const age = now - Date.parse(date);
    return Number.isFinite(age) && age >= 0 && age <= hours * 3600000;
  });
}
