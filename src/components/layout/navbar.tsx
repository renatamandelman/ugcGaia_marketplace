"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { ButtonLink } from "@/components/ui/button";
import { BellIcon, MailIcon, MenuIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/components/ui/utils";
import type { User } from "@supabase/supabase-js";

const publicLinks = [
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Campañas", href: "/#campanas" },
];

interface NavbarProps {
  user?: User | null;
  unreadMessages?: number;
  unreadNotifications?: number;
}

function NavIconLink({
  href,
  label,
  count = 0,
  showLabel = false,
  onNavigate,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  showLabel?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-lg text-[#414846] transition-colors hover:bg-paper hover:text-brand-deep",
        showLabel ? "px-3 py-2.5 text-sm font-medium" : "size-10 justify-center"
      )}
    >
      <span className="relative inline-flex">
        {children}
        {count > 0 ? (
          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      {showLabel ? <span>{label}</span> : null}
    </Link>
  );
}

export function Navbar({
  user,
  unreadMessages = 0,
  unreadNotifications = 0,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  const isBrand = (user?.user_metadata?.role as string) === "brand";

  const loggedInLinks = isBrand
    ? [
        { label: "Panel", href: "/profile" },
        { label: "Campañas", href: "/campaigns" },
        { label: "Creadores", href: "/creators" },
        { label: "Colaboraciones", href: "/collaborations" },
      ]
    : [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Campañas", href: "/campaigns" },
        { label: "Colaboraciones", href: "/collaborations" },
        { label: "Portfolio", href: "/profile/settings" },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#C1C8C4]/20 bg-[#F0FCF7]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
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
          {(user ? loggedInLinks : publicLinks).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#414846] transition-colors hover:bg-paper hover:text-brand-deep"
            >
              {link.label}
            </Link>
          ))}
          {isBrand ? (
            <ButtonLink href="/campaigns/new" variant="ghost" size="sm">
              Publicar brief
            </ButtonLink>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <>
              <NavIconLink
                href="/messages"
                label="Mensajes"
                count={unreadMessages}
              >
                <MailIcon width={19} height={19} />
              </NavIconLink>
              <NavIconLink
                href="/notifications"
                label="Notificaciones"
                count={unreadNotifications}
              >
                <BellIcon width={19} height={19} />
              </NavIconLink>
              <span className="mx-1 h-5 w-px bg-bone" aria-hidden="true" />
              <ButtonLink
                href={isBrand ? "/profile" : "/profile/settings"}
                variant="secondary"
                size="sm"
              >
                Mi perfil
              </ButtonLink>
              <button
                type="button"
                disabled={signingOut}
                onClick={() => startSignOut(() => signOut())}
                className="rounded-lg px-3 py-2 text-sm font-medium text-taupe transition-colors hover:text-ink disabled:opacity-50"
              >
                {signingOut ? "Saliendo..." : "Salir"}
              </button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Ingresar
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                Crear cuenta
              </ButtonLink>
            </>
          )}
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
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {(user ? loggedInLinks : publicLinks).map((link) => (
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
            {user ? (
              <>
                <div className="-mx-1 flex items-center gap-1 pb-1">
                  <NavIconLink
                    href="/messages"
                    label="Mensajes"
                    count={unreadMessages}
                    showLabel
                    onNavigate={() => setOpen(false)}
                  >
                    <MailIcon width={18} height={18} />
                  </NavIconLink>
                  <NavIconLink
                    href="/notifications"
                    label="Notificaciones"
                    count={unreadNotifications}
                    showLabel
                    onNavigate={() => setOpen(false)}
                  >
                    <BellIcon width={18} height={18} />
                  </NavIconLink>
                </div>
                <ButtonLink
                  href={isBrand ? "/profile" : "/profile/settings"}
                  variant="secondary"
                  size="sm"
                >
                  Mi perfil
                </ButtonLink>
                {isBrand ? (
                  <ButtonLink href="/campaigns/new" variant="ghost" size="sm">
                    Publicar brief
                  </ButtonLink>
                ) : null}
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => {
                    setOpen(false);
                    startSignOut(() => signOut());
                  }}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-taupe hover:bg-white disabled:opacity-50"
                >
                  {signingOut ? "Saliendo..." : "Salir"}
                </button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="secondary" size="sm">
                  Ingresar
                </ButtonLink>
                <ButtonLink href="/register" variant="primary" size="sm">
                  Crear cuenta
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}