"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MediaFolder = "banners" | "avatars" | "campaigns";

interface ImageUploaderProps {
  label: string;
  userId: string;
  folder: MediaFolder;
  onUploaded: (url: string) => void;
  /** "overlay": botón translúcido sobre un banner. "pill": botón chico blanco. "solid": botón normal sobre fondo claro. */
  variant?: "overlay" | "pill" | "solid";
}

const MAX_IMAGE_SIZE_MB = 5;

const variantClasses = {
  overlay:
    "rounded-lg border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/40 disabled:opacity-60",
  pill:
    "rounded-full border border-white/70 bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur-md transition-colors hover:bg-white disabled:opacity-60",
  solid:
    "rounded-xl border border-bone bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-paper-deep disabled:opacity-60",
};

/**
 * Sube una imagen al bucket público "media" de Supabase y devuelve la URL pública.
 * Avatares y banners se pisan por usuario (upsert); las imágenes de campañas
 * llevan timestamp para que cada brief tenga la suya.
 */
export function ImageUploader({
  label,
  userId,
  folder,
  onUploaded,
  variant = "overlay",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      if (!file.type.startsWith("image/")) {
        setUploadError("El archivo no es una imagen (JPG, PNG o WebP).");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setUploadError(
          `La imagen pesa más de ${MAX_IMAGE_SIZE_MB}MB. Comprimila y probá de nuevo.`
        );
        return;
      }

      const supabase = createClient();

      // Health-check del bucket: si no existe, el upload falla con mensajes confusos.
      const { error: listError } = await supabase.storage
        .from("media")
        .list(folder, { limit: 1 });

      if (listError) {
        setUploadError(
          "El bucket de imágenes (media) no está configurado todavía. Ejecutá supabase/media-storage.sql en Supabase → SQL Editor."
        );
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path =
        folder === "campaigns"
          ? `${folder}/${userId}-${Date.now()}.${ext}`
          : `${folder}/${userId}.${ext}`;

      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true });

      if (error) {
        setUploadError(`No se pudo subir la imagen: ${error.message}`);
        return;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      // Cache-busting: avatares y banners reusan el mismo path
      onUploaded(`${data.publicUrl}?v=${Date.now()}`);
    } finally {
      setUploading(false);
      // Reset del input para poder elegir el mismo archivo de nuevo
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={variantClasses[variant]}
      >
        {uploading ? "Subiendo..." : label}
      </button>
      {uploadError && (
        <p className="max-w-[240px] text-center text-[10px] font-semibold leading-tight text-red-500">
          {uploadError}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
