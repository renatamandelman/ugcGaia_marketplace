/**
 * Matchmaking por traslape de tags.
 *
 * El % de match responde: "¿cuánto de lo que esta campaña pide cubre este creador?"
 * Se divide por la cantidad de tags de la CAMPAÑA (la demanda), no por los del
 * creador — una campaña que pide 2 tags y cubre ambos es 100%; una que pide 5
 * y cubre 3 es 60%.
 */
export function computeMatchPercent(
  creatorTags: string[],
  campaignTags: string[]
): number {
  if (creatorTags.length === 0 || campaignTags.length === 0) return 0;
  const creatorSet = new Set(creatorTags);
  const matched = campaignTags.filter((tag) => creatorSet.has(tag)).length;
  return Math.round((matched / campaignTags.length) * 100);
}

/** Tags en común entre creador y campaña (para mostrar "3 tags en común"). */
export function sharedTags(
  creatorTags: string[],
  campaignTags: string[]
): string[] {
  const creatorSet = new Set(creatorTags);
  return campaignTags.filter((tag) => creatorSet.has(tag));
}
