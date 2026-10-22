"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/messages/actions";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const text = body.trim();
    if (!text || pending) return;

    setError(null);
    const formData = new FormData();
    formData.set("body", text);

    startTransition(async () => {
      const result = await sendMessage(conversationId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBody("");
      textareaRef.current?.focus();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Escribí tu mensaje… (Enter para enviar)"
          className="min-h-[44px] w-full resize-y rounded-xl border border-bone bg-paper/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:bg-white"
        />
        <button
          type="submit"
          disabled={pending || body.trim().length === 0}
          className="h-[44px] shrink-0 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
