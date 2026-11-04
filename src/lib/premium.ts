export const PREMIUM_MONTHLY_USD = 19;

export const PREMIUM_BENEFITS = [
  "Badge Premium en tu perfil y en tus campañas",
  "Tus campañas aparecen primero en el feed",
  "Prioridad en el explorador de creadores",
  "Soporte prioritario por mensaje directo",
] as const;

type PremiumInput = {
  plan?: string | null;
  premium_until?: string | null;
} | null;

/** true si la cuenta tiene plan premium vigente. */
export function isPremium(profile: PremiumInput): boolean {
  if (!profile || profile.plan !== "premium") return false;
  if (!profile.premium_until) return true;
  return new Date(profile.premium_until).getTime() > Date.now();
}
