-- ============================================
-- GaiaUGC — Eliminar la columna niche
-- Ejecutar en Supabase Dashboard → SQL Editor
-- (o via node scripts/apply-sql.js)
-- ============================================

-- El "nicho" era un tercer sistema de clasificación en paralelo a tags
-- (categoría gruesa) y category en campañas. Quedaba a medias y rompía el
-- selector de settings. Los tags son la única fuente de verdad para búsqueda
-- y matchmaking, así que se elimina la columna.

alter table public.profiles drop column if exists niche;