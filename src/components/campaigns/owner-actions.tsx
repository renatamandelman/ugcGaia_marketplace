"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteCampaign } from "@/app/campaigns/actions";
import { buttonClasses } from "@/components/ui/button";
import { EditIcon, TrashIcon } from "@/components/ui/icons";

interface CampaignOwnerActionsProps {
  campaignId: string;
}

/** Controles de la marca dueña sobre su campaña: editar y eliminar. */
export function CampaignOwnerActions({ campaignId }: CampaignOwnerActionsProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/campaigns/${campaignId}/edit`}
        className={buttonClasses("secondary", "sm")}
      >
        <EditIcon width={14} height={14} />
        Editar
      </Link>

      <form
        action={() => {
          startTransition(async () => {
            await deleteCampaign(campaignId);
          });
        }}
      >
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            if (!window.confirm("¿Eliminar esta campaña? Esta acción no se puede deshacer y borra sus postulaciones.")) {
              e.preventDefault();
            }
          }}
          className={buttonClasses(
            "ghost",
            "sm",
            "text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
          )}
        >
          <TrashIcon width={14} height={14} />
          {pending ? "Eliminando..." : "Eliminar"}
        </button>
      </form>
    </div>
  );
}
