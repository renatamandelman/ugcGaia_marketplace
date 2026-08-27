import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-24 text-center sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Esta campaña ya no existe
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-taupe">
        Puede que el brief se haya cerrado o que la dirección esté
        desactualizada. Volvé al marketplace para ver las campañas activas.
      </p>
      <ButtonLink href="/campaigns" className="mt-8">
        Ver campañas activas
      </ButtonLink>
      <Link
        href="/"
        className="mt-4 text-sm font-medium text-taupe underline-offset-4 hover:text-brand hover:underline"
      >
        Ir al inicio
      </Link>
    </div>
  );
}