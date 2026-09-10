"use client";

import { Button } from "@/components/ui/button";

interface Brief {
  id: string;
  brandName: string;
  category: string;
  title: string;
  description: string;
  slots?: number;
  budget: number;
  matchPercent: number;
  badge?: string;
}

const mockBriefs: Brief[] = [
  {
    id: "1",
    brandName: "Aura Botanics",
    category: "Skincare",
    title: "Matcha Glow Moisturizer — Hook & Problem/Solution Reel",
    description: "Buscan creadoras con piel acneica o seca para mostrar transformación de rutina matutina.",
    slots: 4,
    budget: 350,
    matchPercent: 98,
    badge: "4 SLOTS",
  },
  {
    id: "2",
    brandName: "PureHerb Organics",
    category: "Wellness",
    title: "Hydrating Mist Everyday Routine & Desk Refresh",
    description: "Producir 2 cuts verticales 9:16 de alta energía demostrando hidratación en oficina.",
    budget: 400,
    matchPercent: 95,
    badge: "VERIFIED",
  },
  {
    id: "3",
    brandName: "Flora Labs",
    category: "Haircare",
    title: "Eco-Friendly Hair Serum — Transformation Video",
    description: "Video antes/después enfocado en brillo natural y cero ingredientes de silicona.",
    budget: 320,
    matchPercent: 92,
    badge: "EXPRESS",
  },
];

export function RecommendedBriefs() {
  return (
    <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 border-b border-bone/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-brand">✨</span>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Briefs Recomendados
            </h2>
          </div>
          <p className="mt-0.5 text-sm text-taupe">
            Basado en tu niché de Skincare & Lifestyle
          </p>
        </div>
        <a
          href="/campaigns"
          className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
        >
          Explorar todos
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mockBriefs.map((brief) => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
      </div>
    </section>
  );
}

function BriefCard({ brief }: { brief: Brief }) {
  const badgeStyle = brief.badge === "VERIFIED"
    ? "bg-mint/50 text-brand"
    : brief.badge === "EXPRESS"
    ? "bg-paper-deep text-brand"
    : "bg-lime/60 text-brand";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-bone bg-paper p-5 transition-all hover:border-brand/40 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeStyle}`}>
            {brief.badge === "VERIFIED" && "✓ "}
            {brief.badge} {brief.slots ? `OPEN` : ""}
          </span>
          <span className="text-lg font-bold text-ink">${brief.budget}</span>
        </div>
        <div className="mb-2 text-xs text-taupe">
          <span className="font-bold text-ink">{brief.brandName}</span>
          <span className="mx-1">•</span>
          <span>{brief.category}</span>
        </div>
        <h3 className="mb-2 text-sm font-bold text-ink transition-colors group-hover:text-brand">
          {brief.title}
        </h3>
        <p className="line-clamp-2 text-sm text-taupe">
          {brief.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-bone/40 pt-3">
        <span className="flex items-center gap-1 text-xs font-bold text-brand">
          <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          {brief.matchPercent}% Match
        </span>
        <Button variant="primary" size="sm" className="text-xs">
          Aplicar
        </Button>
      </div>
    </div>
  );
}
