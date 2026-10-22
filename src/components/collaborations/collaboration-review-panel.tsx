"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelCollaboration,
  reviewDeliverable,
} from "@/app/collaborations/actions";

interface CollaborationReviewPanelProps {
  collaborationId: string;
  deliverableId: string;
  isFinalVersion: boolean;
}

type Mode = "idle" | "changes" | "cancel";

export function CollaborationReviewPanel({
  collaborationId,
  deliverableId,
  isFinalVersion,
}: CollaborationReviewPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [feedback, setFeedback] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [sending, setSending] = useState<"approve" | "changes" | "cancel" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function approve() {
    if (
      !window.confirm(
        "¿Aprobar esta entrega? Se libera el pago al creador y no se puede deshacer."
      )
    ) {
      return;
    }

    setSending("approve");
    setError(null);
    const result = await reviewDeliverable(
      collaborationId,
      deliverableId,
      "approved",
      "Entrega aprobada."
    );
    setSending(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.success ?? "Entrega aprobada.");
    router.refresh();
  }

  async function requestChanges() {
    if (!feedback.trim()) {
      setError("Contale al creador qué tiene que cambiar.");
      return;
    }

    setSending("changes");
    setError(null);
    const result = await reviewDeliverable(
      collaborationId,
      deliverableId,
      "changes_requested",
      feedback.trim()
    );
    setSending(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.success ?? "Cambios pedidos.");
    setFeedback("");
    setMode("idle");
    router.refresh();
  }

  async function cancel() {
    if (
      !window.confirm(
        "¿Cancelar la colaboración? Se devuelve el pago retenido a tu wallet."
      )
    ) {
      return;
    }

    setSending("cancel");
    setError(null);
    const result = await cancelCollaboration(
      collaborationId,
      cancelReason.trim() || "Cancelada por la marca."
    );
    setSending(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.success ?? "Colaboración cancelada.");
    router.refresh();
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium text-emerald-700">
        {success}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
      <h3 className="text-base font-semibold text-ink">
        Revisar esta entrega
      </h3>
      <p className="mt-1 text-sm text-taupe">
        {isFinalVersion
          ? "Es la última versión disponible. Podés aprobarla o cancelar la colaboración."
          : "Si pedís cambios, el creador puede subir una nueva versión."}
      </p>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {mode === "changes" ? (
        <div className="mt-4">
          <label
            htmlFor="feedback"
            className="text-sm font-semibold text-ink"
          >
            ¿Qué tiene que cambiar?
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={4}
            placeholder="Ej: cambiá el hook de los primeros 3 segundos y mostrá el producto más cerca."
            className="mt-1.5 w-full resize-y rounded-xl border border-bone bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestChanges}
              disabled={sending !== null}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {sending === "changes" ? "Enviando..." : "Pedir cambios"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setError(null);
              }}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-taupe ring-1 ring-inset ring-bone transition-colors hover:text-ink"
            >
              Volver
            </button>
          </div>
        </div>
      ) : mode === "cancel" ? (
        <div className="mt-4">
          <label
            htmlFor="cancel-reason"
            className="text-sm font-semibold text-ink"
          >
            Motivo de la cancelación (opcional)
          </label>
          <textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            rows={3}
            placeholder="Ej: la campaña se canceló internamente."
            className="mt-1.5 w-full resize-y rounded-xl border border-bone bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={sending !== null}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {sending === "cancel" ? "Cancelando..." : "Confirmar cancelación"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setError(null);
              }}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-taupe ring-1 ring-inset ring-bone transition-colors hover:text-ink"
            >
              Volver
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={approve}
            disabled={sending !== null}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {sending === "approve"
              ? "Aprobando..."
              : "Aprobar y liberar pago"}
          </button>
          {!isFinalVersion ? (
            <button
              type="button"
              onClick={() => setMode("changes")}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-ink ring-1 ring-inset ring-bone transition-colors hover:bg-paper-deep"
            >
              Pedir cambios
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMode("cancel")}
            className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Cancelar colaboración
          </button>
        </div>
      )}
    </div>
  );
}
