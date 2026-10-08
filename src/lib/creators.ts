import type { Profile } from "@/lib/db-types";

/** View model para las cards del explorador de creadores. */
export interface CreatorCardItem {
  id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  tags: string[];
  tiktok_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

export function mapProfileToCreator(
  row: Pick<
    Profile,
    | "id"
    | "full_name"
    | "bio"
    | "location"
    | "avatar_url"
    | "banner_url"
    | "tags"
    | "tiktok_url"
    | "instagram_url"
    | "youtube_url"
  >
): CreatorCardItem {
  return {
    id: row.id,
    full_name: row.full_name,
    bio: row.bio ?? null,
    location: row.location ?? null,
    avatar_url: row.avatar_url ?? null,
    banner_url: row.banner_url ?? null,
    tags: row.tags ?? [],
    tiktok_url: row.tiktok_url ?? null,
    instagram_url: row.instagram_url ?? null,
    youtube_url: row.youtube_url ?? null,
  };
}

export interface CreatorsFilters {
  q?: string;
  tags?: string[];
}

/**
 * Sanitiza el término de búsqueda para que no rompa el `.or()` de PostgREST:
 * las comas y paréntesis delimitan la sintaxis OR del query string.
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw.replace(/[,'`()"]/g, "").trim().slice(0, 80);
}

/** Normaliza el param tags de la URL: lowercase, trim, dedupe, sin vacíos. */
export function parseTagsParam(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, 8);
}

/** Construye /creators?... preservando los filtros activos (para links de tags/nichos). */
export function creatorsHref({ q, tags = [] }: CreatorsFilters): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tags.length > 0) params.set("tags", tags.join(","));
  const qs = params.toString();
  return qs ? `/creators?${qs}` : "/creators";
}

/** Alterna un tag en la lista de seleccionados (para los chips toggleables). */
export function toggleTagInList(tags: string[], tag: string): string[] {
  return tags.includes(tag)
    ? tags.filter((t) => t !== tag)
    : [...tags, tag];
}
