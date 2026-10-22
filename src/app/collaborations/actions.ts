"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CollaborationActionState {
  error?: string;
  success?: string;
}

function revalidateCollaboration(id: string) {
  revalidatePath("/collaborations");
  revalidatePath(`/collaborations/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/", "layout");
}

/** El creador registra una entrega ya subida a Storage o un link externo. */
export async function submitDeliverable(
  collaborationId: string,
  filePath: string | null,
  externalUrl: string | null,
  notes: string
): Promise<CollaborationActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const { error } = await supabase.rpc("submit_deliverable", {
    p_collaboration_id: collaborationId,
    p_file_path: filePath,
    p_external_url: externalUrl,
    p_notes: notes,
  });

  if (error) return { error: error.message };

  revalidateCollaboration(collaborationId);
  return { success: "Entrega enviada. La marca ya puede revisarla." };
}

/** La marca aprueba (libera el pago) o pide cambios. */
export async function reviewDeliverable(
  collaborationId: string,
  deliverableId: string,
  decision: "approved" | "changes_requested",
  feedback: string
): Promise<CollaborationActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const { error } = await supabase.rpc("review_deliverable", {
    p_deliverable_id: deliverableId,
    p_decision: decision,
    p_feedback: feedback,
  });

  if (error) return { error: error.message };

  revalidateCollaboration(collaborationId);
  return {
    success:
      decision === "approved"
        ? "Entrega aprobada y pago liberado."
        : "Le enviamos el pedido de cambios al creador.",
  };
}

/** La marca cancela la colaboración y recupera el pago retenido. */
export async function cancelCollaboration(
  collaborationId: string,
  reason: string
): Promise<CollaborationActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const { error } = await supabase.rpc("cancel_collaboration", {
    p_collaboration_id: collaborationId,
    p_reason: reason,
  });

  if (error) return { error: error.message };

  revalidateCollaboration(collaborationId);
  return { success: "Colaboración cancelada y pago devuelto." };
}
