import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ember";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  /* Brand: el naranja de la marca, con texto en tinta (5.3:1 AA+) */
  primary:
    "bg-brand text-ink hover:bg-brand-hover focus-visible:outline-brand shadow-sm shadow-brand/25",
  /* Ember: botón luminoso (papel) para superficies oscuras */
  ember:
    "bg-paper text-ink hover:bg-white focus-visible:outline-brand shadow-sm shadow-ink/20",
  secondary:
    "bg-white text-ink ring-1 ring-inset ring-bone hover:bg-paper-deep hover:ring-brand/50 focus-visible:outline-brand",
  ghost:
    "bg-transparent text-taupe hover:bg-paper-deep hover:text-ink focus-visible:outline-brand",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer select-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}