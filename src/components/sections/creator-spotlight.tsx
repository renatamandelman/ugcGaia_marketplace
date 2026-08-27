import { Section, SectionHeading } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { StarIcon, BadgeCheckIcon } from "@/components/ui/icons";
import { formatFollowers, formatBudget } from "@/lib/format";
import { creators } from "@/lib/mock-data";
import type { Creator } from "@/lib/types";

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-marfil/70 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-oro/80 hover:shadow-lg hover:shadow-oro/15">
      <div className="flex items-center gap-3">
        <Avatar name={creator.name} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold tracking-tight text-carbon">
            <span className="truncate">{creator.name}</span>
            {creator.verified && (
              <BadgeCheckIcon width={16} height={16} className="shrink-0 text-brasa" />
            )}
          </p>
          <p className="truncate text-sm text-zinc-500">
            {creator.handle} · {creator.city}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-lg bg-oro/20 px-2.5 py-1 text-xs font-semibold text-cobre">
          {formatFollowers(creator.followers)}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-600">
        {creator.bio}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {creator.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-oro/20 px-2.5 py-1 text-xs font-medium text-cobre"
          >
            {tag}
          </span>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-oro/20 pt-4">
        <div>
          <dt className="text-xs text-zinc-500">Rating</dt>
          <dd className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-carbon">
            <StarIcon width={14} height={14} className="text-oro" />
            {creator.rating.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Colaboraciones</dt>
          <dd className="mt-0.5 text-sm font-semibold text-carbon">
            {creator.completedDeals}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Tarifa / video</dt>
          <dd className="mt-0.5 text-sm font-semibold text-brasa">
            {formatBudget(creator.ratePerVideo)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function CreatorSpotlight() {
  const featured = creators.slice(0, 3);

  return (
    <Section id="creadores" className="bg-white">
      <SectionHeading
        eyebrow="Para marcas"
        title="Micro-creadores con impacto real"
        description="No hace falta un influencer de 1M. Los micro-creadores generan 60% más engagement y su audiencia confía en ellos."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <ButtonLink href="/#cta" size="lg">
          Unite como creador
        </ButtonLink>
      </div>
    </Section>
  );
}