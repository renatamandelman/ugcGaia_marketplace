"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/app/auth/actions";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, { error: "" });

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16 sm:py-24">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-bone">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Ingresá a tu cuenta
        </h1>
        <p className="mt-1 text-sm text-taupe">
          ¿Todavía no tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-deep underline-offset-2 hover:underline"
          >
            Registrate acá
          </Link>
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
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
              autoComplete="current-password"
              className="h-11 rounded-xl border border-bone bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          {state?.error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className={cn(
              buttonClasses("primary", "lg"),
              "w-full disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}