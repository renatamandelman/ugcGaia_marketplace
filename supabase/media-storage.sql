-- ============================================
-- GaiaUGC — Media Storage (banners + avatares)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================

-- ---------- BUCKET ----------
-- Bucket público "media" para banners, avatares y thumbnails de portfolio
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ---------- STORAGE RLS ----------
-- Lectura pública (las URLs públicas las ve cualquiera)
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Cualquier usuario autenticado puede subir archivos
create policy "Authenticated users can upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

-- El dueño del archivo puede actualizar/borrar sus propios archivos
create policy "Owners can update their media"
  on storage.objects for update
  using (bucket_id = 'media' and owner = auth.uid());

create policy "Owners can delete their media"
  on storage.objects for delete
  using (bucket_id = 'media' and owner = auth.uid());

-- ---------- PROFILES: banner_url ----------
alter table public.profiles
  add column if not exists banner_url text;

-- ============================================
-- FLUJO DE SUBIDA (desde el frontend):
-- 1. supabase.storage.from('media').upload(`banners/${userId}.jpg`, file)
-- 2. supabase.storage.from('media').getPublicUrl(`banners/${userId}.jpg`)
-- 3. UPDATE profiles SET banner_url = url, avatar_url = url
-- ============================================