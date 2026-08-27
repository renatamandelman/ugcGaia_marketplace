import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";

export function DualCta() {
  return (
    <Section id="cta" className="bg-white">
      <div className="rounded-3xl bg-brand px-6 py-14 text-center sm:px-12 sm:py-20 shadow-xl shadow-brand/25">
        <p className="text-sm font-semibold uppercase tracking-widest text-paper">
          Sumate a GaiaUGC
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
          El contenido más confiable lo hacen personas reales
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-paper/70">
          Elegí tu lado del marketplace. En menos de 5 minutos estás
          publicando briefs o aplicando a tu primera campaña.
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-paper/15 bg-paper/5 p-6 text-left backdrop-blur">
            <h3 className="text-lg font-semibold text-white">¿Sos una marca?</h3>
            <p className="mt-2 text-sm leading-6 text-paper/70">
              Publicá tu primer brief gratis y recibí propuestas de creadores
              alineados con tu audiencia.
            </p>
            <ButtonLink
              href="/campaigns"
              variant="ember"
              className="mt-5 w-full"
            >
              Publicar un brief
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
          </div>

          <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-left">
            <h3 className="text-lg font-semibold text-white">
              ¿Sos creador/a?
            </h3>
            <p className="mt-2 text-sm leading-6 text-paper/80">
              Creá tu perfil, mostrá tu portfolio y empezá a cobrar por
              contenido que ya sabés hacer.
            </p>
            <ButtonLink
              href="/campaigns"
              variant="secondary"
              className="mt-5 w-full"
            >
              Crear mi perfil
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}