import Link from "next/link";
import { cn } from "./utils";

interface LogoProps {
  className?: string;
  /** tone="light" for dark surfaces (bosque backgrounds) */
  tone?: "dark" | "light";
}

/**
 * GaiaUGC brand mark: bosque (forest green) square + champán spark + wordmark.
 * dark tone: Gaia in carbon + UGC in ámbar (for light surfaces).
 * light tone: Gaia in crema + UGC in champán (for dark surfaces).
 */
export function Logo({ className, tone = "dark" }: LogoProps) {
  const wordmark = tone === "dark" ? "text-carbon" : "text-crema";
  const ugc = tone === "dark" ? "text-ambar" : "text-champan";

  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex size-9 items-center justify-center rounded-xl bg-bosque shadow-sm shadow-bosque/30"
        aria-hidden
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F2C778"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* abstract "G" / spark */}
          <path d="M12 3l1.9 5.7a2 2 0 0 0 1.4 1.4L21 12l-5.7 1.9a2 2 0 0 0-1.4 1.4L12 21l-1.9-5.7a2 2 0 0 0-1.4-1.4L3 12l5.7-1.9a2 2 0 0 0 1.4-1.4L12 3Z" />
        </svg>
      </span>
      <span className={cn("text-lg font-semibold tracking-tight", wordmark)}>
        Gaia
        <span className={ugc}>UGC</span>
      </span>
    </Link>
  );
}