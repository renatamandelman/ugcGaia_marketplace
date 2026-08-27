import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaign-card";
import { campaigns } from "@/lib/mock-data";

export function CampaignFeed() {
  const featured = campaigns.filter((campaign) => campaign.status !== "filled").slice(0, 3);

  return (
    <Section className="bg-zinc-50/60">
      <SectionHeading
        eyebrow="Para creadores"
        title="Campañas activas en este momento"
        description="Briefs reales con presupuesto, plazos y entregas definidos. Aplicá en un clic y que tu trabajo hable por vos."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <ButtonLink href="/campaigns" variant="primary" size="lg">
          Explorar todas las campañas
        </ButtonLink>
      </div>
    </Section>
  );
}