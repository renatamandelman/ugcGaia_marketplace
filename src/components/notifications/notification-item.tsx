"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheckIcon,
  EditIcon,
  FileTextIcon,
  MailIcon,
  UsersIcon,
  VideoIcon,
  XIcon,
} from "@/components/ui/icons";
import { markNotificationRead } from "@/app/notifications/actions";
import type { NotificationRow, NotificationType } from "@/lib/db-types";

const icons: Record<NotificationType, React.ReactNode> = {
  application_received: <UsersIcon width={18} height={18} />,
  application_accepted: <BadgeCheckIcon width={18} height={18} />,
  application_rejected: <XIcon width={18} height={18} />,
  message_received: <MailIcon width={18} height={18} />,
  brief_available: <FileTextIcon width={18} height={18} />,
  deliverable_submitted: <VideoIcon width={18} height={18} />,
  deliverable_approved: <BadgeCheckIcon width={18} height={18} />,
  changes_requested: <EditIcon width={18} height={18} />,
  collaboration_cancelled: <XIcon width={18} height={18} />,
};

const iconStyles: Record<NotificationType, string> = {
  application_received: "bg-mint-light/50 text-brand",
  application_accepted: "bg-lime/30 text-brand",
  application_rejected: "bg-red-50 text-red-600",
  message_received: "bg-paper-deep text-brand-deep",
  brief_available: "bg-sky-50 text-sky-700",
  deliverable_submitted: "bg-violet-50 text-violet-700",
  deliverable_approved: "bg-lime/30 text-brand",
  changes_requested: "bg-amber-50 text-amber-700",
  collaboration_cancelled: "bg-red-50 text-red-600",
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;

  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationItem({
  notification,
}: {
  notification: NotificationRow;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unread = !notification.read_at;

  const open = () => {
    startTransition(async () => {
      if (unread) {
        await markNotificationRead(notification.id);
      }

      if (notification.link) {
        router.push(notification.link);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <li className="border-b border-bone/60 last:border-b-0">
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-paper/60 disabled:opacity-70 ${
          unread ? "bg-mint-light/10" : ""
        }`}
      >
        <span
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${iconStyles[notification.type]}`}
        >
          {icons[notification.type]}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={`truncate text-sm ${
                unread ? "font-semibold text-ink" : "font-medium text-taupe"
              }`}
            >
              {notification.title}
            </span>
            {unread ? (
              <span className="size-2 shrink-0 rounded-full bg-mint" />
            ) : null}
            <span className="ml-auto shrink-0 text-xs text-taupe/80">
              {formatWhen(notification.created_at)}
            </span>
          </span>
          {notification.body ? (
            <span className="mt-0.5 line-clamp-2 block text-sm leading-5 text-taupe">
              {notification.body}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
