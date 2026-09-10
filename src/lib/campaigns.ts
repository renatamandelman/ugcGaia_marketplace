import type { CampaignRow } from "@/lib/db-types";

/** View model unificado para el feed y las cards (mock + real). */
export interface CampaignFeedItem {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  budget_min: number;
  budget_max: number | null;
  deliverables: string | null;
  deadline: string | null;
  status: CampaignRow["status"];
  created_at: string;
}

type BrandRelation =
  | { full_name: string | null }
  | { full_name: string | null }[]
  | null;

function profileFullName(relation: BrandRelation): string | null {
  const entry = Array.isArray(relation) ? relation[0] : relation;
  return entry?.full_name ?? null;
}

export function mapCampaignRow(
  row: CampaignRow & { profiles?: BrandRelation }
): CampaignFeedItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    brand: profileFullName(row.profiles ?? null),
    budget_min: Number(row.budget_min),
    budget_max: row.budget_max != null ? Number(row.budget_max) : null,
    deliverables: row.deliverables ?? null,
    deadline: row.deadline ?? null,
    status: row.status,
    created_at: row.created_at,
  };
}