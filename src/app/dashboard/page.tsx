import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHero } from "@/components/dashboard/hero";
import { DeliverablesList } from "@/components/dashboard/deliverables";
import {
  RecommendedBriefs,
  type RecommendedBrief,
} from "@/components/dashboard/recommended-briefs";
import { CreatorSidebar } from "@/components/dashboard/sidebar";
import { MyApplications } from "@/components/profile/my-applications";
import {
  computeMatchPercent,
  sharedTags,
} from "@/lib/matchmaking";
import { mapCampaignRow } from "@/lib/campaigns";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Si es marca, redirigir al profile de marca
  if (profile?.role === "brand") redirect("/profile");

  // Briefs recomendados: ranking real por traslape de tags (matchmaking)
  const creatorTags: string[] = profile?.tags ?? [];
  const { data: campaignRows } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, category, budget_min, budget_max, tags, created_at, profiles(full_name)"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const recommendedBriefs: RecommendedBrief[] = (campaignRows ?? [])
    .map((row) => {
      const campaign = mapCampaignRow(row as never);
      return {
        id: campaign.id,
        brandName: campaign.brand,
        category: campaign.category,
        title: campaign.title,
        description: campaign.description,
        budgetMin: campaign.budget_min,
        budgetMax: campaign.budget_max,
        matchPercent: computeMatchPercent(creatorTags, campaign.tags),
        sharedTags: sharedTags(creatorTags, campaign.tags),
      };
    })
    .filter((brief) => brief.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <DashboardHero />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main content — 8 cols */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          <MyApplications />
          <DeliverablesList />
          <RecommendedBriefs
            briefs={recommendedBriefs}
            creatorTags={creatorTags}
          />
        </div>

        {/* Sidebar — 4 cols */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <CreatorSidebar />
          </div>
        </aside>
      </div>
    </main>
  );
}
