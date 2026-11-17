import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  Megaphone,
  MessageSquare,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/business/AppShell";
import { CreatorGrid } from "@/components/business/CreatorCard";
import { CampaignStatusBadge, StatCard } from "@/components/business/common";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import {
  getDiscoverCreators,
  mapBackendCreatorToCreator,
  getBusinessCampaigns,
  getBusinessInquiries,
  getBusinessDashboardStats,
} from "@/lib/business-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Business Dashboard — Influencers.com" },
      {
        name: "description",
        content:
          "Your influencer marketing command centre: contacts, campaigns, shortlists and recommended creators.",
      },
      { property: "og:title", content: "Business Dashboard — Influencers.com" },
      {
        property: "og:description",
        content: "Find the right creators for your next campaign.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  {
    title: "Find Influencers",
    description: "Search the creator marketplace.",
    icon: Compass,
    to: "/discover" as const,
    tone: "primary",
  },
  {
    title: "Create Requirement",
    description: "Tell creators what your business needs.",
    icon: FileText,
    to: "/requirements/new" as const,
    tone: "accent",
  },
  {
    title: "Create Campaign",
    description: "Start managing a collaboration.",
    icon: Megaphone,
    to: "/campaigns" as const,
    tone: "primary",
  },
  {
    title: "Direct Messages",
    description: "Chat with creators & negotiate.",
    icon: MessageSquare,
    to: "/messages" as const,
    tone: "accent",
  },
];

