"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { buttonClasses } from "@/components/ui/button";
import { EditIcon } from "@/components/ui/icons";
import type { Profile } from "@/lib/db-types";

interface CollapsibleProfileFormProps {
  profile: Profile | null;
}

/** Panel de datos del perfil plegado tras un botón "Configurar perfil". */
export function CollapsibleProfileForm({ profile }: CollapsibleProfileFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-bone bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Tu perfil</h2>
          <p className="mt-1 text-sm text-taupe">
            {open
              ? "Editá tus datos y guardá los cambios."
              : "Nombre, industria, sitio web y datos de la cuenta."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={buttonClasses("secondary", "sm")}
          aria-expanded={open}
        >
          <EditIcon width={14} height={14} />
          {open ? "Ocultar" : "Configurar perfil"}
        </button>
      </div>

      {open ? (
        <div className="mt-6 [&>div]:border-0 [&>div]:p-0">
          <ProfileForm profile={profile} />
        </div>
      ) : null}
    </div>
  );
}
