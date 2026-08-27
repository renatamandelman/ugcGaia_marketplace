import type { ReactNode } from "react";
import { cn } from "./utils";

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 sm:mb-14 max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}