import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, FileText, MapPin, Plus, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/data/mock";
import { getBusinessRequirements, type RequirementData } from "@/lib/business-api";

export const Route = createFileRoute("/requirements/")({
  head: () => ({
    meta: [
      { title: "Requirements — Influencers.com Business" },
      {
        name: "description",
        content:
          "Post what your business needs and let matching creators apply to your brief.",
      },
      { property: "og:title", content: "Requirements — Influencers.com Business" },
      { property: "og:description", content: "Post influencer requirements and review applicants." },
    ],
  }),
  component: Requirements,
});

export function RequirementCard({
  id,
  requirement,
}: {
  id?: string;
  requirement?: any;
}) {
  const r = requirement;
  if (!r) return null;

  const budget = r.budget ?? ((r.min_budget_cents || 0) / 100);
  const creatorsNeeded = r.creatorsNeeded ?? r.creators_needed ?? 1;
  const applications = r.applications ?? r.applications_count ?? 0;
  const deliverables = r.deliverables || [];
  const location = r.location || r.location_text || "Kerala, India";
  const deadline = r.deadline || "Open";

  return (
    <Link
      to="/requirements/$requirementId"
      params={{ requirementId: r.id }}
      className="card-elevated hover-lift flex flex-col p-5"
    >
      <div className="flex items-center justify-between">
        <Badge
          className={
            r.status === "Published" || r.status === "OPEN"
              ? "rounded-full bg-success/15 text-success"
              : r.status === "Draft"
                ? "rounded-full bg-secondary text-secondary-foreground"
                : "rounded-full bg-destructive/10 text-destructive"
          }
        >
          {r.status}
        </Badge>
        <span className="text-xs text-muted-foreground">{applications} applications</span>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold">{r.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
      {deliverables.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {deliverables.map((d: string) => (
            <Badge key={d} variant="secondary" className="rounded-full font-normal">
              {d}
            </Badge>
          ))}
        </div>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {location}
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" /> {creatorsNeeded} creators
        </div>
        <div className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" /> Due {deadline}
        </div>
        <div className="font-display font-semibold text-foreground">{formatMoney(budget, "INR")}</div>
      </dl>
    </Link>
  );
}

function Requirements() {
  const { data: apiReqs = [], isLoading } = useQuery({
    queryKey: ["business-requirements"],
    queryFn: getBusinessRequirements,
  });

  return (
    <AppShell>
      <PageHeader
        title="Requirements"
        subtitle="Tell creators what your business needs and let them come to you."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/requirements/new">
              <Plus className="size-4" /> Create Requirement
            </Link>
          </Button>
        }
      />

      <div className="card-elevated mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl gradient-accent text-accent-foreground">
            <FileText className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold">Creator Collaboration Pipeline</p>
            <p className="text-sm text-muted-foreground">
              Published requirements get responses from verified creators within 48 hours on average.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/discover">Invite creators directly</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading requirements...</div>
      ) : apiReqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground/40" />
          <h3 className="mt-3 font-display text-base font-semibold">No requirements posted yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a custom brief and verified creators will apply with pitches and quotes.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/requirements/new">
                <Plus className="size-4" /> Post Your First Requirement
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {apiReqs.map((r: any) => (
            <RequirementCard key={r.id} requirement={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
