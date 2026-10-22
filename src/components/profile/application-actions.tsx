"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/app/profile/actions";
import { cn } from "@/components/ui/utils";

export function ApplicationActions({
  applicationId,
  status,
  campaignTitle,
  conversationId,
}: {
  applicationId: string;
  status: "pending" | "accepted" | "rejected";
  campaignTitle: string;
  conversationId?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const needsMessage = status === "accepted" && !conversationId;
  if (status === "rejected" || (status === "accepted" && conversationId)) {
    return null;
  }

  const openAccept = () => {
    setError(null);
    setMessage(
      status === "accepted"
        ? `¡Hola! Ya aceptamos tu postulación para “${campaignTitle}”. ¿Coordinamos los próximos pasos?`
        : `¡Hola! Nos encantó tu propuesta para “${campaignTitle}”. Aceptamos tu postulación, ¿coordinamos los próximos pasos?`
    );
    setAccepting(true);
  };

  const decide = (next: "accepted" | "rejected", text = "") => {
    setError(null);
    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, next, text);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAccepting(false);
      if (result.conversationId) {
        router.push(`/messages/${result.conversationId}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={openAccept}
        disabled={pending}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors",
          "bg-brand hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {needsMessage ? "Enviar mensaje" : "Aceptar"}
      </button>
      {!needsMessage ? (
        <button
          type="button"
          onClick={() => decide("rejected")}
          disabled={pending}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold text-taupe transition-colors",
            "bg-paper-deep hover:bg-taupe/15 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taupe",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          Rechazar
        </button>
      ) : null}

      {error && !accepting ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : null}

      {accepting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accept-dialog-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-bone bg-white p-6 shadow-xl">
            <h2
              id="accept-dialog-title"
              className="text-lg font-semibold text-ink"
            >
              {needsMessage ? "Enviar mensaje" : "Aceptar postulación"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-taupe">
              {needsMessage
                ? "Tu postulación ya estaba aceptada. Al enviar el primer mensaje se abre la conversación."
                : "Se abre una conversación con esta persona y le llega tu mensaje como primer aviso."}
            </p>

            <label
              htmlFor="accept-message"
              className="mt-4 block text-sm font-medium text-ink"
            >
              Mensaje para el creador
            </label>
            <textarea
              id="accept-message"
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1.5 w-full resize-y rounded-xl border border-bone bg-paper/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:bg-white"
              placeholder="Contale los próximos pasos, plazos y qué necesitás."
            />

            {error ? (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAccepting(false)}
                disabled={pending}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-taupe transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => decide("accepted", message)}
                disabled={pending}
                className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending
                  ? "Enviando..."
                  : needsMessage
                    ? "Enviar mensaje"
                    : "Aceptar y enviar mensaje"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
