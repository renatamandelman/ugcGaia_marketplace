import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { CampaignsExplorer } from "@/components/campaigns-explorer";
import { createClient } from "@/lib/supabase/server";
import { mapCampaignRow } from "@/lib/campaigns";

export const metadata: Metadata = {
  title: "Campañas activas",
  description:
    "Explorá los briefs activos de las marcas en GaiaUGC: presupuesto, entregas y plazos claros para aplicar como creador.",
};

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, category, budget_min, budget_max, deliverables, deadline, status, tags, created_at, profiles(full_name)"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const campaigns = (data ?? []).map((row) => mapCampaignRow(row as never));

  return (
    <Section>
      <SectionHeading
        title="Campañas activas"
        description="Buscá por texto, filtrá por categoría y tags, y aplicá al brief que mejor se adapte a tu estilo de contenido."
      />
      {campaigns.length === 0 ? (
        <p className="text-center text-sm text-taupe">
          Todavía no hay campañas activas. Publicá la primera.
        </p>
      ) : (
        <CampaignsExplorer campaigns={campaigns} />
      )}
    </Section>
  );
}