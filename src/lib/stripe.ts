import Stripe from "stripe";

let cached: Stripe | null = null;

/** Cliente de Stripe (server-only). Falla claro si falta la key. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Falta STRIPE_SECRET_KEY. Copiala de dashboard.stripe.com → Developers → API keys (modo test)."
    );
  }
  if (!cached) cached = new Stripe(key);
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
