import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook de Stripe (modo test).
 *
 * Eventos que maneja:
 *  - checkout.session.completed  → acredita wallet o activa premium
 *  - customer.subscription.deleted → devuelve la cuenta a free
 *
 * Los RPC son idempotentes: si Stripe reintenta el evento, no duplica saldo.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Falta STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Firma inválida";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const kind = session.metadata?.kind;
        const userId = session.metadata?.user_id;
        const amount = Number(session.metadata?.amount ?? 0);

        if (!kind || !userId) break;
        if (session.payment_status !== "paid") break;

        if (kind === "wallet_topup") {
          const { error } = await admin.rpc("process_wallet_topup", {
            p_session_id: session.id,
            p_user_id: userId,
            p_amount: amount,
          });
          if (error) throw new Error(error.message);
        } else if (kind === "premium") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null;

          const { error } = await admin.rpc("activate_premium", {
            p_session_id: session.id,
            p_user_id: userId,
            p_amount: amount,
            p_subscription_id: subscriptionId,
          });
          if (error) throw new Error(error.message);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        if (!userId) break;

        const { error } = await admin.rpc("deactivate_premium", {
          p_user_id: userId,
        });
        if (error) throw new Error(error.message);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // 500 → Stripe reintenta el evento.
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