function Dashboard() {
  const { business } = useAuth();

  const { data: creatorData } = useQuery({
    queryKey: ["dashboard-creators"],
    queryFn: async () => {
      const res = await getDiscoverCreators();
      return (res.results || []).map(mapBackendCreatorToCreator);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["business-dashboard-stats"],
    queryFn: getBusinessDashboardStats,
  });

  const { data: apiCampaigns = [] } = useQuery({
    queryKey: ["business-campaigns"],
    queryFn: getBusinessCampaigns,
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["business-inquiries"],
    queryFn: getBusinessInquiries,
  });

  const liveCreators = creatorData || [];
  const recommended = liveCreators.slice(0, 6);
  const companyName = business?.company_name || "Your Business";

  // Combine real campaigns and accepted collaborations
  const activeEngagements = [
    ...apiCampaigns.map((c) => ({
      id: c.id,
      name: c.title,
      category: c.category || c.category_name || "Campaign",
      status: c.status || "Published",
      budget: (c.total_budget_cents || 0) / 100,
      creatorsCount: c.creators_needed || 1,
      progress: 35,
      isDirect: false,
    })),
    ...inquiries.map((inq) => ({
      id: inq.id,
      name: inq.campaign || inq.subject,
      category: `Direct Partner · @${inq.creator_handle}`,
      status:
        inq.status === "ACCEPTED" ? "Accepted" : inq.status === "NEW" ? "Invited" : "In Progress",
      budget: inq.budget_cents ? inq.budget_cents / 100 : 0,
      creatorsCount: 1,
      progress: inq.status === "ACCEPTED" ? 50 : 20,
      isDirect: true,
    })),
  ].slice(0, 4);

  // Generate real activity feed from inquiries and campaigns
  const realActivities = inquiries.map((inq) => {
    const isAccepted = inq.status === "ACCEPTED";
    const inqBudgetNum = inq.budget_cents ? inq.budget_cents / 100 : 0;
    const formattedInqBudget = inqBudgetNum > 0 ? formatMoney(inqBudgetNum, "INR") : inq.budget;
    return {
      id: inq.id,
      title: isAccepted
        ? `${inq.creator_name} accepted collaboration proposal (${formattedInqBudget})`
        : `Proposal sent to ${inq.creator_name} for ${inq.campaign}`,
      time: inq.date || "Recent",
      isAccepted,
    };
  });

  const statItems = [
    {
      label: "Inquiries Sent",
      value: String(stats?.total_inquiries ?? inquiries.length),
      change: `${inquiries.length} total direct proposals`,
      tone: "primary" as const,
      icon: Send,
    },
    {
      label: "Active Campaigns",
      value: String(stats?.active_campaigns ?? apiCampaigns.length),
      change: `${apiCampaigns.length} live public campaigns`,
      tone: "accent" as const,
      icon: Megaphone,
    },
    {
      label: "Accepted Collabs",
      value: String(
        stats?.accepted_collaborations ?? inquiries.filter((i) => i.status === "ACCEPTED").length,
      ),
      change: "Ready for production",
      tone: "accent" as const,
      icon: CheckCircle2,
    },
    {
      label: "Total Budget",
      value: formatMoney(stats?.total_budget ?? 0, "INR"),
      change: "Allocated across initiatives",
      tone: "primary" as const,
      icon: Clock3,
    },
  ];

  return (
    <AppShell>
      <section className="card-elevated relative overflow-hidden p-6 lg:p-9">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-primary shadow-soft">
              <Sparkles className="size-3.5" /> Verified Creators on Influencers.com
            </span>
            <h1 className="mt-4 font-display text-[28px] font-semibold leading-tight lg:text-4xl">
              Good day, {companyName}
            </h1>
            <p className="mt-2 text-muted-foreground lg:text-lg">
              Manage your active influencer partnerships and discover regional talent.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl shadow-soft">
                <Link to="/discover">
                  Find Influencers <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-card">
                <Link to="/requirements/new">Create Requirement</Link>
              </Button>
            </div>
          </div>
          <div className="hidden shrink-0 lg:block">
            <div className="flex -space-x-4">
              {liveCreators.slice(0, 5).map((c) => (
                <img
                  key={c.id}
                  src={c.avatar}
                  alt={c.name}
                  className="size-16 rounded-2xl border-4 border-card object-cover shadow-soft"
                />
              ))}
            </div>
            <p className="mt-3 text-right text-sm text-muted-foreground">
              {liveCreators.length} verified creators available
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((s) => {
          const Icon = s.icon;
          return (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              change={s.change}
              tone={s.tone}
              icon={<Icon className="size-4.5" />}
            />
          );
        })}
      </div>

      <h2 className="mt-9 font-display text-lg font-semibold">Quick actions</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.title}
              to={a.to}
              className="card-elevated hover-lift group flex flex-col p-5"
            >
              <span
                className={
                  a.tone === "primary"
                    ? "grid size-11 place-items-center rounded-2xl gradient-primary text-primary-foreground"
                    : "grid size-11 place-items-center rounded-2xl gradient-accent text-accent-foreground"
                }
              >
                <Icon className="size-5" />
              </span>
              <p className="mt-4 font-display text-base font-semibold">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-9 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Active engagements</h2>
            <Link to="/campaigns" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {activeEngagements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                No active campaigns or collaborations yet.
              </div>
            ) : (
              activeEngagements.map((c) => (
                <Link
                  key={c.id}
                  to={c.isDirect ? "/messages" : "/campaigns"}
                  className="block rounded-2xl border border-border p-4 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-sm">{c.name}</p>
                    <CampaignStatusBadge status={c.status as any} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.category} · {formatMoney(c.budget, "INR")} · {c.creatorsCount}{" "}
                    {c.creatorsCount === 1 ? "creator" : "creators"}
                  </p>
                  <Progress value={c.progress} className="mt-3 h-1.5" />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Live activity feed</h2>
            <Link to="/messages" className="text-sm font-medium text-primary hover:underline">
              Inbox
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {realActivities.length === 0 ? (
              <li className="py-8 text-center text-xs text-muted-foreground">
                No recent brand activity.
              </li>
            ) : (
              realActivities.slice(0, 5).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span
                    className={
                      n.isAccepted
                        ? "mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                    }
                  >
                    {n.isAccepted ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <MessageSquare className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{n.title}</p>
                    <p className="text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-9 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Recommended influencers</h2>
          <p className="text-sm text-muted-foreground">
            Regional creators registered on Influencers.com
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/discover">
            <Users className="size-4" /> Browse all
          </Link>
        </Button>
      </div>
      <div className="mt-4">
        {recommended.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground">
            No creators match criteria yet.
          </div>
        ) : (
          <CreatorGrid creators={recommended} />
        )}
      </div>
    </AppShell>
  );
}
