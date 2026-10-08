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
  const niche = String(formData.get("niche") ?? "");
  const location = String(formData.get("location") ?? "");
  const portfolioUrl = String(formData.get("portfolioUrl") ?? "");
  const tags = parseTags(formData.get("tags"), 10);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      handle: handle || null,
      bio: bio || null,
      niche: niche || null,
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

export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

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
  return { success: "Postulación actualizada" };
}