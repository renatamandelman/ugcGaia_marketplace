"use client";

import type { Profile } from "@/lib/db-types";

interface SettingsNavProps {
  profile: Profile;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "profile", icon: "👤", label: "Perfil Personal" },
  { id: "portfolio", icon: "🎬", label: "Portfolio & Media" },
  { id: "rates", icon: "💰", label: "Rate Cards & Paquetes" },
  { id: "social", icon: "📊", label: "Redes & Métricas" },
  { id: "payments", icon: "💳", label: "Pagos" },
];

export { navItems as settingsNavItems };

export function SettingsTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <nav className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === item.id
              ? "bg-brand text-white shadow-sm"
              : "bg-white text-taupe ring-1 ring-bone hover:bg-paper-deep"
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function SettingsSidebar({ profile, activeTab, onTabChange }: SettingsNavProps) {
  const initial = (profile.full_name || "G").charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Mini profile */}
      <div className="rounded-2xl border border-bone bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3.5 border-b border-bone/40 pb-4">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-mint/50">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Avatar"}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-brand text-lg font-bold text-white">
                {initial}
              </div>
            )}
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-brand" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-ink">
              {profile.full_name || "Creador"}
            </h3>
            <p className="text-xs text-taupe">
              {profile.handle ? `@${profile.handle}` : "Sin handle"} • Verificada
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="mt-4 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm transition-all ${
                activeTab === item.id
                  ? "bg-brand font-bold text-white shadow-sm"
                  : "text-taupe hover:bg-paper-deep hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {activeTab === item.id && (
                <span className="size-2 rounded-full bg-mint" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Portfolio strength */}
      <div className="rounded-2xl border border-bone bg-gradient-to-br from-paper to-paper-deep p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-brand">Fuerza del Portfolio</span>
          <span className="text-sm font-bold text-ink">92%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bone/40">
          <div className="h-full rounded-full bg-brand" style={{ width: "92%" }} />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-taupe">
          Agregá 1 deliverable más de clean beauty con tag de marca para desbloquear{" "}
          <strong className="text-ink">Top Pick en búsqueda de marcas</strong>.
        </p>
      </div>
    </div>
  );
}