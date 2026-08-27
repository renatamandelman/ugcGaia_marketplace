"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";

interface ApplyButtonProps {
  campaignTitle: string;
}

type ApplyState = "idle" | "loading" | "applied";

/**
 * Simulated apply flow for the MVP demo.
 * Later this becomes a Server Action that persists the proposal to Supabase.
 */
export function ApplyButton({ campaignTitle }: ApplyButtonProps) {
  const [state, setState] = useState<ApplyState>("idle");

  function handleApply() {
    if (state !== "idle") return;
    setState("loading");
    // Fake network round-trip so the demo feels real
    window.setTimeout(() => setState("applied"), 900);
  }

  if (state === "applied") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <CheckIcon width={16} height={16} />
        Propuesta enviada a {campaignTitle}.
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      onClick={handleApply}
      disabled={state === "loading"}
    >
      {state === "loading" ? "Enviando propuesta..." : "Aplicar como creador"}
    </Button>
  );
}