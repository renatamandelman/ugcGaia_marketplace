import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { markAllNotificationsRead } from "./actions";
import type { NotificationRow } from "@/lib/db-types";

export const metadata = { title: "Notificaciones — Gaia" };

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const notifications = (data ?? []) as NotificationRow[];
  const unread = notifications.filter((item) => !item.read_at).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {unread > 0
              ? `${unread} sin leer`
              : "Estás al día con todo lo que pasó."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 ? (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="rounded-xl border border-bone bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-paper-deep"
              >
                Marcar todas como leídas
              </button>
            </form>
          ) : null}
          <ButtonLink href="/messages" variant="ghost" size="sm">
            Ver mensajes
          </ButtonLink>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-bone bg-white p-10 text-center">
          <p className="text-base font-semibold text-ink">
            Todavía no tenés notificaciones
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-taupe">
            Acá vas a ver postulaciones nuevas, aceptaciones y mensajes.
          </p>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-bone bg-white">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
