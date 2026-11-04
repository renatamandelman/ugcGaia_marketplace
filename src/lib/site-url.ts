/**
 * URL pública del sitio, resuelta según el entorno.
 *
 * Prioridad:
 *  1. NEXT_PUBLIC_SITE_URL (si no es localhost)
 *  2. URL de producción/preview de Vercel (evita redirigir a localhost en prod)
 *  3. localhost
 *
 * Se usa en las success_url / cancel_url de Stripe y en el emailRedirectTo
 * del registro. Si NEXT_PUBLIC_SITE_URL queda en localhost y buildeamos en
 * Vercel, esto igual devuelve el dominio correcto.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const isLocalhost = !explicit || /localhost|127\.0\.0\.1/.test(explicit);

  if (!isLocalhost) return explicit;

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return explicit ?? "http://localhost:3000";
}
