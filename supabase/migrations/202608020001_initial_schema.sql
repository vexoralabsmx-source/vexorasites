create extension if not exists "pgcrypto";

-- Enum Types (Idempotent)
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

-- Tables (Idempotent)
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text not null, full_name text, avatar_url text, role text not null default 'user' check (role in ('user','admin')), plan_key text not null default 'free', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.workspaces (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade, name text not null, slug text not null unique, created_at timestamptz not null default now());
create table if not exists public.workspace_members (workspace_id uuid references public.workspaces(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade, role public.member_role not null default 'viewer', created_at timestamptz not null default now(), primary key(workspace_id,user_id));
create table if not exists public.template_categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sort_order integer not null default 0);
create table if not exists public.templates (id uuid primary key default gen_random_uuid(), category_id uuid references public.template_categories(id), name text not null, slug text not null unique, description text, schema jsonb not null default '{}'::jsonb, thumbnail_url text, is_active boolean not null default true, is_premium boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.sites (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade, workspace_id uuid references public.workspaces(id) on delete set null, name text not null, slug text not null unique check (slug ~ '^[a-z0-9-]+$'), description text, thumbnail_url text, template_id uuid references public.templates(id) on delete set null, status public.site_status not null default 'draft', site_schema jsonb not null default '{}'::jsonb, published_schema jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz);
create table if not exists public.pages (id uuid primary key default gen_random_uuid(), site_id uuid not null references public.sites(id) on delete cascade, name text not null, slug text not null default '', schema jsonb not null default '{}'::jsonb, sort_order integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.site_versions (id uuid primary key default gen_random_uuid(), site_id uuid not null references public.sites(id) on delete cascade, created_by uuid references public.profiles(id), schema jsonb not null, label text, created_at timestamptz not null default now());
create table if not exists public.assets (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade, workspace_id uuid references public.workspaces(id) on delete cascade, site_id uuid references public.sites(id) on delete cascade, storage_path text not null, file_name text not null, mime_type text not null, size_bytes bigint not null check (size_bytes <= 10485760), created_at timestamptz not null default now());
create table if not exists public.publications (id uuid primary key default gen_random_uuid(), site_id uuid not null references public.sites(id) on delete cascade, version_id uuid references public.site_versions(id), slug text not null, published_by uuid references public.profiles(id), created_at timestamptz not null default now());
create table if not exists public.plans (id text primary key, name text not null, price_monthly integer not null default 0, limits jsonb not null default '{}'::jsonb, is_active boolean not null default true);
create table if not exists public.subscriptions (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, plan_id text not null references public.plans(id), status text not null default 'demo', provider text, provider_subscription_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.activity_logs (id bigint generated always as identity primary key, workspace_id uuid references public.workspaces(id) on delete cascade, actor_id uuid references public.profiles(id) on delete set null, site_id uuid references public.sites(id) on delete cascade, action text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());

-- Indexes (Idempotent)
create index if not exists sites_owner_idx on public.sites(owner_id);
create index if not exists sites_workspace_idx on public.sites(workspace_id);
create index if not exists pages_site_idx on public.pages(site_id, sort_order);
create index if not exists versions_site_idx on public.site_versions(site_id, created_at desc);
create index if not exists activity_workspace_idx on public.activity_logs(workspace_id, created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.sites enable row level security;
alter table public.pages enable row level security;
alter table public.site_versions enable row level security;
alter table public.assets enable row level security;
alter table public.publications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activity_logs enable row level security;

-- Policies (Idempotent)
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "workspace_members_read" on public.workspace_members;
create policy "workspace_members_read" on public.workspace_members for select using (user_id = auth.uid() or exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=auth.uid()));

drop policy if exists "workspaces_member_access" on public.workspaces;
create policy "workspaces_member_access" on public.workspaces for select using (owner_id=auth.uid() or exists(select 1 from public.workspace_members wm where wm.workspace_id=id and wm.user_id=auth.uid()));

drop policy if exists "workspaces_owner_write" on public.workspaces;
create policy "workspaces_owner_write" on public.workspaces for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

drop policy if exists "sites_member_read" on public.sites;
create policy "sites_member_read" on public.sites for select using (owner_id=auth.uid() or exists(select 1 from public.workspace_members wm where wm.workspace_id=sites.workspace_id and wm.user_id=auth.uid()));

drop policy if exists "sites_editor_write" on public.sites;
create policy "sites_editor_write" on public.sites for all using (owner_id=auth.uid() or exists(select 1 from public.workspace_members wm where wm.workspace_id=sites.workspace_id and wm.user_id=auth.uid() and wm.role in ('owner','admin','editor'))) with check (owner_id=auth.uid() or exists(select 1 from public.workspace_members wm where wm.workspace_id=sites.workspace_id and wm.user_id=auth.uid() and wm.role in ('owner','admin','editor')));

drop policy if exists "pages_site_access" on public.pages;
create policy "pages_site_access" on public.pages for all using (exists(select 1 from public.sites s where s.id=site_id and (s.owner_id=auth.uid() or exists(select 1 from public.workspace_members wm where wm.workspace_id=s.workspace_id and wm.user_id=auth.uid()))));

drop policy if exists "versions_site_access" on public.site_versions;
create policy "versions_site_access" on public.site_versions for all using (exists(select 1 from public.sites s where s.id=site_id and s.owner_id=auth.uid()));

drop policy if exists "assets_owner_access" on public.assets;
create policy "assets_owner_access" on public.assets for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

drop policy if exists "publications_owner_access" on public.publications;
create policy "publications_owner_access" on public.publications for all using (exists(select 1 from public.sites s where s.id=site_id and s.owner_id=auth.uid()));

drop policy if exists "subscriptions_member_read" on public.subscriptions;
create policy "subscriptions_member_read" on public.subscriptions for select using (exists(select 1 from public.workspace_members wm where wm.workspace_id=subscriptions.workspace_id and wm.user_id=auth.uid()));

drop policy if exists "activity_member_read" on public.activity_logs;
create policy "activity_member_read" on public.activity_logs for select using (exists(select 1 from public.workspace_members wm where wm.workspace_id=activity_logs.workspace_id and wm.user_id=auth.uid()));

drop policy if exists "published_sites_public" on public.sites;
create policy "published_sites_public" on public.sites for select using (status='published' and published_schema is not null);

-- Functions & Triggers (Idempotent)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,full_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing; return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
