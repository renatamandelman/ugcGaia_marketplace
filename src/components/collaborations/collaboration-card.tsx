import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatBudget } from "@/lib/format";
import {
  MAX_VERSIONS,
  collaborationStatusLabel,
  deliverableStatusLabel,
  paymentStatusLabel,
  type CollaborationListItem,
} from "@/lib/collaborations";
import { cn } from "@/components/ui/utils";
import type {
  CollaborationStatus,
  PaymentStatus,
} from "@/lib/db-types";

const statusStyles: Record<CollaborationStatus, string> = {
  brief_sent: "bg-sky-50 text-sky-700 ring-sky-600/20",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-600/20",
  submitted: "bg-violet-50 text-violet-700 ring-violet-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-paper-deep text-taupe ring-zinc-500/20",
};

const paymentStyles: Record<PaymentStatus, string> = {
  held: "bg-amber-50 text-amber-700 ring-amber-600/20",
  released: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  refunded: "bg-paper-deep text-taupe ring-zinc-500/20",
};

export function CollaborationStatusBadge({
  status,
}: {
  status: CollaborationStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        statusStyles[status]
      )}
    >
      {collaborationStatusLabel(status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        paymentStyles[status]
      )}
    >
      {paymentStatusLabel(status)}
    </span>
  );
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "Sin fecha";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export function CollaborationCard({
  collaboration,
  viewerId,
}: {
  collaboration: CollaborationListItem;
  viewerId: string;
}) {
  const isBrand = collaboration.brand_id === viewerId;
  const other = isBrand ? collaboration.creator : collaboration.brand;
  const title =
    collaboration.campaign?.title ||
    collaboration.brief_snapshot.title ||
    "Colaboración";

  return (
    <Link
      href={`/collaborations/${collaboration.id}`}
      className="block rounded-2xl border border-bone bg-white p-5 shadow-sm transition-all hover:border-brand/30 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar
            name={other?.full_name || "Gaia"}
            src={other?.avatar_url ?? null}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CollaborationStatusBadge status={collaboration.status} />
              <PaymentStatusBadge status={collaboration.payment_status} />
              {collaboration.pendingReview ? (
                <span className="rounded-full bg-lime/40 px-2.5 py-1 text-[11px] font-bold text-brand">
                  Requiere revisión
                </span>
              ) : null}
            </div>

            <h3 className="mt-1.5 truncate text-base font-semibold text-ink">
              {title}
            </h3>
            <p className="text-sm text-taupe">
              {isBrand ? "Creador" : "Marca"}:{" "}
              <span className="font-medium text-ink">
                {other?.full_name || "Usuario de Gaia"}
              </span>
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-taupe">
              <span>
                Versiones {collaboration.versionsUsed}/{MAX_VERSIONS}
              </span>
              {collaboration.latestDeliverable ? (
                <span>
                  Última:{" "}
                  {deliverableStatusLabel(
                    collaboration.latestDeliverable.status
                  )}
                </span>
              ) : (
                <span>Sin entregas todavía</span>
              )}
              {collaboration.deadline ? (
                <span>
                  Entrega hasta {formatShortDate(collaboration.deadline)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-lg font-bold text-ink">
            {formatBudget(
              isBrand ? collaboration.amount : collaboration.creator_amount
            )}
          </p>
          <p className="text-xs text-taupe">
            {isBrand ? "retenidos" : "a recibir"}
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-brand">
            Abrir colaboración →
          </span>
        </div>
      </div>
    </Link>
  );
}
