import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe2,
  GitCompareArrows,
  LayoutGrid,
  Map as MapIcon,
  Search,
  SearchX,
  SplitSquareHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDiscoverCreators, mapBackendCreatorToCreator } from "@/lib/business-api";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { CreatorGrid } from "@/components/business/CreatorCard";
import { EmptyState } from "@/components/business/common";
import {
  applyFilters,
  defaultFilters,
  FilterDrawer,
  FilterPanel,
  type Filters,
  type SortKey,
} from "@/components/business/FilterPanel";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CreatorMap } from "@/components/business/CreatorMap";
import { CreatorCard } from "@/components/business/CreatorCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { creators } from "@/data/mock";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Influencers — Influencers.com Business" },
      {
        name: "description",
        content:
          "Discover influencers anywhere in the world — filter by country, city, radius, category, language, platform, followers, engagement and budget.",
      },
      { property: "og:title", content: "Discover Influencers — Influencers.com Business" },
      {
        property: "og:description",
        content: "Discover creators worldwide by location, category, platform and budget.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "map" | "split">("split");
  const [focusId, setFocusId] = useState<string | null>(null);

  const { data: creatorData, isLoading } = useQuery({
    queryKey: [
      "creators",
      filters.query,
      filters.categories,
      filters.cities,
      filters.near?.label,
      filters.followers,
      filters.platforms,
    ],
    queryFn: async () => {
      const payload: Parameters<typeof getDiscoverCreators>[0] = {
        ...(filters.query ? { search: filters.query } : {}),
        ...(filters.categories[0] ? { category: filters.categories[0] } : {}),
        ...(filters.near?.label || filters.cities[0]
          ? { location: filters.near?.label || filters.cities[0] }
          : {}),
        min_followers: filters.followers[0],
        ...(filters.followers[1] < 1000000 ? { max_followers: filters.followers[1] } : {}),
        ...(filters.platforms[0] ? { platform: filters.platforms[0] } : {}),
      };
      const res = await getDiscoverCreators(payload);
      return (res.results || []).map(mapBackendCreatorToCreator);
    },
  });

  const apiCreators = creatorData || [];
  const results = useMemo(
    () => applyFilters(apiCreators, filters, sort),
    [apiCreators, filters, sort],
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    );

  return (
    <AppShell>
      <PageHeader
        title="Discover Influencers"
        subtitle="Discover influencers anywhere in the world. Demo data includes a Kerala sample market plus global creators."
      />

      <div className="grid gap-6 lg:grid-cols-[288px_1fr]">
        <aside className="hidden lg:block">
          <div className="card-elevated sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-5 scrollbar-thin">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
          </div>
        </aside>

        <div>
          <div className="card-elevated flex flex-wrap items-center gap-3 p-3">
            <div className="relative w-full min-w-[220px] flex-1 sm:w-auto">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search by name, category, location, keyword or service"
                className="h-11 rounded-xl border-transparent bg-secondary/60 pl-9"
              />
            </div>
            <FilterDrawer
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as typeof view)}
              className="rounded-xl bg-secondary/60 p-1"
            >
              <ToggleGroupItem value="list" aria-label="List view" className="rounded-lg">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="split"
                aria-label="Split view"
                className="hidden rounded-lg md:inline-flex"
              >
                <SplitSquareHorizontal className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="map" aria-label="Map view" className="rounded-lg">
                <MapIcon className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-11 w-[168px] rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="recent">Recently active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{results.length}</span> creators found
            </p>
            {selected.length > 0 && (
              <Button asChild className="rounded-xl">
                <Link to="/compare" search={{ ids: selected.join(",") }}>
                  <GitCompareArrows className="size-4" /> Compare {selected.length}
                </Link>
              </Button>
            )}
          </div>

          {view !== "list" && (
            <div className="mt-4">
              <CreatorMap
                creators={results}
                center={filters.near}
                radiusKm={filters.near ? filters.radiusKm : 0}
                selectedId={focusId}
                onSelect={setFocusId}
                className={
                  view === "map"
                    ? "relative isolate h-[65vh] overflow-hidden rounded-2xl border border-border"
                    : "relative isolate h-[300px] overflow-hidden rounded-2xl border border-border lg:h-[380px]"
                }
              />
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe2 className="size-3.5" /> Zoom, pan and tap a creator. Nearby creators cluster
                automatically.
              </p>
              {focusId && results.find((c) => c.id === focusId) && (
                <div className="mt-3 max-w-sm">
                  <CreatorCard creator={results.find((c) => c.id === focusId)!} />
                </div>
              )}
            </div>
          )}

          <div className={view === "map" ? "hidden" : "mt-4"}>
            {results.length ? (
              <CreatorGrid
                creators={results}
                selectable
                selectedIds={selected}
                onSelect={toggleSelect}
              />
            ) : (
              <EmptyState
                icon={<SearchX className="size-5" />}
                title="No creators match these filters"
                description="Try widening the follower range, widening the search radius or clearing a few filters."
                action={
                  <Button className="rounded-xl" onClick={() => setFilters(defaultFilters)}>
                    Reset filters
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
