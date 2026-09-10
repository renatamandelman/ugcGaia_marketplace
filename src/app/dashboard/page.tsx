import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHero } from "@/components/dashboard/hero";
import { DeliverablesList } from "@/components/dashboard/deliverables";
import { RecommendedBriefs } from "@/components/dashboard/recommended-briefs";
import { CreatorSidebar } from "@/components/dashboard/sidebar";
import { MyApplications } from "@/components/profile/my-applications";

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

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <DashboardHero />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main content — 8 cols */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          <MyApplications />
          <DeliverablesList />
          <RecommendedBriefs />
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
