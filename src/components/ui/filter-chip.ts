import { cn } from "./utils";

/** Estilo único para los chips de filtro (categorías y tags) en las búsquedas. */
export function filterChipClasses(selected: boolean): string {
  return cn(
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    selected
      ? "bg-brand text-white shadow-sm shadow-brand/25"
      : "bg-white text-taupe ring-1 ring-inset ring-brand/45 hover:bg-brand/10"
  );
}

/** Los tags se guardan en minúscula; en los filtros se muestran con mayúscula inicial. */
export function filterLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
