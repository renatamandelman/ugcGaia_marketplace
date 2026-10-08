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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isBrand = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isBrand = profile?.role === "brand";
  }

  // Marcas: solo sus propias campañas (cualquier estado — es su panel de gestión).
  // Creadores y visitantes: todas las campañas abiertas.
  let query = supabase
    .from("campaigns")
    .select(
      "id, title, description, category, budget_min, budget_max, deliverables, deadline, status, tags, created_at, profiles(full_name)"
    )
    .order("created_at", { ascending: false });

  query = isBrand && user ? query.eq("brand_id", user.id) : query.eq("status", "open");

  const { data } = await query;

  const campaigns = (data ?? []).map((row) => mapCampaignRow(row as never));

  return (
    <Section>
      <SectionHeading
        title={isBrand ? "Mis campañas" : "Campañas activas"}
        description={
          isBrand
            ? "Gestioná tus briefs publicados: editalos, cambialos de estado o eliminalos."
            : "Buscá por texto, filtrá por categoría y tags, y aplicá al brief que mejor se adapte a tu estilo de contenido."
        }
      />
      {campaigns.length === 0 ? (
        <p className="text-center text-sm text-taupe">
          {isBrand
            ? "Todavía no publicaste campañas. Creá tu primer brief."
            : "Todavía no hay campañas activas. Publicá la primera."}
        </p>
      ) : (
        <CampaignsExplorer campaigns={campaigns} />
      )}
    </Section>
  );
}