-- ============================================
-- GaiaUGC — Campos de marca en profiles
-- (industry + website para cuentas brand)
-- ============================================

alter table public.profiles
  add column if not exists industry text,
  add column if not exists website text;

-- Trigger: copia también industry/website del metadata al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, industry, website)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'creator'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'industry',
    new.raw_user_meta_data->>'website'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();