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
import { fetchCollaborations } from "@/lib/collaborations";

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

  const collaborations = await fetchCollaborations(supabase, user.id);
  const activeCollaborations = collaborations.filter(
    (collaboration) =>
      collaboration.status !== "approved" &&
      collaboration.status !== "cancelled"
  );
  const inReviewCount = collaborations.filter(
    (collaboration) => collaboration.pendingReview
  ).length;
  const releasedTotal = collaborations
    .filter((collaboration) => collaboration.status === "approved")
    .reduce((total, collaboration) => total + Number(collaboration.creator_amount), 0);
  const heldTotal = collaborations
    .filter((collaboration) => collaboration.payment_status === "held")
    .reduce((total, collaboration) => total + Number(collaboration.creator_amount), 0);

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: transactionRows } = await supabase
    .from("wallet_transactions")
    .select("id, collaboration_id, kind, amount, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const collaborationById = new Map(
    collaborations.map((collaboration) => [collaboration.id, collaboration])
  );
  const walletActivity = (transactionRows ?? []).map((transaction) => ({
    id: transaction.id as string,
    label:
      collaborationById.get(transaction.collaboration_id as string)?.campaign
        ?.title || "Colaboración",
    date: transaction.created_at as string,
    amount: Number(transaction.amount),
    kind: transaction.kind as "hold" | "release" | "refund",
  }));

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
      <DashboardHero
        name={profile?.full_name || "Creador"}
        activeCount={activeCollaborations.length}
        inReviewCount={inReviewCount}
        releasedTotal={releasedTotal}
        heldTotal={heldTotal}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main content — 8 cols */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          <MyApplications />
          <DeliverablesList collaborations={collaborations} />
          <RecommendedBriefs
            briefs={recommendedBriefs}
            creatorTags={creatorTags}
          />
        </div>

        {/* Sidebar — 4 cols */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <CreatorSidebar
              balance={Number(wallet?.balance ?? 0)}
              releasedTotal={releasedTotal}
              heldTotal={heldTotal}
              activeCount={activeCollaborations.length}
              transactions={walletActivity}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
