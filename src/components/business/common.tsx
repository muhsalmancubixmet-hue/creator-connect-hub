import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/data/mock";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="card-elevated flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        {icon ?? <Inbox className="size-5" />}
      </span>
      <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-elevated p-5">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="mt-4 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
          <Skeleton className="mt-4 h-16 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

const statusTone: Record<CampaignStatus, string> = {
  Draft: "bg-secondary text-secondary-foreground",
  Published: "bg-primary/10 text-primary",
  Applications: "bg-chart-4/15 text-foreground",
  Shortlisted: "bg-primary/10 text-primary",
  Invited: "bg-accent-soft text-accent",
  Accepted: "bg-success/15 text-success",
  "In Progress": "bg-accent/15 text-accent",
  "Content Submitted": "bg-warning/25 text-warning-foreground",
  Approved: "bg-success/15 text-success",
  Completed: "bg-success/20 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function CampaignStatusBadge({
  status,
  className,
}: {
  status: CampaignStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        statusTone[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
  tone?: "primary" | "accent" | "warning";
}) {
  return (
    <div className="card-elevated hover-lift p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl",
              tone === "primary" && "bg-primary/10 text-primary",
              tone === "accent" && "bg-accent-soft text-accent",
              tone === "warning" && "bg-warning/25 text-warning-foreground",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {change && <p className="mt-1 text-xs text-muted-foreground">{change}</p>}
    </div>
  );
}

export function MatchBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full gradient-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="shrink-0 font-display text-xs font-semibold">{value}% Match</span>
    </div>
  );
}
