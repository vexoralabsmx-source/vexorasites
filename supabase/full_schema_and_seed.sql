-- ========================================================
-- VEXORA SITES: FULL DATABASE SCHEMA & SEED SCRIPT
-- Self-contained, Idempotent script for Supabase SQL Editor
-- ========================================================

create extension if not exists "pgcrypto";

-- Enum Types
do $$ begin
  create type public.site_status as enum ('draft', 'published', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_role as enum ('owner', 'admin', 'editor', 'viewer');
exception
  when duplicate_object then null;
end $$;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  plan_key text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role public.member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key(workspace_id,user_id)
);

create table if not exists public.template_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.template_categories(id),
  name text not null,
  slug text not null unique,
  description text,
  schema jsonb not null default '{}'::jsonb,
  thumbnail_url text,
  is_active boolean not null default true,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text,
  thumbnail_url text,
  template_id uuid references public.templates(id) on delete set null,
  status public.site_status not null default 'draft',
  site_schema jsonb not null default '{}'::jsonb,
  published_schema jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  slug text not null default '',
  schema jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  created_by uuid references public.profiles(id),
  schema jsonb not null,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes <= 10485760),
  created_at timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  version_id uuid references public.site_versions(id),
  slug text not null,
  published_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly integer not null default 0,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status text not null default 'demo',
  provider text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  site_id uuid references public.sites(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

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

-- Indexes (Idempotent)
create index if not exists sites_owner_idx on public.sites(owner_id);
create index if not exists sites_workspace_idx on public.sites(workspace_id);
create index if not exists pages_site_idx on public.pages(site_id, sort_order);
create index if not exists versions_site_idx on public.site_versions(site_id, created_at desc);
create index if not exists activity_workspace_idx on public.activity_logs(workspace_id, created_at desc);
create index if not exists analytics_slug_created_idx on public.analytics_events(site_slug, created_at desc);
create index if not exists analytics_session_idx on public.analytics_events(session_id, created_at desc);
create index if not exists errors_created_idx on public.error_events(created_at desc);
create index if not exists errors_fingerprint_idx on public.error_events(fingerprint, created_at desc);

-- Functions & Triggers
create or replace function public.publish_site(p_site_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_version_id uuid;
  v_slug text;
begin
  update public.sites
  set published_schema = site_schema,
      status = 'published',
      published_at = now(),
      updated_at = now()
  where id = p_site_id
  returning slug into v_slug;

  if v_slug is null then
    raise exception 'Site not found or access denied';
  end if;

  insert into public.site_versions(site_id, created_by, schema, label)
  select id, auth.uid(), published_schema, 'Publicación'
  from public.sites
  where id = p_site_id
  returning id into v_version_id;

  insert into public.publications(site_id, version_id, slug, published_by)
  values (p_site_id, v_version_id, v_slug, auth.uid());

  return v_version_id;
end;
$$;

grant execute on function public.publish_site(uuid) to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,full_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing; return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Seed Data
insert into public.plans(id, name, price_monthly, limits) values
  ('free', 'Gratis', 0, '{"projects":1,"storage_mb":100,"branding":true}'),
  ('starter', 'Emprendedor', 24900, '{"projects":5,"storage_mb":1024,"branding":false}'),
  ('business', 'Negocio', 49900, '{"projects":15,"storage_mb":5120,"branding":false}'),
  ('pro', 'Pro', 89900, '{"projects":50,"storage_mb":20480,"branding":false}')
on conflict (id) do update set 
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  limits = excluded.limits;

insert into public.template_categories(name, slug, sort_order) values 
  ('Moda', 'moda', 1),
  ('Barbería', 'barberia', 2),
  ('Restaurante', 'restaurante', 3),
  ('Agencia', 'agencia', 4),
  ('Gimnasio', 'gimnasio', 5),
  ('Portafolio', 'portafolio', 6) 
on conflict (slug) do nothing;
