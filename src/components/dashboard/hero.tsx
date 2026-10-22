import {
  ClockIcon,
  DollarIcon,
  ShieldIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { formatBudget } from "@/lib/format";

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
        {detail ? <p className="mt-1 text-sm text-taupe">{detail}</p> : null}
      </div>
    </div>
  );
}

interface DashboardHeroProps {
  name: string;
  activeCount: number;
  inReviewCount: number;
  releasedTotal: number;
  heldTotal: number;
}

export function DashboardHero({
  name,
  activeCount,
  inReviewCount,
  releasedTotal,
  heldTotal,
}: DashboardHeroProps) {
  const firstName = name.split(" ")[0] || "creador";

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-bone bg-white p-6 shadow-sm md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-mint/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-48 h-60 w-60 rounded-full bg-lime/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Hola, {firstName} ✨
          </h1>
          <p className="mt-2 text-lg text-taupe">
            {activeCount > 0 ? (
              <>
                Tenés{" "}
                <span className="font-semibold text-ink">
                  {activeCount}{" "}
                  {activeCount === 1 ? "colaboración activa" : "colaboraciones activas"}
                </span>{" "}
                y{" "}
                <span className="font-semibold text-brand">
                  {formatBudget(heldTotal)}
                </span>{" "}
                por cobrar cuando la marca apruebe.
              </>
            ) : (
              <>
                Todavía no tenés colaboraciones activas.{" "}
                <span className="font-semibold text-ink">
                  Explorá campañas y postulate.
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 border-t border-bone/40 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<DollarIcon width={16} height={16} />}
          label="Ganancias liberadas"
          value={formatBudget(releasedTotal)}
          detail="Pagos aprobados por marcas"
          accent="mint"
        />
        <KpiCard
          icon={<VideoIcon width={16} height={16} />}
          label="Colaboraciones activas"
          value={String(activeCount)}
          detail="Brief enviado, en producción o en revisión"
          accent="lime"
        />
        <KpiCard
          icon={<ClockIcon width={16} height={16} />}
          label="En revisión"
          value={String(inReviewCount)}
          detail="Esperando respuesta de la marca"
          accent="cream"
        />
        <KpiCard
          icon={<ShieldIcon width={16} height={16} />}
          label="Por cobrar"
          value={formatBudget(heldTotal)}
          detail="Retenido por Gaia hasta aprobar"
          accent="default"
        />
      </div>
    </section>
  );
}
