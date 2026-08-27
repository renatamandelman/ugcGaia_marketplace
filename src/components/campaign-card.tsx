import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { deadlineLabel, formatBudget } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { ArrowRightIcon, UsersIcon, ClockIcon } from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";

const categoryGradients: Record<string, string> = {
  Belleza: "from-rose-200 via-orange-100 to-amber-100",
  Gastronomía: "from-amber-200 via-orange-100 to-lime-100",
  Moda: "from-violet-200 via-fuchsia-100 to-rose-100",
  Tecnología: "from-sky-200 via-cyan-100 to-slate-100",
  Fitness: "from-emerald-200 via-teal-100 to-lime-100",
};

function gradientFor(category: string): string {
  return categoryGradients[category] ?? "from-zinc-200 via-zinc-100 to-zinc-50";
}

interface CampaignCardProps {
  campaign: Campaign;
  priority?: boolean;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-marfil/70 bg-white transition-all hover:-translate-y-0.5 hover:border-oro/80 hover:shadow-lg hover:shadow-oro/15"
    >
      {/* Visual header */}
      <div
        className={cn(
          "relative h-32 bg-gradient-to-br p-4",
          gradientFor(campaign.category)
        )}
      >
        <div className="flex items-start justify-between">
          <CategoryBadge category={campaign.category} />
          <StatusBadge status={campaign.status} />
        </div>

        <span
          className="pointer-events-none absolute -bottom-7 -right-2 select-none text-[7rem] font-bold leading-none text-white/50"
          aria-hidden
        >
          {campaign.brand.charAt(0)}
        </span>

        <div className="absolute inset-x-4 bottom-3.5 flex items-center gap-2.5">
          <Avatar name={campaign.brand} size="sm" />
          <span className="text-sm font-semibold text-zinc-900 drop-shadow-sm">
            {campaign.brand}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-tight text-carbon">
          {campaign.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
          {campaign.brief}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-oro/20 pt-4">
          <div>
            <dt className="text-xs text-zinc-500">Presupuesto</dt>
            <dd className="mt-0.5 text-sm font-semibold text-carbon">
              {formatBudget(campaign.budget)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-zinc-500">
              <UsersIcon width={12} height={12} /> Aplicaciones
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-carbon">
              {campaign.applications}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-zinc-500">
              <ClockIcon width={12} height={12} /> Deadline
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-carbon">
              {deadlineLabel(campaign.deadline)}
            </dd>
          </div>
        </dl>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-cobre transition-colors group-hover:text-brasa">
          Ver brief
          <ArrowRightIcon
            width={16}
            height={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}