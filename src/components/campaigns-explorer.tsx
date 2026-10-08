"use client";

import { useMemo, useState } from "react";
import type { CampaignFeedItem } from "@/lib/campaigns";
import { CampaignCard } from "@/components/campaign-card";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";

interface CampaignsExplorerProps {
  campaigns: CampaignFeedItem[];
}

export function CampaignsExplorer({ campaigns }: CampaignsExplorerProps) {
  const categories = useMemo(
    () => ["Todas", ...new Set(campaigns.map((campaign) => campaign.category))],
    [campaigns]
  );
  const allTags = useMemo(
    () =>
      [...new Set(campaigns.flatMap((campaign) => campaign.tags))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [campaigns]
  );

  const [active, setActive] = useState("Todas");
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      if (active !== "Todas" && campaign.category !== active) return false;
      // AND semantics: la campaña debe contener TODOS los tags seleccionados
      if (!selectedTags.every((tag) => campaign.tags.includes(tag)))
        return false;
      if (!q) return true;
      return (
        campaign.title.toLowerCase().includes(q) ||
        campaign.description.toLowerCase().includes(q) ||
        campaign.brand?.toLowerCase().includes(q) ||
        campaign.category.toLowerCase().includes(q) ||
        campaign.tags.some((tag) => tag.includes(q))
      );
    });
  }, [campaigns, active, query, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const hasFilters = active !== "Todas" || selectedTags.length > 0 || query !== "";

  return (
    <>
      {/* Buscador por texto */}
      <div className="relative mx-auto w-full max-w-xl">
        <SearchIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-taupe"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, marca o tag…"
          className="w-full rounded-full border border-bone bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder-taupe outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {/* Filtro por categoría */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
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

      {/* Filtro por tags */}
      {allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                selectedTags.includes(tag)
                  ? "bg-ink text-white"
                  : "bg-brand/10 text-brand hover:bg-brand/20"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-taupe">
        {filtered.length}{" "}
        {filtered.length === 1 ? "campaña activa" : "campañas activas"}
        {selectedTags.length > 1 ? ` con ${selectedTags.length} tags en común` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-bone bg-white/60 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            No hay campañas que coincidan con tu búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setActive("Todas");
              setQuery("");
              setSelectedTags([]);
            }}
            className="mt-3 text-sm font-semibold text-brand hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {hasFilters && filtered.length > 0 ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setActive("Todas");
              setQuery("");
              setSelectedTags([]);
            }}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : null}
    </>
  );
}
