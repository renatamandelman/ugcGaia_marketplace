import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { CreatorCard } from "@/components/creator-card";
import { SearchIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/server";
import {
  creatorsHref,
  mapProfileToCreator,
  parseTagsParam,
  sanitizeSearchTerm,
  toggleTagInList,
} from "@/lib/creators";

export const metadata: Metadata = {
  title: "Explorar creadores",
  description:
    "Descubrí creadores UGC de GaiaUGC: filtrá por tags para encontrar el perfil ideal para tu marca.",
};

const PROFILE_COLUMNS =
  "id, full_name, bio, location, avatar_url, banner_url, tags, tiktok_url, instagram_url, youtube_url";

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q : "";
  const q = sanitizeSearchTerm(rawQ);
  const selectedTags = parseTagsParam(
    typeof params.tags === "string" ? params.tags : ""
  );

  const supabase = await createClient();

  // Nube de tags: todos los tags de creadores (siempre visible, aunque el
  // filtro activo reduzca los resultados)
  const { data: tagRows } = await supabase
    .from("profiles")
    .select("tags")
    .eq("role", "creator");
  const allTags = [
    ...new Set((tagRows ?? []).flatMap((r) => r.tags ?? [])),
  ].sort((a, b) => a.localeCompare(b));

  // Filtros server-side: el índice GIN de profiles.tags hace el trabajo pesado
  let query = supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("role", "creator")
    .order("created_at", { ascending: false });

  // @> containment = TODOS los tags seleccionados (AND), usa profiles_tags_gin_idx
  if (selectedTags.length > 0) query = query.contains("tags", selectedTags);
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,bio.ilike.%${q}%,location.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const creators = (data ?? []).map((row) => mapProfileToCreator(row));

  const hasFilters = q !== "" || selectedTags.length > 0;
  const clearHref = creatorsHref({});

  return (
    <Section>
      <SectionHeading
        title="Explorar creadores"
        description="Buscá por nombre o bio, filtrá por tags, y encontrá al creador ideal para tu marca."
      />

      {/* Buscador por texto — GET server-side */}
      <form
        action="/creators"
        method="get"
        className="relative mx-auto w-full max-w-xl"
      >
        {selectedTags.length > 0 ? (
          <input type="hidden" name="tags" value={selectedTags.join(",")} />
        ) : null}
        <SearchIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-taupe"
        />
        <input
          type="search"
          name="q"
          defaultValue={rawQ}
          placeholder="Buscar por nombre, bio o ubicación…"
          className="w-full rounded-full border border-bone bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder-taupe outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </form>

      {/* Filtro por tags — chips toggleables */}
      {allTags.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={creatorsHref({
                q: rawQ || undefined,
                tags: toggleTagInList(selectedTags, tag),
              })}
              className={
                selectedTags.includes(tag)
                  ? "rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white transition-colors"
                  : "rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
              }
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-taupe">
        {creators.length}{" "}
        {creators.length === 1 ? "creador" : "creadores"}
        {selectedTags.length > 1
          ? ` con ${selectedTags.length} tags en común`
          : ""}
      </p>

      {creators.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-bone bg-white/60 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            No encontramos creadores que coincidan con tu búsqueda.
          </p>
          <Link
            href={clearHref}
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Limpiar filtros
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}

      {hasFilters && creators.length > 0 ? (
        <div className="mt-6 text-center">
          <Link
            href={clearHref}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Limpiar filtros
          </Link>
        </div>
      ) : null}
    </Section>
  );
}