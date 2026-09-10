"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToCampaign } from "@/app/campaigns/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";

interface ApplyButtonProps {
  campaignId: string;
  campaignTitle: string;
  isAuthenticated: boolean;
}

export function ApplyButton({
  campaignId,
  campaignTitle,
  isAuthenticated,
}: ApplyButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  function handleApply() {
    setError("");
    startTransition(async () => {
      const result = await applyToCampaign(campaignId);
      if (result && "error" in result) {
        setError(result.error ?? "");
        return;
      }
      setApplied(true);
      router.refresh();
    });
  }

  if (applied) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <CheckIcon width={16} height={16} />
        Postulación enviada a {campaignTitle}.
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ButtonLink href="/login" variant="primary" size="lg" className="w-full">
        Ingresá para aplicar
      </ButtonLink>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleApply}
        disabled={pending}
      >
        {pending ? "Enviando postulación..." : "Aplicar como creador"}
      </Button>
      {error ? (
        <p className="text-center text-sm font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}