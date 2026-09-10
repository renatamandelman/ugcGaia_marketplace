"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp, type AuthState, type UserRole } from "@/app/auth/actions";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: "creator",
    label: "Soy Creador",
    description: "Monetizá tu contenido UGC",
  },
  {
    value: "brand",
    label: "Soy Marca",
    description: "Publico briefs y busco creadores",
  },
];

const industryOptions = [
  "Beauty",
  "Food",
  "Fashion",
  "Tech",
  "Fitness",
  "Home & Deco",
  "Wellness",
  "Otro",
];

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    signUp,
    { error: "", success: "" } as AuthState
  );
  const [role, setRole] = useState<UserRole>("creator");

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16 sm:py-24">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-bone">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Creá tu cuenta
        </h1>
        <p className="mt-1 text-sm text-taupe">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-deep underline-offset-2 hover:underline"
          >
            Ingresá acá
          </Link>
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          {/* Selector de rol */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Elegí tu rol
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition-colors",
                    role === option.value
                      ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                      : "border-bone bg-paper hover:border-brand/40"
                  )}
                >
                  <span className="block text-sm font-semibold text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-taupe">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
            <input type="hidden" name="role" value={role} />
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">
              {role === "brand" ? "Nombre de la marca" : "Nombre y apellido"}
            </span>
            <input
              type="text"
              name="fullName"
              required
              autoComplete={role === "brand" ? "organization" : "name"}
              placeholder={
                role === "brand" ? "Ej: Lumina Skin" : "Ej: Malena Ríos"
              }
              className="h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          {role === "brand" ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">Industria</span>
                <select
                  name="industry"
                  required
                  defaultValue=""
                  className="h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="" disabled>
                    Elegí tu industria
                  </option>
                  {industryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">
                  Sitio web{" "}
                  <span className="font-normal text-taupe">(opcional)</span>
                </span>
                <input
                  type="url"
                  name="website"
                  autoComplete="url"
                  placeholder="https://..."
                  className="h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Contraseña</span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <span className="text-xs text-taupe">
              Mínimo 8 caracteres.
            </span>
          </label>

          {state?.error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {state.error}
            </p>
          ) : null}

          {state?.success ? (
            <div
              className="rounded-xl bg-brand/5 p-4 text-sm leading-6 text-brand"
              role="status"
            >
              {state.success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className={cn(
              buttonClasses("primary", "lg"),
              "w-full disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {pending ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}