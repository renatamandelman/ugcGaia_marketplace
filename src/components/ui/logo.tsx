import Link from "next/link";
import { cn } from "./utils";

interface LogoProps {
  className?: string;
  /** tone="light" for dark (brand green) surfaces */
  tone?: "dark" | "light";
}

/**
 * GaiaUGC brand mark: brand (forest green) square + chartreuse spark + wordmark.
 * dark tone: Gaia in ink + UGC in brand-deep (olive, readable on paper).
 * light tone: Gaia in paper + UGC in gold (champagne, readable on green).
 */
export function Logo({ className, tone = "dark" }: LogoProps) {
  const wordmark = tone === "dark" ? "text-ink" : "text-paper";
  const ugc = tone === "dark" ? "text-brand" : "text-gold";

  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex size-9 items-center justify-center rounded-xl bg-brand shadow-sm shadow-brand/30"
        aria-hidden
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D4E33D"
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