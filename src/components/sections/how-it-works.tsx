import { Section, SectionHeading } from "@/components/ui/section";
import { FileTextIcon, UsersIcon, BadgeCheckIcon, VideoIcon, DollarIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  {
    icon: FileTextIcon,
    title: "Publicá tu brief",
    description:
      "Detallás el producto, el tono, las entregas y el presupuesto por creador.",
  },
  {
    icon: UsersIcon,
    title: "Recibí propuestas",
    description:
      "Creadores aplican con su portfolio y su pitch. Vos elegís a quién contratás.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Cerrá el contrato",
    description:
      "Contrato automático con licencia de uso, plazos y condiciones claras.",
  },
  {
    icon: VideoIcon,
    title: "Creación y entrega",
    description:
      "El creador produce el contenido y lo sube a la plataforma para tu aprobación.",
  },
  {
    icon: DollarIcon,
    title: "Pago protegido",
    description:
      "El pago se libera solo al aprobar el deliverable. Métricas incluidas.",
  },
];

export function HowItWorks() {
  return (
    <Section id="como-funciona" className="bg-white">
      <SectionHeading
        eyebrow="El bucle"
        title="Así funciona la colaboración"
        description="Un proceso de 5 pasos, transparente de punta a punta. Sin mensajes perdidos, sin precios a oscuras, sin derechos de uso ambiguos."
      />

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative flex flex-col rounded-2xl border border-marfil/70 bg-white p-5 transition-colors hover:border-oro/70 hover:bg-oro/5"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-brasa/10 text-brasa">
              <step.icon width={22} height={22} />
            </span>
            <span className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cobre">
              Paso {index + 1}
            </span>
            <h3 className="mt-1.5 font-semibold tracking-tight text-carbon">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {step.description}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <ButtonLink href="/campaigns" variant="secondary">
          Ver campañas activas ahora
        </ButtonLink>
      </div>
    </Section>
  );
}