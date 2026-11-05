"use client";

import { useActionState, useState } from "react";
import {
  requestWithdrawal,
  type WithdrawalState,
} from "@/app/wallet/actions";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { WITHDRAW_MIN_USD } from "@/lib/wallet";

export function WithdrawForm({ balance }: { balance: number }) {
  const [state, formAction, pending] = useActionState<
    WithdrawalState,
    FormData
  >(requestWithdrawal, {});
  const [method, setMethod] = useState<"cbu" | "alias">("alias");

  const belowMinimum = balance < WITHDRAW_MIN_USD;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="method" value={method} />

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-taupe">
          Destino
        </span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              { value: "alias", label: "Alias" },
              { value: "cbu", label: "CBU / CVU" },
            ] as const
          ).map((option) => {
            const active = method === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMethod(option.value)}
                aria-pressed={active}
                className={cn(
                  "h-10 rounded-xl text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand text-white shadow-sm shadow-brand/25"
                    : "bg-paper text-ink ring-1 ring-inset ring-bone hover:bg-paper-deep"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="destination"
          className="text-xs font-semibold uppercase tracking-wider text-taupe"
        >
          {method === "cbu" ? "CBU o CVU (22 dígitos)" : "Alias"}
        </label>
        <input
          id="destination"
          name="destination"
          type="text"
          required
          autoComplete="off"
          inputMode={method === "cbu" ? "numeric" : "text"}
          maxLength={method === "cbu" ? 22 : 20}
          placeholder={method === "cbu" ? "0000003100012345678901" : "gaia.creador"}
          className="mt-2 h-11 w-full rounded-xl border border-bone bg-white px-3.5 text-sm font-medium text-ink outline-none transition-colors placeholder:font-normal placeholder:text-taupe/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label
          htmlFor="withdraw-amount"
          className="text-xs font-semibold uppercase tracking-wider text-taupe"
        >
          Monto a retirar (USD)
        </label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-taupe">$</span>
          <input
            id="withdraw-amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={WITHDRAW_MIN_USD}
            max={balance}
            step="0.01"
            required
            defaultValue={balance >= WITHDRAW_MIN_USD ? balance.toFixed(2) : ""}
            className="h-11 w-full rounded-xl border border-bone bg-white px-3.5 text-base font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <p className="mt-1.5 text-xs text-taupe">
          Mínimo USD {WITHDRAW_MIN_USD} · disponible USD {balance.toFixed(2)}.
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

      {state.ok ? (
        <p
          role="status"
          className="rounded-xl border border-brand/20 bg-brand/10 px-3.5 py-2.5 text-sm font-medium text-brand"
        >
          {state.ok}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || belowMinimum}
        className={buttonClasses("secondary", "lg", "w-full")}
      >
        {pending ? "Registrando pedido…" : "Solicitar retiro"}
      </button>

      <p className="text-center text-[11px] leading-4 text-taupe">
        Retiro simulado: se descuenta del saldo y queda pendiente de
        acreditación. No mueve dinero real — un payout requiere Stripe Connect y
        verificación de identidad.
      </p>
    </form>
  );
}
