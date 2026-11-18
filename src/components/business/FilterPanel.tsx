import { SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  CATEGORIES,
  LANGUAGES,
  PLATFORMS,
  SERVICES,
  formatFollowers,
  formatMoney,
  creators as allCreators,
  type Creator,
} from "@/data/mock";
import { distanceKm } from "@/data/geo";
import { toUSD } from "@/lib/currency";
import { LocationSearch, type PickedLocation } from "./LocationSearch";

export interface Filters {
  query: string;
  categories: string[];
  countries: string[];
  regions: string[];
  cities: string[];
  near: PickedLocation | null;
  radiusKm: number;
  remoteOnly: boolean;
  languages: string[];
  platforms: string[];
  services: string[];
  followers: [number, number];
  minEngagement: number;
  budget: [number, number];
  verifiedOnly: boolean;
  connectedOnly: boolean;
}

/** Budget filter is stored in USD so it works across creator currencies. */
export const BUDGET_MAX_USD = 3000;

export const defaultFilters: Filters = {
  query: "",
  categories: [],
  countries: [],
  regions: [],
  cities: [],
  near: null,
  radiusKm: 50,
  remoteOnly: false,
  languages: [],
  platforms: [],
  services: [],
  followers: [0, 1000000],
  minEngagement: 0,
  budget: [0, BUDGET_MAX_USD],
  verifiedOnly: false,
  connectedOnly: false,
};

export type SortKey = "relevance" | "followers" | "engagement" | "price" | "recent";

