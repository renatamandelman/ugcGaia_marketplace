import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopUpForm } from "@/components/wallet/topup-form";
import { ButtonLink } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { formatMoney } from "@/lib/format";
import { isPremium } from "@/lib/premium";
import { syncCheckoutSession } from "@/lib/payments";
import { WalletIcon } from "@/components/ui/icons";
import type { WalletTransactionKind } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Wallet",
  description:
    "Cargá saldo con tarjeta (Stripe, modo prueba) para contratar colaboraciones con pago protegido.",
};

const kindLabel: Record<WalletTransactionKind, string> = {
  deposit: "Recarga con tarjeta",
  hold: "Retenido en escrow",
  release: "Pago liberado",
  refund: "Devolución",
  premium: "Suscripción Premium",
};

const kindTone: Record<WalletTransactionKind, string> = {
  deposit: "text-brand",
  hold: "text-clay",
  release: "text-brand",
  refund: "text-brand",
  premium: "text-clay",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sessionId =
    typeof params.session_id === "string" ? params.session_id : null;
  const canceled = params.canceled === "1";

  // Fallback del webhook: si volvemos de Stripe y el webhook no llegó
  // (típico en local), acreditamos acá de forma idempotente.
  let justCharged: { amount: number } | null = null;
  let syncError: string | null = null;

  if (sessionId) {
    try {
      const synced = await syncCheckoutSession(sessionId, user.id);
      if (synced) justCharged = { amount: synced.amount };
    } catch (error) {
      syncError =
        error instanceof Error
          ? error.message
          : "No pudimos acreditar el pago.";
    }
  }

  const [{ data: profile }, { data: wallet }, { data: transactions }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role, plan, premium_until")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("wallet_transactions")
        .select("id, kind, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const balance = Number(wallet?.balance ?? 0);
  const rows = (transactions ?? []) as {
    id: string;
    kind: WalletTransactionKind;
    amount: number;
    created_at: string;
  }[];
  const premium = isPremium(profile);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-taupe">
            {profile?.role === "brand" ? "Cuenta de marca" : "Cuenta de creador"}
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Tu wallet
            {premium ? <PremiumBadge size="md" /> : null}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-taupe">
            Cargá saldo con tarjeta en modo prueba y usalo para contratar
            colaboraciones con pago protegido.
          </p>
        </div>
        <ButtonLink href="/premium" variant="secondary" size="sm">
          {premium ? "Gestionar Premium" : "Pasarme a Premium"}
        </ButtonLink>
      </div>

      {justCharged ? (
        <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3.5 text-sm font-semibold text-brand">
          ¡Listo! Acreditamos {formatMoney(justCharged.amount)} en tu wallet.
        </div>
      ) : null}

      {canceled ? (
        <div className="mt-6 rounded-2xl border border-bone bg-paper-deep px-4 py-3.5 text-sm text-taupe">
          Cancelaste el pago. No se hizo ningún cargo.
        </div>
      ) : null}

      {syncError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700">
          El pago se registró en Stripe pero no pudimos acreditarlo: {syncError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Saldo + movimientos */}
        <section className="order-2 lg:order-1">
          <div className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-mint/40 text-brand">
                <WalletIcon width={18} height={18} />
              </div>
              <h2 className="text-lg font-bold text-ink">Saldo disponible</h2>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight text-ink">
              {formatMoney(balance)}
            </p>
            <p className="mt-1.5 text-xs text-taupe">
              Las recargas se acreditan al confirmarse el pago en Stripe.
            </p>
          </div>

          <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-taupe">
            Movimientos
          </h2>

          {rows.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-bone bg-paper p-5 text-sm text-taupe">
              Todavía no hay movimientos. Cargá saldo para empezar.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-bone/60 overflow-hidden rounded-2xl border border-bone bg-white">
              {rows.map((row) => {
                const positive = Number(row.amount) > 0;
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {kindLabel[row.kind] ?? row.kind}
                      </p>
                      <p className="text-xs text-taupe">
                        {formatDate(row.created_at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold ${
                        kindTone[row.kind] ?? "text-ink"
                      }`}
                    >
                      {positive ? "+" : "−"}
                      {formatMoney(Math.abs(Number(row.amount)))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Formulario de recarga */}
        <section className="order-1 lg:order-2">
          <div className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Cargar saldo</h2>
            <p className="mt-1 mb-5 text-xs text-taupe">
              Pago único. Stripe Checkout en modo prueba.
            </p>
            <TopUpForm />
          </div>

          <div className="mt-4 rounded-2xl bg-paper-deep p-4 text-xs leading-5 text-taupe">
            El dinero queda en tu wallet. Cuando aceptás una postulación, Gaia
            lo retiene en custodia y lo libera al creador cuando aprobás la
            entrega (comisión de plataforma: 6%).
          </div>
        </section>
      </div>
    </main>
  );
}
