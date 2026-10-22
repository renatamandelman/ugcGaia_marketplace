import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import type { ConversationRow } from "@/lib/db-types";

interface ProfileMini {
  id: string;
  full_name: string;
  handle: string | null;
  avatar_url: string | null;
}

interface LastMessage {
  conversation_id: string;
  body: string;
  created_at: string;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawConversations } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  const conversations = (rawConversations ?? []) as ConversationRow[];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (conversations.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Mensajes
        </h1>
        <div className="mt-6 rounded-2xl border border-dashed border-bone bg-white p-10 text-center">
          <p className="text-base font-semibold text-ink">
            Todavía no tenés conversaciones
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-taupe">
            {profile?.role === "brand"
              ? "Cuando aceptes una postulación se abre un hilo automáticamente. También podés escribirle a un creador desde su portfolio."
              : "Cuando una marca acepte tu postulación, la conversación aparece acá."}
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink
              href={profile?.role === "brand" ? "/profile" : "/campaigns"}
            >
              {profile?.role === "brand"
                ? "Ver mis campañas"
                : "Explorar campañas"}
            </ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  const profileIds = [
    ...new Set(
      conversations.flatMap((conversation) => [
        conversation.brand_id,
        conversation.creator_id,
      ])
    ),
  ];
  const campaignIds = [
    ...new Set(
      conversations
        .map((conversation) => conversation.campaign_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const conversationIds = conversations.map((conversation) => conversation.id);

  const { data: rawProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, handle, avatar_url")
    .in("id", profileIds);

  const { data: rawCampaigns } =
    campaignIds.length > 0
      ? await supabase.from("campaigns").select("id, title").in("id", campaignIds)
      : { data: [] };

  const { data: rawMessages } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  const profilesById = new Map(
    ((rawProfiles ?? []) as ProfileMini[]).map((row) => [row.id, row])
  );
  const campaignTitleById = new Map(
    (rawCampaigns ?? []).map((row) => [row.id, row.title as string])
  );

  const lastMessageByConversation = new Map<string, LastMessage>();
  for (const message of (rawMessages ?? []) as LastMessage[]) {
    if (!lastMessageByConversation.has(message.conversation_id)) {
      lastMessageByConversation.set(message.conversation_id, message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Mensajes
          </h1>
          <p className="mt-1 text-sm text-taupe">
            Tus conversaciones con {profile?.role === "brand" ? "creadores" : "marcas"}.
          </p>
        </div>
        <ButtonLink
          href={profile?.role === "brand" ? "/profile" : "/campaigns"}
          variant="secondary"
          size="sm"
        >
          {profile?.role === "brand" ? "Volver al panel" : "Explorar campañas"}
        </ButtonLink>
      </div>

      <ul className="mt-6 divide-y divide-bone/60 overflow-hidden rounded-2xl border border-bone bg-white">
        {conversations.map((conversation) => {
          const otherId =
            conversation.brand_id === user.id
              ? conversation.creator_id
              : conversation.brand_id;
          const other = profilesById.get(otherId);
          const campaignTitle = conversation.campaign_id
            ? campaignTitleById.get(conversation.campaign_id)
            : null;
          const lastMessage = lastMessageByConversation.get(conversation.id);
          const name = other?.full_name || "Usuario de Gaia";

          return (
            <li key={conversation.id}>
              <Link
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper/60"
              >
                <Avatar name={name} src={other?.avatar_url ?? null} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {name}
                    </p>
                    {lastMessage ? (
                      <span className="shrink-0 text-xs text-taupe">
                        {formatWhen(lastMessage.created_at)}
                      </span>
                    ) : null}
                  </div>
                  {campaignTitle ? (
                    <p className="truncate text-xs font-medium text-brand">
                      {campaignTitle}
                    </p>
                  ) : (
                    <p className="truncate text-xs text-taupe">
                      Contacto directo
                    </p>
                  )}
                  <p className="mt-0.5 truncate text-sm text-taupe">
                    {lastMessage?.body ?? "Todavía no hay mensajes. Escribí el primero."}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
