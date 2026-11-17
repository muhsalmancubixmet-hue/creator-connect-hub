import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { BadgeCheck, GitCompareArrows, MessageSquare, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { EmptyState } from "@/components/business/common";
import { Button } from "@/components/ui/button";
import { creators, formatFollowers, formatMoney, type Creator } from "@/data/mock";
import { getCreatorDetail, mapBackendCreatorToCreator } from "@/lib/business-api";

const searchSchema = z.object({ ids: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/compare")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Compare Influencers — Influencers.com Business" },
      {
        name: "description",
        content:
          "Compare creators side by side on followers, engagement, pricing, audience and past collaborations.",
      },
      { property: "og:title", content: "Compare Influencers — Influencers.com Business" },
      {
        property: "og:description",
        content: "Side-by-side creator comparison before you send a collaboration request.",
      },
    ],
  }),
  component: Compare,
});

function Compare() {
  const { ids } = Route.useSearch();
  const idList = ids
    ? ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const { data: liveCreators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ["compare-creators", idList],
    queryFn: async () => {
      if (idList.length === 0) return [];
      const results = await Promise.allSettled(
        idList.map(async (id) => {
          const detail = await getCreatorDetail(id);
          return mapBackendCreatorToCreator(detail);
        }),
      );
      return results
        .filter((r): r is PromiseFulfilledResult<Creator> => r.status === "fulfilled")
        .map((r) => r.value);
    },
    enabled: idList.length > 0,
  });

  // Blend live backend profiles with mock fallback if offline or testing demo IDs
  const selected: Creator[] =
    liveCreators.length > 0 ? liveCreators : creators.filter((c) => idList.includes(c.id));

  const rows: { label: string; render: (c: Creator) => React.ReactNode }[] = [
    { label: "Followers", render: (c) => formatFollowers(c.followers) },
    { label: "Engagement", render: (c) => `${c.engagement}%` },
    { label: "Location", render: (c) => c.location || "Kerala, India" },
    { label: "Category", render: (c) => (c.category as string) || "General" },
    {
      label: "Languages",
      render: (c) => (c.languages?.length ? c.languages.join(", ") : "English, Malayalam"),
    },
    {
      label: "Platforms",
      render: (c) =>
        c.socials?.length
          ? c.socials.map((s) => s.platform).join(", ")
          : c.mainPlatform || "Instagram",
    },
    {
      label: "Services",
      render: (c) =>
        c.services?.length ? c.services.map((s) => s.name).join(", ") : "Brand Collaborations",
    },
    {
      label: "Starting price",
      render: (c) => formatMoney(c.startingPrice || 0, c.currency || "INR"),
    },
    {
      label: "Audience",
      render: (c) =>
        c.audience
          ? `${c.audience.female}% female · ${c.audience.topAge} · ${c.audience.topCities?.[0] || "Kochi"}`
          : "Demographics available upon request",
    },
    {
      label: "Previous collaborations",
      render: (c) =>
        c.collaborations?.length ? c.collaborations.map((x) => x.brand).join(", ") : "—",
    },
    { label: "Response rate", render: (c) => `${c.responseRate || 95}%` },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Influencer comparison"
        subtitle="Compare up to four creators before you commit budget."
        actions={
          selected.length > 0 && (
            <Button
              className="rounded-xl"
              onClick={() =>
                toast.success(`Collaboration request drafted for ${selected.length} creators`)
              }
            >
              <MessageSquare className="size-4" /> Contact Selected Creators
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Loading creator comparison...</span>
        </div>
      ) : selected.length === 0 ? (
        <EmptyState
          icon={<GitCompareArrows className="size-5" />}
          title="No creators selected"
          description="Tick the Compare box on creator cards in Discover to build a comparison."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/discover">Discover influencers</Link>
            </Button>
          }
        />
      ) : (
        <div className="card-elevated overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-44 px-5 py-5 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Metric
                </th>
                {selected.map((c) => (
                  <th key={c.id} className="border-l border-border px-5 py-5 text-left">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="size-14 rounded-2xl object-cover shadow-soft"
                    />
                    <p className="mt-2 inline-flex items-center gap-1 font-display text-base font-semibold">
                      {c.name}
                      {c.verified && <BadgeCheck className="size-4 text-primary" />}
                    </p>
                    <p className="text-xs font-normal text-muted-foreground">{c.handle}</p>
                    <Button asChild size="sm" variant="outline" className="mt-3 rounded-lg">
                      <Link to="/creators/$creatorId" params={{ creatorId: c.id }}>
                        View profile
                      </Link>
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i % 2 ? "bg-secondary/40" : ""}>
                  <td className="px-5 py-3.5 font-medium text-muted-foreground">{r.label}</td>
                  {selected.map((c) => (
                    <td key={c.id} className="border-l border-border px-5 py-3.5">
                      {r.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
