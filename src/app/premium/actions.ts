"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { siteUrl } from "@/lib/site-url";
import { PREMIUM_MONTHLY_USD, isPremium } from "@/lib/premium";

export interface PremiumState {
  error?: string;
}

/**
 * Crea un Checkout Session de suscripción mensual (modo test).
 * El plan se activa en el webhook / sync, no acá.
 */
export async function startPremiumCheckout(): Promise<PremiumState> {
  if (!isStripeConfigured()) {
    return {
      error:
        "Stripe no está configurado. Falta STRIPE_SECRET_KEY en las variables de entorno.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_until")
    .eq("id", user.id)
    .maybeSingle();

  if (isPremium(profile)) {
    return { error: "Ya tenés una cuenta Premium activa." };
  }

  const stripe = getStripe();
  const base = siteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PREMIUM_MONTHLY_USD * 100,
          recurring: { interval: "month" },
          product_data: {
            name: "GaiaUGC Premium — mensual",
            description:
              "Badge Premium y tus campañas destacadas primero en el feed.",
          },
        },
      },
    ],
    client_reference_id: user.id,
    metadata: {
      kind: "premium",
      user_id: user.id,
      amount: String(PREMIUM_MONTHLY_USD),
    },
    subscription_data: {
      metadata: {
        kind: "premium",
        user_id: user.id,
      },
    },
    success_url: `${base}/premium?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/premium?canceled=1`,
  });

  if (!session.url) {
    return { error: "Stripe no devolvió una URL de pago. Intentá de nuevo." };
  }

  redirect(session.url);
}
