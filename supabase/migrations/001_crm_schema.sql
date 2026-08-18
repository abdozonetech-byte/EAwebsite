create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  company_name text,
  business_sector text,
  city text,
  source text default 'manual',
  status text not null default 'new',
  priority text not null default 'medium',
  message text,
  next_follow_up_at timestamptz,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  referrer text,
  landing_page_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint leads_status_check check (status in ('new', 'contacted', 'follow_up', 'appointment', 'no_show', 'won', 'not_interested')),
  constraint leads_priority_check check (priority in ('low', 'medium', 'high'))
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  title text,
  starts_at timestamptz not null,
  status text default 'scheduled',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint appointments_status_check check (status in ('scheduled', 'completed', 'no_show', 'cancelled'))
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_next_follow_up_at_idx on public.leads(next_follow_up_at);
create index if not exists appointments_starts_at_idx on public.appointments(starts_at);
create index if not exists appointments_lead_id_idx on public.appointments(lead_id);
create index if not exists lead_notes_lead_id_idx on public.lead_notes(lead_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.appointments enable row level security;
