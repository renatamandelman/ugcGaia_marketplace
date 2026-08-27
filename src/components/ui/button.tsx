import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ember";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  /* Bosque: el color de la marca, para las acciones que generan plata */
  primary:
    "bg-bosque text-white hover:bg-pino focus-visible:outline-brasa shadow-sm shadow-bosque/20",
  /* Crema: botón luminoso para superficies oscuras */
  ember:
    "bg-brasa text-white hover:bg-brasa-fuego focus-visible:outline-brasa shadow-sm shadow-brasa/30",
  secondary:
    "bg-white text-carbon ring-1 ring-inset ring-marfil hover:bg-crema hover:ring-oro focus-visible:outline-brasa",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-crema focus-visible:outline-brasa",
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