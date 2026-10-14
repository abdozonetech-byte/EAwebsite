create table if not exists public.lead_analyses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  analysis_status text not null default 'pending',
  digital_maturity_score integer,
  opportunity_score integer,
  sales_priority_score integer,
  research_confidence text,
  current_situation text,
  website_analysis text,
  seo_analysis text,
  geo_analysis text,
  social_analysis text,
  crm_automation_analysis text,
  weaknesses jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  recommended_services jsonb not null default '[]'::jsonb,
  action_plan jsonb not null default '[]'::jsonb,
  sales_approach text,
  evidence jsonb not null default '[]'::jsonb,
  report_markdown text,
  researched_at timestamptz,
  research_source text default 'chatgpt_mcp',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_analyses_status_check check (analysis_status in ('pending', 'analyzed', 'failed')),
  constraint lead_analyses_digital_score_check check (digital_maturity_score is null or digital_maturity_score between 0 and 100),
  constraint lead_analyses_opportunity_score_check check (opportunity_score is null or opportunity_score between 0 and 100),
  constraint lead_analyses_sales_score_check check (sales_priority_score is null or sales_priority_score between 0 and 100)
);

create index if not exists lead_analyses_status_idx on public.lead_analyses(analysis_status);
create index if not exists lead_analyses_opportunity_idx on public.lead_analyses(opportunity_score desc nulls last);
create index if not exists lead_analyses_researched_at_idx on public.lead_analyses(researched_at desc nulls last);

drop trigger if exists lead_analyses_set_updated_at on public.lead_analyses;
create trigger lead_analyses_set_updated_at
before update on public.lead_analyses
for each row execute function public.set_updated_at();

alter table public.lead_analyses enable row level security;
revoke all on public.lead_analyses from anon, authenticated;
grant all on public.lead_analyses to service_role;

create or replace view public.lead_intelligence_overview
with (security_invoker = true)
as
select
  l.*,
  coalesce(a.analysis_status, 'not_analyzed') as analysis_status,
  a.digital_maturity_score,
  a.opportunity_score,
  a.sales_priority_score,
  a.research_confidence,
  a.current_situation,
  a.website_analysis,
  a.seo_analysis,
  a.geo_analysis,
  a.social_analysis,
  a.crm_automation_analysis,
  a.weaknesses,
  a.opportunities,
  a.recommended_services,
  a.action_plan,
  a.sales_approach,
  a.evidence,
  a.report_markdown,
  a.researched_at,
  a.research_source,
  a.error_message,
  a.updated_at as analysis_updated_at
from public.leads l
left join public.lead_analyses a on a.lead_id = l.id;

revoke all on public.lead_intelligence_overview from anon, authenticated;
grant select on public.lead_intelligence_overview to service_role;
