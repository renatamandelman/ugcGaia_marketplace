import { Section, SectionHeading } from "@/components/ui/section";
import { ShieldIcon, FileTextIcon, VideoIcon } from "@/components/ui/icons";

const stats = [
  { value: "12.4K", label: "creadores activos" },
  { value: "860+", label: "PyMEs publicando briefs" },
];

const trustFeatures = [
  {
    icon: ShieldIcon,
    title: "Pago protegido",
    description:
      "El dinero queda en custodia y se libera recién cuando aprobás el deliverable.",
  },
  {
    icon: FileTextIcon,
    title: "Contrato automático",
    description:
      "Cada colaboración genera un contrato con licencia de uso, plazos y exclusividad.",
  },
  {
    icon: VideoIcon,
    title: "Métricas reales",
    description:
      "Alcance, engagement y vistas verificadas post-publicación.",
  },
];

export function TrustStats() {
  return (
    <Section id="confianza" className="py-12 sm:py-16">
      <SectionHeading
        title="La confianza no se promete, se construye"
        description="Automatizamos lo que otros marketplaces dejan a la buena voluntad."
      />

      <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <dd className="text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
              {stat.value}
            </dd>
            <dt className="mt-0.5 text-xs text-taupe">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {trustFeatures.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-xl bg-paper-deep px-4 py-3"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <feature.icon width={16} height={16} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-0.5 text-xs leading-5 text-taupe">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}