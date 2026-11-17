import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, CalendarDays, MapPin, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { MatchBar } from "@/components/business/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  creatorById,
  currentBusiness,
  formatFollowers,
  formatMoney,
  requirements,
} from "@/data/mock";
import { getBusinessRequirementDetail } from "@/lib/business-api";

export const Route = createFileRoute("/requirements/$requirementId")({
  loader: async ({ params }) => {
    try {
      const data = await getBusinessRequirementDetail(params.requirementId);
      if (data && data.id) {
        return {
          requirement: {
            id: data.id,
            title: data.title,
            category: data.category_name || "General",
            budget: `${formatMoney((data.min_budget_cents || 0) / 100)} - ${formatMoney((data.max_budget_cents || 0) / 100)}`,
            creatorsNeeded: data.creators_needed || 1,
            location: data.location_text || "Worldwide",
            applications: data.applications_count || 0,
            status: data.status || "Active",
            posted: data.created_at ? data.created_at.split("T")[0] : "Recently",
            description: data.description || "Open creator hiring requirement.",
            deliverables: [],
            applicants: [],
            language: "Malayalam",
            platforms: ["Instagram", "YouTube"],
            minFollowers: 10000,
            minEngagement: 3.5,
            startDate: data.created_at ? data.created_at.split("T")[0] : "Immediate",
            deadline: data.deadline || "Open",
            instructions:
              data.description ||
              "Follow brand campaign guidelines and deliver agreed content on schedule.",
            matches: [] as Array<{ creatorId: string; match: number }>,
          },
        };
      }
    } catch {
      // Fallback
    }
    const requirement = requirements.find((r) => r.id === params.requirementId);
    if (!requirement) throw notFound();
    return { requirement };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Requirement not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const r = loaderData.requirement;
    return {
      meta: [
        { title: `${r.title} — Requirement` },
        { name: "description", content: r.description },
        { property: "og:title", content: `${r.title} — Requirement` },
        { property: "og:description", content: r.description },
      ],
    };
  },
  component: RequirementDetail,
});

function RequirementDetail() {
  const { requirement: r } = Route.useLoaderData();

  return (
    <AppShell>
      <PageHeader
        title={r.title}
        subtitle={`${r.applications} creators have applied so far.`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/requirements">All requirements</Link>
            </Button>
            <Button className="rounded-xl" onClick={() => toast.success("Applicants exported")}>
              Review applications
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3">
            <img src={currentBusiness.logo} alt="" className="size-12 rounded-xl object-cover" />
            <div>
              <p className="font-medium">{currentBusiness.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentBusiness.type} · {currentBusiness.location}
              </p>
            </div>
            <Badge className="ml-auto rounded-full bg-success/15 text-success">{r.status}</Badge>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{r.description}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            <Badge className="rounded-full bg-primary/10 text-primary">{r.category}</Badge>
            <Badge variant="secondary" className="rounded-full">
              {r.language}
            </Badge>
            {r.platforms.map((p) => (
              <Badge key={p} variant="secondary" className="rounded-full">
                {p}
              </Badge>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
              <p className="font-display text-xl font-semibold">
                {typeof r.budget === "string" ? r.budget : formatMoney(Number(r.budget) || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Creators required
              </p>
              <p className="font-display text-xl font-semibold">{r.creatorsNeeded}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="size-4" /> {r.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4" /> {formatFollowers(r.minFollowers)}+ followers ·{" "}
              {r.minEngagement}%+ engagement
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" /> {r.startDate} → {r.deadline}
            </div>
          </dl>

          <h3 className="mt-6 font-display text-sm font-semibold">Deliverables</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {r.deliverables.map((d) => (
              <Badge key={d} variant="secondary" className="rounded-full font-normal">
                {d}
              </Badge>
            ))}
          </div>

          <h3 className="mt-6 font-display text-sm font-semibold">Additional instructions</h3>
          <p className="mt-2 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
            {r.instructions}
          </p>
        </div>

        <div className="card-elevated p-5">
          <h2 className="font-display text-base font-semibold">
            Creators matching your requirement
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by category, location, audience and budget fit.
          </p>
          <div className="mt-4 space-y-4">
            {r.matches.map((m) => {
              const c = creatorById(m.creatorId);
              if (!c) return null;
              return (
                <div key={m.creatorId} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt="" className="size-11 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/creators/$creatorId"
                        params={{ creatorId: c.id }}
                        className="inline-flex items-center gap-1 text-sm font-medium hover:text-primary"
                      >
                        {c.name}
                        {c.verified && <BadgeCheck className="size-3.5 text-primary" />}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatFollowers(c.followers)} · {c.engagement}% · {c.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <MatchBar value={(m as any).match ?? (m as any).score ?? 90} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 rounded-xl">
                      <Link to="/creators/$creatorId" params={{ creatorId: c.id }}>
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => toast.success(`Invitation sent to ${c.name}`)}
                    >
                      <MessageSquare className="size-3.5" /> Invite
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
