import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { SparklesIcon } from "@/components/ui/icons";
import { formatBudgetRange } from "@/lib/format";

export interface RecommendedBrief {
  id: string;
  brandName: string | null;
  category: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number | null;
  matchPercent: number;
  sharedTags: string[];
}

interface RecommendedBriefsProps {
  briefs: RecommendedBrief[];
  creatorTags: string[];
  niche: string | null;
}

export function RecommendedBriefs({
  briefs,
  creatorTags,
  niche,
}: RecommendedBriefsProps) {
  const subtitle =
    creatorTags.length > 0
      ? `Basado en tus tags: ${creatorTags.map((t) => `#${t}`).join(" ")}`
      : niche
        ? `Basado en tu nicho ${niche} — agregá tags para afinar`
        : "Cargá tus tags para recibir recomendaciones";

  return (
    <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 border-b border-bone/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SparklesIcon width={18} height={18} className="text-brand" />
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Briefs Recomendados
            </h2>
          </div>
          <p className="mt-0.5 text-sm text-taupe">{subtitle}</p>
        </div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
        >
          Explorar todos
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {briefs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone bg-paper py-10 text-center">
          {creatorTags.length === 0 ? (
            <>
              <p className="text-sm font-medium text-ink">
                Todavía no tenés tags en tu perfil.
              </p>
              <Link
                href="/profile/settings"
                className="mt-2 inline-block text-sm font-bold text-brand hover:underline"
              >
                Cargar mis tags →
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-ink">
                Ninguna campaña activa matchea tus tags todavía.
              </p>
              <Link
                href="/campaigns"
                className="mt-2 inline-block text-sm font-bold text-brand hover:underline"
              >
                Explorar todas las campañas →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {briefs.map((brief) => (
            <BriefCard key={brief.id} brief={brief} />
          ))}
        </div>
      )}
    </section>
  );
}

function BriefCard({ brief }: { brief: RecommendedBrief }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-bone bg-paper p-5 transition-all hover:border-brand/40 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-lime/60 px-2.5 py-0.5 text-xs font-bold text-brand">
            {brief.category}
          </span>
          <span className="text-lg font-bold text-ink">
            {formatBudgetRange(brief.budgetMin, brief.budgetMax)}
          </span>
        </div>
        <div className="mb-2 text-xs text-taupe">
          <span className="font-bold text-ink">{brief.brandName ?? "Marca"}</span>
        </div>
        <h3 className="mb-2 text-sm font-bold text-ink">{brief.title}</h3>
        <p className="line-clamp-2 text-sm text-taupe">{brief.description}</p>
        {brief.sharedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {brief.sharedTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-bone/40 pt-3">
        <span className="flex items-center gap-1 text-xs font-bold text-brand">
          <svg
            width={10}
            height={10}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {brief.matchPercent}% Match
        </span>
        <ButtonLink
          href={`/campaigns/${brief.id}`}
          variant="primary"
          size="sm"
          className="text-xs"
        >
          Ver brief
        </ButtonLink>
      </div>
    </div>
  );
}
