import { Section, SectionHeading } from "@/components/ui/section";
import {
  SparklesIcon,
  ShieldIcon,
  UsersIcon,
  BadgeCheckIcon,
  FileTextIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";

const creatorFeatures = [
  { icon: SparklesIcon, text: "Plan gratuito para creadores" },
  { icon: ShieldIcon, text: "Matcheado con IA según tu estilo" },
  { icon: UsersIcon, text: "Campañas verificadas y seguras" },
];

const brandFeatures = [
  { icon: BadgeCheckIcon, text: "Creadores verificados y rankeados" },
  { icon: FileTextIcon, text: "Briefing automático con IA" },
  { icon: VideoIcon, text: "Contratos y pagos protegidos" },
];


function FeatureItem({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3 ]">
      <span className="mt-0.5 flex bg-[#E4F1EB] size-6 shrink-0 items-center justify-center rounded-full ">
        <Icon className="size-3.5  text-brand" />
      </span>
      <span className="text-sm leading-6 text-taupe">{text}</span>
    </li>
  );
}



function QuarterCircle({
  color = "#C5F268",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M0 0H128V128V128C57.3076 128 0 70.6924 0 0V0Z"
        fill={color}
        fillOpacity="0.3"
      />
    </svg>
  );
}

function RoleCard({
  title,
  subtitle,
  features,
  cornerColor,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  subtitle: string;
  features: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  cornerColor?: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="relative flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-[#022720]/8 overflow-hidden">
      {/* Corner quarter-circle */}
      <QuarterCircle
        color={cornerColor}
        className="pointer-events-none absolute -top-4 -right-4 size-24 sm:-top-6 sm:-right-6 sm:size-32"
      />

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-taupe">{subtitle}</p>

        <ul className="mt-8 flex flex-col gap-5">
          {features.map((f) => (
            <FeatureItem key={f.text} icon={f.icon} text={f.text} />
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <ButtonLink href={ctaHref} variant="primary" className="w-full">
            {ctaLabel}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <Section id="como-funciona" className="bg-white">
      <SectionHeading
        title="Así funciona la colaboración"
        description="Dos caminos, una plataforma. Elegí el tuyo."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <RoleCard
          title="Para Creadores"
          subtitle="Construí tu marca personal y monetizá tu contenido"
          features={creatorFeatures}
          ctaLabel="Creá tu perfil"
          ctaHref="/register"
        />
        <RoleCard
          title="Para Marcas"
          subtitle="Encontrá los creadores perfectos para tu campaña"
          features={brandFeatures}
          cornerColor="#71F8E4"
          ctaLabel="Publicá tu brief"
          ctaHref="/campaigns"
        />
      </div>
    </Section>
  );
}
