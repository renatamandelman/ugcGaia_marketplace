"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TagsInput } from "@/components/ui/tags-input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Field, SocialLinkField } from "@/components/settings/profile-form";
import type { Profile } from "@/lib/db-types";

const industries = [
  "Beauty",
  "Skincare",
  "Fashion",
  "Food & Bebidas",
  "Fitness & Salud",
  "Tech",
  "Lifestyle",
  "Travel",
  "Home & Deco",
  "Otro",
];

/**
 * Perfil de marca: mismo esquema que el del creador (banner + logo,
 * presentación, tags y redes) pero con industria y sitio web en lugar
 * de tarifa base.
 */
export function BrandProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.full_name || "");
  const [handle, setHandle] = useState(profile.handle || "");
  const [location, setLocation] = useState(profile.location || "");
  const [industry, setIndustry] = useState(profile.industry || "");
  const [website, setWebsite] = useState(profile.website || "");
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

  async function handleSave() {
    if (!name.trim()) {
      setError("El nombre de la marca es obligatorio.");
      return;
    }

    setSaving(true);
    setError(null);

    let normalizedWebsite = website.trim();
    if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) {
      normalizedWebsite = `https://${normalizedWebsite}`;
      setWebsite(normalizedWebsite);
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        handle: handle.trim() || null,
        location: location.trim() || null,
        industry: industry || null,
        website: normalizedWebsite || null,
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
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Identidad visual + datos */}
      <div className="rounded-2xl border border-bone bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-bone/40 pb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Perfil de la marca</h2>
            <p className="text-sm text-taupe">
              Así te ven los creadores cuando leen tus briefs.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar"}
          </Button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Banner + logo */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-ink">Banner & Logo</label>
          <div className="relative overflow-hidden rounded-2xl border border-bone bg-paper-deep">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="Banner" className="h-44 w-full object-cover" />
            ) : (
              <div className="h-44 bg-gradient-to-r from-brand to-brand-mid" />
            )}
            <div className="absolute right-3 top-3">
              <ImageUploader
                label="Cambiar banner"
                userId={profile.id}
                folder="banners"
                onUploaded={setBannerUrl}
              />
            </div>
            <div className="absolute bottom-6 left-6">
              <div className="relative">
                <div className="relative size-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name || "Logo"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-brand text-3xl font-bold text-white">
                      {(name || "M").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <ImageUploader
                    label="📷"
                    userId={profile.id}
                    folder="avatars"
                    onUploaded={setAvatarUrl}
                    variant="pill"
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-taupe">
            Las imágenes se suben al instante. Tocá Guardar para confirmar los cambios.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Nombre de la marca">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej: Gaia Skincare"
            />
          </Field>
          <Field label="Handle (opcional)">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="input-field"
              placeholder="@tu-marca"
            />
          </Field>
          <Field label="Industria">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccioná...</option>
              {industry && !industries.includes(industry) ? (
                <option value={industry}>{industry}</option>
              ) : null}
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe">
                📍
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field pl-10"
                placeholder="Ciudad, País"
              />
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Sitio web">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe">
                  🌐
                </span>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input-field pl-10"
                  placeholder="https://tumarca.com"
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label className="text-sm font-bold text-ink">Tags de tu marca (hasta 10)</label>
          <TagsInput
            defaultValue={tags}
            onChange={setTags}
            max={10}
            placeholder="Ej: skincare, eco, bienestar"
          />
          <p className="text-xs text-taupe">
            Así te encuentran los creadores que ya cubren estos temas.
          </p>
        </div>

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-ink">Sobre la marca</label>
            <span className="text-xs text-taupe">{bio.length} / 500</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            className="input-field resize-none leading-relaxed"
            placeholder="Contá qué hace tu marca, a quién le habla y qué tipo de contenido buscás."
          />
        </div>
      </div>

      {/* Redes */}
      <div className="rounded-2xl border border-bone bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-bone/40 pb-4">
          <h2 className="text-lg font-bold text-ink">Redes Sociales</h2>
          <p className="text-sm text-taupe">
            Los creadores revisan tus redes para entender el tono de la marca.
          </p>
        </div>
        <div className="space-y-3">
          <SocialLinkField
            platform="TikTok"
            placeholder="https://www.tiktok.com/@tu-marca"
            value={tiktokUrl}
            onChange={setTiktokUrl}
          />
          <SocialLinkField
            platform="Instagram"
            placeholder="https://www.instagram.com/tu-marca"
            value={instagramUrl}
            onChange={setInstagramUrl}
          />
          <SocialLinkField
            platform="YouTube"
            placeholder="https://www.youtube.com/@tu-marca"
            value={youtubeUrl}
            onChange={setYoutubeUrl}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
