"use client";

import { useState } from "react";
import type { Campaign, Submission, Creator, TabType } from "./types";
import {
  UsersIcon,
  VideoIcon,
  DollarIcon,
  ClockIcon,
  PlayIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon,
  BadgeCheckIcon,
  ShieldIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

/* ──────────────────────────────────────────────────────────────
 *  DashboardView — paleta personalizada
 *
 *  #022720  verde oscuro (brand)
 *  #006b5f  teal medio (brand-mid / brand-deep)
 *  #A4CF4A  verde claro (lime)
 *  #c5f268  lime brillante (lime-bright)
 *  #35C8B5  menta/celeste (mint)
 *  #C2F2E4  menta claro (mint-light)
 *  #EEF7BE  amarillito (cream)
 * ────────────────────────────────────────────────────────────── */

interface DashboardViewProps {
  campaigns: Campaign[];
  submissions: Submission[];
  creators: Creator[];
  onOpenCreateCampaign: () => void;
  onOpenVideoPlayer: (sub: Submission) => void;
  onOpenRevision: (sub: Submission) => void;
  onApproveSubmission: (sub: Submission) => void;
  onOpenManageBrief: (camp: Campaign) => void;
  onOpenAnalytics: (campaignId?: string) => void;
  onToggleInviteCreator: (creatorId: string) => void;
  onNavigateTab: (tab: TabType) => void;
  searchQuery: string;
}

export function DashboardView({
  campaigns,
  submissions,
  creators,
  onOpenCreateCampaign,
  onOpenVideoPlayer,
  onOpenRevision,
  onApproveSubmission,
  onOpenManageBrief,
  onOpenAnalytics,
  onToggleInviteCreator,
  onNavigateTab,
  searchQuery,
}: DashboardViewProps) {
  const [dateFilter, setDateFilter] = useState<"30d" | "qtd" | "year">("30d");
  const [campaignFilter, setCampaignFilter] = useState<
    "All" | "Active" | "In Review" | "Completed"
  >("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  /* ── Filtered data ─────────────────────────────────────────── */

  const filteredCampaigns = campaigns.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.product.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (campaignFilter === "All") return true;
    if (campaignFilter === "Active") return c.status === "Active";
    if (campaignFilter === "In Review") return c.status === "In Review";
    if (campaignFilter === "Completed")
      return c.status === "Completed & Approved";
    return true;
  });

  const pendingQueue = submissions.filter((s) => s.status === "Pending Review");
  const aiMatches = creators.slice(0, 3);

  /* ── Dynamic metrics ───────────────────────────────────────── */

  const metrics = {
    "30d": {
      activeCampaigns: campaigns.filter((c) => c.status === "Active").length || 4,
      slots: "12 creadores activos",
      views: "1.4M",
      viewsGrowth: "+24.5%",
      spent: "$8.450",
      totalBudget: "$12.000",
      allocatedPct: 70,
      fundsHeld: "$3.550",
    },
    qtd: {
      activeCampaigns: 5,
      slots: "18 creadores activos",
      views: "3.8M",
      viewsGrowth: "+38.2%",
      spent: "$19.200",
      totalBudget: "$25.000",
      allocatedPct: 76,
      fundsHeld: "$5.800",
    },
    year: {
      activeCampaigns: 14,
      slots: "46 creadores total",
      views: "8.6M",
      viewsGrowth: "+62.4%",
      spent: "$48.300",
      totalBudget: "$60.000",
      allocatedPct: 80,
      fundsHeld: "$11.700",
    },
  }[dateFilter];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ═══════════════════════════════════════════════════════════
          1. Welcome & Overview Header
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-mint/20 rounded-2xl p-6 shadow-sm">
        {/* Decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-mint/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Bienvenido, Lumina Organics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper-deep text-brand-deep border border-brand-deep/20 rounded-full text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-deep animate-pulse" />
              Marca Pro
            </span>
          </div>
          <p className="text-sm text-taupe">
            Tus iniciativas de clean beauty están un 24% por encima de las
            previsiones de engagement este trimestre.
          </p>
        </div>

        {/* Quick Controls */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <div className="flex items-center bg-paper-deep border border-mint/25 rounded-xl p-1 text-xs">
            {(
              [
                ["30d", "Últimos 30 días"],
                ["qtd", "Trimestre"],
                ["year", "Año 2025"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === key
                    ? "bg-white font-bold text-ink shadow-xs"
                    : "text-taupe hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateCampaign}
            className="flex items-center gap-2 px-4 py-2.5 bg-lime text-brand font-semibold text-sm rounded-xl hover:bg-lime-bright transition-all duration-150 active:scale-[0.98] shadow-xs"
          >
            <FileTextIcon className="w-4 h-4" />
            <span>+ Nuevo Brief</span>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. KPI Metric Cards (grid 4)
         ═══════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1 — Active Campaigns */}
        <KpiCard
          label="Campañas Activas"
          icon={<VideoIcon className="w-5 h-5" />}
          onClick={() => onNavigateTab("campaigns")}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-ink">
              {metrics.activeCampaigns}
            </span>
            <span className="text-sm text-taupe">Running</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-paper-deep text-brand-deep font-semibold">
              +1 este mes
            </span>
            <span className="text-xs text-taupe">{metrics.slots}</span>
          </div>
        </KpiCard>

        {/* KPI 2 — Submissions Pending */}
        <KpiCard
          label="Contenido Pendiente"
          icon={<ClockIcon className="w-5 h-5" />}
          highlight
          onClick={() => onNavigateTab("submissions")}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-ink">
              {pendingQueue.length > 0 ? 18 : 0}
            </span>
            <span className="text-sm text-taupe">Borradores</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-lime text-brand font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              Requiere acción
            </span>
            <span className="text-xs text-taupe">Review prom: 4.2h</span>
          </div>
        </KpiCard>

        {/* KPI 3 — Total UGC Reach */}
        <KpiCard
          label="Alcance UGC Total"
          icon={<UsersIcon className="w-5 h-5 text-brand-deep" />}
          onClick={() => onNavigateTab("analytics")}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-ink">{metrics.views}</span>
            <span className="text-sm text-taupe">Views</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-mint-light text-brand-mid font-semibold">
              <TrendUpIcon className="w-3 h-3" />
              {metrics.viewsGrowth}
            </span>
            <span className="text-xs text-taupe">vs período anterior</span>
          </div>
        </KpiCard>

        {/* KPI 4 — Budget & Pagos */}
        <KpiCard
          label="Presupuesto & Pagos"
          icon={<DollarIcon className="w-5 h-5" />}
          onClick={() => onNavigateTab("analytics")}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-ink">
              {metrics.spent}{" "}
              <span className="text-sm text-taupe font-normal">
                / {metrics.totalBudget}
              </span>
            </span>
            <span className="text-xs text-brand-deep font-semibold">
              {metrics.allocatedPct}% Asignado
            </span>
          </div>
          {/* Progress bar — gradient #006b5f → #c5f268 */}
          <div className="w-full bg-mint-light/40 h-2.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-brand-mid to-lime-bright h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.allocatedPct}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-taupe">
            <span>{metrics.fundsHeld} en garantía</span>
            <ShieldIcon className="w-3.5 h-3.5 text-brand-deep" />
          </div>
        </KpiCard>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. Active Campaigns Table
         ═══════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Campañas Activas
            </h2>
            <p className="text-xs sm:text-sm text-taupe">
              Cronogramas de producción UGC, cumplimiento de deliverables y
              ritmo de entregas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-3 py-1.5 border border-mint/20 bg-white rounded-lg text-xs font-semibold text-taupe flex items-center gap-1.5 hover:bg-paper-deep transition-colors"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filtro: {campaignFilter}</span>
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-mint/20 rounded-xl shadow-md z-30 p-1.5 text-xs">
                  {(
                    ["All", "Active", "In Review", "Completed"] as const
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setCampaignFilter(status);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                        campaignFilter === status
                          ? "bg-paper-deep text-brand-deep font-bold"
                          : "text-taupe hover:bg-paper"
                      }`}
                    >
                      {status === "All"
                        ? "Todas"
                        : status === "Active"
                          ? "Activas"
                          : status === "In Review"
                            ? "En Revisión"
                            : "Completadas"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateTab("campaigns")}
              className="text-sm font-semibold text-brand-deep hover:text-ink flex items-center gap-1 pl-2 transition-colors"
            >
              <span>Ver todas</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((camp) => (
            <CampaignRow
              key={camp.id}
              campaign={camp}
              onOpenVideoPlayer={onOpenVideoPlayer}
              onOpenRevision={onOpenRevision}
              onApproveSubmission={onApproveSubmission}
              onOpenManageBrief={onOpenManageBrief}
              onOpenAnalytics={onOpenAnalytics}
              onNavigateTab={onNavigateTab}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. Bento: Pending Queue (8) + Talent Matches (4)
         ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Pending Submissions Queue */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  Cola de Submissions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs bg-lime text-brand font-semibold">
                  {pendingQueue.length > 0 ? "18 Listos" : "0 Pendientes"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-taupe">
                Revisá borradores de creadores, pedí revisiones o liberá pagos
                retenidos.
              </p>
            </div>
            <span className="text-xs text-taupe hidden sm:block">
              Liberación Automática con QA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingQueue.slice(0, 3).map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                onOpenVideoPlayer={onOpenVideoPlayer}
                onOpenRevision={onOpenRevision}
                onApproveSubmission={onApproveSubmission}
              />
            ))}
          </div>
        </section>

        {/* AI Talent Matches */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Matches IA
              </h2>
              <p className="text-xs sm:text-sm text-taupe">
                Recomendados para Clean Skincare
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("talent")}
              className="text-brand-deep hover:text-ink transition-colors p-1"
              title="Ver todos"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white border border-mint/20 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            {aiMatches.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-paper-deep transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-clay flex items-center justify-center text-white font-semibold text-sm">
                      {creator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime rounded-full flex items-center justify-center border border-white">
                      <BadgeCheckIcon className="w-2.5 h-2.5 text-brand" />
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-ink leading-tight">
                      {creator.name}
                    </h4>
                    <span className="text-xs text-taupe">
                      {creator.handle} · {creator.followers}
                    </span>
                    <span className="text-[11px] text-brand-deep font-semibold mt-0.5">
                      {creator.engagementRate}% Engagement prom.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleInviteCreator(creator.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    creator.invited
                      ? "bg-lime text-brand border border-lime"
                      : "bg-mint-light/40 border border-mint/30 hover:bg-brand hover:text-white text-ink"
                  }`}
                >
                  {creator.invited ? "Invitado ✓" : "Invitar"}
                </button>
              </div>
            ))}

            {/* Talent Discovery Banner */}
            <div className="mt-2 p-4 rounded-xl bg-mint-light/30 border border-mint/30 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-ink text-sm font-bold">
                <SparklesIcon className="w-4 h-4 text-mint" />
                <span>¿Necesitás 20+ Creadores Rápido?</span>
              </div>
              <p className="text-xs text-taupe">
                El Matchmaker IA de Gaia puede auto-castear creadores
                verificados de lifestyle sustentable según las specs de tu brief.
              </p>
              <button
                onClick={() => onNavigateTab("talent")}
                className="mt-1 text-xs font-bold text-brand-deep hover:underline flex items-center gap-1 text-left"
              >
                <span>Abrir Motor de Descubrimiento</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  Sub-components
 * ═══════════════════════════════════════════════════════════════ */

/* ── KPI Card ──────────────────────────────────────────────── */

function KpiCard({
  label,
  icon,
  highlight,
  onClick,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between cursor-pointer group ${
        highlight
          ? "border-lime/50 ring-1 ring-lime/40"
          : "border-mint/20"
      }`}
    >
      <div className="flex items-center justify-between text-taupe">
        <span className="text-xs uppercase tracking-wider text-taupe font-semibold">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-mint-light/40 flex items-center justify-center text-brand group-hover:bg-lime/40 transition-colors">
          {icon}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/* ── Campaign Row ──────────────────────────────────────────── */

function CampaignRow({
  campaign: camp,
  onOpenVideoPlayer,
  onOpenRevision,
  onApproveSubmission,
  onOpenManageBrief,
  onOpenAnalytics,
  onNavigateTab,
}: {
  campaign: Campaign;
  onOpenVideoPlayer: (sub: Submission) => void;
  onOpenRevision: (sub: Submission) => void;
  onApproveSubmission: (sub: Submission) => void;
  onOpenManageBrief: (camp: Campaign) => void;
  onOpenAnalytics: (id?: string) => void;
  onNavigateTab: (tab: TabType) => void;
}) {
  const statusStyles = {
    Active: "bg-lime/30 text-brand-mid",
    "In Review": "bg-lime text-brand",
    "Completed & Approved": "bg-mint-light/50 text-taupe",
  };

  return (
    <div className="bg-white border border-mint/20 rounded-2xl p-4 sm:p-6 shadow-sm hover:border-brand-deep/30 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-paper-deep flex items-center justify-center shrink-0 border border-mint/20 overflow-hidden">
          <VideoIcon className="w-6 h-6 text-brand-deep" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyles[camp.status]}`}
            >
              {camp.status === "Active"
                ? "Activa"
                : camp.status === "In Review"
                  ? "En Revisión"
                  : "Completada"}
            </span>
            <span className="text-xs text-taupe">ID: {camp.code}</span>
          </div>
          <h3 className="text-base sm:text-lg text-ink mt-1 font-bold">
            {camp.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-taupe">
            <span className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5 text-brand-deep" />
              {camp.creatorsApproved}/{camp.creatorsTarget} Creadores
            </span>
            <span className="flex items-center gap-1">
              <VideoIcon className="w-3.5 h-3.5 text-brand-deep" />
              {camp.videosSubmitted} videos enviados
            </span>
            <span className="flex items-center gap-1">
              <DollarIcon className="w-3.5 h-3.5 text-brand-deep" />
              Presupuesto: ${camp.budget.toLocaleString()}
            </span>
            {camp.roi ? (
              <span className="flex items-center gap-1 font-bold text-brand-deep">
                <TrendUpIcon className="w-3.5 h-3.5" />
                ROI: {camp.roi}x
              </span>
            ) : (
              <span
                className={`flex items-center gap-1 font-medium ${
                  camp.daysLeft <= 5 ? "text-red-600" : "text-taupe"
                }`}
              >
                <ClockIcon className="w-3.5 h-3.5" />
                {camp.daysLeft} días restantes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 xl:min-w-[420px] justify-end border-t xl:border-t-0 pt-4 xl:pt-0 border-mint/20">
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs text-taupe mb-1.5">
            <span>
              {camp.status === "Completed & Approved"
                ? "Meta de Entrega"
                : "Ritmo de Producción"}
            </span>
            <span
              className={`font-bold ${
                camp.status === "Completed & Approved"
                  ? "text-brand-deep"
                  : "text-ink"
              }`}
            >
              {camp.productionPace}%{" "}
              {camp.status === "Completed & Approved" ? "Cumplido" : "Completo"}
            </span>
          </div>
          <div className="w-full bg-mint-light/30 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                camp.productionPace === 100
                  ? "bg-brand-mid"
                  : camp.productionPace >= 70
                    ? "bg-brand"
                    : "bg-lime"
              }`}
              style={{ width: `${camp.productionPace}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {camp.status === "Completed & Approved" ? (
            <>
              <button
                onClick={() => onOpenManageBrief(camp)}
                className="px-3.5 py-2 bg-paper-deep text-ink text-xs font-medium rounded-xl hover:bg-mint-light/40 transition-colors"
              >
                Ver Archivo
              </button>
              <button
                onClick={() => onOpenAnalytics(camp.id)}
                className="px-3.5 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition-all flex items-center gap-1.5 shadow-xs"
              >
                <BarChartIcon className="w-4 h-4 text-lime" />
                <span>Analytics</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigateTab("submissions")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs ${
                  camp.status === "Active"
                    ? "bg-lime text-brand hover:bg-lime-bright"
                    : "bg-mint-light/40 text-brand hover:bg-mint-light"
                }`}
              >
                <CheckIcon className="w-4 h-4" />
                <span>Revisar Submissions</span>
              </button>
              <button
                onClick={() => onOpenManageBrief(camp)}
                className="px-3 py-2 bg-paper-deep text-ink text-xs font-medium rounded-xl hover:bg-mint-light/40 transition-colors"
              >
                Gestionar Brief
              </button>
              <button
                onClick={() => onOpenAnalytics(camp.id)}
                className="p-2 text-taupe hover:text-ink rounded-lg hover:bg-paper-deep transition-colors"
                title="Analytics"
              >
                <BarChartIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Submission Card ───────────────────────────────────────── */

function SubmissionCard({
  submission: sub,
  onOpenVideoPlayer,
  onOpenRevision,
  onApproveSubmission,
}: {
  submission: Submission;
  onOpenVideoPlayer: (sub: Submission) => void;
  onOpenRevision: (sub: Submission) => void;
  onApproveSubmission: (sub: Submission) => void;
}) {
  return (
    <div className="bg-white border border-mint/20 rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
      <div>
        {/* Video thumbnail */}
        <div className="relative w-full aspect-[9/14] rounded-xl overflow-hidden bg-brand">
          <div className="w-full h-full bg-gradient-to-br from-brand via-brand-mid to-ink flex items-center justify-center">
            <PlayIcon className="w-10 h-10 text-mint/60" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-transparent to-black/20 flex flex-col justify-between p-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/50 backdrop-blur-md text-white font-medium">
                Reel 1080x1920
              </span>
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] bg-lime text-brand font-bold">
                <StarIcon className="w-3 h-3" />
                {sub.rating.toFixed(1)}
              </span>
            </div>

            {/* Play button */}
            <button
              onClick={() => onOpenVideoPlayer(sub)}
              className="self-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 group-hover:scale-110 group-hover:bg-lime group-hover:text-brand transition-all cursor-pointer focus:outline-none"
              aria-label="Reproducir video"
            >
              <PlayIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between text-white text-[11px] font-medium">
              <span className="truncate max-w-[170px]">
                {sub.videoDuration} · {sub.hookVariant.split("(")[0]}
              </span>
              <span className="text-[10px] font-bold tracking-wider">HD</span>
            </div>
          </div>
        </div>

        {/* Creator info */}
        <div className="mt-3 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-clay flex items-center justify-center text-white text-[10px] font-bold">
                {sub.creator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink leading-none">
                  {sub.creator.name}
                </h4>
                <span className="text-[11px] text-taupe">
                  {sub.creator.handle}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-deep">
              {sub.creator.matchScore}% Match
            </span>
          </div>
          <p className="text-xs text-taupe mt-2 line-clamp-1">
            Campaña: {sub.campaignTitle}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-mint/20 flex flex-col gap-2">
        <button
          onClick={() => onApproveSubmission(sub)}
          className="w-full py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition-all flex items-center justify-center gap-1 shadow-xs active:scale-[0.98]"
        >
          <CheckIcon className="w-4 h-4 text-lime" />
          <span>Aprobar & Liberar (${sub.payoutAmount})</span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenRevision(sub)}
            className="flex-1 py-1.5 bg-paper-deep text-ink text-xs font-medium rounded-lg hover:bg-mint-light/40 transition-colors"
          >
            Pedir Revisión
          </button>
          <button
            onClick={() => onOpenVideoPlayer(sub)}
            className="px-2 py-1.5 bg-paper-deep text-ink rounded-lg hover:bg-mint-light/40 transition-colors"
            title="Ver Completo"
          >
            <VideoIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  Extra inline SVG icons (dashboard-specific)
 * ═══════════════════════════════════════════════════════════════ */

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function TrendUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
