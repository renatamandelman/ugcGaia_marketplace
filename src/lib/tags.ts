/**
 * Parsea el valor crudo del form a un array de tags, replicando la
 * normalización del trigger SQL (`supabase/tags.sql`): minúscula, sin
 * espacios alrededor, sin duplicados y sin vacíos.
 */
export function parseTags(raw: FormDataEntryValue | null, max = 8): string[] {
  if (raw === null) return [];
  return [
    ...new Set(
      String(raw)
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, max);
}

/** Versión tipada para arrays (ej: desde un componente client con estado local). */
export function normalizeTagsArray(raw: string[]): string[] {
  return [...new Set(raw.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}