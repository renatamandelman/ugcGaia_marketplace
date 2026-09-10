import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { ApplicationActions } from "./application-actions";
import { formatBudgetRange } from "@/lib/format";
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

function formatDeadline(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

function ApplicationStatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${applicationStatusStyles[status]}`}
    >
      {applicationStatusLabel(status)}
    </span>
  );
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

  const groups: Record<string, ApplicationWithCreator[]> = {};
  for (const raw of data ?? []) {
    const app = raw as unknown as ApplicationWithCreator & {
      campaign_id: string;
    };
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

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, title, status, category, budget_min, budget_max, deadline, created_at"
    )
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (campaigns ?? []) as unknown as CampaignWithApplications[];
  const byCampaign = await fetchCampaignApplications(
    supabase,
    rows.map((c) => c.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Mis campañas
          </h2>
          <p className="mt-1 text-sm text-taupe">
            Evaluá las propuestas y elegí a tus creadores.
          </p>
        </div>
        <ButtonLink href="/campaigns/new">+ Publicar brief</ButtonLink>
      </div>

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
        <div className="grid gap-6">
          {rows.map((campaign) => {
            const applications = byCampaign[campaign.id] ?? [];
            return (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                applications={applications}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  applications,
}: {
  campaign: CampaignWithApplications;
  applications: ApplicationWithCreator[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-bone bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-bone/60 bg-paper/50 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink">
              {campaign.title}
            </h3>
            <StatusBadge status={campaign.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-taupe">
            <span>{campaign.category}</span>
            <span aria-hidden>·</span>
            <span>Pago por creador: {formatBudgetRange(campaign.budget_min, campaign.budget_max)}</span>
            {campaign.deadline ? (
              <>
                <span aria-hidden>·</span>
                <span>Postulaciones hasta el {formatDeadline(campaign.deadline)}</span>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            {applications.length === 1
              ? "1 propuesta"
              : `${applications.length} propuestas`}
          </span>
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
                    <Avatar name={creator.full_name} size="sm" src={creator.avatar_url} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`/profile/portfolio/${creator.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-ink transition-colors hover:text-brand"
                        >
                          {creator.full_name}
                        </a>
                        {creator.handle ? (
                          <span className="text-xs text-taupe">
                            @{creator.handle}
                          </span>
                        ) : null}
                        <a
                          href={`/profile/portfolio/${creator.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand transition-colors hover:text-brand-deep"
                        >
                          Ver portfolio ↗
                        </a>
                        <span className="text-xs text-taupe">
                          {new Date(application.created_at).toLocaleDateString(
                            "es-AR",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      </div>
                      {application.pitch ? (
                        <p className="mt-1 max-w-xl whitespace-pre-line text-sm leading-6 text-taupe">
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
                    <ApplicationActions
                      applicationId={application.id}
                      status={application.status}
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