"use client";

import { useState, useCallback } from "react";
import { DashboardView } from "./dashboard-view";
import type {
  Campaign,
  Submission,
  Creator,
  TabType,
} from "./types";
import { mockCampaigns, mockSubmissions, mockCreators } from "./mock-data";

/* ──────────────────────────────────────────────────────────────
 *  BrandDashboardContainer
 *
 *  Owns all state and callbacks for the dashboard.
 *  Initially wired to mock data; swap to Supabase queries when
 *  the backend is ready (mechanical — same shape).
 * ────────────────────────────────────────────────────────────── */

export function BrandDashboardContainer() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [submissions] = useState<Submission[]>(mockSubmissions);
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [searchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("campaigns");

  /* ── Callbacks ─────────────────────────────────────────────── */

  const onOpenCreateCampaign = useCallback(() => {
    // TODO: open create-campaign modal or navigate
    console.log("Open create campaign");
  }, []);

  const onOpenVideoPlayer = useCallback((sub: Submission) => {
    // TODO: open video player modal
    console.log("Play video:", sub.id);
  }, []);

  const onOpenRevision = useCallback((sub: Submission) => {
    // TODO: open revision request modal
    console.log("Request revision:", sub.id);
  }, []);

  const onApproveSubmission = useCallback((sub: Submission) => {
    // TODO: approve + release payment
    console.log("Approve submission:", sub.id);
  }, []);

  const onOpenManageBrief = useCallback((camp: Campaign) => {
    // TODO: open brief editor modal or navigate
    console.log("Manage brief:", camp.id);
  }, []);

  const onOpenAnalytics = useCallback((campaignId?: string) => {
    // TODO: navigate to analytics view
    console.log("Open analytics:", campaignId ?? "overview");
  }, []);

  const onToggleInviteCreator = useCallback((creatorId: string) => {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === creatorId ? { ...c, invited: !c.invited } : c
      )
    );
  }, []);

  const onNavigateTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // TODO: scroll to relevant section or switch views
  }, []);

  return (
    <DashboardView
      campaigns={campaigns}
      submissions={submissions}
      creators={creators}
      onOpenCreateCampaign={onOpenCreateCampaign}
      onOpenVideoPlayer={onOpenVideoPlayer}
      onOpenRevision={onOpenRevision}
      onApproveSubmission={onApproveSubmission}
      onOpenManageBrief={onOpenManageBrief}
      onOpenAnalytics={onOpenAnalytics}
      onToggleInviteCreator={onToggleInviteCreator}
      onNavigateTab={onNavigateTab}
      searchQuery={searchQuery}
    />
  );
}
