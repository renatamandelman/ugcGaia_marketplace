import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { campaigns } from "@/lib/mock-data";
import { deadlineLabel, formatBudget } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { ApplyButton } from "@/components/apply-button";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  DollarIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ id: campaign.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/campaigns/[id]">): Promise<Metadata> {
  const { id } = await params;
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) return { title: "Campaña no encontrada" };
  return {
    title: campaign.title,
    description: campaign.brief,
  };
}

export default async function CampaignDetailPage({
  params,
}: PageProps<"/campaigns/[id]">) {
  const { id } = await params;
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) notFound();

  const closed = campaign.status === "filled";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-cobre transition-colors hover:text-brasa"
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
              <p className="text-sm font-semibold text-carbon">
                {campaign.brand}
              </p>
              <p className="text-xs text-zinc-500">
                Marca verificada · {campaign.category}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-carbon">
                El brief
              </h2>
              <p className="mt-3 text-base leading-8 text-zinc-600">
                {campaign.brief}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-carbon">
                Qué pedimos
              </h2>
              <ul className="mt-4 space-y-3">
                {campaign.requirements.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-3">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-oro/20 text-cobre">
                      <CheckIcon width={12} height={12} />
                    </span>
                    <span className="text-sm leading-6 text-zinc-700">
                      {requirement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-carbon">
                Entregables
              </h2>
              <ul className="mt-4 space-y-3">
                {campaign.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex items-start gap-3">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                      <CheckIcon width={12} height={12} />
                    </span>
                    <span className="text-sm leading-6 text-zinc-700">
                      {deliverable}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <dl className="space-y-5">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <DollarIcon width={16} height={16} />
                  Presupuesto por creador
                </dt>
                <dd className="text-xl font-semibold text-carbon">
                  {formatBudget(campaign.budget)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <ClockIcon width={16} height={16} />
                  Deadline
                </dt>
                <dd className="text-sm font-medium text-carbon">
                  {deadlineLabel(campaign.deadline)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <UsersIcon width={16} height={16} />
                  Vacantes
                </dt>
                <dd className="text-sm font-medium text-carbon">
                  {campaign.slots} creador{campaign.slots > 1 ? "es" : ""}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-zinc-500">
                  <VideoIcon width={16} height={16} />
                  Aplicaciones
                </dt>
                <dd className="text-sm font-medium text-carbon">
                  {campaign.applications}
                </dd>
              </div>
            </dl>

            <div
              className={cn(
                "mt-6 border-t border-zinc-100 pt-6",
                closed && "opacity-50"
              )}
            >
              <ApplyButton campaignTitle={campaign.title} />
              <p className="mt-3 text-center text-xs leading-5 text-zinc-400">
                Demo del MVP: la propuesta no se persiste todavía.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}