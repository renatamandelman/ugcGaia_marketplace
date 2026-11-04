/**
 * Loading global: skeleton genérico mientras el server component resuelve.
 * Evita el "pantallazo congelado" al navegar entre rutas.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="h-4 w-24 animate-pulse rounded-full bg-bone/60" />
      <div className="mt-3 h-8 w-72 max-w-full animate-pulse rounded-xl bg-bone/60" />
      <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-full bg-bone/40" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-bone/70 bg-white"
          >
            <div className="h-32 animate-pulse bg-bone/40" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-bone/60" />
              <div className="h-3 w-full animate-pulse rounded-full bg-bone/40" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-bone/40" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 animate-pulse rounded-full bg-bone/40" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-bone/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
