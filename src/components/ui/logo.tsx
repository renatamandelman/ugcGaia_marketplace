import Link from "next/link";
import { cn } from "./utils";

interface LogoProps {
  className?: string;
}

/**
 * GaiaUGC brand mark: orange rounded square + wordmark.
 * Pure CSS, no image assets needed for the demo.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex size-9 items-center justify-center rounded-xl bg-brand-500 shadow-sm shadow-brand-500/30"
        aria-hidden
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* abstract "G" / spark */}
          <path d="M12 3l1.9 5.7a2 2 0 0 0 1.4 1.4L21 12l-5.7 1.9a2 2 0 0 0-1.4 1.4L12 21l-1.9-5.7a2 2 0 0 0-1.4-1.4L3 12l5.7-1.9a2 2 0 0 0 1.4-1.4L12 3Z" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-zinc-900">
        Gaia
        <span className="text-brand-500">UGC</span>
      </span>
    </Link>
  );
}