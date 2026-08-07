-- Ensure public.plans table exists
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly integer not null default 0,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

-- Seed Plans
insert into public.plans(id, name, price_monthly, limits) values
  ('free', 'Gratis', 0, '{"projects":1,"storage_mb":100,"branding":true}'),
  ('starter', 'Emprendedor', 24900, '{"projects":5,"storage_mb":1024,"branding":false}'),
  ('business', 'Negocio', 49900, '{"projects":15,"storage_mb":5120,"branding":false}'),
  ('pro', 'Pro', 89900, '{"projects":50,"storage_mb":20480,"branding":false}')
on conflict (id) do update set 
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  limits = excluded.limits;

-- Ensure template_categories table exists
create table if not exists public.template_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0
);

-- Seed Categories
insert into public.template_categories(name, slug, sort_order) values 
  ('Moda', 'moda', 1),
  ('Barbería', 'barberia', 2),
  ('Restaurante', 'restaurante', 3),
  ('Agencia', 'agencia', 4),
  ('Gimnasio', 'gimnasio', 5),
  ('Portafolio', 'portafolio', 6) 
on conflict (slug) do nothing;
