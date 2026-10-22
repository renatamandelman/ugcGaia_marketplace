-- ============================================
-- GaiaUGC — Notificaciones in-app
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================
--
-- Una sola fuente de verdad para los badges del navbar:
--   - type = 'message_received'      → badge del icono Mensajes
--   - resto de tipos                → badge del icono Notificaciones
--
-- Las notificaciones se crean con TRIGGERS SECURITY DEFINER, nunca desde
-- el cliente. Así no hay forma de fabricar notificaciones ajenas.

-- ---------- TABLA ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (
    type in (
      'application_received',
      'application_accepted',
      'application_rejected',
      'message_received'
    )
  ),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.notifications enable row level security;

drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- NUEVA POSTULACIÓN → avisa a la marca ----------
create or replace function public.notify_new_application()
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
  select c.brand_id, c.title, p.full_name
    into v_brand, v_campaign, v_creator
  from public.campaigns c
  join public.profiles p on p.id = new.creator_id
  where c.id = new.campaign_id;

  if v_brand is null then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_brand,
    'application_received',
    'Nueva postulación de ' || coalesce(v_creator, 'un creador'),
    v_campaign,
    '/profile'
  );

  return new;
end;
$$;

drop trigger if exists applications_notify_new on public.applications;
create trigger applications_notify_new
  after insert on public.applications
  for each row execute function public.notify_new_application();

-- ---------- RECHAZO → avisa al creador ----------
-- La aceptación la notifica el trigger de mensajes (primer mensaje del hilo),
-- para que el aviso tenga el link directo a la conversación.
create or replace function public.notify_application_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'rejected' then
    select c.title into v_campaign
    from public.campaigns c
    where c.id = new.campaign_id;

    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.creator_id,
      'application_rejected',
      'Postulación no seleccionada',
      'Tu postulación a "' || coalesce(v_campaign, 'la campaña') || '" no fue seleccionada.',
      '/dashboard'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists applications_notify_status on public.applications;
create trigger applications_notify_status
  after update of status on public.applications
  for each row execute function public.notify_application_status();

-- ---------- MENSAJE → avisa a la otra parte ----------
-- Si es el PRIMER mensaje de un hilo nacido de una postulación, el aviso es
-- "Aceptaron tu postulación" (con link directo al hilo). Si no, "Nuevo mensaje".
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brand uuid;
  v_creator uuid;
  v_application uuid;
  v_recipient uuid;
  v_sender text;
  v_total int;
  v_link text;
begin
  select brand_id, creator_id, application_id
    into v_brand, v_creator, v_application
  from public.conversations
  where id = new.conversation_id;

  if v_brand is null then
    return new;
  end if;

  v_recipient := case
    when new.sender_id = v_brand then v_creator
    else v_brand
  end;

  v_link := '/messages/' || new.conversation_id::text;

  select count(*) into v_total
  from public.messages
  where conversation_id = new.conversation_id;

  if v_total = 1 and v_application is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_recipient,
      'application_accepted',
      '¡Aceptaron tu postulación!',
      left(new.body, 180),
      v_link
    );
  else
    select full_name into v_sender
    from public.profiles
    where id = new.sender_id;

    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_recipient,
      'message_received',
      'Nuevo mensaje de ' || coalesce(v_sender, 'Gaia'),
      left(new.body, 180),
      v_link
    );
  end if;

  return new;
end;
$$;

drop trigger if exists messages_notify_new on public.messages;
create trigger messages_notify_new
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ---------- INDEXES ----------
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id) where read_at is null;

-- ---------- GRANTS ----------
-- El cliente solo puede leer y marcar como leída. Insertar/editar contenido
-- queda reservado a los triggers SECURITY DEFINER.
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all on public.notifications to service_role;
