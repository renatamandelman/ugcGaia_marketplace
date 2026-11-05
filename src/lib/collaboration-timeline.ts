import { formatBudget } from "@/lib/format";
import type { CollaborationListItem } from "@/lib/collaborations";

export type TimelineStepState = "done" | "current" | "pending";

export interface TimelineStep {
  title: string;
  description?: string;
  /** ISO timestamp, when the database actually has one. Never invented. */
  date?: string | null;
  state: TimelineStepState;
  actor?: string;
  feedback?: string;
}

/**
 * Derives the collaboration timeline from rows that already exist
 * (`collaborations` + `deliverables`). No new table, no fake dates:
 * every step's date comes from a real timestamp column, and steps
 * with no recorded timestamp render without one.
 *
 * Data availability:
 * - accepted / payment held  → collaborations.created_at
 * - each submitted version   → deliverables.submitted_at
 * - approval / changes       → deliverables.reviewed_at
 * - payment released         → same reviewed_at (approval and the
 *                             wallet credit happen in one transaction)
 * - in_progress              → no timestamp column → no date shown
 */
export function buildCollaborationTimeline(
  collaboration: CollaborationListItem
): TimelineStep[] {
  const versions = [...collaboration.deliverables].sort(
    (a, b) => a.version - b.version
  );
  const brandName = collaboration.brand?.full_name ?? undefined;
  const creatorName = collaboration.creator?.full_name ?? undefined;
  const steps: TimelineStep[] = [];

  steps.push({
    title: "Postulación aceptada",
    description: "La marca aprobó el perfil y aceptó la propuesta.",
    date: collaboration.created_at,
    state: "done",
    actor: brandName,
  });

  steps.push({
    title: "Pago retenido en custodia",
    description: `${formatBudget(collaboration.amount)} bloqueados hasta la aprobación.`,
    date: collaboration.created_at,
    state: "done",
    actor: brandName,
  });

  if (collaboration.status === "cancelled") {
    steps.push({
      title: "Colaboración cancelada",
      description: "La marca canceló la colaboración.",
      date: collaboration.updated_at,
      state: "done",
      actor: brandName,
    });
    if (collaboration.payment_status === "refunded") {
      steps.push({
        title: "Pago devuelto a la marca",
        description: "El monto retenido volvió a la wallet de la marca.",
        date: collaboration.updated_at,
        state: "done",
      });
    }
    return steps;
  }

  if (versions.length === 0) {
    steps.push({
      title: "Realizando el video",
      description: "El creador está produciendo el entregable.",
      state: "current",
      actor: creatorName,
    });
    pushPendingTail(steps, false);
    return steps;
  }

  steps.push({
    title: "Realizando el video",
    description: "El creador está produciendo el entregable.",
    state: "done",
    actor: creatorName,
  });

  let reviewPending = false;

  versions.forEach((deliverable, index) => {
    const isLatest = index === versions.length - 1;

    steps.push({
      title: `Entrega v${deliverable.version} enviada`,
      date: deliverable.submitted_at,
      state: "done",
      actor: creatorName,
    });

    if (deliverable.status === "approved") {
      steps.push({
        title: `v${deliverable.version} aprobada`,
        date: deliverable.reviewed_at,
        state: "done",
        actor: brandName,
      });
    } else if (deliverable.status === "changes_requested") {
      steps.push({
        title: `Cambios pedidos en v${deliverable.version}`,
        date: deliverable.reviewed_at,
        state: "done",
        actor: brandName,
        feedback: deliverable.feedback ?? undefined,
      });
      if (isLatest && collaboration.status === "in_progress") {
        steps.push({
          title: "Realizando el video",
          description: "Nueva versión en producción.",
          state: "current",
          actor: creatorName,
        });
      }
    } else {
      reviewPending = true;
      steps.push({
        title: `En revisión (v${deliverable.version})`,
        description: "Esperando respuesta de la marca.",
        date: deliverable.submitted_at,
        state: "current",
        actor: brandName,
      });
    }
  });

  if (collaboration.status === "approved") {
    const approvedDate =
      [...versions]
        .reverse()
        .find((deliverable) => deliverable.status === "approved")
        ?.reviewed_at ??
      collaboration.updated_at;

    steps.push({
      title: "Colaboración aprobada",
      date: approvedDate,
      state: "done",
      actor: brandName,
    });
    steps.push({
      title: "Pago liberado",
      description: `${formatBudget(collaboration.creator_amount)} al creador. La aprobación y la liberación se ejecutan juntas.`,
      date: approvedDate,
      state:
        collaboration.payment_status === "released" ? "done" : "current",
    });
    return steps;
  }

  pushPendingTail(steps, reviewPending);
  return steps;
}

/** Future milestones shown as pending when nothing has happened yet. */
function pushPendingTail(steps: TimelineStep[], reviewPending: boolean) {
  if (!reviewPending) {
    steps.push({
      title: "En revisión",
      description: "A la espera de la próxima entrega del creador.",
      state: "pending",
      date: null,
    });
  }
  steps.push({
    title: "Colaboración aprobada",
    state: "pending",
    date: null,
  });
  steps.push({
    title: "Pago liberado",
    state: "pending",
    date: null,
  });
}
