"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/app/profile/actions";
import { cn } from "@/components/ui/utils";

export function ApplicationActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: "pending" | "accepted" | "rejected";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status !== "pending") return null;

  const decide = (next: "accepted" | "rejected") => {
    startTransition(async () => {
      await updateApplicationStatus(applicationId, next);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => decide("accepted")}
        disabled={pending}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors",
          "bg-brand hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        Aceptar
      </button>
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
    </div>
  );
}