"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface MessageActionState {
  error?: string;
}

export interface StartConversationState extends MessageActionState {
  conversationId?: string;
}

/** Envía un mensaje a un hilo. La RLS valida que el usuario sea participante. */
export async function sendMessage(
  conversationId: string,
  formData: FormData
): Promise<MessageActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Escribí un mensaje antes de enviar." };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (error) return { error: error.message };

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return {};
}

/**
 * Abre (o crea) el hilo directo entre una marca y un creador.
 * No está atado a una campaña: se usa desde el portfolio del creador.
 */
export async function startConversation(
  creatorId: string
): Promise<StartConversationState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tenés que iniciar sesión para enviar mensajes." };

  if (creatorId === user.id) {
    return { error: "No podés escribirte a vos mismo." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "brand") {
    return { error: "Solo las marcas pueden iniciar conversaciones." };
  }

  const { data: creator } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", creatorId)
    .single();

  if (!creator || creator.role !== "creator") {
    return { error: "El creador no existe." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("brand_id", user.id)
    .eq("creator_id", creatorId)
    .is("campaign_id", null)
    .maybeSingle();

  if (existing) return { conversationId: existing.id };

  const { data, error } = await supabase
    .from("conversations")
    .insert({ brand_id: user.id, creator_id: creatorId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/messages");
  return { conversationId: data.id };
}
