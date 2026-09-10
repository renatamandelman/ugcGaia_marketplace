import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/campaigns/campaign-form";

export const metadata = { title: "Publicar campaña" };

export default async function NewCampaignPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "brand") {
    redirect("/profile");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Publicá una campaña
      </h1>
      <p className="mt-1 text-sm text-taupe">
        Contales a los creadores qué necesitás. Publicado como {profile?.full_name}.
      </p>

      <div className="mt-8 rounded-2xl border border-bone bg-white p-6 sm:p-8">
        <CampaignForm />
      </div>
    </div>
  );
}