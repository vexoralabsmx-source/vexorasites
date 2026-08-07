create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  site_slug text not null,
  event_name text not null check (event_name in ('page_view','link_click','form_submit')),
  path text not null,
  referrer_host text,
  session_id text not null,
  viewport text,
  created_at timestamptz not null default now()
);

create table if not exists public.error_events (
  id bigint generated always as identity primary key,
  message text not null,
  source text,
  path text not null,
  severity text not null default 'error' check (severity in ('warning','error','fatal')),
  fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists analytics_slug_created_idx on public.analytics_events(site_slug, created_at desc);
create index if not exists analytics_session_idx on public.analytics_events(session_id, created_at desc);
create index if not exists errors_created_idx on public.error_events(created_at desc);
create index if not exists errors_fingerprint_idx on public.error_events(fingerprint, created_at desc);

alter table public.analytics_events enable row level security;
alter table public.error_events enable row level security;

drop policy if exists "analytics_public_insert" on public.analytics_events;
create policy "analytics_public_insert" on public.analytics_events for insert to anon, authenticated with check (
  length(site_slug) between 1 and 120 and length(path) between 1 and 500 and length(session_id) between 8 and 120
);

drop policy if exists "errors_public_insert" on public.error_events;
create policy "errors_public_insert" on public.error_events for insert to anon, authenticated with check (
  length(message) between 1 and 2000 and length(path) between 1 and 500
);
