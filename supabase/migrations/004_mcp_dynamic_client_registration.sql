-- Allow ChatGPT to register a PKCE public OAuth client for this private CRM.
-- Registration is limited by the Worker to official ChatGPT HTTPS callbacks.

create table if not exists public.mcp_oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  redirect_uris text[] not null,
  token_endpoint_auth_method text not null default 'none',
  client_name text not null default 'ChatGPT',
  created_at timestamptz not null default now(),
  constraint mcp_oauth_client_auth_method_check check (token_endpoint_auth_method in ('none')),
  constraint mcp_oauth_client_redirects_check check (cardinality(redirect_uris) between 1 and 10)
);

create index if not exists mcp_oauth_clients_created_idx on public.mcp_oauth_clients(created_at desc);

alter table public.mcp_oauth_clients enable row level security;
revoke all on public.mcp_oauth_clients from anon, authenticated;
grant all on public.mcp_oauth_clients to service_role;
