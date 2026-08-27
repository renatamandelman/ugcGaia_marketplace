const brands = [
  "Lumina Skin",
  "Yerba Pampa",
  "Atelier Norte",
  "Flexio",
  "Olivia",
  "Núcleo Fit",
];

/** Decorative strip — mock brand wordmarks to seed trust during the pitch */
export function TrustStrip() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/60 py-8">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-zinc-400">
          Marcas que ya publican campañas con micro-creadores
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((brand) => (
            <li
              key={brand}
              className="text-base font-semibold text-zinc-400 transition-colors hover:text-zinc-600"
            >
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}