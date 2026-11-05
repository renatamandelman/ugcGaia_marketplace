-- ============================================
-- GaiaUGC — Retiro de saldo del wallet (SIMULADO)
--
-- El creador cobra en su wallet cuando la marca aprueba la entrega
-- (review_deliverable hace el release). Este módulo le permite sacar
-- ese saldo: se descuenta del wallet y queda una solicitud pendiente
-- con el CBU/alias de destino.
--
-- IMPORTANTE: no mueve dinero real. Un payout de verdad requiere
-- Stripe Connect (cuentas Express + onboarding + KYC) y transferencias
-- desde el balance de la plataforma. Acá modelamos la máquina de
-- estados para que el flujo sea completo y auditable.
-- ============================================

-- ---------- 1. Permitir el kind 'withdrawal' ----------
alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_kind_check;

alter table public.wallet_transactions
  add constraint wallet_transactions_kind_check
  check (kind in ('hold', 'release', 'refund', 'deposit', 'premium', 'withdrawal'));

-- ---------- 2. Solicitudes de retiro ----------
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method text not null default 'cbu' check (method in ('cbu', 'alias')),
  destination text not null,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index if not exists withdrawals_user_idx
  on public.withdrawals (user_id, created_at desc);
create index if not exists withdrawals_status_idx
  on public.withdrawals (status, created_at desc);

-- ---------- 3. RLS ----------
alter table public.withdrawals enable row level security;

drop policy if exists "Users can view their withdrawals" on public.withdrawals;
create policy "Users can view their withdrawals"
  on public.withdrawals for select using (auth.uid() = user_id);

revoke all on public.withdrawals from anon, authenticated;
grant select on public.withdrawals to authenticated;
grant all on public.withdrawals to service_role;

-- ---------- 4. Solicitar retiro ----------
-- security definer: toca wallets y wallet_transactions, que están
-- revocadas para authenticated. El usuario solo entra por acá.
create or replace function public.request_withdrawal(
  p_amount numeric,
  p_method text,
  p_destination text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_amount numeric(12, 2) := round(coalesce(p_amount, 0), 2);
  v_method text := lower(btrim(coalesce(p_method, '')));
  v_destination text := btrim(coalesce(p_destination, ''));
  v_balance numeric(12, 2);
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Necesitás iniciar sesión';
  end if;

  if v_amount <= 0 then
    raise exception 'El monto tiene que ser mayor a cero';
  end if;

  if v_amount < 5 then
    raise exception 'El retiro mínimo es USD 5';
  end if;

  if v_method not in ('cbu', 'alias') then
    raise exception 'Elegí CBU/CVU o alias como destino';
  end if;

  if v_method = 'cbu' then
    if v_destination !~ '^[0-9]{22}$' then
      raise exception 'El CBU/CVU tiene que tener exactamente 22 dígitos';
    end if;
  else
    if v_destination !~ '^[a-zA-Z0-9.\-]{6,20}$' then
      raise exception 'El alias tiene que tener entre 6 y 20 caracteres: letras, números, punto o guión';
    end if;
  end if;

  insert into public.wallets (user_id, balance)
  values (v_user, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.wallets
  where user_id = v_user
  for update;

  if v_balance < v_amount then
    raise exception 'Saldo insuficiente: tenés USD % disponibles', v_balance;
  end if;

  update public.wallets
  set balance = balance - v_amount, updated_at = now()
  where user_id = v_user;

  insert into public.withdrawals (user_id, amount, method, destination)
  values (v_user, v_amount, v_method, v_destination)
  returning id into v_id;

  insert into public.wallet_transactions (user_id, kind, amount)
  values (v_user, 'withdrawal', -v_amount);

  return v_id;
end;
$$;

-- ---------- 5. Cancelar retiro pendiente (devuelve el saldo) ----------
create or replace function public.cancel_withdrawal(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_amount numeric(12, 2);
  v_status text;
begin
  if v_user is null then
    raise exception 'Necesitás iniciar sesión';
  end if;

  select amount, status into v_amount, v_status
  from public.withdrawals
  where id = p_id and user_id = v_user
  for update;

  if v_amount is null then
    raise exception 'El retiro no existe';
  end if;

  if v_status <> 'pending' then
    raise exception 'Solo podés cancelar retiros pendientes';
  end if;

  update public.withdrawals
  set status = 'cancelled', settled_at = now()
  where id = p_id;

  update public.wallets
  set balance = balance + v_amount, updated_at = now()
  where user_id = v_user;

  insert into public.wallet_transactions (user_id, kind, amount)
  values (v_user, 'refund', v_amount);
end;
$$;

-- ---------- 6. Permisos ----------
-- Ojo: Postgres da EXECUTE a PUBLIC en cada función nueva. Si solo
-- revocás a anon/authenticated, el grant a PUBLIC sigue vigente.
revoke all on function public.request_withdrawal(numeric, text, text) from public, anon, authenticated;
revoke all on function public.cancel_withdrawal(uuid) from public, anon, authenticated;

-- Estas SÍ las llama el usuario logueado: usan auth.uid() internamente.
grant execute on function public.request_withdrawal(numeric, text, text) to authenticated;
grant execute on function public.cancel_withdrawal(uuid) to authenticated;

grant execute on function public.request_withdrawal(numeric, text, text) to service_role;
grant execute on function public.cancel_withdrawal(uuid) to service_role;
