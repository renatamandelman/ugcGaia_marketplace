"use client";

import { useMemo, useState } from "react";
import type { Campaign } from "@/lib/types";
import { CampaignCard } from "@/components/campaign-card";
import { cn } from "@/components/ui/utils";

interface CampaignsExplorerProps {
  campaigns: Campaign[];
}

export function CampaignsExplorer({ campaigns }: CampaignsExplorerProps) {
  const categories = useMemo(
    () => ["Todas", ...new Set(campaigns.map((campaign) => campaign.category))],
    [campaigns]
  );
  const [active, setActive] = useState("Todas");

  const filtered = useMemo(
    () =>
      active === "Todas"
        ? campaigns
        : campaigns.filter((campaign) => campaign.category === active),
    [campaigns, active]
  );

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active === category
                ? "bg-bosque text-white shadow-sm shadow-bosque/25"
                : "bg-white text-zinc-600 ring-1 ring-inset ring-oro/45 hover:bg-oro/10"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {filtered.length}{" "}
        {filtered.length === 1 ? "campaña activa" : "campañas activas"}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </>
  );
}