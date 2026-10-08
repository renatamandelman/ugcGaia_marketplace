-- ============================================
-- GaiaUGC — ABM de campañas: DELETE para marcas dueñas
-- Ejecutar en Supabase Dashboard → SQL Editor
-- (o via node scripts/apply-sql.js)
-- ============================================

-- UPDATE ya existe en schema.sql ("Brands can update their own campaigns").
-- DELETE no existía: sin esta policy, un DELETE falla por RLS aunque el
-- server action verifique la propiedad.
-- Ojo: applications referencia campaigns(id) on delete cascade,
-- así que borrar una campaña borra sus postulaciones.

create policy "Brands can delete their own campaigns"
  on public.campaigns for delete
  using (auth.uid() = brand_id);
