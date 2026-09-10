import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBudgetRange, deadlineLabel } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { ApplyButton } from "@/components/apply-button";
import {
  ArrowLeftIcon,
  ClockIcon,
  DollarIcon,
  VideoIcon,
  CheckIcon,
} from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Detalle de campaña" };
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row } = await supabase
    .from("campaigns")
    .select(
      "id, title, description, category, budget_min, budget_max, deliverables, deadline, status, created_at, profiles(full_name)"
    )
    .eq("id", id)
    .single();

  if (!row) notFound();

  type BrandRelation =
  | { full_name: string | null }
  | { full_name: string | null }[]
  | null;

function brandName(relation: BrandRelation): string {
  const entry = Array.isArray(relation) ? relation[0] : relation;
  return entry?.full_name ?? "Marca";
}

const campaign = {
    ...row,
    brand: brandName(row.profiles as BrandRelation),
  };
  const closed = campaign.status !== "open";

  const deliverables: string[] = campaign.deliverables
    ? campaign.deliverables
        .split("\n")
        .map((d: string) => d.trim())
        .filter((d: string) => d !== "")
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand"
      >
        <ArrowLeftIcon width={16} height={16} />
        Volver a campañas
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Main column */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={campaign.category} />
            <StatusBadge status={campaign.status} />
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {campaign.title}
          </h1>

          <div className="mt-4 flex items-center gap-2.5">
            <Avatar name={campaign.brand} size="md" />
            <div>
              <p className="text-sm font-semibold text-ink">
                {campaign.brand}
              </p>
              <p className="text-xs text-taupe">
                Marca verificada · {campaign.category}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                El brief
              </h2>
              <p className="mt-3 text-base leading-8 text-taupe">
                {campaign.description}
              </p>
            </div>

            {deliverables.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  Entregables
                </h2>
                <ul className="mt-4 space-y-3">
                  {deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-start gap-3">
                      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-paper-deep text-taupe">
                        <CheckIcon width={12} height={12} />
                      </span>
                      <span className="text-sm leading-6 text-taupe">
                        {deliverable}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-bone bg-white p-6 shadow-sm">
            <dl className="space-y-5">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-taupe">
                  <DollarIcon width={16} height={16} />
                  Presupuesto por creador
                </dt>
                <dd className="text-xl font-semibold text-ink">
                  {formatBudgetRange(
                    campaign.budget_min,
                    campaign.budget_max
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-taupe">
                  <ClockIcon width={16} height={16} />
                  Deadline
                </dt>
                <dd className="text-sm font-medium text-ink">
                  {campaign.deadline
                    ? deadlineLabel(campaign.deadline)
                    : "Sin fecha límite"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-taupe">
                  <VideoIcon width={16} height={16} />
                  Publicada
                </dt>
                <dd className="text-sm font-medium text-ink">
                  {new Date(campaign.created_at).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-bone pt-6">
              <div className={cn(closed && "opacity-50")}>
                <ApplyButton
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  isAuthenticated={Boolean(user)}
                />
              </div>
              <p className="mt-3 text-center text-xs leading-5 text-taupe">
                {closed
                  ? "Esta campaña ya no acepta aplicaciones."
                  : "¿No tenés cuenta? Registrate como creador para aplicar."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}