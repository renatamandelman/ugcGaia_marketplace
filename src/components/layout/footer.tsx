import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Plataforma",
    links: [
      { label: "Cómo funciona", href: "/#como-funciona" },
      { label: "Campañas activas", href: "/campaigns" },
      { label: "Creadores", href: "/#creadores" },
    ],
  },
  {
    title: "Marcas",
    links: [
      { label: "Publicar un brief", href: "/#cta" },
      { label: "Precios", href: "/#cta" },
      { label: "Casos de éxito", href: "/#confianza" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Sobre GaiaUGC", href: "/" },
      { label: "Sostenibilidad", href: "/" },
      { label: "Contacto", href: "mailto:hola@gaiaugc.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-paper/70">
              El marketplace que conecta micro-creadores UGC con marcas que
              creen en contenido real. Colaboraciones profesionales, pagadas y
              transparentes.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-paper">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/70 transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-8 text-xs text-paper/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} GaiaUGC. Todos los derechos
            reservados.
          </p>
          <p>
            Hecho con <span className="text-brand">♥</span> para la economía de
            los creadores.
          </p>
        </div>
      </div>
    </footer>
  );
}