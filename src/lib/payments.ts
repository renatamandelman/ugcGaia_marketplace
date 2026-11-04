import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SyncedPayment {
  kind: "wallet_topup" | "premium";
  amount: number;
  alreadyProcessed: boolean;
}

/**
 * Sincroniza un Checkout Session al volver de Stripe.
 *
 * El webhook es la fuente de verdad, pero en local (sin `stripe listen`) el
 * webhook no llega. Esta función lee la session directo de la API y aplica el
 * mismo RPC idempotente: si el webhook ya la procesó, no acredita dos veces.
 *
 * Seguridad: valida que la session pertenezca a `userId` y que esté paga.
 */
export async function syncCheckoutSession(
  sessionId: string,
  userId: string
): Promise<SyncedPayment | null> {
  if (!isStripeConfigured()) return null;
  if (!sessionId.startsWith("cs_")) return null;

  const stripe = getStripe();

  let session: Awaited<
    ReturnType<typeof stripe.checkout.sessions.retrieve>
  >;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }

  // La session tiene que ser de este usuario y estar paga.
  if (session.metadata?.user_id !== userId) return null;
  if (session.payment_status !== "paid") return null;

  const kind = session.metadata?.kind;
  const amount = Number(session.metadata?.amount ?? 0);
  const admin = createAdminClient();

  if (kind === "wallet_topup") {
    const { data, error } = await admin.rpc("process_wallet_topup", {
      p_session_id: session.id,
      p_user_id: userId,
      p_amount: amount,
    });
    if (error) throw new Error(error.message);
    return {
      kind: "wallet_topup",
      amount,
      alreadyProcessed: data === false,
    };
  }

  if (kind === "premium") {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;

    const { data, error } = await admin.rpc("activate_premium", {
      p_session_id: session.id,
      p_user_id: userId,
      p_amount: amount,
      p_subscription_id: subscriptionId,
    });
    if (error) throw new Error(error.message);
    return {
      kind: "premium",
      amount,
      alreadyProcessed: data === false,
    };
  }

  return null;
}
