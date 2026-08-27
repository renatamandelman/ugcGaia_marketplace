"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";

const navLinks = [
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Campañas", href: "/campaigns" },
  { label: "Creadores", href: "/#creadores" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-bone/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="GaiaUGC — inicio">
          <Image
            src="/logo/logoVarianteHorizontal.png"
            alt="GaiaUGC"
            width={600}
            height={340}
            className="h-15 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-taupe transition-colors hover:bg-paper hover:text-brand-deep"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <ButtonLink href="/#cta" variant="ghost" size="sm">
            Soy marca
          </ButtonLink>
          <ButtonLink href="/#cta" variant="primary" size="sm">
            Soy creador
          </ButtonLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg text-taupe hover:bg-paper md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-bone/60 bg-paper transition-all duration-200 md:hidden",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-taupe hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-bone/50 pt-4">
            <ButtonLink href="/#cta" variant="secondary" size="sm">
              Soy marca
            </ButtonLink>
            <ButtonLink href="/#cta" variant="primary" size="sm">
              Soy creador
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}