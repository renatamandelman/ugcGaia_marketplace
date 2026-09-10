import { createClient } from "@/lib/supabase/server";

interface CampaignRef {
  id?: string | null;
  title?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  brand?:
    | { full_name: string | null }
    | { full_name: string | null }[]
    | null;
}

interface ApplicationRow {
  id: string;
  status: string;
  created_at: string;
  pitch?: string | null;
  campaign?: CampaignRef | CampaignRef[] | null;
}

function campaignOf(ref: CampaignRef | CampaignRef[] | null): CampaignRef | null {
  if (Array.isArray(ref)) return ref[0] ?? null;
  return ref ?? null;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(min?: number | null, max?: number | null): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `Desde ${fmt(min)}`;
  return "Presupuesto a confirmar";
}

export async function MyApplications() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("applications")
    .select(
      "id, pitch, status, created_at, campaign:campaigns!inner(id, title, budget_min, budget_max, brand:profiles(full_name))"
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as ApplicationRow[];

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-bone bg-white p-6 sm:p-8">
        <h2 className="text-base font-semibold text-ink">Mis postulaciones</h2>
        <p className="mt-3 text-sm leading-6 text-taupe">
          Todavía no te postulaste a ninguna campaña. Explorá el feed y aplicá
          a las que matcheen con tu estilo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-bone bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Mis postulaciones</h2>
          <p className="mt-0.5 text-sm text-taupe">
            {applications.length} campaña{applications.length !== 1 ? "s" : ""} a las que aplicaste
          </p>
        </div>
        <a
          href="/campaigns"
          className="text-sm font-semibold text-brand hover:text-brand-deep"
        >
          Explorar más →
        </a>
      </div>
      <ul className="mt-4 divide-y divide-bone/60">
        {applications.map((app) => {
          const campaign = campaignOf(app.campaign ?? null);
          const brand = campaign?.brand;
          const brandName = (Array.isArray(brand) ? brand[0] : brand)?.full_name;
          return (
            <li key={app.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={`/campaigns/${campaign?.id ?? ""}`}
                    className="text-sm font-semibold text-ink transition-colors hover:text-brand"
                  >
                    {campaign?.title ?? "Campaña"}
                  </a>
                  <p className="mt-0.5 text-xs text-taupe">
                    {brandName ?? ""}
                    {campaign?.budget_min !== undefined ? (
                      <span className="mx-1 text-bone">•</span>
                    ) : null}
                    {campaign?.budget_min !== undefined
                      ? formatBudget(campaign?.budget_min, campaign?.budget_max)
                      : null}
                  </p>
                  <p className="mt-1 text-[11px] text-taupe/80">
                    Aplicaste el {formatDate(app.created_at)}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gold/20 text-[#8a6d2f]",
    accepted: "bg-brand/10 text-brand",
    rejected: "bg-red-500/10 text-red-600",
  };
  const labels: Record<string, string> = {
    pending: "Pendiente",
    accepted: "Aceptada",
    rejected: "Rechazada",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
  );
}