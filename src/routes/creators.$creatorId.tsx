import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bookmark,
  Download,
  Globe,
  MapPin,
  MessageSquare,
  Play,
  Quote,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/business/AppShell";
import { CreatorCard } from "@/components/business/CreatorCard";
import { CollaborationDialog } from "@/components/business/CollaborationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { creatorById, formatFollowers, formatMoney } from "@/data/mock";
import { getCreatorDetail, getDiscoverCreators, mapBackendCreatorToCreator, toggleCreatorShortlist } from "@/lib/business-api";

export const Route = createFileRoute("/creators/$creatorId")({
  loader: async ({ params }) => {
    try {
      const data = await getCreatorDetail(params.creatorId);
      if (data && data.id) {
        return { creator: mapBackendCreatorToCreator(data) };
      }
    } catch (err) {
      console.warn("Failed to load creator from API:", err);
    }
    const creator = creatorById(params.creatorId);
    if (!creator) throw notFound();
    return { creator };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Creator not found" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.creator;
    const title = `${c.name} — ${c.category} creator in ${c.location}`;
    const description = `${c.bio} ${formatFollowers(c.followers)} followers · ${c.engagement}% engagement · from ${formatMoney(c.startingPrice, c.currency)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CreatorProfile,
});

function CreatorProfile() {
  const { creator } = Route.useLoaderData();
  const [collabOpen, setCollabOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ id?: string; name: string; price?: number; turnaround?: string } | null>(null);
  const [savingShortlist, setSavingShortlist] = useState(false);

  const handleOpenCollab = (service?: any) => {
    setSelectedService(service || null);
    setCollabOpen(true);
  };

  const handleToggleShortlist = async () => {
    setSavingShortlist(true);
    try {
      const res = await toggleCreatorShortlist(creator.id);
      toast.success(res.detail || (res.is_saved ? `${creator.name} added to shortlist` : `${creator.name} removed from shortlist`));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update shortlist.");
    } finally {
      setSavingShortlist(false);
    }
  };

  const { data: discoverData } = useQuery({
    queryKey: ["similar-creators", creator.category],
    queryFn: () => getDiscoverCreators(creator.category && (creator.category as string) !== "General" ? { category: creator.category } : {}),
  });

  const similar = (discoverData?.results || [])
    .filter((c: any) => String(c.id) !== creator.id)
    .slice(0, 3)
    .map(mapBackendCreatorToCreator);

  return (
    <AppShell>
      <div className="card-elevated overflow-hidden">
        <div className="relative h-40 lg:h-56">
          <img src={creator.cover} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>
        <div className="-mt-14 px-5 pb-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="size-28 rounded-3xl border-4 border-card object-cover shadow-lift"
              />
              <h1 className="mt-4 inline-flex items-center gap-2 font-display text-2xl font-semibold lg:text-3xl">
                {creator.name}
                {creator.verified && <BadgeCheck className="size-6 text-primary" />}
              </h1>
              <p className="text-sm text-muted-foreground">{creator.handle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <Badge className="rounded-full bg-primary/10 text-primary">{creator.category}</Badge>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-4" /> {creator.location}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Globe className="size-4" /> {creator.languages.join(", ")}
                </span>
                {creator.socialConnected && (
                  <Badge variant="secondary" className="rounded-full">
                    Social connected
                  </Badge>
                )}
              </div>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{creator.about}</p>
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Based in </span>
                <span className="font-medium">{creator.geo.city}, {creator.geo.country}</span>
                <span className="text-muted-foreground"> · Available for </span>
                <span className="font-medium">{creator.serviceAreas.join(", ")}</span>
                {creator.travel && <span className="text-muted-foreground"> · Open to travel</span>}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="lg"
                className="rounded-xl"
                onClick={() => handleOpenCollab()}
              >
                <MessageSquare className="size-4" /> Send Collaboration Request
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl"
                disabled={savingShortlist}
                onClick={handleToggleShortlist}
              >
                <Bookmark className="size-4" /> {savingShortlist ? "Saving..." : "Save to Shortlist"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {creator.socials.map((s: any) => (
              <div key={s.platform} className="rounded-2xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.platform}
                </p>
                <p className="mt-1 truncate text-sm">{s.handle}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-display font-semibold">
                    {formatFollowers(s.followers)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-success">
                    <TrendingUp className="size-3.5" /> {s.engagement}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="mt-6">
        <TabsList className="h-11 rounded-xl">
          <TabsTrigger value="portfolio" className="rounded-lg">
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-lg">
            Services
          </TabsTrigger>
          <TabsTrigger value="audience" className="rounded-lg">
            Audience
          </TabsTrigger>
          <TabsTrigger value="collabs" className="rounded-lg">
            Collaborations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-5">
          {creator.portfolio.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No portfolio media published yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">Portfolio items uploaded in Creator Hub will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {creator.portfolio.map((p: any) => (
                <figure
                  key={p.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={p.src || p.media_url}
                    alt={p.caption || p.title || "Portfolio"}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-card/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
                    {p.type || p.media_type || "Image"}
                  </span>
                  {p.type !== "Image" && (
                    <span className="absolute inset-0 grid place-items-center">
                      <Play className="size-8 text-card drop-shadow" />
                    </span>
                  )}
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-3 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                    {p.caption || p.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-5">
          {creator.services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No custom packages listed yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">Send a direct collaboration request above for custom pricing.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {creator.services.map((s: any) => (
                <div key={s.name || s.id} className="card-elevated hover-lift p-5">
                  <p className="font-display text-base font-semibold">{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Delivery in {s.turnaround || `${s.turnaround_days || 3} days`}</p>
                  <p className="mt-3 font-display text-xl font-semibold text-primary">
                    {formatMoney(s.price, creator.currency)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    onClick={() => handleOpenCollab(s)}
                  >
                    Request this service
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audience" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card-elevated p-5">
              <h3 className="font-display text-base font-semibold">Audience breakdown</h3>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Female</span>
                    <span className="font-medium">{creator.audience.female}%</span>
                  </div>
                  <Progress value={creator.audience.female} className="mt-2 h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Male</span>
                    <span className="font-medium">{creator.audience.male}%</span>
                  </div>
                  <Progress value={creator.audience.male} className="mt-2 h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audience authenticity</span>
                    <span className="font-medium">{creator.audience.authenticity}%</span>
                  </div>
                  <Progress value={creator.audience.authenticity} className="mt-2 h-1.5" />
                </div>
                <p className="text-muted-foreground">
                  Top age group:{" "}
                  <span className="font-medium text-foreground">{creator.audience.topAge}</span>
                </p>
                <p className="text-muted-foreground">
                  Top cities:{" "}
                  <span className="font-medium text-foreground">
                    {creator.audience.topCities.join(", ")}
                  </span>
                </p>
              </div>
            </div>

            <div className="card-elevated p-5">
              <h3 className="font-display text-base font-semibold">Media kit</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Full rate card, case studies and audience report.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => toast("Media kit download starts here")}
              >
                <Download className="size-4" /> {creator.mediaKit || "Download Media Kit (PDF)"}
              </Button>
              <h3 className="mt-7 font-display text-base font-semibold">Testimonials</h3>
              <div className="mt-3 space-y-3">
                {creator.testimonials.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No business reviews yet.</p>
                ) : (
                  creator.testimonials.map((t: any) => (
                    <blockquote key={t.business} className="rounded-2xl bg-secondary/60 p-4">
                      <Quote className="size-4 text-primary" />
                      <p className="mt-2 text-sm">{t.quote}</p>
                      <footer className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        {t.business}
                        <span className="inline-flex items-center gap-0.5 text-warning-foreground">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="size-3 fill-current" />
                          ))}
                        </span>
                      </footer>
                    </blockquote>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collabs" className="mt-5">
          {creator.collaborations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No public brand collaborations listed yet.</p>
            </div>
          ) : (
            <div className="card-elevated divide-y divide-border">
              {creator.collaborations.map((c: any) => (
                <div key={c.brand} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium">{c.brand}</p>
                    <p className="text-xs text-muted-foreground">{c.work}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{c.year}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <h2 className="mt-9 font-display text-lg font-semibold">Similar creators</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {similar.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
      </div>
      <div className="mt-6">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/discover">Back to discovery</Link>
        </Button>
      </div>

      <CollaborationDialog
        creator={creator}
        open={collabOpen}
        onOpenChange={setCollabOpen}
        service={selectedService}
      />
    </AppShell>
  );
}
