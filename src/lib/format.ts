/* Presentation helpers for typed mock data — nothing smart, just readable */

export function formatBudget(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function daysUntilDeadline(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(isoDate);
  deadline.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(isoDate: string): string {
  const days = daysUntilDeadline(isoDate);
  if (days < 0) return "Aplicaciones cerradas";
  if (days === 0) return "Cierra hoy";
  if (days === 1) return "Cierra mañana";
  return `Cierra en ${days} días`;
}

export function statusLabel(
  status: "active" | "closing" | "filled"
): string {
  switch (status) {
    case "active":
      return "Recibiendo propuestas";
    case "closing":
      return "Cerrando pronto";
    case "filled":
      return "Campaña llena";
  }
}