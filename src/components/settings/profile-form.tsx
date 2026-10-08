"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TagsInput } from "@/components/ui/tags-input";
import { TikTokIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/icons";
import type { Profile } from "@/lib/db-types";

interface ProfileSettingsFormProps {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [name, setName] = useState(profile.full_name || "");
  const [handle, setHandle] = useState(profile.handle || "");
  const [location, setLocation] = useState(profile.location || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktok_url || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagram_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url || "");
  const [tags, setTags] = useState<string[]>(profile.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        handle: handle.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        banner_url: bannerUrl || null,
        tags,
        tiktok_url: tiktokUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError("Error al guardar. Intentá de nuevo.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function resetForm() {
    setName(profile.full_name || "");
    setHandle(profile.handle || "");
    setLocation(profile.location || "");
    setBio(profile.bio || "");
    setAvatarUrl(profile.avatar_url || "");
    setBannerUrl(profile.banner_url || "");
    setTiktokUrl(profile.tiktok_url || "");
    setInstagramUrl(profile.instagram_url || "");
    setYoutubeUrl(profile.youtube_url || "");
    setTags(profile.tags ?? []);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-bone bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Configuración del Perfil
          </h1>
          <p className="mt-1 text-sm text-taupe">
            Gestioná cómo te ven las marcas, actualizá rate cards y curá tus mejores assets UGC.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={`/profile/portfolio/${profile.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
              Preview Portfolio
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              "Guardando..."
            ) : saved ? (
              "✓ Guardado"
            ) : (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Section 1: Public Display & Bio */}
      <div className="rounded-2xl border border-bone bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-bone/40 pb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Display Público & Bio</h2>
            <p className="text-sm text-taupe">
              Tu presentación principal ante marcas verificadas.
            </p>
          </div>
          <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-medium text-taupe">
            Vista pública
          </span>
        </div>

        {/* Banner + Avatar zone */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-ink">Banner & Foto de Perfil</label>
          <div className="relative overflow-hidden rounded-2xl border border-bone bg-paper-deep">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerUrl}
                alt="Banner"
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="h-44 bg-gradient-to-r from-brand to-brand-mid" />
            )}
            {/* Botón para cambiar banner */}
            <div className="absolute right-3 top-3">
              <ImageUploader
                label="Cambiar banner"
                userId={profile.id}
                folder="banners"
                onUploaded={setBannerUrl}
              />
            </div>
            <div className="absolute bottom-6 left-6 flex items-end gap-4">
              <div className="relative">
                <div className="relative size-24 overflow-hidden rounded-2xl border-4 border-white shadow-md">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name || "Avatar"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-brand text-3xl font-bold text-white">
                      {(name || profile.full_name || "G").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Botón para cambiar avatar */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <ImageUploader
                    label="📷"
                    userId={profile.id}
                    folder="avatars"
                    onUploaded={setAvatarUrl}
                    compact
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-taupe">
            {bannerUrl || avatarUrl
              ? "Las imágenes se suben al instante. Tocá Guardar para confirmar los cambios."
              : "Subí tu banner y foto de perfil: se guardan en Supabase para que las marcas te vean así."}
          </p>
        </div>

        {/* Form fields */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Nombre para mostrar">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre o marca"
            />
          </Field>
          <Field label="Handle (opcional)">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="input-field"
              placeholder="@tu-usuario"
            />
            <p className="mt-1 text-xs text-taupe">
              Sin los links de tus redes todavía no hay URL del marketplace. Tus handles van en Redes & Métricas.
            </p>
          </Field>
          <Field label="Ubicación">
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-taupe">📍</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field pl-10"
                placeholder="Ciudad, País"
              />
            </div>
          </Field>
        </div>

        {/* Tags */}
        <div className="mt-5 space-y-2">
          <label className="text-sm font-bold text-ink">
            Tags de contenido (hasta 10)
          </label>
          <TagsInput
            defaultValue={tags}
            onChange={setTags}
            max={10}
            placeholder="Ej: skincare, unboxing, antes/después, reviews"
          />
          <p className="text-xs text-taupe">
            Las marcas te buscan por estos tags en la exploración. Cuanto más
            específicos, mejor el matchmaking con las campañas.
          </p>
        </div>

        {/* Bio */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-ink">Habla de ti</label>
            <span className="text-xs text-taupe">{bio.length} / 300</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            className="input-field resize-none leading-relaxed"
            placeholder="Contá a las marcas quién sos y qué hacés..."
          />
        </div>
      </div>

      {/* Section 2: Connected Social Accounts */}
      <div className="rounded-2xl border border-bone bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-bone/40 pb-4">
          <h2 className="text-lg font-bold text-ink">Redes Sociales</h2>
          <p className="text-sm text-taupe">
            Pegá el link real de tus perfiles. Las marcas los ven en tu portfolio público y pueden contactarte directo.
          </p>
        </div>

        <div className="space-y-3">
          <SocialLinkField
            platform="TikTok"
            placeholder="https://www.tiktok.com/@tu-usuario"
            value={tiktokUrl}
            onChange={setTiktokUrl}
          />
          <SocialLinkField
            platform="Instagram"
            placeholder="https://www.instagram.com/tu-usuario"
            value={instagramUrl}
            onChange={setInstagramUrl}
          />
          <SocialLinkField
            platform="YouTube"
            placeholder="https://www.youtube.com/@tu-canal"
            value={youtubeUrl}
            onChange={setYoutubeUrl}
          />
        </div>
      </div>

      {/* Acciones finales */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={resetForm}>
          Descartar cambios
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

interface ImageUploaderProps {
  label: string;
  userId: string;
  folder: "banners" | "avatars";
  onUploaded: (url: string) => void;
  compact?: boolean;
}

const MAX_IMAGE_SIZE_MB = 5;

function ImageUploader({
  label,
  userId,
  folder,
  onUploaded,
  compact = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    // Validación local antes de tocar la red
    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo no es una imagen (JPG, PNG o WebP).");
      setUploading(false);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setUploadError(
        `La imagen pesa más de ${MAX_IMAGE_SIZE_MB}MB. Comprimila y probá de nuevo.`
      );
      setUploading(false);
      return;
    }

    // Health-check del bucket: si no existe, el upload falla con
    // mensajes confusos. Mejor avisar antes.
    const { error: listError } = await supabase.storage
      .from("media")
      .list(folder, { limit: 1 });

    if (listError) {
      setUploadError(
        "El bucket de imágenes (media) no está configurado todavía. Ejecutá supabase/media-storage.sql en Supabase → SQL Editor."
      );
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${userId}.${ext}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (error) {
      setUploadError(`No se pudo subir la imagen: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);

    // Reset del input para poder elegir el mismo archivo de nuevo
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={
          compact
            ? "rounded-full border border-white/70 bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur-md transition-colors hover:bg-white disabled:opacity-60"
            : "rounded-lg border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/40 disabled:opacity-60"
        }
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-ink">{label}</label>
      {children}
    </div>
  );
}

function SocialLinkField({
  platform,
  placeholder,
  value,
  onChange,
}: {
  platform: "TikTok" | "Instagram" | "YouTube";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const connected = value.trim().length > 0;
  const platformColors: Record<string, string> = {
    TikTok: "bg-black text-white",
    Instagram: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
    YouTube: "bg-red-600 text-white",
  };

  async function normalizeUrl() {
    // Si pegó solo el handle (@usuario), completar el link de la red
    const trimmed = value.trim();
    if (!trimmed.startsWith("http")) {
      if (platform === "TikTok") {
        onChange(`https://www.tiktok.com/@${trimmed.replace(/^@/, "")}`);
      } else if (platform === "Instagram") {
        onChange(`https://www.instagram.com/${trimmed.replace(/^@/, "")}`);
      } else {
        onChange(`https://www.youtube.com/@${trimmed.replace(/^@/, "")}`);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-bone bg-paper p-3.5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-52">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${platformColors[platform]}`}>
          <span className="flex size-6 items-center justify-center">
            <SocialPlatformIcon platform={platform} width={20} height={20} />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{platform}</span>
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
            connected ? "bg-mint/50 text-brand" : "bg-bone/40 text-taupe"
          }`}>
            {connected ? "Conectada" : "Sin conectar"}
          </span>
        </div>
      </div>
      <div className="flex w-full flex-1 items-center gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={normalizeUrl}
          placeholder={placeholder}
          className="input-field w-full flex-1"
        />
        {connected && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-brand hover:text-brand-deep"
          >
            Abrir ↗
          </a>
        )}
      </div>
    </div>
  );
}

function SocialPlatformIcon({
  platform,
  width = 20,
  height = 20,
}: {
  platform: "TikTok" | "Instagram" | "YouTube";
  width?: number;
  height?: number;
}) {
  switch (platform) {
    case "TikTok":
      return <TikTokIcon width={width} height={height} />;
    case "Instagram":
      return <InstagramIcon width={width} height={height} />;
    case "YouTube":
      return <YouTubeIcon width={width} height={height} />;
  }
}