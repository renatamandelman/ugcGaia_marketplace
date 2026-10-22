-- ============================================
-- GaiaUGC — Mensajería marca <-> creador
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================
--
-- Modelo:
--   conversations: un hilo entre una marca y un creador.
--     - campaign_id / application_id: si nace de una postulación aceptada.
--     - null en ambos: contacto directo desde el portfolio del creador.
--   messages: mensajes del hilo (texto plano).
--
-- Aceptar una postulación debe ser ATÓMICO: cambiar estado + crear hilo +
-- mandar el primer mensaje. Por eso vive en la función accept_application().

-- ---------- CONVERSATIONS ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  application_id uuid unique references public.applications(id) on delete set null,
  brand_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_participants_check check (brand_id <> creator_id)
);

-- ---------- MESSAGES ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_check check (btrim(body) <> '')
);

-- ---------- RLS ----------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Cada participante ve solo sus hilos
create policy "Participants can view their conversations"
  on public.conversations for select using (
    auth.uid() = brand_id or auth.uid() = creator_id
  );

-- Solo una marca puede iniciar un hilo, y solo en su nombre
create policy "Brands can start conversations"
  on public.conversations for insert with check (
    auth.uid() = brand_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'brand'
    )
    and (
      campaign_id is null
      or exists (
        select 1 from public.campaigns c
        where c.id = campaign_id and c.brand_id = auth.uid()
      )
    )
  );

-- Participantes ven los mensajes de sus hilos
create policy "Participants can view messages"
  on public.messages for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (auth.uid() = c.brand_id or auth.uid() = c.creator_id)
    )
  );

-- Solo participantes escriben, y siempre como ellos mismos
create policy "Participants can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (auth.uid() = c.brand_id or auth.uid() = c.creator_id)
    )
  );

-- ---------- TRIGGER: ordenar la bandeja por último mensaje ----------
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------- ACEPTAR POSTULACIÓN (atómico) ----------
-- Valida que quien llama sea el dueño de la campaña, marca la postulación
-- como aceptada, crea (o reutiliza) el hilo y manda el primer mensaje.
create or replace function public.accept_application(
  p_application_id uuid,
  p_message text
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

  -- Si ya estaba aceptada, devolvemos el hilo existente sin duplicar mensajes
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

revoke all on function public.accept_application(uuid, text) from public, anon;
grant execute on function public.accept_application(uuid, text) to authenticated;

-- ---------- INDEXES ----------
create index if not exists conversations_brand_idx on public.conversations (brand_id);
create index if not exists conversations_creator_idx on public.conversations (creator_id);
create index if not exists conversations_campaign_idx on public.conversations (campaign_id);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------- GRANTS ----------
grant all on public.conversations to anon, authenticated, service_role;
grant all on public.messages to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
