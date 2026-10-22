"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markThreadRead } from "@/app/notifications/actions";

/** Marca como leídos los avisos de mensajes de este hilo al abrirlo. */
export function MarkConversationRead({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    markThreadRead(conversationId).then((result) => {
      if (active && result.marked > 0) {
        router.refresh();
      }
    });

    return () => {
      active = false;
    };
  }, [conversationId, router]);

  return null;
}
