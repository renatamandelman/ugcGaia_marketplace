import { cn } from "./utils";

export type BadgeStatus = "open" | "filled" | "closed";

export function campaignStatusLabel(status: BadgeStatus): string {
  switch (status) {
    case "open":
      return "Abierta";
    case "filled":
      return "Completa";
    case "closed":
      return "Cerrada";
  }
}

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const styles: Record<BadgeStatus, string> = {
    open: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    filled: "bg-paper-deep text-taupe ring-zinc-500/20",
    closed: "bg-red-50 text-red-700 ring-red-600/20",
  };
  const dot: Record<BadgeStatus, string> = {
    open: "bg-emerald-500",
    filled: "bg-zinc-400",
    closed: "bg-red-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[status])} />
      {campaignStatusLabel(status)}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-taupe shadow-sm backdrop-blur">
      {category}
    </span>
  );
}