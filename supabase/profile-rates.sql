-- ============================================
-- GaiaUGC — Tarifa base del creador
--
-- Reemplaza las "rate cards" hardcodeadas que mostraba el portfolio
-- público: antes TODOS los creadores veían los mismos 3 paquetes con
-- los mismos precios ($350 / $750 / $1200), aunque nunca los hubieran
-- configurado. Eso era información inventada presentada como real.
--
-- Ahora cada creador declara una tarifa base (USD por entregable) desde
-- Perfil Personal, y el portfolio muestra ese valor o un empty state.
-- ============================================

alter table public.profiles
  add column if not exists base_rate numeric(12, 2);

alter table public.profiles
  drop constraint if exists profiles_base_rate_check;

alter table public.profiles
  add constraint profiles_base_rate_check
  check (base_rate is null or base_rate > 0);

comment on column public.profiles.base_rate is
  'Tarifa base en USD por entregable declarada por el creador. Null = sin tarifa publicada.';
