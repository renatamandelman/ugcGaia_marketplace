import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = {
  title: "Configuración — Gaia",
};

export default async function SettingsPage() {
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

  // Solo creadores acceden a settings
  if (!profile || profile.role !== "creator") redirect("/profile");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-bone/40 pb-6">
        <a
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-taupe transition-colors hover:text-brand"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Creator Hub
        </a>
        <span className="text-bone">/</span>
        <span className="text-sm font-semibold text-ink">Configuración & Portfolio</span>
      </div>

      <SettingsClient profile={profile} />
    </main>
  );
}
