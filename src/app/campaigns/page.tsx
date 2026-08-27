import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { CampaignsExplorer } from "@/components/campaigns-explorer";
import { campaigns } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Campañas activas",
  description:
    "Explorá los briefs activos de las marcas en GaiaUGC: presupuesto, entregas y plazos claros para aplicar como creador.",
};

export default function CampaignsPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Marketplace"
        title="Campañas activas"
        description="Filtrá por categoría y aplicá al brief que mejor se adapte a tu estilo de contenido."
      />
      <CampaignsExplorer campaigns={campaigns} />
    </Section>
  );
}