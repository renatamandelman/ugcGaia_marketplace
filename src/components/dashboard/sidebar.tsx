"use client";

import { Button } from "@/components/ui/button";

export function CreatorSidebar() {
  return (
    <div className="flex flex-col gap-6">
      <WalletWidget />
      <DirectInvites />
    </div>
  );
}

function WalletWidget() {
  return (
    <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-mint/40 text-brand">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-ink">Wallet del Creador</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-paper-deep px-2 py-0.5 text-xs font-bold text-brand">
          <span className="size-1.5 rounded-full bg-brand" /> Auto-Pago
        </span>
      </div>

      {/* Balance */}
      <div className="mb-5 rounded-2xl border border-bone bg-paper p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-taupe">
          Disponible para pago instantáneo
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-ink">$3,650.00</span>
          <span className="text-sm font-bold text-brand">Transferencia gratis</span>
        </div>
        <p className="mt-1.5 text-xs text-taupe">Vinculado a: Mercado Pago •••• 8841</p>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-md shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          Pago Instantáneo
        </button>
      </div>

      {/* Recent activity */}
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-taupe">
        Últimos releases
      </h4>
      <div className="space-y-3">
        <Transaction
          label="Summer Glow Campaign"
          brand="Lumina Organics"
          date="Ayer"
          amount="+$300.00"
          status="released"
        />
        <Transaction
          label="Clean Routine Photos"
          brand="Krave Beauty"
          date="8 jul"
          amount="+$250.00"
          status="released"
        />
        <Transaction
          label="Eco Sunscreen Video"
          brand="En garantía"
          date=""
          amount="$250.00"
          status="held"
        />
      </div>

      <a href="#" className="mt-4 block text-center text-xs font-bold text-taupe hover:text-ink transition-colors">
        Ver ledger completo →
      </a>
    </section>
  );
}

function Transaction({
  label,
  brand,
  date,
  amount,
  status,
}: {
  label: string;
  brand: string;
  date: string;
  amount: string;
  status: "released" | "held";
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl border border-bone p-3 transition-colors hover:border-brand/30 ${
      status === "held" ? "bg-paper-deep/50" : "bg-paper"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-8 items-center justify-center rounded-full ${
          status === "released" ? "bg-lime/60 text-brand" : "bg-paper-deep text-taupe"
        }`}>
          {status === "released" ? (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          )}
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-ink">{label}</p>
          <p className="text-xs text-taupe">{brand}{date ? ` • ${date}` : ""}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-bold ${status === "released" ? "text-brand" : "text-ink"}`}>
          {amount}
        </span>
        <p className="text-[11px] text-taupe">
          {status === "released" ? "Liberado" : "En garantía"}
        </p>
      </div>
    </div>
  );
}

function DirectInvites() {
  return (
    <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          Invitaciones de Marcas
        </h3>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
          2 pendientes
        </span>
      </div>

      <div className="space-y-3">
        <InviteCard
          brand="Krave Beauty"
          offer="$500"
          description="Invitada para co-crear 2 Reels para el relanzamiento de Great Barrier Relief."
        />
        <InviteCard
          brand="Glow Labs"
          offer="$380"
          description="Preseleccionada para la serie de lanzamiento del Peptide Eye Cream de julio."
        />
      </div>
    </section>
  );
}

function InviteCard({
  brand,
  offer,
  description,
}: {
  brand: string;
  offer: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-bone bg-paper p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-ink">{brand}</span>
        <span className="text-sm font-bold text-brand">{offer}</span>
      </div>
      <p className="mb-3 text-sm text-taupe">{description}</p>
      <div className="flex items-center gap-2">
        <button className="flex-1 rounded-lg bg-brand py-1.5 text-xs font-bold text-white transition-all hover:bg-brand-hover">
          Aceptar
        </button>
        <button className="rounded-lg bg-paper-deep px-3 py-1.5 text-xs font-bold text-taupe transition-colors hover:bg-bone/40">
          Rechazar
        </button>
      </div>
    </div>
  );
}
