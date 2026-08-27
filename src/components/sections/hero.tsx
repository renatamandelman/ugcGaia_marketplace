import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  SparklesIcon,
  VideoIcon,
  BadgeCheckIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

const heroStats = [
  { value: "12.4K", label: "creadores activos" },
  { value: "860+", label: "marcas PyME" },
  { value: "$3.2M", label: "pagados a creadores" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft ember glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brasa/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Copy */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-oro/40 bg-oro/15 px-3.5 py-1.5 text-xs font-medium text-cobre">
              <SparklesIcon width={14} height={14} />
              El marketplace de micro-creadores UGC
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-balance text-carbon sm:text-5xl lg:text-6xl">
              Colaboraciones UGC{" "}
              <span className="text-brasa">profesionales</span>, sin
              intermediarios
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Conectamos micro-creadores de contenido con marcas pequeñas y
              medianas. Briefs claros, contratos automáticos, pagos protegidos
              y métricas reales — en un solo lugar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#cta" size="lg">
                Quiero colaborar
                <ArrowRightIcon width={18} height={18} />
              </ButtonLink>
              <ButtonLink href="/#como-funciona" variant="secondary" size="lg">
                Cómo funciona
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-2xl font-semibold tracking-tight text-carbon sm:text-3xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-xs leading-5 text-zinc-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual composition */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="space-y-4">
              {/* Mini campaign card */}
              <div className="rounded-2xl border border-marfil/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-oro/20 px-2.5 py-1 text-xs font-medium text-cobre">
                    Belleza
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Recibiendo propuestas
                  </span>
                </div>
                <h3 className="mt-3 font-semibold tracking-tight text-carbon">
                  Rutina de skincare en 20 segundos
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <Avatar name="Lumina Skin" size="sm" />
                  <span className="text-sm font-medium text-zinc-600">
                    Lumina Skin
                  </span>
                  <span className="ml-auto text-sm font-semibold text-cobre">
                    $350
                  </span>
                </div>
              </div>

              {/* Creator card */}
              <div className="flex items-center gap-3 rounded-2xl border border-marfil/70 bg-white p-4 shadow-sm">
                <Avatar name="Valentina Ríos" size="lg" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-carbon">
                    Valentina Ríos
                    <BadgeCheckIcon
                      width={16}
                      height={16}
                      className="text-brasa"
                    />
                  </p>
                  <p className="truncate text-sm text-zinc-500">
                    @valen.rios · Skincare &amp; belleza
                  </p>
                </div>
                <span className="ml-auto shrink-0 rounded-lg bg-oro/20 px-2.5 py-1.5 text-xs font-semibold text-cobre">
                  128K
                </span>
              </div>

              {/* Payment card — the bosque stage */}
              <div className="rounded-2xl bg-bosque p-5 text-white shadow-lg shadow-bosque/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-crema/60">
                    Pago protegido
                  </p>
                  <BadgeCheckIcon width={18} height={18} className="text-champan" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  $350,00{" "}
                  <span className="text-sm font-normal text-crema/60">USD</span>
                </p>
                <p className="mt-1 text-xs text-crema/60">
                  Liberado al aprobar el deliverable · Licencia 6 meses
                </p>
              </div>
            </div>

            {/* floating video chip */}
            <div className="absolute -top-5 -right-3 hidden items-center gap-2 rounded-xl border border-marfil/70 bg-white px-3 py-2 shadow-md sm:flex">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brasa text-white">
                <VideoIcon width={16} height={16} />
              </span>
              <div>
                <p className="text-xs font-semibold text-carbon">
                  Deliverable entregado
                </p>
                <p className="text-[10px] text-zinc-500">
                  Video vertical · 30s
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}