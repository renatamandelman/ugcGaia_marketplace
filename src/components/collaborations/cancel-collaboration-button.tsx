"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelCollaboration } from "@/app/collaborations/actions";

export function CancelCollaborationButton({
  collaborationId,
}: {
  collaborationId: string;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (
      !window.confirm(
        "¿Cancelar la colaboración? Se devuelve el pago retenido a tu wallet."
      )
    ) {
      return;
    }

    setSending(true);
    setError(null);
    const result = await cancelCollaboration(
      collaborationId,
      "Cancelada por la marca."
    );
    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={sending}
        className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-60"
      >
        {sending ? "Cancelando..." : "Cancelar colaboración"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
