"use client";

import { useMemo, useState } from "react";
import type { CampaignFeedItem } from "@/lib/campaigns";
import { CampaignCard } from "@/components/campaign-card";
import { cn } from "@/components/ui/utils";

interface CampaignsExplorerProps {
  campaigns: CampaignFeedItem[];
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
                ? "bg-brand text-white shadow-sm shadow-brand/25"
                : "bg-white text-taupe ring-1 ring-inset ring-brand/45 hover:bg-brand/10"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-taupe">
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