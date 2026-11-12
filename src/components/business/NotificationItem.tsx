import {
  Bell,
  CalendarClock,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  UploadCloud,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AppNotification } from "@/data/mock";

const icons = {
  invitation: CheckCircle2,
  application: UserPlus,
  message: MessageSquare,
  deadline: CalendarClock,
  submitted: UploadCloud,
  approved: CheckCircle2,
  match: Sparkles,
  requirement: FileText,
} as const;

export function NotificationItem({
  notification,
  compact = false,
}: {
  notification: AppNotification;
  compact?: boolean;
}) {
  const Icon = icons[notification.type] ?? Bell;
  return (
    <div
      className={cn(
        "flex gap-3 px-4 transition-colors hover:bg-secondary/60",
        compact ? "py-3" : "py-4",
        !notification.read && "bg-primary-soft/40",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          notification.read ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{notification.title}</p>
        <p className={cn("text-xs text-muted-foreground", compact ? "truncate" : "mt-0.5")}>
          {notification.body}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{notification.time}</p>
      </div>
      {!notification.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" />}
    </div>
  );
}
