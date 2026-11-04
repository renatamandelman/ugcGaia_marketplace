import { cn } from "./utils";

/**
 * Insignia de cuenta premium.
 * Usa el dorado de la marca (gold/spark) para diferenciarse sin romper la paleta.
 */
export function PremiumBadge({
  className,
  label = "Premium",
  size = "sm",
}: {
  className?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold/90 font-bold uppercase tracking-wide text-ink ring-1 ring-inset ring-brand/10",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      title="Cuenta Premium"
    >
      <svg
        width={size === "sm" ? 10 : 12}
        height={size === "sm" ? 10 : 12}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
      {label}
    </span>
  );
}
