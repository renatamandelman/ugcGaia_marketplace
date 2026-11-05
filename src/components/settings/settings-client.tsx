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
      </section>
    </div>
  );
}