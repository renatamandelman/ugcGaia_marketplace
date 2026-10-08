import Link from "next/link";
import type { CampaignFeedItem } from "@/lib/campaigns";
import { formatBudgetRange } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";

const categoryGradients: Record<string, string> = {
  Beauty: "from-rose-200 via-orange-100 to-amber-100",
  Skincare: "from-emerald-200 via-teal-100 to-lime-100",
  Fashion: "from-violet-200 via-fuchsia-100 to-rose-100",
  Food: "from-amber-200 via-orange-100 to-lime-100",
  Fitness: "from-emerald-200 via-teal-100 to-lime-100",
  Tech: "from-sky-200 via-cyan-100 to-slate-100",
  Lifestyle: "from-zinc-200 via-zinc-100 to-zinc-50",
  Travel: "from-sky-200 via-indigo-100 to-violet-100",
  Home: "from-orange-200 via-amber-100 to-yellow-50",
  Otro: "from-zinc-200 via-zinc-100 to-zinc-50",
};

function gradientFor(category: string): string {
  return (
    categoryGradients[category] ?? "from-zinc-200 via-zinc-100 to-zinc-50"
  );
}

interface CampaignCardProps {
  campaign: CampaignFeedItem;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-bone/70 bg-white transition-all hover:-translate-y-0.5 hover:border-brand/80 hover:shadow-lg hover:shadow-brand/15"
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
          {campaign.brand?.charAt(0) ?? "G"}
        </span>

        <div className="absolute inset-x-4 bottom-3.5 flex items-center gap-2.5">
          <Avatar name={campaign.brand ?? "Marca"} size="sm" />
          <span className="text-sm font-semibold text-ink drop-shadow-sm">
            {campaign.brand ?? "Marca"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-tight text-ink">
          {campaign.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-taupe">
          {campaign.description}
        </p>

        {campaign.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {campaign.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-brand/20 pt-4">
          <div>
            <dt className="text-xs text-taupe">Presupuesto</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {formatBudgetRange(campaign.budget_min, campaign.budget_max)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-taupe">
              <ClockIcon width={12} height={12} /> Deadline
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-ink">
              {campaign.deadline
                ? new Date(campaign.deadline).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                  })
                : "Sin fecha"}
            </dd>
          </div>
        </dl>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors group-hover:text-brand">
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