export function applyFilters(creators: Creator[], f: Filters, sort: SortKey): Creator[] {
  const q = f.query.trim().toLowerCase();
  const list = creators.filter((c) => {
    if (
      q &&
      ![
        c.name,
        c.handle,
        c.category,
        c.location,
        c.geo.country,
        c.geo.region ?? "",
        c.bio,
        ...c.services.map((s) => s.name),
        ...c.secondaryCategories,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
      return false;
    if (
      f.categories.length &&
      !f.categories.some(
        (cat) => c.category === cat || c.secondaryCategories.includes(cat as never),
      )
    )
      return false;
    if (f.countries.length && !f.countries.includes(c.geo.country)) return false;
    if (f.regions.length && !(c.geo.region && f.regions.includes(c.geo.region))) return false;
    if (f.cities.length && !f.cities.includes(c.geo.city)) return false;
    if (f.near && distanceKm(f.near, c.geo) > f.radiusKm) return false;
    if (f.remoteOnly && !c.remote) return false;
    if (f.languages.length && !f.languages.some((l) => c.languages.includes(l as never)))
      return false;
    if (f.platforms.length && !f.platforms.some((p) => c.socials.some((s) => s.platform === p)))
      return false;
    if (f.services.length && !f.services.some((s) => c.services.some((cs) => cs.name === s)))
      return false;
    if (c.followers < f.followers[0] || (f.followers[1] < 1000000 && c.followers > f.followers[1]))
      return false;
    if (c.engagement < f.minEngagement) return false;
    const usd = toUSD(c.startingPrice, c.currency);
    if (usd < f.budget[0] || (f.budget[1] < BUDGET_MAX_USD && usd > f.budget[1])) return false;
    if (f.verifiedOnly && !c.verified) return false;
    if (f.connectedOnly && !c.socialConnected) return false;
    return true;
  });

  const sorted = [...list];
  if (sort === "followers") sorted.sort((a, b) => b.followers - a.followers);
  if (sort === "engagement") sorted.sort((a, b) => b.engagement - a.engagement);
  if (sort === "price")
    sorted.sort((a, b) => toUSD(a.startingPrice, a.currency) - toUSD(b.startingPrice, b.currency));
  if (sort === "recent") sorted.sort((a, b) => a.lastActiveDays - b.lastActiveDays);
  return sorted;
}

export function countActive(f: Filters) {
  return (
    f.categories.length +
    f.countries.length +
    f.regions.length +
    f.cities.length +
    (f.near ? 1 : 0) +
    (f.remoteOnly ? 1 : 0) +
    f.languages.length +
    f.platforms.length +
    f.services.length +
    (f.minEngagement > 0 ? 1 : 0) +
    (f.verifiedOnly ? 1 : 0) +
    (f.connectedOnly ? 1 : 0) +
    (f.followers[0] > 0 || f.followers[1] < 1000000 ? 1 : 0) +
    (f.budget[0] > 0 || f.budget[1] < BUDGET_MAX_USD ? 1 : 0)
  );
}

function Group({
  title,
  options,
  selected,
  onToggle,
  scroll,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  scroll?: boolean;
}) {
  const body = (
    <div className="space-y-2">
      {options.map((o) => (
        <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={selected.includes(o)} onCheckedChange={() => onToggle(o)} />
          <span className="text-muted-foreground">{o}</span>
        </label>
      ))}
    </div>
  );
  return (
    <div>
      <p className="mb-3 font-display text-sm font-semibold">{title}</p>
      {scroll ? <ScrollArea className="h-44 pr-3">{body}</ScrollArea> : body}
    </div>
  );
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}) {
  const toggle = (key: keyof Filters, value: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  // Location levels are derived from data, so any country/structure works.
  const uniq = (xs: (string | undefined)[]) =>
    [...new Set(xs.filter((x): x is string => !!x))].sort();
  const inCountry = allCreators.filter(
    (c) => !filters.countries.length || filters.countries.includes(c.geo.country),
  );
  const countryOptions = uniq(allCreators.map((c) => c.geo.country));
  const regionOptions = uniq(inCountry.map((c) => c.geo.region));
  const cityOptions = uniq(
    inCountry
      .filter(
        (c) => !filters.regions.length || (c.geo.region && filters.regions.includes(c.geo.region)),
      )
      .map((c) => c.geo.city),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 font-display text-sm font-semibold">
          <SlidersHorizontal className="size-4 text-primary" /> Filters
          {countActive(filters) > 0 && (
            <Badge className="rounded-full bg-primary/10 text-primary">
              {countActive(filters)}
            </Badge>
          )}
        </p>
        <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={onReset}>
          <X className="size-3.5" /> Reset
        </Button>
      </div>

      <Separator />
      <Group
        title="Category"
        options={CATEGORIES}
        selected={filters.categories}
        onToggle={(v) => toggle("categories", v)}
        scroll
      />
      <Separator />
      <div className="space-y-3">
        <p className="font-display text-sm font-semibold">Location</p>
        <LocationSearch value={filters.near} onSelect={(near) => onChange({ ...filters, near })} />
        {filters.near && (
          <div>
            <Slider
              value={[filters.radiusKm]}
              min={5}
              max={500}
              step={5}
              onValueChange={(v) => onChange({ ...filters, radiusKm: v[0] ?? 50 })}
            />
            <p className="mt-2 text-xs text-muted-foreground">Within {filters.radiusKm} km</p>
          </div>
        )}
      </div>
      <Group
        title="Country"
        options={countryOptions}
        selected={filters.countries}
        onToggle={(v) => toggle("countries", v)}
        scroll={countryOptions.length > 6}
      />
      {regionOptions.length > 0 && (
        <Group
          title="State / Province / Region"
          options={regionOptions}
          selected={filters.regions}
          onToggle={(v) => toggle("regions", v)}
          scroll={regionOptions.length > 6}
        />
      )}
      <Group
        title="City"
        options={cityOptions}
        selected={filters.cities}
        onToggle={(v) => toggle("cities", v)}
        scroll={cityOptions.length > 6}
      />
      <Separator />
      <Group
        title="Language"
        options={LANGUAGES}
        selected={filters.languages}
        onToggle={(v) => toggle("languages", v)}
      />
      <Separator />
      <Group
        title="Platform"
        options={PLATFORMS}
        selected={filters.platforms}
        onToggle={(v) => toggle("platforms", v)}
        scroll
      />

      <Separator />
      <div>
        <p className="mb-3 font-display text-sm font-semibold">Followers</p>
        <Slider
          value={filters.followers}
          min={0}
          max={1000000}
          step={10000}
          onValueChange={(v) => onChange({ ...filters, followers: [v[0] ?? 0, v[1] ?? 1000000] })}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {formatFollowers(filters.followers[0])} – {formatFollowers(filters.followers[1])}
          {filters.followers[1] >= 1000000 ? "+" : ""}
        </p>
      </div>

      <Separator />
      <div>
        <p className="mb-3 font-display text-sm font-semibold">Minimum engagement</p>
        <Slider
          value={[filters.minEngagement]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(v) => onChange({ ...filters, minEngagement: v[0] ?? 0 })}
        />
        <p className="mt-2 text-xs text-muted-foreground">{filters.minEngagement}% and above</p>
      </div>

      <Separator />
      <Group
        title="Services"
        options={SERVICES}
        selected={filters.services}
        onToggle={(v) => toggle("services", v)}
        scroll
      />

      <Separator />
      <div>
        <p className="mb-3 font-display text-sm font-semibold">Budget (starting price)</p>
        <Slider
          value={filters.budget}
          min={0}
          max={BUDGET_MAX_USD}
          step={50}
          onValueChange={(v) =>
            onChange({ ...filters, budget: [v[0] ?? 0, v[1] ?? BUDGET_MAX_USD] })
          }
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {formatMoney(filters.budget[0], "USD")} – {formatMoney(filters.budget[1], "USD")}
          {filters.budget[1] >= BUDGET_MAX_USD ? "+" : ""}
        </p>
      </div>

      <Separator />
      <div className="space-y-3">
        <p className="font-display text-sm font-semibold">Verification & availability</p>
        <div className="flex items-center justify-between">
          <Label htmlFor="verified" className="text-sm font-normal text-muted-foreground">
            Verified creators
          </Label>
          <Switch
            id="verified"
            checked={filters.verifiedOnly}
            onCheckedChange={(v) => onChange({ ...filters, verifiedOnly: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="connected" className="text-sm font-normal text-muted-foreground">
            Social connected
          </Label>
          <Switch
            id="connected"
            checked={filters.connectedOnly}
            onCheckedChange={(v) => onChange({ ...filters, connectedOnly: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="remote" className="text-sm font-normal text-muted-foreground">
            Available remotely
          </Label>
          <Switch
            id="remote"
            checked={filters.remoteOnly}
            onCheckedChange={(v) => onChange({ ...filters, remoteOnly: v })}
          />
        </div>
      </div>
    </div>
  );
}

export function FilterDrawer(props: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}) {
  const active = countActive(props.filters);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
          {active > 0 && (
            <Badge className="ml-1 rounded-full bg-primary text-primary-foreground">{active}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display">Filter creators</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(88vh-8rem)] px-5 py-4">
          <FilterPanel {...props} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
