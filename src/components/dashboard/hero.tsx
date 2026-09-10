"use client";

import { Avatar } from "@/components/ui/avatar";
import {
  DollarIcon,
  VideoIcon,
  StarIcon,
  MailIcon,
} from "@/components/ui/icons";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: React.ReactNode;
  accent?: "mint" | "lime" | "cream" | "default";
}

function KpiCard({ icon, label, value, detail, accent = "default" }: KpiCardProps) {
  const accentBg = {
    mint: "bg-mint/40 text-brand",
    lime: "bg-lime/40 text-brand",
    cream: "bg-cream text-brand",
    default: "bg-paper-deep text-brand",
  }[accent];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-bone bg-white p-4 transition-colors hover:bg-paper">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-taupe">
          {label}
        </span>
        <div className={`flex size-8 items-center justify-center rounded-full ${accentBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-ink">
            {value}
          </span>
        </div>
        {detail && (
          <p className="mt-1 text-sm text-taupe">{detail}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardHero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-bone bg-white p-6 shadow-sm md:p-8">
      {/* Ambient gradient flares */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-mint/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-48 h-60 w-60 rounded-full bg-lime/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
        
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Bienvenido de vuelta ✨
          </h1>
          <p className="mt-2 text-lg text-taupe">
            Tenés <span className="font-semibold text-ink">3 deliverables activos</span> y{" "}
            <span className="font-semibold text-brand">2 invitaciones nuevas</span>. 
            Mantené tu ritmo de entrega.
          </p>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 border-t border-bone/40 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<DollarIcon width={16} height={16} />}
          label="Ganancias (este mes)"
          value="$4,850"
          detail={<><span className="font-semibold text-ink">$1,200</span> en garantía</>}
          accent="mint"
        />
        <KpiCard
          icon={<VideoIcon width={16} height={16} />}
          label="Colaboraciones activas"
          value="5"
          detail="2 preparando • 2 filmando • 1 en revisión"
          accent="lime"
        />
        <KpiCard
          icon={<StarIcon width={16} height={16} />}
          label="Rating de desempeño"
          value="4.9 ★"
          detail="99% entregas a tiempo"
          accent="cream"
        />
        <KpiCard
          icon={<MailIcon width={16} height={16} />}
          label="Invitaciones directas"
          value="3"
          detail="Lumina, Krave Beauty, Glow Labs"
          accent="default"
        />
      </div>
    </section>
  );
}
