"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Queda en los logs del server / Vercel para diagnosticar.
    console.error("Error en la app:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-clay/15 text-2xl">
        ⚠️
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
        Algo se rompió de nuestro lado
      </h1>
      <p className="mt-2 text-sm leading-6 text-taupe">
        La página no pudo cargarse. Podés reintentar; si sigue fallando, volvé
        al inicio y probá de nuevo.
      </p>

      {error.digest ? (
        <p className="mt-3 rounded-full bg-paper-deep px-3 py-1 font-mono text-[11px] text-taupe">
          ref: {error.digest}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Reintentar
        </button>
        <ButtonLink href="/" variant="secondary">
          Volver al inicio
        </ButtonLink>
      </div>
    </main>
  );
}
