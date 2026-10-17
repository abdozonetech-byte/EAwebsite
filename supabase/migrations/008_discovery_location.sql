begin;

-- Additive only: existing leads stay untouched and unknown countries remain NULL.
-- Capture the expanded view definition BEFORE adding a lead column, so its
-- existing column order and any database dependencies remain stable.
do $$
declare
  definition text;
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='leads' and column_name='country') then
    definition := regexp_replace(pg_get_viewdef('public.lead_intelligence_overview'::regclass, true), ';\s*$', '');
    alter table public.leads add column country text check (country is null or country ~ '^[A-Z]{2}$');
    execute 'create or replace view public.lead_intelligence_overview with (security_invoker=true) as select previous.*, geography.country from (' || definition || ') previous join public.leads geography on geography.id=previous.id';
  end if;
end $$;

alter table public.lead_discovery_batches add column if not exists country text check (country is null or country ~ '^[A-Z]{2}$');
alter table public.lead_discovery_batches add column if not exists locality text;
alter table public.lead_discovery_candidates add column if not exists country text check (country is null or country ~ '^[A-Z]{2}$');
create index if not exists leads_country_city_idx on public.leads(country, city);
revoke all on public.lead_intelligence_overview from anon, authenticated;
grant select on public.lead_intelligence_overview to service_role;
notify pgrst, 'reload schema';
commit;
