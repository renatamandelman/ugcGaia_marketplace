"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  PortfolioItem,
  PortfolioPlatform,
  PortfolioMediaType,
} from "@/lib/db-types";
import { Button } from "@/components/ui/button";
import {
  VideoIcon,
  TrashIcon,
  EditIcon,
  ExternalLinkIcon,
  ImageIcon,
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
} from "@/components/ui/icons";

const platformColors: Record<PortfolioPlatform, string> = {
  tiktok: "bg-black text-white",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
  youtube: "bg-red-600 text-white",
  other: "bg-gray-600 text-white",
};

function PlatformIcon({
  platform,
  width = 12,
  height = 12,
}: {
  platform: PortfolioPlatform;
  width?: number;
  height?: number;
}) {
  switch (platform) {
    case "tiktok":
      return <TikTokIcon width={width} height={height} />;
    case "instagram":
      return <InstagramIcon width={width} height={height} />;
    case "youtube":
      return <YouTubeIcon width={width} height={height} />;
    default:
      return <span style={{ fontSize: width * 0.75 }}>🔗</span>;
  }
}

interface PortfolioListProps {
  creatorId: string;
  isOwner?: boolean;
}

export function PortfolioList({ creatorId, isOwner = true }: PortfolioListProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, [creatorId]);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });

    if (data) setItems(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este item del portfolio?")) return;

    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems(items.filter((item) => item.id !== id));
    }
  }

  function handleEdit(item: PortfolioItem) {
    setEditingItem(item);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingItem(null);
  }

  function handleSave(newItem: PortfolioItem) {
    if (editingItem) {
      setItems(items.map((item) => (item.id === newItem.id ? newItem : item)));
    } else {
      setItems([newItem, ...items]);
    }
    setShowForm(false);
    setEditingItem(null);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-bone bg-white p-6">
        <div className="flex items-center justify-center py-8">
          <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </div>
    );
  }

  const videoCount = items.filter((i) => i.media_type === "video").length;
  const imageCount = items.filter((i) => i.media_type === "image").length;

  return (
    <div className="rounded-2xl border border-bone bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Mi Portfolio</h2>
          <p className="mt-1 text-sm text-taupe">
            {items.length === 0
              ? "Videos e imágenes de tus trabajos"
              : `${videoCount} video${videoCount !== 1 ? "s" : ""} · ${imageCount} imagen${imageCount !== 1 ? "es" : ""}`}
          </p>
        </div>
        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            <span className="mr-1">+</span> Agregar
          </Button>
        )}
      </div>

      {showForm && (
        <PortfolioForm
          creatorId={creatorId}
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {items.length === 0 && !showForm ? (
        <div className="mt-6 rounded-xl border-2 border-dashed border-bone p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-paper-deep">
            <VideoIcon width={24} height={24} className="text-taupe" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink">
            {isOwner
              ? "Agregá links de tus videos de TikTok, Instagram o YouTube, o imágenes de tus trabajos"
              : "Este creador aún no agregó trabajos a su portfolio"}
          </p>
          {isOwner && (
            <p className="mt-1 text-xs text-taupe">
              Los trabajos ayudan a las marcas a ver tu estilo y calidad
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              isOwner={isOwner}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PortfolioItemCardProps {
  item: PortfolioItem;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function PortfolioItemCard({
  item,
  isOwner,
  onEdit,
  onDelete,
}: PortfolioItemCardProps) {
  const isVideo = item.media_type === "video";
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-bone bg-paper transition-all hover:shadow-md">
      <div className="aspect-video bg-brand/5">
        {isVideo ? (
          item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span
                className={`inline-flex size-12 items-center justify-center rounded-full ${platformColors[item.platform]}`}
              >
                <PlatformIcon platform={item.platform} width={22} height={22} />
              </span>
            </div>
          )
        ) : imageFailed ? (
          <div className="flex size-full items-center justify-center">
            <span className="text-4xl">🖼️</span>
          </div>
        ) : (
          <img
            src={item.media_url}
            alt={item.title}
            className="size-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-ink">{item.title}</h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-sm text-taupe">
                {item.description}
              </p>
            )}
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${platformColors[item.platform]}`}
          >
            <PlatformIcon platform={item.platform} width={12} height={12} />
            {item.platform}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <a
            href={item.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-deep hover:text-brand"
          >
            <ExternalLinkIcon width={14} height={14} />
            {isVideo ? "Ver video" : "Ver imagen"}
          </a>

          {isOwner && (
            <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-taupe hover:bg-paper-deep hover:text-ink"
                title="Editar"
              >
                <EditIcon width={14} height={14} />
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-taupe hover:bg-red-50 hover:text-red-600"
                title="Eliminar"
              >
                <TrashIcon width={14} height={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PortfolioFormProps {
  creatorId: string;
  item: PortfolioItem | null;
  onSave: (item: PortfolioItem) => void;
  onCancel: () => void;
}

function PortfolioForm({
  creatorId,
  item,
  onSave,
  onCancel,
}: PortfolioFormProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [mediaUrl, setMediaUrl] = useState(item?.media_url || "");
  const [mediaType, setMediaType] = useState<PortfolioMediaType>(
    item?.media_type || "video"
  );
  const [platform, setPlatform] = useState<PortfolioPlatform>(
    item?.platform || "tiktok"
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(item?.thumbnail_url || "");
  const [fetchingCover, setFetchingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function fetchCover() {
    if (!mediaUrl.trim()) {
      setCoverError("Pegá primero la URL del video");
      return;
    }
    setFetchingCover(true);
    setCoverError(null);
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(mediaUrl.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setCoverError(data.error || "No se pudo obtener la portada");
        return;
      }
      setThumbnailUrl(data.thumbnail_url);
    } catch {
      setCoverError("Error de conexión. Probá subir la portada manualmente.");
    } finally {
      setFetchingCover(false);
    }
  }

  async function uploadCoverFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
      setCoverError("Solo imágenes JPG, PNG o WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError("La portada debe pesar menos de 5MB");
      return;
    }
    setUploadingCover(true);
    setCoverError(null);
    const path = `portfolio-thumbs/${creatorId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      setCoverError(`Error al subir: ${uploadError.message}`);
      setUploadingCover(false);
      return;
    }
    const { data: publicData } = supabase.storage
      .from("media")
      .getPublicUrl(path);
    setThumbnailUrl(publicData.publicUrl);
    setUploadingCover(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!title.trim() || !mediaUrl.trim()) {
      setError("El título y la URL son obligatorios");
      setSaving(false);
      return;
    }

    const itemData = {
      creator_id: creatorId,
      title: title.trim(),
      description: description.trim() || null,
      media_type: mediaType,
      media_url: mediaUrl.trim(),
      platform,
      thumbnail_url: mediaType === "video" ? thumbnailUrl.trim() || null : null,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (item) {
      result = await supabase
        .from("portfolio_items")
        .update(itemData)
        .eq("id", item.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("portfolio_items")
        .insert(itemData)
        .select()
        .single();
    }

    if (result.error) {
      setError("Error al guardar. Intentá de nuevo.");
      setSaving(false);
      return;
    }

    onSave(result.data);
  }

  return (
    <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4">
      <h3 className="font-medium text-ink">
        {item ? "Editar trabajo" : "Agregar nuevo trabajo"}
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Tipo de media */}
        <div>
          <label className="block text-sm font-medium text-ink">
            Tipo de contenido
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                mediaType === "video"
                  ? "bg-brand text-white"
                  : "bg-white text-taupe ring-1 ring-bone hover:bg-paper-deep"
              }`}
            >
              <VideoIcon width={14} height={14} />
              Video
            </button>
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                mediaType === "image"
                  ? "bg-brand text-white"
                  : "bg-white text-taupe ring-1 ring-bone hover:bg-paper-deep"
              }`}
            >
              <ImageIcon width={14} height={14} />
              Imagen
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-ink">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-bone bg-white px-3 py-2 text-sm text-ink placeholder-taupe focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder={
              mediaType === "video"
                ? "Ej: Rutina de skincare para Lumina Skin"
                : "Ej: Foto producto — crema hidratante"
            }
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-ink"
          >
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-lg border border-bone bg-white px-3 py-2 text-sm text-ink placeholder-taupe focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder={
              mediaType === "video"
                ? "Breve descripción del video..."
                : "Breve descripción de la imagen..."
            }
          />
        </div>

        <div>
          <label
            htmlFor="mediaUrl"
            className="block text-sm font-medium text-ink"
          >
            {mediaType === "video" ? "URL del video *" : "URL de la imagen *"}
          </label>
          <input
            type="url"
            id="mediaUrl"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-bone bg-white px-3 py-2 text-sm text-ink placeholder-taupe focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder={
              mediaType === "video"
                ? "https://www.tiktok.com/@usuario/video/..."
                : "https://.../imagen.jpg"
            }
          />
          {mediaType === "image" && (
            <p className="mt-1 text-xs text-taupe">
              Pegá el link directo de una imagen (terminado en .jpg, .png, .webp...)
            </p>
          )}
        </div>

        {/* Plataforma — solo para videos */}
        {mediaType === "video" && (
          <div>
            <label className="block text-sm font-medium text-ink">
              Plataforma
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["tiktok", "instagram", "youtube", "other"] as const).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      platform === p
                        ? platformColors[p]
                        : "bg-white text-taupe ring-1 ring-bone hover:bg-paper-deep"
                    }`}
                  >
                    <span className="inline-flex items-center">
                      <PlatformIcon platform={p} width={14} height={14} />
                    </span>
                    <span className="capitalize">{p}</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Portada — solo para videos */}
        {mediaType === "video" && (
          <div>
            <label className="block text-sm font-medium text-ink">
              Portada del video
            </label>
            <p className="mt-0.5 text-xs text-taupe">
              Se muestra como previsualización en tu portfolio. Sin portada, se ve un
              placeholder genérico.
            </p>

            {thumbnailUrl ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-bone bg-white p-3">
                <img
                  src={thumbnailUrl}
                  alt="Portada"
                  className="h-24 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-brand">✓ Portada cargada</span>
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl("")}
                    className="text-left text-xs text-taupe underline hover:text-red-600"
                  >
                    Quitar portada
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={fetchCover}
                  disabled={fetchingCover}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" /><path d="M16 14v6" /><path d="M19 17h-6" /></svg>
                  {fetchingCover ? "Buscando portada..." : "Generar portada del link"}
                </button>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-bone bg-white px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-paper-deep disabled:opacity-50"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                  {uploadingCover ? "Subiendo..." : "Subir portada propia"}
                </button>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCoverFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {coverError && (
              <p className="mt-2 text-xs text-red-600">{coverError}</p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Guardando..." : item ? "Guardar cambios" : "Agregar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}