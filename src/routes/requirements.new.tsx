import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Eye, MapPin, Send, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getDisplayCurrency } from "@/lib/currency";
import {
  createBusinessRequirement,
  getTaxonomyCategories,
  getTaxonomyLocations,
} from "@/lib/business-api";
import { useQuery } from "@tanstack/react-query";
import {
  CATEGORIES,
  LANGUAGES,
  LOCATIONS,
  PLATFORMS,
  SERVICES,
  currentBusiness,
  formatFollowers,
  formatMoney,
} from "@/data/mock";

export const Route = createFileRoute("/requirements/new")({
  head: () => ({
    meta: [
      { title: "Create Requirement — Influencers.com Business" },
      {
        name: "description",
        content:
          "Publish a creator brief with deliverables, budget, timelines and audience requirements.",
      },
      { property: "og:title", content: "Create Requirement — Influencers.com Business" },
      { property: "og:description", content: "Publish a creator brief in a few minutes." },
    ],
  }),
  component: NewRequirement,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5 lg:p-6">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <Separator className="my-4" />
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function NewRequirement() {
  const navigate = useNavigate();

  const { data: backendCategories = [] } = useQuery({
    queryKey: ["taxonomy-categories"],
    queryFn: getTaxonomyCategories,
  });

  const { data: backendLocations = [] } = useQuery({
    queryKey: ["taxonomy-locations"],
    queryFn: () => getTaxonomyLocations(),
  });

  const availableCategories = backendCategories.length > 0
    ? Array.from(new Set(backendCategories.map((c) => c.name)))
    : CATEGORIES;

  const availableLocations = backendLocations.length > 0
    ? backendLocations.map((l) => ({ name: l.name, fullPath: l.full_path }))
    : LOCATIONS.map((l) => ({ name: l, fullPath: l }));

  const [form, setForm] = useState({
    title: "Weekend brunch launch — Kochi food creators",
    description:
      "We are introducing a weekend brunch menu at our Panampilly Nagar outlet and want warm, appetising coverage from creators with a local Kochi dining audience.",
    category: "Food",
    location: "Ernakulam",
    language: "Malayalam",
    platforms: ["Instagram"] as string[],
    creatorsNeeded: 4,
    minFollowers: 25000,
    minEngagement: 4,
    deliverables: ["Reel", "Story"] as string[],
    budget: 120000,
    startDate: "2026-10-10",
    deadline: "2026-11-05",
    instructions: "Visit on Saturday or Sunday between 9am and 12pm. Tag @kadalspice.",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: "platforms" | "deliverables", v: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));

  const [submitting, setSubmitting] = useState(false);

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      await createBusinessRequirement({
        title: form.title,
        category: form.category,
        min_budget: form.budget,
        max_budget: form.budget,
        currency: "INR",
        creators_needed: form.creatorsNeeded,
        location_text: form.location,
        description: `${form.description}\n\nInstructions: ${form.instructions}\nDeliverables: ${form.deliverables.join(", ")}`,
      });
      toast.success("Requirement published to marketplace!");
      navigate({ to: "/requirements" });
    } catch (e: any) {
      toast.error("Failed to publish requirement: " + (e.response?.data?.detail || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Requirement"
        subtitle="Describe the collaboration and matching creators will apply."
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/requirements">Cancel</Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Section title="Basic information">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Requirement title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="locInput">Target Location</Label>
              <Input
                id="locInput"
                list="location-list"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Search or type location (e.g. Ernakulam, Kochi, Wayanad, Worldwide)..."
                className="mt-1.5 rounded-xl"
              />
              <datalist id="location-list">
                {availableLocations.map((loc, i) => (
                  <option key={`${loc.name}-${i}`} value={loc.name}>
                    {loc.fullPath || loc.name}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => set("language", v)}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Section>

          <Section title="Creator requirements">
            <div className="sm:col-span-2">
              <Label>Platforms</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <label
                    key={p}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={form.platforms.includes(p)}
                      onCheckedChange={() => toggle("platforms", p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="count">Number of influencers</Label>
              <Input
                id="count"
                type="number"
                value={form.creatorsNeeded}
                onChange={(e) => set("creatorsNeeded", Number(e.target.value))}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="minf">Minimum followers</Label>
              <Input
                id="minf"
                type="number"
                step={1000}
                value={form.minFollowers}
                onChange={(e) => set("minFollowers", Number(e.target.value))}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="mine">Minimum engagement (%)</Label>
              <Input
                id="mine"
                type="number"
                step={0.5}
                value={form.minEngagement}
                onChange={(e) => set("minEngagement", Number(e.target.value))}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </Section>

          <Section title="Campaign requirements">
            <div className="sm:col-span-2">
              <Label>Deliverables</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <label
                    key={s}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={form.deliverables.includes(s)}
                      onCheckedChange={() => toggle("deliverables", s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="budget">Budget ({getDisplayCurrency()})</Label>
              <Input
                id="budget"
                type="number"
                step={5000}
                value={form.budget}
                onChange={(e) => set("budget", Number(e.target.value))}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="end">Deadline</Label>
                <Input
                  id="end"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="inst">Additional instructions</Label>
              <Textarea
                id="inst"
                rows={3}
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </Section>
        </div>

        <div>
          <div className="card-elevated sticky top-24 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-sm font-medium text-muted-foreground">
              <Eye className="size-4" /> Live preview
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <img
                  src={currentBusiness.logo}
                  alt=""
                  className="size-11 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{currentBusiness.name}</p>
                  <p className="text-xs text-muted-foreground">{currentBusiness.type}</p>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {form.title || "Untitled requirement"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge className="rounded-full bg-primary/10 text-primary">{form.category}</Badge>
                <Badge variant="secondary" className="rounded-full">
                  {form.language}
                </Badge>
                {form.platforms.map((p) => (
                  <Badge key={p} variant="secondary" className="rounded-full">
                    {p}
                  </Badge>
                ))}
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" /> {form.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="size-4" /> {form.creatorsNeeded} creators ·{" "}
                  {formatFollowers(form.minFollowers)}+ followers · {form.minEngagement}%+
                  engagement
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4" /> {form.startDate} → {form.deadline}
                </div>
              </dl>

              <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
                <p className="font-display text-xl font-semibold">{formatMoney(form.budget, getDisplayCurrency())}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Deliverables: {form.deliverables.join(", ") || "—"}
                </p>
              </div>

              <Button
                className="mt-5 w-full rounded-xl"
                size="lg"
                disabled={submitting}
                onClick={handlePublish}
              >
                <Send className="size-4" /> {submitting ? "Publishing..." : "Publish Requirement"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
