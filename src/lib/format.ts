/* Presentation helpers de montos y fechas */

export function formatBudget(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Monto con centavos (recargas, movimientos de wallet). */
export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBudgetRange(min: number, max: number | null): string {
  const budget = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);

  if (max && max > min) return `${budget(min)}–${budget(max)}`;
  return budget(min);
}

export function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function daysUntilDeadline(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // "YYYY-MM-DD" → fecha local (new Date() lo tomaría como UTC y restaría un día)
  const ymd = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const deadline = ymd
    ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    : new Date(isoDate);
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
/**
 * Deadline en formato DD/MM/AA. Se parsea el string a mano (no con `new Date`)
 * porque las columnas `date` llegan como "YYYY-MM-DD" y JS las interpreta en
 * UTC: en Argentina eso mostraría el día anterior.
 */
export function formatDeadlineDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year.slice(2)}`;
}

/** Convierte "DD/MM/AA" (o DD/MM/AAAA) a "YYYY-MM-DD". Devuelve null si la fecha no es válida. */
export function parseDeadlineInput(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
