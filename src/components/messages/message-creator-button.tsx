"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/app/messages/actions";

export function MessageCreatorButton({
  creatorId,
  className,
  label = "Mensaje",
}: {
  creatorId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = () => {
    setError(null);
    startTransition(async () => {
      const result = await startConversation(creatorId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.conversationId) {
        router.push(`/messages/${result.conversationId}`);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className={className}
      >
        {pending ? "Abriendo…" : label}
      </button>
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}
    </>
  );
}
