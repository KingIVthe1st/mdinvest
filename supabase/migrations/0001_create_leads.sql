-- Leads table and indexes
create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  consent boolean not null,
  client_id text,
  source_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  user_agent text,
  ip_hash text
);

-- Indexes
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_campaign_idx on public.leads (utm_campaign);

-- Partial unique index for dedup per campaign (only when consent=true)
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='leads_email_campaign_unique_idx'
  ) then
    execute 'create unique index leads_email_campaign_unique_idx on public.leads (lower(email), coalesce(utm_campaign, ''''))
            where consent = true';
  end if;
end $$;