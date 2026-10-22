import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { MessageComposer } from "@/components/messages/message-composer";
import { MarkConversationRead } from "@/components/notifications/mark-conversation-read";
import type { ConversationRow, MessageRow } from "@/lib/db-types";

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

interface ProfileMini {
  id: string;
  full_name: string;
  handle: string | null;
  avatar_url: string | null;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata() {
  return { title: "Conversación — Gaia" };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawConversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const conversation = rawConversation as ConversationRow | null;

  if (!conversation) notFound();
  if (conversation.brand_id !== user.id && conversation.creator_id !== user.id) {
    notFound();
  }

  const isBrand = conversation.brand_id === user.id;
  const otherId = isBrand ? conversation.creator_id : conversation.brand_id;

  const [{ data: rawOther }, { data: rawCampaign }, { data: rawMessages }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, handle, avatar_url")
        .eq("id", otherId)
        .single(),
      conversation.campaign_id
        ? supabase
            .from("campaigns")
            .select("id, title")
            .eq("id", conversation.campaign_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }),
    ]);

  const other = rawOther as ProfileMini | null;
  const messages = (rawMessages ?? []) as MessageRow[];
  const otherName = other?.full_name || "Usuario de Gaia";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-12">
      <MarkConversationRead conversationId={conversation.id} />

      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe transition-colors hover:text-brand"
      >
        ← Volver a mensajes
      </Link>

      <section className="mt-4 overflow-hidden rounded-2xl border border-bone bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/60 bg-paper/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={otherName} src={other?.avatar_url ?? null} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {otherName}
              </p>
              {rawCampaign ? (
                <Link
                  href={`/campaigns/${conversation.campaign_id}`}
                  className="truncate text-xs font-medium text-brand transition-colors hover:text-brand-deep"
                >
                  {rawCampaign.title}
                </Link>
              ) : (
                <p className="text-xs text-taupe">Contacto directo</p>
              )}
            </div>
          </div>
          {isBrand ? (
            <Link
              href={`/profile/portfolio/${otherId}`}
              className="rounded-lg bg-paper px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-paper-deep"
            >
              Ver portfolio ↗
            </Link>
          ) : null}
        </header>

        <div className="flex max-h-[60vh] min-h-[280px] flex-col gap-3 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <p className="m-auto max-w-sm text-center text-sm leading-6 text-taupe">
              Todavía no hay mensajes. Contale a {otherName} de qué se trata la
              colaboración.
            </p>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      mine
                        ? "rounded-br-sm bg-brand text-white"
                        : "rounded-bl-sm bg-paper-deep text-ink"
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{message.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? "text-white/60" : "text-taupe/70"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-bone/60 px-5 py-4">
          <MessageComposer conversationId={conversation.id} />
        </div>
      </section>
    </main>
  );
}
