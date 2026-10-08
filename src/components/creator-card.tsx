import Link from "next/link";
import type { CreatorCardItem } from "@/lib/creators";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowRightIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/ui/icons";

interface CreatorCardProps {
  creator: CreatorCardItem;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const socials = [
    { href: creator.tiktok_url, Icon: TikTokIcon, label: "TikTok" },
    { href: creator.instagram_url, Icon: InstagramIcon, label: "Instagram" },
    { href: creator.youtube_url, Icon: YouTubeIcon, label: "YouTube" },
  ].filter((s): s is { href: string; Icon: typeof TikTokIcon; label: string } =>
    Boolean(s.href)
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-bone/70 bg-white transition-all hover:-translate-y-0.5 hover:border-brand/80 hover:shadow-lg hover:shadow-brand/15">
      {/* Header: banner o gradiente + avatar */}
      <div className="relative h-24 bg-gradient-to-br from-brand/20 via-brand/10 to-clay/10">
        {creator.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.banner_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute -bottom-6 left-4 rounded-full ring-4 ring-white">
          <Avatar
            name={creator.full_name}
            size="lg"
            src={creator.avatar_url}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 pt-9">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight text-ink">
            {creator.full_name}
          </h3>
          {creator.location ? (
            <span className="mt-0.5 shrink-0 text-xs text-taupe">
              {creator.location}
            </span>
          ) : null}
        </div>

        {creator.bio ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-taupe">
            {creator.bio}
          </p>
        ) : null}

        {creator.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {creator.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: link al portfolio + redes */}
        <div className="mt-auto flex items-center justify-between border-t border-brand/20 pt-4">
          <Link
            href={`/profile/portfolio/${creator.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            Ver portfolio
            <ArrowRightIcon width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          {socials.length > 0 && (
            <div className="flex items-center gap-2.5 text-taupe">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${creator.full_name} en ${label}`}
                  className="transition-colors hover:text-ink"
                >
                  <Icon width={16} height={16} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
