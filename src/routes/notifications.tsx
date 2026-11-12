import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { NotificationItem } from "@/components/business/NotificationItem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getBusinessNotifications,
  markBusinessNotificationRead,
  type BusinessNotificationItem
} from "@/lib/business-api";
import type { AppNotification } from "@/data/mock";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Influencers.com Business" },
      {
        name: "description",
        content:
          "Creator responses, applications, messages, deadlines and content approvals in one feed.",
      },
      { property: "og:title", content: "Notifications — Influencers.com Business" },
      { property: "og:description", content: "Everything happening across your campaigns." },
    ],
  }),
  component: Notifications,
});

function mapKindToType(kind: string): AppNotification["type"] {
  switch (kind?.toUpperCase()) {
    case "CAMPAIGN":
      return "application";
    case "USER":
      return "message";
    case "VERIFICATION":
      return "approved";
    default:
      return "match";
  }
}

function formatNotificationTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recent";
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  } catch {
    return "Recent";
  }
}

function Notifications() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const queryClient = useQueryClient();

  const { data: rawNotifications = [], isLoading } = useQuery<BusinessNotificationItem[]>({
    queryKey: ["business-notifications"],
    queryFn: getBusinessNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markBusinessNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async (unreadIds: string[]) => {
      await Promise.allSettled(unreadIds.map((id) => markBusinessNotificationRead(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const notificationsList: AppNotification[] = rawNotifications.map((n) => ({
    id: n.id,
    type: mapKindToType(n.kind),
    title: n.title,
    body: n.message,
    time: formatNotificationTime(n.created_at),
    read: Boolean(n.is_read),
  }));

  const list =
    tab === "all" ? notificationsList : notificationsList.filter((n) => !n.read);

  const unreadItems = notificationsList.filter((n) => !n.read);

  const handleMarkAllRead = () => {
    if (unreadItems.length === 0) {
      toast.info("No unread notifications to mark");
      return;
    }
    markAllReadMutation.mutate(unreadItems.map((n) => n.id));
  };

  const handleItemClick = (notif: AppNotification) => {
    if (!notif.read) {
      markReadMutation.mutate(notif.id);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        subtitle="Creator responses, applications, deadlines and approvals."
        actions={
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={unreadItems.length === 0 || markAllReadMutation.isPending}
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="size-4" />{" "}
            {markAllReadMutation.isPending ? "Marking..." : "Mark all read"}
          </Button>
        }
      />

      <div className="mb-4 flex gap-2">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {t === "unread" && unreadItems.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold">
                {unreadItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card-elevated divide-y divide-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading notifications...
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Bell className="mx-auto size-8 text-muted-foreground/30 mb-2" />
            No {tab === "unread" ? "unread " : ""}notifications right now.
          </div>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className="cursor-pointer"
            >
              <NotificationItem notification={n} />
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
