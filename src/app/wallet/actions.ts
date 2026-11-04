"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { siteUrl } from "@/lib/site-url";
import { WALLET_MAX_USD, WALLET_MIN_USD } from "@/lib/wallet";

export interface TopUpState {
  error?: string;
}

/**
 * Crea un Checkout Session de Stripe (modo test) para recargar la wallet.
 * El saldo NO se acredita acá: lo hace el webhook (o el sync al volver),
 * llamando a un RPC idempotente.
 */
export async function startTopUp(
  _prev: TopUpState,
  formData: FormData
): Promise<TopUpState> {
  if (!isStripeConfigured()) {
    return {
      error:
        "Stripe no está configurado. Falta STRIPE_SECRET_KEY en las variables de entorno.",
    };
  }

  const raw = String(formData.get("amount") ?? "")
    .replace(",", ".")
    .trim();
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    return { error: "Ingresá un monto válido." };
  }

  const amount = Math.round(parsed * 100) / 100;

  if (amount < WALLET_MIN_USD || amount > WALLET_MAX_USD) {
    return {
      error: `El monto debe estar entre USD ${WALLET_MIN_USD} y USD ${WALLET_MAX_USD}.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stripe = getStripe();
  const base = siteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: "Recarga de wallet — GaiaUGC",
            description: `Saldo a favor para contratar colaboraciones (USD ${amount.toFixed(2)})`,
          },
        },
      },
    ],
    client_reference_id: user.id,
    metadata: {
      kind: "wallet_topup",
      user_id: user.id,
      amount: amount.toFixed(2),
    },
    success_url: `${base}/wallet?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/wallet?canceled=1`,
  });

  if (!session.url) {
    return { error: "Stripe no devolvió una URL de pago. Intentá de nuevo." };
  }

  redirect(session.url);
}
