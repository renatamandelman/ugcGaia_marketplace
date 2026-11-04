import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role: bypassa RLS.
 * Uso EXCLUSIVO del servidor (webhook de Stripe). Nunca importar en un
 * componente de cliente ni exponer la key con NEXT_PUBLIC_.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan credenciales de Supabase (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
