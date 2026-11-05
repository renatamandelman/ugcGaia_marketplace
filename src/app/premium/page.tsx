import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PremiumForm } from "@/components/premium/premium-form";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { isPremium, PREMIUM_BENEFITS, PREMIUM_MONTHLY_USD } from "@/lib/premium";
import { syncCheckoutSession } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Premium",
  description:
    "Cuenta Premium de GaiaUGC: badge verificado y campañas destacadas primero en el feed.",
};

const freeFeatures = [
  "Publicar campañas y postularte",
  "Pago protegido con escrow",
  "Mensajería y notificaciones",
  "Portfolio y briefs ilimitados",
];

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sessionId =
    typeof params.session_id === "string" ? params.session_id : null;
  const canceled = params.canceled === "1";

  let justActivated = false;
  if (sessionId) {
    const synced = await syncCheckoutSession(sessionId, user.id);
    justActivated = synced?.kind === "premium";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_until")
    .eq("id", user.id)
    .maybeSingle();

  const active = isPremium(profile);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-clay">
          Plan Premium
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Destacá en Gaia
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-taupe sm:text-base">
          Para marcas que quieren que sus briefs se vean primero, y creadores
          que quieren mostrar que están verificados.
        </p>
      </div>

      {justActivated ? (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3.5 text-center text-sm font-semibold text-brand">
          ¡Ya sos Premium! Los beneficios están activos.
        </div>
      ) : null}

      {canceled ? (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-bone bg-paper-deep px-4 py-3.5 text-center text-sm text-taupe">
          Cancelaste la suscripción. No se hizo ningún cargo.
        </div>
      ) : null}

      <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
        {/* Free */}
        <section className="rounded-3xl border border-bone bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-ink">Free</h2>
          <p className="mt-1 text-sm text-taupe">Todo lo esencial para arrancar.</p>
          <p className="mt-5 text-4xl font-bold tracking-tight text-ink">
            USD 0
            <span className="text-base font-medium text-taupe">/mes</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-brand">✓</span>
                {feature}
              </li>
            ))}
            <li className="flex items-start gap-2.5 text-taupe">
              <span className="mt-0.5">✕</span>
              Badge Premium
            </li>
            <li className="flex items-start gap-2.5 text-taupe">
              <span className="mt-0.5">✕</span>
              Campañas destacadas en el feed
            </li>
          </ul>
          <div className="mt-7 rounded-xl bg-paper px-4 py-3 text-center text-sm font-semibold text-taupe">
            {active ? "Tu plan anterior" : "Tu plan actual"}
          </div>
        </section>

        {/* Premium */}
        <section className="relative overflow-hidden rounded-3xl border-2 border-brand bg-brand p-6 text-white shadow-lg shadow-brand/20 sm:p-8">
          <span className="absolute right-6 top-6">
            <PremiumBadge size="md" />
          </span>
          <h2 className="text-lg font-bold">Premium</h2>
          <p className="mt-1 text-sm text-white/70">
            Visible primero, siempre.
          </p>
          <p className="mt-5 text-4xl font-bold tracking-tight">
            USD {PREMIUM_MONTHLY_USD}
            <span className="text-base font-medium text-white/70">/mes</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 text-lime-bright">✓</span>
              Todo lo del plan Free
            </li>
            {PREMIUM_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-lime-bright">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <PremiumForm active={active} />
          </div>
        </section>
      </div>

    
    </main>
  );
}
