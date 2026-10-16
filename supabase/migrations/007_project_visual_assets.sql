-- Additive private visual assets. No lead or research records are modified.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('crm-project-visuals', 'crm-project-visuals', false, 12582912, array['image/png'])
on conflict (id) do nothing;
create table if not exists public.lead_project_assets (
  id uuid primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  generation_id uuid references public.lead_project_generations(id) on delete set null,
  purpose text not null check (purpose in ('logo','mockup')),
  object_path text not null unique,
  mime_type text not null default 'image/png' check (mime_type = 'image/png'),
  byte_size integer not null check (byte_size between 1 and 12582912),
  created_at timestamptz not null default now()
);
create index if not exists project_asset_history_idx on public.lead_project_assets (lead_id, purpose, created_at desc);
create unique index if not exists project_asset_generation_idx on public.lead_project_assets (generation_id) where purpose = 'mockup';
alter table public.lead_project_assets enable row level security;
revoke all on public.lead_project_assets from anon, authenticated;
grant all on public.lead_project_assets to service_role;
-- No public Storage policies. Files are read/written only by the authenticated CRM backend.
commit;
