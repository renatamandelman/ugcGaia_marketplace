-- ============================================
-- GaiaUGC — Colaboraciones, entregas y pago simulado
-- Ejecutar después de messages.sql y notifications.sql
-- ============================================
--
-- Modelo:
--   application aceptada → collaboration (brief congelado + pago retenido)
--   collaboration → deliverables (máximo 3 versiones, se muestra la última)
--   marca aprueba → se libera el 94% al creador y 6% queda para Gaia
--
-- La plata es SIMULADA: cada marca arranca con un saldo ficticio y se
-- mueve en wallets + wallet_transactions. No hay cobros reales.

-- ---------- NUEVOS TIPOS DE NOTIFICACIÓN ----------
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'application_received',
      'application_accepted',
      'application_rejected',
      'message_received',
      'brief_available',
      'deliverable_submitted',
      'deliverable_approved',
      'changes_requested',
      'collaboration_cancelled'
    )
  );

-- ---------- COLLABORATIONS ----------
create table if not exists public.collaborations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  application_id uuid not null unique references public.applications(id) on delete cascade,
  brand_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'brief_sent' check (
    status in ('brief_sent', 'in_progress', 'submitted', 'approved', 'cancelled')
  ),
  payment_status text not null default 'held' check (
    payment_status in ('held', 'released', 'refunded')
  ),
  amount numeric(12, 2) not null check (amount > 0),
  commission_rate numeric(5, 4) not null default 0.06,
  commission_amount numeric(12, 2) not null default 0,
  creator_amount numeric(12, 2) not null default 0,
  brief_snapshot jsonb not null default '{}'::jsonb,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- WALLETS (saldo simulado) ----------
create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  collaboration_id uuid references public.collaborations(id) on delete set null,
  kind text not null check (kind in ('hold', 'release', 'refund')),
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- ---------- DELIVERABLES ----------
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  version int not null check (version between 1 and 3),
  file_path text,
  external_url text,
  notes text,
  status text not null default 'submitted' check (
    status in ('submitted', 'approved', 'changes_requested')
  ),
  feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (collaboration_id, version),
  check (file_path is not null or external_url is not null)
);

create index if not exists collaborations_brand_idx
  on public.collaborations (brand_id, updated_at desc);
create index if not exists collaborations_creator_idx
  on public.collaborations (creator_id, updated_at desc);
create index if not exists deliverables_collaboration_idx
  on public.deliverables (collaboration_id, version desc);
create index if not exists wallet_transactions_user_idx
  on public.wallet_transactions (user_id, created_at desc);

-- ---------- RLS ----------
alter table public.collaborations enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.deliverables enable row level security;

drop policy if exists "Participants can view collaborations" on public.collaborations;
create policy "Participants can view collaborations"
  on public.collaborations for select
  using (auth.uid() = brand_id or auth.uid() = creator_id);

drop policy if exists "Users can view their wallet" on public.wallets;
create policy "Users can view their wallet"
  on public.wallets for select using (auth.uid() = user_id);

drop policy if exists "Users can view their transactions" on public.wallet_transactions;
create policy "Users can view their transactions"
  on public.wallet_transactions for select using (auth.uid() = user_id);

drop policy if exists "Participants can view deliverables" on public.deliverables;
create policy "Participants can view deliverables"
  on public.deliverables for select
  using (
    exists (
      select 1 from public.collaborations c
      where c.id = deliverables.collaboration_id
        and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
    )
  );

-- ---------- GRANTS ----------
-- Lectura para los participantes. Toda escritura pasa por RPCs SECURITY DEFINER.
revoke all on public.collaborations from anon, authenticated;
revoke all on public.wallets from anon, authenticated;
revoke all on public.wallet_transactions from anon, authenticated;
revoke all on public.deliverables from anon, authenticated;

grant select on public.collaborations to authenticated;
grant select on public.wallets to authenticated;
grant select on public.wallet_transactions to authenticated;
grant select on public.deliverables to authenticated;

grant all on public.collaborations to service_role;
grant all on public.wallets to service_role;
grant all on public.wallet_transactions to service_role;
grant all on public.deliverables to service_role;

