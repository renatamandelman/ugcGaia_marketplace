import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { formatBudget } from "@/lib/format";
import {
  MAX_VERSIONS,
  canReviewDeliverable,
  canSubmitDeliverable,
  deliverableStatusLabel,
  fetchCollaborations,
  paymentStatusLabel,
  type CollaborationListItem,
} from "@/lib/collaborations";
import {
  CollaborationStatusBadge,
  PaymentStatusBadge,
} from "@/components/collaborations/collaboration-card";
import { DeliverableUploadForm } from "@/components/collaborations/deliverable-upload-form";
import { CollaborationReviewPanel } from "@/components/collaborations/collaboration-review-panel";
import { CancelCollaborationButton } from "@/components/collaborations/cancel-collaboration-button";
import { cn } from "@/components/ui/utils";
import type { DeliverableRow, DeliverableStatus } from "@/lib/db-types";

export const metadata = { title: "Colaboración — Gaia" };

function formatDate(iso: string | null): string {
  if (!iso) return "Sin fecha";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const deliverableStyles: Record<DeliverableStatus, string> = {
  submitted: "bg-violet-50 text-violet-700 ring-violet-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  changes_requested: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

function DeliverableCard({
  deliverable,
  fileUrl,
}: {
  deliverable: DeliverableRow;
  fileUrl: string | null;
}) {
  const link = deliverable.external_url || fileUrl;

  return (
    <article className="rounded-xl border border-bone bg-paper/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            Versión {deliverable.version}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
              deliverableStyles[deliverable.status]
            )}
          >
            {deliverableStatusLabel(deliverable.status)}
          </span>
        </div>
        <span className="text-xs text-taupe">
          {formatDateTime(deliverable.submitted_at)}
        </span>
      </div>

      {deliverable.notes ? (
        <p className="mt-2 whitespace-pre-line text-sm text-taupe">
          {deliverable.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {deliverable.external_url ? "Abrir link" : "Ver archivo"}
          </a>
        ) : (
          <span className="text-xs text-taupe">Sin archivo adjunto</span>
        )}
        {deliverable.file_path ? (
          <span className="text-[11px] text-taupe">
            Archivo privado en Storage
          </span>
        ) : null}
      </div>

      {deliverable.feedback ? (
        <div className="mt-3 rounded-lg border border-bone bg-white p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-taupe">
            Feedback de la marca
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink">
            {deliverable.feedback}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function briefDeliverableLines(collaboration: CollaborationListItem): string[] {
  const raw =
    collaboration.brief_snapshot.deliverables ||
    collaboration.brief_snapshot.description ||
    "";
  return raw
    .split("\n")
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

export default async function CollaborationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const collaborations = await fetchCollaborations(supabase, user.id);
  const collaboration = collaborations.find((row) => row.id === id);

  if (!collaboration) notFound();

  const isBrand = collaboration.brand_id === user.id;
  const isCreator = collaboration.creator_id === user.id;
  const other = isBrand ? collaboration.creator : collaboration.brand;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("application_id", collaboration.application_id)
    .maybeSingle();

  const signedUrls = new Map<string, string>();
  await Promise.all(
    collaboration.deliverables
      .filter((deliverable) => deliverable.file_path)
      .map(async (deliverable) => {
        const { data } = await supabase.storage
          .from("deliverables")
          .createSignedUrl(deliverable.file_path as string, 60 * 60);
        if (data?.signedUrl) signedUrls.set(deliverable.id, data.signedUrl);
      })
  );

  const latest = collaboration.latestDeliverable;
  const previous = collaboration.deliverables.slice(1);
  const versionsLeft = Math.max(
    0,
    MAX_VERSIONS - collaboration.versionsUsed
  );
  const showUpload = canSubmitDeliverable(collaboration, isCreator);
  const showReview = canReviewDeliverable(collaboration, isBrand);
  const title =
    collaboration.campaign?.title ||
    collaboration.brief_snapshot.title ||
    "Colaboración";
  const deliverablesList = briefDeliverableLines(collaboration);
  const canCancel =
    isBrand &&
    collaboration.status !== "approved" &&
    collaboration.status !== "cancelled";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/collaborations"
        className="text-sm font-medium text-taupe transition-colors hover:text-ink"
      >
        ← Volver a colaboraciones
      </Link>

      <header className="mt-4 flex flex-col gap-4 border-b border-bone pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CollaborationStatusBadge status={collaboration.status} />
            <PaymentStatusBadge status={collaboration.payment_status} />
            <span className="text-xs text-taupe">
              Creada el {formatDate(collaboration.created_at)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {isBrand ? "Con" : "Para"}{" "}
            <span className="font-medium text-ink">
              {other?.full_name || "Usuario de Gaia"}
            </span>
            {other?.handle ? ` · @${other.handle}` : ""}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-wide text-taupe">
            {isBrand ? "Pago retenido" : "Vas a recibir"}
          </p>
          <p className="text-2xl font-bold text-ink">
            {formatBudget(
              isBrand ? collaboration.amount : collaboration.creator_amount
            )}
          </p>
          <p className="text-xs text-taupe">
            {paymentStatusLabel(collaboration.payment_status)}
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-bone bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Brief congelado</h2>
            <p className="mt-1 text-xs text-taupe">
              Esta es la versión del brief al momento de aceptar la postulación.
            </p>

            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-ink">
              {collaboration.brief_snapshot.description ||
                "La marca no agregó una descripción."}
            </p>

            {deliverablesList.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-ink">
                  Entregables esperados
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {deliverablesList.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2 text-sm leading-6 text-taupe"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <dl className="mt-5 grid gap-3 border-t border-bone pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-taupe">Categoría</dt>
                <dd className="font-medium text-ink">
                  {collaboration.brief_snapshot.category ||
                    collaboration.campaign?.category ||
                    "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-taupe">Fecha de entrega</dt>
                <dd className="font-medium text-ink">
                  {formatDate(collaboration.deadline)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-taupe">Versiones</dt>
                <dd className="font-medium text-ink">
                  {collaboration.versionsUsed} de {MAX_VERSIONS} usadas
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Entregas</h2>
              {latest ? (
                <span className="text-xs text-taupe">
                  Última versión: {formatDateTime(latest.submitted_at)}
                </span>
              ) : null}
            </div>

            {!latest ? (
              <div className="mt-3 rounded-2xl border border-dashed border-bone bg-white p-8 text-center">
                <p className="text-sm font-semibold text-ink">
                  Todavía no hay entregas
                </p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-taupe">
                  {isCreator
                    ? "Cuando tengas el contenido listo, subilo desde acá."
                    : "El creador todavía no subió su primera versión."}
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <DeliverableCard
                  deliverable={latest}
                  fileUrl={signedUrls.get(latest.id) ?? null}
                />

                {previous.length > 0 ? (
                  <details className="mt-3 rounded-xl border border-bone bg-white p-4">
                    <summary className="cursor-pointer text-sm font-medium text-taupe">
                      Ver versiones anteriores ({previous.length})
                    </summary>
                    <div className="mt-3 space-y-3">
                      {previous.map((deliverable) => (
                        <DeliverableCard
                          key={deliverable.id}
                          deliverable={deliverable}
                          fileUrl={signedUrls.get(deliverable.id) ?? null}
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            )}

            <div className="mt-4 space-y-4">
              {showReview && latest ? (
                <CollaborationReviewPanel
                  collaborationId={collaboration.id}
                  deliverableId={latest.id}
                  isFinalVersion={collaboration.versionsUsed >= MAX_VERSIONS}
                />
              ) : null}

              {showUpload ? (
                <DeliverableUploadForm
                  collaborationId={collaboration.id}
                  creatorId={user.id}
                  versionsLeft={versionsLeft}
                />
              ) : null}

              {isCreator &&
              !showUpload &&
              collaboration.status !== "approved" &&
              collaboration.status !== "cancelled" ? (
                <div className="rounded-2xl border border-bone bg-white p-5 text-sm text-taupe">
                  {latest?.status === "submitted"
                    ? "Tu entrega está en revisión. Cuando la marca responda vas a recibir una notificación."
                    : `Usaste las ${MAX_VERSIONS} versiones disponibles. La marca tiene que aprobar o cancelar la colaboración.`}
                </div>
              ) : null}

              {collaboration.status === "approved" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold text-emerald-800">
                    Colaboración cerrada
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    La marca aprobó la entrega y el pago de{" "}
                    {formatBudget(collaboration.creator_amount)} fue liberado al
                    creador.
                  </p>
                </div>
              ) : null}

              {collaboration.status === "cancelled" ? (
                <div className="rounded-2xl border border-bone bg-paper-deep p-5">
                  <p className="text-sm font-semibold text-ink">
                    Colaboración cancelada
                  </p>
                  <p className="mt-1 text-sm text-taupe">
                    El pago retenido fue devuelto a la marca.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-bone bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Pago</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Monto acordado</dt>
                <dd className="font-medium text-ink">
                  {formatBudget(collaboration.amount)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-taupe">Comisión Gaia (6%)</dt>
                <dd className="font-medium text-ink">
                  {formatBudget(collaboration.commission_amount)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-bone pt-2.5">
                <dt className="font-medium text-ink">Neto creador</dt>
                <dd className="font-semibold text-brand">
                  {formatBudget(collaboration.creator_amount)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 rounded-xl bg-paper-deep p-3 text-xs leading-5 text-taupe">
              {collaboration.payment_status === "held"
                ? "El dinero está retenido por Gaia y se libera cuando aprobás la entrega."
                : collaboration.payment_status === "released"
                  ? "El pago ya fue liberado al creador."
                  : "El pago fue devuelto a la marca."}
            </div>
          </section>

          <section className="rounded-2xl border border-bone bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">
              {isBrand ? "Creador" : "Marca"}
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar
                name={other?.full_name || "Gaia"}
                src={other?.avatar_url ?? null}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {other?.full_name || "Usuario de Gaia"}
                </p>
                <p className="truncate text-xs text-taupe">
                  {other?.handle ? `@${other.handle}` : "Sin handle"}
                </p>
              </div>
            </div>

            {conversation ? (
              <Link
                href={`/messages/${conversation.id}`}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-xl bg-paper-deep text-sm font-medium text-ink transition-colors hover:bg-bone"
              >
                Ir al chat
              </Link>
            ) : null}
          </section>

          {canCancel ? (
            <section className="rounded-2xl border border-bone bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-ink">Zona sensible</h2>
              <p className="mt-1 text-xs leading-5 text-taupe">
                Si cancelás, se devuelve el pago retenido a tu wallet y el
                creador recibe una notificación.
              </p>
              <div className="mt-3">
                <CancelCollaborationButton
                  collaborationId={collaboration.id}
                />
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
