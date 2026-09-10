import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { BrandDashboardContainer } from "@/components/profile/dashboard";
import { MyApplications } from "@/components/profile/my-applications";
import { PortfolioList } from "@/components/profile/portfolio";

export default async function ProfilePage() {
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

  const isBrand = profile?.role === "brand";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {isBrand ? "Panel de marca" : "Mi perfil"}
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {isBrand
              ? "Gestioná tus briefs y evaluá las propuestas de los creadores."
              : "Completá tu perfil para que las marcas te encuentren."}
          </p>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {isBrand ? "Marca" : "Creador"}
        </span>
      </div>

      {isBrand ? (
        <div className="mt-8 space-y-6">
          <BrandDashboardContainer />
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <ProfileForm profile={profile} />
            <aside>
              <ForCreatorHighlight role="brand" />
            </aside>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-6">
              <ProfileForm profile={profile} />
              <MyApplications />
            </div>
            <aside className="hidden lg:block">
              <ForCreatorHighlight role="creator" />
            </aside>
          </div>
          <PortfolioList creatorId={user.id} isOwner={true} />
        </div>
      )}
    </div>
  );
}

function ForCreatorHighlight({ role }: { role?: string }) {
  return (
    <div className="rounded-2xl border border-bone bg-white p-6">
      <h2 className="text-base font-semibold text-ink">
        {role === "brand" ? "Publicá tu brief" : "Aplicá a campañas"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-taupe">
        {role === "brand"
          ? "Creá una campaña con presupuesto, plazos y deliverables. El mejor matching con micro-creadores UGC."
          : "Explorá las campañas activas y postulá tu propuesta. Las marcas te responden con feedback real."}
      </p>
    </div>
  );
}