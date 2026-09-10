"use client";

import { Button } from "@/components/ui/button";

interface Package {
  id: string;
  name: string;
  tier: string;
  description: string;
  price: string;
  unit: string;
  features: string[];
  turnaround: string;
  popular?: boolean;
}

const packages: Package[] = [
  {
    id: "1",
    name: "Starter UGC Hook Pack",
    tier: "Starter",
    description: "Ideal para testear ángulos de messaging en TikTok y Meta Spark Ads.",
    price: "$350",
    unit: "/ concepto único",
    turnaround: "4 días",
    features: [
      "1x Video UGC 9:16 (hasta 45s)",
      "2x Hooks visuales distintos (0-3s testing)",
      "Captions nativas y audio trending",
      "Licencia de uso de 30 días",
    ],
  },
  {
    id: "2",
    name: "Performance Scaler Pack",
    tier: "Growth Ready",
    description: "Suite de creativos multi-ángulo lista para split-testing.",
    price: "$750",
    unit: "/ 3x hooks + b-roll",
    turnaround: "4 días",
    popular: true,
    features: [
      "3x Videos UGC editados (3 ángulos distintos)",
      "Bundle de B-roll sin editar (15+ clips)",
      "3x Fotos de textura y producto en alta res",
      "Licencia de uso de 60 días",
      "Revisión de script y consulta de ángulos",
    ],
  },
  {
    id: "3",
    name: "Full Routine & Whitelisting",
    tier: "Enterprise UGC",
    description: "Partnership profundo con acceso a Spark Ads directamente desde tu handle.",
    price: "$1,200",
    unit: "/ integral",
    turnaround: "5 días",
    features: [
      "5x Entregables de video de alta conversión",
      "30 días de TikTok Spark Ads y Meta Whitelisting",
      "10x Fotos editoriales en alta res",
      "Derechos de uso orgánico y pagos perpetuos",
    ],
  },
];

export function RateCards() {
  return (
    <section className="space-y-6 pt-4">
      <div className="space-y-2 text-center">
      
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          Paquetes de Colaboración UGC
        </h2>
        <p className="text-sm text-taupe">
          Todos los paquetes incluyen cortes B-roll, derechos de publicación y 1 ciclo de revisión.
        </p>
      </div>

      <div className="grid gap-6 pt-4 md:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {/* Custom brief CTA */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-bone bg-paper p-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cream text-brand">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" /><path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3 0l2.26-2.21" /></svg>
          </div>
          <div>
            <h4 className="font-bold text-ink">
              ¿Tenés un brief a medida?
            </h4>
            <p className="text-sm text-taupe">
              Colaboraciones frecuentes con marcas sostenibles.
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm">
          Pedir Propuesta
        </Button>
      </div>
    </section>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border p-8 transition-all ${
      pkg.popular
        ? "border-brand bg-white shadow-md"
        : "border-bone bg-white hover:border-brand/40 hover:shadow-sm"
    }`}>
      {pkg.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-xs font-bold text-lime shadow-sm">
          ⚡ Más popular para D2C
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-taupe">
            {pkg.tier}
          </span>
          <span className="text-xs text-taupe">Turnaround: {pkg.turnaround}</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-ink">{pkg.name}</h3>
          <p className="mt-1 text-sm text-taupe">{pkg.description}</p>
        </div>

        <div className="flex items-baseline gap-1 py-2">
          <span className="text-3xl font-bold tracking-tight text-ink">{pkg.price}</span>
          <span className="text-sm text-taupe">{pkg.unit}</span>
        </div>

        <ul className="space-y-3 border-t border-bone/40 pt-4 text-sm text-ink">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <svg className="mt-0.5 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8">
        <Button
          variant={pkg.popular ? "primary" : "secondary"}
          className="w-full"
        >
          Reservar {pkg.name.split(" ")[0]} Pack
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </Button>
      </div>
    </div>
  );
}
