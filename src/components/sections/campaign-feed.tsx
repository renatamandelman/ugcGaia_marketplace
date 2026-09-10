import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaign-card";
import { createClient } from "@/lib/supabase/server";
import { mapCampaignRow } from "@/lib/campaigns";

export async function CampaignFeed() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, category, budget_min, budget_max, deliverables, deadline, status, created_at, profiles(full_name)"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(6);

  const campaigns = (data ?? []).map((row) =>
    mapCampaignRow(row as never)
  );

  return (
    <Section id="campanas">
      <SectionHeading
        title="Campañas activas en este momento"
        description="Briefs reales con presupuesto, plazos y entregas definidos. Aplicá en un clic y que tu trabajo hable por vos."
      />

      {campaigns.length === 0 ? (
        <p className="text-center text-sm text-taupe">
          Todavía no hay campañas activas. Si sos marca, publicá la primera.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <ButtonLink href="/campaigns" variant="primary" size="lg">
          Explorar todas las campañas
        </ButtonLink>
      </div>
    </Section>
  );
}