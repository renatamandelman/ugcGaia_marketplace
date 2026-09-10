"use client";

import { useState } from "react";
import {
  SettingsSidebar,
  SettingsTabBar,
} from "@/components/settings/sidebar";
import { ProfileSettingsForm } from "@/components/settings/profile-form";
import { PortfolioList } from "@/components/profile/portfolio";
import type { Profile } from "@/lib/db-types";

interface SettingsClientProps {
  profile: Profile;
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* Sidebar — 3 cols */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
        {/* Mobile: tabs horizontales scrolleables (no tapan contenido) */}
        <SettingsTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Desktop: sidebar completo sticky */}
        <div className="hidden lg:block lg:sticky lg:top-28">
          <SettingsSidebar
            profile={profile}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </aside>

      {/* Main content — 9 cols */}
      <section className="col-span-12 lg:col-span-8 xl:col-span-9">
        {activeTab === "profile" && <ProfileSettingsForm profile={profile} />}
        {activeTab === "portfolio" && (
          <PortfolioList creatorId={profile.id} />
        )}
        {activeTab === "rates" && <RatesPlaceholder />}
        {activeTab === "social" && <SocialPlaceholder />}
        {activeTab === "payments" && <PaymentsPlaceholder />}
      </section>
    </div>
  );
}

function RatesPlaceholder() {
  return (
    <div className="rounded-2xl border border-bone bg-white p-8 shadow-sm text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-paper-deep text-2xl">💰</div>
      <h2 className="mt-4 text-lg font-bold text-ink">Rate Cards & Paquetes</h2>
      <p className="mt-2 text-sm text-taupe">Próximamente: configuración de precios y paquetes personalizados.</p>
    </div>
  );
}

function SocialPlaceholder() {
  return (
    <div className="rounded-2xl border border-bone bg-white p-8 shadow-sm text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-paper-deep text-2xl">📊</div>
      <h2 className="mt-4 text-lg font-bold text-ink">Redes & Métricas</h2>
      <p className="mt-2 text-sm text-taupe">Próximamente: sync de TikTok, Instagram y YouTube.</p>
    </div>
  );
}

function PaymentsPlaceholder() {
  return (
    <div className="rounded-2xl border border-bone bg-white p-8 shadow-sm text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-paper-deep text-2xl">💳</div>
      <h2 className="mt-4 text-lg font-bold text-ink">Pagos</h2>
      <p className="mt-2 text-sm text-taupe">Próximamente: configuración de cuenta bancaria y pagos.</p>
    </div>
  );
}