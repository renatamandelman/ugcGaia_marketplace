"use client";

import { useRef, useState } from "react";

interface TagsInputProps {
  /** Si se pasa, renderiza un hidden input con ese `name` para server actions */
  name?: string;
  defaultValue?: string[];
  placeholder?: string;
  /** Máximo de tags aceptados (default 8) */
  max?: number;
  /** Callback para uso con estado local (ej: settings) */
  onChange?: (tags: string[]) => void;
}

/** Normaliza igual que el trigger de la DB: minúscula, sin espacios, sin duplicados. */
function normalizeTags(raw: string[]): string[] {
  return [...new Set(raw.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export function TagsInput({
  name,
  defaultValue = [],
  placeholder = "Escribí un tag y apretá Enter",
  max = 8,
  onChange,
}: TagsInputProps) {
  const [tags, setTags] = useState<string[]>(() => normalizeTags(defaultValue));
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(next: string[]) {
    setTags(next);
    onChange?.(next);
  }

  function addTag(value: string) {
    const tag = value.trim().toLowerCase();
    if (!tag) return;
    if (tags.includes(tag)) {
      setDraft("");
      return;
    }
    if (tags.length >= max) return;
    commit([...tags, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    commit(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-bone bg-paper px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 text-brand/60 transition-colors hover:bg-brand/15 hover:text-brand"
              aria-label={`Quitar tag ${tag}`}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft && addTag(draft)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[140px] flex-1 bg-transparent text-sm text-ink placeholder-taupe outline-none"
        />
      </div>
      <span className="text-[11px] text-taupe">
        {tags.length}/{max} tags
      </span>

      {name ? (
        <input type="hidden" name={name} value={tags.join(",")} />
      ) : null}
    </>
  );
}