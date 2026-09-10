-- ============================================
-- GaiaUGC — Schema inicial (MV P)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================

-- ---------- PROFILES ----------
-- Extiende auth.users con datos de la app
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'creator' check (role in ('creator', 'brand')),
  full_name text not null default '',
  handle text,
  bio text,
  avatar_url text,
  portfolio_url text,
  niche text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: crea un profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'creator'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CAMPAIGNS ----------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  budget_min numeric not null,
  budget_max numeric,
  deliverables text,
  deadline date,
  status text not null default 'open' check (status in ('open', 'filled', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------- APPLICATIONS ----------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  pitch text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.applications enable row level security;

-- Profiles: vista pública, escritura solo del dueño
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Campaigns: lectura pública, creación solo marcas, edición del dueño
create policy "Campaigns are viewable by everyone"
  on public.campaigns for select using (true);

create policy "Brands can create campaigns"
  on public.campaigns for insert with check (
    auth.uid() = brand_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'brand'
    )
  );

create policy "Brands can update their own campaigns"
  on public.campaigns for update using (auth.uid() = brand_id);

-- Applications: vista para el postulante y el dueño de la campaña
create policy "Applications are viewable by campaign owner or applicant"
  on public.applications for select using (
    auth.uid() = creator_id
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_id = auth.uid()
    )
  );

create policy "Creators can apply to campaigns"
  on public.applications for insert with check (
    auth.uid() = creator_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'creator'
    )
  );

-- El dueño de la campaña acepta o rechaza postulaciones
create policy "Campaign owners can update applications"
  on public.applications for update using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_id = auth.uid()
    )
  );

-- ---------- GRANTS ----------
-- PostgREST ejecuta como anon/authenticated. Sin estos permisos no se ve nada,
-- aunque RLS esté activo (RLS filtra, el GRANT permite).
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- ---------- INDEXES ----------
create index if not exists campaigns_status_idx on public.campaigns (status);
create index if not exists campaigns_brand_idx on public.campaigns (brand_id);
create index if not exists applications_campaign_idx on public.applications (campaign_id);
create index if not exists applications_creator_idx on public.applications (creator_id);