-- ---------- STORAGE PRIVADO PARA ENTREGAS ----------
insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false)
on conflict (id) do update set public = false;

drop policy if exists "Deliverable files readable by participants" on storage.objects;
create policy "Deliverable files readable by participants"
  on storage.objects for select
  using (
    bucket_id = 'deliverables'
    and exists (
      select 1 from public.collaborations c
      where c.id::text = split_part(name, '/', 1)
        and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
    )
  );

drop policy if exists "Creators can upload deliverables" on storage.objects;
create policy "Creators can upload deliverables"
  on storage.objects for insert
  with check (
    bucket_id = 'deliverables'
    and auth.uid() is not null
    and exists (
      select 1 from public.collaborations c
      where c.id::text = split_part(name, '/', 1)
        and c.creator_id = auth.uid()
        and c.status not in ('approved', 'cancelled')
    )
  );

-- ---------- TRIGGER updated_at ----------
create or replace function public.touch_collaboration()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists collaborations_touch on public.collaborations;
create trigger collaborations_touch
  before update on public.collaborations
  for each row execute function public.touch_collaboration();

-- ---------- CORE: crear colaboración + retener pago ----------
create or replace function public.ensure_collaboration(
  p_application_id uuid,
  p_amount numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_campaign uuid;
  v_brand uuid;
  v_title text;
  v_description text;
  v_category text;
  v_deliverables text;
  v_deadline date;
  v_budget_min numeric;
  v_budget_max numeric;
  v_amount numeric;
  v_commission numeric;
  v_creator_amount numeric;
  v_balance numeric;
  v_collaboration uuid;
begin
  select a.creator_id, a.campaign_id, c.brand_id, c.title, c.description,
         c.category, c.deliverables, c.deadline, c.budget_min, c.budget_max
    into v_creator, v_campaign, v_brand, v_title, v_description,
         v_category, v_deliverables, v_deadline, v_budget_min, v_budget_max
  from public.applications a
  join public.campaigns c on c.id = a.campaign_id
  where a.id = p_application_id;

  if v_brand is null then
    raise exception 'La postulación no existe';
  end if;

  select id into v_collaboration
  from public.collaborations
  where application_id = p_application_id;

  if v_collaboration is not null then
    return v_collaboration;
  end if;

  v_amount := round(coalesce(p_amount, v_budget_min), 2);

  if v_amount is null or v_amount <= 0 then
    raise exception 'El monto de la colaboración es inválido';
  end if;

  v_commission := round(v_amount * 0.06, 2);
  v_creator_amount := v_amount - v_commission;

  insert into public.collaborations (
    campaign_id, application_id, brand_id, creator_id,
    amount, commission_amount, creator_amount, brief_snapshot, deadline
  )
  values (
    v_campaign, p_application_id, v_brand, v_creator,
    v_amount, v_commission, v_creator_amount,
    jsonb_build_object(
      'title', v_title,
      'description', v_description,
      'category', v_category,
      'deliverables', v_deliverables,
      'deadline', v_deadline,
      'budget_min', v_budget_min,
      'budget_max', v_budget_max
    ),
    v_deadline
  )
  returning id into v_collaboration;

  insert into public.wallets (user_id, balance)
  values (v_brand, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.wallets
  where user_id = v_brand
  for update;

  if v_balance < v_amount then
    raise exception 'Saldo insuficiente de la marca (disponible %, necesario %)',
      v_balance, v_amount;
  end if;

  update public.wallets
  set balance = balance - v_amount, updated_at = now()
  where user_id = v_brand;

  insert into public.wallet_transactions (user_id, collaboration_id, kind, amount)
  values (v_brand, v_collaboration, 'hold', -v_amount);

  return v_collaboration;
end;
$$;

-- ---------- ACEPTAR: colaboración + hilo + primer mensaje (atómico) ----------
-- Reemplaza la versión de messages.sql para sumar el pago retenido.
drop function if exists public.accept_application(uuid, text);

create or replace function public.accept_application(
  p_application_id uuid,
  p_message text,
  p_amount numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brand uuid;
  v_creator uuid;
  v_campaign uuid;
  v_status text;
  v_conversation uuid;
  v_collaboration uuid;
  v_body text;
begin
  select a.creator_id, a.campaign_id, a.status, c.brand_id
    into v_creator, v_campaign, v_status, v_brand
  from public.applications a
  join public.campaigns c on c.id = a.campaign_id
  where a.id = p_application_id;

  if v_brand is null then
    raise exception 'La postulación no existe';
  end if;

  if v_brand <> auth.uid() then
    raise exception 'Solo el dueño de la campaña puede aceptar postulaciones';
  end if;

  -- Idempotente: si ya existe colaboración, no vuelve a retener plata.
  v_collaboration := public.ensure_collaboration(p_application_id, p_amount);

  if v_status = 'accepted' then
    select id into v_conversation
    from public.conversations
    where application_id = p_application_id;

    if v_conversation is not null then
      return v_conversation;
    end if;
  end if;

  update public.applications
  set status = 'accepted'
  where id = p_application_id;

  insert into public.conversations (campaign_id, application_id, brand_id, creator_id)
  values (v_campaign, p_application_id, v_brand, v_creator)
  on conflict (application_id) do nothing
  returning id into v_conversation;

  if v_conversation is null then
    select id into v_conversation
    from public.conversations
    where application_id = p_application_id;
  end if;

  v_body := coalesce(
    nullif(btrim(p_message), ''),
    '¡Hola! Aceptamos tu postulación. Coordinemos los próximos pasos.'
  );

  insert into public.messages (conversation_id, sender_id, body)
  values (v_conversation, v_brand, v_body);

  return v_conversation;
end;
$$;

-- ---------- SUBIR ENTREGA (máx. 3 versiones) ----------
create or replace function public.submit_deliverable(
  p_collaboration_id uuid,
  p_file_path text default null,
  p_external_url text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_status text;
  v_version int;
  v_deliverable uuid;
begin
  select creator_id, status
    into v_creator, v_status
  from public.collaborations
  where id = p_collaboration_id;

  if v_creator is null then
    raise exception 'La colaboración no existe';
  end if;

  if v_creator <> auth.uid() then
    raise exception 'Solo el creador de la colaboración puede entregar';
  end if;

  if v_status in ('approved', 'cancelled') then
    raise exception 'La colaboración ya está cerrada';
  end if;

  if nullif(btrim(coalesce(p_file_path, '')), '') is null
     and nullif(btrim(coalesce(p_external_url, '')), '') is null then
    raise exception 'Adjuntá un archivo o un link a tu entrega';
  end if;

  if exists (
    select 1 from public.deliverables
    where collaboration_id = p_collaboration_id
      and status = 'submitted'
  ) then
    raise exception 'Ya hay una entrega esperando revisión de la marca';
  end if;

  select coalesce(max(version), 0) into v_version
  from public.deliverables
  where collaboration_id = p_collaboration_id;

  if v_version >= 3 then
    raise exception 'Ya usaste las 3 versiones permitidas';
  end if;

  v_version := v_version + 1;

  insert into public.deliverables (
    collaboration_id, creator_id, version,
    file_path, external_url, notes, status
  )
  values (
    p_collaboration_id, v_creator, v_version,
    nullif(btrim(coalesce(p_file_path, '')), ''),
    nullif(btrim(coalesce(p_external_url, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    'submitted'
  )
  returning id into v_deliverable;

  update public.collaborations
  set status = 'submitted'
  where id = p_collaboration_id;

  return v_deliverable;
end;
$$;

-- ---------- REVISAR ENTREGA ----------
create or replace function public.review_deliverable(
  p_deliverable_id uuid,
  p_decision text,
  p_feedback text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_collaboration uuid;
  v_brand uuid;
  v_creator uuid;
  v_version int;
  v_deliverable_status text;
  v_collab_status text;
  v_payment_status text;
  v_creator_amount numeric;
  v_has_newer boolean;
begin
  select d.collaboration_id, d.version, d.status,
         c.brand_id, c.creator_id, c.status, c.payment_status, c.creator_amount
    into v_collaboration, v_version, v_deliverable_status,
         v_brand, v_creator, v_collab_status, v_payment_status, v_creator_amount
  from public.deliverables d
  join public.collaborations c on c.id = d.collaboration_id
  where d.id = p_deliverable_id;

  if v_collaboration is null then
    raise exception 'La entrega no existe';
  end if;

  if v_brand <> auth.uid() then
    raise exception 'Solo la marca dueña puede revisar la entrega';
  end if;

  if v_deliverable_status <> 'submitted' then
    raise exception 'Esta entrega ya fue revisada';
  end if;

  select exists (
    select 1 from public.deliverables
    where collaboration_id = v_collaboration
      and version > v_version
  ) into v_has_newer;

  if v_has_newer then
    raise exception 'Solo se puede revisar la última versión';
  end if;

  if p_decision = 'approved' then
    if v_payment_status <> 'held' then
      raise exception 'El pago de esta colaboración ya no está retenido';
    end if;

    update public.deliverables
    set status = 'approved',
        feedback = nullif(btrim(coalesce(p_feedback, '')), ''),
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_deliverable_id;

    update public.collaborations
    set status = 'approved', payment_status = 'released'
    where id = v_collaboration;

    insert into public.wallets (user_id, balance)
    values (v_creator, 0)
    on conflict (user_id) do nothing;

    update public.wallets
    set balance = balance + v_creator_amount, updated_at = now()
    where user_id = v_creator;

    insert into public.wallet_transactions (user_id, collaboration_id, kind, amount)
    values (v_creator, v_collaboration, 'release', v_creator_amount);

  elsif p_decision = 'changes_requested' then
    if nullif(btrim(coalesce(p_feedback, '')), '') is null then
      raise exception 'Contale al creador qué cambios necesita';
    end if;

    if v_version >= 3 then
      raise exception 'Es la última versión: aprobala o cancelá la colaboración';
    end if;

    update public.deliverables
    set status = 'changes_requested',
        feedback = btrim(p_feedback),
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_deliverable_id;

    update public.collaborations
    set status = 'in_progress'
    where id = v_collaboration;
  else
    raise exception 'Decisión inválida: usá approved o changes_requested';
  end if;
end;
$$;

-- ---------- CANCELAR + REEMBOLSAR ----------
create or replace function public.cancel_collaboration(
  p_collaboration_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brand uuid;
  v_status text;
  v_payment_status text;
  v_amount numeric;
begin
  select brand_id, status, payment_status, amount
    into v_brand, v_status, v_payment_status, v_amount
  from public.collaborations
  where id = p_collaboration_id;

  if v_brand is null then
    raise exception 'La colaboración no existe';
  end if;

  if v_brand <> auth.uid() then
    raise exception 'Solo la marca dueña puede cancelar la colaboración';
  end if;

  if v_status in ('approved', 'cancelled') then
    raise exception 'La colaboración ya está cerrada';
  end if;

  if v_payment_status = 'held' then
    update public.wallets
    set balance = balance + v_amount, updated_at = now()
    where user_id = v_brand;

    insert into public.wallet_transactions (user_id, collaboration_id, kind, amount)
    values (v_brand, p_collaboration_id, 'refund', v_amount);

    update public.collaborations
    set status = 'cancelled', payment_status = 'refunded'
    where id = p_collaboration_id;
  else
    update public.collaborations
    set status = 'cancelled'
    where id = p_collaboration_id;
  end if;
end;
$$;

-- ---------- NOTIFICACIONES ----------
create or replace function public.notify_brief_available()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign text;
  v_brand text;
begin
  select c.title, b.full_name
    into v_campaign, v_brand
  from public.campaigns c
  join public.profiles b on b.id = new.brand_id
  where c.id = new.campaign_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.creator_id,
    'brief_available',
    'Brief disponible: ' || coalesce(v_campaign, 'tu colaboración'),
    'Ya podés revisar el brief de ' || coalesce(v_brand, 'la marca') || ' y subir tu entrega.',
    '/collaborations/' || new.id::text
  );

  return new;
end;
$$;

drop trigger if exists collaborations_notify_brief on public.collaborations;
create trigger collaborations_notify_brief
  after insert on public.collaborations
  for each row execute function public.notify_brief_available();

create or replace function public.notify_deliverable_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brand uuid;
  v_campaign text;
  v_creator text;
begin
  select c.brand_id, camp.title, p.full_name
    into v_brand, v_campaign, v_creator
  from public.collaborations c
  join public.campaigns camp on camp.id = c.campaign_id
  join public.profiles p on p.id = new.creator_id
  where c.id = new.collaboration_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_brand,
    'deliverable_submitted',
    'Nueva entrega de ' || coalesce(v_creator, 'un creador'),
    'Versión ' || new.version || ' de ' || coalesce(v_campaign, 'la campaña'),
    '/collaborations/' || new.collaboration_id::text
  );

  return new;
end;
$$;

drop trigger if exists deliverables_notify_submitted on public.deliverables;
create trigger deliverables_notify_submitted
  after insert on public.deliverables
  for each row execute function public.notify_deliverable_submitted();

create or replace function public.notify_deliverable_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign text;
  v_creator_amount numeric;
  v_collab uuid;
begin
  if new.status = old.status then
    return new;
  end if;

  select c.id, camp.title, c.creator_amount
    into v_collab, v_campaign, v_creator_amount
  from public.collaborations c
  join public.campaigns camp on camp.id = c.campaign_id
  where c.id = new.collaboration_id;

  if new.status = 'approved' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.creator_id,
      'deliverable_approved',
      '¡Entrega aprobada!',
      'Se liberaron $' || to_char(v_creator_amount, 'FM999G999D00') ||
        ' de "' || coalesce(v_campaign, 'la campaña') || '".',
      '/collaborations/' || v_collab::text
    );
  elsif new.status = 'changes_requested' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.creator_id,
      'changes_requested',
      'La marca pidió cambios',
      left(coalesce(new.feedback, 'Revisá el feedback de la entrega.'), 180),
      '/collaborations/' || v_collab::text
    );
  end if;

  return new;
end;
$$;

drop trigger if exists deliverables_notify_review on public.deliverables;
create trigger deliverables_notify_review
  after update of status on public.deliverables
  for each row execute function public.notify_deliverable_review();

create or replace function public.notify_collaboration_cancelled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign text;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    select title into v_campaign
    from public.campaigns
    where id = new.campaign_id;

    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.creator_id,
      'collaboration_cancelled',
      'Colaboración cancelada',
      'La marca canceló "' || coalesce(v_campaign, 'la campaña') ||
        '". El pago retenido fue devuelto.',
      '/collaborations/' || new.id::text
    );
  end if;

  return new;
end;
$$;

drop trigger if exists collaborations_notify_cancelled on public.collaborations;
create trigger collaborations_notify_cancelled
  after update of status on public.collaborations
  for each row execute function public.notify_collaboration_cancelled();

-- ---------- PERMISOS DE FUNCIONES ----------
revoke all on function public.ensure_collaboration(uuid, numeric) from public, anon, authenticated;
revoke all on function public.accept_application(uuid, text, numeric) from public, anon, authenticated;
revoke all on function public.submit_deliverable(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.review_deliverable(uuid, text, text) from public, anon, authenticated;
revoke all on function public.cancel_collaboration(uuid, text) from public, anon, authenticated;

grant execute on function public.accept_application(uuid, text, numeric) to authenticated;
grant execute on function public.submit_deliverable(uuid, text, text, text) to authenticated;
grant execute on function public.review_deliverable(uuid, text, text) to authenticated;
grant execute on function public.cancel_collaboration(uuid, text) to authenticated;

-- ---------- SALDO SIMULADO INICIAL ----------
-- Crédito ficticio para que las marcas puedan aceptar postulaciones.
insert into public.wallets (user_id, balance)
select id, 100000 from public.profiles where role = 'brand'
on conflict (user_id) do nothing;

insert into public.wallets (user_id, balance)
select id, 0 from public.profiles where role = 'creator'
on conflict (user_id) do nothing;

-- ---------- BACKFILL: aceptadas sin colaboración ----------
do $$
declare
  r record;
begin
  for r in
    select a.id
    from public.applications a
    where a.status = 'accepted'
      and not exists (
        select 1 from public.collaborations c
        where c.application_id = a.id
      )
  loop
    perform public.ensure_collaboration(r.id, null);
  end loop;
end $$;
