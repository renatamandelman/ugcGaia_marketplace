import { Section, SectionHeading } from "@/components/ui/section";
import { ShieldIcon, FileTextIcon, VideoIcon } from "@/components/ui/icons";

const stats = [
  { value: "12.4K", label: "creadores activos en la plataforma" },
  { value: "860+", label: "PyMEs publicando briefs" },
  { value: "98%", label: "de entregas aprobadas a la primera" },
  { value: "$3.2M", label: "pagados a creadores desde 2025" },
];

const trustFeatures = [
  {
    icon: ShieldIcon,
    title: "Pago protegido",
    description:
      "El dinero queda en custodia y se libera recién cuando aprobás el deliverable. Cero riesgo para las dos partes.",
  },
  {
    icon: FileTextIcon,
    title: "Contrato automático",
    description:
      "Cada colaboración genera un contrato con licencia de uso, plazos y exclusividad. Legal claro, sin letra chica.",
  },
  {
    icon: VideoIcon,
    title: "Métricas reales",
    description:
      "Alcance, engagement y vistas verificadas post-publicación. Sabés exactamente qué compró tu presupuesto.",
  },
];

export function TrustStats() {
  return (
    <Section id="confianza">
      <SectionHeading
        eyebrow="Transparencia"
        title="La confianza no se promete, se construye"
        description="Automatizamos lo que otros marketplaces dejan a la buena voluntad."
      />

      <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-marfil/70 bg-white p-6 text-center shadow-sm"
          >
            <dd className="text-3xl font-semibold tracking-tight text-ambar sm:text-4xl">
              {stat.value}
            </dd>
            <dt className="mt-2 text-sm leading-5 text-zinc-600">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {trustFeatures.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-marfil/70 bg-white p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-brasa/10 text-brasa">
              <feature.icon width={22} height={22} />
            </span>
            <h3 className="mt-4 font-semibold tracking-tight text-carbon">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}