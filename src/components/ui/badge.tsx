import { cn } from "./utils";
import type { CampaignStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles: Record<CampaignStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    closing: "bg-amber-50 text-amber-700 ring-amber-600/20",
    filled: "bg-paper-deep text-taupe ring-zinc-500/20",
  };
  const dot: Record<CampaignStatus, string> = {
    active: "bg-emerald-500",
    closing: "bg-amber-500",
    filled: "bg-zinc-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[status])} />
      {statusLabel(status)}
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