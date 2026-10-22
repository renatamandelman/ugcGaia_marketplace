import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { CampaignOwnerActions } from "@/components/campaigns/owner-actions";
import { ApplicationActions } from "./application-actions";
import { CollaborationCard } from "@/components/collaborations/collaboration-card";
import { fetchCollaborations } from "@/lib/collaborations";
import {
  BadgeCheckIcon,
  ClockIcon,
  DollarIcon,
  UsersIcon,
  VideoIcon,
  WalletIcon,
} from "@/components/ui/icons";
import {
  daysUntilDeadline,
  deadlineLabel,
  formatBudget,
  formatBudgetRange,
} from "@/lib/format";
import type { ApplicationStatus } from "@/lib/db-types";

interface ApplicantProfile {
  id: string;
  full_name: string;
  handle: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface ApplicationWithCreator {
  id: string;
  pitch: string | null;
  status: ApplicationStatus;
  created_at: string;
  conversation_id?: string | null;
  creator: ApplicantProfile | ApplicantProfile[] | null;
}

interface CampaignWithApplications {
  id: string;
  title: string;
  status: "open" | "filled" | "closed";
  category: string;
  budget_min: number;
  budget_max: number | null;
  deadline: string | null;
  created_at: string;
  applications: ApplicationWithCreator[];
}

function profileOf(
  creator: ApplicantProfile | ApplicantProfile[] | null
): ApplicantProfile | null {
  if (Array.isArray(creator)) return creator[0] ?? null;
  return creator;
}

function applicationStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case "accepted":
      return "Aceptada";
    case "rejected":
      return "Rechazada";
    default:
      return "Pendiente";
  }
}

const applicationStatusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-paper-deep text-taupe ring-zinc-500/20",
};

function ApplicationStatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${applicationStatusStyles[status]}`}
    >
      {applicationStatusLabel(status)}
    </span>
  );
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

async function fetchCampaignApplications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campaignIds: string[]
): Promise<Record<string, ApplicationWithCreator[]>> {
  if (campaignIds.length === 0) return {};

  const { data } = await supabase
    .from("applications")
    .select(
      "campaign_id, id, pitch, status, created_at, creator:profiles(id, full_name, handle, bio, avatar_url)"
    )
    .in("campaign_id", campaignIds)
    .order("created_at", { ascending: true });

  const apps = (data ?? []) as unknown as (ApplicationWithCreator & {
    campaign_id: string;
  })[];

  // Hilos ya abiertos para linkear la postulación con su conversación.
  const { data: conversations } =
    apps.length > 0
      ? await supabase
          .from("conversations")
          .select("id, application_id")
          .in(
            "application_id",
            apps.map((app) => app.id)
          )
      : { data: [] };

  const conversationByApplication = new Map(
    (conversations ?? []).map((row) => [
      row.application_id ?? "",
      row.id as string,
    ])
  );

  const groups: Record<string, ApplicationWithCreator[]> = {};
  for (const app of apps) {
    app.conversation_id = conversationByApplication.get(app.id) ?? null;
    (groups[app.campaign_id] ??= []).push(app);
  }

  return groups;
}

export async function BrandDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: campaigns }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("campaigns")
      .select(
        "id, title, status, category, budget_min, budget_max, deadline, created_at"
      )
      .eq("brand_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = (campaigns ?? []) as unknown as CampaignWithApplications[];
  const byCampaign = await fetchCampaignApplications(
    supabase,
    rows.map((campaign) => campaign.id)
  );

  const collaborations = await fetchCollaborations(supabase, user.id);
  const pendingReviews = collaborations.filter(
    (collaboration) =>
      collaboration.brand_id === user.id && collaboration.pendingReview
  );
  const collaborationByApplication = new Map(
    collaborations.map((collaboration) => [
      collaboration.application_id,
      collaboration.id,
    ])
  );

  const allApplications = Object.values(byCampaign).flat();
  const pendingApplications = allApplications.filter(
    (application) => application.status === "pending"
  ).length;
  const acceptedApplications = allApplications.filter(
    (application) => application.status === "accepted"
  ).length;
  const activeCampaigns = rows.filter(
    (campaign) => campaign.status === "open"
  ).length;
  const committedBudget = rows.reduce((total, campaign) => {
    const accepted = (byCampaign[campaign.id] ?? []).filter(
      (application) => application.status === "accepted"
    ).length;
    return total + accepted * campaign.budget_min;
  }, 0);

  const brandName = profile?.full_name?.trim() || "marca";

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="relative overflow-hidden flex flex-col justify-between gap-4 rounded-2xl border border-mint/20 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-mint/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Hola, {brandName}
          </h1>
          <p className="text-sm text-taupe">
            Gestioná tus campañas, revisá propuestas y coordiná con creadores.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <ButtonLink href="/campaigns/new" variant="primary">
            + Nuevo brief
          </ButtonLink>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Campañas activas"
          icon={<VideoIcon width={20} height={20} />}
          value={activeCampaigns}
          suffix={activeCampaigns === 1 ? "abierta" : "abiertas"}
          detail={`${rows.length} en total`}
        />
        <KpiCard
          label="Postulaciones pendientes"
          icon={<UsersIcon width={20} height={20} />}
          value={pendingApplications}
          suffix="por revisar"
          detail={`${allApplications.length} recibidas`}
          highlight={pendingApplications > 0}
        />
        <KpiCard
          label="Colaboraciones"
          icon={<BadgeCheckIcon width={20} height={20} />}
          value={acceptedApplications}
          suffix="aceptadas"
          detail="Creadores confirmados"
        />
        <KpiCard
          label="Presupuesto comprometido"
          icon={<WalletIcon width={20} height={20} />}
          value={formatBudget(committedBudget)}
          detail="Pago base por creador aceptado"
        />
      </section>

      {pendingReviews.length > 0 ? (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                Entregas por revisar
              </h2>
              <span className="rounded-full bg-lime/40 px-2.5 py-0.5 text-xs font-bold text-brand">
                {pendingReviews.length}
              </span>
            </div>
            <ButtonLink href="/collaborations" variant="ghost" size="sm">
              Ver todas
            </ButtonLink>
          </div>
          <div className="grid gap-4">
            {pendingReviews.map((collaboration) => (
              <CollaborationCard
                key={collaboration.id}
                collaboration={collaboration}
                viewerId={user.id}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Mis campañas
          </h2>
          <p className="mt-1 text-sm text-taupe">
            Cada campaña con sus propuestas y accesos para editarla.
          </p>
        </div>
      </section>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone bg-white p-10 text-center">
          <p className="text-base font-semibold text-ink">
            Todavía no publicaste ninguna campaña
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-taupe">
            Creá tu primer brief con presupuesto, plazos y deliverables. En
            minutos vas a recibir propuestas de creadores listos para colaborar.
          </p>
          <div className="mt-6">
            <ButtonLink href="/campaigns/new">Crear mi primer brief</ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {rows.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              applications={byCampaign[campaign.id] ?? []}
              collaborationByApplication={collaborationByApplication}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  icon,
  value,
  suffix,
  detail,
  highlight = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  suffix?: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm ${
        highlight
          ? "border-lime/50 ring-1 ring-lime/40"
          : "border-mint/20"
      }`}
    >
      <div className="flex items-center justify-between gap-3 text-taupe">
        <span className="text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint-light/40 text-brand">
          {icon}
        </span>
      </div>

      <div className="mt-4">
        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-ink">{value}</span>
          {suffix ? (
            <span className="text-sm text-taupe">{suffix}</span>
          ) : null}
        </p>
        <p className="mt-2 text-xs text-taupe">{detail}</p>
      </div>
    </div>
  );
}

