import { cn } from "@/components/ui/utils";
import type { TimelineStep } from "@/lib/collaboration-timeline";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Visual timeline of a collaboration. Props are the steps from
 * `buildCollaborationTimeline` — this component only renders them.
 */
export function CollaborationTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative space-y-0" aria-label="Historial de la colaboración">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCurrent = step.state === "current";
        const isPending = step.state === "pending";

        return (
          <li key={`${step.title}-${index}`} className="relative flex gap-4">
            {/* Rail + marker */}
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[7px] top-5 h-[calc(100%-12px)] w-px",
                  step.state === "done" ? "bg-brand/40" : "bg-bone"
                )}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full ring-4 ring-white",
                step.state === "done" && "bg-brand",
                isCurrent && "bg-gold shadow-[0_0_0_3px_rgba(212,175,55,0.25)]",
                isPending && "bg-bone"
              )}
            />

            <div className="pb-6">
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isPending ? "text-taupe" : "text-ink"
                  )}
                >
                  {step.title}
                </p>
                {step.date ? (
                  <time className="text-xs text-taupe">
                    {formatDateTime(step.date)}
                  </time>
                ) : null}
                {isCurrent ? (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                    Actual
                  </span>
                ) : null}
              </div>

              {step.description ? (
                <p className="mt-0.5 text-sm text-taupe">{step.description}</p>
              ) : null}

              {step.actor ? (
                <p className="mt-0.5 text-xs text-taupe">
                  {step.actor}
                </p>
              ) : null}

              {step.feedback ? (
                <blockquote className="mt-2 max-w-md rounded-lg border-l-2 border-amber-400 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-ink">
                  {step.feedback}
                </blockquote>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
