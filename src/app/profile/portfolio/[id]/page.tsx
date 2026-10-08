import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortfolioShowcase } from "@/components/portfolio/showcase";
import { RateCards } from "@/components/portfolio/rate-cards";
import { Avatar } from "@/components/ui/avatar";
import { TikTokIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/icons";

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata() {
  return { title: "Portfolio del Creador — Gaia" };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile || profile.role !== "creator") notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === id;

  // Fetch portfolio items
  const { data: portfolioItems } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("creator_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      {/* Hero profile header */}
      <section className="relative overflow-hidden rounded-2xl border border-bone bg-white shadow-sm">
        {/* Banner */}
        <div className="relative h-48 w-full md:h-64">
          {profile.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.banner_url}
              alt={`Banner de ${profile.full_name}`}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-gradient-to-r from-brand to-brand-mid" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/30 to-transparent" />

        

          {/* Share / Media Kit buttons */}
          <div className="absolute right-6 top-6 hidden gap-2 md:flex">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/40">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
              Compartir
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/40">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              Media Kit
            </button>
          </div>
        </div>

        {/* Creator info strip */}
        <div className="relative px-6 pb-8 pt-0 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/* Avatar & identity */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="relative -mt-16 md:-mt-20">
                <div className="size-32 rounded-full border-4 border-white shadow-lg md:size-40">
                  <Avatar name={profile.full_name} size="lg" className="size-full text-3xl" src={profile.avatar_url} />
                </div>
                <div className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-mint text-brand shadow-sm">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl font-bold tracking-tight text-ink">
                    {profile.full_name}
                  </h1>
                </div>
                <p className="font-medium text-taupe">
                  {profile.bio || "Creador de contenido UGC en Gaia"}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-taupe">
                  <span className="flex items-center gap-1 font-semibold text-ink">
                    <svg className="text-amber-500" width={14} height={14} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    4.9 <span className="font-normal">(48 Reviews)</span>
                  </span>
                  <span className="inline-block size-1 rounded-full bg-bone" />
                  <span className="flex items-center gap-1">
                    <svg className="text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    99% entregas a tiempo
                  </span>
                  {profile.location && (
                    <>
                      <span className="inline-block size-1 rounded-full bg-bone" />
                      <span className="flex items-center gap-1">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        {profile.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex w-full flex-wrap items-center gap-3 self-stretch sm:w-auto sm:flex-nowrap lg:self-end">
<button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-bone bg-paper px-6 text-sm font-bold text-brand transition-colors hover:bg-paper-deep">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                Mensaje
              </button>
             
             
            </div>
          </div>

          {/* Social links strip */}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-bone/40 pt-6 sm:grid-cols-3">
            {profile.tiktok_url ? (
              <SocialLinkCard label="TikTok" platform="tiktok" href={profile.tiktok_url} />
            ) : null}
            {profile.instagram_url ? (
              <SocialLinkCard label="Instagram" platform="instagram" href={profile.instagram_url} />
            ) : null}
            {profile.youtube_url ? (
              <SocialLinkCard label="YouTube" platform="youtube" href={profile.youtube_url} />
            ) : null}
            {!profile.tiktok_url && !profile.instagram_url && !profile.youtube_url ? (
              <div className="col-span-1 rounded-xl border border-bone/40 bg-paper p-3 text-sm text-taupe sm:col-span-3">
                Este creador todavía no conectó sus redes sociales.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Portfolio showcase */}
      <PortfolioShowcase items={portfolioItems ?? []} isOwner={isOwner} />

      {/* Rate cards */}
      <RateCards />
    </main>
  );
}

function MetricPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-bone/40 p-3 ${accent ? "bg-mint/20" : "bg-paper"}`}>
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-taupe">{label}</p>
        <p className={`text-sm font-bold ${accent ? "text-brand" : "text-ink"}`}>{value}</p>
      </div>
    </div>
  );
}

function SocialLinkCard({
  label,
  platform,
  href,
}: {
  label: string;
  platform: "tiktok" | "instagram" | "youtube";
  href: string;
}) {
  const colors: Record<string, string> = {
    tiktok: "bg-black text-white",
    instagram: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
    youtube: "bg-red-600 text-white",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-bone/40 bg-paper p-3 transition-colors hover:border-brand hover:bg-mint/20"
    >
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${colors[platform]}`}>
        <SocialPlatformIcon platform={platform} width={18} height={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-taupe">{label}</p>
        <p className="truncate text-sm font-bold text-brand">Ver perfil ↗</p>
      </div>
    </a>
  );
}

function SocialPlatformIcon({
  platform,
  width = 18,
  height = 18,
}: {
  platform: "tiktok" | "instagram" | "youtube";
  width?: number;
  height?: number;
}) {
  switch (platform) {
    case "tiktok":
      return <TikTokIcon width={width} height={height} />;
    case "instagram":
      return <InstagramIcon width={width} height={height} />;
    case "youtube":
      return <YouTubeIcon width={width} height={height} />;
  }
}
