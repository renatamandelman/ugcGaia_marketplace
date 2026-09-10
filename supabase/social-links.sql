-- ============================================
-- GaiaUGC — Social Links (redes reales por URL)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================

-- Links de perfil público de cada red (opcionales)
alter table public.profiles
  add column if not exists tiktok_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text;

-- Ejemplo de valores:
--   tiktok_url:     https://www.tiktok.com/@usuario
--   instagram_url:  https://www.instagram.com/usuario
--   youtube_url:    https://www.youtube.com/@canal