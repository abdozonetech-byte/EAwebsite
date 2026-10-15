-- Backend OpenAI research jobs. API keys remain Cloudflare secrets and are never stored here.

alter table public.analysis_batches add column if not exists ai_response_id text;
alter table public.analysis_batches add column if not exists ai_model text;
alter table public.analysis_batches add column if not exists ai_status text;
alter table public.analysis_batches add column if not exists ai_error text;

alter table public.lead_discovery_batches add column if not exists ai_response_id text;
alter table public.lead_discovery_batches add column if not exists ai_model text;
alter table public.lead_discovery_batches add column if not exists ai_status text;
alter table public.lead_discovery_batches add column if not exists ai_error text;
alter table public.lead_discovery_batches add column if not exists ai_result_count integer not null default 0;

create index if not exists analysis_batches_ai_response_idx on public.analysis_batches(ai_response_id) where ai_response_id is not null;
create index if not exists discovery_batches_ai_response_idx on public.lead_discovery_batches(ai_response_id) where ai_response_id is not null;
