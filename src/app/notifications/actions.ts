"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ThreadReadState {
  marked: number;
  error?: string;
}

/** Marca una notificación puntual como leída. */
export async function markNotificationRead(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return {};
}

/** Marca todas las notificaciones del usuario como leídas. */
export async function markAllNotificationsRead() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

/**
 * Al abrir un hilo, marca como leídos los avisos vinculados a esa conversación
 * (mensajes y aceptaciones). Devuelve cuántos marcó para refrescar el badge.
 */
export async function markThreadRead(
  conversationId: string
): Promise<ThreadReadState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { marked: 0 };

  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("link", `/messages/${conversationId}`)
    .is("read_at", null)
    .select("id");

  if (error) return { marked: 0, error: error.message };

  if ((data?.length ?? 0) > 0) {
    revalidatePath("/", "layout");
  }

  return { marked: data?.length ?? 0 };
}
