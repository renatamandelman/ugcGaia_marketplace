"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitDeliverable } from "@/app/collaborations/actions";
import { MAX_FILE_SIZE_MB } from "@/lib/collaborations-shared";

interface DeliverableUploadFormProps {
  collaborationId: string;
  creatorId: string;
  versionsLeft: number;
}

export function DeliverableUploadForm({
  collaborationId,
  creatorId,
  versionsLeft,
}: DeliverableUploadFormProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedUrl = externalUrl.trim();
    if (!file && !trimmedUrl) {
      setError("Subí un archivo o pegá un link externo.");
      return;
    }

    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setError("El link tiene que empezar con http:// o https://");
      return;
    }

    if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setSending(true);
    let uploadedPath: string | null = null;

    try {
      if (file) {
        const supabase = createClient();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        uploadedPath = `${collaborationId}/${creatorId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("deliverables")
          .upload(uploadedPath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });

        if (uploadError) {
          setError(
            `No pudimos subir el archivo: ${uploadError.message}. Probá con un link externo.`
          );
          setSending(false);
          return;
        }
      }

      const result = await submitDeliverable(
        collaborationId,
        uploadedPath,
        trimmedUrl || null,
        notes.trim()
      );

      if (result.error) {
        if (uploadedPath) {
          const supabase = createClient();
          await supabase.storage.from("deliverables").remove([uploadedPath]);
        }
        setError(result.error);
        setSending(false);
        return;
      }

      setFile(null);
      setExternalUrl("");
      setNotes("");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-bone bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Subir entrega</h3>
          <p className="mt-1 text-sm text-taupe">
            Archivo de video hasta {MAX_FILE_SIZE_MB} MB o un link de TikTok,
            Drive, WeTransfer, etc.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-paper-deep px-2.5 py-1 text-xs font-medium text-taupe">
          {versionsLeft} {versionsLeft === 1 ? "versión" : "versiones"}{" "}
          disponibles
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-semibold text-ink">
            Archivo (opcional)
          </label>
          <input
            ref={fileInput}
            type="file"
            accept="video/*,image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1.5 block w-full cursor-pointer rounded-xl border border-bone bg-paper/50 px-3 py-2.5 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-hover"
          />
          {file ? (
            <p className="mt-1 text-xs text-taupe">
              {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="deliverable-url"
            className="text-sm font-semibold text-ink"
          >
            Link externo (opcional)
          </label>
          <input
            id="deliverable-url"
            type="url"
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://..."
            className="mt-1.5 w-full rounded-xl border border-bone bg-paper/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="deliverable-notes"
            className="text-sm font-semibold text-ink"
          >
            Notas para la marca (opcional)
          </label>
          <textarea
            id="deliverable-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Contale el concepto, los cambios que hiciste o cualquier detalle útil."
            className="mt-1.5 w-full resize-y rounded-xl border border-bone bg-paper/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:bg-white"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Enviando..." : "Enviar a la marca"}
      </button>
    </form>
  );
}
