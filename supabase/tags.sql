-- ============================================
-- GaiaUGC — Tags para búsqueda y matchmaking
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================

-- Tags como array text[]:
--   profiles:  el creador se describe a sí mismo (skincare, piel seca, unboxing, review...)
--   campaigns: la marca describe qué busca (antes/después, producto real, voz local...)
-- El matchmaking filtra por traslape de tags entre perfil y campaña.

alter table public.profiles
  add column if not exists tags text[] not null default '{}';

alter table public.campaigns
  add column if not exists tags text[] not null default '{}';

-- ---------- NORMALIZACIÓN ----------
-- Un solo punto de verdad: todo tag entra en minúscula, sin espacios
-- alrededor y sin duplicados. Así la búsqueda por overlap (&&) nunca
-- falla por "Skincare" vs "skincare", sin importar qué ruta escriba.
create or replace function public.normalize_tags()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.tags := (
    select coalesce(
      array_agg(distinct lower(btrim(tag))) filter (where btrim(tag) <> ''),
      '{}'::text[]
    )
    from unnest(coalesce(new.tags, '{}'::text[])) as tag
  );
  return new;
end;
$$;

drop trigger if exists profiles_normalize_tags on public.profiles;
create trigger profiles_normalize_tags
  before insert or update on public.profiles
  for each row execute function public.normalize_tags();

drop trigger if exists campaigns_normalize_tags on public.campaigns;
create trigger campaigns_normalize_tags
  before insert or update on public.campaigns
  for each row execute function public.normalize_tags();

-- ---------- INDEXES ----------
-- GIN: búsqueda dentro del array con @> (contiene) y && (traslapa)
create index if not exists profiles_tags_gin_idx on public.profiles using gin (tags);
create index if not exists campaigns_tags_gin_idx on public.campaigns using gin (tags);