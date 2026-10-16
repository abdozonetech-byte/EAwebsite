-- Additive workspace: existing leads and research reports are left untouched.
begin;
create table if not exists public.lead_project_generations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  request_id uuid not null unique,
  kind text not null check (kind in ('solution','mockup')),
  status text not null default 'starting' check (status in ('starting','queued','in_progress','completed','failed')),
  brief text not null default '' check (length(brief) <= 3000),
  locale text not null default 'fr' check (locale in ('en','fr')),
  response_id text,
  model text,
  output jsonb,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create unique index if not exists lead_project_one_active_idx on public.lead_project_generations(lead_id)
  where status in ('starting','queued','in_progress');
create index if not exists lead_project_history_idx on public.lead_project_generations(lead_id, created_at desc);
create table if not exists public.lead_project_feedback (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  generation_id uuid references public.lead_project_generations(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists lead_project_feedback_history_idx on public.lead_project_feedback(lead_id, created_at desc);
alter table public.lead_project_generations enable row level security;
alter table public.lead_project_feedback enable row level security;
revoke all on public.lead_project_generations, public.lead_project_feedback from anon, authenticated;
grant all on public.lead_project_generations, public.lead_project_feedback to service_role;
commit;
