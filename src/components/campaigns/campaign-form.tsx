"use client";

import { useActionState } from "react";
import { createCampaign } from "@/app/campaigns/actions";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

const inputClasses =
  "h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";
const textareaClasses =
  "rounded-xl border border-bone bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

const categories = [
  "Beauty",
  "Skincare",
  "Fashion",
  "Food",
  "Fitness",
  "Tech",
  "Lifestyle",
  "Travel",
  "Home",
  "Otro",
];

export function CampaignForm() {
  const [state, formAction, pending] = useActionState(createCampaign, {
    error: "",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Título del brief</span>
        <input
          name="title"
          required
          placeholder="Ej: Necesito 3 videos UGC para nuestra crema hidratante"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Descripción</span>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="Contanos en detalle qué necesitás: tono, estilo, duración, qué transmitir..."
          className={textareaClasses}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Categoría</span>
          <select name="category" required className={inputClasses}>
            <option value="">Seleccioná...</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Deadline</span>
          <input name="deadline" type="date" className={inputClasses} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            Presupuesto mínimo (USD)
          </span>
          <input
            name="budgetMin"
            type="number"
            required
            min={0}
            placeholder="50"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            Presupuesto máximo (USD)
          </span>
          <input
            name="budgetMax"
            type="number"
            min={0}
            placeholder="150"
            className={inputClasses}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Deliverables</span>
        <textarea
          name="deliverables"
          rows={2}
          placeholder="Ej: 3 videos verticales de 30s + 2 imágenes estáticas"
          className={textareaClasses}
        />
      </label>

      {state?.error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-2">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            buttonClasses("primary", "lg"),
            "w-full disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {pending ? "Publicando..." : "Publicar campaña"}
        </button>
      </div>
    </form>
  );
}