function CampaignCard({
  campaign,
  applications,
  collaborationByApplication,
}: {
  campaign: CampaignWithApplications;
  applications: ApplicationWithCreator[];
  collaborationByApplication: Map<string, string>;
}) {
  const pending = applications.filter(
    (application) => application.status === "pending"
  ).length;
  const accepted = applications.filter(
    (application) => application.status === "accepted"
  ).length;
  const resolved = applications.length - pending;
  const progress =
    applications.length > 0
      ? Math.round((resolved / applications.length) * 100)
      : 0;
  const remainingDays = campaign.deadline
    ? daysUntilDeadline(campaign.deadline)
    : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-mint/20 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-paper-deep text-brand-deep">
            <VideoIcon width={24} height={24} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-taupe">
                ID: {campaign.id.slice(0, 8)}
              </span>
            </div>

            <h3 className="mt-1 text-base font-bold text-ink sm:text-lg">
              {campaign.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-taupe">
              <span>{campaign.category}</span>
              <span className="flex items-center gap-1">
                <DollarIcon width={14} height={14} className="text-brand-deep" />
                {formatBudgetRange(campaign.budget_min, campaign.budget_max)} por
                creador
              </span>
              <span className="flex items-center gap-1">
                <UsersIcon width={14} height={14} className="text-brand-deep" />
                {accepted}/{applications.length} creadores
              </span>
              {campaign.deadline ? (
                <span
                  className={`flex items-center gap-1 ${
                    remainingDays !== null && remainingDays <= 5
                      ? "font-medium text-red-600"
                      : ""
                  }`}
                >
                  <ClockIcon width={14} height={14} />
                  {deadlineLabel(campaign.deadline)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[320px]">
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-taupe">
              <span>
                {applications.length === 0
                  ? "Sin propuestas todavía"
                  : `${resolved} de ${applications.length} respondidas`}
              </span>
              <span className="font-bold text-ink">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-mint-light/30">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="rounded-lg bg-paper-deep px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-mint-light/40"
            >
              Ver campaña
            </Link>
            <CampaignOwnerActions
              campaignId={campaign.id}
              redirectTo="/profile"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-bone/60 bg-paper/30 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            {applications.length === 1
              ? "1 propuesta"
              : `${applications.length} propuestas`}
          </span>
          {pending > 0 ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {pending} pendiente{pending === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {applications.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-taupe">
            Aún no recibiste propuestas para esta campaña.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-bone/60">
            {applications.map((application) => {
              const creator = profileOf(application.creator);
              if (!creator) return null;

              return (
                <li
                  key={application.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={creator.full_name}
                      size="sm"
                      src={creator.avatar_url}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/profile/portfolio/${creator.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-ink transition-colors hover:text-brand"
                        >
                          {creator.full_name}
                        </Link>
                        {creator.handle ? (
                          <span className="text-xs text-taupe">
                            @{creator.handle}
                          </span>
                        ) : null}
                        <Link
                          href={`/profile/portfolio/${creator.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand transition-colors hover:text-brand-deep"
                        >
                          Ver portfolio ↗
                        </Link>
                        <span className="text-xs text-taupe">
                          {formatShortDate(application.created_at)}
                        </span>
                      </div>

                      {application.pitch ? (
                        <p className="mt-1 max-w-xl text-sm leading-6 whitespace-pre-line text-taupe">
                          {application.pitch}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic leading-6 text-taupe">
                          Sin propuesta escrita
                        </p>
                      )}

                      {creator.bio ? (
                        <p className="mt-1 text-xs leading-5 text-taupe/80">
                          {creator.bio}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 self-start sm:pt-0.5">
                    <ApplicationStatusPill status={application.status} />
                    {collaborationByApplication.has(application.id) ? (
                      <Link
                        href={`/collaborations/${collaborationByApplication.get(
                          application.id
                        )}`}
                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
                      >
                        Ver colaboración →
                      </Link>
                    ) : application.conversation_id ? (
                      <Link
                        href={`/messages/${application.conversation_id}`}
                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
                      >
                        Ver conversación →
                      </Link>
                    ) : null}
                    <ApplicationActions
                      applicationId={application.id}
                      status={application.status}
                      campaignTitle={campaign.title}
                      conversationId={application.conversation_id}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
