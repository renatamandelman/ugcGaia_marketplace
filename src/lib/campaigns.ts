import type { CampaignRow } from "@/lib/db-types";

/** View model unificado para el feed y las cards (mock + real). */
export interface CampaignFeedItem {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  brand_plan: "free" | "premium" | null;
  budget_min: number;
  budget_max: number | null;
  deliverables: string | null;
  deadline: string | null;
  status: CampaignRow["status"];
  tags: string[];
  created_at: string;
}

type BrandRelation =
  | { full_name: string | null; plan?: string | null }
  | { full_name: string | null; plan?: string | null }[]
  | null;

function brandEntry(relation: BrandRelation) {
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

export function mapCampaignRow(
  row: CampaignRow & { profiles?: BrandRelation }
): CampaignFeedItem {
  const brand = brandEntry(row.profiles ?? null);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    brand: brand?.full_name ?? null,
    brand_plan: brand?.plan === "premium" ? "premium" : "free",
    budget_min: Number(row.budget_min),
    budget_max: row.budget_max != null ? Number(row.budget_max) : null,
    deliverables: row.deliverables ?? null,
    deadline: row.deadline ?? null,
    status: row.status,
    tags: row.tags ?? [],
    created_at: row.created_at,
  };
}

/**
 * Orden del feed: las campañas de marcas premium primero.
 * Dentro de cada grupo se respeta el orden original (created_at desc).
 */
export function sortByPremium(campaigns: CampaignFeedItem[]): CampaignFeedItem[] {
  return [...campaigns].sort((a, b) => {
    const premiumDelta =
      Number(b.brand_plan === "premium") - Number(a.brand_plan === "premium");
    if (premiumDelta !== 0) return premiumDelta;
    return 0;
  });
}
