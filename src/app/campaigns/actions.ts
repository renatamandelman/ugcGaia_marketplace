"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseTags } from "@/lib/tags";

export async function applyToCampaign(campaignId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "creator") {
    return { error: "Solo los creadores pueden aplicar a campañas." };
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("status, brand_id")
    .eq("id", campaignId)
    .single();

  if (!campaign || campaign.status !== "open") {
    return { error: "Esta campaña ya no acepta aplicaciones." };
  }

  if (campaign.brand_id === user.id) {
    return { error: "No podés aplicar a tu propia campaña." };
  }

  // Insert directo, NO upsert: el upsert hace un DO UPDATE interno que
  // dispara la policy de UPDATE de applications (solo dueños de campaña)
  // y revienta RLS. El insert simple respeta la policy de creators.
  const { error } = await supabase.from("applications").insert({
    campaign_id: campaignId,
    creator_id: user.id,
    status: "pending",
  });

  if (error) {
    // 23505 = unique violation (campaign_id, creator_id)
    if (error.code === "23505") {
      return { error: "Ya aplicaste a esta campaña." };
    }
    return { error: error.message };
  }

  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

export interface CampaignFormState {
  error?: string;
}

export async function createCampaign(
  prev: CampaignFormState,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "brand") {
    return { error: "Solo las marcas pueden publicar campañas." };
  }

  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const category = String(formData.get("category") ?? "");
  const budgetMin = Number(formData.get("budgetMin") ?? 0);
  const budgetMaxRaw = formData.get("budgetMax");
  const deliverables = String(formData.get("deliverables") ?? "");
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const tags = parseTags(formData.get("tags"));

  if (!title || !description || !category || !budgetMin) {
    return { error: "Completá los campos obligatorios." };
  }

  const budgetMax =
    budgetMaxRaw && budgetMaxRaw !== "" ? Number(budgetMaxRaw) : null;
  const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;

  const { error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: user.id,
      title,
      description,
      category,
      budget_min: budgetMin,
      budget_max: budgetMax,
      deliverables: deliverables || null,
      deadline: deadline ? deadline.slice(0, 10) : null,
      tags,
      status: "open",
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/campaigns");
  redirect("/campaigns");
}

/** Valida que el user sea la marca DUEÑA de la campaña. Devuelve la campaña o un error. */
async function requireCampaignOwner(campaignId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, brand_id")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    return { supabase, error: "La campaña no existe." as const };
  }
  if (campaign.brand_id !== user.id) {
    return { supabase, error: "No podés modificar esta campaña." as const };
  }
  return { supabase, campaign, error: undefined };
}

export async function updateCampaign(
  prev: CampaignFormState,
  formData: FormData
) {
  const campaignId = String(formData.get("id") ?? "");
  if (!campaignId) return { error: "Falta el id de la campaña." };

  const owner = await requireCampaignOwner(campaignId);
  if (owner.error) return { error: owner.error };
  const supabase = owner.supabase;

  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const category = String(formData.get("category") ?? "");
  const budgetMin = Number(formData.get("budgetMin") ?? 0);
  const budgetMaxRaw = formData.get("budgetMax");
  const deliverables = String(formData.get("deliverables") ?? "");
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const statusRaw = String(formData.get("status") ?? "open");
  const tags = parseTags(formData.get("tags"));

  if (!title || !description || !category || !budgetMin) {
    return { error: "Completá los campos obligatorios." };
  }

  const status = ["open", "filled", "closed"].includes(statusRaw)
    ? (statusRaw as "open" | "filled" | "closed")
    : "open";
  const budgetMax =
    budgetMaxRaw && budgetMaxRaw !== "" ? Number(budgetMaxRaw) : null;
  const deadline = deadlineRaw ? new Date(deadlineRaw).toISOString() : null;

  const { error } = await supabase
    .from("campaigns")
    .update({
      title,
      description,
      category,
      budget_min: budgetMin,
      budget_max: budgetMax,
      deliverables: deliverables || null,
      deadline: deadline ? deadline.slice(0, 10) : null,
      status,
      tags,
    })
    .eq("id", campaignId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}`);
}

export async function deleteCampaign(campaignId: string) {
  const owner = await requireCampaignOwner(campaignId);
  if (owner.error) return { error: owner.error };
  const supabase = owner.supabase;

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  redirect("/campaigns");
}