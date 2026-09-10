"use client";

import { Button } from "@/components/ui/button";

interface Milestone {
  step: number;
  total: number;
  label: string;
  percent: number;
}

interface Deliverable {
  id: string;
  brandName: string;
  title: string;
  format: string;
  status: string;
  statusColor: "mint" | "lime" | "cream" | "default";
  budget: number;
  dueDate: string;
  urgency: "high" | "medium" | "low";
  milestone: Milestone;
  actionLabel: string;
  actionVariant: "primary" | "secondary" | "ghost";
}

const mockDeliverables: Deliverable[] = [
  {
    id: "1",
    brandName: "Lumina Organics",
    title: "Summer Glow Serum — Reel Hook",
    format: "TikTok 9:16 Reel",
    status: "Borrador en revisión",
    statusColor: "lime",
    budget: 300,
    dueDate: "14 de julio",
    urgency: "high",
    milestone: { step: 3, total: 4, label: "Feedback de la marca", percent: 75 },
    actionLabel: "Ver feedback / Chat",
    actionVariant: "secondary",
  },
  {
    id: "2",
    brandName: "Eco Daily",
    title: "Sunscreen — Texture & Wear Test",
    format: "Unboxing & Textura",
    status: "Acción requerida: Grabar",
    statusColor: "cream",
    budget: 250,
    dueDate: "16 de julio",
    urgency: "medium",
    milestone: { step: 2, total: 4, label: "Grabando contenido", percent: 50 },
    actionLabel: "Subir Video",
    actionVariant: "primary",
  },
  {
    id: "3",
    brandName: "Botanical Cleanse",
    title: "High-Res Product Routine",
    format: "3x UGC Foto Bundle",
    status: "Concepto aprobado",
    statusColor: "default",
    budget: 180,
    dueDate: "18 de julio",
    urgency: "low",
    milestone: { step: 1, total: 4, label: "Planificación de shotlist", percent: 25 },
    actionLabel: "Revisar Shotlist",
    actionVariant: "ghost",
  },
];

const statusStyles: Record<string, string> = {
  mint: "bg-mint/50 text-brand",
  lime: "bg-lime/60 text-brand",
  cream: "bg-cream text-brand",
  default: "bg-paper-deep text-taupe",
};

const progressColors: Record<string, string> = {
  mint: "bg-brand",
  lime: "bg-lime",
  cream: "bg-cream",
  default: "bg-bone",
};

export function DeliverablesList() {
  return (
    <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-bone/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-paper-deep text-brand">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Deliverables Activos
            </h2>
            <p className="text-sm text-taupe">
              Gestioná compromisos, subí contenido y pedí revisiones
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-semibold text-taupe">Ordenar:</span>
          <button className="inline-flex items-center gap-1 rounded-lg bg-paper-deep px-3 py-1.5 text-xs font-bold text-brand">
            Fecha límite
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {mockDeliverables.map((d) => (
          <DeliverableCard key={d.id} deliverable={d} />
        ))}
      </div>
    </section>
  );
}

function DeliverableCard({ deliverable: d }: { deliverable: Deliverable }) {
  const progressColor = progressColors[d.statusColor];
  return (
    <div className="rounded-2xl border border-bone bg-paper p-5 transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {/* Brand avatar placeholder */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-mint/30 text-lg font-bold text-brand">
            {d.brandName.charAt(0)}
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyles[d.statusColor]}`}>
                {d.status}
              </span>
              <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-xs font-bold text-brand">
                {d.format}
              </span>
            </div>
            <h3 className="text-lg font-bold text-ink">
              {d.brandName} — {d.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-taupe">
              <span className="flex items-center gap-1 font-semibold text-brand">
                <ShieldIcon width={14} height={14} />
                ${d.budget} en garantía
              </span>
              <span className={`flex items-center gap-1 font-medium ${d.urgency === "high" ? "text-red-500" : ""}`}>
                <ClockIcon width={14} height={14} />
                Vence el {d.dueDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-end gap-2 sm:flex-col sm:items-end">
          <Button variant={d.actionVariant} size="sm">
            {d.actionLabel}
          </Button>
          <span className="text-xs text-taupe/80">Hace 6h</span>
        </div>
      </div>

      {/* Milestone progress */}
      <div className="mt-4 border-t border-bone/40 pt-3">
        <div className="flex items-center justify-between text-xs text-taupe">
          <span>
            Hito: Paso {d.milestone.step} de {d.milestone.total} ({d.milestone.label})
          </span>
          <span className="font-bold text-ink">{d.milestone.percent}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-paper-deep">
          <div
            className={`h-full rounded-full transition-all ${progressColor}`}
            style={{ width: `${d.milestone.percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ShieldIcon({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
