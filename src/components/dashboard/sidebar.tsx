import { ButtonLink } from "@/components/ui/button";
import { WalletIcon } from "@/components/ui/icons";
import { formatBudget } from "@/lib/format";
import type { WalletTransactionKind } from "@/lib/db-types";

export interface WalletActivity {
  id: string;
  label: string;
  date: string;
  amount: number;
  kind: WalletTransactionKind;
}

interface CreatorSidebarProps {
  balance: number;
  releasedTotal: number;
  heldTotal: number;
  activeCount: number;
  transactions: WalletActivity[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export function CreatorSidebar({
  balance,
  releasedTotal,
  heldTotal,
  activeCount,
  transactions,
}: CreatorSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-mint/40 text-brand">
              <WalletIcon width={18} height={18} />
            </div>
            <h3 className="text-lg font-bold text-ink">Tu wallet</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-paper-deep px-2 py-0.5 text-xs font-bold text-brand">
            <span className="size-1.5 rounded-full bg-brand" /> Simulado
          </span>
        </div>

        <div className="mb-5 rounded-2xl border border-bone bg-paper p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-taupe">
            Saldo disponible
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="text-3xl font-bold text-ink">
              {formatBudget(balance)}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-taupe">
            Los pagos se liberan cuando la marca aprueba tu entrega.
          </p>
          <ButtonLink
            href="/collaborations"
            variant="primary"
            size="sm"
            className="mt-4 w-full"
          >
            Ver colaboraciones
          </ButtonLink>
        </div>

        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-taupe">
          Movimientos recientes
        </h4>

        {transactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-bone bg-paper p-4 text-sm text-taupe">
            Todavía no hay movimientos. Cuando te aprueben una entrega, el pago
            aparece acá.
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-bone bg-paper p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight text-ink">
                    {transaction.label}
                  </p>
                  <p className="text-xs text-taupe">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-brand">
                    +{formatBudget(transaction.amount)}
                  </span>
                  <p className="text-[11px] text-taupe">Liberado</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-ink">Resumen</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-taupe">Colaboraciones activas</dt>
            <dd className="font-semibold text-ink">{activeCount}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-taupe">Total liberado</dt>
            <dd className="font-semibold text-brand">
              {formatBudget(releasedTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-bone pt-3">
            <dt className="text-taupe">Por cobrar</dt>
            <dd className="font-semibold text-ink">{formatBudget(heldTotal)}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-xl bg-paper-deep p-3 text-xs leading-5 text-taupe">
          Gaia retiene el pago de la marca y lo libera al aprobar la entrega.
          La comisión de plataforma es del 6%.
        </div>
      </section>
    </div>
  );
}
