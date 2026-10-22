import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import {
  MAX_VERSIONS,
  collaborationStatusLabel,
  type CollaborationListItem,
} from "@/lib/collaborations";
import { formatBudget } from "@/lib/format";
import type { CollaborationStatus } from "@/lib/db-types";

const progressByStatus: Record<CollaborationStatus, number> = {
  brief_sent: 20,
  in_progress: 45,
  submitted: 75,
  approved: 100,
  cancelled: 0,
};

const milestoneByStatus: Record<CollaborationStatus, string> = {
  brief_sent: "Brief recibido",
  in_progress: "Produciendo contenido",
  submitted: "Esperando revisión de la marca",
  approved: "Entrega aprobada",
  cancelled: "Colaboración cancelada",
};

function formatDeadline(iso: string | null): string {
  if (!iso) return "Sin fecha";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

function actionFor(collaboration: CollaborationListItem): {
  label: string;
  variant: "primary" | "secondary";
} {
  if (collaboration.status === "submitted") {
    return { label: "Ver estado", variant: "secondary" };
  }
  if (
    (collaboration.status === "brief_sent" ||
      collaboration.status === "in_progress") &&
    collaboration.versionsUsed < MAX_VERSIONS &&
    !collaboration.pendingReview
  ) {
    return { label: "Subir entrega", variant: "primary" };
  }
  return { label: "Ver colaboración", variant: "secondary" };
}

export function DeliverablesList({
  collaborations,
}: {
  collaborations: CollaborationListItem[];
}) {
  const active = collaborations.filter(
    (collaboration) =>
      collaboration.status !== "approved" &&
      collaboration.status !== "cancelled"
  );

  return (
    <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-bone/40 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Tus colaboraciones activas
          </h2>
          <p className="text-sm text-taupe">
            Briefs, entregas y estado del pago en un solo lugar
          </p>
        </div>
        <ButtonLink href="/collaborations" variant="ghost" size="sm">
          Ver todas
        </ButtonLink>
      </div>

      {active.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone bg-paper p-8 text-center">
          <p className="text-sm font-semibold text-ink">
            No tenés colaboraciones activas
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-taupe">
            Cuando una marca acepte tu postulación, el brief aparece acá.
          </p>
          <ButtonLink
            href="/campaigns"
            variant="primary"
            size="sm"
            className="mt-4"
          >
            Explorar campañas
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-4">
          {active.slice(0, 4).map((collaboration) => (
            <CollaborationRowCard
              key={collaboration.id}
              collaboration={collaboration}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CollaborationRowCard({
  collaboration,
}: {
  collaboration: CollaborationListItem;
}) {
  const action = actionFor(collaboration);
  const brand = collaboration.brand;
  const title =
    collaboration.campaign?.title ||
    collaboration.brief_snapshot.title ||
    "Colaboración";
  const progress = progressByStatus[collaboration.status];

  return (
    <div className="rounded-2xl border border-bone bg-paper p-5 transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar
            name={brand?.full_name || "Marca"}
            src={brand?.avatar_url ?? null}
            size="lg"
          />
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-mint/40 px-2.5 py-0.5 text-xs font-bold text-brand">
                {collaborationStatusLabel(collaboration.status)}
              </span>
              <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-xs font-bold text-brand">
                {collaboration.brief_snapshot.category ||
                  collaboration.campaign?.category ||
                  "UGC"}
              </span>
            </div>
            <h3 className="truncate text-lg font-bold text-ink">{title}</h3>
            <p className="text-sm text-taupe">
              {brand?.full_name || "Marca de Gaia"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-taupe">
              <span className="font-semibold text-brand">
                {formatBudget(collaboration.creator_amount)} a recibir
              </span>
              <span>
                Entrega hasta {formatDeadline(collaboration.deadline)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <ButtonLink
            href={`/collaborations/${collaboration.id}`}
            variant={action.variant}
            size="sm"
          >
            {action.label}
          </ButtonLink>
          <span className="text-xs text-taupe/80">
            {collaboration.versionsUsed}/{MAX_VERSIONS} versiones
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-bone/40 pt-3">
        <div className="flex items-center justify-between text-xs text-taupe">
          <span>{milestoneByStatus[collaboration.status]}</span>
          <span className="font-bold text-ink">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
