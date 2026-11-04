"use client";

import { useActionState, useState } from "react";
import { startTopUp, type TopUpState } from "@/app/wallet/actions";
import { buttonClasses } from "@/components/ui/button";
import { WALLET_MAX_USD, WALLET_MIN_USD, WALLET_PRESETS } from "@/lib/wallet";
import { cn } from "@/components/ui/utils";

export function TopUpForm() {
  const [state, formAction, pending] = useActionState<TopUpState, FormData>(
    startTopUp,
    {}
  );
  const [amount, setAmount] = useState<string>(
    String(WALLET_PRESETS[1] ?? 25)
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-taupe">
          Elegí un monto (USD)
        </span>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WALLET_PRESETS.map((preset) => {
            const active = Number(amount) === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                aria-pressed={active}
                className={cn(
                  "h-11 rounded-xl text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand text-white shadow-sm shadow-brand/25"
                    : "bg-paper text-ink ring-1 ring-inset ring-bone hover:bg-paper-deep"
                )}
              >
                ${preset}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="text-xs font-semibold uppercase tracking-wider text-taupe"
        >
          U otro monto
        </label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-taupe">$</span>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={WALLET_MIN_USD}
            max={WALLET_MAX_USD}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-12 w-full rounded-xl border border-bone bg-white px-4 text-lg font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <p className="mt-1.5 text-xs text-taupe">
          Mínimo USD {WALLET_MIN_USD} · máximo USD {WALLET_MAX_USD}. Modo
          prueba: usá la tarjeta 4242 4242 4242 4242.
        </p>
      </div>

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
        {pending ? "Redirigiendo a Stripe…" : "Cargar saldo con tarjeta"}
      </button>

      <p className="text-center text-[11px] leading-4 text-taupe">
        Pago procesado por Stripe en entorno de pruebas. No se cobra dinero
        real.
      </p>
    </form>
  );
}
