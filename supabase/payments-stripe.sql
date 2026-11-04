-- ============================================
-- GaiaUGC — Pagos con Stripe (modo test) + plan premium
-- ============================================
-- Qué hace:
--   1) Permite que la wallet reciba plata (recargas) además de retener/liberar.
--   2) Agrega el plan de cuenta (free | premium) en profiles.
--   3) Crea la tabla payments para auditar cada checkout de Stripe.
--   4) Crea RPC idempotentes que SOLO el service role puede ejecutar
--      (las llama el webhook de Stripe, nunca el navegador).
-- ============================================

-- ---------- 1) WALLET: nuevos tipos de movimiento ----------
alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_kind_check;

alter table public.wallet_transactions
  add constraint wallet_transactions_kind_check
  check (kind in ('hold', 'release', 'refund', 'deposit', 'premium'));

-- ---------- 2) PLAN DE CUENTA ----------
alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'premium'));

alter table public.profiles
  add column if not exists premium_until timestamptz;

create index if not exists profiles_plan_idx on public.profiles (plan);

-- ---------- 3) PAGOS (auditoría de Stripe) ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_session_id text unique,
  stripe_subscription_id text,
  kind text not null check (kind in ('wallet_topup', 'premium')),
  amount numeric(12, 2) not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payments_user_idx
  on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

-- Cada usuario puede ver sus propios pagos. Las altas las hace el webhook
-- con service role (bypassa RLS), nunca el navegador.
drop policy if exists "payments: ver los propios" on public.payments;
create policy "payments: ver los propios"
  on public.payments for select
  using (auth.uid() = user_id);

-- ---------- 4) RPC: acreditar recarga (idempotente por session) ----------
create or replace function public.process_wallet_topup(
  p_session_id text,
  p_user_id uuid,
  p_amount numeric
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Monto inválido';
  end if;

  -- Idempotencia: si la session ya fue procesada, no acreditamos de nuevo.
  insert into public.payments (
    user_id, stripe_session_id, kind, amount, currency, status, paid_at
  )
  values (
    p_user_id, p_session_id, 'wallet_topup', p_amount, 'usd', 'paid', now()
  )
  on conflict (stripe_session_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into public.wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.wallets
  set balance = balance + p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.wallet_transactions (user_id, kind, amount)
  values (p_user_id, 'deposit', p_amount);

  return true;
end;
$$;

-- ---------- 5) RPC: activar premium (idempotente por session) ----------
create or replace function public.activate_premium(
  p_session_id text,
  p_user_id uuid,
  p_amount numeric,
  p_subscription_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int;
begin
  insert into public.payments (
    user_id, stripe_session_id, stripe_subscription_id, kind, amount,
    currency, status, paid_at
  )
  values (
    p_user_id, p_session_id, p_subscription_id, 'premium', coalesce(p_amount, 0),
    'usd', 'paid', now()
  )
  on conflict (stripe_session_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  update public.profiles
  set plan = 'premium',
      premium_until = now() + interval '31 days',
      updated_at = now()
  where id = p_user_id;

  return true;
end;
$$;

-- ---------- 6) RPC: desactivar premium (suscripción cancelada) ----------
create or replace function public.deactivate_premium(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set plan = 'free',
      premium_until = null,
      updated_at = now()
  where id = p_user_id;
end;
$$;

-- ---------- 7) Permisos: solo service_role ----------
-- OJO: en Postgres toda función nace con EXECUTE para PUBLIC. Si solo
-- revocás a anon/authenticated, el grant a PUBLIC sigue vigente y cualquiera
-- con la anon key podría acreditarse saldo. Hay que revocar a PUBLIC.
revoke all on function public.process_wallet_topup(text, uuid, numeric) from public, anon, authenticated;
revoke all on function public.activate_premium(text, uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.deactivate_premium(uuid) from public, anon, authenticated;

grant execute on function public.process_wallet_topup(text, uuid, numeric) to service_role;
grant execute on function public.activate_premium(text, uuid, numeric, text) to service_role;
grant execute on function public.deactivate_premium(uuid) to service_role;
