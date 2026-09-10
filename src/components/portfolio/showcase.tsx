"use client";

import { useState } from "react";
import type { PortfolioItem } from "@/lib/db-types";
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  VideoIcon,
  ImageIcon,
} from "@/components/ui/icons";

interface PortfolioShowcaseProps {
  items: PortfolioItem[];
  isOwner?: boolean;
}

const platformColors: Record<string, string> = {
  tiktok: "bg-black text-white",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
  youtube: "bg-red-600 text-white",
  other: "bg-gray-600 text-white",
};

const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  other: "Otro",
};

export function PortfolioShowcase({
  items,
  isOwner = false,
}: PortfolioShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const videoItems = items.filter((i) => i.media_type === "video");
  const imageItems = items.filter((i) => i.media_type === "image");

  const filteredItems =
    activeFilter === "video"
      ? videoItems
      : activeFilter === "image"
        ? imageItems
        : items;

  const filters = [
    { id: "all", label: "Todos", count: items.length },
    { id: "video", label: "Videos", count: videoItems.length },
    { id: "image", label: "Fotos", count: imageItems.length },
  ];

  /* ─── Empty state ─── */
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border-2 border-dashed border-bone bg-white p-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-paper-deep">
          <VideoIcon width={28} height={28} className="text-taupe" />
        </div>
        <p className="mt-4 text-lg font-bold text-ink">Portfolio vacío</p>
        <p className="mt-1 text-sm text-taupe">
          {isOwner
            ? "Agregá tu primer video o imagen desde tu panel de creador."
            : "Este creador todavía no agregó trabajos a su portfolio."}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              activeFilter === f.id
                ? "bg-brand text-white shadow-sm"
                : "bg-white text-taupe hover:bg-paper-deep"
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone p-8 text-center">
          <p className="text-sm text-taupe">
            No hay{" "}
            {activeFilter === "video" ? "videos" : "fotos"} en el portfolio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Platform badge ─── */

function PlatformBadge({
  platform,
}: {
  platform: PortfolioItem["platform"];
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${platformColors[platform]}`}
    >
      <PlatformIconSmall platform={platform} />
      {platformLabels[platform]}
    </span>
  );
}

function PlatformIconSmall({
  platform,
}: {
  platform: PortfolioItem["platform"];
}) {
  switch (platform) {
    case "tiktok":
      return <TikTokIcon width={10} height={10} />;
    case "instagram":
      return <InstagramIcon width={10} height={10} />;
    case "youtube":
      return <YouTubeIcon width={10} height={10} />;
    default:
      return null;
  }
}

/* ─── Card ─── */

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const isVideo = item.media_type === "video";
  const [thumbFailed, setThumbFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <a
      href={item.media_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-bone bg-white shadow-sm transition-all hover:shadow-md"
    >
      {/* ── Thumbnail / Image ── */}
      <div
        className={`relative w-full overflow-hidden bg-brand/5 ${
          isVideo ? "aspect-[9/16]" : "aspect-square"
        }`}
      >
        {isVideo && item.thumbnail_url && !thumbFailed ? (
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="size-full object-cover"
            onError={() => setThumbFailed(true)}
          />
        ) : !isVideo && !imgFailed ? (
          <img
            src={item.media_url}
            alt={item.title}
            className="size-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-mint/10 to-brand/5">
            {isVideo ? (
              <VideoIcon width={32} height={32} className="text-brand/40" />
            ) : (
              <ImageIcon width={32} height={32} className="text-brand/40" />
            )}
          </div>
        )}

        {/* Platform badge — top left */}
        <div className="absolute left-3 top-3">
          <PlatformBadge platform={item.platform} />
        </div>

        {/* Play button overlay on hover (videos only) */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand/80 text-white shadow-lg backdrop-blur-sm">
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-ink">
          {item.title}
        </h3>
        {item.description && (
          <p className="line-clamp-2 text-xs text-taupe">{item.description}</p>
        )}
      </div>
    </a>
  );
}
