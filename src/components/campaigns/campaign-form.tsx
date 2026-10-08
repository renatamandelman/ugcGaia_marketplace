"use client";

import { useActionState } from "react";
import { createCampaign, updateCampaign } from "@/app/campaigns/actions";
import { buttonClasses } from "@/components/ui/button";
import { TagsInput } from "@/components/ui/tags-input";
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

const statuses = [
  { value: "open", label: "Abierta (recibe aplicaciones)" },
  { value: "filled", label: "Completa" },
  { value: "closed", label: "Cerrada" },
];

export interface CampaignFormInitial {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number | null;
  deliverables: string | null;
  deadline: string | null;
  status: "open" | "filled" | "closed";
  tags: string[];
}

interface CampaignFormProps {
  /** Si se pasa, el formulario edita esa campaña en vez de crear una nueva. */
  campaign?: CampaignFormInitial;
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const action = campaign ? updateCampaign : createCampaign;
  const [state, formAction, pending] = useActionState(action, {
    error: "",
  });

  return (
    <form action={formAction} className="grid gap-4">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Título del brief</span>
        <input
          name="title"
          required
          defaultValue={campaign?.title}
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
          defaultValue={campaign?.description}
          placeholder="Contanos en detalle qué necesitás: tono, estilo, duración, qué transmitir..."
          className={textareaClasses}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Categoría</span>
          <select
            name="category"
            required
            defaultValue={campaign?.category ?? ""}
            className={inputClasses}
          >
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
          <input
            name="deadline"
            type="date"
            defaultValue={campaign?.deadline ?? ""}
            className={inputClasses}
          />
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
            defaultValue={campaign?.budget_min}
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
            defaultValue={campaign?.budget_max ?? ""}
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
          defaultValue={campaign?.deliverables ?? ""}
          placeholder="Ej: 3 videos verticales de 30s + 2 imágenes estáticas"
          className={textareaClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Tags de la campaña</span>
        <TagsInput
          name="tags"
          defaultValue={campaign?.tags}
          placeholder="Ej: antes/después, unboxing, piel real, voz local"
          max={8}
        />
        <span className="text-xs text-taupe">
          Así te encuentran los creadores que ya trabajan estos temas.
        </span>
      </label>

      {campaign ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Estado</span>
          <select
            name="status"
            defaultValue={campaign.status}
            className={inputClasses}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

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
          {pending
            ? campaign
              ? "Guardando..."
              : "Publicando..."
            : campaign
              ? "Guardar cambios"
              : "Publicar campaña"}
        </button>
      </div>
    </form>
  );
}
