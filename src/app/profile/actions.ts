"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseTags } from "@/lib/tags";

export interface ProfileState {
  error?: string;
  success?: string;
}

export async function updateProfile(prev: ProfileState, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "");
  const handle = String(formData.get("handle") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const location = String(formData.get("location") ?? "");
  const portfolioUrl = String(formData.get("portfolioUrl") ?? "");
  const tags = parseTags(formData.get("tags"), 10);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      handle: handle || null,
      bio: bio || null,
      location: location || null,
      portfolio_url: portfolioUrl || null,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Perfil actualizado." };
}

export interface ApplicationDecision {
  error?: string;
  success?: string;
  conversationId?: string;
}

/**
 * Aceptar o rechazar una postulación.
 *
 * Aceptar es una operación atómica en Postgres (RPC accept_application):
 * cambia el estado, crea/reutiliza el hilo y envía el primer mensaje.
 * Rechazar es un update simple validado contra el dueño de la campaña.
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected",
  message = ""
): Promise<ApplicationDecision> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  if (status === "accepted") {
    const { data, error } = await supabase.rpc("accept_application", {
      p_application_id: applicationId,
      p_message: message,
    });

    if (error) return { error: error.message };

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/messages");
    return {
      success: "Postulación aceptada. La conversación está abierta.",
      conversationId: data as string,
    };
  }

  const { data: application } = await supabase
    .from("applications")
    .select("campaign_id")
    .eq("id", applicationId)
    .single();

  if (!application) return { error: "La postulación no existe" };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("brand_id")
    .eq("id", application.campaign_id)
    .single();

  if (!campaign || campaign.brand_id !== user.id) {
    return { error: "Solo el dueño de la campaña puede decidir" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Postulación rechazada" };
}