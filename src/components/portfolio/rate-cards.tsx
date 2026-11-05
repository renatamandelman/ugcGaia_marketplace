import { formatMoney } from "@/lib/format";

/**
 * Tarifa base del creador en su portfolio público.
 *
 * Antes este componente mostraba 3 paquetes hardcodeados ($350 / $750 /
 * $1.200) para TODOS los creadores, aunque nunca los hubieran cargado:
 * información inventada presentada como real. Ahora muestra el valor que
 * el creador declaró en Perfil Personal, o un empty state explícito.
 */
export function RateCards({ baseRate }: { baseRate: number | null }) {
  return (
    <section className="space-y-4 pt-4">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          Tarifa base
        </h2>
        <p className="text-sm text-taupe">
          Precio de referencia por entregable. El alcance, los plazos y las
          licencias se acuerdan en el brief de cada colaboración.
        </p>
      </div>

      {baseRate === null ? (
        <div className="rounded-2xl border border-dashed border-bone bg-paper p-8 text-center">
          <p className="text-sm text-taupe">
            Este creador todavía no publicó una tarifa. Podés pedirle una
            propuesta desde tu panel.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-sm rounded-2xl border border-brand bg-white p-8 text-center shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-taupe">
            Desde
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-ink">
            {formatMoney(baseRate)}
          </p>
          <p className="mt-1 text-sm text-taupe">por entregable</p>
          <p className="mt-4 border-t border-bone/40 pt-4 text-xs leading-5 text-taupe">
            Cada colaboración tiene hasta 3 versiones del entregable para
            revisión antes de la aprobación.
          </p>
        </div>
      )}
    </section>
  );
}
