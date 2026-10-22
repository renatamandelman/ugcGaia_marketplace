import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { CollaborationCard } from "@/components/collaborations/collaboration-card";
import { fetchCollaborations } from "@/lib/collaborations";

export const metadata = { title: "Colaboraciones — Gaia" };

export default async function CollaborationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isBrand = profile?.role === "brand";
  const collaborations = await fetchCollaborations(supabase, user.id);
  const awaitingReview = collaborations.filter(
    (collaboration) =>
      collaboration.brand_id === user.id && collaboration.pendingReview
  );
  const rest = collaborations.filter(
    (collaboration) => !awaitingReview.includes(collaboration)
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Colaboraciones
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {isBrand
              ? "Revisá entregas, aprobá contenido y liberá pagos."
              : "Revisá tus briefs, subí versiones y seguí el estado del pago."}
          </p>
        </div>
        <ButtonLink
          href={isBrand ? "/profile" : "/campaigns"}
          variant="secondary"
          size="sm"
        >
          {isBrand ? "Panel de marca" : "Explorar campañas"}
        </ButtonLink>
      </div>

      {collaborations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-bone bg-white p-10 text-center">
          <p className="text-base font-semibold text-ink">
            Todavía no hay colaboraciones
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-taupe">
            {isBrand
              ? "Cuando aceptes una postulación, acá vas a ver el brief, la entrega y el pago retenido."
              : "Cuando una marca acepte tu postulación, vas a recibir el brief y vas a poder subir tu entrega."}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {isBrand && awaitingReview.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink">
                  Entregas por revisar
                </h2>
                <span className="rounded-full bg-lime/40 px-2 py-0.5 text-[11px] font-bold text-brand">
                  {awaitingReview.length}
                </span>
              </div>
              <div className="grid gap-4">
                {awaitingReview.map((collaboration) => (
                  <CollaborationCard
                    key={collaboration.id}
                    collaboration={collaboration}
                    viewerId={user.id}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-base font-semibold text-ink">
              {isBrand && awaitingReview.length > 0
                ? "Todas las colaboraciones"
                : "Tus colaboraciones"}
            </h2>
            <div className="grid gap-4">
              {(isBrand && awaitingReview.length > 0
                ? rest
                : collaborations
              ).map((collaboration) => (
                <CollaborationCard
                  key={collaboration.id}
                  collaboration={collaboration}
                  viewerId={user.id}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
