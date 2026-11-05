"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { siteUrl } from "@/lib/site-url";
import { WALLET_MAX_USD, WALLET_MIN_USD, WITHDRAW_MIN_USD } from "@/lib/wallet";

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

  // Solo las marcas cargan saldo: el creador cobra, no paga. Sin este
  // chequeo, ocultar el formulario sería solo cosmético (la action se
  // puede invocar igual desde el cliente).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "brand") {
    return {
      error: "Solo las marcas pueden cargar saldo. Como creador, tu saldo entra cuando aprobás una entrega.",
    };
  }

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

export interface WithdrawalState {
  error?: string;
  ok?: string;
}

/**
 * Solicita un retiro del saldo del creador (simulado).
 *
 * El descuento y la validación de saldo viven en el RPC
 * `request_withdrawal` (security definer, con FOR UPDATE): acá solo
 * parseamos el formulario. Si validáramos únicamente en el cliente,
 * un doble submit podría dejar el saldo en negativo.
 */
export async function requestWithdrawal(
  _prev: WithdrawalState,
  formData: FormData
): Promise<WithdrawalState> {
  const rawAmount = String(formData.get("amount") ?? "")
    .replace(",", ".")
    .trim();
  const amount = Math.round(Number(rawAmount) * 100) / 100;
  const method = String(formData.get("method") ?? "cbu");
  const destination = String(formData.get("destination") ?? "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Ingresá un monto válido." };
  }

  if (amount < WITHDRAW_MIN_USD) {
    return { error: `El retiro mínimo es USD ${WITHDRAW_MIN_USD}.` };
  }

  if (method !== "cbu" && method !== "alias") {
    return { error: "Elegí CBU/CVU o alias como destino." };
  }

  if (method === "cbu" && !/^\d{22}$/.test(destination)) {
    return { error: "El CBU/CVU tiene que tener exactamente 22 dígitos." };
  }

  if (method === "alias" && !/^[a-zA-Z0-9.\-]{6,20}$/.test(destination)) {
    return {
      error:
        "El alias tiene que tener entre 6 y 20 caracteres: letras, números, punto o guión.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
    p_method: method,
    p_destination: destination,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/wallet");

  return {
    ok: `Pedido de retiro por USD ${amount.toFixed(2)} registrado. Queda pendiente de acreditación.`,
  };
}

/** Cancela un retiro pendiente y devuelve el saldo al wallet. */
export async function cancelWithdrawal(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.rpc("cancel_withdrawal", { p_id: id });

  if (error) {
    redirect(`/wallet?withdrawError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/wallet");
}
