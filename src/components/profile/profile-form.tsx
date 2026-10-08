"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/profile/actions";
import { buttonClasses } from "@/components/ui/button";
import { TagsInput } from "@/components/ui/tags-input";
import { cn } from "@/components/ui/utils";
import type { Profile } from "@/lib/db-types";

const inputClasses =
  "h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";
const textareaClasses =
  "rounded-xl border border-bone bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    { error: "", success: "" } as ProfileState
  );

  return (
    <div className="rounded-2xl border border-bone bg-white p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">Datos del perfil</h2>

      <form action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-ink">
            Nombre y apellido
          </span>
          <input
            name="fullName"
            defaultValue={profile?.full_name ?? ""}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Handle</span>
          <input
            name="handle"
            defaultValue={profile?.handle ?? ""}
            placeholder="@tuusuario"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Ubicación</span>
          <input
            name="location"
            defaultValue={profile?.location ?? ""}
            placeholder="Buenos Aires, AR"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-ink">
            {profile?.role === "brand"
              ? "Sitio web / contacto"
              : "Link a tu portfolio"}
          </span>
          <input
            name="portfolioUrl"
            defaultValue={profile?.portfolio_url ?? ""}
            placeholder="https://..."
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-ink">Bio</span>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            rows={4}
            placeholder={
              profile?.role === "brand"
                ? "Contanos sobre tu marca y qué buscás."
                : "Contá quién sos, tu estilo y qué sabés crear."
            }
            className={textareaClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-ink">
            {profile?.role === "brand"
              ? "Tags de tu marca"
              : "Tags de tu contenido"}
          </span>
          <TagsInput
            name="tags"
            defaultValue={profile?.tags ?? []}
            placeholder={
              profile?.role === "brand"
                ? "Ej: skincare, eco, bienestar"
                : "Ej: rutina, unboxing, productividad"
            }
            max={10}
          />
          <span className="text-xs text-taupe">
            {profile?.role === "brand"
              ? "Así te encuentran los creadores que ya cubren estos temas."
              : "Así te encuentran las marcas cuando buscan tu tipo de contenido."}
          </span>
        </label>

        {state?.error ? (
          <p className="text-sm font-medium text-red-600 sm:col-span-2">
            {state.error}
          </p>
        ) : null}

        {state?.success ? (
          <p className="text-sm font-medium text-brand sm:col-span-2">
            {state.success}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className={cn(
              buttonClasses("primary", "md"),
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {pending ? "Guardando..." : "Guardar perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}