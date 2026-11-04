"use client";

import { useActionState } from "react";
import {
  startPremiumCheckout,
  type PremiumState,
} from "@/app/premium/actions";
import { buttonClasses } from "@/components/ui/button";

export function PremiumForm({ active }: { active: boolean }) {
  const [state, formAction, pending] = useActionState<PremiumState, FormData>(
    startPremiumCheckout,
    {}
  );

  if (active) {
    return (
      <div className="rounded-xl bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
        Tu cuenta ya es Premium. Los beneficios están activos.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", "lg", "w-full")}
      >
        {pending ? "Redirigiendo a Stripe…" : "Suscribirme por USD 19/mes"}
      </button>

      <p className="text-center text-[11px] leading-4 text-taupe">
        Suscripción mensual en modo prueba. Podés cancelarla desde tu panel de
        Stripe.
      </p>
    </form>
  );
}
