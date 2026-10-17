# Bounded AI research

The existing server-side OpenAI integration now uses bounded research. No model change, new database migration, or browser ChatGPT automation is needed. Existing leads are read-only in this flow.

## Server configuration

Set Cloudflare Pages environment variables server-side (never expose the API key):

| Variable | Default | Purpose |
| --- | --- | --- |
| OPENAI_RESEARCH_PROFILE | balanced | economy, balanced, detailed |
| OPENAI_MAX_SEARCH_CALLS | 8 | Built-in tool call cap per research request, 1–100 |
| OPENAI_MAX_RESEARCH_OUTPUT_TOKENS | 6000 | Research output/reasoning cap, 2000–64000 |
| OPENAI_MAX_GENERATION_OUTPUT_TOKENS | 8000 | Structured assessment/draft output cap, 2000–16000 |
| OPENAI_MAX_INPUT_CHARACTERS | 160000 | Reject oversized inputs before calling the API, 4000–500000 |
| OPENAI_PRESENCE_REUSE_HOURS | 24 | Reuse unchanged completed presence checks; 0 disables, maximum 168 |

Economy uses low reasoning effort, low search context, four tool calls, 4000 research output tokens and 6000 generation output tokens. Balanced uses medium reasoning/context. Detailed uses high reasoning, medium context, twelve calls, 10000 research tokens and 12000 generation tokens. Explicit limits override the profile. Analysis batches scale default research caps with lead count (maximum 100 calls / 64000 output tokens); explicit environment limits are per request, not per lead. Large batches can exhaust the cap; use smaller batches rather than automatically escalating it.

Search starts with exact business identity and official sources. Findings and evidence remain mandatory; missing information must stay unknown. Discovery returns up to five verified candidates, not an unbounded list. Insufficient/incomplete responses fail safely without automatic paid retries or replacement of earlier results.

Presence reuse checks lead identity, website, location, complete saved analysis, latest eight feedback entries, language, completion and original research dates. Changes during research disable reuse of that version. The original research timestamp is preserved. Older outputs without a matching cache key are never reused. Reuse does not insert another generation record or call OpenAI. After expiry a new consented request researches again.

Completed project outputs retain `_budget` and provider-reported `_usage` for research and generation. Missing usage values are null, not estimated. These are not billing totals; hosted search, cached input and model pricing must be considered separately. The existing UI does not yet display these diagnostics.

These controls do **not** guarantee a dollar ceiling, fixed input-token count, or identical quality. Search context size is a hint, and max_tool_calls caps built-in invocations rather than all underlying search activity. max_output_tokens also includes reasoning. Set billing controls in the provider dashboard and evaluate quality against approved live samples before selecting economy for production.

References: [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search), [Responses request fields](https://developers.openai.com/api/reference/cli/resources/responses/methods/create), [cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization).

Verification: `npm run test:ai-budget` and existing CRM tests use mocked providers; no paid API call is required.
