import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/campaigns/campaign-form";

export const metadata = { title: "Editar campaña" };

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, brand_id, title, description, category, budget_min, budget_max, deliverables, deadline, status, tags"
    )
    .eq("id", id)
    .single();

  if (!campaign) notFound();
  if (campaign.brand_id !== user.id) redirect(`/campaigns/${id}`);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Editar campaña
      </h1>
      <p className="mt-1 text-sm text-taupe">
        Actualizá el brief. Los creadores que ya aplicaron conservan su
        postulación.
      </p>

      <div className="mt-8 rounded-2xl border border-bone bg-white p-6 sm:p-8">
        <CampaignForm
          campaign={{
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            category: campaign.category,
            budget_min: campaign.budget_min,
            budget_max: campaign.budget_max ?? null,
            deliverables: campaign.deliverables ?? null,
            deadline: campaign.deadline ?? null,
            status: campaign.status,
            tags: campaign.tags ?? [],
          }}
        />
      </div>
    </div>
  );
}
