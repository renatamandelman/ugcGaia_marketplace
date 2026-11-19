-- ============================================
-- GaiaUGC — Imagen opcional en campañas (briefs)
-- Las imágenes viven en el bucket "media" (carpeta campaigns/),
-- ver media-storage.sql.
-- ============================================

alter table public.campaigns
  add column if not exists image_url text;
