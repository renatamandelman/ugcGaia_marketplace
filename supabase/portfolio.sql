-- ============================================
-- GaiaUGC — Portfolio Items Table
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================

-- ---------- PORTFOLIO ITEMS ----------
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  media_type text not null default 'video' check (media_type in ('video', 'image')),
  media_url text not null, -- link de TikTok/Instagram/YouTube (video) o URL de imagen
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube', 'other')),
  thumbnail_url text, -- opcional: screenshot del video
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.portfolio_items enable row level security;

-- Portfolio público: cualquier persona puede ver los items
-- (los portfolios existen para que las marcas los vean sin registrarse)
create policy "Anyone can view portfolio items"
  on public.portfolio_items for select using (true);

-- El creador ve sus propios items
create policy "Creators can view their own portfolio items"
  on public.portfolio_items for select using (
    auth.uid() = creator_id
  );

-- Las marcas pueden ver items de creadores que aplicaron a sus campañas
create policy "Brands can view portfolio items of applicants"
  on public.portfolio_items for select using (
    exists (
      select 1 from public.applications a
      where a.creator_id = portfolio_items.creator_id
      and exists (
        select 1 from public.campaigns c
        where c.id = a.campaign_id and c.brand_id = auth.uid()
      )
    )
  );

-- El creador puede insertar sus propios items
create policy "Creators can insert their own portfolio items"
  on public.portfolio_items for insert with check (
    auth.uid() = creator_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'creator'
    )
  );

-- El creador puede actualizar sus propios items
create policy "Creators can update their own portfolio items"
  on public.portfolio_items for update using (
    auth.uid() = creator_id
  );

-- El creador puede eliminar sus propios items
create policy "Creators can delete their own portfolio items"
  on public.portfolio_items for delete using (
    auth.uid() = creator_id
  );

-- ---------- INDEXES ----------
create index if not exists portfolio_items_creator_idx on public.portfolio_items (creator_id);

-- ---------- GRANTS ----------
grant all on public.portfolio_items to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- ============================================
-- MIGRACIÓN: si ya tenés la tabla vieja (video_url),
-- correr esto para actualizar el esquema:
-- ============================================
-- alter table public.portfolio_items
--   add column if not exists media_type text not null default 'video'
--   check (media_type in ('video', 'image'));
-- alter table public.portfolio_items
--   add column if not exists media_url text;
-- update public.portfolio_items set media_url = video_url where media_url is null;
-- alter table public.portfolio_items alter column media_url set not null;
-- alter table public.portfolio_items drop column if exists video_url;