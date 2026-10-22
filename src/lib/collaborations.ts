import type { createClient } from "@/lib/supabase/server";
import type {
  CollaborationRow,
  CollaborationStatus,
  DeliverableRow,
  DeliverableStatus,
  PaymentStatus,
} from "@/lib/db-types";
import { MAX_VERSIONS } from "@/lib/collaborations-shared";

export { MAX_VERSIONS };

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface PersonMini {
  id: string;
  full_name: string;
  handle: string | null;
  avatar_url: string | null;
}

export interface CampaignMini {
  id: string;
  title: string;
  status: string;
  category: string;
}

export interface CollaborationListItem extends CollaborationRow {
  campaign: CampaignMini | null;
  brand: PersonMini | null;
  creator: PersonMini | null;
  deliverables: DeliverableRow[];
  latestDeliverable: DeliverableRow | null;
  pendingReview: boolean;
  versionsUsed: number;
}

export async function fetchCollaborations(
  supabase: Supabase,
  userId: string
): Promise<CollaborationListItem[]> {
  const { data: collaborationRows } = await supabase
    .from("collaborations")
    .select("*")
    .or(`brand_id.eq.${userId},creator_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  const collaborations = (collaborationRows ?? []) as CollaborationRow[];
  if (collaborations.length === 0) return [];

  const campaignIds = [...new Set(collaborations.map((row) => row.campaign_id))];
  const personIds = [
    ...new Set(
      collaborations.flatMap((row) => [row.brand_id, row.creator_id])
    ),
  ];
  const collaborationIds = collaborations.map((row) => row.id);

  const [{ data: campaignRows }, { data: personRows }, { data: deliverableRows }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select("id, title, status, category")
        .in("id", campaignIds),
      supabase
        .from("profiles")
        .select("id, full_name, handle, avatar_url")
        .in("id", personIds),
      supabase
        .from("deliverables")
        .select("*")
        .in("collaboration_id", collaborationIds)
        .order("version", { ascending: false }),
    ]);

  const campaignById = new Map(
    ((campaignRows ?? []) as CampaignMini[]).map((row) => [row.id, row])
  );
  const personById = new Map(
    ((personRows ?? []) as PersonMini[]).map((row) => [row.id, row])
  );
  const deliverablesByCollaboration = new Map<string, DeliverableRow[]>();

  for (const deliverable of (deliverableRows ?? []) as DeliverableRow[]) {
    const list = deliverablesByCollaboration.get(deliverable.collaboration_id) ?? [];
    list.push(deliverable);
    deliverablesByCollaboration.set(deliverable.collaboration_id, list);
  }

  return collaborations.map((collaboration) => {
    const deliverables = deliverablesByCollaboration.get(collaboration.id) ?? [];
    const latestDeliverable = deliverables[0] ?? null;

    return {
      ...collaboration,
      campaign: campaignById.get(collaboration.campaign_id) ?? null,
      brand: personById.get(collaboration.brand_id) ?? null,
      creator: personById.get(collaboration.creator_id) ?? null,
      deliverables,
      latestDeliverable,
      pendingReview: latestDeliverable?.status === "submitted",
      versionsUsed: deliverables.length,
    };
  });
}

export function collaborationStatusLabel(status: CollaborationStatus): string {
  switch (status) {
    case "brief_sent":
      return "Brief enviado";
    case "in_progress":
      return "En producción";
    case "submitted":
      return "En revisión";
    case "approved":
      return "Aprobada";
    case "cancelled":
      return "Cancelada";
  }
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "held":
      return "Pago retenido";
    case "released":
      return "Pago liberado";
    case "refunded":
      return "Pago devuelto";
  }
}

export function deliverableStatusLabel(status: DeliverableStatus): string {
  switch (status) {
    case "submitted":
      return "Esperando revisión";
    case "approved":
      return "Aprobada";
    case "changes_requested":
      return "Cambios pedidos";
  }
}

export function canSubmitDeliverable(
  collaboration: CollaborationListItem,
  isCreator: boolean
): boolean {
  if (!isCreator) return false;
  if (collaboration.status === "approved" || collaboration.status === "cancelled") {
    return false;
  }
  if (collaboration.pendingReview) return false;
  return collaboration.versionsUsed < MAX_VERSIONS;
}

export function canReviewDeliverable(
  collaboration: CollaborationListItem,
  isBrand: boolean
): boolean {
  return isBrand && collaboration.pendingReview;
}
